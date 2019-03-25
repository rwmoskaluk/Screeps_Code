/*
    methodology:
        calculate room characteristics when restarting scripts (unless already calculated in buffer, check buffer)
        when unutilized CPU is left then update the following variables
            1) check for enemies
            2) check for dropped resources
            3) continue with intial find search until each task is complete, then repeat to update
*/

const roomManager = require('./manager.room');
const roomInfo = require('./function.room');
const creepManager = require('./manager.creep');
const defenseTower = require('defense.tower');
const utils = require('./function.utils');
const tasks = require('./manager.tasks');

let cpuTick = Game.cpu.tickLimit;


module.exports.loop = function() {
    
    let cpuUsed = Game.cpu.getUsed();
    console.log('+++++++++++++START++++++++++++++++++');
    console.log("CPU used = " + JSON.stringify(cpuUsed));
    //console.log(JSON.stringify(cpuUsed));

    if (cpuUsed < cpuTick) {
        
        for (let name in Memory.creeps)
        {
            if (Game.creeps[name] === undefined)
            {
                delete Memory.creeps[name];
            }
        }
        if (!Memory.task_list) {
            for (let name in Game.rooms) {
                let roomName = name;
                let currentRoom = Game.rooms[roomName];
                tasks.task_list(currentRoom);
                tasks.task_filter();
            }
        }
        let hashCheck = tasks.state_checker();

        let newHash = utils.hash(hashCheck);

        console.log('newhash = ', newHash);
        if(Memory.stateCheck !== newHash) {
            // Game state has changed!
            Memory.stateCheck = newHash;

            for (let name in Game.spawns) {
                tasks.task_list(Game.spawns[name].room);
                tasks.task_filter();
            }
            let states = tasks.state_checker();
            console.log('states = ', JSON.stringify(states));

        }

        else{
            // Game state is the same
        }
        for (let name in Game.rooms) {
            let currentRoom = Game.rooms[name];
            roomInfo.room_info(currentRoom);


            if (!Memory.initial_Tick) {
                Memory.initial_Tick = 0;
            }
            let hostiles = currentRoom.find(FIND_HOSTILE_CREEPS);
            if (hostiles.length > 0) {
                defenseTower.run(currentRoom);
            }

            roomManager.room_manager(currentRoom);
            creepManager.simple_manager(currentRoom);

        }
        for (let creep in Memory.creeps) {
            //console.log(JSON.stringify(Memory.creeps[creep]));
        }
        
        console.log('+++++++++++++++END++++++++++++++++');
    }
};