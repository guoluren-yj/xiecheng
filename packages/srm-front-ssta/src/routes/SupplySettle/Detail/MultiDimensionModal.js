import React, { useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Table, DataSet, Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { math } from 'choerodon-ui/dataset';
import { multiDimensionDS as multiDimensionDs } from '../../../stores/SupplySettleDS';
import MultiPrepaymentModal from './MultiPrepaymentModal';
import { saveMultiPre } from '@/services/settlePoolServices';
import { decimalPointAccuracy } from '@/routes/utils';
import Styles from '@/routes/common.less';

const MultiDimensionModal = (props) => {
  let modal;

  const {
    settleHeaderId,
    updateFlag,
    headerCurrent,
    onUpdateMultiDimension,
    amountPer,
    headerDS,
  } = props;
  const { optPermissionList } = headerDS.toData()[0] || {};
  const optPermissionListObj = {};

  (optPermissionList || []).forEach((item) => {
    const { permissionType, operationType } = item;
    (operationType || '').split(',').forEach((i) => {
      optPermissionListObj[i] = permissionType;
    });
  });

  const {
    // 头-多维度付款
    HEAD_MULDIMENSION_PAYMENT: headMuldimensionPayment,
  } = optPermissionListObj;

  const paymentSpliteRule = headerCurrent.get('paymentSpliteRule');
  const multiDimensionDS = useMemo(() => {
    return new DataSet({
      ...multiDimensionDs(headerCurrent.get('paymentDimension'), updateFlag),
      events: {
        update: ({ value, record, name }) => {
          if (name === 'paymentAmount' && (value || value === 0)) {
            record.set('paymentAmount', math.toFixed(value, Number(amountPer)));
          }
        },
      },
    });
  }, []);

  useEffect(() => {
    multiDimensionDS.setQueryParameter('settleHeaderId', settleHeaderId);
    multiDimensionDS.query();
  }, []);

  const columns = [
    {
      name: 'documentNum',
    },
    {
      name: 'invoicedTaxIncludedAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      name: 'remainingPaymentAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      name: 'paymentAmount',
      editor: headMuldimensionPayment === 'EDIT' && updateFlag,
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      name: 'applyAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      name: 'preColWriteOff',
      header: intl.get(`ssta.supplySettle.button.preColWriteOff`).d('预收款核销'),
      width: 150,
      renderer: ({ record }) =>
        record.get('invoicedTaxIncludedAmount') > 0 ? (
          <a onClick={() => handleMultiPrepayment(record)}>
            {updateFlag
              ? intl.get(`ssta.supplySettle.button.preColWriteOff`).d('预收款核销')
              : intl.get('ssta.supplySettle.button.preColWriteOffRecord').d('预收款核销记录')}
          </a>
        ) : null,
    },
  ];

  const handleMultiPrepayment = (record) => {
    const isModalEdit = updateFlag && headMuldimensionPayment === 'EDIT';
    modal = Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-large-second-modal'],
      title: isModalEdit
        ? intl.get('ssta.supplySettle.button.multiPreColWriteOff').d('多维度预收款核销')
        : intl.get('ssta.supplySettle.button.multiPreColWriteOffRecord').d('多维度预收款核销记录'),
      children: (
        <MultiPrepaymentModal
          isModalEdit={isModalEdit}
          headerDS={headerDS}
          topRecord={record}
          settleHeaderId={settleHeaderId}
          onSaveMultiPre={handleSaveMultiPre}
          settleApplyLineList={record.toData().settleApplyLineList}
          amountPer={amountPer}
          headerCurrent={headerCurrent}
          multiDimensionDs={multiDimensionDS}
        />
      ),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: updateFlag && headMuldimensionPayment === 'EDIT' ? null : (okBtn) => okBtn,
    });
  };

  const handleSaveMultiPre = (data, topRecord) => {
    const { paymentAmountInitList } = multiDimensionDS.toData()[0] || {};

    const totalApplyAmount = data
      .map((item) => item.applyAmount)
      .reduce((a = 0, b = 0) => math.plus(a, b), 0);
    const { defaultMode } =
      paymentAmountInitList?.find((item) => item.initType === 'PAYMENT_AMOUNT') || {};
    if (defaultMode === 'LINKAGE') {
      const paymentAmountInput = math.minus(
        topRecord.get('remainingPaymentAmount'),
        totalApplyAmount
      );
      topRecord.set('paymentAmount', math.lt(paymentAmountInput, 0) ? 0 : paymentAmountInput);
    }
    topRecord.set('applyAmount', totalApplyAmount);
    topRecord.set('settleApplyLineList', data);
    modal.close();
  };

  const handleSave = async () => {
    const flag = await multiDimensionDS.validate();
    if (!flag) {
      return;
    }
    const body = multiDimensionDS
      .toData()
      .map((item) => Object.assign(item, { paymentSpliteRule }));
    const res = getResponse(await saveMultiPre({ settleHeaderId, body }));
    if (res) {
      notification.success();
      onUpdateMultiDimension();
    }
  };

  // const queryBarRender = ({ dataSet, queryDataSet }) => {
  //   const handleQuery = () => dataSet.query();
  //   const handleReset = () => queryDataSet.current.reset();
  //   return (
  //     <div style={{ display: 'flex', marginBottom: 10, alignItems: 'flex-start' }}>
  //       <Form dataSet={queryDataSet} labelAlign="left" style={{ width: '33.3%' }}>
  //         <Select name="paymentDimension" />
  //       </Form>
  //       <div
  //         style={{
  //           marginTop: 11,
  //           marginLeft: 16,
  //           flexShrink: 0,
  //           display: 'flex',
  //           alignItems: 'center',
  //         }}
  //       >
  //         <Button color="primary" onClick={handleQuery}>
  //           {intl.get('hzero.common.button.search').d('查询')}
  //         </Button>
  //         <Button onClick={handleReset}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <>
      <Table
        columns={columns}
        dataSet={multiDimensionDS}
        queryBar="advancedBar"
        pagination={false}
      />
      {updateFlag && (
        <div className="ssta-body-footer">
          <Button
            onClick={handleSave}
            color="primary"
            // disabled={multiDimensionDS.records.length === 0}
          >
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
          <Button onClick={props.modal.close}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      )}
    </>
  );
};

export default observer(MultiDimensionModal);
