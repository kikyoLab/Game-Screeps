/* 找到该房间内空闲的spawn */
export function getAvaliableSpawn (roomName) {
    for (let spawnName in Game.spawns) {
        let spawn = Game.spawns[spawnName]
        if (spawn.room.name == roomName && spawn.spawning == null) {
            return spawn
        }
    }
    return null;
}