// shared_canvas.js

export function setupSharedCanvas(channel) {
    // Canvas element
    var canvas = document.getElementById("canvas");

    // Get context object
    var ctx = canvas.getContext('2d');

    // Create an empty stack to store the elements that need to be redrawn
    var redrawStack = [];

    // Redraw the elements in the redraw stack
    function redraw() {
        // Clear the canvas
        clear_canvas();
        // Redraw all the elements in the redraw stack
        for (let i = 0; i < redrawStack.length; i++) {
            let point = redrawStack[i];
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

    // Add canvas event listener to push a new canvasEvent to the channel
    canvas.addEventListener('click', event => {
        // Add draw_point function to the redraw stack
        redrawStack.push({ x: event.offsetX, y: event.offsetY });
        channel.push("new_msg", { body: JSON.stringify(redrawStack) })
    });

    // Listen for canvasEvent and redraw the canvas
    channel.on("new_msg", payload => {
        redrawStack = JSON.parse(payload.body);
        redraw();
    });
}
