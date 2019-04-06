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
                this.construction_manager(room, 2);
                break;
            case 3:
                this.construction_manager(room, 3);
                break;
            case 4:
                this.construction_manager(room, 4);
                break;
            case 5:
                this.construction_manager(room, 5);
                break;
            case 6:
                this.construction_manager(room, 6);
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
                1) Add in road sequencing for main roads first?
         */
        // check how many extensions are available and have not been made into construction sites

        let extension_structures = room.find(FIND_MY_STRUCTURES, {
            filter: {structureType: STRUCTURE_EXTENSION}
        });
        let extension_construction = room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: {structureType: STRUCTURE_EXTENSION}
        });

        let current_extensions = extension_structures.concat(extension_construction).length;

        if (rcl >= 3) {
            let tower_structures = room.find(FIND_MY_STRUCTURES, {
                filter: {structureType: STRUCTURE_TOWER}
            });

            let tower_construction = room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: {structureType: STRUCTURE_TOWER}
            });
            let current_towers = tower_structures.concat(tower_construction).length;
            this.construction_tower(room, rcl, current_towers);

        }

        this.construction_extensions(room, rcl, current_extensions);


    },

    construction_extensions : function(room, rcl, current_extensions) {
        /*
            Adds extensions in the correct base building order based on base design sequence
         */
        let extension_num = 0;
        switch (rcl) {
            case 2:
                extension_num = 5;
                break;
            case 3:
                extension_num = 10;
                break;
            case 4:
                extension_num = 20;
                break;
            case 5:
                extension_num = 30;
                break;
            case 6:
                extension_num = 40;
                break;
        }
        if (current_extensions < extension_num) {
            // create more extensions
            for (let grid = 0; grid < Memory.buildZones.length; grid++) {
                for (let i = 0; i < Memory.buildZones[grid].length; i++) {
                    if (Memory.buildZones[grid][i].planned_construction === 'extension' && current_extensions < extension_num) {
                        let result = room.createConstructionSite(Memory.buildZones[grid][i].x, Memory.buildZones[grid][i].y, STRUCTURE_EXTENSION);
                        if (result === 0) {
                            current_extensions++;
                        }
                        if (result === -7) {
                            // do nothing
                        } else {
                            // do nothing
                        }
                    }
                    if (current_extensions >= extension_num) {
                        break;
                    }
                }
                if (current_extensions >= extension_num) {
                    break;
                }
            }
        }

    },

    construction_tower : function(room, rcl, current_towers) {
        /*
            Adds tower to tower location
         */
        let tower_num = 0;
        switch (rcl) {
            case 2:
                tower_num = 0;
                break;
            case 3:
                tower_num = 1;
                break;
            case 4:
                tower_num = 1;
                break;
            case 5:
                tower_num = 2;
                break;
            case 6:
                tower_num = 2;
                break;
        }

        if (current_towers < tower_num) {
            for (let i = 0; i < Memory.tower_Locations.length; i++) {
                if (current_towers < tower_num) {
                    let result = room.createConstructionSite(Memory.tower_Locations[i].x, Memory.tower_Locations[i].y, STRUCTURE_TOWER);
                    if (result === 0) {
                        current_towers++;
                    }
                    if (result === -7) {
                        // do nothing
                    } else {
                        // do nothing
                    }
                }
                if (current_towers >= tower_num) {
                    break;
                }
            }
        }
    }

};