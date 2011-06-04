/*!
 * RunJS
 * Copyright(c) 2011 Robert Sköld <robert@publicclass.se>
 * MIT Licensed
 */

(function($){
  var routes = [];
  function run(/* route or hash of routes, callback */){
    // Handle the one object of routes option
    if( arguments.length == 1 && typeof arguments[0] == "object" ){
      for( var route in arguments[0] )
        run(route,arguments[0][route]);
      return;
    }
    
    
    var route = arguments[0]
      , callback = arguments[1];
    
    // If there's no callback, run it again!
    if( arguments.length == 1 && typeof route == "string" ){
      // Loop through routes
      // 
      // Execute its callback if the route is a match against:
      // - window.location.hash.slice(2) (hashbang) 
      // - or window.location.pathname (pathname)
      // - or $() (selector)
      
      var matched = 0;
      for( var i=0; i < routes.length; i++ ){
        var r = routes[i];
        if( r.route !== route )
          continue;
        if( "selector" in r ){
          var el = $(r.selector);
          if( el.length ){
            r.callback.call(el);
            matched++; 
          }
        } else if( "pathname" in r ){
          var md
            , path = window.location.hash.slice(0,2) == "#!" ?
                window.location.hash.slice(2) :
                window.location.pathname;
          if( md = r.pathname.exec(path) ){
            r.callback.apply(el,md.concat(md.shift()));
            matched++;
          }
        }
      }
      
      // Return how many routes matched
      return matched;
    }
    
    // If there's no route nor callback, run all again!
    if( arguments.length == 0 ){
      // Execute all routes
      var matched = 0;
      for(var i=0; i < routes.length; i++)
        matched += run(routes[i].route);
      // Return how many routes matched
      return matched;
    }
    
    
    // Anything starting with a slash is a path
    var isPath = route.charAt() == "/";
    if( isPath ){
      /**
       Build a regular expression of the route.
       
       Examples:
       
        "/hello/world"     
          => /^\/hello\/world\/?$/
          
        "/page/:id"        
          => /^\/page\/([^\/]+)\/?$/
          
        "/*all/slideshow"  
          => /^\/(.+)\/slideshow\/?$/
          
        "/*all/slideshow(/:id)" 
          => /^\/(.+)\/slideshow(?:\/([^\/]+))?\/?$/
      */
      var path = route
        .concat('/?')                       // always optional ending slash
        .replace(/\(([^)]+)\)/,'(?:$1)?')   // optional
        .replace(/:(\w+)/,'([^/]+)')        // keyword wildcard
        .replace(/([\/.])/g, '\\$1')        // fix slashes
        .replace(/\*(\w+)?/g, '(.+)');      // splat wildcard
      
      routes.push({
        route: route,
        pathname: new RegExp("^"+path+"$","i"),
        callback: callback
      })
    } else {
      // It's a selector, if the selectors match, run the callback
      // add the string to routes[]
      routes.push({
        route: route,
        selector: route,
        callback: callback
      })
    }
  }
  
  // Expose it to the world!
  $.run = run;
  $.run._routes = routes; // For testing
  
  // Run on document ready!
  $(function(){ run() })
})(jQuery)