import React, { Component, Fragment } from 'react';
import { Row, Col, Collapse, Icon, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';

import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import { DETAIL_DEFAULT_CLASSNAME, FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';

import DisplayFormItem from '../components/DisplayFormItem';
import styles from './index.less';

const { Panel } = Collapse;
@Form.create({ fieldNameProp: null })
export default class HeaderInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['headerInfo'],
      organizationId: getCurrentOrganizationId(),
    };
  }

  /**
   * 送货单明细折叠
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  render() {
    const { header = {}, openOperationRecord } = this.props;
    const {
      deductionsNum,
      companyName,
      ouName,
      supplierCompanyNum,
      supplierCompanyName,
      billingDate,
      accountSubjectNum,
      accountSubjectName,
      debitCreditCodeMeaning,
      amount,
      taxRate,
      taxAmount,
      costDealWayCodeMeaning,
      ticketDeductionFlag,
      remark,
      taxIncludedAmount,
      createByName,
      attachmentUuid,
      supplierDeductionsId,
    } = header;
    const { collapseKeys = [], organizationId } = this.state;
    return (
      <Form className={classnames(DETAIL_DEFAULT_CLASSNAME, styles['detail-form'])}>
        <Collapse
          className="form-collapse"
          defaultActiveKey={['headerInfo']}
          onChange={this.onCollapseChange}
        >
          <Panel
            forceRender
            showArrow={false}
            header={
              <Fragment>
                <h3>{intl.get(`sfin.common.model.common.acceptanceHedaer`).d('扣款单信息')}</h3>
                <a className="expand-button">
                  {collapseKeys.includes('headerInfo')
                    ? intl.get('hzero.common.button.up').d('收起')
                    : intl.get('hzero.common.button.expand').d('展开')}
                  {<Icon type={collapseKeys.includes('headerInfo') ? 'up' : 'down'} />}
                </a>
              </Fragment>
            }
            key="headerInfo"
          >
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.deductionsNum`).d('扣款单号')}
                  value={deductionsNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.companyName`).d('公司名称')}
                  value={companyName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.ouName`).d('业务实体')}
                  value={ouName}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.supplierCompanyNum`).d('供应商编码')}
                  value={supplierCompanyNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.supplierCompanyName`).d('供应商名称')}
                  value={supplierCompanyName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.acceptanceSheetCreate.model.billingDate`).d('记账日期')}
                  value={dateRender(billingDate)}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.accountSubjectNum`).d('总账科目编码')}
                  value={accountSubjectNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.accountSubjectName`).d('总账科目名称')}
                  value={accountSubjectName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.debitCreditCodeMeaning`).d('借贷方')}
                  value={debitCreditCodeMeaning}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.amount`).d('不含税扣款额')}
                  value={amount}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.taxRate`).d('税率(%)')}
                  value={taxRate}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.taxAmount`).d('税额')}
                  value={taxAmount}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl
                    .get(`sfin.common.model.common.costDealWayCodeMeaning`)
                    .d('费用处理方式')}
                  value={costDealWayCodeMeaning}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.ticketDeductionFlag`).d('是否票扣')}
                  value={yesOrNoRender(ticketDeductionFlag)}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.deductionRemark`).d('扣款说明')}
                  value={remark}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.taxIncludedAmount`).d('含税扣款额')}
                  value={taxIncludedAmount}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.remark`).d('备注')}
                  value={remark}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.createByName`).d('创建人')}
                  value={createByName}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.attachmentUuid`).d('附件')}
                  value={
                    <Upload
                      filePreview
                      bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                      bucketDirectory="sfin-workfollow-aprroval"
                      attachmentUUID={attachmentUuid}
                      tenantId={organizationId}
                      viewOnly
                      icon="download"
                    />
                  }
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.common.model.common.history`).d('操作记录')}
                  value={
                    <a onClick={() => openOperationRecord(supplierDeductionsId)}>
                      {intl.get(`sfin.common.model.common.history`).d('操作记录')}
                    </a>
                  }
                />
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </Form>
    );
  }
}
