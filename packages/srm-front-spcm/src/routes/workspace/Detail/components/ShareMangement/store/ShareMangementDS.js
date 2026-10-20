/**
 * 协议详情-文本共享管理ds
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 共享对象
const shareObjeceDS = (pcHeaderId) => ({
  selection: 'multiple',
  pageSize: 20,
  primaryKey: 'editShareId',
  fields: [
    {
      name: 'realName',
      label: intl.get('spcm.workspace.model.shareMangement.realName').d('子账户名称'),
    },
    {
      name: 'loginName',
      label: intl.get('spcm.workspace.model.shareMangement.loginName').d('子账户账号'),
    },
    {
      name: 'roleName',
      label: intl.get('spcm.workspace.model.shareMangement.roleName').d('角色'),
    },
    {
      name: 'isShareContract',
      label: intl.get('spcm.workspace.model.shareMangement.isShareContract').d('分配单据模式'),
      type: 'boolean',
      trueValue: '1',
      falseValue: '0',
    },
    {
      name: 'isFinish',
      label: intl.get('spcm.workspace.model.shareMangement.isFinish').d('完成协同'),
    },
  ],
  queryParameter: {
    customizeUnitCode:
      'SPCM.WORKSPACE_DETAIL.SHARE_MANGEMENT.LIST,SPCM.WORKSPACE_DETAIL.SHARE_MANGEMENT.LIST.FILTER',
  },
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/edit-share`,
        method: 'GET',
        params: {
          ...params,
          pcHeaderId,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/edit-share`,
        method: 'DELETE',
        data,
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/edit-share/update`,
        method: 'POST',
        data,
      };
    },
  },
});

// 选择共享对象
const chooseShareObjectDS = (pcHeaderId) => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  primaryKey: 'shareId',
  modifiedCheck: false,
  pageSize: 20,
  fields: [
    {
      name: 'realName',
      label: intl.get('spcm.workspace.model.shareMangement.realName').d('子账户名称'),
    },
    {
      name: 'loginName',
      label: intl.get('spcm.workspace.model.shareMangement.loginName').d('子账户账号'),
    },
    {
      name: 'roleName',
      label: intl.get('spcm.workspace.model.shareMangement.roleName').d('角色'),
    },
  ],
  queryFields: [
    {
      name: 'roleName',
      type: 'string',
    },
  ],
  queryParameter: { pcHeaderId },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/edit-share/queryShareInfo`,
        method: 'GET',
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/edit-share/${pcHeaderId}/create`,
        method: 'POST',
        data,
      };
    },
  },
});

// 共享记录
const shareRecordDS = (pcHeaderId) => ({
  selection: false,
  primaryKey: 'id',
  pageSize: 20,
  fields: [
    {
      label: intl.get('spcm.workspace.model.shareMangement.version').d('版本'),
      name: 'version',
      type: 'string',
    },
    {
      label: intl.get('spcm.workspace.model.shareMangement.shareType').d('维度'),
      name: 'shareType',
    },
    {
      label: intl.get('spcm.workspace.model.shareMangement.shareName').d('共享人'),
      name: 'shareName',
    },
    {
      name: 'roleName',
      label: intl.get('spcm.workspace.model.shareMangement.roleName').d('角色'),
    },
    {
      name: 'isShareContract',
      label: intl.get('spcm.workspace.model.shareMangement.isShareContract').d('分配单据模式'),
      type: 'boolean',
      trueValue: '1',
      falseValue: '0',
    },
    {
      name: 'isFinish',
      label: intl.get('spcm.workspace.model.shareMangement.isFinish').d('完成协同'),
    },
    {
      label: intl.get('spcm.workspace.model.shareMangement.comment').d('备注'),
      name: 'comment',
    },
    {
      label: intl.get('spcm.workspace.model.shareMangement.createdName').d('创建人'),
      name: 'createdName',
    },
    {
      label: intl.get('spcm.workspace.model.shareMangement.creationDate').d('创建时间'),
      name: 'creationDate',
    },
  ],
  queryParameter: {
    customizeUnitCode:
      'SPCM.WORKSPACE_DETAIL.SHARE_MANGEMENT.HISTORY,SPCM.WORKSPACE_DETAIL.SHARE_MANGEMENT.HISTORY.FILTER',
  },
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/edit-share-record`,
        method: 'GET',
        params: {
          ...params,
          pcHeaderId,
        },
      };
    },
  },
});

export { shareObjeceDS, chooseShareObjectDS, shareRecordDS };
