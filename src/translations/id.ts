/**
 * Indonesian translations — Terjemahan Bahasa Indonesia.
 * Key structure MUST mirror en.ts exactly.
 */
const id = {
  // ── Sidebar ──────────────────────────────────────────────
  sidebar: {
    application: "Aplikasi",
    dashboard: "Dasbor",
    documents: "Dokumen",
    masterDocuments: "Dokumen Master",
    sharedDocuments: "Dokumen Bersama",
    obsoleteDocuments: "Dokumen Usang",
    approvals: "Persetujuan",
    printHistory: "Riwayat Cetak",
    migrationsDoc: "Migrasi Dokumen",
    recordsDocuments: "Dokumen Rekaman",
    records: "Rekaman",
    master: "Master",
    departments: "Departemen",
    users: "Pengguna",
    roles: "Peran",
    references: "Referensi",
  },

  // ── Header / Layout ─────────────────────────────────────
  layout: {
    copyright: "Hak Cipta © {year} PT. Toyo Ink Indonesia.",
    allRightsReserved: "Hak cipta dilindungi undang-undang.",
  },

  // ── Profile ──────────────────────────────────────────────
  profile: {
    profile: "Profil",
    logOut: "Keluar",
    logout: "Keluar",
    logoutConfirm: "Apakah Anda yakin ingin keluar?",
    cancel: "Batal",
    changePassword: "Ubah Kata Sandi",
    name: "Nama",
    username: "Nama Pengguna",
    email: "Email",
    role: "Peran",
    department: "Departemen"
  },

  // ── Notifications ────────────────────────────────────────
  notifications: {
    title: "Notifikasi",
    unread: "{count} belum dibaca",
    markAllAsRead: "Tandai semua dibaca",
    noNotifications: "Belum ada notifikasi",
    loading: "Memuat...",
    approvals: "Persetujuan",
    document: "Dokumen",
  },

  // ── Login ────────────────────────────────────────────────
  login: {
    title: "DMS QA",
    subtitle: "Masukkan kredensial Anda untuk masuk",
    username: "Nama Pengguna",
    usernamePlaceholder: "Masukkan nama pengguna Anda",
    password: "Kata Sandi",
    passwordPlaceholder: "Masukkan kata sandi Anda",
    loginButton: "Masuk",
    loggingIn: "Memuat...",
  },

  // ── Dashboard ────────────────────────────────────────────
  dashboard: {
    title: "Dasbor",
    monitoring: "Pemantauan Dasbor",
    liveDescription: "Pemantauan dan analitik sistem secara langsung.",
    filterBy: "Filter:",
    allDepartments: "Semua Departemen",
    synchronizing: "Menyinkronkan data...",
    totalDocuments: "Total Dokumen",
    approved: "Disetujui",
    pendingApproval: "Menunggu Persetujuan",
    rejected: "Ditolak",
    live: "Langsung",
    totalDocIntExt: "Total Dokumen Internal dan Eksternal",
    summaryDocInternal: "Ringkasan Dokumen Internal",
    totalDocument: "Total Dokumen",
  },

  // ── Document Control / List ──────────────────────────────
  documentControl: {
    title: "Kontrol Dokumen",
    description: "Kelola, lacak, dan organisasi semua dokumen jaminan kualitas Anda dalam satu repositori terpusat yang aman.",
    registerNew: "Daftarkan Dokumen Baru",
    categories: "Kategori",
    filterByType: "Filter berdasarkan tipe dokumen",
    allDocuments: "Semua Dokumen",
    viewAllRepo: "Lihat semua dokumen repositori",
    forms: "Formulir",
    formsDesc: "Formulir input standar",
    standards: "Standar",
    standardsDesc: "Standar kualitas dan ISO",
    workInstructions: "Instruksi Kerja",
    workInstructionsDesc: "Panduan langkah demi langkah",
    procedures: "Prosedur",
    proceduresDesc: "Prosedur operasional (SOP)",
    companyManuals: "Manual Perusahaan",
    companyManualsDesc: "Kebijakan dan panduan perusahaan",
    halalManuals: "Manual Halal",
    halalManualsDesc: "Dokumen sertifikasi halal",
    external: "Eksternal",
    externalDesc: "Dokumen pihak ketiga",
  },

  // ── Document Detail ──────────────────────────────────────
  documentDetail: {
    documentNumber: "Nomor Dokumen",
    detailInformation: "Informasi Detail",
    category: "Kategori",
    department: "Departemen",
    uploadedBy: "Diunggah Oleh",
    createdAt: "Dibuat Pada",
    updatedAt: "Diperbarui Pada",
    proposalObjective: "Tujuan Proposal",
    additionalInfo: "Informasi Dokumen Tambahan",
    documentFormat: "Format Dokumen",
    retentionPeriod: "Periode Retensi",
    hardCopyRetention: "Periode Retensi Salinan Fisik",
    storageLocation: "Lokasi Penyimpanan",
    hardCopyStorage: "Lokasi Penyimpanan Salinan Fisik",
    remark: "Catatan",
    publishingInstitution: "Lembaga Penerbit",
    dateOfIssue: "Tanggal Terbit",
    expiredDate: "Tanggal Kedaluwarsa",
    documentReferences: "Referensi Dokumen",
    fileInformation: "Informasi Berkas",
    fileSize: "Ukuran Berkas",
    type: "Tipe",
    revision: "Revisi",
    rawDocumentInfo: "Informasi Dokumen Asli",
    downloadRaw: "Unduh Dokumen Asli",
    downloading: "Mengunduh...",
    documentPreview: "Pratinjau Dokumen",
    fullScreen: "Layar Penuh",
    openInNewTab: "Buka di Tab Baru",
    loadingPreview: "Memuat pratinjau...",
    failedToLoad: "Gagal memuat pratinjau. Silakan coba unduh dokumen.",
    failedPdf: "Gagal memuat PDF.",
    noPreview: "Tidak ada pratinjau tersedia",
    close: "Tutup",
    browserNotSupported: "Browser Anda tidak mendukung pratinjau PDF. Silakan gunakan tombol \"Buka di Tab Baru\" di atas atau unduh dokumen.",
    approvalWorkflow: "Alur Persetujuan",
    checkedByQA: "Diperiksa oleh Pemimpin QA",
    referenceApprove: "Persetujuan Referensi",
    approverLvl: "Penyetuju (Lvl {level})",
    revisionPurpose: "Tujuan Revisi:",
    comments: "Komentar:",
    created: "Dibuat:",
    processed: "Diproses:",
    printDisabled: "Pencetakan dinonaktifkan untuk pratinjau Master. Silakan gunakan tab Pratinjau Cetak jika Anda memiliki persetujuan cetak.",
  },

  // ── Language Switcher ────────────────────────────────────
  language: {
    english: "English",
    indonesian: "Bahasa Indonesia",
    switchLanguage: "Ganti Bahasa",
  },

  // ── Document List ────────────────────────────────────────
  documentList: {
    title: "Daftar Dokumen",
    subtitle: "Daftar semua dokumen",
    searchPlaceholder: "Cari...",
    distribution: "Distribusi",
    allDest: "Semua Tujuan",
    approvedOnly: "Hanya Disetujui",
    masterIndex: "Indeks Master",
    bulkPrint: "Cetak Massal",
    backToDepartments: "Kembali ke Departemen",
    registry: "Registri",
    totalRecords: "Total Catatan",
    noRecordsSearch: "Tidak ada catatan yang cocok dengan pencarian Anda",
    columns: {
      name: "Nama",
      noDocument: "No Dokumen",
      revision: "Revisi",
      releaseDate: "Tanggal Rilis",
      status: "Status",
      approvalProgress: "Progres Persetujuan",
      documentType: "Tipe Dokumen",
      published: "Dipublikasi",
      action: "Aksi"
    },
    noDocuments: "Tidak Ada Dokumen Ditemukan",
    noDocumentsDesc: "Kami tidak dapat menemukan dokumen yang sesuai dengan kriteria Anda. Coba sesuaikan pencarian atau filter Anda.",
    progress: "Progres",
    publishedState: "Dipublikasi",
    unpublishedState: "Belum Dipublikasi",
    viewDocument: "Lihat Dokumen",
    editUsage: "Ubah Penggunaan",
    reviseDocument: "Revisi Dokumen",
    deleteDocument: "Hapus Dokumen",
    deleteTitle: "Hapus Dokumen",
    deleteConfirm: "Apakah Anda yakin ingin menghapus dokumen ini?",
    deleteApprovedDesc: " Karena dokumen ini disetujui atau sebelumnya telah disetujui, permintaan penghapusan akan dikirim ke QA untuk disetujui.",
    deleteUndoneDesc: " Tindakan ini tidak dapat dibatalkan.",
    reasonForDeletion: "Alasan Penghapusan",
    reasonPlaceholder: "Silakan berikan alasan untuk penghapusan...",
    requestDeletion: "Minta Penghapusan",
    bulkPrintTitle: "Permintaan Cetak Massal",
    bulkPrintDesc: "Minta cetak untuk {count} dokumen terpilih. Ini akan mengirimkan permintaan cetak ke QA untuk disetujui.",
    reasonForPrint: "Alasan Permintaan Cetak",
    reasonPrintPlaceholder: "Masukkan alasan untuk permintaan cetak...",
    numberOfCopies: "Jumlah Salinan",
    distributionLabel: "Distribusi",
    storageLocation: "Lokasi Penyimpanan",
    storagePlaceholder: "Masukkan lokasi penyimpanan...",
    selectedDocuments: "Dokumen Terpilih",
    requestPrint: "Minta Cetak",
    approvalWorkflow: "Alur Persetujuan",
    currentProgressFor: "Progres saat ini untuk",
  },

  // ── View Index Dialog ────────────────────────────────────
  viewIndex: {
    viewIndexLabel: "Lihat Indeks",
    dialogTitle: "Lihat Indeks Dokumen",
    dialogDesc: "Pilih tipe indeks dan kategori dokumen yang ingin Anda lihat.",
    indexType: "Tipe Indeks",
    masterIndex: "Indeks Master",
    formIndex: "Indeks Form",
    documentCategory: "Kategori Dokumen",
    internal: "Internal",
    internalDesc: "Dokumen Internal PTI",
    external: "Eksternal",
    externalDesc: "Dokumen Sumber Eksternal",
    department: "Departemen",
    viewSelectedIndex: "Lihat indeks yang dipilih"
  },

  // ── Create Document ──────────────────────────────────────
  createDocument: {
    title: "Buat Dokumen",
    backToDocuments: "Kembali ke Dokumen",
    registerNew: "Daftarkan Dokumen Baru",
    uploadDesc: "Unggah dokumen baru ke dalam sistem.",
    documentName: "Nama Dokumen",
    documentNamePlaceholder: "Masukkan nama dokumen",
    documentType: "Tipe Dokumen",
    documentTypePlaceholder: "Pilih tipe dokumen",
    internalDocument: "Dokumen Internal",
    externalDocument: "Dokumen Eksternal",
    category: "Kategori",
    categoryPlaceholder: "Pilih kategori",
    categories: {
      form: "Dokumen Form",
      standard: "Dokumen Standar",
      workInstruction: "Dokumen Instruksi Kerja",
      procedure: "Dokumen Prosedur",
      manualCompany: "Dokumen Manual Perusahaan",
      manualHalal: "Dokumen Manual Halal"
    },
    proposalObjective: "Tujuan Proposal",
    proposalPlaceholder: "Mengapa dokumen ini harus dibuat (contoh: temuan audit, dll.)",
    destinationDocument: "Dokumen Tujuan",
    destinationPlaceholder: "Pilih tujuan",
    documentFormat: "Format Dokumen",
    formatPlaceholder: "Pilih format dokumen",
    formats: {
      digital: "Dokumen Digital",
      hard: "Dokumen Fisik",
      both: "Dokumen Digital & Fisik"
    },
    retentionPeriod: "Masa Simpan",
    digitalRetentionPeriod: "Masa Simpan Digital",
    retentionPlaceholder: "Contoh: 5 Bulan / 5 Tahun / Tidak Terbatas",
    hardRetentionPeriod: "Masa Simpan Fisik",
    hardRetentionPlaceholder: "Contoh: 1 Tahun, 6 Bulan...",
    storageLocation: "Lokasi Penyimpanan",
    digitalStorageLocation: "Lokasi Penyimpanan Digital",
    storagePlaceholder: "Masukkan lokasi penyimpanan",
    hardStorageLocation: "Lokasi Penyimpanan Fisik",
    hardStoragePlaceholder: "Masukkan lokasi penyimpanan fisik",
    remark: "Catatan (Opsional)",
    remarkPlaceholder: "Masukkan catatan tambahan",
    publishingInstitution: "Institusi Penerbit",
    publishingPlaceholder: "Masukkan institusi penerbit",
    dateOfIssue: "Tanggal Terbit",
    expiredDate: "Tanggal Kedaluwarsa (Jika ada)",
    documentStorage: "Penyimpanan Dokumen",
    documentStoragePlaceholder: "Masukkan lokasi penyimpanan dokumen (contoh: Rak A, Baris 1)",
    documentReferences: "Referensi Dokumen",
    minTwoRefs: "(minimal 2 referensi diperlukan)",
    minOneRef: "(minimal 1 referensi diperlukan)",
    optional: "(opsional)",
    referencesDesc: "Pilih referensi dokumen yang berlaku. Pemeriksa yang ditugaskan akan diberi tahu untuk meninjau.",
    loadingReferences: "Memuat referensi...",
    noReferences: "Tidak ada referensi tersedia. Anda dapat menambahkan referensi di Pengaturan.",
    checker: "Pemeriksa:",
    ikTemplate: "Template Instruksi Kerja",
    ikTemplateDesc: "Isi kolom teks di bawah ini untuk membuat Dokumen Instruksi Kerja secara sistematis. Tidak diperlukan unggahan File/Master File.",
    documentFile: "File Dokumen (Unggah soft file dalam format pdf)",
    masterFile: "Master File Dokumen (Unggah soft file dalam format excel atau word)",
    selectedFile: "Terpilih:",
    uploading: "Mengunggah...",
    uploadBtn: "Unggah Dokumen"
  },

  // ── Update Document ──────────────────────────────────────
  updateDocument: {
    title: "Perbarui Dokumen",
    update: "Perbarui",
    updateDesc: "Perbarui informasi dokumen.",
    isInternalDocument: "Apakah Dokumen Internal?",
    yes: "Ya",
    no: "Tidak",
    documentFileOptional: "File Dokumen (Opsional)",
    masterFileOptional: "Master File Dokumen (Opsional)",
    updating: "Memperbarui...",
    updateBtn: "Perbarui Dokumen",
    loadingTemplate: "Memuat template...",
    editTemplateDesc: "Edit template Instruksi Kerja di bawah ini. Dokumen master PDF dan Excel akan dibuat ulang secara otomatis."
  },

  // ── Master Index ─────────────────────────────────────────
  masterIndex: {
    title: "Master Induk Dokumen",
    formTitle: "Daftar Induk Catatan",
    excelExport: "Ekspor Excel",
    print: "Cetak",
    limit: "Batas:",
    internalProtocol: "Protokol Registrasi Internal",
    externalProtocol: "Protokol Sumber Eksternal",
    generalIndex: "Indeks Dokumentasi Umum",
    internalFormProtocol: "Protokol Registrasi Internal",
    externalFormProtocol: "Protokol Registrasi Eksternal",
    generalFormIndex: "Indeks Dokumentasi Form Umum",
    noDocuments: "Tidak ada dokumen yang tersedia di klasifikasi ini",
    noRecords: "Tidak ada catatan departemen yang ditemukan",
    dateEffective: "Tanggal Efektif",
    revisionStatus: "Status Revisi",
    page: "Hal",
    of: "dari"
  },

  // ── Approvals ────────────────────────────────────────────
  approvals: {
    management: "Manajemen Persetujuan",
    approveAllPending: "Setujui Semua Tertunda ({count})",
    allStatus: "Semua Status",
    pending: "Tertunda",
    approved: "Disetujui",
    rejected: "Ditolak",
    tabs: {
      all: "Semua",
      document: "Dokumen",
      print: "Cetak",
      deletion: "Penghapusan",
      reference: "Referensi"
    },
    columns: {
      type: "Tipe",
      documentCode: "Kode Dokumen",
      documentName: "Nama Dokumen",
      requester: "Pemohon",
      status: "Status",
      reasonPurpose: "Alasan/Tujuan",
      requested: "Diminta",
      approveDate: "Tanggal Setuju",
      category: "Kategori",
      department: "Nama Departemen",
      actions: "Aksi"
    },
    noApprovalsFound: "Tidak Ada Persetujuan Ditemukan",
    noApprovalsDesc: "Saat ini tidak ada permintaan persetujuan yang cocok dengan kriteria Anda.",
    viewDetails: "Lihat Detail",
    approve: "Setujui",
    reject: "Tolak",
    badges: {
      newDoc: "Dok Baru",
      print: "Cetak",
      delete: "Hapus",
      reference: "Referensi",
      refRev: "Ref Rev",
      rev: "Rev"
    },
    export: {
      title: "Ekspor Persetujuan",
      department: "Departemen",
      allDepartments: "Semua Departemen",
      slaStatus: "Status SLA",
      allSla: "Semua Status",
      within3Days: "Dalam 3 Hari",
      over3Days: "Lebih dari 3 Hari",
      approvalStage: "Tahap Persetujuan",
      allStages: "Semua Tahap",
      qaApprove: "QA Approve",
      lev1Approve: "Level 1 Approv",
      lev2Approve: "Level 2 Approv",
      lev3Approve: "Level 3 Approv",
      startDate: "Tanggal Mulai",
      endDate: "Tanggal Akhir",
      button: "Ekspor Excel"
    }
  },

  // ── Print History ─────────────────────────────────────────
  printHistory: {
    description: "Lihat semua riwayat permintaan cetak di sistem",
    columns: {
      no: "No",
      documentName: "Nama Dokumen",
      documentCode: "Kode Dokumen",
      requester: "Pemohon",
      distribution: "Distribusi",
      picTaken: "PIC Pengambil",
      takenAt: "Diambil Pada",
      status: "Status",
      dateRequested: "Tanggal Diminta",
      copies: "Salinan",
      action: "Aksi"
    },
    status: {
      pending: "Tertunda",
      approved: "Disetujui",
      rejected: "Ditolak",
      printed: "Dicetak",
      ready: "Siap",
      completed: "Diambil"
    },
    internalPti: "Internal PTI",
    externalPti: "Eksternal PTI",
    loading: "Memuat riwayat...",
    noHistory: "Tidak ada riwayat cetak ditemukan.",
    viewDetail: "Lihat Detail",
    printControlled: "Cetak Terkendali",
    printUncontrolled: "Cetak Tidak Terkendali",
    markReady: "Tandai Siap",
    recordPickup: "Catat Pengambilan"
  },

  // ── Obsolete Documents ───────────────────────────────────
  obsolete: {
    description: "Daftar dokumen usang (hanya baca)",
    columns: {
      name: "Nama",
      documentCode: "Kode Dokumen",
      revision: "Revisi",
      category: "Kategori",
      deleteReason: "Alasan Hapus",
      department: "Departemen",
      releaseDate: "Tanggal Rilis",
      action: "Aksi"
    },
    viewDocument: "Lihat Dokumen",
    downloadDocument: "Unduh Dokumen",
    downloadMasterDocument: "Unduh Master Dokumen"
  },

  // ── Users ────────────────────────────────────────────────
  users: {
    description: "Daftar semua pengguna dalam sistem",
    addUser: "Tambah Pengguna",
    loading: "Memuat pengguna...",
    noUsers: "Tidak ada pengguna ditemukan",
    columns: {
      no: "No",
      fullName: "Nama Lengkap",
      position: "Jabatan",
      email: "Email",
      role: "Peran",
      actions: "Aksi"
    },
    actions: {
      view: "Lihat Pengguna",
      update: "Perbarui Pengguna",
      changePassword: "Ubah Kata Sandi",
      delete: "Hapus Pengguna"
    },
    deleteConfirm: {
      title: "Hapus Pengguna",
      description: "Apakah Anda yakin ingin menghapus pengguna ini?",
      yes: "Hapus",
      no: "Batal"
    }
  },

  // ── Roles ────────────────────────────────────────────────
  roles: {
    management: "Manajemen Peran",
    addRole: "Tambah Peran",
    search: "Cari peran...",
    loading: "Memuat...",
    noRoles: "Tidak ada peran ditemukan",
    noDescription: "Tidak ada deskripsi",
    columns: {
      name: "Nama",
      description: "Deskripsi",
      permissions: "Izin",
      users: "Pengguna",
      actions: "Aksi"
    },
    actions: {
      view: "Lihat Peran",
      edit: "Edit Peran",
      delete: "Hapus Peran"
    },
    deleteConfirm: {
      title: "Hapus Peran",
      description: "Apakah Anda yakin ingin menghapus peran ini? Tindakan ini tidak dapat dibatalkan.",
      yes: "Hapus",
      no: "Batal"
    }
  },

  // ── Departments ──────────────────────────────────────────
  departments: {
    description: "Daftar semua departemen dalam sistem",
    addDepartment: "Tambah Departemen",
    loading: "Memuat departemen...",
    noDepartments: "Tidak ada departemen ditemukan",
    columns: {
      no: "No",
      departmentName: "Nama Departemen",
      departmentCode: "Kode Departemen",
      description: "Deskripsi",
      usersCount: "Jumlah Pengguna",
      status: "Status",
      actions: "Aksi"
    },
    status: {
      active: "Aktif",
      draft: "Draf"
    },
    actions: {
      view: "Lihat Departemen",
      update: "Perbarui Departemen",
      delete: "Hapus Departemen"
    },
    deleteConfirm: {
      title: "Konfirmasi Hapus",
      description: "Apakah Anda yakin ingin menghapus departemen ini? Tindakan ini akan menghapus departemen dan tidak dapat dibatalkan.",
      yes: "Hapus",
      no: "Batal"
    }
  },

  // ── References ───────────────────────────────────────────
  references: {
    management: "Manajemen Referensi Dokumen",
    addReference: "Tambah Referensi",
    search: "Cari referensi...",
    loading: "Memuat...",
    noReferences: "Tidak ada referensi ditemukan",
    noDescription: "Tidak ada deskripsi",
    notAssigned: "Belum ditugaskan",
    columns: {
      code: "Kode",
      name: "Nama",
      description: "Deskripsi",
      checker: "Pemeriksa",
      status: "Status",
      documents: "Dokumen",
      actions: "Aksi"
    },
    status: {
      active: "Aktif",
      inactive: "Tidak Aktif"
    },
    actions: {
      edit: "Edit",
      delete: "Hapus"
    },
    deleteConfirm: {
      title: "Hapus Referensi",
      description: "Apakah Anda yakin ingin menghapus referensi ini? Tindakan ini tidak dapat dibatalkan.",
      yes: "Hapus",
      no: "Batal"
    }
  },

  // ── Common ───────────────────────────────────────────────
  common: {
    home: "Beranda",
    search: "Cari",
    save: "Simpan",
    delete: "Hapus",
    edit: "Ubah",
    create: "Buat",
    update: "Perbarui",
    back: "Kembali",
    next: "Selanjutnya",
    previous: "Sebelumnya",
    yes: "Ya",
    no: "Tidak",
    confirm: "Konfirmasi",
    cancel: "Batal",
    loading: "Memuat...",
    noData: "Tidak ada data",
    actions: "Aksi",
    status: "Status",
    internal: "Internal",
  },
};

export default id;
