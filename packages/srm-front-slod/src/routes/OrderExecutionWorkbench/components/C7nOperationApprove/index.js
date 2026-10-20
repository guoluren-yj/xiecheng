/* eslint-disable no-param-reassign */
/**
 * @Description:动态渲染
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2021-09-06
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import React, { Fragment, useEffect, useMemo } from 'react';
import { DataSet, Tabs, Spin } from 'choerodon-ui/pro';
import { Collapse, Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import ApproveRecord from '_components/ApproveRecord';
import Record from './Record';
import { approval } from './store/lineDs';
import Styles from './index.less';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const C7nOperationApprove = (props) => {
  const { poHeaderId } = props;
  const [loading, setLoading] = React.useState(true);
  const [approveData, setApproveData] = React.useState([]);
  const approvalDs = useMemo(() => new DataSet(approval()), []);
  const operaProps = {
    poHeaderId,
  };
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
    <Fragment>
      {!loading ? (
        <>
          {isEmpty(approveData) ? (
            <Record {...operaProps} />
          ) : (
            <Tabs>
              <TabPane
                tab={intl.get(`slod.orderExecution.view.option.operationRecord`).d('操作记录')}
                key="operator"
              >
                <Record {...operaProps} />
              </TabPane>
              <TabPane
                tab={intl.get('slod.orderExecution.view.option.approvalRecord').d('审批记录')}
                key="approval"
              >
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
                          header={intl
                            .get('slod.orderExecution.model.common.orderApproval')
                            .d('订单审批')}
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
                        <span>
                          {intl.get('slod.orderExecution.model.common.emptyData').d('暂无数据')}
                        </span>
                      </div>
                    )}
                  </div>
                </Spin>
              </TabPane>
            </Tabs>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <Spin loading={loading} />
        </div>
      )}
    </Fragment>
  );
};
export default C7nOperationApprove;
