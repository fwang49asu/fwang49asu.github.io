function Pie(field, divStr) {
    var self = this;
    this.duration = 750;
    var width = $(divStr).width();
    var height = $(divStr).height();
    this.fill = d3.scale.category10();
    this.radius = Math.min(width, height) / 2;
    this.svg = d3.select(divStr).append('svg')
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width/2 + "," + height/2 + ")");
    this.field = field;
    this.arc = d3.svg.arc().outerRadius(self.radius).innerRadius(0);
    this.pie = d3.layout.pie().sort(null).value(function(d) {return d.value;});
    this.formatPercent = d3.format(".1%");
    this.refresh();
    this.currentSelection = null;
}

Pie.prototype.refresh = function() {
    var self = this;
    var data = STATE.cf[self.field]
                .group()
                .reduceSum(function(d) {return d.count;})
                .order(function(d) {return d[self.field]}).top(Infinity);
    var sum = 0;
    for(var i in data) {
        sum += data[i].value;
    }

    data = self.pie(data);

    var gData =  self.svg.selectAll(".arc").data(data);
    var g = gData.enter().append("g")
            .attr("class", "arc");

    var gPath = g.append("path")
        .attr("d", self.arc)
        .style("fill", function(d, i) {return self.fill(i);})
        .style("opacity", function(d, i) {
            if(null == self.currentSelection) {
                return 1;
            }
            return self.currentSelection == d.data.key ? 1 : 0.4;
        });
    gPath.on("click", self.onclick(self.field));
    gPath.append("title").text(function(d, i) {
        return d.data.key + "\n" + self.formatPercent(d.data.value / sum)
    });

    g.append("text")
        .attr("transform", function(d) {return "translate(" + self.arc.centroid(d) + ")";})
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("font-size", "12px")
        .text(function(d) {return d.data.key;});
    
    gData.exit().select("path").remove();
    gData.exit().transition().duration(self.duration).style("opacity", 0).remove();

    self.svg.selectAll(".arc path").data(data).transition().duration(self.duration)
        .attr("d", self.arc)
        .style("opacity", function(d, i) {
            if(null == self.currentSelection) {
                return 1;
            }
            return self.currentSelection == d.data.key ? 1 : 0.4;
        })
        .style("fill", function(d, i) {return self.fill(i);})
        .style("opacity", function(d, i) {
            if(null == self.currentSelection) {
                return 1;
            }
            return self.currentSelection == d.data.key ? 1 : 0.4;
        })
        .select("title").text(function(d, i) {
            return d.data.key + "\n" + self.formatPercent(d.data.value / sum);
        });

    self.svg.selectAll(".arc text")
        .data(data).transition().duration(self.duration)
        .attr("transform", function(d) {return "translate(" + self.arc.centroid(d) + ")";})
        .text(function(d) {return d.data.key;});
}

Pie.prototype.onclick = function(field) {
    var self = this;
    var dimension = STATE.cf[field];
    return function(d, i) {
        self.currentSelection = (self.currentSelection == d.data.key) ? null : d.data.key;
        var data = STATE.cf[self.field].filter(self.currentSelection).top(Infinity);
        updateAllViews();
    }
}

