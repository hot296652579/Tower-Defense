import { _decorator, Component, Node } from 'cc';
import AudioPlayer from 'db://assets/scripts/core/AudioPlayer';
import { storage } from 'db://assets/scripts/core/Storage'; // 引入存储
import { UILayer, UIManager } from 'db://assets/scripts/core/UIManager';
import { AudioEnum } from 'db://assets/scripts/define/AudioEnum';
import { BundlesEnum } from 'db://assets/scripts/define/BundlesEnum';
import { UIEnum } from 'db://assets/scripts/define/UIEnum';

const { ccclass, property } = _decorator;

@ccclass('HomePage')
export class HomePage extends Component {
    @property({ type: Node }) btns: Node[] = [];

    private readonly KEY_MUSIC = 'music_enable';

    protected onLoad(): void {
        const musicEnable = storage.getItem(this.KEY_MUSIC, true);

        if (musicEnable) {
            AudioPlayer.instance.playMusic(BundlesEnum.Audio, AudioEnum.BGM);
        }
    }

    protected start(): void {
        this.btns.forEach((btn, index) => {
            btn.on(Node.EventType.TOUCH_END, this.onClickBtn.bind(this, index), this);
        });
    }

    private async onClickBtn(index: number) {
        await UIManager.inst.open(UIEnum.LevelSelectPage, UILayer.Page);
    }
}