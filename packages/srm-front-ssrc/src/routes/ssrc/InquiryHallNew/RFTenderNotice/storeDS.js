import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

import { getToken, getQtyName, getUomName } from '@/utils/utils';

// 发布准备
const formDS = () => ({
  paging: false,
  fields: [
    // 基本信息
    {
      name: 'sourceNum',
      label: intl.get('ssrc.rfNotice.model.rfNotice.sourceNum').d('征询书编号'),
    },
    {
      name: 'sourceTitle',
      label: intl.get('ssrc.rfNotice.model.rfNotice.sourceTitle').d('征询书标题'),
    },
    {
      name: 'sourceProjectName',
      label: intl.get(`ssrc.rfNotice.model.rfNotice.sourceProjectName`).d('寻源项目名称'),
    },
    {
      label: intl.get(`ssrc.rfNotice.model.rfNotice.quotationStartTime`).d('征询开始时间'),
      name: 'quotationStartDate',
      type: 'dateTime',
      format: getDateTimeFormat(),
    },
    {
      label: intl.get(`ssrc.rfNotice.model.rfNotice.quotationDeadline`).d('征询截止时间'),
      name: 'quotationEndDate',
      type: 'dateTime',
      format: getDateTimeFormat(),
    },
    // 附件
    {
      name: 'noticeAttachmentUuid',
      type: 'attachment',
    },
  ],
});

const rfFormDS = () => ({
  paging: false,
  fields: [
    {
      name: 'rfContent',
      label: intl.get('ssrc.rfNotice.model.rfNotice.rfContent').d('内容'),
    },
  ],
});

const sourceGroupDS = () => ({
  primaryKey: 'rfMemberId',
  selection: false,
  paging: false,

  fields: [
    {
      name: 'contactName',
      label: intl.get(`ssrc.rfNotice.model.rfNotice.contactName`).d('联系人'),
    },
    {
      name: 'contactPhone',
      label: intl.get(`ssrc.rfNotice.model.rfNotice.contactPhone`).d('手机'),
    },
    {
      name: 'contactMail',
      label: intl.get(`ssrc.rfNotice.model.rfNotice.contactMail`).d('邮箱'),
    },
  ],
});

const rfItemLineDS = ({ rfHeaderId, sourceCategory, tenantId }) => ({
  primaryKey: 'rfLineItemId',
  selection: false,

  fields: [
    {
      label: intl.get(`ssrc.rfNotice.model.rfNotice.lineNum`).d('行号'),
      name: 'rfLineItemNum',
    },
    {
      name: 'itemCode',
      label: intl.get(`ssrc.rfNotice.model.rfNotice.itemCode`).d('物料编码'),
    },
    {
      label: intl.get(`ssrc.rfNotice.model.rfNotice.itemName`).d('物料名称'),
      name: 'itemName',
    },
    {
      name: 'itemCategoryName',
      label: intl.get(`ssrc.rfNotice.model.rfNotice.itemCategory`).d('物料类别'),
    },
    {
      label: intl.get(`ssrc.rfNotice.model.rfNotice.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
      type: 'number',
    },
    {
      name: 'demandQuantity',
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
      label: intl.get(`ssrc.rfNotice.model.rfNotice.neededDate`).d('需求日期'),
      name: 'demandDate',
      type: 'date',
      format: 'YYYY-MM-DD',
    },
  ],
  queryParameter: {
    captcha: !getToken() ? window?.localStorage?.getItem('pub-captcha') : undefined,
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SSRC}/v1/${tenantId}/rf/${getToken() ? 'items' : 'items/public'}`,
        method: 'GET',
        data: {
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RF_NOTICE.LINE_ITEM_${sourceCategory}`,
        },
      };
    },
  },
});

export { formDS, rfFormDS, sourceGroupDS, rfItemLineDS };
