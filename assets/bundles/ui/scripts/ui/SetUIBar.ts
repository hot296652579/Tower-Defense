import { _decorator, Component, Node } from 'cc';
import { CommonUtils } from 'db://assets/scripts/core/CommonUtils';
const { ccclass, property } = _decorator;

@ccclass('SetUIBar')
export class SetUIBar extends Component {
    start() {
        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
    }

    private onClick() {
        CommonUtils.inst.showSetting();
    }

    update(deltaTime: number) {

    }
}


