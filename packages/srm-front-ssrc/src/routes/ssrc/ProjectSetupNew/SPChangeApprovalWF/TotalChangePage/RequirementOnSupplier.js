import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { StoreContext } from '../store/StoreProvider';
import SupplierTable from '../CardList/SupplierTable';
import { renderChangeFieldsColor } from '../utils';

// 标段/包信息
const supplierLineTable = observer(() => {
  const { commonDs: { headerDs } = {}, customizeForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  const { sourceMethod } = headerDs?.current?.get(['sourceMethod']) || {};

  return (
    <>
      {customizeForm(
        {
          code: getCustomizeUnitCode('sourceMethodForm'),
          dataSet: headerDs,
        },
        <Form
          dataSet={headerDs}
          columns={3}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          useWidthPercent
        >
          <Output
            name="sourceMethodMeaning"
            renderer={({ value, record }) =>
              renderChangeFieldsColor({ value, record, name: 'sourceMethod' })
            }
          />
        </Form>
      )}
      {sourceMethod === 'INVITE' && (
        <div style={{ marginTop: '16px' }}>
          <SupplierTable />
        </div>
      )}
    </>
  );
});

export default supplierLineTable;
