import React, { useMemo, useEffect, useContext, useCallback } from 'react';
import { Table, useDataSet, useModal } from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';

import { prePayWriteOffDS } from '@/stores/NewSupplySettleDS';
import { getResponse, getSelectedNegActConfirmMsg, viewPrePayModal } from '@/utils/utils';
import { addPrepayment } from '@/services/settlePoolServices';
import { useModalOpen } from '../hooks';
import { Store as DetailStore } from '../Detail/StoreProvider';
import { Store as ListStore } from '../StoreProvider';
import PrePayWriteOffAddModal from './PrePayWriteOffAddModal';

const PrePayWriteOffModal = (props) => {
  const { modal, source, topRecord, isModalEdit } = props;
  const Store = source === 'list' ? ListStore : DetailStore;
  const {
    settleHeaderId = topRecord.get('settleHeaderId'),
    customizeTable,
    settleHeader,
    history,
  } = useContext(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const settleLineId = topRecord.get('settleLineId');
  const prePayWriteOffDs = useDataSet(
    () => prePayWriteOffDS(settleHeaderId, settleLineId, source),
    [settleHeaderId, settleLineId, source]
  );
  const { status, selected } = prePayWriteOffDs;
  const loading = status !== 'ready';

  useEffect(() => {
    const settleApplyLineList = topRecord.get('settleApplyLineList');
    if (settleApplyLineList && source === 'quoteInvoice') {
      prePayWriteOffDs.loadData(Array.from(settleApplyLineList));
    }
  }, [topRecord, prePayWriteOffDs, source]);

  useEffect(() => {
    if (isModalEdit) modal.update({ okProps: { loading } });
    modal.handleOk(handleSave);
  }, [modal, loading, isModalEdit, handleSave]);

  useEffect(() => {
    prePayWriteOffDs.addEventListener('update', handleUpdate);
    return () => {
      prePayWriteOffDs.removeEventListener('update', handleUpdate);
    };
  }, [prePayWriteOffDs, handleUpdate]);

  const handleUpdate = useCallback(({ value, record, name }) => {
    if (name === 'applyAmount') {
      record.set('applyAmount', math.toFixed(value, Number(record.get('amountPrecision'))));
    }
  }, []);

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
            camp: 'SUPPLIER',
            settleHeaderId: record.get('prepaymentHeaderId'),
          };
          return <a onClick={() => viewPrePayModal(viewParams)}>{value}</a>;
        },
      },
      {
        width: 200,
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
        renderer: ({ value, record }) => {
          const associateLineNum = record?.get('associateLineNum');
          if (!isNil(associateLineNum) && !isNil(value) && !value.includes('-')) {
            return `${value}-${associateLineNum}`;
          }
          return value;
        },
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
      title: intl.get('ssta.supplySettle.view.title.preColWriteOffAdd').d('预收款核销-新增'),
      children: (
        <PrePayWriteOffAddModal topRecord={topRecord} parentDs={prePayWriteOffDs} source={source} />
      ),
    });
  }, [modalOpen, topRecord, prePayWriteOffDs, source]);

  const handleSave = useCallback(async () => {
    if (source === 'quoteInvoice') {
      const validateRes = await prePayWriteOffDs.validate();
      if (!validateRes) return false;
      const totalApplyAmount = prePayWriteOffDs
        .map((item) => item.get('applyAmount'))
        .reduce((a = 0, b = 0) => math.plus(a, b), 0);
      topRecord.set('applyAmount', totalApplyAmount);
      topRecord.set('settleApplyLineList', prePayWriteOffDs.toData());
      return true;
    }
    let submitRes = {};
    // ds没有长度不会触发submit,因此手动掉接口
    if (prePayWriteOffDs.length === 0) {
      const res = getResponse(
        await addPrepayment({
          body: [],
          settleLineId,
          settleHeaderId,
          isLine: settleLineId,
        })
      );
      if (!res) return false;
      [submitRes] = res;
    } else {
      const res = await prePayWriteOffDs.submit();
      if (!res) return false;
      [submitRes] = res.content;
    }
    const {
      applyAmountTotal,
      paymentAmount,
      settleLineObjectVersionNumber,
      deductionTotalAmount,
      calculatePaymentAmount,
      headerObjectVersionNumber,
    } = submitRes || {};
    const { amountPrecision, paymentAmount: headerPaymentAmount } = topRecord.get([
      'amountPrecision',
      'paymentAmount',
    ]);
    const reWriteData = { applyAmount: applyAmountTotal };
    if (!settleLineId) {
      if (!isNil(headerObjectVersionNumber)) {
        reWriteData.objectVersionNumber = headerObjectVersionNumber;
      }
      if (!isNil(deductionTotalAmount)) {
        reWriteData.paymentAmount = math.toFixed(
          math.minus(headerPaymentAmount, deductionTotalAmount),
          Number(amountPrecision)
        );
      } else if (!isNil(calculatePaymentAmount)) reWriteData.paymentAmount = calculatePaymentAmount;
    }
    if (settleLineId) {
      if (!isNil(settleLineObjectVersionNumber)) {
        reWriteData.objectVersionNumber = settleLineObjectVersionNumber;
      }
      // 行核销会更新头上【是否核销】扩展字段，更新头版本号
      if (!isNil(headerObjectVersionNumber)) {
        settleHeader.set('objectVersionNumber', headerObjectVersionNumber);
      }
      if (!isNil(deductionTotalAmount)) {
        reWriteData.paymentAmount = math.toFixed(
          math.minus(paymentAmount, deductionTotalAmount),
          Number(amountPrecision)
        );
      } else if (!isNil(calculatePaymentAmount)) reWriteData.paymentAmount = calculatePaymentAmount;
      else if (!isNil(paymentAmount)) reWriteData.paymentAmount = paymentAmount;
    }
    topRecord.set(reWriteData);
  }, [source, topRecord, settleLineId, prePayWriteOffDs, settleHeaderId, settleHeader]);

  const handleDelete = useCallback(async () => {
    if (source === 'quoteInvoice') {
      prePayWriteOffDs.remove(prePayWriteOffDs.selected, true);
      return;
    }
    const deleteRes = await prePayWriteOffDs.delete(
      prePayWriteOffDs.selected,
      getSelectedNegActConfirmMsg('delete')
    );
    const deleteResData = deleteRes?.content?.[0];
    if (!deleteResData) return;
    prePayWriteOffDs.query(undefined, undefined, true);
    const {
      paymentAmount,
      calculatePaymentAmount,
      headerObjectVersionNumber,
      lineObjectVersionNumber,
    } = deleteResData;
    const totalApplyAmount = prePayWriteOffDs
      .map((record) => record.get('applyAmount'))
      .reduce((a = 0, b = 0) => math.plus(a, b), 0);
    const reWriteData = { applyAmount: totalApplyAmount };
    if (!isNil(calculatePaymentAmount)) reWriteData.paymentAmount = calculatePaymentAmount;
    else if (!isNil(paymentAmount)) reWriteData.paymentAmount = paymentAmount;
    const objectVersionNumber = settleLineId ? lineObjectVersionNumber : headerObjectVersionNumber;
    if (!isNil(objectVersionNumber)) reWriteData.objectVersionNumber = objectVersionNumber;
    // 行核销会更新头上【是否核销】扩展字段，更新头版本号
    if (settleLineId && !isNil(headerObjectVersionNumber)) {
      settleHeader.set('objectVersionNumber', headerObjectVersionNumber);
    }
    topRecord.set(reWriteData);
  }, [topRecord, prePayWriteOffDs, settleLineId, source, settleHeader]);

  const buttons = useMemo(
    () => [
      ['add', { onClick: handleAdd }],
      [
        'delete',
        {
          icon: 'delete_sweep',
          children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
          disabled: isEmpty(selected),
          onClick: handleDelete,
        },
      ],
    ],
    [handleAdd, selected, handleDelete]
  );

  return customizeTable(
    { code: 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT.PEYPAYMENT.BOX' },
    <Table
      columns={columns}
      dataSet={prePayWriteOffDs}
      buttons={isModalEdit ? buttons : null}
      selectionMode={isModalEdit ? 'rowbox' : 'none'}
      style={{ maxHeight: `calc(100vh - 240px)` }}
    />
  );
};
export default observer(PrePayWriteOffModal);
