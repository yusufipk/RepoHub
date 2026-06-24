# RepoHub - Çok Platformlu Paket Yöneticisi

[🇬🇧 English](./README.md) | **🇹🇷 Türkçe**

**Linux, Windows ve macOS'te resmi depolardan yazılım kurulumunu basitleştirin.**

RepoHub, farklı işletim sistemlerinde paket keşfi ve kurulumu için birleşik bir arayüz sağlar.

## 🚀 Özellikler

-   **Çok Platformlu Destek**: Linux (Debian, Ubuntu, Arch, Fedora, Kali, Solus, Void), Windows ve macOS'te çalışır.
-   **Resmi Depolar**: Yazılımlara yalnızca güvenilir, resmi kaynaklardan erişin.
-   **Script Oluşturma**: Seçtiğiniz platform için idempotent kurulum scriptleri oluşturun.
-   **Akıllı Filtreleme**: Paketleri verimli bir şekilde bulun ve filtreleyin.
-   **Paket İkonları**: Popüler paketler için görsel ikonlar ile kolay tanıma.

## 🛠️ Teknoloji

### Frontend
-   **Framework**: Next.js 14+ (React)
-   **Stil**: Tailwind CSS
-   **İkonlar**: Lucide React
-   **Durum Yönetimi**: React Query + Zustand

### Backend
-   **Runtime**: Node.js (TypeScript)
-   **Veritabanı**: PostgreSQL
-   **Altyapı**: Docker

## 🏁 Başlangıç

### Gereksinimler

-   Node.js 18+
-   pnpm
-   Docker (isteğe bağlı, veritabanı için)

### Kurulum

1.  **Depoyu klonlayın:**
    ```bash
    git clone https://github.com/yusufipk/RepoHub.git
    cd RepoHub
    ```

2.  **Bağımlılıkları yükleyin:**
    ```bash
    pnpm install
    ```

3.  **Ortam Değişkenlerini Ayarlayın:**
    `.env.example` dosyasını `.env` olarak kopyalayın ve veritabanı bağlantınızı yapılandırın.
    ```bash
    cp .env.example .env
    ```

4.  **Veritabanını Başlatın:**
    Veritabanı şemasını kurmak ve migrasyonları uygulamak için başlatma scriptini çalıştırın.
    ```bash
    pnpm init:db
    ```

5.  **Geliştirme sunucusunu çalıştırın:**
    ```bash
    pnpm dev
    ```

    Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 🔄 API Kullanımı

### Depoları Senkronize Etme

API kullanarak depo senkronizasyonunu tetikleyebilirsiniz. Bu, paket veritabanını güncellemek için kullanışlıdır.

**Endpoint:** `POST /api/sync`

**Başlıklar:**
- `Content-Type`: `application/json`
- `x-sync-secret`: Senkronizasyon gizli anahtarınız (`SYNC_SERVER_ONLY=true` ise gerekli)

**Body Parametreleri:**
- `platform`: Senkronize edilecek platform. Seçenekler:
    - `debian`: Debian paketlerini senkronize et (Resmi Repo)
    - `ubuntu`: Ubuntu paketlerini senkronize et (Resmi Repo)
    - `arch`: Arch Linux paketlerini senkronize et (Resmi Repo)
    - `aur`: Arch User Repository (AUR) paketlerini senkronize et
    - `fedora`: Fedora paketlerini senkronize et (Resmi Repo)
    - `windows`: Windows paketlerini senkronize et (Winget)
    - `macos`: macOS paketlerini senkronize et (Homebrew)
    - `all`: Tüm platformları senkronize et

**Örnek İstek:**

```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -H "x-sync-secret: gizli_anahtariniz" \
  -d '{"platform": "all"}'
```

## 📦 Paket Önerilerine Katkıda Bulunma

[🇬🇧 English](./README.md) | **🇹🇷 Türkçe**

RepoHub, kullanıcılara kişiselleştirilmiş öneriler sunmak için düzenlenmiş paket listeleri kullanır. Paket ekleyerek bu önerileri geliştirmeye yardımcı olabilirsiniz!

### Paket Nasıl Eklenir

Paket önerileri [/src/data/recommendationPresets.ts](./src/data/recommendationPresets.ts) dosyasında saklanır.

#### 1. Doğru Konumu Bulun

Paketinizin ait olduğu platform ve kategoriye gidin:

```typescript
export const PACKAGE_PRESETS = {
  windows: {
    development: ["Git.Git", "Microsoft.VisualStudioCode"],
    design: ["GIMP.GIMP", "Inkscape.Inkscape"],
    // ... diğer kategoriler
  },
  // ... diğer platformlar
}
```

**Mevcut Platformlar:**
- `windows` - Windows (Winget)
- `macos` - macOS (Homebrew)
- `ubuntu` - Ubuntu (APT)
- `debian` - Debian (APT)
- `arch` - Arch Linux (Pacman/AUR)
- `fedora` - Fedora (DNF)

**Mevcut Kategoriler:**
- `development` - Geliştirme araçları, IDE'ler, derleyiciler
- `design` - Grafik, kreatif yazılımlar
- `multimedia` - Medya oynatıcılar, editörler
- `system-tools` - Sistem araçları
- `gaming` - Oyun başlatıcıları, platformlar
- `productivity` - Ofis, tarayıcılar, üretkenlik uygulamaları
- `education` - Eğitim yazılımları

#### 2. Doğru Paket Adını Alın

**⚠️ KRİTİK:** Paket adları veritabanında göründükleri gibi **tam olarak** eşleşmelidir.

**Platformlara göre paket adı formatları:**

- **Windows**: `Yayinci.PaketAdi` (örn., `Microsoft.VisualStudioCode`)
- **macOS**: kucuk-harf-tireli (örn., `visual-studio-code`)
- **Linux**: küçük harf, dağıtıma göre değişir (örn., `code`, `docker.io`)

#### 3. Paketin Var Olduğunu Doğrulayın

**Seçenek A: Doğrulama Scriptini Kullanma (Önerilen)**

Veritabanı erişiminiz varsa:

```bash
# Belirli bir platformu doğrula
npm run validate:presets -- windows

# Birden fazla platformu doğrula
npm run validate:presets -- ubuntu debian arch

# Tüm platformları doğrula
npm run validate:presets -- --all
```

Script şunları gösterecek:
- ✅ Veritabanında bulunan paketler
- ❌ Bulunamayan paketler
- 💡 Benzer paket önerileri

**Seçenek B: Manuel Doğrulama**

Veritabanı erişiminiz yoksa:

1. Canlı RepoHub web sitesinde arama yapın
2. Arama sonuçlarında paketinizi bulun
3. Görüntülenen **tam paket adını** kopyalayın
4. Veya resmi paket depolarını kontrol edin:
   - Windows: [winget.run](https://winget.run/)
   - macOS: `brew search <paket>`
   - Ubuntu/Debian: `apt search <paket>`
   - Arch: [archlinux.org/packages](https://archlinux.org/packages/)
   - Fedora: [packages.fedoraproject.org](https://packages.fedoraproject.org/)

#### 4. Paketi Ekleyin

Paket adını diziye ekleyin:

```typescript
windows: {
  development: [
    "Git.Git",
    "Microsoft.VisualStudioCode",
    "Docker.DockerDesktop"  // ← Yeni paketiniz
  ]
}
```

#### 5. İkon Ekleyin (İsteğe Bağlı)

Paketin önerilerde daha iyi görünmesi için `PACKAGE_ICONS` içine bir ikon eşlemesi ekleyin:

1.  [Simple Icons](https://simpleicons.org/)'da paket slug'ını bulun
2.  [src/data/recommendationPresets.ts](./src/data/recommendationPresets.ts) dosyasındaki `PACKAGE_ICONS` nesnesine ekleyin:

```typescript
export const PACKAGE_ICONS: Record<string, string> = {
  // ...
  "Docker.DockerDesktop": "docker", // Anahtar paket adıyla eşleşmeli, Değer Simple Icons slug'ı olmalı
  // ...
};
```

İkon eklenmezse, varsayılan paket ikonu kullanılacaktır.

#### 6. Değişikliklerinizi Test Edin

1. Doğrulamayı çalıştırın:
   ```bash
   npm run validate:presets -- windows
   ```

2. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

3. Uygulamada test edin:
   - Onboarding'i tamamlayın
   - İlgili kategoriyi seçin
   - Paketinizin önerilerde görünüp görünmediğini kontrol edin

### Kısaca

**✅**
- Doğrulama scriptini kullanarak paket adlarını doğrulayın
- Popüler olan paketler ekleyin
- Göndermeden önce test edin
- Resmi depolardan tam paket adlarını kullanın

**❌**
- Paket adlarını tahmin etmeyin
- Kullanımdan kaldırılmış paketler eklemeyin
- Doğrulamayı atlamayın
- Kategoriler arasında tekrar eklemeyin

### Örnek Pull Request

```
Windows Önerilerine Popüler Geliştirme Araçları Eklendi

- development'a Docker.DockerDesktop eklendi
- development'a Postman.Postman eklendi
- Doğrulama: ✅ Tüm paketler doğrulandı (%100 bulundu)
```

## 🤝 Katkıda Bulunma

1.  Projeyi fork edin
2.  Feature branch'inizi oluşturun (`git checkout -b feature/HarikaBirOzellik`)
3.  Değişikliklerinizi commit edin (`git commit -m 'Harika bir özellik ekle'`)
4.  Branch'inizi push edin (`git push origin feature/HarikaBirOzellik`)
5.  Bir Pull Request açın
