import React, { Component } from 'react';
import { Form, Row, Col, Input } from 'hzero-ui';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { connect } from 'dva';
import moment from 'moment';

import classNames from 'classnames';

@connect(({ claimApproval }) => ({
  claimApproval,
}))
export default class BasicInfoForm extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'claimApproval/init',
    });
  }

  render() {
    const { headerData = {}, customizeForm, form } = this.props;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code: 'SQAM.CLAIM_APPROVAL_DETAIL.BASIC_INFO',
        form,
        dataSource: headerData,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.claimNum`).d('索赔单号')}
              // value={headerData.formNum}
            >
              {getFieldDecorator('formNum', { initialValue: headerData.formNum })(
                <span>{headerData.formNum}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT} style={{ width: '66.6666%' }}>
            <Form.Item
              label={intl.get(`sqam.common.model.formTitle`).d('索赔单标题')}
              // value={headerData.formNum}
            >
              {getFieldDecorator('formTitle', { initialValue: headerData.formTitle })(
                <span>{headerData.formTitle}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`hzero.common.status`).d('状态')}
              // value={headerData.statusCodeMeaning}
            >
              {getFieldDecorator('statusCodeMeaning', {
                initialValue: headerData.statusCodeMeaning,
              })(<span>{headerData.statusCodeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.roles.creator`).d('创建人')}
              // value={headerData.createName}
            >
              {getFieldDecorator('createName', { initialValue: headerData.createName })(
                <span>{headerData.createName}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`hzero.common.date.creation`).d('创建时间')}
              // value={
              //   headerData.creationDate
              //     ? moment(headerData.creationDate).format(DEFAULT_DATETIME_FORMAT)
              //     : null
              // }
            >
              {getFieldDecorator('creationDate', { initialValue: headerData.creationDate })(
                <span>
                  {headerData.creationDate
                    ? moment(headerData.creationDate).format(DEFAULT_DATETIME_FORMAT)
                    : null}
                </span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.company.tag`).d('公司')}
              // value={headerData.companyName}
            >
              {getFieldDecorator('companyName', { initialValue: headerData.companyName })(
                <span>{headerData.companyName}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.business.tag`).d('业务实体')}
              // value={headerData.ouName}
            >
              {getFieldDecorator('ouName', { initialValue: headerData.ouName })(
                <span>{headerData.ouName}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
              // value={headerData.invOrganizationName}
            >
              {getFieldDecorator('invOrganizationName', {
                initialValue: headerData.invOrganizationName,
              })(<span>{headerData.invOrganizationName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`entity.supplier.name`).d('供应商名称')}
              // value={headerData.supplierCompanyName}
            >
              {getFieldDecorator('supplierCompanyName', {
                initialValue: headerData.supplierCompanyName,
              })(<span>{headerData.supplierCompanyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.claimType`).d('索赔类型')}
              // value={headerData.claimTypeName}
            >
              {getFieldDecorator('claimTypeName', { initialValue: headerData.claimTypeName })(
                <span>{headerData.claimTypeName}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.common.purchaseAgent`).d('采购员')}>
              {getFieldDecorator('purchaseAgentName', {
                initialValue: headerData.purchaseAgentName,
              })(<span>{headerData.purchaseAgentName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.common.unitName`).d('部门')}>
              {getFieldDecorator('unitIdMeaning', { initialValue: headerData.unitIdMeaning })(
                <span>{headerData.unitIdMeaning}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`entity.organization.class.purchase`).d('采购组织')}>
              {getFieldDecorator('organizationName', { initialValue: headerData.organizationName })(
                <span>{headerData.organizationName}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.claimState`).d('索赔说明')}>
              {headerData.approvalMethod === 'FUC_AND_EXTERNAL_APPROVE'
                ? getFieldDecorator('claimDesc', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`sqam.common.model.claimState`).d('索赔说明'),
                        }),
                      },
                    ],
                    initialValue: headerData.claimDesc,
                  })(<Input.TextArea rows={2} />)
                : getFieldDecorator('claimDesc', {
                    initialValue: headerData.claimDesc,
                  })(<div>{headerData.claimDesc}</div>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
