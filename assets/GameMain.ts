// main.ts
import { AudioManager } from "./framework/audio/AudioManager";
import { ConfigManager } from "./framework/config/ConfigManager";
import { EventManager } from "./framework/event/EventManager";
import { PoolManager } from "./framework/pool/PoolManager";
import { ResourceManager } from "./framework/resource/ResourceManager";
import { UIManager } from "./ui/manager/UIManager";


export class GameMain {
    public async initAllFramework(): Promise<void> {
        console.log("===== 商业框架初始化开始 =====");
        await ResourceManager.getInstance().init();
        await EventManager.getInstance().init();
        await PoolManager.getInstance().init();
        await ConfigManager.getInstance().init();
        await AudioManager.getInstance().init();
        await UIManager.getInstance().init();
        console.log("===== 底层框架+UI框架初始化完成 =====");
    }
}