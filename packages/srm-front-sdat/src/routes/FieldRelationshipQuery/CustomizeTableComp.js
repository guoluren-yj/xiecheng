import React from 'react';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

export default function CustomizeTableComp(props) {
  const { customizeTable, dataSet } = props;

  // const clearQueryParameter = () => {

  // };

  const columns = () => {
    return [
      { name: 'menuCode' },
      { name: 'menuName' },
      { name: 'unitGroupCode' },
      { name: 'unitGroupName' },
      { name: 'unitCode' },
      { name: 'unitName' },
      { name: 'unitType' },
      { name: 'tableName' },
      { name: 'unitFieldSource' },
      { name: 'unitFieldCode' },
      { name: 'unitFieldName' },
    ];
  };

  return customizeTable(
    {
      code: 'SDAT.FIELD_RELATIONSHIP_QUERY_LIST',
    },
    <SearchBarTable
      virtual
      virtualCell
      searchCode="SDAT.FIELD_RELATIONSHIP_QUERY_LIST_SEARCHBAR"
      dataSet={dataSet}
      columns={columns()}
      style={{
        maxHeight: 'calc(100vh - 240px)',
      }}
      searchBarConfig={{
        left: {},
        // onReset: clearQueryParameter,
        // onClear: clearQueryParameter,
      }}
      customizable
      customizedCode="SDAT.PLATFORM_FIELD_RELATIONSHIP_QUERY_LIST"
    />
  );
}
