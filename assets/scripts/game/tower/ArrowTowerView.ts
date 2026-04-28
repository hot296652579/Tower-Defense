import { _decorator, Animation } from "cc";
import { TowerView } from "./TowerView";

const { ccclass, property } = _decorator;

@ccclass('ArrowTowerView')
export class ArrowTowerView extends TowerView {

    anim: Animation = null!;

    onLoad() {
        this.anim = this.node.getChildByName('Avatar').getComponent(Animation);
    }

    arrowAttack() {
        this.playAttackAnim();
    }

    private playAttackAnim() {
        this.anim?.play('attack');
    }
}