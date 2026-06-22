# ESS サークルホームページ

ESS（English Speaking Society）ドラマセクションの公式サイトです。

## 閲覧方法

`index.html` をブラウザで開くだけで表示できます。

```
website/index.html をダブルクリック
```

メンバー紹介ページ（`members.html`）は JSON を読み込むため、ローカルサーバーでの起動を推奨します。

```bash
cd website
python -m http.server 8000
```

ブラウザで http://localhost:8000 を開いてください。

## メンバー紹介の更新

1. `メンバー紹介.xlsx` に部員情報を入力（1行目はヘッダー）

| 学年 | 名前 | 役職 | 一言 | photo |
|------|------|------|------|-------|
| 3 | 山田太郎 | キャスト | 演劇が大好き！ | 1 |

- `photo` 列の数字は `メンバー紹介写真/photo 1.jpg` などに対応します。

2. 以下を実行して `data/members.json` を再生成

```bash
python website/scripts/build-gallery.py
python website/scripts/build-members.py
```

## カスタマイズ

以下の項目は `index.html` を編集して更新してください。

| 項目 | 場所 |
|------|------|
| 公演日程・会場・チケット情報 | `#current` セクションの `current-details` |
| Instagram URL | `#contact-instagram` の `href`（設定済み: @hirodai_ess） |
| メンバー情報 | `メンバー紹介.xlsx` → `python website/scripts/build-members.py` |
| メールアドレス | `#contact-email` の `href` |
| 大学名・活動場所 | `#about` セクション |

## 活動報告の運用

| タイミング | 内容 |
|-----------|------|
| **毎週金曜日のアクト** | 担当者が集合写真を撮影し、活動レポートを作成 |
| **約3週間に1回** | ホームページ担当がサイトにまとめて掲載 |
| **3か月ごと** | 古い活動報告を自動削除（サイト容量の軽量化） |

### 更新手順（ホームページ担当向け）

1. `日々の活動報告.xlsx` にレポート文を入力
2. 集合写真を `活動報告　写真/` に保存（例：`photo 0612.jpg` = 6月12日）
3. 以下を実行して `data/reports.json` を再生成

```bash
python website/scripts/build-reports.py
```

#### Excel の列（1行目はヘッダー）

| 日付 | タイトル | 担当者 | 活動報告 | 写真 |
|------|----------|--------|----------|------|
| 2026-06-22 | 6月22日 金曜アクト | 名前 | その日のアクトの内容を記入 | LINE_NOTE_260622_1.jpg |
| 2026-06-12 | 6月12日 金曜アクト | 名前 | その日のアクトの内容を記入 | photo 0612 |

- `写真` 列は `photo 0612.jpg` のようにファイル名を指定
- Excel が空でも、写真ファイル名の日付（`photo MMDD.jpg`）から自動掲載されます
- **3か月より古い報告**はビルド時に自動で削除されます

4. GitHub に push するとサイトに反映

## 今後追加すると効果的な情報

サイトをさらに充実させるために、以下の追加を検討してください。

| 優先度 | 内容 | 効果 |
|--------|------|------|
| 高 | **会場アクセス・地図**（大学会館・アザレアホール） | 来場者・新入生の不安解消 |
| 高 | **公演動画・ダイジェスト**（YouTube等） | 未見学の人に「見たい」と思わせる |
| 高 | **メンバーの声（実名・写真付き）** | 信頼感・共感の向上 |
| 中 | **新歓スケジュール**（見学日・体験会の具体日時） | 入会ハードルの低下 |
| 中 | **お知らせ・ニュース欄** | 公演情報の更新が楽になる |
| 中 | **歴代公演リスト**（リメコン演目含む） | 実績・ブランドの訴求 |
| 低 | **ESS全体（スピーチ・ディスカッション）へのリンク** | サークル全体像の理解 |
| 低 | **English版ページ** | 留学生・来場者向け |

## ファイル構成

```
website/
├── index.html          メインページ
├── members.html        メンバー紹介
├── css/style.css       スタイル
├── css/members.css     メンバーページ用
├── js/main.js          インタラクション
├── js/members.js       メンバー紹介
├── data/
│   ├── members.json    メンバーデータ
│   └── gallery.json    ギャラリーデータ
├── scripts/build-members.py
├── scripts/build-reports.py
└── assets/             画像・ポスター
```
## 検索エンジン対策（SEO）

「広島大学 ESS」で検索されやすくするため、以下を設定済みです。

- 各ページの **title / description / keywords**
- **Open Graph**（SNSシェア用）・**canonical URL**
- **構造化データ**（Organization / WebSite / Event / FAQ）
- `robots.txt` と `sitemap.xml`

### Google にサイトを登録する手順

1. [Google Search Console](https://search.google.com/search-console) にログイン
2. プロパティに `https://shinohara-yuto.github.io/hirodai-ess-website/` を追加
3. サイトマップ URL を登録: `https://shinohara-yuto.github.io/hirodai-ess-website/sitemap.xml`
4. Instagram のプロフィールリンクに公式サイト URL を載せる（被リンクになり SEO に有効）

※ 検索結果への反映には数日〜数週間かかることがあります。

## 公開方法

- **GitHub Pages**: リポジトリにpushして Pages を有効化
- **Netlify / Vercel**: `website` フォルダをドラッグ&ドロップでデプロイ
- **大学サーバー**: FTPでアップロード
