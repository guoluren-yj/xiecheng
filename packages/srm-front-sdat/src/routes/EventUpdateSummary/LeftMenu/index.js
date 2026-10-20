/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import intl from 'utils/intl';
import { TextField, Icon, DataSet } from 'choerodon-ui/pro'; // Button, DatePicker,
// import { Popover } from 'choerodon-ui';

import { getResponse } from '@/utils/utils';
import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';

import { fetchCompanyList } from '@/services/eventUpdateSumService';
import styles from './index.less';

export default function LeftMenu(props) {
  const { onSelect = () => {} } = props;

  const dateDS = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'dateRange',
            type: 'date',
            range: ['start', 'end'],
          },
        ],
        events: {},
      }),
    []
  );

  const [common, setCommon] = useState('');
  const [list, setList] = useState();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    handleQuery('init', '');
  }, []);

  const inputFilterContent = (e) => {
    const val = e?.target?.value?.trim() ?? '';
    setCommon(val);
  };

  const handleClearText = () => {
    const val = '';
    setCommon(val);
    handleQuery('clear', val);
  };

  const handleEnterQuery = () => {
    handleQuery('query', common);
  };

  const handleQuery = (type, value) => {
    const dateObj = dateDS?.toData()[0] ?? {};
    const { dateRange = {} } = dateObj;

    const startDate =
      dateRange && dateRange.start ? `${dateRange.start.substring(0, 10)} 00:00:00` : '';
    const endDate = dateRange && dateRange.end ? `${dateRange.end.substring(0, 10)} 23:59:59` : '';

    // 查询列表
    fetchCompanyList({
      tenantName: type === 'clear' ? '' : value || common,
      startDate,
      endDate,
    }).then((res) => {
      if (getResponse(res)) {
        const arr = res?.content ?? [];
        setList(arr);
        if (type === 'init') {
          setSelected(arr[0]);
          onSelect(arr[0]);
        }
      } else {
        setList([]);
        setSelected(null);
        onSelect(null);
      }
    });
  };

  const handleSelect = (item) => {
    onSelect(item);
    setSelected(item);
  };

  return (
    <div className={styles['event-update-summary-left-menu']}>
      <div style={{ padding: '16px 16px 0 16px' }} id="corp-due-filter-popover">
        <TextField
          clearButton
          prefix={<Icon type="search" />}
          value={common}
          style={{ width: '100%' }}
          placeholder={intl
            .get('sdat.eventUpdateSummary.view.placeholder.inputCompany')
            .d('请输入公司名称查询')}
          onInput={inputFilterContent}
          onClear={handleClearText}
          onEnterDown={handleEnterQuery}
        />
      </div>
      <div className={styles['event-update-summary-left-menu-list']}>
        {list && list.length ? (
          <>
            {(list || []).map((item) => {
              const classes =
                selected && selected.tenantId === item.tenantId
                  ? styles['item-selected']
                  : styles['item-normal'];
              return (
                <div
                  className={classNames(styles['event-update-summary-menu-item'], classes)}
                  key={item.tenantId}
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
                    {item.tenantName}
                  </div>
                  <div
                    style={{
                      color: '#868D9C',
                      lineHeight: '18px',
                      marginTop: '4px',
                      fontWeight: '400',
                    }}
                  >
                    {item.tenantNum}
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
