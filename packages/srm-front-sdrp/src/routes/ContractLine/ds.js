import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDRP } from '@/utils/config';

const tenantId = getCurrentOrganizationId();
export default function ReportDs({ customizeUnitCodes }) {
  return {
    // autoQuery: true,
    // selection: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get('sdrp.contractLine.model.organizationName').d('采购组织'),
        name: 'organizationName',
      },
      {
        label: intl.get('sdrp.contractLine.model.organizationCode').d('采购组织编码'),
        name: 'organizationCode',
      },
      {
        label: intl.get('sdrp.contractLine.model.companyNum').d('公司编码'),
        name: 'companyNum',
      },
      {
        label: intl.get('sdrp.contractLine.model.companyName').d('公司'),
        name: 'companyName',
      },
      {
        label: intl.get('sdrp.contractLine.model.pcNum').d('合同编号'),
        name: 'pcNum',
      },
      {
        label: intl.get('sdrp.contractLine.model.pcName').d('合同名称'),
        name: 'pcName',
      },
      {
        label: intl.get('sdrp.contractLine.model.supplierName').d('供应商名称'),
        name: 'supplierName',
      },
      {
        label: intl.get('sdrp.contractLine.model.supplierNum').d('供应商编码'),
        name: 'supplierNum',
      },
      {
        label: intl.get('sdrp.contractLine.model.createMan').d('创建人'),
        name: 'realName',
      },
      {
        label: intl.get('sdrp.contractLine.model.creationDate').d('协议创建时间'),
        name: 'creationDate',
      },
      {
        label: intl.get('sdrp.contractLine.model.approvedDate').d('审批时间'),
        name: 'approvedDate',
      },
      {
        label: intl.get('sdrp.contractLine.model.confirmedDate').d('确认时间'),
        name: 'confirmedDate',
      },
      {
        label: intl.get('sdrp.contractLine.model.signDate').d('签订日期'),
        name: 'signDate',
      },
      {
        label: intl.get('sdrp.contractLine.model.releaseDate').d('发布时间'),
        name: 'releaseDate',
      },
      {
        label: intl.get('sdrp.contractLine.model.submitDate').d('协议提交时间'),
        name: 'submitDate',
      },
      {
        label: intl.get('sdrp.contractLine.model.archiveDate').d('归档日期'),
        name: 'archiveDate',
      },
      {
        label: intl.get('sdrp.contractLine.model.pcTypeName').d('协议类型'),
        name: 'pcTypeName',
      },
      {
        label: intl.get('sdrp.contractLine.model.currencyCode').d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get('sdrp.contractLine.model.categoryCode').d('品类编码'),
        name: 'categoryCode',
      },
      {
        label: intl.get('sdrp.contractLine.model.categoryName').d('品类名称'),
        name: 'categoryName',
      },
      {
        label: intl.get('sdrp.contractLine.model.contractHeaderAmount').d('合同头金额'),
        name: 'taxIncludeAmount',
      },
      {
        label: intl.get('sdrp.contractLine.model.changeNumber').d('变更次数'),
        name: 'changeNumber',
      },

      {
        label: intl.get('sdrp.contractLine.model.contractStageNumber').d('合同阶段数'),
        name: 'contractStageNumber',
      },
      {
        label: intl.get('sdrp.contractLine.model.contractStatus').d('合同状态'),
        name: 'pcStatusCodeMeaning',
      },
      {
        label: intl.get('sdrp.contractLine.model.contractNature').d('协议性质'),
        name: 'pcKindCodeMeaning',
      },
      {
        label: intl.get('sdrp.contractLine.model.startDate').d('生效日期'),
        name: 'startDateActive',
      },
      {
        label: intl.get('sdrp.contractLine.model.endDate').d('失效日期'),
        name: 'endDateActive',
      },
      {
        label: intl.get('sdrp.contractLine.model.contractSource').d('合同来源'),
        name: 'pcSourceCodeMeaning',
      },
      {
        label: intl.get('sdrp.contractLine.model.contractAmount').d('合同金额'),
        name: 'taxIncludedLineAmount',
      },
      {
        label: intl.get('sdrp.contractLine.model.orderAmount').d('订单金额'),
        name: 'orderAmount',
      },
      {
        label: intl.get('sdrp.contractLine.model.orderLineNums').d('订单行数量'),
        name: 'orderLineNums',
      },
      {
        label: intl.get('sdrp.contractLine.model.acceptanceAmount').d('验收金额'),
        name: 'acceptanceAmount',
      },
      {
        label: intl.get('sdrp.contractLine.model.acceptanceLineNums').d('验收单行数量'),
        name: 'acceptanceLineNums',
      },
      {
        label: intl.get('sdrp.contractLine.model.acceptanceRate').d('验收比例'),
        name: 'acceptanceRate',
      },
      {
        label: intl.get('sdrp.contractLine.model.invoiceAmount').d('发票金额'),
        name: 'invoiceAmount',
      },
      {
        label: intl.get('sdrp.contractLine.model.invoiceLineNums').d('发票单行数量'),
        name: 'invoiceLineNums',
      },
      {
        label: intl.get('sdrp.contractLine.model.paymentAmount').d('付款金额'),
        name: 'paymentAmount',
      },
      {
        label: intl.get('sdrp.contractLine.model.paymentLineNums').d('付款单行数量'),
        name: 'paymentLineNums',
      },
      {
        label: intl.get('sdrp.contractLine.model.itemCode').d('合同物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get('sdrp.contractLine.model.itemName').d('"合同物料名称'),
        name: 'itemName',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_DATA_SDRP}/v1/${tenantId}/contract/report/contract-line`,
          method: 'GET',
          params: {
            ...params,
            tenantId,
            customizeUnitCode: customizeUnitCodes.join(','),
          },
        };
      },
    },
  };
}
