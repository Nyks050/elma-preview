'use strict';

function codeMail(purpose, code) {
  if (!['register', 'reset'].includes(purpose) || !/^\d{6}$/.test(code)) throw new Error('INVALID_MAIL_TEMPLATE_INPUT');
  const reset = purpose === 'reset';
  const title = reset ? 'Şifreni yenile.' : 'Elma Go’ya hoş geldin.';
  const subject = reset ? 'Elma Go şifre yenileme kodun' : 'Elma Go e-posta doğrulama kodun';
  const explanation = reset ? 'Şifreni yenilemek için aşağıdaki kodu Elma Go’da açılan ekrana gir.'
    : 'Hesabını oluşturmak için aşağıdaki kodu Elma Go’da açılan doğrulama ekranına gir.';
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f3f3f4;font-family:Arial,Helvetica,sans-serif;color:#111111">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${subject}. Kodu Elma Go ekranına girerek devam edebilirsin.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f4"><tr><td align="center" style="padding:36px 16px">
<table role="presentation" width="500" cellpadding="0" cellspacing="0" style="width:100%;max-width:500px;background:#ffffff;border:1px solid #e6e6e8;border-radius:24px">
<tr><td align="center" style="padding:38px 32px 28px"><img src="https://elmago.com.tr/assets/elmago-wordmark-dark.png?v=20260918-alpha1" alt="Elma Go" width="190" style="display:block;width:190px;max-width:100%;height:auto;border:0"></td></tr>
<tr><td style="padding:0 32px"><div style="height:1px;background:#ececee;font-size:1px;line-height:1px">&nbsp;</div></td></tr>
<tr><td align="center" style="padding:32px 28px 12px"><h1 style="margin:0;font-size:27px;line-height:35px;font-weight:700;letter-spacing:-0.7px">${title}</h1></td></tr>
<tr><td align="center" style="padding:0 36px 26px;font-size:15px;line-height:23px;color:#77777c">${explanation}</td></tr>
<tr><td style="padding:0 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#101012;border-radius:17px"><tr><td align="center" style="padding:17px 12px 7px;font-size:10px;font-weight:700;letter-spacing:2px;color:#b4b4b9">DOĞRULAMA KODUN</td></tr><tr><td align="center" style="padding:0 6px 23px 16px;font-family:Arial,Helvetica,sans-serif;font-size:39px;line-height:52px;letter-spacing:10px;font-weight:700;color:#ffffff;white-space:nowrap">${code}</td></tr></table></td></tr>
<tr><td align="center" style="padding:25px 34px 32px;font-size:12px;line-height:19px;color:#8b8b90">Kodunu kimseyle paylaşma.<br>Bu işlemi sen başlatmadıysan e-postayı yok sayabilirsin.</td></tr>
</table><table role="presentation" width="500" cellpadding="0" cellspacing="0" style="width:100%;max-width:500px"><tr><td align="center" style="padding:23px 16px;font-size:11px;line-height:18px;color:#929297">Elma Go · Amasya<br>Destek: destek@elmago.com.tr</td></tr></table>
</td></tr></table></body></html>`;
  // Multipart alternative supports assistive technology and clients that
  // explicitly request text. HTML is the normal branded display.
  return {subject, html, text: `${subject}: ${code}\n\n${explanation}\nKodunu kimseyle paylaşma. Bu işlemi sen başlatmadıysan e-postayı yok sayabilirsin.\nElma Go · destek@elmago.com.tr`};
}
module.exports = {codeMail};

