import { _decorator, Animation, Node } from "cc";
import BaseComponent from "../../../framework/base/BaseComponent";
import { EventManager } from "../../../framework/event/EventManager";
import { GameEvent } from "../../../framework/event/EventName";
import { EntityFsmState } from "../ecs/components/FsmStateComp";
const { ccclass } = _decorator;

@ccclass
export class FsmAnimMachine extends BaseComponent {

    private _animComp: Animation | null = null;
    public entityId: number = 0;
    private _isListenEvent: boolean = false;

    protected onLoad(): void {
        const spriteNode: Node | null = this.node.getChildByName("Sprite");
        if (!spriteNode) {
            console.error(`FsmAnimMachine：节点${this.node.name}下未找到Sprite子节点`);
            return;
        }
        this._animComp = spriteNode.getComponent(Animation);
        if (!this._animComp) {
            console.error(`FsmAnimMachine：Sprite节点缺少Animation组件`);
            return;
        }

        if (!this._isListenEvent) {
            // 重点改动：传入自身entityId，EventManager会自动补发缓存事件
            EventManager.getInstance().on(
                GameEvent.ENTITY_STATE_CHANGE,
                this.onEntityStateChange,
                this
            );
            this._isListenEvent = true;
        }
    }

    // 对象池取出节点自动重置为待机动画
    protected onEnable(): void {
        if (this._animComp) {
            this.playAnim("idle");
        }
    }

    /** 接收实体状态变更事件，切换对应动画 */
    public onEntityStateChange(targetEntityId: number, newState: EntityFsmState): void {
        if (targetEntityId !== this.entityId || !this._animComp) return;

        console.log(`FsmAnimMachine：实体${this.entityId} 状态切换为:${newState}`);
        switch (newState) {
            case EntityFsmState.IDLE:
                this.playAnim("idle");
                break;
            case EntityFsmState.WALK:
                this.playAnim("walk");
                break;
            case EntityFsmState.HURT:
                this.playAnim("hurt");
                break;
            case EntityFsmState.ATTACK:
                this.playAnim("attack");
                break;
            case EntityFsmState.DEAD:
                this.playAnim("dead");
                break;
        }
    }

    /** 播放指定动画片段 */
    private playAnim(clipName: string): void {
        if (!this._animComp) return;
        if (!this._animComp.getState(clipName)) {
            console.warn(`FsmAnimMachine：缺失动画片段 ${clipName}`);
            return;
        }
        this._animComp.play(clipName);
    }
}