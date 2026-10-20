import React, { useMemo, useContext, Fragment, useState, useEffect } from 'react';
import { Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../stores';
import { ExeCustCodeMap } from '../../utils/type';

const { Option } = Select;

const Execution = () => {
  const {
    executionDs,
    customizeTable,
  } = useContext(Store);

  const [displayType, setDisplayType] = useState('ALL');

  const columns = useMemo(() => [
    { name: 'payHeaderNum', width: 200 },
    { name: 'payLineNum', width: 150 },
    { name: 'payAmount', width: 150 },
    { name: 'recordTypeMeaning', width: 150 },
    { name: 'recordStatusMeaning', width: 150 },
    { name: 'creationDate', width: 150 },
    { name: 'operationSourceMeaning', width: 150 },
    { name: 'companyNum', width: 160 },
    { name: 'companyName', width: 200 },
    { name: 'displaySupplierNum', width: 160 },
    { name: 'displaySupplierName', width: 200 },
    { name: 'currencyCode', width: 100 },
    { name: 'payTypeName', width: 150 },
    { name: 'payFormMeaning', width: 150 },
  ], []);

  useEffect(() => {
    executionDs.setQueryParameter('displayType', displayType);
    if(executionDs.getState('queryStatus') === 'ready') executionDs.query();
  }, [executionDs, displayType]);

  return (
    <Fragment>
      {customizeTable(
        {
          code: ExeCustCodeMap.Grid,
        },
        <SearchBarTable
          columns={columns}
          dataSet={executionDs}
          style={{ maxHeight: 430 }}
          searchCode={ExeCustCodeMap.Filter}
          searchBarConfig={{
            expandable: false,
            closeFilterSelector: true,
            right: {
              render: () => (
                <div>
                  <Select
                    clearButton={false}
                    value={displayType}
                    onChange={(value) => setDisplayType(value)}
                  >
                    <Option value="ALL">
                      {intl.get('sbsm.paymentPool.view.option.allShow').d('全量记录')}
                    </Option>
                    <Option value="FINAL">
                      {intl.get('sbsm.paymentPool.view.option.finalShow').d('最终展示')}
                    </Option>
                  </Select>
                </div>
              ),
            },
          }}
        />
      )}
    </Fragment>
  );
};

export default Execution;