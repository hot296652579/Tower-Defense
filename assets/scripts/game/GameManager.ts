import { _decorator, Component } from 'cc';
import { World } from '../ecs/core/World';

import { AnimationSystem } from '../ecs/systems/AnimationSystem';
import { PathFollowSystem } from '../ecs/systems/PathFollowSystem';
import { StateSystem } from '../ecs/systems/StateSystem';
import { WaveManager } from '../game/wave/WaveManager';

const { ccclass } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    private waveMgr = new WaveManager();

    start() {
        // ECS系统注册
        World.inst.addSystem(new StateSystem());
        World.inst.addSystem(new PathFollowSystem());
        World.inst.addSystem(new AnimationSystem());
        // World.inst.addSystem(new AttackSystem());

        this.waveMgr.init();
    }

    update(dt: number) {
        World.inst.update(dt);
        this.waveMgr.update(dt);
    }
}