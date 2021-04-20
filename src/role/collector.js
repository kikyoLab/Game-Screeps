/* 低级房基础单位 */
const roles = {
    /**
     * 采集单位
     * 从指定 source 中获取能量，将能量存放到身下的 container中
     */
    harvester: (data) => ({
        /* 准备阶段 */
        prepare: creep => {
            /* 准备阶段中 target为 container或 caontainer工地或 source */
            let target
            /* 如果有缓存就取缓存 */
            if (creep.memory.targetId)
                target = Game.getObjectById(creep.memory.sourceId)

            const source = Game.getObjectById(data.sourceId)

            /* 没有缓存或者缓存失效了就尝试重新获取 */
            if (!target) {
                /* 尝试获取 container */
                const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType === STRUCTURE_CONTROLLER
                })
                /* 找到了就更新目标 */
                if (containers.length > 0)
                    target = containers[0]
            }

            /* 获取缓存失败就尝试找 container的工地 */
            if (!target) {
                const constructionSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER
                })

                if (constructionSite.length > 0) {
                    target = constructionSite[0]
                }
            }

            /* 如果缓存和工地都获取失败就用 source作为目标 */
            if (!target)
                target = source
            /* 更新缓存 */
            creep.memory.targetId = target.id
            /* 根据目标设置移动范围 (source走到目标附近 container走到目标上) */
            const range = target instanceof Source ? 1 : 0
            creep.goTo(target.pos, range)
            /* 抵达了位置就进入下一阶段 */
            if (creep.pos.inRangeTo(target.pos, range))
                return true
            return false
        },
        /* 维护阶段 */
        source: creep => {
            creep.say('φ(゜▽゜*)♪bbb~')
            /* 没有能量就进行采集 */
            if (creep.store[RESOURCE_ENERGY] <= 0) {
                creep.getEngryFrom(Game.getObjectById(data.sourceId))
                return false
            }

            /* 存在 container就维护  */
            let target = Game.getObjectById(creep.memory.targetId)
            if (target && target instanceof StructureContainer) {
                creep.repair(target)
                /* 维护完成就进行采集 */
                return target.hits >= target.hitsMax
            }

            /* 不存在 container就新建一个 */
            let constructionSite
            /* 检查有没有已经存在的建筑工地 */
            if (!creep.memory.constructionSiteId)
                creep.pos.createConstructionSite(STRUCTURE_CONTAINER)
            else
                constructionSite = Game.getObjectById(creep.memory.constructionSiteId)

            /* 没找到工地缓存，可能触发新建工地，重新搜索一次 */
            if (!constructionSite)
                constructionSite = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).find(s => s.structureType === STRUCTURE_CONTAINER);
            /* 还没找到就说明有可能工地已经建好了，进行搜索 */
            if (!constructionSite) {
                const container = creep.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_CONTAINER)
                /* 找到 container，添加进房间 */
                if (container) {
                    creep.room.registerContainer(container);
                    return true;
                }
                /* 没找到，等下个 tick重新新建工地 */
                return false;
            }
            /* 找到了就缓存 id */
            else
                creep.memory.constructionSiteId = constructionSite.id
            /* 开始建造 */
            creep.build(constructionSite)
        },
        /* 采集阶段 */
        target: creep => {
            creep.getEngryFrom(Game.getObjectById(data.sourceId))
            /* 快死了就把身上能量丢到脚下 container里 避免死亡成为墓碑后无法被 container接取能量 */
            if (creep.ticksToLive < 2)
                creep.drop(RESOURCE_ENERGY)
            return false
        },
        bodys: 'harvester'
    }),

    /**
     * 运输单位
     * 从 container 中获取能量执行房间物流任务
     * 在空闲时间会尝试把能量运输至 storage
     */
    filler: (data) => ({
        /* 能量来源 */
        isNeed: room => {
            return !!room.sourceContaniners.find(container => container.id === data.sourceId)
        },
        /* 从 container拿能量 */
        source: creep => {
            if (creep.store[RESOURCE_ENERGY] > 0)
                return true
            /* 获取 container */
            let source = Game.getObjectById(data.sourceId)
            /* container没能量了就尝试从 storage获取能量 */
            if (!source || source.store[RESOURCE_ENERGY] <= 0)
                source = creep.room.storage
            creep.getEngryFrom(source)
        },
        /* 维护房间能量填充 */
        target: creep => {
            const task = getRoomTransferTask(creep.room)
            /* 如果是 extension和 tower的任务就只执行填充能量任务 */
            if (task && task.type === ROOM_TRANSFER_TASK.FILL_EXTENSION || task.type === ROOM_TRANSFER_TASK.FILL_TOWER) {
                return transferTaskOperations[task.type].target(creep, task)
            }
            /* 空闲时存放能量到 storage */
            if (!creep.room.storage)
                return false
            const source = Game.getObjectById(data.sourceId)
            if (source && source.store[RESOURCE_ENERGY] > 0)
                creep.transferTo(creep.room.storage, RESOURCE_ENERGY)
            else
                creep.say('(∪.∪ )...zzz')
            if (creep.store[RESOURCE_ENERGY] <= 0)
                return true
        },
        bodys: 'filler'
    }),

    /**
     * 升级者
     * 从指定建筑中获取能量升级 controller
     */
    upgrader: (data) => ({
        source: creep => {
            /* 有能量就去升级 */
            if (creep.store[RESOURCE_ENERGY] > 0)
                return true
            const source = Game.getObjectById(data.sourceId)
            /* 如果来源是 container则等到其中能量大于指定数量后再执行任务 */
            if (source && source.structureType === STRUCTURE_CONTAINER && source.store[RESOURCE_ENERGY] <= 500)
                return false
            /* 获取能量 */
            const result = creep.getEngryFrom(source)
            /* 如果是 Container或者 Link里获取能量的话，就不会重新运行规划 */
            if ((result === ERR_NOT_ENOUGH_RESOURCES || result === ERR_INVALID_TARGET) &&
                (source instanceof StructureTerminal || source instanceof StructureStorage)) {
                /* 如果发现能量来源建筑里没有能量了，就自杀并重新运行规划 */
                creep.room.releaseCreep('upgrader')
                creep.suicide()
            }
        },
        target: creep => {
            if (creep.upgrade() === ERR_NOT_ENOUGH_RESOURCES)
                return true
        },
        bodys: 'upgrader'
    }),

    /**
     * 建筑者
     * 从指定结构中获取能量，查找建筑工地并建造
     */
    builder: (data) => ({
        /* 没有待建工地就结束 */
        isNeed: room => {
            const targets = room.find(FIND_MY_CONSTRUCTION_SITES)
            return targets.length > 0 ? true : false
        },
        prepare: creep => {
            creep.memory.sourceId = data.sourceId
            return true
        },
        /* 根据 sourceId对应的能量来源建筑里的剩余能量来自动选择新的能量来源 */
        source: creep => {
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
                return true
            /* 获取能量 */
            let source
            if (!creep.memory.sourceId) {
                source = creep.room.getAvailableSource()
                creep.memory.sourceId = source.id
            }
            else
                source = Game.getObjectById(creep.memory.sourceId)
            /* 能量来源建筑没能量就更新来源 */
            if (creep.getEngryFrom(source) === ERR_NOT_ENOUGH_RESOURCES && source instanceof Structure)
                delete creep.memory.sourceId
        },
        target: creep => {
            // 有新墙就先刷新墙
            if (creep.memory.fillWallId)
                creep.steadyWall();
            /* 没有就建其他工地 */
            else if (creep.buildStructure() !== ERR_NOT_FOUND) { }
            /* 工地也没了就去升级 */
            else if (creep.upgrade()) { }
            if (creep.store.getUsedCapacity() === 0)
                return true;
        },
        bodys: 'worker'
    }),

    /**
     * 维修机
     * 从指定结构中获取能量维修房间内的建筑
     */
    repair: (data) => ({
        /* 根据敌人威胁决定是否继续生成 */
        isNeed: room => room.controller.checkEnemyThreat(),
        source: creep => {
            creep.getEngryFrom(Game.getObjectById(data.sourceId))
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
                return true
        },
        /* 维修 */
        target: creep => {
            let damagedWall = creep.room.damagedWall
            /* 尝试获取受损的墙，有最新的就更新缓存，没有就用缓存数据 */
            if (damagedWall)
                creep.memory.fillWallId = damagedWall.id
            else if (creep.memory.fillWallId)
                damagedWall = Game.getObjectById(creep.memory.fillWallId)
            /* 优先刷受损的墙 */
            if (damagedWall) {
                const actionResult = creep.repair(creep.room.damagedWall)
                if (actionResult === OK) {
                    if (!creep.memory.standed) {
                        creep.memory.standed = true
                        creep.room.addRestrictedPos(creep.name, creep.pos)
                    }
                    /* 离墙三格远可能堵路 */
                    if (!creep.room.damagedWall.pos.isRangeTo(creep.pos), 2)
                        creep.goTo(creep.room.damagedWall.pos)
                }
            }
            /* 原计划维修 */
            else
                creep.fillDefenseStructure()
            if (creep.store.getUsedCapacity() === 0)
                return true
        },
        bodys: 'repair'
    }),

    /**
     * 物流运输
     * 执行 ROOM_TRANSFER_TASK 中定义的任务
     * 任务处理逻辑定义在 transferTaskOperations 中
     */
    manager: (data) => ({
        source: creep => {
            /* 快死了就不领取任务 */
            if (creep.ticksToLive <= TRANSFER_DEATH_LIMIT)
                return deathPrepare(creep, data.sourceId)
            /* 装载房间任务 */
            const task = getRoomTransferTask(creep.room)
            /* 有任务就执行 */
            if (task)
                return transferTaskOperations[task.type].source(creep, task, data.sourceId)
            /* 没有就睡大觉 */
            else
                creep.say('(∪.∪ )...zzz')
        },
        target: creep => {
            const task = getRoomTransferTask(creep.room)
            /* 有任务就执行 */
            if (task)
                return transferTaskOperations[task.type].target(creep, task)
            else
                return true
        },
        bodys: 'manager'
    }),

    /**
     * 中央区运输机
     * 从房间的中央任务队列 Room.memory.centerTransferTasks 中取出任务并执行
     */
    processor: (data) => ({
        /* 移动到指定位置 */
        prepare: creep => {
            if (creep.pos.isEqualTo(data.x, data.y))
                return true
            else {
                creep.goTo(new RoomPosition(data.x, data.y, creep.room.name))
                return false
            }
        },
        /* 从中央任务队列中取出任务并执行 */
        source: creep => {
            /* 快死了就拒绝执行 */
            if (creep.ticksToLive <= 5)
                return false
            /* 接任务 */
            const task = creep.room.getCenterTask()
            if (!task)
                return false
            /* 通过房间基础服务获取对应建筑 */
            const structure = creep.room[task.source]
            if (!structure) {
                creep.room.deleteCurrentCenterTask()
                return false
            }
            /* 获取取出数量 */
            let withdrawals = creep.store.getFreeCapacity()
            if (withdrawals > task.amount)
                withdrawals = task.amount
            /* 尝试取出资源 */
            const result = creep.widthdraw(structure, task.resourceType, withdrawals)
            if (result === OK)
                return true
            /* 资源不足就移除任务 */
            else if (result === ERR_NOT_ENOUGH_RESOURCES)
                creep.room.deleteCurrentCenterTask()
            /* 够不到就移动过去 */
            else if (result === ERR_NOT_IN_RANGE)
                creep.goTo(structure.pos)
            else if (result === ERR_FULL)
                return true
            else {
                creep.log(`source 阶段取出异常，错误码 ${result}`, 'red')
                creep.room.hangCenterTask()
            }
            return false
        },
        /* 将资源运送到指定建筑 */
        target: creep => {
            /* 没有任务就返回 source阶段待命 */
            const task = creep.room.getCenterTask()
            if (!task)
                return true
            /* 提前获取携带量 */
            const amount = creep.store.getUsedCapacity(task.resourceType)
            /* 通过犯贱基础服务获取对应建筑 */
            const structure = creep.room[task.target]
            if (!structure) {
                creep.room.deleteCurrentCenterTask()
                return false
            }
            const result = creep.transfer(structure, task.resourceType)
            /* 如果转移完成则增加任务进度 */
            if (result === OK) {
                creep.room.handleCenterTask(amount)
                return true
            }
            /* 如果距离太远，移动过去 */
            else if (result === ERR_NOT_IN_RANGE)
                creep.goTo(structure.pos)
            else if (result === ERR_FULL) {
                creep.say(`${task.target} 满了`)
                if (task.target === STRUCTURE_TERMINAL)
                    Game.notify(`[${creep.room.name}] ${task.target} 满了，请尽快处理`);
                creep.room.hangCenterTask()
            }
            /* 资源不足就返回 source阶段 */
            else if (result === ERR_NOT_ENOUGH_RESOURCES) {
                creep.say('取出资源')
                return true
            }
            else {
                creep.say(`存入 ${result}`)
                creep.room.hangCenterTask()
            }
            return false
        },
        bodys: 'processor'
    })
}

export default roles