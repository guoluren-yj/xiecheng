import React, { PureComponent, cloneElement } from 'react';
import PositionAnchor from '_components/PositionAnchor';

const { Link } = PositionAnchor;

export default class NavigationAnchor extends PureComponent {
  /**
   * getAffixContainer-获取给 Affix 组件使用的元素
   * @return {HTMLElement}
   */

  getAffixContainer = () => {
    const { id } = this.props;
    return document.getElementById(id || 'ssta-detail-content');
  };

  customizeAnchor = (custConfig, component) => {
    if (custConfig) {
      const { fields = [] } = custConfig;
      const { props: anchorProps } = component;
      const { children } = anchorProps;
      const newChildren = [];
      children.forEach((child) => {
        const { key, props: linkProps } = child;
        const customizeLinkProps = fields.find((item) => item.fieldCode === key);
        if (customizeLinkProps) {
          const { visible, seq, fieldName = linkProps.title } = customizeLinkProps;
          if (visible !== 0) {
            newChildren.push({ ...child, props: { ...linkProps, seq, title: fieldName } });
          }
        } else {
          newChildren.push(child);
        }
      });
      const sortNewChildren = newChildren.sort((a, b) => {
        return a.props.seq - b.props.seq;
      });
      return cloneElement(component, { children: sortNewChildren });
    } else {
      return component;
    }
  };

  render() {
    const { custConfig, linkList, currentOffsetTop } = this.props;
    return this.customizeAnchor(
      custConfig,
      <PositionAnchor
        currentAnchorContainer={this.getAffixContainer}
        currentOffsetTop={currentOffsetTop || 24}
      >
        {linkList
          .filter((item) => item)
          .map((item) => {
            const { key, href, title } = item;
            return <Link key={key} href={`#${href}`} title={title} />;
          })}
      </PositionAnchor>
    );
  }
}
