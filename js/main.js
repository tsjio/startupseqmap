$(document).ready(function() {
	var legendState = true;
	$('#legend-toggle').click(function() {
		if (legendState === true) {
			$('#legend').animate({bottom: '-' + $('#legend').outerHeight()}, 600);
			$('#legend-toggle').text('Show Legend');
			legendState = false;
		} else if (legendState === false) {
			$('#legend').animate({bottom: '60px'}, 600);
	        $('#legend-toggle').text('Hide Legend');
	        legendState = true;
		}
	});
});