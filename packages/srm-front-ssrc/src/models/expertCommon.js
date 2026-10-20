/**
 * model - 专家库
 * @date: 2019-01-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue, removeUploadFile, queryUUID } from 'services/api';
import {
  queryRecordList,
  queryApprove,
  fetchExpertReq,
  requisitionSave,
  tableDelete,
  requisitionDelete,
  requisitionCancel,
  requisitionSubmit,
  queryMaintenace,
  queryAll,
  queryReqQuery,
  queryRequisition,
  fetchDetailPersonal,
  saveDetailPersonal,
  approveExpert,
  rejectExpert,
  fetchDetailAdmin,
  submitRequisition,
  queryTransfer,
  saveDetailAdmin,
} from '@/services/expertService';

const getModel = (modelName = 'expert') => ({
  namespace: modelName,
  state: {
    code: {
      expertLevelList: [], // 专家级别
      expertTypeList: [], // 专家类型
      expertCategoryList: [], // 专家类别
      enabledStatus: [], // 启用状态
      genderList: [], // 性别
      idTypeList: [], // 证件类型
      crownCodeList: [], // 国际冠码
    }, // 值集
    approveList: {}, // 专家注册申请审批查询数据
    approvePagination: {}, // 专家注册申请审批查询分页参数
    maintenaceList: {}, // 专家信息汇总查询(管理员)数据
    maintenacePagination: {}, // 专家信息汇总查询(管理员)分页参数
    queryList: {}, // 专家信息汇总查询数据
    queryPagination: {}, // 专家信息汇总查询分页参数
    reqQueryList: {}, // 专家注册申请汇总查询数据
    reqQueryPagination: {}, // 专家注册申请汇总查询分页参数
    requisitionList: {}, // 专家注册申请查询数据
    requisitionPagination: {}, // 专家注册申请查询分页参数
    operationRecordPagination: {}, // 详情页面的操作记录分页
    operationRecordList: [], // 详情页面的操作记录列表
    // 专家信息维护
    expertFormData: {}, // 专家注册申请 form对象
    fieldList: [], // 专业领域
    selectFields: [], // 选中的专业领域 value#meaning
    achievementList: [], // 专业成果数据
    careerPortfolioList: [], // 职业履历数据
    educationExperienceList: [], // 教育经历数据
    bankInfoList: [], // 银行信息数据
    enclosureList: [], // 附件数据
    // 专家注册申请
    expertReqFormData: {},
    fieldReqList: [],
    selectFieldReqs: [],
    achievementReqList: [],
    careerPortfolioReqList: [],
    educationExperienceReqList: [],
    bankInfoReqList: [],
    enclosureReqList: [],
    auditRows: [], // 专家注册申请入口table行
    allField: [], // 专家领域数据
    documentsState: [], // 过滤掉新建的单据状态
  },
  effects: {
    // 查询值集
    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: {
            code: {
              ...code,
              genderList:
                code.genderList &&
                code.genderList.filter((o) => o.value === '0' || o.value === '1'),
            },
          },
        });
      }
    },

    // 删除文件
    *removeAttachment({ payload }, { call }) {
      const data = getResponse(yield call(removeUploadFile, payload));
      return data;
    },

    // 查询专家注册申请明细
    *fetchExpertReq({ payload }, { call, put }) {
      const response = yield call(fetchExpertReq, payload);
      const data = getResponse(response);
      if (data) {
        const fieldReqList = data.expertFieldReqs;
        if (fieldReqList) {
          const selectFieldReqs = [];
          fieldReqList.map((item) => {
            selectFieldReqs.push(`${item.fieldCode}#${item.fieldCodeMeaning}`);
            return selectFieldReqs;
          });
          const expertFieldReqs = fieldReqList.map((item) => {
            return {
              key: item.fieldCode,
              ...item,
            };
          });
          yield put({
            type: 'updateState',
            payload: {
              expertReqFormData: data.expertReq,
              fieldReqList: expertFieldReqs,
              achievementReqList: data.expertAchvReqs,
              careerPortfolioReqList: data.expertCareerReqs,
              educationExperienceReqList: data.expertEducationReqs,
              bankInfoReqList: data.expertBankReqs,
              enclosureReqList: data.expertAttachmentReqs,
              selectFieldReqs,
            },
          });
        }
        return data;
      }
    },

    // 保存 - 专家注册申请
    *requisitionSave({ payload }, { call }) {
      const data = getResponse(yield call(requisitionSave, payload));
      return data;
    },

    // 保存 - 专家注册申请
    *requisitionSubmit({ payload }, { call }) {
      const data = getResponse(yield call(requisitionSubmit, payload));
      return data;
    },

    // 删除 - 专家注册申请
    *requisitionDelete({ payload }, { call }) {
      const data = getResponse(yield call(requisitionDelete, payload));
      return data;
    },

    // 取消 - 专家注册申请
    *requisitionCancel({ payload }, { call }) {
      const data = getResponse(yield call(requisitionCancel, payload));
      return data;
    },

    // 删除 - 专家注册申请table
    *tableDelete({ payload }, { call }) {
      const data = getResponse(yield call(tableDelete, payload));
      return data;
    },

    // 查询专家注册申请审批
    *queryApprove({ payload }, { call, put }) {
      const response = yield call(queryApprove, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { approveList: data, approvePagination: createPagination(data) },
        });
      }
    },

    // 查询专家信息维护(管理员)
    *queryMaintenace({ payload }, { call, put }) {
      const response = yield call(queryMaintenace, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { maintenaceList: data, maintenacePagination: createPagination(data) },
        });
      }
    },

    // 查询专家信息汇总数据
    *queryAll({ payload }, { call, put }) {
      const response = yield call(queryAll, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { queryList: data, queryPagination: createPagination(data) },
        });
      }
    },

    // 查询专家注册申请查询
    *queryReqQuery({ payload }, { call, put }) {
      const response = yield call(queryReqQuery, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { reqQueryList: data, reqQueryPagination: createPagination(data) },
        });
      }
    },

    // 查询专家注册申请
    *queryRequisition({ payload }, { call, put }) {
      const response = yield call(queryRequisition, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { requisitionList: data, requisitionPagination: createPagination(data) },
        });
      }
    },

    // 专家注册申请头提交
    *submitRequisition({ payload }, { call }) {
      const response = yield call(submitRequisition, payload);
      return getResponse(response);
    },

    // 查询专家领域树结构
    *queryTransfer({ payload }, { call, put }) {
      const response = yield call(queryTransfer, payload);
      const data = getResponse(response);
      if (data) {
        const field = [];
        data.map((item) => {
          field.push({
            key: `${item.value}#${item.meaning}`,
            meaning: item.meaning,
          });
          return field;
        });
        yield put({
          type: 'updateState',
          payload: { allField: field },
        });
      }
    },

    // 操作记录
    *queryRecordList({ payload }, { call, put }) {
      const response = yield call(queryRecordList, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            operationRecordList: data,
            operationRecordPagination: createPagination(data),
          },
        });
      }
    },

    // 查询 - 专家信息维护明细(个人)
    *fetchDetailPersonal({ payload }, { call, put }) {
      const response = yield call(fetchDetailPersonal, payload);
      const data = getResponse(response);
      if (data) {
        const fieldList = data.expertFields;
        if (fieldList) {
          const selectFields = [];
          fieldList.map((item) => {
            selectFields.push(`${item.fieldCode}#${item.fieldCodeMeaning}`);
            return selectFields;
          });
          const expertFields = fieldList.map((item) => {
            return {
              key: item.fieldCode,
              ...item,
            };
          });
          yield put({
            type: 'updateState',
            payload: {
              expertFormData: data.expert,
              fieldList: expertFields,
              achievementList: data.expertAchievements,
              careerPortfolioList: data.expertCareers,
              educationExperienceList: data.expertEducations,
              bankInfoList: data.expertBanks,
              enclosureList: data.expertAttachments,
              selectFields,
            },
          });
        }
      }
    },

    // 保存 - 专家信息维护明细(个人)
    *saveDetailPersonal({ payload }, { call }) {
      const data = getResponse(yield call(saveDetailPersonal, payload));
      return data;
    },

    // 保存 - 专家信息维护明细(管理员)
    *saveDetailAdmin({ payload }, { call }) {
      const data = getResponse(yield call(saveDetailAdmin, payload));
      return data;
    },

    // 通过 - 专家注册申请审批
    *approveExpert({ payload }, { call }) {
      const data = getResponse(yield call(approveExpert, payload));
      return data;
    },

    // 拒绝 - 专家注册申请审批
    *rejectExpert({ payload }, { call }) {
      const data = getResponse(yield call(rejectExpert, payload));
      return data;
    },

    // 查询 - 专家信息维护明细(管理员)
    *fetchDetailAdmin({ payload }, { call, put }) {
      const response = yield call(fetchDetailAdmin, payload);
      const data = getResponse(response);
      if (data) {
        const fieldList = data.expertFields;
        if (fieldList) {
          const selectFields = [];
          fieldList.map((item) => {
            selectFields.push(`${item.fieldCode}#${item.fieldCodeMeaning}`);
            return selectFields;
          });
          const expertFields = fieldList.map((item) => {
            return {
              key: item.fieldCode,
              ...item,
            };
          });
          yield put({
            type: 'updateState',
            payload: {
              expertFormData: data.expert,
              fieldList: expertFields,
              achievementList: data.expertAchievements,
              careerPortfolioList: data.expertCareers,
              educationExperienceList: data.expertEducations,
              bankInfoList: data.expertBanks,
              enclosureList: data.expertAttachments,
              selectFields,
            },
          });
        }
      }
    },

    // 查询uuid
    *queryUUID({ payload }, { call }) {
      const data = yield call(queryUUID, payload);
      return getResponse(data);
    },
  },
  reducers: {
    updateState(state, { payload }) {
      const {
        expertReqFormData: { expertReqId } = {},
        expertFormData: { expertId } = {},
      } = payload;
      let idMap = {};
      if (expertReqId) {
        idMap = {
          [expertReqId]: {
            expertReqFormData: {},
            fieldReqList: [],
            selectFieldReqs: [],
            achievementReqList: [],
            careerPortfolioReqList: [],
            educationExperienceReqList: [],
            enclosureReqList: [],
            ...state[expertReqId],
            ...payload,
          },
        };
      } else if (expertId) {
        idMap = {
          [expertId]: {
            expertFormData: {},
            fieldList: [],
            selectFields: [],
            achievementList: [],
            careerPortfolioList: [],
            educationExperienceList: [],
            bankInfoList: [],
            enclosureList: [],
            ...state[expertId],
            ...payload,
          },
          person: {
            expertFormData: {},
            fieldList: [],
            achievementList: [],
            careerPortfolioList: [],
            educationExperienceList: [],
            bankInfoList: [],
            enclosureList: [],
            ...state[expertId],
            ...payload,
          },
        };
      }
      return {
        ...state,
        ...payload,
        ...idMap,
      };
    },
  },
});

export default getModel;
