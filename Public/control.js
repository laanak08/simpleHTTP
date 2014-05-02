var data = {}, index = {}, autoCompleteTags = {};
$(function(){
	hide_show_by_id('hide','searchResultsSection');
	// populate_page_from_data();
	populate_page_ajax();

	// TODO: un-jQuery
	// $("#suggest").hide();
	$(".ui-helper-hidden-accessible").hide();

	var toggles = document.getElementsByClassName("toggleSwitch");

	for(var i = 0, numToggles = toggles.length; i < numToggles; ++i){
		toggles[i].onclick = toggle_plus_minus;
		fire_click_event(toggles[i]);
	}
	// .addClass("ui-icon ui-icon-triangle-1-e");
	
	
	// TODO: un-jQuery
	$("#query").autocomplete({
		source: Object.keys(autoCompleteTags),
		// position: { collision: "fit", within: $("#suggest") }, //of: $("#suggest") },
		// appendTo : "#suggest",
		minLength: 2
	});

	document.getElementById("query").onkeyup = function(event){
		search($(this).val());
	};


});

function fire_click_event(elem){
	if(document.dispatchEvent){
		elem.dispatchEvent(new MouseEvent('click'));
	}else if(document.fireEvent){
		elem.fireEvent('onclick');
	}
}

// TODO: un-jQuery
function toggle_plus_minus(e){
	e.preventDefault();
	e.stopPropagation();

	var classList = $(this).attr('class').split(/\s+/);
	var classListStr = "";
	$.each( classList, function(index, item){
		classListStr += " " + item;
	});
	
	var closed = /ui-icon-triangle-1-e/gi;
	var open = /ui-icon-triangle-1-se/gi;
	if(classListStr.match(closed)){
		$(this).removeClass("ui-icon-triangle-1-e").addClass("ui-icon-triangle-1-se");
	} else if(classListStr.match(open)) {
		$(this).removeClass("ui-icon-triangle-1-se").addClass("ui-icon-triangle-1-e");
	}

	var dataID = "#"+$(this).parent().parent().attr("id") + "data";
	$(dataID).slideToggle();
}

function add_to_index(svc,host,keyForIndex){
	if( Array.isArray && Array.isArray(keyForIndex) ){
		for(var i=0, numKeys = keyForIndex.length; i < numKeys; ++i){
			add_to_index(svc,host,keyForIndex[i]);
		}
		return;
	}

	autoCompleteTags[keyForIndex] = 1;
	if(!index[keyForIndex]){
		index[keyForIndex] = [];
	}
	
	index[keyForIndex].push([svc,host]);
}

function search(query) {
	empty_by_id("searchQuery");
	empty_by_id("numResultsRet");
	empty_by_id("searchResults");
	hide_show_by_id('hide',"searchResultsSection");

	if( !query ) return;

	var span = document.createElement('span');
	span.innerHTML = query;
	document.getElementById("searchQuery").appendChild(span);
	
	if(index[query]){
		var results = index[query],
			numResults = results.length;

		for(var i = 0; i < numResults; ++i){
			var svc = results[i][0];
			var host = results[i][1];
			// var $hover = $("<div></div>").addClass("hover").append( build_node(svc,host) );
			// $("#searchResults").append($hover);
			var node = build_node(svc,host);
			node.classList.add("singleSearchResult");
			if( node ){
				document.getElementById("searchResults").appendChild( node );
			}
		}
		document.getElementById("numResultsRet").innerHTML = numResults;
		hide_show_by_id('show',"searchResultsSection");

	}
}

function hide_show_by_id(op,elemId){
	var elem = document.getElementById(elemId);
	if(op === 'hide'){
		elem.style.display = "none";
	}else{
		elem.style.display = "block";
	}

}

function empty_by_id(id){
	var elem = document.getElementById(id);
	while(elem.firstChild){
		elem.removeChild(elem.firstChild);
	}
}

function build_node(svc,host){
	var rv = document.createElement('div');
	rv.innerHTML = svc + ' : ' + host;

	var props = data[svc][host];

	for(var prop in props){
		var val = props[prop];

		var propNode = document.createElement('div');
		propNode.innerHTML = prop +' : '+val;

		if( Array.isArray && Array.isArray(val) ){
			propNode.innerHTML = prop_to_string(prop,val);
		}
		rv.appendChild(propNode);
	}
	return rv;
}

function populate_page_from_data() {
	var $arrowClosedNode = $('<span></span>').addClass("toggleSwitch");
	var closedNode = document.createElement('span');
	closedNode.classList.add('toggleSwitch');

	// for(svc in data){
	$.each(data, function(svc,hosts){
		var $svcObj = $("<div></div>").attr("class","svcObj").attr("id",svc);
		var $svcLabelNode = $("<div></div>").attr("class","labelNode").attr("id",svc+"label");
		var $svcDataNode = $("<div></div>").attr("class","dataNode").attr("id",svc+"data");

		var $svcNameNode = $('<span></span>').text(svc.toUpperCase());

		$svcLabelNode.append($arrowClosedNode.clone()).append($svcNameNode);
		
		// for(host in svc){
		$.each(hosts,function(host,props){
			add_to_index(svc,host,host);
			var $hostObj = $("<div></div>").attr("class","hostObj").attr("id",host);
			var $hostLabelNode = $("<div></div>").attr("class","labelNode").attr("id",host+"label");
			var $hostDataNode = $("<div></div>").attr("class","dataNode").attr("id",host+"data");

			var $hostNameNode = $('<span></span>').text(host);

			$hostLabelNode.append($arrowClosedNode.clone()).append($hostNameNode);

			// for(prop in host){
			$.each(props,function(prop, val){
				add_to_index(svc,host,val);
				var $propNode = $("<div></div>").attr("class","shortWidth")
				.text(prop_to_string(prop.toLowerCase(),val));

				$hostDataNode.append($propNode);
			});

			$hostObj.append($hostLabelNode).append($hostDataNode);
			$svcDataNode.append($hostObj);
		});

		$svcObj.append($svcLabelNode).append($svcDataNode).addClass("svcBox");
		$('#svcList').append($svcObj);
	});
}

function prop_to_string(prop,val){
	var rv = prop + ' : ' + val;
	
	if( Array.isArray && Array.isArray(val) ){
		rv = prop + ' : ';
		for(var i = 0; i < val.length; ++i){
			rv += val[i] + ' ';
		}
	}
	
	return rv;
}

function ajax(request){
	var type = request.type,
		url = request.url,
		data = request.data,
		async = request.async,
		callback = request.complete;

	var xhr;
	if( window.XMLHttpRequest ){
		xhr = new XMLHttpRequest();
	}else {
		xhr = new ActiveXObject("Microsoft.XMLHTTP");
	}

/*	if( request.cors ){
		if( window.XDomainRequest ) {
			xhr = new XDomainRequest();
		}else if( ! xhr.withCredentials ){
			// xhr = null;
			// return xhr;
		}
	}
*/

	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4 && xhr.status === 200){
			callback(xhr.responseText);
		}
	};

	xhr.open(type,url,async);
	xhr.send(data);
}

function populate_page_ajax(){
	
	for( var svc in data ){
		var svcObj = document.createElement('div');
		svcObj.classList.add('svcObj');
		svcObj.id = svc;

		var svcLabelNode = document.createElement('div');
		svcLabelNode.classList.add('labelNode');
		svcLabelNode.id = svc+'label';

		var svcDataNode = document.createElement('div');
		svcDataNode.classList.add('dataNode');
		svcDataNode.id = svc+'data';

		var svcNameNode = document.createElement('span');
		svcNameNode.innerHTML = svc.toUpperCase();

		svcLabelNode.appendChild(minusNode);
		svcLabelNode.appendChild(svcNameNode);

	}


	var $arrowClosedNode = $('<span></span>').addClass("toggleSwitch");
	var closedNode = document.createElement('span');
	closedNode.classList.add('toggleSwitch');

	// for(svc in data){
	$.each(data, function(svc,hosts){
		var $svcObj = $("<div></div>").attr("class","svcObj").attr("id",svc);
		var $svcLabelNode = $("<div></div>").attr("class","labelNode").attr("id",svc+"label");
		var $svcDataNode = $("<div></div>").attr("class","dataNode").attr("id",svc+"data");

		var $svcNameNode = $('<span></span>').text(svc.toUpperCase());

		$svcLabelNode.append( $arrowClosedNode.clone() ).append($svcNameNode);
		
		// for(host in svc){
		$.each(hosts,function(host,props){
			add_to_index(svc,host,host);
			var $hostObj = $("<div></div>").attr("class","hostObj").attr("id",host);
			var $hostLabelNode = $("<div></div>").attr("class","labelNode").attr("id",host+"label");
			var $hostDataNode = $("<div></div>").attr("class","dataNode").attr("id",host+"data");

			var $hostNameNode = $('<span></span>').text(host);

			$hostLabelNode.append($arrowClosedNode.clone()).append($hostNameNode);

			// for(prop in host){
			$.each(props,function(prop, val){
				add_to_index(svc,host,val);
				var $propNode = $("<div></div>").attr("class","shortWidth")
				.text(prop_to_string(prop.toLowerCase(),val));

				$hostDataNode.append($propNode);
			});

			$hostObj.append($hostLabelNode).append($hostDataNode);
			$svcDataNode.append($hostObj);
		});

		$svcObj.append($svcLabelNode).append($svcDataNode).addClass("svcBox");
		$('#svcList').append($svcObj);
	});


	ajax({
		type: 'POST',
		url: '/search',
		data: JSON.stringify({ 
			"svc": "svclebc01v",
			"box": "CPCLB4200" 
		}),
		async: true,
		complete: function(response){
			console.log(response);
		}
	});
}