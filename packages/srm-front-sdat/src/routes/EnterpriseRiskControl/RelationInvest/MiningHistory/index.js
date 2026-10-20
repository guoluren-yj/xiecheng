/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import intl from 'utils/intl';
import { DataSet, Form, DatePicker, Select } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import { getResponse } from '@/utils/utils';
import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import { fetchCompanyList } from '@/services/riskControl/relationInvestService'; // fetchValueMap

import { HistoryQueryDS } from '../stores/relationMiningDS';
import styles from './index.less';

let hasLen = true;
let businessType = '';
let startTime = '';
let endTime = '';

export default function LeftMenu(props) {
  const { onSelect = () => {}, syncFlag = '', tenantId } = props;

  const queryDS = useMemo(() => new DataSet({ ...HistoryQueryDS() }), []);

  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(false);

  let scrollRef = useRef(null);

  useEffect(() => {
    handleQuery(0);
    queryDS.addEventListener('update', handleUpdateQueryParam);

    return () => {
      hasLen = true;
      businessType = '';
      startTime = '';
      endTime = '';
      queryDS.removeEventListener('update', handleUpdateQueryParam);
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

  const handleUpdateQueryParam = ({ name, value, oldValue }) => {
    if (name === 'businessType') {
      if (value !== oldValue) {
        businessType = value || '';
        handleQuery(0);
      }
    } else if (name === 'dateRange') {
      const newStartDate =
        value && value.length ? moment(value[0]).format('YYYY-MM-DD 00:00:00') : '';
      const newEndDate =
        value && value.length && value[1] ? moment(value[1]).format('YYYY-MM-DD 23:59:59') : '';

      const oldStartDate =
        oldValue && oldValue.length ? moment(oldValue[0]).format('YYYY-MM-DD 00:00:00') : '';
      const oldEndDate =
        oldValue && oldValue.length && oldValue[1]
          ? moment(oldValue[1]).format('YYYY-MM-DD 23:59:59')
          : '';

      if (newStartDate !== oldStartDate || newEndDate !== oldEndDate) {
        startTime = newStartDate || '';
        endTime = newEndDate || '';
        handleQuery(0);
      }
    }
  };

  const handleQuery = (pageNumber) => {
    // 查询历史公司列表
    fetchCompanyList({
      page: pageNumber,
      tenantId,
      startDate: startTime,
      endDate: endTime,
      businessType,
      // businessIdentity: 'BLACKLIST',
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

  const tagClassMap = {
    PAGE: 'red',
    INVITATION: 'yellow',
    360: 'cyan',
    SUPPLIER_MANAGEMENT: 'green',
    SUPPLIER_INVITATION: 'blue',
    QUESTIONNAIRE: 'gray',
  };

  return (
    <div className={styles['mining-history-left-menu']}>
      <div style={{ margin: '16px 20px' }}>
        <Form dataSet={queryDS} columns={1} labelLayout="float">
          <DatePicker name="dateRange" style={{ width: '100%' }} />
          <Select clearButton name="businessType" style={{ width: '100%' }} />
        </Form>
      </div>
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
                selected && selected.infoId === item.infoId
                  ? styles['item-selected']
                  : styles['item-normal'];

              return (
                <div
                  className={classNames(styles['mining-history-menu-item'], classes)}
                  key={item.infoId}
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
                    {item.companyName}
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
                    {item?.businessTypeMeaning ? (
                      <Tag size="small" color={tagClassMap[item.businessType]}>
                        {item.businessTypeMeaning}
                      </Tag>
                    ) : (
                      <div />
                    )}

                    <div>{item?.creationDate ?? ''}</div>
                  </div>
                </div>
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
