import { MoveComp } from '../components/MoveComp';
import { PathComp } from '../components/PathComp';
import { StateComp } from '../components/StateComp';
import { System } from '../core/System';
import { EntityState } from '../core/World';

export class PathFollowSystem extends System {

    update(dt: number) {

        const entities = this.world.getEntitiesWith(PathComp, MoveComp, StateComp);
        // console.log('entities count:', entities.length);
        for (const e of entities) {
            const state = this.world.getComponent(e, StateComp);
            if (state.state !== EntityState.Move) continue;

            const pathComp = this.world.getComponent(e, PathComp);
            const move = this.world.getComponent(e, MoveComp);
            const entityNode = this.world.getNode(e);

            const currentNode = pathComp.path.getNode(pathComp.currentId);
            if (!currentNode) continue;

            const targetPos = currentNode.pos;

            const pos = entityNode.worldPosition.clone();
            console.log('当前节点的世界坐标:', pos);
            const dir = targetPos.clone().subtract(pos);

            const dist = dir.length();

            if (dist < 5) {
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