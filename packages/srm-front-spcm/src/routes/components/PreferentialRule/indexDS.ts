/*
 * @Description: 折扣列表页-Dataset
 * @Date: 2023-03-22 10:50:25
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType, DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import request from 'utils/request';
import intl from 'utils/intl';
import { SRM_SPCM, SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

const urlPrefix = `${SRM_SPCM}/v1/${organizationId}`;
const urlRebatePrefix = `${SRM_SSTA}/v1/${organizationId}`;

const prefix = `spfp.ruleMaintenance`;

export const tableDS = ({ majorPcNum, editable, isRebate }): DataSetProps => {
  return {
    autoQuery: true,
    selection: editable && DataSetSelection.multiple,
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
        name: 'scenarioName',
        label: intl.get(`${prefix}.model.ruleMaintenance.scenarioConfigId`).d('场景'),
        type: FieldType.string,
      },
      // {
      //   name: 'ruleStatus',
      //   type: FieldType.string,
      //   label: intl.get(`${prefix}.model.ruleMaintenance.ruleStatus`).d('状态'),
      //   lookupCode: 'SPFP.REBATES_RULE_STATUS',
      // },
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
      // {
      //   name: 'enableFlag',
      //   type: FieldType.number,
      //   label: intl.get('hzero.common.model.common.enableFlag').d('是否启用'),
      //   trueValue: 1,
      //   falseValue: 0,
      // },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: isRebate ? `${urlRebatePrefix}/rules/list-by-pc` : `${urlPrefix}/pfp-rule/contract/list`,
          method: 'GET',
          params: {
            majorPcNum,
            ...params,
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: isRebate ? `${urlRebatePrefix}/rule-contract-infos/cancel-by-rules` : `${urlPrefix}/pfp-rule-contract-info/deleteRule`,
          method: 'PUT',
          data,
        };
      },
    },
  };
};
