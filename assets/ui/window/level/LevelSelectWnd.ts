
import { _decorator, Button, director, Node } from "cc";
import { UIConfig } from "db://assets/define/UIEnum";
import BaseWindow from "../../base/BaseWindow";
import { UILayerType } from "../../layer/UILayer";
import { UIManager } from "../../manager/UIManager";
const { ccclass, property } = _decorator;

@ccclass
export class LevelSelectWnd extends BaseWindow {
    // 指定当前窗口层级为主界面
    windowLayer = UILayerType.MAIN_WIN;

    @property(Button)
    public enterGameBtn: Button = null!;

    protected onLoad(): void {
        this.enterGameBtn.node.on(Node.EventType.TOUCH_END, this.onClickEnterGame, this);
    }

    protected onOpenRefresh(): void {
        // 打开窗口刷新逻辑
        console.log("启动界面加载完成");
    }

    onClickEnterGame(): void {
        UIManager.getInstance().closeWindow(UIConfig.LevelSelectWnd.name);
        // 跳转战斗场景
        director.loadScene("scene/Battle");
    }
}