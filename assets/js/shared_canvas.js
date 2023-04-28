// shared_canvas.js

export function setupSharedCanvas(channel) {

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
            draw_point(point.x, point.y);
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
        // Send mouse position
        const mouse_position = { x: event.offsetX, y: event.offsetY };
        channel.push("draw", { body: mouse_position });
    }

    // Listen for draw events and update the canvas accordingly
    channel.on("draw", payload => {
        const mouse_position = payload.body;
        redraw_stack.push(mouse_position);
        redraw();
    });

    testButton = document.querySelector("#testButton");
    testButton.addEventListener("click", () => {
        channel.push("test", {});
    });

    // Listen for draw events and update the canvas accordingly
    channel.on("test", payload => {
        console.log(payload.body);
    });

    // ---------- Other events ----------

    let chatInput = document.querySelector("#chat-input")
    let messagesContainer = document.querySelector("#messages")

    // New message event:
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

}
