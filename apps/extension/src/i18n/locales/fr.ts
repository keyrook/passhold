import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'par Keyrook',

  // Common
  'common.cancel': 'Annuler',
  'common.close': 'Fermer',
  'common.save': 'Enregistrer',
  'common.edit': 'Modifier',
  'common.back': 'Retour',
  'common.show': 'Afficher',
  'common.hide': 'Masquer',
  'common.notNow': 'Pas maintenant',

  // Setup
  'setup.title': 'Créer votre coffre-fort',
  'setup.body':
    'Passhold garde vos mots de passe chiffrés sur cet appareil. Un mot de passe principal les ouvre tous : choisissez-en un que vous retiendrez et que vous n’utiliserez nulle part ailleurs.',
  'setup.password': 'Mot de passe principal',
  'setup.confirm': 'Saisissez-le à nouveau',
  'setup.mismatch': 'Les deux mots de passe ne sont pas identiques.',
  'setup.tooShort': 'Utilisez au moins {min} caractères.',
  'setup.understand':
    'Je comprends que personne – ni Passhold, ni Keyrook – ne peut récupérer mon coffre-fort si j’oublie ce mot de passe.',
  'setup.create': 'Créer le coffre-fort',
  'setup.creating': 'Création…',
  'setup.restore': 'Restaurer depuis une sauvegarde',

  // Strength
  'setup.deviceBody':
    'Passhold garde vos mots de passe chiffrés sur cet appareil, et {method} les ouvre – pas de mot de passe principal à inventer ni à retenir. Vous recevez aussi une clé de récupération, pour le jour où {method} ne le pourra plus.',
  'setup.deviceWhereMac': 'Quand Chrome vous demande où enregistrer la clé d’accès, choisissez Google Password Manager.',
  'setup.deviceWhereMacEdge':
    'Quand Edge vous demande où enregistrer la clé d’accès, choisissez un emplacement qui la garde aussi sur vos autres appareils. Tous les emplacements ne peuvent pas déverrouiller Passhold : si celui-ci ne le peut pas, Passhold le dit.',
  'setup.createWithDevice': 'Créer avec {method}',
  'setup.usePassword': 'Utiliser un mot de passe principal à la place',
  'setup.useDevice': 'Utiliser {method} à la place',
  'setup.signIn': 'Se connecter ou créer un compte Keyrook',

  'welcome.title': 'Vos mots de passe, sur chaque ordinateur',
  'welcome.body':
    'Connectez-vous une fois. Passhold s’ouvre avec votre empreinte, remplit pour vous, et vos connexions sont partout où vous vous connectez.',
  'welcome.email': 'Utiliser une adresse e-mail',
  'gate.touchTitle': 'L’ouvrir d’un toucher',
  'gate.touchBody': 'Touch ID ou Windows Hello ouvre Passhold. Pas de mot de passe principal à inventer et à retenir.',
  'gate.everywhereTitle': 'Sur chaque ordinateur que vous utilisez',
  'gate.everywhereBody': 'Connectez-vous sur un autre ordinateur, et vos mots de passe et clés d’accès y sont.',
  'gate.privateTitle': 'Vous seul pouvez les lire',
  'gate.privateBody':
    'Chiffrés sur cet ordinateur avant tout envoi. Keyrook ne peut lire ni vos mots de passe, ni les sites auxquels ils correspondent.',
  'welcome.note':
    'Chiffrés d’abord sur cet ordinateur : Keyrook ne peut lire ni vos mots de passe, ni les sites auxquels ils correspondent.',
  'connect.title': 'Activer votre compte Keyrook',
  'connect.body': 'Vos connexions sur chaque ordinateur que vous utilisez – et une sauvegarde si celui-ci est perdu.',
  'connect.email': 'E-mail',
  'kitCheck.title': 'Vérifiez votre clé de récupération du compte',
  'kitCheck.body': 'Saisissez-la une fois, pour être sûr de l’avoir encore le jour où vous en aurez besoin.',
  'accountPasskey.button': 'Continuer avec une clé d’accès',
  'accountPasskey.working': 'En attente de la clé d’accès…',
  'accountPasskey.hint':
    'Une que vous avez ajoutée sur account.keyrook.com. La première fois, {browser} demande l’autorisation pour Passhold de l’utiliser.',
  'accountPasskey.openPasskeys': 'Ouvrir « Passkeys » sur account.keyrook.com',
  'join.title': 'Se connecter à Keyrook',
  'join.body': 'Un seul compte Keyrook pour Passhold et Keyrook Authenticator. Vos connexions arrivent dans ce navigateur depuis le compte.',
  'join.createTitle': 'Créer un compte Keyrook',
  'join.createBody':
    'Un compte pour Passhold et Keyrook Authenticator : vos connexions, chiffrées d’abord sur cet appareil, sur chaque ordinateur où vous vous connectez.',
  'join.lockTitle': 'Connecté en tant que {email}',
  'join.lockBodyDevice': 'Dernière étape : Passhold s’ouvre sur cet ordinateur avec {method}. Vos connexions arrivent dès que c’est configuré.',
  'join.cancel': 'Utiliser un autre compte',
  'join.lockBodyCode': 'Dernière étape : un code qui ouvre Passhold sur cet ordinateur. Vos connexions arrivent dès que c’est configuré.',
  'join.opening': 'Ouverture de Passhold…',
  'setup.useAccountPassword': 'Utiliser plutôt mon mot de passe de compte',
  'setup.useCode': 'Utiliser plutôt un code pour cet ordinateur',
  'security.accountPasswordTitle': 'S’ouvre avec le mot de passe de votre compte Keyrook',
  'security.accountPasswordBody':
    'Un seul mot de passe pour les deux. Quand il change, Passhold ici le suit à votre prochaine connexion.',

  'recovery.title': 'Enregistrez votre clé de récupération',
  'recovery.body':
    'Si cet appareil est perdu, ou si son déverrouillage ne fonctionne plus, cette clé est le moyen de retrouver votre coffre-fort et ses sauvegardes. Vous pouvez la revoir dans les paramètres tant que Passhold s’ouvre encore – gardez-la donc aussi ailleurs : imprimée, sur votre téléphone, ou dans un fichier loin de cet ordinateur.',
  'recovery.download': 'Télécharger',
  'recovery.copy': 'Copier',
  'recovery.copied': 'Copié',
  'recovery.print': 'Imprimer',
  'recovery.qr': 'Afficher le code QR',
  'recovery.qrHide': 'Masquer le code QR',
  'recovery.qrLabel': 'La clé de récupération sous forme de code QR',
  'recovery.qrHint': 'Pointez l’appareil photo de votre téléphone dessus et enregistrez le texte dans une note, ou prenez-en une photo.',
  'recovery.show': 'Afficher',

  'kit.title': 'Kit de récupération Passhold',
  'kit.made': 'Créé le {date}',
  'kit.keyLabel': 'Clé de récupération',
  'kit.whenTitle': 'Quand Passhold ne s’ouvre plus',
  'kit.sameDevice':
    'Sur cet ordinateur : quand Passhold demande à se déverrouiller, choisissez « Utiliser la clé de récupération à la place » et saisissez la clé.',
  'kit.newDevice':
    'Sur un nouvel ordinateur : installez Passhold, choisissez « Restaurer depuis une sauvegarde », sélectionnez votre sauvegarde la plus récente et saisissez la clé. Sans sauvegarde, il n’y a rien à restaurer : gardez-en une.',
  'kit.keep': 'Gardez cette feuille en lieu sûr, loin de votre ordinateur. Quiconque la détient avec une copie de votre coffre-fort peut l’ouvrir.',
  'recovery.fileTitle': 'Clé de récupération Passhold',
  'recovery.fileMade': 'Créée le {date}',
  'recovery.fileBody':
    'Cette clé ouvre votre coffre-fort Passhold et ses sauvegardes quand votre appareil ne le peut pas. Quiconque la détient et possède une copie de votre coffre-fort peut l’ouvrir : gardez-la en sécurité, et pas sur le même ordinateur.',
  'recovery.pending': 'Clé de récupération non rangée',
  'recovery.keptState': 'Clé de récupération rangée',
  'recovery.rowBody':
    'Ouvre votre coffre-fort et ses sauvegardes quand {method} ne le peut pas. Une nouvelle empêche l’ancienne d’ouvrir ce coffre-fort ; les sauvegardes faites avant s’ouvrent encore avec l’ancienne.',
  'recovery.makeNew': 'En créer une nouvelle',
  'recovery.savedIt': 'Je l’ai enregistrée',
  'recovery.checkTitle': 'Vérifiez que vous l’avez enregistrée',
  'recovery.checkBody':
    'Saisissez deux groupes de la clé d’après ce que vous avez enregistré – le fichier, le papier ou la photo. Les groupes sont les blocs de quatre caractères entre les tirets, comptés depuis la gauche.',
  'recovery.group': 'Groupe {position}',
  'recovery.check': 'Vérifier',
  'recovery.checkWrong':
    'Ce n’est pas ce que dit votre clé. Relisez ce que vous avez enregistré, ou affichez de nouveau la clé et enregistrez-la maintenant.',
  'recovery.showAgain': 'Afficher de nouveau la clé',
  'recovery.covered': 'Votre compte Keyrook est le moyen de retour',
  'recovery.coveredBody':
    'Si {method} cesse d’ouvrir Passhold ici, supprimez le coffre-fort et reconnectez-vous à votre compte : chaque connexion revient. La clé de récupération propre à ce coffre-fort reste visible ici.',

  'proof.recoveryKey': 'Clé de récupération',
  'proof.withDevice': 'Vous confirmerez avec {method}.',
  'proof.useDevice': 'Confirmer avec {method} à la place',
  'proof.usePassword': 'Saisir le mot de passe principal à la place',
  'proof.useAccountPassword': 'Saisir le mot de passe du compte à la place',
  'proof.useCode': 'Saisir le code à la place',
  'proof.useRecoveryKey': 'Saisir la clé de récupération à la place',
  'strength.0': 'Très faible',
  'strength.1': 'Faible',
  'strength.2': 'Moyen',
  'strength.3': 'Fort',
  'strength.4': 'Très fort',
  'strength.short': 'Plus c’est long, mieux c’est : visez 14 caractères ou plus.',
  'strength.digitsOnly': 'Des chiffres seuls sont vite devinés.',
  'strength.repeats': 'Évitez le même caractère répété.',

  // Unlock
  'unlock.title': 'Passhold est verrouillé',
  'unlock.body': 'Saisissez votre mot de passe principal.',
  'unlock.password': 'Mot de passe principal',
  'unlock.submit': 'Déverrouiller',
  'unlock.pinBody': 'Saisissez votre PIN.',
  'unlock.pin': 'PIN',
  'unlock.usePassword': 'Utiliser plutôt le mot de passe principal',
  'unlock.usePin': 'Utiliser plutôt le PIN',
  'unlock.recoveryBody': 'Saisissez votre clé de récupération.',
  'unlock.deviceBody': 'Utilisez {method}, ou saisissez ci-dessous.',
  'unlock.recoveryKey': 'Clé de récupération',
  'unlock.useRecoveryKey': 'Utiliser plutôt la clé de récupération',
  'unlock.lost': 'Impossible d’entrer ?',
  'unlock.forgotBodyRecovery':
    'Votre clé de récupération ouvre le coffre-fort quand l’appareil ne le peut pas. Sans elle et sans l’appareil, personne – ni Passhold, ni Keyrook – ne peut ouvrir le coffre-fort : vous pouvez seulement le supprimer dans les paramètres et recommencer.',
  'unlock.bodyAccount': 'Saisissez le mot de passe de votre compte Keyrook.',
  'unlock.accountPassword': 'Mot de passe du compte Keyrook',
  'unlock.useAccountPassword': 'Utiliser plutôt le mot de passe du compte',
  'unlock.forgotBodyAccount':
    'C’est le mot de passe de votre compte Keyrook : s’il a été changé ailleurs, utilisez le nouveau. Oublié pour de bon ? Supprimez ce coffre-fort dans les paramètres et reconnectez-vous – avec la clé de récupération si vous avez besoin d’un nouveau mot de passe – et chaque connexion revient.',
  'unlock.bodyCode': 'Saisissez le code qui ouvre Passhold sur cet ordinateur.',
  'unlock.code': 'Code pour cet ordinateur',
  'unlock.useCode': 'Utiliser plutôt le code',
  'unlock.forgotBodyCode':
    'Supprimez ce coffre-fort dans les paramètres et reconnectez-vous avec Google ou GitHub : chaque connexion revient de votre compte.',
  'unlock.device': 'Déverrouiller avec {method}',
  'unlock.key': 'Déverrouiller avec une clé de sécurité',
  'unlock.keyBody': 'Branchez votre clé de sécurité, ou saisissez ci-dessous.',
  'unlock.or': 'ou',
  'unlock.unlocking': 'Déverrouillage…',
  'unlock.forgot': 'Oublié ?',
  'unlock.forgotBody':
    'Votre mot de passe principal est la seule clé de ce coffre-fort, et il n’est stocké nulle part. Sans lui, le coffre-fort ne peut pas être ouvert : vous pouvez seulement le supprimer dans les paramètres et recommencer.',

  // Vault
  'vault.search': 'Rechercher',
  'vault.lock': 'Verrouiller',
  'vault.settings': 'Paramètres',
  'vault.add': 'Nouvelle connexion',
  'vault.onThisPage': 'Sur {site}',
  'vault.all': 'Toutes les connexions',
  'vault.empty': 'Aucune connexion pour l’instant',
  'vault.emptyBody':
    'Connectez-vous à un site et Passhold propose de l’enregistrer – ou ajoutez-en une ici, ou importez depuis votre navigateur.',
  'vault.import': 'Importer les mots de passe',
  'vault.noResults': 'Aucun résultat pour « {query} ».',
  'vault.fill': 'Remplir',
  'vault.copyUsername': 'Copier l’identifiant',
  'vault.copyPassword': 'Copier le mot de passe',
  'vault.noUsername': 'Aucun identifiant',
  'vault.count': { one: '{count} élément', many: '{count} éléments', other: '{count} éléments' },
  'vault.everything': 'Tous les éléments',

  // Asking for a rating, once, after real use
  'rating.title': 'Passhold vous est-il utile ?',
  'rating.body': 'Une note dans le store aide d’autres personnes à le trouver.',
  'rating.rate': 'Le noter',
  'rating.later': 'Pas maintenant',

  // What a list shows, and what can be added
  'kinds.label': 'Afficher',
  'kinds.all': 'Tout',
  'kinds.logins': 'Connexions',
  'kinds.cards': 'Cartes',
  'kinds.addresses': 'Adresses',
  'kinds.notes': 'Notes',
  'kinds.noLogins': 'Aucune connexion pour l’instant.',
  'kinds.noCards':
    'Aucune carte pour l’instant. Ajoutez-en une avec + ci-dessus, et Passhold la remplit au moment du paiement quand vous la choisissez.',
  'kinds.noAddresses':
    'Aucune adresse pour l’instant. Ajoutez-en une avec + ci-dessus, et Passhold la remplit là où un formulaire la demande.',
  'kinds.noNotes':
    'Aucune note pour l’instant. Une note garde ce qui n’est pas une connexion – un mot de passe Wi-Fi, une clé de licence –, chiffré avec le reste.',
  'add.menu': 'Ajouter',
  'add.login': 'Connexion',
  'add.card': 'Carte',
  'add.address': 'Adresse',
  'add.note': 'Note',
  'place.label': 'Coffres-forts',
  'place.mine': 'Les miens',
  'place.of': '{vault}, partagé dans {family}',
  'move.to': 'Déplacer vers {vault}',
  'move.confirm':
    'Tous les membres de {family} la verront dans {vault} et pourront la modifier. Elle quitte votre propre coffre-fort ; ses anciens mots de passe restent sur place.',
  'move.do': 'Déplacer',
  'family.unlockTitle': 'Ouvrir le coffre-fort partagé de {family} sur ce navigateur',
  'family.unlockBody':
    'Passhold a besoin une fois de votre mot de passe de compte Keyrook pour transmettre votre clé à la famille sur ce navigateur. Il n’est envoyé nulle part.',
  'family.unlockOnPage': 'Ouvrez la page « Family » sur account.keyrook.com et transmettez-y votre clé pour la famille à Passhold.',
  'family.password': 'Mot de passe du compte Keyrook',
  'family.unlock': 'Ouvrir',
  'family.openPage': 'Ouvrir la page Famille',
  'family.keyChanged': 'La clé de {who} dans {family} a changé',
  'family.newSender': 'La clé de {family} vient de {who}, que ce navigateur ne connaît pas encore',
  'family.keyChangedBody': 'Passhold ne reçoit rien de cette personne tant que vous deux n’avez pas comparé un code. Appelez cette personne ou rencontrez-la : elle choisit de comparer les codes à côté de votre nom sur la page « Family » de account.keyrook.com.',
  'family.showCode': 'Afficher le code',
  'family.codeIs': 'Votre code',
  'family.match': 'Les codes correspondent',
  'family.differ': 'Ils diffèrent',
  'family.differed':
    'Alors ne lui faites pas confiance. Prévenez un organisateur de votre famille ; Passhold ne prend rien de cette personne d’ici là.',
  'family.someone': 'Quelqu’un',
  'family.waiting':
    'Un organisateur de {family} doit encore vous confirmer. Ce qui est partagé s’ouvre ici dès qu’il l’a fait.',
  'family.rotate':
    'Quelqu’un a quitté {family}, et Passhold n’a pas encore changé toutes ses clés : ce qui est modifié dans ses coffres partagés attend sur ce navigateur. Si cela persiste, changez-les sur la page Famille.',
  'family.rotateCompare':
    'Quelqu’un a quitté {family}. Passhold donne à chacun de nouvelles clés une fois que vous avez comparé le code ci-dessus ; d’ici là, ce qui est modifié dans ses coffres partagés attend sur ce navigateur.',
  'family.rotateWait':
    'Quelqu’un a quitté {family}. Ce que vous modifiez dans ses coffres partagés attend sur ce navigateur jusqu’à ce que le Passhold d’un organisateur change ses clés, ce qu’il fait en se synchronisant, afin que la personne partie ne puisse pas le lire.',
  'family.left': '{who} ne fait plus partie de {family}',
  'family.leftBody':
    'Passhold ne peut pas savoir pourquoi cette personne est partie. Si vous ne vous y attendiez pas, demandez-lui, ou à un organisateur de votre famille.',
  'family.title': 'Famille',
  'family.description': 'Qui est dans votre famille, et les coffres qu’elle partage. Une famille se gère sur la page « Family » de account.keyrook.com : inviter, retirer quelqu’un, changer ses clés.',
  'family.none': 'Ce compte n’est dans aucune famille. Les familles se créent sur la page « Family » de account.keyrook.com.',
  'family.youOrganise': 'Vous en êtes organisateur.',
  'family.youMember': 'Vous en êtes membre.',
  'family.you': '(vous)',
  'family.organiser': 'Organisateur',
  'family.notCompared': 'Admis sans comparer les codes',
  'family.keyNew': 'Sa clé a changé : rien n’est pris de cette personne tant que vous ne comparez pas un code',
  'family.membersLater': 'Les membres apparaissent ici une fois la famille ouverte sur ce navigateur.',
  'family.sharedVaults': 'Coffres partagés',
  'family.vaultWaits': 'Ce qui y est modifié attend qu’un organisateur change la clé',

  // Cards, addresses and notes
  'wallet.updated': 'Modifiée le {date}',
  'wallet.copyField': 'Copier {field}',
  'card.untitled': 'Carte',
  'card.newTitle': 'Nouvelle carte',
  'card.editTitle': 'Modifier la carte',
  'card.titleHint': 'Laissé vide, le nom est celui de la carte : son réseau et ses quatre derniers chiffres.',
  'card.number': 'Numéro de carte',
  'card.numberCheck': 'Ce numéro est invalide : vérifiez chaque chiffre.',
  'card.holder': 'Titulaire de la carte',
  'card.expiry': 'Expire le',
  'card.month': 'Mois',
  'card.year': 'Année',
  'card.code': 'Code de sécurité',
  'card.empty': 'Indiquez un numéro de carte ou un nom.',
  'card.expired': 'Cette carte a expiré.',
  'card.expiredOn': 'expirée le {expiry}',
  'card.copyNumber': 'Copier le numéro de carte',
  'card.copyExpiry': 'Copier la date d’expiration',
  'address.untitled': 'Adresse',
  'address.newTitle': 'Nouvelle adresse',
  'address.editTitle': 'Modifier l’adresse',
  'address.titleHint': 'Domicile, Travail… Laissé vide, le nom est celui qui figure dedans.',
  'address.name': 'Nom complet',
  'address.organization': 'Société',
  'address.street': 'Adresse postale',
  'address.city': 'Ville',
  'address.region': 'Région ou province',
  'address.postalCode': 'Code postal',
  'address.country': 'Pays',
  'address.chooseCountry': 'Choisir un pays',
  'address.phone': 'Téléphone',
  'address.email': 'E-mail',
  'address.address': 'Adresse',
  'address.empty': 'Indiquez un nom, ou une partie de l’adresse.',
  'note.untitled': 'Note sans titre',
  'note.newTitle': 'Nouvelle note',
  'note.editTitle': 'Modifier la note',
  'note.title': 'Titre',
  'note.text': 'Note',
  'note.empty': 'Donnez un titre, ou écrivez quelque chose.',
  'note.edited': 'Modifiée le {date}',

  // Pending save, in the popup
  'pending.saveTitle': 'Enregistrer cette connexion ?',
  'pending.updateTitle': 'Mettre à jour le mot de passe ?',
  'pending.lockedTitle': 'Enregistrer la connexion que vous venez d’utiliser ?',
  'pending.body': '{username} sur {site}',
  'pending.bodyNoUser': 'Un mot de passe pour {site}',
  'pending.save': 'Enregistrer',
  'pending.update': 'Mettre à jour',
  'pending.never': 'Jamais pour ce site',

  // Item
  'item.username': 'Identifiant',
  'item.password': 'Mot de passe',
  'item.website': 'Site web',
  'item.websites': 'Sites web',
  'item.notes': 'Notes',
  'item.favorite': 'Favori',
  'item.unfavorite': 'Retirer des favoris',
  'item.addFavorite': 'Ajouter aux favoris',
  'item.trash': 'Déplacer vers la corbeille',
  'item.updated': 'Mot de passe modifié le {date}',
  'item.history': 'Mots de passe précédents',
  'item.weak': 'Ce mot de passe est faible : il ne serait pas long à deviner.',
  'item.reused': {
    one: 'Ce mot de passe est aussi utilisé pour {count} autre connexion. Si un site le divulgue, les deux sont accessibles.',
    many: 'Ce mot de passe est aussi utilisé pour {count} autres connexions. Si un site le divulgue, toutes sont accessibles.',
    other: 'Ce mot de passe est aussi utilisé pour {count} autres connexions. Si un site le divulgue, toutes sont accessibles.',
  },
  'item.changePassword': 'Le modifier sur le site',
  'item.openSite': 'Ouvrir {site}',
  'item.passkey': 'Clé d’accès',
  'item.passkeyBody': 'Pour {site}, enregistrée le {date}',

  // Edit
  'edit.newTitle': 'Nouvelle connexion',
  'edit.editTitle': 'Modifier la connexion',
  'edit.title': 'Nom',
  'edit.titleHint': 'Laissé vide, le nom est celui du site web.',
  'edit.username': 'Identifiant ou e-mail',
  'edit.password': 'Mot de passe',
  'edit.generate': 'Générer',
  'edit.websites': 'Sites web',
  'edit.websitesHint': 'Un par ligne. Passhold propose cette connexion sur ces sites.',
  'edit.notes': 'Notes',
  'edit.empty': 'Donnez un nom, un identifiant ou un mot de passe.',

  // Fields of an item's own, and folders
  'fields.title': 'Champs personnalisés',
  'fields.add': 'Ajouter un champ',
  'fields.name': 'Nom du champ',
  'fields.value': 'Valeur',
  'fields.hidden': 'Masquer, comme un mot de passe',
  'fields.remove': 'Supprimer ce champ',
  'fields.unnamed': 'Champ',
  'fields.copy': 'Copier {name}',
  'folders.label': 'Dossier',
  'folders.placeholder': 'Aucun dossier',
  'folders.choose': 'Dossiers existants',
  'folders.hint': 'Regroupez les éléments – Travail, Famille, Banque – et n’affichez qu’un dossier à la fois.',
  'folders.all': 'Tous les dossiers',
  'folders.none': 'Dans aucun dossier',
  'folders.count': { one: '{count} élément', many: '{count} éléments', other: '{count} éléments' },
  'folders.nothingHere': 'Aucun élément de ce type dans ce dossier.',
  'folders.rename': 'Renommer',
  'folders.renameTo': 'Nouveau nom du dossier',
  'folders.remove': 'Supprimer le dossier',
  'folders.removeHint': 'Son contenu reste, hors de tout dossier.',

  // Generator
  'generator.length': 'Longueur',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': 'Exclure les caractères ambigus (I l 1 O 0)',
  'generator.again': 'Autre',
  'generator.use': 'Utiliser ce mot de passe',
  'generator.bits': '{bits} bits',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold est verrouillé.',
  'menu.unlock': 'Déverrouiller Passhold',
  'menu.unlockHint': 'Cliquez sur Passhold dans la barre d’outils pour le déverrouiller, puis revenez ici.',
  'menu.none': 'Aucune connexion enregistrée pour {site}.',
  'menu.uninitialized': 'Configurez d’abord Passhold : cliquez dessus dans la barre d’outils.',
  'menu.suggest': 'Utiliser un mot de passe fort',
  'menu.suggestBody': 'Un nouveau mot de passe, rempli pour vous. Passhold propose de l’enregistrer dès que le formulaire est envoyé.',
  'menu.fillFor': 'Remplir sur {site}',
  'menu.hidden': 'Passhold est masqué par un élément de cette page, il ne remplira donc rien.',
  'menu.passkey': 'Clé d’accès · {username}',
  'menu.noCards': 'Aucune carte dans Passhold pour l’instant. Ajoutez-en une depuis Passhold dans la barre d’outils.',
  'menu.noAddresses': 'Aucune adresse dans Passhold pour l’instant. Ajoutez-en une depuis Passhold dans la barre d’outils.',
  'menu.cardInsecure':
    'Cette page n’est pas sécurisée (http non chiffré) : Passhold ne remplira donc pas de carte ici, car n’importe qui sur le trajet pourrait la lire.',

  // A website's passkey
  'passkey.saveTitle': 'Enregistrer une clé d’accès pour {site} ?',
  'passkey.save': 'Enregistrer la clé',
  'passkey.saveElsewhere': 'L’enregistrer ailleurs',
  'passkey.useElsewhere': 'Utiliser une clé d’accès d’ailleurs',
  'passkey.existsTitle': 'Cette clé d’accès est déjà dans Passhold',
  'passkey.ok': 'OK',
  'passkey.signInTitle': 'Se connecter à {site}',
  'passkey.signInBody': 'Avec une clé d’accès enregistrée dans Passhold',
  'passkey.none': 'Aucune clé d’accès pour {site} dans Passhold.',
  'passkey.hidden': 'Passhold est masqué par un élément de cette page, il ne répondra donc pas.',

  // Save prompt on a page
  'prompt.save': 'Enregistrer la connexion dans Passhold ?',
  'prompt.update': 'Mettre à jour le mot de passe dans Passhold ?',
  'prompt.saveButton': 'Enregistrer',
  'prompt.updateButton': 'Mettre à jour',
  'prompt.never': 'Jamais pour ce site',
  'prompt.saved': 'Enregistré dans Passhold.',
  'prompt.locked': 'Cliquez sur Passhold dans la barre d’outils et déverrouillez-le : il vous demandera d’enregistrer là-bas.',
  'prompt.saveCard': 'Enregistrer la carte dans Passhold ?',
  'prompt.updateCard': 'Mettre à jour la carte dans Passhold ?',
  'prompt.saveAddress': 'Enregistrer l’adresse dans Passhold ?',
  'prompt.saveCheckout': 'Enregistrer la carte et l’adresse dans Passhold ?',

  // Settings
  'settings.title': 'Paramètres',
  'settings.cannotOpen': 'Impossible de l’ouvrir du tout ? Supprimer le coffre-fort de ce navigateur',
  'settings.encryptedHere': 'Chiffré sur cet appareil',
  'settings.source': 'Code source sur GitHub',

  'nav.passwords': 'Mots de passe',
  'nav.accountSync': 'Compte et synchronisation',
  'nav.family': 'Famille',
  'nav.account': 'Compte Keyrook',
  'nav.backup': 'Sauvegarde et import',
  'nav.security': 'Sécurité',
  'nav.general': 'Général',
  'nav.needsAttention': 'à vérifier',


  'account.description':
    'Connectez-vous, et vos connexions vous suivent dans chaque navigateur où vous vous connectez à Passhold. Elles sont chiffrées d’abord sur cet appareil : le serveur de Keyrook ne peut pas les lire, ni savoir à quels sites elles correspondent.',
  'account.email': 'E-mail',
  'account.password': 'Mot de passe du compte Keyrook',
  'account.signIn': 'Se connecter',
  'account.signingIn': 'Connexion…',
  'account.note': 'Le même compte que dans Keyrook Authenticator. Un compte créé avec Google ou GitHub se connecte avec son bouton.',
  'account.haveOne': 'J’ai un compte',
  'account.create': 'Créer un compte',
  'account.sendCode': 'M’envoyer un code par e-mail',
  'account.createNote':
    'Keyrook envoie par e-mail un code à six chiffres pour prouver que l’adresse vous appartient. Si l’adresse a déjà un compte, l’e-mail le dit à la place : connectez-vous avec.',
  'account.codeSent': 'Un code est en route vers {email}. Il est valable quinze minutes.',
  'account.code': 'Code à six chiffres',
  'account.newPassword': 'Mot de passe du compte Keyrook',
  'account.passwordNote':
    'Ce mot de passe ouvre votre compte Keyrook dans n’importe quel navigateur, pour Passhold et Keyrook Authenticator. Keyrook ne le voit jamais et ne peut pas le réinitialiser pour vous ; la clé de récupération que vous recevez ensuite permet d’en définir un nouveau.',
  'account.createButton': 'Créer le compte',
  'account.creating': 'Création…',
  'account.otherEmail': 'Utiliser une autre adresse',
  'account.signedInAs': 'Connecté en tant que {email}',
  'account.signedInAsNamed': 'Connecté en tant que {name} ({email})',
  'account.synced': 'Synchronisé le {date}',
  'account.notSynced': 'Pas encore synchronisé',
  'account.syncNow': 'Synchroniser maintenant',

  // The account, at the foot of the popup
  'accountBar.synced': 'Synchronisé {time}',
  'accountBar.justNow': 'à l’instant',
  'accountBar.syncing': 'Synchronisation…',
  'accountBar.signedOut': 'Déconnecté – reconnectez-vous pour synchroniser',
  'accountBar.startedOver': 'Compte recommencé – reconnectez-vous',
  'accountBar.removed': 'Retiré du compte – reconnectez-vous pour synchroniser',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'Retiré de votre compte Keyrook',
  'removed.body':
    'Le {date}, ce navigateur a été retiré de votre compte Keyrook : Passhold en a donc retiré les connexions, cartes, adresses et notes du compte, puis l’a déconnecté. Ce qui a été ajouté ou modifié ici sans jamais être envoyé est resté, comme propre à ce navigateur. Reconnectez-vous pour récupérer le reste.',

  // Passwords, in Settings
  'passwords.description':
    'Chaque connexion, clé d’accès, carte, adresse et note de Passhold. Choisissez-en une pour la voir, copier ce qu’elle contient ou la modifier.',
  'passwords.all': 'Tout',
  'passwords.attention': 'À vérifier',
  'passwords.weak': 'Faible',
  'passwords.reused': 'Réutilisé',
  'account.syncDone': 'Synchronisé.',
  'account.removed': {
    one: '{count} élément supprimé définitivement sur un autre appareil a été retiré ici.',
    many: '{count} éléments supprimés définitivement sur un autre appareil ont été retirés ici.',
    other: '{count} éléments supprimés définitivement sur un autre appareil ont été retirés ici.',
  },
  'account.skipped': {
    one: '{count} enregistrement ne s’ouvrait pas et a été laissé de côté.',
    many: '{count} enregistrements ne s’ouvraient pas et ont été laissés de côté.',
    other: '{count} enregistrements ne s’ouvraient pas et ont été laissés de côté.',
  },
  'account.manage': 'Gérer votre compte Keyrook',
  'account.manageBody':
    'Modifier le mot de passe, créer une nouvelle clé de récupération ou recommencer le compte sur account.keyrook.com – pour Passhold et Keyrook Authenticator.',
  'account.manageBodyProvider':
    'Créer une nouvelle clé de récupération ou recommencer le compte sur account.keyrook.com – pour Passhold et Keyrook Authenticator.',
  'account.manageOpen': 'Ouvrir',
  'account.signOut': 'Se déconnecter',
  'account.signOutBody': 'Supprime chaque connexion de ce navigateur, après une dernière synchronisation. Reconnectez-vous et elles reviennent.',
  'account.signOutConfirm':
    'Passhold synchronise une dernière fois, puis supprime le coffre-fort de ce navigateur. Rien n’est supprimé si une connexion n’a pas atteint votre compte.',
  'account.signOutButton': 'Se déconnecter et supprimer',
  'account.signedOutByServer': 'Keyrook a déconnecté ce navigateur. Reconnectez-vous pour continuer à synchroniser.',
  'account.startedOver':
    'Votre compte Keyrook a été recommencé le {date}, donc Keyrook a déconnecté ce navigateur. Connectez-vous avec son nouveau mot de passe : les connexions d’ici sont envoyées sous ses nouvelles clés.',
  'account.startedOverProvider':
    'Votre compte Keyrook a été recommencé le {date}, donc Keyrook a déconnecté ce navigateur. Connectez-vous avec Google ou GitHub : les connexions d’ici sont envoyées sous ses nouvelles clés.',
  'account.forgot': 'Mot de passe oublié ?',
  'account.recoverBody':
    'Keyrook envoie un code à l’adresse du compte ; saisissez-le alors, la clé de récupération du compte figurant sur la feuille enregistrée à la création, et un nouveau mot de passe. Tous les autres navigateurs et applications connectés au compte demanderont le nouveau.',
  'account.recoveryKey': 'Clé de récupération du compte',
  'account.recoverPassword': 'Nouveau mot de passe du compte',
  'account.recoverButton': 'Définir le nouveau mot de passe',
  'account.recovering': 'Définition…',
  'account.backToSignIn': 'Retour à la connexion',
  'startOver.link': 'Clé de récupération perdue aussi ? Recommencer le compte',
  'startOver.title': 'Recommencer le compte',
  'needsRoot.body':
    'Si vous avez la clé de récupération du compte que Keyrook Authenticator vous a remise, saisissez-la : elle ouvre alors Passhold aussi. Sans elle, Passhold crée une nouvelle clé de récupération pour le compte, affichée une seule fois, et l’ancienne cesse de fonctionner.',
  'needsRoot.sheet': 'Clé de récupération du compte depuis Keyrook Authenticator (si vous l’avez)',
  'needsRoot.withSheet': 'Utiliser cette clé',
  'needsRoot.newSheet': 'Créer une nouvelle clé de récupération',
  'startOver.body':
    'Avec seulement l’adresse e-mail, le compte peut recommencer avec de nouvelles clés et une nouvelle clé de récupération. Cela prend effet une semaine après votre demande, et d’ici là tout navigateur encore connecté au compte peut l’annuler – donc quelqu’un qui n’a que votre adresse e-mail ne peut pas le faire. Tout ce que contenait le compte est conservé par Keyrook, toujours chiffré, pendant 90 jours : l’ancien mot de passe ou l’ancienne clé de récupération le ramène.',
  'startOver.button': 'Recommencer',
  'startOver.working': 'Recommencement du compte…',
  'startOver.kitBody':
    'La nouvelle clé de récupération du compte : elle fonctionne une fois le compte recommencé. Passhold ne l’affiche que maintenant, gardez-la avant de continuer.',
  'startOver.waitTitle': 'Votre compte recommence le {date}',
  'startOver.waitBody':
    'D’ici là, rien ne change, et tout navigateur encore connecté au compte peut l’annuler. Keyrook écrit à {email} maintenant, la veille, et le jour même.',
  'startOver.waitThen':
    'Ensuite, connectez-vous ici avec votre nouveau mot de passe. Les connexions de ce navigateur sont envoyées sous les nouvelles clés du compte, et ce qu’il contenait avant est conservé pendant 90 jours.',
  'startOver.waitThenProvider':
    'Ensuite, connectez-vous ici avec Google ou GitHub, comme avant. Les connexions de ce navigateur sont envoyées sous les nouvelles clés du compte, et ce qu’il contenait avant est conservé pendant 90 jours.',
  'startOver.understood': 'Compris',
  'startOver.doneTitle': 'Votre compte a recommencé',
  'startOver.doneBody':
    'Connectez-vous avec votre nouveau mot de passe : les connexions de ce navigateur sont envoyées sous les nouvelles clés du compte, et ce qu’il contenait avant est conservé pendant 90 jours.',
  'startOver.doneBodyProvider':
    'Connectez-vous avec Google ou GitHub, comme avant : les connexions de ce navigateur sont envoyées sous les nouvelles clés du compte, et ce qu’il contenait avant est conservé pendant 90 jours.',
  'startOverWait.title': 'Votre compte Keyrook recommence le {date}',
  'startOverWait.body':
    'Il a été demandé avec le code que Keyrook vous a envoyé par e-mail, depuis un appareil qui s’appelait « {device} ». Si ce n’était pas vous, quelqu’un peut lire vos e-mails : annulez-le maintenant, puis changez le mot de passe de votre messagerie. Si c’était vous, laissez-le.',
  'startOverWait.bodyNoName':
    'Il a été demandé avec le code que Keyrook vous a envoyé par e-mail. Si ce n’était pas vous, quelqu’un peut lire vos e-mails : annulez-le maintenant, puis changez le mot de passe de votre messagerie. Si c’était vous, laissez-le.',
  'startOverWait.cancel': 'Annuler le recommencement',
  'kept.title': {
    one: 'Conservé avant le recommencement du compte : {count} élément',
    many: 'Conservé avant le recommencement du compte : {count} éléments',
    other: 'Conservé avant le recommencement du compte : {count} éléments',
  },
  'kept.body': 'Jusqu’au {date}. L’ancien mot de passe du compte ou l’ancienne clé de récupération les ramène dans Passhold.',
  'kept.open': 'Restaurer',
  'kept.secret': 'Ancien mot de passe du compte ou ancienne clé de récupération',
  'kept.done': {
    one: '{count} élément restauré.',
    many: '{count} éléments restaurés.',
    other: '{count} éléments restaurés.',
  },
  'kept.nothingNew': 'Tout ce qui était conservé est déjà ici.',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': 'Continuer avec {provider}',
  'provider.passwordTitle': 'Ce compte Keyrook a un mot de passe',
  'provider.passwordBody':
    'Vous vous êtes connecté avec {provider} sous {email}. Le mot de passe du compte est ce qui ouvre Passhold ici : saisissez-le une fois.',
  'provider.openAccountPage': 'Ouvrir account.keyrook.com',
  'secondStep.title': 'Validation en deux étapes',
  'secondStep.body':
    'Saisissez le code à 6 chiffres affiché par votre application d’authentification pour Keyrook. Application perdue ? Saisissez plutôt votre clé de récupération du compte.',
  'secondStep.ownerBody':
    'Votre compte demande aussi une seconde étape pour cela : le code de votre application d’authentification, ou votre clé de récupération du compte.',
  'secondStep.field': 'Code ou clé de récupération',
  'secondStep.continue': 'Continuer',
  'secondStep.passkey': 'Utiliser plutôt une clé d’accès',
  'secondStep.nextBody':
    'Remettre sa clé au compte demande aussi un code, et chaque code ne fonctionne qu’une fois. Attendez que votre application d’authentification en affiche un nouveau, puis saisissez-le – ou votre clé de récupération du compte.',
  'provider.or': 'ou',
  'provider.signedInWith': 'Connecté avec {provider} sous {email}',
  'provider.signedInWithNamed': 'Connecté avec {provider} sous {name} ({email})',
  'provider.newTitle': 'Créer votre compte Keyrook',
  'provider.newBody':
    'Vous vous connectez avec {provider} sous {email}. Le compte n’a pas de mot de passe : {provider} vous connecte. Sur un autre ordinateur, un navigateur déjà connecté vous laisse entrer – ou la clé de récupération que vous recevez ensuite.',
  'provider.joinTitle': 'Laisser entrer ce navigateur',
  'provider.joinBody':
    '{email} est connecté ici, mais la clé qui ouvre vos connexions se trouve sur vos autres ordinateurs. Ouvrez Passhold sur l’un d’eux – Paramètres, Compte et synchronisation – et laissez entrer ce navigateur.',
  'provider.waiting': 'En attente d’un autre navigateur…',
  'provider.compare': 'L’autre navigateur affiche un code. Ne le laissez entrer là-bas que si c’est celui-ci :',
  'provider.ended': 'Cette demande s’est terminée avant qu’un autre navigateur ne laisse celui-ci entrer.',
  'provider.askAgain': 'Redemander',
  'provider.useKit': 'Utiliser plutôt la clé de récupération',
  'provider.useThisKey': 'Utiliser cette clé',
  'provider.needsRoot':
    '{email} a été créé dans Keyrook Authenticator avant que chaque application Keyrook ait sa propre clé. Passhold peut lui en donner une maintenant, une fois que vous confirmez à nouveau avec {provider} ; rien ne change dans Authenticator.',
  'provider.confirmWith': 'Confirmer avec {provider}',
  'provider.noKeyYet':
    'Passhold ne s’est encore connecté à {email} nulle part, donc aucun autre navigateur ne peut laisser celui-ci entrer. La clé de récupération du compte l’ouvre.',
  'passkey.onLabel': 'Les nouveaux ordinateurs s’ouvrent avec votre clé d’accès',
  'passkey.offLabel': 'Pas de clé d’accès pour les nouveaux ordinateurs',
  'passkey.body':
    'Sur un nouvel ordinateur : {provider}, puis votre clé d’accès – et chaque connexion est là. Conservée par Google Password Manager, la clé d’accès est sur chaque Chrome où vous vous connectez.',
  'passkey.bodyEdge':
    'Sur un nouvel ordinateur : {provider}, puis votre clé d’accès – et chaque connexion est là. Enregistrée là où elle se synchronise, la clé d’accès est aussi sur vos autres appareils.',
  'passkey.turnOn': 'Activer',
  'passkey.turnOff': 'Désactiver',
  'passkey.joinTitle': 'Ouvrir avec votre clé d’accès',
  'passkey.joinBody': '{email} a une clé d’accès pour les nouveaux ordinateurs. Confirmez avec elle, et vos connexions arrivent.',
  'passkey.use': 'Utiliser la clé d’accès',
  'passkey.otherWays': 'Autres moyens d’entrer',
  'pairing.asking': '{device} demande à être admis dans votre compte.',
  'pairing.start': 'Admettre…',
  'pairing.notMe': 'Ce n’est pas moi',
  'pairing.compare': 'Ne l’admettez que si le nouveau navigateur affiche ce même code :',
  'pairing.match': 'Les codes correspondent – admettre',
  'pairing.differ': 'Les codes diffèrent',

  'accountKit.title': 'Enregistrez la clé de récupération de votre compte',
  'accountKit.body':
    'Si vous oubliez le mot de passe de votre compte Keyrook, cette clé en définit un nouveau – pour Passhold et Keyrook Authenticator. Keyrook ne voit jamais votre mot de passe : c’est donc le seul moyen. Vous pouvez la revoir dans les paramètres ; gardez-la aussi ailleurs.',
  'accountKit.fileTitle': 'Clé de récupération du compte Keyrook',
  'accountKit.fileBody':
    'Si vous oubliez le mot de passe de votre compte Keyrook, cette clé en définit un nouveau : dans Passhold, Paramètres → Compte et synchronisation → « Mot de passe oublié ? ». Quiconque la détient et possède votre adresse e-mail peut faire de même : gardez-la en sécurité, et pas sur cet ordinateur.',
  'accountKit.bodyNoPassword':
    'Votre compte n’a pas de mot de passe : un navigateur déjà connecté en laisse entrer un nouveau. S’il n’en reste aucun, cette clé le fait – pour Passhold et Keyrook Authenticator. Vous pouvez la revoir dans les paramètres ; gardez-la aussi ailleurs.',
  'accountKit.fileBodyNoPassword':
    'Si plus aucun ordinateur n’est connecté à votre compte Keyrook, cette clé en laisse entrer un nouveau : connectez-vous avec Google ou GitHub, puis choisissez « Utiliser plutôt la clé de récupération ». Quiconque la détient et peut aussi se connecter en tant que vous peut faire de même : gardez-la en sécurité, et pas sur cet ordinateur.',
  'accountKit.whenTitleNoPassword': 'Quand plus aucun ordinateur n’est connecté',
  'accountKit.inPassholdNoPassword':
    'Dans Passhold : connectez-vous avec Google ou GitHub, choisissez « Utiliser plutôt la clé de récupération », et saisissez cette clé.',
  'accountKit.keepNoPassword':
    'Gardez cette feuille en lieu sûr, loin de votre ordinateur. Avec elle, quiconque peut se connecter à votre compte Google ou GitHub peut ouvrir votre compte Keyrook.',
  'accountKit.rowBodyNoPassword': 'Laisse entrer un nouvel ordinateur quand aucun autre n’est là pour le faire.',
  'accountKit.sheetTitle': 'Kit de récupération du compte Keyrook',
  'accountKit.whenTitle': 'Quand le mot de passe du compte est oublié',
  'accountKit.inPasshold':
    'Dans Passhold : Paramètres → Compte et synchronisation → « Mot de passe oublié ? », puis votre adresse e-mail, le code envoyé par Keyrook, cette clé et un nouveau mot de passe.',
  'accountKit.inAuthenticator': 'Keyrook Authenticator accepte la même clé : « Mot de passe oublié ? » là où il vous demande de vous connecter.',
  'accountKit.keep':
    'Gardez cette feuille en lieu sûr, loin de votre ordinateur. Quiconque la détient et possède votre boîte e-mail peut définir un nouveau mot de passe pour le compte.',
  'accountKit.pending': 'Clé de récupération du compte non rangée',
  'accountKit.keptState': 'Clé de récupération du compte rangée',
  'accountKit.elsewhere': 'Clé de récupération du compte créée ailleurs',
  'accountKit.none': 'Aucune clé de récupération du compte',
  'accountKit.rowBody':
    'Définit un nouveau mot de passe de compte s’il est oublié. Une nouvelle clé empêche l’ancienne de fonctionner, dans toutes les applications.',
  'accountKit.elsewhereBody':
    'Créée sur account.keyrook.com, dans Keyrook Authenticator ou dans un autre navigateur : sa clé figure sur la feuille enregistrée à ce moment-là. En créer une ici rend celle-là inutilisable.',
  'accountKit.noneBody':
    'Sans elle, un mot de passe de compte oublié ne peut pas être réinitialisé, et ce qui est conservé chez Keyrook ne peut pas être ouvert. Les connexions de ce navigateur restent dans tous les cas.',
  'accountKit.make': 'En créer une',
  'accountKit.apart':
    'Gardez-la à part de votre e-mail : quiconque détient cette clé et peut lire vos e-mails peut définir un nouveau mot de passe et ouvrir vos connexions. Ne vous l’envoyez pas par e-mail, et ne la gardez pas dans le stockage en ligne de cette messagerie.',
  'accountKit.apartNoPassword':
    'Gardez-la à part du compte Google ou GitHub avec lequel vous vous connectez : quiconque détient cette clé et peut s’y connecter en tant que vous peut ouvrir vos connexions. Ne vous l’envoyez pas par e-mail, et ne la gardez pas dans le stockage en ligne de ce compte.',
  'accountKit.unchecked': 'Clé de récupération du compte non vérifiée',
  'accountKit.uncheckedBody':
    'Votre compte a une clé de récupération, créée sur account.keyrook.com ou dans une autre application. Saisissez-la une fois : Passhold vérifie qu’elle ouvre votre compte, et la garde pour vous la montrer de nouveau.',
  'accountKit.typeIt': 'La saisir',
  'accountKit.checked': 'Elle ouvre votre compte. Passhold la garde maintenant, pour vous la montrer ici.',
  'accountKit.draftBody':
    'La nouvelle clé de récupération de votre compte. Elle ne fonctionne pas encore : une fois que vous l’avez enregistrée et ressaisie, votre mot de passe de compte la définit, et l’ancienne cesse de fonctionner.',
  'accountKit.setTitle': 'Définir votre nouvelle clé de récupération',
  'accountKit.setBody':
    'Saisissez le mot de passe de votre compte Keyrook. Tant que vous ne le faites pas, votre ancienne clé de récupération fonctionne encore, pas celle-ci.',
  'accountKit.set': 'Définir',
  'checkup.clear': 'Rien à corriger',
  'checkup.clearBody': 'Aucun mot de passe faible ou réutilisé, et votre sauvegarde est à jour.',
  'checkup.issues': { one: '{count} point à vérifier', many: '{count} points à vérifier', other: '{count} points à vérifier' },
  'checkup.issuesBody': 'Chacun ci-dessous explique pourquoi c’est important et comment y remédier.',
  'checkup.backup': 'Sauvegarde',
  'checkup.access': 'Accès',
  'checkup.recoveryPending':
    'La clé de récupération créée pour ce coffre-fort n’a jamais été confirmée comme rangée, et c’est le seul accès si {method} cesse de fonctionner. Créez-en une nouvelle et gardez-la.',
  'checkup.deviceMissing':
    'Ce coffre-fort n’a pas de mot de passe principal : sans {method} ici, chaque déverrouillage demande la clé de récupération.',
  'checkup.lastBackup': 'Dernière sauvegarde le {date}',
  'checkup.backupNever':
    'Si ce navigateur est perdu, vos connexions le sont aussi. Une sauvegarde est un fichier chiffré à garder ailleurs.',
  'checkup.backupDue': 'Votre coffre-fort a changé depuis. Créez une nouvelle sauvegarde pour qu’elle contienne tout.',
  'checkup.backUp': 'Sauvegarder maintenant',
  'checkup.weak': { one: '{count} mot de passe faible', many: '{count} mots de passe faibles', other: '{count} mots de passe faibles' },
  'checkup.weakBody':
    'Assez court ou simple pour être deviné. Changez chacun sur son site ; Passhold en propose un fort dans le formulaire et propose de l’enregistrer.',
  'checkup.weakNone': 'Aucun.',
  'checkup.reused': {
    one: '{count} mot de passe utilisé plus d’une fois',
    many: '{count} mots de passe utilisés plus d’une fois',
    other: '{count} mots de passe utilisés plus d’une fois',
  },
  'checkup.reusedBody': 'Quand un site divulgue un mot de passe, on l’essaie partout ailleurs. Donnez à chaque connexion le sien.',
  'checkup.reusedNone': 'Aucun : chaque connexion a son propre mot de passe.',
  'checkup.sharedBy': {
    one: 'Partagé par {count} connexion',
    many: 'Partagé par {count} connexions',
    other: 'Partagé par {count} connexions',
  },
  'checkup.change': 'Modifier',
  'checkup.limits':
    'Passhold ne vérifie pas si un mot de passe est apparu dans une fuite de données : cela suppose d’interroger un serveur, et Passhold n’en interroge aucun. Il ne vous relance pas non plus pour les vieux mots de passe : un mot de passe fort et unique ne s’use pas.',

  'backup.description': 'Garder une copie chiffrée, en restaurer une, ou faire entrer et sortir des connexions.',
  'backup.backupRow': 'Tout votre coffre-fort dans un seul fichier chiffré, sous votre mot de passe principal.',
  'backup.restoreRow': 'Ajouter à ce coffre-fort les connexions d’un fichier de sauvegarde.',
  'backup.importRow': 'Depuis un autre navigateur ou gestionnaire de mots de passe, en fichier CSV, ou le JSON de Bitwarden.',
  'backup.exportRow': 'Un fichier CSV lisible par d’autres applications. Non chiffré.',

  'security.description': 'Comment Passhold s’ouvre, et quand il se referme.',
  'security.locking': 'Verrouillage',
  'security.opensTitle': 'Comment Passhold s’ouvre',
  'security.opensBody': 'Pas de mot de passe principal : {method} l’ouvre, et la clé de récupération quand {method} ne le peut pas.',
  'security.setPassword': 'Utiliser un mot de passe principal à la place',
  'security.setPasswordBody': 'Passhold s’ouvre alors avec un mot de passe que vous choisissez, et la clé de récupération ne l’ouvre plus.',
  'security.setPasswordOpen': 'Définir',
  'security.setPasswordSave': 'Utiliser ce mot de passe',
  'security.dropPassword': 'Ne plus utiliser de mot de passe principal',
  'security.dropPasswordBody':
    'Ouvrir avec {method} seul, et garder une clé de récupération pour le jour où il ne le peut pas. Le mot de passe principal n’ouvre plus le coffre-fort.',
  'security.dropPasswordOpen': 'Passer',
  'security.dropPasswordSave': 'Passer et afficher la clé de récupération',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'le verrouillage de l’écran de votre appareil',
  'device.method.passkey': 'votre clé d’accès',
  'device.title': 'Déverrouiller avec {method}',
  'device.description': 'Le moyen le plus rapide d’entrer, qui continue de fonctionner après un redémarrage du navigateur.',
  'device.on': 'Activé',
  'device.off': 'Désactivé',
  'device.body':
    'Votre empreinte ou votre visage ouvre Passhold – ou, sur la plupart des ordinateurs, le mot de passe propre à l’ordinateur. Donc quiconque peut déverrouiller cet ordinateur peut ouvrir Passhold. Ce qu’il ouvre reste sur cet ordinateur, inutilisable sans lui.',
  'device.whereMac':
    'Quand Chrome vous demande où enregistrer la clé d’accès, choisissez Google Password Manager. Une clé d’accès dans votre profil Chrome ne peut pas déverrouiller Passhold, et le Trousseau iCloud ne le peut pas non plus sur certains Mac.',
  'device.whereMacEdge':
    'Quand Edge vous demande où enregistrer la clé d’accès, choisissez un emplacement qui la garde aussi sur vos autres appareils. Tous les emplacements ne peuvent pas déverrouiller Passhold : si celui que vous choisissez ne le peut pas, Passhold le dit, et rien n’est modifié.',
  'device.unavailable': 'Non disponible ici',
  'device.unavailableBody':
    'Ce navigateur n’a trouvé aucune empreinte, aucun visage ni aucun verrouillage d’écran que Passhold peut utiliser. Le PIN fonctionne partout.',
  'device.unavailableRecovery':
    'Ce navigateur n’a trouvé aucune empreinte, aucun visage ni aucun verrouillage d’écran que Passhold peut utiliser : ici, ce coffre-fort s’ouvre donc avec sa clé de récupération. Définissez un mot de passe principal si vous préférez le saisir.',
  'device.opensWith': '{method} ouvre Passhold',
  'device.notHere': 'Pas de déverrouillage avec {method} dans ce navigateur',
  'device.isTheWayIn':
    'Sans mot de passe principal, c’est ainsi que Passhold s’ouvre. Pour désactiver cela, définissez d’abord un mot de passe principal.',
  'device.setUpHere':
    'Tant que le déverrouillage avec {method} n’est pas configuré ici, chaque déverrouillage demande la clé de récupération.',
  'device.setUp': 'Configurer',
  'device.turnOff': 'Désactiver',
  'device.save': 'Configurer {method}',
  'keys.title': 'Déverrouiller avec une clé de sécurité',
  'keys.description': 'Une clé USB que vous branchez : un moyen de plus d’entrer, qui continue de fonctionner après un redémarrage du navigateur.',
  'keys.method': 'votre clé de sécurité',
  'keys.on': { one: '{count} clé configurée', many: '{count} clés configurées', other: '{count} clés configurées' },
  'keys.off': 'Aucune clé configurée',
  'keys.body':
    'Branchez la clé, saisissez son PIN et touchez-la, et Passhold s’ouvre – sur cet ordinateur uniquement. Quiconque détient la clé et connaît son PIN peut ouvrir Passhold ici : gardez-la comme une clé de maison. Si elle est perdue, retirez-la ici : vos autres moyens d’entrer fonctionnent toujours.',
  'keys.add': 'Ajouter une clé',
  'keys.save': 'Ajouter cette clé',
  'keys.one': 'Clé de sécurité',
  'keys.added': 'Ajoutée le {date}',
  'keys.remove': 'Supprimer',
  'pin.title': 'Déverrouiller avec un PIN',
  'pinOffer.title': 'Ouvrez Passhold plus vite avec un PIN',
  'pinOffer.body':
    'Saisissez quelques chiffres au lieu de votre mot de passe à chaque verrouillage de Passhold, jusqu’à la fermeture du navigateur. Après le redémarrage du navigateur, votre mot de passe une fois.',
  'pinOffer.later': 'Vous pouvez en configurer un ou le désactiver à tout moment dans les paramètres, Sécurité.',
  'pin.description': 'Pour les nombreuses fois par jour où Passhold se verrouille pendant que vous êtes sur le même navigateur.',
  'pin.on': 'Activé',
  'pin.off': 'Désactivé',
  'pin.bodyRecovery':
    'Ne fonctionne que tant que le navigateur reste ouvert, et seulement après cinq mauvaises tentatives : au-delà, ou après un redémarrage, l’appareil ou la clé de récupération est nécessaire. Rien de ce que le PIN ouvre n’est conservé sur le disque.',
  'pin.body':
    'Ne fonctionne que tant que le navigateur reste ouvert, et seulement après cinq mauvaises tentatives : au-delà, ou après un redémarrage, le mot de passe principal est nécessaire. Rien de ce que le PIN ouvre n’est conservé sur le disque.',
  'pin.setUp': 'Configurer le PIN',
  'pin.change': 'Modifier',
  'pin.turnOff': 'Désactiver',
  'pin.new': 'PIN, de 6 à 12 chiffres',
  'pin.again': 'Saisissez-le à nouveau',
  'pin.save': 'Enregistrer le PIN',

  'general.description': 'Comment Passhold se comporte sur les sites web, et son apparence.',
  'general.filling': 'Remplissage et enregistrement',
  'general.appearance': 'Langue et apparence',
  'settings.autoSuggest': 'Afficher des suggestions au clic sur un champ de connexion, de carte ou d’adresse',
  'settings.autoSuggestBody':
    'Vos connexions pour le site, un mot de passe fort sur un formulaire d’inscription, vos cartes et adresses au moment du paiement. Rien n’est rempli tant que vous ne choisissez pas.',

  'trash.description': 'Les connexions, cartes, adresses et notes attendent ici que vous les restauriez ou les supprimiez pour de bon.',
  'trash.sharedDescription': 'Partagé avec la famille : chacun peut les restaurer. Supprimés pour de bon, ils disparaissent pour tout le monde.',
  'trash.sharedMember':
    'Partagé avec la famille : vous pouvez les restaurer. Seul un organisateur de la famille peut les supprimer pour de bon.',
  'settings.autoLock': 'Verrouiller après',
  'settings.autoLock.never': 'Seulement à la fermeture du navigateur',
  'settings.autoLock.minutes': { one: '{count} minute', many: '{count} minutes', other: '{count} minutes' },
  'settings.autoLock.hours': { one: '{count} heure', many: '{count} heures', other: '{count} heures' },
  'settings.lockWithSystem': 'Verrouiller quand l’ordinateur se verrouille ou se met en veille',
  'settings.clipboard': 'Effacer les mots de passe copiés après',
  'settings.clipboard.never': 'Jamais',
  'settings.clipboard.seconds': { one: '{count} seconde', many: '{count} secondes', other: '{count} secondes' },
  'settings.clipboard.minutes': { one: '{count} minute', many: '{count} minutes', other: '{count} minutes' },
  'settings.inlineButton': 'Afficher le bouton Passhold dans les champs de connexion, de carte et d’adresse',
  'settings.offerToSave': 'Proposer d’enregistrer les connexions quand vous vous connectez',
  'settings.offerToSaveCards': 'Proposer d’enregistrer cartes et adresses quand vous payez',
  'settings.offerToSaveCardsBody':
    'Une carte seulement depuis une page sécurisée (https), et seulement si son numéro est valide. Elle est désignée par ses quatre derniers chiffres, jamais par son numéro ni son code.',
  'settings.passkeys': 'Enregistrer et utiliser les clés d’accès',
  'settings.passkeysBody':
    'Quand un site propose une clé d’accès, Passhold la garde avec vos connexions et vous connecte avec elle. Désactivé, les clés d’accès sont laissées au navigateur.',
  'settings.language': 'Langue',
  'settings.language.auto': 'Comme le navigateur',
  'settings.theme': 'Apparence',
  'settings.theme.system': 'Comme le système',
  'settings.theme.light': 'Clair',
  'settings.theme.dark': 'Sombre',

  'settings.security': 'Mot de passe principal',
  'settings.securityBody': 'Le changer verrouille à nouveau la clé de votre coffre-fort ; vos connexions restent telles quelles.',
  'settings.current': 'Mot de passe principal actuel',
  'settings.new': 'Nouveau mot de passe principal',
  'settings.confirm': 'Saisissez le nouveau à nouveau',
  'settings.change': 'Changer le mot de passe principal',
  'settings.changeOpen': 'Modifier',
  'settings.changed': 'Mot de passe principal modifié.',

  'settings.backup': 'Sauvegarder',
  'settings.backupBody':
    'Tout votre coffre-fort dans un seul fichier chiffré. Gardez-le ailleurs que sur cet ordinateur – une clé USB, votre stockage en ligne – pour que la perte de ce navigateur ne vous fasse pas perdre vos connexions. Il ne s’ouvre qu’avec le mot de passe principal que vous aviez à la création de la sauvegarde.',
  'settings.backupBodyRecovery':
    'Tout votre coffre-fort dans un seul fichier chiffré. Gardez-le ailleurs que sur cet ordinateur – une clé USB, votre stockage en ligne – pour que la perte de ce navigateur ne vous fasse pas perdre vos connexions. Il s’ouvre avec votre clé de récupération.',
  'settings.backupLast': 'Dernière sauvegarde : {date}',
  'settings.backupNever': 'Pas encore de sauvegarde.',
  'settings.backupButton': 'Télécharger la sauvegarde',
  'settings.backupDone': 'Enregistrée dans vos téléchargements. Déplacez-la maintenant hors de cet ordinateur.',

  'settings.restoreBackup': 'Restaurer depuis une sauvegarde',
  'settings.restoreBodyNew':
    'Il n’y a pas encore de coffre-fort dans ce navigateur. Récupérez le vôtre depuis un fichier de sauvegarde – il s’ouvrira avec le mot de passe principal utilisé lors de la sauvegarde – ou créez-en un nouveau avec le bouton Passhold dans la barre d’outils.',
  'settings.restoreBodyMerge':
    'Ajoute au coffre-fort ce que contient une sauvegarde. Rien n’est supprimé ici : si les deux ont la même connexion, la modification la plus récente est conservée, et l’autre mot de passe rejoint son historique.',
  'settings.restoreChoose': 'Choisir le fichier de sauvegarde',
  'settings.restoreMade': 'Sauvegarde créée le {date}',
  'settings.restorePassword': 'Mot de passe principal de la sauvegarde',
  'settings.restoreRecoveryKey': 'Clé de récupération de la sauvegarde',
  'settings.restoreButton': 'Restaurer',
  'settings.restoreNew': {
    one: 'Coffre-fort restauré, avec {count} élément.',
    many: 'Coffre-fort restauré, avec {count} éléments.',
    other: 'Coffre-fort restauré, avec {count} éléments.',
  },
  'settings.restoreAdded': {
    one: '{count} élément ajouté depuis la sauvegarde.',
    many: '{count} éléments ajoutés depuis la sauvegarde.',
    other: '{count} éléments ajoutés depuis la sauvegarde.',
  },
  'settings.restoreUpdated': {
    one: '{count} élément avait une modification plus récente dans la sauvegarde.',
    many: '{count} éléments avaient une modification plus récente dans la sauvegarde.',
    other: '{count} éléments avaient une modification plus récente dans la sauvegarde.',
  },
  'settings.restoreNothing': 'Tout ce qui est dans la sauvegarde est déjà dans ce coffre-fort.',

  'settings.import': 'Importer',
  'settings.importBody':
    'Importez vos mots de passe depuis Chrome, Edge, Firefox, Safari, Apple Passwords, Bitwarden, 1Password, LastPass, KeePass, Dashlane, Proton Pass ou NordPass : exportez-les là-bas en fichier CSV, puis choisissez-le ici. Les cartes, adresses et notes du fichier suivent aussi. Depuis Bitwarden, exportez en JSON (non chiffré) : son CSV omet les cartes, identités et clés d’accès. Dashlane range celles-ci dans des fichiers à part : choisissez chacun à son tour.',
  'settings.importChoose': 'Choisir le fichier',
  'settings.importFound': 'Trouvé à importer : {what}.',
  'settings.importLogins': { one: '{count} connexion', many: '{count} connexions', other: '{count} connexions' },
  'settings.importPasskeys': { one: '{count} clé d’accès', many: '{count} clés d’accès', other: '{count} clés d’accès' },
  'settings.importCards': { one: '{count} carte', many: '{count} cartes', other: '{count} cartes' },
  'settings.importAddresses': { one: '{count} adresse', many: '{count} adresses', other: '{count} adresses' },
  'settings.importNotes': { one: '{count} note', many: '{count} notes', other: '{count} notes' },
  'settings.importSkipped': {
    one: '{count} entrée ne contient rien que Passhold conserve et est laissée de côté.',
    many: '{count} entrées ne contiennent rien que Passhold conserve et sont laissées de côté.',
    other: '{count} entrées ne contiennent rien que Passhold conserve et sont laissées de côté.',
  },
  'settings.importDuplicates': {
    one: '{count} est déjà dans votre coffre-fort.',
    many: '{count} sont déjà dans votre coffre-fort.',
    other: '{count} sont déjà dans votre coffre-fort.',
  },
  'settings.importConfirm': 'Importer',
  'settings.importDone': 'Importé : {what}.',
  'settings.importDelete': 'Supprimez maintenant le fichier CSV : il contient vos mots de passe en clair.',
  'settings.importNothing': 'Rien de nouveau à importer dans ce fichier.',
  'settings.importTwoFactor': {
    one: '{count} connexion de ce fichier a un code de validation en deux étapes (2FA). Passhold ne conserve pas les codes 2FA : transférez-le dans une application d’authentification avant de supprimer votre ancien gestionnaire de mots de passe, sinon vous risquez d’être bloqué hors de ce compte.',
    many: '{count} connexions de ce fichier ont des codes de validation en deux étapes (2FA). Passhold ne conserve pas les codes 2FA : transférez-les dans une application d’authentification avant de supprimer votre ancien gestionnaire de mots de passe, sinon vous risquez d’être bloqué hors de ces comptes.',
    other: '{count} connexions de ce fichier ont des codes de validation en deux étapes (2FA). Passhold ne conserve pas les codes 2FA : transférez-les dans une application d’authentification avant de supprimer votre ancien gestionnaire de mots de passe, sinon vous risquez d’être bloqué hors de ces comptes.',
  },
  'settings.importAuthenticator': 'Obtenir Keyrook Authenticator',
  'settings.importPasskeysLeft': {
    one: '{count} clé d’accès de ce fichier ne peut pas arriver dans Passhold. Gardez votre ancien gestionnaire de mots de passe jusqu’à vous être connecté à ce site autrement et avoir créé une nouvelle clé d’accès dans Passhold.',
    many: '{count} clés d’accès de ce fichier ne peuvent pas arriver dans Passhold. Gardez votre ancien gestionnaire de mots de passe jusqu’à vous être connecté à ces sites autrement et avoir créé de nouvelles clés d’accès dans Passhold.',
    other: '{count} clés d’accès de ce fichier ne peuvent pas arriver dans Passhold. Gardez votre ancien gestionnaire de mots de passe jusqu’à vous être connecté à ces sites autrement et avoir créé de nouvelles clés d’accès dans Passhold.',
  },

  'settings.export': 'Exporter',
  'settings.exportBody':
    'Un fichier CSV que chaque navigateur et gestionnaire de mots de passe peut lire. Il contient vos mots de passe en clair : gardez-le seulement le temps nécessaire. Il ne contient que les connexions : les clés d’accès, champs personnalisés, dossiers, cartes, adresses et notes n’y figurent pas. Une sauvegarde garde tout.',
  'settings.exportButton': 'Exporter en CSV',
  'settings.exportDone': 'Exporté. Supprimez le fichier une fois que vous en avez fini.',

  'settings.neverSave': 'Ne jamais proposer d’enregistrer sur',
  'settings.neverSaveEmpty': 'Aucun site. Choisissez « Jamais pour ce site » quand Passhold propose d’enregistrer, et il apparaît ici.',
  'settings.remove': 'Supprimer',

  'settings.trash': 'Corbeille',
  'settings.trashEmpty': 'La corbeille est vide.',
  'settings.restore': 'Restaurer',
  'settings.deleteForever': 'Supprimer définitivement',
  'settings.emptyTrash': 'Vider la corbeille',
  'settings.emptyTrashConfirm': 'Supprimer définitivement tout ce qui est dans la corbeille ?',

  'settings.danger': 'Supprimer le coffre-fort',
  'settings.dangerBody':
    'Supprime le coffre-fort de ce navigateur. Chaque connexion qu’il contient disparaît pour de bon – téléchargez d’abord une sauvegarde si vous voulez les garder.',
  'settings.dangerType': 'Saisissez {word} pour confirmer',
  'settings.dangerWord': 'supprimer',
  'settings.dangerButton': 'Supprimer le coffre-fort',

  'settings.about': 'Passhold {version} · par Keyrook',

  // Errors
  'error.noWorker': 'Passhold n’a pas répondu. Fermez ceci et réessayez.',
  'error.wrongPassword': 'Ce n’est pas le mot de passe principal.',
  'error.passwordTooShort': 'Utilisez au moins {min} caractères.',
  'error.vaultCorrupt': 'Le coffre-fort de cet appareil est endommagé et ne peut pas être ouvert.',
  'error.vaultTooNew': 'Ce coffre-fort a été créé par une version plus récente de Passhold. Mettez Passhold à jour pour l’ouvrir.',
  'error.itemNotFound': 'Ceci ne figure plus dans le coffre-fort.',
  'error.familyOrganiserOnly': 'Seul un organisateur de la famille peut vider la corbeille de ce coffre-fort.',
  'error.familyGone': 'Cette famille n’est plus là. Synchronisez, puis regardez à nouveau.',
  'error.familyNotOpen': 'Passhold ne peut pas encore ouvrir cette famille sur ce navigateur. Synchronisez, puis réessayez.',
  'error.itemInvalid': 'Cela ne peut pas être enregistré tel quel.',
  'error.importEmpty': 'Ce fichier ne contient rien à importer.',
  'error.importTooLarge': 'Ce fichier est trop volumineux pour être importé.',
  'error.importUnknownFormat': 'Ce fichier ne ressemble pas à un export de mots de passe.',
  'error.importEncrypted':
    'Cet export Bitwarden est chiffré, et Passhold ne peut pas l’ouvrir. Exportez à nouveau depuis Bitwarden en « .json », et non « .json (Encrypted) », puis choisissez ce fichier.',
  'error.backupInvalid': 'Ce fichier n’est pas une sauvegarde Passhold, ou il est endommagé.',
  'error.backupWrongPassword': 'Ce n’est pas le mot de passe principal avec lequel cette sauvegarde a été faite.',
  'error.backupWrongRecoveryKey': 'Ce n’est pas la clé de récupération avec laquelle cette sauvegarde a été faite.',
  'error.noRecoveryKey': 'Ce coffre-fort n’a pas de clé de récupération à afficher : il s’ouvre avec un mot de passe principal.',
  'error.wrongRecoveryKey': 'Ce n’est pas la clé de récupération.',
  'error.deviceNeeded':
    'Un coffre-fort sans mot de passe principal s’ouvre avec le déverrouillage de cet appareil : configurez-le d’abord. Il reste en place jusqu’à ce qu’un mot de passe principal soit défini.',
  'error.accountOffline': 'Impossible de joindre Keyrook. Vérifiez la connexion et réessayez.',
  'error.accountWrong':
    'Adresse e-mail ou mot de passe incorrect. Un compte créé avec Google ou GitHub se connecte avec son bouton.',
  'error.accountSignedOut': 'Keyrook a déconnecté ce navigateur. Reconnectez-vous.',
  'error.accountBusy': {
    one: 'Trop de tentatives. Attendez {count} seconde et réessayez.',
    many: 'Trop de tentatives. Attendez {count} secondes et réessayez.',
    other: 'Trop de tentatives. Attendez {count} secondes et réessayez.',
  },
  'error.accountFailed': 'Keyrook n’a pas pu faire cela pour l’instant. Réessayez plus tard.',
  'error.accountAlready': 'Ce coffre-fort est déjà connecté à un compte Keyrook.',
  'error.accountNone': 'Ce coffre-fort n’est pas connecté à un compte Keyrook.',
  'error.accountKdfRefused': 'Keyrook a demandé une clé plus faible que celle que Passhold accepte : la connexion a été arrêtée.',
  'error.accountKeyWrong': 'La clé du compte ne s’est pas ouverte avec ce mot de passe.',
  'error.accountCode': 'Ce code n’est pas bon, ou il a expiré. Vérifiez l’e-mail, ou demandez-en un nouveau.',
  'error.accountMail': 'Keyrook n’a pas pu envoyer l’e-mail pour l’instant. Réessayez dans une minute.',
  'error.providerDenied': 'La connexion a été annulée.',
  'error.providerFailed': 'Google ou GitHub n’a pas pu vous connecter pour l’instant. Réessayez.',
  'error.providerExpired': 'Cette connexion a pris fin. Recommencez.',
  'error.providerNotOwner':
    'Ce n’est pas le compte avec lequel ce compte Keyrook se connecte. Reconnectez-vous avec celui que vous utilisez pour Keyrook.',
  'error.signOutUnsent': {
    one: 'Un élément n’a pas encore atteint votre compte Keyrook, donc rien n’a été supprimé. Vérifiez votre connexion, ou reconnectez-vous, puis déconnectez-vous.',
    many: '{count} éléments n’ont pas encore atteint votre compte Keyrook, donc rien n’a été supprimé. Vérifiez votre connexion, ou reconnectez-vous, puis déconnectez-vous.',
    other: '{count} éléments n’ont pas encore atteint votre compte Keyrook, donc rien n’a été supprimé. Vérifiez votre connexion, ou reconnectez-vous, puis déconnectez-vous.',
  },
  'error.providerOtherProvider':
    'Cette adresse e-mail a déjà un compte Keyrook qui se connecte avec l’autre de Google et GitHub. Connectez-vous avec celui-là.',
  'error.providerHasPassword':
    'Cette adresse e-mail a déjà un compte Keyrook avec un mot de passe. Connectez-vous ici avec votre adresse e-mail et votre mot de passe – ou, pour vous connecter aussi avec Google ou GitHub, ajoutez-le sur account.keyrook.com, en vous y connectant avec votre mot de passe.',
  'error.providerEmailTaken':
    'Cette adresse e-mail a déjà un compte Keyrook qui se connecte d’une autre façon. Connectez-vous de cette façon – ou ajoutez celui-ci à ce compte sur account.keyrook.com, en vous y connectant comme il se connecte maintenant.',
  'error.pairingWrongKey':
    'Ce qui est revenu n’est pas la clé de ce compte : il a été refusé. Redemandez, et ne laissez entrer que depuis un navigateur que vous connaissez.',
  'error.pairingRefused': 'Cela ne venait pas du navigateur dont vous avez vérifié le code : c’est refusé. Redemandez.',
  'error.pairingEnded': 'Cette demande a pris fin. Redemandez depuis le nouveau navigateur.',
  'error.passkeyWrong': 'Cette clé d’accès n’ouvre pas ce compte. Essayez un autre moyen d’entrer.',
  'error.joinExpired': 'Cette connexion a attendu trop longtemps. Reconnectez-vous.',
  'error.accountPasswordWrong': 'Ce n’est pas le mot de passe du compte.',
  'error.accountNoKit': 'Passhold ne détient pas la clé de récupération de ce compte.',
  'error.accountKitRace': 'Une autre application vient de changer la clé de récupération du compte. Synchronisez, puis réessayez.',
  'error.accountKitShape': 'Cela ne ressemble pas à une clé de récupération de compte : elle compte 32 lettres et chiffres.',
  'error.accountKitWrong': 'Cette clé de récupération ne correspond à aucun compte avec cette adresse e-mail.',
  'error.accountKitNotThis': 'Ce n’est pas la clé de récupération de ce compte. Relisez ce que vous avez enregistré.',
  'error.accountPasswordWeak':
    'Trop facile à deviner pour un compte : utilisez un mot de passe plus long, mêlant lettres, chiffres et symboles, ou quatre ou cinq mots sans rapport.',
  'error.accountBoxWrong':
    'La clé de Passhold dans ce compte ne s’est pas ouverte. Reconnectez-vous ; si cela ne marche toujours pas, recommencez le compte.',
  'error.accountCodeWait': {
    one: 'Un code a été envoyé il y a un instant. Vous pourrez en demander un autre dans {count} seconde.',
    many: 'Un code a été envoyé il y a un instant. Vous pourrez en demander un autre dans {count} secondes.',
    other: 'Un code a été envoyé il y a un instant. Vous pourrez en demander un autre dans {count} secondes.',
  },
  'error.accountSignUpKeys': 'Keyrook a demandé la clé propre à Passhold, et aucune n’a été envoyée. Mettez Passhold à jour et réessayez.',
  'error.accountIdTaken': 'Le compte n’a pas pu être créé pour l’instant. Demandez un nouveau code et réessayez.',
  'error.accountNoRoot': 'Ce compte n’a pas encore de clé qu’une clé de récupération puisse ouvrir. Reconnectez-vous avec son mot de passe.',
  'error.accountRootNotHeld':
    'Cet ordinateur n’a pas pu montrer qu’il détient la clé du compte. Reconnectez-vous avec le mot de passe ou la clé de récupération.',
  'error.accountRootChanged':
    'Les clés de ce compte ont été remplacées sur un autre ordinateur. Connectez-vous sur un ordinateur où Passhold est encore connecté, ou recommencez le compte.',
  'error.accountKeyReplaced': 'La clé de Passhold dans ce compte a été remplacée sur un autre ordinateur. Reconnectez-vous.',
  'error.accountSessionStolen': 'Cet ordinateur a été déconnecté parce que sa session a été utilisée depuis ailleurs. Reconnectez-vous.',
  'error.accountOld':
    'Ce compte a été créé avec Google ou GitHub avant que chaque application Keyrook ait sa propre clé, et rien de ce qu’il contient n’ouvre encore Passhold. Recommencez le compte avec son adresse e-mail pour lui en donner une.',
  'error.pairingBusy': 'Trop de navigateurs attendent pour rejoindre ce compte. Réessayez dans quelques minutes.',
  'error.startOverExpired': 'Ce délai est expiré. Demandez un nouveau code et recommencez.',
  'error.startOverTooOften': 'Ce compte a recommencé trop souvent ces derniers temps. Réessayez après le {day}.',
  'error.startOverWaiting': 'Ce compte recommence le {day}. Un navigateur encore connecté à lui peut annuler cela.',
  'error.startOverUpdate': 'Keyrook attend désormais une semaine avant de recommencer un compte. Mettez Passhold à jour pour le demander.',
  'error.passkeyFailed': 'Cette clé d’accès n’a pas pu être vérifiée. Réessayez.',
  'error.passkeyNotYou': 'Cette clé d’accès n’a pas confirmé que c’est vous. Réessayez, et déverrouillez-la comme demandé.',
  'error.passkeyUnknown':
    'Cette clé d’accès ne se trouve sur aucun compte Keyrook. Elle a peut-être été retirée : connectez-vous avec le mot de passe, ou avec Google ou GitHub.',
  'error.passkeyExpired': 'Cette demande de clé d’accès a pris fin. Réessayez.',
  'error.passkeyNotOffered': 'Keyrook ne propose pas encore de clés d’accès ici.',
  'error.passkeyNoUnlock': 'Cette clé d’accès se connecte, mais elle n’est pas encore réglée pour déverrouiller votre compte. Sur account.keyrook.com, sous « Passkeys », choisissez « Let it unlock » à côté d’elle, puis réessayez. Ou connectez-vous avec le mot de passe, ou avec Google ou GitHub.',
  'error.passkeyNoPrf': 'Cette clé d’accès se connecte à account.keyrook.com, mais l’endroit où elle est conservée ne peut pas déverrouiller votre compte : le Trousseau iCloud avant macOS 15, par exemple, ne le peut pas. Sur account.keyrook.com, sous « Passkeys », ajoutez-en une conservée à un endroit qui le peut, comme une clé de sécurité, et vérifiez qu’elle affiche « Unlocks your data ». D’ici là, connectez-vous avec le mot de passe, ou avec Google ou GitHub.',
  'error.passkeyPermission':
    'Passhold a besoin de l’autorisation de Chrome pour utiliser les clés d’accès de account.keyrook.com. Choisissez de nouveau la clé d’accès et autorisez-la.',
  'error.passkeyPermissionEdge':
    'Passhold a besoin de l’autorisation d’Edge pour utiliser les clés d’accès de account.keyrook.com. Choisissez de nouveau la clé d’accès et autorisez-la.',
  'error.passkeyCancelled': 'Aucune clé d’accès n’a été utilisée. Réessayez, ou connectez-vous autrement.',
  'error.secondStepNeeded': 'Votre compte demande une seconde étape : saisissez aussi le code de votre application d’authentification.',
  'error.secondStepWrong': 'Ce code n’est pas bon. Saisissez celui qu’affiche maintenant votre application d’authentification, ou votre clé de récupération.',
  'error.signInExpired': 'Cette connexion a expiré. Reconnectez-vous.',
  'error.secondStepUpdate': 'Votre compte demande une seconde étape pour se connecter. Mettez Passhold à jour pour vous connecter.',
  'error.secondStepAsked': 'Votre compte demande une seconde étape : saisissez le code de votre application d’authentification.',
  'error.secondStepTaken':
    'C’est le code avec lequel vous vous êtes connecté, et chaque code ne fonctionne qu’une fois. Attendez que votre application d’authentification en affiche un nouveau.',
  'error.kitDraftGone': 'La nouvelle clé de récupération n’a pas été définie à temps, et rien n’a changé. Créez-en une nouvelle à nouveau.',
  'error.archiveWrong': 'Cela n’ouvre pas ce qui a été conservé.',
  'error.archiveGone': 'Ceci n’est plus conservé.',
  'error.archiveDeleteRefused': 'Seuls l’ancien mot de passe ou l’ancienne clé de récupération peuvent supprimer ce qui a été conservé avant son expiration.',
  'error.accountNeedsRoot':
    'Ce compte a été créé dans Keyrook Authenticator avant que chaque application Keyrook ait sa propre clé. Passhold peut lui en donner une maintenant ; rien ne change dans Authenticator.',
  'error.accountServerWrong':
    'Le serveur de Keyrook a répondu avec quelque chose auquel les clés de ce compte ne correspondent pas, donc Passhold s’est arrêté. Réessayez plus tard.',
  'error.startOverNeedsPassword': 'Ce compte a un mot de passe : choisissez-en un nouveau pour le recommencer.',
  'error.pinInvalid': 'Un PIN fait de 6 à 12 chiffres.',
  'error.wrongPin': 'Ce n’est pas le PIN.',
  'error.wrongPinLeft': {
    one: 'Ce n’est pas le PIN. Il reste {count} tentative.',
    many: 'Ce n’est pas le PIN. Il reste {count} tentatives.',
    other: 'Ce n’est pas le PIN. Il reste {count} tentatives.',
  },
  'error.pinLockedOut': 'Trop de PIN erronés. Déverrouillez autrement ; le PIN refonctionne ensuite.',
  'error.pinUnavailable': 'Le PIN ne fonctionne que tant que le navigateur reste ouvert. Déverrouillez autrement ; le PIN refonctionne ensuite.',
  'error.deviceGone': 'Le déverrouillage avec cet appareil n’est plus configuré. Déverrouillez autrement.',
  'error.deviceKeyWrong': 'Cela n’a pas ouvert Passhold. Déverrouillez autrement, puis reconfigurez le déverrouillage de l’appareil.',
  'error.deviceUnsupported':
    'L’endroit où cette clé d’accès a été enregistrée ne peut pas fournir à Passhold une clé pour l’ouvrir. Réessayez et enregistrez-la dans Google Password Manager – ou utilisez le PIN.',
  'error.deviceUnsupportedEdge':
    'L’endroit où cette clé d’accès a été enregistrée ne peut pas fournir à Passhold une clé pour l’ouvrir. Réessayez et enregistrez-la ailleurs – ou utilisez le PIN.',
  'error.deviceCancelled': 'Rien n’a été déverrouillé : l’opération a été annulée ou a pris trop de temps.',
  'error.keyUnsupported':
    'Cette clé ne peut pas fournir à Passhold ce qu’il lui faut pour s’ouvrir. La plupart des clés FIDO2 le peuvent ; une clé faite seulement pour la validation en deux étapes (U2F) ne le peut pas.',
  'error.keyAlreadyAdded': 'Cette clé est déjà configurée ici.',
  'error.keyGone': 'Cette clé de sécurité n’est plus configurée ici. Déverrouillez autrement.',
  'error.keyWrong': 'Cette clé n’a pas ouvert Passhold. Déverrouillez autrement, puis retirez la clé et ajoutez-la à nouveau.',
  'error.kdfUnsupported': 'Les paramètres du coffre-fort ne sont pas ceux que Passhold accepte.',
  'error.locked': 'Passhold est verrouillé.',
  'error.noVault': 'Il n’y a pas encore de coffre-fort.',
  'error.vaultExists': 'Un coffre-fort existe déjà.',
  'error.notOnPage': 'Cette connexion n’est pas destinée à la page de cet onglet.',
  'error.expired': 'Cela a expiré. Réessayez.',
  'error.noFields': 'Il n’y a rien sur cette page que Passhold puisse remplir.',
  'error.cardInsecure': 'Passhold ne remplit une carte que sur une page sécurisée (https).',
  'error.unknown': 'Une erreur s’est produite : {detail}',
};
