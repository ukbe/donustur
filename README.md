# Dönüştür - Geri Dönüşüm Ödül Platformu

Dönüştür, geri dönüşümü teşvik eden bir ödül sistemi sunan modern bir web uygulamasıdır. Kullanıcılar akıllı geri dönüşüm kutularındaki QR kodları tarayarak puan kazanabilir ve bu puanları çeşitli STK'lara bağış yapmak için kullanabilirler.

## 🌱 Özellikler

- **QR Kod Sistemi**: Kullanıcı kimlik doğrulama ve geri dönüşüm kutusu tanımlama için QR kod kullanımı
- **Puan Sistemi**: Her geri dönüşüm işlemi için puan kazanma
- **Kullanıcı Paneli**: Kazanılan puanları ve geri dönüşüm geçmişini görüntüleme
- **Bağış Seçenekleri**: Kazanılan puanları STK'lara bağışlama imkanı
- **Yönetici Paneli**: Uygulama verilerini yönetmek için kapsamlı yönetici arayüzü

## 🛠️ Teknoloji Altyapısı

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: AWS Amplify, GraphQL API, AWS Lambda
- **Veritabanı**: Amazon DynamoDB
- **Kimlik Doğrulama**: Amazon Cognito
- **Depolama**: Amazon S3
- **Dağıtım**: AWS Amplify Hosting

## 📋 Gereksiminler

- Node.js 18.x veya daha yeni
- AWS hesabı
- AWS Amplify CLI
- Yarn veya npm

## 💻 Kurulum ve Başlangıç

1. Repoyu klonlayın
```bash
git clone [repo-url]
cd donustur
```

2. Bağımlılıkları yükleyin
```bash
yarn install
```

3. Amplify'ı başlatın
```bash
npx ampx sandbox
```

4. Geliştirme sunucusunu başlatın
```bash
yarn dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açarak uygulamayı görüntüleyebilirsiniz.

## 🚀 Kurulum

Uygulamayı AWS Amplify'a kurmak için:

```bash
yarn deploy
```

## 📱 Kullanım Kılavuzu

### 🔐 Hesap Oluşturma ve Giriş

1. Ana sayfadaki "Hemen Başla" butonuna tıklayın
2. "Hesap Oluştur" seçeneğini seçin ve gerekli bilgileri doldurun
3. E-posta doğrulaması yapın ve giriş yapın

### 📱 QR Kod Kullanımı

1. Giriş yaptıktan sonra, kontrol panelinizdeki "QR Kodum" butonuna tıklayın
2. Oluşturulan QR kodu geri dönüşüm kutusundaki tarayıcıya gösterin
3. Geri dönüşüm kutusuna atıklarınızı atın
4. İşlem tamamlandığında puanlarınız otomatik olarak hesabınıza eklenecektir

### 📊 Puanlarınızı Görüntüleme

1. Kontrol panelinizde toplam puanlarınızı, kullanılan puanlarınızı ve mevcut puanlarınızı görebilirsiniz
2. Ayrıca son işlemlerinizin bir listesini de görebilirsiniz

### 🎁 Puanlarınızı Kullanma

1. "Bağış Yap" butonuna tıklayarak kurumlar sayfasına gidin
2. İstediğiniz STK'yı seçin ve "Bağış Yap" butonuna tıklayın
3. Bağış onayını verin
4. Puanlarınız seçtiğiniz kuruma bağışlanacaktır

## 📁 Proje Yapısı

```
src/
├── app/                # Next.js App Router
│   ├── page.tsx        # Ana sayfa
│   ├── (auth)/         # Kayıt ve giriş sayfaları
│   ├── (protected)/    # Kullanıcı sayfaları
│   │   ├── dashboard/  # Kullanıcı paneli
│   │   ├── qrcode/     # QR kod sayfası
│   │   └── marketplace/# Bağış kurumları
│   ├── admin/          # Yönetici paneli
│   └── scan/           # QR kod tarama işlemi
├── components/         # Arayüz bileşenleri
├── lib/                # Yardımcı fonksiyonlar ve API
└── types/              # TypeScript tanımlamaları

amplify/                # AWS Amplify yapılandırması
├── data/               # Veri modelleri ve şema
└── functions/          # Lambda fonksiyonları
```

## 📖 API Kullanımı

Uygulama aşağıdaki ana API işlevlerini kullanır:

### Kullanıcı İşlemleri
- `getUserScans`: Kullanıcı QR kod tarama geçmişini getirir
- `getUserStats`: Kullanıcı istatistiklerini (toplam puan, kullanılan puan vb.) getirir
- `getUserById`: Kullanıcı bilgilerini getirir

### Tarama İşlemleri
- `createScan`: Yeni bir tarama kaydı oluşturur
- `getBin`: Geri dönüşüm kutusu bilgilerini getirir

### Bağış İşlemleri
- `listCauses`: Bağış yapılabilecek STK'ları listeler
- `redeemForCause`: Puanları belirli bir STK'ya bağışlar

## 🔒 Güvenlik

Uygulama, AWS Cognito tabanlı kimlik doğrulama kullanır ve üç tür yetkilendirme seviyesine sahiptir:

- **Anonim Kullanıcılar**: Yalnızca genel sayfaları görüntüleyebilir
- **Kimliği Doğrulanmış Kullanıcılar**: Kendi hesaplarıyla ilgili işlemleri yapabilir
- **Yöneticiler**: Tüm sistem verilerine tam erişime sahiptir

## 🧩 Geliştirici Notları

### Veri Modelleri

**Temel Veri Modelleri**:
- `User`: Kullanıcı bilgileri
- `Scan`: Geri dönüşüm taramaları
- `Bin`: Geri dönüşüm kutuları
- `Cause`: STK'lar ve bağış projeleri
- `Redemption`: Bağış işlemleri

### QR Kod Sistemi

Sistem iki tür QR kod kullanır:
1. **Kullanıcı QR Kodu**: `/qrcode` sayfasında görüntülenir ve kullanıcı kimliğini içerir
2. **Kutu QR Kodu**: Her geri dönüşüm kutusunda bulunur ve kutu kimliğini içerir

### API Performans Optimizasyonu

Kullanıcı taramalarını getirirken, sistem önbelleğe alma ve toplu istekler kullanarak performansı optimize eder.
