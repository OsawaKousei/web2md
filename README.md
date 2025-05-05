# web2md

`web2md` は、指定されたウェブサイトの URL から記事コンテンツを抽出し、Markdown 形式に変換してローカルディレクトリに保存するコマンドラインツールです。

Mozilla の Readability ライブラリを使用して本文を抽出し、Turndown ライブラリを使用して HTML を Markdown に変換します。

## 機能

- 指定された URL からウェブページを取得します。
- Readability を使用して主要な記事コンテンツとタイトルを抽出します。
- 抽出したコンテンツを Markdown 形式に変換します。
- 記事のタイトルに基づいてファイル名を生成し（無効な文字はサニタイズされます）、指定されたディレクトリに `.md` ファイルとして保存します。

## インストール

```bash
# リポジトリをクローンしてローカルでビルドする
git clone https://github.com/yourusername/web2md.git
cd web2md
npm install
npm run build

# ローカルで実行する場合
node dist/index.js -u <URL> -o <出力先ディレクトリ>

# または、グローバルにインストールする場合
npm link
web2md -u <URL> -o <出力先ディレクトリ>
```

## 使い方

```bash
web2md -u <URL> -o <出力先ディレクトリ>
```

### オプション

- `-u, --url <url>`: (必須) 処理対象のウェブサイトの URL。
- `-o, --output-dir <directory>`: (必須) 生成された Markdown ファイルを保存するディレクトリ。ディレクトリが存在しない場合は作成されます。
- `-h, --help`: ヘルプメッセージを表示します。
- `-V, --version`: バージョン情報を表示します。

## 使用例

```bash
# 例: ウェブページの記事を抽出し、./output ディレクトリに保存する
web2md -u "https://example.com/some-article-page" -o ./output

# 実行後、./output ディレクトリ内に "Some_Article_Page_Title.md" のようなファイルが生成されます。
# (ファイル名はページのタイトルに基づいて自動生成されます)
```

## 技術的詳細

`web2md` は以下の処理フローで動作します：

1. 指定された URL から Axios を使用して HTML コンテンツを取得
2. JSDOM を使用して HTML 文書をパース
3. Mozilla Readability を使用して本文コンテンツとタイトルを抽出
4. Turndown を使用して HTML を Markdown に変換
5. サニタイズされたファイル名で Markdown ファイルを出力先ディレクトリに保存

## 依存ライブラリ

- [axios](https://github.com/axios/axios) - HTTP リクエスト用
- [commander](https://github.com/tj/commander.js/) - コマンドライン引数の解析
- [jsdom](https://github.com/jsdom/jsdom) - Node.js 環境での DOM 操作
- [@mozilla/readability](https://github.com/mozilla/readability) - 記事本文の抽出
- [turndown](https://github.com/mixmark-io/turndown) - HTML から Markdown への変換
- [sanitize-filename](https://github.com/parshap/node-sanitize-filename) - ファイル名のサニタイズ
