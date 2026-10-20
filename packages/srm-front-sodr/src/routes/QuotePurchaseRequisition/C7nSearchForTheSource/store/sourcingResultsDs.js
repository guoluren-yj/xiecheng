import { isArray } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

const organizationId = getCurrentOrganizationId();

const sourcingResults = () => ({
  cacheSelection: true,
  primaryKey: 'resultId',
  queryFields: [
    {
      name: 'sourceNum',
      label: intl.get(`sodr.orderMaintain.sourceFrom.sourceNum`).d('寻源单号'),
      transformResponse: (value) => value?.value,
    },
    {
      name: 'companyName',
      label: intl.get(`entity.company.tag`).d('公司'),
      transformResponse: (value) => value?.meaning,
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`entity.supplier.tag`).d('供应商'),
      transformResponse: (value) => value?.meaning,
    },
    {
      name: 'purchaseAgentIds',
      type: 'object',
      label: intl.get(`sodr.orderMaintain.sourceFrom.purchaseAgentId`).d('采购员'),
      lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
      multiple: true,
      lovPara: { tenantId: organizationId },
      transformResponse: (value) =>
        value
          ? [
              {
                purchaseAgentId: value.value,
                purchaseAgentCode: value.code,
                purchaseAgentName: value.meaning,
              },
            ]
          : [],
      transformRequest: (value) => {
        return isArray(value) ? String(value.map((i) => i.purchaseAgentId)) : value;
      },
    },
    {
      name: 'rfxCreatedBy',
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'creatDateFrom',
      type: 'date',
      label: intl.get(`hzero.common.date.creation.from`).d('创建日期从'),
      max: 'creatDateTo',
    },
    {
      name: 'creatDateTo',
      type: 'date',
      label: intl.get(`hzero.common.date.creation.to`).d('创建日期至'),
      min: 'creatDateFrom',
    },
    {
      name: 'itemName',
      label: intl.get(`sodr.orderMaintain.sourceFrom.itemdescriptions`).d('物料名称'),
    },
    {
      name: 'invOrganizationIds',
      type: 'object',
      label: intl.get(`sodr.orderMaintain.sourceFrom.invOrganizationIds`).d('库存组织'),
      lovCode: 'HPFM.INV_ORG',
      multiple: true,
      lovPara: { tenantId: organizationId },
      transformResponse: (value) =>
        value
          ? [
              {
                organizationId: value?.value,
                organizationCode: value?.code,
                organizationName: value?.meaning,
              },
            ]
          : [],
      transformRequest: (value) => {
        return isArray(value) ? String(value.map((i) => i.organizationId)) : value;
      },
    },
    {
      name: 'pendingFlag',
      label: intl.get(`sodr.orderMaintain.sourceFrom.pendingFlag`).d('是否暂挂'),
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
    },
    {
      name: 'resultStatusSet',
      label: intl.get(`sodr.common.model.common.resultStatus`).d('寻源结果状态'),
      lookupCode: 'SSRC.SOURCE_RESULT_STATUS',
      multiple: ',',
      defaultValue: 'VALID',
    },
  ],
  fields: [
    {
      name: 'sourceNum',
      label: intl.get(`sodr.orderMaintain.sourceFrom.sourceNum`).d('寻源单号'),
    },
    {
      name: 'itemNum',
      label: intl.get(`sodr.orderMaintain.sourceFrom.itemNum`).d('行号'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get(`entity.supplier.code`).d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`sodr.orderMaintain.sourceFrom.supplierCompanyName`).d('供应方名称'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get(`sodr.orderMaintain.sourceFrom.invOrganizationId`).d('库存组织'),
    },
    {
      name: 'itemCode',
      label: intl.get(`sodr.orderMaintain.sourceFrom.itemCode`).d('物品编码'),
    },
    {
      name: 'itemName',
      label: intl.get(`sodr.orderMaintain.sourceFrom.itemNames`).d('物料名称'),
    },
    {
      name: 'categoryName',
      label: intl.get(`sodr.orderMaintain.sourceFrom.categoryName`).d('物料分类'),
    },
    {
      name: 'currencyCode',
      label: intl.get(`sodr.orderMaintain.sourceFrom.currencyCode`).d('币种'),
    },
    {
      name: 'uomName',
      label: intl.get(`sodr.orderMaintain.sourceFrom.uomName`).d('单位'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`sodr.orderMaintain.sourceFrom.quantity`).d('数量'),
    },
    {
      name: 'changeQuantity',
      type: 'number',
      label: intl.get(`sodr.orderMaintain.sourceFrom.changeQuantity`).d('本次下单数量'),
      max: 'remainQuantity',
      computedProps: {
        precision: ({ record }) => record.get('uomPrecision'),
        required: ({ record }) => record.isSelected,
      },
      validator: (value) => {
        if (!value || value <= 0) {
          return intl.get(`sodr.order.view.message.mustExceedZero`).d('本次下单数量必须大于零');
        }
      },
    },
    {
      name: 'occupationQuantity',
      type: 'number',
      label: intl.get(`sodr.orderMaintain.sourceFrom.occupationQuantity`).d('已创建订单数量'),
    },
    {
      name: 'remainQuantity',
      type: 'number',
      label: intl.get(`sodr.orderMaintain.sourceFrom.remainQuantity`).d('剩余可下单数量'),
    },
    {
      name: 'taxRate',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`sodr.orderMaintain.sourceFrom.taxRate`).d('税率(%)'),
    },
    {
      name: 'unitPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`sodr.orderMaintain.sourceFrom.unitPrice`).d('不含税单价'),
      computedProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get(`sodr.orderMaintain.sourceFrom.netAmount`).d('不含税金额'),
      computedProps: {
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'taxprice',
      type: 'number',
      label: intl.get(`sodr.orderMaintain.sourceFrom.taxprice`).d('含税单价'),
      computedProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get(`sodr.orderMaintain.sourceFrom.taxAmount`).d('含税金额'),
      computedProps: {
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'priceBatchQuantity',
      type: 'number',
      label: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'validPromisedDate',
      type: 'date',
      label: intl.get(`sodr.orderMaintain.sourceFrom.validPromisedDate`).d('承诺交货期'),
    },
    {
      name: 'ladderInquiryFlag',
      label: intl.get(`sodr.orderMaintain.sourceFrom.ladderInquiryFlag`).d('阶梯报价'),
    },
    {
      name: 'companyName',
      label: intl.get(`entity.company.tag`).d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get(`sodr.orderMaintain.sourceFrom.ouName`).d('业务实体'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get(`sodr.orderMaintain.sourceFrom.purOrganizationName`).d('采购组织'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get(`sodr.orderMaintain.sourceFrom.purchaseAgentName`).d('采购员'),
    },
    {
      name: 'realName',
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
    },
    {
      name: 'prNumAndLineNum',
      label: intl.get(`sodr.orderMaintain.sourceFrom.prNumAndLineNum`).d('采购申请单号|行号'),
    },
    {
      name: 'itemRemark',
      label: intl.get(`hzero.common.remark`).d('备注'),
    },
  ],
  queryParameter: { customizeUnitCode: 'SODR.PURCHASE_SOURCE_LIST.LINE' },
  transport: {
    read() {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/source/result/external-call/result-list`,
        method: 'GET',
      };
    },
  },
  events: {
    load({ dataSet }) {
      dataSet.forEach((i) =>
        i.init({ receiptsOrderQuantity: i.get('receiptsOrderQuantity') || i.get('remainQuantity') })
      );
    },
    update({ name, value, record }) {
      if (name === 'changeQuantity') {
        record.set({ receiptsOrderQuantity: value });
      }
    },
    unSelect({ record }) {
      record.reset();
    },
    unSelectAll({ dataSet }) {
      dataSet.forEach((i) => {
        i.reset();
      });
    },
  },
});

export { sourcingResults };
