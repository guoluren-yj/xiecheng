import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';
import { getQtyName, getUomName, getToken } from '@/utils/utils';
import { getQuotationName } from '@/utils/globalVariable';

// form
const formDS = ({ bidFlag }) => {
  return {
    paging: false,
    fields: [
      {
        name: 'sourceNum',
        label: intl.get('ssrc.rfxNotice.model.rfxNotice.bidNum').d('寻源编号'),
      },
      {
        name: 'sourceTitle',
        label: intl.get('ssrc.rfxNotice.model.rfxNotice.bidTitle').d('寻源事项'),
      },
      {
        name: 'companyName',
        label: intl.get(`ssrc.rfxNotice.model.rfxNotice.companyName`).d('采购单位'),
      },
      {
        label: intl
          .get(`ssrc.rfxNotice.model.rfxNotice.commonQuotationEndDate`, {
            quotationName: getQuotationName(bidFlag),
          })
          .d('{quotationName}截止时间'),
        name: 'quotationEndDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStartTime`, {
            quotationName: getQuotationName(bidFlag),
          })
          .d('{quotationName}开始时间'),
        name: 'quotationStartDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
      },
      {
        label: intl.get(`ssrc.rfxNotice.model.rfxNotice.bidOpenLocation`).d('开标地点'),
        name: 'bidOpenLocation',
      },
      {
        label: intl.get(`ssrc.rfxNotice.model.rfxNotice.purName`).d('采购联系人'),
        name: 'purName',
      },
      {
        label: intl.get(`ssrc.rfxNotice.model.rfxNotice.purPhone`).d('联系人电话'),
        name: 'purPhone',
      },
      {
        label: intl.get(`ssrc.rfxNotice.model.rfxNotice.purEmail`).d('联系人邮箱'),
        name: 'purEmail',
      },
      {
        name: 'organizationTypeMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.organizationType`).d('境内外关系'),
      },
      {
        name: 'industryData',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.industryData`).d('行业类型'),
        // lovCode: 'HPFM.INDUSTRY_FIRST',
        transformResponse: (value = null) => {
          if (isEmpty(value)) {
            return null;
          }

          let result = [];
          const parseValue = value ? JSON.parse(value) : [];
          parseValue.forEach((item = {}) => {
            const { industryName = null } = item;
            result.push(industryName);
          });
          result = result.join(',');
          return result;
        },
      },
      {
        name: 'industryCategoryData',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.industryCategoryData`).d('主营品类'),
        // lovCode: 'HPFM.INDUSTRY.CATEGORY',
        transformResponse: (value = null) => {
          if (isEmpty(value)) {
            return null;
          }

          let result = [];
          const parseValue = value ? JSON.parse(value) : [];
          parseValue.forEach((item = {}) => {
            const { categoryName = null } = item;
            result.push(categoryName);
          });
          result = result.join(',');
          return result;
        },
      },
      {
        label: intl.get(`ssrc.rfxNotice.model.rfxNotice.noticeDetailsAttachment`).d('附件'),
        name: 'noticeAttachmentUuid',
        type: 'attachment',
        isPublic: true,
      },
      {
        name: 'approvedDate',
        type: 'string',
      },
    ],
  };
};

// 物品行
const rfItemLineDS = ({ rfxHeaderId, tenantId, sourceKey }) => ({
  primaryKey: 'rfxLineItemId',
  selection: false,
  autoQuery: false,

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
      name: 'itemCategoryName',
      label: intl.get(`ssrc.rfxNotice.model.rfxNotice.itemCategory`).d('物料类别'),
    },
    {
      label: intl.get(`ssrc.rfNotice.model.rfNotice.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
      type: 'number',
    },
    {
      name: 'rfxQuantity',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => getQtyName(dataSet.getState('doubleUnitFlag')),
      },
    },
    {
      name: 'secondaryUomName',
      label: intl.get(`ssrc.rfNotice.model.rfNotice.unit`).d('单位'),
    },
    {
      name: 'uomName',
      dynamicProps: {
        label: ({ dataSet }) => getUomName(dataSet.getState('doubleUnitFlag')),
      },
    },
    {
      label: intl.get(`ssrc.rfxNotice.model.rfxNotice.neededDate`).d('需求日期'),
      name: 'demandDate',
      type: 'date',
      format: 'YYYY-MM-DD',
    },
  ],
  transport: {
    read: () => {
      const url = getToken()
        ? `${SRM_SSRC}/v1/${tenantId}/rfx/items/preview`
        : `${SRM_SSRC}/v1/${tenantId}/rfx/items/public`;
      return {
        url,
        method: 'GET',
        data: {
          rfxHeaderId,
          customizeTenantId: tenantId,
          captcha: !getToken() ? window?.localStorage?.getItem('pub-captcha') : undefined,
          customizeUnitCode: `SSRC.${sourceKey}_HALL_RFX_NOTICE.LINE_ITEM_RFX`,
        },
      };
    },
  },
});

export { formDS, rfItemLineDS };
