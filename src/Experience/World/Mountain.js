import * as THREE from 'three'
import Experience from "../Experience";
import Time from '../Utils/Time';

export default class Mountain {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug;
        this.time = new Time()

        this.shouldRotate = true
        this.colorObject = {}
        this.colorObject.color = '#956341'

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
        this.setDebug()

        
        this.autoRotateTimeout = null
        const AUTO_ROTATE_DELAY = 4000
        this.mesh.addEventListener('start', () => {
            this.shouldRotate = false // Stop auto-rotation immediately
            if (autoRotateTimeout) {
                this.clearTimeout(autoRotateTimeout) // Cancel any pending resume
            }
        })

        this.mesh.addEventListener('end', () => {
            resumeAutoRotate()
        })

    }

    setGeometry() {
        this.planeGeometry = new THREE.PlaneGeometry(5, 5, 256, 256);
        this.planeGeometry.computeVertexNormals();
        this.planeGeometry.rotateX(- Math.PI * 0.5);
    }

    setTextures() {
        this.textures = {}

        this.textures.alphaMap = this.resources.items.mountainAlphaMap
        this.textures.heightMap = this.resources.items.mountainHeightMap
        this.textures.heightMap.minFilter = THREE.LinearFilter
        this.textures.heightMap.magFilter = THREE.LinearFilter
    }

    setMaterial() {
        this.material = new THREE.MeshStandardMaterial({
            color: this.colorObject.color,
            alphaMap: this.textures.alphaMap,
            transparent: true,
            displacementMap: this.textures.heightMap,
            displacementScale: 3,
            wireframe: true,
        })
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.planeGeometry, this.material)
        this.mesh.position.y = -1 //-4.3
        this.mesh.rotation.y = 1.9
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.scene.add(this.mesh)
    }

    update() {
        if (this.shouldRotate) {
            this.mesh.rotation.y += this.time.delta * 0.00003
        }
    }

    resumeAutoRotate() {
        if (this.autoRotateTimeout) {
            clearTimeout(this.autoRotateTimeout) // Clear any existing timeout
        }
        this.autoRotateTimeout = setTimeout(() => {
            this.shouldRotate = true
        }, AUTO_ROTATE_DELAY)
    }

    setDebug() {
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder("Mountain");
            this.debugFolder
                .addColor(this.colorObject, 'color') 
                .onChange(() =>
                    {
                        this.material.color.set(this.colorObject.color)
                    })
        }
    }
}