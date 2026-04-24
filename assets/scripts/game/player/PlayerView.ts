import { _decorator, Animation, Component } from 'cc';
import { StateComp } from '../../ecs/components/StateComp';
import { EntityState, World } from '../../ecs/core/World';
import { AttackType } from '../../ecs/define/AttackType';
import { AttackSystem } from '../../ecs/systems/AttackSystem';
import { SkillData } from '../skill/SkillData';

const { ccclass, property } = _decorator;

@ccclass('PlayerView')
export class PlayerView extends Component {

    @property({ displayName: '生命值' })
    hp = 100;

    @property({ displayName: '最大生命值' })
    hpMax = 100;

    @property({ displayName: '物理攻击' })
    attack = 10;
    @property({ displayName: '物理防御' })
    defense = 10;

    @property({ displayName: '魔法攻击' })
    magicAttack = 10;
    @property({ displayName: '魔法防御' })
    magicDefense = 10;

    @property({ displayName: '移动速度' })
    speed = 100;

    @property({ displayName: '攻击范围' })
    attackRange = 100;

    @property({ displayName: '攻击间隔' })
    attackInterval = 1;

    private _ani: Animation = null;

    entity = -1;

    private _isAttacking = false;

    skills: SkillData[] = [
        {
            name: "skill_0",
            description: "火球术是一种魔法攻击，对目标造成魔法伤害",
            damage: 80,
            range: 10,
            interval: 1.5,
            type: AttackType.MAGIC
        },
        {
            name: "skill_1",
            description: "挥砍是一种物理攻击，对目标造成物理伤害",
            damage: 30,
            range: 2,
            interval: 0.6,
            type: AttackType.PHYSICAL
        }
    ];

    protected onLoad(): void {
        this._ani = this.getComponent(Animation);
    }

    start() { }

    init(entity: number) {
        this.entity = entity;
    }

    playAttack() {
        if (!this._ani) return;
        if (this._isAttacking) return;

        this._ani.play('attack');
        this._isAttacking = true;
        this._ani.play('attack');
    }

    playSkill(skillName: string) {
        if (!this._ani) return;
        if (this._isAttacking) return;

        this._isAttacking = true;
        this._ani.play(skillName);

    }

    /** ================= 动画事件 ================= */

    /**普通攻击命中*/
    onAttackHit() {
        const world = World.inst;
        world.getSystem(AttackSystem).hit(this.entity);
    }

    /**技能命中*/
    onSkillHit(skillName: string) {
        const world = World.inst;
        // world.getSystem(AttackSystem).hit(this.entity, skillName);
    }

    /** ================= 动画结束 ================= */

    //DOTO cocos动画最后一帧添加事件:onAttackEnd
    onAttackEnd() {
        const world = World.inst
        const state = world.getComponent(this.entity, StateComp)

        state.changeState(EntityState.Idle)
    }
}
