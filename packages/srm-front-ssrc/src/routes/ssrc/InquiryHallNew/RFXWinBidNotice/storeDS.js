import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getToken } from '@/utils/utils';
import { numberSeparatorRender, phoneRender } from '@/utils/renderer';

// form
const formDS = ({ tenantId, rfxHeaderId, publicFlag }) => {
  return {
    paging: false,
    fields: [
      // 公告信息
      {
        name: 'sourceNum',
        label: intl.get('ssrc.rfxNotice.model.rfxNotice.bidNum').d('寻源编号'),
      },
      {
        name: 'sourceTitle',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourceTitle').d('寻源标题'),
      },
      {
        name: 'sourceCategoryMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
        transformResponse: (value, record) => {
          return record.secondarySourceCategoryMeaning || value;
        },
      },
      {
        name: 'companyName',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.purchasUnit').d('采购单位'),
      },
      {
        name: 'approvedDate',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourceNoticeDate').d('寻源公告日期'),
        transformResponse: (value) => {
          return value && value.substr(0, 10);
        },
      },
      {
        name: 'sourceAcceptedDate',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.winBidDate').d('中标日期'),
        transformResponse: (value) => {
          return value && value.substr(0, 10);
        },
      },
      {
        name: 'sourceAcceptedTotalAmountMeaning',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.allAcceptMoney').d('总中标金额'),
        type: 'string',
        transformResponse: (value) => {
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'expertNames',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.expertList').d('评审专家名单'),
      },
      // 联系人及联系方式
      {
        label: intl.get(`ssrc.rfxNotice.model.rfxNotice.purName`).d('采购联系人'),
        name: 'purName',
      },
      {
        label: intl.get(`ssrc.rfxNotice.model.rfxNotice.purPhone`).d('联系人电话'),
        name: 'purPhone',
        transformResponse: (value, record) => {
          return phoneRender(record.internationalTelCodeMeaning, record.purPhone);
        },
      },
      {
        label: intl.get(`ssrc.rfxNotice.model.rfxNotice.purEmail`).d('联系人邮箱'),
        name: 'purEmail',
      },
      // 附件
      {
        label: intl.get(`ssrc.rfxNotice.model.rfxNotice.noticeDetailsAttachment`).d('附件'),
        name: 'noticeAttachmentUuid',
        type: 'attachment',
      },
    ],
    transport: {
      read: () => {
        const url = publicFlag
          ? `${SRM_SSRC}/v1/${tenantId}/source-notices/accepted/RFX/BR_ACCEPTED/${rfxHeaderId}/preview/${
              getToken() ? 'outer' : 'public'
            }`
          : `${SRM_SSRC}/v1/${tenantId}/source-notices/accepted/RFX/BR_ACCEPTED/${rfxHeaderId}/preview`;
        return {
          url,
          method: 'GET',
          withCredentials: true,
        };
      },
    },
  };
};

// 物品行
const rfItemLineDS = () => ({
  primaryKey: 'rfxLineItemId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`ssrc.rfxNotice.model.rfxNotice.lineNum`).d('行号'),
      name: 'rfxLineItemNum',
    },
    {
      name: 'itemCode',
      label: intl.get(`ssrc.rfxNotice.model.rfxNotice.itemCode`).d('物料编码'),
    },
    {
      label: intl.get(`ssrc.rfxNotice.model.rfxNotice.itemName`).d('物料名称'),
      name: 'itemName',
    },
    {
      name: 'categoryName',
      label: intl.get(`ssrc.rfxNotice.model.rfxNotice.itemCategory`).d('物料类别'),
    },
    {
      label: intl.get(`ssrc.rfxNotice.model.rfxNotice.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.rfxNotice.model.rfxNotice.quantity`).d('需求数量'),
      name: 'rfxQuantity',
      type: 'number',
    },
    {
      name: 'secondaryUomName',
      label: intl.get(`ssrc.rfxNotice.model.rfxNotice.unit`).d('单位'),
    },
    {
      name: 'uomName',
      label: intl.get(`ssrc.rfxNotice.model.rfxNotice.unit`).d('单位'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get('ssrc.inquiryHall.model.goods.supplierNum').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('ssrc.inquiryHall.model.goods.supplierName').d('供应商名称'),
    },
    {
      name: 'allottedSecondaryQuantity',
      label: intl.get('ssrc.inquiryHall.model.goods.acceptNumber').d('中标数量'),
    },
    {
      name: 'validQuotationQuantityMeaning',
      label: intl.get('ssrc.inquiryHall.model.goods.acceptNumber').d('中标数量'),
    },
    {
      name: 'validQuotationPriceMeaning',
      label: intl.get('ssrc.inquiryHall.model.goods.acceptMoney').d('中标金额'),
    },
    {
      name: 'bidAcceptedRate',
      label: intl.get('ssrc.inquiryHall.model.goods.acceptPercent').d('中标比例'),
    },
    // {
    //   label: intl.get(`ssrc.rfxNotice.model.rfxNotice.neededDate`).d('需求日期'),
    //   name: 'demandDate',
    //   type: 'date',
    //   format: 'YYYY-MM-DD',
    // },
  ],
});

export { formDS, rfItemLineDS };
