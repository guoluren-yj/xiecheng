import React, { useState } from 'react';

export function getTabsPropsCallback({ components, callback = () => {} }) {
  const [initFlag, setInitFlag] = useState(false);

  const { init } = components?.props?.value?.cache['SMDM.MATERIAL_CERTIFICATION_POOL.TABS'];

  if (init && !initFlag) {
    setInitFlag(true);
    callback(components?.props);
  }

  return <>{components}</>;
}
