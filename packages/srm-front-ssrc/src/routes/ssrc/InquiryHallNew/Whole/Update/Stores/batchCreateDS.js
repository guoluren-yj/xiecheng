/**
 * 批量创建物料DS配置
 */

import intl from 'utils/intl';
import { isEmpty, isArray } from 'lodash';

import { Prefix } from '@/utils/globalVariable';

const batchCreateItemDS = (options = {}) => {
  const {
    companyId,
    organizationId,
    taxChangeFlag,
    rfxHeaderId,
    customizeUnitCode = null,
    doubleUnitFlag,
  } = options || {};
  return {
    autoCreate: true,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        valueField: 'ouId',
        dynamicProps: {
          disabled({ record }) {
            const invOrganizationIdData = record.get('invOrganizationId');
            return isArray(invOrganizationIdData) && invOrganizationIdData.length > 1;
          },
          lovPara() {
            return {
              companyId,
            };
          },
        },
      },
      {
        name: 'ouName',
        bind: 'ouIdLov.ouName',
      },
      {
        name: 'ouId',
        bind: 'ouIdLov.ouId',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'HPFM.INV_ORG',
        textField: 'invOrganizationName',
        valueField: 'invOrganizationId',
        noCache: true,
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record.get('ouId'),
              companyId,
              enabledFlag: 1,
              organizationId,
            };
          },
          multiple({ record }) {
            const itemIdLovData = record.get('itemIdLov');
            return !isEmpty(itemIdLovData)
              ? itemIdLovData?.length
                ? itemIdLovData.length <= 1
                : true
              : true;
          },
        },
      },
      {
        name: 'invOrganizationId',
        bind: 'invOrganizationIdLov.invOrganizationId',
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationIdLov.invOrganizationName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.CUSTOMER_ITEM_INCLUDE_CATEGORY',
        textField: 'itemCode',
        valueField: 'itemIdAndCategoryId',
        required: true,
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record.get('ouId'),
              invOrganizationId: isArray(record.get('invOrganizationId'))
                ? null
                : record.get('invOrganizationId'),
              InvOrganizationIds: isArray(record.get('invOrganizationId'))
                ? record.get('invOrganizationId').toString()
                : record.get('invOrganizationId'),
              companyId,
              asyncCountFlag: 'Y',
              from: 'ITEM_LIMIT',
            };
          },
          multiple({ record }) {
            return !isEmpty(record.get('invOrganizationId'))
              ? record.get('invOrganizationId')?.length === 1
              : true;
          },
        },
      },
      {
        name: 'itemIds',
        bind: 'itemIdLov.itemId',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
        min: '0.000001',
        max: '99999999999999999999',
        dynamicProps: {
          required() {
            return doubleUnitFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'rfxQuantity',
        type: 'number',
        min: '0.000001',
        max: '99999999999999999999',
        dynamicProps: {
          required() {
            return !doubleUnitFlag;
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.TAX',
        textField: 'taxRate',
        valueField: 'taxId',
        dynamicProps: {
          disabled({ record }) {
            return !record.get('taxIncludedFlag');
          },
          required({ record }) {
            return record.get('taxIncludedFlag') && taxChangeFlag;
          },
        },
      },
      {
        name: 'taxId',
        bind: 'taxIdLov.taxId',
      },
      {
        name: 'taxRate',
        bind: 'taxIdLov.taxRate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
        format: 'YYYY-MM-DD',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startLadderLevel`).d('启用阶梯报价'),
        name: 'ladderInquiryFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    events: {
      update: ({ record, name, value = {} }) => {
        if (name === 'ouIdLov') {
          record.set('invOrganizationIdLov', null);
          record.set('invOrganizationId', null);
          record.set('invOrganizationName', null);
          record.set('itemIdLov', null);
          record.set('itemIds', null);
        } else if (name === 'taxIncludedFlag' && !value) {
          record.set('taxId', null);
          record.set('taxRate', null);
        }
      },
    },
    transport: {
      submit: ({ dataSet }) => {
        const data = dataSet.current?.toData();
        return {
          method: 'POST',
          url: `${Prefix}/${organizationId}/rfx/offline-whole/items/batch-save`,
          params: {
            rfxHeaderId,
            customizeUnitCode,
          },
          data: {
            ...data,
            bathRfxLineItemList: isArray(data.itemIdLov) ? data.itemIdLov : [data.itemIdLov],
            tenantId: organizationId,
            customizeUnitCode,
            bathInvOrganizationIds: isArray(data.invOrganizationId)
              ? data.invOrganizationId
              : [data.invOrganizationId],
            itemIdLov: isArray(data.itemIdLov) ? data.itemIdLov : [data.itemIdLov],
            itemIds: isArray(data.itemIds) ? data.itemIds : [data.itemIds],
            invOrganizationId: isArray(data.invOrganizationId) ? null : data.invOrganizationId,
          },
        };
      },
    },
  };
};

export { batchCreateItemDS };
