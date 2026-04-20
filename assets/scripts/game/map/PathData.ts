import { PathNode } from "./PathNode";

export class PathData {
    nodes: Map<number, PathNode> = new Map();
    startId: number = -1;
    endId: number = -1;

    getNode(id: number): PathNode | null {
        return this.nodes.get(id) ?? null;
    }
}