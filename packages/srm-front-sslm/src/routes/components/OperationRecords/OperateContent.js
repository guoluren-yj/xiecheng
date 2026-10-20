/*
 * @Date: 2022-04-24 11:03:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment } from 'react';
import { Timeline, Icon } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import FilterBar from '_components/FilterBarTable/FilterBar';
import { ReactComponent as NoData } from '@/assets/no-data.svg';
import styles from './index.less';
import {
  getTimelineColor,
  getOperationColor,
  operationIconMap,
  getOperationUser,
  getOperation,
  getOperationType,
  getOperationRemark,
  getOperationTime,
  getSubmitStatus,
  getRejectedStatus,
  getApprovedStatus,
} from './utils';

const approvalMethodList = ['SUPPLIER_SUBMIT', 'SUPPLIER_WFL', 'PURCHASE_WFL', 'WORKFLOW_APPROVAL'];
/**
 * WFL - 工作流审批
 * WFL_ONLY - 仅工作流审批
 * SELF、FUNC - 功能审批
 * EXT - 外部系统审批
 * NO_APPROVE - 无需审批
 * 审批方式+code区分
 * 后端code未进行区分，比如送样的CONFIRMED
 * 审批方式是工作流审批，那就是工作流审批通过
 * 审批方式是功能审批，那就是XXX 最终审批了【送样申请】，审批结果为：【通过】
 * 审批方式是无需审批，那就是XXX 确认【送样申请】
 * 增加中间状态过滤getSubmitStatus()
 * 如提交审批这个动作就已经触发工作流了，此时提交审批这个动作的审批方式就是工作流审批，
 * 此时不知最终审批结果，所以要过滤掉，其次，提交审批已触发工作流，此时需要展示工作流审批页签，内容为暂无数据。
 */
const OperateContent = ({
  onRef,
  remote,
  hasData,
  searchDs,
  showFlag,
  dataSource,
  onQuery,
  documentType,
  handleTabChange,
}) => {
  return hasData ? (
    <div>
      {showFlag && (
        <FilterBar
          onRef={onRef}
          dataSet={[searchDs]}
          onQuery={onQuery}
          autoQuery={false}
          expandable={false}
          defaultExpand={false}
        />
      )}
      {!isEmpty(dataSource) ? (
        <Timeline className={styles['operation-warp']}>
          {dataSource.map(data => {
            const processStatus = data.processStatus || data.operationCode || data.optionStatus;

            return (
              <Timeline.Item
                color={
                  ['WFL', 'WFL_ONLY', 'SELF', 'FUNC', ...approvalMethodList].includes(
                    data.approvalMethod
                  )
                    ? getTimelineColor(processStatus)
                    : '#E5E5E5'
                }
              >
                <div className={styles['operation-item-warp']}>
                  <div className={styles['operation-icon']}>
                    <Icon
                      type={
                        ['WFL', 'WFL_ONLY', 'SELF', 'FUNC', ...approvalMethodList].includes(
                          data.approvalMethod
                        ) && !getSubmitStatus(processStatus)
                          ? 'authorize'
                          : operationIconMap[processStatus] || 'mode_edit'
                      }
                    />
                  </div>
                  <div className={styles['operation-content']}>
                    <div className={styles['operation-content-desc']}>
                      {/* 工作流 */}
                      {['WFL', 'WFL_ONLY', ...approvalMethodList].includes(data.approvalMethod) &&
                      !getSubmitStatus(processStatus) ? (
                        <a
                          style={{
                            color: getApprovedStatus(processStatus) ? '#47B881' : '#F56349',
                            display: 'block',
                          }}
                          onClick={() => handleTabChange('approve')}
                        >
                          {getApprovedStatus(processStatus)
                            ? intl.get('sslm.common.view.workFlow.approved').d('工作流审批通过')
                            : intl.get('sslm.common.view.workFlow.rejected').d('工作流审批拒绝')}
                        </a>
                      ) : // 功能审批、自审批
                      ['SELF', 'FUNC'].includes(data.approvalMethod) &&
                        !getSubmitStatus(processStatus) ? ( // 此处加中间状态过滤，因为有的无需审批用的SELF
                          <Fragment>
                            <span className={styles['operation-content-desc-item']}>
                              {getOperationUser(data)}
                              {data.purchaseOperateFlag === 0 && (
                              <span className={styles['operation-content-desc-item-supplier']}>
                                {intl.get('sslm.common.view.operation.supplier').d('供')}
                              </span>
                            )}
                            </span>
                            <span style={{ color: getOperationColor() }}>
                              {' '}
                              {intl.get('sslm.common.view.operation.finalApproval').d('审批了')}
                            </span>
                            <span className={styles['operation-content-desc-item']}>
                            【{getOperationType(documentType)}】，
                            </span>
                            <span style={{ color: getOperationColor() }}>
                              {intl.get('sslm.common.view.operation.approvalResult').d('审批结果为')}
                            ：
                            </span>
                            <span style={{ color: getTimelineColor(processStatus) }}>
                            【
                              {getRejectedStatus(processStatus)
                              ? intl.get('sslm.common.view.node.rejected').d('拒绝')
                              : getApprovedStatus(processStatus)
                              ? intl.get('sslm.common.view.node.pass').d('通过')
                              : '-'}
                            】
                            </span>
                          </Fragment>
                      ) : ['SYSTEM'].includes(data.approvalMethod) &&
                        !getSubmitStatus(processStatus) ? ( // 无需审批直接取后端返回的描述
                          <span className={styles['operation-content-desc-item']}>
                            {getOperationRemark(data)}
                          </span>
                      ) : (
                        <Fragment>
                          <span className={styles['operation-content-desc-item']}>
                            {getOperationUser(data)}
                            {data.purchaseOperateFlag === 0 && (
                              <span className={styles['operation-content-desc-item-supplier']}>
                                {intl.get('sslm.common.view.operation.supplier').d('供')}
                              </span>
                            )}
                          </span>
                          <span style={{ color: getOperationColor() }}> {getOperation(data)}</span>
                          <span className={styles['operation-content-desc-item']}>
                            【{getOperationType(documentType)}】
                          </span>
                          <div className={styles['operation-content-remark']}>
                            {getOperationRemark(data)}
                          </div>
                        </Fragment>
                      )}
                    </div>
                    {remote
                      ? remote.render('SSLM_OPERATION_RECORDS_EXTRA_NODE', null, {
                          data,
                        })
                      : null}
                    <span className={styles['operation-content-time']}>
                      {dateTimeRender(getOperationTime(data))}
                    </span>
                  </div>
                </div>
              </Timeline.Item>
            );
          })}
        </Timeline>
      ) : (
        <div className={styles['no-data']}>
          <NoData />
          <span>{intl.get('sslm.common.view.message.noData').d('暂无数据')}</span>
        </div>
      )}
    </div>
  ) : (
    <div className={styles['no-data']}>
      <NoData />
      <span>{intl.get('sslm.common.view.message.noData').d('暂无数据')}</span>
    </div>
  );
};

export default OperateContent;
