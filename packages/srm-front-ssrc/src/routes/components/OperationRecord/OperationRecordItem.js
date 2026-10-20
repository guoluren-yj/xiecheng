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
  const {
    item,
    onViewDetail = noop,
    rfTitle = '',
    dataType = '',
    rfx = {},
    newFlag = true,
    remote,
  } = props;

  /**
   * cux 二开map集合
   */
  const cuxMap = useMemo(() => {
    let map = {};
    map = remote
      ? remote.process(
          'SSRC_COMPONENTS_OPERATION_RECORD_CONTAINER_OPERATION_DESC_ARR_CUX_MAP',
          map,
          { item }
        )
      : map;
    return map;
  }, [item, remote]);

  const operationDescArr = useMemo(() => {
    // 若修改getProcessOperationAction的参数，请关注下接口查询的地方也有这个方法需要处理
    return getProcessOperationAction(
      item.processOperation,
      item.processSystemCode,
      item.realName,
      item.processOperationMeaning,
      dataType,
      rfTitle,
      rfx,
      item.actionExpandParam,
      {
        secondarySourceCategory: item.secondarySourceCategory,
        processRemark: item.processRemark,
        opener: item.opener,
        item,
        cuxMap,
      }
    );
  }, [remote, cuxMap]);

  // 获取审批状态的字体颜色
  const getStyleColor = (processOperation, processSystemCode, realName) => {
    if (!processSystemCode || processSystemCode === 'SRM') {
      if (['RELEASE_APPROVED', 'CHECK_APPROVED'].includes(processOperation)) {
        return '#47B881';
      } else {
        return '#F56349';
      }
    } else if (processSystemCode === 'OA') {
      if (['RELEASE_APPROVED', 'CHECK_APPROVED'].includes(processOperation)) {
        return realName ? '' : '#47B881';
      } else {
        return realName ? '' : '#F56349';
      }
    }
  };

  // 渲染新的操作记录审批描述
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
            <span className={styles['operation-content-point-word']}>
              {`${item?.realName}（${item?.loginName}）`}
            </span>
            <span>{intl.get('ssrc.common.view.message.finallyApproved').d('最终审批了')}</span>
            <span className={styles['operation-content-point-word']}>
              {`【${intl.get('ssrc.common.view.message.rfx').d('询价单')}】`}
            </span>
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

  let descDom = (
    <>
      <span className={styles['operation-content-point-word']}>
        {getComputedRegExpValue(operationDescArr?.[0], item)}
      </span>
      <span>{getComputedRegExpValue(operationDescArr?.[1], item)}</span>
      <span className={styles['operation-content-point-word']}>{operationDescArr?.[2]}</span>
      <span>{operationDescArr?.[3]}</span>
    </>
  );
  descDom = remote
    ? remote.process(
        'SSRC_COMPONENTS_OPERATION_RECORD_CONTAINER_OPERATION_DESC_OPERATIONDESCARR',
        descDom,
        {
          pageProps: props,
          item,
          styles,
          getComputedRegExpValue,
          operationDescArr,
        }
      )
    : descDom;

  return (
    <div
      className={styles['operation-record-item']}
      key={dataType === 'rf' ? item.rfActionId : item.rfxActionId}
    >
      <div className={styles['operation-record-item-icon']}>
        <Icon
          type={
            dataType === 'rf' && item.processOperation === 'EVALUATE_DELIVER'
              ? 'call_missed_outgoing'
              : dataType === 'rf' && item.processOperation === 'CLOSED'
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
            (dataType === 'rf' &&
            ['RELEASE_APPROVED', 'CHECK_APPROVED', 'RELEASE_REFUSED', 'CHECK_REFUSED'].includes(
              item.processOperation
            ) ? (
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
                  className={styles['operation-content-point-word']}
                >
                  {getComputedRegExpValue(operationDescArr?.[0], item)}
                </span>
                <span>{getComputedRegExpValue(operationDescArr?.[1], item)}</span>
                <span className={styles['operation-content-point-word']}>
                  {operationDescArr?.[2]}
                </span>
                <span>{operationDescArr?.[3]}</span>
                <span>
                  <span
                    style={{
                      color: ['RELEASE_APPROVED', 'CHECK_APPROVED'].includes(item?.processOperation)
                        ? '#47B881'
                        : '#F56349',
                    }}
                  >
                    {operationDescArr?.[4]}
                  </span>
                </span>
              </span>
            ) : (
              descDom
            ))}
          {item.processOperation === 'DOC_DELIVER' && (
            <>
              <span className={styles['operation-content-point-word']}>
                {getComputedRegExpValue(operationDescArr?.[0], item)}
              </span>
              <span>{operationDescArr?.[1]}</span>
              <span>{`${item.deliverFromUserName} (${item.deliverFromUserLoginName}) `}</span>
              <span className={styles['operation-content-point-word']}>
                {operationDescArr?.[2]}
              </span>
              <span>{`${item.deliverToUserName} (${item.deliverToUserLoginName}) `}</span>
            </>
          )}
          {newFlag &&
            ['APPROVE', 'REJECT', 'EXTERNAL_REJECT', 'EXTERNAL_APPROVE'].includes(
              item.processOperation
            ) &&
            renderRfxApprove()}
          {!newFlag && item.processOperation === 'APPROVE' && (
            <>
              <span className={styles['operation-record-item-conent-desc-approve']}>
                <a
                  onClick={() => onViewDetail(item.processType)}
                  className={styles['operation-record-item-conent-desc-approve-text']}
                >
                  {`${intl.get(`ssrc.common.status.approved`).d('工作流审批通过')}`}
                </a>
              </span>
            </>
          )}
          {!newFlag && item.processOperation === 'EXTERNAL_APPROVE' && (
            <>
              <span className={styles['operation-record-item-conent-desc-approve']}>
                <span className={styles['operation-record-item-conent-desc-approve-text']}>
                  {`${intl.get(`ssrc.common.status.externalApproved`).d('外部审批通过')}`}
                </span>
              </span>
            </>
          )}
          {!newFlag && item.processOperation === 'REJECT' && (
            <>
              <span className={styles['operation-record-item-conent-desc-reject']}>
                <a
                  onClick={() => onViewDetail(item.processType)}
                  className={styles['operation-record-item-conent-desc-reject-text']}
                >
                  {`${intl.get(`ssrc.common.status.rejected`).d('工作流审批拒绝')}`}
                </a>
              </span>
            </>
          )}
          {!newFlag && item.processOperation === 'EXTERNAL_REJECT' && (
            <>
              <span className={styles['operation-record-item-conent-desc-reject']}>
                <span className={styles['operation-record-item-conent-desc-reject-text']}>
                  {`${intl.get(`ssrc.common.status.externalReject`).d('外部审批拒绝')}`}
                </span>
              </span>
            </>
          )}
        </div>
        <div className={styles['operation-record-item-conent-remark']}>
          {[
            'ADJUST_TIME',
            'ADD_SUPPLIER',
            'START_QUOTATION',
            'BARGAIN_START',
            'CLOSE',
            'BIDDING_PAUSE',
            'BIDDING_RESUME',
            'ROLL_BACK',
            'EVALUATE_OPENER_CLOSED',
            'CUX_UPGRADE',
            'BIDDING_PROHIBIT_PRICE',
          ].includes(item.processOperation) &&
            processOperationDescMap[item.processOperation] && (
              <>
                <span>{renderOperationDesc(item)}</span>
                <span className={styles['operation-record-item-conent-remark-value']}>
                  {item.processRemark || '-'}
                </span>
              </>
            )}
        </div>
        {!newFlag ? (
          <div className={styles['operation-record-item-conent-remark']}>
            {['SUBMIT'].includes(item.processOperation) &&
              processOperationDescMap[item.processOperation] &&
              ['EXT', 'EXT_ALLOW'].includes(item.resultApproveType) && (
                <>
                  <span>
                    {intl.get('ssrc.common.view.message.externalApprovalNum').d('外部审批单号')}：
                  </span>
                  <span className={styles['operation-record-item-conent-remark-value']}>
                    {item.requestId || '-'}
                  </span>
                </>
              )}
          </div>
        ) : null}
        <span className={styles['operation-record-item-conent-time']}>
          {item.processDate && moment(item.processDate).format(DEFAULT_DATETIME_FORMAT)}
        </span>

        {/* cux */}
        {remote ? (
          remote.process(
            'SSRC_COMPONENTS_OPERATION_RECORD_CONTAINER_OPERATION_CUX_AFTER_TIME_RENDER',
            <></>,
            { item }
          )
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default OperationRecordItem;
