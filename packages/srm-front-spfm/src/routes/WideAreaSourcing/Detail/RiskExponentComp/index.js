/**
 * 经营指数、风控指数组件
 */
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'hzero-ui';
import classNames from 'classnames';
import intl from 'utils/intl';
import { fetchRiskDetail } from '@/services/wideAreaService';
import RadarChartComp from './RadarChartComp';
import './index.less';

const RiskExponentComp = (props) => {
  const { codeObj, params } = props;

  // 风险指数
  const [riskObj, setRiskObj] = useState({});
  const [levelObj, setLevelObj] = useState({ level1: false, level2: false, level3: false });

  useEffect(() => {
    if (params && params.loginName) {
      fetchRiskDetail(params).then((res) => {
        setRiskObj(res);
      });
    }
  }, [params]);

  // 风控指数
  const riskList = () => {
    const rtnList = [];
    const dataList = riskObj?.modelPointList ?? [];

    if (dataList.length && codeObj.riskControlIndex && codeObj.riskControlIndex.length) {
      dataList.forEach((item) => {
        codeObj.riskControlIndex.forEach((item2) => {
          if (item.name === item2.description) {
            rtnList.push({
              item: item2.meaning,
              name: item.name,
              value: item.value ? (parseFloat(item.value) * 1000).toFixed(2) : 0,
            });
          }
        });
      });
    }

    return rtnList;
  };

  const switchType = (type) => {
    switch (type) {
      case '工商风险':
        return 0.1;

      case '经营风险':
        return 0.2;

      case '司法风险':
        return 0.24;

      case '财务风险':
        return 0.26;

      case '舆情风险':
        return 0.2;

      default:
        return 0;
    }
  };

  // 获取风控指数评分 (每一项的分数 / 项数)相加
  const getRiskFinalScore = () => {
    const dataList = riskList();
    let scoreSum = 0;
    if (dataList.length) {
      dataList.forEach((item) => {
        const proportion = switchType(item.name);
        scoreSum += item.value * proportion;
      });
    }
    return parseFloat(scoreSum);
  };

  // 获取指数说明 标签列表
  const getRiskTagList = (attr) => {
    const rtnList = [];

    const modelDetailList = riskObj?.modelDetailList ?? [];

    if (modelDetailList && modelDetailList.length && codeObj[attr] && codeObj[attr].length) {
      codeObj[attr].forEach((item) => {
        modelDetailList.forEach((item2) => {
          if (item2.name === item.description) {
            if (
              (item2.name === '经营状态异常' ||
                item2.name === '清算信息' ||
                item2.name === '危害国家公共安全') &&
              parseFloat(item2.value) === 1.0
            ) {
              // 特殊标签单独处理
              rtnList.push({
                tagName: item.meaning,
                type: 'warning',
              });
            } else if (
              item2.name !== '经营状态异常' &&
              item2.name !== '清算信息' &&
              item2.name !== '危害国家公共安全' &&
              parseFloat(item2.value) < 0
            ) {
              rtnList.push({
                tagName: item.meaning,
                type: 'normal',
              });
            }
          }
        });
      });
    }

    return rtnList;
  };

  const indicatorsList = [
    {
      title: intl.get('spfm.wideArea.view.title.businessChange').d('工商风险'),
      localStr: '工商风险',
      content: intl
        .get('spfm.wideArea.view.title.businessChangeInfo')
        .d(
          '工商变更风险主要包括企业发生法人变更、股权变更、地址变更、经营范围变更等，工商信息变更能够在一定层面上反映企业内在风险'
        ),
      tagList: getRiskTagList('businessChangeList'),
    },
    {
      title: intl.get('spfm.wideArea.view.title.businessRisk').d('经营风险'),
      localStr: '经营风险',
      content: intl
        .get('spfm.wideArea.view.title.businessRiskInfo')
        .d(
          '经营风险主要包括由于生产经营变动或市场环境改变导致企业未来的经营性现金流量发生变化，从而影响企业的市场价值的可能性的风险'
        ),
      tagList: getRiskTagList('businessRiskList'),
    },
    {
      title: intl.get('spfm.wideArea.view.title.judicialRisk').d('司法风险'),
      localStr: '司法风险',
      content: intl
        .get('spfm.wideArea.view.title.judicialRiskInfo')
        .d(
          '司法风险是指包括企业自身在内的各种主体未按照法律规定或合同约定行使权力、履行义务，而对企业造成负面法律后果的风险'
        ),
      tagList: getRiskTagList('judicialRiskList'),
    },
    {
      title: intl.get('spfm.wideArea.view.title.financialRisk').d('财务风险'),
      localStr: '财务风险',
      content: intl
        .get('spfm.wideArea.view.title.financialRiskInfo')
        .d(
          '财务风险是指在各项财务活动过程中，由于各种难以预料或控制的因素影响，财务状况具有不确定性，从而使企业有蒙受损失的可能性，按财务活动的主要环节，可以分为流动性风险、信用风险、筹资风险、投资风险'
        ),
      tagList: getRiskTagList('financialRiskList'),
    },
    {
      title: intl.get('spfm.wideArea.view.title.publicOpinionRisk').d('舆情风险'),
      localStr: '舆情风险',
      content: intl
        .get('spfm.wideArea.view.title.publicOpinionRiskInfo')
        .d(
          '舆情风险是指企业单位在从事社会管理和经济活动的时候，可能面临的来自社会或者网络的负面信息、虚假信息、谣言等，这些负面信息通过发酵会给企业产生的舆情危机'
        ),
      tagList: getRiskTagList('pubOptionRiskList'),
    },
  ];

  const radarData = riskList();
  const score = getRiskFinalScore();

  useEffect(() => {
    const levObj = Object.assign({ ...levelObj }, {});
    if (score <= 250) {
      levObj.level1 = true;
    } else if (score > 250 && score <= 500) {
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
    ? 'mark-area-score-low'
    : levelObj.level2
    ? 'mark-area-score-middle'
    : 'mark-area-score-high';
  const tagName = levelObj.level3
    ? intl.get('spfm.wideArea.view.tag.warning').d('预警')
    : levelObj.level2
    ? intl.get('spfm.wideArea.view.tag.focus').d('关注')
    : intl.get('spfm.wideArea.view.tag.normalWell').d('正常');

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
                    style={{ background: levelObj.level1 ? '#47B881' : '#fff' }}
                    className="progress-item"
                  />
                  <div
                    style={{ background: levelObj.level2 ? '#FCA000' : '#fff' }}
                    className="progress-item"
                  />
                  <div
                    style={{ background: levelObj.level3 ? '#F56349' : '#fff' }}
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

export default RiskExponentComp;
