// 基本信息
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import classNames from 'classnames';
import { dateTimeRender } from 'utils/renderer';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';

const prefix = `sqam.common`;

/**
 * 基本信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 */
// @withCustomize({
//   unitCode: ['SQAM.RECEIVED_CLAIM_FORM_DETAIL.BASIC_INFO'],
// })
export default class BasicInfoForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // currentDate: moment(),
      // icaDate: moment().add(1, 'd'),
      // pcaDate: moment().add(14, 'd'),
      // dateFormat: getDateFormat(),
      // timeFormat: getDateTimeFormat(),
    };
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      detail,
      formNum, // 索赔单号
      customizeForm,
      statusCodeMeaning, // 索赔单据状态
      createName, // 创建人
      creationDate, // 创建日期
      companyName, // 公司名字
      ouName, // 业务实体
      invOrganizationName, // 库存组织
      claimTypeName, // 索赔单类型
      // dataSourceCodeMeaning, // 单据来源
      // dataSourceNum, // 来源单据编号
      claimDesc, // 索赔说明
      supplierCompanyName, // 供应商名称
      formTitle,
      purchaseAgentName,
      unitIdMeaning,
    } = this.props;
    const { getFieldDecorator } = form;

    return customizeForm(
      {
        code: 'SQAM.RECEIVED_CLAIM_FORM_DETAIL.BASIC_INFO',
        form,
        dataSource: detail,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`${prefix}.model.claimNum`).d('索赔单号')}
              value={formNum}
            /> */}
            <Form.Item label={intl.get(`${prefix}.model.claimNum`).d('索赔单号')}>
              {getFieldDecorator('formNum')(<span>{formNum}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT} style={{ width: '66.6666%' }}>
            <Form.Item
              label={intl.get(`sqam.common.model.formTitle`).d('索赔单标题')}
              // value={headerData.formNum}
            >
              {getFieldDecorator('formTitle')(<span>{formTitle}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`hzero.common.status`).d('状态')}
              value={statusCodeMeaning}
            /> */}
            <Form.Item label={intl.get(`hzero.common.status`).d('状态')}>
              {getFieldDecorator('statusCodeMeaning')(<span>{statusCodeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`entity.roles.creator`).d('创建人')}
              value={createName}
            /> */}
            <Form.Item label={intl.get(`hzero.common.entity.creator`).d('创建人')}>
              {getFieldDecorator('createName')(<span>{createName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`hzero.common.date.creation`).d('创建时间')}>
              {getFieldDecorator('creationDate')(
                <span>{creationDate && dateTimeRender(creationDate)}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem label={intl.get(`entity.company.tag`).d('公司')} value={companyName} /> */}
            <Form.Item label={intl.get(`entity.company.tag`).d('公司')}>
              {getFieldDecorator('companyName')(<span>{companyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem label={intl.get(`entity.business.tag`).d('业务实体')} value={ouName} /> */}
            <Form.Item label={intl.get(`entity.business.tag`).d('业务实体')}>
              {getFieldDecorator('ouName')(<span>{ouName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
              value={invOrganizationName}
            /> */}
            <Form.Item label={intl.get(`entity.organization.class.inventory`).d('库存组织')}>
              {getFieldDecorator('invOrganizationName')(<span>{invOrganizationName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`entity.supplier.name`).d('供应商名称')}
              value={supplierCompanyName}
            /> */}
            <Form.Item label={intl.get(`entity.supplier.name`).d('供应商名称')}>
              {getFieldDecorator('supplierCompanyName')(<span>{supplierCompanyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`${prefix}.model.claimType`).d('索赔类型')}
              value={claimTypeName}
            /> */}
            <Form.Item label={intl.get(`sqam.common.model.claimType`).d('索赔类型')}>
              {getFieldDecorator('claimTypeName')(<span>{claimTypeName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.common.purchaseAgent`).d('采购员')}>
              {getFieldDecorator('purchaseAgentName')(<span>{purchaseAgentName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item')}>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`${prefix}.model.claimState`).d('索赔说明')}
              value={claimDesc}
            /> */}
            <Form.Item label={intl.get(`sqam.common.model.claimState`).d('索赔说明')}>
              {getFieldDecorator('claimDesc')(<span>{claimDesc}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.common.unitName`).d('部门')}>
              {getFieldDecorator('unitIdMeaning')(<span>{unitIdMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`entity.organization.class.purchase`).d('采购组织')}>
              {getFieldDecorator('organizationName')(<span>{detail.organizationName}</span>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
