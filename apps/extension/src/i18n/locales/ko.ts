import type { Dictionary } from './en.js';

export const dictionary: Dictionary = {
  'app.by': 'Keyrook 제공',

  // Common
  'common.cancel': '취소',
  'common.close': '닫기',
  'common.save': '저장',
  'common.edit': '수정',
  'common.back': '뒤로',
  'common.show': '표시',
  'common.hide': '숨기기',
  'common.notNow': '나중에',

  // Setup
  'setup.title': '금고 만들기',
  'setup.body':
    'Passhold는 비밀번호를 이 기기에서 암호화해 보관합니다. 마스터 비밀번호 하나로 모두 열 수 있습니다. 기억할 수 있는 비밀번호를 고르고, 다른 곳에서는 사용하지 마세요.',
  'setup.password': '마스터 비밀번호',
  'setup.confirm': '다시 입력',
  'setup.mismatch': '두 비밀번호가 일치하지 않습니다.',
  'setup.tooShort': '{min}자 이상 입력하세요.',
  'setup.understand':
    'Passhold와 Keyrook을 포함해 누구도, 이 비밀번호를 잊으면 금고를 복구할 수 없다는 것을 이해했습니다.',
  'setup.create': '금고 만들기',
  'setup.creating': '만드는 중…',
  'setup.restore': '백업에서 복원',

  // Strength
  'setup.deviceBody':
    'Passhold는 비밀번호를 이 기기에서 암호화해 보관하며, {method}(으)로 열 수 있습니다. 외워야 하는 마스터 비밀번호는 없습니다. {method}(으)로 열 수 없는 날을 대비한 복구 키도 함께 받습니다.',
  'setup.deviceWhereMac': 'Chrome이 패스키를 어디에 저장할지 물으면 Google Password Manager를 선택하세요.',
  'setup.deviceWhereMacEdge':
    'Edge가 패스키를 어디에 저장할지 물으면, 다른 기기에서도 함께 동기화되는 곳을 선택하세요. 모든 곳에서 Passhold를 열 수 있는 것은 아닙니다. 선택한 곳에서 열 수 없으면 Passhold가 그렇게 알려 줍니다.',
  'setup.createWithDevice': '{method}(으)로 만들기',
  'setup.usePassword': '대신 마스터 비밀번호 사용',
  'setup.useDevice': '대신 {method} 사용',
  'setup.signIn': '로그인하거나 Keyrook 계정 만들기',

  'welcome.title': '모든 컴퓨터에서 쓰는 내 비밀번호',
  'welcome.body':
    '한 번만 로그인하세요. Passhold는 지문으로 열리고, 대신 입력해 주며, 로그인 정보는 로그인하는 곳이면 어디서든 쓸 수 있습니다.',
  'welcome.email': '이메일 주소 사용',
  'gate.touchTitle': '터치로 열기',
  'gate.touchBody': 'Touch ID 또는 Windows Hello로 Passhold가 열립니다. 만들어 외워야 할 마스터 비밀번호가 없습니다.',
  'gate.everywhereTitle': '사용하는 모든 컴퓨터에서',
  'gate.everywhereBody': '다른 컴퓨터에서 로그인하면 비밀번호와 패스키도 그대로 있습니다.',
  'gate.privateTitle': '읽을 수 있는 사람은 나뿐입니다',
  'gate.privateBody':
    '보내기 전에 이 컴퓨터에서 먼저 암호화합니다. Keyrook은 비밀번호도, 그것이 어느 사이트의 것인지도 읽을 수 없습니다.',
  'welcome.note':
    '먼저 이 컴퓨터에서 암호화합니다. Keyrook은 비밀번호도, 어느 사이트의 것인지도 읽을 수 없습니다.',
  'connect.title': 'Keyrook 계정 켜기',
  'connect.body':
    '사용하는 모든 컴퓨터에서 쓰는 로그인 정보입니다. 이 컴퓨터를 잃어버려도 다시 찾을 수 있습니다.',
  'connect.email': '이메일',
  'kitCheck.title': '계정 복구 키 확인',
  'kitCheck.body': '한 번 입력해 보고, 필요한 날에 가지고 있는지 미리 확인하세요.',
  'accountPasskey.button': '패스키로 계속',
  'accountPasskey.working': '패스키를 기다리는 중…',
  'accountPasskey.hint':
    'account.keyrook.com에서 추가한 패스키입니다. 처음에는 {browser}에서 Passhold의 사용을 허용할지 묻습니다.',
  'accountPasskey.openPasskeys': 'account.keyrook.com에서 “Passkeys” 열기',
  'join.title': 'Keyrook에 로그인',
  'join.body':
    'Passhold와 Keyrook Authenticator가 함께 쓰는 Keyrook 계정은 하나입니다. 로그인 정보는 계정에서 이 브라우저로 내려옵니다.',
  'join.createTitle': 'Keyrook 계정 만들기',
  'join.createBody':
    'Passhold와 Keyrook Authenticator가 함께 쓰는 계정 하나입니다. 로그인 정보는 로그인하는 모든 컴퓨터에 보내기 전에, 먼저 이 기기에서 암호화됩니다.',
  'join.lockTitle': '{email} 계정으로 로그인됨',
  'join.lockBodyDevice':
    '마지막 단계입니다. 이 컴퓨터에서 Passhold는 {method}(으)로 열립니다. 설정이 끝나면 로그인 정보가 바로 내려옵니다.',
  'join.cancel': '다른 계정 사용',
  'join.lockBodyCode':
    '마지막 단계입니다. 이 컴퓨터에서 Passhold를 여는 코드를 사용합니다. 설정이 끝나면 로그인 정보가 바로 내려옵니다.',
  'join.opening': 'Passhold를 여는 중…',
  'setup.useAccountPassword': '대신 계정 비밀번호 사용',
  'setup.useCode': '대신 이 컴퓨터용 코드 사용',
  'security.accountPasswordTitle': 'Keyrook 계정 비밀번호로 열기',
  'security.accountPasswordBody':
    '비밀번호 하나로 둘 다 열립니다. 비밀번호가 바뀌면 여기의 Passhold는 다음 로그인 때 따라갑니다.',

  'recovery.title': '복구 키 저장',
  'recovery.body':
    '이 기기를 잃어버리거나 잠금 해제가 되지 않으면, 이 키로 금고와 백업을 다시 열 수 있습니다. Passhold가 아직 열리는 동안에는 설정에서 다시 볼 수 있습니다. 그러니 인쇄본, 휴대폰, 또는 이 컴퓨터가 아닌 파일 등 다른 곳에도 보관하세요.',
  'recovery.download': '다운로드',
  'recovery.copy': '복사',
  'recovery.copied': '복사됨',
  'recovery.print': '인쇄',
  'recovery.qr': 'QR 코드 표시',
  'recovery.qrHide': 'QR 코드 숨기기',
  'recovery.qrLabel': '복구 키 QR 코드',
  'recovery.qrHint': '휴대폰 카메라를 대고 텍스트를 메모에 저장하거나, 사진을 찍어 두세요.',
  'recovery.show': '표시',

  'kit.title': 'Passhold 복구 키트',
  'kit.made': '{date} 생성',
  'kit.keyLabel': '복구 키',
  'kit.whenTitle': 'Passhold가 열리지 않을 때',
  'kit.sameDevice':
    '이 컴퓨터에서 Passhold가 잠금 해제를 요구하면 “대신 복구 키 사용”을 선택하고 키를 입력하세요.',
  'kit.newDevice':
    '새 컴퓨터에서는 Passhold를 설치하고 “백업에서 복원”을 선택한 뒤, 가장 최근 백업 파일을 고르고 키를 입력하세요. 백업이 없으면 복원할 것이 없으니, 반드시 백업을 만들어 두세요.',
  'kit.keep':
    '이 시트는 컴퓨터와 떨어진 안전한 곳에 보관하세요. 이 시트와 금고 사본을 모두 가진 사람은 금고를 열 수 있습니다.',
  'recovery.fileTitle': 'Passhold 복구 키',
  'recovery.fileMade': '{date} 생성',
  'recovery.fileBody':
    '이 키는 기기로 열 수 없을 때 Passhold 금고와 백업을 엽니다. 키와 금고 사본을 모두 가진 사람은 누구든 열 수 있으니 안전하게 보관하고, 같은 컴퓨터에는 두지 마세요.',
  'recovery.pending': '복구 키를 아직 보관하지 않음',
  'recovery.keptState': '복구 키를 보관함',
  'recovery.rowBody':
    '{method}(으)로 열 수 없을 때 금고와 백업을 엽니다. 새로 만들면 이 금고는 이전 키로 열리지 않습니다. 그 전에 만든 백업은 이전 키로 계속 열립니다.',
  'recovery.makeNew': '새로 만들기',
  'recovery.savedIt': '저장했습니다',
  'recovery.checkTitle': '저장했는지 확인',
  'recovery.checkBody':
    '저장해 둔 것(파일, 종이 또는 사진)에서 키의 두 그룹을 입력하세요. 그룹은 하이픈 사이의 네 글자 덩어리로, 왼쪽부터 셉니다.',
  'recovery.group': '{position}번째 그룹',
  'recovery.check': '확인',
  'recovery.checkWrong':
    '키 내용과 일치하지 않습니다. 저장해 둔 것을 다시 확인하거나, 키를 다시 표시해 지금 저장하세요.',
  'recovery.showAgain': '키 다시 표시',
  'recovery.covered': 'Keyrook 계정이 되돌아갈 길입니다',
  'recovery.coveredBody':
    '{method}(으)로 Passhold를 더 이상 열 수 없다면, 이 금고를 삭제하고 계정에 다시 로그인하세요. 모든 로그인 정보가 돌아옵니다. 이 금고의 복구 키는 여기서 계속 확인할 수 있습니다.',

  'proof.recoveryKey': '복구 키',
  'proof.withDevice': '{method}(으)로 확인합니다.',
  'proof.useDevice': '대신 {method}(으)로 확인',
  'proof.usePassword': '대신 마스터 비밀번호 입력',
  'proof.useAccountPassword': '대신 계정 비밀번호 입력',
  'proof.useCode': '대신 코드 입력',
  'proof.useRecoveryKey': '대신 복구 키 입력',
  'strength.0': '매우 약함',
  'strength.1': '약함',
  'strength.2': '보통',
  'strength.3': '강함',
  'strength.4': '매우 강함',
  'strength.short': '길수록 강합니다. 14자 이상을 권장합니다.',
  'strength.digitsOnly': '숫자만으로는 쉽게 추측됩니다.',
  'strength.repeats': '같은 문자를 계속 반복하지 마세요.',

  // Unlock
  'unlock.title': 'Passhold가 잠겨 있습니다',
  'unlock.body': '마스터 비밀번호를 입력하세요.',
  'unlock.password': '마스터 비밀번호',
  'unlock.submit': '잠금 해제',
  'unlock.pinBody': 'PIN을 입력하세요.',
  'unlock.pin': 'PIN',
  'unlock.usePassword': '대신 마스터 비밀번호 사용',
  'unlock.usePin': '대신 PIN 사용',
  'unlock.recoveryBody': '복구 키를 입력하세요.',
  'unlock.deviceBody': '{method}(으)로 열거나, 아래에 입력하세요.',
  'unlock.recoveryKey': '복구 키',
  'unlock.useRecoveryKey': '대신 복구 키 사용',
  'unlock.lost': '들어갈 수 없나요?',
  'unlock.forgotBodyRecovery':
    '기기를 쓸 수 없을 때는 복구 키로 금고를 엽니다. 복구 키도 기기도 없다면 Passhold와 Keyrook을 포함해 누구도 금고를 열 수 없습니다. 설정에서 금고를 삭제하고 처음부터 다시 시작하는 방법밖에 없습니다.',
  'unlock.bodyAccount': 'Keyrook 계정 비밀번호를 입력하세요.',
  'unlock.accountPassword': 'Keyrook 계정 비밀번호',
  'unlock.useAccountPassword': '대신 계정 비밀번호 사용',
  'unlock.forgotBodyAccount':
    'Keyrook 계정 비밀번호입니다. 다른 곳에서 바꿨다면 새 비밀번호를 사용하세요. 완전히 잊었다면, 설정에서 이 금고를 삭제하고 다시 로그인하세요. 새 비밀번호가 필요하면 복구 키를 사용하세요. 그러면 모든 로그인 정보가 돌아옵니다.',
  'unlock.bodyCode': '이 컴퓨터에서 Passhold를 여는 코드를 입력하세요.',
  'unlock.code': '이 컴퓨터용 코드',
  'unlock.useCode': '대신 코드 사용',
  'unlock.forgotBodyCode':
    '설정에서 이 금고를 삭제하고 Google 또는 GitHub로 다시 로그인하세요. 모든 로그인 정보가 계정에서 돌아옵니다.',
  'unlock.device': '{method}(으)로 잠금 해제',
  'unlock.key': '보안 키로 잠금 해제',
  'unlock.keyBody': '보안 키를 연결하거나, 아래에 입력하세요.',
  'unlock.or': '또는',
  'unlock.unlocking': '잠금 해제 중…',
  'unlock.forgot': '잊으셨나요?',
  'unlock.forgotBody':
    '마스터 비밀번호는 이 금고를 여는 유일한 열쇠이며, 어디에도 저장되지 않습니다. 이 비밀번호가 없으면 금고를 열 수 없습니다. 설정에서 삭제하고 처음부터 다시 시작하는 방법밖에 없습니다.',

  // Vault
  'vault.search': '검색',
  'vault.lock': '잠금',
  'vault.settings': '설정',
  'vault.add': '새 로그인 정보',
  'vault.onThisPage': '{site}의 항목',
  'vault.all': '모든 로그인 정보',
  'vault.empty': '아직 로그인 정보가 없습니다',
  'vault.emptyBody': '사이트에 로그인하면 Passhold가 저장을 제안합니다. 여기서 추가하거나 브라우저에서 가져오세요.',
  'vault.import': '비밀번호 가져오기',
  'vault.noResults': '“{query}”에 해당하는 항목이 없습니다.',
  'vault.fill': '입력',
  'vault.copyUsername': '사용자 이름 복사',
  'vault.copyPassword': '비밀번호 복사',
  'vault.noUsername': '사용자 이름 없음',
  'vault.count': { other: '{count}개' },
  'vault.everything': '모든 항목',

  // Asking for a rating, once, after real use
  'rating.title': 'Passhold가 도움이 되셨나요?',
  'rating.body': '스토어에서 평가해 주시면 다른 사람들이 Passhold를 더 쉽게 찾을 수 있습니다.',
  'rating.rate': '평가하기',
  'rating.later': '나중에',

  // What a list shows, and what can be added
  'kinds.label': '표시',
  'kinds.all': '전체',
  'kinds.logins': '로그인 정보',
  'kinds.cards': '카드',
  'kinds.addresses': '주소',
  'kinds.notes': '메모',
  'kinds.noLogins': '아직 로그인 정보가 없습니다.',
  'kinds.noCards':
    '아직 카드가 없습니다. 위의 +로 추가하면, 결제할 때 선택한 경우 Passhold가 입력해 줍니다.',
  'kinds.noAddresses':
    '아직 주소가 없습니다. 위의 +로 추가하면, 양식에서 주소를 요구할 때 Passhold가 입력해 줍니다.',
  'kinds.noNotes':
    '아직 메모가 없습니다. 메모에는 로그인 정보가 아닌 것(와이파이 비밀번호, 라이선스 키 등)을 다른 항목과 함께 암호화해 보관합니다.',
  'add.menu': '추가',
  'add.login': '로그인 정보',
  'add.card': '카드',
  'add.address': '주소',
  'add.note': '메모',
  'place.label': '금고',
  'place.mine': '내 금고',
  'place.of': '{vault}, {family}에서 공유',
  'move.to': '{vault}에 이동',
  'move.confirm':
    '{family}의 모든 구성원이 {vault}에서 이것을 보고 바꿀 수 있습니다. 내 금고에서는 빠집니다. 이전 비밀번호는 원래 금고에 남습니다.',
  'move.do': '이동',
  'family.unlockTitle': '이 브라우저에서 {family}의 공유 금고 열기',
  'family.unlockBody':
    'Passhold는 한 번만 Keyrook 계정 비밀번호가 필요합니다. 그래야 이 브라우저에서 내 키를 가족에게 전달할 수 있습니다. 이 비밀번호는 어디에도 전송되지 않습니다.',
  'family.unlockOnPage': 'account.keyrook.com의 “Family” 페이지를 열고, 거기에서 가족용 키를 Passhold에 전달하세요.',
  'family.password': 'Keyrook 계정 비밀번호',
  'family.unlock': '열기',
  'family.openPage': '가족 페이지 열기',
  'family.keyChanged': '{family}의 {who} 키가 바뀌었습니다',
  'family.newSender': '{family}의 키는 이 브라우저가 아직 모르는 {who}의 것입니다',
  'family.keyChangedBody': '두 사람이 코드를 비교할 때까지 Passhold는 그 사람에게서 아무것도 받지 않습니다. 전화하거나 직접 만나세요. 상대방이 account.keyrook.com의 “Family” 페이지에서 당신의 이름 옆에 코드를 비교하기로 선택합니다.',
  'family.showCode': '코드 표시',
  'family.codeIs': '내 코드',
  'family.match': '코드가 일치합니다',
  'family.differ': '코드가 다릅니다',
  'family.differed':
    '그렇다면 믿지 마세요. 가족의 관리자에게 알리세요. 그 사이 Passhold는 그 사람에게서 아무것도 받지 않습니다.',
  'family.someone': '누군가',
  'family.waiting':
    '{family}의 관리자가 아직 나를 확인하지 않았습니다. 관리자가 확인하면 공유된 내용이 여기서 열립니다.',
  'family.rotate':
    '{family}에서 누군가 나갔고, Passhold가 아직 모든 키를 바꾸지 않았습니다. 공유 금고에서 바꾼 내용은 이 브라우저에서 대기합니다. 계속 이 상태라면 가족 페이지에서 키를 바꾸세요.',
  'family.rotateCompare':
    '{family}에서 누군가 나갔습니다. 위의 코드를 비교하면 Passhold가 모두에게 새 키를 줍니다. 그전까지 공유 금고에서 바꾼 내용은 이 브라우저에서 대기합니다.',
  'family.rotateWait':
    '{family}에서 누군가 나갔습니다. 관리자의 Passhold가 동기화하면서 키를 바꿀 때까지, 공유 금고에서 바꾼 내용은 이 브라우저에서 대기합니다. 그래야 나간 사람이 그 내용을 읽을 수 없습니다.',
  'family.left': '{who}은(는) 더 이상 {family}에 없습니다',
  'family.leftBody':
    'Passhold는 그 이유를 알 수 없습니다. 예상하지 못한 일이라면 본인이나 가족의 관리자에게 물어보세요.',
  'family.title': '가족',
  'family.description': '가족 구성원과 가족이 공유하는 보관함입니다. 가족은 account.keyrook.com의 “Family” 페이지에서 관리합니다: 초대, 구성원 제거, 키 변경.',
  'family.none': '이 계정은 어떤 가족에도 속해 있지 않습니다. 가족은 account.keyrook.com의 “Family” 페이지에서 만듭니다.',
  'family.youOrganise': '나는 이 가족의 관리자입니다.',
  'family.youMember': '나는 이 가족의 구성원입니다.',
  'family.you': '(나)',
  'family.organiser': '관리자',
  'family.notCompared': '코드를 비교하지 않고 참여',
  'family.keyNew': '키가 바뀌었습니다. 코드를 비교하기 전까지 그 사람에게서 아무것도 받지 않습니다',
  'family.membersLater': '이 브라우저에서 열리면 구성원이 여기에 표시됩니다.',
  'family.sharedVaults': '공유 금고',
  'family.vaultWaits': '관리자가 키를 바꿀 때까지 이 금고의 변경 내용은 대기합니다',

  // Cards, addresses and notes
  'wallet.updated': '{date}에 변경됨',
  'wallet.copyField': '{field} 복사',
  'card.untitled': '카드',
  'card.newTitle': '새 카드',
  'card.editTitle': '카드 수정',
  'card.titleHint': '비워 두면 카드 이름이 자동으로 붙습니다. 카드사와 끝 4자리로 이름이 정해집니다.',
  'card.number': '카드 번호',
  'card.numberCheck': '이 번호는 검증에 맞지 않습니다. 각 숫자를 확인하세요.',
  'card.holder': '카드 소유자 이름',
  'card.expiry': '만료',
  'card.month': '월',
  'card.year': '연도',
  'card.code': '보안 코드',
  'card.empty': '카드 번호나 이름을 입력하세요.',
  'card.expired': '이 카드는 만료되었습니다.',
  'card.expiredOn': '{expiry} 만료',
  'card.copyNumber': '카드 번호 복사',
  'card.copyExpiry': '만료일 복사',
  'address.untitled': '주소',
  'address.newTitle': '새 주소',
  'address.editTitle': '주소 수정',
  'address.titleHint': '집, 회사 등. 비워 두면 안의 이름으로 자동 지정됩니다.',
  'address.name': '성명',
  'address.organization': '회사',
  'address.street': '도로명 주소',
  'address.city': '도시',
  'address.region': '시/도 또는 주',
  'address.postalCode': '우편번호',
  'address.country': '국가',
  'address.chooseCountry': '국가 선택',
  'address.phone': '전화번호',
  'address.email': '이메일',
  'address.address': '주소',
  'address.empty': '이름이나 주소의 일부를 입력하세요.',
  'note.untitled': '제목 없는 메모',
  'note.newTitle': '새 메모',
  'note.editTitle': '메모 수정',
  'note.title': '제목',
  'note.text': '메모',
  'note.empty': '제목을 입력하거나 내용을 쓰세요.',
  'note.edited': '{date} 수정됨',

  // Pending save, in the popup
  'pending.saveTitle': '이 로그인 정보를 저장할까요?',
  'pending.updateTitle': '비밀번호를 업데이트할까요?',
  'pending.lockedTitle': '방금 사용한 로그인 정보를 저장할까요?',
  'pending.body': '{site}의 {username}',
  'pending.bodyNoUser': '{site}의 비밀번호',
  'pending.save': '저장',
  'pending.update': '업데이트',
  'pending.never': '이 사이트에서는 다시 묻지 않기',

  // Item
  'item.username': '사용자 이름',
  'item.password': '비밀번호',
  'item.website': '웹사이트',
  'item.websites': '웹사이트',
  'item.notes': '메모',
  'item.favorite': '즐겨찾기',
  'item.unfavorite': '즐겨찾기에서 제거',
  'item.addFavorite': '즐겨찾기에 추가',
  'item.trash': '휴지통으로 이동',
  'item.updated': '비밀번호 변경: {date}',
  'item.history': '이전 비밀번호',
  'item.weak': '이 비밀번호는 약해서 쉽게 추측될 수 있습니다.',
  'item.reused': {
    other:
      '이 비밀번호는 다른 로그인 정보 {count}개에서도 사용됩니다. 한 사이트에서 유출되면 모두 열릴 수 있습니다.',
  },
  'item.changePassword': '사이트에서 변경',
  'item.openSite': '{site} 열기',
  'item.passkey': '패스키',
  'item.passkeyBody': '{site}용, {date} 저장',

  // Edit
  'edit.newTitle': '새 로그인 정보',
  'edit.editTitle': '로그인 정보 수정',
  'edit.title': '이름',
  'edit.titleHint': '비워 두면 웹사이트 이름으로 지정됩니다.',
  'edit.username': '사용자 이름 또는 이메일',
  'edit.password': '비밀번호',
  'edit.generate': '생성',
  'edit.websites': '웹사이트',
  'edit.websitesHint': '한 줄에 하나씩. Passhold는 이 로그인 정보를 이 사이트들에서 제안합니다.',
  'edit.notes': '메모',
  'edit.empty': '이름, 사용자 이름, 비밀번호 중 하나를 입력하세요.',

  // Fields of an item's own, and folders
  'fields.title': '사용자 지정 필드',
  'fields.add': '필드 추가',
  'fields.name': '필드 이름',
  'fields.value': '값',
  'fields.hidden': '비밀번호처럼 숨기기',
  'fields.remove': '이 필드 삭제',
  'fields.unnamed': '필드',
  'fields.copy': '{name} 복사',
  'folders.label': '폴더',
  'folders.placeholder': '폴더 없음',
  'folders.choose': '폴더 목록',
  'folders.hint': '업무, 가족, 은행처럼 묶어서, 한 번에 폴더 하나씩 보세요.',
  'folders.all': '모든 폴더',
  'folders.none': '폴더 없음',
  'folders.count': { other: '{count}개' },
  'folders.nothingHere': '이 폴더에는 이 종류의 항목이 없습니다.',
  'folders.rename': '이름 변경',
  'folders.renameTo': '폴더의 새 이름',
  'folders.remove': '폴더 삭제',
  'folders.removeHint': '안에 있는 항목은 그대로 남고, 폴더에서만 빠집니다.',

  // Generator
  'generator.length': '길이',
  'generator.lower': 'a–z',
  'generator.upper': 'A–Z',
  'generator.digits': '0–9',
  'generator.symbols': '!#$',
  'generator.avoidAmbiguous': '헷갈리는 문자 제외 (I l 1 O 0)',
  'generator.again': '다른 것',
  'generator.use': '이 비밀번호 사용',
  'generator.bits': '{bits}비트',

  // Inline list
  'menu.title': 'Passhold',
  'menu.locked': 'Passhold가 잠겨 있습니다.',
  'menu.unlock': 'Passhold 잠금 해제',
  'menu.unlockHint': '도구 모음의 Passhold를 클릭해 잠금을 해제한 뒤 여기로 돌아오세요.',
  'menu.none': '{site}에 저장된 로그인 정보가 없습니다.',
  'menu.uninitialized': '먼저 Passhold를 설정하세요. 도구 모음에서 클릭하세요.',
  'menu.suggest': '강한 비밀번호 사용',
  'menu.suggestBody': '새 비밀번호를 대신 입력합니다. 양식을 보내면 Passhold가 저장을 제안합니다.',
  'menu.fillFor': '{site}에서 입력',
  'menu.hidden': '이 페이지에서 다른 요소가 Passhold를 가리고 있어 입력하지 않습니다.',
  'menu.passkey': '패스키 · {username}',
  'menu.noCards': 'Passhold에 아직 카드가 없습니다. 도구 모음의 Passhold에서 추가하세요.',
  'menu.noAddresses': 'Passhold에 아직 주소가 없습니다. 도구 모음의 Passhold에서 추가하세요.',
  'menu.cardInsecure':
    '이 페이지는 안전하지 않아(http) Passhold가 여기에 카드를 입력하지 않습니다. 전송 도중 누군가 읽을 수 있습니다.',

  // A website's passkey
  'passkey.saveTitle': '{site}의 패스키를 저장할까요?',
  'passkey.save': '패스키 저장',
  'passkey.saveElsewhere': '다른 곳에 저장',
  'passkey.useElsewhere': '다른 곳의 패스키 사용',
  'passkey.existsTitle': '이 패스키는 이미 Passhold에 있습니다',
  'passkey.ok': '확인',
  'passkey.signInTitle': '{site}에 로그인',
  'passkey.signInBody': 'Passhold에 저장된 패스키로',
  'passkey.none': 'Passhold에 {site}의 패스키가 없습니다.',
  'passkey.hidden': '이 페이지에서 다른 요소가 Passhold를 가리고 있어 응답하지 않습니다.',

  // Save prompt on a page
  'prompt.save': 'Passhold에 로그인 정보를 저장할까요?',
  'prompt.update': 'Passhold의 비밀번호를 업데이트할까요?',
  'prompt.saveButton': '저장',
  'prompt.updateButton': '업데이트',
  'prompt.never': '이 사이트에서는 다시 묻지 않기',
  'prompt.saved': 'Passhold에 저장했습니다.',
  'prompt.locked': '도구 모음의 Passhold를 클릭해 잠금을 해제하세요. 그곳에서 저장하라고 묻습니다.',
  'prompt.saveCard': 'Passhold에 카드를 저장할까요?',
  'prompt.updateCard': 'Passhold의 카드를 업데이트할까요?',
  'prompt.saveAddress': 'Passhold에 주소를 저장할까요?',
  'prompt.saveCheckout': 'Passhold에 카드와 주소를 저장할까요?',

  // Settings
  'settings.title': '설정',
  'settings.cannotOpen': '전혀 열 수 없나요? 이 브라우저에서 금고 삭제',
  'settings.encryptedHere': '이 기기에서 암호화됨',
  'settings.source': 'GitHub에서 소스 보기',

  'nav.passwords': '비밀번호',
  'nav.accountSync': '계정 및 동기화',
  'nav.family': '가족',
  'nav.account': 'Keyrook 계정',
  'nav.backup': '백업 및 가져오기',
  'nav.security': '보안',
  'nav.general': '일반',
  'nav.needsAttention': '확인 필요',

  'account.description':
    '로그인하면 Passhold에 로그인하는 모든 브라우저에서 로그인 정보가 따라옵니다. 먼저 이 기기에서 암호화되므로, Keyrook의 서버는 로그인 정보도, 어느 사이트의 것인지도 읽을 수 없습니다.',
  'account.email': '이메일',
  'account.password': 'Keyrook 계정 비밀번호',
  'account.signIn': '로그인',
  'account.signingIn': '로그인하는 중…',
  'account.note':
    'Keyrook Authenticator와 같은 계정입니다. Google 또는 GitHub로 만든 계정은 해당 버튼으로 로그인합니다.',
  'account.haveOne': '계정이 있습니다',
  'account.create': '계정 만들기',
  'account.sendCode': '이메일로 코드 받기',
  'account.createNote':
    'Keyrook이 주소가 본인 것인지 확인하도록 6자리 코드를 이메일로 보냅니다. 그 주소로 이미 계정이 있다면, 이메일에서 그 사실을 알려 줍니다. 그 계정으로 로그인하세요.',
  'account.codeSent': '{email} 주소로 코드를 보냈습니다. 15분 동안 유효합니다.',
  'account.code': '6자리 코드',
  'account.newPassword': 'Keyrook 계정 비밀번호',
  'account.passwordNote':
    '이 비밀번호는 어느 브라우저에서든 Keyrook 계정을 엽니다. Passhold와 Keyrook Authenticator에 모두 쓰입니다. Keyrook은 이 비밀번호를 볼 수 없고 대신 재설정할 수도 없습니다. 다음에 받게 될 복구 키가 새 비밀번호를 설정하는 방법입니다.',
  'account.createButton': '계정 만들기',
  'account.creating': '만드는 중…',
  'account.otherEmail': '다른 주소 사용',
  'account.signedInAs': '{email} 계정으로 로그인됨',
  'account.signedInAsNamed': '{name}({email}) 계정으로 로그인됨',
  'account.synced': '{date}에 동기화됨',
  'account.notSynced': '아직 동기화되지 않음',
  'account.syncNow': '지금 동기화',

  // The account, at the foot of the popup
  'accountBar.synced': '{time}에 동기화됨',
  'accountBar.justNow': '방금',
  'accountBar.syncing': '동기화 중…',
  'accountBar.signedOut': '로그아웃됨 — 동기화하려면 다시 로그인하세요',
  'accountBar.startedOver': '계정을 처음부터 다시 시작했습니다 — 다시 로그인하세요',
  'accountBar.removed': '계정에서 제거됨 — 동기화하려면 다시 로그인하세요',

  // This browser removed from the account, with a proof Passhold's key checked
  'removed.title': 'Keyrook 계정에서 제거되었습니다',
  'removed.body':
    '{date}에 이 브라우저가 Keyrook 계정에서 제거되었습니다. 그래서 Passhold는 계정의 로그인 정보, 카드, 주소, 메모를 이 브라우저에서 지우고 로그아웃시켰습니다. 여기서 추가하거나 바꿨지만 보내지 않은 것은 이 브라우저의 것으로 남아 있습니다. 나머지를 되돌리려면 다시 로그인하세요.',

  // Passwords, in Settings
  'passwords.description':
    'Passhold의 모든 로그인 정보, 패스키, 카드, 주소, 메모입니다. 항목을 선택하면 보기, 복사, 변경을 할 수 있습니다.',
  'passwords.all': '전체',
  'passwords.attention': '확인 필요',
  'passwords.weak': '약함',
  'passwords.reused': '재사용',
  'account.syncDone': '동기화했습니다.',
  'account.removed': { other: '다른 기기에서 영구 삭제된 항목 {count}개가 여기서도 제거되었습니다.' },
  'account.skipped': { other: '열리지 않아 그대로 둔 레코드가 {count}개 있습니다.' },
  'account.manage': 'Keyrook 계정 관리',
  'account.manageBody':
    '비밀번호 변경, 새 복구 키 만들기, 계정 처음부터 다시 시작하기는 account.keyrook.com에서 합니다. Passhold와 Keyrook Authenticator 모두에 적용됩니다.',
  'account.manageBodyProvider':
    '새 복구 키 만들기나 계정 처음부터 다시 시작하기는 account.keyrook.com에서 합니다. Passhold와 Keyrook Authenticator 모두에 적용됩니다.',
  'account.manageOpen': '열기',
  'account.signOut': '로그아웃',
  'account.signOutBody': '마지막 동기화 후 이 브라우저에서 모든 로그인 정보를 제거합니다. 다시 로그인하면 돌아옵니다.',
  'account.signOutConfirm':
    'Passhold가 한 번 더 동기화한 뒤, 이 브라우저에서 금고를 제거합니다. 어떤 로그인 정보라도 계정에 도착하지 않았다면 아무것도 제거하지 않습니다.',
  'account.signOutButton': '로그아웃하고 제거',
  'account.signedOutByServer': 'Keyrook이 이 브라우저를 로그아웃시켰습니다. 동기화를 계속하려면 다시 로그인하세요.',
  'account.startedOver':
    'Keyrook 계정이 {date}에 처음부터 다시 시작되어, Keyrook이 이 브라우저를 로그아웃시켰습니다. 새 비밀번호로 로그인하세요. 여기의 로그인 정보는 새 키로 올라갑니다.',
  'account.startedOverProvider':
    'Keyrook 계정이 {date}에 처음부터 다시 시작되어, Keyrook이 이 브라우저를 로그아웃시켰습니다. Google 또는 GitHub로 로그인하세요. 여기의 로그인 정보는 새 키로 올라갑니다.',
  'account.forgot': '비밀번호를 잊으셨나요?',
  'account.recoverBody':
    'Keyrook이 계정 주소로 코드를 이메일로 보냅니다. 그 코드, 계정을 만들 때 저장한 시트의 계정 복구 키, 새 비밀번호를 입력하세요. 이 계정에 로그인한 다른 브라우저와 앱은 새 비밀번호를 요구합니다.',
  'account.recoveryKey': '계정 복구 키',
  'account.recoverPassword': '새 계정 비밀번호',
  'account.recoverButton': '새 비밀번호 설정',
  'account.recovering': '설정 중…',
  'account.backToSignIn': '로그인으로 돌아가기',
  'startOver.link': '복구 키도 잃어버렸나요? 계정 처음부터 다시 시작',
  'startOver.title': '계정 처음부터 다시 시작',
  'needsRoot.body':
    'Keyrook Authenticator에서 받은 계정 복구 키가 있다면 입력하세요. 그러면 Passhold도 열립니다. 없다면 Passhold가 계정용 새 복구 키를 만듭니다. 한 번만 표시되며, 이전 키는 더 이상 작동하지 않습니다.',
  'needsRoot.sheet': 'Keyrook Authenticator의 계정 복구 키(있는 경우)',
  'needsRoot.withSheet': '이 키 사용',
  'needsRoot.newSheet': '새 복구 키 만들기',
  'startOver.body':
    '계정에 이메일 주소만 남아 있다면, 새 키와 새 복구 키로 계정을 처음부터 다시 시작할 수 있습니다. 요청하고 1주일 뒤에 적용되며, 그 전까지는 계정에 로그인된 브라우저가 취소할 수 있습니다. 그래서 이메일 주소만 가진 사람은 계정을 빼앗을 수 없습니다. 계정이 가지고 있던 것은 Keyrook이 암호화된 상태로 90일 동안 보관합니다. 이전 비밀번호나 이전 복구 키로 되돌릴 수 있습니다.',
  'startOver.button': '처음부터 다시 시작',
  'startOver.working': '처음부터 다시 시작하는 중…',
  'startOver.kitBody':
    '계정의 새 복구 키입니다. 계정이 처음부터 다시 시작된 후에 작동합니다. Passhold는 지금만 보여 줍니다. 계속하기 전에 보관하세요.',
  'startOver.waitTitle': '계정은 {date}에 처음부터 다시 시작됩니다',
  'startOver.waitBody':
    '그때까지는 아무것도 바뀌지 않으며, 계정에 로그인된 브라우저는 취소할 수 있습니다. Keyrook은 지금, 하루 전, 그리고 시작 시점에 {email}로 이메일을 보냅니다.',
  'startOver.waitThen':
    '그 이후에는 새 비밀번호로 여기에 로그인하세요. 이 브라우저의 로그인 정보는 계정의 새 키로 올라갑니다. 이전에 보관되었던 것은 90일 동안 남아 있습니다.',
  'startOver.waitThenProvider':
    '그 이후에는 전과 같이 Google 또는 GitHub로 여기에 로그인하세요. 이 브라우저의 로그인 정보는 계정의 새 키로 올라갑니다. 이전에 보관되었던 것은 90일 동안 남아 있습니다.',
  'startOver.understood': '알겠습니다',
  'startOver.doneTitle': '계정이 처음부터 다시 시작되었습니다',
  'startOver.doneBody':
    '새 비밀번호로 로그인하세요. 이 브라우저의 로그인 정보는 계정의 새 키로 올라갑니다. 이전에 보관되었던 것은 90일 동안 남아 있습니다.',
  'startOver.doneBodyProvider':
    '전과 같이 Google 또는 GitHub로 로그인하세요. 이 브라우저의 로그인 정보는 계정의 새 키로 올라갑니다. 이전에 보관되었던 것은 90일 동안 남아 있습니다.',
  'startOverWait.title': 'Keyrook 계정은 {date}에 처음부터 다시 시작됩니다',
  'startOverWait.body':
    'Keyrook이 이메일로 보낸 코드로 요청되었으며, 요청한 기기는 “{device}”라고 표시되었습니다. 본인이 아니라면 누군가 이메일을 읽을 수 있습니다. 지금 취소한 뒤, 이메일 비밀번호를 바꾸세요. 본인이라면 그대로 두세요.',
  'startOverWait.bodyNoName':
    'Keyrook이 이메일로 보낸 코드로 요청되었습니다. 본인이 아니라면 누군가 이메일을 읽을 수 있습니다. 지금 취소한 뒤, 이메일 비밀번호를 바꾸세요. 본인이라면 그대로 두세요.',
  'startOverWait.cancel': '처음부터 다시 시작 취소',
  'kept.title': { other: '계정이 처음부터 다시 시작되기 전에 보관된 항목: {count}개' },
  'kept.body': '{date}까지. 이전 계정 비밀번호나 이전 복구 키로 Passhold에 되돌릴 수 있습니다.',
  'kept.open': '되돌리기',
  'kept.secret': '이전 계정 비밀번호 또는 복구 키',
  'kept.done': { other: '{count}개를 되돌렸습니다.' },
  'kept.nothingNew': '보관되었던 것이 모두 여기에 있습니다.',

  'provider.google': 'Google',
  'provider.github': 'GitHub',
  'provider.continue': '{provider}로 계속',
  'provider.passwordTitle': '이 Keyrook 계정에는 비밀번호가 있습니다',
  'provider.passwordBody':
    '{provider}로 {email} 계정에 로그인했습니다. 여기서 Passhold를 여는 것은 계정 비밀번호입니다. 한 번 입력하세요.',
  'provider.openAccountPage': 'account.keyrook.com 열기',
  'secondStep.title': '2단계 인증 로그인',
  'secondStep.body':
    'Keyrook 인증 앱에 표시되는 6자리 코드를 입력하세요. 앱을 잃어버렸다면 대신 Keyrook 계정 복구 키를 입력하세요.',
  'secondStep.ownerBody':
    '이 계정은 여기서도 2단계 인증을 요구합니다. 인증 앱에 표시되는 코드나 계정 복구 키를 사용하세요.',
  'secondStep.field': '코드 또는 복구 키',
  'secondStep.continue': '계속',
  'secondStep.passkey': '대신 패스키 사용',
  'secondStep.nextBody':
    '계정에 키를 주는 데도 코드가 필요하며, 각 코드는 한 번만 사용할 수 있습니다. 인증 앱에 새 코드가 표시될 때까지 기다린 뒤, 그 코드나 계정 복구 키를 입력하세요.',
  'provider.or': '또는',
  'provider.signedInWith': '{provider}로 {email} 계정에 로그인됨',
  'provider.signedInWithNamed': '{provider}로 {name}({email}) 계정에 로그인됨',
  'provider.newTitle': 'Keyrook 계정 만들기',
  'provider.newBody':
    '{provider}로 {email} 계정에 로그인하고 있습니다. 이 계정에는 비밀번호가 없습니다. 로그인은 {provider}에서 처리합니다. 다른 컴퓨터에서는 이미 로그인된 브라우저가 허용하거나, 다음에 받게 될 복구 키를 사용합니다.',
  'provider.joinTitle': '이 브라우저의 접속을 허용',
  'provider.joinBody':
    '{email} 계정은 여기에 로그인되어 있지만, 로그인 정보를 여는 키는 다른 컴퓨터에 있습니다. 그중 한 곳에서 Passhold를 열고, 설정 → 계정 및 동기화에서 이 브라우저의 접속을 허용하세요.',
  'provider.waiting': '다른 브라우저를 기다리는 중…',
  'provider.compare':
    '다른 브라우저에 코드가 표시됩니다. 그 브라우저가 이 브라우저와 같은 경우에만 접속을 허용하세요:',
  'provider.ended': '다른 브라우저가 이 브라우저의 접속을 허용하기 전에 이 요청이 끝났습니다.',
  'provider.askAgain': '다시 요청',
  'provider.useKit': '대신 복구 키 사용',
  'provider.useThisKey': '이 키 사용',
  'provider.needsRoot':
    '{email} 계정은 각 Keyrook 앱이 자체 키를 갖기 전에 Keyrook Authenticator에서 만들어졌습니다. {provider}로 다시 확인하면 Passhold가 지금 자체 키를 만들 수 있습니다. Authenticator에는 아무 변화가 없습니다.',
  'provider.confirmWith': '{provider}로 확인',
  'provider.noKeyYet':
    'Passhold는 아직 어디에서도 {email} 계정에 로그인된 적이 없어서, 다른 브라우저가 이 브라우저의 접속을 허용할 수 없습니다. 계정 복구 키로 열 수 있습니다.',
  'passkey.onLabel': '새 컴퓨터는 패스키로 열기',
  'passkey.offLabel': '새 컴퓨터용 패스키 없음',
  'passkey.body':
    '새 컴퓨터에서는: {provider}, 그다음 패스키. 그러면 모든 로그인 정보가 있습니다. 패스키는 Google Password Manager가 보관하며, 로그인하는 모든 Chrome에서 사용할 수 있습니다.',
  'passkey.bodyEdge':
    '새 컴퓨터에서는: {provider}, 그다음 패스키. 그러면 모든 로그인 정보가 있습니다. 동기화되는 곳에 저장된 패스키는 다른 기기에서도 사용할 수 있습니다.',
  'passkey.turnOn': '켜기',
  'passkey.turnOff': '끄기',
  'passkey.joinTitle': '패스키로 열기',
  'passkey.joinBody': '{email} 계정에는 새 컴퓨터용 패스키가 있습니다. 그것으로 확인하면 로그인 정보가 내려옵니다.',
  'passkey.use': '패스키 사용',
  'passkey.otherWays': '다른 방법으로 들어가기',
  'pairing.asking': '{device}에서 계정에 접속하려고 합니다.',
  'pairing.start': '접속 허용…',
  'pairing.notMe': '내가 아님',
  'pairing.compare': '새 브라우저에 같은 코드가 표시되면, 같은 코드일 때만 접속을 허용하세요:',
  'pairing.match': '코드 일치 — 허용',
  'pairing.differ': '코드가 다름',

  'accountKit.title': '계정 복구 키 저장',
  'accountKit.body':
    'Keyrook 계정 비밀번호를 잊어버리면 이 키로 새 비밀번호를 설정할 수 있습니다. Passhold와 Keyrook Authenticator에 모두 적용됩니다. Keyrook은 비밀번호를 볼 수 없으므로 이것이 유일한 방법입니다. 설정에서 다시 볼 수 있지만, 다른 곳에도 보관하세요.',
  'accountKit.fileTitle': 'Keyrook 계정 복구 키',
  'accountKit.fileBody':
    'Keyrook 계정 비밀번호를 잊어버리면 이 키로 새 비밀번호를 설정할 수 있습니다. Passhold의 설정 → 계정 및 동기화 → “비밀번호를 잊으셨나요?”에서 하세요. 이 키와 이메일 주소를 가진 사람은 누구나 같은 일을 할 수 있으니 안전하게 보관하고, 이 컴퓨터에는 두지 마세요.',
  'accountKit.bodyNoPassword':
    '이 계정에는 비밀번호가 없습니다. 이미 로그인된 브라우저가 새 브라우저를 들여보낼 수 있습니다. 남은 것이 없다면 이 키가 들여보냅니다. Passhold와 Keyrook Authenticator에 모두 적용됩니다. 설정에서 다시 볼 수 있지만, 다른 곳에도 보관하세요.',
  'accountKit.fileBodyNoPassword':
    'Keyrook 계정에 로그인된 컴퓨터가 하나도 남아 있지 않다면, 이 키로 새 컴퓨터를 들여보낼 수 있습니다. Google 또는 GitHub로 로그인한 뒤 “대신 복구 키 사용”을 선택하세요. 이 키를 가지고 있고 본인으로 로그인할 수 있는 사람은 같은 일을 할 수 있으니 안전하게 보관하고, 이 컴퓨터에는 두지 마세요.',
  'accountKit.whenTitleNoPassword': '로그인된 컴퓨터가 하나도 남아 있지 않을 때',
  'accountKit.inPassholdNoPassword':
    'Passhold에서: Google 또는 GitHub로 로그인하고 “대신 복구 키 사용”을 선택한 뒤 이 키를 입력하세요.',
  'accountKit.keepNoPassword':
    '이 시트는 컴퓨터와 떨어진 안전한 곳에 보관하세요. 이 시트가 있으면 Google 또는 GitHub 계정으로 로그인할 수 있는 사람이 Keyrook 계정을 열 수 있습니다.',
  'accountKit.rowBodyNoPassword': '다른 컴퓨터가 남아 있지 않을 때 새 컴퓨터를 들여보냅니다.',
  'accountKit.sheetTitle': 'Keyrook 계정 복구 키트',
  'accountKit.whenTitle': '계정 비밀번호를 잊었을 때',
  'accountKit.inPasshold':
    'Passhold에서: 설정 → 계정 및 동기화 → “비밀번호를 잊으셨나요?”를 선택한 뒤, 이메일 주소, Keyrook이 보낸 코드, 이 키, 새 비밀번호를 입력하세요.',
  'accountKit.inAuthenticator':
    'Keyrook Authenticator도 같은 키를 사용합니다. 로그인하라고 나오는 화면에서 “비밀번호를 잊으셨나요?”를 선택하세요.',
  'accountKit.keep':
    '이 시트는 컴퓨터와 떨어진 안전한 곳에 보관하세요. 이 시트와 이메일 받은편지함을 가진 사람은 계정의 새 비밀번호를 설정할 수 있습니다.',
  'accountKit.pending': '계정 복구 키를 아직 보관하지 않음',
  'accountKit.keptState': '계정 복구 키를 보관함',
  'accountKit.elsewhere': '다른 곳에서 만든 계정 복구 키',
  'accountKit.none': '계정 복구 키 없음',
  'accountKit.rowBody':
    '계정 비밀번호를 잊으면 새 비밀번호를 설정합니다. 새로 만들면 이전 키는 모든 앱에서 작동하지 않습니다.',
  'accountKit.elsewhereBody':
    'account.keyrook.com, Keyrook Authenticator 또는 다른 브라우저에서 만들어졌습니다. 그 키는 그때 보관한 시트에 있습니다. 여기서 새로 만들면 그 키는 작동하지 않습니다.',
  'accountKit.noneBody':
    '복구 키가 없으면 계정 비밀번호를 잊었을 때 재설정할 수 없고, Keyrook에 보관된 것도 열 수 없습니다. 이 브라우저의 로그인 정보는 어느 쪽이든 그대로 남습니다.',
  'accountKit.make': '만들기',
  'accountKit.apart':
    '이메일과는 따로 보관하세요. 이 키를 가지고 있고 이메일을 읽을 수 있는 사람은 새 비밀번호를 설정하고 여러분의 로그인 정보를 열 수 있습니다. 이 키를 나에게 이메일로 보내거나, 그 이메일의 클라우드 드라이브에 보관하지 마세요.',
  'accountKit.apartNoPassword':
    '로그인에 쓰는 Google 또는 GitHub 계정과는 따로 보관하세요. 이 키를 가지고 그곳에 본인으로 로그인할 수 있는 사람은 로그인 정보를 열 수 있습니다. 이 키를 나에게 이메일로 보내거나, 그 계정의 클라우드 드라이브에 보관하지 마세요.',
  'accountKit.unchecked': '계정 복구 키를 아직 확인하지 않음',
  'accountKit.uncheckedBody':
    '계정에는 복구 키가 있습니다. account.keyrook.com이나 다른 앱에서 만든 것입니다. 한 번 입력하세요. Passhold가 계정을 여는지 확인하고, 나중에 다시 보여 주기 위해 보관합니다.',
  'accountKit.typeIt': '입력하기',
  'accountKit.checked': '계정을 여는 키입니다. 여기서 다시 보여 줄 수 있도록 Passhold가 지금 보관합니다.',
  'accountKit.draftBody':
    '계정의 새 복구 키입니다. 아직은 작동하지 않습니다. 보관한 뒤 다시 입력하면, 계정 비밀번호로 설정되고 이전 키는 작동하지 않습니다.',
  'accountKit.setTitle': '새 복구 키 설정',
  'accountKit.setBody':
    'Keyrook 계정 비밀번호를 입력하세요. 입력하기 전까지는 이전 복구 키가 작동하고, 이 새 키는 작동하지 않습니다.',
  'accountKit.set': '설정',
  'checkup.clear': '고칠 것이 없습니다',
  'checkup.clearBody': '약하거나 재사용된 비밀번호가 없고, 백업도 최신입니다.',
  'checkup.issues': { other: '확인할 항목 {count}개' },
  'checkup.issuesBody': '아래 각 항목에 중요한 이유와 해결 방법이 나와 있습니다.',
  'checkup.backup': '백업',
  'checkup.access': '열기 방법',
  'checkup.recoveryPending':
    '이 금고용으로 만든 복구 키는 보관했다고 확인되지 않았습니다. {method} 사용이 안 될 때 들어갈 수 있는 유일한 방법입니다. 새로 만들어 보관하세요.',
  'checkup.deviceMissing':
    '이 금고에는 마스터 비밀번호가 없어서, 여기서 {method} 없이는 잠금 해제할 때마다 복구 키를 요구합니다.',
  'checkup.lastBackup': '마지막 백업: {date}',
  'checkup.backupNever':
    '이 브라우저를 잃으면 로그인 정보도 함께 잃습니다. 백업은 다른 곳에 보관할 암호화된 파일 하나입니다.',
  'checkup.backupDue': '그 이후로 금고가 바뀌었습니다. 모든 내용을 담으려면 새로 백업을 만드세요.',
  'checkup.backUp': '지금 백업',
  'checkup.weak': { other: '약한 비밀번호 {count}개' },
  'checkup.weakBody':
    '짧거나 단순해서 쉽게 추측할 수 있습니다. 각 비밀번호는 해당 사이트에서 바꾸세요. Passhold는 양식에서 강한 비밀번호를 제안하고 저장도 제안합니다.',
  'checkup.weakNone': '없음.',
  'checkup.reused': { other: '두 번 이상 사용된 비밀번호 {count}개' },
  'checkup.reusedBody':
    '한 사이트에서 비밀번호가 유출되면 사람들은 다른 곳에서도 그 비밀번호를 시도합니다. 로그인 정보마다 다른 비밀번호를 쓰세요.',
  'checkup.reusedNone': '없음: 모든 로그인 정보에 각각 다른 비밀번호가 있습니다.',
  'checkup.sharedBy': { other: '{count}개의 로그인 정보와 공유' },
  'checkup.change': '변경',
  'checkup.limits':
    'Passhold는 비밀번호가 데이터 유출에서 발견되었는지 확인하지 않습니다. 그러려면 서버에 물어봐야 하는데, Passhold는 어떤 서버에도 묻지 않습니다. 또한 오래된 비밀번호에 대해 알림을 보내지도 않습니다. 강하고 고유한 비밀번호는 시간이 지나도 닳지 않습니다.',

  'backup.description': '암호화된 사본을 보관하거나, 되돌리거나, 로그인 정보를 넣고 빼는 기능입니다.',
  'backup.backupRow': '금고 전체를 마스터 비밀번호로 암호화한 파일 하나로 보관합니다.',
  'backup.restoreRow': '백업 파일의 로그인 정보를 이 금고에 추가합니다.',
  'backup.importRow': '다른 브라우저나 비밀번호 관리자에서 CSV 파일로 가져오거나, Bitwarden의 JSON을 가져옵니다.',
  'backup.exportRow': '다른 앱이 읽을 수 있는 CSV 파일입니다. 암호화되지 않습니다.',

  'security.description': 'Passhold가 열리는 방식과, 다시 잠기는 시점입니다.',
  'security.locking': '잠금',
  'security.opensTitle': 'Passhold가 열리는 방식',
  'security.opensBody':
    '마스터 비밀번호가 없습니다. {method}(으)로 열고, {method} 사용이 안 될 때는 복구 키로 엽니다.',
  'security.setPassword': '대신 마스터 비밀번호 사용',
  'security.setPasswordBody':
    '그러면 Passhold는 직접 고른 비밀번호로 열리고, 복구 키로는 더 이상 열리지 않습니다.',
  'security.setPasswordOpen': '설정',
  'security.setPasswordSave': '이 비밀번호 사용',
  'security.dropPassword': '마스터 비밀번호 사용 중단',
  'security.dropPasswordBody':
    '{method}(으)로만 엽니다. {method} 사용이 안 될 때를 대비해 복구 키를 보관하세요. 마스터 비밀번호로는 금고가 더 이상 열리지 않습니다.',
  'security.dropPasswordOpen': '전환',
  'security.dropPasswordSave': '전환하고 복구 키 표시',
  'device.method.mac': 'Touch ID',
  'device.method.windows': 'Windows Hello',
  'device.method.other': '기기의 화면 잠금',
  'device.method.passkey': '패스키',
  'device.title': '{method}(으)로 잠금 해제',
  'device.description': '가장 빠른 방법이며, 브라우저를 다시 시작해도 계속 작동합니다.',
  'device.on': '켜짐',
  'device.off': '꺼짐',
  'device.body':
    '지문이나 얼굴로 Passhold가 열립니다. 대부분의 컴퓨터에서는 컴퓨터 자체의 비밀번호로도 열립니다. 그래서 이 컴퓨터의 잠금을 풀 수 있는 사람은 누구나 Passhold를 열 수 있습니다. 이 방법으로 열리는 정보는 이 컴퓨터에 남으며, 이 컴퓨터 없이는 쓸모가 없습니다.',
  'device.whereMac':
    'Chrome이 패스키를 어디에 저장할지 물으면 Google Password Manager를 선택하세요. Chrome 프로필에 있는 패스키로는 Passhold의 잠금을 해제할 수 없고, 모든 Mac의 iCloud Keychain도 마찬가지입니다.',
  'device.whereMacEdge':
    'Edge가 패스키를 어디에 저장할지 물으면, 다른 기기에서도 함께 동기화되는 곳을 선택하세요. 모든 곳에서 Passhold의 잠금을 해제할 수 있는 것은 아닙니다. 선택한 곳에서 해제할 수 없으면 Passhold가 그렇게 알려 주며, 아무것도 바뀌지 않습니다.',
  'device.unavailable': '여기서는 사용할 수 없음',
  'device.unavailableBody':
    '이 브라우저에서는 Passhold가 쓸 수 있는 지문, 얼굴, 화면 잠금을 찾지 못했습니다. PIN은 어디서나 작동합니다.',
  'device.unavailableRecovery':
    '이 브라우저에서 Passhold가 쓸 수 있는 지문, 얼굴, 화면 잠금을 찾지 못해서, 여기서는 이 금고를 복구 키로 엽니다. 직접 입력하는 방식을 원한다면 마스터 비밀번호를 설정하세요.',
  'device.opensWith': '{method}(으)로 Passhold 열기',
  'device.notHere': '이 브라우저에는 {method} 설정이 되어 있지 않습니다',
  'device.isTheWayIn':
    '마스터 비밀번호가 없으면 Passhold는 이 방법으로 열립니다. 끄려면 먼저 마스터 비밀번호를 설정하세요.',
  'device.setUpHere':
    '이 브라우저에서 {method} 설정을 마치기 전까지는, 잠금 해제할 때마다 복구 키를 요구합니다.',
  'device.setUp': '설정',
  'device.turnOff': '끄기',
  'device.save': '{method} 설정',
  'keys.title': '보안 키로 잠금 해제',
  'keys.description': '꽂아서 쓰는 USB 키입니다. 또 하나의 방법이며, 브라우저를 다시 시작해도 계속 작동합니다.',
  'keys.method': '보안 키',
  'keys.on': { other: '설정된 키 {count}개' },
  'keys.off': '설정된 키 없음',
  'keys.body':
    '키를 꽂고 PIN을 입력한 뒤 터치하면 Passhold가 열립니다. 이 컴퓨터에서만 적용됩니다. 키를 가지고 PIN을 아는 사람은 여기서 Passhold를 열 수 있으니, 집 열쇠처럼 보관하세요. 잃어버렸다면 여기서 제거하세요. 다른 방법으로 들어가는 것은 계속 작동합니다.',
  'keys.add': '키 추가',
  'keys.save': '이 키 추가',
  'keys.one': '보안 키',
  'keys.added': '{date}에 추가됨',
  'keys.remove': '제거',
  'pin.title': 'PIN으로 잠금 해제',
  'pinOffer.title': 'PIN으로 Passhold를 더 빨리 열기',
  'pinOffer.body':
    'Passhold가 잠길 때마다 비밀번호 대신 숫자 몇 자리를 입력합니다. 브라우저를 닫을 때까지 유효합니다. 브라우저를 다시 시작한 뒤에는 비밀번호를 한 번 입력합니다.',
  'pinOffer.later': 'PIN은 설정의 보안 항목에서 언제든 설정하거나 끌 수 있습니다.',
  'pin.description': '같은 브라우저를 사용하는 중에 Passhold가 하루에도 여러 번 잠기는 경우를 위한 것입니다.',
  'pin.on': '켜짐',
  'pin.off': '꺼짐',
  'pin.bodyRecovery':
    '브라우저가 열려 있는 동안에만 작동하며, 잘못 입력은 다섯 번까지만 허용됩니다. 그 이후나 브라우저를 다시 시작한 후에는 기기 또는 복구 키가 필요합니다. PIN으로 열리는 것은 디스크에 저장되지 않습니다.',
  'pin.body':
    '브라우저가 열려 있는 동안에만 작동하며, 잘못 입력은 다섯 번까지만 허용됩니다. 그 이후나 브라우저를 다시 시작한 후에는 마스터 비밀번호가 필요합니다. PIN으로 열리는 것은 디스크에 저장되지 않습니다.',
  'pin.setUp': 'PIN 설정',
  'pin.change': '변경',
  'pin.turnOff': '끄기',
  'pin.new': 'PIN, 6~12자리 숫자',
  'pin.again': '다시 입력',
  'pin.save': 'PIN 저장',

  'general.description': 'Passhold가 웹사이트에서 동작하는 방식과 모양을 설정합니다.',
  'general.filling': '입력 및 저장',
  'general.appearance': '언어 및 모양',
  'settings.autoSuggest': '로그인, 카드, 주소 입력란을 클릭하면 제안 표시',
  'settings.autoSuggestBody':
    '사이트의 로그인 정보, 가입 양식의 강한 비밀번호, 결제 페이지의 카드와 주소입니다. 고르기 전까지는 아무것도 입력되지 않습니다.',

  'trash.description': '로그인 정보, 카드, 주소, 메모는 복원하거나 완전히 삭제할 때까지 여기에 있습니다.',
  'trash.sharedDescription':
    '가족과 공유 중입니다. 가족 구성원은 누구나 이것을 복원할 수 있습니다. 완전히 삭제하면 모두에게서 사라집니다.',
  'trash.sharedMember':
    '가족과 공유 중입니다. 이것을 복원할 수 있습니다. 완전히 삭제할 수 있는 것은 가족의 관리자뿐입니다.',
  'settings.autoLock': '자동 잠금 시간',
  'settings.autoLock.never': '브라우저를 닫을 때만',
  'settings.autoLock.minutes': { other: '{count}분' },
  'settings.autoLock.hours': { other: '{count}시간' },
  'settings.lockWithSystem': '컴퓨터가 잠기거나 절전 모드로 들어갈 때 잠금',
  'settings.clipboard': '복사한 비밀번호 지우기 시간',
  'settings.clipboard.never': '안 함',
  'settings.clipboard.seconds': { other: '{count}초' },
  'settings.clipboard.minutes': { other: '{count}분' },
  'settings.inlineButton': '로그인, 카드, 주소 입력란에 Passhold 버튼 표시',
  'settings.offerToSave': '로그인할 때 로그인 정보 저장 제안',
  'settings.offerToSaveCards': '결제할 때 카드와 주소 저장 제안',
  'settings.offerToSaveCardsBody':
    '카드는 안전한(https) 페이지에서, 번호가 검증을 통과한 경우에만 저장을 제안합니다. 마지막 4자리로 표시되며, 번호나 보안 코드는 표시되지 않습니다.',
  'settings.passkeys': '패스키 저장 및 사용',
  'settings.passkeysBody':
    '사이트가 패스키를 제공하면 Passhold가 로그인 정보와 함께 보관하고, 그 패스키로 로그인합니다. 끄면 패스키는 브라우저에 맡겨집니다.',
  'settings.language': '언어',
  'settings.language.auto': '브라우저와 같음',
  'settings.theme': '모양',
  'settings.theme.system': '시스템과 같음',
  'settings.theme.light': '밝게',
  'settings.theme.dark': '어둡게',

  'settings.security': '마스터 비밀번호',
  'settings.securityBody': '바꾸면 금고의 키가 다시 설정됩니다. 로그인 정보는 그대로 남습니다.',
  'settings.current': '현재 마스터 비밀번호',
  'settings.new': '새 마스터 비밀번호',
  'settings.confirm': '새 마스터 비밀번호 다시 입력',
  'settings.change': '마스터 비밀번호 변경',
  'settings.changeOpen': '변경',
  'settings.changed': '마스터 비밀번호를 변경했습니다.',

  'settings.backup': '백업',
  'settings.backupBody':
    '금고 전체를 암호화된 파일 하나로 보관합니다. 이 컴퓨터가 아닌 곳(USB 드라이브, 클라우드 저장소 등)에 두세요. 그래야 이 브라우저를 잃어도 로그인 정보를 잃지 않습니다. 만들 때 가지고 있던 마스터 비밀번호로만 열립니다.',
  'settings.backupBodyRecovery':
    '금고 전체를 암호화된 파일 하나로 보관합니다. 이 컴퓨터가 아닌 곳(USB 드라이브, 클라우드 저장소 등)에 두세요. 그래야 이 브라우저를 잃어도 로그인 정보를 잃지 않습니다. 복구 키로 열립니다.',
  'settings.backupLast': '마지막 백업: {date}',
  'settings.backupNever': '아직 백업이 없습니다.',
  'settings.backupButton': '백업 다운로드',
  'settings.backupDone': '다운로드 폴더에 저장했습니다. 이제 이 컴퓨터가 아닌 곳으로 옮기세요.',

  'settings.restoreBackup': '백업에서 복원',
  'settings.restoreBodyNew':
    '이 브라우저에는 아직 금고가 없습니다. 백업 파일에서 금고를 가져오세요. 백업을 만들 때의 마스터 비밀번호로 열립니다. 또는 도구 모음의 Passhold 버튼으로 새로 만드세요.',
  'settings.restoreBodyMerge':
    '백업의 내용을 이 금고에 추가합니다. 여기 있는 것은 아무것도 삭제되지 않습니다. 같은 로그인 정보가 양쪽에 있으면 더 최근의 수정 내용을 남기고, 다른 비밀번호는 기록에 들어갑니다.',
  'settings.restoreChoose': '백업 파일 선택',
  'settings.restoreMade': '백업 생성: {date}',
  'settings.restorePassword': '백업의 마스터 비밀번호',
  'settings.restoreRecoveryKey': '백업의 복구 키',
  'settings.restoreButton': '복원',
  'settings.restoreNew': { other: '금고를 복원했습니다. 항목 {count}개 포함.' },
  'settings.restoreAdded': { other: '백업에서 항목 {count}개를 추가했습니다.' },
  'settings.restoreUpdated': { other: '백업의 항목 {count}개에 더 최근의 수정 내용이 있었습니다.' },
  'settings.restoreNothing': '백업의 모든 내용이 이미 이 금고에 있습니다.',

  'settings.import': '가져오기',
  'settings.importBody':
    'Chrome, Edge, Firefox, Safari, Apple Passwords, Bitwarden, 1Password, LastPass, KeePass, Dashlane, Proton Pass, NordPass에서 비밀번호를 가져올 수 있습니다. 각 서비스에서 CSV 파일로 내보낸 뒤 여기에서 선택하세요. 파일에 있는 카드, 주소, 메모도 함께 가져옵니다. Bitwarden은 JSON(암호화되지 않음)으로 내보내세요. Bitwarden의 CSV에는 카드, 신원 정보, 패스키가 빠져 있습니다. Dashlane은 이것들을 별도의 파일로 나눠 내보내므로, 하나씩 차례로 선택하세요.',
  'settings.importChoose': '파일 선택',
  'settings.importFound': '가져올 항목: {what}.',
  'settings.importLogins': { other: '로그인 정보 {count}개' },
  'settings.importPasskeys': { other: '패스키 {count}개' },
  'settings.importCards': { other: '카드 {count}개' },
  'settings.importAddresses': { other: '주소 {count}개' },
  'settings.importNotes': { other: '메모 {count}개' },
  'settings.importSkipped': { other: '{count}개 항목은 Passhold가 보관하지 않는 내용만 담고 있어 제외됩니다.' },
  'settings.importDuplicates': { other: '{count}개는 이미 금고에 있습니다.' },
  'settings.importConfirm': '가져오기',
  'settings.importDone': '{what} 가져왔습니다.',
  'settings.importDelete': '이제 CSV 파일을 삭제하세요. 비밀번호가 일반 텍스트로 들어 있습니다.',
  'settings.importNothing': '그 파일에는 새로 가져올 것이 없습니다.',
  'settings.importTwoFactor': {
    other:
      '이 파일의 로그인 정보 {count}개에는 2단계 인증(2FA) 코드가 있습니다. Passhold는 2FA 코드를 보관하지 않습니다. 기존 비밀번호 관리자를 삭제하기 전에 인증 앱으로 옮기세요. 그렇지 않으면 해당 계정에 로그인하지 못할 수 있습니다.',
  },
  'settings.importAuthenticator': 'Keyrook Authenticator 받기',
  'settings.importPasskeysLeft': {
    other:
      '이 파일의 패스키 {count}개는 Passhold로 옮길 수 없습니다. 다른 방법으로 해당 사이트에 로그인하고 Passhold에서 새 패스키를 만들 때까지 기존 비밀번호 관리자를 유지하세요.',
  },

  'settings.export': '내보내기',
  'settings.exportBody':
    '모든 브라우저와 비밀번호 관리자가 읽을 수 있는 CSV 파일입니다. 비밀번호가 일반 텍스트로 들어 있으니 필요한 동안만 보관하세요. 로그인 정보만 포함됩니다. 패스키, 사용자 지정 필드, 폴더, 카드, 주소, 메모는 들어 있지 않습니다. 백업에는 모두 들어 있습니다.',
  'settings.exportButton': 'CSV 내보내기',
  'settings.exportDone': '내보냈습니다. 다 쓰면 파일을 삭제하세요.',

  'settings.neverSave': '저장을 제안하지 않을 사이트',
  'settings.neverSaveEmpty':
    '사이트가 없습니다. Passhold가 저장을 제안할 때 “이 사이트에서는 다시 묻지 않기”를 선택하면 여기에 나타납니다.',
  'settings.remove': '제거',

  'settings.trash': '휴지통',
  'settings.trashEmpty': '휴지통이 비어 있습니다.',
  'settings.restore': '복원',
  'settings.deleteForever': '영구 삭제',
  'settings.emptyTrash': '휴지통 비우기',
  'settings.emptyTrashConfirm': '휴지통의 모든 항목을 영구 삭제할까요?',

  'settings.danger': '금고 제거',
  'settings.dangerBody':
    '이 브라우저에서 금고를 삭제합니다. 그 안의 로그인 정보가 모두 영구히 사라집니다. 보관하려면 먼저 백업을 다운로드하세요.',
  'settings.dangerType': '확인하려면 {word}라고 입력하세요',
  'settings.dangerWord': '삭제',
  'settings.dangerButton': '금고 제거',

  'settings.about': 'Passhold {version} · Keyrook 제공',

  // Errors
  'error.noWorker': 'Passhold가 응답하지 않습니다. 닫은 뒤 다시 시도하세요.',
  'error.wrongPassword': '마스터 비밀번호가 아닙니다.',
  'error.passwordTooShort': '{min}자 이상 입력하세요.',
  'error.vaultCorrupt': '이 기기의 금고가 손상되어 열 수 없습니다.',
  'error.vaultTooNew': '이 금고는 더 새로운 Passhold에서 만들어졌습니다. 열려면 Passhold를 업데이트하세요.',
  'error.itemNotFound': '그 항목은 더 이상 금고에 없습니다.',
  'error.familyOrganiserOnly': '이 금고의 휴지통은 가족의 관리자만 비울 수 있습니다.',
  'error.familyGone': '그 가족은 더 이상 여기에 없습니다. 동기화한 뒤 다시 확인하세요.',
  'error.familyNotOpen': 'Passhold는 아직 이 브라우저에서 그 가족을 열 수 없습니다. 동기화한 뒤 다시 시도하세요.',
  'error.itemInvalid': '현재 상태로는 저장할 수 없습니다.',
  'error.importEmpty': '그 파일에는 가져올 것이 없습니다.',
  'error.importTooLarge': '그 파일은 너무 커서 가져올 수 없습니다.',
  'error.importUnknownFormat': '그 파일은 비밀번호 내보내기 파일이 아닌 것 같습니다.',
  'error.importEncrypted':
    '그 Bitwarden 내보내기 파일은 암호화되어 있어 Passhold가 열 수 없습니다. Bitwarden에서 “.json (Encrypted)”가 아닌 “.json”으로 다시 내보낸 뒤 그 파일을 선택하세요.',
  'error.backupInvalid': '그 파일은 Passhold 백업이 아니거나 손상되었습니다.',
  'error.backupWrongPassword': '이 백업을 만들 때 사용한 마스터 비밀번호가 아닙니다.',
  'error.backupWrongRecoveryKey': '이 백업을 만들 때 사용한 복구 키가 아닙니다.',
  'error.noRecoveryKey': '이 금고에는 보여 줄 복구 키가 없습니다. 마스터 비밀번호로 열립니다.',
  'error.wrongRecoveryKey': '복구 키가 아닙니다.',
  'error.deviceNeeded':
    '마스터 비밀번호가 없는 금고는 이 기기의 잠금 해제로 열립니다. 먼저 설정하세요. 마스터 비밀번호가 설정될 때까지 이 상태가 유지됩니다.',
  'error.accountOffline': 'Keyrook에 연결할 수 없습니다. 연결을 확인하고 다시 시도하세요.',
  'error.accountWrong':
    '이메일 또는 비밀번호가 올바르지 않습니다. Google 또는 GitHub로 만든 계정은 해당 버튼으로 로그인합니다.',
  'error.accountSignedOut': 'Keyrook이 이 브라우저를 로그아웃시켰습니다. 다시 로그인하세요.',
  'error.accountBusy': { other: '너무 많이 시도했습니다. {count}초 기다렸다가 다시 시도하세요.' },
  'error.accountFailed': 'Keyrook이 지금은 처리할 수 없습니다. 나중에 다시 시도하세요.',
  'error.accountAlready': '이 금고는 이미 Keyrook 계정에 로그인되어 있습니다.',
  'error.accountNone': '이 금고는 Keyrook 계정에 로그인되어 있지 않습니다.',
  'error.accountKdfRefused': 'Keyrook이 Passhold가 받지 않는 약한 키를 요구해서 로그인을 중단했습니다.',
  'error.accountKeyWrong': '계정의 키가 그 비밀번호로는 열리지 않습니다.',
  'error.accountCode': '코드가 맞지 않거나 만료되었습니다. 이메일을 확인하거나 새 코드를 요청하세요.',
  'error.accountMail': 'Keyrook이 지금 이메일을 보낼 수 없습니다. 1분 뒤 다시 시도하세요.',
  'error.providerDenied': '로그인이 취소되었습니다.',
  'error.providerFailed': 'Google 또는 GitHub가 지금은 로그인할 수 없습니다. 다시 시도하세요.',
  'error.providerExpired': '그 로그인은 끝났습니다. 다시 시작하세요.',
  'error.providerNotOwner':
    '이 Keyrook 계정은 그 계정으로 로그인하는 것이 아닙니다. Keyrook에 사용하는 계정으로 다시 로그인하세요.',
  'error.signOutUnsent': {
    other:
      '{count}개 항목이 아직 Keyrook 계정에 도착하지 않아 아무것도 제거되지 않았습니다. 연결을 확인하거나 다시 로그인한 뒤 로그아웃하세요.',
  },
  'error.providerOtherProvider':
    '이 이메일의 Keyrook 계정은 Google과 GitHub 중 다른 쪽으로 이미 로그인합니다. 그쪽으로 로그인하세요.',
  'error.providerHasPassword':
    '이 이메일의 Keyrook 계정에는 이미 비밀번호가 있습니다. 여기서는 이메일과 비밀번호로 로그인하세요. Google이나 GitHub로도 로그인하려면, 비밀번호로 로그인한 상태에서 account.keyrook.com에서 추가하세요.',
  'error.providerEmailTaken':
    '이 이메일의 Keyrook 계정은 다른 방식으로 로그인합니다. 그 방식으로 로그인하세요. 또는 account.keyrook.com에서 지금 로그인하는 방식으로 로그인한 뒤 이 방식을 추가하세요.',
  'error.pairingWrongKey':
    '받은 것은 이 계정의 키가 아니므로 거부되었습니다. 다시 요청하고, 아는 브라우저에서만 접속을 허용하세요.',
  'error.pairingRefused':
    '코드를 확인한 브라우저에서 온 요청이 아니므로 거부되었습니다. 다시 요청하세요.',
  'error.pairingEnded': '그 요청은 끝났습니다. 새 브라우저에서 다시 요청하세요.',
  'error.passkeyWrong': '그 패스키로는 이 계정을 열 수 없습니다. 다른 방법으로 들어가세요.',
  'error.joinExpired': '그 로그인은 너무 오래 기다렸습니다. 다시 로그인하세요.',
  'error.accountPasswordWrong': '계정 비밀번호가 아닙니다.',
  'error.accountNoKit': 'Passhold는 이 계정의 복구 키를 가지고 있지 않습니다.',
  'error.accountKitRace': '다른 앱이 방금 계정의 복구 키를 바꿨습니다. 동기화한 뒤 다시 시도하세요.',
  'error.accountKitShape': '계정 복구 키 형식이 아닙니다. 영문자와 숫자 32자입니다.',
  'error.accountKitWrong': '그 복구 키는 이 이메일 주소의 계정과 일치하지 않습니다.',
  'error.accountKitNotThis': '이 계정의 복구 키가 아닙니다. 저장해 둔 것을 다시 확인하세요.',
  'error.accountPasswordWeak':
    '계정에는 추측하기 너무 쉽습니다. 문자, 숫자, 기호를 섞은 더 긴 비밀번호나, 관련 없는 단어 4~5개를 사용하세요.',
  'error.accountBoxWrong':
    '이 계정의 Passhold 키를 열 수 없습니다. 다시 로그인하세요. 그래도 열리지 않으면 계정을 처음부터 다시 시작하세요.',
  'error.accountCodeWait': { other: '코드는 방금 보냈습니다. {count}초 뒤에 다시 요청할 수 있습니다.' },
  'error.accountSignUpKeys':
    'Keyrook이 Passhold 자체 키를 요구했지만 보내지 않았습니다. Passhold를 업데이트하고 다시 시도하세요.',
  'error.accountIdTaken': '지금은 계정을 만들 수 없었습니다. 새 코드를 요청하고 다시 시도하세요.',
  'error.accountNoRoot': '이 계정에는 아직 복구 키로 열 수 있는 키가 없습니다. 비밀번호로 다시 로그인하세요.',
  'error.accountRootNotHeld':
    '이 컴퓨터는 계정의 키를 가지고 있다고 확인할 수 없습니다. 비밀번호 또는 복구 키로 다시 로그인하세요.',
  'error.accountRootChanged':
    '이 계정의 키가 다른 컴퓨터에서 교체되었습니다. Passhold가 아직 로그인되어 있는 컴퓨터에서 로그인하거나, 계정을 처음부터 다시 시작하세요.',
  'error.accountKeyReplaced':
    '이 계정의 Passhold 키가 다른 컴퓨터에서 교체되었습니다. 다시 로그인하세요.',
  'error.accountSessionStolen':
    '이 컴퓨터의 세션이 다른 곳에서 사용되어 로그아웃되었습니다. 다시 로그인하세요.',
  'error.accountOld':
    '이 계정은 각 Keyrook 앱이 자체 키를 갖기 전에 Google 또는 GitHub로 만들어져, 가진 것 중 Passhold의 키로 열리는 것이 없습니다. 이메일로 계정을 처음부터 다시 시작하면 키가 생깁니다.',
  'error.pairingBusy': '이 계정에 참여하려고 기다리는 브라우저가 너무 많습니다. 몇 분 뒤 다시 시도하세요.',
  'error.startOverExpired': '만료되었습니다. 새 코드를 요청하고 다시 시작하세요.',
  'error.startOverTooOften':
    '이 계정은 최근에 처음부터 다시 시작을 너무 자주 했습니다. {day} 이후에 다시 시도하세요.',
  'error.startOverWaiting':
    '이 계정은 {day}에 처음부터 다시 시작됩니다. 계정에 로그인된 브라우저가 이를 취소할 수 있습니다.',
  'error.startOverUpdate':
    'Keyrook은 이제 계정을 처음부터 다시 시작하기 전에 1주일을 기다립니다. 요청하려면 Passhold를 업데이트하세요.',
  'error.passkeyFailed': '그 패스키를 확인할 수 없습니다. 다시 시도하세요.',
  'error.passkeyNotYou':
    '그 패스키로는 본인이라는 것을 확인하지 못했습니다. 다시 시도하고, 요청하는 대로 잠금을 해제하세요.',
  'error.passkeyUnknown':
    '그 패스키는 어떤 Keyrook 계정에도 없습니다. 삭제되었을 수 있습니다. 비밀번호 또는 Google이나 GitHub로 로그인하세요.',
  'error.passkeyExpired': '그 패스키 요청은 끝났습니다. 다시 시도하세요.',
  'error.passkeyNotOffered': 'Keyrook은 아직 여기서 패스키를 제공하지 않습니다.',
  'error.passkeyNoUnlock': '이 패스키로는 로그인할 수 있지만, 아직 계정 잠금 해제용으로 설정되어 있지 않습니다. account.keyrook.com의 “Passkeys”에서 이 패스키 옆의 “Let it unlock”을 선택한 뒤 다시 시도하세요. 또는 비밀번호나 Google, GitHub으로 로그인하세요.',
  'error.passkeyNoPrf': '이 패스키로 account.keyrook.com에 로그인할 수는 있지만, 저장된 위치에서는 계정을 잠금 해제할 수 없습니다. 예를 들어 macOS 15 이전의 iCloud 키체인은 할 수 없습니다. account.keyrook.com의 “Passkeys”에서 잠금 해제가 가능한 곳에 저장된 패스키(예: 보안 키)를 추가하고, “Unlocks your data”라고 표시되는지 확인하세요. 그때까지는 비밀번호나 Google, GitHub으로 로그인하세요.',
  'error.passkeyPermission':
    'Passhold는 account.keyrook.com의 패스키를 사용하려면 Chrome의 허용이 필요합니다. 패스키를 다시 선택하고 허용하세요.',
  'error.passkeyPermissionEdge':
    'Passhold는 account.keyrook.com의 패스키를 사용하려면 Edge의 허용이 필요합니다. 패스키를 다시 선택하고 허용하세요.',
  'error.passkeyCancelled': '패스키가 사용되지 않았습니다. 다시 시도하거나 다른 방법으로 로그인하세요.',
  'error.secondStepNeeded': '계정에 2단계가 필요합니다. 인증 앱의 코드도 입력하세요.',
  'error.secondStepWrong': '코드가 맞지 않습니다. 인증 앱에 지금 표시된 코드 또는 복구 키를 입력하세요.',
  'error.signInExpired': '그 로그인은 만료되었습니다. 다시 로그인하세요.',
  'error.secondStepUpdate': '계정 로그인에 2단계가 필요합니다. 로그인하려면 Passhold를 업데이트하세요.',
  'error.secondStepAsked': '계정에 2단계가 필요합니다. 인증 앱의 코드를 입력하세요.',
  'error.secondStepTaken':
    '그것은 로그인에 사용한 코드이며, 각 코드는 한 번만 사용할 수 있습니다. 인증 앱에 새 코드가 표시될 때까지 기다리세요.',
  'error.kitDraftGone': '새 복구 키가 제때 설정되지 않아 아무것도 바뀌지 않았습니다. 다시 새로 만드세요.',
  'error.archiveWrong': '보관된 것을 열 수 없습니다.',
  'error.archiveGone': '더 이상 보관되어 있지 않습니다.',
  'error.archiveDeleteRefused':
    '만료되기 전에 보관된 것을 삭제하려면 이전 비밀번호나 이전 복구 키만 사용할 수 있습니다.',
  'error.accountNeedsRoot':
    '이 계정은 각 Keyrook 앱이 자체 키를 갖기 전에 Keyrook Authenticator에서 만들어졌습니다. Passhold는 지금 자체 키를 줄 수 있습니다. Authenticator에는 아무 변화가 없습니다.',
  'error.accountServerWrong':
    'Keyrook의 서버가 이 계정의 키와 맞지 않는 응답을 보내서 Passhold가 멈췄습니다. 나중에 다시 시도하세요.',
  'error.startOverNeedsPassword': '이 계정에는 비밀번호가 있습니다. 처음부터 다시 시작하려면 새 비밀번호를 고르세요.',
  'error.pinInvalid': 'PIN은 6~12자리 숫자입니다.',
  'error.wrongPin': 'PIN이 맞지 않습니다.',
  'error.wrongPinLeft': { other: 'PIN이 맞지 않습니다. {count}번 남았습니다.' },
  'error.pinLockedOut':
    '잘못된 PIN을 너무 많이 입력했습니다. 다른 방법으로 잠금을 해제하세요. 그 뒤에 PIN을 다시 쓸 수 있습니다.',
  'error.pinUnavailable':
    'PIN은 브라우저가 열려 있는 동안에만 작동합니다. 다른 방법으로 잠금을 해제하세요. 그 뒤에 PIN을 다시 쓸 수 있습니다.',
  'error.deviceGone': '이 기기로 잠금 해제하는 설정이 더 이상 없습니다. 다른 방법으로 잠금을 해제하세요.',
  'error.deviceKeyWrong':
    'Passhold를 열지 못했습니다. 다른 방법으로 잠금을 해제한 뒤, 기기 잠금 해제를 다시 설정하세요.',
  'error.deviceUnsupported':
    '그 패스키가 저장된 곳에서는 Passhold가 열 키를 만들 수 없습니다. 다시 시도해서 Google Password Manager에 저장하거나, PIN을 사용하세요.',
  'error.deviceUnsupportedEdge':
    '그 패스키가 저장된 곳에서는 Passhold가 열 키를 만들 수 없습니다. 다시 시도해서 다른 곳에 저장하거나, PIN을 사용하세요.',
  'error.deviceCancelled': '잠금이 해제되지 않았습니다. 취소되었거나 너무 오래 걸렸습니다.',
  'error.keyUnsupported':
    '이 키는 Passhold가 열기 위해 필요한 것을 제공할 수 없습니다. 대부분의 FIDO2 키는 가능합니다. 2단계 인증 전용(U2F)으로만 만들어진 키는 불가능합니다.',
  'error.keyAlreadyAdded': '그 키는 여기에 이미 설정되어 있습니다.',
  'error.keyGone': '그 보안 키는 더 이상 여기에 설정되어 있지 않습니다. 다른 방법으로 잠금을 해제하세요.',
  'error.keyWrong':
    '그 키로는 Passhold를 열지 못했습니다. 다른 방법으로 잠금을 해제한 뒤, 키를 제거하고 다시 추가하세요.',
  'error.kdfUnsupported': '이 금고의 설정은 Passhold가 받아들이는 것이 아닙니다.',
  'error.locked': 'Passhold가 잠겨 있습니다.',
  'error.noVault': '아직 금고가 없습니다.',
  'error.vaultExists': '금고가 이미 있습니다.',
  'error.notOnPage': '그 로그인 정보는 이 탭의 페이지용이 아닙니다.',
  'error.expired': '만료되었습니다. 다시 시도하세요.',
  'error.noFields': '이 페이지에는 Passhold가 입력할 수 있는 것이 없습니다.',
  'error.cardInsecure': 'Passhold는 안전한(https) 페이지에서만 카드를 입력합니다.',
  'error.unknown': '문제가 발생했습니다: {detail}',
};
