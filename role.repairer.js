/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.repairer');
 * mod.thing == 'a thing'; // true
 */

const roleUpgrader = require('role.upgrader');
const functionCreep = require('function.creep');

let roleRepairer = {
  run: function(creep) {
        
        functionCreep.run(creep);
        if (creep.memory.renewing == false) {
            if(creep.carry.energy < creep.carryCapacity && creep.memory.repairing == false) {
                let sources = creep.pos.findClosestByRange(FIND_SOURCES);
                if(creep.harvest(sources) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else {
                let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: function(object){
                    return object.structureType === STRUCTURE_ROAD && (object.hits < object.hitsMax * 0.5);
                    } 
                });
                if(target) {
                    if(creep.carry.energy == 0) {
                        creep.memory.repairing = false;
                    }
                    else {
                        creep.memory.repairing = true;
                    }
                    //set it so that it gets locked out and target is repaired to full health
                    if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                else {
                    creep.memory.repairing = false;
                    roleUpgrader.run(creep);
                }
            }
       }

	}
};

module.exports = roleRepairer;