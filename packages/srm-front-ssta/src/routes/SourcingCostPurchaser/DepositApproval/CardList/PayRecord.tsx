import React, { useContext, useMemo, Fragment, useState, useCallback } from 'react';
import { Radio } from 'choerodon-ui';
import { Table, Tooltip } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { DepositDetailGridUnitCode } from '../../utils/type';
import { purchaserConfirmByNameRender } from '../../utils/render';
import StatusTag, { getTagColor, statusTagRender } from '../../../Components/StatusTag';
import commonStyles from '../../../common.less';

const { Group: RadioGroup, Button: RadioButton } = Radio;

const PayRecord = () => {

  const { payRecordDs, workflowBatch, customizeTable, getCustomizeUnitCode } = useContext<StoreValueType>(Store);

  const [mode, setMode] = useState<typeof workflowBatch>(workflowBatch);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'depositNum',
        width: 180,
      },
      {
        name: 'paymentCategory',
        width: 120,
        renderer: statusTagRender,
      },
      {
        name: 'depositPayRecordStatus',
        width: 180,
        renderer: ({ text, dataSet, record, name }) => {
          const approvedRemark = record?.get('approvedRemark');
          const remarkIcon = approvedRemark && 'alt_route-o';
          return (
            <Tooltip placement="bottom" title={approvedRemark}>
              <StatusTag icon={remarkIcon} text={text} color={getTagColor(dataSet, record, name)} />
            </Tooltip>
          );
        },
      },
      {
        name: 'paymentModeMeaning',
        width: 180,
      },
      {
        name: 'paymentAmount',
        width: 130,
      },
      {
        name: 'paymentDate',
        width: 180,
      },
      {
        name: 'purchaserConfirmByName',
        width: 160,
        renderer: purchaserConfirmByNameRender,
      },
      {
        name: 'transferDepositNumAndLineNum',
        width: 200,
      },
      {
        name: 'remark',
        width: 200,
      },
      {
        name: 'initiateCampMeaning',
        width: 150,
      },
    ];
  }, []);

  // const handleChangeMode = useCallback((e) => {
  //   const newMode = e.target.value;
  //   setMode(newMode);
  //   payRecordDs.setQueryParameter('workflowBatch', newMode);
  //   payRecordDs.query();
  // }, [payRecordDs]);

  return (
    <Fragment>
      {/* {!isNil(workflowBatch) && (
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
      )} */}
      {customizeTable(
        { code: getCustomizeUnitCode('payRecord') },
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