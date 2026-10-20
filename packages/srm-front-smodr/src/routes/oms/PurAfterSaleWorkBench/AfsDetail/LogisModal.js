import React, { useEffect, useState } from 'react';
import { Icon, Spin, Timeline } from 'choerodon-ui';
import classNames from 'classnames';

import HeadLine from '@/routes/components/HeadLine';
import intl from 'utils/intl';
import { fetchLogis } from '@/services/oms/logisticsService';

import { ReactComponent as EmptyLog } from '@/assets/emptyLog.svg';
import styles from './logis.less';

export default function LogisModal(props) {
  const [orderTrack, setOrderTrack] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { recordData = {}, type } = props;
  const logisData = recordData?.afterSaleWaybillList.filter((i) => i.logisticsType === type);
  useEffect(() => {
    fetchLogisData();
  }, []);

  async function fetchLogisData() {
    setLoading(true);
    const result = await fetchLogis({
      orderId: recordData?.orderId,
      orderEntryId: recordData?.orderEntryId,
      logisticsCompanyCode: logisData?.[0]?.logisticsCompanyCode,
      logisticsNum: logisData?.[0]?.logisticsNum,
      ecConsignmentCode: logisData?.[0]?.ecConsignmentCode,
      logisticsType: logisData?.[0]?.logisticsType,
    });
    setOrderTrack(result?.[0]?.orderTrack?.reverse());
    if (result.failed) {
      setMessage(result?.message);
    }
    setLoading(false);
  }
  return (
    <div>
      <HeadLine title={intl.get('smodr.common.view.title.baseInfo').d('基础信息')} />
      <div style={{ display: 'flex', marginBottom: '32px' }}>
        <div style={{ width: 224, marginRight: 16 }}>
          <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: '4px' }}>
            {intl.get('smodr.common.view.logistics.company').d('物流公司')}
          </div>
          <div>{logisData?.[0]?.logisticsCompanyName}</div>
        </div>
        <div>
          <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: '4px' }}>
            {intl.get('smodr.afterSaleManage.model.logisticsNum').d('快递单号')}
          </div>
          <div>{logisData?.[0]?.logisticsNum}</div>
        </div>
      </div>
      <HeadLine
        title={intl.get('smodr.common.view.logisticsInfo').d('物流信息')}
        style={{ marginBottom: '16px' }}
      />
      <Spin spinning={loading}>
        {orderTrack?.length > 0 ? (
          <div className={styles['containter-info']} style={{ border: '1px solid #F2F2F2', borderRadius: '2px' }}>
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.03)',
                display: 'flex',
                padding: '8px 16px',
                justifyContent: 'space-between',
                borderBottom: '1px solid #F2F2F2',
              }}
            >
              <div>
                {intl.get('smodr.common.view.lastTimeUpdate').d('最后一次更新时间')}：
                {orderTrack?.[0]?.operateTime}
              </div>
              <div
                className='fresh'
                style={{ cursor: 'pointer', fontWeight: 600 }}
                onClick={fetchLogisData}
              >
                <Icon style={{ fontSize: 14, marginRight: 5 }} type="refresh" />
                {intl.get('hzero.common.button.refresh').d('刷新')}
              </div>
            </div>
            <div className={styles['content-info']} style={{ maxHeight: window.innerHeight - 400 }}>
              <div>
                <Timeline>
                  {orderTrack.map((item, index) => {
                    return (
                      <div className="time-line" style={{ display: 'flex' }}>
                        <span className="logistics-time">
                          {orderTrack[index]?.operateTime?.split(' ')[0] !==
                            orderTrack[index - 1]?.operateTime?.split(' ')[0] && (
                              <span>{item.operateTime?.split(' ')[0]}</span>
                            )}
                          <span style={{ marginLeft: 8 }}>{item.operateTime?.split(' ')[1]}</span>
                        </span>
                        <Timeline.Item
                          className={classNames({
                            'logistics-desc': true,
                            'fisrt-circle': index === 0,
                            'c7n-timeline-item-last': index + 1 === orderTrack.length,
                          })}
                        >
                          {item.content}
                        </Timeline.Item>
                      </div>
                    );
                  })}
                </Timeline>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles['container-empty']} style={{ height: 'calc(100vh - 302px)', minHeight: '195px', overflow: 'hidden' }}>
            <div className='img-bg'>
              <p>
                <span className={styles['empty-log']}>
                  <EmptyLog />
                </span>
                <p style={{ marginTop: '16px' }}>{intl.get('smodr.common.view.logisticsInfoTip').d('尚未开通物流查询服务或服务已失效，请自行查询')}</p>
              </p>
            </div>
          </div>
        )}
      </Spin>
    </div>
  );
}
