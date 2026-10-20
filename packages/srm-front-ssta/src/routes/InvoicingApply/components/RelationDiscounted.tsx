import React, { useMemo, useEffect, useCallback } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';
import notification from 'utils/notification';
import { intersection, isArray } from 'lodash';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';

import { relationDiscountedDS } from '../storeDS';


const RelationDiscounted = (props) => {
  const { applyHeaderId, closeCallback, modal } = props;
  const relationDiscountedDs = useMemo<DataSet>(() => new DataSet(relationDiscountedDS(applyHeaderId)), [applyHeaderId]);

  const handleOk = useCallback(async () => {
    const res = await relationDiscountedDs.validate();
    if (!res) return false;
    // if (relationDiscountedDs.updated.length === 0) {
    //   modal.close();
    //   return;
    // }
    const result = await relationDiscountedDs.forceSubmit();
    if (!result) return false;
    if (closeCallback) closeCallback();
  }, [closeCallback, relationDiscountedDs, modal]);

  useEffect(() => {
    modal.handleOk(handleOk);
  }, [handleOk, relationDiscountedDs, modal]);

  const handleUpdateLine = useCallback(({ record, name, value }) => {
    if (name === 'associateDiscountedLov') {
      // 检查其他行的选择是否和当前行的选择有重复
      const lineNums = value?.map((ele) => ele.lineNum);
      const amount = math.sum(...value?.map((item) => item.amount || 0));
      let repeatNums: any = [];
      relationDiscountedDs.forEach((item) => {
        const { applyLineId, associatedDiscountedLineNumStr } = item?.get(['applyLineId', 'associatedDiscountedLineNumStr']) || {};
        if (applyLineId !== record?.get('applyLineId')) {
          const associatedDiscountedLineNumStrs = (isArray(associatedDiscountedLineNumStr) ? associatedDiscountedLineNumStr : associatedDiscountedLineNumStr?.split(','))?.map((v) => Number(v));
          repeatNums = [...repeatNums, ...intersection(lineNums, associatedDiscountedLineNumStrs)];
        }
      });
      if (repeatNums.length > 0) {
        notification.warning({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl
            .get('ssta.common.view.message.relationDiscountedRepeat', { num: repeatNums.join(',')})
            .d('当前操作的关联被折扣行{num}已被其他行选择,请重新调整'),
        });
      }
      record.set({associatedDiscountedLineTotalAmount: amount});
    }
  }, [relationDiscountedDs]);

  useEffect(() => {
    relationDiscountedDs.addEventListener('update', handleUpdateLine);
    return () => {
      relationDiscountedDs.removeEventListener('update', handleUpdateLine);
    };
  }, [relationDiscountedDs, handleUpdateLine]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'applyLineType',
        width: 110,
      },
      {
        name: 'associateDiscountedLov',
        editor: true,
      },
      {
        name: 'lineNum',
        width: 90,
      },
      {
        name: 'amount',
        width: 120,
      },
      {
        name: 'sourceDocSettleNum',
        width: 160,
      },
      {
        name: 'associatedDiscountedLineTotalAmount',
        width: 170,
      },
    ];
  }, []);


  return (
    <div>
      <Table
        dataSet={relationDiscountedDs}
        columns={columns}
      />
    </div>

  );
};

export default observer(RelationDiscounted);
