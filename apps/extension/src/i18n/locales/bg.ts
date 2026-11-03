import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'от Keyrook',

  // Common
  'common.cancel': 'Отказ',
  'common.close': 'Затваряне',
  'common.save': 'Запазване',
  'common.edit': 'Редактиране',
  'common.back': 'Назад',
  'common.show': 'Показване',
  'common.hide': 'Скриване',
  'common.notNow': 'Не сега',

  // Setup
  'setup.title': 'Създайте трезора си',
  'setup.body':
    'Passhold пази паролите ви шифровани на това устройство. Една главна парола ги отключва – изберете такава, която ще запомните и няма да използвате никъде другаде.',
  'setup.password': 'Главна парола',
  'setup.confirm': 'Въведете я отново',
  'setup.mismatch': 'Двете пароли не съвпадат.',
  'setup.tooShort': 'Използвайте поне {min} знака.',
  'setup.understand':
    'Разбирам, че никой – нито Passhold, нито Keyrook – не може да възстанови трезора ми, ако забравя тази парола.',
  'setup.create': 'Създаване на трезор',
  'setup.creating': 'Създаване…',
  'setup.restore': 'Възстановяване от резервно копие',

  // Strength
  'setup.deviceBody':
    'Passhold пази паролите ви шифровани на това устройство, а {method} ги отключва – без главна парола, която да измисляте или запомняте. Получавате и ключ за възстановяване за деня, в който {method} не работи.',
  'setup.deviceWhereMac': 'Когато Chrome попита къде да запази пароключа, изберете „Мениджър на пароли на Google“.',
  'setup.deviceWhereMacEdge':
    'Когато Edge попита къде да запази пароключа, изберете място, което го пази и на другите ви устройства. Не всяко място може да отключи Passhold: ако това не може, Passhold ви казва.',
  'setup.createWithDevice': 'Създаване с {method}',
  'setup.usePassword': 'Използване на главна парола вместо това',
  'setup.useDevice': 'Използване на {method} вместо това',
  'setup.signIn': 'Влезте или създайте акаунт в Keyrook',

  'welcome.title': 'Вашите пароли – на всеки компютър',
  'welcome.body':
    'Влезте веднъж. Passhold се отключва с пръстовия ви отпечатък, попълва вместо вас, а входовете ви са там, където влезете.',
  'welcome.email': 'Използване на имейл адрес',
  'gate.touchTitle': 'Отключване с докосване',
  'gate.touchBody': 'Touch ID или Windows Hello отключват Passhold. Няма главна парола, която да измисляте и запомняте.',
  'gate.everywhereTitle': 'На всеки компютър, който използвате',
  'gate.everywhereBody': 'Влезте на друг компютър и паролите и пароключовете ви са там.',
  'gate.privateTitle': 'Само вие можете да ги четете',
  'gate.privateBody':
    'Шифровани на този компютър, преди да се изпрати нещо. Keyrook не може да чете паролите ви, нито да разбере за кои сайтове са.',
  'welcome.note':
    'Първо се шифрират на този компютър: Keyrook не може да чете паролите ви, нито да разбере за кои сайтове са.',
  'connect.title': 'Включете акаунта си в Keyrook',
  'connect.body': 'Входовете ви на всеки компютър, който използвате – и резервно копие, ако този компютър се загуби.',
  'connect.email': 'Имейл',
  'kitCheck.title': 'Проверете ключа за възстановяване на акаунта си',
  'kitCheck.body': 'Въведете го веднъж, за да знаете, че все още го имате, преди да ви е нужен.',
  'accountPasskey.button': 'Продължаване с пароключ',
  'accountPasskey.working': 'Чака се пароключът…',
  'accountPasskey.hint':
    'Този, който сте добавили в account.keyrook.com. За първи път {browser} пита дали Passhold може да го ползва.',
  'accountPasskey.openPasskeys': 'Отворете „Passkeys“ в account.keyrook.com',
  'join.title': 'Влизане в Keyrook',
  'join.body': 'Един акаунт в Keyrook за Passhold и Keyrook Authenticator. Входовете ви идват в този браузър от акаунта.',
  'join.createTitle': 'Създаване на акаунт в Keyrook',
  'join.createBody':
    'Един акаунт за Passhold и Keyrook Authenticator: входовете ви, първо шифровани на това устройство, на всеки компютър, на който влизате.',
  'join.lockTitle': 'Влезли сте като {email}',
  'join.lockBodyDevice':
    'Последна стъпка: Passhold се отключва на този компютър с {method}. Входовете ви се зареждат веднага щом това е настроено.',
  'join.cancel': 'Използване на друг акаунт',
  'join.lockBodyCode':
    'Последна стъпка: код, който отключва Passhold на този компютър. Входовете ви се зареждат веднага щом това е настроено.',
  'join.opening': 'Passhold се отваря…',
  'setup.useAccountPassword': 'Използване на паролата на акаунта ми вместо това',
  'setup.useCode': 'Използване на код за този компютър вместо това',
  'security.accountPasswordTitle': 'Отключва се с паролата на акаунта ви в Keyrook',
  'security.accountPasswordBody':
    'Една парола за двете. Когато се смени, Passhold тук я следва при следващото ви влизане.',

  'recovery.title': 'Запазете ключа си за възстановяване',
  'recovery.body':
    'Ако това устройство се загуби или отключването му спре да работи, този ключ е пътят ви обратно към трезора и резервните му копия. Можете да го видите отново в Настройки, докато Passhold още се отваря – затова го пазете и на друго място: отпечатан, на телефона си или в файл, далеч от този компютър.',
  'recovery.download': 'Изтегляне',
  'recovery.copy': 'Копиране',
  'recovery.copied': 'Копирано',
  'recovery.print': 'Печат',
  'recovery.qr': 'Показване на QR код',
  'recovery.qrHide': 'Скриване на QR кода',
  'recovery.qrLabel': 'Ключът за възстановяване като QR код',
  'recovery.qrHint': 'Насочете камерата на телефона си към него и запазете текста в бележка, или го снимайте.',
  'recovery.show': 'Показване',

  'kit.title': 'Комплект за възстановяване на Passhold',
  'kit.made': 'Създаден на {date}',
  'kit.keyLabel': 'Ключ за възстановяване',
  'kit.whenTitle': 'Когато Passhold не се отваря',
  'kit.sameDevice':
    'На този компютър: когато Passhold поиска отключване, изберете „Използване на ключа за възстановяване вместо това“ и въведете ключа.',
  'kit.newDevice':
    'На нов компютър: инсталирайте Passhold, изберете „Възстановяване от резервно копие“, посочете най-новия файл с резервно копие и въведете ключа. Без резервно копие няма какво да се възстанови, затова пазете такова.',
  'kit.keep': 'Пазете този лист на сигурно място, далеч от компютъра си. Всеки, който го има и копие на трезора ви, може да отвори трезора.',
  'recovery.fileTitle': 'Ключ за възстановяване на Passhold',
  'recovery.fileMade': 'Създаден на {date}',
  'recovery.fileBody':
    'Този ключ отваря трезора ви в Passhold и резервните му копия, когато устройството ви не може. Всеки, който го има и копие на трезора ви, може да го отвори, затова го пазете на сигурно място и не на същия компютър.',
  'recovery.pending': 'Ключът за възстановяване не е запазен',
  'recovery.keptState': 'Ключът за възстановяване е запазен',
  'recovery.rowBody':
    'Отваря трезора ви и резервните му копия, когато {method} не може. Нов ключ спира отварянето на този трезор със стария; резервните копия, направени преди това, все още се отварят със стария.',
  'recovery.makeNew': 'Създаване на нов',
  'recovery.savedIt': 'Запазих го',
  'recovery.checkTitle': 'Проверете дали сте го запазили',
  'recovery.checkBody':
    'Въведете две групи от ключа от това, което сте запазили – файла, хартията или снимката. Групите са блоковете от четири знака между тиретата, броени отляво.',
  'recovery.group': 'Група {position}',
  'recovery.check': 'Проверка',
  'recovery.checkWrong':
    'Това не е ключът ви. Погледнете отново запазеното или показете ключа отново и го запазете сега.',
  'recovery.showAgain': 'Показване на ключа отново',
  'recovery.covered': 'Акаунтът ви в Keyrook е пътят обратно',
  'recovery.coveredBody':
    'Ако {method} спре да отваря Passhold тук, премахнете трезора и влезте отново в акаунта си: всеки вход се връща. Ключът за възстановяване на този трезор все още е тук за преглед.',

  'proof.recoveryKey': 'Ключ за възстановяване',
  'proof.withDevice': 'Ще потвърдите с {method}.',
  'proof.useDevice': 'Потвърждаване с {method} вместо това',
  'proof.usePassword': 'Въвеждане на главната парола вместо това',
  'proof.useAccountPassword': 'Въвеждане на паролата на акаунта вместо това',
  'proof.useCode': 'Въвеждане на кода вместо това',
  'proof.useRecoveryKey': 'Въвеждане на ключа за възстановяване вместо това',
  'strength.0': 'Много слаба',
  'strength.1': 'Слаба',
  'strength.2': 'Средна',
  'strength.3': 'Силна',
  'strength.4': 'Много силна',
  'strength.short': 'По-дългата е по-силна: стремете се към 14 знака или повече.',
  'strength.digitsOnly': 'Самите цифри лесно се налучкват.',
  'strength.repeats': 'Избягвайте един и същ знак отново и отново.',

  // Unlock
  'unlock.title': 'Passhold е заключен',
  'unlock.body': 'Въведете главната си парола.',
  'unlock.password': 'Главна парола',
  'unlock.submit': 'Отключване',
  'unlock.pinBody': 'Въведете PIN кода си.',
  'unlock.pin': 'PIN код',
  'unlock.usePassword': 'Използване на главната парола вместо това',
  'unlock.usePin': 'Използване на PIN код вместо това',
  'unlock.recoveryBody': 'Въведете ключа си за възстановяване.',
  'unlock.deviceBody': 'Използвайте {method} или въведете по-долу.',
  'unlock.recoveryKey': 'Ключ за възстановяване',
  'unlock.useRecoveryKey': 'Използване на ключа за възстановяване вместо това',
  'unlock.lost': 'Не можете да влезете?',
  'unlock.forgotBodyRecovery':
    'Ключът ви за възстановяване отваря трезора, когато устройството не може. Без него и без устройството никой – нито Passhold, нито Keyrook – не може да отвори трезора: можете само да го премахнете в Настройки и да започнете отначало.',
  'unlock.bodyAccount': 'Въведете паролата на акаунта си в Keyrook.',
  'unlock.accountPassword': 'Парола на акаунта в Keyrook',
  'unlock.useAccountPassword': 'Използване на паролата на акаунта вместо това',
  'unlock.forgotBodyAccount':
    'Това е паролата на акаунта ви в Keyrook: ако е сменена другаде, използвайте новата. Напълно забравена? Премахнете този трезор в Настройки и влезте отново – с ключа за възстановяване, ако ви трябва нова парола – и всеки вход се връща.',
  'unlock.bodyCode': 'Въведете кода, който отключва Passhold на този компютър.',
  'unlock.code': 'Код за този компютър',
  'unlock.useCode': 'Използване на кода вместо това',
  'unlock.forgotBodyCode':
    'Премахнете този трезор в Настройки и влезте отново с Google или GitHub: всеки вход се връща от акаунта ви.',
  'unlock.device': 'Отключване с {method}',
  'unlock.key': 'Отключване с ключ за сигурност',
  'unlock.keyBody': 'Включете ключа си за сигурност или въведете по-долу.',
  'unlock.or': 'или',
  'unlock.unlocking': 'Отключване…',
  'unlock.forgot': 'Забравихте?',
  'unlock.forgotBody':
    'Главната ви парола е единственият ключ към този трезор и никъде не се съхранява. Без нея трезорът не може да бъде отворен – можете само да го премахнете в Настройки и да започнете отначало.',

  // Vault
  'vault.search': 'Търсене',
  'vault.lock': 'Заключване',
  'vault.settings': 'Настройки',
  'vault.add': 'Нов вход',
  'vault.onThisPage': 'На {site}',
  'vault.all': 'Всички входове',
  'vault.empty': 'Още няма входове',
  'vault.emptyBody':
    'Влезте в някой сайт и Passhold ще предложи да го запази – или добавете вход тук, или импортирайте от браузъра си.',
  'vault.import': 'Импортиране на пароли',
  'vault.noResults': 'Нищо не съвпада с „{query}“.',
  'vault.fill': 'Попълване',
  'vault.copyUsername': 'Копиране на потребителското име',
  'vault.copyPassword': 'Копиране на паролата',
  'vault.noUsername': 'Без потребителско име',
  'vault.count': { one: '{count} елемент', other: '{count} елемента' },
  'vault.everything': 'Всички елементи',

  // Asking for a rating, once, after real use
  'rating.title': 'Намирате ли Passhold полезен?',
  'rating.body': 'Оценката в магазина помага на другите хора да го открият.',
  'rating.rate': 'Оценете го',
  'rating.later': 'Не сега',

  // What a list shows, and what can be added
  'kinds.label': 'Показване',
  'kinds.all': 'Всичко',
  'kinds.logins': 'Входове',
  'kinds.cards': 'Карти',
  'kinds.addresses': 'Адреси',
  'kinds.notes': 'Бележки',
  'kinds.noLogins': 'Още няма входове.',
  'kinds.noCards':
    'Още няма карти. Добавете една с + горе и Passhold я попълва при плащане, когато я изберете.',
  'kinds.noAddresses':
    'Още няма адреси. Добавете един с + горе и Passhold го попълва там, където формуляр го поиска.',
  'kinds.noNotes':
    'Още няма бележки. Бележката пази нещо, което не е вход – парола за Wi-Fi, лицензен ключ – шифровано заедно с всичко останало.',
  'add.menu': 'Добавяне',
  'add.login': 'Вход',
  'add.card': 'Карта',
  'add.address': 'Адрес',
  'add.note': 'Бележка',
  'place.label': 'Трезори',
  'place.mine': 'Моят',
  'place.of': '{vault}, споделен в {family}',
  'move.to': 'Преместване в {vault}',
  'move.confirm':
    'Всички в {family} ще го виждат в {vault} и могат да го променят. Той напуска вашия трезор; предишните му пароли остават там.',
  'move.do': 'Преместване',
  'family.unlockTitle': 'Отваряне на споделения трезор на {family} в този браузър',
  'family.unlockBody':
    'Passhold поиска веднъж паролата на акаунта ви в Keyrook, за да предаде ключа ви на семейството в този браузър. Той никъде не се изпраща.',
  'family.unlockOnPage':
    'Отворете страницата „Family“ в account.keyrook.com и предайте ключа си за семейството на Passhold там.',
  'family.password': 'Парола на акаунта в Keyrook',
  'family.unlock': 'Отваряне',
  'family.openPage': 'Отваряне на страницата „Семейство“',
  'family.keyChanged': 'Ключът на {who} в {family} се промени',
  'family.newSender': 'Ключът на {family} дойде от {who}, когото този браузър още не познава',
  'family.keyChangedBody':
    'Passhold не приема нищо от тях, докато двамата не сравните код. Обадете им се или се срещнете: те избират да сравнят кодове до името ви на страницата „Family“ в account.keyrook.com.',
  'family.showCode': 'Показване на кода',
  'family.codeIs': 'Вашият код',
  'family.match': 'Кодовете съвпадат',
  'family.differ': 'Кодовете се различават',
  'family.differed':
    'Тогава не им се доверявайте. Кажете на организатор на семейството си; Passhold дотогава не приема нищо от тях.',
  'family.someone': 'Някой',
  'family.waiting':
    'Организатор на {family} още трябва да ви потвърди. Какво се споделя, се отваря тук, щом го направи.',
  'family.rotate':
    'Някой напусна {family}, а Passhold още не е сменил всичките си ключове: промяната в споделените му трезори чака на този браузър. Ако това продължи, сменете ги на страницата „Family“.',
  'family.rotateCompare':
    'Някой напусна {family}. Passhold дава на всички нови ключове, след като сравните кода по-горе; дотогава промяната в споделените му трезори чака на този браузър.',
  'family.rotateWait':
    'Някой напусна {family}. Промяната, която правите в споделените му трезори, чака на този браузър, докато Passhold на организатор смени ключовете, което той прави при синхронизиране, за да не може напусналият да я прочете.',
  'family.left': '{who} вече не е в {family}',
  'family.leftBody':
    'Passhold не може да разбере защо. Ако не сте очаквали това, попитайте самия човек или организатор на семейството си.',
  'family.title': 'Семейство',
  'family.description':
    'Кой е в семейството ви и трезорите, които то споделя. Семейството се управлява на страницата „Family“ в account.keyrook.com: поканване, премахване на човек, смяна на ключове.',
  'family.none':
    'Този акаунт не е в семейство. Семействата се създават на страницата „Family“ в account.keyrook.com.',
  'family.youOrganise': 'Вие сте организатор в него.',
  'family.youMember': 'Вие сте член на него.',
  'family.you': '(вие)',
  'family.organiser': 'Организатор',
  'family.notCompared': 'Приет без сравняване на кодове',
  'family.keyNew': 'Ключът им се промени: нищо не се приема от тях, докато не сравните код',
  'family.membersLater': 'Кой е в него се показва тук, щом се отвори в този браузър.',
  'family.sharedVaults': 'Споделени трезори',
  'family.vaultWaits': 'Промяната в него чака, докато организатор смени ключа',

  // Cards, addresses and notes
  'wallet.updated': 'Променен на {date}',
  'wallet.copyField': 'Копиране на {field}',
  'card.untitled': 'Карта',
  'card.newTitle': 'Нова карта',
  'card.editTitle': 'Редактиране на карта',
  'card.titleHint': 'Ако е празно, картата се именува по издателя си и последните четири цифри.',
  'card.number': 'Номер на картата',
  'card.numberCheck': 'Този номер не се сверява: проверете всяка цифра.',
  'card.holder': 'Име върху картата',
  'card.expiry': 'Валидна до',
  'card.month': 'Месец',
  'card.year': 'Година',
  'card.code': 'Код за сигурност',
  'card.empty': 'Въведете номер на карта или име.',
  'card.expired': 'Тази карта е с изтекъл срок.',
  'card.expiredOn': 'изтекла {expiry}',
  'card.copyNumber': 'Копиране на номера на картата',
  'card.copyExpiry': 'Копиране на срока на валидност',
  'address.untitled': 'Адрес',
  'address.newTitle': 'Нов адрес',
  'address.editTitle': 'Редактиране на адрес',
  'address.titleHint': 'Дом, Работа… Ако е празно, адресът се именува по името в него.',
  'address.name': 'Пълно име',
  'address.organization': 'Фирма',
  'address.street': 'Адрес на улица',
  'address.city': 'Град',
  'address.region': 'Област или щат',
  'address.postalCode': 'Пощенски код',
  'address.country': 'Държава',
  'address.chooseCountry': 'Изберете държава',
  'address.phone': 'Телефон',
  'address.email': 'Имейл',
  'address.address': 'Адрес',
  'address.empty': 'Въведете име или част от адреса.',
  'note.untitled': 'Бележка без заглавие',
  'note.newTitle': 'Нова бележка',
  'note.editTitle': 'Редактиране на бележка',
  'note.title': 'Заглавие',
  'note.text': 'Бележка',
  'note.empty': 'Въведете заглавие или напишете нещо.',
  'note.edited': 'Редактирано на {date}',

  // Pending save, in the popup
  'pending.saveTitle': 'Да запазя ли този вход?',
  'pending.updateTitle': 'Да обновя ли паролата?',
  'pending.lockedTitle': 'Да запазя ли входа, който използвахте току-що?',
  'pending.body': '{username} в {site}',
  'pending.bodyNoUser': 'Парола за {site}',
  'pending.save': 'Запазване',
  'pending.update': 'Обновяване',
  'pending.never': 'Никога за този сайт',

  // Item
  'item.username': 'Потребителско име',
  'item.password': 'Парола',
  'item.website': 'Уебсайт',
  'item.websites': 'Уебсайтове',
  'item.notes': 'Бележки',
  'item.favorite': 'Любим',
  'item.unfavorite': 'Премахване от любими',
  'item.addFavorite': 'Добавяне към любими',
  'item.trash': 'Преместване в кошчето',
  'item.updated': 'Паролата е променена на {date}',
  'item.history': 'По-ранни пароли',
  'item.weak': 'Тази парола е слаба: няма да отнеме дълго за налучкване.',
  'item.reused': {
    one: 'Тази парола се използва и за още един вход. Ако един сайт я изтече, и двата са отворени.',
    other: 'Тази парола се използва и за още {count} входа. Ако един сайт я изтече, всички са отворени.',
  },
  'item.changePassword': 'Сменете я в сайта',
  'item.openSite': 'Отваряне на {site}',
  'item.passkey': 'Пароключ',
  'item.passkeyBody': 'За {site}, запазен на {date}',

  // Edit
  'edit.newTitle': 'Нов вход',
  'edit.editTitle': 'Редактиране на вход',
  'edit.title': 'Име',
  'edit.titleHint': 'Ако е празно, входът се именува по уебсайта.',
  'edit.username': 'Потребителско име или имейл',
  'edit.password': 'Парола',
  'edit.generate': 'Генериране',
  'edit.websites': 'Уебсайтове',
  'edit.websitesHint': 'По един на ред. Passhold предлага този вход на тези сайтове.',
  'edit.notes': 'Бележки',
  'edit.empty': 'Въведете име, потребителско име или парола.',

  // Fields of an item's own, and folders
  'fields.title': 'Собствени полета',
  'fields.add': 'Добавяне на поле',
  'fields.name': 'Име на полето',
  'fields.value': 'Стойност',
  'fields.hidden': 'Скриване като парола',
  'fields.remove': 'Премахване на това поле',
  'fields.unnamed': 'Поле',
  'fields.copy': 'Копиране на {name}',
  'folders.label': 'Папка',
  'folders.placeholder': 'Без папка',
  'folders.choose': 'Съществуващи папки',
  'folders.hint': 'Дръжте нещата заедно – Работа, Семейство, Банка – и показвайте по една папка наведнъж.',
  'folders.all': 'Всички папки',
  'folders.none': 'Без папка',
  'folders.count': { one: '{count} елемент', other: '{count} елемента' },
  'folders.nothingHere': 'Нищо от този вид в тази папка.',
  'folders.rename': 'Преименуване',
  'folders.renameTo': 'Ново име на папката',
  'folders.remove': 'Премахване на папката',
  'folders.removeHint': 'Какво има в нея остава, без папка.',

  // Generator
  'generator.length': 'Дължина',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'Без символи, които си приличат (I l 1 O 0)',
  'generator.again': 'Друга',
  'generator.use': 'Използване на тази парола',
  'generator.bits': '{bits} бита',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold е заключен.',
  'menu.unlock': 'Отключване на Passhold',
  'menu.unlockHint': 'Натиснете Passhold в лентата с инструменти, за да отключите, и се върнете тук.',
  'menu.none': 'Няма запазени входове за {site}.',
  'menu.uninitialized': 'Първо настройте Passhold: натиснете го в лентата с инструменти.',
  'menu.suggest': 'Използване на силна парола',
  'menu.suggestBody': 'Нова парола, попълнена вместо вас. Passhold предлага да я запази, след като формулярът се изпрати.',
  'menu.fillFor': 'Попълване на {site}',
  'menu.hidden': 'Passhold е закрит от нещо на тази страница, затова няма да попълни.',
  'menu.passkey': 'Пароключ · {username}',
  'menu.noCards': 'Още няма карти в Passhold. Добавете една от Passhold в лентата с инструменти.',
  'menu.noAddresses': 'Още няма адреси в Passhold. Добавете един от Passhold в лентата с инструменти.',
  'menu.cardInsecure':
    'Тази страница не е защитена (обикновен http), затова Passhold няма да попълни карта тук: всеки по пътя може да я прочете.',

  // A website's passkey
  'passkey.saveTitle': 'Да запазя ли пароключ за {site}?',
  'passkey.save': 'Запазване на пароключа',
  'passkey.saveElsewhere': 'Запазване другаде',
  'passkey.useElsewhere': 'Използване на пароключ от друго място',
  'passkey.existsTitle': 'Този пароключ вече е в Passhold',
  'passkey.ok': 'OK',
  'passkey.signInTitle': 'Влизане в {site}',
  'passkey.signInBody': 'С пароключ, запазен в Passhold',
  'passkey.none': 'Няма пароключ за {site} в Passhold.',
  'passkey.hidden': 'Passhold е закрит от нещо на тази страница, затова няма да отговори.',

  // Save prompt on a page
  'prompt.save': 'Да запазя ли входа в Passhold?',
  'prompt.update': 'Да обновя ли паролата в Passhold?',
  'prompt.saveButton': 'Запазване',
  'prompt.updateButton': 'Обновяване',
  'prompt.never': 'Никога за този сайт',
  'prompt.saved': 'Запазено в Passhold.',
  'prompt.locked': 'Натиснете Passhold в лентата с инструменти и го отключете – там ще ви пита дали да запази.',
  'prompt.saveCard': 'Да запазя ли картата в Passhold?',
  'prompt.updateCard': 'Да обновя ли картата в Passhold?',
  'prompt.saveAddress': 'Да запазя ли адреса в Passhold?',
  'prompt.saveCheckout': 'Да запазя ли картата и адреса в Passhold?',

  // Settings
  'settings.title': 'Настройки',
  'settings.cannotOpen': 'Не се отваря изобщо? Премахнете трезора от този браузър',
  'settings.encryptedHere': 'Шифровано на това устройство',
  'settings.source': 'Изходен код в GitHub',

  'nav.passwords': 'Пароли',
  'nav.accountSync': 'Акаунт и синхронизация',
  'nav.family': 'Семейство',
  'nav.account': 'Акаунт в Keyrook',
  'nav.backup': 'Резервно копие и импорт',
  'nav.security': 'Сигурност',
  'nav.general': 'Общи',
  'nav.needsAttention': 'изисква внимание',


  'account.description':
    'Влезте и входовете ви ви следват във всеки браузър, в който влизате в Passhold. Те първо се шифрират на това устройство: сървърът на Keyrook не може да ги чете, нито да разбере за кои сайтове са.',
  'account.email': 'Имейл',
  'account.password': 'Парола на акаунта в Keyrook',
  'account.signIn': 'Влизане',
  'account.signingIn': 'Влизане…',
  'account.note':
    'Същият акаунт като в Keyrook Authenticator. Акаунт, създаден с Google или GitHub, влиза с техния бутон.',
  'account.haveOne': 'Имам акаунт',
  'account.create': 'Създаване на акаунт',
  'account.sendCode': 'Изпращане на код по имейл',
  'account.createNote':
    'Keyrook изпраща шестцифрен код на имейл, за да потвърди, че адресът е ваш. Ако адресът вече има акаунт, имейлът ще ви каже това вместо това: влезте с него.',
  'account.codeSent': 'Кодът е на път към {email}. Важи петнадесет минути.',
  'account.code': 'Шестцифрен код',
  'account.newPassword': 'Парола на акаунта в Keyrook',
  'account.passwordNote':
    'Тази парола отваря акаунта ви в Keyrook във всеки браузър, за Passhold и Keyrook Authenticator еднакво. Keyrook никога не я вижда и не може да я нулира вместо вас; ключът за възстановяване, който ще получите след това, е начинът да зададете нова.',
  'account.createButton': 'Създаване на акаунт',
  'account.creating': 'Създаване…',
  'account.otherEmail': 'Използване на друг адрес',
  'account.signedInAs': 'Влезли сте като {email}',
  'account.signedInAsNamed': 'Влезли сте като {name} ({email})',
  'account.synced': 'Синхронизирано на {date}',
  'account.notSynced': 'Още не е синхронизирано',
  'account.syncNow': 'Синхронизиране сега',

  // The account, at the foot of the popup
  'accountBar.synced': 'Синхронизирано {time}',
  'accountBar.justNow': 'току-що',
  'accountBar.syncing': 'Синхронизиране…',
  'accountBar.signedOut': 'Излезли сте – влезте отново, за да синхронизирате',
  'accountBar.startedOver': 'Акаунтът започна отначало – влезте отново',
  'accountBar.removed': 'Премахнат от акаунта – влезте отново, за да синхронизирате',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'Премахнат от акаунта ви в Keyrook',
  'removed.body':
    'На {date} този браузър беше премахнат от акаунта ви в Keyrook, затова Passhold премахна от него входовете, картите, адресите и бележките на акаунта и го изведе. Добавеното или променено тук, което никога не е изпратено, остана като собствено на този браузър. Влезте отново, за да върнете останалото.',

  // Passwords, in Settings
  'passwords.description':
    'Всеки вход, пароключ, карта, адрес и бележка в Passhold. Изберете един, за да го видите, копирате от него или промените.',
  'passwords.all': 'Всички',
  'passwords.attention': 'Изисква внимание',
  'passwords.weak': 'Слаби',
  'passwords.reused': 'Повторно използвани',
  'account.syncDone': 'Синхронизирано.',
  'account.removed': {
    one: 'Премахнат е {count} елемент, изтрит завинаги на друго устройство.',
    other: 'Премахнати са {count} елемента, изтрити завинаги на друго устройство.',
  },
  'account.skipped': {
    one: '{count} запис не можа да се отвори и е оставен на мира.',
    other: '{count} записа не можаха да се отворят и са оставени на мира.',
  },
  'account.manage': 'Управление на акаунта ви в Keyrook',
  'account.manageBody':
    'Сменете паролата, създайте нов ключ за възстановяване или започнете акаунта отначало на account.keyrook.com – за Passhold и Keyrook Authenticator еднакво.',
  'account.manageBodyProvider':
    'Създайте нов ключ за възстановяване или започнете акаунта отначало на account.keyrook.com – за Passhold и Keyrook Authenticator еднакво.',
  'account.manageOpen': 'Отваряне',
  'account.signOut': 'Излизане',
  'account.signOutBody': 'Премахва всеки вход от този браузър, след последно синхронизиране. Влезте отново и те се връщат.',
  'account.signOutConfirm':
    'Passhold синхронизира още веднъж, след това премахва трезора от този браузър. Нищо не се премахва, ако някой вход не е стигнал до акаунта ви.',
  'account.signOutButton': 'Излизане и премахване',
  'account.signedOutByServer': 'Keyrook изведе този браузър. Влезте отново, за да продължите синхронизирането.',
  'account.startedOver':
    'Акаунтът ви в Keyrook започна отначало на {date}, затова Keyrook изведе този браузър. Влезте с новата му парола: входовете тук се качват с новите ключове на акаунта.',
  'account.startedOverProvider':
    'Акаунтът ви в Keyrook започна отначало на {date}, затова Keyrook изведе този браузър. Влезте с Google или GitHub: входовете тук се качват с новите ключове на акаунта.',
  'account.forgot': 'Забравена парола?',
  'account.recoverBody':
    'Keyrook изпраща код на адреса на акаунта; след това го въведете, ключа за възстановяване на акаунта от листа, който сте запазили при създаването му, и нова парола. Всеки друг браузър и приложение, влезли в акаунта, ще поиска новата.',
  'account.recoveryKey': 'Ключ за възстановяване на акаунта',
  'account.recoverPassword': 'Нова парола на акаунта',
  'account.recoverButton': 'Задаване на нова парола',
  'account.recovering': 'Задаване…',
  'account.backToSignIn': 'Назад към влизането',
  'startOver.link': 'Загубихте и ключа за възстановяване? Започнете акаунта отначало',
  'startOver.title': 'Започнете акаунта отначало',
  'needsRoot.body':
    'Ако имате ключа за възстановяване на акаунта, който ви даде Keyrook Authenticator, въведете го: тогава той отваря и Passhold. Без него Passhold създава нов ключ за възстановяване на акаунта, показан веднъж, и старият спира да работи.',
  'needsRoot.sheet': 'Ключ за възстановяване на акаунта от Keyrook Authenticator (ако го имате)',
  'needsRoot.withSheet': 'Използване на този ключ',
  'needsRoot.newSheet': 'Създаване на нов ключ за възстановяване',
  'startOver.body':
    'Когато не остане нищо друго освен имейл адресът, акаунтът може да започне отначало с нови ключове и нов ключ за възстановяване. Важи след седмица от заявката ви, а дотогава всеки браузър, влязъл в акаунта, може да го отмени – така някой, който има само имейла ви, не може да го вземе. Всичко, което акаунтът е държал, Keyrook пази, шифровано, 90 дни: старата парола или стария ключ за възстановяване го връщат.',
  'startOver.button': 'Започване отначало',
  'startOver.working': 'Започване отначало…',
  'startOver.kitBody':
    'Новият ключ за възстановяване на акаунта: работи, след като акаунтът започне отначало. Passhold го показва само сега, затова го запазете, преди да продължите.',
  'startOver.waitTitle': 'Акаунтът ви започва отначало на {date}',
  'startOver.waitBody':
    'Дотогава нищо не се променя, а всеки браузър, който още е влязъл в акаунта, може да го отмени. Keyrook пише на {email} сега, ден преди това и когато се случи.',
  'startOver.waitThen':
    'Оттогава влезте тук с новата си парола. Входовете в този браузър се качват с новите ключове на акаунта, а каквото е имал преди, се пази 90 дни.',
  'startOver.waitThenProvider':
    'Оттогава влезте тук с Google или GitHub, както преди. Входовете в този браузър се качват с новите ключове на акаунта, а каквото е имал преди, се пази 90 дни.',
  'startOver.understood': 'Разбрах',
  'startOver.doneTitle': 'Акаунтът ви започна отначало',
  'startOver.doneBody':
    'Влезте с новата си парола: входовете в този браузър се качват с новите ключове на акаунта, а каквото е имал преди, се пази 90 дни.',
  'startOver.doneBodyProvider':
    'Влезте с Google или GitHub, както преди: входовете в този браузър се качват с новите ключове на акаунта, а каквото е имал преди, се пази 90 дни.',
  'startOverWait.title': 'Акаунтът ви в Keyrook започва отначало на {date}',
  'startOverWait.body':
    'Поискано е с кода, който Keyrook ви изпрати по имейл, от устройство, което се нарича „{device}“. Ако не сте вие, някой може да чете имейла ви: отменете го сега и после сменете паролата на имейла си. Ако сте вие, оставете го.',
  'startOverWait.bodyNoName':
    'Поискано е с кода, който Keyrook ви изпрати по имейл. Ако не сте вие, някой може да чете имейла ви: отменете го сега и после сменете паролата на имейла си. Ако сте вие, оставете го.',
  'startOverWait.cancel': 'Отмяна на започването отначало',
  'kept.title': {
    one: 'Запазено от преди акаунтът да започне отначало: {count} елемент',
    other: 'Запазено от преди акаунтът да започне отначало: {count} елемента',
  },
  'kept.body': 'До {date}. Старата парола на акаунта или старият ключ за възстановяване ги връща в Passhold.',
  'kept.open': 'Връщане',
  'kept.secret': 'Стара парола на акаунта или стар ключ за възстановяване',
  'kept.done': { one: 'Връщен е {count} елемент.', other: 'Върнати са {count} елемента.' },
  'kept.nothingNew': 'Всичко, което е запазено, вече е тук.',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': 'Продължаване с {provider}',
  'provider.passwordTitle': 'Този акаунт в Keyrook има парола',
  'provider.passwordBody':
    'Влезли сте с {provider} като {email}. Паролата на акаунта е това, което отваря Passhold тук: въведете я веднъж.',
  'provider.openAccountPage': 'Отваряне на account.keyrook.com',
  'secondStep.title': 'Вход в две стъпки',
  'secondStep.body':
    'Въведете 6-цифрения код, който показва приложението ви за удостоверяване за Keyrook. Загубихте приложението? Въведете ключа си за възстановяване на акаунта вместо това.',
  'secondStep.ownerBody':
    'Акаунтът ви иска втора стъпка и за това: кодът от приложението ви за удостоверяване или ключът ви за възстановяване на акаунта.',
  'secondStep.field': 'Код или ключ за възстановяване',
  'secondStep.continue': 'Продължаване',
  'secondStep.passkey': 'Използване на пароключ вместо това',
  'secondStep.nextBody':
    'Даването на ключа на акаунта иска код също, а всеки код работи само веднъж. Изчакайте приложението ви за удостоверяване да покаже нов, после го въведете – или ключа си за възстановяване на акаунта.',
  'provider.or': 'или',
  'provider.signedInWith': 'Влезли сте с {provider} като {email}',
  'provider.signedInWithNamed': 'Влезли сте с {provider} като {name} ({email})',
  'provider.newTitle': 'Създайте акаунта си в Keyrook',
  'provider.newBody':
    'Влизате с {provider} като {email}. Акаунтът няма парола: {provider} ви влиза. На друг компютър браузър, който вече е влязъл, ви пуска – или ви пуска ключът за възстановяване, който ще получите след това.',
  'provider.joinTitle': 'Пускане на този браузър',
  'provider.joinBody':
    '{email} е влязъл тук, но ключът, който отваря входовете ви, е на другите ви компютри. Отворете Passhold на един от тях – Настройки, Акаунт и синхронизация – и пуснете този браузър.',
  'provider.waiting': 'Чака се друг браузър…',
  'provider.compare': 'Другият браузър показва код. Пуснете го там само ако е този:',
  'provider.ended': 'Заявката приключи, преди друг браузър да пусне този.',
  'provider.askAgain': 'Питай отново',
  'provider.useKit': 'Използване на ключа за възстановяване вместо това',
  'provider.useThisKey': 'Използване на този ключ',
  'provider.needsRoot':
    '{email} е създаден в Keyrook Authenticator, преди всяко приложение на Keyrook да има собствен ключ. Passhold може да му даде такъв сега, след като потвърдите отново с {provider}; нищо в Authenticator не се променя.',
  'provider.confirmWith': 'Потвърдете с {provider}',
  'provider.noKeyYet':
    'Passhold още не е влизал в {email} никъде, затова никой друг браузър не може да пусне този. Ключът за възстановяване на акаунта го отваря.',
  'passkey.onLabel': 'Новите компютри се отварят с пароключа ви',
  'passkey.offLabel': 'Без пароключ за новите компютри',
  'passkey.body':
    'На нов компютър: {provider}, после пароключът ви – и всички входове са там. Пазен от Мениджъра на пароли на Google, пароключът е на всеки Chrome, в който влизате.',
  'passkey.bodyEdge':
    'На нов компютър: {provider}, после пароключът ви – и всички входове са там. Запазен там, където се синхронизира, пароключът е и на другите ви устройства.',
  'passkey.turnOn': 'Включване',
  'passkey.turnOff': 'Изключване',
  'passkey.joinTitle': 'Отваряне с пароключа ви',
  'passkey.joinBody': '{email} има пароключ за новите компютри. Потвърдете с него и входовете ви се зареждат.',
  'passkey.use': 'Използване на пароключ',
  'passkey.otherWays': 'Други начини за влизане',
  'pairing.asking': '{device} иска да бъде пуснат в акаунта ви.',
  'pairing.start': 'Пускане…',
  'pairing.notMe': 'Не съм аз',
  'pairing.compare': 'Пуснете го само ако новият браузър показва същия код:',
  'pairing.match': 'Кодовете съвпадат – пусни',
  'pairing.differ': 'Кодовете се различават',

  'accountKit.title': 'Запазете ключа за възстановяване на акаунта',
  'accountKit.body':
    'Ако забравите паролата на акаунта си в Keyrook, този ключ задава нова – за Passhold и Keyrook Authenticator еднакво. Keyrook никога не вижда паролата ви, затова това е единственият начин. Можете да го видите отново в Настройки; пазете го и на друго място.',
  'accountKit.fileTitle': 'Ключ за възстановяване на акаунта в Keyrook',
  'accountKit.fileBody':
    'Ако забравите паролата на акаунта си в Keyrook, този ключ задава нова: в Passhold, Настройки → Акаунт и синхронизация → „Забравена парола?“. Всеки, който го има и имейл адреса ви, може да направи същото, затова го пазете на сигурно място и не на този компютър.',
  'accountKit.bodyNoPassword':
    'Акаунтът ви няма парола: браузър, който вече е влязъл, пуска нов. Ако не остане такъв, този ключ пуска – за Passhold и Keyrook Authenticator еднакво. Можете да го видите отново в Настройки; пазете го и на друго място.',
  'accountKit.fileBodyNoPassword':
    'Ако няма компютър, влязъл в акаунта ви в Keyrook, този ключ пуска нов: влезте с Google или GitHub, после изберете „Използване на ключа за възстановяване вместо това“. Всеки, който го има и може да влиза като вас, може да направи същото, затова го пазете на сигурно място и не на този компютър.',
  'accountKit.whenTitleNoPassword': 'Когато няма компютър, влязъл в акаунта',
  'accountKit.inPassholdNoPassword':
    'В Passhold: влезте с Google или GitHub, изберете „Използване на ключа за възстановяване вместо това“ и въведете този ключ.',
  'accountKit.keepNoPassword':
    'Пазете този лист на сигурно място, далеч от компютъра си. С него всеки, който може да влиза в Google или GitHub акаунта ви, може да отвори акаунта ви в Keyrook.',
  'accountKit.rowBodyNoPassword': 'Пуска нов компютър, когато няма друг, който да го направи.',
  'accountKit.sheetTitle': 'Комплект за възстановяване на акаунта в Keyrook',
  'accountKit.whenTitle': 'Когато паролата на акаунта е забравена',
  'accountKit.inPasshold':
    'В Passhold: Настройки → Акаунт и синхронизация → „Забравена парола?“, после имейл адресът ви, кодът, който Keyrook изпраща по имейл, този ключ и нова парола.',
  'accountKit.inAuthenticator': 'Keyrook Authenticator приема същия ключ: „Забравена парола?“ там, където ви пита за вход.',
  'accountKit.keep':
    'Пазете този лист на сигурно място, далеч от компютъра си. Всеки, който го има и има достъп до пощенската ви кутия, може да зададе нова парола за акаунта.',
  'accountKit.pending': 'Ключът за възстановяване на акаунта не е запазен',
  'accountKit.keptState': 'Ключът за възстановяване на акаунта е запазен',
  'accountKit.elsewhere': 'Ключът за възстановяване на акаунта е създаден другаде',
  'accountKit.none': 'Няма ключ за възстановяване на акаунта',
  'accountKit.rowBody': 'Задава нова парола на акаунта, ако бъде забравена. Нов ключ спира стария да работи във всяко приложение.',
  'accountKit.elsewhereBody':
    'Създаден на account.keyrook.com, в Keyrook Authenticator или в друг браузър: ключът му е на листа, запазен тогава. Създаването на такъв тук спира онзи да работи.',
  'accountKit.noneBody':
    'Без него забравена парола на акаунта не може да се нулира, а това, което се пази в Keyrook, не може да се отвори. Входовете в този браузър остават във всеки случай.',
  'accountKit.make': 'Създаване на един',
  'accountKit.apart':
    'Пазете го отделно от имейла си: всеки, който има този ключ и може да чете имейла ви, може да зададе нова парола и да отвори входовете ви. Не го изпращайте на себе си по имейл и не го пазете в облачното хранилище на този имейл.',
  'accountKit.apartNoPassword':
    'Пазете го отделно от Google или GitHub акаунта, с който влизате: всеки, който има този ключ и може да влиза там като вас, може да отвори входовете ви. Не го изпращайте на себе си по имейл и не го пазете в облачното хранилище на този акаунт.',
  'accountKit.unchecked': 'Ключът за възстановяване на акаунта още не е проверен',
  'accountKit.uncheckedBody':
    'Акаунтът ви има ключ за възстановяване, създаден на account.keyrook.com или в друго приложение. Въведете го веднъж: Passhold проверява, че отваря акаунта ви, и го пази, за да ви го покаже отново.',
  'accountKit.typeIt': 'Въведете го',
  'accountKit.checked': 'Отваря акаунта ви. Passhold го пази сега, за да ви го покаже отново тук.',
  'accountKit.draftBody':
    'Новият ключ за възстановяване на акаунта ви. Още не работи: след като го запазите и го въведете отново, паролата на акаунта ви го задава и старият спира да работи.',
  'accountKit.setTitle': 'Задайте новия си ключ за възстановяване',
  'accountKit.setBody': 'Въведете паролата на акаунта си в Keyrook. Дотогава старият ви ключ за възстановяване работи, а този – не.',
  'accountKit.set': 'Задаване',

  'checkup.clear': 'Нищо за поправяне',
  'checkup.clearBody': 'Няма слаби или повторно използвани пароли, а резервното ви копие е актуално.',
  'checkup.issues': { one: '{count} нещо за проверка', other: '{count} неща за проверка' },
  'checkup.issuesBody': 'Всяко по-долу казва защо е важно и как да се поправи.',
  'checkup.backup': 'Резервно копие',
  'checkup.access': 'Достъп',
  'checkup.recoveryPending':
    'Ключът за възстановяване, създаден за този трезор, никога не е потвърден като запазен, а той е единственият достъп, ако {method} спре да работи. Създайте нов и го пазете.',
  'checkup.deviceMissing':
    'Този трезор няма главна парола, затова без {method} тук всяко отключване пита за ключа за възстановяване.',
  'checkup.lastBackup': 'Последно резервно копие {date}',
  'checkup.backupNever':
    'Ако този браузър се загуби, се губят и входовете ви. Резервното копие е един шифрован файл, който пазите на друго място.',
  'checkup.backupDue': 'Трезорът ви се е променил оттогава. Направете ново, за да съдържа всичко.',
  'checkup.backUp': 'Резервно копие сега',
  'checkup.weak': { one: '{count} слаба парола', other: '{count} слаби пароли' },
  'checkup.weakBody':
    'Къси или достатъчно прости, за да бъдат налучкани. Сменете всяка в нейния сайт; Passhold предлага силна парола във формуляра и предлага да я запази.',
  'checkup.weakNone': 'Няма.',
  'checkup.reused': {
    one: '{count} парола, използвана повече от веднъж',
    other: '{count} пароли, използвани повече от веднъж',
  },
  'checkup.reusedBody':
    'Когато един сайт изтече парола, хората я пробват навсякъде другаде. Дайте на всеки вход собствена.',
  'checkup.reusedNone': 'Няма: всеки вход има своя собствена парола.',
  'checkup.sharedBy': { one: 'Споделена с {count} вход', other: 'Споделена с {count} входа' },
  'checkup.change': 'Смяна',
  'checkup.limits':
    'Passhold не проверява дали дадена парола се е появила при изтичане на данни: това означава да се пита сървър, а Passhold не пита никакъв. Нито натяга за стари пароли – силната, уникална не се износва.',

  'backup.description': 'Запазване на шифрирано копие, връщане на такова или преместване на входове навътре и навън.',
  'backup.backupRow': 'Целият ви трезор в един шифрован файл, под главната ви парола.',
  'backup.restoreRow': 'Добавяне на входовете във файл с резервно копие към този трезор.',
  'backup.importRow': 'От друг браузър или мениджър на пароли, като CSV файл, или JSON на Bitwarden.',
  'backup.exportRow': 'CSV файл, който други приложения могат да четат. Не е шифрован.',

  'security.description': 'Как се отваря Passhold и кога се затваря отново.',
  'security.locking': 'Заключване',
  'security.opensTitle': 'Как се отваря Passhold',
  'security.opensBody': 'Без главна парола: {method} го отваря, а ключът за възстановяване – когато {method} не може.',
  'security.setPassword': 'Използване на главна парола вместо това',
  'security.setPasswordBody':
    'Тогава Passhold се отваря с парола, която избирате, а ключът за възстановяване спира да я отваря.',
  'security.setPasswordOpen': 'Задаване',
  'security.setPasswordSave': 'Използване на тази парола',
  'security.dropPassword': 'Спиране на използването на главна парола',
  'security.dropPasswordBody':
    'Отваряне само с {method} и запазване на ключ за възстановяване за деня, в който не може. Главната парола спира да отваря трезора.',
  'security.dropPasswordOpen': 'Превключване',
  'security.dropPasswordSave': 'Превключване и показване на ключа за възстановяване',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'заключването на екрана на устройството ви',
  'device.method.passkey': 'вашия пароключ',
  'device.title': 'Отключване с {method}',
  'device.description': 'Най-бързият начин за влизане, и продължава да работи след рестартиране на браузъра.',
  'device.on': 'Вкл.',
  'device.off': 'Изкл.',
  'device.body':
    'Пръстовият ви отпечатък или лицето ви отварят Passhold – или, на повечето компютри, паролата на самия компютър. Затова всеки, който може да отключи този компютър, може да отвори Passhold. Това, което отваря, остава на този компютър и не върши работа без него.',
  'device.whereMac':
    'Когато Chrome попита къде да запази пароключа, изберете „Мениджър на пароли на Google“. Пароключ в профила ви в Chrome не може да отключи Passhold, нито Ключодържателят в iCloud на всеки Mac.',
  'device.whereMacEdge':
    'Когато Edge попита къде да запази пароключа, изберете място, което го пази и на другите ви устройства. Не всяко място може да отключи Passhold: ако избраното не може, Passhold ви казва и нищо не се променя.',
  'device.unavailable': 'Не е налично тук',
  'device.unavailableBody':
    'Този браузър не намери пръстов отпечатък, лице или заключване на екрана, което Passhold може да използва. PIN кодът работи навсякъде.',
  'device.unavailableRecovery':
    'Този браузър не намери пръстов отпечатък, лице или заключване на екрана, което Passhold може да използва, затова тук този трезор се отваря с ключа си за възстановяване. Задайте главна парола, ако предпочитате да я въвеждате.',
  'device.opensWith': 'Passhold се отваря с {method}',
  'device.notHere': '{method} не е настроен в този браузър',
  'device.isTheWayIn':
    'Без главна парола така се отваря Passhold. За да го изключите, първо задайте главна парола.',
  'device.setUpHere': 'Докато {method} не е настроен тук, всяко отключване пита за ключа за възстановяване.',
  'device.setUp': 'Настройване',
  'device.turnOff': 'Изключване',
  'device.save': 'Настройване на {method}',
  'keys.title': 'Отключване с ключ за сигурност',
  'keys.description': 'USB ключ, който включвате: още един начин за влизане, който продължава да работи след рестартиране на браузъра.',
  'keys.method': 'вашия ключ за сигурност',
  'keys.on': { one: 'Настроен е {count} ключ', other: 'Настроени са {count} ключа' },
  'keys.off': 'Няма настроен ключ',
  'keys.body':
    'Включете ключа, въведете PIN кода му и го докоснете, и Passhold се отваря – само на този компютър. Който има ключа и знае PIN кода му, може да отвори Passhold тук, затова го пазете като ключ от къщата. Ако се загуби, премахнете го тук: другите ви начини за влизане продължават да работят.',
  'keys.add': 'Добавяне на ключ',
  'keys.save': 'Добавяне на този ключ',
  'keys.one': 'Ключ за сигурност',
  'keys.added': 'Добавен на {date}',
  'keys.remove': 'Премахване',
  'pin.title': 'Отключване с PIN код',
  'pinOffer.title': 'Отваряйте Passhold по-бързо с PIN код',
  'pinOffer.body':
    'Въвеждайте няколко цифри вместо паролата си всеки път, когато Passhold се заключва, докато браузърът не се затвори. След като браузърът се стартира отново – паролата ви веднъж.',
  'pinOffer.later': 'Можете да го настроите или изключите по всяко време в Настройки, Сигурност.',
  'pin.description': 'За многото пъти на ден, когато Passhold се заключва, докато сте на същия браузър.',
  'pin.on': 'Вкл.',
  'pin.off': 'Изкл.',
  'pin.bodyRecovery':
    'Работи само докато браузърът е отворен и само при пет грешни опита: след това, или след рестартиране, се изисква устройството или ключът за възстановяване. Нищо, което PIN кодът отваря, не се пази на диска.',
  'pin.body':
    'Работи само докато браузърът е отворен и само при пет грешни опита: след това, или след рестартиране, се изисква главната парола. Нищо, което PIN кодът отваря, не се пази на диска.',
  'pin.setUp': 'Настройване на PIN код',
  'pin.change': 'Смяна',
  'pin.turnOff': 'Изключване',
  'pin.new': 'PIN код, от 6 до 12 цифри',
  'pin.again': 'Въведете отново',
  'pin.save': 'Запазване на PIN кода',

  'general.description': 'Как се държи Passhold в уебсайтовете и как изглежда.',
  'general.filling': 'Попълване и запазване',
  'general.appearance': 'Език и външен вид',
  'settings.autoSuggest': 'Показване на предложения, когато щракнете върху поле за влизане, карта или адрес',
  'settings.autoSuggestBody':
    'Входовете ви за сайта, силна парола във формуляр за регистрация, картите и адресите ви при плащане. Нищо не се попълва, докато не изберете.',

  'trash.description': 'Входове, карти, адреси и бележки чакат тук, докато ги върнете или ги изтриете завинаги.',
  'trash.sharedDescription':
    'Споделено със семейството: всеки в него може да ги върне. Изтрити завинаги, те изчезват за всички.',
  'trash.sharedMember':
    'Споделено със семейството: можете да ги върнете. Само организатор на семейството ги изтрива завинаги.',
  'settings.autoLock': 'Заключване след',
  'settings.autoLock.never': 'Само когато браузърът се затвори',
  'settings.autoLock.minutes': { one: '{count} минута', other: '{count} минути' },
  'settings.autoLock.hours': { one: '{count} час', other: '{count} часа' },
  'settings.lockWithSystem': 'Заключване, когато компютърът се заключи или приспи',
  'settings.clipboard': 'Изчистване на копирани пароли след',
  'settings.clipboard.never': 'Никога',
  'settings.clipboard.seconds': { one: '{count} секунда', other: '{count} секунди' },
  'settings.clipboard.minutes': { one: '{count} минута', other: '{count} минути' },
  'settings.inlineButton': 'Показване на бутона на Passhold в полетата за влизане, карта и адрес',
  'settings.offerToSave': 'Предлагане за запазване на входове при влизане',
  'settings.offerToSaveCards': 'Предлагане за запазване на карти и адреси при плащане',
  'settings.offerToSaveCardsBody':
    'Карта само от сигурна (https) страница и само такава, чийто номер е валиден. Показва се с последните си четири цифри, никога с номера или кода си.',
  'settings.passkeys': 'Запазване и използване на пароключове',
  'settings.passkeysBody':
    'Когато сайт предложи пароключ, Passhold го пази с входовете ви и ви влиза с него. Когато е изключено, пароключовете се оставят на браузъра.',
  'settings.language': 'Език',
  'settings.language.auto': 'Както в браузъра',
  'settings.theme': 'Външен вид',
  'settings.theme.system': 'Както в системата',
  'settings.theme.light': 'Светла',
  'settings.theme.dark': 'Тъмна',

  'settings.security': 'Главна парола',
  'settings.securityBody': 'Смяната ѝ заключва наново ключа към трезора ви; входовете ви остават такива, каквито са.',
  'settings.current': 'Текуща главна парола',
  'settings.new': 'Нова главна парола',
  'settings.confirm': 'Въведете новата отново',
  'settings.change': 'Смяна на главната парола',
  'settings.changeOpen': 'Смяна',
  'settings.changed': 'Главната парола е сменена.',

  'settings.backup': 'Резервно копие',
  'settings.backupBody':
    'Целият ви трезор в един шифрован файл. Пазете го на друго място, не на този компютър – USB флашка или облачно хранилище – за да не загубите входовете си, ако този браузър се изгуби. Отваря се само с главната парола, която сте имали при създаването му.',
  'settings.backupBodyRecovery':
    'Целият ви трезор в един шифрован файл. Пазете го на друго място, не на този компютър – USB флашка или облачно хранилище – за да не загубите входовете си, ако този браузър се изгуби. Отваря се с ключа ви за възстановяване.',
  'settings.backupLast': 'Последно резервно копие: {date}',
  'settings.backupNever': 'Още няма резервно копие.',
  'settings.backupButton': 'Изтегляне на резервно копие',
  'settings.backupDone': 'Запазено в изтеглените файлове. Преместете го сега на място, различно от този компютър.',

  'settings.restoreBackup': 'Възстановяване от резервно копие',
  'settings.restoreBodyNew':
    'В този браузър още няма трезор. Върнете своя от файл с резервно копие – той ще се отвори с главната парола, с която е направено копието – или създайте нов от бутона на Passhold в лентата с инструменти.',
  'settings.restoreBodyMerge':
    'Добавя към този трезор каквото съдържа резервното копие. Тук нищо не се изтрива: когато и двете имат един и същ вход, по-новата редакция се запазва, а другата парола отива в историята му.',
  'settings.restoreChoose': 'Избор на файл с резервно копие',
  'settings.restoreMade': 'Резервното копие е направено на {date}',
  'settings.restorePassword': 'Главна парола на резервното копие',
  'settings.restoreRecoveryKey': 'Ключ за възстановяване на резервното копие',
  'settings.restoreButton': 'Възстановяване',
  'settings.restoreNew': { one: 'Трезорът е възстановен с {count} елемент.', other: 'Трезорът е възстановен с {count} елемента.' },
  'settings.restoreAdded': { one: 'Добавен е {count} елемент от резервното копие.', other: 'Добавени са {count} елемента от резервното копие.' },
  'settings.restoreUpdated': {
    one: '{count} елемент имаше по-нова редакция в резервното копие.',
    other: '{count} елемента имаха по-нова редакция в резервното копие.',
  },
  'settings.restoreNothing': 'Всичко в резервното копие вече е в този трезор.',

  'settings.import': 'Импортиране',
  'settings.importBody':
    'Донесете паролите си от Chrome, Edge, Firefox, Safari, Apple Passwords, Bitwarden, 1Password, LastPass, KeePass, Dashlane, Proton Pass или NordPass: експортирайте ги там като CSV файл и го изберете тук. Картите, адресите и бележките във файла също се внасят. От Bitwarden експортирайте като JSON (не е шифрован): CSV файлът му пропуска карти, самоличности и пароключове. Dashlane слага тези в отделни файлове: изберете всеки поред.',
  'settings.importChoose': 'Избор на файл',
  'settings.importFound': 'Намерени за импортиране: {what}.',
  'settings.importLogins': { one: '{count} вход', other: '{count} входа' },
  'settings.importPasskeys': { one: '{count} пароключ', other: '{count} пароключа' },
  'settings.importCards': { one: '{count} карта', other: '{count} карти' },
  'settings.importAddresses': { one: '{count} адрес', other: '{count} адреса' },
  'settings.importNotes': { one: '{count} бележка', other: '{count} бележки' },
  'settings.importSkipped': {
    one: '{count} запис не съдържа нищо, което Passhold пази, и се пропуска.',
    other: '{count} записа не съдържат нищо, което Passhold пази, и се пропускат.',
  },
  'settings.importDuplicates': { one: '{count} е вече в трезора ви.', other: '{count} са вече в трезора ви.' },
  'settings.importConfirm': 'Импортиране',
  'settings.importDone': 'Импортирано: {what}.',
  'settings.importDelete': 'Сега изтрийте CSV файла: съдържа паролите ви в явен текст.',
  'settings.importNothing': 'Нищо ново за импортиране в този файл.',
  'settings.importTwoFactor': {
    one: '{count} вход във файла има код за двуетапно влизане (2FA). Passhold не пази 2FA кодове: преместете го в приложение за удостоверяване, преди да изтриете стария си мениджър на пароли, или може да се заключите от този акаунт.',
    other: '{count} входа във файла имат кодове за двуетапно влизане (2FA). Passhold не пази 2FA кодове: преместете ги в приложение за удостоверяване, преди да изтриете стария си мениджър на пароли, или може да се заключите от тези акаунти.',
  },
  'settings.importAuthenticator': 'Вземете Keyrook Authenticator',
  'settings.importPasskeysLeft': {
    one: '{count} пароключ във файла не може да стигне до Passhold. Запазете стария си мениджър на пароли, докато не влезете в този сайт по друг начин и не създадете нов пароключ в Passhold.',
    other: '{count} пароключа във файла не могат да стигнат до Passhold. Запазете стария си мениджър на пароли, докато не влезете в тези сайтове по друг начин и не създадете нови пароключове в Passhold.',
  },

  'settings.export': 'Експортиране',
  'settings.exportBody':
    'CSV файл, който всеки браузър и мениджър на пароли може да прочете. Съдържа паролите ви в явен текст: пазете го само докато ви трябва. Съдържа само входове: пароключовете, собствените полета, папките, картите, адресите и бележките не са в него. Резервното копие съдържа всичко.',
  'settings.exportButton': 'Експорт на CSV',
  'settings.exportDone': 'Експортирано. Изтрийте файла, когато свършите с него.',

  'settings.neverSave': 'Никога не предлагай запазване при',
  'settings.neverSaveEmpty':
    'Няма сайтове. Изберете „Никога за този сайт“, когато Passhold предложи запазване, и той ще се появи тук.',
  'settings.remove': 'Премахване',

  'settings.trash': 'Кошче',
  'settings.trashEmpty': 'Кошчето е празно.',
  'settings.restore': 'Възстановяване',
  'settings.deleteForever': 'Изтриване завинаги',
  'settings.emptyTrash': 'Изпразване на кошчето',
  'settings.emptyTrashConfirm': 'Да се изтрие ли завинаги всичко в кошчето?',

  'settings.danger': 'Премахване на трезора',
  'settings.dangerBody':
    'Изтрива трезора от този браузър. Всеки вход в него се губи завинаги – изтеглете първо резервно копие, ако искате да ги запазите.',
  'settings.dangerType': 'Въведете {word} за потвърждение',
  'settings.dangerWord': 'изтрий',
  'settings.dangerButton': 'Премахване на трезора',

  'settings.about': 'Passhold {version} · от Keyrook',

  // Errors
  'error.noWorker': 'Passhold не отговори. Затворете това и опитайте отново.',
  'error.wrongPassword': 'Това не е главната парола.',
  'error.passwordTooShort': 'Използвайте поне {min} знака.',
  'error.vaultCorrupt': 'Трезорът на това устройство е повреден и не може да бъде отворен.',
  'error.vaultTooNew': 'Този трезор е създаден от по-нова версия на Passhold. Обновете Passhold, за да го отворите.',
  'error.itemNotFound': 'Това вече го няма в трезора.',
  'error.familyOrganiserOnly': 'Само организатор на семейството може да изпразни кошчето на този трезор.',
  'error.familyGone': 'Това семейство вече го няма тук. Синхронизирайте и потърсете отново.',
  'error.familyNotOpen': 'Passhold още не може да отвори това семейство в този браузър. Синхронизирайте и опитайте отново.',
  'error.itemInvalid': 'Това не може да се запази в този вид.',
  'error.importEmpty': 'Този файл няма нищо за импортиране.',
  'error.importTooLarge': 'Файлът е твърде голям за импортиране.',
  'error.importUnknownFormat': 'Този файл не прилича на експорт на пароли.',
  'error.importEncrypted':
    'Този експорт от Bitwarden е шифрован и Passhold не може да го отвори. Експортирайте отново от Bitwarden като „.json“, а не като „.json (Encrypted)“, и изберете този файл.',
  'error.backupInvalid': 'Този файл не е резервно копие на Passhold или е повреден.',
  'error.backupWrongPassword': 'Това не е главната парола, с която е направено това резервно копие.',
  'error.backupWrongRecoveryKey': 'Това не е ключът за възстановяване, с който е направено това резервно копие.',
  'error.noRecoveryKey': 'Този трезор няма ключ за възстановяване за показване: отваря се с главна парола.',
  'error.wrongRecoveryKey': 'Това не е ключът за възстановяване.',
  'error.deviceNeeded':
    'Трезор без главна парола се отваря с отключването на това устройство: настройте го първо. Остава, докато не се зададе главна парола.',
  'error.accountOffline': 'Не можа да се свърже с Keyrook. Проверете връзката и опитайте отново.',
  'error.accountWrong':
    'Грешен имейл или парола. Акаунт, създаден с Google или GitHub, влиза с техния бутон.',
  'error.accountSignedOut': 'Keyrook изведе този браузър. Влезте отново.',
  'error.accountBusy': {
    one: 'Твърде много опити. Изчакайте {count} секунда и опитайте отново.',
    other: 'Твърде много опити. Изчакайте {count} секунди и опитайте отново.',
  },
  'error.accountFailed': 'Keyrook не можа да направи това в момента. Опитайте по-късно.',
  'error.accountAlready': 'Този трезор вече е влязъл в акаунт в Keyrook.',
  'error.accountNone': 'Този трезор не е влязъл в акаунт в Keyrook.',
  'error.accountKdfRefused': 'Keyrook поиска по-слаб ключ, отколкото Passhold приема, затова влизането беше спряно.',
  'error.accountKeyWrong': 'Ключът на акаунта не се отвори с тази парола.',
  'error.accountCode': 'Този код не е верен или е изтекъл. Проверете имейла или поискайте нов код.',
  'error.accountMail': 'Keyrook не можа да изпрати имейла в момента. Опитайте отново след минута.',
  'error.providerDenied': 'Влизането беше отменено.',
  'error.providerFailed': 'Google или GitHub не можаха да ви влязат в момента. Опитайте отново.',
  'error.providerExpired': 'Това влизане приключи. Започнете отначало.',
  'error.providerNotOwner':
    'Това не е акаунтът, с който този акаунт в Keyrook влиза. Влезте отново с този, който ползвате за Keyrook.',
  'error.signOutUnsent': {
    one: 'Един елемент още не е стигнал до акаунта ви в Keyrook, затова нищо не е премахнато. Проверете връзката си или влезте отново, после излезте.',
    other: '{count} елемента още не са стигнали до акаунта ви в Keyrook, затова нищо не е премахнато. Проверете връзката си или влезте отново, после излезте.',
  },
  'error.providerOtherProvider':
    'Този имейл вече има акаунт в Keyrook, който влиза с другия от Google и GitHub. Влезте с него.',
  'error.providerHasPassword':
    'Този имейл вече има акаунт в Keyrook с парола. Влезте тук с имейла и паролата си – или, за да влизате и с Google или GitHub, добавете го в account.keyrook.com, влезли там с паролата си.',
  'error.providerEmailTaken':
    'Този имейл вече има акаунт в Keyrook, който влиза по друг начин. Влезте по този начин – или добавете този акаунт към него в account.keyrook.com, влезли там по начина, по който влиза сега.',
  'error.pairingWrongKey':
    'Това, което се върна, не е ключът на този акаунт, затова беше отказано. Поискайте отново и пуснете само от браузър, който познавате.',
  'error.pairingRefused': 'Това не дойде от браузъра, чийто код проверихте, затова беше отказано. Поискайте отново.',
  'error.pairingEnded': 'Заявката приключи. Поискайте отново от новия браузър.',
  'error.passkeyWrong': 'Този пароключ не отваря този акаунт. Опитайте друг начин за влизане.',
  'error.joinExpired': 'Това влизане чака твърде дълго. Влезте отново.',
  'error.accountPasswordWrong': 'Това не е паролата на акаунта.',
  'error.accountNoKit': 'Passhold не пази ключа за възстановяване на този акаунт.',
  'error.accountKitRace': 'Друго приложение току-що промени ключа за възстановяване на акаунта. Синхронизирайте и опитайте отново.',
  'error.accountKitShape': 'Не прилича на ключ за възстановяване на акаунт: състои се от 32 букви и цифри.',
  'error.accountKitWrong': 'Този ключ за възстановяване не съвпада с акаунт с този имейл адрес.',
  'error.accountKitNotThis': 'Това не е ключът за възстановяване на този акаунт. Погледнете отново запазеното.',
  'error.accountPasswordWeak':
    'Твърде лесна за налучкване за акаунт: използвайте по-дълга парола с букви, цифри и символи, или четири-пет несвързани думи.',
  'error.accountBoxWrong':
    'Ключът на Passhold в този акаунт не се отвори. Влезте отново; ако пак не стане, започнете акаунта отначало.',
  'error.accountCodeWait': {
    one: 'Код беше изпратен преди малко. Можете да поискате друг след {count} секунда.',
    other: 'Код беше изпратен преди малко. Можете да поискате друг след {count} секунди.',
  },
  'error.accountSignUpKeys':
    'Keyrook поиска собствения ключ на Passhold и не беше изпратен такъв. Обновете Passhold и опитайте отново.',
  'error.accountIdTaken': 'Акаунтът не можа да бъде създаден в момента. Поискайте нов код и опитайте отново.',
  'error.accountNoRoot': 'Този акаунт още няма ключ, който да отваря ключ за възстановяване. Влезте отново с паролата му.',
  'error.accountRootNotHeld':
    'Този компютър не можа да покаже, че държи ключа на акаунта. Влезте отново с паролата или с ключа за възстановяване.',
  'error.accountRootChanged':
    'Ключовете на този акаунт бяха заменени на друг компютър. Влезте на компютър, където Passhold още е влязъл, или започнете акаунта отначало.',
  'error.accountKeyReplaced': 'Ключът на Passhold в този акаунт беше заменен на друг компютър. Влезте отново.',
  'error.accountSessionStolen': 'Този компютър беше изведен, защото сесията му беше използвана от друго място. Влезте отново.',
  'error.accountOld':
    'Този акаунт е създаден с Google или GitHub, преди всяко приложение на Keyrook да има собствен ключ, и нищо в него още не отваря Passhold. Започнете акаунта отначало с имейла му, за да получи такъв.',
  'error.pairingBusy': 'Твърде много браузъри чакат да влязат в този акаунт. Опитайте отново след няколко минути.',
  'error.startOverExpired': 'Изтекло е. Поискайте нов код и започнете отначало.',
  'error.startOverTooOften': 'Този акаунт напоследък е започвал отначало твърде често. Опитайте отново след {day}.',
  'error.startOverWaiting': 'Този акаунт започва отначало на {day}. Браузър, който още е влязъл в него, може да го отмени.',
  'error.startOverUpdate': 'Keyrook сега чака една седмица, преди да започне акаунт отначало. Обновете Passhold, за да поискате това.',
  'error.passkeyFailed': 'Този пароключ не можа да бъде проверен. Опитайте отново.',
  'error.passkeyNotYou': 'Този пароключ не потвърди, че сте вие. Опитайте отново и го отключете, както иска.',
  'error.passkeyUnknown':
    'Този пароключ го няма в нито един акаунт в Keyrook. Може да е премахнат: влезте с паролата, или с Google или GitHub.',
  'error.passkeyExpired': 'Тази заявка за пароключ приключи. Опитайте отново.',
  'error.passkeyNotOffered': 'Keyrook още не предлага пароключове тук.',
  'error.passkeyNoUnlock':
    'Този пароключ влиза, но още не е настроен да отключва акаунта ви. В account.keyrook.com, под „Passkeys“, изберете „Let it unlock“ до него и опитайте отново. Или влезте с паролата, или с Google или GitHub.',
  'error.passkeyNoPrf':
    'Този пароключ влиза в account.keyrook.com, но мястото, където се пази, не може да отключи акаунта ви – Ключодържателят в iCloud преди macOS 15 например не може. В account.keyrook.com, под „Passkeys“, добавете такъв, пазен на място, което може, например ключ за сигурност, и проверете дали там пише „Unlocks your data“. Дотогава влезте с паролата или с Google или GitHub.',
  'error.passkeyPermission':
    'Passhold се нуждае от разрешение от Chrome, за да използва пароключовете на account.keyrook.com. Изберете пароключа отново и разрешете.',
  'error.passkeyPermissionEdge':
    'Passhold се нуждае от разрешение от Edge, за да използва пароключовете на account.keyrook.com. Изберете пароключа отново и разрешете.',
  'error.passkeyCancelled': 'Не беше използван пароключ. Опитайте отново или влезте по друг начин.',
  'error.secondStepNeeded': 'Акаунтът ви иска втора стъпка: въведете и кода от приложението си за удостоверяване.',
  'error.secondStepWrong':
    'Този код не е верен. Въведете този, който приложението ви за удостоверяване показва сега, или ключа си за възстановяване.',
  'error.signInExpired': 'Това влизане изтече. Влезте отново.',
  'error.secondStepUpdate': 'Акаунтът ви иска втора стъпка за влизане. Обновете Passhold, за да влезете.',
  'error.secondStepAsked': 'Акаунтът ви иска втора стъпка: въведете кода от приложението си за удостоверяване.',
  'error.secondStepTaken':
    'Това е кодът, с който влязохте, а всеки код работи само веднъж. Изчакайте приложението ви за удостоверяване да покаже нов.',
  'error.kitDraftGone': 'Новият ключ за възстановяване не беше зададен навреме и нищо не се промени. Създайте нов отново.',
  'error.archiveWrong': 'Това не отваря запазеното.',
  'error.archiveGone': 'Това вече не е запазено.',
  'error.archiveDeleteRefused': 'Само старата парола или старият ключ за възстановяване може да изтрие запазеното, преди да изтече.',
  'error.accountNeedsRoot':
    'Този акаунт е създаден в Keyrook Authenticator, преди всяко приложение на Keyrook да има собствен ключ. Passhold може да му даде такъв сега; нищо в Authenticator не се променя.',
  'error.accountServerWrong':
    'Сървърът на Keyrook отговори с нещо, с което ключовете на този акаунт не съвпадат, затова Passhold спря. Опитайте по-късно.',
  'error.startOverNeedsPassword': 'Този акаунт има парола: изберете нова, за да го започнете отначало.',
  'error.pinInvalid': 'PIN кодът е от 6 до 12 цифри.',
  'error.wrongPin': 'Това не е PIN кодът.',
  'error.wrongPinLeft': { one: 'Това не е PIN кодът. Остава {count} опит.', other: 'Това не е PIN кодът. Остават {count} опита.' },
  'error.pinLockedOut': 'Твърде много грешни PIN кодове. Отключете по друг начин; PIN кодът отново работи след това.',
  'error.pinUnavailable': 'PIN кодът работи само докато браузърът е отворен. Отключете по друг начин; PIN кодът отново работи след това.',
  'error.deviceGone': 'Отключването с това устройство вече не е настроено. Отключете по друг начин.',
  'error.deviceKeyWrong': 'Това не отвори Passhold. Отключете по друг начин, после настройте отново отключването с устройството.',
  'error.deviceUnsupported':
    'Мястото, където е запазен този пароключ, не може да даде на Passhold ключ, с който да се отвори. Опитайте отново и го запазете в Мениджъра на пароли на Google – или използвайте PIN код.',
  'error.deviceUnsupportedEdge':
    'Мястото, където е запазен този пароключ, не може да даде на Passhold ключ, с който да се отвори. Опитайте отново и го запазете другаде – или използвайте PIN код.',
  'error.deviceCancelled': 'Нищо не беше отключено: беше отменено или отне твърде дълго.',
  'error.keyUnsupported':
    'Този ключ не може да даде на Passhold нужното, за да се отвори. Повечето FIDO2 ключове могат; ключ, направен само за двуетапно влизане (U2F), не може.',
  'error.keyAlreadyAdded': 'Този ключ вече е настроен тук.',
  'error.keyGone': 'Този ключ за сигурност вече не е настроен тук. Отключете по друг начин.',
  'error.keyWrong': 'Този ключ не отвори Passhold. Отключете по друг начин, после премахнете ключа и го добавете отново.',
  'error.kdfUnsupported': 'Настройките на трезора не са такива, които Passhold приема.',
  'error.locked': 'Passhold е заключен.',
  'error.noVault': 'Още няма трезор.',
  'error.vaultExists': 'Трезорът вече съществува.',
  'error.notOnPage': 'Този вход не е за страницата в този раздел.',
  'error.expired': 'Това изтече. Опитайте отново.',
  'error.noFields': 'На тази страница няма нищо, което Passhold да попълни.',
  'error.cardInsecure': 'Passhold попълва карта само на сигурна (https) страница.',
  'error.unknown': 'Нещо се обърка: {detail}',
};
