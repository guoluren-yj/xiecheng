// import request from 'utils/request';
// import { getCurrentOrganizationId } from 'utils/utils';

// const organizationId = getCurrentOrganizationId();

// export async function beforeGenerate(params) {
//   const { serviceFlag } = params;
//   const urlHead = `/${serviceFlag}`;
//   return request(`${urlHead}/v1/${organizationId}/payment-orders/before-generate`, {
//     body: params,
//     method: 'POST',
//   });
// }

// export async function getOpenService() {
//   return request(`/spct/v1/${organizationId}/configs/open-service`, {
//     method: 'GET',
//     responseType: 'text',
//   });
// }
