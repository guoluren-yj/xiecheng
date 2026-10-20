import React, { useState, useEffect } from 'react';
import { Anchor, Icon } from 'choerodon-ui';
import PositionAnchor from '_components/PositionAnchor';
import style from './index.less';

const { Link, AnchorToolTip } = PositionAnchor;

export default function AnchorList(props) {
  const { list = [], container } = props;

  const getLinks = (links = []) => {
    return links.map((m) => {
      const { show, anchorKey, title, children } = m;
      if (show === false) return null;
      if (children && children.length) {
        return (
          <Link key={anchorKey} href={`#${anchorKey}`} title={AnchorToolTip(title)}>
            {getLinks(children)}
          </Link>
        );
      }
      return <Link key={anchorKey} href={`#${anchorKey}`} title={AnchorToolTip(title)} />;
    });
  };

  return (
    <PositionAnchor
      offsetTop={150}
      getContainer={() =>
        container || document.querySelector('.page-content-wrap') || document.body
      }
    >
      {getLinks(list)}
    </PositionAnchor>
  );
}

export function AnchorPro(props) {
  const { list = [], wrapperHeight = 144, wrapperWidth = 220 } = props;
  const [targetOffset, setTargetOffset] = useState();
  const [show, setShow] = useState(true);
  const [containerWidth, setWidth] = useState(wrapperWidth);

  const _list = [];

  let isLevel;

  const getList = (l = [], level) => {
    l.forEach((f) => {
      if (f.show !== false) {
        _list.push({ ...f, level });
      }
      if (f.children) {
        isLevel = true;
        getList(f.children, level + 1);
      }
    });
  };

  getList(list, 1);

  useEffect(() => {
    setTargetOffset(window.innerHeight / 2);
    const container = document.querySelector(`.${style['sagm-anchor']}`);
    if (container) {
      const { width } = getComputedStyle(container);
      if (width) {
        setWidth(width.split('px')[0]);
      }
    }
  }, []);

  return (
    <div
      className={style['sagm-anchor']}
      style={{ right: show ? 18 : -containerWidth, height: wrapperHeight, minWidth: wrapperWidth }}
    >
      <div className="anchor-control" onClick={() => setShow(!show)}>
        <Icon type={show ? 'baseline-arrow_right' : 'baseline-arrow_left'} />
      </div>
      <Anchor
        style={{ paddingRight: 16 }}
        showInkInFixed
        targetOffset={targetOffset}
        getContainer={() => document.querySelector('.page-container')}
      >
        {_list.map((m) => (
          <Link
            key={m.anchorKey}
            href={`#${m.anchorKey}`}
            title={m.title}
            className={isLevel ? (m.level === 1 ? 'link-level-1' : 'link-level-2') : ''}
          />
        ))}
      </Anchor>
    </div>
  );
}
