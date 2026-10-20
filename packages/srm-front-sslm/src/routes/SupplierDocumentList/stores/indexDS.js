/*
 * @Date: 2021-12-13 17:39:20
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const unitCodeList = {
  attachment: [
    'SSLM.SUPPLIER_DOCUMENT.LIST.SEARCH_BAR',
    'SSLM.SUPPLIER_DOCUMENT.LIST.SEARCH_BAR_TABLE',
  ],
  auth: [
    'SSLM.SUPPLIER_DOCUMENT.LIST.APTITUDE_SEARCH',
    'SSLM.SUPPLIER_DOCUMENT.LIST.APTITUDE_LIST',
  ],
  licence: [
    'SSLM.SUPPLIER_DOCUMENT.LIST.REGISTER_SEARCH',
    'SSLM.SUPPLIER_DOCUMENT.LIST.REGISTER_LIST',
  ],
};

const getIndexDS = ({ type }) => ({
  dataToJSON: 'selected',
  pageSize: 20,
  cacheSelection: true,
  primaryKey: 'investgHeaderIdType',
  fields: [
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.supplierNum').d('供应商编码'),
      name: 'supplierNum',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.supplierName').d('供应商名称'),
      name: 'supplierName',
    },
    {
      name: 'dimensionCodeMeaning',
      label: intl.get('sslm.common.model.field.lifecycleDimension').d('生命周期管控维度'),
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.stageCode').d('生命阶段'),
      name: 'stageDescription',
    },
    {
      label: intl.get('sslm.supplierDoc.model.supplierDoc.companyName').d('公司'),
      name: 'companyName',
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
    {
      label: intl
        .get('sslm.supplierDoc.model.supplierDoc.freezeControlFlag')
        .d('供应商记账冻结管控'),
      name: 'freezeControlFlagMeaning',
    },
    {
      label: intl.get('sslm.supplierInform.model.otherInform.purchaseAgent').d('采购员'),
      name: 'purchaseAgentNames',
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/investigate-attachments-report/new`,
      method: 'GET',
      data: {
        ...data,
        type,
        customizeUnitCode: unitCodeList[type]?.join(','),
      },
    }),
  },
});

export { getIndexDS };
