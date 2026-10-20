/* @Description:
 * @Date: 2021-08-05
 * @author: jss <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { useMemo, useEffect, useContext, useCallback, useState, Fragment } from 'react';
import { Form, TextArea, DataSet, Table } from 'choerodon-ui/pro';
import { isEmpty, isFunction } from 'lodash';
import intl from 'utils/intl';

import { unitValidate } from '@/utils/utils';
import { Store } from '../Detail/StoreProvider';
import { settleHeaderDS, redTableLineDS, redTableDS } from '@/stores/NewSupplySettleDS';
import DynamicAlert from '@/routes/Components/DynamicAlert';

const invoiceCodes = {
  CONFIRM: 'SSTA.SUPPLY_SETTLE_DETAIL.INV_CONFIRM',
  RETURN: 'SSTA.SUPPLY_SETTLE_DETAIL.INV_RETURN',
  CANCEL: 'SSTA.SUPPLY_SETTLE_DETAIL.INV_CANCEL',
};

const paymentCodes = {
  CONFIRM: 'SSTA.SUPPLY_SETTLE_DETAIL.PAY_CONFIRM',
  RETURN: 'SSTA.SUPPLY_SETTLE_DETAIL.PAY_RETURN',
  CANCEL: 'SSTA.SUPPLY_SETTLE_DETAIL.PAY_CANCEL',
};

const FilledInfoModal = (props) => {
  const { onOk, modal, action, enableDirInvFlag, redList = [], isDelete } = props;

  const {
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
  const [redLineDs, setRedLineDs] = useState({});
  const redListDs = useMemo(() => new DataSet(redTableDS(redList)), [redList]);

  const approvalFlag = ['CONFIRM', 'RETURN'].includes(action);
  const filledInfoCode = documentType === 'INVOICE' ? invoiceCodes[action] : paymentCodes[action];

  const filledInfoDs = useMemo(() => new DataSet(settleHeaderDS(settleHeaderId, documentType)), [
    settleHeaderId,
    documentType,
  ]);

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

  useEffect(() => {
    filledInfoDs.create(settleHeaderDs.current.toData());
  }, [filledInfoDs, settleHeaderDs]);

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
          {action === 'CANCEL' && <TextArea name="canceledReason" resize="vertical" />}
          {approvalFlag && ['SUBMITED', 'WAIT_SUPPLIER_INVOICE'].includes(settleStatus) && (
            <TextArea name="approvedRemark" resize="vertical" />
          )}
          {approvalFlag && settleStatus === 'CANCELING' && (
            <TextArea name="canceledRemark" resize="vertical" />
          )}
          {approvalFlag && settleStatus === 'WAIT_SUPPLIER_CONFIRM' && (
            <TextArea name="supplierApprovedRemark" resize="vertical" />
          )}
          {approvalFlag && settleStatus === 'WAIT_SUPPLIER_CANCEL' && (
            <TextArea name="supplierCanceledRemark" resize="vertical" />
          )}
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
