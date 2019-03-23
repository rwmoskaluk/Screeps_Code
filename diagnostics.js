const global = require('./global.variables');

module.exports = {

    visualizations : function(room) {
        //check that position is valid for construction site otherwise iterate in a direction

        //draws the roomVisual in red for the source and controller paths
        if (Memory.paths) {
            if (global.showDiagnostics.paths == true) {
                let colors = ['#ffffff', '#00FFFF', '#FF8C00', '#7FFF00', '#FFD700'];
                for (let i = 0; i < Memory.paths.length; i++) {
                    for (let j = 0; j < Memory.paths[i].object_Path.length - 1; j++) {
                        new RoomVisual().line(Memory.paths[i].object_Path[j].x, Memory.paths[i].object_Path[j].y, Memory.paths[i].object_Path[j + 1].x, Memory.paths[i].object_Path[j + 1].y, {color: colors[i]});
                    }
                }
            }
        }

        if (global.showDiagnostics.spawn_roads == true) {
            let spawn = room.find(FIND_MY_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_SPAWN;
                }
            });
            new RoomVisual().circle(spawn[0].pos.x + 1, spawn[0].pos.y + 1, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x - 1, spawn[0].pos.y + 1, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x, spawn[0].pos.y + 1, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x + 1, spawn[0].pos.y, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x + 1, spawn[0].pos.y - 1, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x, spawn[0].pos.y - 1, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x - 1, spawn[0].pos.y, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x - 1, spawn[0].pos.y - 1, {fill: '#ff0000'});

        }
        if (Memory.tower_Locations) {
            if (global.showDiagnostics.tower == true) {
                for (let i = 0; i < Memory.tower_Locations.length; i++) {
                    new RoomVisual().circle(Memory.tower_Locations[i].x, Memory.tower_Locations[i].y, {fill: '#ff0005'});
                }
            }
        }
        if (Memory.buildZones) {
            if (global.showDiagnostics.spawn == true) {
                for (let i = 0; i < Memory.buildZones.length; i++) {
                    for (let j = 0; j < Memory.buildZones[i].length; j++) {
                        if (Memory.buildZones[i][j].planned_construction == 'road') {
                            new RoomVisual().circle(Memory.buildZones[i][j].x, Memory.buildZones[i][j].y, {fill: '#ff25f5'});

                        } else {
                            new RoomVisual().circle(Memory.buildZones[i][j].x, Memory.buildZones[i][j].y, {fill: '#213dff'});

                        }
                    }
                }
            }
        }
    },
}
;