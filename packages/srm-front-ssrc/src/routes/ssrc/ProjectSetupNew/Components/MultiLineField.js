/**
 * 聚合信息列
 * @date: 2021-01-27
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Icon, Popover } from 'choerodon-ui';
import { isArray, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import styles from './common.less';

/**
 * 渲染聚合信息列
 * @ReactProps {!Array} multiLineConfigs - 聚合信息数组
 * @ReactProps {!Object} [config=multiLineConfigs[0]] - 聚合信息对象
 * @ReactProps {string} [config.name] - ds field name
 * @ReactProps {string} [config.label] - 自定义label - 优先级大于ds label
 * @ReactProps {Vnode} [config.content] - 自定义content节点
 * @ReactProps {Object} [config.labelCustStyle] - label自定义style
 * @ReactProps {Object} [config.valueCustStyle] - value自定义style
 * @returns ReactNode
 */
export default class MultiLineField extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
    };
  }

  @Bind()
  handleChangeExpand() {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  render() {
    const { multiLineConfigs = [], record = {} } = this.props;

    const { expand } = this.state;

    return (
      <Fragment>
        <section className={styles.container}>
          {isArray(multiLineConfigs) &&
            multiLineConfigs.slice(0, expand ? multiLineConfigs.length : 3).map((config) => {
              return (
                <div>
                  <span className={styles['left-label']} style={config.labelCustStyle}>
                    {config.label || record.getField(config.name).get('label')}
                  </span>
                  <Popover placement="topLeft" content={record.get(config.name)}>
                    <span
                      style={config.valueCustStyle}
                      onClick={() => isFunction(config.handleFunc) && config.handleFunc(record)}
                    >
                      {record.get(config.name)}
                    </span>
                  </Popover>
                </div>
              );
            })}
        </section>
        {multiLineConfigs?.length > 3 && (
          <div className={styles.expand} onClick={this.handleChangeExpand}>
            <a>
              {expand
                ? intl.get('hzero.common.button.up').d('收起')
                : intl.get('hzero.common.button.expand').d('展开')}
            </a>
            <Icon type={expand ? 'expand_less' : 'expand_more'} />
          </div>
        )}
      </Fragment>
    );
  }
}
