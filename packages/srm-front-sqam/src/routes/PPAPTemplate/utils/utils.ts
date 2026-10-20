import { notification } from 'choerodon-ui';
import { useCallback, useState } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';

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

export function stepbBtns(btns: any = []) {
  const showBtns: any = [];
  btns
    .filter((item) => item)
    .forEach((btn) => {
      const { name, group, btnComp, btnProps = {} } = btn;
      if (!group && !btnComp) {
        showBtns.push({
          ...btn,
          btnType: 'c7n-pro',
          btnProps: { ...btnProps, key: name },
        });
      } else {
        showBtns.push(btn);
      }
    });
  return showBtns;
}

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

export const collectDsListErrors: (dsList: DataSet[], customizeParams?: CustomizeParams) => DataSetError[] = (dsList, customizeParams) => {
  const allErrors = dsList.reduce<DataSetError[]>((total: DataSetError[], dataSet: DataSet) => {
    const errorInfo = collectDsErrors(dataSet, customizeParams);
    return errorInfo ? [...total, errorInfo] as DataSetError[] : total;
  }, []);
  return allErrors;
};

export const notifyValidErrors: (dataSet: DataSet) => void = (dataSet) => {
  const allErrors = collectDsListErrors([dataSet].concat(Object.values(dataSet.children)));
  const errorTextList = allErrors.map(dsError => {
    const { validationCode, validationTitle, errorInfoList } = dsError as any;
    const errorTextPrefix = intl.get(`sqam.ppap.view.message.inValidationTitle`, { validationTitle }).d(`【{validationTitle}】中，`);
    const errorTextContent = errorInfoList.map(errorInfo => {
      const { num, labelList } = errorInfo;
      const numPrefix = validationCode === 'header' ? '' : intl.get(`sqam.ppap.view.message.rowNum`, { num }).d(`第{num}行，`);
      const labelContent = labelList.join('、');
      return numPrefix + labelContent;
    }).join('；');
    return errorTextPrefix + errorTextContent;
  });
  notification.error({
    message: intl.get('sqam.ppap.view.validation.fieldEmptyOrBadFormat').d('操作失败，失败原因是存在必填字段未维护，或格式维护不正确，请将鼠标悬浮于问题字段，查看维护提示，问题字段如下：'),
    description: errorTextList.join('\n'),
    style: {
      whiteSpace: 'pre-line',
    },
  });
};

// 获取各个视图下的tab
export function getTabKeys<U extends string>(allTabKeys: U[]) {
  return allTabKeys.reduce<Record<string, U[]>>((total, item) => {
    if (item.startsWith('project')) total.projectKeys.push(item);
    else if (item.startsWith('document')) total.documentKeys.push(item);
    else total.stageKeys.push(item);
    return total;
  }, { projectKeys: [], documentKeys: [], stageKeys: [] });
};


interface UseSetStateFunc {
  (initialValue: Record<string, any>): [Record<string, any>, (next: Record<string, any> | Function) => void];
}
export const useSetState: UseSetStateFunc = (initialState) => {
  const [state, mergeState] = useState(initialState || {});
  const setState = useCallback((next) => {
    mergeState(prevState => {
      const nextState = typeof next === "function" ? next(prevState) : next;
      return ({ ...prevState, ...nextState });
    });
  }, []);
  return [state, setState];
};

export const compareTime = (d: string | null | undefined) => {
  if (!d) return false;
  try {
    const now = new Date().getTime();
    const time = new Date(d).getTime();
    return now >= time;
  } catch (e) {
    return false;
  }
};
