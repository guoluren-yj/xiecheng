import React, { useEffect } from 'react';
import { Form, TextField, Lov, NumberField } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';
// import { observable, action } from 'mobx';
import intl from 'utils/intl';

export default function ReceiveForm(props) {
  const { dataSet, recordData, customizeForm } = props;
  useEffect(() => {
    const {skuId, skuCode, ...rest}=recordData.toData();
    dataSet.loadData([{ ...rest, inventoryAddress: recordData?.toData()?.receiveFullAddress }]);
  }, []);
  return (
    <>{
      customizeForm({
        code: 'SMODR.REQUEST.DETAIL.RECEIVE.INFO',
      },
        <Form labelLayout='float' dataSet={dataSet} columns={2}>
          <Lov name='skuCodeLov' />
          <TextField name='skuName' />
          <Lov name='itemCode' />
          <TextField name='itemName' />
          <Lov name='inventoryName' />
          <TextField name='inventoryAddress' />
          <TextField name='receiveContactName' />
          <TextField name='receiveMobilePhone' />
          <TextField name='receiveEmail' />
          <Observer>
            {() => (
              <NumberField
                style={{ width: '100%' }}
                name='quantity'
                help={
                  dataSet.current?.get('skuCodeLov')
                    ? `${intl.get('smodr.apply.model.tipCount').d('剩余库存数为')}${dataSet.current?.get('surplusStock')}`
                    : null
                }
              />
            )
            }
          </Observer>
          <Lov name='uomName' />
          <Lov name='taxRate' />
          <NumberField name='unitPrice' />
          <Lov name='supplierCompanyName' />
        </Form>
      )
    }
    </>
  );
}
