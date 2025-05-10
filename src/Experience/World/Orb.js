import * as THREE from 'three'
import gsap from 'gsap'
import Experience from "../Experience"
// No need to import EventEmitter here since we're using raycaster's emitter

export default class Orb {
    constructor(name = 'Orb') {
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.raycaster = this.experience.raycaster // Use shared raycaster
        this.sizes = this.experience.sizes
        this.debug = this.experience.debug
        this.time = this.experience.time

        this.name = name
        this.isPulsing = true
        this.isSpinning = false
        this.isPlus = true
        
        this.colorObject = { color: '#f0a741' }
        this.colorPlusObject = { color: '#71706f' }
        
        this.setGeometry()
        this.setMaterial()
        this.setMesh()
        this.setPlusGeometry()
        this.setPlusMaterial()
        this.setPlusMesh()
        //this.setAudio()
        this.setRaycaster()
        this.setDebug()
        this.updatePosition()
    }

    setGeometry() {
        this.geometry = new THREE.IcosahedronGeometry(0.08, 0)
    }

    setMaterial() {
        this.material = new THREE.MeshStandardMaterial({
            color: this.colorObject.color,
            emissive: '#ff5555',
            emissiveIntensity: 0.5,
            metalness: 0.5,
            transparent: true, 
            wireframe: true,
        })
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.name = this.name
        this.scene.add(this.mesh)
    }

    setPlusGeometry() {
        const plusShape = new THREE.Shape()
        plusShape.moveTo(-0.03, 0.01).lineTo(-0.03, -0.01).lineTo(-0.01, -0.01).lineTo(-0.01, -0.03).lineTo(0.01, -0.03)
        plusShape.lineTo(0.01, -0.01).lineTo(0.03, -0.01).lineTo(0.03, 0.01).lineTo(0.01, 0.01).lineTo(0.01, 0.03)
        plusShape.lineTo(-0.01, 0.03).lineTo(-0.01, 0.01).lineTo(-0.03, 0.01)
        this.plusGeometry = new THREE.ExtrudeGeometry(plusShape, { depth: 0.01, bevelEnabled: false })
    }

    setPlusMaterial() {
        this.plusMaterial = new THREE.MeshBasicMaterial({
            color: this.colorPlusObject.color,
            transparent: true,
        })
    }

    setPlusMesh() {
        this.plus = new THREE.Mesh(this.plusGeometry, this.plusMaterial)
        this.scene.add(this.plus)
    }

    setRaycaster() {
        if (this.raycaster) {
            this.raycaster.addObjectsToTest(this.mesh)
            
            this.raycaster.on(`mouseenter.${this.name}`, () => {
                this.isPulsing = false
                this.mesh.scale.setScalar(1.1)
            })
            
            this.raycaster.on(`click.${this.name}`, () => {
                this.togglePlusX();
            })
            
            this.raycaster.on(`mouseleave.${this.name}`, () => {
                this.isPulsing = true
            })
        } else {
            console.error('Raycaster not found in Experience')
        }
    }

    updatePosition() {
        if (!this.camera.instance || !this.sizes) return

        const cameraPos = this.camera.instance.position
        const cameraDir = new THREE.Vector3()
        this.camera.instance.getWorldDirection(cameraDir)

        const up = new THREE.Vector3(0, 1, 0)
        const right = new THREE.Vector3().crossVectors(cameraDir, up).normalize()
        const cameraUp = new THREE.Vector3().crossVectors(right, cameraDir).normalize()

        const fov = THREE.MathUtils.degToRad(this.camera.instance.fov)
        const aspect = this.sizes.width / this.sizes.height
        const distance = 1

        const viewHeight = 2 * Math.tan(fov / 2) * distance
        const viewWidth = viewHeight * aspect

        const normalizedX = 0.17
        const normalizedY = 0.88

        const offsetX = viewWidth * (normalizedX - 0.5)
        const offsetY = viewHeight * (normalizedY - 0.5)

        this.mesh.position.copy(cameraPos)
            .add(cameraDir.multiplyScalar(distance))
            .add(right.multiplyScalar(offsetX))
            .add(cameraUp.multiplyScalar(offsetY))

        this.updatePlusPosition()
    }

    updatePlusPosition() {
        this.plus.position.copy(this.mesh.position)
    }

    update() {
        this.updatePosition()
        const pulse = 1 + Math.sin(this.time.elapsed * 0.002) * 0.05
        if (this.isPulsing) {
            this.mesh.scale.setScalar(pulse)
            this.plus.scale.setScalar(pulse)
        }
        this.mesh.rotation.y += this.time.delta * 0.00004
        this.mesh.rotation.z += this.time.delta * 0.00007
        if (!this.isSpinning) this.plus.rotation.y = Math.sin(this.time.elapsed * 0.005) * 0.1
    }

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z)
        this.updatePlusPosition()
    }

    togglePlusX() {
        if (this.isSpinning) return
        this.isSpinning = true
        const targetZ = this.isPlus ? Math.PI * 9/4 : 0; // 225° for X, 0 for +
        this.isPlus = !this.isPlus;

        this.material.opacity = 0.3;
        this.plusMaterial.opacity = 0.3; 

        this.raycaster.trigger(`toggle.${this.name}`, [this.isPlus ? 'hide' : 'show']);

        //this.clickSound.play();

        gsap.to(this.plus.rotation, {
            duration: 3,
            ease: 'power4.out',
            z: targetZ,
            onComplete: () => {
                this.isSpinning = false
                this.material.opacity = 1; 
                this.plusMaterial.opacity = 1; 
            }
        });
    }

    setAudio() {
        // Create audio listener and add to camera
        this.listener = new THREE.AudioListener()
        this.camera.instance.add(this.listener)

        // Create sound and set buffer
        this.clickSound = new THREE.Audio(this.listener)
        this.clickSound.setBuffer(this.resources.items.spinningClick)
        this.clickSound.setVolume(0.15) // Adjust volume (0 to 1)
    }

    setDebug() {
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder("Orb")
            this.debugFolder.add(this.material, 'wireframe')
            this.debugFolder.add(this.material, 'emissiveIntensity')
                .min(0).max(1).step(0.001).name('Emissivity')
            this.debugFolder.add(this.material, 'metalness')
                .min(0).max(1).step(0.001).name('Metalness')
            
            this.debugFolder.addColor(this.colorObject, 'color')
                .onChange(() => {
                    this.material.color.set(this.colorObject.color)
                })
                .name('Orb Color')
            
            this.debugFolder.addColor(this.colorPlusObject, 'color')
                .onChange(() => {
                    this.plusMaterial.color.set(this.colorPlusObject.color)
                })
                .name('Plus Color')
        }
    }
}