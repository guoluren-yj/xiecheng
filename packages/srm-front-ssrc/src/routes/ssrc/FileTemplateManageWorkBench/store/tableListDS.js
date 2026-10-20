import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

// list table ds
const tableDS = ({ customizeUnitCode } = {}) => {
  return {
    autoQuery: false,
    primaryKey: 'fileManageId',
    pageSize: 20,
    selection: false,
    fields: [
      {
        name: 'enabledFlag',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'operate',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
      {
        name: 'fileManageName',
        label: intl.get('ssrc.fileTemplateManage.model.bidFileTemplate.templateName').d('模板名称'),
      },
      {
        name: 'fileTypeMeaning',
        label: intl.get('ssrc.fileTemplateManage.model.bidFileTemplate.fileFormat').d('文件格式'),
      },
      {
        name: 'createdByName',
        label: intl.get(`ssrc.common.model.common.createdByName`).d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get(`ssrc.common.model.common.creationDateTime`).d('创建时间'),
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/file-manages/list`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
        };
      },
    },
  };
};

export { tableDS };
