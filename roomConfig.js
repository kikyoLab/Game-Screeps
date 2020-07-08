module.exports = {
    run: function () {
        !Memory.roomConfig ? Memory.roomConfig = {} : console.log('roomConfig is Already')

        !Memory.roomConfig.myRooms ?
            Memory.roomConfig.myRooms = ['E48S16', 'E49S16', 'E49S15', 'E49S14', 'E48S14', 'E47S14'] :
            console.log('myRooms ok')

        let myRooms = Memory.roomConfig.myRooms

        for (var names of myRooms) {
            !Memory.roomConfig.names ? Memory.roomConfig.names = {} : console.log('roomnames is Already')

            !Memory.roomConfig.names.source0 ?
                { id: Game.rooms[names].find(FIND_SOURCES)[0].id } : console.log('source0 is Already')

            !Memory.roomConfig.names.source1 ?
                { id: Game.rooms[names].find(FIND_SOURCES)[1].id } : console.log('source1 is Already')

            if (!Memory.roomConfig.names.mineral) {
                let target = Game.rooms[names].find(FIND_MINERALS)[0]
                if (target) {
                    Memory.roomConfig.names.mineral = {
                        id: target.id,
                        type: target.mineralType
                    }
                } else {
                    console.log('Minerals is not find')
                }
            }

            !Memory.roomConfig.names.controller ?
                { id: Game.rooms[names].controller.id } : console.log('controller is Already')

            if (!Memory.roomConfig.names.factory) {
                let target = Game.rooms[names].find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_FACTORY
                })[0]

                if (target) {
                    Memory.roomConfig.names.factory = {
                        id: target.id
                    }
                } else {
                    console.log('Factory is not find')
                }
            }
            console.log('factory is Already')

            if (!Memory.roomConfig.names.storage) {
                let target = Game.rooms[names].find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_STORAGE
                })[0]

                if (target) {
                    Memory.roomConfig.names.storage = {
                        id: target.id
                    }
                } else {
                    console.log('Storage is not find')
                }
            }
            console.log('storage is Already')

            if (!Memory.roomConfig.names.terminal) {
                let target = Game.rooms[names].find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_TERMINAL
                })[0]

                if (target) {
                    Memory.roomConfig.names.terminal = {
                        id: target.id
                    }
                } else {
                    console.log('Terminal is not find')
                }
            }
            console.log('terminal is Already')

            if (!Memory.roomConfig.names.nuker) {
                let target = Game.rooms[names].find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_NUKER
                })[0]

                if (target) {
                    Memory.roomConfig.names.nuker = {
                        id: target.id
                    }
                } else {
                    console.log('Nuker id not find')
                }
            }
            console.log('nuker is Already')

            if (!Memory.roomConfig.names.powerSpawn) {
                let target = Game.rooms[names].find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_POWER_SPAWN
                })[0]

                if (target) {
                    Memory.roomConfig.names.powerSpawn = {
                        id: target.id
                    }
                } else {
                    console.log('PowerSpawn is not find')
                }
            }
            console.log('powerSpawn is Already')

            if (!Memory.roomConfig.names.observer) {
                let target = Game.rooms[names].find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_OBSERVER
                })[0]

                if (target) {
                    Memory.roomConfig.names.observer = {
                        id: target.id
                    }
                } else {
                    console.log('Observer is not find')
                }
            }
            console.log('observer is Already')


            if (!Memory.roomConfig.names.centerLink) {
                let storages

                if (Game.rooms[names].storage) {
                    storages = Game.getObjectById(Game.rooms[names].storage.id)
                }

                let target = storages.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_LINK
                })

                if (target) {
                    Memory.roomConfig.names.centerLink = {
                        id: target.id
                    }
                } else {
                    console.log('CenterLink is not find')
                }
            }
            console.log('centerLink is Already')

            if (!Memory.roomConfig.names.controllerLink) {
                let controllers = Game.rooms[names].controller
                let target = controllers.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_LINK
                })

                if (target) {
                    Memory.roomConfig.names.controllerLink = {
                        id: target.id
                    }
                } else {
                    console.log('ControllerLink is not find')
                }
            }
            console.log('controllerLink is Already')

            if (!Memory.roomConfig.names.spawnList) {
                Memory.roomConfig.names.spawnList = {
                    harvester: { count: 0 },
                    filler: { count: 0 },
                    upgrader: { count: 0 },
                    builder: { count: 0 },
                    transfer: { count: 0 },
                    centerFiller: { count: 0 },
                    repair: { count: 0 }
                }
            }
            console.log('spawnList is Already')

            if (!Memory.roomConfig.names.searchTower) {
                let target = Game.rooms[names].find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_TOWER
                })[0]

                if (target) {
                    Memory.roomConfig.names.searchTower = {
                        id: target.id
                    }
                } else {
                    console.log('Tower is not find')
                }
            }
            console.log('searchTower is Already')

            if (!Memory.roomConfig.names.powerBank) {
                Memory.roomConfig.names.powerBank = {
                    roomnames: '', id: '', status: false,
                    count: {
                        attacker: 0,
                        healer: 0,
                        transfer: 0
                    },
                    run: {
                        attack: false,
                        heal: false,
                        transfer: false,
                        ready: false
                    }
                }
            }
            console.log('powerBank is Already')

            if (!Memory.roomConfig.names.deposit) {
                Memory.roomConfig.names.deposit = {
                    roomnames: '',
                    id: '',
                    type: '',
                    status: false
                }
            }
            console.log('deposit is Already')

            !Memory.roomConfig.names.war ?
                Memory.roomConfig.names.war = false : console.log('war is Already')

            !Memory.roomConfig.names.fastRepair ?
                Memory.roomConfig.names.fastRepair = false : console.log('fastRepair is Already')
        }

    }
}


