import React, { useContext, useMemo, Fragment, useEffect, useCallback } from 'react';
import { Select, Form, DataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
// import intl from 'utils/intl';
import { observer } from 'mobx-react';
import SearchBarTable from '_components/SearchBarTable';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';

import { DetailCustomizeCode } from '../../utils/type';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { prepResultBarDS } from '../stores/indexDS';

const PrepResult = () => {

  const { prepResultDs, customizeTable, headerDs } = useContext<StoreValueType>(Store);

  const prepResultBarDs = useMemo(() => new DataSet(prepResultBarDS()), []);
  const prepViewType = headerDs.current?.get('prepViewType');

  useEffect(() => {
    prepResultDs.setQueryParameter('displayDimension', 'SUPPLIER');
  }, [prepResultDs]);

  const changePrepResult = useCallback((val) => {
    prepResultBarDs.setQueryParameter('displayDimension', val);
    prepResultBarDs.query();
  }, [prepResultBarDs]);


  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'displayDimensionNum',
        width: 140,
      },
      {
        name: 'displayDimension',
        width: 140,
      },
      {
        name: 'currencyCode',
      },
      {
        name: 'currencyName',
      },
      prepViewType === 'STAGE'
        ? { name: 'stageAmount', width: 150 }
        : { name: 'documentAmount', width: 150 },
      {
        name: 'prepPayAmount',
        width: 140,
      },
      {
        name: 'prepApplyAmount',
        width: 140,
      },
      {
        name: 'prepEnablePayAmount',
        width: 140,
      },
      {
        name: 'prepEnableApplyAmount',
        width: 140,
      },
      {
        name: 'prefabPayAmount',
        width: 140,
      },
      {
        name: 'prefabApplyAmount',
        width: 140,
      },
      {
        name: 'prepEnableApplyAmount',
        width: 140,
      },
      {
        name: 'prepOccupyApplyAmount',
        width: 140,
      },
      {
        name: 'prepPaymentDate',
        width: 160,
      },
      {
        name: 'prepPaymentDateLast',
        width: 160,
      },
    ];
  }, [prepViewType]);

  return (
    <Fragment>
      <div>
        <Form labelLayout={LabelLayout.float} columns={3} dataSet={prepResultBarDs} style={{ marginBottom: 10, marginLeft: '-20px' }}>
          <Select name="displayDimension" onChange={changePrepResult} clearButton={false} />
        </Form>
        {customizeTable(
          { code: DetailCustomizeCode.ResultTableCode },
          <SearchBarTable
            virtual
            customizable
            dataSet={prepResultDs}
            columns={columns}
            searchCode={DetailCustomizeCode.ResultSearchTableCode}
            style={{ maxHeight: 430 }}
            searchBarConfig={{
              closeFilterSelector: true,
            }}
          />
        )}
      </div>
    </Fragment>
  );
};

export default observer(PrepResult);
