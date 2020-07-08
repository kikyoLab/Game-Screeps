/* creep配置 */
const CreepConfig = {
    _run: function () {
        for (var i in Game.creeps) {
            var creep = Game.creeps[i]
            switch (creep.memory.roleName) {
                case 'roleFiller':
                    this._fill(creep)
                    break;
                case 'roleHarvester':
                    this._harvest(creep)
                    break;
                case 'roleUpgrader':
                    this._upgrad(creep)
                    break;
                case 'roleBuilder':
                    this._build(creep)
                    break;
                case 'roleCenterFiller':
                    this._centerFill(creep)
                    break;
                case 'roleTransfer':
                    this._transfer(creep)
                    break;
                case 'roleRepair':
                    this._repair(creep)
                    break;
                case 'roleAttacker':
                    this._attacker(creep)
                    break;
                case 'rolePbAttacker':
                    this._pbAttacker(creep)
                    break;
                case 'rolePbHealer':
                    this._pbHealer(creep)
                    break;
                case 'rolePbTransfer':
                    this._pbTransfer(creep)
                    break;
                case "roleWarder":
                    this._warder(creep)
                    break;
                case "roleDepositer":
                    this._deHarvester(creep)
            }
        }
    },

    /**
     * 基础建筑填充单位
     * @param {Object} creep 
     */
    _fill: function (creep) {
        let targets;
        const storages = Game.getObjectById(Memory.roomConfig[creep.room.name].storage.id)
        const terminals = Game.getObjectById(Memory.roomConfig[creep.room.name].terminal.id)

        if (!targets) {
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => {
                    return (
                        s.structureType == STRUCTURE_SPAWN && s.store.getFreeCapacity() > 0 ||
                        s.structureType == STRUCTURE_EXTENSION && s.store.getFreeCapacity() > 0 ||
                        s.structureType == STRUCTURE_TOWER && s.store[RESOURCE_ENERGY] <= 600
                    )
                }
            })
        }

        /* 填充基础建筑 */
        if (targets.length > 0) {
            creep.memory.fillStatus = true
        } else {
            creep.memory.fillStatus = false
        }

        if (creep.memory.fillStatus) {
            creep.store[RESOURCE_ENERGY] == 0 ?
                creep._widthdraw(storages, RESOURCE_ENERGY) : creep._transfer(targets[0], RESOURCE_ENERGY)
        }

        if (!creep.memory.fillStatus) {
            targets = null
            if (Memory.roomConfig[creep.room.name].storage.overflow) {
                creep.store[RESOURCE_ENERGY] == 0 ?
                    creep._widthdraw(storages, RESOURCE_ENERGY) : creep._transfer(terminals, RESOURCE_ENERGY)
            }
        }

        if (creep.ticksToLive <= 20) {
            creep.say('🔪 awsl')
            Memory.roomConfig[creep.room.name].spawnList.filler.count == 0
        }
    },

    /**
     * 能源矿采集单位
     * @param {Object} creep 
     */
    _harvest: function (creep) {
        let status;
        let sources;
        const sources0 = Game.getObjectById(Memory.roomConfig[creep.room.name].sources0.id)
        const sources1 = Game.getObjectById(Memory.roomConfig[creep.room.name].sources1.id)
        const storages = Game.getObjectById(Memory.roomConfig[creep.room.name].storage.id)

        if (sources0.energy == 0) {
            sources = sources1
            status = true
        } else {
            sources = sources0
        }

        /* 采矿 */
        if (creep.harvest(sources) == OK) {
            if (status) {
                delete creep.memory.harvesterSourcesLinkId
                status = false
            }

            if (!creep.memory.harvesterSourcesLinkId) {
                let links = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_LINK
                })

                creep.memory.harvesterSourcesLinkId = links.id
            }
            creep.harvest(sources);
        } else {
            creep.moveTo(sources)
        }

        if (creep.store[RESOURCE_ENERGY] !== 0) {
            /* 找不到link就填storage */
            if (!creep.memory.harvesterSourcesLinkId) {
                creep._transfer(storages, RESOURCE_ENERGY)
            } else {
                let sendLink = Game.getObjectById(creep.memory.harvesterSourcesLinkId)
                creep._transfer(sendLink, RESOURCE_ENERGY)
            }
            /* 找到link就填link */
            if (sendLink.store[RESOURCE_ENERGY] >= 450) {
                let centerLink = Game.getObjectById(Memory.roomConfig[creep.room.name].centerLink.id)
                sendLink.transferEnergy(centerLink)
            }
        }

        if (creep.ticksToLive <= 20) {
            creep.say('🔪 awsl')
            Memory.roomConfig[creep.room.name].spawnList.harvester.count == 0
        }
    },

    /**
     * 升级单位
     * @param {Object} creep 
     */
    _upgrad: function (creep) {
        /* 枢纽升级 */
        const controller = Game.getObjectById(Memory.roomConfig[creep.room.name].controller.id)
        const linkTarget = Game.getObjectById(Memory.roomConfig[creep.room.name].controllerLink.id)

        creep.store[RESOURCE_ENERGY] == 0 ?
            creep._widthdraw(linkTarget, RESOURCE_ENERGY) : creep._upgradeController(controller)
    },

    /**
     * 建造单位
     * @param {Object} creep 
     */
    _build: function (creep) {
        const storages = Game.getObjectById(Memory.roomConfig[creep.room.name].storage.id)
        targets = creep.room.find(FIND_CONSTRUCTION_SITES)


        if (!Memory.roomConfig[creep.room.name].war) {
            creep.memory.warStatus = false
        } else {
            creep.memory.warStatus = true
        }

        if (!creep.memory.warStatus) {
            if (targets && targets.length > 0) {
                creep.store[RESOURCE_ENERGY] == 0 ?
                    creep._withdraw(storages, RESOURCE_ENERGY) : creep._build(target[0])
            }
        }

        if (creep.memory.warStatus) {
            let target = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hits <= 1000000
            })

            if (target) {
                creep.store[RESOURCE_ENERGY] == 0 ?
                    creep._widthdraw(storages, RESOURCE_ENERGY) : creep._repair(target[0])
            }
        }
    },

    /**
     * 中央运输单位
     * @param {Object} creep 
     */
    _centerFill: function (creep) {
        const labTime = 75
        const storages = Game.getObjectById(Memory.roomConfig[creep.room.name].storage.id)
        const powers = Game.getObjectById(Memory.roomConfig[creep.room.name].powerSpawn.id)
        const nukers = Game.getObjectById(Memory.roomConfig[creep.room.name].nuker.id)

        /* power填充 */
        if (powers.store[RESOURCE_ENERGY] < 2000) {
            creep.memory.powers = true
            creep.store[RESOURCE_ENERGY] == 0 ?
                creep._widthdraw(storages, RESOURCE_ENERGY) : creep._transfer(powers, RESOURCE_ENERGY)
        } else if (powerTarget.store[RESOURCE_POWER] < 50) {
            creep.store[RESOURCE_POWER] == 0 ?
                creep._widthdraw(storages, RESOURCE_POWER) : creep._transfer(powers, RESOURCE_POWER)
        } else {
            creep.memory.powers = false
        }

        /* nuker填充 */
        if (!creep.memory.powers) {
            if (nukers.store[RESOURCE_ENERGY] < 300000) {
                creep.memory.nukers = true
                creep.store[RESOURCE_ENERGY] == 0 ?
                    creep._widthdraw(storages, RESOURCE_ENERGY) : creep._transfer(nukers, RESOURCE_ENERGY)
            } else if (nukers.store[RESOUCE_GHODIUM] < 5000) {
                creep.store[RESOUCE_GHODIUM] == 0 ?
                    creep._widthdraw(storages, RESOURCE_GHODIUM) : creep._transfer(nukers, RESOURCE_GHODIUM)
            } else {
                creep.memory.nukers = false
            }
        }

        /* lab 能量填充 */
        if (!creep.memory.powers && !creep.memory.nukers) {
            if (Game.time % labTime == 0) {
                delete creep.memory.labNeedEnergy
            }

            if (!creep.memory.labNeedEnergy) {
                let needEnergy = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_LAB && s.store[RESOURCE_ENERGY] < 1500
                })

                if (labTargets.length > 0) {
                    creep.memory.labNeedEnergy = needEnergy
                }
            }

            if (creep.memory.labNeedEnergy) {
                let targets = creep.memory.labNeedEnergy
                creep.store[RESOURCE_ENERGY] == 0 ?
                    creep._widthdraw(storages, RESOURCE_ENERGY) : creep._transfer(targets[0], RESOURCE_ENERGY)
            }
        }

        if (creep.ticksToLive <= 20) {
            creep.say('🔪 awsl')
            Memory.roomConfig[creep.room.name].spawnList.centerFiller.count == 0
        }
    },

    /**
     * 运输单位
     * @param {Object} creep 
     */
    _transfer: function (creep) {
        const storages = Game.getObjectById(Memory.roomConfig[creep.room.name].storage.id)
        const links = Game.getObjectById(Memory.roomConfig[creep.room.name].centerLink.id)
        let resource = creep.room.find(FIND_DROPPED_RESOURCES)

        /* 中央link有能量就拿 没有就捡垃圾 */
        if (creep.store[RESOURCE_ENERGY] == 0) {
            if (links.store[RESOUCE_ENERGY] >= 400) {
                creep._widthdraw(links, RESOURCE_ENERGY)
            } else if (resource) {
                creep._pickup(resource)
            }
        } else {
            creep._transfer(storages, RESOURCE_ENERGY)
        }

        if (creep.ticksToLive <= 20) {
            creep.say('🔪 awsl')
            Memory.roomConfig[creep.room.name].spawnList.transfer.count == 0
        }
    },

    /**
     * Nuker 紧急维修单位
     * @param {Object} creep 
     */
    _repair: function (creep) {
        const storages = Game.getObjectById(Memory.roomConfig[creep.room.name].storage.id)
        let targets = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hits <= 11000000
        })

        if (targets.length > 0) {
            creep.store[RESOURCE_ENERGY] == 0 ?
                creep._widthdraw(storages, RESOURCE_ENERGY) : creep._repair(targets[0])
        } else {
            creep.say('Zzz')
        }
    },

    /**
     * 进攻单位
     * @param {Object} creep 
     * @param {String} roomName 
     * @param {Number} pos 
     * @param {Object} target 
     */
    _attacker: function (creep, roomName, pos, target) {
        let team = Game.creeps.filter((x) => x.memory.role == 'attacker')
        let notYet = team.filter((x) => x.room.name == roomName ? false : true)
        /* 进攻小队在同一房间 */
        if (!notYet) {
            /* 是否有指定攻击目标 */
            if (target) {
                /* 攻击目标路途中受到阻拦则找到最近的一个rampart进行攻击 */
                if (creep.moveTo(target) == ERR_NO_PATH) {
                    let rua = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                        filter: (s) => s.structureType == STRUCTURE_RAMPART
                    })

                    creep.attack(rua)
                } else {
                    /* 没遇到阻拦则直接去攻击目标 */
                    creep._attack(target)
                }
            } else {
                /* 没有指定目标就攻击tower和spawn */
                let targets = creep.room.find(FIND_HOSTILE_STRUCTURES, {
                    filter: (s) => {
                        return (
                            s.structureType == STRUCTURE_TOWER ||
                            s.structureType == STRUCTURE_SPAWN
                        )
                    }
                })

                creep._attack(targets[0])
            }
        } else {
            /* 进攻小队没在同一房间则等待就位 */
            creep.moveTo(new RoomPosition(pos, roomName));
            creep.say('reading')
        }
    },

    /**
     * Pb挖掘 进攻单位
     * @param {String} roomName 出生地
     * @param {String} pbRoom
     * @param {String} pbId 攻击单位
     */
    _pbAttacker: function (creep) {
        const roomName = creep.memory.roomName
        const target = Game.getObjectById(Memory.roomConfig[roomName].powerBank.id)
        if (!Memory.roomConfig[roomName].powerBank.run.attack) {
            if (creep.pos.isNearTo(target)) {
                creep.say('⚔ ready')
                Memory.roomConfig[roomName].powerBank.run.attack = true
            } else {
                creep.moveTo(target)
            }
        }

        if (Memory.roomConfig[roomName].powerBank.run.ready) {
            creep.attack(target)
            creep.say(`还剩 + ${target.hits} , 需要 ${target.hits / 1200} tick`)
        }

        if (target.hits <= 10000 || target.hits / 1200 <= 100) {
            Memory.roomConfig[roomName].powerBank.run.transfer = true
        }
    },

    /**
     * Pb挖掘 治疗单位
     * @param {String} roomName 出生地
     * @param {String} pbRoom 
     */
    _pbHealer: function (creep) {
        let target
        const roomName = creep.memory.roomName
        if (!target) {
            target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (s) => s.memory.roleName == rolePbAttacker
            })
        }

        if (!Memory.roomConfig[roomName].powerBank.run.heal) {
            if (creep.pos.isNearTo(target)) {
                creep.say('🔧 ready')
                Memory.roomConfig[roomName].powerBank.run.heal = true
            } else {
                creep.moveTo(target)
            }
        }

        if (Memory.roomConfig[roomName].powerBank.run.attack && Memory.roomConfig[roomName].powerBank.run.heal) {
            Memory.roomConfig[roomName].powerBank.run.ready = true
        }

        if (Memory.roomConfig[roomName].powerBank.run.ready) {
            creep.heal(target)
        }
    },

    /**
     * Pb挖掘 运输单位
     * @param {String} roomName 出生地
     * @param {String} targetId 终端
     * @param {String} pbId 
     */
    _pbTransfer: function (creep) {
        const terminals = Game.getObjectById(Memory.roomConfig[creep.memory.roomName].terminal.id)
        const target = Game.getObjectById(Memory.roomConfig[creep.room.name].powerBank.id)
        const pbRoom = Memory.roomConfig[creep.room.name].powerBank.roomName
        if (target) {
            creep.moveTo(target)
        } else {
            let sources = Game.rooms[pbRoom].find(FIND_DROPPED_RESOURCES)
            creep.store[RESOURCE_POWER] == 0 ?
                creep._pickup(sources) : creep._transfer(terminals, RESOURCE_POWER)
        }
    },

    /**
     * deposit采集单位
     * @param {Object} creep
     * @param {String} roomName 出生地
     * @param {String} deId 采集单位
     * @param {String} type 矿物类型
     */
    _deHarvester: function (creep) {
        const terminals = Game.getObjectById(Memory.roomConfig[creep.memory.roomName].terminal.id)
        const target = Game.getObjectById(Memory.roomConfig[creep.room.name].deposit.id)
        const type = Memory.roomConfig[creep.room.name].deposit.type
        if (creep.ticksToLive <= 100) {
            creep._transfer(terminals, type)
        } else if (creep.store[Type] < getCapacity()) {
            creep._harvest(target, type)
        } else {
            creep._transfer(terminals, type)
        }

        if (target.lastCooldown >= 80) {
            Memory.roomConfig[creep.memory.roomName].deposit.status = false
        }
    }
}

module.exports = CreepConfig