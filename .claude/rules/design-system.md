# Design System

## カラートークン

```js
const T = {
  // Backgrounds
  skyDeep:   "#060c1f",   // メイン背景
  skyMid:    "#0a1535",   // セカンダリ背景

  // Primary accent
  cyan:      "#38e8ff",   // メインアクセント・CTA・グロー
  cyanMid:   "#1ec8e8",   // グラデーション始点
  cyanSoft:  "#7dd8e8",   // サブアクセント・キャプション

  // Mood / petal colours
  blue:      "#a8c8f8",   // おだやか・ほっとした
  lavender:  "#c4b8f8",   // つかれた
  rose:      "#f8c0d8",   // あたたかい・ありがたい
  mint:      "#a8f0d8",   // おだやか・しずか
  gold:      "#f8e0a0",   // うれしい・きらきら

  // Text
  text:      "#e8f4ff",   // 主テキスト
  textSub:   "rgba(200,230,255,0.65)",  // サブテキスト
  textMuted: "rgba(160,200,240,0.42)", // ミュートテキスト・プレースホルダー

  // Borders / Glass
  border:    "rgba(100,200,255,0.16)",
};
```

---

## タイポグラフィ

| 用途 | フォント | サイズ感 | 特記 |
|---|---|---|---|
| アプリ名・見出し・詩的テキスト | Noto Serif JP | 0.85〜1.35rem | weight: 300 |
| 本文・ラベル・入力 | Zen Kaku Gothic New | 0.8〜0.92rem | — |
| メタデータ・数値・コード的なもの | Space Mono | 0.6〜0.72rem | letterSpacing 0.04〜0.14em |

**原則:** フォントサイズは控えめに。詩的な余白を文字サイズで作らない。

---

## UIパターン

### `.glass` — グラスモーフィズム
```css
background: linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02));
border: 1px solid rgba(100,200,255,0.16);
border-radius: 20px;
backdrop-filter: blur(12px);
box-shadow: 0 8px 32px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.055);
```
**用途:** カード・モーダル・あゆみのエントリーカード

### `.neuro` — ニューモーフィズム
```css
background: linear-gradient(145deg, rgba(10,21,53,0.96), rgba(6,12,31,0.98));
box-shadow: 5px 5px 14px rgba(0,0,0,0.5), -3px -3px 9px rgba(56,232,255,0.032);
border: 1px solid rgba(255,255,255,0.042);
border-radius: 14px;
```
**用途:** テキスト入力フィールド（エンボス感で「書く場所」を演出）

### `.btn-cta` — メインCTAボタン
```css
background: linear-gradient(135deg, #1ec8e8, #38e8ff);
color: #060c1f;
font-weight: 700;
border-radius: 50px;
box-shadow: 0 4px 20px rgba(56,232,255,0.36);
```

### `.btn-ghost` — サブアクションボタン
```css
background: rgba(255,255,255,0.055);
border: 1px solid rgba(100,200,255,0.16);
border-radius: 50px;
color: rgba(200,230,255,0.62);
```

---

## アニメーション定義

| name | 用途 | timing |
|---|---|---|
| `fadeUp` | 画面・要素の登場 | 0.42〜0.55s ease-out |
| `fadeDown` | ヒント・ノーティフィケーションの登場 | 0.5〜0.6s ease-out |
| `bloomIn` | 花の完了アニメーション | 0.72s cubic-bezier(0.34,1.56,0.64,1) |
| `floatBob` | 花の浮遊（常時） | 4.8s ease-in-out infinite |
| `sway` | 花びらの揺れ（常時） | 3.4〜4.2s ease-in-out infinite |
| `glow` | グロー呼吸（常時） | 3.8s ease-in-out infinite |
| `pulse` | 中心の輝き（常時） | 2.6s ease-in-out infinite |
| `sparkUp` | タップ時のパーティクル | 0.65〜1.8s ease-out forwards |
| `slideUp` | ボトムシートの登場 | 0.36s cubic-bezier(0.25,1,0.5,1) |
| `slideIn` | 記録画面の横スライド | 0.32s cubic-bezier(0.25,1,0.5,1) |
| `twinkle` | 星フィールドの瞬き | 2〜5.5s ease-in-out infinite |

**スプリングカーブ:** インタラクティブな変形には `cubic-bezier(0.34,1.56,0.64,1)` を使う（弾むような自然さ）。

---

## 空間・余白設計

- ホーム画面はスクロールさせない（1画面に収まる設計）
- メインビジュアル（花）には `flex: 1` で自然な余白を確保
- 水平パディングは一貫して `24px`
- CTAゾーンは bottom に固定し `padding-bottom: 20px`
- 情報密度より「呼吸できる空間」を優先する

---

## フォンシェル（電話フレーム）

```
幅: 390px / 高さ: 844px（iPhone 14 Pro相当）
border-radius: 52px
背景: #060c1f
外枠: border 2px solid rgba(100,200,255,0.18)
shadow: 0 0 80px rgba(56,232,255,0.1), 0 40px 80px rgba(0,0,0,0.8)
```

ノッチ: 幅116px × 高さ32px、画面上部中央  
ステータスバー: Space Mono 0.58rem、左に時刻・右に電波+バッテリー
