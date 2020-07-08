module.exports = {
    _run: function () {
        for (var i in Game.creeps) {
            var creep = Game.creeps[i]
            switch (creep.memory.roleName) {
                case 'roleUpgrader':
                    creep._upController()
                    break;
                case 'roleFiller':
                    creep._fillEnergy()
                    break;
                case 'roleBuilder':
                    creep._buildStructure()
                    break;
                case 'roleHarvest':
                    creep._getEnergy()
                    break;
                case 'roleTransfer':
                    creep._transferEnergy()
            }
        }

        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    },
}