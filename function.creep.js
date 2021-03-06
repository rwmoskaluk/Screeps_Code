/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('function.creep');
 * mod.thing == 'a thing'; // true
 *
 *
 *      1) When to renew a creep
 *          a) based on ticks remaining, do this action until topped off
 *          b) or until energy reaches specific level
 *      2) upgrade units based on extensions in room
 *      3) energy left after X time
 *          a) check how much to renew creep
 *          b) factor in energy pool of room
 *
 *
 */

let functionCreep = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let creepMaxTime = 1500;
        let creepTickFullPercent = 0.95;
        let creepTickPercent = 0.3;

        if (creep.memory.renewing === false  && creep.memory.recycle_me === false) {

            if (creep.ticksToLive <= creepTickPercent * creepMaxTime && creep.memory.run_clock_out === false  && creep.memory.upgrading_self === false) {
                creep.memory.renewing = true;
            }
        }
        else {
            let spawn = creep.room.find(FIND_MY_STRUCTURES, {
                filter: function(structure) {
                    return structure.structureType === STRUCTURE_SPAWN;
                }
            });
            if (spawn.length > 0) {
                if (creep.memory.recycle_me === true) {
                    if (spawn[0].recycleCreep(creep) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(spawn[0], {visualizePathStyle: {stroke: '#ff0e2e'}});
                    }
                    else {
                        Memory.command_checks.creep_name = '';
                    }
                }
                else {
                    if (spawn[0].renewCreep(creep) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(spawn[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                    } else {
                        if (creep.transfer(spawn[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(spawn[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                        spawn[0].renewCreep(creep);
                    }
                }
            }
            if (creep.ticksToLive >= creepTickFullPercent * creepMaxTime) {
                creep.memory.renewing = false;
            }
        }
    }
};

module.exports = functionCreep;