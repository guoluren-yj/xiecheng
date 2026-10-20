import React, { useCallback } from 'react';
import { Timeline, Icon, Spin } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Form, Output, useDataSet } from 'choerodon-ui/pro';

import classNames from 'classnames';
import intl from 'utils/intl';

import { logisticBasicDS } from '@/stores/PurchaseSettlePoolDS';
import style from './index.less';

const LogisticLine = observer((props) => {
  const { data } = props;
  return data?.length > 0 ? (
    <div className="content-info" style={{ maxHeight: window.innerHeight - 400 }}>
      <div>
        <Timeline>
          {data.map((item, index) => {
            return (
              <div className="time-line">
                <span className="logistics-time">
                  {data[index]?.operateTime?.split(' ')[0] !==
                    data[index - 1]?.operateTime?.split(' ')[0] && (
                    <span>{item.operateTime?.split(' ')[0]}</span>
                  )}
                  <span style={{ marginLeft: 8 }}>{item.operateTime?.split(' ')[1]}</span>
                </span>
                <Timeline.Item
                  className={classNames({
                    'logistics-desc': true,
                    'c7n-timeline-item-last': index + 1 === data.length,
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
  ) : (
    <div className="no-params">
      <p>{intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}</p>
    </div>
  );
});

export default observer((props) => {
  const { detailDS } = props;
  const { asnNum, ecPoSubNum } = detailDS?.current?.get(['asnNum', 'ecPoSubNum']) || {};
  const logisticsDs = useDataSet(() => logisticBasicDS(asnNum, ecPoSubNum), [asnNum, ecPoSubNum]);

  const invoiceTrack = logisticsDs?.current?.get('invoiceTrack') || [];

  const onRefresh = useCallback(() => {
    logisticsDs.query();
  }, [logisticsDs]);

  if (logisticsDs.status !== 'ready') return <Spin />;
  return (
    <div className={style['logistics-drawer-modal']}>
      <div className="logistics-drawer-content ">
        <div>
          <div className="base-info-title">
            {intl.get(`ssta.purchaseSettlePool.view.title.logisticBasicInfo`).d('基础信息')}
          </div>

          <Form dataSet={logisticsDs} columns={2} labelAlign="left">
            <Output name="applicationNo" />
            <Output name="logisticsCompany" />
            <Output name="logisticsNo" />
          </Form>
        </div>
        <div>
          <div className="base-info-title">
            {intl.get(`ssta.purchaseSettlePool.view.title.logisticInfo`).d('物流信息')}
          </div>
          <div className="content-header">
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1, color: '#191919' }}>
                <span>{intl.get('ssta.common.view.lastTimeUpdate').d('最后一次更新时间')}</span>：
                {invoiceTrack?.[0]?.operateTime}
              </div>
              <span className="logistics-info-refresh" onClick={onRefresh}>
                <Icon type="refresh" />
                {intl.get(`hzero.common.button.refresh`).d('刷新')}
              </span>
            </div>
          </div>
          <LogisticLine data={invoiceTrack} />
        </div>
      </div>
    </div>
  );
});
