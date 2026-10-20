import React, { useMemo, useCallback } from 'react';
import { Icon, Popover, Tooltip } from 'choerodon-ui';

import intl from 'utils/intl';

import biddingIcon from '@/assets/bidding.svg';
import scoreIcon from '@/assets/score-number-one.svg';
import { numberSeparatorRender } from '@/utils/renderer';
import './index.less';

const Index = ({ progress = [], currentNodeKeySeq }) => {
  const getTitleColor = (data) => {
    const { nodeValue, nodeValueParam } = data;
    switch (nodeValue) {
      case 'IN_REPLY': // 待回复
      case 'IN_ENTER': // 待确认
      case 'IN_QUOTE': // 报价中
      case 'IN_SUGGEST': // 核价中
      case 'IN_SCORE': // 评分中
        return '#FCA000'; // 黄色
      case 'SCORED': // 第一名
        if (Number(nodeValueParam) === 1) return '#FCA000'; // 黄色
        break;
      case 'NO_SUGGESTED': // 未中标
      case 'NO_ENTERED': // 未入围
      case 'UN_REPLY': // 未回复
      case 'UN_QUOTE': // 未报价
      case 'INVALID': // 无效报价
      case 'CLOSE': // 已关闭
      case 'UN_PART_IN': // 未参与
      case 'ABANDONED': // 已放弃
        return 'rgba(0,0,0,0.65)';
      case 'NO_APPROVED': // 未通过
        if (currentNodeKeySeq > 0) return 'rgba(0,0,0,0.65)'; // 黑色
        break;
      case 'SUGGESTED': // 已中标
        return '#36C2CF'; // 翠绿色
      default:
        break;
    }
  };

  const getLineColor = (data) => {
    const { nodeValue } = data;
    switch (nodeValue) {
      case 'IN_REPLY': // 待回复
      case 'IN_ENTER': // 待确认
      case 'IN_QUOTE': // 报价中
      case 'IN_SUGGEST': // 核价中
      case 'IN_SCORE': // 评分中
        return '#FCA000'; // 黄色
      case 'NO_SUGGESTED': // 未中标
      case 'NO_ENTERED': // 未入围
      case 'UN_REPLY': // 未回复
      case 'UN_QUOTE': // 未报价
      case 'INVALID': // 无效报价
      case 'CLOSE': // 已关闭
      case 'UN_PART_IN': // 未参与
      case 'ABANDONED': // 已放弃
        return 'rgba(0,0,0,0.65)';
      case 'NO_APPROVED': // 未通过
        if (currentNodeKeySeq > 0) return 'rgba(0,0,0,0.65)'; // 黑色
        break;
      default:
        break;
    }
  };

  const renderContent = useCallback(
    (data = []) => {
      const content = data.map((item) => {
        return (
          <div className="step-popover-content-item">
            <span className="step-popover-content-left">
              <Tooltip title={item.itemName}>{item.itemName}</Tooltip>
            </span>
            <span>
              {item.currencySymbol}
              {numberSeparatorRender(item.bidAmount)}
            </span>
          </div>
        );
      });
      return content;
    },
    [progress]
  );

  const renderTitle = useMemo(() => {
    return (
      <>
        <span className="step-popover-title-left">
          {intl.get('ssrc.projectSetup.model.projectSetup.biddingItem').d('中标物料')}
        </span>
        <span>{intl.get('ssrc.projectSetup.model.projectSetup.price').d('价格')}</span>
      </>
    );
  }, []);

  const renderStepItemContent = (item) => {
    if (item.nodeKey?.indexOf('ROUND_QUOTATION') !== -1 && item.nodeValue === 'UN_QUOTE') {
      return <div className="step-item-line" />;
    } else {
      return (
        <>
          <div className="step-item-line" style={{ borderColor: getLineColor(item) }} />
          {item.nodeValue === 'SUGGESTED' ? (
            <Popover
              overlayClassName="step-item-icon-popover"
              title={renderTitle}
              content={() => renderContent(item.bidItemList)}
            >
              <img src={biddingIcon} alt="" />
            </Popover>
          ) : item.nodeValue === 'SCORED' && Number(item.nodeValueParam) === 1 ? (
            <img src={scoreIcon} alt="" />
          ) : (
            <Icon
              className="step-item-icon"
              type="fiber_manual_record-o"
              style={{ color: getLineColor(item) }}
            />
          )}
          <div className="step-item-line" style={{ borderColor: getLineColor(item) }} />
        </>
      );
    }
  };

  return (
    <div className="steps-wrapper">
      {progress.map((item) => (
        // <div className="step-text" style={{ width: `${1/length * 100}%` }}>
        <div className="steps-content">
          <div className="step-item">{renderStepItemContent(item)}</div>
          {item.nodeKey?.indexOf('ROUND_QUOTATION') !== -1 && item.nodeValue === 'UN_QUOTE' ? (
            <span style={{ visibility: 'hidden' }}>
              {intl.get('ssrc.projectSetup.model.projectSetup.placeholder').d('占位符')}
            </span>
          ) : (
            <span className="step-item-title" style={{ color: getTitleColor(item) }}>
              {item.nodeValueMeaning}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Index;
