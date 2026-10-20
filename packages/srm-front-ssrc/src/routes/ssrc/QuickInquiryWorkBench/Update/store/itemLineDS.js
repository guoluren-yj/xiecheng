import { DataSet } from 'choerodon-ui/pro';
import { isEmpty, omit } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

import { getCompanyId, batchUpdateLines } from '../utils/utils';

const itemLineDS = ({ basicFormDs = new DataSet({}), rfqHeaderId = '', isNewInquiry = false }) => {
  return {
    primaryKey: 'rfqItemId',
    autoQuery: !isNewInquiry,
    dataToJSON: 'all',
    pageSize: 20,
    fields: [
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.lineNum`).d('行号'),
        name: 'rfqItemNum',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.companyName`).d('公司'),
        name: 'companyId',
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        textField: 'companyName',
        valueField: 'companyId',
        type: 'object',
        transformRequest: (value = {}) => {
          return value?.companyId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                companyId: value,
                companyName: data?.companyName,
                companyCode: data?.companyCode,
              }
            : null;
        },
      },
      {
        name: 'companyCode',
        bind: 'companyId.companyCode',
      },
      {
        name: 'companyName',
        bind: 'companyId.companyName',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.ouName`).d('业务实体'),
        name: 'ouId',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        valueField: 'ouId',
        transformRequest: (value = {}) => {
          return value?.ouId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                ouId: value,
                ouName: data?.ouName,
              }
            : null;
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              companyId: getCompanyId({ record, basicFormDs }),
            };
          },
        },
      },
      {
        name: 'ouName',
        bind: 'ouId.ouName',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationId',
        type: 'object',
        lovCode: 'HPFM.INV_ORG',
        textField: 'organizationName',
        valueField: 'organizationId',
        transformRequest: (value = {}) => {
          return value?.organizationId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                organizationId: value,
                organizationName: data?.invOrganizationName,
              }
            : null;
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record?.get('ouId')?.ouId,
              enabledFlag: 1,
              organizationId: getCurrentOrganizationId(),
              companyId: getCompanyId({ record, basicFormDs }),
            };
          },
        },
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationId.organizationName',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.itemCode`).d('物料编码'),
        name: 'itemId',
        type: 'object',
        lovCode: 'SSRC.NEW_CUSTOMER_ITEM',
        textField: 'itemCode',
        valueField: 'itemId',
        transformRequest: (value = {}) => {
          return value?.itemId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                itemId: value,
                itemCode: data?.itemCode,
              }
            : null;
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record?.get('ouId')?.ouId,
              invOrganizationId: record?.get('invOrganizationId')?.invOrganizationId,
              companyId: getCompanyId({ record, basicFormDs }),
              asyncCountFlag: 'Y',
            };
          },
        },
      },
      {
        name: 'itemCode',
        bind: 'itemId.itemCode',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.itemName`).d('物料名称'),
        name: 'itemName',
        maxLength: 200,
        required: true,
        dynamicProps: {
          // 当有物料编码时，由物料编码带出且不可编辑；当无物料编码时可编辑；
          disabled: ({ record }) => !!record.get('itemId')?.itemId,
        },
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.itemCategory`).d('物料类别'),
        name: 'itemCategoryId',
        type: 'object',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        textField: 'categoryName',
        valueField: 'categoryId',
        required: true,
        lovDefineAxiosConfig: (code) => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  treeFlag: 'Y',
                };
              },
            ],
          };
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              tenantId: getCurrentOrganizationId(),
              itemId: record?.get('itemId')?.itemId,
              companyId: getCompanyId({ record, basicFormDs }),
              businessObjectCode: 'SRM_C_SSRC_QUICK_RFQ_HEADER',
            };
          },
          optionsProps() {
            const otherProps = {
              parentField: 'parentCategoryId',
              record: {
                dynamicProps: {
                  selectable: (record) => record.get('isCheck') !== false,
                },
              },
            };
            return {
              paging: 'server',
              ...otherProps,
              idField: 'categoryId',
              events: {
                load({ dataSet: lovDataSet }) {
                  lovDataSet.setState('__totalCount__', lovDataSet.totalCount);
                  lovDataSet.setState('__currentPage__', lovDataSet.currentPage);
                  const { current } = lovDataSet.queryDataSet || {};
                  if (!isEmpty(omit(current.toData(), '__dirty'))) {
                    lovDataSet.forEach((record = {}) => {
                      Object.assign(record, { isExpanded: true });
                    });
                  }
                },
                append({ dataSet: lovDataSet }) {
                  const ds = lovDataSet;
                  ds.totalCount = ds.getState('__totalCount__');
                  ds.currentPage = ds.getState('__currentPage__');
                },
              },
            };
          },
        },
        transformRequest: (value = {}) => {
          return value?.categoryId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                categoryId: value,
                categoryName: data?.itemCategoryName,
              }
            : null;
        },
      },
      {
        name: 'itemCategoryName',
        bind: 'itemCategoryId.categoryName',
      },
      {
        label: intl.get(`ssrc.common.model.unit`).d('单位'),
        name: 'secondaryUomId',
        type: 'object',
        textField: 'uomName',
        valueField: 'uomId',
        required: true,
        transformRequest: (value = {}) => {
          return value?.uomId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                uomId: value,
                uomName: data?.secondaryUomName,
              }
            : null;
        },
        dynamicProps: {
          lovCode: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag && record?.get('itemId')?.itemId
              ? 'SMDM_ITEM_ORG_UOM'
              : 'SSRC.UOM';
          },
          lovPara: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag && record?.get('itemId')?.itemId
              ? { itemId: record?.get('itemId')?.itemId, primaryUomId: record.get('uomId')?.uomId }
              : {};
          },
        },
      },
      {
        name: 'secondaryUomName',
        bind: 'secondaryUomId.uomName',
      },
      {
        name: 'uomId',
        type: 'object',
        textField: 'uomName',
        valueField: 'uomId',
        lovCode: 'SSRC.UOM',
        label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
        disabled: true,
        transformRequest: (value = {}) => {
          return value?.uomId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                uomId: value,
                uomName: data?.uomName,
              }
            : null;
        },
      },
      {
        name: 'uomName',
        bind: 'uomId.uomName',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.currencyCode`).d('币种'),
        name: 'currencyCode',
        type: 'object',
        textField: 'currencyCode',
        valueField: 'currencyCode',
        lovCode: 'SMDM.CURRENCY',
        required: true,
        transformRequest: (value = {}) => {
          return value?.currencyCode || null;
        },
        transformResponse: (value) => {
          return value
            ? {
                currencyCode: value,
              }
            : null;
        },
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.targetPriceType`).d('目标单价类型'),
        name: 'targetPriceType',
        lookupCode: 'SFIN.BENCHMARK_PRICE',
      },
      {
        label: intl.get(`ssrc.common.model.targetPrice`).d('目标单价'),
        name: 'secondaryTargetPrice',
        type: 'number',
        max: '99999999999999999999',
        required: true,
        precision: 10, // 无币种时 默认为10 有币种 根据币种精度
        validator: (value) => {
          if (value && value <= 0) {
            return intl
              .get(`ssrc.common.model.common.validation.targetPrice`)
              .d('目标单价必须大于0');
          }
          return true;
        },
      },
      {
        name: 'targetPrice',
        type: 'number',
        min: 0,
        max: '99999999999999999999',
        label: intl.get(`ssrc.common.model.inquiryHall.basicTargetPrice`).d('基本目标单价'),
        precision: 10,
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.taxRate`).d('税率（%）'),
        name: 'taxId',
        type: 'object',
        lovCode: 'SMDM.TAX',
        textField: 'taxRate',
        valueField: 'taxId',
        transformRequest: (value = {}) => {
          return value?.taxId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                taxId: value,
                taxRate: data?.taxRate,
                taxCode: data?.taxCode,
              }
            : null;
        },
      },
      {
        name: 'taxRate',
        bind: 'taxId.taxRate',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.startLadderLevel`).d('启用阶梯报价'),
        name: 'ladderInquiryFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.ladderInquiry`).d('阶梯报价'),
        name: 'ladderOffer',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.brand`).d('品牌'),
        name: 'brand',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.specs`).d('规格'),
        name: 'specs',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.validDateFrom`).d('报价有效期从'),
        name: 'validDateFrom',
        type: 'date',
        format: getDateFormat(),
        max: 'validDateTo',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.validDateTo`).d('报价有效期至'),
        name: 'validDateTo',
        type: 'date',
        format: getDateFormat(),
        min: 'validDateFrom',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.minLimitPrice`).d('最低限价'),
        name: 'minLimitPrice',
        type: 'number',
        min: 0,
        max: '99999999999999999999',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.maxLimitPrice`).d('最高限价'),
        name: 'maxLimitPrice',
        type: 'number',
        min: 0,
        max: '99999999999999999999',
        validator: (value, name, record) => {
          const minValue = record.get('minLimitPrice');
          if ((value || value === 0) && value <= minValue) {
            return intl
              .get('ssrc.quickInquiry.view.quickInquiry.validate.maxLimitPrice', {
                minValue,
              })
              .d(`最高限价必须大于{minValue}。`);
          }
          return true;
        },
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.prNum`).d('采购申请号'),
        name: 'prNum',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.prLineNum`).d('申请行号'),
        name: 'prLineNum',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.remark`).d('物料行备注'),
        name: 'remark',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.attachmentUuid`).d('附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfq-item',
        ...(ChunkUploadProps || {}),
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.expandCompany`).d('拓展公司'),
        name: 'expandCompany',
        type: 'object',
        multiple: true,
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        transformResponse: (value, data) => {
          const { expandCompany, expandCompanyMeaning } = data || {};
          const idList = expandCompany?.split(',') || [];
          const nameList = expandCompanyMeaning?.split(',') || [];
          return value
            ? idList.map((item, index) => ({
                companyId: item,
                companyName: nameList[index],
              }))
            : null;
        },
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.companyId).join(',');
        },
        dynamicProps: {
          required() {
            const { expandResultsFlag, resultsExpandingHierarchy, resultsExpandingDimensions } =
              basicFormDs?.current?.get([
                'expandResultsFlag',
                'resultsExpandingHierarchy',
                'resultsExpandingDimensions',
              ]) || {};
            return (
              [1, '1'].includes(expandResultsFlag) &&
              resultsExpandingDimensions === 'ITEM_LINE' &&
              resultsExpandingHierarchy === 'INV_ORGANIZATION'
            );
          },
        },
      },
      {
        name: 'expandCompanyMeaning',
        bind: 'expandCompany.companyName',
        multiple: ',',
      },
      {
        name: 'expandInvOrganization',
        type: 'object',
        multiple: true,
        label: intl
          .get('ssrc.quickInquiry.model.quickInquiry.expandInvOrganization')
          .d('拓展库存组织'),
        lovCode: 'HPFM_INV_ORGANIZATION_LIST',
        dynamicProps: {
          disabled({ record }) {
            return isEmpty(record.get('expandCompany'));
          },
          required() {
            const { expandResultsFlag, resultsExpandingHierarchy, resultsExpandingDimensions } =
              basicFormDs?.current?.get([
                'expandResultsFlag',
                'resultsExpandingHierarchy',
                'resultsExpandingDimensions',
              ]) || {};
            return (
              [1, '1'].includes(expandResultsFlag) &&
              resultsExpandingDimensions === 'ITEM_LINE' &&
              resultsExpandingHierarchy === 'INV_ORGANIZATION'
            );
          },
          lovPara({ record }) {
            const companyIds = record?.get('expandCompany');
            const param = {
              companyIds: companyIds?.map((item) => item.companyId)?.join(','),
            };
            return param;
          },
        },
        transformResponse: (value, data) => {
          const { expandInvOrganization, expandInvOrganizationMeaning } = data || {};
          const idList = expandInvOrganization?.split(',') || [];
          const nameList = expandInvOrganizationMeaning?.split(',') || [];
          return value
            ? idList.map((item, index) => ({
                organizationId: Number(item), // 值集值字段默认数字类型 若是后期值集主键加密 需要再次处理
                organizationName: nameList[index],
              }))
            : null;
        },
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.organizationId).join(',');
        },
      },
      {
        name: 'expandInvOrganizationMeaning',
        bind: 'expandInvOrganization.organizationName',
        multiple: ',',
      },
    ],
    events: {
      load: ({ dataSet }) => {
        if (!dataSet) {
          return;
        }

        const batchMainItemsData = dataSet.getState('batchMainItemsData') || {};

        const { batchBodyItem, allBatchEditFlag } = batchMainItemsData || {};
        // 批量编辑逻辑
        if (allBatchEditFlag === 1) {
          // line update
          batchUpdateLines({
            batchBodyItem,
            itemLineDS: dataSet,
            allBatchEditFlag,
          });
        }
      },
      update: ({ record, name }) => {
        if (name === 'minLimitPrice') {
          // 设置自身 为了触发自定义校验
          record.set('maxLimitPrice', record.get('maxLimitPrice'));
        }
      },
    },
    transport: {
      read: ({ params = {} }) => ({
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-items/list`,
        method: 'POST',
        params: {
          ...(params || {}),
          customizeUnitCode: `SSRC.QUICK_INQUIRY.EDIT.LINE_ITEM`,
        },
        data: {
          rfqHeaderId,
        },
      }),
      destroy: ({ data }) => ({
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-items/delete`,
        method: 'POST',
        data: {
          rfqItemIds: data.map((i) => i.rfqItemId),
        },
      }),
    },
  };
};

const batchMaintainItemDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.taxRate`).d('税率（%）'),
        name: 'taxId',
        type: 'object',
        lovCode: 'SMDM.TAX',
        textField: 'taxRate',
        valueField: 'taxId',
        transformRequest: (value = {}) => {
          return value?.taxId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                taxId: value,
                taxRate: data?.taxRate,
                taxCode: data?.taxCode,
              }
            : null;
        },
      },
      {
        name: 'taxRate',
        bind: 'taxId.taxRate',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.validDateFrom`).d('报价有效期从'),
        name: 'validDateFrom',
        type: 'date',
        format: getDateFormat(),
        max: 'validDateTo',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.validDateTo`).d('报价有效期至'),
        name: 'validDateTo',
        type: 'date',
        format: getDateFormat(),
        min: 'validDateFrom',
      },
    ],
  };
};

const ladderQuotationHeaderDS = () => ({
  primaryKey: 'rfqItemId',
  paging: false,
  fields: [
    {
      name: 'itemCode',
      label: intl.get(`ssrc.quickInquiry.model.quickInquiry.itemCode`).d('物料编码'),
    },
    {
      label: intl.get(`ssrc.quickInquiry.model.quickInquiry.itemName`).d('物料名称'),
      name: 'itemName',
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { rfqItemId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-items/detail`,
        method: 'POST',
        params: { customizeUnitCode: 'SSRC.QUICK_INQUIRY.EDIT.LADDER_QUOTATION_HEADER' },
        data: { rfqItemId },
      };
    },
  },
});
const ladderQuotationTableDS = () => ({
  primaryKey: 'ladderInquiryId',
  paging: false,
  fields: [
    {
      name: 'ladderLineNum',
      type: 'string',
      label: intl.get('ssrc.quickInquiry.model.quickInquiry.ladderLineNum').d('行号'),
    },
    // 维护辅助数量，基本数量由辅助数量计算出
    {
      name: 'secondaryLadderFrom',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      label: intl.get('ssrc.quickInquiry.model.quickInquiry.ladderFromRange').d('数量从（>=）'),
      required: true,
      dynamicProps: {
        defaultValue: ({ dataSet }) => {
          if (dataSet?.length > 0) {
            const lastRecord = dataSet.records[dataSet.length - 1] || {};
            return lastRecord?.get('secondaryLadderTo');
          }
          return null;
        },
      },
    },
    {
      name: 'secondaryLadderTo',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      label: intl.get('ssrc.quickInquiry.model.quickInquiry.ladderToRange').d('数量至(<)'),
      dynamicProps: {
        required: ({ record, dataSet }) => {
          return record.index < dataSet.length - 1;
        },
      },
    },
    {
      name: 'ladderFrom',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      label: `${intl.get(`ssrc.common.model.inquiryHall.basicLadderFrom`).d('基本数量从')} (>=)`,
      dynamicProps: {
        defaultValue: ({ dataSet }) => {
          if (dataSet?.length > 0) {
            const lastRecord = dataSet.records[dataSet.length - 1] || {};
            return lastRecord?.get('ladderTo');
          }
          return null;
        },
      },
    },
    {
      name: 'ladderTo',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      label: `${intl.get(`ssrc.common.model.inquiryHall.basicLadderTo`).d('基本数量至')} (>=)`,
    },
    {
      label: intl.get(`ssrc.common.model.targetPrice`).d('目标单价'),
      name: 'secondaryTargetPrice',
      type: 'number',
      max: '99999999999999999999',
      precision: 10, // 无币种时 默认为10 有币种 根据币种精度
      validator: (value) => {
        if (value && value <= 0) {
          return intl.get(`ssrc.common.model.common.validation.targetPrice`).d('目标单价必须大于0');
        }
        return true;
      },
    },
    {
      name: 'targetPrice',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      label: intl.get(`ssrc.common.model.inquiryHall.basicTargetPrice`).d('基本目标单价'),
      precision: 10,
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssrc.common.model.common.sectionRemark').d('备注'),
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { rfqItemId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-ladder-inquirys/list`,
        method: 'POST',
        params: { customizeUnitCode: 'SSRC.QUICK_INQUIRY.EDIT.LADDER_QUOTATION_LINE' },
        data: { rfqItemId },
      };
    },
    submit: ({ dataSet }) => {
      const {
        queryParameter: { rfqItemId },
        records,
      } = dataSet;
      const dataSource = records.map((i, index) => ({
        ...i.toData(),
        ladderLineNum: index + 1,
        rfqItemId,
      }));
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-ladder-inquirys/save`,
        method: 'POST',
        params: { customizeUnitCode: 'SSRC.QUICK_INQUIRY.EDIT.LADDER_QUOTATION_LINE', rfqItemId },
        data: dataSource,
      };
    },
    destroy: ({ data, dataSet }) => {
      const {
        queryParameter: { rfqItemId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-ladder-inquirys/delete`,
        method: 'POST',
        params: { rfqItemId },
        data,
      };
    },
  },
});

export { itemLineDS, batchMaintainItemDS, ladderQuotationTableDS, ladderQuotationHeaderDS };
