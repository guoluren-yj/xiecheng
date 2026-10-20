/**
 * StandardizingPanel - 相关标准化
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
export default class StandardizingPanel extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this, 'I');
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
   * render
   * @returns React.element
   */
  render() {
    const {
      readOnly = true,
      standardizingData,
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
        title: intl.get(`${prefix}.standard.thead.relFileFix`).d('相关文件是否进行了评审修订'),
        children: [
          {
            title: intl.get(`${prefix}.standard.thead.FEMA`).d('FMEA'),
            dataIndex: 'stdRevFmeaFlag',
            align: 'center',
            width: 200,
            render: (value) =>
              getFieldDecorator('stdRevFmeaFlag', {
                initialValue: value,
              })(
                <Select disabled={readOnly} allowClear>
                  {zeroOneSelectOptions}
                </Select>
              ),
          },
          {
            title: intl.get(`${prefix}.standard.thead.revCtl`).d('控制计划'),
            dataIndex: 'stdRevCtlFlag',
            align: 'center',
            width: 200,
            render: (value) =>
              getFieldDecorator('stdRevCtlFlag', {
                initialValue: value,
              })(
                <Select disabled={readOnly} allowClear>
                  {zeroOneSelectOptions}
                </Select>
              ),
          },
          {
            title: intl.get(`${prefix}.standard.thead.flowChart`).d('流程图'),
            dataIndex: 'stdRevFlowchartFlag',
            align: 'center',
            width: 200,
            render: (value) =>
              getFieldDecorator('stdRevFlowchartFlag', {
                initialValue: value,
              })(
                <Select disabled={readOnly} allowClear>
                  {zeroOneSelectOptions}
                </Select>
              ),
          },
        ],
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
        title: `${intl.get(`${prefix}.measure.detail`).d('措施详述')}:`,
        description: standardizingData.stdActionDetail,
      },
      {
        title: `${intl.get(`${prefix}.fema.audit`).d('FMEA进行评审修订')}:`,
        description: this.transTrue(standardizingData.stdRevFmeaFlag),
      },
      {
        title: `${intl.get(`${prefix}.control.audit`).d('控制计划进行评审修订')}:`,
        description: this.transTrue(standardizingData.stdRevCtlFlag),
      },
      {
        title: `${intl.get(`${prefix}.flow.audit`).d('流程图进行评审修订')}:`,
        description: this.transTrue(standardizingData.stdRevFlowchartFlag),
      },
    ];
    return !readOnly ? (
      <Form>
        <Row>
          <Col span={24}>
            <Form.Item label={intl.get(`${prefix}.measure.detail`).d('措施详述')} {...formLayout}>
              {getFieldDecorator('stdActionDetail', {
                initialValue: standardizingData.stdActionDetail,
              })(<Input.TextArea disabled={readOnly} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Col span={21} offset={3}>
              <Table
                bordered
                size="middle"
                pagination={false}
                columns={columns}
                dataSource={[standardizingData]}
              />
            </Col>
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
