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

var functionCreep = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var creepMaxTime = 1500;
        var creepTickFullPercent = 0.95;
        var creepTickPercent = 0.3;
        if (creep.memory.renewing == false) {

            if (creep.ticksToLive <= creepTickPercent * creepMaxTime) {
                creep.memory.renewing = true;
            }
        }
        else {
            var spawn = creep.room.find(FIND_MY_STRUCTURES, {
                filter: function(structure) {
                    return structure.structureType == STRUCTURE_SPAWN;
                }
            });
            if (spawn.length > 0) {

                if (spawn[0].renewCreep(creep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                else {
                     if(creep.transfer(spawn[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(spawn[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                    spawn[0].renewCreep(creep);
                }
            }
            if (creep.ticksToLive >= creepTickFullPercent * creepMaxTime) {
                creep.memory.renewing = false;
            }
        }
    }
};

module.exports = functionCreep;