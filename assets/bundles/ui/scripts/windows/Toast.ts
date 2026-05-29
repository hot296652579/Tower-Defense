import { _decorator, Component, Label, Node } from 'cc';
import { UIManager } from 'db://assets/scripts/core/UIManager';
import { UIEnum } from 'db://assets/scripts/define/UIEnum';

const { ccclass, property } = _decorator;

@ccclass('Toast')
export class Toast extends Component {

    @property(Node)
    btnCancel: Node = null!;

    @property(Node)
    btnSure: Node = null!;

    @property(Label)
    titleLabel: Label = null!;

    private confirmCallback: () => void = null!;

    protected start(): void {
        this.btnCancel.on(Node.EventType.TOUCH_END, this.onClickCancel, this);
        this.btnSure.on(Node.EventType.TOUCH_END, this.onClickSure, this);
    }

    /**
     * 初始化窗口：显示文字 + 绑定确认回调
     * @param msg 提示文字
     * @param confirmCb 确认按钮回调
     */
    init(msg: string, confirmCb: () => void) {
        this.confirmCallback = confirmCb;

        // 设置提示文本
        if (this.titleLabel) {
            this.titleLabel.string = msg;
        }
    }

    private onClickCancel() {
        UIManager.inst.close(UIEnum.Toast);
    }

    private onClickSure() {
        this.confirmCallback?.();
        UIManager.inst.close(UIEnum.Toast);
    }
}