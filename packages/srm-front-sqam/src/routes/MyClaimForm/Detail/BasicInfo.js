// 基本信息
import React, { PureComponent } from 'react';
import { Form, Row, Col, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import classNames from 'classnames';
import { dateRender, dateTimeRender } from 'utils/renderer';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import rejectImg from '@/assets/problem_approve_reject.svg';

const prefix = `sqam.common`;

/**
 * 基本信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 */
// @withCustomize({
//   unitCode: ['SQAM.CLAIM_FORM_DETAIL.BASIC_INFO'],
// })
export default class BasicInfoForm extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      formNum, // 索赔单号
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
      supplierCompanyName,
      customizeForm,
      form,
      formTitle,
      purchaseAgentName,
      detail,
      unitIdMeaning,
    } = this.props;
    const { getFieldDecorator } = form;
    const {
      chargeSyncStatusMeaning,
      chargeSyncBy,
      chargeSyncDate,
      chargeSyncResponseMsg,
      ouCode,
    } = detail;
    return customizeForm(
      {
        code: 'SQAM.CLAIM_FORM_DETAIL.BASIC_INFO',
        form,
        dataSource: detail,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.claimNum`).d('索赔单号')}
            >
              {getFieldDecorator('formNum')(<span>{formNum}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT} style={{ width: '66.6666%' }}>
            <Form.Item
              label={intl.get(`sqam.common.model.formTitle`).d('索赔单标题')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('formTitle')(<span>{formTitle}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item {...EDIT_FORM_ITEM_LAYOUT} label={intl.get(`hzero.common.status`).d('状态')}>
              {getFieldDecorator('statusCodeMeaning')(
                <>
                  <span>{statusCodeMeaning}</span>
                  <span>
                    {detail.statusCode === 'REJECTED' && (
                      <Tooltip
                        title={
                          <div>
                            {intl
                              .get(`sqam.common.view.message.approvalRefusedMessage`)
                              .d('审批拒绝: 详见审批记录列表')}
                          </div>
                        }
                      >
                        <img style={{ marginLeft: 5 }} src={rejectImg} alt="img" />
                      </Tooltip>
                    )}
                  </span>
                </>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`hzero.common.entity.creator`).d('创建人')}
            >
              {getFieldDecorator('createName')(<span>{createName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`hzero.common.date.creation`).d('创建时间')}
            >
              {getFieldDecorator('creationDate')(
                <span>{creationDate && dateTimeRender(creationDate)}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item {...EDIT_FORM_ITEM_LAYOUT} label={intl.get(`entity.company.tag`).d('公司')}>
              {getFieldDecorator('companyName')(<span>{companyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.business.tag`).d('业务实体')}
            >
              {getFieldDecorator('ouName')(<span>{ouName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
            >
              {getFieldDecorator('invOrganizationName')(<span>{invOrganizationName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.supplier.name`).d('供应商名称')}
            >
              {getFieldDecorator('supplierCompanyName')(<span>{supplierCompanyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sqam.common.model.claimType`).d('索赔类型')}
            >
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
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sqam.common.model.claimState`).d('索赔说明')}
            >
              {getFieldDecorator('claimDesc')(<span>{claimDesc}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.common.unitName`).d('部门')}>
              {getFieldDecorator('unitIdMeaning')(<span>{unitIdMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`sqam.common.model.common.chargeSyncStatusMeaning`)
                .d('费用单同步状态')}
            >
              {getFieldDecorator('chargeSyncStatusMeaning')(<span>{chargeSyncStatusMeaning}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sqam.common.model.common.chargeSyncBy`).d('费用单同步用户')}
            >
              {getFieldDecorator('chargeSyncBy')(<span>{chargeSyncBy}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.common.chargeSyncDate`).d('费用单同步日期')}
            >
              {getFieldDecorator('chargeSyncDate')(<span>{dateRender(chargeSyncDate)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`sqam.common.model.common.chargeSyncResponseMsg`)
                .d('费用单同步反馈信息')}
            >
              {getFieldDecorator('chargeSyncResponseMsg')(<span>{chargeSyncResponseMsg}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sqam.common.model.common.ouCode`).d('业务实体编码')}
            >
              {getFieldDecorator('ouCode')(<span>{ouCode}</span>)}
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
