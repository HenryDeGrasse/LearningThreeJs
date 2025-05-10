import Experience from "../Experience";
import * as THREE from 'three'

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.sounds = this.experience.sounds;
    this.debug = this.experience.debug;

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("environment");
    }

    this.setSunlight();
    this.setAmbientLight();
    //this.setEnvironmentMap();
  }

  setSunlight() {
    this.sunlight = new THREE.DirectionalLight("#ffffff", 1);
    this.sunlight.position.set(1, 3, -3);
    this.sunlight.castShadow = true;
    this.sunlight.shadow.mapSize.width = 1024; // Higher resolution (default is 512)
    this.sunlight.shadow.mapSize.height = 1024;
    this.sunlight.shadow.camera.near = 0.1;
    this.sunlight.shadow.camera.far = 7; // Adjust based on scene size
    this.sunlight.shadow.camera.left = -4;
    this.sunlight.shadow.camera.right = 4;
    this.sunlight.shadow.camera.top = 2;
    this.sunlight.shadow.camera.bottom = -2;

    this.scene.add(this.sunlight);

    if (this.debug.active) {
      this.debugFolder
        .add(this.sunlight, "intensity")
        .name("sunLightIntensity")
        .min(0)
        .max(10)
        .step(0.001);

      this.debugFolder
        .add(this.sunlight.position, "x")
        .name("sunLightX")
        .min(-5)
        .max(5)
        .step(0.001);

      this.debugFolder
        .add(this.sunlight.position, "y")
        .name("sunLightY")
        .min(-5)
        .max(5)
        .step(0.001);

      this.debugFolder
        .add(this.sunlight.position, "z")
        .name("sunLightZ")
        .min(-5)
        .max(5)
        .step(0.001);
    }
  }

  setAmbientLight() {
    this.ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
    this.scene.add(this.ambientLight);
  }

  setEnvironmentMap() {
    this.environmentMap = {};
    this.environmentMap.intensity = 4; // Default intensity
    this.environmentMap.texture = this.resources.items.shilajitEnvMap; // Use shilajitEnvMap

    // Set scene environment (optional, see below)
    this.scene.environment = this.environmentMap.texture;

    // Update all materials in the scene
    this.environmentMap.updateMaterials = () => {
      this.scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          // Only apply to materials without a custom envMap, or force it
          if (
            !child.material.envMap ||
            child.material.envMap === this.environmentMap.texture
          ) {
            child.material.envMap = this.environmentMap.texture;
            child.material.envMapIntensity = this.environmentMap.intensity;
            child.material.needsUpdate = true;
          }
        }
      });
    };

    this.environmentMap.updateMaterials();

    // Debug
    if (this.debug.active) {
      this.debugFolder
        .add(this.environmentMap, "intensity")
        .name("envMapIntensityParent")
        .min(0)
        .max(10)
        .step(0.001)
        .onChange(() => {
          this.environmentMap.updateMaterials();
        });
    }
  }
}