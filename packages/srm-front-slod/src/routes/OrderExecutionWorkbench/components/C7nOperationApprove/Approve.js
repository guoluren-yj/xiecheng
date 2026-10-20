/**
 * @Description:
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2021-09-06
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import React, { useMemo, useEffect } from 'react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import { Timeline, Spin, Icon, Collapse } from 'choerodon-ui';
import Upload from '_components/Upload';
import { approval } from './store/lineDs';
import { approveNameRender, approveNameRenderColor } from './utils';
import { BUCKET_NAME } from '@/routes/OrderExecutionWorkbench/components/utils/constant';

import Styles from './index.less';

const { Panel } = Collapse;
const { Item } = Timeline;
const Approve = (props) => {
  const { poHeaderId } = props;
  const [loading, setLoading] = React.useState();
  const [approveData, setApproveData] = React.useState();
  const [activeKey, setActiveKey] = React.useState([]);
  const approvalDs = useMemo(() => new DataSet(approval()), []);
  const handleChange = React.useCallback((activeKeys) => {
    setActiveKey(activeKeys);
  }, []);
  useEffect(() => {
    approvalDs.setQueryParameter('poHeaderId', poHeaderId);
    approvalDs
      .query()
      .then((res) => {
        setLoading(true);
        if (getResponse(res)) {
          const reset = res.map((item) => item.id);
          setApproveData(res);
          setActiveKey(reset);
        }
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <Spin spinning={loading}>
      <div className={Styles['approve-list']}>
        <Collapse
          bordered={false}
          expandIconPosition="text-right"
          activeKey={activeKey}
          onChange={handleChange}
        >
          {(approveData || []).map((item) => {
            return (
              <Panel
                header={intl.get('slod.orderExecution.model.common.orderApproval').d('订单审批')}
                key={item.id}
                style={{
                  border: 0,
                }}
              >
                <Timeline>
                  {item.historicTaskExtList.reverse().map((ite) => {
                    return (
                      <Item color={approveNameRenderColor(ite.action).actionColor || '#E5E5E5'}>
                        {ite.action ? (
                          approveNameRender(ite.action)
                        ) : ['startEvent', 'endEvent'].includes(ite.actType) ? (
                          approveNameRender(ite.actType)
                        ) : (
                          <span className="under-approval">
                            {intl.get('slod.orderExecution.model.common.approvaling').d('审批中')}
                          </span>
                        )}
                        {ite.actType === 'startEvent' && (
                          <p className="line">
                            <span className="desc">
                              {intl
                                .get('slod.orderExecution.model.common.process.id')
                                .d('流程标识')}
                            </span>
                            <span className="line-id">{item.id}</span>
                          </p>
                        )}
                        {ite.actType !== 'endEvent' &&
                          (ite.actType === 'startEvent' ? (
                            <p className="line">
                              <span className="desc">
                                {intl.get('slod.orderExecution.model.common.initiator').d('发起人')}
                              </span>
                              <span className="text-name">{ite.assigneeName}</span>
                            </p>
                          ) : (
                            <p className="line">
                              <span className="desc">
                                {intl
                                  .get('slod.orderExecution.model.common.approvaUser')
                                  .d('审批人')}
                              </span>
                              <span className="text-name">{ite.assigneeName}</span>
                              {ite.action !== 'Rejected' && (
                                <Icon className="approve_icon check" type="check" />
                              )}
                              {(ite.action === 'Rejected' || ite.action === 'Jump') && (
                                <Icon className="approve_icon close" type="close" />
                              )}
                            </p>
                          ))}
                        {ite.comment && (
                          <div className="approval-comment">
                            <span style={{ width: 60 }} className="approval-title">
                              {intl
                                .get('slod.orderExecution.model.common.approveComment')
                                .d('审批意见')}
                            </span>
                            {['Rejected'].includes(ite.actType) ? (
                              <div className="approval-rejected">
                                <div style={{ width: 360 }}>
                                  <div>{ite.comment}</div>
                                </div>
                              </div>
                            ) : (
                              <div className="approval-content">
                                <div className="comment">
                                  <div className="comment-title">{ite.comment}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {ite.attachmentUuid && (
                          <div className="enclosure">
                            <span className="approval-upload">
                              {intl.get('slod.orderExecution.model.common.enclosure').d('附件')}
                            </span>
                            <Upload
                              filePreview
                              viewOnly
                              bucketName={BUCKET_NAME}
                              attachmentUUID={ite.attachmentUuid}
                            />
                          </div>
                        )}
                        {ite.actType !== 'endEvent' && (
                          <p className="line date-line">
                            <span className="desc">
                              {intl.get('slod.orderExecution.model.common.dateTime').d('日期')}
                            </span>
                            <span className="date-time">{ite.startTime}</span>
                          </p>
                        )}
                      </Item>
                    );
                  })}
                </Timeline>
              </Panel>
            );
          })}
        </Collapse>
        {isEmpty(approveData) && (
          <div div className={Styles['empty-wrapper']}>
            <span>{intl.get('slod.orderExecution.model.common.emptyData').d('暂无数据')}</span>
          </div>
        )}
      </div>
    </Spin>
  );
};
export default Approve;
