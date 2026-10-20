import React, { memo, useEffect, useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import { MultiButton } from './Invoice';

export default memo(
  observer(function Invoice(props) {
    const { dataSet, agreementHeaderId, readOnly, refresh, payDataSet } = props;
    useEffect(() => {
      if (agreementHeaderId) {
        dataSet.setQueryParameter('agreementHeaderId', agreementHeaderId);
        dataSet.getField('labelIdObj').setLovPara('agreementHeaderId', agreementHeaderId);
        dataSet.getField('pointsTypeObj').set('optionsProps', dsProps => ({
          ...dsProps,
          data: payDataSet?.current?.get('salePointsDetails'),
        }));
        dataSet.query();
        dataSet.paging = true;
        dataSet.selection = readOnly ? false : 'multiple';
      }
      dataSet.getField('labelIdObj').setLovPara('enabledFlag', 1);
    }, [refresh, agreementHeaderId, readOnly]);

    async function handleDelete() {
      const addRecords = dataSet.selected.filter(f => f.status === 'add');
      const updateRecords = dataSet.selected.filter(f => f.status !== 'add');
      if (updateRecords.length > 0) {
        dataSet.delete(updateRecords).then(res => res && dataSet.remove(addRecords));
      } else {
        dataSet.remove(addRecords);
      }
    }

    const columns = useMemo(
      () =>
        [
          { name: 'labelIdObj', editor: !readOnly },
          { name: 'pointsTypeObj', editor: !readOnly },
          { name: 'pointsLimit', editor: !readOnly },
        ].filter(f => f.show || !('show' in f)),
      [readOnly]
    );
    const buttons = useMemo(() => {
      if (readOnly) return [];
      return [
        <Button icon="playlist_add" onClick={() => dataSet.create({}, 0)}>
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>,
        <MultiButton icon="delete_sweep" dataSet={dataSet} onClick={handleDelete}>
          {intl.get('sagm.common.button.batchDelete').d('批量删除')}
        </MultiButton>,
      ];
    }, [readOnly]);

    return (
      <Table
        dataSet={dataSet}
        columns={columns}
        buttons={buttons}
        style={{ maxHeight: 426 }}
        customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.ORDER_LIMIT"
      />
    );
  })
);
