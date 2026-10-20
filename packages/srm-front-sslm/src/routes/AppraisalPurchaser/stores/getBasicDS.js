/*
 * @Date: 2023-11-03 17:08:04
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import { isEmpty, head, isArray } from 'lodash';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { SRM_SSLM, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { getEvalDate } from '@/routes/components/utils/appraisal';
import { bucketDirectory } from '@/routes/utils/utils';

const tenantId = getCurrentOrganizationId();

export const getBasicDs = ({ editFlag, evalHeaderId, remote } = {}) => ({
  autoCreate: true,
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'createPage', // 后端区分新老
      transformRequest: () => 'ASSESS',
    },
    {
      name: 'evalNum',
      disabled: true,
      label: intl.get('sslm.supplierDocManage.model.evaluationDocManage.docCode').d('档案编码'),
    },
    {
      name: 'evalName',
      required: editFlag,
      maxLength: 100,
      label: intl.get('sslm.supplierDocManage.model.evalDocManage.docDescription').d('档案描述'),
      dynamicProps: {
        disabled: ({ record }) => {
          const evalStatus = record.get('evalStatus');
          return evalStatus && !['NEW', 'NEW_REJECTED'].includes(evalStatus);
        },
      },
    },
    {
      name: 'evalStatus',
      disabled: true,
      lookupCode: 'SSLM.KPI_EVAL_STATUS',
      label: intl.get('sslm.supplierDocManage.model.evaluationDocManage.docStatus').d('档案状态'),
    },
    {
      name: 'evalTplId',
      required: editFlag,
      type: 'object',
      lovCode: 'SSLM.KPI_EVAL_TPL_LATEST_LIST',
      lovPara: { tenantId },
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.evalModel`).d('考评模板'),
      dynamicProps: {
        disabled: ({ record }) => record.get('evalStatus'),
      },
      transformResponse: (value, data) =>
        value
          ? {
              evalName: data.evalName,
              evalTplId: data.evalTplId,
              evalTplName: data.evalTplName,
            }
          : null,
      transformRequest: value => (value ? value.evalTplId : null),
    },
    {
      name: 'evalTplType',
    },
    {
      name: 'evalDimension',
      required: editFlag,
      lookupCode: 'SSLM.KPI_MANGE_DIMENSION',
      label: intl.get('sslm.supplierDocManage.model.evalDocManage.evalLevel').d('考评维度'),
      dynamicProps: {
        disabled: ({ record }) => {
          const { evalTplType, evalStatus } = record.get(['evalTplType', 'evalStatus']);
          return evalTplType === 'BDKPI_EVAL'
            ? evalStatus
            : evalStatus && !['NEW', 'NEW_REJECTED'].includes(evalStatus);
        },
      },
    },
    {
      name: 'evalDimensionValue',
      required: editFlag,
      type: 'object',
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.levelValue`).d('维度值'),
      dynamicProps: {
        disabled: ({ record }) => {
          const { evalTplType, evalStatus } = record.get(['evalTplType', 'evalStatus']);
          return evalTplType === 'BDKPI_EVAL'
            ? evalStatus
            : evalStatus && !['NEW', 'NEW_REJECTED'].includes(evalStatus);
        },
        lovCode: ({ record }) => {
          const { evalDimension } = record.get(['evalDimension']);
          const lovCodeObj = {
            GROUP: 'SSLM.KPI_EVAL_DIM_GROUP',
            COMPANY: 'SPFM.USER_AUTHORITY_COMPANY',
          };
          return lovCodeObj[evalDimension];
        },
        lovPara: ({ record }) => {
          const { evalTplId, evalDimension } = record.get(['evalTplId', 'evalDimension']);
          const lovParaObj = {
            GROUP: { tenantId },
            COMPANY: { tenantId, evalTplId: (evalTplId || {}).evalTplId },
          };
          return lovParaObj[evalDimension];
        },
      },
      transformResponse: (value, data) =>
        value
          ? {
              groupId: data.evalDimensionValue,
              groupName: data.evalDimensionValueMeaning,
              companyId: data.evalDimensionValue,
              companyName: data.evalDimensionValueMeaning,
            }
          : null,
      transformRequest: value => (value ? value.groupId || value.companyId : null),
    },
    {
      name: 'evalCycle',
      lookupCode: 'SSLM.KPI_EVAL_CYCLE_CUSTOM',
      label: intl.get(`sslm.supplierDocManage.model.evaluationDocManage.evalCycle`).d('考评周期'),
      dynamicProps: {
        disabled: ({ record }) => {
          const evalStatus = record.get('evalStatus');
          return evalStatus && !['NEW', 'NEW_REJECTED'].includes(evalStatus);
        },
        required: ({ record }) => editFlag && record.get('evalTplType') !== 'BDKPI_EVAL',
      },
    },
    {
      name: 'combineTimeUnit',
      dynamicProps: {
        label: ({ record }) => {
          const evalCycle = record.get('evalCycle');
          switch (evalCycle) {
            case 'YEAR':
              return intl.get('sslm.common.model.evalCycle.year').d('年份');
            case 'HALF-YEAR':
              return intl.get('sslm.common.model.evalCycle.halfYear').d('半年份');
            case 'QUARTER':
              return intl.get('sslm.common.model.evalCycle.quarter').d('季度');
            case 'MONTH':
              return intl.get('sslm.common.model.evalCycle.month').d('月度');
            default:
              break;
          }
        },
        disabled: ({ record }) => {
          const evalStatus = record.get('evalStatus');
          return evalStatus && !['NEW', 'NEW_REJECTED'].includes(evalStatus);
        },
        lookupCode: ({ record }) => {
          const evalCycle = record.get('evalCycle');
          switch (evalCycle) {
            case 'YEAR':
              return 'SDRP.LOV_YEAR_LIST'; // 年份值集需更换
            case 'HALF-YEAR':
              return 'SSLM.KPI_EVAL_CYCLE_HALF_YEAR';
            case 'QUARTER':
              return 'SSLM.KPI_EVAL_CYCLE_QUARTER';
            case 'MONTH':
              return 'SSLM.KPI_EVAL_CYCLE_MONTH';
            default:
              break;
          }
        },
      },
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      disabled: true,
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.createTime`).d('建档时间'),
    },
    {
      name: 'createdUserName',
      disabled: true,
      label: intl
        .get(`sslm.supplierDocManage.model.evaluationDocManage.createdUserName`)
        .d('创建人'),
    },
    {
      name: 'evalDate',
      type: 'date',
      required: editFlag,
      ignore: 'always',
      range: ['evalDateFrom', 'evalDateTo'],
      label: intl.get('sslm.common.model.evaluation.evalDate').d('考评日期'),
      dynamicProps: {
        disabled: ({ record }) => {
          const { evalStatus, combineTimeUnit } = record.get(['evalStatus', 'combineTimeUnit']);
          return (
            Boolean(combineTimeUnit) || ![undefined, 'NEW', 'NEW_REJECTED'].includes(evalStatus)
          );
        },
      },
      validator: value => {
        if (value) {
          const { evalDateFrom, evalDateTo } = value;
          if (evalDateFrom && !evalDateTo) {
            return intl
              .get('sslm.appraisalPurchaser.model.evalDate.selectDateTo')
              .d('请选择考评日期至');
          } else if (evalDateTo && !evalDateFrom) {
            return intl
              .get('sslm.appraisalPurchaser.model.evalDate.selectDateFrom')
              .d('请选择考评日期从');
          }
        }
      },
      transformResponse: (value, data) => {
        if (data.evalDateFrom) {
          return {
            evalDateFrom: data.evalDateFrom,
            evalDateTo: data.evalDateTo,
          };
        } else {
          return null;
        }
      },
    },
    {
      name: 'evalDateFrom',
      type: 'date',
      transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'evalDateTo',
      type: 'date',
      transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'kpiMethod',
      disabled: true,
      lookupCode: 'SSLM.KPI_EVAL_METHOD',
      label: intl.get(`sslm.supplierDocManage.model.evaluationDocManage.kpiMethod`).d('考评方式'),
    },
    {
      name: 'docType',
      lookupCode: 'SSLM.EVAL.DOC_TYPE',
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.docType`).d('单据类型'),
      dynamicProps: {
        disabled: ({ record }) => record.get('evalStatus'),
        required: ({ record }) => editFlag && record.get('evalTplType') === 'BDKPI_EVAL',
      },
    },
    {
      name: 'docNum',
      type: 'object',
      multiple: true,
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.docNum`).d('单据'),
      dynamicProps: {
        required: ({ record }) => editFlag && record.get('evalTplType') === 'BDKPI_EVAL',
        disabled: ({ record }) => !record.get('docType') || record.get('evalStatus'),
        lovCode: ({ record }) =>
          record.get('docType') === 'YS'
            ? 'SSLM.KPI_EVAL.RCV_TRX_HEADER'
            : 'SSLM.KPI_EVAL.CONTRACT_HEAD_SUBJECT',
        lovPara: ({ record }) => {
          const { docType, evalDimension, evalDimensionValue } = record.get([
            'docType',
            'evalDimension',
            'evalDimensionValue',
          ]);
          return {
            tenantId,
            companyId:
              evalDimension === 'COMPANY' && docType === 'XY'
                ? evalDimensionValue?.companyId
                : null,
          };
        },
        textField: ({ record }) => (record.get('docType') === 'YS' ? 'displayTrxNum' : 'pcNum'),
      },
      transformResponse: (value, date) => (value ? date.docNumMeaning : null),
      transformRequest: value => {
        if (!isEmpty(value)) {
          return value.map(n => n.rcvTrxHeaderId || n.pcHeaderId).join();
        }
      },
    },
    {
      name: 'autoPushVendorFlag',
      disabled: true,
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.publishToSupplier`)
        .d('审批后自动发布至供应商'),
    },
    {
      name: 'processUnitId',
      type: 'object',
      lovCode: 'SPRM.USER_UNIT',
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.evaluationDepart`)
        .d('考评负责人部门'),
      dynamicProps: {
        disabled: ({ record }) => {
          const evalStatus = record.get('evalStatus');
          return evalStatus && !['NEW', 'NEW_REJECTED'].includes(evalStatus);
        },
      },
      transformResponse: (value, data) =>
        value
          ? {
              unitId: data.processUnitId,
              unitName: data.processUnitName,
            }
          : null,
      transformRequest: value => value && value.unitId,
    },
    {
      name: 'informUserIds',
      type: 'object',
      multiple: true,
      valueField: 'userId',
      textField: 'userName',
      lovCode: 'SSLM.KPI_CHOOSE_USER',
      lovPara: { tenantId },
      label: intl
        .get(`sslm.supplierDocManage.model.docManage.evaluationCopy`)
        .d('抄送（发布考评）'),
      dynamicProps: {
        disabled: ({ record }) =>
          !['FINAL_COLLECTED', 'REJECTED'].includes(record.get('evalStatus')),
      },
      transformResponse: (value, date) => (value ? date.userNames : null),
      transformRequest: value => {
        if (!isEmpty(value)) {
          return value.map(n => n.userId).join();
        }
      },
    },
    {
      name: 'appealDeadline',
      defaultValue: 'unlimited',
      lookupCode: 'SSLM.KPI.APPEAL_DEADLINE',
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.appealDeadlineMeaning`)
        .d('申诉期限'),
      dynamicProps: {
        disabled: ({ record }) => {
          const evalStatus = record.get(evalStatus);
          return (
            evalStatus && ['NEW', 'FINAL_COLLECTED', 'REJECTED', 'COMPLETED'].includes(evalStatus)
          );
        },
      },
    },
    {
      name: 'appealDeadlineTime',
      type: 'dateTime',
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.appealDeadlineTime`)
        .d('申诉截止时间'),
      dynamicProps: {
        required: ({ record }) => editFlag && record.get('appealDeadline') === 'other',
        disabled: ({ record }) => {
          const { appealDeadline, evalStatus } = record.get(['appealDeadline', 'evalStatus']);
          return (
            appealDeadline !== 'other' ||
            (evalStatus &&
              !['NEW', 'FINAL_COLLECTED', 'REJECTED', 'COMPLETED'].includes(evalStatus))
          );
        },
      },
    },
    {
      name: 'appealLimit',
      defaultValue: 'unlimited',
      lookupCode: 'SSLM.KPI.APPEAL_LIMIT',
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.appealLimitMeaning`)
        .d('申诉次数限制'),
      dynamicProps: {
        disabled: ({ record }) => {
          const evalStatus = record.get('evalStatus');
          return (
            evalStatus && !['NEW', 'FINAL_COLLECTED', 'REJECTED', 'COMPLETED'].includes(evalStatus)
          );
        },
      },
    },
    {
      name: 'evalRuleRemark',
      maxLength: 1000,
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.ruleDesc`).d('考评规则说明'),
      dynamicProps: {
        disabled: ({ record }) => {
          const evalStatus = record.get('evalStatus');
          return evalStatus && !['NEW', 'NEW_REJECTED'].includes(evalStatus);
        },
      },
    },
    {
      name: 'remark',
      maxLength: 1000,
      label: intl.get(`sslm.supplierDocManage.model.evaluationDocManage.description`).d('考评说明'),
      dynamicProps: {
        disabled: ({ record }) => {
          const evalStatus = record.get('evalStatus');
          return evalStatus && !['NEW', 'NEW_REJECTED'].includes(evalStatus);
        },
      },
    },
    {
      name: 'evalResultRemark',
      maxLength: 1000,
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.evalResultRemark`)
        .d('考评结果说明'),
      dynamicProps: {
        disabled: ({ record }) =>
          !['FINAL_COLLECTED', 'REJECTED'].includes(record.get('evalStatus')),
      },
    },
    {
      name: 'evalAttUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.appraisal,
      label: intl.get('sslm.supplierDocManage.model.evalDocManage.evalAttUuid').d('考评结果附件'),
      dynamicProps: {
        readOnly: ({ record }) =>
          !['FINAL_COLLECTED', 'REJECTED'].includes(record.get('evalStatus')),
      },
    },
    // 参评供应商
    {
      name: 'trxLineFlags',
      multiple: ',',
      disabled: true,
      lookupCode: 'SSLM.KPI_SUPPLIER_SCOPE_NEW',
      label: intl.get(`sslm.common.model.field.evaluateScope`).d('参评供应商范围'),
      transformResponse: (_, data) => data.trxLineFlags || data.trxLineFlag,
    },
    {
      name: 'inventoryTimes',
      disabled: true,
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.inventoryTimes`)
        .d('接收入库次数（≥）'),
    },
    {
      name: 'cooperationDays',
      disabled: true,
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.cooperationDay`).d('合作天数'),
    },
    {
      name: 'categoryIds',
      type: 'object',
      multiple: true,
      disabled: true,
      valueField: 'categoryId',
      textField: 'categoryDescription',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_TREE',
      label: intl.get(`sslm.supplierKpiIndicator.model.issuedOrder.categoryIds`).d('供应商分类'),
      transformRequest: value => isArray(value) && value.map(n => n.categoryId).join(),
      transformResponse: (value, data) => (value ? data.categoryDescriptionMap : null),
    },
    {
      name: 'itemCategoryIds',
      type: 'object',
      multiple: true,
      disabled: true,
      valueField: 'categoryId',
      textField: 'categoryName',
      lovCode: 'SMDM.TREE_ITEM_CATEGORY_NEW',
      lovPara: {
        enabledFlag: 1,
        tenantId,
      },
      label: intl.get(`sslm.supplierKpiIndicator.model.issuedOrder.supplierProduct`).d('供货品类'),
      transformRequest: value => isArray(value) && value.map(n => n.categoryId).join(),
      transformResponse: (value, data) => (value ? data.itemCategoryNameMap : null),
    },
    {
      name: 'stageIds',
      multiple: ',',
      disabled: true,
      lookupCode: 'SSLM.LIFE_CYCLE_STAGE_FOR_EVAL',
      label: intl.get('sslm.common.model.stageDescription').d('生命周期阶段'),
    },
    {
      name: 'deliveryTimes',
      disabled: true,
      label: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.deliveryTimes`)
        .d('送货单次数（≥）'),
    },
    {
      name: 'purchaseAgentIds',
      type: 'object',
      multiple: true,
      disabled: true,
      valueField: 'purchaseAgentId',
      textField: 'purchaseAgentName',
      lovCode: 'SPFM.TENANT_PURCHASE_AGENT',
      lovPara: { tenantId },
      label: intl.get(`sslm.common.model.buyer`).d('采购员'),
      transformRequest: value => isArray(value) && value.map(n => n.purchaseAgentId).join(),
      transformResponse: (value, data) => (value ? data.purchaseAgentNames : null),
    },
    // 评分人
    {
      name: 'addScorer', // 新增评分人
      type: 'object',
      multiple: true,
      noCache: true,
      ignore: 'always',
      lovCode: 'SSLM.KPI_CHOOSE_USER',
      lovPara: { tenantId },
      label: intl.get('sslm.common.model.user.account').d('账户'),
    },
    {
      name: 'assignRule',
      lookupCode: 'SSLM.KPI_EVAL.ALLOCATION_RULE',
      defaultValue: 'MANUAL',
      label: intl.get('sslm.common.modal.field.allocationRule').d('分配规则'),
    },
    {
      name: 'evalRespRule',
      lookupCode: 'SSLM.KPI_EVAL.ADD_RATER_RULE',
      label: intl.get('sslm.common.model.scorer.addRaterRule').d('添加评分人规则'),
      dynamicProps: {
        required: ({ record }) =>
          editFlag && evalHeaderId && !['GYSKP_ORDER'].includes(record.get('evalTplType')),
      },
    },
    // 汇总统计校验字段
    {
      name: 'finalCollectIdentification',
      defaultValue: '1',
      lookupCode: 'SSLM.KPI_EVAL_INTERVAL_RANGE',
    },
    // 退回评分批量维护退回原因
    {
      name: 'backReason',
      label: intl.get('sslm.common.model.archiveFilled.backReason').d('退回原因'),
    },
    // 转交评分人转交原因
    {
      name: 'transformReason',
      label: intl.get(`sslm.supplierDocManage.model.docManage.transmitReason`).d('转交原因'),
    },
  ],
  events: {
    update: ({ name, record, value, dataSet }) => {
      switch (name) {
        case 'evalTplId':
          {
            const evalName = record.get('evalName');
            if (!evalName) {
              record.set({ evalName: value && value.evalName });
            }
            record.set({
              docType: null,
              docNum: null,
              trxLineFlags: value && value.trxLineFlags,
              evalTplType: value && value.evalTplType,
              evalRespRule: value && value.evalRespRule,
              evalCycle: value && value.evalCycle,
            });
          }
          break;
        case 'evalDimension':
          if (value === 'GROUP') {
            const { groupId, groupName } = dataSet.getState('defaultCompany') || {};
            record.set({
              evalDimensionValue: {
                groupId,
                groupName,
              },
            });
          } else {
            record.set({
              evalDimensionValue: null,
            });
          }
          break;
        case 'evalCycle':
          record.set({
            combineTimeUnit: null,
            evalDate: null,
          });
          break;
        case 'combineTimeUnit':
          if (value) {
            const evalCycle = record.get('evalCycle');
            const evalDate = getEvalDate(evalCycle, value);
            record.set({ evalDate });
          }
          break;
        case 'evalDate':
          record.set({
            evalDateFrom: value ? value.evalDateFrom : null,
            evalDateTo: value ? value.evalDateTo : null,
          });
          break;
        case 'docType':
          record.set({
            docNum: null,
          });
          break;
        case 'appealDeadline':
          record.set({
            appealDeadlineTime: null,
          });
          break;
        case 'evalDimensionValue':
          record.set({ evalDimensionValueChangeFlag: true });
          break;
        default:
          break;
      }
      if (remote && remote.event) {
        remote.event.fireEvent('cuxBasicDsUpdate', {
          name,
          record,
          value,
          dataSet,
        });
      }
    },
  },
  transport: {
    read: ({ data }) => {
      const { queryParams, ...rest } = data;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/eval-headers/detail/${evalHeaderId}`,
        method: 'GET',
        data: { ...queryParams, ...rest },
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/eval-headers/eval-manage/create`,
        method: 'POST',
        data: data && head(data),
        params: {
          customizeUnitCode: 'SSLM.APPRAISAL_PURCHASER_DETAIL.BASIC',
        },
      };
    },
  },
});
