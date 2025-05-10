// Sounds.js
import * as THREE from 'three'
import Experience from "../Experience"

export default class Sounds {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug;

        this.volume = 0.1
        
        this.setupAudio()
        this.setupDebug();

    }

    setupAudio() {
        // Use the listener from camera
        if (!this.experience.camera.listener) {
            console.error('Camera listener not found')
            return
        }
        
        this.backgroundMusic = new THREE.Audio(this.experience.camera.listener)
        
        // Wait for resources to be ready before setting buffer and adding listener
        this.experience.resources.on('ready', () => {
            if (this.experience.resources.items.backgroundMusic) {
                this.backgroundMusic.setBuffer(this.experience.resources.items.backgroundMusic)
                this.backgroundMusic.setLoop(true)
                this.backgroundMusic.setVolume(this.volume)

                window.addEventListener('click', () => {
                    this.startBackgroundMusic()
                }, { once: true })
            } else {
                console.error('Background music buffer not found in resources')
            }
        })
    }

    startBackgroundMusic() {
        if (!this.backgroundMusic) {
            console.error('Background music not initialized')
            return
        }
        
        if (!this.backgroundMusic.isPlaying) {
            try {
                this.backgroundMusic.play()
            } catch (error) {
                console.error('Error playing background music:', error)
            }
        }
    }

    setupDebug() {
        if (this.debug.active && this.backgroundMusic) {
            this.debugFolder = this.debug.ui.addFolder("Sounds");
            this.debugFolder
                .add(this, 'volume')  // Bind to the volume property
                .name('Volume')
                .min(0)
                .max(1)
                .step(0.01)
                .onChange((value) => {
                    this.backgroundMusic.setVolume(value);
                });
        }
    }
}