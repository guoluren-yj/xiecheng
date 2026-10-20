/**
 * 申请单头部
 * @date: 2018-9-10
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form, Input, Select } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import Lov from 'components/Lov';
import '@/routes/index.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 注册申请单头部
 * @extends {Component} - PureComponent
 * @return React.element
 */
@formatterCollections({ code: 'sslm.investigationReceived' })
export default class RegisterHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  tmplOnOk(record) {
    const { form, setTemplateId = e => e } = this.props;
    const { templateCode, investigateTemplateId } = record;

    form.setFieldsValue({
      investigateTemplateCode: templateCode,
    });
    setTemplateId(investigateTemplateId);
  }

  @Bind()
  companyOnOk(record) {
    const { form } = this.props;
    const { companyNum } = record;

    form.setFieldsValue({
      companyNum,
    });
  }

  @Bind()
  tmplOnClear() {
    const { form, setTemplateId = e => e } = this.props;
    setTemplateId(undefined);
    form.setFieldsValue({
      investigateTemplateCode: undefined,
    });
  }

  @Bind()
  companyOnClear() {
    const { form } = this.props;
    form.setFieldsValue({
      companyNum: undefined,
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      investigateTypes = [],
      registerInfo = {},
      readOnly,
    } = this.props;

    const {
      processStatusMeaning,
      supplierCompanyName, // 供应商名称
      supplierCompanyNum, // 供应商编码
      supplierCompanyRegisterDate, // 供应商注册时间
      remark,
      partnerRemark,
      investgNumber,
      companyId,
      companyNum,
      companyName,
      investigateType,
      investigateTypeMeaning,
      investigateTemplateId,
      investigateTemplateName,
      investigateTemplateCode,
      releaseDate,
      submitDate,
      partnerCompanyNum,
      partnerCompanyName,
      partnerBuildDate,
      createUserName,
      createUserRealName,
      approveDate,
      approveUserName,
      approveLoginName,
      dimensionCode, // 管控维度
    } = registerInfo || {};

    const companyFlag = dimensionCode === 'COMPANY';
    return (
      <div className="ued-edit-form form-wrap">
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.model.investReceived.investgNum`)
                .d('调查表编号')}
            >
              {investgNumber}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.model.investReceived.compName`)
                .d('公司名称')}
            >
              {readOnly
                ? companyName
                : getFieldDecorator('companyId', {
                    rules: [
                      {
                        required: !readOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sslm.investigationReceived.model.investReceived.compName`)
                            .d('公司名称'),
                        }),
                      },
                    ],
                    initialValue: companyId,
                  })(
                    companyFlag ? (
                      <span>{companyName}</span>
                    ) : (
                      <Lov
                        code="SPFM.USER_AUTHORITY_COMPANY"
                        textValue={companyName}
                        onOk={this.companyOnOk}
                        onClear={this.companyOnClear}
                        queryParams={{
                          tenantId: getCurrentOrganizationId(),
                        }}
                      />
                    )
                  )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.model.investReceived.compNum`)
                .d('公司代码')}
            >
              {companyNum}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.model.investReceived.investType`)
                .d('调查表类型')}
            >
              {readOnly
                ? investigateTypeMeaning
                : getFieldDecorator('investigateType', {
                    rules: [
                      {
                        required: !readOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sslm.investigationReceived.model.investReceived.investType`)
                            .d('调查表类型'),
                        }),
                      },
                    ],
                    initialValue: investigateType,
                  })(
                    <Select
                      style={{ width: '100%' }}
                      allowClear
                      onChange={() => setFieldsValue({ investigateTemplateId: undefined })}
                    >
                      {investigateTypes.map(n =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : (
                          undefined
                        )
                      )}
                    </Select>
                  )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.investTempName`)
                .d('调查表模板')}
            >
              {readOnly || !getFieldValue('investigateType') || !getFieldValue('companyId')
                ? investigateTemplateName
                : getFieldDecorator('investigateTemplateId', {
                    rules: [
                      {
                        required:
                          !readOnly ||
                          getFieldValue('investigateType') ||
                          getFieldValue('companyId'),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sslm.investigationReceived.view.message.investTempName`)
                            .d('调查表模板'),
                        }),
                      },
                    ],
                    initialValue: investigateTemplateId,
                  })(
                    <Lov
                      code="SSLM.INVESTIGATE_TEMPLATE_ID"
                      onOk={this.tmplOnOk}
                      onClear={this.tmplOnClear}
                      textValue={investigateTemplateName}
                      queryParams={{
                        investigateType: getFieldValue('investigateType'),
                        companyId: getFieldValue('companyId'),
                      }}
                    />
                  )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.investTempCode`)
                .d('模板代码')}
            >
              {investigateTemplateCode}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
              {processStatusMeaning}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.creator.name').d('创建人')}
            >
              {createUserRealName || createUserName}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.approveLoginName`)
                .d('最后审批人')}
            >
              {approveUserName || approveLoginName}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.partnerCompanyNum`)
                .d('供应商编码')}
            >
              {partnerCompanyNum || supplierCompanyNum}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.partnerCompanyName`)
                .d('供应商名称')}
            >
              {partnerCompanyName || supplierCompanyName}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.partnerBuildDate`)
                .d('注册时间')}
            >
              {dateTimeRender(partnerBuildDate || supplierCompanyRegisterDate)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.investigationReceived.view.message.releaseDate`).d('发布时间')}
            >
              {dateTimeRender(releaseDate)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.investigationReceived.view.message.submitDate`).d('提交时间')}
            >
              {dateTimeRender(submitDate)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.approveDate`)
                .d('最后审批时间')}
            >
              {dateTimeRender(approveDate)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              label={intl.get(`sslm.investigationReceived.view.message.remark`).d('调查说明')}
            >
              {readOnly ? (
                <span style={{ whiteSpace: 'pre-wrap' }}>{remark}</span>
              ) : (
                getFieldDecorator('remark', {
                  initialValue: remark,
                })(<TextArea style={{ resize: 'none' }} />)
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              label={intl
                .get(`sslm.investigationReceived.view.message.partnerRemark`)
                .d('反馈备注')}
            >
              {readOnly ? (
                <span style={{ whiteSpace: 'pre-wrap' }}>{partnerRemark}</span>
              ) : (
                getFieldDecorator('partnerRemark', {
                  initialValue: partnerRemark,
                })(<TextArea style={{ resize: 'none' }} />)
              )}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
