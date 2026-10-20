/**
 * 操作记录item
 */
import React, { Fragment, useState } from 'react';
import { Icon } from 'choerodon-ui';
import moment from 'moment';
import { noop, isNil } from 'lodash';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { processOperationIconMap } from './OperationStatus';

import Styles from './index.less';

const OperationRecordItem = (props) => {
  const { item, onViewDetail = noop } = props;
  const [isShow, setIsShow] = useState(false);
  const {
    changeTableName,
    processTypeCode,
    processTypeMeaning,
    changeFieldName,
    processUserName,
    processUserLoginName,
    purOrSupCode,
    processRemark,
    processedDate,
    displayLineNum,
    itemCode,
    itemName,
    // oldValue,
    // newValue,
    displayLineLocationNum,
    children = [],
  } = item;
  const showCancelClosedRecordFlag =
    ['CANCEL_CLOSE_CONFIRM'].includes(processTypeCode) && changeFieldName;
  const nameClassName = Styles['operation-record-item-content-changes-name'];
  const itemClassName = Styles['operation-record-item-content-changes-oldvalue'];

  const handleToggle = () => {
    setIsShow(!isShow);
  };
  const hasChildren =
    ['SUBMIT', 'UPDATE', 'CHANGE', 'ROLLBACK', 'TRANSFER'].includes(processTypeCode) ||
    showCancelClosedRecordFlag;
  const hasDetailLine =
    processTypeCode !== 'APV_ACCESS_FINAL' &&
    (['SUBMITTED_CANCEL', 'SUBMITTED_CLOSE', 'CANCEL', 'CLOSE'].includes(processTypeCode) ||
      processRemark);

  return (
    <div className={Styles['operation-record-item']}>
      <div className={Styles['operation-record-item-icon']}>
        <Icon type={processOperationIconMap[processTypeCode] || 'check'} />
      </div>

      <div className={Styles['operation-record-item-content']}>
        <div className={Styles['operation-record-item-content-desc']}>
          {['APV_ACCESS_WFL'].includes(processTypeCode) && (
            <>
              <span>
                <a
                  onClick={onViewDetail}
                  className={Styles['operation-record-item-content-desc-adopt']}
                >
                  {`${intl.get(`slod.orderExecution.status.adopt`).d('工作流审批通过')}`}
                </a>
              </span>
            </>
          )}
          {['APV_REJECT_WFL'].includes(processTypeCode) && (
            <>
              <span>
                <a
                  onClick={onViewDetail}
                  className={Styles['operation-record-item-content-desc-reject']}
                >
                  {`${intl.get(`sodr.workspace.status.reject`).d('工作流审批拒绝')}`}
                </a>
              </span>
            </>
          )}
          {!['APV_ACCESS_WFL', 'APV_REJECT_WFL'].includes(processTypeCode) && (
            <>
              {intl
                .getHTML('sodr.workspace.model.operationRecord.operationOrder', {
                  style: `"display: ${purOrSupCode === 'SUP' ? 'inline-block' : 'none'}"`,
                  supplyText: intl.get('sodr.workspace.model.supplier').d('供'),
                  supplyStyle: Styles['operation-record-item-content-desc-supply'],
                  nameStyle: Styles['operation-record-item-content-desc-name'],
                  meaningStyle: Styles['operation-record-item-content-desc-meaning'],
                  orderStyle: Styles['operation-record-item-content-desc-order'],
                  processUserName,
                  processUserLoginName,
                  processTypeMeaning,
                })
                .d(
                  `<span>
                    <span className={nameStyle}>
                      {processUserName}({processUserLoginName})
                    </span>
                    <span style={style} className={supplyStyle}>
                      {supplyText}
                    </span>
                    <span className={meaningStyle}>{processTypeMeaning}了</span>
                    <span className={orderStyle}>【订单】</span>
                  </span>`
                )}
              {['APV_REJECT_FUN', 'APV_ACCESS_FUN', 'APV_ACCESS_FINAL'].includes(
                processTypeCode
              ) && (
                <>
                  <span>
                    {`, ${intl
                      .get('slod.orderExecution.view.message.approvalResult')
                      .d('审批结果为')}: `}
                  </span>
                  {['APV_ACCESS_FUN', 'APV_ACCESS_FINAL'].includes(processTypeCode) ? (
                    <span className={Styles['operation-record-item-content-desc-agree']}>
                      【{intl.get(`slod.orderExecution.model.operationRecord.agree`).d('同意')}】
                    </span>
                  ) : (
                    <span className={Styles['operation-record-item-content-desc-approve']}>
                      【{intl.get(`slod.orderExecution.model.operationRecord.approved`).d('拒绝')}】
                    </span>
                  )}
                </>
              )}
              {(hasChildren || hasDetailLine) && (
                <Icon type={isShow ? 'expand_less' : 'expand_more'} onClick={handleToggle} />
              )}
            </>
          )}
        </div>
        {hasChildren &&
          isShow &&
          children.map((i) => {
            const {
              changeTableName: lineChangeTableName,
              processUserName: lineProcessUserName,
              changeFieldNameMeaning,
              oldValue: lineOldValue,
              newValue: lineNewValue,
              displayLineNum: lineDisplayLineNum,
              displayLineLocationNum: lineDisplayLineLocationNum,
              itemCode: lineItemCode,
              itemName: lineItemName,
              orderSeq, // BOM行号
            } = i;
            return (
              (!isNil(lineOldValue) || !isNil(lineNewValue)) && (
                <div className={Styles['operation-record-item-content-changes']}>
                  {lineChangeTableName === 'SODR_PO_HEADER' ? (
                    <Fragment>
                      <span className={Styles['operation-record-item-content-changes-name']}>
                        {lineProcessUserName}
                      </span>
                      <span>
                        {intl.get('slod.orderExecution.model.operationRecord.take').d('将')}
                      </span>
                      <span className={Styles['operation-record-item-content-changes-meaning']}>
                        【{changeFieldNameMeaning}】
                      </span>
                      <span>
                        {intl.get('slod.orderExecution.model.operationRecord.cause').d('由')}
                      </span>
                      <span className={Styles['operation-record-item-content-changes-oldvalue']}>
                        【{lineOldValue}】
                      </span>
                      <span>
                        {intl.get('slod.orderExecution.model.operationRecord.change').d('改变为')}
                      </span>
                      <span className={Styles['operation-record-item-content-changes-newvalue']}>
                        【{lineNewValue}】
                      </span>
                    </Fragment>
                  ) : lineChangeTableName === 'SODR_PO_ITEM_BOM' ? (
                    intl
                      .getHTML('sodr.workspace.model.operationRecord.bomLineChangeMessage', {
                        processUserName: lineProcessUserName,
                        changeFieldNameMeaning,
                        displayLineNum: lineDisplayLineNum,
                        displayLineLocationNum: lineDisplayLineLocationNum,
                        itemCode: lineItemCode,
                        itemName: lineItemName,
                        oldValue: lineOldValue,
                        newValue: lineNewValue,
                        nameClassName,
                        itemClassName,
                        orderSeq,
                      })
                      .d(
                        <span>
                          <span className={nameClassName}>{lineProcessUserName}</span>将
                          <span style={{ marginLeft: 5 }}>【第{lineDisplayLineNum}行】</span>
                          <span>【发运行{lineDisplayLineLocationNum}】</span>
                          <span>【BOM行{orderSeq}】</span>
                          <span>【{lineItemCode}】</span>
                          <span style={{ marginRight: 7 }}>【{lineItemName}】</span>中
                          <span className={itemClassName}>【{changeFieldNameMeaning}】</span>
                          字段由
                          <span className={itemClassName}>
                            【{lineOldValue}】改变为
                            <span className={itemClassName}>【{lineNewValue}】</span>
                          </span>
                        </span>
                      )
                  ) : (
                    intl
                      .getHTML('slod.orderExecution.model.operationRecord.lineChangeMessage', {
                        processUserName: lineProcessUserName,
                        changeFieldNameMeaning,
                        displayLineNum: lineDisplayLineNum,
                        displayLineLocationNum: lineDisplayLineLocationNum,
                        itemCode: lineItemCode,
                        itemName: lineItemName,
                        oldValue: lineOldValue,
                        newValue: lineNewValue,
                        nameClassName,
                        itemClassName,
                      })
                      .d(
                        <span>
                          <span className={nameClassName}>{lineProcessUserName}</span>将
                          <span style={{ marginLeft: 5 }}>【第{lineDisplayLineNum}行】</span>
                          <span>【发运行{lineDisplayLineLocationNum}】</span>
                          <span>【{lineItemCode}】</span>
                          <span style={{ marginRight: 7 }}>【{lineItemName}】</span>中
                          <span className={itemClassName}>【{changeFieldNameMeaning}】</span>
                          字段由
                          <span className={itemClassName}>
                            【{lineOldValue}】改变为
                            <span className={itemClassName}>【{lineNewValue}】</span>
                          </span>
                        </span>
                      )
                  )}
                </div>
              )
            );
          })}
        {hasDetailLine && isShow && (
          <div className={Styles['operation-record-item-content-remark']}>
            {['SUBMITTED_CANCEL', 'SUBMITTED_CLOSE'].includes(processTypeCode) ||
            (['CANCEL', 'CLOSE'].includes(processTypeCode) &&
              changeTableName === 'SODR_PO_HEADER') ? (
                <Fragment>
                  <span>
                    {['SUBMITTED_CANCEL', 'CANCEL'].includes(processTypeCode)
                    ? intl.get(`sodr.workspace.model.common.cancellationReason`).d('取消原因')
                    : intl.get(`sodr.workspace.model.common.closingReason`).d('关闭原因')}
                  </span>
                ： 【{processRemark}】
                </Fragment>
            ) : ['CANCEL', 'CLOSE'].includes(processTypeCode) ? (
              processTypeCode === 'CANCEL' ? (
                intl
                  .getHTML('slod.orderExecution.model.operationRecord.lineCancelMessage', {
                    nameClassName,
                    processUserName,
                    displayLineNum,
                    displayLineLocationNum,
                    itemCode,
                    itemName,
                    processRemark,
                  })
                  .d(
                    <span>
                      <span className={nameClassName}>{processUserName}</span>
                      取消了
                      <span style={{ marginLeft: 5 }}>【第{displayLineNum}行】</span>
                      <span>【发运行{displayLineLocationNum}】</span>
                      <span>【{itemCode}】</span>
                      <span style={{ marginRight: 7 }}>【{itemName}】</span>，取消原因为
                      <span>【{processRemark}】</span>
                    </span>
                  )
              ) : (
                intl
                  .getHTML('slod.orderExecution.model.operationRecord.lineCloseMessage', {
                    nameClassName,
                    processUserName,
                    displayLineNum,
                    displayLineLocationNum,
                    itemCode,
                    itemName,
                    processRemark,
                  })
                  .d(
                    <span>
                      <span className={nameClassName}>{processUserName}</span>
                      关闭了
                      <span style={{ marginLeft: 5 }}>【第{displayLineNum}行】</span>
                      <span>【发运行{displayLineLocationNum}】</span>
                      <span>【{itemCode}】</span>
                      <span style={{ marginRight: 7 }}>【{itemName}】</span>，关闭原因为
                      <span>【{processRemark}】</span>
                    </span>
                  )
              )
            ) : (
              <Fragment>
                <span>{processUserName}</span>
                <span className={Styles['operation-record-item-content-remark-edit']}>
                  {intl.get('slod.orderExecution.model.operationRecord.edited').d('编辑了')}
                </span>
                【{processRemark}】
              </Fragment>
            )}
          </div>
        )}
        <span className={Styles['operation-record-item-content-time']}>
          {processedDate && moment(processedDate).format(DEFAULT_DATETIME_FORMAT)}
        </span>
      </div>
    </div>
  );
};

export default OperationRecordItem;
