# Library to cache function calls till API's initializing.

There are situations that your API is not ready yet for some reason, but you want it to be available immediately.  
In that case you most probably need return some dummy value when your methods are being called and cache arguments and this object for every call, to execute them immediately when your API becomes ready.  
So this library provides all the above mentioned functionality :).

# Usage.

To use with NodeJS.

```sh
npm install call-cacher.
```

A little use case.  
Lets create document ready event listener.

```javascript
var OnDocReady = ( function () {
    var Cacher = require( 'call-cacher' ), 
        cacher = new Cacher( function ( handler ) {
            handler.apply( this, Array.prototype.slice.call( arguments, 1 ) );
        } );


    //  If document is already loaded.
    if( document.state == 'complete' ) {
        cacher.ready();
    } else {

        //  Defining DOM content loaded event listener.
        var EventListener = function () {
            cacher.ready();
            window.clearTimeout( timeout );
        };

        //  If 10 seconds passed, but document is still not loaded, cancel calls.
        //  Maybe this situation is not a good example, but still, it is an example :).
        var timeout = window.setTimeout( function () {

            //  Cancel means that all calls to this function now will be ignored 
            //  and the first argument given to this function will be returned.
            cacher.cancel( function () {
                console.error( 'OnDocReady is not available anymore.' );
                return false;
            } );
            document.removeEventListener( 'DOMContentLoaded', EventListener );
        }, 5000 );

        //  On document ready,
        document.addEventListener( 'DOMContentLoaded', EventListener );
    }

    //  Execute property is the function you need to give as your method/function.
    return cacher.execute;
} ) ();

OnDocReady( function () {
    document.querySelector( '#some-target' ).innerHTML = 'Document is loaded!!!';
} );
OnDocReady( function () {
    console.log( 'Stylesheets count for this document', document.styleSheets );
} );
```

## Browser support

|Firefox|Chrome |IE |Opera  |Safari |
|:-----:|:-----:|:-:|:-----:|:-----:|
|5      |5      |9  |11.60  |5.1    |