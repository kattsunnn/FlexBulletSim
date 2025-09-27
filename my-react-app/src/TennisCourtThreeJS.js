// Three.jsテニスコート3D バレットタイム映像システム
import * as THREE from 'three'

class TennisCourtBulletTime {
  constructor(canvas, updateStateCallback) {
    this.canvas = canvas
    this.updateState = updateStateCallback
    this.cameras = []
    this.currentCameraIndex = 0
    this.currentCameraPattern = 3
    this.animationMixers = []
    this.clock = new THREE.Clock()
    
    this.init()
  }

  async init() {
    console.log('🚀 バレットタイム映像システム起動')
    console.log('📦 Three.js version:', THREE.REVISION)
    
    this.setupRenderer()
    this.setupScene()
    this.setupLighting()
    this.createTennisCourt()
    await this.setupPlayers()
    this.setupEventListeners()
    this.animate()
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  setupScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87CEEB)
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200)
  }

  setupLighting() {
    // 環境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    this.scene.add(ambientLight)

    // 太陽光（影を生成）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    
    // 影の品質設定
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -15
    directionalLight.shadow.camera.right = 15
    directionalLight.shadow.camera.top = 15
    directionalLight.shadow.camera.bottom = -15
    
    this.scene.add(directionalLight)
  }

  createTennisCourt() {
    const courtGroup = new THREE.Group()

    const COURT_LENGTH = 23.77
    const COURT_WIDTH_DOUBLES = 10.97
    const COURT_WIDTH_SINGLES = 8.23
    const SERVICE_LENGTH = 6.40
    const NET_HEIGHT = 0.914

    // コート面（緑色）
    const courtGeometry = new THREE.PlaneGeometry(COURT_WIDTH_DOUBLES, COURT_LENGTH)
    const courtMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 })
    const court = new THREE.Mesh(courtGeometry, courtMaterial)
    court.rotation.x = -Math.PI / 2
    court.receiveShadow = true
    courtGroup.add(court)

    // ラインの作成関数
    const createLine = (width, length, x, z) => {
      const lineGeometry = new THREE.PlaneGeometry(width, length)
      const lineMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
      const line = new THREE.Mesh(lineGeometry, lineMaterial)
      line.rotation.x = -Math.PI / 2
      line.position.set(x, 0.001, z)
      line.receiveShadow = true
      return line
    }

    // ベースライン（上下）
    courtGroup.add(createLine(COURT_WIDTH_DOUBLES, 0.05, 0, COURT_LENGTH / 2))
    courtGroup.add(createLine(COURT_WIDTH_DOUBLES, 0.05, 0, -COURT_LENGTH / 2))

    // サイドライン（ダブルス）
    courtGroup.add(createLine(0.05, COURT_LENGTH, COURT_WIDTH_DOUBLES / 2, 0))
    courtGroup.add(createLine(0.05, COURT_LENGTH, -COURT_WIDTH_DOUBLES / 2, 0))

    // サイドライン（シングルス）
    courtGroup.add(createLine(0.05, COURT_LENGTH, COURT_WIDTH_SINGLES / 2, 0))
    courtGroup.add(createLine(0.05, COURT_LENGTH, -COURT_WIDTH_SINGLES / 2, 0))

    // サービスライン（上下）
    courtGroup.add(createLine(COURT_WIDTH_SINGLES, 0.05, 0, SERVICE_LENGTH))
    courtGroup.add(createLine(COURT_WIDTH_SINGLES, 0.05, 0, -SERVICE_LENGTH))

    // センターライン
    courtGroup.add(createLine(0.05, SERVICE_LENGTH * 2, 0, 0))

    // ネットの作成
    const netGeometry = new THREE.BoxGeometry(COURT_WIDTH_DOUBLES, NET_HEIGHT, 0.1)
    const netMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
    const net = new THREE.Mesh(netGeometry, netMaterial)
    net.position.set(0, NET_HEIGHT / 2, 0)
    net.castShadow = true
    net.receiveShadow = true
    courtGroup.add(net)

    // センターマーク
    courtGroup.add(createLine(0.05, 0.10, 0, COURT_LENGTH / 2))
    courtGroup.add(createLine(0.05, 0.10, 0, -COURT_LENGTH / 2))

    this.scene.add(courtGroup)
  }

  async loadPlayerModel(modelUrl, name, position, rotation) {
    const playerGroup = new THREE.Group()
    playerGroup.name = name
    
    try {
      console.log(`🔄 ${name}の3Dモデル読み込み開始`)
      
      // 簡単な代替プレイヤー（ボックス）を作成
      const geometry = new THREE.BoxGeometry(0.4, 1.8, 0.3)
      const material = new THREE.MeshLambertMaterial({ 
        color: name.includes('1') ? 0x3B82F6 : 0xEF4444 
      })
      const playerBox = new THREE.Mesh(geometry, material)
      playerBox.position.y = 0.9 // 地面から浮かせる
      playerBox.castShadow = true
      playerBox.receiveShadow = true
      
      playerGroup.add(playerBox)
      
      console.log(`✅ ${name}の3Dモデル読み込み成功!`)
      
    } catch (error) {
      console.warn(`⚠️ ${name}の3Dモデル読み込み失敗:`, error)
      return null
    }
    
    playerGroup.position.set(position.x, position.y, position.z)
    playerGroup.rotation.y = rotation
    
    return playerGroup
  }

  async setupPlayers() {
    try {
      console.log('👥 プレイヤー配置開始...')
      
      // プレイヤー1（フォーカス対象）
      this.player1Group = await this.loadPlayerModel(
        '',
        'プレイヤー1',
        { x: 0, y: 0, z: -5.9 },
        0
      )
      
      if (this.player1Group) {
        this.scene.add(this.player1Group)
      }
      
      // プレイヤー2
      this.player2Group = await this.loadPlayerModel(
        '',
        'プレイヤー2',
        { x: 0, y: 0, z: 5.9 },
        Math.PI
      )
      
      if (this.player2Group) {
        this.scene.add(this.player2Group)
      }
      
      // カメラシステム初期化
      this.setupCameraSystem()
      this.updateCameraUI()
      
      console.log('✅ プレイヤー配置完了!')
      
    } catch (error) {
      console.error('❌ プレイヤー配置エラー:', error)
    }
  }

  // カメラ配置パターン
  get cameraPatterns() {
    return {
      1: { // 0.75m間隔 - 47台（高密度）
        spacing: '0.75m',
        description: '高密度配置',
        positions: [
          { x: 5.485, y: 0.0, z: 0.97 }, { x: 5.485, y: 0.75, z: 0.97 }, { x: 5.485, y: 1.5, z: 0.97 },
          { x: 5.485, y: 2.25, z: 0.97 }, { x: 5.485, y: 3.0, z: 0.97 }, { x: 5.485, y: 3.75, z: 0.97 },
          { x: 5.485, y: 4.5, z: 0.97 }, { x: 5.485, y: 5.25, z: 0.97 }, { x: 5.485, y: 6.0, z: 0.97 },
          { x: 5.485, y: 6.75, z: 0.97 }, { x: 5.485, y: 7.5, z: 0.97 }, { x: 5.485, y: 8.25, z: 0.97 },
          { x: 5.485, y: 9.0, z: 0.97 }, { x: 5.485, y: 9.75, z: 0.97 }, { x: 5.485, y: 10.5, z: 0.97 },
          { x: 5.485, y: 11.25, z: 0.97 }, { x: 5.37, y: 11.885, z: 0.97 }, { x: 4.62, y: 11.885, z: 0.97 },
          { x: 3.87, y: 11.885, z: 0.97 }, { x: 3.12, y: 11.885, z: 0.97 }, { x: 2.37, y: 11.885, z: 0.97 },
          { x: 1.62, y: 11.885, z: 0.97 }, { x: 0.87, y: 11.885, z: 0.97 }, { x: 0.12, y: 11.885, z: 0.97 },
          { x: -0.63, y: 11.885, z: 0.97 }, { x: -1.38, y: 11.885, z: 0.97 }, { x: -2.13, y: 11.885, z: 0.97 },
          { x: -2.88, y: 11.885, z: 0.97 }, { x: -3.63, y: 11.885, z: 0.97 }, { x: -4.38, y: 11.885, z: 0.97 },
          { x: -5.13, y: 11.885, z: 0.97 }, { x: -5.485, y: 11.49, z: 0.97 }, { x: -5.485, y: 10.74, z: 0.97 },
          { x: -5.485, y: 9.99, z: 0.97 }, { x: -5.485, y: 9.24, z: 0.97 }, { x: -5.485, y: 8.49, z: 0.97 },
          { x: -5.485, y: 7.74, z: 0.97 }, { x: -5.485, y: 6.99, z: 0.97 }, { x: -5.485, y: 6.24, z: 0.97 },
          { x: -5.485, y: 5.49, z: 0.97 }, { x: -5.485, y: 4.74, z: 0.97 }, { x: -5.485, y: 3.99, z: 0.97 },
          { x: -5.485, y: 3.24, z: 0.97 }, { x: -5.485, y: 2.49, z: 0.97 }, { x: -5.485, y: 1.74, z: 0.97 },
          { x: -5.485, y: 0.99, z: 0.97 }, { x: -5.485, y: 0.24, z: 0.97 }
        ]
      },
      2: { // 1.5m間隔 - 24台（中密度）
        spacing: '1.5m',
        description: '中密度配置',
        positions: [
          { x: 5.485, y: 0.0, z: 0.97 }, { x: 5.485, y: 1.5, z: 0.97 }, { x: 5.485, y: 3.0, z: 0.97 },
          { x: 5.485, y: 4.5, z: 0.97 }, { x: 5.485, y: 6.0, z: 0.97 }, { x: 5.485, y: 7.5, z: 0.97 },
          { x: 5.485, y: 9.0, z: 0.97 }, { x: 5.485, y: 10.5, z: 0.97 }, { x: 5.37, y: 11.885, z: 0.97 },
          { x: 3.87, y: 11.885, z: 0.97 }, { x: 2.37, y: 11.885, z: 0.97 }, { x: 0.87, y: 11.885, z: 0.97 },
          { x: -0.63, y: 11.885, z: 0.97 }, { x: -2.13, y: 11.885, z: 0.97 }, { x: -3.63, y: 11.885, z: 0.97 },
          { x: -5.13, y: 11.885, z: 0.97 }, { x: -5.485, y: 10.74, z: 0.97 }, { x: -5.485, y: 9.24, z: 0.97 },
          { x: -5.485, y: 7.74, z: 0.97 }, { x: -5.485, y: 6.24, z: 0.97 }, { x: -5.485, y: 4.74, z: 0.97 },
          { x: -5.485, y: 3.24, z: 0.97 }, { x: -5.485, y: 1.74, z: 0.97 }, { x: -5.485, y: 0.24, z: 0.97 }
        ]
      },
      3: { // 3.0m間隔 - 12台（低密度）
        spacing: '3.0m',
        description: '低密度配置',
        positions: [
          { x: 5.485, y: 0.0, z: 0.97 }, { x: 5.485, y: 3.0, z: 0.97 }, { x: 5.485, y: 6.0, z: 0.97 },
          { x: 5.485, y: 9.0, z: 0.97 }, { x: 5.37, y: 11.885, z: 0.97 }, { x: 2.37, y: 11.885, z: 0.97 },
          { x: -0.63, y: 11.885, z: 0.97 }, { x: -3.63, y: 11.885, z: 0.97 }, { x: -5.485, y: 10.74, z: 0.97 },
          { x: -5.485, y: 7.74, z: 0.97 }, { x: -5.485, y: 4.74, z: 0.97 }, { x: -5.485, y: 1.74, z: 0.97 }
        ]
      }
    }
  }

  setupCameraSystem() {
    if (!this.player1Group) return
    
    const targetPosition = new THREE.Vector3(0, 1.0, 5.9)
    const pattern = this.cameraPatterns[this.currentCameraPattern]
    const cameraPositions = pattern.positions
    const cameraCount = cameraPositions.length
    
    this.cameras = []
    this.currentCameraIndex = 0
    
    let minDistance = Infinity
    const cameraData = []
    
    for (let i = 0; i < cameraCount; i++) {
      const pos = cameraPositions[i]
      const cameraPos = new THREE.Vector3(pos.x, pos.z, pos.y)
      const distance = cameraPos.distanceTo(targetPosition)
      
      cameraData.push({ pos, distance })
      minDistance = Math.min(minDistance, distance)
    }
    
    const baseFOV = 60
    
    for (let i = 0; i < cameraCount; i++) {
      const { pos, distance } = cameraData[i]
      const adjustedFOV = baseFOV * (minDistance / distance)
      
      const camera = new THREE.PerspectiveCamera(
        adjustedFOV,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      
      camera.position.set(pos.x, pos.z, pos.y)
      camera.lookAt(targetPosition)
      
      this.cameras.push({
        camera: camera,
        angle: (i / cameraCount) * Math.PI * 2,
        name: `カメラ ${i + 1}`,
        distance: distance,
        fov: adjustedFOV
      })
      
      console.log(`📹 ${this.cameras[i].name} 配置完了`)
    }
    
    console.log(`🎬 バレットタイムシステム準備完了: ${cameraCount}台のカメラ`)
    this.updateCameraUI()
  }

  updateCameraUI() {
    if (!this.cameras.length) return
    
    const progress = ((this.currentCameraIndex + 1) / this.cameras.length) * 100
    const pattern = this.cameraPatterns[this.currentCameraPattern]
    const currentCameraData = this.cameras[this.currentCameraIndex]
    
    // React状態を更新
    this.updateState({
      currentCamera: `${currentCameraData.name} / ${this.cameras.length}`,
      cameraDetails: `距離: ${currentCameraData.distance.toFixed(2)}m | FOV: ${currentCameraData.fov.toFixed(1)}°`,
      currentPattern: `パターン${this.currentCameraPattern}: ${pattern.description} (${this.cameras.length}台)`,
      currentSpacing: `間隔: ${pattern.spacing}`,
      progressWidth: `${progress}%`
    })
  }

  switchCameraPattern() {
    this.currentCameraPattern = (this.currentCameraPattern % 3) + 1
    console.log(`🔄 カメラパターン変更: パターン${this.currentCameraPattern}`)
    this.setupCameraSystem()
  }

  getCurrentCamera() {
    return this.cameras.length ? this.cameras[this.currentCameraIndex].camera : null
  }

  setupEventListeners() {
    const handleKeyDown = (event) => {
      switch(event.code) {
        case 'ArrowLeft':
          if (this.cameras.length) {
            this.currentCameraIndex = (this.currentCameraIndex - 1 + this.cameras.length) % this.cameras.length
            this.updateCameraUI()
            console.log(`⬅️ ${this.cameras[this.currentCameraIndex].name}`)
          }
          break
        case 'ArrowRight':
          if (this.cameras.length) {
            this.currentCameraIndex = (this.currentCameraIndex + 1) % this.cameras.length
            this.updateCameraUI()
            console.log(`➡️ ${this.cameras[this.currentCameraIndex].name}`)
          }
          break
        case 'KeyR':
          this.currentCameraIndex = 0
          this.updateCameraUI()
          console.log('🔄 リセット')
          break
        case 'KeyP':
          this.switchCameraPattern()
          break
        case 'Digit1': case 'Digit2': case 'Digit3':
        case 'Digit4': case 'Digit5': case 'Digit6':
        case 'Digit7': case 'Digit8': case 'Digit9':
          const num = parseInt(event.code.slice(-1)) - 1
          if (num < this.cameras.length) {
            this.currentCameraIndex = num
            this.updateCameraUI()
            console.log(`🔢 ${this.cameras[this.currentCameraIndex].name}`)
          }
          break
      }
    }

    const handleResize = () => {
      this.cameras.forEach(camData => {
        camData.camera.aspect = window.innerWidth / window.innerHeight
        camData.camera.updateProjectionMatrix()
      })
      
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      console.log(`📱 リサイズ対応: ${window.innerWidth}x${window.innerHeight}`)
    }

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)

    // クリーンアップ用の削除関数を返す
    this.removeEventListeners = () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }

  animate = () => {
    const deltaTime = this.clock.getDelta()
    
    // プレイヤーアニメーション更新
    this.animationMixers.forEach(mixer => {
      mixer.update(deltaTime)
    })
    
    // 現在のカメラで描画
    const activeCamera = this.getCurrentCamera()
    if (activeCamera) {
      this.renderer.render(this.scene, activeCamera)
    }
    
    this.animationId = requestAnimationFrame(this.animate)
  }

  dispose() {
    // クリーンアップ
    if (this.removeEventListeners) {
      this.removeEventListeners()
    }
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    
    if (this.renderer) {
      this.renderer.dispose()
    }
    
    console.log('🧹 Three.jsクリーンアップ完了')
  }
}

export default TennisCourtBulletTime