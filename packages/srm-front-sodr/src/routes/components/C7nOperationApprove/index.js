/* eslint-disable no-param-reassign */
/**
 * @Description:动态渲染
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2021-09-06
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import React, { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { DataSet, Tabs, Spin } from 'choerodon-ui/pro';
// import { Collapse } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import ApproveRecordGroup from '_components/ApproveRecordGroup';
import hocRemote from 'utils/remote';

import Record from './Record';
import { approval } from './store/lineDs';
// import Styles from './index.less';

const { TabPane } = Tabs;
// const { Panel } = Collapse;
const C7nOperationApprove = (props) => {
  const { poHeaderId, modal, remote } = props;
  const [loading, setLoading] = React.useState(true);
  const [approveData, setApproveData] = React.useState([]);
  const approvalDs = useMemo(() => new DataSet(approval()), []);
  const [activeKey, setActiveKey] = useState('operator');
  const handleViewDetail = useCallback(() => {
    setActiveKey('approval');
  }, []);
  const handleChangeTab = useCallback(
    (tabKey) => {
      if (activeKey === tabKey) return;
      setActiveKey(tabKey);
    },
    [activeKey]
  );
  const operaProps = {
    modal,
    poHeaderId,
    onViewDetail: handleViewDetail,
    remote,
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
  const group = approveData.map((i) => ({
    title: i.operateTypeName,
    children: i.historicTaskExtList,
  }));
  return (
    <Fragment>
      {!loading ? (
        <>
          {!isEmpty(approveData) ? (
            <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onChange={handleChangeTab}>
              <TabPane
                tab={intl.get(`sodr.workspace.view.option.operationRecord`).d('操作记录')}
                key="operator"
              >
                <Record {...operaProps} />
              </TabPane>

              <TabPane
                tab={intl.get('sodr.workspace.view.option.approvalRecord').d('审批记录')}
                key="approval"
              >
                <Spin spinning={loading}>
                  {/* <div className={Styles['approve-list-new']}>
                    {(approveData || []).map((item) => (
                      <Collapse
                        bordered={false}
                        expandIconPosition="text-right"
                        expandIcon={renderIcon}
                        defaultActiveKey={item.id}
                      >
                        <Panel
                          header={item.operateTypeName}
                          key={item.id}
                          style={{
                            border: 0,
                          }}
                        >
                          <ApproveRecord data={item.historicTaskExtList} />
                        </Panel>
                      </Collapse>
                    ))}
                  </div> */}
                  <ApproveRecordGroup group={group} />
                </Spin>
              </TabPane>
            </Tabs>
          ) : (
            <Record {...operaProps} />
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
export default hocRemote({
  code: 'SODR_C7N_OPERATION_APPROVE',
  name: 'remote',
})(C7nOperationApprove);
