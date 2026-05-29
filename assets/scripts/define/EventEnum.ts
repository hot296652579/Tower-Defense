export enum EventEnum {
    ON_ENTER_TARGET_AREA = "ON_ENTER_TARGET_AREA", // 进入目标区域
    ON_EXIT_TARGET_AREA = "ON_EXIT_TARGET_AREA", // 退出目标区域
    TASK_FINISH = "TASK_FINISH", // 任务完成
    ON_ITEM_SELECTED = "ON_ITEM_SELECTED", // 选择物品

    SHOW_ITEM_ZOOM = "SHOW_ITEM_ZOOM", // 显示物品缩放
}

//热更事件
export enum HotUpdateEventEnum {
    already_up_to_date = 'already_up_to_date',               // 已是最新
    new_version_found = 'new_version_found',                 // 发现新版本
    update_progression = 'update_progression',               // 更新进度
    update_finished = 'update_finished',                     // 热更结束
    update_failed = 'update_failed',                         // 热更失败
}
