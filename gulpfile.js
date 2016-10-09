'use strict';

var Config = ( function () {
	var self = {}, 
		file = 'main';

	self.src = 'src/';
	self.dist = 'dist/';

	self.filePath = self.src + file + '.js';
	self.minFilePath = self.dist + file + '.min.js';
	return self;
} ) ();
 
var gulp = require( 'gulp' ), 
	gzip = require( 'gulp-gzip' ), 
	uglify = require( 'gulp-uglify' ), 
	rename = require( 'gulp-rename' ), 
	concat = require( 'gulp-concat' ), 
	moment = require( 'moment' ), 
	header = require( 'gulp-header' ), 
	bower = require( 'main-bower-files' ), 

	pkg = require('./package.json'),
	fs = require('fs'),

	uglify_settings = {
		fromString: true, 
		mangle: {
			sort:     true, 
			toplevel: true, 
			eval:     true
		},
		compress: {
			screw_ie8:    true, 
			properties:   true, 
			unsafe:       true, 
			sequences:    true, 
			dead_code:    true, 
			conditionals: true, 
			booleans:     true, 
			unused:       true, 
			if_return:    true, 
			join_vars:    true, 
			drop_console: true, 
			comparisons:  true, 
			loops:        true, 
			cascade:      true, 
			warnings:     true, 
			negate_iife:  true, 
			pure_getters: true
		}
	};

gulp.task( 'minify', function () {
	gulp.src( Config.filePath )
		.pipe( uglify( uglify_settings ) )
		.pipe( rename( { extname: '.min.js' } ) )
		.pipe( gulp.dest( dist_folder ) );
} );
gulp.task( 'gzipify', function () {
	gulp.src( Config.dist + '*.min.js' )
		.pipe( gzip() )
		.pipe( gulp.dest( dist_folder ) );
} );
gulp.task( 'addheader', function () {
	var file = fs.readFileSync( Config.minFilePath ).toString();
	file = file.replace(/^\/\*(.|\n)+\*\//, '');
	fs.writeFileSync( Config.minFilePath, file );

	var year = moment().format('YYYY'), 
		header_options = {
			title:		pkg.title || pkg.name,
			version:	pkg.version,
			date:		moment().format('YYYY-MM-DD'),
			homepage:	pkg.homepage,
			author:		pkg.author.name,
			license:	pkg.license
		}, 
		this_year = year == '2016';

	if( !this_year )
		header_options.year = year;

	gulp.src( Config.minFilePath )
		.pipe( 
			header( [
				'/*! ${title} - v${version} - ${date}\n',
				' * ${homepage}\n',
				' * Copyright (c) ' + ( this_year ? year : '2016-${year}' ) + ' ${author}; License: ${license} */\n'
			].join( '' ), 
			header_options 
		) )
		.pipe( gulp.dest( dist_folder ) );
} );

gulp.task( 'default', [], function () {
	gulp.watch( [ filepath ], [ 'minify', 'gzipify', 'addheader' ] );
	gulp.start( [ 'minify', 'gzipify', 'addheader' ] );
} );