import { Asset, assetManager, AssetManager } from 'cc';

export class AssetManagerEx {
    private static _instance: AssetManagerEx;
    public static get inst() {
        if (!this._instance) this._instance = new AssetManagerEx();
        return this._instance;
    }

    private bundleMap: Map<string, AssetManager.Bundle> = new Map();
    private refMap: Map<string, number> = new Map();

    /**
     * 加载Bundle
     */
    loadBundle(name: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            if (this.bundleMap.has(name)) {
                resolve(this.bundleMap.get(name)!);
                return;
            }

            assetManager.loadBundle(name, (err, bundle) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.bundleMap.set(name, bundle);
                resolve(bundle);
            });
        });
    }

    /**
     * 加载资源
     */
    async load<T extends Asset>(bundleName: string, path: string, type?: any): Promise<T> {
        const bundle = await this.loadBundle(bundleName);

        return new Promise((resolve, reject) => {
            bundle.load(path, type, (err, asset: T) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.addRef(bundleName, path);
                resolve(asset);
            });
        });
    }

    /**
     * 增加引用
     */
    private addRef(bundle: string, path: string) {
        const key = `${bundle}/${path}`;
        const count = this.refMap.get(key) || 0;
        this.refMap.set(key, count + 1);
    }

    /**
     * 释放资源
     */
    release(bundle: string, path: string) {
        const key = `${bundle}/${path}`;
        const count = this.refMap.get(key);

        if (!count) return;

        if (count <= 1) {
            this.refMap.delete(key);
            const bundleObj = this.bundleMap.get(bundle);
            bundleObj?.release(path);
        } else {
            this.refMap.set(key, count - 1);
        }
    }

    /**
     * 释放整个Bundle（关卡用）
     */
    releaseBundle(bundle: string) {
        const bundleObj = this.bundleMap.get(bundle);
        if (!bundleObj) return;

        bundleObj.releaseAll();
        assetManager.removeBundle(bundleObj);
        this.bundleMap.delete(bundle);
    }
}