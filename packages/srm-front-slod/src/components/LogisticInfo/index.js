/* eslint-disable jsx-a11y/iframe-has-title */
import React from 'react';
import { Content } from 'components/Page';
import { Spin } from 'choerodon-ui';
import { Row, Col } from 'choerodon-ui/pro';

// import intl from 'utils/intl';
import './index.less';
import LogisticsCard from './logisticsCard';

const LogisticsRecord = (props) => {
  const { logLoading, logisticsData, display, handleRefresh, handleOpenMap } = props;
  const { lastUpdateDate = '', logisticsLocusList = [], stateMeaning, logisticsTrackUrl } =
    logisticsData || {};
  const newData = (logisticsLocusList && [...logisticsLocusList].reverse()) || [];
  const firstItem = newData[0] || {};

  const renderList = (data, Item) => {
    const { acceptTime, acceptStation } = Item;
    return (
      <>
        <li className="active">
          <div className="logistics-date">
            <span>{acceptTime && acceptTime.split(' ')[0]}</span>
          </div>
          <div className="logistics-time">
            <span>{acceptTime && acceptTime.split(' ')[1]}</span>
          </div>
          <div className="logistics-box-cicle">
            <span
              className={`logistics-cicle active ${data.length > 1 && 'line'} ${acceptStation &&
                acceptStation.length > 50 &&
                'twoLongLine'} ${acceptStation && acceptStation.length > 100 && 'threeLongLine'}`}
            />
          </div>
          <div className="logistics-desc">
            <span>{acceptStation}</span>
          </div>
        </li>
        {data.length &&
          data.map(
            (item, index) =>
              index > 0 && (
                <li>
                  <div className="logistics-date">
                    {data[index - 1].acceptTime.split(' ')[0] &&
                      data[index].acceptTime.split(' ')[0] !==
                        data[index - 1].acceptTime.split(' ')[0] && (
                        <span>{item.acceptTime.split(' ')[0]}</span>
                      )}
                  </div>
                  <div className="logistics-time">
                    <span>{item.acceptTime.split(' ')[1]}</span>
                  </div>
                  <div className="logistics-box-cicle">
                    <span
                      className={`logistics-cicle ${index < data.length - 1 && 'line'} ${item
                        .acceptStation.length > 60 && 'twoLongLine'} ${item.acceptStation.length >
                        120 && 'threeLongLine'}`}
                    />
                  </div>
                  <div className="logistics-desc">
                    <span>{item.acceptStation}</span>
                  </div>
                </li>
              )
          )}
      </>
    );
  };

  const LogisticsCardInfo = {
    stateMeaning,
    lastUpdateDate,
    logLoading,
    handleOpenMap,
    handleRefresh,
    logisticsTrackUrl,
    logisticsLocusList,
  };
  return (
    <Content style={{ margin: '0' }} className="contents">
      <div className="wrap">
        <div className="wrap-icon">
          <LogisticsCard {...LogisticsCardInfo} />
        </div>
        <Row align="middle">
          <Col span={24} className="wrap-col">
            <div className={`logistics-details ${display ? 'more' : 'min'}`}>
              {newData.length > 0 && (
                <Spin spinning={logLoading}>
                  <div className="logistics-list">
                    <ul style={{ marginBottom: '0px' }}>{renderList(newData, firstItem)}</ul>
                  </div>
                </Spin>
              )}
            </div>
          </Col>
        </Row>
      </div>
      {/* <div></div> */}
    </Content>
  );
};

export default LogisticsRecord;
