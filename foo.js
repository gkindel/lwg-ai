

var map = require("./src/map.js");

function Grid (w,h,val){
    this.data = {};
    this.default = val;
    this.width = w;
    this.height = h;
}
Grid.prototype = {
    key : function(x,y){
        return [x,y].join(":")
    },
    get : function (x,y){
        return this.data[ this.key(x,y) ] || this.default;
    },
    set : function (x,y, val){
        return this.data[ this.key(x,y) ] = val;
    },
    isEmpty : function (point){
        if( point.x < 0 || point.y < 0
            || point.x >= this.width || point.y >= this.height) {
            return false;
        }
        return this.get(point.x, point.y) == this.default;
    },

    isRegionEmpty : function (region){
        var empty = true;
        var board = this;
        map.regionEach(region, function (point) {
            if(! board.isEmpty(point) ){
                empty = false;
                return true;
            }
        });
        return empty;
    },

    regionSet: function (region,val) {
        var board = this;
        map.regionEach(region, function (point){
            board.set(point.x, point.y, val);
        });
    },

    findEmptyRegion : function (region, opt){
        if( ! region.width && region.height )
            throw "invalid_region";

        if( ! opt )
            opt = {};


        var ret = null;
        var board = this;
        var max = Math.max(board.width, board.height) * 2;
        var marginX = opt.marginX || 0;
        var marginY = opt.marginY || 0;

        var eachFn = opt.nearby ? map.xyNearbyEach: map.xyNearEach;
        //map.xyNearbyEach( , function (point){
        //map.xyNearEach( Math.max(board.width, board.height) * 2, function (point){
        map.findNearRegionWhere( region, max, function (r){
            var test = map.region(
                r.x - marginX,
                r.y - marginX,
                r.width + (2* marginX),
                r.height + (2* marginY)
            );

            if(! board.isRegionEmpty(test) ) {
                return false;
            }
            ret = r;
            return true;
        });
        return ret;
    },

    dump : function () {
        var board = this;
        var region = map.region(0,0,board.width, board.height);
        map.regionEach(region, function (point,row_end) {
            process.stdout.write( pad( board.get(point.x,point.y), 4) );
            if (row_end)
                process.stdout.write("\n");
        })
        process.stdout.write("\n");
    },

    clone : function (){
        var board = new Grid(this.width, this.height, this.default);
        for(var i in this.data){
            board.data[i] = this.data[i];
        }
        return board;
    },

    show : function (region, char){
        var board = this.clone();
        board.regionSet(region, char);
        board.dump();
        return board;
    }
};

(function (){
    var board = new Grid(35,77, ".");

    //board.regionSet(map.region(1,1,2,2), "*");
    //board.regionSet( map.region(3,3,3,3), "*");

    var i = 1, check;

    while(   i <= 22 ) {
        //board.dump();
        check = map.region(15,15,2,2);
        if( i % 3 == 1)
            check = map.region(15,15,2,2);

        if( i % 3 == 2)
            check = map.region(15,15,4,2);
        if( i % 3 == 0)
            check = map.region(15,15,2,5);
        fill = board.findEmptyRegion( check, { marginX: 2, marginY: 2});
        //fill = board.findEmptyRegion( check, { marginX: 1, marginY: 1});
        if( fill ) {
            board.regionSet(fill, i);
        }
        i++
    }
    board.dump();
})()


function pad (n, len){
    var s = n+"";
    while(s.length < len){
        s = " " + s;
    }
    return s;
}
