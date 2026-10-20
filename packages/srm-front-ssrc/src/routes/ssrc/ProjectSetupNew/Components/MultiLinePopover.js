/**
 * 多行Popover
 * @date: 2021-02-22
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Popover} from 'choerodon-ui';
import { isArray, isFunction } from 'lodash';

import intl from 'utils/intl';

import styles from './common.less';

/**
 * 默认4行 - 超出通过popover展示
 * @ReactProps {!Object} lineConfig as config - 配置信息对象
 * @ReactProps {string} [config.labelName] - label name
 * @ReactProps {string} [config.valueName] - value name
 * @ReactProps {string} [config.popoverName] - popover name
 * @ReactProps {Vnode} [config.prefixLabel] - 自定义label前缀
 * @ReactProps {Vnode} [config.label] - 自定义label
 * @ReactProps {Vnode} [config.content] - 自定义content节点
 * @ReactProps {Object} [config.labelCustStyle] - label自定义style
 * @ReactProps {Object} [config.valueCustStyle] - value自定义style
 * @returns ReactNode
 */
export default class MultiLinePopover extends PureComponent {
  constructor(props) {
    super(props);
    const { lineList = [] } = props;
    const sourceCategory = lineList && lineList[0]?.sourceCategory;
    let displayLength = 0;
    (lineList || []).every((item) => {
      if (item.sourceCategory === sourceCategory) {
        displayLength++;
        return true;
      } else {
        return false;
      }
    });

    this.state = {
      displayLength: displayLength && displayLength < 3 ? displayLength : 3,
    };
  }

  /**
   * 渲染气泡内容
   */
  renderPopoverContent() {
    const { displayLength } = this.state;
    const { lineList = [] } = this.props;

    return lineList && this.renderMultiLines(lineList.slice(displayLength));
  }

  /**
   * 渲染行
   * @param {!Array} lines  - 行列表
   */
  renderMultiLines(lines = []) {
    const { lineConfig = {} } = this.props;
    return (
      <section className={styles.container}>
        {isArray(lines) && lines.length
          ? lines.map((r) => {
              const RFFlag = ['RFP', 'RFI'].includes(r.sourceCategory);
              return (
                <div className={styles['approval-line']}>
                  {r[lineConfig.labelName] || r[lineConfig.secondLabelName] ? (
                    !RFFlag ? (
                      <Popover
                        placement="topLeft"
                        content={
                          (isFunction(lineConfig.renderLabelPopover) &&
                            lineConfig.renderLabelPopover(r)) ||
                          r[lineConfig.labelName || r[lineConfig.secondLabelName]]
                        }
                      >
                        <span className={styles['left-label']} style={lineConfig.labelCustStyle}>
                          {lineConfig.prefixLabel}
                          {r[lineConfig.labelName] || r[lineConfig.secondLabelName]}
                        </span>
                      </Popover>
                    ) : (
                      <span className={styles['left-label']} style={lineConfig.labelCustStyle}>
                        {r[lineConfig.labelName] || r[lineConfig.secondLabelName]}
                      </span>
                    )
                  ) : null}
                  <span style={lineConfig.valueCustStyle} className={styles['approval-status']}>
                    {RFFlag
                      ? `${r.sourceCategory}-${r[lineConfig.valueName]}`
                      : `${lineConfig.valueNameSymbol ? r[lineConfig.valueNameSymbol] : ''} ${
                          r[lineConfig.valueName]
                        }`}
                  </span>
                </div>
              );
            })
          : '-'}
      </section>
    );
  }

  render() {
    const { displayLength = 3 } = this.state;
    const { lineList = [], flag = false } = this.props;

    return (
      <Fragment>
        {flag ? (
          isArray(lineList) && this.renderMultiLines(lineList)
        ) : (
          <>
            {isArray(lineList) && this.renderMultiLines(lineList.slice(0, displayLength))}
            {lineList?.length > displayLength && (
              <div>
                <Popover
                  placement="bottomLeft"
                  content={this.renderPopoverContent(lineList)}
                  className={styles.popover}
                >
                  <a>{intl.get(`ssrc.common.view.message.detailMore`).d('更多详情')}</a>
                </Popover>
              </div>
            )}
          </>
        )}
      </Fragment>
    );
  }
}
