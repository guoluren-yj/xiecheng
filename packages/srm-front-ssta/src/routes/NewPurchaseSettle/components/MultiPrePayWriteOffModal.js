import React, { useMemo, useEffect, useContext, useCallback } from 'react';
import { Table, useDataSet, useModal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { getResponse, viewPrePayModal } from '@/utils/utils';

import { useModalOpen } from '../hooks';
import { Store as ListStore } from '../StoreProvider';
import { Store as DetailStore } from '../Detail/StoreProvider';
import { multiPrePayWriteOffDS } from '@/stores/NewPurchaseSettleDS';
import MultiPrePayWriteOffAddModal from './MultiPrePayWriteOffAddModal';
import { getMutilPayApplyPurchaser } from '@/services/settlePoolServices';

const MultiPrePayWriteOffModal = (props) => {
  const { modal, source, topRecord, isModalEdit } = props;
  const Store = source === 'list' ? ListStore : DetailStore;
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const {
    history,
    remoteProps,
    customizeTable,
    settleStatus = topRecord.get('settleStatus'),
    settleHeaderId = topRecord.get('settleHeaderId'),
  } = useContext(Store);

  const multiPrePayWriteOffDs = useDataSet(() => multiPrePayWriteOffDS(), []);
  const { selected } = multiPrePayWriteOffDs;

  useEffect(() => {
    if (source !== 'list' && remoteProps?.event) {
      remoteProps.event.fireEvent('onMultiPrePayWriteOffInit', {
        multiPrePayWriteOffDs,
      });
    }
  }, [source, remoteProps, multiPrePayWriteOffDs]);

  useEffect(() => {
    modal.handleOk(handleSave);
    multiPrePayWriteOffDs.addEventListener('update', handleUpdate);
    return () => {
      multiPrePayWriteOffDs.removeEventListener('update', handleUpdate);
    };
  }, [modal, handleSave, multiPrePayWriteOffDs]);

  const handleUpdate = ({ value, record, name }) => {
    if (name === 'applyAmount' && (value || value === 0)) {
      record.set('applyAmount', math.toFixed(value, Number(record.get('amountPrecision'))));
    }
  };

  useEffect(() => {
    const { documentNum, paymentDimension, settleApplyLineList } = topRecord.get([
      'documentNum',
      'paymentDimension',
      'settleApplyLineList',
    ]);
    if (source !== 'list' && ['RETURN', 'NEW'].includes(settleStatus)) {
      const preApplyAmountList = [];
      const multiPrepaymentAddList = [];
      topRecord.dataSet.forEach((item) => {
        if (Array.from(item.get('settleApplyLineList')).length > 0) {
          Array.from(item.get('settleApplyLineList')).forEach((a) => {
            preApplyAmountList.push(a);
          });
        }
      });
      settleApplyLineList.forEach((row) => {
        let { defaultRemainingAmount } = row;
        const { applyAmount } = row;
        preApplyAmountList.forEach((input) => {
          if (input.prepaymentLineId === row.prepaymentLineId) {
            defaultRemainingAmount = math.minus(defaultRemainingAmount, input.applyAmount || 0);
          }
        });
        multiPrepaymentAddList.push({
          ...row,
          prepaymentRemainingAmount: math.plus(defaultRemainingAmount, applyAmount || 0),
        });
      });
      multiPrePayWriteOffDs.loadData(multiPrepaymentAddList);
    } else {
      getMutilPayApplyPurchaser({
        documentNum,
        settleHeaderId,
        paymentDimension,
      }).then((res) => {
        if (getResponse(res)) {
          multiPrePayWriteOffDs.loadData(res);
        }
      });
    }
  }, [settleStatus, source, topRecord, settleHeaderId, multiPrePayWriteOffDs]);

  const columns = useMemo(
    () => [
      {
        width: 250,
        name: 'prepaymentTitle',
      },
      {
        width: 250,
        name: 'preHeadAndLineLink',
        renderer: ({ value, record }) => {
          const viewParams = {
            history,
            camp: 'PURCHASER',
            settleHeaderId: record.get('prepaymentHeaderId'),
          };
          return <a onClick={() => viewPrePayModal(viewParams)}>{value}</a>;
        },
      },
      {
        width: 150,
        name: 'prepaymentRemainingAmount',
      },
      {
        width: 150,
        name: 'applyAmount',
        editor: isModalEdit,
      },
      {
        width: 150,
        name: 'prepaymentAmount',
      },
      {
        width: 150,
        name: 'prepaymentTypeMeaning',
      },
      {
        width: 150,
        name: 'associateNum',
      },
      {
        width: 150,
        name: 'prepaymentCreatedBy',
      },
      {
        width: 150,
        name: 'prepaymentCreationDate',
      },
    ],
    [isModalEdit, history]
  );

  const handleAdd = useCallback(() => {
    modalOpen({
      size: 'large',
      editFlag: true,
      title: intl.get('ssta.purchaseSettle.view.title.prePaymentWriteOffAdd').d('预付款核销-新增'),
      children: (
        <MultiPrePayWriteOffAddModal topRecord={topRecord} parentDs={multiPrePayWriteOffDs} />
      ),
    });
  }, [modalOpen, topRecord, multiPrePayWriteOffDs]);

  const handleDelete = useCallback(() => {
    multiPrePayWriteOffDs.remove(selected, true);
    const totalApplyAmount = multiPrePayWriteOffDs
      .map((record) => record.get('applyAmount'))
      .reduce((a = 0, b = 0) => math.plus(a, b), 0);
    topRecord.set('applyAmount', totalApplyAmount);
    topRecord.set('settleApplyLineList', multiPrePayWriteOffDs.toData());
  }, [topRecord, multiPrePayWriteOffDs, selected]);

  const buttons = useMemo(
    () => [
      ['add', { onClick: handleAdd }],
      [
        'delete',
        {
          icon: 'delete_sweep',
          children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
          onClick: handleDelete,
        },
      ],
    ],
    [handleAdd, handleDelete]
  );

  const handleSave = useCallback(async () => {
    const isValid = await multiPrePayWriteOffDs.validate();
    if (!isValid) return false;
    const paymentAmountInitList = topRecord.get('paymentAmountInitList') || [];
    const totalApplyAmount = multiPrePayWriteOffDs
      .map((record) => record.get('applyAmount'))
      .reduce((a = 0, b = 0) => math.plus(a, b), 0);
    const { defaultMode } =
      paymentAmountInitList?.find((item) => item.initType === 'PAYMENT_AMOUNT') || {};
    topRecord.set('applyAmount', totalApplyAmount);
    topRecord.set('settleApplyLineList', multiPrePayWriteOffDs.toData());
    if (defaultMode === 'LINKAGE') {
      const paymentAmountInput = math.minus(
        topRecord.get('remainingPaymentAmount'),
        totalApplyAmount
      );
      topRecord.set('paymentAmount', math.lt(paymentAmountInput, 0) ? 0 : paymentAmountInput);
    }
    if (source !== 'list' && remoteProps?.event) {
      remoteProps.event.fireEvent('afterMultiPrePayWriteOffSave', {
        topRecord,
        multiPrePayWriteOffDs,
      });
    }
  }, [source, topRecord, remoteProps, multiPrePayWriteOffDs]);

  return customizeTable(
    { code: 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT.PEYPAYMENT.BOX' },
    <Table
      columns={columns}
      dataSet={multiPrePayWriteOffDs}
      selectionMode={isModalEdit ? 'rowbox' : 'none'}
      buttons={isModalEdit ? buttons : null}
      pagination={false}
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    />
  );
};

export default observer(MultiPrePayWriteOffModal);
