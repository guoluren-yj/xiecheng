import React, { useState } from 'react';
import { Table, Modal, TextField, Icon } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { fetchUnBind } from '@/services/cardsDistributionService';

import SubscriptionHistory from '../SubscriptionHistory';

import styles from './index.less';

const { TabPane } = Tabs;

const TabsPanel = (props) => {
  const { tenantSubscriDS, subHistoryDS, localRecord = null } = props;

  const [inputVal, setInput] = useState('');

  const tentantColumns = () => {
    return [
      {
        name: 'tenantNum',
        header: intl.get(`sdat.cardsDistribution.model.tenantNum`).d('租户编码'),
      },
      {
        name: 'tenantName',
        header: intl.get(`sdat.cardsDistribution.model.tenantName`).d('租户名称'),
      },
      {
        header: intl.get(`sdat.cardsDistribution.model.districtDate`).d('分发时间'),
        name: 'operateTime',
      },
      {
        header: intl.get(`sdat.cardsDistribution.model.operator`).d('操作人'),
        name: 'operateUserName',
        type: 'string',
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        renderer: ({ record }) => {
          return (
            <span>
              <a onClick={() => handleUnbind(record)}>
                {intl.get('hzero.common.button.remove').d('移除')}
              </a>
            </span>
          );
        },
      },
    ];
  };

  /**
   *解绑操作
   * @param {*} record
   */
  const handleUnbind = (record) => {
    Modal.confirm({
      title: intl.get('sdat.cardsDistribution.view.message.confirmUnbind').d('是否确认解绑？'),
      children: <></>,
    }).then((button) => {
      if (button === 'ok') {
        unBindContinue(record);
      }
    });
  };

  /**
   * 解绑
   * @param {*} record
   */
  const unBindContinue = (record) => {
    if (record.get('tenantId') >= 0) {
      const params = record.toData();
      fetchUnBind([
        {
          ...params,
          ...localRecord,
        },
      ]).then((res) => {
        if (getResponse(res)) {
          tenantSubscriDS.query();
        }
      });
    }
  };

  /**
   * 输入查询条件
   */
  const handleInput = (e) => {
    setInput(e?.target?.value?.trim() ?? '');
  };

  /**
   * 清空查询条件
   */
  const handleClear = () => {
    setInput('');
    handleQuery('clear');
  };

  const handleQuery = (type) => {
    tenantSubscriDS.setQueryParameter('tenantName', type === 'clear' ? '' : inputVal);
    tenantSubscriDS.query();
  };

  /**
   * 切换tab页重新查数据
   */
  const handleChangeTab = (e) => {
    if (e === '1') {
      tenantSubscriDS.query();
    }

    if (e === '2') {
      subHistoryDS.query();
    }
  };

  return (
    <div className={styles['tab-bar-style']}>
      <Tabs defaultActiveKey="1" onChange={handleChangeTab}>
        <TabPane
          tab={intl.get('sdat.cardsDistribution.view.title.subscripTenant').d('订阅租户')}
          key="1"
        >
          <TextField
            placeholder={intl
              .get('sdat.cardsDistribution.view.title.tenantSearchHolder')
              .d('请输入租户编码、租户名称查询')}
            prefix={<Icon type="search" />}
            style={{ width: '280px', marginTop: '16px' }}
            clearButton
            value={inputVal}
            onInput={handleInput}
            onClear={handleClear}
            onEnterDown={handleQuery}
          />
          <div
            style={{
              marginTop: '16px',
            }}
          >
            <Table
              queryBar="none"
              columns={tentantColumns()}
              dataSet={tenantSubscriDS}
              customizable
              customizedCode="SDAT.CARD_DISTRIBUTION_TENTANTSUBSCRIP"
            />
          </div>
        </TabPane>
        <TabPane
          tab={intl.get('sdat.cardsDistribution.view.title.subscriptionHistory').d('操作历史')}
          key="2"
        >
          <SubscriptionHistory dataSet={subHistoryDS} localRecord={localRecord} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TabsPanel;
