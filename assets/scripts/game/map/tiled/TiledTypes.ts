/** Tiled 地图属性类型 
 * @param name 属性名
 * @param type 属性类型
 * @param value 属性值
*/
export interface TiledProperty {
    name: string;
    type?: string;
    value: string | number | boolean;
}

/** Tiled 地图对象类型 
 * @param id 对象ID
 * @param x 对象X坐标
 * @param y 对象Y坐标
 * @param width 对象宽度
 * @param height 对象高度
 * @param rotation 对象旋转角度
 * @param visible 对象是否可见
 * @param properties 对象属性
*/
export interface TiledObject {
    id: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
    visible?: boolean;
    properties?: TiledProperty[];
}

/** Tiled 地图对象组类型 
 * @param name 对象组名
 * @param objects 对象组中的对象
*/
export interface TiledObjectGroup {
    name: string;
    getObjects(): TiledObject[];
}

/** Tiled 地图图层类型 
 * @param name 图层名
 * @param visible 图层是否可见
*/
export interface TiledLayer {
    name: string;
    visible: boolean;
}


/**
 * Tiled 地图属性类型 
 * @param name 属性名
 * @param value 属性值
*/
export type TiledProp = {
    name: string;
    value: string | number | boolean;
};