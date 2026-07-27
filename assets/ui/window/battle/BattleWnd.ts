
import { _decorator, Button } from "cc";
import BaseWindow from "../../base/BaseWindow";
import { UILayerType } from "../../layer/UILayer";
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
const { ccclass, property } = _decorator;

@ccclass
export class BattleWnd extends BaseWindow {

    @property(Button)
    private btnRefresh: Button = null!;
    // 指定当前窗口层级为主界面
    windowLayer = UILayerType.MAIN_WIN;

    protected onLoad(): void {
        this.btnRefresh.node.on(Button.EventType.CLICK, this.onBtnRefreshClick, this);
    }

    public onOpen(): void {
    }

    protected onClose(): void {
        this.btnRefresh.node.off(Button.EventType.CLICK, this.onBtnRefreshClick, this);
    }

    protected onBtnRefreshClick(): void {
        EventManager.getInstance().emit(GameEvent.GAME_RESTART_LEVEL);
    }


}