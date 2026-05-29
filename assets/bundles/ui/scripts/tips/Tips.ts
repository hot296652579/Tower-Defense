import { _decorator, Component, Label, tween, Vec3 } from 'cc';
import { UIManager } from 'db://assets/scripts/core/UIManager';
import { UIEnum } from 'db://assets/scripts/define/UIEnum';

const { ccclass, property } = _decorator;

//动画时长
const TIPS_ANIMATION_DURATION = 0.7;

@ccclass('Tips')
export class Tips extends Component {

    @property(Label)
    titleLabel: Label = null!;

    init(msg: string) {
        if (this.titleLabel) {
            this.titleLabel.string = msg;
        }

        this.moveUp();
    }

    //向上移动的tween动画 
    moveUp() {
        this.node.setPosition(Vec3.ZERO);
        tween(this.node)
            .to(TIPS_ANIMATION_DURATION, { position: new Vec3(0, 100, 0) })
            .call(() => {
                UIManager.inst.close(UIEnum.Tips);
            })
            .start();
    }
}