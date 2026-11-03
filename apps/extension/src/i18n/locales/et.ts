import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'Keyrooki poolt',

  // Common
  'common.cancel': 'Tühista',
  'common.close': 'Sulge',
  'common.save': 'Salvesta',
  'common.edit': 'Muuda',
  'common.back': 'Tagasi',
  'common.show': 'Näita',
  'common.hide': 'Peida',
  'common.notNow': 'Mitte praegu',

  // Setup
  'setup.title': 'Loo oma hoidla',
  'setup.body':
    'Passhold hoiab sinu paroole krüpteerituna sellel seadmel. Üks pearoolisõna avab need – vali selline, mida mäletad ja mida ei kasuta mujal.',
  'setup.password': 'Pearoolisõna',
  'setup.confirm': 'Sisesta see uuesti',
  'setup.mismatch': 'Need kaks parooli ei ole samad.',
  'setup.tooShort': 'Kasuta vähemalt {min} märki.',
  'setup.understand':
    'Ma saan aru, et keegi – ei Passhold ega Keyrook – ei saa mu hoidlat taastada, kui ma selle parooli unustan.',
  'setup.create': 'Loo hoidla',
  'setup.creating': 'Loon…',
  'setup.restore': 'Taasta varukoopiast',

  // Strength
  'setup.deviceBody':
    'Passhold hoiab sinu paroole krüpteerituna sellel seadmel ja {method} avab need – pearoolisõna pole vaja välja mõelda ega meelde jätta. Saad ka taastevõtme päevaks, mil {method} enam ei tööta.',
  'setup.deviceWhereMac': 'Kui Chrome küsib, kuhu pääsuvõti salvestada, vali Google Password Manager.',
  'setup.deviceWhereMacEdge':
    'Kui Edge küsib, kuhu pääsuvõti salvestada, vali koht, mis hoiab seda ka sinu teistes seadmetes. Mitte iga koht ei saa Passholdi lahti lukustada: kui see ei saa, ütleb Passhold seda.',
  'setup.createWithDevice': 'Loo kasutades {method}',
  'setup.usePassword': 'Kasuta selle asemel pearoolisõna',
  'setup.useDevice': 'Kasuta selle asemel {method}',
  'setup.signIn': 'Logi sisse või loo Keyrooki konto',

  'welcome.title': 'Sinu paroolid igas arvutis',
  'welcome.body':
    'Logi sisse üks kord. Passhold avaneb sinu sõrmejäljega, täidab väljad sinu eest ja sinu sisselogimised on seal, kus sa sisse logid.',
  'welcome.email': 'Kasuta e-posti aadressi',
  'gate.touchTitle': 'Ava ühe puudutusega',
  'gate.touchBody': 'Touch ID või Windows Hello avab Passholdi. Pole vaja pearoolisõna välja mõelda ega meelde jätta.',
  'gate.everywhereTitle': 'Igas arvutis, mida kasutad',
  'gate.everywhereBody': 'Logi sisse teises arvutis ja su paroolid ning pääsuvõtmed on seal.',
  'gate.privateTitle': 'Ainult sina saad need lugeda',
  'gate.privateBody':
    'Krüpteeritud sellel arvutil enne, kui midagi saadetakse. Keyrook ei saa lugeda su paroole ega seda, mis veebisaidi jaoks need on.',
  'welcome.note':
    'Esmalt krüpteeritud sellel arvutil: Keyrook ei saa lugeda su paroole ega seda, mis veebisaidi jaoks need on.',
  'connect.title': 'Lülita sisse oma Keyrooki konto',
  'connect.body': 'Sinu sisselogimised igas arvutis, mida kasutad – ja tagasi, kui see kaob.',
  'connect.email': 'E-post',
  'kitCheck.title': 'Kontrolli oma konto taastevõtit',
  'kitCheck.body': 'Sisesta see üks kord, et teaksid, et sul see veel on, enne kui seda vaja läheb.',
  'accountPasskey.button': 'Jätka pääsuvõtmega',
  'accountPasskey.working': 'Ootan pääsuvõtit…',
  'accountPasskey.hint':
    'Üks, mille lisasid lehel account.keyrook.com. Esimesel korral küsib {browser}, kas lubada Passholdil seda kasutada.',
  'accountPasskey.openPasskeys': 'Ava „Passkeys“ lehel account.keyrook.com',
  'join.title': 'Logi Keyrooki sisse',
  'join.body': 'Üks Keyrooki konto Passholdi ja Keyrook Authenticatori jaoks. Sinu sisselogimised tulevad sellesse brauserisse kontolt.',
  'join.createTitle': 'Loo Keyrooki konto',
  'join.createBody':
    'Üks konto Passholdi ja Keyrook Authenticatori jaoks: sinu sisselogimised, krüpteeritud esmalt sellel seadmel, igas arvutis, kuhu sisse logid.',
  'join.lockTitle': 'Sisse logitud kui {email}',
  'join.lockBodyDevice': 'Viimane samm: Passhold avaneb sellel arvutil {method} abil. Sinu sisselogimised tulevad alla kohe, kui see on seadistatud.',
  'join.cancel': 'Kasuta teist kontot',
  'join.lockBodyCode': 'Viimane samm: kood, mis avab Passholdi sellel arvutil. Sinu sisselogimised tulevad alla kohe, kui see on seadistatud.',
  'join.opening': 'Passhold avaneb…',
  'setup.useAccountPassword': 'Kasuta selle asemel minu konto parooli',
  'setup.useCode': 'Kasuta selle asemel koodi sellele arvutile',
  'security.accountPasswordTitle': 'Avaneb sinu Keyrooki konto parooliga',
  'security.accountPasswordBody': 'Üks parool mõlema jaoks. Kui see muutub, järgib siinne Passhold seda järgmisel sisselogimisel.',

  'recovery.title': 'Salvesta oma taastevõti',
  'recovery.body':
    'Kui see seade kaob või selle avamine lakkab töötamast, on see võti tagasitee sinu hoidlasse ja selle varukoopiatesse. Saad selle uuesti vaadata Seadetes, kui Passhold veel avaneb – hoia seda seetõttu ka mujal: trükituna, telefonis või failis, mis ei asu sellel arvutil.',
  'recovery.download': 'Laadi alla',
  'recovery.copy': 'Kopeeri',
  'recovery.copied': 'Kopeeritud',
  'recovery.print': 'Prindi',
  'recovery.qr': 'Näita QR-koodi',
  'recovery.qrHide': 'Peida QR-kood',
  'recovery.qrLabel': 'Taastevõti QR-koodina',
  'recovery.qrHint': 'Suuna telefoni kaamera sellele ja salvesta tekst märkmesse või tee sellest foto.',
  'recovery.show': 'Näita',

  'kit.title': 'Passholdi taastekomplekt',
  'kit.made': 'Tehtud {date}',
  'kit.keyLabel': 'Taastevõti',
  'kit.whenTitle': 'Kui Passhold ei avane',
  'kit.sameDevice': 'Sellel arvutil: kui Passhold küsib lukust avamist, vali „Kasuta selle asemel taastevõtit“ ja sisesta võti.',
  'kit.newDevice':
    'Uues arvutis: installi Passhold, vali „Taasta varukoopiast“, vali oma uusim varukoopiafail ja sisesta võti. Ilma varukoopiata pole midagi taastada, seega tee üks.',
  'kit.keep': 'Hoia see leht turvaliselt, eemal oma arvutist. Igaüks, kellel on see ja koopia sinu hoidlast, saab hoidla avada.',
  'recovery.fileTitle': 'Passholdi taastevõti',
  'recovery.fileMade': 'Tehtud {date}',
  'recovery.fileBody':
    'See võti avab sinu Passholdi hoidla ja selle varukoopiad, kui su seade ei suuda. Igaüks, kellel on see ja koopia sinu hoidlast, saab selle avada, seega hoia seda turvaliselt ja mitte samal arvutil.',
  'recovery.pending': 'Taastevõtit pole veel alles hoitud',
  'recovery.keptState': 'Taastevõti on alles hoitud',
  'recovery.rowBody':
    'Avab sinu hoidla ja selle varukoopiad, kui {method} ei suuda. Uus peatab vana avamise sellel hoidlal; enne tehtud varukoopiad avanevad endiselt vanaga.',
  'recovery.makeNew': 'Tee uus',
  'recovery.savedIt': 'Olen selle salvestanud',
  'recovery.checkTitle': 'Kontrolli, et salvestasid selle',
  'recovery.checkBody':
    'Sisesta kaks rühma võtmest selle järgi, mille salvestasid – fail, paber või foto. Rühmad on neljast märgist koosnevad plokid kriipsude vahel, vasakult loetuna.',
  'recovery.group': 'Rühm {position}',
  'recovery.check': 'Kontrolli',
  'recovery.checkWrong': 'See ei ole sinu võtme sisu. Vaata uuesti, mida salvestasid, või näita võtit uuesti ja salvesta see nüüd.',
  'recovery.showAgain': 'Näita võtit uuesti',
  'recovery.covered': 'Sinu Keyrooki konto on tagasitee',
  'recovery.coveredBody':
    'Kui {method} lakkab Passholdi siin avamast, eemalda hoidla ja logi oma kontole uuesti sisse: iga sisselogimine tuleb tagasi. Selle hoidla enda taastevõti on siiski siin nähtav.',

  'proof.recoveryKey': 'Taastevõti',
  'proof.withDevice': 'Kinnitad {method} abil.',
  'proof.useDevice': 'Kinnita selle asemel {method} abil',
  'proof.usePassword': 'Sisesta selle asemel pearoolisõna',
  'proof.useAccountPassword': 'Sisesta selle asemel konto parool',
  'proof.useCode': 'Sisesta selle asemel kood',
  'proof.useRecoveryKey': 'Sisesta selle asemel taastevõti',
  'strength.0': 'Väga nõrk',
  'strength.1': 'Nõrk',
  'strength.2': 'Keskmine',
  'strength.3': 'Tugev',
  'strength.4': 'Väga tugev',
  'strength.short': 'Pikem on tugevam: püüa vähemalt 14 märki.',
  'strength.digitsOnly': 'Ainult numbreid on kerge arvata.',
  'strength.repeats': 'Väldi sama märgi kordamist.',

  // Unlock
  'unlock.title': 'Passhold on lukus',
  'unlock.body': 'Sisesta oma pearoolisõna.',
  'unlock.password': 'Pearoolisõna',
  'unlock.submit': 'Ava',
  'unlock.pinBody': 'Sisesta oma PIN.',
  'unlock.pin': 'PIN',
  'unlock.usePassword': 'Kasuta selle asemel pearoolisõna',
  'unlock.usePin': 'Kasuta selle asemel PIN-i',
  'unlock.recoveryBody': 'Sisesta oma taastevõti.',
  'unlock.deviceBody': 'Kasuta {method}, või sisesta allpool.',
  'unlock.recoveryKey': 'Taastevõti',
  'unlock.useRecoveryKey': 'Kasuta selle asemel taastevõtit',
  'unlock.lost': 'Ei pääse sisse?',
  'unlock.forgotBodyRecovery':
    'Su taastevõti avab hoidla, kui seade ei suuda. Ilma selleta ja ilma seadmeta ei saa keegi – ei Passhold ega Keyrook – hoidlat avada: saad selle ainult Seadetes eemaldada ja otsast alustada.',
  'unlock.bodyAccount': 'Sisesta oma Keyrooki konto parool.',
  'unlock.accountPassword': 'Keyrooki konto parool',
  'unlock.useAccountPassword': 'Kasuta selle asemel konto parooli',
  'unlock.forgotBodyAccount':
    'See on sinu Keyrooki konto parool: kui see muudeti mujal, kasuta uut. Unustasid lõplikult? Eemalda see hoidla Seadetes ja logi uuesti sisse – taastevõtmega, kui vajad uut parooli – ja iga sisselogimine tuleb tagasi.',
  'unlock.bodyCode': 'Sisesta kood, mis avab Passholdi sellel arvutil.',
  'unlock.code': 'Kood sellele arvutile',
  'unlock.useCode': 'Kasuta selle asemel koodi',
  'unlock.forgotBodyCode':
    'Eemalda see hoidla Seadetes ja logi uuesti sisse Google’i või GitHubiga: iga sisselogimine tuleb tagasi sinu kontolt.',
  'unlock.device': 'Ava {method} abil',
  'unlock.key': 'Ava turvavõtmega',
  'unlock.keyBody': 'Ühenda oma turvavõti või sisesta allpool.',
  'unlock.or': 'või',
  'unlock.unlocking': 'Avan…',
  'unlock.forgot': 'Unustasid?',
  'unlock.forgotBody':
    'Sinu pearoolisõna on selle hoidla ainus võti, ja seda ei salvestata kuskile. Ilma selleta ei saa hoidlat avada – saad selle ainult Seadetes eemaldada ja otsast alustada.',

  // Vault
  'vault.search': 'Otsi',
  'vault.lock': 'Lukusta',
  'vault.settings': 'Seaded',
  'vault.add': 'Uus sisselogimine',
  'vault.onThisPage': 'Saidil {site}',
  'vault.all': 'Kõik sisselogimised',
  'vault.empty': 'Sisselogimisi pole veel',
  'vault.emptyBody':
    'Logi saidile sisse ja Passhold pakub selle salvestamist – või lisa siin üks või impordi oma brauserist.',
  'vault.import': 'Impordi paroolid',
  'vault.noResults': 'Miski ei vasta otsingule „{query}“.',
  'vault.fill': 'Täida',
  'vault.copyUsername': 'Kopeeri kasutajanimi',
  'vault.copyPassword': 'Kopeeri parool',
  'vault.noUsername': 'Kasutajanimi puudub',
  'vault.count': { one: '{count} kirje', other: '{count} kirjet' },
  'vault.everything': 'Kõik kirjed',

  // Asking for a rating, once, after real use
  'rating.title': 'Kas Passhold on kasulik?',
  'rating.body': 'Hinnang poes aitab teistel seda leida.',
  'rating.rate': 'Hinda seda',
  'rating.later': 'Mitte praegu',

  // What a list shows, and what can be added
  'kinds.label': 'Näita',
  'kinds.all': 'Kõik',
  'kinds.logins': 'Sisselogimised',
  'kinds.cards': 'Kaardid',
  'kinds.addresses': 'Aadressid',
  'kinds.notes': 'Märkmed',
  'kinds.noLogins': 'Sisselogimisi pole veel.',
  'kinds.noCards':
    'Kaarte pole veel. Lisa üks ülal oleva + abil ja Passhold täidab selle makse ajal, kui sa selle valid.',
  'kinds.noAddresses':
    'Aadresse pole veel. Lisa üks ülal oleva + abil ja Passhold täidab selle seal, kus vorm seda küsib.',
  'kinds.noNotes':
    'Märkmeid pole veel. Märkmes hoitakse kõike, mis pole sisselogimine – Wi-Fi parool, litsentsivõti – krüpteerituna koos kõige muuga.',
  'add.menu': 'Lisa',
  'add.login': 'Sisselogimine',
  'add.card': 'Kaart',
  'add.address': 'Aadress',
  'add.note': 'Märkus',
  'place.label': 'Hoidlad',
  'place.mine': 'Minu',
  'place.of': '{vault}, jagatud perega {family}',
  'move.to': 'Teisalda hoidlasse {vault}',
  'move.confirm':
    'Kõik perest {family} näevad seda hoidlas {vault} ja saavad seda muuta. See lahkub sinu oma hoidlast; selle varasemad paroolid jäävad maha.',
  'move.do': 'Teisalda',
  'family.unlockTitle': 'Ava {family} jagatud hoidla selles brauseris',
  'family.unlockBody':
    'Passhold vajab sinu Keyrooki konto parooli korra, et viia sinu võti selles brauseris perele. Seda ei saadeta kuhugi.',
  'family.unlockOnPage': 'Ava leheküljel account.keyrook.com „Family“ leht ja anna sinu perevõti seal Passholdile.',
  'family.password': 'Keyrooki konto parool',
  'family.unlock': 'Ava',
  'family.openPage': 'Ava perelehekülg',
  'family.keyChanged': '{who} võti perel {family} on muutunud',
  'family.newSender': '{family} võti tuli kasutajalt {who}, keda see brauser veel ei tunne',
  'family.keyChangedBody':
    'Passhold ei võta sealt midagi enne, kui te kaks võrdlete koodi. Helista või kohtu temaga: ta valib koodide võrdlemise sinu nime kõrval lehel „Family“ aadressil account.keyrook.com.',
  'family.showCode': 'Näita koodi',
  'family.codeIs': 'Sinu kood',
  'family.match': 'Koodid klapivad',
  'family.differ': 'Need erinevad',
  'family.differed': 'Siis ära usalda. Ütle oma perekonna korraldajale; Passhold ei võta vahepeal temalt midagi.',
  'family.someone': 'Keegi',
  'family.waiting':
    'Perekonna {family} korraldaja pole sind veel kinnitanud. Mis jagatakse, avaneb siin, kui nad seda teevad.',
  'family.rotate':
    'Keegi on lahkunud perest {family}, ja Passhold pole veel kõiki oma võtmeid vahetanud: selle jagatud hoidlates muudetu ootab selles brauseris. Kui see nii jääb, vaheta need lehel „Family“.',
  'family.rotateCompare':
    'Keegi on lahkunud perest {family}. Passhold annab kõigile uued võtmed, kui oled ülal oleva koodi võrrelnud; seni ootab selle jagatud hoidlates muudetu selles brauseris.',
  'family.rotateWait':
    'Keegi on lahkunud perest {family}. Mida sa selle jagatud hoidlates muudad, ootab selles brauseris, kuni korraldaja Passhold vahetab võtmed – mis juhtub sünkroonimisel –, et lahkunu seda ei saaks lugeda.',
  'family.left': '{who} ei kuulu enam perre {family}',
  'family.leftBody':
    'Passhold ei tea, miks ta lahkus. Kui sa seda ei oodanud, küsi temalt või oma perekonna korraldajalt.',
  'family.title': 'Perekond',
  'family.description':
    'Kes su perekonnas on ja milliseid hoidlaid see jagab. Perekonda haldatakse lehel „Family“ aadressil account.keyrook.com: kutsuda, kellegi eemaldada, võtmeid vahetada.',
  'family.none': 'See konto ei kuulu ühtegi perekonda. Perekonnad luuakse lehel „Family“ aadressil account.keyrook.com.',
  'family.youOrganise': 'Oled selle korraldaja.',
  'family.youMember': 'Oled selle liige.',
  'family.you': '(sina)',
  'family.organiser': 'Korraldaja',
  'family.notCompared': 'Lubatud ilma koodide võrdlemata',
  'family.keyNew': 'Nende võti on muutunud: neilt ei võeta midagi enne, kui võrdled koodi',
  'family.membersLater': 'Kes seal on, kuvatakse siin, kui see avaneb selles brauseris.',
  'family.sharedVaults': 'Jagatud hoidlad',
  'family.vaultWaits': 'Selles muudetu ootab, kuni korraldaja vahetab selle võtme',

  // Cards, addresses and notes
  'wallet.updated': 'Muudetud {date}',
  'wallet.copyField': 'Kopeeri {field}',
  'card.untitled': 'Kaart',
  'card.newTitle': 'Uus kaart',
  'card.editTitle': 'Muuda kaarti',
  'card.titleHint': 'Kui jätta tühjaks, saab kaart nimeks oma võrgu ja viimased neli numbrit.',
  'card.number': 'Kaardi number',
  'card.numberCheck': 'See number ei klapi: kontrolli iga numbrit.',
  'card.holder': 'Nimi kaardil',
  'card.expiry': 'Aegub',
  'card.month': 'Kuu',
  'card.year': 'Aasta',
  'card.code': 'Turvakood',
  'card.empty': 'Anna kaardi number või nimi.',
  'card.expired': 'See kaart on aegunud.',
  'card.expiredOn': 'aegus {expiry}',
  'card.copyNumber': 'Kopeeri kaardi number',
  'card.copyExpiry': 'Kopeeri aegumiskuupäev',
  'address.untitled': 'Aadress',
  'address.newTitle': 'Uus aadress',
  'address.editTitle': 'Muuda aadressi',
  'address.titleHint': 'Kodu, Töö … Kui jätta tühjaks, saab see nimeks selles oleva nime.',
  'address.name': 'Täisnimi',
  'address.organization': 'Ettevõte',
  'address.street': 'Tänav ja maja number',
  'address.city': 'Linn',
  'address.region': 'Maakond või piirkond',
  'address.postalCode': 'Postiindeks',
  'address.country': 'Riik',
  'address.chooseCountry': 'Vali riik',
  'address.phone': 'Telefon',
  'address.email': 'E-post',
  'address.address': 'Aadress',
  'address.empty': 'Täida nimi või osa aadressist.',
  'note.untitled': 'Pealkirjata märkus',
  'note.newTitle': 'Uus märkus',
  'note.editTitle': 'Muuda märkust',
  'note.title': 'Pealkiri',
  'note.text': 'Märkus',
  'note.empty': 'Anna sellele pealkiri või kirjuta midagi.',
  'note.edited': 'Muudetud {date}',

  // Pending save, in the popup
  'pending.saveTitle': 'Kas salvestada see sisselogimine?',
  'pending.updateTitle': 'Kas uuendada parool?',
  'pending.lockedTitle': 'Kas salvestada sisselogimine, mida just kasutasid?',
  'pending.body': '{username} saidil {site}',
  'pending.bodyNoUser': 'Parool saidile {site}',
  'pending.save': 'Salvesta',
  'pending.update': 'Uuenda',
  'pending.never': 'Mitte kunagi sellele saidile',

  // Item
  'item.username': 'Kasutajanimi',
  'item.password': 'Parool',
  'item.website': 'Veebisait',
  'item.websites': 'Veebisaidid',
  'item.notes': 'Märkmed',
  'item.favorite': 'Lemmik',
  'item.unfavorite': 'Eemalda lemmikutest',
  'item.addFavorite': 'Lisa lemmikutesse',
  'item.trash': 'Teisalda prügikasti',
  'item.updated': 'Parool muudetud {date}',
  'item.history': 'Varasemad paroolid',
  'item.weak': 'See parool on nõrk: seda ei oleks kaua vaja arvata.',
  'item.reused': {
    one: 'Seda parooli kasutatakse veel {count} sisselogimise jaoks. Kui üks sait selle lekitab, on mõlemad avatud.',
    other: 'Seda parooli kasutatakse veel {count} sisselogimise jaoks. Kui üks sait selle lekitab, on kõik avatud.',
  },
  'item.changePassword': 'Muuda seda saidil',
  'item.openSite': 'Ava {site}',
  'item.passkey': 'Pääsuvõti',
  'item.passkeyBody': 'Saidile {site}, salvestatud {date}',

  // Edit
  'edit.newTitle': 'Uus sisselogimine',
  'edit.editTitle': 'Muuda sisselogimist',
  'edit.title': 'Nimi',
  'edit.titleHint': 'Kui jätta tühjaks, saab see nimeks veebisaidi nime.',
  'edit.username': 'Kasutajanimi või e-post',
  'edit.password': 'Parool',
  'edit.generate': 'Genereeri',
  'edit.websites': 'Veebisaidid',
  'edit.websitesHint': 'Üks rea kohta. Passhold pakub seda sisselogimist nendel saitidel.',
  'edit.notes': 'Märkmed',
  'edit.empty': 'Anna nimi, kasutajanimi või parool.',

  // Fields of an item's own, and folders
  'fields.title': 'Kohandatud väljad',
  'fields.add': 'Lisa väli',
  'fields.name': 'Välja nimi',
  'fields.value': 'Väärtus',
  'fields.hidden': 'Peida see nagu parool',
  'fields.remove': 'Eemalda see väli',
  'fields.unnamed': 'Väli',
  'fields.copy': 'Kopeeri {name}',
  'folders.label': 'Kaust',
  'folders.placeholder': 'Ilma kaustata',
  'folders.choose': 'Olemasolevad kaustad',
  'folders.hint': 'Hoia asjad koos – Töö, Perekond, Pank – ja näita korraga ühte kausta.',
  'folders.all': 'Kõik kaustad',
  'folders.none': 'Ühessegi kaustas',
  'folders.count': { one: '{count} kirje', other: '{count} kirjet' },
  'folders.nothingHere': 'Selles kaustas pole seda liiki midagi.',
  'folders.rename': 'Nimeta ümber',
  'folders.renameTo': 'Kausta uus nimi',
  'folders.remove': 'Eemalda kaust',
  'folders.removeHint': 'Selles olev jääb alles, kaustata.',

  // Generator
  'generator.length': 'Pikkus',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'Jäta välja sarnased märgid (I l 1 O 0)',
  'generator.again': 'Veel üks',
  'generator.use': 'Kasuta seda parooli',
  'generator.bits': '{bits} bitti',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold on lukus.',
  'menu.unlock': 'Ava Passhold',
  'menu.unlockHint': 'Klõpsa tööriistaribal Passholdil, et avada, ja tule siia tagasi.',
  'menu.none': 'Saidile {site} pole salvestatud sisselogimisi.',
  'menu.uninitialized': 'Seadista Passhold esmalt: klõpsa sellel tööriistaribal.',
  'menu.suggest': 'Kasuta tugevat parooli',
  'menu.suggestBody': 'Uus parool, mis on sinu eest täidetud. Passhold pakub selle salvestamist, kui vorm on saadetud.',
  'menu.fillFor': 'Täida saidil {site}',
  'menu.hidden': 'Passholdi katab leheküljel miski, seega see ei täida.',
  'menu.passkey': 'Pääsuvõti · {username}',
  'menu.noCards': 'Passholdis pole veel kaarte. Lisa üks Passholdist tööriistaribal.',
  'menu.noAddresses': 'Passholdis pole veel aadresse. Lisa üks Passholdist tööriistaribal.',
  'menu.cardInsecure':
    'See leht pole turvaline (tavaline http), seega Passhold ei täida siin kaarti: keegi teel võiks seda lugeda.',

  // A website's passkey
  'passkey.saveTitle': 'Kas salvestada pääsuvõti saidile {site}?',
  'passkey.save': 'Salvesta pääsuvõti',
  'passkey.saveElsewhere': 'Salvesta mujale',
  'passkey.useElsewhere': 'Kasuta mujalt pärit pääsuvõtit',
  'passkey.existsTitle': 'See pääsuvõti on Passholdis juba olemas',
  'passkey.ok': 'OK',
  'passkey.signInTitle': 'Logi saidile {site} sisse',
  'passkey.signInBody': 'Passholdis salvestatud pääsuvõtmega',
  'passkey.none': 'Passholdis pole saidile {site} pääsuvõtit.',
  'passkey.hidden': 'Passholdi katab leheküljel miski, seega see ei vasta.',

  // Save prompt on a page
  'prompt.save': 'Kas salvestada sisselogimine Passholdisse?',
  'prompt.update': 'Kas uuendada parool Passholdis?',
  'prompt.saveButton': 'Salvesta',
  'prompt.updateButton': 'Uuenda',
  'prompt.never': 'Mitte kunagi sellele saidile',
  'prompt.saved': 'Salvestatud Passholdisse.',
  'prompt.locked': 'Klõpsa tööriistaribal Passholdil ja ava lukk – see küsib seal, kas salvestada.',
  'prompt.saveCard': 'Kas salvestada kaart Passholdisse?',
  'prompt.updateCard': 'Kas uuendada kaart Passholdis?',
  'prompt.saveAddress': 'Kas salvestada aadress Passholdisse?',
  'prompt.saveCheckout': 'Kas salvestada kaart ja aadress Passholdisse?',

  // Settings
  'settings.title': 'Seaded',
  'settings.cannotOpen': 'Ei avane üldse? Eemalda hoidla sellest brauserist',
  'settings.encryptedHere': 'Krüpteeritud sellel seadmel',
  'settings.source': 'Lähtekood GitHubis',

  'nav.passwords': 'Paroolid',
  'nav.accountSync': 'Konto ja sünkroonimine',
  'nav.family': 'Perekond',
  'nav.account': 'Keyrooki konto',
  'nav.backup': 'Varukoopia ja import',
  'nav.security': 'Turvalisus',
  'nav.general': 'Üldine',
  'nav.needsAttention': 'vajab tähelepanu',


  'account.description':
    'Logi sisse, ja sinu sisselogimised järgnevad sulle igas brauseris, kus sisse logid Passholdiga. Need krüpteeritakse kõigepealt sellel seadmel: Keyrooki server ei saa neid lugeda ega teada, mis saidi jaoks need on.',
  'account.email': 'E-post',
  'account.password': 'Keyrooki konto parool',
  'account.signIn': 'Logi sisse',
  'account.signingIn': 'Sisselogimine…',
  'account.note':
    'Sama konto mis Keyrook Authenticatoris. Google’i või GitHubiga loodud konto logib sisse oma nupu abil.',
  'account.haveOne': 'Mul on konto',
  'account.create': 'Loo konto',
  'account.sendCode': 'Saada mulle e-postiga kood',
  'account.createNote':
    'Keyrook saadab kuuekohalise koodi e-postiga, et kinnitada, et aadress on sinu. Kui aadressil on juba konto, ütleb e-kiri seda hoopis: logi sisse selle kontoga.',
  'account.codeSent': 'Kood on teel aadressile {email}. See kehtib viisteist minutit.',
  'account.code': 'Kuuekohaline kood',
  'account.newPassword': 'Keyrooki konto parool',
  'account.passwordNote':
    'See parool avab sinu Keyrooki konto igas brauseris, nii Passholdi kui Keyrook Authenticatori jaoks. Keyrook ei näe seda kunagi ega saa seda sinu eest lähtestada; järgmisena saadav taastevõti on viis uue määramiseks.',
  'account.createButton': 'Loo konto',
  'account.creating': 'Loon…',
  'account.otherEmail': 'Kasuta teist aadressi',
  'account.signedInAs': 'Sisse logitud kui {email}',
  'account.signedInAsNamed': 'Sisse logitud kui {name} ({email})',
  'account.synced': 'Sünkroonitud {date}',
  'account.notSynced': 'Pole veel sünkroonitud',
  'account.syncNow': 'Sünkrooni kohe',

  // The account, at the foot of the popup
  'accountBar.synced': 'Sünkroonitud {time}',
  'accountBar.justNow': 'just nüüd',
  'accountBar.syncing': 'Sünkroonin…',
  'accountBar.signedOut': 'Välja logitud – sünkroonimiseks logi uuesti sisse',
  'accountBar.startedOver': 'Konto alustati otsast – logi uuesti sisse',
  'accountBar.removed': 'Konto küljest eemaldatud – sünkroonimiseks logi uuesti sisse',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'Eemaldatud sinu Keyrooki kontolt',
  'removed.body':
    'Kuupäeval {date} eemaldati see brauser sinu Keyrooki kontolt, nii et Passhold võttis sealt konto sisselogimised, kaardid, aadressid ja märkmed ning logis brauseri välja. Siin lisatud või muudetud ja mitte saadetud asjad jäid maha kui selle brauseri enda omad. Logi uuesti sisse, et ülejäänud tagasi tuua.',

  // Passwords, in Settings
  'passwords.description':
    'Iga sisselogimine, pääsuvõti, kaart, aadress ja märkus Passholdis. Vali üks, et seda näha, sealt kopeerida või seda muuta.',
  'passwords.all': 'Kõik',
  'passwords.attention': 'Vajab tähelepanu',
  'passwords.weak': 'Nõrgad',
  'passwords.reused': 'Korduvkasutatud',
  'account.syncDone': 'Sünkroonitud.',
  'account.removed': {
    one: '{count} kirje, mis teisel seadmel jäädavalt kustutati, eemaldati siit.',
    other: '{count} kirjet, mis teisel seadmel jäädavalt kustutati, eemaldati siit.',
  },
  'account.skipped': {
    one: '{count} kirje ei avanenud ja jäeti puutumata.',
    other: '{count} kirjet ei avanenud ja jäeti puutumata.',
  },
  'account.manage': 'Halda oma Keyrooki kontot',
  'account.manageBody':
    'Muuda parooli, tee uus taastevõti või alusta kontot otsast peale aadressil account.keyrook.com – Passholdi ja Keyrook Authenticatori jaoks koos.',
  'account.manageBodyProvider':
    'Tee uus taastevõti või alusta kontot otsast peale aadressil account.keyrook.com – Passholdi ja Keyrook Authenticatori jaoks koos.',
  'account.manageOpen': 'Ava',
  'account.signOut': 'Logi välja',
  'account.signOutBody': 'Eemaldab igasuguse sisselogimise sellest brauserist pärast viimast sünkroonimist. Logi uuesti sisse ja need tulevad tagasi.',
  'account.signOutConfirm':
    'Passhold sünkroonib veel korra ja eemaldab seejärel hoidla sellest brauserist. Midagi ei eemaldata, kui mõni sisselogimine pole jõudnud sinu kontoni.',
  'account.signOutButton': 'Logi välja ja eemalda',
  'account.signedOutByServer': 'Keyrook logis selle brauseri välja. Logi uuesti sisse, et sünkroonimist jätkata.',
  'account.startedOver':
    'Sinu Keyrooki konto alustati otsast kuupäeval {date}, nii et Keyrook logis selle brauseri välja. Logi sisse selle uue parooliga: siinsed sisselogimised laaditakse üles konto uute võtmete alla.',
  'account.startedOverProvider':
    'Sinu Keyrooki konto alustati otsast kuupäeval {date}, nii et Keyrook logis selle brauseri välja. Logi sisse Google’i või GitHubiga: siinsed sisselogimised laaditakse üles konto uute võtmete alla.',
  'account.forgot': 'Unustasid parooli?',
  'account.recoverBody':
    'Keyrook saadab koodi konto aadressile; seejärel sisesta see, konto taastevõti lehelt, mille salvestasid konto loomisel, ja uus parool. Iga teine konto külge logitud brauser ja rakendus küsib uut.',
  'account.recoveryKey': 'Konto taastevõti',
  'account.recoverPassword': 'Uus konto parool',
  'account.recoverButton': 'Määra uus parool',
  'account.recovering': 'Määran…',
  'account.backToSignIn': 'Tagasi sisselogimise juurde',
  'startOver.link': 'Kadus ka taastevõti? Alusta kontot otsast peale',
  'startOver.title': 'Alusta kontot otsast peale',
  'needsRoot.body':
    'Kui sul on konto taastevõti, mille andis Keyrook Authenticator, sisesta see: siis avaneb ka Passhold. Ilma selleta teeb Passhold kontole uue taastevõtme, mis näidatakse üks kord, ja vana lakkab töötamast.',
  'needsRoot.sheet': 'Konto taastevõti Keyrook Authenticatorist (kui sul see on)',
  'needsRoot.withSheet': 'Kasuta seda võtit',
  'needsRoot.newSheet': 'Tee uus taastevõti',
  'startOver.body':
    'Kui alles on ainult e-posti aadress, saab konto alustada otsast uute võtmete ja uue taastevõtmega. See jõustub nädal pärast palumist ja kuni selleni võib seda tühistada iga brauser, mis on kontole veel sisse logitud – nii et keegi, kellel on ainult sinu e-post, ei saa seda ära võtta. Kõik, mis kontol oli, hoiab Keyrook krüpteerituna 90 päeva: vana parool või vana taastevõti toob selle tagasi.',
  'startOver.button': 'Alusta otsast',
  'startOver.working': 'Alustan otsast…',
  'startOver.kitBody':
    'Konto uus taastevõti: see töötab, kui konto on otsast alanud. Passhold näitab seda ainult nüüd, seega hoia see alles, enne kui edasi lähed.',
  'startOver.waitTitle': 'Sinu konto alustab otsast kuupäeval {date}',
  'startOver.waitBody':
    'Kuni selleni ei muutu midagi, ja iga brauser, mis on kontole veel sisse logitud, võib selle tühistada. Keyrook kirjutab praegu aadressile {email}, päev enne ja kui see juhtub.',
  'startOver.waitThen':
    'Sellest hetkest logi siin sisse oma uue parooliga. Selle brauseri sisselogimised laaditakse üles konto uute võtmete alla ja mis konto varem hoidis, hoitakse 90 päeva.',
  'startOver.waitThenProvider':
    'Sellest hetkest logi siin sisse Google’i või GitHubiga nagu varem. Selle brauseri sisselogimised laaditakse üles konto uute võtmete alla ja mis konto varem hoidis, hoitakse 90 päeva.',
  'startOver.understood': 'Selge',
  'startOver.doneTitle': 'Sinu konto on otsast alanud',
  'startOver.doneBody':
    'Logi sisse oma uue parooliga: selle brauseri sisselogimised laaditakse üles konto uute võtmete alla ja mis konto varem hoidis, hoitakse 90 päeva.',
  'startOver.doneBodyProvider':
    'Logi sisse Google’i või GitHubiga nagu varem: selle brauseri sisselogimised laaditakse üles konto uute võtmete alla ja mis konto varem hoidis, hoitakse 90 päeva.',
  'startOverWait.title': 'Sinu Keyrooki konto alustab otsast kuupäeval {date}',
  'startOverWait.body':
    'Selle palus kood, mille Keyrook sulle e-postiga saatis, seadmelt, mis nimetas end „{device}“. Kui see polnud sina, võib keegi su e-posti lugeda: tühista see kohe ja seejärel muuda oma e-posti parooli. Kui see olid sina, jäta see nii.',
  'startOverWait.bodyNoName':
    'Selle palus kood, mille Keyrook sulle e-postiga saatis. Kui see polnud sina, võib keegi su e-posti lugeda: tühista see kohe ja seejärel muuda oma e-posti parooli. Kui see olid sina, jäta see nii.',
  'startOverWait.cancel': 'Tühista otsast alustamine',
  'kept.title': {
    one: 'Alles hoitud enne konto otsast alustamist: {count} kirje',
    other: 'Alles hoitud enne konto otsast alustamist: {count} kirjet',
  },
  'kept.body': 'Kuni {date}. Vana konto parool või vana taastevõti toob need tagasi Passholdisse.',
  'kept.open': 'Too tagasi',
  'kept.secret': 'Vana konto parool või vana taastevõti',
  'kept.done': { one: '{count} kirje toodi tagasi.', other: '{count} kirjet toodi tagasi.' },
  'kept.nothingNew': 'Kõik, mis alles hoiti, on juba siin.',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': 'Jätka teenusega {provider}',
  'provider.passwordTitle': 'Sellel Keyrooki kontol on parool',
  'provider.passwordBody':
    'Logisid sisse teenusega {provider} kui {email}. Konto parool on see, mis avab siin Passholdi: sisesta see üks kord.',
  'provider.openAccountPage': 'Ava account.keyrook.com',
  'secondStep.title': 'Kaheastmeline sisselogimine',
  'secondStep.body':
    'Sisesta kuuekohaline kood, mida sinu autentimisrakendus Keyrooki jaoks näitab. Kadunud rakendus? Sisesta selle asemel oma konto taastevõti.',
  'secondStep.ownerBody':
    'Sinu konto nõuab selleks ka teist astet: koodi sinu autentimisrakendusest või konto taastevõtit.',
  'secondStep.field': 'Kood või taastevõti',
  'secondStep.continue': 'Jätka',
  'secondStep.passkey': 'Kasuta selle asemel pääsuvõtit',
  'secondStep.nextBody':
    'Konto võtme andmine nõuab samuti koodi ning iga kood töötab ainult üks kord. Oota, kuni sinu autentimisrakendus näitab uut, ja sisesta see – või oma konto taastevõti.',
  'provider.or': 'või',
  'provider.signedInWith': 'Sisse logitud teenusega {provider} kui {email}',
  'provider.signedInWithNamed': 'Sisse logitud teenusega {provider} kui {name} ({email})',
  'provider.newTitle': 'Loo oma Keyrooki konto',
  'provider.newBody':
    'Logid sisse teenusega {provider} kui {email}. Kontol pole parooli: {provider} logib sind sisse. Teises arvutis laseb sind sisse juba sisselogitud brauser – või seda teeb järgmisena saadav taastevõti.',
  'provider.joinTitle': 'Lase see brauser sisse',
  'provider.joinBody':
    '{email} on siin sisse logitud, aga sinu sisselogimisi avav võti asub su teistes arvutites. Ava Passhold ühes neist – Seaded, Konto ja sünkroonimine – ja lase see brauser sisse.',
  'provider.waiting': 'Ootan teist brauserit…',
  'provider.compare': 'Teine brauser näitab koodi. Lase see sinna sisse ainult siis, kui see on see siin:',
  'provider.ended': 'See päring lõppes enne, kui teine brauser selle sisse laskis.',
  'provider.askAgain': 'Küsi uuesti',
  'provider.useKit': 'Kasuta selle asemel taastevõtit',
  'provider.useThisKey': 'Kasuta seda võtit',
  'provider.needsRoot':
    '{email} tehti Keyrook Authenticatoris enne, kui iga Keyrooki rakendusel oli oma võti. Passhold saab sellele anda ühe kohe, kui kinnitad uuesti teenusega {provider}; Authenticatoris ei muutu midagi.',
  'provider.confirmWith': 'Kinnita teenusega {provider}',
  'provider.noKeyYet':
    'Passhold pole veel kuskil kontole {email} sisse logitud, nii et ükski teine brauser ei saa seda sisse lasta. Konto taastevõti avab selle.',
  'passkey.onLabel': 'Uued arvutid avanevad sinu pääsuvõtmega',
  'passkey.offLabel': 'Uutele arvutitele pole pääsuvõtit',
  'passkey.body':
    'Uues arvutis: {provider}, siis sinu pääsuvõti – ja iga sisselogimine on seal. Google Password Manageri hoitud pääsuvõti on igas Chromes, kuhu sa sisse logid.',
  'passkey.bodyEdge':
    'Uues arvutis: {provider}, siis sinu pääsuvõti – ja iga sisselogimine on seal. Seal, kus see sünkroonitakse, on pääsuvõti ka sinu teistes seadmetes.',
  'passkey.turnOn': 'Lülita sisse',
  'passkey.turnOff': 'Lülita välja',
  'passkey.joinTitle': 'Ava oma pääsuvõtmega',
  'passkey.joinBody': 'Kontol {email} on pääsuvõti uutele arvutitele. Kinnita sellega ja su sisselogimised tulevad alla.',
  'passkey.use': 'Kasuta pääsuvõtit',
  'passkey.otherWays': 'Muud viisid sisselogimiseks',
  'pairing.asking': '{device} soovib lasta end sinu kontole.',
  'pairing.start': 'Lase sisse…',
  'pairing.notMe': 'Mitte mina',
  'pairing.compare': 'Lase see sisse ainult siis, kui uus brauser näitab just seda koodi:',
  'pairing.match': 'Koodid klapivad – lase sisse',
  'pairing.differ': 'Koodid erinevad',

  'accountKit.title': 'Salvesta oma konto taastevõti',
  'accountKit.body':
    'Kui unustad oma Keyrooki konto parooli, määrab see võti uue – nii Passholdi kui Keyrook Authenticatori jaoks. Keyrook ei näe kunagi sinu parooli, seega on see ainus viis. Saad selle uuesti vaadata Seadetes; hoia see ka mujal.',
  'accountKit.fileTitle': 'Keyrooki konto taastevõti',
  'accountKit.fileBody':
    'Kui unustad oma Keyrooki konto parooli, määrab see võti uue: Passholdis Seaded → Konto ja sünkroonimine → „Unustasid parooli?“. Igaüks, kellel on see ja su e-posti aadress, saab sama teha, seega hoia seda turvaliselt ja mitte sellel arvutil.',
  'accountKit.bodyNoPassword':
    'Sinu kontol pole parooli: juba sisse logitud brauser laseb uue sisse. Kui ühtegi ei jää, teeb seda see võti – nii Passholdi kui Keyrook Authenticatori jaoks. Saad selle uuesti vaadata Seadetes; hoia see ka mujal.',
  'accountKit.fileBodyNoPassword':
    'Kui ükski arvuti pole enam sinu Keyrooki kontole sisse logitud, laseb see võti uue sisse: logi sisse Google’i või GitHubiga ja vali „Kasuta selle asemel taastevõtit“. Igaüks, kellel on see ja kes saab ka sinuna sisse logida, saab sama teha, seega hoia seda turvaliselt ja mitte sellel arvutil.',
  'accountKit.whenTitleNoPassword': 'Kui ükski arvuti pole sisse logitud',
  'accountKit.inPassholdNoPassword':
    'Passholdis: logi sisse Google’i või GitHubiga, vali „Kasuta selle asemel taastevõtit“ ja sisesta see võti.',
  'accountKit.keepNoPassword':
    'Hoia see leht turvaliselt, eemal oma arvutist. Sellega saab sinu Keyrooki konto avada igaüks, kes saab sisse logida sinu Google’i või GitHubi kontole.',
  'accountKit.rowBodyNoPassword': 'Laseb uue arvuti sisse, kui ükski teine enam seda ei tee.',
  'accountKit.sheetTitle': 'Keyrooki konto taastekomplekt',
  'accountKit.whenTitle': 'Kui konto parool on unustatud',
  'accountKit.inPasshold':
    'Passholdis: Seaded → Konto ja sünkroonimine → „Unustasid parooli?“, seejärel sinu e-posti aadress, Keyrooki e-postiga saadetud kood, see võti ja uus parool.',
  'accountKit.inAuthenticator': 'Keyrook Authenticator võtab sama võtme: „Unustasid parooli?“ kohas, kus see palub sisse logida.',
  'accountKit.keep':
    'Hoia see leht turvaliselt, eemal oma arvutist. Igaüks, kellel on see ja su e-posti postkast, saab kontole uue parooli määrata.',
  'accountKit.pending': 'Konto taastevõtit pole veel alles hoitud',
  'accountKit.keptState': 'Konto taastevõti on alles hoitud',
  'accountKit.elsewhere': 'Konto taastevõti tehtud mujal',
  'accountKit.none': 'Konto taastevõtit pole',
  'accountKit.rowBody': 'Määrab uue konto parooli, kui see on unustatud. Uus peatab vana töötamise igas rakenduses.',
  'accountKit.elsewhereBody':
    'Tehtud aadressil account.keyrook.com, Keyrook Authenticatoris või teises brauseris: selle võti on tol ajal salvestatud lehel. Kui teed siin uue, lakkab see töötamast.',
  'accountKit.noneBody':
    'Ilma selleta ei saa unustatud konto parooli lähtestada ja Keyrookis hoitut ei saa avada. Sellest brauserist olevad sisselogimised jäävad igal juhul alles.',
  'accountKit.make': 'Tee üks',
  'accountKit.apart':
    'Hoia see oma e-postist eraldi: igaüks, kellel on see võti ja kes saab su e-posti lugeda, võib määrata uue parooli ja avada su sisselogimised. Ära saada seda endale e-kirjaga ega hoia seda selle e-posti pilvesalvestuses.',
  'accountKit.apartNoPassword':
    'Hoia see eraldi Google’i või GitHubi kontost, millega sisse logid: igaüks, kellel on see võti ja kes saab seal sinuna sisse logida, võib avada su sisselogimised. Ära saada seda endale e-kirjaga ega hoia seda selle konto pilvesalvestuses.',
  'accountKit.unchecked': 'Konto taastevõtit pole veel kontrollitud',
  'accountKit.uncheckedBody':
    'Sinu kontol on taastevõti, mis on tehtud aadressil account.keyrook.com või teises rakenduses. Sisesta see üks kord: Passhold kontrollib, et see avab sinu konto, ja hoiab selle alles, et saaksid selle uuesti näha.',
  'accountKit.typeIt': 'Sisesta see',
  'accountKit.checked': 'See avab sinu konto. Passhold hoiab seda nüüd, et seda siin uuesti näidata.',
  'accountKit.draftBody':
    'Sinu konto uus taastevõti. See ei tööta veel: kui oled selle salvestanud ja tagasi sisestanud, määrab selle sinu konto parool ja vana lakkab töötamast.',
  'accountKit.setTitle': 'Määra oma uus taastevõti',
  'accountKit.setBody': 'Sisesta oma Keyrooki konto parool. Kuni selleni töötab sinu vana taastevõti, ja see uus mitte.',
  'accountKit.set': 'Määra',
  'checkup.clear': 'Parandada pole midagi',
  'checkup.clearBody': 'Nõrku ega korduvkasutatud paroole pole ja su varukoopia on ajakohane.',
  'checkup.issues': { one: '{count} asi, mida vaadata', other: '{count} asja, mida vaadata' },
  'checkup.issuesBody': 'Igaüks allpool ütleb, miks see oluline on ja kuidas seda parandada.',
  'checkup.backup': 'Varukoopia',
  'checkup.access': 'Ligipääs',
  'checkup.recoveryPending':
    'Selle hoidla jaoks tehtud taastevõtit ei kinnitatud kunagi alles hoituks, ja see on ainus sissepääs, kui {method} lakkab töötamast. Tee uus ja hoia seda.',
  'checkup.deviceMissing':
    'Sellel hoidlal pole pearoolisõna, seega ilma {method} selleta iga lukust avamine küsib taastevõtit.',
  'checkup.lastBackup': 'Viimane varukoopia {date}',
  'checkup.backupNever':
    'Kui see brauser kaob, kaovad ka sinu sisselogimised. Varukoopia on krüpteeritud fail, mida hoia mujal.',
  'checkup.backupDue': 'Sinu hoidla on sellest ajast muutunud. Tee uus, et see sisaldaks kõike.',
  'checkup.backUp': 'Tee varukoopia kohe',
  'checkup.weak': { one: '{count} nõrk parool', other: '{count} nõrka parooli' },
  'checkup.weakBody':
    'Liiga lühike või lihtne, et see arvatav ei oleks. Muuda igaüks sellel saidil; Passhold pakub vormis tugevat ja pakub selle salvestamist.',
  'checkup.weakNone': 'Ühtegi.',
  'checkup.reused': {
    one: '{count} parool on kasutusel rohkem kui üks kord',
    other: '{count} parooli on kasutusel rohkem kui üks kord',
  },
  'checkup.reusedBody': 'Kui üks sait parooli lekitab, proovivad inimesed seda kõikjal mujal. Anna igale sisselogimisele oma.',
  'checkup.reusedNone': 'Ühtegi: igal sisselogimisel on oma parool.',
  'checkup.sharedBy': { one: 'Jagatud {count} sisselogimisega', other: 'Jagatud {count} sisselogimisega' },
  'checkup.change': 'Muuda',
  'checkup.limits':
    'Passhold ei kontrolli, kas parool on ilmunud andmelekkes: selleks tuleks küsida serverilt ja Passhold ei küsi kellegi käest. Ega ta ei nõua vanade paroolide vahetamist – tugev ja ainulaadne parool ei kulu ära.',

  'backup.description': 'Hoia krüpteeritud koopiat, too üks tagasi või too sisselogimisi sisse ja välja.',
  'backup.backupRow': 'Kogu su hoidla ühes krüpteeritud failis, pearoolisõna all.',
  'backup.restoreRow': 'Lisa varukoopiafailis olevad sisselogimised sellesse hoidlasse.',
  'backup.importRow': 'Teisest brauserist või paroolihaldurist CSV-failina või Bitwardeni JSON-ina.',
  'backup.exportRow': 'CSV-fail, mida teised rakendused saavad lugeda. Pole krüpteeritud.',

  'security.description': 'Kuidas Passhold avaneb ja millal see uuesti sulgub.',
  'security.locking': 'Lukustamine',
  'security.opensTitle': 'Kuidas Passhold avaneb',
  'security.opensBody': 'Pearoolisõna pole: {method} avab selle ja taastevõti siis, kui {method} ei suuda.',
  'security.setPassword': 'Kasuta selle asemel pearoolisõna',
  'security.setPasswordBody': 'Passhold avaneb siis parooliga, mille valid, ja taastevõti seda enam ei ava.',
  'security.setPasswordOpen': 'Määra üks',
  'security.setPasswordSave': 'Kasuta seda parooli',
  'security.dropPassword': 'Lõpeta pearoolisõna kasutamine',
  'security.dropPasswordBody':
    'Ava ainult {method} abil ja hoia taastevõtit päevaks, mil see ei suuda. Pearoolisõna ei ava enam hoidlat.',
  'security.dropPasswordOpen': 'Vaheta',
  'security.dropPasswordSave': 'Vaheta ja näita taastevõtit',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'seadme ekraanilukk',
  'device.method.passkey': 'pääsuvõti',
  'device.title': 'Ava {method} abil',
  'device.description': 'Kiireim viis sisse ja see töötab ka pärast brauseri taaskäivitamist.',
  'device.on': 'Sees',
  'device.off': 'Väljas',
  'device.body':
    'Sinu sõrmejälg või nägu avab Passholdi – või enamikes arvutites arvuti enda parool. Seega saab Passholdi avada igaüks, kes saab selle arvuti lukust lahti teha. Mis avatakse, jääb sellele arvutile ja on ilma selleta kasutu.',
  'device.whereMac':
    'Kui Chrome küsib, kuhu pääsuvõti salvestada, vali Google Password Manager. Pääsuvõti sinu Chrome’i profiilis ei saa Passholdi lukust lahti teha, samuti ei saa seda iCloud Keychain igal Macil.',
  'device.whereMacEdge':
    'Kui Edge küsib, kuhu pääsuvõti salvestada, vali koht, mis hoiab seda ka sinu teistes seadmetes. Mitte iga koht ei saa Passholdi lahti lukustada: kui valitud koht ei saa, ütleb Passhold seda ja midagi ei muutu.',
  'device.unavailable': 'Siin pole saadaval',
  'device.unavailableBody':
    'See brauser ei leidnud sõrmejälge, nägu ega ekraanilukku, mida Passhold saaks kasutada. PIN töötab kõikjal.',
  'device.unavailableRecovery':
    'See brauser ei leidnud sõrmejälge, nägu ega ekraanilukku, mida Passhold saaks kasutada, seega avaneb see hoidla siin oma taastevõtmega. Määra pearoolisõna, kui eelistad seda sisestada.',
  'device.opensWith': 'Passholdi avab {method}',
  'device.notHere': '{method} pole selles brauseris seadistatud',
  'device.isTheWayIn': 'Ilma pearoolisõnata avaneb Passhold just nii. Selle väljalülitamiseks määra kõigepealt pearoolisõna.',
  'device.setUpHere': 'Kuni {method} on siin seadistatud, küsib iga lukust avamine taastevõtit.',
  'device.setUp': 'Seadista',
  'device.turnOff': 'Lülita välja',
  'device.save': 'Seadista {method}',
  'keys.title': 'Ava turvavõtmega',
  'keys.description': 'USB-võti, mille ühendad: veel üks sisenemisviis, mis töötab ka pärast brauseri taaskäivitamist.',
  'keys.method': 'su turvavõti',
  'keys.on': { one: '{count} võti seadistatud', other: '{count} võtit seadistatud' },
  'keys.off': 'Ühtegi võtit pole seadistatud',
  'keys.body':
    'Ühenda võti, sisesta selle PIN ja puuduta seda, ja Passhold avaneb – ainult sellel arvutil. Igaüks, kellel on võti ja kes teab selle PIN-i, saab Passholdi siin avada, seega hoia seda nagu majavõtit. Kui see kaob, eemalda see siit: su muud sisenemisviisid töötavad edasi.',
  'keys.add': 'Lisa võti',
  'keys.save': 'Lisa see võti',
  'keys.one': 'Turvavõti',
  'keys.added': 'Lisatud {date}',
  'keys.remove': 'Eemalda',
  'pin.title': 'Ava PIN-iga',
  'pinOffer.title': 'Ava Passhold kiiremini PIN-iga',
  'pinOffer.body':
    'Sisesta paari numbrit oma parooli asemel iga kord, kui Passhold lukustub, kuni brauser suletakse. Pärast brauseri uuesti käivitamist sisesta oma parool üks kord.',
  'pinOffer.later': 'Saad selle seadistada või välja lülitada igal ajal Seadetes, Turvalisus.',
  'pin.description': 'Mitmete kordade jaoks päevas, mil Passhold lukustub, kui oled samas brauseris.',
  'pin.on': 'Sees',
  'pin.off': 'Väljas',
  'pin.bodyRecovery':
    'Töötab ainult seni, kui brauser on avatud, ja ainult viie vale katse korral: pärast seda või pärast taaskäivitamist on vaja seadet või taastevõtit. PIN-i avatut ei hoita kettal.',
  'pin.body':
    'Töötab ainult seni, kui brauser on avatud, ja ainult viie vale katse korral: pärast seda või pärast taaskäivitamist on vaja pearoolisõna. PIN-i avatut ei hoita kettal.',
  'pin.setUp': 'Seadista PIN',
  'pin.change': 'Muuda',
  'pin.turnOff': 'Lülita välja',
  'pin.new': 'PIN, 6 kuni 12 numbrit',
  'pin.again': 'Sisesta uuesti',
  'pin.save': 'Salvesta PIN',

  'general.description': 'Kuidas Passhold käitub veebisaitidel ja kuidas see välja näeb.',
  'general.filling': 'Täitmine ja salvestamine',
  'general.appearance': 'Keel ja välimus',
  'settings.autoSuggest': 'Näita soovitusi, kui klõpsad sisselogimise, kaardi või aadressi väljal',
  'settings.autoSuggestBody':
    'Sinu sisselogimised saidile, tugev parool registreerimisvormil, sinu kaardid ja aadressid makse juures. Midagi ei täideta enne, kui valid.',

  'trash.description': 'Sisselogimised, kaardid, aadressid ja märkmed ootavad siin, kuni need taastad või jäädavalt kustutad.',
  'trash.sharedDescription': 'Jagatud perega: igaüks selles saab neid taastada. Jäädavalt kustutatuna on need kõigi jaoks kadunud.',
  'trash.sharedMember': 'Jagatud perega: sina saad neid taastada. Jäädavalt kustutab need ainult perekonna korraldaja.',
  'settings.autoLock': 'Lukusta pärast',
  'settings.autoLock.never': 'Ainult siis, kui brauser suletakse',
  'settings.autoLock.minutes': { one: '{count} minut', other: '{count} minutit' },
  'settings.autoLock.hours': { one: '{count} tund', other: '{count} tundi' },
  'settings.lockWithSystem': 'Lukusta, kui arvuti lukustub või läheb unerežiimi',
  'settings.clipboard': 'Kustuta kopeeritud paroolid pärast',
  'settings.clipboard.never': 'Mitte kunagi',
  'settings.clipboard.seconds': { one: '{count} sekund', other: '{count} sekundit' },
  'settings.clipboard.minutes': { one: '{count} minut', other: '{count} minutit' },
  'settings.inlineButton': 'Näita Passholdi nuppu sisselogimise, kaardi ja aadressi väljadel',
  'settings.offerToSave': 'Paku sisselogimiste salvestamist, kui logid sisse',
  'settings.offerToSaveCards': 'Paku kaartide ja aadresside salvestamist, kui maksad',
  'settings.offerToSaveCardsBody':
    'Kaart ainult turvalisest (https) lehest, ja ainult selline, mille number klapib. See näidatakse viimaste neljast numbrist, mitte kunagi numbri ega koodiga.',
  'settings.passkeys': 'Salvesta ja kasuta pääsuvõtmeid',
  'settings.passkeysBody':
    'Kui sait pakub pääsuvõtit, hoiab Passhold selle koos su sisselogimistega ja logib sind sellega sisse. Kui see on väljas, jäetakse pääsuvõtmed brauserile.',
  'settings.language': 'Keel',
  'settings.language.auto': 'Sama mis brauseris',
  'settings.theme': 'Välimus',
  'settings.theme.system': 'Sama mis süsteemis',
  'settings.theme.light': 'Hele',
  'settings.theme.dark': 'Tume',

  'settings.security': 'Pearoolisõna',
  'settings.securityBody': 'Muutmine lukustab hoidla võtme uuesti; sinu sisselogimised jäävad samaks.',
  'settings.current': 'Praegune pearoolisõna',
  'settings.new': 'Uus pearoolisõna',
  'settings.confirm': 'Sisesta uus uuesti',
  'settings.change': 'Muuda pearoolisõna',
  'settings.changeOpen': 'Muuda',
  'settings.changed': 'Pearoolisõna muudetud.',

  'settings.backup': 'Varukoopia',
  'settings.backupBody':
    'Kogu su hoidla ühes krüpteeritud failis. Hoia see mujal kui sellel arvutil – USB-kettal või pilvesalvestuses –, et selle brauseri kaotamine ei tähendaks sinu sisselogimiste kaotamist. See avaneb ainult pearoolisõnaga, mis sul oli selle tegemisel.',
  'settings.backupBodyRecovery':
    'Kogu su hoidla ühes krüpteeritud failis. Hoia see mujal kui sellel arvutil – USB-kettal või pilvesalvestuses –, et selle brauseri kaotamine ei tähendaks sinu sisselogimiste kaotamist. See avaneb sinu taastevõtmega.',
  'settings.backupLast': 'Viimane varukoopia: {date}',
  'settings.backupNever': 'Varukoopiat pole veel.',
  'settings.backupButton': 'Laadi varukoopia alla',
  'settings.backupDone': 'Salvestatud sinu allalaadimistesse. Teisalda see nüüd mujale kui sellele arvutile.',

  'settings.restoreBackup': 'Taasta varukoopiast',
  'settings.restoreBodyNew':
    'Selles brauseris pole veel hoidlat. Too oma tagasi varukoopiafailist – see avaneb pearoolisõnaga, millega varukoopia tehti –, või tee uus Passholdi nupust tööriistaribal.',
  'settings.restoreBodyMerge':
    'Lisab sellesse hoidlasse selle, mis varukoopias on. Siin midagi ei kustutata: kui mõlemal on sama sisselogimine, jääb alles uuem muudatus ja teine parool läheb selle ajalukku.',
  'settings.restoreChoose': 'Vali varukoopiafail',
  'settings.restoreMade': 'Varukoopia tehtud {date}',
  'settings.restorePassword': 'Varukoopia pearoolisõna',
  'settings.restoreRecoveryKey': 'Varukoopia taastevõti',
  'settings.restoreButton': 'Taasta',
  'settings.restoreNew': { one: 'Hoidla taastatud, {count} kirjega.', other: 'Hoidla taastatud, {count} kirjega.' },
  'settings.restoreAdded': { one: 'Varukoopiast lisati {count} kirje.', other: 'Varukoopiast lisati {count} kirjet.' },
  'settings.restoreUpdated': {
    one: '{count} kirjel oli varukoopias uuem muudatus.',
    other: '{count} kirjel oli varukoopias uuem muudatus.',
  },
  'settings.restoreNothing': 'Kõik varukoopias on juba sellel hoidlal.',

  'settings.import': 'Impordi',
  'settings.importBody':
    'Too oma paroolid Chrome’ist, Edge’ist, Firefoxist, Safarist, Apple Passwordsist, Bitwardenist, 1Passwordist, LastPassist, KeePassist, Dashlane’ist, Proton Passist või NordPassist: ekspordi need seal CSV-failina ja vali see siin. Ka faili kaardid, aadressid ja märkmed tulevad kaasa. Bitwardenist ekspordi JSON-ina (krüpteerimata): nende CSV jätab kaardid, isikud ja pääsuvõtmed välja. Dashlane paneb need eraldi failidesse: vali igaüks järjest.',
  'settings.importChoose': 'Vali fail',
  'settings.importFound': 'Importimiseks leitud: {what}.',
  'settings.importLogins': { one: '{count} sisselogimine', other: '{count} sisselogimist' },
  'settings.importPasskeys': { one: '{count} pääsuvõti', other: '{count} pääsuvõtit' },
  'settings.importCards': { one: '{count} kaart', other: '{count} kaarti' },
  'settings.importAddresses': { one: '{count} aadress', other: '{count} aadressi' },
  'settings.importNotes': { one: '{count} märkus', other: '{count} märkust' },
  'settings.importSkipped': {
    one: '{count} kirje ei sisalda midagi, mida Passhold hoiab, ja jäetakse välja.',
    other: '{count} kirjet ei sisalda midagi, mida Passhold hoiab, ja need jäetakse välja.',
  },
  'settings.importDuplicates': {
    one: '{count} kirje on juba sinu hoidlas.',
    other: '{count} kirjet on juba sinu hoidlas.',
  },
  'settings.importConfirm': 'Impordi',
  'settings.importDone': 'Imporditud: {what}.',
  'settings.importDelete': 'Kustuta nüüd CSV-fail: see sisaldab sinu paroole tavateksti.',
  'settings.importNothing': 'Selles failis pole importimiseks midagi uut.',
  'settings.importTwoFactor': {
    one: '{count} sisselogimisel selles failis on kaheastmelise sisselogimise (2FA) kood. Passhold ei hoia 2FA-koode: vii see autentimisrakendusse enne, kui kustutad oma vana paroolihalduri, muidu võid selle konto lukust välja jääda.',
    other: '{count} sisselogimisel selles failis on kaheastmelise sisselogimise (2FA) koodid. Passhold ei hoia 2FA-koode: vii need autentimisrakendusse enne, kui kustutad oma vana paroolihalduri, muidu võid nendest kontodest lukust välja jääda.',
  },
  'settings.importAuthenticator': 'Hangi Keyrook Authenticator',
  'settings.importPasskeysLeft': {
    one: '{count} pääsuvõti selles failis ei saa Passholdisse. Hoia oma vana paroolihaldurit alles, kuni oled sellele saidile muul viisil sisse logind ja teinud Passholdis uue pääsuvõtme.',
    other: '{count} pääsuvõtit selles failis ei saa Passholdisse. Hoia oma vana paroolihaldurit alles, kuni oled nendele saitidele muul viisil sisse logind ja teinud Passholdis uued pääsuvõtmed.',
  },

  'settings.export': 'Ekspordi',
  'settings.exportBody':
    'CSV-fail, mida saab lugeda iga brauser ja paroolihaldur. See sisaldab sinu paroole tavateksti: hoia seda ainult nii kaua, kui seda vajad. See sisaldab ainult sisselogimisi: pääsuvõtmed, kohandatud väljad, kaustad, kaardid, aadressid ja märkmed sinna ei kuulu. Varukoopia hoiab kõike.',
  'settings.exportButton': 'Ekspordi CSV',
  'settings.exportDone': 'Eksporditud. Kustuta fail, kui oled sellega lõpetanud.',

  'settings.neverSave': 'Ära kunagi paku salvestamist saidile',
  'settings.neverSaveEmpty': 'Saite pole. Vali „Mitte kunagi sellele saidile“, kui Passhold pakub salvestamist, ja see ilmub siia.',
  'settings.remove': 'Eemalda',

  'settings.trash': 'Prügikast',
  'settings.trashEmpty': 'Prügikast on tühi.',
  'settings.restore': 'Taasta',
  'settings.deleteForever': 'Kustuta jäädavalt',
  'settings.emptyTrash': 'Tühjenda prügikast',
  'settings.emptyTrashConfirm': 'Kas kustutada prügikastis olev kõik jäädavalt?',

  'settings.danger': 'Eemalda hoidla',
  'settings.dangerBody':
    'Kustutab hoidla sellest brauserist. Kõik selles olevad sisselogimised on jäädavalt kadunud – laadi enne alla varukoopia, kui soovid need alles hoida.',
  'settings.dangerType': 'Kinnitamiseks sisesta {word}',
  'settings.dangerWord': 'kustuta',
  'settings.dangerButton': 'Eemalda hoidla',

  'settings.about': 'Passhold {version} · Keyrooki poolt',

  // Errors
  'error.noWorker': 'Passhold ei vastanud. Sulge see ja proovi uuesti.',
  'error.wrongPassword': 'See ei ole pearoolisõna.',
  'error.passwordTooShort': 'Kasuta vähemalt {min} märki.',
  'error.vaultCorrupt': 'Selle seadme hoidla on kahjustatud ja seda ei saa avada.',
  'error.vaultTooNew': 'Selle hoidla lõi uuem Passhold. Uuenda Passholdi, et seda avada.',
  'error.itemNotFound': 'Seda pole enam hoidlas.',
  'error.familyOrganiserOnly': 'Selle hoidla prügikasti saab tühjendada ainult perekonna korraldaja.',
  'error.familyGone': 'See perekond pole siin enam. Sünkrooni ja vaata uuesti.',
  'error.familyNotOpen': 'Passhold ei saa seda perekonda veel selles brauseris avada. Sünkrooni ja proovi uuesti.',
  'error.itemInvalid': 'Seda ei saa sellisena salvestada.',
  'error.importEmpty': 'Selles failis pole importimiseks midagi.',
  'error.importTooLarge': 'See fail on importimiseks liiga suur.',
  'error.importUnknownFormat': 'See fail ei näe välja nagu paroolide eksport.',
  'error.importEncrypted':
    'See Bitwardeni eksport on krüpteeritud ja Passhold ei saa seda avada. Ekspordi Bitwardenist uuesti kui „.json“, mitte kui „.json (Encrypted)“, ja vali siis see fail.',
  'error.backupInvalid': 'See fail ei ole Passholdi varukoopia või on kahjustatud.',
  'error.backupWrongPassword': 'See ei ole pearoolisõna, millega see varukoopia tehti.',
  'error.backupWrongRecoveryKey': 'See ei ole taastevõti, millega see varukoopia tehti.',
  'error.noRecoveryKey': 'Sellel hoidlal pole taastevõtit näidata: see avaneb pearoolisõnaga.',
  'error.wrongRecoveryKey': 'See ei ole taastevõti.',
  'error.deviceNeeded':
    'Pearoolisõnata hoidla avaneb selle seadme lukustusega: seadista see esmalt. See jääb kehtima, kuni pearoolisõna on määratud.',
  'error.accountOffline': 'Keyrooki ei õnnestunud kätte saada. Kontrolli ühendust ja proovi uuesti.',
  'error.accountWrong':
    'Vale e-post või parool. Google’i või GitHubiga loodud konto logib sisse oma nupu abil.',
  'error.accountSignedOut': 'Keyrook logis selle brauseri välja. Logi uuesti sisse.',
  'error.accountBusy': {
    one: 'Liiga palju katseid. Oota {count} sekund ja proovi uuesti.',
    other: 'Liiga palju katseid. Oota {count} sekundit ja proovi uuesti.',
  },
  'error.accountFailed': 'Keyrook ei suutnud seda praegu teha. Proovi hiljem uuesti.',
  'error.accountAlready': 'See hoidla on juba sisse logitud Keyrooki kontole.',
  'error.accountNone': 'See hoidla pole sisse logitud Keyrooki kontole.',
  'error.accountKdfRefused': 'Keyrook küsis nõrgemat võtit, kui Passhold vastu võtab, seega sisselogimine peatati.',
  'error.accountKeyWrong': 'Konto võti ei avanenud selle parooliga.',
  'error.accountCode': 'See kood ei ole õige või on aegunud. Kontrolli e-kirja või küsi uus.',
  'error.accountMail': 'Keyrook ei saanud praegu e-kirja saata. Proovi minuti pärast uuesti.',
  'error.providerDenied': 'Sisselogimine tühistati.',
  'error.providerFailed': 'Google või GitHub ei saanud sind praegu sisse logida. Proovi uuesti.',
  'error.providerExpired': 'See sisselogimine on lõppenud. Alusta uuesti.',
  'error.providerNotOwner':
    'See ei ole konto, millega see Keyrooki konto sisse logib. Logi uuesti sisse selle kontoga, mida kasutad Keyrooki jaoks.',
  'error.signOutUnsent': {
    one: 'Üks kirje pole veel jõudnud sinu Keyrooki kontole, seega midagi ei eemaldatud. Kontrolli oma ühendust või logi uuesti sisse ja seejärel logi välja.',
    other: '{count} kirjet pole veel jõudnud sinu Keyrooki kontole, seega midagi ei eemaldatud. Kontrolli oma ühendust või logi uuesti sisse ja seejärel logi välja.',
  },
  'error.providerOtherProvider':
    'Sellel e-postil on juba Keyrooki konto, mis logib sisse Google’i ja GitHubi teisega. Logi sisse selle kontoga.',
  'error.providerHasPassword':
    'Sellel e-postil on juba Keyrooki konto parooliga. Logi siin sisse oma e-posti ja parooliga – või lisa see aadressil account.keyrook.com, et logida sisse ka Google’i või GitHubiga, seal parooliga sisse logituna.',
  'error.providerEmailTaken':
    'Sellel e-postil on juba Keyrooki konto, mis logib sisse muul viisil. Logi sisse selle viisiga – või lisa sellele see konto aadressil account.keyrook.com, seal sisse logituna selle viisiga, kuidas see praegu sisse logib.',
  'error.pairingWrongKey':
    'See, mis tagasi tuli, ei ole selle konto võti, seega see lükati tagasi. Küsi uuesti ja lase sisse ainult brauser, mida tunned.',
  'error.pairingRefused': 'See ei tulnud brauserilt, mille koodi kontrollisid, seega see lükati tagasi. Küsi uuesti.',
  'error.pairingEnded': 'See päring on lõppenud. Küsi uuesti uuest brauserist.',
  'error.passkeyWrong': 'See pääsuvõti ei ava seda kontot. Proovi mõnda muud sisenemisviisi.',
  'error.joinExpired': 'See sisselogimine oli liiga kaua ootel. Logi uuesti sisse.',
  'error.accountPasswordWrong': 'See ei ole konto parool.',
  'error.accountNoKit': 'Passhold ei hoia selle konto taastevõtit.',
  'error.accountKitRace': 'Teine rakendus muutis just konto taastevõtit. Sünkrooni ja proovi uuesti.',
  'error.accountKitShape': 'See ei näe välja nagu konto taastevõti: see on 32 tähte ja numbrit.',
  'error.accountKitWrong': 'See taastevõti ei vasta ühelegi kontole selle e-posti aadressiga.',
  'error.accountKitNotThis': 'See ei ole selle konto taastevõti. Vaata uuesti, mida salvestasid.',
  'error.accountPasswordWeak':
    'Konto jaoks liiga lihtne arvata: kasuta pikemat parooli, milles on segamini tähti, numbreid ja sümboleid, või neli-viis omavahel mitteseotud sõna.',
  'error.accountBoxWrong':
    'Passholdi võti selles kontos ei avanenud. Logi uuesti sisse; kui see ikka ei tööta, alusta kontot otsast peale.',
  'error.accountCodeWait': {
    one: 'Kood saadeti just äsja. Saad uue küsida {count} sekundi pärast.',
    other: 'Kood saadeti just äsja. Saad uue küsida {count} sekundi pärast.',
  },
  'error.accountSignUpKeys': 'Keyrook küsis Passholdi enda võtit ja seda ei saadetud. Uuenda Passholdi ja proovi uuesti.',
  'error.accountIdTaken': 'Konto ei saanud praegu luua. Küsi uus kood ja proovi uuesti.',
  'error.accountNoRoot': 'Sellel kontol pole veel võtit, mida taastevõti saaks avada. Logi uuesti sisse selle parooliga.',
  'error.accountRootNotHeld':
    'See arvuti ei suutnud näidata, et hoiab konto võtit. Logi uuesti sisse parooli või taastevõtmega.',
  'error.accountRootChanged':
    'Selle konto võtmed asendati teises arvutis. Logi sisse arvutis, kus Passhold on veel sisse logitud, või alusta kontot otsast peale.',
  'error.accountKeyReplaced': 'Passholdi võti selles kontos asendati teises arvutis. Logi uuesti sisse.',
  'error.accountSessionStolen': 'See arvuti logiti välja, sest selle seanssi kasutati mujalt. Logi uuesti sisse.',
  'error.accountOld':
    'See konto tehti Google’i või GitHubiga enne, kui iga Keyrooki rakendusel oli oma võti, ja selles olev ükski asi ei ava veel Passholdi. Alusta kontot e-postiga otsast peale, et sellele üks anda.',
  'error.pairingBusy': 'Liiga paljud brauserid ootavad selle kontoga liitumist. Proovi mõne minuti pärast uuesti.',
  'error.startOverExpired': 'See on aegunud. Küsi uus kood ja alusta uuesti.',
  'error.startOverTooOften': 'See konto on hiljuti liiga sageli otsast alanud. Proovi uuesti pärast {day}.',
  'error.startOverWaiting': 'See konto alustab otsast kuupäeval {day}. Brauser, mis on sellele veel sisse logitud, võib selle tühistada.',
  'error.startOverUpdate': 'Keyrook ootab nüüd nädal enne, kui konto otsast alustatakse. Uuenda Passholdi, et seda paluda.',
  'error.passkeyFailed': 'Seda pääsuvõtit ei õnnestunud kontrollida. Proovi uuesti.',
  'error.passkeyNotYou': 'See pääsuvõti ei kinnitanud, et oled sina. Proovi uuesti ja ava see nii, nagu nõutakse.',
  'error.passkeyUnknown':
    'See pääsuvõti ei ole ühelegi Keyrooki kontole. See on võib-olla eemaldatud: logi sisse parooliga või Google’i või GitHubiga.',
  'error.passkeyExpired': 'See pääsuvõtme päring on lõppenud. Proovi uuesti.',
  'error.passkeyNotOffered': 'Keyrook ei paku siin veel pääsuvõtmeid.',
  'error.passkeyNoUnlock':
    'See pääsuvõti logib sisse, aga ei ole veel seatud konto lukust lahti tegema. Lehel account.keyrook.com vali „Passkeys“ alt selle kõrval „Let it unlock“ ja proovi uuesti. Või logi sisse parooliga või Google’i või GitHubiga.',
  'error.passkeyNoPrf':
    'See pääsuvõti logib sisse aadressil account.keyrook.com, kuid seal, kus see on hoitud, ei saa see sinu kontot lukust lahti teha – näiteks enne macOS 15 iCloud Keychain ei saa. Lisa lehel account.keyrook.com „Passkeys“ alt üks, mis on hoitud kohas, kus see saab, näiteks turvavõti, ja kontrolli, et seal on „Unlocks your data“. Kuni selleni logi sisse parooliga või Google’i või GitHubiga.',
  'error.passkeyPermission':
    'Passhold vajab Chrome’i luba, et kasutada account.keyrook.com pääsuvõtmeid. Vali pääsuvõti uuesti ja luba see.',
  'error.passkeyPermissionEdge':
    'Passhold vajab Edge’i luba, et kasutada account.keyrook.com pääsuvõtmeid. Vali pääsuvõti uuesti ja luba see.',
  'error.passkeyCancelled': 'Pääsuvõtit ei kasutatud. Proovi uuesti või logi sisse muul viisil.',
  'error.secondStepNeeded': 'Sinu konto nõuab teist sammu: sisesta ka kood oma autentimisrakendusest.',
  'error.secondStepWrong': 'See kood ei ole õige. Sisesta see, mida su autentimisrakendus praegu näitab, või oma taastevõti.',
  'error.signInExpired': 'See sisselogimine on aegunud. Logi uuesti sisse.',
  'error.secondStepUpdate': 'Sinu konto nõuab sisselogimiseks teist sammu. Uuenda Passholdi, et sisse logida.',
  'error.secondStepAsked': 'Sinu konto nõuab teist sammu: sisesta kood oma autentimisrakendusest.',
  'error.secondStepTaken':
    'See on kood, millega sisse logisid, ja iga kood töötab ainult üks kord. Oota, kuni su autentimisrakendus näitab uut.',
  'error.kitDraftGone': 'Uut taastevõtit ei määratud õigeks ajaks ja midagi ei muutunud. Tee uus uuesti.',
  'error.archiveWrong': 'See ei ava seda, mis alles hoiti.',
  'error.archiveGone': 'Seda ei hoita enam alles.',
  'error.archiveDeleteRefused': 'Ainult vana parool või vana taastevõti saab kustutada seda, mis alles hoiti enne, kui see aegub.',
  'error.accountNeedsRoot':
    'See konto tehti Keyrook Authenticatoris enne, kui iga Keyrooki rakendusel oli oma võti. Passhold saab sellele anda ühe nüüd; Authenticatoris ei muutu midagi.',
  'error.accountServerWrong':
    'Keyrooki server vastas millegagi, mis ei sobi selle konto võtmetega, seega Passhold peatus. Proovi hiljem uuesti.',
  'error.startOverNeedsPassword': 'Sellel kontol on parool: vali uus, et see otsast alustada.',
  'error.pinInvalid': 'PIN on 6 kuni 12 numbrit.',
  'error.wrongPin': 'See ei ole PIN.',
  'error.wrongPinLeft': {
    one: 'See ei ole PIN. Jäänud on {count} katse.',
    other: 'See ei ole PIN. Jäänud on {count} katset.',
  },
  'error.pinLockedOut': 'Liiga palju valesid PIN-e. Ava muul viisil; pärast seda töötab PIN jälle.',
  'error.pinUnavailable': 'PIN töötab ainult seni, kui brauser on avatud. Ava muul viisil; pärast seda töötab PIN jälle.',
  'error.deviceGone': 'Lukust avamine selle seadmega pole enam seadistatud. Ava muul viisil.',
  'error.deviceKeyWrong': 'See ei avanud Passholdi. Ava muul viisil ja seadista seejärel seadme lukust avamine uuesti.',
  'error.deviceUnsupported':
    'Seal, kus see pääsuvõti salvestati, ei saa Passholdile anda avamise võtit. Proovi uuesti ja salvesta see Google Password Manageris – või kasuta PIN-i.',
  'error.deviceUnsupportedEdge':
    'Seal, kus see pääsuvõti salvestati, ei saa Passholdile anda avamise võtit. Proovi uuesti ja salvesta see mujale – või kasuta PIN-i.',
  'error.deviceCancelled': 'Midagi ei avatud: see tühistati või võttis liiga kaua aega.',
  'error.keyUnsupported':
    'See võti ei saa Passholdile anda seda, mida ta avamiseks vajab. Enamik FIDO2 võtmeid saavad; ainult kaheastmelise sisselogimise (U2F) jaoks tehtud võti ei saa.',
  'error.keyAlreadyAdded': 'See võti on siin juba seadistatud.',
  'error.keyGone': 'See turvavõti pole siin enam seadistatud. Ava muul viisil.',
  'error.keyWrong': 'See võti ei avanud Passholdi. Ava muul viisil, eemalda seejärel võti ja lisa see uuesti.',
  'error.kdfUnsupported': 'Hoidla seaded ei ole sellised, mida Passhold vastu võtab.',
  'error.locked': 'Passhold on lukus.',
  'error.noVault': 'Hoidlat pole veel.',
  'error.vaultExists': 'Hoidla on juba olemas.',
  'error.notOnPage': 'See sisselogimine ei ole selle vahelehe lehe jaoks.',
  'error.expired': 'See on aegunud. Proovi uuesti.',
  'error.noFields': 'Sellel lehel pole midagi, mida Passhold saaks täita.',
  'error.cardInsecure': 'Passhold täidab kaardi ainult turvalisel (https) lehel.',
  'error.unknown': 'Midagi läks valesti: {detail}',
};
