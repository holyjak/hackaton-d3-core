Hackaton D3 Demo
================

Experiemnt with a simple interactive graph using
[D3.js](https://github.com/mbostock/d3#readme).

Created by Leon, Vidar, Jakub in 1/2013.

Show time!
----------

### Running

Start a HTTP server to serve files from this directory, f.ex.

  	python -m SimpleHTTPServer

Then browse to [http://localhost:8000/](http://localhost:8000/) (or whatever port it used).

### What it does

* A curve with points, X and Y axes with ticks (labels) in reasonable distances
* On-mouseover tooltips for the points on the curve
* A cross showing the point on the curve on mouse's X coordinate and
its X and Y values
* Mouse-over Morning/Afternoon/Evening to hide all but nodes for that
time

1. Tooltip showing the details of a movie (it can be any html/svg, contain anything related or not to the data point) => we can execute any JavaScript on mouse events, having access to the object for the data point under the cursor
2. A cross showing the values at the interesection of the mouse's X coordinate and X axis and the corresponding point on the curve (even if the mouse is not directly on the curve but above/below, we would see the same Y value, here 21) => we can track the movement of the mouse and translate it to the corresponding X, Y values and do something with them; it could be used for example to update a related detail graph etc.
3. Data points can be interactively changed, here if you mouse-over of any of Morning/Afternoon/Evening, all but the corresponding points will be temporarily hidden => the graph can be interactively changed based on user activity and the data in the individual data points

Aside of that, we have managed to draw axes (yay! :-)); the noteworthy fact is that the labels are determined automatically from the input data and we can influence how many we will see to avoid cluttering the axes with too much info (while the positional cross can be used to show the exact value at the current position / nearest data point).

Conclusion: D3 is little low-level but very flexible, very powerful.

Development setup
-----------------

How to set up development environment where changes to a JS/HTML file
are "immediately"" reflected in the browser?

### Success: Auto-reload with guard and Remote Control

Using the Firefox plugin [Remote Control](https://addons.mozilla.org/en-US/firefox/addon/remote-control/) and [Guard](https://github.com/guard/guard), a page can be automatically reloaded whenever
a js/html/css/... file changes.

To use:

1. Install Guard and the Remote Control Firefox plugin
2. Add the R.C. icon to the Firefox toolbar (View - Toolbars - Customize, find the
icon and drag it next to the locatin bar)
3. Start Remote Control - click the icon, it shall turn from red to
green
4. (Optional) Test R.C.: `telnet localhost 32000`, type `reload` and
ENTER, it shall return '{}' and the currently open page shall be
reloaded
5. Run Guard to watch for changes: from this directory, run `guard`

How it works? Guard watches files for changes and whenever one is detected, it sends 'reload'
to the port where the Remote Control plugin listens. See ./Guardfile.

Note: It is not necessary to use Guard, any tool that can execute
commands when files change would do, f.ex. the JavaScript-based
[Grunt](http://ruudud.github.com/2012/12/22/grunt/).

#### Shortcomings

* The page is reloaded => all state is lost, plus i might be slow
* You'd still need to use the Firebug/Chrome dev tool console to
  experiment with JS, i.e. no support for evaluating snippets of JS in
  the context of the browser

### Rejected solutions

#### Live realod/yeamon

*Yeoman looks nice and does all but requires particular structure of
 the project.*

Yeoman is a wrapper around multiple utilities such as live relaod. Run

    curl -L get.yeoman.io | bash

To get installation instructions.

Then, within this folder, execute

	yeoman server

which will start a built-in preview http server and open the
app/index.html page in the browser. It will also start to watch for
changes to files under app/ and reload them in the browser (via livereload).

In theory it should also be possible to run a custom http server and
set up and run [livereload](http://livereload.com/) manually to
update the browser with your changes on the fly but for me the
LiveReload Chrome plugin failed to install.

#### Swank-js for Emacs

[Swank-js](http://emacsrocks.com/e11.html) is promissing but very
complex setup, according to the reports. Also there hasn't been much
development lately.

#### skewer-mode for Emacs

[skever-mode](https://github.com/skeeto/skewer-mode) tries to achieve
the same as swank-js but in pure elisp with trivial
setup. It is possible to evaluate JS in the context of the browser
etc. It looks nice but I encountered some issues:

* It seem to only work for JS, not for HTML.
* The built-in server failed to pick up changes to HTML and I haven't
found a way to force it to reload them other than restarting Emacs.

I guess there is a better way to use it though... .

Disadvantages: the scripts jQuery and /skewer must be to every page
that should support live reloading (though you can use some tricks to
insert the dependecies into a page from the browser).

Resources
---------

## Interesting tricks an examples

Disclaimer: I am only learning D3 so everything below regarding how
things works are just my guesses.

Basics

* [Margin Convention](http://bl.ocks.org/3019563) - the recommended
  way to define margins only once using a translated `g` inside an
  `svg` - all other elements don't need to care about them. Plus how
  to position axes on any side.
* [Line Chart](http://bl.ocks.org/3883245) - an elementary line chart
  with margins and axes
* [General Update Pattern, I](http://bl.ocks.org/3808218) -
  demonstration of the `enter()` and `exit()` functions of a selection
  w.r.t. new data. In each round, data is replaced with a random
  subset of alphabet; if there were any same letters then they are
  "updated" while the other ones are "netered"; letters in the old
  subset not in the new one are "exited". (Not exactly easy to follow but anyway... )
* [General Update Pattern, II](http://bl.ocks.org/3808221) - same as
  above but the letters are always sorted thanks to the use of keys
  (where the key is returned by the function passed as the 2nd
  argument to data(..) and, in this case, equals to the data value
  itself).
* (Simple Tree Graph (Cross-linked
  Mouseover)[http://bl.ocks.org/3087986]) - mostly interesting as an
  example of a somple tree graph rendered using `d3.layout.tree()` and
  its `nodes(..)` and `links(..)` to get svg-compatible data for the
  nodes and for the eges between them.
* [Month Axis](http://bl.ocks.org/1849162) - a simple time axis having
  one tick per month. Using: scale, ticks(d3.time.months), tickSize,
  tickFormat and styling the labels via text-anchor and x, y (to push
  them down & right from the line).
* [Automatically Sizing Text in D3](http://bl.ocks.org/1846692) - a
  simple "bubble graph" using the `d3.layout.pack()` layout to compute
  the x, y, and r(adius) of each data element. The data is loaded from
  a hierarchical [json file](http://bl.ocks.org/d/1846692/README.json)
  (using the (default children
  accessor)[https://github.com/mbostock/d3/wiki/Hierarchy-Layout#wiki-children]
  expecting the attribute `children`) and flattened to contain only root & leaf nodes. Each node is then
  represented as a circle with size corresponding to its value (a
  numerical property, according to the (default value
  accessor)[https://github.com/mbostock/d3/wiki/Hierarchy-Layout#wiki-value])
  and with an appended text that is scaled w.r.t. the radius and using
  SVG's
  [getComputedTextLength](http://www.w3.org/TR/SVG/text.html#__svg__SVGTextContentElement__getComputedTextLength).
* [offsetX / offsetY (and mouse events)](http://bl.ocks.org/1854471) -
  demonstration of `d3.event.offsetX/Y`, `d3.event.layerX/Y` and
  [`element.clientLeft/Top`](https://developer.mozilla.org/en-US/docs/DOM/element.clientLeft)
  and their relation to margin, padding, border, width etc..

Interaction

* The `d3.mouse()` fun. requires a node; one way to get it is
  `d3.select(...).node()` (returns the first node of the selection or
  null if empty)
* [Zoomable Area](http://bl.ocks.org/4015254) - not really zoom, but a
  graph that is wider than the chart and can be draged to left/right
  to show the future/past data. A nice, interactive way to enable the
  users to move through a long history. The disadvantage is that the
  whole chart is likely computed at once, so lot of data could be slow
  to proces. It uses d3.behavior.zoom.on() to register a callback
  function, draw, that re-draws the axis and area and has a rect with
  the zoom behavior added. Not really sure how it works as the docs of
  the zoom are quite short.
* [X-Value Mouseover](http://bl.ocks.org/3902569) - wherever the mouse
  goes, the point on the curve at its x coordinate is shown with its
  y-value, st. similar to what we needed for our solution. It uses
  d3.mouse to get the coordinate, scale.invert to find the
  corresponding X data value, and d3.bisector to find the
  corresponding data point including its Y value (i.e. what we did).
* [Programmatic Pan+Zoom](http://bl.ocks.org/3892928) - pan and zoom
  the display. Uses d3.behavior.zoom and its ability to autom. adjust
  scales and sets scaleExtent(1, 10) to allow scaling from 100s to
  10s. The zoom's callback function than re-draws the two axes. The
  reset button then reset's the domains of the zoom's scales and
  re-renders axes.
* [Autofocus](http://bl.ocks.org/1627439) - a neat trick to ensure
  that any key pressed on the page is typed into an input field (using
  window's onkeydown, d3.select and `d3.event.keyCode`).

Advanced (for me :)) interactions

* [click-to-zoom via transform](http://bl.ocks.org/2206590) - using
  geo, zoom+translate transformations, a JS on-click function (part of
  a series).

Multiple data lines

* [Multi-Series Line Chart](http://bl.ocks.org/3884955) - 3 curves in
  one chart with automatically assigned colors. Uses
  `d3.scale.category10()` to create palette of 10 colors, setting its
  domain to the number of data columns and doing some magic to
  transform the data objects with city name + values; these objects
  are then then passed as data to create nodes (instead of a simple
  array). Interesting to see how the data is transformed and rendered
  via a path calling to a line(values). Rendering sity label at the
  end of the curve is neat.
* [Stacked Area Chart](http://bl.ocks.org/3885211) - similar to the
  Multi-Series Line Chart (creation of an object with name+values for
  each data column) but wraped in stack(..) and combining path with
  area instead of line. Similar: (Stacked Area via
  Nest)[http://bl.ocks.org/3020685] - data in diff. formats (rows, not
  columns), using `d3.nest()` to group them hierarchically and then
  retrieving the data layers via `stack(nest.entries(data))`.
