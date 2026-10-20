import intl from 'utils/intl';
import DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isTenantRoleLevel } from 'utils/utils';

import { PublishStatus } from '../../components/utils/common';
import { lowcodeOrganizationURL } from '../../components/utils';
import { SRM_SWBH } from '../../components/utils/config';

const isTenant = isTenantRoleLevel();

// 关注类型
const dynamicTypeDS = () => ({
  selection: false,
  dataToJSON: 'all',
  queryFields: [
    !isTenant && {
      label: intl.get('hzero.common.model.common.tenanted').d('所属租户'),
      name: 'tenantId',
      type: FieldType.object,
      lovCode: 'HPFM.TENANT',
      transformRequest: (value) => value?.tenantId,
    },
    {
      label: intl.get('swbh.common.view.message.header.categoryCode').d('类型编码'),
      name: 'categoryCode',
      type: FieldType.string,
    },
    {
      name: 'categoryName',
      label: intl.get('swbh.common.view.message.header.typeConcern').d('关注类型'),
      type: FieldType.string,
    },

    {
      label: intl.get('swbh.common.view.message.header.status').d('状态'),
      name: 'enabledFlag',
      type: FieldType.string,
      textField: 'text',
      valueField: 'value',
      // lookupCode: 'SWBH.FIELD.TRANSLATE_TYPE',
      options: new DataSet({
        selection: DataSetSelection.single,
        data: [
          {
            text: intl.get('hzero.common.status.enabled').d('启用'),
            value: PublishStatus.ENABLE,
          },
          {
            text: intl.get('hzero.common.button.disable').d('禁用'),
            value: PublishStatus.DISABLE,
          },
        ],
      }),
    },
  ],
  fields: [
    {
      name: 'categoryId',
      type: FieldType.string, // 主键ID
    },
    {
      name: 'tenantName',
      type: FieldType.string,
      label: intl.get('hzero.common.model.common.tenant').d('租户'),
    },
    {
      name: 'categoryCode',
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.categoryCode').d('类型编码'),
    },
    {
      name: 'categoryName',
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.typeConcern').d('关注类型'),
    },
    {
      name: 'color',
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.followColor').d('关注颜色'),
    },
    {
      name: 'orderSeq',
      type: FieldType.number,
      label: intl.get('swbh.common.view.message.header.orderSeq').d('展示顺序'),
    },
    {
      name: 'enabledFlag',
      type: FieldType.number,
      // lookupCode: 'SWBH.FIELD.TRANSLATE_TYPE',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('swbh.common.view.message.header.status').d('状态'),
    },
    {
      label: intl.get('swbh.common.view.message.header.operation').d('操作'),
      name: 'operation',
      type: FieldType.string,
    },
  ],
  transport: {
    read: () => {
      const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/action-category/list`;
      return {
        url,
        method: 'GET',
      };
    },
  },
});
// 关注定义
const dynamicDefineDS = (params = null) => ({
  primaryKey: 'actionId',
  cacheSelection: params === 'quote',
  selection: params === 'quote' ? 'multiple' : false,
  dataToJSON: 'all',
  queryFields:
    params === 'quote'
      ? [
          {
            label: intl.get('swbh.common.view.message.header.followTitle').d('关注标题'),
            name: 'actionTitle',
            type: FieldType.string,
          },
          {
            label: intl.get('swbh.common.view.message.header.combineCode').d('单据对象'),
            name: 'combineCode',
            type: FieldType.object,
            lovCode: 'SWBH.COMBINE_OBJECT',
            transformResponse: (value) => value && { combineCode: value },
            transformRequest: (value) => value?.combineCode,
          },
          {
            label: intl.get('swbh.common.view.message.header.followCode').d('关注编码'),
            name: 'actionCode',
            type: FieldType.string,
          },
        ]
      : [
          !isTenant && {
            label: intl.get('hzero.common.model.common.tenanted').d('所属租户'),
            name: 'tenantId',
            type: FieldType.object,
            lovCode: 'HPFM.TENANT',
            transformRequest: (value) => value?.tenantId,
          },
          {
            label: intl.get('swbh.common.view.message.header.combineCode').d('单据对象'),
            name: 'combineCode',
            type: FieldType.object,
            lovCode: 'SWBH.COMBINE_OBJECT',
            transformResponse: (value) => value && { combineCode: value },
            transformRequest: (value) => value?.combineCode,
          },
          {
            label: intl.get('swbh.common.view.message.header.followCode').d('关注编码'),
            name: 'actionCode',
            type: FieldType.string,
          },
          {
            label: intl.get('swbh.common.view.message.header.followTitle').d('关注标题'),
            name: 'actionTitle',
            type: FieldType.string,
          },
          // {
          //   name: 'categoryId',
          //   label: intl.get('swbh.common.view.message.header.typeConcern').d('关注类型'),
          //   type: FieldType.object,
          //   lovCode: isTenant ? 'SWBH.ACTION_CATEGORY' : 'SWBH.ACTION_CATEGORY_SITE',
          //   transformResponse: (value) => value && { categoryId: value },
          //   transformRequest: (value) => value?.categoryId,
          // },
          !isTenant && {
            name: 'triggerMethod',
            label: intl.get('swbh.common.view.message.header.triggerMode').d('触发方式'),
            type: FieldType.string,
            lookupCode: 'SWBH.TRIGGER_METHOD',
          },
          {
            label: intl.get('swbh.common.view.message.header.status').d('状态'),
            name: 'enabledFlag',
            type: FieldType.string,
            textField: 'text',
            valueField: 'value',
            // lookupCode: 'SWBH.FIELD.TRANSLATE_TYPE',
            options: new DataSet({
              selection: DataSetSelection.single,
              data: [
                {
                  text: intl.get('hzero.common.status.enabled').d('启用'),
                  value: PublishStatus.ENABLE,
                },
                {
                  text: intl.get('hzero.common.button.disable').d('禁用'),
                  value: PublishStatus.DISABLE,
                },
              ],
            }),
          },
        ],
  fields: [
    {
      name: 'actionId',
      type: FieldType.string, // 主键
    },
    {
      name: 'tenantId',
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.tenant').d('租户'),
      lovCode: 'HPFM.TENANT',
    },
    {
      name: 'tenantName', // 租户名称
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.tenant').d('租户'),
    },
    {
      name: 'combineName',
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.combineCode').d('单据对象'),
    },
    {
      label: intl.get('swbh.common.view.message.header.followCode').d('关注编码'),
      name: 'actionCode',
      type: FieldType.string,
    },
    {
      label: intl.get('swbh.common.view.message.header.followTitle').d('关注标题'),
      name: 'actionTitle',
      type: FieldType.string,
    },
    // {
    //   name: 'categoryName',
    //   label: intl.get('swbh.common.view.message.header.typeConcern').d('关注类型'),
    //   type: FieldType.string,
    //   // lovCode: 'SPFM.USER_AUTH.OU',
    // },
    {
      name: 'triggerMethod',
      type: FieldType.string,
      lookupCode: 'SWBH.TRIGGER_METHOD',
    },
    {
      name: 'triggerMethodMeaning',
      label: intl.get('swbh.common.view.message.header.triggerMethodMeaning').d('触发方式'),
      type: FieldType.string,
    },
    {
      name: 'executeFrequency',
      type: FieldType.string,
      lookupCode: 'SWBH.EXECUTE_FREQUENCY',
    },
    {
      name: 'executeFrequencyMeaning',
      label: intl.get('swbh.common.view.message.header.executeFrequencyMeaning').d('执行频率'),
      type: FieldType.string,
    },
    {
      name: 'actionDesc',
      label: intl.get('swbh.common.view.message.header.attentionDescription').d('关注描述'),
      type: FieldType.string,
      // required: true,
    },
    {
      name: 'priorityMeaning',
      label: intl.get('swbh.common.view.message.header.priorityMeaning').d('紧急程度'),
      type: FieldType.string,
    },
    {
      name: 'enabledFlag',
      type: FieldType.number,
      // lookupCode: 'SWBH.FIELD.TRANSLATE_TYPE',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('swbh.common.view.message.header.status').d('状态'),
    },
    {
      label: intl.get('swbh.common.view.message.header.operation').d('操作'),
      name: 'operation',
      type: FieldType.string,
    },
  ],
  transport: {
    read: () => {
      const url =
        params === 'quote'
          ? `${lowcodeOrganizationURL({ route: SRM_SWBH })}/action-definition/siteList?enabledFlag=1`
          : `${lowcodeOrganizationURL({ route: SRM_SWBH })}/action-definition/list`;
      return {
        url,
        method: 'GET',
      };
    },
  },
});
// 待办定义
const toDoDefinitionDS = (params = null) => ({
  primaryKey: 'todoId',
  cacheSelection: params === 'quote',
  selection: params === 'quote' ? 'multiple' : false,
  dataToJSON: 'all',
  queryFields:
    params === 'quote'
      ? [
          {
            label: intl.get('swbh.common.view.message.header.todoTitle').d('待办标题'),
            name: 'todoTitle',
            type: FieldType.string,
          },
          {
            label: intl.get('swbh.common.view.message.header.combineCode').d('单据对象'),
            name: 'combineCode',
            type: FieldType.object,
            lovCode: 'SWBH.COMBINE_OBJECT',
            transformResponse: (value) => value && { combineCode: value },
            transformRequest: (value) => value?.combineCode,
          },
          {
            label: intl.get('swbh.common.view.message.header.todoCode').d('待办编码'),
            name: 'todoCode',
            type: FieldType.string,
          },
          {
            label: intl.get('swbh.common.view.message.header.toDoType').d('待办类型'),
            name: 'type',
            type: FieldType.string,
            lookupCode: 'SWBH.TODO_TYPE',
          },
        ]
      : [
          !isTenant && {
            label: intl.get('hzero.common.model.common.tenanted').d('所属租户'),
            name: 'tenantId',
            type: FieldType.object,
            lovCode: 'HPFM.TENANT',
            transformRequest: (value) => value?.tenantId,
          },
          {
            label: intl.get('swbh.common.view.message.header.combineCode').d('单据对象'),
            name: 'combineCode',
            type: FieldType.object,
            lovCode: 'SWBH.COMBINE_OBJECT',
            transformResponse: (value) => value && { combineCode: value },
            transformRequest: (value) => value?.combineCode,
          },
          {
            label: intl.get('swbh.common.view.message.header.todoCode').d('待办编码'),
            name: 'todoCode',
            type: FieldType.string,
          },
          {
            label: intl.get('swbh.common.view.message.header.todoTitle').d('待办标题'),
            name: 'todoTitle',
            type: FieldType.string,
          },
          {
            label: intl.get('swbh.common.view.message.header.toDoType').d('待办类型'),
            name: 'type',
            type: FieldType.string,
            lookupCode: 'SWBH.TODO_TYPE',
          },
          {
            label: intl.get('swbh.common.view.message.header.status').d('状态'),
            name: 'enabledFlag',
            type: FieldType.string,
            textField: 'text',
            valueField: 'value',
            options: new DataSet({
              selection: DataSetSelection.single,
              data: [
                {
                  text: intl.get('swbh.common.status.enable').d('启用'),
                  value: PublishStatus.ENABLE,
                },
                {
                  text: intl.get('swbh.common.status.disable').d('禁用'),
                  value: PublishStatus.DISABLE,
                },
              ],
            }),
          },
        ],
  fields: [
    {
      name: 'todoId',
      type: FieldType.string, // 主键
    },
    {
      name: 'tenantId',
      type: FieldType.object,
      lovCode: 'HPFM.TENANT',
      label: intl.get('swbh.common.view.message.header.tenant').d('租户'),
    },
    {
      name: 'tenantName', // 租户名称
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.tenant').d('租户'),
    },
    // {
    //   label: intl.get('swbh.common.view.message.header.combineCode').d('单据对象'),
    //   name: 'combineCode',
    //   type: FieldType.object,
    //   lovCode: 'SWBH.COMBINE_OBJECT',
    //   required: true,
    //   transformResponse: (value, object) =>
    //     value && {
    //       combineCode: object?.combineCode,
    //       combineName: object?.combineName,
    //     },
    //   transformRequest: (value) => value?.combineName,
    // },
    {
      name: 'combineName',
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.combineCode').d('单据对象'),
    },
    {
      label: intl.get('swbh.common.view.message.header.todoCode').d('待办编码'),
      name: 'todoCode',
      type: FieldType.string,
    },
    {
      label: intl.get('swbh.common.view.message.header.toDoTitle').d('待办标题'),
      name: 'todoTitle',
      type: FieldType.string,
    },
    {
      label: intl.get('swbh.common.view.message.header.toDoType').d('待办类型'),
      name: 'type',
      type: FieldType.string,
      lookupCode: 'SWBH.TODO_TYPE',
    },
    {
      name: 'buttonName',
      label: intl.get('swbh.common.view.message.header.operationButtonName').d('操作按钮名称'),
      type: FieldType.string,
    },
    {
      name: 'detailPageLink',
      label: intl.get('swbh.common.view.message.header.detailPageLink').d('详情页链接'),
      type: FieldType.string,
    },
    {
      label: intl.get('swbh.common.view.message.header.parameters').d('传入参数'),
      name: 'parameters',
      type: FieldType.string,
    },
    {
      name: 'enabledFlag',
      type: FieldType.number,
      // lookupCode: 'SWBH.FIELD.TRANSLATE_TYPE',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('swbh.common.view.message.header.status').d('状态'),
    },
    {
      label: intl.get('swbh.common.view.message.header.operation').d('操作'),
      name: 'operation',
      type: FieldType.string,
    },
  ],
  transport: {
    read: () => {
      const url =
        params === 'quote'
          ? `${lowcodeOrganizationURL({ route: SRM_SWBH })}/todo-definitions/siteList?enabledFlag=1`
          : `${lowcodeOrganizationURL({ route: SRM_SWBH })}/todo-definitions/list`;
      return {
        url,
        method: 'GET',
      };
    },
  },
});
// 动态定义
const triggerRuleDS = () => ({
  dataToJSON: 'all',
  autoCreate: true,
  fields: [
    {
      name: 'tenantName', // 租户名称
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.tenant').d('租户'),
    },
    {
      name: 'combineName',
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.combineCode').d('单据对象'),
    },
    {
      label: intl.get('swbh.common.view.message.header.followTitle').d('关注标题'),
      name: 'actionTitle',
      type: FieldType.string,
    },
    {
      name: 'triggerMethodMeaning',
      label: intl.get('swbh.common.view.message.header.triggerMethodMeaning').d('触发方式'),
      type: FieldType.string,
    },
    {
      name: 'executeFrequency',
      type: FieldType.string,
      lookupCode: 'SWBH.EXECUTE_FREQUENCY',
    },
    {
      name: 'executeFrequencyMeaning',
      label: intl.get('swbh.common.view.message.header.executeFrequencyMeaning').d('执行频率'),
      type: FieldType.string,
    },
    {
      name: 'actionDesc',
      label: intl.get('swbh.common.view.message.header.attentionDescription').d('关注描述'),
      type: FieldType.string,
      // required: true,
    },
    {
      label: intl.get('swbh.common.view.message.header.toDoTitle').d('待办标题'),
      name: 'todoTitle',
      type: FieldType.string,
    },
    {
      label: intl.get('swbh.common.view.message.header.toDoType').d('待办类型'),
      name: 'type',
      type: FieldType.string,
      lookupCode: 'SWBH.TODO_TYPE',
    },
    {
      name: 'generateType',
      label: intl.get('swbh.common.model.common.triggerConditionType').d('触发条件类型'),
      type: 'string',
      lookupCode: 'SWBH.GENERATE_TYPE',
      required: true,
      // dynamicProps: {
      //   required: () => {
      //     return !isTenant;
      //   },
      // },
    },
    {
      label: intl.get('swbh.common.view.message.header.generateApi').d('触发条件API'),
      name: 'generateApi',
      type: FieldType.string,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('generateType') === 'API';
        },
      },
    },
    {
      label: intl.get('swbh.common.view.message.header.generateAdapter').d('触发条件适配器'),
      name: 'generateAdapter',
      type: FieldType.string,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('generateType') === 'ADAPTER';
        },
      },
    },
    {
      name: 'defaultClearFlag',
      label: intl.get(`swbh.common.view.message.header.defaultClearFlag`).d('默认生成消除规则'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      // defaultValue: 1,
      disabled: true,
    },
  ],
});
export { dynamicTypeDS, dynamicDefineDS, toDoDefinitionDS, triggerRuleDS };
