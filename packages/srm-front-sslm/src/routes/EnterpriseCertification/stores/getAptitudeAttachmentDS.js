/*
 * @Date: 2022-06-17 18:21:03
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getAptitudeAttachmentDS = ({ investgProserviceId }) => ({
  paging: false,
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
      label: intl.get(`sslm.common.model.attachment.realName`).d('上传人'),
      name: 'uploadUserName',
    },
    {
      label: intl.get(`sslm.common.model.attachment.uploadDate`).d('上传时间'),
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
      type: 'date',
      min: moment(),
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/investg-proservice-atts/${investgProserviceId}`,
      method: 'GET',
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${organizationId}/investg-proservice-atts/batch-remove`,
      method: 'DELETE',
    },
  },
});

export { getAptitudeAttachmentDS };
