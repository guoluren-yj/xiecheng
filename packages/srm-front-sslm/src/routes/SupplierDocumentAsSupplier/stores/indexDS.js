/*
 * @Date: 2023-02-02 17:39:20
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const unitCodeList = [
  'SSLM.DOCUMENT_AS_SUPPLIER.LIST.TABLE',
  'SSLM.DOCUMENT_AS_SUPPLIER.LIST.SEARCH_BAR',
];

const getIndexDS = () => ({
  dataToJSON: 'selected',
  pageSize: 20,
  cacheSelection: true,
  primaryKey: 'investgHeaderIdType',
  fields: [
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.customerNum').d('客户编码'),
      name: 'companyNum',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.customerName').d('客户名称'),
      name: 'companyName',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.companyNum').d('公司编码'),
      name: 'supplierNum',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.companyName').d('公司名称'),
      name: 'supplierName',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.sourceDocument').d('文档来源'),
      name: 'typeMeaning',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.attachmentType').d('附件类型'),
      name: 'attachmentType',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.attachmentDesc').d('附件描述'),
      name: 'attachmentDesc',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.expirationDate').d('文件到期日'),
      name: 'expirationDate',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.remnantDays').d('剩余有效期'),
      name: 'remnantDays',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.lastUploadDate').d('最后上传时间'),
      name: 'lastUploadDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.viewAttachment').d('查看附件'),
      name: 'supplierAttachmentUuid',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.uploadFlag').d('是否上传'),
      name: 'uploadFlagMeaning',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.ynFlag').d('有效附件'),
      name: 'ynFlagMeaning',
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/investigate-attachments-report/supplier`,
      method: 'GET',
      data: { ...data, customizeUnitCode: unitCodeList.join(',') },
    }),
  },
});

export { getIndexDS };
