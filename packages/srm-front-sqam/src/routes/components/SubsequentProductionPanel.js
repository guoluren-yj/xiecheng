/**
 * SubsequentProductionPanel - 临时围堵措施—针对后续生产
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, Table } from 'hzero-ui';
import intl from 'utils/intl';

import styles from './SubsequentProductionPanel.less';

const prefix = `sqam.common.model.8d`;

@Form.create({ fieldNameProp: null })
export default class SubsequentProductionPanel extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this, 'F');
  }

  render() {
    const {
      readOnly = true,
      required,
      subsequentProduction,
      form: { getFieldDecorator },
    } = this.props;
    const { icaActionDetail, icaActionValidation } = subsequentProduction;
    const formLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    const NotReadOnlyFormComponent = (
      <Form>
        <Row>
          <Col span={24}>
            <Form.Item label={intl.get(`${prefix}.measure.detail`).d('措施详述')} {...formLayout}>
              {getFieldDecorator('icaActionDetail', {
                initialValue: subsequentProduction.icaActionDetail,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.measure.detail`).d('措施详述'),
                    }),
                  },
                ],
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item label={intl.get(`${prefix}.measure.check`).d('措施验证')} {...formLayout}>
              {getFieldDecorator('icaActionValidation', {
                initialValue: subsequentProduction.icaActionValidation,
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
    const dataSource = [
      { label: intl.get(`${prefix}.measure.detail`).d('措施详述'), description: icaActionDetail },
      {
        label: intl.get(`${prefix}.measure.check`).d('措施验证'),
        description: icaActionValidation,
      },
    ];
    const columns = [
      {
        dataIndex: 'label',
        width: 150,
        render: (value) => <span>{value}</span>,
      },
      {
        dataIndex: 'description',
        render: (value) => <span>{value}</span>,
      },
    ];
    const tableProps = {
      columns,
      dataSource,
      showHeader: false,
      bordered: true,
      pagination: false,
      rowKey: (record, index) => index,
    };
    const ReadOnlyComponent = <Table className={styles['table-wrapper']} {...tableProps} />;
    return readOnly ? ReadOnlyComponent : NotReadOnlyFormComponent;
  }
}
