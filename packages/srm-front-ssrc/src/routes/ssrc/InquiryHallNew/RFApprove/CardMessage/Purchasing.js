/*
 * @Descripttion: 寻源过程控制--采购组织及人员
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 19:18:17
 * @LastEditors: yiping.liu
 */
import React, { useContext } from 'react';
import CollapseForm from '_components/CollapseForm';
import { Output, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import Store from '../store';
import styles from './index.less';

const Purchasing = () => {
  const {
    commonDs: { buyerDs, sourcingTeamDs },
  } = useContext(Store);

  const columns = [
    {
      name: 'account',
    },
    {
      name: 'contactName',
    },
    {
      name: 'contactMail',
    },
    {
      name: 'phone',
    },
    {
      name: 'publicContactFlag',
    },
  ];

  return (
    <React.Fragment>
      <CollapseForm
        className="c7n-pro-vertical-form-display"
        dataSet={buyerDs}
        columns={3}
        labelLayout="vertical"
      >
        <Output name="purchaseAgentId" />
      </CollapseForm>
      <div className={styles['score-element-header']}>
        <h4>{intl.get('ssrc.rfController.view.card.source.group').d('寻源小组')}</h4>
      </div>
      <Table dataSet={sourcingTeamDs} columns={columns} />
    </React.Fragment>
  );
};

export default Purchasing;
