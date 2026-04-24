import { _decorator, Component, Animation, ProgressBar } from 'cc';
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

    onLoad() {

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

}