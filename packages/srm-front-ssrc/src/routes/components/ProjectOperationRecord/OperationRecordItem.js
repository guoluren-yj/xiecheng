/**
 * 操作记录item
 */
import React, { useMemo } from 'react';
import { Icon } from 'choerodon-ui';
import moment from 'moment';
import { noop } from 'lodash';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { renderOperationDesc, getComputedRegExpValue, getProcessOperationAction } from './utils';
import { processOperationIconMap, processOperationDescMap } from './constants';

import styles from './index.less';

const OperationRecordItem = (props) => {
  const { item, onViewDetail = noop } = props;

  const operationDescArr = useMemo(() => {
    // 若修改getProcessOperationAction的参数，请关注下接口查询的地方也有这个方法需要处理
    return getProcessOperationAction(item);
  }, []);

  // 获取审批状态的字体颜色
  const getStyleColor = (processOperation, processSystemCode, realName) => {
    if (!processSystemCode || processSystemCode === 'SRM') {
      if (['RELEASE_APPROVED', 'CHECK_APPROVED', 'ALTER_APPROVE'].includes(processOperation)) {
        return '#47B881';
      } else {
        return '#F56349';
      }
    } else if (processSystemCode === 'OA') {
      if (['RELEASE_APPROVED', 'CHECK_APPROVED', 'ALTER_APPROVE'].includes(processOperation)) {
        return realName ? '' : '#47B881';
      } else {
        return realName ? '' : '#F56349';
      }
    }
  };

  // 渲染新的操作记录审批描述
  // 将页面渲染那一套特殊逻辑拿到接口渲染那里了，若改这里需要将处理接口数据那里也改掉
  const renderRfxApprove = () => {
    return ['EXTERNAL_APPROVE', 'APPROVE'].includes(item.processOperation) ? (
      <span>
        {!item?.processSystemCode || item?.processSystemCode === 'SRM' ? (
          <span className={styles['operation-record-item-conent-desc-approve']}>
            <a
              onClick={() => onViewDetail(item.processType)}
              className={styles['operation-record-item-conent-desc-approve-text']}
            >
              {`${intl.get(`ssrc.common.status.approved`).d('工作流审批通过')}`}
            </a>
          </span>
        ) : item.realName ? (
          <>
            <span>{`${item?.realName}（${item?.loginName}）`}</span>
            <span>{intl.get('ssrc.common.view.message.finallyApproved').d('最终审批了')}</span>
            <span>{`【${intl.get('ssrc.common.view.message.rfx').d('询价单')}】`}</span>
            <span>
              {`，${intl.get('ssrc.common.view.message.resultApproved').d('审批结果为')}:`}
            </span>
            <span>
              <span style={{ color: '#47B881' }}>
                {`【${intl.get('ssrc.common.view.message.approved').d('通过')}】`}
              </span>
            </span>
          </>
        ) : (
          <span className={styles['operation-record-item-conent-desc-approve']}>
            <span className={styles['operation-record-item-conent-desc-approve-text']}>
              {`${intl.get(`ssrc.common.status.externalSystemApproved`).d('外部系统审批通过')}`}
            </span>
          </span>
        )}
      </span>
    ) : (
      <span>
        {!item?.processSystemCode || item?.processSystemCode === 'SRM' ? (
          <span className={styles['operation-record-item-conent-desc-reject']}>
            <a
              onClick={() => onViewDetail(item.processType)}
              className={styles['operation-record-item-conent-desc-reject-text']}
            >
              {`${intl.get(`ssrc.common.status.rejected`).d('工作流审批拒绝')}`}
            </a>
          </span>
        ) : item?.realName ? (
          <>
            <span>{`${item?.realName}（${item?.loginName}）`}</span>
            <span>{intl.get('ssrc.common.view.message.finallyApproved').d('最终审批了')}</span>
            <span>{`【${intl.get('ssrc.common.view.message.rfx').d('询价单')}】`}</span>
            <span>
              {`，${intl.get('ssrc.common.view.message.resultApproved').d('审批结果为')}:`}
            </span>
            <span>
              <span style={{ color: '#F56349' }}>
                {`【${intl.get('ssrc.common.view.message.rejected').d('拒绝')}】`}
              </span>
            </span>
          </>
        ) : (
          <span className={styles['operation-record-item-conent-desc-reject']}>
            <span className={styles['operation-record-item-conent-desc-reject-text']}>
              {`${intl.get(`ssrc.common.status.externalSystemRejected`).d('外部系统审批拒绝')}`}
            </span>
          </span>
        )}
      </span>
    );
  };

  return (
    <div className={styles['operation-record-item']} key={item.projectActionId}>
      <div className={styles['operation-record-item-icon']}>
        <Icon
          type={
            item.processOperation === 'EVALUATE_DELIVER'
              ? 'call_missed_outgoing'
              : item.processOperation === 'CLOSED'
              ? 'not_interested'
              : processOperationIconMap[item.processOperation] || processOperationIconMap.DEFAULT
          }
        />
      </div>
      <div className={styles['operation-record-item-conent']}>
        <div className={styles['operation-record-item-conent-desc']}>
          {!['APPROVE', 'REJECT', 'DOC_DELIVER', 'EXTERNAL_APPROVE', 'EXTERNAL_REJECT'].includes(
            item.processOperation
          ) &&
            ([
              'RELEASE_APPROVED',
              'CHECK_APPROVED',
              'RELEASE_REFUSED',
              'CHECK_REFUSED',
              'ALTER_APPROVE',
              'ALTER_REJECT',
            ].includes(item.processOperation) ? (
              <span
                style={{ cursor: 'pointer' }}
                onClick={
                  !item.processSystemCode || item.processSystemCode === 'SRM'
                    ? () => onViewDetail(item.processType)
                    : () => {}
                }
              >
                <span
                  style={{
                    color: getStyleColor(
                      item?.processOperation,
                      item?.processSystemCode,
                      item?.realName
                    ),
                  }}
                >
                  {getComputedRegExpValue(operationDescArr?.[0], item)}
                </span>
                <span>{getComputedRegExpValue(operationDescArr?.[1], item)}</span>
                <span>{operationDescArr?.[2]}</span>
                <span>{operationDescArr?.[3]}</span>
                <span>
                  <span
                    style={{
                      color: ['RELEASE_APPROVED', 'CHECK_APPROVED', 'ALTER_APPROVE'].includes(
                        item?.processOperation
                      )
                        ? '#47B881'
                        : '#F56349',
                    }}
                  >
                    {operationDescArr?.[4]}
                  </span>
                </span>
              </span>
            ) : (
              <>
                <span>{getComputedRegExpValue(operationDescArr?.[0], item)}</span>
                <span>{getComputedRegExpValue(operationDescArr?.[1], item)}</span>
                <span>{operationDescArr?.[2]}</span>
                <span>{operationDescArr?.[3]}</span>
              </>
            ))}
          {item.processOperation === 'DOC_DELIVER' && (
            <>
              <span>{getComputedRegExpValue(operationDescArr?.[0], item)}</span>
              <span>{operationDescArr?.[1]}</span>
              <span>{`${item.deliverFromUserName} (${item.deliverFromUserLoginName}) `}</span>
              <span>{operationDescArr?.[2]}</span>
              <span>{`${item.deliverToUserName} (${item.deliverToUserLoginName}) `}</span>
            </>
          )}
          {['APPROVE', 'REJECT', 'EXTERNAL_REJECT', 'EXTERNAL_APPROVE'].includes(
            item.processOperation
          ) && renderRfxApprove()}
        </div>
        <div className={styles['operation-record-item-conent-remark']}>
          {[
            'ADJUST_TIME',
            'ADD_SUPPLIER',
            'ISSUE',
            'CUX_CANCEL',
            'CUX_RETURNED',
            'CUX_UPGRADE',
            'CUX_CHANGE',
          ].includes(item.processOperation) &&
            processOperationDescMap[item.processOperation] && (
              <>
                <span>{renderOperationDesc(item)}</span>
                <span className={styles['operation-record-item-conent-remark-value']}>
                  {['CUX_CANCEL', 'CUX_RETURNED', 'CUX_UPGRADE', 'CUX_CHANGE'].includes(
                    item.processOperation
                  )
                    ? item.processedRemark || '-'
                    : item.sourceProjectRemark || '-'}
                </span>
              </>
            )}
        </div>
        <span className={styles['operation-record-item-conent-time']}>
          {item.processedDate && moment(item.processedDate).format(DEFAULT_DATETIME_FORMAT)}
        </span>
      </div>
    </div>
  );
};

export default OperationRecordItem;
