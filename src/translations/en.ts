/**
 * English translations — Source of truth.
 * DO NOT modify these texts as they are already correct.
 */
const en = {
  // ── Sidebar ──────────────────────────────────────────────
  sidebar: {
    application: "Application",
    dashboard: "Dashboard",
    documents: "Documents",
    masterDocuments: "Master Documents",
    sharedDocuments: "Shared Documents",
    obsoleteDocuments: "Obsolete Documents",
    approvals: "Approvals",
    printHistory: "Print History",
    migrationsDoc: "Migrations Doc",
    recordsDocuments: "Records Documents",
    records: "Records",
    master: "Master",
    departments: "Departments",
    users: "Users",
    roles: "Roles",
    references: "References",
  },

  // ── Header / Layout ─────────────────────────────────────
  layout: {
    copyright: "Copyright © {year} PT. Toyo Ink Indonesia.",
    allRightsReserved: "All rights reserved.",
  },

  // ── Profile ──────────────────────────────────────────────
  profile: {
    profile: "Profile",
    logOut: "Log out",
    logout: "Logout",
    logoutConfirm: "Are you sure you want to logout?",
    cancel: "Cancel",
    changePassword: "Change Password",
    name: "Name",
    username: "Username",
    email: "Email",
    role: "Role",
    department: "Department"
  },

  // ── Notifications ────────────────────────────────────────
  notifications: {
    title: "Notifications",
    unread: "{count} unread",
    markAllAsRead: "Mark all as read",
    noNotifications: "No notifications yet",
    loading: "Loading...",
    approvals: "Approvals",
    document: "Document",
  },

  // ── Login ────────────────────────────────────────────────
  login: {
    title: "IT Helpdesk",
    subtitle: "Enter your credentials to login",
    username: "Username",
    usernamePlaceholder: "Enter your username",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    loginButton: "Login",
    loggingIn: "Loading...",
  },

  // ── Dashboard ────────────────────────────────────────────
  dashboard: {
    title: "Dashboard",
    monitoring: "Dashboard Monitoring",
    liveDescription: "Live system monitoring and analytics.",
    filterBy: "Filter by:",
    allDepartments: "All Departments",
    synchronizing: "Synchronizing architectural data...",
    totalDocuments: "Total Documents",
    approved: "Approved",
    pendingApproval: "Pending Approval",
    rejected: "Rejected",
    live: "Live",
    totalDocIntExt: "Total Document Internal and External",
    summaryDocInternal: "Summary Document Internal",
    totalDocument: "Total Document",
  },

  // ── Document Control / List ──────────────────────────────
  documentControl: {
    title: "Document Control",
    description: "Manage, track, and organize all your quality assurance documents in one centralized secure repository.",
    registerNew: "Register New Document",
    categories: "Categories",
    filterByType: "Filter by document type",
    allDocuments: "All Documents",
    viewAllRepo: "View all repository documents",
    forms: "Forms",
    formsDesc: "Standardized input forms",
    standards: "Standards",
    standardsDesc: "Quality and ISO standards",
    workInstructions: "Work Instructions",
    workInstructionsDesc: "Step-by-step guides",
    procedures: "Procedures",
    proceduresDesc: "Operating procedures (SOP)",
    companyManuals: "Company Manuals",
    companyManualsDesc: "Policy and company guides",
    halalManuals: "Halal Manuals",
    halalManualsDesc: "Halal certification docs",
    external: "External",
    externalDesc: "Third-party documents",
  },

  // ── Document Detail ──────────────────────────────────────
  documentDetail: {
    documentNumber: "Document Number",
    detailInformation: "Detail Information",
    category: "Category",
    department: "Department",
    uploadedBy: "Uploaded By",
    createdAt: "Created At",
    updatedAt: "Updated At",
    proposalObjective: "Proposal Objective",
    additionalInfo: "Additional Document Information",
    documentFormat: "Document Format",
    retentionPeriod: "Retention Period",
    hardCopyRetention: "Hard Copy Retention Period",
    storageLocation: "Storage Location",
    hardCopyStorage: "Hard Copy Storage Location",
    remark: "Remark",
    publishingInstitution: "Publishing Institution",
    dateOfIssue: "Date of Issue",
    expiredDate: "Expired Date",
    documentReferences: "Document References",
    fileInformation: "File Information",
    fileSize: "File Size",
    type: "Type",
    revision: "Revision",
    rawDocumentInfo: "Raw Document Information",
    downloadRaw: "Download Raw Document",
    downloading: "Downloading...",
    documentPreview: "Document Preview",
    fullScreen: "Full Screen",
    openInNewTab: "Open in New Tab",
    loadingPreview: "Loading preview...",
    failedToLoad: "Failed to load preview. Please try downloading the document.",
    failedPdf: "Failed to load PDF.",
    noPreview: "No preview available",
    close: "Close",
    browserNotSupported: "Your browser does not support PDF preview. Please use the \"Open in New Tab\" button above or download the document.",
    approvalWorkflow: "Approval Workflow",
    checkedByQA: "Checked by QA Leader",
    referenceApprove: "Reference Approve",
    approverLvl: "Approver (Lvl {level})",
    revisionPurpose: "Revision Purpose:",
    comments: "Comments:",
    created: "Created:",
    processed: "Processed:",
    printDisabled: "Printing is disabled for Master preview. Please use Print Preview tab if you have print approval.",
  },

  // ── Language Switcher ────────────────────────────────────
  language: {
    english: "English",
    indonesian: "Bahasa Indonesia",
    switchLanguage: "Switch Language",
  },

  // ── Document List ────────────────────────────────────────
  documentList: {
    title: "Document List",
    subtitle: "List of all documents",
    searchPlaceholder: "Search...",
    distribution: "Distribution",
    allDest: "All Dest",
    approvedOnly: "Approved Only",
    masterIndex: "Master Index",
    bulkPrint: "Bulk Print",
    backToDepartments: "Back to Departments",
    registry: "Registry",
    totalRecords: "Total Records",
    noRecordsSearch: "No records matching your search",
    columns: {
      name: "Name",
      noDocument: "No Document",
      revision: "Revision",
      releaseDate: "Release Date",
      status: "Status",
      approvalProgress: "Approval Progress",
      documentType: "Document Type",
      published: "Published",
      action: "Action"
    },
    noDocuments: "No Documents Found",
    noDocumentsDesc: "We couldn't find any documents matching your criteria. Try adjusting your search or filters.",
    progress: "Progress",
    publishedState: "Published",
    unpublishedState: "Unpublished",
    viewDocument: "View Document",
    editUsage: "Edit Usage",
    reviseDocument: "Revise Document",
    deleteDocument: "Delete Document",
    deleteTitle: "Delete Document",
    deleteConfirm: "Are you sure you want to delete this document?",
    deleteApprovedDesc: " Since this document is approved or has been previously approved, a deletion request will be sent to QA for approval.",
    deleteUndoneDesc: " This action cannot be undone.",
    reasonForDeletion: "Reason for Deletion",
    reasonPlaceholder: "Please provide a reason for deletion...",
    requestDeletion: "Request Deletion",
    bulkPrintTitle: "Bulk Request Print",
    bulkPrintDesc: "Request print for {count} selected document(s). This will send a print request to QA for approval.",
    reasonForPrint: "Reason for Print Request",
    reasonPrintPlaceholder: "Enter reason for print request...",
    numberOfCopies: "Number of Copies",
    distributionLabel: "Distribution",
    storageLocation: "Storage Location",
    storagePlaceholder: "Enter storage location...",
    selectedDocuments: "Selected Documents",
    requestPrint: "Request Print",
    approvalWorkflow: "Approval Workflow",
    currentProgressFor: "Current progress for",
  },

  // ── View Index Dialog ────────────────────────────────────
  viewIndex: {
    viewIndexLabel: "View Index",
    dialogTitle: "View Document Index",
    dialogDesc: "Select the index type and document category you wish to view.",
    indexType: "Index Type",
    masterIndex: "Master Index",
    formIndex: "Form Index",
    documentCategory: "Document Category",
    internal: "Internal",
    internalDesc: "PTI Internal Documents",
    external: "External",
    externalDesc: "External Source Documents",
    department: "Department",
    viewSelectedIndex: "View selected index"
  },

  // ── Create Document ──────────────────────────────────────
  createDocument: {
    title: "Create Document",
    backToDocuments: "Back to Documents",
    registerNew: "Register New Document",
    uploadDesc: "Upload a new document to the system.",
    documentName: "Document Name",
    documentNamePlaceholder: "Enter document name",
    documentType: "Document Type",
    documentTypePlaceholder: "Select document type",
    internalDocument: "Internal Document",
    externalDocument: "External Document",
    category: "Category",
    categoryPlaceholder: "Select category",
    categories: {
      form: "Form Document",
      standard: "Standard Document",
      workInstruction: "Work Instructions Document",
      procedure: "Procedure Document",
      manualCompany: "Manual Company Document",
      manualHalal: "Manual Halal Document"
    },
    proposalObjective: "Proposal Objective",
    proposalPlaceholder: "Why the document have to establish (e.g. audit finding, etc.)",
    destinationDocument: "Destination Document",
    destinationPlaceholder: "Select destination",
    documentFormat: "Document Format",
    formatPlaceholder: "Select document format",
    formats: {
      digital: "Digital Document",
      hard: "Hard Document",
      both: "Digital & Hard Document"
    },
    retentionPeriod: "Retention Period",
    digitalRetentionPeriod: "Digital Retention Period",
    retentionPlaceholder: "Example: 5 Months / 5 Years / Unlimited",
    hardRetentionPeriod: "Hard Copy Retention Period",
    hardRetentionPlaceholder: "e.g. 1 Year, 6 Months...",
    storageLocation: "Storage Location",
    digitalStorageLocation: "Digital Storage Location",
    storagePlaceholder: "Enter storage location",
    hardStorageLocation: "Hard Copy Storage Location",
    hardStoragePlaceholder: "Enter hard copy storage location",
    remark: "Remark (Optional)",
    remarkPlaceholder: "Enter any additional remarks",
    publishingInstitution: "Publishing Institution",
    publishingPlaceholder: "Enter publishing institution",
    dateOfIssue: "Date of Issue",
    expiredDate: "Expired Date (If any)",
    documentStorage: "Document Storage",
    documentStoragePlaceholder: "Enter document storage location (e.g. Rack A, Shelf 1)",
    documentReferences: "Document References",
    minTwoRefs: "(minimum 2 references required)",
    minOneRef: "(minimum 1 reference required)",
    optional: "(optional)",
    referencesDesc: "Select applicable document references. Assigned checkers will be notified for review.",
    loadingReferences: "Loading references...",
    noReferences: "No references available. You can add references in Settings.",
    checker: "Checker:",
    ikTemplate: "Instruksi Kerja Template",
    ikTemplateDesc: "Fill in the rich-text fields below to systematically generate your Work Instruction Document safely. No File/Master File upload is required.",
    documentFile: "Document File (Upload soft file in pdf format)",
    masterFile: "Master Document File (Upload soft file in excel or word format)",
    selectedFile: "Selected:",
    uploading: "Uploading...",
    uploadBtn: "Upload Document"
  },

  // ── Update Document ──────────────────────────────────────
  updateDocument: {
    title: "Update Document",
    update: "Update",
    updateDesc: "Update document information.",
    isInternalDocument: "Is Internal Document?",
    yes: "Yes",
    no: "No",
    documentFileOptional: "Document File (Optional)",
    masterFileOptional: "Master Document File (Optional)",
    updating: "Updating...",
    updateBtn: "Update Document",
    loadingTemplate: "Loading template...",
    editTemplateDesc: "Edit the Work Instruction template below. PDF and Excel master documents will be regenerated automatically."
  },

  // ── Master Index ─────────────────────────────────────────
  masterIndex: {
    title: "Master Document Index",
    formTitle: "Form Record Index",
    excelExport: "Excel Export",
    print: "Print",
    limit: "Limit:",
    internalProtocol: "Internal Registry Protocol",
    externalProtocol: "External Source Protocol",
    generalIndex: "General Documentation Index",
    internalFormProtocol: "Internal Protocol Registry",
    externalFormProtocol: "External Protocol Registry",
    generalFormIndex: "General Form Documentation Index",
    noDocuments: "No documents available in this classification",
    noRecords: "No departmental records found",
    dateEffective: "Effective Date",
    revisionStatus: "Revision Status",
    page: "Page",
    of: "of"
  },

  // ── Approvals ────────────────────────────────────────────
  approvals: {
    management: "Approval Management",
    approveAllPending: "Approve All Pending ({count})",
    allStatus: "All Status",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    tabs: {
      all: "All",
      document: "Document",
      print: "Print",
      deletion: "Deletion",
      reference: "Reference"
    },
    columns: {
      type: "Type",
      documentCode: "Document Code",
      documentName: "Document Name",
      requester: "Requester",
      status: "Status",
      reasonPurpose: "Reason/Purpose",
      requested: "Requested",
      approveDate: "Approve Date",
      category: "Category",
      department: "Department Name",
      actions: "Actions"
    },
    noApprovalsFound: "No Approvals Found",
    noApprovalsDesc: "There are currently no approval requests matching your criteria.",
    viewDetails: "View Details",
    approve: "Approve",
    reject: "Reject",
    badges: {
      newDoc: "New Doc",
      print: "Print",
      delete: "Delete",
      reference: "Reference",
      refRev: "Ref Rev",
      rev: "Rev"
    },
    export: {
      title: "Export Approvals",
      department: "Department",
      allDepartments: "All Departments",
      slaStatus: "SLA Status",
      allSla: "All Statuses",
      within3Days: "Within 3 Days",
      over3Days: "Over 3 Days",
      approvalStage: "Approval Stage",
      allStages: "All Stages",
      qaApprove: "QA Approve",
      lev1Approve: "Level 1 Approv",
      lev2Approve: "Level 2 Approv",
      lev3Approve: "Level 3 Approv",
      startDate: "Start Date",
      endDate: "End Date",
      button: "Export Excel"
    }
  },

  // ── Print History ─────────────────────────────────────────
  printHistory: {
    description: "View all print request history in the system",
    columns: {
      no: "No",
      documentName: "Document Name",
      documentCode: "Document Code",
      requester: "Requester",
      distribution: "Distribution",
      picTaken: "PIC Taken",
      takenAt: "Taken At",
      status: "Status",
      dateRequested: "Date Requested",
      copies: "Copies",
      action: "Action"
    },
    status: {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      printed: "Printed",
      ready: "Ready",
      completed: "Taken"
    },
    internalPti: "Internal PTI",
    externalPti: "External PTI",
    loading: "Loading history...",
    noHistory: "No print history found.",
    viewDetail: "View Detail",
    printControlled: "Print Controlled",
    printUncontrolled: "Print Uncontrolled",
    markReady: "Mark Ready",
    recordPickup: "Record Pickup"
  },

  // ── Obsolete Documents ───────────────────────────────────
  obsolete: {
    description: "List of obsolete documents (read-only)",
    columns: {
      name: "Name",
      documentCode: "Document Code",
      revision: "Revision",
      category: "Category",
      deleteReason: "Delete Reason",
      department: "Department",
      releaseDate: "Release Date",
      action: "Action"
    },
    viewDocument: "View Document",
    downloadDocument: "Download Document",
    downloadMasterDocument: "Download Master Document"
  },

  // ── Users ────────────────────────────────────────────────
  users: {
    description: "List of all users in the system",
    addUser: "Add User",
    loading: "Loading users...",
    noUsers: "No users found",
    columns: {
      no: "No",
      fullName: "Full Name",
      position: "Position",
      email: "Email",
      role: "Role",
      actions: "Actions"
    },
    actions: {
      view: "View User",
      update: "Update User",
      changePassword: "Change Password",
      delete: "Delete User"
    },
    deleteConfirm: {
      title: "Delete User",
      description: "Are you sure you want to delete this user?",
      yes: "Delete",
      no: "Cancel"
    }
  },

  // ── Roles ────────────────────────────────────────────────
  roles: {
    management: "Roles Management",
    addRole: "Add Role",
    search: "Search roles...",
    loading: "Loading...",
    noRoles: "No roles found",
    noDescription: "No description",
    columns: {
      name: "Name",
      description: "Description",
      permissions: "Permissions",
      users: "Users",
      actions: "Actions"
    },
    actions: {
      view: "View Role",
      edit: "Edit Role",
      delete: "Delete Role"
    },
    deleteConfirm: {
      title: "Delete Role",
      description: "Are you sure you want to delete this role? This action cannot be undone.",
      yes: "Delete",
      no: "Cancel"
    }
  },

  // ── Departments ──────────────────────────────────────────
  departments: {
    description: "List of all departments in the system",
    addDepartment: "Add Department",
    loading: "Loading departments...",
    noDepartments: "No departments found",
    columns: {
      no: "No",
      departmentName: "Department Name",
      departmentCode: "Department Code",
      description: "Description",
      usersCount: "Users Count",
      status: "Status",
      actions: "Actions"
    },
    status: {
      active: "Active",
      draft: "Draft"
    },
    actions: {
      view: "View Department",
      update: "Update Department",
      delete: "Delete Department"
    },
    deleteConfirm: {
      title: "Confirm Delete",
      description: "Are you sure you want to delete this department? This action will delete the department and cannot be undone.",
      yes: "Delete",
      no: "Cancel"
    }
  },

  // ── References ───────────────────────────────────────────
  references: {
    management: "Document References Management",
    addReference: "Add Reference",
    search: "Search references...",
    loading: "Loading...",
    noReferences: "No references found",
    noDescription: "No description",
    notAssigned: "Not assigned",
    columns: {
      code: "Code",
      name: "Name",
      description: "Description",
      checker: "Checker",
      status: "Status",
      documents: "Documents",
      actions: "Actions"
    },
    status: {
      active: "Active",
      inactive: "Inactive"
    },
    actions: {
      edit: "Edit",
      delete: "Delete"
    },
    deleteConfirm: {
      title: "Delete Reference",
      description: "Are you sure you want to delete this reference? This action cannot be undone.",
      yes: "Delete",
      no: "Cancel"
    }
  },

  // ── Common ───────────────────────────────────────────────
  common: {
    home: "Home",
    search: "Search",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    update: "Update",
    back: "Back",
    next: "Next",
    previous: "Previous",
    yes: "Yes",
    no: "No",
    confirm: "Confirm",
    cancel: "Cancel",
    loading: "Loading...",
    noData: "No data",
    actions: "Actions",
    status: "Status",
    internal: "Internal",
  },
};

export type TranslationKeys = typeof en;
export default en;
