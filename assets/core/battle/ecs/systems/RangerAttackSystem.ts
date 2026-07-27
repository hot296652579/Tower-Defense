import EcsSystem from "../base/EcsSystem";
import TransformComp from "../components/TransformComp";
import AttackComp from "../components/AttackComp";
import RangerBulletComp from "../components/RangerBulletComp";
import CampComp from "../components/CampComp";
import HPComp from "../components/HPComp";
import HeroComp from "../components/HeroComp";
import EnemyComp from "../components/EnemyComp";

import { Vec2, math, Node } from "cc";
import { PoolManager } from "db://assets/framework/pool/PoolManager";
import { ResourceManager } from "db://assets/framework/resource/ResourceManager";
import DamageTypeComp from "../components/DamageTypeComp";
import { EntityType } from "../../data/UnitConfigType";
import { ConfigManager } from "db://assets/framework/config/ConfigManager";
import { BundlesEnum } from "db://assets/define/BundlesEnum";
import { EventManager } from "db://assets/framework/event/EventManager";
import { GameEvent } from "db://assets/framework/event/EventName";
import { EntityFsmState } from "../components/FsmStateComp";
import { BattleConfigHelper, UnitBulletConfig } from "../../data/BattleConfigHelper";
import { UILayerRoot, UILayerType } from "db://assets/ui/layer/UILayer";


interface BulletRuntimeInfo {
    attackerEid: number;
    targetEid: number;
    startWorldPos: Vec2;
    maxAttackRange: number;
    poolKey: string;
}

export default class RangerAttackSystem extends EcsSystem {
    private _poolMgr = PoolManager.getInstance();
    private _resMgr = ResourceManager.getInstance();
    private _activeBulletMap = new Map<Node, BulletRuntimeInfo>();

    public update(dt: number): void {
        this.handleRangerAttack(dt);
        this.updateAllFlyingBullets(dt);
    }

    private handleRangerAttack(dt: number) {
        const rangerEntityList = this.world.queryEntities([
            TransformComp,
            AttackComp,
            RangerBulletComp,
            CampComp,
            DamageTypeComp
        ]);

        for (const eid of rangerEntityList) {
            const trans = this.world.getComponent(eid, TransformComp);
            const atkComp = this.world.getComponent(eid, AttackComp);
            const bulletComp = this.world.getComponent(eid, RangerBulletComp);
            const campComp = this.world.getComponent(eid, CampComp);

            atkComp.atkCd -= dt;
            if (atkComp.atkCd > 0) continue;

            const targetEid = this.findEnemyTargetInRange(eid, campComp.camp, trans.pos, atkComp.atkRange);
            if (targetEid <= 0) continue;

            atkComp.atkCd = atkComp.atkInterval;
            atkComp.isAttacking = true;

            // 动态填充子弹组件战斗数据
            bulletComp.sourceEntityId = eid;
            bulletComp.targetId = targetEid;
            bulletComp.damage = atkComp.atk;

            // 调用全局配置工具读取子弹配置
            const bulletCfg: UnitBulletConfig = BattleConfigHelper.getBattleByBulletConfig(this.world, eid);
            if (!bulletCfg.bulletPath) continue;

            this.spawnBulletNode(trans.pos, targetEid, eid, atkComp.atkRange, bulletCfg.bulletPath);
        }
    }

    private findEnemyTargetInRange(attackerEid: number, selfCamp: EntityType, attackerPos: Vec2, range: number): number {
        const allTargets = this.world.queryEntities([TransformComp, HPComp, CampComp]);
        let nearestId = 0;
        let minDist = range;

        for (const targetEid of allTargets) {
            const hp = this.world.getComponent(targetEid, HPComp);
            const targetCamp = this.world.getComponent(targetEid, CampComp).camp;
            if (hp.curHp <= 0 || targetCamp === selfCamp) continue;

            const targetTrans = this.world.getComponent(targetEid, TransformComp);
            const dist = math.Vec2.distance(attackerPos, targetTrans.pos);
            if (dist < minDist) {
                minDist = dist;
                nearestId = targetEid;
            }
        }
        return nearestId;
    }

    private async spawnBulletNode(
        spawnPos: Vec2,
        targetEid: number,
        attackerEid: number,
        maxRange: number,
        poolKey: string
    ) {
        let bulletNode = this._poolMgr.spawn(poolKey);
        if (!bulletNode) {
            const prefab = await this._resMgr.loadPrefab(poolKey, BundlesEnum.Game);
            if (!prefab) return;
            this._poolMgr.registerPool(poolKey, prefab, 40);
            bulletNode = this._poolMgr.spawn(poolKey)!;
        }

        bulletNode.active = true;
        bulletNode.setWorldPosition(spawnPos.x, spawnPos.y, 0);
        bulletNode.setParent(UILayerRoot.getRootByLayer(UILayerType.SCENE_UI)!);
        const runtimeInfo: BulletRuntimeInfo = {
            attackerEid,
            targetEid,
            startWorldPos: spawnPos.clone(),
            maxAttackRange: maxRange,
            poolKey
        };
        this._activeBulletMap.set(bulletNode, runtimeInfo);
    }

    private updateAllFlyingBullets(dt: number) {
        const recycleList: Node[] = [];
        this._activeBulletMap.forEach((info, bulletNode) => {
            const bulletComp = this.world.tryGetComponent(info.attackerEid, RangerBulletComp);
            if (!bulletComp) {
                recycleList.push(bulletNode);
                return;
            }
            const targetTrans = this.world.tryGetComponent(info.targetEid, TransformComp);
            if (!targetTrans) {
                recycleList.push(bulletNode);
                return;
            }

            const dir = math.Vec2.subtract(new Vec2(), targetTrans.pos, new Vec2(bulletNode.worldPosition.x, bulletNode.worldPosition.y).clone());
            const distToTarget = dir.length();
            const moveStep = bulletComp.bulletSpeed * dt;
            const travelDist = math.Vec2.distance(info.startWorldPos, new Vec2(bulletNode.worldPosition.x, bulletNode.worldPosition.y).clone());

            if (distToTarget < moveStep || travelDist > info.maxAttackRange) {
                this.handleBulletHit(info, bulletNode, targetTrans.pos);
                recycleList.push(bulletNode);
                return;
            }

            dir.normalize();
            bulletNode.setWorldPosition(
                bulletNode.worldPosition.x + dir.x * moveStep,
                bulletNode.worldPosition.y + dir.y * moveStep,
                0
            );
            console.log("子弹移动", bulletNode.worldPosition.x, bulletNode.worldPosition.y);
        });

        for (const node of recycleList) {
            const info = this._activeBulletMap.get(node)!;
            this._poolMgr.despawn(node);
            this._activeBulletMap.delete(node);
        }
    }

    private handleBulletHit(info: BulletRuntimeInfo, bulletNode: Node, hitPos: Vec2) {
        const bulletComp = this.world.getComponent(info.attackerEid, RangerBulletComp);
        const dmgTypeComp = this.world.getComponent(info.attackerEid, DamageTypeComp);

        const bulletCfg: UnitBulletConfig = BattleConfigHelper.getBattleByBulletConfig(this.world, info.attackerEid);

        const atkComp = this.world.tryGetComponent(info.attackerEid, AttackComp);
        if (atkComp) atkComp.isAttacking = false;

        EventManager.getInstance().emit(
            GameEvent.ENTITY_ATTACK,
            info.attackerEid,
            info.targetEid,
            bulletComp.damage,
            dmgTypeComp.damageType
        );

        EventManager.getInstance().emit(
            GameEvent.ENTITY_STATE_CHANGE,
            info.attackerEid,
            EntityFsmState.ATTACK
        );

        // DOTO:后续添加EffectManager播放命中特效
        // if(bulletCfg.hitEffectPath) EffectManager.playEffect(bulletCfg.hitEffectPath, hitPos);
    }

    public clearAllBullet() {
        this._activeBulletMap.forEach((info, node) => {
            this._poolMgr.despawn(node);
        });
        this._activeBulletMap.clear();
    }
}