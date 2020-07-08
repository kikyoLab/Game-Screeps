import { setBodyParts, getAvaliableSpawn } from 'utils'

module.exports = {
    /* tower配置 */
    run: function () {
        const searchInterval = 10
        let myRooms = Memory.roomConfig.myRomm
        for (var i in myRooms) {
            /* tower检测 */
            let searchTower = Game.getObjectById(Memory.roomConfig[myRooms[i]].searchTower.id)
            let towers

            if (!towers) {
                towers = Game.rooms[myRooms[i]].find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_TOWER && s.id !== searchTower.id
                })
            }

            if (Game.time % searchInterval == 0) {
                let hostiles = searchTower.room.find(FIND_HOSTILE_CREEPS, {
                    filter: (s) => !s.body.boost
                })

                let boostHostile = searchTower.room.find(FIND_HOSTILE_CREEPS, {
                    filter: (s) => s.body.boost
                })

                if (boostHostile && boostHostile.length >= 4) {
                    /* 四人小队 启动 war */
                    Memory.roomConfig[myRooms[i]].war = true
                }

                if (boostHostile && boostHostile.length >= 2 && boostHostile.length < 4) {
                    /* 两人小队 search 牵制 heal towers 集火 attack */
                    let healBoost = boostHostile.filter(x => x.body.getActiveBodyparts(HEAL) !== 0)
                    let attackBoost = boostHostile.filter(x => x.body.getActiveBodyparts(HEAL) == 0)
                    towers.attack(attackBoost[0])
                    searchTower.attack(healBoost[0])
                }

                if (boostHostile && boostHostile.length < 2) {
                    towers.attack(boostHostile[0])
                    searchTower.attack(boostHostile[0])
                }

                if (hostiles && hostiles.length > 0) {
                    towers.attack(hostiles[0])
                    searchTower.attack(hostiles[0])
                }

                if (!hostiles && !boostHostile) {
                    let ramparts = searchTower.room.find(FIND_STRUCTURES, {
                        filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hitx <= 1000000
                    })

                    if (ramparts) {
                        towers.repair(ramparts[0])
                    }
                }
            }
        }

        /* war模式  主动防御 */
        if (Memory.roomConfig[myRooms[i]].war) {
            /* tower全部修墙 */
            let ramparts = Game.rooms[myRooms[i]].find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hitx <= 1000000
            })

            if (ramparts) {
                towers.repair(ramparts[0])
            }
            /* 生产 builder修墙 */
            let spawns = getAvaliableSpawn(myRooms[i])
            let bodys = setBodyParts(Game.rooms[myRooms[i]].controller.level).builderBody
            let name = `${myRooms[i]} + 维修姬 + ${Math.random(0, 999)} + 号`;
            spawns.spawnCreep(bodys, name, {
                memory: { roleName: roleBuilder, warStatus: true }
            })
        }
    }
}
