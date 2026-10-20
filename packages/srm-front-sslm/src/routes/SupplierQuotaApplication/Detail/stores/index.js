/*
 * @Date: 2024-01-02
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import intl from 'utils/intl';
import moment from 'moment';
import { cloneDeep } from 'lodash';
import { SRM_SSLM } from '_utils/config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 基础信息
const getBasicsDS = ({ quotaHeaderId, isEdit = false }) => ({
  primaryKey: 'quotaHeaderId',
  autoCreate: true,
  forceValidate: true,
  pageSize: 20,
  autoQuery: false,
  fields: [
    {
      name: 'quotaAgreementNum',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.agreementNo').d('配额协议号'),
    },
    {
      name: 'quotaAgreementDescription',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.agreementDesc').d('配额协议描述'),
    },
    {
      name: 'evalStatus',
      label: intl.get('hzero.common.status').d('状态'),
      lookupCode: 'SSLM.SUPPLIER_QUOTA_STATUS',
    },
    {
      name: 'createName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.founder').d('创建人'),
    },
    {
      name: 'unitId',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.department').d('创建人部门'),
      type: 'object',
      lovCode: 'SPRM.USER_DEPARTMENT',
      dynamicProps: {
        lovPara: () => ({ tenantId: organizationId }),
        disabled: ({ record }) => {
          const { evalStatus } = record.get(['evalStatus']) || {};
          return evalStatus === undefined;
        },
      },
      transformRequest: value => value && value.unitId,
      transformResponse: (value, data) => {
        const { unitId, unitCode, unitName } = data;
        return { unitId, unitCode, unitName };
      },
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.creationTime').d('创建时间'),
    },
    {
      name: 'companyId',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.company').d('公司'),
      type: 'object',
      lovCode: 'SPCM.USER_AUTH.COMPANY',
      lovPara: { tenantId: organizationId },
      transformRequest: value => value && value.companyId,
      transformResponse: (value, data) => {
        const { companyId, companyNum, companyName } = data;
        return { companyId, companyNum, companyName };
      },
    },
    {
      name: 'ouId',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.businessEntity').d('业务实体'),
      type: 'object',
      lovCode: 'HPFM.OU',
      dynamicProps: {
        lovPara: ({ record }) => {
          const company = record.get('companyId');
          return {
            tenantId: organizationId,
            companyId: company?.companyId,
          };
        },
      },
      transformRequest: value => value && value.ouId,
      transformResponse: (value, data) => {
        const { ouId, ouCode, ouName } = data;
        return value ? { ouId, ouCode, ouName } : null;
      },
    },
    {
      name: 'versionNum',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.versionNum').d('版本号'),
    },
    {
      name: 'itemCategoryId',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.categoryCode').d('品类编码'),
      type: 'object',
      lovCode: 'SMDM.TREE_ITEM_CATEGORY',
      textField: 'categoryCode',
      dynamicProps: {
        required: ({ record }) => {
          const { itemId, itemName, itemCategoryName } =
            record.get(['itemId', 'itemName', 'itemCategoryName']) || {};
          return isEdit && !(itemId || itemName || itemCategoryName);
        },
        lovPara: ({ record }) => {
          const item = record.get('itemId');
          return {
            tenantId: organizationId,
            itemId: item?.itemId,
          };
        },
      },
      transformRequest: value => value && value.categoryId,
      transformResponse: (value, data) => {
        const { itemCategoryId, categoryCode, itemCategoryName } = data || {};
        return value
          ? { categoryId: itemCategoryId, categoryCode, categoryName: itemCategoryName }
          : null;
      },
    },
    {
      name: 'itemCategoryName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.categoryName').d('品类名称'),
      dynamicProps: {
        disabled: ({ record }) => record.get('itemCategoryId') || {},
      },
    },
    {
      name: 'buyerId',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.buyer').d('分管采购员'),
      type: 'object',
      lovCode: 'SPRM.PURCHASE_AGENT',
      dynamicProps: {
        lovPara: () => ({ tenantId: organizationId }),
        disabled: ({ record }) => {
          const { evalStatus } = record.get(['evalStatus']) || {};
          const disabledFlag = ![undefined, 'NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus);
          return disabledFlag;
        },
      },
      transformRequest: value => value && value.purchaseAgentId,
      transformResponse: (value, data) => {
        const { buyerId, buyerName } = data;
        return value ? { purchaseAgentId: buyerId, purchaseAgentName: buyerName } : null;
      },
    },
    {
      name: 'itemId',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.itemCode').d('物料编码'),
      type: 'object',
      lovCode: 'SMDM.CUSTOMER_ITEM_AND_MAIN_CATEGORY',
      textField: 'itemCode',
      dynamicProps: {
        required: ({ record }) => {
          const { itemCategoryId, itemName, itemCategoryName } =
            record.get(['itemCategoryId', 'itemName', 'itemCategoryName']) || {};
          return isEdit && !(itemCategoryId || itemName || itemCategoryName);
        },
        lovPara: ({ record }) => {
          const itemCategory = record.get('itemCategoryId');
          return {
            tenantId: organizationId,
            categoryId: itemCategory?.categoryId,
          };
        },
      },
      transformRequest: value => value && value.itemId,
      transformResponse: (value, data) => {
        const { itemId, itemCode, itemName } = data;
        return value ? { itemId, itemCode, itemName } : null;
      },
    },
    {
      name: 'itemName',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.itemName').d('物料名称'),
      dynamicProps: {
        disabled: ({ record }) => record.get('itemId') || {},
      },
    },
    {
      name: 'validCycle',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.effective').d('有效周期'),
      lookupCode: 'SSLM.QUOTA_VALID_CYCLE',
      dynamicProps: {
        disabled: ({ record }) => {
          const { evalStatus } = record.get(['evalStatus']) || {};
          const disabledFlag = ![undefined, 'NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus);
          return disabledFlag;
        },
      },
    },
    {
      name: 'effectiveDateFrom',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.isValidFrom').d('有效期从'),
      type: 'date',
      dynamicProps: {
        max: ({ record }) => record && record.get('effectiveDateTo'),
        required: ({ record }) => {
          const { evalStatus } = record.get(['evalStatus']) || {};
          const requiredFlag =
            isEdit && [undefined, 'NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus);
          return requiredFlag;
        },
        disabled: ({ record }) => {
          const { evalStatus } = record.get(['evalStatus']) || {};
          const disabledFlag = ![undefined, 'NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus);
          return disabledFlag;
        },
      },
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'effectiveDateTo',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.isValidTo').d('有效期至'),
      type: 'date',
      dynamicProps: {
        min: ({ record }) => record && record.get('effectiveDateFrom'),
        required: ({ record }) => {
          const { evalStatus } = record.get(['evalStatus']) || {};
          const requiredFlag =
            isEdit && [undefined, 'NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus);
          return requiredFlag;
        },
        disabled: ({ record }) => {
          const { evalStatus, validCycle } = record.get(['evalStatus', 'validCycle']) || {};
          const disabledFlag =
            validCycle || ![undefined, 'NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus);
          return disabledFlag;
        },
      },
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'numberOfProsecutions',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.numberOfProsecutions').d('起拆量'),
      dynamicProps: {
        disabled: ({ record }) => {
          const { evalStatus } = record.get(['evalStatus']) || {};
          const disabledFlag = ![undefined, 'NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus);
          return disabledFlag;
        },
      },
    },
    {
      name: 'controlMethod',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.controlMethod').d('控制方式'),
      lookupCode: 'SSLM.QUOTA_CONTROL_METHOD',
      dynamicProps: {
        disabled: ({ record }) => {
          const { evalStatus } = record.get(['evalStatus']) || {};
          const disabledFlag = ![undefined, 'NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus);
          return disabledFlag;
        },
      },
    },
    {
      name: 'versionDescription',
      label: intl.get('sslm.supplierQuotaManage.modal.quota.versionExplain').d('版本说明'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { queryParam, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/new-supplier-quota-headers/${quotaHeaderId}`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...other,
          ...queryParam,
        },
      };
    },
  },
  events: {
    update: ({ record, name }) => {
      if (name === 'companyId') {
        record.set('ouId', null);
      }
      if (name === 'itemCategoryId') {
        const itemCategory = record.get('itemCategoryId');
        record.set('itemCategoryName', itemCategory?.categoryName);
      }
      if (name === 'itemId') {
        const item = record.get('itemId');
        record.set({
          itemName: item?.itemName,
          itemCategoryId: {
            categoryId: item?.itemCategoryId,
            categoryCode: item?.itemCategoryCode,
            categoryName: item?.itemCategoryName,
          },
        });
      }
      if (['effectiveDateFrom', 'validCycle'].includes(name)) {
        const {
          effectiveDateFrom: effectiveFrom,
          effectiveDateTo: effectiveTo,
          validCycle,
        } = record.get(['effectiveDateFrom', 'effectiveDateTo', 'validCycle']);
        const effectiveDateFrom = effectiveFrom || moment().startOf('month');
        const newDate = cloneDeep(effectiveDateFrom);
        let effectiveDateTo;
        switch (validCycle) {
          case 'MONTH':
            effectiveDateTo = newDate.add(1, 'months').subtract(1, 'days');
            break;
          case 'QUARTER':
            effectiveDateTo = newDate.add(1, 'quarters').subtract(1, 'days');
            break;
          case 'HALF-YEAR':
            effectiveDateTo = newDate.add(6, 'months').subtract(1, 'days');
            break;
          case 'YEAR':
            effectiveDateTo = newDate.add(1, 'years').subtract(1, 'days');
            break;
          default:
            effectiveDateTo = effectiveTo;
            break;
        }
        record.set({
          effectiveDateFrom,
          effectiveDateTo,
        });
      }
    },
  },
});

// 配额分配
const getQuotaAllocationDS = ({ quotaHeaderId, isEdit }) => ({
  primaryKey: 'quotaLineId',
  cacheSelection: true,
  paging: false,
  selection: isEdit ? 'multiple' : false,
  fields: [
    {
      label: intl.get('sslm.supplierQuotaManage.modal.quota.suppilerCode').d('供应商编码'),
      name: 'supplierNum',
      type: 'object',
      required: true,
      textField: 'companyNum',
      lovCode: 'SSLM.ERP.SUPPLIER.VIEW',
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const company = dataSet?.parent?.current?.get('companyId');
          return {
            tenantId: organizationId,
            companyId: company?.companyId,
          };
        },
      },
      transformRequest: value => value && value.companyNum,
      transformResponse: (value, data) => {
        const { supplierId, supplierNum, supplierName } = data;
        return value
          ? { companyId: supplierId, companyNum: supplierNum, companyName: supplierName }
          : null;
      },
    },
    {
      label: intl.get('sslm.supplierQuotaManage.modal.quota.suppilerName').d('供应商名称'),
      name: 'supplierName',
      disabled: true,
    },
    {
      label: intl.get('sslm.supplierQuotaManage.modal.quota.erpSuppilerCode').d('ERP供应商编码'),
      name: 'erpSupplierNum',
      disabled: true,
    },
    {
      label: intl.get('sslm.supplierQuotaManage.modal.quota.ratio').d('配额比（%）'),
      name: 'quotaRatio',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      label: intl.get('hzero.common.priority').d('优先级'),
      name: 'orderSeq',
      type: 'number',
      min: 1,
      precision: 0,
      step: 1,
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParam, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-quota-lines/${quotaHeaderId}`,
        method: 'GET',
        params: {
          ...queryParam,
          ...other,
        },
      };
    },
    destroy: ({ data }) => {
      const quotaLineIdList = data.map(item => item.quotaLineId);
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-quota-lines`,
        method: 'DELETE',
        data: quotaLineIdList,
      };
    },
  },
  events: {
    update: ({ record, name }) => {
      if (name === 'supplierNum') {
        const supplier = record.get('supplierNum');
        record.set({
          supplierId: supplier?.companyId,
          supplierName: supplier?.companyName,
          erpSupplierNum: supplier?.supplierNum,
          erpSupplierId: supplier?.supplierId,
        });
      }
    },
  },
});

export { getBasicsDS, getQuotaAllocationDS };
