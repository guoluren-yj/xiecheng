/**
 * AffixMenu - 比价助手/历史价格分析导航菜单
 * @date: 2020-1-07
 * @author: juan.chen01@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import style from './index.less';

/**
 * 比价助手/本次报价过程/历史价格分析 - 锚点菜单
 * @extends {Component} - React.Component
 * @reactProps {Object} catalogList - 数据源
 * @return React.element
 */
export default class SidebarMenu extends PureComponent {
  handleEnter = (e, name) => {
    if (e.target.scrollHeight > e.target.clientHeight) {
      Tooltip.show(e.target, {
        title: name,
        placement: 'leftTop',
      });
    }
  };

  handleLeave = () => {
    Tooltip.hide();
  };

  render() {
    const {
      dataSource = [],
      activeId,
      onClickItemBar,
      isShowItemNum = false,
      remote,
      bidFlag = false,
      currentProps = {},
    } = this.props;
    const renderTooltipTitle = (item) => (
      <div>
        <div>
          {intl.get('ssrc.priceComparison.model.comparison.sidebar.itemNum').d('行号')}：
          {item.itemNum}
        </div>
        <div>
          {intl.get('ssrc.priceComparison.model.priceComparison.itemCode').d('物料编码')}：
          {item.itemCode}
        </div>
        <div>
          {intl.get('ssrc.priceComparison.model.priceComparison.itemName').d('物料名称')}：
          {item.itemName}
        </div>
      </div>
    );

    return (
      <div className={style['sidebar-menu']}>
        {dataSource &&
          dataSource.map((item) => {
            return (
              <div
                onClick={() => onClickItemBar(item.rfxLineItemId, item.itemId, item)}
                className={
                  item.rfxLineItemId === activeId
                    ? style['sidebar-menu-item-active']
                    : style['sidebar-menu-item']
                }
              >
                {/* isShowItemNum（历史价格分析tab） 展示行号-名称 否则显示编码名称 */}
                {isShowItemNum ? (
                  <Tooltip
                    placement="right"
                    title={
                      remote
                        ? remote.render(
                            'srm-front-ssrc/priceComparison_RENDER_TOOLTIP_TITLE',
                            renderTooltipTitle(item),
                            {
                              bidFlag,
                              item,
                              currentProps,
                            }
                          )
                        : renderTooltipTitle(item)
                    }
                  >
                    {`${item.itemNum}-${item.itemName}`}
                  </Tooltip>
                ) : (
                  <div
                    className={style['sidebar-menu-concatName']}
                    onMouseEnter={(e) => this.handleEnter(e, item.concatName)}
                    onMouseLeave={this.handleLeave}
                  >
                    {`${item.concatName}`}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    );
  }
}
