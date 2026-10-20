/**
 * 组件属性展示抽屉
 * @date Mon Aug 13 2018
 * @author yunqiang.wu yunqiang.wu@hang-china.com
 * @version: 0.0.1
 * @copyright Copyright(c) 2018 Hand
 */

import React from 'react';
import PropTypes from 'prop-types';
import lodashResult from 'lodash/result';
import { toString } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Input, Form, Table, Drawer, Row, Col, InputNumber } from 'hzero-ui';

import intl from 'utils/intl';
import Upload from 'components/Upload';
import Switch from 'components/Switch';
import ValueList from 'components/ValueList';
import formatterCollections from 'utils/intl/formatterCollections';

import { queryInvestigateConfigComponents } from '@/services/orgInvestigateTemplateService';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};

@formatterCollections({
  code: ['spfm.investTemHisOrg'],
})
@Form.create({ fieldNameProp: null })
class AttrsDrawer extends React.Component {
  static propTypes = {
    bucketName: PropTypes.string.isRequired,
  };

  // 组件属性配置映射
  ComponentPropsTypeMap = {
    Upload: {
      propsConfig: {
        templateAttachmentUUID: {
          type: 'File',
        },
        viewOnly: {
          type: 'Boolean',
        },
        mandatoryField: {
          type: 'ValueList',
          props: {
            lovCode: 'SSLM_PRODUCE_SERVICE_MANDATORY_FIELD',
            mode: 'multiple',
            allowClear: true,
            lazyLoad: false,
            // textValue: attributeValueMeaning,
            style: {
              width: '100%',
            },
          },
        },
      },
      disabledField: 'viewOnly',
    },
    Input: {
      propsConfig: {
        maxLength: {
          type: 'Number',
          props: {
            min: 0, // 文本框的最大长度是一个自然数（非负整数）
            style: {
              width: '100%',
            },
          },
        },
        typeCase: {
          type: 'ValueList',
          props: {
            options: [
              {
                value: 'upper',
                meaning: intl.get(`spfm.investTemHisOrg.view.message.upper`).d('转大写'),
              },
              {
                value: 'lower',
                meaning: intl.get(`spfm.investTemHisOrg.view.message.lower`).d('转小写'),
              },
              {
                value: 'no',
                meaning: intl.get(`spfm.investTemHisOrg.view.message.null`).d('不转换'),
              },
            ],
            style: {
              width: '100%',
            },
          },
        },
      },
    },
  };

  // 组件类型到组件映射
  ConfigMap = {
    ValueList,
    File: Upload,
    Boolean: Switch,
    Tinyint: Switch,
    String: Input,
    Integer: InputNumber,
    Number: InputNumber,
  };

  /**
   * 获取 Input 的 render
   * @param {Object} field - 字段
   */
  @Bind()
  getElement({
    componentType,
    attributeName,
    attributeValueType,
    disabled,
    extraComponentProps: baseExtraComponentProps,
  }) {
    const componentTypeConfig = this.ComponentPropsTypeMap[componentType] || {};

    const propsConfig = lodashResult(componentTypeConfig, `propsConfig.${attributeName}`, {
      type: attributeValueType,
    });

    const ComponentClass = this.ConfigMap[propsConfig.type] || Input;

    const extraComponentProps = {};
    if (attributeName === 'disabled') {
      extraComponentProps.checkedValue = false;
      extraComponentProps.unCheckedValue = true;
    }
    if (disabled) {
      if (componentTypeConfig.disabledField) {
        return React.createElement(ComponentClass, {
          ...propsConfig.props,
          ...baseExtraComponentProps,
          ...extraComponentProps,
          [componentTypeConfig.disabledField]: false,
        });
      } else {
        return React.createElement(ComponentClass, {
          ...propsConfig.props,
          ...baseExtraComponentProps,
          ...extraComponentProps,
          disabled: false,
        });
      }
    } else {
      return React.createElement(ComponentClass, {
        ...propsConfig.props,
        ...baseExtraComponentProps,
        ...extraComponentProps,
      });
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loading: false,
    };
    const { bucketName } = props;
    this.columns = [
      {
        title: intl.get(`sslm.investTemHisOrg.view.message.title.attrName`).d('属性名称'),
        width: 160,
        dataIndex: 'attributeName',
      },
      {
        title: intl.get(`sslm.investTemHisOrg.view.message.title.attrDesc`).d('属性描述'),
        dataIndex: 'attributeDescription',
      },
      {
        title: intl.get(`sslm.investTemHisOrg.view.message.title.attrVal`).d('属性值'),
        align: 'left',
        width: 160,
        dataIndex: 'attributeValue',
        render: (v, record) => {
          const inputComponent = this.getElement({
            componentType: this.props.record.componentType,
            attributeName: record.attributeName,
            attributeValueType: record.attributeValueType,
            disabled: true,
            bucketName,
          });
          let initialValue = v;
          if (record.attributeValueType === 'Tinyint') {
            initialValue = +v;
          }
          if (record.attributeValueType === 'String') {
            initialValue = v || '';
            if (record.attributeName === 'mandatoryField') {
              initialValue = v && toString(v).split(',');
            }
          }
          return (
            <FormItem>
              {this.props.form.getFieldDecorator(`attributeValue#${record.investgCfCmptAttrId}`, {
                initialValue,
              })(inputComponent)}
            </FormItem>
          );
        },
      },
    ];
  }

  componentDidMount() {
    this.queryComponentsData();
  }

  @Bind()
  queryComponentsData() {
    if (this.state.loading) {
      return;
    }
    this.setState({
      loading: true,
    });
    queryInvestigateConfigComponents({
      investgCfLineId: this.props.record.investgCfLineId,
      isOrg: true,
    })
      .then(data => {
        this.setState({
          list: data.content,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  }

  render() {
    const {
      form: { getFieldDecorator },
      record,
    } = this.props;
    const { loading, list } = this.state;

    return (
      <Drawer
        title={intl.get(`sslm.investTemHisOrg.view.message.title.attrsDrawer`).d('组件属性')}
        placement="right"
        width={1000}
        footer={null}
        onClose={this.props.onClose}
        visible={this.props.visible}
      >
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              style={{ marginBottom: '16px' }}
              {...formItemLayout}
              label={intl
                .get(`sslm.investTemHisOrg.model.investTemHistOrg.fieldDesc`)
                .d('字段描述')}
            >
              {getFieldDecorator('fieldDescription', { initialValue: record.fieldDescription })(
                <Input disabled />
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.investTemHisOrg.model.investTemHistOrg.component`).d('组件')}
            >
              {getFieldDecorator('componentTypeMeaning', {
                initialValue: record.componentTypeMeaning,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Table
          bordered
          loading={loading}
          rowKey="investgCfCmptAttrId"
          columns={this.columns}
          dataSource={list}
          pagination={false}
        />
      </Drawer>
    );
  }
}

export default AttrsDrawer;
