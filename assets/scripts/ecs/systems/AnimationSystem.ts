import { Animation } from 'cc';
import { StateComp } from '../components/StateComp';
import { System } from '../core/System';
import { EntityState } from '../core/World';

export class AnimationSystem extends System {

    update(dt: number) {

        const entities = this.world.getEntitiesWith(StateComp);

        for (const e of entities) {

            const state = this.world.getComponent(e, StateComp);
            const node = this.world.getNode(e);

            const anim = node.getComponent(Animation);
            if (!anim) continue;

            switch (state.state) {

                case EntityState.Move:
                    this.play(anim, 'run');
                    break;

                case EntityState.Idle:
                    this.play(anim, 'idle');
                    break;

                case EntityState.Attack:
                    this.play(anim, 'attack');
                    break;
            }
        }
    }

    private play(anim: Animation, name: string) {
        if (anim.defaultClip?.name === name) return;

        anim.play(name);
    }
}