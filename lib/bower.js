var bower = require( "bower" );
var path = require( "path" );

module.exports = function( _, anvil ) {

	var prefix = "bower:";
	return anvil.plugin( {
		name: "anvil.bower",
		commander: [
			[ prefix + "install [value]", "Install a package via bower" ],
			[ prefix + "uninstall [value]", "Uninstall a package via bower" ],
			[ prefix + "search [value]", "Search bower for a package" ],
			[ prefix + "list", "List installed bower packages" ]
		],

		configure: function( config, command, done ) {
			var commands = [ "install", "uninstall", "search", "list" ],
				key = _.find( commands, function( c ) {
					return command[ prefix + c ];
				} );
			if( key ) {
				this.command( key, command[ prefix + key ] );
			} else {
				done();
			}
		},

		command: function( command, value ) {
			var self = this,
				stop = function( data ) {
					console.log( data );
					anvil.raise( "all.stop", 0 );
				};
			bower.commands[ command ].line( process.argv )
				.on('data', self.log )
				.on('end', stop )
				.on('error', stop );
		},

		log: function( data ) {
			if( data ) { console.log( data ); }
		}
	} );
};