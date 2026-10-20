import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import {
  fetchBatchEnums,
  contactPersonQueryAll,
  contactPersonCreate,
  contactPersonUpdate,
  contactPersonVerification,
  deleteContactPerson,
} from '@/services/contactPersonService';

export default {
  namespace: 'enterpriseContactPerson',
  state: {
    enumMap: {},
    dataSource: {},
    editModalProps: {},
    editFormProps: {},
  },
  effects: {
    // 获取值集 并存入 enumMap
    *fetchBatchEnums(_, { call, put }) {
      const res = getResponse(
        yield call(fetchBatchEnums, {
          ID: 'SPFM.ID_TYPE',
          idd: 'HPFM.IDD', // 国际化手机号前缀
          gender: 'HPFM.GENDER', // 性别
        })
      );
      if (!isEmpty(res)) {
        yield put({
          type: 'updateState',
          payload: { enumMap: res },
        });
      }
    },
    *queryContactPerson({ payload }, { call }) {
      const res = getResponse(yield call(contactPersonQueryAll, payload));
      return getResponse(res);
    },
    *openCreateForm({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          editModalProps: {
            visible: true,
            title: intl.get('spfm.contactPerson.model.contactPerson.defaultPerson').d('默认联系人'),
          },
          editFormProps: {
            isCreate: true,
            ...payload,
          },
        },
      });
    },
    *openEditForm({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          editModalProps: {
            visible: true,
            title: intl.get('spfm.contactPerson.model.contactPerson.changePerson').d('修改联系人'),
          },
          editFormProps: {
            isCreate: false,
            ...payload,
          },
        },
      });
    },
    *closeEditModal({ payload }, { put }) {
      const { title } = payload;
      yield put({
        type: 'updateState',
        payload: {
          editModalProps: {
            visible: false,
            title,
          },
          editFormProps: {},
        },
      });
    },
    *createContactPersons({ payload }, { call }) {
      const { companyId, companyContact } = payload;
      const res = getResponse(yield call(contactPersonCreate, companyId, companyContact));
      if (isEmpty(res) || res.failed) {
        return {
          success: false,
          message:
            (res && res.message) ||
            intl.get('spfm.contactPerson.model.contactPerson.fail').d('保存失败'),
        };
      } else {
        return {
          success: true,
          message: intl.get('spfm.contactPerson.model.contactPerson.success').d('保存成功'),
        };
      }
    },
    *updateContactPersons({ payload }, { call }) {
      const { companyId, companyContact, companyContactId } = payload;
      const res = getResponse(
        yield call(contactPersonUpdate, companyId, companyContactId, companyContact)
      );
      if (isEmpty(res) || res.failed) {
        return { success: false, message: res && res.message };
      } else {
        return { success: true };
      }
    },
    *verification({ payload }, { call }) {
      const { companyId } = payload;
      return getResponse(yield call(contactPersonVerification, companyId));
    },
    *deleteContactPerson({ payload }, { call }) {
      return getResponse(yield call(deleteContactPerson, payload));
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
