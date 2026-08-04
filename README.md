<div align="center">
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,45:1D4ED8,100:22C55E&height=220&section=header&text=UIT+Student+App&fontSize=48&fontColor=F8FAFC&animation=fadeIn&fontAlignY=35&desc=University+of+Information+Technology&descAlignY=55&descSize=18" alt="header" />
</div>

<div align="center">
  <img src="./assets/startup-logo.png" alt="UIT Student logo" width="120" />

  <p>Ứng dụng mobile nhẹ, đơn giản để truy cập nhanh <a href="https://portal.uit.edu.vn">UIT Student Portal</a> trên điện thoại.</p>

  <p>
    <img src="https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo 54" />
    <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/React_Native-0.81-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native 0.81" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.9" />
    <img src="https://img.shields.io/badge/WebView-Portal_Wrapper-4A90E2?style=for-the-badge&logo=googlechrome&logoColor=white" alt="WebView Portal Wrapper" />
    <img src="https://img.shields.io/badge/EAS-Android_Build-111111?style=for-the-badge&logo=expo&logoColor=white" alt="EAS Android Build" />
  </p>
</div>

## Giới thiệu

`UIT Student` là ứng dụng Expo/React Native đóng gói trang `portal.uit.edu.vn` thành trải nghiệm mobile gọn gàng hơn. Dự án tập trung vào tốc độ mở app, splash screen mang nhận diện UIT và thao tác điều hướng tự nhiên trên Android.

## Tính năng chính

- Mở nhanh cổng thông tin sinh viên UIT trong `WebView`.
- Splash screen riêng với animation logo khi khởi động app.
- Hỗ trợ nút `Back` trên Android để quay lại lịch sử trang.
- Xử lý popup hoặc mở tab mới ngay trong app thay vì đẩy ra trình duyệt ngoài.
- Sẵn cấu hình cho build Android qua Expo và EAS.

## Công nghệ sử dụng

- `Expo`
- `React 19`
- `React Native 0.81`
- `TypeScript`
- `react-native-webview`
- `expo-splash-screen`
- `EAS Build`

## Chạy local

### Yêu cầu

- `Node.js` 20+
- `npm`
- Expo tooling (`npx expo ...`)

### Cài đặt

```bash
npm install
```

### Khởi động dự án

```bash
npm run start
```

Một số lệnh hữu ích:

```bash
npm run android
npm run ios
npm run web
```

## Phát hành Android

Build trên cloud với EAS:

```bash
npm run build:android
```

Build file release cục bộ:

```bash
npm run build:android:release-local
```

Lưu ý:

- Script local release cần `expo prebuild` và Android SDK.
- Cần có `credentials.json` hợp lệ để nạp thông tin keystore.
- Script chuẩn bị ký số nằm tại `scripts/prepare-android-release.mjs`.

## Cấu trúc nhanh

```text
.
|- App.tsx
|- src/
|  |- components/
|  `- config/
|- assets/
`- scripts/
```

## Giấy phép

Dự án được phát hành theo [MIT License](./LICENSE).
