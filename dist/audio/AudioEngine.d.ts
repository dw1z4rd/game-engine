import * as THREE from 'three';
import { Logger } from '../core/Logger';
/**
 * Audio listener configuration
 */
export interface AudioListenerConfig {
    distanceModel?: 'inverse' | 'linear' | 'exponential';
    refDistance?: number;
    maxDistance?: number;
    rolloffFactor?: number;
    coneInnerAngle?: number;
    coneOuterAngle?: number;
    coneOuterGain?: number;
}
/**
 * Sound configuration
 */
export interface SoundConfig {
    loop?: boolean;
    volume?: number;
    autoplay?: boolean;
    spatial?: boolean;
    distanceModel?: AudioListenerConfig['distanceModel'];
    refDistance?: number;
    maxDistance?: number;
    rolloffFactor?: number;
}
/**
 * 3D positional audio wrapper
 */
export declare class AudioSound {
    readonly sound: any;
    readonly name: string;
    active: boolean;
    constructor(name: string, sound: any);
    /**
     * Play the sound
     */
    play(): void;
    /**
     * Pause the sound
     */
    pause(): void;
    /**
     * Stop the sound
     */
    stop(): void;
    /**
     * Set volume (0 to 1)
     */
    setVolume(volume: number): void;
    /**
     * Set loop state
     */
    setLoop(loop: boolean): void;
    /**
     * Check if the sound is playing
     */
    get isPlaying(): boolean;
    /**
     * Get current playback time
     */
    get currentTime(): number;
    /**
     * Set playback position (for spatial audio)
     */
    setPosition(position: THREE.Vector3): void;
    /**
     * Dispose of the sound
     */
    dispose(): void;
}
/**
 * Web Audio API wrapper for 3D positional audio
 */
export declare class AudioEngine {
    private readonly logger;
    private readonly config;
    private listener;
    private sounds;
    private audioContext;
    private isInitialized;
    constructor(logger: Logger, config?: AudioListenerConfig);
    /**
     * Get the Three.js audio listener
     */
    get audioListener(): THREE.AudioListener | null;
    /**
     * Get the Web Audio context
     */
    get context(): AudioContext | null;
    /**
     * Check if audio is supported
     */
    get isSupported(): boolean;
    /**
     * Initialize audio engine
     */
    initialize(): Promise<void>;
    /**
     * Load a sound from URL
     */
    loadSound(name: string, url: string, config?: SoundConfig): Promise<AudioSound>;
    /**
     * Load a sound from AudioBuffer directly
     */
    loadSoundFromBuffer(name: string, buffer: AudioBuffer, config?: SoundConfig): AudioSound;
    /**
     * Get a sound by name
     */
    getSound(name: string): AudioSound | undefined;
    /**
     * Get all sounds
     */
    getAllSounds(): AudioSound[];
    /**
     * Remove a sound
     */
    removeSound(name: string): void;
    /**
     * Set master volume for all sounds
     */
    setMasterVolume(volume: number): void;
    /**
     * Pause all sounds
     */
    pauseAll(): void;
    /**
     * Resume all sounds
     */
    resumeAll(): void;
    /**
     * Stop all sounds
     */
    stopAll(): void;
    /**
     * Mute/unmute all sounds
     */
    setMuted(muted: boolean): void;
    /**
     * Check if audio is muted
     */
    get muted(): boolean;
    /**
     * Create a simple oscillator sound (useful for testing)
     */
    createOscillator(name: string, frequency?: number, type?: OscillatorType, config?: SoundConfig): AudioSound;
    /**
     * Update audio listener position (call each frame)
     */
    update(): void;
    /**
     * Get audio context statistics
     */
    getAudioStats(): any;
    /**
     * Dispose of audio engine
     */
    dispose(): void;
}
//# sourceMappingURL=AudioEngine.d.ts.map