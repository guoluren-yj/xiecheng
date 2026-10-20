import React, { useState, useEffect } from 'react';
import { Anchor, Icon } from 'choerodon-ui';
import style from './index.less';

const { Link } = Anchor;

export default function AnchorPro(props) {
  const { list = [], wrapperHeight = 144, wrapperWidth = 220 } = props;
  const [targetOffset, setTargetOffset] = useState();
  const [show, setShow] = useState(true);

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
  }, []);
  return (
    <div
      className={style['sagm-anchor']}
      style={{ right: show ? 18 : -wrapperWidth, height: wrapperHeight, width: wrapperWidth }}
    >
      <div className="anchor-control" onClick={() => setShow(!show)}>
        <Icon type={show ? 'baseline-arrow_right' : 'baseline-arrow_left'} />
      </div>
      <Anchor
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
