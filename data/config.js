function start() {
	var input = document.getElementById("url");
	var url = localStorage["ocb_url"];
	if (url != null) {
		input.value = url;
	}
	input = document.getElementById("skip");
	input.checked = localStorage["ocb_bracks"] == '1'
	var form = document.getElementById("form");
	form.addEventListener("submit", handleClick);
}

function handleClick(event) {
	var input = document.getElementById("url");
	var url = input.value;
	if (url[url.length - 1] != '/') {
		url = url + "/";
	}
	localStorage["ocb_url"] = url;
	input = document.getElementById("skip");
	if (input.checked) {
		localStorage["ocb_bracks"] = '1';
	} else {
		localStorage["ocb_bracks"] = '0';
	}
	event.preventDefault();
}

document.addEventListener('DOMContentLoaded', start);

