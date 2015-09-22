function DualChord(group) {
    this.currentSelection = null;
    this.chordKey = function(d) {
        return d.source.id + "-" + d.target.id;
    }

    this.extractMatrix = function() {
        var self = this;
        STATE.cf["major"+STATE.source+""+STATE.target].filter(null);

        var data = STATE.cf["Gender"].top(Infinity);
        var matrix = [];
        var arcValues = [];
        var links = [];
        for(var i in STATE.majorNames) {
            matrix[i] = [];
            arcValues[i] = {
                value: 0,
                outValue: 0,
                inValue: 0,
                startAngle: 0,
                endAngle: 0,
                ratio: 0,
                outRatio: 0,
                inRatio: 0
            };
            for(var k in STATE.majorNames) {
                matrix[i][k] = 0;
            }
        }

        var source = STATE.grades[STATE.source] + "_index";
        var target = STATE.grades[STATE.target] + "_index";

        data.forEach(function(d) {
            var s = d[source];
            var t = d[target];
            if(s != t) {
                var v = +d.count;
                matrix[s][t] += v;
            }
        });

        for(var i in matrix) {
            for(var k in matrix[i]) {
                arcValues[i].value += matrix[i][k];
                arcValues[k].value += matrix[i][k];

                arcValues[i].outValue += matrix[i][k];
                arcValues[k].inValue += matrix[i][k];
            }
        }

        // presum for start and end angles for the arcs
        for(var i in arcValues) {
            arcValues[i].startAngle = i==0 ? 0 : arcValues[i-1].endAngle;
            arcValues[i].endAngle = i==0 ? arcValues[i].value : (arcValues[i].value + arcValues[i].startAngle);
        }
        var sum = arcValues[arcValues.length-1].endAngle;

        var angle = Math.PI * 2 / sum;
        for(var i in arcValues) {
            arcValues[i].startAngle *= angle;
            arcValues[i].endAngle *= angle;
            arcValues[i].ratio = arcValues[i].value / sum;
            arcValues[i].outRatio = arcValues[i].outValue / sum * 2;
            arcValues[i].inRatio = arcValues[i].inValue / sum * 2;

        }
        // generate links
        var outAngle = [];
        var inAngle = [];
        for(var i in arcValues) {
            outAngle[i] = 0;
            inAngle[i] = 0;
        }
        for(var i in matrix) {
            for(var k in matrix[i]) {
                if(matrix[i][k]) {
                    var band = matrix[i][k] * angle;
                    var link = {
                        value: matrix[i][k],
                        ratio: matrix[i][k] / sum,
                        source: {
                            id: i,
                            startAngle: outAngle[i],
                            endAngle: outAngle[i] + band
                        },
                        target: {
                            id: k,
                            startAngle: inAngle[k],
                            endAngle: inAngle[k] + band
                        }
                    };
                    outAngle[i] += band;
                    inAngle[k] += band;
                    links.push(link);
                }
            }
        }
    
        this.chordMap_ = d3.map();
        for(var i in links) {
            links[i].source.startAngle += arcValues[links[i].source.id].startAngle;
            links[i].source.endAngle += arcValues[links[i].source.id].startAngle;
            links[i].target.startAngle += (arcValues[links[i].target.id].startAngle + outAngle[links[i].target.id]);
            links[i].target.endAngle += (arcValues[links[i].target.id].startAngle + outAngle[links[i].target.id]);
            this.chordMap_.set(this.chordKey(links[i]), i);
        }

        this.matrix_ = matrix;
        this.arcValues_ = arcValues;
        this.links_ = links;

        STATE.cf["major"+STATE.source+""+STATE.target].filter(self.currentSelection == null ? null : function(d) {
                return d.source == self.currentSelection || d.target == self.currentSelection;
        });
        

    }
    
    this.width_ = 400;
    this.height_ = 400;
    this.outerRadius_ = 300;
    this.innerRadius_ = 0;
    this.group_ = group.append("g").attr("transform", "translate(200, 200)");
    this.matrix_ = [];
    this.links_ = [];
    this.lastLinks_ = [];
    this.chordMap_ = d3.map();
    this.lastChordMap_ = d3.map();
    this.arcValues_ = [];

    this.extractMatrix();
    this.lastLinks_ = this.links_;
    this.lastChordMap_ = this.chordMap_;

    this.refresh = function() {
        // build the matrix
        var self = this;

        self.extractMatrix();
        self.group_.attr("transform", "translate(" + self.width_/2 + "," + self.height_/2 + ")");

        var arc = d3.svg.arc()
                    .startAngle(function(d) {return d.startAngle;})
                    .endAngle(function(d) {return d.endAngle;})
                    .innerRadius(self.innerRadius_)
                    .outerRadius(self.outerRadius_);
        var arcData = self.group_.selectAll(".arc").data(self.arcValues_);
        var arcPath = arcData.enter()
                    .append("g").attr("class", "arc")
                    .append("path")
                    .attr("id", function(d, i) {return "chordArc" + i})
                    .style("fill", function(d, i) {return STATE.majorFill(i);})
                    .style("stroke", function(d, i) {return STATE.majorFill(i);})
                    .attr("d", arc)
                    .on("mouseover", function(a, id) {
                        self.group_.selectAll(".chord").filter(function(d) {
                            return d.source.id != id && d.target.id != id;
                        }).transition().style("opacity", 0.1);
                        self.group_.selectAll(".chord").filter(function(d) {
                            return d.source.id == id || d.target.id == id;
                        }).transition().style("opacity", 1);
                        STATE.cf["major"+STATE.source+""+STATE.target].filter(function(d) {
                            return d.source == id || d.target == id;
                        });
                        STATE.genderScore.refresh();
                        refreshParsets();
                    })
                    .on("mouseout", function(a, id) {
                        if(self.currentSelection == null) {
                            self.group_.selectAll(".chord").transition().style("opacity", 1);
                        } else {
                            self.group_.selectAll(".chord").filter(function(d) {
                                return d.source.id != self.currentSelection && d.target.id != self.currentSelection;
                            }).transition().style("opacity", 0.1);
                            self.group_.selectAll(".chord").filter(function(d) {
                                return d.source.id == self.currentSelection || d.target.id == self.currentSelection;
                            }).transition().style("opacity", 1);
                        }

                        STATE.cf["major"+STATE.source+""+STATE.target].filter(self.currentSelection == null ? null : function(d) {
                            return d.source == self.currentSelection || d.target == self.currentSelection;
                        });
                        STATE.genderScore.refresh();
                        refreshParsets();
                    })
                    .on("click", function(a, id) {
                        self.currentSelection = self.currentSelection == id ? null : id;
                        if(self.currentSelection == null) {
                            self.group_.selectAll(".chord").transition().style("opacity", 1);
                        }
                        STATE.cf["major"+STATE.source+""+STATE.target].filter(self.currentSelection == null ? null : function(d) {
                            return d.source == id || d.target == id;
                        });
                    });

        arcPath.append("title").text(function(d, i) {
            return d.outValue + " students, " + formatPercent(d.outRatio) + " from " + STATE.majorNames[i] + "\n"
                + d.inValue + " students, " + formatPercent(d.inRatio) + " to " + STATE.majorNames[i];
        });
        arcData.transition().duration(STATE.duration)
                .select("path")
                .attr("d", arc)
                .each("end", function(d, i) {
                    var path = this;
                    self.group_.select("#arcTextPath" + i).transition()
                        .attr("fill-opacity", function(d, i) {
                        return ((path.getTotalLength() / 2 - 30) < this.getComputedTextLength()) ? 0 : 1;
                }).select("title").text(function(d, i) {
                    return d.outValue + " students, " + formatPercent(d.outRatio) + " from " + STATE.majorNames[i] + "\n"
                        + d.inValue + " students, " + formatPercent(d.inRatio) + " to " + STATE.majorNames[i];
                });
        });
        arcData.exit().transition().remove();

        var chord = d3.svg.chord().radius(self.innerRadius_);
        
        var chordData = self.group_.selectAll(".chord").data(self.links_);
        var chordPath = chordData.enter()
                            .append("path").attr("class", "chord")
                            .style("fill", function(d, i) {return STATE.majorFill(d.source.id);})
                            .style("stroke", function(d, i) {return STATE.majorFill(d.source.id);})
                            .style("opacity", function(d, i) {
                                if(self.currentSelection == null) {
                                    return 1;
                                }
                                return (self.currentSelection == d.source.id || self.currentSelection == d.target.id) ? 1 : 0.1;})
                            .attr("d", chord);
        chordPath.append("title").text(function(d, i){
            return STATE.majorNames[d.source.id] + " \u2192 " + STATE.majorNames[d.target.id] 
                + ":\n" + d.value + " students "
                + ", " + formatPercent(d.ratio);
        });

        chordData.transition().duration(STATE.duration)
                .attrTween("d", self.chordTween())
                .style("fill", function(d, i) {return STATE.majorFill(d.source.id);})
                .style("stroke", function(d, i) {return STATE.majorFill(d.source.id);})
                .style("opacity", function(d, i) {
                    if(self.currentSelection == null) {
                        return 1;
                    }
                    return (self.currentSelection == d.source.id || self.currentSelection == d.target.id) ? 1 : 0.1;})
                .select("title").text(function(d, i){
                    return STATE.majorNames[d.source.id] + " \u2192 " + STATE.majorNames[d.target.id] 
                            + ":\n" + d.value + " students "
                            + ", " + formatPercent(d.ratio);
        });
        chordData.exit().transition().remove();

        this.lastLinks_ = this.links_;
        this.lastChordMap_ = this.chordMap_;

    }

    this.chordTween = function() {
        var self = this;
        return function(d, i) {
            var tween;
            var last;
            
            var chord = d3.svg.chord().radius(self.innerRadius_);
            tween = d3.interpolate(self.lastLinks_[i], d);
            return function(t) {
                return chord(tween(t));
            }
        }
    }

    this.width = function(_) {
        if(!arguments.length) {
            return this.width_;
        }
        this.width_ = +_;
        return this;
    }
    this.height = function(_) {
        if(!arguments.length) {
            return this.height_;
        }
        this.height_ = +_;
        return this;
    }
    this.outerRadius = function(_) {
        if(!arguments.length) {
            return this.outerRadius_;
        }
        this.outerRadius_ = +_;
        return this;
    }
    this.innerRadius = function(_) {
        if(!arguments.length) {
            return this.innerRadius_;
        }
        this.innerRadius_ = +_;
        return this;
    }
}
