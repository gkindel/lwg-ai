(function (global, scope) {



    var Unit = {};

    Unit.first = function (name){
        var castles = scope.getBuildings({type: "Castle", player: myPlayerNumber});

    }
    Unit.firstBuilding = function (name){
        var castles = scope.getBuildings({type: name, player: myPlayerNumber});

    }



    scope.unit = this


})(this, scope);

