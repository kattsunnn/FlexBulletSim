// React必須フックをインポート（状態管理、副作用、参照管理）
import { useState, useEffect, useRef } from 'react'
// アプリケーションのスタイルシートをインポート
import './App.css'
// Three.jsでテニスコートのバレットタイムシミュレーションを行うクラスをインポート
import TennisCourtBulletTime from './TennisCourtThreeJS'

function App() {
  // === React状態管理（useState） ===
  // 現在アクティブなカメラの表示名（例: "カメラ 1 / 12"）
  const [currentCamera, setCurrentCamera] = useState('カメラ 1 / 12')
  // カメラの詳細情報（距離とFOV角度の表示文字列）
  const [cameraDetails, setCameraDetails] = useState('距離: -- m | FOV: --°')
  // 現在選択中のカメラ配置パターン名
  const [currentPattern, setCurrentPattern] = useState('パターン3: 低密度配置 (12台)')
  // カメラ間の間隔設定（表示用文字列）
  const [currentSpacing, setCurrentSpacing] = useState('間隔: 3.0m')
  // アニメーション進行状況を示すプログレスバーの幅（CSSパーセンテージ値）
  const [progressWidth, setProgressWidth] = useState('0%')
  // 現在のフォーカスターゲット表示用
  const [focusTarget, setFocusTarget] = useState('')
  // カスタム/ビルトイン含むパターン一覧
  const [patternList, setPatternList] = useState([])
  const [patternRefreshTick, setPatternRefreshTick] = useState(0)
  
  // === 配置追加モーダル用状態管理 ===
  // 配置追加モーダルの表示/非表示状態
  const [showAddPatternModal, setShowAddPatternModal] = useState(false)
  // JSONインポート用（アップロードされたパターンオブジェクト）
  const [importedPattern, setImportedPattern] = useState(null)
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef(null)

  // === React参照管理（useRef） ===
  // Three.jsレンダリング用のcanvas要素への参照（DOM操作用）
  const canvasRef = useRef(null)
  // TennisCourtBulletTimeクラスインスタンスへの参照（コンポーネント再レンダリング間で保持）
  const tennisCourtRef = useRef(null)

  // === 副作用管理（useEffect） ===
  // コンポーネントマウント時にThree.jsシーンを初期化
  useEffect(() => {
    // canvas要素が存在しない場合は早期リターン
    if (!canvasRef.current) return

    // システム起動ログ出力
    console.log('🚀 バレットタイム映像システム起動')

    // === コールバック関数定義 ===
    // Three.jsクラスからReact状態を更新するためのコールバック関数
    const updateState = (newState) => {
      // 各プロパティが存在する場合のみ対応するstate setterを呼び出し
      if (newState.currentCamera) setCurrentCamera(newState.currentCamera)
      if (newState.cameraDetails) setCameraDetails(newState.cameraDetails)
      if (newState.currentPattern) setCurrentPattern(newState.currentPattern)
      if (newState.currentSpacing) setCurrentSpacing(newState.currentSpacing)
      if (newState.progressWidth) setProgressWidth(newState.progressWidth)
      if (newState.focusTarget) setFocusTarget(newState.focusTarget)
      if (newState.customPatterns) {
        // Three.js側からカスタムパターン変更通知
        refreshPatternList()
      }
    }

    // === Three.jsインスタンス作成 ===
    // TennisCourtBulletTimeクラスのインスタンスを作成
    // 引数: canvas要素、状態更新コールバック関数
    tennisCourtRef.current = new TennisCourtBulletTime(canvasRef.current, updateState)
  // 初期一覧取得遅延
  setTimeout(() => refreshPatternList(), 500)
    
    // === クリーンアップ関数 ===
    // コンポーネントアンマウント時やuseEffect再実行時に呼ばれる
    return () => {
      // Three.jsインスタンスが存在する場合
      if (tennisCourtRef.current) {
        // リソースを適切に解放（メモリリーク防止）
        tennisCourtRef.current.dispose()
        // 参照をクリア
        tennisCourtRef.current = null
      }
      // クリーンアップ完了ログ
      console.log('🧹 Three.jsクリーンアップ')
    }
  }, []) // 空の依存配列 = マウント時のみ実行

  // === 配置追加フォーム用イベントハンドラ ===
  // 配置追加フォームの表示/非表示を切り替える関数
  const handleToggleAddPatternForm = () => {
    const next = !showAddPatternModal
    setShowAddPatternModal(next)
    if (!next) { // 閉じるときリセット
      setImportedPattern(null)
      setImportError('')
    }
  }

  // JSONファイル選択を開く
  const handleSelectJSON = () => fileInputRef.current?.click()

  // JSONテキストをパースし標準化
  const parseJSONPatterns = (text) => {
    const data = JSON.parse(text)
    const normalizeOne = (p) => {
      if (!p.patternName) throw new Error('patternName がありません')
      if (!Array.isArray(p.cameras) || p.cameras.length === 0) throw new Error('cameras が空です')
      if (!Array.isArray(p.players) || p.players.length === 0) throw new Error('players が空です')
      return {
        patternName: p.patternName,
        description: p.description || '',
        spacing: typeof p.spacing === 'number' ? p.spacing : null,
        autoScaleFOV: p.autoScaleFOV !== false,
        cameras: p.cameras.map((c, i) => ({ name: c.name || `Cam${i+1}`, x: +c.x, y: +c.y, z: +c.z })),
        players: p.players.map((pl, i) => ({ name: pl.name || `Player${i+1}`, x: +pl.x, y: +pl.y, z: +pl.z }))
      }
    }
    if (Array.isArray(data.patterns)) {
      if (!data.patterns.length) throw new Error('patterns 配列が空です')
      return data.patterns.map(normalizeOne)
    }
    return [normalizeOne(data)]
  }

  const handleJSONFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        setImportError('')
        const text = reader.result
        const patterns = parseJSONPatterns(text)
        // 複数パターン来た場合は最初のみ採用（拡張余地）
        setImportedPattern(patterns[0])
      } catch (err) {
        console.error(err)
        setImportedPattern(null)
        setImportError(err.message)
      } finally {
        e.target.value = '' // 同じファイル再選択用リセット
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  // パターン確定（今は Three.js 連携は未実装なのでログ）
  const handleConfirmImportedPattern = () => {
    if (!importedPattern) return
    console.log('✅ JSONインポートパターン確定:', importedPattern)
    if (tennisCourtRef.current) {
      // Three.js が期待する形式へ変換: positionsのみ使用
      const pattern = {
        name: importedPattern.patternName,
        description: importedPattern.description,
        spacing: importedPattern.spacing !== null ? importedPattern.spacing : undefined,
        autoScaleFOV: importedPattern.autoScaleFOV,
        positions: importedPattern.cameras.map(c => ({ x: c.x, y: c.y, z: c.z }))
      }
      const res = tennisCourtRef.current.addCustomPattern(pattern)
      if (res.ok) {
        setTimeout(() => {
          refreshPatternList()
        }, 50)
      } else {
        setImportError(res.reason || '追加失敗')
        return
      }
    }
    setShowAddPatternModal(false)
    setImportedPattern(null)
  }

  const handleToggleAutoScale = (item) => {
    if (!tennisCourtRef.current) return
    const identifier = item.type === 'builtin' ? item.id : item.name
    const res = tennisCourtRef.current.togglePatternAutoScale(identifier)
    if (!res.ok) return
    refreshPatternList()
  }

  // ドラッグ&ドロップ対応
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.json')) {
      setImportError('JSONファイルをドロップしてください')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        setImportError('')
        const patterns = parseJSONPatterns(reader.result)
        setImportedPattern(patterns[0])
      } catch (err) {
        setImportedPattern(null)
        setImportError(err.message)
      }
    }
    reader.readAsText(file, 'utf-8')
  }
  const handleDragOver = (e) => { e.preventDefault() }

  // パターン一覧更新
  const refreshPatternList = () => {
    if (!tennisCourtRef.current) return
    try {
      const list = tennisCourtRef.current.listPatterns()
      setPatternList(list)
      setPatternRefreshTick(t => t + 1)
    } catch (e) {
      console.warn('パターン一覧取得失敗', e)
    }
  }

  const handleApplyPattern = (item) => {
    if (!tennisCourtRef.current) return
    const id = item.type === 'builtin' ? item.id : item.name
    const res = tennisCourtRef.current.applyPattern(id)
    if (!res.ok) console.warn('適用失敗', res.reason)
  }

  const handleDeletePattern = (item) => {
    if (item.type !== 'custom') return
    if (!window.confirm(`カスタムパターン "${item.name}" を削除しますか？`)) return
    const res = tennisCourtRef.current.deleteCustomPattern(item.name)
    if (!res.ok) alert('削除失敗: ' + res.reason)
    refreshPatternList()
  }

  // === JSXレンダリング ===
  return (
    <>
      {/* === カメラ情報表示パネル === */}
      <div className="camera-info">
        <h3>📹 バレットタイム</h3>
        {/* 現在のカメラ名を動的表示 */}
        <div className="current-camera">{currentCamera}</div>
        <div>手動制御モード</div>
        {/* カメラの詳細情報（距離・FOV）を動的表示 */}
        <div className="camera-details">
          {cameraDetails}
        </div>
        {/* 現在のフォーカスターゲット表示 */}
        {focusTarget && (
          <div className="focus-target-label">
            🎯 フォーカス: <span>{focusTarget}</span>
          </div>
        )}
      </div>

      {/* === 操作方法説明パネル === */}
      <div className="controls-info">
        <h3>🎮 操作方法</h3>
        <ul>
          {/* キーボードショートカットの説明 */}
          <li><strong>←→:</strong> カメラ切替</li>
          <li><strong>R:</strong> 最初のカメラにリセット</li>
          <li><strong>P:</strong> 配置パターン切替</li>
          <li><strong>F:</strong> フォーカス切替</li>
        </ul>
        <div className="controls-note">
          📐 自動スケーリング: 距離に応じてFOV調整
        </div>
      </div>

      {/* === カメラ配置パターン情報パネル === */}
      <div className="pattern-selector">
        <h3>📐 配置パターン</h3>
        {/* 現在の配置パターンを動的表示 */}
        <div className="current-pattern">{currentPattern}</div>
  {/* 間隔表示削除済み */}
        
        {/* 配置追加ボタン */}
        <button className="add-pattern-btn btn btn-primary" style={{ marginTop: '10px' }} onClick={handleToggleAddPatternForm}>➕ 配置を追加</button>
        {/* パターン一覧 */}
        <div style={{ marginTop: '12px', maxHeight: '220px', overflowY: 'auto', fontSize: '12px' }}>
          {patternList.map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ flex: 1 }}>
                {item.type === 'builtin' ? '🏷️' : '🧩'} {item.name} <span style={{ opacity: 0.6 }}>({item.count})</span>
              </span>
              <button
                className="btn btn-secondary"
                style={{ padding: '2px 6px' }}
                title={item.autoScaleFOV ? '現在: 自動FOV\nクリックで固定FOVに切替' : '現在: 固定FOV\nクリックで自動FOVに切替'}
                onClick={() => handleToggleAutoScale(item)}
              >
                {item.autoScaleFOV ? '自動FOV' : '固定FOV'}
              </button>
              <button className="btn btn-secondary" style={{ padding: '2px 6px' }} onClick={() => handleApplyPattern(item)}>適用</button>
              {item.type === 'custom' && (
                <button className="btn btn-danger" style={{ padding: '2px 6px' }} onClick={() => handleDeletePattern(item)}>削除</button>
              )}
            </div>
          ))}
          {!patternList.length && <div style={{ opacity: 0.6 }}>パターンなし</div>}
        </div>
      </div>


      {/* === アニメーション進行状況バー === */}
      <div className="progress-bar">
        {/* 進行状況を視覚的に表示するバー（幅は動的に変更） */}
        <div className="progress-fill" style={{ width: progressWidth }}></div>
      </div>

      {/* === Three.jsレンダリング用canvas === */}
      {/* refでcanvas要素への参照を取得、Three.jsがここに3Dシーンを描画 */}
      <canvas ref={canvasRef} id="c"></canvas>

      {/* === 配置追加モーダルウィンドウ === */}
      {showAddPatternModal && (
        <div className="modal-overlay" onDragOver={handleDragOver} onDrop={handleDrop}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">📐 JSON から配置をインポート</h2>
              <button className="btn btn-ghost" style={{ fontSize: '24px', padding: 0 }} onClick={handleToggleAddPatternForm}>✖</button>
            </div>
            <div className="section-block">
              <p style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.85 }}>
                1. JSONファイルを下のエリアにドラッグ&ドロップ、または「ファイル選択」ボタン<br/>
                2. プレビューを確認して「追加」<br/>
                単一パターン もしくは {`{"patterns": [ ... ]}`} 形式の複数パターンJSONに対応します（現在は最初の1件のみ採用）。
              </p>
              <div
                className="upload-dropzone"
                onClick={handleSelectJSON}
                style={{ marginBottom: '16px' }}
              >
                <strong>📂 ここにJSONをドロップ / クリックして選択</strong>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  style={{ display: 'none' }}
                  onChange={handleJSONFileChange}
                />
              </div>
              {importError && (
                <div style={{ color: '#f44336', fontSize: '12px', marginBottom: '10px' }}>
                  ❌ {importError}
                </div>
              )}
              {importedPattern && (
                <div style={{ background: '#333', padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
                  <div><strong>名前:</strong> {importedPattern.patternName}</div>
                  {importedPattern.description && <div><strong>説明:</strong> {importedPattern.description}</div>}
                  <div><strong>カメラ数:</strong> {importedPattern.cameras.length}</div>
                  <div><strong>プレイヤー数:</strong> {importedPattern.players.length}</div>
                  {importedPattern.spacing !== null && <div><strong>spacing:</strong> {importedPattern.spacing}</div>}
                  <div style={{ marginTop: '8px', opacity: 0.7 }}>追加後に Three.js 反映機能は今後実装予定</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleToggleAddPatternForm}>❌ キャンセル</button>
              <button className="btn btn-primary" disabled={!importedPattern} onClick={handleConfirmImportedPattern}>✅ 追加</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Appコンポーネントをデフォルトエクスポート
export default App
