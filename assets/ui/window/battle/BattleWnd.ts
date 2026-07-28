
import { _decorator, Button, Label } from "cc";
import BaseWindow from "../../base/BaseWindow";
import { UILayerType } from "../../layer/UILayer";
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
const { ccclass, property } = _decorator;

@ccclass
export class BattleWnd extends BaseWindow {

    @property(Label)
    private lblGold: Label = null!;

    @property(Label)
    private lblBaseHp: Label = null!;

    @property(Label)
    private lbWaves: Label = null!;

    @property(Button)
    private btnRefresh: Button = null!;
    // 指定当前窗口层级为主界面
    windowLayer = UILayerType.MAIN_WIN;

    protected onLoad(): void {
        EventManager.getInstance().on(GameEvent.UI_GLOBAL_GOLD_CHANGE, this.onGlobalGoldChange, this);
        EventManager.getInstance().on(GameEvent.UI_GLOBAL_BASE_HP_CHANGE, this.onGlobalBaseHpChange, this);
        this.btnRefresh.node.on(Button.EventType.CLICK, this.onBtnRefreshClick, this);
    }

    public onOpen(): void {
    }

    protected onClose(): void {
        this.btnRefresh.node.off(Button.EventType.CLICK, this.onBtnRefreshClick, this);
        EventManager.getInstance().off(GameEvent.UI_GLOBAL_GOLD_CHANGE, this.onGlobalGoldChange, this);
        EventManager.getInstance().off(GameEvent.UI_GLOBAL_BASE_HP_CHANGE, this.onGlobalBaseHpChange, this);
    }

    protected onBtnRefreshClick(): void {
        EventManager.getInstance().emit(GameEvent.GAME_RESTART_LEVEL);
    }

    private onGlobalGoldChange(evt: { newValue: number }): void {
        this.lblGold.string = evt.newValue.toString();
    }

    private onGlobalBaseHpChange(evt: { newValue: number }): void {
        this.lblBaseHp.string = evt.newValue.toString();
    }

}