import { configureStore } from "@reduxjs/toolkit";
import authUserReducer from "./authUser/reducer";
import departmentsReducer from "./departments/reducer";
import usersReducer from "./users/reducer";
import rolesReducer from "./roles/reducer";
import uiReducer from "./ui/reducer";

const store = configureStore({
  reducer: {
    authUser: authUserReducer,
    departments: departmentsReducer,
    users: usersReducer,
    roles: rolesReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
