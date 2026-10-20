/**
 * 拓展中供货能力
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useEffect } from 'react';
import SearchBarTable from '_components/SearchBarTable';
import { dateRender } from 'utils/renderer';
import { Button } from 'choerodon-ui/pro';
import { renderStatus, tableHeight, tableMaxHeight } from '@/routes/components/utils';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

import { getCurrentUserId, getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import MultipleTextField from '@/routes/components/MultipleTextField';

const userId = getCurrentUserId();
const organizationId = getCurrentOrganizationId();
const userOrganizationId = getUserOrganizationId();

let expandSearchBarRef; // 拓展中筛选器ref

const Index = ({
  customizeTable,
  customizeUnitCode,
  searchBarCode,
  custLoading,
  dataSet,
  handleGoDetail = () => {},
}) => {
  useEffect(() => {
    dataSet.setQueryParameter('queryParam', {
      customizeUnitCode: `${customizeUnitCode},${searchBarCode}`,
    });
    dataSet.query(dataSet.currentPage);
  }, []);

  // 设置筛选器查询条件参数
  const setSearchBarConfig = () => {
    return {
      fieldProps: {
        supplierCompanyId: {
          lovPara: { userId, tenantId: organizationId, asyncCountFlag: 'Y' },
        },
        companyId: {
          lovPara: { organizationId: userOrganizationId },
        },
        itemCategoryIds: {
          lovPara: { enabledFlag: 1, tenantId: organizationId },
          optionsProps: {
            paging: 'server',
          },
        },
      },
      editorProps: {
        itemCategoryIds: {
          tableProps: {
            treeAsync: true,
            onRow: ({ record }) => {
              const nodeProps = {};
              if (record.get('hasChild') === '0') {
                nodeProps.isLeaf = true;
              }
              return nodeProps;
            },
          },
        },
      },
      onFieldChange: props => handleFieldChange({ ...props }),
    };
  };

  const handleFieldChange = ({ record, name, value }) => {
    if (name === 'supplierCompanyId' && value) {
      const { supplierCompanyId, supplierCompanyName } = value;
      record.set('supplierCompanyId', {
        supplierCompanyId,
        supplierCompanyName,
        uniqueKey: supplierCompanyId,
      });
    }
  };

  // 拓展中供货能力筛选器左侧渲染
  const renderExpandLeftSearchBar = (_, queryDataSet) => {
    return (
      <MultipleTextField
        dataSet={queryDataSet}
        name="expandNums"
        placeholder={intl
          .get('sslm.common.modal.sample.multiSelectReqNums')
          .d('请输入申请单号查询')}
      />
    );
  };

  // 拓展中筛选器清空、重置回调
  const clearValues = () => {
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
  };

  // 拓展中列表查询
  const handleExpandQuery = ({ params }) => {
    if (dataSet.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = dataSet.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['expandNums'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      // 处理多单号
      const reqList = params.expandNums;
      clearParams.expandNums = isEmpty(reqList) ? null : reqList.join(',');
      dataSet.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      dataSet.query();
    } else {
      expandSearchBarRef.handleQuery(true);
    }
  };

  const columns = [
    {
      name: 'supplyAbilityExpandStatus',
      width: 100,
      renderer: renderStatus,
    },
    {
      name: 'operations',
      width: 100,
      renderer: ({ record }) => {
        const { supplyAbilityExpandStatus } = record.get(['supplyAbilityExpandStatus']) || {};
        const editFlag = ['NEW', 'REJECT'].includes(supplyAbilityExpandStatus);
        return editFlag ? (
          <span>
            <Button funcType="link" onClick={() => handleGoDetail(record, 'edit')}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
          </span>
        ) : (
          '-'
        );
      },
    },
    {
      name: 'expandNum',
      width: 200,
      renderer: ({ value, record }) => (
        <a onClick={() => handleGoDetail(record, 'view')}>{value}</a>
      ),
    },
    {
      name: 'supplierCompanyName',
      width: 200,
    },
    {
      name: 'companyName',
      width: 170,
    },
    {
      name: 'createdUserName',
      width: 110,
    },
    {
      name: 'creationDate',
      width: 110,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'lastUpdatedUserName',
      width: 110,
    },
    {
      name: 'lastUpdateDate',
      width: 110,
      renderer: ({ value }) => dateRender(value),
    },
  ];

  return (
    <div style={{ height: tableHeight.hasTab }}>
      {customizeTable(
        {
          code: customizeUnitCode,
          readOnly: true,
        },
        <SearchBarTable
          cacheState
          dataSet={dataSet}
          columns={columns}
          custLoading={custLoading}
          searchBarRef={ref => {
            expandSearchBarRef = ref;
          }}
          style={{ maxHeight: tableMaxHeight.hasTab }}
          searchCode={searchBarCode}
          searchBarConfig={{
            ...setSearchBarConfig(),
            left: {
              render: renderExpandLeftSearchBar,
            },
            onQuery: handleExpandQuery,
            autoQuery: false,
            onReset: clearValues,
            onClear: clearValues,
          }}
        />
      )}
    </div>
  );
};

export default Index;
