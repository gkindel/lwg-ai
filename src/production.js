(function (global, scope) {



    function trainMinder () {
        var castles = scope.getBuildings({type: "Castle", player: myPlayerNumber});
        scope.order("Train Worker", [castles[0]]);
    }



})(this, scope);

