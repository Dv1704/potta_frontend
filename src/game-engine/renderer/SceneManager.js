/**
 * Three.js Scene Manager for 3D ball rendering
 * Ported from game_engine CScene.js
 */
import * as THREE from 'three';
import * as Constants from '../constants.js';

export class SceneManager {
    constructor(canvas3D) {
        this.canvas = canvas3D;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.balls3D = [];
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {};

        this._init();
    }

    _init() {
        // Create scene
        this.scene = new THREE.Scene();

        // Orthographic camera for 2D-style rendering
        // Bounds match the 1280x770 unit system
        this.camera = new THREE.OrthographicCamera(
            Constants.CANVAS_WIDTH / -2,
            Constants.CANVAS_WIDTH / 2,
            Constants.CANVAS_HEIGHT / 2,
            Constants.CANVAS_HEIGHT / -2,
            1,
            1000
        );
        this.camera.position.z = 100;
        this.camera.zoom = 1;
        this.scene.add(this.camera);
        this.camera.updateProjectionMatrix();

        // High-performance lighting - optimized for ball highlights
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(200, 300, 500); // Angle for better specular highlights
        this.scene.add(mainLight);

        const fillLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(fillLight);

        // Add a rim light for that premium 3D look
        const rimLight = new THREE.PointLight(0xffffff, 0.8);
        rimLight.position.set(-200, -300, 100);
        this.scene.add(rimLight);

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            precision: 'mediump',
            powerPreference: 'high-performance'
        });

        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    /**
     * Load all ball textures
     */
    async loadTextures() {
        const promises = Constants.TEXTURE_PATHS.map(({ path, name }) => {
            return new Promise((resolve, reject) => {
                this.textureLoader.load(
                    path,
                    (texture) => {
                        texture.colorSpace = THREE.SRGBColorSpace;
                        texture.anisotropy = 16;
                        this.textures[name] = texture;
                        resolve({ name, texture });
                    },
                    undefined,
                    (error) => {
                        console.warn(`Failed to load texture: ${path}`, error);
                        // Create fallback colored texture
                        this.textures[name] = this._createFallbackTexture(name);
                        resolve({ name, texture: this.textures[name] });
                    }
                );
            });
        });

        return Promise.all(promises);
    }

    /**
     * Create a fallback colored texture if loading fails
     */
    _createFallbackTexture(name) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // High-definition ball textures (fallback)
        const ballColors = {
            'cue_ball': '#FFFFFF',
            'ball_1': '#FFD700', 'ball_2': '#0000FF', 'ball_3': '#FF0000',
            'ball_4': '#800080', 'ball_5': '#FF4500', 'ball_6': '#008000',
            'ball_7': '#8B0000', 'ball_8': '#000000',
            'ball_9': '#FFD700', 'ball_10': '#0000FF', 'ball_11': '#FF0000',
            'ball_12': '#800080', 'ball_13': '#FF4500', 'ball_14': '#008000',
            'ball_15': '#8B0000'
        };

        const ballNum = parseInt(name.replace('ball_', '')) || 0;
        const color = ballColors[name] || '#CCCCCC';

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 64, 64);

        // Stripes for balls 9-15
        if (ballNum >= 9) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 64, 12);
            ctx.fillRect(0, 52, 64, 12);
        }

        // Distinct number disk
        if (name !== 'cue_ball') {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(32, 32, 16, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000000';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ballNum.toString(), 32, 32);
        }

        // Glossy overlay
        const shine = ctx.createRadialGradient(20, 20, 2, 32, 32, 40);
        shine.addColorStop(0, 'rgba(255,255,255,0.5)');
        shine.addColorStop(0.5, 'rgba(255,255,255,0)');
        shine.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = shine;
        ctx.fillRect(0, 0, 64, 64);

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }

    /**
     * Create a 3D ball mesh
     */
    create3DBall(ballNumber) {
        const textureName = ballNumber === 0 ? 'cue_ball' : `ball_${ballNumber}`;
        const texture = this.textures[textureName];

        const geometry = new THREE.SphereGeometry(Constants.BALL_RADIUS, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            specular: 0x666666,
            shininess: 120,
            reflectivity: 1
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.z = Constants.BALL_RADIUS;

        this.scene.add(mesh);
        this.balls3D.push(mesh);

        return mesh;
    }

    /**
     * Update ball mesh position from physics ball
     */
    updateBallPosition(mesh, ball) {
        if (!mesh || !ball) return;

        // Convert from game coordinates to Three.js coordinates
        // Game: (0,0) is top-left, Three.js: (0,0) is center
        mesh.position.x = ball.getX() - Constants.CANVAS_WIDTH / 2;
        mesh.position.y = -(ball.getY() - Constants.CANVAS_HEIGHT / 2);

        // Update visibility and scale
        mesh.visible = ball.isVisible() && ball.isBallOnTable();
        mesh.scale.setScalar(ball.getScale());

        // Rotate ball based on movement for realistic rolling
        const velocity = ball.getCurForce();
        if (velocity.length() > 0.01) {
            const rotationSpeed = velocity.length() * 0.1;
            mesh.rotation.x += velocity.y * 0.01;
            mesh.rotation.y -= velocity.x * 0.01;
        }
    }

    /**
     * Render the scene
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Resize renderer to fit container
     */
    resize(width, height) {
        // We keep the internal resolution at 1280x770 to match the physics units
        // The camera bounds are already fixed at 1280x770
        // Browsers handle the scaling automatically via the CSS object-contain
        // This prevents the "tiny balls" effect caused by double scaling
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT, false);
    }

    /**
     * Remove a ball mesh from the scene
     */
    removeBall(mesh) {
        const index = this.balls3D.indexOf(mesh);
        if (index > -1) {
            this.balls3D.splice(index, 1);
        }
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    }

    /**
     * Clean up resources
     */
    dispose() {
        // Dispose ball meshes
        for (const mesh of this.balls3D) {
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        this.balls3D = [];

        // Dispose textures
        for (const name in this.textures) {
            this.textures[name].dispose();
        }
        this.textures = {};

        // Dispose renderer
        this.renderer.dispose();
        this.scene = null;
        this.camera = null;
    }
}

export default SceneManager;
