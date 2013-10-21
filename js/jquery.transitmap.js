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
	
	// Resize canvas to full screen
	function resizeCanvas() {
	   /*
 canvas.attr('width', $(window).get(0).innerWidth);
	    canvas.attr('height', $(window).get(0).innerHeight);
	    canvasWidth = canvas.width();
	    canvasHeight = canvas.height();
*/
	}
	resizeCanvas();
	$(window).resize(resizeCanvas);
	
	
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
	    	//console.log('Line Label: ' + lineLabel + ' Color: ' + color);
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
				//console.log('coords: ' + coords + ' labelPos: ' + labelPos + ' marker: ' + marker + ' markerInfo: ' + markerInfo);
				nodes[nodes.length] = { x: x, y:y, direction: dir, marker: marker, markerInfo: markerInfo, link: link, title: title, label: label, labelPos: labelPos};
			});
			if (nodes.length > 0) {
	            drawLine(scale, rows, columns, color, lineWidth, nodes);
			}
	        $(ul).remove();
		});
	}
	drawPoints();
	
	
	/*
// Redraw Canvas Context
	function redraw(){
		// Clear the entire canvas
		//var p1 = context.transformedPoint(0,0);
		//var p2 = context.transformedPoint(canvas.width,canvas.height);
		//context.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
		clearCanvas();
		// Alternatively:
		context.save();
		context.setTransform(1,0,0,1,0,0);
		context.clearRect(0,0,canvas.width,canvas.height);
		context.restore();
	}
	
	// Track Transformations
	// Adds context.getTransform() - returns an SVGMatrix
	// Adds context.transformedPoint(x,y) - returns an SVGPoint
	function trackTransforms(context){
		var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
		var xform = svg.createSVGMatrix();
		context.getTransform = function(){ return xform; };
		
		var savedTransforms = [];
		var save = context.save;
		context.save = function() {
			savedTransforms.push(xform.translate(0,0));
			return save.call(context);
		};
		var restore = context.restore;
		context.restore = function() {
			xform = savedTransforms.pop();
			return restore.call(context);
		};
	
		var scale = context.scale;
		context.scale = function(sx,sy) {
			xform = xform.scaleNonUniform(sx,sy);
			return scale.call(context,sx,sy);
		};
		var rotate = context.rotate;
		context.rotate = function(radians) {
			xform = xform.rotate(radians*180/Math.PI);
			return rotate.call(context,radians);
		};
		var translate = context.translate;
		context.translate = function(dx,dy) {
			xform = xform.translate(dx,dy);
			return translate.call(context,dx,dy);
		};
		var transform = context.transform;
		context.transform = function(a,b,c,d,e,f) {
			var m2 = svg.createSVGMatrix();
			m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
			xform = xform.multiply(m2);
			return transform.call(context,a,b,c,d,e,f);
		};
		var setTransform = context.setTransform;
		context.setTransform = function(a,b,c,d,e,f) {
			xform.a = a;
			xform.b = b;
			xform.c = c;
			xform.d = d;
			xform.e = e;
			xform.f = f;
			return setTransform.call(context,a,b,c,d,e,f);
		};
		var pt  = svg.createSVGPoint();
		context.transformedPoint = function(x,y) {
			pt.x=x; pt.y=y;
			return pt.matrixTransform(xform.inverse());
		}
	}
	trackTransforms(context);
	
	// Mouse Drag Pan Event
	var dragStart,dragged;
	canvas.get(0).addEventListener('mousedown',function(evt){
		document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
		lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
		lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
		dragStart = context.transformedPoint(lastX,lastY);
		dragged = false;
	},false);
	canvas.get(0).addEventListener('mousemove',function(evt){
		lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
		lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
		dragged = true;
		if (dragStart){
			var pt = context.transformedPoint(lastX,lastY);
			context.translate(pt.x-dragStart.x,pt.y-dragStart.y);
			redraw();
		}
	},false);
	canvas.get(0).addEventListener('mouseup',function(evt){
		dragStart = null;
		if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
	},false);
	

	// Zoom Event
	var scaleFactor = 1.1;
	var zoom = function(clicks) {
		var pt = context.transformedPoint(lastX,lastY);
		context.translate(pt.x,pt.y);
		var factor = Math.pow(scaleFactor,clicks);
		context.scale(factor,factor);
		context.translate(-pt.x,-pt.y);
		//console.log(context);
		redraw();
	}
	
	// Scroll Zoom Event
	var handleScroll = function(evt){
		var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
		if (delta){ 
			zoom(delta);
		}
		return evt.preventDefault() && false;
	};
	canvas.get(0).addEventListener('DOMMouseScroll', handleScroll, false);
	canvas.get(0).addEventListener('mousewheel', handleScroll, false);
*/
	
});




