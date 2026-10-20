import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';
import { Tooltip } from 'choerodon-ui/pro';
import React from 'react';
import omit from 'lodash/omit';

const ItemLineTableDS = (queryParams, getConfigs) => {
  return {
    primaryKey: 'rfxLineItemId',
    // dataToJSON: 'dirty',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTH.OU',
        // textField: 'ouName',
        // valueField: 'ouId',
        dynamicProps: ({ dataSet, record }) => {
          const { companyId = null } = dataSet.queryParameter.company || {};
          const { ouIdLov = [] } = getConfigs().filterDynamicProps;
          const dProps = {
            disabled: record.get('prHeaderId'),
            lovPara: { companyId },
          };
          return omit(dProps, ouIdLov);
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
        dynamicProps: {
          disabled({ record }) {
            return record.get('prHeaderId') || !record.get('ouId');
          },
          lovPara({ record }) {
            const { organizationId = null } = queryParams;
            return {
              ouId: record.get('ouId'),
              enabledFlag: 1,
              organizationId,
            };
          },
        },
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationIdLov.invOrganizationName',
      },
      {
        name: 'invOrganizationId',
        bind: 'invOrganizationIdLov.invOrganizationId',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.NEW_CUSTOMER_ITEM',
        dynamicProps: {
          disabled({ record }) {
            return record.get('prHeaderId');
          },
          lovPara({ dataSet, record }) {
            const { companyId = null } = dataSet.queryParameter.company || {};
            return {
              ouId: record.get('ouId'),
              invOrganizationId: record.get('invOrganizationId'),
              companyId,
            };
          },
        },
      },
      {
        name: 'itemId',
        bind: 'itemIdLov.itemId',
      },
      {
        name: 'itemCode',
        bind: 'itemIdLov.itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
        type: 'string',
        maxLength: 300,
        dynamicProps: {
          disabled({ record }) {
            return record.get('prHeaderId');
          },
          required({ dataSet }) {
            const {
              queryParameter: { headers = {} },
            } = dataSet;
            const allowChangeItemFlag =
              headers.allowChangeItemsFlag === 0 && headers.sourceFrom === 'PROJECT';
            return !allowChangeItemFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
        name: 'specs',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        name: 'itemCategoryIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.TREE_ITEM_CATEGORY',
        textField: 'itemCategoryName',
        valueField: 'itemCategoryId',
        dynamicProps: {
          required({ dataSet }) {
            const {
              queryParameter: { headers = {}, matchRestrictFlag },
            } = dataSet;
            const allowChangeItemFlag =
              headers.allowChangeItemsFlag === 0 && headers.sourceFrom === 'PROJECT';
            return matchRestrictFlag || !allowChangeItemFlag;
          },
          lovPara({ dataSet, record }) {
            const { organizationId = null } = queryParams;
            const { companyId = null } = dataSet.queryParameter.company || {};
            return {
              tenantId: organizationId,
              itemId: record.get('itemId'),
              companyId,
            };
          },
        },
      },
      {
        name: 'itemCategoryId',
        bind: 'itemCategoryIdLov.itemCategoryId',
      },
      {
        name: 'itemCategoryName',
        bind: 'itemCategoryIdLov.itemCategoryName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'rfxQuantity',
        type: 'number',
        align: true,
        min: '0',
        max: '99999999999999999999',
        dynamicProps: {
          required({ dataSet }) {
            const {
              queryParameter: { headers = {} },
            } = dataSet;
            const allowChangeItemFlag =
              headers.allowChangeItemsFlag === 0 && headers.sourceFrom === 'PROJECT';
            return !allowChangeItemFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'uomIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.UOM',
        textField: 'uomName',
        valueField: 'uomId',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { setting000112 = null } = dataSet.queryParameter.settings || {};
            return setting000112 === '1' && record.get('itemCode');
          },
          required({ dataSet }) {
            const {
              queryParameter: { headers = {} },
            } = dataSet;
            const allowChangeItemFlag =
              headers.allowChangeItemsFlag === 0 && headers.sourceFrom === 'PROJECT';
            return !allowChangeItemFlag;
          },
        },
      },
      {
        name: 'uomName',
        bind: 'uomIdLov.uomName',
      },
      {
        name: 'uomId',
        bind: 'uomIdLov.uomId',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceQuantity`).d('价格批量'),
        name: 'batchPrice',
        align: 'right',
        type: 'number',
        min: 0,
        max: 99999999999999,
        dynamicProps: ({ dataSet }) => {
          const {
            queryParameter: { headers = {} },
          } = dataSet;
          const { batchPrice = [] } = getConfigs().filterDynamicProps;
          const allowChangeItemFlag =
            headers.allowChangeItemsFlag === 0 && headers.sourceFrom === 'PROJECT';
          const dProps = {
            required: !allowChangeItemFlag,
            defaultValue: 1,
          };
          return omit(dProps, batchPrice);
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        algn: 'center',
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
          disabled({ dataSet, record }) {
            const {
              queryParameter: { headers = {} },
            } = dataSet;
            const allowChangeItemFlag =
              headers.allowChangeItemsFlag === 0 && headers.sourceFrom === 'PROJECT';
            return !record.get('taxIncludedFlag') || allowChangeItemFlag;
          },
          required({ dataSet, record }) {
            const { taxChangeFlag = 0 } = dataSet.queryParameter.headers || {};
            return record.get('taxIncludedFlag') && taxChangeFlag === 0;
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
        align: 'center',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderOffer',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        name: 'quotationDetail',
      },
      {
        label: (
          <Tooltip
            title={intl
              .get(`ssrc.inquiryHall.view.message.floatingRatioDetail`)
              .d('报价幅度：最小价格幅度，下次报价至少符合此价格浮动范围！')}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}
          </Tooltip>
        ),
        name: 'quotationRange',
        type: 'number',
        dynamicProps: {
          disabled({ record }) {
            return !record.get('floatType');
          },
          format({ value, record }) {
            let mean = '';
            if (record.get('floatType')) {
              if (record.get('floatType') === 'money') {
                mean = `${value}${intl.get('ssrc.inquiryHall.model.inquiryHall.yuan').d('元')}`;
              } else {
                mean = `${value}%`;
              }
            } else {
              mean = null;
            }
            return mean;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.controlProtocolFlag`).d('控制协议数量'),
        name: 'controlProtocolFlag',
        type: 'boolean',
        align: 'center',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        name: 'prNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        name: 'prLineNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.RFxAttachment`).d('询价单附件'),
        name: 'attachmentUuid',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.filterSupplier`).d('筛选供应商'),
        name: 'filterSupplier',
        type: 'string',
      },
      {
        name: 'rfxHeaderId',
        type: 'string',
      },
      {
        name: 'objectVersionNumber',
        type: 'string',
      },
      {
        name: 'prHeaderId',
        type: 'string',
      },
      {
        name: 'rfxLineItemId',
        type: 'string',
      },
      {
        name: 'creationDate',
        type: 'string',
      },
      {
        name: 'freightIncludedFlag',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'sampleRequestedFlag',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
    ],
    events: {
      load: ({ dataSet }) => {
        const {
          queryParameter: { headers = {} },
        } = dataSet;
        const allowChangeItemsFlag =
          headers.allowChangeItemsFlag === 0 && headers.sourceFrom === 'PROJECT';
        if (allowChangeItemsFlag) {
          dataSet.forEach((record) => {
            Object.assign(record, { selectable: false });
          });
        }
      },
      update: ({ record, name, value }) => {
        if (name === 'ouIdLov') {
          record.set('ouName', value.ouName);
          record.set('invOrganizationId', null);
          record.set('itemId', null);
          record.set('itemName', null);
          record.set('itemCode', null);
          record.set('uomId', null);
          record.set('uomName', null);
          record.set('biUomId', null);
          record.set('biUomName', null);
          record.set('uomConversionRate', null);
        } else if (name === 'invOrganizationIdLov') {
          record.set('invOrganizationName', value.organizationName);
          record.set('invOrganizationId', value.organizationId);
          record.set('itemId', null);
          record.set('itemName', null);
          record.set('itemCode', null);
          record.set('uomId', null);
          record.set('uomName', null);
          record.set('biUomId', null);
          record.set('biUomName', null);
          record.set('uomConversionRate', null);
        } else if (name === 'itemIdLov') {
          record.set('itemId', value.partnerItemId);
          record.set('itemCode', value.itemCode);
          record.set('itemName', value.itemName);
          record.set('uomId', value.orderUomId || value.primaryUomId);
          record.set('uomName', value.orderUomName || value.uomName);
          record.set('biUomId', value.biUomId);
          record.set('biUomName', value.biUomName);
          record.set('uomConversionRate', value.uomConversionRate);
          record.set('drawingNum', value.drawingNum);
          record.set('drawingVersionNumber', value.drawingVersionNumber);
          record.set('commonName', value.commonName);
          record.set('referencePrice', value.referencePrice);
          record.set('specs', value.specifications);
          record.set('supplierItemNumDesc', value.supplierItemNumDesc);
          record.set('itemCategoryId', value.categoryId);
          record.set('itemCategoryName', value.categoryName);
          record.set('model', value.model);
        } else if (name === 'itemCategoryIdLov') {
          record.set('itemCategoryId', value && value.categoryId);
          record.set('itemCategoryName', value.categoryName);
        } else if (name === 'taxIncludedFlag') {
          if (!value) {
            record.set('taxId', value.null);
            record.set('taxRate', value.null);
          }
        } else if (name === 'taxIdLov') {
          record.set('taxId', value.taxId);
          record.set('taxRate', value.taxRate);
        }
      },
    },
    transport: {
      read: () => {
        // const {
        //   queryParameter: { commonProps = {} },
        // } = dataSet;
        const { organizationId, rfxHeaderId, ...others } = queryParams;
        return {
          url: `${Prefix}/${organizationId}/rfx/${rfxHeaderId}/items`,
          method: 'GET',
          data: others,
        };
      },
      destroy: ({ data }) => {
        // const {
        //   queryParameter: { commonProps = {} },
        // } = dataSet;
        const { organizationId } = queryParams;

        return {
          url: `${Prefix}/${organizationId}/rfx/items/items`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

export default ItemLineTableDS;
