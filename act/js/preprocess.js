function extractID(data) {
    STATE.majorIDMap = d3.map();
    STATE.majorNames = [];
    data.forEach(function(d) {
        var name = d["T1_Level2"];
        if(!STATE.majorIDMap.has(name)) {
            var id = STATE.majorIDMap.size();
            STATE.majorNames[id] = name;
            STATE.majorIDMap.set(name, id);
        }
    });
    data.forEach(function(d) {
        for(var i in STATE.grades) {
            var name = d[STATE.grades[i]];
            var idstr = STATE.majorIDMap.get(name);
            d[STATE.grades[i] + "_index"] = parseInt(idstr);
            d.count = parseInt(d.count);
        }
    });
}
