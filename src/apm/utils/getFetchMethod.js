import isRequest from './isRequest';

export default function getFetchMethod(request, requestInit, Request) {
  const method = requestInit && requestInit.method || 'get';
  return (isRequest(request, Request) ? request.method || method : method).toLowerCase();
}
