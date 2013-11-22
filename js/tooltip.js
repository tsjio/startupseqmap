$(document).ready(function() {
	$('.text').hover(function() {
		// Hover over
		var title = $(this).attr('title');
    var icon = $(this).data("icon");
    if(!icon) icon = "https://pbs.twimg.com/profile_images/3726915169/62c95335f08ab312d01bc73038a50635.png";
		$(this).data('tipText', title).removeAttr('title');
		$('<p class="tooltip"></p>')
		.html('<img class="node-icon" src="' + icon +'" />')
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