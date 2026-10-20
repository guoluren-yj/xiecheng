import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

export default class BasicBusinessInfo extends Component {
  render() {
    const {
      customizeForm,
      form,
      form: { getFieldDecorator },
      business,
    } = this.props;
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL.BUSINESS',
        form,
        dataSource: business,
        readOnly: true,
      },
      <Form className="ued-edit-form ued-common-form" id="basicBusinessInfo">
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierDetail.model.companyInfo.businessNature').d('经营性质')}
            >
              {getFieldDecorator('businessNature')(
                <div>
                  {business &&
                    business.manufacturerFlag === 1 &&
                    intl.get('sslm.supplierDetail.model.companyInfo.manufacturerFlag').d('制造商')}
                  &nbsp;
                  {business &&
                    business.traderFlag === 1 &&
                    intl.get('sslm.supplierDetail.model.companyInfo.traderFlag').d('贸易商')}
                  &nbsp;
                  {business &&
                    business.servicerFlag === 1 &&
                    intl.get('sslm.supplierDetail.model.companyInfo.servicerFlag').d('服务商')}
                  &nbsp;
                  {business &&
                    business.agentFlag === 1 &&
                    intl.get('sslm.supplierDetail.model.companyInfo.agentFlag').d('代理商')}
                  &nbsp;
                  {business &&
                    business.integrationFlag === 1 &&
                    intl.get('sslm.enterpriseInform.view.model.business.integration').d('集成商')}
                  &nbsp;
                  {business &&
                    business.contractorFlag === 1 &&
                    intl.get('sslm.enterpriseInform.view.model.business.contractor').d('承包商')}
                  &nbsp;
                  {business &&
                    business.dealerFlag === 1 &&
                    intl.get('sslm.enterpriseInform.view.model.business.dealer').d('经销商')}
                </div>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierDetail.model.companyInfo.industryName').d('行业类型')}
            >
              {getFieldDecorator('industryName')(
                <div>
                  {business &&
                    business.industryList &&
                    business.industryList.map(list => {
                      return (
                        <span key={list.industryId} className="words-space">
                          {list.industryName}
                        </span>
                      );
                    })}
                </div>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierDetail.model.companyInfo.categoryName').d('主营品类')}
            >
              {getFieldDecorator('categoryName')(
                <div>
                  {business &&
                    business.industryCategoryList &&
                    business.industryCategoryList.map(list => {
                      return (
                        <span key={list.categoryId} className="words-space">
                          {list.categoryName}
                        </span>
                      );
                    })}
                </div>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.business.serviceAreaReqList')
                .d('送货服务范围')}
            >
              {getFieldDecorator('serviceArea')(
                <div>
                  {business &&
                    business.serviceAreaList &&
                    business.serviceAreaList.map(list => {
                      return (
                        <span key={list.serviceAreaId} className="words-space">
                          {list.serviceAreaMeaning}
                        </span>
                      );
                    })}
                </div>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="all-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.company.site').d('公司官网')}
            >
              {getFieldDecorator('website')(
                <a href={business && business.website}>{business && business.website}</a>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="all-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.company.introduction').d('公司简介')}
            >
              {getFieldDecorator('description')(<div>{business && business.description}</div>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
