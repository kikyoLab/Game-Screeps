/* creep自毁处理 */
export function deathPrepare (creep, sourceId) {
    /* 如果还有能量 */
    if (creep.store.getUsedCapacity() > 0) {
        for (const resourceType in creep.store) {
            let target
            /* 不是能量就放 terminal里 */
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

/* 处理掉 creep身上携带的能量 */
export function clearCarryingEnergy (creep) {
    if (creep.store[RESOURCE_ENERGY] > 0) {
        /* 能放下就放，放不下直接扔掉 */
        if (creep.room.storage && creep.room.storage.store.getFreeCapacity() >= creep.store[RESOURCE_ENERGY])
            creep.transferTo(creep.room.storage, RESOURCE_ENERGY);
        else
            creep.drop(RESOURCE_ENERGY);
        return false;
    }
    return true;
}