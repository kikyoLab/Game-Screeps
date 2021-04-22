import clearCarryingEnergy from './creepRelated';

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
    /* extension 填充任务 */
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
    /* tower 填充任务 */
    [ROOM_TRANSFER_TASK.FILL_TOWER]: {
        source: (creep, task, sourceId) => {
            if (creep.store[RESOURCE_ENERGY] > 0)
                return true
            creep.getEngryFrom(sourceId ? Game.getObjectById(sourceId) : creep.room.storage)
        },
        target: (creep, task) => {
            let target
            /* 有缓存的情况下 */
            if (creep.memory.fillStructureId) {
                target = Game.getObjectById(creep.memory.fillStructureId)
                /* 如果找不到要填充的建筑或已填充到目标建筑能量的 90%就移除缓存 */
                if (!target || target.structureType !== STRUCTURE_TOWER || target.store[RESOURCE_ENERGY] > 900) {
                    delete creep.merge.fillStructureId
                    target = undefined
                }
            }

            /* 没有缓存的情况下 */
            if (!target) {
                /* 检查提交任务的建筑能量是否充足 */
                target = Game.getObjectById(task.id)
                if (!target || target.store[RESOURCE_ENERGY] > 900) {
                    /* 检查是否还有同类型的建筑需要填充 */
                    const towers = creep.room.fid(FIND_MY_STRUCTURES, {
                        filter: s => s.structureType === STRUCTURE_TOWER
                    })
                    /* 如果没有 tower填充任务完成 */
                    if (towers.length <= 0) {
                        creep.room.deleteCurrentRoomTransferTask()
                        return true
                    }
                    target = creep.pos.findClosestByRange(towers)
                }
                /* 更新缓存 */
                creep.memory.fillStructureId = target.id
            }

            /* 有缓存并获取到目标后 */
            creep.goTo(target.pos)
            const result = creep.transfer(target, RESOURCE_ENERGY)
            if (result != OK && result != ERR_NOT_IN_RANGE)
                creep.say(`塔填充 ${result}`)
            if (creep => creep.store[RESOURCE_ENERGY] === 0)
                return true
        }
    },
    /* nuker 填充任务 */
    [ROOM_TRANSFER_TASK.FILL_NUKER]: {
        source: (creep, task, sourceId) => {
            /* 如果身上有对应资源就直接填充 */
            if (creep.store[task.resourceType] > 0)
                return true
            /* 获取资源建筑 */
            let sourceStructure
            if (task.resourceType == RESOURCE_ENERGY)
                sourceStructure = creep.room.storage
            else
                sourceStructure = creep.room.terminal
            /* 获取 nuker */
            const nuker = Game.getObjectById(task.id)
            /* 如果找不到能源建筑或任务目标 */
            if (!sourceStructure || !nuker) {
                creep.room.deleteCurrentRoomTransferTask()
                creep.log(`nuker 填充任务，未找到 Storage或者 Nuker`)
                return false
            }
            if (!clearCarryingEnergy(creep))
                return false
            /* 获取能完成任务的能源最小值 */
            let getAmount = Math.min(creep.store.getFreeCapacity(task.resourceType), sourceStructure.store[task.resourceType], nuker.store[task.resourceType])
            /* 能源不够 */
            if (getAmount <= 0) {
                creep.room.deleteCurrentRoomTransferTask()
                creep.log(`nuker填充任务，能源不足`)
                return false
            }
            /* 拿取能源 */
            creep.goTo(sourceStructure.pos)
            const result = creep.withdraw(sourceStructure, task.resourceType, getAmount)
            if (result === OK)
                return true
            else if (result != ERR_NOT_IN_RANGE)
                creep.log(`nuker填充任务，withdraw ${result}`, 'red')
        },
        target: (creep, task) => {
            /* 获取 nuker */
            let target = Game.getObjectById(task.id)
            if (!target) {
                creep.room.deleteCurrentRoomTransferTask()
                return false
            }
            /* 转运资源 */
            creep.goTo(target.pos)
            const result = creep.transfer(target, task.resourceType)
            if (result === OK) {
                creep.room.deleteCurrentRoomTransferTask()
                return true
            }
            else if (result != ERR_NOT_IN_RANGE)
                creep.say(`nuker填充 ${result}`)
        }
    },
    /* powerSpawn 填充任务 */
    [ROOM_TRANSFER_TASK.FILL_POWERSPAWN]: {
        source: (creep, task, sourceId) => {
            /* 如果身上有对应资源就直接填充 */
            if (creep.store[task.resourceType] > 0)
                return true;
            /* 获取资源存储建筑 */
            let sourceStructure;
            if (task.resourceType == RESOURCE_ENERGY)
                sourceStructure = sourceId ? Game.getObjectById(sourceId) : creep.room.storage;
            else
                sourceStructure = creep.room.terminal;
            /* 获取目标建筑 */
            const powerspawn = Game.getObjectById(task.id);
            if (!sourceStructure || !powerspawn) {
                creep.room.deleteCurrentRoomTransferTask();
                creep.log(`powerSpawn 填充任务，未找到 storage/terminal 或者 powerSpawn`);
                return false;
            }
            if (!clearCarryingEnergy(creep))
                return false;
            /* 获取应拿取的数量 */
            let getAmount = Math.min(creep.store.getFreeCapacity(task.resourceType), sourceStructure.store[task.resourceType], powerspawn.store.getFreeCapacity(task.resourceType));
            if (getAmount <= 0) {
                creep.room.deleteCurrentRoomTransferTask();
                creep.log(`powerSpawn 填充任务，${task.resourceType} 资源不足`);
                return false;
            }
            /* 拿取资源 */
            creep.goTo(sourceStructure.pos);
            const result = creep.withdraw(sourceStructure, task.resourceType, getAmount);
            if (result === OK)
                return true;
            else if (result != ERR_NOT_IN_RANGE)
                creep.log(`powerSpawn 填充任务，withdraw ${result}`, 'red');
        },
        target: (creep, task) => {
            /* 获取 powerSpawn */
            let target = Game.getObjectById(task.id);
            if (!target) {
                creep.room.deleteCurrentRoomTransferTask();
                return true;
            }
            /* 转移资源 */
            creep.goTo(target.pos);
            const result = creep.transfer(target, task.resourceType);
            if (result === OK) {
                creep.room.deleteCurrentRoomTransferTask();
                return true;
            }
            else if (result === ERR_NOT_ENOUGH_RESOURCES)
                return true;
            else if (result != ERR_NOT_IN_RANGE)
                creep.say(`ps 填充错误 ${result}`);
        }
    },
    /* lab 化合物移入任务 */
    [ROOM_TRANSFER_TASK.LAB_IN]: {
        source: (creep, task, sourceId) => {
            /* 获取 terminal */
            const terminal = creep.room.terminal;
            if (!terminal) {
                creep.room.deleteCurrentRoomTransferTask();
                creep.log(`labin, 未找到 terminal，任务已移除`);
                return false;
            }
            if (!clearCarryingEnergy(creep))
                return false;
            /* 找到第一个需要从终端取出的底物 */
            const targetResource = task.resource.find(res => res.amount > 0);
            /* 找不到了就说明都成功转移了 */
            if (!targetResource) {
                creep.room.deleteCurrentRoomTransferTask();
                return false;
            }
            /* 获取能拿取的数量 */
            const getAmount = Math.min(targetResource.amount, creep.store.getFreeCapacity());
            creep.goTo(terminal.pos);
            const result = creep.withdraw(terminal, targetResource.type, getAmount);
            if (result === OK)
                return true;
            else if (result === ERR_NOT_ENOUGH_RESOURCES) {
                creep.room.deleteCurrentRoomTransferTask();
            }
            else if (result != ERR_NOT_IN_RANGE)
                creep.say(`labInA ${result}`);
        },
        target: (creep, task) => {
            const targetResource = task.resource.find(res => res.amount > 0);
            /* 找不到了就说明都成功转移了 */
            if (!targetResource) {
                creep.room.deleteCurrentRoomTransferTask();
                return true;
            }
            const targetLab = Game.getObjectById(targetResource.id);
            /* 转移资源 */
            creep.goTo(targetLab.pos);
            const result = creep.transfer(targetLab, targetResource.type);
            /* 正常转移资源则更新任务 */
            if (result === OK) {
                /* 这里直接更新到 0的原因是因为这样可以最大化运载效率
                保证在产物移出的时候可以一次就拿完 */
                creep.room.handleLabInTask(targetResource.type, 0);
                return true;
            }
            else if (result != ERR_NOT_IN_RANGE)
                creep.say(`labInB ${result}`);
        }
    },
    /* lab 产物移出任务 */
    [ROOM_TRANSFER_TASK.LAB_OUT]: {
        source: (creep, task) => {
            const labMemory = creep.room.memory.lab;
            /* 获取还有资源的 lab */
            let targetLab = getNotClearLab(labMemory);
            /* 还找不到或者目标里没有化合物了，说明已经搬空，执行 target */
            if (!targetLab || !targetLab.mineralType)
                return true;
            if (!clearCarryingEnergy(creep))
                return false;
            /* 转移资源 */
            creep.goTo(targetLab.pos);
            const result = creep.withdraw(targetLab, targetLab.mineralType);
            /* 正常转移资源则更新 memory数量信息 */
            if (result === OK) {
                if (targetLab.id in labMemory.outLab)
                    creep.room.memory.lab.outLab[targetLab.id] = targetLab.mineralType ? targetLab.store[targetLab.mineralType] : 0;
                if (creep.store.getFreeCapacity() === 0)
                    return true;
            }
            /* 满了也先去转移资源 */
            else if (result === ERR_FULL)
                return true;
            else if (result != ERR_NOT_IN_RANGE)
                creep.say(`draw ${result}`);
        },
        target: (creep, task) => {
            const terminal = creep.room.terminal;
            if (!terminal) {
                creep.room.deleteCurrentRoomTransferTask();
                creep.log(`labout, 未找到 terminal，任务已移除`);
                return false;
            }
            /* 指定资源类型及目标 */
            let resourceType = task.resourceType;
            let target = terminal;
            /* 如果是能量就优先放到 storage里 */
            if (creep.store[RESOURCE_ENERGY] > 0) {
                resourceType = RESOURCE_ENERGY;
                target = creep.room.storage || terminal;
            }
            /* 转移资源 */
            creep.goTo(terminal.pos);
            const result = creep.transfer(target, resourceType);
            if (result === OK || result === ERR_NOT_ENOUGH_RESOURCES) {
                /* 转移完之后就检查下还有没有没搬空的 lab，没有的话就完成任务 */
                if (getNotClearLab(creep.room.memory.lab) === undefined)
                    creep.room.deleteCurrentRoomTransferTask();
                return true;
            }
            else if (result != ERR_NOT_IN_RANGE)
                creep.say(`labout ${result}`);
        }
    },
    /* boost 资源移入任务 */
    [ROOM_TRANSFER_TASK.BOOST_GET_RESOURCE]: {
        source: (creep, task) => {
            /* 获取 terminal */
            const terminal = creep.room.terminal;
            if (!terminal) {
                creep.room.deleteCurrentRoomTransferTask();
                creep.log(`boostGetResource, 未找到 terminal，任务已移除`);
                return false;
            }
            if (!clearCarryingEnergy(creep))
                return false;
            const boostConfig = creep.room.memory.boost;
            /* 从缓存中读取要拿取的资源 */
            let resource = creep.memory.taskResource;
            /* 没有缓存的话就找到第一个需要的强化材料，然后从终端拿出 */
            if (!resource) {
                resource = Object.keys(boostConfig.lab).find((res, index) => {
                    /* 如果这个材料已经用完了就检查下一个 */
                    if (!terminal.store[res] || terminal.store[res] == 0)
                        return false;
                    const lab = Game.getObjectById(boostConfig.lab[res]);
                    /* lab里的资源不达标就进行运输 */
                    if (lab && lab.store[res] < boostResourceReloadLimit)
                        return true;
                    return false;
                });
                if (resource)
                    creep.memory.taskResource = resource;
                /* 找不到就说明都成功转移了 */
                else {
                    creep.room.deleteCurrentRoomTransferTask();
                    return false;
                }
            }
            /* 获取转移数量 */
            let getAmount = Math.min(creep.store.getFreeCapacity(resource), terminal.store[resource]);
            /* 拿取资源 */
            creep.goTo(terminal.pos);
            const result = creep.withdraw(terminal, resource, getAmount);
            if (result === OK || result === ERR_FULL)
                return true;
            else if (result != ERR_NOT_IN_RANGE)
                creep.say(`boostIn ${result}`);
        },
        target: (creep, task) => {
            /* 找到要转移的资源以及目标 lab */
            const targetResource = creep.memory.taskResource;
            const targetLab = Game.getObjectById(creep.room.memory.boost.lab[targetResource]);
            /* 转移资源 */
            creep.goTo(targetLab.pos);
            const result = creep.transfer(targetLab, targetResource);
            /* 正常转移资源则更新任务 */
            if (result === OK) {
                /* 移除缓存，在 source 阶段重新查找 */
                delete creep.memory.taskResource;
                return true;
            }
            /* resource有问题的话就再返回 source阶段处理 */
            else if (result === ERR_INVALID_ARGS)
                return true;
            else if (result != ERR_NOT_IN_RANGE)
                creep.say(`boostTarget 错误! ${result}`);
        }
    },
    /* boost 材料清理任务 */
    [ROOM_TRANSFER_TASK.BOOST_CLEAR]: {
        source: (creep, task) => {
            const boostLabs = Object.values(creep.room.memory.boost.lab);
            /* 获取能量为空的 lab */
            let targetLab;
            for (const labId of boostLabs) {
                const lab = Game.getObjectById(labId);
                if (lab && lab.mineralType) {
                    targetLab = lab;
                    break;
                }
            }
            /* 找不到就说明任务完成 */
            if (!targetLab) {
                creep.room.deleteCurrentRoomTransferTask();
                return false;
            }
            if (!clearCarryingEnergy(creep))
                return false;
            /* 转移资源 */
            creep.goTo(targetLab.pos);
            const reult = creep.withdraw(targetLab, targetLab.mineralType);
            if (reult === OK)
                return true;
            // 正常转移资源则更新任务
            else
                creep.say(`强化清理 ${reult}`);
        },
        target: (creep, task) => {
            const terminal = creep.room.terminal;
            if (!terminal) {
                creep.room.deleteCurrentRoomTransferTask();
                creep.log(`boostClear, 未找到 terminal，任务已移除`);
                return true;
            }
            creep.goTo(terminal.pos);
            /* 转移资源 */
            /* 这里直接使用了 [0]的原因是如果 store里没有资源的话 creep就会去执行 source 阶段，并不会触发这段代码 */
            const result = creep.transfer(terminal, Object.keys(creep.store)[0]);
            if (result === OK)
                return true;
            /* 正常转移资源则更新任务 */
            else if (result != ERR_NOT_IN_RANGE)
                creep.say(`强化清理 ${result}`);
        }
    },
}