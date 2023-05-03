// shared_canvas.js

var shapes = require('./draw_shapes');

export function setupSharedCanvas(channel, user_id, csrf_token) {

    // ---------- Drawing events ----------

    // Canvas element
    var canvas = document.getElementById("canvas");

    // Get context object
    var ctx = canvas.getContext('2d');

    // Create an empty stack to store the elements that need to be redrawn
    var redraw_stack = [];

    // Redraw the elements in the redraw stack
    function redraw() {
        // Clear the canvas
        clear_canvas();
        // Redraw all the elements in the redraw stack
        for (let i = 0; i < redraw_stack.length; i++) {
            let point = redraw_stack[i];
            // Call the draw_point function with the x and y values of the point object
            draw_point(point.x, point.y, point.color);
        }
    }

    // Clear canvas
    function clear_canvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Function to draw a point on the canvas
    function draw_point(x, y, color = "black") {
        ctx.fillStyle = color;
        ctx.fillRect(x - 2, y - 2, 4, 4);
    }

    var currentPress = {}
    var previewCanvas = document.getElementById("previewCanvas");
    var previewCtx = previewCanvas.getContext("2d");

    // Add canvas event listeners to push new mouse positions to the channel
    canvas.addEventListener('mousedown', e => {
        // Set selected color
        currentPress["selectedColor"] = document.getElementById("colorPicker").value;

        // Set selected tool
        currentPress["selectedTool"] = document.querySelector(".selectedTool").id;

        // If drawing shapes, set starting point
        if (!(currentPress.selectedTool === "brushButton")) {
            currentPress["startX"] = e.offsetX;
            currentPress["startY"] = e.offsetY;
        } 

        // Track mouse position
        canvas.addEventListener('mousemove', mouseTracker);
    });

    canvas.addEventListener('mouseup', event => {
        // Stop tracking mouse position
        canvas.removeEventListener('mousemove', mouseTracker);

        // Get selected tool
        const selectedTool = currentPress["selectedTool"];

        // If drawing shapes...
        if (!(selectedTool === "brushButton")) {
            // Clear preview
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

            // Get shape data (points)
            const params = getParams();
            var points

            if (selectedTool === "lineButton") {
                points = shapes.getLinePoints(...params);
            }
            else if (selectedTool === "rectangleButton") {
                points = shapes.getRectanglePoints(...params);
            }
            else if (selectedTool === "circleButton") {
                points = shapes.getCirclePoints(...params);
            }

            // Send points to room channel
            sendPoints(points);
        }

        // Clean currentPress
        currentPress = {}
    });

    function getParams(){
        return [
            currentPress.startX,
            currentPress.startY,
            currentPress.endX,
            currentPress.endY
        ]
    }
    
    function sendPoints(points) {
        for (let i = 0; i < points.length; i++) {
            const pixel = { 
                x: points[i].x,
                y: points[i].y,
                color: currentPress.selectedColor
            };
            channel.push("draw", { body: pixel });
        }
    }

    function mouseTracker(e) {
        // On mouse move...
        currentPress["endX"] = e.offsetX
        currentPress["endY"] = e.offsetY

        // Draw on mouse movement
        if (currentPress.selectedTool === "brushButton") {
            sendPoints([{
                x: currentPress.endX,
                y: currentPress.endY
            }]);
        } else {
            drawShapePreview();
        }
    } 

    function drawShapePreview() {
        // Get params
        const params = getParams()
        
        // Get selected tool
        const selectedTool = currentPress["selectedTool"]

        // Draw preview
        if (selectedTool === "lineButton") {
            shapes.drawLine(previewCanvas, ...params);
        }
        else if (selectedTool === "rectangleButton") {
            shapes.drawRectangle(previewCanvas, ...params);
        }
        else if (selectedTool === "circleButton") {
            shapes.drawCircle(previewCanvas, ...params);
        }

    }

    // ---------- Channel events ----------

    // Listen for draw events and update the canvas accordingly
    channel.on("draw", payload => {
        const drawn_pixel = payload.body;
        redraw_stack.push(drawn_pixel);
        redraw();
    });

    channel.on("sync_drawing", payload => {
        redraw_stack = flatten_data(payload.body)
        redraw();
    });

    function flatten_data(data) {
        const result = [];
        let temp = {};
      
        for (let i = 0; i < data.length; i++) {
          if (i % 2 === 0) {
            temp = { x: null, y: null, color: null };
            temp.x = parseInt(data[i].match(/({x: )(\d+)(, y: )(\d+)/)[2]);
            temp.y = parseInt(data[i].match(/({x: )(\d+)(, y: )(\d+)/)[4]);
          } else {
            temp.color = data[i];
            result.push(temp);
          }
        }
      
        return result;
      }
      

    // ---------- Other events ----------

    // Test
    /* testButton = document.querySelector("#testButton");
    testButton.addEventListener("click", () => {
        channel.push("test", {});
    }); */

    // Listen for draw events and update the canvas accordingly
    channel.on("test", payload => {
        console.log(payload.body);
    });
    
    // New message event
    let chatInput = document.querySelector("#chat-input")
    chatInput.addEventListener("keypress", event => {
        if (event.key === 'Enter') {
            channel.push("new_msg", { body: chatInput.value })
            chatInput.value = ""
        }
    })

    channel.on("new_msg", payload => {
        let messagesContainer = document.querySelector("#messages")
        let messageItem = document.createElement("p")
        messageItem.classList.add("messageItem");
        const now = new Date();
        const dateStr = `(${now.getDate()}/${('0' + (now.getMonth() + 1)).slice(-2)}/${now.getFullYear()})`;
        const hour = now.getHours() % 12 || 12;
        const period = now.getHours() >= 12 ? 'pm' : 'am';
        const timeStr = `${hour}:${('0' + now.getMinutes()).slice(-2)}:${('0' + now.getSeconds()).slice(-2)} ${period}`;
        messageItem.innerText = `${dateStr + ' ' + timeStr}: ${payload.body}`;
        messagesContainer.insertBefore(messageItem, messagesContainer.firstChild);
    })

    // After join event
    window.addEventListener("load", () => {
        channel.push("after_join", {})
    })

    // Update users list
    channel.on("update_user_list", payload => {
        const userList = document.querySelector("#user-list");
        const users = payload.body;

        let html = "<ul>";
        users.forEach(user => {
            html += `<li>${user}</li>`;
        });
        html += "</ul>";

        userList.innerHTML = html;

        // Reset mouse positions:
        mousePositions = {};
        drawAllCursors();
    });

    // Listen for disconnect event and redirect to lobby
    channel.on("disconnect", payload => {
        alert("You have been disconnected.");
        disconnectFromRoom();
    });

    // Disconnect when clicking home
    document.getElementById("header-link").addEventListener("click", event => {
        event.preventDefault();
        if (confirm("Are you sure you want to disconnect?")) {
            disconnectFromRoom();
        }
    });

    function disconnectFromRoom() {
        // Sends user to /lobby with user_id and csrf_token
        const form = document.createElement("form");
        form.style.display = "none";
        form.method = "POST";
        form.action = "/lobby";
        const userIdInput = document.createElement("input");
        userIdInput.type = "hidden";
        userIdInput.name = "user_id";
        userIdInput.value = user_id;
        const csrfTokenInput = document.createElement("input");
        csrfTokenInput.type = "hidden";
        csrfTokenInput.name = "_csrf_token";
        csrfTokenInput.value = csrf_token;
        form.appendChild(userIdInput);
        form.appendChild(csrfTokenInput);
        document.body.appendChild(form);
        form.submit();
    }

    // Mouse movement event
    document.addEventListener("mousemove", event => {
        const { offsetX, offsetY } = event;
        channel.push("mouse_movement", { body: { x: offsetX, y: offsetY } });
    });

    // Receive mouse movements
    channel.on("mouse_movement", payload => {
        const { user_id, x, y } = payload.body;
        mousePositions[user_id] = { "x": x, "y": y };
        drawAllCursors();
    });

    var mouseCanvas = document.getElementById("mouseCanvas");

    var mousePositions = {}

    function drawCursor(context, x, y, user_id){
        const offset = 8;
        context.fillStyle = "grey";
        context.beginPath();
        // x
        context.moveTo(x - offset, y);
        context.lineTo(x - 1, y);
        context.moveTo(x + 1, y);
        context.lineTo(x + offset, y);
        // y
        context.moveTo(x, y - offset);
        context.lineTo(x, y - 1);
        context.moveTo(x, y + 1);
        context.lineTo(x, y + offset);
        context.stroke();
        // User id
        context.textAlign = "center";
        context.font = "12px Arial";
        context.fillText(user_id, x, y + (2 * offset) + 3);
    }

    function drawAllCursors() {
        // Draw a circle filling the canvas.
        var mouseCanvasCtx = mouseCanvas.getContext("2d");
        mouseCanvasCtx.clearRect(0, 0, mouseCanvas.width, mouseCanvas.height);
        for (const [key, value] of Object.entries(mousePositions)) {
            if (user_id != key) {
                drawCursor(mouseCanvasCtx, value.x, value.y, key)
            }
        }
    }

    function resize() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        if (mouseCanvas.width != width ||
            mouseCanvas.height != height) {
            mouseCanvas.width = width;
            mouseCanvas.height = height;
        }
    }

    // update on any window size change.
    window.addEventListener("resize", () => {
        resize();
        drawAllCursors();
    });

    // first draw
    resize();
    drawAllCursors();

}
