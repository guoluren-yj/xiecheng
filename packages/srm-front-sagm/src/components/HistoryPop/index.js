import React, { useState, useEffect } from 'react';
import { Dropdown, Menu, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { DropdownBtn } from '@/components/CommonButtons';

import styles from './styles.less';

const HistoryPop = ({
  btnText,
  icon,
  resKey = '',
  funcType = 'flat',
  currentVersionNum = 0, // 过滤出<= 当前版本的历史版本
  fetchApi,
  params = {},
  onItemClick,
  field = {},
  isSubMenu = false,
}) => {
  const {
    version = 'versionNum',
    operator = 'realName',
    accountNo = 'loginName',
    submitDate = 'creationDate',
  } = field;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // sunMenu 下使用
  useEffect(() => {
    if (isSubMenu) {
      fetchData();
    }
  }, []);

  // 非sunMenu 下使用
  const onHiddenChange = (hidden) => {
    // 弹出pop加载数据
    if (!hidden) {
      fetchData();
    }
  };

  const fetchData = () => {
    setLoading(true);
    fetchApi(params).then((res) => {
      setLoading(false);
      if (getResponse(res)) {
        if (resKey === 'none') {
          setData(res || []);
          return;
        }
        setData(res?.content.filter((f) => Number(f[version]) <= Number(currentVersionNum)));
      }
    });
  };

  return isSubMenu ? (
    <Menu className={styles['pop-history-list']}>
      {data.map((m) => (
        <Menu.Item onClick={() => onItemClick(m || {})}>
          <div className="version">
            {intl.get('sagm.common.view.historyVersionNum').d('版本v')}
            {m[version]}
          </div>
          <div className="operate">
            <span>
              {m[operator] || '-'}({m[accountNo] || '-'})
            </span>
            <span>{m[submitDate]}</span>
          </div>
        </Menu.Item>
      ))}
    </Menu>
  ) : (
    <Dropdown
      onHiddenChange={onHiddenChange}
      overlay={
        <Spin spinning={loading}>
          <Menu className={styles['pop-history-list']}>
            {data.map((m) => (
              <Menu.Item onClick={() => onItemClick(m || {})}>
                <div className="version">
                  {intl.get('sagm.common.view.historyVersionNum').d('版本v')}
                  {m[version]}
                </div>
                <div className="operate">
                  <span>
                    {m[operator] || '-'}({m[accountNo] || '-'})
                  </span>
                  <span>{m[submitDate]}</span>
                </div>
              </Menu.Item>
            ))}
          </Menu>
        </Spin>
      }
      placement="bottomLeft"
    >
      <DropdownBtn funcType={funcType} text={btnText} icon={icon} />
    </Dropdown>
  );
};

export default HistoryPop;
