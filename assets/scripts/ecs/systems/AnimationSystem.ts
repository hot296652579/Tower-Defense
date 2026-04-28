import { Animation } from 'cc';
import { CampComp } from '../components/CampComp';
import { SkillComp } from '../components/SkillComp';
import { StateComp } from '../components/StateComp';
import { System } from '../core/System';
import { EntityState } from '../core/World';

export class AnimationSystem extends System {

    update(dt: number) {

        const entities = this.world.getEntitiesWith(StateComp, CampComp);

        for (const e of entities) {

            const stateComp = this.world.getComponent(e, StateComp)!;

            // 没变化不处理
            if (stateComp.state === stateComp.prevState) continue;
            // console.log('状态变化 当前状态:', stateComp.state, '上一个状态:', stateComp.prevState);
            const node = this.world.getNode(e);
            // console.log('node:', node);

            const anim = node.getChildByName('ani').getComponent(Animation);
            if (!anim) continue;

            switch (stateComp.state) {

                case EntityState.Move:
                    this.play(anim, 'run');
                    break;

                case EntityState.Idle:
                    this.play(anim, 'idle');
                    break;

                case EntityState.Attack:
                    this.play(anim, 'attack');
                    break;

                case EntityState.Skill:
                    const skillComp = this.world.getComponent(e, SkillComp)!
                    // this.play(anim, skillComp.currentSkill)
                    break;

                case EntityState.Dead:
                    break;
            }

            stateComp.prevState = stateComp.state;
        }
    }

    private play(anim: Animation, name: string) {

        const state = anim.getState(name);
        if (!state) {
            console.warn("动画不存在:", name);
            return;
        }

        anim.play(name);
    }
}