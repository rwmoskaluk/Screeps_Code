/*
 * function for managing the each room
 * 1) track all energy consumed and gathered
 * 2) Based on 1) and controller level allow the following
 *      a) upgrade creep flag
 *      b) construction flag
 *      c) repair flag
 */
 
const global = require('global.variables');
const calculations = require('./function.calculations');
const building_Layouts = require('./function.buildings');
const diagnostics = require('./diagnostics');

let self = module.exports = {
    room_info: function(room) {
        let containers, extensions, tower, storage_Container = 0;
        let buildings = room.find(FIND_STRUCTURES, {
            filter: {structureType: STRUCTURE_EXTENSION || STRUCTURE_TOWER}
        });
        let towers = room.find(FIND_STRUCTURES, {
            filter: {structureType: STRUCTURE_TOWER}
        });
        

        
        /*
        * Calculate optimal path to each source and controller from spawn
        * store this in an array 
        * check off when road has been completed to each
        * show path then draw in red the paths leading from spawn to objects in room
        */
        if (!Memory.paths) {
            let paths = [];
            let spawn = room.find(FIND_MY_STRUCTURES, {
                filter: function(structure) {
                    return structure.structureType == STRUCTURE_SPAWN;
                }
            });
            let room_Controller = room.find(FIND_MY_STRUCTURES, {
                filter: function(structure) {
                    return structure.structureType == STRUCTURE_CONTROLLER;
                }
            });
            let room_Sources = room.find(FIND_SOURCES);
            paths.push({object_Path: room.findPath(spawn[0].pos, room_Controller[0].pos, {ignoreCreeps: true, ignoreRoads: true})});
            
            for(let i = 0; i < room_Sources.length; i++) {
                paths.push({object_Path: room.findPath(spawn[0].pos, room_Sources[i].pos, {ignoreCreeps: true, ignoreRoads: true})});
                paths.push({object_Path: room.findPath(room_Sources[i].pos, room_Controller[0].pos, {ignoreCreeps: true, ignoreRoads: true})});
            }
            Memory.paths = paths;
        }
        
        /*
         * check every 50 ticks that construction can occur for the following main roads to sources and spawn
         * if no spots remaining in the master list then construction flag returns false
        */
        
        let result_Tick = calculations.skip_ticks(global.delta_Tick);

        if (result_Tick == true) {
            let initial_room_setup = building_Layouts.main_roads(room);
            if (initial_room_setup == true) {
                building_Layouts.spawn_design(room);
            }

        }
        building_Layouts.initial_locations(room);
        building_Layouts.tower_design(room);

        //building_Layouts.spawn_design(room);
        
        //console.log('Controller Level = ' + room.controller.level);

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

        switch(room.controller.level) {
            case 0:
                
                break;
            case 1:

                break;
            case 2:
                //TODO: need to place first set of extensions
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
        diagnostics.visualizations(room);
        diagnostics.print_tasks();
    },



};