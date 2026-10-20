import { isNil, isEmpty } from 'lodash';

import { SRM_SSRC } from '_utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { getDynamicLabel } from '@/routes/components/utils';

const tenantId = getCurrentOrganizationId();

const list = () => {
  return {
    autoQuery: true,
    dataToJson: 'selected',
    queryFields: [
      {
        name: 'sourceNum',
        label: intl.get(`sodr.orderMaintain.sourceFrom.sourceNum`).d('寻源单号'),
      },
      {
        name: 'companyName',
        label: intl.get(`entity.company.tag`).d('公司'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get(`entity.supplier.tag`).d('供应商'),
      },
      {
        name: 'invOrganizationIds',
        label: intl.get(`sodr.orderMaintain.sourceFrom.invOrganizationIds`).d('库存组织'),
        type: 'object',
        lovCode: 'HPFM.INV_ORG',
        lovPara: { tenantId },
        multiple: true,
        transformRequest: (value) => {
          return isEmpty(value) ? undefined : String(value.map((i) => i.organizationId));
        },
      },
      {
        name: 'purchaseAgentIds',
        label: intl.get(`sodr.orderMaintain.sourceFrom.purchaseAgentId`).d('采购员'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
        lovPara: { tenantId },
        multiple: true,
        transformRequest: (value) => {
          return isEmpty(value) ? undefined : String(value.map((i) => i.purchaseAgentId));
        },
      },
      {
        name: 'rfxCreatedBy',
        label: intl.get(`entity.roles.creator`).d('创建人'),
      },
      {
        name: 'creatDateFrom',
        label: intl.get(`hzero.common.date.creation.from`).d('创建日期从'),
        type: 'date',
        max: 'creatDateTo',
      },
      {
        name: 'creatDateTo',
        label: intl.get(`hzero.common.date.creation.to`).d('创建日期至'),
        type: 'date',
        min: 'creatDateFrom',
      },
      {
        name: 'itemName',
        label: intl.get(`sodr.orderMaintain.sourceFrom.itemdescriptions`).d('物料名称'),
      },
      {
        name: 'pendingFlag',
        label: intl.get(`sodr.orderMaintain.sourceFrom.pendingFlag`).d('是否暂挂'),
        lookupCode: 'HPFM.FLAG',
        defaultValue: 0,
      },
      {
        name: 'resultStatusSet',
        label: intl.get(`sodr.common.model.common.resultStatus`).d('寻源结果状态'),
        lookupCode: 'SSRC.SOURCE_RESULT_STATUS',
        multiple: ',',
        defaultValue: ['VALID'],
      },
    ],
    fields: [
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.sourceNum`).d('寻源单号'),
        name: 'sourceNum',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.itemNum`).d('行号'),
        name: 'itemNum',
      },
      {
        label: intl.get(`entity.supplier.code`).d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.supplierCompanyName`).d('供应方名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.invOrganizationId`).d('库存组织'),
        name: 'invOrganizationName',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.itemCode`).d('物品编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.itemNames`).d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.categoryName`).d('物料分类'),
        name: 'categoryName',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.currencyCode`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.uomName`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.quantity`).d('数量'),
        name: 'secondaryQuantity',
      },
      {
        name: 'uomName',
        width: 100,
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitEnabled = dataSet.getState('doubleUnitEnabled');
            return getDynamicLabel(doubleUnitEnabled, 'uom');
          },
        },
      },
      {
        name: 'quantity',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitEnabled = dataSet.getState('doubleUnitEnabled');
            return getDynamicLabel(doubleUnitEnabled, 'quantity');
          },
        },
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.changeQuantity`).d('本次下单数量'),
        name: 'changeQuantity',
        type: 'number',
        min: 0,
        required: true,
        validator(value, name, record) {
          const { remainQuantity, controlOrderFlag } = record.get([
            'remainQuantity',
            'controlOrderFlag',
          ]);
          if (!isNil(remainQuantity) && remainQuantity < value && controlOrderFlag !== 0) {
            return intl
              .get(`sodr.order.view.message.validator`)
              .d('本次下单数量大于剩余可下单数量');
          }
          if (value <= 0) {
            return intl.get(`sodr.order.view.message.mustExceedZero`).d('本次下单数量必须大于零');
          }
        },
        dynamicProps: {
          precision({ dataSet, record }) {
            const doubleUnitEnabled = dataSet.getState('doubleUnitEnabled');
            return record.get(doubleUnitEnabled ? 'secondaryUomPrecision' : 'uomPrecision');
          },
        },
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.occupationQuantity`).d('已创建订单数量'),
        name: 'occupationQuantity',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.remainQuantity`).d('剩余可下单数量'),
        name: 'remainQuantity',
        width: 200,
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.taxRate`).d('税率(%)'),
        name: 'taxRate',
        width: 100,
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.unitPrice`).d('不含税单价'),
        name: 'unitPrice',
        width: 100,
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.netAmount`).d('不含税金额'),
        name: 'netAmount',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.taxprice`).d('含税单价'),
        name: 'taxprice',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.taxAmount`).d('含税金额'),
        name: 'taxAmount',
      },
      {
        label: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
        name: 'priceBatchQuantity',
        width: 100,
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.validPromisedDate`).d('承诺交货期'),
        type: 'date',
        name: 'validPromisedDate',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderInquiryFlag',
      },
      {
        label: intl.get(`entity.company.tag`).d('公司'),
        name: 'companyName',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.ouName`).d('业务实体'),
        name: 'ouName',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.purOrganizationName`).d('采购组织'),
        name: 'purOrganizationName',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.purchaseAgentName`).d('采购员'),
        name: 'purchaseAgentName',
      },
      {
        label: intl.get(`entity.roles.creator`).d('创建人'),
        name: 'realName',
      },
      {
        label: intl.get(`hzero.common.date.creation`).d('创建时间'),
        name: 'creationDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`sodr.orderMaintain.sourceFrom.prNumAndLineNum`).d('采购申请单号|行号'),
        name: 'prNumAndLineNum',
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'itemRemark',
      },
      {
        name: 'docFlow',
        label: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
      },
    ],
    queryParameter: {
      customizeUnitCode: 'SODR.PURCHASE_SOURCE_LIST.LINE,SODR.PURCHASE_SOURCE_LIST.FILTER',
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SSRC}/v1/${tenantId}/source/result/external-call/result-list`,
          method: 'GET',
        };
      },
    },
    events: {
      update({ record, value, name }) {
        if (name === 'changeQuantity') {
          record.set({ receiptsOrderQuantity: value });
        }
      },
      batchSelect({ records }) {
        records.forEach((i) => {
          const { receiptsOrderQuantity, remainQuantity } = i.get([
            'receiptsOrderQuantity',
            'remainQuantity',
          ]);
          i.set({ receiptsOrderQuantity: receiptsOrderQuantity || remainQuantity });
        });
      },
      batchUnSelect({ records }) {
        records.forEach((i) => i.reset());
      },
    },
  };
};

export { list };
