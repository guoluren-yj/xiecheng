/**
 * 调查表模版组件属性编辑抽屉
 * @date Mon Aug 13 2018
 * @author yunqiang.wu yunqiang.wu@hang-china.com
 * @copyright Copyright(c) 2018 Hand
 */

import React from 'react';
import PropTypes from 'prop-types';
import lodashResult from 'lodash/result';
import { Bind, Throttle } from 'lodash-decorators';
import { head, toString } from 'lodash';
import {
  Input,
  Form,
  Drawer,
  Button,
  Table,
  Row,
  Col,
  InputNumber,
  Icon,
  Tooltip,
  DatePicker,
} from 'hzero-ui';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
// import Upload from 'components/Upload';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import Switch from 'components/Switch';
import ValueList from 'components/ValueList';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { PRIVATE_BUCKET } from '_utils/config';
import Checkbox from 'components/Checkbox';
import TransferLov from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';

import Lov from '@/routes/components/Lov'; // lov父级品类不可选
import {
  queryInvestigateConfigComponents,
  saveInvestigateConfigComponents,
} from '@/services/orgInvestigateTemplateService';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};

const tenantId = getCurrentOrganizationId();
@formatterCollections({
  code: ['spfm.investigationDefinition', 'sslm.common'],
})
@Form.create({ fieldNameProp: null })
class AttrsDrawer extends React.Component {
  static propTypes = {
    bucketName: PropTypes.string.isRequired,
  };

  uploadData = {}; // 存储额外事件

  @Throttle(400, { trailing: false })
  @Bind()
  openConditionModal(record, type = '') {
    const { handleConditionsConfiguration } = this.props;
    if (handleConditionsConfiguration) {
      handleConditionsConfiguration(record, type);
    }
  }

  @Bind()
  componentPropsTypeMap({ componentType, lovCode, attributeValueMeaning }) {
    switch (componentType) {
      case 'Upload':
        return {
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
        };
      case 'Input':
        return {
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
                    meaning: intl
                      .get(`spfm.investigationDefinition.view.message.upper`)
                      .d('转大写'),
                  },
                  {
                    value: 'lower',
                    meaning: intl
                      .get(`spfm.investigationDefinition.view.message.lower`)
                      .d('转小写'),
                  },
                  {
                    value: 'no',
                    meaning: intl.get(`spfm.investigationDefinition.view.message.null`).d('不转换'),
                  },
                ],
                style: {
                  width: '100%',
                },
              },
            },
            defaultValue: {
              type: 'Input',
              props: {
                style: {
                  width: '100%',
                },
              },
            },
          },
        };
      case 'ValueList':
        return {
          propsConfig: {
            defaultValue: {
              type: 'ValueList',
              props: {
                lovCode,
                allowClear: true,
                lazyLoad: false,
                textValue: attributeValueMeaning,
                style: {
                  width: '100%',
                },
              },
            },
          },
        };
      case 'Lov':
        return {
          propsConfig: {
            defaultValue: {
              type: 'Lov',
              props: {
                code: lovCode,
                queryParams: { tenantId },
                textValue: attributeValueMeaning,
                style: {
                  width: '100%',
                },
              },
            },
          },
        };
      case 'InputNumber':
        return {
          propsConfig: {
            validateRules: {
              type: 'ValueList',
              props: {
                lovCode: 'SSLM.BASIC_REGISTERED_CAPITAL_VERIFICATION',
                allowClear: true,
                lazyLoad: false,
                style: { width: '100%' },
              },
            },
            defaultValue: {
              type: 'Number',
              props: {
                style: {
                  width: '100%',
                },
              },
            },
          },
        };
      case 'Switch':
        return {
          propsConfig: {
            defaultValue: {
              type: 'Boolean',
              props: {
                // style: {
                //   width: '100%',
                // },
              },
            },
          },
        };
      case 'TextArea':
        return {
          propsConfig: {
            defaultValue: {
              type: 'Input',
              props: {
                style: {
                  width: '100%',
                },
              },
            },
          },
        };
      case 'Checkbox':
        return {
          propsConfig: {
            defaultValue: {
              type: 'Checkbox',
              props: {
                style: {
                  width: '100%',
                },
              },
            },
          },
        };
      case 'DatePicker':
        return {
          propsConfig: {
            defaultValue: {
              type: 'DatePicker',
              props: {
                style: {
                  width: '100%',
                },
                format: DEFAULT_DATE_FORMAT,
              },
            },
          },
        };
      case 'DateTimePicker':
        return {
          propsConfig: {
            defaultValue: {
              type: 'DatePicker',
              props: {
                style: {
                  width: '100%',
                },
                format: DEFAULT_DATETIME_FORMAT,
                placeholder: '',
                showTime: true,
              },
            },
          },
        };
      case 'TransferLov':
        return {
          propsConfig: {
            defaultValue: {
              type: 'TransferLov',
              props: {
                code: lovCode,
                queryParams: { tenantId },
                translateData: attributeValueMeaning,
                style: {
                  width: '100%',
                },
              },
            },
          },
        };
      default:
        return {};
    }
  }

  // 组件属性配置映射
  // ComponentPropsTypeMap = {
  //   Upload: {
  //     propsConfig: {
  //       templateAttachmentUUID: {
  //         type: 'File',
  //       },
  //       viewOnly: {
  //         type: 'Boolean',
  //       },
  //     },
  //     disabledField: 'viewOnly',
  //   },
  //   Input: {
  //     propsConfig: {
  //       maxLength: {
  //         type: 'Number',
  //         props: {
  //           min: 0, // 文本框的最大长度是一个自然数（非负整数）
  //           style: {
  //             width: '100%',
  //           },
  //         },
  //       },
  //       typeCase: {
  //         type: 'ValueList',
  //         props: {
  //           options: [
  //             {
  //               value: 'upper',
  //               meaning: intl.get(`spfm.investigationDefinition.view.message.upper`).d('转大写'),
  //             },
  //             {
  //               value: 'lower',
  //               meaning: intl.get(`spfm.investigationDefinition.view.message.lower`).d('转小写'),
  //             },
  //             {
  //               value: '',
  //               meaning: intl.get(`spfm.investigationDefinition.view.message.null`).d('不转换'),
  //             },
  //           ],
  //           style: {
  //             width: '100%',
  //           },
  //         },
  //       },
  //     },
  //   },
  // };

  // 组件类型到组件映射
  ConfigMap = {
    ValueList,
    File: Upload,
    Boolean: Switch,
    Tinyint: Switch,
    String: Input,
    Integer: InputNumber,
    Number: InputNumber,
    Lov,
    Input,
    Checkbox,
    DatePicker,
    DateTimePicker: DatePicker,
    TransferLov,
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
    lovCode,
    attributeValueMeaning,
    record = {},
  }) {
    const componentTypeConfig =
      this.componentPropsTypeMap({ componentType, lovCode, attributeValueMeaning }) || {};

    const propsConfig = lodashResult(componentTypeConfig, `propsConfig.${attributeName}`, {
      type: attributeValueType,
    });

    const ComponentClass = this.ConfigMap[propsConfig.type] || Input;

    const extraComponentProps = {};
    if (attributeName === 'disabled') {
      extraComponentProps.checkedValue = false;
      extraComponentProps.unCheckedValue = true;
    }
    if (attributeName === 'pattern') {
      extraComponentProps.addonAfter = (
        <div
          style={{
            cursor: 'pointer',
          }}
          onClick={() => {
            this.openConditionModal(record, 'pattern');
          }}
        >
          {intl.get('sslm.common.model.condition.fx').d('fx')}
        </div>
      );
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

  // 获取属性描述
  @Bind()
  getAttrDesc(_, record) {
    const { attributeName, attributeDescription } = record;
    switch (attributeName) {
      case 'validateRules':
        return (
          <Tooltip
            title={intl
              .get('sslm.common.toolTip.validateRules')
              .d('若填写的数值不在参考区间范围内，可配置强校验或弱校验提示')}
          >
            {attributeDescription}
            <Icon type="question-circle-o" style={{ marginLeft: 2 }} />
          </Tooltip>
        );
      case 'referenceRange':
        return (
          <Tooltip
            title={intl
              .get('sslm.common.toolTip.referenceRange')
              .d('参考区间维护时请按格式(a,b]、[a,b)、(a,b)、[a,b]')}
          >
            {attributeDescription}
            <Icon type="question-circle-o" style={{ marginLeft: 2 }} />
          </Tooltip>
        );
      default:
        return attributeDescription;
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loading: false,
      saveLoading: false,
    };
    const { record: parentRecord } = this.props;
    const { configName, fieldCode, componentType: parentComponentType } = parentRecord || {};
    this.columns = [
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.attrName`).d('属性名称'),
        width: 160,
        dataIndex: 'attributeName',
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.attrDesc`).d('属性描述'),
        dataIndex: 'attributeDescription',
        render: this.getAttrDesc,
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.attrVal`).d('属性值'),
        align: 'left',
        width: 160,
        dataIndex: 'attributeValue',
        render: (v, record) => {
          const {
            record: { componentType, lovCode },
            form,
          } = this.props;
          const formOptions = {};
          let uploadBucketName;
          let uploadBucketDirectory;
          const extraComponentProps = {};
          if (['sslm_investg_attachment'].includes(configName)) {
            if (
              ['attachment_type'].includes(fieldCode) &&
              ['Cascader'].includes(parentComponentType) &&
              record.attributeName === 'defaultValue'
            ) {
              extraComponentProps.disabled = true;
            }
          }
          if (componentType === 'Upload') {
            if (record.attributeName === 'bucketName') {
              this.uploadData.bucketNameFormField = `attributeValue#${record.investgCfCmptAttrId}`;
              // 附件的桶是必输的
              formOptions.rules = [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: record.attributeName || '',
                  }),
                },
              ];
              extraComponentProps.disabled = true;
            }

            if (record.attributeName === 'isAttachmentUrl') {
              this.uploadData.isAttachmentUrlFormField = `attributeValue#${record.investgCfCmptAttrId}`;
              extraComponentProps.disabled = true;
            }

            if (record.attributeName === 'bucketDirectory') {
              this.uploadData.bucketDirectoryFormField = `attributeValue#${record.investgCfCmptAttrId}`;
            }
            if (record.attributeName === 'templateAttachmentUUID') {
              formOptions.valuePropName = 'attachmentUUID';
              // 附件模板 需要使用附件的bucketName
              uploadBucketName =
                (this.uploadData.bucketNameFormField &&
                  form.getFieldValue(this.uploadData.bucketNameFormField)) ||
                PRIVATE_BUCKET;
              uploadBucketDirectory =
                this.uploadData.bucketDirectoryFormField &&
                form.getFieldValue(this.uploadData.bucketDirectoryFormField);
            }
            if (record.attributeName === 'fileMaxNum') {
              extraComponentProps.min = 0;
              extraComponentProps.precision = 0;
            }
            extraComponentProps.bucketName = uploadBucketName;
            extraComponentProps.bucketDirectory = uploadBucketDirectory;
          }
          const referenceRangeRecord = head(
            this.state.list.filter(n => n.attributeName === 'referenceRange')
          );
          const referenceRange =
            referenceRangeRecord &&
            form.getFieldValue(`attributeValue#${referenceRangeRecord.investgCfCmptAttrId}`);
          if (componentType === 'InputNumber') {
            if (record.attributeName === 'validateRules') {
              // 【参考区间】不为空时，【校验规则】必输
              formOptions.rules = [
                {
                  required: referenceRange,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: record.attributeDescription || '',
                  }),
                },
              ];
            }
            if (record.attributeName === 'referenceRange') {
              formOptions.rules = [
                {
                  pattern: /^([([])([1-9]\d*\.?\d*)+[,]([1-9]\d*\.?\d*)+([)\]])$/g,
                  message: intl
                    .get('sslm.common.validation.referenceRange')
                    .d('参考区间格式不正确'),
                },
              ];
            }
          }
          if (
            record.attributeName === 'conditionConfig' ||
            record.attributeName === 'patternCondition'
          ) {
            formOptions.rules = [
              {
                pattern: /^\s*[0-9A-Za-z]+\s*[:]\s*[0-9A-Za-z]+\s*$/,
                message: intl.get('sslm.common.validation.conditionConfig').d('数据字段格式不正确'),
              },
            ];
          }
          const inputComponent = this.getElement({
            componentType,
            attributeName: record.attributeName,
            attributeValueType: record.attributeValueType,
            extraComponentProps,
            lovCode,
            attributeValueMeaning: record.attributeValueMeaning,
            record,
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
          if (
            (record.componentType === 'DatePicker' || record.componentType === 'DateTimePicker') &&
            record.attributeName === 'defaultValue'
          ) {
            initialValue = v ? moment(v) : undefined;
          }
          if (
            (record.componentType === 'Checkbox' || record.componentType === 'Switch') &&
            record.attributeName === 'defaultValue'
          ) {
            initialValue = Number(v) ? 1 : 0;
          }
          return (
            <FormItem style={{ marginBottom: '0px' }}>
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
          let newValue = formData[`attributeValue#${item.investgCfCmptAttrId}`];
          if (item.attributeValue !== newValue) {
            const { componentType, attributeName } = item;
            if (attributeName === 'defaultValue') {
              if (componentType === 'DatePicker') {
                newValue = newValue ? newValue.format(DEFAULT_DATE_FORMAT) : null;
              }
              if (componentType === 'DateTimePicker') {
                newValue = newValue ? newValue.format(DEFAULT_DATETIME_FORMAT) : null;
              }
            }
            if (attributeName === 'mandatoryField') {
              if (componentType === 'Upload') {
                newValue = newValue ? newValue.toString() : null;
              }
            }
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
        zIndex={10}
      >
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              style={{ marginBottom: '16px' }}
              {...formItemLayout}
              label={intl
                .get(`spfm.investigationDefinition.model.definition.fieldDesc`)
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
              label={intl.get(`spfm.investigationDefinition.model.definition.component`).d('组件')}
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
          style={{ marginBottom: 40 }}
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
