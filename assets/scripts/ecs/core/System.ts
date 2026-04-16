import { World } from "./World";

export abstract class System {
    world!: World;
    abstract update(dt: number): void;
}