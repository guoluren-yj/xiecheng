/**
 * 多公司列表选择
 */
import React, { useState, useEffect } from 'react';
import { Tooltip, TextField, Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import styles from './index.less';

const noResult = require('@/assets/noResult.svg');

export default function LeftMenuPanel(props) {
  const { companyList, onSelectItem = () => {}, defaultSelected, onRefreshList = () => {} } = props;

  const [selected, setSelected] = useState(null);
  const [hoverItem, setHoverItem] = useState(null);
  const [queryMsg, setQueryMsg] = useState('');

  useEffect(() => {
    if (Array.isArray(companyList) && companyList.length) {
      if (!(defaultSelected && defaultSelected.companyId)) {
        setSelected(companyList[0]);
        onSelectItem({ ...companyList[0] });
      }
    }
  }, [companyList]);

  useEffect(() => {
    if (defaultSelected && defaultSelected.companyId) {
      setSelected({ ...defaultSelected });
    } else {
      setSelected({ ...companyList[0] });
    }
  }, [defaultSelected]);

  const handleSelectItem = (item) => {
    setSelected({ ...item });
    onSelectItem({ ...item });
  };

  const handleEnter = (item) => {
    setHoverItem({ ...item });
  };

  const handleLeave = () => {
    setHoverItem(null);
  };

  const classMap = {
    0: styles['tag-disEnabled-status'],
    1: styles['tag-enabled-status'],
    2: styles['tag-expired-status'],
    3: styles['tag-pending-status'],
    4: styles['status-tag-failed'],
  };

  /**
   * 绘制公司列表
   * @param {*} data
   */
  const drawCompanyList = (data = []) => {
    return (data || []).map((item) => {
      return (
        <div
          key={item.companyId}
          className={
            (selected && selected.companyId === item.companyId) ||
            (hoverItem && hoverItem.companyId === item.companyId)
              ? styles['company-list-item-selected']
              : styles['company-list-item-not-selected']
          }
          onClick={() => handleSelectItem(item)}
          onMouseEnter={() => handleEnter(item)}
          onMouseLeave={() => handleLeave(item)}
        >
          <Tooltip title={item.companyName}>
            <div
              className={
                selected && selected.companyId === item.companyId
                  ? styles['company-list-item-title-selected']
                  : styles['company-list-item-title']
              }
            >
              {item.companyName}
            </div>
          </Tooltip>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              lineHeight: '18px',
              marginTop: '5px',
            }}
          >
            <div className={styles['company-list-item-social']}>{item.companyNum}</div>
            <div>
              {item.authStatusMeaning ? (
                <span
                  className={classMap[String(item.authStatus)]}
                  style={{
                    marginRight:
                      item.authorizeStatusMeaning &&
                      ['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS'].includes(item.partnerCode)
                        ? '8px'
                        : '',
                  }}
                >
                  {item.authStatusMeaning}
                </span>
              ) : null}
              {item.authorizeStatusMeaning &&
              ['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS'].includes(item.partnerCode) ? (
                <span className={classMap[String(item.authorizeStatus)]}>
                  {item.authorizeStatusMeaning}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      );
    });
  };

  const handleInput = (e) => {
    setQueryMsg(e?.target?.value?.trim() ?? '');
  };

  const handleQuery = () => {
    onRefreshList({ companyNum: queryMsg });
  };

  const handleClear = () => {
    setQueryMsg('');
    onRefreshList(null);
  };

  return (
    <div className={styles['auth-done-panel-left-menu-basic']}>
      <div style={{ lineHeight: '30px', textAlign: 'center', paddingRight: '8px' }}>
        <TextField
          prefix={<Icon type="search" />}
          style={{ width: '260px' }}
          onInput={handleInput}
          onEnterDown={handleQuery}
          onClear={handleClear}
          clearButton
          placeholder={intl
            .get('spfm.supplierElectronicSign.view.placeholder.companyNameOrCode')
            .d('请输入公司名称、编码查询')}
        />
      </div>
      {companyList && companyList.length ? (
        <div className={styles['auth-done-panel-left-menu']}>{drawCompanyList(companyList)}</div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: 'calc(100vh - 230px)',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '45px',
            }}
          >
            <img src={noResult} style={{ width: '38px' }} alt="noResult" />
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px', color: '#868D9C' }}>
            {intl.get('spfm.supplierElectronicSign.view.message.noQueryData').d('暂无查询结果')}
          </div>
        </div>
      )}
    </div>
  );
}
