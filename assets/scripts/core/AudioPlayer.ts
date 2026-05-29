import { AudioClip, AudioSource } from "cc";
import { AssetManagerEx } from "./AssetManagerEx";

/**
 * 音频播放
 */
export default class AudioPlayer {

    private _musicSource: AudioSource = null;
    private _effectSources: Map<string, AudioSource> = new Map();

    private _masterVolume: number = 1.0;
    public get masterVolume(): number { return this._masterVolume; }

    private _musicVolume: number = 1.0;
    public get musicVolume(): number { return this._musicVolume; }

    private _effectVolume: number = 1.0;
    public get effectVolume(): number { return this._effectVolume; }

    private _vibrationVolume: number = 1.0;
    public get vibrationVolume(): number { return this._vibrationVolume; }

    private _tempEffectVolume: number;

    private static _instance: AudioPlayer;
    public static get instance(): AudioPlayer {
        if (!AudioPlayer._instance) {
            AudioPlayer._instance = new AudioPlayer();
        }
        return AudioPlayer._instance;
    }

    private constructor() { }

    // 资源管理器实例
    private get _assetMgr() {
        return AssetManagerEx.inst;
    }

    /**
     * 设置主音量
     * @param value 音量值（0.0 ~ 1.0）
     */
    public setMasterVolume(value: number): void {
        if (value < 0.0) value = 0.0;
        else if (value > 1.0) value = 1.0;
        this._masterVolume = value;
        this.setMusicVolume(this._musicVolume);
        this.setEffectVolume(this._effectVolume);
    }

    /**
     * 设置音乐音量
     * @param value 音量值（0.0 ~ 1.0）
     */
    public setMusicVolume(value: number): void {
        if (value < 0.0) value = 0.0;
        else if (value > 1.0) value = 1.0;
        this._musicVolume = value;
        let realVolume = this._masterVolume * value;
        if (this._musicSource) {
            this._musicSource.volume = realVolume;
        }
    }

    /**
     * 设置特效音量
     * @param value 音量值（0.0 ~ 1.0）
     */
    public setEffectVolume(value: number): void {
        if (value < 0.0) value = 0.0;
        else if (value > 1.0) value = 1.0;
        this._effectVolume = this._masterVolume * value;
    }

    /**
     * 震动
     * @param value 震动值（0.0 ~ 1.0）
     */
    public setVibrationVolume(value: number): void {
        if (value < 0.0) value = 0.0;
        else if (value > 1.0) value = 1.0;
        this._vibrationVolume = value;
    }

    // ====================== playMusic ======================
    /**
     * 播放音乐
     * @param path 音频路径
     * @param bundleName bundle 名称
     */
    public async playMusic(bundleName: string, path: string): Promise<void> {
        try {
            const clip = await this._assetMgr.load<AudioClip>(bundleName, path, AudioClip);

            if (!this._musicSource) {
                this._musicSource = new AudioSource();
            }

            this._musicSource.stop();
            this._musicSource.clip = clip;
            this._musicSource.loop = true;
            this._musicSource.volume = this._masterVolume * this._musicVolume;
            this._musicSource.play();
        } catch (err) {
            console.warn("播放音乐失败:", err);
        }
    }

    // ======================playEffect ======================
    /**
     * 播放音效
     * @param path 音频路径
     * @param bundleName bundle 名称
     * @param checkPlaying 是否检查正在播放
     * @param loop 是否循环
     */
    public async playEffect(
        bundleName: string,
        path: string,
        checkPlaying: boolean = true,
        loop: boolean = false
    ): Promise<void> {
        // 防重复播放
        if (checkPlaying && this._effectSources.has(path) && this._effectSources.get(path)!.playing) {
            return;
        }

        try {
            // 加载音效
            const clip = await this._assetMgr.load<AudioClip>(bundleName, path, AudioClip);

            let source = this._effectSources.get(path);
            if (!source) {
                source = new AudioSource();
                source.clip = clip;
                source.loop = loop;
                this._effectSources.set(path, source);
            }

            // 设置音量
            source.volume = this._masterVolume * this._effectVolume;
            source.play();
        } catch (err) {
            console.warn("播放音效失败:", err);
        }
    }

    /** 停止音乐 */
    public stopMusic(): void {
        this._musicSource?.stop();
    }

    /** 暂停音乐 */
    public pauseMusic(): void {
        this._musicSource?.pause();
    }

    /** 恢复音乐 */
    public recoverMusic(): void {
        this._musicSource?.play();
    }

    /** 停止单个音效 */
    public stopEffect(path: string): void {
        const source = this._effectSources.get(path);
        if (source) {
            source.stop();
            this._effectSources.delete(path);
        }
    }

    /** 静音 */
    public mute(): void {
        this._tempEffectVolume = this._effectVolume;
        this.setMasterVolume(0);
    }

    /** 取消静音 */
    public cancelMute(): void {
        this._effectVolume = this._tempEffectVolume ?? this._effectVolume;
        this.setMasterVolume(1);
    }

    /** 更新所有音效音量 */
    private _updateVolume(): void {
        const vol = this._masterVolume * this._effectVolume;
        this._effectSources.forEach(source => {
            source.volume = vol;
        });
    }
}