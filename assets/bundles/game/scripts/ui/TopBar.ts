import { _decorator, Component, Node } from 'cc';
import { CommonUtils } from 'db://assets/scripts/core/CommonUtils';
import { LevelMgr } from 'db://assets/scripts/mgr/LevelManager';
const { ccclass, property } = _decorator;

@ccclass('TopBar')
export class TopBar extends Component {

    @property(Node) btnBack: Node = null!;
    @property(Node) btnRefresh: Node = null!;

    onLoad() {
        this.btnBack.on(Node.EventType.TOUCH_END, this.onClickBack.bind(this), this);
        this.btnRefresh.on(Node.EventType.TOUCH_END, this.onClickRefresh.bind(this), this);
    }

    protected onDisable(): void {
        this.btnBack.off(Node.EventType.TOUCH_END, this.onClickBack.bind(this), this);
        this.btnRefresh.off(Node.EventType.TOUCH_END, this.onClickRefresh.bind(this), this);
    }

    private async onClickBack() {
        CommonUtils.inst.showToast('确认退出游戏吗？', () => {
            LevelMgr.instance.backToPage('LevelSelectPage');
        });
    }

    private async onClickRefresh() {
        await LevelMgr.instance.loadLevel();
    }

}


