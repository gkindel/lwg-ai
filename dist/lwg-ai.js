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


;(function (global) {

    function point (x,y){
        return {
            x : x,
            y : y
        }
    }

    function rect (w,h) {
        return {
            width: w,
            height: h
        }
    }

    function region (x,y,w,h) {
        return {
            x : x,
            y : y,
            width: w,
            height: h
        }
    }

    function distance (pointA, pointB){
        var w = Math.abs(pointA.x-pointB.x);
        var h = Math.abs(pointA.y-pointB.y);
        return Math.sqrt( Math.pow(w,2) + Math.pow(h,2), 2);
    }

    var Map = {

        point : point,
        rect : rect,
        region : region,
        distance : distance,

        regionEach : function  (region, callback) {
            if( ! (region.width && region.height) )
                throw "invalid_region";

            Map.xyEach(region.width, region.height, function (x,y,isRowEnd){
                return callback( point(region.x+x, region.y+y), isRowEnd)
            })
        },


        xyEach : function (width,height, callback){
            var i,j;
            for(i = 0; i < height; i++) {
                for (j = 0; j < width; j++) {
                    if( callback(j, i, j == width-1) )
                        return;  // true response cancells loop
                }
            }
        },


        xyNearEach : function (max, callback) {
            // max linear distance, so actual distance of diagonal point may be larger
            // this is a simple, rough approx of distance sort
            var n = Math.round(max);
            var origin = point(0, 0);
            var d, dt, ring;
            for(ring = 0; ring <= max; ring++) {
                var current = point(0, ring);
                while (current.y >= 0) {
                    dt = distance(origin, current);
                    d = dt - ring;
                    if (d >= .5) {
                        // backtrack diagonally
                        current.y--;
                        current.x--;
                    }
                    else {
                        if (d > -.5) {
                            if( callback(current) )
                                return current;
                        }
                        current.x++;
                    }
                }
            }
        },

        xyNearbyEach : function (max, callback) {
            // dirty distance ordering
            var i,j;
            for(i = 0; i < max; i++) {
                for (j = 0; j <= i; j++) {
                    if( callback( Map.point(j,i) ))
                        return;  // true response cancells loop
                    if( i != j && callback(  Map.point(i,j) ) )
                        return;  // true response cancells loop
                }
            }
        },

        radialNearbyEach : function (max, callback) {
            // dirty distance ordering
            if( max == null)
                max = 100;

            var i, j, points;
            for(i = 0; i < max; i++) {

                for (j = 0; j <= i; j++) {

                    if( i == 0 && j == 0 ){
                        points =[
                            Map.point(0,0)
                        ]
                    }
                    else if( i == j ){
                        points = [
                            Map.point(i,i),
                            Map.point(i,-i),
                            Map.point(-i,i),
                            Map.point(-i,-i)
                        ]
                    }
                    else {
                        points = [
                            Map.point(i,j),
                            Map.point(j,i),

                            Map.point(i,-j),
                            Map.point(j,-i),

                            Map.point(-i,j),
                            Map.point(-j,i),

                            Map.point(-i,-j),
                            Map.point(-j,-i)
                        ]

                    }

                    var p;
                    while ( p = points.pop() ){
                        if( callback( p ))
                            return;  // true response cancells loop
                    }
                }
            }
        },

        findNearRegionWhere : function (region, max, condition_fn){
            if( ! region.width && region.height )
                throw "invalid_region";

            var ret = null;
            Map.radialNearbyEach( max, function (point){
                var test = Map.region(
                    region.x + point.x,
                    region.y + point.y,
                    region.width,
                    region.height
                );

                if( ! condition_fn(test) ) {
                    return false;
                }
                return true;
            });
            return ret;
        },

        findEmptyRegionNear : function (region, opt){
            if( ! region.width && region.height )
                throw "invalid_region";

            if( ! opt )
                opt = {};
            var marginX = opt.marginX || 0;
            var marginY = opt.marginY || 0;
            var ret = null;

            Map.findNearRegionWhere(region, 100, function (r) {
                var test = Map.region(
                    r.x - marginX,
                    r.y - marginX,
                    r.width + (2* marginX),
                    r.height + (2* marginY)
                );
                if(! Map.isRegionEmpty(test) ) {
                    return false;
                }
                ret = r;
                return true;
            });
            return ret;
        },

        isEmpty : function (point){
            if( ! (point.x && point.y ) )
                return false;
            var blocked = game.fieldIsBlocked(point.x,point.y);
            return ! blocked;
        },

        isRegionEmpty : function (region){
            var empty = true;
            Map.regionEach(region, function (point) {
                if(! Map.isEmpty(point) ){
                    empty = false;
                    return true;
                }
            });
            return empty;
        },

        findClosest : function (target, list) {
            var closest, minDist,  i, far;
            var near = Map.unitToPoint(target);
            for(i = 0; i<list.length; i++){
                far = Map.unitToPoint(list[i]);
                dist = Map.distance(near, far);
                if( ! minDist || dist < minDist ){
                    closest = list[i];
                    minDist = dist;
                }
            }
            return closest;
        },

        unitToPoint : function (unit){
            return Map.point(unit.getX(), unit.getY() );
        }

    };

    if ( typeof module != 'undefined' && module.exports)
        module.exports = Map;
    else if( ai )
        ai.Map = Map;
    else
        global.Map = Map;

})(this);

