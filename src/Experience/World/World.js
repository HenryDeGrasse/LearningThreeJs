import Experience from "../Experience";
import Environment from "./Environment";
import * as THREE from 'three'
import Mountain from "./Mountain";
import Shilajit from "./Shilajit";
import Orb from "./Orb";

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.raycaster = this.experience.raycaster

        this.mountain = new Mountain()
        this.shilajit = new Shilajit()
        this.environment = new Environment()

        this.axisHelper = new THREE.AxesHelper()
        // this.scene.add(this.axisHelper)
        this.orb = new Orb('Orb')
    }

    update() {
        if (this.mountain) this.mountain.update()
        if (this.shilajit) this.shilajit.update()
        if (this.orb) this.orb.update()
    }
}