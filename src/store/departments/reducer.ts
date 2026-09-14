import { ActionType } from "./action";
import type { DepartmentsState, DepartmentsAction } from "./types";

const initialState: DepartmentsState = {
  departments: [],
  departmentDetail: null,
  pagination: null,
  loading: false,
  error: null,
};

export default function departmentsReducer(
  state: DepartmentsState = initialState,
  action: DepartmentsAction
): DepartmentsState {
  switch (action.type) {
    case ActionType.GET_DEPARTMENTS:
      return {
        ...state,
        departments: action.payload.departments,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case ActionType.DELETE_DEPARTMENT:
      return {
        ...state,
        departments: state.departments.filter(
          (department) => department.id !== action.payload
        ),
        loading: false,
        error: null,
      };
    case ActionType.GET_DEPARTMENT:
      return {
        ...state,
        departmentDetail: action.payload,
        loading: false,
        error: null,
      };
    case ActionType.ADD_DEPARTMENT:
      return {
        ...state,
        departments: [...state.departments, action.payload],
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}
