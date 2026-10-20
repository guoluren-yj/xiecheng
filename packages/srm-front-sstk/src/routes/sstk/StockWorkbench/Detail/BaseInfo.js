import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import FormPro from '@/components/FormPro';
import SecondCard from '@/routes/sstk/components/SecondCard';
import { statusRender } from '../../components/Tag';
import { fetchOrderTypes } from '../api';

export default observer(function BaseInfo(props) {
  const { readOnly, dataSet, operateType, orderLineDs, customizeForm, customizeCode, remote } = props;
  const { statusCodeMeaning, deleteFlag, inOutHeaderId } = dataSet.current?.get(['statusCodeMeaning', 'deleteFlag', 'inOutHeaderId']) || {};
  const disabled = inOutHeaderId && orderLineDs.length > 0;
  const customConfig = {
    customizeForm,
    customizeCode,
    customizeOptions: { readOnly },
  };

  useEffect(() => {
    const orderTypeField = dataSet.getField('orderType');
    fetchOrderTypes().then(res => {
      if (res) {
        const data = (res['STCK.IN_OUT_ORDER.ORDER_TYPE'] || []).filter(f => f.parentValue === operateType);
        orderTypeField.set('options', new DataSet({ data }));
        // 新建时，仅一条数据赋默认值
        if (!inOutHeaderId && data.length === 1) {
          dataSet.current.set('orderType', data[0]?.value);
        }
      }
    });
    if (remote) {
      remote.event.fireEvent('initDefaultValue', {
        dataSet,
      });
    }
  }, []);
  return (
    <>
      <FormPro
        readOnly={readOnly}
        columns={3}
        dataSet={dataSet}
        {...customConfig}
        fields={[
          { name: 'orderNum' },
          { name: 'orderName' },
          {
            name: 'statusCode',
            show: readOnly,
            renderer: ({ text }) => statusRender(text, statusCodeMeaning, deleteFlag),
          },
          {
            name: 'orderType',
            _type: 'Select',
            optionsFilter: record => record.get('parentValue') === operateType,
          },
          { name: 'realName', show: readOnly },
          { name: 'creationDate', show: readOnly },
          { name: 'remark', _type: 'TextArea', colSpan: 2, rowSpan: 2, resize: "both" },
        ]}
      />
      {
        operateType === 'TRANSFER' && (
          <>
            <SecondCard title={intl.get('sstk.stockWorkbench.view.transferOut').d('调出信息')}>
              <FormPro
                readOnly={readOnly}
                columns={3}
                dataSet={dataSet}
                {...customConfig}
                fields={[
                  { name: 'outCompanyLov', _type: 'Lov', disabled },
                  { name: 'outInvOrganizationLov', _type: 'Lov', disabled },
                  { name: 'outInventoryLov', _type: 'Lov', disabled },
                ]}
              />
            </SecondCard>
            <SecondCard title={intl.get('sstk.stockWorkbench.view.transferIn').d('调入信息')}>
              <FormPro
                readOnly={readOnly}
                columns={3}
                dataSet={dataSet}
                {...customConfig}
                fields={[
                  { name: 'inCompanyLov', _type: 'Lov', disabled },
                  { name: 'inInvOrganizationLov', _type: 'Lov', disabled },
                  { name: 'inInventoryLov', _type: 'Lov', disabled },
                ]}
              />
            </SecondCard>
          </>
        )
      }
    </>
  );
});