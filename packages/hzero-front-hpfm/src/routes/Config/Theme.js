/**
 * Theme - 主题配置
 * @date: 2022-7-12
 * @author: huazhen.wu01 <huazhen.wu01@going-link.com>
 */
import React, { Component } from 'react';
import intl from 'hzero-front/lib/utils/intl';
import notification from "hzero-front/lib/utils/notification";

export default class System extends Component {

  toThemeConfig = () => {
    const { global: { menuLeafNode } } = window.dvaApp._store.getState();
    if (menuLeafNode && menuLeafNode.length) {
      const themeConfigFlag = menuLeafNode.find(m => m.path === "/hiam/theme-config");
      if (themeConfigFlag) {
        window.dvaApp._store.dispatch(
          window.routerRedux.push({ pathname: "/hiam/theme-config" })
        );
      } else {
        notification.error({ message: intl.get('hpfm.config.error.assignThemeMenu').d("请联系管理员分配“主题与页面布局”菜单")});
      }
    }
  }

  render() {
    return (
      <div>
        {intl.get('hpfm.config.view.title.themeJumpTip').d("主题相关配置迁移至“主题与页面布局”下，请跳转查看")}
        <div>
          <a onClick={this.toThemeConfig}>
            {intl.get('hzero.common.message.jump')}
          </a>
        </div>
      </div>
    );
  }
}
