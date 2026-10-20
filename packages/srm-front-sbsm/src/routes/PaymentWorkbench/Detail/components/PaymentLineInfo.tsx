import React, { useContext, useMemo, useCallback, useLayoutEffect } from 'react';
import { Table, useModal } from 'choerodon-ui/pro';
import type { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';

import { Store } from '../stores';
import QuotePayPool from './QuotePayPool';
import { useModalOpen } from '../../../../hooks';
import { PaymentLineGridCode } from '../../utils/type';
import { viewPaymentPoolDetail } from '../../../PaymentPool/Detail';
import { getSelectedNegActConfirmMsg } from '../../../../utils/utils';

const PaymentLineInfo = (props) => {
  const { onPrev } = props;
  const modalOpen = useModalOpen(useModal());
  const { boolMap, history, headerDs, paymentLineDs, customizeTable } = useContext(Store);

  useLayoutEffect(() => {
    paymentLineDs.selection = boolMap.editFlag ? DataSetSelection.multiple : false;
    paymentLineDs.bind(headerDs, 'inputPayLineDTOList');
    return () => {
      headerDs.map(record => record.init({ inputPayLineDTOList: null })); // 触发step重新查询
      delete headerDs.children.inputPayLineDTOList; // 避免step数据校验
    };
  }, [boolMap, headerDs, paymentLineDs]);

  const handleViewDetail = useCallback((record) => {
    viewPaymentPoolDetail({ history, payId: record.get('payId') });
  }, [history]);

  const columns = useMemo<ColumnProps []>(() => [
    { name: 'lineNum', width: 150 },
    { name: 'payNum', width: 180 },
    { name: 'documentNumAndLineNum', width: 200 },
    { name: 'itemCode', width: 150 },
    { name: 'itemName', width: 180 },
    { name: 'payAmount', width: 150, editor: boolMap.editFlag },
    { name: 'remark', width: 200, editor: boolMap.editFlag },
    { name: 'srmPoNum', width: 150 },
    {
      name: 'operation',
      width: 150,
      title: intl.get('hzero.common.button.action').d('操作'),
      renderer: ({ record }) => (
        <a onClick={() => handleViewDetail(record)}>
          {intl.get('sbsm.common.view.button.viewDetail').d('查看详情')}
        </a>
      ),
    },
  ], [
    boolMap,
    handleViewDetail,
  ]);

  const handleAddLine = useCallback(() => {
    if (boolMap.stepFlag && onPrev) return onPrev();
    modalOpen({
      size: 'large',
      editFlag: true,
      title: intl.get('hzero.common.button.add').d('新增'),
      children: <QuotePayPool />,
    });
  }, [onPrev, boolMap, modalOpen]);

  const handleDeleteLine = useCallback(async () => {
    const deleteRes = await paymentLineDs.delete(paymentLineDs.selected, getSelectedNegActConfirmMsg('delete', paymentLineDs));
    if (!deleteRes) return;
    await headerDs.query(undefined, undefined, true);
    paymentLineDs.clearCachedRecords();
  }, [paymentLineDs, headerDs]);

  const buttons = useMemo<Buttons[]>(() => boolMap.editFlag ? [
    [TableButtonType.add, { onClick: handleAddLine }],
    [TableButtonType.delete, { onClick: handleDeleteLine }],
  ] : [], [
    boolMap,
    handleAddLine,
    handleDeleteLine,
  ]);

  return customizeTable({
    code: PaymentLineGridCode,
    readOnly: !boolMap.editFlag,
  }, (
    <Table
      columns={columns}
      buttons={buttons}
      dataSet={paymentLineDs}
      style={{ maxHeight: 430 }}
    />
  ));
};

export default PaymentLineInfo;