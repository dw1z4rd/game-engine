import * as THREE from 'three';
import { InputManager } from '../../input/InputManager';
/**
 * First-person camera controller
 */
export declare class FPSCamera {
    readonly camera: THREE.PerspectiveCamera;
    enabled: boolean;
    private movementSpeed;
    private mouseSensitivity;
    private readonly euler;
    private moveForward;
    private moveBackward;
    private moveLeft;
    private moveRight;
    private moveUp;
    private moveDown;
    constructor(domElement: HTMLElement, input: InputManager);
    private setupInput;
    private updateMouseLook;
    update(deltaTime: number): void;
    dispose(): void;
}
//# sourceMappingURL=FPSCamera.d.ts.map