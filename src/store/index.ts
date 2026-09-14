import { configureStore } from "@reduxjs/toolkit";
import authUserReducer from "./authUser/reducer";
import departmentsReducer from "./departments/reducer";
import usersReducer from "./users/reducer";
import documentsReducer from "./documents/reducer";
import approvalsReducer from "./approvals/reducer";
import rolesReducer from "./roles/reducer";
import notificationsReducer from "./notifications/reducer";
import uiReducer from "./ui/reducer";
import printRequestsReducer from "./printRequests/reducer";
import referencesReducer from "./references/reducer";
import referenceApprovalsReducer from "./referenceApprovals/reducer";

const store = configureStore({
  reducer: {
    authUser: authUserReducer,
    departments: departmentsReducer,
    users: usersReducer,
    documents: documentsReducer,
    approvals: approvalsReducer,
    roles: rolesReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
    printRequests: printRequestsReducer,
    references: referencesReducer,
    referenceApprovals: referenceApprovalsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
