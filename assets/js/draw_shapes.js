// Algorithms for drawing

// Final shapes

exports.getLinePoints = function (px1, py1, px2, py2) {
    var temp
    
    // Switch leftmost point?
    let x1 = px1
    let y1 = py1
    let x2 = px2
    let y2 = py2
    if (x1 > x2) {
        x1 = px2
        x2 = px1
        y1 = py2
        y2 = py1
    }

    // Deltas
    var dx = x2 - x1
    var dy = y2 - y1
    
    // Adjustments
    var mirror_cuadrant = false
    var mirror_octant = false
    if (dy > 0) {
        if (Math.abs(dy) > Math.abs(dx)) {
            mirror_octant = true
        }
    } 
    else if (dy < 0) {
        if (Math.abs(dy) < Math.abs(dx)) {
            mirror_cuadrant = true
        } else {
            mirror_octant = true
            mirror_cuadrant = true
        }
    }

    var current_x1 = x1
    var current_y1 = y1

    if (mirror_cuadrant) {
        dy *= -1
        current_y1 *= -1
    }
    if (mirror_octant) {
        temp = dx
        dx = dy
        dy = temp
        temp = current_x1
        current_x1 = current_y1
        current_y1 = temp
    }

    // Bresenham / get points
    var cuadrant_factor = 1
    var res = []
    var c1 = 2 * dy
    var c2 = c1 - (2 * dx)
    var param = c1 - dx
    for (let i = 0; i < dx; i++) {
        if (param < 0){
            param += c1
            current_x1 += 1
        } else {
            param += c2
            current_x1 += 1
            current_y1 += 1
        }

        // Revert adjustment
        if (mirror_cuadrant) {
            cuadrant_factor = -1
        }
        if (mirror_octant) {
            res.push({x: current_y1, y: current_x1 * cuadrant_factor})
        } else {
            res.push({x: current_x1, y: current_y1 * cuadrant_factor})
        }
    }
    return res;
}


exports.getRectanglePoints = function(x1, y1, x2, y2) {
    var res = [];
    if (x1 > x2) {
        temp = x2
        x2 = x1
        x1 = temp
    }
    if (y1 > y2) {
        temp = y2
        y2 = y1
        y1 = temp
    }
    for (let x = x1; x <= x2; x++) {
      res.push({x: x, y: y1});
      res.push({x: x, y: y2});
    }
    for (let y = y1 + 1; y < y2; y++) {
      res.push({x: x1, y: y});
      res.push({x: x2, y: y});
    }
    return res;
}

exports.getCirclePoints = function(x1, y1, x2, y2) {
    const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const centerX = Math.min(x1, x2) + radius;
    const centerY = Math.min(y1, y2) + radius;
    const points = [];
  
    let x = 0;
    let y = radius;
    let d = 1 - radius;
  
    while (x <= y) {
      points.push({x: centerX + x, y: centerY + y});
      points.push({x: centerX + y, y: centerY + x});
      points.push({x: centerX - y, y: centerY + x});
      points.push({x: centerX - x, y: centerY + y});
      points.push({x: centerX - x, y: centerY - y});
      points.push({x: centerX - y, y: centerY - x});
      points.push({x: centerX + y, y: centerY - x});
      points.push({x: centerX + x, y: centerY - y});
  
      if (d < 0) {
        d += 2 * x + 3;
      } else {
        d += 2 * (x - y) + 5;
        y--;
      }
      x++;
    }
  
    return points;
  }
 

// Preview shapes

exports.drawLine = function(canvas, x1, y1, x2, y2) {
    // Clear preview canvas
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Draw preview line
    ctx.strokeStyle = "grey";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}  

exports.drawRectangle = function(canvas, x1, y1, x2, y2) {
    // Clear preview canvas
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Draw preview rectangle
    ctx.strokeStyle = "grey";
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
}

exports.drawCircle = function(canvas, x1, y1, x2, y2) {
    // Clear preview canvas
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Calculate circle parameters
    const radius = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    const centerX = x1 + (x2-x1)/2;
    const centerY = y1 + (y2-y1)/2;
  
    // Draw preview circle
    ctx.strokeStyle = "grey";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2*Math.PI);
    ctx.stroke();
  }