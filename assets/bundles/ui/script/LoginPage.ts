import { _decorator, Component, instantiate, Node } from 'cc';
import { AssetManagerEx } from 'db://assets/scripts/core/AssetManagerEx';
import { GameRoot } from 'db://assets/scripts/core/GameRoot';
import { UIManager } from 'db://assets/scripts/core/UIManager';

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
        const levelPrefab = await AssetManagerEx.inst.load<any>(
            'levels',
            'prefab/Level1'
        );

        const levelNode = instantiate(levelPrefab);
        GameRoot.inst.sceneLayer.addChild(levelNode);
    }
}