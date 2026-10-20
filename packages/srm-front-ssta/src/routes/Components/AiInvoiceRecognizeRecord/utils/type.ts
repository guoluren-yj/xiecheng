export enum AiRecognizeStatus {
  Pending = 'identifying',
  Success = 'success',
  Fail = 'fail',
}

export const getAiRecognizeSearchCode = (isSupplier: boolean) => {
  const prefix = isSupplier ? 'SSTA.INVOICE_AI_RECOGNIZE_RECORD_SUP' : 'SSTA.INVOICE_AI_RECOGNIZE_RECORD';
  return {
    [AiRecognizeStatus.Pending]: `${prefix}.FILTER_PENDING`,
    [AiRecognizeStatus.Success]: `${prefix}.FILTER_SUCCESS`,
    [AiRecognizeStatus.Fail]: `${prefix}.FILTER_FAIL`,
  };
};