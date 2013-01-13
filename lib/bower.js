/*
	anvil.bower - Bower support for anvil
	version:	0.0.4
	author:		Alex Robson <alex@sharplearningcurve.com> (http://sharplearningcurve.com)
	copyright:	2011 - 2012
	license:	Dual licensed
				MIT (http://www.opensource.org/licenses/mit-license)
				GPL (http://www.opensource.org/licenses/gpl-license)
*/
var bower;
var path = require( "path" );

module.exports = function( _, anvil ) {

	var invoke = function( command, args, done ) {
		if( !bower ) {
			bower = require( "bower" );
		}
		var call = bower.commands[ command ];
		if( call ) {
			args = args ? [ args ] : [];
			call( args )
				.on( 'data', anvil.log.event )
				.on( 'error', anvil.log.error )
				.on( 'end', function() { done(); } );
		} else {
			anvil.error.log( "Bower does not support command: '" + command + "'" );
		}
	};

	anvil.command( {
		name: "anvil.bower",
		commander: {
			"bower <command> [value]": {
				description: "Install, uninstall or search for a package",
				action: "process"
			}
		},

		configure: function( config, command, done ) {
			done();
		},

		process: function( command, value, options, done ) {
			invoke( command, value, done );
		}
	} );

	anvil.plugin( {
		name: "bower.build",
		activities: [ "pre-build", "identify" ],
		run: function( done, activity ) {
			this[ activity ]( done );
		},
		identify: function( done ) {
			var componentsBase = path.resolve( "./components" ),
				exists = anvil.fs.pathExists( componentsBase );
			if( !exists ) {
				done();
			} else {
				anvil.fs.getFiles( componentsBase, componentsBase, function( files, directories ) {
					var metadata = [];
					_.each( directories, function( directory ) {
						var relativePath = directory.replace( componentsBase, "" );
							componentPath = anvil.fs.buildPath( [ directory, "component.json" ] ),
							packagePath = anvil.fs.buildPath( [ directory, "package.json" ] ),
							component = anvil.fs.pathExists( componentPath ) ? require( componentPath ) : {},
							pack = anvil.fs.pathExists( packagePath ) ? require( packagePath ) : {},
							componentName = path.basename( directory );
						var files = [];
						if( component.main ) {
							files.push( component.main );
						}
						if( pack.main ) {
							files.push( pack.main );
						}
						if( component.styles ) {
							files = files.concat( component.styles );
						}
						if( component.scripts ) {
							files = files.concat( component.scripts );
						}
						var data = _.map( files, function( file ) {
							file = anvil.fs.buildPath( [ directory, file ] );
							var data = anvil.fs.buildFileData(
									path.dirname( file ),
									anvil.fs.buildPath( [ anvil.config.working, "src", "ext", componentName ] ),
									file );
							data.relativePath = anvil.fs.buildPath( [ "ext", relativePath ] );
							return data;
						} );
						metadata = metadata.concat( data );
					} );
					metadata = _.uniq( metadata, false, function( x ) { return x.fullPath; } );
					anvil.project.files = anvil.project.files.concat( metadata );
					done();
				}, [], 0 );
			}
		},
		"pre-build": function( done ) {
			anvil.extensions.tasks[ "bower-dependencies" ].run( [], done );
		}
	} );

	anvil.task( "bower-dependencies", "install bower dependencies found in the build file", function( done ) {
		var config = anvil.config[ "anvil.bower" ],
			dependencies = config ? config.dependencies : [];
		anvil.scheduler.parallel( dependencies, function( dependency, done ) {
			var exists = anvil.fs.pathExists( [ "./components", dependency ] );
			if( !exists ) {
				invoke( "install", dependency, done );
			} else {
				done();
			}
		}, function() { done(); } );
	} );
};