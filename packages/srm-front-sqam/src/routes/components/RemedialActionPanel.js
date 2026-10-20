/**
 * RemedialActionPanel - 永久性解决措施
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, Table, Select } from 'hzero-ui';
import intl from 'utils/intl';
import styles from './ComponentsStyle.less';

const prefix = `sqam.common.model.8d`;

@Form.create({ fieldNameProp: null })
export default class RemedialActionPanel extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this, 'H');
  }

  /**
   * 将后端0、1数据转换为是或否
   */
  transTrue = (val) => {
    if ([undefined, null].includes(val)) {
      return val;
    }
    return Number(val) === 1
      ? `${intl.get(`${prefix}.yes`).d('是')}`
      : `${intl.get(`${prefix}.no`).d('否')}`;
  };

  /**
   * 将后端0、1数据转换为是或否
   */
  render() {
    const {
      readOnly = true,
      required,
      remedialAction,
      zeroOneOption,
      form: { getFieldDecorator },
    } = this.props;
    const formLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };
    const zeroOneSelectOptions = zeroOneOption.map((item) => (
      <Select.Option key={item.value} value={Number(item.value)}>
        {item.meaning}
      </Select.Option>
    ));
    const columns = [
      {
        title: intl.get(`${prefix}.perpetual.thead.isFit`).d('是否适用于以下项目'),
        children: [
          {
            title: intl.get(`${prefix}.perpetual.thead.otherPart`).d('其他零件'),
            dataIndex: 'pcaOtherPartAppliedFlag',
            align: 'center',
            width: 200,
            render: (value) =>
              getFieldDecorator('pcaOtherPartAppliedFlag', {
                initialValue: value,
              })(
                <Select disabled={readOnly} allowClear>
                  {zeroOneSelectOptions}
                </Select>
              ),
          },
          {
            title: intl.get(`${prefix}.perpetual.thead.otherOpr`).d('其他工序'),
            dataIndex: 'pcaOtherOprAppliedFlag',
            align: 'center',
            width: 200,
            render: (value) =>
              getFieldDecorator('pcaOtherOprAppliedFlag', {
                initialValue: value,
              })(
                <Select disabled={readOnly} allowClear>
                  {zeroOneSelectOptions}
                </Select>
              ),
          },
          {
            title: intl.get(`${prefix}.perpetual.thead.otherWp`).d('其他场所'),
            dataIndex: 'pcaOtherWpAppliedFlag',
            align: 'center',
            width: 200,
            render: (value) =>
              getFieldDecorator('pcaOtherWpAppliedFlag', {
                initialValue: value,
              })(
                <Select disabled={readOnly} allowClear>
                  {zeroOneSelectOptions}
                </Select>
              ),
          },
        ],
      },
      {
        title: intl.get(`${prefix}.perpetual.thead.hasDealFit`).d('是否已对适用项目进行处理'),
        dataIndex: 'pcaAppliedSolveFlag',
        align: 'center',
        width: 300,
        render: (value) =>
          getFieldDecorator('pcaAppliedSolveFlag', {
            initialValue: value,
          })(
            <Select disabled={readOnly} allowClear>
              {zeroOneSelectOptions}
            </Select>
          ),
      },
    ];
    const readOnlyColumns = [
      {
        title: 'title',
        dataIndex: 'title',
        width: 150,
        backgroundColor: '#fefefe',
        render: (val) => <div>{val}</div>,
      },
      {
        title: 'description',
        dataIndex: 'description',
        render: (val) => <pre className={styles['description-data']}>{val}</pre>,
      },
    ];
    const readOnlyDataSource = [
      {
        title: `${intl.get(`${prefix}.perpetual.prevent`).d('预防问题再次发生')}:`,
        description: remedialAction.pcaActionDetail,
      },
      {
        title: `${intl.get(`${prefix}.perpetual.prevent.again`).d('防止问题不被检出')}:`,
        description: remedialAction.pcaActionCorrective,
      },
      {
        title: `${intl.get(`${prefix}.is.applicable.other.part`).d('是否适用其他零件')}:`,
        description: this.transTrue(remedialAction.pcaOtherPartAppliedFlag),
      },
      {
        title: `${intl.get(`${prefix}.is.applicable.other.procedure`).d('是否适用其他工序')}:`,
        description: this.transTrue(remedialAction.pcaOtherOprAppliedFlag),
      },
      {
        title: `${intl.get(`${prefix}.is.applicable.other.place`).d('是否适用其他场所')}:`,
        description: this.transTrue(remedialAction.pcaOtherWpAppliedFlag),
      },
      {
        title: `${intl.get(`${prefix}.is.solve`).d('已对使用项目进行处理')}:`,
        description: this.transTrue(remedialAction.pcaAppliedSolveFlag),
      },
      {
        title: `${intl.get(`${prefix}.perpetual.result`).d('永久纠正措施效果')}:`,
        description: remedialAction.pcaPerformance,
      },
    ];
    return !readOnly ? (
      <Form>
        <Row>
          <Col span={24}>
            <Form.Item
              label={intl.get(`${prefix}.perpetual.prevent`).d('预防问题再次发生')}
              {...formLayout}
            >
              {getFieldDecorator('pcaActionDetail', {
                initialValue: remedialAction.pcaActionDetail,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.perpetual.prevent`).d('预防问题再次发生'),
                    }),
                  },
                ],
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              label={intl.get(`${prefix}.perpetual.prevent.again`).d('防止问题不被检出')}
              {...formLayout}
            >
              {getFieldDecorator('pcaActionCorrective', {
                initialValue: remedialAction.pcaActionCorrective,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.perpetual.prevent.again`).d('防止问题不被检出'),
                    }),
                  },
                ],
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ marginBottom: 14 }}>
            <Col span={21} offset={3}>
              <Table
                bordered
                pagination={false}
                columns={columns}
                dataSource={[remedialAction]}
                size="middle"
              />
            </Col>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              label={intl.get(`${prefix}.perpetual.result`).d('永久纠正措施效果')}
              {...formLayout}
            >
              {getFieldDecorator('pcaPerformance', {
                initialValue: remedialAction.pcaPerformance,
                rules: [
                  {
                    required,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.perpetual.result`).d('永久纠正措施效果'),
                    }),
                  },
                ],
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    ) : (
      <Table
        rowKey="title"
        showHeader={false}
        pagination={false}
        columns={readOnlyColumns}
        dataSource={readOnlyDataSource}
        className={styles['label-wrapper']}
        bordered
      />
    );
  }
}
