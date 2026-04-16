import { _decorator, Component } from 'cc';
import { World } from '../ecs/core/World';

import { StateSystem } from '../ecs/systems/StateSystem';
import { WaveManager } from '../game/wave/WaveManager';

const { ccclass } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    private waveMgr = new WaveManager();

    start() {
        // ECS系统注册
        World.inst.addSystem(new StateSystem());
        // World.inst.addSystem(new PathFollowSystem());
        // World.inst.addSystem(new AttackSystem());

        // 初始化波次（path从Tiled解析）
        const path = []; // TODO PathParser.parse()
        this.waveMgr.init(path);
    }

    update(dt: number) {
        World.inst.update(dt);
        this.waveMgr.update(dt);
    }
}