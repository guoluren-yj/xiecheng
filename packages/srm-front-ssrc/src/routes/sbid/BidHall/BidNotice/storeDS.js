import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getToken } from '@/utils/utils';
import { dateRender } from 'utils/renderer';
import { phoneRender } from '@/utils/renderer';

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
        name: 'quotationStartDate',
        type: 'string',
        label: intl
          .get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidStartDate`)
          .d('投标开始时间'),
      },
      {
        name: 'quotationEndDate',
        type: 'string',
        label: intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidEndDate`).d('投标截止时间'),
      },
      {
        name: 'bidOpenDate',
        label: intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidOpenDate`).d('开标时间'),
        type: 'string',
      },
      {
        name: 'bidOpenLocation',
        type: 'string',
        label: intl.get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidOpenSite`).d('开标地点'),
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
        if (!sourceHeaderId) {
          return;
        }

        const url = publicFlag
          ? `${SRM_SSRC}/v1/${tenantId}/source-notices/BID/BR/${sourceHeaderId}/preview${
              getToken() ? '' : '-site'
            }`
          : `${SRM_SSRC}/v1/${tenantId}/source-notices/BID/BR/${sourceHeaderId}/preview`;
        return {
          url,
          method: 'GET',
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
      name: 'demandDate',
      label: intl.get(`ssrc.acceptBidNotice.model.goods.requestedDate`).d('需求日期'),
      width: 120,
      transformResponse: (val) => {
        return val && dateRender(val);
      },
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
  ],
});

export { formDS, rfItemLineDS };
