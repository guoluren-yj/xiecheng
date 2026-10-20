/*
 * @Date: 2022-12-02 17:29:30
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import classNames from 'classnames';
import { Tooltip } from 'choerodon-ui';
import React, { Fragment, useCallback, useMemo, useContext } from 'react';
import { Select, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import SearchBar from 'srm-front-boot/lib/components/SearchBarTable/SearchBar';

import styles from '../index.less';
import LaneView from './LaneView';
import TableView from './TableView';
import { Context } from '../Context';

const { Option } = Select;

const Index = () => {
  const {
    searchCode,
    valueList,
    aggregation,
    setStageLane,
    dimensionCode,
    laneSearchBarRef,
    dimensionDisabled,
    onSearch,
    onRef,
    onPageChache,
    onAggregation,
    onDimensionChange,
  } = useContext(Context);

  // 筛选器左侧渲染
  const renderSearchBarLeft = useCallback(() => {
    const { dimensionList = [] } = valueList;
    return (
      <Select
        clearButton={false}
        value={dimensionCode}
        onChange={onDimensionChange}
        disabled={dimensionDisabled}
        suffix={<Icon type="expand_more" style={{ marginLeft: -20 }} />}
      >
        {dimensionList
          .filter(item => item.value !== 'BOTH')
          .map(item => (
            <Option value={item.value}>{item.meaning}</Option>
          ))}
      </Select>
    );
  }, [valueList, dimensionCode, dimensionDisabled]);

  // 筛选器右侧渲染
  const renderSearchBarRight = useCallback(() => {
    return (
      <div className={styles.search}>
        <Tooltip title={intl.get('sslm.lifeCycleManage.model.popover.tableView').d('表格视图')}>
          <div
            onClick={() => onAggregation(false)}
            className={classNames(styles['view-wrap'], { [styles.active]: !aggregation })}
          >
            <Icon type="view_headline" />
          </div>
        </Tooltip>
        <Tooltip title={intl.get('sslm.lifeCycleManage.model.popover.laneView').d('泳道视图')}>
          <div
            onClick={() => onAggregation(true)}
            className={classNames(styles['view-wrap'], { [styles.active]: aggregation })}
          >
            <Icon type="view_day" style={{ transform: 'rotate(90deg)' }} />
          </div>
        </Tooltip>
      </div>
    );
  }, [aggregation]);

  // 处理筛选器fieldProps属性
  const fieldProps = useMemo(() => {
    switch (searchCode) {
      case 'SSLM.LIFE_CYCLE.SUPPLIER_LIST.COMPANY_SEARCH_BAR':
        return {
          companyId: {
            required: true,
          },
        };
      default:
        return {
          categoryIdStrs: {
            optionsProps: {
              paging: 'server',
              childrenField: 'children',
            },
          },
        };
    }
  }, [searchCode]);

  // 维度为公司级，公司未选择时，清空泳道
  const clearCompanyStageLane = async () => {
    const queryDsValidate = await laneSearchBarRef?.queryDs?.validate();
    if (!queryDsValidate) {
      setStageLane([]);
    }
    laneSearchBarRef.handleQuery(true);
  };

  const handleLoad = async queryDs => {
    const queryDsValidate = await queryDs?.validate();
    if (!queryDsValidate) {
      setStageLane([]);
    }
  };

  const handleFieldChange = async () => {
    clearCompanyStageLane();
    onPageChache(false);
  };

  return (
    <Fragment>
      <SearchBar
        cacheState
        dataSet={[]}
        onRef={onRef}
        key={searchCode}
        onQuery={onSearch}
        searchCode={searchCode}
        fieldProps={fieldProps}
        onLoad={handleLoad}
        onReset={clearCompanyStageLane}
        onFieldChange={handleFieldChange}
        left={
          aggregation
            ? {
                render: renderSearchBarLeft,
              }
            : {}
        }
        right={{
          render: renderSearchBarRight,
        }}
      />
      {aggregation ? <LaneView /> : <TableView />}
    </Fragment>
  );
};

export default Index;
