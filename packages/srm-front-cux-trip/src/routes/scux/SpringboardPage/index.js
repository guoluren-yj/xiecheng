import React, { useEffect } from 'react';
import { Spin } from 'choerodon-ui';

import { getAccessToken, getCurrentOrganizationId, getResponse } from 'utils/utils';
import request from 'utils/request';
import queryString from 'querystring';

const Index = (props) => {

  const { location: { search } = {}, history } = props;

  const { documentNum } = queryString.parse((search || '').substr(1));

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const res = await request(`/marmot/v1/${getCurrentOrganizationId()}/marmot-api/RDdrayHHg8SSp1JriaZIgiakYribticZ4ZiacwLuvemrmbC8`, {
      method: 'GET',
      query: { documentNum },
    });
    if (getResponse(res) && res.uri) {
      history.push(res.uri);
    };
  };

  return (
    <Spin />
  );
};

export default Index;
