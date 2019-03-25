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
        let rank = 0;

        let energy_results = room.find(FIND_MY_STRUCTURES, {
            filter: function(object){
                return (object.structureType === STRUCTURE_SPAWN ||
                    object.structureType === STRUCTURE_EXTENSION) &&
                    (object.energy < object.energyCapacity)}
        });
        console.log(energy_results.length);
        if (energy_results.length > 0) {
            for (let i = 0; i < energy_results.length; i++) {
                console.log(JSON.stringify(energy_results[i].id));
                task_list.push({
                    id: energy_results[i].id,
                    structureType: energy_results[i].structureType,
                    job: 'energy',
                    assigned: '',
                    rank: 5
                });
            }
        }

        let control = room.find(FIND_MY_STRUCTURES, {
            filter: function (object) {
                return object.structureType === STRUCTURE_CONTROLLER;
            }
        });
        if (control.length > 0) {
            task_list.push({
                id: control[0].id,
                structureType: control[0].structureType,
                job: 'upgrade controller',
                assigned: '',
                rank: 5
            });
        }
        let construction_results = room.find(FIND_CONSTRUCTION_SITES);
        if (construction_results.length > 0) {
            for (let i = 0; i < construction_results.length; i++) {
                if (construction_results[i].structureType === STRUCTURE_ROAD) {
                    rank = 1;
                }
                if (construction_results[i].structureType === STRUCTURE_EXTENSION) {
                    rank = 4;
                }
                if (construction_results[i].structureType === STRUCTURE_TOWER) {
                    rank = 5;
                }
                if (construction_results[i].structureType === STRUCTURE_CONTAINER) {
                    rank = 3;
                }

                task_list.push({
                    id: construction_results[i].id,
                    structureType: construction_results[i].structureType,
                    job: 'construction',
                    assigned: '',
                    rank: rank
                });
            }
        }

        let repair_sites = room.find(FIND_STRUCTURES, {
            filter: function(object){
                return object.structureType === STRUCTURE_ROAD && (object.hits < object.hitsMax * 0.5);
            }
        });
        if (repair_sites.length > 0) {
            for (let i = 0; i < repair_sites.length; i++) {
                if (repair_sites[i].structureType === STRUCTURE_ROAD) {
                    rank = 1;
                }
                if (repair_sites[i].structureType === STRUCTURE_EXTENSION || repair_sites[i].structureType === STRUCTURE_WALL || repair_sites[i].structureType === STRUCTURE_RAMPART) {
                    rank = 4;
                }
                if (repair_sites[i].structureType === STRUCTURE_TOWER) {
                    rank = 5;
                }
                if (repair_sites[i].structureType === STRUCTURE_CONTAINER) {
                    rank = 3;
                }

                task_list.push({
                    id: repair_sites[i].id,
                    structureType: repair_sites[i].structureType,
                    job: 'repair',
                    assigned: '',
                    rank: rank
                });
            }
        }

        Memory.task_list = task_list;
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

        return {
            codeRevision: 5, // Increment before deploy to force a new game state
            rooms: Object.keys(Game.rooms).length,
            creeps: Object.keys(Game.creeps).length,
            spawns: Object.keys(Game.spawns).length,
            structures: Object.keys(Game.structures).length,
            sites: Object.keys(Game.constructionSites).length,
            tasks: Memory.task_list.length,
            rclTotal: rclTotal
        }
    },

    task_checker : function(tasks, rank) {
        /*
        Function for checking specific ranks that are available for completion
         */
        let specific_task = _.filter(tasks, function (task) {
            return (task.rank === rank);
        });
        console.log(JSON.stringify(specific_task));

        if (specific_task.length > 0) {
            specific_task = specific_task[0];
        }
        console.log(JSON.stringify(specific_task));
        return(specific_task)
    },

    task_filter : function() {
        /*
            Function for filtering task list into sub list for processing and assigning to creeps
         */
        let controller_jobs = _.filter(Memory.task_list, function(job_description) {
            return (job_description.job === 'upgrade controller');
        });

        let energy_jobs = _.filter(Memory.task_list, function(job_description) {
            return (job_description.job === 'energy');
        });

        let construction_jobs = _.filter(Memory.task_list, function(job_description) {
           return (job_description.job === 'construction');
        });

        let repair_jobs = _.filter(Memory.task_list, function(job_description) {
            return (job_description.job === 'repair');
        });

        Memory.controller_jobs = controller_jobs;
        Memory.energy_jobs = energy_jobs;
        Memory.construction_jobs = construction_jobs;
        Memory.repair_jobs = repair_jobs;
    },

    task_sources : function() {
        /*
            Function for assigning creeps to sources to reduce blocking
         */
    }

};