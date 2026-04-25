import { _decorator, Component } from 'cc';
import { World } from '../ecs/core/World';

import { AnimationSystem } from '../ecs/systems/AnimationSystem';
import { AttackSystem } from '../ecs/systems/AttackSystem';
import { PathFollowSystem } from '../ecs/systems/PathFollowSystem';
import { StateSystem } from '../ecs/systems/StateSystem';
import { TargetSystem } from '../ecs/systems/TargetSystem';
import { WaveManager } from '../game/wave/WaveManager';
import { DamageSystem } from '../ecs/systems/DamageSystem';

const { ccclass } = _decorator;

export enum GameState {
    Init,
    Loading,
    Ready,
    Running,
    End
}

@ccclass('GameManager')
export class GameManager extends Component {

    static inst: GameManager;
    private waveMgr = new WaveManager();
    private gameState = GameState.Init;

    protected onLoad(): void {
        this.gameState = GameState.Init;
        GameManager.inst = this;
    }

    start() {
        // ECS系统注册
        World.inst.addSystem(new StateSystem());
        World.inst.addSystem(new PathFollowSystem());
        World.inst.addSystem(new AnimationSystem());
        World.inst.addSystem(new AttackSystem());
        World.inst.addSystem(new TargetSystem());
        World.inst.addSystem(new DamageSystem());
        // World.inst.addSystem(new SkillSystem());

    }

    update(dt: number) {
        if (this.gameState === GameState.Running) {
            World.inst.update(dt);
            this.waveMgr.update(dt);
        }
    }

    /** 进入关卡 */
    enterLevel(): void {
        this.gameState = GameState.Loading;
    }

    /**地图加载准备完成*/
    onLevelReady(): void {
        this.gameState = GameState.Ready;
        // 初始化波次
        this.waveMgr.init();
        this.gameState = GameState.Running;
    }
}