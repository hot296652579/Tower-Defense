export class CombatDebug {

    static enable = true;

    static log(...args: any[]) {
        if (!this.enable) return;
        console.log(...args);
    }

    static attack(eid: number, msg: string, data?: any) {
        if (!this.enable) return;
        console.log(`[攻击][${eid}] ${msg}`, data ?? "");
    }

    static target(eid: number, msg: string, data?: any) {
        if (!this.enable) return;
        console.log(`[目标][${eid}] ${msg}`, data ?? "");
    }

    static state(eid: number, msg: string) {
        if (!this.enable) return;
        console.log(`[状态][${eid}] ${msg}`);
    }
}