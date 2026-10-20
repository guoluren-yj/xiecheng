import React, { useEffect, useMemo } from 'react';
import { Timeline, Icon } from 'choerodon-ui';
import { DataSet, Spin } from 'choerodon-ui/pro';
import classNames from 'classnames';

import Loading from '@/components/loading';
import intl from 'utils/intl';
// import { getPrimaryColor } from 'utils/utils';
import { fetchOMSTrackService } from '@/services/oms/logisticsService';
import useSetState from '@/hooks/useState';
import { ReactComponent as EmptyLog } from '@/assets/emptyLog.svg';
import FormPro from '@/components/FormPro';

import { dateTimeRender, dateRender, timeRender } from 'utils/renderer';
import { baseDS } from './ds';

import style from './index.less';

export default function InvoiceModal(props) {
  const { visible, product = {}, baseData = [] } = props;
  const {
    consignmentCode, // 配送单
    cecFromCode: platformCode,
  } = product;

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
    },
  } = state;
  const showFormFlag = useMemo(() => ['MANUAL', 'CATA'].includes(platformCode), [platformCode]);

  const baseDs = useMemo(() => new DataSet(baseDS()), []);

  useEffect(() => {
    if (visible) {
      fetchTrack();
    }
  }, [visible]);

  const data = orderTrack || [];

  function fetchTrack() {
    baseDs.loadData(baseData);
    const { logisticOrderNum: num } = baseData?.[0] || {};
    if (consignmentCode && !(!num && showFormFlag)) {
      setState({ loading: true });
      fetchOMSTrackService({ consignmentCode })
        .then((res) => {
          if (res && !res.failed) {
            setState({
              trackData: res,
              orderTrack: res?.orderTrack?.reverse(),
            });
            // 电商平台信息header不一定取的到，需要查配送单信息进行回写，但目录化可以
            if(!baseDs.current.get('logisticCompanyMeaning')){
              baseDs.current.set('logisticCompanyMeaning', res?.logisticsCompany);
            }
            if(!baseDs.current.get('logisticOrderNum')){
              baseDs.current.set('logisticOrderNum', res?.deliveryId);
            }
          } else {
            setState({ errorMsg: res.message });
          }
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
            <div style={{ marginBottom: '15px' }}>
              <div className="base-info-title">
                {intl.get('smodr.common.view.title.baseInfo').d('基础信息')}
              </div>
              <Spin spinning={loading}>
                <FormPro
                  columns={3}
                  readOnly
                  dataSet={baseDs}
                  fields={[
                    { name: 'srmConsignmentCode', show: showFormFlag },
                    { name: 'ecConsignmentCode', show: !showFormFlag },
                    { name: 'logisticOrderNum' },
                    { name: 'logisticCompanyMeaning' },
                    { name: 'logisticsStaff', show: showFormFlag },
                    { name: 'logisticsContactInfo', show: showFormFlag },
                  ]}
                />
              </Spin>
            </div>

            <div className="base-info-title gap">
              {intl.get(`smodr.common.view.logisticsInfo`).d('物流信息')}
            </div>

            {data?.length > 0 ? (
              <>
                {!state.errorMsg && (
                <div className="content-header">
                  <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1, color: '#000000' }}>
                      <span>
                        {intl.get('smodr.common.view.lastTimeUpdate').d('最后一次更新时间')}
                      </span>
                    ：{dateTimeRender(data?.[0]?.operateTime)}
                    </div>
                    <span className="logistics-info-refresh" onClick={fetchTrack}>
                      <Icon type="refresh" />
                      {intl.get(`hzero.common.button.refresh`).d('刷新')}
                    </span>
                  </div>
                </div>
                )}
                <div className="content-info">
                  <div>
                    <Timeline>
                      {data.map((item, index) => {
                      return (
                        <div className="time-line">
                          <span className="logistics-time">
                            {data[index]?.operateTime?.split(' ')[0] !==
                              data[index - 1]?.operateTime?.split(' ')[0] && (
                                <span>{dateRender(item.operateTime?.split(' ')[0])}</span>
                              )}
                            <span style={{ marginLeft: 8 }}>{timeRender(item.operateTime)}</span>
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
              </>
            ) : (
              <div className='container-empty'>
                <div className='img-bg'>
                  <p>
                    <span className={style['empty-log']}><EmptyLog /></span>
                    <p style={{ marginTop: '16px', textAlign: 'center' }}>{ state.errorMsg || intl.get('smodr.common.view.logisticsInfoTip').d('尚未开通物流查询服务或服务已失效，请自行查询')}</p>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
