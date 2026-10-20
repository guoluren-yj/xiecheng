import { yesOrNoRender } from 'utils/renderer';
import intl from 'srm-front-boot/lib/utils/intl/index.js';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config.js';

import { bucketDirectory } from '@/routes/utils/utils';

// 历史报价
export function historyColumns() {
  // supplierInfo
  const supplierInfo = [
    {
      type: 'number',
      name: 'totalPrice',
      label: intl.get('sslm.outsideProjectSetup.modal.totalPrice').d('响应报价总额'),
    },
    {
      type: 'dateTime',
      name: 'responseDate',
      label: intl.get('sslm.outsideProjectSetup.modal.responseDate').d('响应时间'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.outsideProjectSetup.modal.companyContactId').d('联系人'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.outsideProjectSetup.modal.xiangyuRemark').d('响应说明'),
    },
    {
      type: 'attachment',
      name: 'attachmentUuid',
      isEdit: true,
      readOnly: true,
      viewMode: 'popup',
      funcType: 'link',
      componentType: 'ATTACHMENT',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.outsideProject,
      label: intl.get('sslm.outsideProjectSetup.modal.attachmentUuid').d('响应附件'),
    },
  ];

  // itemInfo
  const itemInfo = [
    {
      type: 'number',
      name: 'quotaQuantity',
      label: intl.get('sslm.outsideProjectSetup.modal.quotaQuantity').d('报价数量'),
    },
    {
      type: 'number',
      name: 'targetPrice',
      label: intl.get('sslm.outsideProjectSetup.modal.targetPrice').d('目标采购单价'),
    },
    {
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      name: 'pricePublicFlag',
      renderer: ({ value }) => yesOrNoRender(value) || '-',
      label: intl.get('sslm.outsideProjectSetup.modal.pricePublicFlag').d('目标采购单价对外公开'),
    },
    {
      name: 'itemDesc',
      label: intl.get('sslm.outsideProjectSetup.modal.itemDesc').d('物料描述'),
    },
    {
      type: 'attachment',
      name: 'pictureUuid',
      isEdit: true,
      readOnly: true,
      viewMode: 'popup',
      funcType: 'link',
      componentType: 'ATTACHMENT',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.outsideProject,
      label: intl.get('sslm.outsideProjectSetup.modal.pictureUuid').d('图纸'),
    },
  ];

  // 行信息
  const lineColumns = [
    {
      name: 'itemName',
      width: 200,
      label: intl.get('sslm.common.item.itemName').d('物料名称'),
    },
    {
      type: 'number',
      width: 120,
      name: 'quotaTotalPrice',
      label: intl.get('sslm.outsideProjectSetup.modal.quotaTotalPrice').d('总价'),
    },
    {
      type: 'number',
      width: 120,
      name: 'quotaQuantity',
      label: intl.get('sslm.outsideProjectSetup.modal.quotaQuantity').d('报价数量'),
    },
    {
      type: 'number',
      name: 'quotaPrice',
      width: 120,
      label: intl.get('sslm.outsideProjectSetup.modal.quotaPrice').d('零件单价'),
    },
    {
      type: 'number',
      width: 120,
      name: 'sumPrice',
      label: intl.get('sslm.outsideProjectSetup.modal.partsTotalPrice').d('零件总价'),
    },
    {
      type: 'number',
      name: 'mold',
      width: 120,
      label: intl.get('sslm.outsideProjectSetup.modal.custCard.mold').d('模具费'),
    },
    {
      type: 'number',
      width: 120,
      name: 'miscellaneous',
      label: intl.get('sslm.outsideProjectSetup.modal.miscellaneous').d('杂费'),
    },
    {
      type: 'number',
      width: 120,
      name: 'transportation',
      label: intl.get('sslm.outsideProjectSetup.modal.transportation').d('运费'),
    },
  ];
  return { supplierInfo, itemInfo, lineColumns };
}
