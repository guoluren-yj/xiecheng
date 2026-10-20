export function getCustomizeCode({ tab, nodeConfigIndexAbc }) {
  const customizeList = [];
  for (let i = 0; i < 11; i++) {
    const index = String.fromCharCode(65 + i);
    switch (tab) {
      case 'one':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.WAIT.${nodeConfigIndexAbc || index}`,
          `SINV.RECEIPT_WORKBENCH_THING.WAIT_SEARCH`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${nodeConfigIndexAbc || index}`
        );
        break;
      case 'two':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc || index}`,
          `SINV.RECEIPT_WORKBENCH_THING.COURSE.ASN.${nodeConfigIndexAbc || index}`,
          `SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE_${nodeConfigIndexAbc || index}`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE.ASN_${nodeConfigIndexAbc || index}`
        );
        break;
      case 'three':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.END.DAN.${nodeConfigIndexAbc || index}`,
          `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${nodeConfigIndexAbc || index}`,
          `SINV.RECEIPT_WORKBENCH_THING.END_SEARCH`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.DAN_${nodeConfigIndexAbc || index}`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.HAN_${nodeConfigIndexAbc || index}`
        );
        break;
      case 'four':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.RETURN.${nodeConfigIndexAbc || index}`,
          `SINV.RECEIPT_WORKBENCH_THING.RETURN_SEARCH`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.RETURN_${nodeConfigIndexAbc || index}`
        );
        break;
      case 'five':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.COURSE.${nodeConfigIndexAbc || index}`,
          `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.ASN.${nodeConfigIndexAbc || index}`,
          `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM_${nodeConfigIndexAbc || index}`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM.ASN.${nodeConfigIndexAbc || index}`
        );
        break;
      default:
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.WAIT.${nodeConfigIndexAbc || index}`,
          `SINV.RECEIPT_WORKBENCH_THING.WAIT_SEARCH`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${nodeConfigIndexAbc || index}`
        );
        break;
    }
  }
  return customizeList;
}

export function getCustomizeBtnCode(tab) {
  const customizeList = [];
  for (let i = 0; i < 11; i++) {
    const index = String.fromCharCode(65 + i);
    switch (tab) {
      case 'one':
        customizeList.push(`SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${index}`);
        break;
      case 'two':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE_${index}`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE.ASN_${index}`
        );
        break;
      case 'three':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.DAN_${index}`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.HAN_${index}`
        );
        break;
      case 'four':
        customizeList.push(`SINV.RECEIPT_WORKBENCH_THING.BUTTON.RETURN_${index}`);
        break;
      case 'five':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM_${index}`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM.ASN.${index}`
        );
        break;
      default:
        customizeList.push(`SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${index}`);
        break;
    }
  }
  return customizeList;
}

export function getCustomizeBtnCodes({ nodeConfigIndexAbc }) {
  const customizeList = [];
  for (let i = 0; i < 11; i++) {
    const index = String.fromCharCode(65 + i);
    customizeList.push(
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE.ASN_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.DAN_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.HAN_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.RETURN_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM.ASN.${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.WAIT.${nodeConfigIndexAbc || 'K'}`,
      `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc || 'K'}`,
      `SINV.RECEIPT_WORKBENCH_THING.COURSE.ASN.${nodeConfigIndexAbc || 'K'}`,
      `SINV.RECEIPT_WORKBENCH_THING.END.DAN.${nodeConfigIndexAbc || 'K'}`,
      `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${nodeConfigIndexAbc || 'K'}`,
      `SINV.RECEIPT_WORKBENCH_THING.RETURN.${nodeConfigIndexAbc || 'K'}`,
      `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.COURSE.${nodeConfigIndexAbc || 'K'}`,
      `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.ASN.${nodeConfigIndexAbc || 'K'}`
    );
  }
  return customizeList;
}
