module.exports = {

    task_list: function(room) {
        /*
        ranks:
            1 = lowest priority
            2 =
            3 = medium priority
            4 =
            5 = highest priority
         */
        let task_list = [];
        let energy_results = room.find(FIND_MY_STRUCTURES, {
            filter: function(object){
                return (object.structureType === STRUCTURE_SPAWN ||
                    object.structureType == STRUCTURE_EXTENSION) &&
                    (object.energy < object.energyCapacity)}
        });

        console.log(JSON.stringify(energy_results));
        for(let i = 0; i < energy_results.length; i++) {
            task_list.push({id: energy_results[i].id, structureType: energy_results[i].structureType, job: 'energy', assigned: '', rank: 5});
        }

        let control = room.find(FIND_MY_STRUCTURES, {
            filter: function (object) {
                return object.structureType === STRUCTURE_CONTROLLER;
            }
        });
        task_list.push({id: control.id, structureType: control.structureType, job: 'energy', assigned: '', rank: 5});


        let construction_results = room.find(FIND_CONSTRUCTION_SITES);
        console.log(JSON.stringify(construction_results));
        let rank = 0;
        for(let i = 0; i < construction_results.length; i++) {
            if (construction_results[i].structureType == STRUCTURE_ROAD) {
                rank = 1;
            }
            if (construction_results[i].structureType == STRUCTURE_EXTENSION) {
                rank = 4;
            }
            if (construction_results[i].structureType == STRUCTURE_TOWER) {
                rank = 5;
            }
            if (construction_results[i].structureType == STRUCTURE_CONTAINER) {
                rank = 3;
            }

            task_list.push({id: construction_results[i].id, structureType: construction_results[i].structureType, job: 'construction', assigned: '', rank: rank});
        }

        Memory.task_list = task_list;
        for(let i = 0; i < Memory.task_list.length; i++) {
            console.log(JSON.stringify(task_list[i]));
        }
    },

    state_checker: function() {

        let rclTotal = 0;
        _.forEach(Game.rooms, function(room){
            if(room.controller){
                if(room.controller.my){
                    rclTotal += room.controller.level
                }
            }
        });

        let states = {
            codeRevision: 4, // Increment before deploy to force a new game state
            rooms: Object.keys(Game.rooms).length,
            creeps: Object.keys(Game.creeps).length,
            spawns: Object.keys(Game.spawns).length,
            structures: Object.keys(Game.structures).length,
            sites: Object.keys(Game.constructionSites).length,
            tasks: Object.keys(Memory.task_list).length,
            rclTotal: rclTotal
        };

        return states
    },

};