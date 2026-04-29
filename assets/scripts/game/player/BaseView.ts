import { _decorator, Animation, Component, ProgressBar, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { AttributeComp } from '../../ecs/components/AttributeComp';
import { World } from '../../ecs/core/World';

const { ccclass, property } = _decorator;

@ccclass('BaseView')
export class BaseView extends Component {

    entity = -1;

    /** ===== 属性配置（给 ECS 用） ===== */

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

    @property({ displayName: '受击冷却 单位：秒' })
    hurtCooldown = 0.5;

    /** ===== 组件缓存 ===== */
    private _ani: Animation | null = null;

    hpBar: ProgressBar | null = null;

    private _isDead = false;

    onLoad() {

        this.node.on('onHurt', this.onHurt, this);
        this.node.on('onDead', this.onDead, this);

        this._ani = this.node
            .getChildByName("ani")
            ?.getComponent(Animation) || null;

        this.hpBar = this.node.getChildByName('hpProgress').getComponent(ProgressBar)!;

        if (this.hpBar) {
            this.hpBar.node.active = false;
        }
    }

    init(entity: number) {
        this.entity = entity;
        this.node["entityId"] = entity; //给 ECS 用
    }

    /** ===== 受伤显示 ===== */

    onHurt(damage: number) {

        if (this.hpBar) {

            this.hpBar.node.active = true;

            const attr = World.inst.getComponent(this.entity, AttributeComp);

            if (attr) {
                this.hpBar.progress = attr.hp / attr.maxHp;
            }
        }

    }

    onDead() {
        if (this._isDead) return;
        this._isDead = true;
        this.enabled = false;

        Tween.stopAllByTarget(this.node);

        let opacity = this.node.getComponent(UIOpacity);
        if (!opacity) {
            opacity = this.node.addComponent(UIOpacity);
        }

        const startPos = this.node.position.clone();
        const endPos = startPos.clone().add(new Vec3(0, -50, 0));

        tween(this.node)
            .parallel(
                // 下沉
                tween().to(0.5, {
                    position: endPos
                }),
                // 淡出
                tween(opacity).to(0.5, {
                    opacity: 0
                })
            )
            .call(() => {
                World.inst.removeEntity(this.entity);
            })
            .start();
    }

}