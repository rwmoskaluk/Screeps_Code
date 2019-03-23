/*
    methodology:
        calculate room characteristics when restarting scripts (unless already calculated in buffer, check buffer)
        when unutilized CPU is left then update the following variables
            1) check for enemies
            2) check for dropped resources
            3) continue with intial find search until each task is complete, then repeat to update
*/

var calculations = require('./function.calculations');
var roomManager = require('./manager.room');
var creepManager = require('./manager.creep');
var defenseTower = require('defense.tower');

var cpuTick = Game.cpu.tickLimit;


module.exports.loop = function() {
    
    var cpuUsed = Game.cpu.getUsed();
    console.log('++++++++++++++++++++++++++++++++++');
    console.log("CPU used = " + JSON.stringify(cpuUsed));
    //console.log(JSON.stringify(cpuUsed));
    
    if (cpuUsed < cpuTick) {
        
        for (let name in Memory.creeps)
        {
            if (Game.creeps[name] == undefined)
            {
                delete Memory.creeps[name];
            }
        }
        
        for (let name in Game.rooms) {
            var roomName = name;
            var currentRoom = Game.rooms[roomName];
            roomManager.room_info(currentRoom);
            
            if(!Memory.initial_Tick) {
                Memory.initial_Tick = 0;
            }
            var hostiles = currentRoom.find(FIND_HOSTILE_CREEPS);
            if(hostiles.length > 0) {
                defenseTower.run(currentRoom);
            }
            creepManager.simple_manager(currentRoom);
            
        }
        
        creepManager.spawn_manager();
        console.log('++++++++++++++++++++++++++++++++++');
    }
}