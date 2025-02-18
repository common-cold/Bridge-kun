import { ethers } from "ethers";
import Redis from "ioredis";

// const redis = new Redis({
//   host: "127.0.0.1",
//   port: 6379,
// });

// redis.ping().then((res) => console.log("Redis PING response:", res));

console.log(ethers.parseUnits("15", 18));
console.log(ethers.toBigInt(15.98));