/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import { bucketDirectory } from '@/routes/utils/utils';

export const getAttachmentDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get('sslm.supplierDetail.model.supplierDetail.attachmentType').d('附件类型'),
      name: 'attachmentTypeMeaning',
    },
    {
      label: intl.get('sslm.supplierDetail.model.supplierDetail.description').d('附件描述'),
      name: 'description',
    },
    {
      label: intl.get('sslm.commonApplication.model.supplierAttachment.purchaser').d('采购方附件'),
      name: 'purchaserAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.supplierMaster,
    },
    {
      label: intl.get('sslm.commonApplication.view.message.tab.supplierAttachment').d('供应商附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.supplierMaster,
    },
    {
      label: intl.get('sslm.supplierDetail.model.supplierDetail.endDate').d('文件到期日'),
      name: 'endDate',
    },
    {
      label: intl.get('sslm.supplierInform.model.attachment.longEffective').d('是否长期有效'),
      name: 'longEffectiveFlag',
    },
    {
      label: intl.get('sslm.supplierDetail.model.supplierDetail.addressDetail').d('最后上传日期'),
      name: 'uploadDate',
      type: 'date',
    },
    {
      name: 'freezeControlFlag',
      label: intl.get('sslm.supplierDetail.model.supplierInform.purchaseFrozen').d('记账冻结'),
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
    },
  ],
});
