/**
 * quotePurchaseRequisition - 引用采购申请
 * @date: 2019-2-19
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.01
 * @copyright: Copyright 2019, Hand
 */
import { isEmpty } from 'lodash';
import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  queryLineQuotation,
  priceList,
  linePriceList,
  fetchWholeQuoteList,
  wholeQuoteCreate,
  addDetailLines,
  deleteDetailLines,
  queryDetailCreateList,
  queryDetailHeader,
  queryDetailList,
  newSave,
  check,
  saveWarn,
  saveDetail,
  newSaveDetail,
  submitDetail,
  submitValidate,
  deleteSheetDelivery,
  deleteLineDelivery,
  lineCreate,
  fetchDetailTable,
  getLineAttachmentUuid,
  saveAttachmentUUID,
  appendValidate,
  deleteLineRemote,
  queryCompanyId,
  fetchSettings,
  fetchPageOrder,
  fetchNewPriceLibEnable,
  fetchItemNewPriceLibEnable,
  fetchNewPriceLibData,
  saveLibData,
  fetchPriceUpdateList,
  priceUpdate,
  fetchList,
  createOrder,
  createCombineOrder,
  showLadderInquiry,
  queryPoItemBOM,
  newQueryPoItemBOM,
  savePoItemBOM,
  deletePoItemBOM,
  clearPoItemBOM,
  validataOrg,
  fetchDefaultValueView,
  createUuid,
  pendingFlag,
  batchSubmitWarn,
  pendingCancelFlag,
  addNewSubmitDetail,
  checkInvOrganization,
  oldBudgetVerification,
  queryDoubleUomConfig,
  calculateDoubleUom,
  fetchAutoGetCompany,
  fetchAutoGetAgent,
} from '@/services/quotePurchaseRequisitionService';

const tenantId = getCurrentOrganizationId();
export default {
  namespace: 'quotePurchaseRequisition',

  state: {
    orderSource: [], // 单据来源下拉列表数据
    lineQuotationData: [], // 按行引用页面行数据源
    linePagination: {}, // 按行引用分页
    enumMap: {}, // 值集
    wholeDataSource: [], // 整单引用列表
    lastActiveTabKey: 'lineQuotation',
    wholeOrderQuery: {}, // 整单引用查询条件
    collapse: true, // 是否收起查询
    requisitionLovCache: {}, // 值集变化缓存
  },

  effects: {
    // 查询列表值集
    *fetchEnum(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          purchaseLineType: 'SODR.PO_LINE_TYPE',
          status: 'SPRM.PR_STATUS',
          source: 'SPRM.SRC_PLATFORM',
          flag: 'HPFM.FLAG',
          resultStatus: 'SSRC.SOURCE_RESULT_STATUS',
          batchMaintain: 'SPUC.ORDER_BATCH_MAINTENANCE',
          internationalTelCode: 'HPFM.IDD',
          excessOrderType: 'SMDM.ALLOW_EXCESS_ORDER_TYPE',
          tenantId,
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
    // 查询整单引用列表
    *fetchWholeQuoteList({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchWholeQuoteList, payload));
      const { page = {} } = payload;
      const { pageSize = 10 } = page;
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            wholeOrderQuery: payload,
            wholeDataSource: res.content,
            wholePagination: { ...createPagination(res), pageSize },
          },
        });
      }
      return res;
    },
    // 查询整单引用列表
    *fetchWholeQuoteListPage({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchWholeQuoteList, { ...payload, onlyCountFlag: 'Y' }));
      const { page = {} } = payload;
      const { pageSize = 10 } = page;
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            wholePagination: { ...createPagination(res), pageSize },
          },
        });
      }
      return res;
    },
    // 整单引用创建
    *wholeQuoteCreate({ payload }, { call }) {
      const res = getResponse(yield call(wholeQuoteCreate, payload));
      return res;
    },
    *priceList({ payload }, { call }) {
      const result = getResponse(yield call(priceList, payload));
      return result;
    },
    *linePriceList({ payload }, { call }) {
      const result = getResponse(yield call(linePriceList, payload));
      return result;
    },
    // 获取明细行附件uuid
    *getLineAttachmentUuid({ data }, { call }) {
      const res = yield call(getLineAttachmentUuid, data);
      return getResponse(res);
    },
    // 按行引用查询
    *fetchLineQuotation({ payload }, { call, put }) {
      const res = getResponse(yield call(queryLineQuotation, payload));
      const { page = {} } = payload;
      const { pageSize = 10 } = page;
      if (res) {
        const { needCountFlag } = res;
        yield put({
          type: 'updateState',
          payload:
            needCountFlag === 'Y'
              ? { lineQuotationData: res.content.map((item) => ({ ...item, _status: 'update' })) }
              : {
                  lineQuotationData: res.content.map((item) => ({ ...item, _status: 'update' })),
                  linePagination: { ...createPagination(res), pageSize },
                },
        });
        if (needCountFlag === 'Y') {
          yield put({
            type: 'fetchLineQuotationPage',
            payload: {
              ...payload,
              onlyCountFlag: 'Y',
            },
          });
        }
      }
      return res;
    },
    // 按行引用查询异步count
    *fetchLineQuotationPage({ payload }, { call, put }) {
      const res = getResponse(yield call(queryLineQuotation, payload));
      const { page = {} } = payload;
      const { pageSize = 10 } = page;
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            linePagination: { ...createPagination(res), pageSize },
          },
        });
      }
      return res;
    },
    // 查询明细可创建行
    *queryDetailCreateList({ poHeaderId, params }, { call }) {
      const res = yield call(queryDetailCreateList, poHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    // 添加明细行
    *addDetailLines({ poHeaderId, data }, { call }) {
      const res = yield call(addDetailLines, poHeaderId, data);
      return getResponse(res);
    },
    // 删除/作废明细行
    *deleteDetailLines({ asnHeaderId, data }, { call }) {
      const res = yield call(deleteDetailLines, asnHeaderId, data);
      return isEmpty(getResponse(res)) && !res.failed;
    },

    // 订单维护---删除
    *deleteLineRemote({ data }, { call }) {
      const res = yield call(deleteLineRemote, data);
      return getResponse(res);
    },
    // 查询采购订单头
    *queryDetailHeader({ payload }, { call }) {
      const res = yield call(queryDetailHeader, payload);
      return getResponse(res);
    },
    // 查询采购订单行
    *queryDetailList({ payload }, { call }) {
      const res = yield call(queryDetailList, payload);
      return getResponse(res);
    },
    // 保存弱校验
    *saveWarn({ payload }, { call }) {
      const res = yield call(saveWarn, payload);
      return getResponse(res);
    }, // 保存明细 -- 新建
    // 保存明细 -- 更新
    *add({ payload }, { call }) {
      const res = yield call(saveDetail, payload);
      return getResponse(res);
    }, // 保存明细 -- 新建
    *newAdd({ payload }, { call }) {
      const res = yield call(newSaveDetail, payload);
      return getResponse(res);
    },
    // 保存明细 -- 更新
    *newSave({ payload }, { call }) {
      const res = yield call(newSave, payload);
      return getResponse(res);
    },

    // 提交明细
    *submitDetail({ payload }, { call }) {
      const res = yield call(submitDetail, payload);
      return getResponse(res);
    },
    // 提交时校验
    *submitValidate({ payload }, { call }) {
      const res = yield call(submitValidate, payload);
      return getResponse(res);
    },
    // 整单引用删除
    *deleteSheetDelivery({ payload }, { call }) {
      const res = yield call(deleteSheetDelivery, [payload]);
      return getResponse(res);
    },
    // 按行引用删除
    *deleteLineDelivery({ lines }, { call }) {
      const res = yield call(deleteLineDelivery, lines);
      return getResponse(res);
    },
    // 按行引用创建
    *create({ payload }, { call }) {
      const res = getResponse(yield call(lineCreate, payload));
      return res;
    },
    // 保存与附件关联的附件uuid
    *saveAttachmentUUID({ payload }, { call }) {
      const res = yield call(saveAttachmentUUID, payload);
      return getResponse(res);
    },
    // 校验新增数据正确性
    *appendValidate({ payload }, { call }) {
      const res = yield call(appendValidate, payload);
      return getResponse(res);
    },
    // 查询配置中心,公司是否可以再编辑
    *queryCompanyId({ payload }, { call }) {
      const res = yield call(queryCompanyId, payload);
      return getResponse(res);
    },
    // 查询配置中心
    *fetchSettings({ payload }, { call }) {
      const res = yield call(fetchSettings, payload);
      return getResponse(res);
    },
    // 查询手工创建订单初始化数据
    *fetchPageOrder({ payload }, { call }) {
      const res = getResponse(yield call(fetchPageOrder, payload));
      return res;
    },
    // 查询是否引用新价格库
    *fetchNewPriceLibEnable({ payload }, { call }) {
      const res = getResponse(yield call(fetchNewPriceLibEnable, payload));
      return res;
    },
    // 查询是否通过物料引用新价格库
    *fetchItemNewPriceLibEnable({ payload }, { call }) {
      const res = getResponse(yield call(fetchItemNewPriceLibEnable, payload));
      return res;
    },
    // 查询新价格库
    *fetchNewPriceLibData({ payload }, { call }) {
      const res = getResponse(yield call(fetchNewPriceLibData, payload));
      return res;
    },
    // 查询Table页
    *fetchDetailTable({ payload }, { call }) {
      const res = getResponse(yield call(fetchDetailTable, payload));
      return res;
    },
    // 查询Table页
    *check({ payload }, { call }) {
      const res = getResponse(yield call(check, payload));
      return res;
    },
    // 查询订单可更新价格库的行信息
    *fetchPriceUpdateList({ payload }, { call }) {
      const res = getResponse(yield call(fetchPriceUpdateList, payload));
      return res;
    },
    // 根据价格库更新当前订单所有行的价格
    *priceUpdate({ payload }, { call }) {
      const res = getResponse(yield call(priceUpdate, payload));
      return res;
    },
    *fetchList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            searchForTheSourceQuery: payload,
            searchForTheSourceList: result.content,
            searchForTheSourcePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    *fetchListPage({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchList, { ...payload, onlyCountFlag: 'Y' }));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            searchForTheSourcePagination: createPagination(result),
          },
        });
      }
      return result;
    },

    *createOrder({ payload }, { call }) {
      const result = getResponse(yield call(createOrder, payload));
      return result;
    },
    *createCombineOrder({ payload }, { call }) {
      const result = getResponse(yield call(createCombineOrder, payload));
      return result;
    },

    // 批量查询值级
    *fetchLovCode(_, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          templates: 'SODR.PO_PRINT_TYPE',
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
    // 批量查询值级
    *showLadderInquiry({ payload }, { call }) {
      const result = getResponse(yield call(showLadderInquiry, payload));
      return result;
    },
    // BOM查询
    *queryPoItemBOM({ payload }, { call }) {
      const res = yield call(queryPoItemBOM, payload);
      const response = getResponse(res);
      return response;
    },
    // 新BOM查询
    *newQueryPoItemBOM({ payload }, { call }) {
      const res = yield call(newQueryPoItemBOM, payload);
      const response = getResponse(res);
      return response;
    },
    // BOM保存
    *savePoItemBOM({ payload }, { call }) {
      const res = yield call(savePoItemBOM, payload);
      const response = getResponse(res);
      return response;
    },

    // BOM删除
    *deletePoItemBOM({ payload }, { call }) {
      const res = yield call(deletePoItemBOM, payload);
      const response = getResponse(res);
      return response;
    },
    // BOM清空
    *clearPoItemBOM({ payload }, { call }) {
      const res = yield call(clearPoItemBOM, payload);
      const response = getResponse(res);
      return response;
    },
    // 校验清空逻辑
    *validataOrg({ payload }, { call }) {
      const res = yield call(validataOrg, payload);
      const response = getResponse(res);
      return response;
    },

    // 查询默认值集视图
    *fetchDefaultValueView({ payload }, { call }) {
      const res = yield call(fetchDefaultValueView, payload);
      const response = getResponse(res);
      return response;
    },

    // 新增LOV成功选择物料触发
    *saveLibData({ payload }, { call }) {
      const res = getResponse(yield call(saveLibData, payload));
      return res;
    },
    // 创建uuid
    *createUuid({ payload }, { call }) {
      const res = getResponse(yield call(createUuid, payload));
      return res;
    },
    // 暂挂按钮
    *pendingFlag({ payload }, { call }) {
      const res = getResponse(yield call(pendingFlag, payload));
      return res;
    },
    // 取消暂挂按钮
    *pendingCancelFlag({ payload }, { call }) {
      const res = getResponse(yield call(pendingCancelFlag, payload));
      return res;
    },
    // 提交明细添加新接口
    *addNewSubmitDetail({ payload }, { call }) {
      const res = getResponse(yield call(addNewSubmitDetail, payload));
      return res;
    },
    // 列表批量提交新增弱校验
    *batchSubmitWarn({ payload }, { call }) {
      const res = getResponse(yield call(batchSubmitWarn, payload));
      return res;
    },
    // 校验物料&库存组织关联关系
    *checkInvOrganization({ payload }, { call }) {
      let res;
      const response = yield call(checkInvOrganization, payload);
      try {
        res = getResponse(JSON.parse(response));
      } catch {
        res = response;
      }
      return res;
    },
    // 订单提交预算校验
    *oldBudgetVerification({ payload }, { call }) {
      const res = getResponse(yield call(oldBudgetVerification, payload));
      return res;
    },
    // 订单提交预算校验
    *queryDoubleUomConfig({ payload }, { call }) {
      const res = getResponse(yield call(queryDoubleUomConfig, payload));
      return res;
    },
    // 获取公司下唯一值
    *fetchAutoGetCompany({ payload }, { call }) {
      const res = getResponse(yield call(fetchAutoGetCompany, payload));
      return res;
    },
    // 获取采购组织/采购员
    *fetchAutoGetAgent({ payload }, { call }) {
      const res = getResponse(yield call(fetchAutoGetAgent, payload));
      return res;
    },
    // 双单位换算公式
    *calculateDoubleUom({ payload }, { call }) {
      const res = getResponse(yield call(calculateDoubleUom, payload));
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
