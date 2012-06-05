# RunJS

A simple lightweight library to run the appropriate scripts depending on a pathname or selector.


## Background

We, at [Public Class](http://publicclass.se), try to organize our client side javascript in jQuery plugins as much as possible, but even the nicely encapsulated jQuery plugins need to be initialized somewhere, usually in a "document ready"-method.

And we felt a need to organize our initializeres depending on which page we're at to avoid our "document ready"-method to look like this:

    $(function(){
      if( $(".drag-drop").length ){
        // jQuery UI sorting 
        $(".drag-drop").sortable({
          // plenty of configuration
        })
        // (and somewhere else we'll need to re-init this to update the sortable when the lists have changed etc...)
      }
      
      
      if( $(".overlay").length ){
        // Implement some kind of js overlay
        $(".overlay").modal("some-overlay.html")
        $(".overlay a.close").click(function(){
          $.modal("close")
        })
      }
      
      if( $("#special-form").length ){
        // Custom Validations
        // AJAX submissions
        // etc...
      }
      
      // And so on usually ending up in an uncomfortable list of ifs and initializers...
      
    })


## Solution

A little method which "runs" depending on either the current page (yay, organize by different pages/paths in the same script!) or by CSS selector (similar to above, but if-less).


## Usage

    // Run when pathname ends with /slideshow
    // the splatted part (the '*all'-part) is passed on
    // as an argument along with the complete url
    $.run("/*all/slideshow",function(all,url){
      $(".slideshow").load(all)
    })
    
    // Run when a selector is matched on the page
    $.run(".pagination",function(){
      // `this` will be the same as if it was called through $(".pagination")
    })
    
    // Basically the same as $(), but here for completeness
    $.run(function(){
      
    })

    // Also add them all at once by passing an object
    $.run({
      // Run these when the url ends with /slideshow
      "/*all/slideshow": function(all,url){},
      
      // Run this on url '/press'
      "/press": function(url){},
      
      // Run this if '.pagination' selector is found
      ".pagination": function(){}
    })


## Features

* Run scripts based on a pathname or a css selector

* The _pathname_ should be parsed from either (in this order)
  
  1. a hashbang (i.e. a window.location.hash starting with #!)
  2. address bar (i.e. the window.location.pathname)

* Run the script again (in case anything has updated)

        window.addEventListener("hashchange",function(){
          // Run all (currently matching) routes again
          $.run()
          
          // Run only a particular one
          $.run("/*all/slideshow")
        })

## History

### 0.3.0

* [Fixed] `$.run.again()` didn't really work as it used a non-referenced variable. Now it has a test to make sure.
* [Added] Now we have a simple build tool in the [Makefile](./Makefile).
* [Added] Refactored into using Route instances. This should make it faster in modern javascript engines. And much more readable.

### 0.2.1

* [Added] `$.run.again()` which should be called anytime a selector has to be run again.
* [Fixed] If two selector-routes matched an element only the first would be used. Now they're selector specific and shouldn't conflict.


### 0.2.0

* [Added] Applies a "run"-attribute to the element so it won't be rerun unless told to (by removing that attribute).


### 0.1.1

* [Added] The catch-all style:

        $.run(function(){
          // I'll be called every time!
        })


### 0.1.0

* Initial version.


## TODO

By the big `1.0` we should also have a few extra features like:

* Adapters for hashchange and push/pop-State that runs, ehm, `$.run()` whenever it has changed
* Work just as well without jQuery (i.e. be framework agnostic) and only support selectors if a selector engine is available (like Sizzle or document.querySelectorAll)
* Allow loading of external scripts depending on route (if Modernizr is available) before the callback is called (i.e. it'll be the 'complete'-callback instead)
* Maybe be able to name the routes so it'll be more convenient to rerun a particular route
* Maybe return the matched wildcards in the route of a pathname in a params-hash instead


## Testing

Open up [test-run.html](./test/test-run.html) in a browser, click around and see that no exceptions are thrown (probably found in the console).

For the [History.js](https://github.com/balupton/History.js/) tests it needs to be run from a web server to be able to rewrite those urls with `History.pushState`.

## Building

To build you need to install [uglifyjs](https://github.com/mishoo/UglifyJS) which is used for minification. It's simply done using npm: `npm i uglify-js -g`.

Then all you need is to run:

```
> make
```

and optionally add a version

```
> make VERSION=0.4.0-bob
```


## License 

(The MIT License)

Copyright (c) 2012 Robert Sköld &lt;robert@publicclass.se&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
