import moment from 'moment';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import notification from 'utils/notification';

const SRM_SMCT = '/smct';
const organizationId = getCurrentOrganizationId();

export function formDS({templateId, executeRuleDataSet}) {
  return {
    autoQuery: false,
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'publishStatus',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'createdByName',
        label: intl.get('small.common.view.createByName').d('创建人'),
        disabled: true,
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('small.common.view.creationDate').d('创建时间'),
        disabled: true,
      },
      {
        name: 'templateCode',
        disabled: true,
        label: intl.get('small.centralize.view.centralizeCode').d('拼单活动编码'),
      },
      {
        name: 'templateName',
        type: 'intl',
        required: true,
        maxLength: 30,
        label: intl.get('small.centralize.view.centralizeName').d('拼单活动名称'),
      },
      {
        name: 'templateType',
        defaultValue: 'FIXED_TIME',
        lookupCode: 'SMCT.CENTRALIZED_TEMPLATE_TYPE',
        label: intl.get('small.centralize.view.centralizeMode').d('拼单模式'),
      },
      {
        name: 'templateDate',
        label: intl.get('small.centralize.view.activeTime').d('活动时间'),
        type: 'date',
        range: ['startDate', 'endDate'],
        ignore: 'always',
        required: true,
        computedProps: {
          min: ({ record })=> record.get('publishStatus') === 'PUBLISHED' ? null : moment().format(DATETIME_MIN),
        },
        validator: (value, name, record) => {
          if (value && record.get('templateType') === 'FIXED_TIME') {
            if (!value.startDate && value.endDate) {
              return intl.get('small.centralize.view.plsStartTime').d('请输入有效期从');
            } else if (value.startDate && !value.endDate) {
              return intl.get('small.centralize.view.plsEndTime').d('请输入有效期至');
            } else if (moment(value.endDate).format(DATETIME_MIN) < moment().format(DATETIME_MIN)) {
              return intl.get('hzero.c7nProUI.Validator.range_underflow', { label: intl.get('small.centralize.view.activeTime').d('活动时间'), min: moment().format("YYYY-MM-DD")}).d(`${intl.get('small.centralize.view.activeTime').d('活动时间')}必须大于或等于${moment().format(DATETIME_MIN)}。`);
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
      // {
      //   name: 'executeExpression',
      //   required: !!templateId,
      //   validator: value => {
      //     if(!templateId) return undefined;
      //     const list = value.split(/\s|AND|OR/);
      //     const validFlag = list.some(n => {
      //       return /[^0-9|(|)]/g.test(n) && !/AND|OR/g.test(n);
      //     });
      //     if (validFlag) {
      //       return intl
      //         .get('small.common.detail.field.errorExpression')
      //         .d('不允许输入字母及 ( ) OR AND 以外的字符');
      //     }
      //     const indexList = value.split(/AND|OR/).map(n => Number(n));
      //     const index = indexList.find(n => n > executeRuleDataSet.length);
      //     if(index) {
      //       return intl.get('small.common.detail.inexistenceExpression', {
      //         value: index,
      //       }).d(`条件${index}不存在`);
      //     }
      //     return undefined;
      //   },
      // },
    ],
    events: {
      query: () => {
        if(!templateId) return false;
      },
      load: ({dataSet}) => {
        const list = dataSet.current.get('centralizedConditionHeadList') || [];
        // 下单人范围
        const executeHead = list.find(f => f.ruleType === 'PERFORM') || {};
        dataSet.current.init(
          {
            executeRuleFlag: executeHead.conditionType,
            executeExpression: executeHead.conditionExpression,
          }
        );
        executeRuleDataSet.loadData(executeHead.centralizedConditionLineList || []);
        executeRuleDataSet.setState('deleteConditionIdList', []);
      },
    },
    transport: {
      read: {
        url: `${SRM_SMCT}/v1/${organizationId}/centralized-templates/${templateId}`,
        method: 'GET',
      },
    },
  };
}

// 商品信息
export function getSkuInfoDsProps(formDs) {
  return {
    autoQuery: false,
    primaryKey: 'fixedSkuId',
    cacheSelection: true,
    cacheModified: true,
    pageSize: 20,
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
      {
        name: 'purchaseQuantity',
        type: 'number',
        label: intl.get('small.centralize.view.purchaseQuantity').d('拼单数量'),
      },
    ],
    events: {
      load: ({dataSet}) => {
        const publishStatus = formDs.current?.get('publishStatus');
        if(publishStatus === 'PUBLISHED' && dataSet.length === 0) {
          notification.error({
            message: intl.get('small.centralize.view.deleteSkuError').d('商品范围不能为空，请维护商品'),
          });
        }
      },
    },
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
      textField = 'loginName';
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
    forceValidate: true,
    fields: [
      {
        name: 'ruleType', // ENABLE启用规则,PERFORM执行规则
        defaultValue: ruleType,
      },
      {
        label: intl.get(`small.common.model.modal.dimension`).d('维度'),
        name: 'characterType',
        required: true,
        lookupCode: 'SMCT.CENTRALIZED_PERFORM_RULE',
      },
      {
        label: intl.get(`small.common.model.view.conditionCharacter`).d('特性条件'),
        type: 'string',
        name: 'conditionCharacter',
        defaultValue: 'INCLUDE',
        lookupCode: 'SMCT.CENTRALIZED_CHARACTER',
      },
      {
        label: intl.get(`srm.common.supplier.model.evalDimensionValue`).d('值'),
        name: 'centralizedConditionValueList',
        type: 'object',
        required: true,
        multiple: true,
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
