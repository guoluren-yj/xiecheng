/*
 * @Date: 2022-08-15 10:12:43
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import { compose } from 'lodash';

import intl from 'utils/intl';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const ScorerInfo = ({ form, dataSource, custLoading, customizeForm, customizeCode, onRef }) => {
  const { getFieldDecorator } = form;

  useEffect(() => {
    onRef(form);
  }, [onRef]);

  return customizeForm(
    {
      form,
      code: customizeCode,
      dataSource,
    },
    <Form className="ued-edit-form" style={{ padding: '0 16px' }} custLoading={custLoading}>
      <Row gutter={48} className="writable-row">
        <Col span={8}>
          <FormItem
            {...formItemLayout}
            label={intl.get('sslm.siteInvestigateReport.modal.scorer.name').d('评分人名称')}
          >
            {getFieldDecorator('respUserName', {
              initialValue: dataSource.respUserName,
            })(<span>{dataSource.respUserName}</span>)}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem
            {...formItemLayout}
            label={intl.get('sslm.siteInvestigateReport.modal.scorer.unit').d('评分人部门')}
          >
            {getFieldDecorator('userDepartmentName', {
              initialValue: dataSource.userDepartmentName,
            })(<span>{dataSource.userDepartmentName}</span>)}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem
            {...formItemLayout}
            label={intl
              .get('sslm.siteInvestigateReport.modal.scorer.totalScore')
              .d('当前评分人填制总分')}
          >
            {getFieldDecorator('sumScore', {
              initialValue: dataSource.sumScore,
            })(<span>{dataSource.sumScore}</span>)}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={48} className="writable-row">
        <Col span={8}>
          <FormItem
            {...formItemLayout}
            label={intl.get('sslm.siteInvestigateReport.modal.scorer.siteLocation').d('现场定位')}
          >
            {getFieldDecorator('siteLocation', {
              initialValue: dataSource.siteLocation,
            })(<span>{dataSource.siteLocation}</span>)}
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};

export default compose(Form.create({ fieldNameProp: null }))(ScorerInfo);
