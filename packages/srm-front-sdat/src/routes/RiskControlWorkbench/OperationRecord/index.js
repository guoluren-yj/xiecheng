/* eslint-disable react/no-array-index-key */
/**
 * 操作记录
 */
import React, { useEffect, useState } from 'react';
import { Timeline } from 'choerodon-ui';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import { getResponse } from '@/utils/utils';
import { fetchOperationRecord } from '@/services/riskWorkPlaceService';
import { queryIdpValue } from '@/components/Lov/lov';

import styles from './index.less';

let showMap = {};

export default function OperationRecord(props) {
  const { localRecord, modalType = '', queryProcess } = props;

  const [recordList, setRecordList] = useState([]);
  const [typeMap, setTypeMap] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [abbreviatedText, setAbbreviated] = useState('');

  useEffect(() => {
    queryIdpValue('SDAT.EVENT_LOG_TYPE').then((res) => {
      if (getResponse(res)) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        setTypeMap(obj);
      }
    });

    return () => {
      showMap = {};
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (localRecord.riskEventId) {
      fetchOperationRecord({
        riskEventId: localRecord.riskEventId,
        tenantId: getCurrentOrganizationId(),
        queryProcess: queryProcess ? true : '',
        processAction: queryProcess ? localRecord.processAction : '',
      }).then((res) => {
        if (getResponse(res) && Array.isArray(res) && res.length) {
          setRecordList([...res]);
        }
      });
    }

    const str = getContentStr(localRecord?.eventName ?? '');
    setAbbreviated(str);
  }, [localRecord]);

  const iconMap = {
    EVENT_OPEN: 'finished',
    EVENT_FINISH: 'not_interested', // 关闭
    BLACKLIST_SUBMIT: 'check', // 提交
    BROADCAST_SUBMIT: 'check', // 提交
    BLACKLIST_WITHDRAW: 'reply', // 撤销
    BROADCAST_WITHDRAW: 'reply', // 撤销
    MANUAL_ADD: 'add', // 新建
  };

  const textRange = (str) => {
    const dom = document.createElement('p');
    document.body.appendChild(dom);
    dom.innerHTML = str;
    const isOver = getContentWidth(dom, 850);
    document.body.removeChild(dom);

    return isOver;
  };

  const validShowTooltip = (str, index) => {
    showMap[index] = textRange(str);
    setRefresh(true);
  };

  const hiddenTooltip = (index) => {
    showMap[index] = false;
    setRefresh(true);
  };

  /**
   * 计算dom的长度是否超出
   */
  const getContentWidth = (dom, max) => {
    const range = document.createRange();
    range.setStart(dom, 0);
    range.setEnd(dom, dom.childNodes.length);
    const rect = range.getBoundingClientRect();

    return rect.width > max || rect.height > 20;
  };

  /**
   * 获取指定长度的内容
   * @param {*} str
   * @returns
   */
  const getContentStr = (str = '') => {
    const dom = document.createElement('p');
    document.body.appendChild(dom);

    let end = false;
    let i = 0;
    let label = '';
    while (!end) {
      i++;
      dom.innerHTML = `${str.substring(0, i)}...`;
      const isLarger = getContentWidth(dom, 850);
      label = str;
      if (isLarger) {
        dom.innerHTML = `${str.substring(0, i - 1)}...`;
        label = `${str.substring(0, i - 2)}...`;
        end = true;
      }

      if (i >= str.length) {
        break;
      }
    }

    document.body.removeChild(dom);
    return label;
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
              <Tooltip title={item.eventName} hidden={!showMap[index]}>
                <div
                  id={`sdat-risk-control-record-item-${index}`}
                  className={styles['operation-record-modal-basic']}
                  onMouseEnter={() => validShowTooltip(item.eventName, index)}
                  onMouseLeave={() => hiddenTooltip(index)}
                >
                  <span style={{ color: '#000', fontWeight: '500' }}>{item.personName}</span>
                  <span style={{ color: 'rgba(0,0,0,0.65)', marginLeft: '8px' }}>
                    {typeMap[item.operateType]}
                  </span>
                  【
                  <span
                    style={{
                      color: '#000',
                      fontWeight: '500',
                      marginLeft: '3px',
                    }}
                  >
                    {abbreviatedText || ''}
                  </span>
                  】
                </div>
              </Tooltip>
            </div>
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
        height: modalType === 'withdrawal' ? 'calc(100vh - 205px)' : 'calc(100vh - 155px)',
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
            <div style={{ textAlign: 'center', height: '40px' }}>
              <NoContent style={{ width: '40px', height: '40px' }} />
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
