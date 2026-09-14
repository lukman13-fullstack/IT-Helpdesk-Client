const fs = require('fs');
const path = 'p:/envlukman/DMS-QA-Client/src/translations/ja.ts';
let content = fs.readFileSync(path, 'utf8');
const exportObj = `      },
      export: {
        title: "????????",
        department: "??",
        allDepartments: "??????",
        slaStatus: "SLA?????",
        allSla: "?????????",
        within3Days: "3???",
        over3Days: "3???",
        approvalStage: "????",
        allStages: "??????",
        qaApprove: "QA??",
        lev1Approve: "???1??",
        lev2Approve: "???2??",
        lev3Approve: "???3??",
        startDate: "???",
        endDate: "???",
        button: "Excel??????"
      }
    },`;
content = content.replace(/      \}\n    \},(?=\n\n    \/\/ ??? Print History)/, exportObj);
fs.writeFileSync(path, content, 'utf8');
console.log('Done!');
