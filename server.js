#!/usr/bin/supervisor
// #!/usr/local/bin/node

var http = require('http'),
	parse = require('url').parse,
	join = require('path').join,
	fs = require('fs'),
	readline = require('readline');

var config = {
	port : 3000,
	behavior : req_handler,
	endpoints : {
		get : {},
		post : {}
	},
	static_files : '.',
	root : __dirname
};

exports.run_server = function(){
	// console.log('initializing static dir with: ' + config.static_files );
	init_static_files_dir( config.static_files );
	http.createServer( config.behavior ).listen(config.port, function(){
		console.log("Server listening on port: " + config.port);
	});
};


exports.set = function(param,value){
	if( 'static_files' === param ){
		var path = join(config.root, value);

		fs.stat(path, function(err,stat){
			if(err){ 
				console.log('static files dir does not exist'); 
			} else {
				config[param] = value;
			}
		});
	} else {
		config[param] = value;
	}
};

exports.get = function(apiEndpoint, fn){
	if( 1 === arguments.length ){
		console.log('one arg to get');
		config.endpoints.get[apiEndpoint] = 'static';
	}else {
		if( 'function' === typeof fn ){
			config.endpoints.get[apiEndpoint] = fn;
		}
	}

};

exports.post = function(apiEndpoint, fn){
	if( 2 > arguments.length ){
		console.log('Too few arguments to post endpoint handler');
	} else {
		if( 'function' === typeof fn ){
			config.endpoints.post[apiEndpoint] = fn;
		}
	}

};

function req_handler(req,res){
	var	url = req.url;

	if( config.endpoints.get[url] && 'static' === config.endpoints.get[url] ) {
		console.log(url);
		serve_static(req,res);
	} else if( config.endpoints.get[url] ) {
		console.log(url);
		config.endpoints.get[url](req,res);
	} else if( config.endpoints.post[url] ) {
		console.log(url);
		config.endpoints.post[url](req,res);
	} else {
		console.log(url);
		console.log("endpoint has no defined behaivor");
	}
}

function serve_static(req,res){
	var url = parse(req.url),
		path = join(config.root, url.pathname);

	fs.stat(path, function(err,stat){
		if(err){
			
			if( 'ENOENT' === err.code ){
				// res.statusCode = 404;
				// res.end('ENOENT: ' + path);
			} else {
				res.statusCode = 500;
				res.end('Unknown server fault in delivering: ' + path);
			}
		} else {
			res.setHeader('Content-Length',stat.size);

			// FIXME: codesmell
			if( /\.js/.exec(path)){
				res.writeHead( 
					200, 
					{ "Content-Type": "text/javascript" }
				);
			}else if(/\.css/.exec(path)){
				res.writeHead( 
					200, 
					{ "Content-Type": "text/css" }
				);
			}else{
				// res.writeHead( 200, { "Content-Type": "text/html" });	
			}
			// FIXME: end codesmell

			var stream = fs.createReadStream(path);

			stream.pipe(res);
			
			stream.on('error',function(err){
				res.statusCode = 500;
				res.end('Trouble streaming: ' + path);
			});
		}
	});
}

function init_static_files_dir(startDir){
	var	path = join(config.root, startDir);
	// console.log('path used: ' + path);
	fs.readdir(path,function(err,files){
		if(err){
			console.log('could not read static files dir');
		} else {
			files.forEach(function(item){
				fs.stat( path+'/'+item ,function(err,stats){
					if( stats.isFile() ) {
						exports.get('/'+item);
						console.log(item + ' added static');
					} else if( stats.isDirectory() ){
						// init_static_files_dir( path+'/'+item );
					}
				});
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