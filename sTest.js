#!/usr/bin/supervisor
//#!/usr/local/bin/node

var server = require('./server');

server.set('port',process.env.PORT || 3000);

server.get('/home',function(){
	console.log('home accessed');
});

server.get('/contact',function(){
	console.log('contact accessed');
});

server.post('/search',function(){
	console.log('search accessed');
});

server.run_server();
/*
	var searchRE = /search/gi;
	if( searchRE.exec(req.url) ){
		
		var data = [];
		var item = '';
		req.setEncoding('utf8');
		req.on('data',function(chunk){
			item += chunk;
		});

		req.on('end',function(){
			// data.push(item);
			// console.log(item);
			// console.log(data);
			var queryObj = JSON.parse(item);
			var svc = queryObj.svc;
			var box = queryObj.box;
			// var boxData = data[ svc ][ box ];
			// res.end( JSON.stringify(boxData) );
			res.end( svc + ' ' + box);
		});
	}
*/