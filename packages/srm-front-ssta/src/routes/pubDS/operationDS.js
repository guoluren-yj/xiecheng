/*
 * @Description:
 * @Date: 2020-08-11 11:16:22
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import { getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';
import moment from 'moment';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { filterNullValueObject } from 'utils/utils';

const operationDS = ({ url, pk, urlPramas = false, lookupCode, isFilter = false, lovPara = {} }) => ({
  selection: false,
  primaryKey: 'actionId',
  pageSize: 0,
  // table显示的字段
  queryFields: [
    lookupCode && {
      name: 'processStatus',
      display: true,
      noCache: true,
      lookupCode,
      label: intl.get('ssta.common.operate.processStatus').d('操作节点'),
      lovPara,
    },
    {
      name: 'dateRange',
      label: intl.get('ssta.common.model.message.trxDate').d('操作时间'),
      type: 'date',
      range: ['form', 'to'],
      ignore: 'always',
      display: true,
    },
  ].filter((item) => !!item),
  fields: [
    {
      name: 'processUser',
      type: 'string',
      label: intl.get('hzero.common.components.operationAudit.operatedBy').d('操作人'),
    },
    {
      name: 'processUserName',
      type: 'string',
      label: intl.get('hzero.common.components.operationAudit.operatedBy').d('操作人'),
    },
    {
      name: 'processDate',
      type: 'dateTime',
      label: intl.get('hzero.common.components.operationAudit.operatedTime').d('操作时间'),
      format: getDateTimeFormat(),
    },
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl.get('hzero.common.actions').d('动作'),
    },
    {
      name: 'processRemark',
      type: 'string',
      label: intl.get('hzero.common.components.operationAudit.operationRemark').d('操作说明'),
    },
  ],
  transport: {
    read: ({ data, dataSet, params }) => {
      const { dateRange, ...other } = dataSet?.queryDataSet?.current?.toData() || {};
      const dateFromTo = dateRange?.split(',') || [];
      const queryParams = filterNullValueObject({
        ...params,
        processDateFrom: dateFromTo[0] ? moment(dateFromTo[0]).format(DATETIME_MIN) : undefined,
        processDateTo: dateFromTo[1] ? moment(dateFromTo[1]).format(DATETIME_MAX) : undefined,
        ...other,
      });
      delete queryParams.__dirty;
      const { [pk]: pkv = '' } = data;
      if (urlPramas) {
        return {
          url: isFilter ? `${url}${pkv}/new` : `${url}${pkv}`,
          method: 'GET',
          data: {},
          params: queryParams,
        };
      } else {
        return {
          url: isFilter ? `${url}/new` : url,
          method: 'GET',
          data: { [pk]: pkv },
          params: queryParams,
        };
      }
    },
  },
});

export { operationDS };
