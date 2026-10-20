import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isArray } from 'lodash';

const organizationId = getCurrentOrganizationId();

/**
 * 采购方附件
 * @param {*} headerInfo
 * @returns
 */
export const purchaserAttachmentDS = (headerInfo = {}, headerFormDs) => ({
  autoQuery: false,
  forceValidate: true,
  data: [headerInfo],
  fields: [
    {
      name: 'purchaserAttachmentUuid',
      type: 'attachment',
      label: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
    },
  ],
  events: {
    update: ({ value, name }) => {
      headerFormDs.current.set(name, value);
    },
  },
});

/**
 * 归档文件
 * @param {*} headerInfo
 * @returns
 */
export const archiveAttachmentDS = (headerInfo = {}, headerFormDs) => ({
  autoQuery: false,
  forceValidate: true,
  data: [headerInfo],
  fields: [
    {
      name: 'archiveAttachmentUuid',
      type: 'string',
      label: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
    },
  ],
  events: {
    update: ({ value, name }) => {
      headerFormDs.current.set(name, value);
    },
  },
  transport: {
    submit: () => {
      const { pcHeaderId, archiveAttachmentUuid } = headerInfo;
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/archive-uuid?archiveAttachmentUuid=${archiveAttachmentUuid}`,
        method: 'PUT',
      };
    },
  },
});

/**
 * 电子签章
 * @param {*} headerInfo
 * @returns
 */
export const esignAttachmentDS = (headerInfo = {}, headerFormDs) => ({
  autoQuery: false,
  forceValidate: true,
  data: [headerInfo],
  fields: [
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
  events: {
    update: ({ value, name }) => {
      headerFormDs.current.set(name, value);
    },
  },
});

/**
 * 附件
 * @param {*} headerInfo
 * @param {*} headerFormDs
 * @returns
 */
export const customAttachmentDS = (headerInfo = {}, headerFormDs) => ({
  autoQuery: false,
  forceValidate: true,
  data: [headerInfo],
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
      name: 'supplierAttachmentUuid',
      type: 'attachment',
      label: intl.get(`entity.attachment.type.supplier.spcm`).d('供应商附件'),
    },
  ],
  events: {
    update: ({ value, name }) => {
      headerFormDs.current.set(name, value);
    },
  },
});

// 线下双方签章文件
export const offlineMutualSignDS = (headerInfo = {}, headerFormDs) => ({
  autoQuery: false,
  forceValidate: true,
  data: [headerInfo],
  fields: [
    {
      name: 'offlineMutualSignUuid',
      type: 'attachment',
      label: intl.get(`spcm.common.model.offlineMutualSignUuid`).d('线下双方签章文件'),
    },
  ],
  events: {
    update: ({ value, name }) => {
      headerFormDs.current.set(name, value);
    },
  },
});
