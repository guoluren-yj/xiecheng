import { parseJsonStr } from '@/utils/utils';
import React, { Fragment } from 'react';
import styles from './index.less';

const LogisticsInfo = (props) => {
  const { dataSourceStr } = props;
  const parseDataSource = parseJsonStr(dataSourceStr, {});
  const { partnerCode, data } = parseDataSource;
  const realData = partnerCode === 'KDNIAO' ? data : parseJsonStr(data, {})?.payload;
  const tracesPropName = partnerCode === 'KDNIAO' ? 'Traces' : 'traces';
  const timePropName = partnerCode === 'KDNIAO' ? 'AcceptTime' : 'trackTime';
  const stationPropName = partnerCode === 'KDNIAO' ? 'AcceptStation' : 'trackStation';
  const parseData = parseJsonStr(realData, {});
  const { [tracesPropName]: traces } = parseData;
  const dataSource = (traces || []).reverse();
  const firstItem = dataSource[0] || {};
  const renderList = (list, Item) => {
    const { [timePropName]: acceptTime, [stationPropName]: acceptStation } = Item;
    return (
      <Fragment>
        <li className={styles['logistics-info-wrap']}>
          <div className="logistics-date">
            <span>{acceptTime && acceptTime.split(' ')[0]}</span>
          </div>
          <div className="logistics-time">
            <span>{acceptTime && acceptTime.split(' ')[1]}</span>
          </div>
          <div className="logistics-box-cicle">
            <span
              className={`logistics-cicle active ${list.length > 1 && 'line'} ${
                acceptStation && acceptStation.length > 50 && 'twoLongLine'
              } ${acceptStation && acceptStation.length > 100 && 'threeLongLine'}`}
            />
          </div>
          <div className="logistics-desc">
            <span>{acceptStation}</span>
          </div>
        </li>
        {list.length &&
          list.map(
            (item, index) =>
              index > 0 && (
                <li>
                  <div className="logistics-date">
                    {list[index - 1][timePropName].split(' ')[0] &&
                      list[index][timePropName].split(' ')[0] !==
                        list[index - 1][timePropName].split(' ')[0] && (
                        <span>{item[timePropName].split(' ')[0]}</span>
                      )}
                  </div>
                  <div className="logistics-time">
                    <span>{item[timePropName].split(' ')[1]}</span>
                  </div>
                  <div className="logistics-box-cicle">
                    <span
                      className={`logistics-cicle ${index < list.length - 1 && 'line'} ${
                        item[stationPropName].length > 60 && 'twoLongLine'
                      } ${item[stationPropName].length > 120 && 'threeLongLine'}`}
                    />
                  </div>
                  <div className="logistics-desc">
                    <span>{item[stationPropName]}</span>
                  </div>
                </li>
              )
          )}
      </Fragment>
    );
  };

  return (
    <div className={styles['logistics-info-wrap']}>
      <div className="logistics-details">
        {dataSource.length > 0 && (
          <div className="logistics-list">
            <ul style={{ marginBottom: '0px' }}>{renderList(dataSource, firstItem)}</ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsInfo;
