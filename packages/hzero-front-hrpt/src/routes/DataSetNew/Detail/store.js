/* eslint-disable react/react-in-jsx-scope */
import { DataSet } from 'choerodon-ui/pro';
import { isTenantRoleLevel, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';
import { HZERO_RPT } from 'utils/config';
import { isNil } from 'lodash';

/**
 * 头表单ds配置
 * @param {*} datasetId
 * @returns {import('choerodon-ui/dataset/data-set/DataSet').DataSetProps}
 */
export const getHeaderFormDs = (datasetId) => {
  const { loginName } = getCurrentUser() || {};
  const isAdmin = loginName === 'admin'; 
  const disabledFlag = !isNil(datasetId);
  return {
    autoCreate: true,
    paging: false,
    fields: [
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.dataSetCode').d('数据集编码'),
        name: 'datasetCode',
        required: !disabledFlag,
        disabled: disabledFlag,
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.datasetName').d('数据集名称'),
        name: 'datasetName',
        required: true,
        type: 'intl',
      },
      {
        label: intl.get('hzero.common.remark').d('备注'),
        name: 'remark',
        type: 'intl',
      },
      {
        label: intl.get('entity.tenant.tag').d('租户'),
        name: 'tenantId',
        type: "object",
        lovCode: 'HPFM.TENANT',
        required: !disabledFlag,
        disabled: disabledFlag,
        transformResponse(value, data) {
          const valueField = "tenantId";
          const textField = "tenantName";

          // 无法实时获取正确的valueField，暂时只能写死
          return isNil(value) ? null : {
            [valueField]: data.tenantId,
            [textField]: data.tenantName,
          };
        },
        transformRequest(value, record) {
          let valueField = "tenantId";
          if (record) {
            valueField = record.getField("tenantId").get("valueField");
          }
          return value && value[valueField];
        },
        optionsProps: {
          record: {
            dynamicProps: {
              disabled: (record) => {
                return !isAdmin && (window.$$env || {}).HRPT_ADD_FIELD !== "true" && record && record.get('tenantId') == 0;
              },
              selectable: (record) => {
                return isAdmin || (window.$$env || {}).HRPT_ADD_FIELD === "true" || !record || record?.get('tenantId') != 0;
              },
            }
          }
        }
      },
      {
        label: intl.get('hrpt.reportDataSet.modal.reportDataSet.type').d('类型'),
        name: 'datasetType',
        required: true,
        defaultValue: 'SCRIPT_SQL',
        disabled: disabledFlag,
        options: new DataSet({
          selection: 'single',
          data: [
            {
              value: 'SCRIPT_SQL',
              meaning: intl
                .get('hrpt.reportDataSet.modal.reportDataSet.type.scriptSql')
                .d('脚本SQL'),
            },
            {
              value: 'URL',
              meaning: intl.get('hrpt.reportDataSet.modal.reportDataSet.type.url').d('URL'),
            },
          ],
        }),
      },
      {
        label: intl
          .get('hrpt.reportDataSet.model.reportDataSet.businessObjectName')
          .d('组合业务对象'),
        name: 'businessObjectId',
        disabled: disabledFlag,
        // required: true,
      },
      {
        label: intl.get('hzero.common.status.enable').d('启用'),
        name: 'enabledFlag',
        type: 'boolean',
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'sqlText',
        required: true,
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.limitCount').d('数据大小限制'),
        name: 'limitCount',
        type: 'number',
        defaultValue: 10000,
        max: 50000,
        min: 0,
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.datasourceCode').d('数据源'),
        name: 'datasource',
        type: 'object',
        ignore: 'always',
        lovCode: 'HPFM.SITE.DATASOURCE',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              enabledFlag: 1,
              tenantId: record.get('tenantId') && record.get('tenantId').tenantId,
              dsPurposeCode: 'DR',
            };
          },
          required: ({ record }) => {
            return record.get('datasetType') != 'URL';
          },
          disabled: ({ record }) => {
            return record.get('datasetType') != 'SCRIPT_SQL' || isNil(record.get('tenantId')) || isNil(record.get('tenantId').tenantId);
          },
        }
      },
      {
        name: 'datasourceCode',
        bind: 'datasource.datasourceCode',
      }
    ],
    transport: {
      create: () => {
        return {
          url: `${HZERO_RPT}/v1/print-datasets`,
          method: 'POST',
        };
      },
      read: ({ params }) => {
        return {
          url: `${HZERO_RPT}/v1/print-datasets/${datasetId}`,
          method: 'GET',
          params: {
            ...params,
            datasetId,
            withCanBeDeleted: true,
          },
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        if (dataSet.current && !dataSet.current.get("limitCount")) {
          dataSet.current.init("limitCount", 10000);
        }
      },
      update: ({ record, name }) => {
        if (name === 'datasetType') {
          record.init('sqlText', undefined);
          record.init('datasource', undefined);
        } else if (name === 'tenantId') {
          record.init('datasource', undefined);
        }
      },
    },
  };
};

export const getMetaDataTableDs = () => {
  return {
    paging: false,
    selection: false,
    primaryKey: '_id',
    parentField: '_parentId',
    idField: '_id',
    fields: [
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.field').d('字段'),
        name: '_name',
        required: true,
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.fieldCode').d('字段编码'),
        name: '_code',
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.businessObject').d('业务对象'),
        name: 'businessObjectCode',
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.fieldType').d('字段类型'),
        name: 'dataType',
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.businessType').d('业务类型'),
        name: 'businessType',
        lookupCode: 'HRPT.FIELD_BUSINESST_YPE',
        type: 'string',
      },
    ],
    record: {
      dynamicProps: {
        defaultExpanded: (record) => ['0', undefined].includes(record.get("_parentId")),
      },
    },
  };
};

export const getParamsTableDs = () => {
  return {
    paging: false,
    selection: false,
    fields: [
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.fieldName').d('字段名称'),
        name: 'paramName',
        required: true,
        type: 'intl',
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.fieldCode').d('字段编码'),
        name: 'paramCode',
        required: true,
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.dataType').d('数据类型'),
        name: 'dataType',
        required: true,
        options: new DataSet({
          selection: 'single',
          data: [
            {
              value: 'VARCHAR',
              meaning: intl
                .get('hrpt.reportDataSet.model.reportDataSet.dataType.varchar')
                .d('字符串'),
            },
            {
              value: 'NUMBER',
              meaning: intl.get('hrpt.reportDataSet.model.reportDataSet.dataType.number').d('整数'),
            },
          ],
        }),
      },
    ],
  };
};

export const getTreeNodeIcon = (type) => {
  switch (type) {
    case 'approve':
    case 'node':
      return (
        <svg
          t="1656568546672"
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="2209"
          width="14"
          height="14"
          // fill={fillStyle}
        >
          <path
            d="M512 0c-215.808 0-448 65.056-448 208l0 608c0 142.88 232.192 208 448 208s448-65.12 448-208l0-608c0-142.944-232.256-208-448-208zM896 816c0 79.488-171.936 144-384 144-212.096 0-384-64.512-384-144l0-119.552c66.112 68.128 225.6 103.552 384 103.552s317.888-35.424 384-103.552l0 119.552zM896 624l-0.128 0c0 0.32 0.128 0.672 0.128 0.992 0 79.008-171.936 143.008-384 143.008s-384-64-384-143.008c0-0.32 0.128-0.672 0.128-0.992l-0.128 0 0-119.552c66.112 68.128 225.6 103.552 384 103.552s317.888-35.424 384-103.552l0 119.552zM896 432l-0.128 0c0 0.32 0.128 0.672 0.128 0.992 0 79.008-171.936 143.008-384 143.008s-384-64-384-143.008c0-0.32 0.128-0.672 0.128-0.992l-0.128 0 0-109.952c83.872 63.904 237.6 93.952 384 93.952s300.128-30.048 384-93.952l0 109.952zM512 352c-212.096 0-384-64.512-384-144 0-79.552 171.904-144 384-144 212.064 0 384 64.448 384 144 0 79.488-171.936 144-384 144zM768 832c0-17.664 14.336-32 32-32s32 14.336 32 32c0 17.664-14.336 32-32 32s-32-14.336-32-32zM768 640c0-17.664 14.336-32 32-32s32 14.336 32 32c0 17.664-14.336 32-32 32s-32-14.336-32-32zM768 448c0-17.664 14.336-32 32-32s32 14.336 32 32c0 17.664-14.336 32-32 32s-32-14.336-32-32z"
            p-id="2210"
          />
        </svg>
      );
    case 'obj':
    case 'approveStage':
      return (
        <svg
          t="1657704581914"
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="4587"
          width="14"
          height="14"
        >
          <path
            d="M341.333333 725.333333 42.666667 725.333333c-25.6 0-42.666667-17.066667-42.666667-42.666667L0 42.666667c0-25.6 17.066667-42.666667 42.666667-42.666667l640 0c25.6 0 42.666667 17.066667 42.666667 42.666667l0 298.666667c0 25.6-17.066667 42.666667-42.666667 42.666667s-42.666667-17.066667-42.666667-42.666667L640 85.333333 85.333333 85.333333l0 554.666667 256 0c25.6 0 42.666667 17.066667 42.666667 42.666667S366.933333 725.333333 341.333333 725.333333z"
            p-id="4588"
          />
          <path
            d="M981.333333 1024 341.333333 1024c-25.6 0-42.666667-17.066667-42.666667-42.666667L298.666667 341.333333c0-25.6 17.066667-42.666667 42.666667-42.666667l640 0c25.6 0 42.666667 17.066667 42.666667 42.666667l0 640C1024 1006.933333 1006.933333 1024 981.333333 1024zM384 938.666667l554.666667 0L938.666667 384 384 384 384 938.666667z"
            p-id="4589"
          />
        </svg>
      );
    case 'BIGINT':
    case 'NUMBER':
      return (
        <svg
          t="1656571487875"
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="9270"
          width="14"
          height="14"
          // fill={fillStyle}
        >
          <path
            d="M159.926857 689.426286h130.724572l-39.003429 193.718857c-0.859429 4.278857-1.28 9.435429-1.28 13.714286 0 20.992 14.555429 32.566857 34.706286 32.566857 20.571429 0 35.565714-11.154286 39.862857-32.146286l41.984-207.853714h202.715428L530.651429 883.145143c-1.28 4.278857-1.700571 9.435429-1.700572 13.714286 0 20.992 14.573714 32.566857 35.145143 32.566857s35.565714-11.154286 39.862857-32.146286L645.485714 689.426286h152.996572c23.570286 0 39.862857-17.133714 39.862857-40.283429 0-18.852571-12.854857-34.285714-32.146286-34.285714h-145.298286L706.377143 388.571429h149.997714c23.588571 0 39.862857-17.152 39.862857-40.283429 0-18.852571-12.854857-34.285714-32.146285-34.285714h-142.72l35.145142-172.726857c0.420571-2.56 1.28-8.137143 1.28-13.714286 0-20.992-14.994286-32.987429-35.565714-32.987429-23.990857 0-34.706286 13.275429-39.003428 33.426286l-37.705143 186.002286H442.788571l35.145143-172.726857c0.420571-2.56 1.28-8.137143 1.28-13.714286 0-20.992-15.433143-32.987429-35.565714-32.987429-24.429714 0-35.584 13.275429-39.442286 33.426286l-37.705143 186.002286h-140.580571c-23.570286 0-39.862857 17.993143-39.862857 41.563428 0 19.291429 12.873143 33.005714 32.164571 33.005715h133.284572l-45.44 226.285714h-138.422857c-23.588571 0-39.862857 17.993143-39.862858 41.563428 0 19.291429 12.854857 33.005714 32.146286 33.005715z m221.988572-74.569143l45.878857-226.285714H630.491429l-45.842286 226.285714z"
            p-id="9271"
          />
        </svg>
      );
    case 'DATE':
      return (
        <svg
          t="1656571411155"
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="7360"
          width="14"
          height="14"
          // fill={fillStyle}
        >
          <path
            d="M128 384v512h768V192h-128v32q0 14.016-8.992 23.008T736 256t-23.008-8.992T704 224V192H320v32q0 14.016-8.992 23.008T288 256t-23.008-8.992T256 224V192H128v128h768v64H128z m192-256h384V96q0-14.016 8.992-23.008T736 64t23.008 8.992T768 96v32h160q14.016 0 23.008 8.992T960 160v768q0 14.016-8.992 23.008T928 960H96q-14.016 0-23.008-8.992T64 928V160q0-14.016 8.992-23.008T96 128h160V96q0-14.016 8.992-23.008T288 64t23.008 8.992T320 96v32zM288 512h64q14.016 0 23.008 8.992T384 544t-8.992 23.008T352 576H288q-14.016 0-23.008-8.992T256 544t8.992-23.008T288 512z m0 192h64q14.016 0 23.008 8.992T384 736t-8.992 23.008T352 768H288q-14.016 0-23.008-8.992T256 736t8.992-23.008T288 704z m192-192h64q14.016 0 23.008 8.992T576 544t-8.992 23.008T544 576h-64q-14.016 0-23.008-8.992T448 544t8.992-23.008T480 512z m0 192h64q14.016 0 23.008 8.992T576 736t-8.992 23.008T544 768h-64q-14.016 0-23.008-8.992T448 736t8.992-23.008T480 704z m192-192h64q14.016 0 23.008 8.992T768 544t-8.992 23.008T736 576h-64q-14.016 0-23.008-8.992T640 544t8.992-23.008T672 512z m0 192h64q14.016 0 23.008 8.992T768 736t-8.992 23.008T736 768h-64q-14.016 0-23.008-8.992T640 736t8.992-23.008T672 704z"
            p-id="7361"
          />
        </svg>
      );
    case 'VARCHAR':
    default:
      return (
        <svg
          t="1656571312279"
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="4534"
          width="14"
          height="14"
          // fill={fillStyle}
        >
          <path
            d="M853.333333 1024 170.666667 1024c-93.866667 0-170.666667-76.8-170.666667-170.666667L0 170.666667c0-93.866667 76.8-170.666667 170.666667-170.666667l682.666667 0c93.866667 0 170.666667 76.8 170.666667 170.666667l0 682.666667C1024 947.2 947.2 1024 853.333333 1024zM170.666667 85.333333C123.733333 85.333333 85.333333 123.733333 85.333333 170.666667l0 682.666667c0 46.933333 38.4 85.333333 85.333333 85.333333l682.666667 0c46.933333 0 85.333333-38.4 85.333333-85.333333L938.666667 170.666667c0-46.933333-38.4-85.333333-85.333333-85.333333L170.666667 85.333333z"
            p-id="4535"
          />
          <path
            d="M725.333333 341.333333 298.666667 341.333333C273.066667 341.333333 256 324.266667 256 298.666667s17.066667-42.666667 42.666667-42.666667l426.666667 0c25.6 0 42.666667 17.066667 42.666667 42.666667S750.933333 341.333333 725.333333 341.333333z"
            p-id="4536"
          />
          <path
            d="M298.666667 384C273.066667 384 256 366.933333 256 341.333333L256 298.666667c0-25.6 17.066667-42.666667 42.666667-42.666667s42.666667 17.066667 42.666667 42.666667l0 42.666667C341.333333 366.933333 324.266667 384 298.666667 384z"
            p-id="4537"
          />
          <path
            d="M725.333333 384c-25.6 0-42.666667-17.066667-42.666667-42.666667L682.666667 298.666667c0-25.6 17.066667-42.666667 42.666667-42.666667s42.666667 17.066667 42.666667 42.666667l0 42.666667C768 366.933333 750.933333 384 725.333333 384z"
            p-id="4538"
          />
          <path
            d="M512 768c-25.6 0-42.666667-17.066667-42.666667-42.666667L469.333333 298.666667c0-25.6 17.066667-42.666667 42.666667-42.666667s42.666667 17.066667 42.666667 42.666667l0 426.666667C554.666667 750.933333 537.6 768 512 768z"
            p-id="4539"
          />
          <path
            d="M554.666667 768l-85.333333 0c-25.6 0-42.666667-17.066667-42.666667-42.666667s17.066667-42.666667 42.666667-42.666667l85.333333 0c25.6 0 42.666667 17.066667 42.666667 42.666667S580.266667 768 554.666667 768z"
            p-id="4540"
          />
        </svg>
      );
  }
};

export const getObjectDs = () => {
  return {
    fields: [
      {
        name: 'object',
        type: 'object',
        lovCode: 'HMDE.BUSINESS_OBJECT.SITE',
      },
    ],
  };
};

export const addFieldFormDs = () => {
  return {
    fields: [
      {
        label: intl.get('hrpt.reportDataSet.view.title.fieldName').d('字段名称'),
        name: 'fieldName',
      },
      {
        label: intl.get('hrpt.reportDataSet.view.title.fieldCode').d('字段编码'),
        name: 'businessObjectFieldCode',
      },
    ],
  };
};

export const addFieldTableDs = () => {
  return {
    primaryKey: 'id',
    parentField: 'parentId',
    paging: false,
    idField: 'id',
    fields: [
      {
        label: intl.get('hrpt.reportDataSet.view.title.fieldName').d('字段名称'),
        name: 'fieldName',
      },
      {
        label: intl.get('hrpt.reportDataSet.view.title.fieldCode').d('字段编码'),
        name: 'businessObjectFieldCode',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: isTenantRoleLevel()
            ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-dataset-fields/can-be-add-fields`
            : `${HZERO_RPT}/v1/print-dataset-fields/can-be-add-fields`,
          method: 'GET',
          params: data,
        };
      },
    },
  };
};
