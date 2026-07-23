import { _decorator, Component } from 'cc';
import { BundlesEnum } from '../define/BundlesEnum';
import { UIConfig } from '../define/UIEnum';
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
        uiMgr.registerWindow(UIConfig.StartWnd.name, UIConfig.StartWnd.path, false, BundlesEnum.UI);
        uiMgr.registerWindow(UIConfig.LevelSelectWnd.name, UIConfig.LevelSelectWnd.path, true, BundlesEnum.UI);
        uiMgr.registerWindow(UIConfig.SettingWnd.name, UIConfig.SettingWnd.path, true, BundlesEnum.UI);
        uiMgr.registerWindow(UIConfig.BattleWnd.name, UIConfig.BattleWnd.path, true, BundlesEnum.UI);
        uiMgr.registerWindow(UIConfig.ChooseHeroWnd.name, UIConfig.ChooseHeroWnd.path, true, BundlesEnum.UI);

        // 2. 通用弹窗
        uiMgr.registerWindow(UIConfig.TipWnd.name, UIConfig.TipWnd.path, true, BundlesEnum.UI);
        uiMgr.registerWindow(UIConfig.ConfirmWnd.name, UIConfig.ConfirmWnd.path, true, BundlesEnum.UI);

        // 默认打开启动页
        await uiMgr.openWindow(UIConfig.StartWnd.name);
    }
}


