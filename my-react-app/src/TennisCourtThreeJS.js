// Three.jsテニスコート3D バレットタイム映像システム
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

class TennisCourtBulletTime {
  constructor(canvas, updateStateCallback) {
    this.canvas = canvas
    this.updateState = updateStateCallback

    // コア要素
    this.scene = new THREE.Scene()
  this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true })
  this.renderer.setSize(window.innerWidth, window.innerHeight)
  // 背景を透明にしてCSSグラデーション(body背景)を活かす
  this.renderer.setClearColor(0x000000, 0)
    this.renderer.shadowMap.enabled = true
    this.clock = new THREE.Clock()
    this.gltfLoader = new GLTFLoader()

    // カメラ関連
    this.cameras = []
    this.currentCameraIndex = 0
    this.currentCameraPattern = 3 // デフォルトパターン
    this.animationMixers = []

    // フォーカス
    this.currentFocusIndex = 0

    // パターン管理
    this.customPatterns = []
    this.activeCustomPattern = null // 適用中のカスタムパターン（優先）

    // ビルトインパターン（インスタンスプロパティ化: トグル状態保持のため）
    this.cameraPatterns = {
      1: {
        description: '高密度配置',
        autoScaleFOV: true,
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
      2: {
        description: '中密度配置',
        autoScaleFOV: true,
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
      3: {
        description: '低密度配置',
        autoScaleFOV: true,
        positions: [
          { x: 5.485, y: 0.0, z: 0.97 }, { x: 5.485, y: 3.0, z: 0.97 }, { x: 5.485, y: 6.0, z: 0.97 },
          { x: 5.485, y: 9.0, z: 0.97 }, { x: 5.37, y: 11.885, z: 0.97 }, { x: 2.37, y: 11.885, z: 0.97 },
          { x: -0.63, y: 11.885, z: 0.97 }, { x: -3.63, y: 11.885, z: 0.97 }, { x: -5.485, y: 10.74, z: 0.97 },
          { x: -5.485, y: 7.74, z: 0.97 }, { x: -5.485, y: 4.74, z: 0.97 }, { x: -5.485, y: 1.74, z: 0.97 }
        ]
      }
    }

    // ライティング
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambient)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -15
    directionalLight.shadow.camera.right = 15
    directionalLight.shadow.camera.top = 15
    directionalLight.shadow.camera.bottom = -15
    this.scene.add(directionalLight)

    // コート生成
    this.createTennisCourt()

    // イベント
    this.setupEventListeners()

    // 非同期プレイヤー&カメラ初期化
    this.setupPlayers()

    // ループ開始
    this.animate()
  }

  // ==== カスタムパターン CRUD ====
  addCustomPattern(pattern) {
    if (!pattern || !Array.isArray(pattern.positions)) return { ok: false, reason: 'positions 配列が必要' }
    const name = pattern.name || `Custom-${Date.now()}`
    if (this.customPatterns.find(p => p.name === name)) return { ok: false, reason: '同名パターンが既に存在' }
    const normalized = {
      name,
      description: pattern.description || '',
      spacing: pattern.spacing || '',
      autoScaleFOV: pattern.autoScaleFOV !== false, // デフォルトtrue
      positions: pattern.positions.map(pos => ({ x: +pos.x || 0, y: +pos.y || 0, z: +pos.z || 0 }))
    }
    this.customPatterns.push(normalized)
    this.updateState && this.updateState({ customPatterns: this.customPatterns.slice() })
    return { ok: true, name }
  }

  listPatterns() {
    const builtins = Object.entries(this.cameraPatterns).map(([id, p]) => ({
      key: `builtin-${id}`,
      id: Number(id),
      type: 'builtin',
      name: `標準パターン${id}`,
      description: p.description,
      count: p.positions.length,
      autoScaleFOV: p.autoScaleFOV !== false
    }))
    const customs = this.customPatterns.map(p => ({
      key: `custom-${p.name}`,
      type: 'custom',
      name: p.name,
      description: p.description,
      count: p.positions.length,
      autoScaleFOV: p.autoScaleFOV !== false
    }))
    return [...builtins, ...customs]
  }

  applyPattern(identifier) {
    if (typeof identifier === 'number') {
      if (!this.cameraPatterns[identifier]) return { ok: false, reason: '存在しないビルトインID' }
      this.currentCameraPattern = identifier
      this.activeCustomPattern = null
    } else if (typeof identifier === 'string') {
      const custom = this.customPatterns.find(p => p.name === identifier)
      if (!custom) return { ok: false, reason: '存在しないカスタム名' }
      this.activeCustomPattern = custom
    } else {
      return { ok: false, reason: '不正なidentifier' }
    }
    this.setupCameraSystem(true)
    this.updateCameraUI()
    return { ok: true }
  }

  deleteCustomPattern(name) {
    const idx = this.customPatterns.findIndex(p => p.name === name)
    if (idx === -1) return { ok: false, reason: '対象なし' }
    const isActive = this.activeCustomPattern && this.activeCustomPattern.name === name
    this.customPatterns.splice(idx, 1)
    if (isActive) {
      this.activeCustomPattern = null
      this.setupCameraSystem(true)
    }
    this.updateState && this.updateState({ customPatterns: this.customPatterns.slice() })
    this.updateCameraUI()
    return { ok: true }
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
      
      const gltf = await new Promise((resolve, reject) => {
        this.gltfLoader.load(
          modelUrl,
          (gltf) => resolve(gltf),
          (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(1)
            console.log(`📥 ${name}読み込み進捗: ${percent}%`)
          },
          (error) => reject(error)
        )
      })
      
      const model = gltf.scene
      
      // モデルのスケール調整
      const box = new THREE.Box3().setFromObject(model)
      const modelHeight = box.max.y - box.min.y
      const targetHeight = 1.8
      const scale = targetHeight / modelHeight
      model.scale.setScalar(scale)
      
      // 影の設定
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      playerGroup.add(model)
      
      // アニメーション設定（停止状態に設定）
      if (gltf.animations && gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model)
        // アニメーションを追加はするが、再生はしない（停止状態）
        gltf.animations.forEach((clip, index) => {
          const action = mixer.clipAction(clip)
          // 最初のフレームで停止
          action.time = 0
          action.enabled = false // アニメーションを無効化
        })
        playerGroup.userData.mixer = mixer
      }
      
      console.log(`✅ ${name}の3Dモデル読み込み成功!`)
      
    } catch (error) {
      console.warn(`⚠️ ${name}の3Dモデル読み込み失敗:`, error)
      
      // フォールバック: シンプルなボックス
      console.log(`🔄 ${name}のフォールバックモデル作成`)
      const geometry = new THREE.BoxGeometry(0.4, 1.8, 0.3)
      const material = new THREE.MeshLambertMaterial({ 
        color: name.includes('1') ? 0x3B82F6 : 0xEF4444 
      })
      const playerBox = new THREE.Mesh(geometry, material)
      playerBox.position.y = 0.9
      playerBox.castShadow = true
      playerBox.receiveShadow = true
      
      playerGroup.add(playerBox)
    }
    
    playerGroup.position.set(position.x, position.y, position.z)
    playerGroup.rotation.y = rotation
    
    return playerGroup
  }

  async setupPlayers() {
    try {
      console.log('👥 プレイヤー配置開始...')
      
      // プレイヤーモデルのURL（index.htmlと同じ）
      const playerModelUrl = 'https://threejs.org/examples/models/gltf/Xbot.glb'
      
      // プレイヤー1（フォーカス対象）
      this.player1Group = await this.loadPlayerModel(
        playerModelUrl,
        'プレイヤー1',
        { x: 0, y: 0, z: -5.9 },
        0
      )
      
      if (this.player1Group) {
        this.scene.add(this.player1Group)
        // アニメーションミキサーが存在する場合は追加するが、アニメーションは停止状態のまま
        if (this.player1Group.userData.mixer) {
          this.animationMixers.push(this.player1Group.userData.mixer)
        }
      }
      
      // プレイヤー2
      this.player2Group = await this.loadPlayerModel(
        playerModelUrl,
        'プレイヤー2',
        { x: 0, y: 0, z: 5.9 },
        Math.PI
      )
      
      if (this.player2Group) {
        this.scene.add(this.player2Group)
        // アニメーションミキサーが存在する場合は追加するが、アニメーションは停止状態のまま
        if (this.player2Group.userData.mixer) {
          this.animationMixers.push(this.player2Group.userData.mixer)
        }
      }
      
      // フォーカス対象を初期化
      this.initializeFocusTargets()
      
      // カメラシステム初期化
      this.setupCameraSystem()
      this.updateCameraUI()
      
      console.log('✅ プレイヤー配置完了!')
      
    } catch (error) {
      console.error('❌ プレイヤー配置エラー:', error)
    }
  }

  // フォーカス対象を初期化する関数
  initializeFocusTargets() {
    this.focusTargets = [
      {
        name: 'プレイヤー1',
        position: new THREE.Vector3(0, 1.0, -5.9),
        object: this.player1Group
      },
      {
        name: 'プレイヤー2', 
        position: new THREE.Vector3(0, 1.0, 5.9),
        object: this.player2Group
      },
      {
        name: 'コート中央',
        position: new THREE.Vector3(0, 0.5, 0),
        object: null
      },
      {
        name: 'ネット',
        position: new THREE.Vector3(0, 0.914, 0),
        object: null
      }
    ]
    
    console.log(`🎯 フォーカス対象初期化完了: ${this.focusTargets.length}箇所`)
  }

  // 現在のフォーカス対象を取得
  getCurrentFocusTarget() {
    return this.focusTargets[this.currentFocusIndex] || this.focusTargets[0]
  }

  // フォーカスを切り替える関数
  switchFocus() {
    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusTargets.length
    const currentFocus = this.getCurrentFocusTarget()
    
    // カメラの向きを新しいフォーカス対象に更新
    this.updateCameraFocus()
    
    console.log(`🎯 フォーカス切り替え: ${currentFocus.name}`)
    this.updateCameraUI()
  }

  // 全カメラの向きをフォーカス対象に更新
  updateCameraFocus() {
    const focusTarget = this.getCurrentFocusTarget()
    
    this.cameras.forEach(cameraData => {
      cameraData.camera.lookAt(focusTarget.position)
    })
  }


  setupCameraSystem() {
    if (!this.player1Group) return
    const activePattern = this.activeCustomPattern || this.cameraPatterns[this.currentCameraPattern]
    const cameraPositions = activePattern.positions || []
    const targetPosition = new THREE.Vector3(0, 1.0, 5.9)
    const cameraCount = cameraPositions.length
    this.cameras = []
    this.currentCameraIndex = 0

    if (!cameraCount) {
      console.warn('⚠️ カメラポジションが空')
      return
    }

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
  const useAuto = activePattern.autoScaleFOV !== false
    for (let i = 0; i < cameraCount; i++) {
  const { pos, distance } = cameraData[i]
  const adjustedFOV = useAuto ? baseFOV * (minDistance / distance) : baseFOV
      const camera = new THREE.PerspectiveCamera(adjustedFOV, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.set(pos.x, pos.z, pos.y)
      const initialFocus = this.getCurrentFocusTarget()
      camera.lookAt(initialFocus?.position || targetPosition)
      this.cameras.push({ camera, angle: (i / cameraCount) * Math.PI * 2, name: `カメラ ${i + 1}`, distance, fov: adjustedFOV })
    }
    console.log(`🎬 カメラ再構築: ${cameraCount}台 (${this.activeCustomPattern ? 'カスタム: ' + this.activeCustomPattern.name : 'パターン' + this.currentCameraPattern})`)
    this.updateCameraUI()
  }

  updateCameraUI() {
    if (!this.cameras.length) return
    const progress = ((this.currentCameraIndex + 1) / this.cameras.length) * 100
    const activePattern = this.activeCustomPattern || this.cameraPatterns[this.currentCameraPattern]
    const currentCameraData = this.cameras[this.currentCameraIndex]
    const currentFocus = this.getCurrentFocusTarget()
    const patternLabel = this.activeCustomPattern ? `カスタム: ${activePattern.name}` : `パターン${this.currentCameraPattern}: ${activePattern.description}`
    this.updateState({
      currentCamera: `${currentCameraData.name} / ${this.cameras.length}`,
      cameraDetails: `距離: ${currentCameraData.distance.toFixed(2)}m | FOV: ${currentCameraData.fov.toFixed(1)}°${activePattern.autoScaleFOV === false ? ' (固定)' : ''} | フォーカス: ${currentFocus?.name || 'なし'}`,
      currentPattern: `${patternLabel} (${this.cameras.length}台)`,
      currentSpacing: `間隔: ${activePattern.spacing || '-'} `,
      progressWidth: `${progress}%`,
      focusTarget: currentFocus?.name || ''
    })
  }

  togglePatternAutoScale(identifier) {
    // identifier: builtin id (number) or custom name (string)
    if (typeof identifier === 'number') {
      const p = this.cameraPatterns[identifier]
      if (!p) return { ok: false }
      p.autoScaleFOV = !(p.autoScaleFOV !== false)
      if (!this.activeCustomPattern && this.currentCameraPattern === identifier) {
        this.setupCameraSystem()
      }
      return { ok: true, value: p.autoScaleFOV !== false }
    } else if (typeof identifier === 'string') {
      const c = this.customPatterns.find(p => p.name === identifier)
      if (!c) return { ok: false }
      c.autoScaleFOV = !(c.autoScaleFOV !== false)
      if (this.activeCustomPattern && this.activeCustomPattern.name === identifier) {
        this.setupCameraSystem()
      }
      this.updateState && this.updateState({ customPatterns: this.customPatterns.slice() })
      return { ok: true, value: c.autoScaleFOV !== false }
    }
    return { ok: false }
  }

  switchCameraPattern() {
    if (this.activeCustomPattern) {
      // カスタム適用中は解除してビルトインサイクルへ戻す
      this.activeCustomPattern = null
      console.log('🔄 カスタム解除しビルトインへ')
    } else {
      this.currentCameraPattern = (this.currentCameraPattern % 3) + 1
      console.log(`🔄 カメラパターン変更: パターン${this.currentCameraPattern}`)
    }
    this.setupCameraSystem()
  }

  getCurrentCamera() { return this.cameras.length ? this.cameras[this.currentCameraIndex].camera : null }

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
        case 'KeyF':
          this.switchFocus()
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
    
    // プレイヤーアニメーション更新（停止状態のため更新しない）
    // this.animationMixers.forEach(mixer => {
    //   mixer.update(deltaTime)
    // })
    
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