const TaskConfig = {
    basicTask: function (roomName) {
        let Task = []
        /* extensionTask */
        let extensions;
        if (!extensions) {
            extensions = Game.rooms[roomName].find(FIND_STRUCTURE, {
                filter: (s) => s.structureType == STRUCTURE_EXTENSION
            })
        }

        for (var e of extensions) {
            if (e.store[RESOURCE_ENERGY] < e.getCapacity(RESOURCE_ENERGY)) {
                Task.push({
                    targetId: e.id,
                    type: RESOURCE_ENERGY,
                    amount: e.getCapacity(RESOURCE_ENERGY) - e.store[RESOURCE_ENERGY],
                    priority: 1,
                })
            }
        }

        /* spawnTask */
        let spawns;
        if (!spawns) {
            spawns = Game.spawns.filter((x) => x.room.name == roomName)
        }

        for (var s of spawns) {
            if (s.store[RESOURCE_ENERGY] < s.getCapacity(RESOURCE_ENERGY)) {
                Task.push({
                    targetId: s.id,
                    type: RESOURCE_ENERGY,
                    amount: s.getCapacity(RESOURCE_ENERGY) - s.store[RESOURCE_ENERGY],
                    priority: 0
                })
            }
        }

        /* towerTask */
        let towers;
        if (!towers) {
            towers = Game.rooms[roomName].find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_TOWER
            })
        }

        for (var t of towers) {
            if (t.store[RESOURCE_ENERGY] <= t.getCapacity(RESOURCE_ENERGY) * 0.5) {
                Task.push({
                    targetId: t.id,
                    type: RESOURCE_ENERGY,
                    amount: t.getCapacity(RESOURCE_ENERGY) - t.store[RESOURCE_ENERGY],
                    priority: 2
                })
            }
        }

        /* powerSpawnTask */
        let powerSpawns = Game.getObjectById(Memory.roomConfig[roomName].PowerSpawn.id)
        if (powerSpawns.store[RESOURCE_ENERGY] <= powerSpawns.getCapacity(RESOURCE_ENERGY) * 0.5) {
            Task.push({
                targetId: powerSpawns.id,
                type: RESOURCE_ENERGY,
                amount: powerSpawns.getCapacity(RESOURCE_ENERGY) - powerSpawns.store[RESOURCE_ENERGY],
                priority: 3
            })
        }

        if (powerSpawns.store(RESOURCE_POWER) <= powerSpawns.getCapacity(RESOURCE_POWER) * 0.5) {
            Task.push({
                targetId: powerSpawns.id,
                type: RESOURCE_POWER,
                amount: powerSpawns.getCapacity(RESOURCE_POWER) - powerSpawns.store[RESOURCE_POWER],
                priority: 3
            })
        }

        /**
         *  labTask 
         */
        let labs;
        if (!labs) {
            labs = Game.rooms[roomName].find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LAB
            })
        }

        for (var l of labs) {
            if (l.store[RESOURCE_ENERGY] <= l.getCapacity(RESOURCE_ENERGY) * 0.6) {
                Task.push({
                    targetId: l.id,
                    type: RESOURCE_ENERGY,
                    amount: l.getCapacity(RESOURCE_ENERGY) - l.store[RESOURCE_ENERGY],
                    priority: 4
                })
            }
        }

        /**
         *  factoryTask 
         */
        let factorys = Game.getObjectById(Memory.roomConfig[roomName].Factory.id)
        if (factorys.store[RESOURCE_ENERGY] <= factorys.getCapacity(RESOURCE_ENERGY) * 0.5) {
            Task.push({
                targetId: factorys.id,
                type: RESOURCE_ENERGY,
                amount: factorys.getCapacity(RESOURCE_ENERGY) - factorys.store[RESOURCE_ENERGY],
                priority: 5
            })
        }

        /**
         * nukerTask
         */
        let nukers = Game.getObjectById(Memory.roomConfig[roomName].Nuker.id)
        if (nukers.store[RESOURCE_ENERGY] <= nukers.getCapacity(RESOURCE_ENERGY)) {
            Task.push({
                targetId: nukers.id,
                type: RESOURCE_ENERGY,
                amount: nukers.getCapacity(RESOURCE_ENERGY) - nukers.store[RESOURCE_ENERGY],
                priority: 6
            })
        }

        if (nukers.store[RESOURCE_GHODIUM] <= nukers.getCapacity(RESOURCE_GHODIUM)) {
            Task.push({
                targetId: nukers.id,
                type: RESOURCE_GHODIUM,
                amount: nukers.getCapacity(RESOURCE_GHODIUM) - nukers.store[RESOURCE_GHODIUM],
                priority: 6
            })
        }
    },

    advancedTask: function (roomName) {
        let Task = []
    }
}

module.exports = TaskConfig
