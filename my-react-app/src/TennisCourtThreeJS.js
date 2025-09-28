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
    this.animationMixers = []
    // プレイヤーデフォルト位置（builtinパターン復帰用）
    this.defaultPlayerPositions = [
      { x: 0, y: 0, z: -5.9 },
      { x: 0, y: 0, z: 5.9 }
    ]
    // フォーカス
    this.currentFocusIndex = 0
    // === パターン管理統合 ===
    const builtinDefs = {
      1: { name: 'カメラ間隔: 0.75m', autoScaleFOV: true, positions: [
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
      ]},
      2: { name: 'カメラ間隔: 1.5m', autoScaleFOV: true, positions: [
        { x: 5.485, y: 0.0, z: 0.97 }, { x: 5.485, y: 1.5, z: 0.97 }, { x: 5.485, y: 3.0, z: 0.97 },
        { x: 5.485, y: 4.5, z: 0.97 }, { x: 5.485, y: 6.0, z: 0.97 }, { x: 5.485, y: 7.5, z: 0.97 },
        { x: 5.485, y: 9.0, z: 0.97 }, { x: 5.485, y: 10.5, z: 0.97 }, { x: 5.37, y: 11.885, z: 0.97 },
        { x: 3.87, y: 11.885, z: 0.97 }, { x: 2.37, y: 11.885, z: 0.97 }, { x: 0.87, y: 11.885, z: 0.97 },
        { x: -0.63, y: 11.885, z: 0.97 }, { x: -2.13, y: 11.885, z: 0.97 }, { x: -3.63, y: 11.885, z: 0.97 },
        { x: -5.13, y: 11.885, z: 0.97 }, { x: -5.485, y: 10.74, z: 0.97 }, { x: -5.485, y: 9.24, z: 0.97 },
        { x: -5.485, y: 7.74, z: 0.97 }, { x: -5.485, y: 6.24, z: 0.97 }, { x: -5.485, y: 4.74, z: 0.97 },
        { x: -5.485, y: 3.24, z: 0.97 }, { x: -5.485, y: 1.74, z: 0.97 }, { x: -5.485, y: 0.24, z: 0.97 }
      ]},
      3: { name: 'カメラ間隔: 3.0m', autoScaleFOV: true, positions: [
        { x: 5.485, y: 0.0, z: 0.97 }, { x: 5.485, y: 3.0, z: 0.97 }, { x: 5.485, y: 6.0, z: 0.97 },
        { x: 5.485, y: 9.0, z: 0.97 }, { x: 5.37, y: 11.885, z: 0.97 }, { x: 2.37, y: 11.885, z: 0.97 },
        { x: -0.63, y: 11.885, z: 0.97 }, { x: -3.63, y: 11.885, z: 0.97 }, { x: -5.485, y: 10.74, z: 0.97 },
        { x: -5.485, y: 7.74, z: 0.97 }, { x: -5.485, y: 4.74, z: 0.97 }, { x: -5.485, y: 1.74, z: 0.97 }
      ]}
    }
    this.patterns = Object.entries(builtinDefs).map(([k,v]) => ({
      id: `builtin-${k}`,
      legacyId: Number(k),
      kind: 'builtin',
      name: v.name,
      autoScaleFOV: v.autoScaleFOV !== false,
      positions: v.positions.map(p=>({x:p.x,y:p.y,z:p.z})),
      players: null
    }))
    this.activePatternId = this.patterns[0]?.id || null
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

    // テニスコート生成
    this.createTennisCourt()
    // イベント
    this.setupEventListeners()
    // 非同期プレイヤー&カメラ初期化
    this.setupPlayers()
    // ループ開始
    this.animate()
  }
  // ==== テニスコート生成 ====
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

  // ==== パターン統合 CRUD ==== 
  addCustomPattern(pattern) {
    if (!pattern || !Array.isArray(pattern.positions)) return { ok:false, reason:'positions 配列が必要'}
    const name = pattern.name || `Custom-${Date.now()}`
    if (this.patterns.find(p=>p.name === name)) return { ok:false, reason:'同名パターンが既に存在' }
    const custom = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      kind: 'custom',
      name,
      autoScaleFOV: pattern.autoScaleFOV !== false,
      positions: pattern.positions.map(pos=>({x:+pos.x||0, y:+pos.y||0, z:+pos.z||0})),
      players: Array.isArray(pattern.players)? pattern.players.slice(0,2).map(pl=>({x:+pl.x||0,y:+pl.y||0,z:+pl.z||0})) : null
    }
    this.patterns.push(custom)
    this.updateState && this.updateState({ customPatterns: this.patterns.filter(p=>p.kind==='custom').map(p=>({...p})) })
    return { ok:true, name }
  }

  listPatterns() {
    return this.patterns.map(p=>({
      key: p.id,
      type: p.kind,
      id: p.kind==='builtin' ? p.legacyId : undefined,
      name: p.name,
      autoScaleFOV: p.autoScaleFOV !== false
    }))
  }

  applyPattern(identifier) {
    let target = null
    if (typeof identifier === 'number') {
      target = this.patterns.find(p=>p.kind==='builtin' && p.legacyId===identifier)
    } else if (typeof identifier === 'string') {
      target = this.patterns.find(p=>p.name===identifier || p.id===identifier)
    }
    if (!target) return { ok:false, reason:'パターン未検出' }
    this.activePatternId = target.id
    if (target.kind==='builtin') this.resetPlayersToDefault()
    else if (target.kind==='custom') this.repositionPlayersFromPattern(target)
    this.setupCameraSystem(true)
    this.updateCameraUI()
    return { ok:true }
  }

  deleteCustomPattern(name) {
    const idx = this.patterns.findIndex(p=>p.kind==='custom' && p.name===name)
    if (idx === -1) return { ok:false, reason:'対象なし' }
    const wasActive = this.patterns[idx].id === this.activePatternId
    this.patterns.splice(idx,1)
    if (wasActive) {
      const fallback = this.patterns.find(p=>p.kind==='builtin') || this.patterns[0] || null
      this.activePatternId = fallback? fallback.id : null
      if (fallback) {
        if (fallback.kind==='builtin') this.resetPlayersToDefault(); else this.repositionPlayersFromPattern(fallback)
        this.setupCameraSystem(true)
      } else {
        this.cameras = []
      }
    }
    this.updateState && this.updateState({ customPatterns: this.patterns.filter(p=>p.kind==='custom').map(p=>({...p})) })
    this.updateCameraUI()
    return { ok:true }
  }

  deleteBuiltinPattern(id) {
    const idx = this.patterns.findIndex(p=>p.kind==='builtin' && p.legacyId===id)
    if (idx === -1) return { ok:false, reason:'対象なし' }
    const wasActive = this.patterns[idx].id === this.activePatternId
    this.patterns.splice(idx,1)
    if (wasActive) {
      const fallback = this.patterns.find(p=>p.kind==='builtin') || this.patterns[0] || null
      this.activePatternId = fallback? fallback.id : null
      if (fallback) {
        if (fallback.kind==='builtin') this.resetPlayersToDefault(); else this.repositionPlayersFromPattern(fallback)
        this.setupCameraSystem(true)
      } else {
        this.cameras = []
      }
    }
    this.updateCameraUI()
    return { ok:true }
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

  // プレイヤー再配置（カスタムパターン）
  repositionPlayersFromPattern(pattern) {
    if (!pattern || !Array.isArray(pattern.players) || pattern.players.length === 0) return
    if (this.player1Group && pattern.players[0]) {
      const p1 = pattern.players[0]
      this.player1Group.position.set(p1.x, p1.y, p1.z)
    }
    if (this.player2Group && pattern.players[1]) {
      const p2 = pattern.players[1]
      this.player2Group.position.set(p2.x, p2.y, p2.z)
    }
    this.updateFocusTargetsPositions()
  }

  // デフォルト位置に戻す（ビルトイン適用時）
  resetPlayersToDefault() {
    if (this.player1Group) {
      const d1 = this.defaultPlayerPositions[0]
      this.player1Group.position.set(d1.x, d1.y, d1.z)
    }
    if (this.player2Group) {
      const d2 = this.defaultPlayerPositions[1]
      this.player2Group.position.set(d2.x, d2.y, d2.z)
    }
    this.updateFocusTargetsPositions()
  }

  updateFocusTargetsPositions() {
    if (!this.focusTargets || this.focusTargets.length < 2) return
    // プレイヤー1 / 2 の位置を反映（存在する場合）
    if (this.player1Group) {
      this.focusTargets[0].position.copy(this.player1Group.position).add(new THREE.Vector3(0,1.0,0))
    }
    if (this.player2Group) {
      this.focusTargets[1].position.copy(this.player2Group.position).add(new THREE.Vector3(0,1.0,0))
    }
  }


  getActivePattern() {
    return this.patterns.find(p=>p.id===this.activePatternId) || null
  }

  setupCameraSystem() {
    if (!this.player1Group) return
    const activePattern = this.getActivePattern()
    if (!activePattern) return
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
  this.cameras.push({ camera, angle: (i / cameraCount) * Math.PI * 2, distance, fov: adjustedFOV })
    }
    console.log(`🎬 カメラ再構築: ${cameraCount}台 (${activePattern.name})`)
    this.updateCameraUI()
  }

  updateCameraUI() {
    if (!this.cameras.length) return
    const progress = ((this.currentCameraIndex + 1) / this.cameras.length) * 100
    const activePattern = this.getActivePattern()
    if (!activePattern) return
    const currentCameraData = this.cameras[this.currentCameraIndex]
    const currentFocus = this.getCurrentFocusTarget()
    this.updateState({
      currentCamera: `カメラ ${this.currentCameraIndex + 1} / ${this.cameras.length}`,
      cameraDetails: `距離: ${currentCameraData.distance.toFixed(2)}m | FOV: ${currentCameraData.fov.toFixed(1)}° | フォーカス: ${currentFocus?.name || 'なし'}`,
      currentPattern: `${activePattern.name}`,
      progressWidth: `${progress}%`
    })
  }

  togglePatternAutoScale(identifier) {
    let target = null
    if (typeof identifier === 'number') {
      target = this.patterns.find(p=>p.kind==='builtin' && p.legacyId===identifier)
    } else if (typeof identifier === 'string') {
      target = this.patterns.find(p=>p.name===identifier || p.id===identifier)
    }
    if (!target) return { ok:false }
    target.autoScaleFOV = !(target.autoScaleFOV !== false)
    if (target.id === this.activePatternId) {
      this.setupCameraSystem()
    }
    if (target.kind==='custom') {
      this.updateState && this.updateState({ customPatterns: this.patterns.filter(p=>p.kind==='custom').map(p=>({...p})) })
    }
    return { ok:true, value: target.autoScaleFOV !== false }
  }

  switchCameraPattern() {
    const builtins = this.patterns.filter(p=>p.kind==='builtin').sort((a,b)=>a.legacyId-b.legacyId)
    if (!builtins.length) {
      console.warn('⚠️ ビルトインパターンが存在しません')
      return
    }
    const active = this.getActivePattern()
    if (!active || active.kind !== 'builtin') {
      this.activePatternId = builtins[0].id
      this.resetPlayersToDefault()
    } else {
      const idx = builtins.findIndex(p=>p.id===active.id)
      const next = builtins[(idx+1)%builtins.length]
      this.activePatternId = next.id
      this.resetPlayersToDefault()
      console.log(`🔄 カメラパターン変更: ${next.name}`)
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
          }
          break
        case 'ArrowRight':
          if (this.cameras.length) {
            this.currentCameraIndex = (this.currentCameraIndex + 1) % this.cameras.length
            this.updateCameraUI()
          }
          break
        case 'KeyR':
          this.currentCameraIndex = 0
          this.updateCameraUI()
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