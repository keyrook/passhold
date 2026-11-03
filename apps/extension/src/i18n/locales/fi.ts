import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'Keyrookin tekemä',

  // Common
  'common.cancel': 'Peruuta',
  'common.close': 'Sulje',
  'common.save': 'Tallenna',
  'common.edit': 'Muokkaa',
  'common.back': 'Takaisin',
  'common.show': 'Näytä',
  'common.hide': 'Piilota',
  'common.notNow': 'Ei nyt',

  // Setup
  'setup.title': 'Luo holvi',
  'setup.body':
    'Passhold säilyttää salasanasi salattuina tällä laitteella. Yksi pääsalasana avaa ne — valitse sellainen, jonka muistat, enkä käytä missään muualla.',
  'setup.password': 'Pääsalasana',
  'setup.confirm': 'Kirjoita uudelleen',
  'setup.mismatch': 'Salasanat eivät ole samat.',
  'setup.tooShort': 'Käytä vähintään {min} merkkiä.',
  'setup.understand':
    'Ymmärrän, että kukaan — ei Passhold eikä Keyrook — ei voi palauttaa holviani, jos unohdan tämän salasanan.',
  'setup.create': 'Luo holvi',
  'setup.creating': 'Luodaan…',
  'setup.restore': 'Palauta varmuuskopiosta',

  // Strength
  'setup.deviceBody':
    'Passhold säilyttää salasanasi salattuina tällä laitteella, ja {method} avaa ne — ei pääsalasanaa, joka pitää keksiä tai muistaa. Saat myös palautusavaimen siltä varalta, että {method} ei enää toimi.',
  'setup.deviceWhereMac': 'Kun Chrome kysyy, minne passkey tallennetaan, valitse Google Password Manager.',
  'setup.deviceWhereMacEdge':
    'Kun Edge kysyy, minne passkey tallennetaan, valitse paikka, joka säilyttää sen myös muilla laitteillasi. Kaikki paikat eivät voi avata Passholdia: jos tämä ei voi, Passhold kertoo sen.',
  'setup.createWithDevice': 'Luo käyttäen: {method}',
  'setup.usePassword': 'Käytä sen sijaan pääsalasanaa',
  'setup.useDevice': 'Käytä sen sijaan {method}',
  'setup.signIn': 'Kirjaudu Keyrook-tiliin tai luo tili',

  'welcome.title': 'Salasanasi jokaisella tietokoneella',
  'welcome.body':
    'Kirjaudu kerran. Passhold avautuu sormenjäljelläsi, täyttää puolestasi, ja kirjautumistietosi ovat siellä, mihin kirjaudut.',
  'welcome.email': 'Käytä sähköpostiosoitetta',
  'gate.touchTitle': 'Avaa kosketuksella',
  'gate.touchBody': 'Touch ID tai Windows Hello avaa Passholdin. Ei pääsalasanaa, joka pitää keksiä ja muistaa.',
  'gate.everywhereTitle': 'Jokaisella käyttämälläsi tietokoneella',
  'gate.everywhereBody': 'Kirjaudu toiselle tietokoneelle, niin salasanasi ja passkeysi ovat siellä.',
  'gate.privateTitle': 'Vain sinä voit lukea ne',
  'gate.privateBody':
    'Salattu tällä tietokoneella ennen kuin mitään lähetetään. Keyrook ei voi lukea salasanojasi, eikä tiedä, mille sivustoille ne kuuluvat.',
  'welcome.note':
    'Ensin salattu tällä tietokoneella: Keyrook ei voi lukea salasanojasi, eikä tiedä, mille sivustoille ne kuuluvat.',
  'connect.title': 'Ota Keyrook-tilisi käyttöön',
  'connect.body': 'Kirjautumistietosi jokaisella käyttämälläsi tietokoneella — ja varmuuskopio, jos tämä katoaa.',
  'connect.email': 'Sähköposti',
  'kitCheck.title': 'Tarkista tilisi palautusavain',
  'kitCheck.body': 'Kirjoita se kerran, jotta tiedät sen vielä olevan, ennen kuin tarvitset sitä.',
  'accountPasskey.button': 'Jatka passkeyllä',
  'accountPasskey.working': 'Odotetaan passkeytä…',
  'accountPasskey.hint':
    'Sellainen, jonka lisäsit sivulle account.keyrook.com. Ensimmäisellä kerralla {browser} kysyy, saako Passhold käyttää sitä.',
  'accountPasskey.openPasskeys': 'Avaa ”Passkeys” sivulla account.keyrook.com',
  'join.title': 'Kirjaudu Keyrookiin',
  'join.body': 'Yksi Keyrook-tili Passholdille ja Keyrook Authenticatorille. Kirjautumistietosi tulevat tilistä tähän selaimeen.',
  'join.createTitle': 'Luo Keyrook-tili',
  'join.createBody':
    'Yksi tili Passholdille ja Keyrook Authenticatorille: kirjautumistietosi, salattuina ensin tällä laitteella, jokaisella tietokoneella, johon kirjaudut.',
  'join.lockTitle': 'Kirjautunut tilillä {email}',
  'join.lockBodyDevice':
    'Viimeinen vaihe: Passhold avautuu tällä tietokoneella: {method}. Kirjautumistietosi latautuvat heti, kun se on asetettu.',
  'join.cancel': 'Käytä toista tiliä',
  'join.lockBodyCode':
    'Viimeinen vaihe: koodi, joka avaa Passholdin tällä tietokoneella. Kirjautumistietosi latautuvat heti, kun se on asetettu.',
  'join.opening': 'Avataan Passholdia…',
  'setup.useAccountPassword': 'Käytä sen sijaan tilini salasanaa',
  'setup.useCode': 'Käytä sen sijaan tälle tietokoneelle tarkoitettua koodia',
  'security.accountPasswordTitle': 'Avautuu Keyrook-tilisi salasanalla',
  'security.accountPasswordBody':
    'Yksi salasana molempiin. Kun se vaihtuu, tämä Passhold seuraa muutosta, kun kirjaudut seuraavan kerran.',

  'recovery.title': 'Tallenna palautusavaimesi',
  'recovery.body':
    'Jos tämä laite katoaa tai sen lukituksen avaus lakkaa toimimasta, tämä avain on tie takaisin holviisi ja sen varmuuskopioihin. Voit nähdä sen uudelleen Asetuksissa niin kauan kuin Passhold avautuu — säilytä se siis myös muualla: tulostettuna, puhelimellasi tai tiedostossa, joka ei ole tällä tietokoneella.',
  'recovery.download': 'Lataa',
  'recovery.copy': 'Kopioi',
  'recovery.copied': 'Kopioitu',
  'recovery.print': 'Tulosta',
  'recovery.qr': 'Näytä QR-koodi',
  'recovery.qrHide': 'Piilota QR-koodi',
  'recovery.qrLabel': 'Palautusavain QR-koodina',
  'recovery.qrHint': 'Osoita puhelimesi kameralla siihen ja tallenna teksti muistiinpanoon tai ota kuva siitä.',
  'recovery.show': 'Näytä',

  'kit.title': 'Passholdin palautuspaketti',
  'kit.made': 'Tehty {date}',
  'kit.keyLabel': 'Palautusavain',
  'kit.whenTitle': 'Kun Passhold ei avaudu',
  'kit.sameDevice':
    'Tällä tietokoneella: kun Passhold pyytää avaamaan lukituksen, valitse ”Käytä sen sijaan palautusavainta” ja kirjoita avain.',
  'kit.newDevice':
    'Uudella tietokoneella: asenna Passhold, valitse ”Palauta varmuuskopiosta”, valitse uusin varmuuskopiotiedostosi ja kirjoita avain. Ilman varmuuskopiota ei ole mitään palautettavaa, joten tee sellainen.',
  'kit.keep':
    'Säilytä tämä paperi turvallisessa paikassa, poissa tietokoneeltasi. Jos joku saa sen ja kopion holvistasi, hän voi avata holvin.',
  'recovery.fileTitle': 'Passholdin palautusavain',
  'recovery.fileMade': 'Tehty {date}',
  'recovery.fileBody':
    'Tämä avain avaa Passhold-holvisi ja sen varmuuskopiot, kun laitteesi ei pysty siihen. Kuka tahansa, jolla on se ja kopio holvistasi, voi avata holvin, joten säilytä sitä turvallisesti äläkä samalla tietokoneella.',
  'recovery.pending': 'Palautusavainta ei ole vielä talletettu',
  'recovery.keptState': 'Palautusavain talletettu',
  'recovery.rowBody':
    'Avaa holvisi ja sen varmuuskopiot, kun {method} ei pysty siihen. Uusi avain pysäyttää vanhalla avaimella avautumisen tähän holviin; vanhalla avaimella tehdyt varmuuskopiot avautuvat edelleen.',
  'recovery.makeNew': 'Tee uusi',
  'recovery.savedIt': 'Olen tallentanut sen',
  'recovery.checkTitle': 'Tarkista, että tallensit sen',
  'recovery.checkBody':
    'Kirjoita kaksi ryhmää avaimesta tallentamastasi — tiedostosta, paperista tai kuvasta. Ryhmät ovat neljän merkin lohkoja väliviivojen välissä, laskettuna vasemmalta.',
  'recovery.group': 'Ryhmä {position}',
  'recovery.check': 'Tarkista',
  'recovery.checkWrong':
    'Tämä ei ole avaimesi sisältö. Katso tallentamasi uudelleen tai näytä avain uudelleen ja tallenna se nyt.',
  'recovery.showAgain': 'Näytä avain uudelleen',
  'recovery.covered': 'Keyrook-tilisi on tie takaisin',
  'recovery.coveredBody':
    'Jos {method} ei enää avaa Passholdia tässä, poista holvi ja kirjaudu tilillesi uudelleen: jokainen kirjautumistieto palautuu. Tämän holvin oma palautusavain on edelleen nähtävissä täällä.',

  'proof.recoveryKey': 'Palautusavain',
  'proof.withDevice': 'Vahvistat käyttäen: {method}.',
  'proof.useDevice': 'Vahvista sen sijaan {method}',
  'proof.usePassword': 'Kirjoita sen sijaan pääsalasana',
  'proof.useAccountPassword': 'Kirjoita sen sijaan tilin salasana',
  'proof.useCode': 'Kirjoita sen sijaan koodi',
  'proof.useRecoveryKey': 'Kirjoita sen sijaan palautusavain',
  'strength.0': 'Erittäin heikko',
  'strength.1': 'Heikko',
  'strength.2': 'Kohtalainen',
  'strength.3': 'Vahva',
  'strength.4': 'Erittäin vahva',
  'strength.short': 'Pidempi on vahvempi: tavoittele 14 merkkiä tai enemmän.',
  'strength.digitsOnly': 'Pelkät numerot arvataan nopeasti.',
  'strength.repeats': 'Vältä saman merkin toistamista.',

  // Unlock
  'unlock.title': 'Passhold on lukittu',
  'unlock.body': 'Kirjoita pääsalasanasi.',
  'unlock.password': 'Pääsalasana',
  'unlock.submit': 'Avaa lukitus',
  'unlock.pinBody': 'Kirjoita PIN-koodisi.',
  'unlock.pin': 'PIN',
  'unlock.usePassword': 'Käytä sen sijaan pääsalasanaa',
  'unlock.usePin': 'Käytä sen sijaan PIN-koodia',
  'unlock.recoveryBody': 'Kirjoita palautusavaimesi.',
  'unlock.deviceBody': 'Käytä {method} tai kirjoita alle.',
  'unlock.recoveryKey': 'Palautusavain',
  'unlock.useRecoveryKey': 'Käytä sen sijaan palautusavainta',
  'unlock.lost': 'Etkö pääse sisään?',
  'unlock.forgotBodyRecovery':
    'Palautusavaimesi avaa holvin, kun laite ei pysty siihen. Ilman sitä ja ilman laitetta kukaan — ei Passhold eikä Keyrook — ei voi avata holvia: voit vain poistaa sen Asetuksista ja aloittaa alusta.',
  'unlock.bodyAccount': 'Kirjoita Keyrook-tilisi salasana.',
  'unlock.accountPassword': 'Keyrook-tilin salasana',
  'unlock.useAccountPassword': 'Käytä sen sijaan tilin salasanaa',
  'unlock.forgotBodyAccount':
    'Se on Keyrook-tilisi salasana: jos se on vaihdettu jossain muualla, käytä uutta. Unohtuiko kokonaan? Poista tämä holvi Asetuksista ja kirjaudu uudelleen — palautusavaimella, jos tarvitset uuden salasanan — niin jokainen kirjautumistieto palautuu.',
  'unlock.bodyCode': 'Kirjoita koodi, joka avaa Passholdin tällä tietokoneella.',
  'unlock.code': 'Koodi tälle tietokoneelle',
  'unlock.useCode': 'Käytä sen sijaan koodia',
  'unlock.forgotBodyCode':
    'Poista tämä holvi Asetuksista ja kirjaudu uudelleen Googlella tai GitHubilla: jokainen kirjautumistieto palautuu tilistäsi.',
  'unlock.device': 'Avaa lukitus: {method}',
  'unlock.key': 'Avaa lukitus suojausavaimella',
  'unlock.keyBody': 'Kytke suojausavaimesi, tai kirjoita alle.',
  'unlock.or': 'tai',
  'unlock.unlocking': 'Avataan lukitusta…',
  'unlock.forgot': 'Unohditko?',
  'unlock.forgotBody':
    'Pääsalasanasi on ainoa avain tähän holviin, eikä sitä tallenneta mihinkään. Ilman sitä holvia ei voi avata — voit vain poistaa sen Asetuksista ja aloittaa alusta.',

  // Vault
  'vault.search': 'Hae',
  'vault.lock': 'Lukitse',
  'vault.settings': 'Asetukset',
  'vault.add': 'Uusi kirjautumistieto',
  'vault.onThisPage': 'Sivustolla {site}',
  'vault.all': 'Kaikki kirjautumistiedot',
  'vault.empty': 'Ei vielä kirjautumistietoja',
  'vault.emptyBody':
    'Kirjaudu sivustolle, ja Passhold tarjoutuu tallentamaan sen — tai lisää yksi tästä, tai tuo selaimestasi.',
  'vault.import': 'Tuo salasanat',
  'vault.noResults': 'Mikään ei vastaa hakua ”{query}”.',
  'vault.fill': 'Täytä',
  'vault.copyUsername': 'Kopioi käyttäjätunnus',
  'vault.copyPassword': 'Kopioi salasana',
  'vault.noUsername': 'Ei käyttäjätunnusta',
  'vault.count': { one: '{count} kohde', other: '{count} kohdetta' },
  'vault.everything': 'Kaikki kohteet',

  // Asking for a rating, once, after real use
  'rating.title': 'Onko Passhold hyödyllinen?',
  'rating.body': 'Arvostelu kaupassa auttaa muita löytämään sen.',
  'rating.rate': 'Arvioi se',
  'rating.later': 'Ei nyt',

  // What a list shows, and what can be added
  'kinds.label': 'Näytä',
  'kinds.all': 'Kaikki',
  'kinds.logins': 'Tunnukset',
  'kinds.cards': 'Kortit',
  'kinds.addresses': 'Osoitteet',
  'kinds.notes': 'Muistiinpanot',
  'kinds.noLogins': 'Ei vielä kirjautumistietoja.',
  'kinds.noCards':
    'Ei vielä kortteja. Lisää yksi painamalla + yllä, niin Passhold täyttää sen maksaessasi, kun valitset sen.',
  'kinds.noAddresses':
    'Ei vielä osoitteita. Lisää yksi painamalla + yllä, niin Passhold täyttää sen aina, kun lomake sitä kysyy.',
  'kinds.noNotes':
    'Ei vielä muistiinpanoja. Muistiinpano säilyttää muun kuin kirjautumisen — Wi-Fi-salasanan, lisenssiavaimen — salattuna muun joukossa.',
  'add.menu': 'Lisää',
  'add.login': 'Kirjautumistieto',
  'add.card': 'Kortti',
  'add.address': 'Osoite',
  'add.note': 'Muistiinpano',
  'place.label': 'Holvit',
  'place.mine': 'Omat',
  'place.of': '{vault}, jaettu perheessä {family}',
  'move.to': 'Siirrä kohteeseen {vault}',
  'move.confirm':
    'Kaikki perheessä {family} näkevät sen kohteessa {vault} ja voivat muuttaa sitä. Se poistuu omasta holvistasi; sen aiemmat salasanat jäävät sinne.',
  'move.do': 'Siirrä',
  'family.unlockTitle': 'Avaa perheen {family} jaettu holvi tässä selaimessa',
  'family.unlockBody':
    'Passhold tarvitsee kerran Keyrook-tilisi salasanan, jotta se voi viedä avaimesi perheelle tässä selaimessa. Sitä ei lähetetä minnekään.',
  'family.unlockOnPage':
    'Avaa ”Family”-sivu osoitteessa account.keyrook.com ja anna perheesi avain Passholdille siellä.',
  'family.password': 'Keyrook-tilin salasana',
  'family.unlock': 'Avaa',
  'family.openPage': 'Avaa ”Family”-sivu',
  'family.keyChanged': 'Henkilön {who} avain perheessä {family} on vaihtunut',
  'family.newSender': 'Perheen {family} avain tuli henkilöltä {who}, jota tämä selain ei vielä tunne',
  'family.keyChangedBody':
    'Passhold ei ota häneltä mitään, ennen kuin te molemmat vertaatte koodia. Soita tai tapaa hänet: hän valitsee vertaamaan koodeja nimesi vierestä sivulla ”Family” osoitteessa account.keyrook.com.',
  'family.showCode': 'Näytä koodi',
  'family.codeIs': 'Koodisi',
  'family.match': 'Koodit täsmäävät',
  'family.differ': 'Koodit eroavat',
  'family.differed':
    'Älä silloin luota siihen. Kerro perheesi järjestäjälle; Passhold ei ota häneltä mitään sillä välin.',
  'family.someone': 'Joku',
  'family.waiting':
    'Perheen {family} järjestäjän pitää vielä vahvistaa sinut. Mitä perhe jakaa, aukeaa täällä, kun hän on tehnyt sen.',
  'family.rotate':
    'Joku on lähtenyt perheestä {family}, eikä Passhold ole vielä vaihtanut kaikkia sen avaimia: sen jaettuihin holveihin tehdyt muutokset odottavat tässä selaimessa. Jos tämä jatkuu, vaihda avaimet ”Family”-sivulla.',
  'family.rotateCompare':
    'Joku on lähtenyt perheestä {family}. Passhold antaa kaikille uudet avaimet, kun olet vertaillut yllä olevaa koodia; sitä ennen sen jaettuihin holveihin tehdyt muutokset odottavat tässä selaimessa.',
  'family.rotateWait':
    'Joku on lähtenyt perheestä {family}. Mitä muutat sen jaetuissa holveissa, odottaa tässä selaimessa, kunnes järjestäjän Passhold vaihtaa avaimet — mikä tapahtuu synkronoinnin yhteydessä — jotta lähtenyt henkilö ei voi lukea sitä.',
  'family.left': '{who} ei ole enää perheessä {family}',
  'family.leftBody':
    'Passhold ei voi tietää, miksi hän lähti. Jos et odottanut tätä, kysy häneltä tai perheesi järjestäjältä.',
  'family.title': 'Perhe',
  'family.description':
    'Kuka perheeseesi kuuluu, ja holvit, joita se jakaa. Perhettä hallitaan sivulla ”Family” osoitteessa account.keyrook.com: kutsuminen, jonkun poistaminen, avainten vaihtaminen.',
  'family.none':
    'Tämä tili ei kuulu mihinkään perheeseen. Perheet luodaan sivulla ”Family” osoitteessa account.keyrook.com.',
  'family.youOrganise': 'Olet sen järjestäjä.',
  'family.youMember': 'Olet sen jäsen.',
  'family.you': '(sinä)',
  'family.organiser': 'Järjestäjä',
  'family.notCompared': 'Hyväksytty ilman koodien vertaamista',
  'family.keyNew': 'Heidän avaimensa on muuttunut: heiltä ei oteta mitään, ennen kuin vertaat koodia',
  'family.membersLater': 'Kuka siihen kuuluu, näkyy täällä, kun se avautuu tässä selaimessa.',
  'family.sharedVaults': 'Jaetut holvit',
  'family.vaultWaits': 'Siihen tehtävät muutokset odottavat, kunnes järjestäjä vaihtaa sen avaimen',

  // Cards, addresses and notes
  'wallet.updated': 'Muutettu {date}',
  'wallet.copyField': 'Kopioi {field}',
  'card.untitled': 'Kortti',
  'card.newTitle': 'Uusi kortti',
  'card.editTitle': 'Muokkaa korttia',
  'card.titleHint': 'Jos jätät tyhjäksi, kortti nimetään sen verkon ja neljän viimeisen numeron mukaan.',
  'card.number': 'Kortin numero',
  'card.numberCheck': 'Tämä numero ei täsmää: tarkista jokainen numero.',
  'card.holder': 'Nimi kortilla',
  'card.expiry': 'Voimassa',
  'card.month': 'Kuukausi',
  'card.year': 'Vuosi',
  'card.code': 'Turvakoodi',
  'card.empty': 'Anna kortin numero tai nimi.',
  'card.expired': 'Tämä kortti on vanhentunut.',
  'card.expiredOn': 'vanhentunut {expiry}',
  'card.copyNumber': 'Kopioi kortin numero',
  'card.copyExpiry': 'Kopioi voimassaoloaika',
  'address.untitled': 'Osoite',
  'address.newTitle': 'Uusi osoite',
  'address.editTitle': 'Muokkaa osoitetta',
  'address.titleHint': 'Koti, työ… Jos jätät tyhjäksi, osoite nimetään sen sisältämän nimen mukaan.',
  'address.name': 'Koko nimi',
  'address.organization': 'Yritys',
  'address.street': 'Katuosoite',
  'address.city': 'Kaupunki',
  'address.region': 'Osavaltio tai lääni',
  'address.postalCode': 'Postinumero',
  'address.country': 'Maa',
  'address.chooseCountry': 'Valitse maa',
  'address.phone': 'Puhelin',
  'address.email': 'Sähköposti',
  'address.address': 'Osoite',
  'address.empty': 'Anna nimi tai osa osoitteesta.',
  'note.untitled': 'Nimetön muistiinpano',
  'note.newTitle': 'Uusi muistiinpano',
  'note.editTitle': 'Muokkaa muistiinpanoa',
  'note.title': 'Otsikko',
  'note.text': 'Muistiinpano',
  'note.empty': 'Anna otsikko tai kirjoita jotain.',
  'note.edited': 'Muokattu {date}',

  // Pending save, in the popup
  'pending.saveTitle': 'Tallennetaanko tämä kirjautumistieto?',
  'pending.updateTitle': 'Päivitetäänkö salasana?',
  'pending.lockedTitle': 'Tallennetaanko juuri käyttämäsi kirjautumistieto?',
  'pending.body': '{username} sivustolla {site}',
  'pending.bodyNoUser': 'Salasana sivustolle {site}',
  'pending.save': 'Tallenna',
  'pending.update': 'Päivitä',
  'pending.never': 'Ei koskaan tälle sivustolle',

  // Item
  'item.username': 'Käyttäjätunnus',
  'item.password': 'Salasana',
  'item.website': 'Sivusto',
  'item.websites': 'Sivustot',
  'item.notes': 'Muistiinpanot',
  'item.favorite': 'Suosikki',
  'item.unfavorite': 'Poista suosikeista',
  'item.addFavorite': 'Lisää suosikkeihin',
  'item.trash': 'Siirrä roskakoriin',
  'item.updated': 'Salasana vaihdettu {date}',
  'item.history': 'Aiemmat salasanat',
  'item.weak': 'Tämä salasana on heikko: sen arvaaminen ei veisi kauan.',
  'item.reused': {
    one: 'Tätä salasanaa käytetään myös {count} muussa kirjautumistiedossa. Jos yksi sivusto vuotaa sen, molemmat ovat auki.',
    other: 'Tätä salasanaa käytetään myös {count} muussa kirjautumistiedossa. Jos yksi sivusto vuotaa sen, kaikki ovat auki.',
  },
  'item.changePassword': 'Vaihda se sivustolla',
  'item.openSite': 'Avaa {site}',
  'item.passkey': 'Passkey',
  'item.passkeyBody': 'Sivustolle {site}, tallennettu {date}',

  // Edit
  'edit.newTitle': 'Uusi kirjautumistieto',
  'edit.editTitle': 'Muokkaa kirjautumistietoa',
  'edit.title': 'Nimi',
  'edit.titleHint': 'Jos jätät tyhjäksi, nimi tulee sivuston mukaan.',
  'edit.username': 'Käyttäjätunnus tai sähköposti',
  'edit.password': 'Salasana',
  'edit.generate': 'Luo',
  'edit.websites': 'Sivustot',
  'edit.websitesHint': 'Yksi riviä kohden. Passhold tarjoaa tätä kirjautumistietoa näillä sivustoilla.',
  'edit.notes': 'Muistiinpanot',
  'edit.empty': 'Anna nimi, käyttäjätunnus tai salasana.',

  // Fields of an item's own, and folders
  'fields.title': 'Omat kentät',
  'fields.add': 'Lisää kenttä',
  'fields.name': 'Kentän nimi',
  'fields.value': 'Arvo',
  'fields.hidden': 'Piilota kuten salasana',
  'fields.remove': 'Poista tämä kenttä',
  'fields.unnamed': 'Kenttä',
  'fields.copy': 'Kopioi {name}',
  'folders.label': 'Kansio',
  'folders.placeholder': 'Ei kansiota',
  'folders.choose': 'Olemassa olevat kansiot',
  'folders.hint': 'Pidä asiat yhdessä — Työ, Perhe, Pankki — ja näytä kerrallaan yksi kansio.',
  'folders.all': 'Kaikki kansiot',
  'folders.none': 'Ei kansiossa',
  'folders.count': { one: '{count} kohde', other: '{count} kohdetta' },
  'folders.nothingHere': 'Tässä kansiossa ei ole tämän tyyppisiä kohteita.',
  'folders.rename': 'Nimeä uudelleen',
  'folders.renameTo': 'Kansion uusi nimi',
  'folders.remove': 'Poista kansio',
  'folders.removeHint': 'Sen sisältö jää, ilman kansiota.',

  // Generator
  'generator.length': 'Pituus',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'Jätä pois toisiaan muistuttavat merkit (I l 1 O 0)',
  'generator.again': 'Toinen',
  'generator.use': 'Käytä tätä salasanaa',
  'generator.bits': '{bits} bittiä',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold on lukittu.',
  'menu.unlock': 'Avaa Passholdin lukitus',
  'menu.unlockHint': 'Avaa lukitus napsauttamalla Passholdia työkalurivillä, ja palaa sitten tänne.',
  'menu.none': 'Ei tallennettuja kirjautumistietoja sivustolle {site}.',
  'menu.uninitialized': 'Ota Passhold ensin käyttöön: napsauta sitä työkalurivillä.',
  'menu.suggest': 'Käytä vahvaa salasanaa',
  'menu.suggestBody': 'Uusi salasana, täytetty puolestasi. Passhold tarjoaa tallentamista, kun lomake on lähetetty.',
  'menu.fillFor': 'Täytä sivustolla {site}',
  'menu.hidden': 'Jokin sivulla peittää Passholdin, joten se ei täytä.',
  'menu.passkey': 'Passkey · {username}',
  'menu.noCards': 'Passholdissa ei vielä ole kortteja. Lisää yksi Passholdista työkalurivillä.',
  'menu.noAddresses': 'Passholdissa ei vielä ole osoitteita. Lisää yksi Passholdista työkalurivillä.',
  'menu.cardInsecure':
    'Tämä sivu ei ole suojattu (tavallinen http), joten Passhold ei täytä korttia tässä: kuka tahansa matkan varrella voisi lukea sen.',

  // A website's passkey
  'passkey.saveTitle': 'Tallennetaanko passkey sivustolle {site}?',
  'passkey.save': 'Tallenna passkey',
  'passkey.saveElsewhere': 'Tallenna muualle',
  'passkey.useElsewhere': 'Käytä passkeytä muualta',
  'passkey.existsTitle': 'Tämä passkey on jo Passholdissa',
  'passkey.ok': 'OK',
  'passkey.signInTitle': 'Kirjaudu sivustolle {site}',
  'passkey.signInBody': 'Passholdissa tallennetulla passkeyllä',
  'passkey.none': 'Passholdissa ei ole passkeytä sivustolle {site}.',
  'passkey.hidden': 'Jokin sivulla peittää Passholdin, joten se ei vastaa.',

  // Save prompt on a page
  'prompt.save': 'Tallennetaanko kirjautumistieto Passholdiin?',
  'prompt.update': 'Päivitetäänkö salasana Passholdissa?',
  'prompt.saveButton': 'Tallenna',
  'prompt.updateButton': 'Päivitä',
  'prompt.never': 'Ei koskaan tälle sivustolle',
  'prompt.saved': 'Tallennettu Passholdiin.',
  'prompt.locked': 'Napsauta Passholdia työkalurivillä ja avaa lukitus — se kysyy tallentamista siellä.',
  'prompt.saveCard': 'Tallennetaanko kortti Passholdiin?',
  'prompt.updateCard': 'Päivitetäänkö kortti Passholdissa?',
  'prompt.saveAddress': 'Tallennetaanko osoite Passholdiin?',
  'prompt.saveCheckout': 'Tallennetaanko kortti ja osoite Passholdiin?',

  // Settings
  'settings.title': 'Asetukset',
  'settings.cannotOpen': 'Etkö saa sitä ollenkaan auki? Poista holvi tästä selaimesta',
  'settings.encryptedHere': 'Salattu tällä laitteella',
  'settings.source': 'Lähdekoodi GitHubissa',

  'nav.passwords': 'Salasanat',
  'nav.accountSync': 'Tili ja synkronointi',
  'nav.family': 'Perhe',
  'nav.account': 'Keyrook-tili',
  'nav.backup': 'Varmuuskopio ja tuonti',
  'nav.security': 'Suojaus',
  'nav.general': 'Yleiset',
  'nav.needsAttention': 'vaatii huomiota',

  'account.description':
    'Kirjaudu sisään, niin kirjautumistietosi seuraavat sinua jokaiseen selaimeen, jossa kirjaudut Passholdiin. Ne salataan ensin tällä laitteella: Keyrookin palvelin ei voi lukea niitä, eikä tiedä, mille sivustoille ne kuuluvat.',
  'account.email': 'Sähköposti',
  'account.password': 'Keyrook-tilin salasana',
  'account.signIn': 'Kirjaudu',
  'account.signingIn': 'Kirjaudutaan…',
  'account.note':
    'Sama tili kuin Keyrook Authenticatorissa. Googlella tai GitHubilla luotu tili kirjautuu omalla painikkeellaan.',
  'account.haveOne': 'Minulla on tili',
  'account.create': 'Luo tili',
  'account.sendCode': 'Lähetä minulle koodi sähköpostilla',
  'account.createNote':
    'Keyrook lähettää kuusinumeroisen koodin sähköpostiin todistaakseen, että osoite on sinun. Jos osoitteella on jo tili, sähköposti kertoo sen sijaan: kirjaudu sillä.',
  'account.codeSent': 'Koodi on matkalla osoitteeseen {email}. Se on voimassa viisitoista minuuttia.',
  'account.code': 'Kuusinumeroinen koodi',
  'account.newPassword': 'Keyrook-tilin salasana',
  'account.passwordNote':
    'Tämä salasana avaa Keyrook-tilisi missä tahansa selaimessa, sekä Passholdille että Keyrook Authenticatorille. Keyrook ei koskaan näe sitä eikä voi nollata sitä puolestasi; seuraavaksi saamasi palautusavain on tapa asettaa uusi.',
  'account.createButton': 'Luo tili',
  'account.creating': 'Luodaan…',
  'account.otherEmail': 'Käytä toista osoitetta',
  'account.signedInAs': 'Kirjautunut tilillä {email}',
  'account.signedInAsNamed': 'Kirjautunut tilillä {name} ({email})',
  'account.synced': 'Synkronoitu {date}',
  'account.notSynced': 'Ei vielä synkronoitu',
  'account.syncNow': 'Synkronoi nyt',

  // The account, at the foot of the popup
  'accountBar.synced': 'Synkronoitu {time}',
  'accountBar.justNow': 'juuri nyt',
  'accountBar.syncing': 'Synkronoidaan…',
  'accountBar.signedOut': 'Kirjauduttu ulos — kirjaudu uudelleen synkronoidaksesi',
  'accountBar.startedOver': 'Tili aloitettiin alusta — kirjaudu uudelleen',
  'accountBar.removed': 'Poistettu tililtä — kirjaudu uudelleen synkronoidaksesi',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'Poistettu Keyrook-tililtäsi',
  'removed.body':
    'Päivänä {date} tämä selain poistettiin Keyrook-tililtäsi, joten Passhold poisti tililtä kirjautumistiedot, kortit, osoitteet ja muistiinpanot ja kirjasi selaimen ulos. Tässä lisätyt tai muutetut ja lähettämättä jääneet asiat jäivät selaimen omiksi. Kirjaudu uudelleen tuodaksesi loput takaisin.',

  // Passwords, in Settings
  'passwords.description':
    'Jokainen kirjautumistieto, passkey, kortti, osoite ja muistiinpano Passholdissa. Valitse yksi nähdäksesi sen, kopioidaksesi siitä tai muuttaaksesi sitä.',
  'passwords.all': 'Kaikki',
  'passwords.attention': 'Vaatii huomiota',
  'passwords.weak': 'Heikko',
  'passwords.reused': 'Käytetty uudelleen',
  'account.syncDone': 'Synkronoitu.',
  'account.removed': {
    one: 'Toisella laitteella lopullisesti poistettu {count} kohde poistettiin täältä.',
    other: 'Toisella laitteella lopullisesti poistetut {count} kohdetta poistettiin täältä.',
  },
  'account.skipped': {
    one: '{count} kohde ei avautunut, ja se jätettiin rauhaan.',
    other: '{count} kohdetta ei avautunut, ja ne jätettiin rauhaan.',
  },
  'account.manage': 'Hallitse Keyrook-tiliäsi',
  'account.manageBody':
    'Vaihda salasana, tee uusi palautusavain tai aloita tili alusta osoitteessa account.keyrook.com — sekä Passholdille että Keyrook Authenticatorille.',
  'account.manageBodyProvider':
    'Tee uusi palautusavain tai aloita tili alusta osoitteessa account.keyrook.com — sekä Passholdille että Keyrook Authenticatorille.',
  'account.manageOpen': 'Avaa',
  'account.signOut': 'Kirjaudu ulos',
  'account.signOutBody':
    'Poistaa jokaisen kirjautumistiedon tästä selaimesta, viimeisen synkronoinnin jälkeen. Kirjaudu uudelleen, niin ne palautuvat.',
  'account.signOutConfirm':
    'Passhold synkronoi vielä kerran ja poistaa sitten holvin tästä selaimesta. Mitään ei poisteta, jos jokin kirjautumistieto ei ole päässyt tilillesi.',
  'account.signOutButton': 'Kirjaudu ulos ja poista',
  'account.signedOutByServer': 'Keyrook kirjasi tämän selaimen ulos. Kirjaudu uudelleen jatkaaksesi synkronointia.',
  'account.startedOver':
    'Keyrook-tilisi aloitettiin alusta {date}, joten Keyrook kirjasi tämän selaimen ulos. Kirjaudu sisään uudella salasanallasi: tämän selaimen kirjautumistiedot lähetetään tilin uusilla avaimilla.',
  'account.startedOverProvider':
    'Keyrook-tilisi aloitettiin alusta {date}, joten Keyrook kirjasi tämän selaimen ulos. Kirjaudu sisään Googlella tai GitHubilla: tämän selaimen kirjautumistiedot lähetetään tilin uusilla avaimilla.',
  'account.forgot': 'Unohditko salasanan?',
  'account.recoverBody':
    'Keyrook lähettää koodin tilin osoitteeseen; kirjoita sitten se, tilin palautusavain siitä paperista, jonka tallensit tiliä luodessa, ja uusi salasana. Jokainen muu selain ja sovellus, joka on kirjautunut tilille, pyytää uutta salasanaa.',
  'account.recoveryKey': 'Tilin palautusavain',
  'account.recoverPassword': 'Uusi tilin salasana',
  'account.recoverButton': 'Aseta uusi salasana',
  'account.recovering': 'Asetetaan…',
  'account.backToSignIn': 'Takaisin kirjautumiseen',
  'startOver.link': 'Hukkasitko palautusavaimenkin? Aloita tili alusta',
  'startOver.title': 'Aloita tili alusta',
  'needsRoot.body':
    'Jos sinulla on Keyrook Authenticatorin antama tilin palautusavain, kirjoita se: silloin se avaa myös Passholdin. Ilman sitä Passhold luo tilille uuden palautusavaimen, joka näytetään kerran, ja vanha lakkaa toimimasta.',
  'needsRoot.sheet': 'Tilin palautusavain Keyrook Authenticatorista (jos sinulla on se)',
  'needsRoot.withSheet': 'Käytä tätä avainta',
  'needsRoot.newSheet': 'Tee uusi palautusavain',
  'startOver.body':
    'Kun jäljellä on pelkkä sähköpostiosoite, tili voi aloittaa alusta uusilla avaimilla ja uudella palautusavaimella. Se tulee voimaan viikon kuluttua pyynnöstä, ja siihen asti mikä tahansa selain, joka on yhä kirjautunut tilille, voi perua sen — joten pelkän sähköpostisi tuntevalla ei ole siihen mahdollisuutta. Keyrook säilyttää kaiken, mitä tili piti, salattuna 90 päivää: vanha salasana tai vanha palautusavain tuo sen takaisin.',
  'startOver.button': 'Aloita alusta',
  'startOver.working': 'Aloitetaan alusta…',
  'startOver.kitBody':
    'Tilin uusi palautusavain: se toimii, kun tili on aloittanut alusta. Passhold näyttää sen vain nyt, joten säilytä se ennen kuin jatkat.',
  'startOver.waitTitle': 'Tilisi aloittaa alusta {date}',
  'startOver.waitBody':
    'Siihen asti mikään ei muutu, ja mikä tahansa selain, joka on yhä kirjautunut tilille, voi perua sen. Keyrook lähettää nyt, päivää aiemmin ja tapahtuessa viestin osoitteeseen {email}.',
  'startOver.waitThen':
    'Sen jälkeen kirjaudu täällä uudella salasanallasi. Tämän selaimen kirjautumistiedot lähetetään tilin uusilla avaimilla, ja mitä tilillä oli aiemmin, säilytetään 90 päivää.',
  'startOver.waitThenProvider':
    'Sen jälkeen kirjaudu täällä kuten ennenkin Googlella tai GitHubilla. Tämän selaimen kirjautumistiedot lähetetään tilin uusilla avaimilla, ja mitä tilillä oli aiemmin, säilytetään 90 päivää.',
  'startOver.understood': 'Selvä',
  'startOver.doneTitle': 'Tilisi on aloitettu alusta',
  'startOver.doneBody':
    'Kirjaudu uudella salasanallasi: tämän selaimen kirjautumistiedot lähetetään tilin uusilla avaimilla, ja mitä tilillä oli aiemmin, säilytetään 90 päivää.',
  'startOver.doneBodyProvider':
    'Kirjaudu kuten ennenkin Googlella tai GitHubilla: tämän selaimen kirjautumistiedot lähetetään tilin uusilla avaimilla, ja mitä tilillä oli aiemmin, säilytetään 90 päivää.',
  'startOverWait.title': 'Keyrook-tilisi aloittaa alusta {date}',
  'startOverWait.body':
    'Sen pyysi Keyrookin sinulle sähköpostilla lähettämä koodi laitteelta, joka nimesi itsensä ”{device}”. Jos et se ollut sinä, joku voi lukea sähköpostisi: peru se nyt ja vaihda sitten sähköpostisi salasana. Jos olit se, jätä se.',
  'startOverWait.bodyNoName':
    'Sen pyysi Keyrookin sinulle sähköpostilla lähettämä koodi. Jos et se ollut sinä, joku voi lukea sähköpostisi: peru se nyt ja vaihda sitten sähköpostisi salasana. Jos olit se, jätä se.',
  'startOverWait.cancel': 'Peru alusta aloitus',
  'kept.title': {
    one: 'Säilytetty ennen tilin alusta aloitusta: {count} kohde',
    other: 'Säilytetty ennen tilin alusta aloitusta: {count} kohdetta',
  },
  'kept.body': 'Päivään {date} asti. Vanha tilin salasana tai vanha palautusavain tuo ne takaisin Passholdiin.',
  'kept.open': 'Palauta',
  'kept.secret': 'Vanha tilin salasana tai vanha palautusavain',
  'kept.done': { one: 'Palautettu {count} kohde.', other: 'Palautettu {count} kohdetta.' },
  'kept.nothingNew': 'Kaikki, mitä säilytettiin, on jo täällä.',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': 'Jatka käyttäen: {provider}',
  'provider.passwordTitle': 'Tällä Keyrook-tilillä on salasana',
  'provider.passwordBody':
    'Kirjauduit sisään käyttäen: {provider}, tilinä {email}. Tilin salasana on se, mikä avaa Passholdin täällä: kirjoita se kerran.',
  'provider.openAccountPage': 'Avaa account.keyrook.com',
  'secondStep.title': 'Kaksivaiheinen kirjautuminen',
  'secondStep.body':
    'Kirjoita 6-numeroinen koodi, jonka todennussovelluksesi näyttää Keyrookille. Sovellus hukassa? Kirjoita sen sijaan tilisi palautusavain.',
  'secondStep.ownerBody':
    'Tilisi vaatii tähänkin toisen vaiheen: todennussovelluksesi näyttämän koodin tai tilisi palautusavaimen.',
  'secondStep.field': 'Koodi tai palautusavain',
  'secondStep.continue': 'Jatka',
  'secondStep.passkey': 'Käytä sen sijaan passkeytä',
  'secondStep.nextBody':
    'Avaimen antaminen tilille vaatii myös koodin, ja kukin koodi toimii vain kerran. Odota, että todennussovelluksesi näyttää uuden, ja kirjoita se — tai tilin palautusavain.',
  'provider.or': 'tai',
  'provider.signedInWith': 'Kirjauduttu sisään: {provider}, tilinä {email}',
  'provider.signedInWithNamed': 'Kirjauduttu sisään: {provider}, tilinä {name} ({email})',
  'provider.newTitle': 'Luo Keyrook-tilisi',
  'provider.newBody':
    'Kirjaudut sisään: {provider}, tilinä {email}. Tilillä ei ole salasanaa: {provider} kirjaa sinut sisään. Toisella tietokoneella jo kirjautunut selain päästää sinut sisään — tai sen tekee seuraavaksi saamasi palautusavain.',
  'provider.joinTitle': 'Päästä tämä selain sisään',
  'provider.joinBody':
    '{email} on kirjautunut tänne, mutta avain, joka avaa kirjautumistietosi, on muilla tietokoneillasi. Avaa Passhold yhdellä niistä — Asetukset, Tili ja synkronointi — ja päästä tämä selain sisään.',
  'provider.waiting': 'Odotetaan toista selainta…',
  'provider.compare': 'Toinen selain näyttää koodin. Päästä se sisään siellä vain, jos se on tämä:',
  'provider.ended': 'Pyyntö päättyi, ennen kuin toinen selain päästi tämän sisään.',
  'provider.askAgain': 'Kysy uudelleen',
  'provider.useKit': 'Käytä sen sijaan palautusavainta',
  'provider.useThisKey': 'Käytä tätä avainta',
  'provider.needsRoot':
    '{email} luotiin Keyrook Authenticatorissa, ennen kuin jokaisella Keyrook-sovelluksella oli oma avain. Passhold voi antaa sille sellaisen nyt, kun vahvistat {provider}-tunnuksella vielä kerran; Authenticatorissa ei muutu mitään.',
  'provider.confirmWith': 'Vahvista: {provider}',
  'provider.noKeyYet':
    'Passhold ei ole vielä kirjautunut tilille {email} missään, joten mikään toinen selain ei voi päästää tätä sisään. Tilin palautusavain avaa sen.',
  'passkey.onLabel': 'Uudet tietokoneet avautuvat passkeylläsi',
  'passkey.offLabel': 'Ei passkeytä uusille tietokoneille',
  'passkey.body':
    'Uudella tietokoneella: {provider}, sitten passkeysi — ja jokainen kirjautumistieto on siellä. Google Password Managerin säilyttämä passkey on jokaisessa Chromessa, johon kirjaudut.',
  'passkey.bodyEdge':
    'Uudella tietokoneella: {provider}, sitten passkeysi — ja jokainen kirjautumistieto on siellä. Tallennettuna paikkaan, jossa se synkronoituu, passkey on myös muilla laitteillasi.',
  'passkey.turnOn': 'Ota käyttöön',
  'passkey.turnOff': 'Poista käytöstä',
  'passkey.joinTitle': 'Avaa passkeylläsi',
  'passkey.joinBody': '{email} on passkey uusille tietokoneille. Vahvista sillä, niin kirjautumistietosi latautuvat.',
  'passkey.use': 'Käytä passkeytä',
  'passkey.otherWays': 'Muut tavat sisään',
  'pairing.asking': '{device} haluaa, että sen päästetään tilillesi.',
  'pairing.start': 'Päästä sisään…',
  'pairing.notMe': 'Ei minä',
  'pairing.compare': 'Päästä se sisään vain, jos uusi selain näyttää tämän saman koodin:',
  'pairing.match': 'Koodit täsmäävät — päästä sisään',
  'pairing.differ': 'Koodit eroavat',

  'accountKit.title': 'Tallenna tilin palautusavain',
  'accountKit.body':
    'Jos unohdat Keyrook-tilisi salasanan, tämä avain asettaa uuden — sekä Passholdille että Keyrook Authenticatorille. Keyrook ei koskaan näe salasanaasi, joten tämä on ainoa tapa. Voit nähdä sen uudelleen Asetuksissa; säilytä se myös muualla.',
  'accountKit.fileTitle': 'Keyrook-tilin palautusavain',
  'accountKit.fileBody':
    'Jos unohdat Keyrook-tilisi salasanan, tämä avain asettaa uuden: Passholdissa Asetukset → Tili ja synkronointi → ”Unohditko salasanan?”. Kuka tahansa, jolla on se ja sähköpostiosoitteesi, voi tehdä saman, joten säilytä se turvallisesti äläkä tällä tietokoneella.',
  'accountKit.bodyNoPassword':
    'Tilillä ei ole salasanaa: jo kirjautunut selain päästää uuden sisään. Jos yhtäkään ei ole jäljellä, tämä avain päästää — sekä Passholdille että Keyrook Authenticatorille. Voit nähdä sen uudelleen Asetuksissa; säilytä se myös muualla.',
  'accountKit.fileBodyNoPassword':
    'Jos mikään tietokone ei ole enää kirjautunut Keyrook-tilillesi, tämä avain päästää uuden sisään: kirjaudu Googlella tai GitHubilla ja valitse ”Käytä sen sijaan palautusavainta”. Kuka tahansa, jolla se on ja joka voi kirjautua sinuna, voi tehdä saman, joten säilytä se turvallisesti äläkä tällä tietokoneella.',
  'accountKit.whenTitleNoPassword': 'Kun mikään tietokone ei ole kirjautunut',
  'accountKit.inPassholdNoPassword':
    'Passholdissa: kirjaudu Googlella tai GitHubilla, valitse ”Käytä sen sijaan palautusavainta” ja kirjoita tämä avain.',
  'accountKit.keepNoPassword':
    'Säilytä tämä paperi turvallisessa paikassa, poissa tietokoneeltasi. Jos joku, jolla se on, voi kirjautua Google- tai GitHub-tilillesi, hän voi avata Keyrook-tilisi.',
  'accountKit.rowBodyNoPassword': 'Päästää uuden tietokoneen sisään, kun muuta ei ole jäljellä tekemään sitä.',
  'accountKit.sheetTitle': 'Keyrook-tilin palautuspaketti',
  'accountKit.whenTitle': 'Kun tilin salasana on unohtunut',
  'accountKit.inPasshold':
    'Passholdissa: Asetukset → Tili ja synkronointi → ”Unohditko salasanan?”, sitten sähköpostiosoitteesi, Keyrookin lähettämä koodi, tämä avain ja uusi salasana.',
  'accountKit.inAuthenticator':
    'Keyrook Authenticator hyväksyy saman avaimen: ”Unohditko salasanan?” kohdassa, jossa se pyytää kirjautumaan.',
  'accountKit.keep':
    'Säilytä tämä paperi turvallisessa paikassa, poissa tietokoneeltasi. Jos joku, jolla se on, pääsee sähköpostiisi, hän voi asettaa tilille uuden salasanan.',
  'accountKit.pending': 'Tilin palautusavainta ei ole vielä talletettu',
  'accountKit.keptState': 'Tilin palautusavain talletettu',
  'accountKit.elsewhere': 'Tilin palautusavain tehty muualla',
  'accountKit.none': 'Ei tilin palautusavainta',
  'accountKit.rowBody': 'Asettaa uuden tilin salasanan, jos se unohtuu. Uusi avain lakkauttaa vanhan kaikissa sovelluksissa.',
  'accountKit.elsewhereBody':
    'Tehty osoitteessa account.keyrook.com, Keyrook Authenticatorissa tai toisessa selaimessa: sen avain on silloin tallennetulla paperilla. Tässä tehty uusi lakkauttaa sen.',
  'accountKit.noneBody':
    'Ilman sitä unohtunutta tilin salasanaa ei voi nollata, eikä Keyrookiin tallennettua voi avata. Tämän selaimen kirjautumistiedot säilyvät joka tapauksessa.',
  'accountKit.make': 'Tee sellainen',
  'accountKit.apart':
    'Pidä se erillään sähköpostistasi: kuka tahansa, jolla tämä avain on ja joka voi lukea sähköpostisi, voi asettaa uuden salasanan ja avata kirjautumistietosi. Älä lähetä sitä itsellesi sähköpostilla, äläkä säilytä sitä sähköpostin pilvipalvelussa.',
  'accountKit.apartNoPassword':
    'Pidä se erillään Google- tai GitHub-tilistä, jolla kirjaudut: kuka tahansa, jolla tämä avain on ja joka voi kirjautua siellä sinuna, voi avata kirjautumistietosi. Älä lähetä sitä itsellesi sähköpostilla, äläkä säilytä sitä tilin pilvitallennuksessa.',
  'accountKit.unchecked': 'Tilin palautusavainta ei ole vielä tarkistettu',
  'accountKit.uncheckedBody':
    'Tililläsi on palautusavain, joka on tehty osoitteessa account.keyrook.com tai toisessa sovelluksessa. Kirjoita se kerran: Passhold tarkistaa, että se avaa tilisi, ja säilyttää sen, jotta voit nähdä sen uudelleen.',
  'accountKit.typeIt': 'Kirjoita se',
  'accountKit.checked': 'Se avaa tilisi. Passhold säilyttää sen nyt, jotta voit nähdä sen uudelleen täällä.',
  'accountKit.draftBody':
    'Tilisi uusi palautusavain. Se ei vielä toimi: kun olet tallentanut sen ja kirjoittanut sen takaisin, tilisi salasana asettaa sen, ja vanha lakkaa toimimasta.',
  'accountKit.setTitle': 'Aseta uusi palautusavaimesi',
  'accountKit.setBody':
    'Kirjoita Keyrook-tilisi salasana. Siihen asti vanha palautusavaimesi toimii yhä, ja tämä uusi ei vielä.',
  'accountKit.set': 'Aseta',
  'checkup.clear': 'Ei korjattavaa',
  'checkup.clearBody': 'Ei heikkoja tai uudelleenkäytettyjä salasanoja, ja varmuuskopiosi on ajan tasalla.',
  'checkup.issues': { one: '{count} kohta tarkistettavana', other: '{count} kohtaa tarkistettavana' },
  'checkup.issuesBody': 'Jokainen alla kertoo, miksi se on tärkeä ja miten se korjataan.',
  'checkup.backup': 'Varmuuskopio',
  'checkup.access': 'Pääsy',
  'checkup.recoveryPending':
    'Tälle holville tehtyä palautusavainta ei koskaan vahvistettu talletetuksi, ja se on ainoa pääsy, jos {method} lakkaa toimimasta. Tee uusi ja säilytä se.',
  'checkup.deviceMissing':
    'Tässä holvissa ei ole pääsalasanaa, joten ilman {method} tällä laitteella jokainen lukituksen avaus kysyy palautusavainta.',
  'checkup.lastBackup': 'Viimeisin varmuuskopio {date}',
  'checkup.backupNever':
    'Jos tämä selain katoaa, katoavat myös kirjautumistietosi. Varmuuskopio on yksi salattu tiedosto, joka säilytetään muualla.',
  'checkup.backupDue': 'Holvisi on muuttunut siitä lähtien. Tee uusi varmuuskopio, jotta se sisältää kaiken.',
  'checkup.backUp': 'Varmuuskopioi nyt',
  'checkup.weak': { one: '{count} heikko salasana', other: '{count} heikkoa salasanaa' },
  'checkup.weakBody':
    'Lyhyt tai niin yksinkertainen, että se voidaan arvata. Vaihda kukin sen sivustolla; Passhold ehdottaa lomakkeessa vahvaa salasanaa ja tarjoutuu tallentamaan sen.',
  'checkup.weakNone': 'Ei yhtään.',
  'checkup.reused': {
    one: '{count} salasana käytetty useammin kuin kerran',
    other: '{count} salasanaa käytetty useammin kuin kerran',
  },
  'checkup.reusedBody':
    'Kun yksi sivusto vuotaa salasanan, ihmiset kokeilevat sitä kaikkialla muualla. Anna jokaiselle kirjautumistiedolle oma.',
  'checkup.reusedNone': 'Ei yhtään: jokaisella kirjautumistiedolla on oma salasana.',
  'checkup.sharedBy': { one: 'Jaettu {count} kirjautumistiedon kanssa', other: 'Jaettu {count} kirjautumistiedon kanssa' },
  'checkup.change': 'Vaihda',
  'checkup.limits':
    'Passhold ei tarkista, onko salasana ilmestynyt tietovuodossa: se edellyttäisi palvelimelta kysymistä, eikä Passhold kysy mitään. Se ei myöskään muistuta vanhoista salasanoista — vahva, ainutlaatuinen salasana ei kulu.',

  'backup.description': 'Säilytä salattu kopio, palauta se, tai tuo ja vie kirjautumistietoja.',
  'backup.backupRow': 'Koko holvisi yhdessä salatussa tiedostossa, pääsalasanasi suojaamana.',
  'backup.restoreRow': 'Lisää varmuuskopiotiedoston kirjautumistiedot tähän holviin.',
  'backup.importRow': 'Toisesta selaimesta tai salasanahallinnasta CSV-tiedostona tai Bitwardenin JSON-tiedostona.',
  'backup.exportRow': 'CSV-tiedosto, jonka muut sovellukset voivat lukea. Ei salattu.',

  'security.description': 'Miten Passhold avautuu ja milloin se sulkeutuu uudelleen.',
  'security.locking': 'Lukitus',
  'security.opensTitle': 'Miten Passhold avautuu',
  'security.opensBody': 'Ei pääsalasanaa: {method} avaa sen, ja palautusavain, kun {method} ei voi.',
  'security.setPassword': 'Käytä sen sijaan pääsalasanaa',
  'security.setPasswordBody':
    'Passhold avautuu sen jälkeen valitsemallasi salasanalla, ja palautusavain ei enää avaa sitä.',
  'security.setPasswordOpen': 'Aseta',
  'security.setPasswordSave': 'Käytä tätä salasanaa',
  'security.dropPassword': 'Lopeta pääsalasanan käyttö',
  'security.dropPasswordBody':
    'Avaa vain {method}-tunnistuksella, ja säilytä palautusavain päivää varten, jolloin se ei onnistu. Pääsalasana ei enää avaa holvia.',
  'security.dropPasswordOpen': 'Vaihda',
  'security.dropPasswordSave': 'Vaihda ja näytä palautusavain',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'laitteesi näytön lukitus',
  'device.method.passkey': 'passkeysi',
  'device.title': 'Avaa lukitus: {method}',
  'device.description': 'Nopein tapa sisään, ja se toimii myös selaimen uudelleenkäynnistyksen jälkeen.',
  'device.on': 'Päällä',
  'device.off': 'Pois',
  'device.body':
    'Sormenjälkesi tai kasvosi avaavat Passholdin — tai useimmilla tietokoneilla tietokoneen oma salasana. Joten kuka tahansa, joka voi avata tämän tietokoneen, voi avata Passholdin. Se, mitä se avaa, pysyy tällä tietokoneella, eikä ole ilman sitä hyödyllinen.',
  'device.whereMac':
    'Kun Chrome kysyy, minne passkey tallennetaan, valitse Google Password Manager. Chromen profiilissa oleva passkey ei voi avata Passholdia, eikä iCloud Keychain joka Macissa.',
  'device.whereMacEdge':
    'Kun Edge kysyy, minne passkey tallennetaan, valitse paikka, joka säilyttää sen myös muilla laitteillasi. Kaikki paikat eivät voi avata Passholdia: jos valitsemasi ei voi, Passhold kertoo sen, eikä mitään muuteta.',
  'device.unavailable': 'Ei käytettävissä täällä',
  'device.unavailableBody':
    'Tämä selain ei löytänyt sormenjälkeä, kasvoja tai näytön lukitusta, jota Passhold voi käyttää. PIN-koodi toimii kaikkialla.',
  'device.unavailableRecovery':
    'Tämä selain ei löytänyt sormenjälkeä, kasvoja tai näytön lukitusta, jota Passhold voi käyttää, joten täällä tämä holvi avautuu palautusavaimellaan. Aseta pääsalasana, jos haluat kirjoittaa sen.',
  'device.opensWith': '{method} avaa Passholdin',
  'device.notHere': '{method} ei ole asetettu tässä selaimessa',
  'device.isTheWayIn':
    'Ilman pääsalasanaa Passhold avautuu näin. Jotta tämä voidaan kytkeä pois, aseta ensin pääsalasana.',
  'device.setUpHere': 'Ennen kuin {method} on asetettu tähän, jokainen lukituksen avaus kysyy palautusavainta.',
  'device.setUp': 'Aseta',
  'device.turnOff': 'Poista käytöstä',
  'device.save': 'Aseta {method}',
  'keys.title': 'Avaa lukitus suojausavaimella',
  'keys.description': 'USB-avain, jonka kytket: yksi lisäsisäänkäynti, joka toimii myös selaimen uudelleenkäynnistyksen jälkeen.',
  'keys.method': 'suojausavaimesi',
  'keys.on': { one: '{count} avain asetettu', other: '{count} avainta asetettu' },
  'keys.off': 'Ei asetettua avainta',
  'keys.body':
    'Kytke avain, kirjoita sen PIN-koodi ja kosketa sitä, niin Passhold avautuu — vain tällä tietokoneella. Jokainen, jolla on avain ja joka tuntee sen PIN-koodin, voi avata Passholdin täällä, joten säilytä sitä kuten talon avainta. Jos se katoaa, poista se täältä: muut sisäänkäyntitapasi toimivat yhä.',
  'keys.add': 'Lisää avain',
  'keys.save': 'Lisää tämä avain',
  'keys.one': 'Suojausavain',
  'keys.added': 'Lisätty {date}',
  'keys.remove': 'Poista',
  'pin.title': 'Avaa lukitus PIN-koodilla',
  'pinOffer.title': 'Avaa Passhold nopeammin PIN-koodilla',
  'pinOffer.body':
    'Kirjoita muutama numero salasanan sijaan joka kerta, kun Passhold lukittuu, kunnes selain suljetaan. Kun selain käynnistyy uudelleen, kerran salasana.',
  'pinOffer.later': 'Voit asettaa sen tai poistaa sen käytöstä milloin tahansa Asetuksissa, Suojauksessa.',
  'pin.description': 'Niitä monia kertoja päivässä, kun Passhold lukittuu, kun istut samassa selaimessa.',
  'pin.on': 'Päällä',
  'pin.off': 'Pois',
  'pin.bodyRecovery':
    'Toimii vain, kun selain pysyy auki, ja vain viidellä väärällä yrityksellä: sen jälkeen, tai selaimen uudelleenkäynnistyksen jälkeen, tarvitaan laite tai palautusavain. PIN-koodilla avattavaa ei tallenneta levylle.',
  'pin.body':
    'Toimii vain, kun selain pysyy auki, ja vain viidellä väärällä yrityksellä: sen jälkeen, tai selaimen uudelleenkäynnistyksen jälkeen, tarvitaan pääsalasana. PIN-koodilla avattavaa ei tallenneta levylle.',
  'pin.setUp': 'Aseta PIN-koodi',
  'pin.change': 'Vaihda',
  'pin.turnOff': 'Poista käytöstä',
  'pin.new': 'PIN-koodi, 6–12 numeroa',
  'pin.again': 'Kirjoita uudelleen',
  'pin.save': 'Tallenna PIN-koodi',

  'general.description': 'Miten Passhold toimii verkkosivuilla, ja miltä se näyttää.',
  'general.filling': 'Täyttäminen ja tallentaminen',
  'general.appearance': 'Kieli ja ulkoasu',
  'settings.autoSuggest': 'Näytä ehdotukset, kun napsautat kirjautumisen, kortin tai osoitteen kenttää',
  'settings.autoSuggestBody':
    'Kirjautumistietosi sivustolle, vahva salasana rekisteröitymislomakkeessa, korttisi ja osoitteesi maksaessa. Mitään ei täytetä, ennen kuin valitset.',

  'trash.description': 'Kirjautumistiedot, kortit, osoitteet ja muistiinpanot odottavat täällä, kunnes palautat ne tai poistat pysyvästi.',
  'trash.sharedDescription':
    'Jaettu perheen kanssa: kuka tahansa siinä voi palauttaa nämä. Pysyvästi poistettuina ne ovat poissa kaikilta.',
  'trash.sharedMember':
    'Jaettu perheen kanssa: voit palauttaa nämä. Vain perheen järjestäjä poistaa ne pysyvästi.',
  'settings.autoLock': 'Lukitse, kun on kulunut',
  'settings.autoLock.never': 'Vain kun selain suljetaan',
  'settings.autoLock.minutes': { one: '{count} minuutti', other: '{count} minuuttia' },
  'settings.autoLock.hours': { one: '{count} tunti', other: '{count} tuntia' },
  'settings.lockWithSystem': 'Lukitse, kun tietokone lukitaan tai menee lepotilaan',
  'settings.clipboard': 'Tyhjennä kopioidut salasanat, kun on kulunut',
  'settings.clipboard.never': 'Ei koskaan',
  'settings.clipboard.seconds': { one: '{count} sekunti', other: '{count} sekuntia' },
  'settings.clipboard.minutes': { one: '{count} minuutti', other: '{count} minuuttia' },
  'settings.inlineButton': 'Näytä Passhold-painike kirjautumisen, kortin ja osoitteen kentissä',
  'settings.offerToSave': 'Tarjoa kirjautumisten tallentamista, kun kirjaudut sisään',
  'settings.offerToSaveCards': 'Tarjoa korttien ja osoitteiden tallentamista, kun maksat',
  'settings.offerToSaveCardsBody':
    'Kortti vain suojatulta (https) sivulta, ja vain jos sen numero täsmää. Se näytetään neljällä viimeisellä numerollaan, ei koskaan numerollaan tai koodillaan.',
  'settings.passkeys': 'Tallenna ja käytä passkeyjä',
  'settings.passkeysBody':
    'Kun sivusto tarjoaa passkeyn, Passhold säilyttää sen kirjautumistietojesi kanssa ja kirjaa sinut sisään sillä. Kun pois päältä, passkeyt jätetään selaimelle.',
  'settings.language': 'Kieli',
  'settings.language.auto': 'Sama kuin selaimessa',
  'settings.theme': 'Ulkoasu',
  'settings.theme.system': 'Sama kuin järjestelmässä',
  'settings.theme.light': 'Vaalea',
  'settings.theme.dark': 'Tumma',

  'settings.security': 'Pääsalasana',
  'settings.securityBody': 'Kun vaihdat sen, holvin avain lukitaan uudelleen; kirjautumistietosi pysyvät ennallaan.',
  'settings.current': 'Nykyinen pääsalasana',
  'settings.new': 'Uusi pääsalasana',
  'settings.confirm': 'Kirjoita uusi uudelleen',
  'settings.change': 'Vaihda pääsalasana',
  'settings.changeOpen': 'Vaihda',
  'settings.changed': 'Pääsalasana vaihdettu.',

  'settings.backup': 'Varmuuskopioi',
  'settings.backupBody':
    'Koko holvisi yhdessä salatussa tiedostossa. Säilytä se muualla kuin tällä tietokoneella — USB-muistitikulla tai pilvitallennuksessasi — jotta tämän selaimen katoaminen ei vie kirjautumistietojasi. Se avautuu vain pääsalasanalla, jonka sinulla oli, kun sen teit.',
  'settings.backupBodyRecovery':
    'Koko holvisi yhdessä salatussa tiedostossa. Säilytä se muualla kuin tällä tietokoneella — USB-muistitikulla tai pilvitallennuksessasi — jotta tämän selaimen katoaminen ei vie kirjautumistietojasi. Se avautuu palautusavaimellasi.',
  'settings.backupLast': 'Viimeisin varmuuskopio: {date}',
  'settings.backupNever': 'Ei vielä varmuuskopiota.',
  'settings.backupButton': 'Lataa varmuuskopio',
  'settings.backupDone': 'Tallennettu lataustiedostoihisi. Siirrä se nyt muualle kuin tälle tietokoneelle.',

  'settings.restoreBackup': 'Palauta varmuuskopiosta',
  'settings.restoreBodyNew':
    'Tässä selaimessa ei ole vielä holvia. Palauta oma varmuuskopiotiedostostasi — se avautuu pääsalasanalla, jolla varmuuskopio tehtiin — tai tee uusi Passhold-painikkeesta työkalurivillä.',
  'settings.restoreBodyMerge':
    'Lisää holviin kaiken, mitä varmuuskopio sisältää. Mitään tästä ei poisteta: jos molemmissa on sama kirjautumistieto, uudempi muokkaus säilytetään ja toinen salasana siirtyy sen historiaan.',
  'settings.restoreChoose': 'Valitse varmuuskopiotiedosto',
  'settings.restoreMade': 'Varmuuskopio tehty {date}',
  'settings.restorePassword': 'Varmuuskopion pääsalasana',
  'settings.restoreRecoveryKey': 'Varmuuskopion palautusavain',
  'settings.restoreButton': 'Palauta',
  'settings.restoreNew': {
    one: 'Holvi palautettu: {count} kohde.',
    other: 'Holvi palautettu: {count} kohdetta.',
  },
  'settings.restoreAdded': {
    one: 'Lisätty {count} kohde varmuuskopiosta.',
    other: 'Lisätty {count} kohdetta varmuuskopiosta.',
  },
  'settings.restoreUpdated': {
    one: '{count} kohteessa oli varmuuskopiossa uudempi muokkaus.',
    other: '{count} kohteessa oli varmuuskopiossa uudempi muokkaus.',
  },
  'settings.restoreNothing': 'Kaikki varmuuskopiossa on jo tässä holvissa.',

  'settings.import': 'Tuo',
  'settings.importBody':
    'Tuo salasanasi Chromesta, Edgestä, Firefoxista, Safarista, Apple Passwordsista, Bitwardenista, 1Passwordista, LastPassista, KeePassista, Dashlanesta, Proton Passista tai NordPassista: vie ne siellä CSV-tiedostona ja valitse se täällä. Myös tiedoston kortit, osoitteet ja muistiinpanot tulevat mukaan. Bitwardenista vie JSON-muodossa (ei salattuna): sen CSV jättää pois kortit, henkilöllisyydet ja passkeyt. Dashlane laittaa nämä omiin tiedostoihinsa: valitse jokainen vuorollaan.',
  'settings.importChoose': 'Valitse tiedosto',
  'settings.importFound': 'Löytyi tuotavaksi: {what}.',
  'settings.importLogins': { one: '{count} kirjautumistieto', other: '{count} kirjautumistietoa' },
  'settings.importPasskeys': { one: '{count} passkey', other: '{count} passkeyä' },
  'settings.importCards': { one: '{count} kortti', other: '{count} korttia' },
  'settings.importAddresses': { one: '{count} osoite', other: '{count} osoitetta' },
  'settings.importNotes': { one: '{count} muistiinpano', other: '{count} muistiinpanoa' },
  'settings.importSkipped': {
    one: '{count} kohteessa ei ole mitään, mitä Passhold säilyttää, ja se jätetään pois.',
    other: '{count} kohteessa ei ole mitään, mitä Passhold säilyttää, ja ne jätetään pois.',
  },
  'settings.importDuplicates': {
    one: '{count} on jo holvissasi.',
    other: '{count} ovat jo holvissasi.',
  },
  'settings.importConfirm': 'Tuo',
  'settings.importDone': 'Tuotu: {what}.',
  'settings.importDelete': 'Poista nyt CSV-tiedosto: se sisältää salasanasi selkotekstinä.',
  'settings.importNothing': 'Tässä tiedostossa ei ole mitään uutta tuotavaksi.',
  'settings.importTwoFactor': {
    one: '{count} kirjautumistiedossa tässä tiedostossa on kaksivaiheisen (2FA) koodi. Passhold ei säilytä 2FA-koodeja: siirrä se todennussovellukseen ennen kuin poistat vanhan salasanahallintasi, tai voit jäädä ulkopuolelle tililtä.',
    other:
      '{count} kirjautumistiedossa tässä tiedostossa on kaksivaiheisen (2FA) koodeja. Passhold ei säilytä 2FA-koodeja: siirrä ne todennussovellukseen ennen kuin poistat vanhan salasanahallintasi, tai voit jäädä ulkopuolelle noilta tileiltä.',
  },
  'settings.importAuthenticator': 'Hae Keyrook Authenticator',
  'settings.importPasskeysLeft': {
    one: '{count} passkey tässä tiedostossa ei voi siirtyä Passholdiin. Pidä vanha salasanahallintasi, kunnes olet kirjautunut sivustolle toisella tavalla ja tehnyt uuden passkeyn Passholdiin.',
    other:
      '{count} passkeyta tässä tiedostossa ei voi siirtyä Passholdiin. Pidä vanha salasanahallintasi, kunnes olet kirjautunut noille sivustoille toisella tavalla ja tehnyt uudet passkeyt Passholdiin.',
  },

  'settings.export': 'Vie',
  'settings.exportBody':
    'CSV-tiedosto, jonka jokainen selain ja salasanahallinta voi lukea. Se sisältää salasanasi selkotekstinä: säilytä sitä vain niin kauan kuin tarvitset. Se sisältää vain kirjautumistiedot: passkeyt, omat kentät, kansiot, kortit, osoitteet ja muistiinpanot eivät ole siinä. Varmuuskopio pitää kaiken.',
  'settings.exportButton': 'Vie CSV',
  'settings.exportDone': 'Viety. Poista tiedosto, kun olet valmis sen kanssa.',

  'settings.neverSave': 'Älä koskaan tarjoa tallentamista sivustoille',
  'settings.neverSaveEmpty':
    'Ei sivustoja. Valitse ”Ei koskaan tälle sivustolle”, kun Passhold tarjoaa tallentamista, niin se näkyy täällä.',
  'settings.remove': 'Poista',

  'settings.trash': 'Roskakori',
  'settings.trashEmpty': 'Roskakori on tyhjä.',
  'settings.restore': 'Palauta',
  'settings.deleteForever': 'Poista pysyvästi',
  'settings.emptyTrash': 'Tyhjennä roskakori',
  'settings.emptyTrashConfirm': 'Poistetaanko kaikki roskakorista pysyvästi?',

  'settings.danger': 'Poista holvi',
  'settings.dangerBody':
    'Poistaa holvin tästä selaimesta. Jokainen kirjautumistieto siinä katoaa pysyvästi — lataa varmuuskopio ensin, jos haluat säilyttää ne.',
  'settings.dangerType': 'Kirjoita {word} vahvistaaksesi',
  'settings.dangerWord': 'poista',
  'settings.dangerButton': 'Poista holvi',

  'settings.about': 'Passhold {version} · Keyrookin tekemä',

  // Errors
  'error.noWorker': 'Passhold ei vastannut. Sulje tämä ja yritä uudelleen.',
  'error.wrongPassword': 'Tämä ei ole pääsalasana.',
  'error.passwordTooShort': 'Käytä vähintään {min} merkkiä.',
  'error.vaultCorrupt': 'Tällä laitteella oleva holvi on vaurioitunut eikä sitä voi avata.',
  'error.vaultTooNew': 'Tämän holvin on tehnyt uudempi Passhold. Päivitä Passhold avataksesi sen.',
  'error.itemNotFound': 'Tämä ei ole enää holvissa.',
  'error.familyOrganiserOnly': 'Vain perheen järjestäjä voi tyhjentää tämän holvin roskakorin.',
  'error.familyGone': 'Tuo perhe ei ole enää täällä. Synkronoi ja katso uudelleen.',
  'error.familyNotOpen': 'Passhold ei vielä voi avata tuota perhettä tässä selaimessa. Synkronoi ja yritä uudelleen.',
  'error.itemInvalid': 'Tätä ei voi tallentaa sellaisenaan.',
  'error.importEmpty': 'Tässä tiedostossa ei ole mitään tuotavaksi.',
  'error.importTooLarge': 'Tämä tiedosto on liian suuri tuotavaksi.',
  'error.importUnknownFormat': 'Tämä tiedosto ei näytä salasanaviennistä.',
  'error.importEncrypted':
    'Tämä Bitwarden-vienti on salattu, eikä Passhold voi avata sitä. Vie uudelleen Bitwardenissa muodossa ”.json”, ei ”.json (Encrypted)”, ja valitse sitten tuo tiedosto.',
  'error.backupInvalid': 'Tämä tiedosto ei ole Passhold-varmuuskopio, tai se on vaurioitunut.',
  'error.backupWrongPassword': 'Tämä ei ole pääsalasana, jolla tämä varmuuskopio tehtiin.',
  'error.backupWrongRecoveryKey': 'Tämä ei ole palautusavain, jolla tämä varmuuskopio tehtiin.',
  'error.noRecoveryKey': 'Tässä holvissa ei ole palautusavainta näytettäväksi: se avautuu pääsalasanalla.',
  'error.wrongRecoveryKey': 'Tämä ei ole palautusavain.',
  'error.deviceNeeded':
    'Holvi ilman pääsalasanaa avautuu tämän laitteen lukituksen avaamisella: aseta se ensin. Se pysyy, kunnes pääsalasana asetetaan.',
  'error.accountOffline': 'Keyrookiin ei saatu yhteyttä. Tarkista yhteys ja yritä uudelleen.',
  'error.accountWrong':
    'Väärä sähköpostiosoite tai salasana. Googlella tai GitHubilla luotu tili kirjautuu sen sijaan omalla painikkeellaan.',
  'error.accountSignedOut': 'Keyrook kirjasi tämän selaimen ulos. Kirjaudu uudelleen.',
  'error.accountBusy': {
    one: 'Liian monta yritystä. Odota {count} sekunti ja yritä uudelleen.',
    other: 'Liian monta yritystä. Odota {count} sekuntia ja yritä uudelleen.',
  },
  'error.accountFailed': 'Keyrook ei pystynyt tekemään tätä juuri nyt. Yritä myöhemmin uudelleen.',
  'error.accountAlready': 'Tämä holvi on jo kirjautunut Keyrook-tilille.',
  'error.accountNone': 'Tämä holvi ei ole kirjautunut Keyrook-tilille.',
  'error.accountKdfRefused': 'Keyrook pyysi heikompaa avainta kuin Passhold hyväksyy, joten kirjautuminen keskeytettiin.',
  'error.accountKeyWrong': 'Tilin avain ei avautunut tällä salasanalla.',
  'error.accountCode': 'Tämä koodi ei ole oikein tai se on vanhentunut. Tarkista sähköposti tai pyydä uusi koodi.',
  'error.accountMail': 'Keyrook ei pystynyt lähettämään sähköpostia juuri nyt. Yritä uudelleen minuutin kuluttua.',
  'error.providerDenied': 'Kirjautuminen peruttiin.',
  'error.providerFailed': 'Google tai GitHub ei voinut kirjata sinua sisään juuri nyt. Yritä uudelleen.',
  'error.providerExpired': 'Tämä kirjautuminen on päättynyt. Aloita uudelleen.',
  'error.providerNotOwner':
    'Tämä ei ole tili, jolla tämä Keyrook-tili kirjautuu. Kirjaudu uudelleen sillä, jota käytät Keyrookiin.',
  'error.signOutUnsent': {
    one: 'Yksi kohde ei ole vielä päässyt Keyrook-tilillesi, joten mitään ei poistettu. Tarkista yhteytesi tai kirjaudu uudelleen ja kirjaudu sitten ulos.',
    other:
      '{count} kohdetta ei ole vielä päässyt Keyrook-tilillesi, joten mitään ei poistettu. Tarkista yhteytesi tai kirjaudu uudelleen ja kirjaudu sitten ulos.',
  },
  'error.providerOtherProvider':
    'Tällä sähköpostilla on jo Keyrook-tili, joka kirjautuu toisella Googlen ja GitHubin vaihtoehdoista. Kirjaudu sillä.',
  'error.providerHasPassword':
    'Tällä sähköpostilla on jo Keyrook-tili, jossa on salasana. Kirjaudu tänne sähköpostillasi ja salasanallasi — tai lisää se sivulla account.keyrook.com, kirjautuneena sinne salasanallasi, jos haluat kirjautua myös Googlella tai GitHubilla.',
  'error.providerEmailTaken':
    'Tällä sähköpostilla on jo Keyrook-tili, joka kirjautuu toisella tavalla. Kirjaudu sillä tavalla — tai lisää tämä tili siihen sivulla account.keyrook.com, kirjautuneena sinne sillä tavalla, jolla se kirjautuu nyt.',
  'error.pairingWrongKey':
    'Palautunut tieto ei ole tämän tilin avain, joten se hylättiin. Kysy uudelleen ja päästä sisään vain selaimesta, jonka tunnet.',
  'error.pairingRefused': 'Tämä ei tullut selaimesta, jonka koodin tarkistit, joten se hylättiin. Kysy uudelleen.',
  'error.pairingEnded': 'Tuo pyyntö on päättynyt. Kysy uudelleen uudesta selaimesta.',
  'error.passkeyWrong': 'Tämä passkey ei avaa tätä tiliä. Kokeile toista tapaa sisään.',
  'error.joinExpired': 'Tämä kirjautuminen odotti liian kauan. Kirjaudu uudelleen.',
  'error.accountPasswordWrong': 'Tämä ei ole tilin salasana.',
  'error.accountNoKit': 'Passholdilla ei ole tämän tilin palautusavainta.',
  'error.accountKitRace': 'Toinen sovellus muutti juuri tilin palautusavainta. Synkronoi ja yritä uudelleen.',
  'error.accountKitShape': 'Tämä ei näytä tilin palautusavaimelta: siinä on 32 kirjainta ja numeroa.',
  'error.accountKitWrong': 'Tämä palautusavain ei vastaa tiliä, jolla on tämä sähköpostiosoite.',
  'error.accountKitNotThis': 'Tämä ei ole tämän tilin palautusavain. Katso tallentamaasi uudelleen.',
  'error.accountPasswordWeak':
    'Liian helppo arvata tilille: käytä pidempää salasanaa, jossa on kirjaimia, numeroita ja merkkejä, tai neljä tai viisi toisiinsa liittymätöntä sanaa.',
  'error.accountBoxWrong':
    'Passholdin avain tässä tilissä ei avautunut. Kirjaudu uudelleen; jos se ei yhä onnistu, aloita tili alusta.',
  'error.accountCodeWait': {
    one: 'Koodi lähetettiin hetki sitten. Voit pyytää toisen {count} sekunnin kuluttua.',
    other: 'Koodi lähetettiin hetki sitten. Voit pyytää toisen {count} sekunnin kuluttua.',
  },
  'error.accountSignUpKeys':
    'Keyrook pyysi Passholdin omaa avainta, eikä sitä lähetetty. Päivitä Passhold ja yritä uudelleen.',
  'error.accountIdTaken': 'Tiliä ei voitu luoda juuri nyt. Pyydä uusi koodi ja yritä uudelleen.',
  'error.accountNoRoot': 'Tällä tilillä ei vielä ole avainta, jonka palautusavain voi avata. Kirjaudu uudelleen sen salasanalla.',
  'error.accountRootNotHeld':
    'Tämä tietokone ei voinut näyttää, että sillä on tilin avain. Kirjaudu uudelleen salasanalla tai palautusavaimella.',
  'error.accountRootChanged':
    'Tämän tilin avaimet vaihdettiin toisella tietokoneella. Kirjaudu tietokoneella, jossa Passhold on yhä kirjautuneena, tai aloita tili alusta.',
  'error.accountKeyReplaced': 'Passholdin avain tällä tilillä vaihdettiin toisella tietokoneella. Kirjaudu uudelleen.',
  'error.accountSessionStolen': 'Tämä tietokone kirjattiin ulos, koska sen istuntoa käytettiin muualta. Kirjaudu uudelleen.',
  'error.accountOld':
    'Tämä tili luotiin Googlella tai GitHubilla ennen kuin jokaisella Keyrook-sovelluksella oli oma avain, eikä mikään siinä vielä avaa Passholdia. Aloita tili alusta sen sähköpostilla, jotta se saa avaimen.',
  'error.pairingBusy': 'Liian moni selain odottaa pääsyä tälle tilille. Yritä muutaman minuutin kuluttua uudelleen.',
  'error.startOverExpired': 'Tämä on vanhentunut. Pyydä uusi koodi ja aloita uudelleen.',
  'error.startOverTooOften': 'Tämä tili on aloittanut alusta viime aikoina liian usein. Yritä uudelleen {day} jälkeen.',
  'error.startOverWaiting': 'Tämä tili aloittaa alusta jo päivänä {day}. Siihen kirjautunut selain voi perua sen.',
  'error.startOverUpdate':
    'Keyrook odottaa nyt viikon ennen kuin tili aloitetaan alusta. Päivitä Passhold pyytääksesi sitä.',
  'error.passkeyFailed': 'Tätä passkeyta ei voitu tarkistaa. Yritä uudelleen.',
  'error.passkeyNotYou': 'Tämä passkey ei vahvistanut, että olet sinä. Yritä uudelleen ja avaa lukitus pyydetyllä tavalla.',
  'error.passkeyUnknown':
    'Tämä passkey ei kuulu millekään Keyrook-tilille. Se on ehkä poistettu: kirjaudu salasanalla tai Googlella tai GitHubilla.',
  'error.passkeyExpired': 'Tämä passkey-pyyntö on päättynyt. Yritä uudelleen.',
  'error.passkeyNotOffered': 'Keyrook ei vielä tarjoa passkeyjä täällä.',
  'error.passkeyNoUnlock':
    'Tämä passkey kirjaa sisään, mutta sitä ei ole vielä asetettu avaamaan tiliäsi. Valitse sivulla account.keyrook.com kohdassa ”Passkeys” sen vierestä ”Let it unlock” ja yritä uudelleen. Tai kirjaudu salasanalla, tai Googlella tai GitHubilla.',
  'error.passkeyNoPrf':
    'Tämä passkey kirjaa sisään sivulle account.keyrook.com, mutta sen säilytyspaikka ei voi avata tiliäsi — esimerkiksi iCloud Keychain ennen macOS 15:tä ei voi. Lisää sivulla account.keyrook.com kohdassa ”Passkeys” sellainen, joka on tallennettu paikkaan, joka voi, kuten suojausavain, ja tarkista, että siinä lukee ”Unlocks your data”. Siihen asti kirjaudu salasanalla tai Googlella tai GitHubilla.',
  'error.passkeyPermission':
    'Passhold tarvitsee Chromen luvan käyttää account.keyrook.com-sivuston passkeyjä. Valitse passkey uudelleen ja salli se.',
  'error.passkeyPermissionEdge':
    'Passhold tarvitsee Edgen luvan käyttää account.keyrook.com-sivuston passkeyjä. Valitse passkey uudelleen ja salli se.',
  'error.passkeyCancelled': 'Passkeyta ei käytetty. Yritä uudelleen tai kirjaudu toisella tavalla.',
  'error.secondStepNeeded': 'Tilisi vaatii toisen vaiheen: kirjoita myös todennussovelluksesi koodi.',
  'error.secondStepWrong': 'Tämä koodi ei ole oikein. Kirjoita se, jonka todennussovelluksesi näyttää nyt, tai palautusavaimesi.',
  'error.signInExpired': 'Tämä kirjautuminen on vanhentunut. Kirjaudu uudelleen.',
  'error.secondStepUpdate': 'Tilisi vaatii toisen vaiheen kirjautumiseen. Päivitä Passhold kirjautuaksesi sisään.',
  'error.secondStepAsked': 'Tilisi vaatii toisen vaiheen: kirjoita koodi todennussovelluksestasi.',
  'error.secondStepTaken':
    'Tämä on koodi, jolla kirjauduit sisään, ja kukin koodi toimii vain kerran. Odota, että todennussovelluksesi näyttää uuden.',
  'error.kitDraftGone': 'Uutta palautusavainta ei asetettu ajoissa, eikä mitään muuttunut. Tee uusi uudelleen.',
  'error.archiveWrong': 'Tämä ei avaa säilytettyä.',
  'error.archiveGone': 'Tätä ei enää säilytetä.',
  'error.archiveDeleteRefused': 'Vain vanha salasana tai vanha palautusavain voi poistaa säilytetyn ennen sen vanhenemista.',
  'error.accountNeedsRoot':
    'Tämä tili luotiin Keyrook Authenticatorissa ennen kuin jokaisella Keyrook-sovelluksella oli oma avain. Passhold voi antaa sille sellaisen nyt; Authenticatorissa ei muutu mitään.',
  'error.accountServerWrong':
    'Keyrookin palvelin vastasi jollakin, mihin tämän tilin avaimet eivät sovi, joten Passhold pysähtyi. Yritä myöhemmin uudelleen.',
  'error.startOverNeedsPassword': 'Tilillä on salasana: valitse uusi, jotta tilin voi aloittaa alusta.',
  'error.pinInvalid': 'PIN-koodi on 6–12 numeroa.',
  'error.wrongPin': 'Tämä ei ole PIN-koodi.',
  'error.wrongPinLeft': {
    one: 'Tämä ei ole PIN-koodi. Jäljellä {count} yritys.',
    other: 'Tämä ei ole PIN-koodi. Jäljellä {count} yritystä.',
  },
  'error.pinLockedOut': 'Liian monta väärää PIN-koodia. Avaa lukitus toisella tavalla; sen jälkeen PIN-koodi toimii taas.',
  'error.pinUnavailable':
    'PIN-koodi toimii vain, kun selain pysyy auki. Avaa lukitus toisella tavalla; sen jälkeen PIN-koodi toimii taas.',
  'error.deviceGone': 'Lukituksen avaaminen tällä laitteella ei ole enää asetettu. Avaa lukitus toisella tavalla.',
  'error.deviceKeyWrong':
    'Tämä ei avannut Passholdia. Avaa lukitus toisella tavalla ja aseta laitteen lukituksen avaus uudelleen.',
  'error.deviceUnsupported':
    'Paikka, johon passkey tallennettiin, ei voi antaa Passholdille avainta avaamiseen. Yritä uudelleen ja tallenna se Google Password Managerissa — tai käytä PIN-koodia.',
  'error.deviceUnsupportedEdge':
    'Paikka, johon passkey tallennettiin, ei voi antaa Passholdille avainta avaamiseen. Yritä uudelleen ja tallenna se toisaalle — tai käytä PIN-koodia.',
  'error.deviceCancelled': 'Mitään ei avattu: peruttiin tai kesti liian kauan.',
  'error.keyUnsupported':
    'Tämä avain ei voi antaa Passholdille sitä, mitä se tarvitsee avautuakseen. Useimmat FIDO2-avaimet voivat; avain, joka on tehty vain kaksivaiheiseen kirjautumiseen (U2F), ei voi.',
  'error.keyAlreadyAdded': 'Tämä avain on jo asetettu täällä.',
  'error.keyGone': 'Tätä suojausavainta ei ole enää asetettu täällä. Avaa lukitus toisella tavalla.',
  'error.keyWrong': 'Tämä avain ei avannut Passholdia. Avaa lukitus toisella tavalla, poista avain ja lisää se uudelleen.',
  'error.kdfUnsupported': 'Holvin asetukset eivät ole sellaisia, joita Passhold hyväksyy.',
  'error.locked': 'Passhold on lukittu.',
  'error.noVault': 'Holvia ei ole vielä.',
  'error.vaultExists': 'Holvi on jo olemassa.',
  'error.notOnPage': 'Tämä kirjautumistieto ei kuulu tämän välilehden sivulle.',
  'error.expired': 'Tämä on vanhentunut. Yritä uudelleen.',
  'error.noFields': 'Tällä sivulla ei ole mitään, minkä Passhold voisi täyttää.',
  'error.cardInsecure': 'Passhold täyttää kortin vain suojatulla (https) sivulla.',
  'error.unknown': 'Jotain meni vikaan: {detail}',
};
