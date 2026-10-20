import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getToken } from '@/utils/utils';
import { numberSeparatorRender, phoneRender } from '@/utils/renderer';

// form
const formDS = ({ tenantId, sourceHeaderId, publicFlag }) => {
  return {
    paging: false,
    fields: [
      // 公告信息
      {
        name: 'bidNum',
        label: intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.bidNum').d('招标编号'),
      },
      {
        name: 'bidTitle',
        label: intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.bidMatter').d('招标事项'),
      },
      {
        name: 'bidTypeMeaning',
        label: intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.bidType').d('招标类别'),
      },
      {
        name: 'companyName',
        label: intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.purchasUnit').d('采购单位'),
      },
      {
        name: 'approvedDate',
        type: 'string',
        label: intl
          .get('ssrc.acceptBidNotice.model.acceptBidNotice.bidNoticeDate')
          .d('招标公告日期'),
        transformResponse: (value) => {
          return value.substr(0, 10);
        },
      },
      {
        name: 'sourceAcceptedDate',
        type: 'string',
        label: intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.winBidDate').d('中标日期'),
        transformResponse: (value) => {
          return value.substr(0, 10);
        },
      },
      {
        name: 'sourceAcceptedTotalAmount',
        label: intl
          .get('ssrc.acceptBidNotice.model.acceptBidNotice.allAcceptMoney')
          .d('总中标金额'),
        type: 'string',
        transformResponse: (value) => {
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'expertNames',
        label: intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.expertList').d('评审专家名单'),
      },
      // 联系人及联系方式
      {
        label: intl
          .get('ssrc.acceptBidNotice.model.acceptBidNotice.purchaseContact')
          .d('采购联系人'),
        name: 'purName',
      },
      {
        label: intl.get('ssrc.acceptBidNotice.model.acceptBidNotice.contactTel').d('联系人电话'),
        name: 'purPhone',
        transformResponse: (value, record) => {
          return phoneRender(record.internationalTelCodeMeaning, record.purPhone);
        },
      },
      {
        label: intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.contactEmail`).d('联系人邮箱'),
        name: 'purEmail',
      },
      // 附件
      {
        label: intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.attachment`).d('附件'),
        name: 'noticeAttachmentUuid',
        type: 'attachment',
      },
    ],
    queryParameter: {
      captcha: !getToken() ? window?.localStorage?.getItem('pub-captcha') : undefined,
    },
    transport: {
      read: () => {
        const url = publicFlag
          ? `${SRM_SSRC}/v1/${tenantId}/source-notices/accepted/BID/BR_ACCEPTED/${sourceHeaderId}/preview/${
              getToken() ? 'outer' : 'public'
            }`
          : `${SRM_SSRC}/v1/${tenantId}/source-notices/accepted/BID/BR_ACCEPTED/${sourceHeaderId}/preview`;
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
  primaryKey: 'bidLineItemId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`ssrc.acceptBidNotice.model.goods.num`).d('行号'),
      name: 'bidLineItemNum',
    },
    {
      name: 'itemCode',
      label: intl.get(`ssrc.acceptBidNotice.model.goods.itemLinecode`).d('物料编码'),
    },
    {
      label: intl.get('ssrc.acceptBidNotice.model.goods.description').d('物品描述'),
      name: 'itemName',
    },
    {
      name: 'categoryName',
      label: intl.get('ssrc.acceptBidNotice.model.goods.classify').d('物品分类'),
    },
    {
      label: intl.get('ssrc.acceptBidNotice.model.goods.quantityRequired').d('需求数量'),
      name: 'bidQuantity',
      type: 'number',
    },
    {
      name: 'uomName',
      label: intl.get('ssrc.acceptBidNotice.model.goods.unit').d('单位'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get('ssrc.acceptBidNotice.model.goods.supplierNum').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('ssrc.acceptBidNotice.model.goods.supplierName').d('供应商名称'),
    },
    {
      name: 'validQuotationQuantity',
      label: intl.get('ssrc.acceptBidNotice.model.goods.acceptNumber').d('中标数量'),
      transformResponse: (val, record) => {
        return val === null ? record.validQuotationQuantityMeaning : val;
      },
    },
    {
      name: 'validQuotationPrice',
      label: intl.get('ssrc.acceptBidNotice.model.goods.acceptMoney').d('中标金额'),
    },
    {
      name: 'bidAcceptedRate',
      label: intl.get('ssrc.acceptBidNotice.model.goods.acceptPercent').d('中标比例'),
    },
  ],
});

export { formDS, rfItemLineDS };
