import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'Keyrook 提供',

  // Common
  'common.cancel': 'キャンセル',
  'common.close': '閉じる',
  'common.save': '保存',
  'common.edit': '編集',
  'common.back': '戻る',
  'common.show': '表示',
  'common.hide': '非表示',
  'common.notNow': '後で',

  // Setup
  'setup.title': '保管庫を作成',
  'setup.body':
    'Passhold はパスワードをこの端末上で暗号化して保存します。マスターパスワードを 1 つ設定すると、すべてのパスワードを開けます。覚えられるものを選び、ほかでは使わないでください。',
  'setup.password': 'マスターパスワード',
  'setup.confirm': 'もう一度入力',
  'setup.mismatch': '2 つのパスワードが一致しません。',
  'setup.tooShort': '{min} 文字以上で入力してください。',
  'setup.understand':
    'Passhold や Keyrook を含め、誰もこのパスワードを忘れた場合に保管庫を復元できないことを理解しました。',
  'setup.create': '保管庫を作成',
  'setup.creating': '作成中…',
  'setup.restore': 'バックアップから復元',

  // Strength
  'setup.deviceBody':
    'Passhold はパスワードをこの端末上で暗号化して保存し、{method} で開きます。覚えるマスターパスワードは不要です。{method} で開けなくなる日に備えて、リカバリーキーも発行されます。',
  'setup.deviceWhereMac': 'Chrome がパスキーの保存先を尋ねたら、Google Password Manager を選んでください。',
  'setup.deviceWhereMacEdge':
    'Edge がパスキーの保存先を尋ねたら、ほかの端末でも同期される場所を選んでください。すべての場所で Passhold を開けるわけではありません。選んだ場所で開けない場合は、Passhold がその旨を表示します。',
  'setup.createWithDevice': '{method} で作成',
  'setup.usePassword': '代わりにマスターパスワードを使う',
  'setup.useDevice': '代わりに {method} を使う',
  'setup.signIn': 'ログインするか、Keyrook アカウントを作成',

  'welcome.title': 'パスワードは、どのコンピューターでも',
  'welcome.body':
    '一度ログインしてください。Passhold は指紋認証で開き、入力を代わりに行います。ログイン情報は、ログインしたどこでも使えます。',
  'welcome.email': 'メールアドレスを使う',
  'gate.touchTitle': 'タッチで開く',
  'gate.touchBody': 'Touch ID または Windows Hello で Passhold を開きます。覚えるマスターパスワードは不要です。',
  'gate.everywhereTitle': '使うすべてのコンピューターで',
  'gate.everywhereBody': '別のコンピューターでログインすると、パスワードとパスキーもそこにあります。',
  'gate.privateTitle': '読めるのは、あなただけ',
  'gate.privateBody':
    '送信される前に、このコンピューターで暗号化されます。Keyrook は、パスワードも、それがどのサイトのものかも読めません。',
  'welcome.note':
    'まずこのコンピューターで暗号化されます。Keyrook は、パスワードも、それがどのサイトのものかも読めません。',
  'connect.title': 'Keyrook アカウントをオンにする',
  'connect.body': '使うすべてのコンピューターのログイン情報です。このコンピューターを失っても、バックアップとして残ります。',
  'connect.email': 'メール',
  'kitCheck.title': 'アカウントのリカバリーキーを確認',
  'kitCheck.body': '一度入力して、必要になる日に備えて手元にあることを確認してください。',
  'accountPasskey.button': 'パスキーで続ける',
  'accountPasskey.working': 'パスキーを待っています…',
  'accountPasskey.hint':
    'account.keyrook.com で追加したパスキーです。初回は、{browser} が Passhold による利用を確認します。',
  'accountPasskey.openPasskeys': 'account.keyrook.com で「Passkeys」を開く',
  'join.title': 'Keyrook にログイン',
  'join.body':
    'Passhold と Keyrook Authenticator で使う Keyrook アカウントは 1 つです。ログイン情報は、アカウントからこのブラウザーに届きます。',
  'join.createTitle': 'Keyrook アカウントを作成',
  'join.createBody':
    'Passhold と Keyrook Authenticator で使うアカウントは 1 つです。ログイン情報は、ログインするすべてのコンピューターで、まずこの端末上で暗号化されます。',
  'join.lockTitle': '{email} としてログイン中',
  'join.lockBodyDevice':
    '最後の手順です。Passhold はこのコンピューターで {method} を使って開きます。設定が終わるとすぐにログイン情報が届きます。',
  'join.cancel': '別のアカウントを使う',
  'join.lockBodyCode':
    '最後の手順です。このコンピューターで Passhold を開くためのコードを使います。設定が終わるとすぐにログイン情報が届きます。',
  'join.opening': 'Passhold を開いています…',
  'setup.useAccountPassword': '代わりにアカウントのパスワードを使う',
  'setup.useCode': '代わりにこのコンピューター用のコードを使う',
  'security.accountPasswordTitle': 'Keyrook アカウントのパスワードで開く',
  'security.accountPasswordBody':
    '1 つのパスワードで両方を開けます。変更されると、ここの Passhold は次回ログイン時に追従します。',

  'recovery.title': 'リカバリーキーを保存',
  'recovery.body':
    'この端末を紛失した場合や、そのロック解除が使えなくなった場合、このキーで保管庫とそのバックアップを開けます。Passhold がまだ開く間は、設定でもう一度表示できます。ただし、印刷したもの、スマートフォン、このコンピューター以外のファイルなど、別の場所にも保管してください。',
  'recovery.download': 'ダウンロード',
  'recovery.copy': 'コピー',
  'recovery.copied': 'コピーしました',
  'recovery.print': '印刷',
  'recovery.qr': 'QR コードを表示',
  'recovery.qrHide': 'QR コードを隠す',
  'recovery.qrLabel': 'リカバリーキーの QR コード',
  'recovery.qrHint': 'スマートフォンのカメラを向けて、テキストをメモに保存するか、写真を撮ってください。',
  'recovery.show': '表示',

  'kit.title': 'Passhold リカバリーキット',
  'kit.made': '{date} 作成',
  'kit.keyLabel': 'リカバリーキー',
  'kit.whenTitle': 'Passhold が開かないとき',
  'kit.sameDevice':
    'このコンピューターで Passhold がロック解除を求めたら、「代わりにリカバリーキーを使う」を選び、キーを入力してください。',
  'kit.newDevice':
    '新しいコンピューターでは、Passhold をインストールし、「バックアップから復元」を選んで、いちばん新しいバックアップファイルを選び、キーを入力してください。バックアップがなければ復元するものがないので、必ず 1 つ用意してください。',
  'kit.keep':
    'このシートは、コンピューターから離れた安全な場所に保管してください。このシートと保管庫のコピーの両方を持つ人は、保管庫を開けます。',
  'recovery.fileTitle': 'Passhold リカバリーキー',
  'recovery.fileMade': '{date} 作成',
  'recovery.fileBody':
    'このキーは、端末で開けないとき、Passhold の保管庫とそのバックアップを開きます。キーと保管庫のコピーの両方を持つ人は誰でも開けるため、安全に保管し、同じコンピューターには置かないでください。',
  'recovery.pending': 'リカバリーキーは未保管です',
  'recovery.keptState': 'リカバリーキーを保管しました',
  'recovery.rowBody':
    '{method} で開けないとき、保管庫とそのバックアップを開きます。新しく作ると、この保管庫では古いキーが使えなくなります。それ以前のバックアップは、古いキーで引き続き開けます。',
  'recovery.makeNew': '新しく作成',
  'recovery.savedIt': '保管しました',
  'recovery.checkTitle': '保管したことを確認',
  'recovery.checkBody':
    '保存したもの（ファイル、紙、写真）から、キーの 2 つのグループを入力してください。グループとは、ダッシュの間にある 4 文字ずつのまとまりで、左から数えます。',
  'recovery.group': 'グループ {position}',
  'recovery.check': '確認',
  'recovery.checkWrong':
    'キーの内容と一致しません。保存したものをもう一度確認するか、キーを表示して今すぐ保存し直してください。',
  'recovery.showAgain': 'キーをもう一度表示',
  'recovery.covered': 'Keyrook アカウントが戻り道です',
  'recovery.coveredBody':
    '{method} で Passhold を開けなくなった場合は、この保管庫を削除して、アカウントに再度ログインしてください。すべてのログイン情報が戻ります。この保管庫のリカバリーキーは、引き続きここで確認できます。',

  'proof.recoveryKey': 'リカバリーキー',
  'proof.withDevice': '{method} で確認します。',
  'proof.useDevice': '代わりに {method} で確認',
  'proof.usePassword': '代わりにマスターパスワードを入力',
  'proof.useAccountPassword': '代わりにアカウントのパスワードを入力',
  'proof.useCode': '代わりにコードを入力',
  'proof.useRecoveryKey': '代わりにリカバリーキーを入力',
  'strength.0': '非常に弱い',
  'strength.1': '弱い',
  'strength.2': '普通',
  'strength.3': '強い',
  'strength.4': '非常に強い',
  'strength.short': '長いほど強くなります。14 文字以上を目安にしてください。',
  'strength.digitsOnly': '数字だけでは推測されやすくなります。',
  'strength.repeats': '同じ文字の繰り返しは避けてください。',

  // Unlock
  'unlock.title': 'Passhold はロックされています',
  'unlock.body': 'マスターパスワードを入力してください。',
  'unlock.password': 'マスターパスワード',
  'unlock.submit': 'ロック解除',
  'unlock.pinBody': 'PIN を入力してください。',
  'unlock.pin': 'PIN',
  'unlock.usePassword': '代わりにマスターパスワードを使う',
  'unlock.usePin': '代わりに PIN を使う',
  'unlock.recoveryBody': 'リカバリーキーを入力してください。',
  'unlock.deviceBody': '{method} を使うか、下に入力してください。',
  'unlock.recoveryKey': 'リカバリーキー',
  'unlock.useRecoveryKey': '代わりにリカバリーキーを使う',
  'unlock.lost': '入れませんか？',
  'unlock.forgotBodyRecovery':
    'リカバリーキーは、端末が使えないときに保管庫を開きます。リカバリーキーも端末もない場合は、Passhold も Keyrook も含め、誰も保管庫を開けません。設定から削除して、やり直すことしかできません。',
  'unlock.bodyAccount': 'Keyrook アカウントのパスワードを入力してください。',
  'unlock.accountPassword': 'Keyrook アカウントのパスワード',
  'unlock.useAccountPassword': '代わりにアカウントのパスワードを使う',
  'unlock.forgotBodyAccount':
    'Keyrook アカウントのパスワードです。ほかの場所で変更した場合は、新しいパスワードを使ってください。完全に忘れた場合は、設定でこの保管庫を削除し、必要に応じてリカバリーキーを使って再度ログインしてください。すべてのログイン情報が戻ります。',
  'unlock.bodyCode': 'このコンピューターで Passhold を開くコードを入力してください。',
  'unlock.code': 'このコンピューター用のコード',
  'unlock.useCode': '代わりにコードを使う',
  'unlock.forgotBodyCode':
    '設定でこの保管庫を削除し、Google または GitHub で再度ログインしてください。すべてのログイン情報がアカウントから戻ります。',
  'unlock.device': '{method} で開く',
  'unlock.key': 'セキュリティキーで開く',
  'unlock.keyBody': 'セキュリティキーを接続するか、下に入力してください。',
  'unlock.or': 'または',
  'unlock.unlocking': 'ロック解除中…',
  'unlock.forgot': '忘れましたか？',
  'unlock.forgotBody':
    'マスターパスワードは、この保管庫を開ける唯一のキーで、どこにも保存されません。これがなければ保管庫は開けません。設定から削除して、やり直すことしかできません。',

  // Vault
  'vault.search': '検索',
  'vault.lock': 'ロック',
  'vault.settings': '設定',
  'vault.add': '新しいログイン情報',
  'vault.onThisPage': '{site} の項目',
  'vault.all': 'すべてのログイン情報',
  'vault.empty': 'ログイン情報はまだありません',
  'vault.emptyBody':
    'サイトにログインすると、Passhold が保存を提案します。ここで追加するか、ブラウザーからインポートしてください。',
  'vault.import': 'パスワードをインポート',
  'vault.noResults': '「{query}」に一致するものはありません。',
  'vault.fill': '入力',
  'vault.copyUsername': 'ユーザー名をコピー',
  'vault.copyPassword': 'パスワードをコピー',
  'vault.noUsername': 'ユーザー名なし',
  'vault.count': { other: '{count} 件' },
  'vault.everything': 'すべての項目',

  // Asking for a rating, once, after real use
  'rating.title': 'Passhold は役に立っていますか？',
  'rating.body': 'ストアで評価していただくと、ほかの人が Passhold を見つけやすくなります。',
  'rating.rate': '評価する',
  'rating.later': '後で',

  // What a list shows, and what can be added
  'kinds.label': '表示',
  'kinds.all': 'すべて',
  'kinds.logins': 'ログイン情報',
  'kinds.cards': 'カード',
  'kinds.addresses': '住所',
  'kinds.notes': 'メモ',
  'kinds.noLogins': 'ログイン情報はまだありません。',
  'kinds.noCards':
    'カードはまだありません。上の + から追加すると、チェックアウトで選んだとき、Passhold が入力します。',
  'kinds.noAddresses':
    '住所はまだありません。上の + から追加すると、フォームで住所を求められたとき、Passhold が入力します。',
  'kinds.noNotes':
    'メモはまだありません。メモには、ログイン以外のもの（Wi-Fi のパスワードやライセンスキーなど）を、ほかの項目と一緒に暗号化して保存します。',
  'add.menu': '追加',
  'add.login': 'ログイン情報',
  'add.card': 'カード',
  'add.address': '住所',
  'add.note': 'メモ',
  'place.label': '保管庫',
  'place.mine': '自分のもの',
  'place.of': '{vault}、{family} で共有',
  'move.to': '{vault} に移動',
  'move.confirm':
    '{family} のすべてのメンバーが、これを {vault} で見ることができ、変更もできます。自分の保管庫からは移動されます。以前のパスワードは残ります。',
  'move.do': '移動',
  'family.unlockTitle': '{family} の共有保管庫を、このブラウザーで開く',
  'family.unlockBody':
    '一度だけ Keyrook アカウントのパスワードが必要です。これにより、このブラウザーからファミリーにご自身のキーを渡せるようになります。どこにも送信されません。',
  'family.unlockOnPage': 'account.keyrook.com の「Family」ページを開き、そこで家族用の鍵を Passhold に渡してください。',
  'family.password': 'Keyrook アカウントのパスワード',
  'family.unlock': '開く',
  'family.openPage': 'ファミリーのページを開く',
  'family.keyChanged': '{family} での {who} のキーが変わりました',
  'family.newSender': '{family} のキーは {who} から届きましたが、このブラウザーはまだ {who} を知りません',
  'family.keyChangedBody': '2人がコードを照合するまで、Passhold はその人から何も受け取りません。電話するか直接会ってください。相手が、account.keyrook.com の「Family」ページで、あなたの名前の横にあるコードの照合を選びます。',
  'family.showCode': 'コードを表示',
  'family.codeIs': 'あなたのコード',
  'family.match': 'コードは一致しています',
  'family.differ': '一致しません',
  'family.differed':
    'その場合は信頼しないでください。ファミリーの管理者に伝えてください。それまで Passhold は、その人から何も受け取りません。',
  'family.someone': '誰か',
  'family.waiting':
    '{family} の管理者がまだあなたを承認していません。管理者が承認すると、共有されている内容がここで開きます。',
  'family.rotate':
    '{family} を退出した人がいて、Passhold はまだすべてのキーを変更していません。共有保管庫で変更された内容は、このブラウザーで待機します。このままの場合は、ファミリーのページでキーを変更してください。',
  'family.rotateCompare':
    '{family} を退出した人がいます。上のコードを照合すると、Passhold はすべての人に新しいキーを渡します。それまで、共有保管庫で変更された内容は、このブラウザーで待機します。',
  'family.rotateWait':
    '{family} を退出した人がいます。管理者の Passhold が同期のたびにキーを変更するまで、共有保管庫であなたが行った変更は、このブラウザーで待機します。その人が内容を読めないようにするためです。',
  'family.left': '{who} は {family} のメンバーではなくなりました',
  'family.leftBody':
    'Passhold には理由がわかりません。心当たりがない場合は、ご本人かファミリーの管理者に確認してください。',
  'family.title': 'ファミリー',
  'family.description': '家族のメンバーと、家族で共有する保管庫。家族は account.keyrook.com の「Family」ページで管理します：招待、メンバーの削除、鍵の変更。',
  'family.none': 'このアカウントはどの家族にも入っていません。家族は account.keyrook.com の「Family」ページで作成します。',
  'family.youOrganise': 'あなたはこのファミリーの管理者です。',
  'family.youMember': 'あなたはこのファミリーのメンバーです。',
  'family.you': '（あなた）',
  'family.organiser': '管理者',
  'family.notCompared': 'コードを照合せずに参加',
  'family.keyNew': 'キーが変更されました。コードを照合するまで、その人からは何も受け取りません',
  'family.membersLater': 'このブラウザーで開くと、メンバーが表示されます。',
  'family.sharedVaults': '共有の保管庫',
  'family.vaultWaits': 'キーを管理者が変更するまで、この保管庫の変更は待機します',

  // Cards, addresses and notes
  'wallet.updated': '{date} に変更',
  'wallet.copyField': '{field} をコピー',
  'card.untitled': 'カード',
  'card.newTitle': '新しいカード',
  'card.editTitle': 'カードを編集',
  'card.titleHint': '空欄のままにすると、カードのブランドと下 4 桁から名前が付きます。',
  'card.number': 'カード番号',
  'card.numberCheck': 'この番号は検証に合いません。各桁を確認してください。',
  'card.holder': 'カード名義人',
  'card.expiry': '有効期限',
  'card.month': '月',
  'card.year': '年',
  'card.code': 'セキュリティコード',
  'card.empty': 'カード番号か名前を入力してください。',
  'card.expired': 'このカードは期限切れです。',
  'card.expiredOn': '{expiry} 期限切れ',
  'card.copyNumber': 'カード番号をコピー',
  'card.copyExpiry': '有効期限をコピー',
  'address.untitled': '住所',
  'address.newTitle': '新しい住所',
  'address.editTitle': '住所を編集',
  'address.titleHint': '自宅、勤務先など。空欄のままにすると、中の氏名から付きます。',
  'address.name': '氏名',
  'address.organization': '会社名',
  'address.street': '番地・建物名',
  'address.city': '市区町村',
  'address.region': '都道府県・州',
  'address.postalCode': '郵便番号',
  'address.country': '国・地域',
  'address.chooseCountry': '国・地域を選択',
  'address.phone': '電話番号',
  'address.email': 'メールアドレス',
  'address.address': '住所',
  'address.empty': '氏名か、住所の一部を入力してください。',
  'note.untitled': 'タイトルなしのメモ',
  'note.newTitle': '新しいメモ',
  'note.editTitle': 'メモを編集',
  'note.title': 'タイトル',
  'note.text': 'メモ',
  'note.empty': 'タイトルを入力するか、何か書いてください。',
  'note.edited': '{date} 編集',

  // Pending save, in the popup
  'pending.saveTitle': 'このログイン情報を保存しますか？',
  'pending.updateTitle': 'パスワードを更新しますか？',
  'pending.lockedTitle': 'いま使ったログイン情報を保存しますか？',
  'pending.body': '{site} の {username}',
  'pending.bodyNoUser': '{site} のパスワード',
  'pending.save': '保存',
  'pending.update': '更新',
  'pending.never': 'このサイトでは今後表示しない',

  // Item
  'item.username': 'ユーザー名',
  'item.password': 'パスワード',
  'item.website': 'ウェブサイト',
  'item.websites': 'ウェブサイト',
  'item.notes': 'メモ',
  'item.favorite': 'お気に入り',
  'item.unfavorite': 'お気に入りから削除',
  'item.addFavorite': 'お気に入りに追加',
  'item.trash': 'ゴミ箱に移動',
  'item.updated': 'パスワードを {date} に変更',
  'item.history': '以前のパスワード',
  'item.weak': 'このパスワードは弱く、推測されやすいです。',
  'item.reused': {
    other:
      'このパスワードは、ほかの {count} 件のログイン情報でも使われています。いずれかのサイトから漏れると、すべてが開かれてしまいます。',
  },
  'item.changePassword': 'サイトで変更',
  'item.openSite': '{site} を開く',
  'item.passkey': 'パスキー',
  'item.passkeyBody': '{site} 用、{date} に保存',

  // Edit
  'edit.newTitle': '新しいログイン情報',
  'edit.editTitle': 'ログイン情報を編集',
  'edit.title': '名前',
  'edit.titleHint': '空欄のままにすると、ウェブサイト名になります。',
  'edit.username': 'ユーザー名またはメールアドレス',
  'edit.password': 'パスワード',
  'edit.generate': '生成',
  'edit.websites': 'ウェブサイト',
  'edit.websitesHint': '1 行に 1 つずつ。Passhold は、このログイン情報をこれらのサイトで提案します。',
  'edit.notes': 'メモ',
  'edit.empty': '名前、ユーザー名、パスワードのいずれかを入力してください。',

  // Fields of an item's own, and folders
  'fields.title': 'カスタム項目',
  'fields.add': '項目を追加',
  'fields.name': '項目名',
  'fields.value': '値',
  'fields.hidden': 'パスワードのように隠す',
  'fields.remove': 'この項目を削除',
  'fields.unnamed': '項目',
  'fields.copy': '{name} をコピー',
  'folders.label': 'フォルダ',
  'folders.placeholder': 'フォルダなし',
  'folders.choose': 'フォルダの一覧',
  'folders.hint': '仕事、家族、銀行など、関連するものをまとめて、一度に 1 つのフォルダを表示できます。',
  'folders.all': 'すべてのフォルダ',
  'folders.none': 'フォルダに入っていない',
  'folders.count': { other: '{count} 件' },
  'folders.nothingHere': 'このフォルダにこの種類のものはありません。',
  'folders.rename': '名前を変更',
  'folders.renameTo': 'フォルダの新しい名前',
  'folders.remove': 'フォルダを削除',
  'folders.removeHint': '中の項目は残り、フォルダには入っていない状態になります。',

  // Generator
  'generator.length': '長さ',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': '似た文字を除く（I l 1 O 0）',
  'generator.again': '別のもの',
  'generator.use': 'このパスワードを使う',
  'generator.bits': '{bits} ビット',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold はロックされています。',
  'menu.unlock': 'Passhold のロックを解除',
  'menu.unlockHint': 'ツールバーの Passhold をクリックしてロックを解除し、ここに戻ってください。',
  'menu.none': '{site} の保存済みログイン情報はありません。',
  'menu.uninitialized': '先に Passhold を設定してください。ツールバーでクリックします。',
  'menu.suggest': '強いパスワードを使う',
  'menu.suggestBody':
    '新しいパスワードを入力します。フォームが送信されると、Passhold が保存を提案します。',
  'menu.fillFor': '{site} で入力',
  'menu.hidden': 'このページで何かに覆われているため、Passhold は入力しません。',
  'menu.passkey': 'パスキー · {username}',
  'menu.noCards': 'Passhold にカードはまだありません。ツールバーの Passhold から追加してください。',
  'menu.noAddresses': 'Passhold に住所はまだありません。ツールバーの Passhold から追加してください。',
  'menu.cardInsecure':
    'このページは安全ではありません（http）。Passhold はここにカードを入力しません。途中で誰かに読み取られるおそれがあります。',

  // A website's passkey
  'passkey.saveTitle': '{site} のパスキーを保存しますか？',
  'passkey.save': 'パスキーを保存',
  'passkey.saveElsewhere': '別の場所に保存',
  'passkey.useElsewhere': '別の場所のパスキーを使う',
  'passkey.existsTitle': 'このパスキーは Passhold に既にあります',
  'passkey.ok': 'OK',
  'passkey.signInTitle': '{site} にログイン',
  'passkey.signInBody': 'Passhold に保存されたパスキーを使います',
  'passkey.none': 'Passhold に {site} のパスキーはありません。',
  'passkey.hidden': 'このページで何かに覆われているため、Passhold は応答しません。',

  // Save prompt on a page
  'prompt.save': 'ログイン情報を Passhold に保存しますか？',
  'prompt.update': 'Passhold のパスワードを更新しますか？',
  'prompt.saveButton': '保存',
  'prompt.updateButton': '更新',
  'prompt.never': 'このサイトでは今後表示しない',
  'prompt.saved': 'Passhold に保存しました。',
  'prompt.locked': 'ツールバーの Passhold をクリックしてロックを解除してください。そこで保存を求められます。',
  'prompt.saveCard': 'カードを Passhold に保存しますか？',
  'prompt.updateCard': 'Passhold のカードを更新しますか？',
  'prompt.saveAddress': '住所を Passhold に保存しますか？',
  'prompt.saveCheckout': 'カードと住所を Passhold に保存しますか？',

  // Settings
  'settings.title': '設定',
  'settings.cannotOpen': 'まったく開けませんか？ このブラウザーから保管庫を削除',
  'settings.encryptedHere': 'この端末で暗号化',
  'settings.source': 'GitHub でソースを見る',

  'nav.passwords': 'パスワード',
  'nav.accountSync': 'アカウントと同期',
  'nav.family': 'ファミリー',
  'nav.account': 'Keyrook アカウント',
  'nav.backup': 'バックアップとインポート',
  'nav.security': 'セキュリティ',
  'nav.general': '一般',
  'nav.needsAttention': '要対応',

  'account.description':
    'ログインすると、Passhold にログインしたどのブラウザーにもログイン情報が追従します。まずこの端末で暗号化されるため、Keyrook のサーバーはログイン情報も、どのサイトのものかも読めません。',
  'account.email': 'メール',
  'account.password': 'Keyrook アカウントのパスワード',
  'account.signIn': 'ログイン',
  'account.signingIn': 'ログイン中…',
  'account.note':
    'Keyrook Authenticator と同じアカウントです。Google または GitHub で作成したものは、そのボタンでログインします。',
  'account.haveOne': 'アカウントを持っています',
  'account.create': 'アカウントを作成',
  'account.sendCode': 'コードをメールで送る',
  'account.createNote':
    'Keyrook は、アドレスがご本人のものであることを確認するため、6 桁のコードをメールで送ります。そのアドレスが既にアカウントを持っている場合は、メールでその旨をお知らせします。そのアカウントでログインしてください。',
  'account.codeSent': '{email} にコードを送信しました。15 分間有効です。',
  'account.code': '6 桁のコード',
  'account.newPassword': 'Keyrook アカウントのパスワード',
  'account.passwordNote':
    'このパスワードは、どのブラウザーでも Keyrook アカウントを開きます。Passhold と Keyrook Authenticator の両方で使われます。Keyrook はこのパスワードを見ることができず、代わりにリセットすることもできません。次に発行されるリカバリーキーが、新しいパスワードを設定する方法です。',
  'account.createButton': 'アカウントを作成',
  'account.creating': '作成中…',
  'account.otherEmail': '別のアドレスを使う',
  'account.signedInAs': '{email} としてログイン中',
  'account.signedInAsNamed': '{name}（{email}）としてログイン中',
  'account.synced': '{date} に同期',
  'account.notSynced': 'まだ同期されていません',
  'account.syncNow': '今すぐ同期',

  // The account, at the foot of the popup
  'accountBar.synced': '{time} に同期',
  'accountBar.justNow': 'たった今',
  'accountBar.syncing': '同期中…',
  'accountBar.signedOut': 'ログアウトしました。同期するには再度ログインしてください',
  'accountBar.startedOver': 'アカウントを作り直しました。再度ログインしてください',
  'accountBar.removed': 'アカウントから削除されました。同期するには再度ログインしてください',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'Keyrook アカウントから削除されました',
  'removed.body':
    '{date}、このブラウザーは Keyrook アカウントから削除されました。そのため Passhold は、アカウントのログイン情報、カード、住所、メモをこのブラウザーから削除し、ログアウトさせました。ここで追加または変更されて送信されなかったものは、このブラウザー独自のものとして残っています。残りを戻すには、再度ログインしてください。',

  // Passwords, in Settings
  'passwords.description':
    'Passhold のすべてのログイン情報、パスキー、カード、住所、メモです。項目を選ぶと、表示、コピー、変更ができます。',
  'passwords.all': 'すべて',
  'passwords.attention': '要対応',
  'passwords.weak': '弱い',
  'passwords.reused': '使い回し',
  'account.syncDone': '同期しました。',
  'account.removed': {
    other: 'ほかの端末で完全に削除された {count} 件の項目を、ここからも削除しました。',
  },
  'account.skipped': {
    other: '{count} 件のレコードは開けなかったため、そのまま残しました。',
  },
  'account.manage': 'Keyrook アカウントを管理',
  'account.manageBody':
    'パスワードの変更、新しいリカバリーキーの作成、アカウントの作り直しは account.keyrook.com で行います。Passhold と Keyrook Authenticator の両方に適用されます。',
  'account.manageBodyProvider':
    '新しいリカバリーキーの作成、またはアカウントの作り直しは account.keyrook.com で行います。Passhold と Keyrook Authenticator の両方に適用されます。',
  'account.manageOpen': '開く',
  'account.signOut': 'ログアウト',
  'account.signOutBody':
    '最後の同期の後、このブラウザーからすべてのログイン情報を削除します。再度ログインすると戻ります。',
  'account.signOutConfirm':
    'Passhold がもう一度同期してから、このブラウザーから保管庫を削除します。ログイン情報がアカウントに届いていない場合は、何も削除しません。',
  'account.signOutButton': 'ログアウトして削除',
  'account.signedOutByServer': 'Keyrook がこのブラウザーをログアウトさせました。同期を続けるには再度ログインしてください。',
  'account.startedOver':
    'Keyrook アカウントは {date} に作り直されたため、Keyrook はこのブラウザーをログアウトさせました。新しいパスワードでログインしてください。ここのログイン情報は、新しいキーでアップロードされます。',
  'account.startedOverProvider':
    'Keyrook アカウントは {date} に作り直されたため、Keyrook はこのブラウザーをログアウトさせました。Google または GitHub でログインしてください。ここのログイン情報は、新しいキーでアップロードされます。',
  'account.forgot': 'パスワードを忘れましたか？',
  'account.recoverBody':
    'Keyrook がアカウントのアドレスにコードをメールで送ります。届いたコード、アカウント作成時に保存したシートにあるアカウントのリカバリーキー、新しいパスワードを入力してください。ほかのブラウザーやアプリでこのアカウントにログインしている場合は、新しいパスワードを求められます。',
  'account.recoveryKey': 'アカウントのリカバリーキー',
  'account.recoverPassword': '新しいアカウントのパスワード',
  'account.recoverButton': '新しいパスワードを設定',
  'account.recovering': '設定中…',
  'account.backToSignIn': 'ログインに戻る',
  'startOver.link': 'リカバリーキーも失いましたか？ アカウントを作り直す',
  'startOver.title': 'アカウントを作り直す',
  'needsRoot.body':
    'Keyrook Authenticator で受け取ったアカウントのリカバリーキーがあれば入力してください。そのキーで Passhold も開けます。ない場合は、Passhold がアカウント用の新しいリカバリーキーを作成します。これは一度だけ表示され、古いキーは使えなくなります。',
  'needsRoot.sheet': 'Keyrook Authenticator のアカウントのリカバリーキー（お持ちの場合）',
  'needsRoot.withSheet': 'このキーを使う',
  'needsRoot.newSheet': '新しいリカバリーキーを作成',
  'startOver.body':
    'メールアドレスしか残っていない場合、アカウントは新しいキーと新しいリカバリーキーで作り直せます。依頼から 1 週間後に有効になり、それまではログイン中のブラウザーが取り消せます。そのため、メールアドレスだけを持つ人は、アカウントを奪えません。アカウントが持っていたものは、暗号化されたまま Keyrook が 90 日間保管します。以前のパスワードか以前のリカバリーキーで戻せます。',
  'startOver.button': '作り直す',
  'startOver.working': '作り直し中…',
  'startOver.kitBody':
    'アカウントの新しいリカバリーキーです。アカウントが作り直された後に使えます。Passhold はこの時点でのみ表示します。先に進む前に保管してください。',
  'startOver.waitTitle': 'アカウントは {date} に作り直されます',
  'startOver.waitBody':
    'それまで何も変わりません。ログイン中のブラウザーは取り消せます。Keyrook は、いまと前日と当日に {email} へメールを送ります。',
  'startOver.waitThen':
    'その後は、新しいパスワードでここにログインしてください。このブラウザーのログイン情報は、アカウントの新しいキーでアップロードされます。以前に保管されていたものは 90 日間残ります。',
  'startOver.waitThenProvider':
    'その後は、これまでどおり Google または GitHub でここにログインしてください。このブラウザーのログイン情報は、アカウントの新しいキーでアップロードされます。以前に保管されていたものは 90 日間残ります。',
  'startOver.understood': 'わかりました',
  'startOver.doneTitle': 'アカウントが作り直されました',
  'startOver.doneBody':
    '新しいパスワードでログインしてください。このブラウザーのログイン情報は、アカウントの新しいキーでアップロードされます。以前に保管されていたものは 90 日間残ります。',
  'startOver.doneBodyProvider':
    'これまでどおり Google または GitHub でログインしてください。このブラウザーのログイン情報は、アカウントの新しいキーでアップロードされます。以前に保管されていたものは 90 日間残ります。',
  'startOverWait.title': 'Keyrook アカウントは {date} に作り直されます',
  'startOverWait.body':
    'これは Keyrook がメールで送ったコードで依頼され、「{device}」と名乗る端末から行われました。ご本人でない場合は、誰かがメールを読めるおそれがあります。今すぐ取り消し、そのうえでメールのパスワードを変更してください。ご本人の場合は、そのままにしてください。',
  'startOverWait.bodyNoName':
    'これは Keyrook がメールで送ったコードで依頼されました。ご本人でない場合は、誰かがメールを読めるおそれがあります。今すぐ取り消し、そのうえでメールのパスワードを変更してください。ご本人の場合は、そのままにしてください。',
  'startOverWait.cancel': '作り直しを取り消す',
  'kept.title': {
    other: 'アカウントが作り直される前に保管されていたもの：{count} 件',
  },
  'kept.body': '{date} まで。以前のアカウントのパスワードか以前のリカバリーキーで、Passhold に戻せます。',
  'kept.open': '戻す',
  'kept.secret': '以前のアカウントのパスワードまたはリカバリーキー',
  'kept.done': { other: '{count} 件を戻しました。' },
  'kept.nothingNew': '保管されていたものは、すべてここにあります。',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': '{provider} で続ける',
  'provider.passwordTitle': 'この Keyrook アカウントにはパスワードがあります',
  'provider.passwordBody':
    '{provider} で {email} としてログインしました。ここで Passhold を開くのは、アカウントのパスワードです。一度入力してください。',
  'provider.openAccountPage': 'account.keyrook.com を開く',
  'secondStep.title': '2 段階認証でのログイン',
  'secondStep.body':
    'Keyrook の認証アプリに表示される 6 桁のコードを入力してください。アプリを紛失した場合は、代わりに Keyrook アカウントのリカバリーキーを入力してください。',
  'secondStep.ownerBody':
    'このアカウントでは、ここでも 2 段階の確認が必要です。認証アプリに表示されるコード、またはアカウントのリカバリーキーを使ってください。',
  'secondStep.field': 'コード、またはリカバリーキー',
  'secondStep.continue': '続ける',
  'secondStep.passkey': '代わりにパスキーを使う',
  'secondStep.nextBody':
    'アカウントにキーを渡すにもコードが必要で、各コードは一度しか使えません。認証アプリに新しいコードが表示されるまで待ってから、それを入力するか、アカウントのリカバリーキーを入力してください。',
  'provider.or': 'または',
  'provider.signedInWith': '{provider} で {email} としてログイン中',
  'provider.signedInWithNamed': '{provider} で {name}（{email}）としてログイン中',
  'provider.newTitle': 'Keyrook アカウントを作成',
  'provider.newBody':
    '{provider} で {email} としてログインしています。このアカウントにはパスワードがありません。ログインは {provider} が行います。別のコンピューターでは、ログイン済みのブラウザーが承認するか、次に発行されるリカバリーキーを使います。',
  'provider.joinTitle': 'このブラウザーの参加を承認',
  'provider.joinBody':
    '{email} はここでログインしていますが、ログイン情報を開くキーは、ほかのコンピューターにあります。そのどれかで Passhold を開き、「設定」→「アカウントと同期」から、このブラウザーの参加を承認してください。',
  'provider.waiting': '別のブラウザーを待っています…',
  'provider.compare': 'もう一方のブラウザーにコードが表示されます。そのブラウザーが同じものである場合にのみ承認してください：',
  'provider.ended': 'このブラウザーが承認される前に、この依頼は終了しました。',
  'provider.askAgain': 'もう一度依頼',
  'provider.useKit': '代わりにリカバリーキーを使う',
  'provider.useThisKey': 'このキーを使う',
  'provider.needsRoot':
    '{email} は、各 Keyrook アプリが独自のキーを持つ前に Keyrook Authenticator で作成されました。Passhold は、{provider} で再度確認すると、いま独自のキーを作成できます。Authenticator の内容は変わりません。',
  'provider.confirmWith': '{provider} で確認',
  'provider.noKeyYet':
    'Passhold はまだどこでも {email} にログインしていないため、ほかのブラウザーはこのブラウザーを承認できません。アカウントのリカバリーキーで開けます。',
  'passkey.onLabel': '新しいコンピューターではパスキーで開く',
  'passkey.offLabel': '新しいコンピューター用のパスキーなし',
  'passkey.body':
    '新しいコンピューターでは：{provider}、そのあとパスキー。すると、すべてのログイン情報が届きます。パスキーは Google Password Manager が保存し、ログインするすべての Chrome で使えます。',
  'passkey.bodyEdge':
    '新しいコンピューターでは：{provider}、そのあとパスキー。すると、すべてのログイン情報が届きます。同期される場所に保存されたパスキーは、ほかの端末でも使えます。',
  'passkey.turnOn': 'オンにする',
  'passkey.turnOff': 'オフにする',
  'passkey.joinTitle': 'パスキーで開く',
  'passkey.joinBody':
    '{email} には新しいコンピューター用のパスキーがあります。それで確認すると、ログイン情報が届きます。',
  'passkey.use': 'パスキーを使う',
  'passkey.otherWays': 'ほかの方法で入る',
  'pairing.asking': '{device} が、あなたのアカウントへの参加を求めています。',
  'pairing.start': '承認…',
  'pairing.notMe': '自分ではない',
  'pairing.compare': '新しいブラウザーに同じコードが表示された場合にのみ承認してください：',
  'pairing.match': 'コードが一致 — 承認',
  'pairing.differ': 'コードが一致しません',

  'accountKit.title': 'アカウントのリカバリーキーを保存',
  'accountKit.body':
    'Keyrook アカウントのパスワードを忘れた場合、このキーで新しいパスワードを設定できます。Passhold と Keyrook Authenticator の両方に適用されます。Keyrook はパスワードを見ることができないため、この方法しかありません。設定でもう一度表示できますが、別の場所にも保管してください。',
  'accountKit.fileTitle': 'Keyrook アカウントのリカバリーキー',
  'accountKit.fileBody':
    'Keyrook アカウントのパスワードを忘れた場合、このキーで新しいパスワードを設定できます。Passhold の「設定」→「アカウントと同期」→「パスワードを忘れましたか？」から行ってください。このキーとメールアドレスを持つ人は誰でも同じことができるため、安全に保管し、このコンピューターには置かないでください。',
  'accountKit.bodyNoPassword':
    'このアカウントにはパスワードがありません。ログイン済みのブラウザーが、新しいブラウザーの参加を承認できます。残っていなければ、このキーで承認できます。Passhold と Keyrook Authenticator の両方に適用されます。設定でもう一度表示できますが、別の場所にも保管してください。',
  'accountKit.fileBodyNoPassword':
    'Keyrook アカウントにログインしているコンピューターが 1 台も残っていない場合、このキーで新しいコンピューターを承認できます。Google または GitHub でログインし、「代わりにリカバリーキーを使う」を選んでください。このキーを持ち、かつあなたとしてログインできる人は、同じことができるため、安全に保管し、このコンピューターには置かないでください。',
  'accountKit.whenTitleNoPassword': 'ログイン中のコンピューターが 1 台も残っていないとき',
  'accountKit.inPassholdNoPassword':
    'Passhold では：Google または GitHub でログインし、「代わりにリカバリーキーを使う」を選んで、このキーを入力します。',
  'accountKit.keepNoPassword':
    'このシートは、コンピューターから離れた安全な場所に保管してください。このシートがあれば、あなたの Google または GitHub アカウントにログインできる人は、あなたの Keyrook アカウントを開けます。',
  'accountKit.rowBodyNoPassword': 'ほかにコンピューターが残っていない場合に、新しいコンピューターを承認します。',
  'accountKit.sheetTitle': 'Keyrook アカウントのリカバリーキット',
  'accountKit.whenTitle': 'アカウントのパスワードを忘れたとき',
  'accountKit.inPasshold':
    'Passhold では：「設定」→「アカウントと同期」→「パスワードを忘れましたか？」を選び、メールアドレス、Keyrook が送ったコード、このキー、新しいパスワードを入力します。',
  'accountKit.inAuthenticator':
    'Keyrook Authenticator でも同じキーを使えます。ログインを求められた画面の「パスワードを忘れましたか？」を選んでください。',
  'accountKit.keep':
    'このシートは、コンピューターから離れた安全な場所に保管してください。このシートとメールの受信箱を持つ人は、アカウントの新しいパスワードを設定できます。',
  'accountKit.pending': 'アカウントのリカバリーキーは未保管です',
  'accountKit.keptState': 'アカウントのリカバリーキーを保管しました',
  'accountKit.elsewhere': 'アカウントのリカバリーキーは別の場所で作成',
  'accountKit.none': 'アカウントのリカバリーキーはありません',
  'accountKit.rowBody':
    'アカウントのパスワードを忘れた場合に、新しいパスワードを設定します。新しいキーを作ると、古いキーはすべてのアプリで使えなくなります。',
  'accountKit.elsewhereBody':
    'account.keyrook.com、Keyrook Authenticator、または別のブラウザーで作成されたものです。そのキーは、そのとき保管されたシートにあります。ここで新しく作成すると、そのキーは使えなくなります。',
  'accountKit.noneBody':
    'リカバリーキーがなければ、アカウントのパスワードを忘れた場合にリセットできず、Keyrook に保存されたものも開けません。このブラウザーのログイン情報は、どちらの場合も残ります。',
  'accountKit.make': '作成する',
  'accountKit.apart':
    'メールとは別に保管してください。このキーを持ち、かつメールを読める人は、新しいパスワードを設定でき、あなたのログイン情報を開けます。キーを自分宛にメールで送ったり、そのメールのクラウドドライブに保存したりしないでください。',
  'accountKit.apartNoPassword':
    'ログインに使う Google または GitHub のアカウントとは別に保管してください。このキーを持ち、かつそのアカウントとしてログインできる人は、あなたのログイン情報を開けます。キーを自分宛にメールで送ったり、そのアカウントのクラウドドライブに保存したりしないでください。',
  'accountKit.unchecked': 'アカウントのリカバリーキーは未確認です',
  'accountKit.uncheckedBody':
    'アカウントにはリカバリーキーがあります。account.keyrook.com または別のアプリで作成されたものです。一度入力してください。Passhold がアカウントを開けることを確認し、あとで表示するために保管します。',
  'accountKit.typeIt': '入力する',
  'accountKit.checked': 'アカウントを開けることを確認しました。ここで表示できるように、Passhold が保管します。',
  'accountKit.draftBody':
    'アカウントの新しいリカバリーキーです。まだ使えません。保管して入力し直した後、アカウントのパスワードで設定すると、古いキーは使えなくなります。',
  'accountKit.setTitle': '新しいリカバリーキーを設定',
  'accountKit.setBody':
    'Keyrook アカウントのパスワードを入力してください。入力するまでは、古いリカバリーキーが使えます。新しいキーはまだ使えません。',
  'accountKit.set': '設定する',
  'checkup.clear': '修正するものはありません',
  'checkup.clearBody': '弱いパスワードや使い回しのパスワードはなく、バックアップも最新です。',
  'checkup.issues': { other: '{count} 件の確認事項' },
  'checkup.issuesBody': '以下の各項目に、重要な理由と修正方法を記載しています。',
  'checkup.backup': 'バックアップ',
  'checkup.access': '開く方法',
  'checkup.recoveryPending':
    'この保管庫用に作成されたリカバリーキーは、保管済みとして確認されていません。{method} が使えなくなった場合に開く唯一の方法です。新しく作成して、保管してください。',
  'checkup.deviceMissing':
    'この保管庫にはマスターパスワードがありません。そのため、ここで {method} が使えないと、ロック解除のたびにリカバリーキーを求められます。',
  'checkup.lastBackup': '最終バックアップ {date}',
  'checkup.backupNever':
    'このブラウザーを失うと、ログイン情報も失われます。バックアップは、別の場所に保管する暗号化された 1 つのファイルです。',
  'checkup.backupDue': 'それ以降、保管庫は変更されています。すべてを含めるため、新しくバックアップを作成してください。',
  'checkup.backUp': '今すぐバックアップ',
  'checkup.weak': { other: '{count} 件の弱いパスワード' },
  'checkup.weakBody':
    '短い、または単純すぎて推測されやすいものです。各パスワードは、そのサイトで変更してください。Passhold はフォームで強いパスワードを提案し、保存を申し出ます。',
  'checkup.weakNone': 'なし。',
  'checkup.reused': { other: '{count} 件のパスワードが複数回使われています' },
  'checkup.reusedBody':
    'サイトからパスワードが漏れると、そのパスワードは他のサイトでも試されます。ログイン情報ごとに別のパスワードにしてください。',
  'checkup.reusedNone': 'なし。すべてのログイン情報に、それぞれ別のパスワードがあります。',
  'checkup.sharedBy': { other: '{count} 件のログイン情報で共有されています' },
  'checkup.change': '変更',
  'checkup.limits':
    'Passhold は、パスワードがデータ流出で見つかったかどうかを確認しません。確認にはサーバーへの問い合わせが必要ですが、Passhold はどのサーバーにも問い合わせません。また、古いパスワードについても通知しません。強くてほかで使っていないパスワードは、時間が経っても劣化しません。',

  'backup.description': '暗号化されたコピーを保存したり、戻したり、ログイン情報を出し入れしたりします。',
  'backup.backupRow': '保管庫全体を、マスターパスワードで暗号化した 1 つのファイルに保存します。',
  'backup.restoreRow': 'バックアップファイル内のログイン情報を、この保管庫に追加します。',
  'backup.importRow': '別のブラウザーやパスワード マネージャーから、CSV ファイルまたは Bitwarden の JSON で取り込みます。',
  'backup.exportRow': '他のアプリで読める CSV ファイル。暗号化されません。',

  'security.description': 'Passhold の開き方と、閉じるタイミングです。',
  'security.locking': 'ロック',
  'security.opensTitle': 'Passhold の開き方',
  'security.opensBody':
    'マスターパスワードはありません。{method} で開き、{method} が使えない場合はリカバリーキーで開きます。',
  'security.setPassword': '代わりにマスターパスワードを使う',
  'security.setPasswordBody':
    'その後、Passhold は選んだパスワードで開きます。リカバリーキーでは開けなくなります。',
  'security.setPasswordOpen': '設定する',
  'security.setPasswordSave': 'このパスワードを使う',
  'security.dropPassword': 'マスターパスワードの使用をやめる',
  'security.dropPasswordBody':
    '{method} だけで開きます。{method} が使えない場合に備えて、リカバリーキーを保管してください。マスターパスワードでは保管庫を開けなくなります。',
  'security.dropPasswordOpen': '切り替える',
  'security.dropPasswordSave': '切り替えて、リカバリーキーを表示',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': 'お使いの端末の画面ロック',
  'device.method.passkey': 'お使いのパスキー',
  'device.title': '{method} で開く',
  'device.description': '最も手早く開けます。ブラウザーを再起動した後も使えます。',
  'device.on': 'オン',
  'device.off': 'オフ',
  'device.body':
    '指紋または顔認証で Passhold を開きます。多くのコンピューターでは、コンピューター自体のパスワードでも開けます。そのため、このコンピューターのロックを解除できる人は、Passhold を開けます。この方法で開くための情報はこのコンピューターに残り、このコンピューターなしでは役に立ちません。',
  'device.whereMac':
    'Chrome がパスキーの保存先を尋ねたら、Google Password Manager を選んでください。Chrome のプロファイルにあるパスキーでは Passhold のロックを解除できません。すべての Mac の iCloud Keychain でも同様です。',
  'device.whereMacEdge':
    'Edge がパスキーの保存先を尋ねたら、ほかの端末でも同期される場所を選んでください。すべての場所で Passhold のロックを解除できるわけではありません。選んだ場所で解除できない場合は、Passhold がそう伝えます。何も変更されません。',
  'device.unavailable': 'ここでは利用できません',
  'device.unavailableBody':
    'このブラウザーでは、Passhold が使える指紋、顔、画面ロックが見つかりませんでした。PIN ならどこでも使えます。',
  'device.unavailableRecovery':
    'このブラウザーでは、Passhold が使える指紋、顔、画面ロックが見つからなかったため、ここではこの保管庫をリカバリーキーで開きます。入力のほうがよい場合は、マスターパスワードを設定してください。',
  'device.opensWith': '{method} で Passhold を開く',
  'device.notHere': 'このブラウザーでは {method} が設定されていません',
  'device.isTheWayIn':
    'マスターパスワードがない場合、Passhold はこの方法で開きます。オフにするには、先にマスターパスワードを設定してください。',
  'device.setUpHere': '{method} をこのブラウザーで設定するまで、ロック解除のたびにリカバリーキーを求められます。',
  'device.setUp': '設定',
  'device.turnOff': 'オフにする',
  'device.save': '{method} を設定',
  'keys.title': 'セキュリティキーで開く',
  'keys.description': 'USB キーを接続して開きます。もう 1 つの方法で、ブラウザーを再起動した後も使えます。',
  'keys.method': 'お使いのセキュリティキー',
  'keys.on': { other: '{count} 個のキーを設定済み' },
  'keys.off': 'キーは設定されていません',
  'keys.body':
    'キーを接続し、その PIN を入力してタッチすると、Passhold が開きます。このコンピューターでのみ有効です。キーを持ち、その PIN を知っている人は、ここで Passhold を開けるため、家の鍵と同様に扱ってください。紛失した場合は、ここから削除してください。ほかの方法での開き方は引き続き使えます。',
  'keys.add': 'キーを追加',
  'keys.save': 'このキーを追加',
  'keys.one': 'セキュリティキー',
  'keys.added': '{date} に追加',
  'keys.remove': '削除',
  'pin.title': 'PIN で開く',
  'pinOffer.title': 'PIN で Passhold をすばやく開く',
  'pinOffer.body':
    'Passhold がロックされるたびに、パスワードの代わりに数桁を入力します。ブラウザーを閉じるまで有効です。ブラウザーを起動し直した後は、パスワードを 1 回入力します。',
  'pinOffer.later': 'PIN はいつでも、設定の「セキュリティ」で設定またはオフにできます。',
  'pin.description': '同じブラウザーを使っている間に、1 日に何度も Passhold がロックされる場合向けです。',
  'pin.on': 'オン',
  'pin.off': 'オフ',
  'pin.bodyRecovery':
    'ブラウザーが開いている間だけ有効で、間違いは 5 回までです。その後、またはブラウザーを再起動した後は、端末またはリカバリーキーが必要です。PIN で開くものは、ディスクに保存されません。',
  'pin.body':
    'ブラウザーが開いている間だけ有効で、間違いは 5 回までです。その後、またはブラウザーを再起動した後は、マスターパスワードが必要です。PIN で開くものは、ディスクに保存されません。',
  'pin.setUp': 'PIN を設定',
  'pin.change': '変更',
  'pin.turnOff': 'オフにする',
  'pin.new': 'PIN、6〜12 桁の数字',
  'pin.again': 'もう一度入力',
  'pin.save': 'PIN を保存',

  'general.description': 'Passhold のウェブサイトでの動作と、見た目の設定です。',
  'general.filling': '入力と保存',
  'general.appearance': '言語と外観',
  'settings.autoSuggest': 'ログイン、カード、住所の入力欄をクリックしたときに候補を表示',
  'settings.autoSuggestBody':
    'サイトのログイン情報、サインアップフォームの強いパスワード、チェックアウトのカードと住所です。選ぶまで何も入力されません。',

  'trash.description': 'ログイン情報、カード、住所、メモは、復元するか完全に削除するまでここに残ります。',
  'trash.sharedDescription':
    'ファミリーと共有しています。その中のだれでも、これらを復元できます。完全に削除されると、全員の分が消えます。',
  'trash.sharedMember':
    'ファミリーと共有しています。これらは復元できます。完全に削除できるのは、ファミリーの管理者だけです。',
  'settings.autoLock': '自動ロックまでの時間',
  'settings.autoLock.never': 'ブラウザーを閉じたときのみ',
  'settings.autoLock.minutes': { other: '{count} 分' },
  'settings.autoLock.hours': { other: '{count} 時間' },
  'settings.lockWithSystem': 'コンピューターがロックされるか、スリープしたときにロックする',
  'settings.clipboard': 'コピーしたパスワードを消去するまでの時間',
  'settings.clipboard.never': 'しない',
  'settings.clipboard.seconds': { other: '{count} 秒' },
  'settings.clipboard.minutes': { other: '{count} 分' },
  'settings.inlineButton': 'ログイン、カード、住所の入力欄に Passhold のボタンを表示',
  'settings.offerToSave': 'ログインしたときに、ログイン情報の保存を提案する',
  'settings.offerToSaveCards': '支払い時に、カードと住所の保存を提案する',
  'settings.offerToSaveCardsBody':
    'カードは、安全な（https）ページからのみ、番号が検証に合うものだけを保存します。カードは下 4 桁で表示され、番号やセキュリティコードは表示されません。',
  'settings.passkeys': 'パスキーを保存して使う',
  'settings.passkeysBody':
    'サイトがパスキーを提供すると、Passhold はそれをログイン情報と一緒に保存し、それでログインします。オフにすると、パスキーはブラウザーに任せられます。',
  'settings.language': '言語',
  'settings.language.auto': 'ブラウザーと同じ',
  'settings.theme': '外観',
  'settings.theme.system': 'システムと同じ',
  'settings.theme.light': 'ライト',
  'settings.theme.dark': 'ダーク',

  'settings.security': 'マスターパスワード',
  'settings.securityBody': '変更すると、保管庫の鍵が再設定されます。ログイン情報はそのままです。',
  'settings.current': '現在のマスターパスワード',
  'settings.new': '新しいマスターパスワード',
  'settings.confirm': '新しいパスワードをもう一度入力',
  'settings.change': 'マスターパスワードを変更',
  'settings.changeOpen': '変更',
  'settings.changed': 'マスターパスワードを変更しました。',

  'settings.backup': 'バックアップ',
  'settings.backupBody':
    '保管庫全体を 1 つの暗号化ファイルに保存します。このコンピューター以外の場所（USB ドライブやクラウドストレージなど）に保管してください。そうすれば、このブラウザーを失ってもログイン情報は失われません。作成時のマスターパスワードでのみ開けます。',
  'settings.backupBodyRecovery':
    '保管庫全体を 1 つの暗号化ファイルに保存します。このコンピューター以外の場所（USB ドライブやクラウドストレージなど）に保管してください。そうすれば、このブラウザーを失ってもログイン情報は失われません。リカバリーキーで開けます。',
  'settings.backupLast': '最終バックアップ：{date}',
  'settings.backupNever': 'まだバックアップはありません。',
  'settings.backupButton': 'バックアップをダウンロード',
  'settings.backupDone': 'ダウンロードフォルダーに保存しました。次に、このコンピューター以外の場所へ移動してください。',

  'settings.restoreBackup': 'バックアップから復元',
  'settings.restoreBodyNew':
    'このブラウザーにはまだ保管庫がありません。バックアップファイルから戻してください。そのバックアップ作成時のマスターパスワードで開きます。または、ツールバーの Passhold ボタンから新しく作成してください。',
  'settings.restoreBodyMerge':
    'バックアップの内容をこの保管庫に追加します。ここにあるものは削除されません。同じログイン情報がある場合は、新しい編集内容を残し、もう一方のパスワードは履歴に入ります。',
  'settings.restoreChoose': 'バックアップファイルを選択',
  'settings.restoreMade': 'バックアップ作成日：{date}',
  'settings.restorePassword': 'バックアップのマスターパスワード',
  'settings.restoreRecoveryKey': 'バックアップのリカバリーキー',
  'settings.restoreButton': '復元',
  'settings.restoreNew': { other: '保管庫を復元しました（{count} 件の項目）。' },
  'settings.restoreAdded': { other: 'バックアップから {count} 件の項目を追加しました。' },
  'settings.restoreUpdated': { other: 'バックアップ内の {count} 件の項目に、より新しい編集がありました。' },
  'settings.restoreNothing': 'バックアップの内容は、すべてこの保管庫にあります。',

  'settings.import': 'インポート',
  'settings.importBody':
    'Chrome、Edge、Firefox、Safari、Apple Passwords、Bitwarden、1Password、LastPass、KeePass、Dashlane、Proton Pass、NordPass からパスワードを取り込みます。それぞれで CSV ファイルとしてエクスポートし、ここで選んでください。ファイル内のカード、住所、メモも取り込まれます。Bitwarden からは JSON（暗号化されていないもの）でエクスポートしてください。Bitwarden の CSV にはカード、ID、パスキーが含まれません。Dashlane はそれらを別のファイルに分けます。順番に 1 つずつ選んでください。',
  'settings.importChoose': 'ファイルを選択',
  'settings.importFound': '取り込むもの：{what}。',
  'settings.importLogins': { other: '{count} 件のログイン情報' },
  'settings.importPasskeys': { other: '{count} 件のパスキー' },
  'settings.importCards': { other: '{count} 件のカード' },
  'settings.importAddresses': { other: '{count} 件の住所' },
  'settings.importNotes': { other: '{count} 件のメモ' },
  'settings.importSkipped': {
    other: '{count} 件は Passhold が保存しない内容のみのため、除外されます。',
  },
  'settings.importDuplicates': { other: '{count} 件は、保管庫に既にあります。' },
  'settings.importConfirm': 'インポート',
  'settings.importDone': '{what} をインポートしました。',
  'settings.importDelete': '次に CSV ファイルを削除してください。パスワードがプレーンテキストで含まれています。',
  'settings.importNothing': 'そのファイルには、新しく取り込むものはありません。',
  'settings.importTwoFactor': {
    other:
      'このファイルの {count} 件のログイン情報には、2 段階認証（2FA）コードがあります。Passhold は 2FA コードを保存しません。古いパスワード マネージャーを削除する前に、認証アプリに移してください。移さないと、そのアカウントにログインできなくなる場合があります。',
  },
  'settings.importAuthenticator': 'Keyrook Authenticator を入手',
  'settings.importPasskeysLeft': {
    other:
      'このファイルの {count} 件のパスキーは Passhold に移せません。ほかの方法でそのサイトにログインし、Passhold で新しいパスキーを作るまで、古いパスワード マネージャーを残してください。',
  },

  'settings.export': 'エクスポート',
  'settings.exportBody':
    'すべてのブラウザーとパスワード マネージャーで読める CSV ファイルです。パスワードがプレーンテキストで含まれるため、必要な間だけ保管してください。含まれるのはログイン情報のみです。パスキー、カスタム項目、フォルダ、カード、住所、メモは含まれません。バックアップにはすべて含まれます。',
  'settings.exportButton': 'CSV をエクスポート',
  'settings.exportDone': 'エクスポートしました。使い終わったらファイルを削除してください。',

  'settings.neverSave': '保存を提案しないサイト',
  'settings.neverSaveEmpty':
    'サイトはありません。Passhold が保存を提案したときに「このサイトでは今後表示しない」を選ぶと、ここに表示されます。',
  'settings.remove': '削除',

  'settings.trash': 'ゴミ箱',
  'settings.trashEmpty': 'ゴミ箱は空です。',
  'settings.restore': '復元',
  'settings.deleteForever': '完全に削除',
  'settings.emptyTrash': 'ゴミ箱を空にする',
  'settings.emptyTrashConfirm': 'ゴミ箱のすべての項目を完全に削除しますか？',

  'settings.danger': '保管庫を削除',
  'settings.dangerBody':
    'このブラウザーから保管庫を削除します。中のログイン情報はすべて完全に失われます。残しておきたい場合は、先にバックアップをダウンロードしてください。',
  'settings.dangerType': '確認のため {word} と入力',
  'settings.dangerWord': '削除',
  'settings.dangerButton': '保管庫を削除',

  'settings.about': 'Passhold {version} · Keyrook 提供',

  // Errors
  'error.noWorker': 'Passhold から応答がありません。閉じてから、もう一度お試しください。',
  'error.wrongPassword': 'マスターパスワードが違います。',
  'error.passwordTooShort': '{min} 文字以上で入力してください。',
  'error.vaultCorrupt': 'この端末の保管庫は破損しており、開けません。',
  'error.vaultTooNew': 'この保管庫は、より新しい Passhold で作成されました。開くには Passhold を更新してください。',
  'error.itemNotFound': 'その項目は、もう保管庫にありません。',
  'error.familyOrganiserOnly': 'このファミリーの保管庫のゴミ箱を空にできるのは、ファミリーの管理者だけです。',
  'error.familyGone': 'そのファミリーはもうここにありません。同期してから、もう一度確認してください。',
  'error.familyNotOpen': 'このブラウザーではまだそのファミリーを開けません。同期してから、もう一度お試しください。',
  'error.itemInvalid': 'そのままでは保存できません。',
  'error.importEmpty': 'そのファイルには、取り込むものがありません。',
  'error.importTooLarge': 'そのファイルは大きすぎて取り込めません。',
  'error.importUnknownFormat': 'そのファイルはパスワードのエクスポートファイルではないようです。',
  'error.importEncrypted':
    'その Bitwarden のエクスポートは暗号化されており、Passhold では開けません。Bitwarden で「.json (Encrypted)」ではなく「.json」として再度エクスポートし、そのファイルを選んでください。',
  'error.backupInvalid': 'そのファイルは Passhold のバックアップではないか、破損しています。',
  'error.backupWrongPassword': 'このバックアップを作成したときのマスターパスワードではありません。',
  'error.backupWrongRecoveryKey': 'このバックアップを作成したときのリカバリーキーではありません。',
  'error.noRecoveryKey': 'この保管庫には表示するリカバリーキーがありません。マスターパスワードで開きます。',
  'error.wrongRecoveryKey': 'リカバリーキーが違います。',
  'error.deviceNeeded':
    'マスターパスワードのない保管庫は、この端末のロック解除で開きます。先に設定してください。マスターパスワードを設定するまで、この状態は続きます。',
  'error.accountOffline': 'Keyrook に接続できませんでした。接続を確認して、もう一度お試しください。',
  'error.accountWrong':
    'メールアドレスまたはパスワードが違います。Google または GitHub で作成したアカウントは、そのボタンでログインします。',
  'error.accountSignedOut': 'Keyrook がこのブラウザーをログアウトさせました。再度ログインしてください。',
  'error.accountBusy': { other: '試行回数が多すぎます。{count} 秒待ってから、もう一度お試しください。' },
  'error.accountFailed': 'Keyrook は今すぐには処理できませんでした。しばらくしてから、もう一度お試しください。',
  'error.accountAlready': 'この保管庫は既に Keyrook アカウントにログインしています。',
  'error.accountNone': 'この保管庫は Keyrook アカウントにログインしていません。',
  'error.accountKdfRefused':
    'Keyrook が、Passhold が受け付けない弱い鍵を要求したため、ログインを中止しました。',
  'error.accountKeyWrong': 'アカウントの鍵は、そのパスワードでは開けません。',
  'error.accountCode':
    'そのコードは正しくないか、期限切れです。メールを確認するか、新しいコードを依頼してください。',
  'error.accountMail': 'Keyrook は今すぐメールを送信できませんでした。1 分ほどしてから、もう一度お試しください。',
  'error.providerDenied': 'ログインはキャンセルされました。',
  'error.providerFailed': 'Google または GitHub は今すぐログインできませんでした。もう一度お試しください。',
  'error.providerExpired': 'そのログインは終了しています。もう一度始めてください。',
  'error.providerNotOwner':
    'Keyrook アカウントがログインに使うアカウントではありません。Keyrook で使っているものでもう一度ログインしてください。',
  'error.signOutUnsent': {
    other:
      '{count} 件の項目はまだ Keyrook アカウントに届いていないため、何も削除されませんでした。接続を確認するか、再度ログインしてから、ログアウトしてください。',
  },
  'error.providerOtherProvider':
    'このメールアドレスの Keyrook アカウントは、Google と GitHub のうち別のもので既にログインしています。そちらでログインしてください。',
  'error.providerHasPassword':
    'このメールアドレスの Keyrook アカウントには、既にパスワードがあります。ここではメールアドレスとパスワードでログインしてください。または、Google や GitHub でもログインできるようにするには、パスワードでログインした状態で account.keyrook.com からアカウントに追加してください。',
  'error.providerEmailTaken':
    'このメールアドレスの Keyrook アカウントは、ほかの方法でログインします。その方法でログインしてください。または、そのアカウントが今ログインしている方法で account.keyrook.com にログインし、この方法を追加してください。',
  'error.pairingWrongKey':
    '届いたものはこのアカウントのキーではないため、拒否しました。もう一度依頼し、信頼できるブラウザーからのみ承認してください。',
  'error.pairingRefused':
    'そのリクエストは、コードを確認したブラウザーからのものではないため、拒否しました。もう一度依頼してください。',
  'error.pairingEnded': 'そのリクエストは終了しました。新しいブラウザーからもう一度依頼してください。',
  'error.passkeyWrong': 'そのパスキーではこのアカウントを開けません。別の方法で入ってください。',
  'error.joinExpired': 'そのログインは待ち時間が長すぎました。もう一度ログインしてください。',
  'error.accountPasswordWrong': 'アカウントのパスワードが違います。',
  'error.accountNoKit': 'Passhold はこのアカウントのリカバリーキーを保持していません。',
  'error.accountKitRace':
    '別のアプリが、たった今アカウントのリカバリーキーを変更しました。同期してから、もう一度お試しください。',
  'error.accountKitShape': 'アカウントのリカバリーキーの形式ではありません。英字と数字の 32 文字です。',
  'error.accountKitWrong': 'そのリカバリーキーは、このメールアドレスのアカウントと一致しません。',
  'error.accountKitNotThis': 'このアカウントのリカバリーキーではありません。保管したものをもう一度確認してください。',
  'error.accountPasswordWeak':
    'アカウントには推測されやすすぎます。文字、数字、記号を組み合わせた長いパスワード、または関係のない 4〜5 個の単語を使ってください。',
  'error.accountBoxWrong':
    'このアカウントにある Passhold の鍵は開けませんでした。もう一度ログインしてください。それでも開けない場合は、アカウントを作り直してください。',
  'error.accountCodeWait': {
    other: 'コードは少し前に送信されました。{count} 秒後に、もう一度依頼できます。',
  },
  'error.accountSignUpKeys':
    'Keyrook は Passhold 独自の鍵を求めましたが、送信されませんでした。Passhold を更新して、もう一度お試しください。',
  'error.accountIdTaken': 'たった今、アカウントを作成できませんでした。新しいコードを依頼して、もう一度お試しください。',
  'error.accountNoRoot':
    'このアカウントには、まだリカバリーキーで開ける鍵がありません。パスワードで再度ログインしてください。',
  'error.accountRootNotHeld':
    'このコンピューターは、アカウントの鍵を保持していることを確認できませんでした。パスワードまたはリカバリーキーで再度ログインしてください。',
  'error.accountRootChanged':
    'このアカウントの鍵は、別のコンピューターで置き換えられました。Passhold がまだログインしているコンピューターでログインするか、アカウントを作り直してください。',
  'error.accountKeyReplaced':
    'このアカウントにある Passhold の鍵は、別のコンピューターで置き換えられました。もう一度ログインしてください。',
  'error.accountSessionStolen':
    'このコンピューターのセッションが別の場所から使われたため、ログアウトされました。もう一度ログインしてください。',
  'error.accountOld':
    'このアカウントは、各 Keyrook アプリが独自の鍵を持つ前に Google または GitHub で作成されたため、そのままでは Passhold の鍵で開けません。メールアドレスでアカウントを作り直すと、鍵が作成されます。',
  'error.pairingBusy':
    'このアカウントへの参加を待っているブラウザーが多すぎます。数分後にもう一度お試しください。',
  'error.startOverExpired': '期限が切れました。新しいコードを依頼して、もう一度始めてください。',
  'error.startOverTooOften':
    'このアカウントは最近、作り直しを何度も行いました。{day} 以降にもう一度お試しください。',
  'error.startOverWaiting':
    'このアカウントは {day} に作り直されます。ログイン中のブラウザーは、それを取り消せます。',
  'error.startOverUpdate':
    'Keyrook は現在、アカウントを作り直す前に 1 週間待ちます。依頼するには Passhold を更新してください。',
  'error.passkeyFailed': 'そのパスキーは確認できませんでした。もう一度お試しください。',
  'error.passkeyNotYou':
    'そのパスキーでは、本人であることを確認できませんでした。もう一度お試しいただき、求められたとおりにロックを解除してください。',
  'error.passkeyUnknown':
    'そのパスキーは、どの Keyrook アカウントにもありません。削除されたおそれがあります。パスワード、または Google か GitHub でログインしてください。',
  'error.passkeyExpired': 'そのパスキーの依頼は終了しています。もう一度お試しください。',
  'error.passkeyNotOffered': 'Keyrook は、ここではまだパスキーを提供していません。',
  'error.passkeyNoUnlock': 'そのパスキーではサインインできますが、アカウントのロック解除には設定されていません。account.keyrook.com の「Passkeys」で、そのパスキーの横の「Let it unlock」を選んでから、もう一度お試しください。パスワード、または Google や GitHub でサインインしてください。',
  'error.passkeyNoPrf': 'そのパスキーで account.keyrook.com にはサインインできますが、保存先ではアカウントのロックを解除できません。たとえば macOS 15 より前の iCloud キーチェーンは対応していません。account.keyrook.com の「Passkeys」で、ロックを解除できる場所に保存されたパスキー（セキュリティキーなど）を追加し、「Unlocks your data」と表示されるか確認してください。それまでは、パスワード、または Google や GitHub でサインインしてください。',
  'error.passkeyPermission':
    'Passhold には、account.keyrook.com のパスキーを使う Chrome の許可が必要です。パスキーをもう一度選び、許可してください。',
  'error.passkeyPermissionEdge':
    'Passhold には、account.keyrook.com のパスキーを使う Edge の許可が必要です。パスキーをもう一度選び、許可してください。',
  'error.passkeyCancelled': 'パスキーは使われませんでした。もう一度お試しいただくか、別の方法でログインしてください。',
  'error.secondStepNeeded': 'アカウントでは 2 段階目が必要です。認証アプリのコードも入力してください。',
  'error.secondStepWrong':
    'そのコードは正しくありません。認証アプリに今表示されているコード、またはリカバリーキーを入力してください。',
  'error.signInExpired': 'そのログインは期限切れです。もう一度ログインしてください。',
  'error.secondStepUpdate': 'アカウントのログインには 2 段階目が必要です。ログインするには Passhold を更新してください。',
  'error.secondStepAsked': 'アカウントでは 2 段階目が必要です。認証アプリのコードを入力してください。',
  'error.secondStepTaken':
    'それはログインに使ったコードで、各コードは一度しか使えません。認証アプリに新しいコードが表示されるまで待ってください。',
  'error.kitDraftGone':
    '新しいリカバリーキーは時間内に設定されず、何も変わりませんでした。もう一度、新しく作成してください。',
  'error.archiveWrong': 'それでは、保管されていたものは開けません。',
  'error.archiveGone': 'それは、もう保管されていません。',
  'error.archiveDeleteRefused':
    '期限切れになる前に保管されていたものを削除できるのは、以前のパスワードか以前のリカバリーキーだけです。',
  'error.accountNeedsRoot':
    'このアカウントは、各 Keyrook アプリが独自の鍵を持つ前に Keyrook Authenticator で作成されました。Passhold は今、アカウントに独自の鍵を作成できます。Authenticator の内容は変わりません。',
  'error.accountServerWrong':
    'Keyrook のサーバーが、このアカウントの鍵と一致しない応答を返したため、Passhold は停止しました。しばらくしてから、もう一度お試しください。',
  'error.startOverNeedsPassword': 'このアカウントにはパスワードがあります。作り直すには、新しいパスワードを選んでください。',
  'error.pinInvalid': 'PIN は 6〜12 桁の数字です。',
  'error.wrongPin': 'PIN が違います。',
  'error.wrongPinLeft': { other: 'PIN が違います。あと {count} 回試せます。' },
  'error.pinLockedOut':
    'PIN の入力を間違えすぎました。ほかの方法でロックを解除してください。その後、PIN は再び使えます。',
  'error.pinUnavailable':
    'PIN は、ブラウザーが開いている間だけ使えます。ほかの方法でロックを解除してください。その後、PIN は再び使えます。',
  'error.deviceGone': 'この端末によるロック解除は、もう設定されていません。ほかの方法でロックを解除してください。',
  'error.deviceKeyWrong':
    'Passhold を開けませんでした。ほかの方法でロックを解除し、端末のロック解除をもう一度設定してください。',
  'error.deviceUnsupported':
    'そのパスキーが保存された場所では、Passhold が開くための鍵を作れません。もう一度試し、Google Password Manager に保存するか、PIN を使ってください。',
  'error.deviceUnsupportedEdge':
    'そのパスキーが保存された場所では、Passhold が開くための鍵を作れません。もう一度試し、ほかの場所に保存するか、PIN を使ってください。',
  'error.deviceCancelled': 'ロックは解除されませんでした。キャンセルされたか、時間がかかりすぎました。',
  'error.keyUnsupported':
    'このキーでは、Passhold が開くために必要なものを用意できません。ほとんどの FIDO2 キーは対応しています。2 段階認証専用（U2F）に作られたキーは対応していません。',
  'error.keyAlreadyAdded': 'そのキーは、ここで既に設定されています。',
  'error.keyGone': 'そのセキュリティキーは、ここではもう設定されていません。ほかの方法でロックを解除してください。',
  'error.keyWrong':
    'そのキーでは Passhold を開けませんでした。ほかの方法でロックを解除してから、キーを削除してもう一度追加してください。',
  'error.kdfUnsupported': 'この保管庫の設定は、Passhold が受け付けるものではありません。',
  'error.locked': 'Passhold はロックされています。',
  'error.noVault': 'まだ保管庫はありません。',
  'error.vaultExists': '保管庫は既にあります。',
  'error.notOnPage': 'そのログイン情報は、このタブのページ用ではありません。',
  'error.expired': '期限が切れました。もう一度お試しください。',
  'error.noFields': 'このページには、Passhold が入力できるものがありません。',
  'error.cardInsecure': 'Passhold は、安全な（https）ページでのみカードを入力します。',
  'error.unknown': '問題が発生しました：{detail}',
};
