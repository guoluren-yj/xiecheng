/*
 * @Author: your name
 * @Date: 2020-10-15 10:59:38
 * @LastEditTime: 2020-10-28 11:43:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \srm-front-sqam\src\routes\components\CongratulationPanel.js
 */
/**
 * CongratulationPanel - 小组祝贺
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';

const prefix = `sqam.common.model.qualityRectification`;

@Form.create({ fieldNameProp: null })
export default class StandardizingPanel extends Component {
  constructor(props) {
    super(props);
    props.onRef(this, 'j');
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      customizeForm,
      code,
      custLoading,
      readOnly = false,
      congratulations,
      form: { getFieldDecorator },
    } = this.props;
    const formLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    return customizeForm(
      {
        code,
        form: this.props.form,
        dataSource: congratulations,
        custLoading,
      },
      <Form>
        <Row>
          <Col span={24}>
            <Form.Item
              label={intl.get(`${prefix}.teamAccept`).d('团队合作成果认可')}
              {...formLayout}
            >
              {getFieldDecorator('tmcPerformance', {
                initialValue: congratulations.tmcPerformance,
              })(<Input.TextArea rows={3} disabled={readOnly} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <div />
        </Row>
      </Form>
    );
  }
}
