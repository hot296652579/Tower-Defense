//解决互相依赖问题
import { Component } from 'cc';

export interface IGameLoading {
    onProgressUpdate(finished: number, total: number): void;
}

/**桥接类*/
export const GameLoading = Component as unknown as {
    new(): IGameLoading & Component;
    readonly name: string;
};