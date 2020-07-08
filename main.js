const labCtrl = require('labCtrl')

module.exports.loop = function () {
    if (!Memory.roomConfig || Game.time % 1000 == 0) require('roomConfig').run()


    require('prototype.Creep.move')
    require('creep.prototype')
    require('stateScanner').stateScanner()



    require('pcConfig').work()
    require('tower').run()
    require('room').run()
    require('task').basicEnergyTask()
    require('creep').CreepConfig._run()

    labCtrl.run('E49S15', RESOURCE_GHODIUM, 2000)
}