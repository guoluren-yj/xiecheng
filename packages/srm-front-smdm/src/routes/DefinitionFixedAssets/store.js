import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MDM } from '_utils/config';
import intl from 'utils/intl';

const commonPrompt = 'smdm.fixedAsset.model.common';
const organizationId = getCurrentOrganizationId();

const listDs = () => {
  return {
    selection: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get(`${commonPrompt}.fixedAssetCode`).d('固定资产编码'),
        name: 'fixedAssetCode',
      },
      {
        label: intl.get(`${commonPrompt}.fixedAssetName`).d('固定资产名称'),
        name: 'fixedAssetName',
      },
      {
        label: intl.get(`${commonPrompt}.assetCode`).d('资产类编码'),
        name: 'assetCode',
      },
      {
        label: intl.get(`${commonPrompt}.assetDescription`).d('资产分类描述'),
        name: 'assetDescription',
      },
      {
        label: intl.get(`${commonPrompt}.assetDate`).d('资产化日期'),
        name: 'assetDate',
        type: 'date',
      },
      {
        label: intl.get(`smdm.common.model.project.companyNum`).d('公司编码'),
        name: 'companyNum',
      },
      {
        label: intl.get(`smdm.common.model.wbs.companyName`).d('公司名称'),
        name: 'companyName',
      },
      {
        label: intl.get(`smdm.common.model.wbs.ouName`).d('业务实体'),
        name: 'ouName',
      },
      {
        label: intl.get(`hzero.common.common.status`).d('状态'),
        name: 'enabledFlag',
      },
      {
        label: intl.get(`smdm.common.model.common.sourceCode`).d('来源系统'),
        name: 'sourceCode',
      },
      {
        label: intl.get(`hzero.common.option`).d('操作'),
        name: 'actions',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_MDM}/v1/${organizationId}/fixed-assets`,
          method: 'GET',
          data: {
            ...data,
            customizeUnitCode:
              'SMDM.FIXED.ASSETS_DEFINITION.LIST,SMDM.FIXED.ASSETS_DEFINITION.FILTER',
          },
        };
      },
    },
  };
};

const formDs = ({ fixedAssetId }) => {
  return {
    selection: false,
    paging: false,
    autoQuery: true,
    fields: [
      {
        label: intl.get(`${commonPrompt}.fixedAssetCode`).d('固定资产编码'),
        name: 'fixedAssetCode',
        required: true,
        dynamicProps: {
          disabled: ({ record }) =>
            record?.get('sourceCode') !== 'SRM' || record?.get('fixedAssetId'),
        },
      },
      {
        label: intl.get(`${commonPrompt}.fixedAssetName`).d('固定资产名称'),
        name: 'fixedAssetName',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => record?.get('sourceCode') !== 'SRM',
        },
      },
      {
        label: intl.get(`${commonPrompt}.assetCode`).d('资产类编码'),
        name: 'assetCode',
        dynamicProps: {
          disabled: ({ record }) =>
            record?.get('sourceCode') !== 'SRM' || record?.get('fixedAssetId'),
        },
      },
      {
        label: intl.get(`${commonPrompt}.assetDescription`).d('资产分类描述'),
        name: 'assetDescription',
        dynamicProps: {
          disabled: ({ record }) => record?.get('sourceCode') !== 'SRM',
        },
      },
      {
        label: intl.get(`${commonPrompt}.assetDate`).d('资产化日期'),
        name: 'assetDate',
        type: 'date',
        dynamicProps: {
          disabled: ({ record }) => record?.get('sourceCode') !== 'SRM',
        },
      },
      {
        label: intl.get(`smdm.common.model.project.companyNum`).d('公司编码'),
        name: 'companyId',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        dynamicProps: {
          disabled: ({ record }) =>
            record?.get('sourceCode') !== 'SRM' || record?.get('fixedAssetId'),
        },
        textField: 'companyNum',
        transformRequest: (value) => value && value.companyId,
        transformResponse(value, data) {
          if (value) {
            return {
              companyId: data?.companyId,
              companyName: data.companyName,
              companyNum: data.companyNum,
            };
          } else {
            return null;
          }
        },
      },
      {
        label: intl.get(`smdm.common.model.wbs.companyName`).d('公司名称'),
        name: 'companyName',
        bind: 'companyId.companyName',
        dynamicProps: {
          disabled: ({ record }) => record?.get('sourceCode') !== 'SRM',
        },
      },
      {
        label: intl.get(`smdm.common.model.wbs.ouName`).d('业务实体'),
        name: 'ouId',
        type: 'object',
        required: true,
        dynamicProps: {
          disabled: ({ record }) =>
            record?.get('sourceCode') !== 'SRM' || record?.get('fixedAssetId'),
          lovPara: ({ record }) => ({
            companyId: record?.get('companyId')?.companyId || record?.get('companyId'),
          }),
        },
        transformRequest: (value) => value && value.ouId,
        lovCode: 'SPFM.USER_AUTH.OU',
        transformResponse(value, data) {
          if (value) {
            return {
              ouId: data?.ouId,
              ouName: data?.ouName,
            };
          } else {
            return null;
          }
        },
      },
      {
        label: intl.get(`smdm.common.model.wbs.ouName`).d('业务实体'),
        name: 'ouName',
        bind: 'ouId.ouName',
      },
      {
        label: intl.get(`hzero.common.common.status`).d('状态'),
        name: 'enabledFlag',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        dynamicProps: {
          disabled: ({ record }) => record?.get('sourceCode') !== 'SRM',
        },
      },
      {
        label: intl.get(`smdm.common.model.common.sourceCode`).d('来源系统'),
        name: 'sourceCode',
        defaultValue: 'SRM',
        disabled: true,
      },
    ],
    transport: {
      read: ({ data }) => {
        if (fixedAssetId) {
          return {
            url: `${SRM_MDM}/v1/${organizationId}/fixed-assets/detail/${fixedAssetId}`,
            method: 'GET',
            data: { ...data, customizeUnitCode: 'SMDM.FIXED.ASSETS_DEFINITION.FORM' },
          };
        }
      },
    },
    events: {
      update: ({ name, record, value }) => {
        if (name === 'companyId') {
          if (value?.ouId) {
            record.set({ ouId: { ouId: value?.ouId, ouName: value?.ouName } });
          } else {
            record.set({ ouId: null });
          }
        }
      },
    },
  };
};

export { listDs, formDs };
