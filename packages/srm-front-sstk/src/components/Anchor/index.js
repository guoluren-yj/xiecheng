import React, { useState, useEffect } from 'react';
import { Anchor, Icon } from 'choerodon-ui';
import style from './index.less';

const { Link } = Anchor;

export default function AnchorPro(props) {
  const { list = [] } = props;
  const [targetOffset, setTargetOffset] = useState();
  const [show, setShow] = useState(true);
  useEffect(() => {
    setTargetOffset(window.innerHeight / 2);
  }, []);
  return (
    <div className={style['sagm-anchor']} style={{ right: show ? 18 : -220 }}>
      <div className="anchor-control" onClick={() => setShow(!show)}>
        <Icon type={show ? 'baseline-arrow_right' : 'baseline-arrow_left'} />
      </div>
      <Anchor
        showInkInFixed
        targetOffset={targetOffset}
        getContainer={() => document.querySelector('.page-container')}
      >
        {list.map((m) => (
          <Link key={m.anchorKey} href={`#${m.anchorKey}`} title={m.title} />
        ))}
      </Anchor>
    </div>
  );
}
