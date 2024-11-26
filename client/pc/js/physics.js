class CollisionSystem {
    constructor() {
        this.objects = [];
        this.lightsaber = null;
    }

    addObject(object) {
        this.objects.push({
            mesh: object,
            boundingBox: new THREE.Box3().setFromObject(object)
        });
    }

    setLightsaber(lightsaber) {
        this.lightsaber = lightsaber;
    }

    update() {
        if (!this.lightsaber) return;
        
        const lightsaberBox = new THREE.Box3().setFromObject(this.lightsaber.blade);
        
        this.objects.forEach(obj => {
            if (lightsaberBox.intersectsBox(obj.boundingBox)) {
                this.handleCollision(obj);
            }
        });
    }

    handleCollision(object) {
        // 简单的碰撞效果
        object.mesh.visible = false;
        // 可以添加粒子效果等
    }
} 