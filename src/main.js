var myPlayerNumber = scope.getMyPlayerNumber();
var ai = this;


(function (ai, scope) {

    if(! ai.Map )
        return;

    init();
    tick();

    function init () {

        if( ai.ready )
            return;

        console.log("init?", ai);

        ai.ready = true;
        ai.tick = 0;

        scope.order('Stop', scope.getUnits({player: myPlayerNumber}) );
    }

    function tick () {
        //doProduction();
        doMining();
        doBuilding(); //
    }

    function doMining () {
        console.log("Starting mining...");
        var castles = scope.getBuildings({type: "Castle", player: myPlayerNumber});
        var mines = scope.getBuildings({type: "Goldmine"});
        var workers = scope.getUnits({type: "Worker", player: myPlayerNumber,  order:'Stop'});
        var mine = ai.Map.findClosest(castles[0], mines);
        scope.order('Mine', workers, {unit:mines[7]});
        console.log(mine);
        scope.order('Mine', workers, {unit:mine});
    }

    function buildHouse () {
        var worker = grabWorker();
        var castles = scope.getBuildings({type: "Castle", player: myPlayerNumber});
        scope.order("Build House",[worker], {
            x : castles[0].getX(),
            y  : castles[0].getY() - 7
        });
    }

    function doProduction () {
        var castles = scope.getBuildings({type: "Castle", player: myPlayerNumber});
        scope.order("Train Worker", [castles[0]]);
    }

    function doBuilding () {
        var castle = scope.getBuildings({type: "Castle", player: myPlayerNumber})[0];
        var target = ai.Map.region( castle.getX(), castle.getY(), 3, 3);
        var near = ai.Map.findEmptyRegionNear(target, { marginX : 2, marginY: 2});

        if(! near ) {
            return;
        }
        var worker = grabWorker();
        scope.order("Build House",[worker], {
            x : near.x,
            y  :  near.y
        });
    }

    function grabWorker () {
        var stopped = scope.getUnits({ type:'Worker',player: myPlayerNumber });
        return stopped[0];
    }



// scope.getGroundDistance(fromX, fromY, toX, toY)
// scope.getMapWidth()
// scope.getCenterOfUnits




})(this, scope);


