
import { _decorator } from "cc";
import BaseWindow from "../../base/BaseWindow";
import { UILayerType } from "../../layer/UILayer";
const { ccclass, property } = _decorator;

@ccclass
export class BattleWnd extends BaseWindow {
    // 指定当前窗口层级为主界面
    windowLayer = UILayerType.MAIN_WIN;

    protected onLoad(): void {
    }

    protected onOpenRefresh(): void {
        // 打开窗口刷新逻辑
        console.log("战斗界面加载完成");
    }


}