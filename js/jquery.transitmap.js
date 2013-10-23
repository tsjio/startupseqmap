$(document).ready(function() {
	
	// Canvas Variables
	var canvas = $('#canvas');
	var context = canvas.get(0).getContext('2d');
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();
	var lastX = canvas.width / 2;
	var lastY = canvas.height / 2;
	
	// Grid Variables
	var rows = canvas.attr('data-rows');
	var columns = canvas.attr('data-columns');
	var scale = canvas.attr('data-scale');
	var lineWidth = canvas.attr('data-line-width');
	var lineLabels = [];
	var pixelWidth = columns * scale;
    var pixelHeight = rows * scale;
	
	// Remove Loading Class
	$(canvas).removeClass('loading');
	
	// Clear Canvas
	function clearCanvas() {
	    context.clearRect(0, 0, canvasWidth, canvasHeight);  
	    context.beginPath();
	}
	
	// Draw Grid
	function drawGrid(canvas, scale) {
        context.fillStyle = "#000";
        context.beginPath();
        var counter = 0;
        for (var x = 0.5; x < pixelWidth; x += scale) {
            context.moveTo(x, 0);
            context.lineTo(x, pixelHeight);
        }
        context.moveTo(pixelWidth - 0.5, 0);
        context.lineTo(pixelWidth - 0.5, pixelHeight);
		
        counter = 0;
        for (var y = 0.5; y < pixelHeight; y += scale) {
            context.moveTo(0, y);
            context.lineTo(pixelWidth, y);
        }
        context.moveTo(0, pixelHeight - 0.5);
        context.lineTo(pixelWidth, pixelHeight - 0.5);
        context.strokeStyle = "#eee";
        context.lineWidth = 1;
        context.stroke();
        context.fill();
        context.closePath();
    }
	
	// Draw Line
	function drawLine(scale, rows, columns, color, width, nodes) {
	    context.beginPath();
	    context.moveTo(nodes[0].x * scale, nodes[0].y * scale);
	    var markers = [];
	    var lineNodes = [];
	    var node;
	    for (node = 0; node < nodes.length; node++) {
	        if (nodes[node].marker.indexOf('@') != 0) {
	            lineNodes[lineNodes.length] = nodes[node];
	        }
	    }
	    for (var lineNode = 0; lineNode < lineNodes.length; lineNode++) {
	        if (lineNode < (lineNodes.length - 1)) {
	            var nextNode = lineNodes[lineNode + 1];
	            var currNode = lineNodes[lineNode];
	
	            // Correction for edges so lines are not running off campus
	            var xCorr = 0;
	            var yCorr = 0;
	            if (nextNode.x == 0) xCorr = width / 2;
	            if (nextNode.x == columns) xCorr = -1 * width / 2;
	            if (nextNode.y == 0) yCorr = width / 2;
	            if (nextNode.y == rows) yCorr = -1 * width / 2;
	
	            var xVal = 0;
	            var yVal = 0;
	            var direction = '';
	
	            var xDiff = Math.round(Math.abs(currNode.x - nextNode.x));
	            var yDiff = Math.round(Math.abs(currNode.y - nextNode.y));
	            if ((xDiff == 0) || (yDiff == 0)) {
	                // Horizontal or Vertical
	                context.lineTo((nextNode.x * scale) + xCorr, (nextNode.y * scale) + yCorr);
	            } else if ((xDiff == 1) && (yDiff == 1)) {
	                // 90 degree turn
	                if (nextNode.direction != '') {
	                    direction = nextNode.direction.toLowerCase();
		                switch (direction) {
		                    case 's': xVal = 0; yVal = scale; break;
		                    case 'e': xVal = scale; yVal = 0; break;
		                    case 'w': xVal = -1 * scale; yVal = 0; break;
		                    default: xVal = 0; yVal = -1 * scale; break;
						}
						context.quadraticCurveTo((currNode.x * scale) + xVal, (currNode.y * scale) + yVal, (nextNode.x * scale) + xCorr, (nextNode.y * scale) + yCorr);
	                }
	            } else if (xDiff == yDiff) {
	                // Symmetric, angular with curves at both ends
	                if (nextNode.x < currNode.x) {
	                    if (nextNode.y < currNode.y) {
	                        direction = 'nw';
	                    } else {
	                    	direction = 'sw';
	                    }
	                } else {
	                    if (nextNode.y < currNode.y) {
	                    	direction = 'ne';
	                    } else {
	                    	direction = 'se';
	                    }
	                }
	                var dirVal = 1;
	                switch (direction) {
	                    case 'nw': xVal = -1 * (scale / 2); yVal = 1; dirVal = 1; break;
	                    case 'sw': xVal = -1 * (scale / 2); yVal = -1; dirVal = 1; break;
	                    case 'se': xVal = (scale / 2); yVal = -1; dirVal = -1; break;
	                    case 'ne': xVal = (scale / 2); yVal = 1; dirVal = -1; break;
	                }
	                context.bezierCurveTo(
	                        (currNode.x * scale) + xVal, (currNode.y * scale),
	                        (currNode.x * scale) + xVal, (currNode.y * scale),
	                        (nextNode.x + (dirVal * xDiff / 2)) * scale, (nextNode.y + (yVal * xDiff / 2)) * scale);
	                context.bezierCurveTo(
	                        (nextNode.x * scale) + (dirVal * scale / 2), (nextNode.y) * scale,
	                        (nextNode.x * scale) + (dirVal * scale / 2), (nextNode.y) * scale,
	                        nextNode.x * scale, nextNode.y * scale);
	            } else {
	                context.lineTo(nextNode.x * scale, nextNode.y * scale);
	            }
	        }
	    }
	
	    context.strokeStyle = color;
	    context.lineWidth = width;
	    context.stroke();
	    
	    for (node = 0; node < nodes.length; node++) {
	        drawMarker(canvas, context, scale, color, width, nodes[node]);
	    }
	}
	
	function drawMarker(canvas, context, scale, color, width, data) {
	    if (data.label == '') return;
	    if (data.marker == '') data.marker = 'station';
	
	    // Scale coordinates for rendering
	    var x = data.x * scale;
	    var y = data.y * scale;
	    
	    // Station colors
	    var foregroundColor = '#000000';
	    var backgroundColor = '#FFFFFF';
	
	    // Render station and interchange icons
	    context.strokeStyle = foregroundColor;
	    context.fillStyle = backgroundColor;
	    context.beginPath();
	    switch(data.marker.toLowerCase()) {
	        case 'interchange':
	        case '@interchange':
	            context.lineWidth = width;
	            if (data.markerInfo == '') {
	                context.arc(x, y, width * 0.7, 0, Math.PI * 2, true);
	            } else {
	                var mDir = data.markerInfo.substr(0,1).toLowerCase();
	                var mSize = parseInt(data.markerInfo.substr(1,10));
	                if (((mDir == 'v') || (mDir == 'h')) && (mSize > 1)) {
	                    if (mDir == 'v') {
	                        context.arc(x, y, width * 0.7,290 * Math.PI/180, 250 * Math.PI/180, false);
	                        context.arc(x, y-(width*mSize), width * 0.7,110 * Math.PI/180, 70 * Math.PI/180, false);
	                    } else {
	                        context.arc(x, y, width * 0.7,20 * Math.PI/180, 340 * Math.PI/180, false);
	                        context.arc(x+(width*mSize), y, width * 0.7,200 * Math.PI/180, 160 * Math.PI/180, false);
	                    }
	                } else {
	                    context.arc(x, y, width * 0.7, 0, Math.PI * 2, true);
	                }
	            }
	            break;
	        case 'station':
	        case '@station':
	            context.lineWidth = width/2;
	            context.arc(x, y, width/2, 0, Math.PI * 2, true);
	            break;
	    }
	    context.closePath();
	    context.stroke();
	    context.fill();
	
	    // Render text labels and hyperlinks
	    var textAlign = '';
	    var textMargin = '';
	    var offset = 20;
	    var topOffset = 0;
	    var centerOffset = -50;
	    switch(data.labelPos.toLowerCase()) {
	        case 'n':
	            textAlign = 'center';
	            textMargin = '0px 0px ' + offset + 'px ' + centerOffset + 'px';
	            topOffset = offset * 2;
	            break;
	        case 'w':
	            textAlign = 'right';
	            textMargin = '0px ' + offset + 'px 0 -' + (100 + offset) + 'px';
	            topOffset = offset;
	            break;
	        case 'e':
	            textAlign = 'left';
	            textMargin = '0px 0px 0px ' + offset + 'px';
	            topOffset = offset;
	            break;
	        case 's':
	            textAlign = 'center';
	            textMargin = offset + 'px 0px 0px ' + centerOffset + 'px';
	            break;
	    }
	    var style =
	    	'text-align:' + textAlign + '; ' +
	    	'margin:' + textMargin + '; ' +
	    	'top:' + (y + canvas.offset().top - (topOffset > 0 ? topOffset : 0)) + 'px; ' + 
	    	'left:' + (x + canvas.offset().left) + 'px; ';
	    var markerText = '<a class="text" style="' + style + '" rel="tooltip" title="' + data.label.replace(/\\n/g,'<br />') + '" href="' + data.link + '">' + data.label.replace(/\\n/g,'<br />') + '</span>';
		$(markerText).prependTo(document.body);
	}

	function drawPoints() {
	    $('ul').each(function(index) {
	    	var ul = $(this);
	    	var color = $(ul).attr('data-color');
	    	var lineLabel = $(ul).attr('data-label');
	    	$('#legend').append('<div class="legend-label"><span class="legend-line" style="height:' + lineWidth + 'px; background-color:' + color + '"></span>' + lineLabel + '</div>');
	    	var shiftX = 0.00;
	        var shiftY = 0.00;
	    	var nodes = [];
	    	// List Children
	    	$(ul).children('li').each(function() {
				var coords = $(this).attr('data-coords');
				var dir = $(this).attr('data-direction');
				if (dir === undefined) dir = '';
				
				var labelPos = $(this).attr('data-label-position');
				if (labelPos === undefined) labelPos = 's';
				
				var marker = $(this).attr('data-marker');
				if (marker == undefined) marker = '';
				
				var markerInfo = $(this).attr('data-marker-info');
				if (markerInfo == undefined) markerInfo = '';
				
				var anchor = $(this).children('a:first-child');
				var label = $(this).text();
				if (label === undefined) label = '';
				
				var link = '';
				var title = '';
				
				if (anchor != undefined) {
					link = $(anchor).attr('href');
					if (link === undefined) link = '';
					title = $(anchor).attr('title');
					if (title === undefined) title = '';
				}
				
				var x = '';
				var y = '';
				if (coords.indexOf(',') > -1) {
					x = Number(coords.split(',')[0]) + (marker.indexOf('interchange') > -1 ? 0 : shiftX);
					y = Number(coords.split(',')[1]) + (marker.indexOf('interchange') > -1 ? 0 : shiftY);
				}
				nodes[nodes.length] = { x: x, y:y, direction: dir, marker: marker, markerInfo: markerInfo, link: link, title: title, label: label, labelPos: labelPos};
			});
			if (nodes.length > 0) {
	            drawLine(scale, rows, columns, color, lineWidth, nodes);
			}
	        $(ul).remove();
		});
	}
	drawPoints();
});




