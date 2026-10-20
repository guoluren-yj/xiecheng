/*
 * @Description: contractCommon - 协议公共model
 * @Author: HB <bin.huang02@hand-china.com>
 * @Date: 2019-05-15
 * @LastEditTime: 2024-03-13 19:48:31
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  queryFileListOrg,
  removeFileOrg,
  queryMapIdpValue,
  queryUnifyIdpValue,
} from 'services/api';
import {
  fetchOperationRecord,
  fetchHeader,
  fetchPartner,
  fetchSubject,
  fetchStage,
  fetchTerm,
  fetchTermPage,
  deleteFilesByUrl,
  fetchFilesByUrl,
  fetchPcAttachmentList,
  fetchLadderQuotation,
  updatePcAttachmentList,
  updateSupplierUuid,
  updatePurchaseUuid,
  updateContractTemplateUrl,
  fetchConfigSetting,
  fetchContractRebate,
  fetchCompany,
  fetchAddCompany,
  saveCompany,
  fetchAddPurchaseOrder,
  saveLadderQuotation,
  ladderQuoteLinesDelete,
  fetchApproveRecord,
  printFile,
  fetchTextComparison,
  queryViewCertificateDeposit,
  fetchExchangeRate,
  fetchVerifyPhoneNum,
  fetchPriceLibValidPrice,
  querySealType,
  fetchStageList,
  fetchPartnerList,
  fetchReplenish,
  fetchTableExtend,
  fetchLockPrintContract,
  fetchLockContractFile,
  printContractApproval,
  queryContactByCompany,
} from '@/services/contractCommonService';

export default {
  namespace: 'contractCommon',

  state: {
    operationRecordPagination: {},
    operationRecordList: [],
    configSetting: {},
    addPoList: [],
    addPoPagination: {},
    firstComparisonList: [],
    lastComparisonList: [],
    formChanged: false,
    stageList: [],
    partnerList: [],
    replenishList: [], // 补充协议列表
    replenishPagination: {}, // 补充协议分页
    detailEnumMap: [],
  },

  effects: {
    // 查询明细头
    *fetchHeader(payload, { call }) {
      const response = yield call(fetchHeader, payload);
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
    // 获取阶段信息
    *fetchStage({ payload }, { call }) {
      const res = yield call(fetchStage, payload);
      return getResponse(res);
    },
    // 获取返利信息
    *fetchContractRebate({ payload }, { call }) {
      const res = yield call(fetchContractRebate, payload);
      return getResponse(res);
    },
    // 查询业务条款列表
    *fetchTerm({ payload }, { call }) {
      const res = yield call(fetchTerm, payload);
      return getResponse(res);
    },
    // 分页查询业务条款列表
    *fetchTermPage({ payload }, { call }) {
      const res = yield call(fetchTermPage, payload);
      return getResponse(res);
    },

    // 查询阶梯报价
    *fetchLadderQuotation({ payload }, { call }) {
      const res = getResponse(yield call(fetchLadderQuotation, payload));
      return res;
    },
    // 查询操作记录
    *fetchOperationRecord({ payload }, { call }) {
      const res = getResponse(yield call(fetchOperationRecord, payload));
      return res;
    },
    // 查询url对应的文件
    *fetchFilesByUrl({ payload }, { call }) {
      const res = getResponse(yield call(fetchFilesByUrl, payload));
      return res;
    },
    // 删除url对应的文件
    *deleteFilesByUrl({ payload }, { call }) {
      const res = getResponse(yield call(deleteFilesByUrl, payload));
      return res;
    },
    // 查询协议头下面的配置附件列表
    *fetchPcAttachmentList({ payload }, { call }) {
      const res = getResponse(yield call(fetchPcAttachmentList, payload));
      return res;
    },
    // 更新协议头的附件信息
    *updatePcAttachmentList({ payload }, { call }) {
      const res = getResponse(yield call(updatePcAttachmentList, payload));
      return res;
    },
    // 查询uuid对应的附件列表
    *queryFileListOrg({ payload }, { call }) {
      const res = getResponse(yield call(queryFileListOrg, payload));
      return res;
    },
    // 更新供应商头uuid
    *updateSupplierUuid({ payload }, { call }) {
      const res = getResponse(yield call(updateSupplierUuid, payload));
      return res;
    },
    // 更新供应商头uuid
    *updatePurchaseUuid({ payload }, { call }) {
      const res = getResponse(yield call(updatePurchaseUuid, payload));
      return res;
    },
    // 删除uuid下面的url对应的附件
    *removeFileOrg({ payload }, { call }) {
      const res = getResponse(yield call(removeFileOrg, payload));
      return res;
    },
    // 更新协议模板的附件url
    *updateContractTemplateUrl({ payload }, { call }) {
      const res = getResponse(yield call(updateContractTemplateUrl, payload));
      return res;
    },

    // 查询配置中心配置
    *fetchConfigSetting({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchConfigSetting, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            configSetting: result,
          },
        });
        return result;
      }
    },
    // 查询关联公司列表
    *fetchCompany({ payload }, { call }) {
      const response = getResponse(yield call(fetchCompany, payload));
      return response;
    },
    // 查询关联公司列表
    *fetchAddCompany({ payload }, { call }) {
      const response = getResponse(yield call(fetchAddCompany, payload));
      return response;
    },
    // -新建保存公司
    *saveCompany({ payload }, { call }) {
      const response = getResponse(yield call(saveCompany, payload));
      return response;
    },
    // 查询新增标的行采购订单
    *fetchAddPurchaseOrder({ payload }, { put, call }) {
      const result = getResponse(yield call(fetchAddPurchaseOrder, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            addPoList: result.content,
            addPoPagination: createPagination(result),
          },
        });
      }
    },

    // 新增阶梯报价
    *saveLadderQuotation({ payload }, { call }) {
      const res = getResponse(yield call(saveLadderQuotation, payload));
      return res;
    },
    // 删除阶梯报价
    *ladderQuoteLinesDelete({ payload }, { call }) {
      const res = getResponse(yield call(ladderQuoteLinesDelete, payload));
      return res;
    },

    // 查询审批记录列表
    *fetchApproveRecord({ payload }, { call }) {
      const res = yield call(fetchApproveRecord, payload);
      return getResponse(res);
    },

    // 打印
    *printFile({ payload }, { call }) {
      const res = yield call(printFile, payload);
      return getResponse(res);
    },

    // 查询文本对比
    *fetchTextComparison({ payload }, { call, put }) {
      const { version } = payload;
      const response = getResponse(yield call(fetchTextComparison, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            [`${version}ComparisonList`]: response,
          },
        });
      }
    },
    // 查询协议阶段值集、合作伙伴值集
    *fetchStageAndPartnerList({ payload }, { call, put }) {
      // 协议阶段值集
      const stageResult = getResponse(yield call(fetchStageList, payload));
      // 合作伙伴值集
      const partnerList = getResponse(yield call(fetchPartnerList, payload));
      if (partnerList && stageResult) {
        yield put({
          type: 'updateState',
          payload: {
            stageList: stageResult.content,
            partnerList,
          },
        });
      }
    },
    // 查询补充协议
    *fetchReplenish({ payload }, { call }) {
      const result = getResponse(yield call(fetchReplenish, payload));
      return (
        result && {
          replenishList: result?.content,
          replenishPagination: createPagination(result),
        }
      );
    },

    // 查询自定义表数据
    *fetchTableExtend({ payload }, { call }) {
      const result = getResponse(yield call(fetchTableExtend, payload));
      return result
        ? {
            tableExtendList: result.content,
            tableExtendPagination: createPagination(result),
          }
        : null;
    },

    /**
     * 查询查看存证证明
     * @param payload
     * @param call
     * @returns {Generator<*, *, *>}
     */
    *queryViewCertificateDeposit({ payload }, { call }) {
      const responce = yield call(queryViewCertificateDeposit, payload);
      return responce;
    },

    // 当原币币种跟本币币种不一致时需要查实时汇率
    *fetchExRate({ payload }, { call }) {
      const response = getResponse(yield call(fetchExchangeRate, payload));
      return response;
    },

    // 查询实名认证手机号
    *fetchVerifyPhoneNum({ payload }, { call }) {
      const response = getResponse(yield call(fetchVerifyPhoneNum, payload));
      return response;
    },

    // 根据协议标的行编码自动获取价格库有效价格
    *fetchPriceLibValidPrice({ payload }, { call }) {
      const response = getResponse(yield call(fetchPriceLibValidPrice, payload));
      return response;
    },

    // 查询签署套餐类型（E签宝|法大大)
    *querySealType({ payload }, { call }) {
      const response = getResponse(yield call(querySealType, payload));
      return response;
    },

    // 获取打印链接
    *fetchLockPrintContract({ payload }, { call }) {
      const response = getResponse(yield call(fetchLockPrintContract, payload));
      return response;
    },
    // 获取契约锁合同附件
    *fetchLockContractFile({ payload }, { call }) {
      const response = getResponse(yield call(fetchLockContractFile, payload));
      return response;
    },
    // -查询审批节点值集
    *fetchApprovalNode(params, { put, call }) {
      const detailEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          approveSequenceCode: 'SPCM.PC_APPROVAL_RULES',
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
    // 合同报批表
    *printContractApproval({ payload }, { call }) {
      const res = yield call(printContractApproval, payload);
      return getResponse(res);
    },
    // 业务条款查询
    *fetchTermContentSelect({ payload }, { call }) {
      const response = getResponse(yield call(queryUnifyIdpValue, payload));
      return response;
    },
    // 批量查询业务条款内容下拉框的值
    *fetchBatchTermContentDefaultSelect({ payload }, { call }) {
      const response = getResponse(yield call(queryMapIdpValue, payload));
      return response;
    },
    // 根据公司id查询默认的联系人
    *fetchContactByCompany({ payload }, { call }) {
      const response = getResponse(yield call(queryContactByCompany, payload));
      return response;
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
