// Three.jsテニスコート3D バレットタイム映像システム
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { nodeArray } from 'three/src/nodes/TSL.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js' // 新: clone を利用

class TennisCourtBulletTime {
  constructor(canvas, updateStateCallback) {
    this.canvas = canvas
    this.updateState = updateStateCallback
    // コア要素
    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    // 背景を透明にしてCSSグラデーション(body背景)を活かす
    this.renderer.setClearColor(0x87CEEB, 1)
    this.renderer.shadowMap.enabled = true
    this.clock = new THREE.Clock()
    this.gltfLoader = new GLTFLoader()
    // カメラ
    this.state = {
      cameras: [],
      players: [],
      positions: new Map(),
      positionOrder: [],
      activeCameraId: 0,
      activeFocusId: 0,
      activePositionId: 0,
      nextPositionId: 0
    }
    //デフォルトポジション
    const defaultPositions = [
      { 
        positionName: 'カメラ間隔: 0.75m', 
        autoScaleFOV: true, 
        cameras: [
          { x: 5.485, y: 0.97, z: 0.0 }, { x: 5.485, y: 0.97, z: 0.75 }, { x: 5.485, y: 0.97, z: 1.5 },
          { x: 5.485, y: 0.97, z: 2.25 }, { x: 5.485, y: 0.97, z: 3.0 }, { x: 5.485, y: 0.97, z: 3.75 },
          { x: 5.485, y: 0.97, z: 4.5 }, { x: 5.485, y: 0.97, z: 5.25 }, { x: 5.485, y: 0.97, z: 6.0 },
          { x: 5.485, y: 0.97, z: 6.75 }, { x: 5.485, y: 0.97, z: 7.5 }, { x: 5.485, y: 0.97, z: 8.25 },
          { x: 5.485, y: 0.97, z: 9.0 }, { x: 5.485, y: 0.97, z: 9.75 }, { x: 5.485, y: 0.97, z: 10.5 },
          { x: 5.485, y: 0.97, z: 11.25 }, { x: 5.37, y: 0.97, z: 11.885 }, { x: 4.62, y: 0.97, z: 11.885 },
          { x: 3.87, y: 0.97, z: 11.885 }, { x: 3.12, y: 0.97, z: 11.885 }, { x: 2.37, y: 0.97, z: 11.885 },
          { x: 1.62, y: 0.97, z: 11.885 }, { x: 0.87, y: 0.97, z: 11.885 }, { x: 0.12, y: 0.97, z: 11.885 },
          { x: -0.63, y: 0.97, z: 11.885 }, { x: -1.38, y: 0.97, z: 11.885 }, { x: -2.13, y: 0.97, z: 11.885 },
          { x: -2.88, y: 0.97, z: 11.885 }, { x: -3.63, y: 0.97, z: 11.885 }, { x: -4.38, y: 0.97, z: 11.885 },
          { x: -5.13, y: 0.97, z: 11.885 }, { x: -5.485, y: 0.97, z: 11.49 }, { x: -5.485, y: 0.97, z: 10.74 },
          { x: -5.485, y: 0.97, z: 9.99 }, { x: -5.485, y: 0.97, z: 9.24 }, { x: -5.485, y: 0.97, z: 8.49 },
          { x: -5.485, y: 0.97, z: 7.74 }, { x: -5.485, y: 0.97, z: 6.99 }, { x: -5.485, y: 0.97, z: 6.24 },
          { x: -5.485, y: 0.97, z: 5.49 }, { x: -5.485, y: 0.97, z: 4.74 }, { x: -5.485, y: 0.97, z: 3.99 },
          { x: -5.485, y: 0.97, z: 3.24 }, { x: -5.485, y: 0.97, z: 2.49 }, { x: -5.485, y: 0.97, z: 1.74 },
          { x: -5.485, y: 0.97, z: 0.99 }, { x: -5.485, y: 0.97, z: 0.24 }],
        players: [
          { x: 0, y: 0, z: -5.9 }, { x: 0, y: 0, z: 5.9, rot: 180 }]
      },
      {
        positionName: 'カメラ間隔: 1.5m', 
        autoScaleFOV: true, 
        cameras: [
          { x: 5.485, y: 0.97, z: 0.0 }, { x: 5.485, y: 0.97, z: 1.5 }, { x: 5.485, y: 0.97, z: 3.0 },
          { x: 5.485, y: 0.97, z: 4.5 }, { x: 5.485, y: 0.97, z: 6.0 }, { x: 5.485, y: 0.97, z: 7.5 },
          { x: 5.485, y: 0.97, z: 9.0 }, { x: 5.485, y: 0.97, z: 10.5 }, { x: 5.37, y: 0.97, z: 11.885 },
          { x: 3.87, y: 0.97, z: 11.885 }, { x: 2.37, y: 0.97, z: 11.885 }, { x: 0.87, y: 0.97, z: 11.885 },
          { x: -0.63, y: 0.97, z: 11.885 }, { x: -2.13, y: 0.97, z: 11.885 }, { x: -3.63, y: 0.97, z: 11.885 },
          { x: -5.13, y: 0.97, z: 11.885 }, { x: -5.485, y: 0.97, z: 10.74 }, { x: -5.485, y: 0.97, z: 9.24 },
          { x: -5.485, y: 0.97, z: 7.74 }, { x: -5.485, y: 0.97, z: 6.24 }, { x: -5.485, y: 0.97, z: 4.74 },
          { x: -5.485, y: 0.97, z: 3.24 }, { x: -5.485, y: 0.97, z: 1.74 }, { x: -5.485, y: 0.97, z: 0.24 }],
        players: [
          { x: 0, y: 0, z: -5.9 }, { x: 0, y: 0, z: 5.9, rot: 180 }]  
      },
      {
        positionName: 'カメラ間隔: 3.0m', 
        autoScaleFOV: true, 
        cameras: [
          { x: 5.485, y: 0.97, z: 0.0 }, { x: 5.485, y: 0.97, z: 3.0 }, { x: 5.485, y: 0.97, z: 6.0 },
          { x: 5.485, y: 0.97, z: 9.0 }, { x: 5.37, y: 0.97, z: 11.885 }, { x: 2.37, y: 0.97, z: 11.885 },
          { x: -0.63, y: 0.97, z: 11.885 }, { x: -3.63, y: 0.97, z: 11.885 }, { x: -5.485, y: 0.97, z: 10.74 },
          { x: -5.485, y: 0.97, z: 7.74 }, { x: -5.485, y: 0.97, z: 4.74 }, { x: -5.485, y: 0.97, z: 1.74 }],
        players: [
          { x: 0, y: 0, z: -6.5 }, { x: 0, y: 0, z: 6.5, rot: 180 }]      
      }
    ]
    // デフォルトポジション登録
    defaultPositions.forEach(p => this.addPosition(p))
    // ライティング
    this.setupLighting()
    // テニスコート生成
    this.setupTennisCourt()
    // カメラ・プレイヤー初期化
    this.setupInitialPosition()
    // イベント
    this.setupEventListeners()
  }
  // ポジションIDを生成
  generateNextPositionId() {
    return this.state.nextPositionId++
  }

  //セッターとゲッター
  // アクティブポジションID
  setActivePositionId(id) {
    this.state.activePositionId = id
    this.setupPosition() // ポジション再設定
    this.setupUI() // UI更新
  }
  getActivePositionId() {
    return this.state.activePositionId
  }
  // アクティブカメラID
  setActiveCameraId(id) {
    this.state.activeCameraId = id
    this.setupUI() // UI更新
  }
  getActiveCameraId() {
    return this.state.activeCameraId
  }
  // アクティブフォーカスID
  setActiveFocusId(id) {
    this.state.activeFocusId = id
    this.changeFocus()
    this.setupUI() // UI更新
  }
  getActiveFocusId() {
    return this.state.activeFocusId
  }

  // アクティブポジションの取得
  getActivePosition() {
    return this.state.positions.get(this.getActivePositionId())
  }
  // 全ポジション名の取得
  getAllPositions() {
    return Array.from(this.state.positions.entries()).map(([id, p]) => ({
      id,
      positionName: p.positionName,
      autoScaleFOV: p.autoScaleFOV
    }))
  }

  // アクティブカメラの取得
  getActiveCamera() {
    return this.state.cameras[this.getActiveCameraId()]
  }
  // アクティブフォーカスの取得
  getActiveFocus() {
    const basePos = this.state.players[this.getActiveFocusId()].position;
    return new THREE.Vector3(basePos.x, basePos.y + 0.9, basePos.z);
  }

  // ポジション配列に登録
  addPosition(position) {
    if(!position.positionName) throw new Error(`positionName がありません`)
    if(!position.cameras) throw new Error(`cameras がありません`)
    if(!position.players) throw new Error(`players がありません`)

    const id = this.generateNextPositionId()
    this.state.positions.set(
      id, {
      positionName: position.positionName,
      autoScaleFOV: position.autoScaleFOV,
      cameras: position.cameras,
      players: position.players
    })
    this.state.positionOrder.push(id)
  }
  // Json形式のポジションデータをポジション配列に追加
  loadJsonPosition(data) {
    try {
      // 文字列で渡された場合はオブジェクトにパース
      const position = (typeof data === "string") 
        ? JSON.parse(data) 
        : data
      // addPositionを利用して登録
      this.addPosition(position)
      this.setupUI() // UI更新
      console.log(`✅ ポジション追加: ${position.positionName}`)
    } catch (error) {
      console.error("⚠️ JSON読み込みエラー:", error)
    }
  }

  deletePosition(id) {
    this.state.positions.delete(id)
    this.state.positionOrder = this.state.positionOrder.filter(pid => pid !== id)
    this.setupUI() // UI更新
  }

  // ==== ライティング設定 ====
  setupLighting() {
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
  }
  // ==== テニスコート生成 ====
  setupTennisCourt() {
    const courtGroup = new THREE.Group()
    // コート寸法（国際規格、単位:m）
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
    // シーンに追加
    this.scene.add(courtGroup)
  }
  // ==== 初期ポジション設定 ====
  async setupInitialPosition() {
    const basePlayerModelUrl = 'https://threejs.org/examples/models/gltf/Xbot.glb' // プレイヤーモデルのURL
    const player = new THREE.Group()
    try {
      console.log(`🔄 ベースプレイヤーの3Dモデル読み込み開始`)
      // GLTFモデル読み込み
      const gltf = await new Promise((resolve, reject) => {
        this.gltfLoader.load(
          basePlayerModelUrl,
          (gltf) => resolve(gltf),
          undefined,
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
      player.add(model)
      this.basePlayerModel = player
      console.log(`✅ ベースプレイヤーの3Dモデル読み込み成功!`)
    //　モデル読み込み失敗時
    } catch (error) {
      // フォールバック: シンプルなボックス
      const geometry = new THREE.BoxGeometry(0.4, 1.8, 0.3)
      const material = new THREE.MeshLambertMaterial({ color: 0xEF4444 })
      const playerBox = new THREE.Mesh(geometry, material)
      playerBox.position.y = 0.9
      playerBox.castShadow = true
      playerBox.receiveShadow = true
      player.add(playerBox)
      this.basePlayerModel = player
      console.warn(`⚠️ ベースプレイヤーの3Dモデル読み込み失敗:`, error)
    }
    this.setupPosition() // ポジション設定
    this.setupUI() // UI設定
    this.animate() // ループ開始
  }

  // プレイヤーとカメラの配置を設定
  setupPosition() {
    // アクティブポジションを取得
    const activePosition = this.getActivePosition()
    if (!activePosition) return
    const cameraPositions = activePosition.cameras
    const playerPositions = activePosition.players
    const autoScaleFOV = activePosition.autoScaleFOV
    // プレイヤーの設定
    this.state.players.forEach(p => this.scene.remove(p))
    this.state.players = [] // プレイヤーをリセット
    // プレイヤーを生成
    for (let i = 0; i < playerPositions.length; i++) {
      const p = playerPositions[i]
      const anchor = new THREE.Group()
      const clone = cloneSkinned(this.basePlayerModel)
      clone.position.set(0, 0, 0) // アンカー原点に配置
      anchor.add(clone)
      anchor.position.set(p.x, p.y, p.z)
      anchor.rotation.y = THREE.MathUtils.degToRad(p.rot || 0)
      this.state.players.push(anchor)
      this.scene.add(anchor)
    }
    // カメラの設定
    this.state.cameras.forEach(c => this.scene.remove(c))
    this.state.cameras = [] // カメラをリセット
    this.setActiveCameraId(0) // アクティブカメラをリセット
    this.setActiveFocusId(0) //アクティブフォーカスをリセット
    const focus = this.getActiveFocus() // 視線方向を最初のプレイヤーに設定
    const baseFOV = 60 // FOVを設定
    const baseDistance = 7 // 基準距離
    const baseH = 2 * baseDistance * Math.tan(THREE.MathUtils.degToRad(baseFOV) / 2)  // 基準距離での高さ
    // カメラの生成
    for (let i = 0; i < cameraPositions.length; i++) {
      const pos = cameraPositions[i]
      const camera = new THREE.PerspectiveCamera(
        baseFOV,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      camera.position.set(pos.x, pos.y, pos.z) // カメラの位置設定
      // 自動FOV調整
      if (autoScaleFOV) {
        const distance = camera.position.distanceTo(focus);
        const scaledFOV = 2 * Math.atan(baseH / (2 * distance));
        camera.fov = THREE.MathUtils.radToDeg(scaledFOV);
        camera.updateProjectionMatrix();
      } else {
        camera.fov = baseFOV
        camera.updateProjectionMatrix();
      }
      camera.lookAt(focus) // カメラの視線設定
      this.state.cameras.push(camera) // カメラを配列に追加
      this.scene.add(camera) // シーンに追加
    }
    console.log("ポジション配置完了:", activePosition.positionName)
  }
  // フォーカスを切り替え
  changeFocus(){
    const activeFocus = this.getActiveFocus()
    const autoScaleFOV = this.getActivePosition().autoScaleFOV

    this.state.cameras.forEach(cam => {
      if (autoScaleFOV) {
        const baseFOV = 60 // FOVを設定
        const baseDistance = 7 // 基準距離
        const baseH = 2 * baseDistance * Math.tan(THREE.MathUtils.degToRad(baseFOV) / 2)  // 基準距離での高さ
        const distance = cam.position.distanceTo(activeFocus);
        const scaledFOV = 2 * Math.atan(baseH / (2 * distance));
        cam.fov = THREE.MathUtils.radToDeg(scaledFOV);
        cam.updateProjectionMatrix();
      } else {
        cam.fov = 60
        cam.updateProjectionMatrix();
      }

      cam.lookAt(activeFocus)
    })
  }
  // フォーカスモードの切り替え
  toggleFOVMode(id) {
    this.state.positions.get(id).autoScaleFOV = !this.state.positions.get(id).autoScaleFOV
    if (id === this.getActivePositionId()) {
      this.changeFocus()
    }
    this.setupUI()
  }
  // UIを更新
  setupUI() {
    const progress = ((this.getActiveCameraId() + 1) / this.state.cameras.length) * 100
    this.updateState({
      currentCamera: `${this.getActiveCameraId() + 1} / ${this.state.cameras.length}`,
      currentFocus: `${this.getActiveFocusId() + 1} / ${this.state.players.length}`,
      currentPosition: `${this.getActivePosition().positionName}`,
      progress: `${progress}%`,
      positionList: this.getAllPositions()
    })
  }
  // イベントリスナー設定
  setupEventListeners() {
    const handleKeyDown = (event) => {
      switch(event.code) {
        case 'ArrowLeft':
          this.setActiveCameraId((this.getActiveCameraId() - 1 + this.state.cameras.length) % this.state.cameras.length)
          break
        case 'ArrowRight':
          this.setActiveCameraId((this.getActiveCameraId() + 1) % this.state.cameras.length)
          break
        case 'KeyR':
          this.setActiveCameraId(0)
          break
        case 'KeyP':
          const order = this.state.positionOrder
          const currentIndex = order.indexOf(this.getActivePositionId())
          const nextIndex = (currentIndex + 1) % order.length
          this.setActivePositionId(order[nextIndex])
          break
        case 'KeyF':
          this.setActiveFocusId((this.getActiveFocusId() + 1) % this.state.players.length)
          break
      }
    }

    const handleResize = () => {
      this.state.cameras.forEach(cam => {
        cam.aspect = window.innerWidth / window.innerHeight
        cam.updateProjectionMatrix()
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
    // 現在のカメラで描画
    const activeCamera = this.getActiveCamera()
    if (activeCamera) {
      this.renderer.render(this.scene, activeCamera)
    }
    // 次のフレームを要求
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