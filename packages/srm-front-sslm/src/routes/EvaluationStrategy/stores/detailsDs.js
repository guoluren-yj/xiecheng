/**
 * @description: 获取整单Ds
 * @param {false|'multiple'|'single'} selection
 * @return {*}
 */
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const getBasicInfoDs = ({ isEdit } = {}) => {
  return {
    primaryKey: 'strategyId',
    paging: false,
    fields: [
      {
        name: 'strategyCode',
        label: intl.get('sslm.evaluationStrategyDetail.form.label.policyNum').d('策略编码'),
        disabled: true,
      },
      {
        name: 'strategyName',
        label: intl.get('sslm.evaluationStrategyDetail.form.label.policyName').d('策略名称'),
        required: isEdit,
      },
      {
        name: 'strategyStatus',
        label: intl.get('sslm.evaluationStrategyDetail.form.label.status').d('状态'),
        disabled: true,
        lookupCode: 'SSLM.LIFE_CYCLE_STRATEGY_STATUS',
      },
      {
        name: 'assessType',
        label: intl.get('sslm.evaluationStrategyDetail.form.label.assessType').d('评估类型'),
        lookupCode: 'SSLM_EVAL_PLAN_TYPE',
        required: isEdit,
        computedProps: {
          disabled: ({ record }) => {
            return record.get('versionNumber') > 1;
          },
        },
      },
      {
        name: 'versionNumber',
        label: intl.get('sslm.evaluationStrategyDetail.form.label.versionNumber').d('版本'),
        disabled: true,
      },
      {
        name: 'realName',
        label: intl.get('sslm.evaluationStrategyDetail.form.label.realName').d('创建人'),
        disabled: true,
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('sslm.evaluationStrategyDetail.form.label.creationDate').d('创建时间'),
        disabled: true,
      },
      {
        label: intl.get('sslm.evaluationStrategyDetail.form.label.needPlanFlag').d('需要评估计划'),
        name: 'needFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl
          .get('sslm.evaluationStrategyDetail.form.label.isPreciseFlag')
          .d('精确评估计划日期'),
        name: 'preciseFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        computedProps: {
          required: ({ record }) => {
            return isEdit && record.get('needFlag');
          },
          disabled: ({ record }) => {
            return !record.get('needFlag');
          },
        },
      },
      {
        name: 'evalType',
        label: intl.get('sslm.evaluationStrategyDetail.form.label.evalType').d('评分方式'),
        lookupCode: 'SSLM.SITE_EVAL_TYPE',
        required: isEdit,
        defaultValue: 'OFFLINE',
      },
      {
        label: intl.get('sslm.evaluationStrategyDetail.form.label.evalTemplate').d('评分模板'),
        name: 'evalTplCode',
        type: 'object',
        lovCode: 'SSLM.SITE_EVAL_TPL',
        lovPara: { tenantId: organizationId },
        textField: 'evalTplName',
        computedProps: {
          disabled: ({ record }) => {
            return record.get('evalType') !== 'ONLINE';
          },
          required: ({ record }) => {
            return isEdit && record.get('evalType') === 'ONLINE';
          },
        },
        transformRequest: value => (value ? value.evalTplCode : null),
        transformResponse: (value, data) =>
          value
            ? {
                evalTplId: data.evalTplId,
                evalTplCode: data.evalTplCode,
                evalTplName: data.evalTplName,
              }
            : null,
      },
      { name: 'evalTplId', bind: 'evalTplCode.evalTplId' },
      { name: 'evalTplName', bind: 'evalTplCode.evalTplName' },
      {
        label: intl
          .get('sslm.evaluationStrategyDetail.form.label.isAutoPublish')
          .d('自动发布评估结果'),
        name: 'supplierAutoPublishFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get('sslm.evaluationStrategyDetail.form.label.evalScope').d('自评范围'),
        name: 'evalScope',
        lookupCode: 'SSLM_SITE_EVAL_SCOPE',
        computedProps: {
          required: ({ record }) => isEdit && record.get('supplierSelfAssessmentFlag'),
          disabled: ({ record }) => !record.get('supplierSelfAssessmentFlag'),
        },
      },
      {
        label: intl
          .get('sslm.evaluationStrategyDetail.form.label.isSupplierSelfAssessment')
          .d('需要供应商自评'),
        name: 'supplierSelfAssessmentFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl
          .get('sslm.evaluationStrategyDetail.form.label.selfratedByIndicatorYype')
          .d('按照指标类型自评'),
        name: 'selfIndicatorType',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl
          .get('sslm.evaluationStrategyDetail.form.label.viewParentFlag')
          .d('允许查看上级指标'),
        name: 'viewParentFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl
          .get('sslm.evaluationStrategyDetail.form.label.autoExecuteFlag')
          .d('供应商自评后自动执行评分'),
        name: 'autoExecuteFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'vetoScoreFlag',
        label: intl
          .get('sslm.evaluationStrategyDetail.form.label.vetoScore')
          .d('否决后无需对其他指标打分'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/eval-plan-strategys/detail/${data.strategyId}`,
          method: 'GET',
          params: {
            ...params,
          },
          data: {
            ...data,
          },
        };
      },
    },
    events: {
      update: ({ name, value, record }) => {
        if (name === 'needFlag') {
          if (value === 0) {
            record.set({ preciseFlag: 0 });
          }
        }
        if (name === 'evalType') {
          if (value !== 'ONLINE') {
            record.set({ evalTplName: null, evalTplId: null, evalTplCode: null });
          }
        }
        if (name === 'supplierSelfAssessmentFlag') {
          if (value === 0) {
            record.set({ evalScope: null });
          }
        }
        if (name === 'selfIndicatorType') {
          record.set({ evalScope: null });
        }
        if (name === 'evalScope') {
          // 自评范围不为仅底层指标时，清空允许查看上级指标
          if (!['LEAF'].includes(value)) {
            record.set({ viewParentFlag: null });
          }
        }
      },
    },
  };
};

export { getBasicInfoDs };
