/**
 * 生成 pixel
 * @param cpuLimit 当 bucket中的 cpu到多少时才生成 pixel
 */
export function generatePixel (cpuLimit = 7000) {
    if (Game.cpu.bucket >= cpuLimit)
        Game.cpu.generatePixel();
}