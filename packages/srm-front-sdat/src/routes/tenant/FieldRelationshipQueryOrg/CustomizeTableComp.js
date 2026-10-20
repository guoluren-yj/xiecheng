import React from 'react';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

export default function CustomizeTableComp(props) {
  const { customizeTable, dataSet } = props;

  const columns = () => {
    return [
      // { name: 'directoryGroup' },
      { name: 'menuName', width: 200 },
      { name: 'singleMenuName' },
      { name: 'singleMenuCode' },
      { name: 'unitGroupCode', width: 200 },
      { name: 'unitGroupName', width: 200 },
      { name: 'unitCode', width: 200 },
      { name: 'unitName', width: 200 },
      { name: 'unitType' },
      {
        name: 'tableName',
        width: 200,
        renderer: ({ text }) => {
          return !text || text === '-1' ? '-' : text;
        },
      },
      { name: 'unitFieldSource' },
      { name: 'unitFieldCode' },
      { name: 'unitFieldAlias' },
      { name: 'unitFieldName' },
      { name: 'unitFieldType' },
      { name: 'unitFieldNameType' },
      { name: 'businessObjectCode' },
      { name: 'businessObjectName' },
    ];
  };

  return customizeTable(
    {
      code: 'SDAT.ORG_FIELD_RELATIONSHIP_QUERY.LIST',
    },
    <SearchBarTable
      // virtual
      // virtualCell
      clearButton
      searchCode="SDAT.ORG_FIELD_RELATIONSHIP_QUERY.QUERYBAR"
      dataSet={dataSet}
      columns={columns()}
      style={{
        maxHeight: 'calc(100vh - 195px)',
      }}
      searchBarConfig={{
        left: {},
        // onReset: clearQueryParameter,
        // onClear: clearQueryParameter,
        // onQuery: handleFilterQuery,
      }}
      customizable
      customizedCode="SDAT.ORG_FIELD_RELATIONSHIP_QUERY_LIST"
    />
  );
}
