import { StateComp } from '../components/StateComp';
import { System } from '../core/System';
import { EntityState } from '../core/World';

export class StateSystem extends System {

    update(dt: number) {

        const entities = this.world.getEntitiesWith(StateComp);

        for (const e of entities) {

            const state = this.world.getComponent(e, StateComp);

            switch (state.state) {

                case EntityState.Idle:
                    break;

                case EntityState.Move:
                    break;

                case EntityState.Attack:
                    // 交给 AttackSystem
                    break;

                case EntityState.Skill:
                    break;

                case EntityState.Dead:
                    break;
            }
        }
    }
}