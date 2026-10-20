/*
 * contractMaintain - 协议拟制model
 * @date: 2019-05-15
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  add,
  update,
  submit,
  cancel,
  queryList,
  deleteHeader,
  pcSubjectLinesDelete,
  pcStageLinesDelete,
  partnerLinesDelete,
  termLinesDelete,
  pcRebateLinesDelete,
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
  fetchDefaultStage,
  setting,
  fetchSourceList,
  sourceCreate,
  fetchLadderOffer,
  fetchSubjectCreateList,
  fetchSubjectQuoteList,
  appendValidate,
  queryCopyList,
  saveSubject,
  copyContract,
  fetchPurchaseOrder,
  checkCreatePo,
  fetchPurAgent,
  fetchTemplateRefresh,
  verified,
} from '@/services/contractMaintainService';

export default {
  namespace: 'contractMaintain',

  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    detailEnumMapStage: {}, // 阶段名称
    dataSource: [], // 列表数据
    pagination: {},
    setting: {},
    quoteSourceList: [],
    sourceResultDTOs: [],
    sourceRslQueryParams: {}, // 引用寻源结果当前查询条件（整单转协议用）
    quoteSourcePagination: {},
    copyModalDataSource: [], // 协议复制单据数据
    copyModalPagination: {}, // 协议复制单据分页
    copyEnumMap: {}, // 协议复制值集
    purchaseOrderList: [], // 采购订单列表
    purchaseOrderPagination: {}, // 采购订单分页
    code: {}, // 采购订单值集
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          flag: 'SPCM.CONTRACT.STATUS',
          status: 'SPCM.CONTRACT.KIND',
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

    // -配置中心
    *setting({ payload }, { put, call }) {
      const result = getResponse(yield call(setting, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            setting: result[0],
          },
        });
      }
    },

    // 校验新增标的数据正确性
    *appendValidate({ payload }, { call }) {
      const res = yield call(appendValidate, payload);
      return getResponse(res);
    },

    // -查询合作伙伴值集
    *fetchPcPartnerTypes({ payload }, { put, call, select }) {
      const { detailEnumMap } = yield select((state) => state.contractMaintain);
      const result = getResponse(yield call(fetchPcPartnerTypes, payload));
      // 查询协议阶段值集
      const stageOptions = getResponse(yield call(fetchStageOptions, payload));
      if (result) {
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

    // -查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content,
            pagination: createPagination(response),
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
    // 删除阶段信息
    *pcStageLinesDelete({ payload }, { call }) {
      const res = yield call(pcStageLinesDelete, payload);
      return getResponse(res);
    },
    // -删除合作伙伴
    *partnerLinesDelete({ payload }, { call }) {
      const res = yield call(partnerLinesDelete, payload);
      return getResponse(res);
    },
    // 删除业务条款
    *termLinesDelete({ payload }, { call }) {
      const res = yield call(termLinesDelete, payload);
      return getResponse(res);
    },
    // -删除返利信息行
    *pcRebateLinesDelete({ payload }, { call }) {
      const res = yield call(pcRebateLinesDelete, payload);
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
    // 查询公司扩展信息
    *fetchSourceList({ payload }, { call, put, select }) {
      const res = getResponse(yield call(fetchSourceList, payload));
      if (res) {
        const loading = yield select((state) => state.loading);
        loading.effects['contractMaintain/fetchSourceList'] = false;
        yield put({
          type: 'updateState',
          payload: {
            quoteSourceList: res.content,
            quoteSourcePagination: createPagination(res),
            quoteSourcePaginationLoading: res?.needCountFlag === 'Y',
          },
        });
      }
      // 异步获取 totalElements
      if (res?.needCountFlag === 'Y') {
        const resForCount = yield call(fetchSourceList, { ...payload, onlyCountFlag: 'Y' });
        const pageCount = getResponse(resForCount);
        yield put({
          type: 'updateState',
          payload: {
            quoteSourcePaginationLoading: false,
            quoteSourcePagination: createPagination(pageCount),
          },
        });
      }
    },

    // 检验是否可创建
    *sourceCreate({ payload }, { call }) {
      const res = getResponse(yield call(sourceCreate, payload));
      return res;
    },

    // 查询阶梯报价
    *fetchLadderOffer({ payload }, { call }) {
      const res = getResponse(yield call(fetchLadderOffer, payload));
      return res;
    },

    *saveSubject({ payload }, { call }) {
      const res = getResponse(yield call(saveSubject, payload));
      return res;
    },

    // 查询新建标的模态框列表
    *querySubjectCreateList({ pcHeaderId, params }, { call }) {
      const res = yield call(fetchSubjectCreateList, pcHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },

    // 查询寻源-标的模态框列表
    *querySubjectQuoteList({ pcHeaderId, params }, { call }) {
      const res = yield call(fetchSubjectQuoteList, pcHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },

    // 复制协议值集获取
    *getCopyBatchCode(params, { put, call }) {
      const copyEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          status: 'SPCM.CONTRACT.KIND',
          source: 'SPRM.SRC_PLATFORM',
          flag: 'SPCM.CONTRACT.STATUS',
        })
      );
      if (copyEnumMap) {
        yield put({
          type: 'updateState',
          payload: {
            copyEnumMap,
          },
        });
      }
    },
    // 查询复制协议列表
    *queryCopyList({ payload }, { call, put }) {
      const { page, ...otherParams } = payload;
      const response = getResponse(yield call(queryCopyList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            copyModalDataSource:
              response.content &&
              response.content.map((n) => ({
                ...n,
                _status: 'update',
              })),
            copyModalPagination: createPagination(response),
          },
        });
      }
    },

    // 复制协议
    *copyContract({ payload }, { call }) {
      const response = getResponse(yield call(copyContract, payload));
      return response;
    },

    // 查询采购订单
    *fetchPurchaseOrder({ payload }, { put, call, select }) {
      const result = getResponse(yield call(fetchPurchaseOrder, payload));
      if (result) {
        const loading = yield select((state) => state.loading);
        loading.effects['contractMaintain/fetchPurchaseOrder'] = false;
        yield put({
          type: 'updateState',
          payload: {
            purchaseOrderList: result.content,
            purchaseOrderPagination: createPagination(result),
            purchaseOrderPaginationLoading: result?.needCountFlag === 'Y',
          },
        });
      }
      // 异步获取 totalElements
      if (result?.needCountFlag === 'Y') {
        const resForCount = yield call(fetchPurchaseOrder, { ...payload, onlyCountFlag: 'Y' });
        const pageCount = getResponse(resForCount);
        yield put({
          type: 'updateState',
          payload: {
            purchaseOrderPaginationLoading: false,
            purchaseOrderPagination: createPagination(pageCount),
          },
        });
      }
    },
    // 查询采购订单值集
    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },
    // 校验是否可以引用订单创建
    *checkCreatePo({ payload }, { call }) {
      const response = getResponse(yield call(checkCreatePo, payload));
      return response;
    },
    // 查询采购员（根据当前登录用户查询）
    *fetchPurAgent({ payload }, { call }) {
      const response = getResponse(yield call(fetchPurAgent, payload));
      return response;
    },
    // 获取阶段信息
    *fetchDefaultStage({ payload }, { call, put, select }) {
      // 查询协议阶段默认值列表
      const { detailEnumMapStage } = yield select((state) => state.contractMaintain);
      const res = getResponse(yield call(fetchDefaultStage, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            detailEnumMapStage: {
              ...detailEnumMapStage,
              stageOptions: res.content || [],
            },
          },
        });
      }
      return res;
    },
    // 引用协议模板刷新在线编辑中的模板文件内容
    *fetchTemplateRefresh({ payload }, { call }) {
      const response = getResponse(yield call(fetchTemplateRefresh, payload));
      return response;
    },
    // -验证采购申请
    *verified({ payload }, { call }) {
      return getResponse(yield call(verified, payload));
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
