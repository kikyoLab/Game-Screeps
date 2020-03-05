const E49S16Harvester2 = {
  /** @param {Creep} creep **/
  run: function (creep) {
    var sources = creep.room.find(FIND_SOURCES);
    if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[1], { visualizePathStyle: { stroke: '#ffaa00' } });
    }

  }
}

module.exports = E49S16Harvester2;