const ja = {
  // ── Sidebar ──────────────────────────────────────────────
  sidebar: {
    application: "アプリケーション",
    dashboard: "ダッシュボード",
    documents: "ドキュメント",
    masterDocuments: "マスタードキュメント",
    sharedDocuments: "共有ドキュメント",
    obsoleteDocuments: "廃止されたドキュメント",
    approvals: "承認",
    printHistory: "印刷履歴",
    migrationsDoc: "移行ドキュメント",
    recordsDocuments: "記録ドキュメント",
    records: "記録",
    master: "マスター",
    departments: "部署",
    users: "ユーザー",
    roles: "役割",
    references: "参考文献",
  },

  // ── Header / Layout ─────────────────────────────────────
  layout: {
    copyright: "著作権 © {year} PT. Toyo Ink Indonesia.",
    allRightsReserved: "無断転載を禁じます。",
  },

  // ── Profile ──────────────────────────────────────────────
  profile: {
    profile: "プロフィール",
    logOut: "ログアウト",
    logout: "ログアウト",
    logoutConfirm: "ログアウトしてもよろしいですか？",
    cancel: "キャンセル",
    changePassword: "パスワード変更",
    name: "名前",
    username: "ユーザー名",
    email: "メールアドレス",
    role: "役割",
    department: "部署"
  },

  // ── Notifications ────────────────────────────────────────
  notifications: {
    title: "通知",
    unread: "{count} 未読",
    markAllAsRead: "すべて既読にする",
    noNotifications: "通知はありません",
    loading: "読み込み中...",
    approvals: "承認",
    document: "ドキュメント",
  },

  // ── Login ────────────────────────────────────────────────
  login: {
    title: "DMS QA",
    subtitle: "ログイン情報を入力してください",
    username: "ユーザー名",
    usernamePlaceholder: "ユーザー名を入力",
    password: "パスワード",
    passwordPlaceholder: "パスワードを入力",
    loginButton: "ログイン",
    loggingIn: "読み込み中...",
  },

  // ── Dashboard ────────────────────────────────────────────
  dashboard: {
    title: "ダッシュボード",
    monitoring: "ダッシュボード監視",
    liveDescription: "ライブシステム監視と分析。",
    filterBy: "フィルター:",
    allDepartments: "すべての部署",
    synchronizing: "アーキテクチャデータを同期中...",
    totalDocuments: "総ドキュメント数",
    approved: "承認済み",
    pendingApproval: "承認待ち",
    rejected: "却下",
    live: "ライブ",
    totalDocIntExt: "総ドキュメント数 (内部および外部)",
    summaryDocInternal: "内部ドキュメントの概要",
    totalDocument: "総ドキュメント",
  },

  // ── Document Control / List ──────────────────────────────
  documentControl: {
    title: "ドキュメント管理",
    description: "一元化された安全なリポジトリで、すべての品質保証ドキュメントを管理、追跡、整理します。",
    registerNew: "新規ドキュメント登録",
    categories: "カテゴリー",
    filterByType: "ドキュメントタイプでフィルター",
    allDocuments: "すべてのドキュメント",
    viewAllRepo: "すべてのリポジトリドキュメントを表示",
    forms: "フォーム",
    formsDesc: "標準化された入力フォーム",
    standards: "基準",
    standardsDesc: "品質およびISO規格",
    workInstructions: "作業手順書",
    workInstructionsDesc: "ステップバイステップのガイド",
    procedures: "手順",
    proceduresDesc: "操作手順 (SOP)",
    companyManuals: "会社マニュアル",
    companyManualsDesc: "ポリシーと会社ガイド",
    halalManuals: "ハラールマニュアル",
    halalManualsDesc: "ハラール認証ドキュメント",
    external: "外部",
    externalDesc: "サードパーティのドキュメント",
  },

  // ── Document Detail ──────────────────────────────────────
  documentDetail: {
    documentNumber: "ドキュメント番号",
    detailInformation: "詳細情報",
    category: "カテゴリー",
    department: "部署",
    uploadedBy: "アップロード者",
    createdAt: "作成日",
    updatedAt: "更新日",
    proposalObjective: "提案の目的",
    additionalInfo: "追加のドキュメント情報",
    documentFormat: "ドキュメント形式",
    retentionPeriod: "保存期間",
    hardCopyRetention: "ハードコピー保存期間",
    storageLocation: "保管場所",
    hardCopyStorage: "ハードコピー保管場所",
    remark: "備考",
    publishingInstitution: "発行機関",
    dateOfIssue: "発行日",
    expiredDate: "有効期限",
    documentReferences: "関連ドキュメント",
    fileInformation: "ファイル情報",
    fileSize: "ファイルサイズ",
    type: "種類",
    revision: "改訂",
    rawDocumentInfo: "元ドキュメント情報",
    downloadRaw: "元ドキュメントをダウンロード",
    downloading: "ダウンロード中...",
    documentPreview: "ドキュメントプレビュー",
    fullScreen: "全画面表示",
    openInNewTab: "新しいタブで開く",
    loadingPreview: "プレビューを読み込んでいます...",
    failedToLoad: "プレビューの読み込みに失敗しました。ドキュメントをダウンロードしてください。",
    failedPdf: "PDFの読み込みに失敗しました。",
    noPreview: "プレビューは利用できません",
    close: "閉じる",
    browserNotSupported: "お使いのブラウザはPDFプレビューをサポートしていません。上の「新しいタブで開く」ボタンを使用するか、ドキュメントをダウンロードしてください。",
    approvalWorkflow: "承認ワークフロー",
    checkedByQA: "QAリーダー確認済み",
    referenceApprove: "参照の承認",
    approverLvl: "承認者 (レベル {level})",
    revisionPurpose: "改訂の目的:",
    comments: "コメント:",
    created: "作成済み:",
    processed: "処理済み:",
    printDisabled: "マスタープレビューでの印刷は無効になっています。印刷の承認がある場合は、「印刷プレビュー」タブを使用してください。",
  },

  // ── Language Switcher ────────────────────────────────────
  language: {
    english: "English",
    indonesian: "Bahasa Indonesia",
    switchLanguage: "言語を切り替える",
  },

  // ── Document List ────────────────────────────────────────
  documentList: {
    title: "ドキュメント一覧",
    subtitle: "すべてのドキュメントのリスト",
    searchPlaceholder: "検索...",
    distribution: "配布",
    allDest: "すべての宛先",
    approvedOnly: "承認済みのみ",
    masterIndex: "マスターインデックス",
    bulkPrint: "一括印刷",
    backToDepartments: "部署に戻る",
    registry: "登録簿",
    totalRecords: "合計レコード",
    noRecordsSearch: "検索条件に一致するレコードはありません",
    columns: {
      name: "名前",
      noDocument: "ドキュメント番号",
      revision: "改訂",
      releaseDate: "公開日",
      status: "ステータス",
      approvalProgress: "承認の進捗",
      documentType: "ドキュメントタイプ",
      published: "公開済み",
      action: "アクション"
    },
    noDocuments: "ドキュメントが見つかりません",
    noDocumentsDesc: "条件に一致するドキュメントが見つかりませんでした。検索条件やフィルターを調整してください。",
    progress: "進捗",
    publishedState: "公開済み",
    unpublishedState: "未公開",
    viewDocument: "ドキュメントを表示",
    editUsage: "使用方法を編集",
    reviseDocument: "ドキュメントを改訂",
    deleteDocument: "ドキュメントを削除",
    deleteTitle: "ドキュメントを削除",
    deleteConfirm: "このドキュメントを削除してもよろしいですか？",
    deleteApprovedDesc: "このドキュメントは承認済みまたは過去に承認されているため、削除リクエストはQAに送信されて承認されます。",
    deleteUndoneDesc: "この操作は取り消せません。",
    reasonForDeletion: "削除の理由",
    reasonPlaceholder: "削除の理由を入力してください...",
    requestDeletion: "削除をリクエスト",
    bulkPrintTitle: "一括印刷リクエスト",
    bulkPrintDesc: "選択した{count}件のドキュメントの印刷をリクエストします。これにより、印刷リクエストがQAに送信され承認されます。",
    reasonForPrint: "印刷リクエストの理由",
    reasonPrintPlaceholder: "印刷リクエストの理由を入力してください...",
    numberOfCopies: "部数",
    distributionLabel: "配布先",
    storageLocation: "保管場所",
    storagePlaceholder: "保管場所を入力してください...",
    selectedDocuments: "選択されたドキュメント",
    requestPrint: "印刷をリクエスト",
    approvalWorkflow: "承認ワークフロー",
    currentProgressFor: "現在の進捗:",
  },

  // ── View Index Dialog ────────────────────────────────────
  viewIndex: {
    viewIndexLabel: "インデックスを表示",
    dialogTitle: "ドキュメントインデックスを表示",
    dialogDesc: "表示したいインデックスのタイプとドキュメントカテゴリーを選択してください。",
    indexType: "インデックスのタイプ",
    masterIndex: "マスターインデックス",
    formIndex: "フォームインデックス",
    documentCategory: "ドキュメントカテゴリー",
    internal: "内部",
    internalDesc: "PTI 内部ドキュメント",
    external: "外部",
    externalDesc: "外部ソースドキュメント",
    department: "部署",
    viewSelectedIndex: "選択したインデックスを表示"
  },

  // ── Create Document ──────────────────────────────────────
  createDocument: {
    title: "ドキュメントの作成",
    backToDocuments: "ドキュメントに戻る",
    registerNew: "新規ドキュメントの登録",
    uploadDesc: "新しいドキュメントをシステムにアップロードします。",
    documentName: "ドキュメント名",
    documentNamePlaceholder: "ドキュメント名を入力",
    documentType: "ドキュメントタイプ",
    documentTypePlaceholder: "ドキュメントタイプを選択",
    internalDocument: "内部ドキュメント",
    externalDocument: "外部ドキュメント",
    category: "カテゴリー",
    categoryPlaceholder: "カテゴリーを選択",
    categories: {
      form: "フォームドキュメント",
      standard: "基準ドキュメント",
      workInstruction: "作業手順書ドキュメント",
      procedure: "手順ドキュメント",
      manualCompany: "会社マニュアルドキュメント",
      manualHalal: "ハラールマニュアルドキュメント"
    },
    proposalObjective: "提案の目的",
    proposalPlaceholder: "ドキュメントを確立する理由（例：監査の指摘事項など）",
    destinationDocument: "宛先ドキュメント",
    destinationPlaceholder: "宛先を選択",
    documentFormat: "ドキュメント形式",
    formatPlaceholder: "ドキュメント形式を選択",
    formats: {
      digital: "デジタルドキュメント",
      hard: "ハードドキュメント",
      both: "デジタル & ハードドキュメント"
    },
    retentionPeriod: "保存期間",
    digitalRetentionPeriod: "デジタル保存期間",
    retentionPlaceholder: "例：5ヶ月 / 5年 / 無期限",
    hardRetentionPeriod: "ハードコピー保存期間",
    hardRetentionPlaceholder: "例：1年、6ヶ月...",
    storageLocation: "保管場所",
    digitalStorageLocation: "デジタル保管場所",
    storagePlaceholder: "保管場所を入力",
    hardStorageLocation: "ハードコピー保管場所",
    hardStoragePlaceholder: "ハードコピー保管場所を入力",
    remark: "備考（任意）",
    remarkPlaceholder: "追加の備考を入力",
    publishingInstitution: "発行機関",
    publishingPlaceholder: "発行機関を入力",
    dateOfIssue: "発行日",
    expiredDate: "有効期限（ある場合）",
    documentStorage: "ドキュメントの保管",
    documentStoragePlaceholder: "ドキュメントの保管場所を入力（例：ラックA、棚1）",
    documentReferences: "関連ドキュメント",
    minTwoRefs: "（最低2つの参照が必要）",
    minOneRef: "（最低1つの参照が必要）",
    optional: "（任意）",
    referencesDesc: "該当する関連ドキュメントを選択してください。割り当てられたチェッカーに確認の通知が送信されます。",
    loadingReferences: "参照を読み込んでいます...",
    noReferences: "利用可能な参照がありません。設定で参照を追加できます。",
    checker: "チェッカー:",
    ikTemplate: "作業手順書テンプレート",
    ikTemplateDesc: "リッチテキストフィールドに入力して、ファイルアップロードなしで安全に作業手順書ドキュメントを生成します。",
    documentFile: "ドキュメントファイル（PDF形式のソフトファイルをアップロード）",
    masterFile: "マスタードキュメントファイル（ExcelまたはWord形式のソフトファイルをアップロード）",
    selectedFile: "選択済み:",
    uploading: "アップロード中...",
    uploadBtn: "ドキュメントをアップロード"
  },

  // ── Update Document ──────────────────────────────────────
  updateDocument: {
    title: "ドキュメントを更新",
    update: "更新",
    updateDesc: "ドキュメント情報を更新します。",
    isInternalDocument: "内部ドキュメントですか？",
    yes: "はい",
    no: "いいえ",
    documentFileOptional: "ドキュメントファイル（任意）",
    masterFileOptional: "マスタードキュメントファイル（任意）",
    updating: "更新中...",
    updateBtn: "ドキュメントを更新",
    loadingTemplate: "テンプレートを読み込んでいます...",
    editTemplateDesc: "以下の作業手順書テンプレートを編集します。PDFおよびExcelのマスタードキュメントは自動的に再生成されます。"
  },

  // ── Master Index ─────────────────────────────────────────
  masterIndex: {
    title: "マスタードキュメントインデックス",
    formTitle: "フォームレコードインデックス",
    excelExport: "Excelエクスポート",
    print: "印刷",
    limit: "表示数:",
    internalProtocol: "内部登録プロトコル",
    externalProtocol: "外部ソースプロトコル",
    generalIndex: "一般ドキュメントインデックス",
    internalFormProtocol: "内部プロトコル登録",
    externalFormProtocol: "外部プロトコル登録",
    generalFormIndex: "一般フォームドキュメントインデックス",
    noDocuments: "この分類のドキュメントはありません",
    noRecords: "部署の記録が見つかりません",
    dateEffective: "発効日",
    revisionStatus: "改訂ステータス",
    page: "ページ",
    of: "/"
  },

  // ── Approvals ────────────────────────────────────────────
  approvals: {
    management: "承認管理",
    approveAllPending: "保留中をすべて承認 ({count})",
    allStatus: "すべてのステータス",
    pending: "保留中",
    approved: "承認済み",
    rejected: "却下",
    tabs: {
      all: "すべて",
      document: "ドキュメント",
      print: "印刷",
      deletion: "削除",
      reference: "参照"
    },
    columns: {
      type: "タイプ",
      documentCode: "ドキュメントコード",
      documentName: "ドキュメント名",
      requester: "申請者",
      status: "ステータス",
      reasonPurpose: "理由/目的",
      requested: "申請日",
      approveDate: "承認日",
      category: "カテゴリー",
      department: "部署名",
      actions: "アクション"
    },
    noApprovalsFound: "承認が見つかりません",
    noApprovalsDesc: "現在、条件に一致する承認リクエストはありません。",
    viewDetails: "詳細を表示",
    approve: "承認",
    reject: "却下",
    badges: {
      newDoc: "新規",
      print: "印刷",
      delete: "削除",
      reference: "参照",
      refRev: "参照改訂",
      rev: "改訂"
    },
    export: {
      title: "エクスポート承認",
      department: "部署",
      allDepartments: "すべての部署",
      slaStatus: "SLAステータス",
      allSla: "すべてのステータス",
      within3Days: "3日以内",
      over3Days: "3日以上",
      approvalStage: "承認段階",
      allStages: "すべての段階",
      qaApprove: "QA承認",
      lev1Approve: "レベル1承認",
      lev2Approve: "レベル2承認",
      lev3Approve: "レベル3承認",
      startDate: "開始日",
      endDate: "終了日",
      button: "Excelエクスポート"
    }
  },

  // ── Print History ─────────────────────────────────────────
  printHistory: {
    description: "システム内のすべての印刷リクエスト履歴を表示",
    columns: {
      no: "番号",
      documentName: "ドキュメント名",
      documentCode: "ドキュメントコード",
      requester: "申請者",
      distribution: "配布",
      picTaken: "受取人",
      takenAt: "受取日時",
      status: "ステータス",
      dateRequested: "申請日",
      copies: "部数",
      action: "アクション"
    },
    status: {
      pending: "保留中",
      approved: "承認済み",
      rejected: "却下",
      printed: "印刷済み",
      ready: "準備完了",
      completed: "受け取り済み"
    },
    internalPti: "内部 PTI",
    externalPti: "外部 PTI",
    loading: "履歴を読み込んでいます...",
    noHistory: "印刷履歴が見つかりません。",
    viewDetail: "詳細を表示",
    printControlled: "管理対象の印刷",
    printUncontrolled: "非管理対象の印刷",
    markReady: "準備完了にする",
    recordPickup: "受け取りを記録"
  },

  // ── Obsolete Documents ───────────────────────────────────
  obsolete: {
    description: "廃止されたドキュメントのリスト（読み取り専用）",
    columns: {
      name: "名前",
      documentCode: "ドキュメントコード",
      revision: "改訂",
      category: "カテゴリー",
      deleteReason: "削除の理由",
      department: "部署",
      releaseDate: "公開日",
      action: "アクション"
    },
    viewDocument: "ドキュメントを表示",
    downloadDocument: "ドキュメントをダウンロード",
    downloadMasterDocument: "マスタードキュメントをダウンロード"
  },

  // ── Users ────────────────────────────────────────────────
  users: {
    description: "システム内のすべてのユーザーのリスト",
    addUser: "ユーザーを追加",
    loading: "ユーザーを読み込んでいます...",
    noUsers: "ユーザーが見つかりません",
    columns: {
      no: "番号",
      fullName: "フルネーム",
      position: "役職",
      email: "メールアドレス",
      role: "役割",
      actions: "アクション"
    },
    actions: {
      view: "ユーザーを表示",
      update: "ユーザーを更新",
      changePassword: "パスワード変更",
      delete: "ユーザーを削除"
    },
    deleteConfirm: {
      title: "ユーザーを削除",
      description: "このユーザーを削除してもよろしいですか？",
      yes: "削除",
      no: "キャンセル"
    }
  },

  // ── Roles ────────────────────────────────────────────────
  roles: {
    management: "役割管理",
    addRole: "役割を追加",
    search: "役割を検索...",
    loading: "読み込み中...",
    noRoles: "役割が見つかりません",
    noDescription: "説明なし",
    columns: {
      name: "名前",
      description: "説明",
      permissions: "権限",
      users: "ユーザー",
      actions: "アクション"
    },
    actions: {
      view: "役割を表示",
      edit: "役割を編集",
      delete: "役割を削除"
    },
    deleteConfirm: {
      title: "役割を削除",
      description: "この役割を削除してもよろしいですか？この操作は取り消せません。",
      yes: "削除",
      no: "キャンセル"
    }
  },

  // ── Departments ──────────────────────────────────────────
  departments: {
    description: "システム内のすべての部署のリスト",
    addDepartment: "部署を追加",
    loading: "部署を読み込んでいます...",
    noDepartments: "部署が見つかりません",
    columns: {
      no: "番号",
      departmentName: "部署名",
      departmentCode: "部署コード",
      description: "説明",
      usersCount: "ユーザー数",
      status: "ステータス",
      actions: "アクション"
    },
    status: {
      active: "アクティブ",
      draft: "下書き"
    },
    actions: {
      view: "部署を表示",
      update: "部署を更新",
      delete: "部署を削除"
    },
    deleteConfirm: {
      title: "削除の確認",
      description: "この部署を削除してもよろしいですか？この操作により部署が削除され、元に戻すことはできません。",
      yes: "削除",
      no: "キャンセル"
    }
  },

  // ── References ───────────────────────────────────────────
  references: {
    management: "ドキュメント参照管理",
    addReference: "参照を追加",
    search: "参照を検索...",
    loading: "読み込み中...",
    noReferences: "参照が見つかりません",
    noDescription: "説明なし",
    notAssigned: "未割り当て",
    columns: {
      code: "コード",
      name: "名前",
      description: "説明",
      checker: "チェッカー",
      status: "ステータス",
      documents: "ドキュメント",
      actions: "アクション"
    },
    status: {
      active: "アクティブ",
      inactive: "非アクティブ"
    },
    actions: {
      edit: "編集",
      delete: "削除"
    },
    deleteConfirm: {
      title: "参照を削除",
      description: "この参照を削除してもよろしいですか？この操作は取り消せません。",
      yes: "削除",
      no: "キャンセル"
    }
  },

  // ── Common ───────────────────────────────────────────────
  common: {
    home: "ホーム",
    search: "検索",
    save: "保存",
    delete: "削除",
    edit: "編集",
    create: "作成",
    update: "更新",
    back: "戻る",
    next: "次へ",
    previous: "前へ",
    yes: "はい",
    no: "いいえ",
    confirm: "確認",
    cancel: "キャンセル",
    loading: "読み込み中...",
    noData: "データなし",
    actions: "アクション",
    status: "ステータス",
    internal: "内部",
  },
};

export default ja;
