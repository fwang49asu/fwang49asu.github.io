var STATE = {
    majorIDMap: null,
    majorNames: [],
    majorFill: d3.scale.category20(),
    majorLegend: null,
    grades: ["T1_Level2", "T2_Level2", "T3_Level2"],
    scores: ["33-36", "28-32", "24-27", "20-23", "16-19", "1-15"],
    scoreIDMap: null,
    fitGrades: ["Poor", "Moderate", "Good"],
    fitGradeIDMap: null,
    fits: ["T1_IMFIT", "T2_IMFIT", "T3_IMFIT"],
    fitIDMap: null,
    gradesOrder: ["T1_IMFIT", "T2_IMFIT", "T3_IMFIT"],
    source: 0,
    target: 1,
    duration: 0,
    chord: null,
    genderScore: null,
    gradeParset: null
};
var formatPercent = d3.format(".1%");
