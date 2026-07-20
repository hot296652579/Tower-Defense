import { _decorator, Button, Label } from "cc";
import BaseWindow from "../../base/BaseWindow";
import { UILayerType } from "../../layer/UILayer";
import { UIManager } from "../../manager/UIManager";
const { ccclass, property } = _decorator;

export type ConfirmWindowParam = {
    msg: string;
    onConfirm: () => void;
    onCancel?: () => void;
};

@ccclass
export class ConfirmWnd extends BaseWindow {
    windowLayer = UILayerType.TOP_POPUP;

    @property(Label)
    private msgLabel: Label = null!;
    @property(Button)
    private btnConfirm: Button = null!;
    @property(Button)
    private btnCancel: Button = null!;

    private _confirmCb: () => void = null!;
    private _cancelCb?: () => void;

    protected onOpenRefresh(): void {
        const param = this._openParam as ConfirmWindowParam;
        this.msgLabel.string = param.msg;
        this._confirmCb = param.onConfirm;
        this._cancelCb = param.onCancel;
    }

    onClickConfirm() {
        this._confirmCb?.();
        UIManager.getInstance().closeWindow("ConfirmWnd");
    }

    onClickCancel() {
        this._cancelCb?.();
        UIManager.getInstance().closeWindow("ConfirmWnd");
        this.closeWindow();
    }
}