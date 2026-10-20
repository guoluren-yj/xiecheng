import React, { memo, useMemo, Fragment, useCallback } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/interface';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { stringify } from 'querystring';
import moment from 'moment';

import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import styles from './index.less';


const prefix = `ssta.common`;
const organizationId = getCurrentOrganizationId();

interface OrderInfoProps
{
  roleSource: string;
  chargeHeaderId: string;
  history;
}

export default memo((props: OrderInfoProps) =>
{
  const { roleSource = 'purchaser', chargeHeaderId, history } = props;
  const tableDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 20,
        fields: [
          {
            name: 'ruleNum',
            type: FieldType.string,
            label: intl.get(`${prefix}.model.ruleMaintenance.ruleNum`).d('返利规则编码'),
          },
          {
            name: 'versionNumber',
            type: FieldType.string,
            label: intl.get(`${prefix}.model.ruleMaintenance.versionNumber`).d('版本'),
          },
          {
            name: 'ruleName',
            type: FieldType.string,
            label: intl.get(`${prefix}.model.ruleMaintenance.ruleName`).d('返利规则名称'),
          },
          {
            name: 'calculateBeginDate',
            type: FieldType.dateTime,
            label: intl.get(`${prefix}.model.ruleMaintenance.calculateBeginDate`).d('执行开始时间'),
          },
          {
            name: 'calculateEndDate',
            type: FieldType.dateTime,
            label: intl.get(`${prefix}.model.ruleMaintenance.calculateEndDate`).d('执行结束时间'),
          },
          {
            name: 'currentCalculateResult',
            type: FieldType.number,
            label: intl.get(`${prefix}.model.ruleMaintenance.currentCalculateResult`).d('本次出具金额'),
          },
          {
            name: 'historicalCalculateResult',
            type: FieldType.number,
            label: intl.get(`${prefix}.model.ruleMaintenance.historicalCalculateResult`).d('历史已出具金额'),
          },
          {
            name: 'taxIncludedAmount',
            type: FieldType.number,
            label: intl.get(`${prefix}.model.ruleMaintenance.taxIncludedAmount`).d('当前费用单分摊总金额'),
          },
        ],
        transport: {
          read: ({ data }) =>
          {
            return {
              url: `/ssta/v1/${organizationId}/charge-rebates/${roleSource}/ordering/detail`,
              method: 'GET',
              data: { ...data, chargeHeaderId },
            };
          },
        },
      }),
    []
  );

  const columns: ColumnProps[] = useMemo(() => [
    { name: 'ruleNum' },
    { name: 'versionNumber' },
    { name: 'ruleName' },
    { name: 'calculateBeginDate' },
    { name: 'calculateEndDate' },
    { name: 'currentCalculateResult' },
    { name: 'historicalCalculateResult' },
    { name: 'taxIncludedAmount' },
  ], []);

  const handleGotoRebate = useCallback((record) => {
    if (!record) return;
    const { versionNumber, rebatesRuleNum, calculateBeginDate } = record?.get(['versionNumber', 'rebatesRuleNum', 'calculateBeginDate']) || {};
    history.push({
      pathname: '/spfp/rebate-order-calculate/list',
      search: stringify(filterNullValueObject({
        versionNumber,
        rebatesRuleNum,
        calculateBeginDate: calculateBeginDate && moment(calculateBeginDate).format('YYYY-MM-DD HH:mm:ss'),
      })),
    });
  }, [history]);

  return (
    <div style={{ height: 'calc(100vh - 300px)' }}>
      <Alert
        showIcon
        className={styles['alert-order-info']}
        message={
          <Fragment>
            <span>{intl.get(`${prefix}.view.message.orderinfoPrefixTip`).d('具体明细信息请至')} </span>
            <a onClick={() => handleGotoRebate(tableDs?.current)}>{intl.get(`${prefix}.view.message.orderTableRebate`).d('返利出单计算明细表')}</a>
            <span> {intl.get(`${prefix}.view.message.orderinfoTipView`).d('功能查看')}</span>
          </Fragment>
        }
        type="info"
      />
      <Table
        dataSet={tableDs}
        columns={columns}
        selectionMode={SelectionMode.none}
        style={{ maxHeight: 'calc(100% - 35px)' }}
      />
    </div>
  );;
});
