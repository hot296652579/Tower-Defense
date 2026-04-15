import { instantiate, Node, Prefab } from 'cc';
import { AssetManagerEx } from '../core/AssetManagerEx';

export class LevelManager {
    private currentLevel: Node | null = null;
    private currentLevelName: string = '';

    async loadLevel(levelName: string) {
        // 卸载旧关卡
        this.unloadLevel();

        const prefab = await AssetManagerEx.inst.load<Prefab>('level', levelName, Prefab);

        this.currentLevel = instantiate(prefab);
        this.currentLevelName = levelName;
    }

    unloadLevel() {
        if (this.currentLevel) {
            this.currentLevel.destroy();
            AssetManagerEx.inst.release('level', this.currentLevelName);
            this.currentLevel = null;
        }

        // 彻底释放bundle（关键）
        AssetManagerEx.inst.releaseBundle('level');
    }
}