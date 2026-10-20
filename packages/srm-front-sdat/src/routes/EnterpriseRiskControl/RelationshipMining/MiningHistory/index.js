/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import intl from 'utils/intl';
// import { TextField, Icon, DataSet } from 'choerodon-ui/pro'; // Button, DatePicker,
import { Popover } from 'choerodon-ui';

import { getResponse } from '@/utils/utils';
import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';

import { fetchCompanyList, fetchValueMap } from '@/services/riskControl/relationMiningService';
import styles from './index.less';

let hasLen = true;

export default function LeftMenu(props) {
  const { onSelect = () => {}, businessType = '', businessIdentity = '', syncFlag = '' } = props;

  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  // const [hasLen, setHasLen] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [typeMap, stTypeMap] = useState({});

  let scrollRef = useRef(null);

  useEffect(() => {
    fetchValueMap('SDAT.RELATION_RECORD_TYPE').then((res) => {
      if (getResponse(res) && res.length) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        stTypeMap(obj);
      }
    });
    handleQuery(0);

    return () => {
      hasLen = true;
    };
  }, []);

  useEffect(() => {
    if (syncFlag) {
      // 刷新列表
      handleQuery(0);
    }
  }, [syncFlag]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const handleQuery = (pageNumber) => {
    // 查询列表
    fetchCompanyList({
      businessType,
      businessIdentity,
      page: pageNumber,
    }).then((res) => {
      if (getResponse(res) && res.content) {
        const arr = res?.content ?? [];

        if ([...list, ...arr].length >= res.totalElements) {
          // 小于20 说明没有数据了
          hasLen = false;
        } else {
          hasLen = true;
        }

        if (pageNumber === 0) {
          // 第一页 说明输入内容查询 或初始查询
          setList([...arr]);
          setSelected(arr[0]);
          onSelect(arr[0]);
        } else {
          setList([...list, ...arr]);
        }
      } else {
        setList([]);
        setSelected(null);
        onSelect(null);
      }
      setRefresh(true);
    });
  };

  const handleSelect = (item) => {
    onSelect(item);
    setSelected(item);
  };

  const getNameStr = (arr = []) => {
    if (!(arr && arr.length)) return '';

    const str = arr[0] || '';
    const common = str && str.length >= 10 ? str.substring(0, 10) : str;

    if (arr.length === 1) return arr[0] || '';

    return common
      ? `${common}...${intl.get('sdat.supplier.view.title.historyBusinessList', {
          name: arr.length,
        })}`
      : '';
  };

  /**
   * 加载更多
   */
  const loadMore = () => {
    setPage(page + 1);
    handleQuery(page + 1);
  };

  const onScrollHandle = () => {
    const { scrollTop, clientHeight, scrollHeight } = scrollRef;

    if (scrollTop + clientHeight + 5 > scrollHeight && hasLen) {
      loadMore();
    }
  };

  const content = (obj) => {
    const companyList = obj?.companyList ?? [];
    return (
      <div style={{ width: '280px' }}>
        <div style={{ fontSize: '14px', color: '#1D2129', lineHeight: '22px', fontWeight: '500' }}>
          {intl.get('sdat.supplier.view.title.supplierList').d('供应商列表')}
        </div>
        <>
          {companyList.map((item) => {
            return (
              <div key={item} style={{ color: '#1D2129', lineHeight: '18px', margin: '4px 0' }}>
                {item}
              </div>
            );
          })}
        </>

        <div
          style={{
            fontSize: '14px',
            color: '#1D2129',
            lineHeight: '22px',
            fontWeight: '500',
            marginTop: '24px',
          }}
        >
          {intl.get('sdat.supplier.view.title.linkType').d('关联类型')}
        </div>
        <div>{obj.dataType ? typeMap[obj.dataType] : ''}</div>
      </div>
    );
  };

  return (
    <div className={styles['mining-history-left-menu']}>
      <div
        className={styles['mining-history-left-menu-list']}
        onScrollCapture={onScrollHandle}
        ref={(ref) => {
          scrollRef = ref;
        }}
      >
        {list && list.length ? (
          <>
            {(list || []).map((item) => {
              const classes =
                selected && selected.dataId === item.dataId
                  ? styles['item-selected']
                  : styles['item-normal'];
              return (
                <Popover
                  content={() => content(item)}
                  key={`pop_${item.dataId}`}
                  title=""
                  placement="right"
                >
                  <div
                    className={classNames(styles['mining-history-menu-item'], classes)}
                    key={item.dataId}
                    onClick={() => handleSelect(item)}
                  >
                    <div
                      style={{
                        width: '234px',
                        lineHeight: '21px',
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {getNameStr(item.companyList)}
                    </div>
                    <div
                      style={{
                        color: '#868D9C',
                        lineHeight: '18px',
                        marginTop: '4px',
                        fontWeight: '400',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
                        style={{
                          flex: '1',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginRight: '8px',
                        }}
                      >
                        {item.dataType ? typeMap[item.dataType] : ''}
                      </div>
                      <div style={{ width: '66px' }}>
                        {item?.creationDate?.substring(0, 10) ?? ''}
                      </div>
                    </div>
                  </div>
                </Popover>
              );
            })}
            {hasLen ? null : (
              <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.45)', marginTop: '8px' }}>
                {intl.get('hzero.common.view.message.hasNoData').d('没有更多了')}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ textAlign: 'center', height: '40px' }}>
                <NoContent style={{ width: '40px', height: '40px' }} />
              </div>
              <div className={styles['chart-no-content-message']}>
                {intl.get('hzero.common.message.data.none').d('暂无数据')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
