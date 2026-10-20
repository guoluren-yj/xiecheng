import React, { useContext, useMemo, Fragment, useState, useCallback } from 'react';
import { Radio } from 'choerodon-ui';
import { Table, Tooltip } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import { TenderDetailGridUnitCode } from '../utils/type';
import { purchaserConfirmByNameRender } from '../utils/render';
import StatusTag, { getTagColor, statusTagRender } from '../../Components/StatusTag';
import commonStyles from '../../common.less';

const { Group: RadioGroup, Button: RadioButton } = Radio;

const PayRecord = () => {

  const { payRecordDs, workflowBatch, customizeTable } = useContext<StoreValueType>(Store);

  const [mode, setMode] = useState<typeof workflowBatch>(workflowBatch);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'tenderFeesNum',
        width: 200,
      },
      {
        name: 'paymentCategory',
        width: 120,
        renderer: statusTagRender,
      },
      {
        name: 'tenderPayRecordStatus',
        width: 150,
        renderer: ({ text, dataSet, record, name }) => {
          const approvedRemark = record?.get('approvedRemark');
          const remarkIcon = approvedRemark && 'alt_route-o';
          return (
            <Tooltip title={approvedRemark}>
              <StatusTag icon={remarkIcon} text={text} color={getTagColor(dataSet, record, name)} />
            </Tooltip>
          );
        },
      },
      {
        name: 'paymentModeMeaning',
        width: 120,
      },
      {
        name: 'paymentAmount',
        width: 150,
      },
      {
        name: 'paymentDate',
        width: 180,
      },
      {
        name: 'paymentOrderNum',
        width: 200,
      },
      {
        name: 'purchaserConfirmByName',
        width: 150,
        renderer: purchaserConfirmByNameRender,
      },
      {
        name: 'approveModeMeaning',
        width: 120,
      },
      {
        name: 'initiateCampMeaning',
        width: 120,
      },
      {
        name: 'processInstanceId',
        width: 150,
      },
    ];
  }, []);

  const handleChangeMode = useCallback((e) => {
    const newMode = e.target.value;
    setMode(newMode);
    payRecordDs.setQueryParameter('workflowBatch', newMode);
    payRecordDs.query();
  }, [payRecordDs]);

  return (
    <Fragment>
      {!isNil(workflowBatch) && (
        <div className={commonStyles['ssta-radio-mode']}>
          <RadioGroup value={mode} onChange={handleChangeMode}>
            <RadioButton value={workflowBatch}>
              {intl.get(`ssta.sourcingCost.view.button.currentApprovalContent`).d('当前审批内容')}
            </RadioButton>
            <Radio.Button value={undefined}>
              {intl.get(`ssta.sourcingCost.view.button.showAllRecords`).d('展示全部记录')}
            </Radio.Button>
          </RadioGroup>
        </div>
      )}
      {customizeTable(
        { code: TenderDetailGridUnitCode.PAY },
        <Table
          columns={columns}
          dataSet={payRecordDs}
          style={{ maxHeight: 430 }}
        />
      )}
    </Fragment>
  );
};

export default PayRecord;