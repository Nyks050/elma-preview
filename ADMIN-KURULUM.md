# Elma Go Yönetim Paneli

Panel adresi: `https://elmago.com.tr/admin.html`

## Yönetici hesabı

Yönetici erişimi yalnızca `admin@elmago.com.tr` Google hesabına açıktır. Başka bir adres kullanılacaksa aynı adres iki yerde değiştirilmelidir:

- `admin.js` içindeki `ADMIN_EMAILS`
- `firestore.rules` içindeki `isAdmin()` kontrolü

İki kontrolün aynı kalması zorunludur. Yalnızca tarayıcı tarafındaki listeyi değiştirmek yetki vermez.

## Zorunlu Firebase adımı

Güncel `firestore.rules` dosyasını Firebase Console → Firestore Database → Kurallar bölümüne yapıştırıp **Yayınla** düğmesine basın. Kurallar yayınlanmadan panel veri okuyamaz veya yönetemez.

## Panel özellikleri

- Canlı ilan, şikâyet, sohbet ve kullanıcı istatistikleri
- İlanı çözme, yeniden aktifleştirme ve silme
- Şikâyeti çözme, reddetme ve silme
- Sohbeti kapatma veya sohbet kaydını silme
- Kullanıcıyı uygulama genelinde engelleme ve engeli kaldırma
- Şehir bazlı duyuru hazırlama, yayınlama ve arşivleme
- Bakım modu ve uygulama geneli üst bildirim
- Yakın ilan yarıçapı ve varsayılan ilan süresi ayarları
- Yönetici işlem geçmişi
- Tüm yönetim verisini JSON olarak dışa aktarma

## Güvenlik notu

Firebase Authentication kullanıcılarını tamamen silmek veya şifrelerini değiştirmek için güvenilir bir sunucuda Firebase Admin SDK gerekir. Bu statik panel, kullanıcıyı Firestore seviyesinde engeller; engellenen hesap ilan, mesaj ve şikâyet oluşturamaz.
