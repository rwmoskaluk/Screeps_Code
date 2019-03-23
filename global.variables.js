/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('global.variables');
 * mod.thing == 'a thing'; // true
 */


let global = {
    'showDiagnostics': {spawn: true, paths: true, tower: true, spawn_roads: false},
    'delta_Tick': 100,
    'repairers': 2,
    'builders': 2,
    'harvesters': 3,
    'upgraders': 2
};

module.exports = global;
