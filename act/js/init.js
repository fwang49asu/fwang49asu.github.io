bootcards.init({
    offCanvasBackdrop : true,
    offCanvasHideOnMainClick : true,
    enableTabletPortraitMode : true,
    disableRubberBanding : true,
    disableBreakoutSelector : 'a.no-break-out'
});
// enable fastclick
window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);

$(document).ready(function() {
    d3.csv("student_flow_aggregated_file.csv")
    .get(function(error, data) {
        if(error) {
            console.log(error);
            return;
        }
        extractID(data);
        STATE.cf = crossfilter(data);
        STATE.cf["Gender"] = STATE.cf.dimension(function(d) {return d["Gender"];});
        STATE.grades.forEach(function(grade, index, array) {
            STATE.cf[grade + "_index"] = STATE.cf.dimension(function(d) {return d[grade + "_index"];});
        });

        STATE.chord = new ChordVis(STATE.cf[STATE.grades[0] + "_index"].top(Infinity), "#chordDiv", "#chordLegendDiv", "#chordConnectionDiv");
        STATE.genderPie = new Pie("Gender", "#genderPieDiv");
    });
});

function updateAllViews() {
    STATE.genderPie.refresh();

    // work around for chord
    STATE.cf[STATE.chord.source + "_index"].filter(null);
    STATE.chord.data = STATE.cf[STATE.chord.source + "_index"].top(Infinity);
    STATE.chord.refresh();
    STATE.cf[STATE.chord.source + "_index"].filter(STATE.chord.currentSelection);
}
