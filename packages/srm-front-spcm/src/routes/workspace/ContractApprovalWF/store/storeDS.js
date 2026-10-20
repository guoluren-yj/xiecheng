import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { isArray } from 'lodash';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const headerFormDS = () => ({
  primaryKey: 'pcHeaderId',
  fields: [
    {
      label: intl.get(`spcm.common.model.common.pcName`).d('协议名称'),
      name: 'pcName',
      transformRequest: (value = '', record) =>
        value && record && `${value}-${record.get('pcNum')}`,
    },
    {
      name: 'pcKindCode',
      // type: 'string',
      label: intl.get(`spcm.common.model.pcKindCode`).d('协议性质'),
      transformResponse: (_, record) => record.pcKindCodeMeaning,
    },
    {
      name: 'pcSourceCode',
      // type: 'string',
      label: intl.get('spcm.common.model.pcSourceCode').d('协议来源'),
      transformResponse: (_, record) => record.pcSourceCodeMeaning,
    },
    {
      label: intl.get(`spcm.common.model.pcType`).d('协议类型'),
      name: 'pcTypeId',
      transformResponse: (_, record) => record.pcTypeName,
    },
    {
      name: 'creationDate',
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
    },
    {
      name: 'createdBy',
      type: 'string',
      label: intl.get(`spcm.common.model.common.createByRealName`).d('创建人'),
      transformResponse: (_, record) => record.createByRealName,
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SPCM}/v1/${organizationId}/pc-compare/approve-header`,
      method: 'GET',
    }),
  },
});

const basicDS = () => ({
  primaryKey: 'pcHeaderId',
  fields: [
    {
      name: 'companyName',
      label: intl.get(`entity.company.name`).d('公司名称'),
      transformResponse: (value, record) => record.companyName,
    },
    {
      name: 'supplierCompanyId',
      label: intl.get(`entity.supplier.tag`).d('供应商'),
      transformResponse: (value, record) => record.supplierCompanyName || record.supplierName,
    },
    {
      name: 'startDateActive',
      label: intl.get(`spcm.common.model.startDateActive`).d('协议起始日期'),
      transformResponse: (_, record) => dateRender(record.startDateActive),
    },
    {
      name: 'endDateActive',
      label: intl.get(`spcm.common.model.endDateActive`).d('协议终止日期'),
      transformResponse: (_, record) => dateRender(record.endDateActive),
    },
    // {
    //   name: 'dateActive',
    //   label: intl.get(`spcm.common.model.dateActive`).d('协议起始日期/协议终止日期'),
    // },
    {
      name: 'remark',
      label: intl.get(`hzero.common.remark`).d('备注'),
    },
  ],
});

const attachmentDS = () => ({
  primaryKey: 'pcHeaderId',
  fields: [
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get(`spcm.common.view.message.comContractAttachment`).d('协议附件'),
    },
    {
      name: 'contractAttachmentUrl',
      type: 'attachment',
      transformRequest: (value) => {
        return isArray(value) ? value[0] : value;
      },
    },
    {
      name: 'purchaserAttachmentUuid',
      type: 'attachment',
      label: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
    },
    {
      name: 'pcHeaderElectronicSignatureAttachment',
      type: 'attachment',
      label: intl.get(`spcm.common.attachment.toBeSigned`).d('待签署附件'),
    },
    // 已签署附件
    {
      name: 'pcHeaderElectronicSignatureAttachmentIsSigned',
      type: 'string',
      label: intl.get(`spcm.common.attachment.Signed`).d('已签署附件'),
    },
  ],
});

export {
  headerFormDS,
  basicDS,
  attachmentDS,
};
