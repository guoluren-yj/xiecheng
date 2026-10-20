/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import intl from 'utils/intl';
import {
  TextField,
  Icon,
  Button,
  DatePicker,
  DataSet,
  Tooltip,
  Form,
  Select,
} from 'choerodon-ui/pro';
import { Popover, Badge, Tag } from 'choerodon-ui';
import { queryIdpValue } from 'services/api';

import { getResponse } from '@/utils/utils';
import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';

import { fetchCompanyList, fetchDynamicType } from '../stores/corporateDiligenceDS';
import styles from './index.less';

let visibleFlag = false;
let list = [];

export default function LeftMenu(props) {
  const { onSelect = () => {}, defaultCompany = '' } = props;

  const dateDS = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            label: intl.get('sdat.corporateDiligence.modal.timeRange').d('时间范围'),
            name: 'dateRange',
            type: 'date',
            range: ['start', 'end'],
          },
          {
            label: intl.get('sdat.corporateDiligence.modal.reportType').d('报告类型'),
            name: 'reportType',
            // lookupCode: 'SDAT.RISK_REPORT_TYPE',
          },
        ],
        events: {},
      }),
    []
  );

  const [common, setCommon] = useState('');
  // const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reportTypeMap, setReportTypeMap] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [codeArray, setCodeArray] = useState([]);
  const [hasLen, setHasLen] = useState(true);
  const [page, setPage] = useState(0);
  let scrollRef = useRef(null);

  useEffect(() => {
    queryIdpValue('SDAT.DUE_REPORT_TYPE').then((res) => {
      if (getResponse(res) && res.length) {
        const map = {};
        res.forEach((item) => {
          map[item.value] = item.meaning;
        });
        setReportTypeMap(map);
      }
    });

    fetchDynamicType().then((res) => {
      if (Array.isArray(res) && res.length) {
        queryIdpValue('SDAT.RISK_REPORT_TYPE').then((codeList) => {
          if (getResponse(codeList) && codeList.length) {
            const arr = [];
            codeList.forEach((item) => {
              if (res.indexOf(item.value) !== -1) {
                arr.push({
                  ...item,
                });
              }
            });

            setCodeArray(arr);
          }
        });
      }
    });

    return () => {
      list = [];
    };
  }, []);

  useEffect(() => {
    if (defaultCompany) {
      setCommon(defaultCompany);
      handleQuery('init', defaultCompany, 0);
    } else {
      handleQuery('init', '', 0);
    }
    return () => {
      visibleFlag = false;
    };
  }, [defaultCompany]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const inputFilterContent = (e) => {
    const val = e?.target?.value?.trim() ?? '';
    setCommon(val);
  };

  const handleClearText = () => {
    const val = '';
    setCommon(val);
    handleQuery('clear', val, 0);
  };

  const handleClear = () => {
    const val = '';
    dateDS.data = [];
    setCommon(val);
    handleQuery('clear', val, 0);
  };

  const handleEnterQuery = () => {
    handleQuery('query', common, 0);
  };

  const handleQuery = async (type, value, pageNum) => {
    const dateObj = dateDS?.toData()[0] ?? {};
    const { dateRange = {}, reportType = '' } = dateObj;

    const startDate =
      dateRange && dateRange.start ? `${dateRange.start.substring(0, 10)} 00:00:00` : '';
    const endDate = dateRange && dateRange.end ? `${dateRange.end.substring(0, 10)} 23:59:59` : '';

    if (pageNum === 0) {
      list = [];
    }

    // 查询列表
    const res = await fetchCompanyList({
      companyName: type === 'clear' ? '' : value || common,
      startDate,
      endDate,
      reportType,
      page: pageNum,
    });

    if (getResponse(res)) {
      const arr = res?.content ?? [];

      setHasLen([...list, ...arr].length < res.totalElements);

      if (pageNum === 0) {
        // 第一页 说明输入内容查询 或初始查询
        list = [...arr];
      } else {
        list = [...list, ...res.content];
      }

      if (type === 'init') {
        setSelected(arr[0]);
        onSelect(arr[0]);
      }

      setRefresh(true);
    } else {
      list = [];
      setSelected(null);
      onSelect(null);
      setRefresh(true);
    }
  };

  const handleSelect = (item) => {
    onSelect(item);
    setSelected(item);
  };

  const content = () => {
    return (
      <div style={{ padding: '4px 0', width: '250px' }}>
        <Form dataSet={dateDS} columns={1} labelLayout="float">
          <DatePicker style={{ width: '248px' }} name="dateRange" />
          <Select style={{ width: '248px' }} name="reportType">
            {codeArray.map((item) => {
              return <Select.Option value={item.value}>{item.meaning}</Select.Option>;
            })}
          </Select>
        </Form>
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'row-reverse' }}>
          <Button color="primary" onClick={() => handleQuery('query', '', 0)}>
            {intl.get('hzero.common.button.query').d('查询')}
          </Button>
          <Button style={{ marginRight: '8px' }} onClick={handleClear}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </div>
      </div>
    );
  };

  const handleChangeVisible = (visible) => {
    visibleFlag = visible;
    setRefresh(true);
  };

  /**
   * 加载更多数据
   */
  const loadMore = () => {
    handleQuery('query', common, page + 1);
    setPage(page + 1);
  };

  /**
   * 滚动加载更多
   */
  const onScrollHandle = () => {
    const { scrollTop, clientHeight, scrollHeight } = scrollRef;
    if (scrollTop + clientHeight + 10 > scrollHeight && hasLen) {
      loadMore();
    }
  };

  const handleRefresh = () => {
    setPage(0);
    return handleQuery('query', common, 0);
  };

  const tagMap = {
    SCAN: 'gray',
    SHELL: 'pink',
    RISK_SCAN: 'blue',
    RELATION_MINING: 'red',
    DILIGENCE: 'green',
    DECISION: 'cyan',
    ONE_TO_MANY_RELATION: 'yellow',
  };

  const time = dateDS && dateDS.current ? dateDS.current.get('dateRange') : '';
  const typeStr = dateDS && dateDS.current ? dateDS.current.get('reportType') : '';

  return (
    <div className={styles['corp-due-left-menu-basic']}>
      <div style={{ padding: '16px 16px 0 16px', display: 'flex' }} id="corp-due-filter-popover">
        <TextField
          clearButton
          prefix={<Icon type="search" />}
          value={common}
          style={{ width: '66%' }}
          onInput={inputFilterContent}
          onClear={handleClearText}
          onEnterDown={handleEnterQuery}
        />

        <Tooltip title={intl.get('hzero.common.button.refresh').d('刷新')}>
          <Button icon="sync" style={{ marginLeft: '8px' }} onClick={handleRefresh} />
        </Tooltip>

        <Popover
          getPopupContainer={() => document.getElementById('corp-due-filter-popover')}
          content={content()}
          placement="bottomLeft"
          trigger="click"
          onVisibleChange={handleChangeVisible}
        >
          {!visibleFlag && (time || typeStr) ? (
            <Badge count={1}>
              <Button style={{ marginLeft: '8px' }}>
                <Icon type="filter2" style={{ fontSize: '18px', margin: '0' }} />
              </Button>
            </Badge>
          ) : (
            <Button style={{ marginLeft: '8px' }}>
              <Icon type="filter2" style={{ fontSize: '18px', margin: '0' }} />
            </Button>
          )}
        </Popover>
      </div>
      <div
        className={styles['corp-due-left-menu-list-panel']}
        onScrollCapture={onScrollHandle}
        ref={(ref) => {
          scrollRef = ref;
        }}
      >
        {list && list.length ? (
          <>
            {(list || []).map((item) => {
              const classes =
                selected && selected.recordId === item.recordId
                  ? styles['item-selected']
                  : styles['item-normal'];
              return (
                <div
                  className={classNames(styles['corp-due-left-menu-item'], classes)}
                  key={item.recordId}
                  onClick={() => handleSelect(item)}
                >
                  <Tooltip title={item.companyName}>
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
                      {item?.companyName}
                    </div>
                  </Tooltip>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Tooltip title={reportTypeMap[item?.reportType] ?? ''}>
                      <Tag
                        size="small"
                        color={tagMap[item?.reportType]}
                        style={{
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {reportTypeMap[item?.reportType]}
                      </Tag>
                    </Tooltip>
                    <div
                      style={{
                        color: '#868D9C',
                        lineHeight: '18px',
                        marginTop: '4px',
                        fontWeight: '400',
                      }}
                    >
                      {item?.creationDate?.substring(0, 10)}
                    </div>
                  </div>
                </div>
              );
            })}
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
