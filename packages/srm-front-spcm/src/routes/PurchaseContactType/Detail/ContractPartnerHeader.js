/**
 * ContractPartnerHeader - 采购协议头信息
 * @date: 2019-05-15
 * @author: zuoxiangyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Tooltip, Select, Icon } from 'hzero-ui';
import classnames from 'classnames';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import { isUndefined } from 'lodash';
// import moment from 'moment';
import warning from '@/assets/warning.svg';

import intl from 'utils/intl';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import styles from './index.less';

const { TextArea } = Input;
// const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
/**
 * ContractPartnerHeader - 采购协议头信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ContractPartnerHeader extends Component {
  render() {
    const {
      editable,
      form = {},
      dataSource = [],
      handleCompany,
      handleLifeCycle,
      editContractType = false,
      pcTypeId,
      tenantId,
      newEnumMap = {},
      handleAcceptFlagChange = (e) => e,
      customizeForm,
      remote,
    } = this.props;
    const { acceptTypeList = [] } = newEnumMap;
    const { getFieldDecorator = (e) => e } = form;
    const {
      createByRealName,
      creationDate,
      // companyName,
      remark,
      pcTypeName,
      companyId,
      pcTypeCode,
      enabledFlag,
      dataFlag,
      orderQuantityFlag,
      rebateFlag,
      paperFlag,
      effectiveTimeFlag, // 控制协议有效期
      orderTypeId, // 关联订单类型id
      orderTypeName, // 关联订单类型
      acceptFlag, // 是否协议验收
      acceptType, // 验收类型
      contractPendingMethod, // 协议阶段行新建方式 1手工新建 空和0由协议类型带出
      contractCalculateMethod, // 协议阶段计算方式1:按比例 0按费用 为空走老逻辑
      supplierQaExpireFlag, // 供应商资质证件过期限制
      enableRule, // 是否启用优惠规则
    } = dataSource;
    const pcTypeCodeRoules = [
      {
        required: true,
        message: intl.get('hzero.common.validation.notNull', {
          name: intl.get(`spcm.purchaseContractType.model.pcTypeCode`).d('协议类型编码'),
        }),
      },
      {
        max: 12,
        message: intl.get('hzero.common.validation.max', { max: 12 }),
      },
      {
        pattern: /^[A-Z\d]+$/,
        message: intl
          .get(`spcm.purchaseContractType.model.capitalLettersOrNumbersOnly`)
          .d('协议类型编码只能由大写字母或数字组成'),
      },
    ];
    const remoterPcTypeCodeRoules = remote
      ? remote.process(
          'SPCM_PURCHASECONTACTYPE_CONTRACTPARTNERHEADER_PCTYPECODEROULES',
          pcTypeCodeRoules
        )
      : pcTypeCodeRoules;
    const pcTypeCodeTypeCase = remote
      ? remote.process(
          'SPCM_PURCHASECONTACTYPE_CONTRACTPARTNERHEADER_PCTYPECODEROULESTYPESCASE',
          'upper'
        )
      : 'upper';
    return customizeForm(
      {
        code: 'SPCM.CONTRACT.TYPE.DETAIL',
        form,
        dataSource,
      },
      <Form>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(editable ? 'writable-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spcm.purchaseContractType.model.pcTypeCode`).d('协议类型编码')}
            >
              {getFieldDecorator(`pcTypeCode`, {
                initialValue: pcTypeCode,
                rules: remoterPcTypeCodeRoules,
              })(pcTypeId ? <span>{pcTypeCode}</span> : <Input typeCase={pcTypeCodeTypeCase} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spcm.purchaseContractType.model.pcTypeName`).d('协议类型名称')}
            >
              {getFieldDecorator(`pcTypeName`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spcm.purchaseContractType.model.pcTypeName`)
                        .d('协议类型名称'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                ],
                initialValue: pcTypeName,
              })(<Input disabled={editContractType} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.company.tag`).d('公司')}
            >
              {getFieldDecorator('companyId', {
                initialValue: companyId,
              })(
                pcTypeId ? (
                  <div>
                    <span>
                      <a disabled={!enabledFlag} onClick={() => handleCompany()}>
                        {intl.get(`spcm.common.view.title.distributionCompany`).d('分配公司')}
                      </a>
                    </span>
                    {dataFlag ? null : (
                      <span style={{ marginLeft: 4 }}>
                        <Tooltip
                          title={intl
                            .get(`spcm.common.view.title.assignedCompany`)
                            .d('您尚未分配任何公司')}
                        >
                          <img src={warning} alt="img" />
                        </Tooltip>
                      </span>
                    )}
                  </div>
                ) : (
                  <Tooltip
                    title={intl
                      .get(`spcm.common.view.title.assignedCompany`)
                      .d('您尚未分配任何公司')}
                  >
                    <img src={warning} alt="img" />
                  </Tooltip>
                )
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.roles.creator`).d('创建人')}
            >
              {getFieldDecorator('createByRealName', {
                initialValue: createByRealName,
              })(<span>{createByRealName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get('hzero.common.date.creation').d('创建时间')}
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate', {
                initialValue: creationDate,
              })(<span>{creationDate}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`spcm.purchaseContractType.model.orderQuantityFlag`)
                .d('控制下单数量')}
            >
              {getFieldDecorator('orderQuantityFlag', {
                initialValue: orderQuantityFlag || 0,
              })(<Switch disabled={editContractType} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(editable ? 'writable-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spcm.purchaseContractType.model.rebateFlag`).d('是否返利')}
            >
              {getFieldDecorator('rebateFlag', {
                initialValue: rebateFlag || 0,
              })(<Switch disabled={editContractType} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT} className={classnames(styles['life-cycle'])}>
            <Form.Item
              {...formItemLayout}
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`spcm.common.view.entity.lifeCycle`).d('签署方生命周期控制')}
            >
              <div>
                <span>
                  <a disabled={!pcTypeId} onClick={() => handleLifeCycle()}>
                    {intl.get(`spcm.common.view.definitionList.`).d('定义列表')}
                  </a>
                </span>
              </div>
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spcm.purchaseContractType.model.paperFlag`).d('纸质合同配送')}
            >
              {getFieldDecorator('paperFlag', {
                initialValue: paperFlag || 0,
              })(<Switch disabled={editContractType} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(editable ? 'writable-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spcm.purchaseContractType.model.enabledFlag`).d('是否启用')}
            >
              {getFieldDecorator('enabledFlag', {
                initialValue: isUndefined(enabledFlag) ? 1 : enabledFlag,
              })(<Switch />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`spcm.purchaseContractType.model.effectiveTimeFlag`)
                .d('控制协议有效期')}
            >
              {getFieldDecorator('effectiveTimeFlag', {
                initialValue: isUndefined(effectiveTimeFlag) ? 1 : effectiveTimeFlag,
              })(<Switch />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`spcm.purchaseContractType.model.supplierQaExpireFlag`)
                .d('供应商资质证件过期限制')}
            >
              {getFieldDecorator('supplierQaExpireFlag', {
                initialValue: supplierQaExpireFlag || '0',
              })(<Switch />)}
            </Form.Item>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(editable ? 'writable-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.orderType.model.orderType.linkOrderTypeId`).d('关联订单类型')}
            >
              {getFieldDecorator('orderTypeId', {
                initialValue: orderTypeId,
              })(
                <Lov code="SPCM.ORDER_TYPE" textValue={orderTypeName} queryParams={{ tenantId }} />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spcm.purchaseContractType.model.acceptFlag`).d('是否协议验收')}
            >
              {getFieldDecorator('acceptFlag', {
                initialValue: isUndefined(acceptFlag) ? 1 : acceptFlag,
              })(<Switch onChange={handleAcceptFlagChange} />)}
            </Form.Item>
          </Col>
          {(isUndefined(acceptFlag) ? 1 : acceptFlag) ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`spcm.common.model.checkType`).d('验收类型')}
                {...formItemLayout}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('acceptType', {
                  initialValue: acceptType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spcm.common.model.checkType`).d('验收类型'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear style={{ minWidth: 150 }}>
                    {acceptTypeList.map((n) => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          ) : (
            ''
          )}
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(editable ? 'writable-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`hzero.common.remark`).d('备注')}
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('remark', {
                initialValue: remark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(<TextArea rows={2} disabled={editContractType} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`spcm.purchaseContractType.model.enableRule`)
                .d('是否启用合同优惠规则')}
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('enableRule', {
                initialValue: enableRule || 0,
              })(<Switch disabled={editContractType} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={
                <>
                  {intl.get('spcm.common.model.contractPendingMethod').d('协议阶段新建方式')}
                  <Tooltip
                    title={intl
                      .get('spcm.common.view.message.contractPendingMethodTips')
                      .d('控制协议阶段行新增时，是由用户手工新建，还是带出协议类型里维护的阶段。')}
                  >
                    <Icon type="question-circle-o" style={{ verticalAlign: 'unset' }} />
                  </Tooltip>
                </>
              }
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contractPendingMethod', {
                initialValue: contractPendingMethod,
              })(
                <ValueList
                  lovCode="SPCM_PC_STAGE_PENDING_METHOD"
                  lazyLoad={false}
                  style={{ width: '100%' }}
                  allowClear
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={
                <>
                  {intl.get('spcm.common.model.contractCalculateMethod').d('协议阶段计算方式')}
                  <Tooltip
                    title={intl
                      .get('spcm.common.view.message.contractCalculateMethodTips')
                      .d(
                        '控制阶段计算方式，选择按比例计算费用，则仅可填写比例，费用由比例*协议总额得出；选择按费用计算比例，则仅可填写费用，比例由费用/协议总额得出。'
                      )}
                  >
                    <Icon type="question-circle-o" style={{ verticalAlign: 'unset' }} />
                  </Tooltip>
                </>
              }
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contractCalculateMethod', {
                initialValue: contractCalculateMethod,
              })(
                <ValueList
                  lovCode="SPCM_PC_CONTRACT_CALCULATE_METHOD"
                  lazyLoad={false}
                  style={{ width: '100%' }}
                  allowClear
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
