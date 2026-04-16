import { PathNode } from "./PathNode";

export class PathData {

    nodes: Map<number, PathNode> = new Map();

    startId: number = 0;

    getNode(id: number): PathNode | undefined {
        return this.nodes.get(id);
    }
}


