/*
 * function for managing the each room
 * 1) track all energy consumed and gathered
 * 2) Based on 1) and controller level allow the following
 *      a) upgrade creep flag
 *      b) construction flag
 *      c) repair flag
 */
 
var global = require('global.variables');
var calculations = require('./function.calculations');
var building_Layouts = require('./function.buildings');

var self = module.exports = {
    room_info: function(room) {
        var containers, extensions, tower, storage_Container = 0;
        var buildings = room.find(FIND_STRUCTURES, {
            filter: {structureType: STRUCTURE_EXTENSION || STRUCTURE_TOWER}
        });
        var towers = room.find(FIND_STRUCTURES, {
            filter: {structureType: STRUCTURE_TOWER}
        });
        
        /*
        * RCL       Energy to Upgrade       Structures
        *---------------------------------------------
        * 0                 -               
        *---------------------------------------------
        * 1                 200             
        *---------------------------------------------
        * 2                 45000           5 ext
        *---------------------------------------------
        * 3                 135000          10 ext, 1 tower
        *---------------------------------------------
        * 4                 405000          20 ext, 1 tower
        *---------------------------------------------
        *
        *
        */
        
        /*
        * Calculate optimal path to each source and controller from spawn
        * store this in an array 
        * check off when road has been completed to each
        * show path then draw in red the paths leading from spawn to objects in room
        */
        if (!Memory.paths) {
            var paths = [];
            var spawn = room.find(FIND_MY_STRUCTURES, {
                filter: function(structure) {
                    return structure.structureType == STRUCTURE_SPAWN;
                }
            });
            var room_Controller = room.find(FIND_MY_STRUCTURES, {
                filter: function(structure) {
                    return structure.structureType == STRUCTURE_CONTROLLER;
                }
            });
            var room_Sources = room.find(FIND_SOURCES);
            paths.push({object_Path: room.findPath(spawn[0].pos, room_Controller[0].pos, {ignoreCreeps: true, ignoreRoads: true})});
            
            for(i = 0; i < room_Sources.length; i++) {
                paths.push({object_Path: room.findPath(spawn[0].pos, room_Sources[i].pos, {ignoreCreeps: true, ignoreRoads: true})});
                paths.push({object_Path: room.findPath(room_Sources[i].pos, room_Controller[0].pos, {ignoreCreeps: true, ignoreRoads: true})});
            }
            Memory.paths = paths;
        }
        //draws the roomVisual in red for the source and controller paths
        if (global.showDiagnostics.paths == true) {
            var colors = ['#ffffff', '#00FFFF', '#FF8C00', '#7FFF00', '#FFD700'];
            for(i = 0; i < Memory.paths.length; i++){
                for(j = 0; j < Memory.paths[i].object_Path.length - 1; j++) {
                    new RoomVisual().line(Memory.paths[i].object_Path[j].x, Memory.paths[i].object_Path[j].y, Memory.paths[i].object_Path[j + 1].x, Memory.paths[i].object_Path[j + 1].y, {color: colors[i]});
                }
            }
        }
        
        /*
         * check every 50 ticks that construction can occur for the following main roads to sources and spawn
         * if no spots remaining in the master list then construction flag returns false
        */
        
        var result_Tick = calculations.skip_ticks(global.delta_Tick);

        if (result_Tick == true) {
            building_Layouts.main_roads(room);
        }
        building_Layouts.initial_locations(room);
        building_Layouts.spawn_design(room);
        
        console.log('Controller Level = ' + room.controller.level);

        switch(room.controller.level) {
            case 0:
                
                break;
            case 1:

                break;
            case 2:

                break;
            case 3:

                if(towers.length < 1) {
                    console.log("building tower here code");
                    //building_Layouts.tower_design(room);
                }
                break;
            case 4:
                break;
            case 5:
                break;
            case 6:
                break;
            case 7:
                break;
            default:
        }
    }

};