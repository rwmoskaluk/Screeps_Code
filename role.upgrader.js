/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.upgrader');
 * mod.thing == 'a thing'; // true
 */

var functionCreep = require('function.creep');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        functionCreep.run(creep);
        if (creep.memory.renewing == false) {
            if(creep.memory.upgrading && creep.carry.energy == 0) {
                creep.memory.upgrading = false;
                creep.say('🔄 harvest');
    	    }
    	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
    	        creep.memory.upgrading = true;
    	        creep.say('⚡ upgrade');
    	    }
    
    	    if(creep.memory.upgrading) {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                var sources = creep.pos.findClosestByRange(FIND_SOURCES);
                if(creep.harvest(sources) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
	}
};

module.exports = roleUpgrader;