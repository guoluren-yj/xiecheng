import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';

export const fieldValidator = ({
  record,
  value,
  name,
  zeroAndPositiveError, // 大于等于0
  maxCheck, // 不能超过的字段
  minCheck, // 大于等于某个字段
  overBeforeValueFlag, // 当前行字段值大于表格前面的值,
  lessAnotherField, // 当前行字段值大于表格之前的某个字段的值
  mustEqualLastToField, // 当前行开始值必须等于上一行结束值
}) => {
  const text = record.dataSet.getField(name).get('label');
  const maxValue = record.get(maxCheck);
  const minValue = record.get(minCheck);
  const currentIndex = record.index;
  let existCurrentValueLessBeforeFlag = false;
  let nextFirstOverBeforeLastValueFlag = false; // 当前【从】应大于之前行所有【至】的值
  let notEqualLastToFieldValueFlag = false; // 当前【从】必须等于上一行【至】的值
  if (currentIndex >= 1) {
    const beforeRecords = record.dataSet.slice(0, currentIndex);
    beforeRecords.forEach(beforeRecord => {
      const beforeValue = beforeRecord.get(name);
      const anotherValue = beforeRecord.get(lessAnotherField);
      if (value && beforeValue && math.minus(value, beforeValue) <= 0) {
        existCurrentValueLessBeforeFlag = true;
      }
      if (value && anotherValue && math.minus(value, anotherValue) < 0) {
        nextFirstOverBeforeLastValueFlag = true;
      }
    });

    const lastRecord = record.dataSet.get(currentIndex - 1);
    const lastToFieldValue = lastRecord.get(mustEqualLastToField);
    if (value && lastToFieldValue && math.minus(value, lastToFieldValue) !== 0) {
      notEqualLastToFieldValueFlag = true;
    }
  }

  if (zeroAndPositiveError && value < 0) {
    return intl
      .get(`spfp.common.message.validate.mustBeOrOverZero`, { text })
      .d(`{text}须大于等于零`);
  }
  if (maxCheck && math.minus(maxValue, value) <= 0) {
    const maxText = record.dataSet.getField(maxCheck).get('label');
    return intl
      .get(`spfp.common.message.validate.cannotExceed`, { text, maxText })
      .d(`{text}须小于{maxText}`);
  }
  if (minCheck && math.minus(minValue, value) > 0) {
    const minText = record.dataSet.getField(minCheck).get('label');
    return intl
      .get(`spfp.common.message.validate.beOrOver`, { text, minText })
      .d(`{text}须大于等于{minText}`);
  }
  if (overBeforeValueFlag && existCurrentValueLessBeforeFlag) {
    return intl
      .get(`spfp.common.message.validate.mustOverBeforeValue`, { text })
      .d(`{text}须大于表格前面的值`);
  }
  if (lessAnotherField && nextFirstOverBeforeLastValueFlag) {
    const anotherText = record.dataSet.getField(lessAnotherField).get('label');
    return intl
      .get(`spfp.common.message.validate.mustOverBeforeAnotherFieldValue`, {
        text,
        anotherText,
      })
      .d(`{text}须大于等于表格前面字段{anotherText}的值`);
  }
  if (mustEqualLastToField && notEqualLastToFieldValueFlag) {
    const lastToText = record.dataSet.getField(mustEqualLastToField).get('label');
    return intl
      .get(`spfp.common.message.validate.mustEqualLastToValue`, {
        text,
        lastToText,
      })
      .d(`{text}须等于上一行字段{lastToText}的值`);
  }
  return true;
};
