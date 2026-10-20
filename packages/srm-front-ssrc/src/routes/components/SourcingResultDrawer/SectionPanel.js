/**
 * 分标段面板
 */
import React, { PureComponent } from 'react';
import { map, toString } from 'lodash';
import classNames from 'classnames';

import intl from 'utils/intl';

import styles from './index.less';

const promptCode = 'ssrc.common';

const colorMap = {
  default: {
    color: '#4F9EE9',
    backgroundColor: '#E8EFF7',
  },
  CLOSED: {
    color: '#0B0B0B',
    backgroundColor: '#E6E6E6',
  },
};

function Tag({ color, backgroundColor, children }) {
  const style = {
    width: '30px',
    height: '18px',
    lineHeight: '18px',
    textAlign: 'center',
    fontWeight: 500,
  };
  return <div style={{ color, backgroundColor, ...style }}>{children}</div>;
}

export default class SectionPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 查询标段列表
   */
  querySectionList() {}

  /**
   * 渲染标签
   * @param {key} - 标段key
   */
  renderTag(key) {
    const { sourcingResultShortMap = {} } = this.props;
    const meaning = sourcingResultShortMap[key]; // 匹配到当前节点
    const { color, backgroundColor } = colorMap[key === 'CLOSED' ? 'CLOSED' : 'default'];
    return (
      <Tag color={color} backgroundColor={backgroundColor}>
        {meaning}
      </Tag>
    );
  }

  render() {
    const {
      activateSectionKey,
      onChangeSection,
      sectionTagMap = {},
      projectLineSectionList = [],
    } = this.props;
    return (
      <React.Fragment>
        <div className={styles['header-wrapper']}>
          <h3>{intl.get(`${promptCode}.view.title.projectSection`).d('项目标段')}</h3>
          <span>{intl.get(`${promptCode}.view.title.changeSectionFast`).d('快速切换标段')}</span>
        </div>
        <div className={styles['list-container']}>
          {map(projectLineSectionList, (item) => {
            return (
              <div key={item.projectLineSectionId}>
                <div
                  className={classNames(styles['list-item'], {
                    [styles['item-active']]:
                      activateSectionKey === toString(item.projectLineSectionId),
                  })}
                  onClick={() => onChangeSection(item)}
                >
                  <span>{item.sectionName}</span>
                  {sectionTagMap[item.projectLineSectionId] &&
                    this.renderTag(sectionTagMap[item.projectLineSectionId])}
                </div>
              </div>
            );
          })}
        </div>
      </React.Fragment>
    );
  }
}
