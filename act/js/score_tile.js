function ScoreTile(group) {
    this.leftTiles = [];
    this.rightTiles = [];

    var itemSize = 30;
    var padding = 2;
    for(var i in STATE.scores) {
        for(var k in STATE.fitGrades) {
            var tile = {
                x: +k,
                y: +i,
                value: 0,
                ratio: 0,
                color: 0
            };
            this.leftTiles.push(tile);
            this.rightTiles.push(tile);
        }
    }

    group.selectAll(".LeftScoreTile").data(this.leftTiles).enter()
        .append("rect")
        .attr("class", "LeftScoreTile")
        .attr("x", function(d) {return d.x * itemSize + padding;})
        .attr("y", function(d) {return d.y * itemSize + padding;})
        .attr("width", itemSize - 2*padding)
        .attr("height", itemSize - 2*padding)
        .style("fill", "white")
        .style("stroke", "white")
        .on("mouseover", function(d, i) {
            group.selectAll(".RowText").filter(function(a, y) {return y==d.y;})
                .transition().attr("fill", "red");
            group.selectAll(".LeftColumnTextGroup").filter(function(a, x) {return x==d.x;}).transition()
                .select("text").attr("fill", "red");
        })
        .on("mouseout", function(d, i) {
            group.selectAll(".RowText").filter(function(a, y) {return y==d.y;})
                .transition().attr("fill", "black");
            group.selectAll(".LeftColumnTextGroup").filter(function(a, x) {return x==d.x;}).transition()
                .select("text").attr("fill", "black");
        })
        .append("title")
        .text("");

    group.selectAll(".RightScoreTile").data(this.rightTiles).enter()
        .append("rect")
        .attr("class", "RightScoreTile")
        .attr("x", function(d) {return (d.x + 3) * itemSize + padding;})
        .attr("y", function(d) {return d.y * itemSize + padding;})
        .attr("width", itemSize - 2*padding)
        .attr("height", itemSize - 2*padding)
        .style("fill", "white")
        .style("stroke", "white")
        .on("mouseover", function(d, i) {
            group.selectAll(".RowText").filter(function(a, y) {return y==d.y;})
                .transition().attr("fill", "red");
            group.selectAll(".RightColumnTextGroup").filter(function(a, x) {return x==d.x;}).transition()
                .select("text").attr("fill", "red");
        })
        .on("mouseout", function(d, i) {
            group.selectAll(".RowText").filter(function(a, y) {return y==d.y;})
                .transition().attr("fill", "black");
            group.selectAll(".RightColumnTextGroup").filter(function(a, x) {return x==d.x;}).transition()
                .select("text").attr("fill", "black");
        })
        .append("title")
        .text("");

    group.selectAll(".RowText").data(STATE.scores).enter()
        .append("text")
        .attr("class", "RowText")
        .text(function(d) {return d;})
        .attr("x", 0)
        .attr("y", function(d, i) {return (i * itemSize) + itemSize / 2 + 6;})
        .attr("text-anchor", "end")
        .attr("font-family", "Roboto")
        .attr("font-size", "16px")
        .attr("fill", "black");

    group.selectAll(".LeftColumnTextGroup").data(STATE.fitGrades).enter()
        .append("g")
        .attr("class", "LeftColumnTextGroup")
        .attr("transform", function(d, i) {return "translate("+ (i*itemSize + 30) +",-15)rotate(45)"})
        .append("text")
        .text(function(d) {return d;})
        .attr("x", 0)
        .attr("y", itemSize / 2 + 6)
        .attr("text-anchor", "end")
        .attr("font-family", "Roboto")
        .attr("font-size", "16px")
        .attr("fill", "black");

    group.selectAll(".RightColumnTextGroup").data(STATE.fitGrades).enter()
        .append("g")
        .attr("class", "RightColumnTextGroup")
        .attr("transform", function(d, i) {return "translate("+ ((i+3)*itemSize+30) +",-15)rotate(45)"})
        .append("text")
        .text(function(d) {return d;})
        .attr("x", 0)
        .attr("y", itemSize / 2 + 6)
        .attr("text-anchor", "end")
        .attr("font-family", "Roboto")
        .attr("font-size", "16px")
        .attr("fill", "black");

    this.group = group;

    this.extractTiles = function() {
        var self = this;
        var data = STATE.cf["Gender"].top(Infinity);
        var leftFitColumn = STATE.fits[STATE.source];
        var rightFitColumn = STATE.fits[STATE.target];

        for(var i in this.leftTiles) {
            self.leftTiles[i].value = 0;
            self.leftTiles[i].ratio = 0;

            self.rightTiles[i].value = 0;
            self.rightTiles[i].ratio = 0;
        }

        var sum = 0;

        data.forEach(function(d, i) {
            var actscore = STATE.scoreIDMap.get(d["actcat"]);
            var leftFit = STATE.fitGradeIDMap.get(d[leftFitColumn]);
            var rightFit = STATE.fitGradeIDMap.get(d[rightFitColumn]);
            var count = +d["count"];

            sum += count;
            var leftID = STATE.fitGrades.length * actscore + leftFit;
            var rightID = STATE.fitGrades.length * actscore + rightFit;
            self.leftTiles[leftID].value += count;
            self.rightTiles[rightID].value += count;
        });
        var leftMax = 0;
        var rightMax = 0;
        for(var i in this.leftTiles) {
            self.leftTiles[i].ratio = self.leftTiles[i].value / sum;
            self.rightTiles[i].ratio = self.rightTiles[i].value / sum;

            if(this.leftTiles[i].value > leftMax) {
                leftMax = self.leftTiles[i].value;
            }
            if(this.rightTiles[i].value > rightMax) {
                rightMax = self.rightTiles[i].value;
            }
        }
        leftMax += 0.001;
        rightMax += 0.001;
        for(var i in this.leftTiles) {
            this.leftTiles[i].color = Math.floor((this.leftTiles[i].value / leftMax) * 9);
            this.rightTiles[i].color = Math.floor((this.rightTiles[i].value / leftMax) * 9);
        }
    };

    this.refresh = function() {
        this.extractTiles();
        this.group.selectAll(".LeftScoreTile").data(this.leftTiles).transition().duration(STATE.duration)
            .style("fill", function(d) {return colorbrewer.Blues[9][d.color];})
            .select("title").text(function(d) {
                return d.value + " students, " + formatPercent(d.ratio);
            });
        this.group.selectAll(".RightScoreTile").data(this.rightTiles).transition().duration(STATE.duration)
            .style("fill", function(d) {return colorbrewer.Blues[9][d.color];})
            .select("title").text(function(d) {
                return d.value + " students, " + formatPercent(d.ratio);
            });
    };
}
