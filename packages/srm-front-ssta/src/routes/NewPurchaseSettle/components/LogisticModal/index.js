import React, { useCallback, useEffect, useContext } from 'react';
import { Timeline, Icon, Spin } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Form, Output, useDataSet, Lov } from 'choerodon-ui/pro';

import classNames from 'classnames';
import intl from 'utils/intl';

import { logisticBasicDS } from '@/stores/NewPurchaseSettleDS';
import { getLovData } from '@/services/settlePoolServices';
import style from './index.less';
import { Store } from '../../Detail/StoreProvider';

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
      <p>{intl.get('ssta.common.components.noticeIcon.logisticNull').d('暂无运单信息')}</p>
    </div>
  );
});

export default observer((props) => {
  const { modal } = props;
  const { numLovDs, settleHeaderId } = useContext(Store);
  const logisticsDs = useDataSet(
    () => ({
      ...logisticBasicDS(),
    }),
    []
  );

  useEffect(() => {
    getLovData({
      lovCode: 'SSTA.SETTLE_HEADER_FOR_ASN',
      page: 0,
      size: 10,
      asyncCountFlag: 'DEFAULT',
      settleHeaderId,
    }).then((res) => {
      const numLov = numLovDs?.current?.get('numLov');
      if (res?.content?.length && !numLov) {
        numLovDs.loadData([{ numLov: res.content[0] }]);
      }
      if (numLovDs?.current?.get('numLov')?.asnNum) {
        logisticsDs.setQueryParameter(
          'srmConsignmentCode',
          numLovDs?.current?.get('numLov')?.asnNum
        );
      }
      logisticsDs.query();
    });
  }, [logisticsDs, numLovDs]);

  useEffect(() => {
    numLovDs.addEventListener('update', handleUpdate);
    return () => {
      numLovDs.removeEventListener('update', handleUpdate);
    };
  }, [numLovDs, handleUpdate]);

  useEffect(() => {
    if (modal) {
      modal.update({
        title: (
          <span>
            {intl.get(`ssta.common.view.title.invoiceLogisticsView`).d('查看物流信息')}
            <Lov dataSet={numLovDs} name="numLov" style={{ marginLeft: 5 }} />
          </span>
        ),
      });
    }
  }, [modal]);

  const handleUpdate = useCallback(
    ({ value, name }) => {
      if (name === 'numLov') {
        // 获取num值
        // 设置查询参数
        // 重新查询数据
        if (value?.asnNum) {
          logisticsDs.setQueryParameter('srmConsignmentCode', value.asnNum);
          logisticsDs.query();
        } else {
          logisticsDs.loadData([]);
        }
      }
    },
    [logisticsDs]
  );

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
              {numLovDs?.current?.get('numLov') && (
                <span className="logistics-info-refresh" onClick={onRefresh}>
                  <Icon type="refresh" />
                  {intl.get(`hzero.common.button.refresh`).d('刷新')}
                </span>
              )}
            </div>
          </div>
          <LogisticLine data={invoiceTrack} />
        </div>
      </div>
    </div>
  );
});
