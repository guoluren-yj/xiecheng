import { isObject, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';
import { getUomName, getQtyName } from '@/utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { ChunkUploadProps } from '@/utils/SsrcRegx';
import { NumberMax, NumberMin, NumberDecimalMin } from '@/utils/constants';

const itemLineDataSet = (options = {}) => {
  const { organizationId, rfxHeaderId, customizeUnitCode, basicFormDS } = options || {};

  // get dynamic value form header ds
  const getValueFromBindHeaderFormDS = (ds, field = '') => {
    const { current = null } = basicFormDS || {};

    if (!current || !field || !ds) {
      return null;
    }

    let value = current.get(field);
    if (isObject(value)) {
      value = value?.[field];
    }

    return value;
  };

  return {
    primaryKey: 'rfxLineItemId',
    autoQuery: false,
    cacheSelection: true,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
        type: 'string',
        readOnly: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouId',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        valueField: 'ouId',
        transformRequest: (value = {}) => value && value?.ouId,
        transformResponse: (value, data) => {
          return value ? { ouId: value, ouName: data?.ouName } : null;
        },
        dynamicProps: {
          disabled({ dataSet, record }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const { prHeaderId, projectLineItemId } =
              record.get(['prHeaderId', 'projectLineItemId']) || {};

            const flag = projectLineItemId || prHeaderId || disabledChangeItemFlag;
            return flag;
          },
          lovPara({ dataSet }) {
            const companyId = getValueFromBindHeaderFormDS(dataSet, 'companyId');

            return {
              companyId,
            };
          },
        },
      },
      {
        name: 'ouName',
        bind: 'ouId.ouName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationId',
        type: 'object',
        lovCode: 'HPFM.INV_ORG',
        textField: 'organizationName',
        valueField: 'organizationId',
        transformRequest: (value = {}) => {
          return value?.invOrganizationId || value?.organizationId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                invOrganizationId: value,
                organizationName: data?.invOrganizationName,
              }
            : null;
        },
        dynamicProps: {
          disabled({ dataSet, record }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const { prHeaderId, projectLineItemId } =
              record.get(['prHeaderId', 'projectLineItemId']) || {};
            const flag = projectLineItemId || prHeaderId || disabledChangeItemFlag;

            return flag;
          },
          lovPara({ dataSet, record }) {
            const companyId = getValueFromBindHeaderFormDS(dataSet, 'companyId');
            const { ouId = null } = record.get('ouId') || {};

            return {
              ouId,
              companyId,
              enabledFlag: 1,
              organizationId,
            };
          },
        },
      },
      {
        name: 'organizationName',
        bind: 'invOrganizationId.organizationName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemId',
        type: 'object',
        lovCode: 'SSRC.NEW_CUSTOMER_ITEM',
        textField: 'itemCode',
        valueField: 'itemId',
        transformRequest: (value = {}) => {
          return value?.itemId || value?.partnerItemId || null;
        },
        transformResponse: (value, data) => {
          return value ? { itemId: value, itemCode: data?.itemCode } : null;
        },
        dynamicProps: {
          disabled({ record, dataSet }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const { prHeaderId, projectLineItemId } =
              record.get(['prHeaderId', 'projectLineItemId']) || {};

            const flag = projectLineItemId || prHeaderId || disabledChangeItemFlag;
            return flag;
          },

          lovPara({ dataSet, record }) {
            const companyId = getValueFromBindHeaderFormDS(dataSet, 'companyId');
            const { ouId = null } = record.get('ouId') || {};
            const { invOrganizationId = null } = record.get('oinvOrganizationIduId') || {};

            return {
              ouId,
              invOrganizationId,
              companyId,
              asyncCountFlag: 'Y',
              from: 'ITEM_LIMIT',
            };
          },
        },
      },
      {
        name: 'itemCode',
        bind: 'itemId.itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
        type: 'string',
        maxLength: 300,
        dynamicProps: {
          disabled({ record, dataSet }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const { prHeaderId, projectLineItemId } =
              record.get(['prHeaderId', 'projectLineItemId']) || {};
            const flag = projectLineItemId || prHeaderId || disabledChangeItemFlag;
            return flag;
          },
          required({ record, dataSet }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const { prHeaderId, projectLineItemId } =
              record.get(['prHeaderId', 'projectLineItemId']) || {};
            const flag = projectLineItemId && !prHeaderId && !disabledChangeItemFlag;

            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        name: 'itemCategoryId',
        type: 'object',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        textField: 'categoryName',
        valueField: 'categoryId',
        transformRequest: (value = {}) => {
          return value?.itemCategoryId || value?.categoryId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                itemCategoryId: value || data?.categoryId,
                itemCategoryName: data?.itemCategoryName || data?.categoryName,
              }
            : null;
        },
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
                  idField: 'categoryId',
                  parentIdField: 'parentCategoryId',
                };
              },
            ],
          };
        },
        dynamicProps: {
          disabled({ dataSet }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const flag = disabledChangeItemFlag;

            return flag;
          },
          // required({ dataSet }) {
          //   const matchRestrictFlag = getValueFromBindHeaderFormDS(dataSet, 'matchRestrictFlag');
          //   const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');

          //   return !disabledChangeItemFlag || matchRestrictFlag;
          // },
          lovPara({ dataSet, record }) {
            const companyId = getValueFromBindHeaderFormDS(dataSet, 'companyId');
            const { itemId = null } = record.get('itemId') || {};

            return {
              tenantId: organizationId,
              itemId,
              companyId,
              businessObjectCode: 'SRM_C_SRM_SSRC_RFX_HEADER',
            };
          },
          optionsProps() {
            return {
              paging: 'server',
              parentField: 'parentCategoryId',
              idField: 'categoryId',
              record: {
                dynamicProps: {
                  selectable: (record) => record.get('isCheck') !== false,
                },
              },
            };
          },
        },
      },
      {
        name: 'itemCategoryName',
        bind: 'itemCategoryId.categoryName',
      },
      {
        name: 'secondaryUomName',
        bind: 'secondaryUomId.secondaryUomName',
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
        name: 'rfxQuantity',
        type: 'number',
        max: NumberMax,
        step: 0,
        dynamicProps: {
          min({ record }) {
            const currentField = record.getField('rfxQuantity');

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return NumberMin;
            }

            return NumberDecimalMin;
          },
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
          required: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');

            const flag = !doubleUnitFlag && !disabledChangeItemFlag;
            return flag;
          },
          disabled: ({ dataSet }) => {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const flag = doubleUnitFlag || disabledChangeItemFlag;
            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
        step: 0,
        max: NumberMax,
        dynamicProps: {
          required: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');

            const flag = doubleUnitFlag && !disabledChangeItemFlag;
            return flag;
          },
          disabled: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');

            const flag = !doubleUnitFlag || disabledChangeItemFlag;
            return flag;
          },
          min({ record }) {
            const currentField = record.getField('secondaryQuantity');

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return NumberMin;
            }

            return NumberDecimalMin;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        name: 'taxId',
        type: 'object',
        lovCode: 'SMDM.TAX',
        textField: 'taxRate',
        valueField: 'taxId',
        transformRequest: (value) => value && value.taxId,
        transformResponse: (value) => {
          return value ? { taxId: value } : null;
        },
        lovPara: {
          organizationId,
        },
        dynamicProps: {
          required({ record, dataSet }) {
            const taxChangeFlag = getValueFromBindHeaderFormDS(dataSet, 'taxChangeFlag');
            const { taxIncludedFlag } = record.get(['taxIncludedFlag']);

            const result = taxChangeFlag === 1 && taxIncludedFlag === 1;

            return result;
          },
          disabled({ record, dataSet }) {
            const taxChangeFlag = getValueFromBindHeaderFormDS(dataSet, 'taxChangeFlag');
            const { taxIncludedFlag } = record.get(['taxIncludedFlag']);

            const result = taxChangeFlag !== 1 || taxIncludedFlag !== 1;

            return result;
          },
        },
      },
      {
        name: 'taxRate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率(%)'),
        bind: 'taxId.taxRate',
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
        name: 'uomId',
        type: 'object',
        textField: 'uomName',
        valueField: 'uomId',
        transformRequest: (value = {}) => value && value?.uomId,
        transformResponse: (value, data) => {
          return value ? { uomId: value, uomName: data?.uomName } : null;
        },
        lovCode: 'SSRC.UOM',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { setting000112 = null } = dataSet.getState('settings') || {};
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const { itemCode } = record.get('itemId') || {};

            const flag =
              doubleUnitFlag || disabledChangeItemFlag || (setting000112 === '1' && itemCode);
            return flag;
          },
          required: ({ dataSet }) => {
            const { setting000112 = null } = dataSet.getState('settings') || {};
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');

            const flag = !doubleUnitFlag && !disabledChangeItemFlag && setting000112 !== '1';

            return flag;
          },
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'uomName',
        bind: 'uomId.uomName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomId',
        type: 'object',
        textField: 'secondaryUomName',
        valueField: 'secondaryUomId',
        transformRequest: (value = {}) => value && value?.secondaryUomId,
        transformResponse: (value, data) => {
          return value
            ? {
                secondaryUomId: value,
                secondaryUomName: data?.secondaryUomName,
                uomCodeAndName: data?.secondaryUomName,
              }
            : null;
        },
        dynamicProps: {
          disabled({ dataSet, record }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { setting000112 = null } = dataSet.getState('settings') || {};
            const { itemCode } = record.get('itemId') || {};

            const flag =
              !doubleUnitFlag || disabledChangeItemFlag || (setting000112 === '1' && itemCode);
            return flag;
          },
          required: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');

            const flag = doubleUnitFlag && !disabledChangeItemFlag;
            return flag;
          },
          lovCode: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemId = null } = record.get('itemId') || {};
            return doubleUnitFlag && itemId ? 'SMDM_ITEM_ORG_UOM' : 'SSRC.UOM';
          },
          lovPara: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemId = null } = record.get('itemId') || {};
            const { uomId = null } = record.get('uomId') || {};

            return doubleUnitFlag && itemId ? { itemId, primaryUomId: uomId } : {};
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
        format: DEFAULT_DATE_FORMAT,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceQuantity`).d('价格批量'),
        name: 'batchPrice',
        type: 'number',
        defaultValue: 1,
        step: 0,
        max: NumberMax,
        dynamicProps: {
          min({ record }) {
            const currentField = record.getField('batchPrice');

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            return NumberDecimalMin;
          },
          // required: ({ dataSet, record }) => {
          //   const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          //   const { itemId = null } = record.get('itemId') || {};
          //   const { uomId = null } = record.get('uomId') || {};
          //   const { secondaryUomId = null } = record.get('secondaryUomId') || {};

          //   const flag = !(doubleUnitFlag && itemId && secondaryUomId && uomId !== secondaryUomId);
          //   return flag;
          // },
          disabled: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemId = null } = record.get('itemId') || {};
            const { uomId = null } = record.get('uomId') || {};
            const { secondaryUomId = null } = record.get('secondaryUomId') || {};
            const flag = doubleUnitFlag && itemId && secondaryUomId && uomId !== secondaryUomId;
            return flag;
          },
        },
      },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startLadderLevel`).d('启用阶梯报价'),
      //   name: 'ladderInquiryFlag',
      // },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
      //   name: 'ladderOffer',
      // },
      {
        label: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        name: 'specs',
        type: 'string',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const prHeaderId = record.get('prHeaderId');

            const flag = disabledChangeItemFlag || prHeaderId;
            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        name: 'prNum',
        type: 'string',
        readOnly: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        name: 'prDisplayLineNum',
        type: 'string',
        readOnly: true,
      },
      {
        name: 'applicationScopeFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get('ssrc.common.model.common.attachment').d('附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxitem',
        ...(ChunkUploadProps || {}),
        dynamicProps: {
          readOnly({ dataSet }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            return disabledChangeItemFlag;
          },
        },
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.ssrcControlOrderFlag`)
          .d('是否控制订单数量'),
        name: 'controlOrderFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.ssrcControlProtocolFlag`)
          .d('是否控制协议数量'),
        name: 'controlProtocolFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      { name: 'prHeaderId' },
    ],
    events: {
      update: ({ record, name, value = null }) => {
        if (name === 'taxIncludedFlag') {
          record.set('taxIncludedFlag', value);
          if (value !== 1) {
            record.set('taxId', null);
            record.set('taxRate', null);
          }
        }

        if (name === 'invOrganizationId') {
          record.set('invOrganizationId', {
            organizationId: value?.organizationId,
            organizationName: value?.organizationName,
          });

          if (value?.organizationId && value?.ouId) {
            record.set('ouId', {
              ouId: value?.ouId,
              ouName: value?.ouName,
            });
          }
        }
      },
    },
    transport: {
      read: ({ data }) => {
        const queryParamData = {
          customizeUnitCode,
          rfxHeaderId,
          ...data,
        };

        return {
          url: `${Prefix}/${organizationId}/rfx/offline-whole/items`,
          method: 'GET',
          data: queryParamData,
        };
      },
      submit: ({ data }) => {
        return {
          url: `${Prefix}/${organizationId}/rfx/offline-whole/items`,
          method: 'POST',
          params: { rfxHeaderId, customizeUnitCode },
          data,
        };
      },
      destroy: ({ dataSet, data }) => {
        return {
          url: `${Prefix}/${organizationId}/rfx/offline-whole/items`,
          method: 'DELETE',
          params: customizeUnitCode,
          data,
          transformResponse: (res) => {
            const result = JSON.parse(res) || null;
            if (!isEmpty(result) && !result.failed) {
              dataSet.query(undefined, undefined, true);
            }
            return result;
          },
        };
      },
    },
  };
};

export { itemLineDataSet };
