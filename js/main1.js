// Wait for DOM to finish loading
$(function () {
    // Load in csv file (in data directory) using Plotly's csv function (refer to USA Bubble Map example)
    d3.queue()
        .defer(d3.csv, 'data/parks.csv')
        .defer(d3.csv, 'data/species.csv')
        .await(theData);

    function theData(error, parks, species) {
        if (error) {
            console.error('There is an error' + error);
        }
        else {
            // Margin: how much space to put in the SVG for axes/titles
            var margin = {
                left: 70,
                bottom: 220,
                top: 50,
                right: 50
            };

            // Height and width of the total area
            var height = 600;
            var width = 1000;

            // Height/width of the drawing area for data symbols
            var drawHeight = height - margin.bottom - margin.top;
            var drawWidth = width - margin.left - margin.right;

            /************************************** Create chart wrappers ***************************************/
            // Select SVG to work with, setting width and height (the vis <div> is defined in the index.html file)
            var svg = d3.select('#vis')
                .append('svg')
                .attr('height', height)
                .attr('width', width);

            // Append a 'g' element in which to place the rects, shifted down and right from the top left corner
            var g = svg.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .attr('height', drawHeight)
                .attr('width', drawWidth);


            /************************************** Data prep ***************************************/

            // You'll need to *aggregate* the data such that, for each device-app combo, you have the *count* of the number of occurances
            // Lots of ways to do it, but here's a slick d3 approach: 
            // http://www.d3noob.org/2014/02/grouping-and-summing-data-using-d3nest.html

            var parkSize = d3.nest()
                .key(function (d) {
                    return d.Park_Name;
                })
                // .value(function (d) {
                //     console.log(JSON.stringify(parkSize));
                //     return d.Acres;
                // })
                .entries(parks);
            console.log(JSON.stringify(parkSize));

            var parksData = d3.nest()
                .key(function (d) {
                    //console.log(d.Park_Name)
                    return d.Park_Name;
                })
                .rollup(function (v) { return v.length; })
                .entries(species);
            //console.log(JSON.stringify(parksData));


            // var stackedData = d3.csv('data/species.csv', )

            /************************************** Defining scales and axes ***************************************/

            // Append an xaxis label to your SVG, specifying the 'transform' attribute to position it (don't call the axis function yet)
            var xAxisLabel = svg.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + (drawHeight + margin.top) + ')')
                .attr('class', 'axis');

            // Append a yaxis label to your SVG, specifying the 'transform' attribute to position it (don't call the axis function yet)
            var yAxisLabel = svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')');

            // Append text to label the y axis (don't specify the text yet)
            var xAxisText = svg.append('text')
                .attr('transform', 'translate(' + (margin.left + drawWidth / 2) + ',' + (drawHeight + margin.top + 220) + ')')
                .attr('class', 'title');

            // Append text to label the y axis (don't specify the text yet)
            var yAxisText = svg.append('text')
                .attr('transform', 'translate(' + (margin.left - 40) + ',' + (margin.top + drawHeight / 2) + ') rotate(-90)')
                .attr('class', 'title');

            // Define xAxis using d3.axisBottom(). Scale will be set in the setAxes function.
            var xAxis = d3.axisBottom();

            // Define yAxis using d3.axisLeft(). Scale will be set in the setAxes function.
            var yAxis = d3.axisLeft()
                .tickFormat(d3.format('.2s'));

            // Define an xScale with d3.scaleBand. Domain/rage will be set in the setScales function.
            var xScale = d3.scaleBand();

            // Define a yScale with d3.scaleLinear. Domain/rage will be set in the setScales function.
            var yScale = d3.scaleLinear();


            // Write a function for setting scales.
            // var setScales = function (data) {
            //     // Get the unique values of states for the domain of your x scale
            //     var parks = data.map(function (d) {
            //         console.log(JSON.stringify(d.Park_Name))
            //         return d.Park_Name;
            //     });

            var setScales = function () {
                // Get the unique values of states for the domain of your x scale
                // var parks = data.map(function (d) {
                //     console.log(JSON.stringify(d.Park_Name))
                //     return d.Park_Name;
                // });

                // Set the domain/range of your xScale
                xScale.range([0, drawWidth])
                    .padding(0.1)
                    // .domain(parks);
                    //.domain(parks)
                    .domain(parksData.map(function (d) { return d.key; }));

                // Get min/max values of the percent data (for your yScale domain)
                var yMin = d3.min(parksData, function (d) {
                    return +d.value;
                });

                var yMax = d3.max(parksData, function (d) {
                    return +d.value;
                });

                // Set the domain/range of your yScale
                yScale.range([drawHeight, 0])
                    // .domain([0, yMax]);
                    //.range([drawHeight, 0])
                    .domain([0, yMax]);
            };

            // Function for setting axes
            var setAxes = function () {
                // Set the scale of your xAxis object
                xAxis.scale(xScale);

                // Set the scale of your yAxis object
                yAxis.scale(yScale);

                // Render (call) your xAxis in your xAxisLabel
                xAxisLabel.transition().duration(1500).call(xAxis)
                    .selectAll("text")
                    .attr("y", 5)
                    .attr("x", 9)
                    .attr("dy", ".35em")
                    .attr("transform", "rotate(65)")
                    .style("text-anchor", "start");

                // Render (call) your yAxis in your yAxisLabel
                yAxisLabel.transition().duration(1500).call(yAxis);

                // Update xAxisText and yAxisText labels
                xAxisText.text('National Park');
                yAxisText.text('Number of species');
            }

            // Add tip
            var tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
                //console.log(d.key)
                return d.value;
            });
            g.call(tip);

            // function handleMouseOver(d,i) {
            //     tip.show;

            //     d3.select(this).attr({
            //         fill: "orange"
            //     });
            // }


            var draw = function (data) {
                // Set scales
                //setScales(data);
                setScales();

                // Set axes
                setAxes();

                // Select all rects and bind data
                var bars = g.selectAll('rect').data(data);

                // Use the .enter() method to get your entering elements, and assign initial positions
                bars.enter().append('rect')
                    .attr('x', function (d) {
                        return xScale(d.key);
                    })
                    .attr('y', function (d) {
                        return drawHeight;
                    })
                    .attr('height', 0)
                    .attr('class', 'bar')
                    .attr('fill', 'green')
                    .on('mouseover', tip.show)
                    // .on('mouseover', handleMouseOver)
                    .on('mouseout', tip.hide)
                    .attr('width', xScale.bandwidth())
                    .merge(bars)
                    .transition()
                    .duration(500)
                    .delay(function (d, i) {
                        return i * 50;
                    })
                    .attr('y', function (d) {
                        return yScale(d.value);
                    })
                    .attr('height', function (d) {
                        return drawHeight - yScale(d.value);
                    });

                // Use the .exit() and .remove() methods to remove elements that are no longer in the data
                bars.exit().remove();
            };

            // Assign a change event to input elements to set the sex/type values, then filter and update the data
            // $("input").on('change', function () {
            //     // Get value, determine if it is the sex or type controller
            //     var val = $(this).val();
            //     var isSex = $(this).hasClass('sex');
            //     if (isSex) sex = val;
            //     else type = val;

            //     // Filter data, update chart
            //     var currentData = filterData();
            //     draw(currentData);
            // });

            // // Filter data to the current settings then draw
            // var currentData = filterData();
            // draw(currentData);

            draw(parksData);

        }

        // // Parse your loaded data for your graph:
        // var processFiles = function () {


        //     function unpack(rows, key) {
        //         return rows.map(function (row) { return row[key]; });
        //     }

        //     var bacteriaName = unpack(rows, 'Bacteria'),
        //         penicilinVal = unpack(rows, 'Penicilin'),
        //         streptomycinVal = unpack(rows, 'Streptomycin'),
        //         neomycinVal = unpack(rows, 'Neomycin'),
        //         gramStaining = unpack(rows, 'Gram.Staining'),

        //         bacteria = [], // hold bacteria name
        //         penicilin = [], // hold penicilin value
        //         streptomycin = [], // hold streptomycin value
        //         neomycin = [], // hold neomycin value
        //         stain = [], // hold positive or negative
        //         antibioticNames = ['Penicilin', 'Streptomycin', 'Neomycin'];

        //     for (var i = 0; i < bacteriaName.length; i++) {
        //         bacteria.push(bacteriaName[i]);
        //         penicilin.push(Math.log10(penicilinVal[i]) + 3);
        //         streptomycin.push(Math.log10(streptomycinVal[i]) + 3);
        //         neomycin.push(Math.log10(neomycinVal[i]) + 3);
        //         stain.push(gramStaining[i]);
        //     }

        // }

        // // Grouped bar chart: each bacteria will have three bars showing how much of each antibiotic's MIC is required
        // var grouped1 = {
        //     x: bacteria,
        //     y: penicilin,
        //     name: 'Penicilin',
        //     type: 'bar',

        //     mode: 'lines+markers+text',
        //     text: bacteria,
        //     textposition: 'bottom',
        // };

        // var grouped2 = {
        //     x: bacteria,
        //     y: streptomycin,
        //     name: 'Streptomycin',
        //     type: 'bar',
        // };

        // var grouped3 = {
        //     x: bacteria,
        //     y: neomycin,
        //     name: 'Neomycin',
        //     type: 'bar',
        // };

        // var dataOne = [grouped1, grouped2, grouped3];

        // var layoutOne = {
        //     title: 'MIC of Antibiotics for Bacteria with scale of (log10(x)+3)',
        //     barmode: 'group',
        //     // annotations: [{
        //     //     x: ["Aerobacter aerogenes", "Brucella abortus"],
        //     //     y: 0,
        //     //     // xref: 'x',
        //     //     // yref: 'y',
        //     //     text: ['positive','positive'],
        //     //     showarrow: true,
        //     //     font: {
        //     //         family: 'Courier New, monospace',
        //     //         size: 16,
        //     //         color: '#000'
        //     //     }
        //     // }],
        //     margin: {
        //         b: 120,
        //     }
        // };

        // // Scatter plot:
        // var scatter1 = { // negative
        //     x: bacteria,
        //     y: ["negative", "negative", , , "negative", "negative", "negative", "negative",
        //         "negative", "negative", "negative", , , , ,],
        //     mode: 'markers',
        //     type: 'scatter',
        //     marker: {
        //         size: 10,
        //         sizeref: 0.01,
        //         sizemode: 'area',
        //         color: 'red',
        //     }
        // };

        // var scatter2 = { // positive
        //     x: bacteria,
        //     y: [, , "positive", "positive", , , , ,
        //         , , , "positive", "positive", "positive", "positive", "positive"],
        //     mode: 'markers',
        //     type: 'scatter',
        //     marker: {
        //         size: 10,
        //         sizeref: 0.01,
        //         sizemode: 'area',
        //         color: 'blue',
        //     }
        // };

        // var dataTwo = [scatter1, scatter2];
        // var layoutTwo = {
        //     //autosize: true,
        //     height: 300,
        //     boxmode: 'group',
        //     showlegend: false,
        //     margin: {
        //         b: 120,
        //     },
        //     title: 'Identifying the Bacteria that are Gram-positive or Gram-negative',
        // };

        // // Bubble map chart:
        // var bubble1 = {
        //     x: bacteria,
        //     y: penicilin,
        //     mode: 'markers',
        //     type: 'scatter',
        //     name: 'Penicilin',
        //     marker: {
        //         size: penicilin,
        //         //size: 10,
        //         sizeref: 0.01,
        //         sizemode: 'area',
        //     }
        // };

        // var bubble2 = {
        //     x: bacteria,
        //     y: streptomycin,
        //     mode: 'markers',
        //     type: 'scatter',
        //     name: 'Streptomycin',
        //     marker: {
        //         size: streptomycin,
        //         //size: 10,
        //         sizeref: 0.01,
        //         sizemode: 'area',
        //     }
        // };

        // var bubble3 = {
        //     x: bacteria,
        //     y: neomycin,
        //     mode: 'markers',
        //     type: 'scatter',
        //     name: 'Neomycin',
        //     marker: {
        //         size: neomycin,
        //         //size: 10,
        //         sizeref: 0.01,
        //         sizemode: 'area',
        //     }
        // };

        // var dataThree = [bubble1, bubble2, bubble3];

        // var layoutThree = {
        //     title: 'Identifying the effective antibiotic with scale of (log10(x)+3)',
        //     margin: {
        //         b: 120,
        //     },
        // };

        // // Call Plotly's newPlot function to draw the graphs
        // Plotly.newPlot('firstViz', dataOne, layoutOne, { staticPlot: true });
        // Plotly.newPlot('secondViz', dataTwo, layoutTwo, { staticPlot: true });
        // Plotly.newPlot('thirdViz', dataThree, layoutThree, { staticPlot: true });
        //});

    }
});
