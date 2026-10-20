import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId, getDateTimeFormat, getCurrentUser } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

// basic information ds
const headerDS = (payload) => {
  const { fileManageId, pageSourceCategory, customizeUnitCode } = payload || {};
  const currentUserInfo = getCurrentUser() || {};
  return {
    dataToJSON: 'all',
    primaryKey: 'fileManageId',
    autoCreate: pageSourceCategory === 'create',
    autoQuery: false,
    fields: [
      {
        name: 'fileManageName',
        label: intl.get('ssrc.fileTemplateManage.model.bidFileTemplate.templateName').d('模板名称'),
        required: true,
        type: 'intl',
      },
      {
        name: 'createdByName',
        label: intl.get(`ssrc.common.model.common.createdByName`).d('创建人'),
        disabled: true,
        transformResponse: (value) => {
          return value || currentUserInfo.realName;
        },
      },
      {
        name: 'creationDate',
        label: intl
          .get(`ssrc.fileTemplateManage.model.fileTemplateManage.creationDateTime`)
          .d('创建时间'),
        type: 'dateTime',
        format: getDateTimeFormat(),
        disabled: true,
      },
      {
        name: 'remark',
        label: intl
          .get('ssrc.fileTemplateManage.model.bidFileTemplate.templateDescribe')
          .d('模板描述'),
        type: 'intl',
      },
    ],
    transport: {
      read: () => {
        if (!fileManageId) return;
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/file-manages/detail`,
          method: 'POST',
          params: {
            customizeUnitCode,
          },
          data: {
            fileManageId,
          },
        };
      },
    },
  };
};

// template table ds
const templateTableDS = (payload) => {
  const { fileManageId } = payload || {};
  return {
    dataToJSON: 'all',
    primaryKey: 'fileTemplateId',
    autoQuery: false,
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
        name: 'fileTemplateName',
        label: intl
          .get('ssrc.fileTemplateManage.model.bidFileTemplate.fileTemplateName')
          .d('文件名称'),
      },
      {
        name: 'fileTemplateLang',
        label: intl.get('ssrc.fileTemplateManage.model.bidFileTemplate.language').d('语言'),
      },
      {
        name: 'remark',
        label: intl.get('ssrc.fileTemplateManage.model.bidFileTemplate.describe').d('描述'),
      },
    ],
    transport: {
      read: () => {
        if (!fileManageId) return;
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/file-templates/list`,
          method: 'POST',
          data: {
            fileManageId,
          },
        };
      },
    },
  };
};

// create or edit template table record ds
const editTempRecordFormDS = (payload) => {
  const { fileManageId } = payload || {};
  return {
    dataToJSON: 'all',
    primaryKey: 'fileTemplateId',
    fields: [
      {
        name: 'fileTemplateName',
        label: intl.get('ssrc.fileTemplateManage.model.bidFileTemplate.templateName').d('模板名称'),
        required: true,
      },
      {
        name: 'fileTemplateLang',
        label: intl.get('ssrc.fileTemplateManage.model.bidFileTemplate.language').d('语言'),
        lookupCode: 'HPFM.LANGUAGE_LIST_TENANT',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => {
            if (record.get('fileTemplateId')) return true;
            return false;
          },
        },
      },
      {
        name: 'remark',
        label: intl
          .get('ssrc.fileTemplateManage.model.bidFileTemplate.templateDescribe')
          .d('模板描述'),
      },
    ],
    transport: {
      submit: ({ data }) => {
        if (!fileManageId) return;
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/file-templates/save-update`,
          method: 'POST',
          data: {
            fileManageId,
            ...(data?.[0] || {}),
          },
        };
      },
    },
  };
};

export { headerDS, templateTableDS, editTempRecordFormDS };
