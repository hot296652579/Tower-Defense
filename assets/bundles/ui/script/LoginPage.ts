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
        await AssetManagerEx.inst.loadBundle('audio');
        await LevelManager.inst.loadLevel('Level1');
    }
}