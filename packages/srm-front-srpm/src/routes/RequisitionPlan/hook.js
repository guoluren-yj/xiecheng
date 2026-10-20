import React, { useState } from 'react';

export function getTabsPropsCallback({ components, callback = () => {} }) {
  const [initFlag, setInitFlag] = useState(false);

  const { init } = components?.props?.value?.cache['SRPM.RP_PLATFORM.OVERALL.TAB'];

  if (init && !initFlag) {
    setInitFlag(true);
    callback(components?.props);
  }

  return <>{components}</>;
}
