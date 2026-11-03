import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'מאת Keyrook',

  // Common
  'common.cancel': 'ביטול',
  'common.close': 'סגירה',
  'common.save': 'שמירה',
  'common.edit': 'עריכה',
  'common.back': 'חזרה',
  'common.show': 'הצגה',
  'common.hide': 'הסתרה',
  'common.notNow': 'לא עכשיו',

  // Setup
  'setup.title': 'יצירת הכספת שלך',
  'setup.body':
    'Passhold שומר את הסיסמאות שלך מוצפנות במכשיר הזה. סיסמה ראשית אחת פותחת אותן – בחר אחת שתזכור ולא תשתמש בה בשום מקום אחר.',
  'setup.password': 'סיסמה ראשית',
  'setup.confirm': 'הקלד שוב',
  'setup.mismatch': 'שתי הסיסמאות אינן זהות.',
  'setup.tooShort': 'יש להשתמש בלפחות {min} תווים.',
  'setup.understand':
    'אני מבין שאף אחד – לא Passhold ולא Keyrook – לא יוכל לשחזר את הכספת שלי אם אשכח את הסיסמה הזו.',
  'setup.create': 'יצירת כספת',
  'setup.creating': 'יוצר…',
  'setup.restore': 'שחזור מגיבוי',

  // Strength
  'setup.deviceBody':
    'Passhold שומר את הסיסמאות שלך מוצפנות במכשיר הזה, ו־{method} פותח אותן – בלי סיסמה ראשית שצריך להמציא או לזכור. תקבל גם מפתח שחזור, למקרה ש־{method} לא יפעל יום אחד.',
  'setup.deviceWhereMac': 'כש־Chrome שואל איפה לשמור את מפתח הגישה, בחר במנהל הסיסמאות של Google.',
  'setup.deviceWhereMacEdge':
    'כש־Edge שואל איפה לשמור את מפתח הגישה, בחר מקום שמשמר אותו גם במכשירים האחרים שלך. לא כל מקום יכול לפתוח את Passhold: אם המקום הזה לא יכול, Passhold יאמר לך זאת.',
  'setup.createWithDevice': 'יצירה עם {method}',
  'setup.usePassword': 'שימוש בסיסמה ראשית במקום',
  'setup.useDevice': 'שימוש ב־{method} במקום',
  'setup.signIn': 'כניסה לחשבון Keyrook או יצירת חשבון',

  'welcome.title': 'הסיסמאות שלך, בכל מחשב',
  'welcome.body': 'היכנס פעם אחת. Passhold נפתח עם טביעת האצבע שלך, ממלא בשבילך, ופרטי הכניסה שלך נמצאים איפה שאתה נכנס.',
  'welcome.email': 'שימוש בכתובת אימייל',
  'gate.touchTitle': 'פתיחה במגע אחד',
  'gate.touchBody': 'Touch ID או Windows Hello פותחים את Passhold. אין סיסמה ראשית להמציא ולזכור.',
  'gate.everywhereTitle': 'בכל מחשב שאתה משתמש בו',
  'gate.everywhereBody': 'היכנס במחשב אחר, והסיסמאות ומפתחות הגישה שלך נמצאים שם.',
  'gate.privateTitle': 'רק אתה יכול לקרוא אותם',
  'gate.privateBody':
    'מוצפן במחשב הזה לפני שמשהו נשלח. Keyrook לא יכול לקרוא את הסיסמאות שלך, וגם לא לדעת לאילו אתרים הן שייכות.',
  'welcome.note':
    'מוצפן קודם במחשב הזה: Keyrook לא יכול לקרוא את הסיסמאות שלך, וגם לא לדעת לאילו אתרים הן שייכות.',
  'connect.title': 'הפעלת חשבון Keyrook שלך',
  'connect.body': 'פרטי הכניסה שלך בכל מחשב שאתה משתמש בו – וגיבוי אם המחשב הזה ילך לאיבוד.',
  'connect.email': 'אימייל',
  'kitCheck.title': 'בדיקת מפתח שחזור החשבון שלך',
  'kitCheck.body': 'הקלד אותו פעם אחת, כדי שתדע שעדיין יש לך אותו לפני היום שתצטרך אותו.',
  'accountPasskey.button': 'המשך עם מפתח גישה',
  'accountPasskey.working': 'ממתין למפתח הגישה…',
  'accountPasskey.hint':
    'אחד שהוספת ב־account.keyrook.com. בפעם הראשונה {browser} ישאל אם לאפשר ל־Passhold להשתמש בו.',
  'accountPasskey.openPasskeys': 'פתיחת “Passkeys” ב־account.keyrook.com',
  'join.title': 'כניסה ל־Keyrook',
  'join.body': 'חשבון Keyrook אחד עבור Passhold ו־Keyrook Authenticator. פרטי הכניסה שלך מגיעים לדפדפן הזה מהחשבון.',
  'join.createTitle': 'יצירת חשבון Keyrook',
  'join.createBody':
    'חשבון אחד עבור Passhold ו־Keyrook Authenticator: פרטי הכניסה שלך, מוצפנים קודם במכשיר הזה, בכל מחשב שאתה נכנס אליו.',
  'join.lockTitle': 'נכנסת כ־{email}',
  'join.lockBodyDevice':
    'השלב האחרון: Passhold נפתח במחשב הזה עם {method}. פרטי הכניסה שלך יורדים ברגע שההגדרה מסתיימת.',
  'join.cancel': 'שימוש בחשבון אחר',
  'join.lockBodyCode': 'השלב האחרון: קוד שפותח את Passhold במחשב הזה. פרטי הכניסה שלך יורדים ברגע שההגדרה מסתיימת.',
  'join.opening': 'Passhold נפתח…',
  'setup.useAccountPassword': 'שימוש בסיסמת החשבון שלי במקום',
  'setup.useCode': 'שימוש בקוד למחשב הזה במקום',
  'security.accountPasswordTitle': 'נפתח עם סיסמת חשבון Keyrook שלך',
  'security.accountPasswordBody':
    'סיסמה אחת לשניהם. כשהיא משתנה, Passhold כאן עוקב אחריה בכניסה הבאה שלך.',

  'recovery.title': 'שמירת מפתח השחזור שלך',
  'recovery.body':
    'אם המכשיר הזה ילך לאיבוד, או שהפתיחה שלו תפסיק לעבוד, המפתח הזה הוא הדרך חזרה לכספת ולגיבויים שלה. אתה יכול לראות אותו שוב בהגדרות בזמן ש־Passhold עדיין נפתח – לכן שמור אותו גם במקום אחר: מודפס, בטלפון, או בקובץ הרחק מהמחשב הזה.',
  'recovery.download': 'הורדה',
  'recovery.copy': 'העתקה',
  'recovery.copied': 'הועתק',
  'recovery.print': 'הדפסה',
  'recovery.qr': 'הצגת קוד QR',
  'recovery.qrHide': 'הסתרת קוד QR',
  'recovery.qrLabel': 'מפתח השחזור כקוד QR',
  'recovery.qrHint': 'כוון את המצלמה של הטלפון אליו ושמור את הטקסט בהערה, או צלם אותו.',
  'recovery.show': 'הצגה',

  'kit.title': 'ערכת השחזור של Passhold',
  'kit.made': 'נוצר ב־{date}',
  'kit.keyLabel': 'מפתח שחזור',
  'kit.whenTitle': 'כש־Passhold לא נפתח',
  'kit.sameDevice':
    'במחשב הזה: כש־Passhold מבקש לפתוח, בחר “השתמש במפתח השחזור במקום” והקלד את המפתח.',
  'kit.newDevice':
    'במחשב חדש: התקן את Passhold, בחר “שחזור מגיבוי”, בחר את קובץ הגיבוי החדש ביותר והקלד את המפתח. בלי גיבוי אין מה לשחזר, לכן שמור אחד.',
  'kit.keep': 'שמור את הדף הזה במקום בטוח, הרחק מהמחשב. מי שיש לו אותו ועותק של הכספת שלך יכול לפתוח את הכספת.',
  'recovery.fileTitle': 'מפתח השחזור של Passhold',
  'recovery.fileMade': 'נוצר ב־{date}',
  'recovery.fileBody':
    'המפתח הזה פותח את כספת Passhold שלך ואת הגיבויים שלה כשהמכשיר שלך לא יכול. מי שיש לו ועותק של הכספת שלך יכול לפתוח אותה, לכן שמור אותו במקום בטוח ולא על אותו מחשב.',
  'recovery.pending': 'מפתח השחזור לא נשמר',
  'recovery.keptState': 'מפתח השחזור נשמר',
  'recovery.rowBody':
    'פותח את הכספת שלך ואת הגיבויים שלה כש־{method} לא יכול. מפתח חדש מפסיק לפתוח את הכספת הזו עם הישן; גיבויים שנעשו קודם עדיין נפתחים עם הישן.',
  'recovery.makeNew': 'יצירת חדש',
  'recovery.savedIt': 'שמרתי אותו',
  'recovery.checkTitle': 'בדיקה שאכן שמרת אותו',
  'recovery.checkBody':
    'הקלד שתי קבוצות מהמפתח ממה ששמרת – הקובץ, הנייר או התמונה. קבוצות הן הבלוקים של ארבעה תווים בין המקפים, ספורים משמאל.',
  'recovery.group': 'קבוצה {position}',
  'recovery.check': 'בדיקה',
  'recovery.checkWrong':
    'זה לא מה שהמפתח שלך אומר. בדוק שוב את מה ששמרת, או הצג את המפתח שוב ושמור אותו עכשיו.',
  'recovery.showAgain': 'הצגת המפתח שוב',
  'recovery.covered': 'חשבון Keyrook שלך הוא הדרך חזרה',
  'recovery.coveredBody':
    'אם {method} יפסיק לפתוח את Passhold כאן, הסר את הכספת והיכנס שוב לחשבון שלך: כל פרטי הכניסה יחזרו. מפתח השחזור של הכספת עצמה עדיין נמצא כאן לצפייה.',

  'proof.recoveryKey': 'מפתח שחזור',
  'proof.withDevice': 'תאשר עם {method}.',
  'proof.useDevice': 'אישור עם {method} במקום',
  'proof.usePassword': 'הקלדת הסיסמה הראשית במקום',
  'proof.useAccountPassword': 'הקלדת סיסמת החשבון במקום',
  'proof.useCode': 'הקלדת הקוד במקום',
  'proof.useRecoveryKey': 'הקלדת מפתח השחזור במקום',
  'strength.0': 'חלשה מאוד',
  'strength.1': 'חלשה',
  'strength.2': 'סבירה',
  'strength.3': 'חזקה',
  'strength.4': 'חזקה מאוד',
  'strength.short': 'ארוך יותר פירושו חזק יותר: כוון ל־14 תווים או יותר.',
  'strength.digitsOnly': 'ספרות בלבד קלות לניחוש.',
  'strength.repeats': 'הימנע מאותו תו שוב ושוב.',

  // Unlock
  'unlock.title': 'Passhold נעול',
  'unlock.body': 'הזן את הסיסמה הראשית שלך.',
  'unlock.password': 'סיסמה ראשית',
  'unlock.submit': 'פתיחה',
  'unlock.pinBody': 'הזן את ה־PIN שלך.',
  'unlock.pin': 'PIN',
  'unlock.usePassword': 'שימוש בסיסמה הראשית במקום',
  'unlock.usePin': 'שימוש ב־PIN במקום',
  'unlock.recoveryBody': 'הזן את מפתח השחזור שלך.',
  'unlock.deviceBody': 'השתמש ב־{method}, או הקלד למטה.',
  'unlock.recoveryKey': 'מפתח שחזור',
  'unlock.useRecoveryKey': 'שימוש במפתח השחזור במקום',
  'unlock.lost': 'לא מצליח להיכנס?',
  'unlock.forgotBodyRecovery':
    'מפתח השחזור שלך פותח את הכספת כשהמכשיר לא יכול. בלעדיו ובלי המכשיר, אף אחד – לא Passhold ולא Keyrook – לא יכול לפתוח את הכספת: אפשר רק להסיר אותה בהגדרות ולהתחיל מחדש.',
  'unlock.bodyAccount': 'הזן את סיסמת חשבון Keyrook שלך.',
  'unlock.accountPassword': 'סיסמת חשבון Keyrook',
  'unlock.useAccountPassword': 'שימוש בסיסמת החשבון במקום',
  'unlock.forgotBodyAccount':
    'זו סיסמת חשבון Keyrook שלך: אם שונתה במקום אחר, השתמש בחדשה. נשכחה לגמרי? הסר את הכספת הזו בהגדרות והיכנס שוב – עם מפתח השחזור אם אתה צריך סיסמה חדשה – ואז כל פרטי הכניסה יחזרו.',
  'unlock.bodyCode': 'הזן את הקוד שפותח את Passhold במחשב הזה.',
  'unlock.code': 'קוד למחשב הזה',
  'unlock.useCode': 'שימוש בקוד במקום',
  'unlock.forgotBodyCode':
    'הסר את הכספת הזו בהגדרות, והיכנס שוב עם Google או GitHub: כל פרטי הכניסה יחזרו מהחשבון שלך.',
  'unlock.device': 'פתיחה עם {method}',
  'unlock.key': 'פתיחה עם מפתח אבטחה',
  'unlock.keyBody': 'חבר את מפתח האבטחה שלך, או הקלד למטה.',
  'unlock.or': 'או',
  'unlock.unlocking': 'פותח…',
  'unlock.forgot': 'שכחת?',
  'unlock.forgotBody':
    'הסיסמה הראשית שלך היא המפתח היחיד לכספת הזו, והיא לא נשמרת בשום מקום. בלעדיה אי אפשר לפתוח את הכספת – אפשר רק להסיר אותה בהגדרות ולהתחיל מחדש.',

  // Vault
  'vault.search': 'חיפוש',
  'vault.lock': 'נעילה',
  'vault.settings': 'הגדרות',
  'vault.add': 'פרטי כניסה חדשים',
  'vault.onThisPage': 'ב־{site}',
  'vault.all': 'כל פרטי הכניסה',
  'vault.empty': 'אין עדיין פרטי כניסה',
  'vault.emptyBody':
    'היכנס לאתר, ו־Passhold יציע לשמור אותו – או הוסף כאן, או ייבא מהדפדפן שלך.',
  'vault.import': 'ייבוא סיסמאות',
  'vault.noResults': 'אין התאמה ל“{query}”.',
  'vault.fill': 'מילוי',
  'vault.copyUsername': 'העתקת שם משתמש',
  'vault.copyPassword': 'העתקת סיסמה',
  'vault.noUsername': 'אין שם משתמש',
  'vault.count': { one: '{count} פריט', two: '{count} פריטים', other: '{count} פריטים' },
  'vault.everything': 'כל הפריטים',

  // Asking for a rating, once, after real use
  'rating.title': 'האם Passhold מועיל לך?',
  'rating.body': 'דירוג בחנות עוזר לאנשים אחרים למצוא אותו.',
  'rating.rate': 'דרג אותו',
  'rating.later': 'לא עכשיו',

  // What a list shows, and what can be added
  'kinds.label': 'הצג',
  'kinds.all': 'הכול',
  'kinds.logins': 'כניסות',
  'kinds.cards': 'כרטיסים',
  'kinds.addresses': 'כתובות',
  'kinds.notes': 'הערות',
  'kinds.noLogins': 'אין עדיין פרטי כניסה.',
  'kinds.noCards':
    'אין עדיין כרטיסים. הוסף אחד עם + למעלה, ו־Passhold ימלא אותו בקופה כשתבחר בו.',
  'kinds.noAddresses':
    'אין עדיין כתובות. הוסף אחת עם + למעלה, ו־Passhold ימלא אותה בכל מקום שטופס מבקש כתובת.',
  'kinds.noNotes':
    'אין עדיין הערות. הערה שומרת מה שאינו פרטי כניסה – סיסמת Wi-Fi, מפתח רישיון – מוצפן יחד עם כל השאר.',
  'add.menu': 'הוספה',
  'add.login': 'פרטי כניסה',
  'add.card': 'כרטיס',
  'add.address': 'כתובת',
  'add.note': 'הערה',
  'place.label': 'כספות',
  'place.mine': 'שלי',
  'place.of': '{vault}, משותפת ב־{family}',
  'move.to': 'העברה אל {vault}',
  'move.confirm':
    'כל מי ב־{family} יראה אותו ב־{vault}, ויוכל לשנות אותו. הוא יוצא מהכספת שלך; הסיסמאות הקודמות שלו נשארות מאחור.',
  'move.do': 'העבר',
  'family.unlockTitle': 'פתיחת הכספת המשותפת של {family} בדפדפן הזה',
  'family.unlockBody':
    'Passhold צריך את סיסמת חשבון Keyrook שלך פעם אחת, כדי להעביר את המפתח שלך למשפחה בדפדפן הזה. היא לא נשלחת לשום מקום.',
  'family.unlockOnPage': 'פתח את הדף “Family” ב־account.keyrook.com, ומסור שם את המפתח שלך למשפחה ל־Passhold.',
  'family.password': 'סיסמת חשבון Keyrook',
  'family.unlock': 'פתיחה',
  'family.openPage': 'פתיחת הדף “Family”',
  'family.keyChanged': 'המפתח של {who} ב־{family} השתנה',
  'family.newSender': 'המפתח של {family} הגיע מ־{who}, שהדפדפן הזה עדיין לא מכיר',
  'family.keyChangedBody':
    'Passhold לא לוקח דבר מהם עד ששניכם משווים קוד. התקשרו או הפגשו: הם בוחרים להשוות קודים ליד שמכם בדף “Family” ב־account.keyrook.com.',
  'family.showCode': 'הצגת הקוד',
  'family.codeIs': 'הקוד שלך',
  'family.match': 'הקודים זהים',
  'family.differ': 'הם שונים',
  'family.differed':
    'אז אל תסמוך על זה. ספר למארגן/ת של המשפחה שלך; Passhold לא לוקח מהם דבר בינתיים.',
  'family.someone': 'מישהו',
  'family.waiting':
    'מארגן/ת של {family} עדיין לא אישר/ה אותך. מה שהמשפחה משתפת ייפתח כאן ברגע שיעשה/תעשה זאת.',
  'family.rotate':
    'מישהו עזב את {family}, ו־Passhold עדיין לא החליף את כל המפתחות שלה: מה ששונה בכספות המשותפות שלה ממתין בדפדפן הזה. אם זה נשאר כך, החלף אותם בדף “Family”.',
  'family.rotateCompare':
    'מישהו עזב את {family}. Passhold נותן לכולם מפתחות חדשים אחרי שהשוויתם את הקוד למעלה; עד אז, מה ששונה בכספות המשותפות שלה ממתין בדפדפן הזה.',
  'family.rotateWait':
    'מישהו עזב את {family}. מה שאתה משנה בכספות המשותפות שלה ממתין בדפדפן הזה, עד ש־Passhold של מארגן/ת יחליף את המפתחות שלה – מה שהוא עושה בסנכרון – כדי שמי שעזב לא יוכל לקרוא אותו.',
  'family.left': '{who} כבר לא חלק מ-{family}',
  'family.leftBody':
    'Passhold לא יכול לדעת למה. אם לא ציפית לזה, שאל את האדם הזה או מארגן/ת של המשפחה שלך.',
  'family.title': 'משפחה',
  'family.description':
    'מי נמצא במשפחה שלך, והכספות שהיא משתפת. משפחה מנוהלת בדף “Family” ב־account.keyrook.com: הזמנה, הסרת מישהו, החלפת מפתחות.',
  'family.none':
    'החשבון הזה לא נמצא באף משפחה. משפחות נוצרות בדף “Family” ב־account.keyrook.com.',
  'family.youOrganise': 'אתה מארגן/ת שלה.',
  'family.youMember': 'אתה חבר/ה בה.',
  'family.you': '(אתה)',
  'family.organiser': 'מארגן/ת',
  'family.notCompared': 'נכנס בלי להשוות קודים',
  'family.keyNew': 'המפתח שלו השתנה: לא לוקחים ממנו דבר עד שתשווה קוד',
  'family.membersLater': 'מי נמצא בה מופיע כאן כשהיא נפתחת בדפדפן הזה.',
  'family.sharedVaults': 'כספות משותפות',
  'family.vaultWaits': 'מה ששונה בה ממתין עד שמארגן/ת ישנה את המפתח',

  // Cards, addresses and notes
  'wallet.updated': 'שונה ב־{date}',
  'wallet.copyField': 'העתקת {field}',
  'card.untitled': 'כרטיס',
  'card.newTitle': 'כרטיס חדש',
  'card.editTitle': 'עריכת כרטיס',
  'card.titleHint': 'אם יישאר ריק, ייקרא על שם הכרטיס: הרשת שלו וארבע הספרות האחרונות.',
  'card.number': 'מספר כרטיס',
  'card.numberCheck': 'המספר הזה לא מסתדר: בדוק כל ספרה.',
  'card.holder': 'השם על הכרטיס',
  'card.expiry': 'תוקף',
  'card.month': 'חודש',
  'card.year': 'שנה',
  'card.code': 'קוד אבטחה',
  'card.empty': 'הזן מספר כרטיס או שם.',
  'card.expired': 'תוקף הכרטיס פג.',
  'card.expiredOn': 'פג תוקף {expiry}',
  'card.copyNumber': 'העתקת מספר הכרטיס',
  'card.copyExpiry': 'העתקת תאריך התוקף',
  'address.untitled': 'כתובת',
  'address.newTitle': 'כתובת חדשה',
  'address.editTitle': 'עריכת כתובת',
  'address.titleHint': 'בית, עבודה… אם יישאר ריק, ייקרא על פי השם שבה.',
  'address.name': 'שם מלא',
  'address.organization': 'חברה',
  'address.street': 'כתובת רחוב',
  'address.city': 'עיר',
  'address.region': 'מדינה או מחוז',
  'address.postalCode': 'מיקוד',
  'address.country': 'מדינה',
  'address.chooseCountry': 'בחר מדינה',
  'address.phone': 'טלפון',
  'address.email': 'אימייל',
  'address.address': 'כתובת',
  'address.empty': 'מלא שם, או חלק מהכתובת.',
  'note.untitled': 'הערה ללא כותרת',
  'note.newTitle': 'הערה חדשה',
  'note.editTitle': 'עריכת הערה',
  'note.title': 'כותרת',
  'note.text': 'הערה',
  'note.empty': 'תן כותרת, או כתוב משהו.',
  'note.edited': 'נערך ב־{date}',

  // Pending save, in the popup
  'pending.saveTitle': 'לשמור את פרטי הכניסה הזה?',
  'pending.updateTitle': 'לעדכן את הסיסמה?',
  'pending.lockedTitle': 'לשמור את פרטי הכניסה שבהם השתמשת זה עתה?',
  'pending.body': '{username} ב־{site}',
  'pending.bodyNoUser': 'סיסמה ל־{site}',
  'pending.save': 'שמירה',
  'pending.update': 'עדכון',
  'pending.never': 'אף פעם לאתר הזה',

  // Item
  'item.username': 'שם משתמש',
  'item.password': 'סיסמה',
  'item.website': 'אתר',
  'item.websites': 'אתרים',
  'item.notes': 'הערות',
  'item.favorite': 'מועדף',
  'item.unfavorite': 'הסרה מהמועדפים',
  'item.addFavorite': 'הוספה למועדפים',
  'item.trash': 'העברה לסל המיחזור',
  'item.updated': 'הסיסמה שונתה ב־{date}',
  'item.history': 'סיסמאות קודמות',
  'item.weak': 'הסיסמה הזו חלשה: לא ייקח זמן רב לנחש אותה.',
  'item.reused': {
    one: 'הסיסמה הזו משמשת גם עבור {count} פרט כניסה נוסף. אם אתר אחד ידלוף אותה, שניהם חשופים.',
    two: 'הסיסמה הזו משמשת גם עבור {count} פרטי כניסה נוספים. אם אתר אחד ידלוף אותה, שניהם חשופים.',
    other: 'הסיסמה הזו משמשת גם עבור {count} פרטי כניסה נוספים. אם אתר אחד ידלוף אותה, כולם חשופים.',
  },
  'item.changePassword': 'שינוי באתר',
  'item.openSite': 'פתיחת {site}',
  'item.passkey': 'מפתח גישה',
  'item.passkeyBody': 'עבור {site}, נשמר ב־{date}',

  // Edit
  'edit.newTitle': 'פרטי כניסה חדשים',
  'edit.editTitle': 'עריכת פרטי כניסה',
  'edit.title': 'שם',
  'edit.titleHint': 'אם יישאר ריק, ייקרא על שם האתר.',
  'edit.username': 'שם משתמש או אימייל',
  'edit.password': 'סיסמה',
  'edit.generate': 'יצירה',
  'edit.websites': 'אתרים',
  'edit.websitesHint': 'אחד בכל שורה. Passhold מציע את פרטי הכניסה הזה באתרים האלה.',
  'edit.notes': 'הערות',
  'edit.empty': 'תן שם, שם משתמש או סיסמה.',

  // Fields of an item's own, and folders
  'fields.title': 'שדות מותאמים',
  'fields.add': 'הוספת שדה',
  'fields.name': 'שם השדה',
  'fields.value': 'ערך',
  'fields.hidden': 'הסתרה כמו סיסמה',
  'fields.remove': 'הסרת השדה הזה',
  'fields.unnamed': 'שדה',
  'fields.copy': 'העתקת {name}',
  'folders.label': 'תיקייה',
  'folders.placeholder': 'ללא תיקייה',
  'folders.choose': 'תיקיות קיימות',
  'folders.hint': 'שמור דברים יחד – עבודה, משפחה, בנק – והצג תיקייה אחת בכל פעם.',
  'folders.all': 'כל התיקיות',
  'folders.none': 'לא בתיקייה',
  'folders.count': { one: '{count} פריט', two: '{count} פריטים', other: '{count} פריטים' },
  'folders.nothingHere': 'אין פריטים מסוג זה בתיקייה הזו.',
  'folders.rename': 'שינוי שם',
  'folders.renameTo': 'שם חדש לתיקייה',
  'folders.remove': 'הסרת התיקייה',
  'folders.removeHint': 'מה שבה נשאר, בלי תיקייה.',

  // Generator
  'generator.length': 'אורך',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'השמטת תווים דומים (I l 1 O 0)',
  'generator.again': 'אחרת',
  'generator.use': 'שימוש בסיסמה הזו',
  'generator.bits': '{bits} ביט',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold נעול.',
  'menu.unlock': 'פתיחת Passhold',
  'menu.unlockHint': 'לחץ על Passhold בסרגל הכלים כדי לפתוח, ואז חזור לכאן.',
  'menu.none': 'אין פרטי כניסה שמורים ל־{site}.',
  'menu.uninitialized': 'הגדר את Passhold קודם: לחץ עליו בסרגל הכלים.',
  'menu.suggest': 'שימוש בסיסמה חזקה',
  'menu.suggestBody': 'סיסמה חדשה, שמולאה בשבילך. Passhold מציע לשמור אותה אחרי שהטופס נשלח.',
  'menu.fillFor': 'מילוי ב־{site}',
  'menu.hidden': 'משהו בדף הזה מסתיר את Passhold, ולכן הוא לא ימלא.',
  'menu.passkey': 'מפתח גישה · {username}',
  'menu.noCards': 'עדיין אין כרטיסים ב־Passhold. הוסף אחד מ־Passhold בסרגל הכלים.',
  'menu.noAddresses': 'עדיין אין כתובות ב־Passhold. הוסף אחת מ־Passhold בסרגל הכלים.',
  'menu.cardInsecure':
    'הדף הזה אינו מאובטח (http פשוט), ולכן Passhold לא ימלא כרטיס כאן: מי שנמצא בדרך עלול לקרוא אותו.',

  // A website's passkey
  'passkey.saveTitle': 'לשמור מפתח גישה עבור {site}?',
  'passkey.save': 'שמירת מפתח הגישה',
  'passkey.saveElsewhere': 'שמירה במקום אחר',
  'passkey.useElsewhere': 'שימוש במפתח גישה ממקום אחר',
  'passkey.existsTitle': 'מפתח הגישה הזה כבר נמצא ב־Passhold',
  'passkey.ok': 'OK',
  'passkey.signInTitle': 'כניסה ל־{site}',
  'passkey.signInBody': 'עם מפתח גישה ששמור ב־Passhold',
  'passkey.none': 'אין מפתח גישה ל־{site} ב־Passhold.',
  'passkey.hidden': 'משהו בדף הזה מסתיר את Passhold, ולכן הוא לא יענה.',

  // Save prompt on a page
  'prompt.save': 'לשמור פרטי כניסה ב־Passhold?',
  'prompt.update': 'לעדכן את הסיסמה ב־Passhold?',
  'prompt.saveButton': 'שמירה',
  'prompt.updateButton': 'עדכון',
  'prompt.never': 'אף פעם לאתר הזה',
  'prompt.saved': 'נשמר ב־Passhold.',
  'prompt.locked': 'לחץ על Passhold בסרגל הכלים ופתח אותו – שם הוא ישאל אם לשמור.',
  'prompt.saveCard': 'לשמור כרטיס ב־Passhold?',
  'prompt.updateCard': 'לעדכן את הכרטיס ב־Passhold?',
  'prompt.saveAddress': 'לשמור כתובת ב־Passhold?',
  'prompt.saveCheckout': 'לשמור כרטיס וכתובת ב־Passhold?',

  // Settings
  'settings.title': 'הגדרות',
  'settings.cannotOpen': 'לא מצליח לפתוח בכלל? הסר את הכספת מהדפדפן הזה',
  'settings.encryptedHere': 'מוצפן במכשיר הזה',
  'settings.source': 'קוד מקור ב־GitHub',

  'nav.passwords': 'סיסמאות',
  'nav.accountSync': 'חשבון וסנכרון',
  'nav.family': 'משפחה',
  'nav.account': 'חשבון Keyrook',
  'nav.backup': 'גיבוי וייבוא',
  'nav.security': 'אבטחה',
  'nav.general': 'כללי',
  'nav.needsAttention': 'דורש תשומת לב',


  'account.description':
    'היכנס, ופרטי הכניסה שלך עוקבים אחריך לכל דפדפן שבו אתה נכנס ל־Passhold. הם מוצפנים במכשיר הזה קודם: השרת של Keyrook לא יכול לקרוא אותם, וגם לא לדעת לאילו אתרים הם שייכים.',
  'account.email': 'אימייל',
  'account.password': 'סיסמת חשבון Keyrook',
  'account.signIn': 'כניסה',
  'account.signingIn': 'נכנס…',
  'account.note':
    'אותו חשבון כמו ב־Keyrook Authenticator. חשבון שנוצר עם Google או GitHub נכנס בעזרת הכפתור שלו.',
  'account.haveOne': 'יש לי חשבון',
  'account.create': 'יצירת חשבון',
  'account.sendCode': 'שלח לי קוד באימייל',
  'account.createNote':
    'Keyrook שולח קוד בן שש ספרות באימייל כדי לאשר שהכתובת שלך. אם לכתובת כבר יש חשבון, האימייל יאמר זאת במקום: היכנס איתו.',
  'account.codeSent': 'קוד בדרך אל {email}. הוא תקף לחמש־עשרה דקות.',
  'account.code': 'קוד בן שש ספרות',
  'account.newPassword': 'סיסמת חשבון Keyrook',
  'account.passwordNote':
    'הסיסמה הזו פותחת את חשבון Keyrook שלך בכל דפדפן, עבור Passhold ו־Keyrook Authenticator כאחד. Keyrook אף פעם לא רואה אותה ולא יכול לאפס אותה בשבילך; מפתח השחזור שתקבל אחר כך הוא הדרך להגדיר חדשה.',
  'account.createButton': 'יצירת חשבון',
  'account.creating': 'יוצר…',
  'account.otherEmail': 'שימוש בכתובת אחרת',
  'account.signedInAs': 'מחובר כ־{email}',
  'account.signedInAsNamed': 'מחובר כ־{name} ({email})',
  'account.synced': 'סונכרן ב־{date}',
  'account.notSynced': 'עדיין לא סונכרן',
  'account.syncNow': 'סנכרון עכשיו',

  // The account, at the foot of the popup
  'accountBar.synced': 'סונכרן {time}',
  'accountBar.justNow': 'ממש עכשיו',
  'accountBar.syncing': 'מסנכרן…',
  'accountBar.signedOut': 'מנותק – היכנס שוב כדי לסנכרן',
  'accountBar.startedOver': 'החשבון הופעל מחדש – היכנס שוב',
  'accountBar.removed': 'הוסר מהחשבון – היכנס שוב כדי לסנכרן',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'הוסר מחשבון Keyrook שלך',
  'removed.body':
    'ב־{date} הדפדפן הזה הוסר מחשבון Keyrook שלך, ולכן Passhold הסיר ממנו את פרטי הכניסה, הכרטיסים, הכתובות וההערות של החשבון, והתנתק. מה שנוסף או שונה כאן ולא נשלח נשאר, כשלו של הדפדפן הזה. היכנס שוב כדי להחזיר את השאר.',

  // Passwords, in Settings
  'passwords.description':
    'כל פרטי כניסה, מפתח גישה, כרטיס, כתובת והערה ב־Passhold. בחר אחד כדי לראות אותו, להעתיק ממנו או לשנות אותו.',
  'passwords.all': 'הכול',
  'passwords.attention': 'דורש תשומת לב',
  'passwords.weak': 'חלשות',
  'passwords.reused': 'בשימוש חוזר',
  'account.syncDone': 'סונכרן.',
  'account.removed': {
    one: '{count} פריט שנמחק סופית במכשיר אחר הוסר כאן.',
    two: '{count} פריטים שנמחקו סופית במכשיר אחר הוסרו כאן.',
    other: '{count} פריטים שנמחקו סופית במכשיר אחר הוסרו כאן.',
  },
  'account.skipped': {
    one: 'רשומה {count} לא נפתחה והושארה במקומה.',
    two: 'רשומות {count} לא נפתחו והושארו במקומן.',
    other: 'רשומות {count} לא נפתחו והושארו במקומן.',
  },
  'account.manage': 'ניהול חשבון Keyrook שלך',
  'account.manageBody':
    'שנה את הסיסמה, צור מפתח שחזור חדש או הפעל את החשבון מחדש ב־account.keyrook.com – עבור Passhold ו־Keyrook Authenticator כאחד.',
  'account.manageBodyProvider':
    'צור מפתח שחזור חדש או הפעל את החשבון מחדש ב־account.keyrook.com – עבור Passhold ו־Keyrook Authenticator כאחד.',
  'account.manageOpen': 'פתיחה',
  'account.signOut': 'התנתקות',
  'account.signOutBody': 'מסיר כל פרט כניסה מהדפדפן הזה, אחרי סנכרון אחרון. היכנס שוב, והם יחזרו.',
  'account.signOutConfirm':
    'Passhold מסנכרן עוד פעם, ואז מסיר את הכספת מהדפדפן הזה. שום דבר לא יוסר אם פרט כניסה כלשהו לא הגיע לחשבון שלך.',
  'account.signOutButton': 'התנתקות והסרה',
  'account.signedOutByServer': 'Keyrook התנתק את הדפדפן הזה. היכנס שוב כדי להמשיך לסנכרן.',
  'account.startedOver':
    'חשבון Keyrook שלך הופעל מחדש ב־{date}, ולכן Keyrook התנתק מהדפדפן הזה. היכנס עם הסיסמה החדשה שלו: פרטי הכניסה כאן יועלו תחת המפתחות החדשים של החשבון.',
  'account.startedOverProvider':
    'חשבון Keyrook שלך הופעל מחדש ב־{date}, ולכן Keyrook התנתק מהדפדפן הזה. היכנס עם Google או GitHub: פרטי הכניסה כאן יועלו תחת המפתחות החדשים של החשבון.',
  'account.forgot': 'שכחת את הסיסמה?',
  'account.recoverBody':
    'Keyrook שולח קוד לכתובת החשבון; אחר כך הזן אותו, את מפתח השחזור של החשבון מהדף ששמרת כשיצרת את החשבון, וסיסמה חדשה. כל דפדפן ואפליקציה אחרים שמחוברים לחשבון יבקשו את הסיסמה החדשה.',
  'account.recoveryKey': 'מפתח שחזור לחשבון',
  'account.recoverPassword': 'סיסמת חשבון חדשה',
  'account.recoverButton': 'הגדרת סיסמה חדשה',
  'account.recovering': 'מגדיר…',
  'account.backToSignIn': 'חזרה לכניסה',
  'startOver.link': 'איבדת גם את מפתח השחזור? הפעל את החשבון מחדש',
  'startOver.title': 'הפעלה מחדש של החשבון',
  'needsRoot.body':
    'אם יש לך את מפתח השחזור של החשבון ש־Keyrook Authenticator נתן לך, הקלד אותו: הוא פותח גם את Passhold. בלעדיו, Passhold יוצר מפתח שחזור חדש לחשבון, שמוצג פעם אחת, והישן מפסיק לעבוד.',
  'needsRoot.sheet': 'מפתח שחזור לחשבון מ־Keyrook Authenticator (אם יש לך)',
  'needsRoot.withSheet': 'שימוש במפתח הזה',
  'needsRoot.newSheet': 'יצירת מפתח שחזור חדש',
  'startOver.body':
    'כשנשאר רק כתובת האימייל, החשבון יכול להתחיל מחדש עם מפתחות חדשים ומפתח שחזור חדש. זה נכנס לתוקף שבוע אחרי שביקשת, ועד אז כל דפדפן שעדיין מחובר לחשבון יכול לבטל זאת – כך שמי שיש לו רק את האימייל שלך לא יכול לקחת זאת. כל מה שהחשבון החזיק נשמר אצל Keyrook, עדיין מוצפן, למשך 90 יום: הסיסמה הישנה או מפתח השחזור הישן מחזירים אותו.',
  'startOver.button': 'הפעלה מחדש',
  'startOver.working': 'החשבון מופעל מחדש…',
  'startOver.kitBody':
    'מפתח השחזור החדש של החשבון: הוא עובד אחרי שהחשבון הופעל מחדש. Passhold מציג אותו רק עכשיו, אז שמור אותו לפני שתמשיך.',
  'startOver.waitTitle': 'החשבון שלך מופעל מחדש ב־{date}',
  'startOver.waitBody':
    'עד אז שום דבר לא משתנה, וכל דפדפן שעדיין מחובר לחשבון יכול לבטל את זה. Keyrook שולח עכשיו ל־{email}, את היום לפני, וכשזה קורה.',
  'startOver.waitThen':
    'מאז, היכנס כאן עם הסיסמה החדשה שלך. פרטי הכניסה בדפדפן הזה יועלו תחת המפתחות החדשים של החשבון, ומה שהיה בו קודם נשמר 90 יום.',
  'startOver.waitThenProvider':
    'מאז, היכנס כאן עם Google או GitHub, כמו קודם. פרטי הכניסה בדפדפן הזה יועלו תחת המפתחות החדשים של החשבון, ומה שהיה בו קודם נשמר 90 יום.',
  'startOver.understood': 'הבנתי',
  'startOver.doneTitle': 'החשבון שלך הופעל מחדש',
  'startOver.doneBody':
    'היכנס עם הסיסמה החדשה שלך: פרטי הכניסה בדפדפן הזה יועלו תחת המפתחות החדשים של החשבון, ומה שהיה בו קודם נשמר 90 יום.',
  'startOver.doneBodyProvider':
    'היכנס עם Google או GitHub, כמו קודם: פרטי הכניסה בדפדפן הזה יועלו תחת המפתחות החדשים של החשבון, ומה שהיה בו קודם נשמר 90 יום.',
  'startOverWait.title': 'חשבון Keyrook שלך מופעל מחדש ב־{date}',
  'startOverWait.body':
    'זה התבקש עם הקוד ש־Keyrook שלח לך באימייל, ממכשיר שקרא לעצמו “{device}”. אם זה לא היית אתה, מישהו יכול לקרוא את האימיילים שלך: בטל את זה עכשיו, ואז שנה את סיסמת האימייל שלך. אם זה היית אתה, השאר.',
  'startOverWait.bodyNoName':
    'זה התבקש עם הקוד ש־Keyrook שלח לך באימייל. אם זה לא היית אתה, מישהו יכול לקרוא את האימיילים שלך: בטל את זה עכשיו, ואז שנה את סיסמת האימייל שלך. אם זה היית אתה, השאר.',
  'startOverWait.cancel': 'ביטול ההפעלה מחדש',
  'kept.title': {
    one: 'נשמר מלפני הפעלת החשבון מחדש: פריט {count}',
    two: 'נשמרו מלפני הפעלת החשבון מחדש: {count} פריטים',
    other: 'נשמרו מלפני הפעלת החשבון מחדש: {count} פריטים',
  },
  'kept.body': 'עד {date}. הסיסמה הישנה של החשבון או מפתח השחזור הישן מחזירים אותם ל־Passhold.',
  'kept.open': 'החזרה',
  'kept.secret': 'סיסמת חשבון ישנה או מפתח שחזור ישן',
  'kept.done': {
    one: 'פריט {count} הוחזר.',
    two: '{count} פריטים הוחזרו.',
    other: '{count} פריטים הוחזרו.',
  },
  'kept.nothingNew': 'כל מה שנשמר כבר נמצא כאן.',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': 'המשך עם {provider}',
  'provider.passwordTitle': 'לחשבון Keyrook הזה יש סיסמה',
  'provider.passwordBody':
    'נכנסת עם {provider} בתור {email}. סיסמת החשבון היא מה שפותח את Passhold כאן: הקלד אותה פעם אחת.',
  'provider.openAccountPage': 'פתיחת account.keyrook.com',
  'secondStep.title': 'כניסה בשני שלבים',
  'secondStep.body':
    'הזן את הקוד בן 6 הספרות שאפליקציית האימות שלך מציגה עבור Keyrook. איבדת את האפליקציה? הקלד במקום את מפתח השחזור של החשבון.',
  'secondStep.ownerBody':
    'החשבון שלך דורש שלב שני גם עבור זה: הקוד שאפליקציית האימות שלך מציגה, או מפתח השחזור של החשבון.',
  'secondStep.field': 'קוד, או מפתח שחזור',
  'secondStep.continue': 'המשך',
  'secondStep.passkey': 'שימוש במפתח גישה במקום',
  'secondStep.nextBody':
    'מתן המפתח לחשבון דורש גם קוד, וכל קוד עובד רק פעם אחת. המתן עד שאפליקציית האימות שלך תציג קוד חדש, ואז הזן אותו – או את מפתח השחזור של החשבון.',
  'provider.or': 'או',
  'provider.signedInWith': 'מחובר עם {provider} בתור {email}',
  'provider.signedInWithNamed': 'מחובר עם {provider} בתור {name} ({email})',
  'provider.newTitle': 'יצירת חשבון Keyrook שלך',
  'provider.newBody':
    'אתה נכנס עם {provider} בתור {email}. לחשבון אין סיסמה: {provider} מכניס אותך. במחשב אחר, דפדפן שכבר מחובר מכניס אותך – או מפתח השחזור שתקבל אחר כך.',
  'provider.joinTitle': 'הכנסה של הדפדפן הזה',
  'provider.joinBody':
    '{email} מחובר כאן, אבל המפתח שפותח את פרטי הכניסה שלך נמצא במחשבים האחרים שלך. פתח את Passhold באחד מהם – הגדרות, חשבון וסנכרון – והכנס את הדפדפן הזה.',
  'provider.waiting': 'ממתין לדפדפן אחר…',
  'provider.compare': 'הדפדפן האחר מציג קוד. הכנס אותו שם רק אם זה זה:',
  'provider.ended': 'הבקשה הסתיימה לפני שדפדפן אחר הכניס את הדפדפן הזה.',
  'provider.askAgain': 'שאל שוב',
  'provider.useKit': 'שימוש במפתח השחזור במקום',
  'provider.useThisKey': 'שימוש במפתח הזה',
  'provider.needsRoot':
    '{email} נוצר ב־Keyrook Authenticator לפני שלכל אפליקציית Keyrook היה מפתח משלה. Passhold יכול לתת לו אחד עכשיו, אחרי שתאשר שוב עם {provider}; שום דבר ב־Authenticator לא משתנה.',
  'provider.confirmWith': 'אישור עם {provider}',
  'provider.noKeyYet':
    'Passhold עדיין לא נכנס ל־{email} בשום מקום, ולכן אף דפדפן אחר לא יכול להכניס את הדפדפן הזה. מפתח השחזור של החשבון פותח אותו.',
  'passkey.onLabel': 'מחשבים חדשים נפתחים עם מפתח הגישה שלך',
  'passkey.offLabel': 'אין מפתח גישה למחשבים חדשים',
  'passkey.body':
    'במחשב חדש: {provider}, ואז מפתח הגישה שלך – וכל פרטי הכניסה שם. מפתח הגישה, שנשמר במנהל הסיסמאות של Google, נמצא בכל Chrome שבו אתה נכנס.',
  'passkey.bodyEdge':
    'במחשב חדש: {provider}, ואז מפתח הגישה שלך – וכל פרטי הכניסה שם. כשהוא נשמר במקום שבו הוא מסתנכרן, מפתח הגישה נמצא גם במכשירים האחרים שלך.',
  'passkey.turnOn': 'הפעלה',
  'passkey.turnOff': 'כיבוי',
  'passkey.joinTitle': 'פתיחה עם מפתח הגישה שלך',
  'passkey.joinBody': 'ל־{email} יש מפתח גישה למחשבים חדשים. אשר איתו, ופרטי הכניסה שלך יורדים.',
  'passkey.use': 'שימוש במפתח גישה',
  'passkey.otherWays': 'דרכים אחרות להיכנס',
  'pairing.asking': '{device} מבקש להיכנס לחשבון שלך.',
  'pairing.start': 'הכנסה…',
  'pairing.notMe': 'לא אני',
  'pairing.compare': 'הכנס אותו רק אם הדפדפן החדש מציג את אותו קוד בדיוק:',
  'pairing.match': 'הקודים זהים – הכנס',
  'pairing.differ': 'הקודים שונים',

  'accountKit.title': 'שמירת מפתח השחזור של החשבון',
  'accountKit.body':
    'אם תשכח את סיסמת חשבון Keyrook שלך, המפתח הזה מגדיר אחת חדשה – עבור Passhold ו־Keyrook Authenticator כאחד. Keyrook אף פעם לא רואה את הסיסמה שלך, לכן זו הדרך היחידה. אתה יכול לראות אותו שוב בהגדרות; שמור אותו גם במקום אחר.',
  'accountKit.fileTitle': 'מפתח השחזור של חשבון Keyrook',
  'accountKit.fileBody':
    'אם תשכח את סיסמת חשבון Keyrook שלך, המפתח הזה מגדיר חדשה: ב־Passhold, הגדרות → חשבון וסנכרון → “שכחת את הסיסמה?”. מי שיש לו אותו ואת כתובת האימייל שלך יכול לעשות את אותו הדבר, לכן שמור אותו במקום בטוח ולא על המחשב הזה.',
  'accountKit.bodyNoPassword':
    'לחשבון שלך אין סיסמה: דפדפן שכבר מחובר מכניס חדש. אם לא נשאר אף אחד, המפתח הזה עושה זאת – עבור Passhold ו־Keyrook Authenticator כאחד. אתה יכול לראות אותו שוב בהגדרות; שמור אותו גם במקום אחר.',
  'accountKit.fileBodyNoPassword':
    'אם לא נשאר מחשב שמחובר לחשבון Keyrook שלך, המפתח הזה מכניס חדש: היכנס עם Google או GitHub, ואז בחר “שימוש במפתח השחזור במקום”. מי שיש לו אותו ויכול גם להיכנס בתורך יכול לעשות את אותו הדבר, לכן שמור אותו במקום בטוח ולא על המחשב הזה.',
  'accountKit.whenTitleNoPassword': 'כשאף מחשב לא מחובר',
  'accountKit.inPassholdNoPassword':
    'ב־Passhold: היכנס עם Google או GitHub, בחר “שימוש במפתח השחזור במקום”, והקלד את המפתח הזה.',
  'accountKit.keepNoPassword':
    'שמור את הדף הזה במקום בטוח, הרחק מהמחשב שלך. עם הדף הזה, מי שיכול להיכנס לחשבון Google או GitHub שלך יכול לפתוח את חשבון Keyrook שלך.',
  'accountKit.rowBodyNoPassword': 'מכניס מחשב חדש כשלא נשאר אחר שיעשה זאת.',
  'accountKit.sheetTitle': 'ערכת השחזור של חשבון Keyrook',
  'accountKit.whenTitle': 'כששוכחים את סיסמת החשבון',
  'accountKit.inPasshold':
    'ב־Passhold: הגדרות → חשבון וסנכרון → “שכחת את הסיסמה?”, ואז כתובת האימייל שלך, הקוד ש־Keyrook שולח באימייל, המפתח הזה וסיסמה חדשה.',
  'accountKit.inAuthenticator':
    'Keyrook Authenticator לוקח את אותו מפתח: “שכחת סיסמה?” במקום שבו הוא מבקש ממך להיכנס.',
  'accountKit.keep':
    'שמור את הדף הזה במקום בטוח, הרחק מהמחשב שלך. מי שיש לו אותו ואת תיבת האימיילים שלך יכול להגדיר סיסמה חדשה לחשבון.',
  'accountKit.pending': 'מפתח השחזור של החשבון לא נשמר',
  'accountKit.keptState': 'מפתח השחזור של החשבון נשמר',
  'accountKit.elsewhere': 'מפתח השחזור של החשבון נוצר במקום אחר',
  'accountKit.none': 'אין מפתח שחזור לחשבון',
  'accountKit.rowBody': 'מגדיר סיסמת חשבון חדשה אם שכחו את הישנה. מפתח חדש מפסיק את הישן לעבוד, בכל האפליקציות.',
  'accountKit.elsewhereBody':
    'נוצר ב־account.keyrook.com, ב־Keyrook Authenticator או בדפדפן אחר: המפתח שלו נמצא בדף ששמרו אז. יצירת אחד כאן מפסיקה את זה מלעבוד.',
  'accountKit.noneBody':
    'בלי אחד, אי אפשר לאפס סיסמת חשבון ששכחו, ואי אפשר לפתוח את מה ש־Keyrook שומר. פרטי הכניסה בדפדפן הזה נשארים בכל מקרה.',
  'accountKit.make': 'יצירת אחד',
  'accountKit.apart':
    'שמור אותו נפרד מהאימייל שלך: מי שיש לו את המפתח הזה ויכול לקרוא את האימייל שלך יכול להגדיר סיסמה חדשה ולפתוח את פרטי הכניסה שלך. אל תשלח אותו לעצמך באימייל, ואל תשמור אותו בכונן הענן של אותו אימייל.',
  'accountKit.apartNoPassword':
    'שמור אותו נפרד מחשבון Google או GitHub שבו אתה נכנס: מי שיש לו את המפתח הזה ויכול להיכנס שם בתורך יכול לפתוח את פרטי הכניסה שלך. אל תשלח אותו לעצמך באימייל, ואל תשמור אותו בכונן הענן של אותו חשבון.',
  'accountKit.unchecked': 'מפתח השחזור של החשבון עדיין לא נבדק',
  'accountKit.uncheckedBody':
    'לחשבון שלך יש מפתח שחזור, שנוצר ב־account.keyrook.com או באפליקציה אחרת. הקלד אותו פעם אחת: Passhold בודק שהוא פותח את החשבון שלך, ושומר אותו כדי להציג לך שוב.',
  'accountKit.typeIt': 'הקלדה',
  'accountKit.checked': 'הוא פותח את החשבון שלך. Passhold שומר אותו עכשיו, כדי להציג לך שוב כאן.',
  'accountKit.draftBody':
    'מפתח השחזור החדש של החשבון שלך. הוא עדיין לא עובד: אחרי ששמרת אותו והקלדת אותו בחזרה, סיסמת החשבון שלך מגדירה אותו, והישן מפסיק לעבוד.',
  'accountKit.setTitle': 'הגדרת מפתח השחזור החדש שלך',
  'accountKit.setBody':
    'הקלד את סיסמת חשבון Keyrook שלך. עד אז מפתח השחזור הישן שלך עדיין עובד, והחדש לא.',
  'accountKit.set': 'הגדרה',
  'checkup.clear': 'אין מה לתקן',
  'checkup.clearBody': 'אין סיסמאות חלשות או בשימוש חוזר, והגיבוי שלך עדכני.',
  'checkup.issues': { one: '{count} דבר לבדוק', two: '{count} דברים לבדוק', other: '{count} דברים לבדוק' },
  'checkup.issuesBody': 'כל אחד למטה אומר למה זה חשוב ואיך לתקן אותו.',
  'checkup.backup': 'גיבוי',
  'checkup.access': 'כניסה',
  'checkup.recoveryPending':
    'מפתח השחזור שנוצר לכספת הזו מעולם לא אושר כשמור, והוא הדרך היחידה להיכנס אם {method} יפסיק לעבוד. צור חדש, ושמור אותו.',
  'checkup.deviceMissing':
    'לכספת הזו אין סיסמה ראשית, ולכן בלי {method} כאן כל פתיחה מבקשת את מפתח השחזור.',
  'checkup.lastBackup': 'גיבוי אחרון ב־{date}',
  'checkup.backupNever':
    'אם הדפדפן הזה ילך לאיבוד, כך גם פרטי הכניסה שלך. גיבוי הוא קובץ מוצפן אחד לשמור במקום אחר.',
  'checkup.backupDue': 'הכספת שלך השתנתה מאז. צור גיבוי חדש כדי שיכיל הכול.',
  'checkup.backUp': 'גיבוי עכשיו',
  'checkup.weak': { one: 'סיסמה חלשה {count}', two: '{count} סיסמאות חלשות', other: '{count} סיסמאות חלשות' },
  'checkup.weakBody':
    'קצרה או פשוטה מספיק כדי לנחש. שנה כל אחת באתר שלה; Passhold מציע סיסמה חזקה בטופס ומציע לשמור אותה.',
  'checkup.weakNone': 'אין.',
  'checkup.reused': {
    one: 'סיסמה {count} בשימוש יותר מפעם אחת',
    two: '{count} סיסמאות בשימוש יותר מפעם אחת',
    other: '{count} סיסמאות בשימוש יותר מפעם אחת',
  },
  'checkup.reusedBody':
    'כשאתר אחד מדליף סיסמה, אנשים מנסים אותה בכל מקום אחר. תן לכל פרט כניסה משלו.',
  'checkup.reusedNone': 'אין: לכל פרט כניסה יש סיסמה משלו.',
  'checkup.sharedBy': {
    one: 'משותפת על ידי {count} פרט כניסה',
    two: 'משותפת על ידי {count} פרטי כניסה',
    other: 'משותפת על ידי {count} פרטי כניסה',
  },
  'checkup.change': 'שינוי',
  'checkup.limits':
    'Passhold לא בודק אם סיסמה הופיעה בדליפת נתונים: זה דורש לשאול שרת, ו־Passhold לא שואל אף אחד. הוא גם לא מטריד בגלל סיסמאות ישנות – סיסמה חזקה וייחודית לא מתבלה.',

  'backup.description': 'שמירת עותק מוצפן, החזרת אחד, או העברת פרטי כניסה פנימה והחוצה.',
  'backup.backupRow': 'כל הכספת שלך בקובץ מוצפן אחד, תחת הסיסמה הראשית שלך.',
  'backup.restoreRow': 'הוספת פרטי הכניסה מקובץ גיבוי לכספת הזו.',
  'backup.importRow': 'מדפדפן או מנהל סיסמאות אחר, כקובץ CSV, או JSON של Bitwarden.',
  'backup.exportRow': 'קובץ CSV שאפליקציות אחרות יכולות לקרוא. לא מוצפן.',

  'security.description': 'איך Passhold נפתח, ומתי הוא ננעל שוב.',
  'security.locking': 'נעילה',
  'security.opensTitle': 'איך Passhold נפתח',
  'security.opensBody': 'בלי סיסמה ראשית: {method} פותח אותו, ומפתח השחזור כש־{method} לא יכול.',
  'security.setPassword': 'שימוש בסיסמה ראשית במקום',
  'security.setPasswordBody':
    'אז Passhold נפתח עם סיסמה שתבחר, ומפתח השחזור מפסיק לפתוח אותו.',
  'security.setPasswordOpen': 'הגדרה',
  'security.setPasswordSave': 'שימוש בסיסמה הזו',
  'security.dropPassword': 'הפסקת השימוש בסיסמה ראשית',
  'security.dropPasswordBody':
    'פתיחה עם {method} בלבד, ושמירת מפתח שחזור ליום שבו זה לא יעבוד. הסיסמה הראשית מפסיקה לפתוח את הכספת.',
  'security.dropPasswordOpen': 'מעבר',
  'security.dropPasswordSave': 'מעבר והצגת מפתח השחזור',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'נעילת המסך של המכשיר שלך',
  'device.method.passkey': 'מפתח הגישה שלך',
  'device.title': 'פתיחה עם {method}',
  'device.description': 'הדרך המהירה ביותר להיכנס, והיא ממשיכה לעבוד אחרי הפעלה מחדש של הדפדפן.',
  'device.on': 'פעיל',
  'device.off': 'כבוי',
  'device.body':
    'טביעת האצבע או הפנים שלך פותחים את Passhold – או, ברוב המחשבים, הסיסמה של המחשב עצמו. כך שכל מי שיכול לפתוח את המחשב הזה יכול לפתוח את Passhold. מה שנפתח נשאר במחשב הזה, חסר תועלת בלעדיו.',
  'device.whereMac':
    'כש־Chrome שואל איפה לשמור את מפתח הגישה, בחר במנהל הסיסמאות של Google. מפתח גישה בפרופיל Chrome שלך לא יכול לפתוח את Passhold, וגם מחזיק המפתחות של iCloud בכל Mac לא יכול.',
  'device.whereMacEdge':
    'כש־Edge שואל איפה לשמור את מפתח הגישה, בחר מקום שמשמר אותו גם במכשירים האחרים שלך. לא כל מקום יכול לפתוח את Passhold: אם המקום שתבחר לא יכול, Passhold יאמר זאת, ושום דבר לא ישתנה.',
  'device.unavailable': 'לא זמין כאן',
  'device.unavailableBody':
    'הדפדפן הזה לא מצא טביעת אצבע, פנים או נעילת מסך ש־Passhold יכול להשתמש בהם. ה־PIN עובד בכל מקום.',
  'device.unavailableRecovery':
    'הדפדפן הזה לא מצא טביעת אצבע, פנים או נעילת מסך ש־Passhold יכול להשתמש בהם, ולכן כאן הכספת הזו נפתחת עם מפתח השחזור שלה. הגדר סיסמה ראשית אם אתה מעדיף להקליד אותה.',
  'device.opensWith': '{method} פותח את Passhold',
  'device.notHere': '{method} לא מוגדר בדפדפן הזה',
  'device.isTheWayIn':
    'בלי סיסמה ראשית, כך Passhold נפתח. כדי לכבות את זה, הגדר קודם סיסמה ראשית.',
  'device.setUpHere': 'עד ש־{method} יוגדר כאן, כל פתיחה מבקשת את מפתח השחזור.',
  'device.setUp': 'הגדרה',
  'device.turnOff': 'כיבוי',
  'device.save': 'הגדרת {method}',
  'keys.title': 'פתיחה עם מפתח אבטחה',
  'keys.description':
    'מפתח USB שאתה מחבר: דרך נוספת להיכנס, והוא ממשיך לעבוד אחרי הפעלה מחדש של הדפדפן.',
  'keys.method': 'מפתח האבטחה שלך',
  'keys.on': { one: 'מפתח {count} מוגדר', two: '{count} מפתחות מוגדרים', other: '{count} מפתחות מוגדרים' },
  'keys.off': 'אין מפתח מוגדר',
  'keys.body':
    'חבר את המפתח, הקלד את ה־PIN שלו ונגע בו, ו־Passhold נפתח – רק במחשב הזה. מי שיש לו את המפתח ויודע את ה־PIN שלו יכול לפתוח את Passhold כאן, לכן שמור אותו כמו מפתח של הבית. אם הוא ילך לאיבוד, הסר אותו כאן: הדרכים האחרות להיכנס ממשיכות לעבוד.',
  'keys.add': 'הוספת מפתח',
  'keys.save': 'הוספת המפתח הזה',
  'keys.one': 'מפתח אבטחה',
  'keys.added': 'נוסף ב־{date}',
  'keys.remove': 'הסרה',
  'pin.title': 'פתיחה עם PIN',
  'pinOffer.title': 'פתח את Passhold מהר יותר עם PIN',
  'pinOffer.body':
    'הקלד כמה ספרות במקום הסיסמה שלך בכל פעם ש־Passhold ננעל, עד שהדפדפן ייסגר. אחרי שהדפדפן יופעל שוב, הסיסמה שלך פעם אחת.',
  'pinOffer.later': 'אתה יכול להגדיר אחד או לכבות אותו בכל עת בהגדרות, אבטחה.',
  'pin.description': 'למספר הפעמים הרב ביום ש־Passhold ננעל בזמן שאתה ליד אותו דפדפן.',
  'pin.on': 'פעיל',
  'pin.off': 'כבוי',
  'pin.bodyRecovery':
    'עובד רק כל עוד הדפדפן פתוח, ורק עם חמישה ניסיונות שגויים: אחר כך, או אחרי הפעלה מחדש, נדרשים המכשיר או מפתח השחזור. שום דבר שה־PIN פותח לא נשמר בדיסק.',
  'pin.body':
    'עובד רק כל עוד הדפדפן פתוח, ורק עם חמישה ניסיונות שגויים: אחר כך, או אחרי הפעלה מחדש, נדרשת הסיסמה הראשית. שום דבר שה־PIN פותח לא נשמר בדיסק.',
  'pin.setUp': 'הגדרת PIN',
  'pin.change': 'שינוי',
  'pin.turnOff': 'כיבוי',
  'pin.new': 'PIN, 6 עד 12 ספרות',
  'pin.again': 'הקלד שוב',
  'pin.save': 'שמירת PIN',

  'general.description': 'איך Passhold מתנהג באתרים, ואיך הוא נראה.',
  'general.filling': 'מילוי ושמירה',
  'general.appearance': 'שפה ומראה',
  'settings.autoSuggest': 'הצג הצעות כשאתה לוחץ על שדה כניסה, כרטיס או כתובת',
  'settings.autoSuggestBody':
    'פרטי הכניסה שלך לאתר, סיסמה חזקה בטופס הרשמה, הכרטיסים והכתובות שלך בקופה. שום דבר לא מתמלא עד שאתה בוחר.',

  'trash.description':
    'פרטי כניסה, כרטיסים, כתובות והערות ממתינים כאן עד שתשחזר אותם או תמחק אותם לגמרי.',
  'trash.sharedDescription':
    'משותף עם המשפחה: כל מי שבה יכול לשחזר אותם. נמחקו לגמרי, הם נעלמים מכולם.',
  'trash.sharedMember':
    'משותף עם המשפחה: אתה יכול לשחזר אותם. רק מארגן/ת של המשפחה מוחק/ת אותם לגמרי.',
  'settings.autoLock': 'נעילה אחרי',
  'settings.autoLock.never': 'רק כשהדפדפן נסגר',
  'settings.autoLock.minutes': { one: 'דקה אחת', two: 'שתי דקות', other: '{count} דקות' },
  'settings.autoLock.hours': { one: 'שעה אחת', two: 'שעתיים', other: '{count} שעות' },
  'settings.lockWithSystem': 'נעילה כשהמחשב ננעל או נכנס למצב שינה',
  'settings.clipboard': 'מחיקת סיסמאות שהועתקו אחרי',
  'settings.clipboard.never': 'אף פעם',
  'settings.clipboard.seconds': { one: 'שנייה אחת', two: 'שתי שניות', other: '{count} שניות' },
  'settings.clipboard.minutes': { one: 'דקה אחת', two: 'שתי דקות', other: '{count} דקות' },
  'settings.inlineButton': 'הצג את כפתור Passhold בשדות כניסה, כרטיס וכתובת',
  'settings.offerToSave': 'הצע לשמור פרטי כניסה כשאתה נכנס',
  'settings.offerToSaveCards': 'הצע לשמור כרטיסים וכתובות כשאתה משלם',
  'settings.offerToSaveCardsBody':
    'כרטיס רק מדף מאובטח (https), ורק כזה שהמספר שלו מסתדר. הוא מוצג לפי ארבע הספרות האחרונות, לעולם לא לפי המספר או הקוד שלו.',
  'settings.passkeys': 'שמירה ושימוש במפתחות גישה',
  'settings.passkeysBody':
    'כשאתר מציע מפתח גישה, Passhold שומר אותו עם פרטי הכניסה שלך ונכנס בעזרתו. כשכבוי, מפתחות הגישה נשארים לדפדפן.',
  'settings.language': 'שפה',
  'settings.language.auto': 'כמו הדפדפן',
  'settings.theme': 'מראה',
  'settings.theme.system': 'כמו המערכת',
  'settings.theme.light': 'בהיר',
  'settings.theme.dark': 'כהה',

  'settings.security': 'סיסמה ראשית',
  'settings.securityBody': 'שינוי שלה נועל מחדש את המפתח לכספת שלך; פרטי הכניסה שלך נשארים כמו שהם.',
  'settings.current': 'הסיסמה הראשית הנוכחית',
  'settings.new': 'סיסמה ראשית חדשה',
  'settings.confirm': 'הקלד שוב את החדשה',
  'settings.change': 'שינוי סיסמה ראשית',
  'settings.changeOpen': 'שינוי',
  'settings.changed': 'הסיסמה הראשית שונתה.',

  'settings.backup': 'גיבוי',
  'settings.backupBody':
    'כל הכספת שלך בקובץ מוצפן אחד. שמור אותו במקום אחר מהמחשב הזה – כונן USB, אחסון הענן שלך – כדי שאובדן הדפדפן הזה לא יעלה לך בפרטי הכניסה. הוא נפתח רק עם הסיסמה הראשית שהייתה לך כשיצרת אותו.',
  'settings.backupBodyRecovery':
    'כל הכספת שלך בקובץ מוצפן אחד. שמור אותו במקום אחר מהמחשב הזה – כונן USB, אחסון הענן שלך – כדי שאובדן הדפדפן הזה לא יעלה לך בפרטי הכניסה. הוא נפתח עם מפתח השחזור שלך.',
  'settings.backupLast': 'גיבוי אחרון: {date}',
  'settings.backupNever': 'עדיין אין גיבוי.',
  'settings.backupButton': 'הורדת גיבוי',
  'settings.backupDone': 'נשמר בהורדות שלך. עכשיו העבר אותו למקום אחר מהמחשב הזה.',

  'settings.restoreBackup': 'שחזור מגיבוי',
  'settings.restoreBodyNew':
    'עדיין אין כספת בדפדפן הזה. החזר את שלך מקובץ גיבוי – הוא ייפתח עם הסיסמה הראשית שבה נוצר הגיבוי – או צור חדשה מכפתור Passhold בסרגל הכלים.',
  'settings.restoreBodyMerge':
    'מוסיף לכספת את מה שיש בגיבוי. שום דבר כאן לא נמחק: כשלשניהם יש את אותם פרטי כניסה, נשמרת העריכה החדשה יותר, והסיסמה השנייה עוברת להיסטוריה שלו.',
  'settings.restoreChoose': 'בחירת קובץ גיבוי',
  'settings.restoreMade': 'גיבוי שנוצר ב־{date}',
  'settings.restorePassword': 'הסיסמה הראשית של הגיבוי',
  'settings.restoreRecoveryKey': 'מפתח השחזור של הגיבוי',
  'settings.restoreButton': 'שחזור',
  'settings.restoreNew': {
    one: 'הכספת שוחזרה, עם פריט {count}.',
    two: 'הכספת שוחזרה, עם {count} פריטים.',
    other: 'הכספת שוחזרה, עם {count} פריטים.',
  },
  'settings.restoreAdded': {
    one: 'נוסף פריט {count} מהגיבוי.',
    two: 'נוספו {count} פריטים מהגיבוי.',
    other: 'נוספו {count} פריטים מהגיבוי.',
  },
  'settings.restoreUpdated': {
    one: 'לפריט {count} הייתה עריכה חדשה יותר בגיבוי.',
    two: 'ל־{count} פריטים הייתה עריכה חדשה יותר בגיבוי.',
    other: 'ל־{count} פריטים הייתה עריכה חדשה יותר בגיבוי.',
  },
  'settings.restoreNothing': 'הכול בגיבוי כבר נמצא בכספת הזו.',

  'settings.import': 'ייבוא',
  'settings.importBody':
    'הבא את הסיסמאות שלך מ־Chrome, Edge, Firefox, Safari, Apple Passwords, Bitwarden, 1Password, LastPass, KeePass, Dashlane, Proton Pass או NordPass: ייצא אותן שם כקובץ CSV, ואז בחר אותו כאן. כרטיסים, כתובות והערות שבקובץ מגיעים גם הם. מ־Bitwarden ייצא כ־JSON (לא מוצפן): ה־CSV שלו משמיט כרטיסים, זהויות ומפתחות גישה. Dashlane שם אותם בקבצים משלו: בחר כל אחד בתורו.',
  'settings.importChoose': 'בחירת קובץ',
  'settings.importFound': 'נמצא לייבוא: {what}.',
  'settings.importLogins': { one: 'פרט כניסה {count}', two: '{count} פרטי כניסה', other: '{count} פרטי כניסה' },
  'settings.importPasskeys': { one: 'מפתח גישה {count}', two: '{count} מפתחות גישה', other: '{count} מפתחות גישה' },
  'settings.importCards': { one: 'כרטיס {count}', two: '{count} כרטיסים', other: '{count} כרטיסים' },
  'settings.importAddresses': { one: 'כתובת {count}', two: '{count} כתובות', other: '{count} כתובות' },
  'settings.importNotes': { one: 'הערה {count}', two: '{count} הערות', other: '{count} הערות' },
  'settings.importSkipped': {
    one: 'רשומה {count} לא מכילה כלום ש־Passhold שומר, והיא מושמטת.',
    two: '{count} רשומות לא מכילות כלום ש־Passhold שומר, והן מושמטות.',
    other: '{count} רשומות לא מכילות כלום ש־Passhold שומר, והן מושמטות.',
  },
  'settings.importDuplicates': {
    one: '{count} כבר נמצא בכספת שלך.',
    two: '{count} כבר נמצאים בכספת שלך.',
    other: '{count} כבר נמצאים בכספת שלך.',
  },
  'settings.importConfirm': 'ייבוא',
  'settings.importDone': 'יובא: {what}.',
  'settings.importDelete': 'עכשיו מחק את קובץ ה־CSV: הוא מכיל את הסיסמאות שלך בטקסט גלוי.',
  'settings.importNothing': 'אין מה חדש לייבא בקובץ הזה.',
  'settings.importTwoFactor': {
    one: 'לפרט כניסה {count} בקובץ הזה יש קוד אימות דו־שלבי (2FA). Passhold לא שומר קודי 2FA: העבר אותו לאפליקציית אימות לפני שתמחק את מנהל הסיסמאות הישן שלך, אחרת אולי תינעל מחוץ לחשבון ההוא.',
    two: 'ל־{count} פרטי כניסה בקובץ הזה יש קודי אימות דו־שלבי (2FA). Passhold לא שומר קודי 2FA: העבר אותם לאפליקציית אימות לפני שתמחק את מנהל הסיסמאות הישן שלך, אחרת אולי תינעל מחוץ לחשבונות האלה.',
    other:
      'ל־{count} פרטי כניסה בקובץ הזה יש קודי אימות דו־שלבי (2FA). Passhold לא שומר קודי 2FA: העבר אותם לאפליקציית אימות לפני שתמחק את מנהל הסיסמאות הישן שלך, אחרת אולי תינעל מחוץ לחשבונות האלה.',
  },
  'settings.importAuthenticator': 'קבלת Keyrook Authenticator',
  'settings.importPasskeysLeft': {
    one: 'מפתח גישה {count} בקובץ הזה לא יכול להגיע ל־Passhold. השאר את מנהל הסיסמאות הישן עד שתיכנס לאתר בדרך אחרת ותיצור מפתח גישה חדש ב־Passhold.',
    two: '{count} מפתחות גישה בקובץ הזה לא יכולים להגיע ל־Passhold. השאר את מנהל הסיסמאות הישן עד שתיכנס לאתרים האלה בדרך אחרת ותיצור מפתחות גישה חדשים ב־Passhold.',
    other:
      '{count} מפתחות גישה בקובץ הזה לא יכולים להגיע ל־Passhold. השאר את מנהל הסיסמאות הישן עד שתיכנס לאתרים האלה בדרך אחרת ותיצור מפתחות גישה חדשים ב־Passhold.',
  },

  'settings.export': 'ייצוא',
  'settings.exportBody':
    'קובץ CSV שכל דפדפן ומנהל סיסמאות יכולים לקרוא. הוא מכיל את הסיסמאות שלך בטקסט גלוי: שמור אותו רק כל עוד אתה צריך אותו. הוא מכיל פרטי כניסה בלבד: מפתחות גישה, שדות מותאמים, תיקיות, כרטיסים, כתובות והערות לא נכללים בו. גיבוי שומר הכול.',
  'settings.exportButton': 'ייצוא CSV',
  'settings.exportDone': 'יוצא. מחק את הקובץ כשתסיים לעבוד איתו.',

  'settings.neverSave': 'אף פעם אל תציע לשמור',
  'settings.neverSaveEmpty':
    'אין אתרים. בחר “אף פעם לאתר הזה” כש־Passhold מציע לשמור, והוא יופיע כאן.',
  'settings.remove': 'הסרה',

  'settings.trash': 'סל המיחזור',
  'settings.trashEmpty': 'סל המיחזור ריק.',
  'settings.restore': 'שחזור',
  'settings.deleteForever': 'מחיקה לצמיתות',
  'settings.emptyTrash': 'ריקון סל המיחזור',
  'settings.emptyTrashConfirm': 'למחוק לצמיתות הכול מסל המיחזור?',

  'settings.danger': 'הסרת כספת',
  'settings.dangerBody':
    'מוחק את הכספת מהדפדפן הזה. כל פרט כניסה שבה נעלם לצמיתות – הורד גיבוי קודם אם אתה רוצה לשמור אותם.',
  'settings.dangerType': 'הקלד {word} לאישור',
  'settings.dangerWord': 'מחק',
  'settings.dangerButton': 'הסרת כספת',

  'settings.about': 'Passhold {version} · מאת Keyrook',

  // Errors
  'error.noWorker': 'Passhold לא הגיב. סגור את זה ונסה שוב.',
  'error.wrongPassword': 'זו לא הסיסמה הראשית.',
  'error.passwordTooShort': 'יש להשתמש בלפחות {min} תווים.',
  'error.vaultCorrupt': 'הכספת במכשיר הזה פגומה ואי אפשר לפתוח אותה.',
  'error.vaultTooNew': 'הכספת הזו נוצרה על ידי Passhold חדש יותר. עדכן את Passhold כדי לפתוח אותה.',
  'error.itemNotFound': 'זה כבר לא בכספת.',
  'error.familyOrganiserOnly': 'רק מארגן/ת של המשפחה יכול/ה לרוקן את סל המיחזור של הכספת הזו.',
  'error.familyGone': 'המשפחה הזו כבר לא כאן. סנכרן, ואז בדוק שוב.',
  'error.familyNotOpen': 'Passhold עדיין לא יכול לפתוח את המשפחה הזו בדפדפן הזה. סנכרן, ואז נסה שוב.',
  'error.itemInvalid': 'אי אפשר לשמור את זה כמו שזה.',
  'error.importEmpty': 'הקובץ הזה לא מכיל כלום לייבוא.',
  'error.importTooLarge': 'הקובץ הזה גדול מדי לייבוא.',
  'error.importUnknownFormat': 'הקובץ הזה לא נראה כמו ייצוא סיסמאות.',
  'error.importEncrypted':
    'ייצוא ה־Bitwarden הזה מוצפן, ו־Passhold לא יכול לפתוח אותו. ייצא שוב מ־Bitwarden כ־“.json”, לא כ־“.json (Encrypted)”, ואז בחר את הקובץ הזה.',
  'error.backupInvalid': 'הקובץ הזה אינו גיבוי של Passhold, או שהוא פגום.',
  'error.backupWrongPassword': 'זו לא הסיסמה הראשית שבה נוצר הגיבוי הזה.',
  'error.backupWrongRecoveryKey': 'זה לא מפתח השחזור שבו נוצר הגיבוי הזה.',
  'error.noRecoveryKey': 'לכספת הזו אין מפתח שחזור להציג: היא נפתחת עם סיסמה ראשית.',
  'error.wrongRecoveryKey': 'זה לא מפתח השחזור.',
  'error.deviceNeeded':
    'כספת בלי סיסמה ראשית נפתחת עם פתיחת המכשיר הזה: הגדר אותה קודם. היא נשארת עד שמגדירים סיסמה ראשית.',
  'error.accountOffline': 'לא ניתן להגיע ל־Keyrook. בדוק את החיבור ונסה שוב.',
  'error.accountWrong':
    'אימייל או סיסמה שגויים. חשבון שנוצר עם Google או GitHub נכנס בעזרת הכפתור שלו.',
  'error.accountSignedOut': 'Keyrook התנתק מהדפדפן הזה. היכנס שוב.',
  'error.accountBusy': {
    one: 'יותר מדי ניסיונות. המתן שנייה אחת ונסה שוב.',
    two: 'יותר מדי ניסיונות. המתן {count} שניות ונסה שוב.',
    other: 'יותר מדי ניסיונות. המתן {count} שניות ונסה שוב.',
  },
  'error.accountFailed': 'Keyrook לא הצליח לבצע את זה כרגע. נסה שוב מאוחר יותר.',
  'error.accountAlready': 'הכספת הזו כבר מחוברת לחשבון Keyrook.',
  'error.accountNone': 'הכספת הזו אינה מחוברת לחשבון Keyrook.',
  'error.accountKdfRefused':
    'Keyrook ביקש מפתח חלש יותר ממה ש־Passhold מקבל, ולכן הכניסה הופסקה.',
  'error.accountKeyWrong': 'המפתח של החשבון לא נפתח עם הסיסמה הזו.',
  'error.accountCode': 'הקוד שגוי, או שפג תוקפו. בדוק את האימייל, או בקש קוד חדש.',
  'error.accountMail': 'Keyrook לא הצליח לשלוח את האימייל כרגע. נסה שוב בעוד דקה.',
  'error.providerDenied': 'הכניסה בוטלה.',
  'error.providerFailed': 'Google או GitHub לא הצליחו להכניס אותך כרגע. נסה שוב.',
  'error.providerExpired': 'הכניסה הזו הסתיימה. התחל מחדש.',
  'error.providerNotOwner':
    'זה לא החשבון שבו חשבון Keyrook הזה נכנס. היכנס שוב עם זה שאתה משתמש בו עבור Keyrook.',
  'error.signOutUnsent': {
    one: 'פריט {count} עדיין לא הגיע לחשבון Keyrook שלך, ולכן שום דבר לא הוסר. בדוק את החיבור, או היכנס שוב, ואז התנתק.',
    two: '{count} פריטים עדיין לא הגיעו לחשבון Keyrook שלך, ולכן שום דבר לא הוסר. בדוק את החיבור, או היכנס שוב, ואז התנתק.',
    other: '{count} פריטים עדיין לא הגיעו לחשבון Keyrook שלך, ולכן שום דבר לא הוסר. בדוק את החיבור, או היכנס שוב, ואז התנתק.',
  },
  'error.providerOtherProvider':
    'לכתובת האימייל הזו כבר יש חשבון Keyrook שנכנס עם האחר מבין Google ו־GitHub. היכנס עם החשבון ההוא.',
  'error.providerHasPassword':
    'לכתובת האימייל הזו כבר יש חשבון Keyrook עם סיסמה. היכנס כאן עם האימייל והסיסמה שלך – או, כדי להיכנס גם עם Google או GitHub, הוסף אותו ב־account.keyrook.com, כשאתה מחובר שם עם הסיסמה שלך.',
  'error.providerEmailTaken':
    'לכתובת האימייל הזו כבר יש חשבון Keyrook שנכנס בדרך אחרת. היכנס בדרך הזו – או הוסף אליו את החשבון הזה ב־account.keyrook.com, כשאתה מחובר שם בדרך שבה הוא נכנס כעת.',
  'error.pairingWrongKey':
    'מה שחזר אינו המפתח של החשבון הזה, ולכן הוא נדחה. בקש שוב, והכנס רק מדפדפן שאתה מכיר.',
  'error.pairingRefused':
    'זה לא הגיע מהדפדפן שאת הקוד שלו בדקת, ולכן זה נדחה. בקש שוב.',
  'error.pairingEnded': 'הבקשה הסתיימה. בקש שוב מהדפדפן החדש.',
  'error.passkeyWrong': 'מפתח הגישה הזה לא פותח את החשבון הזה. נסה דרך אחרת להיכנס.',
  'error.joinExpired': 'הכניסה הזו חיכתה יותר מדי זמן. היכנס שוב.',
  'error.accountPasswordWrong': 'זו לא סיסמת החשבון.',
  'error.accountNoKit': 'Passhold לא מחזיק את מפתח השחזור של החשבון הזה.',
  'error.accountKitRace':
    'אפליקציה אחרת שינתה זה עתה את מפתח השחזור של החשבון. סנכרן, ואז נסה שוב.',
  'error.accountKitShape': 'זה לא נראה כמו מפתח שחזור לחשבון: הוא בן 32 אותיות וספרות.',
  'error.accountKitWrong': 'מפתח השחזור הזה לא מתאים לחשבון עם כתובת האימייל הזו.',
  'error.accountKitNotThis': 'זה לא מפתח השחזור של החשבון הזה. בדוק שוב את מה ששמרת.',
  'error.accountPasswordWeak':
    'קל מדי לניחוש עבור חשבון: השתמש בסיסמה ארוכה יותר עם שילוב של אותיות, ספרות וסמלים, או בארבע או חמש מילים לא קשורות.',
  'error.accountBoxWrong':
    'המפתח של Passhold בחשבון הזה לא נפתח. היכנס שוב; ואם עדיין לא יפתח, הפעל את החשבון מחדש.',
  'error.accountCodeWait': {
    one: 'קוד נשלח לפני רגע. תוכל לבקש אחר בעוד שנייה אחת.',
    two: 'קוד נשלח לפני רגע. תוכל לבקש אחר בעוד {count} שניות.',
    other: 'קוד נשלח לפני רגע. תוכל לבקש אחר בעוד {count} שניות.',
  },
  'error.accountSignUpKeys':
    'Keyrook ביקש את המפתח של Passhold עצמו, ולא נשלח אחד. עדכן את Passhold ונסה שוב.',
  'error.accountIdTaken': 'לא ניתן היה ליצור את החשבון כרגע. בקש קוד חדש ונסה שוב.',
  'error.accountNoRoot':
    'לחשבון הזה עדיין אין מפתח שמפתח שחזור יכול לפתוח. היכנס שוב עם הסיסמה שלו.',
  'error.accountRootNotHeld':
    'המחשב הזה לא הצליח להראות שיש לו את המפתח של החשבון. היכנס שוב עם הסיסמה או מפתח השחזור.',
  'error.accountRootChanged':
    'המפתחות של החשבון הזה הוחלפו במחשב אחר. היכנס במחשב שבו Passhold עדיין מחובר, או הפעל את החשבון מחדש.',
  'error.accountKeyReplaced': 'המפתח של Passhold בחשבון הזה הוחלף במחשב אחר. היכנס שוב.',
  'error.accountSessionStolen':
    'המחשב הזה התנתק כי השתמשו בהפעלה שלו ממקום אחר. היכנס שוב.',
  'error.accountOld':
    'החשבון הזה נוצר עם Google או GitHub לפני שלכל אפליקציית Keyrook היה מפתח משלה, ואף דבר בו לא פותח את Passhold עדיין. הפעל את החשבון מחדש עם כתובת האימייל שלו כדי לתת לו אחד.',
  'error.pairingBusy': 'יותר מדי דפדפנים מחכים להצטרף לחשבון הזה. נסה שוב בעוד כמה דקות.',
  'error.startOverExpired': 'זה פג. בקש קוד חדש והתחל מחדש.',
  'error.startOverTooOften': 'החשבון הזה הופעל מחדש יותר מדי פעמים לאחרונה. נסה שוב אחרי {day}.',
  'error.startOverWaiting':
    'החשבון הזה מופעל מחדש ב־{day}. דפדפן שעדיין מחובר אליו יכול לבטל זאת.',
  'error.startOverUpdate':
    'Keyrook מחכה עכשיו שבוע לפני שמפעיל חשבון מחדש. עדכן את Passhold כדי לבקש זאת.',
  'error.passkeyFailed': 'מפתח הגישה הזה לא ניתן לאימות. נסה שוב.',
  'error.passkeyNotYou':
    'מפתח הגישה הזה לא אישר שזה אתה. נסה שוב, ופתח אותו כפי שהוא מבקש.',
  'error.passkeyUnknown':
    'מפתח הגישה הזה אינו בשום חשבון Keyrook. ייתכן שהוסר: היכנס עם הסיסמה, או עם Google או GitHub.',
  'error.passkeyExpired': 'בקשת מפתח הגישה הסתיימה. נסה שוב.',
  'error.passkeyNotOffered': 'Keyrook עדיין לא מציע מפתחות גישה כאן.',
  'error.passkeyNoUnlock':
    'מפתח הגישה הזה נכנס, אבל עדיין לא מוגדר לפתוח את החשבון שלך. ב־account.keyrook.com, תחת “Passkeys”, בחר “Let it unlock” לידו, ואז נסה שוב. או היכנס עם הסיסמה, או עם Google או GitHub.',
  'error.passkeyNoPrf':
    'המפתח הזה נכנס ל־account.keyrook.com, אבל במקום שבו הוא שמור הוא לא יכול לפתוח את החשבון שלך – מחזיק המפתחות של iCloud לפני macOS 15, למשל, לא יכול. ב־account.keyrook.com, תחת “Passkeys”, הוסף אחד שנשמר במקום שבו הוא יכול, כמו מפתח אבטחה, ובדוק שכתוב לידו “Unlocks your data”. עד אז, היכנס עם הסיסמה, או עם Google או GitHub.',
  'error.passkeyPermission':
    'Passhold צריך את ההרשאה של Chrome להשתמש במפתחות הגישה של account.keyrook.com. בחר את מפתח הגישה שוב ואשר אותו.',
  'error.passkeyPermissionEdge':
    'Passhold צריך את ההרשאה של Edge להשתמש במפתחות הגישה של account.keyrook.com. בחר את מפתח הגישה שוב ואשר אותו.',
  'error.passkeyCancelled': 'לא נעשה שימוש במפתח גישה. נסה שוב, או היכנס בדרך אחרת.',
  'error.secondStepNeeded': 'החשבון שלך דורש שלב שני: הזן גם את הקוד מאפליקציית האימות שלך.',
  'error.secondStepWrong':
    'הקוד שגוי. הזן את הקוד שאפליקציית האימות שלך מציגה עכשיו, או את מפתח השחזור שלך.',
  'error.signInExpired': 'הכניסה הזו פגה. היכנס שוב.',
  'error.secondStepUpdate': 'החשבון שלך דורש שלב שני לכניסה. עדכן את Passhold כדי להיכנס.',
  'error.secondStepAsked': 'החשבון שלך דורש שלב שני: הזן את הקוד מאפליקציית האימות שלך.',
  'error.secondStepTaken':
    'זה הקוד שבו נכנסת, וכל קוד עובד רק פעם אחת. המתן עד שאפליקציית האימות שלך תציג קוד חדש.',
  'error.kitDraftGone': 'מפתח השחזור החדש לא הוגדר בזמן, ושום דבר לא השתנה. צור שוב חדש.',
  'error.archiveWrong': 'זה לא פותח את מה שנשמר.',
  'error.archiveGone': 'זה כבר לא נשמר.',
  'error.archiveDeleteRefused':
    'רק הסיסמה הישנה או מפתח השחזור הישן יכולים למחוק את מה שנשמר לפני שפג תוקפו.',
  'error.accountNeedsRoot':
    'החשבון הזה נוצר ב־Keyrook Authenticator לפני שלכל אפליקציית Keyrook היה מפתח משלה. Passhold יכול לתת לו אחד עכשיו; שום דבר ב־Authenticator לא משתנה.',
  'error.accountServerWrong':
    'השרת של Keyrook ענה במשהו שהמפתחות של החשבון הזה לא מתאימים לו, ולכן Passhold עצר. נסה שוב מאוחר יותר.',
  'error.startOverNeedsPassword': 'לחשבון הזה יש סיסמה: בחר חדשה כדי להפעיל אותו מחדש.',
  'error.pinInvalid': 'PIN הוא בן 6 עד 12 ספרות.',
  'error.wrongPin': 'זה לא ה־PIN.',
  'error.wrongPinLeft': {
    one: 'זה לא ה־PIN. נותר ניסיון {count}.',
    two: 'זה לא ה־PIN. נותרו {count} ניסיונות.',
    other: 'זה לא ה־PIN. נותרו {count} ניסיונות.',
  },
  'error.pinLockedOut': 'יותר מדי PIN שגויים. פתח בדרך אחרת; אחר כך ה־PIN עובד שוב.',
  'error.pinUnavailable':
    'ה־PIN עובד רק כל עוד הדפדפן פתוח. פתח בדרך אחרת; אחר כך ה־PIN עובד שוב.',
  'error.deviceGone': 'הפתיחה עם המכשיר הזה כבר לא מוגדרת. פתח בדרך אחרת.',
  'error.deviceKeyWrong': 'זה לא פתח את Passhold. פתח בדרך אחרת, ואז הגדר שוב את פתיחת המכשיר.',
  'error.deviceUnsupported':
    'המקום שבו נשמר מפתח הגישה הזה לא יכול לתת ל־Passhold מפתח לפתוח איתו. נסה שוב ושמור אותו במנהל הסיסמאות של Google – או השתמש ב־PIN.',
  'error.deviceUnsupportedEdge':
    'המקום שבו נשמר מפתח הגישה הזה לא יכול לתת ל־Passhold מפתח לפתוח איתו. נסה שוב ושמור אותו במקום אחר – או השתמש ב־PIN.',
  'error.deviceCancelled': 'שום דבר לא נפתח: זה בוטל, או לקח יותר מדי זמן.',
  'error.keyUnsupported':
    'המפתח הזה לא יכול לתת ל־Passhold את מה שהוא צריך כדי לפתוח. רוב מפתחות FIDO2 יכולים; מפתח שנוצר רק לאימות דו־שלבי (U2F) לא יכול.',
  'error.keyAlreadyAdded': 'המפתח הזה כבר מוגדר כאן.',
  'error.keyGone': 'מפתח האבטחה הזה כבר לא מוגדר כאן. פתח בדרך אחרת.',
  'error.keyWrong':
    'המפתח הזה לא פתח את Passhold. פתח בדרך אחרת, ואז הסר את המפתח והוסף אותו שוב.',
  'error.kdfUnsupported': 'ההגדרות של הכספת אינן כאלה ש־Passhold מקבל.',
  'error.locked': 'Passhold נעול.',
  'error.noVault': 'עדיין אין כספת.',
  'error.vaultExists': 'כספת כבר קיימת.',
  'error.notOnPage': 'פרטי הכניסה הזה לא שייכים לדף בכרטיסייה הזו.',
  'error.expired': 'זה פג. נסה שוב.',
  'error.noFields': 'אין בדף הזה שום דבר ש־Passhold יכול למלא.',
  'error.cardInsecure': 'Passhold ממלא כרטיס רק בדף מאובטח (https).',
  'error.unknown': 'משהו השתבש: {detail}',
};
