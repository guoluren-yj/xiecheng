/* eslint-disable no-param-reassign */
/**
 * 选择风险经办人
 */
import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import { Table, Icon } from 'choerodon-ui/pro';
import { uniqueFunc } from '@/utils/utils';

import QueryBarMore from './QueryBarMore';
import styles from './index.less';

export default function RiskManagerModal(props) {
  const { accountListDS, defaultList, onChangeCache = () => {} } = props; // localRecord,

  const [selectedList, setSelectedList] = useState([]);
  const [defList, setDefList] = useState([]); // 存储默认选中的数据

  useEffect(() => {
    accountListDS.addEventListener('select', selectEvent);
    accountListDS.addEventListener('unSelect', unSelectEvent);
    accountListDS.addEventListener('selectAll', selectEvent);
    accountListDS.addEventListener('unSelectAll', selectEvent);
    accountListDS.addEventListener('load', loadEvent);
    // accountListDS.setQueryParameter('excludeUserIds', []);
    accountListDS.query();

    return () => {
      accountListDS.removeEventListener('select', selectEvent);
      accountListDS.removeEventListener('unSelect', unSelectEvent);
      accountListDS.removeEventListener('selectAll', selectEvent);
      accountListDS.removeEventListener('unSelectAll', selectEvent);
      accountListDS.removeEventListener('load', loadEvent);

      accountListDS.data = [];
      accountListDS.queryDataSet.data = [];
      accountListDS.reset();
      accountListDS.clearCachedSelected();
    };
  }, []);

  useEffect(() => {
    setDefList(defaultList || []);
    onChangeCache(defaultList);
  }, [defaultList]);

  /**
   * 取消选择事件
   * @param {*} param
   */
  const unSelectEvent = ({ dataSet, record }) => {
    const cacheList = [...defList]; // 缓存的数据
    if (cacheList.length) {
      cacheList.forEach((item, index) => {
        if (item.id === record.get('id')) {
          // 删除对应的数据
          cacheList.slice(index, 1);
        }
      });
    }

    const list = dataSet.selected.map((item) => item.toData());

    setDefList(cacheList);
    onChangeCache(cacheList);
    setSelectedList(list || []);
  };

  const loadEvent = ({ dataSet }) => {
    if (defaultList.length) {
      dataSet.forEach((rcd) => {
        defaultList.forEach((item) => {
          if (rcd.get('id') === item.id) {
            dataSet.select(rcd);
          }
        });
      });
    }
  };

  const selectEvent = ({ dataSet }) => {
    const list = dataSet.selected.map((item) => item.toData());
    setSelectedList(list || []);
  };

  /**
   * 取消选择
   * @param {*} item
   */
  const handleRemoveItem = (item) => {
    const { id } = item;

    // 清除选择的列表
    const selects = [];
    if (selectedList.length) {
      selectedList.forEach((rcd) => {
        if (rcd.id !== id) {
          selects.push({ ...rcd });
        }
      });
    }

    // 清除页面回填的缓存列表
    const selectArr = [];
    if (defList.length) {
      defList.forEach((rcd) => {
        if (rcd.id !== id) {
          selectArr.push({ ...rcd });
        }
      });
    }

    accountListDS.all.forEach((rcd) => {
      if (rcd.get('id') === item.id) {
        accountListDS.unSelect(rcd);
      }
    });

    setDefList(selectArr);
    onChangeCache(selectArr);
    setSelectedList(selects);
  };

  /**
   * 渲染已选择的列表
   */
  const renderSelectedItem = () => {
    const data = [...selectedList, ...defList];
    const uniList = uniqueFunc(data, 'id');

    return (uniList || []).map((item) => {
      return (
        <div key={item.id} className={styles['risk-manager-selected-item']}>
          <div>
            <span>{item.loginName}</span>
            <span style={{ marginLeft: '20px' }}>{item.realName}</span>
          </div>
          <span>
            <Icon
              type="cancel"
              style={{ color: '#C9CDD4', cursor: 'pointer' }}
              onClick={() => handleRemoveItem(item)}
            />
          </span>
        </div>
      );
    });
  };

  const columns = () => {
    return [{ name: 'loginName' }, { name: 'realName' }];
  };

  const renderQueryBar = (prop) => {
    return <QueryBarMore {...prop} />;
  };

  const tableProps = {
    dataSet: accountListDS,
    queryFieldsLimit: 2,
    highLightRow: false,
    columns: columns(),
    queryBar: renderQueryBar,
    autoHeight: { type: 'maxHeight', diff: 20 },
  };

  const allList = [...selectedList, ...defList];
  const uniList = uniqueFunc(allList, 'id');

  return (
    <div className={styles['risk-manager-modal']}>
      <div className={styles['risk-manager-modal-left']}>
        <div style={{ lineHeight: '60px', fontWeight: '600', fontSize: '16px' }}>
          {intl.get('sdat.riskDefinition.view.title.selectChargePerson').d('选择经办人')}
        </div>
        <Table {...tableProps} />
      </div>
      <div>
        <div className={styles['risk-manager-modal-right-count']}>
          {intl.get('sdat.riskDefinition.view.message.selectCount', { name: uniList.length })}
        </div>
        <div className={styles['risk-manager-modal-right']}>{renderSelectedItem()}</div>
      </div>
    </div>
  );
}
