// import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { DataSet } from 'choerodon-ui/pro';

import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'sprm.forecastMgt.model.common';

// 特性条件 ds
export function getCondOperatorDs() {
  return [
    // { value: 'context', meaning: intl.get('hpfm.customize.common.contextParam').d('上下文参数') },
    // { value: 'fixed', meaning: intl.get('hpfm.customize.common.fixed').d('固定值') },
    { value: 'unit', meaning: intl.get('hpfm.customize.common.unit').d('表单字段') },
  ];
}

const HeaderDs = ({ templateHeaderId }) => ({
  paging: false,
  selection: false,
  autoQuery: false,
  autoCreate: true,
  fields: [
    {
      name: 'templateCode',
      required: true,
      pattern: /^[a-zA-Z0-9][a-zA-Z0-9-_./]*$/,
      label: intl.get(`${commonPrompt}.templateCode`).d('预测模板编码'),
    },
    {
      name: 'templateName',
      required: true,
      label: intl.get(`${commonPrompt}.templateName`).d('预测模板名称'),
      type: 'intl',
    },
    {
      name: 'enabledFlag',
      required: true,
      lookupCode: 'HPFM.FLAG',
      label: intl.get(`${commonPrompt}.enabledFlag`).d('是否启用'),
    },
    {
      name: 'templateStatusShow',
      lookupCode: 'SPRM.FCST_TEMPLATE_STATUS_SHOW',
      label: intl.get(`${commonPrompt}.templateStatus`).d('状态'),
    },
    {
      name: 'createdByName',
      label: intl.get(`${commonPrompt}.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
    },
    {
      name: 'needFeedback',
      label: intl.get(`${commonPrompt}.needFeedback`).d('供应商是否需要反馈'),
      help: intl
        .get('sprm.forecastMgt.view.help.needFeedback')
        .d('无需反馈：则发布后自动修改状态为已反馈'),
    },
    {
      name: 'allowChange',
      label: intl.get(`${commonPrompt}.allowChange`).d('已发布是否允许采购方变更'),
      help: intl
        .get('sprm.forecastMgt.view.help.allowChange')
        .d(
          '允许：发布后可变更预测数据，变更后生成已变更状态单据，再次发布后可同步给供应商并更新原单据；不允许：则已发布后不可变更预测数据'
        ),
    },
    {
      name: 'predictionDimensionCnf',
      defaultValue: 'QUANTITY',
      lookupCode: 'SPRM.FCST_PREDICTION_DIMENSION_CNF',
      label: intl.get(`${commonPrompt}.predictionCategory`).d('预测类别'),
      help: intl
        .get('sprm.forecastMgt.view.help.predictionDimensionCnf')
        .d('预测类别指预测单的高阶维度类型是什么，预测单有基础字段“类别”区分记录显示'),
    },
    {
      name: 'weekCarryoverDimension',
      defaultValue: 'SEVEN_DAY',
      label: intl.get(`${commonPrompt}.weekCarryoverDimension`).d('周结方式'),
      help: intl
        .get('sprm.forecastMgt.view.help.weekCarryoverDimension')
        .d(
          '定义周维度的每周日期范围，按周五结：表示每周以周五结束，第一周可能非整7天，按周末结：表示每周以周日结束，第一周可能非整7天，按7天结：表示每周均为7天'
        ),
    },
    {
      name: 'monthCarryoverDimension',
      defaultValue: 'THIRTY_OR_ONE',
      label: intl.get(`${commonPrompt}.monthCarryoverDimension`).d('月结方式'),
      help: intl
        .get('sprm.forecastMgt.view.help.monthCarryoverDimension')
        .d(
          '定义月维度的每月日期范围，月末截止：表示每月以月底结束，第一月可能非整30/31天；整月截止：表示起始日期到下个月月底'
        ),
    },
    {
      name: 'versionViewDimension',
      defaultValue: 'NONE',
      lookupCode: 'SPRM.FCST_TEMPLATE_VERSION_VIEW_DIMENSION',
      label: intl.get(`${commonPrompt}.versionViewDimension`).d('版本视图及版本定义'),
      dynamicProps: {
        disabled({ record }) {
          return [1, '1'].includes(record.get('detailFeedbackFlag'));
        },
      },
      help: intl
        .get('sprm.forecastMgt.view.help.versionViewDimension')
        .d(
          '定义预测管理工作台全部页签是否展示版本视图，并定义版本的逻辑。无：表示不展示版本视图；发布记录：表示以预测单的发布记录为历史版本；公司+物料+供应商：表示预测日期不同，但相同维度的预测单为不同版本'
        ),
    },
    {
      name: 'feedbackAutoFill',
      defaultValue: 1,
      label: intl
        .get(`${commonPrompt}.supFeedValueDefEquailPredicted`)
        .d('供应商反馈值默认等于预测值'),
      help: intl
        .get('sprm.forecastMgt.view.help.feedbackAutoFill')
        .d('是：则反馈工作台反馈数量有默认值且默认值等于预测值；无：则无默认值'),
    },
    {
      name: 'feedbackChangeCnf',
      defaultValue: 'NONE',
      lookupCode: 'SPRM.FCST_FEEDBACK_CHANGE_CNF',
      label: intl.get(`${commonPrompt}.feedbackChangeCnf`).d('已反馈状态变更配置'),
      help: intl
        .get('sprm.forecastMgt.view.help.feedbackChangeCnf')
        .d(
          '可变更：则已反馈后可变更预测数据，生成已变更状态单据，再次发布后可同步给供应商并更新原单据；不可变更：则不可变更'
        ),
    },
    {
      name: 'offlineInputFlag',
      defaultValue: 0,
      label: intl.get(`${commonPrompt}.offlineInputFlag`).d('是否需线下录入供应商结果'),
      help: intl
        .get('sprm.forecastMgt.view.help.offlineInputFlag')
        .d(
          '需要：主要针对不使用预测反馈工作台的强势供应商，预测管理工作台增加线下结果录入和线下结果导出按钮，支持采购方维护反馈数据'
        ),
    },
    {
      name: 'detailFeedbackFlag',
      defaultValue: 0,
      lookupCode: 'HPFM.FLAG',
      transformRequest: value => Number(value),
      transformResponse: value => {
        return String(value);
      },
      label: intl.get(`${commonPrompt}.detailFeedbackFlag`).d('是否启用明细反馈'),
      help: intl
        .get('sprm.forecastMgt.view.help.detailFeedbackFlag')
        .d('启用：则可以维护周，月维度的明细预测情况；不启用：则维护总量'),
    },
    {
      name: 'deliverControlType',
      lookupCode: 'HPFM.FLAG',
      label: intl.get(`${commonPrompt}.synchronousLogistics`).d('是否同步物流'),
      help: intl
        .get('sprm.forecastMgt.view.help.deliverControlType')
        .d('预测单反馈完成后同步给物流模块'),
    },
    {
      name: 'feedbackApprovalMethod',
      lookupCode: 'SPRM.FCST_FEEDBACK_APPROVAL_METHOD',
      label: intl.get(`${commonPrompt}.feedbackApprovalMethod`).d('反馈审批方式配置'),
      help: intl
        .get('sprm.forecastMgt.view.help.feedbackApprovalMethod')
        .d('定义反馈审批方式，目前只支持功能审批'),
    },
    {
      name: 'feedbackSyncFlag',
      defaultValue: 0,
      lookupCode: 'HPFM.FLAG',
      transformRequest: value => Number(value),
      transformResponse: value => {
        return String(value);
      },
      label: intl.get(`${commonPrompt}.feedbackSyncFlag`).d('反馈完成是否同步外部系统'),
      help: intl
        .get('sprm.forecastMgt.view.help.feedbackSyncFlag')
        .d('预测单反馈完成后同步外部系统'),
    },
    {
      name: 'deliverControlNode',
      lookupCode: 'SPRM.FCST_DELIVER_CONTROL_NODE',
      label: intl.get(`${commonPrompt}.deliverControlNode`).d('交货节点'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/fcst-template-headers/${templateHeaderId}`,
        method: 'GET',
      };
    },
  },
  events: {
    update: ({ name, value, record }) => {
      if (name === 'detailFeedbackFlag' && [1, '1'].includes(value)) {
        record.set({ versionViewDimension: 'NONE' });
      }
    },
  },
});

const ListDs = ({ templateHeaderId, readOnly }) => ({
  primaryKey: 'templateLineId',
  dataToJSON: 'all',
  paging: false,
  selection: !readOnly ? 'multiple' : false,
  fields: [
    {
      name: 'fieldType',
      disabled: true,
      defaultValue: 'EXPAND',
      label: intl.get(`${commonPrompt}.fieldype`).d('类型'),
      lookupCode: 'SPRM.FCST_TEMPLATE_FILED_TYPE',
    },
    {
      name: 'gridSeq',
      required: true,
      precision: 0,
      type: 'number',
      label: intl.get(`${commonPrompt}.gridSeq`).d('展示顺序'),
    },
    {
      name: 'fcstSeq',
      type: 'number',
    },
    {
      name: 'fcstLineType',
    },
    {
      name: 'fieldCode',
      required: true,
      type: 'object',
      textField: 'fieldCode',
      lovPara: { templateHeaderId },
      dynamicProps: {
        // 标准字段不允许修改字段编码
        disabled({ record }) {
          return record.get('fieldType') !== 'EXPAND';
        },
      },
      label: intl.get(`${commonPrompt}.fieldCode`).d('字段编码'),
      lovCode: 'SPRM_FCST_FIELDS',
      transformRequest: value => value?.fieldCode,
      transformResponse: (value, object) => {
        return object?.fieldCode
          ? {
              ...object,
              fieldCode: object?.fieldCode,
              fcstDate: object?.fieldCode,
            }
          : null;
      },
    },
    {
      name: 'fieldName',
      // dynamicProps: {
      //   disabled({ record }) {
      //     return record.get('fieldType') === 'STANDARD_NOT_EDITABLE';
      //   },
      // },
      required: true,
      label: intl.get(`${commonPrompt}.fieldName`).d('字段名称'),
      type: 'intl',
    },
    {
      name: 'fcstDate',
    },
    {
      name: 'showFieldFlag',
      type: 'boolean',
      dynamicProps: {
        disabled({ record }) {
          return record.get('fieldType') === 'STANDARD_NOT_EDITABLE';
        },
      },
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`${commonPrompt}.showFieldFlag`).d('是否显示'),
    },
    {
      name: 'fieldEditable',
      label: intl.get(`${commonPrompt}.fieldEditable`).d('是否可编辑'),
      type: 'boolean',
      trueValue: 1,
      defaultValue: 1,
      dynamicProps: {
        disabled({ record }) {
          return ['STANDARD_NOT_EDITABLE', 'CUSTOMIZE'].includes(record.get('fieldType'));
        },
      },
      falseValue: 0,
    },
    {
      name: 'fieldRequired',
      label: intl.get(`${commonPrompt}.fieldRequired`).d('是否必输'),
      type: 'boolean',
      trueValue: 1,
      dynamicProps: {
        disabled({ record }) {
          return ['STANDARD_NOT_EDITABLE', 'CUSTOMIZE'].includes(record.get('fieldType'));
        },
      },
      falseValue: 0,
    },
    {
      name: 'supplierRequired',
      label: intl.get(`${commonPrompt}.supplierRequired`).d('供应商必输'),
      type: 'boolean',
      trueValue: 1,
      dynamicProps: {
        disabled({ record }) {
          return ['STANDARD_NOT_EDITABLE', 'CUSTOMIZE'].includes(record.get('fieldType'));
        },
      },
      falseValue: 0,
    },
    {
      name: 'gridFixed',
      lookupCode: 'SPRM.FCST_TEMPLATE_FILED_FIXED',
      defaultValue: 'N',
      label: intl.get(`${commonPrompt}.gridFixed`).d('固定方式'),
    },
    {
      name: 'fieldWidget',
      dynamicProps: {
        disabled({ record }) {
          return ['STANDARD_NOT_EDITABLE', 'CUSTOMIZE'].includes(record.get('fieldType'));
        },
      },
      required: true,
      label: intl.get(`${commonPrompt}.fieldWidget`).d('组件类型'),
      lookupCode: 'SPRM.FCST_TEMPLATE_FILED_WIDGET',
      lookupAxiosConfig: () => ({
        transformResponse(data) {
          const fieldWidgetList = typeof data === 'string' ? JSON.parse(data) : data;
          return fieldWidgetList.filter(item => !['LINK', 'UPLOAD'].includes(item.value));
        },
      }),
    },
    {
      name: 'enabledFlag',
      label: intl.get(`${commonPrompt}.templateStatus`).d('状态'),
      type: 'boolean',
      defaultValue: 1,
      dynamicProps: {
        disabled({ record }) {
          return ['STANDARD_NOT_EDITABLE', 'CUSTOMIZE'].includes(record.get('fieldType'));
        },
      },
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'gridWidth',
      type: 'number',
      defaultValue: 150,
      label: intl.get(`${commonPrompt}.gridWidth`).d('字段宽度'),
    },
    {
      name: 'supplierEditable',
      label: intl.get(`${commonPrompt}.supplierEditable`).d('供应商是否可编辑'),
      type: 'boolean',
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'supplierDisplayFlag',
      label: intl.get(`${commonPrompt}.supplierDisplayFlag`).d('供应商是否显示'),
      type: 'boolean',
      dynamicProps: {
        disabled: ({ record }) =>
          record.get('fieldType') !== 'EXPAND' || record.get('showFieldFlag') !== 1,
      },
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
    },
    { name: 'sourceCode' },
    { name: 'sourceCodeMeaning' },
    {
      name: 'componentDetail',
      label: intl.get(`${commonPrompt}.componentDetail`).d('组件详情'),
      dynamicProps: {
        disabled({ record }) {
          return record.get('fieldType') === 'STANDARD_NOT_EDITABLE';
        },
      },
    },
  ],
  events: {
    update: ({ record, name, value = {} }) => {
      if (name === 'fieldCode' && value) {
        record.set({ fieldName: value.remarks });
      }
    },
    load: ({ dataSet }) => {
      dataSet.forEach(ele => {
        if (
          ['STANDARD_NOT_EDITABLE', 'STANDARD_EDITABLE', 'CUSTOMIZE'].includes(ele.get('fieldType'))
        ) {
          // eslint-disable-next-line no-param-reassign
          ele.selectable = false;
        }
      });
    },
  },
});

// 预测单动态列
const FsListDs = ({ readOnly }) => ({
  primaryKey: 'templateDimensionId',
  dataToJSON: 'all',
  paging: false,
  selection: !readOnly ? 'multiple' : false,
  fields: [
    {
      name: 'dimensionCode',
      lookupCode: 'SPRM.FCST_DIMENSION_TYPE',
      required: true,
      valueField: 'value',
      textField: 'value',
      type: 'object',
      label: intl.get(`${commonPrompt}.dimensionCode`).d('维度编码'),
      transformRequest: value => value && value.value,
      transformResponse: (value, object) => {
        return object?.dimensionCode
          ? {
              ...object,
              dimensionCode: object?.dimensionCode,
              value: object?.dimensionCode,
            }
          : {};
      },
    },
    {
      name: 'dimensionCodeMeaning',
      required: true,
      type: 'intl',
      label: intl.get(`${commonPrompt}.dimensionMeaning`).d('维度名称'),
    },
    {
      name: 'dimensionValue',
      type: 'number',
      precision: 0,
      dynamicProps: {
        required: ({ record }) =>
          !['SUM_BY_YEAR', 'SUM_BY_MONTH', 'SUM_BY_WEEK', 'SUM_BY_DAY'].includes(
            record.get('dimensionCode')?.value
          ),
        disabled: ({ record }) =>
          ['SUM_BY_YEAR', 'SUM_BY_MONTH', 'SUM_BY_WEEK', 'SUM_BY_DAY'].includes(
            record.get('dimensionCode')?.value
          ),
      },
      label: intl.get(`${commonPrompt}.dimensionValue`).d('维度值'),
    },
    {
      name: 'dimensionSeq',
      required: true,
      type: 'number',
      precision: 0,
      min: 0,
      label: intl.get(`${commonPrompt}.dimensionSeq`).d('维度展示顺序'),
    },
    {
      name: 'sumWithinDimension',
      required: false,
      type: 'number',
      dynamicProps: {
        max: ({ record }) => record.get('dimensionValue'),
      },
      precision: 0,
      label: intl.get(`${commonPrompt}.sumWithinDimension`).d('按周期汇总'),
    },
    { name: 'fsAction', label: intl.get(`${commonPrompt}.fsAction`).d('操作') },
  ],
  events: {
    update: ({ record, name, value = {} }) => {
      if (name === 'dimensionCode' && value) {
        if (!['SUM_BY_YEAR', 'SUM_BY_MONTH', 'SUM_BY_WEEK', 'SUM_BY_DAY'].includes(value)) {
          record.set({
            dimensionCodeMeaning: value.meaning,
            sumWithinDimension: undefined,
          });
        } else if (value !== 'DAY') {
          record.set({ dimensionCodeMeaning: value.meaning, sumWithinDimension: undefined });
        } else {
          record.set({ dimensionCodeMeaning: value.meaning });
        }
      }
    },
  },
});

// 组件类型配置
const ComponetSeting = () => ({
  page: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'sourceCode',
      required: true,
      type: 'object',
      dynamicProps: {
        lovCode: ({ record }) => {
          return record.get('type') === 'LOV'
            ? '	HPFM.LOV.VIEW.ORG'
            : '	HPFM.LOV.LOV_DETAIL_CODE.ORG';
        },
        textField: ({ record }) => (record.get('type') === 'LOV' ? 'viewCode' : 'lovCode'),
        disabled({ record }) {
          return record.get('fieldType') === 'STANDARD_NOT_EDITABLE';
        },
      },
      label: intl.get(`${commonPrompt}.sourceCode`).d('值集编码'),
      transformRequest: value => value.viewCode || value.lovCode,
      transformResponse: (value, object) => {
        return value
          ? {
              ...object,
              sourceCode: object?.sourceCode || value,
              viewCode: object?.sourceCode || value,
              lovCode: object?.sourceCode || value,
            }
          : null;
      },
    },
    {
      name: 'sourceCodeMeaning',
      required: true,
      dynamicProps: {
        disabled({ record }) {
          return record.get('fieldType') === 'STANDARD_NOT_EDITABLE';
        },
      },
      label: intl.get(`${commonPrompt}.sourceCodeMeaning`).d('值集名称'),
    },
    {
      name: 'paramsSetting',
      required: false,
      label: intl.get(`${commonPrompt}.paramsSetting`).d('值集参数'),
    },
  ],
  events: {
    update: ({ record, name, value = {} }) => {
      if (name === 'sourceCode' && value) {
        record.set({ sourceCodeMeaning: value.viewName || value.lovName });
      }
    },
  },
});

// 值集参数配置
const paramsSetting = ({ templateHeaderId, templateLineId }) => ({
  page: false,
  autoQuery: true,
  dataToJSON: 'all',
  paging: false,
  autoCreate: false,
  fields: [
    {
      name: 'lovParamName',
      required: true,
      type: 'string',
      label: intl.get(`hwfp.serviceDefinition.model.scriptParam.description`).d('参数名'),
    },
    {
      name: 'lovParamType',
      required: true,
      textField: 'meaning',
      options: new DataSet({
        selection: 'single',
        data: getCondOperatorDs(),
      }),
      defaultValue: 'unit',
      label: intl.get(`hwfp.serviceDefinition.model.param.parameterType`).d('参数名'),
    },
    {
      label: intl.get(`hwfp.serviceDefinition.model.scriptParam.value`).d('参数值'),
      name: 'lovValueCode',
      required: true,
      type: 'object',
      lovPara: { templateHeaderId },
      lovCode: 'SPRM.FCST_TEM_LINE_FIELD_LIST',
      textField: 'fieldCode',
      transformRequest: value => value?.fieldCode,
      transformResponse: (value, object) => {
        return object?.lovValueCode
          ? {
              ...object,
              fieldCode: object?.lovValueCode,
            }
          : null;
      },
    },
  ],
  events: {
    update: ({ record, name, value = {} }) => {
      if (name === 'sourceCode' && value) {
        record.set({ sourceCodeMeaning: value.viewName || value.lovName });
      }
    },
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/fcst-template-lov-params`,
        method: 'GET',
        data: { templateLineId },
      };
    },
  },
});

export { HeaderDs, ListDs, FsListDs, ComponetSeting, paramsSetting };
