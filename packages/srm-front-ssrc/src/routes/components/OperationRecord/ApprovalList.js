/**
 * 审批记录列表
 */
import React, { Fragment, useEffect, useState, useCallback } from 'react';
import { Collapse, Timeline, Spin } from 'choerodon-ui';
import { map } from 'lodash';
import classnames from 'classnames';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { fetchApprovalRecords } from './service';
import { getComputedColor } from './utils';

import TaskExtItem from './TaskExtItem';
import CustTaskExtItem from './CustTaskExtItem';

import styles from './index.less';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();

export default function ApprovalList(props) {
  const { pageData: { rfxHeaderId } = {} } = props;
  const [approvalList, setApprovalList] = useState([]);
  const [activeKey, setActiveKey] = useState([]);
  const [fetchApprovalLoading, setApprovalLoading] = useState(false);
  useEffect(() => {
    const params = {
      organizationId,
      rfxHeaderId,
    };
    getApprovalRecords(params);
  }, []);
  const handleChange = useCallback((activeKeys) => {
    setActiveKey(activeKeys);
  }, []);

  const getApprovalRecords = (params) => {
    setApprovalLoading(true);
    fetchApprovalRecords(params)
      .then((res) => {
        if (getResponse(res)) {
          setApprovalList(res);
          setActiveKey([res[0]?.processType]);
        }
      })
      .finally(() => {
        setApprovalLoading(false);
      });
  };

  return (
    <Spin spinning={fetchApprovalLoading}>
      <div className={classnames(styles['common-list-wrap'], styles['approval-list-wrap'])}>
        {
          <Collapse
            bordered={false}
            expandIconPosition="text-right"
            activeKey={activeKey}
            onChange={handleChange}
          >
            {map(approvalList, (item) => {
              return (
                <Panel header={item.processTypeMeaning} key={item.processType}>
                  <Timeline>
                    {map(item.approvalHistories, (hisItem) => {
                      return map(hisItem.historicTaskExtList, (takExtItem, extIndex) => {
                        return (
                          <Fragment>
                            <Timeline.Item color={getComputedColor(takExtItem.action)}>
                              <TaskExtItem item={takExtItem} index={extIndex} />
                            </Timeline.Item>
                            {['AddSign', 'CarbonCopy'].includes(takExtItem.action) && (
                              <Timeline.Item color={getComputedColor(takExtItem.action)}>
                                <CustTaskExtItem item={takExtItem} index={extIndex} />
                              </Timeline.Item>
                            )}
                          </Fragment>
                        );
                      });
                    })}
                  </Timeline>
                </Panel>
              );
            })}
          </Collapse>
        }
      </div>
    </Spin>
  );
}
