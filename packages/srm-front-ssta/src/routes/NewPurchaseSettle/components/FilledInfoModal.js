/* @Description:
 * @Date: 2021-08-05
 * @author: jss <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { useMemo, useEffect, useContext, useCallback, Fragment, useState } from 'react';
import { isNil, isEmpty, isFunction } from 'lodash';
import { Form, DatePicker, TextArea, DataSet, Table } from 'choerodon-ui/pro';
import { FormItem } from '@/routes/Components';

import intl from 'utils/intl';

import { unitValidate } from '@/utils/utils';
import { Store } from '../Detail/StoreProvider';
import { settleHeaderDS, redTableLineDS, redTableDS } from '@/stores/NewPurchaseSettleDS';
import DynamicAlert from '@/routes/Components/DynamicAlert';

const invoiceCodes = {
  CONFIRM: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_CONFIRM',
  RETURN: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_RETURN',
  CANCEL: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_CANCEL',
  SYNC: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_SYNC',
};

const paymentCodes = {
  CONFIRM: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CONFIRM',
  RETURN: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_RETURN',
  CANCEL: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CANCEL',
  SYNC: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_SYNC',
};

const FilledInfoModal = (props) => {
  const {
    onOk,
    modal,
    action,
    getEcInvCancelInfo,
    enableDirInvFlag,
    redList = [],
    isDelete,
  } = props;

  const {
    settleType,
    custConfig,
    remoteProps,
    settleStatus,
    documentType,
    settleHeaderDs,
    settleHeaderId,
    customizeForm,
  } = useContext(Store);

  const { settleNum, settleConfigNum } =
    settleHeaderDs.current?.get(['settleNum', 'settleConfigNum']) || {};
  const supBankFlag = settleHeaderDs?.getState('supBankFlag');
  const [redLineDs, setRedLineDs] = useState({});
  const redListDs = useMemo(() => new DataSet(redTableDS(redList)), [redList]);

  const { ecInvCancelMsg, withCancelEcSettleFlag } = getEcInvCancelInfo?.() || {};

  const filledInfoCode = documentType === 'INVOICE' ? invoiceCodes[action] : paymentCodes[action];

  const filledInfoDs = useMemo(
    () => new DataSet(settleHeaderDS(settleHeaderId, documentType, { remoteProps })),
    [remoteProps, settleHeaderId, documentType]
  );

  useEffect(() => {
    if (enableDirInvFlag) {
      // eslint-disable-next-line no-unused-expressions
      redListDs?.map((record) => {
        // eslint-disable-next-line no-param-reassign
        record.isExpanded = true;
        const settleNum = record.get('settleNum');
        if (!redLineDs[settleNum]) {
          const children = record?.get('redInfoLineDTOList') || [];
          const currentDs = new DataSet(redTableLineDS(children));
          setRedLineDs((prevState) => ({
            ...prevState,
            [settleNum]: currentDs,
          }));
        }
      });
    }
  }, [redListDs, redLineDs, enableDirInvFlag]);

  useEffect(() => {
    redListDs.addEventListener('update', handleUpdateDs);
    return () => {
      redListDs.removeEventListener('update', handleUpdateDs);
    };
  }, [redListDs, handleUpdateDs, redLineDs]);

  const handleUpdateDs = useCallback(
    ({ name, value, record }) => {
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
    },
    [redLineDs]
  );

  const invCancelAlertMsg = useMemo(() => {
    return withCancelEcSettleFlag
      ? intl
          .get(`ssta.common.view.message.cancelAndVoidInvoice`, { settleNum })
          .d('当前操作将取消发票结算单{settleNum}及红冲（作废）关联的税务发票，请确认!')
      : intl
          .get('ssta.common.view.message.invoiceCancelAndDisassociation', { settleNum })
          .d('当前操作将取消发票结算单{settleNum}及取消税务发票与当前单据的关联关系，请确认!');
  }, [settleNum, withCancelEcSettleFlag]);

  useEffect(() => {
    filledInfoDs.setState('supBankFlag', supBankFlag);
    filledInfoDs.create(settleHeaderDs.current.toData());
  }, [filledInfoDs, settleHeaderDs, supBankFlag]);

  useEffect(() => {
    modal.handleOk(handleOk);
  }, [modal, handleOk, redLineDs]);

  useEffect(() => {
    if (remoteProps) {
      const cleanupFunc = remoteProps.event.fireEvent('onFilledInfoModalEffect', {
        action,
        documentType,
        filledInfoDs,
      });
      if (isFunction(cleanupFunc)) return cleanupFunc;
    }
  }, [action, filledInfoDs, remoteProps, documentType]);

  const handleOk = useCallback(async () => {
    if (enableDirInvFlag && !isEmpty(redList)) {
      const results = await Promise.all(
        redList.map(async (record) => {
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
        if (onOk) onOk();
        modal.close();
        return;
      }
    }
    const okFlag = await unitValidate(filledInfoDs, custConfig[filledInfoCode]);
    if (!okFlag) {
      return false;
    } else {
      return onOk(filledInfoDs);
    }
  }, [
    onOk,
    custConfig,
    filledInfoDs,
    filledInfoCode,
    enableDirInvFlag,
    redList,
    redLineDs,
    redListDs,
    isDelete,
    modal,
  ]);

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

  const expandedRowRenderer = useCallback(
    ({ record }) => {
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
      return <Table defaultRowExpanded columns={columns} dataSet={currentDs} />;
    },
    [redLineDs]
  );

  return (
    <Fragment>
      {action === 'RETURN' && settleType === 'INVOICE' && settleStatus === 'CONFIRMING_AGAIN' && (
        <DynamicAlert placement="modal-top" message={invCancelAlertMsg} />
      )}
      {enableDirInvFlag && !isEmpty(redList) && (
        <DynamicAlert
          placement="modal-top"
          message={intl
            .get('ssta.common.view.message.redVoidInvoiceTipsInfo', {
              settleNum,
              settleConfigNum,
            })
            .d(
              '由于单据{settleNum}主策略{settleConfigNum}当前配置了票单同步取消,即结算单取消后系统会自动红冲税务发票,若确认取消请维护:【冲红原因】,或联系采购员更新结算策略为票单不同步取消后重试'
            )}
        />
      )}
      {customizeForm(
        { code: filledInfoCode },
        <Form dataSet={filledInfoDs} useColon={false} columns={1} labelLayout="float">
          {['CONFIRM', 'SYNC'].includes(action) &&
            documentType === 'INVOICE' &&
            settleStatus !== 'CANCELING' && <DatePicker name="accountingDate" />}
          {action === 'CANCEL' && <TextArea name="canceledReason" resize="vertical" />}
          {action === 'CANCEL' && !isNil(ecInvCancelMsg) && withCancelEcSettleFlag && (
            <TextArea name="invoiceRefundedReason" resize="vertical" />
          )}
          {['CONFIRM', 'RETURN'].includes(action) && settleStatus === 'SUBMITED' && (
            <TextArea name="approvedRemark" resize="vertical" />
          )}
          {['CONFIRM', 'RETURN'].includes(action) && settleStatus === 'CANCELING' && (
            <TextArea name="canceledRemark" resize="vertical" />
          )}
          {action === 'SYNC' &&
            documentType === 'PAYMENT' && [
              <FormItem name="bankIdLov" editor="lov" editable />,
              <FormItem name="bankBranchName" disabled />,
              <FormItem name="bankAccountNum" disabled />,
              <FormItem name="bankAccountName" disabled />,
            ]}
        </Form>
      )}
      {enableDirInvFlag && !isEmpty(redList) && (
        <div style={{ marginTop: isDelete ? 0 : '16px' }}>
          <Table columns={colunms} dataSet={redListDs} expandedRowRenderer={expandedRowRenderer} />
        </div>
      )}
    </Fragment>
  );
};

export default FilledInfoModal;
