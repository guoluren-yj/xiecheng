import React, { useCallback, useEffect, useMemo, Fragment } from 'react';
import { Table, DataSet, Form, TextField, Button } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';

import DynamicAlert from '../../../../../components/DynamicAlert';
import { bepListDS, verificationDS } from '../../stores/initiatePayDS';
import { InitiatePayCodeMap } from '../../../utils/type';

interface InitateBepProps {
  modal?: any;
  topSelected: any[];
  okCallback: Function;
  customizeTable: Function;
}

const InitateBep = (props: InitateBepProps) => {

  const { modal, okCallback, topSelected, customizeTable } = props;

  const bepListDs = useMemo(() => new DataSet(bepListDS(topSelected)), [topSelected]);
  const verificationDs = useMemo(() => new DataSet(verificationDS(topSelected)), [topSelected]);

  const columns = useMemo(() => {
    return [
      { name: 'payHeaderNum', width: 150 },
      { name: 'payAmount', width: 150 },
      { name: 'currencyCode', width: 120 },
      { name: 'creationDate', width: 120 },
      { name: 'payBankAccountNum', width: 150 },
      { name: 'payBankAccountName', width: 150 },
      { name: 'bankAccountName', width: 150 },
    ];
  }, []);

  const handleOk = useCallback(async () => {
    const res = await verificationDs.setState('submitType', 'initiateBep').submit();
    if (!res) return false;
    if(okCallback) okCallback();
  }, [verificationDs, okCallback]);

  useEffect(() => {
    if (modal) {
      modal.handleOk(handleOk);
      modal.update({ okText: intl.get('sbsm.paymentWorkbench.view.button.confirmInitiatePay').d('确认发起支付') });
    }
  }, [modal, handleOk]);

  const handleGetVerificationCode = useCallback(async() => {
    await verificationDs.setState('submitType', 'sendCode').forceSubmit();
  }, [verificationDs]);

  return (
    <Fragment>
      <DynamicAlert
        type="info"
        placement='modal-top'
        message={intl.get('sbsm.paymentWorkbench.view.message.enterCodeWillInitiateBepConfirm').d('输入验证码后，将对以下支付单发起银企直联支付，请确认')}
      />
      {customizeTable({
        code: InitiatePayCodeMap.BepGrid,
      }, (
        <Table
          columns={columns}
          dataSet={bepListDs}
          style={{ maxHeight: 'calc(100vh - 260px)' }}
        />
      ))}
      <div style={{ display: 'flex', marginTop: 28 }}>
        <Form dataSet={verificationDs} labelLayout={LabelLayout.float} style={{ flex: 1, marginRight: 8 }}>
          <TextField name="verificationCode" />
        </Form>
        <Button color={ButtonColor.primary} onClick={handleGetVerificationCode}>
          {intl.get('sbsm.paymentWorkbench.view.button.getVerificationCode').d('获取验证码')}
        </Button>
      </div>
    </Fragment>
  );
};

export default InitateBep;