import React, { Fragment } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';

const Maintenance = (props) => {
  const {
    maintenanceDs,
    customizeTable,
    detailChange = (e) => e,
    operationChange = (e) => e,
  } = props;

  const columns = [
    {
      name: 'asnNum',
      with: 100,
      renderer: ({ record }) => {
        return <a onClick={() => detailChange(record)}>{record.get('asnNum')}</a>;
      },
    },
    {
      name: 'asnTypeCodeMeaning',
      with: 150,
    },
    {
      name: 'supplierCompanyName',
      with: 160,
    },
    {
      name: 'supplierSiteName',
      with: 160,
    },
    {
      name: 'companyName',
      with: 160,
    },
    {
      name: 'actualReceiverName',
      with: 160,
    },
    {
      name: 'organizationName',
      with: 160,
    },
    {
      name: 'shipToLocationAddress',
      with: 160,
      renderer: ({ value }) => (
        <Tooltip title={value} placement="topLeft">
          {value}
        </Tooltip>
      ),
    },
    {
      name: 'creationDate',
      with: 160,
    },
    {
      name: 'shipDate',
      with: 160,
    },
    {
      name: 'operationRecord',
      with: 160,
      renderer: ({ record }) => {
        return (
          <a onClick={() => operationChange(record)}>
            {intl.get(`sinv.common.model.common.operationRecord`).d('操作记录')}
          </a>
        );
      },
    },
  ];

  return (
    <Fragment>
      <div style={{ height: 'calc(100vh - 245px)' }}>
        {customizeTable(
          { code: 'SINV.DELIVERY_CREATION.LIST_BY_MAINTAIN' },
          <SearchBarTable
            searchCode="SINV.DELIVERY_CREATION.NEW_FILTER_BY_MAINTAIN"
            cacheState
            dataSet={maintenanceDs}
            columns={columns}
            boxSizing="wrapper"
            style={{ maxHeight: `calc(100% - 16px)` }}
          />
        )}
      </div>
    </Fragment>
  );
};

export default Maintenance;
