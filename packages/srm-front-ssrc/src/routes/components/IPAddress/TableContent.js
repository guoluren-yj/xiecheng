import React, { useMemo, useCallback } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop, compose } from 'lodash';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

const TableContent = (props = {}) => {
  const { tableLineDS, useCuotomFlag = true, customizeTable = noop, code = '' } = props;

  const columns = useMemo(
    () => [
      {
        name: 'operateNode',
        width: 90,
        renderer: ({ record }) => {
          const operateNodeMeaning = record.get('operateNodeMeaning');
          const valueText = operateNodeMeaning || '-';

          return valueText;
        },
      },
      {
        name: 'submittedDate',
        width: 140,
      },
      {
        name: 'supplierCompanyIp',
        // width: 140,
        renderer: ({ value, record }) => {
          const repeatIpFlag = record.get('repeatIpFlag');
          const valueText = value || '-';
          if (repeatIpFlag) {
            return <span style={{ color: 'red' }}> {valueText} </span>;
          }

          return valueText;
        },
      },
      {
        name: 'supplierIpAttribution',
        width: 180,
      },
    ],
    []
  );

  const tableContent = useCallback(() => {
    return (
      <Table
        dataSet={tableLineDS}
        rowKey="supOptExtInfoId"
        columns={columns}
        style={{
          maxHeight: '260px',
        }}
        virtual
        virtualCell
        pagination={false}
      />
    );
  }, [tableLineDS, columns, useCuotomFlag]);

  return useCuotomFlag ? customizeTable({ code }, tableContent()) : tableContent();
};

const hocUpdate = (Com) => {
  return compose(
    withCustomize({
      unitCode: ['SSRC.INQUIRY_COMMON.IPADDRESS_TABLE', 'SSRC.BID_COMMON.IPADDRESS_TABLE'],
    })
  )(observer(Com));
};

export default hocUpdate(TableContent);
