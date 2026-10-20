import React, { useCallback, useMemo } from 'react';
import { Icon } from 'choerodon-ui';
import { DataSet, TextField } from 'choerodon-ui/pro';
import { omit } from 'lodash';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { SelectionMode, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';

interface ManualProps {
  tableDs: DataSet,
}

const Manual: React.FC<ManualProps> = ({ tableDs }) => {

  const columns = useMemo(
    (): ColumnProps[] => [
      { name: 'interfaceCode' },
      { name: 'interfaceName' },
      {
        name: 'serviceCode',
        width: 120,
      },
      {
        name: 'name',
        width: 80,
      },
      {
        name: 'requestMethod',
        width: 80,
      },
      { name: 'path' },
    ],
    []
  );

  // 检索
  const handleSearch = useCallback((params) => {
    let filterValues: { interfaceCode?: string } = params;
    const { interfaceCode = '' } = filterValues;
    filterValues = omit(filterValues, ['__dirty']);
    tableDs.setQueryParameter('queryParams', {
      ...filterValues,
      interfaceName: interfaceCode,
    });
    tableDs.query();
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 152px)' }}>
      <SearchBarTable
        searchCode="HITF.INTERFACE.DEFINITION.MODAL.FILTER"
        selectionMode={SelectionMode.rowbox}
        columns={columns}
        dataSet={tableDs}
        cacheState
        searchBarConfig={{
          left: {
            render: (_, dataSet) => {
              return (
                <TextField
                  clearButton
                  dataSet={dataSet}
                  name="interfaceCode"
                  placeholder={intl
                    .get('hitf.interface.definition.filter.codeAndName')
                    .d('请输入接口编码、接口名称查询')}
                  prefix={<Icon type="search" />}
                  style={{ width: '280px', margin: '0 20px 4px 0', zIndex: 0 }}
                />
              );
            },
          },
          onQuery: ({ params }) => handleSearch(params),
          closeFilterSelector: true,
          expandable: false,
        }}
        autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -80 }}
      />
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application', 'hitf.services'],
})(Manual));
