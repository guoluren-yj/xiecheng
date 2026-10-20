/**
 * HeaderInfo - 供应商配额管理-详情-头信息
 * @date: 2020-06-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { cloneDeep, isNil } from 'lodash';
import { Form, Row, Col, Input, DatePicker, Select, InputNumber } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { dateRender, dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const tenantId = getCurrentOrganizationId();

export default class HeaderInfo extends Component {
  /**
   * 有效周期回调
   * @param {*} cycle 周期
   * @param {*} effectiveFrom 有效期从
   */
  @Bind()
  handleEffectiveChange(cycle, effectiveFrom) {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    const effectiveDateFrom = effectiveFrom || moment().startOf('month');
    const newDate = cloneDeep(effectiveDateFrom);
    let effectiveDateTo;
    switch (cycle) {
      case 'MONTH':
        effectiveDateTo = newDate.add(1, 'months').subtract(1, 'days');
        break;
      case 'QUARTER':
        effectiveDateTo = newDate.add(1, 'quarters').subtract(1, 'days');
        break;
      case 'HALF-YEAR':
        effectiveDateTo = newDate.add(6, 'months').subtract(1, 'days');
        break;
      case 'YEAR':
        effectiveDateTo = newDate.add(1, 'years').subtract(1, 'days');
        break;
      default:
        effectiveDateTo = getFieldValue('effectiveDateTo');
        break;
    }
    setFieldsValue({
      effectiveDateFrom,
      effectiveDateTo,
    });
  }

  @Bind()
  handleJump(sourceDocUrl) {
    const { history } = this.props;
    history.push(`${sourceDocUrl}`);
  }

  // 公司回调方法
  @Bind()
  handleCompany(companyId, lovRecord, props) {
    const {
      form: { setFieldsValue },
      setCompanyId = e => e,
    } = props;
    setCompanyId(companyId);
    setFieldsValue({ ouId: null });
  }

  render() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue, setFieldsValue, validateFields },
      headerInfo = {},
      evalStatus,
      customizeForm,
      supQuotaManageRemote,
      effectiveCycle = [],
      controlMethodList = [],
      // setCompanyId = e => e,
    } = this.props;

    const isEdit = [undefined, 'NEW', 'REJECTED'].includes(evalStatus);

    const updateFlag = [undefined, 'NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus); // 解锁后仍可编辑

    // 埋点实现公司onchange方法
    const companyRemoteMethod =
      supQuotaManageRemote &&
      supQuotaManageRemote.process('SSLM_SUP_QUOTA_MANAGE_COMPANY_PROCESS', {});

    // 如果有埋点，优先取埋点返回的方法
    const handleOnChange =
      typeof companyRemoteMethod === 'function' && !isNil(companyRemoteMethod)
        ? companyRemoteMethod
        : this.handleCompany;

    const remoteNode =
      supQuotaManageRemote &&
      supQuotaManageRemote.process('SSLM_SUP_QUOTA_MANAGE_HEADER_INFO', null, {
        form,
        isEdit,
        headerInfo,
      });

    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_QUOTA_MANAGE.HEADER',
        form: this.props.form,
        dataSource: headerInfo,
      },
      <Form className="ued-edit-form form-wrap">
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.agreementNo').d('配额协议号')}
            >
              {getFieldDecorator('quotaAgreementNum', {
                initialValue: headerInfo.quotaAgreementNum,
              })(<span>{headerInfo.quotaAgreementNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierQuotaManage.modal.quota.agreementDesc')
                .d('配额协议描述')}
            >
              {getFieldDecorator('quotaAgreementDescription', {
                initialValue: headerInfo.quotaAgreementDescription,
              })(updateFlag ? <Input /> : <span>{headerInfo.quotaAgreementDescription}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.creationTime').d('创建时间')}
            >
              {getFieldDecorator('creationDate', {
                initialValue: headerInfo.creationDate,
              })(<span>{dateTimeRender(headerInfo.creationDate)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.founder').d('创建人')}
            >
              {getFieldDecorator('createName', {
                initialValue: headerInfo.createName,
              })(<span>{headerInfo.createName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.company').d('公司')}
            >
              {getFieldDecorator('companyId', {
                initialValue: headerInfo.companyId,
              })(
                isEdit ? (
                  <Lov
                    code="SPCM.USER_AUTH.COMPANY"
                    textValue={headerInfo.companyName}
                    queryParams={{ tenantId }}
                    onChange={(companyId, lovRecord) =>
                      handleOnChange(companyId, lovRecord, this.props)
                    }
                  />
                ) : (
                  <span>{headerInfo.companyName}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.businessEntity').d('业务实体')}
            >
              {getFieldDecorator('ouId', {
                initialValue: headerInfo.ouId,
              })(
                isEdit ? (
                  <Lov
                    code="HPFM.OU"
                    queryParams={{ tenantId, companyId: getFieldValue('companyId') }}
                    textValue={headerInfo.ouName}
                  />
                ) : (
                  <span>{headerInfo.ouName}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.department').d('创建人部门')}
            >
              {getFieldDecorator('unitId', {
                initialValue: headerInfo.unitId,
              })(
                isEdit ? (
                  <Lov
                    code="SPRM.USER_DEPARTMENT"
                    queryParams={{ tenantId }}
                    textValue={headerInfo.unitName}
                    disabled={headerInfo.evalStatus === undefined}
                  />
                ) : (
                  <span>{headerInfo.unitName}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
              {getFieldDecorator('evalStatus', {
                initialValue: headerInfo.evalStatus,
              })(<span>{headerInfo.evalStatusMeaning}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.versionNum').d('版本号')}
            >
              {getFieldDecorator('versionNum', {
                initialValue: headerInfo.versionNum,
              })(<span>{headerInfo.versionNum}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierQuotaManage.modal.quota.lastUpdateTime')
                .d('最后更新时间')}
            >
              {getFieldDecorator('lastUpdateDate', {
                initialValue: headerInfo.lastUpdateDate,
              })(<span>{dateTimeRender(headerInfo.lastUpdateDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.categoryCode').d('品类编码')}
            >
              {getFieldDecorator('itemCategoryId', {
                initialValue: headerInfo.itemCategoryId,
                rules: [
                  {
                    required:
                      !(
                        getFieldValue('itemName') ||
                        getFieldValue('itemId') ||
                        getFieldValue('itemCategoryName')
                      ) && isEdit,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.supplierQuotaManage.modal.quota.categoryCode')
                        .d('品类编码'),
                    }),
                  },
                ],
              })(
                isEdit ? (
                  <Lov
                    code="SMDM.TREE_ITEM_CATEGORY"
                    textValue={headerInfo.categoryCode}
                    lovOptions={{ displayField: 'categoryCode' }}
                    queryParams={{ tenantId, itemId: getFieldValue('itemId') }}
                    onChange={(_, lovRecord) => {
                      setFieldsValue({
                        itemCategoryName: lovRecord.categoryName,
                      });
                      // 强制校验
                      setTimeout(() => {
                        validateFields(['itemId', 'itemCategoryId'], { force: true });
                      }, 200);
                    }}
                  />
                ) : (
                  <span>{headerInfo.categoryCode}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.categoryName').d('品类名称')}
            >
              {getFieldDecorator('itemCategoryName', {
                initialValue: headerInfo.itemCategoryName,
              })(
                isEdit ? (
                  <Input
                    disabled={getFieldValue('itemCategoryId')}
                    onChange={() => {
                      // 强制校验
                      setTimeout(() => {
                        validateFields(['itemCategoryId', 'itemId'], { force: true });
                      }, 200);
                    }}
                  />
                ) : (
                  <span>{headerInfo.itemCategoryName}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.itemCode').d('物料编码')}
            >
              {getFieldDecorator('itemId', {
                initialValue: headerInfo.itemId,
                rules: [
                  {
                    required:
                      !(
                        getFieldValue('itemCategoryName') ||
                        getFieldValue('itemCategoryId') ||
                        getFieldValue('itemName')
                      ) && isEdit,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.supplierQuotaManage.modal.quota.itemCode').d('物料编码'),
                    }),
                  },
                ],
              })(
                isEdit ? (
                  <Lov
                    code="SMDM.CUSTOMER_ITEM_AND_CATEGORY"
                    textValue={headerInfo.itemCode}
                    lovOptions={{ displayField: 'itemCode', valueField: 'itemId' }}
                    queryParams={{ tenantId, categoryId: getFieldValue('itemCategoryId') }}
                    onChange={(_, lovRecord) => {
                      setFieldsValue({
                        itemName: lovRecord.itemName,
                        itemCategoryName: lovRecord.itemCategoryName,
                        itemCategoryId: lovRecord.itemCategoryId,
                        itemCategoryCode: lovRecord.itemCategoryCode,
                      });
                      headerInfo.categoryCode = lovRecord.itemCategoryCode;
                      // 强制校验
                      setTimeout(() => {
                        validateFields(['itemId', 'itemCategoryId'], { force: true });
                      }, 200);
                    }}
                  />
                ) : (
                  <span>{headerInfo.itemCode}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.itemName').d('物料名称')}
            >
              {getFieldDecorator('itemName', {
                initialValue: headerInfo.itemName,
              })(
                isEdit ? (
                  <Input
                    disabled={getFieldValue('itemId')}
                    onChange={() => {
                      // 强制校验
                      setTimeout(() => {
                        validateFields(['itemCategoryId', 'itemId'], { force: true });
                      }, 200);
                    }}
                  />
                ) : (
                  <span>{headerInfo.itemName}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.buyer').d('分管采购员')}
            >
              {getFieldDecorator('buyerId', {
                initialValue: headerInfo.buyerId,
              })(
                updateFlag ? (
                  <Lov
                    code="SPRM.PURCHASE_AGENT"
                    queryParams={{ tenantId }}
                    textValue={headerInfo.buyerName}
                  />
                ) : (
                  <span>{headerInfo.buyerName}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.effective').d('有效周期')}
            >
              {getFieldDecorator('validCycle', {
                initialValue: headerInfo.validCycle,
              })(
                updateFlag ? (
                  <Select
                    allowClear
                    onChange={value => {
                      const effectiveFrom = getFieldValue('effectiveDateFrom');
                      this.handleEffectiveChange(value, effectiveFrom);
                    }}
                  >
                    {effectiveCycle.map(n => (
                      <Option key={n.value}>{n.meaning}</Option>
                    ))}
                  </Select>
                ) : (
                  <span>{headerInfo.validCycleMeaning}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.isValidFrom').d('有效期从')}
            >
              {getFieldDecorator('effectiveDateFrom', {
                rules: [
                  {
                    required: updateFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.supplierQuotaManage.modal.quota.isValidFrom')
                        .d('有效期从'),
                    }),
                  },
                ],
                initialValue: headerInfo.effectiveDateFrom && moment(headerInfo.effectiveDateFrom),
              })(
                updateFlag ? (
                  <DatePicker
                    placeholder=""
                    allowClear={false}
                    style={{ width: '100%' }}
                    disabledDate={currentDate =>
                      getFieldValue('effectiveDateTo') &&
                      moment(getFieldValue('effectiveDateTo')).isBefore(currentDate, 'day')
                    }
                    onChange={value => {
                      const validCycle = getFieldValue('validCycle');
                      this.handleEffectiveChange(validCycle, value);
                    }}
                  />
                ) : (
                  <span>{dateRender(headerInfo.effectiveDateFrom)}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.isValidTo').d('有效期至')}
            >
              {getFieldDecorator('effectiveDateTo', {
                rules: [
                  {
                    required: updateFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.supplierQuotaManage.modal.quota.isValidTo')
                        .d('有效期至'),
                    }),
                  },
                ],
                initialValue: headerInfo.effectiveDateTo && moment(headerInfo.effectiveDateTo),
              })(
                updateFlag ? (
                  <DatePicker
                    placeholder=""
                    allowClear={false}
                    style={{ width: '100%' }}
                    disabled={getFieldValue('validCycle')}
                    disabledDate={currentDate =>
                      getFieldValue('effectiveDateFrom') &&
                      moment(getFieldValue('effectiveDateFrom')).isAfter(currentDate, 'day')
                    }
                  />
                ) : (
                  <span>{dateRender(headerInfo.effectiveDateTo)}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierQuotaManage.modal.quota.controlMethod').d('控制方式')}
            >
              {getFieldDecorator('controlMethod', {
                initialValue: headerInfo.controlMethod,
              })(
                updateFlag ? (
                  <Select allowClear>
                    {controlMethodList.map(n => (
                      <Option key={n.value}>{n.meaning}</Option>
                    ))}
                  </Select>
                ) : (
                  <span>{headerInfo.controlMethodMeaning}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierQuotaManage.modal.quota.numberOfProsecutions')
                .d('起拆量')}
            >
              {getFieldDecorator('numberOfProsecutions', {
                initialValue: headerInfo.numberOfProsecutions,
              })(
                updateFlag ? (
                  <InputNumber style={{ width: '100%' }} />
                ) : (
                  <span>{headerInfo.numberOfProsecutions}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              label={intl.get('sslm.supplierQuotaManage.modal.quota.versionExplain').d('版本说明')}
            >
              {getFieldDecorator('versionDescription', {
                initialValue: headerInfo.versionDescription,
              })(
                isEdit ? (
                  <TextArea style={{ resize: 'none' }} />
                ) : (
                  <span>{headerInfo.versionDescription}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              label={intl
                .get('sslm.supplierQuotaManage.modal.quota.sourceDocType')
                .d('来源单据类型')}
            >
              {getFieldDecorator('sourceDocType', {
                initialValue: headerInfo.sourceDocType,
              })(<span>{headerInfo.sourceDocTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl
                .get('sslm.supplierQuotaManage.modal.quota.sourceNumber')
                .d('来源单据编号')}
            >
              {getFieldDecorator('sourceNumber', {
                initialValue: headerInfo.sourceNumber,
              })(
                <a onClick={() => this.handleJump(headerInfo.sourceDocUrl)}>
                  {headerInfo.sourceNumber}
                </a>
              )}
            </FormItem>
          </Col>
        </Row>
        {remoteNode}
      </Form>
    );
  }
}
