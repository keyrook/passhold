import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'Keyrook द्वारा',

  // Common
  'common.cancel': 'रद्द करें',
  'common.close': 'बंद करें',
  'common.save': 'सहेजें',
  'common.edit': 'संपादित करें',
  'common.back': 'वापस',
  'common.show': 'दिखाएँ',
  'common.hide': 'छिपाएँ',
  'common.notNow': 'अभी नहीं',

  // Setup
  'setup.title': 'अपना वॉल्ट बनाएँ',
  'setup.body':
    'Passhold आपके पासवर्ड इस डिवाइस पर एन्क्रिप्ट करके रखता है। एक मास्टर पासवर्ड उन्हें खोलता है – ऐसा चुनें जो आपको याद रहे और जिसे आप कहीं और इस्तेमाल न करें।',
  'setup.password': 'मास्टर पासवर्ड',
  'setup.confirm': 'दोबारा लिखें',
  'setup.mismatch': 'दोनों पासवर्ड एक जैसे नहीं हैं।',
  'setup.tooShort': 'कम से कम {min} अक्षर इस्तेमाल करें।',
  'setup.understand':
    'मुझे पता है कि यह पासवर्ड भूल जाने पर कोई भी – न Passhold, न Keyrook – मेरा वॉल्ट वापस नहीं ला सकता।',
  'setup.create': 'वॉल्ट बनाएँ',
  'setup.creating': 'बनाया जा रहा है…',
  'setup.restore': 'बैकअप से पुनर्स्थापित करें',

  // Strength
  'setup.deviceBody':
    'Passhold आपके पासवर्ड इस डिवाइस पर एन्क्रिप्ट करके रखता है, और {method} उन्हें खोलता है – किसी मास्टर पासवर्ड को बनाने या याद रखने की ज़रूरत नहीं। आपको एक रिकवरी कुंजी भी मिलती है, उस दिन के लिए जब {method} काम न करे।',
  'setup.deviceWhereMac': 'जब Chrome पूछे कि पासकी कहाँ सहेजें, तो Google पासवर्ड मैनेजर चुनें।',
  'setup.deviceWhereMacEdge':
    'जब Edge पूछे कि पासकी कहाँ सहेजें, तो ऐसी जगह चुनें जो उसे आपके बाकी डिवाइसों पर भी रखे। हर जगह Passhold को अनलॉक नहीं कर सकती: अगर यह जगह न कर सके, तो Passhold यह बताएगा।',
  'setup.createWithDevice': '{method} से बनाएँ',
  'setup.usePassword': 'इसके बजाय मास्टर पासवर्ड इस्तेमाल करें',
  'setup.useDevice': 'इसके बजाय {method} इस्तेमाल करें',
  'setup.signIn': 'Keyrook खाते में साइन इन करें या एक बनाएँ',

  'welcome.title': 'आपके पासवर्ड, हर कंप्यूटर पर',
  'welcome.body':
    'एक बार साइन इन करें। Passhold आपकी उँगली की छाप से खुलता है, आपके लिए फ़ॉर्म भरता है, और आपके लॉगिन वहीं होते हैं जहाँ आप साइन इन करते हैं।',
  'welcome.email': 'ईमेल पता इस्तेमाल करें',
  'gate.touchTitle': 'एक स्पर्श से खोलें',
  'gate.touchBody': 'Touch ID या Windows Hello Passhold खोलता है। कोई मास्टर पासवर्ड बनाने या याद रखने की ज़रूरत नहीं।',
  'gate.everywhereTitle': 'हर उस कंप्यूटर पर जो आप इस्तेमाल करते हैं',
  'gate.everywhereBody': 'किसी और कंप्यूटर पर साइन इन करें, और आपके पासवर्ड और पासकी वहाँ होंगे।',
  'gate.privateTitle': 'सिर्फ़ आप इन्हें पढ़ सकते हैं',
  'gate.privateBody':
    'कुछ भी भेजे जाने से पहले इस कंप्यूटर पर एन्क्रिप्ट होता है। Keyrook आपके पासवर्ड नहीं पढ़ सकता, न ही यह कि वे किन साइटों के हैं।',
  'welcome.note':
    'पहले इस कंप्यूटर पर एन्क्रिप्ट: Keyrook आपके पासवर्ड नहीं पढ़ सकता, न ही यह कि वे किन साइटों के हैं।',
  'connect.title': 'अपना Keyrook खाता चालू करें',
  'connect.body': 'हर उस कंप्यूटर पर आपके लॉगिन जो आप इस्तेमाल करते हैं – और अगर यह कंप्यूटर खो जाए तो बैकअप।',
  'connect.email': 'ईमेल',
  'kitCheck.title': 'अपने खाते की रिकवरी कुंजी जाँचें',
  'kitCheck.body': 'इसे एक बार लिखें, ताकि ज़रूरत के दिन से पहले आपको पता हो कि यह आपके पास है।',
  'accountPasskey.button': 'पासकी से जारी रखें',
  'accountPasskey.working': 'पासकी का इंतज़ार है…',
  'accountPasskey.hint':
    'वह जो आपने account.keyrook.com पर जोड़ी थी। पहली बार {browser} पूछेगा कि क्या Passhold इसे इस्तेमाल कर सकता है।',
  'accountPasskey.openPasskeys': 'account.keyrook.com पर “Passkeys” खोलें',
  'join.title': 'Keyrook में साइन इन करें',
  'join.body': 'Passhold और Keyrook Authenticator के लिए एक Keyrook खाता। आपके लॉगिन खाते से इस ब्राउज़र में आते हैं।',
  'join.createTitle': 'Keyrook खाता बनाएँ',
  'join.createBody':
    'Passhold और Keyrook Authenticator के लिए एक खाता: आपके लॉगिन, पहले इस डिवाइस पर एन्क्रिप्ट किए हुए, हर उस कंप्यूटर पर जहाँ आप साइन इन करते हैं।',
  'join.lockTitle': '{email} के रूप में साइन इन',
  'join.lockBodyDevice':
    'आखिरी कदम: इस कंप्यूटर पर {method} से Passhold खुलेगा। सेट होते ही आपके लॉगिन आ जाएँगे।',
  'join.cancel': 'कोई और खाता इस्तेमाल करें',
  'join.lockBodyCode':
    'आखिरी कदम: एक कोड जो इस कंप्यूटर पर Passhold खोलेगा। सेट होते ही आपके लॉगिन आ जाएँगे।',
  'join.opening': 'Passhold खुल रहा है…',
  'setup.useAccountPassword': 'इसके बजाय मेरे खाते का पासवर्ड इस्तेमाल करें',
  'setup.useCode': 'इसके बजाय इस कंप्यूटर के लिए कोड इस्तेमाल करें',
  'security.accountPasswordTitle': 'आपके Keyrook खाते के पासवर्ड से खुलता है',
  'security.accountPasswordBody':
    'दोनों के लिए एक ही पासवर्ड। जब वह बदलता है, तो यहाँ का Passhold अगली बार साइन इन करने पर उसके साथ चलता है।',

  'recovery.title': 'अपनी रिकवरी कुंजी सहेजें',
  'recovery.body':
    'अगर यह डिवाइस खो जाए, या इसका अनलॉक काम करना बंद कर दे, तो यह कुंजी आपके वॉल्ट और उसके बैकअप तक वापस जाने का रास्ता है। जब तक Passhold खुलता है, आप इसे सेटिंग्स में फिर से देख सकते हैं – इसलिए इसे कहीं और भी रखें: छापकर, अपने फ़ोन में, या इस कंप्यूटर से दूर किसी फ़ाइल में।',
  'recovery.download': 'डाउनलोड करें',
  'recovery.copy': 'कॉपी करें',
  'recovery.copied': 'कॉपी हो गया',
  'recovery.print': 'प्रिंट करें',
  'recovery.qr': 'QR कोड दिखाएँ',
  'recovery.qrHide': 'QR कोड छिपाएँ',
  'recovery.qrLabel': 'रिकवरी कुंजी QR कोड के रूप में',
  'recovery.qrHint': 'अपने फ़ोन का कैमरा इस पर रखें और टेक्स्ट को एक नोट में सहेजें, या इसकी फ़ोटो लें।',
  'recovery.show': 'दिखाएँ',

  'kit.title': 'Passhold रिकवरी किट',
  'kit.made': '{date} को बनाया गया',
  'kit.keyLabel': 'रिकवरी कुंजी',
  'kit.whenTitle': 'जब Passhold न खुले',
  'kit.sameDevice':
    'इसी कंप्यूटर पर: जब Passhold अनलॉक करने को कहे, तो “इसके बजाय रिकवरी कुंजी इस्तेमाल करें” चुनें और कुंजी लिखें।',
  'kit.newDevice':
    'नए कंप्यूटर पर: Passhold इंस्टॉल करें, “बैकअप से पुनर्स्थापित करें” चुनें, अपनी सबसे नई बैकअप फ़ाइल चुनें और कुंजी लिखें। बैकअप के बिना पुनर्स्थापित करने को कुछ नहीं होता, इसलिए एक ज़रूर रखें।',
  'kit.keep':
    'यह शीट अपने कंप्यूटर से दूर, किसी सुरक्षित जगह रखें। जिसके पास यह और आपके वॉल्ट की एक कॉपी हो, वह वॉल्ट खोल सकता है।',
  'recovery.fileTitle': 'Passhold रिकवरी कुंजी',
  'recovery.fileMade': '{date} को बनाया गया',
  'recovery.fileBody':
    'यह कुंजी आपका Passhold वॉल्ट और उसके बैकअप तब खोलती है जब आपका डिवाइस न खोल पाए। जिसके पास यह और आपके वॉल्ट की एक कॉपी हो, वह उसे खोल सकता है, इसलिए इसे सुरक्षित रखें और उसी कंप्यूटर पर नहीं।',
  'recovery.pending': 'रिकवरी कुंजी सहेजी नहीं गई',
  'recovery.keptState': 'रिकवरी कुंजी सहेजी गई',
  'recovery.rowBody':
    'जब {method} न खोल पाए, तो आपका वॉल्ट और उसके बैकअप खोलती है। नई कुंजी पुरानी को इस वॉल्ट के लिए बंद कर देती है; पहले के बैकअप अब भी पुरानी से खुलते हैं।',
  'recovery.makeNew': 'नई बनाएँ',
  'recovery.savedIt': 'मैंने इसे सहेज लिया है',
  'recovery.checkTitle': 'जाँचें कि आपने इसे सहेजा है',
  'recovery.checkBody':
    'आपने जो सहेजा है – फ़ाइल, कागज़ या फ़ोटो – उसमें से कुंजी के दो भाग लिखें। भाग वे चार-चार अक्षरों के खंड हैं जो डैश के बीच होते हैं, बाएँ से गिनकर।',
  'recovery.group': 'भाग {position}',
  'recovery.check': 'जाँचें',
  'recovery.checkWrong':
    'आपकी कुंजी यह नहीं है। जो आपने सहेजा है उसे फिर से देखें, या कुंजी फिर से दिखाएँ और अभी सहेजें।',
  'recovery.showAgain': 'कुंजी फिर से दिखाएँ',
  'recovery.covered': 'आपका Keyrook खाता वापस जाने का रास्ता है',
  'recovery.coveredBody':
    'अगर {method} यहाँ Passhold खोलना बंद कर दे, तो वॉल्ट हटाएँ और अपने खाते में फिर से साइन इन करें: हर लॉगिन वापस आ जाएगा। इस वॉल्ट की अपनी रिकवरी कुंजी यहाँ अब भी देखी जा सकती है।',

  'proof.recoveryKey': 'रिकवरी कुंजी',
  'proof.withDevice': 'आप {method} से पुष्टि करेंगे।',
  'proof.useDevice': 'इसके बजाय {method} से पुष्टि करें',
  'proof.usePassword': 'इसके बजाय मास्टर पासवर्ड लिखें',
  'proof.useAccountPassword': 'इसके बजाय खाते का पासवर्ड लिखें',
  'proof.useCode': 'इसके बजाय कोड लिखें',
  'proof.useRecoveryKey': 'इसके बजाय रिकवरी कुंजी लिखें',
  'strength.0': 'बहुत कमज़ोर',
  'strength.1': 'कमज़ोर',
  'strength.2': 'ठीक-ठाक',
  'strength.3': 'मज़बूत',
  'strength.4': 'बहुत मज़बूत',
  'strength.short': 'लंबा मतलब ज़्यादा मज़बूत: 14 या उससे ज़्यादा अक्षरों का लक्ष्य रखें।',
  'strength.digitsOnly': 'सिर्फ़ अंक जल्दी अनुमान लगाए जा सकते हैं।',
  'strength.repeats': 'एक ही अक्षर बार-बार न लिखें।',

  // Unlock
  'unlock.title': 'Passhold लॉक है',
  'unlock.body': 'अपना मास्टर पासवर्ड दर्ज करें।',
  'unlock.password': 'मास्टर पासवर्ड',
  'unlock.submit': 'अनलॉक करें',
  'unlock.pinBody': 'अपना PIN दर्ज करें।',
  'unlock.pin': 'PIN',
  'unlock.usePassword': 'इसके बजाय मास्टर पासवर्ड इस्तेमाल करें',
  'unlock.usePin': 'इसके बजाय PIN इस्तेमाल करें',
  'unlock.recoveryBody': 'अपनी रिकवरी कुंजी दर्ज करें।',
  'unlock.deviceBody': '{method} इस्तेमाल करें, या नीचे लिखें।',
  'unlock.recoveryKey': 'रिकवरी कुंजी',
  'unlock.useRecoveryKey': 'इसके बजाय रिकवरी कुंजी इस्तेमाल करें',
  'unlock.lost': 'अंदर नहीं जा पा रहे?',
  'unlock.forgotBodyRecovery':
    'आपकी रिकवरी कुंजी डिवाइस न खोल पाने पर वॉल्ट खोलती है। उसके और डिवाइस के बिना, कोई भी – न Passhold, न Keyrook – वॉल्ट नहीं खोल सकता: आप उसे सेटिंग्स में हटाकर नए सिरे से शुरू कर सकते हैं।',
  'unlock.bodyAccount': 'अपने Keyrook खाते का पासवर्ड दर्ज करें।',
  'unlock.accountPassword': 'Keyrook खाते का पासवर्ड',
  'unlock.useAccountPassword': 'इसके बजाय खाते का पासवर्ड इस्तेमाल करें',
  'unlock.forgotBodyAccount':
    'यह आपके Keyrook खाते का पासवर्ड है: अगर वह कहीं और बदला गया है, तो नया इस्तेमाल करें। पूरी तरह भूल गए? सेटिंग्स में यह वॉल्ट हटाएँ और फिर से साइन इन करें – नया पासवर्ड चाहिए तो रिकवरी कुंजी से – तब हर लॉगिन वापस आ जाएगा।',
  'unlock.bodyCode': 'इस कंप्यूटर पर Passhold खोलने वाला कोड दर्ज करें।',
  'unlock.code': 'इस कंप्यूटर का कोड',
  'unlock.useCode': 'इसके बजाय कोड इस्तेमाल करें',
  'unlock.forgotBodyCode':
    'सेटिंग्स में यह वॉल्ट हटाएँ और Google या GitHub से फिर साइन इन करें: हर लॉगिन आपके खाते से वापस आ जाएगा।',
  'unlock.device': '{method} से अनलॉक करें',
  'unlock.key': 'सुरक्षा कुंजी से अनलॉक करें',
  'unlock.keyBody': 'अपनी सुरक्षा कुंजी लगाएँ, या नीचे लिखें।',
  'unlock.or': 'या',
  'unlock.unlocking': 'अनलॉक हो रहा है…',
  'unlock.forgot': 'भूल गए?',
  'unlock.forgotBody':
    'आपका मास्टर पासवर्ड इस वॉल्ट की एकमात्र चाबी है, और वह कहीं भी सहेजा नहीं जाता। उसके बिना वॉल्ट नहीं खोला जा सकता – आप उसे सेटिंग्स में हटाकर नए सिरे से शुरू कर सकते हैं।',

  // Vault
  'vault.search': 'खोजें',
  'vault.lock': 'लॉक करें',
  'vault.settings': 'सेटिंग्स',
  'vault.add': 'नया लॉगिन',
  'vault.onThisPage': '{site} पर',
  'vault.all': 'सभी लॉगिन',
  'vault.empty': 'अभी कोई लॉगिन नहीं है',
  'vault.emptyBody':
    'किसी साइट पर साइन इन करें और Passhold उसे सहेजने की पेशकश करेगा – या यहाँ एक जोड़ें, या अपने ब्राउज़र से आयात करें।',
  'vault.import': 'पासवर्ड आयात करें',
  'vault.noResults': '“{query}” से कुछ मेल नहीं खाता।',
  'vault.fill': 'भरें',
  'vault.copyUsername': 'यूज़रनेम कॉपी करें',
  'vault.copyPassword': 'पासवर्ड कॉपी करें',
  'vault.noUsername': 'कोई यूज़रनेम नहीं',
  'vault.count': { one: '{count} आइटम', other: '{count} आइटम' },
  'vault.everything': 'सभी आइटम',

  // Asking for a rating, once, after real use
  'rating.title': 'क्या Passhold आपके काम आ रहा है?',
  'rating.body': 'स्टोर में एक रेटिंग दूसरे लोगों को Passhold ढूँढने में मदद करती है।',
  'rating.rate': 'रेटिंग दें',
  'rating.later': 'अभी नहीं',

  // What a list shows, and what can be added
  'kinds.label': 'दिखाएँ',
  'kinds.all': 'सब',
  'kinds.logins': 'लॉगिन',
  'kinds.cards': 'कार्ड',
  'kinds.addresses': 'पते',
  'kinds.notes': 'नोट',
  'kinds.noLogins': 'अभी कोई लॉगिन नहीं है।',
  'kinds.noCards':
    'अभी कोई कार्ड नहीं है। ऊपर + से एक जोड़ें, और चेकआउट पर आपके चुनने पर Passhold उसे भर देता है।',
  'kinds.noAddresses':
    'अभी कोई पता नहीं है। ऊपर + से एक जोड़ें, और जहाँ फ़ॉर्म पता माँगे, वहाँ Passhold उसे भर देता है।',
  'kinds.noNotes':
    'अभी कोई नोट नहीं है। नोट में वह रहता है जो लॉगिन नहीं है – जैसे Wi-Fi पासवर्ड, लाइसेंस कुंजी – बाकी सब के साथ एन्क्रिप्ट करके।',
  'add.menu': 'जोड़ें',
  'add.login': 'लॉगिन',
  'add.card': 'कार्ड',
  'add.address': 'पता',
  'add.note': 'नोट',
  'place.label': 'वॉल्ट',
  'place.mine': 'मेरे',
  'place.of': '{vault}, {family} में साझा',
  'move.to': '{vault} में ले जाएँ',
  'move.confirm':
    '{family} में हर कोई इसे {vault} में देखेगा, और इसे बदल सकेगा। यह आपके अपने वॉल्ट से निकल जाएगा; इसके पहले के पासवर्ड पीछे रह जाएँगे।',
  'move.do': 'ले जाएँ',
  'family.unlockTitle': 'इस ब्राउज़र पर {family} का साझा वॉल्ट खोलें',
  'family.unlockBody':
    'Passhold को एक बार आपका Keyrook खाते का पासवर्ड चाहिए, ताकि इस ब्राउज़र पर आपकी कुंजी परिवार तक पहुँचे। यह कहीं भेजा नहीं जाता।',
  'family.unlockOnPage':
    'account.keyrook.com पर “Family” पेज खोलें, और वहाँ अपनी कुंजी Passhold को परिवार के लिए दें।',
  'family.password': 'Keyrook खाते का पासवर्ड',
  'family.unlock': 'खोलें',
  'family.openPage': '“Family” पेज खोलें',
  'family.keyChanged': '{family} में {who} की कुंजी बदल गई है',
  'family.newSender': '{family} की कुंजी {who} से आई, जिन्हें यह ब्राउज़र अभी नहीं जानता',
  'family.keyChangedBody':
    'जब तक आप दोनों एक कोड का मिलान नहीं करते, Passhold उनसे कुछ नहीं लेता। उन्हें फ़ोन करें या मिलें: वे account.keyrook.com के “Family” पेज पर आपके नाम के पास कोड मिलाना चुन सकते हैं।',
  'family.showCode': 'कोड दिखाएँ',
  'family.codeIs': 'आपका कोड',
  'family.match': 'कोड मेल खाते हैं',
  'family.differ': 'वे अलग हैं',
  'family.differed':
    'तो भरोसा न करें। अपने परिवार के आयोजक को बताएँ; तब तक Passhold उनसे कुछ नहीं लेता।',
  'family.someone': 'कोई',
  'family.waiting':
    '{family} का कोई आयोजक अभी आपकी पुष्टि नहीं कर सका है। एक बार वे पुष्टि कर दें, तो जो साझा होता है वह यहाँ खुलेगा।',
  'family.rotate':
    'कोई {family} छोड़ चुका है, और Passhold ने अभी उसकी सभी कुंजियाँ नहीं बदली हैं: उसके साझा वॉल्ट में जो बदला जाता है, वह इस ब्राउज़र पर रुका है। अगर ऐसा ही रहे, तो Family पेज पर उन्हें बदलें।',
  'family.rotateCompare':
    'कोई {family} छोड़ चुका है। ऊपर का कोड मिलाने के बाद Passhold सभी को नई कुंजियाँ देता है; तब तक उसके साझा वॉल्ट में जो बदला जाता है, वह इस ब्राउज़र पर रुका है।',
  'family.rotateWait':
    'कोई {family} छोड़ चुका है। उसके साझा वॉल्ट में आप जो बदलते हैं, वह इस ब्राउज़र पर रुका रहता है, जब तक किसी आयोजक का Passhold उसकी कुंजियाँ नहीं बदलता – जो वह सिंक होने पर करता है – ताकि जो व्यक्ति चला गया, वह उसे न पढ़ सके।',
  'family.left': '{who} अब {family} में नहीं है',
  'family.leftBody':
    'Passhold नहीं जान सकता कि वे क्यों गए। अगर आपको इसकी उम्मीद नहीं थी, तो उनसे या अपने परिवार के आयोजक से पूछें।',
  'family.title': 'परिवार',
  'family.description':
    'आपके परिवार में कौन है, और वह कौन से वॉल्ट साझा करता है। परिवार account.keyrook.com के “Family” पेज पर चलता है: आमंत्रित करना, किसी को हटाना, उसकी कुंजियाँ बदलना।',
  'family.none':
    'यह खाता किसी परिवार में नहीं है। परिवार account.keyrook.com के “Family” पेज पर बनते हैं।',
  'family.youOrganise': 'आप इसके आयोजक हैं।',
  'family.youMember': 'आप इसके सदस्य हैं।',
  'family.you': '(आप)',
  'family.organiser': 'आयोजक',
  'family.notCompared': 'कोड मिलाए बिना शामिल किया गया',
  'family.keyNew': 'उनकी कुंजी बदल गई है: कोड मिलाने तक उनसे कुछ नहीं लिया जाता',
  'family.membersLater': 'इसमें कौन है, यह यहाँ दिखेगा जब यह इस ब्राउज़र पर खुलेगा।',
  'family.sharedVaults': 'साझा वॉल्ट',
  'family.vaultWaits': 'इसमें जो बदला जाता है, वह आयोजक के कुंजी बदलने तक रुकता है',

  // Cards, addresses and notes
  'wallet.updated': '{date} को बदला गया',
  'wallet.copyField': '{field} कॉपी करें',
  'card.untitled': 'कार्ड',
  'card.newTitle': 'नया कार्ड',
  'card.editTitle': 'कार्ड संपादित करें',
  'card.titleHint': 'खाली छोड़ने पर इसका नाम कार्ड के नेटवर्क और आखिरी चार अंकों पर रखा जाता है।',
  'card.number': 'कार्ड नंबर',
  'card.numberCheck': 'यह नंबर सही नहीं बैठता: हर अंक जाँचें।',
  'card.holder': 'कार्ड पर नाम',
  'card.expiry': 'समाप्ति',
  'card.month': 'महीना',
  'card.year': 'साल',
  'card.code': 'सुरक्षा कोड',
  'card.empty': 'कार्ड नंबर या नाम दें।',
  'card.expired': 'यह कार्ड समाप्त हो चुका है।',
  'card.expiredOn': '{expiry} को समाप्त',
  'card.copyNumber': 'कार्ड नंबर कॉपी करें',
  'card.copyExpiry': 'समाप्ति तिथि कॉपी करें',
  'address.untitled': 'पता',
  'address.newTitle': 'नया पता',
  'address.editTitle': 'पता संपादित करें',
  'address.titleHint': 'घर, दफ़्तर… खाली छोड़ने पर इसका नाम उसमें दिए नाम पर रखा जाता है।',
  'address.name': 'पूरा नाम',
  'address.organization': 'कंपनी',
  'address.street': 'सड़क का पता',
  'address.city': 'शहर',
  'address.region': 'राज्य या प्रदेश',
  'address.postalCode': 'पिन कोड',
  'address.country': 'देश',
  'address.chooseCountry': 'देश चुनें',
  'address.phone': 'फ़ोन',
  'address.email': 'ईमेल',
  'address.address': 'पता',
  'address.empty': 'कोई नाम, या पते का कोई हिस्सा भरें।',
  'note.untitled': 'बिना शीर्षक का नोट',
  'note.newTitle': 'नया नोट',
  'note.editTitle': 'नोट संपादित करें',
  'note.title': 'शीर्षक',
  'note.text': 'नोट',
  'note.empty': 'कोई शीर्षक दें, या कुछ लिखें।',
  'note.edited': '{date} को संपादित',

  // Pending save, in the popup
  'pending.saveTitle': 'यह लॉगिन सहेजें?',
  'pending.updateTitle': 'पासवर्ड अपडेट करें?',
  'pending.lockedTitle': 'अभी इस्तेमाल किया गया लॉगिन सहेजें?',
  'pending.body': '{site} पर {username}',
  'pending.bodyNoUser': '{site} के लिए एक पासवर्ड',
  'pending.save': 'सहेजें',
  'pending.update': 'अपडेट करें',
  'pending.never': 'इस साइट के लिए कभी नहीं',

  // Item
  'item.username': 'यूज़रनेम',
  'item.password': 'पासवर्ड',
  'item.website': 'वेबसाइट',
  'item.websites': 'वेबसाइटें',
  'item.notes': 'नोट',
  'item.favorite': 'पसंदीदा',
  'item.unfavorite': 'पसंदीदा से हटाएँ',
  'item.addFavorite': 'पसंदीदा में जोड़ें',
  'item.trash': 'ट्रैश में ले जाएँ',
  'item.updated': 'पासवर्ड {date} को बदला गया',
  'item.history': 'पहले के पासवर्ड',
  'item.weak': 'यह पासवर्ड कमज़ोर है: इसका अनुमान लगाने में देर नहीं लगेगी।',
  'item.reused': {
    one: 'यही पासवर्ड {count} और लॉगिन में भी इस्तेमाल होता है। अगर एक साइट इसे लीक करती है, तो दोनों खुल जाते हैं।',
    other:
      'यही पासवर्ड {count} और लॉगिन में भी इस्तेमाल होता है। अगर एक साइट इसे लीक करती है, तो सभी खुल जाते हैं।',
  },
  'item.changePassword': 'साइट पर बदलें',
  'item.openSite': '{site} खोलें',
  'item.passkey': 'पासकी',
  'item.passkeyBody': '{site} के लिए, {date} को सहेजी गई',

  // Edit
  'edit.newTitle': 'नया लॉगिन',
  'edit.editTitle': 'लॉगिन संपादित करें',
  'edit.title': 'नाम',
  'edit.titleHint': 'खाली छोड़ने पर इसका नाम वेबसाइट पर रखा जाता है।',
  'edit.username': 'यूज़रनेम या ईमेल',
  'edit.password': 'पासवर्ड',
  'edit.generate': 'बनाएँ',
  'edit.websites': 'वेबसाइटें',
  'edit.websitesHint': 'हर लाइन पर एक। Passhold यह लॉगिन इन साइटों पर पेश करता है।',
  'edit.notes': 'नोट',
  'edit.empty': 'कोई नाम, यूज़रनेम या पासवर्ड दें।',

  // Fields of an item's own, and folders
  'fields.title': 'कस्टम फ़ील्ड',
  'fields.add': 'फ़ील्ड जोड़ें',
  'fields.name': 'फ़ील्ड का नाम',
  'fields.value': 'मान',
  'fields.hidden': 'पासवर्ड की तरह छिपाएँ',
  'fields.remove': 'यह फ़ील्ड हटाएँ',
  'fields.unnamed': 'फ़ील्ड',
  'fields.copy': '{name} कॉपी करें',
  'folders.label': 'फ़ोल्डर',
  'folders.placeholder': 'कोई फ़ोल्डर नहीं',
  'folders.choose': 'मौजूदा फ़ोल्डर',
  'folders.hint': 'चीज़ें एक साथ रखें – काम, परिवार, बैंक – और एक बार में एक फ़ोल्डर दिखाएँ।',
  'folders.all': 'सभी फ़ोल्डर',
  'folders.none': 'किसी फ़ोल्डर में नहीं',
  'folders.count': { one: '{count} आइटम', other: '{count} आइटम' },
  'folders.nothingHere': 'इस फ़ोल्डर में इस तरह की कोई चीज़ नहीं है।',
  'folders.rename': 'नाम बदलें',
  'folders.renameTo': 'फ़ोल्डर के लिए नया नाम',
  'folders.remove': 'फ़ोल्डर हटाएँ',
  'folders.removeHint': 'इसमें जो है वह रहेगा, बिना फ़ोल्डर के।',

  // Generator
  'generator.length': 'लंबाई',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'मिलते-जुलते अक्षर छोड़ें (I l 1 O 0)',
  'generator.again': 'दूसरा',
  'generator.use': 'यह पासवर्ड इस्तेमाल करें',
  'generator.bits': '{bits} बिट',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold लॉक है।',
  'menu.unlock': 'Passhold अनलॉक करें',
  'menu.unlockHint': 'अनलॉक करने के लिए टूलबार में Passhold पर क्लिक करें, फिर यहाँ वापस आएँ।',
  'menu.none': '{site} के लिए कोई सहेजा हुआ लॉगिन नहीं है।',
  'menu.uninitialized': 'पहले Passhold सेट करें: टूलबार में उस पर क्लिक करें।',
  'menu.suggest': 'मज़बूत पासवर्ड इस्तेमाल करें',
  'menu.suggestBody':
    'एक नया पासवर्ड, आपके लिए भरा हुआ। फ़ॉर्म भेजे जाने के बाद Passhold इसे सहेजने की पेशकश करता है।',
  'menu.fillFor': '{site} पर भरें',
  'menu.hidden': 'इस पेज पर कुछ Passhold को ढक रहा है, इसलिए वह नहीं भरेगा।',
  'menu.passkey': 'पासकी · {username}',
  'menu.noCards': 'Passhold में अभी कोई कार्ड नहीं है। टूलबार में Passhold से एक जोड़ें।',
  'menu.noAddresses': 'Passhold में अभी कोई पता नहीं है। टूलबार में Passhold से एक जोड़ें।',
  'menu.cardInsecure':
    'यह पेज सुरक्षित नहीं है (सादा http), इसलिए Passhold यहाँ कार्ड नहीं भरेगा: रास्ते में कोई भी उसे पढ़ सकता है।',

  // A website's passkey
  'passkey.saveTitle': '{site} के लिए पासकी सहेजें?',
  'passkey.save': 'पासकी सहेजें',
  'passkey.saveElsewhere': 'कहीं और सहेजें',
  'passkey.useElsewhere': 'कहीं और की पासकी इस्तेमाल करें',
  'passkey.existsTitle': 'यह पासकी Passhold में पहले से है',
  'passkey.ok': 'OK',
  'passkey.signInTitle': '{site} में साइन इन करें',
  'passkey.signInBody': 'Passhold में सहेजी पासकी से',
  'passkey.none': 'Passhold में {site} के लिए कोई पासकी नहीं है।',
  'passkey.hidden': 'इस पेज पर कुछ Passhold को ढक रहा है, इसलिए वह जवाब नहीं देगा।',

  // Save prompt on a page
  'prompt.save': 'Passhold में लॉगिन सहेजें?',
  'prompt.update': 'Passhold में पासवर्ड अपडेट करें?',
  'prompt.saveButton': 'सहेजें',
  'prompt.updateButton': 'अपडेट करें',
  'prompt.never': 'इस साइट के लिए कभी नहीं',
  'prompt.saved': 'Passhold में सहेजा गया।',
  'prompt.locked': 'टूलबार में Passhold पर क्लिक करके अनलॉक करें – वहाँ वह सहेजने के लिए पूछेगा।',
  'prompt.saveCard': 'Passhold में कार्ड सहेजें?',
  'prompt.updateCard': 'Passhold में कार्ड अपडेट करें?',
  'prompt.saveAddress': 'Passhold में पता सहेजें?',
  'prompt.saveCheckout': 'Passhold में कार्ड और पता सहेजें?',

  // Settings
  'settings.title': 'सेटिंग्स',
  'settings.cannotOpen': 'बिल्कुल नहीं खुल रहा? इस ब्राउज़र से वॉल्ट हटाएँ',
  'settings.encryptedHere': 'इस डिवाइस पर एन्क्रिप्टेड',
  'settings.source': 'GitHub पर सोर्स कोड',

  'nav.passwords': 'पासवर्ड',
  'nav.accountSync': 'खाता और सिंक',
  'nav.family': 'परिवार',
  'nav.account': 'Keyrook खाता',
  'nav.backup': 'बैकअप और आयात',
  'nav.security': 'सुरक्षा',
  'nav.general': 'सामान्य',
  'nav.needsAttention': 'ध्यान देने की ज़रूरत है',


  'account.description':
    'साइन इन करें, और आपके लॉगिन हर उस ब्राउज़र तक आपके साथ जाते हैं जहाँ आप Passhold में साइन इन करते हैं। वे पहले इस डिवाइस पर एन्क्रिप्ट होते हैं: Keyrook का सर्वर उन्हें नहीं पढ़ सकता, न ही यह कि वे किन साइटों के हैं।',
  'account.email': 'ईमेल',
  'account.password': 'Keyrook खाते का पासवर्ड',
  'account.signIn': 'साइन इन करें',
  'account.signingIn': 'साइन इन हो रहा है…',
  'account.note':
    'वही खाता जो Keyrook Authenticator में है। Google या GitHub से बना खाता अपने बटन से साइन इन करता है।',
  'account.haveOne': 'मेरा खाता है',
  'account.create': 'खाता बनाएँ',
  'account.sendCode': 'मुझे ईमेल से कोड भेजें',
  'account.createNote':
    'यह पता आपका है, यह साबित करने के लिए Keyrook ईमेल पर छह अंकों का कोड भेजता है। अगर पते का खाता पहले से है, तो ईमेल यह बताएगा: उससे साइन इन करें।',
  'account.codeSent': '{email} पर एक कोड भेजा गया है। यह पंद्रह मिनट तक काम करेगा।',
  'account.code': 'छह अंकों का कोड',
  'account.newPassword': 'Keyrook खाते का पासवर्ड',
  'account.passwordNote':
    'यह पासवर्ड किसी भी ब्राउज़र में आपका Keyrook खाता खोलता है, Passhold और Keyrook Authenticator दोनों के लिए। Keyrook इसे कभी नहीं देखता और आपके लिए रीसेट नहीं कर सकता; इसके बाद मिलने वाली रिकवरी कुंजी नया पासवर्ड सेट करने का तरीका है।',
  'account.createButton': 'खाता बनाएँ',
  'account.creating': 'बनाया जा रहा है…',
  'account.otherEmail': 'कोई और पता इस्तेमाल करें',
  'account.signedInAs': '{email} के रूप में साइन इन',
  'account.signedInAsNamed': '{name} ({email}) के रूप में साइन इन',
  'account.synced': '{date} को सिंक हुआ',
  'account.notSynced': 'अभी सिंक नहीं हुआ',
  'account.syncNow': 'अभी सिंक करें',

  // The account, at the foot of the popup
  'accountBar.synced': '{time} सिंक हुआ',
  'accountBar.justNow': 'अभी-अभी',
  'accountBar.syncing': 'सिंक हो रहा है…',
  'accountBar.signedOut': 'साइन आउट – सिंक के लिए फिर से साइन इन करें',
  'accountBar.startedOver': 'खाता नए सिरे से शुरू हुआ – फिर से साइन इन करें',
  'accountBar.removed': 'खाते से हटाया गया – सिंक के लिए फिर से साइन इन करें',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'आपके Keyrook खाते से हटाया गया',
  'removed.body':
    '{date} को यह ब्राउज़र आपके Keyrook खाते से हटा दिया गया, इसलिए Passhold ने खाते के लॉगिन, कार्ड, पते और नोट इससे हटा दिए और इसे साइन आउट कर दिया। यहाँ जोड़े या बदले गए और कभी न भेजे गए आइटम इस ब्राउज़र के अपने बने रहे। बाकी वापस लाने के लिए फिर से साइन इन करें।',

  // Passwords, in Settings
  'passwords.description':
    'Passhold में हर लॉगिन, पासकी, कार्ड, पता और नोट। किसी एक को चुनकर उसे देखें, उससे कॉपी करें या उसे बदलें।',
  'passwords.all': 'सभी',
  'passwords.attention': 'ध्यान देने की ज़रूरत है',
  'passwords.weak': 'कमज़ोर',
  'passwords.reused': 'दोबारा इस्तेमाल',
  'account.syncDone': 'सिंक हो गया।',
  'account.removed': {
    one: 'दूसरे डिवाइस पर हमेशा के लिए मिटाया गया {count} आइटम यहाँ से हटा दिया गया।',
    other: 'दूसरे डिवाइस पर हमेशा के लिए मिटाए गए {count} आइटम यहाँ से हटा दिए गए।',
  },
  'account.skipped': {
    one: '{count} रिकॉर्ड नहीं खुला और उसे छोड़ दिया गया।',
    other: '{count} रिकॉर्ड नहीं खुले और उन्हें छोड़ दिया गया।',
  },
  'account.manage': 'अपना Keyrook खाता प्रबंधित करें',
  'account.manageBody':
    'account.keyrook.com पर पासवर्ड बदलें, नई रिकवरी कुंजी बनाएँ या खाता नए सिरे से शुरू करें – Passhold और Keyrook Authenticator दोनों के लिए।',
  'account.manageBodyProvider':
    'account.keyrook.com पर नई रिकवरी कुंजी बनाएँ या खाता नए सिरे से शुरू करें – Passhold और Keyrook Authenticator दोनों के लिए।',
  'account.manageOpen': 'खोलें',
  'account.signOut': 'साइन आउट',
  'account.signOutBody':
    'आखिरी सिंक के बाद इस ब्राउज़र से हर लॉगिन हटा देता है। फिर से साइन इन करें, और वे वापस आ जाते हैं।',
  'account.signOutConfirm':
    'Passhold एक बार और सिंक करता है, फिर इस ब्राउज़र से वॉल्ट हटाता है। अगर कोई लॉगिन आपके खाते तक नहीं पहुँचा है, तो कुछ भी नहीं हटता।',
  'account.signOutButton': 'साइन आउट करें और हटाएँ',
  'account.signedOutByServer': 'Keyrook ने इस ब्राउज़र को साइन आउट कर दिया है। सिंक जारी रखने के लिए फिर से साइन इन करें।',
  'account.startedOver':
    'आपका Keyrook खाता {date} को नए सिरे से शुरू हुआ, इसलिए Keyrook ने इस ब्राउज़र को साइन आउट कर दिया। उसके नए पासवर्ड से साइन इन करें: यहाँ के लॉगिन खाते की नई कुंजियों के तहत अपलोड होंगे।',
  'account.startedOverProvider':
    'आपका Keyrook खाता {date} को नए सिरे से शुरू हुआ, इसलिए Keyrook ने इस ब्राउज़र को साइन आउट कर दिया। Google या GitHub से साइन इन करें: यहाँ के लॉगिन खाते की नई कुंजियों के तहत अपलोड होंगे।',
  'account.forgot': 'पासवर्ड भूल गए?',
  'account.recoverBody':
    'Keyrook खाते के पते पर एक कोड ईमेल करता है; फिर उसे लिखें, खाता बनाते समय सहेजी शीट से खाते की रिकवरी कुंजी, और एक नया पासवर्ड। खाते से साइन इन हर दूसरा ब्राउज़र और ऐप नए पासवर्ड के लिए पूछेगा।',
  'account.recoveryKey': 'खाते की रिकवरी कुंजी',
  'account.recoverPassword': 'नया खाता पासवर्ड',
  'account.recoverButton': 'नया पासवर्ड सेट करें',
  'account.recovering': 'सेट हो रहा है…',
  'account.backToSignIn': 'साइन इन पर वापस',
  'startOver.link': 'रिकवरी कुंजी भी खो गई? खाता नए सिरे से शुरू करें',
  'startOver.title': 'खाता नए सिरे से शुरू करें',
  'needsRoot.body':
    'अगर आपके पास Keyrook Authenticator की दी हुई खाते की रिकवरी कुंजी है, तो उसे लिखें: तब वह Passhold को भी खोलती है। उसके बिना, Passhold खाते के लिए एक नई रिकवरी कुंजी बनाता है, जो एक बार दिखती है, और पुरानी काम करना बंद कर देती है।',
  'needsRoot.sheet': 'Keyrook Authenticator से खाते की रिकवरी कुंजी (अगर आपके पास है)',
  'needsRoot.withSheet': 'यह कुंजी इस्तेमाल करें',
  'needsRoot.newSheet': 'नई रिकवरी कुंजी बनाएँ',
  'startOver.body':
    'जब सिर्फ़ ईमेल पता बचा हो, तो खाता नई कुंजियों और नई रिकवरी कुंजी के साथ नए सिरे से शुरू हो सकता है। आपके माँगने के एक हफ़्ते बाद यह लागू होता है, और तब तक खाते में साइन इन कोई भी ब्राउज़र इसे रद्द कर सकता है – इसलिए सिर्फ़ आपका ईमेल रखने वाला कोई इसे नहीं ले सकता। खाते में जो था, वह Keyrook 90 दिनों तक सुरक्षित रखता है, अब भी एन्क्रिप्टेड: पुराना पासवर्ड या पुरानी रिकवरी कुंजी उसे वापस लाती है।',
  'startOver.button': 'नए सिरे से शुरू करें',
  'startOver.working': 'खाता नए सिरे से शुरू हो रहा है…',
  'startOver.kitBody':
    'खाते की नई रिकवरी कुंजी: यह खाते के नए सिरे से शुरू होने के बाद काम करती है। Passhold इसे सिर्फ़ अभी दिखाता है, इसलिए आगे बढ़ने से पहले इसे सहेज लें।',
  'startOver.waitTitle': 'आपका खाता {date} को नए सिरे से शुरू होगा',
  'startOver.waitBody':
    'तब तक कुछ नहीं बदलता, और खाते में साइन इन कोई भी ब्राउज़र इसे रद्द कर सकता है। Keyrook अभी {email} पर ईमेल करता है, एक दिन पहले, और जब यह होता है।',
  'startOver.waitThen':
    'उसके बाद, अपने नए पासवर्ड से यहाँ साइन इन करें। इस ब्राउज़र के लॉगिन खाते की नई कुंजियों के तहत अपलोड होंगे, और उसमें जो पहले था वह 90 दिनों तक रखा जाता है।',
  'startOver.waitThenProvider':
    'उसके बाद, पहले की तरह Google या GitHub से यहाँ साइन इन करें। इस ब्राउज़र के लॉगिन खाते की नई कुंजियों के तहत अपलोड होंगे, और उसमें जो पहले था वह 90 दिनों तक रखा जाता है।',
  'startOver.understood': 'समझ गया',
  'startOver.doneTitle': 'आपका खाता नए सिरे से शुरू हो गया है',
  'startOver.doneBody':
    'अपने नए पासवर्ड से साइन इन करें: इस ब्राउज़र के लॉगिन खाते की नई कुंजियों के तहत अपलोड होंगे, और उसमें जो पहले था वह 90 दिनों तक रखा जाता है।',
  'startOver.doneBodyProvider':
    'पहले की तरह Google या GitHub से साइन इन करें: इस ब्राउज़र के लॉगिन खाते की नई कुंजियों के तहत अपलोड होंगे, और उसमें जो पहले था वह 90 दिनों तक रखा जाता है।',
  'startOverWait.title': 'आपका Keyrook खाता {date} को नए सिरे से शुरू होगा',
  'startOverWait.body':
    'यह Keyrook के ईमेल किए कोड के साथ माँगा गया था, “{device}” नाम के डिवाइस से। अगर यह आपने नहीं किया, तो कोई आपका ईमेल पढ़ सकता है: इसे अभी रद्द करें, फिर अपना ईमेल पासवर्ड बदलें। अगर यह आपने किया था, तो इसे रहने दें।',
  'startOverWait.bodyNoName':
    'यह Keyrook के ईमेल किए कोड के साथ माँगा गया था। अगर यह आपने नहीं किया, तो कोई आपका ईमेल पढ़ सकता है: इसे अभी रद्द करें, फिर अपना ईमेल पासवर्ड बदलें। अगर यह आपने किया था, तो इसे रहने दें।',
  'startOverWait.cancel': 'नए सिरे से शुरू करना रद्द करें',
  'kept.title': {
    one: 'खाता नए सिरे से शुरू होने से पहले सहेजा गया: {count} आइटम',
    other: 'खाता नए सिरे से शुरू होने से पहले सहेजा गया: {count} आइटम',
  },
  'kept.body': '{date} तक। पुराना खाता पासवर्ड या पुरानी रिकवरी कुंजी उन्हें Passhold में वापस लाती है।',
  'kept.open': 'वापस लाएँ',
  'kept.secret': 'पुराना खाता पासवर्ड या पुरानी रिकवरी कुंजी',
  'kept.done': { one: '{count} आइटम वापस लाया गया।', other: '{count} आइटम वापस लाए गए।' },
  'kept.nothingNew': 'जो सहेजा गया था, वह पहले से यहाँ है।',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': '{provider} से जारी रखें',
  'provider.passwordTitle': 'इस Keyrook खाते में एक पासवर्ड है',
  'provider.passwordBody':
    'आपने {email} के रूप में {provider} से साइन इन किया। खाते का पासवर्ड ही यहाँ Passhold खोलता है: उसे एक बार लिखें।',
  'provider.openAccountPage': 'account.keyrook.com खोलें',
  'secondStep.title': 'दो-चरण साइन इन',
  'secondStep.body':
    'Keyrook के लिए आपका ऑथेंटिकेटर ऐप जो 6 अंकों का कोड दिखाता है, वह दर्ज करें। ऐप खो गया? उसके बजाय अपने खाते की रिकवरी कुंजी लिखें।',
  'secondStep.ownerBody':
    'आपका खाता इसके लिए भी दूसरा चरण माँगता है: आपके ऑथेंटिकेटर ऐप का कोड, या आपके खाते की रिकवरी कुंजी।',
  'secondStep.field': 'कोड, या रिकवरी कुंजी',
  'secondStep.continue': 'जारी रखें',
  'secondStep.passkey': 'इसके बजाय पासकी इस्तेमाल करें',
  'secondStep.nextBody':
    'खाते को उसकी कुंजी देने के लिए भी कोड माँगा जाता है, और हर कोड सिर्फ़ एक बार चलता है। इंतज़ार करें जब तक आपका ऑथेंटिकेटर ऐप नया कोड दिखाए, फिर उसे दर्ज करें – या अपने खाते की रिकवरी कुंजी।',
  'provider.or': 'या',
  'provider.signedInWith': '{email} के रूप में {provider} से साइन इन',
  'provider.signedInWithNamed': '{name} ({email}) के रूप में {provider} से साइन इन',
  'provider.newTitle': 'अपना Keyrook खाता बनाएँ',
  'provider.newBody':
    'आप {email} के रूप में {provider} से साइन इन कर रहे हैं। खाते में पासवर्ड नहीं है: {provider} आपको साइन इन करता है। किसी दूसरे कंप्यूटर पर, पहले से साइन इन ब्राउज़र आपको अंदर आने देता है – या अगली बार मिलने वाली रिकवरी कुंजी आने देती है।',
  'provider.joinTitle': 'इस ब्राउज़र को अंदर आने दें',
  'provider.joinBody':
    '{email} यहाँ साइन इन है, लेकिन जो कुंजी आपके लॉगिन खोलती है वह आपके दूसरे कंप्यूटरों पर है। उनमें से किसी एक पर Passhold खोलें – सेटिंग्स, खाता और सिंक – और इस ब्राउज़र को अंदर आने दें।',
  'provider.waiting': 'दूसरे ब्राउज़र का इंतज़ार है…',
  'provider.compare': 'दूसरा ब्राउज़र एक कोड दिखाता है। उसे वहाँ तभी अंदर आने दें अगर वह यही है:',
  'provider.ended': 'दूसरे ब्राउज़र के इसे अंदर आने देने से पहले यह अनुरोध खत्म हो गया।',
  'provider.askAgain': 'फिर पूछें',
  'provider.useKit': 'इसके बजाय रिकवरी कुंजी इस्तेमाल करें',
  'provider.useThisKey': 'यह कुंजी इस्तेमाल करें',
  'provider.needsRoot':
    '{email} Keyrook Authenticator में बना था, उससे पहले जब हर Keyrook ऐप की अपनी कुंजी नहीं थी। Passhold अब उसे एक दे सकता है, एक बार आप {provider} से फिर पुष्टि करें; Authenticator में कुछ नहीं बदलता।',
  'provider.confirmWith': '{provider} से पुष्टि करें',
  'provider.noKeyYet':
    'Passhold अभी तक {email} में कहीं साइन इन नहीं हुआ है, इसलिए कोई दूसरा ब्राउज़र इसे अंदर नहीं आने दे सकता। खाते की रिकवरी कुंजी इसे खोलती है।',
  'passkey.onLabel': 'नए कंप्यूटर आपकी पासकी से खुलते हैं',
  'passkey.offLabel': 'नए कंप्यूटरों के लिए कोई पासकी नहीं',
  'passkey.body':
    'नए कंप्यूटर पर: {provider}, फिर आपकी पासकी – और हर लॉगिन वहाँ है। Google पासवर्ड मैनेजर में रखी पासकी हर उस Chrome पर होती है जहाँ आप साइन इन करते हैं।',
  'passkey.bodyEdge':
    'नए कंप्यूटर पर: {provider}, फिर आपकी पासकी – और हर लॉगिन वहाँ है। जहाँ यह सिंक होती है वहाँ सहेजी गई पासकी आपके दूसरे डिवाइसों पर भी होती है।',
  'passkey.turnOn': 'चालू करें',
  'passkey.turnOff': 'बंद करें',
  'passkey.joinTitle': 'अपनी पासकी से खोलें',
  'passkey.joinBody': '{email} के पास नए कंप्यूटरों के लिए एक पासकी है। उससे पुष्टि करें, और आपके लॉगिन नीचे आ जाएँगे।',
  'passkey.use': 'पासकी इस्तेमाल करें',
  'passkey.otherWays': 'अंदर जाने के दूसरे तरीके',
  'pairing.asking': '{device} आपके खाते में आने के लिए पूछ रहा है।',
  'pairing.start': 'अंदर आने दें…',
  'pairing.notMe': 'मैं नहीं',
  'pairing.compare': 'नए ब्राउज़र पर यही कोड दिखे तभी उसे अंदर आने दें:',
  'pairing.match': 'कोड मेल खाते हैं – अंदर आने दें',
  'pairing.differ': 'कोड अलग हैं',

  'accountKit.title': 'खाते की रिकवरी कुंजी सहेजें',
  'accountKit.body':
    'अगर आप अपना Keyrook खाता पासवर्ड भूल जाते हैं, तो यह कुंजी एक नया सेट करती है – Passhold और Keyrook Authenticator दोनों के लिए। Keyrook आपका पासवर्ड कभी नहीं देखता, इसलिए यही एकमात्र तरीका है। आप इसे सेटिंग्स में फिर से देख सकते हैं; इसे कहीं और भी रखें।',
  'accountKit.fileTitle': 'Keyrook खाते की रिकवरी कुंजी',
  'accountKit.fileBody':
    'अगर आप अपना Keyrook खाता पासवर्ड भूल जाते हैं, तो यह कुंजी एक नया सेट करती है: Passhold में, सेटिंग्स → खाता और सिंक → “पासवर्ड भूल गए?”. जिसके पास यह और आपका ईमेल पता हो, वह भी यही कर सकता है, इसलिए इसे सुरक्षित रखें और इस कंप्यूटर पर नहीं।',
  'accountKit.bodyNoPassword':
    'आपके खाते में पासवर्ड नहीं है: पहले से साइन इन ब्राउज़र नई कुंजी अंदर आने देता है। अगर कोई न बचा हो, तो यह कुंजी यह काम करती है – Passhold और Keyrook Authenticator दोनों के लिए। आप इसे सेटिंग्स में फिर से देख सकते हैं; इसे कहीं और भी रखें।',
  'accountKit.fileBodyNoPassword':
    'अगर आपके Keyrook खाते में कोई कंप्यूटर साइन इन नहीं बचा है, तो यह कुंजी नए को अंदर आने देती है: Google या GitHub से साइन इन करें, फिर “इसके बजाय रिकवरी कुंजी इस्तेमाल करें” चुनें। जिसके पास यह हो और जो आपके रूप में साइन इन कर सके, वह भी यही कर सकता है, इसलिए इसे सुरक्षित रखें और इस कंप्यूटर पर नहीं।',
  'accountKit.whenTitleNoPassword': 'जब कोई कंप्यूटर साइन इन न बचा हो',
  'accountKit.inPassholdNoPassword':
    'Passhold में: Google या GitHub से साइन इन करें, “इसके बजाय रिकवरी कुंजी इस्तेमाल करें” चुनें, और यह कुंजी लिखें।',
  'accountKit.keepNoPassword':
    'यह शीट अपने कंप्यूटर से दूर, किसी सुरक्षित जगह रखें। इसके साथ, जो कोई आपके Google या GitHub खाते में साइन इन कर सके, वह आपका Keyrook खाता खोल सकता है।',
  'accountKit.rowBodyNoPassword': 'जब कोई और न बचा हो, तो नए कंप्यूटर को अंदर आने देता है।',
  'accountKit.sheetTitle': 'Keyrook खाते की रिकवरी किट',
  'accountKit.whenTitle': 'जब खाते का पासवर्ड भूल जाएँ',
  'accountKit.inPasshold':
    'Passhold में: सेटिंग्स → खाता और सिंक → “पासवर्ड भूल गए?”, फिर आपका ईमेल पता, Keyrook का भेजा कोड, यह कुंजी, और एक नया पासवर्ड।',
  'accountKit.inAuthenticator': 'Keyrook Authenticator भी यही कुंजी लेता है: जहाँ साइन इन माँगता है, वहाँ “पासवर्ड भूल गए?”।',
  'accountKit.keep':
    'यह शीट अपने कंप्यूटर से दूर, किसी सुरक्षित जगह रखें। जिसके पास यह और आपका ईमेल इनबॉक्स हो, वह खाते का नया पासवर्ड सेट कर सकता है।',
  'accountKit.pending': 'खाते की रिकवरी कुंजी सहेजी नहीं गई',
  'accountKit.keptState': 'खाते की रिकवरी कुंजी सहेजी गई',
  'accountKit.elsewhere': 'खाते की रिकवरी कुंजी कहीं और बनाई गई',
  'accountKit.none': 'खाते की कोई रिकवरी कुंजी नहीं',
  'accountKit.rowBody': 'भूल जाने पर खाते का नया पासवर्ड सेट करती है। नई कुंजी पुरानी को हर ऐप में काम करना बंद कर देती है।',
  'accountKit.elsewhereBody':
    'account.keyrook.com पर, Keyrook Authenticator में या किसी दूसरे ब्राउज़र में बनी: उसकी कुंजी तब सहेजी शीट पर है। यहाँ एक बनाने से वह काम करना बंद कर देती है।',
  'accountKit.noneBody':
    'एक के बिना, भूला हुआ खाता पासवर्ड रीसेट नहीं हो सकता, और Keyrook पर जो रखा है वह खोला नहीं जा सकता। इस ब्राउज़र के लॉगिन दोनों तरह से बने रहते हैं।',
  'accountKit.make': 'एक बनाएँ',
  'accountKit.apart':
    'इसे अपने ईमेल से अलग रखें: जिसके पास यह कुंजी हो और जो आपका ईमेल पढ़ सके, वह नया पासवर्ड सेट कर सकता है और आपके लॉगिन खोल सकता है। इसे खुद को ईमेल न करें, और उस ईमेल की क्लाउड ड्राइव में न रखें।',
  'accountKit.apartNoPassword':
    'इसे उस Google या GitHub खाते से अलग रखें जिससे आप साइन इन करते हैं: जिसके पास यह कुंजी हो और जो वहाँ आपके रूप में साइन इन कर सके, वह आपके लॉगिन खोल सकता है। इसे खुद को ईमेल न करें, और उस खाते की क्लाउड ड्राइव में न रखें।',
  'accountKit.unchecked': 'खाते की रिकवरी कुंजी अभी जाँची नहीं गई',
  'accountKit.uncheckedBody':
    'आपके खाते में एक रिकवरी कुंजी है, जो account.keyrook.com पर या किसी और ऐप में बनी है। उसे एक बार लिखें: Passhold जाँचता है कि वह आपका खाता खोलती है, और उसे आपको फिर से दिखाने के लिए रखता है।',
  'accountKit.typeIt': 'लिखें',
  'accountKit.checked': 'यह आपका खाता खोलती है। Passhold इसे अब यहाँ फिर से दिखाने के लिए रखता है।',
  'accountKit.draftBody':
    'आपके खाते की नई रिकवरी कुंजी। यह अभी काम नहीं करती: आपके इसे सहेजकर वापस लिखने के बाद आपका खाता पासवर्ड इसे सेट करता है, और पुरानी कुंजी काम करना बंद कर देती है।',
  'accountKit.setTitle': 'अपनी नई रिकवरी कुंजी सेट करें',
  'accountKit.setBody': 'अपना Keyrook खाता पासवर्ड लिखें। तब तक आपकी पुरानी रिकवरी कुंजी काम करती है, यह नई नहीं।',
  'accountKit.set': 'सेट करें',
  'checkup.clear': 'ठीक करने को कुछ नहीं',
  'checkup.clearBody': 'कोई कमज़ोर या दोबारा इस्तेमाल हो रहा पासवर्ड नहीं है, और आपका बैकअप अद्यतन है।',
  'checkup.issues': { one: '{count} चीज़ देखने लायक', other: '{count} चीज़ें देखने लायक' },
  'checkup.issuesBody': 'नीचे हर एक बताता है कि यह क्यों ज़रूरी है और इसे कैसे ठीक करें।',
  'checkup.backup': 'बैकअप',
  'checkup.access': 'अंदर आना',
  'checkup.recoveryPending':
    'इस वॉल्ट के लिए बनी रिकवरी कुंजी को कभी सहेजी गई के रूप में पुष्टि नहीं मिली, और {method} काम करना बंद करे तो यही अंदर जाने का एकमात्र रास्ता है। नई बनाएँ, और उसे संभालकर रखें।',
  'checkup.deviceMissing':
    'इस वॉल्ट में मास्टर पासवर्ड नहीं है, इसलिए यहाँ {method} के बिना हर अनलॉक रिकवरी कुंजी माँगता है।',
  'checkup.lastBackup': 'आखिरी बैकअप {date}',
  'checkup.backupNever':
    'अगर यह ब्राउज़र खो गया, तो आपके लॉगिन भी खो जाएँगे। बैकअप एक एन्क्रिप्टेड फ़ाइल है, जिसे कहीं और रखें।',
  'checkup.backupDue': 'उसके बाद से आपका वॉल्ट बदल गया है। नया बनाएँ ताकि उसमें सब कुछ हो।',
  'checkup.backUp': 'अभी बैकअप लें',
  'checkup.weak': { one: '{count} कमज़ोर पासवर्ड', other: '{count} कमज़ोर पासवर्ड' },
  'checkup.weakBody':
    'छोटा या इतना आसान कि अनुमान लगाया जा सके। हर एक को उसकी साइट पर बदलें; Passhold फ़ॉर्म में एक मज़बूत सुझाता है और उसे सहेजने की पेशकश करता है।',
  'checkup.weakNone': 'कोई नहीं।',
  'checkup.reused': {
    one: '{count} पासवर्ड एक से ज़्यादा बार इस्तेमाल हुआ',
    other: '{count} पासवर्ड एक से ज़्यादा बार इस्तेमाल हुए',
  },
  'checkup.reusedBody':
    'जब एक साइट पासवर्ड लीक करती है, तो लोग उसे हर जगह आज़माते हैं। हर लॉगिन को उसका अपना दें।',
  'checkup.reusedNone': 'कोई नहीं: हर लॉगिन का अपना पासवर्ड है।',
  'checkup.sharedBy': { one: '{count} लॉगिन के साथ साझा', other: '{count} लॉगिन के साथ साझा' },
  'checkup.change': 'बदलें',
  'checkup.limits':
    'Passhold यह नहीं जाँचता कि कोई पासवर्ड डेटा लीक में आया है या नहीं: उसके लिए एक सर्वर से पूछना पड़ेगा, और Passhold किसी से नहीं पूछता। यह पुराने पासवर्ड के बारे में भी टोकता नहीं – एक मज़बूत, अनोखा पासवर्ड घिसता नहीं।',

  'backup.description': 'एन्क्रिप्टेड कॉपी रखें, एक वापस लाएँ, या लॉगिन अंदर-बाहर ले जाएँ।',
  'backup.backupRow': 'आपका पूरा वॉल्ट एक एन्क्रिप्टेड फ़ाइल में, आपके मास्टर पासवर्ड के तहत।',
  'backup.restoreRow': 'बैकअप फ़ाइल के लॉगिन इस वॉल्ट में जोड़ें।',
  'backup.importRow': 'किसी और ब्राउज़र या पासवर्ड मैनेजर से, CSV फ़ाइल के रूप में, या Bitwarden की JSON।',
  'backup.exportRow': 'एक CSV फ़ाइल जिसे दूसरे ऐप पढ़ सकें। एन्क्रिप्टेड नहीं।',

  'security.description': 'Passhold कैसे खुलता है, और कब फिर बंद होता है।',
  'security.locking': 'लॉक करना',
  'security.opensTitle': 'Passhold कैसे खुलता है',
  'security.opensBody': 'कोई मास्टर पासवर्ड नहीं: {method} इसे खोलता है, और {method} न खोल पाए तो रिकवरी कुंजी।',
  'security.setPassword': 'इसके बजाय मास्टर पासवर्ड इस्तेमाल करें',
  'security.setPasswordBody':
    'फिर Passhold आपके चुने पासवर्ड से खुलता है, और रिकवरी कुंजी उसे खोलना बंद कर देती है।',
  'security.setPasswordOpen': 'सेट करें',
  'security.setPasswordSave': 'यह पासवर्ड इस्तेमाल करें',
  'security.dropPassword': 'मास्टर पासवर्ड का इस्तेमाल बंद करें',
  'security.dropPasswordBody':
    'सिर्फ़ {method} से खोलें, और उस दिन के लिए रिकवरी कुंजी रखें जब वह न खोल पाए। मास्टर पासवर्ड वॉल्ट खोलना बंद कर देता है।',
  'security.dropPasswordOpen': 'बदलें',
  'security.dropPasswordSave': 'बदलें और रिकवरी कुंजी दिखाएँ',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'आपके डिवाइस का स्क्रीन लॉक',
  'device.method.passkey': 'आपकी पासकी',
  'device.title': '{method} से अनलॉक करें',
  'device.description': 'अंदर जाने का सबसे तेज़ तरीका, और ब्राउज़र दोबारा शुरू होने के बाद भी यह काम करता है।',
  'device.on': 'चालू',
  'device.off': 'बंद',
  'device.body':
    'आपकी उँगली की छाप या चेहरा Passhold खोलता है – या, ज़्यादातर कंप्यूटरों पर, कंप्यूटर का अपना पासवर्ड। तो जो कोई भी इस कंप्यूटर को अनलॉक कर सकता है, वह Passhold खोल सकता है। जो खुलता है वह इसी कंप्यूटर पर रहता है, उसके बिना बेकार।',
  'device.whereMac':
    'जब Chrome पूछे कि पासकी कहाँ सहेजें, तो Google पासवर्ड मैनेजर चुनें। आपकी Chrome प्रोफ़ाइल की पासकी Passhold को अनलॉक नहीं कर सकती, और हर Mac पर iCloud कीचेन भी नहीं कर सकता।',
  'device.whereMacEdge':
    'जब Edge पूछे कि पासकी कहाँ सहेजें, तो ऐसी जगह चुनें जो उसे आपके बाकी डिवाइसों पर भी रखे। हर जगह Passhold को अनलॉक नहीं कर सकती: अगर आपकी चुनी जगह न कर सके, तो Passhold यह बताएगा, और कुछ नहीं बदलेगा।',
  'device.unavailable': 'यहाँ उपलब्ध नहीं',
  'device.unavailableBody':
    'इस ब्राउज़र को कोई फ़िंगरप्रिंट, चेहरा या स्क्रीन लॉक नहीं मिला जिसे Passhold इस्तेमाल कर सके। PIN हर जगह काम करता है।',
  'device.unavailableRecovery':
    'इस ब्राउज़र को कोई फ़िंगरप्रिंट, चेहरा या स्क्रीन लॉक नहीं मिला जिसे Passhold इस्तेमाल कर सके, इसलिए यहाँ यह वॉल्ट अपनी रिकवरी कुंजी से खुलता है। अगर आप उसे लिखना पसंद करें, तो मास्टर पासवर्ड सेट करें।',
  'device.opensWith': '{method} Passhold खोलता है',
  'device.notHere': 'इस ब्राउज़र में {method} सेट नहीं है',
  'device.isTheWayIn':
    'मास्टर पासवर्ड के बिना Passhold इसी तरह खुलता है। इसे बंद करने के लिए, पहले एक मास्टर पासवर्ड सेट करें।',
  'device.setUpHere': 'जब तक यहाँ {method} सेट नहीं होता, हर अनलॉक रिकवरी कुंजी माँगता है।',
  'device.setUp': 'सेट करें',
  'device.turnOff': 'बंद करें',
  'device.save': '{method} सेट करें',
  'keys.title': 'सुरक्षा कुंजी से अनलॉक करें',
  'keys.description': 'एक USB कुंजी जो आप लगाते हैं: अंदर जाने का एक और तरीका, और यह ब्राउज़र दोबारा शुरू होने के बाद भी काम करता है।',
  'keys.method': 'आपकी सुरक्षा कुंजी',
  'keys.on': { one: '{count} कुंजी सेट', other: '{count} कुंजियाँ सेट' },
  'keys.off': 'कोई कुंजी सेट नहीं',
  'keys.body':
    'कुंजी लगाएँ, उसका PIN लिखें और उसे छुएँ, और Passhold खुल जाता है – सिर्फ़ इसी कंप्यूटर पर। जिसके पास कुंजी हो और उसका PIN पता हो, वह यहाँ Passhold खोल सकता है, इसलिए इसे घर की चाबी की तरह रखें। खो जाए तो इसे यहाँ से हटाएँ: आपके दूसरे तरीके अब भी काम करते हैं।',
  'keys.add': 'कुंजी जोड़ें',
  'keys.save': 'यह कुंजी जोड़ें',
  'keys.one': 'सुरक्षा कुंजी',
  'keys.added': '{date} को जोड़ी गई',
  'keys.remove': 'हटाएँ',
  'pin.title': 'PIN से अनलॉक करें',
  'pinOffer.title': 'PIN से Passhold जल्दी खोलें',
  'pinOffer.body':
    'हर बार Passhold लॉक होने पर पासवर्ड की जगह कुछ अंक लिखें, ब्राउज़र बंद होने तक। ब्राउज़र दोबारा शुरू होने के बाद, एक बार आपका पासवर्ड।',
  'pinOffer.later': 'आप सेटिंग्स में, सुरक्षा के तहत, कभी भी एक सेट कर सकते हैं या बंद कर सकते हैं।',
  'pin.description': 'दिन में कई बार Passhold लॉक होता है, जब आप उसी ब्राउज़र के सामने हों।',
  'pin.on': 'चालू',
  'pin.off': 'बंद',
  'pin.bodyRecovery':
    'सिर्फ़ तब तक काम करता है जब तक ब्राउज़र खुला रहे, और सिर्फ़ पाँच गलत कोशिशों तक: उसके बाद, या दोबारा शुरू होने के बाद, डिवाइस या रिकवरी कुंजी चाहिए। PIN जो खोलता है वह डिस्क पर नहीं रखा जाता।',
  'pin.body':
    'सिर्फ़ तब तक काम करता है जब तक ब्राउज़र खुला रहे, और सिर्फ़ पाँच गलत कोशिशों तक: उसके बाद, या दोबारा शुरू होने के बाद, मास्टर पासवर्ड चाहिए। PIN जो खोलता है वह डिस्क पर नहीं रखा जाता।',
  'pin.setUp': 'PIN सेट करें',
  'pin.change': 'बदलें',
  'pin.turnOff': 'बंद करें',
  'pin.new': 'PIN, 6 से 12 अंक',
  'pin.again': 'फिर से लिखें',
  'pin.save': 'PIN सहेजें',

  'general.description': 'वेबसाइटों पर Passhold कैसे व्यवहार करता है, और वह कैसा दिखता है।',
  'general.filling': 'भरना और सहेजना',
  'general.appearance': 'भाषा और रूप',
  'settings.autoSuggest': 'साइन इन, कार्ड या पते के फ़ील्ड पर क्लिक करने पर सुझाव दिखाएँ',
  'settings.autoSuggestBody':
    'साइट के लिए आपके लॉगिन, साइन-अप फ़ॉर्म पर एक मज़बूत पासवर्ड, चेकआउट पर आपके कार्ड और पते। आपके चुनने तक कुछ नहीं भरा जाता।',

  'trash.description': 'लॉगिन, कार्ड, पते और नोट यहाँ तब तक रहते हैं जब तक आप उन्हें वापस न लाएँ या हमेशा के लिए न मिटाएँ।',
  'trash.sharedDescription':
    'परिवार के साथ साझा: उसमें कोई भी इन्हें वापस ला सकता है। हमेशा के लिए मिटाए जाने पर ये सबके लिए चले जाते हैं।',
  'trash.sharedMember':
    'परिवार के साथ साझा: आप इन्हें वापस ला सकते हैं। सिर्फ़ परिवार का आयोजक इन्हें हमेशा के लिए मिटाता है।',
  'settings.autoLock': 'इसके बाद लॉक करें',
  'settings.autoLock.never': 'सिर्फ़ तब जब ब्राउज़र बंद हो',
  'settings.autoLock.minutes': { one: '{count} मिनट', other: '{count} मिनट' },
  'settings.autoLock.hours': { one: '{count} घंटा', other: '{count} घंटे' },
  'settings.lockWithSystem': 'जब कंप्यूटर लॉक हो या स्लीप में जाए, तब लॉक करें',
  'settings.clipboard': 'कॉपी किए गए पासवर्ड इसके बाद साफ़ करें',
  'settings.clipboard.never': 'कभी नहीं',
  'settings.clipboard.seconds': { one: '{count} सेकंड', other: '{count} सेकंड' },
  'settings.clipboard.minutes': { one: '{count} मिनट', other: '{count} मिनट' },
  'settings.inlineButton': 'साइन इन, कार्ड और पते के फ़ील्ड में Passhold बटन दिखाएँ',
  'settings.offerToSave': 'साइन इन करने पर लॉगिन सहेजने की पेशकश करें',
  'settings.offerToSaveCards': 'भुगतान करने पर कार्ड और पते सहेजने की पेशकश करें',
  'settings.offerToSaveCardsBody':
    'कार्ड सिर्फ़ सुरक्षित (https) पेज से, और सिर्फ़ वह जिसका नंबर सही बैठता हो। वह आखिरी चार अंकों से दिखता है, कभी उसके नंबर या कोड से नहीं।',
  'settings.passkeys': 'पासकी सहेजें और इस्तेमाल करें',
  'settings.passkeysBody':
    'जब कोई साइट पासकी देती है, तो Passhold उसे आपके लॉगिन के साथ रखता है और उससे आपको साइन इन करता है। बंद होने पर, पासकी ब्राउज़र पर छोड़ दी जाती हैं।',
  'settings.language': 'भाषा',
  'settings.language.auto': 'ब्राउज़र जैसी',
  'settings.theme': 'रूप',
  'settings.theme.system': 'सिस्टम जैसा',
  'settings.theme.light': 'हल्का',
  'settings.theme.dark': 'गहरा',

  'settings.security': 'मास्टर पासवर्ड',
  'settings.securityBody': 'इसे बदलने से आपके वॉल्ट की कुंजी फिर से लॉक होती है; आपके लॉगिन जैसे हैं वैसे ही रहते हैं।',
  'settings.current': 'मौजूदा मास्टर पासवर्ड',
  'settings.new': 'नया मास्टर पासवर्ड',
  'settings.confirm': 'नया फिर से लिखें',
  'settings.change': 'मास्टर पासवर्ड बदलें',
  'settings.changeOpen': 'बदलें',
  'settings.changed': 'मास्टर पासवर्ड बदल दिया गया।',

  'settings.backup': 'बैकअप',
  'settings.backupBody':
    'आपका पूरा वॉल्ट एक एन्क्रिप्टेड फ़ाइल में। इसे इस कंप्यूटर के अलावा कहीं और रखें – USB ड्राइव, आपकी क्लाउड स्टोरेज – ताकि यह ब्राउज़र खोने से आपके लॉगिन न खोएँ। यह सिर्फ़ उसी मास्टर पासवर्ड से खुलता है जो आपके पास बनाते समय था।',
  'settings.backupBodyRecovery':
    'आपका पूरा वॉल्ट एक एन्क्रिप्टेड फ़ाइल में। इसे इस कंप्यूटर के अलावा कहीं और रखें – USB ड्राइव, आपकी क्लाउड स्टोरेज – ताकि यह ब्राउज़र खोने से आपके लॉगिन न खोएँ। यह आपकी रिकवरी कुंजी से खुलता है।',
  'settings.backupLast': 'आखिरी बैकअप: {date}',
  'settings.backupNever': 'अभी तक कोई बैकअप नहीं।',
  'settings.backupButton': 'बैकअप डाउनलोड करें',
  'settings.backupDone': 'आपके डाउनलोड में सहेजा गया। अब इसे इस कंप्यूटर के अलावा कहीं और रखें।',

  'settings.restoreBackup': 'बैकअप से पुनर्स्थापित करें',
  'settings.restoreBodyNew':
    'इस ब्राउज़र में अभी कोई वॉल्ट नहीं है। अपना वॉल्ट बैकअप फ़ाइल से वापस लाएँ – वह उसी मास्टर पासवर्ड से खुलेगा जिससे बैकअप बना था – या टूलबार के Passhold बटन से नया बनाएँ।',
  'settings.restoreBodyMerge':
    'बैकअप में जो है, उसे इस वॉल्ट में जोड़ता है। यहाँ कुछ नहीं मिटता: जहाँ दोनों में एक ही लॉगिन हो, वहाँ नया संपादन रखा जाता है, और दूसरा पासवर्ड उसके इतिहास में चला जाता है।',
  'settings.restoreChoose': 'बैकअप फ़ाइल चुनें',
  'settings.restoreMade': '{date} को बना बैकअप',
  'settings.restorePassword': 'बैकअप का मास्टर पासवर्ड',
  'settings.restoreRecoveryKey': 'बैकअप की रिकवरी कुंजी',
  'settings.restoreButton': 'पुनर्स्थापित करें',
  'settings.restoreNew': {
    one: 'वॉल्ट पुनर्स्थापित हुआ, {count} आइटम के साथ।',
    other: 'वॉल्ट पुनर्स्थापित हुआ, {count} आइटम के साथ।',
  },
  'settings.restoreAdded': {
    one: 'बैकअप से {count} आइटम जोड़ा गया।',
    other: 'बैकअप से {count} आइटम जोड़े गए।',
  },
  'settings.restoreUpdated': {
    one: 'बैकअप में {count} आइटम का संपादन नया था।',
    other: 'बैकअप में {count} आइटमों का संपादन नया था।',
  },
  'settings.restoreNothing': 'बैकअप में जो है वह सब इस वॉल्ट में पहले से है।',

  'settings.import': 'आयात',
  'settings.importBody':
    'Chrome, Edge, Firefox, Safari, Apple Passwords, Bitwarden, 1Password, LastPass, KeePass, Dashlane, Proton Pass या NordPass से अपने पासवर्ड लाएँ: वहाँ उन्हें CSV फ़ाइल के रूप में निर्यात करें, फिर यहाँ चुनें। फ़ाइल में मौजूद कार्ड, पते और नोट भी आ जाते हैं। Bitwarden से JSON के रूप में निर्यात करें (एन्क्रिप्टेड नहीं): उसकी CSV में कार्ड, पहचान और पासकी नहीं होतीं। Dashlane उन्हें अपनी अलग फ़ाइलों में रखता है: हर एक को बारी-बारी से चुनें।',
  'settings.importChoose': 'फ़ाइल चुनें',
  'settings.importFound': 'आयात के लिए मिला: {what}।',
  'settings.importLogins': { one: '{count} लॉगिन', other: '{count} लॉगिन' },
  'settings.importPasskeys': { one: '{count} पासकी', other: '{count} पासकी' },
  'settings.importCards': { one: '{count} कार्ड', other: '{count} कार्ड' },
  'settings.importAddresses': { one: '{count} पता', other: '{count} पते' },
  'settings.importNotes': { one: '{count} नोट', other: '{count} नोट' },
  'settings.importSkipped': {
    one: '{count} प्रविष्टि में Passhold का रखने लायक कुछ नहीं है, और उसे छोड़ दिया गया है।',
    other: '{count} प्रविष्टियों में Passhold का रखने लायक कुछ नहीं है, और उन्हें छोड़ दिया गया है।',
  },
  'settings.importDuplicates': {
    one: '{count} आपके वॉल्ट में पहले से है।',
    other: '{count} आपके वॉल्ट में पहले से हैं।',
  },
  'settings.importConfirm': 'आयात करें',
  'settings.importDone': '{what} आयात हुआ।',
  'settings.importDelete': 'अब CSV फ़ाइल मिटा दें: उसमें आपके पासवर्ड सादे पाठ में हैं।',
  'settings.importNothing': 'उस फ़ाइल में आयात करने के लिए कुछ नया नहीं है।',
  'settings.importTwoFactor': {
    one: 'इस फ़ाइल के {count} लॉगिन में दो-चरण (2FA) का कोड है। Passhold 2FA कोड नहीं रखता: अपना पुराना पासवर्ड मैनेजर मिटाने से पहले इसे किसी ऑथेंटिकेटर ऐप में ले जाएँ, वरना आप उस खाते से बाहर हो सकते हैं।',
    other: 'इस फ़ाइल के {count} लॉगिन में दो-चरण (2FA) के कोड हैं। Passhold 2FA कोड नहीं रखता: अपना पुराना पासवर्ड मैनेजर मिटाने से पहले इन्हें किसी ऑथेंटिकेटर ऐप में ले जाएँ, वरना आप उन खातों से बाहर हो सकते हैं।',
  },
  'settings.importAuthenticator': 'Keyrook Authenticator लें',
  'settings.importPasskeysLeft': {
    one: 'इस फ़ाइल की {count} पासकी Passhold तक नहीं पहुँच सकती। अपना पुराना पासवर्ड मैनेजर तब तक रखें जब तक आप उस साइट पर किसी और तरीके से साइन इन न कर लें और Passhold में नई पासकी न बना लें।',
    other: 'इस फ़ाइल की {count} पासकियाँ Passhold तक नहीं पहुँच सकतीं। अपना पुराना पासवर्ड मैनेजर तब तक रखें जब तक आप उन साइटों पर किसी और तरीके से साइन इन न कर लें और Passhold में नई पासकियाँ न बना लें।',
  },

  'settings.export': 'निर्यात',
  'settings.exportBody':
    'एक CSV फ़ाइल जिसे हर ब्राउज़र और पासवर्ड मैनेजर पढ़ सके। इसमें आपके पासवर्ड सादे पाठ में हैं: इसे उतने ही समय तक रखें जितनी ज़रूरत हो। इसमें सिर्फ़ लॉगिन हैं: पासकी, कस्टम फ़ील्ड, फ़ोल्डर, कार्ड, पते और नोट इसमें नहीं हैं। बैकअप में सब कुछ रहता है।',
  'settings.exportButton': 'CSV निर्यात करें',
  'settings.exportDone': 'निर्यात हो गया। काम हो जाने पर फ़ाइल मिटा दें।',

  'settings.neverSave': 'कभी सहेजने की पेशकश न करें',
  'settings.neverSaveEmpty':
    'कोई साइट नहीं। जब Passhold सहेजने की पेशकश करे, तब “इस साइट के लिए कभी नहीं” चुनें, और वह यहाँ दिखेगी।',
  'settings.remove': 'हटाएँ',

  'settings.trash': 'ट्रैश',
  'settings.trashEmpty': 'ट्रैश खाली है।',
  'settings.restore': 'वापस लाएँ',
  'settings.deleteForever': 'हमेशा के लिए मिटाएँ',
  'settings.emptyTrash': 'ट्रैश खाली करें',
  'settings.emptyTrashConfirm': 'ट्रैश में सब कुछ हमेशा के लिए मिटा दें?',

  'settings.danger': 'वॉल्ट हटाएँ',
  'settings.dangerBody':
    'इस ब्राउज़र से वॉल्ट मिटा देता है। उसमें का हर लॉगिन हमेशा के लिए चला जाता है – अगर आप उन्हें रखना चाहते हैं तो पहले बैकअप डाउनलोड करें।',
  'settings.dangerType': 'पुष्टि के लिए {word} लिखें',
  'settings.dangerWord': 'मिटाएँ',
  'settings.dangerButton': 'वॉल्ट हटाएँ',

  'settings.about': 'Passhold {version} · Keyrook द्वारा',

  // Errors
  'error.noWorker': 'Passhold ने जवाब नहीं दिया। इसे बंद करें और फिर से कोशिश करें।',
  'error.wrongPassword': 'यह मास्टर पासवर्ड नहीं है।',
  'error.passwordTooShort': 'कम से कम {min} अक्षर इस्तेमाल करें।',
  'error.vaultCorrupt': 'इस डिवाइस का वॉल्ट खराब है और खोला नहीं जा सकता।',
  'error.vaultTooNew': 'यह वॉल्ट एक नए Passhold से बना था। इसे खोलने के लिए Passhold अपडेट करें।',
  'error.itemNotFound': 'यह अब वॉल्ट में नहीं है।',
  'error.familyOrganiserOnly': 'इस वॉल्ट का ट्रैश सिर्फ़ परिवार का आयोजक खाली कर सकता है।',
  'error.familyGone': 'वह परिवार अब यहाँ नहीं है। सिंक करें, फिर दोबारा देखें।',
  'error.familyNotOpen': 'Passhold इस ब्राउज़र पर वह परिवार अभी नहीं खोल सकता। सिंक करें, फिर कोशिश करें।',
  'error.itemInvalid': 'इसे जैसा है वैसा सहेजा नहीं जा सकता।',
  'error.importEmpty': 'उस फ़ाइल में आयात करने के लिए कुछ नहीं है।',
  'error.importTooLarge': 'वह फ़ाइल आयात के लिए बहुत बड़ी है।',
  'error.importUnknownFormat': 'वह फ़ाइल पासवर्ड निर्यात जैसी नहीं लगती।',
  'error.importEncrypted':
    'वह Bitwarden निर्यात एन्क्रिप्टेड है, और Passhold उसे नहीं खोल सकता। Bitwarden में “.json (Encrypted)” नहीं, “.json” के रूप में फिर से निर्यात करें, फिर वह फ़ाइल चुनें।',
  'error.backupInvalid': 'वह फ़ाइल Passhold का बैकअप नहीं है, या वह खराब है।',
  'error.backupWrongPassword': 'यह वह मास्टर पासवर्ड नहीं है जिससे यह बैकअप बना था।',
  'error.backupWrongRecoveryKey': 'यह वह रिकवरी कुंजी नहीं है जिससे यह बैकअप बना था।',
  'error.noRecoveryKey': 'इस वॉल्ट के पास दिखाने के लिए कोई रिकवरी कुंजी नहीं है: यह मास्टर पासवर्ड से खुलता है।',
  'error.wrongRecoveryKey': 'यह रिकवरी कुंजी नहीं है।',
  'error.deviceNeeded':
    'बिना मास्टर पासवर्ड वाला वॉल्ट इस डिवाइस के अनलॉक से खुलता है: पहले उसे सेट करें। यह तब तक रहता है जब तक मास्टर पासवर्ड सेट न हो।',
  'error.accountOffline': 'Keyrook तक नहीं पहुँच सका। कनेक्शन जाँचें और फिर कोशिश करें।',
  'error.accountWrong':
    'गलत ईमेल या पासवर्ड। Google या GitHub से बना खाता अपने बटन से साइन इन करता है।',
  'error.accountSignedOut': 'Keyrook ने इस ब्राउज़र को साइन आउट कर दिया। फिर से साइन इन करें।',
  'error.accountBusy': {
    one: 'बहुत ज़्यादा कोशिशें। {count} सेकंड रुकें और फिर कोशिश करें।',
    other: 'बहुत ज़्यादा कोशिशें। {count} सेकंड रुकें और फिर कोशिश करें।',
  },
  'error.accountFailed': 'Keyrook अभी यह नहीं कर पाया। बाद में फिर कोशिश करें।',
  'error.accountAlready': 'यह वॉल्ट पहले से एक Keyrook खाते में साइन इन है।',
  'error.accountNone': 'यह वॉल्ट किसी Keyrook खाते में साइन इन नहीं है।',
  'error.accountKdfRefused':
    'Keyrook ने Passhold के स्वीकार करने से कमज़ोर कुंजी माँगी, इसलिए साइन इन रोक दिया गया।',
  'error.accountKeyWrong': 'खाते की कुंजी उस पासवर्ड से नहीं खुली।',
  'error.accountCode': 'वह कोड सही नहीं है, या उसकी अवधि खत्म हो गई है। ईमेल देखें, या नया कोड माँगें।',
  'error.accountMail': 'Keyrook अभी ईमेल नहीं भेज सका। एक मिनट बाद फिर कोशिश करें।',
  'error.providerDenied': 'साइन इन रद्द कर दिया गया।',
  'error.providerFailed': 'Google या GitHub अभी आपको साइन इन नहीं कर सके। फिर कोशिश करें।',
  'error.providerExpired': 'वह साइन इन खत्म हो गया है। फिर से शुरू करें।',
  'error.providerNotOwner':
    'यह वह खाता नहीं है जिससे यह Keyrook खाता साइन इन करता है। उसी से फिर साइन इन करें जिसे आप Keyrook के लिए इस्तेमाल करते हैं।',
  'error.signOutUnsent': {
    one: 'एक आइटम अभी तक आपके Keyrook खाते तक नहीं पहुँचा, इसलिए कुछ नहीं हटाया गया। अपना कनेक्शन जाँचें, या फिर से साइन इन करें, फिर साइन आउट करें।',
    other:
      '{count} आइटम अभी तक आपके Keyrook खाते तक नहीं पहुँचे, इसलिए कुछ नहीं हटाया गया। अपना कनेक्शन जाँचें, या फिर से साइन इन करें, फिर साइन आउट करें।',
  },
  'error.providerOtherProvider':
    'इस ईमेल का पहले से एक Keyrook खाता है जो Google और GitHub में से दूसरे से साइन इन करता है। उसी से साइन इन करें।',
  'error.providerHasPassword':
    'इस ईमेल का पहले से एक Keyrook खाता है जिसमें पासवर्ड है। यहाँ अपने ईमेल और पासवर्ड से साइन इन करें – या Google या GitHub से भी साइन इन करने के लिए इसे account.keyrook.com पर जोड़ें, वहाँ अपने पासवर्ड से साइन इन करके।',
  'error.providerEmailTaken':
    'इस ईमेल का पहले से एक Keyrook खाता है जो दूसरे तरीके से साइन इन करता है। उसी तरीके से साइन इन करें – या इसे account.keyrook.com पर उसमें जोड़ें, वहाँ उसी तरीके से साइन इन करके जिससे वह अभी साइन इन करता है।',
  'error.pairingWrongKey':
    'जो वापस आया वह इस खाते की कुंजी नहीं है, इसलिए उसे अस्वीकार किया गया। फिर पूछें, और सिर्फ़ किसी ऐसे ब्राउज़र से अंदर आने दें जिसे आप जानते हैं।',
  'error.pairingRefused': 'वह उस ब्राउज़र से नहीं आया जिसका कोड आपने जाँचा था, इसलिए उसे अस्वीकार किया गया। फिर पूछें।',
  'error.pairingEnded': 'वह अनुरोध खत्म हो गया। नए ब्राउज़र से फिर पूछें।',
  'error.passkeyWrong': 'यह पासकी इस खाते को नहीं खोलती। अंदर आने का कोई और तरीका आज़माएँ।',
  'error.joinExpired': 'वह साइन इन बहुत देर तक इंतज़ार करता रहा। फिर से साइन इन करें।',
  'error.accountPasswordWrong': 'यह खाता पासवर्ड नहीं है।',
  'error.accountNoKit': 'Passhold के पास इस खाते की रिकवरी कुंजी नहीं है।',
  'error.accountKitRace': 'किसी दूसरे ऐप ने अभी खाते की रिकवरी कुंजी बदल दी। सिंक करें, फिर कोशिश करें।',
  'error.accountKitShape': 'यह खाते की रिकवरी कुंजी जैसा नहीं लगता: इसमें 32 अक्षर और अंक होते हैं।',
  'error.accountKitWrong': 'यह रिकवरी कुंजी इस ईमेल पते वाले खाते से मेल नहीं खाती।',
  'error.accountKitNotThis': 'यह इस खाते की रिकवरी कुंजी नहीं है। जो आपने सहेजा है उसे फिर से देखें।',
  'error.accountPasswordWeak':
    'खाते के लिए अनुमान लगाना बहुत आसान है: अक्षरों, अंकों और चिह्नों के मेल वाला लंबा पासवर्ड इस्तेमाल करें, या चार-पाँच अलग-अलग शब्द।',
  'error.accountBoxWrong':
    'इस खाते में Passhold की कुंजी नहीं खुली। फिर से साइन इन करें; फिर भी न खुले तो खाता नए सिरे से शुरू करें।',
  'error.accountCodeWait': {
    one: 'अभी एक कोड भेजा गया था। {count} सेकंड में दूसरा माँग सकते हैं।',
    other: 'अभी एक कोड भेजा गया था। {count} सेकंड में दूसरा माँग सकते हैं।',
  },
  'error.accountSignUpKeys':
    'Keyrook ने Passhold की अपनी कुंजी माँगी, और कोई नहीं भेजी गई। Passhold अपडेट करें और फिर कोशिश करें।',
  'error.accountIdTaken': 'खाता अभी नहीं बन सका। नया कोड माँगें और फिर कोशिश करें।',
  'error.accountNoRoot': 'इस खाते के पास अभी ऐसी कुंजी नहीं है जिसे रिकवरी कुंजी खोल सके। उसके पासवर्ड से फिर साइन इन करें।',
  'error.accountRootNotHeld':
    'यह कंप्यूटर नहीं दिखा सका कि उसके पास खाते की कुंजी है। पासवर्ड या रिकवरी कुंजी से फिर साइन इन करें।',
  'error.accountRootChanged':
    'इस खाते की कुंजियाँ किसी दूसरे कंप्यूटर पर बदल दी गईं। किसी ऐसे कंप्यूटर पर साइन इन करें जहाँ Passhold अभी साइन इन है, या खाता नए सिरे से शुरू करें।',
  'error.accountKeyReplaced': 'इस खाते में Passhold की कुंजी किसी दूसरे कंप्यूटर पर बदल दी गई। फिर से साइन इन करें।',
  'error.accountSessionStolen':
    'यह कंप्यूटर साइन आउट कर दिया गया, क्योंकि इसका सत्र कहीं और से इस्तेमाल हुआ। फिर से साइन इन करें।',
  'error.accountOld':
    'यह खाता Google या GitHub से तब बना था जब हर Keyrook ऐप की अपनी कुंजी नहीं थी, और इसमें मौजूद कुछ भी अभी Passhold नहीं खोलता। इसे एक देने के लिए इसके ईमेल से खाता नए सिरे से शुरू करें।',
  'error.pairingBusy': 'इस खाते में शामिल होने के इंतज़ार में बहुत से ब्राउज़र हैं। कुछ मिनटों में फिर कोशिश करें।',
  'error.startOverExpired': 'वह खत्म हो गया। नया कोड माँगें और फिर से शुरू करें।',
  'error.startOverTooOften': 'यह खाता हाल में बहुत बार नए सिरे से शुरू हुआ है। {day} के बाद फिर कोशिश करें।',
  'error.startOverWaiting': 'यह खाता {day} को नए सिरे से शुरू होगा। उसमें साइन इन कोई ब्राउज़र इसे रद्द कर सकता है।',
  'error.startOverUpdate': 'Keyrook अब खाता नए सिरे से शुरू करने से पहले एक हफ़्ता रुकता है। इसे माँगने के लिए Passhold अपडेट करें।',
  'error.passkeyFailed': 'वह पासकी जाँची नहीं जा सकी। फिर कोशिश करें।',
  'error.passkeyNotYou': 'उस पासकी ने पुष्टि नहीं की कि आप ही हैं। फिर कोशिश करें, और जैसा वह माँगे वैसे अनलॉक करें।',
  'error.passkeyUnknown':
    'वह पासकी किसी Keyrook खाते में नहीं है। हो सकता है वह हटा दी गई हो: पासवर्ड से साइन इन करें, या Google या GitHub से।',
  'error.passkeyExpired': 'वह पासकी अनुरोध खत्म हो गया। फिर कोशिश करें।',
  'error.passkeyNotOffered': 'Keyrook यहाँ अभी पासकी नहीं देता।',
  'error.passkeyNoUnlock':
    'वह पासकी साइन इन करती है, पर अभी आपका खाता अनलॉक करने के लिए सेट नहीं है। account.keyrook.com पर, “Passkeys” के तहत, उसके बगल में “Let it unlock” चुनें, फिर फिर से कोशिश करें। या पासवर्ड से साइन इन करें, या Google या GitHub से।',
  'error.passkeyNoPrf':
    'वह पासकी account.keyrook.com पर साइन इन करती है, पर जहाँ वह रखी है वहाँ से वह आपका खाता अनलॉक नहीं कर सकती – macOS 15 से पहले का iCloud कीचेन, उदाहरण के लिए, नहीं कर सकता। account.keyrook.com पर, “Passkeys” के तहत, एक ऐसी जगह रखी पासकी जोड़ें जहाँ वह कर सके, जैसे सुरक्षा कुंजी, और जाँचें कि उसके बगल में “Unlocks your data” लिखा है। तब तक पासवर्ड से साइन इन करें, या Google या GitHub से।',
  'error.passkeyPermission':
    'Passhold को account.keyrook.com की पासकी इस्तेमाल करने के लिए Chrome की अनुमति चाहिए। पासकी फिर चुनें और उसकी अनुमति दें।',
  'error.passkeyPermissionEdge':
    'Passhold को account.keyrook.com की पासकी इस्तेमाल करने के लिए Edge की अनुमति चाहिए। पासकी फिर चुनें और उसकी अनुमति दें।',
  'error.passkeyCancelled': 'कोई पासकी इस्तेमाल नहीं हुई। फिर कोशिश करें, या किसी और तरीके से साइन इन करें।',
  'error.secondStepNeeded': 'आपका खाता दूसरा चरण माँगता है: अपने ऑथेंटिकेटर ऐप का कोड भी दर्ज करें।',
  'error.secondStepWrong':
    'वह कोड सही नहीं है। अभी आपका ऑथेंटिकेटर ऐप जो कोड दिखा रहा है वह दर्ज करें, या अपनी रिकवरी कुंजी।',
  'error.signInExpired': 'वह साइन इन खत्म हो गया है। फिर से साइन इन करें।',
  'error.secondStepUpdate': 'आपका खाता साइन इन के लिए दूसरा चरण माँगता है। साइन इन करने के लिए Passhold अपडेट करें।',
  'error.secondStepAsked': 'आपका खाता दूसरा चरण माँगता है: अपने ऑथेंटिकेटर ऐप का कोड दर्ज करें।',
  'error.secondStepTaken':
    'यह वही कोड है जिससे आपने साइन इन किया था, और हर कोड सिर्फ़ एक बार चलता है। आपका ऑथेंटिकेटर ऐप नया कोड दिखाए, इसका इंतज़ार करें।',
  'error.kitDraftGone': 'वह नई रिकवरी कुंजी समय पर सेट नहीं हुई, और कुछ नहीं बदला। फिर से नई बनाएँ।',
  'error.archiveWrong': 'यह वह नहीं खोलती जो सहेजा गया था।',
  'error.archiveGone': 'यह अब सहेजा हुआ नहीं है।',
  'error.archiveDeleteRefused': 'जो खत्म होने से पहले सहेजा गया था, उसे सिर्फ़ पुराना पासवर्ड या पुरानी रिकवरी कुंजी मिटा सकती है।',
  'error.accountNeedsRoot':
    'यह खाता Keyrook Authenticator में बना था, उससे पहले जब हर Keyrook ऐप की अपनी कुंजी नहीं थी। Passhold अब उसे एक दे सकता है; Authenticator में कुछ नहीं बदलता।',
  'error.accountServerWrong':
    'Keyrook के सर्वर ने ऐसे किसी जवाब से उत्तर दिया जिससे इस खाते की कुंजियाँ मेल नहीं खातीं, इसलिए Passhold रुक गया। बाद में फिर कोशिश करें।',
  'error.startOverNeedsPassword': 'इस खाते में पासवर्ड है: उसे नए सिरे से शुरू करने के लिए एक नया चुनें।',
  'error.pinInvalid': 'PIN 6 से 12 अंकों का होता है।',
  'error.wrongPin': 'यह PIN नहीं है।',
  'error.wrongPinLeft': {
    one: 'यह PIN नहीं है। {count} कोशिश बाकी है।',
    other: 'यह PIN नहीं है। {count} कोशिशें बाकी हैं।',
  },
  'error.pinLockedOut': 'बहुत सारे गलत PIN। किसी और तरीके से अनलॉक करें; उसके बाद PIN फिर काम करता है।',
  'error.pinUnavailable':
    'PIN सिर्फ़ तब तक काम करता है जब तक ब्राउज़र खुला रहे। किसी और तरीके से अनलॉक करें; उसके बाद PIN फिर काम करता है।',
  'error.deviceGone': 'इस डिवाइस से अनलॉक अब सेट नहीं है। किसी और तरीके से अनलॉक करें।',
  'error.deviceKeyWrong': 'इससे Passhold नहीं खुला। किसी और तरीके से अनलॉक करें, फिर डिवाइस अनलॉक दोबारा सेट करें।',
  'error.deviceUnsupported':
    'जहाँ वह पासकी सहेजी गई थी, वहाँ से Passhold को खोलने की कुंजी नहीं मिल सकती। फिर कोशिश करें और Google पासवर्ड मैनेजर में सहेजें – या PIN इस्तेमाल करें।',
  'error.deviceUnsupportedEdge':
    'जहाँ वह पासकी सहेजी गई थी, वहाँ से Passhold को खोलने की कुंजी नहीं मिल सकती। फिर कोशिश करें और कहीं और सहेजें – या PIN इस्तेमाल करें।',
  'error.deviceCancelled': 'कुछ अनलॉक नहीं हुआ: यह रद्द हुआ या बहुत समय लगा।',
  'error.keyUnsupported':
    'यह कुंजी Passhold को खोलने के लिए जो चाहिए वह नहीं दे सकती। ज़्यादातर FIDO2 कुंजियाँ दे सकती हैं; सिर्फ़ दो-चरण साइन इन (U2F) के लिए बनी कुंजी नहीं दे सकती।',
  'error.keyAlreadyAdded': 'यह कुंजी यहाँ पहले से सेट है।',
  'error.keyGone': 'यह सुरक्षा कुंजी अब यहाँ सेट नहीं है। किसी और तरीके से अनलॉक करें।',
  'error.keyWrong': 'इस कुंजी से Passhold नहीं खुला। किसी और तरीके से अनलॉक करें, फिर कुंजी हटाकर दोबारा जोड़ें।',
  'error.kdfUnsupported': 'वॉल्ट की सेटिंग्स वे नहीं हैं जो Passhold स्वीकार करता है।',
  'error.locked': 'Passhold लॉक है।',
  'error.noVault': 'अभी कोई वॉल्ट नहीं है।',
  'error.vaultExists': 'वॉल्ट पहले से मौजूद है।',
  'error.notOnPage': 'वह लॉगिन इस टैब के पेज के लिए नहीं है।',
  'error.expired': 'यह खत्म हो गया है। फिर कोशिश करें।',
  'error.noFields': 'इस पेज पर Passhold के भरने लायक कुछ नहीं है।',
  'error.cardInsecure': 'Passhold कार्ड सिर्फ़ सुरक्षित (https) पेज पर भरता है।',
  'error.unknown': 'कुछ गड़बड़ हो गई: {detail}',
};
