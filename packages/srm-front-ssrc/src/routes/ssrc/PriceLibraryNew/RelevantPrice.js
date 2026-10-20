import React, { PureComponent } from 'react';
import { PerformanceTable, Pagination } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import SearchBar from '@/routes/components/SearchBar';

import style from './index.less';

export default class RelevantPrice extends PureComponent {
  render() {
    const {
      remote,
      templateCode,
      queryLoading = false,
      tableData = [],
      pagination = {},
      columnList = [],
      onRef = noop,
      onQuery = noop,
      onAfterQueryFields = noop,
      columns,
      from,
    } = this.props;
    const searchBarProps = {
      onRef,
      remote,
      onQuery,
      templateCode,
      queryFilterConfig: {
        shieldDimCodes: 'relevantPrice',
        templateCode,
        relevantPriceFlag: 1,
      },
      onAfterQueryFields,
      from,
    };
    return (
      <React.Fragment>
        {/* <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
          <Form
            style={{ flex: 'auto' }}
            columns={3}
            dataSet={queryDs}
            onKeyDown={(e) => {
              if (e.keyCode === 13) return onSearch({}, searchParams);
            }}
          >
            {hidden ? queryFields.slice(0, 3) : queryFields}
          </Form>
          <div style={{ marginTop: '10px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            {queryFields.length > 3 && (
              <Button onClick={this.handleToggle}>
                {hidden
                  ? intl.get('hzero.common.button.viewMore').d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
            )}
            <Button onClick={() => queryDs.current?.reset()}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button dataSet={null} color="primary" onClick={() => onSearch({}, searchParams)}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </div>
        </div> */}
        <SearchBar {...searchBarProps} />
        <PerformanceTable
          autoHeight={{ type: 'maxHeight', diff: 160 }}
          cellBordered
          bordered={false}
          headerHeight={36}
          rowHeight={38}
          // height={374}
          loading={queryLoading}
          columns={columnList.length ? columnList : columns}
          rowKey="priceLibId"
          data={tableData}
          style={{ maxHeight: 'calc(100vh - 270px)' }}
        />
        <Pagination
          {...pagination}
          className={style['performanceTable-pagination']}
          onChange={(page, pageSize) => onQuery({ page, pageSize })}
        />
      </React.Fragment>
    );
  }
}
