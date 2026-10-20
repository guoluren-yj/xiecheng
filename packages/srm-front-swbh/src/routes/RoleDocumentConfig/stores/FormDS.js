import intl from 'utils/intl';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isTenantRoleLevel } from 'utils/utils';

const isTenant = isTenantRoleLevel();
const dynamicTypeForm = () => ({
  fields: [
    {
      name: 'tenantId',
      type: FieldType.object,
      lovCode: 'HPFM.TENANT',
      label: intl.get('swbh.common.view.message.header.tenanted').d('所属租户'),
      dynamicProps: {
        required: () => {
          return !isTenant;
        },
      },
      transformResponse: (value, object) =>
        value && {
          tenantId: object?.tenantId,
          tenantName: object?.tenantName,
          tenantNum: object?.tenantNum,
        },
      transformRequest: (value) => value?.tenantId,
    },
    {
      name: 'tenantNum',
      bind: 'tenantId.tenantNum',
    },
    {
      name: 'tenantName',
      bind: 'tenantId.tenantName',
    },
    {
      name: 'categoryCode',
      type: FieldType.string,
      required: true,
      label: intl.get('swbh.common.view.message.header.categoryCode').d('类型编码'),
    },
    {
      name: 'categoryName',
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.typeConcern').d('关注类型'),
      required: true,
    },
    {
      name: 'color',
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.followColor').d('关注颜色'),
      required: true,
      lookupCode: 'SWBH.ACTION_LABEL',
    },
    {
      name: 'orderSeq',
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.orderSeq').d('展示顺序'),
      required: true,
    },
    {
      name: 'enabledFlag',
      type: FieldType.number,
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enabled').d('启用'),
    },
  ],
});

const dynamicDefineForm = () => ({
  fields: [
    {
      name: 'tenantId',
      type: FieldType.object,
      lovCode: 'HPFM.TENANT',
      label: intl.get('swbh.common.view.message.header.tenanted').d('所属租户'),
      dynamicProps: {
        required: () => {
          return !isTenant;
        },
      },
      transformResponse: (value, object) =>
        value && {
          tenantId: object?.tenantId,
          tenantName: object?.tenantName,
          tenantNum: object?.tenantNum,
        },
      transformRequest: (value) => value?.tenantId,
    },
    {
      name: 'tenantNum',
      bind: 'tenantId.tenantNum',
    },
    {
      name: 'tenantName',
      bind: 'tenantId.tenantName',
    },
    {
      name: 'tenantName', // 租户名称
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.tenanted').d('所属租户'),
    },
    {
      label: intl.get('swbh.common.view.message.header.combineCode').d('单据对象'),
      name: 'combineCode',
      type: FieldType.object,
      lovCode: 'SWBH.COMBINE_OBJECT',
      required: true,
      transformResponse: (value, object) =>
        value && {
          combineCode: object?.combineCode,
          combineName: object?.combineName,
        },
      transformRequest: (value) => value?.combineCode,
    },
    {
      label: intl.get('swbh.common.view.message.header.followCode').d('关注编码'),
      name: 'actionCode',
      type: FieldType.string,
      required: true,
    },
    {
      label: intl.get('swbh.common.view.message.header.followTitle').d('关注标题'),
      name: 'actionTitle',
      type: 'intl',
      required: true,
    },
    // 平台级
    // {
    //   name: 'categoryId',
    //   label: intl.get('swbh.common.view.message.header.typeConcern').d('关注类型'),
    //   type: FieldType.object,
    //   lovCode: isTenant ? 'SWBH.ACTION_CATEGORY' : 'SWBH.ACTION_CATEGORY_SITE',
    //   required: true,
    //   // dynamicProps: {
    //   //   required: () => {
    //   //     return !isTenant;
    //   //   },
    //   // },
    //   transformResponse: (value, object) =>
    //     value && {
    //       categoryId: object?.categoryId,
    //       categoryName: object?.categoryName,
    //       categoryCode: object?.categoryCode,
    //     },
    //   transformRequest: (value) => value?.categoryId,
    // },
    // {
    //   name: 'categoryName',
    //   bind: 'categoryId.categoryName',
    // },
    // {
    //   name: 'categoryCode',
    //   bind: 'categoryId.categoryCode',
    // },
    {
      name: 'color',
      type: FieldType.string,
      // required: true,
      label: intl.get('swbh.common.view.message.header.titleColor').d('标题颜色'),
      lookupCode: 'SWBH.ACTION_LABEL',
    },
    {
      name: 'triggerMethod',
      label: intl.get('swbh.common.view.message.header.triggerMethod').d('触发方式'),
      type: FieldType.string,
      lookupCode: 'SWBH.TRIGGER_METHOD',
      dynamicProps: {
        required: () => {
          return !isTenant;
        },
      },
    },
    {
      name: 'triggerMethodMeaning',
      label: intl.get('swbh.common.view.message.header.triggerMethodMeaning').d('触发方式'),
      type: FieldType.string,
    },
    {
      name: 'actionDesc',
      label: intl.get('swbh.common.view.message.header.attentionDescription').d('关注描述'),
      type: 'intl',
      dynamicProps: {
        required: () => {
          return !isTenant;
        },
      },
    },
    {
      name: 'executeFrequency',
      label: intl.get('swbh.common.view.message.header.executeFrequency').d('执行频率'),
      type: FieldType.string,
      lookupCode: 'SWBH.EXECUTE_FREQUENCY',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('triggerMethod') === 'TIMING';
        },
      },
    },
    {
      name: 'priority',
      label: intl.get('swbh.common.view.message.header.priority').d('紧急程度'),
      type: FieldType.string,
      required: true,
      lookupCode: 'SWBH.PRIORITY',
    },
    {
      name: 'orderSeq',
      type: FieldType.number,
      required: true,
      label: intl.get('swbh.common.view.message.header.orderSeq').d('展示顺序'),
    },
    {
      name: 'enabledFlag',
      type: FieldType.number,
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enabled').d('启用'),
    },
  ],
});
const toDoDefineForm = () => ({
  fields: [
    {
      name: 'tenantId',
      type: FieldType.object,
      lovCode: 'HPFM.TENANT',
      label: intl.get('swbh.common.view.message.header.tenanted').d('所属租户'),
      dynamicProps: {
        required: () => {
          return !isTenant;
        },
      },
      transformResponse: (value, object) =>
        value && {
          tenantId: object?.tenantId,
          tenantName: object?.tenantName,
          tenantNum: object?.tenantNum,
        },
      transformRequest: (value) => value?.tenantId,
    },
    // {
    //   name: 'tenantId',
    //   bind: 'tenantId.tenantNum',
    // },
    {
      name: 'tenantNum',
      bind: 'tenantId.tenantNum',
    },
    {
      name: 'tenantName',
      bind: 'tenantId.tenantName',
    },
    {
      name: 'tenantName', // 租户名称
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.tenanted').d('所属租户'),
    },
    {
      label: intl.get('swbh.common.view.message.header.combineCode').d('单据对象'),
      name: 'combineCode',
      type: FieldType.object,
      lovCode: 'SWBH.COMBINE_OBJECT',
      required: true,
      transformResponse: (value) => value && { combineCode: value },
      transformRequest: (value) => value?.combineCode,
    },
    {
      name: 'combineName',
      bind: 'combineCode.combineName',
    },
    {
      label: intl.get('swbh.common.view.message.header.toDoCode').d('待办编码'),
      name: 'todoCode',
      type: FieldType.string,
      required: true,
    },
    {
      label: intl.get('swbh.common.view.message.header.toDoTitle').d('待办标题'),
      name: 'todoTitle',
      type: 'intl',
      required: true,
    },
    {
      name: 'type',
      type: FieldType.string,
      required: true,
      lookupCode: 'SWBH.TODO_TYPE',
      label: intl.get('swbh.common.view.message.header.toDoType').d('待办类型'),
    },
    {
      name: 'orderSeq',
      type: FieldType.number,
      required: true,
      label: intl.get('swbh.common.view.message.header.orderSeq').d('展示顺序'),
    },
    {
      name: 'buttonName',
      label: intl.get('swbh.common.view.message.header.buttonName').d('按钮名称'),
      type: 'intl',
    },
    {
      name: 'detailPageLink',
      type: FieldType.string,
      label: intl.get('swbh.common.view.message.header.detailPageLink').d('详情页链接'),
    },
    {
      label: intl.get('swbh.common.view.message.header.parameters').d('传入参数'),
      name: 'parameters',
      type: FieldType.string,
    },
    {
      name: 'enabledFlag',
      type: FieldType.number,
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enabled').d('启用'),
    },
  ],
});
export { dynamicTypeForm, dynamicDefineForm, toDoDefineForm };
