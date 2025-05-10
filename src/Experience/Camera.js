import * as THREE from 'three'
import Experience from "./Experience.js"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


export default class Camera {
    constructor () {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        this.setInstance()
        this.setListener()
        this.setOrbitControls()
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100)
        this.instance.position.set(1.7, 1.7, -1.2)
        this.scene.add(this.instance)
    }

    setListener() {
        this.listener = new THREE.AudioListener
        this.instance.add( this.listener )
    }

    setOrbitControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.target.set(0, .8, 0)
        //this.controls.autoRotate = true
        this.controls.autoRotateSpeed = -2
        this.controls.enableDamping = true
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        this.controls.update()
    }

}