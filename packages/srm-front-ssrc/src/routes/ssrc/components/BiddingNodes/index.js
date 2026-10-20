import React from 'react';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui/pro';
import { Text } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';

import style from './index.less';

const stylePrefix = 'timeLine-nodes';

// 竞价节点
/**
 * title: 节点上方标题
 * data: [
 *    {
 *      from  // 开始节点
 *      end   // 结束节点
 *      label // 横线上方的标签
 *      lineWidth // 横线长度
 *      isNoStart // 是否渲染开始节点
 *      lineShape // 横线渲染样式 实线或者虚线-dotted
 *      tooltipFrom // from 气泡
 *      tooltipEnd // end 气泡
 *    }
 * ]
 */
const BiddingNodes = observer((props) => {
  const {
    title = intl.get('ssrc.inquiryHall.model.bidding.biddingNodes').d('竞价节点'),
    data = [],
  } = props || {};

  return (
    <div className={classnames(style[`${stylePrefix}`])}>
      <h3 className={classnames(style[`${stylePrefix}-title`])}>{title}</h3>
      <ul className={classnames(style[`${stylePrefix}-content`])}>
        {data.map((node, index) => {
          // 如果不是第一个元素并且开始有自己的开始节点就显示间隔线
          const showPrefixLineFlag = index !== 0 && !node.isNoStart;
          return (
            <li
              className={classnames(
                style[showPrefixLineFlag ? `${stylePrefix}-item-dot-interval` : '']
              )}
            >
              <div
                className={classnames(
                  style[`${stylePrefix}-item-head`],
                  style[`${stylePrefix}-text`],
                  { [style[`${stylePrefix}-item-head-center`]]: index !== 0 && !node.isNoStart }
                )}
                style={{ maxWidth: `${node.lineWidth ?? 1.2}rem` }}
              >
                <Text>{node.label}</Text>
              </div>
              <div className={classnames(style[`${stylePrefix}-item-track`])}>
                {index === 0 ? (
                  <Tooltip title={node.tooltipFrom}>
                    <div className={classnames(style[`${stylePrefix}-item-dot`])} />
                  </Tooltip>
                ) : (
                  !node.isNoStart && (
                    <Tooltip title={node.tooltipFrom}>
                      <div
                        className={classnames(
                          style[`${stylePrefix}-item-dot`],
                          style[showPrefixLineFlag ? `${stylePrefix}-item-dot-prefix-line` : '']
                        )}
                      />
                    </Tooltip>
                  )
                )}
                <div
                  className={classnames(style[`${stylePrefix}-item-line`], {
                    [style[`${stylePrefix}-item-line-${node?.lineShape}`]]: node?.lineShape,
                  })}
                  style={{ width: `${node.lineWidth ?? 1.2}rem` }}
                />
                <Tooltip title={node.tooltipEnd}>
                  <div className={classnames(style[`${stylePrefix}-item-dot`])} />
                </Tooltip>
              </div>
              <div
                className={classnames(style[`${stylePrefix}-item-text`], {
                  [style[`${stylePrefix}-item-text-wait`]]: index !== 0 && !node.isNoStart,
                })}
              >
                {(index === 0 || !node.isNoStart) && (
                  <div
                    className={classnames(
                      style[`${stylePrefix}-item-text-from`],
                      style[`${stylePrefix}-text`]
                    )}
                  >
                    {node.from}
                  </div>
                )}
                <div
                  className={classnames(
                    style[`${stylePrefix}-item-text-end`],
                    style[`${stylePrefix}-text`]
                  )}
                >
                  {node.end}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

export default formatterCollections({ code: ['ssrc.inquiryHall'] })(BiddingNodes);
