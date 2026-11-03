import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'af Keyrook',

  // Common
  'common.cancel': 'Annuller',
  'common.close': 'Luk',
  'common.save': 'Gem',
  'common.edit': 'Rediger',
  'common.back': 'Tilbage',
  'common.show': 'Vis',
  'common.hide': 'Skjul',
  'common.notNow': 'Ikke nu',

  // Setup
  'setup.title': 'Opret din boks',
  'setup.body':
    'Passhold gemmer dine adgangskoder krypteret på denne enhed. Én hovedadgangskode åbner dem – vælg en, du husker, og som du ikke bruger andre steder.',
  'setup.password': 'Hovedadgangskode',
  'setup.confirm': 'Skriv den igen',
  'setup.mismatch': 'De to adgangskoder er ikke ens.',
  'setup.tooShort': 'Brug mindst {min} tegn.',
  'setup.understand':
    'Jeg forstår, at ingen – hverken Passhold eller Keyrook – kan gendanne min boks, hvis jeg glemmer denne adgangskode.',
  'setup.create': 'Opret boks',
  'setup.creating': 'Opretter…',
  'setup.restore': 'Gendan fra en sikkerhedskopi',

  // Strength
  'setup.deviceBody':
    'Passhold gemmer dine adgangskoder krypteret på denne enhed, og {method} åbner dem – ingen hovedadgangskode at finde på eller huske. Du får også en gendannelsesnøgle til den dag, {method} ikke kan.',
  'setup.deviceWhereMac': 'Når Chrome spørger, hvor adgangsnøglen skal gemmes, så vælg Google Password Manager.',
  'setup.deviceWhereMacEdge':
    'Når Edge spørger, hvor adgangsnøglen skal gemmes, så vælg et sted, der også gemmer den på dine andre enheder. Ikke alle steder kan låse Passhold op: Hvis dette ikke kan, siger Passhold det.',
  'setup.createWithDevice': 'Opret med {method}',
  'setup.usePassword': 'Brug i stedet en hovedadgangskode',
  'setup.useDevice': 'Brug i stedet {method}',
  'setup.signIn': 'Log ind eller opret en Keyrook-konto',

  'welcome.title': 'Dine adgangskoder, på hver computer',
  'welcome.body': 'Log ind én gang. Passhold åbner med dit fingeraftryk, udfylder for dig, og dine logins er, hvor du logger ind.',
  'welcome.email': 'Brug en e-mailadresse',
  'gate.touchTitle': 'Åbn med et touch',
  'gate.touchBody': 'Touch ID eller Windows Hello åbner Passhold. Ingen hovedadgangskode at finde på og huske.',
  'gate.everywhereTitle': 'På hver computer, du bruger',
  'gate.everywhereBody': 'Log ind på en anden computer, så er dine adgangskoder og adgangsnøgler der.',
  'gate.privateTitle': 'Kun du kan læse dem',
  'gate.privateBody':
    'Krypteret på denne computer, før noget sendes. Keyrook kan ikke læse dine adgangskoder eller se, hvilke websteder de er til.',
  'welcome.note':
    'Krypteret på denne computer først: Keyrook kan ikke læse dine adgangskoder eller se, hvilke websteder de er til.',
  'connect.title': 'Tænd for din Keyrook-konto',
  'connect.body': 'Dine logins på hver computer, du bruger – og tilbage, hvis denne går tabt.',
  'connect.email': 'E-mail',
  'kitCheck.title': 'Tjek gendannelsesnøglen til din konto',
  'kitCheck.body': 'Skriv den én gang, så du ved, at du stadig har den, før du får brug for den.',
  'accountPasskey.button': 'Fortsæt med en adgangsnøgle',
  'accountPasskey.working': 'Venter på adgangsnøglen…',
  'accountPasskey.hint':
    'En, du har tilføjet på account.keyrook.com. Første gang spørger {browser}, om Passhold må bruge den.',
  'accountPasskey.openPasskeys': 'Åbn »Passkeys« på account.keyrook.com',
  'join.title': 'Log ind på Keyrook',
  'join.body': 'Én Keyrook-konto til Passhold og Keyrook Authenticator. Dine logins kommer til denne browser fra kontoen.',
  'join.createTitle': 'Opret en Keyrook-konto',
  'join.createBody':
    'Én konto til Passhold og Keyrook Authenticator: dine logins, krypteret på denne enhed først, på hver computer, du logger ind på.',
  'join.lockTitle': 'Logget ind som {email}',
  'join.lockBodyDevice': 'Sidste trin: Passhold åbner på denne computer med {method}. Dine logins kommer ned, så snart det er sat op.',
  'join.cancel': 'Brug en anden konto',
  'join.lockBodyCode': 'Sidste trin: en kode, der åbner Passhold på denne computer. Dine logins kommer ned, så snart det er sat op.',
  'join.opening': 'Åbner Passhold…',
  'setup.useAccountPassword': 'Brug i stedet min kontoadgangskode',
  'setup.useCode': 'Brug i stedet en kode til denne computer',
  'security.accountPasswordTitle': 'Åbner med din Keyrook-kontoadgangskode',
  'security.accountPasswordBody': 'Én adgangskode til begge. Når den ændres, følger Passhold her med, næste gang du logger ind.',

  'recovery.title': 'Gem din gendannelsesnøgle',
  'recovery.body':
    'Hvis denne enhed går tabt, eller dens oplåsning holder op med at virke, er denne nøgle vejen tilbage til din boks og dens sikkerhedskopier. Du kan se den igen under Indstillinger, mens Passhold stadig åbner – så gem den også et andet sted: udskrevet, på din telefon eller i en fil væk fra denne computer.',
  'recovery.download': 'Hent',
  'recovery.copy': 'Kopiér',
  'recovery.copied': 'Kopieret',
  'recovery.print': 'Udskriv',
  'recovery.qr': 'Vis QR-kode',
  'recovery.qrHide': 'Skjul QR-kode',
  'recovery.qrLabel': 'Gendannelsesnøglen som QR-kode',
  'recovery.qrHint': 'Hold din telefons kamera hen over den og gem teksten i en note, eller tag et billede af den.',
  'recovery.show': 'Vis',

  'kit.title': 'Passhold-gendannelsessæt',
  'kit.made': 'Lavet {date}',
  'kit.keyLabel': 'Gendannelsesnøgle',
  'kit.whenTitle': 'Når Passhold ikke vil åbne',
  'kit.sameDevice': 'På denne computer: Når Passhold beder dig låse op, så vælg »Brug gendannelsesnøglen i stedet« og skriv nøglen.',
  'kit.newDevice':
    'På en ny computer: Installér Passhold, vælg »Gendan fra en sikkerhedskopi«, vælg din nyeste sikkerhedskopifil, og skriv nøglen. Uden en sikkerhedskopi er der intet at gendanne, så lav en.',
  'kit.keep': 'Gem dette ark et sikkert sted, væk fra din computer. Den, der har det og en kopi af din boks, kan åbne boksen.',
  'recovery.fileTitle': 'Passhold-gendannelsesnøgle',
  'recovery.fileMade': 'Lavet {date}',
  'recovery.fileBody':
    'Denne nøgle åbner din Passhold-boks og dens sikkerhedskopier, når din enhed ikke kan. Den, der har den og en kopi af din boks, kan åbne den, så gem den sikkert og ikke på samme computer.',
  'recovery.pending': 'Gendannelsesnøgle ikke gemt',
  'recovery.keptState': 'Gendannelsesnøgle gemt',
  'recovery.rowBody':
    'Åbner din boks og dens sikkerhedskopier, når {method} ikke kan. En ny stopper den gamle i at åbne denne boks; sikkerhedskopier lavet før åbner stadig med den gamle.',
  'recovery.makeNew': 'Lav en ny',
  'recovery.savedIt': 'Jeg har gemt den',
  'recovery.checkTitle': 'Tjek, at du har gemt den',
  'recovery.checkBody':
    'Skriv to grupper af nøglen ud fra det, du gemte – filen, papiret eller billedet. Grupperne er blokkene på fire tegn mellem bindestregerne, talt fra venstre.',
  'recovery.group': 'Gruppe {position}',
  'recovery.check': 'Tjek',
  'recovery.checkWrong': 'Det er ikke det, din nøgle siger. Se det, du gemte, igen, eller vis nøglen igen og gem den nu.',
  'recovery.showAgain': 'Vis nøglen igen',
  'recovery.covered': 'Din Keyrook-konto er vejen tilbage',
  'recovery.coveredBody':
    'Hvis {method} holder op med at åbne Passhold her, så fjern boksen og log ind på din konto igen: Hvert login kommer tilbage. Boksens egen gendannelsesnøgle kan stadig ses her.',

  'proof.recoveryKey': 'Gendannelsesnøgle',
  'proof.withDevice': 'Du bekræfter med {method}.',
  'proof.useDevice': 'Bekræft i stedet med {method}',
  'proof.usePassword': 'Skriv i stedet hovedadgangskoden',
  'proof.useAccountPassword': 'Skriv i stedet kontoadgangskoden',
  'proof.useCode': 'Skriv i stedet koden',
  'proof.useRecoveryKey': 'Skriv i stedet gendannelsesnøglen',
  'strength.0': 'Meget svag',
  'strength.1': 'Svag',
  'strength.2': 'Middel',
  'strength.3': 'Stærk',
  'strength.4': 'Meget stærk',
  'strength.short': 'Længere er stærkere: sigt efter 14 tegn eller mere.',
  'strength.digitsOnly': 'Kun cifre er hurtige at gætte.',
  'strength.repeats': 'Undgå at gentage det samme tegn igen og igen.',

  // Unlock
  'unlock.title': 'Passhold er låst',
  'unlock.body': 'Skriv din hovedadgangskode.',
  'unlock.password': 'Hovedadgangskode',
  'unlock.submit': 'Lås op',
  'unlock.pinBody': 'Skriv din PIN.',
  'unlock.pin': 'PIN',
  'unlock.usePassword': 'Brug i stedet hovedadgangskoden',
  'unlock.usePin': 'Brug i stedet PIN-koden',
  'unlock.recoveryBody': 'Skriv din gendannelsesnøgle.',
  'unlock.deviceBody': 'Brug {method}, eller skriv nedenfor.',
  'unlock.recoveryKey': 'Gendannelsesnøgle',
  'unlock.useRecoveryKey': 'Brug i stedet gendannelsesnøglen',
  'unlock.lost': 'Kan du ikke komme ind?',
  'unlock.forgotBodyRecovery':
    'Din gendannelsesnøgle åbner boksen, når enheden ikke kan. Uden den og uden enheden kan ingen – hverken Passhold eller Keyrook – åbne boksen: Du kan kun fjerne den under Indstillinger og starte forfra.',
  'unlock.bodyAccount': 'Skriv din Keyrook-kontoadgangskode.',
  'unlock.accountPassword': 'Keyrook-kontoadgangskode',
  'unlock.useAccountPassword': 'Brug i stedet kontoadgangskoden',
  'unlock.forgotBodyAccount':
    'Det er din Keyrook-kontoadgangskode: Er den ændret et andet sted, så brug den nye. Glemt for godt? Fjern denne boks under Indstillinger og log ind igen – med gendannelsesnøglen, hvis du har brug for en ny adgangskode – så kommer hvert login tilbage.',
  'unlock.bodyCode': 'Skriv koden, der åbner Passhold på denne computer.',
  'unlock.code': 'Kode til denne computer',
  'unlock.useCode': 'Brug i stedet koden',
  'unlock.forgotBodyCode':
    'Fjern denne boks under Indstillinger, og log ind igen med Google eller GitHub: Hvert login kommer tilbage fra din konto.',
  'unlock.device': 'Lås op med {method}',
  'unlock.key': 'Lås op med en sikkerhedsnøgle',
  'unlock.keyBody': 'Sæt din sikkerhedsnøgle i, eller skriv nedenfor.',
  'unlock.or': 'eller',
  'unlock.unlocking': 'Låser op…',
  'unlock.forgot': 'Glemt den?',
  'unlock.forgotBody':
    'Din hovedadgangskode er den eneste nøgle til denne boks, og den gemmes ingen steder. Uden den kan boksen ikke åbnes – du kan kun fjerne den under Indstillinger og starte forfra.',

  // Vault
  'vault.search': 'Søg',
  'vault.lock': 'Lås',
  'vault.settings': 'Indstillinger',
  'vault.add': 'Nyt login',
  'vault.onThisPage': 'På {site}',
  'vault.all': 'Alle logins',
  'vault.empty': 'Ingen logins endnu',
  'vault.emptyBody':
    'Log ind på et websted, og Passhold tilbyder at gemme det – eller tilføj et her, eller importér fra din browser.',
  'vault.import': 'Importér adgangskoder',
  'vault.noResults': 'Intet passer til »{query}«.',
  'vault.fill': 'Udfyld',
  'vault.copyUsername': 'Kopiér brugernavn',
  'vault.copyPassword': 'Kopiér adgangskode',
  'vault.noUsername': 'Intet brugernavn',
  'vault.count': { one: '{count} post', other: '{count} poster' },
  'vault.everything': 'Alle poster',

  // Asking for a rating, once, after real use
  'rating.title': 'Synes du, Passhold er nyttig?',
  'rating.body': 'En bedømmelse i butikken hjælper andre med at finde det.',
  'rating.rate': 'Bedøm det',
  'rating.later': 'Ikke nu',

  // What a list shows, and what can be added
  'kinds.label': 'Vis',
  'kinds.all': 'Alt',
  'kinds.logins': 'Logins',
  'kinds.cards': 'Kort',
  'kinds.addresses': 'Adresser',
  'kinds.notes': 'Noter',
  'kinds.noLogins': 'Ingen logins endnu.',
  'kinds.noCards':
    'Ingen kort endnu. Tilføj et med + ovenfor, så udfylder Passhold det ved betaling, når du vælger det.',
  'kinds.noAddresses':
    'Ingen adresser endnu. Tilføj en med + ovenfor, så udfylder Passhold den, hvor en formular beder om en.',
  'kinds.noNotes':
    'Ingen noter endnu. En note gemmer det, der ikke er et login – et wifi-kodeord, en licensnøgle – krypteret sammen med alt det andet.',
  'add.menu': 'Tilføj',
  'add.login': 'Login',
  'add.card': 'Kort',
  'add.address': 'Adresse',
  'add.note': 'Note',
  'place.label': 'Bokse',
  'place.mine': 'Mine',
  'place.of': '{vault}, delt i {family}',
  'move.to': 'Flyt til {vault}',
  'move.confirm':
    'Alle i {family} vil se den i {vault} og kan ændre den. Den forlader din egen boks; de tidligere adgangskoder bliver tilbage.',
  'move.do': 'Flyt',
  'family.unlockTitle': 'Åbn {family}s delte boks i denne browser',
  'family.unlockBody':
    'Passhold skal bruge din Keyrook-kontoadgangskode én gang for at give din nøgle til familien i denne browser. Den sendes ikke noget sted hen.',
  'family.unlockOnPage': 'Åbn siden »Family« på account.keyrook.com, og giv din nøgle til familien til Passhold der.',
  'family.password': 'Keyrook-kontoadgangskode',
  'family.unlock': 'Åbn',
  'family.openPage': 'Åbn familiesiden',
  'family.keyChanged': '{who}s nøgle i {family} er ændret',
  'family.newSender': '{family}s nøgle kom fra {who}, som denne browser endnu ikke kender',
  'family.keyChangedBody':
    'Passhold tager intet fra dem, før I to har sammenlignet en kode. Ring eller mød dem: De vælger at sammenligne koder ved siden af dit navn på siden »Family« på account.keyrook.com.',
  'family.showCode': 'Vis koden',
  'family.codeIs': 'Din kode',
  'family.match': 'Koderne er ens',
  'family.differ': 'De er forskellige',
  'family.differed': 'Så stol ikke på det. Sig til en organisator i din familie; Passhold tager imens intet fra dem.',
  'family.someone': 'Nogen',
  'family.waiting': 'En organisator i {family} skal endnu bekræfte dig. Det, der deles, åbner her, når de har gjort det.',
  'family.rotate':
    'Nogen har forladt {family}, og Passhold har endnu ikke skiftet alle sine nøgler: Det, der ændres i de delte bokse, venter på denne browser. Hvis det bliver ved, så skift nøglerne på siden »Family«.',
  'family.rotateCompare':
    'Nogen har forladt {family}. Passhold giver alle nye nøgler, når du har sammenlignet koden ovenfor; indtil da venter det, der ændres i de delte bokse, på denne browser.',
  'family.rotateWait':
    'Nogen har forladt {family}. Det, du ændrer i de delte bokse, venter på denne browser, indtil en organisators Passhold ændrer nøglerne, hvilket sker, når det synkroniserer, så personen, der gik, ikke kan læse det.',
  'family.left': '{who} er ikke længere i {family}',
  'family.leftBody':
    'Passhold kan ikke se, hvorfor de er gået. Hvis du ikke havde ventet det, så spørg dem eller en organisator i din familie.',
  'family.title': 'Familie',
  'family.description':
    'Hvem der er i din familie, og de bokse den deler. En familie styres på siden »Family« på account.keyrook.com: invitere, fjerne en person, skifte nøgler.',
  'family.none':
    'Denne konto er i ingen familie. Familier oprettes på siden »Family« på account.keyrook.com.',
  'family.youOrganise': 'Du er organisator for den.',
  'family.youMember': 'Du er medlem af den.',
  'family.you': '(dig)',
  'family.organiser': 'Organisator',
  'family.notCompared': 'Lukket ind uden at sammenligne koder',
  'family.keyNew': 'Deres nøgle er ændret: Intet tages fra dem, før du sammenligner en kode',
  'family.membersLater': 'Hvem der er med, vises her, når familien åbnes i denne browser.',
  'family.sharedVaults': 'Delte bokse',
  'family.vaultWaits': 'Det, der ændres i den, venter, til en organisator ændrer dens nøgle',

  // Cards, addresses and notes
  'wallet.updated': 'Ændret {date}',
  'wallet.copyField': 'Kopiér {field}',
  'card.untitled': 'Kort',
  'card.newTitle': 'Nyt kort',
  'card.editTitle': 'Rediger kort',
  'card.titleHint': 'Efterlades det tomt, får kortet navn efter sit netværk og de sidste fire cifre.',
  'card.number': 'Kortnummer',
  'card.numberCheck': 'Dette nummer går ikke op: Tjek hvert ciffer.',
  'card.holder': 'Navn på kortet',
  'card.expiry': 'Udløber',
  'card.month': 'Måned',
  'card.year': 'År',
  'card.code': 'Sikkerhedskode',
  'card.empty': 'Giv det et kortnummer eller et navn.',
  'card.expired': 'Dette kort er udløbet.',
  'card.expiredOn': 'udløb {expiry}',
  'card.copyNumber': 'Kopiér kortnummer',
  'card.copyExpiry': 'Kopiér udløbsdato',
  'address.untitled': 'Adresse',
  'address.newTitle': 'Ny adresse',
  'address.editTitle': 'Rediger adresse',
  'address.titleHint': 'Hjem, Arbejde … Efterlades det tomt, får den navn efter navnet i den.',
  'address.name': 'Fulde navn',
  'address.organization': 'Virksomhed',
  'address.street': 'Vejnavn og husnummer',
  'address.city': 'By',
  'address.region': 'Region',
  'address.postalCode': 'Postnummer',
  'address.country': 'Land',
  'address.chooseCountry': 'Vælg et land',
  'address.phone': 'Telefon',
  'address.email': 'E-mail',
  'address.address': 'Adresse',
  'address.empty': 'Skriv et navn eller en del af adressen.',
  'note.untitled': 'Note uden titel',
  'note.newTitle': 'Ny note',
  'note.editTitle': 'Rediger note',
  'note.title': 'Titel',
  'note.text': 'Note',
  'note.empty': 'Giv den en titel, eller skriv noget.',
  'note.edited': 'Redigeret {date}',

  // Pending save, in the popup
  'pending.saveTitle': 'Gem dette login?',
  'pending.updateTitle': 'Opdater adgangskoden?',
  'pending.lockedTitle': 'Gem det login, du lige brugte?',
  'pending.body': '{username} på {site}',
  'pending.bodyNoUser': 'En adgangskode til {site}',
  'pending.save': 'Gem',
  'pending.update': 'Opdater',
  'pending.never': 'Aldrig for dette websted',

  // Item
  'item.username': 'Brugernavn',
  'item.password': 'Adgangskode',
  'item.website': 'Websted',
  'item.websites': 'Websteder',
  'item.notes': 'Noter',
  'item.favorite': 'Favorit',
  'item.unfavorite': 'Fjern fra favoritter',
  'item.addFavorite': 'Føj til favoritter',
  'item.trash': 'Flyt til papirkurven',
  'item.updated': 'Adgangskode ændret {date}',
  'item.history': 'Tidligere adgangskoder',
  'item.weak': 'Denne adgangskode er svag: Den ville ikke tage lang tid at gætte.',
  'item.reused': {
    one: 'Denne adgangskode bruges også til {count} andet login. Hvis ét websted lækker den, er begge åbne.',
    other: 'Denne adgangskode bruges også til {count} andre logins. Hvis ét websted lækker den, er alle åbne.',
  },
  'item.changePassword': 'Skift den på webstedet',
  'item.openSite': 'Åbn {site}',
  'item.passkey': 'Adgangsnøgle',
  'item.passkeyBody': 'Til {site}, gemt {date}',

  // Edit
  'edit.newTitle': 'Nyt login',
  'edit.editTitle': 'Rediger login',
  'edit.title': 'Navn',
  'edit.titleHint': 'Efterlades det tomt, får det navn efter websitet.',
  'edit.username': 'Brugernavn eller e-mail',
  'edit.password': 'Adgangskode',
  'edit.generate': 'Generer',
  'edit.websites': 'Websteder',
  'edit.websitesHint': 'Ét pr. linje. Passhold tilbyder dette login på disse websteder.',
  'edit.notes': 'Noter',
  'edit.empty': 'Giv det et navn, et brugernavn eller en adgangskode.',

  // Fields of an item's own, and folders
  'fields.title': 'Egne felter',
  'fields.add': 'Tilføj et felt',
  'fields.name': 'Feltnavn',
  'fields.value': 'Værdi',
  'fields.hidden': 'Skjul det, ligesom en adgangskode',
  'fields.remove': 'Fjern dette felt',
  'fields.unnamed': 'Felt',
  'fields.copy': 'Kopiér {name}',
  'folders.label': 'Mappe',
  'folders.placeholder': 'Ingen mappe',
  'folders.choose': 'Eksisterende mapper',
  'folders.hint': 'Hold ting samlet – Arbejde, Familie, Bank – og vis én mappe ad gangen.',
  'folders.all': 'Alle mapper',
  'folders.none': 'I ingen mappe',
  'folders.count': { one: '{count} post', other: '{count} poster' },
  'folders.nothingHere': 'Intet af denne slags i denne mappe.',
  'folders.rename': 'Omdøb',
  'folders.renameTo': 'Nyt navn til mappen',
  'folders.remove': 'Fjern mappe',
  'folders.removeHint': 'Det, der ligger i den, bliver, men uden mappe.',

  // Generator
  'generator.length': 'Længde',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'Udelad tegn, der ligner hinanden (I l 1 O 0)',
  'generator.again': 'En anden',
  'generator.use': 'Brug denne adgangskode',
  'generator.bits': '{bits} bit',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold er låst.',
  'menu.unlock': 'Lås Passhold op',
  'menu.unlockHint': 'Klik på Passhold i værktøjslinjen for at låse op, og kom så tilbage hertil.',
  'menu.none': 'Ingen gemte logins til {site}.',
  'menu.uninitialized': 'Opsæt Passhold først: Klik på det i værktøjslinjen.',
  'menu.suggest': 'Brug en stærk adgangskode',
  'menu.suggestBody': 'En ny adgangskode, udfyldt for dig. Passhold tilbyder at gemme den, når formularen er sendt.',
  'menu.fillFor': 'Udfyld på {site}',
  'menu.hidden': 'Passhold er dækket af noget på siden, så det udfylder ikke.',
  'menu.passkey': 'Adgangsnøgle · {username}',
  'menu.noCards': 'Ingen kort i Passhold endnu. Tilføj et fra Passhold i værktøjslinjen.',
  'menu.noAddresses': 'Ingen adresser i Passhold endnu. Tilføj en fra Passhold i værktøjslinjen.',
  'menu.cardInsecure':
    'Denne side er ikke sikker (ukrypteret http), så Passhold udfylder ikke et kort her: Enhver på vejen kunne læse det.',

  // A website's passkey
  'passkey.saveTitle': 'Gem en adgangsnøgle til {site}?',
  'passkey.save': 'Gem adgangsnøgle',
  'passkey.saveElsewhere': 'Gem et andet sted',
  'passkey.useElsewhere': 'Brug en adgangsnøgle fra et andet sted',
  'passkey.existsTitle': 'Denne adgangsnøgle er allerede i Passhold',
  'passkey.ok': 'OK',
  'passkey.signInTitle': 'Log ind på {site}',
  'passkey.signInBody': 'Med en adgangsnøgle gemt i Passhold',
  'passkey.none': 'Ingen adgangsnøgle til {site} i Passhold.',
  'passkey.hidden': 'Passhold er dækket af noget på siden, så det svarer ikke.',

  // Save prompt on a page
  'prompt.save': 'Gem login i Passhold?',
  'prompt.update': 'Opdater adgangskoden i Passhold?',
  'prompt.saveButton': 'Gem',
  'prompt.updateButton': 'Opdater',
  'prompt.never': 'Aldrig for dette websted',
  'prompt.saved': 'Gemt i Passhold.',
  'prompt.locked': 'Klik på Passhold i værktøjslinjen og lås op – så spørger den, om du vil gemme der.',
  'prompt.saveCard': 'Gem kort i Passhold?',
  'prompt.updateCard': 'Opdater kortet i Passhold?',
  'prompt.saveAddress': 'Gem adresse i Passhold?',
  'prompt.saveCheckout': 'Gem kort og adresse i Passhold?',

  // Settings
  'settings.title': 'Indstillinger',
  'settings.cannotOpen': 'Kan den slet ikke åbnes? Fjern boksen fra denne browser',
  'settings.encryptedHere': 'Krypteret på denne enhed',
  'settings.source': 'Kildekode på GitHub',

  'nav.passwords': 'Adgangskoder',
  'nav.accountSync': 'Konto og synkronisering',
  'nav.family': 'Familie',
  'nav.account': 'Keyrook-konto',
  'nav.backup': 'Sikkerhedskopi og import',
  'nav.security': 'Sikkerhed',
  'nav.general': 'Generelt',
  'nav.needsAttention': 'kræver opmærksomhed',


  'account.description':
    'Log ind, så følger dine logins dig til hver browser, hvor du logger ind på Passhold. De krypteres først på denne enhed: Keyrooks server kan ikke læse dem, heller ikke hvilke websteder de er til.',
  'account.email': 'E-mail',
  'account.password': 'Keyrook-kontoadgangskode',
  'account.signIn': 'Log ind',
  'account.signingIn': 'Logger ind…',
  'account.note':
    'Samme konto som i Keyrook Authenticator. En konto oprettet med Google eller GitHub logger ind med dens knap.',
  'account.haveOne': 'Jeg har en konto',
  'account.create': 'Opret en konto',
  'account.sendCode': 'Send mig en kode på e-mail',
  'account.createNote':
    'Keyrook sender en seks-cifret kode på e-mail for at bekræfte, at adressen er din. Har adressen allerede en konto, siger e-mailen det i stedet: Log ind med den.',
  'account.codeSent': 'En kode er på vej til {email}. Den virker i femten minutter.',
  'account.code': 'Seks-cifret kode',
  'account.newPassword': 'Keyrook-kontoadgangskode',
  'account.passwordNote':
    'Denne adgangskode åbner din Keyrook-konto i enhver browser, både for Passhold og Keyrook Authenticator. Keyrook ser den aldrig og kan ikke nulstille den for dig; gendannelsesnøglen, du får dernæst, er måden at sætte en ny på.',
  'account.createButton': 'Opret konto',
  'account.creating': 'Opretter…',
  'account.otherEmail': 'Brug en anden adresse',
  'account.signedInAs': 'Logget ind som {email}',
  'account.signedInAsNamed': 'Logget ind som {name} ({email})',
  'account.synced': 'Synkroniseret {date}',
  'account.notSynced': 'Ikke synkroniseret endnu',
  'account.syncNow': 'Synkronisér nu',

  // The account, at the foot of the popup
  'accountBar.synced': 'Synkroniseret {time}',
  'accountBar.justNow': 'lige nu',
  'accountBar.syncing': 'Synkroniserer…',
  'accountBar.signedOut': 'Logget ud – log ind igen for at synkronisere',
  'accountBar.startedOver': 'Konto startet forfra – log ind igen',
  'accountBar.removed': 'Fjernet fra kontoen – log ind igen for at synkronisere',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'Fjernet fra din Keyrook-konto',
  'removed.body':
    'Den {date} blev denne browser fjernet fra din Keyrook-konto, så Passhold tog kontoens logins, kort, adresser og noter af den og logede den ud. Det, der blev tilføjet eller ændret her og aldrig sendt, blev som denne browsers egen. Log ind igen for at hente resten tilbage.',

  // Passwords, in Settings
  'passwords.description':
    'Hvert login, hver adgangsnøgle, hvert kort, hver adresse og hver note i Passhold. Vælg en for at se den, kopiere fra den eller ændre den.',
  'passwords.all': 'Alle',
  'passwords.attention': 'Kræver opmærksomhed',
  'passwords.weak': 'Svag',
  'passwords.reused': 'Brugt flere gange',
  'account.syncDone': 'Synkroniseret.',
  'account.removed': {
    one: '{count} post, slettet for godt på en anden enhed, blev fjernet her.',
    other: '{count} poster, slettet for godt på en anden enhed, blev fjernet her.',
  },
  'account.skipped': {
    one: '{count} post kunne ikke åbnes og blev ladet være.',
    other: '{count} poster kunne ikke åbnes og blev ladet være.',
  },
  'account.manage': 'Administrér din Keyrook-konto',
  'account.manageBody':
    'Skift adgangskoden, lav en ny gendannelsesnøgle eller start kontoen forfra på account.keyrook.com – for både Passhold og Keyrook Authenticator.',
  'account.manageBodyProvider':
    'Lav en ny gendannelsesnøgle eller start kontoen forfra på account.keyrook.com – for både Passhold og Keyrook Authenticator.',
  'account.manageOpen': 'Åbn',
  'account.signOut': 'Log ud',
  'account.signOutBody': 'Fjerner hvert login fra denne browser, efter en sidste synkronisering. Log ind igen, så kommer de tilbage.',
  'account.signOutConfirm':
    'Passhold synkroniserer én gang til og fjerner derefter boksen fra denne browser. Intet fjernes, hvis et login ikke har nået din konto.',
  'account.signOutButton': 'Log ud og fjern',
  'account.signedOutByServer': 'Keyrook logede denne browser ud. Log ind igen for at fortsætte med at synkronisere.',
  'account.startedOver':
    'Din Keyrook-konto startede forfra den {date}, så Keyrook logede denne browser ud. Log ind med kontoens nye adgangskode: Loginene her uploades under kontoens nye nøgler.',
  'account.startedOverProvider':
    'Din Keyrook-konto startede forfra den {date}, så Keyrook logede denne browser ud. Log ind med Google eller GitHub: Loginene her uploades under kontoens nye nøgler.',
  'account.forgot': 'Glemt adgangskoden?',
  'account.recoverBody':
    'Keyrook sender en kode til kontoens adresse. Skriv den så, kontogendannelsesnøglen fra arket, du gemte, da kontoen blev oprettet, og en ny adgangskode. Enhver anden browser og app, der er logget ind på kontoen, vil spørge efter den nye.',
  'account.recoveryKey': 'Kontogendannelsesnøgle',
  'account.recoverPassword': 'Ny kontoadgangskode',
  'account.recoverButton': 'Sæt ny adgangskode',
  'account.recovering': 'Sætter…',
  'account.backToSignIn': 'Tilbage til login',
  'startOver.link': 'Mistet gendannelsesnøglen også? Start kontoen forfra',
  'startOver.title': 'Start kontoen forfra',
  'needsRoot.body':
    'Har du kontogendannelsesnøglen, som Keyrook Authenticator gav dig, så skriv den: Så åbner den også Passhold. Uden den laver Passhold en ny gendannelsesnøgle til kontoen, som vises én gang, og den gamle holder op med at virke.',
  'needsRoot.sheet': 'Kontogendannelsesnøgle fra Keyrook Authenticator (hvis du har den)',
  'needsRoot.withSheet': 'Brug denne nøgle',
  'needsRoot.newSheet': 'Lav en ny gendannelsesnøgle',
  'startOver.body':
    'Når kun e-mailadressen er tilbage, kan kontoen starte forfra med nye nøgler og en ny gendannelsesnøgle. Det træder i kraft en uge efter, du beder om det, og indtil da kan enhver browser, der stadig er logget ind på kontoen, annullere det – så nogen, der kun har din e-mail, kan ikke tage det. Alt, kontoen havde, gemmer Keyrook stadig forseglet i 90 dage: Den gamle adgangskode eller den gamle gendannelsesnøgle henter det tilbage.',
  'startOver.button': 'Start forfra',
  'startOver.working': 'Starter forfra…',
  'startOver.kitBody':
    'Kontoens nye gendannelsesnøgle: Den virker, når kontoen er startet forfra. Passhold viser den kun nu, så gem den, før du går videre.',
  'startOver.waitTitle': 'Din konto starter forfra den {date}',
  'startOver.waitBody':
    'Indtil da ændrer intet sig, og enhver browser, der stadig er logget ind på kontoen, kan annullere det. Keyrook skriver til {email} nu, dagen før og når det sker.',
  'startOver.waitThen':
    'Derefter logger du ind her med din nye adgangskode. Loginene i denne browser uploades under kontoens nye nøgler, og det, den havde før, gemmes i 90 dage.',
  'startOver.waitThenProvider':
    'Derefter logger du ind her med Google eller GitHub, som før. Loginene i denne browser uploades under kontoens nye nøgler, og det, den havde før, gemmes i 90 dage.',
  'startOver.understood': 'Forstået',
  'startOver.doneTitle': 'Din konto er startet forfra',
  'startOver.doneBody':
    'Log ind med din nye adgangskode: Loginene i denne browser uploades under kontoens nye nøgler, og det, den havde før, gemmes i 90 dage.',
  'startOver.doneBodyProvider':
    'Log ind med Google eller GitHub, som før: Loginene i denne browser uploades under kontoens nye nøgler, og det, den havde før, gemmes i 90 dage.',
  'startOverWait.title': 'Din Keyrook-konto starter forfra den {date}',
  'startOverWait.body':
    'Det blev bedt om med koden, Keyrook sendte dig på e-mail, fra en enhed, der kaldte sig »{device}«. Var det ikke dig, kan nogen læse din e-mail: Annuller det nu, og skift derefter din e-mailadgangskode. Var det dig, så lad det være.',
  'startOverWait.bodyNoName':
    'Det blev bedt om med koden, Keyrook sendte dig på e-mail. Var det ikke dig, kan nogen læse din e-mail: Annuller det nu, og skift derefter din e-mailadgangskode. Var det dig, så lad det være.',
  'startOverWait.cancel': 'Annuller genstarten',
  'kept.title': {
    one: 'Gemt fra før kontoen startede forfra: {count} post',
    other: 'Gemt fra før kontoen startede forfra: {count} poster',
  },
  'kept.body': 'Indtil {date}. Den gamle kontoadgangskode eller den gamle gendannelsesnøgle henter dem tilbage til Passhold.',
  'kept.open': 'Hent tilbage',
  'kept.secret': 'Gammel kontoadgangskode eller gammel gendannelsesnøgle',
  'kept.done': { one: '{count} post hentet tilbage.', other: '{count} poster hentet tilbage.' },
  'kept.nothingNew': 'Alt, der blev gemt, er allerede her.',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': 'Fortsæt med {provider}',
  'provider.passwordTitle': 'Denne Keyrook-konto har en adgangskode',
  'provider.passwordBody':
    'Du loggede ind med {provider} som {email}. Kontoens adgangskode er det, der åbner Passhold her: Skriv den én gang.',
  'provider.openAccountPage': 'Åbn account.keyrook.com',
  'secondStep.title': 'Totrinslogin',
  'secondStep.body':
    'Skriv den seks-cifrede kode, din authenticator-app viser for Keyrook. App væk? Skriv i stedet din kontogendannelsesnøgle.',
  'secondStep.ownerBody':
    'Din konto kræver også et andet trin for dette: koden fra din authenticator-app eller din kontogendannelsesnøgle.',
  'secondStep.field': 'Kode eller gendannelsesnøgle',
  'secondStep.continue': 'Fortsæt',
  'secondStep.passkey': 'Brug i stedet en adgangsnøgle',
  'secondStep.nextBody':
    'Også for at give kontoen dens nøgle kræves en kode, og hver kode virker kun én gang. Vent, til din authenticator-app viser en ny, og skriv den så – eller din kontogendannelsesnøgle.',
  'provider.or': 'eller',
  'provider.signedInWith': 'Logget ind med {provider} som {email}',
  'provider.signedInWithNamed': 'Logget ind med {provider} som {name} ({email})',
  'provider.newTitle': 'Opret din Keyrook-konto',
  'provider.newBody':
    'Du logger ind med {provider} som {email}. Kontoen har ingen adgangskode: {provider} logger dig ind. På en anden computer lukker en browser, der allerede er logget ind, dig ind – eller det gør gendannelsesnøglen, du får dernæst.',
  'provider.joinTitle': 'Lad denne browser ind',
  'provider.joinBody':
    '{email} er logget ind her, men nøglen, der åbner dine logins, ligger på dine andre computere. Åbn Passhold på en af dem – Indstillinger, Konto og synkronisering – og lad denne browser ind.',
  'provider.waiting': 'Venter på en anden browser…',
  'provider.compare': 'Den anden browser viser en kode. Lad den ind dér kun, hvis det er denne:',
  'provider.ended': 'Anmodningen sluttede, før en anden browser lod denne ind.',
  'provider.askAgain': 'Spørg igen',
  'provider.useKit': 'Brug i stedet gendannelsesnøglen',
  'provider.useThisKey': 'Brug denne nøgle',
  'provider.needsRoot':
    '{email} blev oprettet i Keyrook Authenticator, før hver Keyrook-app havde sin egen nøgle. Passhold kan give den en nu, når du bekræfter med {provider} igen; intet i Authenticator ændres.',
  'provider.confirmWith': 'Bekræft med {provider}',
  'provider.noKeyYet':
    'Passhold er endnu ikke logget ind på {email} nogen steder, så ingen anden browser kan lukke denne ind. Kontoens gendannelsesnøgle åbner den.',
  'passkey.onLabel': 'Nye computere åbner med din adgangsnøgle',
  'passkey.offLabel': 'Ingen adgangsnøgle til nye computere',
  'passkey.body':
    'På en ny computer: {provider}, derefter din adgangsnøgle – og hvert login er der. Gemt i Google Password Manager er adgangsnøglen på hver Chrome, du logger ind i.',
  'passkey.bodyEdge':
    'På en ny computer: {provider}, derefter din adgangsnøgle – og hvert login er der. Gemt, hvor den synkroniseres, er adgangsnøglen også på dine andre enheder.',
  'passkey.turnOn': 'Slå til',
  'passkey.turnOff': 'Slå fra',
  'passkey.joinTitle': 'Åbn med din adgangsnøgle',
  'passkey.joinBody': '{email} har en adgangsnøgle til nye computere. Bekræft med den, så kommer dine logins ned.',
  'passkey.use': 'Brug adgangsnøgle',
  'passkey.otherWays': 'Andre veje ind',
  'pairing.asking': '{device} vil lukkes ind på din konto.',
  'pairing.start': 'Luk ind…',
  'pairing.notMe': 'Ikke mig',
  'pairing.compare': 'Luk den kun ind, hvis den nye browser viser præcis denne kode:',
  'pairing.match': 'Koderne er ens – luk ind',
  'pairing.differ': 'Koderne er forskellige',

  'accountKit.title': 'Gem din kontogendannelsesnøgle',
  'accountKit.body':
    'Glemmer du din Keyrook-kontoadgangskode, sætter denne nøgle en ny – for både Passhold og Keyrook Authenticator. Keyrook ser aldrig din adgangskode, så dette er den eneste vej. Du kan se den igen under Indstillinger; gem den også et andet sted.',
  'accountKit.fileTitle': 'Keyrook-kontogendannelsesnøgle',
  'accountKit.fileBody':
    'Glemmer du din Keyrook-kontoadgangskode, sætter denne nøgle en ny: I Passhold under Indstillinger → Konto og synkronisering → »Glemt adgangskoden?«. Den, der har den og din e-mailadresse, kan gøre det samme, så gem den sikkert og ikke på denne computer.',
  'accountKit.bodyNoPassword':
    'Din konto har ingen adgangskode: En browser, der allerede er logget ind, lukker en ny ind. Er ingen tilbage, gør denne nøgle det – for både Passhold og Keyrook Authenticator. Du kan se den igen under Indstillinger; gem den også et andet sted.',
  'accountKit.fileBodyNoPassword':
    'Er ingen computer tilbage logget ind på din Keyrook-konto, lukker denne nøgle en ny ind: Log ind med Google eller GitHub, og vælg »Brug i stedet gendannelsesnøglen«. Den, der har den og også kan logge ind som dig, kan gøre det samme, så gem den sikkert og ikke på denne computer.',
  'accountKit.whenTitleNoPassword': 'Når ingen computer er logget ind',
  'accountKit.inPassholdNoPassword':
    'I Passhold: Log ind med Google eller GitHub, vælg »Brug i stedet gendannelsesnøglen«, og skriv denne nøgle.',
  'accountKit.keepNoPassword':
    'Gem dette ark et sikkert sted, væk fra din computer. Med det kan den, der kan logge ind på din Google- eller GitHub-konto, åbne din Keyrook-konto.',
  'accountKit.rowBodyNoPassword': 'Lukker en ny computer ind, når ingen anden er tilbage til det.',
  'accountKit.sheetTitle': 'Keyrook-kontogendannelsessæt',
  'accountKit.whenTitle': 'Når kontoadgangskoden er glemt',
  'accountKit.inPasshold':
    'I Passhold: Indstillinger → Konto og synkronisering → »Glemt adgangskoden?«, derefter din e-mailadresse, koden Keyrook sender på e-mail, denne nøgle og en ny adgangskode.',
  'accountKit.inAuthenticator': 'Keyrook Authenticator tager den samme nøgle: »Glemt adgangskode?«, der hvor den beder dig logge ind.',
  'accountKit.keep':
    'Gem dette ark et sikkert sted, væk fra din computer. Den, der har det og din e-mailindbakke, kan sætte en ny adgangskode til kontoen.',
  'accountKit.pending': 'Kontogendannelsesnøgle ikke gemt',
  'accountKit.keptState': 'Kontogendannelsesnøgle gemt',
  'accountKit.elsewhere': 'Kontogendannelsesnøgle lavet et andet sted',
  'accountKit.none': 'Ingen kontogendannelsesnøgle',
  'accountKit.rowBody': 'Sætter en ny kontoadgangskode, hvis den glemmes. En ny stopper den gamle i at virke, i hver app.',
  'accountKit.elsewhereBody':
    'Lavet på account.keyrook.com, i Keyrook Authenticator eller i en anden browser: Dens nøgle står på arket, der blev gemt dengang. Laver du en her, holder den op med at virke.',
  'accountKit.noneBody':
    'Uden en kan en glemt kontoadgangskode ikke nulstilles, og det, der gemmes hos Keyrook, kan ikke åbnes. Logins i denne browser bliver der under alle omstændigheder.',
  'accountKit.make': 'Lav en',
  'accountKit.apart':
    'Hold den adskilt fra din e-mail: Den, der har denne nøgle og kan læse din e-mail, kan sætte en ny adgangskode og åbne dine logins. Send den ikke til dig selv på e-mail, og gem den ikke i den e-mails cloud-lager.',
  'accountKit.apartNoPassword':
    'Hold den adskilt fra Google- eller GitHub-kontoen, du logger ind med: Den, der har denne nøgle og kan logge ind som dig der, kan åbne dine logins. Send den ikke til dig selv på e-mail, og gem den ikke i den kontos cloud-lager.',
  'accountKit.unchecked': 'Kontogendannelsesnøgle ikke tjekket endnu',
  'accountKit.uncheckedBody':
    'Din konto har en gendannelsesnøgle, lavet på account.keyrook.com eller i en anden app. Skriv den én gang: Passhold tjekker, at den åbner din konto, og gemmer den, så den kan vises igen.',
  'accountKit.typeIt': 'Skriv den',
  'accountKit.checked': 'Den åbner din konto. Passhold gemmer den nu, så den kan vises igen her.',
  'accountKit.draftBody':
    'Kontoens nye gendannelsesnøgle. Den virker ikke endnu: Når du har gemt den og skrevet den tilbage, sætter din kontoadgangskode den, og den gamle holder op med at virke.',
  'accountKit.setTitle': 'Sæt din nye gendannelsesnøgle',
  'accountKit.setBody': 'Skriv din Keyrook-kontoadgangskode. Indtil da virker din gamle gendannelsesnøgle stadig, og denne virker ikke.',
  'accountKit.set': 'Sæt den',
  'checkup.clear': 'Intet at rette',
  'checkup.clearBody': 'Ingen svage eller genbrugte adgangskoder, og din sikkerhedskopi er opdateret.',
  'checkup.issues': { one: '{count} punkt at se på', other: '{count} punkter at se på' },
  'checkup.issuesBody': 'Hvert enkelt nedenfor siger, hvorfor det betyder noget, og hvordan du retter det.',
  'checkup.backup': 'Sikkerhedskopi',
  'checkup.access': 'Adgang',
  'checkup.recoveryPending':
    'Gendannelsesnøglen, der blev lavet til denne boks, er aldrig blevet bekræftet som gemt, og den er den eneste adgang, hvis {method} holder op med at virke. Lav en ny, og gem den.',
  'checkup.deviceMissing':
    'Denne boks har ingen hovedadgangskode, så uden {method} her spørger hver oplåsning efter gendannelsesnøglen.',
  'checkup.lastBackup': 'Sidste sikkerhedskopi {date}',
  'checkup.backupNever':
    'Går denne browser tabt, går dine logins også tabt. En sikkerhedskopi er en krypteret fil, som du gemmer et andet sted.',
  'checkup.backupDue': 'Din boks er ændret siden da. Lav en ny, så den indeholder alt.',
  'checkup.backUp': 'Sikkerhedskopiér nu',
  'checkup.weak': { one: '{count} svag adgangskode', other: '{count} svage adgangskoder' },
  'checkup.weakBody':
    'For kort eller for enkel til at blive gættet. Skift hver enkelt på dens websted; Passhold foreslår en stærk i formularen og tilbyder at gemme den.',
  'checkup.weakNone': 'Ingen.',
  'checkup.reused': {
    one: '{count} adgangskode brugt mere end én gang',
    other: '{count} adgangskoder brugt mere end én gang',
  },
  'checkup.reusedBody': 'Når ét websted lækker en adgangskode, prøver folk den alle andre steder. Giv hvert login sin egen.',
  'checkup.reusedNone': 'Ingen: Hvert login har sin egen adgangskode.',
  'checkup.sharedBy': { one: 'Delt af {count} login', other: 'Delt af {count} logins' },
  'checkup.change': 'Skift',
  'checkup.limits':
    'Passhold tjekker ikke, om en adgangskode er dukket op i et datalæk: Det ville kræve at spørge en server, og Passhold spørger ingen. Det minder heller ikke om gamle adgangskoder – en stærk, unik en bliver ikke slidt.',

  'backup.description': 'Gem en krypteret kopi, hent en tilbage, eller flyt logins ind og ud.',
  'backup.backupRow': 'Hele din boks i én krypteret fil, under din hovedadgangskode.',
  'backup.restoreRow': 'Føj loginene i en sikkerhedskopifil til denne boks.',
  'backup.importRow': 'Fra en anden browser eller adgangskodeadministrator, som en CSV-fil eller Bitwardens JSON.',
  'backup.exportRow': 'En CSV-fil, andre apps kan læse. Ikke krypteret.',

  'security.description': 'Hvordan Passhold åbner, og hvornår det lukker igen.',
  'security.locking': 'Låsning',
  'security.opensTitle': 'Sådan åbner Passhold',
  'security.opensBody': 'Ingen hovedadgangskode: {method} åbner den, og gendannelsesnøglen, når {method} ikke kan.',
  'security.setPassword': 'Brug i stedet en hovedadgangskode',
  'security.setPasswordBody': 'Passhold åbner så med en adgangskode, du vælger, og gendannelsesnøglen åbner den ikke længere.',
  'security.setPasswordOpen': 'Sæt en',
  'security.setPasswordSave': 'Brug denne adgangskode',
  'security.dropPassword': 'Stop med at bruge en hovedadgangskode',
  'security.dropPasswordBody':
    'Åbn den alene med {method}, og gem en gendannelsesnøgle til den dag, det ikke kan. Hovedadgangskoden åbner ikke længere boksen.',
  'security.dropPasswordOpen': 'Skift',
  'security.dropPasswordSave': 'Skift og vis gendannelsesnøglen',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'enhedens skærmlås',
  'device.method.passkey': 'din adgangsnøgle',
  'device.title': 'Lås op med {method}',
  'device.description': 'Den hurtigste vej ind, og den virker også, efter browseren er genstartet.',
  'device.on': 'Til',
  'device.off': 'Fra',
  'device.body':
    'Dit fingeraftryk eller dit ansigt åbner Passhold – eller på de fleste computere computerens egen adgangskode. Så den, der kan låse denne computer op, kan åbne Passhold. Det, den åbner, bliver på denne computer og er ubrugeligt uden den.',
  'device.whereMac':
    'Når Chrome spørger, hvor adgangsnøglen skal gemmes, så vælg Google Password Manager. En adgangsnøgle i din Chrome-profil kan ikke låse Passhold op, og iCloud-nøglering kan det heller ikke på hver Mac.',
  'device.whereMacEdge':
    'Når Edge spørger, hvor adgangsnøglen skal gemmes, så vælg et sted, der også gemmer den på dine andre enheder. Ikke alle steder kan låse Passhold op: Kan det sted, du vælger, ikke, siger Passhold det, og intet ændres.',
  'device.unavailable': 'Ikke tilgængelig her',
  'device.unavailableBody':
    'Denne browser fandt ingen fingeraftryk-, ansigts- eller skærmlås, som Passhold kan bruge. PIN-koden virker overalt.',
  'device.unavailableRecovery':
    'Denne browser fandt ingen fingeraftryk-, ansigts- eller skærmlås, som Passhold kan bruge, så denne boks åbnes her med sin gendannelsesnøgle. Sæt en hovedadgangskode, hvis du hellere vil skrive den.',
  'device.opensWith': '{method} åbner Passhold',
  'device.notHere': '{method} er ikke sat op i denne browser',
  'device.isTheWayIn':
    'Uden hovedadgangskode er det sådan, Passhold åbner. For at slå det fra skal du først sætte en hovedadgangskode.',
  'device.setUpHere': 'Indtil {method} er sat op her, spørger hver oplåsning efter gendannelsesnøglen.',
  'device.setUp': 'Sæt op',
  'device.turnOff': 'Slå fra',
  'device.save': 'Sæt {method} op',
  'keys.title': 'Lås op med en sikkerhedsnøgle',
  'keys.description': 'En USB-nøgle, du sætter i: en vej mere ind, og den virker også, efter browseren er genstartet.',
  'keys.method': 'din sikkerhedsnøgle',
  'keys.on': { one: '{count} nøgle sat op', other: '{count} nøgler sat op' },
  'keys.off': 'Ingen nøgle sat op',
  'keys.body':
    'Sæt nøglen i, skriv dens PIN og rør den, så åbnes Passhold – kun på denne computer. Den, der har nøglen og kender dens PIN, kan åbne Passhold her, så behandl den, som du ville behandle en husnøgle. Går den tabt, så fjern den her: Dine andre veje ind virker stadig.',
  'keys.add': 'Tilføj en nøgle',
  'keys.save': 'Tilføj denne nøgle',
  'keys.one': 'Sikkerhedsnøgle',
  'keys.added': 'Tilføjet {date}',
  'keys.remove': 'Fjern',
  'pin.title': 'Lås op med en PIN',
  'pinOffer.title': 'Åbn Passhold hurtigere med en PIN',
  'pinOffer.body':
    'Skriv nogle få cifre i stedet for din adgangskode, hver gang Passhold låser sig, indtil browseren lukkes. Efter at browseren er startet igen, skriver du din adgangskode én gang.',
  'pinOffer.later': 'Du kan sætte en op eller slå den fra når som helst under Indstillinger, Sikkerhed.',
  'pin.description': 'Til de mange gange om dagen, Passhold låser sig, mens du sidder ved den samme browser.',
  'pin.on': 'Til',
  'pin.off': 'Fra',
  'pin.bodyRecovery':
    'Virker kun, mens browseren er åben, og kun efter fem forkerte forsøg: Derefter, eller efter en genstart, kræves enheden eller gendannelsesnøglen. Intet, som PIN-koden åbner, gemmes på disken.',
  'pin.body':
    'Virker kun, mens browseren er åben, og kun efter fem forkerte forsøg: Derefter, eller efter en genstart, kræves hovedadgangskoden. Intet, som PIN-koden åbner, gemmes på disken.',
  'pin.setUp': 'Sæt PIN op',
  'pin.change': 'Skift',
  'pin.turnOff': 'Slå fra',
  'pin.new': 'PIN, 6 til 12 cifre',
  'pin.again': 'Skriv den igen',
  'pin.save': 'Gem PIN',

  'general.description': 'Hvordan Passhold opfører sig på websteder, og hvordan det ser ud.',
  'general.filling': 'Udfyldning og gemning',
  'general.appearance': 'Sprog og udseende',
  'settings.autoSuggest': 'Vis forslag, når du klikker på et login-, kort- eller adressefelt',
  'settings.autoSuggestBody':
    'Dine logins til websitet, en stærk adgangskode på en tilmeldingsformular, dine kort og adresser ved betaling. Intet udfyldes, før du vælger.',

  'trash.description': 'Logins, kort, adresser og noter venter her, til du gendanner dem eller sletter dem for godt.',
  'trash.sharedDescription': 'Delt med familien: Enhver i den kan gendanne disse. Slettet for godt, er de væk for alle.',
  'trash.sharedMember': 'Delt med familien: Du kan gendanne disse. Kun en organisator i familien sletter dem for godt.',
  'settings.autoLock': 'Lås efter',
  'settings.autoLock.never': 'Kun når browseren lukkes',
  'settings.autoLock.minutes': { one: '{count} minut', other: '{count} minutter' },
  'settings.autoLock.hours': { one: '{count} time', other: '{count} timer' },
  'settings.lockWithSystem': 'Lås, når computeren låses eller går i dvale',
  'settings.clipboard': 'Slet kopierede adgangskoder efter',
  'settings.clipboard.never': 'Aldrig',
  'settings.clipboard.seconds': { one: '{count} sekund', other: '{count} sekunder' },
  'settings.clipboard.minutes': { one: '{count} minut', other: '{count} minutter' },
  'settings.inlineButton': 'Vis Passhold-knappen i login-, kort- og adressefelter',
  'settings.offerToSave': 'Tilbyd at gemme logins, når du logger ind',
  'settings.offerToSaveCards': 'Tilbyd at gemme kort og adresser, når du betaler',
  'settings.offerToSaveCardsBody':
    'Et kort kun fra en sikker (https) side, og kun et, hvis nummer går op. Det vises med de sidste fire cifre, aldrig med nummer eller kode.',
  'settings.passkeys': 'Gem og brug adgangsnøgler',
  'settings.passkeysBody':
    'Når et websted tilbyder en adgangsnøgle, gemmer Passhold den sammen med dine logins og logger dig ind med den. Slået fra overlades adgangsnøgler til browseren.',
  'settings.language': 'Sprog',
  'settings.language.auto': 'Samme som browseren',
  'settings.theme': 'Udseende',
  'settings.theme.system': 'Samme som systemet',
  'settings.theme.light': 'Lys',
  'settings.theme.dark': 'Mørk',

  'settings.security': 'Hovedadgangskode',
  'settings.securityBody': 'Ændrer du den, låses nøglen til din boks igen; dine logins bliver, som de er.',
  'settings.current': 'Nuværende hovedadgangskode',
  'settings.new': 'Ny hovedadgangskode',
  'settings.confirm': 'Skriv den nye igen',
  'settings.change': 'Skift hovedadgangskode',
  'settings.changeOpen': 'Skift',
  'settings.changed': 'Hovedadgangskoden er ændret.',

  'settings.backup': 'Sikkerhedskopi',
  'settings.backupBody':
    'Hele din boks i én krypteret fil. Gem den et andet sted end på denne computer – et USB-drev eller din cloudlagring – så tabet af denne browser ikke koster dig dine logins. Den åbnes kun med den hovedadgangskode, du havde, da du lavede den.',
  'settings.backupBodyRecovery':
    'Hele din boks i én krypteret fil. Gem den et andet sted end på denne computer – et USB-drev eller din cloudlagring – så tabet af denne browser ikke koster dig dine logins. Den åbnes med din gendannelsesnøgle.',
  'settings.backupLast': 'Sidste sikkerhedskopi: {date}',
  'settings.backupNever': 'Ingen sikkerhedskopi endnu.',
  'settings.backupButton': 'Hent sikkerhedskopi',
  'settings.backupDone': 'Gemt i dine downloads. Flyt den nu et sted hen, der ikke er denne computer.',

  'settings.restoreBackup': 'Gendan fra en sikkerhedskopi',
  'settings.restoreBodyNew':
    'Der er endnu ingen boks i denne browser. Hent din tilbage fra en sikkerhedskopifil – den åbnes med den hovedadgangskode, sikkerhedskopien blev lavet med – eller lav en ny med Passhold-knappen i værktøjslinjen.',
  'settings.restoreBodyMerge':
    'Lægger det, en sikkerhedskopi indeholder, til denne boks. Intet her slettes: Har begge det samme login, beholdes den nyere redigering, og den anden adgangskode flytter til dens historik.',
  'settings.restoreChoose': 'Vælg sikkerhedskopifil',
  'settings.restoreMade': 'Sikkerhedskopi lavet {date}',
  'settings.restorePassword': 'Hovedadgangskode for sikkerhedskopien',
  'settings.restoreRecoveryKey': 'Gendannelsesnøgle for sikkerhedskopien',
  'settings.restoreButton': 'Gendan',
  'settings.restoreNew': {
    one: 'Boks gendannet med {count} post.',
    other: 'Boks gendannet med {count} poster.',
  },
  'settings.restoreAdded': {
    one: 'Tilføjede {count} post fra sikkerhedskopien.',
    other: 'Tilføjede {count} poster fra sikkerhedskopien.',
  },
  'settings.restoreUpdated': {
    one: '{count} post havde en nyere redigering i sikkerhedskopien.',
    other: '{count} poster havde en nyere redigering i sikkerhedskopien.',
  },
  'settings.restoreNothing': 'Alt i sikkerhedskopien er allerede i denne boks.',

  'settings.import': 'Importér',
  'settings.importBody':
    'Hent dine adgangskoder fra Chrome, Edge, Firefox, Safari, Apple Passwords, Bitwarden, 1Password, LastPass, KeePass, Dashlane, Proton Pass eller NordPass: Eksportér dem dér som en CSV-fil, og vælg den her. Kort, adresser og noter i filen kommer også med. Fra Bitwarden eksporterer du som JSON (ikke krypteret): Deres CSV udelader kort, identiteter og adgangsnøgler. Dashlane lægger dem i egne filer: Vælg hver især i rækkefølge.',
  'settings.importChoose': 'Vælg fil',
  'settings.importFound': 'Fundet til import: {what}.',
  'settings.importLogins': { one: '{count} login', other: '{count} logins' },
  'settings.importPasskeys': { one: '{count} adgangsnøgle', other: '{count} adgangsnøgler' },
  'settings.importCards': { one: '{count} kort', other: '{count} kort' },
  'settings.importAddresses': { one: '{count} adresse', other: '{count} adresser' },
  'settings.importNotes': { one: '{count} note', other: '{count} noter' },
  'settings.importSkipped': {
    one: '{count} post indeholder intet, som Passhold gemmer, og springes over.',
    other: '{count} poster indeholder intet, som Passhold gemmer, og springes over.',
  },
  'settings.importDuplicates': {
    one: '{count} post er allerede i din boks.',
    other: '{count} poster er allerede i din boks.',
  },
  'settings.importConfirm': 'Importér',
  'settings.importDone': 'Importeret: {what}.',
  'settings.importDelete': 'Slet nu CSV-filen: Den indeholder dine adgangskoder i klartekst.',
  'settings.importNothing': 'Intet nyt at importere i den fil.',
  'settings.importTwoFactor': {
    one: '{count} login i denne fil har en kode til totrinslogin (2FA). Passhold gemmer ikke 2FA-koder: Flyt den over i en authenticator-app, før du sletter din gamle adgangskodeadministrator, ellers kan du blive låst ude af kontoen.',
    other: '{count} logins i denne fil har koder til totrinslogin (2FA). Passhold gemmer ikke 2FA-koder: Flyt dem over i en authenticator-app, før du sletter din gamle adgangskodeadministrator, ellers kan du blive låst ude af disse konti.',
  },
  'settings.importAuthenticator': 'Hent Keyrook Authenticator',
  'settings.importPasskeysLeft': {
    one: '{count} adgangsnøgle i denne fil kan ikke komme til Passhold. Behold din gamle adgangskodeadministrator, indtil du har logget ind på det websted på en anden måde og lavet en ny adgangsnøgle i Passhold.',
    other: '{count} adgangsnøgler i denne fil kan ikke komme til Passhold. Behold din gamle adgangskodeadministrator, indtil du har logget ind på disse websteder på en anden måde og lavet nye adgangsnøgler i Passhold.',
  },

  'settings.export': 'Eksportér',
  'settings.exportBody':
    'En CSV-fil, som alle browsere og adgangskodeadministratorer kan læse. Den indeholder dine adgangskoder i klartekst: Behold den kun, så længe du har brug for den. Den indeholder kun logins: Adgangsnøgler, egne felter, mapper, kort, adresser og noter er ikke med. En sikkerhedskopi indeholder alt.',
  'settings.exportButton': 'Eksportér CSV',
  'settings.exportDone': 'Eksporteret. Slet filen, når du er færdig med den.',

  'settings.neverSave': 'Tilbyd aldrig at gemme for',
  'settings.neverSaveEmpty': 'Ingen websteder. Vælg »Aldrig for dette websted«, når Passhold tilbyder at gemme, så vises det her.',
  'settings.remove': 'Fjern',

  'settings.trash': 'Papirkurv',
  'settings.trashEmpty': 'Papirkurven er tom.',
  'settings.restore': 'Gendan',
  'settings.deleteForever': 'Slet for altid',
  'settings.emptyTrash': 'Tøm papirkurven',
  'settings.emptyTrashConfirm': 'Slet alt i papirkurven for godt?',

  'settings.danger': 'Fjern boks',
  'settings.dangerBody':
    'Sletter boksen fra denne browser. Hvert login i den er væk for godt – download en sikkerhedskopi først, hvis du vil beholde dem.',
  'settings.dangerType': 'Skriv {word} for at bekræfte',
  'settings.dangerWord': 'slet',
  'settings.dangerButton': 'Fjern boks',

  'settings.about': 'Passhold {version} · af Keyrook',

  // Errors
  'error.noWorker': 'Passhold svarede ikke. Luk dette og prøv igen.',
  'error.wrongPassword': 'Det er ikke hovedadgangskoden.',
  'error.passwordTooShort': 'Brug mindst {min} tegn.',
  'error.vaultCorrupt': 'Boksen på denne enhed er beskadiget og kan ikke åbnes.',
  'error.vaultTooNew': 'Denne boks blev lavet af en nyere version af Passhold. Opdatér Passhold for at åbne den.',
  'error.itemNotFound': 'Det er ikke længere i boksen.',
  'error.familyOrganiserOnly': 'Kun en organisator i familien kan tømme denne boks papirkurv.',
  'error.familyGone': 'Den familie er ikke længere her. Synkronisér, og kig så igen.',
  'error.familyNotOpen': 'Passhold kan endnu ikke åbne den familie i denne browser. Synkronisér, og prøv igen.',
  'error.itemInvalid': 'Det kan ikke gemmes, som det er.',
  'error.importEmpty': 'Filen indeholder intet at importere.',
  'error.importTooLarge': 'Filen er for stor til at importere.',
  'error.importUnknownFormat': 'Filen ligner ikke en eksport af adgangskoder.',
  'error.importEncrypted':
    'Denne Bitwarden-eksport er krypteret, og Passhold kan ikke åbne den. Eksportér igen i Bitwarden som ».json«, ikke ».json (Encrypted)«, og vælg derefter filen.',
  'error.backupInvalid': 'Filen er ikke en Passhold-sikkerhedskopi, eller den er beskadiget.',
  'error.backupWrongPassword': 'Det er ikke den hovedadgangskode, sikkerhedskopien blev lavet med.',
  'error.backupWrongRecoveryKey': 'Det er ikke den gendannelsesnøgle, sikkerhedskopien blev lavet med.',
  'error.noRecoveryKey': 'Denne boks har ingen gendannelsesnøgle at vise: Den åbnes med en hovedadgangskode.',
  'error.wrongRecoveryKey': 'Det er ikke gendannelsesnøglen.',
  'error.deviceNeeded':
    'En boks uden hovedadgangskode åbnes med denne enheds oplåsning: Sæt den op først. Den bliver, indtil en hovedadgangskode er sat.',
  'error.accountOffline': 'Keyrook kunne ikke nås. Tjek forbindelsen, og prøv igen.',
  'error.accountWrong':
    'Forkert e-mail eller adgangskode. En konto oprettet med Google eller GitHub logger i stedet ind med dens knap.',
  'error.accountSignedOut': 'Keyrook logede denne browser ud. Log ind igen.',
  'error.accountBusy': {
    one: 'For mange forsøg. Vent {count} sekund, og prøv igen.',
    other: 'For mange forsøg. Vent {count} sekunder, og prøv igen.',
  },
  'error.accountFailed': 'Keyrook kunne ikke gøre det lige nu. Prøv igen senere.',
  'error.accountAlready': 'Denne boks er allerede logget ind på en Keyrook-konto.',
  'error.accountNone': 'Denne boks er ikke logget ind på en Keyrook-konto.',
  'error.accountKdfRefused': 'Keyrook bad om en svagere nøgle, end Passhold accepterer, så login blev stoppet.',
  'error.accountKeyWrong': 'Kontoens nøgle ville ikke åbne med den adgangskode.',
  'error.accountCode': 'Den kode er ikke rigtig, eller den er udløbet. Tjek e-mailen, eller bed om en ny.',
  'error.accountMail': 'Keyrook kunne ikke sende e-mailen lige nu. Prøv igen om et minut.',
  'error.providerDenied': 'Login blev annulleret.',
  'error.providerFailed': 'Google eller GitHub kunne ikke logge dig ind lige nu. Prøv igen.',
  'error.providerExpired': 'Det login er udløbet. Start forfra.',
  'error.providerNotOwner':
    'Det er ikke den konto, denne Keyrook-konto logger ind med. Log ind igen med den, du bruger til Keyrook.',
  'error.signOutUnsent': {
    one: 'Én post er endnu ikke nået til din Keyrook-konto, så intet blev fjernet. Tjek din forbindelse, eller log ind igen, og log så ud.',
    other: '{count} poster er endnu ikke nået til din Keyrook-konto, så intet blev fjernet. Tjek din forbindelse, eller log ind igen, og log så ud.',
  },
  'error.providerOtherProvider':
    'Denne e-mail har allerede en Keyrook-konto, der logger ind med den anden af Google og GitHub. Log ind med den.',
  'error.providerHasPassword':
    'Denne e-mail har allerede en Keyrook-konto med en adgangskode. Log ind her med din e-mail og adgangskode – eller tilføj den på account.keyrook.com for også at logge ind med Google eller GitHub, logget ind der med din adgangskode.',
  'error.providerEmailTaken':
    'Denne e-mail har allerede en Keyrook-konto, der logger ind på en anden måde. Log ind på den måde – eller tilføj denne til den på account.keyrook.com, logget ind der på den måde, den logger ind nu.',
  'error.pairingWrongKey':
    'Det, der kom tilbage, er ikke denne kontos nøgle, så det blev afvist. Spørg igen, og luk kun en browser ind, du kender.',
  'error.pairingRefused': 'Det kom ikke fra den browser, hvis kode du tjekkede, så det blev afvist. Spørg igen.',
  'error.pairingEnded': 'Anmodningen er afsluttet. Spørg igen fra den nye browser.',
  'error.passkeyWrong': 'Den adgangsnøgle åbner ikke denne konto. Prøv en anden vej ind.',
  'error.joinExpired': 'Det login ventede for længe. Log ind igen.',
  'error.accountPasswordWrong': 'Det er ikke kontoadgangskoden.',
  'error.accountNoKit': 'Passhold har ikke denne kontos gendannelsesnøgle.',
  'error.accountKitRace': 'En anden app ændrede kontoens gendannelsesnøgle lige nu. Synkronisér, og prøv igen.',
  'error.accountKitShape': 'Det ligner ikke en kontogendannelsesnøgle: Den er 32 bogstaver og cifre.',
  'error.accountKitWrong': 'Den gendannelsesnøgle passer ikke til en konto med denne e-mailadresse.',
  'error.accountKitNotThis': 'Det er ikke denne kontos gendannelsesnøgle. Se det, du gemte, igen.',
  'error.accountPasswordWeak':
    'For let at gætte til en konto: Brug en længere adgangskode med en blanding af bogstaver, tal og tegn, eller fire eller fem ubeslægtede ord.',
  'error.accountBoxWrong':
    'Passholds nøgle i denne konto ville ikke åbne. Log ind igen; hvis det stadig ikke virker, så start kontoen forfra.',
  'error.accountCodeWait': {
    one: 'En kode blev sendt for et øjeblik siden. Du kan bede om en ny om {count} sekund.',
    other: 'En kode blev sendt for et øjeblik siden. Du kan bede om en ny om {count} sekunder.',
  },
  'error.accountSignUpKeys': 'Keyrook bad om Passholds egen nøgle, og ingen blev sendt. Opdatér Passhold, og prøv igen.',
  'error.accountIdTaken': 'Kontoen kunne ikke oprettes lige nu. Bed om en ny kode, og prøv igen.',
  'error.accountNoRoot': 'Denne konto har endnu ingen nøgle, som en gendannelsesnøgle kan åbne. Log ind igen med adgangskoden.',
  'error.accountRootNotHeld':
    'Denne computer kunne ikke vise, at den har kontoens nøgle. Log ind igen med adgangskoden eller gendannelsesnøglen.',
  'error.accountRootChanged':
    'Denne kontos nøgler blev erstattet på en anden computer. Log ind på en computer, hvor Passhold stadig er logget ind, eller start kontoen forfra.',
  'error.accountKeyReplaced': 'Passholds nøgle i denne konto blev erstattet på en anden computer. Log ind igen.',
  'error.accountSessionStolen': 'Denne computer blev logget ud, fordi dens session blev brugt et andet sted. Log ind igen.',
  'error.accountOld':
    'Denne konto blev lavet med Google eller GitHub, før hver Keyrook-app havde sin egen nøgle, og intet i den åbner endnu Passhold. Start kontoen forfra med dens e-mail for at give den en.',
  'error.pairingBusy': 'For mange browsere venter på at komme ind på denne konto. Prøv igen om et par minutter.',
  'error.startOverExpired': 'Det er udløbet. Bed om en ny kode, og start forfra.',
  'error.startOverTooOften': 'Denne konto er for nylig startet forfra for ofte. Prøv igen efter {day}.',
  'error.startOverWaiting': 'Denne konto starter forfra den {day}. En browser, der stadig er logget ind på den, kan annullere det.',
  'error.startOverUpdate': 'Keyrook venter nu en uge, før en konto startes forfra. Opdatér Passhold for at bede om det.',
  'error.passkeyFailed': 'Den adgangsnøgle kunne ikke kontrolleres. Prøv igen.',
  'error.passkeyNotYou': 'Den adgangsnøgle bekræftede ikke, at det er dig. Prøv igen, og lås den op som bedt.',
  'error.passkeyUnknown':
    'Den adgangsnøgle findes ikke på nogen Keyrook-konto. Den er måske fjernet: Log ind med adgangskoden, eller med Google eller GitHub.',
  'error.passkeyExpired': 'Den adgangsnøgleanmodning er afsluttet. Prøv igen.',
  'error.passkeyNotOffered': 'Keyrook tilbyder endnu ikke adgangsnøgler her.',
  'error.passkeyNoUnlock':
    'Den adgangsnøgle logger ind, men er endnu ikke sat til at låse din konto op. Vælg »Let it unlock« ved siden af den under »Passkeys« på account.keyrook.com, og prøv igen. Eller log ind med adgangskoden, eller med Google eller GitHub.',
  'error.passkeyNoPrf':
    'Den adgangsnøgle logger ind på account.keyrook.com, men der, hvor den er gemt, kan den ikke låse din konto op – iCloud-nøglering før macOS 15 kan for eksempel ikke. Tilføj under »Passkeys« på account.keyrook.com en, der er gemt et sted, hvor den kan, for eksempel en sikkerhedsnøgle, og tjek, at der står »Unlocks your data«. Indtil da logger du ind med adgangskoden eller med Google eller GitHub.',
  'error.passkeyPermission':
    'Passhold har brug for Chromes tilladelse til at bruge adgangsnøglerne på account.keyrook.com. Vælg adgangsnøglen igen, og tillad det.',
  'error.passkeyPermissionEdge':
    'Passhold har brug for Edges tilladelse til at bruge adgangsnøglerne på account.keyrook.com. Vælg adgangsnøglen igen, og tillad det.',
  'error.passkeyCancelled': 'Ingen adgangsnøgle blev brugt. Prøv igen, eller log ind på en anden måde.',
  'error.secondStepNeeded': 'Din konto kræver et andet trin: Skriv også koden fra din authenticator-app.',
  'error.secondStepWrong': 'Den kode er ikke rigtig. Skriv den, din authenticator-app viser nu, eller din gendannelsesnøgle.',
  'error.signInExpired': 'Det login er udløbet. Log ind igen.',
  'error.secondStepUpdate': 'Din konto kræver et andet trin for at logge ind. Opdatér Passhold for at logge ind.',
  'error.secondStepAsked': 'Din konto kræver et andet trin: Skriv koden fra din authenticator-app.',
  'error.secondStepTaken':
    'Det er den kode, du loggede ind med, og hver kode virker kun én gang. Vent, til din authenticator-app viser en ny.',
  'error.kitDraftGone': 'Den nye gendannelsesnøgle blev ikke sat i tide, og intet er ændret. Lav en ny igen.',
  'error.archiveWrong': 'Det åbner ikke det, der blev gemt.',
  'error.archiveGone': 'Det gemmes ikke længere.',
  'error.archiveDeleteRefused': 'Kun den gamle adgangskode eller den gamle gendannelsesnøgle kan slette det, der blev gemt, før det udløber.',
  'error.accountNeedsRoot':
    'Denne konto blev lavet i Keyrook Authenticator, før hver Keyrook-app havde sin egen nøgle. Passhold kan give den en nu; intet i Authenticator ændres.',
  'error.accountServerWrong':
    'Keyrooks server svarede med noget, som kontoens nøgler ikke passer til, så Passhold stoppede. Prøv igen senere.',
  'error.startOverNeedsPassword': 'Denne konto har en adgangskode: Vælg en ny for at starte den forfra.',
  'error.pinInvalid': 'En PIN er 6 til 12 cifre.',
  'error.wrongPin': 'Det er ikke PIN-koden.',
  'error.wrongPinLeft': {
    one: 'Det er ikke PIN-koden. {count} forsøg tilbage.',
    other: 'Det er ikke PIN-koden. {count} forsøg tilbage.',
  },
  'error.pinLockedOut': 'For mange forkerte PIN-koder. Lås op på en anden måde; PIN-koden virker igen efter det.',
  'error.pinUnavailable': 'PIN-koden virker kun, mens browseren er åben. Lås op på en anden måde; PIN-koden virker igen efter det.',
  'error.deviceGone': 'Oplåsning med denne enhed er ikke længere sat op. Lås op på en anden måde.',
  'error.deviceKeyWrong': 'Det åbnede ikke Passhold. Lås op på en anden måde, og sæt så enhedsoplåsningen op igen.',
  'error.deviceUnsupported':
    'Der, hvor den adgangsnøgle blev gemt, kan Passhold ikke få en nøgle at åbne med. Prøv igen, og gem den i Google Password Manager – eller brug PIN-koden.',
  'error.deviceUnsupportedEdge':
    'Der, hvor den adgangsnøgle blev gemt, kan Passhold ikke få en nøgle at åbne med. Prøv igen, og gem den et andet sted – eller brug PIN-koden.',
  'error.deviceCancelled': 'Intet blev låst op: Det blev annulleret, eller det tog for lang tid.',
  'error.keyUnsupported':
    'Denne nøgle kan ikke give Passhold det, det skal bruge for at åbne. De fleste FIDO2-nøgler kan; en nøgle, der kun er lavet til totrinslogin (U2F), kan ikke.',
  'error.keyAlreadyAdded': 'Den nøgle er allerede sat op her.',
  'error.keyGone': 'Den sikkerhedsnøgle er ikke længere sat op her. Lås op på en anden måde.',
  'error.keyWrong': 'Den nøgle åbnede ikke Passhold. Lås op på en anden måde, fjern så nøglen, og tilføj den igen.',
  'error.kdfUnsupported': 'Boksens indstillinger er ikke dem, Passhold accepterer.',
  'error.locked': 'Passhold er låst.',
  'error.noVault': 'Der er endnu ingen boks.',
  'error.vaultExists': 'Der findes allerede en boks.',
  'error.notOnPage': 'Det login hører ikke til siden i denne fane.',
  'error.expired': 'Det er udløbet. Prøv igen.',
  'error.noFields': 'Der er intet på denne side, som Passhold kan udfylde.',
  'error.cardInsecure': 'Passhold udfylder kun et kort på en sikker (https) side.',
  'error.unknown': 'Noget gik galt: {detail}',
};
