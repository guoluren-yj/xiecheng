import React, { useCallback } from 'react';
import { TextField } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import { compose } from 'lodash';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

const ExpandTable = ({ columns, dataSet, customizeTable = e => e, custLoading }) => {
  const renderLeftSearchBar = useCallback(() => {
    return (
      <TextField
        clearButton
        style={{ width: 280 }}
        valueChangeAction="blur"
        onChange={value => {
          // eslint-disable-next-line no-unused-expressions
          dataSet.queryDataSet?.current?.set({
            companyNum: value,
            companyName: value,
          });
          dataSet.query();
        }}
        value={dataSet.queryDataSet?.current?.get('companyNum')}
        placeholder={intl
          .get('sslm.supplyAbility.view.message.expandTable.filters')
          .d('请输入公司编码、公司名称查询')}
      />
    );
  }, []);

  // 查询回调
  const handleQuery = useCallback(
    (queryProps = {}) => {
      const { params } = queryProps;
      if (dataSet.queryDataSet?.current) {
        const clearParams = {}; // 清理
        const dataObj = dataSet.queryDataSet.current.toData();
        if (dataObj) {
          for (const key in dataObj) {
            if (!['companyNum', 'companyName'].includes(key)) {
              // 排除掉自定义的查询条件
              if (!Object.prototype.hasOwnProperty.call(params, key)) {
                clearParams[key] = undefined;
              }
            }
          }
        }
        dataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        });
        dataSet.query();
      } else {
        dataSet.query();
      }
    },
    [dataSet]
  );

  const clearValues = () => {
    if (dataSet.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = dataSet.queryDataSet.current.toData();
      if (dataObj) {
        // eslint-disable-next-line guard-for-in
        for (const key in dataObj) {
          clearParams[key] = undefined;
        }
      }
      dataSet.queryDataSet.current.set({
        ...clearParams,
      });
    }
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
    dataSet.query();
  };

  return customizeTable(
    { code: 'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.EXPAND_TABLE' },
    <SearchBarTable
      columns={columns}
      dataSet={dataSet}
      custLoading={custLoading}
      searchCode="SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.EXPAND_SEACHER_BAR"
      searchBarConfig={{
        left: {
          render: (_, queryDataSet) => renderLeftSearchBar(queryDataSet),
        },
        closeFilterSelector: true,
        expandable: false,
        onReset: () => clearValues(),
        onClear: () => clearValues(),
        onQuery: queryProps => handleQuery(queryProps),
      }}
      autoHeight={{ type: 'maxHeight', diff: 35 }}
    />
  );
};

export default compose(
  withCustomize({
    unitCode: ['SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.EXPAND_TABLE'],
  })
)(ExpandTable);
