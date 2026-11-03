import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'توسط Keyrook',

  // Common
  'common.cancel': 'لغو',
  'common.close': 'بستن',
  'common.save': 'ذخیره',
  'common.edit': 'ویرایش',
  'common.back': 'بازگشت',
  'common.show': 'نمایش',
  'common.hide': 'پنهان کردن',
  'common.notNow': 'الان نه',

  // Setup
  'setup.title': 'گاوصندوق خود را بسازید',
  'setup.body':
    'Passhold گذرواژه‌های شما را روی این دستگاه رمزگذاری‌شده نگه می‌دارد. یک گذرواژه اصلی آن‌ها را باز می‌کند — گذرواژه‌ای انتخاب کنید که به یاد بسپارید و هیچ جای دیگری به کار نبرید.',
  'setup.password': 'گذرواژه اصلی',
  'setup.confirm': 'دوباره وارد کنید',
  'setup.mismatch': 'این دو گذرواژه یکی نیستند.',
  'setup.tooShort': 'دست‌کم {min} کاراکتر به کار ببرید.',
  'setup.understand':
    'می‌دانم که هیچ‌کس — نه Passhold، نه Keyrook — نمی‌تواند گاوصندوق مرا بازیابی کند اگر این گذرواژه را فراموش کنم.',
  'setup.create': 'ساختن گاوصندوق',
  'setup.creating': 'در حال ساختن…',
  'setup.restore': 'بازیابی از یک پشتیبان',

  // Strength
  'setup.deviceBody':
    'Passhold گذرواژه‌های شما را روی این دستگاه رمزگذاری‌شده نگه می‌دارد و {method} آن‌ها را باز می‌کند — گذرواژه اصلی‌ای نیست که بسازید یا به خاطر بسپارید. همچنین یک کلید بازیابی دریافت می‌کنید، برای روزی که {method} نتواند.',
  'setup.deviceWhereMac': 'وقتی Chrome می‌پرسد کلید عبور کجا ذخیره شود، Google Password Manager را انتخاب کنید.',
  'setup.deviceWhereMacEdge':
    'وقتی Edge می‌پرسد کلید عبور کجا ذخیره شود، جایی را انتخاب کنید که آن را روی دستگاه‌های دیگرتان هم نگه دارد. همه جاها نمی‌توانند Passhold را باز کنند: اگر این یکی نتواند، Passhold این را می‌گوید.',
  'setup.createWithDevice': 'ساختن با {method}',
  'setup.usePassword': 'به‌جایش یک گذرواژه اصلی به کار ببرید',
  'setup.useDevice': 'به‌جایش {method} را به کار ببرید',
  'setup.signIn': 'ورود به حساب Keyrook یا ساختن آن',

  'welcome.title': 'گذرواژه‌های شما، روی هر رایانه',
  'welcome.body': 'یک بار وارد شوید. Passhold با اثرانگشت شما باز می‌شود، برایتان پر می‌کند، و ورودهای شما هر جا که وارد شوید هستند.',
  'welcome.email': 'استفاده از نشانی ایمیل',
  'gate.touchTitle': 'با یک لمس باز کنید',
  'gate.touchBody': 'Touch ID یا Windows Hello، Passhold را باز می‌کند. گذرواژه اصلی‌ای نیست که بسازید و به خاطر بسپارید.',
  'gate.everywhereTitle': 'روی هر رایانه‌ای که استفاده می‌کنید',
  'gate.everywhereBody': 'روی رایانه دیگری وارد شوید و گذرواژه‌ها و کلیدهای عبور شما آنجا هستند.',
  'gate.privateTitle': 'فقط شما می‌توانید آن‌ها را بخوانید',
  'gate.privateBody':
    'پیش از ارسال هر چیزی، روی همین رایانه رمزگذاری می‌شود. Keyrook نمی‌تواند گذرواژه‌های شما را بخواند، و نمی‌داند برای کدام سایت‌ها هستند.',
  'welcome.note':
    'ابتدا روی همین رایانه رمزگذاری می‌شود: Keyrook نمی‌تواند گذرواژه‌های شما را بخواند، و نمی‌داند برای کدام سایت‌ها هستند.',
  'connect.title': 'حساب Keyrook خود را روشن کنید',
  'connect.body': 'ورودهای شما روی هر رایانه‌ای که استفاده می‌کنید — و پشتیبان آن‌ها اگر این رایانه گم شود.',
  'connect.email': 'ایمیل',
  'kitCheck.title': 'کلید بازیابی حساب خود را بررسی کنید',
  'kitCheck.body': 'یک بار آن را وارد کنید تا پیش از روزی که به آن نیاز دارید مطمئن شوید هنوز دارید.',
  'accountPasskey.button': 'ادامه با کلید عبور',
  'accountPasskey.working': 'در انتظار کلید عبور…',
  'accountPasskey.hint':
    'کلیدی که در account.keyrook.com افزوده‌اید. بار اول، {browser} از شما می‌پرسد که به Passhold اجازه دهد از آن استفاده کند.',
  'accountPasskey.openPasskeys': '«Passkeys» را در account.keyrook.com باز کنید',
  'join.title': 'ورود به Keyrook',
  'join.body': 'یک حساب Keyrook برای Passhold و Keyrook Authenticator. ورودهای شما از حساب به این مرورگر می‌آیند.',
  'join.createTitle': 'ساختن حساب Keyrook',
  'join.createBody':
    'یک حساب برای Passhold و Keyrook Authenticator: ورودهای شما، که پیش از هر چیز روی این دستگاه رمزگذاری می‌شوند، روی هر رایانه‌ای که وارد می‌شوید.',
  'join.lockTitle': 'ورود با {email}',
  'join.lockBodyDevice': 'مرحله آخر: Passhold روی این رایانه با {method} باز می‌شود. وقتی تنظیم شد، ورودهای شما پایین می‌آیند.',
  'join.cancel': 'استفاده از حساب دیگر',
  'join.lockBodyCode': 'مرحله آخر: کدی که Passhold را روی این رایانه باز می‌کند. وقتی تنظیم شد، ورودهای شما پایین می‌آیند.',
  'join.opening': 'در حال باز کردن Passhold…',
  'setup.useAccountPassword': 'به‌جایش گذرواژه حسابم را به کار ببرید',
  'setup.useCode': 'به‌جایش کدی برای این رایانه به کار ببرید',
  'security.accountPasswordTitle': 'با گذرواژه حساب Keyrook باز می‌شود',
  'security.accountPasswordBody':
    'یک گذرواژه برای هر دو. وقتی عوض شود، Passhold اینجا در ورود بعدی شما آن را دنبال می‌کند.',

  'recovery.title': 'کلید بازیابی خود را ذخیره کنید',
  'recovery.body':
    'اگر این دستگاه گم شود، یا قفل‌گشایی‌اش دیگر کار نکند، این کلید راه بازگشت به گاوصندوق و پشتیبان‌های آن است. تا وقتی Passhold هنوز باز می‌شود، می‌توانید دوباره آن را در تنظیمات ببینید — پس جای دیگری هم نگهش دارید: چاپ‌شده، روی تلفنتان، یا در فایلی دور از این رایانه.',
  'recovery.download': 'دانلود',
  'recovery.copy': 'کپی',
  'recovery.copied': 'کپی شد',
  'recovery.print': 'چاپ',
  'recovery.qr': 'نمایش کد QR',
  'recovery.qrHide': 'پنهان کردن کد QR',
  'recovery.qrLabel': 'کلید بازیابی به‌صورت کد QR',
  'recovery.qrHint': 'دوربین تلفنتان را به آن بگیرید و متن را در یک یادداشت ذخیره کنید، یا از آن عکس بگیرید.',
  'recovery.show': 'نمایش',

  'kit.title': 'برگه بازیابی Passhold',
  'kit.made': 'ساخته‌شده در {date}',
  'kit.keyLabel': 'کلید بازیابی',
  'kit.whenTitle': 'وقتی Passhold باز نمی‌شود',
  'kit.sameDevice':
    'روی همین رایانه: وقتی Passhold برای قفل‌گشایی می‌پرسد، «به‌جایش از کلید بازیابی استفاده کنید» را انتخاب کنید و کلید را تایپ کنید.',
  'kit.newDevice':
    'روی رایانه جدید: Passhold را نصب کنید، «بازیابی از یک پشتیبان» را انتخاب کنید، جدیدترین فایل پشتیبانتان را برگزینید و کلید را وارد کنید. بدون پشتیبان چیزی برای بازیابی نیست، پس یکی بسازید.',
  'kit.keep': 'این برگه را دور از رایانه‌تان در جای امنی نگه دارید. هر کس آن را و یک نسخه از گاوصندوق‌تان داشته باشد، می‌تواند گاوصندوق را باز کند.',
  'recovery.fileTitle': 'کلید بازیابی Passhold',
  'recovery.fileMade': 'ساخته‌شده در {date}',
  'recovery.fileBody':
    'این کلید وقتی دستگاهتان نمی‌تواند، گاوصندوق Passhold و پشتیبان‌هایش را باز می‌کند. هر کس آن را و یک نسخه از گاوصندوق‌تان داشته باشد، می‌تواند آن را باز کند؛ پس امنش نگه دارید و روی همان رایانه نگذارید.',
  'recovery.pending': 'کلید بازیابی هنوز جای امن نگرفته',
  'recovery.keptState': 'کلید بازیابی جای امن گرفته',
  'recovery.rowBody':
    'وقتی {method} نمی‌تواند، گاوصندوق و پشتیبان‌هایش را باز می‌کند. یک کلید جدید، باز شدن این گاوصندوق با کلید قبلی را متوقف می‌کند؛ پشتیبان‌هایی که پیش‌تر ساخته شده‌اند هنوز با کلید قبلی باز می‌شوند.',
  'recovery.makeNew': 'ساختن یک کلید جدید',
  'recovery.savedIt': 'ذخیره‌اش کرده‌ام',
  'recovery.checkTitle': 'بررسی کنید که آن را ذخیره کرده‌اید',
  'recovery.checkBody':
    'دو گروه از کلید را از آنچه ذخیره کرده‌اید — فایل، کاغذ یا عکس — وارد کنید. گروه‌ها بلوک‌های چهارتایی بین خط‌تیره‌ها هستند، از چپ شمرده شده.',
  'recovery.group': 'گروه {position}',
  'recovery.check': 'بررسی',
  'recovery.checkWrong':
    'این همان چیزی نیست که کلیدتان می‌گوید. دوباره به آنچه ذخیره کرده‌اید نگاه کنید، یا کلید را دوباره نشان دهید و همین حالا ذخیره‌اش کنید.',
  'recovery.showAgain': 'نشان دادن دوباره کلید',
  'recovery.covered': 'حساب Keyrook شما راه بازگشت است',
  'recovery.coveredBody':
    'اگر {method} دیگر Passhold را اینجا باز نکند، گاوصندوق را حذف کنید و دوباره به حساب‌تان وارد شوید: هر ورودی برمی‌گردد. کلید بازیابی خود این گاوصندوق هم اینجا برای دیدن هست.',

  'proof.recoveryKey': 'کلید بازیابی',
  'proof.withDevice': 'با {method} تأیید می‌کنید.',
  'proof.useDevice': 'به‌جایش با {method} تأیید کنید',
  'proof.usePassword': 'به‌جایش گذرواژه اصلی را تایپ کنید',
  'proof.useAccountPassword': 'به‌جایش گذرواژه حساب را تایپ کنید',
  'proof.useCode': 'به‌جایش کد را تایپ کنید',
  'proof.useRecoveryKey': 'به‌جایش کلید بازیابی را تایپ کنید',
  'strength.0': 'خیلی ضعیف',
  'strength.1': 'ضعیف',
  'strength.2': 'متوسط',
  'strength.3': 'قوی',
  'strength.4': 'خیلی قوی',
  'strength.short': 'طولانی‌تر یعنی قوی‌تر: هدف ۱۴ کاراکتر یا بیشتر است.',
  'strength.digitsOnly': 'فقط رقم‌ها به سادگی حدس زده می‌شوند.',
  'strength.repeats': 'همان کاراکتر را پشت سر هم به کار نبرید.',

  // Unlock
  'unlock.title': 'Passhold قفل است',
  'unlock.body': 'گذرواژه اصلی خود را وارد کنید.',
  'unlock.password': 'گذرواژه اصلی',
  'unlock.submit': 'باز کردن قفل',
  'unlock.pinBody': 'PIN خود را وارد کنید.',
  'unlock.pin': 'PIN',
  'unlock.usePassword': 'به‌جایش گذرواژه اصلی را به کار ببرید',
  'unlock.usePin': 'به‌جایش PIN را به کار ببرید',
  'unlock.recoveryBody': 'کلید بازیابی خود را وارد کنید.',
  'unlock.deviceBody': 'از {method} استفاده کنید، یا پایین تایپ کنید.',
  'unlock.recoveryKey': 'کلید بازیابی',
  'unlock.useRecoveryKey': 'به‌جایش از کلید بازیابی استفاده کنید',
  'unlock.lost': 'نمی‌توانید وارد شوید؟',
  'unlock.forgotBodyRecovery':
    'کلید بازیابی‌تان گاوصندوق را وقتی دستگاه نمی‌تواند باز می‌کند. بدون آن و بدون دستگاه، هیچ‌کس — نه Passhold، نه Keyrook — نمی‌تواند گاوصندوق را باز کند: فقط می‌توانید آن را در تنظیمات حذف کنید و از نو شروع کنید.',
  'unlock.bodyAccount': 'گذرواژه حساب Keyrook خود را وارد کنید.',
  'unlock.accountPassword': 'گذرواژه حساب Keyrook',
  'unlock.useAccountPassword': 'به‌جایش گذرواژه حساب را به کار ببرید',
  'unlock.forgotBodyAccount':
    'این گذرواژه حساب Keyrook شماست: اگر جای دیگری عوض شده، گذرواژه جدید را به کار ببرید. کاملاً فراموشش کرده‌اید؟ این گاوصندوق را در تنظیمات حذف کنید و دوباره وارد شوید — اگر به گذرواژه جدید نیاز دارید، با کلید بازیابی — آن‌وقت هر ورودی برمی‌گردد.',
  'unlock.bodyCode': 'کدی را وارد کنید که Passhold را روی این رایانه باز می‌کند.',
  'unlock.code': 'کد برای این رایانه',
  'unlock.useCode': 'به‌جایش کد را به کار ببرید',
  'unlock.forgotBodyCode':
    'این گاوصندوق را در تنظیمات حذف کنید و دوباره با Google یا GitHub وارد شوید: هر ورودی از حساب‌تان برمی‌گردد.',
  'unlock.device': 'باز کردن با {method}',
  'unlock.key': 'باز کردن با کلید امنیتی',
  'unlock.keyBody': 'کلید امنیتی‌تان را وصل کنید، یا پایین تایپ کنید.',
  'unlock.or': 'یا',
  'unlock.unlocking': 'در حال باز کردن قفل…',
  'unlock.forgot': 'فراموشش کرده‌اید؟',
  'unlock.forgotBody':
    'گذرواژه اصلی تنها کلید این گاوصندوق است و هیچ‌جا ذخیره نمی‌شود. بدون آن گاوصندوق باز نمی‌شود — فقط می‌توانید آن را در تنظیمات حذف کنید و از نو شروع کنید.',

  // Vault
  'vault.search': 'جستجو',
  'vault.lock': 'قفل کردن',
  'vault.settings': 'تنظیمات',
  'vault.add': 'ورود جدید',
  'vault.onThisPage': 'در {site}',
  'vault.all': 'همه ورودها',
  'vault.empty': 'هنوز ورودی نیست',
  'vault.emptyBody':
    'وارد یک سایت شوید و Passhold پیشنهاد می‌دهد آن را ذخیره کند — یا اینجا یکی بیفزایید، یا از مرورگرتان درون‌ریزی کنید.',
  'vault.import': 'درون‌ریزی گذرواژه‌ها',
  'vault.noResults': 'چیزی با «{query}» مطابقت ندارد.',
  'vault.fill': 'پر کردن',
  'vault.copyUsername': 'کپی نام کاربری',
  'vault.copyPassword': 'کپی گذرواژه',
  'vault.noUsername': 'نام کاربری ندارد',
  'vault.count': { one: '{count} مورد', other: '{count} مورد' },
  'vault.everything': 'همه موارد',

  // Asking for a rating, once, after real use
  'rating.title': 'آیا Passhold به کارتان می‌آید؟',
  'rating.body': 'یک امتیاز در فروشگاه به دیگران کمک می‌کند آن را پیدا کنند.',
  'rating.rate': 'امتیاز دهید',
  'rating.later': 'الان نه',

  // What a list shows, and what can be added
  'kinds.label': 'نمایش',
  'kinds.all': 'همه',
  'kinds.logins': 'ورودها',
  'kinds.cards': 'کارت‌ها',
  'kinds.addresses': 'نشانی‌ها',
  'kinds.notes': 'یادداشت‌ها',
  'kinds.noLogins': 'هنوز ورودی نیست.',
  'kinds.noCards':
    'هنوز کارتی نیست. با + بالا یکی بیفزایید؛ آن‌وقت Passhold، وقتی آن را انتخاب کنید، هنگام پرداخت برایتان پر می‌کند.',
  'kinds.noAddresses':
    'هنوز نشانی‌ای نیست. با + بالا یکی بیفزایید؛ آن‌وقت Passhold هر جا فرمی نشانی بخواهد پر می‌کند.',
  'kinds.noNotes':
    'هنوز یادداشتی نیست. یادداشت چیزی را نگه می‌دارد که ورود نیست — گذرواژه وای‌فای، کلید مجوز — همراه با بقیه چیزها، رمزگذاری‌شده.',
  'add.menu': 'افزودن',
  'add.login': 'ورود',
  'add.card': 'کارت',
  'add.address': 'نشانی',
  'add.note': 'یادداشت',
  'place.label': 'گاوصندوق‌ها',
  'place.mine': 'من',
  'place.of': '{vault}، به اشتراک‌گذاشته‌شده در {family}',
  'move.to': 'انتقال به {vault}',
  'move.confirm':
    'همه در {family} آن را در {vault} می‌بینند و می‌توانند تغییرش دهند. از گاوصندوق خودتان خارج می‌شود؛ گذرواژه‌های قبلی‌اش آنجا می‌مانند.',
  'move.do': 'انتقال',
  'family.unlockTitle': 'گاوصندوق مشترک {family} را در این مرورگر باز کنید',
  'family.unlockBody':
    'Passhold یک بار گذرواژه حساب Keyrook شما را لازم دارد تا کلید شما را در این مرورگر به خانواده بدهد. جایی فرستاده نمی‌شود.',
  'family.unlockOnPage':
    'صفحه «Family» را در account.keyrook.com باز کنید و کلید خانواده‌تان را همان‌جا به Passhold بدهید.',
  'family.password': 'گذرواژه حساب Keyrook',
  'family.unlock': 'باز کردن',
  'family.openPage': 'باز کردن صفحه «Family»',
  'family.keyChanged': 'کلید {who} در {family} عوض شده است',
  'family.newSender': 'کلید {family} از {who} آمد، کسی که این مرورگر هنوز نمی‌شناسدش',
  'family.keyChangedBody':
    'Passhold تا وقتی شما دو نفر کدی را مقایسه نکرده‌اید، چیزی از این شخص نمی‌گیرد. زنگ بزنید یا او را ببینید: این شخص باید کنار نام شما در صفحه «Family» در account.keyrook.com گزینه مقایسه کدها را انتخاب کند.',
  'family.showCode': 'نمایش کد',
  'family.codeIs': 'کد شما',
  'family.match': 'کدها یکی است',
  'family.differ': 'کدها فرق دارند',
  'family.differed':
    'پس اعتماد نکنید. به یکی از سازمان‌دهندگان خانواده‌تان بگویید؛ تا آن موقع Passhold چیزی از این شخص نمی‌گیرد.',
  'family.someone': 'یک نفر',
  'family.waiting':
    'یکی از سازمان‌دهندگان {family} هنوز شما را تأیید نکرده است. وقتی تأیید کند، آنچه به اشتراک گذاشته می‌شود اینجا باز می‌شود.',
  'family.rotate':
    'کسی {family} را ترک کرده است و Passhold هنوز همه کلیدهایش را عوض نکرده: آنچه در گاوصندوق‌های مشترکش تغییر می‌کند، روی این مرورگر منتظر می‌ماند. اگر این ادامه یافت، آن‌ها را در صفحه «Family» عوض کنید.',
  'family.rotateCompare':
    'کسی {family} را ترک کرده است. Passhold وقتی کد بالا را مقایسه کرده باشید، به همه کلیدهای تازه می‌دهد؛ تا آن موقع آنچه در گاوصندوق‌های مشترکش تغییر می‌کند، روی این مرورگر منتظر می‌ماند.',
  'family.rotateWait':
    'کسی {family} را ترک کرده است. آنچه در گاوصندوق‌های مشترکش تغییر می‌دهید، روی این مرورگر منتظر می‌ماند تا Passhold یکی از سازمان‌دهندگان کلیدها را عوض کند — که این کار را هنگام همگام‌سازی انجام می‌دهد — تا کسی که رفته نتواند آن را بخواند.',
  'family.left': '{who} دیگر در {family} نیست',
  'family.leftBody':
    'Passhold نمی‌تواند بگوید چرا رفته است. اگر انتظارش را نداشتید، از خودش یا یکی از سازمان‌دهندگان خانواده‌تان بپرسید.',
  'family.title': 'خانواده',
  'family.description':
    'چه کسانی در خانواده شما هستند، و گاوصندوق‌هایی که به اشتراک می‌گذارد. خانواده در صفحه «Family» در account.keyrook.com اداره می‌شود: دعوت، حذف کسی، عوض کردن کلیدها.',
  'family.none':
    'این حساب در هیچ خانواده‌ای نیست. خانواده‌ها در صفحه «Family» در account.keyrook.com ساخته می‌شوند.',
  'family.youOrganise': 'شما یکی از سازمان‌دهندگان آن هستید.',
  'family.youMember': 'شما عضو آن هستید.',
  'family.you': '(شما)',
  'family.organiser': 'سازمان‌دهنده',
  'family.notCompared': 'بدون مقایسه کد پذیرفته شد',
  'family.keyNew': 'کلیدشان عوض شده است: تا وقتی کدی را مقایسه نکنید چیزی از آن‌ها گرفته نمی‌شود',
  'family.membersLater': 'چه کسانی در آن هستند، وقتی خانواده روی این مرورگر باز شود اینجا نشان داده می‌شود.',
  'family.sharedVaults': 'گاوصندوق‌های مشترک',
  'family.vaultWaits': 'آنچه در آن تغییر می‌کند منتظر می‌ماند تا یکی از سازمان‌دهندگان کلیدش را عوض کند',

  // Cards, addresses and notes
  'wallet.updated': 'تغییر در {date}',
  'wallet.copyField': 'کپی {field}',
  'card.untitled': 'کارت',
  'card.newTitle': 'کارت جدید',
  'card.editTitle': 'ویرایش کارت',
  'card.titleHint': 'اگر خالی بماند، کارت بر اساس شبکه و چهار رقم آخرش نام می‌گیرد.',
  'card.number': 'شماره کارت',
  'card.numberCheck': 'این شماره درست جمع نمی‌شود: هر رقم را بررسی کنید.',
  'card.holder': 'نام روی کارت',
  'card.expiry': 'انقضا',
  'card.month': 'ماه',
  'card.year': 'سال',
  'card.code': 'کد امنیتی',
  'card.empty': 'یک شماره کارت یا یک نام بدهید.',
  'card.expired': 'این کارت منقضی شده است.',
  'card.expiredOn': 'منقضی‌شده {expiry}',
  'card.copyNumber': 'کپی شماره کارت',
  'card.copyExpiry': 'کپی تاریخ انقضا',
  'address.untitled': 'نشانی',
  'address.newTitle': 'نشانی جدید',
  'address.editTitle': 'ویرایش نشانی',
  'address.titleHint': 'خانه، محل کار… اگر خالی بماند، بر اساس نامی که در آن است نام می‌گیرد.',
  'address.name': 'نام کامل',
  'address.organization': 'شرکت',
  'address.street': 'نشانی خیابان',
  'address.city': 'شهر',
  'address.region': 'استان یا ایالت',
  'address.postalCode': 'کد پستی',
  'address.country': 'کشور',
  'address.chooseCountry': 'یک کشور انتخاب کنید',
  'address.phone': 'تلفن',
  'address.email': 'ایمیل',
  'address.address': 'نشانی',
  'address.empty': 'یک نام، یا بخشی از نشانی را وارد کنید.',
  'note.untitled': 'یادداشت بی‌عنوان',
  'note.newTitle': 'یادداشت جدید',
  'note.editTitle': 'ویرایش یادداشت',
  'note.title': 'عنوان',
  'note.text': 'یادداشت',
  'note.empty': 'یک عنوان بدهید، یا چیزی بنویسید.',
  'note.edited': 'ویرایش‌شده در {date}',

  // Pending save, in the popup
  'pending.saveTitle': 'این ورود ذخیره شود؟',
  'pending.updateTitle': 'گذرواژه به‌روز شود؟',
  'pending.lockedTitle': 'ورودی را که همین حالا استفاده کردید ذخیره کنم؟',
  'pending.body': '{username} در {site}',
  'pending.bodyNoUser': 'یک گذرواژه برای {site}',
  'pending.save': 'ذخیره',
  'pending.update': 'به‌روزرسانی',
  'pending.never': 'هرگز برای این سایت',

  // Item
  'item.username': 'نام کاربری',
  'item.password': 'گذرواژه',
  'item.website': 'سایت',
  'item.websites': 'سایت‌ها',
  'item.notes': 'یادداشت‌ها',
  'item.favorite': 'علاقه‌مندی',
  'item.unfavorite': 'حذف از علاقه‌مندی‌ها',
  'item.addFavorite': 'افزودن به علاقه‌مندی‌ها',
  'item.trash': 'انتقال به سطل زباله',
  'item.updated': 'گذرواژه در {date} عوض شد',
  'item.history': 'گذرواژه‌های قبلی',
  'item.weak': 'این گذرواژه ضعیف است: حدس زدنش زیاد طول نمی‌کشد.',
  'item.reused': {
    one: 'این گذرواژه برای {count} ورود دیگر هم به کار می‌رود. اگر یک سایت آن را فاش کند، هر دو باز می‌شوند.',
    other: 'این گذرواژه برای {count} ورود دیگر هم به کار می‌رود. اگر یک سایت آن را فاش کند، همه‌شان باز می‌شوند.',
  },
  'item.changePassword': 'در سایت عوضش کنید',
  'item.openSite': 'باز کردن {site}',
  'item.passkey': 'کلید عبور',
  'item.passkeyBody': 'برای {site}، ذخیره‌شده در {date}',

  // Edit
  'edit.newTitle': 'ورود جدید',
  'edit.editTitle': 'ویرایش ورود',
  'edit.title': 'نام',
  'edit.titleHint': 'اگر خالی بماند، بر اساس نام سایت گذاشته می‌شود.',
  'edit.username': 'نام کاربری یا ایمیل',
  'edit.password': 'گذرواژه',
  'edit.generate': 'ساختن',
  'edit.websites': 'سایت‌ها',
  'edit.websitesHint': 'هر خط یکی. Passhold این ورود را روی این سایت‌ها پیشنهاد می‌دهد.',
  'edit.notes': 'یادداشت‌ها',
  'edit.empty': 'یک نام، یک نام کاربری یا یک گذرواژه بدهید.',

  // Fields of an item's own, and folders
  'fields.title': 'فیلدهای سفارشی',
  'fields.add': 'افزودن فیلد',
  'fields.name': 'نام فیلد',
  'fields.value': 'مقدار',
  'fields.hidden': 'مثل گذرواژه پنهان شود',
  'fields.remove': 'حذف این فیلد',
  'fields.unnamed': 'فیلد',
  'fields.copy': 'کپی {name}',
  'folders.label': 'پوشه',
  'folders.placeholder': 'بدون پوشه',
  'folders.choose': 'پوشه‌های موجود',
  'folders.hint': 'چیزها را کنار هم نگه دارید — کار، خانواده، بانک — و هر بار یک پوشه را نشان دهید.',
  'folders.all': 'همه پوشه‌ها',
  'folders.none': 'در هیچ پوشه‌ای نیست',
  'folders.count': { one: '{count} مورد', other: '{count} مورد' },
  'folders.nothingHere': 'چیزی از این نوع در این پوشه نیست.',
  'folders.rename': 'تغییر نام',
  'folders.renameTo': 'نام تازه پوشه',
  'folders.remove': 'حذف پوشه',
  'folders.removeHint': 'آنچه در آن است می‌ماند، در هیچ پوشه‌ای.',

  // Generator
  'generator.length': 'طول',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'کاراکترهای شبیه هم را کنار بگذار (I l 1 O 0)',
  'generator.again': 'یکی دیگر',
  'generator.use': 'این گذرواژه را به کار ببرید',
  'generator.bits': '{bits} بیت',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold قفل است.',
  'menu.unlock': 'باز کردن قفل Passhold',
  'menu.unlockHint': 'برای باز کردن قفل، روی Passhold در نوار ابزار کلیک کنید، سپس به اینجا برگردید.',
  'menu.none': 'هیچ ورود ذخیره‌شده‌ای برای {site} نیست.',
  'menu.uninitialized': 'اول Passhold را راه بیندازید: در نوار ابزار روی آن کلیک کنید.',
  'menu.suggest': 'یک گذرواژه قوی به کار ببرید',
  'menu.suggestBody': 'یک گذرواژه تازه که برایتان پر شده است. Passhold پیشنهاد می‌دهد وقتی فرم ارسال شد آن را ذخیره کند.',
  'menu.fillFor': 'پر کردن در {site}',
  'menu.hidden': 'Passhold زیر چیزی در این صفحه پوشیده است، پس پر نمی‌کند.',
  'menu.passkey': 'کلید عبور · {username}',
  'menu.noCards': 'هنوز کارتی در Passhold نیست. از Passhold در نوار ابزار یکی بیفزایید.',
  'menu.noAddresses': 'هنوز نشانی‌ای در Passhold نیست. از Passhold در نوار ابزار یکی بیفزایید.',
  'menu.cardInsecure':
    'این صفحه امن نیست (http ساده)، پس Passhold اینجا کارتی پر نمی‌کند: هر کسی در مسیر می‌تواند آن را بخواند.',

  // A website's passkey
  'passkey.saveTitle': 'یک کلید عبور برای {site} ذخیره شود؟',
  'passkey.save': 'ذخیره کلید عبور',
  'passkey.saveElsewhere': 'جای دیگری ذخیره کنید',
  'passkey.useElsewhere': 'استفاده از کلید عبور جای دیگر',
  'passkey.existsTitle': 'این کلید عبور از قبل در Passhold است',
  'passkey.ok': 'تأیید',
  'passkey.signInTitle': 'ورود به {site}',
  'passkey.signInBody': 'با یک کلید عبور ذخیره‌شده در Passhold',
  'passkey.none': 'کلید عبوری برای {site} در Passhold نیست.',
  'passkey.hidden': 'Passhold زیر چیزی در این صفحه پوشیده است، پس پاسخ نمی‌دهد.',

  // Save prompt on a page
  'prompt.save': 'ورود در Passhold ذخیره شود؟',
  'prompt.update': 'گذرواژه در Passhold به‌روز شود؟',
  'prompt.saveButton': 'ذخیره',
  'prompt.updateButton': 'به‌روزرسانی',
  'prompt.never': 'هرگز برای این سایت',
  'prompt.saved': 'در Passhold ذخیره شد.',
  'prompt.locked': 'روی Passhold در نوار ابزار کلیک کنید و قفلش را باز کنید — آنجا می‌پرسد که ذخیره شود.',
  'prompt.saveCard': 'کارت در Passhold ذخیره شود؟',
  'prompt.updateCard': 'کارت در Passhold به‌روز شود؟',
  'prompt.saveAddress': 'نشانی در Passhold ذخیره شود؟',
  'prompt.saveCheckout': 'کارت و نشانی در Passhold ذخیره شود؟',

  // Settings
  'settings.title': 'تنظیمات',
  'settings.cannotOpen': 'اصلاً نمی‌توانید بازش کنید؟ گاوصندوق را از این مرورگر حذف کنید',
  'settings.encryptedHere': 'روی این دستگاه رمزگذاری شده',
  'settings.source': 'کد منبع در GitHub',

  'nav.passwords': 'گذرواژه‌ها',
  'nav.accountSync': 'حساب و همگام‌سازی',
  'nav.family': 'خانواده',
  'nav.account': 'حساب Keyrook',
  'nav.backup': 'پشتیبان و درون‌ریزی',
  'nav.security': 'امنیت',
  'nav.general': 'عمومی',
  'nav.needsAttention': 'نیاز به توجه دارد',

  'account.description':
    'وارد شوید، و ورودهای شما به هر مرورگری که در آن با Passhold وارد می‌شوید دنبال‌تان می‌آیند. پیش از هر چیز روی این دستگاه رمزگذاری می‌شوند: سرور Keyrook نمی‌تواند آن‌ها را بخواند، و نمی‌داند برای کدام سایت‌ها هستند.',
  'account.email': 'ایمیل',
  'account.password': 'گذرواژه حساب Keyrook',
  'account.signIn': 'ورود',
  'account.signingIn': 'در حال ورود…',
  'account.note':
    'همان حسابی که در Keyrook Authenticator است. حسابی که با Google یا GitHub ساخته شده با دکمه خودش وارد می‌شود.',
  'account.haveOne': 'حساب دارم',
  'account.create': 'ساختن حساب',
  'account.sendCode': 'کد را به ایمیلم بفرستید',
  'account.createNote':
    'Keyrook یک کد شش‌رقمی به ایمیل می‌فرستد تا ثابت کند نشانی مال شماست. اگر این نشانی از قبل حساب دارد، ایمیل به جایش همین را می‌گوید: با آن وارد شوید.',
  'account.codeSent': 'کدی به {email} در راه است. پانزده دقیقه معتبر است.',
  'account.code': 'کد شش‌رقمی',
  'account.newPassword': 'گذرواژه حساب Keyrook',
  'account.passwordNote':
    'این گذرواژه حساب Keyrook شما را در هر مرورگری باز می‌کند، هم برای Passhold و هم برای Keyrook Authenticator. Keyrook هرگز آن را نمی‌بیند و نمی‌تواند برایتان بازنشانی کند؛ کلید بازیابی‌ای که بعد دریافت می‌کنید، راه تنظیم گذرواژه تازه است.',
  'account.createButton': 'ساختن حساب',
  'account.creating': 'در حال ساختن…',
  'account.otherEmail': 'استفاده از نشانی دیگر',
  'account.signedInAs': 'وارد شده با {email}',
  'account.signedInAsNamed': 'وارد شده با {name} ({email})',
  'account.synced': 'همگام‌سازی‌شده در {date}',
  'account.notSynced': 'هنوز همگام‌سازی نشده',
  'account.syncNow': 'همین حالا همگام‌سازی',

  // The account, at the foot of the popup
  'accountBar.synced': 'همگام‌سازی‌شده {time}',
  'accountBar.justNow': 'همین الان',
  'accountBar.syncing': 'در حال همگام‌سازی…',
  'accountBar.signedOut': 'خارج شده‌اید — برای همگام‌سازی دوباره وارد شوید',
  'accountBar.startedOver': 'حساب از نو شروع شده — دوباره وارد شوید',
  'accountBar.removed': 'از حساب حذف شده — برای همگام‌سازی دوباره وارد شوید',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'از حساب Keyrook شما حذف شده',
  'removed.body':
    'در {date} این مرورگر از حساب Keyrook شما حذف شد، پس Passhold ورودها، کارت‌ها، نشانی‌ها و یادداشت‌های حساب را از آن برداشت و آن را خارج کرد. آنچه اینجا افزوده یا عوض شد و هرگز فرستاده نشد، به‌عنوان مال همین مرورگر ماند. برای برگرداندن بقیه دوباره وارد شوید.',

  // Passwords, in Settings
  'passwords.description':
    'هر ورود، کلید عبور، کارت، نشانی و یادداشت در Passhold. یکی را انتخاب کنید تا ببینیدش، از آن کپی کنید یا عوضش کنید.',
  'passwords.all': 'همه',
  'passwords.attention': 'نیاز به توجه',
  'passwords.weak': 'ضعیف',
  'passwords.reused': 'تکراری',
  'account.syncDone': 'همگام‌سازی شد.',
  'account.removed': {
    one: '{count} مورد که روی دستگاه دیگری برای همیشه حذف شده بود، اینجا برداشته شد.',
    other: '{count} مورد که روی دستگاه دیگری برای همیشه حذف شده بود، اینجا برداشته شد.',
  },
  'account.skipped': {
    one: '{count} مورد باز نشد و دست‌نخورده ماند.',
    other: '{count} مورد باز نشد و دست‌نخورده ماند.',
  },
  'account.manage': 'مدیریت حساب Keyrook',
  'account.manageBody':
    'گذرواژه را عوض کنید، کلید بازیابی تازه بسازید یا حساب را در account.keyrook.com از نو شروع کنید — هم برای Passhold و هم برای Keyrook Authenticator.',
  'account.manageBodyProvider':
    'کلید بازیابی تازه بسازید یا حساب را در account.keyrook.com از نو شروع کنید — هم برای Passhold و هم برای Keyrook Authenticator.',
  'account.manageOpen': 'باز کردن',
  'account.signOut': 'خروج',
  'account.signOutBody':
    'پس از یک همگام‌سازی آخر، همه ورودها را از این مرورگر حذف می‌کند. دوباره وارد شوید و برمی‌گردند.',
  'account.signOutConfirm':
    'Passhold یک بار دیگر همگام می‌کند، سپس گاوصندوق را از این مرورگر برمی‌دارد. اگر هر ورودی به حساب‌تان نرسیده باشد، چیزی حذف نمی‌شود.',
  'account.signOutButton': 'خروج و حذف',
  'account.signedOutByServer': 'Keyrook این مرورگر را خارج کرد. برای ادامه همگام‌سازی دوباره وارد شوید.',
  'account.startedOver':
    'حساب Keyrook شما در {date} از نو شروع شد، پس Keyrook این مرورگر را خارج کرد. با گذرواژه تازه‌اش وارد شوید: ورودهای اینجا با کلیدهای تازه حساب بالا می‌روند.',
  'account.startedOverProvider':
    'حساب Keyrook شما در {date} از نو شروع شد، پس Keyrook این مرورگر را خارج کرد. با Google یا GitHub وارد شوید: ورودهای اینجا با کلیدهای تازه حساب بالا می‌روند.',
  'account.forgot': 'گذرواژه را فراموش کرده‌اید؟',
  'account.recoverBody':
    'Keyrook کدی به نشانی حساب می‌فرستد؛ سپس آن را تایپ کنید، کلید بازیابی حساب را از برگه‌ای که وقت ساختن حساب ذخیره کردید، و یک گذرواژه تازه. هر مرورگر و برنامه دیگری که به حساب وارد شده، گذرواژه تازه را خواهد خواست.',
  'account.recoveryKey': 'کلید بازیابی حساب',
  'account.recoverPassword': 'گذرواژه تازه حساب',
  'account.recoverButton': 'تنظیم گذرواژه تازه',
  'account.recovering': 'در حال تنظیم…',
  'account.backToSignIn': 'بازگشت به ورود',
  'startOver.link': 'کلید بازیابی را هم گم کرده‌اید؟ حساب را از نو شروع کنید',
  'startOver.title': 'شروع دوباره حساب',
  'needsRoot.body':
    'اگر کلید بازیابی حسابی را دارید که Keyrook Authenticator به شما داد، آن را تایپ کنید: آن‌وقت Passhold را هم باز می‌کند. بدون آن، Passhold یک کلید بازیابی تازه برای حساب می‌سازد که فقط یک بار نشان داده می‌شود، و کلید قبلی از کار می‌افتد.',
  'needsRoot.sheet': 'کلید بازیابی حساب از Keyrook Authenticator (اگر دارید)',
  'needsRoot.withSheet': 'استفاده از این کلید',
  'needsRoot.newSheet': 'ساختن کلید بازیابی تازه',
  'startOver.body':
    'وقتی چیزی جز نشانی ایمیل نمانده، حساب می‌تواند با کلیدهای تازه و یک کلید بازیابی تازه از نو شروع شود. یک هفته پس از درخواست اعمال می‌شود، و تا آن موقع هر مرورگری که هنوز به حساب وارد است می‌تواند آن را لغو کند — پس کسی که فقط ایمیل شما را دارد نمی‌تواند این کار را بکند. هر چه حساب داشت، Keyrook تا ۹۰ روز آن را رمزگذاری‌شده نگه می‌دارد: گذرواژه قبلی یا کلید بازیابی قبلی آن را برمی‌گرداند.',
  'startOver.button': 'شروع از نو',
  'startOver.working': 'در حال شروع از نو…',
  'startOver.kitBody':
    'کلید بازیابی تازه حساب: وقتی حساب از نو شروع شود کار می‌کند. Passhold فقط حالا آن را نشان می‌دهد، پس پیش از ادامه آن را نگه دارید.',
  'startOver.waitTitle': 'حساب شما در {date} از نو شروع می‌شود',
  'startOver.waitBody':
    'تا آن موقع چیزی عوض نمی‌شود، و هر مرورگری که هنوز به حساب وارد است می‌تواند آن را لغو کند. Keyrook الان، یک روز قبل و وقتی اتفاق بیفتد، به {email} ایمیل می‌زند.',
  'startOver.waitThen':
    'از آن به بعد، با گذرواژه تازه‌تان اینجا وارد شوید. ورودهای این مرورگر با کلیدهای تازه حساب بالا می‌روند، و آنچه پیش‌تر در آن بود ۹۰ روز نگه داشته می‌شود.',
  'startOver.waitThenProvider':
    'از آن به بعد، مثل قبل با Google یا GitHub اینجا وارد شوید. ورودهای این مرورگر با کلیدهای تازه حساب بالا می‌روند، و آنچه پیش‌تر در آن بود ۹۰ روز نگه داشته می‌شود.',
  'startOver.understood': 'متوجه شدم',
  'startOver.doneTitle': 'حساب شما از نو شروع شد',
  'startOver.doneBody':
    'با گذرواژه تازه‌تان وارد شوید: ورودهای این مرورگر با کلیدهای تازه حساب بالا می‌روند، و آنچه پیش‌تر در آن بود ۹۰ روز نگه داشته می‌شود.',
  'startOver.doneBodyProvider':
    'مثل قبل با Google یا GitHub وارد شوید: ورودهای این مرورگر با کلیدهای تازه حساب بالا می‌روند، و آنچه پیش‌تر در آن بود ۹۰ روز نگه داشته می‌شود.',
  'startOverWait.title': 'حساب Keyrook شما در {date} از نو شروع می‌شود',
  'startOverWait.body':
    'با کدی که Keyrook به ایمیلتان فرستاد درخواست شد، از دستگاهی که خودش را «{device}» می‌نامید. اگر شما نبودید، کسی می‌تواند ایمیل شما را بخواند: همین حالا لغوش کنید و بعد گذرواژه ایمیلتان را عوض کنید. اگر خودتان بودید، بگذارید بماند.',
  'startOverWait.bodyNoName':
    'با کدی که Keyrook به ایمیلتان فرستاد درخواست شد. اگر شما نبودید، کسی می‌تواند ایمیل شما را بخواند: همین حالا لغوش کنید و بعد گذرواژه ایمیلتان را عوض کنید. اگر خودتان بودید، بگذارید بماند.',
  'startOverWait.cancel': 'لغو شروع از نو',
  'kept.title': {
    one: 'نگه‌داشته‌شده از پیش از شروع دوباره حساب: {count} مورد',
    other: 'نگه‌داشته‌شده از پیش از شروع دوباره حساب: {count} مورد',
  },
  'kept.body': 'تا {date}. گذرواژه قبلی حساب یا کلید بازیابی قبلی آن‌ها را به Passhold برمی‌گرداند.',
  'kept.open': 'برگرداندن',
  'kept.secret': 'گذرواژه قبلی حساب یا کلید بازیابی قبلی',
  'kept.done': { one: '{count} مورد برگردانده شد.', other: '{count} مورد برگردانده شد.' },
  'kept.nothingNew': 'همه چیزهایی که نگه داشته شده بود از قبل اینجا هستند.',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': 'ادامه با {provider}',
  'provider.passwordTitle': 'این حساب Keyrook گذرواژه دارد',
  'provider.passwordBody':
    'با {provider} به عنوان {email} وارد شدید. گذرواژه حساب چیزی است که Passhold را اینجا باز می‌کند: یک بار تایپش کنید.',
  'provider.openAccountPage': 'باز کردن account.keyrook.com',
  'secondStep.title': 'ورود دومرحله‌ای',
  'secondStep.body':
    'کد ۶ رقمی‌ای را که برنامه احراز هویت شما برای Keyrook نشان می‌دهد وارد کنید. برنامه را گم کرده‌اید؟ به‌جایش کلید بازیابی حساب را تایپ کنید.',
  'secondStep.ownerBody':
    'حساب شما برای این هم یک مرحله دوم می‌خواهد: کدی که برنامه احراز هویت شما نشان می‌دهد، یا کلید بازیابی حساب شما.',
  'secondStep.field': 'کد، یا کلید بازیابی',
  'secondStep.continue': 'ادامه',
  'secondStep.passkey': 'به‌جایش از کلید عبور استفاده کنید',
  'secondStep.nextBody':
    'دادن کلید به حساب هم کدی می‌خواهد، و هر کد فقط یک بار کار می‌کند. صبر کنید تا برنامه احراز هویت شما کد تازه‌ای نشان دهد، سپس آن را وارد کنید — یا کلید بازیابی حساب را.',
  'provider.or': 'یا',
  'provider.signedInWith': 'با {provider} به عنوان {email} وارد شده‌اید',
  'provider.signedInWithNamed': 'با {provider} به عنوان {name} ({email}) وارد شده‌اید',
  'provider.newTitle': 'ساختن حساب Keyrook خود',
  'provider.newBody':
    'شما با {provider} به عنوان {email} وارد می‌شوید. حساب گذرواژه ندارد: {provider} وارد شدن شما را انجام می‌دهد. روی رایانه دیگری، مرورگری که از قبل وارد است شما را راه می‌دهد — یا کلید بازیابی‌ای که بعد دریافت می‌کنید.',
  'provider.joinTitle': 'این مرورگر را راه بدهید',
  'provider.joinBody':
    '{email} اینجا وارد شده است، اما کلیدی که ورودهای شما را باز می‌کند روی رایانه‌های دیگرتان است. Passhold را روی یکی از آن‌ها باز کنید — تنظیمات، حساب و همگام‌سازی — و این مرورگر را راه بدهید.',
  'provider.waiting': 'در انتظار مرورگر دیگر…',
  'provider.compare': 'مرورگر دیگر کدی نشان می‌دهد. فقط اگر همین مرورگر است، آنجا راهش دهید:',
  'provider.ended': 'این درخواست پیش از آنکه مرورگر دیگری این مرورگر را راه دهد، تمام شد.',
  'provider.askAgain': 'دوباره بپرسید',
  'provider.useKit': 'به‌جایش کلید بازیابی را به کار ببرید',
  'provider.useThisKey': 'استفاده از این کلید',
  'provider.needsRoot':
    '{email} در Keyrook Authenticator ساخته شد، پیش از آنکه هر برنامه Keyrook کلید خودش را داشته باشد. Passhold حالا می‌تواند به آن یکی بدهد، وقتی یک بار دیگر با {provider} تأیید کنید؛ در Authenticator چیزی عوض نمی‌شود.',
  'provider.confirmWith': 'تأیید با {provider}',
  'provider.noKeyYet':
    'Passhold هنوز هیچ‌جا با {email} وارد نشده، پس هیچ مرورگر دیگری نمی‌تواند این یکی را راه دهد. کلید بازیابی حساب آن را باز می‌کند.',
  'passkey.onLabel': 'رایانه‌های جدید با کلید عبورتان باز می‌شوند',
  'passkey.offLabel': 'کلید عبوری برای رایانه‌های جدید نیست',
  'passkey.body':
    'روی یک رایانه جدید: {provider}، سپس کلید عبورتان — و هر ورودی آنجاست. کلید عبور که توسط Google Password Manager نگه داشته می‌شود، روی هر Chrome که وارد می‌شوید هست.',
  'passkey.bodyEdge':
    'روی یک رایانه جدید: {provider}، سپس کلید عبورتان — و هر ورودی آنجاست. کلید عبور در جایی که همگام می‌شود ذخیره شود، روی دستگاه‌های دیگرتان هم هست.',
  'passkey.turnOn': 'روشن کردن',
  'passkey.turnOff': 'خاموش کردن',
  'passkey.joinTitle': 'با کلید عبورتان باز کنید',
  'passkey.joinBody': '{email} یک کلید عبور برای رایانه‌های جدید دارد. با آن تأیید کنید، و ورودهایتان پایین می‌آیند.',
  'passkey.use': 'استفاده از کلید عبور',
  'passkey.otherWays': 'راه‌های دیگر ورود',
  'pairing.asking': '{device} می‌خواهد به حساب شما راه داده شود.',
  'pairing.start': 'راه دادن…',
  'pairing.notMe': 'من نبودم',
  'pairing.compare': 'فقط اگر مرورگر تازه همین کد را نشان می‌دهد راهش دهید:',
  'pairing.match': 'کدها یکی است — راه دادن',
  'pairing.differ': 'کدها فرق دارند',

  'accountKit.title': 'کلید بازیابی حساب را ذخیره کنید',
  'accountKit.body':
    'اگر گذرواژه حساب Keyrook را فراموش کنید، این کلید یک گذرواژه تازه می‌گذارد — هم برای Passhold و هم برای Keyrook Authenticator. Keyrook هرگز گذرواژه شما را نمی‌بیند، پس این تنها راه است. می‌توانید دوباره آن را در تنظیمات ببینید؛ جای دیگری هم نگهش دارید.',
  'accountKit.fileTitle': 'کلید بازیابی حساب Keyrook',
  'accountKit.fileBody':
    'اگر گذرواژه حساب Keyrook را فراموش کنید، این کلید یک گذرواژه تازه می‌گذارد: در Passhold، تنظیمات ← حساب و همگام‌سازی ← «گذرواژه را فراموش کرده‌اید؟». هر کس آن و نشانی ایمیل شما را داشته باشد می‌تواند همین کار را بکند، پس امنش نگه دارید و روی این رایانه نگذارید.',
  'accountKit.bodyNoPassword':
    'حساب شما گذرواژه ندارد: مرورگری که از قبل وارد است، یکی تازه را راه می‌دهد. اگر هیچ‌کدام نماند، این کلید راه می‌دهد — هم برای Passhold و هم برای Keyrook Authenticator. می‌توانید دوباره آن را در تنظیمات ببینید؛ جای دیگری هم نگهش دارید.',
  'accountKit.fileBodyNoPassword':
    'اگر هیچ رایانه‌ای دیگر با حساب Keyrook شما وارد نیست، این کلید یکی تازه را راه می‌دهد: با Google یا GitHub وارد شوید، سپس «به‌جایش از کلید بازیابی استفاده کنید» را انتخاب کنید. هر کس آن را داشته باشد و بتواند مثل شما وارد شود، می‌تواند همین کار را بکند؛ پس امنش نگه دارید و روی این رایانه نگذارید.',
  'accountKit.whenTitleNoPassword': 'وقتی هیچ رایانه‌ای وارد نیست',
  'accountKit.inPassholdNoPassword':
    'در Passhold: با Google یا GitHub وارد شوید، «به‌جایش از کلید بازیابی استفاده کنید» را انتخاب کنید، و این کلید را تایپ کنید.',
  'accountKit.keepNoPassword':
    'این برگه را دور از رایانه‌تان در جای امنی نگه دارید. هر کس آن را داشته باشد و بتواند در حساب Google یا GitHub شما وارد شود، می‌تواند حساب Keyrook شما را باز کند.',
  'accountKit.rowBodyNoPassword': 'وقتی هیچ رایانه دیگری نمانده که کار را انجام دهد، یک رایانه تازه را راه می‌دهد.',
  'accountKit.sheetTitle': 'برگه بازیابی حساب Keyrook',
  'accountKit.whenTitle': 'وقتی گذرواژه حساب فراموش شود',
  'accountKit.inPasshold':
    'در Passhold: تنظیمات ← حساب و همگام‌سازی ← «گذرواژه را فراموش کرده‌اید؟»، سپس نشانی ایمیلتان، کدی که Keyrook ایمیل می‌کند، این کلید، و یک گذرواژه تازه.',
  'accountKit.inAuthenticator': 'Keyrook Authenticator همین کلید را می‌پذیرد: «گذرواژه را فراموش کرده‌ام؟» در جایی که از شما می‌خواهد وارد شوید.',
  'accountKit.keep':
    'این برگه را دور از رایانه‌تان در جای امنی نگه دارید. هر کس آن و صندوق ایمیل شما را داشته باشد می‌تواند یک گذرواژه تازه برای حساب بگذارد.',
  'accountKit.pending': 'کلید بازیابی حساب هنوز جای امن نگرفته',
  'accountKit.keptState': 'کلید بازیابی حساب جای امن گرفته',
  'accountKit.elsewhere': 'کلید بازیابی حساب جای دیگری ساخته شده',
  'accountKit.none': 'کلید بازیابی حساب نیست',
  'accountKit.rowBody': 'یک گذرواژه تازه برای حساب می‌گذارد اگر فراموش شود. یک کلید تازه، کلید قبلی را در هر برنامه‌ای از کار می‌اندازد.',
  'accountKit.elsewhereBody':
    'در account.keyrook.com، در Keyrook Authenticator یا در مرورگر دیگری ساخته شده: کلیدش روی برگه‌ای است که آن موقع ذخیره شده. ساختن یکی اینجا، آن یکی را از کار می‌اندازد.',
  'accountKit.noneBody':
    'بدون آن، گذرواژه فراموش‌شده حساب را نمی‌توان بازنشانی کرد، و آنچه در Keyrook نگه داشته می‌شود را نمی‌توان باز کرد. ورودهای این مرورگر در هر صورت می‌مانند.',
  'accountKit.make': 'ساختن یکی',
  'accountKit.apart':
    'آن را از ایمیلتان جدا نگه دارید: هر کس این کلید را داشته باشد و بتواند ایمیلتان را بخواند، می‌تواند گذرواژه تازه بگذارد و ورودهایتان را باز کند. آن را برای خودتان ایمیل نکنید، و در فضای ابری آن ایمیل نگهش ندارید.',
  'accountKit.apartNoPassword':
    'آن را از حساب Google یا GitHub که با آن وارد می‌شوید جدا نگه دارید: هر کس این کلید را داشته باشد و بتواند آنجا به‌عنوان شما وارد شود، می‌تواند ورودهایتان را باز کند. آن را برای خودتان ایمیل نکنید، و در فضای ذخیره ابری آن حساب نگهش ندارید.',
  'accountKit.unchecked': 'کلید بازیابی حساب هنوز بررسی نشده',
  'accountKit.uncheckedBody':
    'حساب شما کلید بازیابی دارد که در account.keyrook.com یا برنامه دیگری ساخته شده. یک بار تایپش کنید: Passhold بررسی می‌کند که حساب شما را باز می‌کند، و آن را نگه می‌دارد تا دوباره نشانتان دهد.',
  'accountKit.typeIt': 'تایپش کنید',
  'accountKit.checked': 'حساب شما را باز می‌کند. Passhold حالا آن را نگه می‌دارد تا دوباره اینجا نشانتان دهد.',
  'accountKit.draftBody':
    'کلید بازیابی تازه حساب شما. هنوز کار نمی‌کند: وقتی آن را ذخیره کردید و دوباره تایپش کردید، گذرواژه حساب شما آن را تنظیم می‌کند، و کلید قبلی از کار می‌افتد.',
  'accountKit.setTitle': 'کلید بازیابی تازه‌تان را تنظیم کنید',
  'accountKit.setBody':
    'گذرواژه حساب Keyrook خود را تایپ کنید. تا آن موقع کلید بازیابی قبلی شما هنوز کار می‌کند، و این یکی کار نمی‌کند.',
  'accountKit.set': 'تنظیم',
  'checkup.clear': 'چیزی برای رفع کردن نیست',
  'checkup.clearBody': 'گذرواژه ضعیف یا تکراری نیست، و پشتیبان شما به‌روز است.',
  'checkup.issues': { one: '{count} مورد برای بررسی', other: '{count} مورد برای بررسی' },
  'checkup.issuesBody': 'هر کدام در زیر می‌گوید چرا مهم است و چطور رفعش کنید.',
  'checkup.backup': 'پشتیبان',
  'checkup.access': 'دسترسی',
  'checkup.recoveryPending':
    'کلید بازیابی ساخته‌شده برای این گاوصندوق هرگز تأیید نشد که جای امن گرفته است، و اگر {method} از کار بیفتد، تنها راه ورود است. یکی تازه بسازید و نگهش دارید.',
  'checkup.deviceMissing':
    'این گاوصندوق گذرواژه اصلی ندارد، پس بدون {method} روی این دستگاه، هر قفل‌گشایی کلید بازیابی می‌خواهد.',
  'checkup.lastBackup': 'آخرین پشتیبان {date}',
  'checkup.backupNever':
    'اگر این مرورگر گم شود، ورودهای شما هم گم می‌شوند. پشتیبان یک فایل رمزگذاری‌شده است که جای دیگری نگه می‌دارید.',
  'checkup.backupDue': 'گاوصندوق شما از آن موقع عوض شده. یک پشتیبان تازه بسازید تا همه چیز را داشته باشد.',
  'checkup.backUp': 'همین حالا پشتیبان بگیرید',
  'checkup.weak': { one: '{count} گذرواژه ضعیف', other: '{count} گذرواژه ضعیف' },
  'checkup.weakBody':
    'کوتاه یا آن‌قدر ساده که حدس زده شود. هر کدام را در سایتش عوض کنید؛ Passhold در فرم یک گذرواژه قوی پیشنهاد می‌دهد و پیشنهاد ذخیره‌اش را می‌دهد.',
  'checkup.weakNone': 'هیچ‌کدام.',
  'checkup.reused': {
    one: '{count} گذرواژه بیش از یک بار به کار رفته',
    other: '{count} گذرواژه بیش از یک بار به کار رفته',
  },
  'checkup.reusedBody':
    'وقتی یک سایت گذرواژه‌ای را فاش می‌کند، مردم آن را جای دیگر هم امتحان می‌کنند. به هر ورودی گذرواژه خودش را بدهید.',
  'checkup.reusedNone': 'هیچ‌کدام: هر ورودی گذرواژه خودش را دارد.',
  'checkup.sharedBy': { one: 'مشترک بین {count} ورود', other: 'مشترک بین {count} ورود' },
  'checkup.change': 'تغییر',
  'checkup.limits':
    'Passhold بررسی نمی‌کند که آیا یک گذرواژه در نشت داده‌ها پیدا شده است: این کار یعنی پرسیدن از یک سرور، و Passhold از هیچ سروری نمی‌پرسد. گذرواژه‌های قدیمی را هم یادآوری نمی‌کند — گذرواژه قوی و یکتا فرسوده نمی‌شود.',

  'backup.description': 'یک نسخه رمزگذاری‌شده نگه دارید، یکی را برگردانید، یا ورودها را وارد و خارج کنید.',
  'backup.backupRow': 'کل گاوصندوق شما در یک فایل رمزگذاری‌شده، زیر گذرواژه اصلی‌تان.',
  'backup.restoreRow': 'ورودهای یک فایل پشتیبان را به این گاوصندوق بیفزایید.',
  'backup.importRow': 'از مرورگر یا مدیر گذرواژه دیگر، به‌صورت فایل CSV، یا JSON از Bitwarden.',
  'backup.exportRow': 'یک فایل CSV که برنامه‌های دیگر می‌توانند بخوانند. رمزگذاری‌نشده.',

  'security.description': 'Passhold چطور باز می‌شود، و کی دوباره بسته می‌شود.',
  'security.locking': 'قفل کردن',
  'security.opensTitle': 'Passhold چطور باز می‌شود',
  'security.opensBody': 'بدون گذرواژه اصلی: {method} آن را باز می‌کند، و کلید بازیابی وقتی {method} نتواند.',
  'security.setPassword': 'به‌جایش یک گذرواژه اصلی به کار ببرید',
  'security.setPasswordBody':
    'Passhold آن‌وقت با گذرواژه‌ای که انتخاب می‌کنید باز می‌شود، و کلید بازیابی دیگر آن را باز نمی‌کند.',
  'security.setPasswordOpen': 'تنظیم',
  'security.setPasswordSave': 'استفاده از این گذرواژه',
  'security.dropPassword': 'دیگر گذرواژه اصلی به کار نبرید',
  'security.dropPasswordBody':
    'فقط با {method} باز کنید، و یک کلید بازیابی برای روزی نگه دارید که نتواند. گذرواژه اصلی دیگر گاوصندوق را باز نمی‌کند.',
  'security.dropPasswordOpen': 'تغییر',
  'security.dropPasswordSave': 'تغییر و نمایش کلید بازیابی',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'قفل صفحه دستگاه',
  'device.method.passkey': 'کلید عبور',
  'device.title': 'باز کردن با {method}',
  'device.description': 'سریع‌ترین راه ورود، و بعد از راه‌اندازی دوباره مرورگر هم کار می‌کند.',
  'device.on': 'روشن',
  'device.off': 'خاموش',
  'device.body':
    'اثرانگشت یا چهره‌تان Passhold را باز می‌کند — یا، روی بیشتر رایانه‌ها، گذرواژه خود رایانه. پس هر کس بتواند این رایانه را باز کند، می‌تواند Passhold را باز کند. آنچه باز می‌کند روی همین رایانه می‌ماند و بدون آن به کاری نمی‌آید.',
  'device.whereMac':
    'وقتی Chrome می‌پرسد کلید عبور کجا ذخیره شود، Google Password Manager را انتخاب کنید. کلید عبوری در نمایه Chrome شما نمی‌تواند Passhold را باز کند، و روی هر Mac هم iCloud Keychain نمی‌تواند.',
  'device.whereMacEdge':
    'وقتی Edge می‌پرسد کلید عبور کجا ذخیره شود، جایی را انتخاب کنید که آن را روی دستگاه‌های دیگرتان هم نگه دارد. همه جاها نمی‌توانند Passhold را باز کنند: اگر جایی که انتخاب می‌کنید نتواند، Passhold این را می‌گوید و چیزی عوض نمی‌شود.',
  'device.unavailable': 'اینجا موجود نیست',
  'device.unavailableBody':
    'این مرورگر هیچ اثرانگشت، چهره یا قفل صفحه‌ای پیدا نکرد که Passhold بتواند استفاده کند. PIN همه‌جا کار می‌کند.',
  'device.unavailableRecovery':
    'این مرورگر هیچ اثرانگشت، چهره یا قفل صفحه‌ای پیدا نکرد که Passhold بتواند استفاده کند، پس اینجا این گاوصندوق با کلید بازیابی‌اش باز می‌شود. اگر ترجیح می‌دهید گذرواژه را تایپ کنید، یک گذرواژه اصلی تنظیم کنید.',
  'device.opensWith': '{method} Passhold را باز می‌کند',
  'device.notHere': '{method} در این مرورگر تنظیم نشده است',
  'device.isTheWayIn': 'بدون گذرواژه اصلی، Passhold همین‌طور باز می‌شود. برای خاموش کردنش، اول یک گذرواژه اصلی تنظیم کنید.',
  'device.setUpHere': 'تا وقتی {method} اینجا تنظیم نشده، هر قفل‌گشایی کلید بازیابی می‌خواهد.',
  'device.setUp': 'تنظیم',
  'device.turnOff': 'خاموش کردن',
  'device.save': 'تنظیم {method}',
  'keys.title': 'باز کردن با کلید امنیتی',
  'keys.description': 'یک کلید USB که وصلش می‌کنید: یک راه دیگر ورود، و بعد از راه‌اندازی دوباره مرورگر هم کار می‌کند.',
  'keys.method': 'کلید امنیتی شما',
  'keys.on': { one: '{count} کلید تنظیم شده', other: '{count} کلید تنظیم شده' },
  'keys.off': 'هیچ کلیدی تنظیم نشده',
  'keys.body':
    'کلید را وصل کنید، PIN آن را تایپ کنید و لمسش کنید، آن‌وقت Passhold باز می‌شود — فقط روی همین رایانه. هر کس کلید را داشته باشد و PIN آن را بداند، می‌تواند اینجا Passhold را باز کند، پس آن را مثل کلید خانه نگه دارید. اگر گم شد، آن را اینجا حذف کنید: راه‌های دیگر ورودتان همچنان کار می‌کنند.',
  'keys.add': 'افزودن یک کلید',
  'keys.save': 'افزودن این کلید',
  'keys.one': 'کلید امنیتی',
  'keys.added': 'افزوده‌شده در {date}',
  'keys.remove': 'حذف',
  'pin.title': 'باز کردن با PIN',
  'pinOffer.title': 'Passhold را با PIN سریع‌تر باز کنید',
  'pinOffer.body':
    'هر بار که Passhold قفل می‌شود، به‌جای گذرواژه‌تان چند رقم تایپ کنید، تا وقتی مرورگر بسته شود. بعد از راه‌اندازی دوباره مرورگر، یک بار گذرواژه.',
  'pinOffer.later': 'هر زمان می‌توانید آن را در تنظیمات، بخش امنیت، تنظیم یا خاموش کنید.',
  'pin.description': 'برای دفعات زیادی که Passhold در روز قفل می‌شود، وقتی پشت همان مرورگر نشسته‌اید.',
  'pin.on': 'روشن',
  'pin.off': 'خاموش',
  'pin.bodyRecovery':
    'فقط تا وقتی مرورگر باز است کار می‌کند، و فقط پنج تلاش نادرست: بعد از آن، یا بعد از راه‌اندازی دوباره، دستگاه یا کلید بازیابی لازم است. هیچ‌چیزی که PIN باز می‌کند روی دیسک نگه داشته نمی‌شود.',
  'pin.body':
    'فقط تا وقتی مرورگر باز است کار می‌کند، و فقط پنج تلاش نادرست: بعد از آن، یا بعد از راه‌اندازی دوباره، گذرواژه اصلی لازم است. هیچ‌چیزی که PIN باز می‌کند روی دیسک نگه داشته نمی‌شود.',
  'pin.setUp': 'تنظیم PIN',
  'pin.change': 'تغییر',
  'pin.turnOff': 'خاموش کردن',
  'pin.new': 'PIN، ۶ تا ۱۲ رقم',
  'pin.again': 'دوباره تایپ کنید',
  'pin.save': 'ذخیره PIN',

  'general.description': 'Passhold در سایت‌ها چطور رفتار می‌کند، و چه شکلی است.',
  'general.filling': 'پر کردن و ذخیره',
  'general.appearance': 'زبان و ظاهر',
  'settings.autoSuggest': 'وقتی روی فیلد ورود، کارت یا نشانی کلیک می‌کنید، پیشنهادها را نشان بده',
  'settings.autoSuggestBody':
    'ورودهای شما برای سایت، یک گذرواژه قوی روی فرم ثبت‌نام، کارت‌ها و نشانی‌هایتان هنگام پرداخت. تا وقتی شما انتخاب نکنید چیزی پر نمی‌شود.',

  'trash.description': 'ورودها، کارت‌ها، نشانی‌ها و یادداشت‌ها اینجا می‌مانند تا آن‌ها را بازگردانید یا برای همیشه حذفشان کنید.',
  'trash.sharedDescription':
    'با خانواده به اشتراک گذاشته شده: هر کس در آن باشد می‌تواند اینها را بازگرداند. وقتی برای همیشه حذف شوند، برای همه می‌روند.',
  'trash.sharedMember':
    'با خانواده به اشتراک گذاشته شده: شما می‌توانید اینها را بازگردانید. فقط یکی از سازمان‌دهندگان خانواده آنها را برای همیشه حذف می‌کند.',
  'settings.autoLock': 'قفل شود بعد از',
  'settings.autoLock.never': 'فقط وقتی مرورگر بسته شود',
  'settings.autoLock.minutes': { one: '{count} دقیقه', other: '{count} دقیقه' },
  'settings.autoLock.hours': { one: '{count} ساعت', other: '{count} ساعت' },
  'settings.lockWithSystem': 'وقتی رایانه قفل می‌شود یا به خواب می‌رود قفل شود',
  'settings.clipboard': 'گذرواژه‌های کپی‌شده را پاک کن بعد از',
  'settings.clipboard.never': 'هرگز',
  'settings.clipboard.seconds': { one: '{count} ثانیه', other: '{count} ثانیه' },
  'settings.clipboard.minutes': { one: '{count} دقیقه', other: '{count} دقیقه' },
  'settings.inlineButton': 'دکمه Passhold را در فیلدهای ورود، کارت و نشانی نشان بده',
  'settings.offerToSave': 'وقتی وارد می‌شوید، ذخیره ورودها را پیشنهاد بده',
  'settings.offerToSaveCards': 'وقتی پرداخت می‌کنید، ذخیره کارت‌ها و نشانی‌ها را پیشنهاد بده',
  'settings.offerToSaveCardsBody':
    'کارت فقط از صفحه امن (https)، و فقط اگر شماره‌اش درست جمع شود. با چهار رقم آخرش نشان داده می‌شود، هرگز با شماره یا کدش.',
  'settings.passkeys': 'ذخیره و استفاده از کلیدهای عبور',
  'settings.passkeysBody':
    'وقتی سایتی کلید عبور پیشنهاد کند، Passhold آن را کنار ورودهایتان نگه می‌دارد و با آن وارد می‌شوید. اگر خاموش باشد، کلیدهای عبور به مرورگر سپرده می‌شوند.',
  'settings.language': 'زبان',
  'settings.language.auto': 'مثل مرورگر',
  'settings.theme': 'ظاهر',
  'settings.theme.system': 'مثل سیستم',
  'settings.theme.light': 'روشن',
  'settings.theme.dark': 'تیره',

  'settings.security': 'گذرواژه اصلی',
  'settings.securityBody': 'با عوض کردنش، کلید گاوصندوقتان دوباره قفل می‌شود؛ ورودهایتان همان‌طور می‌مانند.',
  'settings.current': 'گذرواژه اصلی فعلی',
  'settings.new': 'گذرواژه اصلی جدید',
  'settings.confirm': 'گذرواژه جدید را دوباره وارد کنید',
  'settings.change': 'تغییر گذرواژه اصلی',
  'settings.changeOpen': 'تغییر',
  'settings.changed': 'گذرواژه اصلی تغییر کرد.',

  'settings.backup': 'پشتیبان‌گیری',
  'settings.backupBody':
    'کل گاوصندوق شما در یک فایل رمزگذاری‌شده. آن را جایی غیر از این رایانه نگه دارید — مثلاً یک فلش USB یا فضای ابری‌تان — تا از دست رفتن این مرورگر ورودهایتان را از بین نبرد. فقط با گذرواژه اصلی‌ای باز می‌شود که هنگام ساختنش داشتید.',
  'settings.backupBodyRecovery':
    'کل گاوصندوق شما در یک فایل رمزگذاری‌شده. آن را جایی غیر از این رایانه نگه دارید — مثلاً یک فلش USB یا فضای ابری‌تان — تا از دست رفتن این مرورگر ورودهایتان را از بین نبرد. با کلید بازیابی‌تان باز می‌شود.',
  'settings.backupLast': 'آخرین پشتیبان: {date}',
  'settings.backupNever': 'هنوز پشتیبانی نیست.',
  'settings.backupButton': 'دانلود پشتیبان',
  'settings.backupDone': 'در دانلودهایتان ذخیره شد. حالا آن را جایی غیر از این رایانه ببرید.',

  'settings.restoreBackup': 'بازیابی از یک پشتیبان',
  'settings.restoreBodyNew':
    'هنوز گاوصندوقی در این مرورگر نیست. آن را از یک فایل پشتیبان برگردانید — با گذرواژه اصلی‌ای باز می‌شود که پشتیبان با آن ساخته شده — یا از دکمه Passhold در نوار ابزار یکی تازه بسازید.',
  'settings.restoreBodyMerge':
    'آنچه یک پشتیبان دارد را به این گاوصندوق می‌افزاید. هیچ‌چیز اینجا حذف نمی‌شود: اگر هر دو یک ورود دارند، ویرایش جدیدتر نگه داشته می‌شود و گذرواژه دیگر به سابقه‌اش می‌رود.',
  'settings.restoreChoose': 'انتخاب فایل پشتیبان',
  'settings.restoreMade': 'پشتیبان ساخته‌شده در {date}',
  'settings.restorePassword': 'گذرواژه اصلی پشتیبان',
  'settings.restoreRecoveryKey': 'کلید بازیابی پشتیبان',
  'settings.restoreButton': 'بازیابی',
  'settings.restoreNew': {
    one: 'گاوصندوق بازیابی شد، با {count} مورد.',
    other: 'گاوصندوق بازیابی شد، با {count} مورد.',
  },
  'settings.restoreAdded': {
    one: '{count} مورد از پشتیبان افزوده شد.',
    other: '{count} مورد از پشتیبان افزوده شد.',
  },
  'settings.restoreUpdated': {
    one: '{count} مورد در پشتیبان ویرایش جدیدتری داشت.',
    other: '{count} مورد در پشتیبان ویرایش جدیدتری داشت.',
  },
  'settings.restoreNothing': 'همه‌چیز در پشتیبان از قبل در این گاوصندوق است.',

  'settings.import': 'درون‌ریزی',
  'settings.importBody':
    'گذرواژه‌هایتان را از Chrome، Edge، Firefox، Safari، Apple Passwords، Bitwarden، 1Password، LastPass، KeePass، Dashlane، Proton Pass یا NordPass بیاورید: آنجا به‌صورت فایل CSV برونبری کنید، سپس اینجا آن را انتخاب کنید. کارت‌ها، نشانی‌ها و یادداشت‌های داخل فایل هم می‌آیند. از Bitwarden به‌صورت JSON (رمزگذاری‌نشده) برونبری کنید: CSV آن کارت‌ها، هویت‌ها و کلیدهای عبور را جا می‌گذارد. Dashlane اینها را در فایل‌های جدا می‌گذارد: هر کدام را پشت سر هم انتخاب کنید.',
  'settings.importChoose': 'انتخاب فایل',
  'settings.importFound': 'برای درون‌ریزی پیدا شد: {what}.',
  'settings.importLogins': { one: '{count} ورود', other: '{count} ورود' },
  'settings.importPasskeys': { one: '{count} کلید عبور', other: '{count} کلید عبور' },
  'settings.importCards': { one: '{count} کارت', other: '{count} کارت' },
  'settings.importAddresses': { one: '{count} نشانی', other: '{count} نشانی' },
  'settings.importNotes': { one: '{count} یادداشت', other: '{count} یادداشت' },
  'settings.importSkipped': {
    one: '{count} مورد چیزی ندارد که Passhold نگه دارد، و کنار گذاشته می‌شود.',
    other: '{count} مورد چیزی ندارند که Passhold نگه دارد، و کنار گذاشته می‌شوند.',
  },
  'settings.importDuplicates': {
    one: '{count} مورد از قبل در گاوصندوق شماست.',
    other: '{count} مورد از قبل در گاوصندوق شماست.',
  },
  'settings.importConfirm': 'درون‌ریزی',
  'settings.importDone': 'درون‌ریزی شد: {what}.',
  'settings.importDelete': 'حالا فایل CSV را حذف کنید: گذرواژه‌هایتان را به‌صورت متن ساده دارد.',
  'settings.importNothing': 'در آن فایل چیز تازه‌ای برای درون‌ریزی نیست.',
  'settings.importTwoFactor': {
    one: '{count} ورود در این فایل کد دومرحله‌ای (2FA) دارد. Passhold کد 2FA نگه نمی‌دارد: پیش از حذف مدیر گذرواژه قبلی‌تان، آن را به یک برنامه احراز هویت منتقل کنید، وگرنه ممکن است از آن حساب قفل شوید.',
    other:
      '{count} ورود در این فایل کدهای دومرحله‌ای (2FA) دارند. Passhold کد 2FA نگه نمی‌دارد: پیش از حذف مدیر گذرواژه قبلی‌تان، آنها را به یک برنامه احراز هویت منتقل کنید، وگرنه ممکن است از آن حساب‌ها قفل شوید.',
  },
  'settings.importAuthenticator': 'دریافت Keyrook Authenticator',
  'settings.importPasskeysLeft': {
    one: '{count} کلید عبور در این فایل نمی‌تواند به Passhold برسد. مدیر گذرواژه قبلی‌تان را نگه دارید تا از راه دیگری به آن سایت وارد شوید و در Passhold کلید عبور تازه‌ای بسازید.',
    other:
      '{count} کلید عبور در این فایل نمی‌توانند به Passhold برسند. مدیر گذرواژه قبلی‌تان را نگه دارید تا از راه دیگری به آن سایت‌ها وارد شوید و در Passhold کلیدهای عبور تازه بسازید.',
  },

  'settings.export': 'برون‌بری',
  'settings.exportBody':
    'یک فایل CSV که هر مرورگر و مدیر گذرواژه‌ای می‌تواند بخواند. گذرواژه‌هایتان را به‌صورت متن ساده دارد: فقط تا زمانی نگهش دارید که لازم دارید. فقط ورودها را دارد: کلیدهای عبور، فیلدهای سفارشی، پوشه‌ها، کارت‌ها، نشانی‌ها و یادداشت‌ها در آن نیستند. پشتیبان همه‌چیز را نگه می‌دارد.',
  'settings.exportButton': 'برون‌بری CSV',
  'settings.exportDone': 'برون‌بری شد. وقتی کارتان با آن تمام شد، فایل را حذف کنید.',

  'settings.neverSave': 'هرگز پیشنهاد ذخیره نده برای',
  'settings.neverSaveEmpty':
    'هیچ سایتی نیست. وقتی Passhold پیشنهاد ذخیره می‌دهد، «هرگز برای این سایت» را انتخاب کنید تا اینجا ظاهر شود.',
  'settings.remove': 'حذف',

  'settings.trash': 'سطل زباله',
  'settings.trashEmpty': 'سطل زباله خالی است.',
  'settings.restore': 'بازیابی',
  'settings.deleteForever': 'حذف برای همیشه',
  'settings.emptyTrash': 'خالی کردن سطل زباله',
  'settings.emptyTrashConfirm': 'همه‌چیز در سطل زباله برای همیشه حذف شود؟',

  'settings.danger': 'حذف گاوصندوق',
  'settings.dangerBody':
    'گاوصندوق را از این مرورگر حذف می‌کند. هر ورودی داخل آن برای همیشه از بین می‌رود — اگر می‌خواهید نگهشان دارید، اول یک پشتیبان دانلود کنید.',
  'settings.dangerType': 'برای تأیید {word} را تایپ کنید',
  'settings.dangerWord': 'حذف',
  'settings.dangerButton': 'حذف گاوصندوق',

  'settings.about': 'Passhold {version} · توسط Keyrook',

  // Errors
  'error.noWorker': 'Passhold پاسخ نداد. این را ببندید و دوباره امتحان کنید.',
  'error.wrongPassword': 'این گذرواژه اصلی نیست.',
  'error.passwordTooShort': 'دست‌کم {min} کاراکتر به کار ببرید.',
  'error.vaultCorrupt': 'گاوصندوق روی این دستگاه آسیب دیده و نمی‌تواند باز شود.',
  'error.vaultTooNew': 'این گاوصندوق را یک Passhold جدیدتر ساخته است. برای باز کردنش، Passhold را به‌روز کنید.',
  'error.itemNotFound': 'این دیگر در گاوصندوق نیست.',
  'error.familyOrganiserOnly': 'فقط یکی از سازمان‌دهندگان خانواده می‌تواند سطل زباله این گاوصندوق را خالی کند.',
  'error.familyGone': 'آن خانواده دیگر اینجا نیست. همگام‌سازی کنید، سپس دوباره نگاه کنید.',
  'error.familyNotOpen': 'Passhold هنوز نمی‌تواند آن خانواده را در این مرورگر باز کند. همگام‌سازی کنید و دوباره امتحان کنید.',
  'error.itemInvalid': 'این‌طور که هست نمی‌تواند ذخیره شود.',
  'error.importEmpty': 'این فایل چیزی برای درون‌ریزی ندارد.',
  'error.importTooLarge': 'این فایل برای درون‌ریزی خیلی بزرگ است.',
  'error.importUnknownFormat': 'این فایل شبیه برونبری گذرواژه نیست.',
  'error.importEncrypted':
    'این برونبری Bitwarden رمزگذاری شده و Passhold نمی‌تواند بازش کند. در Bitwarden دوباره به‌صورت «.json» برونبری کنید، نه «.json (Encrypted)»، و سپس همان فایل را انتخاب کنید.',
  'error.backupInvalid': 'این فایل یک پشتیبان Passhold نیست، یا آسیب دیده است.',
  'error.backupWrongPassword': 'این گذرواژه اصلی‌ای نیست که این پشتیبان با آن ساخته شده.',
  'error.backupWrongRecoveryKey': 'این کلید بازیابی‌ای نیست که این پشتیبان با آن ساخته شده.',
  'error.noRecoveryKey': 'این گاوصندوق کلید بازیابی‌ای برای نشان دادن ندارد: با گذرواژه اصلی باز می‌شود.',
  'error.wrongRecoveryKey': 'این کلید بازیابی نیست.',
  'error.deviceNeeded':
    'گاوصندوقی که گذرواژه اصلی ندارد، با قفل‌گشایی این دستگاه باز می‌شود: اول آن را تنظیم کنید. تا وقتی گذرواژه اصلی تنظیم نشده، بماند.',
  'error.accountOffline': 'به Keyrook نرسیدیم. اتصال را بررسی کنید و دوباره امتحان کنید.',
  'error.accountWrong':
    'ایمیل یا گذرواژه نادرست است. حسابی که با Google یا GitHub ساخته شده، به‌جایش با دکمه خودش وارد می‌شود.',
  'error.accountSignedOut': 'Keyrook این مرورگر را خارج کرد. دوباره وارد شوید.',
  'error.accountBusy': {
    one: 'تلاش‌های زیاد. {count} ثانیه صبر کنید و دوباره امتحان کنید.',
    other: 'تلاش‌های زیاد. {count} ثانیه صبر کنید و دوباره امتحان کنید.',
  },
  'error.accountFailed': 'Keyrook همین حالا نتوانست این کار را انجام دهد. بعداً دوباره امتحان کنید.',
  'error.accountAlready': 'این گاوصندوق از قبل به یک حساب Keyrook وصل است.',
  'error.accountNone': 'این گاوصندوق به هیچ حساب Keyrook وصل نیست.',
  'error.accountKdfRefused': 'Keyrook کلیدی ضعیف‌تر از آنچه Passhold می‌پذیرد خواست، پس ورود متوقف شد.',
  'error.accountKeyWrong': 'کلید حساب با این گذرواژه باز نشد.',
  'error.accountCode': 'این کد درست نیست، یا منقضی شده است. ایمیل را بررسی کنید، یا کد تازه بخواهید.',
  'error.accountMail': 'Keyrook همین حالا نتوانست ایمیل را بفرستد. یک دقیقه دیگر دوباره امتحان کنید.',
  'error.providerDenied': 'ورود لغو شد.',
  'error.providerFailed': 'Google یا GitHub همین حالا نتوانست شما را وارد کند. دوباره امتحان کنید.',
  'error.providerExpired': 'این ورود تمام شده است. از نو شروع کنید.',
  'error.providerNotOwner':
    'این حسابی نیست که این حساب Keyrook با آن وارد می‌شود. با همان حسابی که برای Keyrook به کار می‌برید دوباره وارد شوید.',
  'error.signOutUnsent': {
    one: 'یک مورد هنوز به حساب Keyrook شما نرسیده، پس چیزی حذف نشد. اتصال را بررسی کنید، یا دوباره وارد شوید و سپس خارج شوید.',
    other:
      '{count} مورد هنوز به حساب Keyrook شما نرسیده‌اند، پس چیزی حذف نشد. اتصال را بررسی کنید، یا دوباره وارد شوید و سپس خارج شوید.',
  },
  'error.providerOtherProvider':
    'این ایمیل از قبل یک حساب Keyrook دارد که با دیگری از Google و GitHub وارد می‌شود. با همان وارد شوید.',
  'error.providerHasPassword':
    'این ایمیل از قبل یک حساب Keyrook با گذرواژه دارد. اینجا با ایمیل و گذرواژه‌تان وارد شوید — یا، برای ورود با Google یا GitHub هم، آن را در account.keyrook.com اضافه کنید، آنجا با گذرواژه‌تان وارد شده باشید.',
  'error.providerEmailTaken':
    'این ایمیل از قبل یک حساب Keyrook دارد که به روش دیگری وارد می‌شود. با همان روش وارد شوید — یا این حساب را در account.keyrook.com به آن اضافه کنید، آنجا به همان روشی که الان وارد می‌شود.',
  'error.pairingWrongKey':
    'آنچه برگشت کلید این حساب نیست، پس رد شد. دوباره بپرسید، و فقط از مرورگری که می‌شناسید راهش دهید.',
  'error.pairingRefused': 'این از مرورگری که کدش را بررسی کردید نیامد، پس رد شد. دوباره بپرسید.',
  'error.pairingEnded': 'این درخواست تمام شده است. از مرورگر جدید دوباره بپرسید.',
  'error.passkeyWrong': 'این کلید عبور این حساب را باز نمی‌کند. راه دیگری برای ورود امتحان کنید.',
  'error.joinExpired': 'این ورود خیلی منتظر ماند. دوباره وارد شوید.',
  'error.accountPasswordWrong': 'این گذرواژه حساب نیست.',
  'error.accountNoKit': 'Passhold کلید بازیابی این حساب را ندارد.',
  'error.accountKitRace': 'یک برنامه دیگر همین حالا کلید بازیابی حساب را عوض کرد. همگام‌سازی کنید و دوباره امتحان کنید.',
  'error.accountKitShape': 'این شبیه کلید بازیابی حساب نیست: ۳۲ حرف و رقم است.',
  'error.accountKitWrong': 'این کلید بازیابی با حسابی با این نشانی ایمیل جور نیست.',
  'error.accountKitNotThis': 'این کلید بازیابی این حساب نیست. دوباره به آنچه ذخیره کرده‌اید نگاه کنید.',
  'error.accountPasswordWeak':
    'برای یک حساب خیلی آسان حدس زده می‌شود: یک گذرواژه بلندتر با ترکیبی از حروف، رقم و نماد به کار ببرید، یا چهار پنج کلمه بی‌ربط.',
  'error.accountBoxWrong':
    'کلید Passhold در این حساب باز نشد. دوباره وارد شوید؛ اگر باز هم نشد، حساب را از نو شروع کنید.',
  'error.accountCodeWait': {
    one: 'لحظاتی پیش کدی فرستاده شد. می‌توانید {count} ثانیه دیگر کد دیگری بخواهید.',
    other: 'لحظاتی پیش کدی فرستاده شد. می‌توانید {count} ثانیه دیگر کد دیگری بخواهید.',
  },
  'error.accountSignUpKeys':
    'Keyrook کلید خود Passhold را خواست، و هیچ کلیدی فرستاده نشد. Passhold را به‌روز کنید و دوباره امتحان کنید.',
  'error.accountIdTaken': 'حساب همین حالا ساخته نشد. کد تازه بخواهید و دوباره امتحان کنید.',
  'error.accountNoRoot': 'این حساب هنوز کلیدی ندارد که کلید بازیابی بتواند بازش کند. دوباره با گذرواژه‌اش وارد شوید.',
  'error.accountRootNotHeld':
    'این رایانه نتوانست نشان دهد که کلید حساب را دارد. دوباره با گذرواژه یا کلید بازیابی وارد شوید.',
  'error.accountRootChanged':
    'کلیدهای این حساب روی رایانه دیگری عوض شد. روی رایانه‌ای وارد شوید که Passhold هنوز در آن وارد است، یا حساب را از نو شروع کنید.',
  'error.accountKeyReplaced': 'کلید Passhold در این حساب روی رایانه دیگری عوض شد. دوباره وارد شوید.',
  'error.accountSessionStolen': 'این رایانه خارج شد، چون نشستش از جای دیگری به کار رفت. دوباره وارد شوید.',
  'error.accountOld':
    'این حساب پیش از آنکه هر برنامه Keyrook کلید خودش را داشته باشد، با Google یا GitHub ساخته شد، و هیچ‌چیز آن هنوز Passhold را باز نمی‌کند. برای دادن کلید، حساب را با ایمیلش از نو شروع کنید.',
  'error.pairingBusy': 'بیش از حد مرورگر منتظرند تا به این حساب بپیوندند. چند دقیقه دیگر دوباره امتحان کنید.',
  'error.startOverExpired': 'این منقضی شده است. کد تازه بخواهید و از نو شروع کنید.',
  'error.startOverTooOften': 'این حساب اخیراً خیلی زیاد از نو شروع شده است. بعد از {day} دوباره امتحان کنید.',
  'error.startOverWaiting': 'این حساب از قبل در {day} از نو شروع می‌شود. مرورگری که هنوز به آن وارد است می‌تواند این را لغو کند.',
  'error.startOverUpdate':
    'Keyrook حالا یک هفته صبر می‌کند پیش از آنکه حسابی از نو شروع شود. برای درخواست آن، Passhold را به‌روز کنید.',
  'error.passkeyFailed': 'این کلید عبور نتوانست بررسی شود. دوباره امتحان کنید.',
  'error.passkeyNotYou': 'این کلید عبور تأیید نکرد که شما هستید. دوباره امتحان کنید، و همان‌طور که می‌خواهد بازش کنید.',
  'error.passkeyUnknown':
    'این کلید عبور روی هیچ حساب Keyrook نیست. شاید حذف شده باشد: با گذرواژه، یا با Google یا GitHub وارد شوید.',
  'error.passkeyExpired': 'این درخواست کلید عبور تمام شده است. دوباره امتحان کنید.',
  'error.passkeyNotOffered': 'Keyrook هنوز کلید عبور را اینجا پیشنهاد نمی‌دهد.',
  'error.passkeyNoUnlock':
    'این کلید عبور وارد می‌شود، اما هنوز تنظیم نشده که حساب شما را باز کند. در account.keyrook.com، زیر «Passkeys»، کنارش «Let it unlock» را انتخاب کنید، سپس دوباره امتحان کنید. یا با گذرواژه، یا با Google یا GitHub وارد شوید.',
  'error.passkeyNoPrf':
    'این کلید عبور به account.keyrook.com وارد می‌شود، اما جایی که نگهداری می‌شود نمی‌تواند حساب شما را باز کند — iCloud Keychain پیش از macOS 15، برای نمونه، نمی‌تواند. در account.keyrook.com، زیر «Passkeys»، کلیدی بسازید که جایی نگهداری شود که بتواند، مثل یک کلید امنیتی، و بررسی کنید که «Unlocks your data» را نشان می‌دهد. تا آن موقع، با گذرواژه، یا با Google یا GitHub وارد شوید.',
  'error.passkeyPermission':
    'Passhold برای استفاده از کلیدهای عبور account.keyrook.com به اجازه Chrome نیاز دارد. کلید عبور را دوباره انتخاب کنید و اجازه دهید.',
  'error.passkeyPermissionEdge':
    'Passhold برای استفاده از کلیدهای عبور account.keyrook.com به اجازه Edge نیاز دارد. کلید عبور را دوباره انتخاب کنید و اجازه دهید.',
  'error.passkeyCancelled': 'هیچ کلید عبوری استفاده نشد. دوباره امتحان کنید، یا به روش دیگری وارد شوید.',
  'error.secondStepNeeded': 'حساب شما یک مرحله دوم می‌خواهد: کد برنامه احراز هویت خود را هم وارد کنید.',
  'error.secondStepWrong': 'این کد درست نیست. کدی را وارد کنید که برنامه احراز هویت شما الان نشان می‌دهد، یا کلید بازیابی‌تان.',
  'error.signInExpired': 'این ورود منقضی شده است. دوباره وارد شوید.',
  'error.secondStepUpdate': 'حساب شما برای ورود یک مرحله دوم می‌خواهد. Passhold را به‌روز کنید تا وارد شوید.',
  'error.secondStepAsked': 'حساب شما یک مرحله دوم می‌خواهد: کد برنامه احراز هویت خود را وارد کنید.',
  'error.secondStepTaken':
    'این همان کدی است که با آن وارد شدید، و هر کد فقط یک بار کار می‌کند. صبر کنید تا برنامه احراز هویت شما کد تازه‌ای نشان دهد.',
  'error.kitDraftGone': 'کلید بازیابی تازه به‌موقع تنظیم نشد، و چیزی عوض نشد. دوباره یک کلید تازه بسازید.',
  'error.archiveWrong': 'این چیزی را که نگه داشته شده باز نمی‌کند.',
  'error.archiveGone': 'این دیگر نگه داشته نمی‌شود.',
  'error.archiveDeleteRefused': 'فقط گذرواژه قبلی یا کلید بازیابی قبلی می‌تواند چیزی را که پیش از انقضایش نگه داشته شده حذف کند.',
  'error.accountNeedsRoot':
    'این حساب در Keyrook Authenticator ساخته شد، پیش از آنکه هر برنامه Keyrook کلید خودش را داشته باشد. Passhold حالا می‌تواند به آن یکی بدهد؛ در Authenticator چیزی عوض نمی‌شود.',
  'error.accountServerWrong':
    'سرور Keyrook با چیزی جواب داد که کلیدهای این حساب با آن جور نیست، پس Passhold ایستاد. بعداً دوباره امتحان کنید.',
  'error.startOverNeedsPassword': 'این حساب گذرواژه دارد: برای از نو شروع کردنش یک گذرواژه تازه انتخاب کنید.',
  'error.pinInvalid': 'PIN از ۶ تا ۱۲ رقم است.',
  'error.wrongPin': 'این PIN نیست.',
  'error.wrongPinLeft': { one: 'این PIN نیست. {count} تلاش مانده.', other: 'این PIN نیست. {count} تلاش مانده.' },
  'error.pinLockedOut': 'PIN نادرست زیاد. با راه دیگری باز کنید؛ بعد از آن PIN دوباره کار می‌کند.',
  'error.pinUnavailable': 'PIN فقط تا وقتی مرورگر باز است کار می‌کند. با راه دیگری باز کنید؛ بعد از آن PIN دوباره کار می‌کند.',
  'error.deviceGone': 'باز کردن با این دستگاه دیگر تنظیم نیست. با راه دیگری باز کنید.',
  'error.deviceKeyWrong': 'این Passhold را باز نکرد. با راه دیگری باز کنید، سپس قفل‌گشایی دستگاه را دوباره تنظیم کنید.',
  'error.deviceUnsupported':
    'جایی که آن کلید عبور ذخیره شده نمی‌تواند کلیدی برای باز کردن به Passhold بدهد. دوباره امتحان کنید و آن را در Google Password Manager ذخیره کنید — یا از PIN استفاده کنید.',
  'error.deviceUnsupportedEdge':
    'جایی که آن کلید عبور ذخیره شده نمی‌تواند کلیدی برای باز کردن به Passhold بدهد. دوباره امتحان کنید و آن را جای دیگری ذخیره کنید — یا از PIN استفاده کنید.',
  'error.deviceCancelled': 'چیزی باز نشد: لغو شد یا خیلی طول کشید.',
  'error.keyUnsupported':
    'این کلید نمی‌تواند چیزی را که Passhold برای باز شدن لازم دارد بدهد. بیشتر کلیدهای FIDO2 می‌توانند؛ کلیدی که فقط برای ورود دومرحله‌ای ساخته شده (U2F) نمی‌تواند.',
  'error.keyAlreadyAdded': 'این کلید از قبل اینجا تنظیم شده است.',
  'error.keyGone': 'این کلید امنیتی دیگر اینجا تنظیم نیست. با راه دیگری باز کنید.',
  'error.keyWrong': 'این کلید Passhold را باز نکرد. با راه دیگری باز کنید، سپس کلید را حذف و دوباره اضافه کنید.',
  'error.kdfUnsupported': 'تنظیمات گاوصندوق از آن‌هایی نیست که Passhold می‌پذیرد.',
  'error.locked': 'Passhold قفل است.',
  'error.noVault': 'هنوز گاوصندوقی نیست.',
  'error.vaultExists': 'گاوصندوقی از قبل وجود دارد.',
  'error.notOnPage': 'این ورود برای صفحه این برگه نیست.',
  'error.expired': 'این منقضی شده است. دوباره امتحان کنید.',
  'error.noFields': 'روی این صفحه چیزی نیست که Passhold پر کند.',
  'error.cardInsecure': 'Passhold کارت را فقط روی صفحه امن (https) پر می‌کند.',
  'error.unknown': 'مشکلی پیش آمد: {detail}',
};
