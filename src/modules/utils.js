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

/* 根据房间等级定义部件数量 */
export function setBodyParts (level) {
    if (level <= 5) {
        harvester = getBodyParts([['WORK', 5], ['CARRY', 1], ['MOVE', 3]])
        upgrader = getBodyParts([['WORK', 4], ['CARRY', 2], ['MOVE', 3]])
        filler = getBodyParts([['CARRY', 8], ['MOVE', 4]])
        builder = getBodyParts([['WORK', 5], ['CARRY', 5], ['MOVE', 5]])
    }
    else {
        harvester = getBodyParts([['WORK', 5], ['CARRY', 1], ['MOVE', 3]])
        upgrader = getBodyParts([['WORK', 8], ['CARRY', 4], ['MOVE', 6]])
        filler = getBodyParts([['CARRY', 12], ['MOVE', 6]])
        builder = getBodyParts([['WORK', 5], ['CARRY', 5], ['MOVE', 5]])
    }
}

/* 将二维数组展开得到 body部件 */
export function getBodyParts (partsArray) {
    let parts = [];
    for (let i in partsArray) {
        let item = partsArray[i];
        for (let j = 0; j < item[1]; j++) {
            parts.push(item[0]);
        }
    }
    return parts;
}

/* creep自毁处理 */
export function deathPrepare (creep, sourceId) {
    /* 如果还有能量 */
    if (creep.store.getUsedCapacity() > 0) {
        for (const resourceType in creep.store) {
            let target
            /* 不能能量就放 terminal里 */
            if (resourceType != RESOURCE_ENERGY && resourceType != RESOURCE_POWER && creep.room.terminal) {
                target = creep.room.terminal
            }
            /* 否则就放到 storage或指定的地方 */
            else
                target = sourceId ? Game.getObjectById(sourceId) : creep.room.storage
        }
    }
    else
        creep.suicide()
    return false
}

/* 获取指定房间的物流任务 */
export function getRoomTransferTask (room) {
    const task = room.getRoomTransferTask()
    if (!task)
        return null
    /* 如果任务类型不对就移除任务并报错 */
    if (!transferTaskOperation.hasOwnProperty(task.type)) {
        room.deleteCurrentRoomTransferTask()
        room.log(`发现未定义的房间物流任务 ${task.type}, 已移除`, 'manager', 'yellow');
        return null;
    }
    return task;
}

/* 运输机在不同类型任务时执行的操作 */
export const transferTaskOperations = {
    /* extension填充任务 */
    [ROOM_TRANSFER_TASK.FILL_EXTENSION]: {
        source: (creep, task, sourceId) => {
            if (creep.store[RESOURCE_ENERGY] > 0)
                return true
            creep.getEngryFrom(sourceId ? Game.getObjectById(sourceId) : creep.room.storage)
        },
        target: creep => {
            let target
            /* 有缓存就用缓存 */
            if (creep.memory.fillStructureId) {
                target = Game.getObjectById(creep.memory.fillStructureId)
                /* 如果找不到对应建筑或已经填满就移除缓存 */
                if (!target || target.structureType !== STRUCTURE_EXTENSION || target.store.getFreeCapacity(RESOURCE_ENERGY) <= 0) {
                    delete creep.memory.fillStructureId
                    target = undefined
                }
            }
            /* 没缓存就重新获取 */
            if (!target) {
                /* 获取有需求的建筑 */
                target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: s => (
                        (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) &&
                        (s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                    )
                });
                if (!target) {
                    /* 任务完成 */
                    creep.room.deleteCurrentRoomTransferTask()
                    return true
                }
                /* 写入缓存 */
                creep.memory.fillStructureId = target.id
            }
            /* 填充目标能量 */
            creep.goTo(target.pos)

            const result = creep.transfer(target, RESOURCE_ENERGY)
            if (result === ERR_NOT_ENOUGH_RESOURCES || result === ERR_FULL)
                return true
            else if (result != OK && result != ERR_NOT_IN_RANGE)
                creep.say(`拓展填充 ${result}`)

            if (creep.store[RESOURCE_ENERGY] === 0)
                return true;
        }
    },
}