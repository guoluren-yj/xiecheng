/*
 * @Description: index
 * @Date: 2021-11-24 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import React from 'react';
import { Form, Spin, TextField, Select, IntlField, Output } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import styles from './index.less';

const DetailHeaderinfo = (props) => {
  const { formDs, id, classify } = props;

  /**
   * 状态颜色控制
   */
  const colorRender = (_value, record, name) => {
    const value = record.get(name);
    if (['PUBLISHED'].includes(value)) {
      // 绿色: 已发布
      return (
        <Tag style={{ border: 'none' }} color="green">
          <span>{record.get(`${name}Meaning`)}</span>
        </Tag>
      );
    } else if (['UNPUBLISHED'].includes(value)) {
      //  灰色: 未发布
      return (
        <Tag style={{ border: 'none' }} color="yellow">
          <span>{record.get(`${name}Meaning`)}</span>
        </Tag>
      );
    } else {
      return '-';
    }
  };

  const FormList = () => (
    <Form useWidthPercent labelLayout="float" dataSet={formDs} columns={3}>
      <Select name="strategyStatusMeaning" disabled />
      <TextField name="strategyCode" disabled={id} />
      <IntlField name="strategyName" />
      <Select name="sourceCode" disabled />
    </Form>
  );

  const FormOnly = () => (
    <Form
      className="c7n-pro-vertical-form-display"
      labelLayout="vertical"
      useWidthPercent
      dataSet={formDs}
      columns={3}
    >
      <Output
        name="strategyStatusMeaning"
        renderer={({ value, record }) => colorRender(value, record, 'strategyStatus')}
      />
      <Output name="strategyCode" />
      <Output name="strategyName" />
      <Output name="sourceCode" />
    </Form>
  );

  return (
    <div className={styles[id ? 'form-info' : 'form-info_noids']}>
      <Spin dataSet={formDs}>{classify === 'history' ? <FormOnly /> : <FormList />}</Spin>
    </div>
  );
};

export default DetailHeaderinfo;
