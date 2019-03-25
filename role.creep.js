const functionCreep = require('function.creep');

const roleCreep = {

    /** @param {Creep} creep **/
    run: function(creep) {

        functionCreep.run(creep);
        let current_role = '';
        if (creep.memory.temp_role === null) {
            current_role = creep.memory.role;
            //console.log('current role = ', current_role);
            //console.log('temp role = ', creep.memory.temp_role);
        }
        else {
            current_role = creep.memory.temp_role;
            //console.log('current role temp = ', creep.memory.role);
            //console.log('temp role = ', current_role);
        }


        if (current_role === 'harvester') {
            if (creep.memory.renewing === false) {
                if (creep.carry.energy < creep.carryCapacity) {
                    let sources = {};
                    if (creep.memory.source === '') {
                        sources = creep.pos.findClosestByRange(FIND_SOURCES);
                    }
                    else {
                        sources = Game.getObjectById(creep.memory.source);
                    }
                    if (creep.harvest(sources) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                } else {
                    let targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_TOWER) &&
                                structure.energy < structure.energyCapacity;
                        }
                    });
                    if (targets.length > 0) {
                        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    } else {
                        //roleUpgrader.run(creep);
                        //creep.memory.assignment = '';
                    }
                }
            }
        }
        else if (current_role === 'upgrader') {
            if (creep.memory.renewing === false) {
                if(creep.memory.upgrading && creep.carry.energy === 0) {
                    creep.memory.upgrading = false;
                    //creep.say('🔄 harvest');
                }
                if(!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
                    creep.memory.upgrading = true;
                    //creep.say('⚡ upgrade');
                }
                let target = {};
                if(creep.memory.upgrading) {
                    if (creep.memory.assignment === '') {
                        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                    else {
                        target = Game.getObjectById(creep.memory.assignment);
                        if (creep.upgradeController(target) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                }
                else {
                    let sources = {};
                    if (creep.memory.source === '') {
                        sources = creep.pos.findClosestByRange(FIND_SOURCES);
                    }
                    else {
                        sources = Game.getObjectById(creep.memory.source);
                    }
                    if(creep.harvest(sources) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
            }
        }
        else if (current_role === 'builder') {
            if (creep.memory.renewing === false) {
                if (creep.carry.energy < creep.carryCapacity && creep.memory.building === false) {
                    let sources = {};
                        if (creep.memory.source === '') {
                        sources = creep.pos.findClosestByRange(FIND_SOURCES);
                    }
                    else {
                        sources = Game.getObjectById(creep.memory.source);
                    }
                    if (creep.harvest(sources) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                } else {
                    let target = {};
                    if (creep.memory.assignment === '') {
                        target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);

                    } else {

                        target = Game.getObjectById(creep.memory.assignment);
                        if (target) {
                            if (target.progress) {
                                if (target.progress === target.progressTotal) {
                                    creep.memory.assignment = '';
                                }
                            }
                            else {
                                creep.memory.assignment = '';
                            }
                        }
                    }
                    if (target) {
                        creep.memory.building = creep.carry.energy !== 0;
                        if (creep.build(target) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    } else {
                        creep.memory.building = false;
                        //roleHarvester.run(creep);
                    }
                }
            }
        }
        else if (current_role === 'repairer') {
            if (creep.memory.renewing === false) {
                if (creep.carry.energy < creep.carryCapacity && creep.memory.repairing === false) {
                    let sources = {};
                    if (creep.memory.source === '') {
                        sources = creep.pos.findClosestByRange(FIND_SOURCES);
                    }
                    else {
                        sources = Game.getObjectById(creep.memory.source);
                    }
                    if (creep.harvest(sources) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                } else {
                    let target = {};
                    if (creep.memory.assignment === '') {
                        target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: function (object) {
                                return object.structureType === STRUCTURE_ROAD && (object.hits < object.hitsMax * 0.5);
                            }
                        });
                    }
                    if (target) {
                        creep.memory.repairing = creep.carry.energy !== 0;
                        //set it so that it gets locked out and target is repaired to full health
                        if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    } else {
                        creep.memory.repairing = false;
                        //roleUpgrader.run(creep);
                    }
                }
            }
        }
        else if (current_role === 'fighter') {

        }

    }
};

module.exports = roleCreep;