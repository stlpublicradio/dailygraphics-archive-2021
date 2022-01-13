var pym = require("./lib/pym");
var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");
var { isMobile } = require("./lib/breakpoints");

var colors = require("./lib/helpers/colors");

var d3 = {
    ...require("d3-array/dist/d3-array.min"),
    ...require("d3-axis/dist/d3-axis.min"),
    ...require("d3-scale/dist/d3-scale.min"),
    ...require("d3-scale-chromatic/dist/d3-scale-chromatic.min"),
    ...require("d3-color/dist/d3-color.min"),
    ...require("d3-selection/dist/d3-selection.min"),
    ...require("d3-fetch/dist/d3-fetch.min"),
    ...require("d3-interpolate/dist/d3-interpolate.min"),
};

var pymChild = null;
pym.then(function (child) {
    pymChild = child;
    child.sendHeight();
    window.addEventListener("resize", render);
});

var render = function () {
    var containerElement = document.querySelector(".graphic");
    //remove fallback
    containerElement.innerHTML = "";
    var containerWidth = containerElement.offsetWidth;

    var container = d3.select(containerElement);
    container.append("div").attr("class", "scale");

    var svg = container
        .append("svg")
        .attr("class", "graphic")
        .attr("height", 600)
        .attr("width", containerWidth);

    data = d3.json("data.json").then((data) => {
        var result = [];

        for (var i in data) result.push([i, data[i]]);

        var years = [];
        for (var i in result) years.push(result[i][0].slice(0, 4));

        years = [...new Set(years)];

        var months = [];
        for (var i in result) months.push(result[i][0].slice(-2));

        months = [...new Set(months)];

        var totals = [];
        for (var i in result)
            totals.push(+result[i][1].Illinois + +result[i][1].Missouri);

        var min = d3.min(totals);
        var max = d3.max(totals);
        var median = d3.median(totals);

        var monthLookup = {
            "01": "J",
            "02": "F",
            "03": "M",
            "04": "A",
            "05": "M",
            "06": "J",
            "07": "J",
            "08": "A",
            "09": "S",
            10: "O",
            11: "N",
            12: "D",
        };

        var padding = { top: 20, left: 40, right: 0 };
        var box_size = { width: 20, height: 5 };
        var height = 600;

        var color_scale = d3
            .scaleLinear()
            .domain([0, max])
            .range(["#fff", colors.red]);

        var x_scale = d3
            .scaleBand()
            .domain(months)
            .range([0, containerWidth - padding.left - padding.right]);

        var y_scale = d3
            .scaleBand()
            .domain(years)
            .range([0, height - padding.top]);

        var xAxis = (svg) =>
            svg
                .attr("transform", `translate(${padding.left},${padding.top})`)
                .attr("fill", "#000")
                .call(d3.axisTop(x_scale).tickFormat((d) => monthLookup[d]))
                .call((g) => g.select(".domain").remove());

        var yAxis = (svg) =>
            svg
                .attr(
                    "transform",
                    `translate(` + padding.left + `,` + padding.top + `)`
                )
                .attr("fill", "#000")
                .call(
                    d3
                        .axisLeft(y_scale)
                        .tickValues(
                            y_scale.domain().filter((e, i) => i % 5 == 0)
                        )
                )
                .call((g) => g.select(".domain").remove());

        svg.append("g")
            .attr(
                "transform",
                `translate(${padding.left + 5},${padding.top + 2})`
            )
            .selectAll("circle")
            .data(result)
            .join("rect")
            .attr("height", box_size.height)
            .attr("width", box_size.width)
            .attr("x", (d) => x_scale(d[0].slice(-2)))
            .attr("y", (d) => y_scale(d[0].slice(0, 4)))
            .attr("fill", (d) => color_scale(+d[1].Illinois + +d[1].Missouri))
            .attr("stroke", "#efefef")
            .attr("stroke-opacity", 0.3);

        svg.append("g").call(yAxis).selectAll("text").attr("fill", "#aaa");
        svg.append("g").call(xAxis).selectAll("text").attr("fill", "#aaa");

        var colorScale = d3
            .scaleLinear()
            .domain([min, max])
            .range(["#fff", colors.red]);

        var numberScale = d3
            .scaleLinear()
            .domain([min, max])
            .range([0, containerWidth]);

        function swatches(colors) {
            d3.append("g");
            //   return html`${colors.map(c => `<div title="${c}" style="
            //   display: inline-block;
            //   margin-right: 3px;
            //   width: 33px;
            //   height: 33px;
            //   background: ${c};
            // "></div>`)}`;
        }

        var key_box_width = 50;
        key_boxes = Math.floor(containerWidth / key_box_width);

        boxes_vals = numberScale.ticks(containerWidth / key_box_width);

        // var color = d3.quantize(d3.interpolate("#fff",colors.red),key_boxes);

        d3.select(".scale")
            .selectAll("div")
            .data(boxes_vals)
            .enter()
            .append("div")
            .style("width", containerWidth / boxes_vals.length + "px")
            .style("height", "20px")
            .style("float", "left")
            .attr("class",function(d) {return "val-" + d})
            .style("background-color", function (d) {
                console.log(colorScale(d));
                return colorScale(d);
            })
            .text(function (d) {
                return d;
            });

        // var keyAxis = (svg) =>
        //     svg
        //         .attr("transform", `translate(10,${padding.top})`)
        //         .attr("fill", "#000")
        //         .call(d3.axisBottom(numberScale))
        //         .call((g) => g.select(".domain").remove());

        // scale = d3
        //     .select(".scale")
        //     .append("g")
        //     .call(ramp(numberScale, color))
        //     .call(keyAxis);
    });

    if (pymChild) {
        pymChild.sendHeight();
    }
};

//first render
render();
