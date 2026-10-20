import React, { memo } from 'react';
import { observer } from 'mobx-react-lite';

import Attachment from './Attachment';

export default memo(
  observer((props) => {
    const { basicInfoDs, ...rest } = props;
    const info = basicInfoDs.current?.toJSONData() || {};
    const newProps = {
      ...rest,
      info,
    };
    return <Attachment {...newProps} />;
  })
);
