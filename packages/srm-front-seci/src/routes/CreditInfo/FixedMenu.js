/**
 * FixedMenu - 认证信息展示 - 固定菜单
 * @date: 2018-12-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Anchor, Affix } from 'hzero-ui';
import intl from 'utils/intl';

/**
 * 锚点组件Anchor的Link组件
 */
const { Link } = Anchor;

/**
 * 认证信息展示 - 锚点菜单
 * @extends {Component} - React.Component
 * @reactProps {Object} catalogList - 数据源
 * @return React.element
 */
export default class FixedMenu extends PureComponent {
  render() {
    const catalogList = [
      {
        targetNum: 1,
        targetName: 'company-information',
        title: `1-${intl
          .get(`seci.creditInfo.view.message.meun.companyInformation`)
          .d('工商基本信息')}`,
      },
      {
        targetNum: 2,
        targetName: 'change-recordn',
        title: `2-${intl.get(`seci.creditInfo.view.message.meun.changeRecordn`).d('工商变更')}`,
      },
      {
        targetNum: 3,
        targetName: 'shareholder-information',
        title: `3-${intl
          .get(`seci.creditInfo.view.message.meun.shareholderInformation`)
          .d('股东信息')}`,
      },
      {
        targetNum: 4,
        targetName: 'abnormal-item',
        title: `4-${intl.get(`seci.creditInfo.view.message.meun.abnormalItem`).d('经营异常')}`,
      },
    ];
    return (
      <Affix
        offsetTop={120}
        target={() => {
          return document.getElementsByClassName('scoll-area')[0];
        }}
      >
        <Anchor
          getContainer={() => {
            return document.getElementsByClassName('scoll-area')[0];
          }}
        >
          {catalogList.length > 0 &&
            catalogList.map(item => {
              return <Link key={item.targetNum} href={`#${item.targetName}`} title={item.title} />;
            })}
        </Anchor>
      </Affix>
    );
  }
}
