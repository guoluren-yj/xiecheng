/**
 * 标准条件规则 DataSet
 * @Author: chendengji <dengji.chen@hand-china.com>
 * @Date: 2020-08-20 13:37:15
 * @LastEditTime: 2019-10-11 10:03:57
 * @Copyright: Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';
import { isEmpty } from 'lodash';

const organizationId = getCurrentOrganizationId();

export default () => ({
  selection: false,
  paging: false,
  transport: {
    read: ({ data }) => {
      const { exportCfId } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/export-cf-filters/findOne/${exportCfId}`,
        method: 'GET',
        params: {
          filterType: 'STANDARD',
        },
        data,
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/export-cf-filters`,
        method: 'DELETE',
        params,
        data: {
          ...data[0],
        },
      };
    },
  },
  primaryKey: 'exportCfFilterId',
  fields: [
    {
      name: 'exportCfFilterId',
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.features`).d('特性'),
      name: 'filterObject',
      lookupCode: 'SSLM.EXPORT_FILTER_STANDARD',
      required: true,
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.featuresMethod`).d('特性条件'),
      name: 'filterMethod',
      lookupCode: 'SSLM.EXPORT_FILTER_METHOD',
      required: true,
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.featuresValue`).d('特性值'),
      name: 'filterVluse',
      required: true,
      dynamicProps: ({ record }) => {
        let config = {};
        switch (record.get('filterObject')) {
          case 'CATEGORY':
            config = {
              type: 'object',
              lovCode: 'SSLM.SUPPLIER_CATEGORY',
              lovPara: {
                enabledFlag: 1,
              },
            };
            break;
          case 'LIFECYCLE':
          case 'TARGET_LIFE_CYCLE':
          case 'INIT_LIFE_CYCLE':
            config = {
              type: 'object',
              lovCode: 'SSLM.LIFE_CYCLE_STAGE',
              lovPara: {
                organizationId,
              },
            };
            break;
          case 'SUPPLIER':
            config = {
              type: 'object',
              lovCode: 'SSLM.TENANT_SUPPLIER_CATE',
              lovPara: {
                tenantId: organizationId,
              },
            };
            break;
          case 'COMPANY':
            config = {
              type: 'object',
              lovCode: 'HPFM.COMPANY',
              lovPara: {
                tenantId: organizationId,
              },
            };
            break;
          case 'CHANGE_REQ_TABLE':
            config = {
              type: 'string',
              lookupCode: 'SSLM_CHANGE_REQ_TABLE',
            };
            break;
          case 'CHANGE_REQ_TYPE':
            config = {
              type: 'string',
              lookupCode: 'SSLM.CHANGE_REQ_TYPE_VALUE',
            };
            break;
          case 'KPIEVAL':
            config = {
              type: 'object',
              lovCode: 'SSLM.KPI_EVAL_TPL',
              valueField: 'evalTplCode',
            };
            break;
          case 'CONTRACT_TYPE':
            config = {
              type: 'object',
              lovCode: 'SPCM.PC_TYPE',
              valueField: 'pcTypeId',
              lovPara: {
                tenantId: organizationId,
              },
            };
            break;
          case 'CONTRACT_TEMPLATE':
            config = {
              type: 'object',
              lovCode: 'SPCM.PC_TEMPLATE_TRANSLATION',
              valueField: 'pcTemplateId',
              lovPara: {
                tenantId: organizationId,
              },
            };
            break;
          case 'LINK_EXT_SUPPLIER_NULL':
            config = {
              type: 'string',
              lookupCode: 'HPFM.FLAG',
            };
            break;
          case 'SUPPLIER_QUOTA_OPERATION':
            config = {
              type: 'string',
              lookupCode: 'SSLM.SUPPLIER_QUOTA_OPERATION_NODE',
            };
            break;
          case 'EXT_SUPPLIER_REQ_TYPE':
            config = {
              type: 'string',
              lookupCode: 'SSLM.EXTERNAL_SUP_REQ_TYPE',
            };
            break;
          case 'JY_SUPPLIER_TYPE_CODE':
            config = {
              type: 'string',
              lookupCode: 'SSLM.SUPPLIER_TYPE_CODE',
            };
            break;
          default:
            config = {
              type: 'string',
              disabled: !record.get('filterObject'),
            };
            break;
        }
        return config;
      },
      transformRequest: (value, record) => {
        switch (record.get('filterObject')) {
          case 'CATEGORY':
            return value?.categoryId;
          case 'LIFECYCLE':
          case 'TARGET_LIFE_CYCLE':
          case 'INIT_LIFE_CYCLE':
            return value?.stageId;
          case 'SUPPLIER':
            return value?.supplierCompanyId;
          case 'COMPANY':
            return value?.companyId;
          case 'KPIEVAL':
            return value?.evalTplCode;
          case 'CONTRACT_TYPE':
            return value?.pcTypeId;
          case 'CONTRACT_TEMPLATE':
            return value?.pcTemplateId;
          default:
            return value;
        }
      },
      transformResponse: (value, object) => {
        if (isEmpty(value)) {
          return undefined;
        } else {
          switch (object.filterObject) {
            case 'CATEGORY':
              return {
                categoryDescription: object.filterVluseMeaning,
                categoryId: value,
              };
            case 'LIFECYCLE':
            case 'TARGET_LIFE_CYCLE':
            case 'INIT_LIFE_CYCLE':
              return {
                stageDescription: object.filterVluseMeaning,
                stageId: value,
              };
            case 'SUPPLIER':
              return {
                supplierCompanyName: object.filterVluseMeaning,
                supplierCompanyId: value,
              };
            case 'COMPANY':
              return {
                companyName: object.filterVluseMeaning,
                companyId: value,
              };
            case 'KPIEVAL':
              return {
                evalTplName: object.filterVluseMeaning,
                evalTplCode: value,
              };
            case 'CONTRACT_TYPE':
              return {
                pcTypeName: object.filterVluseMeaning,
                pcTypeId: value,
              };
            case 'CONTRACT_TEMPLATE':
              return {
                templateName: object.filterVluseMeaning,
                pcTemplateId: value,
              };
            default:
              return value;
          }
        }
      },
    },
    {
      label: intl.get(`hzero.common.button.operator`).d('操作'),
      name: 'operator',
      ignore: 'always',
    },
  ],
});
