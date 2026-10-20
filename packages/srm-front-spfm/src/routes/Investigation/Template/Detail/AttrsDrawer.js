/**
 * 调查表模版组件属性编辑抽屉
 * @date Mon Aug 13 2018
 * @author yunqiang.wu yunqiang.wu@hang-china.com
 * @copyright Copyright(c) 2018 Hand
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Input, Form, Drawer, Button, Table, Row, Col } from 'hzero-ui';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import {
  queryInvestigateConfigComponents,
  saveInvestigateConfigComponents,
} from '@/services/orgInvestigateTemplateService';
import { getElement } from './utils';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};

@Form.create({ fieldNameProp: null })
class AttrsDrawer extends React.Component {
  static propTypes = {
    bucketName: PropTypes.string.isRequired,
  };

  uploadData = {}; // 存储额外事件

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loading: false,
      saveLoading: false,
    };
    this.columns = [
      {
        title: intl
          .get(`spfm.investigationDefinition.model.definition.attributeName`)
          .d('属性名称'),
        width: 100,
        dataIndex: 'attributeName',
      },
      {
        title: intl
          .get(`spfm.investigationDefinition.model.definition.attributeDesc`)
          .d('属性描述'),
        dataIndex: 'attributeDescription',
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.attributeValue`).d('属性值'),
        align: 'center',
        width: 160,
        dataIndex: 'attributeValue',
        render: (v, record) => {
          const {
            record: { componentType },
            form,
          } = this.props;
          const formOptions = {};
          let uploadBucketName;
          let uploadBucketDirectory;
          const extraComponentProps = {};
          if (componentType === 'Upload') {
            if (record.attributeName === 'bucketName') {
              this.uploadData.bucketNameFormField = `attributeValue#${record.investgCfCmptAttrId}`;
              // 附件的桶是必输的
              formOptions.rules = [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: record.attributeName,
                  }),
                },
              ];
            }
            if (record.attributeName === 'bucketDirectory') {
              this.uploadData.bucketDirectoryFormField = `attributeValue#${
                record.investgCfCmptAttrId
              }`;
            }
            if (record.attributeName === 'templateAttachmentUUID') {
              formOptions.valuePropName = 'attachmentUUID';
              // 附件模板 需要使用附件的bucketName
              uploadBucketName =
                this.uploadData.bucketNameFormField &&
                form.getFieldValue(this.uploadData.bucketNameFormField);
              uploadBucketDirectory =
                this.uploadData.bucketDirectoryFormField &&
                form.getFieldValue(this.uploadData.bucketDirectoryFormField);
            }
            extraComponentProps.bucketName = uploadBucketName;
            extraComponentProps.bucketDirectory = uploadBucketDirectory;
          }
          const inputComponent = getElement({
            componentType,
            attributeName: record.attributeName,
            attributeValueType: record.attributeValueType,
            extraComponentProps,
          });
          let initialValue = v;
          if (record.attributeValueType === 'Tinyint') {
            initialValue = +v;
          }
          if (record.attributeValueType === 'String') {
            initialValue = v || '';
          }
          return (
            <FormItem>
              {form.getFieldDecorator(`attributeValue#${record.investgCfCmptAttrId}`, {
                initialValue,
                ...formOptions,
              })(inputComponent)}
            </FormItem>
          );
        },
      },
    ];
  }

  static contextTypes = {
    isOrg: PropTypes.bool,
  };

  componentDidMount() {
    this.queryData();
  }

  @Bind()
  queryData() {
    if (this.state.loading) {
      return;
    }
    this.setState({
      loading: true,
    });
    queryInvestigateConfigComponents({
      investgCfLineId: this.props.record.investgCfLineId,
      isOrg: this.context.isOrg,
    })
      .then(data => {
        this.setState({
          list: data.content.filter(item => item.attributeName !== 'organizationId'),
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  }

  @Bind()
  saveData() {
    if (this.state.saveLoading || this.state.loading) {
      return;
    }
    return new Promise((resolve, reject) => {
      this.props.form.validateFields((err, formData) => {
        if (err) {
          reject(err);
          return;
        }
        this.setState({
          saveLoading: true,
        });
        const submitData = [];
        this.state.list.forEach(item => {
          if (!item.investgCfCmptAttrId) {
            return;
          }
          const newValue = formData[`attributeValue#${item.investgCfCmptAttrId}`];
          if (item.attributeValue !== newValue) {
            submitData.push({
              ...item,
              attributeValue: newValue,
            });
          }
        });
        if (!submitData.length) {
          resolve();
        }
        saveInvestigateConfigComponents({
          data: submitData,
          isOrg: this.context.isOrg,
        })
          .then(data => {
            this.setState({
              saveLoading: false,
            });
            const res = getResponse(data);
            if (!res) {
              return Promise.reject(data);
            } else {
              notification.success();
              resolve();
            }
          })
          .catch(err2 => {
            this.setState({
              saveLoading: false,
            });
            reject(err2);
            return Promise.reject(err2);
          });
      });
    }).then(res => {
      this.props.onClose();
      return res;
    });
  }

  render() {
    // 调查表的桶 由于 平台 和 租户共用一个组件, 所以需要接收配置, 且没有默认值
    const {
      form: { getFieldDecorator },
      record = {},
    } = this.props;
    const { loading, list } = this.state;

    return (
      <Drawer
        title={intl.get(`spfm.investigationDefinition.view.message.title.drawer`).d('组件属性')}
        placement="right"
        width={1000}
        okText={intl.get('hzero.common.button.save').d('保存')}
        onClose={this.props.onClose}
        visible={this.props.visible}
      >
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`spfm.investigationDefinition.model.definition.Description`)
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
              label={intl
                .get(`spfm.investigationDefinition.model.definition.componentType`)
                .d('组件')}
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

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
          }}
        >
          <Button
            style={{
              marginRight: 8,
            }}
            onClick={this.props.onClose}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button onClick={this.saveData} type="primary" loading={this.state.saveLoading}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}

export default AttrsDrawer;
