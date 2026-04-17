import { MoveComp } from '../components/MoveComp';
import { PathComp } from '../components/PathComp';
import { StateComp } from '../components/StateComp';
import { System } from '../core/System';
import { EntityState } from '../core/World';

export class PathFollowSystem extends System {

    update(dt: number) {

        const entities = this.world.getEntitiesWith(PathComp, MoveComp, StateComp);

        for (const e of entities) {

            const state = this.world.getComponent(e, StateComp);
            if (state.state !== EntityState.Move) continue;

            const pathComp = this.world.getComponent(e, PathComp);
            const move = this.world.getComponent(e, MoveComp);
            const node = this.world.getNode(e);

            const currentNode = pathComp.path.getNode(pathComp.currentId);
            if (!currentNode) continue;

            const targetPos = currentNode.pos;

            const pos = node.worldPosition.clone();
            const dir = targetPos.subtract(pos);

            const dist = dir.length();

            if (dist < 5) {
                // 到达当前点 → 跳到 next
                if (currentNode.next === null) {
                    state.changeState(EntityState.Idle);
                    continue;
                }

                pathComp.currentId = currentNode.next;
                return;
            }

            dir.normalize();
            pos.add(dir.multiplyScalar(move.speed * dt));

            node.setWorldPosition(pos);
        }
    }
}