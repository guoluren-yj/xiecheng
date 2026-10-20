/**
 * 经营指数
 */
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'hzero-ui';
import classNames from 'classnames';
import intl from 'utils/intl';
import RadarChartComp from './RadarChartComp';
import './index.less';

const ExponentComp = (props) => {
  const { indicatorsList = [], score = 0, radarData = [] } = props;

  const [levelObj, setLevelObj] = useState({ level1: false, level2: false, level3: false });

  useEffect(() => {
    const levObj = Object.assign({ ...levelObj }, {});
    if (score < 550) {
      levObj.level1 = true;
    } else if (score >= 550 && score < 650) {
      levObj.level1 = true;
      levObj.level2 = true;
    } else {
      levObj.level1 = true;
      levObj.level2 = true;
      levObj.level3 = true;
    }

    setLevelObj(levObj);
  }, [score, setLevelObj]);

  const classes = levelObj.level3
    ? 'mark-area-score-high'
    : levelObj.level2
    ? 'mark-area-score-middle'
    : 'mark-area-score-low';

  const tagName = levelObj.level3
    ? intl.get('spfm.wideArea.view.tag.well').d('优秀')
    : levelObj.level2
    ? intl.get('spfm.wideArea.view.tag.normal').d('良好')
    : intl.get('spfm.wideArea.view.tag.serious').d('一般');

  return (
    <>
      <Row>
        {radarData.length ? (
          <>
            <Col span={2}>
              <div className="mark-area">
                <div className={classNames('mark-area-score', classes)}>
                  {score >= 0 ? parseFloat(score).toFixed(2) : 0}
                  <span className="mark-area-tag">{tagName}</span>
                </div>
                <div className="line-progress">
                  <div
                    style={{ background: levelObj.level1 ? '#F56349' : '#fff' }}
                    className="progress-item"
                  />
                  <div
                    style={{ background: levelObj.level2 ? '#FCA000' : '#fff' }}
                    className="progress-item"
                  />
                  <div
                    style={{ background: levelObj.level3 ? '#47B881' : '#fff' }}
                    className="progress-item"
                  />
                </div>
              </div>
            </Col>
            <Col span={20}>
              <RadarChartComp radarData={radarData} indicatorsList={indicatorsList} />
            </Col>
          </>
        ) : (
          <Col span={24}>
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              {intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}
            </div>
          </Col>
        )}
      </Row>
    </>
  );
};

export default ExponentComp;
