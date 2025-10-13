import { useState, useEffect, useRef } from 'react'
import './App.css'
import TennisCourtBulletTime from './TennisCourtThreeJS'
import ControlPanel from './assets/component/ControlPanel.jsx'

function App() {
  // === React状態管理（useState） ===
  // 現在アクティブなカメラの表示名（例: "カメラ 1 / 12"）
  const [currentCamera, setCurrentCamera] = useState('--')
  // カメラの詳細情報（距離とFOV角度の表示文字列）
  const [currentFocus, setCurrentFocus] = useState('フォーカス: --')
  // 現在選択中のカメラ配置パターン名
  const [currentPosition, setCurrentPosition] = useState('--')
  // アニメーション進行状況を示すプログレスバーの幅（CSSパーセンテージ値）
  const [progress, setProgress] = useState('0%')
  // 現在のフォーカスターゲット表示用
  // カスタム/ビルトイン含むパターン一覧
  const [positionList, setPositionList] = useState([])
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
      if (newState.currentFocus) setCurrentFocus(newState.currentFocus)
      if (newState.currentPosition) setCurrentPosition(newState.currentPosition)
      if (newState.progress) setProgress(newState.progress)
      if (newState.positionList) setPositionList(newState.positionList)
    }

    // === Three.jsインスタンス作成 ===
    tennisCourtRef.current = new TennisCourtBulletTime(canvasRef.current, updateState)
    setTimeout(() => refreshPatternList(), 500) // 初期一覧取得遅延
    
    // === クリーンアップ関数 ===
    return () => {
      if (tennisCourtRef.current) {
        tennisCourtRef.current.dispose()
        tennisCourtRef.current = null
      }
    }
  }, [])

  // TODO: Three.js クラスから取得し直す実装が無いため簡易スタブ
  const refreshPatternList = () => {
    // ここで tennisCourtRef.current から一覧取得する想定
    // setPatternList([...])
  }

  const handleImportPosition = (data) => {
    try {
      tennisCourtRef.current?.loadJsonPosition?.(data)
    } catch (e) {
      console.error('ポジションJSONの取り込みに失敗:', e)
      alert('ポジションJSONの取り込みに失敗しました')
    }
  }
  const handleDeletePosition = (id) => {
    try {
      tennisCourtRef.current?.deletePosition?.(id)
    } catch (e) {
      console.error('ポジション削除に失敗:', e)
      alert(`削除エラー: ${e.message}`)
    }
  }

 const handleSelectPosition = (id) => {
    try {
      tennisCourtRef.current?.setActivePositionId?.(id)
    } catch (e) {
      console.error('ポジション選択に失敗:', e)
      alert('ポジション選択に失敗しました')
    }
  }

  const handleToggleFOVMode = (id) => {
    try {
      tennisCourtRef.current?.toggleFOVMode?.(id)
    } catch (e) {
      console.error('FOVモード切替に失敗:', e)
      alert('FOVモード切替に失敗しました')
    }
  }

  return (
    <>
      <canvas ref={canvasRef} className="main-canvas" />
      <div className="control-panel-wrapper">
        <ControlPanel 
          state={{ currentCamera, currentFocus, currentPosition, progress, positionList }}
          handle={{handleImportPosition, handleDeletePosition, handleSelectPosition, handleToggleFOVMode}} 
        />
      </div>
    </>
  )
}

export default App
