const SHA1 = require('sha1');

module.exports = {
    hash: function (object) {
        let string = JSON.stringify(object);
        let hash = SHA1(string);

        return hash.toString();
    },

    addWithHash: function (object, database) {
        // Create a Hash of the object
        let hash = this.hash(object);

        // Assign the hash to the object
        object.hash = hash;

        // Add the object to the database
        database.add(object);
    },

    isEmpty: function (obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
};