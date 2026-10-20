/* eslint-disable no-param-reassign */
/**
 * @Description:
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2021-10-13
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import React, { useMemo, useEffect } from 'react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import { Spin, Collapse, Icon } from 'choerodon-ui';
import ApproveRecord from '_components/ApproveRecord';
import { approval } from './store/lineDs';
import Styles from './index.less';

const { Panel } = Collapse;
const Approve = (props) => {
  const { poHeaderId } = props;
  const [loading, setLoading] = React.useState();
  const [approveData, setApproveData] = React.useState([]);
  const approvalDs = useMemo(() => new DataSet(approval()), []);
  useEffect(() => {
    approvalDs.setQueryParameter('poHeaderId', poHeaderId);
    approvalDs
      .query()
      .then((res) => {
        setLoading(true);
        if (getResponse(res)) {
          res = res.map((item) => {
            return {
              ...item,
              historicTaskExtList: item.historicTaskExtList.reverse(),
            };
          });
          setApproveData(res);
        }
      })
      .finally(() => setLoading(false));
  }, []);
  const renderIcon = React.useCallback(
    ({ isActive }) => <Icon type={isActive ? 'expand_more' : 'navigate_next'} />,
    []
  );

  return (
    <Spin spinning={loading}>
      <div className={Styles['approve-list-new']}>
        {(approveData || []).map((item) => (
          <Collapse
            bordered={false}
            expandIconPosition="text-right"
            expandIcon={renderIcon}
            defaultActiveKey={item.id}
          >
            <Panel
              header={intl.get('slod.orderExecution.model.common.orderApproval').d('订单审批')}
              key={item.id}
              style={{
                border: 0,
              }}
            >
              <ApproveRecord data={item.historicTaskExtList} />
            </Panel>
          </Collapse>
        ))}
        {isEmpty(approveData) && (
          <div
            style={{
              width: '100%',
              height: '100px',
              lineHeight: '100px',
              textAlign: 'center',
              color: '#000',
            }}
          >
            <span>{intl.get('slod.orderExecution.model.common.emptyData').d('暂无数据')}</span>
          </div>
        )}
      </div>
    </Spin>
  );
};

export default Approve;
