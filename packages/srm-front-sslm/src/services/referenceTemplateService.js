import request from 'utils/request';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const queryInvestigateListOrg = {
  url: `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-templates/real`,
  method: 'GET',
};
const changeInvestigateParams = {
  url: `${SRM_PLATFORM}/v1/investigate-templates`,
  method: 'POST',
};
const saveReferenceTemplateOrgParams = {
  url: `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/dup-investgconfigs`,
  method: 'PUT',
};
const saveReferenceTemplateSiteParams = {
  url: `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/dupspfm-investgconfigs`,
  method: 'PUT',
};
const queryInvestigateListSiteParams = {
  url: `${SRM_PLATFORM}/v1/investigate-templates`,
  method: 'GET',
};
export async function fetchInvestigateListOrg(params) {
  return request(queryInvestigateListOrg.url, {
    method: queryInvestigateListOrg.method,
    query: params,
  });
}
export async function fetchInvestigateListSite(params) {
  return request(queryInvestigateListSiteParams.url, {
    method: queryInvestigateListSiteParams.method,
    query: params,
  });
}
export async function changeInvestigate(params) {
  return request(changeInvestigateParams.url, {
    method: changeInvestigateParams.method,
    body: params,
  });
}
export async function saveReferenceTemplateOrg(params) {
  return request(saveReferenceTemplateOrgParams.url, {
    method: saveReferenceTemplateOrgParams.method,
    query: params,
  });
}
export async function saveReferenceTemplateSite(params) {
  return request(saveReferenceTemplateSiteParams.url, {
    method: saveReferenceTemplateSiteParams.method,
    query: params,
  });
}
