# FlexBulletSim

テニスコート上で複数視点バレットタイム的カメラを操作/切替しながらフォーカス対象を巡回できる Three.js + React (Vite) デモ。

## 主な機能
- 標準カメラパターン 3種 + カスタムパターン追加(JSONインポート)
- プレイヤー2体(簡易モデル) / フォーカスターゲット切替
- 自動FOVスケーリング(距離に応じたFOV) と 固定FOV の per-pattern トグル
- カメラ巡回/フォーカス切替: キーボード操作 (← → / P / F / R)

## 開発環境
```
node 20+
vite 7
react 19
three 0.180
```

### ローカル起動
```
cd my-react-app
npm install
npm run dev
```

## カスタムパターン JSON 形式
単体:
```json
{
	"patternName": "Example",
	"description": "説明",
	"autoScaleFOV": true,
	"cameras": [ { "name": "Cam1", "x": 1, "y": 2, "z": 0.97 } ],
	"players": [ { "name": "Player1", "x": 0, "y": 0, "z": -5.9 }, { "name": "Player2", "x": 0, "y": 0, "z": 5.9 } ]
}
```
複数:
```json
{ "patterns": [ { "patternName": "A", "cameras": [...], "players": [...] }, { "patternName": "B", "cameras": [...], "players": [...] } ] }
```

## GitHub Pages 公開手順
リポジトリ: `FlexBulletSim`

1. リポジトリの Settings > Pages を開き Source を GitHub Actions に設定
2. 既に `.github/workflows/deploy.yml` が追加されていることを確認
3. `vite.config.js` の `base: '/FlexBulletSim/'` を変更したい場合(リポジトリ名変更時など)は修正
4. ビルド&デプロイは `main` へ push すると自動実行
5. 完了後 `https://<あなたのGitHubユーザ名>.github.io/FlexBulletSim/` でアクセス可能

### 手動トリガー
Actions タブ → `Deploy to GitHub Pages` ワークフローを選択 → Run workflow

### 動作確認 (ローカルビルド)
```
cd my-react-app
npm run build
npm run preview
```

## よくあるハマりポイント
| 症状 | 対策 |
|------|------|
| ページが 404 | base パスと実際の公開URLが一致しているか確認 |
| 画像/モデルが読めない | 相対パス利用 or `import` 経由で bundle させる |
| 白画面 / コンソールで MIME エラー | キャッシュクリア (Shift+Reload) |

## 今後のアイデア
- localStorage 永続化 (カスタムパターン保持)
- 複数パターン同時インポート UI
- 連番スクリーンキャプチャ出力

---
Happy shooting 📷