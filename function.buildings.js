/*
 * Functions for base design and layout go here
 *
 *
 */
const calculations = require('./function.calculations');

module.exports = {

    main_roads: function (room) {
        /*
        * function for filtering out all main paths that have no roads on them
        * list can be passed to allow creep to drop construction sites
        * runs every X ticks as CPU intensive
        */

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
        for (let i = 0; i < Memory.paths.length; i++) {
            for (let j = 0; j < Memory.paths[i].object_Path.length; j++) {
                let location = room.lookAt(Memory.paths[i].object_Path[j].x, Memory.paths[i].object_Path[j].y);
                if (location[0].type !== 'structure' && location[0].type !== 'constructionSite' && location[0].type !== 'creep' && location[0].type !== 'source') {
                    room.createConstructionSite(Memory.paths[i].object_Path[j].x, Memory.paths[i].object_Path[j].y, STRUCTURE_ROAD);
                }
            }
        }
        return(true);
    },

    initial_locations: function (room) {
        if (!Memory.room_Locations) {
            let room_Locations = [];
            let room_Buffer = [];
            let spawn = room.find(FIND_MY_STRUCTURES, {
                filter: function (object) {
                    return object.structureType === STRUCTURE_SPAWN;
                }
            });
            let control = room.find(FIND_MY_STRUCTURES, {
                filter: function (object) {
                    return object.structureType === STRUCTURE_CONTROLLER;
                }
            });
            let sources = room.find(FIND_SOURCES);
            room_Locations.push(spawn[0]);
            room_Locations.push(control[0]);
            for (let i = 0; i < sources.length; i++) {
                room_Locations.push(sources[i]);
            }
            for (let i = 0; i < room_Locations.length; i++) {
                let buffer1 = room.lookForAt(LOOK_STRUCTURES, room_Locations[i].pos.x, room_Locations[i].pos.y);
                if (!_.isEmpty(buffer1)) {
                    room_Buffer.push(buffer1);
                } else {
                    let buffer2 = room.lookForAt(LOOK_SOURCES, room_Locations[i].pos.x, room_Locations[i].pos.y);
                    if (!_.isEmpty(buffer2)) {
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
    tower_design: function (room) {
        /*
            TODO: Use search within range built in function around specific areas
                then check if those areas are not walls
                check if they block a path
                check that they are accessible
                then rank all remaining areas for best choice for a tower location
                store location in memory

         */

        if (!Memory.tower_Locations) {
            Memory.tower_Locations = [];
            let tower_Location = [];
            let sum_x = 0;
            let sum_y = 0;

            for (let j = 0; j < 3; j++) {
                if (j === 0) {
                    for (let i = 0; i < Memory.room_Locations.length; i++) {
                        sum_x += Memory.room_Locations[i][0].pos.x;
                        sum_y += Memory.room_Locations[i][0].pos.y;
                    }
                    Memory.tower_Locations.push({
                        x: Math.floor(sum_x / Memory.room_Locations.length),
                        y: Math.floor(sum_y / Memory.room_Locations.length),
                    });
                    tower_Location.push({
                        x: Math.floor(sum_x / Memory.room_Locations.length),
                        y: Math.floor(sum_y / Memory.room_Locations.length),
                    });
                }
                else
                {
                    sum_x = 0;
                    sum_y = 0;
                    let n = 0;
                    for (let i = 0; i < Memory.room_Locations.length; i++) {
                        let position = new RoomPosition(Memory.room_Locations[i][0].pos.x, Memory.room_Locations[i][0].pos.y, room.name);
                        if (!position.inRangeTo(Memory.tower_Locations[j-1].x, Memory.tower_Locations[j-1].y, 10)) {
                            sum_x += Memory.room_Locations[i][0].pos.x;
                            sum_y += Memory.room_Locations[i][0].pos.y;
                            n += 1;
                        }
                    }
                    sum_x += tower_Location[j-1].x;
                    sum_y += tower_Location[j-1].y;
                    Memory.tower_Locations.push({
                        x: Math.floor(sum_x / (n + j)),
                        y: Math.floor(sum_y / (n + j)),
                    });
                    tower_Location.push({
                        x: Math.floor(sum_x / (n + j)),
                        y: Math.floor(sum_y / (n + j)),
                    });
                }
            }
        }
    },
    spawn_design: function (room) {
        /*
        *   1) scan area around the spawn
        *   2) create road 1 unit around spawn
        *   3) determine closest quadrant to sources and rank downwards
        *   4) alternate E->R R->E for initial 11 x 11 square design
        *   5)
        */
        let spawn = room.find(FIND_MY_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType === STRUCTURE_SPAWN;
            }
        });

        if (!Memory.spawnArea) {

            let spawnArea = room.lookAtArea(spawn[0].pos.y - 5, spawn[0].pos.x - 5, spawn[0].pos.y + 5, spawn[0].pos.x + 5, true);
            let results = _.filter(spawnArea, function (position) {
                return (position.x >= spawn[0].pos.x - 5 && position.x <= spawn[0].pos.x + 5 && position.y >= spawn[0].pos.y - 5 && position.y <= spawn[0].pos.y + 5 && (position.x !== spawn[0].pos.x || position.y !== spawn[0].pos.y));
            });
            Memory.spawnArea = results;
        }

        if (!Memory.quadOrder) {
            let quadCalc = [{quad: 1, x: spawn[0].pos.x + 3, y: spawn[0].pos.y - 3}, {
                quad: 2,
                x: spawn[0].pos.x - 3,
                y: spawn[0].pos.y - 3
            }, {quad: 3, x: spawn[0].pos.x - 3, y: spawn[0].pos.y + 3}, {
                quad: 4,
                x: spawn[0].pos.x + 3,
                y: spawn[0].pos.y + 3
            }];
            let quadOrder = [];
            for (let j = 0; j < quadCalc.length; j++) {
                let distance = calculations.closest_distance(quadCalc[j].x, quadCalc[j].y, Memory.room_Locations);
                quadOrder.push({quad: j + 1, distance: distance});
            }
            quadOrder.sort(function (a, b) {
                return parseFloat(a.distance) - parseFloat(b.distance);
            });
            Memory.quadOrder = quadOrder;

        }

        if (!Memory.buildZones) {
            Memory.buildZones = [];
            for(let i = 0; i < Memory.quadOrder.length; i++){
                let quad_choice = Memory.quadOrder[i].quad;
                Memory.buildZones.push(this.quad_patterns(room, spawn, quad_choice));
            }
        }
    },

    quad_patterns: function (room, spawn, quad_choice) {
        /*
          Function to handle quad designs
         */
        let quadrant = [];
        let extension_flag = true;
        if (quad_choice === 1) {
            for(let i = 1; i < 6; i++) {
                for(let j = 1; j < 6; j++) {
                    let position = new RoomPosition(spawn[0].pos.x + j, spawn[0].pos.y - i, room.name);
                    const look = position.look();
                    if (look.length <= 1 && look[0].terrain !== 'wall') {
                        if (position.x === spawn[0].pos.x + 1 && position.y === spawn[0].pos.y - 1) {
                            quadrant.push({'x':position.x, 'y':position.y, 'planned_construction':'road', 'roomName':position.roomName});
                        }
                        else {
                            if (extension_flag === true) {
                                quadrant.push({'x':position.x, 'y':position.y, 'planned_construction':'extension', 'roomName':position.roomName});
                                extension_flag = false;
                            }
                            else {
                                quadrant.push({'x':position.x, 'y':position.y, 'planned_construction':'road', 'roomName':position.roomName});
                                extension_flag = true;
                            }
                        }
                    }
                }
            }

        }
        if (quad_choice === 2) {
            for(let i = 1; i < 6; i++) {
                for(let j = 1; j < 6; j++) {
                    let position = new RoomPosition(spawn[0].pos.x - j, spawn[0].pos.y - i, room.name);
                    const look = position.look();
                    if (look.length <= 1 && look[0].terrain !== 'wall') {
                        if (position.x === spawn[0].pos.x - 1 && position.y === spawn[0].pos.y - 1) {
                            quadrant.push({'x':position.x, 'y':position.y, 'planned_construction':'road', 'roomName':position.roomName});
                        }
                        else {
                            if (extension_flag === true) {
                                quadrant.push({'x':position.x, 'y':position.y, 'planned_construction':'extension', 'roomName':position.roomName});
                                extension_flag = false;
                            }
                            else {
                                quadrant.push({'x':position.x, 'y':position.y, 'planned_construction':'road', 'roomName':position.roomName});
                                extension_flag = true;
                            }
                        }
                    }
                }
            }
        }
        if (quad_choice === 3) {
            for(let i = 1; i < 6; i++) {
                for(let j = 1; j < 6; j++) {
                    let position = new RoomPosition(spawn[0].pos.x - j, spawn[0].pos.y + i, room.name);
                    const look = position.look();
                    if (look.length <= 1 && look[0].terrain !== 'wall') {
                        if (position.x === spawn[0].pos.x - 1 && position.y === spawn[0].pos.y + 1) {
                            quadrant.push({'x':position.x, 'y':position.y, 'planned_construction':'road', 'roomName':position.roomName});
                        }
                        else {
                            if (extension_flag === true) {
                                quadrant.push({'x':position.x, 'y':position.y, 'planned_construction':'extension', 'roomName':position.roomName});
                                extension_flag = false;
                            }
                            else {
                                quadrant.push({'x':position.x, 'y':position.y, 'planned_construction':'road', 'roomName':position.roomName});
                                extension_flag = true;
                            }
                        }
                    }
                }
            }
        }
        if (quad_choice === 4) {
            for(let i = 1; i < 6; i++) {
                for(let j = 1; j < 6; j++) {
                    let position = new RoomPosition(spawn[0].pos.x + j, spawn[0].pos.y + i, room.name);
                    const look = position.look();
                    if (look.length <= 1 && look[0].terrain !== 'wall') {
                        if (position.x === spawn[0].pos.x + 1 && position.y === spawn[0].pos.y + 1) {
                            quadrant.push({'x':position.x, 'y':position.y, 'planned_construction':'road', 'roomName':position.roomName});
                        }
                        else {
                            if (extension_flag === true) {
                                quadrant.push({'x':position.x, 'y':position.y, 'planned_construction':'extension', 'roomName':position.roomName});
                                extension_flag = false;
                            }
                            else {
                                quadrant.push({'x':position.x, 'y':position.y, 'planned_construction':'road', 'roomName':position.roomName});
                                extension_flag = true;
                            }
                        }
                    }
                }
            }
        }
        return(quadrant);

    },

};