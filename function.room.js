module.exports = {

    room_info: function (room) {
        /*
        * Calculate optimal path to each source and controller from spawn
        * store this in an array
        * check off when road has been completed to each
        * show path then draw in red the paths leading from spawn to objects in room
        */
        if (!Memory.paths) {
            let paths = [];
            let spawn = room.find(FIND_MY_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType === STRUCTURE_SPAWN;
                }
            });
            let room_Controller = room.find(FIND_MY_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType === STRUCTURE_CONTROLLER;
                }
            });
            let room_Sources = room.find(FIND_SOURCES);
            paths.push({
                object_Path: room.findPath(spawn[0].pos, room_Controller[0].pos, {
                    ignoreCreeps: true,
                    ignoreRoads: true
                })
            });

            for (let i = 0; i < room_Sources.length; i++) {
                paths.push({
                    object_Path: room.findPath(spawn[0].pos, room_Sources[i].pos, {
                        ignoreCreeps: true,
                        ignoreRoads: true
                    })
                });
                paths.push({
                    object_Path: room.findPath(room_Sources[i].pos, room_Controller[0].pos, {
                        ignoreCreeps: true,
                        ignoreRoads: true
                    })
                });
            }
            Memory.paths = paths;
        }
    },


};