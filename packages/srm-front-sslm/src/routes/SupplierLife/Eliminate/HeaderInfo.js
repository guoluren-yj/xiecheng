/**
 * 申请单头部
 * @date: 2018-10-22
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.3
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Input, Form, DatePicker } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import Checkbox from 'components/Checkbox';
import { yesOrNoRender, dateRender, dateTimeRender } from 'utils/renderer';

import '@/routes/index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 申请单头部
 * @extends {Component} - PureComponent
 * @reactProps {Object} headerInfo - 头信息对象
 * @return React.element
 */
@formatterCollections({ code: ['sslm.commonApplication'] })
export default class HeaderInfo extends PureComponent {
  @Bind()
  handleSetFormNull() {
    const {
      form: { getFieldValue, setFieldsValue },
    } = this.props;
    if (getFieldValue('blacklistFlag')) {
      setFieldsValue({ foreverBlacklistFlag: '', blacklistExpiryDate: null });
    }
  }

  render() {
    const {
      isEdit,
      form,
      form: { getFieldDecorator, getFieldValue },
      headerInfo = {},
      customizeForm,
      custLoading,
      dataSourceKey,
      pubEditFlag = false,
    } = this.props;

    // 判断是否为降级阶段
    let isEliminated = false;
    if (headerInfo.toStageCode) {
      isEliminated = headerInfo.toStageCode !== 'ELIMINATED';
    } else if (headerInfo.targetStageCode) {
      isEliminated = headerInfo.targetStageCode !== 'ELIMINATED';
    }
    let isForeverBlack = false;
    let isBlackDate = false;
    if (isEliminated) {
      isForeverBlack = true;
      isBlackDate = true;
    } else if (getFieldValue('foreverBlacklistFlag')) {
      isBlackDate = !!getFieldValue('foreverBlacklistFlag');
    } else if (getFieldValue('blacklistExpiryDate')) {
      isForeverBlack = !!getFieldValue('blacklistExpiryDate');
    } else {
      isForeverBlack = !getFieldValue('blacklistFlag');
      isBlackDate = !getFieldValue('blacklistFlag');
    }

    const headerData = {
      ...headerInfo,
      // 给个性化二开tab这种的需求取禁用标识
      headerReadOnlyFlag: !(isEdit || pubEditFlag),
    };

    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_HEADER',
        form,
        dataSource: headerData,
        readOnly: !(isEdit || pubEditFlag),
        dataSourceKey,
        transformDataSource: (field, fieldValue) => {
          if (field && field === 'blacklistExpiryDate') {
            return fieldValue ? moment(fieldValue, DEFAULT_DATE_FORMAT) : null;
          }
          return fieldValue;
        },
      },
      <Form className="ued-edit-form flex-form-warp form-wrap" custLoading={custLoading}>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.applicationNumber').d('申请单号')}
            >
              {getFieldDecorator('degradeNumber', {
                initialValue: headerInfo.degradeNumber,
              })(<span>{headerInfo.degradeNumber}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.supplier.code').d('供应商编码')}
            >
              {getFieldDecorator('supplierCompanyNum', {
                initialValue: headerInfo.supplierCompanyNum,
              })(<span>{headerInfo.supplierCompanyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.supplier.name').d('供应商名称')}
            >
              {getFieldDecorator('supplierCompanyName', {
                initialValue: headerInfo.supplierCompanyName,
              })(<span>{headerInfo.supplierCompanyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.commonApplication.model.coApp.stageDescription`).d('当前阶段')}
            >
              {getFieldDecorator('stageDescription', {
                initialValue: headerInfo.stageDescription,
              })(<span>{headerInfo.stageDescription}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.creationDate').d('创建时间')}
            >
              {getFieldDecorator('creationDate', {
                initialValue: headerInfo.creationDate,
              })(<span>{dateTimeRender(headerInfo.creationDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.creator.name').d('创建人')}
            >
              {getFieldDecorator('realName', {
                initialValue: headerInfo.realName,
              })(<span>{headerInfo.realName || headerInfo.loginName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.commonApplication.model.coApp.targetStageDescription')
                .d('目标阶段')}
            >
              {getFieldDecorator('toStageDescription', {
                initialValue: headerInfo.toStageDescription || headerInfo.targetStageDescription,
              })(
                <span> {headerInfo.toStageDescription || headerInfo.targetStageDescription}</span>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.companyNum').d('公司编码')}
            >
              {getFieldDecorator('companyNum', {
                initialValue: headerInfo.companyNum,
              })(<span>{headerInfo.companyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.companyName').d('公司名称')}
            >
              {getFieldDecorator('companyName', {
                initialValue: headerInfo.companyName,
              })(<span>{headerInfo.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.commonApplication.model.coApp.degradeTypeMeaning')
                .d('操作类型')}
            >
              {getFieldDecorator('degradeType', {
                initialValue: headerInfo.degradeType,
              })(<span>{headerInfo.degradeTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.blacklistFlag').d('加入黑名单')}
            >
              {getFieldDecorator('blacklistFlag', {
                initialValue: headerInfo.blacklistFlag,
              })(
                isEliminated || !isEdit ? (
                  yesOrNoRender(headerInfo.blacklistFlag)
                ) : (
                  <Checkbox onChange={this.handleSetFormNull} />
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.commonApplication.model.coApp.foreverBlacklistFlag')
                .d('永久黑名单')}
              extra={intl
                .get('sslm.commonApplication.model.coApp.blacklistTips')
                .d('勾选后，此供应商将永久进入黑名单，并不能升级至其他生命周期阶段')}
            >
              {getFieldDecorator('foreverBlacklistFlag', {
                initialValue: headerInfo.foreverBlacklistFlag,
              })(
                !isEdit ? (
                  yesOrNoRender(headerInfo.foreverBlacklistFlag)
                ) : (
                  <Checkbox disabled={isForeverBlack} />
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
              {getFieldDecorator('processStatus', {
                initialValue: headerInfo.processStatus,
              })(<span>{headerInfo.processStatusMeaning}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.commonApplication.model.coApp.blacklistExpiryDate')
                .d('黑名单失效时间')}
            >
              {getFieldDecorator('blacklistExpiryDate', {
                initialValue: headerInfo.blacklistExpiryDate
                  ? moment(headerInfo.blacklistExpiryDate, DEFAULT_DATE_FORMAT)
                  : null,
              })(
                !isEdit ? (
                  <span>{dateRender(headerInfo.blacklistExpiryDate)}</span>
                ) : (
                  <DatePicker
                    placeholder=""
                    style={{ width: '100%' }}
                    // showTime
                    disabled={isBlackDate}
                    format={DEFAULT_DATE_FORMAT}
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.supplier.authorized').d('特准供应商')}
            >
              {getFieldDecorator('authorizeFlag', {
                initialValue: headerInfo.authorizeFlag || 0,
              })(isEdit ? <Checkbox /> : yesOrNoRender(headerInfo.authorizeFlag))}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.supplier.triggerEvent').d('触发事件')}
            >
              {getFieldDecorator('triggerEvent', {
                initialValue: headerInfo.triggerEvent,
              })(<span>{headerInfo.triggerEventMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.eliminate.remark').d('说明')}
            >
              {getFieldDecorator('remark', {
                rules: [
                  {
                    required: isEdit,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.commonApplication.model.eliminate.remark').d('说明'),
                    }),
                  },
                ],
                initialValue: headerInfo.remark,
              })(
                isEdit ? (
                  <TextArea style={{ resize: 'none' }} />
                ) : (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{headerInfo.remark}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
