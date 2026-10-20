import React, { useEffect } from 'react';
import querystring from 'querystring';

import temporarily from '@/assets/temporarily-no-data.svg';
// import { API_HOST } from 'utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';
// import { SRM_INTERFACE } from '_utils/config';

// const organizationId = getCurrentOrganizationId();

function ToExternal(props) {
  const {
    location: { search },
  } = props;
  const { sendRedirect } = querystring.parse(search.substr(1));
  useEffect(() => {
    // const url = `${API_HOST}${SRM_INTERFACE}/v1/${organizationId}/file/to-external?encUnilink=${encUnilink}`;
    window.open(sendRedirect, '_self');
  }, [sendRedirect]);

  return (
    <div style={{ textAlign: 'center' }}>
      <img src={temporarily} alt="" style={{ marginTop: '35px' }} />
    </div>
  );
}

export default ToExternal;
