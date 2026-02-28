# Architecture

## コンポーネント構成

```
App                          — ルート。状態管理・画面ルーティング
├── Stars                    — 背景の星フィールド（fixed, z:0）
├── [screen]
│   ├── OnboardingScreen     — 初回3ページカルーセル
│   ├── HomeScreen           — メイン画面（花 + CTA）
│   ├── EntryScreen          — 記録入力（3行 + 気分スタンプ）
│   ├── CompletionScreen     — 記録完了演出（花 + メッセージ）
│   ├── AyumiScreen          — 記録の時系列ストリーム
│   └── SettingsScreen       — 設定・統計・エクスポート
├── TabBar                   — 常時表示（home / ayumi / settings）
├── DetailModal              — 記録詳細のボトムシート
└── Particles                — パーティクル演出（完了時のみ）
```

### 共有ビジュアルコンポーネント

| Component | props | 用途 |
|---|---|---|
| `Bloom` | `entries`, `size`, `interactive?` | 花の成長ビジュアル（全画面共通） |
| `Particles` | `active`, `onDone?` | 完了時のスパークル演出 |

---

## データモデル

### Entry
```ts
type Entry = {
  id:       string;          // `e_${Date.now()}`
  date:     string;          // "YYYY-MM-DD"
  lines:    { index: number; text: string }[];  // 最大3件
  mood:     string | null;   // MOODS[].id
  weather:  { id: string; icon: string; label: string };
  timeOfDay: string;         // "HH:MM"
}
```

### Settings
```ts
type Settings = {
  darkMode:  boolean;  // default: true
  notif:     boolean;  // default: true
  haptic:    boolean;  // default: true
  onboarded: boolean;  // default: false
}
```

### MOODS（固定定数）
```js
{ id, emoji, label, color }
// color は花びらに直接使われる。変更時はBloomの見た目に影響する
```

---

## 状態管理

**原則:** サーバー不要。すべて `localStorage` に保存。

```js
// ストレージキー
const EK = "sg_entries_v2";   // Entry[]
const SK = "sg_settings_v2";  // Settings

// App ルートの useState
const [entries,  setEntries]  = useState(() => loadEntries());
const [settings, setSettings] = useState(() => loadSettings());
const [screen,   setScreen]   = useState("home" | "onboarding" | "entry" | "done" | "ayumi" | "settings");
const [tab,      setTab]      = useState("home" | "ayumi" | "settings");
const [viewing,  setViewing]  = useState(Entry | null);   // DetailModal用
const [doneEntry,setDoneEntry]= useState(Entry | null);   // CompletionScreen用
const [editing,  setEditing]  = useState(Entry | null);   // 編集時
```

**保存タイミング:** `useEffect([entries])` と `useEffect([settings])` で変更時に即保存。

---

## 画面遷移フロー

```
初回起動 → onboarding → home
home → [書くボタン] → entry → [保存] → done → home
home → [記録を見る] → DetailModal（overlay）
home → tabBar → ayumi / settings
ayumi → [カード tap] → DetailModal（overlay）
DetailModal → [編集] → entry（editing mode） → done → home
```

---

## 花コンポーネントの使用ルール

`Bloom` は必ず `entries` 配列を渡す。`stage` 数値は廃止済み。

```jsx
// ✅ 正しい
<Bloom entries={entries} size={200} interactive />
<Bloom entries={entries} size={58} />

// ❌ 使わない（古い仕様）
<Bloom stage={3} size={200} />
```

サイズ目安:
- HomeScreen: `200`（インタラクティブ）
- CompletionScreen: `160`
- AyumiScreen サマリー: `58`
- SettingsScreen: `100`

---

## CSS注入方式

グローバルCSSは `const CSS = \`...\`` で定義し、  
App の `useEffect` でスタイルタグを動的に挿入する。

```js
useEffect(() => {
  const s = document.createElement("style");
  s.textContent = CSS;
  document.head.appendChild(s);
  return () => document.head.removeChild(s);
}, []);
```

外部CSSファイルへの依存なし。Googleフォントのみ `@import` で読み込む。

---

## 拡張時の注意

- `LightJar` コンポーネントは削除済み。再追加しない
- カレンダーグリッド（`CalendarScreen`相当）は廃止済み。再追加しない
- ストリーク（連続日数）計算ロジックは廃止済み。再追加しない
- 新しいビジュアル要素を追加する前に `product-philosophy.md` を確認する
