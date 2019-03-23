/*
 * function to manage the creeps in each room
 */

const roleUpgrader = require('role.upgrader');
const roleHarvester = require('role.harvester');
const roleBuilder = require('role.builder');
const roleRepairer = require('role.repairer');

const global = require('global.variables');


module.exports = {
    
    /*
        simple_manager: 
            1) takes all creeps in the room and allocates tasks
            2) when upgrading to a specific level new creeps are created when requested by manager.room
    */
    simple_manager: function(room) {
        
        let construction_Sites = room.find(FIND_CONSTRUCTION_SITES);
        let repair_Sites = room.find(FIND_STRUCTURES, {
        filter: function(object){
            return object.structureType === STRUCTURE_ROAD && (object.hits < object.hitsMax * 0.5);
        } 
        });
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        let repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
        let total_creeps = Game.creeps.length;

        if(construction_Sites.length > 0) {
            if(builders.length < global.builders && harvesters.length > 0) {
               harvesters[0].memory.role = 'builder';
            }
        }
        if(repair_Sites.length > 0) {
            if(repairers.length < global.repairers && harvesters.length > 0) {
                harvesters[0].memory.role = 'repairer';
            }
        }
        
        for(let name in Game.creeps) {
            let creep = Game.creeps[name];
            if(!creep.memory.renewing) {
                creep.memory.renewing = false;
            }
            if(!creep.memory.building) {
                creep.memory.building = false;
            }
            if(!creep.memory.repairing) {
                creep.memory.repairing = false;
            }
            if(creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            if(creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            if(creep.memory.role == 'builder') {
                roleBuilder.run(creep);
            }
            if(creep.memory.role == 'repairer') {
                roleRepairer.run(creep);
            }
        }
    },
    
    spawn_manager: function() {
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        let repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
        let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

        console.log('Harvesters: ' + harvesters.length);
        console.log('Upgraders: ' + upgraders.length);
        console.log('Builders: ' + builders.length);
        console.log('Repairers: ' + repairers.length);
        let spawnName = 'Spawn1'; //TODO: Fix this
        
        if(harvesters.length < global.harvesters) {
            let newName = Game.spawns[spawnName].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'harvester'});
            console.log('Spawning new harvester: ' + newName);
        }
        
        if(upgraders.length < global.upgraders && harvesters.length > 0) {
            let newName = Game.spawns[spawnName].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
            console.log('Spawning new harvester: ' + newName);
        }
        
        if(Game.spawns[spawnName].spawning) {
            let spawningCreep = Game.creeps[Game.spawns[spawnName].spawning.name];
            Game.spawns[spawnName].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns[spawnName].pos.x + 1, 
                Game.spawns[spawnName].pos.y, 
                {align: 'left', opacity: 0.8});
        }
    }
};