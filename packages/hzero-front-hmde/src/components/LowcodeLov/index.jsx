import React from 'react';
import { Lov } from 'choerodon-ui/pro';
import globalStyles from '@/lowcodeGlobalStyles/global.less';

export default (props) => {
  const { modalProps = {} } = props;
  return (
    <Lov
      {...props}
      modalProps={{
        ...modalProps,
        className: `lowcode-m-modal ${globalStyles['lowcode-m-modal']}`,
      }}
    />
  );
};
