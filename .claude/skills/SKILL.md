# SKILL.md — Small Good 開発ワークフロー

このドキュメントはSmall Goodへの変更・機能追加・レビューを行う際の手順を定義する。  
作業前に必ず読むこと。

---

## 作業前チェック（必須）

どんな変更であっても、着手前に以下を確認する:

```
□ rules/product-philosophy.md を読んだか
□ 追加・変更しようとしているものが「禁止事項」に触れていないか
□ ユーザーが夜疲れて開いたときに「安心できる」か想像したか
```

---

## ワークフロー 1: 新機能追加

### Step 1 — 哲学チェック
`rules/product-philosophy.md` の禁止事項と照合する。  
以下のいずれかに当てはまる機能は**実装しない**:
- 空白・不足・未達成が見えるもの
- ストリーク・連続記録・目標達成率
- カレンダーグリッド
- 減点・ペナルティ・失敗を可視化するもの

### Step 2 — デザイン整合
`rules/design-system.md` を参照し:
- カラートークン `T.*` を使う（ハードコード禁止）
- 新UIパターンが必要なら `.glass` / `.neuro` を基に派生させる
- アニメーションは既存 keyframes を再利用する。新規追加は最小限に

### Step 3 — コピーライティング
`rules/copywriting.md` の禁止フレーズと照合し、  
新規テキストは「承認済みコピープール」のトーンに合わせる。

### Step 4 — 実装
`rules/architecture.md` を参照し:
- `Bloom` には必ず `entries` を渡す（`stage` 数値は廃止）
- 新しい画面は `screen` ステートの遷移フローに組み込む
- localStorage キーは既存 `EK` / `SK` を使う（新キー追加時はバージョン管理）

### Step 5 — セルフレビュー
`skills/references/ux-evaluation.md` のチェックリストを通す。

---

## ワークフロー 2: バグ修正

1. 症状を特定し、影響コンポーネントを絞る
2. `Bloom` の呼び出しを確認: `entries` prop が渡っているか
3. 削除済みコンポーネント（`LightJar`, `CalendarScreen`, ストリーク）が  
   参照されていないか `grep` で確認する:
   ```bash
   grep -n "LightJar\|bloomStage\|streak\|CalendarScreen\|Bloom stage=" src/
   ```
4. 修正後、影響する画面を全件目視確認する

---

## ワークフロー 3: テキスト・コピー変更

1. `rules/copywriting.md` の禁止フレーズリストと照合
2. 変更後に「コピーを追加するときのチェック」5項目を通す
3. 時間帯別挨拶・DONE_MSG・GENTLE などは配列で管理されているため、  
   追加・削除は配列全体のトーン統一を維持すること

---

## ワークフロー 4: Bloom（花）の成長ロジック変更

`skills/references/bloom-growth-model.md` を参照し、  
変更前後で成長モデルの一貫性を確認する。

評価基準:
- 加点のみか（減点・リセットがないか）
- 花びら数が entries.length に対して単調増加か
- mood カラーが該当 entry と1対1対応しているか

---

## ファイル構成リファレンス

```
small-good-app.jsx          — 単一ファイルのReactプロトタイプ（現在の成果物）

.claude/
├── CLAUDE.md               — インデックス（このプロジェクトの入口）
├── rules/
│   ├── product-philosophy.md   — UX哲学・禁止事項
│   ├── design-system.md        — カラー・タイポ・UIパターン・アニメーション
│   ├── copywriting.md          — テキストトーン・禁止フレーズ・コピープール
│   └── architecture.md         — コンポーネント構成・データモデル・状態管理
└── skills/
    ├── SKILL.md                — 本ファイル（開発ワークフロー）
    └── references/
        ├── bloom-growth-model.md   — 花の成長ロジック仕様・評価基準
        └── ux-evaluation.md        — UXチェックリスト
```
