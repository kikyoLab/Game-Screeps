/**
 * Hash Map 中子元素对象的 work方法
 * @param hashMap 游戏对象的 hash map如 Game.creeps、Game.spawns等
 * @param showCpu [可选] 传入指定字符串来启动该 Map 的数量统计
 */
export function doing (...hashMaps) {
    hashMaps.forEach((obj, index) => {
        let startCost = Game.cpu.getUsed();
        /* 遍历执行 work */
        Object.values(obj).forEach(item => {
            if (item.work)
                item.work();
        });
        /* 如果有需求的话就显示 cpu 消耗 */
        if (Memory.showCost)
            log(`消耗 ${Game.cpu.getUsed() - startCost}`, [`[${index}]`]);
    });
}