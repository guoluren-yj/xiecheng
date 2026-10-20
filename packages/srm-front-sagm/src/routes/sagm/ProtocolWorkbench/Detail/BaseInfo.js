import React, { useState, useEffect } from 'react';
import { Spin, DateTimePicker } from 'choerodon-ui/pro';

import SupplierHocLov from '@/components/SupplierHocLov';
import FormPro from '../component/FormPro';
import { workBenchFormUnitCode } from '../../const/uniCode';
import { agreementStatusRender } from '../renderUtils';

export default function BaseInfo(props) {
  // sourceType: 历史协议（只读） || 普通协议（可读可写） （个性化不同）
  const {
    dataSet,
    onSupplierChange = (e) => e,
    customizeForm,
    readOnly,
    // sourceType,
    customizeCode,
    isHistory,
    ...formProps
  } = props;
  const [formCustomizeCode, setFormCustomizeCode] = useState('');
  useEffect(() => {
    const code = readOnly
      ? isHistory
        ? workBenchFormUnitCode.history
        : workBenchFormUnitCode.view
      : workBenchFormUnitCode.edit;
    setFormCustomizeCode(code);
  }, [readOnly, isHistory]);
  const fields = [
    { name: 'agreementNumber' },
    { name: 'agreementName', _type: 'IntlField' },
    { name: 'versionNum' },
    { name: 'sourceFrom' },
    {
      name: 'agreementStatusMeaning',
      renderer: ({ value }) => agreementStatusRender({ text: value, record: dataSet.current }),
    },
    {
      name: 'creationDate',
      FormField: DateTimePicker,
      disabled: true,
    },
    { name: 'company', _type: 'Lov' },
    {
      name: 'supplier',
      FormField: SupplierHocLov,
      dataSet,
      oldLovFieldsProps: [
        {
          name: 'supplier',
          lovCode: 'SMAL.SUPPLIER_BY_PUR',
          valueField: 'supplierId',
          textField: 'supplierName',
        },
        {
          name: 'supplierCompanyId',
          bind: 'supplier.supplierId',
        },
        {
          name: 'supplierCompanyName',
          bind: 'supplier.supplierName',
        },
      ],
      onChange: onSupplierChange,
    },
    {
      _type: 'empty',
      name: 'empty1',
    },
    { name: 'remark', _type: 'TextArea', resize: 'both', row: 4, colSpan: 2 },
  ];
  return (
    <Spin dataSet={dataSet}>
      <FormPro
        {...formProps}
        readOnly={readOnly}
        dataSet={dataSet}
        fields={fields}
        columns={3}
        customizeForm={customizeForm}
        customizeCode={formCustomizeCode}
      />
    </Spin>
  );
}
