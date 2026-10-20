/**
 * BusinessOrderLine - 产品线详细form
 * @date: 2020-2-24
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, Select } from 'hzero-ui';
import classnames from 'classnames';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { dateTimeRender } from 'utils/renderer'; //日期时间格式化

import Lov from 'components/Lov';

const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class BusinessOrderLine extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  render() {
    const {
      disabledFlg,
      readOnlyFlag,
      tenantId,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      initData = {},
      notificationType = [],
      // onCompanyChange,
      fetchAutoGetParams,
      customizeForm,
    } = this.props;
    return customizeForm(
      {
        code: 'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.BASE',
        form: this.props.form,
        dataSource: initData,
        readOnly: readOnlyFlag,
      },
      <Form>
        <Row gutter={48} className={classnames('half-row', 'inclusion-row')}>
          <Col span={12}>
            <Form.Item
              {...formItemLayout}
              label={intl
                .get(`spfm.businessOrder.model.businessOrder.notificationTitle`)
                .d('通知单标题')}
            >
              {getFieldDecorator('notificationTitle', {
                initialValue: initData.notificationTitle,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.businessOrder.model.businessOrder.notificationTitle`)
                        .d('通知单标题'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
              })(disabledFlg || readOnlyFlag ? <span>{initData.notificationTitle}</span> : <Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="inclusion-row">
          <Col span={8}>
            <Form.Item {...formItemLayout} label={intl.get('entity.company.tag').d('公司')}>
              {getFieldDecorator('companyCode', {
                initialValue: initData.companyCode,
              })}
              {getFieldDecorator('companyId', {
                initialValue: initData.companyId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.company.tag').d('公司'),
                    }),
                  },
                ],
              })(
                disabledFlg || readOnlyFlag ? (
                  <span>{initData.companyName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTHORITY_COMPANY"
                    textValue={initData.companyName}
                    queryParams={{ tenantId }}
                    onChange={(_, record) => {
                      setFieldsValue({
                        companyCode: record.companyNum,
                      });
                      // onCompanyChange(record);
                      fetchAutoGetParams({ companyId: record.companyId }, 'company', record);
                    }}
                  />
                )
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('spfm.businessOrder.model.businessOrder.ouName').d('业务实体')}
            >
              {getFieldDecorator('ouId', {
                initialValue: initData.ouId,
              })(
                disabledFlg || readOnlyFlag ? (
                  <span>{initData.ouName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.OU"
                    textValue={initData.ouName}
                    lovOptions={{ displayField: 'ouName', textField: 'ouId' }}
                    queryParams={{
                      tenantId,
                      enabledFlag: 1,
                      companyId: getFieldValue('companyId'),
                    }}
                    onChange={(_, record) => {
                      fetchAutoGetParams({ ouId: record.ouId }, 'ouId');
                    }}
                  />
                )
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={intl
                .get('spfm.businessOrder.model.businessOrder.purchaseOrgName')
                .d('采购组织')}
            >
              {getFieldDecorator('purchaseOrgId', {
                initialValue: initData.purchaseOrgId,
              })(
                disabledFlg || readOnlyFlag ? (
                  <span>{initData.purchaseOrgName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.PURCHASE_ORG"
                    textValue={initData.purchaseOrgName}
                    lovOptions={{ displayField: 'organizationName', textField: 'organizationId' }}
                    queryParams={{ tenantId, enabledFlag: 1, ouId: getFieldValue('ouId') }}
                    onChange={(_, record) => {
                      fetchAutoGetParams({ purchaseOrgId: record.purchaseOrgId });
                    }}
                  />
                )
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={intl
                .get('spfm.businessOrder.model.businessOrder.purchaseAgentName')
                .d('采购员')}
            >
              {getFieldDecorator('purchaseAgentId', {
                initialValue: initData.purchaseAgentId,
              })(
                disabledFlg || readOnlyFlag ? (
                  <span>{initData.purchaseAgentName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTH.PUR_ORG_AGENT"
                    textValue={initData.purchaseAgentName}
                    queryParams={{
                      tenantId,
                      purchaseOrgId: getFieldValue('purchaseOrgId'),
                    }}
                  />
                )
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('spfm.businessOrder.model.businessOrder.unitName').d('部门')}
            >
              {getFieldDecorator('unitId', {
                initialValue: initData.unitId,
              })(
                disabledFlg || readOnlyFlag ? (
                  <span>{initData.unitName}</span>
                ) : (
                  <Lov
                    code="SPFM.USER_AUTHORITY_UNIT"
                    textValue={initData.unitName}
                    textField="unitName"
                    queryParams={{ tenantId }}
                  />
                )
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={intl
                .get(`spfm.businessOrder.model.businessOrder.notificationType`)
                .d('通知单类型')}
            >
              {getFieldDecorator('notificationType', {
                initialValue: initData.notificationType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.businessOrder.model.businessOrder.notificationType`)
                        .d('通知单类型'),
                    }),
                  },
                ],
              })(
                disabledFlg || readOnlyFlag ? (
                  <span>{initData.notificationTypeMeaning}</span>
                ) : (
                  <Select allowClear>
                    {notificationType.map((n) => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="inclusion-row">
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={intl
                .get(`spfm.businessOrder.model.businessOrder.notificationNum`)
                .d('通知单编号')}
            >
              {getFieldDecorator('notificationNum', {
                initialValue: initData.notificationNum,
              })(<span>{initData.notificationNum}</span>)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={intl
                .get(`spfm.businessOrder.model.businessOrder.notificationStatus`)
                .d('状态')}
            >
              {getFieldDecorator('notificationStatuMeaning', {
                initialValue: initData.notificationStatuMeaning,
              })(<span>{initData.notificationStatuMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('spfm.businessOrder.model.businessOrder.releaseBy').d('创建人')}
            >
              {getFieldDecorator('realName', {
                initialValue: initData.realName,
              })(<span>{initData.realName}</span>)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('spfm.businessOrder.model.businessOrder.creationDate').d('创建时间')}
            >
              {getFieldDecorator('creationDate', {
                initialValue: initData.creationDate,
              })(<span>{dateTimeRender(initData.creationDate)}</span>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
