import * as THREE from 'three'
import Experience from "../Experience"
import EventEmitter from './EventEmitter'

export default class Raycaster extends EventEmitter {
    constructor() {
        super()
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.sizes = this.experience.sizes
        
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        this.currentIntersect = null
        this.objectsToTest = []
        
        this.setEvents()
    }

    setEvents() {
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / this.sizes.width) * 2 - 1
            this.mouse.y = -(event.clientY / this.sizes.height) * 2 + 1
        })

        window.addEventListener('click', () => {
            if (this.currentIntersect) {
                const objectName = this.currentIntersect.object.name || 'unnamed'
                this.trigger(`click.${objectName}`)
            }
        })
    }

    addObjectsToTest(...objects) {
        this.objectsToTest.push(...objects)
        objects.forEach(obj => {
            obj.updateMatrixWorld()
            if (!obj.name) obj.name = 'unnamed'
        })
    }

    update() {
        if (!this.camera && !this.camera.instance) {
            console.error('Camera instance not found')
            return
        }

        this.raycaster.setFromCamera(this.mouse, this.camera.instance)
        const intersects = this.raycaster.intersectObjects(this.objectsToTest)

        if (intersects.length) {
            if (!this.currentIntersect) {
                const objectName = intersects[0].object.name
                this.trigger(`mouseenter.${objectName}`)
            }
            this.currentIntersect = intersects[0]
        } else {
            if (this.currentIntersect) {
                const objectName = this.currentIntersect.object.name
                this.trigger(`mouseleave.${objectName}`)
                this.currentIntersect = null
            }
        }
    }
}