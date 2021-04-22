/* 全局喊话 */
export function globalSay (words) {
    if (!Memory.sayIndex)
        Memory.sayIndex = 0;
    Object.values(Game.creeps).forEach(creep => creep.say(words[Memory.sayIndex], true));
    Memory.sayIndex = Memory.sayIndex + 1 >= words.length ? 0 : Memory.sayIndex + 1;
}