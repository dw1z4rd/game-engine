import { Engine } from '../core/Engine';
/**
 * Basic example demonstrating the game engine capabilities
 */
export declare class BasicExample {
    private readonly engine;
    private cube;
    private scene;
    private renderer;
    private input;
    private physics;
    private ecs;
    private ui;
    constructor(engine: Engine);
    /**
     * Initialize the example
     */
    initialize(): Promise<void>;
    private update;
    private setupCamera;
    private setupLighting;
    private createSceneObjects;
    private setupInput;
    private createECSEntities;
    private moveCamera;
    private jumpCube;
}
//# sourceMappingURL=BasicExample.d.ts.map