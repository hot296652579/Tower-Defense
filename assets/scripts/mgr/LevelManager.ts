import { instantiate, Node } from "cc";
import { AssetManagerEx } from "../core/AssetManagerEx";
import { GameRoot } from "../core/GameRoot";

class LevelManager {

    private currentLevel: Node | null = null;
    private currentLevelName: string = '';

    async loadLevel(levelName: string) {

        await this.unloadLevel();

        await AssetManagerEx.inst.loadBundle('levels');

        const prefab = await AssetManagerEx.inst.load<any>(
            'levels',
            `prefab/${levelName}`
        );

        this.currentLevel = instantiate(prefab);
        this.currentLevelName = levelName;

        GameRoot.inst.sceneLayer.addChild(this.currentLevel);
    }

    async unloadLevel() {

        if (this.currentLevel) {
            this.currentLevel.destroy();
            this.currentLevel = null;
        }

        AssetManagerEx.inst.releaseBundle('levels');
    }
}