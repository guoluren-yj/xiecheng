import React, { Fragment } from 'react';
import { List } from 'choerodon-ui';
import { isArray } from 'lodash';
import { stringify } from 'querystring';
import { Modal } from 'choerodon-ui/pro';
import { HZERO_PLATFORM } from 'utils/config';
import { defaults } from 'lodash';
import {
  getCurrentOrganizationId,
  getAccessToken,
  filterNullValueObject,
  getRequestId,
  getResponse,
} from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import notification from 'utils/notification';
import moment from 'moment';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT, DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import styles from '../index.less';

const tenantId = getCurrentOrganizationId();
const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';

export function stepbBtns(btns = []) {
  const showBtns = [];
  btns
    .filter(item => item)
    .forEach(btn => {
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

export function isJSON(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}

// 个性化区域校验
export function unitValidate(dataSet, valiFields) {
  return new Promise(async resolve => {
    const res = await Promise.all(
      valiFields.map(item => dataSet?.current?.getField(item).checkValidity())
    );
    resolve(res.every(item => item === true));
  });
}

export function lovOptionDS({ paging, ...queryParameter }) {
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

/**
 * 通过文件服务器的接口获取可访问的文件URL(带fileToken)
 *
 * @export
 * @param {String} url 上传接口返回的 Url
 * @param {String} bucketName 桶名
 * @param {Number} tenantId 租户Id
 * @param {String} bucketDirectory 文件目录
 * @param {String} storageCode 存储配置编码
 */
export function getAttachmentUrlWithToken(url) {
  const accessToken = getAccessToken();
  const requestId = getRequestId();
  const params = stringify(
    filterNullValueObject({
      bucketName,
      access_token: accessToken,
      'H-Request-Id': requestId,
    })
  );
  const { HZERO_FILE } = getEnvConfig();
  const newUrl = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download-with-token?${params}&url=${encodeURIComponent(
    url
  )}`;
  window.open(newUrl);
}

/**
 * 解析文件错误信息
 */

export function parseFileError(response, onOk) {
  let resObj = {};
  try {
    resObj = JSON.parse(response || '{}');
  } catch (e) {
    notification.error();
    throw e;
  }
  if (getResponse(resObj)) {
    notification.success();
    if (onOk) onOk();
  }
}

// 配置平台组件 maxNum 属性后使用
export function formatDynamicBtns(btns = []) {
  return btns
    .filter(item => item)
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

export function dateRangeTransform(dateRange, isFormat = false) {
  const transToArr = () => {
    switch (dateRange) {
      case 'ALL TIME':
        return [undefined, undefined];
      case 'LAST MONTH':
        return [moment().subtract(1, 'month').format(DATETIME_MIN), moment().format(DATETIME_MAX)];
      case 'LAST THREE MONTHS':
        return [moment().subtract(3, 'month'), moment()];
      case 'RECENT HALF YEAR':
        return [moment().subtract(6, 'month'), moment()];
      case 'IN RECENT YAER':
        return [moment().subtract(12, 'month'), moment()];
      case 'LAST MONTH AND BEFORE':
        return [undefined, moment().subtract(1, 'month').endOf('month')];
      case 'LAST MONTH TO 25':
        return [moment().subtract(1, 'month').date(26), moment().date(25)];
      default:
        return [moment().subtract(6, 'month'), moment()];
    }
  };
  if (isFormat) {
    const start = transToArr()[0]?.format(DEFAULT_DATE_FORMAT) || '';
    const end = transToArr()[1]?.format(DEFAULT_DATE_FORMAT) || '';
    const sign = dateRange === 'ALL TIME' ? '' : ',';
    return start + sign + end;
  } else {
    return transToArr();
  }
}

const WarnMsgList = (props) => {
  const { msgList } = props;

  return (
    <Fragment>
      {/* <div className={styles['msg-list-prompt']}>{msgListPrompt}</div> */}
      <List
        dataSource={msgList}
        // eslint-disable-next-line react/no-danger
        renderItem={item => <List.Item><span dangerouslySetInnerHTML={{ __html: item?.msg }} /></List.Item>}
        className={styles['msg-list']}
      />
    </Fragment>
  );
};

export async function getValidationResponse(res, callback) {
  const { validatedCode, msg, msgList } = res || {};
  if (validatedCode === 'WARNING') {
    // 警告，确认操作
    const feedback = await Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      // eslint-disable-next-line react/no-danger
      children: isArray(msgList) ? <WarnMsgList msgList={msgList} /> : <span dangerouslySetInnerHTML={{ __html: msg }} />,
      autoCenter: true,
    });
    if (feedback === 'ok') return callback();
    return false;
  } else if (validatedCode === 'ERROR') {
    // 错误，提示错误信息
    notification.error({
      message: intl.get('hzero.common.notification.error').d('操作失败'),
      description: msg,
    });
    return false;
  } else if (validatedCode === 'EXTERNAL_ERROR') {
    // 外部系统错误,版本号会更新
    notification.error({
      message: intl.get('hzero.common.notification.error').d('操作失败'),
      description: msg,
    });
    return callback(true);
  } else {
    return callback();
  }
}
