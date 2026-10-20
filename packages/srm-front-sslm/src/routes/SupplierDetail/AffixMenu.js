/**
 * AffixMenu - 供应商360度查询-导航菜单
 * @date: 2018-08-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import classnames from 'classnames';
import React, { PureComponent } from 'react';
import { Icon, Anchor } from 'choerodon-ui';
import Bind from 'lodash-decorators/bind';
import styles from './index.less';

/**
 * 锚点组件Anchor的Link组件
 */
const { Link } = Anchor;

/**
 * 供应商360度查询 - 锚点菜单
 * @extends {Component} - React.Component
 * @reactProps {Object} catalogList - 数据源
 * @return React.element
 */
export default class AffixMenu extends PureComponent {
  state = {
    anchorShow: false,
  };

  /**
   * 导航栏的显示／隐藏
   */
  @Bind()
  toggleAnchor() {
    const { anchorShow } = this.state;
    this.setState({ anchorShow: !anchorShow });
  }

  @Bind()
  Node(serialNumber, configDescription) {
    const level = serialNumber - Math.floor(serialNumber);
    return (
      <div className="affix-menu-text">
        <span className={`first-menu-number-${level ? 2 : 1}`}>{serialNumber}</span>
        <span className={`first-menu-description-${level ? 2 : 1}`}>{configDescription}</span>
      </div>
    );
  }

  render() {
    const { anchorShow } = this.state;
    const { catalogList = [] } = this.props;
    return (
      <div
        className={classnames(styles['page-anchor-container'], {
          [styles['toggle-show']]: !anchorShow,
        })}
      >
        <div className={styles['anchor-icon']} onClick={this.toggleAnchor}>
          <Icon
            type="baseline-arrow_right"
            className={
              anchorShow ? styles['anchor-icon-custom-right'] : styles['anchor-icon-custom-left']
            }
            style={{ fontSize: 27, marginLeft: -8 }}
          />
        </div>
        <div className={classnames(styles['anchor-content'])}>
          <Anchor
            getContainer={() =>
              document.getElementsByClassName('page-container')[0] || document.body
            }
          >
            {catalogList.length > 0 &&
              catalogList.map((item) => {
                return (
                  <Link
                    key={item.serialNumber}
                    href={`#${item.configName}`}
                    title={this.Node(item.serialNumber, item.configDescription)}
                  />
                );
              })}
          </Anchor>
        </div>
      </div>
    );
  }
}
