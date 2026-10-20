/*
 * @Date: 2023-11-07 16:01:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty, isArray } from 'lodash';

import intl from 'utils/intl';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import { getEvalDateTo } from '@/routes/components/utils/appraisal';

const userInfo = getCurrentUser() || {};
const tenantId = getCurrentOrganizationId();

export const getEvaluationCycleDs = ({ isEdit, evalTplId, remote }) => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'initiateType',
      required: isEdit,
      defaultValue: 'MANUAL',
      lookupCode: 'SSLM.KPI_EVAL_INITIATE_MODE',
      label: intl.get('sslm.common.model.field.sponsorMode').d('发起方式'),
    },
    {
      name: 'evalCycle',
      lookupCode: 'SSLM.KPI_EVAL_CYCLE',
      label: intl.get(`sslm.common.model.archive.evaluation.cycle`).d('考评周期'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('initiateType') !== 'MANUAL',
      },
    },
    {
      name: 'evalInitTgrDate',
      type: 'date',
      min: 'evalDateTo',
      label: intl.get(`sslm.supplierKpiIndicator.model.supplier.initTgrDate`).d('考评触发日期'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('initiateType') !== 'MANUAL',
        disabled: ({ record }) => !record.get('evalDateTo'),
      },
    },
    {
      name: 'evalTgrExecuteDate',
      type: 'date',
      label: intl.get(`sslm.supplierKpiIndicator.model.supplier.nextTriggerDate`).d('下次触发日期'),
      disabled: true,
    },
    {
      name: 'evalDateFrom',
      type: 'date',
      max: 'evalDateTo',
      label: intl.get(`sslm.supplierKpiIndicator.model.supplier.evalDateFrom`).d('考评日期从'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('initiateType') !== 'MANUAL',
      },
      transformResponse: (value, data) => data.evalInitDate,
    },
    {
      name: 'evalDateTo',
      type: 'date',
      min: 'evalDateFrom',
      label: intl.get(`sslm.supplierKpiIndicator.model.supplier.evalDateTo`).d('考评日期至'),
      disabled: true,
      transformResponse: (value, data) => {
        const evalDateTo = getEvalDateTo(data.evalInitDate, data.evalCycle);
        return evalDateTo;
      },
    },
    {
      name: 'evalName',
      label: intl.get(`sslm.common.model.field.evalName`).d('考评档案描述'),
    },
    {
      name: 'evalDimension',
      lookupCode: 'SSLM.KPI_MANGE_DIMENSION',
      label: intl.get('sslm.supplierDocManage.model.evalDocManage.level').d('维度'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('initiateType') === 'AUTOMATIC',
      },
    },
    {
      name: 'evalDimensionValue',
      type: 'object',
      ignore: 'always',
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.levelValue`).d('维度值'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('initiateType') === 'AUTOMATIC',
        disabled: ({ record }) => record.get('evalDimension') === 'GROUP',
        multiple: ({ record }) => record.get('evalDimension') === 'COMPANY',
        lovCode: ({ record }) => {
          const { evalDimension } = record.get(['evalDimension']);
          const lovCodeObj = {
            GROUP: 'SSLM.KPI_EVAL_DIM_GROUP',
            COMPANY: 'SPFM.USER_AUTH.COMPANY',
          };
          return lovCodeObj[evalDimension];
        },
        lovPara: ({ record }) => {
          const { evalDimension } = record.get(['evalDimension']);
          const lovParaObj = {
            GROUP: { tenantId },
            COMPANY: { tenantId, evalTplId },
          };
          return lovParaObj[evalDimension];
        },
      },
      transformResponse: (value, data) => {
        const { groupId, groupName, evalDimension, queryKpiEvalSupCateDms } = data;
        if (evalDimension === 'GROUP' && groupId) {
          return { groupId, groupName };
        } else if (evalDimension === 'COMPANY' && !isEmpty(queryKpiEvalSupCateDms)) {
          return queryKpiEvalSupCateDms;
        } else {
          return null;
        }
      },
    },
    {
      name: 'evalTgrHour',
      lookupCode: 'SSLM.LOV_HOUR_LIST',
      label: intl.get('sslm.supplierKpiIndicator.model.cycle.triggerTime').d('触发时间'),
    },
    {
      name: 'leadingCadreId',
      type: 'object',
      lovCode: 'SSLM.USER',
      lovPara: { tenantId },
      label: intl.get(`sslm.supplierKpiIndicator.model.supplier.evalTmplName`).d('考评负责人'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('initiateType') === 'AUTOMATIC',
      },
      transformResponse: (value, data) => ({
        userId: data.leadingCadreId || userInfo.id,
        userName: data.userName || userInfo.realName,
      }),
      transformRequest: value => (value ? value.userId : null),
    },
  ],
  events: {
    update: ({ name, value, record, dataSet }) => {
      switch (name) {
        case 'initiateType':
          record.set({
            evalCycle: null,
            evalInitTgrDate: null,
            evalDateFrom: null,
            evalDateTo: null,
            evalName: null,
          });
          break;
        case 'evalCycle':
          if (!value) {
            record.set({ evalDateTo: null });
          } else {
            const evalDateFrom = record.get('evalDateFrom');
            const evalDateTo = getEvalDateTo(evalDateFrom, value);
            record.set({ evalDateTo });
          }
          record.set({ evalInitTgrDate: null });
          break;
        case 'evalDateFrom': {
          const evalCycle = record.get('evalCycle');
          const evalDateTo = getEvalDateTo(value, evalCycle);
          record.set({ evalDateTo, evalInitTgrDate: null, evalInitDate: value });
          break;
        }
        case 'evalDimension':
          if (value === 'GROUP') {
            const defaultCompany = dataSet.getState('defaultCompany') || {};
            record.set({
              evalDimensionValue: defaultCompany,
            });
          } else {
            record.set({
              evalDimensionValue: null,
            });
          }
          break;
        case 'evalDimensionValue':
          {
            const evalDimension = record.get('evalDimension');
            if (isArray(value)) {
              const saveKpiEvalSupCateDms = value.map(n => ({
                ...n,
                evalDimension,
                evalDimensionValue: n.companyId,
              }));
              record.set({ saveKpiEvalSupCateDms });
            }
          }
          break;
        case 'evalInitTgrDate':
          record.set({
            evalTgrExecuteDate: null,
          });
          break;
        default:
          break;
      }
      if (remote && remote.event) {
        remote.event.fireEvent('cuxEvaluationCyclUpdate', {
          name,
          record,
          value,
          dataSet,
        });
      }
    },
  },
});
