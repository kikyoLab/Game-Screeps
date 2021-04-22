/**
* 获取指定方向的相反方向
* @param direction 目标方向
*/
export function getOppositeDirection (direction) {
    return ((direction + 3) % 8 + 1);
}