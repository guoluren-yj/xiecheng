import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { getPrecision } from '@/routes/components/utils';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';
import { DATETIME_MAX } from 'utils/constants';

import moment from 'moment';

const organizationId = getCurrentOrganizationId();
const common = 'sodr.common.model.common';

const purchaseAgreement = () => ({
  cacheSelection: true,
  primaryKey: 'pcSubjectId',
  queryFields: [
    {
      name: 'pcNum',
      label: intl.get('spcm.orderMaintenanceEntry.model.common.orderNumber').d('采购协议编号'),
      transformResponse: (value) => value?.value,
    },
    {
      name: 'pcName',
      label: intl.get('sodr.orderMaintain.sourceFrom.pcName').d('采购协议名称'),
    },
    {
      name: 'supplierCompanyId',
      type: 'object',
      lovCode: 'SPCM.USER_AUTH.SUPPLIER',
      label: intl.get('sodr.orderMaintain.sourceFrom.supplierCompanyId').d('协议对象'),
      lovPara: { tenantId: organizationId },
      transformResponse: (value) =>
        value
          ? {
              supplierCompanyId: value.value,
              supplierCompanyName: value.meaning,
              supplierCompanyNum: value.code,
            }
          : undefined,
      transformRequest: (value) => value?.supplierCompanyId,
    },
    {
      name: 'companyId',
      type: 'object',
      label: intl.get(`entity.company.tag`).d('公司'),
      lovCode: 'SPCM.USER_AUTH.COMPANY',
      lovPara: { tenantId: organizationId },
      transformResponse: (value) =>
        value
          ? {
              companyId: value.value,
              companyName: value.meaning,
              companyNum: value.code,
            }
          : undefined,
      transformRequest: (value) => value?.companyId,
    },
    {
      name: 'pcKindCode',
      label: intl.get('sodr.orderMaintain.sourceFrom.pcKindCode').d('协议性质'),
      lookupCode: 'SPCM.CONTRACT.KIND',
    },
    {
      name: 'pcTypeId',
      type: 'object',
      label: intl.get('sodr.orderMaintain.sourceFrom.pcType').d('协议类型'),
      lovCode: 'SPCM.PC_TYPE',
      computedProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            companyId: record.get('companyId')?.companyId,
          };
        },
      },
      transformRequest: (value) => value?.pcTypeId,
    },
    {
      name: 'mainContractId',
      type: 'object',
      lovCode: 'SPCM.CONTRACT',
      label: intl.get('sodr.orderMaintain.sourceFrom.pcHeaderId').d('主协议编码'),
      transformRequest: (value) => value?.pcHeaderId,
    },
    {
      name: 'createdByName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
    {
      name: 'creationDateFrom',
      type: 'date',
      label: intl.get('hzero.common.date.creation.from').d('创建日期从'),
      max: 'creationDateTo',
    },
    {
      name: 'creationDateTo',
      type: 'date',
      label: intl.get('hzero.common.date.creation.to').d('创建日期至'),
      min: 'creationDateFrom',
      transformRequest: (value) => {
        return value && moment(value).format(DATETIME_MAX);
      },
    },
    {
      name: 'itemName',
      label: intl.get('sodr.orderMaintain.sourceFrom.itemName').d('物品'),
    },
    {
      name: 'pendingFlag',
      label: intl.get(`sodr.orderMaintain.sourceFrom.pendingFlag`).d('是否暂挂'),
      defaultValue: '0',
      lookupCode: 'HPFM.FLAG',
    },
  ],
  fields: [
    {
      name: 'pcNum',
      label: intl.get('spcm.orderMaintenanceEntry.model.common.pcNum').d('采购协议编号'),
    },
    {
      name: 'lineNum',
      label: intl.get('sodr.orderMaintenanceEntry.model.common.lineNum').d('行号'),
    },
    {
      name: 'pcName',
      label: intl.get('sodr.orderMaintenanceEntry.model.common.pcName').d('采购协议名称'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get(`${common}.supplierCompanyNum`).d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`${common}.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'createdByName',
      label: intl.get(`${common}.createdByName`).d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get(`${common}.creationDate`).d('创建日期'),
    },
    {
      name: 'itemCode',
      label: intl.get(`${common}.itemCode`).d('物品编码'),
    },
    {
      name: 'itemName',
      label: intl.get(`${common}.itemName`).d('物品名称'),
    },
    {
      name: 'categoryName',
      label: intl.get(`${common}.categoryCode`).d('物料分类'),
    },
    {
      name: 'currencyCode',
      label: intl.get(`${common}.currencyCode`).d('币种'),
    },
    {
      name: 'uomName',
      label: intl.get(`${common}.uomCode`).d('单位'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`${common}.quantitys`).d('数量'),
    },
    {
      name: 'receiptsOrderQuantity',
      type: 'number',
      label: intl.get(`${common}.receiptsOrderQuantity`).d('本次下单数量'),
      transformResponse: (value, object) => {
        return value || object?.residueOrderQuantity;
      },
      computedProps: {
        precision: ({ record }) => getPrecision(record.get('uomPrecision')),
        required: ({ record }) => record.isSelected,
        max: ({ record }) =>
          record.get('orderQuantityFlag') === 1 && record.get('residueOrderQuantity')
            ? record.get('residueOrderQuantity')
            : Infinity,
      },
      validator: (value) => {
        if (!value || value <= 0) {
          return intl.get(`sodr.order.view.message.mustExceedZero`).d('本次下单数量必须大于零');
        }
      },
    },
    {
      name: 'chanageOrderQuantity',
      type: 'number',
      label: intl.get(`${common}.chanageOrderQuantity`).d('已创建订单数量'),
    },
    {
      name: 'residueOrderQuantity',
      type: 'number',
      label: intl.get(`${common}.residueOrderQuantity`).d('剩余可下单数量'),
    },
    {
      name: 'taxRate',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`${common}.taxRates`).d('税率(%)'),
    },
    {
      name: 'ladderPrice',
      label: intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格'),
    },
    {
      name: 'unitPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`${common}.unitPrice`).d('不含税单价'),
      computedProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'lineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`${common}.lineAmount`).d('不含税金额'),
      computedProps: {
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'enteredTaxIncludedPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`${common}.enteredTaxIncludedPrice`).d('含税单价'),
    },
    {
      name: 'taxIncludedLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`${common}.taxIncludedLineAmount`).d('含税金额'),
      computedProps: {
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'unitPriceBatch',
      label: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
      type: 'number',
    },
    {
      name: 'deliverDate',
      type: 'date',
      label: intl.get(`${common}.deliverDate`).d('交付日期'),
    },
    {
      name: 'companyName',
      label: intl.get(`${common}.companyName`).d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get(`${common}.ouName`).d('业务实体'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get(`${common}.purchaseOrgName`).d('采购组织'),
    },
    {
      name: 'agentName',
      label: intl.get(`${common}.agentName`).d('采购员'),
    },
    {
      name: 'mainPcNum',
      label: intl.get(`${common}.mainPcNum`).d('主协议编号'),
    },
    {
      name: 'remark',
      label: intl.get(`${common}.remarks`).d('备注'),
    },
  ],
  queryParameter: { customizeUnitCode: 'SODR.REFERENCE_PURCHASE_AGREEMENT.LINE' },
  transport: {
    read() {
      return {
        // url: `${SRM_SPUC}/v1/${organizationId}/po-header/from-contract/line`,
        url: `${SRM_SPCM}/v1/${organizationId}/sync-contract/po-header/from-contract/line`,
        method: 'GET',
      };
    },
  },
  events: {
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

export { purchaseAgreement };
