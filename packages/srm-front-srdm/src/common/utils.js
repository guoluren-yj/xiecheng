/**
 * 公共方法
 * @author: zhihao.cai@hand-china.com
 * @since: 2020-01-16 17:14:14
 * @version 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import { Form, Tooltip } from 'choerodon-ui/pro';
import { Row, Col, Icon } from 'choerodon-ui';
import Icons from 'components/Icons';
import intl from 'utils/intl';
import queryString from 'querystring';
import { openTab } from 'utils/menuTab';

export const ACCESS_TOKEN = 'access_token';

/**
 * 快码转换
 * @param {Array} codeSet  快码列表
 * @param {String} params   value值
 * @returns {String} 快码描述
 */
export function getFastCode(code = [], value = '') {
  let result;
  if (!Array.isArray(code)) {
    return value;
  }
  if (value && !isEmpty(code)) {
    const codeList = code.filter((n) => n.value === value);
    if (!isEmpty(codeList)) {
      result = codeList[0].meaning;
    }
  }
  return result || value;
}

/**
 * 下载文件
 * @param {string} url - 文件地址
 * @param {string} filename - 文件名
 */
export function download(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_parent';
  if ('download' in a) {
    a.download = filename;
    (document.body || document.documentElement).appendChild(a);
    a.click();
    a.remove();
  }
}

/**
 * 搜索框 React Function
 * @param {Object} props
 */
export function QueryBarMore(props) {
  const { queryFields, queryDataSet, buttons } = props;
  const queryFieldsLimit = queryFields.length >= 3 ? 3 : queryFields.length;
  const [hidden, setHidden] = useState(false);
  const handleToggle = () => {
    setHidden(!hidden);
  };
  // const query = async () => {
  //     console.log(queryDataSet.toData());
  //     await dataSet.query();
  // };

  // eslint-disable-next-line no-nested-ternary
  const span = queryFieldsLimit === 1 ? 7 : queryFieldsLimit === 2 ? 14 : 21;

  return (
    <div>
      {queryDataSet ? (
        <div style={{ alignItems: 'flex-start' }}>
          <Row>
            <Col span={span}>
              <Form className={['form-info']} columns={queryFieldsLimit} dataSet={queryDataSet}>
                {hidden ? queryFields.slice(0, 3) : queryFields}
              </Form>
            </Col>
            <div style={{ float: 'right', width: '50px' }}>
              {queryFields.length > 3 &&
                (hidden ? (
                  <Icons
                    onClick={handleToggle}
                    type="fdoi-arrow-down"
                    size="25"
                    style={{ cursor: 'pointer' }}
                    title={intl.get('hzero.common.button.viewMore').d('更多查询')}
                  />
                ) : (
                  <Icons
                    onClick={handleToggle}
                    type="fdoi-arrow-up"
                    size="25"
                    style={{ cursor: 'pointer' }}
                    title={intl.get('hzero.common.button.collected').d('收起查询')}
                  />
                ))}
            </div>
          </Row>
        </div>
      ) : null}
      {buttons && buttons.length ? <div style={{ marginBottom: 4 }}>{buttons}</div> : null}
    </div>
  );
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

/**
 * 打开并发请求页面并且触发弹窗
 * @param {String} defaultFormat
 */
export function openRequestsTab(param) {
  openTab({
    title: 'Request Summary',
    key: `/gfnd/request-summary/list`,
    path: `/gfnd/request-summary/list`,
    search: queryString.stringify({
      actionParam: param,
    }),
    icon: null,
    closable: true,
  });
}

/**
 * 打开上传导入文件页面并且触发弹窗
 * @param {String} defaultFormat
 */
export function openImportUploadTab(param) {
  openTab({
    title: 'Import Upload',
    key: `/impr/import-Upload-Summary`,
    path: `/impr/import-Upload-Summary`,
    search: queryString.stringify({
      actionParam: param,
    }),
    icon: null,
    closable: true,
  });
}

/**
 * 渲染label提示
 * @returns ReactNode
 */
export function labelTooltipRender(label, title) {
  return (
    <span>
      <Tooltip
        title={
          <>
            <span>{label}</span>
            <Tooltip title={title}>
              <Icon style={{ color: '#0085d0' }} type="help_outline" />
            </Tooltip>
          </>
        }
      >
        <span>{label}</span>
        <Tooltip title={title}>
          <Icon style={{ color: '#0085d0' }} type="help_outline" />
        </Tooltip>
      </Tooltip>
    </span>
  );
}
