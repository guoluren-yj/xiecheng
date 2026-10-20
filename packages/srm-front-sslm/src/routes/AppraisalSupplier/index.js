/*
 * AppraisalSupplier - 供应商绩效考评工作台
 * @Date: 2023-10-20 14:55:03
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { compose, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';
import { DataSet } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useMemo, useState } from 'react';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getUserOrganizationId } from 'utils/utils';

import { rangeDateRender } from '@/routes/components/utils/utils';
import MultipleTextField from '@/routes/components/MultipleTextField';
import { tableMaxHeight, tableHeight, renderStatus } from '@/routes/components/utils';

import HeaderBtns from './HeaderBtns';
import { getIndexDs } from './stores/getIndexDS';

let searchBarRef; // 筛选器ref
const supplierTenantId = getUserOrganizationId();

const Index = ({ dispatch, listDs, customizeTable }) => {
  const [pageChacheFlag, setPageChacheFlag] = useState(true);

  // 跳转详情
  const jumpToDetail = useCallback(record => {
    const { evalHeaderId, evalGranularity } = record.get(['evalHeaderId', 'evalGranularity']);
    dispatch(
      routerRedux.push({
        pathname: `/sslm/appraisal-supplier/detail/${evalHeaderId}/${evalGranularity}`,
      })
    );
  }, []);

  // 筛选器左侧渲染
  const renderLeftSearchBar = (_, queryDataSet) => {
    return (
      <MultipleTextField
        dataSet={queryDataSet}
        name="multiCombineNumOrNames"
        placeholder={intl
          .get('sslm.common.modal.placeholder.appraisalCodeOrName')
          .d('请输入档案编码、描述查询')}
      />
    );
  };

  // 清除筛选器字段
  const clearFieldsValues = () => {
    if (listDs.queryDataSet && listDs.queryDataSet.current) {
      listDs.queryDataSet.current.reset();
    }
  };

  const handleQuery = params => {
    if (listDs.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = listDs.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['multiCombineNumOrNames'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      // 处理多单号
      const reqList = params.multiCombineNumOrNames;
      clearParams.multiCombineNumOrNames = isEmpty(reqList) ? null : reqList.join(',');
      listDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        listDs.query(listDs.currentPage);
      } else {
        listDs.query();
      }
    } else {
      // 解决设置默认值查询不生效问题
      searchBarRef.handleQuery(true);
    }
  };

  // 查询条件参数
  const getFieldProps = useCallback(
    () => ({
      evalTplCode: {
        lovPara: { evalFlag: 1 },
      },
    }),
    []
  );

  // 获取导出参数
  const handleExportParams = useCallback(() => {
    const queryParams = searchBarRef.getQueryParameter();
    const chooseIds = listDs.selected.map(record => record.get('evalHeaderId'));
    return filterNullValueObject({
      ...queryParams,
      chooseIds,
      supplierTenantId,
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'evalStatusMeaning',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'evalNum',
        width: 130,
        renderer: ({ value, record }) => <a onClick={() => jumpToDetail(record)}>{value}</a>,
      },
      {
        name: 'evalName',
      },
      {
        name: 'evalTplName',
        width: 150,
      },
      {
        name: 'evalCycleMeaning',
        width: 100,
      },
      {
        name: 'evalDate',
        width: 180,
        renderer: ({ record }) => {
          const { evalDateFrom, evalDateTo } = record.get(['evalDateFrom', 'evalDateTo']);
          return rangeDateRender(evalDateFrom, evalDateTo, DEFAULT_DATE_FORMAT);
        },
      },
      {
        name: 'evalDimensionMeaning',
        width: 100,
      },
      {
        name: 'evalDimensionValueMeaning',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 140,
      },
    ],
    []
  );

  return (
    <Fragment>
      <Header
        title={intl
          .get('sslm.appraisalSupplier.view.title.supplierWorkbench')
          .d('供应商绩效考评工作台')}
      >
        <HeaderBtns onExportParams={handleExportParams} />
      </Header>
      <Content>
        <div style={{ height: tableHeight.fixedHeight }}>
          {customizeTable(
            {
              code: 'SSLM.APPRAISAL_SUPPLIER_LIST.TABLE',
            },
            <SearchBarTable
              cacheState
              columns={columns}
              dataSet={listDs}
              searchCode="SSLM.APPRAISAL_SUPPLIER_LIST.SEARCH_BAR"
              searchBarRef={ref => {
                searchBarRef = ref;
              }}
              style={{ maxHeight: tableMaxHeight.fixedHeight }}
              searchBarConfig={{
                left: {
                  render: renderLeftSearchBar,
                },
                fieldProps: getFieldProps(),
                onQuery: ({ params }) => handleQuery(params),
                onClear: () => clearFieldsValues(),
                onReset: () => clearFieldsValues(),
                onFieldChange: () => {
                  setPageChacheFlag(false);
                },
              }}
            />
          )}
        </div>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.appraisalSupplier', 'sslm.common'],
  }),
  withCustomize({
    unitCode: ['SSLM.APPRAISAL_SUPPLIER_LIST.TABLE'],
  }),
  withProps(
    () => {
      const listDs = new DataSet(getIndexDs());
      return { listDs };
    },
    { cacheState: true }
  )
)(Index);
