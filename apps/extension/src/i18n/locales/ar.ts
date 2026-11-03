import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'من Keyrook',

  // Common
  'common.cancel': 'إلغاء',
  'common.close': 'إغلاق',
  'common.save': 'حفظ',
  'common.edit': 'تعديل',
  'common.back': 'رجوع',
  'common.show': 'إظهار',
  'common.hide': 'إخفاء',
  'common.notNow': 'ليس الآن',

  // Setup
  'setup.title': 'أنشئ خزنتك',
  'setup.body':
    'يحتفظ Passhold بكلمات مرورك مشفّرة على هذا الجهاز. تفتحها كلمة مرور رئيسية واحدة – اختر كلمة تتذكرها ولا تستخدمها في أي مكان آخر.',
  'setup.password': 'كلمة المرور الرئيسية',
  'setup.confirm': 'أعد كتابتها',
  'setup.mismatch': 'كلمتا المرور غير متطابقتين.',
  'setup.tooShort': 'استخدم {min} حرفًا على الأقل.',
  'setup.understand':
    'أدرك أنه لا أحد – لا Passhold ولا Keyrook – يستطيع استرجاع خزنتي إذا نسيت كلمة المرور هذه.',
  'setup.create': 'إنشاء الخزنة',
  'setup.creating': 'جارٍ الإنشاء…',
  'setup.restore': 'الاستعادة من نسخة احتياطية',

  // Strength
  'setup.deviceBody':
    'يحتفظ Passhold بكلمات مرورك مشفّرة على هذا الجهاز، ويفتحها {method} – دون كلمة مرور رئيسية تحتاج إلى اختيارها أو تذكّرها. ستحصل أيضًا على مفتاح استرداد ليوم لا يعمل فيه {method}.',
  'setup.deviceWhereMac': 'عندما يسألك Chrome أين تحفظ مفتاح المرور، اختر “مدير كلمات المرور في Google”.',
  'setup.deviceWhereMacEdge':
    'عندما يسألك Edge أين تحفظ مفتاح المرور، اختر مكانًا يحفظه على أجهزتك الأخرى أيضًا. ليس كل مكان قادرًا على فتح Passhold: إذا لم يكن هذا المكان قادرًا على ذلك، سيخبرك Passhold بذلك.',
  'setup.createWithDevice': 'إنشاء باستخدام {method}',
  'setup.usePassword': 'استخدم كلمة مرور رئيسية بدلًا من ذلك',
  'setup.useDevice': 'استخدم {method} بدلًا من ذلك',
  'setup.signIn': 'سجّل الدخول أو أنشئ حساب Keyrook',

  'welcome.title': 'كلمات مرورك، على كل حاسوب',
  'welcome.body':
    'سجّل الدخول مرة واحدة. يُفتح Passhold ببصمتك ويملأ البيانات عنك، وتكون بيانات دخولك حيثما تسجّل الدخول.',
  'welcome.email': 'استخدم عنوان بريد إلكتروني',
  'gate.touchTitle': 'افتحه بلمسة',
  'gate.touchBody': 'يفتح Touch ID أو Windows Hello برنامج Passhold. لا حاجة إلى كلمة مرور رئيسية تختارها وتتذكرها.',
  'gate.everywhereTitle': 'على كل حاسوب تستخدمه',
  'gate.everywhereBody': 'سجّل الدخول على حاسوب آخر، فتكون كلمات مرورك ومفاتيح مرورك هناك.',
  'gate.privateTitle': 'أنت وحدك من يستطيع قراءتها',
  'gate.privateBody':
    'تُشفَّر على هذا الحاسوب قبل إرسال أي شيء. لا تستطيع Keyrook قراءة كلمات مرورك، ولا معرفة المواقع التي تخصها.',
  'welcome.note':
    'تُشفَّر أولًا على هذا الحاسوب: لا تستطيع Keyrook قراءة كلمات مرورك، ولا معرفة المواقع التي تخصها.',
  'connect.title': 'فعّل حساب Keyrook الخاص بك',
  'connect.body': 'بيانات دخولك على كل حاسوب تستخدمه – وفي نسخة احتياطية إن ضاع هذا الحاسوب.',
  'connect.email': 'البريد الإلكتروني',
  'kitCheck.title': 'تحقّق من مفتاح استرداد حسابك',
  'kitCheck.body': 'اكتبه مرة واحدة، لتعرف أنه ما زال معك قبل اليوم الذي تحتاجه فيه.',
  'accountPasskey.button': 'المتابعة بمفتاح مرور',
  'accountPasskey.working': 'في انتظار مفتاح المرور…',
  'accountPasskey.hint':
    'مفتاح أضفته على account.keyrook.com. في المرة الأولى، يسألك {browser} إن كان يسمح لـ Passhold باستخدامه.',
  'accountPasskey.openPasskeys': 'افتح “Passkeys” على account.keyrook.com',
  'join.title': 'سجّل الدخول إلى Keyrook',
  'join.body': 'حساب Keyrook واحد لـ Passhold وKeyrook Authenticator. تصل بيانات دخولك إلى هذا المتصفح من الحساب.',
  'join.createTitle': 'أنشئ حساب Keyrook',
  'join.createBody':
    'حساب واحد لـ Passhold وKeyrook Authenticator: بيانات دخولك، مشفّرة أولًا على هذا الجهاز، على كل حاسوب تسجّل الدخول إليه.',
  'join.lockTitle': 'مسجَّل الدخول باسم {email}',
  'join.lockBodyDevice':
    'الخطوة الأخيرة: يُفتح Passhold على هذا الحاسوب باستخدام {method}. تُحمَّل بيانات دخولك فور الانتهاء من الإعداد.',
  'join.cancel': 'استخدم حسابًا آخر',
  'join.lockBodyCode':
    'الخطوة الأخيرة: رمز يفتح Passhold على هذا الحاسوب. تُحمَّل بيانات دخولك فور الانتهاء من الإعداد.',
  'join.opening': 'جارٍ فتح Passhold…',
  'setup.useAccountPassword': 'استخدم كلمة مرور حسابي بدلًا من ذلك',
  'setup.useCode': 'استخدم رمزًا لهذا الحاسوب بدلًا من ذلك',
  'security.accountPasswordTitle': 'يُفتح بكلمة مرور حساب Keyrook الخاص بك',
  'security.accountPasswordBody':
    'كلمة مرور واحدة للأمرين. عند تغييرها، يتبعها Passhold هنا في المرة التالية التي تسجّل فيها الدخول.',

  'recovery.title': 'احفظ مفتاح الاسترداد',
  'recovery.body':
    'إذا ضاع هذا الجهاز، أو توقّف فتحه عن العمل، فهذا المفتاح هو طريقك للعودة إلى خزنتك ونسخها الاحتياطية. يمكنك رؤيته مجددًا في الإعدادات ما دام Passhold يُفتح – لذا احتفظ به في مكان آخر أيضًا: مطبوعًا، أو على هاتفك، أو في ملف بعيدًا عن هذا الحاسوب.',
  'recovery.download': 'تنزيل',
  'recovery.copy': 'نسخ',
  'recovery.copied': 'تم النسخ',
  'recovery.print': 'طباعة',
  'recovery.qr': 'إظهار رمز QR',
  'recovery.qrHide': 'إخفاء رمز QR',
  'recovery.qrLabel': 'مفتاح الاسترداد كرمز QR',
  'recovery.qrHint': 'وجّه كاميرا هاتفك نحوه واحفظ النص في ملاحظة، أو التقط له صورة.',
  'recovery.show': 'إظهار',

  'kit.title': 'ورقة استرداد Passhold',
  'kit.made': 'أُنشئت في {date}',
  'kit.keyLabel': 'مفتاح الاسترداد',
  'kit.whenTitle': 'عندما لا يُفتح Passhold',
  'kit.sameDevice':
    'على هذا الحاسوب: عندما يطلب Passhold فتح القفل، اختر “استخدام مفتاح الاسترداد بدلًا من ذلك” واكتب المفتاح.',
  'kit.newDevice':
    'على حاسوب جديد: ثبّت Passhold، واختر “الاستعادة من نسخة احتياطية”، واختر أحدث ملف نسخة احتياطية لديك، واكتب المفتاح. بدون نسخة احتياطية لا يوجد ما يُستعاد، لذا احتفظ بواحدة.',
  'kit.keep': 'احتفظ بهذه الورقة في مكان آمن، بعيدًا عن حاسوبك. كل من يملكها ونسخة من خزنتك يستطيع فتح الخزنة.',
  'recovery.fileTitle': 'مفتاح استرداد Passhold',
  'recovery.fileMade': 'أُنشئ في {date}',
  'recovery.fileBody':
    'يفتح هذا المفتاح خزنة Passhold الخاصة بك ونسخها الاحتياطية عندما لا يستطيع جهازك ذلك. كل من يملكه ونسخة من خزنتك يستطيع فتحها، لذا احتفظ به في أمان وليس على الحاسوب نفسه.',
  'recovery.pending': 'لم يُحفظ مفتاح الاسترداد بعد',
  'recovery.keptState': 'تم حفظ مفتاح الاسترداد',
  'recovery.rowBody':
    'يفتح خزنتك ونسخها الاحتياطية عندما يعجز {method} عن ذلك. المفتاح الجديد يوقف فتح هذه الخزنة بالقديم؛ النسخ المُنشأة قبله ما زالت تُفتح بالقديم.',
  'recovery.makeNew': 'إنشاء واحد جديد',
  'recovery.savedIt': 'لقد حفظته',
  'recovery.checkTitle': 'تحقّق من أنك حفظته',
  'recovery.checkBody':
    'اكتب مجموعتين من المفتاح من الذي حفظته – الملف أو الورقة أو الصورة. المجموعات هي الكتل المكوّنة من أربعة رموز بين الشرطات، معدودةً من اليسار.',
  'recovery.group': 'المجموعة {position}',
  'recovery.check': 'تحقّق',
  'recovery.checkWrong':
    'هذا ليس ما يقوله مفتاحك. انظر مجددًا إلى ما حفظته، أو اعرض المفتاح من جديد واحفظه الآن.',
  'recovery.showAgain': 'اعرض المفتاح مجددًا',
  'recovery.covered': 'حساب Keyrook الخاص بك هو طريق العودة',
  'recovery.coveredBody':
    'إذا توقّف {method} عن فتح Passhold هنا، فأزِل الخزنة وسجّل الدخول إلى حسابك مرة أخرى: ستعود كل بيانات الدخول. مفتاح الاسترداد الخاص بهذه الخزنة ما زال متاحًا هنا لعرضه.',

  'proof.recoveryKey': 'مفتاح الاسترداد',
  'proof.withDevice': 'ستؤكد باستخدام {method}.',
  'proof.useDevice': 'أكّد باستخدام {method} بدلًا من ذلك',
  'proof.usePassword': 'اكتب كلمة المرور الرئيسية بدلًا من ذلك',
  'proof.useAccountPassword': 'اكتب كلمة مرور الحساب بدلًا من ذلك',
  'proof.useCode': 'اكتب الرمز بدلًا من ذلك',
  'proof.useRecoveryKey': 'اكتب مفتاح الاسترداد بدلًا من ذلك',
  'strength.0': 'ضعيفة جدًا',
  'strength.1': 'ضعيفة',
  'strength.2': 'مقبولة',
  'strength.3': 'قوية',
  'strength.4': 'قوية جدًا',
  'strength.short': 'كلما طالت كانت أقوى: اجعلها 14 حرفًا أو أكثر.',
  'strength.digitsOnly': 'الأرقام وحدها يسهل تخمينها.',
  'strength.repeats': 'تجنّب تكرار الحرف نفسه مرارًا.',

  // Unlock
  'unlock.title': 'Passhold مُقفَل',
  'unlock.body': 'أدخل كلمة المرور الرئيسية.',
  'unlock.password': 'كلمة المرور الرئيسية',
  'unlock.submit': 'فتح القفل',
  'unlock.pinBody': 'أدخل رمز PIN الخاص بك.',
  'unlock.pin': 'رمز PIN',
  'unlock.usePassword': 'استخدم كلمة المرور الرئيسية بدلًا من ذلك',
  'unlock.usePin': 'استخدم رمز PIN بدلًا من ذلك',
  'unlock.recoveryBody': 'أدخل مفتاح الاسترداد الخاص بك.',
  'unlock.deviceBody': 'استخدم {method}، أو اكتب أدناه.',
  'unlock.recoveryKey': 'مفتاح الاسترداد',
  'unlock.useRecoveryKey': 'استخدم مفتاح الاسترداد بدلًا من ذلك',
  'unlock.lost': 'لا يمكنك الدخول؟',
  'unlock.forgotBodyRecovery':
    'يفتح مفتاح الاسترداد الخزنة عندما يعجز الجهاز. بدونه وبدون الجهاز، لا يستطيع أحد – لا Passhold ولا Keyrook – فتح الخزنة: لا يمكنك سوى إزالتها من الإعدادات والبدء من جديد.',
  'unlock.bodyAccount': 'أدخل كلمة مرور حساب Keyrook الخاص بك.',
  'unlock.accountPassword': 'كلمة مرور حساب Keyrook',
  'unlock.useAccountPassword': 'استخدم كلمة مرور الحساب بدلًا من ذلك',
  'unlock.forgotBodyAccount':
    'هذه كلمة مرور حساب Keyrook الخاص بك: إن تغيّرت في مكان آخر، فاستخدم الجديدة. نسيتها نهائيًا؟ أزل هذه الخزنة من الإعدادات وسجّل الدخول مجددًا – باستخدام مفتاح الاسترداد إن احتجت إلى كلمة مرور جديدة – فتعود كل بيانات الدخول.',
  'unlock.bodyCode': 'أدخل الرمز الذي يفتح Passhold على هذا الحاسوب.',
  'unlock.code': 'رمز هذا الحاسوب',
  'unlock.useCode': 'استخدم الرمز بدلًا من ذلك',
  'unlock.forgotBodyCode':
    'أزل هذه الخزنة من الإعدادات وسجّل الدخول مجددًا باستخدام Google أو GitHub: ستعود كل بيانات الدخول من حسابك.',
  'unlock.device': 'افتح القفل باستخدام {method}',
  'unlock.key': 'افتح القفل بمفتاح أمان',
  'unlock.keyBody': 'وصّل مفتاح الأمان، أو اكتب أدناه.',
  'unlock.or': 'أو',
  'unlock.unlocking': 'جارٍ فتح القفل…',
  'unlock.forgot': 'نسيته؟',
  'unlock.forgotBody':
    'كلمة مرورك الرئيسية هي المفتاح الوحيد لهذه الخزنة، ولا تُحفظ في أي مكان. بدونها لا يمكن فتح الخزنة – لا يمكنك سوى إزالتها من الإعدادات والبدء من جديد.',

  // Vault
  'vault.search': 'بحث',
  'vault.lock': 'قفل',
  'vault.settings': 'الإعدادات',
  'vault.add': 'تسجيل دخول جديد',
  'vault.onThisPage': 'في {site}',
  'vault.all': 'كل بيانات الدخول',
  'vault.empty': 'لا توجد بيانات دخول بعد',
  'vault.emptyBody':
    'سجّل الدخول إلى موقع، وسيعرض Passhold حفظه – أو أضِف واحدًا هنا، أو استورد من متصفحك.',
  'vault.import': 'استيراد كلمات المرور',
  'vault.noResults': 'لا شيء يطابق “{query}”.',
  'vault.fill': 'ملء',
  'vault.copyUsername': 'نسخ اسم المستخدم',
  'vault.copyPassword': 'نسخ كلمة المرور',
  'vault.noUsername': 'لا يوجد اسم مستخدم',
  'vault.count': {
    one: 'عنصر واحد',
    two: 'عنصران',
    few: '{count} عناصر',
    many: '{count} عنصرًا',
    other: '{count} عنصر',
  },
  'vault.everything': 'كل العناصر',

  // Asking for a rating, once, after real use
  'rating.title': 'هل وجدت Passhold مفيدًا؟',
  'rating.body': 'التقييم في المتجر يساعد الآخرين على العثور عليه.',
  'rating.rate': 'قيّمه',
  'rating.later': 'ليس الآن',

  // What a list shows, and what can be added
  'kinds.label': 'إظهار',
  'kinds.all': 'الكل',
  'kinds.logins': 'تسجيلات الدخول',
  'kinds.cards': 'البطاقات',
  'kinds.addresses': 'العناوين',
  'kinds.notes': 'الملاحظات',
  'kinds.noLogins': 'لا توجد بيانات دخول بعد.',
  'kinds.noCards':
    'لا توجد بطاقات بعد. أضف واحدة بالزر + أعلاه، وسيملؤها Passhold عند الدفع عندما تختارها.',
  'kinds.noAddresses':
    'لا توجد عناوين بعد. أضف واحدًا بالزر + أعلاه، وسيملؤه Passhold حيثما يطلبه نموذج.',
  'kinds.noNotes':
    'لا توجد ملاحظات بعد. تحفظ الملاحظة ما ليس بيانات دخول – كلمة مرور للشبكة اللاسلكية، أو رمز ترخيص – مشفّرًا مع كل شيء آخر.',
  'add.menu': 'إضافة',
  'add.login': 'تسجيل دخول',
  'add.card': 'بطاقة',
  'add.address': 'عنوان',
  'add.note': 'ملاحظة',
  'place.label': 'الخزائن',
  'place.mine': 'خزنتي',
  'place.of': '{vault}، مشتركة في {family}',
  'move.to': 'نقل إلى {vault}',
  'move.confirm':
    'سيراها كل من في {family} داخل {vault}، ويستطيع تغييرها. تخرج من خزنتك؛ وتبقى كلمات مرورها السابقة خلفها.',
  'move.do': 'نقل',
  'family.unlockTitle': 'افتح الخزنة المشتركة لـ {family} في هذا المتصفح',
  'family.unlockBody':
    'يحتاج Passhold مرة واحدة إلى كلمة مرور حساب Keyrook الخاص بك، لنقل مفتاحك إلى العائلة في هذا المتصفح. لا تُرسل إلى أي مكان.',
  'family.unlockOnPage': 'افتح صفحة “Family” على account.keyrook.com، وأعطِ Passhold هناك مفتاحك للعائلة.',
  'family.password': 'كلمة مرور حساب Keyrook',
  'family.unlock': 'فتح',
  'family.openPage': 'افتح صفحة العائلة',
  'family.keyChanged': 'تغيّر مفتاح {who} في {family}',
  'family.newSender': 'جاء مفتاح {family} من {who}، وهذا المتصفح لا يعرفه بعد',
  'family.keyChangedBody':
    'لا يأخذ Passhold شيئًا منهم حتى تقارنا رمزًا معًا. اتصل بهم أو قابلهم: يختارون مقارنة الرموز بجانب اسمك في صفحة “Family” على account.keyrook.com.',
  'family.showCode': 'اعرض الرمز',
  'family.codeIs': 'رمزك',
  'family.match': 'الرموز متطابقة',
  'family.differ': 'الرموز مختلفة',
  'family.differed':
    'عندها لا تثق بذلك. أبلغ أحد منظِّمي عائلتك؛ لن يأخذ Passhold شيئًا منهم في الأثناء.',
  'family.someone': 'شخص ما',
  'family.waiting': 'ينتظر أحد منظِّمي {family} تأكيدك. ما تشاركه يُفتح هنا بمجرد أن يفعل.',
  'family.rotate':
    'غادر شخص ما {family}، ولم يغيّر Passhold كل مفاتيحه بعد: ما يُغيَّر في خزائنها المشتركة ينتظر على هذا المتصفح. إذا استمر ذلك، فغيّرها من صفحة “Family”.',
  'family.rotateCompare':
    'غادر شخص ما {family}. سيعطي Passhold الجميع مفاتيح جديدة بعد أن تقارن الرمز أعلاه؛ حتى ذلك الحين، ينتظر ما يُغيَّر في خزائنها المشتركة على هذا المتصفح.',
  'family.rotateWait':
    'غادر شخص ما {family}. ما تغيّره في خزائنها المشتركة ينتظر على هذا المتصفح حتى يغيّر Passhold عند أحد المنظِّمين مفاتيحها، وهو يفعل ذلك أثناء المزامنة، حتى لا يستطيع من غادر قراءته.',
  'family.left': 'لم يعد {who} في {family}',
  'family.leftBody':
    'لا يستطيع Passhold معرفة سبب المغادرة. إن لم تكن تتوقع هذا، فاسأل هذا الشخص أو أحد منظِّمي عائلتك.',
  'family.title': 'العائلة',
  'family.description':
    'من في عائلتك، والخزائن التي تشاركها. تُدار العائلة في صفحة “Family” على account.keyrook.com: الدعوة، وإزالة شخص، وتغيير مفاتيحها.',
  'family.none':
    'هذا الحساب ليس في أي عائلة. تُنشأ العائلات في صفحة “Family” على account.keyrook.com.',
  'family.youOrganise': 'أنت أحد منظِّميها.',
  'family.youMember': 'أنت عضو فيها.',
  'family.you': '(أنت)',
  'family.organiser': 'منظِّم',
  'family.notCompared': 'أُضيف دون مقارنة الرموز',
  'family.keyNew': 'تغيّر مفتاحهم: لا يُؤخذ شيء منهم حتى تقارن رمزًا',
  'family.membersLater': 'يظهر هنا من فيها بمجرد أن تُفتح على هذا المتصفح.',
  'family.sharedVaults': 'الخزائن المشتركة',
  'family.vaultWaits': 'ما يُغيَّر فيها ينتظر حتى يغيّر أحد المنظِّمين مفتاحها',

  // Cards, addresses and notes
  'wallet.updated': 'عُدّل في {date}',
  'wallet.copyField': 'نسخ {field}',
  'card.untitled': 'بطاقة',
  'card.newTitle': 'بطاقة جديدة',
  'card.editTitle': 'تعديل البطاقة',
  'card.titleHint': 'إن تُرك فارغًا، تُسمّى البطاقة باسم شبكتها وآخر أربعة أرقام منها.',
  'card.number': 'رقم البطاقة',
  'card.numberCheck': 'هذا الرقم غير صحيح: تحقّق من كل رقم.',
  'card.holder': 'الاسم على البطاقة',
  'card.expiry': 'تنتهي صلاحيتها في',
  'card.month': 'الشهر',
  'card.year': 'السنة',
  'card.code': 'رمز الأمان',
  'card.empty': 'أعطها رقم بطاقة أو اسمًا.',
  'card.expired': 'انتهت صلاحية هذه البطاقة.',
  'card.expiredOn': 'انتهت في {expiry}',
  'card.copyNumber': 'نسخ رقم البطاقة',
  'card.copyExpiry': 'نسخ تاريخ الانتهاء',
  'address.untitled': 'عنوان',
  'address.newTitle': 'عنوان جديد',
  'address.editTitle': 'تعديل العنوان',
  'address.titleHint': 'المنزل، العمل… إن تُرك فارغًا، يُسمّى باسم الشخص الوارد فيه.',
  'address.name': 'الاسم الكامل',
  'address.organization': 'الشركة',
  'address.street': 'عنوان الشارع',
  'address.city': 'المدينة',
  'address.region': 'الولاية أو المحافظة',
  'address.postalCode': 'الرمز البريدي',
  'address.country': 'الدولة',
  'address.chooseCountry': 'اختر دولة',
  'address.phone': 'الهاتف',
  'address.email': 'البريد الإلكتروني',
  'address.address': 'العنوان',
  'address.empty': 'أدخل اسمًا، أو جزءًا من العنوان.',
  'note.untitled': 'ملاحظة بلا عنوان',
  'note.newTitle': 'ملاحظة جديدة',
  'note.editTitle': 'تعديل الملاحظة',
  'note.title': 'العنوان',
  'note.text': 'ملاحظة',
  'note.empty': 'أعطها عنوانًا، أو اكتب شيئًا.',
  'note.edited': 'عُدّلت في {date}',

  // Pending save, in the popup
  'pending.saveTitle': 'أتحفظ تسجيل الدخول هذا؟',
  'pending.updateTitle': 'أتحدّث كلمة المرور؟',
  'pending.lockedTitle': 'أتحفظ تسجيل الدخول الذي استخدمته للتو؟',
  'pending.body': '{username} على {site}',
  'pending.bodyNoUser': 'كلمة مرور لـ {site}',
  'pending.save': 'حفظ',
  'pending.update': 'تحديث',
  'pending.never': 'أبدًا لهذا الموقع',

  // Item
  'item.username': 'اسم المستخدم',
  'item.password': 'كلمة المرور',
  'item.website': 'الموقع',
  'item.websites': 'المواقع',
  'item.notes': 'الملاحظات',
  'item.favorite': 'المفضلة',
  'item.unfavorite': 'إزالة من المفضلة',
  'item.addFavorite': 'إضافة إلى المفضلة',
  'item.trash': 'نقل إلى سلة المهملات',
  'item.updated': 'تغيّرت كلمة المرور في {date}',
  'item.history': 'كلمات المرور السابقة',
  'item.weak': 'كلمة المرور هذه ضعيفة: لن يستغرق تخمينها وقتًا طويلًا.',
  'item.reused': {
    one: 'تُستخدم كلمة المرور هذه أيضًا في تسجيل دخول آخر واحد. إذا سرّبها موقع واحد، يصبح الحسابان مكشوفين.',
    two: 'تُستخدم كلمة المرور هذه أيضًا في تسجيلي دخول آخرين. إذا سرّبها موقع واحد، تصبح الحسابات الثلاثة مكشوفة.',
    few: 'تُستخدم كلمة المرور هذه أيضًا في {count} تسجيلات دخول أخرى. إذا سرّبها موقع واحد، تصبح كلها مكشوفة.',
    many: 'تُستخدم كلمة المرور هذه أيضًا في {count} تسجيل دخول آخر. إذا سرّبها موقع واحد، تصبح كلها مكشوفة.',
    other: 'تُستخدم كلمة المرور هذه أيضًا في {count} من تسجيلات الدخول الأخرى. إذا سرّبها موقع واحد، تصبح كلها مكشوفة.',
  },
  'item.changePassword': 'غيّرها على الموقع',
  'item.openSite': 'افتح {site}',
  'item.passkey': 'مفتاح المرور',
  'item.passkeyBody': 'لـ {site}، حُفظ في {date}',

  // Edit
  'edit.newTitle': 'تسجيل دخول جديد',
  'edit.editTitle': 'تعديل تسجيل الدخول',
  'edit.title': 'الاسم',
  'edit.titleHint': 'إن تُرك فارغًا، يُسمّى باسم الموقع.',
  'edit.username': 'اسم المستخدم أو البريد الإلكتروني',
  'edit.password': 'كلمة المرور',
  'edit.generate': 'إنشاء',
  'edit.websites': 'المواقع',
  'edit.websitesHint': 'واحد في كل سطر. يعرض Passhold تسجيل الدخول هذا على هذه المواقع.',
  'edit.notes': 'الملاحظات',
  'edit.empty': 'أعطه اسمًا، أو اسم مستخدم، أو كلمة مرور.',

  // Fields of an item's own, and folders
  'fields.title': 'حقول مخصصة',
  'fields.add': 'إضافة حقل',
  'fields.name': 'اسم الحقل',
  'fields.value': 'القيمة',
  'fields.hidden': 'أخفِه مثل كلمة المرور',
  'fields.remove': 'احذف هذا الحقل',
  'fields.unnamed': 'حقل',
  'fields.copy': 'نسخ {name}',
  'folders.label': 'المجلد',
  'folders.placeholder': 'لا مجلد',
  'folders.choose': 'المجلدات الموجودة',
  'folders.hint': 'أبقِ الأشياء معًا – العمل، العائلة، البنك – واعرض مجلدًا واحدًا في كل مرة.',
  'folders.all': 'كل المجلدات',
  'folders.none': 'بلا مجلد',
  'folders.count': {
    one: 'عنصر واحد',
    two: 'عنصران',
    few: '{count} عناصر',
    many: '{count} عنصرًا',
    other: '{count} عنصر',
  },
  'folders.nothingHere': 'لا شيء من هذا النوع في هذا المجلد.',
  'folders.rename': 'إعادة التسمية',
  'folders.renameTo': 'اسم جديد للمجلد',
  'folders.remove': 'حذف المجلد',
  'folders.removeHint': 'ما فيه يبقى، بلا مجلد.',

  // Generator
  'generator.length': 'الطول',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'استبعد الأحرف المتشابهة (I l 1 O 0)',
  'generator.again': 'آخر',
  'generator.use': 'استخدم كلمة المرور هذه',
  'generator.bits': '{bits} بت',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold مُقفَل.',
  'menu.unlock': 'افتح قفل Passhold',
  'menu.unlockHint': 'انقر على Passhold في شريط الأدوات لفتح القفل، ثم عُد إلى هنا.',
  'menu.none': 'لا توجد بيانات دخول محفوظة لـ {site}.',
  'menu.uninitialized': 'أعدّ Passhold أولًا: انقر عليه في شريط الأدوات.',
  'menu.suggest': 'استخدم كلمة مرور قوية',
  'menu.suggestBody': 'كلمة مرور جديدة، تُملأ عنك. يعرض Passhold حفظها بمجرد إرسال النموذج.',
  'menu.fillFor': 'املأ على {site}',
  'menu.hidden': 'يغطي Passhold شيء في هذه الصفحة، لذلك لن يملأ.',
  'menu.passkey': 'مفتاح مرور · {username}',
  'menu.noCards': 'لا توجد بطاقات في Passhold بعد. أضف واحدة من Passhold في شريط الأدوات.',
  'menu.noAddresses': 'لا توجد عناوين في Passhold بعد. أضف واحدًا من Passhold في شريط الأدوات.',
  'menu.cardInsecure':
    'هذه الصفحة غير آمنة (http عادي)، لذلك لن يملأ Passhold بطاقة هنا: قد يقرؤها أي أحد في الطريق.',

  // A website's passkey
  'passkey.saveTitle': 'أتحفظ مفتاح مرور لـ {site}؟',
  'passkey.save': 'حفظ مفتاح المرور',
  'passkey.saveElsewhere': 'احفظه في مكان آخر',
  'passkey.useElsewhere': 'استخدم مفتاح مرور من مكان آخر',
  'passkey.existsTitle': 'مفتاح المرور هذا موجود بالفعل في Passhold',
  'passkey.ok': 'حسنًا',
  'passkey.signInTitle': 'سجّل الدخول إلى {site}',
  'passkey.signInBody': 'بمفتاح مرور محفوظ في Passhold',
  'passkey.none': 'لا يوجد مفتاح مرور لـ {site} في Passhold.',
  'passkey.hidden': 'يغطي Passhold شيء في هذه الصفحة، لذلك لن يجيب.',

  // Save prompt on a page
  'prompt.save': 'أتحفظ تسجيل الدخول في Passhold؟',
  'prompt.update': 'أتحدّث كلمة المرور في Passhold؟',
  'prompt.saveButton': 'حفظ',
  'prompt.updateButton': 'تحديث',
  'prompt.never': 'أبدًا لهذا الموقع',
  'prompt.saved': 'تم الحفظ في Passhold.',
  'prompt.locked': 'انقر على Passhold في شريط الأدوات وافتح القفل – سيطلب منك الحفظ هناك.',
  'prompt.saveCard': 'أتحفظ البطاقة في Passhold؟',
  'prompt.updateCard': 'أتحدّث البطاقة في Passhold؟',
  'prompt.saveAddress': 'أتحفظ العنوان في Passhold؟',
  'prompt.saveCheckout': 'أتحفظ البطاقة والعنوان في Passhold؟',

  // Settings
  'settings.title': 'الإعدادات',
  'settings.cannotOpen': 'لا يُفتح على الإطلاق؟ أزِل الخزنة من هذا المتصفح',
  'settings.encryptedHere': 'مشفّرة على هذا الجهاز',
  'settings.source': 'الشيفرة المصدرية على GitHub',

  'nav.passwords': 'كلمات المرور',
  'nav.accountSync': 'الحساب والمزامنة',
  'nav.family': 'العائلة',
  'nav.account': 'حساب Keyrook',
  'nav.backup': 'النسخ الاحتياطي والاستيراد',
  'nav.security': 'الأمان',
  'nav.general': 'عام',
  'nav.needsAttention': 'يحتاج إلى انتباه',


  'account.description':
    'سجّل الدخول، وستتبعك بيانات دخولك إلى كل متصفح تسجّل فيه الدخول إلى Passhold. تُشفَّر أولًا على هذا الجهاز: لا يستطيع خادم Keyrook قراءتها، ولا معرفة المواقع التي تخصها.',
  'account.email': 'البريد الإلكتروني',
  'account.password': 'كلمة مرور حساب Keyrook',
  'account.signIn': 'تسجيل الدخول',
  'account.signingIn': 'جارٍ تسجيل الدخول…',
  'account.note':
    'الحساب نفسه المستخدم في Keyrook Authenticator. الحساب المُنشأ باستخدام Google أو GitHub يسجّل الدخول بزره الخاص.',
  'account.haveOne': 'لدي حساب',
  'account.create': 'إنشاء حساب',
  'account.sendCode': 'أرسل لي رمزًا بالبريد الإلكتروني',
  'account.createNote':
    'يرسل Keyrook رمزًا من ستة أرقام إلى بريدك الإلكتروني ليثبت أن العنوان لك. إذا كان للعنوان حساب بالفعل، فسيخبرك البريد بذلك بدلًا من ذلك: سجّل الدخول به.',
  'account.codeSent': 'الرمز في طريقه إلى {email}. صالح لخمس عشرة دقيقة.',
  'account.code': 'الرمز المكوّن من ستة أرقام',
  'account.newPassword': 'كلمة مرور حساب Keyrook',
  'account.passwordNote':
    'تفتح كلمة المرور هذه حسابك في Keyrook في أي متصفح، لـ Passhold وKeyrook Authenticator على حد سواء. لا يراها Keyrook أبدًا، ولا يستطيع إعادة تعيينها لك؛ مفتاح الاسترداد الذي ستحصل عليه بعد ذلك هو الطريقة لتعيين واحدة جديدة.',
  'account.createButton': 'إنشاء حساب',
  'account.creating': 'جارٍ الإنشاء…',
  'account.otherEmail': 'استخدم عنوانًا آخر',
  'account.signedInAs': 'مسجّل الدخول باسم {email}',
  'account.signedInAsNamed': 'مسجّل الدخول باسم {name} ({email})',
  'account.synced': 'تمت المزامنة في {date}',
  'account.notSynced': 'لم تتم المزامنة بعد',
  'account.syncNow': 'زامن الآن',

  // The account, at the foot of the popup
  'accountBar.synced': 'تمت المزامنة {time}',
  'accountBar.justNow': 'الآن',
  'accountBar.syncing': 'جارٍ المزامنة…',
  'accountBar.signedOut': 'تم تسجيل الخروج – سجّل الدخول مجددًا للمزامنة',
  'accountBar.startedOver': 'بدأ الحساب من جديد – سجّل الدخول مجددًا',
  'accountBar.removed': 'أُزيل من الحساب – سجّل الدخول مجددًا للمزامنة',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'أُزيل من حساب Keyrook الخاص بك',
  'removed.body':
    'في {date} أُزيل هذا المتصفح من حساب Keyrook الخاص بك، فأزال Passhold منه بيانات الدخول والبطاقات والعناوين والملاحظات الخاصة بالحساب وسجّل خروجه. ما أُضيف أو تغيّر هنا ولم يُرسَل أبدًا بقي كمحتوى خاص بهذا المتصفح. سجّل الدخول مجددًا لاستعادة الباقي.',

  // Passwords, in Settings
  'passwords.description':
    'كل بيانات دخول ومفتاح مرور وبطاقة وعنوان وملاحظة في Passhold. اختر أحدها لرؤيته، أو النسخ منه، أو تغييره.',
  'passwords.all': 'الكل',
  'passwords.attention': 'يحتاج إلى انتباه',
  'passwords.weak': 'ضعيفة',
  'passwords.reused': 'مُعاد الاستخدام',
  'account.syncDone': 'تمت المزامنة.',
  'account.removed': {
    one: 'أُزيل هنا عنصر واحد حُذف نهائيًا على جهاز آخر.',
    two: 'أُزيل هنا عنصران حُذفا نهائيًا على جهاز آخر.',
    few: 'أُزيلت هنا {count} عناصر حُذفت نهائيًا على جهاز آخر.',
    many: 'أُزيل هنا {count} عنصرًا حُذف نهائيًا على جهاز آخر.',
    other: 'أُزيل هنا {count} عنصر حُذف نهائيًا على جهاز آخر.',
  },
  'account.skipped': {
    one: 'سجلّ واحد لم يُفتح وتُرك دون مساس.',
    two: 'سجلّان لم يُفتحا وتُركا دون مساس.',
    few: '{count} سجلات لم تُفتح وتُركت دون مساس.',
    many: '{count} سجلًا لم يُفتح وتُرك دون مساس.',
    other: '{count} سجل لم يُفتح وتُرك دون مساس.',
  },
  'account.manage': 'إدارة حساب Keyrook الخاص بك',
  'account.manageBody':
    'غيّر كلمة المرور، أو أنشئ مفتاح استرداد جديدًا، أو ابدأ الحساب من جديد على account.keyrook.com – لـ Passhold وKeyrook Authenticator على حد سواء.',
  'account.manageBodyProvider':
    'أنشئ مفتاح استرداد جديدًا، أو ابدأ الحساب من جديد على account.keyrook.com – لـ Passhold وKeyrook Authenticator على حد سواء.',
  'account.manageOpen': 'فتح',
  'account.signOut': 'تسجيل الخروج',
  'account.signOutBody': 'يزيل كل بيانات الدخول من هذا المتصفح، بعد مزامنة أخيرة. سجّل الدخول مجددًا وستعود.',
  'account.signOutConfirm':
    'يزامن Passhold مرة أخرى، ثم يزيل الخزنة من هذا المتصفح. لا يُزال شيء إذا لم تصل أي بيانات دخول إلى حسابك.',
  'account.signOutButton': 'تسجيل الخروج والإزالة',
  'account.signedOutByServer': 'سجّل Keyrook خروج هذا المتصفح. سجّل الدخول مجددًا لمواصلة المزامنة.',
  'account.startedOver':
    'بدأ حساب Keyrook الخاص بك من جديد في {date}، لذلك سجّل Keyrook خروج هذا المتصفح. سجّل الدخول بكلمة المرور الجديدة: تُرفع بيانات الدخول هنا بالمفاتيح الجديدة للحساب.',
  'account.startedOverProvider':
    'بدأ حساب Keyrook الخاص بك من جديد في {date}، لذلك سجّل Keyrook خروج هذا المتصفح. سجّل الدخول باستخدام Google أو GitHub: تُرفع بيانات الدخول هنا بالمفاتيح الجديدة للحساب.',
  'account.forgot': 'نسيت كلمة المرور؟',
  'account.recoverBody':
    'يرسل Keyrook رمزًا إلى عنوان الحساب؛ ثم اكتبه، ومفتاح استرداد الحساب من الورقة التي حفظتها عند إنشاء الحساب، وكلمة مرور جديدة. كل متصفح أو تطبيق آخر مسجّل الدخول إلى الحساب سيطلب الكلمة الجديدة.',
  'account.recoveryKey': 'مفتاح استرداد الحساب',
  'account.recoverPassword': 'كلمة مرور الحساب الجديدة',
  'account.recoverButton': 'تعيين كلمة مرور جديدة',
  'account.recovering': 'جارٍ التعيين…',
  'account.backToSignIn': 'العودة إلى تسجيل الدخول',
  'startOver.link': 'فقدت مفتاح الاسترداد أيضًا؟ ابدأ الحساب من جديد',
  'startOver.title': 'ابدأ الحساب من جديد',
  'needsRoot.body':
    'إذا كان لديك مفتاح استرداد الحساب الذي أعطاك إياه Keyrook Authenticator، فاكتبه: عندها يفتح Passhold أيضًا. بدونه، ينشئ Passhold مفتاح استرداد جديدًا للحساب، يُعرض مرة واحدة، ويتوقف القديم عن العمل.',
  'needsRoot.sheet': 'مفتاح استرداد الحساب من Keyrook Authenticator (إن كان لديك)',
  'needsRoot.withSheet': 'استخدم هذا المفتاح',
  'needsRoot.newSheet': 'أنشئ مفتاح استرداد جديدًا',
  'startOver.body':
    'عندما لا يبقى شيء سوى عنوان البريد الإلكتروني، يمكن للحساب أن يبدأ من جديد بمفاتيح جديدة ومفتاح استرداد جديد. يسري ذلك بعد أسبوع من طلبك، وحتى ذلك الحين يستطيع أي متصفح ما زال مسجّل الدخول إلى الحساب أن يلغيه – فمن يملك بريدك الإلكتروني فقط لا يستطيع أخذه. يحتفظ Keyrook بكل ما كان في الحساب مشفّرًا لمدة 90 يومًا: كلمة المرور القديمة أو مفتاح الاسترداد القديم يعيدانه.',
  'startOver.button': 'ابدأ من جديد',
  'startOver.working': 'جارٍ البدء من جديد…',
  'startOver.kitBody':
    'مفتاح الاسترداد الجديد للحساب: يعمل بمجرد أن يبدأ الحساب من جديد. يعرضه Passhold الآن فقط، فاحتفظ به قبل أن تتابع.',
  'startOver.waitTitle': 'يبدأ حسابك من جديد في {date}',
  'startOver.waitBody':
    'حتى ذلك الحين لا يتغيّر شيء، ويستطيع أي متصفح ما زال مسجّل الدخول إلى الحساب إلغاءه. يرسل Keyrook إلى {email} الآن، ويوم قبله، وعند حدوثه.',
  'startOver.waitThen':
    'من ذلك الوقت، سجّل الدخول هنا بكلمة مرورك الجديدة. تُرفع بيانات الدخول في هذا المتصفح بالمفاتيح الجديدة للحساب، ويُحتفظ بما كان فيه من قبل لمدة 90 يومًا.',
  'startOver.waitThenProvider':
    'من ذلك الوقت، سجّل الدخول هنا باستخدام Google أو GitHub، كما كان من قبل. تُرفع بيانات الدخول في هذا المتصفح بالمفاتيح الجديدة للحساب، ويُحتفظ بما كان فيه من قبل لمدة 90 يومًا.',
  'startOver.understood': 'فهمت',
  'startOver.doneTitle': 'بدأ حسابك من جديد',
  'startOver.doneBody':
    'سجّل الدخول بكلمة مرورك الجديدة: تُرفع بيانات الدخول في هذا المتصفح بالمفاتيح الجديدة للحساب، ويُحتفظ بما كان فيه من قبل لمدة 90 يومًا.',
  'startOver.doneBodyProvider':
    'سجّل الدخول باستخدام Google أو GitHub كما كان من قبل: تُرفع بيانات الدخول في هذا المتصفح بالمفاتيح الجديدة للحساب، ويُحتفظ بما كان فيه من قبل لمدة 90 يومًا.',
  'startOverWait.title': 'يبدأ حساب Keyrook الخاص بك من جديد في {date}',
  'startOverWait.body':
    'طُلب ذلك بالرمز الذي أرسله إليك Keyrook بالبريد الإلكتروني، من جهاز يسمي نفسه “{device}”. إن لم تكن أنت من طلبه، فقد يستطيع أحد قراءة بريدك الإلكتروني: ألغِه الآن، ثم غيّر كلمة مرور بريدك الإلكتروني. إن كنت أنت من طلبه، فاتركه.',
  'startOverWait.bodyNoName':
    'طُلب ذلك بالرمز الذي أرسله إليك Keyrook بالبريد الإلكتروني. إن لم تكن أنت من طلبه، فقد يستطيع أحد قراءة بريدك الإلكتروني: ألغِه الآن، ثم غيّر كلمة مرور بريدك الإلكتروني. إن كنت أنت من طلبه، فاتركه.',
  'startOverWait.cancel': 'ألغِ بدء الحساب من جديد',
  'kept.title': {
    one: 'محفوظ من قبل بدء الحساب من جديد: عنصر واحد',
    two: 'محفوظ من قبل بدء الحساب من جديد: عنصران',
    few: 'محفوظ من قبل بدء الحساب من جديد: {count} عناصر',
    many: 'محفوظ من قبل بدء الحساب من جديد: {count} عنصرًا',
    other: 'محفوظ من قبل بدء الحساب من جديد: {count} عنصر',
  },
  'kept.body': 'حتى {date}. تعيدها إلى Passhold كلمة مرور الحساب القديمة أو مفتاح الاسترداد القديم.',
  'kept.open': 'استعادة',
  'kept.secret': 'كلمة مرور الحساب القديمة أو مفتاح الاسترداد القديم',
  'kept.done': {
    one: 'عنصر واحد استُعيد.',
    two: 'عنصران استُعيدا.',
    few: 'استُعيدت {count} عناصر.',
    many: 'استُعيد {count} عنصرًا.',
    other: 'استُعيد {count} عنصر.',
  },
  'kept.nothingNew': 'كل ما حُفظ موجود هنا بالفعل.',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': 'المتابعة باستخدام {provider}',
  'provider.passwordTitle': 'لهذا الحساب في Keyrook كلمة مرور',
  'provider.passwordBody':
    'سجّلت الدخول باستخدام {provider} باسم {email}. كلمة مرور الحساب هي ما يفتح Passhold هنا: اكتبها مرة واحدة.',
  'provider.openAccountPage': 'افتح account.keyrook.com',
  'secondStep.title': 'تسجيل الدخول بخطوتين',
  'secondStep.body':
    'أدخل الرمز المكوّن من 6 أرقام الذي يعرضه تطبيق المصادقة الخاص بك لـ Keyrook. فقدت التطبيق؟ اكتب مفتاح استرداد حسابك بدلًا من ذلك.',
  'secondStep.ownerBody':
    'يطلب حسابك خطوة ثانية لهذا أيضًا: الرمز الذي يعرضه تطبيق المصادقة، أو مفتاح استرداد حسابك.',
  'secondStep.field': 'الرمز، أو مفتاح الاسترداد',
  'secondStep.continue': 'متابعة',
  'secondStep.passkey': 'استخدم مفتاح مرور بدلًا من ذلك',
  'secondStep.nextBody':
    'تسليم الحساب مفتاحه يتطلب رمزًا أيضًا، وكل رمز يعمل مرة واحدة فقط. انتظر حتى يعرض تطبيق المصادقة رمزًا جديدًا، ثم أدخله – أو مفتاح استرداد حسابك.',
  'provider.or': 'أو',
  'provider.signedInWith': 'مسجّل الدخول باستخدام {provider} باسم {email}',
  'provider.signedInWithNamed': 'مسجّل الدخول باستخدام {provider} باسم {name} ({email})',
  'provider.newTitle': 'أنشئ حساب Keyrook الخاص بك',
  'provider.newBody':
    'أنت تسجّل الدخول باستخدام {provider} باسم {email}. ليس للحساب كلمة مرور: يسجّل {provider} دخولك. على حاسوب آخر، يسمح لك متصفح مسجّل الدخول بالفعل بالدخول – أو يفعل ذلك مفتاح الاسترداد الذي ستحصل عليه بعد ذلك.',
  'provider.joinTitle': 'اسمح لهذا المتصفح بالدخول',
  'provider.joinBody':
    '{email} مسجّل الدخول هنا، لكن المفتاح الذي يفتح بيانات دخولك موجود على حواسيبك الأخرى. افتح Passhold على أحدها – الإعدادات، ثم الحساب والمزامنة – واسمح لهذا المتصفح بالدخول.',
  'provider.waiting': 'في انتظار متصفح آخر…',
  'provider.compare': 'يعرض المتصفح الآخر رمزًا. اسمح له بالدخول هناك فقط إذا كان هذا المتصفح:',
  'provider.ended': 'انتهى ذلك الطلب قبل أن يسمح متصفح آخر لهذا بالدخول.',
  'provider.askAgain': 'اسأل مجددًا',
  'provider.useKit': 'استخدم مفتاح الاسترداد بدلًا من ذلك',
  'provider.useThisKey': 'استخدم هذا المفتاح',
  'provider.needsRoot':
    'أُنشئ {email} في Keyrook Authenticator قبل أن يملك كل تطبيق من تطبيقات Keyrook مفتاحه الخاص. يستطيع Passhold أن يمنحه مفتاحًا الآن، بمجرد أن تؤكد باستخدام {provider} مجددًا؛ لا يتغيّر شيء في Authenticator.',
  'provider.confirmWith': 'أكّد باستخدام {provider}',
  'provider.noKeyYet':
    'لم يسجّل Passhold الدخول إلى {email} في أي مكان بعد، لذلك لا يستطيع أي متصفح آخر أن يسمح لهذا المتصفح بالدخول. مفتاح استرداد الحساب يفتحه.',
  'passkey.onLabel': 'تُفتح الحواسيب الجديدة بمفتاح المرور الخاص بك',
  'passkey.offLabel': 'لا مفتاح مرور للحواسيب الجديدة',
  'passkey.body':
    'على حاسوب جديد: {provider}، ثم مفتاح المرور الخاص بك – وكل بيانات الدخول موجودة. يحتفظ به مدير كلمات المرور في Google، فيكون مفتاح المرور على كل Chrome تسجّل الدخول إليه.',
  'passkey.bodyEdge':
    'على حاسوب جديد: {provider}، ثم مفتاح المرور الخاص بك – وكل بيانات الدخول موجودة. عند حفظه في المكان الذي يتزامن فيه، يكون مفتاح المرور على أجهزتك الأخرى أيضًا.',
  'passkey.turnOn': 'تشغيل',
  'passkey.turnOff': 'إيقاف',
  'passkey.joinTitle': 'افتح بمفتاح المرور الخاص بك',
  'passkey.joinBody': 'لدى {email} مفتاح مرور للحواسيب الجديدة. أكّد به، فتُحمَّل بيانات دخولك.',
  'passkey.use': 'استخدم مفتاح المرور',
  'passkey.otherWays': 'طرق أخرى للدخول',
  'pairing.asking': 'يطلب {device} الدخول إلى حسابك.',
  'pairing.start': 'السماح بالدخول…',
  'pairing.notMe': 'ليس أنا',
  'pairing.compare': 'اسمح له بالدخول فقط إذا كان المتصفح الجديد يعرض هذا الرمز نفسه:',
  'pairing.match': 'الرموز متطابقة – اسمح بالدخول',
  'pairing.differ': 'الرموز مختلفة',

  'accountKit.title': 'احفظ مفتاح استرداد حسابك',
  'accountKit.body':
    'إذا نسيت كلمة مرور حساب Keyrook الخاص بك، فهذا المفتاح يعيّن واحدة جديدة – لـ Passhold وKeyrook Authenticator على حد سواء. لا يرى Keyrook كلمة مرورك أبدًا، لذلك هذه هي الطريقة الوحيدة. يمكنك رؤيته مجددًا في الإعدادات؛ احتفظ به في مكان آخر أيضًا.',
  'accountKit.fileTitle': 'مفتاح استرداد حساب Keyrook',
  'accountKit.fileBody':
    'إذا نسيت كلمة مرور حساب Keyrook الخاص بك، فهذا المفتاح يعيّن واحدة جديدة: في Passhold، الإعدادات ← الحساب والمزامنة ← “نسيت كلمة المرور؟”. أي شخص يملكه وعنوان بريدك الإلكتروني يستطيع فعل الشيء نفسه، لذا احتفظ به في أمان وليس على هذا الحاسوب.',
  'accountKit.bodyNoPassword':
    'ليس لحسابك كلمة مرور: متصفح مسجّل الدخول بالفعل يسمح بدخول جديد. إذا لم يبقَ أي متصفح، فهذا المفتاح يفعل ذلك – لـ Passhold وKeyrook Authenticator على حد سواء. يمكنك رؤيته مجددًا في الإعدادات؛ احتفظ به في مكان آخر أيضًا.',
  'accountKit.fileBodyNoPassword':
    'إذا لم يبقَ أي حاسوب مسجّل الدخول إلى حساب Keyrook الخاص بك، فهذا المفتاح يسمح بدخول جديد: سجّل الدخول باستخدام Google أو GitHub، ثم اختر “استخدام مفتاح الاسترداد بدلًا من ذلك”. أي شخص يملكه ويستطيع أيضًا تسجيل الدخول باسمك يستطيع فعل الشيء نفسه، لذا احتفظ به في أمان وليس على هذا الحاسوب.',
  'accountKit.whenTitleNoPassword': 'عندما لا يبقى حاسوب مسجّل الدخول',
  'accountKit.inPassholdNoPassword':
    'في Passhold: سجّل الدخول باستخدام Google أو GitHub، واختر “استخدام مفتاح الاسترداد بدلًا من ذلك”، واكتب هذا المفتاح.',
  'accountKit.keepNoPassword':
    'احتفظ بهذه الورقة في مكان آمن، بعيدًا عن حاسوبك. ومعها، يستطيع من يستطيع تسجيل الدخول إلى حسابك في Google أو GitHub أن يفتح حساب Keyrook الخاص بك.',
  'accountKit.rowBodyNoPassword': 'يسمح بدخول حاسوب جديد عندما لا يبقى غيره ليفعل ذلك.',
  'accountKit.sheetTitle': 'ورقة استرداد حساب Keyrook',
  'accountKit.whenTitle': 'عندما تُنسى كلمة مرور الحساب',
  'accountKit.inPasshold':
    'في Passhold: الإعدادات ← الحساب والمزامنة ← “نسيت كلمة المرور؟”، ثم عنوان بريدك الإلكتروني، والرمز الذي يرسله Keyrook بالبريد الإلكتروني، ومفتاح الاسترداد هذا، وكلمة مرور جديدة.',
  'accountKit.inAuthenticator':
    'يقبل Keyrook Authenticator المفتاح نفسه: “نسيت كلمة المرور؟” حيث يطلب منك تسجيل الدخول.',
  'accountKit.keep':
    'احتفظ بهذه الورقة في مكان آمن، بعيدًا عن حاسوبك. من يملكها وصندوق بريدك الإلكتروني يستطيع تعيين كلمة مرور جديدة للحساب.',
  'accountKit.pending': 'لم يُحفظ مفتاح استرداد الحساب بعد',
  'accountKit.keptState': 'تم حفظ مفتاح استرداد الحساب',
  'accountKit.elsewhere': 'مفتاح استرداد الحساب أُنشئ في مكان آخر',
  'accountKit.none': 'لا يوجد مفتاح استرداد للحساب',
  'accountKit.rowBody': 'يعيّن كلمة مرور جديدة للحساب إذا نُسيت. الجديد يوقف القديم عن العمل، في كل التطبيقات.',
  'accountKit.elsewhereBody':
    'أُنشئ على account.keyrook.com، أو في Keyrook Authenticator، أو في متصفح آخر: مفتاحه موجود على الورقة المحفوظة حينها. إنشاء واحد هنا يوقف ذاك عن العمل.',
  'accountKit.noneBody':
    'بدونه، لا يمكن إعادة تعيين كلمة مرور منسية للحساب، ولا يمكن فتح ما يُحفظ على Keyrook. تبقى بيانات الدخول في هذا المتصفح في كل الأحوال.',
  'accountKit.make': 'أنشئ واحدًا',
  'accountKit.apart':
    'احتفظ به بعيدًا عن بريدك الإلكتروني: من يملك هذا المفتاح ويستطيع قراءة بريدك يستطيع تعيين كلمة مرور جديدة وفتح بيانات دخولك. لا ترسله إلى نفسك بالبريد، ولا تحفظه في خدمة التخزين السحابي لذلك البريد.',
  'accountKit.apartNoPassword':
    'احتفظ به بعيدًا عن حساب Google أو GitHub الذي تسجّل الدخول به: من يملك هذا المفتاح ويستطيع تسجيل الدخول باسمك هناك يستطيع فتح بيانات دخولك. لا ترسله إلى نفسك بالبريد، ولا تحفظه في التخزين السحابي لذلك الحساب.',
  'accountKit.unchecked': 'لم يُتحقَّق من مفتاح استرداد الحساب بعد',
  'accountKit.uncheckedBody':
    'لحسابك مفتاح استرداد، أُنشئ على account.keyrook.com أو في تطبيق آخر. اكتبه مرة واحدة: يتحقق Passhold من أنه يفتح حسابك، ويحتفظ به ليعرضه لك مرة أخرى.',
  'accountKit.typeIt': 'اكتبه',
  'accountKit.checked': 'إنه يفتح حسابك. يحتفظ به Passhold الآن ليعرضه لك هنا مرة أخرى.',
  'accountKit.draftBody':
    'مفتاح استرداد حسابك الجديد. لا يعمل بعد: بعد أن تحفظه وتكتبه مرة أخرى، تعيّنه كلمة مرور حسابك، ويتوقف القديم عن العمل.',
  'accountKit.setTitle': 'عيّن مفتاح استرداد جديدًا',
  'accountKit.setBody':
    'اكتب كلمة مرور حساب Keyrook الخاص بك. حتى ذلك الحين يعمل مفتاح الاسترداد القديم، ولا يعمل هذا.',
  'accountKit.set': 'تعيين',

  'checkup.clear': 'لا شيء للإصلاح',
  'checkup.clearBody': 'لا كلمات مرور ضعيفة أو مُعاد استخدامها، ونسختك الاحتياطية محدّثة.',
  'checkup.issues': {
    one: 'شيء واحد للنظر فيه',
    two: 'شيئان للنظر فيهما',
    few: '{count} أشياء للنظر فيها',
    many: '{count} شيئًا للنظر فيه',
    other: '{count} شيء للنظر فيه',
  },
  'checkup.issuesBody': 'يوضّح كل بند أدناه لماذا يهم، وكيف تصلحه.',
  'checkup.backup': 'النسخ الاحتياطي',
  'checkup.access': 'الدخول',
  'checkup.recoveryPending':
    'لم يُؤكَّد أبدًا أن مفتاح الاسترداد المُنشأ لهذه الخزنة قد حُفظ، وهو الطريقة الوحيدة للدخول إذا توقف {method} عن العمل. أنشئ واحدًا جديدًا واحتفظ به.',
  'checkup.deviceMissing':
    'هذه الخزنة ليس لها كلمة مرور رئيسية، لذلك دون {method} هنا، يطلب كل فتح للقفل مفتاح الاسترداد.',
  'checkup.lastBackup': 'آخر نسخة احتياطية في {date}',
  'checkup.backupNever':
    'إذا ضاع هذا المتصفح، تضيع بيانات دخولك معه. النسخة الاحتياطية ملف واحد مشفّر تحتفظ به في مكان آخر.',
  'checkup.backupDue': 'تغيّرت خزنتك منذ ذلك الحين. أنشئ نسخة جديدة لتشمل كل شيء.',
  'checkup.backUp': 'انسخ احتياطيًا الآن',
  'checkup.weak': {
    one: 'كلمة مرور ضعيفة واحدة',
    two: 'كلمتا مرور ضعيفتان',
    few: '{count} كلمات مرور ضعيفة',
    many: '{count} كلمة مرور ضعيفة',
    other: '{count} كلمة مرور ضعيفة',
  },
  'checkup.weakBody':
    'قصيرة أو بسيطة بما يكفي لتخمينها. غيّر كل واحدة في موقعها؛ يقترح Passhold كلمة قوية في النموذج ويعرض حفظها.',
  'checkup.weakNone': 'لا شيء.',
  'checkup.reused': {
    one: 'كلمة مرور واحدة مستخدمة أكثر من مرة',
    two: 'كلمتا مرور مستخدمتان أكثر من مرة',
    few: '{count} كلمات مرور مستخدمة أكثر من مرة',
    many: '{count} كلمة مرور مستخدمة أكثر من مرة',
    other: '{count} كلمة مرور مستخدمة أكثر من مرة',
  },
  'checkup.reusedBody':
    'عندما يسرّب موقع كلمة مرور، يجرّبها الناس في كل مكان آخر. أعطِ كل تسجيل دخول كلمة مرور خاصة به.',
  'checkup.reusedNone': 'لا شيء: لكل تسجيل دخول كلمة مروره الخاصة.',
  'checkup.sharedBy': {
    one: 'مشتركة مع تسجيل دخول واحد',
    two: 'مشتركة مع تسجيلي دخول',
    few: 'مشتركة مع {count} تسجيلات دخول',
    many: 'مشتركة مع {count} تسجيل دخول',
    other: 'مشتركة مع {count} تسجيل دخول',
  },
  'checkup.change': 'تغيير',
  'checkup.limits':
    'لا يتحقق Passhold مما إذا ظهرت كلمة مرور في تسريب بيانات: هذا يتطلب سؤال خادم، ولا يسأل Passhold أي خادم. ولا يزعجك بشأن كلمات المرور القديمة – كلمة المرور القوية والفريدة لا تبلى.',

  'backup.description': 'احتفظ بنسخة مشفّرة، أو استعد نسخة، أو انقل بيانات الدخول إلى الداخل والخارج.',
  'backup.backupRow': 'خزنتك كاملة في ملف واحد مشفّر، تحت كلمة مرورك الرئيسية.',
  'backup.restoreRow': 'أضف بيانات الدخول الموجودة في ملف نسخة احتياطية إلى هذه الخزنة.',
  'backup.importRow': 'من متصفح أو مدير كلمات مرور آخر، كملف CSV، أو بصيغة JSON من Bitwarden.',
  'backup.exportRow': 'ملف CSV تستطيع التطبيقات الأخرى قراءته. غير مشفّر.',

  'security.description': 'كيف يُفتح Passhold، ومتى يُغلَق من جديد.',
  'security.locking': 'القفل',
  'security.opensTitle': 'كيف يُفتح Passhold',
  'security.opensBody': 'لا كلمة مرور رئيسية: يفتحه {method}، ومفتاح الاسترداد عندما يعجز {method} عن ذلك.',
  'security.setPassword': 'استخدم كلمة مرور رئيسية بدلًا من ذلك',
  'security.setPasswordBody': 'عندها يُفتح Passhold بكلمة مرور تختارها، ويتوقف مفتاح الاسترداد عن فتحه.',
  'security.setPasswordOpen': 'عيّن واحدة',
  'security.setPasswordSave': 'استخدم كلمة المرور هذه',
  'security.dropPassword': 'توقّف عن استخدام كلمة مرور رئيسية',
  'security.dropPasswordBody':
    'افتح باستخدام {method} وحده، واحتفظ بمفتاح استرداد لليوم الذي لا يعمل فيه. تتوقف كلمة المرور الرئيسية عن فتح الخزنة.',
  'security.dropPasswordOpen': 'بدّل',
  'security.dropPasswordSave': 'بدّل واعرض مفتاح الاسترداد',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'قفل شاشة جهازك',
  'device.method.passkey': 'مفتاح المرور الخاص بك',
  'device.title': 'افتح القفل باستخدام {method}',
  'device.description': 'أسرع طريقة للدخول، وتظل تعمل بعد إعادة تشغيل المتصفح.',
  'device.on': 'تشغيل',
  'device.off': 'إيقاف',
  'device.body':
    'تفتح بصمتك أو وجهك Passhold – أو، في معظم الحواسيب، كلمة مرور الحاسوب نفسه. لذا فمن يستطيع فتح قفل هذا الحاسوب يستطيع فتح Passhold. ما يفتحه يبقى على هذا الحاسوب، لا فائدة منه دونه.',
  'device.whereMac':
    'عندما يسألك Chrome أين تحفظ مفتاح المرور، اختر “مدير كلمات المرور في Google”. لا يستطيع مفتاح مرور في ملف تعريف Chrome الخاص بك فتح Passhold، ولا يستطيع سلسلة مفاتيح iCloud على كل جهاز Mac ذلك.',
  'device.whereMacEdge':
    'عندما يسألك Edge أين تحفظ مفتاح المرور، اختر مكانًا يحفظه على أجهزتك الأخرى أيضًا. ليس كل مكان قادرًا على فتح Passhold: إذا لم يكن المكان الذي تختاره قادرًا على ذلك، سيخبرك Passhold بذلك، ولن يتغيّر شيء.',
  'device.unavailable': 'غير متاح هنا',
  'device.unavailableBody':
    'لم يجد هذا المتصفح بصمة أو وجهًا أو قفل شاشة يستطيع Passhold استخدامه. يعمل رمز PIN في كل مكان.',
  'device.unavailableRecovery':
    'لم يجد هذا المتصفح بصمة أو وجهًا أو قفل شاشة يستطيع Passhold استخدامه، لذلك تُفتح هذه الخزنة هنا بمفتاح الاسترداد الخاص بها. عيّن كلمة مرور رئيسية إن كنت تفضل كتابتها.',
  'device.opensWith': 'يفتح Passhold باستخدام {method}',
  'device.notHere': '{method} غير معدّ في هذا المتصفح',
  'device.isTheWayIn':
    'بدون كلمة مرور رئيسية، هكذا يُفتح Passhold. لإيقاف ذلك، عيّن كلمة مرور رئيسية أولًا.',
  'device.setUpHere': 'حتى يُعدّ {method} هنا، يطلب كل فتح للقفل مفتاح الاسترداد.',
  'device.setUp': 'إعداد',
  'device.turnOff': 'إيقاف',
  'device.save': 'إعداد {method}',
  'keys.title': 'افتح القفل بمفتاح أمان',
  'keys.description': 'مفتاح USB تُوصله: طريقة إضافية للدخول، وتستمر في العمل بعد إعادة تشغيل المتصفح.',
  'keys.method': 'مفتاح الأمان الخاص بك',
  'keys.on': {
    one: 'مفتاح واحد مُعدّ',
    two: 'مفتاحان مُعدّان',
    few: '{count} مفاتيح مُعدّة',
    many: '{count} مفتاحًا مُعدًّا',
    other: '{count} مفتاح مُعدّ',
  },
  'keys.off': 'لا مفتاح مُعدّ',
  'keys.body':
    'وصّل المفتاح، واكتب رمز PIN الخاص به ولامسه، فيُفتح Passhold – على هذا الحاسوب فقط. من يملك المفتاح ويعرف رمزه يستطيع فتح Passhold هنا، لذا احتفظ به كما تحتفظ بمفتاح منزلك. إذا ضاع، فأزله من هنا: طرقك الأخرى للدخول ما زالت تعمل.',
  'keys.add': 'أضف مفتاحًا',
  'keys.save': 'أضف هذا المفتاح',
  'keys.one': 'مفتاح أمان',
  'keys.added': 'أُضيف في {date}',
  'keys.remove': 'إزالة',
  'pin.title': 'افتح القفل برمز PIN',
  'pinOffer.title': 'افتح Passhold بشكل أسرع برمز PIN',
  'pinOffer.body':
    'اكتب بضعة أرقام بدلًا من كلمة مرورك في كل مرة يُقفَل فيها Passhold، حتى يُغلق المتصفح. بعد تشغيل المتصفح من جديد، كلمة مرورك مرة واحدة.',
  'pinOffer.later': 'يمكنك إعداده أو إيقافه في أي وقت من الإعدادات، ثم الأمان.',
  'pin.description': 'للمرات الكثيرة في اليوم التي يُقفَل فيها Passhold وأنت على المتصفح نفسه.',
  'pin.on': 'تشغيل',
  'pin.off': 'إيقاف',
  'pin.bodyRecovery':
    'يعمل فقط طالما يبقى المتصفح مفتوحًا، وبخمس محاولات خاطئة فقط: بعد ذلك، أو بعد إعادة التشغيل، يلزم الجهاز أو مفتاح الاسترداد. لا يُحفظ على القرص أي شيء يفتحه رمز PIN.',
  'pin.body':
    'يعمل فقط طالما يبقى المتصفح مفتوحًا، وبخمس محاولات خاطئة فقط: بعد ذلك، أو بعد إعادة التشغيل، تلزم كلمة المرور الرئيسية. لا يُحفظ على القرص أي شيء يفتحه رمز PIN.',
  'pin.setUp': 'إعداد رمز PIN',
  'pin.change': 'تغيير',
  'pin.turnOff': 'إيقاف',
  'pin.new': 'رمز PIN، من 6 إلى 12 رقمًا',
  'pin.again': 'أعد كتابته',
  'pin.save': 'حفظ رمز PIN',

  'general.description': 'كيف يتصرف Passhold في المواقع، وكيف يبدو.',
  'general.filling': 'الملء والحفظ',
  'general.appearance': 'اللغة والمظهر',
  'settings.autoSuggest': 'أظهر الاقتراحات عند النقر على حقل تسجيل الدخول أو البطاقة أو العنوان',
  'settings.autoSuggestBody':
    'بيانات دخولك للموقع، وكلمة مرور قوية في نموذج التسجيل، وبطاقاتك وعناوينك عند الدفع. لا يُملأ شيء حتى تختاره.',

  'trash.description': 'تنتظر هنا بيانات الدخول والبطاقات والعناوين والملاحظات حتى تستعيدها أو تحذفها نهائيًا.',
  'trash.sharedDescription':
    'مشتركة مع العائلة: يستطيع أي شخص فيها استعادة هذه. عند حذفها نهائيًا، تختفي للجميع.',
  'trash.sharedMember':
    'مشتركة مع العائلة: يمكنك استعادة هذه. لا يحذفها نهائيًا إلا أحد منظِّمي العائلة.',
  'settings.autoLock': 'القفل بعد',
  'settings.autoLock.never': 'فقط عند إغلاق المتصفح',
  'settings.autoLock.minutes': {
    one: 'دقيقة واحدة',
    two: 'دقيقتان',
    few: '{count} دقائق',
    many: '{count} دقيقة',
    other: '{count} دقيقة',
  },
  'settings.autoLock.hours': {
    one: 'ساعة واحدة',
    two: 'ساعتان',
    few: '{count} ساعات',
    many: '{count} ساعة',
    other: '{count} ساعة',
  },
  'settings.lockWithSystem': 'القفل عندما يُقفل الحاسوب أو يدخل في وضع السكون',
  'settings.clipboard': 'مسح كلمات المرور المنسوخة بعد',
  'settings.clipboard.never': 'أبدًا',
  'settings.clipboard.seconds': {
    one: 'ثانية واحدة',
    two: 'ثانيتان',
    few: '{count} ثوانٍ',
    many: '{count} ثانية',
    other: '{count} ثانية',
  },
  'settings.clipboard.minutes': {
    one: 'دقيقة واحدة',
    two: 'دقيقتان',
    few: '{count} دقائق',
    many: '{count} دقيقة',
    other: '{count} دقيقة',
  },
  'settings.inlineButton': 'أظهر زر Passhold في حقول تسجيل الدخول والبطاقات والعناوين',
  'settings.offerToSave': 'اعرض حفظ بيانات الدخول عند تسجيل الدخول',
  'settings.offerToSaveCards': 'اعرض حفظ البطاقات والعناوين عند الدفع',
  'settings.offerToSaveCardsBody':
    'بطاقة فقط من صفحة آمنة (https)، وفقط بطاقة يُطابق رقمها الخوارزمية الصحيحة. تُعرض بآخر أربعة أرقام منها، لا برقمها ولا برمزها أبدًا.',
  'settings.passkeys': 'حفظ مفاتيح المرور واستخدامها',
  'settings.passkeysBody':
    'عندما يعرض موقع مفتاح مرور، يحتفظ به Passhold مع بيانات دخولك ويسجّل دخولك به. عند الإيقاف، تُترك مفاتيح المرور للمتصفح.',
  'settings.language': 'اللغة',
  'settings.language.auto': 'مثل المتصفح',
  'settings.theme': 'المظهر',
  'settings.theme.system': 'مثل النظام',
  'settings.theme.light': 'فاتح',
  'settings.theme.dark': 'داكن',

  'settings.security': 'كلمة المرور الرئيسية',
  'settings.securityBody': 'عند تغييرها يُعاد قفل مفتاح خزنتك؛ تبقى بيانات دخولك كما هي.',
  'settings.current': 'كلمة المرور الرئيسية الحالية',
  'settings.new': 'كلمة المرور الرئيسية الجديدة',
  'settings.confirm': 'أعد كتابة الجديدة',
  'settings.change': 'تغيير كلمة المرور الرئيسية',
  'settings.changeOpen': 'تغيير',
  'settings.changed': 'تم تغيير كلمة المرور الرئيسية.',

  'settings.backup': 'نسخ احتياطي',
  'settings.backupBody':
    'خزنتك كاملة في ملف واحد مشفّر. احتفظ به في مكان غير هذا الحاسوب – قرص USB، أو خدمة التخزين السحابي – حتى لا يكلفك فقدان هذا المتصفح بيانات دخولك. لا يُفتح إلا بكلمة المرور الرئيسية التي كانت لديك عند إنشائه.',
  'settings.backupBodyRecovery':
    'خزنتك كاملة في ملف واحد مشفّر. احتفظ به في مكان غير هذا الحاسوب – قرص USB، أو خدمة التخزين السحابي – حتى لا يكلفك فقدان هذا المتصفح بيانات دخولك. يُفتح بمفتاح الاسترداد الخاص بك.',
  'settings.backupLast': 'آخر نسخة احتياطية: {date}',
  'settings.backupNever': 'لا توجد نسخة احتياطية بعد.',
  'settings.backupButton': 'تنزيل نسخة احتياطية',
  'settings.backupDone': 'حُفظ في التنزيلات. انقله الآن إلى مكان غير هذا الحاسوب.',

  'settings.restoreBackup': 'الاستعادة من نسخة احتياطية',
  'settings.restoreBodyNew':
    'لا توجد خزنة في هذا المتصفح بعد. استرجع خزنتك من ملف نسخة احتياطية – ستُفتح بكلمة المرور الرئيسية التي أُنشئت بها النسخة – أو أنشئ واحدة جديدة من زر Passhold في شريط الأدوات.',
  'settings.restoreBodyMerge':
    'يضيف إلى هذه الخزنة ما تحتويه النسخة الاحتياطية. لا يُحذف هنا شيء: إذا كان لدى الاثنين تسجيل الدخول نفسه، تُحفظ التعديلات الأحدث، وتنتقل كلمة المرور الأخرى إلى سجلها.',
  'settings.restoreChoose': 'اختر ملف النسخة الاحتياطية',
  'settings.restoreMade': 'أُنشئت النسخة الاحتياطية في {date}',
  'settings.restorePassword': 'كلمة المرور الرئيسية للنسخة الاحتياطية',
  'settings.restoreRecoveryKey': 'مفتاح الاسترداد للنسخة الاحتياطية',
  'settings.restoreButton': 'استعادة',
  'settings.restoreNew': {
    one: 'استُعيدت الخزنة، وفيها عنصر واحد.',
    two: 'استُعيدت الخزنة، وفيها عنصران.',
    few: 'استُعيدت الخزنة، وفيها {count} عناصر.',
    many: 'استُعيدت الخزنة، وفيها {count} عنصرًا.',
    other: 'استُعيدت الخزنة، وفيها {count} عنصر.',
  },
  'settings.restoreAdded': {
    one: 'أُضيف عنصر واحد من النسخة الاحتياطية.',
    two: 'أُضيف عنصران من النسخة الاحتياطية.',
    few: 'أُضيفت {count} عناصر من النسخة الاحتياطية.',
    many: 'أُضيف {count} عنصرًا من النسخة الاحتياطية.',
    other: 'أُضيف {count} عنصر من النسخة الاحتياطية.',
  },
  'settings.restoreUpdated': {
    one: 'كان لعنصر واحد تعديل أحدث في النسخة الاحتياطية.',
    two: 'كان لعنصرين تعديل أحدث في النسخة الاحتياطية.',
    few: 'كان لـ{count} عناصر تعديل أحدث في النسخة الاحتياطية.',
    many: 'كان لـ{count} عنصرًا تعديل أحدث في النسخة الاحتياطية.',
    other: 'كان لـ{count} عنصر تعديل أحدث في النسخة الاحتياطية.',
  },
  'settings.restoreNothing': 'كل ما في النسخة الاحتياطية موجود بالفعل في هذه الخزنة.',

  'settings.import': 'استيراد',
  'settings.importBody':
    'استورد كلمات المرور من Chrome أو Edge أو Firefox أو Safari أو Apple Passwords أو Bitwarden أو 1Password أو LastPass أو KeePass أو Dashlane أو Proton Pass أو NordPass: صدّرها من هناك كملف CSV، ثم اختره هنا. تأتي البطاقات والعناوين والملاحظات الموجودة في الملف أيضًا. من Bitwarden، صدّر بصيغة JSON (غير مشفّرة): ملف CSV الخاص به لا يتضمن البطاقات والهويات ومفاتيح المرور. يضع Dashlane هذه في ملفات خاصة بها: اختر كل ملف تباعًا.',
  'settings.importChoose': 'اختر ملفًا',
  'settings.importFound': 'تم العثور على {what} للاستيراد.',
  'settings.importLogins': {
    one: 'تسجيل دخول واحد',
    two: 'تسجيلا دخول',
    few: '{count} تسجيلات دخول',
    many: '{count} تسجيل دخول',
    other: '{count} تسجيل دخول',
  },
  'settings.importPasskeys': {
    one: 'مفتاح مرور واحد',
    two: 'مفتاحا مرور',
    few: '{count} مفاتيح مرور',
    many: '{count} مفتاح مرور',
    other: '{count} مفتاح مرور',
  },
  'settings.importCards': {
    one: 'بطاقة واحدة',
    two: 'بطاقتان',
    few: '{count} بطاقات',
    many: '{count} بطاقة',
    other: '{count} بطاقة',
  },
  'settings.importAddresses': {
    one: 'عنوان واحد',
    two: 'عنوانان',
    few: '{count} عناوين',
    many: '{count} عنوانًا',
    other: '{count} عنوان',
  },
  'settings.importNotes': {
    one: 'ملاحظة واحدة',
    two: 'ملاحظتان',
    few: '{count} ملاحظات',
    many: '{count} ملاحظة',
    other: '{count} ملاحظة',
  },
  'settings.importSkipped': {
    one: 'مدخل واحد لا يحتوي على شيء يحفظه Passhold، فيُستبعد.',
    two: 'مدخلان لا يحتويان على شيء يحفظه Passhold، فيُستبعدان.',
    few: '{count} مدخلات لا تحتوي على شيء يحفظه Passhold، فتُستبعد.',
    many: '{count} مدخلًا لا يحتوي على شيء يحفظه Passhold، فيُستبعد.',
    other: '{count} مدخل لا يحتوي على شيء يحفظه Passhold، فيُستبعد.',
  },
  'settings.importDuplicates': {
    one: 'واحد موجود بالفعل في خزنتك.',
    two: 'موجودان بالفعل في خزنتك.',
    few: '{count} مدخلات موجودة بالفعل في خزنتك.',
    many: '{count} مدخلًا موجودًا بالفعل في خزنتك.',
    other: '{count} مدخل موجود بالفعل في خزنتك.',
  },
  'settings.importConfirm': 'استيراد',
  'settings.importDone': 'تم استيراد {what}.',
  'settings.importDelete': 'احذف الآن ملف CSV: فهو يحتوي على كلمات مرورك بنص واضح.',
  'settings.importNothing': 'لا جديد للاستيراد في هذا الملف.',
  'settings.importTwoFactor': {
    one: 'تسجيل دخول واحد في هذا الملف يحمل رمز تحقق بخطوتين (2FA). لا يحفظ Passhold رموز 2FA: انقله إلى تطبيق مصادقة قبل أن تحذف مدير كلمات المرور القديم، وإلا قد تُمنع من الدخول إلى ذلك الحساب.',
    two: 'تسجيلا دخول في هذا الملف يحملان رمزي تحقق بخطوتين (2FA). لا يحفظ Passhold رموز 2FA: انقلهما إلى تطبيق مصادقة قبل أن تحذف مدير كلمات المرور القديم، وإلا قد تُمنع من الدخول إلى ذلك الحسابين.',
    few: '{count} تسجيلات دخول في هذا الملف تحمل رموز تحقق بخطوتين (2FA). لا يحفظ Passhold رموز 2FA: انقلها إلى تطبيق مصادقة قبل أن تحذف مدير كلمات المرور القديم، وإلا قد تُمنع من الدخول إلى تلك الحسابات.',
    many: '{count} تسجيل دخول في هذا الملف تحمل رموز تحقق بخطوتين (2FA). لا يحفظ Passhold رموز 2FA: انقلها إلى تطبيق مصادقة قبل أن تحذف مدير كلمات المرور القديم، وإلا قد تُمنع من الدخول إلى تلك الحسابات.',
    other: '{count} تسجيل دخول في هذا الملف تحمل رموز تحقق بخطوتين (2FA). لا يحفظ Passhold رموز 2FA: انقلها إلى تطبيق مصادقة قبل أن تحذف مدير كلمات المرور القديم، وإلا قد تُمنع من الدخول إلى تلك الحسابات.',
  },
  'settings.importAuthenticator': 'احصل على Keyrook Authenticator',
  'settings.importPasskeysLeft': {
    one: 'مفتاح مرور واحد في هذا الملف لا يمكن أن يصل إلى Passhold. احتفظ بمدير كلمات المرور القديم حتى تسجّل الدخول إلى ذلك الموقع بطريقة أخرى وتنشئ مفتاح مرور جديدًا في Passhold.',
    two: 'مفتاحا مرور في هذا الملف لا يمكنهما الوصول إلى Passhold. احتفظ بمدير كلمات المرور القديم حتى تسجّل الدخول إلى ذلك الموقعين بطريقة أخرى وتنشئ مفتاحي مرور جديدين في Passhold.',
    few: '{count} مفاتيح مرور في هذا الملف لا يمكنها الوصول إلى Passhold. احتفظ بمدير كلمات المرور القديم حتى تسجّل الدخول إلى تلك المواقع بطريقة أخرى وتنشئ مفاتيح مرور جديدة في Passhold.',
    many: '{count} مفتاح مرور في هذا الملف لا يمكنها الوصول إلى Passhold. احتفظ بمدير كلمات المرور القديم حتى تسجّل الدخول إلى تلك المواقع بطريقة أخرى وتنشئ مفاتيح مرور جديدة في Passhold.',
    other: '{count} مفتاح مرور في هذا الملف لا يمكنها الوصول إلى Passhold. احتفظ بمدير كلمات المرور القديم حتى تسجّل الدخول إلى تلك المواقع بطريقة أخرى وتنشئ مفاتيح مرور جديدة في Passhold.',
  },

  'settings.export': 'تصدير',
  'settings.exportBody':
    'ملف CSV يستطيع قراءته كل متصفح ومدير كلمات مرور. يحتوي على كلمات مرورك بنص واضح: احتفظ به فقط طالما تحتاجه. يحتوي على بيانات الدخول فقط: مفاتيح المرور والحقول المخصصة والمجلدات والبطاقات والعناوين والملاحظات غير موجودة فيه. تحتفظ النسخة الاحتياطية بكل شيء.',
  'settings.exportButton': 'تصدير CSV',
  'settings.exportDone': 'تم التصدير. احذف الملف عندما تنتهي منه.',

  'settings.neverSave': 'لا تعرض الحفظ أبدًا على',
  'settings.neverSaveEmpty':
    'لا توجد مواقع. اختر “أبدًا لهذا الموقع” عندما يعرض Passhold الحفظ، فيظهر هنا.',
  'settings.remove': 'إزالة',

  'settings.trash': 'سلة المهملات',
  'settings.trashEmpty': 'سلة المهملات فارغة.',
  'settings.restore': 'استعادة',
  'settings.deleteForever': 'حذف نهائي',
  'settings.emptyTrash': 'إفراغ سلة المهملات',
  'settings.emptyTrashConfirm': 'أتحذف كل ما في سلة المهملات نهائيًا؟',

  'settings.danger': 'إزالة الخزنة',
  'settings.dangerBody':
    'يحذف الخزنة من هذا المتصفح. كل تسجيل دخول فيها يُفقد نهائيًا – نزّل نسخة احتياطية أولًا إن أردت الاحتفاظ بها.',
  'settings.dangerType': 'اكتب {word} للتأكيد',
  'settings.dangerWord': 'احذف',
  'settings.dangerButton': 'إزالة الخزنة',

  'settings.about': 'Passhold {version} · من Keyrook',

  // Errors
  'error.noWorker': 'لم يستجب Passhold. أغلق هذه النافذة وحاول مرة أخرى.',
  'error.wrongPassword': 'هذه ليست كلمة المرور الرئيسية.',
  'error.passwordTooShort': 'استخدم {min} حرفًا على الأقل.',
  'error.vaultCorrupt': 'الخزنة على هذا الجهاز تالفة ولا يمكن فتحها.',
  'error.vaultTooNew': 'أُنشئت هذه الخزنة بواسطة إصدار أحدث من Passhold. حدّث Passhold لفتحها.',
  'error.itemNotFound': 'لم يعد ذلك موجودًا في الخزنة.',
  'error.familyOrganiserOnly': 'لا يستطيع إفراغ سلة مهملات هذه الخزنة إلا أحد منظِّمي العائلة.',
  'error.familyGone': 'لم تعد تلك العائلة موجودة هنا. زامِن، ثم ابحث مجددًا.',
  'error.familyNotOpen': 'لا يستطيع Passhold فتح تلك العائلة في هذا المتصفح بعد. زامِن، ثم حاول مرة أخرى.',
  'error.itemInvalid': 'لا يمكن حفظ ذلك بصورته الحالية.',
  'error.importEmpty': 'هذا الملف لا يحتوي على شيء للاستيراد.',
  'error.importTooLarge': 'هذا الملف كبير جدًا للاستيراد.',
  'error.importUnknownFormat': 'لا يبدو هذا الملف كتصدير لكلمات المرور.',
  'error.importEncrypted':
    'تصدير Bitwarden هذا مشفّر، ولا يستطيع Passhold فتحه. صدّره من Bitwarden مرة أخرى بصيغة “.json” لا “.json (Encrypted)”، ثم اختر ذلك الملف.',
  'error.backupInvalid': 'هذا الملف ليس نسخة احتياطية من Passhold، أو أنه تالف.',
  'error.backupWrongPassword': 'هذه ليست كلمة المرور الرئيسية التي أُنشئت بها هذه النسخة الاحتياطية.',
  'error.backupWrongRecoveryKey': 'هذا ليس مفتاح الاسترداد الذي أُنشئت به هذه النسخة الاحتياطية.',
  'error.noRecoveryKey': 'لا يوجد لهذه الخزنة مفتاح استرداد لعرضه: تُفتح بكلمة مرور رئيسية.',
  'error.wrongRecoveryKey': 'هذا ليس مفتاح الاسترداد.',
  'error.deviceNeeded':
    'تُفتح الخزنة التي لا تحتوي على كلمة مرور رئيسية بقفل هذا الجهاز: أعدّه أولًا. يبقى حتى تُعيَّن كلمة مرور رئيسية.',
  'error.accountOffline': 'تعذّر الوصول إلى Keyrook. تحقق من الاتصال وحاول مرة أخرى.',
  'error.accountWrong':
    'البريد الإلكتروني أو كلمة المرور غير صحيحة. الحساب المُنشأ باستخدام Google أو GitHub يسجّل الدخول بزره الخاص بدلًا من ذلك.',
  'error.accountSignedOut': 'سجّل Keyrook خروج هذا المتصفح. سجّل الدخول مجددًا.',
  'error.accountBusy': {
    one: 'محاولات كثيرة جدًا. انتظر ثانية واحدة وحاول مرة أخرى.',
    two: 'محاولات كثيرة جدًا. انتظر ثانيتين وحاول مرة أخرى.',
    few: 'محاولات كثيرة جدًا. انتظر {count} ثوانٍ وحاول مرة أخرى.',
    many: 'محاولات كثيرة جدًا. انتظر {count} ثانية وحاول مرة أخرى.',
    other: 'محاولات كثيرة جدًا. انتظر {count} ثانية وحاول مرة أخرى.',
  },
  'error.accountFailed': 'تعذّر على Keyrook القيام بذلك الآن. حاول لاحقًا.',
  'error.accountAlready': 'هذه الخزنة مسجّلة الدخول بالفعل إلى حساب Keyrook.',
  'error.accountNone': 'هذه الخزنة غير مسجّلة الدخول إلى حساب Keyrook.',
  'error.accountKdfRefused': 'طلب Keyrook مفتاحًا أضعف مما يقبله Passhold، فأُوقف تسجيل الدخول.',
  'error.accountKeyWrong': 'لم يُفتح مفتاح الحساب بكلمة المرور هذه.',
  'error.accountCode': 'هذا الرمز غير صحيح، أو انتهت صلاحيته. تحقق من البريد الإلكتروني، أو اطلب رمزًا جديدًا.',
  'error.accountMail': 'تعذّر على Keyrook إرسال البريد الإلكتروني الآن. حاول مرة أخرى بعد دقيقة.',
  'error.providerDenied': 'أُلغي تسجيل الدخول.',
  'error.providerFailed': 'تعذّر على Google أو GitHub تسجيل دخولك الآن. حاول مرة أخرى.',
  'error.providerExpired': 'انتهى تسجيل الدخول هذا. ابدأ من جديد.',
  'error.providerNotOwner':
    'هذا ليس الحساب الذي يسجّل حساب Keyrook هذا الدخول به. سجّل الدخول مجددًا بالحساب الذي تستخدمه مع Keyrook.',
  'error.signOutUnsent': {
    one: 'لم يصل عنصر واحد إلى حساب Keyrook بعد، فلم يُزَل شيء. تحقق من اتصالك، أو سجّل الدخول مجددًا، ثم سجّل الخروج.',
    two: 'لم يصل عنصران إلى حساب Keyrook بعد، فلم يُزَل شيء. تحقق من اتصالك، أو سجّل الدخول مجددًا، ثم سجّل الخروج.',
    few: 'لم تصل {count} عناصر إلى حساب Keyrook بعد، فلم يُزَل شيء. تحقق من اتصالك، أو سجّل الدخول مجددًا، ثم سجّل الخروج.',
    many: 'لم يصل {count} عنصرًا إلى حساب Keyrook بعد، فلم يُزَل شيء. تحقق من اتصالك، أو سجّل الدخول مجددًا، ثم سجّل الخروج.',
    other: 'لم يصل {count} عنصر إلى حساب Keyrook بعد، فلم يُزَل شيء. تحقق من اتصالك، أو سجّل الدخول مجددًا، ثم سجّل الخروج.',
  },
  'error.providerOtherProvider':
    'لهذا البريد الإلكتروني حساب Keyrook يسجّل الدخول بالخدمة الأخرى من Google وGitHub. سجّل الدخول بتلك.',
  'error.providerHasPassword':
    'لهذا البريد الإلكتروني حساب Keyrook بكلمة مرور. سجّل الدخول هنا ببريدك الإلكتروني وكلمة مرورك – أو، لتسجيل الدخول باستخدام Google أو GitHub أيضًا، أضفه على account.keyrook.com، وسجّل الدخول هناك بكلمة مرورك.',
  'error.providerEmailTaken':
    'لهذا البريد الإلكتروني حساب Keyrook يسجّل الدخول بطريقة أخرى. سجّل الدخول بتلك الطريقة – أو أضف هذا الحساب إليه على account.keyrook.com، وسجّل الدخول هناك بالطريقة التي يسجّل بها الآن.',
  'error.pairingWrongKey':
    'ما جاء ليس مفتاح هذا الحساب، فرُفض. اطلب مجددًا، ولا تسمح بالدخول إلا من متصفح تعرفه.',
  'error.pairingRefused': 'لم يصدر ذلك من المتصفح الذي تحققت من رمزه، فرُفض. اطلب مجددًا.',
  'error.pairingEnded': 'انتهى هذا الطلب. اطلب مجددًا من المتصفح الجديد.',
  'error.passkeyWrong': 'مفتاح المرور هذا لا يفتح هذا الحساب. جرّب طريقة أخرى للدخول.',
  'error.joinExpired': 'انتظر تسجيل الدخول هذا طويلًا جدًا. سجّل الدخول مجددًا.',
  'error.accountPasswordWrong': 'هذه ليست كلمة مرور الحساب.',
  'error.accountNoKit': 'لا يحتفظ Passhold بمفتاح استرداد هذا الحساب.',
  'error.accountKitRace': 'غيّر تطبيق آخر مفتاح استرداد الحساب للتو. زامِن، ثم حاول مرة أخرى.',
  'error.accountKitShape': 'لا يبدو هذا كمفتاح استرداد لحساب: يتكون من 32 حرفًا ورقمًا.',
  'error.accountKitWrong': 'مفتاح الاسترداد هذا لا يطابق حسابًا بعنوان البريد الإلكتروني هذا.',
  'error.accountKitNotThis': 'هذا ليس مفتاح استرداد هذا الحساب. انظر مجددًا إلى ما حفظته.',
  'error.accountPasswordWeak':
    'سهل التخمين جدًا لحساب: استخدم كلمة مرور أطول تمزج بين الحروف والأرقام والرموز، أو أربع كلمات أو خمس غير مترابطة.',
  'error.accountBoxWrong':
    'لم يُفتح مفتاح Passhold في هذا الحساب. سجّل الدخول مجددًا؛ وإذا لم ينجح، فابدأ الحساب من جديد.',
  'error.accountCodeWait': {
    one: 'أُرسل رمز قبل لحظات. يمكنك طلب آخر بعد ثانية واحدة.',
    two: 'أُرسل رمز قبل لحظات. يمكنك طلب آخر بعد ثانيتين.',
    few: 'أُرسل رمز قبل لحظات. يمكنك طلب آخر بعد {count} ثوانٍ.',
    many: 'أُرسل رمز قبل لحظات. يمكنك طلب آخر بعد {count} ثانية.',
    other: 'أُرسل رمز قبل لحظات. يمكنك طلب آخر بعد {count} ثانية.',
  },
  'error.accountSignUpKeys':
    'طلب Keyrook مفتاح Passhold الخاص، ولم يُرسَل أي مفتاح. حدّث Passhold وحاول مرة أخرى.',
  'error.accountIdTaken': 'تعذّر إنشاء الحساب الآن. اطلب رمزًا جديدًا وحاول مرة أخرى.',
  'error.accountNoRoot': 'لا يملك هذا الحساب بعد مفتاحًا يفتحه مفتاح الاسترداد. سجّل الدخول مجددًا بكلمة مروره.',
  'error.accountRootNotHeld':
    'لم يستطع هذا الحاسوب أن يُظهر أنه يحتفظ بمفتاح الحساب. سجّل الدخول مجددًا بكلمة المرور أو بمفتاح الاسترداد.',
  'error.accountRootChanged':
    'استُبدلت مفاتيح هذا الحساب على حاسوب آخر. سجّل الدخول على حاسوب ما زال Passhold مسجّل الدخول فيه، أو ابدأ الحساب من جديد.',
  'error.accountKeyReplaced': 'استُبدل مفتاح Passhold في هذا الحساب على حاسوب آخر. سجّل الدخول مجددًا.',
  'error.accountSessionStolen': 'سُجّل خروج هذا الحاسوب لأن جلسته استُخدمت من مكان آخر. سجّل الدخول مجددًا.',
  'error.accountOld':
    'أُنشئ هذا الحساب باستخدام Google أو GitHub قبل أن يملك كل تطبيق من تطبيقات Keyrook مفتاحه الخاص، ولا شيء فيه يفتح Passhold حتى الآن. ابدأ الحساب من جديد ببريده الإلكتروني ليحصل على مفتاح.',
  'error.pairingBusy': 'ينتظر عدد كبير جدًا من المتصفحات الانضمام إلى هذا الحساب. حاول مرة أخرى بعد بضع دقائق.',
  'error.startOverExpired': 'انتهت صلاحية ذلك. اطلب رمزًا جديدًا وابدأ من جديد.',
  'error.startOverTooOften': 'بدأ هذا الحساب من جديد مرات كثيرة مؤخرًا. حاول مرة أخرى بعد {day}.',
  'error.startOverWaiting': 'يبدأ هذا الحساب من جديد في {day}. يستطيع متصفح ما زال مسجّل الدخول إليه إلغاء ذلك.',
  'error.startOverUpdate': 'يُمهل Keyrook الآن أسبوعًا قبل بدء أي حساب من جديد. حدّث Passhold لطلب ذلك.',
  'error.passkeyFailed': 'تعذّر التحقق من مفتاح المرور هذا. حاول مرة أخرى.',
  'error.passkeyNotYou': 'لم يؤكد مفتاح المرور هذا أنك أنت. حاول مرة أخرى، وافتح قفله كما يطلب.',
  'error.passkeyUnknown':
    'مفتاح المرور هذا غير موجود في أي حساب Keyrook. ربما أُزيل: سجّل الدخول بكلمة المرور، أو باستخدام Google أو GitHub.',
  'error.passkeyExpired': 'انتهى طلب مفتاح المرور هذا. حاول مرة أخرى.',
  'error.passkeyNotOffered': 'لا يقدّم Keyrook مفاتيح مرور هنا بعد.',
  'error.passkeyNoUnlock':
    'يسجّل مفتاح المرور هذا الدخول، لكنه غير مُعدّ بعد لفتح حسابك. على account.keyrook.com، ضمن “Passkeys”، اختر “Let it unlock” بجانبه، ثم حاول مرة أخرى. أو سجّل الدخول بكلمة المرور، أو باستخدام Google أو GitHub.',
  'error.passkeyNoPrf':
    'يسجّل مفتاح المرور هذا الدخول إلى account.keyrook.com، لكن المكان الذي يُحفظ فيه لا يستطيع فتح حسابك – سلسلة مفاتيح iCloud قبل macOS 15 لا تستطيع ذلك، على سبيل المثال. على account.keyrook.com، ضمن “Passkeys”، أضف مفتاحًا يُحفظ في مكان يستطيع ذلك، مثل مفتاح أمان، وتحقق من أنه يقول “Unlocks your data”. حتى ذلك الحين، سجّل الدخول بكلمة المرور، أو باستخدام Google أو GitHub.',
  'error.passkeyPermission':
    'يحتاج Passhold إلى إذن Chrome لاستخدام مفاتيح المرور الخاصة بـ account.keyrook.com. اختر مفتاح المرور مجددًا وامنح الإذن.',
  'error.passkeyPermissionEdge':
    'يحتاج Passhold إلى إذن Edge لاستخدام مفاتيح المرور الخاصة بـ account.keyrook.com. اختر مفتاح المرور مجددًا وامنح الإذن.',
  'error.passkeyCancelled': 'لم يُستخدم مفتاح مرور. حاول مرة أخرى، أو سجّل الدخول بطريقة أخرى.',
  'error.secondStepNeeded': 'يطلب حسابك خطوة ثانية: أدخل الرمز من تطبيق المصادقة الخاص بك أيضًا.',
  'error.secondStepWrong': 'هذا الرمز غير صحيح. أدخل الرمز الذي يعرضه تطبيق المصادقة الآن، أو مفتاح الاسترداد الخاص بك.',
  'error.signInExpired': 'انتهى تسجيل الدخول هذا. سجّل الدخول مجددًا.',
  'error.secondStepUpdate': 'يطلب حسابك خطوة ثانية لتسجيل الدخول. حدّث Passhold لتسجيل الدخول.',
  'error.secondStepAsked': 'يطلب حسابك خطوة ثانية: أدخل الرمز من تطبيق المصادقة الخاص بك.',
  'error.secondStepTaken':
    'هذا هو الرمز الذي سجّلت الدخول به، وكل رمز يعمل مرة واحدة فقط. انتظر حتى يعرض تطبيق المصادقة رمزًا جديدًا.',
  'error.kitDraftGone': 'لم يُعيَّن مفتاح الاسترداد الجديد في الوقت المناسب، ولم يتغيّر شيء. أنشئ مفتاحًا جديدًا مرة أخرى.',
  'error.archiveWrong': 'هذا لا يفتح ما جرى حفظه.',
  'error.archiveGone': 'لم يعد ذلك محفوظًا.',
  'error.archiveDeleteRefused': 'لا يستطيع حذف ما حُفظ من قبل قبل انتهاء صلاحيته إلا كلمة المرور القديمة أو مفتاح الاسترداد القديم.',
  'error.accountNeedsRoot':
    'أُنشئ هذا الحساب في Keyrook Authenticator قبل أن يملك كل تطبيق من تطبيقات Keyrook مفتاحه الخاص. يستطيع Passhold أن يمنحه مفتاحًا الآن؛ لا يتغيّر شيء في Authenticator.',
  'error.accountServerWrong':
    'ردّ خادم Keyrook بشيء لا تتطابق معه مفاتيح هذا الحساب، فأوقف Passhold العملية. حاول لاحقًا.',
  'error.startOverNeedsPassword': 'لهذا الحساب كلمة مرور: اختر كلمة جديدة لتبدأ الحساب من جديد.',
  'error.pinInvalid': 'رمز PIN يتكون من 6 إلى 12 رقمًا.',
  'error.wrongPin': 'هذا ليس رمز PIN.',
  'error.wrongPinLeft': {
    one: 'هذا ليس رمز PIN. تبقّت محاولة واحدة.',
    two: 'هذا ليس رمز PIN. تبقّت محاولتان.',
    few: 'هذا ليس رمز PIN. تبقّت {count} محاولات.',
    many: 'هذا ليس رمز PIN. تبقّت {count} محاولة.',
    other: 'هذا ليس رمز PIN. تبقّت {count} محاولة.',
  },
  'error.pinLockedOut': 'أرقام PIN خاطئة كثيرة جدًا. افتح القفل بطريقة أخرى؛ يعمل رمز PIN مرة أخرى بعد ذلك.',
  'error.pinUnavailable': 'يعمل رمز PIN فقط طالما يبقى المتصفح مفتوحًا. افتح القفل بطريقة أخرى؛ يعمل رمز PIN مرة أخرى بعد ذلك.',
  'error.deviceGone': 'لم يعد فتح القفل بهذا الجهاز مُعدًّا. افتح القفل بطريقة أخرى.',
  'error.deviceKeyWrong': 'لم يفتح ذلك Passhold. افتح القفل بطريقة أخرى، ثم أعد إعداد فتح القفل بالجهاز.',
  'error.deviceUnsupported':
    'المكان الذي حُفظ فيه مفتاح المرور هذا لا يستطيع إعطاء Passhold مفتاحًا للفتح. حاول مرة أخرى واحفظه في مدير كلمات المرور في Google – أو استخدم رمز PIN.',
  'error.deviceUnsupportedEdge':
    'المكان الذي حُفظ فيه مفتاح المرور هذا لا يستطيع إعطاء Passhold مفتاحًا للفتح. حاول مرة أخرى واحفظه في مكان آخر – أو استخدم رمز PIN.',
  'error.deviceCancelled': 'لم يُفتح شيء: أُلغي الأمر أو استغرق وقتًا طويلًا.',
  'error.keyUnsupported':
    'هذا المفتاح لا يستطيع منح Passhold ما يحتاجه للفتح. معظم مفاتيح FIDO2 تستطيع ذلك؛ أما المفتاح المصنوع فقط للتحقق بخطوتين (U2F) فلا يستطيع.',
  'error.keyAlreadyAdded': 'هذا المفتاح مُعدّ هنا بالفعل.',
  'error.keyGone': 'لم يعد مفتاح الأمان هذا مُعدًّا هنا. افتح القفل بطريقة أخرى.',
  'error.keyWrong': 'لم يفتح هذا المفتاح Passhold. افتح القفل بطريقة أخرى، ثم أزل المفتاح وأضفه مجددًا.',
  'error.kdfUnsupported': 'إعدادات الخزنة ليست من الإعدادات التي يقبلها Passhold.',
  'error.locked': 'Passhold مُقفَل.',
  'error.noVault': 'لا توجد خزنة بعد.',
  'error.vaultExists': 'توجد خزنة بالفعل.',
  'error.notOnPage': 'تسجيل الدخول هذا ليس للصفحة الموجودة في هذا التبويب.',
  'error.expired': 'انتهت صلاحية هذا. حاول مرة أخرى.',
  'error.noFields': 'لا يوجد شيء في هذه الصفحة يستطيع Passhold ملأه.',
  'error.cardInsecure': 'يملأ Passhold البطاقة فقط في صفحة آمنة (https).',
  'error.unknown': 'حدث خطأ ما: {detail}',
};
