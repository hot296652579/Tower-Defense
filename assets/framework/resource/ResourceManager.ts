import { _decorator, Asset, AssetManager, resources, Prefab, SpriteFrame, AudioClip, JsonAsset, assetManager } from 'cc';
import BaseSingleton from '../base/BaseSingleton';

type AssetType = typeof Asset;
interface CacheInfo {
    /**资源*/
    asset: Asset;
    /**所属Bundle(resources也是Bundle)*/
    bundle: AssetManager.Bundle;
    /**资源路径*/
    path: string;
    /**资源类型*/
    type: typeof Asset;
    /**引用计数*/
    refCount: number;
}

export class ResourceManager extends BaseSingleton {
    private _assetCache = new Map<string, CacheInfo>();
    private _bundleMap: Map<string, AssetManager.Bundle> = new Map();

    public async init(): Promise<void> {
        this._assetCache.clear();
        this._bundleMap.clear();
    }

    public destroy(): void {
        this.releaseAll();
        this._bundleMap.clear();
    }

    //#region 分包加载
    public async loadBundle(bundleName: string): Promise<AssetManager.Bundle | null> {
        return new Promise((resolve) => {
            if (this._bundleMap.has(bundleName)) {
                resolve(this._bundleMap.get(bundleName)!);
                return;
            }
            assetManager.loadBundle(bundleName, (err, bundle) => {
                if (err) {
                    console.error("load bundle fail:", bundleName, err);
                    resolve(null);
                    return;
                }
                this._bundleMap.set(bundleName, bundle);
                resolve(bundle);
            });
        });
    }
    //#endregion

    //#region 通用加载
    public async load<T extends Asset>(
        path: string,
        assetType: typeof Asset,
        bundleName?: string
    ): Promise<T | null> {

        const key = bundleName ? `${bundleName}/${path}` : path;

        // 已缓存
        const cache = this._assetCache.get(key);

        if (cache) {

            cache.refCount++;

            return cache.asset as T;
        }

        // 获取Bundle
        const bundle = bundleName ? await this.loadBundle(bundleName) : resources;

        if (!bundle) return null;

        // 加载
        return new Promise(resolve => {

            bundle.load(path, assetType, (err, asset: T) => {

                if (err) {

                    console.error(err);

                    resolve(null);

                    return;
                }

                this._assetCache.set(key, { asset, bundle, path, type: assetType, refCount: 1, });
                resolve(asset);

            });

        });

    }
    //#endregion

    // 快捷加载常用资源
    public loadPrefab(path: string, bundle?: string): Promise<Prefab | null> {
        return this.load(path, Prefab, bundle);
    }

    public loadSpriteFrame(path: string, bundle?: string): Promise<SpriteFrame | null> {
        return this.load(path, SpriteFrame, bundle);
    }

    public loadAudioClip(path: string, bundle?: string): Promise<AudioClip | null> {
        return this.load(path, AudioClip, bundle);
    }

    public loadJson(path: string, bundle?: string): Promise<JsonAsset | null> {
        return this.load(path, JsonAsset, bundle);
    }

    //#region 资源释放
    public release(path: string, bundleName?: string): void {

        const key = bundleName ? `${bundleName}/${path}` : path;
        const cache = this._assetCache.get(key);

        if (!cache) return;

        cache.refCount--;

        if (cache.refCount > 0) {
            return;
        }

        cache.bundle.release(cache.path, cache.type);

        this._assetCache.delete(key);

    }

    public releaseAll() {
        for (const cache of this._assetCache.values()) {
            cache.bundle.release(cache.path, cache.type);
        }

        this._assetCache.clear();

    }
    //#endregion
}