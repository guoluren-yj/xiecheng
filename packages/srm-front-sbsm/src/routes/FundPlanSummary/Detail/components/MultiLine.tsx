import React, { useContext, useMemo, Fragment } from 'react';
import { observer } from 'mobx-react';
import { Select, Form, DataSet } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import FilterBarTable from '_components/FilterBarTable';

import { Store } from '../stores';

const MultiLine = observer(() => {

  const { headerDs, multiLineDs } = useContext(Store);

  const prepViewType = headerDs.current?.get('prepViewType');

  const barDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'sumDimension',
          label: intl.get(`sbsm.fundPlan.model.summary.balAmountDimension`).d('编制金额维度'),
          lookupCode: 'SBSM.BALANCE_AMOUNT_DIMENSION',
          defaultValue: 'SUPPLIER',
        },
      ],
    });
  }, []);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      { name: 'dimensionCode', width: 150 },
      { name: 'dimensionName', width: 220 },
      prepViewType === 'STAFE'
        ? { name: 'stageAmount', width: 150, footerSummary: true }
        : { name: 'documentAmount', width: 150, footerSummary: true },
      { name: 'balEnablePayAmount', width: 160, footerSummary: true },
      { name: 'balOccupyPayAmount', width: 160, footerSummary: true },
      { name: 'balOccupyApplyAmount', width: 160, footerSummary: true },
      { name: 'balPayAmount', width: 160, footerSummary: true },
      { name: 'balApplyAmount', width: 160, footerSummary: true },
      { name: 'balPaymentDate', width: 200 },
      { name: 'balPaymentDateLast', width: 200 },
    ];
  }, [prepViewType]);

  return (
    <Fragment>
      <Form labelLayout={LabelLayout.float} columns={4} dataSet={barDs} style={{ marginBottom: 10 }}>
        <Select name="sumDimension" clearButton={false} />
      </Form>
      <FilterBarTable
        columns={columns}
        dataSet={multiLineDs}
        style={{ maxHeight: 430 }}
      />
    </Fragment>
  );
});

export default MultiLine;
