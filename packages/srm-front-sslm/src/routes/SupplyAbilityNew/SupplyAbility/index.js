/**
 * 供货能力清单
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useCallback, useEffect, useState } from 'react';
import intl from 'utils/intl';
import { compose, isEmpty } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import MultipleTextField from '@/routes/components/MultipleTextField';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import { tableHeight, tableMaxHeight, renderStatus } from '@/routes/components/utils';
import { SelectBox, Icon, Select, Button } from 'choerodon-ui/pro';
import { getCurrentUserId, getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

import {
  queryBatchApprovalHistory,
  renderApproveProgress,
} from '@/routes/components/WorkFlowApproval';

import styles from '../index.less';

const userId = getCurrentUserId();
const organizationId = getCurrentOrganizationId();
const userOrganizationId = getUserOrganizationId();

const { Option } = SelectBox;

let supplyAbilitySearchRef = null;

const Index = ({
  customizeTable,
  customizeUnitCode,
  searchBarCode,
  custLoading,
  dataSet,
  valueSetCode,
  supplierDimension,
  supplierDimensionChange,
  handleGoDetail,
  onSearchBarRef,
  routerParams = {},
}) => {
  const [approvalInfo, setApprovalInfo] = useState({});

  const { approvalHistoryMap = {} } = approvalInfo;
  // 供应商维度
  const supplierFlag = supplierDimension === 'SUPPLIER';

  useEffect(() => {
    if (supplierDimension === 'ITEM') {
      dataSet.addEventListener('load', handleDsLoadAfter);
    }
    return () => {
      if (supplierDimension === 'ITEM') {
        dataSet.removeEventListener('load', handleDsLoadAfter);
      }
    };
  }, [supplierDimension, dataSet]);

  const handleDsLoadAfter = (dataSetProps = {}) => {
    const { dataSet: ds } = dataSetProps;
    const businessKeys = ds.filter(r => r.get('businessKey')).map(r => r.get('businessKey'));
    queryBatchApprovalHistory(businessKeys).then(response => {
      if (response) {
        setApprovalInfo({
          approvalHistoryMap: response,
        });
      }
    });
  };

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback(
    (_, queryDataSet) => {
      const { dimensionList = [] } = valueSetCode;
      const { multiSelectReqNums } = routerParams;
      if (!queryDataSet.current && multiSelectReqNums) {
        queryDataSet.create({ multiSelectReqNums: multiSelectReqNums.split(',') });
      }
      return (
        <div>
          <Select
            clearButton={false}
            value={supplierDimension}
            onChange={supplierDimensionChange()}
            suffix={<Icon type="expand_more" style={{ marginLeft: -20 }} />}
          >
            {dimensionList.map(item => (
              <Option value={item.value}>{item.meaning}</Option>
            ))}
          </Select>
          <div className={styles['search-line']} />
          <MultipleTextField
            dataSet={queryDataSet}
            name="multiSelectReqNums"
            placeholder={intl
              .get('sslm.supplyAbility.view.message.multiSelectReqNums')
              .d('请输入供应商编码')}
          />
        </div>
      );
    },
    [valueSetCode, supplierDimension]
  );

  // 设置筛选器查询条件参数
  const setSearchBarConfig = (activeKey = '') => {
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
        regionId: {
          computedProps: {
            disabled: ({ record }) => !record.get('countryId'),
            lovPara: ({ record }) => {
              const country = record.get('countryId') || {};
              const { countryId } = country;
              return {
                countryId,
              };
            },
          },
        },
        cityId: {
          computedProps: {
            disabled: ({ record }) => !record.get('regionId'),
            lovPara: ({ record }) => {
              const region = record.get('regionId') || [];
              const { regionId } = region;
              return {
                parentRegionId: regionId,
              };
            },
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
      onFieldChange: props => handleFieldChange({ ...props, activeKey }),
    };
  };

  // 筛选器查询回调
  const handleQuery = useCallback(
    (queryProps = {}) => {
      const { params } = queryProps;
      if (dataSet.queryDataSet?.current) {
        const clearParams = {}; // 清理
        const dataObj = dataSet.queryDataSet.current.toData();
        if (dataObj) {
          for (const key in dataObj) {
            if (!['multiSelectReqNums'].includes(key)) {
              // 排除掉自定义的查询条件
              if (!Object.prototype.hasOwnProperty.call(params, key)) {
                clearParams[key] = undefined;
              }
            }
          }
        }
        // 处理多单号
        const reqList = params.multiSelectReqNums;
        clearParams.multiSelectReqNums = isEmpty(reqList) ? null : reqList.join(',');
        dataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        });
        dataSet.query();
      } else if (supplyAbilitySearchRef) {
        // handleQuery 内部会触发我们的handleQuery方法
        supplyAbilitySearchRef.handleQuery(true);
      } else {
        dataSet.query();
      }
    },
    [dataSet]
  );

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

  const columns = [
    {
      name: 'operation',
      hidden: !supplierFlag,
      width: 100,
      renderer: ({ record }) => {
        return (
          <span>
            <Button funcType="link" onClick={() => handleGoDetail(record, 'edit')}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
          </span>
        );
      },
    },
    {
      name: 'supplyReviewStatusMeaning',
      width: 80,
      hidden: supplierFlag,
      renderer: renderStatus,
    },
    {
      name: 'supplierCompanyNum',
      width: 120,
      renderer: ({ value, record }) => (
        <a onClick={() => handleGoDetail(record, 'view')}>{value}</a>
      ),
    },
    {
      name: 'supplierCompanyName',
      width: 180,
    },
    {
      name: 'stageDescription',
      width: 100,
    },
    {
      name: 'companyName',
      width: 180,
    },
    {
      name: 'createUserName',
      width: 100,
      hidden: !supplierFlag,
    },
    {
      width: 100,
      name: 'creationDate',
      renderer: ({ value }) => dateRender(value),
      hidden: !supplierFlag,
    },
    {
      name: 'itemCode',
      hidden: supplierFlag,
      width: 80,
    },
    {
      name: 'itemName',
      hidden: supplierFlag,
      width: 180,
    },
    {
      name: 'itemCategoryCode',
      hidden: supplierFlag,
      width: 80,
    },
    {
      name: 'itemCategoryName',
      hidden: supplierFlag,
      width: 180,
    },
    {
      name: 'supplyFlag',
      hidden: supplierFlag,
      width: 80,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'adapterProducts',
      hidden: supplierFlag,
    },
    {
      name: 'countryIdMeaning',
      hidden: supplierFlag,
    },
    {
      name: 'regionIdMeaning',
      hidden: supplierFlag,
    },
    {
      name: 'cityIdMeaning',
      hidden: supplierFlag,
    },
    {
      name: 'dateFrom',
      hidden: supplierFlag,
    },
    {
      name: 'dateTo',
      hidden: supplierFlag,
    },
    {
      name: 'inventoryOrganizationMeaning',
      hidden: supplierFlag,
    },
    {
      name: 'purchaseOrganizationName',
      hidden: supplierFlag,
    },
    {
      name: 'manufacturer',
      hidden: supplierFlag,
    },
    {
      name: 'remark',
      hidden: supplierFlag,
    },
    {
      width: 100,
      name: 'lastUpdateUserName',
    },
    {
      width: 100,
      name: 'lastUpdateDate',
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'quotaRatio',
      hidden: supplierFlag,
    },
    {
      name: 'approvalProgress',
      width: 160,
      hidden: supplierFlag,
      title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
      renderer: ({ record }) => {
        const supplyReviewStatus = record.get('supplyReviewStatus');
        const showApproveProgress = supplyReviewStatus === 'REVIEWING';
        return showApproveProgress ? renderApproveProgress({ approvalHistoryMap, record }) : '-';
      },
    },
  ].filter(e => !e.hidden);

  return (
    <div style={{ height: tableHeight.hasTab }}>
      {customizeTable(
        {
          code: customizeUnitCode,
        },
        <SearchBarTable
          key={supplierDimension}
          cacheState
          dataSet={dataSet}
          columns={columns}
          custLoading={custLoading}
          style={{ maxHeight: tableMaxHeight.hasTab }}
          searchCode={searchBarCode}
          searchBarRef={ref => {
            supplyAbilitySearchRef = ref;
            if (onSearchBarRef) {
              onSearchBarRef(ref);
            }
          }}
          searchBarConfig={{
            onQuery: handleQuery,
            // autoQuery: false,
            left: {
              render: renderLeftSearchBar,
            },
            ...setSearchBarConfig(),
          }}
        />
      )}
    </div>
  );
};

export default compose()(Index);
