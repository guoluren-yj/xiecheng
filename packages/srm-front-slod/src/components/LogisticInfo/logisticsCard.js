import React from 'react';
import intl from 'utils/intl';
// import { Tooltip } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import logistic from '@/assets/logistic.svg';
import './index.less';

export default function LogisticsCard(props) {
  const {
    stateMeaning,
    lastUpdateDate,
    logLoading,
    handleOpenMap,
    handleRefresh,
    logisticsTrackUrl,
    // logisticsLocusList,
    // edited,
  } = props;
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div className="logistics-status">
        <div className="logistics-border">
          <div className="logistics-border-left">
            <img className="imgIcon" alt="" src={logistic} />
            <div className="logistics-texts">
              <div className="logistics-tip">{stateMeaning}</div>
              {lastUpdateDate && (
                <div className="logistics-text">
                  {intl.get('slod.deliveryWorkbench.model.view.lastUpdateDate').d('上次更新时间')}
                  {lastUpdateDate}
                </div>
              )}
            </div>
          </div>
          <div className="logistics-border-right">
            <div className="logistics-border-right-btn">
              {logisticsTrackUrl && (
                <Button
                  icon="room"
                  color="primary"
                  funcType="flat"
                  type="c7n-pro"
                  loading={logLoading}
                  onClick={handleOpenMap}
                >
                  {intl.get('slod.deliveryWorkbench.model.view.logisticsMap').d('物流地图')}
                </Button>
              )}
              <Button
                icon="autorenew"
                color="primary"
                funcType="flat"
                type="c7n-pro"
                loading={logLoading}
                onClick={handleRefresh}
              >
                {intl.get('slod.deliveryWorkbench.model.view.logisticsUpdate').d('物流更新')}
              </Button>
            </div>
          </div>
        </div>
        {/* <div className="logistics-btns">
          <Button loading={logLoading} onClick={handleRefresh}>
            {intl.get('slod.deliveryWorkbench.model.view.logisticsUpdate').d('物流更新')}
            <Tooltip
              placement="bottom"
              title={intl
                .get('hzero.common.button.logisticNewTip')
                .d(
                  '点击后将会把「快递单号」「物流公司」「收件人手机号」传给第三方用以获取物流信息，请知晓'
                )}
            >
              <Icon
                style={{ marginLeft: '4px' }}
                className="helpOutline"
                type="help_outline"
                width={16}
                height={16}
              />
            </Tooltip>
          </Button>
          {logisticsTrackUrl && (
            <Button loading={logLoading} onClick={handleOpenMap} color="primary">
              {intl.get('slod.deliveryWorkbench.model.view.logisticsMap').d('物流地图')}
            </Button>
          )}
        </div> */}
      </div>
    </div>
  );
}
