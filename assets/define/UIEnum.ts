export interface UIInfo {
    /** UI名称 */
    name: string;
    /** 预制体路径 */
    path: string;
    /** Bundle名称 */
    bundle: string;
    /** 是否缓存 */
    cache?: boolean;
    /** 是否允许重复打开 */
    multiple?: boolean;
    /** 是否模态窗口 */
    modal?: boolean;
}
export const UIConfig = {

    /** 开始界面 */
    StartWnd: {
        name: "StartWnd",
        path: "prefab/start/StartWnd",
        bundle: "ui",
        cache: true,
    },

    /** 关卡选择 */
    LevelSelectWnd: {
        name: "LevelSelectWnd",
        path: "prefab/level/LevelSelectWnd",
        bundle: "ui",
        cache: true,
    },

    /** 设置 */
    SettingWnd: {
        name: "SettingWnd",
        path: "prefab/setting/SettingWnd",
        bundle: "ui",
        modal: true,
        cache: false,
    },

    /** 战斗 */
    BattleWnd: {
        name: "BattleWnd",
        path: "prefab/battle/BattleWnd",
        bundle: "ui",
        cache: true,
    },

    /** 英雄选择*/
    ChooseHeroWnd: {
        name: "ChooseHeroWnd",
        path: "prefab/battle/ChooseHeroWnd",
        bundle: "ui",
        cache: true,
    },

    /** Tip */
    TipWnd: {
        name: "TipWnd",
        path: "prefab/common/TipWnd",
        bundle: "ui",
        multiple: true,
        cache: false,
    },

    /** Confirm */
    ConfirmWnd: {
        name: "ConfirmWnd",
        path: "prefab/common/ConfirmWnd",
        bundle: "ui",
        modal: true,
        cache: false,
    }

} satisfies Record<string, UIInfo>;