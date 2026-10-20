import intl from 'utils/intl';
import { notification } from 'choerodon-ui';

import { langPrefixCode } from './constant';

/**
 * 获取头部标题
 * @param type - 类型 detail：明细；update：维护
 * @param displaySubRelationNum - 代替方案编码
 */
export const getSubTitle = (type: string, displaySubRelationNum: string | number | null | undefined) => {
  const titlePrefix = type === 'detail' ? intl.get(`${langPrefixCode}.model.common.subRelationTitle.detail`).d('替代方案明细') : intl.get(`${langPrefixCode}.model.common.subRelationTitle.update`).d('替代方案维护');
  if(!displaySubRelationNum) {
    return titlePrefix;
  }
  return `${titlePrefix}-${displaySubRelationNum}`;
};

// record 上的错误信息
interface RecordError {
  num: number;
  labelList: string[],
};

// dataSet所有records的错误信息
interface DataSetError {
  errorInfoList: RecordError[],
  validationCode: string,
  validationTitle: string,
}
/**
 * 获取校验信息
 * @param dataSetErrorLists - 错误列表
 */
export const getNotificationErrors = (dataSetErrorLists: DataSetError[]) => {
  return dataSetErrorLists.map(error => {
    const { errorInfoList = [], validationCode = '', validationTitle = ''} = error;
    const listErrors = errorInfoList.map(
      errorInfo=>{
        const { labelList = [], num = 1 } = errorInfo;
        if(validationCode === 'line') {
          return `${intl.get(`${langPrefixCode}.model.view.message.rowNum`, { num }).d(`第{num}行：`) + labelList.join('、')}`;
        }
        return labelList.join('、');
      }
    );
    return `【${validationTitle}】:${listErrors}`;
  }).join('\n');
};

/**
 * 校验提示
 * @param { string } errorMessage - 校验提示信息
 */
export const notificationWaringTips = (errorMessage: string | '') => {
  if(!errorMessage) {
    return;
  }
  notification.warning({
    message: intl.get(`${langPrefixCode}.model.view.message.validationTips`).d('校验不通过，请检查以下数据'),
    description: errorMessage,
    style: {
      whiteSpace: 'pre-line',
      maxHeight: '400px',
      overflow: 'auto',
    },
  });
};