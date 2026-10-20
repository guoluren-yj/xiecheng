import React, { useState, useCallback } from 'react';
import { Dropdown, Button, Icon, TextField } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { isEmpty } from 'lodash';

import { tableMaxHeight, tableHeight } from '@/routes/components/utils';
import HistoryVersion from '@/routes/RegisterPolicyConfig/components/HistoryVersion';

const Index = ({ dataSet, dispatch, searchCode, customizeUnitCode, customizeTable }) => {
  const [pageChacheFlag, setPageChacheFlag] = useState(true);

  const getColumns = () => {
    const columns = [
      {
        name: 'tenantNum',
      },
      {
        name: 'tenantName',
      },
      {
        name: 'webUrl',
      },
      {
        name: 'registerStrategy',
        width: 120,
        renderer: ({ record }) => {
          const { strategyCfBasics } = record.get(['strategyCfBasics']);
          return isEmpty(strategyCfBasics) ? null : (
            <Dropdown
              overlay={() => {
                return (
                  <HistoryVersion
                    record={record}
                    showSubMenuFlag={false}
                    dispatch={dispatch}
                    isPlatform
                  />
                );
              }}
            >
              <Button funcType="link">
                <span>{intl.get('hzero.common.button.versionRecord').d('版本记录')}</span>
                <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
              </Button>
            </Dropdown>
          );
        },
      },
    ];
    return columns;
  };

  // 查询
  const handleQuery = (queryProps = {}) => {
    const { params } = queryProps;
    if (dataSet.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = dataSet.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
      dataSet.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        dataSet.query(dataSet.currentPage);
      } else {
        dataSet.query();
      }
    } else {
      dataSet.query(dataSet.currentPage);
    }
  };

  // 清空、重置回调
  const clearValues = () => {
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
  };

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback(queryDataSet => {
    return (
      <TextField
        clearButton
        name="tenantName"
        dataSet={queryDataSet}
        style={{ width: 280 }}
        placeholder={intl
          .get('sslm.common.modal.common.tenantNameOrNum')
          .d('请输入租户名称、租户编码查询')}
        prefix={<Icon type="search" style={{ fontSize: 14, paddingLeft: 8, paddingRight: 8 }} />}
      />
    );
  }, []);

  return (
    <div style={{ height: tableHeight.hasTab }}>
      {customizeTable(
        {
          code: customizeUnitCode,
        },
        <SearchBarTable
          cacheState
          dataSet={dataSet}
          columns={getColumns()}
          // searchBarRef={() => {}}
          searchCode={searchCode}
          style={{ maxHeight: tableMaxHeight.hasTab }}
          searchBarConfig={{
            editorProps: {},
            left: {
              render: (_, queryDataSet) => renderLeftSearchBar(queryDataSet),
            },
            onQuery: queryProps => handleQuery(queryProps),
            onReset: () => clearValues(),
            onClear: () => clearValues(),
            onFieldChange: () => {
              setPageChacheFlag(false);
            },
          }}
        />
      )}
    </div>
  );
};

export default Index;
