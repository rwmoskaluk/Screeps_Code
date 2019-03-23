/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */
var roleHarvester = require('role.harvester');
var functionCreep = require('function.creep');

var roleBuilder = {
  run: function(creep) {
        
        functionCreep.run(creep);
        if (creep.memory.renewing == false) {
            if(creep.carry.energy < creep.carryCapacity && creep.memory.building == false) {
                var sources = creep.pos.findClosestByRange(FIND_SOURCES);
                if(creep.harvest(sources) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else {
                const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if(target) {
                    if(creep.carry.energy == 0) {
                        creep.memory.building = false;
                    }
                    else {
                        creep.memory.building = true;

                    }
                    if(creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                else {
                    creep.memory.building = false;
                    roleHarvester.run(creep);
                }
            }
       }

	}
};

module.exports = roleBuilder;