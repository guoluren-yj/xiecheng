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

const getAptitudeAttachmentDS = ({
  investgProserviceId,
  editable,
  requiredFlagMap: { dueDateFlag = false, fileTypeFlag = false } = {},
  pageSource = '',
}) => ({
  selection: editable ? 'multiple' : false,
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
      label: intl.get('sslm.common.model.attachment.realName').d('上传人'),
      name: 'uploadUserName',
    },
    {
      label: intl.get('sslm.common.model.attachment.uploadDate').d('上传时间'),
      name: 'uploadDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sslm.common.model.attachment.attachmentType').d('文件类型'),
      name: 'attachmentType',
      required: fileTypeFlag,
    },
    {
      label: intl.get('sslm.common.model.attachment.maturityDate').d('文件到期日'),
      name: 'dueDate',
      type: 'date',
      min: moment(),
      required: dueDateFlag,
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'operation',
    },
  ],
  transport: {
    read: {
      url: ['enterpriseInform'].includes(pageSource)
        ? `${SRM_SSLM}/v1/${organizationId}/firm-change-proservice-atts/${investgProserviceId}`
        : `${SRM_SSLM}/v1/${organizationId}/investg-proservice-atts/${investgProserviceId}`,
      method: 'GET',
    },
    destroy: {
      url: ['enterpriseInform'].includes(pageSource)
        ? `${SRM_SSLM}/v1/${organizationId}/firm-change-proservice-atts/batch-remove`
        : `${SRM_SSLM}/v1/${organizationId}/investg-proservice-atts/batch-remove`,
      method: 'DELETE',
    },
  },
  // 处理新建
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          const { investgProserviceAttId, proserviceAttachmentId } =
            record.get(['investgProserviceAttId', 'proserviceAttachmentId']) || {};
          if (investgProserviceAttId || proserviceAttachmentId) {
            Object.assign(record, { status: 'update' });
          } else {
            Object.assign(record, { status: 'add' });
          }
        });
      }
    },
  },
});

export { getAptitudeAttachmentDS };
