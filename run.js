/*!
 * RunJS 0.3.0
 * (c) 2012 Robert Sköld <robert@publicclass.se>
 * MIT Licensed
 */

(function($){
  var routes = []; 

  /**
   * Create or Execute a Route
   *
   * To _create_ routes the `route` can be a hash where the keys
   * are the routes and the values are the callbacks. Or the `route`
   * and `callback` is used to create a new Route which matches either
   * a _selector_ or a _pathname_/_hashbang_.
   *
   * To _execute_ routes either simply call this with no arguments to run
   * all the ones that match or pass in the `route` to run and it will run
   * unless it has already (and didn't get marked to `$.run.again()`).
   *
   * @param {RegExp,String,Object} route
   * @param {Function} callback
   * @api public
   */
  function run(route, callback){

    // hash-of-routes
    if( !callback && typeof route == "object" ){
      for( var r in route )
        run(r,route[r]);
      return;
    }

    // single run
    if( !callback && typeof route == "string" ){

      // Execute its callback if the route is a match against:
      // - window.location.hash.slice(2) (hashbang) 
      // - or window.location.pathname (pathname)
      // - or $() (selector)
      var matched = 0;
      for( var i=0, l=routes.length; i < l; i++ ){
        var r = routes[i];
        if( r.name === route )
          matched += r.match();
      }
      return matched;
    }
    
    // run all
    if( !callback && !route ){
      var matched = 0;
      for( var i=0, l=routes.length; i < l; i++ )
        matched += run(routes[i].name);
      return matched;
    }
    
    // create route
    routes.push(new Route(route, callback));
  }

  /**
   * When an element has already been 'run'
   * and for some reason it should be run again
   * use this method.
   *
   * @api public
   */
  run.again = function(selector,now){
    $(selector).removeData("run:"+selector)
    return now ? run(selector) : 0;
  }

  /**
   * Public access to the routes.
   *
   * Use only for testing.
   * @api private
   */
  run.routes = routes; 


  /**
   * A Route.
   *
   * @api private
   */
  function Route(route,callback){
    // catch-all
    if( !callback && typeof route == "function" )
      callback = route, route = /^.*$/;

    this.name = route.source || route;
    this.callback = callback || function noop(){};

    // Anything starting with a slash is a path
    if( typeof route == 'string' && route.charAt() == "/" )
      this.pathname = this.path(route);

    // RegExp is considered a path too
    else if( typeof route == 'object' && route instanceof RegExp )
      this.pathname = route;

    // It's a selector, if the selectors match, run the callback
    // add the string to routes[]
    else if( typeof route == 'string' )
      this.selector = route;

  }

  /**
   * Build a regular expression of the route.
   * 
   * Examples:
   * 
   *  "/hello/world"     
   *    => /^\/hello\/world\/?$/
   *    
   *  "/page/:id"        
   *    => /^\/page\/([^\/]+)\/?$/
   *    
   *  "/*all/slideshow"  
   *    => /^\/(.+)\/slideshow\/?$/
   *    
   *  "/*all/slideshow(/:id)" 
   *    => /^\/(.+)\/slideshow(?:\/([^\/]+))?\/?$/
   *
   * @param {String,RegExp} path
   * @return {RegExp}
   */
  Route.prototype.path = function(path){
    if( path instanceof RegExp )
      return path;
    path = path
      .concat('/?')                       // always optional ending slash
      .replace(/\(([^)]+)\)/g,'(?:$1)?')  // optional
      .replace(/:(\w+)/g,'([^/]+)')       // keyword wildcard
      .replace(/([\/.])/g, '\\$1')        // fix slashes
      .replace(/\*(\w+)?/g, '(.+)');      // splat wildcard
    return new RegExp("^"+path+"$","i");
  }

  /** 
   * Match the route against `hashbang`, `pathname` or `selector` 
   * depending on the route string that created the Route.
   *
   * @return {Number}
   */
  Route.prototype.match = function(){
    if( this.selector ){
      // Don't run selectors again, if they already 
      // have been run.
      var sel = this.selector
        , el = $(sel).filter(function(){
        return !$(this).data('run:'+sel)
      }).data('run:'+sel,true);

      if( el.length ){
        this.callback.call(el);
        return 1; 
      }
    } else if( this.pathname ){
      var md
        , location = window.location
        , path = location.hash.slice(0,2) === "#!" ?
            location.hash.slice(2) :
            location.pathname;
      if( md = this.pathname.exec(path) ){
        this.callback.apply(el,md.concat(md.shift()));
        return 1;
      }
    }

    return 0;
  }

  
  // Expose it to the world!
  $.run = run;

  // Run on document ready!
  $(function(){ run() })
})(jQuery)
