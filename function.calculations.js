/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('function.calculations');
 * mod.thing == 'a thing'; // true
 */

const global = require('global.variables');

module.exports = {
    skip_ticks: function(delta_Tick) {
        /*
        * function for skipping x amount of ticks for specific calculations
        */
        let tick_Toggle = false;

        if (!Memory.initial_Tick || Memory.initial_Tick == 0) {
            Memory.initial_Tick = Game.time;
        }

        if(Memory.initial_Tick + delta_Tick <= Game.time) {
            tick_Toggle = true;
            Memory.initial_Tick = Game.time;
        }

        return tick_Toggle;
    },
    closest_distance: function(x, y, point_List) {
        /*
        * function for calculating the distance from a given list of data points in the room
        * uses the calculated centroid of the object list to return distance to centroid
        */
        let sum_x = 0;
        let sum_y = 0;

        for(let i = 0; i < point_List.length; i++) {
            sum_x = point_List[i][0].pos.x + sum_x;
            sum_y = point_List[i][0].pos.y + sum_y;
        }

        let distance = Math.pow((Math.pow((sum_x/point_List.length) - x, 2) + Math.pow((sum_y/point_List.length) - y, 2)), 0.5);
        distance = Math.floor(distance);
        return distance;
        
    }
    
}