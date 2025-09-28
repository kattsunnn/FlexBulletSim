import { useState, useEffect, useRef } from 'react'
import './App.css'
import TennisCourtBulletTime from './TennisCourtThreeJS'

function App() {
  // === React状態管理（useState） ===
  // 現在アクティブなカメラの表示名（例: "カメラ 1 / 12"）
  const [currentCamera, setCurrentCamera] = useState('--')
  // カメラの詳細情報（距離とFOV角度の表示文字列）
  const [cameraDetails, setCameraDetails] = useState('距離: -- m | FOV: --° | フォーカス: なし')
  // 現在選択中のカメラ配置パターン名
  const [currentPattern, setCurrentPattern] = useState('--')
  // アニメーション進行状況を示すプログレスバーの幅（CSSパーセンテージ値）
  const [progressWidth, setProgressWidth] = useState('0%')
  // 現在のフォーカスターゲット表示用
  // カスタム/ビルトイン含むパターン一覧
  const [patternList, setPatternList] = useState([])
  // 統合パネル開閉
  const [infoPanelOpen, setInfoPanelOpen] = useState(true)
  const toggleInfoPanel = () => setInfoPanelOpen(o => !o)

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
      if (newState.progressWidth) setProgressWidth(newState.progressWidth)
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
        // positions 優先, 無ければ cameras
        const raw = Array.isArray(p.positions) ? p.positions : (Array.isArray(p.cameras) ? p.cameras : null)
        if (!raw || !raw.length) throw new Error('positions / cameras が空です')
        const pos = raw.map((c, i) => ({ x: +c.x || 0, y: isNaN(+c.y) ? 0.8 : +c.y, z: +c.z || 0 }))
        const players = Array.isArray(p.players) ? p.players.slice(0,2).map(pl => ({ x: +pl.x || 0, y: +pl.y || 0, z: +pl.z || 0 })) : null
        return {
          patternName: p.patternName,
          autoScaleFOV: p.autoScaleFOV !== false,
          positions: pos,
          players
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
          setImportedPattern(patterns) // 全件保持
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
    if (!importedPattern || !Array.isArray(importedPattern)) return
    if (!tennisCourtRef.current) return
    let added = 0
    importedPattern.forEach(p => {
      const pat = {
        name: p.patternName,
        autoScaleFOV: p.autoScaleFOV,
        positions: p.positions.map(c => ({ x: c.x, y: c.y, z: c.z })),
        players: p.players || null
      }
      const res = tennisCourtRef.current.addCustomPattern(pat)
      if (res.ok) added++
    })
    if (added === 0) {
      setImportError('追加できるパターンがありません')
      return
    }
    refreshPatternList()
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
        setImportedPattern(patterns) // ドロップでも全件保持
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
    if (!tennisCourtRef.current) return
    if (item.type === 'custom') {
      if (!window.confirm(`カスタムパターン "${item.name}" を削除しますか？`)) return
      const res = tennisCourtRef.current.deleteCustomPattern(item.name)
      if (!res.ok) alert('削除失敗: ' + res.reason)
    } else if (item.type === 'builtin') {
      if (!window.confirm(`標準パターン "${item.name}" を削除しますか？`)) return
      const res = tennisCourtRef.current.deleteBuiltinPattern(item.id)
      if (!res.ok) alert('削除失敗: ' + (res.reason || '不明'))
    }
    refreshPatternList()
  }

  // === JSXレンダリング ===
  return (
    <>
      {/* === 統合情報パネル（折りたたみ） === */}
      <div className={`info-panel ${infoPanelOpen ? 'open' : 'closed'}`}>
        <div className="info-panel-header" onClick={toggleInfoPanel}>
          <span className="header-title">📊 Info Panel</span>
          <button
            className="collapse-btn btn btn-secondary"
            onClick={(e) => { e.stopPropagation(); toggleInfoPanel(); }}
            type="button"
          >
            {infoPanelOpen ? '▲' : '▼'}
          </button>
        </div>
        {infoPanelOpen && (
          <div className="info-panel-body">
            {/* バレットタイムセクション */}
            <section className="panel-section">
              <h3>📹 バレットタイム</h3>
              <div className="current-camera">{currentCamera}</div>
              <div className="camera-details">{cameraDetails}</div>
            </section>
            {/* 操作方法 */}
            <section className="panel-section">
              <h3>🎮 操作方法</h3>
              <ul className="controls-list">
                <li><strong>←→:</strong> カメラ切替</li>
                <li><strong>R:</strong> 最初のカメラにリセット</li>
                <li><strong>P:</strong> 配置パターン切替</li>
                <li><strong>F:</strong> フォーカス切替</li>
              </ul>
              <div className="controls-note">📐 自動スケーリング: 距離に応じてFOV調整</div>
            </section>
            {/* 配置パターン */}
            <section className="panel-section">
              <h3>📐 配置パターン</h3>
              <div className="current-pattern">{currentPattern}</div>
              <button className="add-pattern-btn btn btn-primary" style={{ marginTop: '10px' }} onClick={handleToggleAddPatternForm}>➕ 配置を追加</button>
              <div className="pattern-list-wrapper" style={{ marginTop: '12px', maxHeight: '200px', overflowY: 'auto', fontSize: '12px' }}>
                {patternList.map(item => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ flex: 1 }}>📐 {item.name}</span>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '2px 6px' }}
                      title={item.autoScaleFOV ? '現在: 自動FOV\nクリックで固定FOVに切替' : '現在: 固定FOV\nクリックで自動FOVに切替'}
                      onClick={() => handleToggleAutoScale(item)}
                    >
                      {item.autoScaleFOV ? '自動FOV' : '固定FOV'}
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '2px 6px' }} onClick={() => handleApplyPattern(item)}>適用</button>
                    <button className="btn btn-danger" style={{ padding: '2px 6px' }} onClick={() => handleDeletePattern(item)}>削除</button>
                  </div>
                ))}
                {!patternList.length && <div style={{ opacity: 0.6 }}>パターンなし</div>}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* === アニメーション進行状況バー === */}
      <div className="progress-bar">
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
                単一パターン もしくは {`{"patterns": [ ... ]}`} 形式の複数パターンJSONに対応します（検出した全パターンを追加）。
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
              {importedPattern && Array.isArray(importedPattern) && (
                <div style={{ background: '#333', padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
                  <div><strong>検出パターン数:</strong> {importedPattern.length}</div>
                  {importedPattern.slice(0,3).map((p,i) => (
                    <div key={i} style={{ marginTop: '6px', padding: '6px', background: '#222', borderRadius: '4px' }}>
                      <div><strong>{p.patternName}</strong></div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>Cameras: {p.positions.length}{p.players ? ` / Players:${p.players.length}`: ''}</div>
                    </div>
                  ))}
                  {importedPattern.length > 3 && <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>... and {importedPattern.length - 3} more</div>}
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
