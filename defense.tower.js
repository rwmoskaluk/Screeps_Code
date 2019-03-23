/*
 * Module for running towers in a room
 */

let defenseTower = {
  run: function(room) {
    let hostiles = room.find(FIND_HOSTILE_CREEPS);
    if(hostiles.length > 0) {
        let username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${room.roomName}`);
        let towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        towers.forEach(tower => tower.attack(hostiles[0]));
    }
  }
};

module.exports = defenseTower;