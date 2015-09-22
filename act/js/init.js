function gradeFormat(d) {
    var a = d.charAt(1);
    switch(a) {
        case '1':
            return "Planned";
            break;
        case '2':
            return "First Year";
            break;
        case '3':
            return "Second Year";
            break;
    }
    return d;
}
$(document).ready(function() {
    var faqImage = "data:image/gif;base64,R0lGODlhQABAAPYAAA1qkxRulRFvmhVxmxx0nCF3nCF4nxp3oSR5oCx+oyV/qTF/oy+ApieCriyDrjCCpzKFqyqEsS6JtTSJsjyNszSNuzuPuj2Ru0yUtkOUvE6WuE2av16btl2fvm2lvTeRwTyUwzyWyEKXw0aYwkqaxEObzE2eykWe0U6gzlahx1+hwVGhzVmkzE6j1FWl0lin1Feo11qp1luq2GmnxWWqzW+uznWrw3Wuymas0myv1GGu2GSx3G2z2Xay0Hq00n+513a33Hu53m2643G/53XB53zC5qKioq2trbS0tLq6uoGyx4a71YS83Ia/4JTB15vD1ZrF2aPJ3avM27TR3oLD5YLL7InM65jH4ZzK447Q7pDS75PX9Jzd96TO5a3T67PU5LrX5bHV6LrZ66Tj+qvm+67p/rTt/sTExMvLy9LS0t3d3cHa5MTf78vg6tTm7sbg8M3j8NDl8dTo89vr8+Tk5Ovr6+Lv9ebx9unx9ebx+Oz0+QAAAAAAAAAAAAAAAAAAACH5BAEAAHsALAAAAABAAEAAAAf+gHuCg4SFhod7dnNzdnmIj5CRkoVeVENVW1xjXFtVQ01ek6KjhnpBRGVkWUVCO65CRVlkZERBjqS4kE1CZlYwLi8ywsMyMDAyVmZCQbnNhHotqi7HxNXDMC1aZC3OzXItZjIuxC/BMuXE1DA7ZSfdpHonZdPBMOXHLvn25cH85WUh3okqQWbFvhe/Xrg4ISMIFSAuWrTwp09HFh4CI1GxIi5GPoUwSnQxNIdHi3zAXMRYYaWFnIyPQmRZoZJmvhK3DnUpgRIlCis5YB5iQmUFTZsuSryJxARFTxcrqIAQaihEUZQrWKzAKKnEURdai7GhOshOCR5GjUINOCmIibT+aXWMJLtHzEq4K0zgEIXFq1GtK2JcobsnjIm3b42WECPqCgm4b0sMphsHBOK8Jj6MwnG4c94Rc+muINHZhAgmovR8KN0ZBBzCgkaAKCECBItRo01sYK0ZtqAwP5YwFpVDBGkTpEmf9u2MBggS0KNDr8C8WYoLI6RHrwCmOq4MGUhsGDFig3gSFnx4J3UhA/nzGTZkqFBjvSg7EkSEBz9if4Ue9k1yhwTgFTgeeBIsEeAkBBboYAYSRLGgJBtQ8GCBEnQ3ISRfTHBhBhc0EMeGkVDQXgYWWnhBBHeQCMkcEaCIYnsUNOCGi5BAMUGKKFIwgRM4QnLDjhQUWaQDQUL+ogKRRlIwQ5KPLNmkjxJCecgMEEDgY5EKzGHlIVMkoGWRECjwJSIYKADBBBAc8MWZiDyhAQUdtAHnnXgy12KehmAwwAEEMLAGn3vgMYCYDzzAgABS8MlAAgwkmuiiec5BAKQJLLAAAwwY8ASeU1yqaaaPGmADnmtcmsCqrBagRJ4AsCrrABre6cEACKyaawEJEMoBAAQUUEAAvRK6hxs2cODBFMY26+yzj9RBh7RqVGvttdfSMW0d3DJXhxpppHHGGUmUmwQSRxyBbrrstqsuEkiYOy4aaahBB1VpwJuuEfz26++/AAPMLhJo1CEUHWmgQe65+rbL7xH9smuEu/AbljtuGvcSJq2214br8ccfZ7sttCSXbPLJAgUCADs=";
    var minImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAABHklEQVRoQ+2Z4REBMRCFPx3pABXQASqgA3RAB3RABehASWZn+ENuY3IiJ/Py/zb79n2b3Gx6VLJ6lehAQrrmpBz5R0eGwBjoF0r+BpyAi7d/DK01sCok4HXbDWD5BJcnxJw4d0TEM41RkzOekC2w6JiQHbAM5eQJMSYHHRNyBYyUtyUhhZySI+qRTOgJLaEltPwKqEfUI+oR9UhzBfQbn6k/LKyOXx2/mfASWh5aB2D/5crPgKkTM4sj7sAsUWBsICghHlrVOGI3vztYTsDLhm/BAdwjVha0EvJs/YmE6GZvDVE4QBJa1TwrVPPQY+bGbtpMBAXDzr1fotgbokU0ZyaFH0OPsTvrEyG/rHryXhKSXLpMH8qRTIVNDluNI3d99lgzG90NCwAAAABJRU5ErkJggg==";
    d3.csv("student_flow_aggregated_file.csv")
        .get(function(error, data) {
            if(error) {
                console.log(error);
                return;
            }
            extractID(data);
            STATE.scoreIDMap = d3.map();
            for(var i in STATE.scores) {
                STATE.scoreIDMap.set(STATE.scores[i], +i);
            }
            STATE.fitIDMap = d3.map();
            for(var i in STATE.fits) {
            STATE.fitIDMap.set(STATE.fits[i], +i);
            }
            STATE.fitGradeIDMap = d3.map();
            for(var i in STATE.fitGrades) {
                STATE.fitGradeIDMap.set(STATE.fitGrades[i], +i);
            }
            STATE.cf = crossfilter(data);
            STATE.cf["major01"] = STATE.cf.dimension(function(d) {return {source: d[STATE.grades[0]+"_index"], target: d[STATE.grades[1]+"_index"]};});
            STATE.cf["major02"] = STATE.cf.dimension(function(d) {return {source: d[STATE.grades[0]+"_index"], target: d[STATE.grades[2]+"_index"]};});
            STATE.cf["major12"] = STATE.cf.dimension(function(d) {return {source: d[STATE.grades[1]+"_index"], target: d[STATE.grades[2]+"_index"]};});
            STATE.cf["major10"] = STATE.cf.dimension(function(d) {return {source: d[STATE.grades[1]+"_index"], target: d[STATE.grades[0]+"_index"]};});
            STATE.cf["major20"] = STATE.cf.dimension(function(d) {return {source: d[STATE.grades[2]+"_index"], target: d[STATE.grades[0]+"_index"]};});
            STATE.cf["major21"] = STATE.cf.dimension(function(d) {return {source: d[STATE.grades[1]+"_index"], target: d[STATE.grades[1]+"_index"]};});
            STATE.cf["actscore"] = STATE.cf.dimension(function(d) {return d.actcat;});
            STATE.cf["Gender"] = STATE.cf.dimension(function(d) {return d["Gender"];});
            STATE.cf["FIT"] = STATE.cf.dimension(function(d) {return d["fit"];})

            var width = $("#container").width();
            var height = $("#container").height();
            var svg = d3.select("#container").append("svg")
                        .attr("width", width)
                        .attr("height", height);

            var background = svg.append("rect")
                                .attr("x", 0)
                                .attr("y", 0)
                                .attr("width", width)
                                .attr("height", height)
                                .attr("fill", "#f9f7eb");

            var headerGroup = svg.append("g");
            
            headerGroup.append("text")
                        .attr("x", width / 2)
                        .attr("y", 70)
                        .text("ACT Interest-Major Fit")
                        .attr("text-anchor", "middle")
                        .attr("font-size", "60px")
                        .attr("fill", "#2e2633")
                        .attr("font-family", "Fontin-Sans-Bold");
            var container = svg.append("g").attr("transform", "translate(0,100)");

            var leftColumnGroup = container.append("g");
            var legendGroup = leftColumnGroup.append("g").attr("transform", "translate(0, 110)");
            majorLegend(legendGroup)

            var centerGroup = container.append("g").attr("transform", "translate(200, 0)");
            centerGroup.append("text")
                        .attr("x", 270)
                        .attr("y", 50)
                        .text("Where do students transfer?")
                        .attr("text-anchor", "middle")
                        .attr("font-size", "40px")
                        .attr("fill", "#2e2633")
                        .attr("font-family", "Fontin-Sans-Regular");
            var dualChordGroup = centerGroup.append("g").attr("transform", "translate(0, 60)");
            STATE.chord = new DualChord(dualChordGroup)
                                .width(540)
                                .height(540)
                                .outerRadius(260)
                                .innerRadius(234);
            STATE.chord.refresh();
            var chordTipGroup = dualChordGroup.append("g").attr("transform", "translate(0, 40)").style("visibility", "hidden");
            chordTipGroup.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 400)
                .attr("height", 128)
                .style("fill", "#f6d300");
            chordTipGroup.append("g").append("image")
                .attr("width", 20)
                .attr("height", 20)
                .attr("xlink:href", minImage)
                .on("click", function() {
                    chordTipGroup.transition().style("visibility", "hidden");
                });
            chordTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 45)
                .text("Hover over a major to see where students");

            chordTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 62)
                .text("transfer to/from. When you hover, chords");           

            chordTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 79)
                .text("with that major's color indicate students");           

            chordTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 96)
                .text("leaving the major, chords of a different"); 

            chordTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 112)
                .text("color indicate a student entering.");   

            dualChordGroup.append("g").attr("transform", "translate(20, 20)").append("image")
                .attr("width", 24)
                .attr("height", 24)
                .attr("xlink:href", faqImage)
                .on("click", function() {
                    chordTipGroup.transition().style("visibility", "visible");
                });

            

            container.append("line")
                .attr("x1", 740)
                .attr("y1", 10)
                .attr("x2", 740)
                .attr("y2", 600)
                .attr("stroke", "black")
                .attr("stroke-width", 1.5)
                .attr("stroke-linecap", "round")
                .attr("stroke-dasharray", "6, 5");

            var rightColumnGroup = container.append("g").attr("transform", "translate(740,0)");
            rightColumnGroup.append("text")
                        .attr("x", 130)
                        .attr("y", 45)
                        .text("ACT and Gender")
                        .attr("text-anchor", "middle")
                        .attr("font-size", "32px")
                        .attr("fill", "#2e2633")
                        .attr("font-family", "Fontin-Sans-Regular");

            var genderScoreGroup = rightColumnGroup.append("g").attr("transform", "translate(0,60)");
            STATE.genderScore = new GenderScore(genderScoreGroup);
            STATE.genderScore.refresh();

            var scoreTipGroup = rightColumnGroup.append("g").attr("transform", "translate(-150, 100)").style("visibility", "hidden");
            scoreTipGroup.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 400)
                .attr("height", 145)
                .style("fill", "#f6d300");
            scoreTipGroup.append("g").append("image")
                .attr("width", 20)
                .attr("height", 20)
                .attr("xlink:href", minImage)
                .on("click", function() {
                    scoreTipGroup.transition().style("visibility", "hidden");
                });
            scoreTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 45)
                .text("Here we show the gender and ACT score");

            scoreTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 62)
                .text(" distribution. Hovering over a major in");

            scoreTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 79)
                .text("the chord plot shows the makeup by the");
                
            scoreTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 96)
                .text(" major. You can filter the chord plot by");

            scoreTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 113)
                .text("gender or ACT score by selecting here as");

            scoreTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 130)
                .text("well.");


            rightColumnGroup.append("g").attr("transform", "translate(210, 60)").append("image")
                .attr("width", 24)
                .attr("height", 24)
                .attr("xlink:href", faqImage)
                .on("click", function() {
                    scoreTipGroup.transition().style("visibility", "visible");
                });


            
            var secondRowGroup = container.append("g").attr("transform", "translate(0, 620)");
            STATE.parsetGroup = secondRowGroup.append("g").attr("transform", "rotate(-90)translate(-300,0)");
            STATE.gradeParset = d3.parsets()
                            .width(300)
                            .height(980)
                            .dimensions(STATE.gradesOrder)
                            .value(function(d) {return d.count;})
                            .dimensionFormat(gradeFormat)
                            .on("sortDimensions", function(d) {
                                var array = STATE.gradeParset.dimensionNames();
                                var source = array[0].charAt(1) - '1';
                                var target = array[1].charAt(1) - '1';

                                STATE.source = source;
                                STATE.target = target;
                                STATE.chord.refresh();
                                STATE.genderScore.refresh();
                                STATE.scoreTile.refresh();
                            });
            STATE.parsetGroup.datum(STATE.cf["FIT"].bottom(Infinity)).call(STATE.gradeParset);

            var parsetTipGroup = secondRowGroup.append("g").attr("transform", "translate(20, 0)").style("visibility", "hidden");
            parsetTipGroup.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 660)
                .attr("height", 128)
                .style("fill", "#f6d300");
            parsetTipGroup.append("g").append("image")
                .attr("width", 20)
                .attr("height", 20)
                .attr("xlink:href", minImage)
                .on("click", function() {
                    parsetTipGroup.transition().style("visibility", "hidden");
                });
            parsetTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 45)
                .text("When students take the ACT, they provide details on their expected");

            parsetTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 62)
                .text("major. This plot shows the interest level in the expected major, the");

            parsetTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 79)
                .text("year 1 major and the year 2 major for students.  This can be filtered");

            parsetTipGroup.append("text")
                .attr("x", 0)
                .attr("y", 96)
                .text("by major, gender and ACT score using the above plots.");

            secondRowGroup.append("g").attr("transform", "translate(40, -50)").append("image")
                .attr("width", 24)
                .attr("height", 24)
                .attr("xlink:href", faqImage)
                .on("click", function() {
                    parsetTipGroup.transition().style("visibility", "visible");
                });
        });
});

function refreshParsets() {
    STATE.parsetGroup.datum(STATE.cf["FIT"].bottom(Infinity)).call(STATE.gradeParset);
}
