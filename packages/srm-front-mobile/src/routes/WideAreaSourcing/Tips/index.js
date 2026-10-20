import React, { useState } from 'react';
import { Icon } from 'choerodon-ui';
import './index.less';

const Tips = (props) => {
  const { title, showClose = true } = props;
  const [closed, setClosed] = useState(false);
  return (
    !closed && (
      <div className="widearea-tips">
        <div className="tips-left">
          <Icon type="error" />
          <div className="tips-text"> {title}</div>
        </div>
        {showClose && <Icon type="close" onClick={() => setClosed(true)} />}
      </div>
    )
  );
};

export default Tips;
