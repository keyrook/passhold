import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'von Keyrook',

  // Common
  'common.cancel': 'Abbrechen',
  'common.close': 'Schließen',
  'common.save': 'Speichern',
  'common.edit': 'Bearbeiten',
  'common.back': 'Zurück',
  'common.show': 'Anzeigen',
  'common.hide': 'Ausblenden',
  'common.notNow': 'Nicht jetzt',

  // Setup
  'setup.title': 'Tresor anlegen',
  'setup.body':
    'Passhold bewahrt Ihre Passwörter verschlüsselt auf diesem Gerät auf. Ein Hauptpasswort öffnet sie – wählen Sie eines, das Sie sich merken und nirgendwo sonst verwenden.',
  'setup.password': 'Hauptpasswort',
  'setup.confirm': 'Noch einmal eingeben',
  'setup.mismatch': 'Die beiden Passwörter stimmen nicht überein.',
  'setup.tooShort': 'Verwenden Sie mindestens {min} Zeichen.',
  'setup.understand':
    'Ich weiß, dass niemand – weder Passhold noch Keyrook – meinen Tresor wiederherstellen kann, wenn ich dieses Passwort vergesse.',
  'setup.create': 'Tresor anlegen',
  'setup.creating': 'Wird angelegt…',
  'setup.restore': 'Aus einer Sicherung wiederherstellen',

  // Strength
  'setup.deviceBody':
    'Passhold bewahrt Ihre Passwörter verschlüsselt auf diesem Gerät auf, und {method} öffnet sie – kein Hauptpasswort, das Sie sich ausdenken oder merken müssen. Sie erhalten außerdem einen Wiederherstellungsschlüssel für den Fall, dass {method} einmal nicht mehr funktioniert.',
  'setup.deviceWhereMac': 'Wenn Chrome fragt, wo der Passkey gespeichert werden soll, wählen Sie Google Password Manager.',
  'setup.deviceWhereMacEdge':
    'Wenn Edge fragt, wo der Passkey gespeichert werden soll, wählen Sie einen Ort, an dem er auch auf Ihren anderen Geräten verfügbar ist. Nicht jeder Ort kann Passhold entsperren: Wenn dieser es nicht kann, sagt Passhold das.',
  'setup.createWithDevice': 'Mit {method} anlegen',
  'setup.usePassword': 'Stattdessen ein Hauptpasswort verwenden',
  'setup.useDevice': 'Stattdessen {method} verwenden',
  'setup.signIn': 'Bei einem Keyrook-Konto anmelden oder eines anlegen',

  'welcome.title': 'Ihre Passwörter, auf jedem Computer',
  'welcome.body':
    'Melden Sie sich einmal an. Passhold öffnet sich mit Ihrem Fingerabdruck und füllt für Sie aus, und Ihre Anmeldungen sind dort, wo Sie sich anmelden.',
  'welcome.email': 'E-Mail-Adresse verwenden',
  'gate.touchTitle': 'Mit einer Berührung öffnen',
  'gate.touchBody': 'Touch ID oder Windows Hello öffnet Passhold. Kein Hauptpasswort, das Sie sich ausdenken und merken müssen.',
  'gate.everywhereTitle': 'Auf jedem Computer, den Sie nutzen',
  'gate.everywhereBody': 'Melden Sie sich auf einem anderen Computer an, und Ihre Passwörter und Passkeys sind dort.',
  'gate.privateTitle': 'Nur Sie können sie lesen',
  'gate.privateBody':
    'Verschlüsselt auf diesem Computer, bevor etwas gesendet wird. Keyrook kann Ihre Passwörter nicht lesen und auch nicht, zu welchen Websites sie gehören.',
  'welcome.note':
    'Zuerst auf diesem Computer verschlüsselt: Keyrook kann Ihre Passwörter nicht lesen und auch nicht, zu welchen Websites sie gehören.',
  'connect.title': 'Ihr Keyrook-Konto einschalten',
  'connect.body': 'Ihre Anmeldungen auf jedem Computer, den Sie nutzen – und eine Sicherung, falls dieser verloren geht.',
  'connect.email': 'E-Mail',
  'kitCheck.title': 'Wiederherstellungsschlüssel Ihres Kontos prüfen',
  'kitCheck.body': 'Geben Sie ihn einmal ein, damit Sie wissen, dass Sie ihn noch haben, bevor Sie ihn brauchen.',
  'accountPasskey.button': 'Mit einem Passkey fortfahren',
  'accountPasskey.working': 'Warten auf den Passkey…',
  'accountPasskey.hint':
    'Einer, den Sie auf account.keyrook.com hinzugefügt haben. Beim ersten Mal fragt {browser}, ob Passhold ihn verwenden darf.',
  'accountPasskey.openPasskeys': '„Passkeys“ auf account.keyrook.com öffnen',
  'join.title': 'Bei Keyrook anmelden',
  'join.body': 'Ein Keyrook-Konto für Passhold und Keyrook Authenticator. Ihre Anmeldungen kommen aus dem Konto in diesen Browser.',
  'join.createTitle': 'Ein Keyrook-Konto anlegen',
  'join.createBody':
    'Ein Konto für Passhold und Keyrook Authenticator: Ihre Anmeldungen, zuerst auf diesem Gerät verschlüsselt, auf jedem Computer, bei dem Sie sich anmelden.',
  'join.lockTitle': 'Angemeldet als {email}',
  'join.lockBodyDevice': 'Letzter Schritt: Passhold öffnet sich auf diesem Computer mit {method}. Ihre Anmeldungen werden geladen, sobald das eingerichtet ist.',
  'join.cancel': 'Anderes Konto verwenden',
  'join.lockBodyCode': 'Letzter Schritt: ein Code, der Passhold auf diesem Computer öffnet. Ihre Anmeldungen werden geladen, sobald das eingerichtet ist.',
  'join.opening': 'Passhold wird geöffnet…',
  'setup.useAccountPassword': 'Stattdessen mein Konto-Passwort verwenden',
  'setup.useCode': 'Stattdessen einen Code für diesen Computer verwenden',
  'security.accountPasswordTitle': 'Öffnet sich mit Ihrem Keyrook-Konto-Passwort',
  'security.accountPasswordBody':
    'Ein Passwort für beides. Wenn es sich ändert, übernimmt Passhold hier die Änderung, sobald Sie sich das nächste Mal anmelden.',

  'recovery.title': 'Wiederherstellungsschlüssel speichern',
  'recovery.body':
    'Wenn dieses Gerät verloren geht oder seine Entsperrung nicht mehr funktioniert, ist dieser Schlüssel der Weg zurück in Ihren Tresor und seine Sicherungen. Sie können ihn in den Einstellungen erneut anzeigen, solange Passhold sich noch öffnet – bewahren Sie ihn deshalb auch an einem anderen Ort auf: ausgedruckt, auf Ihrem Telefon oder in einer Datei, die nicht auf diesem Computer liegt.',
  'recovery.download': 'Herunterladen',
  'recovery.copy': 'Kopieren',
  'recovery.copied': 'Kopiert',
  'recovery.print': 'Drucken',
  'recovery.qr': 'QR-Code anzeigen',
  'recovery.qrHide': 'QR-Code ausblenden',
  'recovery.qrLabel': 'Der Wiederherstellungsschlüssel als QR-Code',
  'recovery.qrHint': 'Richten Sie die Kamera Ihres Telefons darauf und speichern Sie den Text in einer Notiz oder machen Sie ein Foto davon.',
  'recovery.show': 'Anzeigen',

  'kit.title': 'Passhold-Wiederherstellungsblatt',
  'kit.made': 'Erstellt am {date}',
  'kit.keyLabel': 'Wiederherstellungsschlüssel',
  'kit.whenTitle': 'Wenn sich Passhold nicht öffnen lässt',
  'kit.sameDevice':
    'Auf diesem Computer: Wenn Passhold zum Entsperren auffordert, wählen Sie „Stattdessen den Wiederherstellungsschlüssel verwenden“ und geben Sie den Schlüssel ein.',
  'kit.newDevice':
    'Auf einem neuen Computer: Installieren Sie Passhold, wählen Sie „Aus einer Sicherung wiederherstellen“, wählen Sie Ihre neueste Sicherungsdatei und geben Sie den Schlüssel ein. Ohne Sicherung gibt es nichts wiederherzustellen – legen Sie deshalb eine an.',
  'kit.keep': 'Bewahren Sie dieses Blatt sicher auf, getrennt von Ihrem Computer. Wer es und eine Kopie Ihres Tresors hat, kann den Tresor öffnen.',
  'recovery.fileTitle': 'Passhold-Wiederherstellungsschlüssel',
  'recovery.fileMade': 'Erstellt am {date}',
  'recovery.fileBody':
    'Dieser Schlüssel öffnet Ihren Passhold-Tresor und seine Sicherungen, wenn Ihr Gerät es nicht kann. Wer ihn und eine Kopie Ihres Tresors hat, kann ihn öffnen. Bewahren Sie ihn daher sicher auf und nicht auf demselben Computer.',
  'recovery.pending': 'Wiederherstellungsschlüssel noch nicht gesichert',
  'recovery.keptState': 'Wiederherstellungsschlüssel gesichert',
  'recovery.rowBody':
    'Öffnet Ihren Tresor und seine Sicherungen, wenn {method} es nicht kann. Ein neuer stoppt das Öffnen dieses Tresors mit dem alten; Sicherungen, die früher erstellt wurden, öffnen sich weiterhin mit dem alten.',
  'recovery.makeNew': 'Neuen erstellen',
  'recovery.savedIt': 'Ich habe ihn gespeichert',
  'recovery.checkTitle': 'Prüfen, ob Sie ihn gespeichert haben',
  'recovery.checkBody':
    'Geben Sie zwei Gruppen des Schlüssels aus dem Gespeicherten ein – der Datei, dem Papier oder dem Foto. Gruppen sind die Blöcke aus vier Zeichen zwischen den Bindestrichen, von links gezählt.',
  'recovery.group': 'Gruppe {position}',
  'recovery.check': 'Prüfen',
  'recovery.checkWrong':
    'Das ist nicht, was Ihr Schlüssel lautet. Sehen Sie sich das Gespeicherte noch einmal an, oder zeigen Sie den Schlüssel erneut an und speichern Sie ihn jetzt.',
  'recovery.showAgain': 'Schlüssel erneut anzeigen',
  'recovery.covered': 'Ihr Keyrook-Konto ist der Weg zurück',
  'recovery.coveredBody':
    'Wenn sich {method} hier nicht mehr öffnen lässt, entfernen Sie den Tresor und melden Sie sich erneut bei Ihrem Konto an: Jede Anmeldung kommt zurück. Der eigene Wiederherstellungsschlüssel dieses Tresors ist weiterhin hier einsehbar.',

  'proof.recoveryKey': 'Wiederherstellungsschlüssel',
  'proof.withDevice': 'Sie bestätigen mit {method}.',
  'proof.useDevice': 'Stattdessen mit {method} bestätigen',
  'proof.usePassword': 'Stattdessen das Hauptpasswort eingeben',
  'proof.useAccountPassword': 'Stattdessen das Konto-Passwort eingeben',
  'proof.useCode': 'Stattdessen den Code eingeben',
  'proof.useRecoveryKey': 'Stattdessen den Wiederherstellungsschlüssel eingeben',
  'strength.0': 'Sehr schwach',
  'strength.1': 'Schwach',
  'strength.2': 'Mittel',
  'strength.3': 'Stark',
  'strength.4': 'Sehr stark',
  'strength.short': 'Länger ist stärker: Streben Sie 14 Zeichen oder mehr an.',
  'strength.digitsOnly': 'Nur Ziffern sind schnell zu erraten.',
  'strength.repeats': 'Vermeiden Sie immer wieder dasselbe Zeichen.',

  // Unlock
  'unlock.title': 'Passhold ist gesperrt',
  'unlock.body': 'Geben Sie Ihr Hauptpasswort ein.',
  'unlock.password': 'Hauptpasswort',
  'unlock.submit': 'Entsperren',
  'unlock.pinBody': 'Geben Sie Ihre PIN ein.',
  'unlock.pin': 'PIN',
  'unlock.usePassword': 'Stattdessen das Hauptpasswort verwenden',
  'unlock.usePin': 'Stattdessen die PIN verwenden',
  'unlock.recoveryBody': 'Geben Sie Ihren Wiederherstellungsschlüssel ein.',
  'unlock.deviceBody': 'Verwenden Sie {method} oder geben Sie unten ein.',
  'unlock.recoveryKey': 'Wiederherstellungsschlüssel',
  'unlock.useRecoveryKey': 'Stattdessen den Wiederherstellungsschlüssel verwenden',
  'unlock.lost': 'Kein Zugang?',
  'unlock.forgotBodyRecovery':
    'Ihr Wiederherstellungsschlüssel öffnet den Tresor, wenn das Gerät es nicht kann. Ohne ihn und ohne das Gerät kann niemand – weder Passhold noch Keyrook – den Tresor öffnen: Sie können ihn nur in den Einstellungen entfernen und neu beginnen.',
  'unlock.bodyAccount': 'Geben Sie Ihr Keyrook-Konto-Passwort ein.',
  'unlock.accountPassword': 'Keyrook-Konto-Passwort',
  'unlock.useAccountPassword': 'Stattdessen das Konto-Passwort verwenden',
  'unlock.forgotBodyAccount':
    'Es ist Ihr Keyrook-Konto-Passwort: Wenn es woanders geändert wurde, verwenden Sie das neue. Endgültig vergessen? Entfernen Sie diesen Tresor in den Einstellungen und melden Sie sich erneut an – mit dem Wiederherstellungsschlüssel, wenn Sie ein neues Passwort brauchen – dann kommt jede Anmeldung zurück.',
  'unlock.bodyCode': 'Geben Sie den Code ein, der Passhold auf diesem Computer öffnet.',
  'unlock.code': 'Code für diesen Computer',
  'unlock.useCode': 'Stattdessen den Code verwenden',
  'unlock.forgotBodyCode':
    'Entfernen Sie diesen Tresor in den Einstellungen und melden Sie sich erneut mit Google oder GitHub an: Jede Anmeldung kommt aus Ihrem Konto zurück.',
  'unlock.device': 'Mit {method} entsperren',
  'unlock.key': 'Mit einem Sicherheitsschlüssel entsperren',
  'unlock.keyBody': 'Stecken Sie Ihren Sicherheitsschlüssel ein oder geben Sie unten ein.',
  'unlock.or': 'oder',
  'unlock.unlocking': 'Wird entsperrt…',
  'unlock.forgot': 'Vergessen?',
  'unlock.forgotBody':
    'Ihr Hauptpasswort ist der einzige Schlüssel zu diesem Tresor, und es wird nirgends gespeichert. Ohne es lässt sich der Tresor nicht öffnen – Sie können ihn nur in den Einstellungen entfernen und neu beginnen.',

  // Vault
  'vault.search': 'Suchen',
  'vault.lock': 'Sperren',
  'vault.settings': 'Einstellungen',
  'vault.add': 'Neue Anmeldung',
  'vault.onThisPage': 'Auf {site}',
  'vault.all': 'Alle Anmeldungen',
  'vault.empty': 'Noch keine Anmeldungen',
  'vault.emptyBody':
    'Melden Sie sich bei einer Website an, und Passhold bietet an, sie zu speichern – oder fügen Sie hier eine hinzu oder importieren Sie aus Ihrem Browser.',
  'vault.import': 'Passwörter importieren',
  'vault.noResults': 'Nichts passt zu „{query}“.',
  'vault.fill': 'Ausfüllen',
  'vault.copyUsername': 'Nutzernamen kopieren',
  'vault.copyPassword': 'Passwort kopieren',
  'vault.noUsername': 'Kein Nutzername',
  'vault.count': { one: '{count} Eintrag', other: '{count} Einträge' },
  'vault.everything': 'Alle Einträge',

  // Asking for a rating, once, after real use
  'rating.title': 'Finden Sie Passhold nützlich?',
  'rating.body': 'Eine Bewertung im Store hilft anderen, es zu finden.',
  'rating.rate': 'Bewerten',
  'rating.later': 'Nicht jetzt',

  // What a list shows, and what can be added
  'kinds.label': 'Anzeigen',
  'kinds.all': 'Alles',
  'kinds.logins': 'Anmeldungen',
  'kinds.cards': 'Karten',
  'kinds.addresses': 'Adressen',
  'kinds.notes': 'Notizen',
  'kinds.noLogins': 'Noch keine Anmeldungen.',
  'kinds.noCards':
    'Noch keine Karten. Fügen Sie eine mit + oben hinzu, dann füllt Passhold sie beim Bezahlen aus, wenn Sie sie wählen.',
  'kinds.noAddresses':
    'Noch keine Adressen. Fügen Sie eine mit + oben hinzu, dann füllt Passhold sie überall aus, wo ein Formular danach fragt.',
  'kinds.noNotes':
    'Noch keine Notizen. Eine Notiz bewahrt alles auf, was keine Anmeldung ist – ein WLAN-Passwort, einen Lizenzschlüssel –, verschlüsselt zusammen mit allem anderen.',
  'add.menu': 'Hinzufügen',
  'add.login': 'Anmeldung',
  'add.card': 'Karte',
  'add.address': 'Adresse',
  'add.note': 'Notiz',
  'place.label': 'Tresore',
  'place.mine': 'Meine',
  'place.of': '{vault}, geteilt in {family}',
  'move.to': 'Verschieben nach {vault}',
  'move.confirm':
    'Alle in {family} sehen sie in {vault} und können sie ändern. Sie verlässt Ihren eigenen Tresor; ihre früheren Passwörter bleiben zurück.',
  'move.do': 'Verschieben',
  'family.unlockTitle': 'Den gemeinsamen Tresor von {family} in diesem Browser öffnen',
  'family.unlockBody':
    'Passhold braucht einmalig Ihr Keyrook-Konto-Passwort, um Ihren Schlüssel in diesem Browser an die Familie weiterzugeben. Es wird nirgendwohin gesendet.',
  'family.unlockOnPage': 'Öffnen Sie die Seite „Family“ auf account.keyrook.com und geben Sie dort Ihren Familienschlüssel an Passhold weiter.',
  'family.password': 'Keyrook-Konto-Passwort',
  'family.unlock': 'Öffnen',
  'family.openPage': 'Seite „Familie“ öffnen',
  'family.keyChanged': 'Der Schlüssel von {who} in {family} hat sich geändert',
  'family.newSender': 'Der Schlüssel von {family} kam von {who}, den dieser Browser noch nicht kennt',
  'family.keyChangedBody': 'Passhold nimmt nichts von dieser Person an, bis Sie beide einen Code verglichen haben. Rufen Sie an oder treffen Sie sich: Die Person wählt, neben Ihrem Namen auf der Seite „Family“ von account.keyrook.com Codes zu vergleichen.',
  'family.showCode': 'Code anzeigen',
  'family.codeIs': 'Ihr Code',
  'family.match': 'Die Codes stimmen überein',
  'family.differ': 'Sie unterscheiden sich',
  'family.differed':
    'Dann vertrauen Sie nicht. Sagen Sie einem Organisator/einer Organisatorin Ihrer Familie Bescheid; Passhold übernimmt bis dahin nichts von dieser Person.',
  'family.someone': 'Jemand',
  'family.waiting':
    'Ein Organisator/eine Organisatorin von {family} muss Sie erst bestätigen. Was geteilt wird, öffnet sich hier, sobald das geschehen ist.',
  'family.rotate':
    'Jemand hat {family} verlassen, und Passhold hat noch nicht alle seine Schlüssel geändert: Was in seinen gemeinsamen Tresoren geändert wird, wartet auf diesem Browser. Bleibt das so, ändern Sie die Schlüssel auf der Seite „Familie“.',
  'family.rotateCompare':
    'Jemand hat {family} verlassen. Passhold gibt allen neue Schlüssel, sobald Sie den Code oben verglichen haben; bis dahin wartet, was in den gemeinsamen Tresoren geändert wird, auf diesem Browser.',
  'family.rotateWait':
    'Jemand hat {family} verlassen. Was Sie in seinen gemeinsamen Tresoren ändern, wartet auf diesem Browser, bis das Passhold eines Organisators/einer Organisatorin die Schlüssel ändert – das geschieht bei der Synchronisierung –, damit die Person, die gegangen ist, es nicht lesen kann.',
  'family.left': '{who} ist nicht mehr in {family}',
  'family.leftBody':
    'Passhold kann nicht erkennen, warum. Falls Sie das nicht erwartet haben, fragen Sie die Person oder einen Organisator/eine Organisatorin Ihrer Familie.',
  'family.title': 'Familie',
  'family.description': 'Wer in Ihrer Familie ist und welche Tresore sie teilt. Eine Familie wird auf der Seite „Family“ von account.keyrook.com verwaltet: einladen, jemanden entfernen, Schlüssel ändern.',
  'family.none': 'Dieses Konto ist in keiner Familie. Familien werden auf der Seite „Family“ von account.keyrook.com angelegt.',
  'family.youOrganise': 'Sie sind Organisator/in dieser Familie.',
  'family.youMember': 'Sie sind Mitglied dieser Familie.',
  'family.you': '(Sie)',
  'family.organiser': 'Organisator/in',
  'family.notCompared': 'Ohne Codevergleich aufgenommen',
  'family.keyNew': 'Der Schlüssel hat sich geändert: Es wird nichts von dieser Person übernommen, bis Sie einen Code vergleichen',
  'family.membersLater': 'Wer dazugehört, wird hier angezeigt, sobald die Familie in diesem Browser geöffnet ist.',
  'family.sharedVaults': 'Gemeinsame Tresore',
  'family.vaultWaits': 'Was darin geändert wird, wartet, bis ein Organisator/eine Organisatorin den Schlüssel ändert',

  // Cards, addresses and notes
  'wallet.updated': 'Geändert am {date}',
  'wallet.copyField': '{field} kopieren',
  'card.untitled': 'Karte',
  'card.newTitle': 'Neue Karte',
  'card.editTitle': 'Karte bearbeiten',
  'card.titleHint': 'Bleibt es leer, wird die Karte nach ihrem Netzwerk und den letzten vier Ziffern benannt.',
  'card.number': 'Kartennummer',
  'card.numberCheck': 'Diese Nummer ist ungültig: Prüfen Sie jede Ziffer.',
  'card.holder': 'Name auf der Karte',
  'card.expiry': 'Gültig bis',
  'card.month': 'Monat',
  'card.year': 'Jahr',
  'card.code': 'Sicherheitscode',
  'card.empty': 'Geben Sie eine Kartennummer oder einen Namen an.',
  'card.expired': 'Diese Karte ist abgelaufen.',
  'card.expiredOn': 'abgelaufen {expiry}',
  'card.copyNumber': 'Kartennummer kopieren',
  'card.copyExpiry': 'Ablaufdatum kopieren',
  'address.untitled': 'Adresse',
  'address.newTitle': 'Neue Adresse',
  'address.editTitle': 'Adresse bearbeiten',
  'address.titleHint': 'Zuhause, Arbeit … Bleibt es leer, wird sie nach dem Namen darin benannt.',
  'address.name': 'Vollständiger Name',
  'address.organization': 'Firma',
  'address.street': 'Straße und Hausnummer',
  'address.city': 'Ort',
  'address.region': 'Bundesland oder Region',
  'address.postalCode': 'Postleitzahl',
  'address.country': 'Land',
  'address.chooseCountry': 'Land auswählen',
  'address.phone': 'Telefon',
  'address.email': 'E-Mail',
  'address.address': 'Adresse',
  'address.empty': 'Geben Sie einen Namen oder einen Teil der Adresse an.',
  'note.untitled': 'Notiz ohne Titel',
  'note.newTitle': 'Neue Notiz',
  'note.editTitle': 'Notiz bearbeiten',
  'note.title': 'Titel',
  'note.text': 'Notiz',
  'note.empty': 'Geben Sie einen Titel an oder schreiben Sie etwas.',
  'note.edited': 'Bearbeitet am {date}',

  // Pending save, in the popup
  'pending.saveTitle': 'Diese Anmeldung speichern?',
  'pending.updateTitle': 'Passwort aktualisieren?',
  'pending.lockedTitle': 'Die gerade verwendete Anmeldung speichern?',
  'pending.body': '{username} auf {site}',
  'pending.bodyNoUser': 'Ein Passwort für {site}',
  'pending.save': 'Speichern',
  'pending.update': 'Aktualisieren',
  'pending.never': 'Nie für diese Website',

  // Item
  'item.username': 'Nutzername',
  'item.password': 'Passwort',
  'item.website': 'Website',
  'item.websites': 'Websites',
  'item.notes': 'Notizen',
  'item.favorite': 'Favorit',
  'item.unfavorite': 'Aus den Favoriten entfernen',
  'item.addFavorite': 'Zu den Favoriten hinzufügen',
  'item.trash': 'In den Papierkorb verschieben',
  'item.updated': 'Passwort geändert am {date}',
  'item.history': 'Frühere Passwörter',
  'item.weak': 'Dieses Passwort ist schwach: Es wäre schnell zu erraten.',
  'item.reused': {
    one: 'Dieses Passwort wird auch für {count} andere Anmeldung verwendet. Gibt eine Website es preis, sind beide offen.',
    other: 'Dieses Passwort wird auch für {count} andere Anmeldungen verwendet. Gibt eine Website es preis, sind alle offen.',
  },
  'item.changePassword': 'Auf der Website ändern',
  'item.openSite': '{site} öffnen',
  'item.passkey': 'Passkey',
  'item.passkeyBody': 'Für {site}, gespeichert am {date}',

  // Edit
  'edit.newTitle': 'Neue Anmeldung',
  'edit.editTitle': 'Anmeldung bearbeiten',
  'edit.title': 'Name',
  'edit.titleHint': 'Bleibt es leer, wird sie nach der Website benannt.',
  'edit.username': 'Nutzername oder E-Mail',
  'edit.password': 'Passwort',
  'edit.generate': 'Generieren',
  'edit.websites': 'Websites',
  'edit.websitesHint': 'Eine pro Zeile. Passhold bietet diese Anmeldung auf diesen Websites an.',
  'edit.notes': 'Notizen',
  'edit.empty': 'Geben Sie einen Namen, einen Nutzernamen oder ein Passwort an.',

  // Fields of an item's own, and folders
  'fields.title': 'Eigene Felder',
  'fields.add': 'Feld hinzufügen',
  'fields.name': 'Feldname',
  'fields.value': 'Wert',
  'fields.hidden': 'Verbergen wie ein Passwort',
  'fields.remove': 'Dieses Feld entfernen',
  'fields.unnamed': 'Feld',
  'fields.copy': '{name} kopieren',
  'folders.label': 'Ordner',
  'folders.placeholder': 'Kein Ordner',
  'folders.choose': 'Vorhandene Ordner',
  'folders.hint': 'Halten Sie Dinge zusammen – Arbeit, Familie, Bank – und zeigen Sie jeweils einen Ordner an.',
  'folders.all': 'Alle Ordner',
  'folders.none': 'In keinem Ordner',
  'folders.count': { one: '{count} Eintrag', other: '{count} Einträge' },
  'folders.nothingHere': 'Nichts dieser Art in diesem Ordner.',
  'folders.rename': 'Umbenennen',
  'folders.renameTo': 'Neuer Name für den Ordner',
  'folders.remove': 'Ordner entfernen',
  'folders.removeHint': 'Was darin ist, bleibt erhalten, in keinem Ordner.',

  // Generator
  'generator.length': 'Länge',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'Ähnlich aussehende Zeichen auslassen (I l 1 O 0)',
  'generator.again': 'Anderes',
  'generator.use': 'Dieses Passwort verwenden',
  'generator.bits': '{bits} Bit',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold ist gesperrt.',
  'menu.unlock': 'Passhold entsperren',
  'menu.unlockHint': 'Klicken Sie in der Symbolleiste auf Passhold, um es zu entsperren, und kommen Sie dann hierher zurück.',
  'menu.none': 'Keine gespeicherten Anmeldungen für {site}.',
  'menu.uninitialized': 'Richten Sie Passhold zuerst ein: Klicken Sie in der Symbolleiste darauf.',
  'menu.suggest': 'Ein starkes Passwort verwenden',
  'menu.suggestBody': 'Ein neues Passwort, für Sie ausgefüllt. Passhold bietet an, es zu speichern, sobald das Formular abgeschickt ist.',
  'menu.fillFor': 'Auf {site} ausfüllen',
  'menu.hidden': 'Passhold wird von etwas auf dieser Seite verdeckt, deshalb füllt es nicht aus.',
  'menu.passkey': 'Passkey · {username}',
  'menu.noCards': 'Noch keine Karten in Passhold. Fügen Sie eine in Passhold in der Symbolleiste hinzu.',
  'menu.noAddresses': 'Noch keine Adressen in Passhold. Fügen Sie eine in Passhold in der Symbolleiste hinzu.',
  'menu.cardInsecure':
    'Diese Seite ist nicht sicher (unverschlüsseltes http), deshalb füllt Passhold hier keine Karte aus: Jeder auf dem Weg könnte sie lesen.',

  // A website's passkey
  'passkey.saveTitle': 'Einen Passkey für {site} speichern?',
  'passkey.save': 'Passkey speichern',
  'passkey.saveElsewhere': 'Anderswo speichern',
  'passkey.useElsewhere': 'Einen Passkey von anderswo verwenden',
  'passkey.existsTitle': 'Dieser Passkey ist bereits in Passhold',
  'passkey.ok': 'OK',
  'passkey.signInTitle': 'Bei {site} anmelden',
  'passkey.signInBody': 'Mit einem in Passhold gespeicherten Passkey',
  'passkey.none': 'Kein Passkey für {site} in Passhold.',
  'passkey.hidden': 'Passhold wird von etwas auf dieser Seite verdeckt, deshalb antwortet es nicht.',

  // Save prompt on a page
  'prompt.save': 'Anmeldung in Passhold speichern?',
  'prompt.update': 'Passwort in Passhold aktualisieren?',
  'prompt.saveButton': 'Speichern',
  'prompt.updateButton': 'Aktualisieren',
  'prompt.never': 'Nie für diese Website',
  'prompt.saved': 'In Passhold gespeichert.',
  'prompt.locked': 'Klicken Sie in der Symbolleiste auf Passhold und entsperren Sie es – dort wird gefragt, ob Sie speichern möchten.',
  'prompt.saveCard': 'Karte in Passhold speichern?',
  'prompt.updateCard': 'Karte in Passhold aktualisieren?',
  'prompt.saveAddress': 'Adresse in Passhold speichern?',
  'prompt.saveCheckout': 'Karte und Adresse in Passhold speichern?',

  // Settings
  'settings.title': 'Einstellungen',
  'settings.cannotOpen': 'Gar nicht mehr zu öffnen? Tresor aus diesem Browser entfernen',
  'settings.encryptedHere': 'Auf diesem Gerät verschlüsselt',
  'settings.source': 'Quelltext auf GitHub',

  'nav.passwords': 'Passwörter',
  'nav.accountSync': 'Konto und Synchronisierung',
  'nav.family': 'Familie',
  'nav.account': 'Keyrook-Konto',
  'nav.backup': 'Sicherung und Import',
  'nav.security': 'Sicherheit',
  'nav.general': 'Allgemein',
  'nav.needsAttention': 'braucht Aufmerksamkeit',


  'account.description':
    'Melden Sie sich an, und Ihre Anmeldungen folgen Ihnen in jeden Browser, in dem Sie sich bei Passhold anmelden. Sie werden zuerst auf diesem Gerät verschlüsselt: Der Server von Keyrook kann sie nicht lesen, auch nicht, zu welchen Websites sie gehören.',
  'account.email': 'E-Mail',
  'account.password': 'Keyrook-Konto-Passwort',
  'account.signIn': 'Anmelden',
  'account.signingIn': 'Anmeldung läuft…',
  'account.note':
    'Dasselbe Konto wie in Keyrook Authenticator. Ein Konto, das mit Google oder GitHub erstellt wurde, meldet sich über dessen Schaltfläche an.',
  'account.haveOne': 'Ich habe ein Konto',
  'account.create': 'Konto anlegen',
  'account.sendCode': 'Mir einen Code per E-Mail senden',
  'account.createNote':
    'Keyrook sendet einen sechsstelligen Code per E-Mail, um zu bestätigen, dass die Adresse Ihnen gehört. Hat die Adresse schon ein Konto, sagt die E-Mail das stattdessen: Melden Sie sich damit an.',
  'account.codeSent': 'Ein Code ist unterwegs an {email}. Er gilt fünfzehn Minuten.',
  'account.code': 'Sechsstelliger Code',
  'account.newPassword': 'Keyrook-Konto-Passwort',
  'account.passwordNote':
    'Dieses Passwort öffnet Ihr Keyrook-Konto in jedem Browser, für Passhold und Keyrook Authenticator gleichermaßen. Keyrook sieht es nie und kann es nicht für Sie zurücksetzen; der Wiederherstellungsschlüssel, den Sie als Nächstes erhalten, ist der Weg, ein neues festzulegen.',
  'account.createButton': 'Konto anlegen',
  'account.creating': 'Wird angelegt…',
  'account.otherEmail': 'Andere Adresse verwenden',
  'account.signedInAs': 'Angemeldet als {email}',
  'account.signedInAsNamed': 'Angemeldet als {name} ({email})',
  'account.synced': 'Synchronisiert am {date}',
  'account.notSynced': 'Noch nicht synchronisiert',
  'account.syncNow': 'Jetzt synchronisieren',

  // The account, at the foot of the popup
  'accountBar.synced': 'Synchronisiert {time}',
  'accountBar.justNow': 'gerade eben',
  'accountBar.syncing': 'Wird synchronisiert…',
  'accountBar.signedOut': 'Abgemeldet – melden Sie sich erneut an, um zu synchronisieren',
  'accountBar.startedOver': 'Konto neu begonnen – melden Sie sich erneut an',
  'accountBar.removed': 'Aus dem Konto entfernt – melden Sie sich erneut an, um zu synchronisieren',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'Aus Ihrem Keyrook-Konto entfernt',
  'removed.body':
    'Am {date} wurde dieser Browser aus Ihrem Keyrook-Konto entfernt. Passhold hat deshalb die Anmeldungen, Karten, Adressen und Notizen des Kontos von ihm gelöscht und ihn abgemeldet. Was hier hinzugefügt oder geändert und nie gesendet wurde, blieb als eigener Bestand dieses Browsers erhalten. Melden Sie sich erneut an, um den Rest zurückzuholen.',

  // Passwords, in Settings
  'passwords.description':
    'Jede Anmeldung, jeder Passkey, jede Karte, Adresse und Notiz in Passhold. Wählen Sie eine aus, um sie zu sehen, daraus zu kopieren oder sie zu ändern.',
  'passwords.all': 'Alle',
  'passwords.attention': 'Braucht Aufmerksamkeit',
  'passwords.weak': 'Schwach',
  'passwords.reused': 'Mehrfach verwendet',
  'account.syncDone': 'Synchronisiert.',
  'account.removed': {
    one: '{count} Eintrag, auf einem anderen Gerät endgültig gelöscht, wurde hier entfernt.',
    other: '{count} Einträge, auf einem anderen Gerät endgültig gelöscht, wurden hier entfernt.',
  },
  'account.skipped': {
    one: '{count} Eintrag ließ sich nicht öffnen und blieb unangetastet.',
    other: '{count} Einträge ließen sich nicht öffnen und blieben unangetastet.',
  },
  'account.manage': 'Ihr Keyrook-Konto verwalten',
  'account.manageBody':
    'Ändern Sie das Passwort, erstellen Sie einen neuen Wiederherstellungsschlüssel oder beginnen Sie das Konto neu auf account.keyrook.com – für Passhold und Keyrook Authenticator gleichermaßen.',
  'account.manageBodyProvider':
    'Erstellen Sie einen neuen Wiederherstellungsschlüssel oder beginnen Sie das Konto neu auf account.keyrook.com – für Passhold und Keyrook Authenticator gleichermaßen.',
  'account.manageOpen': 'Öffnen',
  'account.signOut': 'Abmelden',
  'account.signOutBody': 'Entfernt jede Anmeldung aus diesem Browser, nach einer letzten Synchronisierung. Melden Sie sich erneut an, dann kommen sie zurück.',
  'account.signOutConfirm':
    'Passhold synchronisiert noch einmal, dann entfernt es den Tresor aus diesem Browser. Nichts wird entfernt, solange eine Anmeldung nicht Ihr Konto erreicht hat.',
  'account.signOutButton': 'Abmelden und entfernen',
  'account.signedOutByServer': 'Keyrook hat diesen Browser abgemeldet. Melden Sie sich erneut an, um weiter zu synchronisieren.',
  'account.startedOver':
    'Ihr Keyrook-Konto wurde am {date} neu begonnen, deshalb hat Keyrook diesen Browser abgemeldet. Melden Sie sich mit dem neuen Passwort an: Die Anmeldungen hier werden unter den neuen Schlüsseln des Kontos hochgeladen.',
  'account.startedOverProvider':
    'Ihr Keyrook-Konto wurde am {date} neu begonnen, deshalb hat Keyrook diesen Browser abgemeldet. Melden Sie sich mit Google oder GitHub an: Die Anmeldungen hier werden unter den neuen Schlüsseln des Kontos hochgeladen.',
  'account.forgot': 'Passwort vergessen?',
  'account.recoverBody':
    'Keyrook sendet einen Code an die Adresse des Kontos. Geben Sie dann diesen Code ein, den Wiederherstellungsschlüssel des Kontos aus dem Blatt, das Sie beim Anlegen gespeichert haben, und ein neues Passwort. Jeder andere Browser und jede andere App, die beim Konto angemeldet ist, wird nach dem neuen Passwort fragen.',
  'account.recoveryKey': 'Wiederherstellungsschlüssel des Kontos',
  'account.recoverPassword': 'Neues Konto-Passwort',
  'account.recoverButton': 'Neues Passwort festlegen',
  'account.recovering': 'Wird festgelegt…',
  'account.backToSignIn': 'Zurück zur Anmeldung',
  'startOver.link': 'Auch den Wiederherstellungsschlüssel verloren? Konto neu beginnen',
  'startOver.title': 'Konto neu beginnen',
  'needsRoot.body':
    'Wenn Sie den Wiederherstellungsschlüssel des Kontos haben, den Keyrook Authenticator Ihnen gab, geben Sie ihn ein: Dann öffnet er auch Passhold. Ohne ihn erstellt Passhold einen neuen Wiederherstellungsschlüssel für das Konto, der nur einmal angezeigt wird, und der alte hört auf zu funktionieren.',
  'needsRoot.sheet': 'Wiederherstellungsschlüssel des Kontos aus Keyrook Authenticator (falls vorhanden)',
  'needsRoot.withSheet': 'Diesen Schlüssel verwenden',
  'needsRoot.newSheet': 'Neuen Wiederherstellungsschlüssel erstellen',
  'startOver.body':
    'Wenn nur noch die E-Mail-Adresse übrig ist, kann das Konto mit neuen Schlüsseln und einem neuen Wiederherstellungsschlüssel neu beginnen. Das wirkt eine Woche nach Ihrer Anfrage, und bis dahin kann jeder Browser, der noch beim Konto angemeldet ist, sie abbrechen – jemand, der nur Ihre E-Mail-Adresse hat, kann es also nicht. Alles, was das Konto enthielt, bewahrt Keyrook 90 Tage lang verschlüsselt auf: Das alte Passwort oder der alte Wiederherstellungsschlüssel holt es zurück.',
  'startOver.button': 'Neu beginnen',
  'startOver.working': 'Konto wird neu begonnen…',
  'startOver.kitBody':
    'Der neue Wiederherstellungsschlüssel des Kontos: Er funktioniert, sobald das Konto neu begonnen hat. Passhold zeigt ihn nur jetzt an, bewahren Sie ihn deshalb auf, bevor Sie fortfahren.',
  'startOver.waitTitle': 'Ihr Konto beginnt am {date} neu',
  'startOver.waitBody':
    'Bis dahin ändert sich nichts, und jeder Browser, der noch beim Konto angemeldet ist, kann es abbrechen. Keyrook schreibt {email} jetzt, am Tag davor und wenn es passiert.',
  'startOver.waitThen':
    'Danach melden Sie sich hier mit Ihrem neuen Passwort an. Die Anmeldungen in diesem Browser werden unter den neuen Schlüsseln des Kontos hochgeladen, und was es vorher enthielt, wird 90 Tage lang aufbewahrt.',
  'startOver.waitThenProvider':
    'Danach melden Sie sich hier wie bisher mit Google oder GitHub an. Die Anmeldungen in diesem Browser werden unter den neuen Schlüsseln des Kontos hochgeladen, und was es vorher enthielt, wird 90 Tage lang aufbewahrt.',
  'startOver.understood': 'Verstanden',
  'startOver.doneTitle': 'Ihr Konto wurde neu begonnen',
  'startOver.doneBody':
    'Melden Sie sich mit Ihrem neuen Passwort an: Die Anmeldungen in diesem Browser werden unter den neuen Schlüsseln des Kontos hochgeladen, und was es vorher enthielt, wird 90 Tage lang aufbewahrt.',
  'startOver.doneBodyProvider':
    'Melden Sie sich wie bisher mit Google oder GitHub an: Die Anmeldungen in diesem Browser werden unter den neuen Schlüsseln des Kontos hochgeladen, und was es vorher enthielt, wird 90 Tage lang aufbewahrt.',
  'startOverWait.title': 'Ihr Keyrook-Konto beginnt am {date} neu',
  'startOverWait.body':
    'Angefragt wurde es mit dem Code, den Keyrook Ihnen per E-Mail geschickt hat, von einem Gerät, das sich „{device}“ nannte. Wenn Sie es nicht waren, kann jemand Ihre E-Mails lesen: Brechen Sie es jetzt ab und ändern Sie dann Ihr E-Mail-Passwort. Waren Sie es, lassen Sie es laufen.',
  'startOverWait.bodyNoName':
    'Angefragt wurde es mit dem Code, den Keyrook Ihnen per E-Mail geschickt hat. Wenn Sie es nicht waren, kann jemand Ihre E-Mails lesen: Brechen Sie es jetzt ab und ändern Sie dann Ihr E-Mail-Passwort. Waren Sie es, lassen Sie es laufen.',
  'startOverWait.cancel': 'Neustart abbrechen',
  'kept.title': {
    one: 'Vor dem Neustart des Kontos aufbewahrt: {count} Eintrag',
    other: 'Vor dem Neustart des Kontos aufbewahrt: {count} Einträge',
  },
  'kept.body': 'Bis {date}. Das alte Konto-Passwort oder der alte Wiederherstellungsschlüssel holt sie zurück in Passhold.',
  'kept.open': 'Zurückholen',
  'kept.secret': 'Altes Konto-Passwort oder alter Wiederherstellungsschlüssel',
  'kept.done': { one: '{count} Eintrag zurückgeholt.', other: '{count} Einträge zurückgeholt.' },
  'kept.nothingNew': 'Alles, was aufbewahrt wurde, ist bereits hier.',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': 'Mit {provider} fortfahren',
  'provider.passwordTitle': 'Dieses Keyrook-Konto hat ein Passwort',
  'provider.passwordBody':
    'Sie haben sich mit {provider} als {email} angemeldet. Das Passwort des Kontos öffnet Passhold hier: Geben Sie es einmal ein.',
  'provider.openAccountPage': 'account.keyrook.com öffnen',
  'secondStep.title': 'Bestätigung in zwei Schritten',
  'secondStep.body':
    'Geben Sie den 6-stelligen Code ein, den Ihre Authenticator-App für Keyrook anzeigt. App verloren? Geben Sie stattdessen Ihren Wiederherstellungsschlüssel des Kontos ein.',
  'secondStep.ownerBody':
    'Ihr Konto verlangt dafür ebenfalls einen zweiten Schritt: den Code Ihrer Authenticator-App oder Ihren Wiederherstellungsschlüssel des Kontos.',
  'secondStep.field': 'Code oder Wiederherstellungsschlüssel',
  'secondStep.continue': 'Weiter',
  'secondStep.passkey': 'Stattdessen einen Passkey verwenden',
  'secondStep.nextBody':
    'Auch für die Übergabe des Schlüssels an das Konto wird ein Code verlangt, und jeder Code funktioniert nur einmal. Warten Sie, bis Ihre Authenticator-App einen neuen anzeigt, und geben Sie ihn dann ein – oder Ihren Wiederherstellungsschlüssel des Kontos.',
  'provider.or': 'oder',
  'provider.signedInWith': 'Angemeldet mit {provider} als {email}',
  'provider.signedInWithNamed': 'Angemeldet mit {provider} als {name} ({email})',
  'provider.newTitle': 'Ihr Keyrook-Konto anlegen',
  'provider.newBody':
    'Sie melden sich mit {provider} als {email} an. Das Konto hat kein Passwort: {provider} meldet Sie an. Auf einem anderen Computer lässt ein bereits angemeldeter Browser Sie hinein – oder der Wiederherstellungsschlüssel, den Sie als Nächstes erhalten.',
  'provider.joinTitle': 'Diesen Browser hereinlassen',
  'provider.joinBody':
    '{email} ist hier angemeldet, aber der Schlüssel, der Ihre Anmeldungen öffnet, liegt auf Ihren anderen Computern. Öffnen Sie Passhold auf einem davon – Einstellungen, Konto und Synchronisierung – und lassen Sie diesen Browser hinein.',
  'provider.waiting': 'Warten auf einen anderen Browser…',
  'provider.compare': 'Der andere Browser zeigt einen Code. Lassen Sie ihn dort nur herein, wenn es dieser hier ist:',
  'provider.ended': 'Diese Anfrage endete, bevor ein anderer Browser diesen hereinließ.',
  'provider.askAgain': 'Erneut fragen',
  'provider.useKit': 'Stattdessen den Wiederherstellungsschlüssel verwenden',
  'provider.useThisKey': 'Diesen Schlüssel verwenden',
  'provider.needsRoot':
    '{email} wurde in Keyrook Authenticator erstellt, bevor jede Keyrook-App einen eigenen Schlüssel hatte. Passhold kann ihm jetzt einen geben, sobald Sie noch einmal mit {provider} bestätigen; in Authenticator ändert sich nichts.',
  'provider.confirmWith': 'Mit {provider} bestätigen',
  'provider.noKeyYet':
    'Passhold wurde noch nirgends bei {email} angemeldet, deshalb kann kein anderer Browser diesen hereinlassen. Der Wiederherstellungsschlüssel des Kontos öffnet es.',
  'passkey.onLabel': 'Neue Computer öffnen sich mit Ihrem Passkey',
  'passkey.offLabel': 'Kein Passkey für neue Computer',
  'passkey.body':
    'Auf einem neuen Computer: {provider}, dann Ihr Passkey – und jede Anmeldung ist da. Der Passkey wird vom Google Password Manager verwahrt und ist auf jedem Chrome verfügbar, bei dem Sie sich anmelden.',
  'passkey.bodyEdge':
    'Auf einem neuen Computer: {provider}, dann Ihr Passkey – und jede Anmeldung ist da. Dort gespeichert, wo er synchronisiert wird, ist der Passkey auch auf Ihren anderen Geräten verfügbar.',
  'passkey.turnOn': 'Einschalten',
  'passkey.turnOff': 'Ausschalten',
  'passkey.joinTitle': 'Mit Ihrem Passkey öffnen',
  'passkey.joinBody': '{email} hat einen Passkey für neue Computer. Bestätigen Sie damit, und Ihre Anmeldungen werden geladen.',
  'passkey.use': 'Passkey verwenden',
  'passkey.otherWays': 'Andere Wege hinein',
  'pairing.asking': '{device} möchte in Ihr Konto hineingelassen werden.',
  'pairing.start': 'Hereinlassen…',
  'pairing.notMe': 'Nicht ich',
  'pairing.compare': 'Lassen Sie es nur herein, wenn der neue Browser genau diesen Code zeigt:',
  'pairing.match': 'Codes stimmen überein – hereinlassen',
  'pairing.differ': 'Codes unterscheiden sich',

  'accountKit.title': 'Wiederherstellungsschlüssel des Kontos speichern',
  'accountKit.body':
    'Wenn Sie Ihr Keyrook-Konto-Passwort vergessen, legt dieser Schlüssel ein neues fest – für Passhold und Keyrook Authenticator gleichermaßen. Keyrook sieht Ihr Passwort nie, deshalb ist dies der einzige Weg. Sie können ihn in den Einstellungen erneut anzeigen; bewahren Sie ihn zusätzlich an einem anderen Ort auf.',
  'accountKit.fileTitle': 'Wiederherstellungsschlüssel des Keyrook-Kontos',
  'accountKit.fileBody':
    'Wenn Sie Ihr Keyrook-Konto-Passwort vergessen, legt dieser Schlüssel ein neues fest: In Passhold unter Einstellungen → Konto und Synchronisierung → „Passwort vergessen?“. Wer ihn und Ihre E-Mail-Adresse hat, kann dasselbe tun. Bewahren Sie ihn daher sicher auf und nicht auf diesem Computer.',
  'accountKit.bodyNoPassword':
    'Ihr Konto hat kein Passwort: Ein bereits angemeldeter Browser lässt ein neues herein. Wenn keiner mehr übrig ist, tut es dieser Schlüssel – für Passhold und Keyrook Authenticator gleichermaßen. Sie können ihn in den Einstellungen erneut anzeigen; bewahren Sie ihn zusätzlich an einem anderen Ort auf.',
  'accountKit.fileBodyNoPassword':
    'Wenn kein Computer mehr bei Ihrem Keyrook-Konto angemeldet ist, lässt dieser Schlüssel einen neuen hinein: Melden Sie sich mit Google oder GitHub an und wählen Sie „Stattdessen den Wiederherstellungsschlüssel verwenden“. Wer ihn hat und sich ebenfalls als Sie anmelden kann, kann dasselbe tun. Bewahren Sie ihn daher sicher auf und nicht auf diesem Computer.',
  'accountKit.whenTitleNoPassword': 'Wenn kein Computer mehr angemeldet ist',
  'accountKit.inPassholdNoPassword':
    'In Passhold: Mit Google oder GitHub anmelden, „Stattdessen den Wiederherstellungsschlüssel verwenden“ wählen und diesen Schlüssel eingeben.',
  'accountKit.keepNoPassword':
    'Bewahren Sie dieses Blatt sicher auf, getrennt von Ihrem Computer. Wer es hat und sich bei Ihrem Google- oder GitHub-Konto anmelden kann, kann damit Ihr Keyrook-Konto öffnen.',
  'accountKit.rowBodyNoPassword': 'Lässt einen neuen Computer hinein, wenn kein anderer mehr dafür da ist.',
  'accountKit.sheetTitle': 'Wiederherstellungsblatt des Keyrook-Kontos',
  'accountKit.whenTitle': 'Wenn das Konto-Passwort vergessen wurde',
  'accountKit.inPasshold':
    'In Passhold: Einstellungen → Konto und Synchronisierung → „Passwort vergessen?“, dann Ihre E-Mail-Adresse, der Code, den Keyrook per E-Mail schickt, dieser Schlüssel und ein neues Passwort.',
  'accountKit.inAuthenticator': 'Keyrook Authenticator nimmt denselben Schlüssel: „Passwort vergessen?“, wo er Sie zur Anmeldung auffordert.',
  'accountKit.keep':
    'Bewahren Sie dieses Blatt sicher auf, getrennt von Ihrem Computer. Wer es und Ihr E-Mail-Postfach hat, kann ein neues Passwort für das Konto festlegen.',
  'accountKit.pending': 'Wiederherstellungsschlüssel des Kontos noch nicht gesichert',
  'accountKit.keptState': 'Wiederherstellungsschlüssel des Kontos gesichert',
  'accountKit.elsewhere': 'Wiederherstellungsschlüssel des Kontos anderswo erstellt',
  'accountKit.none': 'Kein Wiederherstellungsschlüssel für das Konto',
  'accountKit.rowBody':
    'Legt ein neues Konto-Passwort fest, wenn das alte vergessen wurde. Ein neuer lässt den alten in jeder App nicht mehr funktionieren.',
  'accountKit.elsewhereBody':
    'Auf account.keyrook.com, in Keyrook Authenticator oder in einem anderen Browser erstellt: Sein Schlüssel steht auf dem damals gespeicherten Blatt. Hier einen zu erstellen, lässt diesen nicht mehr funktionieren.',
  'accountKit.noneBody':
    'Ohne einen kann ein vergessenes Konto-Passwort nicht zurückgesetzt werden, und was bei Keyrook aufbewahrt ist, lässt sich nicht öffnen. Die Anmeldungen in diesem Browser bleiben in jedem Fall erhalten.',
  'accountKit.make': 'Einen erstellen',
  'accountKit.apart':
    'Bewahren Sie ihn getrennt von Ihrer E-Mail auf: Wer diesen Schlüssel hat und Ihre E-Mails lesen kann, kann ein neues Passwort festlegen und Ihre Anmeldungen öffnen. Schicken Sie ihn nicht an sich selbst per E-Mail und legen Sie ihn nicht im Cloud-Speicher dieses E-Mail-Dienstes ab.',
  'accountKit.apartNoPassword':
    'Bewahren Sie ihn getrennt von dem Google- oder GitHub-Konto auf, mit dem Sie sich anmelden: Wer diesen Schlüssel hat und sich dort als Sie anmelden kann, kann Ihre Anmeldungen öffnen. Schicken Sie ihn nicht an sich selbst per E-Mail und legen Sie ihn nicht im Cloud-Speicher dieses Kontos ab.',
  'accountKit.unchecked': 'Wiederherstellungsschlüssel des Kontos noch nicht geprüft',
  'accountKit.uncheckedBody':
    'Ihr Konto hat einen Wiederherstellungsschlüssel, erstellt auf account.keyrook.com oder in einer anderen App. Geben Sie ihn einmal ein: Passhold prüft, dass er Ihr Konto öffnet, und behält ihn, um ihn Ihnen erneut anzuzeigen.',
  'accountKit.typeIt': 'Eingeben',
  'accountKit.checked': 'Er öffnet Ihr Konto. Passhold behält ihn jetzt, um ihn Ihnen hier erneut anzuzeigen.',
  'accountKit.draftBody':
    'Der neue Wiederherstellungsschlüssel Ihres Kontos. Er funktioniert noch nicht: Sobald Sie ihn gespeichert und wieder eingegeben haben, legt Ihr Konto-Passwort ihn fest, und der alte hört auf zu funktionieren.',
  'accountKit.setTitle': 'Neuen Wiederherstellungsschlüssel festlegen',
  'accountKit.setBody':
    'Geben Sie Ihr Keyrook-Konto-Passwort ein. Bis dahin funktioniert Ihr alter Wiederherstellungsschlüssel noch, dieser neue nicht.',
  'accountKit.set': 'Festlegen',
  'checkup.clear': 'Nichts zu beheben',
  'checkup.clearBody': 'Keine schwachen oder mehrfach verwendeten Passwörter, und Ihre Sicherung ist aktuell.',
  'checkup.issues': { one: '{count} Punkt zum Prüfen', other: '{count} Punkte zum Prüfen' },
  'checkup.issuesBody': 'Jeder unten erklärt, warum es wichtig ist und wie Sie es beheben.',
  'checkup.backup': 'Sicherung',
  'checkup.access': 'Zugang',
  'checkup.recoveryPending':
    'Der für diesen Tresor erstellte Wiederherstellungsschlüssel wurde nie als gesichert bestätigt, und er ist der einzige Zugang, wenn {method} nicht mehr funktioniert. Erstellen Sie einen neuen und bewahren Sie ihn auf.',
  'checkup.deviceMissing':
    'Dieser Tresor hat kein Hauptpasswort, deshalb fragt hier jede Entsperrung ohne {method} nach dem Wiederherstellungsschlüssel.',
  'checkup.lastBackup': 'Letzte Sicherung am {date}',
  'checkup.backupNever':
    'Geht dieser Browser verloren, gehen auch Ihre Anmeldungen verloren. Eine Sicherung ist eine verschlüsselte Datei, die Sie an einem anderen Ort aufbewahren.',
  'checkup.backupDue': 'Ihr Tresor hat sich seitdem geändert. Erstellen Sie eine neue Sicherung, damit sie alles enthält.',
  'checkup.backUp': 'Jetzt sichern',
  'checkup.weak': { one: '{count} schwaches Passwort', other: '{count} schwache Passwörter' },
  'checkup.weakBody':
    'Zu kurz oder einfach genug, um erraten zu werden. Ändern Sie jedes auf seiner Website; Passhold schlägt im Formular ein starkes vor und bietet an, es zu speichern.',
  'checkup.weakNone': 'Keines.',
  'checkup.reused': {
    one: '{count} Passwort wird mehr als einmal verwendet',
    other: '{count} Passwörter werden mehr als einmal verwendet',
  },
  'checkup.reusedBody':
    'Gibt eine Website ein Passwort preis, probieren Menschen es überall sonst aus. Geben Sie jeder Anmeldung ihr eigenes.',
  'checkup.reusedNone': 'Keines: Jede Anmeldung hat ihr eigenes Passwort.',
  'checkup.sharedBy': { one: 'Von {count} Anmeldung geteilt', other: 'Von {count} Anmeldungen geteilt' },
  'checkup.change': 'Ändern',
  'checkup.limits':
    'Passhold prüft nicht, ob ein Passwort in einem Datenleck aufgetaucht ist: Dafür müsste ein Server gefragt werden, und Passhold fragt keinen. Es mahnt auch nicht wegen alter Passwörter – ein starkes, einzigartiges nützt sich nicht ab.',

  'backup.description': 'Eine verschlüsselte Kopie anlegen, eine zurückholen oder Anmeldungen hinein- und herausbringen.',
  'backup.backupRow': 'Ihr ganzer Tresor in einer verschlüsselten Datei, unter Ihrem Hauptpasswort.',
  'backup.restoreRow': 'Die Anmeldungen einer Sicherungsdatei in diesen Tresor aufnehmen.',
  'backup.importRow': 'Aus einem anderen Browser oder Passwortmanager als CSV-Datei oder als JSON von Bitwarden.',
  'backup.exportRow': 'Eine CSV-Datei, die andere Apps lesen können. Nicht verschlüsselt.',

  'security.description': 'Wie sich Passhold öffnet und wann es sich wieder schließt.',
  'security.locking': 'Sperren',
  'security.opensTitle': 'So öffnet sich Passhold',
  'security.opensBody': 'Kein Hauptpasswort: {method} öffnet es, und der Wiederherstellungsschlüssel, wenn {method} es nicht kann.',
  'security.setPassword': 'Stattdessen ein Hauptpasswort verwenden',
  'security.setPasswordBody':
    'Passhold öffnet sich dann mit einem Passwort, das Sie wählen, und der Wiederherstellungsschlüssel öffnet es nicht mehr.',
  'security.setPasswordOpen': 'Festlegen',
  'security.setPasswordSave': 'Dieses Passwort verwenden',
  'security.dropPassword': 'Kein Hauptpasswort mehr verwenden',
  'security.dropPasswordBody':
    'Öffnen Sie es allein mit {method} und bewahren Sie einen Wiederherstellungsschlüssel für den Tag auf, an dem es nicht geht. Das Hauptpasswort öffnet den Tresor nicht mehr.',
  'security.dropPasswordOpen': 'Wechseln',
  'security.dropPasswordSave': 'Wechseln und Wiederherstellungsschlüssel anzeigen',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'Bildschirmsperre Ihres Geräts',
  'device.method.passkey': 'Passkey',
  'device.title': 'Mit {method} entsperren',
  'device.description': 'Der schnellste Weg hinein, und er funktioniert auch nach einem Neustart des Browsers weiter.',
  'device.on': 'Ein',
  'device.off': 'Aus',
  'device.body':
    'Ihr Fingerabdruck oder Ihr Gesicht öffnet Passhold – oder auf den meisten Computern das eigene Passwort des Computers. Wer diesen Computer entsperren kann, kann also Passhold öffnen. Was es öffnet, bleibt auf diesem Computer und ist ohne ihn nutzlos.',
  'device.whereMac':
    'Wenn Chrome fragt, wo der Passkey gespeichert werden soll, wählen Sie Google Password Manager. Ein Passkey in Ihrem Chrome-Profil kann Passhold nicht entsperren; auf manchen Macs gilt das auch für den iCloud-Schlüsselbund.',
  'device.whereMacEdge':
    'Wenn Edge fragt, wo der Passkey gespeichert werden soll, wählen Sie einen Ort, an dem er auch auf Ihren anderen Geräten verfügbar ist. Nicht jeder Ort kann Passhold entsperren: Kann der gewählte es nicht, sagt Passhold das, und nichts wird geändert.',
  'device.unavailable': 'Hier nicht verfügbar',
  'device.unavailableBody':
    'Dieser Browser hat keine Fingerabdruck-, Gesichts- oder Bildschirmsperre gefunden, die Passhold nutzen kann. Die PIN funktioniert überall.',
  'device.unavailableRecovery':
    'Dieser Browser hat keine Fingerabdruck-, Gesichts- oder Bildschirmsperre gefunden, die Passhold nutzen kann. Deshalb öffnet sich dieser Tresor hier mit seinem Wiederherstellungsschlüssel. Legen Sie ein Hauptpasswort fest, wenn Sie lieber das eingeben möchten.',
  'device.opensWith': '{method} öffnet Passhold',
  'device.notHere': '{method} ist in diesem Browser nicht eingerichtet',
  'device.isTheWayIn':
    'Ohne Hauptpasswort öffnet sich Passhold so. Um das abzuschalten, legen Sie zuerst ein Hauptpasswort fest.',
  'device.setUpHere': 'Solange {method} hier nicht eingerichtet ist, fragt jede Entsperrung nach dem Wiederherstellungsschlüssel.',
  'device.setUp': 'Einrichten',
  'device.turnOff': 'Ausschalten',
  'device.save': '{method} einrichten',
  'keys.title': 'Mit einem Sicherheitsschlüssel entsperren',
  'keys.description': 'Ein USB-Schlüssel, den Sie einstecken: eine weitere Möglichkeit hinein, die auch nach einem Neustart des Browsers funktioniert.',
  'keys.method': 'Ihr Sicherheitsschlüssel',
  'keys.on': { one: '{count} Schlüssel eingerichtet', other: '{count} Schlüssel eingerichtet' },
  'keys.off': 'Kein Schlüssel eingerichtet',
  'keys.body':
    'Stecken Sie den Schlüssel ein, geben Sie seine PIN ein und berühren Sie ihn, dann öffnet sich Passhold – nur auf diesem Computer. Wer den Schlüssel hat und seine PIN kennt, kann Passhold hier öffnen. Bewahren Sie ihn deshalb wie einen Hausschlüssel auf. Geht er verloren, entfernen Sie ihn hier: Ihre anderen Wege hinein funktionieren weiter.',
  'keys.add': 'Einen Schlüssel hinzufügen',
  'keys.save': 'Diesen Schlüssel hinzufügen',
  'keys.one': 'Sicherheitsschlüssel',
  'keys.added': 'Hinzugefügt am {date}',
  'keys.remove': 'Entfernen',
  'pin.title': 'Mit einer PIN entsperren',
  'pinOffer.title': 'Öffnen Sie Passhold schneller mit einer PIN',
  'pinOffer.body':
    'Geben Sie jedes Mal, wenn Passhold sich sperrt, ein paar Ziffern statt Ihres Passworts ein, bis der Browser geschlossen wird. Nach dem nächsten Start des Browsers einmal Ihr Passwort.',
  'pinOffer.later': 'Sie können sie jederzeit in den Einstellungen unter Sicherheit einrichten oder ausschalten.',
  'pin.description': 'Für das vielfache Sperren von Passhold am Tag, während Sie am selben Browser sitzen.',
  'pin.on': 'Ein',
  'pin.off': 'Aus',
  'pin.bodyRecovery':
    'Funktioniert nur, solange der Browser geöffnet bleibt, und nur bei fünf falschen Versuchen: Danach oder nach einem Neustart werden das Gerät oder der Wiederherstellungsschlüssel benötigt. Nichts, was die PIN öffnet, wird auf der Festplatte gespeichert.',
  'pin.body':
    'Funktioniert nur, solange der Browser geöffnet bleibt, und nur bei fünf falschen Versuchen: Danach oder nach einem Neustart wird das Hauptpasswort benötigt. Nichts, was die PIN öffnet, wird auf der Festplatte gespeichert.',
  'pin.setUp': 'PIN einrichten',
  'pin.change': 'Ändern',
  'pin.turnOff': 'Ausschalten',
  'pin.new': 'PIN, 6 bis 12 Ziffern',
  'pin.again': 'Noch einmal eingeben',
  'pin.save': 'PIN speichern',

  'general.description': 'Wie sich Passhold auf Websites verhält und wie es aussieht.',
  'general.filling': 'Ausfüllen und Speichern',
  'general.appearance': 'Sprache und Darstellung',
  'settings.autoSuggest': 'Vorschläge anzeigen, wenn Sie ein Anmelde-, Karten- oder Adressfeld anklicken',
  'settings.autoSuggestBody':
    'Ihre Anmeldungen für die Website, ein starkes Passwort auf einem Registrierungsformular, Ihre Karten und Adressen beim Bezahlen. Nichts wird ausgefüllt, bis Sie es auswählen.',

  'trash.description': 'Anmeldungen, Karten, Adressen und Notizen warten hier, bis Sie sie wiederherstellen oder endgültig löschen.',
  'trash.sharedDescription': 'Mit der Familie geteilt: Jeder darin kann diese wiederherstellen. Endgültig gelöscht, sind sie für alle weg.',
  'trash.sharedMember':
    'Mit der Familie geteilt: Sie können diese wiederherstellen. Nur ein Organisator/eine Organisatorin der Familie löscht sie endgültig.',
  'settings.autoLock': 'Sperren nach',
  'settings.autoLock.never': 'Nur wenn der Browser geschlossen wird',
  'settings.autoLock.minutes': { one: '{count} Minute', other: '{count} Minuten' },
  'settings.autoLock.hours': { one: '{count} Stunde', other: '{count} Stunden' },
  'settings.lockWithSystem': 'Sperren, wenn der Computer gesperrt wird oder in den Ruhezustand geht',
  'settings.clipboard': 'Kopierte Passwörter löschen nach',
  'settings.clipboard.never': 'Nie',
  'settings.clipboard.seconds': { one: '{count} Sekunde', other: '{count} Sekunden' },
  'settings.clipboard.minutes': { one: '{count} Minute', other: '{count} Minuten' },
  'settings.inlineButton': 'Die Passhold-Schaltfläche in Anmelde-, Karten- und Adressfeldern anzeigen',
  'settings.offerToSave': 'Anmeldungen beim Anmelden zum Speichern anbieten',
  'settings.offerToSaveCards': 'Karten und Adressen beim Bezahlen zum Speichern anbieten',
  'settings.offerToSaveCardsBody':
    'Eine Karte nur von einer sicheren (https-)Seite, und nur eine, deren Nummer gültig ist. Sie wird mit ihren letzten vier Ziffern angezeigt, nie mit ihrer Nummer oder ihrem Code.',
  'settings.passkeys': 'Passkeys speichern und verwenden',
  'settings.passkeysBody':
    'Bietet eine Website einen Passkey an, bewahrt Passhold ihn bei Ihren Anmeldungen auf und meldet Sie damit an. Ausgeschaltet bleiben Passkeys dem Browser überlassen.',
  'settings.language': 'Sprache',
  'settings.language.auto': 'Wie im Browser',
  'settings.theme': 'Darstellung',
  'settings.theme.system': 'Wie im System',
  'settings.theme.light': 'Hell',
  'settings.theme.dark': 'Dunkel',

  'settings.security': 'Hauptpasswort',
  'settings.securityBody': 'Wenn Sie es ändern, wird der Schlüssel zu Ihrem Tresor neu gesperrt; Ihre Anmeldungen bleiben, wie sie sind.',
  'settings.current': 'Aktuelles Hauptpasswort',
  'settings.new': 'Neues Hauptpasswort',
  'settings.confirm': 'Neues noch einmal eingeben',
  'settings.change': 'Hauptpasswort ändern',
  'settings.changeOpen': 'Ändern',
  'settings.changed': 'Hauptpasswort geändert.',

  'settings.backup': 'Sichern',
  'settings.backupBody':
    'Ihr ganzer Tresor in einer verschlüsselten Datei. Bewahren Sie sie an einem anderen Ort auf als diesem Computer – auf einem USB-Stick oder in Ihrem Cloud-Speicher –, damit der Verlust dieses Browsers nicht Ihre Anmeldungen kostet. Sie öffnet sich nur mit dem Hauptpasswort, das Sie beim Erstellen hatten.',
  'settings.backupBodyRecovery':
    'Ihr ganzer Tresor in einer verschlüsselten Datei. Bewahren Sie sie an einem anderen Ort auf als diesem Computer – auf einem USB-Stick oder in Ihrem Cloud-Speicher –, damit der Verlust dieses Browsers nicht Ihre Anmeldungen kostet. Sie öffnet sich mit Ihrem Wiederherstellungsschlüssel.',
  'settings.backupLast': 'Letzte Sicherung: {date}',
  'settings.backupNever': 'Noch keine Sicherung.',
  'settings.backupButton': 'Sicherung herunterladen',
  'settings.backupDone': 'In Ihren Downloads gespeichert. Verschieben Sie sie jetzt an einen Ort außerhalb dieses Computers.',

  'settings.restoreBackup': 'Aus einer Sicherung wiederherstellen',
  'settings.restoreBodyNew':
    'In diesem Browser gibt es noch keinen Tresor. Holen Sie Ihren aus einer Sicherungsdatei zurück – er öffnet sich mit dem Hauptpasswort, mit dem die Sicherung erstellt wurde – oder legen Sie über die Passhold-Schaltfläche in der Symbolleiste einen neuen an.',
  'settings.restoreBodyMerge':
    'Fügt dem Tresor hinzu, was eine Sicherung enthält. Hier wird nichts gelöscht: Hat beides dieselbe Anmeldung, bleibt die neuere Bearbeitung erhalten, und das andere Passwort wandert in deren Verlauf.',
  'settings.restoreChoose': 'Sicherungsdatei auswählen',
  'settings.restoreMade': 'Sicherung erstellt am {date}',
  'settings.restorePassword': 'Hauptpasswort der Sicherung',
  'settings.restoreRecoveryKey': 'Wiederherstellungsschlüssel der Sicherung',
  'settings.restoreButton': 'Wiederherstellen',
  'settings.restoreNew': {
    one: 'Tresor wiederhergestellt, mit {count} Eintrag.',
    other: 'Tresor wiederhergestellt, mit {count} Einträgen.',
  },
  'settings.restoreAdded': {
    one: '{count} Eintrag aus der Sicherung hinzugefügt.',
    other: '{count} Einträge aus der Sicherung hinzugefügt.',
  },
  'settings.restoreUpdated': {
    one: '{count} Eintrag hatte in der Sicherung eine neuere Bearbeitung.',
    other: '{count} Einträge hatten in der Sicherung eine neuere Bearbeitung.',
  },
  'settings.restoreNothing': 'Alles in der Sicherung ist bereits in diesem Tresor.',

  'settings.import': 'Importieren',
  'settings.importBody':
    'Bringen Sie Ihre Passwörter aus Chrome, Edge, Firefox, Safari, Apple Passwords, Bitwarden, 1Password, LastPass, KeePass, Dashlane, Proton Pass oder NordPass: Exportieren Sie sie dort als CSV-Datei und wählen Sie sie hier aus. Karten, Adressen und Notizen in der Datei kommen ebenfalls mit. Aus Bitwarden exportieren Sie als JSON (nicht verschlüsselt): Dessen CSV lässt Karten, Identitäten und Passkeys weg. Dashlane legt diese in eigenen Dateien ab: Wählen Sie jede nacheinander aus.',
  'settings.importChoose': 'Datei auswählen',
  'settings.importFound': 'Zum Importieren gefunden: {what}.',
  'settings.importLogins': { one: '{count} Anmeldung', other: '{count} Anmeldungen' },
  'settings.importPasskeys': { one: '{count} Passkey', other: '{count} Passkeys' },
  'settings.importCards': { one: '{count} Karte', other: '{count} Karten' },
  'settings.importAddresses': { one: '{count} Adresse', other: '{count} Adressen' },
  'settings.importNotes': { one: '{count} Notiz', other: '{count} Notizen' },
  'settings.importSkipped': {
    one: '{count} Eintrag enthält nichts, was Passhold speichert, und wird ausgelassen.',
    other: '{count} Einträge enthalten nichts, was Passhold speichert, und werden ausgelassen.',
  },
  'settings.importDuplicates': { one: '{count} ist bereits in Ihrem Tresor.', other: '{count} sind bereits in Ihrem Tresor.' },
  'settings.importConfirm': 'Importieren',
  'settings.importDone': 'Importiert: {what}.',
  'settings.importDelete': 'Löschen Sie jetzt die CSV-Datei: Sie enthält Ihre Passwörter im Klartext.',
  'settings.importNothing': 'Nichts Neues zum Importieren in dieser Datei.',
  'settings.importTwoFactor': {
    one: '{count} Anmeldung in dieser Datei hat einen Code für die Bestätigung in zwei Schritten (2FA). Passhold bewahrt keine 2FA-Codes auf: Übertragen Sie ihn in eine Authenticator-App, bevor Sie Ihren alten Passwortmanager löschen, sonst sperrt Sie das womöglich aus diesem Konto aus.',
    other: '{count} Anmeldungen in dieser Datei haben Codes für die Bestätigung in zwei Schritten (2FA). Passhold bewahrt keine 2FA-Codes auf: Übertragen Sie sie in eine Authenticator-App, bevor Sie Ihren alten Passwortmanager löschen, sonst sperren Sie sich womöglich aus diesen Konten aus.',
  },
  'settings.importAuthenticator': 'Keyrook Authenticator holen',
  'settings.importPasskeysLeft': {
    one: '{count} Passkey in dieser Datei kann nicht zu Passhold gelangen. Behalten Sie Ihren alten Passwortmanager, bis Sie sich auf andere Weise bei dieser Website angemeldet und in Passhold einen neuen Passkey erstellt haben.',
    other: '{count} Passkeys in dieser Datei können nicht zu Passhold gelangen. Behalten Sie Ihren alten Passwortmanager, bis Sie sich auf andere Weise bei diesen Websites angemeldet und in Passhold neue Passkeys erstellt haben.',
  },

  'settings.export': 'Exportieren',
  'settings.exportBody':
    'Eine CSV-Datei, die jeder Browser und jeder Passwortmanager lesen kann. Sie enthält Ihre Passwörter im Klartext: Behalten Sie sie nur so lange, wie Sie sie brauchen. Sie enthält nur Anmeldungen: Passkeys, eigene Felder, Ordner, Karten, Adressen und Notizen sind nicht darin. Eine Sicherung enthält alles.',
  'settings.exportButton': 'CSV exportieren',
  'settings.exportDone': 'Exportiert. Löschen Sie die Datei, sobald Sie damit fertig sind.',

  'settings.neverSave': 'Nie anbieten zu speichern bei',
  'settings.neverSaveEmpty': 'Keine Websites. Wählen Sie „Nie für diese Website“, wenn Passhold anbietet zu speichern, dann erscheint sie hier.',
  'settings.remove': 'Entfernen',

  'settings.trash': 'Papierkorb',
  'settings.trashEmpty': 'Der Papierkorb ist leer.',
  'settings.restore': 'Wiederherstellen',
  'settings.deleteForever': 'Endgültig löschen',
  'settings.emptyTrash': 'Papierkorb leeren',
  'settings.emptyTrashConfirm': 'Alles im Papierkorb endgültig löschen?',

  'settings.danger': 'Tresor entfernen',
  'settings.dangerBody':
    'Löscht den Tresor aus diesem Browser. Jede Anmeldung darin ist endgültig weg – laden Sie zuerst eine Sicherung herunter, wenn Sie sie behalten möchten.',
  'settings.dangerType': 'Zur Bestätigung {word} eingeben',
  'settings.dangerWord': 'löschen',
  'settings.dangerButton': 'Tresor entfernen',

  'settings.about': 'Passhold {version} · von Keyrook',

  // Errors
  'error.noWorker': 'Passhold hat nicht geantwortet. Schließen Sie dies und versuchen Sie es erneut.',
  'error.wrongPassword': 'Das ist nicht das Hauptpasswort.',
  'error.passwordTooShort': 'Verwenden Sie mindestens {min} Zeichen.',
  'error.vaultCorrupt': 'Der Tresor auf diesem Gerät ist beschädigt und kann nicht geöffnet werden.',
  'error.vaultTooNew': 'Dieser Tresor wurde von einer neueren Passhold-Version erstellt. Aktualisieren Sie Passhold, um ihn zu öffnen.',
  'error.itemNotFound': 'Das ist nicht mehr im Tresor.',
  'error.familyOrganiserOnly': 'Nur ein Organisator/eine Organisatorin der Familie kann den Papierkorb dieses Tresors leeren.',
  'error.familyGone': 'Diese Familie ist nicht mehr hier. Synchronisieren Sie und sehen Sie dann erneut nach.',
  'error.familyNotOpen': 'Passhold kann diese Familie in diesem Browser noch nicht öffnen. Synchronisieren Sie und versuchen Sie es erneut.',
  'error.itemInvalid': 'Das kann so nicht gespeichert werden.',
  'error.importEmpty': 'Diese Datei enthält nichts zum Importieren.',
  'error.importTooLarge': 'Diese Datei ist zu groß zum Importieren.',
  'error.importUnknownFormat': 'Diese Datei sieht nicht wie ein Passwort-Export aus.',
  'error.importEncrypted':
    'Dieser Bitwarden-Export ist verschlüsselt, und Passhold kann ihn nicht öffnen. Exportieren Sie in Bitwarden erneut als „.json“, nicht als „.json (Encrypted)“, und wählen Sie dann diese Datei.',
  'error.backupInvalid': 'Diese Datei ist keine Passhold-Sicherung oder sie ist beschädigt.',
  'error.backupWrongPassword': 'Das ist nicht das Hauptpasswort, mit dem diese Sicherung erstellt wurde.',
  'error.backupWrongRecoveryKey': 'Das ist nicht der Wiederherstellungsschlüssel, mit dem diese Sicherung erstellt wurde.',
  'error.noRecoveryKey': 'Dieser Tresor hat keinen Wiederherstellungsschlüssel zum Anzeigen: Er öffnet sich mit einem Hauptpasswort.',
  'error.wrongRecoveryKey': 'Das ist nicht der Wiederherstellungsschlüssel.',
  'error.deviceNeeded':
    'Ein Tresor ohne Hauptpasswort öffnet sich mit der Entsperrung dieses Geräts: Richten Sie sie zuerst ein. Sie bleibt, bis ein Hauptpasswort festgelegt ist.',
  'error.accountOffline': 'Keyrook war nicht erreichbar. Prüfen Sie die Verbindung und versuchen Sie es erneut.',
  'error.accountWrong':
    'Falsche E-Mail-Adresse oder falsches Passwort. Ein mit Google oder GitHub erstelltes Konto meldet sich stattdessen über dessen Schaltfläche an.',
  'error.accountSignedOut': 'Keyrook hat diesen Browser abgemeldet. Melden Sie sich erneut an.',
  'error.accountBusy': {
    one: 'Zu viele Versuche. Warten Sie {count} Sekunde und versuchen Sie es erneut.',
    other: 'Zu viele Versuche. Warten Sie {count} Sekunden und versuchen Sie es erneut.',
  },
  'error.accountFailed': 'Keyrook konnte das gerade nicht tun. Versuchen Sie es später erneut.',
  'error.accountAlready': 'Dieser Tresor ist bereits bei einem Keyrook-Konto angemeldet.',
  'error.accountNone': 'Dieser Tresor ist nicht bei einem Keyrook-Konto angemeldet.',
  'error.accountKdfRefused': 'Keyrook verlangte einen schwächeren Schlüssel, als Passhold annimmt, deshalb wurde die Anmeldung abgebrochen.',
  'error.accountKeyWrong': 'Der Schlüssel des Kontos ließ sich mit diesem Passwort nicht öffnen.',
  'error.accountCode': 'Dieser Code ist nicht richtig oder abgelaufen. Prüfen Sie die E-Mail oder fordern Sie einen neuen Code an.',
  'error.accountMail': 'Keyrook konnte die E-Mail gerade nicht senden. Versuchen Sie es in einer Minute erneut.',
  'error.providerDenied': 'Die Anmeldung wurde abgebrochen.',
  'error.providerFailed': 'Google oder GitHub konnte Sie gerade nicht anmelden. Versuchen Sie es erneut.',
  'error.providerExpired': 'Diese Anmeldung ist abgelaufen. Beginnen Sie erneut.',
  'error.providerNotOwner':
    'Das ist nicht das Konto, mit dem sich dieses Keyrook-Konto anmeldet. Melden Sie sich mit dem an, den Sie für Keyrook verwenden.',
  'error.signOutUnsent': {
    one: 'Ein Eintrag hat Ihr Keyrook-Konto noch nicht erreicht, deshalb wurde nichts entfernt. Prüfen Sie Ihre Verbindung oder melden Sie sich erneut an und dann ab.',
    other: '{count} Einträge haben Ihr Keyrook-Konto noch nicht erreicht, deshalb wurde nichts entfernt. Prüfen Sie Ihre Verbindung oder melden Sie sich erneut an und dann ab.',
  },
  'error.providerOtherProvider':
    'Diese E-Mail-Adresse hat bereits ein Keyrook-Konto, das sich mit dem anderen von Google und GitHub anmeldet. Melden Sie sich mit diesem an.',
  'error.providerHasPassword':
    'Diese E-Mail-Adresse hat bereits ein Keyrook-Konto mit Passwort. Melden Sie sich hier mit Ihrer E-Mail-Adresse und Ihrem Passwort an – oder fügen Sie es, um sich auch mit Google oder GitHub anzumelden, auf account.keyrook.com hinzu, dort mit Ihrem Passwort angemeldet.',
  'error.providerEmailTaken':
    'Diese E-Mail-Adresse hat bereits ein Keyrook-Konto, das sich auf andere Weise anmeldet. Melden Sie sich so an – oder fügen Sie dieses auf account.keyrook.com hinzu, dort auf die Weise angemeldet, auf die es jetzt angemeldet ist.',
  'error.pairingWrongKey':
    'Was zurückkam, ist nicht der Schlüssel dieses Kontos, deshalb wurde es abgelehnt. Fragen Sie erneut und lassen Sie nur von einem Browser hinein, den Sie kennen.',
  'error.pairingRefused': 'Das kam nicht von dem Browser, dessen Code Sie geprüft haben, deshalb wurde es abgelehnt. Fragen Sie erneut.',
  'error.pairingEnded': 'Diese Anfrage ist beendet. Fragen Sie erneut vom neuen Browser aus.',
  'error.passkeyWrong': 'Dieser Passkey öffnet dieses Konto nicht. Versuchen Sie einen anderen Weg hinein.',
  'error.joinExpired': 'Diese Anmeldung hat zu lange gedauert. Melden Sie sich erneut an.',
  'error.accountPasswordWrong': 'Das ist nicht das Konto-Passwort.',
  'error.accountNoKit': 'Passhold hat den Wiederherstellungsschlüssel dieses Kontos nicht.',
  'error.accountKitRace': 'Eine andere App hat gerade den Wiederherstellungsschlüssel des Kontos geändert. Synchronisieren Sie und versuchen Sie es erneut.',
  'error.accountKitShape': 'Das sieht nicht nach einem Wiederherstellungsschlüssel aus: Er besteht aus 32 Buchstaben und Ziffern.',
  'error.accountKitWrong': 'Dieser Wiederherstellungsschlüssel gehört zu keinem Konto mit dieser E-Mail-Adresse.',
  'error.accountKitNotThis': 'Das ist nicht der Wiederherstellungsschlüssel dieses Kontos. Sehen Sie sich das Gespeicherte noch einmal an.',
  'error.accountPasswordWeak':
    'Für ein Konto zu leicht zu erraten: Verwenden Sie ein längeres Passwort mit einer Mischung aus Buchstaben, Ziffern und Symbolen oder vier bis fünf unzusammenhängende Wörter.',
  'error.accountBoxWrong':
    'Der Schlüssel von Passhold in diesem Konto ließ sich nicht öffnen. Melden Sie sich erneut an; wenn es immer noch nicht geht, beginnen Sie das Konto neu.',
  'error.accountCodeWait': {
    one: 'Vor Kurzem wurde ein Code gesendet. Sie können in {count} Sekunde einen weiteren anfordern.',
    other: 'Vor Kurzem wurde ein Code gesendet. Sie können in {count} Sekunden einen weiteren anfordern.',
  },
  'error.accountSignUpKeys': 'Keyrook verlangte den eigenen Schlüssel von Passhold, und es wurde keiner gesendet. Aktualisieren Sie Passhold und versuchen Sie es erneut.',
  'error.accountIdTaken': 'Das Konto konnte gerade nicht angelegt werden. Fordern Sie einen neuen Code an und versuchen Sie es erneut.',
  'error.accountNoRoot': 'Dieses Konto hat noch keinen Schlüssel, den ein Wiederherstellungsschlüssel öffnen kann. Melden Sie sich erneut mit dem Passwort an.',
  'error.accountRootNotHeld':
    'Dieser Computer konnte nicht zeigen, dass er den Schlüssel des Kontos hat. Melden Sie sich erneut mit dem Passwort oder dem Wiederherstellungsschlüssel an.',
  'error.accountRootChanged':
    'Die Schlüssel dieses Kontos wurden auf einem anderen Computer ersetzt. Melden Sie sich auf einem Computer an, auf dem Passhold noch angemeldet ist, oder beginnen Sie das Konto neu.',
  'error.accountKeyReplaced': 'Der Schlüssel von Passhold in diesem Konto wurde auf einem anderen Computer ersetzt. Melden Sie sich erneut an.',
  'error.accountSessionStolen': 'Dieser Computer wurde abgemeldet, weil seine Sitzung von anderswo verwendet wurde. Melden Sie sich erneut an.',
  'error.accountOld':
    'Dieses Konto wurde mit Google oder GitHub erstellt, bevor jede Keyrook-App einen eigenen Schlüssel hatte, und nichts darin öffnet bisher Passhold. Beginnen Sie das Konto mit seiner E-Mail-Adresse neu, um ihm einen zu geben.',
  'error.pairingBusy': 'Zu viele Browser warten darauf, diesem Konto beizutreten. Versuchen Sie es in ein paar Minuten erneut.',
  'error.startOverExpired': 'Das ist abgelaufen. Fordern Sie einen neuen Code an und beginnen Sie erneut.',
  'error.startOverTooOften': 'Dieses Konto hat in letzter Zeit zu oft neu begonnen. Versuchen Sie es nach dem {day} erneut.',
  'error.startOverWaiting': 'Dieses Konto beginnt am {day} neu. Ein Browser, der noch darin angemeldet ist, kann das abbrechen.',
  'error.startOverUpdate': 'Keyrook wartet jetzt eine Woche, bevor ein Konto neu begonnen wird. Aktualisieren Sie Passhold, um das zu beantragen.',
  'error.passkeyFailed': 'Dieser Passkey konnte nicht geprüft werden. Versuchen Sie es erneut.',
  'error.passkeyNotYou': 'Dieser Passkey hat nicht bestätigt, dass Sie es sind. Versuchen Sie es erneut und entsperren Sie ihn wie verlangt.',
  'error.passkeyUnknown':
    'Dieser Passkey gehört zu keinem Keyrook-Konto. Er wurde vielleicht entfernt: Melden Sie sich mit dem Passwort oder mit Google oder GitHub an.',
  'error.passkeyExpired': 'Diese Passkey-Anfrage ist beendet. Versuchen Sie es erneut.',
  'error.passkeyNotOffered': 'Keyrook bietet hier noch keine Passkeys an.',
  'error.passkeyNoUnlock': 'Mit diesem Passkey melden Sie sich an, aber er ist noch nicht so eingestellt, dass er Ihr Konto entsperrt. Wählen Sie auf account.keyrook.com unter „Passkeys“ daneben „Let it unlock“ und versuchen Sie es erneut. Oder melden Sie sich mit dem Passwort an, oder mit Google oder GitHub.',
  'error.passkeyNoPrf': 'Mit diesem Passkey melden Sie sich bei account.keyrook.com an, aber dort, wo er gespeichert ist, kann er Ihr Konto nicht entsperren – der iCloud-Schlüsselbund vor macOS 15 zum Beispiel nicht. Fügen Sie auf account.keyrook.com unter „Passkeys“ einen hinzu, der an einem geeigneten Ort gespeichert ist, etwa einen Sicherheitsschlüssel, und prüfen Sie, ob dort „Unlocks your data“ steht. Bis dahin melden Sie sich mit dem Passwort an oder mit Google oder GitHub.',
  'error.passkeyPermission':
    'Passhold braucht die Erlaubnis von Chrome, die Passkeys von account.keyrook.com zu verwenden. Wählen Sie den Passkey erneut aus und erlauben Sie es.',
  'error.passkeyPermissionEdge':
    'Passhold braucht die Erlaubnis von Edge, die Passkeys von account.keyrook.com zu verwenden. Wählen Sie den Passkey erneut aus und erlauben Sie es.',
  'error.passkeyCancelled': 'Es wurde kein Passkey verwendet. Versuchen Sie es erneut oder melden Sie sich auf andere Weise an.',
  'error.secondStepNeeded': 'Ihr Konto verlangt einen zweiten Schritt: Geben Sie auch den Code aus Ihrer Authenticator-App ein.',
  'error.secondStepWrong': 'Dieser Code ist nicht richtig. Geben Sie den ein, den Ihre Authenticator-App jetzt zeigt, oder Ihren Wiederherstellungsschlüssel.',
  'error.signInExpired': 'Diese Anmeldung ist abgelaufen. Melden Sie sich erneut an.',
  'error.secondStepUpdate': 'Ihr Konto verlangt für die Anmeldung einen zweiten Schritt. Aktualisieren Sie Passhold, um sich anzumelden.',
  'error.secondStepAsked': 'Ihr Konto verlangt einen zweiten Schritt: Geben Sie den Code aus Ihrer Authenticator-App ein.',
  'error.secondStepTaken':
    'Das ist der Code, mit dem Sie sich angemeldet haben, und jeder Code funktioniert nur einmal. Warten Sie, bis Ihre Authenticator-App einen neuen anzeigt.',
  'error.kitDraftGone': 'Der neue Wiederherstellungsschlüssel wurde nicht rechtzeitig festgelegt, und nichts hat sich geändert. Erstellen Sie erneut einen neuen.',
  'error.archiveWrong': 'Das öffnet nicht, was aufbewahrt wurde.',
  'error.archiveGone': 'Das wird nicht mehr aufbewahrt.',
  'error.archiveDeleteRefused': 'Nur das alte Passwort oder der alte Wiederherstellungsschlüssel kann löschen, was aufbewahrt wurde, bevor es abläuft.',
  'error.accountNeedsRoot':
    'Dieses Konto wurde in Keyrook Authenticator erstellt, bevor jede Keyrook-App einen eigenen Schlüssel hatte. Passhold kann ihm jetzt einen geben; in Authenticator ändert sich nichts.',
  'error.accountServerWrong':
    'Der Server von Keyrook hat mit etwas geantwortet, zu dem die Schlüssel dieses Kontos nicht passen, deshalb hat Passhold angehalten. Versuchen Sie es später erneut.',
  'error.startOverNeedsPassword': 'Dieses Konto hat ein Passwort: Wählen Sie ein neues, um es neu zu beginnen.',
  'error.pinInvalid': 'Eine PIN hat 6 bis 12 Ziffern.',
  'error.wrongPin': 'Das ist nicht die PIN.',
  'error.wrongPinLeft': {
    one: 'Das ist nicht die PIN. Noch {count} Versuch.',
    other: 'Das ist nicht die PIN. Noch {count} Versuche.',
  },
  'error.pinLockedOut': 'Zu viele falsche PINs. Entsperren Sie auf eine andere Weise; danach funktioniert die PIN wieder.',
  'error.pinUnavailable': 'Die PIN funktioniert nur, solange der Browser geöffnet bleibt. Entsperren Sie auf eine andere Weise; danach funktioniert die PIN wieder.',
  'error.deviceGone': 'Das Entsperren mit diesem Gerät ist nicht mehr eingerichtet. Entsperren Sie auf eine andere Weise.',
  'error.deviceKeyWrong': 'Das hat Passhold nicht geöffnet. Entsperren Sie auf eine andere Weise und richten Sie dann die Geräteentsperrung erneut ein.',
  'error.deviceUnsupported':
    'Wo dieser Passkey gespeichert wurde, kann Passhold keinen Schlüssel zum Öffnen geben. Versuchen Sie es erneut und speichern Sie ihn im Google Password Manager – oder verwenden Sie die PIN.',
  'error.deviceUnsupportedEdge':
    'Wo dieser Passkey gespeichert wurde, kann Passhold keinen Schlüssel zum Öffnen geben. Versuchen Sie es erneut und speichern Sie ihn an einem anderen Ort – oder verwenden Sie die PIN.',
  'error.deviceCancelled': 'Nichts wurde entsperrt: Es wurde abgebrochen oder hat zu lange gedauert.',
  'error.keyUnsupported':
    'Dieser Schlüssel kann Passhold nicht geben, was es zum Öffnen braucht. Die meisten FIDO2-Schlüssel können das; ein Schlüssel, der nur für die Bestätigung in zwei Schritten (U2F) gemacht ist, kann es nicht.',
  'error.keyAlreadyAdded': 'Dieser Schlüssel ist hier bereits eingerichtet.',
  'error.keyGone': 'Dieser Sicherheitsschlüssel ist hier nicht mehr eingerichtet. Entsperren Sie auf eine andere Weise.',
  'error.keyWrong': 'Dieser Schlüssel hat Passhold nicht geöffnet. Entsperren Sie auf eine andere Weise, entfernen Sie dann den Schlüssel und fügen Sie ihn erneut hinzu.',
  'error.kdfUnsupported': 'Die Einstellungen des Tresors sind nicht welche, die Passhold annimmt.',
  'error.locked': 'Passhold ist gesperrt.',
  'error.noVault': 'Es gibt noch keinen Tresor.',
  'error.vaultExists': 'Ein Tresor existiert bereits.',
  'error.notOnPage': 'Diese Anmeldung gehört nicht zur Seite in diesem Tab.',
  'error.expired': 'Das ist abgelaufen. Versuchen Sie es erneut.',
  'error.noFields': 'Auf dieser Seite gibt es nichts, was Passhold ausfüllen kann.',
  'error.cardInsecure': 'Passhold füllt eine Karte nur auf einer sicheren (https-)Seite aus.',
  'error.unknown': 'Etwas ist schiefgelaufen: {detail}',
};
