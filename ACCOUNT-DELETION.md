# Hesap silme dağıtım notu

Bu değişiklik **Gizlilik Politikası metni ve Firebase sunucu dağıtımı tamamlanmadan yayımlanmaz**. `pending` politika sürümü canlıya çıkarsa mevcut kullanıcılar yeni kayıt ve ilan oluşturamaz.

1. Kullanıcının vereceği politikayı `index.html`, `app-guncel.html` ve `privacy.html` içine aynen yerleştir. Metnin değişmez sürümünü `window.ELMAGO_POLICY_VERSION`, `firestore.rules` ve `storage.rules` içinde aynı değere ayarla.
2. Firebase projesi `elma-bd38c` için Cloud Functions dağıtımına izin veren Blaze planını ve yetkili Firebase CLI oturumunu hazırla. `firebase deploy --project elma-bd38c --only functions,firestore:rules,storage` komutuyla sunucuyu ve kuralları birlikte dağıt. Storage kurallarının Firestore'a erişmesi için istenen ürünler arası izni etkinleştir.
3. `deleteMyAccount` işlevi ve `purgeAccountDeletionLocks` zamanlayıcısı yayımlandıktan sonra site dosyalarını yayımla. Test hesabı açıp ilan, şikâyet, çift taraflı sohbet ve dosya üret; hesabı sil. Auth kaydının, belge ve alt koleksiyonların ve Storage dosyalarının kaldırıldığını hem Firebase konsolundan hem diğer sohbet katılımcısı ekranından doğrula. Ardından başarısız silme ve yeniden deneme akışını dene.
4. E-posta doğrulama kodları `elma-go-auth.purple-hill-3b24.workers.dev` üzerinden gönderiliyor. Bu Worker'ın saklama ve günlükleme politikasına erişim olmadan kodların ve erişim günlüklerinin anında silindiği iddia edilemez; gerekiyorsa Worker tarafına hesap silme temizliği ekle.

Silme işlemi ilişkili sohbetleri karşı taraftan da kaldırır. Yeni yazıları engelleyen `accountDeletionLocks/{uid}` kilidi silme sırasında ve eski Firebase kimlik belirteçleri sona erene kadar kalır; zamanlayıcı hesabın silindiğini doğruladıktan sonra kilidi temizler. Altyapı sağlayıcısının yedekleri ve hizmet günlükleri üzerinde uygulama kodu anlık sıfırlama garantisi veremez.
