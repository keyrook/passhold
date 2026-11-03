import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'Keyrook દ્વારા',

  // Common
  'common.cancel': 'રદ કરો',
  'common.close': 'બંધ કરો',
  'common.save': 'સાચવો',
  'common.edit': 'સંપાદિત કરો',
  'common.back': 'પાછા',
  'common.show': 'બતાવો',
  'common.hide': 'છુપાવો',
  'common.notNow': 'અત્યારે નહીં',

  // Setup
  'setup.title': 'તમારો વૉલ્ટ બનાવો',
  'setup.body':
    'Passhold તમારા પાસવર્ડ આ ઉપકરણ પર એન્ક્રિપ્ટ કરીને રાખે છે. એક મુખ્ય પાસવર્ડ તેમને ખોલે છે – એવો પસંદ કરો જે તમને યાદ રહે અને જે તમે બીજે ક્યાંય વાપરશો નહીં.',
  'setup.password': 'મુખ્ય પાસવર્ડ',
  'setup.confirm': 'ફરી લખો',
  'setup.mismatch': 'બંને પાસવર્ડ સરખા નથી.',
  'setup.tooShort': 'ઓછામાં ઓછા {min} અક્ષરો વાપરો.',
  'setup.understand':
    'હું સમજું છું કે જો હું આ પાસવર્ડ ભૂલી જાઉં તો કોઈ પણ – Passhold નહીં, Keyrook નહીં – મારો વૉલ્ટ પાછો મેળવી શકશે નહીં.',
  'setup.create': 'વૉલ્ટ બનાવો',
  'setup.creating': 'બનાવી રહ્યા છીએ…',
  'setup.restore': 'બેકઅપમાંથી પુનઃસ્થાપિત કરો',

  // Strength
  'setup.deviceBody':
    'Passhold તમારા પાસવર્ડ આ ઉપકરણ પર એન્ક્રિપ્ટ કરીને રાખે છે, અને {method} તેમને ખોલે છે – કોઈ મુખ્ય પાસવર્ડ બનાવવાની કે યાદ રાખવાની જરૂર નથી. તમને એક રિકવરી કી પણ મળે છે, એ દિવસ માટે જ્યારે {method} કામ ન કરે.',
  'setup.deviceWhereMac': 'જ્યારે Chrome પૂછે કે પાસકી ક્યાં સાચવવી, ત્યારે Google પાસવર્ડ મેનેજર પસંદ કરો.',
  'setup.deviceWhereMacEdge':
    'જ્યારે Edge પૂછે કે પાસકી ક્યાં સાચવવી, ત્યારે એવી જગ્યા પસંદ કરો જે તેને તમારા બીજા ઉપકરણો પર પણ રાખે. દરેક જગ્યા Passhold ને ખોલી શકતી નથી: જો આ જગ્યા ન ખોલી શકે, તો Passhold એ કહેશે.',
  'setup.createWithDevice': '{method} વડે બનાવો',
  'setup.usePassword': 'તેના બદલે મુખ્ય પાસવર્ડ વાપરો',
  'setup.useDevice': 'તેના બદલે {method} વાપરો',
  'setup.signIn': 'Keyrook ખાતામાં સાઇન ઇન કરો અથવા એક બનાવો',

  'welcome.title': 'તમારા પાસવર્ડ, દરેક કમ્પ્યુટર પર',
  'welcome.body': 'એકવાર સાઇન ઇન કરો. Passhold તમારી આંગળીની છાપથી ખુલે છે, તમારા માટે ભરે છે, અને તમારા લૉગિન ત્યાં હોય છે જ્યાં તમે સાઇન ઇન કરો છો.',
  'welcome.email': 'ઈમેલ સરનામું વાપરો',
  'gate.touchTitle': 'એક સ્પર્શથી ખોલો',
  'gate.touchBody': 'Touch ID અથવા Windows Hello Passhold ખોલે છે. કોઈ મુખ્ય પાસવર્ડ બનાવવાનો કે યાદ રાખવાનો નથી.',
  'gate.everywhereTitle': 'તમે વાપરો છો એ દરેક કમ્પ્યુટર પર',
  'gate.everywhereBody': 'બીજા કમ્પ્યુટર પર સાઇન ઇન કરો, અને તમારા પાસવર્ડ તથા પાસકી ત્યાં હશે.',
  'gate.privateTitle': 'ફક્ત તમે જ તેમને વાંચી શકો',
  'gate.privateBody':
    'કંઈ પણ મોકલાય તે પહેલાં આ કમ્પ્યુટર પર એન્ક્રિપ્ટ થાય છે. Keyrook તમારા પાસવર્ડ વાંચી શકતું નથી, કે તે કઈ સાઇટ માટે છે તે પણ નહીં.',
  'welcome.note':
    'પહેલાં આ કમ્પ્યુટર પર એન્ક્રિપ્ટ: Keyrook તમારા પાસવર્ડ વાંચી શકતું નથી, કે તે કઈ સાઇટ માટે છે તે પણ નહીં.',
  'connect.title': 'તમારું Keyrook ખાતું ચાલુ કરો',
  'connect.body': 'તમે વાપરો છો એ દરેક કમ્પ્યુટર પર તમારા લૉગિન – અને આ ખોવાઈ જાય તો બેકઅપ પણ.',
  'connect.email': 'ઈમેલ',
  'kitCheck.title': 'તમારા ખાતાની રિકવરી કી તપાસો',
  'kitCheck.body': 'એકવાર લખો, જેથી જે દિવસે જરૂર પડે તે પહેલાં તમને ખબર હોય કે તે હજી તમારી પાસે છે.',
  'accountPasskey.button': 'પાસકી વડે ચાલુ રાખો',
  'accountPasskey.working': 'પાસકીની રાહ જોઈ રહ્યા છીએ…',
  'accountPasskey.hint':
    'account.keyrook.com પર તમે ઉમેરેલી એક. પહેલી વાર {browser} પૂછે છે કે શું Passhold તેનો ઉપયોગ કરી શકે.',
  'accountPasskey.openPasskeys': 'account.keyrook.com પર “Passkeys” ખોલો',
  'join.title': 'Keyrook માં સાઇન ઇન કરો',
  'join.body': 'Passhold અને Keyrook Authenticator માટે એક Keyrook ખાતું. તમારા લૉગિન ખાતામાંથી આ બ્રાઉઝરમાં આવે છે.',
  'join.createTitle': 'Keyrook ખાતું બનાવો',
  'join.createBody':
    'Passhold અને Keyrook Authenticator માટે એક ખાતું: તમારા લૉગિન, પહેલાં આ ઉપકરણ પર એન્ક્રિપ્ટ થયેલા, દરેક કમ્પ્યુટર પર જ્યાં તમે સાઇન ઇન કરો છો.',
  'join.lockTitle': '{email} તરીકે સાઇન ઇન',
  'join.lockBodyDevice': 'છેલ્લું પગલું: આ કમ્પ્યુટર પર {method} વડે Passhold ખુલે છે. તે સેટ થતાં જ તમારા લૉગિન આવી જશે.',
  'join.cancel': 'બીજું ખાતું વાપરો',
  'join.lockBodyCode': 'છેલ્લું પગલું: એક કોડ જે આ કમ્પ્યુટર પર Passhold ખોલે છે. તે સેટ થતાં જ તમારા લૉગિન આવી જશે.',
  'join.opening': 'Passhold ખુલી રહ્યું છે…',
  'setup.useAccountPassword': 'તેના બદલે મારો ખાતા પાસવર્ડ વાપરો',
  'setup.useCode': 'તેના બદલે આ કમ્પ્યુટર માટેનો કોડ વાપરો',
  'security.accountPasswordTitle': 'તમારા Keyrook ખાતા પાસવર્ડ વડે ખુલે છે',
  'security.accountPasswordBody':
    'બંને માટે એક પાસવર્ડ. જ્યારે તે બદલાય, ત્યારે તમે આગલી વાર સાઇન ઇન કરશો ત્યારે અહીંનું Passhold તેને અનુસરે છે.',

  'recovery.title': 'તમારી રિકવરી કી સાચવો',
  'recovery.body':
    'જો આ ઉપકરણ ખોવાઈ જાય, અથવા તેનું અનલૉક કામ કરવાનું બંધ કરે, તો આ કી તમારા વૉલ્ટ અને તેના બેકઅપમાં પાછા જવાનો રસ્તો છે. Passhold હજી ખુલે છે ત્યાં સુધી તમે સેટિંગ્સમાં તેને ફરી જોઈ શકો છો – તેથી તેને બીજી જગ્યાએ પણ રાખો: છાપેલી, તમારા ફોનમાં, અથવા આ કમ્પ્યુટરથી દૂર કોઈ ફાઇલમાં.',
  'recovery.download': 'ડાઉનલોડ કરો',
  'recovery.copy': 'કૉપિ કરો',
  'recovery.copied': 'કૉપિ થઈ',
  'recovery.print': 'છાપો',
  'recovery.qr': 'QR કોડ બતાવો',
  'recovery.qrHide': 'QR કોડ છુપાવો',
  'recovery.qrLabel': 'રિકવરી કી QR કોડ તરીકે',
  'recovery.qrHint': 'તમારા ફોનનો કૅમેરો તેના પર રાખો અને લખાણ નોંધમાં સાચવો, અથવા તેનો ફોટો લો.',
  'recovery.show': 'બતાવો',

  'kit.title': 'Passhold રિકવરી કિટ',
  'kit.made': '{date} ના રોજ બનાવ્યું',
  'kit.keyLabel': 'રિકવરી કી',
  'kit.whenTitle': 'જ્યારે Passhold ખુલશે નહીં',
  'kit.sameDevice':
    'આ કમ્પ્યુટર પર: જ્યારે Passhold અનલૉક કરવાનું કહે, ત્યારે “તેના બદલે રિકવરી કી વાપરો” પસંદ કરો અને કી લખો.',
  'kit.newDevice':
    'નવા કમ્પ્યુટર પર: Passhold ઇન્સ્ટૉલ કરો, “બેકઅપમાંથી પુનઃસ્થાપિત કરો” પસંદ કરો, તમારી સૌથી નવી બેકઅપ ફાઇલ પસંદ કરો અને કી લખો. બેકઅપ વગર પુનઃસ્થાપિત કરવા માટે કંઈ નથી, તેથી એક રાખો.',
  'kit.keep': 'આ શીટ તમારા કમ્પ્યુટરથી દૂર, સુરક્ષિત જગ્યાએ રાખો. જેની પાસે તે અને તમારા વૉલ્ટની નકલ હોય, તે વૉલ્ટ ખોલી શકે છે.',
  'recovery.fileTitle': 'Passhold રિકવરી કી',
  'recovery.fileMade': '{date} ના રોજ બનાવ્યું',
  'recovery.fileBody':
    'આ કી તમારો Passhold વૉલ્ટ અને તેના બેકઅપ ખોલે છે, જ્યારે તમારું ઉપકરણ ન ખોલી શકે. જેની પાસે તે અને તમારા વૉલ્ટની નકલ હોય તે ખોલી શકે છે, તેથી તેને સુરક્ષિત રાખો અને એ જ કમ્પ્યુટર પર નહીં.',
  'recovery.pending': 'રિકવરી કી સાચવેલી નથી',
  'recovery.keptState': 'રિકવરી કી સાચવેલી છે',
  'recovery.rowBody':
    '{method} ન ખોલી શકે ત્યારે તમારો વૉલ્ટ અને તેના બેકઅપ ખોલે છે. નવી કી જૂની કીને આ વૉલ્ટ ખોલવાનું બંધ કરે છે; તે પહેલાંના બેકઅપ હજી જૂની કી વડે ખુલે છે.',
  'recovery.makeNew': 'નવી બનાવો',
  'recovery.savedIt': 'મેં તેને સાચવી લીધી છે',
  'recovery.checkTitle': 'તમે તેને સાચવી છે કે નહીં તે તપાસો',
  'recovery.checkBody':
    'તમે સાચવેલી વસ્તુ – ફાઇલ, કાગળ અથવા ફોટો – માંથી કીના બે ભાગ લખો. ભાગ એટલે ડૅશ વચ્ચેના ચાર-ચાર અક્ષરોના બ્લૉક, ડાબેથી ગણતરી કરીને.',
  'recovery.group': 'ભાગ {position}',
  'recovery.check': 'તપાસો',
  'recovery.checkWrong':
    'તમારી કી આ નથી. તમે સાચવેલું ફરી જુઓ, અથવા કી ફરી બતાવો અને હમણાં સાચવો.',
  'recovery.showAgain': 'કી ફરી બતાવો',
  'recovery.covered': 'તમારું Keyrook ખાતું પાછા જવાનો રસ્તો છે',
  'recovery.coveredBody':
    'જો {method} અહીં Passhold ખોલવાનું બંધ કરે, તો વૉલ્ટ કાઢી નાખો અને ફરી તમારા ખાતામાં સાઇન ઇન કરો: દરેક લૉગિન પાછું આવશે. આ વૉલ્ટની પોતાની રિકવરી કી હજી અહીં જોવા મળે છે.',

  'proof.recoveryKey': 'રિકવરી કી',
  'proof.withDevice': 'તમે {method} વડે પુષ્ટિ કરશો.',
  'proof.useDevice': 'તેના બદલે {method} વડે પુષ્ટિ કરો',
  'proof.usePassword': 'તેના બદલે મુખ્ય પાસવર્ડ લખો',
  'proof.useAccountPassword': 'તેના બદલે ખાતા પાસવર્ડ લખો',
  'proof.useCode': 'તેના બદલે કોડ લખો',
  'proof.useRecoveryKey': 'તેના બદલે રિકવરી કી લખો',
  'strength.0': 'બહુ નબળો',
  'strength.1': 'નબળો',
  'strength.2': 'ઠીક',
  'strength.3': 'મજબૂત',
  'strength.4': 'બહુ મજબૂત',
  'strength.short': 'લાંબો એટલે વધુ મજબૂત: 14 કે તેથી વધુ અક્ષરોનું લક્ષ્ય રાખો.',
  'strength.digitsOnly': 'માત્ર અંકો સહેલાઈથી અનુમાનિત થાય છે.',
  'strength.repeats': 'એક જ અક્ષર વારંવાર ન વાપરો.',

  // Unlock
  'unlock.title': 'Passhold લૉક છે',
  'unlock.body': 'તમારો મુખ્ય પાસવર્ડ દાખલ કરો.',
  'unlock.password': 'મુખ્ય પાસવર્ડ',
  'unlock.submit': 'અનલૉક કરો',
  'unlock.pinBody': 'તમારો PIN દાખલ કરો.',
  'unlock.pin': 'PIN',
  'unlock.usePassword': 'તેના બદલે મુખ્ય પાસવર્ડ વાપરો',
  'unlock.usePin': 'તેના બદલે PIN વાપરો',
  'unlock.recoveryBody': 'તમારી રિકવરી કી દાખલ કરો.',
  'unlock.deviceBody': '{method} વાપરો, અથવા નીચે લખો.',
  'unlock.recoveryKey': 'રિકવરી કી',
  'unlock.useRecoveryKey': 'તેના બદલે રિકવરી કી વાપરો',
  'unlock.lost': 'અંદર જઈ શકતા નથી?',
  'unlock.forgotBodyRecovery':
    'તમારી રિકવરી કી ઉપકરણ ન ખોલી શકે ત્યારે વૉલ્ટ ખોલે છે. તે અને ઉપકરણ બંને વગર, કોઈ પણ – Passhold નહીં, Keyrook નહીં – વૉલ્ટ ખોલી શકશે નહીં: તમે તેને સેટિંગ્સમાં કાઢી નાખીને નવેસરથી શરૂ કરી શકો છો.',
  'unlock.bodyAccount': 'તમારો Keyrook ખાતા પાસવર્ડ દાખલ કરો.',
  'unlock.accountPassword': 'Keyrook ખાતા પાસવર્ડ',
  'unlock.useAccountPassword': 'તેના બદલે ખાતા પાસવર્ડ વાપરો',
  'unlock.forgotBodyAccount':
    'તે તમારો Keyrook ખાતા પાસવર્ડ છે: જો તે બીજે બદલાયો હોય, તો નવો વાપરો. કાયમ માટે ભૂલી ગયા? સેટિંગ્સમાં આ વૉલ્ટ કાઢી નાખો અને ફરી સાઇન ઇન કરો – જો તમને નવો પાસવર્ડ જોઈતો હોય તો રિકવરી કી વડે – પછી દરેક લૉગિન પાછું આવશે.',
  'unlock.bodyCode': 'આ કમ્પ્યુટર પર Passhold ખોલતો કોડ દાખલ કરો.',
  'unlock.code': 'આ કમ્પ્યુટર માટેનો કોડ',
  'unlock.useCode': 'તેના બદલે કોડ વાપરો',
  'unlock.forgotBodyCode':
    'સેટિંગ્સમાં આ વૉલ્ટ કાઢી નાખો અને Google અથવા GitHub વડે ફરી સાઇન ઇન કરો: દરેક લૉગિન તમારા ખાતામાંથી પાછું આવશે.',
  'unlock.device': '{method} વડે અનલૉક કરો',
  'unlock.key': 'સુરક્ષા કી વડે અનલૉક કરો',
  'unlock.keyBody': 'તમારી સુરક્ષા કી લગાવો, અથવા નીચે લખો.',
  'unlock.or': 'અથવા',
  'unlock.unlocking': 'અનલૉક થઈ રહ્યું છે…',
  'unlock.forgot': 'ભૂલી ગયા?',
  'unlock.forgotBody':
    'તમારો મુખ્ય પાસવર્ડ આ વૉલ્ટની એકમાત્ર ચાવી છે, અને તે ક્યાંય સંગ્રહાતો નથી. તેના વગર વૉલ્ટ ખોલી શકાતો નથી – તમે તેને સેટિંગ્સમાં કાઢી નાખીને ફરી શરૂ કરી શકો છો.',

  // Vault
  'vault.search': 'શોધો',
  'vault.lock': 'લૉક કરો',
  'vault.settings': 'સેટિંગ્સ',
  'vault.add': 'નવું લૉગિન',
  'vault.onThisPage': '{site} પર',
  'vault.all': 'બધા લૉગિન',
  'vault.empty': 'હજી કોઈ લૉગિન નથી',
  'vault.emptyBody':
    'કોઈ સાઇટ પર સાઇન ઇન કરો અને Passhold તેને સાચવવાની ઑફર કરશે – અથવા અહીં એક ઉમેરો, અથવા તમારા બ્રાઉઝરમાંથી આયાત કરો.',
  'vault.import': 'પાસવર્ડ આયાત કરો',
  'vault.noResults': '“{query}” સાથે કંઈ મેળ ખાતું નથી.',
  'vault.fill': 'ભરો',
  'vault.copyUsername': 'યુઝરનેમ કૉપિ કરો',
  'vault.copyPassword': 'પાસવર્ડ કૉપિ કરો',
  'vault.noUsername': 'કોઈ યુઝરનેમ નથી',
  'vault.count': { one: '{count} આઇટમ', other: '{count} આઇટમ' },
  'vault.everything': 'બધી આઇટમ',

  // Asking for a rating, once, after real use
  'rating.title': 'Passhold ઉપયોગી લાગે છે?',
  'rating.body': 'સ્ટોરમાં એક રેટિંગ બીજા લોકોને Passhold શોધવામાં મદદ કરે છે.',
  'rating.rate': 'રેટિંગ આપો',
  'rating.later': 'અત્યારે નહીં',

  // What a list shows, and what can be added
  'kinds.label': 'બતાવો',
  'kinds.all': 'બધું',
  'kinds.logins': 'લૉગિન',
  'kinds.cards': 'કાર્ડ',
  'kinds.addresses': 'સરનામાં',
  'kinds.notes': 'નોંધો',
  'kinds.noLogins': 'હજી કોઈ લૉગિન નથી.',
  'kinds.noCards':
    'હજી કોઈ કાર્ડ નથી. ઉપર + વડે એક ઉમેરો, અને ચેકઆઉટ વખતે તમે પસંદ કરો ત્યારે Passhold તેને ભરી દે છે.',
  'kinds.noAddresses':
    'હજી કોઈ સરનામું નથી. ઉપર + વડે એક ઉમેરો, અને જ્યાં ફોર્મ માંગે ત્યાં Passhold તેને ભરી દે છે.',
  'kinds.noNotes':
    'હજી કોઈ નોંધ નથી. નોંધ એવી વસ્તુઓ રાખે છે જે લૉગિન નથી – Wi-Fi પાસવર્ડ, લાઇસન્સ કી – બીજી બધી વસ્તુઓ સાથે એન્ક્રિપ્ટ કરીને.',
  'add.menu': 'ઉમેરો',
  'add.login': 'લૉગિન',
  'add.card': 'કાર્ડ',
  'add.address': 'સરનામું',
  'add.note': 'નોંધ',
  'place.label': 'વૉલ્ટ',
  'place.mine': 'મારા',
  'place.of': '{vault}, {family} માં શેર કરેલું',
  'move.to': '{vault} માં ખસેડો',
  'move.confirm':
    '{family} ના દરેક જણ તેને {vault} માં જોશે, અને તેને બદલી શકશે. તે તમારા પોતાના વૉલ્ટમાંથી જતું રહેશે; તેના પહેલાંના પાસવર્ડ પાછળ રહેશે.',
  'move.do': 'ખસેડો',
  'family.unlockTitle': 'આ બ્રાઉઝર પર {family} નો શેર કરેલો વૉલ્ટ ખોલો',
  'family.unlockBody':
    'Passhold ને એકવાર તમારો Keyrook ખાતા પાસવર્ડ જોઈએ, જેથી આ બ્રાઉઝર પર તમારી કી પરિવાર સુધી પહોંચે. તે ક્યાંય મોકલાતો નથી.',
  'family.unlockOnPage': 'account.keyrook.com પર “Family” પેજ ખોલો, અને ત્યાં તમારી કી પરિવારને Passhold ને આપો.',
  'family.password': 'Keyrook ખાતા પાસવર્ડ',
  'family.unlock': 'ખોલો',
  'family.openPage': '“Family” પેજ ખોલો',
  'family.keyChanged': '{family} માં {who} ની કી બદલાઈ છે',
  'family.newSender': '{family} ની કી {who} તરફથી આવી, જેને આ બ્રાઉઝર હજી ઓળખતું નથી',
  'family.keyChangedBody':
    'બંને જણ એક કોડ સરખાવો ત્યાં સુધી Passhold તેમની પાસેથી કંઈ લેતું નથી. તેમને ફોન કરો અથવા મળો: તેઓ account.keyrook.com ના “Family” પેજ પર તમારા નામની બાજુમાં કોડ સરખાવવાનું પસંદ કરે છે.',
  'family.showCode': 'કોડ બતાવો',
  'family.codeIs': 'તમારો કોડ',
  'family.match': 'કોડ સરખા છે',
  'family.differ': 'તેઓ જુદા છે',
  'family.differed':
    'તો પછી વિશ્વાસ ન કરો. તમારા પરિવારના એક આયોજકને જણાવો; ત્યાં સુધી Passhold તેમની પાસેથી કંઈ લેતું નથી.',
  'family.someone': 'કોઈક',
  'family.waiting':
    '{family} ના એક આયોજકે તમને હજી પુષ્ટિ આપી નથી. તેઓ પુષ્ટિ આપે પછી જે શેર થાય છે તે અહીં ખૂલશે.',
  'family.rotate':
    '{family} માંથી કોઈ જતું રહ્યું છે, અને Passhold એ હજી તેની બધી કી બદલી નથી: તેના શેર કરેલા વૉલ્ટમાં જે બદલાય છે તે આ બ્રાઉઝર પર રાહ જુએ છે. આવું ચાલુ રહે તો, Family પેજ પર તે બદલો.',
  'family.rotateCompare':
    '{family} માંથી કોઈ જતું રહ્યું છે. ઉપરનો કોડ તમે સરખાવો પછી Passhold દરેકને નવી કી આપે છે; ત્યાં સુધી તેના શેર કરેલા વૉલ્ટમાં જે બદલાય છે તે આ બ્રાઉઝર પર રાહ જુએ છે.',
  'family.rotateWait':
    '{family} માંથી કોઈ જતું રહ્યું છે. તમે તેના શેર કરેલા વૉલ્ટમાં જે બદલો છો તે આ બ્રાઉઝર પર રાહ જુએ છે, જ્યાં સુધી કોઈ આયોજકનું Passhold તેની કી ન બદલે – જે તે સિંક થતાં કરે છે – જેથી જે વ્યક્તિ ગઈ તે તે વાંચી ન શકે.',
  'family.left': '{who} હવે {family} માં નથી',
  'family.leftBody':
    'તેઓ કેમ ગયા તે Passhold જાણી શકતું નથી. જો તમને આની અપેક્ષા ન હતી, તો તેમને અથવા તમારા પરિવારના એક આયોજકને પૂછો.',
  'family.title': 'પરિવાર',
  'family.description':
    'તમારા પરિવારમાં કોણ છે, અને તે કયા વૉલ્ટ શેર કરે છે. પરિવાર account.keyrook.com ના “Family” પેજ પર ચાલે છે: આમંત્રણ આપવું, કોઈને દૂર કરવું, તેની કી બદલવી.',
  'family.none': 'આ ખાતું કોઈ પરિવારમાં નથી. પરિવારો account.keyrook.com ના “Family” પેજ પર બને છે.',
  'family.youOrganise': 'તમે તેના આયોજક છો.',
  'family.youMember': 'તમે તેના સભ્ય છો.',
  'family.you': '(તમે)',
  'family.organiser': 'આયોજક',
  'family.notCompared': 'કોડ સરખાવ્યા વગર દાખલ કર્યા',
  'family.keyNew': 'તેની કી બદલાઈ: તમે કોડ સરખાવો ત્યાં સુધી તેમની પાસેથી કંઈ લેવાતું નથી',
  'family.membersLater': 'આ બ્રાઉઝર પર ખૂલ્યા પછી તેમાં કોણ છે તે અહીં દેખાશે.',
  'family.sharedVaults': 'શેર કરેલા વૉલ્ટ',
  'family.vaultWaits': 'તેમાં જે બદલાય છે તે આયોજક કી બદલે ત્યાં સુધી રાહ જુએ છે',

  // Cards, addresses and notes
  'wallet.updated': '{date} ના રોજ બદલ્યું',
  'wallet.copyField': '{field} કૉપિ કરો',
  'card.untitled': 'કાર્ડ',
  'card.newTitle': 'નવું કાર્ડ',
  'card.editTitle': 'કાર્ડ સંપાદિત કરો',
  'card.titleHint': 'ખાલી છોડો તો તેનું નામ કાર્ડના નેટવર્ક અને છેલ્લા ચાર અંક પર રાખવામાં આવે છે.',
  'card.number': 'કાર્ડ નંબર',
  'card.numberCheck': 'આ નંબર બરાબર નથી: દરેક અંક તપાસો.',
  'card.holder': 'કાર્ડ પરનું નામ',
  'card.expiry': 'સમાપ્તિ',
  'card.month': 'મહિનો',
  'card.year': 'વર્ષ',
  'card.code': 'સુરક્ષા કોડ',
  'card.empty': 'કાર્ડ નંબર અથવા નામ આપો.',
  'card.expired': 'આ કાર્ડની મુદત પૂરી થઈ ગઈ છે.',
  'card.expiredOn': '{expiry} ના રોજ મુદત પૂરી',
  'card.copyNumber': 'કાર્ડ નંબર કૉપિ કરો',
  'card.copyExpiry': 'સમાપ્તિ તારીખ કૉપિ કરો',
  'address.untitled': 'સરનામું',
  'address.newTitle': 'નવું સરનામું',
  'address.editTitle': 'સરનામું સંપાદિત કરો',
  'address.titleHint': 'ઘર, ઑફિસ… ખાલી છોડો તો તેમાંના નામ પર રાખવામાં આવે છે.',
  'address.name': 'પૂરું નામ',
  'address.organization': 'કંપની',
  'address.street': 'શેરી અને મકાન નંબર',
  'address.city': 'શહેર',
  'address.region': 'રાજ્ય અથવા પ્રદેશ',
  'address.postalCode': 'પિનકોડ',
  'address.country': 'દેશ',
  'address.chooseCountry': 'દેશ પસંદ કરો',
  'address.phone': 'ફોન',
  'address.email': 'ઈમેલ',
  'address.address': 'સરનામું',
  'address.empty': 'નામ અથવા સરનામાનો એક ભાગ ભરો.',
  'note.untitled': 'શીર્ષક વગરની નોંધ',
  'note.newTitle': 'નવી નોંધ',
  'note.editTitle': 'નોંધ સંપાદિત કરો',
  'note.title': 'શીર્ષક',
  'note.text': 'નોંધ',
  'note.empty': 'શીર્ષક આપો, અથવા કંઈક લખો.',
  'note.edited': '{date} ના રોજ સંપાદિત',

  // Pending save, in the popup
  'pending.saveTitle': 'આ લૉગિન સાચવીએ?',
  'pending.updateTitle': 'પાસવર્ડ અપડેટ કરીએ?',
  'pending.lockedTitle': 'હમણાં વાપરેલું લૉગિન સાચવીએ?',
  'pending.body': '{site} પર {username}',
  'pending.bodyNoUser': '{site} માટેનો પાસવર્ડ',
  'pending.save': 'સાચવો',
  'pending.update': 'અપડેટ કરો',
  'pending.never': 'આ સાઇટ માટે ક્યારેય નહીં',

  // Item
  'item.username': 'યુઝરનેમ',
  'item.password': 'પાસવર્ડ',
  'item.website': 'વેબસાઇટ',
  'item.websites': 'વેબસાઇટ',
  'item.notes': 'નોંધો',
  'item.favorite': 'મનપસંદ',
  'item.unfavorite': 'મનપસંદમાંથી કાઢો',
  'item.addFavorite': 'મનપસંદમાં ઉમેરો',
  'item.trash': 'ટ્રૅશમાં ખસેડો',
  'item.updated': '{date} ના રોજ પાસવર્ડ બદલ્યો',
  'item.history': 'પહેલાંના પાસવર્ડ',
  'item.weak': 'આ પાસવર્ડ નબળો છે: તેનું અનુમાન કરવામાં લાંબો સમય નહીં લાગે.',
  'item.reused': {
    one: 'આ પાસવર્ડ {count} બીજા લૉગિન માટે પણ વપરાય છે. જો એક સાઇટ તેને લીક કરે, તો બંને ખુલ્લા છે.',
    other: 'આ પાસવર્ડ {count} બીજા લૉગિન માટે પણ વપરાય છે. જો એક સાઇટ તેને લીક કરે, તો તે બધા ખુલ્લા છે.',
  },
  'item.changePassword': 'સાઇટ પર બદલો',
  'item.openSite': '{site} ખોલો',
  'item.passkey': 'પાસકી',
  'item.passkeyBody': '{site} માટે, {date} ના રોજ સાચવી',

  // Edit
  'edit.newTitle': 'નવું લૉગિન',
  'edit.editTitle': 'લૉગિન સંપાદિત કરો',
  'edit.title': 'નામ',
  'edit.titleHint': 'ખાલી છોડો તો તેનું નામ વેબસાઇટ પર રાખવામાં આવે છે.',
  'edit.username': 'યુઝરનેમ અથવા ઈમેલ',
  'edit.password': 'પાસવર્ડ',
  'edit.generate': 'બનાવો',
  'edit.websites': 'વેબસાઇટ',
  'edit.websitesHint': 'દરેક લાઇન પર એક. Passhold આ લૉગિન આ સાઇટો પર ઑફર કરે છે.',
  'edit.notes': 'નોંધો',
  'edit.empty': 'નામ, યુઝરનેમ અથવા પાસવર્ડ આપો.',

  // Fields of an item's own, and folders
  'fields.title': 'કસ્ટમ ફીલ્ડ',
  'fields.add': 'ફીલ્ડ ઉમેરો',
  'fields.name': 'ફીલ્ડનું નામ',
  'fields.value': 'કિંમત',
  'fields.hidden': 'પાસવર્ડની જેમ છુપાવો',
  'fields.remove': 'આ ફીલ્ડ કાઢી નાખો',
  'fields.unnamed': 'ફીલ્ડ',
  'fields.copy': '{name} કૉપિ કરો',
  'folders.label': 'ફોલ્ડર',
  'folders.placeholder': 'કોઈ ફોલ્ડર નહીં',
  'folders.choose': 'હાલના ફોલ્ડર',
  'folders.hint': 'વસ્તુઓ એકસાથે રાખો – કામ, પરિવાર, બેંક – અને એક સમયે એક ફોલ્ડર બતાવો.',
  'folders.all': 'બધા ફોલ્ડર',
  'folders.none': 'કોઈ ફોલ્ડરમાં નહીં',
  'folders.count': { one: '{count} આઇટમ', other: '{count} આઇટમ' },
  'folders.nothingHere': 'આ ફોલ્ડરમાં આ પ્રકારનું કંઈ નથી.',
  'folders.rename': 'નામ બદલો',
  'folders.renameTo': 'ફોલ્ડર માટે નવું નામ',
  'folders.remove': 'ફોલ્ડર કાઢી નાખો',
  'folders.removeHint': 'તેમાં જે છે તે રહે છે, કોઈ ફોલ્ડરમાં નહીં.',

  // Generator
  'generator.length': 'લંબાઈ',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'મળતા આવતા અક્ષરો છોડો (I l 1 O 0)',
  'generator.again': 'બીજો',
  'generator.use': 'આ પાસવર્ડ વાપરો',
  'generator.bits': '{bits} બિટ',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold લૉક છે.',
  'menu.unlock': 'Passhold અનલૉક કરો',
  'menu.unlockHint': 'અનલૉક કરવા માટે ટૂલબારમાં Passhold ક્લિક કરો, પછી અહીં પાછા આવો.',
  'menu.none': '{site} માટે કોઈ સાચવેલું લૉગિન નથી.',
  'menu.uninitialized': 'પહેલાં Passhold સેટ કરો: ટૂલબારમાં તેના પર ક્લિક કરો.',
  'menu.suggest': 'મજબૂત પાસવર્ડ વાપરો',
  'menu.suggestBody': 'નવો પાસવર્ડ, તમારા માટે ભરેલો. ફોર્મ મોકલાય પછી Passhold તેને સાચવવાની ઑફર કરે છે.',
  'menu.fillFor': '{site} પર ભરો',
  'menu.hidden': 'આ પેજ પર કંઈક Passhold ને ઢાંકે છે, તેથી તે ભરશે નહીં.',
  'menu.passkey': 'પાસકી · {username}',
  'menu.noCards': 'Passhold માં હજી કોઈ કાર્ડ નથી. ટૂલબારમાં Passhold પરથી એક ઉમેરો.',
  'menu.noAddresses': 'Passhold માં હજી કોઈ સરનામું નથી. ટૂલબારમાં Passhold પરથી એક ઉમેરો.',
  'menu.cardInsecure':
    'આ પેજ સુરક્ષિત નથી (સાદું http), તેથી Passhold અહીં કાર્ડ ભરશે નહીં: રસ્તામાં કોઈ તે વાંચી શકે.',

  // A website's passkey
  'passkey.saveTitle': '{site} માટે પાસકી સાચવીએ?',
  'passkey.save': 'પાસકી સાચવો',
  'passkey.saveElsewhere': 'બીજે ક્યાંક સાચવો',
  'passkey.useElsewhere': 'બીજેથી પાસકી વાપરો',
  'passkey.existsTitle': 'આ પાસકી Passhold માં પહેલેથી છે',
  'passkey.ok': 'OK',
  'passkey.signInTitle': '{site} માં સાઇન ઇન કરો',
  'passkey.signInBody': 'Passhold માં સાચવેલી પાસકી વડે',
  'passkey.none': 'Passhold માં {site} માટે કોઈ પાસકી નથી.',
  'passkey.hidden': 'આ પેજ પર કંઈક Passhold ને ઢાંકે છે, તેથી તે જવાબ આપશે નહીં.',

  // Save prompt on a page
  'prompt.save': 'Passhold માં લૉગિન સાચવીએ?',
  'prompt.update': 'Passhold માં પાસવર્ડ અપડેટ કરીએ?',
  'prompt.saveButton': 'સાચવો',
  'prompt.updateButton': 'અપડેટ કરો',
  'prompt.never': 'આ સાઇટ માટે ક્યારેય નહીં',
  'prompt.saved': 'Passhold માં સાચવ્યું.',
  'prompt.locked': 'ટૂલબારમાં Passhold ક્લિક કરો અને અનલૉક કરો – ત્યાં તે સાચવવાનું પૂછશે.',
  'prompt.saveCard': 'Passhold માં કાર્ડ સાચવીએ?',
  'prompt.updateCard': 'Passhold માં કાર્ડ અપડેટ કરીએ?',
  'prompt.saveAddress': 'Passhold માં સરનામું સાચવીએ?',
  'prompt.saveCheckout': 'Passhold માં કાર્ડ અને સરનામું સાચવીએ?',

  // Settings
  'settings.title': 'સેટિંગ્સ',
  'settings.cannotOpen': 'બિલકુલ ખોલી શકતા નથી? આ બ્રાઉઝરમાંથી વૉલ્ટ કાઢો',
  'settings.encryptedHere': 'આ ઉપકરણ પર એન્ક્રિપ્ટેડ',
  'settings.source': 'GitHub પર સ્રોત કોડ',

  'nav.passwords': 'પાસવર્ડ',
  'nav.accountSync': 'ખાતું અને સિંક',
  'nav.family': 'પરિવાર',
  'nav.account': 'Keyrook ખાતું',
  'nav.backup': 'બેકઅપ અને આયાત',
  'nav.security': 'સુરક્ષા',
  'nav.general': 'સામાન્ય',
  'nav.needsAttention': 'ધ્યાનની જરૂર છે',


  'account.description':
    'સાઇન ઇન કરો, અને તમારા લૉગિન Passhold માં સાઇન ઇન કરો તે દરેક બ્રાઉઝર સુધી તમારી સાથે આવે છે. તે પહેલાં આ ઉપકરણ પર એન્ક્રિપ્ટ થાય છે: Keyrook નો સર્વર તેમને વાંચી શકતો નથી, કે તે કઈ સાઇટ માટે છે તે પણ નહીં.',
  'account.email': 'ઈમેલ',
  'account.password': 'Keyrook ખાતા પાસવર્ડ',
  'account.signIn': 'સાઇન ઇન કરો',
  'account.signingIn': 'સાઇન ઇન થઈ રહ્યું છે…',
  'account.note':
    'Keyrook Authenticator જેવું જ ખાતું. Google અથવા GitHub વડે બનાવેલું ખાતું તેના બટન વડે સાઇન ઇન કરે છે.',
  'account.haveOne': 'મારી પાસે ખાતું છે',
  'account.create': 'ખાતું બનાવો',
  'account.sendCode': 'મને ઈમેલ પર કોડ મોકલો',
  'account.createNote':
    'સરનામું તમારું છે તે સાબિત કરવા Keyrook છ અંકનો કોડ ઈમેલ કરે છે. જો સરનામા પર પહેલેથી ખાતું હોય, તો ઈમેલ તે કહે છે: તે વડે સાઇન ઇન કરો.',
  'account.codeSent': '{email} પર કોડ મોકલાયો છે. તે પંદર મિનિટ માટે કામ કરે છે.',
  'account.code': 'છ અંકનો કોડ',
  'account.newPassword': 'Keyrook ખાતા પાસવર્ડ',
  'account.passwordNote':
    'આ પાસવર્ડ કોઈ પણ બ્રાઉઝરમાં તમારું Keyrook ખાતું ખોલે છે, Passhold અને Keyrook Authenticator બંને માટે. Keyrook તેને ક્યારેય જોતું નથી અને તમારા માટે તેને રીસેટ કરી શકતું નથી; આગળ મળનારી રિકવરી કી નવો પાસવર્ડ સેટ કરવાનો રસ્તો છે.',
  'account.createButton': 'ખાતું બનાવો',
  'account.creating': 'બનાવી રહ્યા છીએ…',
  'account.otherEmail': 'બીજું સરનામું વાપરો',
  'account.signedInAs': '{email} તરીકે સાઇન ઇન',
  'account.signedInAsNamed': '{name} ({email}) તરીકે સાઇન ઇન',
  'account.synced': '{date} ના રોજ સિંક થયું',
  'account.notSynced': 'હજી સિંક થયું નથી',
  'account.syncNow': 'હમણાં સિંક કરો',

  // The account, at the foot of the popup
  'accountBar.synced': '{time} સિંક થયું',
  'accountBar.justNow': 'હમણાં જ',
  'accountBar.syncing': 'સિંક થઈ રહ્યું છે…',
  'accountBar.signedOut': 'સાઇન આઉટ – સિંક કરવા ફરી સાઇન ઇન કરો',
  'accountBar.startedOver': 'ખાતું ફરીથી શરૂ થયું – ફરી સાઇન ઇન કરો',
  'accountBar.removed': 'ખાતામાંથી કાઢી નાખ્યું – સિંક કરવા ફરી સાઇન ઇન કરો',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'તમારા Keyrook ખાતામાંથી કાઢી નાખ્યું',
  'removed.body':
    '{date} ના રોજ આ બ્રાઉઝર તમારા Keyrook ખાતામાંથી કાઢી નાખવામાં આવ્યું, તેથી Passhold એ ખાતાના લૉગિન, કાર્ડ, સરનામાં અને નોંધો તેમાંથી કાઢી નાખ્યા અને તેને સાઇન આઉટ કર્યું. અહીં ઉમેરેલા અથવા બદલેલા અને ક્યારેય મોકલ્યા ન હોય તેવા રહ્યા, આ બ્રાઉઝરના પોતાના તરીકે. બાકીનું પાછું લાવવા ફરી સાઇન ઇન કરો.',

  // Passwords, in Settings
  'passwords.description':
    'Passhold માં દરેક લૉગિન, પાસકી, કાર્ડ, સરનામું અને નોંધ. એક પસંદ કરો તેને જોવા, તેમાંથી કૉપિ કરવા અથવા તેને બદલવા માટે.',
  'passwords.all': 'બધા',
  'passwords.attention': 'ધ્યાનની જરૂર છે',
  'passwords.weak': 'નબળા',
  'passwords.reused': 'ફરી વપરાયેલા',
  'account.syncDone': 'સિંક થયું.',
  'account.removed': {
    one: 'બીજા ઉપકરણ પર કાયમ માટે કાઢી નાખેલી {count} આઇટમ અહીંથી કાઢી નાખવામાં આવી.',
    other: 'બીજા ઉપકરણ પર કાયમ માટે કાઢી નાખેલી {count} આઇટમ અહીંથી કાઢી નાખવામાં આવી.',
  },
  'account.skipped': {
    one: '{count} રેકૉર્ડ ખૂલ્યો નહીં અને તેને એકલું છોડી દેવાયું.',
    other: '{count} રેકૉર્ડ ખૂલ્યા નહીં અને તેમને એકલા છોડી દેવાયા.',
  },
  'account.manage': 'તમારું Keyrook ખાતું સંચાલિત કરો',
  'account.manageBody':
    'account.keyrook.com પર પાસવર્ડ બદલો, નવી રિકવરી કી બનાવો અથવા ખાતું ફરીથી શરૂ કરો – Passhold અને Keyrook Authenticator બંને માટે.',
  'account.manageBodyProvider':
    'account.keyrook.com પર નવી રિકવરી કી બનાવો અથવા ખાતું ફરીથી શરૂ કરો – Passhold અને Keyrook Authenticator બંને માટે.',
  'account.manageOpen': 'ખોલો',
  'account.signOut': 'સાઇન આઉટ',
  'account.signOutBody':
    'છેલ્લા સિંક પછી, આ બ્રાઉઝરમાંથી દરેક લૉગિન કાઢી નાખે છે. ફરી સાઇન ઇન કરો અને તે પાછા આવે છે.',
  'account.signOutConfirm':
    'Passhold એક વાર ફરી સિંક કરે છે, પછી આ બ્રાઉઝરમાંથી વૉલ્ટ કાઢે છે. જો કોઈ લૉગિન તમારા ખાતા સુધી ન પહોંચ્યું હોય તો કંઈ કાઢવામાં આવતું નથી.',
  'account.signOutButton': 'સાઇન આઉટ કરો અને કાઢો',
  'account.signedOutByServer': 'Keyrook એ આ બ્રાઉઝરને સાઇન આઉટ કર્યું છે. સિંક ચાલુ રાખવા ફરી સાઇન ઇન કરો.',
  'account.startedOver':
    'તમારું Keyrook ખાતું {date} ના રોજ ફરીથી શરૂ થયું, તેથી Keyrook એ આ બ્રાઉઝરને સાઇન આઉટ કર્યું. તેના નવા પાસવર્ડ વડે સાઇન ઇન કરો: અહીંના લૉગિન ખાતાની નવી કીઓ હેઠળ અપલોડ થશે.',
  'account.startedOverProvider':
    'તમારું Keyrook ખાતું {date} ના રોજ ફરીથી શરૂ થયું, તેથી Keyrook એ આ બ્રાઉઝરને સાઇન આઉટ કર્યું. Google અથવા GitHub વડે સાઇન ઇન કરો: અહીંના લૉગિન ખાતાની નવી કીઓ હેઠળ અપલોડ થશે.',
  'account.forgot': 'પાસવર્ડ ભૂલી ગયા?',
  'account.recoverBody':
    'Keyrook ખાતાના સરનામે એક કોડ ઈમેલ કરે છે; પછી તે લખો, જે શીટ તમે ખાતું બનાવ્યું ત્યારે સાચવી હતી તેમાંથી ખાતાની રિકવરી કી, અને નવો પાસવર્ડ. ખાતા સાથે સાઇન ઇન થયેલા બીજા દરેક બ્રાઉઝર અને એપ નવા પાસવર્ડ માટે પૂછશે.',
  'account.recoveryKey': 'ખાતાની રિકવરી કી',
  'account.recoverPassword': 'નવો ખાતા પાસવર્ડ',
  'account.recoverButton': 'નવો પાસવર્ડ સેટ કરો',
  'account.recovering': 'સેટ થઈ રહ્યું છે…',
  'account.backToSignIn': 'સાઇન ઇન પર પાછા',
  'startOver.link': 'રિકવરી કી પણ ખોવાઈ ગઈ? ખાતું ફરીથી શરૂ કરો',
  'startOver.title': 'ખાતું ફરીથી શરૂ કરો',
  'needsRoot.body':
    'જો તમારી પાસે Keyrook Authenticator એ આપેલી ખાતાની રિકવરી કી હોય, તો તે લખો: તે Passhold ને પણ ખોલે છે. તે વગર, Passhold ખાતા માટે નવી રિકવરી કી બનાવે છે, ફક્ત એક વાર બતાવે છે, અને જૂની કી કામ કરવાનું બંધ કરે છે.',
  'needsRoot.sheet': 'Keyrook Authenticator માંથી ખાતાની રિકવરી કી (જો તમારી પાસે હોય)',
  'needsRoot.withSheet': 'આ કી વાપરો',
  'needsRoot.newSheet': 'નવી રિકવરી કી બનાવો',
  'startOver.body':
    'જો ફક્ત ઈમેલ સરનામું બાકી હોય, તો ખાતું નવી કીઓ અને નવી રિકવરી કી સાથે ફરીથી શરૂ થઈ શકે છે. તમે માંગ્યા પછી એક અઠવાડિયે તે અસરકારક બને છે, અને ત્યાં સુધી ખાતામાં હજી સાઇન ઇન રહેલું કોઈ પણ બ્રાઉઝર તેને રદ કરી શકે છે – તેથી ફક્ત તમારું ઈમેલ ધરાવતું કોઈ તેને લઈ શકતું નથી. ખાતામાં જે હતું તે Keyrook 90 દિવસ સુધી સાચવે છે, હજી એન્ક્રિપ્ટેડ: જૂનો પાસવર્ડ અથવા જૂની રિકવરી કી તેને પાછું લાવે છે.',
  'startOver.button': 'ફરીથી શરૂ કરો',
  'startOver.working': 'ખાતું ફરીથી શરૂ થઈ રહ્યું છે…',
  'startOver.kitBody':
    'ખાતાની નવી રિકવરી કી: ખાતું ફરીથી શરૂ થયા પછી તે કામ કરે છે. Passhold તેને ફક્ત હમણાં બતાવે છે, તેથી આગળ વધતા પહેલાં તેને સાચવો.',
  'startOver.waitTitle': 'તમારું ખાતું {date} ના રોજ ફરીથી શરૂ થાય છે',
  'startOver.waitBody':
    'ત્યાં સુધી કશું બદલાતું નથી, અને ખાતામાં હજી સાઇન ઇન રહેલું કોઈ પણ બ્રાઉઝર તેને રદ કરી શકે છે. Keyrook હમણાં {email} પર ઈમેલ કરે છે, આગલા દિવસે, અને જ્યારે તે થાય ત્યારે.',
  'startOver.waitThen':
    'ત્યારથી, તમારા નવા પાસવર્ડ વડે અહીં સાઇન ઇન કરો. આ બ્રાઉઝરમાંના લૉગિન ખાતાની નવી કીઓ હેઠળ અપલોડ થશે, અને તેમાં પહેલાં જે હતું તે 90 દિવસ સુધી સાચવાય છે.',
  'startOver.waitThenProvider':
    'ત્યારથી, પહેલાંની જેમ Google અથવા GitHub વડે અહીં સાઇન ઇન કરો. આ બ્રાઉઝરમાંના લૉગિન ખાતાની નવી કીઓ હેઠળ અપલોડ થશે, અને તેમાં પહેલાં જે હતું તે 90 દિવસ સુધી સાચવાય છે.',
  'startOver.understood': 'સમજાયું',
  'startOver.doneTitle': 'તમારું ખાતું ફરીથી શરૂ થયું છે',
  'startOver.doneBody':
    'તમારા નવા પાસવર્ડ વડે સાઇન ઇન કરો: આ બ્રાઉઝરમાંના લૉગિન ખાતાની નવી કીઓ હેઠળ અપલોડ થશે, અને તેમાં પહેલાં જે હતું તે 90 દિવસ સુધી સાચવાય છે.',
  'startOver.doneBodyProvider':
    'પહેલાંની જેમ Google અથવા GitHub વડે સાઇન ઇન કરો: આ બ્રાઉઝરમાંના લૉગિન ખાતાની નવી કીઓ હેઠળ અપલોડ થશે, અને તેમાં પહેલાં જે હતું તે 90 દિવસ સુધી સાચવાય છે.',
  'startOverWait.title': 'તમારું Keyrook ખાતું {date} ના રોજ ફરીથી શરૂ થાય છે',
  'startOverWait.body':
    'તે Keyrook એ તમને ઈમેલ કરેલા કોડ સાથે માંગ્યું હતું, “{device}” નામના ઉપકરણ પરથી. જો તે તમે નહોતા, તો કોઈ તમારા ઈમેલ વાંચી શકે છે: હમણાં તે રદ કરો, પછી તમારો ઈમેલ પાસવર્ડ બદલો. જો તે તમે હતા, તો તેને રહેવા દો.',
  'startOverWait.bodyNoName':
    'તે Keyrook એ તમને ઈમેલ કરેલા કોડ સાથે માંગ્યું હતું. જો તે તમે નહોતા, તો કોઈ તમારા ઈમેલ વાંચી શકે છે: હમણાં તે રદ કરો, પછી તમારો ઈમેલ પાસવર્ડ બદલો. જો તે તમે હતા, તો તેને રહેવા દો.',
  'startOverWait.cancel': 'ફરીથી શરૂ કરવાનું રદ કરો',
  'kept.title': {
    one: 'ખાતું ફરીથી શરૂ થયા પહેલાં રાખેલું: {count} આઇટમ',
    other: 'ખાતું ફરીથી શરૂ થયા પહેલાં રાખેલું: {count} આઇટમ',
  },
  'kept.body': '{date} સુધી. જૂનો ખાતા પાસવર્ડ અથવા જૂની રિકવરી કી તેમને Passhold માં પાછા લાવે છે.',
  'kept.open': 'પાછું લાવો',
  'kept.secret': 'જૂનો ખાતા પાસવર્ડ અથવા જૂની રિકવરી કી',
  'kept.done': { one: '{count} આઇટમ પાછી લાવવામાં આવી.', other: '{count} આઇટમ પાછી લાવવામાં આવી.' },
  'kept.nothingNew': 'રાખેલું બધું પહેલેથી અહીં છે.',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': '{provider} વડે ચાલુ રાખો',
  'provider.passwordTitle': 'આ Keyrook ખાતામાં પાસવર્ડ છે',
  'provider.passwordBody':
    'તમે {email} તરીકે {provider} વડે સાઇન ઇન કર્યું. ખાતાનો પાસવર્ડ અહીં Passhold ખોલે છે: તે એકવાર લખો.',
  'provider.openAccountPage': 'account.keyrook.com ખોલો',
  'secondStep.title': 'બે-પગલાંનું સાઇન ઇન',
  'secondStep.body':
    'Keyrook માટે તમારી ઓથેન્ટિકેટર એપ બતાવે છે તે 6 અંકનો કોડ દાખલ કરો. એપ ખોવાઈ ગઈ? તેના બદલે તમારી ખાતાની રિકવરી કી લખો.',
  'secondStep.ownerBody':
    'તમારું ખાતું આ માટે પણ બીજું પગલું માંગે છે: તમારી ઓથેન્ટિકેટર એપ બતાવે છે તે કોડ, અથવા તમારી ખાતાની રિકવરી કી.',
  'secondStep.field': 'કોડ, અથવા રિકવરી કી',
  'secondStep.continue': 'આગળ',
  'secondStep.passkey': 'તેના બદલે પાસકી વાપરો',
  'secondStep.nextBody':
    'ખાતાને તેની કી આપવા માટે પણ કોડ માંગવામાં આવે છે, અને દરેક કોડ ફક્ત એક જ વાર કામ કરે છે. તમારી ઓથેન્ટિકેટર એપ નવો બતાવે તેની રાહ જુઓ, પછી તે લખો – અથવા તમારી ખાતાની રિકવરી કી.',
  'provider.or': 'અથવા',
  'provider.signedInWith': '{email} તરીકે {provider} વડે સાઇન ઇન',
  'provider.signedInWithNamed': '{name} ({email}) તરીકે {provider} વડે સાઇન ઇન',
  'provider.newTitle': 'તમારું Keyrook ખાતું બનાવો',
  'provider.newBody':
    'તમે {email} તરીકે {provider} વડે સાઇન ઇન કરી રહ્યા છો. ખાતામાં પાસવર્ડ નથી: {provider} તમને સાઇન ઇન કરે છે. બીજા કમ્પ્યુટર પર, પહેલેથી સાઇન ઇન થયેલું બ્રાઉઝર તમને અંદર આવવા દે છે – અથવા તમને આગળ મળનારી રિકવરી કી તે કરે છે.',
  'provider.joinTitle': 'આ બ્રાઉઝરને અંદર આવવા દો',
  'provider.joinBody':
    '{email} અહીં સાઇન ઇન છે, પરંતુ તમારા લૉગિન ખોલતી કી તમારા બીજા કમ્પ્યુટર્સ પર છે. તેમાંથી એક પર Passhold ખોલો – સેટિંગ્સ, ખાતું અને સિંક – અને આ બ્રાઉઝરને અંદર આવવા દો.',
  'provider.waiting': 'બીજા બ્રાઉઝરની રાહ જુઓ છીએ…',
  'provider.compare': 'બીજું બ્રાઉઝર એક કોડ બતાવે છે. ત્યાં તેને ત્યારે જ અંદર આવવા દો જો તે આ જ હોય:',
  'provider.ended': 'બીજા બ્રાઉઝરે આ બ્રાઉઝરને અંદર આવવા દીધું તે પહેલાં તે વિનંતી સમાપ્ત થઈ.',
  'provider.askAgain': 'ફરી પૂછો',
  'provider.useKit': 'તેના બદલે રિકવરી કી વાપરો',
  'provider.useThisKey': 'આ કી વાપરો',
  'provider.needsRoot':
    '{email} Keyrook Authenticator માં બનાવેલું હતું, તે પહેલાં કે દરેક Keyrook એપની પોતાની કી હતી. Passhold હવે તેને એક આપી શકે છે, એક વાર તમે {provider} વડે ફરી પુષ્ટિ કરો; Authenticator માં કંઈ બદલાતું નથી.',
  'provider.confirmWith': '{provider} વડે પુષ્ટિ કરો',
  'provider.noKeyYet':
    'Passhold {email} માં હજી ક્યાંય સાઇન ઇન થયું નથી, તેથી બીજું કોઈ બ્રાઉઝર આને અંદર આવવા દઈ શકતું નથી. ખાતાની રિકવરી કી તેને ખોલે છે.',
  'passkey.onLabel': 'નવા કમ્પ્યુટર તમારી પાસકી વડે ખુલે છે',
  'passkey.offLabel': 'નવા કમ્પ્યુટર માટે કોઈ પાસકી નથી',
  'passkey.body':
    'નવા કમ્પ્યુટર પર: {provider}, પછી તમારી પાસકી – અને દરેક લૉગિન ત્યાં છે. Google પાસવર્ડ મેનેજર દ્વારા સચવાયેલી, પાસકી તમે સાઇન ઇન કરો તે દરેક Chrome પર હોય છે.',
  'passkey.bodyEdge':
    'નવા કમ્પ્યુટર પર: {provider}, પછી તમારી પાસકી – અને દરેક લૉગિન ત્યાં છે. જ્યાં તે સિંક થાય છે ત્યાં સચવાયેલી, પાસકી તમારા બીજા ઉપકરણો પર પણ હોય છે.',
  'passkey.turnOn': 'ચાલુ કરો',
  'passkey.turnOff': 'બંધ કરો',
  'passkey.joinTitle': 'તમારી પાસકી વડે ખોલો',
  'passkey.joinBody': '{email} પાસે નવા કમ્પ્યુટર માટે એક પાસકી છે. તેની વડે પુષ્ટિ કરો, અને તમારા લૉગિન નીચે આવશે.',
  'passkey.use': 'પાસકી વાપરો',
  'passkey.otherWays': 'અંદર જવાના બીજા રસ્તા',
  'pairing.asking': '{device} તમારા ખાતામાં અંદર આવવા માંગે છે.',
  'pairing.start': 'અંદર આવવા દો…',
  'pairing.notMe': 'હું નથી',
  'pairing.compare': 'નવું બ્રાઉઝર આ જ કોડ બતાવે ત્યારે જ તેને અંદર આવવા દો:',
  'pairing.match': 'કોડ સરખા છે – અંદર આવવા દો',
  'pairing.differ': 'કોડ જુદા છે',

  'accountKit.title': 'ખાતાની રિકવરી કી સાચવો',
  'accountKit.body':
    'જો તમે તમારો Keyrook ખાતા પાસવર્ડ ભૂલી જાઓ, તો આ કી નવો સેટ કરે છે – Passhold અને Keyrook Authenticator બંને માટે. Keyrook તમારો પાસવર્ડ ક્યારેય જોતું નથી, તેથી આ એકમાત્ર રસ્તો છે. તમે તેને સેટિંગ્સમાં ફરી જોઈ શકો છો; તેને બીજી જગ્યાએ પણ રાખો.',
  'accountKit.fileTitle': 'Keyrook ખાતાની રિકવરી કી',
  'accountKit.fileBody':
    'જો તમે તમારો Keyrook ખાતા પાસવર્ડ ભૂલી જાઓ, તો આ કી નવો સેટ કરે છે: Passhold માં, સેટિંગ્સ → ખાતું અને સિંક → “પાસવર્ડ ભૂલી ગયા?”. જેની પાસે તે અને તમારું ઈમેલ સરનામું હોય તે પણ આવું જ કરી શકે છે, તેથી તેને સુરક્ષિત રાખો અને આ કમ્પ્યુટર પર નહીં.',
  'accountKit.bodyNoPassword':
    'તમારા ખાતામાં પાસવર્ડ નથી: પહેલેથી સાઇન ઇન થયેલું બ્રાઉઝર નવું અંદર આવવા દે છે. જો કોઈ બાકી ન હોય, તો આ કી તે કરે છે – Passhold અને Keyrook Authenticator બંને માટે. તમે તેને સેટિંગ્સમાં ફરી જોઈ શકો છો; તેને બીજી જગ્યાએ પણ રાખો.',
  'accountKit.fileBodyNoPassword':
    'જો તમારા Keyrook ખાતામાં કોઈ કમ્પ્યુટર સાઇન ઇન ન રહ્યું હોય, તો આ કી નવાને અંદર આવવા દે છે: Google અથવા GitHub વડે સાઇન ઇન કરો, પછી “તેના બદલે રિકવરી કી વાપરો” પસંદ કરો. જેની પાસે તે હોય અને જે તમારા તરીકે સાઇન ઇન કરી શકે તે પણ આવું કરી શકે છે, તેથી તેને સુરક્ષિત રાખો અને આ કમ્પ્યુટર પર નહીં.',
  'accountKit.whenTitleNoPassword': 'જ્યારે કોઈ કમ્પ્યુટર સાઇન ઇન ન રહ્યું હોય',
  'accountKit.inPassholdNoPassword':
    'Passhold માં: Google અથવા GitHub વડે સાઇન ઇન કરો, “તેના બદલે રિકવરી કી વાપરો” પસંદ કરો, અને આ કી લખો.',
  'accountKit.keepNoPassword':
    'આ શીટ તમારા કમ્પ્યુટરથી દૂર, સુરક્ષિત જગ્યાએ રાખો. તે સાથે, જે કોઈ તમારા Google અથવા GitHub ખાતામાં સાઇન ઇન કરી શકે તે તમારું Keyrook ખાતું ખોલી શકે છે.',
  'accountKit.rowBodyNoPassword': 'બીજું કોઈ બાકી ન હોય ત્યારે નવા કમ્પ્યુટરને અંદર આવવા દે છે.',
  'accountKit.sheetTitle': 'Keyrook ખાતાની રિકવરી કિટ',
  'accountKit.whenTitle': 'જ્યારે ખાતાનો પાસવર્ડ ભૂલાઈ જાય',
  'accountKit.inPasshold':
    'Passhold માં: સેટિંગ્સ → ખાતું અને સિંક → “પાસવર્ડ ભૂલી ગયા?”, પછી તમારું ઈમેલ સરનામું, Keyrook ઈમેલ કરે તે કોડ, આ કી, અને નવો પાસવર્ડ.',
  'accountKit.inAuthenticator': 'Keyrook Authenticator પણ એ જ કી લે છે: સાઇન ઇન માટે પૂછે ત્યાં “પાસવર્ડ ભૂલી ગયા?”.',
  'accountKit.keep':
    'આ શીટ તમારા કમ્પ્યુટરથી દૂર, સુરક્ષિત જગ્યાએ રાખો. તે અને તમારું ઈમેલ ઇનબોક્સ ધરાવતું કોઈ પણ ખાતા માટે નવો પાસવર્ડ સેટ કરી શકે છે.',
  'accountKit.pending': 'ખાતાની રિકવરી કી સાચવેલી નથી',
  'accountKit.keptState': 'ખાતાની રિકવરી કી સાચવેલી છે',
  'accountKit.elsewhere': 'ખાતાની રિકવરી કી બીજે બનાવેલી',
  'accountKit.none': 'ખાતાની કોઈ રિકવરી કી નથી',
  'accountKit.rowBody': 'ભૂલાઈ જાય તો નવો ખાતા પાસવર્ડ સેટ કરે છે. નવી કી જૂનીને દરેક એપમાં કામ કરતી બંધ કરે છે.',
  'accountKit.elsewhereBody':
    'account.keyrook.com પર, Keyrook Authenticator માં અથવા બીજા બ્રાઉઝરમાં બનાવેલી: તેની કી ત્યારે સાચવેલી શીટ પર છે. અહીં એક બનાવવાથી તે કામ કરવાનું બંધ કરે છે.',
  'accountKit.noneBody':
    'એક વગર, ભૂલાઈ ગયેલો ખાતા પાસવર્ડ રીસેટ થઈ શકતો નથી, અને Keyrook પર સચવાયેલું ખોલી શકાતું નથી. આ બ્રાઉઝરના લૉગિન બંને રીતે રહે છે.',
  'accountKit.make': 'એક બનાવો',
  'accountKit.apart':
    'તેને તમારા ઈમેલથી અલગ રાખો: જેની પાસે આ કી હોય અને જે તમારો ઈમેલ વાંચી શકે, તે નવો પાસવર્ડ સેટ કરી શકે અને તમારા લૉગિન ખોલી શકે. તે તમને પોતાને ઈમેલ ન કરો, અને તે ઈમેલની ક્લાઉડ ડ્રાઇવમાં ન રાખો.',
  'accountKit.apartNoPassword':
    'તેને તમે જેની સાથે સાઇન ઇન કરો છો તે Google અથવા GitHub ખાતાથી અલગ રાખો: જેની પાસે આ કી હોય અને જે ત્યાં તમારા તરીકે સાઇન ઇન કરી શકે, તે તમારા લૉગિન ખોલી શકે. તે તમને પોતાને ઈમેલ ન કરો, અને તે ખાતાની ક્લાઉડ ડ્રાઇવમાં ન રાખો.',
  'accountKit.unchecked': 'ખાતાની રિકવરી કી હજી તપાસેલી નથી',
  'accountKit.uncheckedBody':
    'તમારા ખાતામાં એક રિકવરી કી છે, જે account.keyrook.com પર અથવા બીજી એપમાં બનાવેલી છે. તે એકવાર લખો: Passhold તપાસે છે કે તે તમારું ખાતું ખોલે છે, અને તમને ફરી બતાવવા માટે તેને રાખે છે.',
  'accountKit.typeIt': 'લખો',
  'accountKit.checked': 'તે તમારું ખાતું ખોલે છે. Passhold તેને હવે રાખે છે, અહીં ફરી બતાવવા માટે.',
  'accountKit.draftBody':
    'તમારા ખાતાની નવી રિકવરી કી. તે હજી કામ કરતી નથી: તમે તેને સાચવી અને પાછી લખો પછી, તમારો ખાતા પાસવર્ડ તેને સેટ કરે છે, અને જૂની કી કામ કરવાનું બંધ કરે છે.',
  'accountKit.setTitle': 'તમારી નવી રિકવરી કી સેટ કરો',
  'accountKit.setBody':
    'તમારો Keyrook ખાતા પાસવર્ડ લખો. ત્યાં સુધી તમારી જૂની રિકવરી કી હજી કામ કરે છે, અને આ નવી નહીં.',
  'accountKit.set': 'સેટ કરો',
  'checkup.clear': 'ઠીક કરવાનું કંઈ નથી',
  'checkup.clearBody': 'કોઈ નબળા કે ફરી વપરાયેલા પાસવર્ડ નથી, અને તમારો બેકઅપ અદ્યતન છે.',
  'checkup.issues': { one: 'જોવા જેવી {count} બાબત', other: 'જોવા જેવી {count} બાબતો' },
  'checkup.issuesBody': 'નીચે દરેક બાબત કહે છે કે તે શા માટે મહત્ત્વની છે અને તેને કેવી રીતે ઠીક કરવી.',
  'checkup.backup': 'બેકઅપ',
  'checkup.access': 'અંદર જવું',
  'checkup.recoveryPending':
    'આ વૉલ્ટ માટે બનાવેલી રિકવરી કી સાચવેલી તરીકે ક્યારેય પુષ્ટિ થઈ નથી, અને {method} કામ કરવાનું બંધ કરે તો તે અંદર જવાનો એકમાત્ર રસ્તો છે. નવી બનાવો, અને તેને રાખો.',
  'checkup.deviceMissing':
    'આ વૉલ્ટમાં મુખ્ય પાસવર્ડ નથી, તેથી અહીં {method} વગર દરેક અનલૉક રિકવરી કી માંગે છે.',
  'checkup.lastBackup': 'છેલ્લો બેકઅપ {date}',
  'checkup.backupNever':
    'જો આ બ્રાઉઝર ખોવાઈ જાય, તો તમારા લૉગિન પણ ખોવાય. બેકઅપ એક એન્ક્રિપ્ટેડ ફાઇલ છે, જે બીજે ક્યાંક રાખવા માટે છે.',
  'checkup.backupDue': 'ત્યારથી તમારો વૉલ્ટ બદલાયો છે. તે બધું સમાવે તે માટે નવો બનાવો.',
  'checkup.backUp': 'હમણાં બેકઅપ લો',
  'checkup.weak': { one: '{count} નબળો પાસવર્ડ', other: '{count} નબળા પાસવર્ડ' },
  'checkup.weakBody':
    'ટૂંકો અથવા એટલો સહેલો કે અનુમાન થઈ શકે. દરેકને તેની સાઇટ પર બદલો; Passhold ફોર્મમાં એક મજબૂત સૂચવે છે અને તેને સાચવવાની ઑફર કરે છે.',
  'checkup.weakNone': 'કોઈ નહીં.',
  'checkup.reused': { one: '{count} પાસવર્ડ એકથી વધુ વાર વપરાય છે', other: '{count} પાસવર્ડ એકથી વધુ વાર વપરાય છે' },
  'checkup.reusedBody':
    'એક સાઇટ પાસવર્ડ લીક કરે ત્યારે લોકો તેને બીજે બધે અજમાવે છે. દરેક લૉગિનને પોતાનો આપો.',
  'checkup.reusedNone': 'કોઈ નહીં: દરેક લૉગિનનો પોતાનો પાસવર્ડ છે.',
  'checkup.sharedBy': { one: '{count} લૉગિન દ્વારા શેર', other: '{count} લૉગિન દ્વારા શેર' },
  'checkup.change': 'બદલો',
  'checkup.limits':
    'Passhold તપાસતું નથી કે કોઈ પાસવર્ડ ડેટા ભંગમાં દેખાયો છે કે નહીં: તેના માટે સર્વરને પૂછવું પડે, અને Passhold કોઈને પૂછતું નથી. તે જૂના પાસવર્ડ વિશે પણ રટતું નથી – મજબૂત, અનોખો પાસવર્ડ ઘસાઈ જતો નથી.',

  'backup.description': 'એક એન્ક્રિપ્ટેડ નકલ રાખો, એક પાછી લાવો, અથવા લૉગિન અંદર-બહાર ખસેડો.',
  'backup.backupRow': 'તમારો આખો વૉલ્ટ એક એન્ક્રિપ્ટેડ ફાઇલમાં, તમારા મુખ્ય પાસવર્ડ હેઠળ.',
  'backup.restoreRow': 'બેકઅપ ફાઇલના લૉગિન આ વૉલ્ટમાં ઉમેરો.',
  'backup.importRow': 'બીજા બ્રાઉઝર અથવા પાસવર્ડ મેનેજરમાંથી, CSV ફાઇલ તરીકે, અથવા Bitwarden નું JSON.',
  'backup.exportRow': 'એક CSV ફાઇલ જે બીજી એપ વાંચી શકે. એન્ક્રિપ્ટેડ નથી.',

  'security.description': 'Passhold કેવી રીતે ખૂલે છે, અને ક્યારે ફરી બંધ થાય છે.',
  'security.locking': 'લૉક કરવું',
  'security.opensTitle': 'Passhold કેવી રીતે ખૂલે છે',
  'security.opensBody': 'મુખ્ય પાસવર્ડ નથી: {method} તેને ખોલે છે, અને {method} ન ખોલી શકે ત્યારે રિકવરી કી.',
  'security.setPassword': 'તેના બદલે મુખ્ય પાસવર્ડ વાપરો',
  'security.setPasswordBody':
    'પછી Passhold તમે પસંદ કરેલા પાસવર્ડ વડે ખુલે છે, અને રિકવરી કી તેને ખોલવાનું બંધ કરે છે.',
  'security.setPasswordOpen': 'સેટ કરો',
  'security.setPasswordSave': 'આ પાસવર્ડ વાપરો',
  'security.dropPassword': 'મુખ્ય પાસવર્ડ વાપરવાનું બંધ કરો',
  'security.dropPasswordBody':
    'ફક્ત {method} વડે ખોલો, અને તે ન ચાલે તે દિવસ માટે રિકવરી કી રાખો. મુખ્ય પાસવર્ડ વૉલ્ટ ખોલવાનું બંધ કરે છે.',
  'security.dropPasswordOpen': 'બદલો',
  'security.dropPasswordSave': 'બદલો અને રિકવરી કી બતાવો',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'તમારા ઉપકરણની સ્ક્રીન લૉક',
  'device.method.passkey': 'તમારી પાસકી',
  'device.title': '{method} વડે અનલૉક કરો',
  'device.description': 'અંદર જવાનો સૌથી ઝડપી રસ્તો, અને બ્રાઉઝર ફરી શરૂ થયા પછી પણ તે કામ કરે છે.',
  'device.on': 'ચાલુ',
  'device.off': 'બંધ',
  'device.body':
    'તમારી આંગળીની છાપ અથવા ચહેરો Passhold ખોલે છે – અથવા, મોટાભાગના કમ્પ્યુટર પર, કમ્પ્યુટરનો પોતાનો પાસવર્ડ. તેથી જે કોઈ આ કમ્પ્યુટર અનલૉક કરી શકે તે Passhold ખોલી શકે. જે ખુલે છે તે આ કમ્પ્યુટર પર રહે છે, તેના વગર નકામું.',
  'device.whereMac':
    'જ્યારે Chrome પૂછે કે પાસકી ક્યાં સાચવવી, ત્યારે Google પાસવર્ડ મેનેજર પસંદ કરો. તમારી Chrome પ્રોફાઇલમાંની પાસકી Passhold ને અનલૉક કરી શકતી નથી, અને દરેક Mac પરનો iCloud Keychain પણ નહીં.',
  'device.whereMacEdge':
    'જ્યારે Edge પૂછે કે પાસકી ક્યાં સાચવવી, ત્યારે એવી જગ્યા પસંદ કરો જે તેને તમારા બીજા ઉપકરણો પર પણ રાખે. દરેક જગ્યા Passhold ને અનલૉક કરી શકતી નથી: તમે પસંદ કરેલી જગ્યા ન કરી શકે, તો Passhold એ કહે છે, અને કંઈ બદલાતું નથી.',
  'device.unavailable': 'અહીં ઉપલબ્ધ નથી',
  'device.unavailableBody':
    'આ બ્રાઉઝરને ફિંગરપ્રિન્ટ, ચહેરો અથવા સ્ક્રીન લૉક મળ્યું નથી જે Passhold વાપરી શકે. PIN બધે કામ કરે છે.',
  'device.unavailableRecovery':
    'આ બ્રાઉઝરને ફિંગરપ્રિન્ટ, ચહેરો અથવા સ્ક્રીન લૉક મળ્યું નથી જે Passhold વાપરી શકે, તેથી અહીં આ વૉલ્ટ તેની રિકવરી કી વડે ખુલે છે. જો તમે તે લખવાનું પસંદ કરો, તો મુખ્ય પાસવર્ડ સેટ કરો.',
  'device.opensWith': '{method} Passhold ખોલે છે',
  'device.notHere': 'આ બ્રાઉઝરમાં {method} સેટ નથી',
  'device.isTheWayIn': 'મુખ્ય પાસવર્ડ વગર, Passhold આ રીતે ખુલે છે. તે બંધ કરવા માટે, પહેલાં મુખ્ય પાસવર્ડ સેટ કરો.',
  'device.setUpHere': '{method} અહીં સેટ થાય ત્યાં સુધી, દરેક અનલૉક રિકવરી કી માંગે છે.',
  'device.setUp': 'સેટ કરો',
  'device.turnOff': 'બંધ કરો',
  'device.save': '{method} સેટ કરો',
  'keys.title': 'સુરક્ષા કી વડે અનલૉક કરો',
  'keys.description': 'એક USB કી જે તમે લગાવો છો: અંદર જવાનો બીજો રસ્તો, અને તે બ્રાઉઝર ફરી શરૂ થયા પછી પણ કામ કરે છે.',
  'keys.method': 'તમારી સુરક્ષા કી',
  'keys.on': { one: '{count} કી સેટ', other: '{count} કી સેટ' },
  'keys.off': 'કોઈ કી સેટ નથી',
  'keys.body':
    'કી લગાવો, તેનો PIN લખો અને તેને સ્પર્શ કરો, અને Passhold ખુલે છે – ફક્ત આ કમ્પ્યુટર પર. જેની પાસે કી હોય અને જે તેનો PIN જાણે તે અહીં Passhold ખોલી શકે, તેથી તેને ઘરની ચાવીની જેમ રાખો. ખોવાઈ જાય તો, તેને અહીંથી કાઢી નાખો: તમારા બીજા રસ્તા હજી કામ કરે છે.',
  'keys.add': 'કી ઉમેરો',
  'keys.save': 'આ કી ઉમેરો',
  'keys.one': 'સુરક્ષા કી',
  'keys.added': '{date} ના રોજ ઉમેરી',
  'keys.remove': 'કાઢો',
  'pin.title': 'PIN વડે અનલૉક કરો',
  'pinOffer.title': 'PIN વડે Passhold ઝડપથી ખોલો',
  'pinOffer.body':
    'દરેક વખતે Passhold લૉક થાય ત્યારે તમારા પાસવર્ડને બદલે થોડા અંક લખો, બ્રાઉઝર બંધ થાય ત્યાં સુધી. બ્રાઉઝર ફરી શરૂ થયા પછી, એકવાર તમારો પાસવર્ડ.',
  'pinOffer.later': 'તમે સેટિંગ્સમાં, સુરક્ષા હેઠળ, ગમે ત્યારે એક સેટ કરી શકો છો અથવા બંધ કરી શકો છો.',
  'pin.description': 'દિવસમાં ઘણી વાર Passhold લૉક થાય છે, જ્યારે તમે એ જ બ્રાઉઝર પર હો.',
  'pin.on': 'ચાલુ',
  'pin.off': 'બંધ',
  'pin.bodyRecovery':
    'ફક્ત ત્યાં સુધી કામ કરે છે જ્યાં સુધી બ્રાઉઝર ખુલ્લું રહે, અને ફક્ત પાંચ ખોટા પ્રયાસ સુધી: તે પછી, અથવા ફરી શરૂ થયા પછી, ઉપકરણ અથવા રિકવરી કી જોઈએ. PIN જે ખોલે છે તે ડિસ્ક પર રાખવામાં આવતું નથી.',
  'pin.body':
    'ફક્ત ત્યાં સુધી કામ કરે છે જ્યાં સુધી બ્રાઉઝર ખુલ્લું રહે, અને ફક્ત પાંચ ખોટા પ્રયાસ સુધી: તે પછી, અથવા ફરી શરૂ થયા પછી, મુખ્ય પાસવર્ડ જોઈએ. PIN જે ખોલે છે તે ડિસ્ક પર રાખવામાં આવતું નથી.',
  'pin.setUp': 'PIN સેટ કરો',
  'pin.change': 'બદલો',
  'pin.turnOff': 'બંધ કરો',
  'pin.new': 'PIN, 6 થી 12 અંક',
  'pin.again': 'ફરી લખો',
  'pin.save': 'PIN સાચવો',

  'general.description': 'વેબસાઇટ્સ પર Passhold કેવી રીતે વર્તે છે, અને તે કેવું દેખાય છે.',
  'general.filling': 'ભરવું અને સાચવવું',
  'general.appearance': 'ભાષા અને દેખાવ',
  'settings.autoSuggest': 'સાઇન ઇન, કાર્ડ અથવા સરનામાના ફીલ્ડ પર ક્લિક કરો ત્યારે સૂચનો બતાવો',
  'settings.autoSuggestBody':
    'સાઇટ માટેના તમારા લૉગિન, સાઇન-અપ ફોર્મ પર મજબૂત પાસવર્ડ, ચેકઆઉટ પર તમારા કાર્ડ અને સરનામાં. તમે પસંદ ન કરો ત્યાં સુધી કંઈ ભરાતું નથી.',

  'trash.description': 'લૉગિન, કાર્ડ, સરનામાં અને નોંધો તમે તેમને પાછા લાવો અથવા કાયમ માટે કાઢી નાખો ત્યાં સુધી અહીં રહે છે.',
  'trash.sharedDescription': 'પરિવાર સાથે શેર કર્યું: તેમાંનું કોઈ પણ આને પાછું લાવી શકે છે. કાયમ માટે કાઢી નાખેલું, તે બધા માટે જતું રહે છે.',
  'trash.sharedMember': 'પરિવાર સાથે શેર કર્યું: તમે આને પાછું લાવી શકો છો. ફક્ત પરિવારનો આયોજક તેને કાયમ માટે કાઢી નાખે છે.',
  'settings.autoLock': 'આ પછી લૉક કરો',
  'settings.autoLock.never': 'ફક્ત બ્રાઉઝર બંધ થાય ત્યારે',
  'settings.autoLock.minutes': { one: '{count} મિનિટ', other: '{count} મિનિટ' },
  'settings.autoLock.hours': { one: '{count} કલાક', other: '{count} કલાક' },
  'settings.lockWithSystem': 'કમ્પ્યુટર લૉક થાય અથવા સ્લીપમાં જાય ત્યારે લૉક કરો',
  'settings.clipboard': 'કૉપિ કરેલા પાસવર્ડ આ પછી સાફ કરો',
  'settings.clipboard.never': 'ક્યારેય નહીં',
  'settings.clipboard.seconds': { one: '{count} સેકન્ડ', other: '{count} સેકન્ડ' },
  'settings.clipboard.minutes': { one: '{count} મિનિટ', other: '{count} મિનિટ' },
  'settings.inlineButton': 'સાઇન ઇન, કાર્ડ અને સરનામાના ફીલ્ડમાં Passhold બટન બતાવો',
  'settings.offerToSave': 'તમે સાઇન ઇન કરો ત્યારે લૉગિન સાચવવાની ઑફર કરો',
  'settings.offerToSaveCards': 'તમે ચુકવણી કરો ત્યારે કાર્ડ અને સરનામાં સાચવવાની ઑફર કરો',
  'settings.offerToSaveCardsBody':
    'ફક્ત સુરક્ષિત (https) પેજ પરથી કાર્ડ, અને ફક્ત એવું જેનો નંબર સાચો હોય. તે છેલ્લા ચાર અંકથી બતાવવામાં આવે છે, ક્યારેય તેના નંબર કે કોડથી નહીં.',
  'settings.passkeys': 'પાસકી સાચવો અને વાપરો',
  'settings.passkeysBody':
    'જ્યારે કોઈ સાઇટ પાસકી ઑફર કરે, ત્યારે Passhold તેને તમારા લૉગિન સાથે રાખે છે અને તેની વડે તમને સાઇન ઇન કરે છે. બંધ હોય તો, પાસકી બ્રાઉઝરને છોડી દેવાય છે.',
  'settings.language': 'ભાષા',
  'settings.language.auto': 'બ્રાઉઝર જેવી',
  'settings.theme': 'દેખાવ',
  'settings.theme.system': 'સિસ્ટમ જેવો',
  'settings.theme.light': 'આછો',
  'settings.theme.dark': 'ઘેરો',

  'settings.security': 'મુખ્ય પાસવર્ડ',
  'settings.securityBody': 'તે બદલવાથી તમારા વૉલ્ટની ચાવી ફરી લૉક થાય છે; તમારા લૉગિન જેમ છે તેમ રહે છે.',
  'settings.current': 'હાલનો મુખ્ય પાસવર્ડ',
  'settings.new': 'નવો મુખ્ય પાસવર્ડ',
  'settings.confirm': 'નવો ફરી લખો',
  'settings.change': 'મુખ્ય પાસવર્ડ બદલો',
  'settings.changeOpen': 'બદલો',
  'settings.changed': 'મુખ્ય પાસવર્ડ બદલાયો.',

  'settings.backup': 'બેકઅપ',
  'settings.backupBody':
    'તમારો આખો વૉલ્ટ એક એન્ક્રિપ્ટેડ ફાઇલમાં. તેને આ કમ્પ્યુટર સિવાય બીજી જગ્યાએ રાખો – USB ડ્રાઇવ, તમારો ક્લાઉડ સ્ટોરેજ – જેથી આ બ્રાઉઝર ખોવાવાથી તમારા લૉગિન ન ખોવાય. તે ફક્ત તમે બનાવો ત્યારે રાખેલા મુખ્ય પાસવર્ડ સાથે ખુલે છે.',
  'settings.backupBodyRecovery':
    'તમારો આખો વૉલ્ટ એક એન્ક્રિપ્ટેડ ફાઇલમાં. તેને આ કમ્પ્યુટર સિવાય બીજી જગ્યાએ રાખો – USB ડ્રાઇવ, તમારો ક્લાઉડ સ્ટોરેજ – જેથી આ બ્રાઉઝર ખોવાવાથી તમારા લૉગિન ન ખોવાય. તે તમારી રિકવરી કી વડે ખુલે છે.',
  'settings.backupLast': 'છેલ્લો બેકઅપ: {date}',
  'settings.backupNever': 'હજી કોઈ બેકઅપ નથી.',
  'settings.backupButton': 'બેકઅપ ડાઉનલોડ કરો',
  'settings.backupDone': 'તમારા ડાઉનલોડમાં સાચવ્યું. હવે તેને આ કમ્પ્યુટર સિવાય બીજે ક્યાંક ખસેડો.',

  'settings.restoreBackup': 'બેકઅપમાંથી પુનઃસ્થાપિત કરો',
  'settings.restoreBodyNew':
    'આ બ્રાઉઝરમાં હજી કોઈ વૉલ્ટ નથી. બેકઅપ ફાઇલમાંથી તમારો પાછો લાવો – તે બેકઅપ બનાવતી વખતે વપરાયેલા મુખ્ય પાસવર્ડ વડે ખુલશે – અથવા ટૂલબારમાં Passhold બટન પરથી એક નવો બનાવો.',
  'settings.restoreBodyMerge':
    'બેકઅપમાં જે છે તે આ વૉલ્ટમાં ઉમેરે છે. અહીં કંઈ કાઢવામાં આવતું નથી: બંનેમાં એક જ લૉગિન હોય, તો નવી સંપાદન રાખવામાં આવે છે અને બીજો પાસવર્ડ તેના ઇતિહાસમાં જાય છે.',
  'settings.restoreChoose': 'બેકઅપ ફાઇલ પસંદ કરો',
  'settings.restoreMade': '{date} ના રોજ બનાવેલો બેકઅપ',
  'settings.restorePassword': 'બેકઅપનો મુખ્ય પાસવર્ડ',
  'settings.restoreRecoveryKey': 'બેકઅપની રિકવરી કી',
  'settings.restoreButton': 'પુનઃસ્થાપિત કરો',
  'settings.restoreNew': {
    one: 'વૉલ્ટ પુનઃસ્થાપિત થયો, {count} આઇટમ સાથે.',
    other: 'વૉલ્ટ પુનઃસ્થાપિત થયો, {count} આઇટમ સાથે.',
  },
  'settings.restoreAdded': {
    one: 'બેકઅપમાંથી {count} આઇટમ ઉમેરી.',
    other: 'બેકઅપમાંથી {count} આઇટમ ઉમેરી.',
  },
  'settings.restoreUpdated': {
    one: 'બેકઅપમાં {count} આઇટમની સંપાદન નવી હતી.',
    other: 'બેકઅપમાં {count} આઇટમની સંપાદન નવી હતી.',
  },
  'settings.restoreNothing': 'બેકઅપમાંની બધી વસ્તુઓ આ વૉલ્ટમાં પહેલેથી છે.',

  'settings.import': 'આયાત',
  'settings.importBody':
    'Chrome, Edge, Firefox, Safari, Apple Passwords, Bitwarden, 1Password, LastPass, KeePass, Dashlane, Proton Pass અથવા NordPass માંથી તમારા પાસવર્ડ લાવો: ત્યાં તેમને CSV ફાઇલ તરીકે નિકાસ કરો, પછી અહીં તે પસંદ કરો. ફાઇલમાંના કાર્ડ, સરનામાં અને નોંધો પણ આવે છે. Bitwarden માંથી JSON તરીકે નિકાસ કરો (એન્ક્રિપ્ટેડ નહીં): તેની CSV કાર્ડ, ઓળખ અને પાસકી છોડી દે છે. Dashlane તેમને પોતાની ફાઇલોમાં મૂકે છે: દરેક એક પછી એક પસંદ કરો.',
  'settings.importChoose': 'ફાઇલ પસંદ કરો',
  'settings.importFound': 'આયાત કરવા માટે મળ્યું: {what}.',
  'settings.importLogins': { one: '{count} લૉગિન', other: '{count} લૉગિન' },
  'settings.importPasskeys': { one: '{count} પાસકી', other: '{count} પાસકી' },
  'settings.importCards': { one: '{count} કાર્ડ', other: '{count} કાર્ડ' },
  'settings.importAddresses': { one: '{count} સરનામું', other: '{count} સરનામાં' },
  'settings.importNotes': { one: '{count} નોંધ', other: '{count} નોંધો' },
  'settings.importSkipped': {
    one: '{count} એન્ટ્રીમાં Passhold જે રાખે છે તે કંઈ નથી, અને તેને છોડી દેવાઈ છે.',
    other: '{count} એન્ટ્રીઓમાં Passhold જે રાખે છે તે કંઈ નથી, અને તેમને છોડી દેવાઈ છે.',
  },
  'settings.importDuplicates': { one: '{count} તમારા વૉલ્ટમાં પહેલેથી છે.', other: '{count} તમારા વૉલ્ટમાં પહેલેથી છે.' },
  'settings.importConfirm': 'આયાત કરો',
  'settings.importDone': '{what} આયાત થયું.',
  'settings.importDelete': 'હવે CSV ફાઇલ કાઢી નાખો: તેમાં તમારા પાસવર્ડ સાદા લખાણમાં છે.',
  'settings.importNothing': 'એ ફાઇલમાં આયાત કરવા જેવું નવું કંઈ નથી.',
  'settings.importTwoFactor': {
    one: 'આ ફાઇલમાંના {count} લૉગિનમાં બે-પગલાંનો (2FA) કોડ છે. Passhold 2FA કોડ રાખતું નથી: તમારો જૂનો પાસવર્ડ મેનેજર કાઢતા પહેલાં તેને ઓથેન્ટિકેટર એપમાં ખસેડો, નહીંતર તમે તે ખાતામાંથી બહાર રહી શકો છો.',
    other:
      'આ ફાઇલમાંના {count} લૉગિનમાં બે-પગલાંના (2FA) કોડ છે. Passhold 2FA કોડ રાખતું નથી: તમારો જૂનો પાસવર્ડ મેનેજર કાઢતા પહેલાં તેમને ઓથેન્ટિકેટર એપમાં ખસેડો, નહીંતર તમે તે ખાતાઓમાંથી બહાર રહી શકો છો.',
  },
  'settings.importAuthenticator': 'Keyrook Authenticator મેળવો',
  'settings.importPasskeysLeft': {
    one: 'આ ફાઇલમાંની {count} પાસકી Passhold સુધી પહોંચી શકતી નથી. તમે તે સાઇટ પર બીજી રીતે સાઇન ઇન કર્યું અને Passhold માં નવી પાસકી બનાવી ત્યાં સુધી તમારો જૂનો પાસવર્ડ મેનેજર રાખો.',
    other:
      'આ ફાઇલમાંની {count} પાસકી Passhold સુધી પહોંચી શકતી નથી. તમે તે સાઇટ્સ પર બીજી રીતે સાઇન ઇન કર્યું અને Passhold માં નવી પાસકી બનાવી ત્યાં સુધી તમારો જૂનો પાસવર્ડ મેનેજર રાખો.',
  },

  'settings.export': 'નિકાસ',
  'settings.exportBody':
    'એક CSV ફાઇલ જે દરેક બ્રાઉઝર અને પાસવર્ડ મેનેજર વાંચી શકે. તેમાં તમારા પાસવર્ડ સાદા લખાણમાં છે: તેને ફક્ત જરૂર હોય ત્યાં સુધી રાખો. તેમાં ફક્ત લૉગિન છે: પાસકી, કસ્ટમ ફીલ્ડ, ફોલ્ડર, કાર્ડ, સરનામાં અને નોંધો તેમાં નથી. બેકઅપમાં બધું હોય છે.',
  'settings.exportButton': 'CSV નિકાસ કરો',
  'settings.exportDone': 'નિકાસ થયું. પૂરું થાય એટલે ફાઇલ કાઢી નાખો.',

  'settings.neverSave': 'ક્યારેય સાચવવાની ઑફર ન કરો',
  'settings.neverSaveEmpty':
    'કોઈ સાઇટ નથી. જ્યારે Passhold સાચવવાની ઑફર કરે ત્યારે “આ સાઇટ માટે ક્યારેય નહીં” પસંદ કરો, અને તે અહીં દેખાશે.',
  'settings.remove': 'કાઢો',

  'settings.trash': 'ટ્રૅશ',
  'settings.trashEmpty': 'ટ્રૅશ ખાલી છે.',
  'settings.restore': 'પાછું લાવો',
  'settings.deleteForever': 'કાયમ માટે કાઢો',
  'settings.emptyTrash': 'ટ્રૅશ ખાલી કરો',
  'settings.emptyTrashConfirm': 'ટ્રૅશમાંનું બધું કાયમ માટે કાઢી નાખીએ?',

  'settings.danger': 'વૉલ્ટ કાઢો',
  'settings.dangerBody':
    'આ બ્રાઉઝરમાંથી વૉલ્ટ કાઢી નાખે છે. તેમાંનું દરેક લૉગિન કાયમ માટે જાય છે – જો તમારે તેમને રાખવા હોય તો પહેલાં બેકઅપ ડાઉનલોડ કરો.',
  'settings.dangerType': 'પુષ્ટિ માટે {word} લખો',
  'settings.dangerWord': 'કાઢી નાખો',
  'settings.dangerButton': 'વૉલ્ટ કાઢો',

  'settings.about': 'Passhold {version} · Keyrook દ્વારા',

  // Errors
  'error.noWorker': 'Passhold એ જવાબ આપ્યો નથી. આ બંધ કરીને ફરી પ્રયાસ કરો.',
  'error.wrongPassword': 'તે મુખ્ય પાસવર્ડ નથી.',
  'error.passwordTooShort': 'ઓછામાં ઓછા {min} અક્ષરો વાપરો.',
  'error.vaultCorrupt': 'આ ઉપકરણ પરનો વૉલ્ટ ખરાબ થયેલો છે અને ખોલી શકાતો નથી.',
  'error.vaultTooNew': 'આ વૉલ્ટ નવા Passhold વડે બનાવાયો હતો. તેને ખોલવા Passhold અપડેટ કરો.',
  'error.itemNotFound': 'તે હવે વૉલ્ટમાં નથી.',
  'error.familyOrganiserOnly': 'ફક્ત પરિવારનો આયોજક જ આ વૉલ્ટનો ટ્રૅશ ખાલી કરી શકે છે.',
  'error.familyGone': 'તે પરિવાર હવે અહીં નથી. સિંક કરો, પછી ફરી જુઓ.',
  'error.familyNotOpen': 'Passhold આ બ્રાઉઝર પર તે પરિવાર હજી ખોલી શકતું નથી. સિંક કરો, પછી ફરી પ્રયાસ કરો.',
  'error.itemInvalid': 'તે જેમ છે તેમ સાચવી શકાતું નથી.',
  'error.importEmpty': 'તે ફાઇલમાં આયાત કરવા માટે કંઈ નથી.',
  'error.importTooLarge': 'તે ફાઇલ આયાત કરવા માટે બહુ મોટી છે.',
  'error.importUnknownFormat': 'તે ફાઇલ પાસવર્ડ નિકાસ જેવી લાગતી નથી.',
  'error.importEncrypted':
    'તે Bitwarden નિકાસ એન્ક્રિપ્ટેડ છે, અને Passhold તેને ખોલી શકતું નથી. Bitwarden માં “.json (Encrypted)” નહીં પણ “.json” તરીકે ફરી નિકાસ કરો, પછી તે ફાઇલ પસંદ કરો.',
  'error.backupInvalid': 'તે Passhold બેકઅપ ફાઇલ નથી, અથવા તે ખરાબ થયેલી છે.',
  'error.backupWrongPassword': 'આ બેકઅપ જે મુખ્ય પાસવર્ડ વડે બનાવાયો હતો તે આ નથી.',
  'error.backupWrongRecoveryKey': 'આ બેકઅપ જે રિકવરી કી વડે બનાવાયો હતો તે આ નથી.',
  'error.noRecoveryKey': 'આ વૉલ્ટ બતાવવા માટે કોઈ રિકવરી કી નથી: તે મુખ્ય પાસવર્ડ વડે ખુલે છે.',
  'error.wrongRecoveryKey': 'તે રિકવરી કી નથી.',
  'error.deviceNeeded':
    'મુખ્ય પાસવર્ડ વગરનો વૉલ્ટ આ ઉપકરણના અનલૉક વડે ખુલે છે: તે પહેલાં સેટ કરો. મુખ્ય પાસવર્ડ સેટ થાય ત્યાં સુધી તે રહે છે.',
  'error.accountOffline': 'Keyrook સુધી પહોંચી શકાયું નથી. કનેક્શન તપાસો અને ફરી પ્રયાસ કરો.',
  'error.accountWrong':
    'ઈમેલ અથવા પાસવર્ડ ખોટો છે. Google અથવા GitHub વડે બનાવેલું ખાતું તેના બટન વડે સાઇન ઇન કરે છે.',
  'error.accountSignedOut': 'Keyrook એ આ બ્રાઉઝરને સાઇન આઉટ કર્યું. ફરી સાઇન ઇન કરો.',
  'error.accountBusy': {
    one: 'ઘણા પ્રયાસો. {count} સેકન્ડ રાહ જુઓ અને ફરી પ્રયાસ કરો.',
    other: 'ઘણા પ્રયાસો. {count} સેકન્ડ રાહ જુઓ અને ફરી પ્રયાસ કરો.',
  },
  'error.accountFailed': 'Keyrook હમણાં તે કરી શક્યું નહીં. પછીથી ફરી પ્રયાસ કરો.',
  'error.accountAlready': 'આ વૉલ્ટ પહેલેથી Keyrook ખાતામાં સાઇન ઇન છે.',
  'error.accountNone': 'આ વૉલ્ટ કોઈ Keyrook ખાતામાં સાઇન ઇન નથી.',
  'error.accountKdfRefused': 'Keyrook એ Passhold સ્વીકારે તેના કરતાં નબળી કી માંગી, તેથી સાઇન ઇન અટકાવવામાં આવ્યું.',
  'error.accountKeyWrong': 'તે પાસવર્ડ વડે ખાતાની કી ખૂલી નહીં.',
  'error.accountCode': 'તે કોડ બરાબર નથી, અથવા તેની મુદત પૂરી થઈ છે. ઈમેલ તપાસો, અથવા નવો માંગો.',
  'error.accountMail': 'Keyrook હમણાં ઈમેલ મોકલી શક્યું નહીં. એક મિનિટ પછી ફરી પ્રયાસ કરો.',
  'error.providerDenied': 'સાઇન ઇન રદ થયું.',
  'error.providerFailed': 'Google અથવા GitHub હમણાં તમને સાઇન ઇન કરી શક્યા નહીં. ફરી પ્રયાસ કરો.',
  'error.providerExpired': 'તે સાઇન ઇન સમાપ્ત થયું છે. ફરીથી શરૂ કરો.',
  'error.providerNotOwner':
    'આ તે ખાતું નથી જેની સાથે આ Keyrook ખાતું સાઇન ઇન થાય છે. Keyrook માટે વાપરો છો તેની સાથે ફરી સાઇન ઇન કરો.',
  'error.signOutUnsent': {
    one: 'એક આઇટમ હજી તમારા Keyrook ખાતા સુધી પહોંચી નથી, તેથી કંઈ કાઢવામાં આવ્યું નથી. તમારું કનેક્શન તપાસો, અથવા ફરી સાઇન ઇન કરો, પછી સાઇન આઉટ કરો.',
    other:
      '{count} આઇટમ હજી તમારા Keyrook ખાતા સુધી પહોંચી નથી, તેથી કંઈ કાઢવામાં આવ્યું નથી. તમારું કનેક્શન તપાસો, અથવા ફરી સાઇન ઇન કરો, પછી સાઇન આઉટ કરો.',
  },
  'error.providerOtherProvider':
    'આ ઈમેલ પર પહેલેથી Keyrook ખાતું છે જે Google અને GitHub માંથી બીજા વડે સાઇન ઇન કરે છે. તે વડે સાઇન ઇન કરો.',
  'error.providerHasPassword':
    'આ ઈમેલ પર પહેલેથી પાસવર્ડ સાથેનું Keyrook ખાતું છે. અહીં તમારા ઈમેલ અને પાસવર્ડ વડે સાઇન ઇન કરો – અથવા, Google અથવા GitHub વડે પણ સાઇન ઇન કરવા, તેને account.keyrook.com પર ઉમેરો, ત્યાં તમારા પાસવર્ડ વડે સાઇન ઇન કરીને.',
  'error.providerEmailTaken':
    'આ ઈમેલ પર પહેલેથી Keyrook ખાતું છે જે બીજી રીતે સાઇન ઇન કરે છે. તે રીતે સાઇન ઇન કરો – અથવા account.keyrook.com પર આને તેમાં ઉમેરો, ત્યાં તે અત્યારે જે રીતે સાઇન ઇન કરે છે તે રીતે સાઇન ઇન કરીને.',
  'error.pairingWrongKey':
    'જે પાછું આવ્યું તે આ ખાતાની કી નથી, તેથી તે નકારવામાં આવ્યું. ફરી પૂછો, અને ફક્ત તમે ઓળખતા બ્રાઉઝર પરથી જ અંદર આવવા દો.',
  'error.pairingRefused': 'તે તે બ્રાઉઝર પરથી આવ્યું નથી જેનો કોડ તમે તપાસ્યો, તેથી તે નકારવામાં આવ્યું. ફરી પૂછો.',
  'error.pairingEnded': 'તે વિનંતી સમાપ્ત થઈ છે. નવા બ્રાઉઝર પરથી ફરી પૂછો.',
  'error.passkeyWrong': 'તે પાસકી આ ખાતું ખોલતી નથી. અંદર જવાનો બીજો રસ્તો અજમાવો.',
  'error.joinExpired': 'તે સાઇન ઇન ઘણો સમય રાહ જોતું રહ્યું. ફરી સાઇન ઇન કરો.',
  'error.accountPasswordWrong': 'તે ખાતા પાસવર્ડ નથી.',
  'error.accountNoKit': 'Passhold પાસે આ ખાતાની રિકવરી કી નથી.',
  'error.accountKitRace': 'બીજી એપે હમણાં ખાતાની રિકવરી કી બદલી. સિંક કરો, પછી ફરી પ્રયાસ કરો.',
  'error.accountKitShape': 'તે ખાતાની રિકવરી કી જેવું લાગતું નથી: તેમાં 32 અક્ષરો અને અંક છે.',
  'error.accountKitWrong': 'તે રિકવરી કી આ ઈમેલ સરનામાવાળા ખાતા સાથે મેળ ખાતી નથી.',
  'error.accountKitNotThis': 'તે આ ખાતાની રિકવરી કી નથી. તમે સાચવેલું ફરી જુઓ.',
  'error.accountPasswordWeak':
    'ખાતા માટે અનુમાન કરવામાં બહુ સહેલો: અક્ષરો, અંકો અને ચિહ્નોના મિશ્રણ સાથે લાંબો પાસવર્ડ વાપરો, અથવા ચાર-પાંચ અસંબંધિત શબ્દો.',
  'error.accountBoxWrong':
    'આ ખાતામાં Passhold ની કી ખૂલી નહીં. ફરી સાઇન ઇન કરો; તો પણ ન ચાલે તો, ખાતું ફરીથી શરૂ કરો.',
  'error.accountCodeWait': {
    one: 'થોડી વાર પહેલાં એક કોડ મોકલાયો હતો. {count} સેકન્ડમાં બીજો માંગી શકો છો.',
    other: 'થોડી વાર પહેલાં એક કોડ મોકલાયો હતો. {count} સેકન્ડમાં બીજો માંગી શકો છો.',
  },
  'error.accountSignUpKeys':
    'Keyrook એ Passhold ની પોતાની કી માંગી, અને કોઈ મોકલાઈ નહીં. Passhold અપડેટ કરો અને ફરી પ્રયાસ કરો.',
  'error.accountIdTaken': 'ખાતું હમણાં બની શક્યું નહીં. નવો કોડ માંગો અને ફરી પ્રયાસ કરો.',
  'error.accountNoRoot': 'આ ખાતા પાસે હજી એવી કી નથી જે રિકવરી કી ખોલે. તેના પાસવર્ડ વડે ફરી સાઇન ઇન કરો.',
  'error.accountRootNotHeld':
    'આ કમ્પ્યુટર બતાવી શક્યું નહીં કે તેની પાસે ખાતાની કી છે. પાસવર્ડ અથવા રિકવરી કી વડે ફરી સાઇન ઇન કરો.',
  'error.accountRootChanged':
    'આ ખાતાની કીઓ બીજા કમ્પ્યુટર પર બદલાઈ. Passhold હજી સાઇન ઇન હોય તેવા કમ્પ્યુટર પર સાઇન ઇન કરો, અથવા ખાતું ફરીથી શરૂ કરો.',
  'error.accountKeyReplaced': 'આ ખાતામાં Passhold ની કી બીજા કમ્પ્યુટર પર બદલાઈ. ફરી સાઇન ઇન કરો.',
  'error.accountSessionStolen': 'આ કમ્પ્યુટર સાઇન આઉટ થયું, કારણ કે તેનું સત્ર બીજેથી વપરાયું. ફરી સાઇન ઇન કરો.',
  'error.accountOld':
    'આ ખાતું Google અથવા GitHub વડે બનાવાયું હતું, દરેક Keyrook એપ પાસે પોતાની કી હતી તે પહેલાં, અને તેમાંનું કંઈ Passhold ખોલતું નથી. તેને એક આપવા માટે તેની ઈમેલ વડે ખાતું ફરીથી શરૂ કરો.',
  'error.pairingBusy': 'આ ખાતામાં જોડાવા માટે ઘણા બ્રાઉઝર રાહ જુએ છે. થોડી મિનિટોમાં ફરી પ્રયાસ કરો.',
  'error.startOverExpired': 'તેની મુદત પૂરી થઈ છે. નવો કોડ માંગો અને ફરીથી શરૂ કરો.',
  'error.startOverTooOften': 'આ ખાતું તાજેતરમાં ઘણી વાર ફરીથી શરૂ થયું છે. {day} પછી ફરી પ્રયાસ કરો.',
  'error.startOverWaiting': 'આ ખાતું {day} ના રોજ ફરીથી શરૂ થાય છે. તેમાં હજી સાઇન ઇન રહેલું બ્રાઉઝર તે રદ કરી શકે છે.',
  'error.startOverUpdate': 'Keyrook હવે ખાતું ફરીથી શરૂ કરતાં પહેલાં એક અઠવાડિયું રાહ જુએ છે. તે માંગવા Passhold અપડેટ કરો.',
  'error.passkeyFailed': 'તે પાસકી તપાસી શકાઈ નહીં. ફરી પ્રયાસ કરો.',
  'error.passkeyNotYou': 'તે પાસકીએ પુષ્ટિ કરી નહીં કે તમે જ છો. ફરી પ્રયાસ કરો, અને તે માંગે તે રીતે તેને અનલૉક કરો.',
  'error.passkeyUnknown':
    'તે પાસકી કોઈ Keyrook ખાતા પર નથી. તે દૂર કરાઈ હોઈ શકે: પાસવર્ડ વડે, અથવા Google અથવા GitHub વડે સાઇન ઇન કરો.',
  'error.passkeyExpired': 'તે પાસકી વિનંતી સમાપ્ત થઈ છે. ફરી પ્રયાસ કરો.',
  'error.passkeyNotOffered': 'Keyrook અહીં હજી પાસકી ઑફર કરતું નથી.',
  'error.passkeyNoUnlock':
    'તે પાસકી સાઇન ઇન કરે છે, પણ હજી તમારું ખાતું અનલૉક કરવા માટે સેટ નથી. account.keyrook.com પર, “Passkeys” હેઠળ, તેની બાજુમાં “Let it unlock” પસંદ કરો, પછી ફરી પ્રયાસ કરો. અથવા પાસવર્ડ વડે, અથવા Google અથવા GitHub વડે સાઇન ઇન કરો.',
  'error.passkeyNoPrf':
    'તે પાસકી account.keyrook.com પર સાઇન ઇન કરે છે, પણ જ્યાં તે સચવાયેલી છે ત્યાંથી તે તમારું ખાતું અનલૉક કરી શકતી નથી – macOS 15 પહેલાંનો iCloud Keychain, ઉદાહરણ તરીકે, કરી શકતો નથી. account.keyrook.com પર, “Passkeys” હેઠળ, જ્યાં તે કરી શકે ત્યાં સચવાયેલી એક ઉમેરો, જેમ કે સુરક્ષા કી, અને ખાતરી કરો કે તે “Unlocks your data” કહે છે. ત્યાં સુધી, પાસવર્ડ વડે, અથવા Google અથવા GitHub વડે સાઇન ઇન કરો.',
  'error.passkeyPermission':
    'Passhold ને account.keyrook.com ની પાસકી વાપરવા માટે Chrome ની પરવાનગી જોઈએ. પાસકી ફરી પસંદ કરો અને તેની પરવાનગી આપો.',
  'error.passkeyPermissionEdge':
    'Passhold ને account.keyrook.com ની પાસકી વાપરવા માટે Edge ની પરવાનગી જોઈએ. પાસકી ફરી પસંદ કરો અને તેની પરવાનગી આપો.',
  'error.passkeyCancelled': 'કોઈ પાસકી વપરાઈ નથી. ફરી પ્રયાસ કરો, અથવા બીજી રીતે સાઇન ઇન કરો.',
  'error.secondStepNeeded': 'તમારું ખાતું બીજું પગલું માંગે છે: તમારી ઓથેન્ટિકેટર એપનો કોડ પણ દાખલ કરો.',
  'error.secondStepWrong':
    'તે કોડ બરાબર નથી. તમારી ઓથેન્ટિકેટર એપ હમણાં બતાવે છે તે, અથવા તમારી રિકવરી કી દાખલ કરો.',
  'error.signInExpired': 'તે સાઇન ઇનની મુદત પૂરી થઈ છે. ફરી સાઇન ઇન કરો.',
  'error.secondStepUpdate': 'તમારું ખાતું સાઇન ઇન માટે બીજું પગલું માંગે છે. સાઇન ઇન કરવા Passhold અપડેટ કરો.',
  'error.secondStepAsked': 'તમારું ખાતું બીજું પગલું માંગે છે: તમારી ઓથેન્ટિકેટર એપનો કોડ દાખલ કરો.',
  'error.secondStepTaken':
    'તે કોડ વડે તમે સાઇન ઇન કર્યું હતું, અને દરેક કોડ ફક્ત એક જ વાર કામ કરે છે. તમારી ઓથેન્ટિકેટર એપ નવો બતાવે ત્યાં સુધી રાહ જુઓ.',
  'error.kitDraftGone': 'તે નવી રિકવરી કી સમયસર સેટ થઈ નહીં, અને કંઈ બદલાયું નથી. ફરી નવી બનાવો.',
  'error.archiveWrong': 'તે જે સાચવેલું હતું તે ખોલતું નથી.',
  'error.archiveGone': 'તે હવે સચવાયેલું નથી.',
  'error.archiveDeleteRefused': 'મુદત પૂરી થતાં પહેલાં જે સાચવેલું હતું તે ફક્ત જૂનો પાસવર્ડ અથવા જૂની રિકવરી કી કાઢી શકે છે.',
  'error.accountNeedsRoot':
    'આ ખાતું Keyrook Authenticator માં બનાવાયું હતું, દરેક Keyrook એપ પાસે પોતાની કી હતી તે પહેલાં. Passhold હવે તેને એક આપી શકે છે; Authenticator માં કંઈ બદલાતું નથી.',
  'error.accountServerWrong':
    'Keyrook ના સર્વરે એવા કોઈ જવાબ સાથે જવાબ આપ્યો જેની સાથે આ ખાતાની કીઓ મેળ ખાતી નથી, તેથી Passhold અટક્યું. પછીથી ફરી પ્રયાસ કરો.',
  'error.startOverNeedsPassword': 'આ ખાતામાં પાસવર્ડ છે: તેને ફરીથી શરૂ કરવા નવો પસંદ કરો.',
  'error.pinInvalid': 'PIN 6 થી 12 અંકનો છે.',
  'error.wrongPin': 'તે PIN નથી.',
  'error.wrongPinLeft': {
    one: 'તે PIN નથી. {count} પ્રયાસ બાકી.',
    other: 'તે PIN નથી. {count} પ્રયાસ બાકી.',
  },
  'error.pinLockedOut': 'ઘણા ખોટા PIN. બીજી રીતે અનલૉક કરો; તે પછી PIN ફરી કામ કરે છે.',
  'error.pinUnavailable':
    'PIN ફક્ત ત્યાં સુધી કામ કરે છે જ્યાં સુધી બ્રાઉઝર ખુલ્લું રહે. બીજી રીતે અનલૉક કરો; તે પછી PIN ફરી કામ કરે છે.',
  'error.deviceGone': 'આ ઉપકરણ વડે અનલૉક કરવું હવે સેટ નથી. બીજી રીતે અનલૉક કરો.',
  'error.deviceKeyWrong': 'તે Passhold ખોલ્યું નહીં. બીજી રીતે અનલૉક કરો, પછી ઉપકરણ અનલૉક ફરી સેટ કરો.',
  'error.deviceUnsupported':
    'તે પાસકી જ્યાં સચવાઈ હતી તે જગ્યા Passhold ને ખોલવા માટે કી આપી શકતી નથી. ફરી પ્રયાસ કરો અને Google પાસવર્ડ મેનેજરમાં સાચવો – અથવા PIN વાપરો.',
  'error.deviceUnsupportedEdge':
    'તે પાસકી જ્યાં સચવાઈ હતી તે જગ્યા Passhold ને ખોલવા માટે કી આપી શકતી નથી. ફરી પ્રયાસ કરો અને બીજે ક્યાંક સાચવો – અથવા PIN વાપરો.',
  'error.deviceCancelled': 'કંઈ અનલૉક થયું નથી: તે રદ થયું અથવા ઘણો સમય લીધો.',
  'error.keyUnsupported':
    'આ કી Passhold ને ખોલવા માટે જે જોઈએ તે આપી શકતી નથી. મોટાભાગની FIDO2 કી આપી શકે છે; ફક્ત બે-પગલાંના સાઇન ઇન (U2F) માટે બનાવેલી કી આપી શકતી નથી.',
  'error.keyAlreadyAdded': 'તે કી અહીં પહેલેથી સેટ છે.',
  'error.keyGone': 'તે સુરક્ષા કી હવે અહીં સેટ નથી. બીજી રીતે અનલૉક કરો.',
  'error.keyWrong': 'તે કીએ Passhold ખોલ્યું નહીં. બીજી રીતે અનલૉક કરો, પછી કી કાઢીને ફરી ઉમેરો.',
  'error.kdfUnsupported': 'વૉલ્ટની સેટિંગ્સ Passhold સ્વીકારે તેવી નથી.',
  'error.locked': 'Passhold લૉક છે.',
  'error.noVault': 'હજી કોઈ વૉલ્ટ નથી.',
  'error.vaultExists': 'વૉલ્ટ પહેલેથી છે.',
  'error.notOnPage': 'તે લૉગિન આ ટૅબના પેજ માટે નથી.',
  'error.expired': 'તેની મુદત પૂરી થઈ છે. ફરી પ્રયાસ કરો.',
  'error.noFields': 'આ પેજ પર Passhold ભરી શકે તેવું કંઈ નથી.',
  'error.cardInsecure': 'Passhold કાર્ડ ફક્ત સુરક્ષિત (https) પેજ પર ભરે છે.',
  'error.unknown': 'કંઈક ખોટું થયું: {detail}',
};
