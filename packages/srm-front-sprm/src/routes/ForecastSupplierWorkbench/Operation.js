/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2023-11-04 08:38:53
 * @LastEditors: yanglin
 * @LastEditTime: 2024-04-02 17:39:25
 */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { Timeline, Icon, Spin } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';

import style from './index.less';

const { Item } = Timeline;

const Index = ({ fcstHeaderId, operateLineDs, handleVersion, activeCols }) => {
  const [loading, setLoading] = useState(false);
  const [actionData, setActionData] = useState([]);
  useEffect(() => {
    setLoading(true);
    // NEW RELEASE  UNLOCK  UPDATE  NEWLINE  DELETE
    operateLineDs.query().then(res => {
      setActionData(res);
      setLoading(false);
    });
  }, [fcstHeaderId]);

  //
  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get(`hzero.common.components.noticeIcon.null`).d('暂无数据')}</span>
      </div>
    );
  };

  const renderOperateHistory = () => {
    return (
      <Spin spinning={loading}>
        {actionData.length > 0 && (
          <Timeline className="operating-timeline">
            {actionData?.map(ele => (
              <Item color="#e5e5e5">
                <Icon type="publish2" style={{ fontSize: 14, marginTop: '2px' }} />
                <div className="operating-timeline-info">
                  <span className="operator">{ele.processUserName}</span>
                  <span className="status gray">
                    {ele.processTypeCode === 'RELEASE'
                      ? intl.get('sprm.forecastMgt.model.common.release').d('发布了')
                      : ele.processTypeCodeMeaning}
                  </span>
                  {ele.processTypeCode === 'RELEASE' ? (
                    <a
                      className="result"
                      onClick={() =>
                        handleVersion({
                          fcstHeaderId,
                          version: ele.version,
                          activeCols,
                        })
                      }
                    >
                      {`${ele.version}`
                        ? `${intl.get('sprm.forecastMgt.model.common.forecastBill').d('预测单')}-${
                            ele.version
                          }`
                        : `${intl.get('sprm.forecastMgt.model.common.forecastBill').d('预测单')}`}
                    </a>
                  ) : (
                    <span className="result">
                      {`${intl.get('sprm.forecastMgt.model.common.forecastBill').d('预测单')}`}
                    </span>
                  )}
                  <div className="date gray">{dateTimeRender(ele.processDate)}</div>
                </div>
              </Item>
            ))}
          </Timeline>
        )}
        {!actionData?.length && handleNoData()}
      </Spin>
    );
  };

  return <div className={style.operating}>{renderOperateHistory()}</div>;
};

export default formatterCollections({
  code: ['sprm.forecastMgt'],
})(Index);
