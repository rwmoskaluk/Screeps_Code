/*
 * Functions for base design and layout go here
 *
 *
 */

var global = require('global.variables'); 
var calculations = require('./function.calculations');

module.exports = {
    
    main_roads: function(room) {
        /*
        * function for filtering out all main paths that have no roads on them
        * list can be passed to allow creep to drop construction sites
        * runs every X ticks as CPU intensive
        */
        
        var spawn = room.find(FIND_MY_STRUCTURES, {
            filter: function(structure) {
                return structure.structureType == STRUCTURE_SPAWN;
            }
        });
        if(global.showDiagnostics.spawn_roads == true) {
            new RoomVisual().circle(spawn[0].pos.x + 1, spawn[0].pos.y + 1, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x - 1, spawn[0].pos.y + 1, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x, spawn[0].pos.y + 1, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x + 1, spawn[0].pos.y, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x + 1, spawn[0].pos.y - 1, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x, spawn[0].pos.y - 1, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x - 1, spawn[0].pos.y, {fill: '#ff0000'});
            new RoomVisual().circle(spawn[0].pos.x - 1, spawn[0].pos.y - 1, {fill: '#ff0000'});
            
        }
        /*
        room.createConstructionSite(spawn[0].pos.x + 1, spawn[0].pos.y + 1, STRUCTURE_ROAD);
        room.createConstructionSite(spawn[0].pos.x - 1, spawn[0].pos.y + 1, STRUCTURE_ROAD);
        room.createConstructionSite(spawn[0].pos.x, spawn[0].pos.y + 1, STRUCTURE_ROAD);
        room.createConstructionSite(spawn[0].pos.x + 1, spawn[0].pos.y, STRUCTURE_ROAD);
        room.createConstructionSite(spawn[0].pos.x + 1, spawn[0].pos.y - 1, STRUCTURE_ROAD);
        room.createConstructionSite(spawn[0].pos.x, spawn[0].pos.y - 1, STRUCTURE_ROAD);
        room.createConstructionSite(spawn[0].pos.x - 1, spawn[0].pos.y, STRUCTURE_ROAD);
        room.createConstructionSite(spawn[0].pos.x - 1, spawn[0].pos.y - 1, STRUCTURE_ROAD);
        */
        for(i=0; i< Memory.paths.length; i++) {
            for (j=0; j < Memory.paths[i].object_Path.length; j++) {
                var location = room.lookAt(Memory.paths[i].object_Path[j].x, Memory.paths[i].object_Path[j].y);
                if(location[0].type != 'structure' && location[0].type != 'constructionSite' && location[0].type != 'creep' && location[0].type != 'source') {
                    room.createConstructionSite(Memory.paths[i].object_Path[j].x, Memory.paths[i].object_Path[j].y, STRUCTURE_ROAD);
                }
            }
        }
        
    },
    
    initial_locations: function(room) {
        if(!Memory.room_Locations) {
            var room_Locations = [];
            var room_Buffer = [];
            var spawn = room.find(FIND_MY_STRUCTURES, {
                filter: function(object){
                    return object.structureType === STRUCTURE_SPAWN;
                } 
            });
            var control = room.find(FIND_MY_STRUCTURES, {
                filter: function(object){
                    return object.structureType === STRUCTURE_CONTROLLER;
                } 
            });
            var sources = room.find(FIND_SOURCES);
            room_Locations.push(spawn[0]);
            room_Locations.push(control[0]);
            for(i = 0; i < sources.length; i++) {
                room_Locations.push(sources[i]);
            }
            for(i = 0; i < room_Locations.length; i++) {
                var buffer1 = room.lookForAt(LOOK_STRUCTURES, room_Locations[i].pos.x, room_Locations[i].pos.y);
                if(!_.isEmpty(buffer1)) {
                    room_Buffer.push(buffer1);
                }
                else {
                    var buffer2 = room.lookForAt(LOOK_SOURCES, room_Locations[i].pos.x, room_Locations[i].pos.y);
                    if(!_.isEmpty(buffer2)) {
                        room_Buffer.push(buffer2);
                    }
                }
               
            } 
            Memory.room_Locations = room_Buffer;
        }
    },
    
    /*
    * calculates where all towers will reside in a room
    * 1) where spawn is located
    * 2) where sources are located
    * 3) where controller is located
    * 4) where exits are located
    *   a) how large exits are
    *   
    */
    tower_design: function(room) {
        var tower_Location = [];
        var sum_x = 0;
        var sum_y = 0;
        
        // need to fix room_locations length 0 as this crashed and caused problems 3/22/19 when getting to control level 3
        for(i = 0; i < room_Locations.length; i++) {
            console.log(JSON.stringify(room_Locations[i].pos));
            sum_x = sum_x + Memory.room_Locations[i].pos.x;
            sum_y = sum_y + Memory.room_Locations[i].pos.y;
        }
        tower_Location.push({x: Math.floor(sum_x/Memory.room_Locations.length), y: Math.floor(sum_y/Memory.room_Locations.length)});
        console.log(JSON.stringify(tower_Location));
        
        //check that position is valid for construction site otherwise iterate in a direction
        if(global.showDiagnostics.tower == true) {
            new RoomVisual().circle(tower_Location[0].x, tower_Location[0].y, {fill: '#ff0000'});
        }
        
        room.createConstructionSite(tower_Location[0].x, tower_Location[0].y, STRUCTURE_TOWER);

    },
    spawn_design: function(room) {
        /*
        *   1) scan area around the spawn
        *   2) create road 1 unit around spawn
        *   3) determine closest quadrant to sources and rank downwards
        *   4) alternate E->R R->E for initial 11 x 11 square design
        *   5)
        */
        var spawn = room.find(FIND_MY_STRUCTURES, {
            filter: function(structure) {
                return structure.structureType == STRUCTURE_SPAWN;
            }
        });
        
        if (!Memory.spawnArea) {

        var spawnArea = room.lookAtArea(spawn[0].pos.y - 5, spawn[0].pos.x - 5, spawn[0].pos.y + 5, spawn[0].pos.x + 5, true);
            var results = _.filter(spawnArea, function (position) {
                return (position.x >= spawn[0].pos.x - 5 && position.x <= spawn[0].pos.x + 5 && position.y >= spawn[0].pos.y - 5 && position.y <= spawn[0].pos.y + 5 && (position.x != spawn[0].pos.x || position.y != spawn[0].pos.y));
            });
            Memory.spawnArea = results;
        }
        
        if(!Memory.quadOrder) {
            var quadCalc = [{quad: 1, x: spawn[0].pos.x + 3, y: spawn[0].pos.y - 3}, {quad: 2, x: spawn[0].pos.x - 3, y: spawn[0].pos.y - 3}, {quad: 3, x: spawn[0].pos.x - 3, y: spawn[0].pos.y + 3}, {quad: 4, x: spawn[0].pos.x + 3, y: spawn[0].pos.y + 3}]; 
            var quadOrder = [];
            for(j = 0; j < quadCalc.length; j++) {
                var distance = calculations.closest_distance(quadCalc[j].x, quadCalc[j].y, Memory.room_Locations);
                quadOrder.push({quad: j + 1, distance: distance});
            }
            quadOrder.sort(function(a, b) {
                return parseFloat(a.distance) - parseFloat(b.distance);
            });        
            Memory.quadOrder = quadOrder;
            
            //filter all quads into four specific areas
            var quad1_results = _.filter(Memory.spawnArea, function (position) {
                return (position.x >= spawn[0].pos.x && position.y <= spawn[0].pos.y  && position.x <= spawn[0].pos.x + 5 && position.y >= spawn[0].pos.y - 5 && (position.x != spawn[0].pos.x || position.y != spawn[0].pos.y));
            });
            for(i = 0; i < Memory.spawnArea.length; i++) {
                new RoomVisual().circle(quad1_results[i].x, quad1_results[i].y, {fill: '#00FFFF'});
            }
            
        }
        //filter all quads into four specific areas
        var quad1_results = _.filter(Memory.spawnArea, function (position) {
            return (position.x >= spawn[0].pos.x + 1 && position.y <= spawn[0].pos.y - 1  && position.x <= spawn[0].pos.x + 5 && position.y >= spawn[0].pos.y - 5 && (position.x != spawn[0].pos.x || position.y != spawn[0].pos.y) &&
            position.terrain != 'wall');
        });
        var quad2_results = _.filter(Memory.spawnArea, function (position) {
            return (position.x <= spawn[0].pos.x - 1 && position.y <= spawn[0].pos.y - 1  && position.x >= spawn[0].pos.x - 5 && position.y >= spawn[0].pos.y - 5 && (position.x != spawn[0].pos.x || position.y != spawn[0].pos.y) &&
            position.terrain != 'wall');
        });
        var quad3_results = _.filter(Memory.spawnArea, function (position) {
            return (position.x <= spawn[0].pos.x - 1 && position.y >= spawn[0].pos.y + 1  && position.x <= spawn[0].pos.x + 5 && position.y <= spawn[0].pos.y + 5 && (position.x != spawn[0].pos.x || position.y != spawn[0].pos.y) &&
            position.terrain != 'wall');
        });
        var quad4_results = _.filter(Memory.spawnArea, function (position) {
            return (position.x >= spawn[0].pos.x + 1 && position.y >= spawn[0].pos.y + 1  && position.x <= spawn[0].pos.x + 5 && position.y <= spawn[0].pos.y + 5 && (position.x != spawn[0].pos.x || position.y != spawn[0].pos.y) &&
            position.terrain != 'wall');
        });
        
        var quadAreas = [];
        quadAreas.push({quad: 1, results: quad1_results});
        quadAreas.push({quad: 2, results: quad2_results});
        quadAreas.push({quad: 3, results: quad3_results});
        quadAreas.push({quad: 4, results: quad4_results});
        
        
        
        
        if (global.showDiagnostics.spawn == true) {
            //new RoomVisual().rect(spawn[0].pos.x - 5.5, spawn[0].pos.y - 5.5, 11, 11, {fill: '#ffffff', opacity: 0.2});
            for(i = 0; i < Memory.spawnArea.length; i++) {
                //new RoomVisual().circle(Memory.spawnArea[i].x, Memory.spawnArea[i].y, {fill: '#ff0000'});
            }
            for(i = 0; i < quad1_results.length; i++) {
                new RoomVisual().circle(quad1_results[i].x, quad1_results[i].y, {fill: '#00FFFF'});
            }
            for(i = 0; i < quad2_results.length; i++) {
                new RoomVisual().circle(quad2_results[i].x, quad2_results[i].y, {fill: '#FF8C00'});
            }
            for(i = 0; i < quad3_results.length; i++) {
                new RoomVisual().circle(quad3_results[i].x, quad3_results[i].y, {fill: '#7FFF00'});
            }
            for(i = 0; i < quad4_results.length; i++) {
                new RoomVisual().circle(quad4_results[i].x, quad4_results[i].y, {fill: '#FFD700'});
            }

        }
    },
    
};