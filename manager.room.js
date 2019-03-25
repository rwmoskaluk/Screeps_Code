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

    room_manager : function(room) {
        /*
         * check every 50 ticks that construction can occur for the following main roads to sources and spawn
         * if no spots remaining in the master list then construction flag returns false
        */

        let containers, extensions, tower, storage_Container = 0;
        let buildings = room.find(FIND_STRUCTURES, {
            filter: {structureType: STRUCTURE_EXTENSION || STRUCTURE_TOWER}
        });
        let towers = room.find(FIND_STRUCTURES, {
            filter: {structureType: STRUCTURE_TOWER}
        });

        let result_Tick = calculations.skip_ticks(global.delta_Tick);

        if (result_Tick === true) {
            let initial_room_setup = building_Layouts.main_roads(room);
            if (initial_room_setup === true) {
                building_Layouts.spawn_design(room);
            }

        }
        building_Layouts.initial_locations(room);
        building_Layouts.tower_design(room);


        console.log('Controller Level = ' + room.controller.level);

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
                //this.construction_manager(room, 2);
                break;
            case 3:

                if(towers.length < 1) {
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

    construction_manager : function(room, rcl) {
        /*
            Function for managing construction sites based on next RCL
            //TODO: top priority
         */
        switch (rcl) {
            case 2:
                // 5 extensions available
                // check how many extensions construction sites have been placed
                // along with how many extensions exist as structures
                //for (let i = 0; i < 5; i++)
        }

    }



};