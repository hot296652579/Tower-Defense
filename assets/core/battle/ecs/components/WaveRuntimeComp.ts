import { LevelConfig, SpawnGroupRuntimeData, WaveConfig, WaveState } from "../../data/LevelWaveType";
import EcsComponent from "../base/EcsComponent";

export default class WaveRuntimeComp extends EcsComponent {
    // 当前关卡完整配置
    public levelCfg: LevelConfig | null = null;
    // 当前正在运行的波次配置
    public curWaveCfg: WaveConfig | null = null;
    // 当前波次运行状态
    public waveState: WaveState = WaveState.IDLE;
    // 当前波次所有刷怪组运行时数据
    public groupRuntimeList: SpawnGroupRuntimeData[] = [];
    // 本波是否已经发放金币奖励（防止重复发）
    public waveRewardGiven: boolean = false;
}