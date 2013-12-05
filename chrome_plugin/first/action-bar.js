console.log("Loaded content script with jQuery for " + window.location.href);
console.log("DOM ready");
if (window.location.href.search("#!spm=1") == -1) {
	window.location.href = window.location.href + "#!spm=1"
	//location.reload();
}
var actionBar = '<div class="action-bar"><div class="action"><p>Action Bar</p><button>Action</button></div></div>';
$(document.body).append(actionBar);
$(".action button").click(function() {
	window.location.href = "https://www.google.com.hk";
});
setTimeout(function() {
	$(".action-bar").addClass('shown');
}, 500);
