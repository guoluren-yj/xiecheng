import React, { useCallback } from 'react';
import { Steps } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import { ReactComponent as Release } from '@/assets/source-open-release.svg';
import { ReactComponent as Prequalification } from '@/assets/open-prequalification.svg';
import { ReactComponent as Sign } from '@/assets/source-open-sign.svg';
import { ReactComponent as TrailBid } from '@/assets/source-open-trail-bidding.svg';
import { ReactComponent as Bidding } from '@/assets/source-open-bidding.svg';
import { ReactComponent as DelayBid } from '@/assets/source-open-delay.svg';
import { ReactComponent as OpenBid } from '@/assets/source-open-open.svg';
import { ReactComponent as Scoring } from '@/assets/source-open-scoring.svg';
import { ReactComponent as PreTrail } from '@/assets/source-open-pre.svg';
import { ReactComponent as RoundQuo } from '@/assets/source-open-round.svg';
import { ReactComponent as Bargain } from '@/assets/source-open-bargain.svg';
import { ReactComponent as CheckPrice } from '@/assets/source-open-check.svg';

import styles from '../../index.less';

const { Step } = Steps;

const ShowSourceNode = ({ nodes = [], sourceCategory = '' }) => {
  // 获取图标主题色组件
  const getIconComponent = useCallback((value) => {
    const map = {
      RELEASE: <Release />,
      PREQUALIFICATION: <Prequalification />,
      SIGN_IN: <Sign />,
      TRIAL_BIDDING: <TrailBid />,
      BIDDING: <Bidding />,
      QUOTATION: <Bidding />,
      DELAY_BIDDING: <DelayBid />,
      OPEN_BID: <OpenBid />,
      EXPERT_SCORE: <Scoring />,
      PRE_TRIAL: <PreTrail />,
      ROUND_QUOTATION: <RoundQuo />,
      BARGAIN: <Bargain />,
      CHECK_PRICE: <CheckPrice />,

      // RF图标
      RF_RELEASE: <Release />,
      RF_QUOTATION: <Bidding />,
      RF_EXPERT_SCORE: <Scoring />,
      RF_CONFIRM_SUPPLIERS: <CheckPrice />,
    };
    return map[value];
  }, []);

  // 节点的气泡方法
  const getNodeTooltipTitle = (value) => {
    switch (value) {
      case 'RELEASE':
        return intl
          .get(`ssrc.sourceTemplate.model.template.releaseNodeTooltip`)
          .d('寻源单据的创建及发布。');
      case 'PREQUALIFICATION':
        return sourceCategory === 'NEW_BID'
          ? intl
              .get(`ssrc.sourceTemplate.model.template.preQNodeTenderTooltip`)
              .d('采购方对供应商提交的资质及申请文件进行审核，审核通过的供应商方有投标资格。')
          : intl
              .get(`ssrc.sourceTemplate.model.template.preQNodeQuotationTooltip`)
              .d('采购方对供应商提交的资质及申请文件进行审核，审核通过的供应商方有报价资格。');
      case 'SIGN_IN':
        return intl
          .get(`ssrc.sourceTemplate.model.template.signInNodeTooltip`)
          .d('供应商在签到时间内签到，采购方可根据签到情况了解供应商在线状态。');
      case 'TRIAL_BIDDING':
        return intl
          .get(`ssrc.sourceTemplate.model.template.trailBidNodeTooltip`)
          .d('供应商在试竞价阶段模拟竞价流程，提前熟悉竞价环节。');
      case 'BIDDING':
        return intl
          .get(`ssrc.sourceTemplate.model.template.bidNodeTooltip`)
          .d('供应商在竞价运行时间内出价，竞拍标的。');
      case 'QUOTATION':
        return sourceCategory === 'NEW_BID'
        ? intl
            .get(`ssrc.sourceTemplate.model.template.quotationNodeTenderTooltip`)
            .d('供应商在投标运行时间内参与寻源并完成投标。')
        : intl
            .get(`ssrc.sourceTemplate.model.template.quotationNodeQuotationTooltip`)
            .d('供应商在报价运行时间内参与寻源并完成报价。');
      case 'DELAY_BIDDING':
        return intl
          .get(`ssrc.sourceTemplate.model.template.delayBidNodeTooltip`)
          .d('采购方可配置特定条件下触发延时竞价，供应商可以继续出价。');
      case 'OPEN_BID':
        return sourceCategory === 'NEW_BID'
          ? intl
              .get(`ssrc.sourceTemplate.model.template.openNodeTenderTooltip`)
              .d('在供应商完成投标后，需开标人员进行开标操作才会公开投标信息，进入下一环节。')
          : intl
              .get(`ssrc.sourceTemplate.model.template.openNodeQuotationTooltip`)
              .d('在供应商完成竞价/报价后，需开标人员进行开标操作才会公开报价信息，进入下一环节。');
      case 'EXPERT_SCORE':
        return intl
          .get(`ssrc.sourceTemplate.model.template.scoreExpertNodeTooltip`)
          .d('专家根据评分要素对供应商进行打分，并向供应商提出评审澄清。');
      case 'PRE_TRIAL':
        return sourceCategory === 'NEW_BID'
          ? intl
              .get(`ssrc.sourceTemplate.model.template.preTrailNodeTenderTooltip`)
              .d('初审员在此环节对供应商投标进行初步审查，若审查不通过可再次招标。')
          : intl
              .get(`ssrc.sourceTemplate.model.template.preTrailNodeQuotationTooltip`)
              .d('初审员在此环节对供应商报价进行初步审查，若审查不通过可再次询价。');
      case 'ROUND_QUOTATION':
        return sourceCategory === 'NEW_BID'
          ? intl
              .get(`ssrc.sourceTemplate.model.template.roundQuoNodeTenderTooltip`)
              .d(
                '采购方在定标/评审环节对所有供应商发起多轮报价，且多轮报价为密封报价，即每轮投标结束后才会公开供应商本轮的投标内容。'
              )
          : intl
              .get(`ssrc.sourceTemplate.model.template.roundQuoNodeQuotationTooltip`)
              .d(
                '采购方在核价/评审环节对所有供应商发起多轮报价，且多轮报价为密封报价，即每轮报价结束后才会公开供应商本轮的报价内容。'
              );
      case 'BARGAIN':
        return sourceCategory === 'NEW_BID'
          ? intl
              .get(`ssrc.sourceTemplate.model.template.bargainNodeTenderTooltip`)
              .d('采购方在定标/评审环节对供应商部分物料的投标发起非密封的议价。')
          : intl
              .get(`ssrc.sourceTemplate.model.template.bargainNodeQuotationTooltip`)
              .d('采购方在核价/评审环节对供应商部分物料的报价发起非密封的议价。');
      case 'CHECK_PRICE':
        return sourceCategory === 'NEW_BID'
          ? intl
              .get(`ssrc.sourceTemplate.model.template.checkPriceNodeTenderTooltip`)
              .d('采购方对此次投标结果进行核对，确认物料及供应商的选用。')
          : intl
              .get(`ssrc.sourceTemplate.model.template.checkPriceNodeQuotationTooltip`)
              .d('采购方对此次报价结果进行核对，确认物料及供应商的选用。');

      // RF节点描述
      case 'RF_RELEASE':
        return intl
          .get(`ssrc.sourceTemplate.model.template.releaseRfNodeTooltip`)
          .d('征询单创建及发布。');
      case 'RF_QUOTATION':
        return sourceCategory === 'RFI'
          ? intl
              .get(`ssrc.sourceTemplate.model.template.quotationRfNodeTenderTooltip`)
              .d('供应商在征询运行时间内参与并提交信息。')
          : intl
              .get(`ssrc.sourceTemplate.model.template.quotationRfNodeQuotationTooltip`)
              .d('供应商在征询运行时间内参与并提交方案。');
      case 'RF_EXPERT_SCORE':
        return intl
          .get(`ssrc.sourceTemplate.model.template.scoreRfNodeTooltip`)
          .d('专家根据评分要素对供应商进行打分，并向供应商提出评审澄清。');
      case 'RF_CONFIRM_SUPPLIERS':
        return intl
          .get(`ssrc.sourceTemplate.model.template.checkPriceRfNodeTooltip`)
          .d('采购方对此次征询结果确认入围的供应商。');
      default:
        return '';
    }
  };

  return (
    <Steps direction="vertical" current={-1}>
      {!isEmpty(nodes)
        ? nodes.map((item) => {
            return (
              <Step
                title={
                  <div className={styles['source-step-title']}>
                    {item.value === 'QUOTATION' && sourceCategory === 'NEW_BID'
                      ? intl.get('ssrc.common.model.common.tender').d('投标')
                      : item.value === 'CHECK_PRICE' && sourceCategory === 'NEW_BID'
                      ? intl.get('ssrc.common.view.message.target').d('定标')
                      : item.meaning}
                  </div>
                }
                icon={<div className={styles['source-icon']}>{getIconComponent(item.value)}</div>}
                style={{
                  minHeight: '72px',
                }}
                description={getNodeTooltipTitle(item.value)}
              />
            );
          })
        : null}
    </Steps>
  );
};

export default observer(ShowSourceNode);
