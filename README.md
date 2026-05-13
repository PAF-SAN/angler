# ANGLER

ANGLERは、釣り用リールのライン巻き替えを管理するWebアプリです。

## 公開仕様

このアプリは、HTML、CSS、JavaScriptだけで動く静的Webアプリです。

そのため、Vercel、Netlify、GitHub Pagesなどの静的ホスティングへ公開すると、外出先からURLで利用できます。

## データ保存

登録したリール、スプール、巻き替え履歴は、利用しているブラウザのLocalStorageに保存されます。

クラウド公開後も、データはサーバーではなく端末側に保存されます。スマホ変更やブラウザ変更をする場合は、バックアップ画面からJSONを出力し、新しい端末で読み込んでください。

## Vercelで公開する手順

1. このフォルダをGitHubリポジトリへアップロードします。
2. Vercelで新しいプロジェクトを作成します。
3. GitHubリポジトリを選択します。
4. Framework Presetは「Other」を選択します。
5. Build Commandは空欄のままにします。
6. Output Directoryは空欄のままにします。
7. Deployを実行します。
8. 発行されたURLをスマホで開きます。

## Netlifyで公開する手順

1. Netlifyで新しいサイトを作成します。
2. このフォルダを含むGitHubリポジトリを選択します。
3. Build commandは空欄のままにします。
4. Publish directoryは「.」にします。
5. Deployを実行します。
6. 発行されたURLをスマホで開きます。

## 更新時の注意

`app.js`、`style.css`、`sw.js`を更新した場合は、`sw.js`内の`CACHE_NAME`と、`index.html`内の読み込みURLのバージョンを更新してください。

これにより、スマホ側に古いファイルが残りにくくなります。
