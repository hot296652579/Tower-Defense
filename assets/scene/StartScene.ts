import { _decorator, Component } from 'cc';
import { BundlesEnum } from '../define/BundlesEnum';
import { UIEnum } from '../define/UIEnum';
import { GameMain } from '../GameMain';
import { UILayerRoot } from '../ui/layer/UILayer';
import { UIManager } from '../ui/manager/UIManager';
const { ccclass, property } = _decorator;

@ccclass('StartScene')
export class StartScene extends Component {
    async start() {
        //全局初始化
        const gameMain = new GameMain();
        await gameMain.initAllFramework();

        UILayerRoot.initRoot(this.node);
        const uiMgr = UIManager.getInstance();

        // 1. 业务界面
        uiMgr.registerWindow("StartWnd", UIEnum.StartWnd, false, BundlesEnum.UI);
        uiMgr.registerWindow("LevelSelectWnd", UIEnum.LevelSelectWnd, true, BundlesEnum.UI);
        uiMgr.registerWindow("SettingWnd", UIEnum.SettingWnd, true, BundlesEnum.UI);
        uiMgr.registerWindow("BattleWnd", UIEnum.BattleWnd, true, BundlesEnum.UI);

        // 2. 通用弹窗
        uiMgr.registerWindow("TipWnd", UIEnum.TipWnd, true, BundlesEnum.UI);
        uiMgr.registerWindow("ConfirmWnd", UIEnum.ConfirmWnd, true, BundlesEnum.UI);

        // 默认打开启动页
        await uiMgr.openWindow("StartWnd");
    }
}


