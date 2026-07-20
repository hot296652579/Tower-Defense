export class CommonUtil {
    /** 随机整数 [min,max] */
    public static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /** 延迟等待 */
    public static waitTime(sec: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, sec * 1000));
    }

    /** 深拷贝简单对象 */
    public static deepCopy<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj)) as T;
    }

    /** 数组随机打乱 */
    public static shuffleArray<T>(arr: T[]): T[] {
        const list = [...arr];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }
}