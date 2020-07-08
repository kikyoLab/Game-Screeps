module.exports = {
    /* tower配置 */
    _run: function () {
        /* tower检测 */
        const searchTime = 10;
        let searchTower, towers, repairTargets, attackTargets;

        if (!searchTower) {
            searchTower = Game.getObjectById(Memory.E59S1.searchTower.id);
        }

        if (!towers) {
            towers = searchTower.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_TOWER && s.id !== searchTower.id
            })
        }

        if (Game.time % searchTime == 0) {
            repairTargets = searchTower.room.find(FIND_STRUCTURES, {
                filter: (s) => {
                    return (
                        s.hits < s.hitsMax * 0.6 &&
                        s.structureType !== STRUCTURE_WALL &&
                        s.structureType !== STRUCTURE_RAMPART
                    )
                }
            })

            attackTargets = searchTower.room.find(FIND_HOSTILE_CREEPS)
        }

        if (attackTargets.length > 0) {
            searchTower.attack(attackTargets[0])
            for (var i in towers) {
                towers[i].attack(attackTargets[0])
            }
        }
        else if (repairTargets.length > 0) {
            searchTower.repair(repairTargets[0])
            for (var i in towers) {
                towers[i].repair(repairTargets[0])
            }
        }
    }
}