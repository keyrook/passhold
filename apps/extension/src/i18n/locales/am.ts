import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'በKeyrook',

  // Common
  'common.cancel': 'ይቅር',
  'common.close': 'ይዝጉ',
  'common.save': 'ያስቀምጡ',
  'common.edit': 'ያርትዑ',
  'common.back': 'ይመለሱ',
  'common.show': 'ያሳዩ',
  'common.hide': 'ይደብቁ',
  'common.notNow': 'አሁን አይደለም',

  // Setup
  'setup.title': 'ካዝናዎን ይፍጠሩ',
  'setup.body':
    'Passhold የይለፍ ቃሎችዎን በዚህ መሣሪያ ላይ በተመሰጠረ ሁኔታ ያስቀምጣል። አንድ ዋና የይለፍ ቃል ይከፍታቸዋል – የሚያስታውሱትን ይምረጡ እና በሌላ ቦታ አይጠቀሙበት።',
  'setup.password': 'ዋና የይለፍ ቃል',
  'setup.confirm': 'እንደገና ያስገቡ',
  'setup.mismatch': 'ሁለቱ የይለፍ ቃሎች አንድ አይደሉም።',
  'setup.tooShort': 'ቢያንስ {min} ቁምፊዎችን ይጠቀሙ።',
  'setup.understand':
    'ይህን የይለፍ ቃል ብረሳው ካዝናዬን ማንም – Passhold ወይም Keyrook – መመለስ እንደማይችል አውቃለሁ።',
  'setup.create': 'ካዝና ይፍጠሩ',
  'setup.creating': 'በመፍጠር ላይ…',
  'setup.restore': 'ከመጠባበቂያ ቅጂ ወደነበረበት ይመልሱ',

  // Strength
  'setup.deviceBody':
    'Passhold የይለፍ ቃሎችዎን በዚህ መሣሪያ ላይ በተመሰጠረ ሁኔታ ያስቀምጣል፤ {method} ይከፍታቸዋል – ማስታወስ ወይም መፍጠር ያለብዎት ዋና የይለፍ ቃል የለም። {method} መስራት ባቆመበት ቀን እንዲረዳዎ የመልሶ ማግኛ ቁልፍም ያገኛሉ።',
  'setup.deviceWhereMac': 'Chrome የይለፍ ቁልፉን የት እንደሚያስቀምጡ ሲጠይቅ “የጉግል የይለፍ ቃል አስተዳዳሪ”ን ይምረጡ።',
  'setup.deviceWhereMacEdge':
    'Edge የይለፍ ቁልፉን የት እንደሚያስቀምጡ ሲጠይቅ በሌሎች መሣሪያዎችዎም ላይ የሚገኝበትን ቦታ ይምረጡ። ሁሉም ቦታ Passhold መክፈት አይችልም፤ ይህኛው ካልቻለ Passhold ይነግርዎታል።',
  'setup.createWithDevice': 'በ{method} ይፍጠሩ',
  'setup.usePassword': 'በምትኩ ዋና የይለፍ ቃል ይጠቀሙ',
  'setup.useDevice': 'በምትኩ {method} ይጠቀሙ',
  'setup.signIn': 'ይግቡ ወይም የKeyrook መለያ ይፍጠሩ',

  'welcome.title': 'የይለፍ ቃሎችዎ፣ በእያንዳንዱ ኮምፒውተር ላይ',
  'welcome.body':
    'አንድ ጊዜ ይግቡ። Passhold በጣት አሻራዎ ይከፈታል፣ ለእርስዎ ይሞላል፣ የመግቢያ መረጃዎችዎም በገቡበት ሁሉ ይገኛሉ።',
  'welcome.email': 'የኢሜይል አድራሻ ይጠቀሙ',
  'gate.touchTitle': 'በንክኪ ይክፈቱት',
  'gate.touchBody': 'Touch ID ወይም Windows Hello Passhold ይከፍታል። ማስታወስ ወይም መፍጠር ያለብዎት ዋና የይለፍ ቃል የለም።',
  'gate.everywhereTitle': 'በሚጠቀሙት ኮምፒውተር ሁሉ',
  'gate.everywhereBody': 'በሌላ ኮምፒውተር ይግቡ፣ እና የይለፍ ቃሎችዎ እና የይለፍ ቁልፎችዎ እዚያ ይገኛሉ።',
  'gate.privateTitle': 'እርስዎ ብቻ ማንበብ ይችላሉ',
  'gate.privateBody':
    'ምንም ነገር ከመላኩ በፊት በዚህ ኮምፒውተር ላይ ተመስጥሯል። Keyrook የይለፍ ቃሎችዎን ማንበብ አይችልም፤ ለየትኞቹ ድረ-ገጾች እንደሆኑም አያውቅም።',
  'welcome.note':
    'በመጀመሪያ በዚህ ኮምፒውተር ላይ ተመስጥሯል፦ Keyrook የይለፍ ቃሎችዎን ማንበብ አይችልም፤ ለየትኞቹ ድረ-ገጾች እንደሆኑም አያውቅም።',
  'connect.title': 'የKeyrook መለያዎን ያብሩ',
  'connect.body': 'በሚጠቀሙት እያንዳንዱ ኮምፒውተር ላይ ያሉ የመግቢያ መረጃዎችዎ – ይህ ኮምፒውተር ቢጠፋም ቅጂ ይኖራል።',
  'connect.email': 'ኢሜይል',
  'kitCheck.title': 'የመለያዎን መልሶ ማግኛ ቁልፍ ያረጋግጡ',
  'kitCheck.body': 'አንድ ጊዜ ያስገቡት፣ ለሚያስፈልግዎ ቀን አሁንም እንዳለዎት እንዲያውቁ።',
  'accountPasskey.button': 'በይለፍ ቁልፍ ይቀጥሉ',
  'accountPasskey.working': 'የይለፍ ቁልፉን በመጠባበቅ ላይ…',
  'accountPasskey.hint':
    'በaccount.keyrook.com ላይ የጨመሩት። ለመጀመሪያ ጊዜ {browser} Passhold እንዲጠቀምበት ይጠይቃል።',
  'accountPasskey.openPasskeys': 'በaccount.keyrook.com ላይ “Passkeys”ን ይክፈቱ',
  'join.title': 'ወደ Keyrook ይግቡ',
  'join.body': 'ለPasshold እና ለKeyrook Authenticator አንድ የKeyrook መለያ። የመግቢያ መረጃዎችዎ ከመለያው ወደዚህ አሳሽ ይመጣሉ።',
  'join.createTitle': 'የKeyrook መለያ ይፍጠሩ',
  'join.createBody':
    'ለPasshold እና ለKeyrook Authenticator አንድ መለያ፦ የመግቢያ መረጃዎችዎ በመጀመሪያ በዚህ መሣሪያ ላይ ተመስጥረው፣ በሚገቡበት እያንዳንዱ ኮምፒውተር ላይ።',
  'join.lockTitle': 'በ{email} ገብተዋል',
  'join.lockBodyDevice':
    'የመጨረሻ ደረጃ፦ Passhold በዚህ ኮምፒውተር ላይ በ{method} ይከፈታል። ሲዘጋጅ የመግቢያ መረጃዎችዎ ይወርዳሉ።',
  'join.cancel': 'ሌላ መለያ ይጠቀሙ',
  'join.lockBodyCode':
    'የመጨረሻ ደረጃ፦ Passhold በዚህ ኮምፒውተር ላይ የሚከፍት ኮድ። ሲዘጋጅ የመግቢያ መረጃዎችዎ ይወርዳሉ።',
  'join.opening': 'Passhold በመክፈት ላይ…',
  'setup.useAccountPassword': 'በምትኩ የመለያዬን የይለፍ ቃል ይጠቀሙ',
  'setup.useCode': 'በምትኩ ለዚህ ኮምፒውተር ኮድ ይጠቀሙ',
  'security.accountPasswordTitle': 'በKeyrook መለያዎ የይለፍ ቃል ይከፈታል',
  'security.accountPasswordBody':
    'ለሁለቱም አንድ የይለፍ ቃል። ሲቀየር፣ እዚህ ያለው Passhold በሚቀጥለው ጊዜ ሲገቡ ይከተለዋል።',

  'recovery.title': 'የመልሶ ማግኛ ቁልፍዎን ያስቀምጡ',
  'recovery.body':
    'ይህ መሣሪያ ከጠፋ፣ ወይም መከፈቻው መስራት ካቆመ፣ ይህ ቁልፍ ወደ ካዝናዎ እና ወደ ቅጂዎቹ የሚመልስ መንገድ ነው። Passhold እስከሚከፈት ድረስ በቅንብሮች ውስጥ እንደገና ማየት ይችላሉ – ስለዚህ በሌላ ቦታም ያስቀምጡት፦ በወረቀት፣ በስልክዎ ወይም ከዚህ ኮምፒውተር ርቆ ባለ ፋይል።',
  'recovery.download': 'አውርድ',
  'recovery.copy': 'ቅዳ',
  'recovery.copied': 'ተቀድቷል',
  'recovery.print': 'አትም',
  'recovery.qr': 'የQR ኮድ አሳይ',
  'recovery.qrHide': 'የQR ኮድ ደብቅ',
  'recovery.qrLabel': 'የመልሶ ማግኛ ቁልፉ እንደ QR ኮድ',
  'recovery.qrHint': 'የስልክዎን ካሜራ ወደርሱ ይጠቁሙ እና ጽሑፉን በማስታወሻ ያስቀምጡ፣ ወይም ፎቶ ያንሱት።',
  'recovery.show': 'አሳይ',

  'kit.title': 'የPasshold መልሶ ማግኛ ወረቀት',
  'kit.made': 'የተሰራው {date}',
  'kit.keyLabel': 'የመልሶ ማግኛ ቁልፍ',
  'kit.whenTitle': 'Passhold ሳይከፈት ሲቀር',
  'kit.sameDevice':
    'በዚህ ኮምፒውተር ላይ፦ Passhold ለመክፈት ሲጠይቅ “በምትኩ የመልሶ ማግኛ ቁልፍ ይጠቀሙ” ይምረጡ እና ቁልፉን ያስገቡ።',
  'kit.newDevice':
    'በአዲስ ኮምፒውተር ላይ፦ Passhold ይጫኑ፣ “ከመጠባበቂያ ቅጂ ወደነበረበት ይመልሱ”ን ይምረጡ፣ አዲሱን የመጠባበቂያ ፋይል ይምረጡ እና ቁልፉን ያስገቡ። መጠባበቂያ ከሌለ የሚመለስ ነገር የለም፤ ስለዚህ አንዱን ያዘጋጁ።',
  'kit.keep':
    'ይህን ወረቀት ከኮምፒውተርዎ ርቆ በደህና ቦታ ያስቀምጡ። ይህ ወረቀት እና የካዝናዎ ቅጂ ያለው ሁሉ ካዝናውን መክፈት ይችላል።',
  'recovery.fileTitle': 'የPasshold መልሶ ማግኛ ቁልፍ',
  'recovery.fileMade': 'የተሰራው {date}',
  'recovery.fileBody':
    'መሣሪያዎ ማድረግ በማይችልበት ጊዜ ይህ ቁልፍ የPasshold ካዝናዎን እና ቅጂዎቹን ይከፍታል። ቁልፉ እና የካዝናዎ ቅጂ ያለው ሁሉ መክፈት ይችላል፤ ስለዚህ በደህና ያስቀምጡት እና በዚያው ኮምፒውተር ላይ አይሁን።',
  'recovery.pending': 'የመልሶ ማግኛ ቁልፍ አልተቀመጠም',
  'recovery.keptState': 'የመልሶ ማግኛ ቁልፍ ተቀምጧል',
  'recovery.rowBody':
    '{method} ማድረግ በማይችልበት ጊዜ ካዝናዎን እና ቅጂዎቹን ይከፍታል። አዲስ ቁልፍ ይህን ካዝና በአሮጌው እንዳይከፈት ያቆማል፤ ከዚያ በፊት የተሰሩ ቅጂዎች ግን አሁንም በአሮጌው ይከፈታሉ።',
  'recovery.makeNew': 'አዲስ ይፍጠሩ',
  'recovery.savedIt': 'አስቀምጫለሁ',
  'recovery.checkTitle': 'ማስቀመጥዎን ያረጋግጡ',
  'recovery.checkBody':
    'ከቀመጡት ላይ ሁለት የቁልፉን ክፍሎች ያስገቡ – ፋይሉን፣ ወረቀቱን ወይም ፎቶውን። ክፍሎች በሰረዞች መካከል ያሉ፣ ከግራ በመቁጠር አራት ቁምፊዎች ያሉባቸው ብሎኮች ናቸው።',
  'recovery.group': 'ክፍል {position}',
  'recovery.check': 'አረጋግጥ',
  'recovery.checkWrong':
    'ቁልፍዎ የሚለው ይህ አይደለም። ያስቀመጡትን እንደገና ይመልከቱ፣ ወይም ቁልፉን እንደገና አሳይተው አሁን ያስቀምጡ።',
  'recovery.showAgain': 'ቁልፉን እንደገና አሳይ',
  'recovery.covered': 'የKeyrook መለያዎ የመመለሻ መንገድ ነው',
  'recovery.coveredBody':
    '{method} እዚህ Passhold መክፈት ካቆመ፣ ካዝናውን አስወግደው ወደ መለያዎ እንደገና ይግቡ፦ እያንዳንዱ የመግቢያ መረጃ ይመለሳል። የዚህ ካዝና የራሱ መልሶ ማግኛ ቁልፍ አሁንም እዚህ ለማየት አለ።',

  'proof.recoveryKey': 'የመልሶ ማግኛ ቁልፍ',
  'proof.withDevice': 'በ{method} ያረጋግጣሉ።',
  'proof.useDevice': 'በምትኩ በ{method} ያረጋግጡ',
  'proof.usePassword': 'በምትኩ ዋና የይለፍ ቃሉን ያስገቡ',
  'proof.useAccountPassword': 'በምትኩ የመለያ የይለፍ ቃሉን ያስገቡ',
  'proof.useCode': 'በምትኩ ኮዱን ያስገቡ',
  'proof.useRecoveryKey': 'በምትኩ የመልሶ ማግኛ ቁልፉን ያስገቡ',
  'strength.0': 'በጣም ደካማ',
  'strength.1': 'ደካማ',
  'strength.2': 'መካከለኛ',
  'strength.3': 'ጠንካራ',
  'strength.4': 'በጣም ጠንካራ',
  'strength.short': 'ረዘም ያለ የበለጠ ጠንካራ ነው፦ 14 ቁምፊዎች ወይም ከዚያ በላይ ያድርጉት።',
  'strength.digitsOnly': 'ቁጥሮች ብቻ በቀላሉ ይገመታሉ።',
  'strength.repeats': 'ያው ቁምፊ ደጋግመው ከመጠቀም ይቆጠቡ።',

  // Unlock
  'unlock.title': 'Passhold ተቆልፏል',
  'unlock.body': 'ዋና የይለፍ ቃልዎን ያስገቡ።',
  'unlock.password': 'ዋና የይለፍ ቃል',
  'unlock.submit': 'ይክፈቱ',
  'unlock.pinBody': 'PINዎን ያስገቡ።',
  'unlock.pin': 'PIN',
  'unlock.usePassword': 'በምትኩ ዋና የይለፍ ቃሉን ይጠቀሙ',
  'unlock.usePin': 'በምትኩ PINን ይጠቀሙ',
  'unlock.recoveryBody': 'የመልሶ ማግኛ ቁልፍዎን ያስገቡ።',
  'unlock.deviceBody': '{method} ይጠቀሙ፣ ወይም ከታች ይጻፉ።',
  'unlock.recoveryKey': 'የመልሶ ማግኛ ቁልፍ',
  'unlock.useRecoveryKey': 'በምትኩ የመልሶ ማግኛ ቁልፉን ይጠቀሙ',
  'unlock.lost': 'መግባት አልቻሉም?',
  'unlock.forgotBodyRecovery':
    'መሣሪያው ማድረግ በማይችልበት ጊዜ የመልሶ ማግኛ ቁልፍዎ ካዝናውን ይከፍታል። እሱም ሆነ መሣሪያው ከሌለ፣ ማንም – Passhold ወይም Keyrook – ካዝናውን መክፈት አይችልም፦ በቅንብሮች ማስወገድ እና እንደገና መጀመር ብቻ ነው የሚችሉት።',
  'unlock.bodyAccount': 'የKeyrook መለያዎን የይለፍ ቃል ያስገቡ።',
  'unlock.accountPassword': 'የKeyrook መለያ የይለፍ ቃል',
  'unlock.useAccountPassword': 'በምትኩ የመለያ የይለፍ ቃሉን ይጠቀሙ',
  'unlock.forgotBodyAccount':
    'የKeyrook መለያዎ የይለፍ ቃል ነው፦ በሌላ ቦታ ከተቀየረ አዲሱን ይጠቀሙ። ሙሉ በሙሉ ረሱት? በቅንብሮች ይህን ካዝና ያስወግዱ እና እንደገና ይግቡ – አዲስ የይለፍ ቃል ከፈለጉ በመልሶ ማግኛ ቁልፉ – እያንዳንዱ የመግቢያ መረጃ ይመለሳል።',
  'unlock.bodyCode': 'Passhold በዚህ ኮምፒውተር ላይ የሚከፍተውን ኮድ ያስገቡ።',
  'unlock.code': 'የዚህ ኮምፒውተር ኮድ',
  'unlock.useCode': 'በምትኩ ኮዱን ይጠቀሙ',
  'unlock.forgotBodyCode':
    'በቅንብሮች ይህን ካዝና ያስወግዱ እና በGoogle ወይም በGitHub እንደገና ይግቡ፦ እያንዳንዱ የመግቢያ መረጃ ከመለያዎ ይመለሳል።',
  'unlock.device': 'በ{method} ይክፈቱ',
  'unlock.key': 'በደህንነት ቁልፍ ይክፈቱ',
  'unlock.keyBody': 'የደህንነት ቁልፍዎን ይሰኩ፣ ወይም ከታች ይጻፉ።',
  'unlock.or': 'ወይም',
  'unlock.unlocking': 'በመክፈት ላይ…',
  'unlock.forgot': 'ረሱት?',
  'unlock.forgotBody':
    'ዋና የይለፍ ቃልዎ የዚህ ካዝና ብቸኛ ቁልፍ ነው፣ እና የትም አይቀመጥም። ያለሱ ካዝናው ሊከፈት አይችልም – በቅንብሮች ማስወገድ እና እንደገና መጀመር ብቻ ነው የሚችሉት።',

  // Vault
  'vault.search': 'ፈልግ',
  'vault.lock': 'ቆልፍ',
  'vault.settings': 'ቅንብሮች',
  'vault.add': 'አዲስ መግቢያ',
  'vault.onThisPage': 'በ{site}',
  'vault.all': 'ሁሉም መግቢያዎች',
  'vault.empty': 'እስካሁን መግቢያ የለም',
  'vault.emptyBody':
    'ወደ ድረ-ገጽ ይግቡ እና Passhold ማስቀመጥ ያቀርባል – ወይም እዚህ ይጨምሩ፣ ወይም ከአሳሽዎ ያስመጡ።',
  'vault.import': 'የይለፍ ቃሎችን አስመጣ',
  'vault.noResults': '“{query}” የሚመሳሰል የለም።',
  'vault.fill': 'ሙላ',
  'vault.copyUsername': 'የተጠቃሚ ስም ቅዳ',
  'vault.copyPassword': 'የይለፍ ቃል ቅዳ',
  'vault.noUsername': 'የተጠቃሚ ስም የለም',
  'vault.count': { one: '{count} ንጥል', other: '{count} ንጥሎች' },
  'vault.everything': 'ሁሉም ንጥሎች',

  // Asking for a rating, once, after real use
  'rating.title': 'Passhold ጠቃሚ ሆኖ አገኙት?',
  'rating.body': 'በስቶር ውስጥ ደረጃ መስጠት ሌሎች Passhold እንዲያገኙ ይረዳል።',
  'rating.rate': 'ደረጃ ስጥ',
  'rating.later': 'አሁን አይደለም',

  // What a list shows, and what can be added
  'kinds.label': 'አሳይ',
  'kinds.all': 'ሁሉም',
  'kinds.logins': 'መግቢያዎች',
  'kinds.cards': 'ካርዶች',
  'kinds.addresses': 'አድራሻዎች',
  'kinds.notes': 'ማስታወሻዎች',
  'kinds.noLogins': 'እስካሁን መግቢያ የለም።',
  'kinds.noCards':
    'እስካሁን ካርድ የለም። ከላይ በ+ አንዱን ይጨምሩ፤ ሲፈልጉት በክፍያ ጊዜ Passhold ይሞላዋል።',
  'kinds.noAddresses':
    'እስካሁን አድራሻ የለም። ከላይ በ+ አንዱን ይጨምሩ፤ ቅፅ ሲጠይቀው Passhold ይሞላዋል።',
  'kinds.noNotes':
    'እስካሁን ማስታወሻ የለም። ማስታወሻ መግቢያ ያልሆነውን ይይዛል – የWi-Fi የይለፍ ቃል፣ የፈቃድ ቁልፍ – ከሌላው ሁሉ ጋር በተመሰጠረ ሁኔታ።',
  'add.menu': 'ጨምር',
  'add.login': 'መግቢያ',
  'add.card': 'ካርድ',
  'add.address': 'አድራሻ',
  'add.note': 'ማስታወሻ',
  'place.label': 'ካዝናዎች',
  'place.mine': 'የእኔ',
  'place.of': '{vault}፣ በ{family} የተጋራ',
  'move.to': 'ወደ {vault} ውሰድ',
  'move.confirm':
    'በ{family} ያሉ ሁሉ በ{vault} ውስጥ ያዩታል፤ መቀየርም ይችላሉ። ከእርስዎ ካዝና ይወጣል፤ የቀድሞ የይለፍ ቃሎቹ ግን ይቀራሉ።',
  'move.do': 'ውሰድ',
  'family.unlockTitle': 'የ{family} የተጋራ ካዝና በዚህ አሳሽ ላይ ይክፈቱ',
  'family.unlockBody':
    'Passhold አንድ ጊዜ የKeyrook መለያዎ የይለፍ ቃል ያስፈልገዋል፤ ቁልፍዎን በዚህ አሳሽ ላይ ለቤተሰቡ ለማድረስ። ወደየትም አይላክም።',
  'family.unlockOnPage':
    'በaccount.keyrook.com ላይ የ“Family” ገጽን ይክፈቱ፤ እዚያም ለቤተሰቡ ያለዎትን ቁልፍ ለPasshold ይስጡ።',
  'family.password': 'የKeyrook መለያ የይለፍ ቃል',
  'family.unlock': 'ክፈት',
  'family.openPage': 'የቤተሰብ ገጽን ክፈት',
  'family.keyChanged': 'የ{who} ቁልፍ በ{family} ተቀይሯል',
  'family.newSender': 'የ{family} ቁልፍ ከ{who} መጣ፤ ይህ አሳሽ እስካሁን አያውቃቸውም',
  'family.keyChangedBody':
    'ሁለታችሁ ኮድ እስካነጻጸራችሁ ድረስ Passhold ከእነሱ ምንም አይወስድም። ደውሉላቸው ወይም ተገናኙ፤ በaccount.keyrook.com ላይ በ“Family” ገጽ ላይ ከስምዎ ቀጥሎ ኮዶችን ለማነጻጸር ይመርጣሉ።',
  'family.showCode': 'ኮዱን አሳይ',
  'family.codeIs': 'ኮድዎ',
  'family.match': 'ኮዶቹ ይመሳሰላሉ',
  'family.differ': 'ኮዶቹ ይለያያሉ',
  'family.differed':
    'ከሆነ አትመኑት። የቤተሰብዎን አደራጅ ያሳውቁ፤ Passhold በዚያን ጊዜ ከእነሱ ምንም አይወስድም።',
  'family.someone': 'አንድ ሰው',
  'family.waiting':
    'የ{family} አደራጅ አንድ ሰው አረጋግጦ ሊያረጋግጥዎ ገና ነው። የሚጋራው ይህ ሲሆን እዚህ ይከፈታል።',
  'family.rotate':
    'አንድ ሰው {family}ን ለቋል፤ Passhold ቁልፎቹን ሁሉ ገና አልቀየረም፦ በተጋሩ ካዝናዎቹ ውስጥ የሚቀየረው በዚህ አሳሽ ላይ ይቆያል። ይህ ከቀጠለ፣ በ“Family” ገጽ ላይ ይቀይሯቸው።',
  'family.rotateCompare':
    'አንድ ሰው {family}ን ለቋል። Passhold ለሁሉም አዲስ ቁልፍ የሚሰጠው ከላይ ያለውን ኮድ ካነጻጸሩ በኋላ ነው፤ እስከዚያው በተጋሩ ካዝናዎቹ ውስጥ የሚቀየረው በዚህ አሳሽ ላይ ይቆያል።',
  'family.rotateWait':
    'አንድ ሰው {family}ን ለቋል። በተጋሩ ካዝናዎቹ ውስጥ የሚቀይሩት በዚህ አሳሽ ላይ የአደራጅ Passhold ቁልፎቹን እስኪቀይር ድረስ ይቆያል፤ ይህ የሚደረገው በማመሳሰል ጊዜ ሲሆን፣ የለቀቀው ሰው ማንበብ እንዳይችል ነው።',
  'family.left': '{who} ከእንግዲህ በ{family} ውስጥ የለም',
  'family.leftBody':
    'Passhold ለምን እንደሄዱ ማወቅ አይችልም። ይህን ካልጠበቁ እነርሱን ወይም የቤተሰብዎን አደራጅ ይጠይቁ።',
  'family.title': 'ቤተሰብ',
  'family.description':
    'በቤተሰብዎ ውስጥ ያሉት ሰዎች፣ እና የሚጋሯቸው ካዝናዎች። ቤተሰብ የሚመራው በaccount.keyrook.com ላይ በ“Family” ገጽ ነው፦ መጋበዝ፣ ሰው ማስወጣት፣ ቁልፎቹን መቀየር።',
  'family.none':
    'ይህ መለያ በማንኛውም ቤተሰብ ውስጥ የለም። ቤተሰቦች የሚፈጠሩት በaccount.keyrook.com ላይ በ“Family” ገጽ ነው።',
  'family.youOrganise': 'የእርሱ አደራጅ ነዎት።',
  'family.youMember': 'የእርሱ አባል ነዎት።',
  'family.you': '(እርስዎ)',
  'family.organiser': 'አደራጅ',
  'family.notCompared': 'ኮዶችን ሳያነጻጽሩ የተጨመረ',
  'family.keyNew': 'ቁልፋቸው ተቀይሯል፦ ኮድ እስኪያነጽጹ ድረስ ከእነሱ ምንም አይወሰድም',
  'family.membersLater': 'ማን እንዳለ እዚህ የሚታየው ቤተሰቡ በዚህ አሳሽ ላይ ሲከፈት ነው።',
  'family.sharedVaults': 'የተጋሩ ካዝናዎች',
  'family.vaultWaits': 'በእሱ ውስጥ የሚቀየረው አደራጅ ቁልፉን እስኪቀይር ድረስ ይቆያል',

  // Cards, addresses and notes
  'wallet.updated': 'በ{date} ተቀይሯል',
  'wallet.copyField': '{field} ቅዳ',
  'card.untitled': 'ካርድ',
  'card.newTitle': 'አዲስ ካርድ',
  'card.editTitle': 'ካርዱን ያርትዑ',
  'card.titleHint': 'ባዶ ከተተወ፣ ካርዱ በኔትወርኩና በመጨረሻዎቹ አራት ቁጥሮቹ ይሰየማል።',
  'card.number': 'የካርድ ቁጥር',
  'card.numberCheck': 'ይህ ቁጥር አይጣጣምም፦ እያንዳንዱን ቁጥር ያረጋግጡ።',
  'card.holder': 'በካርዱ ላይ ያለው ስም',
  'card.expiry': 'የሚያበቃው',
  'card.month': 'ወር',
  'card.year': 'ዓመት',
  'card.code': 'የደህንነት ኮድ',
  'card.empty': 'የካርድ ቁጥር ወይም ስም ይስጡት።',
  'card.expired': 'ይህ ካርድ ጊዜው አልፎበታል።',
  'card.expiredOn': 'ጊዜው ያለፈበት {expiry}',
  'card.copyNumber': 'የካርድ ቁጥር ቅዳ',
  'card.copyExpiry': 'የማብቂያ ቀን ቅዳ',
  'address.untitled': 'አድራሻ',
  'address.newTitle': 'አዲስ አድራሻ',
  'address.editTitle': 'አድራሻውን ያርትዑ',
  'address.titleHint': 'ቤት፣ ስራ… ባዶ ከተተወ፣ በውስጡ ባለው ስም ይሰየማል።',
  'address.name': 'ሙሉ ስም',
  'address.organization': 'ኩባንያ',
  'address.street': 'የጎዳና አድራሻ',
  'address.city': 'ከተማ',
  'address.region': 'ክልል ወይም ግዛት',
  'address.postalCode': 'የፖስታ ኮድ',
  'address.country': 'ሀገር',
  'address.chooseCountry': 'ሀገር ይምረጡ',
  'address.phone': 'ስልክ',
  'address.email': 'ኢሜይል',
  'address.address': 'አድራሻ',
  'address.empty': 'ስም ወይም የአድራሻው ክፍል ያስገቡ።',
  'note.untitled': 'ርዕስ የሌለው ማስታወሻ',
  'note.newTitle': 'አዲስ ማስታወሻ',
  'note.editTitle': 'ማስታወሻውን ያርትዑ',
  'note.title': 'ርዕስ',
  'note.text': 'ማስታወሻ',
  'note.empty': 'ርዕስ ይስጡት ወይም የሆነ ነገር ይጻፉ።',
  'note.edited': 'የተስተካከለው {date}',

  // Pending save, in the popup
  'pending.saveTitle': 'ይህን መግቢያ ላስቀምጥ?',
  'pending.updateTitle': 'የይለፍ ቃሉን ላዘምን?',
  'pending.lockedTitle': 'አሁን የተጠቀሙበትን መግቢያ ላስቀምጥ?',
  'pending.body': '{username} በ{site}',
  'pending.bodyNoUser': 'ለ{site} የይለፍ ቃል',
  'pending.save': 'አስቀምጥ',
  'pending.update': 'አዘምን',
  'pending.never': 'ለዚህ ድረ-ገጽ በጭራሽ',

  // Item
  'item.username': 'የተጠቃሚ ስም',
  'item.password': 'የይለፍ ቃል',
  'item.website': 'ድረ-ገጽ',
  'item.websites': 'ድረ-ገጾች',
  'item.notes': 'ማስታወሻዎች',
  'item.favorite': 'ተወዳጅ',
  'item.unfavorite': 'ከተወዳጆች አስወግድ',
  'item.addFavorite': 'ወደ ተወዳጆች ጨምር',
  'item.trash': 'ወደ መጣያ ውሰድ',
  'item.updated': 'የይለፍ ቃሉ የተቀየረው {date}',
  'item.history': 'የቀድሞ የይለፍ ቃሎች',
  'item.weak': 'ይህ የይለፍ ቃል ደካማ ነው፦ ለመገመት ብዙ ጊዜ አይወስድም።',
  'item.reused': {
    one: 'ይህ የይለፍ ቃል ለ{count} ሌላ መግቢያ ደግሞ ይጠቀምበታል። አንድ ድረ-ገጽ ቢያወጣው ሁለቱም ክፍት ይሆናሉ።',
    other: 'ይህ የይለፍ ቃል ለ{count} ሌሎች መግቢያዎች ደግሞ ይጠቀምበታል። አንድ ድረ-ገጽ ቢያወጣው ሁሉም ክፍት ይሆናሉ።',
  },
  'item.changePassword': 'በድረ-ገጹ ላይ ይቀይሩት',
  'item.openSite': '{site} ክፈት',
  'item.passkey': 'የይለፍ ቁልፍ',
  'item.passkeyBody': 'ለ{site}፣ የተቀመጠው {date}',

  // Edit
  'edit.newTitle': 'አዲስ መግቢያ',
  'edit.editTitle': 'መግቢያውን ያርትዑ',
  'edit.title': 'ስም',
  'edit.titleHint': 'ባዶ ከተተወ፣ በድረ-ገጹ ስም ይሰየማል።',
  'edit.username': 'የተጠቃሚ ስም ወይም ኢሜይል',
  'edit.password': 'የይለፍ ቃል',
  'edit.generate': 'ፍጠር',
  'edit.websites': 'ድረ-ገጾች',
  'edit.websitesHint': 'በአንድ መስመር አንድ። Passhold ይህን መግቢያ በነዚህ ድረ-ገጾች ላይ ያቀርባል።',
  'edit.notes': 'ማስታወሻዎች',
  'edit.empty': 'ስም፣ የተጠቃሚ ስም ወይም የይለፍ ቃል ይስጡት።',

  // Fields of an item's own, and folders
  'fields.title': 'የራስ መስኮች',
  'fields.add': 'መስክ ጨምር',
  'fields.name': 'የመስኩ ስም',
  'fields.value': 'እሴት',
  'fields.hidden': 'እንደ የይለፍ ቃል ደብቀው',
  'fields.remove': 'ይህን መስክ ያስወግዱ',
  'fields.unnamed': 'መስክ',
  'fields.copy': '{name} ቅዳ',
  'folders.label': 'አቃፊ',
  'folders.placeholder': 'አቃፊ የለም',
  'folders.choose': 'ያሉ አቃፊዎች',
  'folders.hint': 'ነገሮችን አንድ ላይ ያቆዩ – ስራ፣ ቤተሰብ፣ ባንክ – እና በአንድ ጊዜ አንድ አቃፊ ያሳዩ።',
  'folders.all': 'ሁሉም አቃፊዎች',
  'folders.none': 'በአቃፊ ውስጥ የሌለ',
  'folders.count': { one: '{count} ንጥል', other: '{count} ንጥሎች' },
  'folders.nothingHere': 'በዚህ አቃፊ ውስጥ የዚህ ዓይነት ምንም የለም።',
  'folders.rename': 'ስም ቀይር',
  'folders.renameTo': 'ለአቃፊው አዲስ ስም',
  'folders.remove': 'አቃፊ አስወግድ',
  'folders.removeHint': 'በውስጡ ያለው ይቀራል፣ በየትም አቃፊ ውስጥ ሳይሆን።',

  // Generator
  'generator.length': 'ርዝመት',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'የሚመሳሰሉትን ፊደሎች አስቀር (I l 1 O 0)',
  'generator.again': 'ሌላ',
  'generator.use': 'ይህን የይለፍ ቃል ይጠቀሙ',
  'generator.bits': '{bits} ቢት',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold ተቆልፏል።',
  'menu.unlock': 'Passhold ክፈት',
  'menu.unlockHint': 'ለመክፈት በመሳሪያ አሞሌው ላይ Passholdን ጠቅ ያድርጉ፣ ከዚያ ወደዚህ ይመለሱ።',
  'menu.none': 'ለ{site} የተቀመጠ መግቢያ የለም።',
  'menu.uninitialized': 'መጀመሪያ Passholdን ያዋቅሩ፦ በመሳሪያ አሞሌው ላይ ጠቅ ያድርጉት።',
  'menu.suggest': 'ጠንካራ የይለፍ ቃል ይጠቀሙ',
  'menu.suggestBody': 'አዲስ የይለፍ ቃል፣ ለእርስዎ ተሞልቷል። ቅጹ ከተላከ በኋላ Passhold ማስቀመጥ ያቀርባል።',
  'menu.fillFor': 'በ{site} ላይ ሙላ',
  'menu.hidden': 'Passhold በዚህ ገጽ ላይ ባለ ነገር ተሸፍኗል፣ ስለዚህ አይሞላም።',
  'menu.passkey': 'የይለፍ ቁልፍ · {username}',
  'menu.noCards': 'በPasshold እስካሁን ካርድ የለም። በመሳሪያ አሞሌው ላይ ካለው Passhold አንዱን ይጨምሩ።',
  'menu.noAddresses': 'በPasshold እስካሁን አድራሻ የለም። በመሳሪያ አሞሌው ላይ ካለው Passhold አንዱን ይጨምሩ።',
  'menu.cardInsecure':
    'ይህ ገጽ ደህንነቱ ያልተጠበቀ ነው (ተራ http)፣ ስለዚህ Passhold እዚህ ካርድ አይሞላም፦ በመንገድ ላይ ያለ ማንም ሊያነበው ይችላል።',

  // A website's passkey
  'passkey.saveTitle': 'ለ{site} የይለፍ ቁልፍ ላስቀምጥ?',
  'passkey.save': 'የይለፍ ቁልፍ አስቀምጥ',
  'passkey.saveElsewhere': 'በሌላ ቦታ አስቀምጠው',
  'passkey.useElsewhere': 'ከሌላ ቦታ የይለፍ ቁልፍ ይጠቀሙ',
  'passkey.existsTitle': 'ይህ የይለፍ ቁልፍ በPasshold ውስጥ አስቀድሞ አለ',
  'passkey.ok': 'እሺ',
  'passkey.signInTitle': 'ወደ {site} ይግቡ',
  'passkey.signInBody': 'በPasshold ውስጥ በተቀመጠ የይለፍ ቁልፍ',
  'passkey.none': 'በPasshold ውስጥ ለ{site} የይለፍ ቁልፍ የለም።',
  'passkey.hidden': 'Passhold በዚህ ገጽ ላይ ባለ ነገር ተሸፍኗል፣ ስለዚህ አይመልስም።',

  // Save prompt on a page
  'prompt.save': 'መግቢያውን በPasshold ላስቀምጥ?',
  'prompt.update': 'የይለፍ ቃሉን በPasshold ላዘምን?',
  'prompt.saveButton': 'አስቀምጥ',
  'prompt.updateButton': 'አዘምን',
  'prompt.never': 'ለዚህ ድረ-ገጽ በጭራሽ',
  'prompt.saved': 'በPasshold ውስጥ ተቀምጧል።',
  'prompt.locked': 'በመሳሪያ አሞሌው ላይ Passholdን ጠቅ ያድርጉ እና ይክፈቱ – እዚያ ማስቀመጥ እንደሚፈልጉ ይጠይቃል።',
  'prompt.saveCard': 'ካርዱን በPasshold ላስቀምጥ?',
  'prompt.updateCard': 'ካርዱን በPasshold ላዘምን?',
  'prompt.saveAddress': 'አድራሻውን በPasshold ላስቀምጥ?',
  'prompt.saveCheckout': 'ካርዱን እና አድራሻውን በPasshold ላስቀምጥ?',

  // Settings
  'settings.title': 'ቅንብሮች',
  'settings.cannotOpen': 'በፍጹም ሊከፈት አይችልም? ካዝናውን ከዚህ አሳሽ ያስወግዱ',
  'settings.encryptedHere': 'በዚህ መሣሪያ ላይ ተመስጥሯል',
  'settings.source': 'ምንጭ ኮዱ በGitHub ላይ',

  'nav.passwords': 'የይለፍ ቃሎች',
  'nav.accountSync': 'መለያ እና ማመሳሰል',
  'nav.family': 'ቤተሰብ',
  'nav.account': 'የKeyrook መለያ',
  'nav.backup': 'መጠባበቂያ እና ማስመጣት',
  'nav.security': 'ደህንነት',
  'nav.general': 'አጠቃላይ',
  'nav.needsAttention': 'ትኩረት ይፈልጋል',


  'account.description':
    'ይግቡ፣ እና የመግቢያ መረጃዎችዎ Passholdን በሚገቡበት ሁሉ አሳሽ ይከተሉዎታል። በመጀመሪያ በዚህ መሣሪያ ላይ ተመስጥረዋል፦ የKeyrook አገልጋይ ማንበብ አይችልም፤ ለየትኞቹ ድረ-ገጾች እንደሆኑም አያውቅም።',
  'account.email': 'ኢሜይል',
  'account.password': 'የKeyrook መለያ የይለፍ ቃል',
  'account.signIn': 'ይግቡ',
  'account.signingIn': 'በመግባት ላይ…',
  'account.note':
    'በKeyrook Authenticator ውስጥ ያለው ተመሳሳይ መለያ። በGoogle ወይም በGitHub የተፈጠረ መለያ በአዝራሩ ይገባል።',
  'account.haveOne': 'መለያ አለኝ',
  'account.create': 'መለያ ይፍጠሩ',
  'account.sendCode': 'ኮድ በኢሜይል ላኩልኝ',
  'account.createNote':
    'አድራሻው የእርስዎ መሆኑን ለማረጋገጥ Keyrook ባለ ስድስት አሃዝ ኮድ በኢሜይል ይልካል። አድራሻው አስቀድሞ መለያ ካለው፣ ኢሜይሉ ያን ይነግርዎታል፦ በእሱ ይግቡ።',
  'account.codeSent': 'ኮዱ ወደ {email} በመንገድ ላይ ነው። ለአስራ አምስት ደቂቃ ይሰራል።',
  'account.code': 'ባለ ስድስት አሃዝ ኮድ',
  'account.newPassword': 'የKeyrook መለያ የይለፍ ቃል',
  'account.passwordNote':
    'ይህ የይለፍ ቃል የKeyrook መለያዎን በማንኛውም አሳሽ ይከፍታል፣ ለPasshold እና ለKeyrook Authenticator በእኩልነት። Keyrook አያየውም እና ሊያስጀምርልዎ አይችልም፤ ቀጥሎ የሚያገኙት የመልሶ ማግኛ ቁልፍ አዲስ ለማዘጋጀት መንገድ ነው።',
  'account.createButton': 'መለያ ይፍጠሩ',
  'account.creating': 'በመፍጠር ላይ…',
  'account.otherEmail': 'ሌላ አድራሻ ይጠቀሙ',
  'account.signedInAs': 'በ{email} ገብተዋል',
  'account.signedInAsNamed': 'በ{name} ({email}) ገብተዋል',
  'account.synced': 'የተመሳሰለው {date}',
  'account.notSynced': 'እስካሁን አልተመሳሰለም',
  'account.syncNow': 'አሁን አመሳስል',

  // The account, at the foot of the popup
  'accountBar.synced': 'የተመሳሰለው {time}',
  'accountBar.justNow': 'አሁን ልክ',
  'accountBar.syncing': 'በማመሳሰል ላይ…',
  'accountBar.signedOut': 'ወጥተዋል – ለማመሳሰል እንደገና ይግቡ',
  'accountBar.startedOver': 'መለያው እንደገና ተጀምሯል – እንደገና ይግቡ',
  'accountBar.removed': 'ከመለያው ተወግዷል – ለማመሳሰል እንደገና ይግቡ',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'ከKeyrook መለያዎ ተወግዷል',
  'removed.body':
    'በ{date} ይህ አሳሽ ከKeyrook መለያዎ ተወግዷል፤ ስለዚህ Passhold የመለያው የመግቢያ መረጃዎች፣ ካርዶች፣ አድራሻዎች እና ማስታወሻዎች ከእሱ አስወግዶ ዘግቶታል። እዚህ የተጨመሩ ወይም የተቀየሩ ግን ያልተላኩ ነገሮች የዚህ አሳሽ የራሱ ሆነው ቀርተዋል። የቀረውን ለመመለስ እንደገና ይግቡ።',

  // Passwords, in Settings
  'passwords.description':
    'በPasshold ውስጥ ያለ እያንዳንዱ መግቢያ፣ የይለፍ ቁልፍ፣ ካርድ፣ አድራሻ እና ማስታወሻ። አንዱን ይምረጡ ለማየት፣ ለመቅዳት ወይም ለመቀየር።',
  'passwords.all': 'ሁሉም',
  'passwords.attention': 'ትኩረት ይፈልጋል',
  'passwords.weak': 'ደካማ',
  'passwords.reused': 'ደጋግሞ የተጠቀመበት',
  'account.syncDone': 'ተመሳስሏል።',
  'account.removed': {
    one: 'በሌላ መሣሪያ ለዘለቄታው የተሰረዘ {count} ንጥል እዚህ ተወግዷል።',
    other: 'በሌላ መሣሪያ ለዘለቄታው የተሰረዙ {count} ንጥሎች እዚህ ተወግደዋል።',
  },
  'account.skipped': {
    one: 'ሊከፈት ያልቻለ እና ያልተነካ {count} መዝገብ።',
    other: 'ሊከፈቱ ያልቻሉ እና ያልተነኩ {count} መዝገቦች።',
  },
  'account.manage': 'የKeyrook መለያዎን ያስተዳድሩ',
  'account.manageBody':
    'የይለፍ ቃሉን ይቀይሩ፣ አዲስ የመልሶ ማግኛ ቁልፍ ይፍጠሩ ወይም መለያውን በaccount.keyrook.com ላይ ከመጀመሪያ ይጀምሩ – ለPasshold እና ለKeyrook Authenticator በእኩልነት።',
  'account.manageBodyProvider':
    'አዲስ የመልሶ ማግኛ ቁልፍ ይፍጠሩ ወይም መለያውን በaccount.keyrook.com ላይ ከመጀመሪያ ይጀምሩ – ለPasshold እና ለKeyrook Authenticator በእኩልነት።',
  'account.manageOpen': 'ክፈት',
  'account.signOut': 'ውጣ',
  'account.signOutBody':
    'ከመጨረሻ ማመሳሰል በኋላ ከዚህ አሳሽ ያሉትን የመግቢያ መረጃዎች ሁሉ ያስወግዳል። እንደገና ይግቡ፣ ይመለሳሉ።',
  'account.signOutConfirm':
    'Passhold አንድ ጊዜ ተጨማሪ ያመሳስላል፣ ከዚያ ካዝናውን ከዚህ አሳሽ ያስወግዳል። የመግቢያ መረጃ መለያዎ ያልደረሰ ከሆነ ምንም አይወገድም።',
  'account.signOutButton': 'ውጣ እና አስወግድ',
  'account.signedOutByServer': 'Keyrook ይህን አሳሽ አውጥቶታል። ማመሳሰሉን ለመቀጠል እንደገና ይግቡ።',
  'account.startedOver':
    'የKeyrook መለያዎ በ{date} እንደገና ተጀምሯል፣ ስለዚህ Keyrook ይህን አሳሽ አውጥቶታል። በአዲሱ የይለፍ ቃልዎ ይግቡ፦ እዚህ ያሉ የመግቢያ መረጃዎች በመለያው አዲስ ቁልፎች ስር ይጫናሉ።',
  'account.startedOverProvider':
    'የKeyrook መለያዎ በ{date} እንደገና ተጀምሯል፣ ስለዚህ Keyrook ይህን አሳሽ አውጥቶታል። በGoogle ወይም በGitHub ይግቡ፦ እዚህ ያሉ የመግቢያ መረጃዎች በመለያው አዲስ ቁልፎች ስር ይጫናሉ።',
  'account.forgot': 'የይለፍ ቃሉን ረሱት?',
  'account.recoverBody':
    'Keyrook ወደ መለያው አድራሻ ኮድ ይልካል፤ ከዚያ ያስገቡት፣ መለያው ሲፈጠር ያስቀመጡት ወረቀት ላይ ያለው የመለያ መልሶ ማግኛ ቁልፍ፣ እና አዲስ የይለፍ ቃል። ሌሎች በመለያው የገቡ አሳሾች እና መተግበሪያዎች አዲሱን ይጠይቃሉ።',
  'account.recoveryKey': 'የመለያ መልሶ ማግኛ ቁልፍ',
  'account.recoverPassword': 'አዲስ የመለያ የይለፍ ቃል',
  'account.recoverButton': 'አዲስ የይለፍ ቃል ያዘጋጁ',
  'account.recovering': 'በማዘጋጀት ላይ…',
  'account.backToSignIn': 'ወደ መግቢያ ተመለሱ',
  'startOver.link': 'የመልሶ ማግኛ ቁልፉንም አጥተዋል? መለያውን ከመጀመሪያ ይጀምሩ',
  'startOver.title': 'መለያውን ከመጀመሪያ ይጀምሩ',
  'needsRoot.body':
    'Keyrook Authenticator የሰጠዎትን የመለያ መልሶ ማግኛ ቁልፍ ካለዎት ያስገቡት፦ ያን ጊዜ Passholdንም ይከፍታል። ከሌለ Passhold ለመለያው አዲስ የመልሶ ማግኛ ቁልፍ ይፈጥራል፣ አንድ ጊዜ ብቻ ይታያል፤ አሮጌው መስራት ያቆማል።',
  'needsRoot.sheet': 'ከKeyrook Authenticator የመለያ መልሶ ማግኛ ቁልፍ (ካለዎት)',
  'needsRoot.withSheet': 'ይህን ቁልፍ ይጠቀሙ',
  'needsRoot.newSheet': 'አዲስ የመልሶ ማግኛ ቁልፍ ይፍጠሩ',
  'startOver.body':
    'ከኢሜይል አድራሻው በቀር ምንም ሳይቀር ሲቀር፣ መለያው በአዲስ ቁልፎች እና በአዲስ የመልሶ ማግኛ ቁልፍ እንደገና ሊጀምር ይችላል። ከጠየቁ በኋላ አንድ ሳምንት ሲፈጅ፣ እስከዚያ ድረስ ወደ መለያው የገባ ማንኛውም አሳሽ መሰረዝ ይችላል – ስለዚህ ኢሜይልዎን ብቻ ያለው ሰው ሊወስደው አይችልም። መለያው የያዘውን ሁሉ Keyrook ለ90 ቀናት በተመሰጠረ ሁኔታ ይጠብቃል፦ የቀድሞው የይለፍ ቃል ወይም የቀድሞው የመልሶ ማግኛ ቁልፍ ይመልሰዋል።',
  'startOver.button': 'ከመጀመሪያ ጀምር',
  'startOver.working': 'ከመጀመሪያ በመጀመር ላይ…',
  'startOver.kitBody':
    'የመለያው አዲስ የመልሶ ማግኛ ቁልፍ፦ መለያው እንደገና ከጀመረ በኋላ ይሰራል። Passhold አሁን ብቻ ያሳየዋል፣ ስለዚህ ከመቀጠልዎ በፊት ያስቀምጡት።',
  'startOver.waitTitle': 'መለያዎ በ{date} እንደገና ይጀምራል',
  'startOver.waitBody':
    'እስከዚያ ምንም አይለወጥም፣ እና ወደ መለያው የገባ ማንኛውም አሳሽ ማቋረጥ ይችላል። Keyrook አሁን፣ ከመድረሱ በፊት ባለው ቀን፣ እና ሲደርስ ወደ {email} ይልካል።',
  'startOver.waitThen':
    'ከዚያ በኋላ በአዲሱ የይለፍ ቃልዎ እዚህ ይግቡ። በዚህ አሳሽ ያሉ የመግቢያ መረጃዎች በመለያው አዲስ ቁልፎች ስር ይጫናሉ፣ እና ከዚህ በፊት የያዘው ለ90 ቀናት ይቀመጣል።',
  'startOver.waitThenProvider':
    'ከዚያ በኋላ እንደቀድሞው በGoogle ወይም በGitHub እዚህ ይግቡ። በዚህ አሳሽ ያሉ የመግቢያ መረጃዎች በመለያው አዲስ ቁልፎች ስር ይጫናሉ፣ እና ከዚህ በፊት የያዘው ለ90 ቀናት ይቀመጣል።',
  'startOver.understood': 'ገባኝ',
  'startOver.doneTitle': 'መለያዎ እንደገና ተጀምሯል',
  'startOver.doneBody':
    'በአዲሱ የይለፍ ቃልዎ ይግቡ፦ በዚህ አሳሽ ያሉ የመግቢያ መረጃዎች በመለያው አዲስ ቁልፎች ስር ይጫናሉ፣ እና ከዚህ በፊት የያዘው ለ90 ቀናት ይቀመጣል።',
  'startOver.doneBodyProvider':
    'እንደቀድሞው በGoogle ወይም በGitHub ይግቡ፦ በዚህ አሳሽ ያሉ የመግቢያ መረጃዎች በመለያው አዲስ ቁልፎች ስር ይጫናሉ፣ እና ከዚህ በፊት የያዘው ለ90 ቀናት ይቀመጣል።',
  'startOverWait.title': 'የKeyrook መለያዎ በ{date} እንደገና ይጀምራል',
  'startOverWait.body':
    'Keyrook በኢሜይል የላከልዎትን ኮድ በመጠቀም፣ “{device}” ብሎ ከሚጠራ መሣሪያ ተጠይቋል። እርስዎ ያልጠየቁት ከሆነ፣ ኢሜይልዎን አንድ ሰው ሊያነብ ይችላል፦ አሁን ይሰርዙት፣ ከዚያ የኢሜይል የይለፍ ቃልዎን ይቀይሩ። እርስዎ ከጠየቁ ይተዉት።',
  'startOverWait.bodyNoName':
    'Keyrook በኢሜይል የላከልዎትን ኮድ በመጠቀም ተጠይቋል። እርስዎ ያልጠየቁት ከሆነ፣ ኢሜይልዎን አንድ ሰው ሊያነብ ይችላል፦ አሁን ይሰርዙት፣ ከዚያ የኢሜይል የይለፍ ቃልዎን ይቀይሩ። እርስዎ ከጠየቁ ይተዉት።',
  'startOverWait.cancel': 'መለያው እንደገና መጀመሩን ይሰርዙ',
  'kept.title': {
    one: 'መለያው ከመጀመሩ በፊት የተያዘ፦ {count} ንጥል',
    other: 'መለያው ከመጀመሩ በፊት የተያዙ፦ {count} ንጥሎች',
  },
  'kept.body': 'እስከ {date}። የቀድሞው የመለያ የይለፍ ቃል ወይም የቀድሞው የመልሶ ማግኛ ቁልፍ ወደ Passhold ይመልሳቸዋል።',
  'kept.open': 'መልስ',
  'kept.secret': 'የቀድሞው የመለያ የይለፍ ቃል ወይም የቀድሞው የመልሶ ማግኛ ቁልፍ',
  'kept.done': { one: '{count} ንጥል ተመልሷል።', other: '{count} ንጥሎች ተመልሰዋል።' },
  'kept.nothingNew': 'የተያዘው ሁሉ አስቀድሞ እዚህ አለ።',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': 'በ{provider} ይቀጥሉ',
  'provider.passwordTitle': 'ይህ የKeyrook መለያ የይለፍ ቃል አለው',
  'provider.passwordBody':
    'በ{provider} እንደ {email} ገብተዋል። የመለያው የይለፍ ቃል እዚህ Passholdን የሚከፍተው ነው፦ አንድ ጊዜ ያስገቡት።',
  'provider.openAccountPage': 'account.keyrook.comን ክፈት',
  'secondStep.title': 'ባለ ሁለት ደረጃ መግቢያ',
  'secondStep.body':
    'ለKeyrook የማረጋገጫ መተግበሪያዎ የሚያሳየውን ባለ 6 አሃዝ ኮድ ያስገቡ። መተግበሪያውን አጥተዋል? በምትኩ የመለያ መልሶ ማግኛ ቁልፍዎን ይጻፉ።',
  'secondStep.ownerBody':
    'መለያዎ ለዚህም ሁለተኛ ደረጃ ይጠይቃል፦ የማረጋገጫ መተግበሪያዎ የሚያሳየው ኮድ፣ ወይም የመለያ መልሶ ማግኛ ቁልፍዎ።',
  'secondStep.field': 'ኮድ፣ ወይም የመልሶ ማግኛ ቁልፍ',
  'secondStep.continue': 'ቀጥል',
  'secondStep.passkey': 'በምትኩ የይለፍ ቁልፍ ይጠቀሙ',
  'secondStep.nextBody':
    'ለመለያው ቁልፉን መስጠት ኮድ ይጠይቃል፣ እና እያንዳንዱ ኮድ አንድ ጊዜ ብቻ ይሰራል። የማረጋገጫ መተግበሪያዎ አዲስ ኮድ እስኪያሳይ ይጠብቁ፣ ከዚያ ያስገቡት – ወይም የመለያ መልሶ ማግኛ ቁልፍዎን።',
  'provider.or': 'ወይም',
  'provider.signedInWith': 'በ{provider} እንደ {email} ገብተዋል',
  'provider.signedInWithNamed': 'በ{provider} እንደ {name} ({email}) ገብተዋል',
  'provider.newTitle': 'የKeyrook መለያዎን ይፍጠሩ',
  'provider.newBody':
    'በ{provider} እንደ {email} እየገቡ ነው። መለያው የይለፍ ቃል የለውም፦ {provider} ይገባዎታል። በሌላ ኮምፒውተር ቀድሞ የገባ አሳሽ ያስገባዎታል – ወይም ቀጥሎ የሚያገኙት የመልሶ ማግኛ ቁልፍ ያስገባዎታል።',
  'provider.joinTitle': 'ይህ አሳሽ እንዲገባ ይፍቀዱ',
  'provider.joinBody':
    '{email} እዚህ ገብቷል፣ ግን የመግቢያ መረጃዎችዎን የሚከፍተው ቁልፍ በሌሎች ኮምፒውተሮችዎ ላይ ነው። ከእነሱ በአንዱ Passholdን ይክፈቱ – ቅንብሮች፣ መለያ እና ማመሳሰል – እና ይህ አሳሽ እንዲገባ ይፍቀዱ።',
  'provider.waiting': 'ሌላ አሳሽ በመጠበቅ ላይ…',
  'provider.compare': 'ሌላው አሳሽ ኮድ ያሳያል። ይህ ኮምፒውተር ከሆነ ብቻ እዚያ እንዲገባ ይፍቀዱ፦',
  'provider.ended': 'ሌላ አሳሽ ይህን እንዲገባ ከመፍቀዱ በፊት ያ ጥያቄ አብቅቷል።',
  'provider.askAgain': 'እንደገና ጠይቅ',
  'provider.useKit': 'በምትኩ የመልሶ ማግኛ ቁልፉን ይጠቀሙ',
  'provider.useThisKey': 'ይህን ቁልፍ ይጠቀሙ',
  'provider.needsRoot':
    '{email} እያንዳንዱ የKeyrook መተግበሪያ የራሱ ቁልፍ ከመያዙ በፊት በKeyrook Authenticator ተፈጥሯል። Passhold አሁን ቁልፍ ሊሰጠው ይችላል፣ {provider}ን እንደገና ካረጋገጡ በኋላ፤ በAuthenticator ምንም አይለወጥም።',
  'provider.confirmWith': 'በ{provider} ያረጋግጡ',
  'provider.noKeyYet':
    'Passhold በ{email} ቦታ ገና ያልገባ ስለሆነ ሌላ አሳሽ ይህን ሊያስገባ አይችልም። የመለያው መልሶ ማግኛ ቁልፍ ይከፍታል።',
  'passkey.onLabel': 'አዲስ ኮምፒውተሮች በይለፍ ቁልፍዎ ይከፈታሉ',
  'passkey.offLabel': 'ለአዲስ ኮምፒውተሮች የይለፍ ቁልፍ የለም',
  'passkey.body':
    'በአዲስ ኮምፒውተር ላይ፦ {provider}፣ ከዚያ የይለፍ ቁልፍዎ – እና እያንዳንዱ መግቢያ እዚያ ነው። በGoogle የይለፍ ቃል አስተዳዳሪ የተያዘ ሲሆን፣ የይለፍ ቁልፉ በሚገቡበት ማንኛውም Chrome ላይ ይገኛል።',
  'passkey.bodyEdge':
    'በአዲስ ኮምፒውተር ላይ፦ {provider}፣ ከዚያ የይለፍ ቁልፍዎ – እና እያንዳንዱ መግቢያ እዚያ ነው። የሚመሳሰልበት ቦታ ላይ ሲቀመጥ፣ የይለፍ ቁልፉ በሌሎች መሣሪያዎችዎ ላይም ይገኛል።',
  'passkey.turnOn': 'አብራ',
  'passkey.turnOff': 'አጥፋ',
  'passkey.joinTitle': 'በይለፍ ቁልፍዎ ይክፈቱ',
  'passkey.joinBody': '{email} ለአዲስ ኮምፒውተሮች የይለፍ ቁልፍ አለው። በእሱ ያረጋግጡ፣ የመግቢያ መረጃዎችዎ ይወርዳሉ።',
  'passkey.use': 'የይለፍ ቁልፍ ይጠቀሙ',
  'passkey.otherWays': 'ሌሎች የመግቢያ መንገዶች',
  'pairing.asking': '{device} ወደ መለያዎ እንዲገባ እየጠየቀ ነው።',
  'pairing.start': 'እንዲገባ ፍቀድ…',
  'pairing.notMe': 'እኔ አይደለሁም',
  'pairing.compare': 'አዲሱ አሳሽ ይሄንን ኮድ ብቻ ካሳየ እንዲገባ ይፍቀዱ፦',
  'pairing.match': 'ኮዶቹ ይመሳሰላሉ – ይግባ',
  'pairing.differ': 'ኮዶቹ ይለያያሉ',

  'accountKit.title': 'የመለያዎን መልሶ ማግኛ ቁልፍ ያስቀምጡ',
  'accountKit.body':
    'የKeyrook መለያዎን የይለፍ ቃል ከረሱ፣ ይህ ቁልፍ አዲስ ያዘጋጃል – ለPasshold እና ለKeyrook Authenticator በእኩልነት። Keyrook የይለፍ ቃልዎን በጭራሽ አያየውም፣ ስለዚህ ይህ ብቸኛ መንገድ ነው። በቅንብሮች ዳግም ማየት ይችላሉ፤ በሌላ ቦታም ያስቀምጡት።',
  'accountKit.fileTitle': 'የKeyrook መለያ መልሶ ማግኛ ቁልፍ',
  'accountKit.fileBody':
    'የKeyrook መለያዎን የይለፍ ቃል ከረሱ፣ ይህ ቁልፍ አዲስ ያዘጋጃል፦ በPasshold ውስጥ፣ ቅንብሮች → መለያ እና ማመሳሰል → “የይለፍ ቃሉን ረሱት?”። እሱ እና የኢሜይል አድራሻዎ ያለው ማንኛውም ሰው ተመሳሳይ ማድረግ ይችላል፤ ስለዚህ በደህና ያስቀምጡት እንጂ በዚህ ኮምፒውተር ላይ አይሁን።',
  'accountKit.bodyNoPassword':
    'መለያዎ የይለፍ ቃል የለውም፦ አስቀድሞ የገባ አሳሽ አዲስ ያስገባል። ምንም ካልቀረ ይህ ቁልፍ ያስገባል – ለPasshold እና ለKeyrook Authenticator በእኩልነት። በቅንብሮች ዳግም ማየት ይችላሉ፤ በሌላ ቦታም ያስቀምጡት።',
  'accountKit.fileBodyNoPassword':
    'ከKeyrook መለያዎ ጋር የገባ ኮምፒውተር ካልቀረ፣ ይህ ቁልፍ አዲስ ያስገባል፦ በGoogle ወይም በGitHub ይግቡ፣ ከዚያ “በምትኩ የመልሶ ማግኛ ቁልፉን ይጠቀሙ”ን ይምረጡ። እሱ ያለው እና እንደርስዎ መግባት የሚችል ማንኛውም ሰው ተመሳሳይ ማድረግ ይችላል፤ ስለዚህ በደህና ያስቀምጡት እንጂ በዚህ ኮምፒውተር ላይ አይሁን።',
  'accountKit.whenTitleNoPassword': 'ኮምፒውተር ሳይገባ ሲቀር',
  'accountKit.inPassholdNoPassword':
    'በPasshold፦ በGoogle ወይም በGitHub ይግቡ፣ “በምትኩ የመልሶ ማግኛ ቁልፉን ይጠቀሙ”ን ይምረጡ፣ እና ይህን ቁልፍ ይጻፉ።',
  'accountKit.keepNoPassword':
    'ይህን ወረቀት ከኮምፒውተርዎ ርቆ በደህና ቦታ ያስቀምጡ። ይዞት በGoogle ወይም በGitHub መለያዎ መግባት የሚችል ማንኛውም ሰው የKeyrook መለያዎን መክፈት ይችላል።',
  'accountKit.rowBodyNoPassword': 'ሌላ ምንም ሳይቀር ሲቀር አዲስ ኮምፒውተር ያስገባል።',
  'accountKit.sheetTitle': 'የKeyrook መለያ መልሶ ማግኛ ወረቀት',
  'accountKit.whenTitle': 'የመለያ የይለፍ ቃል ሲረሳ',
  'accountKit.inPasshold':
    'በPasshold፦ ቅንብሮች → መለያ እና ማመሳሰል → “የይለፍ ቃሉን ረሱት?”፣ ከዚያ የኢሜይል አድራሻዎ፣ Keyrook በኢሜይል የሚልከው ኮድ፣ ይህ ቁልፍ፣ እና አዲስ የይለፍ ቃል።',
  'accountKit.inAuthenticator':
    'Keyrook Authenticator ተመሳሳይ ቁልፍ ይቀበላል፦ ለመግባት ሲጠይቅ “የይለፍ ቃሉን ረሱት?”።',
  'accountKit.keep':
    'ይህን ወረቀት ከኮምፒውተርዎ ርቆ በደህና ቦታ ያስቀምጡ። ይዞት የኢሜይል ሳጥንዎ ያለው ማንኛውም ሰው ለመለያው አዲስ የይለፍ ቃል ማዘጋጀት ይችላል።',
  'accountKit.pending': 'የመለያ መልሶ ማግኛ ቁልፍ አልተቀመጠም',
  'accountKit.keptState': 'የመለያ መልሶ ማግኛ ቁልፍ ተቀምጧል',
  'accountKit.elsewhere': 'የመለያ መልሶ ማግኛ ቁልፍ በሌላ ቦታ ተፈጥሯል',
  'accountKit.none': 'የመለያ መልሶ ማግኛ ቁልፍ የለም',
  'accountKit.rowBody': 'የይለፍ ቃሉ ከተረሳ አዲስ ያዘጋጃል። አዲስ ቁልፍ አሮጌው በሁሉም መተግበሪያ እንዳይሰራ ያቆማል።',
  'accountKit.elsewhereBody':
    'በaccount.keyrook.com፣ በKeyrook Authenticator ወይም በሌላ አሳሽ የተፈጠረ፦ ቁልፉ በዚያን ጊዜ በተቀመጠው ወረቀት ላይ ነው። እዚህ አንድ መፍጠር ያኛውን መስራት ያቆማል።',
  'accountKit.noneBody':
    'ያለሱ የተረሳ የመለያ የይለፍ ቃል ዳግም ሊዘጋጅ አይችልም፤ በKeyrook የተያዘውም ሊከፈት አይችልም። በዚህ አሳሽ ያሉ የመግቢያ መረጃዎች ግን በማንኛውም ሁኔታ ይቀራሉ።',
  'accountKit.make': 'አንድ ይፍጠሩ',
  'accountKit.apart':
    'ከኢሜይልዎ ለይተው ያቆዩት፦ ይህ ቁልፍ ያለው እና ኢሜይልዎን ማንበብ የሚችል ማንኛውም ሰው አዲስ የይለፍ ቃል ማዘጋጀት እና የመግቢያ መረጃዎችዎን መክፈት ይችላል። ለራስዎ በኢሜይል አይላኩት፣ ወይም በዚያ ኢሜይል የደመና ማከማቻ ውስጥ አያስቀምጡት።',
  'accountKit.apartNoPassword':
    'ከሚገቡበት የGoogle ወይም የGitHub መለያ ለይተው ያቆዩት፦ ይህ ቁልፍ ያለው እና እዚያ እንደርስዎ መግባት የሚችል ማንኛውም ሰው የመግቢያ መረጃዎችዎን መክፈት ይችላል። ለራስዎ በኢሜይል አይላኩት፣ ወይም በዚያ መለያ የደመና ማከማቻ ውስጥ አያስቀምጡት።',
  'accountKit.unchecked': 'የመለያ መልሶ ማግኛ ቁልፍ ገና አልተረጋገጠም',
  'accountKit.uncheckedBody':
    'መለያዎ በaccount.keyrook.com ወይም በሌላ መተግበሪያ የተፈጠረ የመልሶ ማግኛ ቁልፍ አለው። አንድ ጊዜ ያስገቡት፦ Passhold መለያዎን እንደሚከፍት ያረጋግጣል፣ እና እንደገና እንዲያሳዩዎት ይይዘዋል።',
  'accountKit.typeIt': 'ያስገቡት',
  'accountKit.checked': 'መለያዎን ይከፍታል። Passhold እዚህ እንደገና እንዲያሳይዎት አሁን ይይዘዋል።',
  'accountKit.draftBody':
    'የመለያዎ አዲስ የመልሶ ማግኛ ቁልፍ። ገና አይሰራም፦ ካስቀመጡት እና እንደገና ካስገቡት በኋላ፣ የመለያዎ የይለፍ ቃል ያዘጋጀዋል፣ አሮጌው ደግሞ መስራት ያቆማል።',
  'accountKit.setTitle': 'አዲስ የመልሶ ማግኛ ቁልፍዎን ያዘጋጁ',
  'accountKit.setBody':
    'የKeyrook መለያዎን የይለፍ ቃል ያስገቡ። እስከዚያ ድረስ አሮጌው የመልሶ ማግኛ ቁልፍዎ ይሰራል፣ ይህኛው ግን አይሰራም።',
  'accountKit.set': 'አዘጋጅ',

  'checkup.clear': 'የሚስተካከል ነገር የለም',
  'checkup.clearBody': 'ደካማ ወይም ደጋግመው የተጠቀሙባቸው የይለፍ ቃሎች የሉም፣ እና መጠባበቂያዎ ወቅታዊ ነው።',
  'checkup.issues': { one: 'ለመመልከት {count} ነገር', other: 'ለመመልከት {count} ነገሮች' },
  'checkup.issuesBody': 'ከታች ያለው እያንዳንዱ ለምን እንደሚያስፈልግ እና እንዴት እንደሚስተካከል ያብራራል።',
  'checkup.backup': 'መጠባበቂያ',
  'checkup.access': 'መግባት',
  'checkup.recoveryPending':
    'ለዚህ ካዝና የተፈጠረው የመልሶ ማግኛ ቁልፍ እንደተቀመጠ ፈጽሞ አልተረጋገጠም፣ {method} መስራት ካቆመ ብቸኛው መግቢያ ነው። አዲስ አንድ ይፍጠሩ እና ያስቀምጡት።',
  'checkup.deviceMissing':
    'ይህ ካዝና ዋና የይለፍ ቃል የለውም፣ ስለዚህ እዚህ ያለ {method} እያንዳንዱ መክፈቻ የመልሶ ማግኛ ቁልፍ ይጠይቃል።',
  'checkup.lastBackup': 'የመጨረሻው መጠባበቂያ {date}',
  'checkup.backupNever':
    'ይህ አሳሽ ከጠፋ የመግቢያ መረጃዎችዎም ይጠፋሉ። መጠባበቂያ በሌላ ቦታ የሚያቆዩት አንድ የተመሰጠረ ፋይል ነው።',
  'checkup.backupDue': 'ካዝናዎ ከዚያ ወዲህ ተቀይሯል። ሁሉንም እንዲይዝ አዲስ ይፍጠሩ።',
  'checkup.backUp': 'አሁን መጠባበቂያ ይፍጠሩ',
  'checkup.weak': { one: 'አንድ ደካማ የይለፍ ቃል', other: '{count} ደካማ የይለፍ ቃሎች' },
  'checkup.weakBody':
    'ለመገመት በቂ አጭር ወይም ቀላል። እያንዳንዱን በድረ-ገጹ ላይ ይቀይሩ፤ Passhold በቅጹ ጠንካራ ይጠቁማል እና ለማስቀመጥ ያቀርባል።',
  'checkup.weakNone': 'ምንም የለም።',
  'checkup.reused': {
    one: 'አንድ የይለፍ ቃል ከአንድ ጊዜ በላይ የተጠቀሙበት',
    other: '{count} የይለፍ ቃሎች ከአንድ ጊዜ በላይ የተጠቀሙባቸው',
  },
  'checkup.reusedBody':
    'አንድ ድረ-ገጽ የይለፍ ቃል ሲያወጣ ሰዎች በሌላ ቦታ ሁሉ ይሞክሩታል። እያንዳንዱ መግቢያ የራሱ የይለፍ ቃል ይኑረው።',
  'checkup.reusedNone': 'ምንም የለም፦ እያንዳንዱ መግቢያ የራሱ የይለፍ ቃል አለው።',
  'checkup.sharedBy': { one: 'በ{count} መግቢያ የተጋራ', other: 'በ{count} መግቢያዎች የተጋራ' },
  'checkup.change': 'ቀይር',
  'checkup.limits':
    'Passhold የይለፍ ቃል በመረጃ ጥሰት መገኘቱን አያረጋግጥም፦ ይህ አገልጋይ መጠየቅን ይጠይቃል፣ Passhold ግን ማንንም አገልጋይ አይጠይቅም። የቆዩ የይለፍ ቃሎችንም አያስታውስም – ጠንካራ እና ልዩ የይለፍ ቃል አያረጅም።',

  'backup.description': 'የተመሰጠረ ቅጂ ያስቀምጡ፣ አንዱን መልሰው ያምጡ፣ ወይም የመግቢያ መረጃዎችን ወደ ውስጥ እና ወደ ውጭ ያንቀሳቅሱ።',
  'backup.backupRow': 'ሙሉ ካዝናዎ በአንድ የተመሰጠረ ፋይል፣ በዋና የይለፍ ቃልዎ ስር።',
  'backup.restoreRow': 'በመጠባበቂያ ፋይል ያሉትን የመግቢያ መረጃዎች ወደዚህ ካዝና ይጨምሩ።',
  'backup.importRow': 'ከሌላ አሳሽ ወይም የይለፍ ቃል አስተዳዳሪ፣ እንደ CSV ፋይል ወይም የBitwarden JSON።',
  'backup.exportRow': 'ሌሎች መተግበሪያዎች ማንበብ የሚችሉት CSV ፋይል። አልተመሰጠረም።',

  'security.description': 'Passhold እንዴት እንደሚከፈት እና መቼ እንደገና እንደሚዘጋ።',
  'security.locking': 'መቆለፍ',
  'security.opensTitle': 'Passhold እንዴት ይከፈታል',
  'security.opensBody': 'ዋና የይለፍ ቃል የለም፦ {method} ይከፍተዋል፣ {method} ማድረግ በማይችልበት ጊዜ ደግሞ የመልሶ ማግኛ ቁልፉ።',
  'security.setPassword': 'በምትኩ ዋና የይለፍ ቃል ይጠቀሙ',
  'security.setPasswordBody': 'ከዚያ Passhold በመረጡት የይለፍ ቃል ይከፈታል፣ እና የመልሶ ማግኛ ቁልፉ መክፈት ያቆማል።',
  'security.setPasswordOpen': 'አዘጋጅ',
  'security.setPasswordSave': 'ይህን የይለፍ ቃል ይጠቀሙ',
  'security.dropPassword': 'ዋና የይለፍ ቃል መጠቀም አቁም',
  'security.dropPasswordBody':
    'በ{method} ብቻ ይክፈቱ፣ ማድረግ በማይችልበት ቀን የመልሶ ማግኛ ቁልፍ ያቆዩ። ዋና የይለፍ ቃሉ ካዝናውን መክፈት ያቆማል።',
  'security.dropPasswordOpen': 'ቀይር',
  'security.dropPasswordSave': 'ቀይር እና የመልሶ ማግኛ ቁልፉን አሳይ',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'የመሣሪያዎ የማያ መቆለፊያ',
  'device.method.passkey': 'የይለፍ ቁልፍዎ',
  'device.title': 'በ{method} ይክፈቱ',
  'device.description': 'በጣም ፈጣኑ መግቢያ ነው፣ አሳሹ ከዳግም ከጀመረ በኋላም ይሰራል።',
  'device.on': 'በርቷል',
  'device.off': 'ጠፍቷል',
  'device.body':
    'ጣት አሻራዎ ወይም ፊትዎ Passholdን ይከፍታል – ወይም በአብዛኞቹ ኮምፒውተሮች ላይ የኮምፒውተሩ የይለፍ ቃል። ስለዚህ ይህን ኮምፒውተር መክፈት የሚችል ሰው Passholdን መክፈት ይችላል። የሚከፍተው በዚህ ኮምፒውተር ላይ ይቀራል፣ ያለ እሱ ጥቅም የለውም።',
  'device.whereMac':
    'Chrome የይለፍ ቁልፉን የት እንደሚያስቀምጡ ሲጠይቅ “የጉግል የይለፍ ቃል አስተዳዳሪ”ን ይምረጡ። በChrome መገለጫዎ ውስጥ ያለ የይለፍ ቁልፍ Passholdን መክፈት አይችልም፤ በአንዳንድ Mac ላይ ያለ iCloud Keychainም አይችልም።',
  'device.whereMacEdge':
    'Edge የይለፍ ቁልፉን የት እንደሚያስቀምጡ ሲጠይቅ በሌሎች መሣሪያዎችዎ ላይም የሚገኝበትን ቦታ ይምረጡ። ሁሉም ቦታ Passholdን መክፈት አይችልም፦ የመረጡት ካልቻለ Passhold ይነግርዎታል፣ ምንም አይለወጥም።',
  'device.unavailable': 'እዚህ አይገኝም',
  'device.unavailableBody': 'ይህ አሳሽ Passhold ሊጠቀምበት የሚችል የጣት አሻራ፣ ፊት ወይም የማያ መቆለፊያ አላገኘም። PIN በሁሉም ቦታ ይሰራል።',
  'device.unavailableRecovery':
    'ይህ አሳሽ Passhold ሊጠቀምበት የሚችል የጣት አሻራ፣ ፊት ወይም የማያ መቆለፊያ አላገኘም፣ ስለዚህ ይህ ካዝና እዚህ በመልሶ ማግኛ ቁልፉ ይከፈታል። ይህን መፃፍ ከመረጡ ዋና የይለፍ ቃል ያዘጋጁ።',
  'device.opensWith': '{method} Passholdን ይከፍታል',
  'device.notHere': '{method} በዚህ አሳሽ አልተዋቀረም',
  'device.isTheWayIn':
    'ዋና የይለፍ ቃል በሌለበት ጊዜ Passhold በዚህ ይከፈታል። ለማጥፋት መጀመሪያ ዋና የይለፍ ቃል ያዘጋጁ።',
  'device.setUpHere': '{method} እዚህ እስካልተዋቀረ ድረስ እያንዳንዱ መክፈቻ የመልሶ ማግኛ ቁልፉን ይጠይቃል።',
  'device.setUp': 'አዋቅር',
  'device.turnOff': 'አጥፋ',
  'device.save': '{method}ን ያዋቅሩ',
  'keys.title': 'በደህንነት ቁልፍ ይክፈቱ',
  'keys.description': 'የሚሰኩት የUSB ቁልፍ፦ ሌላ መግቢያ መንገድ፣ አሳሹ ከዳግም ከጀመረ በኋላም ይሰራል።',
  'keys.method': 'የደህንነት ቁልፍዎ',
  'keys.on': { one: '{count} ቁልፍ ተዋቅሯል', other: '{count} ቁልፎች ተዋቅረዋል' },
  'keys.off': 'ምንም ቁልፍ አልተዋቀረም',
  'keys.body':
    'ቁልፉን ይሰኩ፣ PINዎን ይጻፉ እና ይንኩት፣ Passhold ይከፈታል – በዚህ ኮምፒውተር ላይ ብቻ። ቁልፉን የያዘ እና PINውን የሚያውቅ ሰው Passholdን እዚህ ሊከፍት ይችላል፤ ስለዚህ እንደ ቤት ቁልፍ ይያዙት። ከጠፋ እዚህ ያስወግዱት፦ ሌሎች የመግቢያ መንገዶችዎ ይሰራሉ።',
  'keys.add': 'ቁልፍ ጨምር',
  'keys.save': 'ይህን ቁልፍ ጨምር',
  'keys.one': 'የደህንነት ቁልፍ',
  'keys.added': 'የተጨመረው {date}',
  'keys.remove': 'አስወግድ',
  'pin.title': 'በPIN ይክፈቱ',
  'pinOffer.title': 'Passholdን በPIN በፍጥነት ይክፈቱ',
  'pinOffer.body':
    'Passhold በተቆለፈ ቁጥር ይለፍ ቃልዎ ፈንታ ጥቂት አሃዞችን ይጻፉ፣ አሳሹ እስኪዘጋ ድረስ። አሳሹ ዳግም ከጀመረ በኋላ አንድ ጊዜ የይለፍ ቃልዎ።',
  'pinOffer.later': 'በማንኛውም ጊዜ በቅንብሮች፣ ደህንነት ውስጥ ማዋቀር ወይም ማጥፋት ይችላሉ።',
  'pin.description': 'በዚያው አሳሽ ላይ ሲሆኑ Passhold በቀን ብዙ ጊዜ ለሚቆለፍበት።',
  'pin.on': 'በርቷል',
  'pin.off': 'ጠፍቷል',
  'pin.bodyRecovery':
    'አሳሹ ክፍት ሆኖ ሲቆይ ብቻ ይሰራል፣ እና አምስት የተሳሳቱ ሙከራዎች ብቻ፦ ከዚያ በኋላ፣ ወይም ዳግም ከጀመረ በኋላ መሣሪያው ወይም የመልሶ ማግኛ ቁልፉ ያስፈልጋል። PIN የሚከፍተው ምንም በዲስክ ላይ አይቀመጥም።',
  'pin.body':
    'አሳሹ ክፍት ሆኖ ሲቆይ ብቻ ይሰራል፣ እና አምስት የተሳሳቱ ሙከራዎች ብቻ፦ ከዚያ በኋላ፣ ወይም ዳግም ከጀመረ በኋላ ዋና የይለፍ ቃሉ ያስፈልጋል። PIN የሚከፍተው ምንም በዲስክ ላይ አይቀመጥም።',
  'pin.setUp': 'PIN አዋቅር',
  'pin.change': 'ቀይር',
  'pin.turnOff': 'አጥፋ',
  'pin.new': 'PIN፣ ከ6 እስከ 12 አሃዞች',
  'pin.again': 'እንደገና ይጻፉት',
  'pin.save': 'PIN ያስቀምጡ',

  'general.description': 'Passhold በድረ-ገጾች ላይ እንዴት እንደሚሠራ እና እንዴት እንደሚመስል።',
  'general.filling': 'መሙላት እና ማስቀመጥ',
  'general.appearance': 'ቋንቋ እና መልክ',
  'settings.autoSuggest': 'የመግቢያ፣ የካርድ ወይም የአድራሻ መስክ ሲጫኑ ጥቆማዎችን አሳይ',
  'settings.autoSuggestBody':
    'ለድረ-ገጹ የመግቢያ መረጃዎችዎ፣ በምዝገባ ቅጽ ላይ ጠንካራ የይለፍ ቃል፣ በክፍያ ጊዜ ካርዶችዎ እና አድራሻዎችዎ። እስኪመርጡ ድረስ ምንም አይሞላም።',

  'trash.description': 'መግቢያዎች፣ ካርዶች፣ አድራሻዎች እና ማስታወሻዎች እስኪመልሷቸው ወይም ለዘለቄታው እስኪሰርዙ ድረስ እዚህ ይጠብቃሉ።',
  'trash.sharedDescription':
    'ከቤተሰቡ ጋር የተጋሩ፦ በውስጡ ያለ ማንም ሊመልሳቸው ይችላል። ለዘለቄታው ከተሰረዙ ለሁሉም ይጠፋሉ።',
  'trash.sharedMember':
    'ከቤተሰቡ ጋር የተጋሩ፦ እነዚህን መመለስ ይችላሉ። ለዘለቄታው የሚሰርዟቸው የቤተሰቡ አደራጅ ብቻ ነው።',
  'settings.autoLock': 'ከዚህ በኋላ ቆልፍ',
  'settings.autoLock.never': 'አሳሹ ሲዘጋ ብቻ',
  'settings.autoLock.minutes': { one: '{count} ደቂቃ', other: '{count} ደቂቃዎች' },
  'settings.autoLock.hours': { one: '{count} ሰዓት', other: '{count} ሰዓቶች' },
  'settings.lockWithSystem': 'ኮምፒውተሩ ሲቆለፍ ወይም ወደ እንቅልፍ ሲገባ ቆልፍ',
  'settings.clipboard': 'የተቀዱ የይለፍ ቃሎችን ከዚህ በኋላ አጽዳ',
  'settings.clipboard.never': 'በጭራሽ',
  'settings.clipboard.seconds': { one: '{count} ሰከንድ', other: '{count} ሰከንዶች' },
  'settings.clipboard.minutes': { one: '{count} ደቂቃ', other: '{count} ደቂቃዎች' },
  'settings.inlineButton': 'በመግቢያ፣ በካርድ እና በአድራሻ መስኮች ላይ የPasshold አዝራር አሳይ',
  'settings.offerToSave': 'ሲገቡ መግቢያዎችን ለማስቀመጥ አቅርብ',
  'settings.offerToSaveCards': 'ሲከፍሉ ካርዶችን እና አድራሻዎችን ለማስቀመጥ አቅርብ',
  'settings.offerToSaveCardsBody':
    'ካርድ ከደህንነቱ በተጠበቀ (https) ገጽ ብቻ፣ እና ቁጥሩ የሚስማማ ብቻ። በመጨረሻዎቹ አራት አሃዞቹ ይታያል፤ ቁጥሩ ወይም ኮዱ በጭራሽ አይታይም።',
  'settings.passkeys': 'የይለፍ ቁልፎችን አስቀምጥ እና ተጠቀም',
  'settings.passkeysBody':
    'ድረ-ገጽ የይለፍ ቁልፍ ሲያቀርብ፣ Passhold ከመግቢያ መረጃዎችዎ ጋር ያስቀምጠዋል እና በእሱ ያስገባዎታል። ሲጠፋ የይለፍ ቁልፎች ለአሳሹ ይተዋሉ።',
  'settings.language': 'ቋንቋ',
  'settings.language.auto': 'እንደ አሳሹ',
  'settings.theme': 'መልክ',
  'settings.theme.system': 'እንደ ሲስተሙ',
  'settings.theme.light': 'ብሩህ',
  'settings.theme.dark': 'ጨለማ',

  'settings.security': 'ዋና የይለፍ ቃል',
  'settings.securityBody': 'ሲቀየር የካዝናዎ ቁልፍ እንደገና ይቆለፋል፤ የመግቢያ መረጃዎችዎ እንዳሉ ይቀራሉ።',
  'settings.current': 'የአሁኑ ዋና የይለፍ ቃል',
  'settings.new': 'አዲስ ዋና የይለፍ ቃል',
  'settings.confirm': 'አዲሱን እንደገና ይጻፉ',
  'settings.change': 'ዋና የይለፍ ቃል ቀይር',
  'settings.changeOpen': 'ቀይር',
  'settings.changed': 'ዋና የይለፍ ቃል ተቀይሯል።',

  'settings.backup': 'መጠባበቂያ',
  'settings.backupBody':
    'ሙሉ ካዝናዎ በአንድ የተመሰጠረ ፋይል። ከዚህ ኮምፒውተር ውጭ – እንደ USB ዱላ ወይም የደመና ማከማቻዎ – ያቆዩት፤ ይህ አሳሽ ቢጠፋ የመግቢያ መረጃዎችዎ እንዳይጠፉ። የሚከፈተው ሲፈጥሩት ባለዎት ዋና የይለፍ ቃል ብቻ ነው።',
  'settings.backupBodyRecovery':
    'ሙሉ ካዝናዎ በአንድ የተመሰጠረ ፋይል። ከዚህ ኮምፒውተር ውጭ – እንደ USB ዱላ ወይም የደመና ማከማቻዎ – ያቆዩት፤ ይህ አሳሽ ቢጠፋ የመግቢያ መረጃዎችዎ እንዳይጠፉ። በመልሶ ማግኛ ቁልፍዎ ይከፈታል።',
  'settings.backupLast': 'የመጨረሻው መጠባበቂያ፦ {date}',
  'settings.backupNever': 'እስካሁን መጠባበቂያ የለም።',
  'settings.backupButton': 'መጠባበቂያ አውርድ',
  'settings.backupDone': 'በውርዶችዎ ውስጥ ተቀምጧል። አሁን ከዚህ ኮምፒውተር ውጭ ወዳለ ቦታ ያንቀሳቅሱት።',

  'settings.restoreBackup': 'ከመጠባበቂያ ቅጂ ወደነበረበት ይመልሱ',
  'settings.restoreBodyNew':
    'በዚህ አሳሽ ላይ እስካሁን ካዝና የለም። ከመጠባበቂያ ፋይል መልሰው ያምጡት – ቅጂው በተፈጠረበት ዋና የይለፍ ቃል ይከፈታል – ወይም በመሳሪያ አሞሌው ካለው Passhold አዝራር አዲስ ይፍጠሩ።',
  'settings.restoreBodyMerge':
    'በመጠባበቂያው ያለውን ወደዚህ ካዝና ይጨምራል። እዚህ ምንም አይሰረዝም፦ ሁለቱም አንድ መግቢያ ካላቸው፣ አዲሱ አርትዖት ይቀመጣል፣ ሌላው የይለፍ ቃል ወደ ታሪኩ ይገባል።',
  'settings.restoreChoose': 'የመጠባበቂያ ፋይል ይምረጡ',
  'settings.restoreMade': 'መጠባበቂያው የተፈጠረው {date}',
  'settings.restorePassword': 'የመጠባበቂያው ዋና የይለፍ ቃል',
  'settings.restoreRecoveryKey': 'የመጠባበቂያው የመልሶ ማግኛ ቁልፍ',
  'settings.restoreButton': 'መልስ',
  'settings.restoreNew': {
    one: 'ካዝናው ተመልሷል፣ {count} ንጥል አለው።',
    other: 'ካዝናው ተመልሷል፣ {count} ንጥሎች አሉት።',
  },
  'settings.restoreAdded': {
    one: 'ከመጠባበቂያው {count} ንጥል ተጨምሯል።',
    other: 'ከመጠባበቂያው {count} ንጥሎች ተጨምረዋል።',
  },
  'settings.restoreUpdated': {
    one: '{count} ንጥል በመጠባበቂያው ውስጥ አዲስ አርትዖት ነበረው።',
    other: '{count} ንጥሎች በመጠባበቂያው ውስጥ አዲስ አርትዖት ነበራቸው።',
  },
  'settings.restoreNothing': 'በመጠባበቂያው ያለው ሁሉ አስቀድሞ በዚህ ካዝና ውስጥ አለ።',

  'settings.import': 'ማስመጣት',
  'settings.importBody':
    'የይለፍ ቃሎችዎን ከChrome፣ Edge፣ Firefox፣ Safari፣ Apple Passwords፣ Bitwarden፣ 1Password፣ LastPass፣ KeePass፣ Dashlane፣ Proton Pass ወይም NordPass ያምጡ፦ እዚያ እንደ CSV ፋይል ይላኩ፣ ከዚያ እዚህ ይምረጡት። በፋይሉ ያሉ ካርዶች፣ አድራሻዎች እና ማስታወሻዎችም ይመጣሉ። ከBitwarden በJSON (ያልተመሰጠረ) ይላኩ፦ የCSV ፋይሉ ካርዶችን፣ ማንነቶችን እና የይለፍ ቁልፎችን ይተዋል። Dashlane እነዚህን በራሳቸው ፋይሎች ያስቀምጣል፤ እያንዳንዱን በተራ ይምረጡ።',
  'settings.importChoose': 'ፋይል ይምረጡ',
  'settings.importFound': 'ለማስመጣት {what} ተገኝቷል።',
  'settings.importLogins': { one: '{count} መግቢያ', other: '{count} መግቢያዎች' },
  'settings.importPasskeys': { one: '{count} የይለፍ ቁልፍ', other: '{count} የይለፍ ቁልፎች' },
  'settings.importCards': { one: '{count} ካርድ', other: '{count} ካርዶች' },
  'settings.importAddresses': { one: '{count} አድራሻ', other: '{count} አድራሻዎች' },
  'settings.importNotes': { one: '{count} ማስታወሻ', other: '{count} ማስታወሻዎች' },
  'settings.importSkipped': {
    one: '{count} ግቤት Passhold የሚይዘው ምንም የሌለው ስለሆነ ይቀራል።',
    other: '{count} ግቤቶች Passhold የሚይዘው ምንም የሌላቸው ስለሆኑ ይቀራሉ።',
  },
  'settings.importDuplicates': {
    one: '{count} በካዝናዎ ውስጥ አስቀድሞ አለ።',
    other: '{count} በካዝናዎ ውስጥ አስቀድመው አሉ።',
  },
  'settings.importConfirm': 'አስመጣ',
  'settings.importDone': '{what} ተስመጥቷል።',
  'settings.importDelete': 'አሁን የCSV ፋይሉን ይሰርዙ፦ የይለፍ ቃሎችዎን በግልጽ ጽሑፍ ይዟል።',
  'settings.importNothing': 'በዚያ ፋይል ለማስመጣት አዲስ ነገር የለም።',
  'settings.importTwoFactor': {
    one: 'በዚህ ፋይል ያለ አንድ መግቢያ ባለ ሁለት ደረጃ (2FA) ኮድ አለው። Passhold 2FA ኮዶችን አያስቀምጥም፦ የቀድሞ የይለፍ ቃል አስተዳዳሪዎን ከመሰረዝዎ በፊት ወደ ማረጋገጫ መተግበሪያ ያዛውሩት፤ ያለዚያ ከዚያ መለያ ሊቆለፉ ይችላሉ።',
    other: '{count} መግቢያዎች በዚህ ፋይል ባለ ሁለት ደረጃ (2FA) ኮዶች አሏቸው። Passhold 2FA ኮዶችን አያስቀምጥም፦ የቀድሞ የይለፍ ቃል አስተዳዳሪዎን ከመሰረዝዎ በፊት ወደ ማረጋገጫ መተግበሪያ ያዛውሯቸው፤ ያለዚያ ከእነዚያ መለያዎች ሊቆለፉ ይችላሉ።',
  },
  'settings.importAuthenticator': 'Keyrook Authenticator ያግኙ',
  'settings.importPasskeysLeft': {
    one: 'በዚህ ፋይል ያለ አንድ የይለፍ ቁልፍ ወደ Passhold መድረስ አይችልም። የቀድሞ የይለፍ ቃል አስተዳዳሪዎን ያቆዩ፣ ያ ድረ-ገጽ ላይ በሌላ መንገድ እስኪገቡ እና በPasshold አዲስ የይለፍ ቁልፍ እስኪፈጥሩ ድረስ።',
    other: 'በዚህ ፋይል ያሉ {count} የይለፍ ቁልፎች ወደ Passhold መድረስ አይችሉም። የቀድሞ የይለፍ ቃል አስተዳዳሪዎን ያቆዩ፣ እነዚያ ድረ-ገጾች ላይ በሌላ መንገድ እስኪገቡ እና በPasshold አዲስ የይለፍ ቁልፎች እስኪፈጥሩ ድረስ።',
  },

  'settings.export': 'ላክ',
  'settings.exportBody':
    'እያንዳንዱ አሳሽ እና የይለፍ ቃል አስተዳዳሪ ማንበብ የሚችለው CSV ፋይል። የይለፍ ቃሎችዎን በግልጽ ጽሑፍ ይዟል፦ የሚያስፈልግዎ ጊዜ ብቻ ያቆዩት። መግቢያዎችን ብቻ ይዟል፦ የይለፍ ቁልፎች፣ የራስ መስኮች፣ አቃፊዎች፣ ካርዶች፣ አድራሻዎች እና ማስታወሻዎች በውስጡ የሉም። መጠባበቂያ ሁሉንም ይይዛል።',
  'settings.exportButton': 'CSV ላክ',
  'settings.exportDone': 'ተልኳል። ከጨረሱ በኋላ ፋይሉን ይሰርዙ።',

  'settings.neverSave': 'ለማስቀመጥ በጭራሽ አታቅርብ',
  'settings.neverSaveEmpty':
    'ድረ-ገጾች የሉም። Passhold ለማስቀመጥ ሲያቀርብ “ለዚህ ድረ-ገጽ በጭራሽ”ን ይምረጡ፣ ከዚያ እዚህ ይታያል።',
  'settings.remove': 'አስወግድ',

  'settings.trash': 'መጣያ',
  'settings.trashEmpty': 'መጣያው ባዶ ነው።',
  'settings.restore': 'መልስ',
  'settings.deleteForever': 'ለዘለቄታው ሰርዝ',
  'settings.emptyTrash': 'መጣያውን አጽዳ',
  'settings.emptyTrashConfirm': 'በመጣያው ያለውን ሁሉ ለዘለቄታው ይሰርዙ?',

  'settings.danger': 'ካዝናውን አስወግድ',
  'settings.dangerBody':
    'ካዝናውን ከዚህ አሳሽ ይሰርዛል። በውስጡ ያለ እያንዳንዱ መግቢያ ለዘለቄታው ይጠፋል – ማቆየት ከፈለጉ መጀመሪያ መጠባበቂያ ያውርዱ።',
  'settings.dangerType': 'ለማረጋገጥ {word} ይጻፉ',
  'settings.dangerWord': 'ሰርዝ',
  'settings.dangerButton': 'ካዝናውን አስወግድ',

  'settings.about': 'Passhold {version} · በKeyrook',

  // Errors
  'error.noWorker': 'Passhold ምላሽ አልሰጠም። ይህን ይዝጉ እና እንደገና ይሞክሩ።',
  'error.wrongPassword': 'ይህ ዋና የይለፍ ቃል አይደለም።',
  'error.passwordTooShort': 'ቢያንስ {min} ቁምፊዎችን ይጠቀሙ።',
  'error.vaultCorrupt': 'በዚህ መሣሪያ ላይ ያለው ካዝና ተበላሽቷል እና ሊከፈት አይችልም።',
  'error.vaultTooNew': 'ይህ ካዝና በአዲስ የPasshold ስሪት ተፈጥሯል። ለመክፈት Passholdን ያዘምኑ።',
  'error.itemNotFound': 'ያ ከካዝናው ውስጥ ከአሁን አይገኝም።',
  'error.familyOrganiserOnly': 'የዚህን ካዝና መጣያ ማጽዳት የሚችለው የቤተሰቡ አደራጅ ብቻ ነው።',
  'error.familyGone': 'ያ ቤተሰብ እዚህ የለም። ያመሳስሉ እና እንደገና ይመልከቱ።',
  'error.familyNotOpen': 'Passhold ያን ቤተሰብ በዚህ አሳሽ ላይ ገና መክፈት አይችልም። ያመሳስሉ እና እንደገና ይሞክሩ።',
  'error.itemInvalid': 'ያ ባለበት ሁኔታ ሊቀመጥ አይችልም።',
  'error.importEmpty': 'ያ ፋይል ለማስመጣት ምንም የለውም።',
  'error.importTooLarge': 'ያ ፋይል ለማስመጣት በጣም ትልቅ ነው።',
  'error.importUnknownFormat': 'ያ ፋይል የይለፍ ቃል ላኪ አይመስልም።',
  'error.importEncrypted':
    'ይህ የBitwarden ላክ የተመሰጠረ ነው፣ Passhold ሊከፍተው አይችልም። ከBitwarden እንደገና በ“.json” ይላኩ፣ በ“.json (Encrypted)” ሳይሆን፣ ከዚያ ያን ፋይል ይምረጡ።',
  'error.backupInvalid': 'ያ ፋይል የPasshold መጠባበቂያ አይደለም፣ ወይም ተበላሽቷል።',
  'error.backupWrongPassword': 'ይህ መጠባበቂያው የተፈጠረበት ዋና የይለፍ ቃል አይደለም።',
  'error.backupWrongRecoveryKey': 'ይህ መጠባበቂያው የተፈጠረበት የመልሶ ማግኛ ቁልፍ አይደለም።',
  'error.noRecoveryKey': 'ይህ ካዝና ለማሳየት የመልሶ ማግኛ ቁልፍ የለውም፦ በዋና የይለፍ ቃል ይከፈታል።',
  'error.wrongRecoveryKey': 'ይህ የመልሶ ማግኛ ቁልፍ አይደለም።',
  'error.deviceNeeded':
    'ዋና የይለፍ ቃል የሌለው ካዝና በዚህ መሣሪያ መክፈቻ ይከፈታል፦ መጀመሪያ ያዋቅሩት። ዋና የይለፍ ቃል እስኪዘጋጅ ድረስ ይቆያል።',
  'error.accountOffline': 'Keyrook መድረስ አልተቻለም። ግንኙነቱን ያረጋግጡ እና እንደገና ይሞክሩ።',
  'error.accountWrong':
    'ኢሜይል ወይም የይለፍ ቃል ትክክል አይደለም። በGoogle ወይም በGitHub የተፈጠረ መለያ ግን በአዝራሩ ይገባል።',
  'error.accountSignedOut': 'Keyrook ይህን አሳሽ አውጥቶታል። እንደገና ይግቡ።',
  'error.accountBusy': {
    one: 'ብዙ ሙከራዎች። ለአንድ ሰከንድ ይጠብቁ እና እንደገና ይሞክሩ።',
    other: 'ብዙ ሙከራዎች። ለ{count} ሰከንዶች ይጠብቁ እና እንደገና ይሞክሩ።',
  },
  'error.accountFailed': 'Keyrook አሁን ያን ማድረግ አልቻለም። ቆይተው ይሞክሩ።',
  'error.accountAlready': 'ይህ ካዝና አስቀድሞ ወደ የKeyrook መለያ ገብቷል።',
  'error.accountNone': 'ይህ ካዝና ወደ የKeyrook መለያ አልገባም።',
  'error.accountKdfRefused': 'Keyrook Passhold ከሚቀበለው የበለጠ ደካማ ቁልፍ ጠየቀ፣ ስለዚህ መግባቱ ተቋርጧል።',
  'error.accountKeyWrong': 'የመለያው ቁልፍ በዚያ የይለፍ ቃል አልተከፈተም።',
  'error.accountCode': 'ይህ ኮድ ትክክል አይደለም፣ ወይም ጊዜው አልፎበታል። ኢሜይሉን ያረጋግጡ ወይም አዲስ ኮድ ይጠይቁ።',
  'error.accountMail': 'Keyrook አሁን ኢሜይሉን መላክ አልቻለም። ከአንድ ደቂቃ በኋላ እንደገና ይሞክሩ።',
  'error.providerDenied': 'መግባቱ ተሰርዟል።',
  'error.providerFailed': 'Google ወይም GitHub አሁን ሊያስገቡዎት አልቻሉም። እንደገና ይሞክሩ።',
  'error.providerExpired': 'ያ መግቢያ አብቅቷል። ከመጀመሪያ ይጀምሩ።',
  'error.providerNotOwner': 'ይህ የKeyrook መለያ የሚገባበት መለያ አይደለም። ለKeyrook ከሚጠቀሙት ጋር እንደገና ይግቡ።',
  'error.signOutUnsent': {
    one: 'አንድ ንጥል ወደ የKeyrook መለያዎ ገና አልደረሰም፣ ስለዚህ ምንም አልተወገደም። ግንኙነትዎን ያረጋግጡ ወይም እንደገና ይግቡ፣ ከዚያ ይውጡ።',
    other: '{count} ንጥሎች ወደ የKeyrook መለያዎ ገና አልደረሱም፣ ስለዚህ ምንም አልተወገደም። ግንኙነትዎን ያረጋግጡ ወይም እንደገና ይግቡ፣ ከዚያ ይውጡ።',
  },
  'error.providerOtherProvider':
    'ለዚህ ኢሜይል የKeyrook መለያ አለ፣ ከGoogle እና ከGitHub ሌላኛው ጋር የሚገባ። በዚያ ይግቡ።',
  'error.providerHasPassword':
    'ለዚህ ኢሜይል የይለፍ ቃል ያለው የKeyrook መለያ አለ። እዚህ በኢሜይልዎ እና በይለፍ ቃልዎ ይግቡ – ወይም በGoogle ወይም በGitHub ለመግባት ደግሞ በaccount.keyrook.com ላይ ይጨምሩት፣ እዚያ በይለፍ ቃልዎ ገብተው።',
  'error.providerEmailTaken':
    'ለዚህ ኢሜይል በሌላ መንገድ የሚገባ የKeyrook መለያ አለ። በዚያ መንገድ ይግቡ – ወይም ይህን መለያ በaccount.keyrook.com ላይ ይጨምሩበት፣ እዚያ አሁን በሚገባበት መንገድ ገብተው።',
  'error.pairingWrongKey':
    'የመጣው የዚህ መለያ ቁልፍ አይደለም፣ ስለዚህ ውድቅ ሆኗል። እንደገና ይጠይቁ፣ እና የሚያውቁት አሳሽ ብቻ እንዲገባ ይፍቀዱ።',
  'error.pairingRefused': 'ያ ኮዱን ካረጋገጡት አሳሽ አልመጣም፣ ስለዚህ ውድቅ ሆኗል። እንደገና ይጠይቁ።',
  'error.pairingEnded': 'ያ ጥያቄ ተጠናቅቋል። ከአዲሱ አሳሽ እንደገና ይጠይቁ።',
  'error.passkeyWrong': 'ያ የይለፍ ቁልፍ ይህን መለያ አይከፍትም። ሌላ የመግቢያ መንገድ ይሞክሩ።',
  'error.joinExpired': 'ያ መግቢያ በጣም ረዘመ። እንደገና ይግቡ።',
  'error.accountPasswordWrong': 'ይህ የመለያ የይለፍ ቃል አይደለም።',
  'error.accountNoKit': 'Passhold የዚህን መለያ የመልሶ ማግኛ ቁልፍ አይይዝም።',
  'error.accountKitRace': 'ሌላ መተግበሪያ የመለያውን የመልሶ ማግኛ ቁልፍ አሁን ለወጠው። ያመሳስሉ እና እንደገና ይሞክሩ።',
  'error.accountKitShape': 'የመለያ መልሶ ማግኛ ቁልፍ አይመስልም፦ 32 ፊደሎችና አሃዞች ያሉት ነው።',
  'error.accountKitWrong': 'ይህ የመልሶ ማግኛ ቁልፍ ከዚህ ኢሜይል አድራሻ ካለው መለያ ጋር አይዛመድም።',
  'error.accountKitNotThis': 'ይህ የዚህ መለያ የመልሶ ማግኛ ቁልፍ አይደለም። ያስቀመጡትን እንደገና ይመልከቱ።',
  'error.accountPasswordWeak':
    'ለመለያ በጣም ቀላል ነው፦ ፊደሎችን፣ አሃዞችንና ምልክቶችን ያቀላቀለ ረዘም ያለ የይለፍ ቃል፣ ወይም አራት ወይም አምስት ያልተዛመዱ ቃላት ይጠቀሙ።',
  'error.accountBoxWrong':
    'በዚህ መለያ ያለው የPasshold ቁልፍ አልተከፈተም። እንደገና ይግቡ፤ አሁንም ካልተሳካ መለያውን ከመጀመሪያ ይጀምሩ።',
  'error.accountCodeWait': {
    one: 'ኮድ ከጥቂት ጊዜ በፊት ተልኳል። ሌላ ለማግኘት በአንድ ሰከንድ ውስጥ መጠየቅ ይችላሉ።',
    other: 'ኮድ ከጥቂት ጊዜ በፊት ተልኳል። ሌላ ለማግኘት በ{count} ሰከንዶች ውስጥ መጠየቅ ይችላሉ።',
  },
  'error.accountSignUpKeys':
    'Keyrook የPasshold የራሱን ቁልፍ ጠየቀ፣ ምንም አልተላከም። Passholdን ያዘምኑ እና እንደገና ይሞክሩ።',
  'error.accountIdTaken': 'መለያው አሁን ሊፈጠር አልቻለም። አዲስ ኮድ ይጠይቁ እና እንደገና ይሞክሩ።',
  'error.accountNoRoot': 'ይህ መለያ የመልሶ ማግኛ ቁልፍ የሚከፍተው ቁልፍ ገና የለውም። በይለፍ ቃሉ እንደገና ይግቡ።',
  'error.accountRootNotHeld':
    'ይህ ኮምፒውተር የመለያውን ቁልፍ እንደያዘ ማሳየት አልቻለም። በይለፍ ቃሉ ወይም በመልሶ ማግኛ ቁልፉ እንደገና ይግቡ።',
  'error.accountRootChanged':
    'የዚህ መለያ ቁልፎች በሌላ ኮምፒውተር ተተክተዋል። Passhold አሁንም የገባበት ኮምፒውተር ላይ ይግቡ፣ ወይም መለያውን ከመጀመሪያ ይጀምሩ።',
  'error.accountKeyReplaced': 'በዚህ መለያ ያለው የPasshold ቁልፍ በሌላ ኮምፒውተር ተተክቷል። እንደገና ይግቡ።',
  'error.accountSessionStolen': 'ክፍለ ጊዜው ከሌላ ቦታ ስለተጠቀመበት ይህ ኮምፒውተር ወጥቷል። እንደገና ይግቡ።',
  'error.accountOld':
    'ይህ መለያ እያንዳንዱ የKeyrook መተግበሪያ የራሱ ቁልፍ ከመያዙ በፊት በGoogle ወይም በGitHub ተፈጥሯል፣ እና እስካሁን የሆነ ነገር Passholdን አይከፍትም። ቁልፍ እንዲያገኝ በኢሜይሉ መለያውን ከመጀመሪያ ይጀምሩ።',
  'error.pairingBusy': 'ብዙ አሳሾች ወደዚህ መለያ ለመግባት እየጠበቁ ነው። ከጥቂት ደቂቃዎች በኋላ እንደገና ይሞክሩ።',
  'error.startOverExpired': 'ጊዜው አልፎበታል። አዲስ ኮድ ይጠይቁ እና ከመጀመሪያ ይጀምሩ።',
  'error.startOverTooOften': 'ይህ መለያ በቅርቡ ብዙ ጊዜ ከመጀመሪያ ጀምሯል። ከ{day} በኋላ እንደገና ይሞክሩ።',
  'error.startOverWaiting': 'ይህ መለያ በ{day} ከመጀመሪያ ይጀምራል። አሁንም ወደ እሱ የገባ አሳሽ ይህን ማቋረጥ ይችላል።',
  'error.startOverUpdate': 'Keyrook አሁን ማንኛውም መለያ ከመጀመሪያ ከመጀመሩ በፊት አንድ ሳምንት ይጠብቃል። ይህን ለመጠየቅ Passholdን ያዘምኑ።',
  'error.passkeyFailed': 'ይህ የይለፍ ቁልፍ ሊረጋገጥ አልቻለም። እንደገና ይሞክሩ።',
  'error.passkeyNotYou': 'ይህ የይለፍ ቁልፍ እርስዎ መሆንዎን አላረጋገጠም። እንደገና ይሞክሩ፣ እና እንደሚጠይቀው ይክፈቱት።',
  'error.passkeyUnknown':
    'ይህ የይለፍ ቁልፍ በማንኛውም የKeyrook መለያ ላይ የለም። ተወግዶ ሊሆን ይችላል፦ በይለፍ ቃሉ፣ ወይም በGoogle ወይም በGitHub ይግቡ።',
  'error.passkeyExpired': 'ይህ የይለፍ ቁልፍ ጥያቄ አብቅቷል። እንደገና ይሞክሩ።',
  'error.passkeyNotOffered': 'Keyrook እዚህ የይለፍ ቁልፎችን ገና አይሰጥም።',
  'error.passkeyNoUnlock':
    'ይህ የይለፍ ቁልፍ ይገባል፣ ነገር ግን መለያዎን ለመክፈት ገና አልተዋቀረም። በaccount.keyrook.com ላይ፣ በ“Passkeys” ስር፣ በጎኑ “Let it unlock”ን ይምረጡ፣ ከዚያ እንደገና ይሞክሩ። ወይም በይለፍ ቃሉ፣ ወይም በGoogle ወይም በGitHub ይግቡ።',
  'error.passkeyNoPrf':
    'ይህ የይለፍ ቁልፍ ወደ account.keyrook.com ይገባል፣ ነገር ግን የተቀመጠበት ቦታ መለያዎን ሊከፍት አይችልም – ለምሳሌ macOS 15 ከመምጣቱ በፊት ያለው iCloud Keychain አይችልም። በaccount.keyrook.com ላይ፣ በ“Passkeys” ስር፣ መቻል በሚችል ቦታ የተቀመጠ አንድ ይጨምሩ፣ ለምሳሌ የደህንነት ቁልፍ፣ እና “Unlocks your data” የሚለውን መኖሩን ያረጋግጡ። እስከዚያ ድረስ በይለፍ ቃሉ ወይም በGoogle ወይም በGitHub ይግቡ።',
  'error.passkeyPermission':
    'Passhold የaccount.keyrook.com የይለፍ ቁልፎችን ለመጠቀም የChrome ፈቃድ ያስፈልገዋል። የይለፍ ቁልፉን እንደገና ይምረጡ እና ይፍቀዱ።',
  'error.passkeyPermissionEdge':
    'Passhold የaccount.keyrook.com የይለፍ ቁልፎችን ለመጠቀም የEdge ፈቃድ ያስፈልገዋል። የይለፍ ቁልፉን እንደገና ይምረጡ እና ይፍቀዱ።',
  'error.passkeyCancelled': 'ምንም የይለፍ ቁልፍ አልተጠቀመም። እንደገና ይሞክሩ፣ ወይም በሌላ መንገድ ይግቡ።',
  'error.secondStepNeeded': 'መለያዎ ሁለተኛ ደረጃ ይጠይቃል፦ ኮዱን ከማረጋገጫ መተግበሪያዎ ደግሞ ያስገቡ።',
  'error.secondStepWrong':
    'ይህ ኮድ ትክክል አይደለም። የማረጋገጫ መተግበሪያዎ አሁን የሚያሳየውን ወይም የመልሶ ማግኛ ቁልፍዎን ያስገቡ።',
  'error.signInExpired': 'ይህ መግቢያ ጊዜው አልፎበታል። እንደገና ይግቡ።',
  'error.secondStepUpdate': 'መለያዎ ለመግባት ሁለተኛ ደረጃ ይጠይቃል። ለመግባት Passholdን ያዘምኑ።',
  'error.secondStepAsked': 'መለያዎ ሁለተኛ ደረጃ ይጠይቃል፦ ኮዱን ከማረጋገጫ መተግበሪያዎ ያስገቡ።',
  'error.secondStepTaken':
    'ይህ በገቡበት ኮድ ነው፣ እና እያንዳንዱ ኮድ አንድ ጊዜ ብቻ ይሰራል። የማረጋገጫ መተግበሪያዎ አዲስ እስኪያሳይ ይጠብቁ።',
  'error.kitDraftGone':
    'አዲሱ የመልሶ ማግኛ ቁልፍ በጊዜው አልተዘጋጀም፣ ምንም አልተለወጠም። እንደገና አዲስ ይፍጠሩ።',
  'error.archiveWrong': 'ይህ የተያዘውን አይከፍትም።',
  'error.archiveGone': 'ያ ከአሁን አልተያዘም።',
  'error.archiveDeleteRefused':
    'ከማለፉ በፊት የተያዘውን መሰረዝ የሚቻለው የቀድሞው የይለፍ ቃል ወይም የቀድሞው የመልሶ ማግኛ ቁልፍ ብቻ ነው።',
  'error.accountNeedsRoot':
    'ይህ መለያ እያንዳንዱ የKeyrook መተግበሪያ የራሱ ቁልፍ ከመያዙ በፊት በKeyrook Authenticator ተፈጥሯል። Passhold አሁን ቁልፍ ሊሰጠው ይችላል፤ በAuthenticator ምንም አይለወጥም።',
  'error.accountServerWrong':
    'የKeyrook አገልጋይ የዚህ መለያ ቁልፎች የማይዛመዱትን ነገር መለሰ፣ ስለዚህ Passhold አቆመ። ቆይተው ይሞክሩ።',
  'error.startOverNeedsPassword': 'ይህ መለያ የይለፍ ቃል አለው፦ ከመጀመሪያ ለመጀመር አዲስ ይምረጡ።',
  'error.pinInvalid': 'PIN ከ6 እስከ 12 አሃዞች ነው።',
  'error.wrongPin': 'ይህ PIN አይደለም።',
  'error.wrongPinLeft': { one: 'ይህ PIN አይደለም። አንድ ሙከራ ቀርቷል።', other: 'ይህ PIN አይደለም። {count} ሙከራዎች ቀርተዋል።' },
  'error.pinLockedOut': 'በጣም ብዙ የተሳሳቱ PINs። በሌላ መንገድ ይክፈቱ፤ ከዚያ በኋላ PIN እንደገና ይሰራል።',
  'error.pinUnavailable': 'PIN የሚሰራው አሳሹ ክፍት ሆኖ ሲቆይ ብቻ ነው። በሌላ መንገድ ይክፈቱ፤ ከዚያ በኋላ PIN እንደገና ይሰራል።',
  'error.deviceGone': 'በዚህ መሣሪያ መክፈት ከአሁን አልተዋቀረም። በሌላ መንገድ ይክፈቱ።',
  'error.deviceKeyWrong': 'ይህ Passholdን አልከፈተም። በሌላ መንገድ ይክፈቱ፣ ከዚያ የመሣሪያ መክፈቻውን እንደገና ያዋቅሩ።',
  'error.deviceUnsupported':
    'ያ የይለፍ ቁልፍ የተቀመጠበት ቦታ Passhold ለመክፈት ቁልፍ ሊሰጥ አይችልም። እንደገና ይሞክሩ እና በGoogle የይለፍ ቃል አስተዳዳሪ ውስጥ ያስቀምጡት – ወይም PIN ይጠቀሙ።',
  'error.deviceUnsupportedEdge':
    'ያ የይለፍ ቁልፍ የተቀመጠበት ቦታ Passhold ለመክፈት ቁልፍ ሊሰጥ አይችልም። እንደገና ይሞክሩ እና በሌላ ቦታ ያስቀምጡት – ወይም PIN ይጠቀሙ።',
  'error.deviceCancelled': 'ምንም አልተከፈተም፦ ተሰርዟል ወይም በጣም ረዝሟል።',
  'error.keyUnsupported':
    'ይህ ቁልፍ Passhold ለመክፈት የሚፈልገውን ሊሰጠው አይችልም። አብዛኛዎቹ የFIDO2 ቁልፎች ይችላሉ፤ ለባለ ሁለት ደረጃ መግቢያ (U2F) ብቻ የተሠራ ቁልፍ ግን አይችልም።',
  'error.keyAlreadyAdded': 'ይህ ቁልፍ እዚህ አስቀድሞ ተዋቅሯል።',
  'error.keyGone': 'ይህ የደህንነት ቁልፍ እዚህ ከአሁን አልተዋቀረም። በሌላ መንገድ ይክፈቱ።',
  'error.keyWrong': 'ይህ ቁልፍ Passholdን አልከፈተም። በሌላ መንገድ ይክፈቱ፣ ከዚያ ቁልፉን አስወግደው እንደገና ያክሉት።',
  'error.kdfUnsupported': 'የካዝናው ቅንብሮች Passhold የሚቀበላቸው አይደሉም።',
  'error.locked': 'Passhold ተቆልፏል።',
  'error.noVault': 'እስካሁን ካዝና የለም።',
  'error.vaultExists': 'ካዝና አስቀድሞ አለ።',
  'error.notOnPage': 'ይህ መግቢያ በዚህ ትር ላይ ላለው ገጽ አይደለም።',
  'error.expired': 'ጊዜው አልፎበታል። እንደገና ይሞክሩ።',
  'error.noFields': 'በዚህ ገጽ ላይ Passhold የሚሞላው ምንም የለም።',
  'error.cardInsecure': 'Passhold ካርድን የሚሞላው በደህንነቱ በተጠበቀ (https) ገጽ ብቻ ነው።',
  'error.unknown': 'የሆነ ችግር ተፈጥሯል፦ {detail}',
};
