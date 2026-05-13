"use strict";

// キャッシュ名です。ファイル構成を変えた場合は末尾のバージョンを更新します。
const CACHE_NAME = "angler-static-v20260513-1";

// クラウド公開時に先読みしておく静的ファイルです。
const APP_SHELL_FILES = [
  "./",
  "./index.html",
  "./style.css?v=20260513-1",
  "./app.js?v=20260513-1",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// インストール時に、アプリ本体をブラウザのキャッシュへ保存します。
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_FILES);
    })
  );
});

// 古いキャッシュを削除し、更新後のファイルだけが残るようにします。
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// 画面表示に必要なファイルは、通信が不安定な場所でもキャッシュから補完します。
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseCopy = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseCopy);
        });

        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match("./index.html");
        });
      })
  );
});
