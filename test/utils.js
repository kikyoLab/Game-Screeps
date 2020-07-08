/* 找到该房间内空闲的spawn */
function getAvaliableSpawn (roomName) {
    for (let spawnName in Game.spawns) {
        let spawn = Game.spawns[spawnName]
        if (spawn.room.name == roomName && spawn.spawning == null) {
            return spawn
        }
    }
    return null;
}
/* 根据房间等级定义部件数量 */
function setBodyParts (level) {
    switch (level) {
        case 8:
            harvesterBody = getBodyParts([['WORK', 16], ['CARRY', 16], ['MOVE', 16]])
            upgraderBody = getBodyParts([['WORK', 10], ['CARRY', 10], ['MOVE', 10]])
            fillerBody = getBodyParts([['CARRY', 30], ['MOVE', 15]])
            builderBody = getBodyParts([['WORK', 10], ['CARRY', 10], ['MOVE', 10]])
            transferBody = getBodyParts([['CARRY', 20], ['MOVE', 20]])
            centerFillerBody = getBodyParts([['CARRY', 20], ['MOVE', 20]])
            repairBody = getBodyParts([['WORK', 20], ['CARRY', 20], ['MOVE', 10]])
            pbAttackerBody = getBodyParts([['ATTACK', 40], ['MOVE', 10]])
            pbHealerBody = getBodyParts([['HEAL', 25], ['MOVE', 25]])
            depositBody = getBodyParts([['WORK', 15], ['CARRY', 10], ['MOVE', 25]])
            break;
        case 7:
            harvesterBody = getBodyParts([['WORK', 10], ['CARRY', 10], ['MOVE', 10]])
            upgraderBody = getBodyParts([['WORK', 10], ['CARRY', 10], ['MOVE', 10]])
            fillerBody = getBodyParts([['CARRY', 16], ['MOVE', 8]])
            builderBody = getBodyParts([['WORK', 6], ['CARRY', 6], ['MOVE', 6]])
            transferBody = getBodyParts([['CARRY', 12], ['MOVE', 12]])
            centerFillerBody = getBodyParts([['CARRY', 12], ['MOVE', 12]])
            repairBody = getBodyParts([['WORK', 10], ['CARRY', 10], ['MOVE', 10]])
            break;
        case 6:
        case 5:
            harvesterBody = getBodyParts([['WORK', 5], ['CARRY', 1], ['MOVE', 3]])
            upgraderBody = getBodyParts([['WORK', 4], ['CARRY', 2], ['MOVE', 3]])
            fillerBody = getBodyParts([['CARRY', 8], ['MOVE', 4]])
            builderBody = getBodyParts([['WORK', 5], ['CARRY', 5], ['MOVE', 5]])
            transferBody = getBodyParts([['CARRY', 8], ['MOVE', 8]])
            centerFillerBody = getBodyParts([['CARRY', 8], ['MOVE', 8]])
            break;
    }
}

/* 将二维数组展开得到body部件 */
function getBodyParts (partsArray) {
    let parts = [];
    for (var i in partsArray) {
        var item = partsArray[i];
        for (var j = 0; j < item[1]; j++) {
            parts.push(item[0]);
        }
    }
    return parts;
}

module.exports = {
    getAvaliableSpawn,
    getBodyParts,
    setBodyParts
}

