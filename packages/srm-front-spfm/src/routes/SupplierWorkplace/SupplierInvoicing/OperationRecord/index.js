/* eslint-disable react/no-array-index-key */
/**
 * 操作记录
 */
import React, { useEffect, useState } from 'react';
import { Timeline } from 'choerodon-ui';
import { Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import NoContent from '@/assets/no_result.svg';
import { fetchOperationRecord } from '@/services/supplier/supplierInvoicingService';
import { queryIdpValue } from 'services/api';

import styles from './index.less';

export default function OperationRecord(props) {
  const { localRecord } = props;

  const [recordList, setRecordList] = useState([]);
  const [typeMap, setTypeMap] = useState({});

  useEffect(() => {
    queryIdpValue('SPFM.TICKET_LOG_TYPE').then((res) => {
      if (getResponse(res)) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        setTypeMap(obj);
      }
    });
  }, []);

  useEffect(() => {
    if (localRecord && localRecord.get('supplierPaymentId')) {
      fetchOperationRecord({
        supplierPaymentId: localRecord?.get('supplierPaymentId') ?? '',
      }).then((res) => {
        if (getResponse(res) && Array.isArray(res) && res.length) {
          setRecordList([...res]);
        }
      });
    }
  }, [localRecord]);

  const iconMap = {
    INVOICE_TICKET: 'add', // 已开票
    APPROVAL_REFUSED: 'not_interested', // 审批拒绝
    APPROVAL_PASSED: 'finished', // 审批通过
    WITHDRAWN: 'reply', // 已撤回
    // MANUAL_ADD: 'check', // 新建
  };

  const drawRecordItem = (list) => {
    return (list || []).map((item, index) => {
      return (
        <>
          <Timeline.Item key={index} color="#E5E5E5">
            <div style={{ lineHeight: '18px', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ lineHeight: '16px', margin: '0 14px 0 10px' }}>
                <Icon type={iconMap[item.operateType]} style={{ fontSize: '14px' }} />
              </span>
              <div className={styles['operation-record-modal-basic']}>
                <span style={{ color: '#000', fontWeight: '500' }}>{item.userName}</span>
                <span style={{ color: 'rgba(0,0,0,0.65)', marginLeft: '8px' }}>
                  {typeMap[item.operateType]}
                </span>
              </div>
            </div>
            {item.comment ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(0,0,0,0.45)',
                  marginTop: '8px',
                  paddingLeft: '40px',
                }}
              >
                <div style={{ color: '#000', fontWeight: '500' }}>
                  {intl.get('hzero.common.view.message.approveMsg').d('审批意见')}:
                </div>
                <div style={{ lineHeight: '18px', marginLeft: '8px' }}>{item.comment}</div>
              </div>
            ) : null}
            <div
              style={{
                color: 'rgba(0,0,0,0.45)',
                lineHeight: '18px',
                marginTop: '8px',
                paddingLeft: '40px',
              }}
            >
              {item.creationDate}
            </div>
          </Timeline.Item>
        </>
      );
    });
  };

  return (
    <div
      className={styles['operation-record-modal-basic-panel']}
      style={{
        paddingTop: '10px',
        height: 'calc(100vh - 205px)',
        overflowY: 'scroll',
        overflowX: 'hidden',
      }}
    >
      {recordList.length ? (
        <Timeline>{drawRecordItem(recordList)}</Timeline>
      ) : (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div>
            <div style={{ textAlign: 'center', height: '60px', width: '60px' }}>
              <img src={NoContent} alt="" />
            </div>
            <div className={styles['chart-no-content-message']}>
              {intl.get('hzero.common.message.data.none').d('暂无数据')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
