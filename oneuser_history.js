/**
 * A simple D3 graph.
 * Disclaimer: We knew nothing about D3 when creating it so there is certainly
 * a lot that is wrong or could be done in a much better way.
 *
 * @author leon, vidar, jakub
 */
function Chart() {
     // Setting margins and size
    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var dimensions = {
        outer: { width: 960, height: 500},
        inner: { width: 960 - margin.left - margin.right, height: 500 - margin.top - margin.bottom}
    };

    var chart = {
        dimensions: dimensions,
        /** The top svg element, styled */
        svg: d3.select("body").select("svg#userHistory") // <svg id="userHistory" />
            .attr("width", dimensions.outer.width)
            .attr("height", dimensions.outer.height)
            .on("mousemove", function() { move(d3.mouse(this)); })
            .append("g").attr("id", "chartBox")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    };

    var self = {
        runtime: { scales: null, data: null },
        /** Get the data and trigger rendering of everything */
        draw: function(jsonUrl) {
            d3.json(jsonUrl, function(error, data) {

                // Set time format
                var parseDate = d3.time.format.utc("%Y-%m-%dT%H:%M").parse;

                data.forEach(function(d) {
                    d.date = parseDate(d.date);
                });

                self.runtime.data = data;

                self.runtime.scales = createScales(data);

                drawChart(data, self.runtime.scales);
            });
        } // draw
    };

    function createTooltip(svg, idx, coord, text) {
        // We have 1 initially hidden tooltip that we move to the place hit
        // and show, hidding it after a delay
        // It consists of a group with a rectangle (for the background) and the text
        // See the onmouseover / onmouseout events
        var tooltip = svg
                .append("g")
                .attr("id", "tooltip_" + idx)
                .attr("transform", "translate(" + (10 + coord[0]) + ", " + (10 + coord[1]) +")");

        tooltip.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", (5 + (text.length * 0.7)) + "em")
            .attr("height", 17)
            .attr("fill", "lightblue");

        tooltip.append("text")
            .attr("x", 3).attr("y", 12)
            .text(text);

        return tooltip;
    }

    function move(coord) {
        drawCross(coord);
    }

    function drawChart(data, scales) {

        drawAxes(chart.svg, scales);
        drawSelector(chart.svg);

        var line = d3.svg.line()
                .x(function(d) { return scales.x(d.date); })
                .y(function(d) { return scales.y(d.total); });

        chart.svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line)
            .attr("style", "stroke: turquoise");

        chart.svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("fill", function(d) {
                switch(d.time) {
                case 'Morning': return "steelblue";
                case 'Afternoon': return "midnightblue";
                case 'Evening': return "purple";
                default: return "black"; // shall never happen
                };
            })
            .attr("cx", function (d) { return scales.x(d.date);})
            .attr("cy", function (d) { return scales.y(d.total);})
            .attr("r", 5)
            .on("mouseover", function(d, i) {
                var coord = d3.mouse(this); // this is this svg element
                createTooltip(chart.svg, i, coord, d.title);
            })
            .on("mouseout", function(d, i) {
                // Hide it; note: not perfect, can conflict with showing the tooltip for
                // another data point if the mouse pointer moved in the meantime
                // Solve by having individual tooltip for each element?
                var tooltip = d3.selectAll("g#tooltip_" + i);
                // - needed *All for mouse in - out - in within 500ms => multiple tooltips w/ the id
                tooltip.transition().duration(500).style("opacity",0).remove();
            });

    }

    /**
     * Draw the data values corresponding to the mouse pointer next to the axes.
     * @param coord the x,y of the mouse w.r.t. the parent svg
     * @return y coordinate of the intersection between X and the data curve
     */
    function drawCrossTicks(coord) {

        // LABELS
        // Compute the x,y values corresponding to the x,y coordinates; since the
        // coords are w.r.t SVG while the axes are wrt. the moved inner g, we need
        // to adjust the coord w.r.t. that
        var gCoord = [coord[0] - margin.left, coord[1] - margin.top];
        var dateValue = self.runtime.scales.x.invert(gCoord[0]);
        var totalValue = Math.round(self.runtime.scales.y.invert(gCoord[1]));

        var bisect = d3.bisector(function(d) { return d.date; }).right;
        var insertIdx = bisect(self.runtime.data, dateValue);
        // The data[] element closest to the current date:
        var dataPointAtX = self.runtime.data[Math.min(self.runtime.data.length - 1, Math.max(0, insertIdx))];

        var viewDateStr = d3.time.format("%a %e.%m.")(dateValue);

        d3.selectAll("text.mouseTick").remove();

        chart.svg.append("text")
            .attr("class", "mouseTick x")
            .attr("x", gCoord[0] + 5)
            .attr("y", chart.dimensions.inner.height - 5)
            .text(viewDateStr);

        // Note: Fix y that is relative to the moved <g> to be relative to the parent <svg>
        var yOnCurve = self.runtime.scales.y(dataPointAtX.total) + margin.top;

        chart.svg.append("text")
            .attr("class", "mouseTick y")
            .attr("x", 5)
            .attr("y", yOnCurve /*gCoord[1] - 2*/)
            .text(dataPointAtX.total);

        return yOnCurve;
    }

    /**
     * Draw the cross following the mouse
     * @param coord x,y coordinates of the mouse w.r.t the SVG element
     */
    function drawCross(coord) {

        var yOnCurve = drawCrossTicks(coord);

        var canvas = d3.select("svg#userHistory");

        // THE CROSS
        if (canvas.selectAll("g#cross").empty()) {
            var cross = canvas.append("g").
                attr("id", "cross");

            // X axis tracker (2*height so we never see its end)
            cross.append("line")
                .attr("x1", 0)
                .attr("y1", -chart.dimensions.inner.height)
                .attr("x2", 0)
                .attr("y2", chart.dimensions.inner.height)
                .attr("stroke", "lightgray")
                .attr("class", "yTicks");

            // Y axis tracker
            cross.append("line")
                .attr("x1", -chart.dimensions.inner.width).
                attr("y1", 0).
                attr("x2", 0).
                attr("y2", 0).
                attr("stroke", "lightgray").
                attr("class", "yTicks");
        } else {
            // Note: The cross center must no be below the mouse for otherwise it will
            // cover the underlying element, which will thus receive the mouseout
            // event leading to it hiding the label (event though the mouse hasn't mvoed)

            // If mouse IS on the curve, move the center a little
            if (yOnCurve == coord[1]) { yOnCurve += 1; }
            var x = coord[0] + 1;
            canvas.selectAll("g#cross")
                .attr("transform", "translate(" + x + "," + yOnCurve +")");
        }
    }

    function drawAxes(svg, scales) {
        var xAxis = d3.svg.axis()
                .scale(scales.x)
                .ticks(d3.time.months) // custom ticks inst. of derived from data
                .orient("bottom");

        var yAxis = d3.svg.axis()
                .scale(scales.y)
                .orient("left");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.dimensions.inner.height + ")")
            .call(xAxis);

        var yAxisObj = svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

        /* Append label to the axis, if desired:
         yAxisObj.append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 6)
         .attr("dy", ".71em")
         .style("text-anchor", "end");
     	 .text("Price ($)");
         */
    }


    /** Scales for the axes and data; refer to the actual data properties */
    function createScales(data) {
        return {
            x: d3.time.scale()
                .range([0, chart.dimensions.inner.width])
                .domain(d3.extent(data, function(d) { return d.date; })),
            y: d3.scale.linear()
                .range([chart.dimensions.inner.height,0])
                .domain(d3.extent(data, function(d) { return d.total; }))
        };
    }

    function showSelection(timeinterval) {
        d3.select("text#sel" + timeinterval).attr("style","font-weight:bold");
        d3.selectAll("circle").filter(function(d,i) {return d.time != timeinterval;})
            .attr("opacity", "0");
    }

    function removeSelection(timeinterval) {
        d3.select("text#sel" + timeinterval).attr("style","font-weight:inherit");
        d3.selectAll("circle").filter(function(d,i) {return d.time != timeinterval;})
            .attr("opacity", "1");
    }

    function drawSelector(svg) {

        var top = 13; // text top
        var height = 10 + 6; // text + padding

        var selector = svg
                .append("g")
                .attr("id", "selector")
                .attr("style", "font-size: 12px;")
                .attr("transform", "translate(" + (chart.dimensions.inner.width - 70) + ", " + (chart.dimensions.inner.height - height * 3 - 10) +")");


        selector.append("rect").attr("width", 60).attr("height", height * 3 + 2)
            .attr("style", "stroke-width: 3; stroke: pink; fill: pink; fill-opacity: 0.2;");

        selector.append("text")
            .attr("x", 3).attr("y", top).attr("id","selMorning").attr("fill", "steelblue")
            .text("Morning")
            .on("mouseover", function() {
                showSelection("Morning");
            })
            .on("mouseout", function() {
                removeSelection("Morning");
            });

        selector.append("text")
            .attr("x", 3).attr("y", top + height).attr("id","selAfternoon").attr("fill", "midnightblue")
            .text("Afternoon")
            .on("mouseover", function() {
                showSelection("Afternoon");
            })
            .on("mouseout", function() {
                removeSelection("Afternoon");
            });

        selector.append("text")
            .attr("x", 3).attr("y", top + height*2).attr("id","selEvening").attr("fill", "purple")
            .text("Evening")
            .on("mouseover", function() {
                showSelection("Evening");
            })
            .on("mouseout", function() {
                removeSelection("Evening");
            });

        return selector;
    }

    return self;

}
