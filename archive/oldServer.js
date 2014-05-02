#!/usr/bin/supervisor
// #!/usr/local/bin/node

var http = require('http'),
	parse = require('url').parse,
	join = require('path').join,
	root = __dirname,
	fs = require('fs'),
	readline = require('readline');

http.createServer(handle_requests).listen(3000,function(){
	console.log("Server listening on port 3000");
});

function handle_requests(request,response){
	var url = parse(request.url),
		path = join(root, url.pathname);

	// console.log(request.method);
	var searchRE = /search/gi;
	if( searchRE.exec(request.url) ){
		
		var data = [];
		var item = '';
		request.setEncoding('utf8');
		request.on('data',function(chunk){
			item += chunk;
		});

		request.on('end',function(){
			// data.push(item);
			// console.log(item);
			// console.log(data);
			var queryObj = JSON.parse(item);
			var svc = queryObj.svc;
			var box = queryObj.box;
			// var boxData = data[ svc ][ box ];
			// response.end( JSON.stringify(boxData) );
			response.end( svc + ' ' + box);
		});
	}

	fs.stat(path, function(err,stat){
		if(err){
			
			if( 'ENOENT' === err.code ){
				// response.statusCode = 404;
				// response.end('ENOENT: ' + path);
			} else {
				response.statusCode = 500;
				response.end('Unknow server fault in delivering: ' + path);
			}
		} else {
			response.setHeader('Content-Length',stat.size);

			if( /\.js/.exec(path)){
				response.writeHead( 
					200, 
					{ "Content-Type": "text/javascript" }
				);
			}else if(/\.css/.exec(path)){
				response.writeHead( 
					200, 
					{ "Content-Type": "text/css" }
				);
			}else{
				// response.writeHead( 200, { "Content-Type": "text/html" });	
			}

			var stream = fs.createReadStream(path);

			stream.pipe(response);
			// stream.on('data',function(chunk){
			// response.write(chunk);
			// });
			
			stream.on('error',function(err){
				response.statusCode = 500;
				response.end('Trouble streaming: ' + path);
			});
		}
	});
}

// var sys = require('sys');
// var exec = require('child_process').exec;
// function puts(error, stdout, stderr) { sys.puts(stdout); }
// exec("ls -la", puts);

function read_file(path){
	var rd = readline.createInterface({
		input: fs.createReadStream(path),
		output: process.stdout,
		terminal: false
	});

	rd.on('line', function(line) {
		console.log(line);
	});

	if( process.argv[2] ){
		var filename = process.argv[2];
	}
}

function write_file(filename, dataToWrite){
	fs.writeFile(filename,dataToWrite,function(){
		console.log("filename: " + filename + "written");
	});
}