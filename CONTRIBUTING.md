# Contributing to RepoHub

[🇬🇧 English](#english) | [🇹🇷 Türkçe](#türkçe)

---

## English

Thank you for your interest in contributing to RepoHub! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Adding Package Recommendations](#adding-package-recommendations)

## 📜 Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher
- pnpm package manager
- Docker and Docker Compose (recommended)
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/RepoHub.git
   cd RepoHub
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/yusufipk/RepoHub.git
   ```

## 🛠️ Development Setup

### Option 1: Using Docker (Recommended)

```bash
# Start only the database
make dev-db
# or
docker-compose -f docker-compose.dev.yml up -d

# Copy environment file
cp .env.local.example .env

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Option 2: Manual Setup

```bash
# Install PostgreSQL locally

# Copy and configure environment
cp .env.local.example .env
# Edit .env with your database credentials

# Install dependencies
pnpm install

# Initialize database
pnpm init:db

# Run development server
pnpm dev
```

The application will be available at http://localhost:3002

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug:
1. Check if it's already reported in [Issues](https://github.com/yusufipk/RepoHub/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

For feature requests:
1. Check existing [Issues](https://github.com/yusufipk/RepoHub/issues) first
2. Create a new issue explaining:
   - The problem it solves
   - Proposed solution
   - Alternative solutions considered
   - Additional context

### Contributing Code

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes:**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes:**
   ```bash
   # Type check
   pnpm type-check
   
   # Validate package presets (if applicable)
   pnpm validate:presets -- --all
   
   # Test in browser
   pnpm dev
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   See [Commit Guidelines](#commit-guidelines) below.

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request:**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Wait for review

## 💻 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types when possible
- Use interfaces for object types

### React/Next.js

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Implement error boundaries where appropriate

### Styling

- Use Tailwind CSS utility classes
- Follow existing component patterns
- Ensure responsive design
- Test on different screen sizes

### File Organization

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── services/         # Business logic
├── lib/             # Utilities and helpers
├── types/           # TypeScript type definitions
└── data/            # Static data and presets
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat: add dark mode support"

# Bug fix
git commit -m "fix: resolve pagination issue on package list"

# Documentation
git commit -m "docs: update Docker installation guide"

# Multiple paragraphs
git commit -m "feat: implement package filtering

- Add filter by category
- Add filter by platform
- Update UI components

Closes #123"
```

### Best Practices

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Keep first line under 72 characters
- Reference issues and PRs when applicable
- Explain *what* and *why*, not *how*

## 🔍 Pull Request Process

1. **Before submitting:**
   - Ensure all tests pass
   - Update documentation
   - Add tests for new features
   - Follow code style guidelines
   - Rebase on latest main branch

2. **PR Title:**
   - Use conventional commit format
   - Be descriptive but concise
   - Example: `feat: add package search history`

3. **PR Description:**
   - Explain what changes were made
   - Why these changes are needed
   - How to test the changes
   - Screenshots/videos for UI changes
   - Link related issues

4. **Review Process:**
   - Wait for maintainer review
   - Address review comments
   - Be open to feedback
   - Make requested changes
   - Be patient and respectful

5. **After Approval:**
   - Maintainer will merge your PR
   - Delete your branch after merge
   - Celebrate your contribution! 🎉

## 📦 Adding Package Recommendations

See detailed guide in [README.md](./README.md#-contributing-to-package-recommendations)

### Quick Steps

1. Find the right category in `/src/data/recommendationPresets.ts`
2. Get the exact package name from the database
3. Add package to the array
4. (Optional) Add icon mapping
5. Validate: `pnpm validate:presets -- <platform>`
6. Test in the application
7. Submit PR

### Example PR

```
feat: add popular development tools to Windows recommendations

- Added Docker.DockerDesktop to development category
- Added Postman.Postman to development category  
- Added Visual Studio 2022 Community to development category
- Validation: ✅ All packages verified (100% found)

All packages tested and confirmed available in the database.
```

## 🐛 Debugging

### Common Issues

**Port already in use:**
```bash
# Find and kill process
lsof -i :3002  # macOS/Linux
# Then kill the process or change port in .env
```

**Database connection failed:**
```bash
# Ensure Docker container is running
docker-compose -f docker-compose.dev.yml ps

# Check logs
docker-compose -f docker-compose.dev.yml logs postgres
```

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## ❓ Questions?

- Check existing [Issues](https://github.com/yusufipk/RepoHub/issues)
- Ask in [Discussions](https://github.com/yusufipk/RepoHub/discussions)
- Read [Documentation](./README.md)

## 🙏 Thank You!

Your contributions make RepoHub better for everyone. We appreciate your time and effort!

---

## Türkçe

RepoHub'a katkıda bulunmak istediğiniz için teşekkürler! Bu belge, projeye katkıda bulunmak için yönergeler ve talimatlar sağlar.

## 📋 İçindekiler

- [Davranış Kuralları](#davranış-kuralları)
- [Başlarken](#başlarken)
- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Nasıl Katkıda Bulunulur](#nasıl-katkıda-bulunulur)
- [Kodlama Standartları](#kodlama-standartları)
- [Commit Kuralları](#commit-kuralları)
- [Pull Request Süreci](#pull-request-süreci)
- [Paket Önerileri Ekleme](#paket-önerileri-ekleme)

## 📜 Davranış Kuralları

Bu projeye katılarak şunları kabul edersiniz:
- Saygılı ve kapsayıcı olmak
- Yeni gelenleri karşılamak ve öğrenmelerine yardımcı olmak
- Topluluk için en iyisine odaklanmak
- Diğer topluluk üyelerine empati göstermek

## 🚀 Başlarken

### Gereksinimler

Başlamadan önce şunlara sahip olduğunuzdan emin olun:
- Node.js 18 veya üstü
- pnpm paket yöneticisi
- Docker ve Docker Compose (önerilen)
- Git

### Fork ve Clone

1. GitHub'da repository'yi fork edin
2. Fork'unuzu yerel olarak klonlayın:
   ```bash
   git clone https://github.com/KULLANICI_ADINIZ/RepoHub.git
   cd RepoHub
   ```
3. Upstream remote ekleyin:
   ```bash
   git remote add upstream https://github.com/yusufipk/RepoHub.git
   ```

## 🛠️ Geliştirme Ortamı

### Seçenek 1: Docker Kullanarak (Önerilen)

```bash
# Sadece veritabanını başlat
make dev-db
# veya
docker-compose -f docker-compose.dev.yml up -d

# Environment dosyasını kopyala
cp .env.local.example .env

# Bağımlılıkları yükle
pnpm install

# Geliştirme sunucusunu çalıştır
pnpm dev
```

### Seçenek 2: Manuel Kurulum

```bash
# PostgreSQL'i yerel olarak kurun

# Environment'ı kopyala ve yapılandır
cp .env.local.example .env
# .env dosyasını veritabanı bilgilerinizle düzenleyin

# Bağımlılıkları yükle
pnpm install

# Veritabanını başlat
pnpm init:db

# Geliştirme sunucusunu çalıştır
pnpm dev
```

Uygulama http://localhost:3002 adresinde çalışacaktır.

## 🤝 Nasıl Katkıda Bulunulur

### Hata Bildirme

Bir hata bulursanız:
1. [Issues](https://github.com/yusufipk/RepoHub/issues) kısmında zaten bildirilip bildirilmediğini kontrol edin
2. Bildirilmediyse, şunları içeren yeni bir issue oluşturun:
   - Açık başlık ve açıklama
   - Tekrar üretme adımları
   - Beklenen ve gerçekleşen davranış
   - Varsa ekran görüntüleri
   - Ortam detayları (OS, Node versiyonu, vb.)

### Özellik Önerme

Özellik istekleri için:
1. Önce mevcut [Issues](https://github.com/yusufipk/RepoHub/issues)'ları kontrol edin
2. Şunları açıklayan yeni bir issue oluşturun:
   - Çözdüğü problem
   - Önerilen çözüm
   - Değerlendirilen alternatif çözümler
   - Ek bağlam

### Kod Katkısı

1. **Branch oluşturun:**
   ```bash
   git checkout -b feature/ozellik-adiniz
   # veya
   git checkout -b fix/hata-duzeltmeniz
   ```

2. **Değişikliklerinizi yapın:**
   - Temiz, okunabilir kod yazın
   - Mevcut kod stilini takip edin
   - Karmaşık mantık için yorum ekleyin
   - Gerekirse dokümantasyonu güncelleyin

3. **Değişikliklerinizi test edin:**
   ```bash
   # Tip kontrolü
   pnpm type-check
   
   # Paket preset'lerini doğrula (uygunsa)
   pnpm validate:presets -- --all
   
   # Tarayıcıda test et
   pnpm dev
   ```

4. **Değişikliklerinizi commit edin:**
   ```bash
   git add .
   git commit -m "feat: harika özellik eklendi"
   ```
   Aşağıdaki [Commit Kuralları](#commit-kuralları) bölümüne bakın.

5. **Fork'unuza push edin:**
   ```bash
   git push origin feature/ozellik-adiniz
   ```

6. **Pull Request oluşturun:**
   - Orijinal repository'ye gidin
   - "New Pull Request" tıklayın
   - Branch'inizi seçin
   - PR şablonunu doldurun
   - İnceleme için bekleyin

## 💻 Kodlama Standartları

### TypeScript

- Tüm yeni kod için TypeScript kullanın
- Uygun tip tanımlamaları sağlayın
- Mümkün olduğunca `any` tipinden kaçının
- Nesne tipleri için interface kullanın

### React/Next.js

- Hook'larla fonksiyonel bileşenler kullanın
- Bileşenleri küçük ve odaklı tutun
- Uygun prop tiplerini kullanın
- Uygun yerlerde error boundary uygulayın

### Stil

- Tailwind CSS utility class'larını kullanın
- Mevcut bileşen kalıplarını takip edin
- Responsive tasarım sağlayın
- Farklı ekran boyutlarında test edin

### Dosya Organizasyonu

```
src/
├── app/              # Next.js app dizini
├── components/       # React bileşenleri
├── services/         # İş mantığı
├── lib/             # Yardımcı araçlar
├── types/           # TypeScript tip tanımlamaları
└── data/            # Statik veri ve preset'ler
```

## 📝 Commit Kuralları

[Conventional Commits](https://www.conventionalcommits.org/) standardını takip ediyoruz:

### Format

```
<tip>(<kapsam>): <konu>

<gövde>

<alt bilgi>
```

### Tipler

- `feat`: Yeni özellik
- `fix`: Hata düzeltmesi
- `docs`: Dokümantasyon değişiklikleri
- `style`: Kod stili değişiklikleri (formatlama, vb.)
- `refactor`: Kod yeniden yapılandırma
- `perf`: Performans iyileştirmeleri
- `test`: Test ekleme veya güncelleme
- `chore`: Bakım görevleri
- `ci`: CI/CD değişiklikleri

### Örnekler

```bash
# Özellik
git commit -m "feat: karanlık mod desteği eklendi"

# Hata düzeltmesi
git commit -m "fix: paket listesindeki sayfalama sorunu çözüldü"

# Dokümantasyon
git commit -m "docs: Docker kurulum rehberi güncellendi"

# Çok paragraflı
git commit -m "feat: paket filtreleme eklendi

- Kategoriye göre filtreleme eklendi
- Platforma göre filtreleme eklendi
- UI bileşenleri güncellendi

Closes #123"
```

### En İyi Uygulamalar

- Şimdiki zaman kullanın ("özellik ekle" not "özellik eklendi")
- Emir kipi kullanın
- İlk satırı 72 karakterin altında tutun
- Uygun olduğunda issue ve PR'lara referans verin
- *Ne* ve *neden*'i açıklayın, *nasıl*'ı değil

## 🔍 Pull Request Süreci

1. **Göndermeden önce:**
   - Tüm testlerin geçtiğinden emin olun
   - Dokümantasyonu güncelleyin
   - Yeni özellikler için testler ekleyin
   - Kod stili kurallarını takip edin
   - En son main branch üzerinde rebase yapın

2. **PR Başlığı:**
   - Conventional commit formatı kullanın
   - Açıklayıcı ama öz olun
   - Örnek: `feat: paket arama geçmişi eklendi`

3. **PR Açıklaması:**
   - Hangi değişikliklerin yapıldığını açıklayın
   - Bu değişikliklerin neden gerekli olduğunu
   - Değişikliklerin nasıl test edileceğini
   - UI değişiklikleri için ekran görüntüleri/videolar
   - İlgili issue'lara bağlantı

4. **İnceleme Süreci:**
   - Maintainer incelemesini bekleyin
   - İnceleme yorumlarını ele alın
   - Geri bildirimlere açık olun
   - İstenen değişiklikleri yapın
   - Sabırlı ve saygılı olun

5. **Onaydan Sonra:**
   - Maintainer PR'ınızı merge edecek
   - Merge'den sonra branch'inizi silin
   - Katkınızı kutlayın! 🎉

## 📦 Paket Önerileri Ekleme

Detaylı rehber için [README.tr.md](./README.tr.md#-paket-önerilerine-katkıda-bulunma)'ye bakın

### Hızlı Adımlar

1. `/src/data/recommendationPresets.ts`'de doğru kategoriyi bulun
2. Veritabanından tam paket adını alın
3. Paketi diziye ekleyin
4. (İsteğe bağlı) İkon eşlemesi ekleyin
5. Doğrula: `pnpm validate:presets -- <platform>`
6. Uygulamada test edin
7. PR gönderin

### Örnek PR

```
feat: Windows önerilerine popüler geliştirme araçları eklendi

- development kategorisine Docker.DockerDesktop eklendi
- development kategorisine Postman.Postman eklendi
- development kategorisine Visual Studio 2022 Community eklendi
- Doğrulama: ✅ Tüm paketler doğrulandı (%100 bulundu)

Tüm paketler test edildi ve veritabanında mevcut olduğu onaylandı.
```

## 🐛 Hata Ayıklama

### Yaygın Sorunlar

**Port zaten kullanımda:**
```bash
# İşlemi bulun ve sonlandırın
lsof -i :3002  # macOS/Linux
# Sonra işlemi sonlandırın veya .env'de portu değiştirin
```

**Veritabanı bağlantısı başarısız:**
```bash
# Docker container'ının çalıştığından emin olun
docker-compose -f docker-compose.dev.yml ps

# Logları kontrol edin
docker-compose -f docker-compose.dev.yml logs postgres
```

**Build hataları:**
```bash
# Cache'i temizle ve yeniden yükle
rm -rf node_modules .next
pnpm install
pnpm dev
```

## 📚 Kaynaklar

- [Next.js Dokümantasyonu](https://nextjs.org/docs)
- [React Dokümantasyonu](https://react.dev)
- [TypeScript El Kitabı](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PostgreSQL Dokümantasyonu](https://www.postgresql.org/docs/)

## ❓ Sorular?

- Mevcut [Issues](https://github.com/yusufipk/RepoHub/issues)'ları kontrol edin
- [Discussions](https://github.com/yusufipk/RepoHub/discussions)'da sorun
- [Dokümantasyonu](./README.tr.md) okuyun

## 🙏 Teşekkürler!

Katkılarınız RepoHub'ı herkes için daha iyi hale getiriyor. Zamanınız ve çabanız için teşekkür ederiz!

