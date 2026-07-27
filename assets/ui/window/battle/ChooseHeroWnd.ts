import { _decorator, Button, Node } from "cc";
import BaseWindow from "../../base/BaseWindow";
const { ccclass, property } = _decorator;

@ccclass
export class ChooseHeroWnd extends BaseWindow {
    @property(Button)
    private btHero0!: Button;

    @property(Button)
    private btHero1!: Button;

    @property(Button)
    private btHero2!: Button;

    // 当前选中英雄ID，默认无
    public selectHeroId: number = 0;

    protected onLoad(): void {
        this.btHero0.node.on(Node.EventType.TOUCH_END, this.onClickHero0, this);
        this.btHero1.node.on(Node.EventType.TOUCH_END, this.onClickHero1, this);
        this.btHero2.node.on(Node.EventType.TOUCH_END, this.onClickHero2, this);
    }

    protected onClose(): void {
        this.btHero0.node.off(Node.EventType.TOUCH_END, this.onClickHero0, this);
        this.btHero1.node.off(Node.EventType.TOUCH_END, this.onClickHero1, this);
        this.btHero2.node.off(Node.EventType.TOUCH_END, this.onClickHero2, this);
    }

    private onClickHero0(): void {
        this.selectHeroId = 1;
        // console.log("选中英雄ID：1 牛头战士");
    }

    private onClickHero1(): void {
        this.selectHeroId = 2;
        // console.log("选中英雄ID：2 暗影法师");
    }

    private onClickHero2(): void {
        this.selectHeroId = 3;
    }

    /** 外部BattleRoot读取选中的英雄ID */
    public getSelectHeroId(): number {
        return this.selectHeroId;
    }
}