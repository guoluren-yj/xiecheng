/**
 * RootrootCausePanel - 根本原因分析
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  // Table
} from 'hzero-ui';
import intl from 'utils/intl';

// import styles from './SubsequentProductionPanel.less';

const prefix = `sqam.common.model.8d`;

@Form.create({ fieldNameProp: null })
export default class RootrootCausePanel extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this, 'G');
  }

  render() {
    const {
      readOnly = true,
      required,
      rootCause,
      causeType,
      form: { getFieldDecorator },
    } = this.props;
    // const { rootCauseTypeCode, rootCause: rootCauseReason, rootCauseUncatch } = rootCause;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const NotReadOnlyFormComponent = (
      <Form>
        <Row>
          <Col span={11}>
            <Form.Item
              label={intl.get(`${prefix}.analysis.reason`).d('原因类型')}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 10 }}
            >
              {getFieldDecorator('rootCauseTypeCode', {
                initialValue: rootCause.rootCauseTypeCode,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.analysis.reason`).d('原因类型'),
                    }),
                  },
                ],
              })(
                <Select disabled={readOnly} allowClear>
                  {causeType.map((item) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={11}>
            <Form.Item label={intl.get(`${prefix}.analysis.reasonOne`).d('原因1')} {...formLayout}>
              {getFieldDecorator('reasonOne', {
                initialValue: rootCause.reasonOne,
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
          <Col span={2} />
          <Col span={11}>
            <Form.Item
              label={intl.get(`${prefix}.analysis.whyNotDiscover`).d('为何此前未发现')}
              {...formLayout}
            >
              {getFieldDecorator('causeUncatchOne', {
                initialValue: rootCause.causeUncatchOne,
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={11}>
            <Form.Item label={intl.get(`${prefix}.analysis.reasonTwo`).d('原因2')} {...formLayout}>
              {getFieldDecorator('reasonTwo', {
                initialValue: rootCause.reasonTwo,
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
          <Col span={2} />
          <Col span={11}>
            <Form.Item
              label={intl.get(`${prefix}.analysis.whyNotDiscover`).d('为何此前未发现')}
              {...formLayout}
            >
              {getFieldDecorator('causeUncatchTwo', {
                initialValue: rootCause.causeUncatchTwo,
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={11}>
            <Form.Item
              label={intl.get(`${prefix}.analysis.reasonThree`).d('原因3')}
              {...formLayout}
            >
              {getFieldDecorator('reasonThree', {
                initialValue: rootCause.reasonThree,
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
          <Col span={2} />
          <Col span={11}>
            <Form.Item
              label={intl.get(`${prefix}.analysis.whyNotDiscover`).d('为何此前未发现')}
              {...formLayout}
            >
              {getFieldDecorator('causeUncatchThree', {
                initialValue: rootCause.causeUncatchThree,
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={11}>
            <Form.Item label={intl.get(`${prefix}.analysis.reasonFour`).d('原因4')} {...formLayout}>
              {getFieldDecorator('reasonFour', {
                initialValue: rootCause.reasonFour,
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
          <Col span={2} />
          <Col span={11}>
            <Form.Item
              label={intl.get(`${prefix}.analysis.whyNotDiscover`).d('为何此前未发现')}
              {...formLayout}
            >
              {getFieldDecorator('causeUncatchFour', {
                initialValue: rootCause.causeUncatchFour,
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={11}>
            <Form.Item label={intl.get(`${prefix}.analysis.reasonFive`).d('原因5')} {...formLayout}>
              {getFieldDecorator('reasonFive', {
                initialValue: rootCause.reasonFive,
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
          <Col span={2} />
          <Col span={11}>
            <Form.Item
              label={intl.get(`${prefix}.analysis.whyNotDiscover`).d('为何此前未发现')}
              {...formLayout}
            >
              {getFieldDecorator('causeUncatchFive', {
                initialValue: rootCause.causeUncatchFive,
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={11}>
            <Form.Item
              label={intl.get(`${prefix}.analysis.happen`).d('问题发生原因')}
              {...formLayout}
            >
              {getFieldDecorator('rootCause', {
                initialValue: rootCause.rootCause,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.analysis.happen`).d('问题发生原因'),
                    }),
                  },
                ],
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
          <Col span={2} />
          <Col span={11}>
            <Form.Item
              label={intl.get(`${prefix}.analysis.not.happen`).d('问题未被检测出原因')}
              {...formLayout}
            >
              {getFieldDecorator('rootCauseUncatch', {
                initialValue: rootCause.rootCauseUncatch,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.analysis.not.happen`).d('问题未被检测出原因'),
                    }),
                  },
                ],
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
    // const dataSource = [
    //   {
    //     label: intl.get(`${prefix}.analysis.reason`).d('原因类型'),
    //     description:
    //       String(causeType) &&
    //       causeType
    //         .reduce((sum, val) =>
    //           sum instanceof Map
    //             ? sum.set(val.value, val.meaning)
    //             : new Map([
    //                 [sum.value, sum.meaning],
    //                 [val.value, val.meaning],
    //               ])
    //         )
    //         .get(rootCauseTypeCode),
    //   },
    //   {
    //     label: intl.get(`${prefix}.analysis.happen`).d('问题发生原因'),
    //     description: rootCauseReason,
    //   },
    //   {
    //     label: intl.get(`${prefix}.analysis.not.happen`).d('问题未被检测出原因'),
    //     description: rootCauseUncatch,
    //   },
    // ];
    // const columns = [
    //   {
    //     dataIndex: 'label',
    //     width: 150,
    //     render: value => <span>{value}</span>,
    //   },
    //   {
    //     dataIndex: 'description',
    //     render: value => <span>{value}</span>,
    //   },
    // ];
    // const tableProps = {
    //   columns,
    // dataSource,
    //   showHeader: false,
    //   bordered: true,
    //   pagination: false,
    //   rowKey: (_, index) => index,
    // };
    // const ReadOnlyComponent = <Table className={styles['table-wrapper']} {...tableProps} />;
    // return readOnly ? ReadOnlyComponent : NotReadOnlyFormComponent;
    return NotReadOnlyFormComponent;
  }
}
