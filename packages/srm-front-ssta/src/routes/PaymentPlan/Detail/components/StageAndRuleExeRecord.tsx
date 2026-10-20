/*
 * @Description: 付款阶段及管控规则执行记录
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-10-31 16:03:42
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import type { Record } from 'choerodon-ui/dataset';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { amountRuleRecordDS, dateRuleRecordDS, stageOccupyRecordDS } from '../stores/detailDS';

interface StageAndRuleExeRecordProps {
  record: Record
};

const StageAndRuleExeRecord = (props: StageAndRuleExeRecordProps) => {
  const { record } = props;
  const planLineId = record.get('planLineId');

  const stageOccupyDs = useMemo<DataSet>(() => new DataSet(stageOccupyRecordDS(planLineId)), [planLineId]);
  const amountRuleDs = useMemo<DataSet>(() => new DataSet(amountRuleRecordDS(planLineId)), [planLineId]);
  const dateRuleDs = useMemo<DataSet>(() => new DataSet(dateRuleRecordDS(planLineId)), [planLineId]);

  const stageOccupyColumns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'paymentAction',
        width: 100,
      },
      {
        name: 'settleType',
        width: 120,
      },
      {
        name: 'settleNumAndLine',
        width: 180,
      },
      {
        name: 'executeAmount',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'realName',
        width: 150,
      },
      {
        name: 'planVersionNumber',
        width: 150,
      },
    ];
  }, []);

  const amountRuleColumns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'executeAction',
        width: 150,
      },
      {
        name: 'validationResult',
        width: 120,
      },
      {
        name: 'settleNum',
        width: 200,
      },
      {
        name: 'userName',
        width: 150,
      },
      {
        name: 'planAmount',
        width: 150,
      },
      {
        name: 'executedAmount',
        width: 150,
      },
      {
        name: 'remainingAmount',
        width: 150,
      },
      {
        name: 'amountSourceCode',
        width: 160,
      },
      {
        name: 'sourceNum',
        width: 160,
      },
      {
        name: 'sourceAmount',
        width: 150,
      },
      {
        name: 'amountMaintainCode',
        width: 160,
      },
      {
        name: 'baseAmountFieldCode',
        width: 160,
      },
      {
        name: 'stagePercent',
        width: 150,
      },
      {
        name: 'planVersionNumber',
        width: 150,
      },
    ];
  }, []);

  const dateRuleColumns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'executeAction',
        width: 150,
      },
      {
        name: 'settleNum',
        width: 200,
      },
      {
        name: 'baseDate',
        width: 150,
      },
      {
        name: 'planPayDueDate',
        width: 150,
      },
      {
        name: 'sourceCode',
        width: 150,
      },
      {
        name: 'sourceNum',
        width: 180,
      },
      {
        name: 'dateMaintainCode',
        width: 160,
      },
      {
        name: 'baseDateFieldCode',
        width: 150,
      },
      {
        name: 'deadLineDate',
        width: 160,
      },
      {
        name: 'fixedDate',
        width: 150,
      },
      {
        name: 'addMonth',
        width: 120,
      },
      {
        name: 'accountPeriod',
        width: 150,
      },
      {
        name: 'planVersionNumber',
        width: 120,
      },
      {
        name: 'accountPeriodType',
        width: 150,
      },
      {
        name: 'prepayFlag',
        width: 120,
      },
    ];
  }, []);

  return (
    <Fragment>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`ssta.paymentPlan.view.title.payStageOccupyRecord`).d('付款阶段占用记录')}
      >
        <Table
          dataSet={stageOccupyDs}
          columns={stageOccupyColumns}
          style={{ maxHeight: 430 }}
        />
      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`ssta.paymentPlan.view.title.amountCtrlRuleExeRecord`).d('金额管控规则执行记录')}
      >
        <Table
          dataSet={amountRuleDs}
          columns={amountRuleColumns}
          style={{ maxHeight: 430 }}
        />
      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`ssta.paymentPlan.view.title.dateCtrlRuleExeRecord`).d('日期管控规则执行记录')}
      >
        <Table
          dataSet={dateRuleDs}
          columns={dateRuleColumns}
          style={{ maxHeight: 430 }}
        />
      </Card>
    </Fragment>
  );
};

export default StageAndRuleExeRecord;