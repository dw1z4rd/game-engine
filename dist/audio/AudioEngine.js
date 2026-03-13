import * as THREE from 'three';
/**
 * 3D positional audio wrapper
 */
export class AudioSound {
    constructor(name, sound) {
        this.active = true;
        this.name = name;
        this.sound = sound;
    }
    /**
     * Play the sound
     */
    play() {
        if (this.active) {
            this.sound.play();
        }
    }
    /**
     * Pause the sound
     */
    pause() {
        this.sound.pause();
    }
    /**
     * Stop the sound
     */
    stop() {
        this.sound.stop();
    }
    /**
     * Set volume (0 to 1)
     */
    setVolume(volume) {
        this.sound.setVolume(Math.max(0, Math.min(1, volume)));
    }
    /**
     * Set loop state
     */
    setLoop(loop) {
        this.sound.setLoop(loop);
    }
    /**
     * Check if the sound is playing
     */
    get isPlaying() {
        return this.sound.isPlaying;
    }
    /**
     * Get current playback time
     */
    get currentTime() {
        return this.sound.context?.currentTime || 0;
    }
    /**
     * Set playback position (for spatial audio)
     */
    setPosition(position) {
        if (this.sound instanceof THREE.PositionalAudio) {
            this.sound.position.copy(position);
        }
    }
    /**
     * Dispose of the sound
     */
    dispose() {
        this.sound.stop();
        this.sound.disconnect();
        this.active = false;
    }
}
/**
 * Web Audio API wrapper for 3D positional audio
 */
export class AudioEngine {
    constructor(logger, config = {}) {
        this.listener = null;
        this.sounds = new Map();
        this.audioContext = null;
        this.isInitialized = false;
        this.logger = logger;
        this.config = {
            distanceModel: 'inverse',
            refDistance: 1,
            maxDistance: 10000,
            rolloffFactor: 1,
            coneInnerAngle: 360,
            coneOuterAngle: 360,
            coneOuterGain: 0,
            ...config,
        };
    }
    /**
     * Get the Three.js audio listener
     */
    get audioListener() {
        return this.listener;
    }
    /**
     * Get the Web Audio context
     */
    get context() {
        return this.audioContext;
    }
    /**
     * Check if audio is supported
     */
    get isSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
    /**
     * Initialize audio engine
     */
    async initialize() {
        if (this.isInitialized) {
            this.logger.warn('Audio engine already initialized');
            return;
        }
        if (!this.isSupported) {
            this.logger.warn('Web Audio API not supported');
            return;
        }
        try {
            // Create audio context
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
            // Create Three.js audio listener
            this.listener = new THREE.AudioListener();
            // Note: context is now read-only in newer Three.js versions
            // The listener is automatically connected to the audio context
            // Configure listener properties directly on the AudioListener
            // In newer Three.js versions, these properties are on the listener itself
            const listenerContext = this.listener.context || this.audioContext;
            if (listenerContext) {
                // Set up audio context properties if needed
            }
            // Handle suspended audio context (required by some browsers)
            // Don't wait for resume here - it requires user interaction
            if (this.audioContext.state === 'suspended') {
                this.logger.warn('Audio context is suspended - will resume after user interaction');
                // Don't block initialization - audio will work after user clicks/interacts
            }
            this.isInitialized = true;
            this.logger.info('Audio engine initialized');
            this.logger.debug(`Audio context state: ${this.audioContext.state}`);
        }
        catch (error) {
            this.logger.error('Failed to initialize audio engine:', error);
            throw error;
        }
    }
    /**
     * Resume audio context (call after user interaction)
     */
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                this.logger.info('Audio context resumed');
            }
            catch (error) {
                this.logger.error('Failed to resume audio context:', error);
            }
        }
    }
    /**
     * Load a sound from URL
     */
    async loadSound(name, url, config = {}) {
        if (!this.isInitialized || !this.listener) {
            throw new Error('Audio engine not initialized');
        }
        if (this.sounds.has(name)) {
            this.logger.warn(`Sound with name ${name} already exists`);
            return this.sounds.get(name);
        }
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            // Create audio object based on spatial setting
            let sound;
            if (config.spatial) {
                sound = new THREE.PositionalAudio(this.listener);
                // Configure spatial audio
                const panner = sound.panner;
                panner.distanceModel = config.distanceModel || this.config.distanceModel;
                panner.refDistance = config.refDistance || this.config.refDistance;
                panner.maxDistance = config.maxDistance || this.config.maxDistance;
                panner.rolloffFactor = config.rolloffFactor || this.config.rolloffFactor;
                panner.coneInnerAngle = this.config.coneInnerAngle;
                panner.coneOuterAngle = this.config.coneOuterAngle;
                panner.coneOuterGain = this.config.coneOuterGain;
            }
            else {
                sound = new THREE.Audio(this.listener);
            }
            // Set audio buffer
            sound.setBuffer(audioBuffer);
            sound.setLoop(config.loop || false);
            sound.setVolume(config.volume !== undefined ? config.volume : 1);
            // Create sound wrapper
            const audioSound = new AudioSound(name, sound);
            this.sounds.set(name, audioSound);
            // Auto-play if configured
            if (config.autoplay) {
                audioSound.play();
            }
            this.logger.debug(`Sound loaded: ${name} from ${url}`);
            return audioSound;
        }
        catch (error) {
            this.logger.error(`Failed to load sound ${name}:`, error);
            throw error;
        }
    }
    /**
     * Load a sound from AudioBuffer directly
     */
    loadSoundFromBuffer(name, buffer, config = {}) {
        if (!this.isInitialized || !this.listener) {
            throw new Error('Audio engine not initialized');
        }
        if (this.sounds.has(name)) {
            this.logger.warn(`Sound with name ${name} already exists`);
            return this.sounds.get(name);
        }
        // Create audio object
        let sound;
        if (config.spatial) {
            sound = new THREE.PositionalAudio(this.listener);
        }
        else {
            sound = new THREE.Audio(this.listener);
        }
        sound.setBuffer(buffer);
        sound.setLoop(config.loop || false);
        sound.setVolume(config.volume !== undefined ? config.volume : 1);
        const audioSound = new AudioSound(name, sound);
        this.sounds.set(name, audioSound);
        if (config.autoplay) {
            audioSound.play();
        }
        this.logger.debug(`Sound loaded from buffer: ${name}`);
        return audioSound;
    }
    /**
     * Get a sound by name
     */
    getSound(name) {
        return this.sounds.get(name);
    }
    /**
     * Get all sounds
     */
    getAllSounds() {
        return Array.from(this.sounds.values());
    }
    /**
     * Remove a sound
     */
    removeSound(name) {
        const sound = this.sounds.get(name);
        if (sound) {
            sound.dispose();
            this.sounds.delete(name);
            this.logger.debug(`Sound removed: ${name}`);
        }
    }
    /**
     * Set master volume for all sounds
     */
    setMasterVolume(volume) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        for (const sound of this.sounds.values()) {
            sound.sound.setVolume(clampedVolume);
        }
        this.logger.debug(`Master volume set to: ${clampedVolume}`);
    }
    /**
     * Pause all sounds
     */
    pauseAll() {
        for (const sound of this.sounds.values()) {
            sound.pause();
        }
        this.logger.debug('All sounds paused');
    }
    /**
     * Resume all sounds
     */
    resumeAll() {
        for (const sound of this.sounds.values()) {
            sound.play();
        }
        this.logger.debug('All sounds resumed');
    }
    /**
     * Stop all sounds
     */
    stopAll() {
        for (const sound of this.sounds.values()) {
            sound.stop();
        }
        this.logger.debug('All sounds stopped');
    }
    /**
     * Mute/unmute all sounds
     */
    setMuted(muted) {
        if (!this.listener)
            return;
        // In newer Three.js versions, setVolume/getVolume may not be available on AudioListener
        // Use the gain node directly if available
        const gain = this.listener.gain;
        if (gain) {
            gain.value = muted ? 0 : 1;
        }
        this.logger.debug(`Audio ${muted ? 'muted' : 'unmuted'}`);
    }
    /**
     * Check if audio is muted
     */
    get muted() {
        if (!this.listener)
            return false;
        // In newer Three.js versions, getVolume may not be available on AudioListener
        // Use the gain node directly if available
        const gain = this.listener.gain;
        if (gain) {
            return gain.value === 0;
        }
        // Fallback to checking if all sounds are muted
        return this.sounds.size > 0 && Array.from(this.sounds.values()).every(s => {
            const soundGain = s.sound.gain;
            return soundGain ? soundGain.value === 0 : false;
        });
    }
    /**
     * Create a simple oscillator sound (useful for testing)
     */
    createOscillator(name, frequency = 440, type = 'sine', config = {}) {
        if (!this.isInitialized || !this.audioContext) {
            throw new Error('Audio engine not initialized');
        }
        // Create oscillator and gain node
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(config.volume || 1, this.audioContext.currentTime);
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        // Start oscillator
        oscillator.start();
        // Create sound wrapper
        const sound = new THREE.Audio(this.listener);
        // In newer Three.js versions, setGainNode may not be available
        // Connect the gain node directly to the audio context
        if (sound.setGainNode) {
            sound.setGainNode(gainNode);
        }
        else {
            // Alternative approach: connect gain node to sound's source
            gainNode.connect(this.audioContext.destination);
        }
        const audioSound = new AudioSound(name, sound);
        this.sounds.set(name, audioSound);
        this.logger.debug(`Oscillator sound created: ${name}`);
        return audioSound;
    }
    /**
     * Update audio listener position (call each frame)
     */
    update() {
        // Audio listener is typically updated by the camera/three.js object
        // This method can be used for any additional audio processing
    }
    /**
     * Get audio context statistics
     */
    getAudioStats() {
        if (!this.audioContext)
            return null;
        return {
            state: this.audioContext.state,
            sampleRate: this.audioContext.sampleRate,
            currentTime: this.audioContext.currentTime,
            bufferSize: this.audioContext.baseLatency,
            activeSounds: this.sounds.size,
            playingSounds: Array.from(this.sounds.values()).filter(s => s.isPlaying).length,
        };
    }
    /**
     * Dispose of audio engine
     */
    dispose() {
        // Dispose all sounds
        for (const sound of this.sounds.values()) {
            sound.dispose();
        }
        this.sounds.clear();
        // Close audio context
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            this.audioContext = null;
        }
        // Clear listener
        this.listener = null;
        this.isInitialized = false;
        this.logger.debug('Audio engine disposed');
    }
}
//# sourceMappingURL=AudioEngine.js.map