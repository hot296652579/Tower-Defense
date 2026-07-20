// assets/ui/window/start/StartWnd.ts
import { _decorator, Button, Node } from "cc";
import BaseWindow from "../../base/BaseWindow";
import { UILayerType } from "../../layer/UILayer";
import { UIManager } from "../../manager/UIManager";
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
const { ccclass, property } = _decorator;

@ccclass
export class StartWnd extends BaseWindow {
    // 指定当前窗口层级为主界面
    windowLayer = UILayerType.MAIN_WIN;

    @property(Button)
    public enterGameBtn: Button = null!;

    protected onOpenRefresh(): void {
        // 打开窗口刷新逻辑
        console.log("启动界面加载完成");
    }

    // 进入游戏按钮点击
    onClickEnterGame(): void {
        // 关闭当前启动窗口
        UIManager.getInstance().closeWindow("StartWnd");
        EventManager.getInstance().emit(GameEvent.BATTLE_START);
    }
}