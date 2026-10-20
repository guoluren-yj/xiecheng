interface FailureResponse {
  failed: true;
  code: string;
  message: string;
  type: string;
}

export default function isFailureResponse(response: any): response is FailureResponse {
  return response && response.failed;
}

// declare global {
//   var isFailureResponse: (response: any) => response is FailureResponse
// }
