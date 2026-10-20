import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';


const organizationId = getCurrentOrganizationId();

const urlPrefix = `${SRM_SSTA}/v1/${organizationId}`;


const prefix = `spfp.ruleMaintenance`;

export const tableDS = (): DataSetProps =>
{
  return {
    autoQuery: true,
    selection: false,
    paging: 'server',
    childrenField: 'children', // 子节点数组
    pageSize: 20,
    queryParameter: {
      customizeUnitCode: ['SPFP.RULE_REBATE_LIST.SEARCH_BAR', 'SPFP.RULE_REBATE_LIST.GRID'].join(),
    },
    fields: [
      {
        name: 'ruleNum',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleNum`).d('规则编码'),
      },
      {
        name: 'ruleName',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleName`).d('规则名称'),
      },
      {
        name: 'sourceTypeMeaning',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleSourceType`).d('规则来源'),
      },
      {
        name: 'versionNumber',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.version`).d('版本'),
      },
      {
        name: 'ruleStatus',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleStatus`).d('状态'),
        lookupCode: 'SPFP.RULE_STATUS',
      },
      {
        name: 'displayStatus',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleStatus`).d('状态'),
        lookupCode: 'SPFP.RULE_STATUS',
      },
      {
        name: 'date',
        type: FieldType.date,
        range: ['start', 'end'],
        label: intl.get(`${prefix}.model.ruleMaintenance.effectTime`).d('有效期'),
        required: true,
      },
      {
        name: 'startDate',
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
        bind: 'date.start',
      },
      {
        name: 'endDate',
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
        bind: 'date.end',

      },
      {
        name: 'action',
        label: intl.get('hzero.common.button.action').d('操作'),
        type: FieldType.string,
      },
      {
        name: 'createdByName',
        type: FieldType.string,
        label: intl.get(`spfp.common.model.ruleMaintenance.createdByName`).d('创建人'),
      },
    ],
    transport: {
      read: () =>
      {
        return {
          url: `${urlPrefix}/rules/list`,
          method: 'GET',
        };
      },
      submit: ({ data }) =>
      {
        return {
          url: `${urlPrefix}/rules/enable`,
          method: 'PUT',
          data: data[0],
        };

      },
    },

  };
};
