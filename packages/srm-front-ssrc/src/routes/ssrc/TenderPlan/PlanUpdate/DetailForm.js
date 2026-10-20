/**
 * DetailForm - 项目整体寻源计划维护头信息
 * @date: 2019-04-16
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { Bind } from 'lodash-decorators';
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, Select } from 'hzero-ui';
import { getCurrentUserId, getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';

import styles from './index.less';

// const formLayOut = {
//   labelCol: { span: 9 },
//   wrapperCol: { span: 15 },
// };

const { Option } = Select;
const { TextArea } = Input;
const promptCode = 'ssrc.tenderPlan.model.tenderPlan';

/**
 * 项目整体寻源计划维护头信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class DetailForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {
      userId: getCurrentUserId(),
      tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   * 年度
   */
  @Bind()
  renderYear() {
    const date = new Date();
    // 当前年份
    const currentYear = date.getFullYear();
    // 当前年份后5年
    const endYear = currentYear + 5;
    // 当前年份及后5年的集合
    const yearArr = [];
    for (let i = currentYear; i <= endYear; i++) {
      yearArr.push(i);
    }

    return yearArr;
  }

  render() {
    const { userId, tenantId } = this.state;
    const { form, planUpdateHeader, customizeForm } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    const formLayout = { labelCol: { span: 9 }, wrapperCol: { span: 15 } };
    const formsLayout = { labelCol: { span: 4 }, wrapperCol: { span: 20 } };
    return customizeForm(
      {
        form,
        code: 'SSRC.PLAN_UPDATE_DETAIL.FORM',
        dataSource: planUpdateHeader,
      },
      <Form className={styles.formItemLabel}>
        <Row gutter={48}>
          <Col span={8}>
            <Form.Item label={intl.get(`${promptCode}.projectNum`).d('项目编码')} {...formLayout}>
              {getFieldDecorator('projectId', {
                initialValue: planUpdateHeader.projectId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.projectNum`).d('项目编码'),
                    }),
                  },
                ],
              })(
                <Lov
                  disabled={planUpdateHeader.processStatus === 'RELEASED'}
                  code="SSRC.PROJECT"
                  textValue={planUpdateHeader.projectNum}
                  queryParams={{ userId, tenantId }}
                  onChange={(val, lovRecord) => {
                    setFieldsValue({
                      projectName: lovRecord.projectName,
                    });
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item {...formLayout} label={intl.get(`${promptCode}.projectName`).d('项目名称')}>
              {getFieldDecorator('projectName', {
                initialValue: planUpdateHeader.projectName,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${promptCode}.bidPlanName`).d('整体寻源计划名称')}
              {...formLayout}
            >
              {getFieldDecorator('bidPlanName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.bidPlanName`).d('整体寻源计划名称'),
                    }),
                  },
                  {
                    max: 128,
                    message: intl.get('hzero.common.validation.max', {
                      max: 128,
                    }),
                  },
                ],
                initialValue: planUpdateHeader.bidPlanName,
              })(
                <TLEditor
                  label={intl.get(`${promptCode}.bidPlanName`).d('整体寻源计划名称')}
                  field="bidPlanName"
                  token={planUpdateHeader._token}
                  disabled={planUpdateHeader.processStatus === 'RELEASED'}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <Form.Item label={intl.get(`${promptCode}.year`).d('年度')} {...formLayout}>
              {getFieldDecorator('year', {
                initialValue: planUpdateHeader.year,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.year`).d('年度'),
                    }),
                  },
                ],
              })(
                <Select allowClear disabled={planUpdateHeader.processStatus === 'RELEASED'}>
                  {this.renderYear().map((n) => (
                    <Option value={n} key={n}>
                      {n}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={16} className={styles.remarkStyle}>
            <Form.Item label={intl.get('hzero.common.remark').d('备注')} {...formsLayout}>
              {form.getFieldDecorator('remark', {
                initialValue: planUpdateHeader.remark,
              })(<TextArea rows={1} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
