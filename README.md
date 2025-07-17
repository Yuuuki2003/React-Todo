# React × AWS Amplify Todo アプリ

## 📌 概要

このアプリは、React と AWS を活用したシンプルな Todo 管理アプリです。  
ユーザー認証に AWS Cognito、データ保存に DynamoDB、API に API Gateway + Lambda を使用し、スケーラブルな構成を実現しています。

---

## 🚀 主な機能

- メールアドレスによるユーザー登録・ログイン（Cognito）
- Todo の追加・削除・完了・復元
- 認証済みユーザーごとの Todo データ管理（DynamoDB）
- 認証付き REST API（API Gateway + Lambda）
- Amplify を用いた CI/CD・ホスティング

---

## 🌐 公開アプリ

👉 [https://main.d2106vo77pbpbv.amplifyapp.com/](https://main.d2106vo77pbpbv.amplifyapp.com/)

※ 新規登録には有効なメールアドレスが必要です。

---

## 🛠 使用技術

### フロントエンド
- React (Vite)
- AWS Amplify Auth
- Fetch API

### バックエンド（インフラ）
- AWS Cognito（ユーザー認証）
- AWS API Gateway（REST API）
- AWS Lambda（サーバーレス関数）
- AWS DynamoDB（NoSQL データベース）
- AWS Amplify（ホスティング / CI/CD）

---
