
import { find } from "cc";
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import BattleRoot from "../../BattleRoot";
import MapPathData from "../../map/MapPathData";
import EcsSystem from "../base/EcsSystem";
import AttackComp from "../components/AttackComp";
import EnemyComp from "../components/EnemyComp";
import FsmStateComp, { EntityFsmState } from "../components/FsmStateComp";
import HPComp from "../components/HPComp";
import MoveComp from "../components/MoveComp";
import TransformComp from "../components/TransformComp";

export default class MoveSystem extends EcsSystem {
    private _mapPathData!: MapPathData;

    public init(): void {
        const battleRoot = find('Canvas/BattleRootNode').getComponent(BattleRoot)!;
        this._mapPathData = battleRoot.getMapPathData();
    }

    public update(dt: number): void {
        // 查询 同时拥有 Transform + Move + Fsm + Enemy 的实体（所有怪物）
        const entities = this.world.queryEntities([TransformComp, MoveComp, FsmStateComp, EnemyComp]);

        for (const eid of entities) {
            const trans = this.world.getComponent(eid, TransformComp);
            const move = this.world.getComponent(eid, MoveComp);
            const fsm = this.world.getComponent(eid, FsmStateComp);

            // 每帧先清零，仅在本帧真正位移时置 true
            move.isMoving = false;

            // 死亡/受伤/攻击状态不沿路径移动
            if (fsm.state === EntityFsmState.DEAD
                || fsm.state === EntityFsmState.HURT
                || fsm.state === EntityFsmState.ATTACK) {
                continue;
            }

            // 已锁定射程内存活目标时停步交战，避免攻击系统停步后又被路径移动覆盖
            const attack = this.world.tryGetComponent(eid, AttackComp);
            if (attack && attack.targetEntityId !== 0) {
                const targetId = attack.targetEntityId;
                const targetHp = this.world.tryGetComponent(targetId, HPComp);
                const targetTrans = this.world.tryGetComponent(targetId, TransformComp);
                if (targetHp && targetTrans && targetHp.curHp > 0) {
                    const dx = targetTrans.pos.x - trans.pos.x;
                    const dy = targetTrans.pos.y - trans.pos.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= attack.atkRange) {
                        continue;
                    }
                }
            }

            const pathPoints = this._mapPathData.getPathPoints(move.pathId);
            if (!pathPoints || pathPoints.length <= 0) continue;

            // 当前目标点位
            const targetPoint = pathPoints[move.pathIndex];
            const currentPos = trans.pos;

            const dirX = targetPoint.x - currentPos.x;
            const dirY = targetPoint.y - currentPos.y;
            const distSq = dirX * dirX + dirY * dirY;

            // 速度 = 基础速度 * 减速倍率 * 帧间隔
            const speed = move.moveSpeed * move.slowRate * dt;

            if (distSq < speed * speed) {
                // 到达当前点，切换下一个路径点
                move.pathIndex++;
                // 路径走到终点：到达基地，怪物移除（后续逻辑放到DamageSystem）
                if (move.pathIndex >= pathPoints.length) {
                    // 到达终点，怪物进攻基地，销毁实体
                    this.world.destroyEntity(eid);
                    EventManager.getInstance().emit(GameEvent.ENTITY_DESTROY, eid);
                    continue;
                }
                // 真正移动 标记
                move.isMoving = true;
            } else {
                // 归一化方向向量，移动
                const dist = Math.sqrt(distSq);
                const nx = dirX / dist;
                const ny = dirY / dist;
                trans.pos.x += nx * speed;
                trans.pos.y += ny * speed;
                // 设置朝向
                trans.faceDir = nx >= 0 ? 1 : -1;
                move.isMoving = true;
            }
        }
    }
}