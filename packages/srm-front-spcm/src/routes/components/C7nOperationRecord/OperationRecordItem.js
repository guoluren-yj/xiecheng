/*
 * @Description:操作记录item
 * @Date: 2022-04-14 16:30:17
 * @Author: yitian.mao@going-link.com
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useMemo, useState, memo } from 'react';
import { Icon } from 'choerodon-ui';
import moment from 'moment';
import { noop, without, concat } from 'lodash';
import intl from 'utils/intl';

import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { getComputedRegExpValue, getProcessOperationAction } from './utils';
import { processTypeCodeIconMap as defaultProcessTypeCodeIconMap } from './constants';

import styles from './index.less';

const approvalListDefault = [
  'WORKFLOW_APPROVED',
  'WORKFLOW_REJECTED',
  'EXTERNAL_APPROVAL_APPROVED',
  'EXTERNAL_APPROVAL_REJECTED',
  'WORKFLOW_APPROVAL_APPROVED',
  'WORKFLOW_APPROVAL_REJECTED',
  'EXPORT_INTERFACE_APPROVED',
  'EXPORT_INTERFACE_REJECTED',
  'TRANSFER',
];

const OperationRecordItem = (props) => {
  const { item, onViewDetail = noop, remote } = props;
  // processTypeCode 取自 SPCM.CONFIG.PC_APPROVAL_METHOD然后拼接APPROVED或REJECTED
  const { approveSequenceCode, processTypeCode, processRemark } = item;
  const [defaultExpandList, setDefaultExpandList] = useState(['STAMPED_BACK']);
  const [processTypeCodeIconMap, setDefaultProcessTypeCodeIconMap] = useState(
    defaultProcessTypeCodeIconMap
  );
  const [expandList, setExpandList] = useState([]);
  const hasDetailLine = useMemo(() => expandList.includes(processTypeCode), [expandList]);
  const approvalList =
    remote?.process('SPCM_OPERATE_DESC_CONTENT_APPROVAL_LIST', approvalListDefault, {
      props,
    }) || approvalListDefault;

  const operationDescArr = useMemo(() => {
    return remote
      ? remote.process(
          'SPCM_OPERATE_DESC_LIST',
          getProcessOperationAction(processTypeCode, item.processTypeMeaning, processRemark),
          {
            ...props,
            expandList,
            setExpandList,
            defaultExpandList,
            setDefaultExpandList,
            processTypeCodeIconMap,
            setDefaultProcessTypeCodeIconMap,
          }
        )
      : getProcessOperationAction(processTypeCode, item.processTypeMeaning, processRemark);
  }, []);

  const approvalMap = {
    WORKFLOW_APPROVED: intl.get(`spcm.common.status.approved`).d('工作流审批通过'),
    WORKFLOW_REJECTED: intl.get(`spcm.common.status.rejected`).d('工作流审批拒绝'),
    EXTERNAL_APPROVAL_APPROVED: intl.get(`spcm.common.status.externalApproved`).d('外部审批通过'),
    EXTERNAL_APPROVAL_REJECTED: intl.get(`spcm.common.status.externalReject`).d('外部审批拒绝'),
    WORKFLOW_APPROVAL_APPROVED: intl
      .get(`spcm.common.status.uniteWApproved`)
      .d('工作流审批（统一对接）通过'),
    WORKFLOW_APPROVAL_REJECTED: intl
      .get(`spcm.common.status.uniteWRejected`)
      .d('工作流审批（统一对接）拒绝'),
    EXPORT_INTERFACE_APPROVED: intl
      .get(`spcm.common.status.uniteEApproved`)
      .d('外部系统审批（统一对接）通过'),
    EXPORT_INTERFACE_REJECTED: intl
      .get(`spcm.common.status.uniteERejected`)
      .d('外部系统审批（统一对接）拒绝'),
  };

  const renderApproval = () => {
    const type = processTypeCode.slice(-8).toLowerCase();
    return (
      Object.keys(approvalMap).includes(processTypeCode) && (
        <span className={styles[`operation-record-item-conent-desc-${type}`]}>
          <a
            onClick={() => onViewDetail(approveSequenceCode)}
            className={styles[`operation-record-item-conent-desc-${type}-text`]}
          >
            {approvalMap[processTypeCode]}
          </a>
        </span>
      )
    );
  };

  const renderRemark = () => {
    return (
      hasDetailLine && (
        <div className={styles['operation-record-item-conent-remark']}>
          <span>{intl.get('spcm.purchaseContractView.pb.returnCause').d('退回原因')}</span>： 【
          {processRemark}】
        </div>
      )
    );
  };

  const renderTransfer = () => {
    if (processTypeCode === 'TRANSFER') {
      // 不要使用零宽断言正则：/(?<=【)(.+?)(?=】)/g，safari老版本不支持零宽向后断言?<=
      const list = item?.processRemark?.match(/【(.+?)】/g);
      return (
        <>
          <span className={styles['operation-record-item-conent-desc-name']}>
            {getComputedRegExpValue(operationDescArr?.[0], item)}
          </span>
          <span>{operationDescArr?.[1]} </span>
          <span>{list?.[0]} </span>
          <span className={styles['operation-record-item-conent-desc-title']}>
            {operationDescArr?.[2]}
          </span>
          <span> {list?.[1]}</span>
        </>
      );
    }
  };

  return (
    <div className={styles['operation-record-item']} key={item.pcActionId}>
      <div className={styles['operation-record-item-icon']}>
        <Icon type={processTypeCodeIconMap?.[processTypeCode] || processTypeCodeIconMap?.DEFAULT} />
      </div>
      <div className={styles['operation-record-item-conent']}>
        <div className={styles['operation-record-item-conent-desc']}>
          {!approvalList.includes(processTypeCode) && (
            <>
              <span className={styles['operation-record-item-conent-desc-name']}>
                {getComputedRegExpValue(operationDescArr?.[0], item)}
              </span>
              {item.supplierFlag === '1' && (
                <span className={styles['operation-record-supplier-flag']}>
                  {intl.get('spcm.workspace.view.message.supplierFlag').d('供')}
                </span>
              )}
              <span>{getComputedRegExpValue(operationDescArr?.[1], item)}</span>
              <span className={styles['operation-record-item-conent-desc-title']}>
                {operationDescArr?.[2]}
              </span>
              {operationDescArr?.[3] && <span>{`, ${operationDescArr?.[3]}: `}</span>}
              {operationDescArr?.[4] && <span>{operationDescArr?.[4]}</span>}
            </>
          )}
          {renderTransfer()}
          {[
            'FUNCTIONAL_APPROVED',
            'FUNCTIONAL_REJECTED',
            'FUNCTIONAL_EFFECTED_APPROVED',
            'FUNCTIONAL_EFFECTED_REJECTED',
          ].includes(processTypeCode) && (
            <>
              <span>
                {`, ${intl.get('spcm.workspace.view.message.approvalResult').d('审批结果为')}: `}
              </span>
              {['FUNCTIONAL_APPROVED', 'FUNCTIONAL_EFFECTED_APPROVED'].includes(processTypeCode) ? (
                <span className={styles['operation-record-item-conent-desc-approved']}>
                  【{intl.get(`spcm.common.view.message.operationRecord.agree`).d('同意')}】
                </span>
              ) : (
                <span className={styles['operation-record-item-conent-desc-rejected']}>
                  【{intl.get(`spcm.common.view.message.operationRecord.approved`).d('拒绝')}】
                </span>
              )}
              <span>
                {`, ${intl.get('spcm.workspace.view.message.approvalOpinion').d('审批意见')}: `}【
                {processRemark}】
              </span>
            </>
          )}
          {renderApproval()}
          {defaultExpandList?.includes(processTypeCode) && (
            <Icon
              type={hasDetailLine ? 'expand_less' : 'expand_more'}
              onClick={() => {
                const newList = hasDetailLine
                  ? without(expandList, processTypeCode)
                  : concat(expandList, processTypeCode);
                setExpandList(newList);
              }}
            />
          )}
          {remote?.render('SPCM_OPERATE_DESC_CONTENT_RENDER', null, {
            props,
          })}
        </div>
        {remote
          ? remote.render('SPCM_OPERATE_DESC_CONTENT_REMARK', renderRemark(), {
              props,
              hasDetailLine,
            })
          : renderRemark()}
        {!approvalList.includes(processTypeCode) && (
          <span className={styles['operation-record-item-conent-time']}>
            {item.processedDate && moment(item.processedDate).format(DEFAULT_DATETIME_FORMAT)}
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(OperationRecordItem);
