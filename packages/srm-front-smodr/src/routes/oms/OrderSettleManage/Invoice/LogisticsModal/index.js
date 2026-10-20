import React, { useEffect } from 'react';
import { Timeline, Icon } from 'choerodon-ui';
import classNames from 'classnames';

import Loading from '@/components/loading';
import intl from 'utils/intl';
// import { getPrimaryColor } from 'utils/utils';
import { fetchOMSTrackService } from '@/services/oms/logisticsService';
import style from './index.less';
import useSetState from '@/hooks/useState';
import { Title, Value } from '@/routes/components/Label';

export default function InvoiceModal(props) {
  const { consignmentCode } = props;
  // const {
  //   consignmentCode, // 配送单
  //   cecFromCode: platformCode,
  // } = product;

  const [state, setState] = useSetState({
    loading: false,
    visible: false,
    trackData: {},
    ecConsignmentCode: '',
    srmConsignmentCode: '',
  });
  const {
    loading,
    trackData: {
      orderTrack,
      logisticsCompany,
      deliveryId,
      thirdOrderId,
      logisticsStaff,
      logisticsContactInfo,
    },
    // ecConsignmentCode,
    // srmConsignmentCode,
  } = state;

  useEffect(() => {
    // if (visible) {
    fetchTrack();
    // }
  }, []);

  const data = orderTrack || [];

  function fetchTrack() {
    setState({ loading: true });
    if (consignmentCode) {
      fetchOMSTrackService({ consignmentCode })
        .then((res) => {
          setState({
            trackData: res,
            orderTrack: res?.orderTrack?.reverse(),
            ecConsignmentCode: res.ecConsignmentCode,
            srmConsignmentCode: res.srmConsignmentCode,
          });
        })
        .catch((error) => {
          setState({ errorMsg: error.message });
        })
        .finally(() => {
          setState({ loading: false });
        });
    }
  }

  return (
    <>
      <div className={style.content}>
        {loading && consignmentCode ? (
          <Loading />
        ) : (
          <div className="logistics-drawer-content">
            {(deliveryId ||
              logisticsCompany ||
              thirdOrderId ||
              logisticsStaff ||
              logisticsContactInfo) && (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <div className="base-info-title">
                    {intl.get('smodr.common.view.title.baseInfo').d('基础信息')}
                  </div>
                  <div>
                    <div className="base-info-item">
                      <Title>{intl.get('smodr.common.view.logistics.company').d('物流公司')}</Title>
                      <Value>{logisticsCompany}</Value>
                    </div>
                    <div className="base-info-item">
                      <Title>{intl.get('smodr.common.view.courier.number').d('快递单号')}</Title>
                      <Value>{deliveryId}</Value>
                    </div>
                    {/* {platformCode === 'CATA' ? (
                      <div className="base-info-item">
                        <Title>{intl.get('smodr.common.view.invoice.no').d('发货单号')}</Title>
                        <Value>{srmConsignmentCode}</Value>
                      </div>
                    ) : ( */}
                    {/* <div className="base-info-item">
                        <Title>{intl.get('smodr.common.view.common.subPoNum').d('子订单号')}</Title>
                        <Value>{ecConsignmentCode}</Value>
                      </div> */}
                    {/* )} */}
                    {/* <div className="base-info-item">
                        <Title>
                          {intl.get('smodr.common.view.common.deliveryStaff').d('配送人员')}：
                        </Title>
                        <Value>{logisticsStaff}</Value>
                      </div>
                      <div className="base-info-item">
                        <Title>
                          {intl.get(`smodr.common.view.contactInformation`).d('联系方式')}：
                        </Title>
                        <Value>{logisticsContactInfo}</Value>
                      </div> */}
                  </div>
                </div>
                <div className="base-info-title">
                  {intl.get(`smodr.common.view.logisticsInfo`).d('物流信息')}
                </div>
                <div className="content-header">
                  <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1, color: '#000000' }}>
                      <span>
                        {intl.get('smodr.common.view.lastTimeUpdate').d('最后一次更新时间')}
                      </span>
                      ：{data?.[0]?.operateTime}
                    </div>
                    <span className="logistics-info-refresh" onClick={fetchTrack}>
                      <Icon type="refresh" />
                      {intl.get(`hzero.common.button.refresh`).d('刷新')}
                    </span>
                  </div>
                </div>
              </>
            )}
            {data?.length > 0 ? (
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
                <p>{state.errorMsg || intl.get(`smodr.common.view.noData`).d('暂无数据')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
