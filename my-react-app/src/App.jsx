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
    }

    // === Three.jsインスタンス作成 ===
    // TennisCourtBulletTimeクラスのインスタンスを作成
    // 引数: canvas要素、状態更新コールバック関数
    tennisCourtRef.current = new TennisCourtBulletTime(canvasRef.current, updateState)
    
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
      </div>

      {/* === 操作方法説明パネル === */}
      <div className="controls-info">
        <h3>🎮 操作方法</h3>
        <ul>
          {/* キーボードショートカットの説明 */}
          <li><strong>←→:</strong> カメラ切替</li>
          <li><strong>R:</strong> 最初のカメラにリセット</li>
          <li><strong>数字1-9:</strong> 直接カメラ選択</li>
          <li><strong>P:</strong> 配置パターン切替</li>
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
        {/* カメラ間隔設定を動的表示 */}
        <div className="current-spacing">{currentSpacing}</div>
      </div>

      {/* === テニス選手情報パネル === */}
      <div className="player-info">
        <h3>🎾 テニス選手</h3>
        {/* 各プレイヤーの識別表示 */}
        <div className="player player1">🔵 プレイヤー1（フォーカス）</div>
        <div className="player player2">🔴 プレイヤー2</div>
      </div>

      {/* === アニメーション進行状況バー === */}
      <div className="progress-bar">
        {/* 進行状況を視覚的に表示するバー（幅は動的に変更） */}
        <div className="progress-fill" style={{ width: progressWidth }}></div>
      </div>

      {/* === Three.jsレンダリング用canvas === */}
      {/* refでcanvas要素への参照を取得、Three.jsがここに3Dシーンを描画 */}
      <canvas ref={canvasRef} id="c"></canvas>
    </>
  )
}

// Appコンポーネントをデフォルトエクスポート
export default App
