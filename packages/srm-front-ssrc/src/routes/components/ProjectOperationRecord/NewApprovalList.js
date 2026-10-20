import React, { useState, useEffect, useCallback } from 'react';
import ApproveRecord from '_components/ApproveRecord';
import { Collapse, Spin, Icon } from 'choerodon-ui';
import { map, isEmpty } from 'lodash';
import classnames from 'classnames';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { fetchApprovalRecords } from './service';
import styles from './index.less';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();

export default function NewApprovalList(props) {
  const { pageData: { sourceProjectId, detailFlag, currentNodeId, approvalList } = {} } = props;
  const [approveRecordData, setApproveRecordData] = useState([]);
  const [activeKey, setActiveKey] = useState([]);
  const [allApproveKey, setAllApproveKey] = useState([]);
  const [fetchApprovalLoading, setApprovalLoading] = useState(false);

  useEffect(() => {
    const params = {
      organizationId,
      sourceProjectId,
    };

    if (approvalList?.length) {
      afterQueryApprovalList(approvalList);
    } else {
      getApprovalRecords(params);
    }
  }, []);

  useEffect(() => {
    if (detailFlag && approveRecordData.length > 0) {
      setActiveKey(allApproveKey);
      setTimeout(() => {
        const currentNode = document.getElementById(currentNodeId);
        const scrollElement = document.querySelector('.c7n-pro-modal-body');
        scrollElement.scrollTo({
          top: currentNode?.offsetTop,
          behavior: 'smooth',
        });
      }, 300);
    }
  }, [detailFlag, approveRecordData]);

  const handleChange = useCallback((activeKeys) => {
    setActiveKey(activeKeys);
  }, []);

  const afterQueryApprovalList = (res) => {
    const activeKeyArr = [];
    // 按需对接口返回的审批记录数据进行处理
    const approveRecordDataResult = [].concat(
      ...res.map((item) => {
        activeKeyArr.push(item.processType);
        return {
          historicTaskExtList: [].concat(
            ...(item.approvalHistories.map(
              (hisItem, index) =>
                item.approvalHistories[item.approvalHistories.length - index - 1]
                  .historicTaskExtList
            ) || [])
          ),
          processType: item.processType,
          processTypeMeaning: item.processTypeMeaning,
        };
      })
    );
    setActiveKey(activeKeyArr);
    setAllApproveKey(activeKeyArr);
    setApproveRecordData(approveRecordDataResult);
  };

  // 获取审批记录数据
  const getApprovalRecords = (params) => {
    setApprovalLoading(true);
    fetchApprovalRecords(params)
      .then((res) => {
        if (getResponse(res)) {
          afterQueryApprovalList(res);
        }
      })
      .finally(() => {
        setApprovalLoading(false);
      });
  };
  return (
    <Spin spinning={fetchApprovalLoading}>
      <div className={classnames(styles['common-list-wrap'], styles['approval-list-wrap'])}>
        {isEmpty(approveRecordData) ? (
          <div className="empty-wrapper">
            <span>{intl.get('ssrc.common.view.message.emptyData').d('暂无数据')}</span>
          </div>
        ) : (
          <Collapse
            bordered={false}
            expandIconPosition="text-right"
            expandIcon={(panelProps) => {
              const { isActive } = panelProps;
              return <Icon type={isActive ? 'expand_more' : 'expand_less'} />;
            }}
            activeKey={activeKey}
            onChange={handleChange}
          >
            {map(approveRecordData, (item) => {
              return (
                <Panel
                  header={item.processTypeMeaning}
                  key={item.processType}
                  style={{ border: 0 }}
                  id={item.processType}
                >
                  <ApproveRecord data={item.historicTaskExtList} />
                </Panel>
              );
            })}
          </Collapse>
        )}
      </div>
    </Spin>
  );
}
