import * as THREE from "three";
import Experience from "../Experience";
import gsap from 'gsap'

export default class Shilajit {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.raycaster = this.experience.raycaster;

    this.isVisible = false;
    this.isAnimating = false;
    this.radius = 1.85;
    this.behindMountainAngle = Math.atan2(1.2, -1.7);
    this.cameraAngle = Math.atan2(-1.2, 1.7);
    this.angle = this.behindMountainAngle;

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Shilajit");
    }

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setRaycasterListeners(); // Renamed for clarity
    this.setDebug();
  }

  setGeometry() {
    this.geometry = new THREE.CylinderGeometry(0.06, 0.06, 0.18, 64);
  }

  setMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      color: "#333333",
      transparent: true,
      opacity: 0,
      metalness: 0.7,
      roughness: 0.3,
      envMap: this.resources.items.shilajitEnvMap,
      envMapIntensity: 1,
    });
    this.material.envMap.mapping = THREE.EquirectangularReflectionMapping;
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = THREE.MathUtils.degToRad(12);

    this.pivot = new THREE.Object3D();
    this.pivot.add(this.mesh);

    this.pivot.position.set(
      this.radius * Math.cos(this.angle),
      -0.5,
      this.radius * Math.sin(this.angle)
    );
    this.pivot.visible = false;
    this.scene.add(this.pivot);
  }

  setRaycasterListeners() {
    if (this.raycaster) {
      this.raycaster.on('toggle.Orb', (state) => {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.isVisible = state === 'show';
        if (this.isVisible) {
          this.showAnimation();
        } else {
          this.hideAnimation();
        }
      });
    }
  }

  updatePosition() {
    this.pivot.position.x = this.radius * Math.cos(this.angle);
    this.pivot.position.z = this.radius * Math.sin(this.angle);
  }

  toggleVisibility() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.showAnimation();
    } else {
      this.hideAnimation();
    }
  }

  showAnimation() {
    gsap.to(this.material, {
      opacity: 1,
      duration: 1,
      ease: "power3.in",
    });

    gsap.to(this.pivot.position, {
      y: 1.60,
      duration: 3,
      ease: "power4.out",
    });

    gsap.to(this, {
      angle: this.cameraAngle,
      duration: 3,
      ease: "power4.out",
      onUpdate: () => this.updatePosition(),
      onStart: () => {
        this.angle = this.behindMountainAngle;
        this.updatePosition();
        this.pivot.visible = true;
        this.pivot.rotation.y = 0;
      },
      onComplete: () => {
        this.isAnimating = false;
      },
    });
  }

  hideAnimation() {
    gsap.to(this, {
      angle: this.cameraAngle - Math.PI,
      duration: 3,
      ease: "power2.in",
      onUpdate: () => this.updatePosition(),
    });

    gsap.to(this.pivot.position, {
      y: -0.5,
      duration: 3,
      ease: "power4.in",
      onComplete: () => {
        this.pivot.visible = false;
        this.angle = this.behindMountainAngle;
        this.isAnimating = false;
      },
    });

    gsap.to(this.material, {
      opacity: 0,
      duration: 1.5,
      delay: 1.5,
      ease: "power2.in",
    });
  }

  update() {
    if (this.isVisible) {
      this.pivot.rotation.y += this.time.delta * 0.0001;
    }
  }

  setDebug() {
    if (this.debug.active) {
      const debugObject = {
        toggleVisibility: () => {
          this.toggleVisibility();
        },
      };
      this.debugFolder
        .add(debugObject, "toggleVisibility")
        .name("Toggle Visibility");
      this.debugFolder
        .add(this.material, "envMapIntensity")
        .min(0)
        .max(10)
        .step(0.001)
        .onChange(() => {
          this.material.needsUpdate = true;
        });
    }
  }
}