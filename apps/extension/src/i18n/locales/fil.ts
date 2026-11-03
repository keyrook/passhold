import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'ni Keyrook',

  // Common
  'common.cancel': 'Kanselahin',
  'common.close': 'Isara',
  'common.save': 'I-save',
  'common.edit': 'I-edit',
  'common.back': 'Bumalik',
  'common.show': 'Ipakita',
  'common.hide': 'Itago',
  'common.notNow': 'Hindi ngayon',

  // Setup
  'setup.title': 'Gumawa ng vault',
  'setup.body':
    'Iniimbak ng Passhold ang iyong mga password na naka-encrypt sa device na ito. Isang pangunahing password ang nagbubukas sa mga ito — pumili ng isang matatandaan mo at hindi mo gagamitin kahit saan pa.',
  'setup.password': 'Pangunahing password',
  'setup.confirm': 'I-type muli',
  'setup.mismatch': 'Magkaiba ang dalawang password.',
  'setup.tooShort': 'Gumamit ng hindi bababa sa {min} karakter.',
  'setup.understand':
    'Nauunawaan kong walang sinuman — hindi Passhold, hindi Keyrook — ang makakabawi ng aking vault kung makalimutan ko ang password na ito.',
  'setup.create': 'Gumawa ng vault',
  'setup.creating': 'Ginagawa…',
  'setup.restore': 'Ibalik mula sa backup',

  // Strength
  'setup.deviceBody':
    'Iniimbak ng Passhold ang iyong mga password na naka-encrypt sa device na ito, at binubuksan ang mga ito ng {method} — walang pangunahing password na kailangang gawin o tandaan. Makakakuha ka rin ng recovery key, para sa araw na hindi kayang gawin ng {method}.',
  'setup.deviceWhereMac': 'Kapag tinanong ka ng Chrome kung saan itatago ang passkey, piliin ang Google Password Manager.',
  'setup.deviceWhereMacEdge':
    'Kapag tinanong ka ng Edge kung saan itatago ang passkey, pumili ng lugar na nagsi-sync din nito sa iyong ibang device. Hindi lahat ng lugar ay kayang magbukas ng Passhold: kung hindi kaya ng napili mo, sasabihin ito ng Passhold.',
  'setup.createWithDevice': 'Gumawa gamit ang {method}',
  'setup.usePassword': 'Gamitin na lang ang pangunahing password',
  'setup.useDevice': 'Gamitin na lang ang {method}',
  'setup.signIn': 'Mag-sign in o gumawa ng Keyrook account',

  'welcome.title': 'Ang iyong mga password, sa bawat computer',
  'welcome.body':
    'Mag-sign in nang isang beses. Bubuksan ang Passhold gamit ang iyong fingerprint, pupunan para sa iyo, at naroon ang iyong mga login kung saan ka mag-sign in.',
  'welcome.email': 'Gumamit ng email address',
  'gate.touchTitle': 'Buksan gamit ang isang haplos',
  'gate.touchBody': 'Bubuksan ng Touch ID o Windows Hello ang Passhold. Walang pangunahing password na kailangang gawin at tandaan.',
  'gate.everywhereTitle': 'Sa bawat computer na ginagamit mo',
  'gate.everywhereBody': 'Mag-sign in sa ibang computer at naroon ang iyong mga password at passkey.',
  'gate.privateTitle': 'Ikaw lang ang makababasa nito',
  'gate.privateBody':
    'Naka-encrypt sa computer na ito bago ipadala ang anuman. Hindi mababasa ng Keyrook ang iyong mga password, o kung para saang site ang mga ito.',
  'welcome.note':
    'Naka-encrypt muna sa computer na ito: hindi mababasa ng Keyrook ang iyong mga password, o kung para saang site ang mga ito.',
  'connect.title': 'I-on ang iyong Keyrook account',
  'connect.body': 'Ang iyong mga login sa bawat computer na ginagamit mo — at backup kung mawala ang computer na ito.',
  'connect.email': 'Email',
  'kitCheck.title': 'Suriin ang iyong recovery key ng account',
  'kitCheck.body': 'I-type ito nang isang beses, para malaman mong hawak mo pa ito bago ang araw na kailanganin mo ito.',
  'accountPasskey.button': 'Magpatuloy gamit ang passkey',
  'accountPasskey.working': 'Naghihintay sa passkey…',
  'accountPasskey.hint':
    'Isa na idinagdag mo sa account.keyrook.com. Sa unang pagkakataon, hihingin ng {browser} na payagan ang Passhold na gamitin ito.',
  'accountPasskey.openPasskeys': 'Buksan ang “Passkeys” sa account.keyrook.com',
  'join.title': 'Mag-sign in sa Keyrook',
  'join.body': 'Isang Keyrook account para sa Passhold at Keyrook Authenticator. Mula sa account papunta sa browser na ito ang iyong mga login.',
  'join.createTitle': 'Gumawa ng Keyrook account',
  'join.createBody':
    'Isang account para sa Passhold at Keyrook Authenticator: ang iyong mga login, naka-encrypt muna sa device na ito, sa bawat computer na pinapasukan mo.',
  'join.lockTitle': 'Naka-sign in bilang {email}',
  'join.lockBodyDevice':
    'Huling hakbang: bubukas ang Passhold sa computer na ito gamit ang {method}. Ibababa ang iyong mga login sa sandaling maitakda ito.',
  'join.cancel': 'Gumamit ng ibang account',
  'join.lockBodyCode':
    'Huling hakbang: isang code na magbubukas ng Passhold sa computer na ito. Ibababa ang iyong mga login sa sandaling maitakda ito.',
  'join.opening': 'Binubuksan ang Passhold…',
  'setup.useAccountPassword': 'Gamitin na lang ang password ng aking account',
  'setup.useCode': 'Gumamit na lang ng code para sa computer na ito',
  'security.accountPasswordTitle': 'Bumubukas gamit ang password ng iyong Keyrook account',
  'security.accountPasswordBody':
    'Iisang password para sa dalawa. Kapag nagbago ito, susundan ito ng Passhold dito sa susunod mong pag-sign in.',

  'recovery.title': 'I-save ang iyong recovery key',
  'recovery.body':
    'Kung mawala ang device na ito, o tumigil sa paggana ang unlock nito, ang key na ito ang daan pabalik sa iyong vault at sa mga backup nito. Makikita mo ulit ito sa Settings habang bumubukas pa ang Passhold — kaya itago rin ito sa ibang lugar: naka-print, sa iyong telepono, o sa isang file na wala sa computer na ito.',
  'recovery.download': 'I-download',
  'recovery.copy': 'Kopyahin',
  'recovery.copied': 'Nakopya',
  'recovery.print': 'I-print',
  'recovery.qr': 'Ipakita ang QR code',
  'recovery.qrHide': 'Itago ang QR code',
  'recovery.qrLabel': 'Ang recovery key bilang QR code',
  'recovery.qrHint': 'Itutok ang camera ng iyong telepono dito at i-save ang teksto sa isang note, o kumuha ng larawan nito.',
  'recovery.show': 'Ipakita',

  'kit.title': 'Recovery kit ng Passhold',
  'kit.made': 'Ginawa noong {date}',
  'kit.keyLabel': 'Recovery key',
  'kit.whenTitle': 'Kapag hindi bumubukas ang Passhold',
  'kit.sameDevice':
    'Sa computer na ito: kapag humingi ng unlock ang Passhold, piliin ang “Gamitin na lang ang recovery key” at i-type ang key.',
  'kit.newDevice':
    'Sa bagong computer: i-install ang Passhold, piliin ang “Ibalik mula sa backup”, piliin ang pinakabagong backup file mo, at i-type ang key. Kung walang backup, walang maibabalik, kaya gumawa ng isa.',
  'kit.keep':
    'Itago ang sheet na ito sa ligtas na lugar, malayo sa iyong computer. Ang sinumang may ito at kopya ng iyong vault ay makabubukas ng vault.',
  'recovery.fileTitle': 'Recovery key ng Passhold',
  'recovery.fileMade': 'Ginawa noong {date}',
  'recovery.fileBody':
    'Binubuksan ng key na ito ang iyong vault ng Passhold at mga backup nito kapag hindi kaya ng iyong device. Sinumang may ito at kopya ng iyong vault ay makabubukas nito, kaya itago ito nang ligtas at hindi sa parehong computer.',
  'recovery.pending': 'Hindi pa naitatago ang recovery key',
  'recovery.keptState': 'Naitago na ang recovery key',
  'recovery.rowBody':
    'Binubuksan ang iyong vault at mga backup nito kapag hindi kaya ng {method}. Hihinto ng bago ang pagbukas ng vault na ito gamit ang luma; ang mga backup na ginawa na dati ay bubukas pa rin gamit ang luma.',
  'recovery.makeNew': 'Gumawa ng bago',
  'recovery.savedIt': 'Na-save ko na',
  'recovery.checkTitle': 'Suriin kung na-save mo na ito',
  'recovery.checkBody':
    'I-type ang dalawang grupo ng key mula sa na-save mo — ang file, ang papel o ang larawan. Ang mga grupo ay mga bloke ng apat na karakter sa pagitan ng mga gitling, binilang mula sa kaliwa.',
  'recovery.group': 'Grupo {position}',
  'recovery.check': 'Suriin',
  'recovery.checkWrong':
    'Hindi iyan ang nakasulat sa iyong key. Tingnan muli ang na-save mo, o ipakita muli ang key at i-save ito ngayon.',
  'recovery.showAgain': 'Ipakita muli ang key',
  'recovery.covered': 'Ang iyong Keyrook account ang daan pabalik',
  'recovery.coveredBody':
    'Kung hindi na bubuksan ng {method} ang Passhold dito, alisin ang vault at mag-sign in muli sa iyong account: babalik ang bawat login. Makikita pa rin dito ang sariling recovery key ng vault na ito.',

  'proof.recoveryKey': 'Recovery key',
  'proof.withDevice': 'Magkukumpirma ka gamit ang {method}.',
  'proof.useDevice': 'Magkumpirma na lang gamit ang {method}',
  'proof.usePassword': 'I-type na lang ang pangunahing password',
  'proof.useAccountPassword': 'I-type na lang ang password ng account',
  'proof.useCode': 'I-type na lang ang code',
  'proof.useRecoveryKey': 'I-type na lang ang recovery key',
  'strength.0': 'Napakahina',
  'strength.1': 'Mahina',
  'strength.2': 'Katamtaman',
  'strength.3': 'Malakas',
  'strength.4': 'Napakalakas',
  'strength.short': 'Mas malakas kapag mas mahaba: layunin ang 14 na karakter o higit pa.',
  'strength.digitsOnly': 'Mabilis hulaan ang mga numero lang.',
  'strength.repeats': 'Iwasan ang paulit-ulit na iisang karakter.',

  // Unlock
  'unlock.title': 'Naka-lock ang Passhold',
  'unlock.body': 'Ilagay ang iyong pangunahing password.',
  'unlock.password': 'Pangunahing password',
  'unlock.submit': 'I-unlock',
  'unlock.pinBody': 'Ilagay ang iyong PIN.',
  'unlock.pin': 'PIN',
  'unlock.usePassword': 'Gamitin na lang ang pangunahing password',
  'unlock.usePin': 'Gamitin na lang ang PIN',
  'unlock.recoveryBody': 'Ilagay ang iyong recovery key.',
  'unlock.deviceBody': 'Gamitin ang {method}, o i-type sa ibaba.',
  'unlock.recoveryKey': 'Recovery key',
  'unlock.useRecoveryKey': 'Gamitin na lang ang recovery key',
  'unlock.lost': 'Hindi makapasok?',
  'unlock.forgotBodyRecovery':
    'Binubuksan ng iyong recovery key ang vault kapag hindi kaya ng device. Kung wala ito at wala ang device, walang makabubukas ng vault — ni Passhold, ni Keyrook: maaalis mo lang ito sa Settings at magsisimula muli.',
  'unlock.bodyAccount': 'Ilagay ang password ng iyong Keyrook account.',
  'unlock.accountPassword': 'Password ng Keyrook account',
  'unlock.useAccountPassword': 'Gamitin na lang ang password ng account',
  'unlock.forgotBodyAccount':
    'Ito ang password ng iyong Keyrook account: kung napalitan ito sa ibang lugar, gamitin ang bago. Tuluyan mo nang nakalimutan? Alisin ang vault na ito sa Settings at mag-sign in muli — gamit ang recovery key kung kailangan mo ng bagong password — at babalik ang bawat login.',
  'unlock.bodyCode': 'Ilagay ang code na magbubukas ng Passhold sa computer na ito.',
  'unlock.code': 'Code para sa computer na ito',
  'unlock.useCode': 'Gamitin na lang ang code',
  'unlock.forgotBodyCode':
    'Alisin ang vault na ito sa Settings at mag-sign in muli gamit ang Google o GitHub: babalik ang bawat login mula sa iyong account.',
  'unlock.device': 'I-unlock gamit ang {method}',
  'unlock.key': 'I-unlock gamit ang security key',
  'unlock.keyBody': 'Isaksak ang iyong security key, o i-type sa ibaba.',
  'unlock.or': 'o',
  'unlock.unlocking': 'Ina-unlock…',
  'unlock.forgot': 'Nakalimutan mo?',
  'unlock.forgotBody':
    'Ang iyong pangunahing password ang tanging susi sa vault na ito, at hindi ito iniimbak kahit saan. Kung wala ito, hindi mabubuksan ang vault — maaalis mo lang ito sa Settings at magsisimula muli.',

  // Vault
  'vault.search': 'Maghanap',
  'vault.lock': 'I-lock',
  'vault.settings': 'Mga setting',
  'vault.add': 'Bagong login',
  'vault.onThisPage': 'Sa {site}',
  'vault.all': 'Lahat ng login',
  'vault.empty': 'Wala pang login',
  'vault.emptyBody':
    'Mag-sign in sa isang site at mag-aalok ang Passhold na i-save ito — o magdagdag ng isa rito, o mag-import mula sa iyong browser.',
  'vault.import': 'I-import ang mga password',
  'vault.noResults': 'Walang tumutugma sa “{query}”.',
  'vault.fill': 'Punan',
  'vault.copyUsername': 'Kopyahin ang username',
  'vault.copyPassword': 'Kopyahin ang password',
  'vault.noUsername': 'Walang username',
  'vault.count': { one: '{count} item', other: '{count} item' },
  'vault.everything': 'Lahat ng item',

  // Asking for a rating, once, after real use
  'rating.title': 'Nakakatulong ba sa iyo ang Passhold?',
  'rating.body': 'Ang rating sa store ay tumutulong sa ibang tao na mahanap ito.',
  'rating.rate': 'I-rate ito',
  'rating.later': 'Hindi ngayon',

  // What a list shows, and what can be added
  'kinds.label': 'Ipakita',
  'kinds.all': 'Lahat',
  'kinds.logins': 'Mga login',
  'kinds.cards': 'Mga card',
  'kinds.addresses': 'Mga address',
  'kinds.notes': 'Mga note',
  'kinds.noLogins': 'Wala pang login.',
  'kinds.noCards':
    'Wala pang card. Magdagdag ng isa gamit ang + sa itaas, at pupunan ito ng Passhold sa checkout kapag pinili mo ito.',
  'kinds.noAddresses':
    'Wala pang address. Magdagdag ng isa gamit ang + sa itaas, at pupunan ito ng Passhold kapag may form na humihingi nito.',
  'kinds.noNotes':
    'Wala pang note. Iniimbak ng note ang hindi login — password ng Wi-Fi, license key — na naka-encrypt kasama ng iba.',
  'add.menu': 'Magdagdag',
  'add.login': 'Login',
  'add.card': 'Card',
  'add.address': 'Address',
  'add.note': 'Note',
  'place.label': 'Mga vault',
  'place.mine': 'Akin',
  'place.of': '{vault}, ibinahagi sa {family}',
  'move.to': 'Ilipat sa {vault}',
  'move.confirm':
    'Makikita ng lahat sa {family} ito sa {vault}, at maaari nila itong baguhin. Aalis ito sa sarili mong vault; mananatili sa dating lugar ang mga naunang password nito.',
  'move.do': 'Ilipat',
  'family.unlockTitle': 'Buksan ang shared vault ng {family} sa browser na ito',
  'family.unlockBody':
    'Kailangan ng Passhold ang password ng iyong Keyrook account nang isang beses, para dalhin ang iyong key sa pamilya sa browser na ito. Hindi ito ipinapadala kahit saan.',
  'family.unlockOnPage':
    'Buksan ang “Family” page sa account.keyrook.com, at ibigay doon ang iyong key sa pamilya sa Passhold.',
  'family.password': 'Password ng Keyrook account',
  'family.unlock': 'Buksan',
  'family.openPage': 'Buksan ang “Family” page',
  'family.keyChanged': 'Nagbago ang key ni {who} sa {family}',
  'family.newSender': 'Ang key ng {family} ay galing kay {who}, na hindi pa kilala ng browser na ito',
  'family.keyChangedBody':
    'Wala munang kukunin ang Passhold mula sa kanila hangga’t hindi kayo nagkukumpara ng code. Tawagan o puntahan sila: pinipili nilang magkumpara ng code sa tabi ng pangalan mo sa “Family” page ng account.keyrook.com.',
  'family.showCode': 'Ipakita ang code',
  'family.codeIs': 'Ang iyong code',
  'family.match': 'Magkapareho ang mga code',
  'family.differ': 'Magkaiba ang mga code',
  'family.differed':
    'Huwag silang pagkatiwalaan. Sabihin sa isang organizer ng iyong pamilya; wala munang kukunin ang Passhold mula sa kanila.',
  'family.someone': 'May isang tao',
  'family.waiting':
    'Kailangan pang kumpirmahin ka ng isang organizer ng {family}. Mabubuksan dito ang ibinabahagi nito kapag nagawa na nila iyon.',
  'family.rotate':
    'May umalis sa {family}, at hindi pa napapalitan ng Passhold ang lahat ng key nito: naghihintay sa browser na ito ang anumang binabago sa shared vault nito. Kung magpapatuloy ito, palitan ang mga ito sa “Family” page.',
  'family.rotateCompare':
    'May umalis sa {family}. Bibigyan ng Passhold ng bagong key ang lahat kapag naikumpara mo na ang code sa itaas; hanggang doon, naghihintay sa browser na ito ang anumang binabago sa shared vault nito.',
  'family.rotateWait':
    'May umalis sa {family}. Naghihintay sa browser na ito ang anumang babaguhin mo sa shared vault nito hanggang palitan ng Passhold ng isang organizer ang mga key nito, na ginagawa nito habang nagsi-sync, para hindi ito mabasa ng umalis.',
  'family.left': 'Hindi na kasama sa {family}: {who}',
  'family.leftBody':
    'Hindi malalaman ng Passhold kung bakit sila umalis. Kung hindi mo ito inaasahan, tanungin sila o ang isang organizer ng iyong pamilya.',
  'family.title': 'Pamilya',
  'family.description':
    'Sino ang nasa iyong pamilya, at ang mga vault na ibinabahagi nito. Pinamamahalaan ang pamilya sa “Family” page ng account.keyrook.com: pag-imbita, pag-alis ng isang tao, pagpalit ng mga key.',
  'family.none':
    'Wala sa anumang pamilya ang account na ito. Ginagawa ang mga pamilya sa “Family” page ng account.keyrook.com.',
  'family.youOrganise': 'Isa ka sa mga organizer nito.',
  'family.youMember': 'Isa ka sa mga miyembro nito.',
  'family.you': '(ikaw)',
  'family.organiser': 'Organizer',
  'family.notCompared': 'Pinapasok nang walang pagkukumpara ng code',
  'family.keyNew': 'Nagbago ang kanilang key: walang kukunin mula sa kanila hangga’t hindi ka nagkukumpara ng code',
  'family.membersLater': 'Lalabas dito kung sino ang kasama kapag nabuksan ito sa browser na ito.',
  'family.sharedVaults': 'Mga shared vault',
  'family.vaultWaits': 'Naghihintay ang anumang binabago rito hanggang magpalit ng key ang isang organizer',

  // Cards, addresses and notes
  'wallet.updated': 'Binago noong {date}',
  'wallet.copyField': 'Kopyahin ang {field}',
  'card.untitled': 'Card',
  'card.newTitle': 'Bagong card',
  'card.editTitle': 'I-edit ang card',
  'card.titleHint': 'Kung iiwanang walang laman, pangangalanan ito ayon sa network at huling apat na digit nito.',
  'card.number': 'Numero ng card',
  'card.numberCheck': 'Hindi tama ang kabuuan ng numerong ito: suriin ang bawat digit.',
  'card.holder': 'Pangalan sa card',
  'card.expiry': 'Mag-e-expire',
  'card.month': 'Buwan',
  'card.year': 'Taon',
  'card.code': 'Security code',
  'card.empty': 'Maglagay ng numero ng card o pangalan.',
  'card.expired': 'Expired na ang card na ito.',
  'card.expiredOn': 'expired noong {expiry}',
  'card.copyNumber': 'Kopyahin ang numero ng card',
  'card.copyExpiry': 'Kopyahin ang petsa ng expiry',
  'address.untitled': 'Address',
  'address.newTitle': 'Bagong address',
  'address.editTitle': 'I-edit ang address',
  'address.titleHint': 'Bahay, Trabaho… Kung iiwanang walang laman, pangangalanan ito ayon sa pangalang nasa loob.',
  'address.name': 'Buong pangalan',
  'address.organization': 'Kumpanya',
  'address.street': 'Address sa kalye',
  'address.city': 'Lungsod',
  'address.region': 'Estado o probinsya',
  'address.postalCode': 'Postal code',
  'address.country': 'Bansa',
  'address.chooseCountry': 'Pumili ng bansa',
  'address.phone': 'Telepono',
  'address.email': 'Email',
  'address.address': 'Address',
  'address.empty': 'Maglagay ng pangalan, o bahagi ng address.',
  'note.untitled': 'Note na walang pamagat',
  'note.newTitle': 'Bagong note',
  'note.editTitle': 'I-edit ang note',
  'note.title': 'Pamagat',
  'note.text': 'Note',
  'note.empty': 'Maglagay ng pamagat, o magsulat ng kahit ano.',
  'note.edited': 'In-edit noong {date}',

  // Pending save, in the popup
  'pending.saveTitle': 'I-save ang login na ito?',
  'pending.updateTitle': 'I-update ang password?',
  'pending.lockedTitle': 'I-save ang login na kakagamit mo lang?',
  'pending.body': '{username} sa {site}',
  'pending.bodyNoUser': 'Isang password para sa {site}',
  'pending.save': 'I-save',
  'pending.update': 'I-update',
  'pending.never': 'Hindi kailanman para sa site na ito',

  // Item
  'item.username': 'Username',
  'item.password': 'Password',
  'item.website': 'Website',
  'item.websites': 'Mga website',
  'item.notes': 'Mga note',
  'item.favorite': 'Paborito',
  'item.unfavorite': 'Alisin sa mga paborito',
  'item.addFavorite': 'Idagdag sa mga paborito',
  'item.trash': 'Ilipat sa basurahan',
  'item.updated': 'Nabago ang password noong {date}',
  'item.history': 'Mga naunang password',
  'item.weak': 'Mahina ang password na ito: hindi ito matagal hulaan.',
  'item.reused': {
    one: 'Ginagamit din ang password na ito sa {count} pang login. Kapag tinagas ng isang site, parehong bukas ang mga ito.',
    other: 'Ginagamit din ang password na ito sa {count} pang login. Kapag tinagas ng isang site, bukas lahat ng ito.',
  },
  'item.changePassword': 'Palitan ito sa site',
  'item.openSite': 'Buksan ang {site}',
  'item.passkey': 'Passkey',
  'item.passkeyBody': 'Para sa {site}, na-save noong {date}',

  // Edit
  'edit.newTitle': 'Bagong login',
  'edit.editTitle': 'I-edit ang login',
  'edit.title': 'Pangalan',
  'edit.titleHint': 'Kung iiwanang walang laman, pangangalanan ito ayon sa website.',
  'edit.username': 'Username o email',
  'edit.password': 'Password',
  'edit.generate': 'Gumawa',
  'edit.websites': 'Mga website',
  'edit.websitesHint': 'Isa kada linya. Iaalok ng Passhold ang login na ito sa mga website na ito.',
  'edit.notes': 'Mga note',
  'edit.empty': 'Maglagay ng pangalan, username, o password.',

  // Fields of an item's own, and folders
  'fields.title': 'Sariling field',
  'fields.add': 'Magdagdag ng field',
  'fields.name': 'Pangalan ng field',
  'fields.value': 'Halaga',
  'fields.hidden': 'Itago tulad ng password',
  'fields.remove': 'Alisin ang field na ito',
  'fields.unnamed': 'Field',
  'fields.copy': 'Kopyahin ang {name}',
  'folders.label': 'Folder',
  'folders.placeholder': 'Walang folder',
  'folders.choose': 'Mga umiiral na folder',
  'folders.hint': 'Panatilihing magkakasama ang mga bagay — Trabaho, Pamilya, Bangko — at magpakita ng isang folder sa isang pagkakataon.',
  'folders.all': 'Lahat ng folder',
  'folders.none': 'Walang folder',
  'folders.count': { one: '{count} item', other: '{count} item' },
  'folders.nothingHere': 'Walang ganitong uri sa folder na ito.',
  'folders.rename': 'Palitan ang pangalan',
  'folders.renameTo': 'Bagong pangalan para sa folder',
  'folders.remove': 'Alisin ang folder',
  'folders.removeHint': 'Mananatili ang laman nito, nang walang folder.',

  // Generator
  'generator.length': 'Haba',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'Iwasan ang magkakahawig (I l 1 O 0)',
  'generator.again': 'Iba pa',
  'generator.use': 'Gamitin ang password na ito',
  'generator.bits': '{bits} bit',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Naka-lock ang Passhold.',
  'menu.unlock': 'I-unlock ang Passhold',
  'menu.unlockHint': 'I-click ang Passhold sa toolbar para mag-unlock, saka bumalik dito.',
  'menu.none': 'Walang naka-save na login para sa {site}.',
  'menu.uninitialized': 'I-set up muna ang Passhold: i-click ito sa toolbar.',
  'menu.suggest': 'Gumamit ng malakas na password',
  'menu.suggestBody': 'Bagong password, pinunan para sa iyo. Mag-aalok ang Passhold na i-save ito kapag naipadala na ang form.',
  'menu.fillFor': 'Punan sa {site}',
  'menu.hidden': 'May tumatakip sa Passhold sa pahinang ito, kaya hindi ito pupunan.',
  'menu.passkey': 'Passkey · {username}',
  'menu.noCards': 'Wala pang card sa Passhold. Magdagdag ng isa mula sa Passhold sa toolbar.',
  'menu.noAddresses': 'Wala pang address sa Passhold. Magdagdag ng isa mula sa Passhold sa toolbar.',
  'menu.cardInsecure':
    'Hindi secure ang pahinang ito (plain http), kaya hindi pupunan ng Passhold ang card dito: maaaring mabasa ito ng sinuman sa daan.',

  // A website's passkey
  'passkey.saveTitle': 'I-save ang passkey para sa {site}?',
  'passkey.save': 'I-save ang passkey',
  'passkey.saveElsewhere': 'I-save sa ibang lugar',
  'passkey.useElsewhere': 'Gumamit ng passkey mula sa ibang lugar',
  'passkey.existsTitle': 'Nasa Passhold na ang passkey na ito',
  'passkey.ok': 'OK',
  'passkey.signInTitle': 'Mag-sign in sa {site}',
  'passkey.signInBody': 'Gamit ang passkey na naka-save sa Passhold',
  'passkey.none': 'Walang passkey para sa {site} sa Passhold.',
  'passkey.hidden': 'May tumatakip sa Passhold sa pahinang ito, kaya hindi ito sasagot.',

  // Save prompt on a page
  'prompt.save': 'I-save ang login sa Passhold?',
  'prompt.update': 'I-update ang password sa Passhold?',
  'prompt.saveButton': 'I-save',
  'prompt.updateButton': 'I-update',
  'prompt.never': 'Hindi kailanman para sa site na ito',
  'prompt.saved': 'Na-save sa Passhold.',
  'prompt.locked': 'I-click ang Passhold sa toolbar at i-unlock ito — doon ka nito tatanungin kung i-save.',
  'prompt.saveCard': 'I-save ang card sa Passhold?',
  'prompt.updateCard': 'I-update ang card sa Passhold?',
  'prompt.saveAddress': 'I-save ang address sa Passhold?',
  'prompt.saveCheckout': 'I-save ang card at address sa Passhold?',

  // Settings
  'settings.title': 'Mga setting',
  'settings.cannotOpen': 'Hindi mabuksan? Alisin ang vault sa browser na ito',
  'settings.encryptedHere': 'Naka-encrypt sa device na ito',
  'settings.source': 'Open source sa GitHub',

  'nav.passwords': 'Mga password',
  'nav.accountSync': 'Account at sync',
  'nav.family': 'Pamilya',
  'nav.account': 'Keyrook account',
  'nav.backup': 'Backup at import',
  'nav.security': 'Seguridad',
  'nav.general': 'Pangkalahatan',
  'nav.needsAttention': 'kailangan ng atensyon',

  'account.description':
    'Mag-sign in, at susundan ng iyong mga login ang bawat browser kung saan ka nag-sa-sign in sa Passhold. Naka-encrypt muna sila sa device na ito: hindi sila mababasa ng server ng Keyrook, o kung para saang site ang mga ito.',
  'account.email': 'Email',
  'account.password': 'Password ng Keyrook account',
  'account.signIn': 'Mag-sign in',
  'account.signingIn': 'Nagsa-sign in…',
  'account.note':
    'Ang parehong account na nasa Keyrook Authenticator. Ang account na ginawa gamit ang Google o GitHub ay nagsa-sign in gamit ang sarili nitong button.',
  'account.haveOne': 'May account na ako',
  'account.create': 'Gumawa ng account',
  'account.sendCode': 'Ipadala sa akin ang code sa email',
  'account.createNote':
    'Magpapadala ang Keyrook ng anim na digit na code sa email para patunayang sa iyo ang address. Kung may account na ang address, sasabihin iyon ng email sa halip: mag-sign in gamit iyon.',
  'account.codeSent': 'Papunta na sa {email} ang code. Gumagana ito sa loob ng labinlimang minuto.',
  'account.code': 'Anim na digit na code',
  'account.newPassword': 'Password ng Keyrook account',
  'account.passwordNote':
    'Binubuksan ng password na ito ang iyong Keyrook account sa anumang browser, para sa Passhold at Keyrook Authenticator. Hindi ito nakikita ng Keyrook at hindi nito ito maire-reset para sa iyo; ang recovery key na makukuha mo susunod ang paraan para magtakda ng bago.',
  'account.createButton': 'Gumawa ng account',
  'account.creating': 'Ginagawa…',
  'account.otherEmail': 'Gumamit ng ibang address',
  'account.signedInAs': 'Naka-sign in bilang {email}',
  'account.signedInAsNamed': 'Naka-sign in bilang {name} ({email})',
  'account.synced': 'Na-sync noong {date}',
  'account.notSynced': 'Hindi pa na-sync',
  'account.syncNow': 'I-sync ngayon',

  // The account, at the foot of the popup
  'accountBar.synced': 'Na-sync {time}',
  'accountBar.justNow': 'ngayon lang',
  'accountBar.syncing': 'Nagsi-sync…',
  'accountBar.signedOut': 'Naka-sign out — mag-sign in muli para mag-sync',
  'accountBar.startedOver': 'Nagsimulang muli ang account — mag-sign in muli',
  'accountBar.removed': 'Tinanggal sa account — mag-sign in muli para mag-sync',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'Inalis sa iyong Keyrook account',
  'removed.body':
    'Noong {date}, inalis ang browser na ito sa iyong Keyrook account, kaya inalis ng Passhold ang mga login, card, address at note ng account dito at pinalabas ito. Ang mga idinagdag o binago dito na hindi pa naipapadala ay nanatili bilang sariling data ng browser na ito. Mag-sign in muli para maibalik ang iba.',

  // Passwords, in Settings
  'passwords.description':
    'Bawat login, passkey, card, address at note sa Passhold. Pumili ng isa para makita ito, makakopya mula rito, o mabago ito.',
  'passwords.all': 'Lahat',
  'passwords.attention': 'Kailangan ng atensyon',
  'passwords.weak': 'Mahina',
  'passwords.reused': 'Ginamit nang paulit-ulit',
  'account.syncDone': 'Na-sync.',
  'account.removed': {
    one: '{count} item na permanenteng binura sa ibang device ang inalis dito.',
    other: '{count} item na permanenteng binura sa ibang device ang inalis dito.',
  },
  'account.skipped': {
    one: '{count} record ang hindi mabuksan at hinayaang hindi ginalaw.',
    other: '{count} record ang hindi mabuksan at hinayaang hindi ginalaw.',
  },
  'account.manage': 'Pamahalaan ang iyong Keyrook account',
  'account.manageBody':
    'Palitan ang password, gumawa ng bagong recovery key o simulan muli ang account sa account.keyrook.com — para sa Passhold at Keyrook Authenticator.',
  'account.manageBodyProvider':
    'Gumawa ng bagong recovery key o simulan muli ang account sa account.keyrook.com — para sa Passhold at Keyrook Authenticator.',
  'account.manageOpen': 'Buksan',
  'account.signOut': 'Mag-sign out',
  'account.signOutBody':
    'Inaalis ang bawat login sa browser na ito, pagkatapos ng huling sync. Mag-sign in muli at babalik ang mga ito.',
  'account.signOutConfirm':
    'Magsi-sync muli ang Passhold, saka aalisin ang vault sa browser na ito. Walang aalisin kung may login na hindi pa nakakarating sa iyong account.',
  'account.signOutButton': 'Mag-sign out at alisin',
  'account.signedOutByServer': 'Pinalabas ng Keyrook ang browser na ito. Mag-sign in muli para magpatuloy sa pag-sync.',
  'account.startedOver':
    'Nagsimulang muli ang iyong Keyrook account noong {date}, kaya pinalabas ito ng Keyrook sa browser na ito. Mag-sign in gamit ang bago nitong password: ia-upload dito ang mga login gamit ang bagong key ng account.',
  'account.startedOverProvider':
    'Nagsimulang muli ang iyong Keyrook account noong {date}, kaya pinalabas ito ng Keyrook sa browser na ito. Mag-sign in gamit ang Google o GitHub: ia-upload dito ang mga login gamit ang bagong key ng account.',
  'account.forgot': 'Nakalimutan ang password?',
  'account.recoverBody':
    'Magpapadala ang Keyrook ng code sa address ng account; pagkatapos, i-type ito, ang recovery key ng account mula sa sheet na na-save mo noong ginawa ang account, at isang bagong password. Hihingi ng bagong password ang bawat ibang browser at app na naka-sign in sa account.',
  'account.recoveryKey': 'Recovery key ng account',
  'account.recoverPassword': 'Bagong password ng account',
  'account.recoverButton': 'Magtakda ng bagong password',
  'account.recovering': 'Itinatakda…',
  'account.backToSignIn': 'Bumalik sa sign in',
  'startOver.link': 'Nawala rin ang recovery key? Simulan muli ang account',
  'startOver.title': 'Simulan muli ang account',
  'needsRoot.body':
    'Kung mayroon kang recovery key ng account na ibinigay ng Keyrook Authenticator, i-type ito: bubuksan din nito ang Passhold. Kung wala, gagawa ang Passhold ng bagong recovery key para sa account, ipapakita nang isang beses, at titigil sa paggana ang luma.',
  'needsRoot.sheet': 'Recovery key ng account mula sa Keyrook Authenticator (kung mayroon ka nito)',
  'needsRoot.withSheet': 'Gamitin ang key na ito',
  'needsRoot.newSheet': 'Gumawa ng bagong recovery key',
  'startOver.body':
    'Kapag email address na lang ang natitira, maaaring magsimulang muli ang account gamit ang bagong mga key at bagong recovery key. Magkakabisa ito pagkalipas ng isang linggo mula nang hilingin, at hanggang doon, puwedeng kanselahin ito ng alinmang browser na naka-sign in pa sa account — kaya hindi ito magagawa ng taong may email mo lang. Itinatago ng Keyrook ang lahat ng hawak ng account, naka-encrypt, sa loob ng 90 araw: ibabalik ito ng lumang password o lumang recovery key.',
  'startOver.button': 'Simulan muli',
  'startOver.working': 'Sinisimulan muli…',
  'startOver.kitBody':
    'Ang bagong recovery key ng account: gumagana ito kapag nagsimulang muli ang account. Ipinapakita ito ng Passhold ngayon lang, kaya itago ito bago magpatuloy.',
  'startOver.waitTitle': 'Magsisimulang muli ang iyong account sa {date}',
  'startOver.waitBody':
    'Hanggang noon ay walang magbabago, at puwedeng kanselahin ito ng alinmang browser na naka-sign in pa sa account. Magpapadala ang Keyrook ng email sa {email} ngayon, sa araw bago, at kapag nangyari na.',
  'startOver.waitThen':
    'Pagkatapos noon, mag-sign in dito gamit ang bago mong password. Ia-upload ang mga login sa browser na ito gamit ang mga bagong key ng account, at itatago sa loob ng 90 araw ang dating laman nito.',
  'startOver.waitThenProvider':
    'Pagkatapos noon, mag-sign in dito gamit ang Google o GitHub, gaya ng dati. Ia-upload ang mga login sa browser na ito gamit ang mga bagong key ng account, at itatago sa loob ng 90 araw ang dating laman nito.',
  'startOver.understood': 'Sige',
  'startOver.doneTitle': 'Nagsimulang muli ang iyong account',
  'startOver.doneBody':
    'Mag-sign in gamit ang bago mong password: ia-upload ang mga login sa browser na ito gamit ang mga bagong key ng account, at itatago sa loob ng 90 araw ang dating laman nito.',
  'startOver.doneBodyProvider':
    'Mag-sign in gamit ang Google o GitHub, gaya ng dati: ia-upload ang mga login sa browser na ito gamit ang mga bagong key ng account, at itatago sa loob ng 90 araw ang dating laman nito.',
  'startOverWait.title': 'Magsisimulang muli ang iyong Keyrook account sa {date}',
  'startOverWait.body':
    'Hiniling ito gamit ang code na ipinadala sa iyo ng Keyrook sa email, mula sa device na tinawag ang sarili nitong “{device}”. Kung hindi ikaw ito, maaaring mabasa ng iba ang iyong email: kanselahin ito ngayon, at saka palitan ang password ng iyong email. Kung ikaw ito, iwanan.',
  'startOverWait.bodyNoName':
    'Hiniling ito gamit ang code na ipinadala sa iyo ng Keyrook sa email. Kung hindi ikaw ito, maaaring mabasa ng iba ang iyong email: kanselahin ito ngayon, at saka palitan ang password ng iyong email. Kung ikaw ito, iwanan.',
  'startOverWait.cancel': 'Kanselahin ang pagsisimulang muli',
  'kept.title': {
    one: 'Itinago mula bago nagsimulang muli ang account: {count} item',
    other: 'Itinago mula bago nagsimulang muli ang account: {count} item',
  },
  'kept.body': 'Hanggang {date}. Ibabalik sila sa Passhold ng lumang password ng account o lumang recovery key.',
  'kept.open': 'Ibalik',
  'kept.secret': 'Lumang password ng account o lumang recovery key',
  'kept.done': { one: '{count} item ang naibalik.', other: '{count} item ang naibalik.' },
  'kept.nothingNew': 'Naroon na ang lahat ng itinago.',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': 'Magpatuloy gamit ang {provider}',
  'provider.passwordTitle': 'May password ang Keyrook account na ito',
  'provider.passwordBody':
    'Nag-sign in ka gamit ang {provider} bilang {email}. Ang password ng account ang nagbubukas ng Passhold dito: i-type ito nang isang beses.',
  'provider.openAccountPage': 'Buksan ang account.keyrook.com',
  'secondStep.title': 'Two-step sign-in',
  'secondStep.body':
    'Ilagay ang 6-digit na code na ipinapakita ng iyong authenticator app para sa Keyrook. Nawala ang app? I-type ang recovery key ng iyong account sa halip.',
  'secondStep.ownerBody':
    'Humihingi ang iyong account ng ikalawang hakbang para rito: ang code na ipinapakita ng iyong authenticator app, o ang recovery key ng iyong account.',
  'secondStep.field': 'Code, o recovery key',
  'secondStep.continue': 'Magpatuloy',
  'secondStep.passkey': 'Gumamit na lang ng passkey',
  'secondStep.nextBody':
    'Humihingi rin ng code ang pagbibigay ng key sa account, at isang beses lang gumagana ang bawat code. Hintayin na magpakita ng bago ang iyong authenticator app, saka ilagay ito — o ang recovery key ng account.',
  'provider.or': 'o',
  'provider.signedInWith': 'Naka-sign in gamit ang {provider} bilang {email}',
  'provider.signedInWithNamed': 'Naka-sign in gamit ang {provider} bilang {name} ({email})',
  'provider.newTitle': 'Gumawa ng iyong Keyrook account',
  'provider.newBody':
    'Nagsa-sign in ka gamit ang {provider} bilang {email}. Walang password ang account: pinapasok ka ng {provider}. Sa ibang computer, papapasukin ka ng browser na naka-sign in na — o ng recovery key na makukuha mo susunod.',
  'provider.joinTitle': 'Papasukin ang browser na ito',
  'provider.joinBody':
    'Naka-sign in dito ang {email}, pero nasa iba mong computer ang key na nagbubukas ng iyong mga login. Buksan ang Passhold sa isa sa mga iyon — Settings, Account at sync — at papasukin ang browser na ito.',
  'provider.waiting': 'Naghihintay sa ibang browser…',
  'provider.compare': 'Nagpapakita ng code ang ibang browser. Papasukin lang ito roon kung ito ang browser na ito:',
  'provider.ended': 'Natapos ang request bago ka papasukin ng ibang browser.',
  'provider.askAgain': 'Magtanong muli',
  'provider.useKit': 'Gamitin na lang ang recovery key',
  'provider.useThisKey': 'Gamitin ang key na ito',
  'provider.needsRoot':
    'Ginawa ang {email} sa Keyrook Authenticator bago magkaroon ng sariling key ang bawat app ng Keyrook. Maaaring bigyan ito ng Passhold ngayon, kapag kinumpirma mo muli gamit ang {provider}; walang mababago sa Authenticator.',
  'provider.confirmWith': 'Kumpirmahin gamit ang {provider}',
  'provider.noKeyYet':
    'Hindi pa naka-sign in ang Passhold sa {email} kahit saan, kaya walang ibang browser na makapapasok sa isang ito. Ang recovery key ng account ang magbubukas nito.',
  'passkey.onLabel': 'Bumubukas ang mga bagong computer gamit ang iyong passkey',
  'passkey.offLabel': 'Walang passkey para sa mga bagong computer',
  'passkey.body':
    'Sa bagong computer: {provider}, saka ang iyong passkey — at naroon ang bawat login. Itinatago ng Google Password Manager, nasa bawat Chrome na pinapasukan mo ang passkey.',
  'passkey.bodyEdge':
    'Sa bagong computer: {provider}, saka ang iyong passkey — at naroon ang bawat login. Kapag naka-save sa lugar na nagsi-sync ito, nasa iba mo ring device ang passkey.',
  'passkey.turnOn': 'I-on',
  'passkey.turnOff': 'I-off',
  'passkey.joinTitle': 'Buksan gamit ang iyong passkey',
  'passkey.joinBody': 'May passkey para sa mga bagong computer ang {email}. Kumpirmahin gamit ito, at ibababa ang iyong mga login.',
  'passkey.use': 'Gamitin ang passkey',
  'passkey.otherWays': 'Ibang paraan para pumasok',
  'pairing.asking': 'Humihingi ang {device} na papasukin sa iyong account.',
  'pairing.start': 'Papasukin…',
  'pairing.notMe': 'Hindi ako',
  'pairing.compare': 'Papasukin lang ito kung ipinapakita ng bagong browser ang parehong code na ito:',
  'pairing.match': 'Magkapareho ang code — papasukin',
  'pairing.differ': 'Magkaiba ang mga code',

  'accountKit.title': 'I-save ang recovery key ng account',
  'accountKit.body':
    'Kung makalimutan mo ang password ng iyong Keyrook account, magtatakda ng bago ang key na ito — para sa Passhold at Keyrook Authenticator. Hindi ito nakikita ng Keyrook, kaya ito lang ang paraan. Makikita mo ulit ito sa Settings; itago rin ito sa ibang lugar.',
  'accountKit.fileTitle': 'Recovery key ng Keyrook account',
  'accountKit.fileBody':
    'Kung makalimutan mo ang password ng iyong Keyrook account, magtatakda ng bago ang key na ito: sa Passhold, Settings → Account at sync → “Nakalimutan ang password?”. Ang sinumang may ito at ng iyong email address ay makagagawa ng pareho, kaya itago ito nang ligtas at hindi sa computer na ito.',
  'accountKit.bodyNoPassword':
    'Walang password ang iyong account: papapasukin ng browser na naka-sign in na ang bago. Kung wala nang natitira, ang key na ito ang papapasok — para sa Passhold at Keyrook Authenticator. Makikita mo ulit ito sa Settings; itago rin ito sa ibang lugar.',
  'accountKit.fileBodyNoPassword':
    'Kung wala nang computer na naka-sign in sa iyong Keyrook account, papapasukin ng key na ito ang bago: mag-sign in gamit ang Google o GitHub, saka piliin ang “Gamitin na lang ang recovery key”. Ang sinumang may ito at kayang mag-sign in bilang ikaw ay makagagawa ng pareho, kaya itago ito nang ligtas at hindi sa computer na ito.',
  'accountKit.whenTitleNoPassword': 'Kapag walang computer na naka-sign in',
  'accountKit.inPassholdNoPassword':
    'Sa Passhold: mag-sign in gamit ang Google o GitHub, piliin ang “Gamitin na lang ang recovery key”, at i-type ang key na ito.',
  'accountKit.keepNoPassword':
    'Itago ang sheet na ito sa ligtas na lugar, malayo sa iyong computer. Ang sinumang may ito at kayang mag-sign in sa iyong Google o GitHub account ay mabubuksan ang iyong Keyrook account.',
  'accountKit.rowBodyNoPassword': 'Pinapapasok ang bagong computer kapag wala nang iba pang puwedeng gumawa nito.',
  'accountKit.sheetTitle': 'Recovery kit ng Keyrook account',
  'accountKit.whenTitle': 'Kapag nakalimutan ang password ng account',
  'accountKit.inPasshold':
    'Sa Passhold: Settings → Account at sync → “Nakalimutan ang password?”, saka ang iyong email address, ang code na ini-email ng Keyrook, ang key na ito, at isang bagong password.',
  'accountKit.inAuthenticator':
    'Tinatanggap ng Keyrook Authenticator ang parehong key: “Nakalimutan ang password?” kung saan ka nito hinihinging mag-sign in.',
  'accountKit.keep':
    'Itago ang sheet na ito sa ligtas na lugar, malayo sa iyong computer. Ang sinumang may ito at ng iyong email inbox ay makapagtatakda ng bagong password para sa account.',
  'accountKit.pending': 'Hindi pa naitatago ang recovery key ng account',
  'accountKit.keptState': 'Naitago na ang recovery key ng account',
  'accountKit.elsewhere': 'Ginawa sa ibang lugar ang recovery key ng account',
  'accountKit.none': 'Walang recovery key ang account',
  'accountKit.rowBody': 'Nagtatakda ng bagong password ng account kapag nakalimutan. Pinipigilan ng bagong key ang luma sa bawat app.',
  'accountKit.elsewhereBody':
    'Ginawa sa account.keyrook.com, sa Keyrook Authenticator o sa ibang browser: nasa sheet na na-save noon ang key nito. Ang paggawa ng isa rito ay pipigil sa isang iyon.',
  'accountKit.noneBody':
    'Kung wala nito, hindi mare-reset ang nakalimutang password ng account, at hindi mabubuksan ang nakatago sa Keyrook. Mananatili pa rin ang mga login sa browser na ito.',
  'accountKit.make': 'Gumawa ng isa',
  'accountKit.apart':
    'Itago ito nang hiwalay sa iyong email: ang sinumang may key na ito at kayang basahin ang iyong email ay makapagtatakda ng bagong password at mabubuksan ang iyong mga login. Huwag mong i-email ito sa sarili mo, o itago sa cloud drive ng email na iyon.',
  'accountKit.apartNoPassword':
    'Itago ito nang hiwalay sa Google o GitHub account na ginagamit mong mag-sign in: ang sinumang may key na ito at kayang mag-sign in doon bilang ikaw ay mabubuksan ang iyong mga login. Huwag mong i-email ito sa sarili mo, o itago sa cloud drive ng account na iyon.',
  'accountKit.unchecked': 'Hindi pa nasusuri ang recovery key ng account',
  'accountKit.uncheckedBody':
    'May recovery key ang iyong account, ginawa sa account.keyrook.com o sa ibang app. I-type ito nang isang beses: susuriin ng Passhold kung bubuksan nito ang iyong account, at itatago ito para maipakita sa iyo muli.',
  'accountKit.typeIt': 'I-type ito',
  'accountKit.checked': 'Binubuksan nito ang iyong account. Itinatago ito ngayon ng Passhold, para maipakita sa iyo muli dito.',
  'accountKit.draftBody':
    'Ang bagong recovery key ng iyong account. Hindi pa ito gumagana: kapag na-save mo na at na-type mo muli, magtatakda ng bago ang password ng iyong account, at titigil sa paggana ang luma.',
  'accountKit.setTitle': 'Itakda ang bago mong recovery key',
  'accountKit.setBody': 'I-type ang password ng iyong Keyrook account. Hanggang doon, gumagana pa ang lumang recovery key mo, at hindi pa ang bago.',
  'accountKit.set': 'Itakda',
  'checkup.clear': 'Walang aayusin',
  'checkup.clearBody': 'Walang mahina o paulit-ulit na password, at napapanahon ang iyong backup.',
  'checkup.issues': { one: '{count} bagay na titingnan', other: '{count} bagay na titingnan' },
  'checkup.issuesBody': 'Ipinapaliwanag ng bawat isa sa ibaba kung bakit ito mahalaga at paano ito aayusin.',
  'checkup.backup': 'Backup',
  'checkup.access': 'Pagpasok',
  'checkup.recoveryPending':
    'Hindi kailanman nakumpirmang naitago ang recovery key na ginawa para sa vault na ito, at ito ang tanging paraan para makapasok kapag tumigil sa paggana ang {method}. Gumawa ng bago at itago ito.',
  'checkup.deviceMissing':
    'Walang pangunahing password ang vault na ito, kaya kapag walang {method} dito, hihingin ng bawat unlock ang recovery key.',
  'checkup.lastBackup': 'Huling backup {date}',
  'checkup.backupNever':
    'Kapag nawala ang browser na ito, mawawala rin ang iyong mga login. Isang naka-encrypt na file ang backup na itatago sa ibang lugar.',
  'checkup.backupDue': 'Nagbago na ang iyong vault mula noon. Gumawa ng bagong backup para maglaman ito ng lahat.',
  'checkup.backUp': 'Mag-backup ngayon',
  'checkup.weak': { one: '{count} mahinang password', other: '{count} mahinang password' },
  'checkup.weakBody':
    'Maikli o sobrang simple para mahulaan. Palitan ang bawat isa sa site nito; magmumungkahi ang Passhold ng malakas sa form at mag-aalok na i-save ito.',
  'checkup.weakNone': 'Wala.',
  'checkup.reused': {
    one: '{count} password ang ginamit nang higit sa isang beses',
    other: '{count} password ang ginamit nang higit sa isang beses',
  },
  'checkup.reusedBody':
    'Kapag tinagas ng isang site ang password, sinusubukan ito ng mga tao sa iba pang lugar. Bigyan ang bawat login ng sarili nitong password.',
  'checkup.reusedNone': 'Wala: bawat login ay may sariling password.',
  'checkup.sharedBy': { one: 'Ibinahagi sa {count} login', other: 'Ibinahagi sa {count} login' },
  'checkup.change': 'Palitan',
  'checkup.limits':
    'Hindi sinusuri ng Passhold kung lumitaw ang isang password sa data breach: kailangan nitong magtanong sa server, at walang tinatanong ang Passhold. Hindi rin ito nagpapaalala tungkol sa mga lumang password — hindi nauubos ang malakas at natatanging password.',

  'backup.description': 'Magtago ng naka-encrypt na kopya, magbalik ng isa, o maglipat ng mga login papasok at palabas.',
  'backup.backupRow': 'Ang buong vault mo sa isang naka-encrypt na file, sa ilalim ng iyong pangunahing password.',
  'backup.restoreRow': 'Idagdag sa vault na ito ang mga login sa isang backup file.',
  'backup.importRow': 'Mula sa ibang browser o password manager, bilang CSV file, o JSON ng Bitwarden.',
  'backup.exportRow': 'Isang CSV file na mababasa ng ibang app. Hindi naka-encrypt.',

  'security.description': 'Paano bumubukas ang Passhold, at kailan ito muling magsasara.',
  'security.locking': 'Pag-lock',
  'security.opensTitle': 'Paano bumubukas ang Passhold',
  'security.opensBody': 'Walang pangunahing password: bubuksan ito ng {method}, at ang recovery key kapag hindi kaya ng {method}.',
  'security.setPassword': 'Gumamit na lang ng pangunahing password',
  'security.setPasswordBody':
    'Bubukas ang Passhold pagkatapos gamit ang password na pipiliin mo, at hindi na ito bubuksan ng recovery key.',
  'security.setPasswordOpen': 'Itakda',
  'security.setPasswordSave': 'Gamitin ang password na ito',
  'security.dropPassword': 'Ihinto ang paggamit ng pangunahing password',
  'security.dropPasswordBody':
    'Buksan gamit ang {method} lang, at magtago ng recovery key para sa araw na hindi ito kaya. Hindi na bubuksan ng pangunahing password ang vault.',
  'security.dropPasswordOpen': 'Lumipat',
  'security.dropPasswordSave': 'Lumipat at ipakita ang recovery key',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'screen lock ng iyong device',
  'device.method.passkey': 'iyong passkey',
  'device.title': 'I-unlock gamit ang {method}',
  'device.description': 'Ang pinakamabilis na paraan para pumasok, at gumagana pa rin pagkatapos mag-restart ng browser.',
  'device.on': 'Naka-on',
  'device.off': 'Naka-off',
  'device.body':
    'Bubuksan ng iyong fingerprint o mukha ang Passhold — o, sa karamihan ng computer, ang sariling password ng computer. Kaya sinumang makaka-unlock ng computer na ito ay makabubukas ng Passhold. Ang nabubuksan nito ay nananatili sa computer na ito, walang silbi kung wala ito.',
  'device.whereMac':
    'Kapag tinanong ka ng Chrome kung saan itatago ang passkey, piliin ang Google Password Manager. Hindi maaaring i-unlock ng passkey sa iyong Chrome profile ang Passhold, at hindi rin ng iCloud Keychain sa bawat Mac.',
  'device.whereMacEdge':
    'Kapag tinanong ka ng Edge kung saan itatago ang passkey, pumili ng lugar na nagsi-sync din nito sa iyong ibang device. Hindi lahat ng lugar ay kayang mag-unlock ng Passhold: kung hindi kaya ng napili mo, sasabihin ito ng Passhold, at walang mababago.',
  'device.unavailable': 'Hindi available dito',
  'device.unavailableBody':
    'Walang nakitang fingerprint, mukha, o screen lock ang browser na ito na magagamit ng Passhold. Gumagana ang PIN saanman.',
  'device.unavailableRecovery':
    'Walang nakitang fingerprint, mukha, o screen lock ang browser na ito na magagamit ng Passhold, kaya dito bubukas ang vault na ito gamit ang recovery key nito. Magtakda ng pangunahing password kung mas gusto mong i-type iyon.',
  'device.opensWith': 'Binubuksan ng {method} ang Passhold',
  'device.notHere': 'Hindi naka-set up ang {method} sa browser na ito',
  'device.isTheWayIn': 'Kapag walang pangunahing password, ganito bumubukas ang Passhold. Para i-off ito, magtakda muna ng pangunahing password.',
  'device.setUpHere': 'Hangga’t hindi naka-set up dito ang {method}, hihingin ng bawat unlock ang recovery key.',
  'device.setUp': 'I-set up',
  'device.turnOff': 'I-off',
  'device.save': 'I-set up ang {method}',
  'keys.title': 'I-unlock gamit ang security key',
  'keys.description': 'Isang USB key na isinasaksak mo: isa pang paraan para pumasok, at gumagana pa rin pagkatapos mag-restart ng browser.',
  'keys.method': 'iyong security key',
  'keys.on': { one: '{count} key ang naka-set up', other: '{count} key ang naka-set up' },
  'keys.off': 'Walang naka-set up na key',
  'keys.body':
    'Isaksak ang key, i-type ang PIN nito at hawakan ito, at bubukas ang Passhold — sa computer na ito lang. Sinumang may hawak ng key at nakaaalam ng PIN nito ay makabubukas ng Passhold dito, kaya itago ito tulad ng susi ng bahay. Kung mawala ito, alisin ito dito: gumagana pa rin ang iba mong paraan para pumasok.',
  'keys.add': 'Magdagdag ng key',
  'keys.save': 'Idagdag ang key na ito',
  'keys.one': 'Security key',
  'keys.added': 'Idinagdag noong {date}',
  'keys.remove': 'Alisin',
  'pin.title': 'I-unlock gamit ang PIN',
  'pinOffer.title': 'Mas mabilis buksan ang Passhold gamit ang PIN',
  'pinOffer.body':
    'Mag-type ng ilang digit sa halip na password tuwing nagla-lock ang Passhold, hanggang magsara ang browser. Pagkatapos mag-restart ng browser, minsan lang ang password.',
  'pinOffer.later': 'Maaari mo itong i-set up o i-off anumang oras sa Settings, Security.',
  'pin.description': 'Para sa maraming beses sa isang araw na nagla-lock ang Passhold habang nasa parehong browser ka.',
  'pin.on': 'Naka-on',
  'pin.off': 'Naka-off',
  'pin.bodyRecovery':
    'Gumagana lang habang bukas ang browser, at limang maling pagsubok lang: pagkatapos noon, o pagkatapos mag-restart, kailangan ang device o ang recovery key. Walang nakaimbak sa disk na nabubuksan ng PIN.',
  'pin.body':
    'Gumagana lang habang bukas ang browser, at limang maling pagsubok lang: pagkatapos noon, o pagkatapos mag-restart, kailangan ang pangunahing password. Walang nakaimbak sa disk na nabubuksan ng PIN.',
  'pin.setUp': 'I-set up ang PIN',
  'pin.change': 'Palitan',
  'pin.turnOff': 'I-off',
  'pin.new': 'PIN, 6 hanggang 12 digit',
  'pin.again': 'I-type muli',
  'pin.save': 'I-save ang PIN',

  'general.description': 'Paano kumilos ang Passhold sa mga website, at kung ano ang itsura nito.',
  'general.filling': 'Pagpuno at pag-save',
  'general.appearance': 'Wika at itsura',
  'settings.autoSuggest': 'Ipakita ang mga mungkahi kapag nag-click ka ng field ng sign-in, card, o address',
  'settings.autoSuggestBody':
    'Ang iyong mga login para sa site, malakas na password sa sign-up form, ang iyong mga card at address sa checkout. Walang pupunan hangga’t hindi ka pumipili.',

  'trash.description': 'Maghihintay dito ang mga login, card, address, at note hanggang ibalik mo ang mga ito o permanenteng burahin.',
  'trash.sharedDescription':
    'Ibinabahagi sa pamilya: sinumang nasa loob nito ay puwedeng magbalik ng mga ito. Kapag permanenteng binura, mawawala na ang mga ito sa lahat.',
  'trash.sharedMember':
    'Ibinabahagi sa pamilya: puwede mong ibalik ang mga ito. Tanging organizer ng pamilya lang ang permanenteng bumubura nito.',
  'settings.autoLock': 'I-lock pagkalipas ng',
  'settings.autoLock.never': 'Kapag isinara lang ang browser',
  'settings.autoLock.minutes': { one: '{count} minuto', other: '{count} minuto' },
  'settings.autoLock.hours': { one: '{count} oras', other: '{count} oras' },
  'settings.lockWithSystem': 'I-lock kapag nag-lock o natulog ang computer',
  'settings.clipboard': 'I-clear ang mga kinopyang password pagkalipas ng',
  'settings.clipboard.never': 'Hindi kailanman',
  'settings.clipboard.seconds': { one: '{count} segundo', other: '{count} segundo' },
  'settings.clipboard.minutes': { one: '{count} minuto', other: '{count} minuto' },
  'settings.inlineButton': 'Ipakita ang button ng Passhold sa mga field ng sign-in, card, at address',
  'settings.offerToSave': 'Mag-alok na i-save ang mga login kapag nag-sign in ka',
  'settings.offerToSaveCards': 'Mag-alok na i-save ang mga card at address kapag nagbabayad ka',
  'settings.offerToSaveCardsBody':
    'Card lang mula sa secure (https) na pahina, at kung tama lang ang kabuuan ng numero nito. Ipinapakita ito sa huling apat na digit, hindi kailanman sa numero o code nito.',
  'settings.passkeys': 'I-save at gamitin ang mga passkey',
  'settings.passkeysBody':
    'Kapag nag-alok ang isang site ng passkey, itinatago ito ng Passhold kasama ng iyong mga login at nagsa-sign in ka gamit ito. Kapag naka-off, iniiwan ang mga passkey sa browser.',
  'settings.language': 'Wika',
  'settings.language.auto': 'Gaya ng browser',
  'settings.theme': 'Itsura',
  'settings.theme.system': 'Gaya ng system',
  'settings.theme.light': 'Maliwanag',
  'settings.theme.dark': 'Madilim',

  'settings.security': 'Pangunahing password',
  'settings.securityBody': 'Kapag pinalitan ito, muling ila-lock ang susi ng iyong vault; mananatili ang iyong mga login.',
  'settings.current': 'Kasalukuyang pangunahing password',
  'settings.new': 'Bagong pangunahing password',
  'settings.confirm': 'I-type muli ang bago',
  'settings.change': 'Palitan ang pangunahing password',
  'settings.changeOpen': 'Palitan',
  'settings.changed': 'Napalitan ang pangunahing password.',

  'settings.backup': 'Mag-backup',
  'settings.backupBody':
    'Ang buong vault mo sa isang naka-encrypt na file. Itago ito sa ibang lugar, hindi sa computer na ito — USB drive, cloud storage mo — para hindi mawala ang iyong mga login kapag nawala ang browser na ito. Bubukas lang ito gamit ang pangunahing password na mayroon ka noong ginawa ito.',
  'settings.backupBodyRecovery':
    'Ang buong vault mo sa isang naka-encrypt na file. Itago ito sa ibang lugar, hindi sa computer na ito — USB drive, cloud storage mo — para hindi mawala ang iyong mga login kapag nawala ang browser na ito. Bubukas ito gamit ang recovery key mo.',
  'settings.backupLast': 'Huling backup: {date}',
  'settings.backupNever': 'Wala pang backup.',
  'settings.backupButton': 'I-download ang backup',
  'settings.backupDone': 'Na-save sa iyong mga download. Ilipat na ito sa ibang lugar, hindi sa computer na ito.',

  'settings.restoreBackup': 'Ibalik mula sa backup',
  'settings.restoreBodyNew':
    'Wala pang vault sa browser na ito. Ibalik ang sa iyo mula sa backup file — bubukas ito gamit ang pangunahing password na ginamit sa paggawa ng backup — o gumawa ng bago mula sa button ng Passhold sa toolbar.',
  'settings.restoreBodyMerge':
    'Idinaragdag sa vault na ito ang laman ng backup. Walang mabubura rito: kung pareho ang login sa dalawa, mananatili ang mas bagong edit at mapupunta sa history nito ang kabilang password.',
  'settings.restoreChoose': 'Pumili ng backup file',
  'settings.restoreMade': 'Ginawa ang backup noong {date}',
  'settings.restorePassword': 'Pangunahing password ng backup',
  'settings.restoreRecoveryKey': 'Recovery key ng backup',
  'settings.restoreButton': 'Ibalik',
  'settings.restoreNew': {
    one: 'Naibalik ang vault, may {count} item.',
    other: 'Naibalik ang vault, may {count} item.',
  },
  'settings.restoreAdded': {
    one: 'Naidagdag ang {count} item mula sa backup.',
    other: 'Naidagdag ang {count} item mula sa backup.',
  },
  'settings.restoreUpdated': {
    one: '{count} item ay may mas bagong edit sa backup.',
    other: '{count} item ay may mas bagong edit sa backup.',
  },
  'settings.restoreNothing': 'Nasa vault na ito na ang lahat ng nasa backup.',

  'settings.import': 'I-import',
  'settings.importBody':
    'Ilipat ang iyong mga password mula sa Chrome, Edge, Firefox, Safari, Apple Passwords, Bitwarden, 1Password, LastPass, KeePass, Dashlane, Proton Pass o NordPass: i-export doon bilang CSV file, saka piliin dito. Kasama rin ang mga card, address, at note sa file. Mula sa Bitwarden, i-export bilang JSON (hindi naka-encrypt): ang CSV nito ay walang kasamang card, identity, at passkey. Inilalagay ng Dashlane ang mga ito sa sarili nilang file: piliin ang bawat isa nang paisa-isa.',
  'settings.importChoose': 'Pumili ng file',
  'settings.importFound': 'Nakita para i-import: {what}.',
  'settings.importLogins': { one: '{count} login', other: '{count} login' },
  'settings.importPasskeys': { one: '{count} passkey', other: '{count} passkey' },
  'settings.importCards': { one: '{count} card', other: '{count} card' },
  'settings.importAddresses': { one: '{count} address', other: '{count} address' },
  'settings.importNotes': { one: '{count} note', other: '{count} note' },
  'settings.importSkipped': {
    one: '{count} entry ang walang laman na iniimbak ng Passhold, at hindi isasama.',
    other: '{count} entry ang walang laman na iniimbak ng Passhold, at hindi isasama.',
  },
  'settings.importDuplicates': {
    one: '{count} ay nasa vault mo na.',
    other: '{count} ay nasa vault mo na.',
  },
  'settings.importConfirm': 'I-import',
  'settings.importDone': 'Na-import ang {what}.',
  'settings.importDelete': 'Ngayon, burahin ang CSV file: naglalaman ito ng iyong mga password sa plain text.',
  'settings.importNothing': 'Walang bagong i-import sa file na iyon.',
  'settings.importTwoFactor': {
    one: '{count} login sa file na ito ang may two-step (2FA) code. Hindi iniimbak ng Passhold ang 2FA code: ilipat ito sa authenticator app bago burahin ang lumang password manager mo, o baka ma-lock out ka sa account na iyon.',
    other:
      '{count} login sa file na ito ang may two-step (2FA) code. Hindi iniimbak ng Passhold ang 2FA code: ilipat ang mga ito sa authenticator app bago burahin ang lumang password manager mo, o baka ma-lock out ka sa mga account na iyon.',
  },
  'settings.importAuthenticator': 'Kunin ang Keyrook Authenticator',
  'settings.importPasskeysLeft': {
    one: '{count} passkey sa file na ito ang hindi maaaring mapunta sa Passhold. Panatilihin ang lumang password manager mo hanggang makapag-sign in ka sa site na iyon sa ibang paraan at makagawa ng bagong passkey sa Passhold.',
    other:
      '{count} passkey sa file na ito ang hindi maaaring mapunta sa Passhold. Panatilihin ang lumang password manager mo hanggang makapag-sign in ka sa mga site na iyon sa ibang paraan at makagawa ng bagong passkey sa Passhold.',
  },

  'settings.export': 'I-export',
  'settings.exportBody':
    'Isang CSV file na mababasa ng bawat browser at password manager. Naglalaman ito ng iyong mga password sa plain text: itago lang ito hangga’t kailangan mo. Mga login lang ang laman nito: wala rito ang mga passkey, custom field, folder, card, address, at note. Itinatago ng backup ang lahat.',
  'settings.exportButton': 'I-export ang CSV',
  'settings.exportDone': 'Na-export. Burahin ang file kapag tapos ka na rito.',

  'settings.neverSave': 'Huwag kailanman mag-alok na i-save sa',
  'settings.neverSaveEmpty':
    'Walang site. Piliin ang “Hindi kailanman para sa site na ito” kapag nag-aalok ang Passhold na mag-save, at lalabas ito rito.',
  'settings.remove': 'Alisin',

  'settings.trash': 'Basurahan',
  'settings.trashEmpty': 'Walang laman ang basurahan.',
  'settings.restore': 'Ibalik',
  'settings.deleteForever': 'Burahin nang tuluyan',
  'settings.emptyTrash': 'Linisin ang basurahan',
  'settings.emptyTrashConfirm': 'Burahin nang tuluyan ang lahat sa basurahan?',

  'settings.danger': 'Alisin ang vault',
  'settings.dangerBody':
    'Buburahin ang vault sa browser na ito. Tuluyang mawawala ang bawat login dito — mag-download muna ng backup kung gusto mong itago ang mga ito.',
  'settings.dangerType': 'I-type ang {word} para kumpirmahin',
  'settings.dangerWord': 'burahin',
  'settings.dangerButton': 'Alisin ang vault',

  'settings.about': 'Passhold {version} · ni Keyrook',

  // Errors
  'error.noWorker': 'Hindi sumagot ang Passhold. Isara ito at subukan muli.',
  'error.wrongPassword': 'Hindi ito ang pangunahing password.',
  'error.passwordTooShort': 'Gumamit ng hindi bababa sa {min} karakter.',
  'error.vaultCorrupt': 'Sira ang vault sa device na ito at hindi ito mabubuksan.',
  'error.vaultTooNew': 'Ginawa ang vault na ito ng mas bagong Passhold. I-update ang Passhold para mabuksan ito.',
  'error.itemNotFound': 'Wala na ito sa vault.',
  'error.familyOrganiserOnly': 'Tanging organizer ng pamilya lang ang makapaglilinis ng basurahan ng vault na ito.',
  'error.familyGone': 'Wala na rito ang pamilyang iyon. Mag-sync, saka tumingin muli.',
  'error.familyNotOpen': 'Hindi pa mabubuksan ng Passhold ang pamilyang iyon sa browser na ito. Mag-sync, saka subukan muli.',
  'error.itemInvalid': 'Hindi ito maisasave sa ganitong anyo.',
  'error.importEmpty': 'Walang laman na maaaring i-import ang file na iyon.',
  'error.importTooLarge': 'Masyadong malaki ang file na iyon para i-import.',
  'error.importUnknownFormat': 'Hindi ito mukhang export ng password.',
  'error.importEncrypted':
    'Naka-encrypt ang Bitwarden export na ito, at hindi ito mabubuksan ng Passhold. Mag-export muli sa Bitwarden bilang “.json”, hindi “.json (Encrypted)”, saka piliin ang file na iyon.',
  'error.backupInvalid': 'Hindi ito Passhold backup, o sira ito.',
  'error.backupWrongPassword': 'Hindi ito ang pangunahing password na ginamit sa paggawa ng backup na ito.',
  'error.backupWrongRecoveryKey': 'Hindi ito ang recovery key na ginamit sa paggawa ng backup na ito.',
  'error.noRecoveryKey': 'Walang recovery key na maipapakita ang vault na ito: bumubukas ito gamit ang pangunahing password.',
  'error.wrongRecoveryKey': 'Hindi ito ang recovery key.',
  'error.deviceNeeded':
    'Bumubukas ang vault na walang pangunahing password gamit ang unlock ng device na ito: i-set up muna ito. Mananatili ito hanggang may magtakda ng pangunahing password.',
  'error.accountOffline': 'Hindi maabot ang Keyrook. Tingnan ang koneksyon at subukan muli.',
  'error.accountWrong':
    'Maling email o password. Ang account na ginawa gamit ang Google o GitHub ay nagsa-sign in gamit ang sarili nitong button.',
  'error.accountSignedOut': 'Pinalabas ng Keyrook ang browser na ito. Mag-sign in muli.',
  'error.accountBusy': {
    one: 'Sobra sa pagsubok. Maghintay ng {count} segundo at subukan muli.',
    other: 'Sobra sa pagsubok. Maghintay ng {count} segundo at subukan muli.',
  },
  'error.accountFailed': 'Hindi magawa ng Keyrook iyon sa ngayon. Subukan muli mamaya.',
  'error.accountAlready': 'Naka-sign in na sa isang Keyrook account ang vault na ito.',
  'error.accountNone': 'Hindi naka-sign in sa Keyrook account ang vault na ito.',
  'error.accountKdfRefused': 'Humingi ang Keyrook ng mas mahinang key kaysa tinatanggap ng Passhold, kaya itinigil ang pag-sign in.',
  'error.accountKeyWrong': 'Hindi nabuksan ng key ng account ang password na iyon.',
  'error.accountCode': 'Mali ang code na iyon, o expired na. Tingnan ang email, o humingi ng bago.',
  'error.accountMail': 'Hindi maipadala ng Keyrook ang email sa ngayon. Subukan muli sa loob ng isang minuto.',
  'error.providerDenied': 'Kinansela ang sign-in.',
  'error.providerFailed': 'Hindi ka mapasok ng Google o GitHub sa ngayon. Subukan muli.',
  'error.providerExpired': 'Tapos na ang sign-in na iyon. Magsimula muli.',
  'error.providerNotOwner':
    'Hindi ito ang account na ginagamit ng Keyrook account na ito sa pag-sign in. Mag-sign in muli gamit ang ginagamit mo para sa Keyrook.',
  'error.signOutUnsent': {
    one: 'Isang item ang hindi pa nakakarating sa iyong Keyrook account, kaya walang inalis. Tingnan ang koneksyon mo, o mag-sign in muli, saka mag-sign out.',
    other:
      '{count} item ang hindi pa nakakarating sa iyong Keyrook account, kaya walang inalis. Tingnan ang koneksyon mo, o mag-sign in muli, saka mag-sign out.',
  },
  'error.providerOtherProvider':
    'May Keyrook account na ang email na ito na nagsa-sign in gamit ang isa sa Google at GitHub. Mag-sign in gamit iyon.',
  'error.providerHasPassword':
    'May Keyrook account na may password na ang email na ito. Mag-sign in dito gamit ang email at password mo — o, para makapag-sign in din gamit ang Google o GitHub, idagdag ito sa account.keyrook.com, naka-sign in doon gamit ang password mo.',
  'error.providerEmailTaken':
    'May Keyrook account na na ang email na ito na nagsa-sign in sa ibang paraan. Mag-sign in gamit iyon — o idagdag ang account na ito sa account.keyrook.com, naka-sign in doon sa paraang ginagamit nito ngayon.',
  'error.pairingWrongKey':
    'Hindi key ng account na ito ang ibinalik, kaya tinanggihan ito. Magtanong muli, at papasukin lang mula sa browser na kilala mo.',
  'error.pairingRefused': 'Hindi ito galing sa browser na tiningnan mo ang code, kaya tinanggihan ito. Magtanong muli.',
  'error.pairingEnded': 'Tapos na ang request na iyon. Magtanong muli mula sa bagong browser.',
  'error.passkeyWrong': 'Hindi nabubuksan ng passkey na ito ang account na ito. Subukan ang ibang paraan para pumasok.',
  'error.joinExpired': 'Masyadong matagal ang sign-in na iyon. Mag-sign in muli.',
  'error.accountPasswordWrong': 'Hindi ito ang password ng account.',
  'error.accountNoKit': 'Wala sa Passhold ang recovery key ng account na ito.',
  'error.accountKitRace': 'Binago lang ng ibang app ang recovery key ng account. Mag-sync, saka subukan muli.',
  'error.accountKitShape': 'Hindi ito mukhang recovery key ng account: 32 letra at numero ito.',
  'error.accountKitWrong': 'Hindi tugma ang recovery key na ito sa account na may email address na ito.',
  'error.accountKitNotThis': 'Hindi ito recovery key ng account na ito. Tingnan muli ang na-save mo.',
  'error.accountPasswordWeak':
    'Masyadong madaling hulaan para sa account: gumamit ng mas mahabang password na may halong letra, numero, at simbolo, o apat o limang walang kaugnayang salita.',
  'error.accountBoxWrong':
    'Hindi nabuksan ang key ng Passhold sa account na ito. Mag-sign in muli; kung hindi pa rin gumana, simulan muli ang account.',
  'error.accountCodeWait': {
    one: 'May naipadalang code kanina lang. Makakahingi ka ng isa pa sa loob ng {count} segundo.',
    other: 'May naipadalang code kanina lang. Makakahingi ka ng isa pa sa loob ng {count} segundo.',
  },
  'error.accountSignUpKeys':
    'Hiniling ng Keyrook ang sariling key ng Passhold, at walang naipadala. I-update ang Passhold at subukan muli.',
  'error.accountIdTaken': 'Hindi magawa ang account sa ngayon. Humingi ng bagong code at subukan muli.',
  'error.accountNoRoot': 'Wala pang key ang account na ito na mabubuksan ng recovery key. Mag-sign in muli gamit ang password nito.',
  'error.accountRootNotHeld':
    'Hindi maipakita ng computer na ito na hawak nito ang key ng account. Mag-sign in muli gamit ang password o recovery key.',
  'error.accountRootChanged':
    'Napalitan sa ibang computer ang mga key ng account na ito. Mag-sign in sa computer kung saan naka-sign in pa ang Passhold, o simulan muli ang account.',
  'error.accountKeyReplaced': 'Napalitan sa ibang computer ang key ng Passhold sa account na ito. Mag-sign in muli.',
  'error.accountSessionStolen':
    'Na-sign out ang computer na ito dahil ginamit ang session nito mula sa ibang lugar. Mag-sign in muli.',
  'error.accountOld':
    'Ginawa ang account na ito gamit ang Google o GitHub bago nagkaroon ng sariling key ang bawat Keyrook app, at wala pang nabubuksan dito ang Passhold. Simulan muli ang account gamit ang email nito para mabigyan ito ng isa.',
  'error.pairingBusy': 'Masyadong maraming browser ang naghihintay na sumali sa account na ito. Subukan muli sa loob ng ilang minuto.',
  'error.startOverExpired': 'Expired na iyon. Humingi ng bagong code at magsimula muli.',
  'error.startOverTooOften': 'Masyadong madalas nagsimulang muli ang account na ito kamakailan. Subukan muli pagkatapos ng {day}.',
  'error.startOverWaiting': 'Magsisimulang muli ang account na ito sa {day}. Puwedeng kanselahin ito ng browser na naka-sign in pa rito.',
  'error.startOverUpdate':
    'Naghihintay na ngayon ang Keyrook ng isang linggo bago simulan muli ang isang account. I-update ang Passhold para mahiling ito.',
  'error.passkeyFailed': 'Hindi masuri ang passkey na iyon. Subukan muli.',
  'error.passkeyNotYou': 'Hindi kinumpirma ng passkey na iyon na ikaw iyon. Subukan muli, at i-unlock ito gaya ng hinihingi.',
  'error.passkeyUnknown':
    'Wala ang passkey na iyon sa anumang Keyrook account. Maaaring naalis na ito: mag-sign in gamit ang password, o gamit ang Google o GitHub.',
  'error.passkeyExpired': 'Tapos na ang passkey request na iyon. Subukan muli.',
  'error.passkeyNotOffered': 'Hindi pa nag-aalok ng passkey ang Keyrook dito.',
  'error.passkeyNoUnlock':
    'Nagsa-sign in ang passkey na iyon, pero hindi pa ito nakatakdang mag-unlock ng iyong account. Sa account.keyrook.com, sa ilalim ng “Passkeys”, piliin ang “Let it unlock” sa tabi nito, saka subukan muli. O mag-sign in gamit ang password, o gamit ang Google o GitHub.',
  'error.passkeyNoPrf':
    'Nagsa-sign in sa account.keyrook.com ang passkey na iyon, pero hindi kayang i-unlock ng lugar kung saan ito naka-imbak ang iyong account — hindi kaya ng iCloud Keychain bago ang macOS 15, halimbawa. Sa account.keyrook.com, sa ilalim ng “Passkeys”, magdagdag ng isa na naka-imbak sa lugar na kaya nito, gaya ng security key, at tiyaking nakasulat dito ang “Unlocks your data”. Hanggang doon, mag-sign in gamit ang password, o gamit ang Google o GitHub.',
  'error.passkeyPermission':
    'Kailangan ng Passhold ang pahintulot ng Chrome para gamitin ang mga passkey ng account.keyrook.com. Piliin muli ang passkey at payagan ito.',
  'error.passkeyPermissionEdge':
    'Kailangan ng Passhold ang pahintulot ng Edge para gamitin ang mga passkey ng account.keyrook.com. Piliin muli ang passkey at payagan ito.',
  'error.passkeyCancelled': 'Walang passkey na ginamit. Subukan muli, o mag-sign in sa ibang paraan.',
  'error.secondStepNeeded': 'Humihingi ng ikalawang hakbang ang iyong account: ilagay din ang code mula sa iyong authenticator app.',
  'error.secondStepWrong': 'Mali ang code na iyon. Ilagay ang ipinapakita ngayon ng iyong authenticator app, o ang recovery key mo.',
  'error.signInExpired': 'Expired na ang sign-in na iyon. Mag-sign in muli.',
  'error.secondStepUpdate': 'Humihingi ang iyong account ng ikalawang hakbang para mag-sign in. I-update ang Passhold para makapag-sign in.',
  'error.secondStepAsked': 'Humihingi ang iyong account ng ikalawang hakbang: ilagay ang code mula sa iyong authenticator app.',
  'error.secondStepTaken':
    'Iyon ang code na ginamit mo sa pag-sign in, at isang beses lang gumagana ang bawat code. Hintayin na magpakita ng bago ang iyong authenticator app.',
  'error.kitDraftGone': 'Hindi naitakda sa tamang oras ang bagong recovery key na iyon, at walang nagbago. Gumawa ng bago muli.',
  'error.archiveWrong': 'Hindi nito mabubuksan ang naitago.',
  'error.archiveGone': 'Wala na itong naitago.',
  'error.archiveDeleteRefused': 'Tanging ang lumang password o lumang recovery key lang ang makakabura sa naitago bago ito mag-expire.',
  'error.accountNeedsRoot':
    'Ginawa ang account na ito sa Keyrook Authenticator bago nagkaroon ng sariling key ang bawat Keyrook app. Maaaring bigyan ito ng Passhold ngayon; walang mababago sa Authenticator.',
  'error.accountServerWrong':
    'Sumagot ang server ng Keyrook ng bagay na hindi tugma sa mga key ng account na ito, kaya huminto ang Passhold. Subukan muli mamaya.',
  'error.startOverNeedsPassword': 'May password ang account na ito: pumili ng bago para simulan muli ito.',
  'error.pinInvalid': 'Mula 6 hanggang 12 digit ang PIN.',
  'error.wrongPin': 'Hindi ito ang PIN.',
  'error.wrongPinLeft': {
    one: 'Hindi ito ang PIN. May {count} pang pagsubok.',
    other: 'Hindi ito ang PIN. May {count} pang pagsubok.',
  },
  'error.pinLockedOut': 'Masyadong maraming maling PIN. Mag-unlock gamit ang ibang paraan; pagkatapos noon, gagana muli ang PIN.',
  'error.pinUnavailable':
    'Gumagana lang ang PIN habang bukas ang browser. Mag-unlock gamit ang ibang paraan; pagkatapos noon, gagana muli ang PIN.',
  'error.deviceGone': 'Hindi na naka-set up ang pag-unlock gamit ang device na ito. Mag-unlock gamit ang ibang paraan.',
  'error.deviceKeyWrong': 'Hindi nabuksan niyon ang Passhold. Mag-unlock gamit ang ibang paraan, saka i-set up muli ang device unlock.',
  'error.deviceUnsupported':
    'Ang lugar kung saan na-save ang passkey na iyon ay hindi makapagbibigay ng key sa Passhold para mabuksan. Subukan muli at i-save ito sa Google Password Manager — o gamitin ang PIN.',
  'error.deviceUnsupportedEdge':
    'Ang lugar kung saan na-save ang passkey na iyon ay hindi makapagbibigay ng key sa Passhold para mabuksan. Subukan muli at i-save ito sa ibang lugar — o gamitin ang PIN.',
  'error.deviceCancelled': 'Walang na-unlock: kinansela ito o masyadong tumagal.',
  'error.keyUnsupported':
    'Hindi maibibigay ng key na ito sa Passhold ang kailangan nito para mabuksan. Kaya ito ng karamihan sa FIDO2 key; ang key na ginawa lang para sa two-step sign-in (U2F) ay hindi.',
  'error.keyAlreadyAdded': 'Naka-set up na rito ang key na iyon.',
  'error.keyGone': 'Hindi na naka-set up dito ang security key na iyon. Mag-unlock gamit ang ibang paraan.',
  'error.keyWrong': 'Hindi nabuksan ng key na iyon ang Passhold. Mag-unlock gamit ang ibang paraan, saka alisin ang key at idagdag itong muli.',
  'error.kdfUnsupported': 'Hindi tinatanggap ng Passhold ang mga setting ng vault.',
  'error.locked': 'Naka-lock ang Passhold.',
  'error.noVault': 'Wala pang vault.',
  'error.vaultExists': 'May vault na.',
  'error.notOnPage': 'Hindi para sa pahina sa tab na ito ang login na iyon.',
  'error.expired': 'Expired na ito. Subukan muli.',
  'error.noFields': 'Walang nasa pahinang ito na mapupunan ng Passhold.',
  'error.cardInsecure': 'Pinupunan lang ng Passhold ang card sa secure (https) na pahina.',
  'error.unknown': 'May nangyaring mali: {detail}',
};
