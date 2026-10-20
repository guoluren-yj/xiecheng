import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';
import { FieldType } from '../../data-set/enum';

export default function attachmentError(
  _,
  validatorBaseProps: ValidatorBaseProps,
  getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T],
): PromiseLike<methodReturn> | methodReturn {
  const type = getProp('type');
  const attachmentValidHook = getProp("attachmentValidHook");
  if (attachmentValidHook) {
    return attachmentValidHook();
  }
  if (type === FieldType.attachment) {
    const attachments = getProp('attachment');
    if (attachments) {
      const { length } = attachments;
      const min = Number(getProp('min'));
      if (min && min > 0 && length < min) {
        const injectionOptions = { min, length };
        const ruleName = 'attachmentError';
        const {
          [ruleName]: validationMessage = $l('Validator', 'too_short_attachment'),
        } = getProp('defaultValidationMessages') || {};
        return new ValidationResult({
          validationProps: { ...validatorBaseProps },
          validationMessage,
          injectionOptions,
          value: attachments,
          ruleName,
        });
      }
      const uploadErrorFiles = attachments.filter(({ status, invalid }) => invalid || status === 'error' || status === 'uploading');
      if (uploadErrorFiles.length) {
        const ruleName = 'attachmentError';
        const {
          [ruleName]: validationMessage = $l('Validator', uploadErrorFiles[0].status === 'uploading' ? 'uploading' : 'upload_error'),
        } = getProp('defaultValidationMessages') || {};

        return new ValidationResult({
          validationProps: { ...validatorBaseProps },
          validationMessage,
          injectionOptions: uploadErrorFiles,
          value: attachments,
          ruleName,
        });
      }
    }
  }
  return true;
}
