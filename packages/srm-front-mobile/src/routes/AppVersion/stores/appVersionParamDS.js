import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';

function appVersionParamDS() {
  return {
    primaryKey: 'appVersionParamId',
    autoQuery: true,
    selection: 'multiple',
    autoQueryAfterSubmit: true,
    pageSize: 10,

    // table表单显示的字段
    fields: [
      {
        name: 'versionNum',
        type: 'string',
        required: true,
        unique: true,
        label: intl.get('smbl.appVersion.model.AppVersionParam.versionNum').d('app版本号'),
      },
      {
        name: 'appPackage',
        type: 'string',
        label: intl.get('smbl.appVersion.model.AppVersionParam.appPackage').d('app安装包'),
      },
      {
        name: 'downloadQrCodeUrl',
        type: 'string',
        label: intl.get('smbl.appVersion.model.AppVersionParam.downloadQrCodeUrl').d('下载二维码'),
      },
      {
        name: 'downloadUrl',
        type: 'string',
        required: true,
        label: intl.get('smbl.appVersion.model.AppVersionParam.downloadUrl').d('下载地址'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('smbl.appVersion.model.AppVersionParam.remark').d('版本更新信息'),
        required: true,
      },
      {
        name: 'minVersionFlag',
        type: 'boolean',
        label: intl.get('smbl.appVersion.model.AppVersion.minVersionFlag').d('是否最低版本'),
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'latestVersionFlag',
        type: 'boolean',
        label: intl.get('smbl.appVersion.model.AppVersion.latestVersionFlag').d('是否最新版本'),
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
      },
    ],

    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
      submitSuccess: ({ dataSet }) => dataSet.query(1),
    },

    transport: {
      read: ({ data }) => {
        if (data.appVersionId) {
          const { appVersionId } = data;
          return {
            url: `${SRM_SMBL}/v1/app-version-params/${appVersionId}`,
            method: 'get',
          };
        } else {
          return null;
        }
      },
      destroy: {
        url: `${SRM_SMBL}/v1/app-version-params/`,
        method: 'delete',
      },
      create: {
        url: `${SRM_SMBL}/v1/app-version-params/`,
        method: 'post',
        autoQuery: true,
      },
      update: {
        url: `${SRM_SMBL}/v1/app-version-params/`,
        method: 'post',
      },
    },
  };
}
export { appVersionParamDS };
