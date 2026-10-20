import React, { useEffect, useState } from 'react';
import { Spin } from 'choerodon-ui';
import { isArray } from 'lodash';
import ApproveRecord from '_components/ApproveRecord';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchApproveHistory } from '@/services/rpExecuteProgramService';

import styles from './index.less';

// const { TabPane } = Tabs;
// const { Panel } = Collapse;
const OperationHistory = ({ blHeaderId }) => {
  const [approveData, setApproveData] = useState([]);
  const [approveLoading, setApproveLoading] = useState(false);
  // const [activeKey, setActiveKey] = useState('operator');
  useEffect(() => {
    // 审批记录
    setApproveLoading(true);
    fetchApproveHistory(blHeaderId)
      .then((res) => {
        if (res && isArray(res)) {
          let allHistoricTaskExtList = [];
          res.forEach((ele) => {
            allHistoricTaskExtList = allHistoricTaskExtList.concat(ele.historicTaskExtList || []);
          });
          setApproveData(allHistoricTaskExtList.reverse());
        }
      })
      .finally(() => setApproveLoading(false));
  }, [blHeaderId]);

  // const handleNoData = () => {
  //   return (
  //     <div className="nodata_wrapper">
  //       <span>{intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}</span>
  //     </div>
  //   );
  // };

  // const renderIcon = useCallback(
  //   ({ isActive }) => <Icon type={isActive ? 'expand_more' : 'navigate_next'} />,
  //   []
  // );

  // const handleChangeTab = useCallback(
  //   (tabKey) => {
  //     if (activeKey === tabKey) return;
  //     setActiveKey(tabKey);
  //   },
  //   [activeKey]
  // );

  return (
    <div className={styles.operating}>
      {/* <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onChange={handleChangeTab}> */}
      {/* <TabPane tab={intl.get('hzero.common.button.approveHistory').d('审批记录')} key="approved"> */}
      <Spin spinning={approveLoading}>
        <div className={styles['approve-list-new']}>
          <ApproveRecord data={approveData} />
        </div>
      </Spin>
      {/* </TabPane> */}
      {/* </Tabs> */}
    </div>
  );
};

export default formatterCollections({
  code: ['hzero.common', 'srpm.common'],
})(OperationHistory);
