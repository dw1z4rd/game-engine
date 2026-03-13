import * as THREE from 'three';
import { InputManager } from '../../input/InputManager';

/**
 * First-person camera controller
 */
export class FPSCamera {
  public readonly camera: THREE.PerspectiveCamera;
  public enabled = true;
  
  private movementSpeed = 5;
  private mouseSensitivity = 0.002;
  private readonly euler = new THREE.Euler(0, 0, 0, 'YXZ');
  
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private moveUp = false;
  private moveDown = false;

  constructor(domElement: HTMLElement, input: InputManager) {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 2, 5);

    this.setupInput(domElement, input);
  }

  private setupInput(domElement: HTMLElement, input: InputManager): void {
    // Mouse look
    input.registerAction({
      name: 'mouse_look',
      type: 'mouse',
      inputs: ['button0'],
      callback: () => {
        if (input.isCursorLocked()) {
          this.updateMouseLook(input.mouseState.deltaX, input.mouseState.deltaY);
        }
      }
    });

    // Movement keys
    input.registerAction({
      name: 'forward',
      type: 'keyboard',
      inputs: ['KeyW'],
      callback: () => this.moveForward = true
    });

    input.registerAction({
      name: 'backward',
      type: 'keyboard',
      inputs: ['KeyS'],
      callback: () => this.moveBackward = true
    });

    input.registerAction({
      name: 'left',
      type: 'keyboard',
      inputs: ['KeyA'],
      callback: () => this.moveLeft = true
    });

    input.registerAction({
      name: 'right',
      type: 'keyboard',
      inputs: ['KeyD'],
      callback: () => this.moveRight = true
    });

    input.registerAction({
      name: 'up',
      type: 'keyboard',
      inputs: ['Space'],
      callback: () => this.moveUp = true
    });

    input.registerAction({
      name: 'down',
      type: 'keyboard',
      inputs: ['ShiftLeft'],
      callback: () => this.moveDown = true
    });

    // Release movement
    ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space', 'ShiftLeft'].forEach(key => {
      document.addEventListener('keyup', (e) => {
        if (e.code === key) {
          switch (key) {
            case 'KeyW': this.moveForward = false; break;
            case 'KeyS': this.moveBackward = false; break;
            case 'KeyA': this.moveLeft = false; break;
            case 'KeyD': this.moveRight = false; break;
            case 'Space': this.moveUp = false; break;
            case 'ShiftLeft': this.moveDown = false; break;
          }
        }
      });
    });
  }

  private updateMouseLook(deltaX: number, deltaY: number): void {
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= deltaX * this.mouseSensitivity;
    this.euler.x -= deltaY * this.mouseSensitivity;
    this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);
  }

  update(deltaTime: number): void {
    if (!this.enabled) return;

    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();

    // Calculate movement direction
    direction.z = Number(this.moveForward) - Number(this.moveBackward);
    direction.x = Number(this.moveRight) - Number(this.moveLeft);
    direction.y = Number(this.moveUp) - Number(this.moveDown);
    direction.normalize();

    // Apply camera rotation to horizontal movement
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(this.camera.quaternion);
    right.y = 0;
    right.normalize();

    velocity.x = (-direction.z * forward.x + direction.x * right.x) * this.movementSpeed;
    velocity.y = direction.y * this.movementSpeed;
    velocity.z = (-direction.z * forward.z + direction.x * right.z) * this.movementSpeed;

    this.camera.position.addScaledVector(velocity, deltaTime);
  }

  dispose(): void {
    // Clean up event listeners
  }
}