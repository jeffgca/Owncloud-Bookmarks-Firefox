var main_url;
var export_url = "index.php/apps/bookmarks/export.php";
var doc;
var favicon = "chrome://favicon/";
var config = "config.html";
var skip_bracks;

function getFavIcon(url) {
	return favicon + url;
}

function blue(event) {
	return setBgColor(event.target, true);
}

function white(event) {
	return setBgColor(event.target, false);
}

function setBgColor(obj, on) {
	while (obj.tagName.toLowerCase() != "tr") {
		obj = obj.parentNode;
	}
	var color = 'white';
	if (on) {
		color = 'lightblue';
	}
	obj.style.backgroundColor = color;
	return obj;
}

function addSeparator(tr) {
	if (tr != null) {
		var children = tr.childNodes;
		for (var i = 0; i < children.length; ++i) {
			node = children.item(i);
			if (node.tagName.toLowerCase() == "td") {
				if (node.className.length != 0) {
					node.className += " ";
				}
				node.className += "sep";
			}
		}
	}
}

function displayBookmarks() {
	main_url = localStorage["ocb_url"];
	skip_bracks = localStorage["ocb_bracks"] == '1';
	if (main_url == null || !main_url.length) {
		showURL(config);
	}
	var xhr = new XMLHttpRequest();
	xhr.open("GET", main_url + export_url, false);
	xhr.send();
	if (xhr.status == 200) {
		doc = document.createElement("div");
		doc.innerHTML = xhr.responseText;
		if (xhr.getResponseHeader("Content-Disposition") == null) {
			input = doc.getElementsByTagName("input");
			for (var i = 0; i < input.length; ++i) {
				if (input[i].id == 'password') {
					showURL(main_url);
				}
			}
			xhr.open("GET", main_url + export_url, false);
			xhr.send();
			if (xhr.status == 200) {
				doc.innerHTML = xhr.responseText;
			}
		}
		var div = document.getElementById("towrite");
		var table = document.createElement("table");
		div.appendChild(table);
		var tr = document.createElement("tr");
		table.appendChild(tr);
		var td = document.createElement("td");
		tr.appendChild(td);
		div = document.createElement("div");
		div.id = "leftmenu";
		td.appendChild(div);
		div.className = "inner";
		table = document.createElement("table");
		div.appendChild(table);
		table.className = "inner";

		var add = createAddMenuItem(table);
		var lastLabel = getLabels(table);
		var woLab = getBookmarksWOLabels(table);
		if (woLab != null) {
			addSeparator(lastLabel);
		}
		if (woLab != null || lastLabel != null) {
			addSeparator(add);
		}

		td = document.createElement("td");
		tr.appendChild(td);
		div = document.createElement("div");
		td.appendChild(div);
		div.className = "inner";
		div.id = "submenu";
	} else {
		showError(xhr.statusText);
	}
}

function localesort(str1, str2) {
	return str1.toLowerCase().localeCompare(str2.toLowerCase());
}

function getLabels(table) {
	var set = {};
	var nodes = doc.getElementsByTagName("a");
	for (var i = 0; i < nodes.length; ++i) {
		var label = nodes[i].getAttribute('tags');
		if (label.length) {
			if (skip_bracks) {
				label = label.substr(1, label.length - 2);
			}
			var labels = label.split(',');
			for (var j = 0; j < labels.length; ++j) {
				set[labels[j]] = true;
			}
		}
	}
	var array = [];
	for (key in set) {
		array.push(key);
	}
	array = array.sort(localesort);
	var linesep = false;
	var ret = null;
	for (var i = 0; i < array.length; ++i) {
		if (i == array.length - 1) {
			linesep = true;
		}
		ret = menuItem(table, array[i], mouseDownLabelText, array[i], ">", linesep, "folder.png");
	}
	return ret;
}

function getBookmarksWOLabels(table) {
	var nodes = doc.getElementsByTagName("a");
	var ret = null;
	for (var i = 0; i < nodes.length; ++i) {
		var label = nodes[i].getAttribute('tags');
		if (!label.length) {
			var title = nodes[i].text;
			var url = nodes[i].getAttribute("href");
			if (!url.length) {
				continue;
			}
			ret = menuItem(table, title, mouseDownBookmarkText, url, "", false, getFavIcon(url));
		}
	}
	return ret;
}

function bookmarkSelection(event, par) {
	if (!event || event.button != 1) {
		chrome.tabs.create({url:par});
		window.close();
	} else {
		chrome.tabs.create({url:par, active:false});
	}
}

function labelSelection(event, par) {
	obj = blue(event);
	var sm = document.getElementById("submenu");
	var lm = document.getElementById("leftmenu");
	var j = document.getElementById("subtable");
	if (j != null) {
		sm.removeChild(j);
	}
	sm.appendChild(createSubMenu(par));
	sm.style.position = 'relative';
	sm.style.top = '0px';	
	var offset = obj.offsetTop - lm.scrollTop;
	if (lm.offsetHeight < sm.offsetHeight + offset) {
		offset -= sm.offsetHeight + offset - lm.offsetHeight;
	}
	if (offset >= lm.offsetTop) {
		sm.style.top = '' + offset + 'px';
	}
}

function labelClicked(event, par) {
	var array = getBookmarksForLabel(par);

	for (var i = 0; i < array.length; ++i) {
		chrome.tabs.create({url: array[i].url});
	}
	window.close();
}

function pairSort(a, b) {
	return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
}

function getBookmarksForLabel(label) {
	var nodes = doc.getElementsByTagName("a");
	var array = [];

	for (var i = 0; i < nodes.length; ++i) {
		var lab = nodes[i].getAttribute('tags');
		if (skip_bracks) {
			lab = lab.substr(1, lab.length - 2);
		}
		var labels = lab.split(',');
		for (var j = 0; j < labels.length; ++j) {
			if (labels[j] == label) {
				var url = nodes[i].getAttribute("href");
				if (!url.length) {
					continue;
				}
				var pair = {};
				pair.url = url;
				var title = nodes[i].text;
				if (title.length) {
					pair.title = title;
				} else {
					pair.title = pair.url;
				}
				array.push(pair);
				break;
			}
		}
	}
	
	return array.sort(pairSort);
}

function createSubMenu(label) {
	var table = document.createElement("table");
	table.className = "inner";
	table.id = "subtable";

	var array = getBookmarksForLabel(label)

	for (var i = 0; i < array.length; ++i) {
		var tr = document.createElement("tr");
		tr.className = "inner";
		mouseDownBookmarkText(tr, array[i].url);
		tr.addEventListener("mouseout", white);

		var td = document.createElement("td");
		td.className = "img";
		var img = document.createElement("img");
		img.src = getFavIcon(array[i].url);
		td.appendChild(img);
		tr.appendChild(td);

		td = document.createElement("td");
		td.appendChild(document.createTextNode(array[i].title));
		tr.appendChild(td);

		table.appendChild(tr);
	}
	return table;
}

function mouseDownLabelText(item, par) {
	item.addEventListener("mouseover", function(event) {labelSelection(event, par)});
	item.addEventListener("click", function(event) {labelClicked(event, par)});
}

function mouseDownBookmarkText(item, par) {
	item.addEventListener("mouseover", blue);
	item.addEventListener("click", function(event) {bookmarkSelection(event, par)});
}

function createAddMenuItem(table) {
	return menuItem(table, "Add Bookmark", mouseDownAddText, null, "", true, getFavIcon(main_url));
}

function mouseDownAddText(item, par) {
	item.addEventListener("mouseover", blue);
	item.addEventListener("click", addBookmark);
}

function menuItem(table, title, mousefunc, mouseparam, separator, lineseparator, imgsrc) {
	var tr = document.createElement("tr");
	tr.className = "inner";
	table.appendChild(tr);
	var td = document.createElement("td");
	tr.appendChild(td);
	td.className = "img";
	var img = document.createElement("img");
	td.appendChild(img);
	img.src = imgsrc;
	td = document.createElement("td");
	tr.appendChild(td);
	td.appendChild(document.createTextNode(title));
	td = document.createElement("td");
	tr.appendChild(td);
	td.appendChild(document.createTextNode(separator));
	mousefunc(tr, mouseparam);
	tr.addEventListener("mouseout", white);
	return tr;
}

function addCallback(tab) {
	var dialog = window.open(main_url + 'index.php/apps/bookmarks/addBm.php?output=popup&url=' + encodeURIComponent(tab.url) + '&title=' + encodeURIComponent(tab.title), 'bkmk_popup', 'left=' + ((window.screenX || window.screenLeft) + 10) + ',top=' + ((window.screenY || window.screenTop) + 10) + ',height=400px,width=550px,resizable=1,alwaysRaised=1');
	window.setTimeout(function(){dialog.focus()}, 300);
	window.close();
}

function addBookmark() {
	chrome.tabs.getSelected(null, addCallback);
}

function cleanNode(node) {
	var children = node.childNodes;
	for (var i = 0; i < children.length; ++i) {
		node.removeChild(children[i]);
	}	
}

function showURL(url) {
	bookmarkSelection(null,  url);
}

function showError(text) {
	var div = document.getElementById("towrite");
	cleanNode(div);
	var par = document.createElement("p");
	div.appendChild(par);
	var textNode = document.createTextNode(text);
	par.appendChild(textNode);
}

document.addEventListener('DOMContentLoaded', displayBookmarks);

