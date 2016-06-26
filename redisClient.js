'use strict';

var redis = require('redis');
var redisClient = redis.createClient();

class RedisClient {
    constructor() {

    }

    writeToRedis(data) {
        return new Promise((resolve, reject) => {
            redisClient.lpush("dronData", data, (err, reply) => {
                if (err) {
                    console.log("Error writing to redis DB: ", err);
                    reject(err);
                }
                resolve(true);
            });
        });
    }

    readLast() {
        return new Promise((resolve, reject) => {
            redisClient.lrange("dronData", -1, -1, (err, reply) => {
                if (err) {
                    console.log("Error in redis: ", err);
                    return reject(err);
                }
                resolve(reply);
            });
        });
    }
}

module.exports = RedisClient;
