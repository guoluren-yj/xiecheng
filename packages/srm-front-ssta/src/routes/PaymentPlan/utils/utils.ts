import { notification } from 'choerodon-ui';
import type { DataSet } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import intl from 'utils/intl';

// record上错误信息
interface RecordError {
  num: number;
  labelList: string[],
};

// dataSet所有records的错误信息
interface DataSetError {
  validationCode: string;
  validationTitle: string;
  errorInfoList: RecordError[];
};

interface CustomizeParams {
  lineNum?: string,
};

// 收集单个ds的错误信息供提示使用
export const collectDsErrors: (dataSet: DataSet, customizeParams?: CustomizeParams) => boolean | DataSetError = (dataSet, customizeParams) => {
  const { lineNum = "lineNum" } = customizeParams || {};
  const errorInfoList: RecordError[] = [];
  const errorList = dataSet.getValidationErrors();
  const { validationCode, validationTitle } = dataSet.props as any;
  errorList.forEach(error => {
    const { errors: recordErrors, record } = error;
    // 自定义校验errors中没有label信息
    const recordErrorFieldList = recordErrors.map(item => item.field);
    const recordErrorLabelList = recordErrorFieldList.map(field => field.get('label'));
    errorInfoList.push({
      num: record.get(lineNum) || record.index + 1,
      labelList: recordErrorLabelList,
    });
  });
  const dataSetErrorInfo: DataSetError = {
    validationCode,
    validationTitle,
    errorInfoList,
  };
  return errorInfoList.length !== 0 && dataSetErrorInfo;
};


// 收集多个ds的错误信息供提示使用
export const collectDsListErrors: (dsList: DataSet[], customizeParams?: CustomizeParams) => DataSetError[] = (dsList, customizeParams) => {
  const allErrors = dsList.reduce<DataSetError[]>((total: DataSetError[], dataSet: DataSet) => {
    const errorInfo = collectDsErrors(dataSet, customizeParams);
    return errorInfo ? [...total, errorInfo] as DataSetError[] : total;
  }, []);
  return allErrors;
};

// 其他功能可能会用到
export const notifyValidErrors: (dataSet: DataSet) => void = (dataSet) => {
  const allErrors = collectDsListErrors([dataSet].concat(Object.values(dataSet.children)));
  const errorTextList = allErrors.map(dsError => {
    const { validationCode, validationTitle, errorInfoList } = dsError as any;
    const errorTextPrefix = intl.get(`ssta.paymentPlan.view.message.inValidationTitle`, { validationTitle }).d(`【{validationTitle}】中，`);
    const errorTextContent = errorInfoList.map(errorInfo => {
      const { num, labelList } = errorInfo;
      const numPrefix = validationCode === 'header' ? '' : intl.get(`ssta.paymentPlan.view.message.rowNum`, { num }).d(`第{num}行，`);
      const labelContent = labelList.join('、');
      return numPrefix + labelContent;
    }).join('；');
    return errorTextPrefix + errorTextContent;
  });
  notification.error({
    message: intl.get('ssta.paymentPlan.view.validation.fieldEmptyOrBadFormat').d('操作失败，失败原因是存在必填字段未维护，或格式维护不正确，请将鼠标悬浮于问题字段，查看维护提示，问题字段如下：'),
    description: errorTextList.join('\n'),
    style: {
      whiteSpace: 'pre-line',
    },
  });
};

// 区分整单-详情tabKeys
export function splitWholeAndDetailTabKeys<U extends string>(allTabKeys: U[]) {
  return allTabKeys.reduce<Record<string, U[]>>((total, item) => {
    if (item.startsWith('detail')) total.detailKeys.push(item);
    else total.wholeKeys.push(item);
    return total;
  }, { wholeKeys: [], detailKeys: [] });
};


// 重新load值以过滤缓存的删除行
export const filterDsDestroyed = (dataSet: DataSet) => {
  const { destroyed } = dataSet;
  if (destroyed.length === 0) return;
  // dataSet.records中的数据包括destroy的，但是通过dataSet直接取到的数据不存在destoryed
  dataSet.loadData(dataSet.slice());
};

// 校验计划编号合法性，因为协议初始化planNum为null字符占位
export const validatePlanNum = (planNum) => {
  return !isNil(planNum) && !['undefined', 'null'].includes(planNum);
};