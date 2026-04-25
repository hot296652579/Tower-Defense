import { _decorator, Component, Animation, ProgressBar, UIOpacity, Vec3, tween, Tween } from 'cc';
import { World } from '../../ecs/core/World';
import { AttributeComp } from '../../ecs/components/AttributeComp';
import { SkillData } from '../skill/SkillData';

const { ccclass, property } = _decorator;

@ccclass('BaseView')
export class BaseView extends Component {

    entity = -1;

    /** ===== 属性配置（给 ECS 用） ===== */

    @property hp = 100;
    @property hpMax = 100;

    @property attack = 10;
    @property defense = 10;

    @property magicAttack = 10;
    @property magicDefense = 10;

    @property speed = 100;

    @property attackRange = 100;
    @property attackInterval = 1;

    @property skills: SkillData[] = [];

    /** ===== 组件缓存 ===== */

    private _ani: Animation | null = null;

    hpBar: ProgressBar | null = null;

    private _isDead = false;

    onLoad() {

        this.node.on('onHurt',this.onHurt,this);
        this.node.on('onDead',this.onDead,this);

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