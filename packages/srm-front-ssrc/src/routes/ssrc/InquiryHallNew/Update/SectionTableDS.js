/**
 * 分标段DS配置
 * @date: 2021-02-20
 * @author: lzj<zhijian.li@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */

import intl from 'utils/intl';
// import { Prefix } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

const tableDS = (data) => ({
  dataToJSON: 'all',
  // autoQuery: true,
  data,
  selection: false,
  pageSize: 500,
  fields: [
    {
      name: 'sectionCode',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionCode').d('标段编码'),
    },
    {
      name: 'sectionName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionName').d('标段名称'),
    },
    {
      name: 'viewItemDetail',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.viewItemDetail').d('查看物料'),
    },
    {
      name: 'sectionRemark',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.remark').d('备注'),
    },
    {
      name: 'sectionAttachmentUuid',
      type: 'attachment',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.attachement').d('附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxitem',
      readOnly: true,
      ...ChunkUploadProps,
    },
    {
      name: 'createSourceFlag',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.createRFXFlag').d('创建询价单'),
      type: 'number',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'projectItemCount',
      type: 'number',
    },
    {
      name: 'sectionEstimatedAmount',
      label: intl
        .get('ssrc.inquiryHall.model.inquiryHall.sectionEstimatedAmount')
        .d('标段预估金额'),
      type: 'number',
      disabled: true,
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.status === 'sync' || record.status === 'ready') {
          Object.assign(record, { status: 'update' });
        }
      });
    },
  },
});

export { tableDS };
