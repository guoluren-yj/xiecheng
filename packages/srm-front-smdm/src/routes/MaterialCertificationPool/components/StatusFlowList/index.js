import React, { useState } from 'react';
import { getResponse } from 'utils/utils';
import { Steps } from 'choerodon-ui';
import { Dropdown, Spin, Menu } from 'choerodon-ui/pro';
import { fetchItemReqAllStatus } from '@/services/materialCertificationPoolService';

import styles from './index.less';

const { Step } = Steps;
const Index = function Index({ children, record }) {
  const [statusList, setStatusList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusListLoading, setHistoryLoading] = useState(false);

  const renderStatus = (value, index) => {
    if (['CANCEL', 'REJECTED', 'AUTHENTICATION_REJECTED'].includes(value)) {
      // 红色
      return 'error';
    }
    if (index < currentIndex) {
      // 绿色
      return 'finish';
    } else if (currentIndex === index) {
      if (
        ['AUTHENTICATION_APPROVED', 'EARLY_TERMINATION', 'FINAL_AUTHENTICATION_COMPLETE'].includes(
          value
        )
      ) {
        // 绿色
        return 'finish';
      }
      return 'process';
    } else if (currentIndex < index) {
      // 灰色
      return 'wait';
    }
  };

  const renderTitle = (data) => {
    // if (!nodeList[index + 1]?.authReqStatusCode && data.authReqStatusCode) {
    //   return <div className={style['select-node']}> {data.nodeCodeMeaning} </div>;
    // } else {
    return data.authReqStatusCodeMeaning;
    // }
  };

  const renderViewStatusMenu = () => {
    return (
      <Spin spinning={statusListLoading}>
        <Menu>
          <div className={styles['node-list-step-popup']}>
            <Steps size="small" current={currentIndex} className="c7n-steps-popup">
              {statusList.map((item, index) => (
                <Step
                  key={item.authReqStatusCode}
                  title={renderTitle(item)}
                  status={renderStatus(item.authReqStatusCode, index)}
                />
              ))}
            </Steps>
          </div>
        </Menu>
      </Spin>
    );
  };

  // 获取历史数据
  const fetchStatusList = (hidden) => {
    // 隐藏
    if (!hidden) {
      setHistoryLoading(true);
      fetchItemReqAllStatus(record.get('itemAuthReqHeaderId'))
        .then((res) => {
          if (getResponse(res)) {
            setCurrentIndex(
              res.findIndex((ele) => ele.authReqStatusCode === record.get('authReqStatusCode'))
            );
            setStatusList(res);
          } else {
            setStatusList([]);
          }
        })
        .finally(() => {
          setHistoryLoading(false);
        });
    } else {
      setStatusList([]);
    }
  };

  return (
    <div>
      {[
        'TEST_RESULTS_TO_BE_ENTERED',
        'PREAPPROVAL',
        'SAMPLE_DELIVERY_WAIT_FEEDBACK',
        'PREAPPROVAL_REJECTED',
        'FEEDBACK_REJECTED',
      ].includes(record?.get('authReqStatusCode')) ||
      record?.get('authFeeStatusCode') === 'PREAPPROVAL' ? (
        children
      ) : (
        <Dropdown
          overlay={renderViewStatusMenu()}
          onHiddenBeforeChange={(hidden) => {
            fetchStatusList(hidden);
          }}
        >
          {children}
        </Dropdown>
      )}
    </div>
  );
};

export default Index;
