import React, { PureComponent } from 'react';
import PositionAnchor from '_components/PositionAnchor';

const { Link } = PositionAnchor;

export default class FixedAnchor extends PureComponent {
  /**
   * getAffixContainer-获取给 Affix 组件使用的元素
   * @return {HTMLElement}
   */

  getAffixContainer = (classname) => {
    return document.getElementById(classname || 'ssta-detail-content');
  };

  formatRender = () => {
    const { linkList = [], className, currentOffsetTop } = this.props;
    return (
      <PositionAnchor
        currentAnchorContainer={() => this.getAffixContainer(className)}
        currentOffsetTop={currentOffsetTop || 24}
      >
        {linkList.map((item) => {
          const { key, title } = item;
          return <Link key={item.code} href={`#${key}`} title={title} />;
        })}
      </PositionAnchor>
    )
  }

  render() {
    const { customizeCollapse, code } = this.props;
    if (customizeCollapse) {
      return customizeCollapse(
        {
          code,
        },
        this.formatRender()
      );
    } else {
      return this.formatRender();
    }
  }
}
