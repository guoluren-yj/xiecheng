import React, { PureComponent } from 'react';
import PositionAnchor from '_components/PositionAnchor';

const { Link } = PositionAnchor;

export default class FixedAnchor extends PureComponent {
  /**
   * getAffixContainer-获取给 Affix 组件使用的元素
   * @return {HTMLElement}
   */
  getAffixContainer = (classname) => {
    return document.getElementById(classname) || document.body;
  };

  formatLinkList = () => {
    const { linkList = [], unitConfig } = this.props;
    if (unitConfig) {
      const { fields: unitFields = [] } = unitConfig;
      return linkList.map((item) => {
        const findItem = unitFields.find((i) => i.fieldCode === item.code);
        return findItem ? { ...item, title: findItem.fieldName || item.title } : item;
      });
    } else {
      return linkList;
    }
  };

  render() {
    const { className, code, customizeCollapse } = this.props;
    const linkList = this.formatLinkList();
    return customizeCollapse(
      {
        code,
      },
      <PositionAnchor
        currentAnchorContainer={() => this.getAffixContainer(className)}
        currentOffsetTop={24}
      >
        {linkList.map((item) => {
          const { key, title } = item;
          return <Link key={item.code} href={`#${key}`} title={title} />;
        })}
      </PositionAnchor>
    );
  }
}
