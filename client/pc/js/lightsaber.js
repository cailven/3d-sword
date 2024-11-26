class Lightsaber {
    constructor() {
        this.group = new THREE.Group();
        this.createLightsaber();
        this.addGlow();
    }

    createLightsaber() {
        // 光剑手柄
        const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 32);
        const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        this.handle = new THREE.Mesh(handleGeometry, handleMaterial);

        // 光剑刃
        const bladeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 32);
        const bladeMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8
        });
        this.blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        this.blade.position.y = 0.75;

        this.group.add(this.handle);
        this.group.add(this.blade);
    }

    addGlow() {
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0x00ff00) }
            },
            vertexShader: /* glsl */`
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: /* glsl */`
                uniform vec3 color;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    gl_FragColor = vec4(color, 1.0) * intensity;
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
    }
} 