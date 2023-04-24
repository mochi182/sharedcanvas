// shared_canvas.js

export function setupSharedCanvas(channel) {
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
        channel.push("new_msg", { body: mouse_position });
    }

    // Listen for draw events and update the canvas accordingly
    channel.on("new_msg", payload => {
        const mouse_position = payload.body;
        redraw_stack.push(mouse_position);
        redraw();
    });

}
