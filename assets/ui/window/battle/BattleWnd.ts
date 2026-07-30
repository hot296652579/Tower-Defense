
import { _decorator, Button, Label } from "cc";
import { WaveConfig } from "db://assets/core/battle/data/LevelWaveType";
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import BaseWindow from "../../base/BaseWindow";
import { UILayerType } from "../../layer/UILayer";
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
    @property(Button)
    private btnNextWave: Button = null!;
    // 指定当前窗口层级为主界面
    windowLayer = UILayerType.MAIN_WIN;

    protected onLoad(): void {
        EventManager.getInstance().on(GameEvent.UI_GLOBAL_GOLD_CHANGE, this.onGlobalGoldChange, this);
        EventManager.getInstance().on(GameEvent.UI_GLOBAL_BASE_HP_CHANGE, this.onGlobalBaseHpChange, this);
        EventManager.getInstance().on(GameEvent.WAVE_CHANGE, this.onWaveChange, this);
        this.btnRefresh.node.on(Button.EventType.CLICK, this.onBtnRefreshClick, this);
        this.btnNextWave.node.on(Button.EventType.CLICK, this.onBtnNextWaveClick, this);
    }

    public onOpen(): void {
    }

    protected onClose(): void {
        this.btnRefresh.node.off(Button.EventType.CLICK, this.onBtnRefreshClick, this);
        EventManager.getInstance().off(GameEvent.UI_GLOBAL_GOLD_CHANGE, this.onGlobalGoldChange, this);
        EventManager.getInstance().off(GameEvent.UI_GLOBAL_BASE_HP_CHANGE, this.onGlobalBaseHpChange, this);
        EventManager.getInstance().off(GameEvent.WAVE_CHANGE, this.onWaveChange, this);
        this.btnNextWave.node.off(Button.EventType.CLICK, this.onBtnNextWaveClick, this);
    }

    protected onBtnRefreshClick(): void {
        EventManager.getInstance().emit(GameEvent.GAME_RESTART_LEVEL);
    }

    private onBtnNextWaveClick(): void {
        EventManager.getInstance().emit(GameEvent.WAVE_START);
    }

    private onGlobalGoldChange(evt: { newValue: number }): void {
        this.lblGold.string = evt.newValue.toString();
    }

    private onGlobalBaseHpChange(evt: { newValue: number }): void {
        this.lblBaseHp.string = evt.newValue.toString();
    }

    /** curDisplay: 当前波显示序号(1-based)，total: 总波数 */
    private onWaveChange(waveCfg: WaveConfig | null, curDisplay: number, total: number): void {
        if (!this.lbWaves) return;
        if (!waveCfg) {
            this.lbWaves.string = `波次 0/${total}`;
            return;
        }
        this.lbWaves.string = `波次 ${curDisplay}/${total}`;
    }

}
