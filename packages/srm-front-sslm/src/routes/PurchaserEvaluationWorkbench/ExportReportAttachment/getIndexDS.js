/*
 * @Date: 2024-10-17 15:47:39
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getIndexDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'contentName',
      required: true,
      label: intl.get('sslm.common.model.field.customizeFolderName').d('自定义文件夹名'),
    },
    {
      name: 'exportType',
      disabled: true,
      defaultValue: 'zip',
      label: intl.get('sslm.common.model.field.exportType').d('导出类型'),
    },
    {
      name: 'maxCapacity',
      disabled: true,
      defaultValue: '1GB',
      label: intl.get('sslm.common.model.field.maximumFileCapacity').d('文件最大容量'),
    },
    {
      name: 'isAsync',
      disabled: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: 1,
      label: intl.get('sslm.common.model.field.asynchronous').d('异步'),
    },
    {
      name: 'attachmentTypes',
      lookupCode: 'SSLM.REPORT_ATTACHMENT_FIELD_NAME',
      defaultValue: [
        'sup_self_eval',
        'collect_resp',
        'review_result',
        'in_purchaser',
        'exter_purchaser',
        'exter_sup',
      ],
      multiple: true,
    },
    {
      name: 'downloadDimension',
      lookupCode: 'SSLM.REPORT_DOWNLOAD_DIMENSION',
      defaultValue: 'REPORT',
    },
  ],
});
