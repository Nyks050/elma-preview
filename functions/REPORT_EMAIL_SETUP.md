# Şikâyet e-postası — etkinleştirme kontrolü

Hedef sabittir: `destek@elmago.com.tr`. Yeni bir yönetim paneli eklenmez.

## Henüz gerekenler

1. Mevcut Brevo hesabının kullanım onayı ve doğrulanmış bir `@elmago.com.tr` gönderici adresi.
2. `BREVO_API_KEY` yalnızca Firebase Secret Manager'a kaydedilmeli. Anahtar uygulamaya, Git'e veya loglara konulmamalı.
3. Functions yapılandırmasında `REPORT_EMAIL_FROM` doğrulanmış göndericiye ayarlanmalı.
4. Anahtar ve gönderici hazır olduğunda `index.js` sonuna `exports.emailLostFoundReport = require('./report-email-trigger').emailLostFoundReport;` eklenip **yalnızca** bu fonksiyon dağıtılmalı. Bu adımlar tamamlanmadan otomatik mail aktif değildir. Hazırlanan modül, mevcut güvenlik fonksiyonlarının dağıtımını engellememek için henüz `index.js` üzerinden dışa aktarılmıyor.
5. İzinli test hesabıyla ilan ve seçilmiş mesaj şikâyeti oluşturulmalı; Firestore kaydı, sağlayıcı kabulü ve destek gelen kutusu ayrı ayrı doğrulanmalı. Gerçek kullanıcılara test şikâyeti oluşturulmamalı.

## İşleyiş

- Şikâyet uygulamada kayıt olur; e-posta başarısız olsa da kayıt tutulur.
- Yalnızca yeni kayıtlar tetiklenir. Dağıtımdan önceki şikâyetler kendiliğinden gönderilmez; kontrollü geriye dönük gönderim ayrı onay gerektirir.
- Sağlayıcı kabulünde `emailDelivery.status=accepted` olur; bu, gelen kutusuna teslim edildi anlamına gelmez. Brevo gönderim kayıtlarında bounce/teslim durumları ayrıca izlenmelidir.
- Üç başarısız denemeden sonra kayıt `failed` olur; sunucu hata logu ve başarısız kayıtlar takip edilmeli. Normal tekrar teslimler atlanır. Ağ kesintisi sağlayıcı kabulünden hemen sonra olursa aynı vaka kimliğiyle mükerrer e-posta gelebilir; tam bir kere teslim garantisi yoktur.
- Mail yalnızca sabit destek adresine gider. HTML çalıştırılmaz. Özel sohbetin tamamı okunmaz; yalnızca bildirenin onaylayıp gönderdiği mesaj kanıtı eklenir. Kullanıcı metni bir iddiadır, doğrulanmış ihlal değildir.

## İnsan sorumluluğu

Destek kutusunu izleyecek kişi ve yanıtlama süresi belirlenmeli. Bildirim incelenmeli; gerekiyorsa mevcut yetkili yönetim araçlarıyla ilan kaldırılmalı veya hesap engellenmeli, işlem şikâyet kaydına kaydedilmeli. Maili yanıtlamak uygulamada otomatik işlem yapmaz. AI yalnızca uygun ilanları otomatik inceleyebilir; kullanıcı şikâyetlerini insan müdahalesi olmadan çözülmüş saymaz.

E-posta sağlayıcısının veri işleyici olarak kullanımı ve paylaşılan şikâyet kanıtları gizlilik metninde değerlendirilmelidir. Hesap silme uygulamadaki kayıtları temizler; destek posta kutusundaki kopyaların saklama/silme süreci ayrıca işletilmelidir.
