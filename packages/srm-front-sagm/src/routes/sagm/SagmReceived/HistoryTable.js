import React, { useMemo, memo, useRef } from 'react';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import QueryField from '@/components/QueryField';

const organizationId = getCurrentOrganizationId();

function AgmDetailTable(props) {
  const {
    dataSet,
    searchBarCode,
    customizeUnitCode,
    customizeTable,
    onViewAgmDetail = (e) => e,
  } = props;

  const queryRef = useRef();

  const columns = useMemo(
    () =>
      [
        { name: 'agreementStatusMeaning', width: 90 },
        {
          name: 'agreementNumber',
          minWidth: 170,
          renderer: ({ text, record }) => <a onClick={() => onViewAgmDetail(record)}>{text}</a>,
        },
        {
          name: 'agreementName',
          minWidth: 180,
        },
        {
          name: 'versionNum',
          width: 80,
          renderer: ({ value }) => (value ? `v${value}` : '-'),
        },
        {
          name: 'creationDate',
          width: 150,
        },
        {
          name: 'companyName',
          minWidth: 180,
        },
        {
          name: 'supplierCompanyName',
          minWidth: 180,
        },
        {
          name: 'sourceFromMeaning',
          width: 100,
        },
      ].filter((f) => f.show || !('show' in f)),
    []
  );

  const searchBarProps = {
    style: { maxHeight: 'calc(100% - 22px)' },
    searchBarConfig: {
      fieldProps: {
        companyId: { lovPara: { tenantId: organizationId } },
      },
      onReset: () => {
        if (queryRef.current) queryRef.current.handleClear();
      },
      onClear: () => {
        if (queryRef.current) queryRef.current.handleClear();
      },
      left: {
        render: () => (
          <QueryField
            name="agreementNumbers"
            dataSet={dataSet}
            onRef={(ref) => {
              queryRef.current = ref;
            }}
            placeholder={intl
              .get('sagm.common.view.queryMsg.agreementCode')
              .d('请输入协议编码查询')}
          />
        ),
      },
    },
    cacheState: true,
    searchCode: searchBarCode,
    customizedCode: customizeUnitCode,
  };
  return customizeTable(
    { code: customizeUnitCode },
    <SearchBarTable dataSet={dataSet} columns={columns} {...searchBarProps} />
  );
}

export default memo(AgmDetailTable);
