import { _decorator, Component, Node, Toggle } from 'cc';
import AudioPlayer from 'db://assets/scripts/core/AudioPlayer';
import { storage } from 'db://assets/scripts/core/Storage';
import { UIManager } from 'db://assets/scripts/core/UIManager';
import { AudioEnum } from 'db://assets/scripts/define/AudioEnum';
import { BundlesEnum } from 'db://assets/scripts/define/BundlesEnum';
import { UIEnum } from 'db://assets/scripts/define/UIEnum';

const { ccclass, property } = _decorator;

@ccclass('Setting')
export class Setting extends Component {

    @property(Toggle)
    toggleSound: Toggle = null!;

    @property(Toggle)
    toggleMusic: Toggle = null!;

    @property(Node)
    btnClose: Node = null!;

    // 存储键名
    private readonly KEY_SOUND = 'sound_enable';
    private readonly KEY_MUSIC = 'music_enable';

    protected onLoad(): void {
        this.btnClose.on(Node.EventType.TOUCH_END, this.onClickClose, this);

        this.toggleSound.node.on('toggle', this.onToggleSound, this);
        this.toggleMusic.node.on('toggle', this.onToggleMusic, this);

        // 启动时加载本地存储的配置
        this.loadVolumeConfig();
    }

    // 加载本地音量配置
    private loadVolumeConfig() {
        // 默认：开启
        const soundEnable = storage.getItem(this.KEY_SOUND, true);
        const musicEnable = storage.getItem(this.KEY_MUSIC, true);

        this.toggleSound.isChecked = soundEnable;
        this.toggleMusic.isChecked = musicEnable;

        AudioPlayer.instance.setEffectVolume(soundEnable ? 1 : 0);
        AudioPlayer.instance.setMusicVolume(musicEnable ? 1 : 0);
    }

    private onToggleSound(toggle: Toggle): void {
        const enable = toggle.isChecked;
        storage.setItem(this.KEY_SOUND, enable);
        AudioPlayer.instance.setEffectVolume(enable ? 1.0 : 0.0);
    }

    private onToggleMusic(toggle: Toggle): void {
        const enable = toggle.isChecked;
        storage.setItem(this.KEY_MUSIC, enable);
        AudioPlayer.instance.setMusicVolume(enable ? 1.0 : 0.0);
        if (enable) {
            AudioPlayer.instance.playMusic(BundlesEnum.Audio, AudioEnum.BGM);
        } else {
            AudioPlayer.instance.stopMusic();
        }
    }

    private onClickClose(): void {
        UIManager.inst.close(UIEnum.Setting);
    }
}