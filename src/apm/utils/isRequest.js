export default function isRequest(request, Request) {
  return request instanceof Request;
}
