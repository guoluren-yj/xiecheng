/*
 * @Description: 发货工作台
 * @Date: 2021-12-09 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import intl from 'utils/intl';
import Multiple from '@/components/MultipleTextField';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import './index.less';

const SearchBarGlobal = forwardRef((props, ref) => {
  const {
    tabKey = null,
    hdKey = null,
    searchCode = null,
    dataSet = null,
    columns = [],
    nodeTemplateCode = null,
    data = [],
    queryFieldsLimit = null,
    customizeCode = null, // 个性化单元，根据是否传入个性化单元判断是否使用个性化
    customizeTable,
    rightBarTable = (e) => e,
    searchBarConfig,
    remote,
  } = props;
  const queryRef = useRef();
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    ref: ref.current,
    queryRef,
    inputRef,
  }));

  useEffect(() => {
    if (inputRef.current) inputRef.current.handleClear();
    if (queryRef.current) queryRef.current.handleCleanFilter();
  }, [nodeTemplateCode]);
  const handleQuery = ({ params = {}, currentPage }) => {
    const clearParams = {}; // 清理
    const { state: { _back } = {} } = location;
    // eslint-disable-next-line no-unused-expressions
    const dataObj = dataSet.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['deliveryHeaderAndLineNums'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet.current
      ? dataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : dataSet.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    if (_back === -1) {
      dataSet.query(currentPage);
    } else {
      dataSet.query(currentPage);
    }
  };
  // const tabCode = tabKey.toUpperCase() || null;
  const custCode = customizeCode?.split(',').pop();
  const titleFlag =
    ['submit', 'affirm', 'all'].includes(tabKey) && ['left', 'right'].includes(hdKey);
  return (
    <Fragment>
      <div style={{ height: 'calc(100vh - 240px)' }}>
        {customizeTable(
          {
            code: custCode,
            autoWidth: true,
            readOnly: true,
          },
          <SearchBarTable
            onRow={(params) =>
              remote
                ? remote.process('SLOD_DELIVERY_WORKBENCH_LIST_PROCESS_LIST_ROW', null, {
                    ...params,
                    tabKey,
                    hdKey,
                    nodeTemplateCode,
                  })
                : null
            }
            className="searchTable_css"
            searchCode={searchCode}
            dataSet={dataSet}
            columns={columns}
            data={data}
            cacheState
            queryFieldsLimit={queryFieldsLimit}
            searchBarRef={(node) => {
              queryRef.current = node;
            }}
            virtual
            virtualCell
            pagination={{
              pageSizeOptions: ['create'].includes(tabKey)
                ? ['10', '20', '50', '100', '200', '500', '1000']
                : ['10', '20', '50', '100', '200'],
            }}
            boxSizing="wrapper"
            // className={styles.searchTable_css}
            style={{ maxHeight: `calc(100% - 22px)` }}
            searchBarConfig={{
              ...searchBarConfig,
              // fieldDefaultValueType: 'custom',
              onReset: () => {
                if (inputRef.current) inputRef.current.handleClear();
              },
              onClear: () => {
                if (inputRef.current) inputRef.current.handleClear();
              },
              onQuery: handleQuery,
              right: {
                render: () => rightBarTable(),
              },
              left: {
                render: () => (
                  <Multiple
                    name="deliveryHeaderAndLineNums"
                    dataSet={dataSet}
                    onRef={(node) => {
                      inputRef.current = node;
                    }}
                    placeholder={
                      titleFlag
                        ? intl
                            .get('slod.deliveryWorkbench.model.common.fromDisplayOrderOrDisplayNum')
                            .d('请输入订单号、单据编号查询')
                        : intl
                            .get('slod.deliveryWorkbench.model.common.fromDisplayOrderNum')
                            .d('请输入来源订单号查询')
                    }
                  />
                ),
              },
            }}
          />
        )}
      </div>
    </Fragment>
  );
});

export default SearchBarGlobal;
