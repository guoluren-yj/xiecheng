/**
 * model - 供应商信息变更对比
 * @date: 2021-04-07
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import { getResponse } from 'utils/utils';
import { head, last } from 'lodash';

import {
  fetchBasicInfo, // 基础信息
  fetchRegistInform, // 登记信息
  fetchBusinessInfo, // 业务信息
  fetchContactInfo, // 联系人信息
  fetchAddressInfo, // 地址信息
  fetchBankInfo, // 银行信息
  fetchInvoicefo, // 开票信息
  fetchAttachmentInfo, // 附件信息
  fetchSupplyCapacity, // 供货能力清单
  fetchSupplierClassify, // 供应商分类
  fetchPurHeadInfo, // 采购财务头部信息
  fetchPurchaseInfo, // 采购财务信息Table
  fetchDestination, // 地点层信息
  queryInvestigateConfig, // 查询调查表配置
  queryInvestigate, // 调查表对比查询
  fetchOtherInfo, // 其他信息
} from '@/services/supplierInformCompareService';

export default {
  namespace: 'supplierInformCompare',
  state: {},
  effects: {
    // 查询基础信息
    *fetchBasicInfo({ payload }, { call }) {
      const res = getResponse(yield call(fetchBasicInfo, payload));
      return res;
    },
    // 查询企业信息
    *fetchEnterpriseInform({ payload }, { call }) {
      const { customizeUnitCode, configNameList, ...other } = payload;
      const registInform = getResponse(yield call(fetchRegistInform, other));
      const businessInform = getResponse(yield call(fetchBusinessInfo, other));
      // 调查表有联系人页签时，无需查询
      let contactInform = [];
      if (!configNameList.includes('sslmInvestgContact')) {
        contactInform = getResponse(yield call(fetchContactInfo, other));
      }
      // 调查表有地址页签时，无需查询
      let addressInform = [];
      if (!configNameList.includes('sslmInvestgAddress')) {
        addressInform = getResponse(yield call(fetchAddressInfo, other));
      }
      // 调查表有银行页签时，无需查询
      let bankInform = [];
      if (!configNameList.includes('sslmInvestgBankAccount')) {
        bankInform = getResponse(yield call(fetchBankInfo, { ...other, desensitize: false }));
      }
      // 调查表有附件页签时，无需查询
      let attachmentInform = [];
      if (!configNameList.includes('sslmInvestgAttachment')) {
        attachmentInform = getResponse(yield call(fetchAttachmentInfo, other));
      }
      const invoiceInform = getResponse(
        yield call(fetchInvoicefo, { ...other, desensitize: false })
      );
      const otherResp = getResponse(yield call(fetchOtherInfo, payload));
      const otherInform = {};
      if (otherResp && Array.isArray(otherResp) && otherResp.length > 1) {
        const firstData = head(head(otherResp) || []) || {};
        const lastData = head(last(otherResp) || []) || {};
        otherInform.oldOtherInfo = firstData;
        otherInform.newOtherInfo = lastData;
      }
      return {
        registInform,
        businessInform,
        contactInform,
        addressInform,
        bankInform,
        invoiceInform,
        attachmentInform,
        otherInform,
      };
    },
    // 查询供应商信息
    *fetchSupplierInfo({ payload }, { call }) {
      const { customizeUnitCode, ...other } = payload;
      const supplyCapacityInform = getResponse(yield call(fetchSupplyCapacity, payload));
      const supplierClassify = getResponse(yield call(fetchSupplierClassify, other));
      const purHeadInfo = getResponse(yield call(fetchPurHeadInfo, other));
      const purchaseList = getResponse(yield call(fetchPurchaseInfo, other));
      const locationInform = getResponse(yield call(fetchDestination, other));
      return {
        supplyCapacityInform,
        supplierClassify,
        purHeadInfo,
        purchaseList,
        locationInform,
      };
    },
    // 查询调查表配置
    *queryInvestigateConfig({ payload }, { call }) {
      const response = getResponse(yield call(queryInvestigateConfig, payload));
      return response;
    },
    // 调查表对比查询
    *queryInvestigate({ payload }, { call }) {
      const res = getResponse(yield call(queryInvestigate, payload));
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
