/**
 * FrontComputerModal -前置机定义modal 编辑页
 * @date: 2018-9-13
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input, Row, Col, Checkbox } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import intl from 'utils/intl';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onHandleSaveFrontCompter - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FrontComputerModal extends PureComponent {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { tableRecord, changeIp, changeUrl } = nextProps;
    if (prevState !== null) {
      if (
        tableRecord !== prevState.tableRecord ||
        changeUrl !== prevState.changeUrl ||
        changeIp !== prevState.changeIp
      ) {
        return {
          ...prevState,
          tableRecord,
          changeIp,
          changeUrl,
        };
      } else {
        return null;
      }
    }
  }

  // 点击确认回调
  @Bind()
  onOk() {
    const { form, onHandleSaveFrontCompter, tableRecord, tenantId } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleSaveFrontCompter({
          ...tableRecord,
          ...values,
          tenantId,
          externalSystemCode:
            values.externalSystemCode === tableRecord.externalSystemName
              ? tableRecord.externalSystemCode
              : values.externalSystemCode,
        });
      }
    });
  }

  @Bind()
  changeIpOrUrl(values) {
    const { onChangeIpOrUrl } = this.props;
    onChangeIpOrUrl(values);
  }

  render() {
    const {
      modalVisible,
      anchor,
      tableRecord = {},
      loading,
      onCancel,
      changeIp,
      changeUrl,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const options = [
      {
        label: intl.get('sitf.frontComputerDef.model.frontComputerDef.IPAndPort').d('IP/端口'),
        value: 'ip',
      },
      {
        label: intl.get('sitf.frontComputerDef.model.frontComputerDef.url').d('URL'),
        value: 'url',
      },
    ];
    const tableRecordIsEmpty = isEmpty(tableRecord);
    const changeIpOrUrlArr = changeIp && changeUrl ? ['ip', 'url'] : changeIp ? ['ip'] : ['url'];
    return (
      <Modal
        destroyOnClose
        title={intl
          .get('sitf.frontComputerDef.view.frontComputerDef.editHeader')
          .d('前置机定义维护')}
        width={520}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={modalVisible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={loading}
      >
        <Form>
          <FormItem
            label={intl.get('sitf.common.frontEndSystem.code').d('前置机代码')}
            {...formLayout}
          >
            {getFieldDecorator('frontEndSystemCode', {
              rules: [
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 30,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.common.frontEndSystem.code').d('前置机代码'),
                  }),
                },
              ],
              initialValue: tableRecord.frontEndSystemCode,
            })(
              <Input
                disabled={tableRecord.frontEndSystemCode}
                typeCase="upper"
                trim
                inputChinese={false}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('sitf.common.frontEndSystem.name').d('前置机名称')}
            {...formLayout}
          >
            {getFieldDecorator('frontEndSystemName', {
              rules: [
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 30,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.common.frontEndSystem.name').d('前置机名称'),
                  }),
                },
              ],
              initialValue: tableRecord.frontEndSystemName,
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('sitf.common.data.externalSystemName').d('外部系统名称')}
            {...formLayout}
          >
            {getFieldDecorator('externalSystemCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.common.data.externalSystemName').d('外部系统名称'),
                  }),
                },
              ],
              initialValue: tableRecord.externalSystemName,
            })(<Lov textValue={tableRecord.externalSystemName} code="SIFC.EXTERNAL_SYSTEM" />)}
          </FormItem>
          <FormItem
            label={intl.get('sitf.frontComputerDef.model.frontComputerDef.network').d('网络地址')}
            {...formLayout}
          >
            {getFieldDecorator('alert', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.frontComputerDef.model.frontComputerDef.network')
                      .d('网络地址'),
                  }),
                },
              ],
              initialValue: changeIpOrUrlArr,
            })(<CheckboxGroup options={options} onChange={this.changeIpOrUrl} />)}
          </FormItem>
          {changeIp && (
            <Row type="flex" justify="space-between">
              <Col span={16}>
                <FormItem
                  {...layout}
                  label={intl
                    .get('sitf.frontComputerDef.model.frontComputerDef.IPAndPort')
                    .d('IP:端口')}
                >
                  {getFieldDecorator('ip', {
                    initialValue: tableRecord.ip,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('sitf.frontComputerDef.model.frontComputerDef.IP').d('IP'),
                        }),
                      },
                      {
                        max: 15,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`hzero.common.validation.max`, {
                            max: 15,
                          }),
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={5} style={{ marginRight: '8%' }}>
                <FormItem>
                  {getFieldDecorator('port', {
                    initialValue: tableRecord.port,
                    rules: [
                      {
                        required: !!getFieldValue('ip'),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sitf.frontComputerDef.model.frontComputerDef.port')
                            .d('端口'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
          )}
          {changeUrl && (
            <FormItem
              label={intl.get('sitf.frontComputerDef.model.frontComputerDef.url').d('URL')}
              {...formLayout}
            >
              {getFieldDecorator('url', {
                initialValue: tableRecord.url,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sitf.frontComputerDef.model.frontComputerDef.url').d('URL'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          )}
          <FormItem
            label={intl.get('sitf.frontComputerDef.model.frontComputerDef.grantType').d('授权类型')}
            {...formLayout}
          >
            {getFieldDecorator('grantType', {
              initialValue: tableRecord.grantType,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.frontComputerDef.model.frontComputerDef.grantType')
                      .d('授权类型'),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('sitf.frontComputerDef.model.frontComputerDef.username').d('用户名')}
            {...formLayout}
          >
            {getFieldDecorator('username', {
              initialValue: tableRecord.username,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.frontComputerDef.model.frontComputerDef.username')
                      .d('用户名'),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('sitf.frontComputerDef.model.frontComputerDef.scope').d('授权范围')}
            {...formLayout}
          >
            {getFieldDecorator('scope', {
              initialValue: tableRecord.scope,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.frontComputerDef.model.frontComputerDef.scope')
                      .d('授权范围'),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          {tableRecordIsEmpty && (
            <React.Fragment>
              <FormItem
                label={intl.get('sitf.frontComputerDef.model.frontComputerDef.password').d('密码')}
                {...formLayout}
              >
                {getFieldDecorator('password', {
                  initialValue: '',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: '密码',
                      }),
                    },
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                  ],
                })(<Input type="password" autoComplete="new-password" />)}
              </FormItem>
              <FormItem
                label={intl
                  .get('sitf.frontComputerDef.model.frontComputerDef.clientId')
                  .d('CLIENT_ID')}
                {...formLayout}
              >
                {getFieldDecorator('clientId', {
                  initialValue: '',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: 'CLIENT_ID',
                      }),
                    },
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                  ],
                })(<Input type="password" autoComplete="new-password" />)}
              </FormItem>
              <FormItem
                label={intl
                  .get('sitf.frontComputerDef.model.frontComputerDef.clientSecret')
                  .d('客户端密码')}
                {...formLayout}
              >
                {getFieldDecorator('clientSecret', {
                  initialValue: '',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: '客户端密码',
                      }),
                    },
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                  ],
                })(<Input type="password" autoComplete="new-password" />)}
              </FormItem>
            </React.Fragment>
          )}
          <FormItem label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
            {getFieldDecorator('remark', {
              initialValue: tableRecord.remark,
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
