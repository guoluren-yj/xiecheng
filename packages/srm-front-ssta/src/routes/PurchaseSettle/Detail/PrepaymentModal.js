import React, { useMemo, useEffect } from 'react';
import { Table, DataSet, Button, Modal } from 'choerodon-ui/pro';
import { compose, isNil } from 'lodash';
import { observer } from 'mobx-react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
// import { amountLocalRender } from '@/utils/utils';
import { decimalPointAccuracy } from '@/routes/utils';
import { addPrepayment, deletePrepayment } from '@/services/settlePoolServices';
import Styles from '@/routes/common.less';
import { prepaymentDS as prepaymentDs } from '../../../stores/PurchaseSettleDS';
import PrepaymentAddModal from './PrepaymentAddModal';

const PrepaymentModal = (props) => {
  const {
    settleHeaderId,
    isLine,
    topRecord,
    onUpdatePre,
    amountPer,
    headerCurrent,
    customizeTable,
    modal,
    isModalEdit,
    headerDS,
  } = props;

  const prepaymentDS = useMemo(() => {
    return new DataSet({
      ...prepaymentDs(amountPer),
      events: {
        update: ({ value, record, name }) => {
          if (name === 'applyAmount') {
            record.set('applyAmount', math.toFixed(value, Number(amountPer)));
          }
        },
      },
    });
  }, []);

  useEffect(() => {
    prepaymentDS.setQueryParameter('settleHeaderId', settleHeaderId);
    prepaymentDS.setQueryParameter('settleLineId', topRecord?.get('settleLineId'));
    prepaymentDS.isLine = isLine;
    prepaymentDS.query();
  }, []);

  const columns = [
    {
      width: 250,
      name: 'prepaymentTitle',
    },
    {
      width: 200,
      name: 'prepaymentRemainingAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      width: 150,
      name: 'applyAmount',
      editor: isModalEdit,
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      width: 150,
      name: 'prepaymentAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
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
  ];

  const queryPrepayment = () => {
    prepaymentDS.query();
  };

  const handleAdd = () => {
    Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-large-second-modal'],
      title: intl.get('ssta.purchaseSettle.view.title.prePaymentWriteOffAdd').d('预付款核销-新增'),
      children: (
        <PrepaymentAddModal
          settleHeaderId={settleHeaderId}
          queryPrepayment={queryPrepayment}
          isLine={isLine}
          topRecord={topRecord}
          headerCurrent={headerCurrent}
          prepaymentDs={prepaymentDS}
          headerDS={headerDS}
        />
      ),
      footer: null,
    });
  };

  const handleSave = async () => {
    const body = prepaymentDS.toData();
    prepaymentDS.records.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.status = 'update';
    });
    const flag = await prepaymentDS.validate();
    if (body && flag) {
      addPrepayment({
        body,
        settleHeaderId,
        isLine,
        settleLineId: topRecord.get('settleLineId'),
      }).then((res) => {
        const resData = getResponse(res);
        if (resData) {
          notification.success();
          const {
            applyAmountTotal,
            paymentAmount,
            settleLineObjectVersionNumber,
            deductionTotalAmount,
            calculatePaymentAmount,
          } = resData[0] || {};
          onUpdatePre(
            topRecord,
            applyAmountTotal,
            paymentAmount,
            settleLineObjectVersionNumber,
            isLine,
            deductionTotalAmount,
            calculatePaymentAmount
          );
          modal.close();
        }
      });
    }
  };

  const handleCancle = () => {
    const body = prepaymentDS.selected.map((item) => item.toData());
    const data = prepaymentDS.filter((record) => !record.isSelected);
    if (body.length) {
      deletePrepayment(body).then((res) => {
        const resData = getResponse(res);
        if (resData) {
          notification.success();
          prepaymentDS.loadData(
            data.map((item) => item.toData()),
            data.length
          );
          const {
            paymentAmount,
            calculatePaymentAmount,
            headerObjectVersionNumber,
            lineObjectVersionNumber,
          } = resData;
          const totalApplyAmount = prepaymentDS
            .map((record) => record.get('applyAmount'))
            .reduce((a = 0, b = 0) => math.plus(a, b), 0);
          const reWriteData = { applyAmount: totalApplyAmount };
          if (!isNil(calculatePaymentAmount)) reWriteData.paymentAmount = calculatePaymentAmount;
          else if (!isNil(paymentAmount)) reWriteData.paymentAmount = paymentAmount;
          const objectVersionNumber = isLine ? lineObjectVersionNumber : headerObjectVersionNumber;
          if (!isNil(objectVersionNumber)) reWriteData.objectVersionNumber = objectVersionNumber;
          topRecord.set(reWriteData);
        }
      });
    } else {
      notification.warning({
        message: intl
          .get('ssta.purchaseSettle.view.notification.selectedEmpty')
          .d('请至少勾选一条数据'),
      });
    }
  };

  const buttons = [
    <Button icon="playlist_add" onClick={handleAdd}>
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
    <Button
      icon="delete"
      key="cancel"
      onClick={handleCancle}
      disabled={prepaymentDS.selected.length === 0}
    >
      {intl.get('hzero.common.button.delete').d('删除')}
    </Button>,
  ];
  return (
    <>
      {customizeTable(
        { code: 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT.PEYPAYMENT.BOX' },
        <Table
          selectionMode={isModalEdit ? 'rowbox' : 'none'}
          columns={columns}
          dataSet={prepaymentDS}
          buttons={isModalEdit ? buttons : null}
        />
      )}
      {isModalEdit && (
        <div className="ssta-body-footer">
          <Button
            onClick={handleSave}
            color="primary"
            // disabled={prepaymentDS.records.length === 0}
          >
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
          <Button onClick={modal.close}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      )}
    </>
  );
};
export default compose(
  withCustomize({
    unitCode: ['SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT.PEYPAYMENT.BOX'],
  }),
  observer
)(PrepaymentModal);
