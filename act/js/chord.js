/* 
 * This class is not perfect: the groups cannot change
 * 
 */

function ChordVis(data, chordDivStr, legendDivStr, connectionDivStr) {
    var self = this;
    self.data = data;
    this.currentSelection = null;
    this.duration = 750;
    this.formatPercent = d3.format(".1%");
    this.chordDivStr = chordDivStr;
    this.legendDivStr = legendDivStr;
    this.connectionDivStr = connectionDivStr;
    this.fill = d3.scale.category20();
    this.height = $(chordDivStr).height();
    this.width = $(chordDivStr).width();
    this.chordSize = Math.min(self.height, self.width);
    this.outerRadius = self.chordSize / 2;
    this.arcWidth = 24;
    this.innerRadius = self.outerRadius - self.arcWidth;

    this.chord = d3.layout.chord().padding(0.04);
    this.chordPath = d3.svg.chord().radius(self.innerRadius);
    this.arc = d3.svg.arc()
                .startAngle(function(d) {return d.startAngle;})
                .endAngle(function(d) {return d.endAngle;})
                .innerRadius(self.innerRadius)
                .outerRadius(self.outerRadius);
    this.svg = d3.select(chordDivStr).append("svg")
                .attr("width", self.width)
                .attr("height", self.height)
                .append("g")
                .attr("transform", "translate(" + this.width/2 + "," + this.height/2 + ")");
    
    this.matrix = [];
    self.chord.matrix(self.matrix);
    this.source = STATE.grades[0];
    this.sourceIndex = 0;
    this.target = STATE.grades[1];
    this.targetIndex = 1;

    self.matrix = self.extractMatrix();
    self.chord = self.chord.matrix(self.matrix);
    self.updateChordMap();

    var gData = self.svg.selectAll(".group")
        .data(self.chord.groups);

    var gPath = gData.enter()
        .append("g").attr("class", "group")
        .append("path")
        .attr("id", function(d, i) {return "arcGroup" + i})
        .style("fill", function(d) {return self.fill(d.index)})
        .style("stroke", function(d) {return self.fill(d.index)})
        .attr("d", self.arc);
    gPath.on("mouseover", self.mouseover())
        .on("mouseout", self.reset())
        .on("click", self.onclick());

    gPath.append("title").text(function(d, i) {
        return self.formatPercent(d.value) + " from " + STATE.majorNames[i];
    });

    var groupText = gData.append("text")
        .attr("x", 6)
        .attr("dy", 15);

    groupText.append("textPath")
        .attr("id", function(d, i){return "groupTextPath" + i;})
        .attr("xlink:href", function(d, i) {return "#arcGroup" + i;})
        .text(function(d, i) {return STATE.majorNames[i]})
        .attr("fill-opacity", function(d, i) {
            return ((gPath[0][i].getTotalLength() / 2 - 30) < this.getComputedTextLength()) ? 0 : 1;
        })

    gData.exit().select("path").remove();
    gData.exit().transition().duration(self.duration).style("opacity", 0).remove();

    self.lastChord = self.chord;
    this.refresh();
    this.drawLegend();
    this.drawConnection();
}

ChordVis.prototype.extractMatrix = function() {
    var self = this;
    var n = STATE.majorNames.length;
    var result = [];
    for(var i = 0; i<n; ++i) {
        result[i] = [];
        for(var k=0; k<n; ++k) {
            result[i][k] = 0;
        }
    }
    var sourceIndexStr = self.source + "_index";
    var targetIndexStr = self.target + "_index";
    var sum = 0;

    for(var i in this.data) {
        var d = this.data[i];
        var sourceIndex = d[sourceIndexStr];
        var targetIndex = d[targetIndexStr];

        result[sourceIndex][targetIndex] += d.count;
        sum += d.count;
    };

    // normalize
    for(var i=0; i<n; ++i) {
        for(var k=0; k<n; ++k) {
            result[i][k] /= sum;
        }
    }

    return result;
}

ChordVis.prototype.refresh = function() {
    var self = this;
    self.matrix = self.extractMatrix();
    self.chord = self.chord.matrix(self.matrix);
    self.updateChordMap();

    self.svg.selectAll(".group path")
        .data(self.chord.groups)
        .transition()
        .duration(self.duration)
        .attr("d", self.arc)
        .each("end", function(d, i) {
            var path = this;
            self.svg.select("#groupTextPath" + i).transition()
                .attr("fill-opacity", function(d, i) {
                    return ((path.getTotalLength() / 2 - 30) < this.getComputedTextLength()) ? 0 : 1;
                })
        }).select("title").text(function(d, i) {
            return self.formatPercent(d.value) + " from " + STATE.majorNames[i];
        });

    self.svg.selectAll(".chord")
        .data(self.chord.chords)
        .transition()
        .duration(self.duration)
        .attrTween("d", self.chordTween(self.lastChord))
        .style("stroke", function(d) {return d3.rgb(self.fill(d.source.index)).darker();})
        .style("fill", function(d) {return self.fill(d.source.index);})
        .style("opacity", function(d, i) {
            if(null == self.currentSelection) {
                return 1;
            }
            if(d.source.index == self.currentSelection || d.target.index == self.currentSelection) {
                return 1;
            }
            return 0.1;
        })
        .select("title").text(function(d) {
            return STATE.majorNames[d.source.index] + " \u2192 " + STATE.majorNames[d.target.index] + ":  " + self.formatPercent(d.source.value) + "\n"
                + STATE.majorNames[d.target.index] + " \u2192 " + STATE.majorNames[d.source.index] + ":  " + self.formatPercent(d.target.value)
        });

    self.svg.selectAll(".chord")
        .data(self.chord.chords)
        .exit()
        .transition()
        .duration(self.duration)
        .attr("opacity", 0)
        .remove();

     self.svg.selectAll(".chord")
        .data(self.chord.chords)
        .enter()
        .append("path")
        .attr("class", "chord")
        .style("stroke", function(d) {return d3.rgb(self.fill(d.source.index)).darker();})
        .style("fill", function(d) {return self.fill(d.source.index);})
        .attr("d", self.chordPath)
        .append("title").text(function(d) {
            return STATE.majorNames[d.source.index] + " \u2192 " + STATE.majorNames[d.target.index] + ":  " + self.formatPercent(d.source.value) + "\n"
                + STATE.majorNames[d.target.index] + " \u2192 " + STATE.majorNames[d.source.index] + ":  " + self.formatPercent(d.target.value)
        });

    self.lastChord = self.chord;
}

ChordVis.prototype.chordKey = function(d) {
    var sid = d.source.index;
    var tid = d.target.index;
    if(sid > tid) {
        var temp = sid;
        sid = tid;
        tid = temp;
    }
    return sid + "-" + tid;
}

ChordVis.prototype.updateChordMap = function() {
    var self = this;
    self.chord.chordMap = new d3.map();
    self.chord.chords().forEach(function(d, i) {
        self.chord.chordMap.set(self.chordKey(d), i);
    });
}

ChordVis.prototype.chordTween = function(lastChord) {
    var self = this;
    return function(d, i) {
        var tween;
        var last;
        if(lastChord.chordMap.has(self.chordKey(d))) {
            last = lastChord.chords()[lastChord.chordMap.get(self.chordKey(d))];
            if(d.sourceIndex != last.source.index) {
                last = {
                    source: last.target,
                    target: last.source
                };
            }

            tween = d3.interpolate(last, d);
        } else {
            var emptyChord = {
                source: {
                    index: d.source.index,
                    subindex: d.source.index,
                    startAngle: d.source.startAngle,
                    endAngle: d.source.startAngle
                },
                target: {
                    index: d.target.index,
                    subindex: d.target.index,
                    startAngle: d.target.startAngle,
                    endAngle: d.target.startAngle
                }
            };
            tween = d3.interpolate(emptyChord, d);
        }

        return function(t) {
            return self.chordPath(tween(t));
        }
    }
}

ChordVis.prototype.drawLegend = function() {
    var self = this;

    var width = $(self.legendDivStr).width();
    var height = $(self.legendDivStr).height();
    var svg = d3.select(self.legendDivStr).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    var n = STATE.majorNames.length;
    var padding = 2;
    var itemHeight = height / n;
    
    var legendData = svg.selectAll(".LegendItem").data(STATE.majorNames);
    var item = legendData.enter().append("g").attr("class", "LegendItem");
    item.attr("transform", function(d, i) {return "translate(0," + (itemHeight * i) + ")";});
    item.append("rect")
        .attr("width", itemHeight - padding*2)
        .attr("height", itemHeight - padding*2)
        .attr("fill", (function(d,i) {return self.fill(i)}))
        .style("opacity", function(d, i) {
            if(null == self.currentSelection) {
                return 1;
            }
            if(i == self.currentSelection) {
                return 1;
            }
            return 0.4;
        })
        .on("mouseover", self.mouseover())
        .on("mouseout", self.reset())
        .on("click", self.onclick());

    item.append("text")
        .attr("x", itemHeight)
        .attr("y", itemHeight/2 - padding)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) {return d;});
    legendData.exit().select("path").remove();
    legendData.exit().transition().duration(self.duration).style("opacity", 0).remove();
}

ChordVis.prototype.drawConnection = function() {
    var self = this;
    
    var width = $(self.connectionDivStr).width();
    var height = $(self.connectionDivStr).height();
    var svg = d3.select(self.connectionDivStr).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    var data = STATE.grades;
    var n = data.length;
    var width = $(self.connectionDivStr).width();
    var height = $(self.connectionDivStr).height();
    var padding = 2;
    
    var itemHeight = height / n;
    var itemWidth = width / 3;
    var rectData = svg.selectAll(".ConnectionSource").data(data);
    var item = rectData.enter().append("g").attr("class", "ConnectionSource");
    item.attr("transform", function(d, i) {return "translate(" + padding + "," + (itemHeight * i + padding) + ")";});
    item.append("rect")
        .attr("id", function(d, i){return "connectionSourceRect" + i;})
        .attr("width", itemWidth - padding*2)
        .attr("height", itemHeight - padding*2)
        .attr("rx", 10)
        .attr("rx", 10)
        .attr("class", function(d, i) {return self.source == d ? "ConnectionRectSelected" : "ConnectionRect"})
        .on("mouseover", function(d, i) {
            d3.select(this)
                .attr("class", "ConnectionRectHover");
            d3.select("#sourceText" + i)
                .attr("class", "ConnectionTextHover");
        })
        .on("mouseout", function(d, i) {
            d3.select(this)
                .attr("class", function() {return d == self.source ? "ConnectionRectSelected": "ConnectionRect";});

            d3.select("#connectionSourceText" + i)
                .attr("class", function() {return d == self.source ? "ConnectionTextSelected" : "ConnectionText";});
        })
        .on("click", self.connect(svg, "source"));

    item.append("text")
        .attr("id", function(d, i) {return "connectionSourceText" + i;})
        .attr("x", itemWidth/2 - padding)
        .attr("y", itemHeight/2 - padding)
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("class", function(d, i) {return d == self.source ? "ConnectionTextSelected" : "ConnectionText";})
        .text(function(d, i) {return d;});

    rectData = svg.selectAll(".ConnectionTarget").data(data);
    item = rectData.enter().append("g").attr("class", "ConnectionTarget");
    item.attr("transform", function(d, i) {return "translate(" + (itemWidth * 2 + padding) + "," + (itemHeight * i + padding) + ")";});
    item.append("rect")
        .attr("id", function(d, i) {return "connectTargetRect" + i;})
        .attr("width", itemWidth - padding*2)
        .attr("height", itemHeight - padding*2)
        .attr("rx", 10)
        .attr("rx", 10)
        .attr("class", function(d, i) {return self.target == d ? "ConnectionRectSelected" : "ConnectionRect"})
        .on("mouseover", function(d, i) {
            d3.select(this)
                .attr("class", "ConnectionRectHover");
            d3.select("#connectionTargetText" + i)
                .attr("class", "ConnectionTextHover");
        })
        .on("mouseout", function(d, i) {
            d3.select(this)
                .attr("class", function() {return d == self.target ? "ConnectionRectSelected": "ConnectionRect";});

            d3.select("#connectionTargetText" + i)
                .attr("class", function() {return d == self.target ? "ConnectionTextSelected" : "ConnectionText";});
        })
        .on("click", self.connect(svg, "target"));
;

    item.append("text")
        .attr("id", function(d, i) {return "connectionTargetText" + i;})
        .attr("x", itemWidth/2 - padding)
        .attr("y", itemHeight/2 - padding)
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("class", function(d, i) {return d == self.target ? "ConnectionTextSelected" : "ConnectionText";})
        .text(function(d, i) {return d;});

    // the line
    // build the arrow.
    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    var line = d3.svg.line()
                 .x( function(point) { return point.x; })
                 .y( function(point) { return point.y; });
    var lineData = [{x: itemWidth - padding, y: itemHeight * self.sourceIndex + itemHeight / 2},
                {x: itemWidth*2 + padding, y: itemHeight * self.targetIndex + itemHeight / 2}];

    svg.append("path")
        .data(lineData)
        .attr("class", "line")
        .attr("class", "ConnectionLine")
        .attr("d", line(lineData));
}

ChordVis.prototype.mouseover = function() {
    var self = this;
    return function(a, i) {
        self.svg.selectAll(".chord")
            .filter(function(d) {
                return d.source.index != i && d.target.index != i;
            }).transition()
            .style("opacity", 0.1);
        self.svg.selectAll(".chord")
            .filter(function(d) {
                return d.source.index == i || d.target.index == i;
            }).transition()
            .style("opacity", 1);
    };
}

ChordVis.prototype.reset = function() {
    var self = this;
    return function(a, i) {
        self.svg.selectAll(".chord")
            .transition()
            .style("opacity", function(d, i) {
                if(null == self.currentSelection) {
                    return 1;
                }
                if(d.source.index == self.currentSelection || d.target.index == self.currentSelection) {
                    return 1;
                }
                return 0.1;
            });
    }
}

ChordVis.prototype.onclick = function() {
    var self = this;
    return function(d, i) {
        self.currentSelection = self.currentSelection == i ? null : i;
        STATE.cf[self.source + "_index"].filterExact(self.currentSelection);
        updateAllViews();
    }
}

ChordVis.prototype.connect = function(svg, end) {
    var self = this;
    if(end == "source") {
        return function(d, index) {
            if(self.soureIndex == index) {
                return;
            }
            // update color
            svg.select("#connectionSourceRect" + self.sourceIndex)
                .attr("class", "ConnectionRect");
            svg.select("#connectionSourceText" + self.sourceIndex)
                .attr("class", "ConnectionText");

            svg.select("#connectionSourceRect" + index)
                .attr("class", "ConnectionRectSelected");
            svg.select("#connectionSourceText" + index)
                .attr("class", "ConnectionTextSelected");

            // clear previous filtering
            self.currentSelection = null;
            STATE.cf[self.source + "_index"].filter(null);
            self.source = STATE.grades[index];
            self.sourceIndex = index;

            // transition the line
            //
            var data = STATE.grades;
            var n = data.length;
            var width = $(self.connectionDivStr).width();
            var height = $(self.connectionDivStr).height();
            var padding = 2;
    
            var itemHeight = height / n;
            var itemWidth = width / 3;
            var line = d3.svg.line()
                 .x( function(point) { return point.x; })
                 .y( function(point) { return point.y; });
            var lineData = [{x: itemWidth - padding, y: itemHeight * self.sourceIndex + itemHeight / 2},
                {x: itemWidth*2 + padding, y: itemHeight * self.targetIndex + itemHeight / 2}];

            svg.selectAll(".ConnectionLine")
                .data(lineData)
                .transition()
                .attr("d", line(lineData));

            updateAllViews();
        }
    } else {
        // target
        return function(d, index) {
            if(self.target == STATE.grades[index]) {
                return;
            }

            // update color
            svg.select("#connectionTargetRect" + self.targetIndex)
                .attr("class", "ConnectionRect");
            svg.select("#connectionTargetText" + self.targetIndex)
                .attr("class", "ConnectionText");

            svg.select("#connectionTargetRect" + index)
                .attr("class", "ConnectionRectSelected");
            svg.select("#connectionTargetText" + index)
                .attr("class", "ConnectionTextSelected");

            self.currentSelection = null;
            STATE.cf[self.source + "_index"].filter(null);
            self.target = STATE.grades[index];
            self.targetIndex = index;

            var data = STATE.grades;
            var n = data.length;
            var width = $(self.connectionDivStr).width();
            var height = $(self.connectionDivStr).height();
            var padding = 2;
    
            var itemHeight = height / n;
            var itemWidth = width / 3;
            var line = d3.svg.line()
                 .x( function(point) { return point.x; })
                 .y( function(point) { return point.y; });
            var lineData = [{x: itemWidth - padding, y: itemHeight * self.sourceIndex + itemHeight / 2},
                {x: itemWidth*2 + padding, y: itemHeight * self.targetIndex + itemHeight / 2}];

            svg.selectAll(".ConnectionLine")
                .data(lineData)
                .transition()
                .attr("d", line(lineData));

            updateAllViews();
        }
    }
}
