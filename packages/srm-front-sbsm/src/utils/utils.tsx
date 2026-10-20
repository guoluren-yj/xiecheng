import { stringify } from 'querystring';
import React from 'react';
import pathToRegexp from 'path-to-regexp';
import { math } from 'choerodon-ui/dataset';
import { notification } from 'choerodon-ui';
import type { DataSet } from 'choerodon-ui/pro';
import { Modal, NumberField } from 'choerodon-ui/pro';
import { isNil, defaults, isEmpty, omit } from 'lodash';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import EmbedPage from '_components/EmbedPage';
import { HZERO_FILE, HZERO_PLATFORM } from 'utils/config';
import { filterNullValueObject, getAccessToken, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';

import commonStyles from '../common.less';

const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const accessToken = getAccessToken();
const tenantId = getCurrentOrganizationId();

const lang = getCurrentLanguage();


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

// 其他功能可能会用到,extraInfoList额外需要显示的内容
export const notifyValidErrors: (dataSet: DataSet, extraInfoList?: Array<string>) => void = (dataSet, extraInfoList = []) => {
  const allErrors = collectDsListErrors([dataSet].concat(Object.values(dataSet.children)));
  const errorTextList = allErrors.map(dsError => {
    const { validationCode, validationTitle, errorInfoList } = dsError as any;
    const errorTextPrefix = intl.get(`sbsm.common.view.message.inValidationTitle`, { validationTitle }).d(`【{validationTitle}】中，`);
    const errorTextContent = errorInfoList.map(errorInfo => {
      const { num, labelList } = errorInfo;
      const numPrefix = validationCode === 'header' ? '' : intl.get(`sbsm.common.view.message.rowNum`, { num }).d(`第{num}行，`);
      const labelContent = labelList.join('、');
      return numPrefix + labelContent;
    }).join('；');
    return errorTextPrefix + errorTextContent;
  });
  notification.error({
    message: intl.get('sbsm.common.view.validation.fieldEmptyOrBadFormat').d('操作失败，失败原因是存在必填字段未维护，或格式维护不正确，请将鼠标悬浮于问题字段，查看维护提示，问题字段如下：'),
    description: [...extraInfoList, ...errorTextList].join('\n'),
    style: {
      whiteSpace: 'pre-line',
    },
  });
};

export function getSelectedNegActConfirmMsg(action: string, dataSet: DataSet) {
  const actionDescMap = {
    delete: intl.get('hzero.common.button.delete').d('删除'),
    cancel: intl.get('hzero.common.button.cancel').d('取消'),
  };
  const actionDesc: string = actionDescMap[action] || action;
  const msgFlag: Boolean = isNil(dataSet) ? true : dataSet.selected?.some((item) => item.status !== 'add');
  return (
    msgFlag && {
      title: intl.get('sbsm.common.view.title.tip').d('提示'),
      children: intl
        .get('sbsm.common.view.message.confirmActionSelectedRowsOrNot', { actionDesc })
        .d('是否确认{actionDesc}选中行？'),
    }
  );
}

interface confirmDocNegActionParams {
  action: string;
  documentNum: string;
  documentName: string;
  customName?: string;
}

export async function confirmDocNegAction(params: confirmDocNegActionParams) {
  const actionDescMap = {
    delete: intl.get('hzero.common.button.delete').d('删除'),
    cancel: intl.get('hzero.common.button.cancel').d('取消'),
    return: intl.get('hzero.common.button.return').d('退回'),
  };
  const { action, documentNum, documentName, customName } = params || {};
  const actionDesc: string = actionDescMap[action] || action;
  const feedback: string = await Modal.confirm({
    title: intl.get('sbsm.common.view.title.tip').d('提示'),
    children: customName || intl
      .get('sbsm.common.view.message.confirmActionDocumentOrNot', {
        actionDesc,
        documentNum,
        documentName,
      })
      .d('是否确认{actionDesc}{documentName}{documentNum}？'),
  });
  return feedback === 'ok';
}

export function formatDynamicBtns(btns: any[] = []): any[] {
  return btns
    .filter(Boolean)
    .map((item, index) => {
      const { btnComp, btnProps = {} } = item;
      if (!btnComp) {
        const defaultBtnProps =
          index > 0
            ? { funcType: 'flat', color: 'default' }
            : { funcType: 'raised', color: 'primary' };
        Object.assign(item, {
          btnProps: defaults(btnProps, defaultBtnProps),
        });
      }
      return item;
    });
}

export function parseRouteHref(href: string, paths: Array<string>) {
  const initialValue = { location: {}, match: {} };
  if (!href || isEmpty(paths)) return initialValue;
  let matchData;
  const subStrIndex = href.indexOf('?');
  const pathname = subStrIndex > -1 ? href.substring(0, subStrIndex) : href;
  const search = subStrIndex > -1 ? href.substring(subStrIndex) : '';
  const matchPath: any = paths.find((path) => {
    const execData = pathToRegexp(path).exec(pathname);
    if (execData) {
      matchData = execData;
      return true;
    } else return false;
  });
  if (!matchData) return initialValue;
  const parseData: any = pathToRegexp.parse(matchPath)?.slice(1);
  const params = parseData.reduce((total, key, index) => {
    total[key.name] = matchData[index + 1];
    return total;
  }, {});
  const location = { search, pathname };
  const match = { isExact: true, params, path: matchPath, url: pathname };
  return { location, match };
}

export async function previewPdf(fileUrl: string, paramBucketName?: string) {
  const bucket = paramBucketName || bucketName;
  const pdfParams = stringify(
    filterNullValueObject({
      bucketName: bucket,
      access_token: accessToken,
      url: encodeURIComponent(fileUrl),
    })
  );
  const previewUrl = `${HZERO_FILE}/v1/${tenantId}/file-preview/by-url?${pdfParams}`;
  window.open(previewUrl);
}

// ds金额字段formatter
export function amountFormatterPrecision({ record, name }) {
  const { [name]: value, financialPrecision } = record.get([name, 'financialPrecision']);
  return numberFormatterOptions(value, financialPrecision);
}

// ds金额字段formatter
export function amountFormatterOptions({ record, name }) {
  const { [name]: value, amountPrecision } = record.get([name, 'amountPrecision']);
  return numberFormatterOptions(value, amountPrecision);
}

// ds单价字段formatter
export function priceFormatterOptions({ record, name }) {
  const { [name]: value, pricePrecision } = record.get([name, 'pricePrecision']);
  return numberFormatterOptions(value, pricePrecision);
}

// 数字formatter
export function numberFormatterOptions(value, precision) {
  if (math.isNaN(value) || math.isZero(value)) return;
  const options = { maximumFractionDigits: 20 };
  if (!isNil(precision)) Object.assign(options, { minimumFractionDigits: precision });
  return { lang, options };
}

// 金额字段渲染，千分位+补零
export function amountRender({ value, record }) {
  return formatNumber(value, record?.get('amountPrecision'));
}

// 单价字段渲染，千分位+补零
export function priceRender({ value, record }) {
  return formatNumber(value, record?.get('pricePrecision'));
}

// 数字渲染，千分位
export function numberRender({ value }) {
  return formatNumber(value, null);
}

export function formatNumber(value, precision) {
  if (math.isNaN(value) || math.isZero(value) || !math.isValidNumber(value)) return value;
  const options = { maximumFractionDigits: 20 };
  if (!isNil(precision)) Object.assign(options, { minimumFractionDigits: precision });
  return NumberField.format(value, lang, options);
}

export function lovOptionDS(props: any = {}) {
  const { paging } = props;
  const queryParameter = omit(props, 'paging') || {};
  return {
    paging,
    queryParameter,
    autoQuery: true,
    selection: 'single',
    transport: {
      read() {
        return {
          url: `${HZERO_PLATFORM}/v1/${tenantId}/lovs/data`,
          method: 'get',
        };
      },
    },
  };
}

// noAddFlag true时不添加 只返回新的record
export function copyRecord(record: DSRecord, index?: number, noAddFlag?: boolean) {
  const { dataSet } = record;
  const newRecord = record.clone();
  const getterData = record.get(Array.from(dataSet.fields.keys())); // 解决transform问题
  newRecord.init(getterData);
  if (!noAddFlag) dataSet.splice(index || 0, 0, newRecord);
  return newRecord;
};


export function ObjectBatchGet(data: Object = {}, keyItemList: string [] = [], defaultValue?: any) {
  return keyItemList.reduce<Record<string, any>>((total, keyItem) => {
    const [targetName, sourceName] = Array.isArray(keyItem) ? keyItem : [keyItem, keyItem];
    total[targetName] =
      data === null || data[sourceName] === undefined ? defaultValue : data[sourceName];
    return total;
  }, {});
}

export function openEmbedPage({ href, search, params, ...otherProps } : {
  href: string;
  search?: string;
  params?: any;
  [key: string]: any;
}) {
  Modal.open({
    drawer: true,
    closable: true,
    resizable: true,
    key: Modal.key(),
    className: commonStyles['embed-page-modal'],
    children: (
      <EmbedPage
        href={href}
        match={{ params }}
        location={{ search: search ? `?${search}` : '' }}
        {...otherProps}
      />
    ),
    header: null,
    footer: null,
  });
}