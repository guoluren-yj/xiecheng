/**
 * 分标段DS配置
 * @date: 2021-02-20
 * @author: lzj<zhijian.li@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */

import intl from 'utils/intl';
// import { Prefix } from '@/utils/globalVariable';

const SectiontableDS = () => ({
  dataToJSON: 'all',
  // autoQuery: true,
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
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.attachement').d('附件'),
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
});

export { SectiontableDS };
