/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import intl from 'utils/intl';
import { TextField, Icon } from 'choerodon-ui/pro'; // Button, DatePicker,

import { getResponse } from '@/utils/utils';
import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';

import { fetchAccountList } from '@/services/eventUpdateSumService';
import styles from './index.less';

export default function LeftMenu(props) {
  const { onSelect = () => {}, socialCode = '', tenantId = '' } = props;

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
    // 查询列表
    fetchAccountList({
      tenantId,
      socialCode,
      userName: type === 'clear' ? '' : value || common,
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
            .get('sdat.eventUpdateSummary.view.placeholder.inputUserAccount')
            .d('请输入账户编码、监控人名称查询')}
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
                selected && selected.userId === item.userId
                  ? styles['item-selected']
                  : styles['item-normal'];
              return (
                <div
                  className={classNames(styles['event-update-summary-menu-item'], classes)}
                  key={item.userId}
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
                    {item.userName}
                    &nbsp;
                    {item.loginName}
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
