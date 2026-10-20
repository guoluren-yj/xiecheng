/*
 * @Description: 付款阶段信息
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-10-31 16:01:38
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, useMemo } from 'react';
import { Card } from 'choerodon-ui';
import type { Record } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import EditorForm from '../../../Components/EditorForm';

interface StageInfoProps {
  record: Record
};

const StageInfo = (props: StageInfoProps) => {

  const { record } = props;
  const termBasicColumns = useMemo(() => {
    return [
      'termNum',
      'termName',
      'termVersionNumber',
      'stageNum',
      'stageDesc',
      'planPrepayFlag',
      'planStageFlag',
    ];
  }, []);

  const stageAmountColumns = useMemo(() => {
    return [
      'baseAmountFieldCode',
      'sourceCode',
      'paymentAmount',
      'stagePercent',
      'stageAmount',
      'grandFlag',
      'amountMaintainCode',
      'prepayFlag',
    ];
  }, []);

  const stageDateColumns = useMemo(() => {
    return [
      'dateMaintainCode',
      'baseDateFieldCode',
      'accountPeriodType',
      'deadLineDate',
      'fixedDate',
      'addMonth',
      'accountPeriod',
    ];
  }, []);

  return (
    <Fragment>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`ssta.paymentPlan.view.title.payTermBasic`).d('付款条款基本信息')}
      >
        <EditorForm
          columns={3}
          useColon={false}
          record={record}
          editorFlag={false}
          editorColumns={termBasicColumns}
        />
      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`ssta.paymentPlan.view.title.payStageAmountInfo`).d('付款阶段金额信息')}
      >
        <EditorForm
          columns={3}
          useColon={false}
          record={record}
          editorFlag={false}
          editorColumns={stageAmountColumns}
        />
      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`ssta.paymentPlan.view.title.payStageDateInfo`).d('付款阶段日期信息')}
      >
        <EditorForm
          columns={3}
          useColon={false}
          record={record}
          editorFlag={false}
          editorColumns={stageDateColumns}
        />
      </Card>
    </Fragment>
  );
};

export default StageInfo;
