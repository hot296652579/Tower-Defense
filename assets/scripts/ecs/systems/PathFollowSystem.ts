/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2026-04-20 21:51:28
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2026-04-20 22:03:58
 * @FilePath: /Tower-Defense/assets/scripts/ecs/systems/PathFollowSystem.ts
 * @Description: 路径跟随系统
 */
import { AttackComp } from '../components/AttackComp';
import { AttributeComp } from '../components/AttributeComp';
import { MoveComp } from '../components/MoveComp';
import { PathComp } from '../components/PathComp';
import { StateComp } from '../components/StateComp';
import { System } from '../core/System';
import { EntityState } from '../core/World';

export class PathFollowSystem extends System {

    update(dt: number) {

        const entities = this.world.getEntitiesWith(AttackComp, AttributeComp)
        // console.log('entities count:', entities.length);
        for (const e of entities) {
            const state = this.world.getComponent(e, StateComp);
            if (state.state !== EntityState.Move) continue;

            const pathComp = this.world.getComponent(e, PathComp);
            const move = this.world.getComponent(e, MoveComp);
            const entityNode = this.world.getNode(e);

            // console.log("=== 怪物状态：", state.state);
            // console.log("=== 怪物速度：", move.speed);
            // console.log("=== 当前路径点 ID：", pathComp.currentId);

            const currentNode = pathComp.path.getNode(pathComp.currentId);
            if (!currentNode) {
                console.log("=== 找不到路径点！");
                continue;
            };

            const targetPos = currentNode.pos;
            const pos = entityNode.worldPosition.clone();

            const dir = targetPos.clone().subtract(pos);

            const dist = dir.length();

            // console.log("=== 距离目标：", dist);
            if (dist < 15) {
                // 到达当前点 → 跳到 next
                if (currentNode.next === null) {
                    state.changeState(EntityState.Idle);
                    continue;
                }

                pathComp.currentId = currentNode.next;
                continue;
            }

            dir.normalize();
            pos.add(dir.multiplyScalar(move.speed * dt));

            entityNode.setWorldPosition(pos);
        }
    }
}