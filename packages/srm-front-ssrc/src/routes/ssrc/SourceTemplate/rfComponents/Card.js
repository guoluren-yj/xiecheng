import React from 'react';
import { Icon } from 'choerodon-ui/pro';

const Card = (props) => {
  const { component, id, title, validateFlag } = props;

  return (
    <div className="rf-card-warp" id={id}>
      {title && (
        <div className="rf-card-title">
          {title}
          {validateFlag ? (
            <Icon type="check_circle" style={{ color: '#71ab42', marginLeft: '8px' }} />
          ) : null}
        </div>
      )}
      <div className="rf-card-content">{component}</div>
    </div>
  );
};

export default Card;
