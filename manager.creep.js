/*
 * function to manage the creeps in each room
 */
const utils = require('./function.utils');
const roleCreep = require('./role.creep');
const global = require('./global.variables');

module.exports = {


    simple_manager: function (room) {
        /*
           simple_manager:
               1) takes all creeps in the room and allocates tasks
               2) when upgrading to a specific level new creeps are created when requested by manager.room (future)
        */
        this.spawn_manager(room);
        this.energy_job_manager(room);
        this.controller_job_manager(room);
        this.construction_job_manager(room);
        this.repair_job_manager(room);
        this.creep_upgrade(room);
        this.creep_replacer(room);

        for (let name in Game.creeps) {
            let creep = Game.creeps[name];
            if (!creep.memory.renewing) {
                creep.memory.renewing = false;
            }
            if (!creep.memory.building) {
                creep.memory.building = false;
            }
            if (!creep.memory.repairing) {
                creep.memory.repairing = false;
            }
            roleCreep.run(creep);
        }
    },

    spawn_manager: function (room) {
        /*
            Function for checking task list vs current creep types
        */
        if (!Memory.command_checks) {
            Memory.command_checks = {};
            Memory.command_checks.flag = false;
            Memory.command_checks.creep_name = '';
            Memory.command_checks.spawning_creep = false;
        }

        if (Memory.command_checks.spawning_creep === false) {
            let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' || creep.memory.temp_role === 'harvester');
            let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader' || creep.memory.temp_role === 'upgrader');
            let builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder' || creep.memory.temp_role === 'builder');
            let repairers = _.filter(Game.creeps, (creep) => creep.memory.role === 'repairer' || creep.memory.temp_role === 'repairer');
            let body = [];

            let spawn_flag = false;
            let empty_flag = false;

            if (harvesters.length < global.harvesters && spawn_flag === false) {

                // min # of harvesters to have
                empty_flag = utils.isEmpty(Memory.energy_jobs);
                if (empty_flag === false) {
                    body = this.creep_body_configurator(room, 'harvester');
                    this.creep_creator(room, body, 'harvester', Memory.energy_jobs[0].id, null);
                    spawn_flag = true;
                }
            }
            if (upgraders.length < global.upgraders && spawn_flag === false) {
                // min # of harvesters to have
                // create an upgrader unit to fulfill this task
                empty_flag = utils.isEmpty(Memory.controller_jobs);
                if (empty_flag === false) {
                    body = this.creep_body_configurator(room, 'upgrader');
                    this.creep_creator(room, body, 'upgrader', Memory.controller_jobs[0].id, null);
                    spawn_flag = true;
                }
            }
            if (builders.length < global.builders && spawn_flag === false) {
                // min # of builders to have at least 1 if construction jobs
                empty_flag = utils.isEmpty(Memory.construction_jobs);
                if (empty_flag === false) {
                    body = this.creep_body_configurator(room, 'builder');
                    this.creep_creator(room, body, 'builder', Memory.construction_jobs[0].id, null);
                    spawn_flag = true;
                }
            }
            if (repairers.length < global.repairers && spawn_flag === false) {
                // min # of repairers to have
                empty_flag = utils.isEmpty(Memory.repair_jobs);
                if (empty_flag === false) {
                    body = this.creep_body_configurator(room, 'repairer');
                    this.creep_creator(room, body, 'repairer', Memory.repair_jobs[0].id, null);
                }
            }
        }

    },

    energy_job_manager: function (room) {
        /*
           Energy jobs
        */
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
        let empty_flag = utils.isEmpty(Memory.energy_jobs);
        if (Memory.energy_jobs.length > 0 && empty_flag === false) {
            //check that harvesters exist
            if (harvesters.length > 0) {
                for (let i = 0; i < harvesters.length; i++) {
                    Memory.creeps[harvesters[i].name].assignment = Memory.energy_jobs[0].id;
                    if (Memory.creeps[harvesters[i].name].temp_role !== null) {
                        Memory.creeps[harvesters[i].name].temp_role = null;
                    }
                }
            }
        } else if (Memory.energy_jobs.length <= 0 || empty_flag === true) {
            // no current energy jobs available assign temp work to creep as upgrader
            for (let i = 0; i < harvesters.length; i++) {
                if (Memory.creeps[harvesters[i].name].temp_role === null) {
                    Memory.creeps[harvesters[i].name].temp_role = 'upgrader';
                    Memory.creeps[harvesters[i].name].assignment = '';
                }
            }
        }
    },

    controller_job_manager: function (room) {
        /*
           Controller jobs
       */
        let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader' || creep.memory.temp_role === 'upgrader');
        let empty_flag = utils.isEmpty(Memory.energy_jobs);
        if (Memory.controller_jobs.length > 0 && empty_flag === false) {
            //check that harvesters exist
            if (upgraders.length > 0) {
                for (let i = 0; i < upgraders.length; i++) {
                    Memory.creeps[upgraders[i].name].assignment = Memory.controller_jobs[0].id;
                }
            }
        } else if (Memory.controller_jobs.length <= 0 || empty_flag === true) {
            // no current controller jobs
        }
    },

    construction_job_manager: function (room) {
        /*
             Construction jobs
         */
        let builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');
        let empty_flag = utils.isEmpty(Memory.construction_jobs);
        if (Memory.construction_jobs.length > 0 && empty_flag === false) {
            if (builders.length > 0) {
                for (let i = 0; i < builders.length; i++) {
                    Memory.creeps[builders[i].name].assignment = Memory.construction_jobs[0].id;
                    if (Memory.creeps[builders[i].name].temp_role !== null) {
                        Memory.creeps[builders[i].name].temp_role = null;
                        Memory.creeps[builders[i].name].run_clock_out = false;
                    }
                }
            }
        } else if (Memory.construction_jobs.length <= 0 || empty_flag === true) {
            // no current construction jobs, set builders to be upgraders
            for (let i = 0; i < builders.length; i++) {
                if (Memory.creeps[builders[i].name].temp_role === null) {
                    Memory.creeps[builders[i].name].temp_role = 'upgrader';
                    Memory.creeps[builders[i].name].run_clock_out = true;
                    Memory.creeps[builders[i].name].assignment = '';
                }
            }
        }
    },

    repair_job_manager: function (room) {
        /*
            Repair jobs
        */
        let repairers = _.filter(Game.creeps, (creep) => creep.memory.role === 'repairer');
        let empty_flag = utils.isEmpty(Memory.energy_jobs);

        if (Memory.repair_jobs.length > 0 && empty_flag === false) {
            if (repairers.length > 0) {
                for (let i = 0; i < repairers.length; i++) {
                    Memory.creeps[repairers[i].name].assignment = Memory.repair_jobs[0].id;
                    if (Memory.creeps[repairers[i].name].temp_role !== null) {
                        Memory.creeps[repairers[i].name].temp_role = null;
                        Memory.creeps[repairers[i].name].run_clock_out = false;
                    }
                }
            }
        } else if (Memory.repair_jobs.length <= 0 || empty_flag === true) {
            // no current repair jobs, set repairers to builders
            for (let i = 0; i < repairers.length; i++) {
                if (Memory.creeps[repairers[i].name].temp_role === null) {
                    Memory.creeps[repairers[i].name].temp_role = 'builder';
                    Memory.creeps[repairers[i].name].run_clock_out = true;
                    Memory.creeps[repairers[i].name].assignment = '';
                }
            }
        }
    },

    creep_upgrade: function (room) {
        /*
            Function for forcing creeps to slowly change based on new extension
            1) Poll current creep body average
            2) Check against # of extensions/max energy
            3) If below force upgrading of all creeps to next level
                a) Use force flag that only get's set here and can not be overridden
            4) Switch one creep out at a time for next upgrade path
            5) Trigger suicide when next level creep is created to replace previous creep
         */
        let extensions = room.find(FIND_MY_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType === STRUCTURE_EXTENSION;
            }
        });
        let energy_pool = 300;
        let energy_total = 0;
        energy_pool += (extensions.length * 50);

        if (Memory.command_checks.flag === false  && Memory.command_checks.spawning_creep === false) {
            for (let name in Memory.creeps) {
                let creep = Game.creeps[name];
                energy_total = 0;
                for (let body_part in creep.body) {
                    switch (creep.body[body_part].type) {
                        case 'work':
                            energy_total += 100;
                            break;
                        case 'carry':
                            energy_total += 50;
                            break;
                        case 'move':
                            energy_total += 50;
                            break;
                    }
                }
                if (energy_total < energy_pool) {
                    // select creep for upgrade
                    Memory.command_checks.flag = true;
                    Memory.command_checks.creep_name = name;
                    creep.upgrading_self = true;
                    break;
                }
            }
        }


    },

    creep_replacer: function (room) {
        /*
          Function for replacing creeps when an upgrade needs to occur
          1) check creep role
          2) check if spawn can create creep
          3) create new creep
          4) delete old creep of that nae
          5) reset global memory commands
         */
        if (Object.keys(Memory.creeps).length > 0) {
            let spawn = room.find(FIND_MY_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType === STRUCTURE_SPAWN;
                }
            });
            if (Memory.command_checks.spawning_creep === false && Memory.command_checks.flag === true) {
                if (!Memory.creeps[Memory.command_checks.creep_name]) {
                    //reset the commands
                    Memory.command_checks.creep_name = '';
                    Memory.command_checks.flag = false;
                    Memory.command_checks.spawning_creep = false;
                }
                else {
                    Memory.creeps[Memory.command_checks.creep_name].upgrading_self = true;
                    let body = this.creep_body_configurator(room, Memory.creeps[Memory.command_checks.creep_name].role);
                    let new_creep = Game.spawns[spawn[0].name].createCreep(body, undefined, {
                        role: Memory.creeps[Memory.command_checks.creep_name].role,
                        assignment: Memory.creeps[Memory.command_checks.creep_name].assignment,
                        temp_role: Memory.creeps[Memory.command_checks.creep_name].temp_role,
                        run_clock_out: false,
                        source: '',
                        upgrading_self: false,
                        recycle_me: false,
                        renewing: false,
                        building: false,
                        upgrading: false,
                        repairing: false,
                        harvesting: false
                    });
                    if (new_creep !== -4 && new_creep !== -6) {
                        Memory.command_checks.spawning_creep = true;
                    }
                }
            }

            if (Memory.command_checks.spawning_creep === true && Memory.command_checks.flag === true) {
                if (Game.spawns[spawn[0].name].spawning === null) {
                    Memory.command_checks.spawning_creep = false;
                    Memory.command_checks.flag = false;
                    Memory.creeps[Memory.command_checks.creep_name].recycle_me = true;
                    Memory.command_checks.creep_name = '';
                }
            }
        }

    },

    creep_creator: function (room, body, role, assignment, temp_role) {
        /*
            Function for creating customized creeps
            //TODO: only works for 1 spawn rooms, fix this for multiple spawns (potentially create spawning queue for choices)

         */
        let spawn = room.find(FIND_MY_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType === STRUCTURE_SPAWN;
            }
        });

        let new_creep = Game.spawns[spawn[0].name].createCreep(body, undefined, {
            role: role,
            assignment: assignment,
            temp_role: temp_role,
            run_clock_out: false,
            source: '',
            upgrading_self: false,
            recycle_me: false,
            renewing: false,
            building: false,
            upgrading: false,
            repairing: false,
            harvesting: false
        });
        console.log('Spawning new creep: ' + new_creep);

    },

    creep_body_configurator: function (room, role) {
        /*
             Function for calculating the maximum body allocation for a creep of a specific role
             // check extensions
             // check spawn
             // check that a creep exists that is bringing energy back (to catch stall case of no creeps bringing energy back for making a new creep on the extensions)
         */
        let extensions = room.find(FIND_MY_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType === STRUCTURE_EXTENSION;
            }
        });
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
        let energy_pool = 300;
        let body = [WORK, WORK, CARRY, MOVE]; // 300 energy from spawn

        if (harvesters.length <= 0 && Memory.command_checks.spawning_creep === false) {
            // use spawn only option for creating a creep
            energy_pool = 300;
        } else {
            // can utilize spawn and extensions under the assumption they will be filled by a creep
            energy_pool += (extensions.length * 50);

        }
        //console.log('Energy pool = ', energy_pool);
        /*
            Body Part       Build Cost
            ----------------------------
                MOVE            50
                WORK            100
                CARRY           50
                ATTACK          80
                RANGED_ATTACK   150
                HEAL            250
                CLAIM           500
                TOUGH           10

         */
        if (energy_pool > 300) {
            switch (extensions.length) {
                case 1: //50 extra
                    if (role === 'harvester') {
                        body.push(CARRY);

                    } else if (role === 'upgrader') {
                        body.push(MOVE);

                    } else if (role === 'repairer') {
                        body.push(MOVE);

                    } else if (role === 'builder') {
                        body.push(MOVE);

                    } else if (role === 'fighter') {
                        body = [ATTACK, ATTACK, ATTACK, MOVE, MOVE, TOUGH];

                    } else {

                    }
                    break;

                case 2: //100 extra
                    if (role === 'harvester') {
                        body.push(WORK);

                    } else if (role === 'upgrader') {
                        body.push(WORK);

                    } else if (role === 'repairer') {
                        body.push(WORK);

                    } else if (role === 'builder') {
                        body.push(WORK);

                    } else if (role === 'fighter') {
                        body = [ATTACK, ATTACK, ATTACK, MOVE, MOVE, TOUGH, MOVE];

                    } else {

                    }
                    break;

                case 3: //150 extra
                    if (role === 'harvester') {
                        body.push(WORK, CARRY);

                    } else if (role === 'upgrader') {
                        body.push(WORK, CARRY);

                    } else if (role === 'repairer') {
                        body.push(WORK, CARRY);

                    } else if (role === 'builder') {
                        body.push(WORK, CARRY);

                    } else if (role === 'fighter') {
                        body = [ATTACK, ATTACK, ATTACK, MOVE, MOVE, TOUGH, MOVE, MOVE];

                    } else {

                    }
                    break;

                case 4: //200 extra
                    if (role === 'harvester') {
                        body.push(WORK, WORK);

                    } else if (role === 'upgrader') {
                        body.push(WORK, CARRY, MOVE);

                    } else if (role === 'repairer') {
                        body.push(WORK, CARRY, MOVE);

                    } else if (role === 'builder') {
                        body.push(WORK, CARRY, MOVE);

                    } else if (role === 'fighter') {
                        body = [ATTACK, ATTACK, ATTACK, MOVE, MOVE, TOUGH, MOVE, ATTACK, TOUGH, TOUGH, TOUGH];

                    } else {

                    }
                    break;

                case 5: //250 extra
                    if (role === 'harvester') {
                        body.push(WORK, WORK, CARRY);

                    } else if (role === 'upgrader') {
                        body.push(WORK, CARRY, MOVE, CARRY);

                    } else if (role === 'repairer') {
                        body.push(WORK, CARRY, MOVE, CARRY);

                    } else if (role === 'builder') {
                        body.push(WORK, CARRY, MOVE, CARRY);

                    } else if (role === 'fighter') {
                        body = [ATTACK, ATTACK, ATTACK, MOVE, MOVE, TOUGH, MOVE, ATTACK, TOUGH, TOUGH, TOUGH, MOVE];

                    } else {

                    }
                    break;

                case 6: //300 extra
                    if (role === 'harvester') {
                        body.push(WORK, WORK, MOVE, CARRY);

                    } else if (role === 'upgrader') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY);

                    } else if (role === 'repairer') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY);

                    } else if (role === 'builder') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY);

                    } else if (role === 'fighter') {
                        body = [ATTACK, ATTACK, ATTACK, MOVE, MOVE, TOUGH, MOVE, ATTACK, TOUGH, TOUGH, TOUGH, ATTACK, TOUGH, TOUGH];

                    } else {

                    }
                    break;

                case 7: //350 extra
                    if (role === 'harvester') {
                        body.push(WORK, WORK, MOVE, WORK);

                    } else if (role === 'upgrader') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY, MOVE);

                    } else if (role === 'repairer') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY, MOVE);

                    } else if (role === 'builder') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY, MOVE);

                    } else if (role === 'fighter') {
                        body = [ATTACK, ATTACK, ATTACK, MOVE, MOVE, TOUGH, MOVE, ATTACK, TOUGH, TOUGH, TOUGH, ATTACK, TOUGH, TOUGH, MOVE];

                    } else {

                    }
                    break;

                case 8: //400 extra
                    if (role === 'harvester') {
                        body.push(WORK, WORK, MOVE, WORK, MOVE);

                    } else if (role === 'upgrader') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY, WORK);

                    } else if (role === 'repairer') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY, WORK);

                    } else if (role === 'builder') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY, WORK);

                    } else if (role === 'fighter') {
                        body = [ATTACK, ATTACK, ATTACK, MOVE, MOVE, TOUGH, MOVE, ATTACK, TOUGH, TOUGH, TOUGH, ATTACK, TOUGH, TOUGH, ATTACK, TOUGH, TOUGH];

                    } else {

                    }
                    break;

                case 9: //450 extra
                    if (role === 'harvester') {
                        body.push(WORK, WORK, MOVE, WORK, MOVE, CARRY);

                    } else if (role === 'upgrader') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY, WORK, MOVE);

                    } else if (role === 'repairer') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY, WORK, MOVE);

                    } else if (role === 'builder') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY, WORK, MOVE);

                    } else if (role === 'fighter') {
                        body = [ATTACK, ATTACK, ATTACK, MOVE, MOVE, TOUGH, MOVE, ATTACK, TOUGH, TOUGH, TOUGH, ATTACK, TOUGH, TOUGH, ATTACK, TOUGH, TOUGH, MOVE];

                    } else {

                    }
                    break;

                case 10: //500 extra
                    if (role === 'harvester') {
                        body.push(WORK, WORK, MOVE, WORK, MOVE, CARRY, CARRY);

                    } else if (role === 'upgrader') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY, WORK, MOVE, CARRY);

                    } else if (role === 'repairer') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY, WORK, MOVE, CARRY);

                    } else if (role === 'builder') {
                        body.push(WORK, CARRY, MOVE, CARRY, CARRY, WORK, MOVE, CARRY);

                    } else if (role === 'fighter') {
                        body = [ATTACK, ATTACK, ATTACK, MOVE, MOVE, TOUGH, MOVE, ATTACK, TOUGH, TOUGH, TOUGH, ATTACK, TOUGH, TOUGH, ATTACK, TOUGH, TOUGH, ATTACK, TOUGH, TOUGH];

                    } else {

                    }
            }
        }

        return (body);


    }
};