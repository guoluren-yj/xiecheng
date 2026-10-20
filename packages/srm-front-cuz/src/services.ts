import request from 'utils/request';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import { HZERO_PLATFORM } from 'utils/config';

export async function queryUnitCustConfigPost(params, queryParams: any = {}, uiQueryError) {
  const { __public__ = false, ...others } = queryParams;
  return getResponse(
    await request(
      `${HZERO_PLATFORM}/v1/${__public__ ? '' : `${getCurrentOrganizationId()}/`}ui-customize`,
      {
        body: params,
        query: others,
        method: 'POST',
      },
      { beforeCatch: e => {uiQueryError();throw e;} },
    ),
    undefined
  );
}

export async function queryTemplateConfig(params, uiQueryError) {
  return getResponse(
    await request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/ui-template`, {
      query: params,
      method: 'POST',
    },
    { beforeCatch: e => {uiQueryError();throw e;} }),
    undefined
  );
}