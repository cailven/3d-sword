class LightsaberApp {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.lightsaber = null;
        this.collisionSystem = null;
        this.ws = null;
        this.isConnected = false;
        this.infoElement = document.getElementById('info');
        
        this.init();
        this.setupLights();
        this.setupLightsaber();
        this.setupCollisionSystem();
        this.setupWebSocket();
        this.animate();
    }

    init() {
        // 初始化相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 3); // 设置相机位置在人眼高度
        this.camera.lookAt(0, 1, 0);

        // 初始化渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // 添加地面
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // 窗口大小调整处理
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        // 主方向光
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 5, 5);
        mainLight.castShadow = true;
        this.scene.add(mainLight);
    }

    setupLightsaber() {
        this.lightsaber = new Lightsaber();
        this.scene.add(this.lightsaber.group);
    }

    setupCollisionSystem() {
        this.collisionSystem = new CollisionSystem();
        this.collisionSystem.setLightsaber(this.lightsaber);
    }

    setupWebSocket() {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${location.hostname}:${location.port}`;
        
        this.ws = new WebSocket(wsUrl);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
            this.isConnected = true;
            this.infoElement.textContent = '已连接';
            this.infoElement.style.background = 'rgba(0,255,0,0.7)';
        };

        this.ws.onclose = () => {
            this.isConnected = false;
            this.infoElement.textContent = '连接断开，尝试重连...';
            this.infoElement.style.background = 'rgba(255,0,0,0.7)';
            setTimeout(() => this.setupWebSocket(), 1000);
        };

        this.ws.onmessage = (event) => {
            const data = new Float32Array(event.data);
            this.updateLightsaberPosition(data);
        };
    }

    updateLightsaberPosition(data) {
        if (!this.lightsaber || !this.lightsaber.group) return;

        // 创建欧拉角，使用完整的角度值
        const euler = new THREE.Euler(
            THREE.MathUtils.degToRad(data[1]),      // Beta
            THREE.MathUtils.degToRad(data[0]),      // Alpha
            THREE.MathUtils.degToRad(data[2]),      // Gamma
            'YXZ'                                   // 使用 YXZ 旋转顺序
        );

        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(euler);

        // 使用较小的插值系数实现更精确的跟踪
        this.lightsaber.group.quaternion.slerp(quaternion, 0.2);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 更新碰撞检测
        if (this.collisionSystem) {
            this.collisionSystem.update();
        }

        this.renderer.render(this.scene, this.camera);
    }
} 