const utils = require('utils')

module.exports = {
    _run: function () {
        let upgrader = 0
        let filler = 0
        let builder = 0
        let harvestS0 = 0
        let harvestS1 = 0
        let transfer = 0
        const searchTime = 100
        for (var i in Game.creeps) {
            let creep = Game.creeps[i]

            if (Game.time % searchTime == 0) {
                let target = creep.room.find(FIND_MY_CONSTRUCTION_SITES)
                if (target) {
                    Memory.E59S1.spawnList.buildStatus = true
                } else {
                    Memory.E59S1.spawnList.buildStatus = false
                }

                let controllers = creep.room.controller
                if (controllers.level < 8 || controllers.ticksToDowngrade <= 50000) {
                    Memory.E59S1.spawnList.upStatus = true
                } else {
                    Memory.E59S1.spawnList.upStatus = false
                }
            }

            if (creep.memory.roleName == 'roleUpgrader') {
                upgrader++
            }

            if (creep.memory.roleName == 'roleFiller') {
                filler++
            }

            if (creep.memory.roleName == 'roleBuilder') {
                builder++
            }

            if (creep.memory.target == 's0') {
                harvestS0++
            }

            if (creep.memory.target == 's1') {
                harvestS1++
            }

            if (creep.memory.roleName == 'roleTransfer') {
                transfer++
            }
        }

        if (upgrader < Memory.E59S1.spawnList.upgrader.count && Memory.E59S1.spawnList.upStatus) {
            this._creatUpgrader('E59S1')
        }

        if (filler < Memory.E59S1.spawnList.filler.count) {
            this._creatFiller('E59S1')
        }

        if (builder < Memory.E59S1.spawnList.builder.count && Memory.E59S1.spawnList.buildStatus) {
            this._creatBuild('E59S1')
        }

        if (harvestS0 < Memory.E59S1.spawnList.harvester.s0.count) {
            this._creatHarvest('E59S1', 's0')
        }

        if (harvestS1 < Memory.E59S1.spawnList.harvester.s1.count) {
            this._creatHarvest('E59S1', 's1')
        }

        if (transfer < Memory.E59S1.spawnList.transfer.count) {
            this._creatTransfer('E59S1')
        }
    },

    _creatUpgrader: function (roomName) {
        let spawn = utils.getAvaliableSpawn(roomName);
        let name = `${roomName}升级姬${Game.time}号`;
        let body = utils.setBodyParts(Game.rooms[roomName].level).upgraderBody
        if (spawn) {
            spawn.spawnCreep(body, name, {
                memory: { roleName: 'roleUpgrader', dontPullMe: true }
            });
        }
    },

    _creatFiller: function (roomName) {
        let spawn = utils.getAvaliableSpawn(roomName);
        let name = `${roomName}填充姬${Game.time}号`;
        let body = utils.setBodyParts(Game.rooms[roomName].level).fillerBody
        if (spawn) {
            spawn.spawnCreep(body, name, {
                memory: { roleName: 'roleFiller' }
            });
        }
    },

    _creatBuild: function (roomName) {
        let spawn = utils.getAvaliableSpawn(roomName);
        let name = `${roomName}建造姬${Game.time}号`;
        let body = utils.setBodyParts(Game.rooms[roomName].level).builderBody
        if (spawn) {
            spawn.spawnCreep(body, name, {
                memory: { roleName: 'roleBuilder' }
            });
        }
    },

    _creatHarvest: function (roomName, role) {
        let spawn = utils.getAvaliableSpawn(roomName);
        let name = `${roomName}挖掘姬${Game.time}号`;
        let body = utils.setBodyParts(Game.rooms[roomName].level).harvesterBody
        if (spawn) {
            spawn.spawnCreep(body, name, {
                memory: { roleName: 'roleHarvest', target: role, dontPullMe: true }
            });
        }
    },

    _creatTransfer: function (roomName) {
        let spawn = utils.getAvaliableSpawn(roomName);
        let name = `${roomName}运输姬${Game.time}号`;
        let body = utils.setBodyParts(Game.rooms[roomName].level).transferBody
        if (spawn) {
            spawn.spawnCreep(body, name, {
                memory: { roleName: 'roleTransfer' }
            });
        }
    },

    _searchRoomStatus: function (roomName) {
        let structures = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES)
        if (structures) {

        }
    }
}