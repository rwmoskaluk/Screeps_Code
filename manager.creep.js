/*
 * function to manage the creeps in each room
 */

var roleUpgrader = require('role.upgrader');
var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');

var global = require('global.variables'); 


module.exports = {
    
    /*
        simple_manager: 
            1) takes all creeps in the room and allocates tasks
            2) when upgrading to a specific level new creeps are created when requested by manager.room
    */
    simple_manager: function(room) {
        
        var construction_Sites = room.find(FIND_CONSTRUCTION_SITES);
        var repair_Sites = room.find(FIND_STRUCTURES, {
        filter: function(object){
            return object.structureType === STRUCTURE_ROAD && (object.hits < object.hitsMax * 0.5);
        } 
        });
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
        var total_creeps = Game.creeps.length;

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
        
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
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
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

        console.log('Harvesters: ' + harvesters.length);
        console.log('Upgraders: ' + upgraders.length);
        console.log('Builders: ' + builders.length);
        console.log('Repairers: ' + repairers.length);
        spawnName = 'Spawn1'
        
        if(harvesters.length < global.harvesters) {
            var newName = Game.spawns[spawnName].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'harvester'});
            console.log('Spawning new harvester: ' + newName);
        }
        
        if(upgraders.length < global.upgraders && harvesters.length > 0) {
            var newName = Game.spawns[spawnName].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
            console.log('Spawning new harvester: ' + newName);
        }
        
        if(Game.spawns[spawnName].spawning) { 
            var spawningCreep = Game.creeps[Game.spawns[spawnName].spawning.name];
            Game.spawns[spawnName].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns[spawnName].pos.x + 1, 
                Game.spawns[spawnName].pos.y, 
                {align: 'left', opacity: 0.8});
        }
    }
};