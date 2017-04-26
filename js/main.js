/* Create a circle-pack layout of country level measures.
Inspiration drawn from: https://bl.ocks.org/mbostock/4063582
https://bl.ocks.org/mbostock/7607535
https://bl.ocks.org/mbostock/4063530
 */
$(function () {
    // Read in your data. On success, run the rest of your code
    d3.csv('data/2016.csv', function (error, data) {

        // Setting defaults
        var margin = {
            top: 40,
            right: 10,
            bottom: 10,
            left: 10
        },
            width = 960,
            height = 500,
            diameter = 900,
            drawWidth = width - margin.left - margin.right,
            drawHeight = height - margin.top - margin.bottom,
            measure = 'Happiness_Rank'; // variable to visualize

        // Append an svg element and a g element (to the svg) to main div, vis (to render circle elements).
        // Make sure to set the width and height of your svg as the diameter variable
        var svg = d3.select("#vis")
            .append('svg')
            .attr('height', diameter)
            .attr('width', diameter)
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");
        g = svg.append("g")

        /* ********************************** Create hierarchical data structure & treemap function  ********************************** */

        // Nest your data *by region* using d3.nest()
        var nestedData = d3.nest()
            .key(function (d) {
                return d.Region; // do my region so that the circles are arranged by region
            })
            .entries(data);

        // Define a hierarchy for your data
        var root = d3.hierarchy({
            values: nestedData // are the countries pertaining to that region
        }, function (d) {
            return d.values;
        })
            .sort(function (a, b) { // sort root data
                return b.value - a.value;
            });

        // Create a pack layout function returned by the d3.pack() function.
        // This will compute a pack layout instead of a treemap layout.
        // Make sure to use the .size method of pack object to set the size (width and height)
        // Both should be set to your diameter variable, passed into the .size method as a two-element array.
        var pack = d3.pack()
            .size([diameter, diameter])
            .padding(2);

        /* ********************************** Create an ordinal color scale  ********************************** */

        // Get list of regions for colors
        var regions = nestedData.map(function (d) {
            return d.values.Region;
        });

        // Set an ordinal scale for colors
        var colorScale = d3.scaleOrdinal().domain(regions).range(d3.schemeCategory10);

        /* ********************************** Write a function to perform the data-join  ********************************** */

        // Write your `draw` function to bind data, and position elements
        var draw = function () {
            // Redefine which value you want to visualize in your data by using the `.sum()` method
            root
                .sum(function (d) {
                    return +d[measure];
                })

            var tip = d3.tip()
                .attr("class", "d3-tip")
                .offset([30, 0])
                // .html(function (d) { return d.data.Country + " " + d.data.measure });
                .html(function (d) { return d.data.Country});

                //* Couldn't figure out how to display the actual scores to change when the buttons are switched */
                // if (measure === 'Happiness_Score') {
                //     tip.html(function (d) { return d.data.Country + " " + d.data.Happiness_Score });
                // } else if (measure === 'Economy') {
                //     tip.html(function (d) { return d.data.Country + " " + d.data.Economy });
                // } else {
                //     tip.html(function (d) { return d.data.Country + " " + d.data.Trust });
                // }
                
            g.call(tip);

            // (Re)build your treemap data structure by passing your `root` to `pack` function
            pack(root);

            // Bind data to a selection of elements with class node
            // The data that you want to join is array of elements returned by `root.leaves()`
            var nodes = g.selectAll("circle").data(root.leaves());

            // Rather than append div elements, append circle elements to g "the nodes var". 
            // Position the circles, using the x, y, and r variables computed by the pack layout.
            nodes.enter().append("circle")
                .attr("class", "node")
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .merge(nodes)
                .transition().duration(1500)
                .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
                .attr("r", function (d) { return d.r; })
                .style("fill", function (d) { return colorScale(d.data.Region); })

            // Legend stuff
            var svg = d3.select("svg");

            svg.append("g")
                .attr("class", "legendOrdinal")
                .attr("transform", "translate(0,0)");

            var legendOrdinal = d3.legendColor()
                .shapeWidth(20)
                .orient('vertical')
                .scale(colorScale); //ordinal

            svg.select(".legendOrdinal")
                .call(legendOrdinal);
        };

        // Call your draw function
        draw();

        // Listen to change events on the input elements
        $("input").on('change', function () {
            // Set your measure variable to the value (which is used in the draw funciton)
            measure = $(this).val();

            // Draw your elements
            draw();
        });
    });
});