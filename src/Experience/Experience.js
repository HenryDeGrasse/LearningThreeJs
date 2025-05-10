import * as THREE from 'three'
import Sizes from "./Utils/Sizes"
import Time from "./Utils/Time"
import Camera from './Camera'
import Renderer from './Renderer'
import World from './World/World'
import Resources from './Utils/Resources'
import Debug from './Utils/Debug.js'
import sources from './sources.js'
import Sounds from './World/Sounds.js'
import Raycaster from './Utils/Raycaster.js'

let instance = null

export default class Experience {
    constructor(canvas) {
        if (instance) { return instance }

        instance = this
        // Global Access
        window.experience = this
        
        // Options
        this.canvas = canvas

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes
        this.time = new Time
        this.scene = new THREE.Scene()
        this.resources = new Resources(sources)
        this.camera = new Camera
        this.sounds= new Sounds()
        this.raycaster = new Raycaster()
        this.renderer = new Renderer()

        this.resources.on('ready', () => {
            this.world = new World()
            this.startRendering()
        })

        // listening
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        this.time.on('tick', () => {
            this.update()
        })

    }

    startRendering() {
        this.time.on('tick', () => this.update())
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    update() {
        this.camera.update()
        if (this.world) this.world.update()
        this.renderer.update()
        this.raycaster.update()
    }

    destroy() {
        this.sizes.off('resize')
        this.sizes.off('tick')

        // Traverse the whole scene
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose()

                for (const key in child.material) {
                    const value = child.material[key]

                    if (value && typeof value.dispose === 'function') {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()
        this.raycaster.instance.dispose()

        if (this.debug.active) {
            this.debug.ui.dispose()
        }
    }
}