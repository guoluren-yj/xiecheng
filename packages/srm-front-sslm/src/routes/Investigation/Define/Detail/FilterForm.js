/*
 * FilterForm - 调查表明细维护页面
 * @date: 2018/08/07 14:57:58
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Input, Form, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import '@/routes/index.less';
import Investigation from '../../Component/Investigation';

const organizationId = getCurrentOrganizationId();

/**
 * 调查表明细维护页面表单
 * @extends {Component} - React.Component
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
 * @reactProps {Function} disabledEndDate  禁选时间
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */

const { TextArea } = Input;
const { Item: FormItem } = Form;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@withCustomize({
  unitCode: ['SSLM.INVESTIGATION_CREATE_DETAIL.HEADER_TEMPORARY'],
})
@formatterCollections({
  code: ['sslm.investDetailMaintain', 'sslm.common', 'sslm.investigCorrelat'],
})
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      investigateTemplateId: props.investigateTemplateId,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = { ...prevState };
    const { investigateTemplateId } = nextProps;
    if (investigateTemplateId !== prevState.investigateTemplateId) {
      nextState.investigateTemplateId = investigateTemplateId;
    }
    return nextState;
  }

  /**
   * 获取类型(调查表类型、调查说明)
   * @param {String} field
   * @param {Object} value
   * @memberof FilterForm
   */
  @Bind()
  changeModuleDetail(field, value) {
    const { onChangeModuleDetail } = this.props;
    if (onChangeModuleDetail) {
      onChangeModuleDetail(field, value);
    }
  }

  /**
   * 调查表类型
   * @param {String} value
   * @param {Object} record
   * @memberof FilterForm
   */
  @Bind()
  onChangeInvestigation(value, record) {
    this.setState({ investigateTemplateId: value });
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({
      investigateTemplateName: record.templateName,
    });
  }

  /**
   * 渲染查询条件
   */
  @Bind()
  renderForm() {
    const {
      processStatusList = [],
      detail,
      investgHeaderId,
      form: { getFieldDecorator },
      customizeForm,
      custLoading,
    } = this.props;
    const { investigateTemplateId } = this.state;
    const statusItem = processStatusList.find(item => item.value === detail.processStatus);
    // const investigateLevel = processStatusList.find(
    //   (item) => item.value === detail.investigateLevel
    // );
    getFieldDecorator('investigateTemplateName', {
      initialValue: detail.investigateTemplateName,
    });
    return (
      <div>
        {customizeForm(
          {
            code: 'SSLM.INVESTIGATION_CREATE_DETAIL.HEADER_TEMPORARY',
            form: this.props.form,
            dataSource: detail,
          },
          <Form className="ued-edit-form form-wrap" custLoading={custLoading}>
            <Row className="writable-row" gutter={48}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.common.model.investiagte.code').d('调查表编号')}
                >
                  {getFieldDecorator('investgNumber', {
                    initialValue: detail.investgNumber,
                  })(<span>{detail.investgNumber}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.common.model.investigate.level').d('调查表管控维度')}
                >
                  {getFieldDecorator('investigateLevel', {
                    initialValue: detail.investigateLevel,
                  })(<span>{detail.investigateLevelMeaning || detail.investigateLevel}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.company.code`).d('公司编码')}
                >
                  {getFieldDecorator('companyNum', {
                    initialValue: detail.companyNum,
                  })(<span>{detail.companyNum}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row className="writable-row" gutter={48}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.company.companyName`).d('公司名称')}
                >
                  {getFieldDecorator('companyName', {
                    initialValue: detail.companyName,
                  })(<span>{detail.companyName}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.common.model.investigate.type').d('调查表类型')}
                >
                  {getFieldDecorator('investigateType', {
                    initialValue: detail.investigateType,
                  })(<span>{detail.investigateTypeMeaning}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.common.model.investigate.template.code`)
                    .d('调查表模板代码')}
                >
                  {getFieldDecorator('investigateTemplateCode', {
                    initialValue: detail.investigateTemplateCode,
                  })(<span>{detail.investigateTemplateCode}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row className="writable-row" gutter={48}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.common.model.investigate.template').d('调查表模板')}
                >
                  {getFieldDecorator('investigateTemplateId', {
                    initialValue: detail.investigateTemplateId,
                  })(<span>{detail.investigateTemplateName}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.status`).d('调查表状态')}
                >
                  {getFieldDecorator('processStatusMeaning', {
                    initialValue:
                      detail.processStatusMeaning ||
                      (statusItem && statusItem.meaning) ||
                      detail.processStatus,
                  })(
                    <span>
                      {detail.processStatusMeaning ||
                        (statusItem && statusItem.meaning) ||
                        detail.processStatus}
                    </span>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.creator.name`).d('创建人')}
                >
                  {getFieldDecorator('createUserName', {
                    initialValue: detail.createUserRealName,
                  })(<span>{detail.createUserRealName}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row className="writable-row" gutter={48}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.common.view.creator.unitName').d('创建人部门')}
                >
                  {getFieldDecorator('unitName', {
                    initialValue: detail.unitName,
                  })(<span>{detail.unitName}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`sslm.common.view.supplier.code`).d('供应商编码')}>
                  {getFieldDecorator('partnerCompanyNum', {
                    initialValue: detail.partnerCompanyNum,
                  })(<span>{detail.partnerCompanyNum}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`sslm.common.view.supplier.name`).d('供应商名称')}>
                  {getFieldDecorator('supplierZhOrEnCompanyNum', {
                    initialValue: detail.supplierZhOrEnCompanyNum,
                  })(<span>{detail.supplierZhOrEnCompanyNum}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row className="writable-row" gutter={48}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`sslm.investigCorrelat.view.message.partnerBuildDate`)
                    .d('注册时间')}
                >
                  {getFieldDecorator('partnerBuildDate', {
                    initialValue: detail.partnerBuildDate,
                  })(<span>{dateTimeRender(detail.partnerBuildDate)}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="half-row">
              <Col span={24}>
                <FormItem
                  label={intl.get(`sslm.investigCorrelat.view.message.remark`).d('调查说明')}
                >
                  {getFieldDecorator('remark', {
                    initialValue: detail.remark,
                  })(<TextArea rows={4} />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="half-row">
              <Col span={24}>
                <FormItem
                  label={intl.get(`sslm.investigCorrelat.view.message.partnerRemark`).d('反馈备注')}
                >
                  {getFieldDecorator('partnerRemark', {
                    initialValue: detail.partnerRemark,
                  })(<span>{detail.partnerRemark}</span>)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        <Investigation
          investigateTemplateId={investigateTemplateId}
          investgHeaderId={investgHeaderId}
          organizationId={organizationId}
          key={investigateTemplateId}
        />
      </div>
    );
  }

  render() {
    return <div className="table-list-search">{this.renderForm()}</div>;
  }
}
