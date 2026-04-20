/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2026-04-20 21:51:28
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2026-04-20 22:43:30
 * @FilePath: /Tower-Defense/assets/bundles/ui/script/LoginPage.ts
 * @Description: 登录页面，点击开始游戏按钮后，关闭登录页面，加载关卡资源，并进入游戏主场景
 */
import { _decorator, Component, Node } from 'cc';
import { AssetManagerEx } from 'db://assets/scripts/core/AssetManagerEx';
import { UIManager } from 'db://assets/scripts/core/UIManager';
import { LevelManager } from 'db://assets/scripts/mgr/LevelManager';

const { ccclass, property } = _decorator;

@ccclass('LoginPage')
export class LoginPage extends Component {

    @property(Node)
    private startGameBtn: Node = null!;

    protected start(): void {
        this.startGameBtn.on(Node.EventType.TOUCH_END, this.onStartGame, this);
    }

    /** 点击开始游戏 */
    async onStartGame() {
        await UIManager.inst.closePage();
        await AssetManagerEx.inst.loadBundle('levels');
        await AssetManagerEx.inst.loadBundle('character');
        await AssetManagerEx.inst.loadBundle('tower');
        await LevelManager.inst.loadLevel('Level1');
    }
}