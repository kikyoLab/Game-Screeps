const utils = require('utils')

module.exports = {
    /* 自动生成房间基础单位 */
    run: function () {
        const obsearch = 50;
        const searchNeedBuilder = 100;
        const searchNeedUpgrader = 500;
        const searchStorage = 500;
        const searchTerminal = 500;
        const searchNuker = 1000;
        let myRooms = Memory.roomConfig.myRooms
        for (var i in myRooms) {

            if (Memory.roomConfig[myRooms[i]].spawnList.harvester.count < 1) {
                let spawn = utils.getAvaliableSpawn(myRooms[i])
                let bodys = utils.setBodyParts(Game.rooms[myRooms[i]].controller.level).harvesterBody
                let name = `${myRooms[i]} + 能量矿姬 + ${Math.random(0, 999)} + 号`;
                if (spawn) {
                    spawn.spawnCreep(bodys, name, {
                        memory: {
                            roleName: 'roleHarvester',
                        }
                    })
                    Memory.roomConfig[myRooms[i]].spawnList.harvester.count++
                }
            }

            if (Memory.roomConfig[myRooms[i]].spawnList.filler.count < 1) {
                let spawn = utils.getAvaliableSpawn(myRooms[i])
                let bodys = utils.setBodyParts(Game.rooms[myRooms[i]].controller.level).fillerBody
                let name = `${myRooms[i]} + 填充姬 + ${Math.random(0, 999)} + 号`;
                if (spawn) {
                    spawn.spawnCreep(bodys, name, {
                        memory: {
                            roleName: 'roleFiller'
                        }
                    })
                    Memory.roomConfig[myRooms[i]].spawnList.filler.count++
                }
            }

            if (Memory.roomConfig[myRooms[i]].spawnList.transfer.count < 1) {
                let spawn = utils.getAvaliableSpawn(myRooms[i])
                let bodys = utils.setBodyParts(Game.rooms[myRooms[i]].controller.level).transferBody
                let name = `${myRooms[i]} + 运输姬 + ${Math.random(0, 999)} + 号`;
                if (spawn) {
                    spawn.spawnCreep(bodys, name, {
                        memory: {
                            roleName: 'roleTransfer'
                        }
                    })
                    Memory.roomConfig[myRooms[i]].spawnList.transfer.count++
                }
            }

            if (Memory.roomConfig[myRooms[i]].spawnList.centerFiller.count < 1) {
                let spawn = utils.getAvaliableSpawn(myRooms[i])
                let bodys = utils.setBodyParts(Game.rooms[myRooms[i]].controller.level).centerFillerBody
                let name = `${myRooms[i]} + 中央运输姬 + ${Math.random(0, 999)} + 号`;
                if (spawn) {
                    spawn.spawnCreep(bodys, name, {
                        memory: {
                            roleName: 'roleCenterFiller'
                        }
                    })
                    Memory.roomConfig[myRooms[i]].spawnList.centerFiller.count++
                }
            }

            if (Game.time % searchNeedBuilder == 0) {
                this._creatBuilder()
            }

            if (Game.time % searchNeedUpgrader == 0) {
                this._creatUpgrader()
            }

            if (Game.time % searchNuker == 0) {
                this._defenseNuker()
            }

            if (Game.time % obsearch == 0) {
                this._observer()
            }

            if (Game.time % searchStorage == 0) {
                this._StorageOverFlow()
            }

            if (Game.time % searchTerminal == 0) {
                this._TerminalOverFlow()
            }
        }
    },

    /* 是否需要生成建造单位 */
    _creatBuilder: function () {
        let rooms = Memory.roomConfig.myRooms
        for (var roomName of rooms) {
            let isNeedBuild = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES)
            if (isNeedBuild) {
                let spawn = utils.getAvaliableSpawn(roomName);
                let bodys = utils.setBodyParts(Game.rooms[roomName].controller.level).builderBody;
                let name = `${roomName} + 建造姬 + ${Math.random(0, 999)} + 号`;
                spawn.spawnCreep(bodys, name, {
                    memory: { roleName: 'roleBuilder' }
                });
            }
        }
    },

    /* 是否需要生成升级单位 */
    _creatUpgrader: function () {
        let rooms = Memory.roomConfig.myRooms
        for (var roomName of rooms) {
            let controller = Game.getObjectById(Memory.roomConfig[roomName].Controller);
            if (controller.ticksToDowngrade <= 10000) {
                let spawn = utils.getAvaliableSpawn(roomName);
                let bodys = utils.setBodyParts(Game.rooms[roomName].controller.level).upgraderBody;
                let name = `${roomName} + 升级姬 + ${Math.random(0, 999)} + 号`;
                spawn.spawnCreep(bodys, name, {
                    memory: { roleName: 'roleUpgrader' }
                });
            }
        }
    },

    /* nuker防御 */
    _defenseNuker: function () {
        let rooms = Memory.roomConfig.myRooms
        for (var roomName of rooms) {
            let nukers = Game.rooms[roomName].find(FIND_NUKES)
            if (nukers) {
                let spawn = utils.getAvaliableSpawn(roomName);
                let bodys = utils.setBodyParts(Game.rooms[roomName].controller.level).repairBody;
                let name = `${roomName} + 维修姬 + ${Math.random(0, 999)} + 号`;
                spawn.spawnCreep(bodys, name, {
                    memory: { roleName: 'roleRepair' }
                });
            }
        }
    },

    /* ob扫描 */
    _observer: function () {
        let myRooms = Memory.roomConfig.myRooms;
        let searchRooms = []
        for (var i = 0; i < myRooms.length; i++) {
            let ob = Game.getObjectById(Memory.roomConfig[myRooms[i]].Observer.id)
            ob.observeRoom(searchRooms[i])
            if (Game.time % 5 == 0) {
                let powerBanks = Game.rooms[searchRooms[i]].find(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (
                            s.structureType == STRUCTURE_POWER_BANK &&
                            s.power >= 5000 &&
                            s.ticksToDecay >= 4500
                        )
                    }
                })

                let deposits = Game.rooms[searchRooms[i]].find(FIND_DEPOSITS)
                if (deposits.length > 0) {
                    Memory.roomConfig[myRooms[i]].deposits = {
                        roomName: searchRooms[i],
                        id: deposits[i].id,
                        type: deposits[i].depositType,
                        status: true
                    }
                }

                if (powerBanks.length > 0) {
                    Memory.roomConfig[myRooms[i]].powerBanks = {
                        roomName: searchRooms[i],
                        id: powerBanks[i].id,
                        status: true
                    }
                }
                return
            }
        }
    },

    /* Storage 爆仓 */
    _StorageOverFlow: function () {
        let rooms = Memory.roomConfig.myRooms
        for (var roomName of rooms) {
            let storages = Game.getObjectById(Memory.roomConfig[roomName].Storage.id)
            if (storages.store[RESOURCE_ENERGY] >= 500000) {
                Memory.roomConfig[roomName].Storage.overflow = true
            }
        }
    },

    /* Terminal 爆仓 */
    _TerminalOverFlow: function () {
        let rooms = Memory.roomConfig.myRooms
        for (var roomName of rooms) {
            let terminals = Game.getObjectById(Memory.roomConfig[roomName].Storage.id)
            if (terminals.store[RESOURCE_ENERGY] >= 150000) {
                Game.market.createOrder({
                    type: ORDER_SELL,
                    resourceType: RESOURCE_ENERGY,
                    price: 0.2,
                    totalAmount: 100000,
                    roomName: roomName
                });
            }
        }
    },

    /* pb进攻 */
    _pbHarvest: function () {
        let myRooms = Memory.roomConfig.myRooms
        for (var i in myRooms) {
            if (Memory.roomConfig[myRooms[i]].powerBanks.status) {
                let pbRoom = Memory.roomConfig[myRooms[i]].powerBanks.roomName
                let pbId = Memory.roomConfig[myRooms[i]].powerBanks.id
                let spawn = utils.getAvaliableSpawn(myRooms[i])
                /* pbAttacker */
                if (Memory.roomConfig[myRooms[i]].powerBanks.count.attacker < 1) {
                    let bodys = utils.setBodyParts(Game.rooms[myRooms[i]].controller.level).pbAttackerBody
                    let name = `${myRooms[i]} + pb进攻姬 + ${Math.random(0, 999)} + 号`
                    spawn.spawnCreep(bodys, name, {
                        memory: {
                            roleName: 'rolePbAttacker',
                            roomName: myRooms[i],
                            pbId: pbId
                        }
                    });
                    Memory.roomConfig[myRooms[i]].powerBanks.count.attacker++
                }

                /* pbHealer */
                if (Memory.roomConfig[myRooms[i]].powerBanks.count.healer < 2) {
                    let bodys = utils.setBodyParts(Game.rooms[myRooms[i]].controller.level).pbHealerBody
                    let name = `${myRooms[i]} + pb治疗姬 + ${Math.random(0, 999)} + 号`
                    spawn.spawnCreep(bodys, name, {
                        memory: {
                            roleName: 'rolePbHealer',
                            roomName: myRooms[i],
                        }
                    });
                    Memory.roomConfig[myRooms[i]].powerBanks.count.healer++
                }

                /* pbTransfer */
                if (Memory.roomConfig[myRooms[i]].powerBanks.count.transfer < 6) {
                    let bodys = utils.setBodyParts(Game.rooms[myRooms[i]].controller.level).pbTransferBody
                    let name = `${myRooms[i]} + pb管道姬 + ${Math.random(0, 999)} + 号`
                    spawn.spawnCreep(bodys, name, {
                        memory: {
                            roleName: 'rolePbTransfer',
                            roomName: myRooms[i],
                            pbRoom: pbRoom,
                            pbId: pbId
                        }
                    });
                    Memory.roomConfig[myRooms[i]].powerBanks.count.transfer++
                }
            }
        }
    },

    /* deposit 采集 */
    _deposits: function () {
        let myRooms = Memory.roomConfig.myRooms
        for (var i in myRooms) {
            if (Memory.roomConfig[myRooms[i]].deposits.status) {
                let deRoom = Memory.roomConfig[myRooms[i]].deposits.roomName
                let deId = Memory.roomConfig[myRooms[i]].deposits.id
                let type = Memory.roomConfig[myRooms[i]].deposits.type
                let spawn = utils.getAvaliableSpawn(myRooms[i])
                let bodys = utils.setBodyParts(Game.rooms[myRooms[i]].controller.level).depositBody
                let name = `${myRooms[i]} + Deposit矿姬 + ${Math.random(0, 999)} + 号`
                spawn.spawnCreep(bodys, name, {
                    memory: {
                        roleName: 'roleDepositer',
                        roomName: myRooms[i],
                        deRoom: deRoom,
                        deId: deId,
                        deType: type
                    }
                });
            }
        }
    },
}