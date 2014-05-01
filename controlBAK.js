var data = {}, index = {}, autoCompleteTags = {};
$(function(){
	$("#searchResultsSection").hide();
	populate_page_from_data();
	
	// $("#suggest").hide();
	$(".ui-helper-hidden-accessible").hide();

	$(".toggleSwitch").click(function(e){
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
	});
	$(".toggleSwitch").click().addClass("ui-icon ui-icon-triangle-1-e");

	$("#query").autocomplete({
		source: Object.keys(autoCompleteTags),
		// position: { collision: "fit", within: $("#suggest") }, //of: $("#suggest") },
		// appendTo : "#suggest",
		minLength: 2
	});

	$("#query").on("keyup",function(){
		search($(this).val());
	});


});

function add_to_index(svc,host,keyForIndex){
	if( $.isArray(keyForIndex) ){
		$.each(keyForIndex,function(index,value){
			add_to_index(svc,host,value);
		});
		return;
	}

	autoCompleteTags[keyForIndex] = 1;
	if(!index[keyForIndex]){
		index[keyForIndex] = [];
	}
	
	index[keyForIndex].push([svc,host]);
}

function search(query) {
	$("#searchQuery").empty();
	$("#numResultsRet").empty();
	$("#searchResults").empty();
	$("#searchResultsSection").hide();

	if( !query ) return;

	$("#searchQuery").append('<span>'+query+'</span>');
	
	// var re = new RegExp(query,"gi");
	if(index[query]){
		var numResults = index[query].length;
		$.each(index[query],function(resultIndex,valueArr){
			var svc = valueArr[0];
			var host = valueArr[1];
			// var $hover = $("<div></div>").addClass("hover").append( build_node(svc,host) );
			// $("#searchResults").append($hover);
			$("#searchResults").append(build_node(svc,host));
		});
		$("#numResultsRet").append(numResults);
		$("#searchResultsSection").show();
	}
}

function build_node(svc,host){
	var $rv = $("<div></div>").text(svc + ' : ' + host);
	$.each(data[svc][host],function(prop,val){
		var $propNode = $("<div></div>").text(prop+' : '+val);
		if($.isArray(val)){
			$propNode.text( prop_to_string(prop,val) );
		}
		$rv.append($propNode).addClass("singleSearchResult");
	});
	return $rv;
}

function populate_page_from_data() {
	var $arrowClosedNode = $('<span></span>').addClass("toggleSwitch");

	$.each(data, function(svc,hosts){
		var $svcObj = $("<div></div>").attr("class","svcObj").attr("id",svc);
		var $svcLabelNode = $("<div></div>").attr("class","labelNode").attr("id",svc+"label");
		var $svcDataNode = $("<div></div>").attr("class","dataNode").attr("id",svc+"data");

		var $svcNameNode = $('<span></span>').text(svc.toUpperCase());

		$svcLabelNode.append($arrowClosedNode.clone()).append($svcNameNode);
		
		$.each(hosts,function(host,props){
			add_to_index(svc,host,host);
			var $hostObj = $("<div></div>").attr("class","hostObj").attr("id",host);
			var $hostLabelNode = $("<div></div>").attr("class","labelNode").attr("id",host+"label");
			var $hostDataNode = $("<div></div>").attr("class","dataNode").attr("id",host+"data");

			var $hostNameNode = $('<span></span>').text(host);

			$hostLabelNode.append($arrowClosedNode.clone()).append($hostNameNode);
		
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
	
	if( $.isArray(val) ){
		rv = prop + ' : ';
		$.each(val,function(index,value){
			rv += value + ' ';
		});
	}
	
	return rv;
}