$(document).ready(function() {
	$('[rel="tooltip"]').hover(function() {
		// Hover over
		var title = $(this).attr('title');
		$(this).data('tipText', title).removeAttr('title');
		$('<p class="tooltip"></p>')
		.text(title)
		.appendTo('body')
		.fadeIn();
	}, function() {
		// Hover out
		$(this).attr('title', $(this).data('tipText'));
		$('.tooltip').remove();
	}).mousemove(function(e) {
		var mousex = e.pageX;
		var mousey = e.pageY;
		$('.tooltip')
		.css({ top: mousey, left: mousex })
	});
});