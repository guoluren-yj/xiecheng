import React from 'react';
import { Form, SelectBox, NumberField, Select, TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import SupplierHocLov from '@/components/SupplierHocLov';

import styles from './index.less';

function Condition({ conditionDs }) {
  return (
    <Form
      dataSet={conditionDs}
      labelLayout="float"
      columns={1}
      className={styles['preview-condition-form']}
    >
      <SelectBox name="allSkuFlag" style={{ top: 20, marginBottom: 6 }} />
      {conditionDs.current.get('allSkuFlag') === 0 && (
        <>
          <SupplierHocLov
            name="supplierLov"
            dataSet={conditionDs}
            oldLovFieldsProps={[
              {
                name: 'supplierLov',
                lovCode: 'SMPC.SELF_PUR_SUPPLIER',
                textField: 'supplierName',
                valueField: 'supplierId',
              },
              {
                name: 'supplierCompanyId',
                bind: `supplierLov.supplierId`,
              },
              {
                name: 'supplierCompanyName',
                bind: `supplierLov.supplierName`,
              },
            ]}
          />
          <NumberField name="priceRange" />
          <Select name="labelList" maxTagCount={10} />
        </>
      )}
      <Select name="directOperationType" />
      <TextArea
        name="unshelveRemark"
        hidden={conditionDs.current.get('directOperationType') !== 'UNSHELF'}
      />
    </Form>
  );
}

export default observer(Condition);
