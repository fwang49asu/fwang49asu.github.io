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

    function fitTextToInt(a) {
        var c = a.charAt(0);
        switch(c) {
            case 'P':
                return 0;
            case 'M':
                return 1;
            case 'G':
                return 2;
        }
    } 
    data.forEach(function(d) {
        for(var i in STATE.grades) {
            var name = d[STATE.grades[i]];
            var idstr = STATE.majorIDMap.get(name);
            d[STATE.grades[i] + "_index"] = parseInt(idstr);
            d.count = parseInt(d.count);
            d.fit = "";
            d.fit += fitTextToInt(d["T1_IMFIT"]);
            d.fit += fitTextToInt(d["T2_IMFIT"]);
            d.fit += fitTextToInt(d["T3_IMFIT"]);
        }
    });

}
