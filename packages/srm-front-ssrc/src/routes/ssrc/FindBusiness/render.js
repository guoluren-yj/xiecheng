import intl from 'utils/intl';

export function sizeChangerRenderer({ text }) {
  return intl
    .get(`srm.common.view.message.numberPage`, {
      num: text,
    })
    .d(`{num}条/页`);
}
