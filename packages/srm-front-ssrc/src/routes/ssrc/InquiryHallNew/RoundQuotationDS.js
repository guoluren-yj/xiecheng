import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

const roundQuotationDS = ({ rfxHeaderId, quotationName }) => ({
  selection: false,
  fields: [
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get('ssrc.common.goodsNum').d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('ssrc.common.goodsDescription').d('物品描述'),
    },
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get('ssrc.common.supplierNum').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssrc.common.supplierName').d('供应商名称'),
    },
    {
      name: 'totalPrice',
      type: 'string',
      label: intl.get('ssrc.common.rowAmount').d('行金额'),
    },
    {
      name: 'validQuotationQuantity',
      type: 'string',
      label: intl.get('ssrc.common.number').d('数量'),
    },
    {
      name: 'validQuotationPrice',
      type: 'string',
      label: intl.get('ssrc.common.unitPrice').d('单价'),
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get('ssrc.common.taxRate').d('税率'),
    },
    {
      name: 'quotationLineStatusMeaning',
      type: 'string',
      label: intl
        .get(`ssrc.expertScoring.view.modal.button.commonQuotationLineStatus`, {
          quotationName,
        })
        .d('{quotationName}状态'),
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${Prefix}/${organizationId}/round-headers/round-quotation`,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.ROUND_QUOTATION_LINE',
        },
        data: { rfxHeaderId },
      };
    },
  },
});

export { roundQuotationDS };
