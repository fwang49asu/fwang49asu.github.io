function GenderScore(group) {
    this.currentSelectedScore = null;
    var currentSelectedGender = null;
    var maleColor = "#e66b25";
    var femaleColor = "#008dcf";

    // scores
    this.scoreTiles = [];
    for(var i in STATE.scores) {
        this.scoreTiles[i] = {
            value: 0,
            ratio: 0,
            color: 5
        };
    }
    var barHeight = 80;
    var padding = 5;
    var barWidth = 30;
    group.selectAll(".ScoreTile").data(this.scoreTiles).enter()
        .append("rect")
        .attr("class", "ScoreTile")
        .attr("x", 30)
        .attr("y", function(d, i) {return i*barHeight + padding;})
        .attr("width", barWidth)
        .attr("height", barHeight - 2*padding)
        .attr("fill", function(d, i) {return colorbrewer.Blues[6][d.color];})
        .on("mouseover", function(tile, id) {
            // apply the filter
            STATE.cf["actscore"].filter(STATE.scores[id]);
            STATE.chord.refresh();
            refreshParsets();
        })
        .on("mouseout", function(tile, id) {
            // apply the filter
            STATE.cf["actscore"].filter(STATE.genderScore.currentSelectedScore == null ? null : STATE.scores[STATE.genderScore.currentSelectedScore]);
            STATE.chord.refresh();
            STATE.genderScore.refreshGlyphs();
            refreshParsets();
        })
        .on("click", function(tile, id) {
            STATE.genderScore.currentSelectedScore = STATE.genderScore.currentSelectedScore == id ? null : id;
            // erase the wrong border
            group.selectAll(".ScoreTile").filter(function(d, i) {return this.currentSelectedScore != i;}).transition()
                .style("stroke", function(d, i) {return colorbrewer.Blues[9][d.color];});
            // apply the border
            group.selectAll(".ScoreTile").filter(function(d, i) {return this.currentSelectedScore == i;}).transition()
                .style("stroke", "red");
            // apply the filter
            STATE.cf["actscore"].filter(STATE.genderScore.currentSelectedScore == null ? null : STATE.scores[STATE.genderScore.currentSelectedScore]);
            STATE.chord.refresh();
            refreshParsets();
        })
        .append("title").text("");

    // labels
    group.selectAll(".ScoreTileText").data(this.scoreTiles).enter()
        .append("g").attr("transform", function(d, i) {return "translate(0," + (i+1)*barHeight  + ")rotate(-90)";})
        .append("text")
        .text(function(d, i) {return STATE.scores[i];})
        .attr("font-family", "Roboto")
        .attr("font-size", "16px")
        .attr("x", barHeight / 2)
        .attr("y", 18)
        .attr("text-anchor", "middle");
    // legends
    group.append("text")
        .attr("id", "colorLegend0")
        .text("0")
        .attr("x", 10)
        .attr("y", 540)
        .attr("text-anchor", "middle");
    for(var i=0; i<6; ++i) {
        group.append("rect")
            .attr("x", i * 40 + 10)
            .attr("y", 490)
            .attr("width", 40)
            .attr("height", 35)
            .attr("fill", colorbrewer.Blues[6][i]);

        group.append("text")
            .attr("id", "colorLegend"+(i+1))
            .text("0")
            .attr("x", 10 + (i+1)*40)
            .attr("y", 540)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px");
    }


    // glyphs
    var linePadding = 1;
    var lineHeight = 20;
    var maxwidth = 8;
    var middleX = 150;
    var linesPerScore = 3;

    this.glyphArray = [];
    for(var i in STATE.scores) {
        this.glyphArray[i] = {
            male: 0,
            female: 0,
            maleRatio: 0,
            femaleRatil: 0,
            maleLength: maxwidth * linesPerScore,
            femaleLength: maxwidth * linesPerScore
        };
    }
    for(var line=0; line<linesPerScore; ++line) {
        group.selectAll(".glyphMaleLine" + line).data(this.glyphArray).enter()
            .append("text")
            .attr("class", "glyphMaleLine" + line)
            .attr("x", middleX)
            .attr("y", function(d, i) {return line * lineHeight + i*barHeight + padding + lineHeight - linePadding - 4;})
            .attr("text-anchor", "end")
            .text(function(d, i) {
                var result = "";
                var length = maxwidth;
                for(var x = 0; x<length; ++x) {
                    result += "\uf183";
                }
                return result;
            })
            .attr("font-family", "FontAwesome")
            .attr("font-size", (lineHeight - linePadding*2) + "px")
            .attr("fill", maleColor)
            .style("pointer-events", "all")
            .on("mouseover", function() {
                for(var y=0; y<linesPerScore; ++y) {
                    group.selectAll(".glyphMaleLine"+y).transition().style("opacity", 1);
                    group.selectAll(".glyphFemaleLine"+y).transition().style("opacity", 0.1);
                }
                STATE.cf["Gender"].filter("Male");
                STATE.chord.refresh();
                STATE.genderScore.refreshTiles();
                refreshParsets();
            })
            .on("mouseout", function() {
                if(currentSelectedGender == null) {
                    group.selectAll("text").transition().style("opacity", 1)
                }else if(currentSelectedGender.valueOf() == "Male") {
                    for(var y=0; y<linesPerScore; ++y) {
                        group.selectAll(".glyphMaleLine"+y).transition().style("opacity", 1);
                        group.selectAll(".glyphFemaleLine"+y).transition().style("opacity", 0.1);
                    }
                } else {
                    for(var y=0; y<linesPerScore; ++y) {
                        group.selectAll(".glyphMaleLine"+y).transition().style("opacity", 0.1);
                        group.selectAll(".glyphFemaleLine"+y).transition().style("opacity", 1);
                    }
                }
                STATE.cf["Gender"].filter(currentSelectedGender);
                STATE.chord.refresh();
                STATE.genderScore.refreshTiles();
                refreshParsets();
            })
            .on("click", function() {
                if(currentSelectedGender == null) {
                    currentSelectedGender = "Male";
                } else {
                    currentSelectedGender = currentSelectedGender.valueOf() == "Male" ? null : "Male";
                }
                if(currentSelectedGender == null) {
                    group.selectAll("text").transition().style("opacity", 1);
                }else if(currentSelectedGender.valueOf() == "Male") {
                    for(var y=0; y<linesPerScore; ++y) {
                        group.selectAll(".glyphMaleLine"+y).transition().style("opacity", 1);
                        group.selectAll(".glyphFemaleLine"+y).transition().style("opacity", 0.1);
                    }
                } else {
                    for(var y=0; y<linesPerScore; ++y) {
                        group.selectAll(".glyphMaleLine"+y).transition().style("opacity", 0.1);
                        group.selectAll(".glyphFemaleLine"+y).transition().style("opacity", 1);
                    }
                }
                STATE.cf["Gender"].filter(currentSelectedGender);
                STATE.chord.refresh();
                STATE.genderScore.refreshTiles();
                refreshParsets();
            })
            .append("title").text("");
    }
    for(var line=0; line<linesPerScore; ++line) {
        group.selectAll(".glyphFemaleLine" + line).data(this.glyphArray).enter()
            .append("text")
            .attr("class", "glyphFemaleLine" + line)
            .attr("x", middleX)
            .attr("y", function(d, i) {return line * lineHeight + i*barHeight + padding + lineHeight - linePadding - 3;})
            .attr("text-anchor", "start")
            .text(function(d, i) {
                var result = "";
                var length = maxwidth;
                for(var x = 0; x<length; ++x) {
                    result += "\uf182";
                }
                return result;
            })
            .attr("font-family", "FontAwesome")
            .attr("font-size", (lineHeight - linePadding*2) + "px")
            .attr("fill", femaleColor)
            .on("mouseover", function() {
                for(var y=0; y<linesPerScore; ++y) {
                    group.selectAll(".glyphMaleLine"+y).transition().style("opacity", 0.1);
                    group.selectAll(".glyphFemaleLine"+y).transition().style("opacity", 1);
                }
                STATE.cf["Gender"].filter("Female");
                STATE.chord.refresh();
                STATE.genderScore.refreshTiles();
                refreshParsets();
            })
            .on("mouseout", function() {
                if(currentSelectedGender == null) {
                    group.selectAll("text").transition().style("opacity", 1)
                }else if(currentSelectedGender.valueOf() == "Female") {
                    for(var y=0; y<linesPerScore; ++y) {
                        group.selectAll(".glyphMaleLine"+y).transition().style("opacity", 0.1);
                        group.selectAll(".glyphFemaleLine"+y).transition().style("opacity", 1);
                    }
                } else {
                    for(var y=0; y<linesPerScore; ++y) {
                        group.selectAll(".glyphMaleLine"+y).transition().style("opacity", 1);
                        group.selectAll(".glyphFemaleLine"+y).transition().style("opacity", 0.1);
                    }
                }
                STATE.cf["Gender"].filter(currentSelectedGender);
                STATE.chord.refresh();
                STATE.genderScore.refreshTiles();
                refreshParsets();
            })
            .on("click", function() {
                if(currentSelectedGender == null) {
                    currentSelectedGender = "Female";
                } else {
                    currentSelectedGender = currentSelectedGender.valueOf() == "Female" ? null : "Female";
                }
                if(currentSelectedGender == null) {
                    group.selectAll("text").transition().style("opacity", 1);
                }else if(currentSelectedGender.valueOf() == "Female") {
                    for(var y=0; y<linesPerScore; ++y) {
                        group.selectAll(".glyphMaleLine"+y).transition().style("opacity", 0.1);
                        group.selectAll(".glyphFemaleLine"+y).transition().style("opacity", 1);
                    }
                } else {
                    for(var y=0; y<linesPerScore; ++y) {
                        group.selectAll(".glyphMaleLine"+y).transition().style("opacity", 1);
                        group.selectAll(".glyphFemaleLine"+y).transition().style("opacity", 0.1);
                    }
                }
                STATE.cf["Gender"].filter(currentSelectedGender);
                STATE.chord.refresh();
                STATE.genderScore.refreshTiles();
                refreshParsets();
            })
            .append("title").text("");
    }


    this.group = group;
    // refresh functions
    this.refreshTiles = function() {
        var self = this;
        var sum = 0, maxTile = 0;
        for(var i in this.scoreTiles) {
            this.scoreTiles[i].value = 0;
            this.scoreTiles[i].ratio = 0;
        }
        var array = STATE.cf["actscore"].group().reduceSum(function(d) {return d.count;}).top(Infinity);
        for(var i in array) {
            var id = STATE.scoreIDMap.get(array[i].key);

            this.scoreTiles[id].value += array[i].value;
            sum += array[i].value;
            if(array[i].value > maxTile) {
                maxTile = array[i].value;
            }
        }
        for(var i in this.scoreTiles) {
            this.scoreTiles[i].ratio = this.scoreTiles[i].value / sum;
            this.scoreTiles[i].color = Math.floor(this.scoreTiles[i].value / maxTile * 6);
            if(this.scoreTiles[i].color == 6) {
                this.scoreTiles[i].color = 5;
            }
        }
        this.group.selectAll(".ScoreTile").data(this.scoreTiles).transition().duration(STATE.duration)
            .style("fill", function(d, i) {return colorbrewer.Blues[6][d.color];})
            .style("stroke", function(d, i) {return i == self.currentSelectedScore ? "red" : colorbrewer.Blues[9][d.color];})
            .select("title").text(function(d, i) {return d.value + " students, " + formatPercent(d.ratio);});
        var seg = maxTile / sum / 6;
        for(var i=1; i<=6; ++i) {
            var s = d3.format("%")(seg * i);
            d3.select("#colorLegend" + i).transition().text(s);
        }
    };

    this.refreshGlyphs = function() {
        var self = this;
        for(var i in this.glyphArray) {
            this.glyphArray[i].male = 0;
            this.glyphArray[i].female = 0;
            this.glyphArray[i].maleRatio = 0;
            this.glyphArray[i].femaleRatio = 0;
            this.glyphArray[i].maleLength = 0;
            this.glyphArray[i].femaleLength = 0;
        }
        // count
        var data = STATE.cf["Gender"].top(Infinity);
        var sum = 0, max = 0;
        data.forEach(function(d) {
            var count = d.count;
            var score = STATE.scoreIDMap.get(d["actcat"]);
            sum += count;
            if(d["Gender"].valueOf() == "Male") {
                self.glyphArray[score].male += count;
            } else {
                self.glyphArray[score].female += count;
            }
        });
        for(var i in this.glyphArray) {
            this.glyphArray[i].maleRatio = this.glyphArray[i].male / sum;
            this.glyphArray[i].femaleRatio = this.glyphArray[i].female / sum;
            if(this.glyphArray[i].male > max) {
                max = this.glyphArray[i].male;
            }
            if(this.glyphArray[i].female > max) {
                max = this.glyphArray[i].female;
            }
        }
        
        var maxchar = maxwidth * linesPerScore;
        for(var i in this.glyphArray) {
            this.glyphArray[i].maleLength = Math.floor(this.glyphArray[i].male / max * maxwidth * linesPerScore);
            if(this.glyphArray[i].maleLength == 0) {
                this.glyphArray[i].maleLength = 1;
            }
            this.glyphArray[i].femaleLength = Math.floor(this.glyphArray[i].female / max * maxwidth * linesPerScore);
            if(this.glyphArray[i].femaleLength == 0) {
                this.glyphArray[i].femaleLength = 1;
            }
        }

        for(var line=0; line < linesPerScore; ++line) {
            this.group.selectAll(".glyphMaleLine" + line).data(this.glyphArray).transition()
                .text(function(d) {
                    var result = "";
                    var length = d.maleLength / linesPerScore;
                    if((d.maleLength % this.linesPerScore) > line) {
                        length++;
                    }
                    for(var x=0; x<length; ++x) {
                        result += "\uf183";
                    }
                    return result;
                }).select("title").text(function(d) {
                    return d.male + " students, " + formatPercent(d.maleRaio);
                });

            this.group.selectAll(".glyphFemaleLine" + line).data(this.glyphArray).transition()
                .text(function(d, i) {
                    var result = "";
                    var length = d.femaleLength / linesPerScore;
                    if((d.femaleLength % linesPerScore) > line) {
                        length++;
                    }
                    for(var x=0; x<length; ++x) {
                        result += "\uf182";
                    }
                    return result;
                }).select("title").text(function(d) {
                    return d.female + " students, " + formatPercent(d.femaleRaio);
                });

        }
    };

    this.refresh = function() {
        this.refreshTiles();
        this.refreshGlyphs();
    };
}
