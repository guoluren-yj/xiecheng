import React, { useMemo, useEffect, useContext, useCallback, useState, Fragment } from 'react';
import { isNil, isEmpty } from 'lodash';
import { Form, DatePicker, TextArea, DataSet, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { unitValidate } from '@/utils/utils';
import { Store } from '../StoreProvider';
import { filledInfoDs, redTableLineDS, redTableDS } from '@/stores/NewPurchaseSettleDS';
import DynamicAlert from '@/routes/Components/DynamicAlert';

const invoiceCodes = {
  CONFIRM: 'SSTA.PURCHASE_SETTLE_LIST.INV_CONFIRM',
  RETURN: 'SSTA.PURCHASE_SETTLE_LIST.INV_RETURN',
  CANCEL: 'SSTA.PURCHASE_SETTLE_LIST.INV_CANCEL',
};

const paymentCodes = {
  CONFIRM: 'SSTA.PURCHASE_SETTLE_LIST.PAY_CONFIRM',
  RETURN: 'SSTA.PURCHASE_SETTLE_LIST.PAY_RETURN',
  CANCEL: 'SSTA.PURCHASE_SETTLE_LIST.PAY_CANCEL',
};

const prepayCodes = {
  CONFIRM: 'SSTA.PURCHASE_SETTLE_LIST.PRE_CONFIRM',
  RETURN: 'SSTA.PURCHASE_SETTLE_LIST.PRE_RETURN',
  CANCEL: 'SSTA.PURCHASE_SETTLE_LIST.PRE_CANCEL',
};

const filledInfoCodeMap = {
  INVOICE: invoiceCodes,
  PAYMENT: paymentCodes,
  PREPAYMENT: prepayCodes,
  INVOICE_PAYMENT: invoiceCodes,
};

const FilledInfoModal = (props) => {
  const {
    onOk,
    modal,
    action,
    settleStatus,
    settleType,
    selected,
    getEcInvBatchCancelInfo,
    enableDirInvFlag,
    redList = [],
    isDelete,
  } = props;

  const { custConfig, customizeForm } = useContext(Store);

  const [redLineDs, setRedLineDs] = useState({});
  const { ecInvCancelMsg, withCancelEcSettleFlag } = getEcInvBatchCancelInfo?.() || {};
  const filledInfoCode = filledInfoCodeMap[settleType]?.[action];
  const redListDs = useMemo(() => new DataSet(redTableDS(redList)), [redList]);

  const filledInfoDS = useMemo(() => new DataSet(filledInfoDs()), []);

  const [invCancelNumsMap, setInvCancelNumsMap] = useState({});

  useEffect(() => {
    if (enableDirInvFlag) {
      // eslint-disable-next-line no-unused-expressions
      redListDs?.map((record) => {
        // eslint-disable-next-line no-param-reassign
        record.isExpanded = true;
        const settleNum = record.get('settleNum');
       if (!redLineDs[settleNum]) {
         const children = record?.get('redInfoLineDTOList') || [];
         const currentDs = new DataSet(
           redTableLineDS(children)
         );
         setRedLineDs(prevState => ({
           ...prevState,
           [settleNum]: currentDs,
         }));
       }
     });
    }
  }, [redListDs, enableDirInvFlag]);

  useEffect(() => {
    redListDs.addEventListener('update', handleUpdateDs);
    return () => {
      redListDs.removeEventListener('update', handleUpdateDs);
    };
  }, [redListDs, handleUpdateDs, redLineDs]);

  const handleUpdateDs = useCallback(({ name, value, record }) => {
    if (name === 'invoiceRefundedReason') {
      const settleNum = record.get('settleNum');
      if (redLineDs && redLineDs[settleNum]) {
        // eslint-disable-next-line no-unused-expressions
        redLineDs[settleNum]?.map((item) => {
          item.set('invoiceRefundedReason', value);
          return item;
        });
      }
    }
  }, [redLineDs]);

  useEffect(() => {
    const invCancelList = [];
    const notInvCancelList = [];
    selected.forEach((record) => {
      const { settleNum, invoiceSettleCancelFlag } = record.get([
        'settleNum',
        'invoiceSettleCancelFlag',
      ]);
      if (Number(invoiceSettleCancelFlag) === 1) {
        invCancelList.push(settleNum);
      } else {
        notInvCancelList.push(settleNum);
      }
    });
    setInvCancelNumsMap({
      invCancelNums: invCancelList.join('、'),
      notInvCancelNums: notInvCancelList.join('、'),
    });
  }, [filledInfoDS, selected]);

  useEffect(() => {
    modal.handleOk(handleOk);
  }, [modal, handleOk, redLineDs]);

  const handleOk = useCallback(async () => {
    if (enableDirInvFlag && !isEmpty(redList)) {
      const results = await Promise.all(
        redList.map(async(record) => {
          const settleNum = record?.settleNum;
          if (settleNum && redLineDs[settleNum]) {
            const res = await redLineDs[settleNum].validate();
            return res;
          }
        })
      );
      if (results.includes(false)) return false;
      const data = redListDs.toData()?.map((record) => {
        const settleNum = record?.settleNum;
        if (settleNum && redLineDs[settleNum]) {
          record.redInfoLineDTOList = redLineDs[settleNum]?.toData();
        }
        return record;
      });
      const res = await redListDs.setState('invoiceData', data).forceSubmit();
      if (!res) return false;
      if (isDelete) {
        if(onOk) onOk();
        modal.close();
        return;
      }
    }
    const okFlag = await unitValidate(filledInfoDS, custConfig[filledInfoCode]);
    if (!okFlag) {
      return false;
    } else {
      const info = filledInfoDS.current?.toData();
      return onOk(info, filledInfoCode);
    }
  }, [onOk, custConfig, filledInfoDS, filledInfoCode, enableDirInvFlag, redList, redLineDs, redListDs, isDelete, modal]);

  const { invCancelNums, notInvCancelNums } = invCancelNumsMap;

  const colunms = useMemo(() => {
    return [
      {
        name: 'settleNum',
      },
      {
        name: 'settleConfigNum',
      },
      {
        name: 'invoiceRefundedReason',
        editor: true,
      },
    ];
  }, []);

  const expandedRowRenderer = useCallback(({ record }) => {
    const settleNum = record.get('settleNum');
    const currentDs = redLineDs[settleNum];
    if (!currentDs) return null;
    const columns = [
      {
        name: 'invoiceNum',
      },
      {
        name: 'invoiceCode',
      },
      {
        name: 'invoiceRefundedReason',
        editor: true,
      },
    ];
    return (
      <Table defaultRowExpanded columns={columns} dataSet={currentDs} />
    );
  }, [redLineDs]);

  return (
    <Fragment>
      {action === 'RETURN' && settleType === 'INVOICE' && settleStatus === 'CONFIRMING_AGAIN' && (
        <DynamicAlert
          placement="modal-top"
          message={
            <Fragment>
              {invCancelNums && (
                <span>
                  {intl
                    .get('ssta.common.view.message.cancelAndVoidInvoice', {
                      settleNum: invCancelNums,
                    })
                    .d('当前操作将取消发票结算单{settleNum}及红冲（作废）关联的税务发票，请确认!')}
                </span>
              )}
              {notInvCancelNums && (
                <span>
                  {intl
                    .get('ssta.common.view.message.invoiceCancelAndDisassociation', {
                      settleNum: notInvCancelNums,
                    })
                    .d(
                      '当前操作将取消发票结算单{settleNum}及取消税务发票与当前单据的关联关系，请确认!'
                    )}
                </span>
              )}
            </Fragment>
          }
        />
      )}
      {
        enableDirInvFlag && !isEmpty(redList) && (
          <DynamicAlert
            placement="modal-top"
            message={intl.get('ssta.common.view.message.redVoidInvoiceTips', )
            .d('由于单据主策略当前配置了票单同步取消，即结算单取消后系统会自动红冲税务发票，若确认取消请维护红冲原因，或联系采购员更新结算策略为票单不同步取消后重试')}
          />
        )
      }
      {customizeForm(
        { code: filledInfoCode },
        <Form dataSet={filledInfoDS} useColon={false} columns={1} labelLayout="float">
          {['CONFIRM'].includes(action) &&
            ['INVOICE', 'INVOICE_PAYMENT'].includes(settleType) &&
            settleStatus !== 'CANCELING' && <DatePicker name="accountingDate" />}
          {action === 'CANCEL' && <TextArea name="canceledReason" resize="vertical" />}
          {['CANCEL', 'DELETE'].includes(action) &&
            !isNil(ecInvCancelMsg) &&
            withCancelEcSettleFlag && <TextArea name="invoiceRefundedReason" resize="vertical" />}
          {['CONFIRM', 'RETURN'].includes(action) &&
            ['SUBMITED', 'SUBMITED_APPROVING'].includes(settleStatus) && (
              <TextArea name="approvedRemark" resize="vertical" />
            )}
          {['CONFIRM', 'RETURN'].includes(action) &&
            ['CANCELING', 'CANCEL_APPROVING'].includes(settleStatus) && (
              <TextArea name="canceledRemark" resize="vertical" />
            )}
        </Form>
      )}
      {
        enableDirInvFlag && !isEmpty(redList) && (
          <div style={{marginTop: isDelete ? 0 : '16px'}}>
            <Table
              columns={colunms}
              dataSet={redListDs}
              expandedRowRenderer={expandedRowRenderer}
            />
          </div>
        )
      }
    </Fragment>
  );
};

export default FilledInfoModal;
