import { DataSet } from 'choerodon-ui/pro';
import moment from 'moment';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const SRM_SMCT = '/smct';
const organizationId = getCurrentOrganizationId();

export function getFormDsProps() {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'publishStatus',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'templateCode',
        disabled: true,
        label: intl.get('small.centralize.view.centralizeCode').d('拼单编码'),
      },
      {
        name: 'templateName',
        type: 'intl',
        required: true,
        maxLength: 30,
        label: intl.get('small.centralize.view.centralizeName').d('拼单名称'),
      },
      {
        name: 'templateType',
        defaultValue: 'OPENNESS',
        lookupCode: 'SMCT.CENTRALIZED_TEMPLATE_TYPE',
        label: intl.get('small.centralize.view.centralizeMode').d('拼单模式'),
      },
      {
        name: 'templateDate',
        label: intl.get('small.centralize.view.activeTime').d('活动时间'),
        type: 'date',
        range: ['startDate', 'endDate'],
        ignore: 'always',
        dynamicProps: {
          min: ({ record }) => {
            return record.get('templateType') === 'FIXED_TIME'
              ? moment().format(DATETIME_MIN)
              : undefined;
          },
          required: ({ record }) => {
            return record.get('templateType') === 'FIXED_TIME';
          },
        },
        validator: (value, name, record) => {
          if (value && record.get('templateType') === 'FIXED_TIME') {
            if (!value.startDate && value.endDate) {
              return intl.get('small.centralize.view.plsStartTime').d('请输入有效期从');
            } else if (value.startDate && !value.endDate) {
              return intl.get('small.centralize.view.plsEndTime').d('请输入有效期至');
            }
          }
        },
      },
      {
        name: 'startDate',
        type: 'date',
        bind: 'templateDate.startDate',
        transformRequest(value) {
          return value && value.format(DATETIME_MIN);
        },
      },
      {
        name: 'endDate',
        type: 'date',
        bind: 'templateDate.endDate',
        transformRequest(value) {
          return value && value.format(DATETIME_MAX);
        },
      },
      {
        name: 'enabledRuleFlag',
        type: 'number',
        label: intl.get(`small.centralize.model.enabledRule`).d('启用规则'),
        defaultValue: 0,
        // required: true,
        options: new DataSet({
          data: [
            { value: 0, meaning: intl.get(`small.centralize.model.noLimit`).d('无条件限制') },
            {
              value: 1,
              meaning: intl.get(`small.centralize.model.customRule`).d('自定义组合规则'),
            },
          ],
        }),
      },
      {
        name: 'executeRuleFlag',
        type: 'number',
        label: intl.get(`small.centralize.model.executeRule`).d('执行规则'),
        defaultValue: 0,
        // required: true,
        options: new DataSet({
          data: [
            { value: 0, meaning: intl.get(`small.centralize.model.noLimit`).d('无条件限制') },
            {
              value: 1,
              meaning: intl.get(`small.centralize.model.customRule`).d('自定义组合规则'),
            },
          ],
        }),
      },
      {
        name: 'conditionType', // 0无条件限制,1自由组合定义
      },
      {
        name: 'enabledExpression',
        label: intl.get(`small.centralize.model.customRule`).d('自定义组合规则'),
        dynamicProps: {
          required: ({ record }) => {
            return record.get('enabledRuleFlag') === 1;
          },
        },
      },
      {
        name: 'executeExpression',
        label: intl.get(`small.centralize.model.customRule`).d('自定义组合规则'),
        dynamicProps: {
          required: ({ record }) => {
            return record.get('executeRuleFlag') === 1;
          },
        },
      },
    ],
  };
}

// 商品信息
export function getSkuInfoDsProps() {
  return {
    autoQuery: false,
    primaryKey: 'fixedSkuId',
    fields: [
      {
        name: 'productCode',
        label: intl.get('small.centralize.view.skuCode').d('商品编码'),
      },
      {
        name: 'productName',
        label: intl.get('small.centralize.view.skuName').d('商品名称'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get(`small.common.model.supplier.name`).d('供应商名称'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_SMCT}/v1/${organizationId}/centralized-fixed-skus`,
        method: 'GET',
      },
      destroy: {
        url: `${SRM_SMCT}/v1/${organizationId}/centralized-fixed-skus`,
        method: 'DELETE',
      },
    },
  };
}

function handleLovCode(record) {
  let lovCode;
  let textField;
  let valueField;
  switch (record.get('characterType')) {
    // 角色
    case 'ROLE':
      lovCode = 'LOV_ROLE';
      valueField = 'id';
      textField = 'name';
      break;
    // 账户
    case 'USER':
      lovCode = 'HIAM.TENANT.USER';
      valueField = 'id';
      textField = 'realName';
      break;
    // 组织
    case 'UNIT':
      lovCode = 'SMAL.DECORATION_UNIT';
      valueField = 'purUnitId';
      textField = 'purUnitName';
      break;
    // 供应商
    case 'SUPPLIER':
      lovCode = 'SMAL.TENANT_SUPPLIER_ALL';
      valueField = 'supplierCompanyId';
      textField = 'supplierCompanyName';
      break;
    // 目录
    case 'DIRECTOTY':
      lovCode = 'SMPC.CATALOG_THREE';
      valueField = 'catalogId';
      textField = 'catalogName';
      break;
    // 品类
    case 'CATEGORY':
      lovCode = 'SMCT_CENTRALIZED_ITEMCATEGORY';
      valueField = 'categoryId';
      textField = 'categoryName';
      break;
    default:
      break;
  }
  return {
    lovCode,
    textField,
    valueField,
  };
}

// 规则配置
export function getRuleConfigDsProps(ruleType) {
  return {
    paging: false,
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'ruleType', // ENABLE启用规则,PERFORM执行规则
        defaultValue: ruleType,
      },
      {
        label: intl.get(`small.centralize.model.speciality`).d('特性'),
        name: 'characterType',
        required: true,
        lookupCode:
          ruleType === 'ENABLE' ? 'SMCT.CENTRALIZED_LIMIT_RULES' : 'SMCT.CENTRALIZED_PERFORM_RULE',
      },
      {
        label: intl.get(`small.common.model.view.conditionCharacter`).d('特性条件'),
        type: 'string',
        name: 'conditionCharacter',
        required: true,
        lookupCode: 'SMCT.CENTRALIZED_CHARACTER',
      },
      {
        label: intl.get(`small.centralize.model.specialityValue`).d('特性值'),
        name: 'centralizedConditionValueList',
        type: 'object',
        required: true,
        computedProps: {
          lovCode: ({ record }) => {
            const { lovCode } = handleLovCode(record);
            return lovCode;
          },
          textField: ({ record }) => {
            const { textField } = handleLovCode(record);
            return textField;
          },
          valueField: ({ record }) => {
            const { valueField } = handleLovCode(record);
            return valueField;
          },
          multiple: ({ record }) => {
            // 包含/排除为多选
            return ['INCLUDE', 'UNINCLUDE'].includes(record.get('conditionCharacter'));
          },
        },
        transformResponse: (value, item) => {
          if (['INCLUDE', 'UNINCLUDE'].includes(item.conditionCharacter)) {
            return value;
          } else {
            return value?.[0];
          }
        },
      },
      {
        name: 'conditionLineValue',
        computedProps: {
          bind: ({ dataSet, record }) => {
            const valueField = dataSet
              .getField('centralizedConditionValueList')
              .get('valueField', record);
            return `centralizedConditionValueList.${valueField}`;
          },
        },
        transformResponse: (value, item) => {
          const valueList = item.centralizedConditionValueList || [];
          if (['INCLUDE', 'UNINCLUDE'].includes(item.conditionCharacter)) {
            return valueList.map(m => m.conditionLineValue);
          } else {
            return valueList?.[0]?.conditionLineValue;
          }
        },
      },
      {
        name: 'conditionLineValueMeaning',
        computedProps: {
          bind: ({ dataSet, record }) => {
            const textField = dataSet
              .getField('centralizedConditionValueList')
              .get('textField', record);
            return `centralizedConditionValueList.${textField}`;
          },
        },
        transformResponse: (value, item) => {
          const valueList = item.centralizedConditionValueList || [];
          if (['INCLUDE', 'UNINCLUDE'].includes(item.conditionCharacter)) {
            return valueList.map(m => m.conditionLineValueMeaning);
          } else {
            return valueList?.[0]?.conditionLineValueMeaning;
          }
        },
      },
    ],
    events: {
      update: ({ name, record }) => {
        if (name === 'characterType' || name === 'conditionCharacter') {
          record.set('centralizedConditionValueList', null);
        }
      },
    },
  };
}
