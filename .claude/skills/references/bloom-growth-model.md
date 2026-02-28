# Bloom Growth Model — 仕様・評価基準

## 設計思想

花びらは `entries` 配列から直接生成される。  
「記録数」という数値を抽象化し、「自分の感情で育てた花」という体験に変換する。

- **加点のみ:** 花びらは増える一方。entries が減っても花びらは消えない（UI上）
- **mood → color:** 各花びらの色は、対応する entry の mood カラーそのもの
- **多様性:** 気分によって色が異なるため、花は常にユニークな見た目になる

---

## 成長モデル定義

| entries 数 | 状態 | 表示要素 |
|---|---|---|
| 0 | 土だけ | 土台（茶色）+ 茎のみ |
| 1〜2 | 蕾 | 茎 + 蕾（entry[0] の mood色） |
| 3〜6 | 内リング開花中 | 中心 + 内リング最大6枚（entry 0〜5） |
| 7〜12 | 外リング展開 | 内6枚 + 外リング順に増加（entry 6〜11） |
| 13〜14 | 外リング完成 | 内6 + 外6 = 12枚 |
| 15〜28 | 側芽が育つ | 12枚 + 茎の側面に小芽（2記録ごとに1個、最大4個） |
| 29〜35 | 第3リング展開 | 内6 + 外6 + 遠リング順に増加（entry 29〜34） |
| 36+ | 第3リング完成〜満開 | 内6 + 外6 + 遠6 = 18枚 + 強いグロー |

---

## Bloom コンポーネント — 数値仕様

```js
// リング半径（size=200 時）
innerR  = size * 0.22   // = 44px
outerR  = size * 0.36   // = 72px
farR    = size * 0.46   // = 92px

// 花びらサイズ
petalW  = size * 0.18, petalH  = size * 0.22   // 内リング: 36×44px
outerPW = size * 0.15, outerPH = size * 0.19   // 外リング: 30×38px
farPW   = size * 0.12, farPH   = size * 0.15   // 遠リング: 24×30px

// 中心（黄色グロー）
center  = size * 0.16   // 32px @ size=200
// 出現条件: total >= 3

// グロー
glowAlpha = min(0.04 + total * 0.006, 0.22)
glowSize  = size * (0.55 + min(total/50, 1) * 0.3)

// 側芽
budCount = total >= 15 ? min(floor((total-14)/2), 4) : 0
```

---

## カウント対応表（クイックリファレンス）

```
innerCount = min(total, 6)
outerCount = total >= 7  ? min(total - 6,  6) : 0
farCount   = total >= 30 ? min(total - 29, 6) : 0
budCount   = total >= 15 ? min(floor((total-14)/2), 4) : 0
```

---

## 評価基準

成長ロジックを変更・追加する際は以下を満たすこと。

### 必須条件
```
✅ entries が増えるにつれて、花の要素数が単調増加する
✅ entries が0でも、soil（土台）と茎は表示される
✅ entries が減っても花びらが即座に消えない（entries配列への依存のみ）
✅ 各花びらの色は entries[i].mood のカラーと1対1対応している
✅ mood が null の entry でも T.cyanSoft にフォールバックする
```

### 品質基準
```
✅ サイズが変わっても（size prop）比率が保たれる（ピクセル固定なし）
✅ floatBob アニメーションが全サイズで自然に見える
✅ 花びらが重なって中心が見えなくなっていない（zIndex制御）
✅ 中心の黄色グローが全ステージで適切な輝度を持つ
✅ インタラクティブ時（interactive prop）のタップで sparkUp が発火する
```

### 禁止
```
❌ entries が減ったときに花びらを消すアニメーション
❌ 「咲きすぎた花が枯れる」などのネガティブ変化
❌ stage 数値による分岐（廃止済み。entries.length で直接判定する）
❌ bloomStage() 関数への依存（Bloom内で独自計算する）
```

---

## キャプション対応（HomeScreen）

キャプション文字列の定義は `rules/copywriting.md` の「花のステージキャプション」セクションを参照。
達成感より「見守り」のニュアンスを優先する。
