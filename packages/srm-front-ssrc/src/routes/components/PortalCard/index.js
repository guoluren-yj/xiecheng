import React, { useEffect, useState } from 'react';
import { Nav } from 'srm-front-boot/lib/components/PortalCard';
import Cookies from 'universal-cookie';
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';

import { getResponse, setSession } from 'utils/utils';

const cookies = new Cookies();
const language = cookies.get('language') || 'zh_CN';
const srmOauth = window.sessionStorage.getItem(`${language}-srm.portal`);

export const MyNav = ({ tenantId }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (srmOauth) {
      setVisible(true);
    } else {
      // eslint-disable-next-line no-lonely-if
      if (tenantId) {
        request(
          `${HZERO_PLATFORM}/v1/${tenantId}/prompt/${language}?promptKey=srm.oauth,smbl.common,hzero.common`
        )
          .then((res) => {
            if (getResponse(res)) {
              setSession(`${language}-srm.portal`, res);
              setVisible(true);
              return res;
            }
          })
          .finally(() => {
            setVisible(true);
          });
      } else {
        setVisible(true);
      }
    }
  }, []);
  return <>{visible ? <Nav auto /> : ''}</>;
};
