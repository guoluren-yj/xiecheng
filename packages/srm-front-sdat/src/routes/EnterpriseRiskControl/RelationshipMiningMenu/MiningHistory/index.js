/* eslint-disable eqeqeq */
/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import classNames from 'classnames';
import intl from 'utils/intl';
import moment from 'moment';
import { Popover, Badge } from 'choerodon-ui';
import { Select, DatePicker, Button, Icon, DataSet, Lov } from 'choerodon-ui/pro';

import { getResponse } from '@/utils/utils';
import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';

import { fetchCompanyList, fetchValueMap } from '@/services/riskControl/miningMenuService';
import styles from './index.less';

let hasLen = true;
let visibleFlag = false;

export default function LeftMenu(props) {
  const { onSelect = () => {}, syncFlag = '' } = props;
  const hisQueryDS = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'dataRange',
            type: 'date',
            range: ['start', 'end'],
            defaultValue: { start: null, end: null },
          },
          {
            name: 'relationFlag',
            type: 'string',
            lookupCode: 'SDAT.MINING_RELATION_FLAG',
          },
          {
            name: 'userNameObj',
            type: 'object',
            lovCode: 'HIAM.TENANT.USER',
            noCache: true,
          },
          {
            name: 'userName',
            type: 'string',
            bind: 'userNameObj.realName',
          },
        ],
      }),
    []
  );

  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [typeMap, stTypeMap] = useState({});

  let scrollRef = useRef(null);

  useEffect(() => {
    fetchValueMap('SDAT.DUE_REPORT_TYPE').then((res) => {
      if (getResponse(res) && res.length) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        stTypeMap(obj);
      }
    });
    handleQuery(0, {});

    return () => {
      hasLen = true;
      visibleFlag = false;
    };
  }, []);

  useEffect(() => {
    if (syncFlag) {
      // 刷新列表
      handleQuery(0, {});
    }
  }, [syncFlag]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const handleQuery = (pageNumber, obj) => {
    // 查询列表
    fetchCompanyList({
      reportType: 'RELATION_MINING',
      resource: 'QIN_XIN',
      // businessType: '-',
      // businessIdentity: '-',
      // businessNumber: '-',
      page: pageNumber,
      ...obj,
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
        onSelect({});
      }
      setRefresh(true);
    });
  };

  const handleSelect = (item) => {
    onSelect(item);
    setSelected(item);
  };

  const getNameStr = (nameStr = '') => {
    const arr = nameStr?.split(',') || [];
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
    handleQuery(page + 1, {});
  };

  const onScrollHandle = () => {
    const { scrollTop, clientHeight, scrollHeight } = scrollRef;

    if (scrollTop + clientHeight + 5 > scrollHeight && hasLen) {
      loadMore();
    }
  };

  const content = (obj) => {
    const companyList = obj?.companyName?.split(',') || [];
    return (
      <div style={{ width: '280px' }}>
        <div style={{ fontSize: '14px', color: '#1D2129', lineHeight: '22px', fontWeight: '500' }}>
          {intl.get('sdat.supplier.view.title.supplierList').d('供应商列表')}
        </div>
        <>
          {companyList?.map((item) => {
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
        <div>{obj.reportType ? typeMap[obj.reportType] : ''}</div>
      </div>
    );
  };

  /**
   * 获取排查人名称。
   * @param {object} item 历史记录项
   * @returns {string}
   */
  const getOperatorName = (item = {}) => {
    return item?.userName || '';
  };

  /**
   * 重置筛选条件。
   */
  const handleResetFilter = () => {
    hisQueryDS.loadData([]);
    hisQueryDS.reset();
    handleQuery(0, {});
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleQueryList();
    }
  };

  const handleQueryList = () => {
    const params = hisQueryDS?.toData()[0] ?? {};
    const { dataRange = {}, userName = '', relationFlag = '' } = params;
    const startDate = dataRange?.start ? moment(dataRange.start).format('YYYY-MM-DD 00:00:00') : '';
    const endDate = dataRange?.end ? moment(dataRange.end).format('YYYY-MM-DD 23:59:59') : '';
    const param = {
      startDate,
      endDate,
      userName,
      relationFlag,
    };
    handleQuery(0, param);
  };

  /**
   * 渲染筛选弹层。
   * @returns {JSX.Element}
   */
  const renderFilterContent = () => {
    return (
      <div className={styles['mining-history-filter-popover-content']}>
        <Select
          dataSet={hisQueryDS}
          name="relationFlag"
          clearButton
          placeholder={intl.get('sdat.supplier.view.title.filterRelationResult').d('排查结果')}
        />

        <Lov
          dataSet={hisQueryDS}
          name="userNameObj"
          clearButton
          placeholder={intl.get('sdat.supplier.view.title.filterMiningUser').d('排查人')}
          style={{ marginTop: '16px' }}
        />
        <div style={{ marginTop: '16px' }}>
          <Button color="primary" style={{ marginRight: '8px' }} onClick={handleQueryList}>
            {intl.get('hzero.common.button.query').d('查询')}
          </Button>
          <Button onClick={handleResetFilter}>
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

  const relationFlag =
    hisQueryDS && hisQueryDS.current ? hisQueryDS.current.get('relationFlag') : '';
  const userName = hisQueryDS && hisQueryDS.current ? hisQueryDS.current.get('userName') : '';

  return (
    <div className={styles['mining-history-left-menu']}>
      <div className={styles['mining-history-filter-bar']} id="qxb-mining-history-filter-popover">
        <DatePicker
          clearButton
          dataSet={hisQueryDS}
          name="dataRange"
          prefix={<Icon type="search" />}
          placeholder={intl.get('sdat.supplier.view.placeholder.timeRangeQuery').d('时间范围')}
          onKeyDown={handleKeyDown}
          onClear={handleResetFilter}
        />

        <Popover
          overlayClassName={styles['mining-history-filter-popover']}
          getPopupContainer={() => document.getElementById('qxb-mining-history-filter-popover')}
          content={renderFilterContent()}
          placement="bottomLeft"
          trigger="click"
          onVisibleChange={handleChangeVisible}
        >
          {!visibleFlag && (relationFlag || userName) ? (
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
                selected && selected.recordId === item.recordId
                  ? styles['item-selected']
                  : styles['item-normal'];
              return (
                <Popover
                  content={() => content(item)}
                  key={`pop_${item.recordId}`}
                  title=""
                  placement="right"
                >
                  <div
                    className={classNames(styles['mining-history-menu-item'], classes)}
                    key={item.recordId}
                    onClick={() => handleSelect(item)}
                  >
                    <div className={styles['mining-history-menu-item-header']}>
                      <div className={styles['mining-history-menu-item-title']}>
                        <span className={styles['mining-history-menu-item-title-text']}>
                          {getNameStr(item.companyName)}
                        </span>
                      </div>
                      {item.relationFlag == '1' ? (
                        <div className={styles['mining-history-menu-item-tag']}>
                          {intl.get('sdat.supplier.view.title.relationFlag').d('有关联')}
                        </div>
                      ) : null}
                    </div>

                    <div className={styles['mining-history-menu-item-divider']} />

                    <div className={styles['mining-history-menu-item-info-row']}>
                      <div className={styles['mining-history-menu-item-info-label']}>
                        {intl.get('sdat.supplier.view.title.miningTime').d('排查时间')}:
                      </div>
                      <div className={styles['mining-history-menu-item-info-value']}>
                        {item?.creationDate ?? ''}
                      </div>
                    </div>

                    <div className={styles['mining-history-menu-item-info-row']}>
                      <div className={styles['mining-history-menu-item-info-label']}>
                        {intl.get('sdat.supplier.view.title.miningUser').d('排查人')}:
                      </div>
                      <div className={styles['mining-history-menu-item-info-value']}>
                        {getOperatorName(item)}
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
              <div className={styles['chart-no-mining-result']}>
                {intl.get('sdat.supplier.view.title.noMiningResult').d('无排查结果')}
              </div>
              <div className={styles['chart-no-mining-result-msg']}>
                {intl
                  .get('sdat.supplier.view.title.noMiningResultMsg')
                  .d(
                    '根据相关网站检索及大数据分析暂未查询到相关信息，不排除因信息公开来源尚未公开、公开形式存在差异、检索时间存在滞后等情况导致的信息与客观事实不完全一致的情形，仅供客户参考'
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
