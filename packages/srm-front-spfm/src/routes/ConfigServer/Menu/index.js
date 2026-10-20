/*
 * Menu - 导航组件
 * @date: 2018/09/07 16:40:33
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import Anchor from '../components/Anchor';

const { Link } = Anchor;
export default class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuList: props.menuList || [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { menuList = [] } = nextProps;
    const curMenu = this.props.menuList.map(i => ({ title: i.title, key: i.key, href: i.href }));
    const nextMenu = nextProps.menuList.map(i => ({ title: i.title, key: i.key, href: i.href }));
    // 新旧props对比 更新state
    if (JSON.stringify(curMenu) !== JSON.stringify(nextMenu)) {
      this.setState({ menuList });
    }
  }

  @Bind()
  handleClickAnchor(e) {
    e.preventDefault();
  }

  render() {
    const { menuList } = this.state;
    const { getContainer, configHideArr } = this.props;
    return (
      <Anchor getContainer={getContainer} onClick={this.handleClickAnchor}>
        {menuList.map(item => {
          if (configHideArr.includes(item.href)) {
            return null;
          } else {
            return <Link key={item.href} href={item.href} title={item.title} />;
          }
        })}
      </Anchor>
    );
  }
}
