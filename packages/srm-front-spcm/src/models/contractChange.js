/*
 * contractMaintain - 协议拟制model
 * @date: 2019-05-15
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  add,
  update,
  submit,
  cancel,
  queryList,
  deleteHeader,
  changeContract,
  changeContractStatus,
  pcSubjectLinesDelete,
  partnerLinesDelete,
  fetchDetailHeader,
  fetchPartner,
  fetchOperationRecordList,
  bindHeaderAttachmentUuid,
  bindLineAttachmentUuid,
  fetchCategory,
  fetchOperationRecord,
  fetchSubject,
  fetchTerm,
  fetchPcPartnerTypes,
  updateContractTextUrl,
  fetchExtended,
  fetchStageOptions,
  pcStageLinesDelete,
  invalidApproval,
  saveSubject,
} from '@/services/contractChangeService';

export default {
  namespace: 'contractChange',
  state: {
    dataSource: [], // 列表数据
    pagination: {}, // 分页参数
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
  },

  effects: {
    // -查询列表
    *queryList({ payload }, { call, put, select }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        const loading = yield select((state) => state.loading);
        loading.effects['contractChange/queryList'] = false;
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content,
            pagination: createPagination(response),
            paginationLoading: response?.needCountFlag === 'Y',
          },
        });
      }
      // 异步获取 totalElements
      if (response?.needCountFlag === 'Y') {
        const resForCount = yield call(queryList, { ...payload, onlyCountFlag: 'Y' });
        const pageCount = getResponse(resForCount);
        yield put({
          type: 'updateState',
          payload: {
            paginationLoading: false,
            pagination: createPagination(pageCount),
          },
        });
      }
    },
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          status: 'SPCM.CONTRACT.KIND',
          // source: 'SPRM.SRC_PLATFORM',
          flag: 'SPCM.CONTRACT.STATUS',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },

    // 修改合同状态
    *changeContractStatus({ payload }, { call }) {
      const response = getResponse(yield call(changeContractStatus, payload));
      return response;
    },

    // 作废
    *invalidApproval({ payload }, { call }) {
      const response = getResponse(yield call(invalidApproval, payload));
      return response;
    },

    // -查询详情值集
    *fetchDetailEnum(params, { put, call }) {
      const detailEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          kinds: 'SPCM.CONTRACT.KIND',
          partnerTypes: 'SPCM.PC_PARTNER_TYPE',
          contractPurposeList: 'SPCM.CONTRACT_PURPOSE',
          acceptTypeList: 'SPCM.ACCEPT_TYPE',
          propertiesList: 'SPUC.PR_LINE_ITEM_PROPERTIE',
        })
      );
      if (detailEnumMap) {
        yield put({
          type: 'updateState',
          payload: {
            detailEnumMap,
          },
        });
      }
    },

    // -查询合作伙伴值集
    *fetchPcPartnerTypes({ payload }, { put, call, select }) {
      const { detailEnumMap } = yield select((state) => state.contractChange);
      const result = getResponse(yield call(fetchPcPartnerTypes, payload));
      // 查询协议阶段值集
      const stageOptions = getResponse(yield call(fetchStageOptions, payload));
      if (result && stageOptions) {
        yield put({
          type: 'updateState',
          payload: {
            detailEnumMap: {
              ...detailEnumMap,
              partnerTypes: (result && result.filter((i) => i.enabledFlag)) || [],
              stageOptions: stageOptions.content || [],
            },
          },
        });
      }
    },

    // -新建采购申请头
    *add({ payload }, { call }) {
      const response = getResponse(yield call(add, payload));
      return response;
    },
    // -更新采购申请头
    *update({ payload }, { call }) {
      const response = getResponse(yield call(update, payload));
      return response;
    },
    // -更新采购申请头
    *changeContract({ payload }, { call }) {
      const response = getResponse(yield call(changeContract, payload));
      return response;
    },
    // -更新头上协议文本url
    *updateContractTextUrl({ payload }, { call }) {
      const response = getResponse(yield call(updateContractTextUrl, payload));
      return response;
    },

    // -提交采购协议
    *submit({ payload }, { call }) {
      const response = getResponse(yield call(submit, payload));
      return response;
    },
    // -删除采购申请
    *delete({ payload }, { call }) {
      const response = getResponse(yield call(deleteHeader, payload));
      return response;
    },

    // 取消采购申请
    *cancel({ payload }, { call }) {
      const response = getResponse(yield call(cancel, payload.prHeaderDTOs));
      return response;
    },
    // 查询明细头
    *fetchDetailHeader({ pcHeaderId }, { call }) {
      const response = yield call(fetchDetailHeader, pcHeaderId);
      return getResponse(response);
    },
    // 查询合作伙伴列表
    *fetchPartner({ payload }, { call }) {
      const res = yield call(fetchPartner, payload);
      return getResponse(res);
    },
    // 查询标的信息列表
    *fetchSubject({ payload }, { call }) {
      const res = yield call(fetchSubject, payload);
      return getResponse(res);
    },
    // 查询标的信息列表
    *fetchTerm({ payload }, { call }) {
      const res = yield call(fetchTerm, payload);
      return getResponse(res);
    },
    // -删除标的信息
    *pcSubjectLinesDelete({ payload }, { call }) {
      const res = yield call(pcSubjectLinesDelete, payload);
      return getResponse(res);
    },
    // -删除合作伙伴
    *partnerLinesDelete({ payload }, { call }) {
      const res = yield call(partnerLinesDelete, payload);
      return getResponse(res);
    },
    // 获取操作记录列表数据
    *fetchOperationRecordList({ payload }, { call }) {
      const result = getResponse(yield call(fetchOperationRecordList, payload));
      return result;
    },
    // 绑定头附件id
    *bindHeaderAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindHeaderAttachmentUuid, payload));
      return result;
    },
    // 绑定行附件id
    *bindLineAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindLineAttachmentUuid, payload));
      return result;
    },
    // -查询品类定义
    *fetchCategory({ payload }, { call }) {
      const res = getResponse(yield call(fetchCategory, payload));
      return res;
    },
    // 查询操作记录
    *fetchOperationRecord({ payload }, { call }) {
      const res = getResponse(yield call(fetchOperationRecord, payload));
      return res;
    },
    // 查询公司扩展信息
    *fetchExtended({ payload }, { call }) {
      const res = getResponse(yield call(fetchExtended, payload));
      return res;
    },
    // 删除阶段信息
    *pcStageLinesDelete({ payload }, { call }) {
      const res = yield call(pcStageLinesDelete, payload);
      return getResponse(res);
    },

    // 保存协议标的
    *saveSubject({ payload }, { call }) {
      const res = getResponse(yield call(saveSubject, payload));
      return res;
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
