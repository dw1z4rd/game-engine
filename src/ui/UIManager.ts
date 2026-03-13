import { Logger } from '../core/Logger';

/**
 * UI element types
 */
export enum UIElementType {
  TEXT = 'text',
  BUTTON = 'button',
  IMAGE = 'image',
  PANEL = 'panel',
  PROGRESS_BAR = 'progress_bar',
  INPUT_FIELD = 'input_field',
  CHECKBOX = 'checkbox',
  SLIDER = 'slider',
}

/**
 * UI element configuration
 */
export interface UIElementConfig {
  id: string;
  type: UIElementType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  visible?: boolean;
  interactive?: boolean;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  onClick?: () => void;
  onHover?: () => void;
  onUpdate?: (deltaTime: number) => void;
}

/**
 * UI element class
 */
export class UIElement {
  public readonly id: string;
  public readonly type: UIElementType;
  public element: HTMLElement;
  public visible = true;
  public interactive = true;

  constructor(config: UIElementConfig) {
    this.id = config.id;
    this.type = config.type;
    this.element = this.createElement(config);
    this.visible = config.visible ?? true;
    this.interactive = config.interactive ?? true;

    this.setupEvents(config);
  }

  private createElement(config: UIElementConfig): HTMLElement {
    let element: HTMLElement;

    switch (config.type) {
      case UIElementType.TEXT:
        element = document.createElement('div');
        element.textContent = config.text || '';
        break;
        
      case UIElementType.BUTTON:
        element = document.createElement('button');
        element.textContent = config.text || '';
        break;
        
      case UIElementType.IMAGE:
        element = document.createElement('img');
        break;
        
      case UIElementType.PANEL:
        element = document.createElement('div');
        break;
        
      case UIElementType.PROGRESS_BAR:
        element = document.createElement('div');
        element.innerHTML = `
          <div style="width: 100%; height: 100%; background: rgba(255,255,255,0.2); border: 1px solid white;">
            <div style="width: 0%; height: 100%; background: #00ff00; transition: width 0.3s;"></div>
          </div>
        `;
        break;
        
      case UIElementType.INPUT_FIELD:
        element = document.createElement('input');
        (element as HTMLInputElement).type = 'text';
        break;
        
      case UIElementType.CHECKBOX:
        element = document.createElement('input');
        (element as HTMLInputElement).type = 'checkbox';
        break;
        
      case UIElementType.SLIDER:
        element = document.createElement('input');
        (element as HTMLInputElement).type = 'range';
        break;
        
      default:
        element = document.createElement('div');
    }

    // Set position and size
    if (config.x !== undefined) element.style.position = 'absolute';
    if (config.x !== undefined) element.style.left = `${config.x}px`;
    if (config.y !== undefined) element.style.top = `${config.y}px`;
    if (config.width !== undefined) element.style.width = `${config.width}px`;
    if (config.height !== undefined) element.style.height = `${config.height}px`;

    // Apply custom styles
    if (config.style) {
      Object.assign(element.style, config.style);
    }

    // Set ID
    element.id = config.id;

    return element;
  }

  private setupEvents(config: UIElementConfig): void {
    if (config.onClick) {
      this.element.addEventListener('click', config.onClick);
    }

    if (config.onHover) {
      this.element.addEventListener('mouseenter', config.onHover);
    }
  }

  /**
   * Update element position
   */
  setPosition(x: number, y: number): void {
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  /**
   * Update element size
   */
  setSize(width: number, height: number): void {
    this.element.style.width = `${width}px`;
    this.element.style.height = `${height}px`;
  }

  /**
   * Update text content
   */
  setText(text: string): void {
    if (this.type === UIElementType.TEXT || this.type === UIElementType.BUTTON) {
      this.element.textContent = text;
    }
  }

  /**
   * Update progress bar value (0-1)
   */
  setProgress(value: number): void {
    if (this.type === UIElementType.PROGRESS_BAR) {
    const progressBar = this.element.querySelector('div > div') as HTMLElement;
    if (progressBar) {
      progressBar.style.width = `${value * 100}%`;
    }
    }
  }

  /**
   * Show element
   */
  show(): void {
    this.element.style.display = 'block';
    this.visible = true;
  }

  /**
   * Hide element
   */
  hide(): void {
    this.element.style.display = 'none';
    this.visible = false;
  }

  /**
   * Remove element
   */
  remove(): void {
    this.element.remove();
  }
}

/**
 * UI Manager for HUD and interface elements
 */
export class UIManager {
  private readonly logger: Logger;
  private readonly container: HTMLElement;
  private elements = new Map<string, UIElement>();
  private screens = new Map<string, UIElement[]>();
  private activeScreen: string | null = null;

  constructor(logger: Logger) {
    this.logger = logger;
    
    // Create UI container
    this.container = document.createElement('div');
    this.container.id = 'ui-container';
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.pointerEvents = 'none';
    this.container.style.zIndex = '1000';
    
    document.body.appendChild(this.container);
    
    this.logger.debug('UI Manager initialized');
  }

  /**
   * Create a UI element
   */
  createElement(config: UIElementConfig): UIElement {
    const element = new UIElement(config);
    
    this.elements.set(config.id, element);
    this.container.appendChild(element.element as HTMLElement);
    
    // Set pointer events for interactive elements
    if (element.interactive) {
      (element.element as HTMLElement).style.pointerEvents = 'auto';
    }
    
    this.logger.debug(`UI element created: ${config.id}`);
    return element;
  }

  /**
   * Get a UI element by ID
   */
  getElement(id: string): UIElement | undefined {
    return this.elements.get(id);
  }

  /**
   * Remove a UI element
   */
  removeElement(id: string): void {
    const element = this.elements.get(id);
    if (element) {
      element.remove();
      this.elements.delete(id);
      this.logger.debug(`UI element removed: ${id}`);
    }
  }

  /**
   * Create a screen (collection of UI elements)
   */
  createScreen(name: string, elements: UIElement[]): void {
    this.screens.set(name, elements);
    
    // Hide all elements initially
    elements.forEach(element => element.hide());
    
    this.logger.debug(`UI screen created: ${name}`);
  }

  /**
   * Show a screen
   */
  showScreen(name: string): void {
    // Hide current screen
    if (this.activeScreen) {
      const currentScreen = this.screens.get(this.activeScreen);
      if (currentScreen) {
        currentScreen.forEach(element => element.hide());
      }
    }

    // Show new screen
    const screen = this.screens.get(name);
    if (screen) {
      screen.forEach(element => element.show());
      this.activeScreen = name;
      this.logger.debug(`UI screen shown: ${name}`);
    }
  }

  /**
   * Hide current screen
   */
  hideScreen(): void {
    if (this.activeScreen) {
      const screen = this.screens.get(this.activeScreen);
      if (screen) {
        screen.forEach(element => element.hide());
      }
      this.activeScreen = null;
    }
  }

  /**
   * Create HUD elements
   */
  createHUD(): void {
    // FPS counter
    this.createElement({
      id: 'fps-counter',
      type: UIElementType.TEXT,
      x: 10,
      y: 10,
      text: 'FPS: 60',
      style: {
        color: 'white',
        fontSize: '16px',
        fontFamily: 'monospace',
        textShadow: '1px 1px 2px black',
        pointerEvents: 'none',
      },
    });

    // Health bar
    this.createElement({
      id: 'health-bar',
      type: UIElementType.PROGRESS_BAR,
      x: 10,
      y: 40,
      width: 200,
      height: 20,
      style: {
        pointerEvents: 'none',
      },
    });

    // Crosshair
    this.createElement({
      id: 'crosshair',
      type: UIElementType.TEXT,
      x: window.innerWidth / 2 - 10,
      y: window.innerHeight / 2 - 10,
      text: '+',
      style: {
        color: 'white',
        fontSize: '20px',
        fontFamily: 'monospace',
        textShadow: '1px 1px 2px black',
        pointerEvents: 'none',
      },
    });

    this.logger.debug('HUD created');
  }

  /**
   * Update HUD elements
   */
  updateHUD(fps: number, health = 1): void {
    const fpsCounter = this.getElement('fps-counter');
    if (fpsCounter) {
      fpsCounter.setText(`FPS: ${Math.round(fps)}`);
    }

    const healthBar = this.getElement('health-bar');
    if (healthBar) {
      healthBar.setProgress(health);
    }

    // Update crosshair position
    const crosshair = this.getElement('crosshair');
    if (crosshair) {
      crosshair.setPosition(window.innerWidth / 2 - 10, window.innerHeight / 2 - 10);
    }
  }

  /**
   * Show notification
   */
  showNotification(message: string, duration = 3000): void {
    const notification = this.createElement({
      id: `notification_${Date.now()}`,
      type: UIElementType.TEXT,
      x: window.innerWidth / 2 - 150,
      y: 100,
      text: message,
      style: {
        color: 'white',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '10px 20px',
        borderRadius: '5px',
        pointerEvents: 'none',
      },
    });

    // Auto-remove after duration
    setTimeout(() => {
      this.removeElement(notification.id);
    }, duration);
  }

  /**
   * Create menu
   */
  createMenu(title: string, options: Array<{ text: string; action: () => void }>): void {
    const menuPanel = this.createElement({
      id: 'menu-panel',
      type: UIElementType.PANEL,
      x: window.innerWidth / 2 - 150,
      y: window.innerHeight / 2 - 200,
      width: 300,
      height: 400,
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid white',
        borderRadius: '10px',
        padding: '20px',
        pointerEvents: 'auto',
      },
    });

    // Add title
    this.createElement({
      id: 'menu-title',
      type: UIElementType.TEXT,
      x: window.innerWidth / 2 - 100,
      y: window.innerHeight / 2 - 180,
      text: title,
      style: {
        color: 'white',
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        pointerEvents: 'none',
      },
    });

    // Add menu buttons
    options.forEach((option, index) => {
      this.createElement({
        id: `menu_option_${index}`,
        type: UIElementType.BUTTON,
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 120 + index * 50,
        width: 200,
        height: 40,
        text: option.text,
        style: {
          backgroundColor: '#444',
          color: 'white',
          border: '1px solid white',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer',
        },
        onClick: option.action,
      });
    });
  }

  /**
   * Update all UI elements
   */
  update(deltaTime: number): void {
    for (const element of this.elements.values()) {
      if (element.visible && (element as any).onUpdate) {
        (element as any).onUpdate(deltaTime);
      }
    }
  }

  /**
   * Handle window resize
   */
  handleResize(): void {
    // Update responsive elements
    const crosshair = this.getElement('crosshair');
    if (crosshair) {
      crosshair.setPosition(window.innerWidth / 2 - 10, window.innerHeight / 2 - 10);
    }
  }

  /**
   * Clear all UI elements
   */
  clear(): void {
    for (const element of this.elements.values()) {
      element.remove();
    }
    this.elements.clear();
    this.screens.clear();
    this.activeScreen = null;
    
    this.logger.debug('UI cleared');
  }

  /**
   * Dispose of UI manager
   */
  dispose(): void {
    this.clear();
    this.container.remove();
    this.logger.debug('UI Manager disposed');
  }
}