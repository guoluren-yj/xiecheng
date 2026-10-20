/**
 * 规则配置详情 - 基本参数（租户级）（只读）
 * @date: 2021-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment } from 'react';
import { Form, Output } from 'choerodon-ui/pro';

import styles from './index.less';

export default function BasicParamTable(props = {}) {
  const { formDs } = props;

  return (
    <div className={styles['rule-manage-basic-form']}>
      <Form dataSet={formDs} labelLayout="float" columns={3}>
        <Output name="ruleCode" colSpan={1} />
        <Output name="name" colSpan={1} />
        <Output name="type" colSpan={1} />
        {formDs.current?.get('type') === '1' && (
          <Fragment>
            <Output name="service" colSpan={1} />
            <Output name="serviceCode" colSpan={1} />
            <Output name="servicePath" colSpan={1} />
          </Fragment>
        )}
        {formDs.current?.get('type') !== '1' && <Output name="defaultRet" colSpan={1} />}
        <Output name="defaultRetLine" colSpan={1} />
        {formDs.current?.get('type') !== '1' && (
          <Fragment>
            <Output name="defaultRetEmpty" colSpan={1} />
            <Output name="retEmpty" colSpan={1} />
          </Fragment>
        )}
        <Output name="defaultRetFail" colSpan={1} />
        <Output name="description" colSpan={3} newLine />
      </Form>
    </div>
  );
}
