( function ( root, factory ) {
	if( typeof exports === 'object' && typeof module === 'object' ) {
		module.exports = factory();
	} else if( typeof define === 'function' && define.amd ) {
		define( [], factory );
	} else {
		( typeof exports === 'object' ? exports : root ).CallCacher = factory();
	}
} ) ( this, function () {
	'use strict';

	var main = CreateCacher;
	var IsFunction = ( function () {
		var func_proto = Function.prototype;
		return function IsFunction( target ) { return typeof target === 'function' && target != func_proto; };
	} ) ();
	function CreateCacher( handler, return_value ) {
		return new CallCacher( handler, return_value );
	};

	/**
	 * Cacher constructor.
	 * @param {Function}	handler      Function, which calls must be cached.
	 * @param {Mixed}		return_value Return value until it's not ready.
	 */
	function CallCacher( handler, return_value ) {
		var that = this;
		this.stack = [];

		//	This method is for
		this.execute = function () {
			if( that.isReady ) {
				return that.handler.apply( this, arguments );
			} else {
				if( !that.cancelled ) {
					that.stack.push( { that: this, args: arguments } );
				} else if( that.canceller ) {
					return that.canceller.apply( this, arguments );
				}
				return that.returnValue;
			}
		};
		this.handler = handler;
		this.returnValue = return_value;
	};
	( function ( PROTOTYPE ) {

		/**
		 * Calls queue.
		 * @type {Array}
		 */
		PROTOTYPE.stack = null;

		/**
		 * Original handler.
		 * @type {Function}
		 */
		PROTOTYPE.handler = null;

		/**
		 * Handler that must be used.
		 * @type {Function}
		 */
		PROTOTYPE.execute = null;

		/**
		 * Return value for not ready state.
		 * @type {Mixed}
		 */
		PROTOTYPE.returnValue = null;

		/**
		 * Is call cacher ready.
		 * @type {Boolean}
		 */
		PROTOTYPE.isReady = false;

		/**
		 * Is cancelled.
		 * @type {Boolean}
		 */
		PROTOTYPE.cancelled = false;

		/**
		 * Function that is being called when cacher is cancelled.
		 * @type {Function}
		 */
		PROTOTYPE.canceller = null;

		/**
		 * Function to make cache caller ready.
		 * @param  {Function}	each	Function to call for each call performed(options).
		 * @return {Mixed}				Returns results for all executions or false if this object is already ready or cancelled.
		 */
		PROTOTYPE.ready = function ( each ) {
			if( this.isReady || this.cancelled ) 
				return false;
			this.isReady = true;

			var results = [], 
				len = this.stack.length, 
				i = 0;
			for( ; i < len; i++ ) {
				var info = this.stack[ i ];
				if( each )
					each.apply( info.that, info.args )
				results.push( this.handler.apply( info.that, info.args ) );
			}
			this.stack = null;
			return results;
		};

		/**
		 * Function to cancel caching.
		 * @param  {Mixed}		retval	What to return for the next calls.
		 * @return {Boolean}			True on success.
		 */
		PROTOTYPE.cancel = function ( retval ) {
			if( this.isReady || this.cancelled )
				return false;
			this.cancelled = true;
			if( IsFunction( retval ) ) {
				this.canceller = retval
			} else {
				this.returnValue = retval;
			}
			this.stack = null;
			return true;
		};

		PROTOTYPE.constructor = CallCacher;
		CallCacher.prototype = PROTOTYPE;
	} ) ( CallCacher.prototype );
	return main;
} );