// energy type
const E = RESOURCE_ENERGY
const P = RESOURCE_POWER
const H = RESOURCE_HYDROGEN
const O = RESOURCE_OXYGEN
const U = RESOURCE_UTRIUM
const L = RESOURCE_LEMERGIUM
const K = RESOURCE_KEANIUM
const Z = RESOURCE_ZYNTHIUM
const X = RESOURCE_CATALYST
const G = RESOURCE_GHODIUM
const SILICON = RESOURCE_SILICON
const METAL = RESOURCE_METAL
const BIOMASS = RESOURCE_BIOMASS
const MIST = RESOURCE_MIST

// action type
const r = ERR_NOT_IN_RANGE

// structure type
const SPAWN = STRUCTURE_SPAWN
const LINK = STRUCTURE_LINK
const EXTENSION = STRUCTURE_EXTENSION
const CONTAINER = STRUCTURE_CONTAINER
const TOWER = STRUCTURE_TOWER
const STORAGE = STRUCTURE_STORAGE
const TERMINAL = STRUCTURE_TERMINAL
const WALL = STRUCTURE_WALL
const RAMPART = STRUCTURE_RAMPART


Creep.prototype._getEnergy = function () {
    if (!this.memory.harvestId) {
        let sources = this.room.find(FIND_SOURCES)
        this.memory.target == 's0' ? this.memory.harvestId = sources[0].id : this.memory.harvestId = sources[1].id
    }

    let target = Game.getObjectById(this.memory.harvestId)
    if (target) {
        if (!this.memory.sourceContainerId) {
            let containers = target.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => s.structureType == CONTAINER
            })

            this.memory.sourceContainerId = containers.id
        }

        if (!this.memory.sourceLinkId) {
            let links = target.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => s.structureType == LINK
            })

            this.memory.sourceLinkId = links.id
        }

        let containers = Game.getObjectById(this.memory.sourceContainerId)
        let links = Game.getObjectById(this.memory.sourceLinkId)

        if (this.store[E] == 0) {
            this._harvest(target, E)
        }
        else if (links) {
            this._transfer(links, E)
        }
        else if (containers) {
            this._transfer(containers, E)
        }
        else {
            this.say('能量储存设施故障')
        }
    }
}

Creep.prototype._fillEnergy = function () {
    let fillTargets;
    if (!fillTargets && Game.time % 5 == 0) {
        fillTargets = this.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return (
                    s.structureType == SPAWN && s.store[E] < 300 ||
                    s.structureType == EXTENSION && s.store[E] < s.store.getCapacity() ||
                    s.structureType == TOWER && s.store[E] < 600
                )
            }
        })
    }

    fillTargets.length > 0 ? this.memory.fillStatus = true : this.memory.fillStatus = false

    if (!this.memory.storageId) {
        let target = this.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STORAGE
        })

        this.memory.storageId = target.id
    }

    if (!this.memory.terminalId) {
        let target = this.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == TERMINAL
        })

        this.memory.terminalId = target.id
    }

    let terminals = Game.getObjectById(this.memory.terminalId)
    let storages = Game.getObjectById(this.memory.storageId)

    if (storages) {
        storages.store[E] >= storages.store.getCapacity() * 0.6 ?
            this.memory.overflow = true : this.memory.overflow = false

        if (!this.memory.sourceLinkId) {
            let link = storages.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => s.structureType == LINK
            })

            this.memory.sourceLinkId = link.id
        }

        let links = Game.getObjectById(this.memory.sourceLinkId)

        if (this.memory.fillStatus) {
            this.store[E] == 0 ? this._withdraw(storages, E) : this._transfer(fillTargets[0], E)
        }
        else if (links && links.store[E] >= 400) {
            this.store[E] == 0 ? this._withdraw(links, E) : this._transfer(storages, E)
        }
        else if (this.memory.overflow && terminals) {
            this.store[E] == 0 ? this._withdraw(storages, E) : this._transfer(terminals, E)
        }
    }
}

Creep.prototype._upController = function () {
    const up = this.room.controller
    if (!this.memory.upContainerId) {
        let target = up.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (s) => s.structureType == CONTAINER
        })

        this.memory.upContainerId = target.id
    }

    if (!this.memory.upLinkId) {
        let target = up.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (s) => s.structureType == LINK
        })

        this.memory.upLinkId = target.id
    }

    let containers = Game.getObjectById(this.memory.upContainerId)
    let links = Game.getObjectById(this.memory.upLinkId)
    if (links) {
        this.store[E] == 0 ? this._withdraw(links, E) : this._upgradeController(up)
    }
    else if (containers) {
        this.store[E] == 0 ? this._withdraw(containers, E) : this._upgradeController(up)
    }
}

Creep.prototype._buildStructure = function () {
    this.store[r] == 0 ? this.memory.status = false : this.memory.status = true

    if (!this.memory.storageId) {
        let target = this.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STORAGE
        })

        this.memory.storageId = target.id
    }

    let storages = Game.getObjectById(this.memory.storageId)
    let buildTarget
    if (!buildTarget) {
        buildTarget = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES)
    }

    if (storages && buildTarget) {
        this.store[E] == 0 ? this._withdraw(storages, E) : this._build(buildTarget)
    }
}

Creep.prototype._transferEnergy = function () {
    let sources = this.room.find(FIND_SOURCES)
    let controllers = this.room.controller
    if (!this.memory.storageId) {
        let target = this.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STORAGE
        })

        this.memory.storageId = target.id
    }

    if (!this.memory.container0Id || !this.memory.container1Id || !this.memory.container2Id) {
        let target0 = sources[0].pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (s) => s.structureType == CONTAINER
        })

        let target1 = sources[1].pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (s) => s.structureType == CONTAINER
        })

        let target2 = controllers.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (s) => s.structureType == CONTAINER
        })

        this.memory.container0Id = target0.id
        this.memory.container1Id = target1.id
        this.memory.container2Id = target2.id
    }

    if (!this.memory.linkId && storages) {
        let target = storages.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (s) => s.structureType == LINK
        })

        this.memory.linkId = target.id
    }

    let storages = Game.getObjectById(this.memory.storageId)
    let links = Game.getObjectById(this.memory.linkId)
    let container0 = Game.getObjectById(this.memory.container0Id)
    let container1 = Game.getObjectById(this.memory.container1Id)
    let container2 = Game.getObjectById(this.memory.container2Id)
    if (links) {
        this.store[E] == 0 ? this._withdraw(links, E) : this._transfer(storages, E)
    }
    else if (container1 && container2 && container1.store[E] >= 400) {
        this.store[E] == 0 ? this._withdraw(container1, E) : this._transfer(container2, E)
    }
    else if (container0 && container2 && container0.store[E] >= 400) {
        this.store[E] == 0 ? this._withdraw(container0, E) : this._transfer(container2, E)
    }
}


Creep.prototype._harvest = function (target, type) {
    if (this.harvest(target, type) == r) {
        this.moveTo(target)
    }
}

Creep.prototype._build = function (target) {
    if (this.build(target) == r) {
        this.moveTo(target)
    }
}

Creep.prototype._transfer = function (target, type) {
    if (this.transfer(target, type) == r) {
        this.moveTo(target)
    }
}

Creep.prototype._withdraw = function (target, type) {
    if (this.withdraw(target, type) == r) {
        this.moveTo(target)
    }
}

Creep.prototype._pickup = function (target, type) {
    if (this.pickup(target, type) == r) {
        this.moveTo(target)
    }
}

Creep.prototype._repair = function (target) {
    if (this.repair(target) == r) {
        this.moveTo(target)
    }
}

Creep.prototype._upgradeController = function (target) {
    if (this.upgradeController(target) == r) {
        this.moveTo(target)
    }
}