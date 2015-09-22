function majorLegend(group) {
    var itemHeight = 14;
    var padding = 4;

    var item = group.selectAll(".MajorLegendItem").data(STATE.majorNames)
                .enter().append("g")
                .attr("class", "MajorLegendItem")
                .attr("transform", function(d, i) {
                    return "translate(" + padding/2 + "," + (i*(itemHeight + 2*padding) + padding) + ")";
                });

    item.append("rect")
        .attr("width", itemHeight)
        .attr("height", itemHeight)
        .style("fill", function(d, i) {return STATE.majorFill(i);})
        .style("stroke", "white");

    item.append("text")
        .attr("x", itemHeight + padding/2)
        .attr("y", itemHeight-2)
        .attr("text-anchor", "start")
        .attr("font-size", itemHeight + "px")
        .attr("font-family", "Roboto")
        .attr("fill", "black")
        .text(function(d, i) {return STATE.majorNames[i];});
}
