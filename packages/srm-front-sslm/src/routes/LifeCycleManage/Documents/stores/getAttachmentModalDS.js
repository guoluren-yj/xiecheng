/*
 * @Date: 2022-12-21 18:10:36
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getAttachmentModalDS = (isEdit, requisitionId, supplyRecordId) => ({
  primaryKey: 'attachmentItemId',
  autoQuery: true,
  cacheSelection: true,
  pageSize: 20,
  selection: isEdit ? 'multiple' : false,
  fields: [
    {
      label: intl.get('sslm.common.view.attachment.name').d('附件名称'),
      name: 'attachmentDesc',
    },
    {
      label: intl.get('sslm.common.view.attachment.size').d('附件大小(MB)'),
      name: 'attachmentSize',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.realName`).d('上传人'),
      name: 'uploadUserName',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.uploadDate`).d('上传时间'),
      name: 'uploadDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentType`).d('文件类型'),
      name: 'attachmentType',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.maturityDate`).d('文件到期日'),
      name: 'dueDate',
      type: 'dateTime',
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'option',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/life-cycle-change-ability-item-ln-atts/${requisitionId}/${supplyRecordId}`,
      method: 'GET',
    },
    submit: ({ data }) => {
      const newData = data.map(n => {
        const { _status, attachmentItemId, ...others } = n;
        if (_status === 'create') {
          return others;
        } else {
          return n;
        }
      });
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/life-cycle-change-ability-item-ln-atts/${requisitionId}`,
        method: 'POST',
        data: newData,
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/life-cycle-change-ability-item-ln-atts/${requisitionId}`,
        method: 'DELETE',
        data: data && data.map(n => n.attachmentItemId),
      };
    },
  },
});
