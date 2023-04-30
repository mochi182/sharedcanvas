// shared_canvas.js

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

    // Add canvas event listeners to push new mouse positions to the channel
    canvas.addEventListener('mousedown', event => {
        // Start tracking mouse position
        canvas.addEventListener('mousemove', mousemove);
    });

    canvas.addEventListener('mouseup', event => {
        // Stop tracking mouse position
        canvas.removeEventListener('mousemove', mousemove);
    });

    function mousemove(event) {
        // Get selected color
        const colorSelect = document.querySelector("#color-select");
        const selected_color = colorSelect.value;

        // Send mouse position
        const drawn_pixel = { x: event.offsetX, y: event.offsetY, color: selected_color };
        channel.push("draw", { body: drawn_pixel });
    }

    // Listen for draw events and update the canvas accordingly
    channel.on("draw", payload => {
        const drawn_pixel = payload.body;
        redraw_stack.push(drawn_pixel);
        redraw();
    });

    channel.on("sync_drawing", payload => {
        console.log(payload.body)
        redraw_stack = flatten_data(payload.body)
        console.log(redraw_stack);
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
    testButton = document.querySelector("#testButton");
    testButton.addEventListener("click", () => {
        channel.push("test", {});
    });

    // Listen for draw events and update the canvas accordingly
    channel.on("test", payload => {
        console.log(payload.body);
    });

    // New message event
    let chatInput = document.querySelector("#chat-input")
    let messagesContainer = document.querySelector("#messages")

    chatInput.addEventListener("keypress", event => {
        if (event.key === 'Enter') {
            channel.push("new_msg", { body: chatInput.value })
            chatInput.value = ""
        }
    })

    channel.on("new_msg", payload => {
        let messageItem = document.createElement("p")
        const now = new Date();
        const dateStr = `(${now.getDate()}/${('0' + (now.getMonth() + 1)).slice(-2)}/${now.getFullYear()})`;
        const timeStr = `${now.getHours()}:${('0' + now.getMinutes()).slice(-2)}:${('0' + now.getSeconds()).slice(-2)}`;
        messageItem.innerText = `${dateStr + ' ' + timeStr}: ${payload.body}`;
        messagesContainer.appendChild(messageItem)
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
    });

    // Listen for disconnect event and redirect to lobby
    channel.on("disconnect", payload => {
        alert("You have been disconnected");
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
    });


}
