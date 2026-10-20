import React, { useEffect, useState } from 'react';
import { Timeline, Icon } from 'choerodon-ui';

import { getResponse } from 'hzero-front/lib/utils/utils';
import { fetchEcRecord } from '@/services/oms/applyWorkBenchService';
import intl from 'utils/intl';

import { dateTimeRender } from 'hzero-front/lib/utils/renderer';
import styles from './operation.less';

export default function OperationRecord(props) {
  const [data, setData] = useState([]);
  const [flagObj, setFlagObj] = useState({});
  const { requestId, goBack = e => e } = props;
  async function fetchData() {
    const res = getResponse(await fetchEcRecord({ requestId }));
    if (res) {
      const batchNoList = res.map(i => i.batchNo);
      const newRes = res.filter((i, index) => batchNoList.indexOf(i.batchNo) === index);
      const newData = [];
      const initFlag = {};
      newRes.forEach(i => {
        const parent = res.filter(l => l.batchNo === i.batchNo);
        newData.push(parent);
      });
      newData.forEach(i => {
        if (i.length > 1) {
          initFlag[i[0].batchNo] = false;
        }
      });
      setData(newData);
      setFlagObj(initFlag);
    }
  }
  useEffect(() => {
    fetchData();
  }, [requestId]);
  const typeRemark = (obj) => {
    switch (obj.operationType) {
      case 'CANCEL':
        return intl.get('smodr.apply.view.cancelResult').d('取消原因');
      case 'RETURNED':
        return intl.get('smodr.apply.view.refundResult').d('退回原因');
      case 'WITHDRAW':
        return intl.get('smodr.apply.view.withdrawResult').d('撤回原因');
      case 'CANCEL_FAILED':
        return intl.get('smodr.apply.view.failres').d('失败原因');
      case 'WORKFLOW_APPROVAL_REJECTED':
        return intl.get('smodr.apply.view.refuseRe').d('拒绝原因');
      default:
        break;
    }
  };
  const lineColor = (item) => {
    if (['CANCEL_FAILED', 'CONVERSION_FAILED', 'EXTERNAL_APPROVED_REJECTED', 'WORKFLOW_APPROVAL_REJECTED'].includes(item.operationType)) {
      return 'red';
    } else if (['CONVERSION', 'APPROVED', 'WORKFLOW_APPROVED'].includes(item.operationType)) {
      return 'green';
    } else {
      return '#E5E7EC ';
    }
  };
  // 记录icon
  const lineIcon = (item) => {
    if (item.operationType === 'UPDATE') {
      return 'mode_edit';
    }
    else if (item.operationType === 'CREATED') {
      return 'add';
    } else if (['RETURNED', 'WITHDRAW'].includes(item.operationType)) {
      return 'reply';
    } else if (item.operationType === 'SUBMITED') {
      return 'done';
    } else if (['CANCEL', 'CONVERSION_FAILED', 'CLOSE'].includes(item.operationType)) {
      return 'cancel';
    } else if (['APPROVED', 'EXTERNAL_APPROVED_REJECTED', 'WORKFLOW_APPROVAL_REJECTED', 'WORKFLOW_APPROVED'].includes(item.operationType)) {
      return 'authorize';
    } else if (['CONVERTING'].includes(item.operationType)) {
      return 'assignment';
    } else {
      return 'check_circle';
    }
  };
  const resultType = (i) => {
    switch (i.operationType) {
      case 'CONVERSION':
        return (
          <span>{intl.get('smodr.apply.view.conversion').d('转单结果为')}：<span style={{ color: '#3AB545' }}>【{intl.get('smodr.apply.view.conversionSuccess').d('转单成功')}】</span></span>
        );
      case 'CONVERTING':
        return (
          <span>{intl.get('smodr.apply.view.converting').d('执行结果为')}：<span>【{intl.get('smodr.apply.view.executing').d('执行中')}】</span></span>
        );
      case 'CONVERSION_FAILED':
        return (
          <span>{intl.get('smodr.apply.view.conversion').d('转单结果为')}：
            <span style={{ color: '#F25535' }}>【{intl.get('smodr.apply.view.conversionFail').d('转单失败')}】</span>，
            <span style={{ color: '#F25535' }}>{intl.get('smodr.apply.view.failres').d('失败原因')}：{i.operationRemark}</span>
          </span>
        );
      case 'CANCEL':
        return (
          <span>{intl.get('smodr.apply.view.cancelNum').d('取消数量')}：【{i.operationQuantity}】</span>
        );
      case 'CLOSE':
        return (
          <span>{intl.get('smodr.apply.view.closeNum').d('关闭数量')}：【{i.operationQuantity}】</span>
        );
      default:
        break;
    }
  };
  const handleCheck = (i) => {
    setFlagObj({ ...flagObj, [i.batchNo]: !flagObj[i.batchNo] });
  };
  return (
    <div className={styles['record-container']}>
      {data.length > 0 && (
        <Timeline>
          {
            data.map((item) => {
              const xitongFlag = item[0].userId === -1;
              const quxiao = <div>，{intl.get('smodr.apply.view.cancelRes').d('取消结果为')}：<span style={{ color: '#F25535', fontWeight: 500 }}>【{intl.get('smodr.apply.view.cancelFail').d('取消失败')}】</span></div>;
              const shenpi = <div>，{intl.get('smodr.apply.view.approveRes').d('审批结果为')}：<span style={{ color: '#3AB545', fontWeight: 500 }}>【{intl.get('smodr.apply.view.approved').d('审批通过')}】</span></div>;
              const shenpiRefuse = <div>，{intl.get('smodr.apply.view.approveRes').d('审批结果为')}：<span style={{ color: '#F25535', fontWeight: 500 }}>【{intl.get('smodr.apply.view.approvedRefuse').d('审批拒绝')}】</span></div>;
              return (
                <Timeline.Item color={lineColor(item[0])}>
                  <div className='record-item'>
                    <div className='item-pic'><Icon type={lineIcon(item[0])} /></div>
                    <div className='item-box'>
                      <div className='item-content'>
                        {
                          ['WORKFLOW_APPROVAL_REJECTED', 'WORKFLOW_APPROVED'].includes(item[0].operationType)
                            ? (
                              <div
                                style={{
                                  cursor: 'pointer',
                                  color: `${item[0].operationType === 'WORKFLOW_APPROVED' ? '#47B881' : '#F56649'}`,
                                }}
                                className='label-behavior'
                                onClick={goBack}
                              >
                                {item[0].processTypeCodeMeaning}
                              </div>
                            )
                            : (
                              <>
                                <div className='label-rough'>{item[0].userName}{xitongFlag ? '' : `（${item[0].userId}）`}</div>
                                {
                                  ['CONVERSION', 'CONVERSION_FAILED'].includes(item[0].operationType)
                                    ? (
                                      <div style={{ color: '#4E5769' }}>{intl.get('smodr.apply.view.doneConversion').d('进行了申请转单')}</div>
                                    )
                                    : (
                                      <>
                                        <div className='label-behavior'>{item[0].processTypeCodeMeaning}</div>
                                        <div className='label-rough'>【{intl.get('smodr.apply.view.mallApply').d('商城申请')}】</div>
                                      </>
                                    )
                                }
                              </>
                            )
                        }
                        {!item[0].lineNum && (
                          <div>{item[0].operationType === 'CANCEL_FAILED'
                            ? quxiao : item[0].operationType === 'APPROVED'
                              ? shenpi : item[0].operationType === 'EXTERNAL_APPROVAL_REJECTED'
                                ? shenpiRefuse : null}
                          </div>
                        )}
                        {
                          // 更新无lineNum也会有子操作 取消只有行取消也就有lineNum展示子操作 转单/执行看是否有子操作
                          item.length > 0 && (["CONVERSION", "CONVERTING", 'UPDATE'].includes(item[0].operationType) || (item[0].operationType === "CANCEL" && item[0].lineNum) )
                          && (
                            <Icon
                              type={flagObj[item[0].batchNo]
                                ? 'expand_less'
                                : 'expand_more'}
                              onClick={() => handleCheck(item[0])}
                            />
                          )
                        }
                      </div>
                      {/* 记录动作原因 */}
                      {item[0].operationRemark && !['CONVERSION', 'CONVERSION_FAILED', 'WORKFLOW_APPROVAL_REJECTED'].includes(item[0].operationType) && (
                        <div
                          className='item-remark'
                          style={{ color: `${item[0].operationType === 'CANCEL_FAILED' ? '#E64322' : '#4E5769'}` }}
                        >
                          {(typeRemark(item[0]))}：{item[0].operationRemark}
                        </div>
                      )}
                      {
                        item.length > 0 && flagObj[item[0].batchNo] && (
                          <div className='item-detail'>
                            {item.map(i =>
                              // 更新区分了头行操作的展示
                              !['UPDATE'].includes(i.operationType) ? (
                                <div className='label-detail'>
                                  {i.userName}{xitongFlag ? '' : `（${i.userId}）`}
                                  <span className='gap'>{i.processTypeCodeMeaning}</span>
                                    【{i.lineNum}】
                                    【{i.skuName}】
                                  {resultType(i)}
                                </div>
                              ) :
                              // 基本信息改动
                              !i.lineNum ? (
                                <div className='label-detail'>
                                  {i.userName}{xitongFlag ? '' : `（${i.userId}）`}
                                  <span className='gap'>{intl.get('smodr.apply.view.for').d('将')}</span>
                                  【{i.changeFieldNameMeaning}】
                                  <span className='gap'>{intl.get('smodr.apply.view.from').d('由')}</span>
                                  【{i.oldValueMeaning}】
                                  <span className='gap'>{intl.get('smodr.apply.view.to').d('改为')}</span>
                                  【{i.newValueMeaning}】
                                </div>
                              ) :
                                // 商品行信息改动
                                (
                                  <div className='label-detail'>
                                    {i.userName}{xitongFlag ? '' : `（${i.userId}）`}
                                    <span className='gap'>{intl.get('smodr.apply.view.for').d('将')}</span>
                                    【{i.lineNum}】
                                    <span className='gap'>{intl.get('smodr.apply.view.in').d('中')}</span>
                                    【{i.changeFieldNameMeaning}】
                                    <span className='gap'>{intl.get('smodr.apply.view.from').d('由')}</span>
                                    【{i.oldValueMeaning}】
                                    <span className='gap'>{intl.get('smodr.apply.view.to').d('改为')}</span>
                                    【{i.newValueMeaning}】
                                    {resultType(i)}
                                  </div>
                                ))}
                          </div>
                        )
                      }
                      <div className='item-time'>{dateTimeRender(item[0].operationTime)}</div>
                    </div>
                  </div>
                </Timeline.Item>
              );
            })
          }
        </Timeline>
      )}
    </div>
  );
}
