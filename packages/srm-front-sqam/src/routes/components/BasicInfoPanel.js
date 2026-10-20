/* eslint-disable react/jsx-indent */
/**
 * basicInfoPanel - 基本信息
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { isFunction } from 'lodash';
import { Form, Row, Col, Tooltip, Input } from 'hzero-ui';
// import moment from 'moment';
import { withRouter } from 'react-router-dom';
// import { getTimeZone } from 'utils/utils';
import { dateRender, dateTimeRender } from 'utils/renderer';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import classNames from 'classnames';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_3_LAYOUT,
} from 'utils/constants';
import styles from '../Create8D/Detail/index.less';
import rejectImg from '@/assets/problem_approve_reject.svg';
import { thousandBitSeparator } from '@/routes/utils.js';

const FormItem = Form.Item;
// const { labelCol, wrapperCol } = EDIT_FORM_ITEM_LAYOUT;
const prefix = `sqam.common.model.qualityRectification`;
const LABEL_WRAPPER_1_5 = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};
const rejProblemStatus = ['NEW', 'ICA_SUBMITTED', 'PCA_SUBMITTED', 'COMPLETED', 'VALIDATED'];
const rejApprovalProblemStatus = [
  'PUBULISH APPROVAE REJECT',
  'CANCEL FINISH APPROVAL REJECT',
  'TRACK APPROVAL REJECT',
];
const rejICAorPCA = ['ICA_REJECTED', 'PCA_REJECTED'];

/**
 * 基本信息Panel
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */

@withRouter
@Form.create({ fieldNameProp: null })
// @withCustomize({
//   unitCode: ['SQAM.FEEDBACK_8D_DETAIL.BASIC'],
// })
export default class basicInfoPanel extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this, 'basicInfo');
    }
    this.state = {
      // dateFormat: getDateFormat(),
      // timeFormat: getDateTimeFormat(),
    };
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    // const { dateFormat } = this.state;
    const {
      form,
      basicInfo,
      customizeForm,
      loading = false,
      isSupplier = false,
      code,
      remoteProps,
      exposeCode,
      editFlag,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form || {};
    // const pcaDate = moment(serverTime).utcOffset(timeZone2MomentUTC[getTimeZone()]).add(14, 'd');
    return customizeForm(
      {
        code,
        form,
        dataSource: basicInfo,
        dataSourceLoading: loading,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('read-row', styles['row-1-2'])}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${prefix}.code`).d('整改报告编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('problemNum', {
                initialValue: basicInfo.problemNum,
              })(<span>{basicInfo.problemNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_3_LAYOUT}>
            <FormItem label={intl.get(`${prefix}.title`).d('整改报告标题')} {...LABEL_WRAPPER_1_5}>
              {getFieldDecorator('problemTitle', {
                initialValue: basicInfo.problemTitle,
              })(<span>{basicInfo.problemTitle}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${prefix}.status`).d('状态')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('problemStatusMeaning')(
                <div>
                  {basicInfo.problemStatusMeaning}
                  {!isSupplier &&
                  rejProblemStatus.includes(basicInfo.problemStatus) &&
                  rejApprovalProblemStatus.includes(basicInfo.approvalProblemStatus) ? (
                    <Tooltip title={basicInfo.approvalProblemStatusMeaning}>
                      <img style={{ marginLeft: 5 }} src={rejectImg} alt="img" />
                    </Tooltip>
                  ) : isSupplier &&
                    rejICAorPCA.includes(basicInfo.approvalActionCode) &&
                    rejICAorPCA.includes(basicInfo.problemStatus) ? (
                    <Tooltip title={basicInfo.approvedRemark}>
                      <img style={{ marginLeft: 5 }} src={rejectImg} alt="img" />
                    </Tooltip>
                  ) : null}
                </div>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.roles.creator`).d('创建人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('createdName', {
                initialValue: basicInfo.createdName,
              })(<span>{basicInfo.createdName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`hzero.common.date.creation`).d('创建日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate', {
                initialValue: basicInfo.creationDate,
              })(<span>{dateTimeRender(basicInfo.creationDate)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.company.tag`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName', {
                initialValue: basicInfo.companyName,
              })(<span>{basicInfo.companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.business.tag`).d('业务实体')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('ouName', {
                initialValue: basicInfo.ouName,
              })(<span>{basicInfo.ouName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('invOrganizationName', {
                initialValue: basicInfo.invOrganizationName,
              })(<span>{basicInfo.invOrganizationName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.supplier.tag`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('supplierName', {
                initialValue: basicInfo.supplierName,
              })(<span>{basicInfo.supplierName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.item.code`).d('物料编码')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('itemCode', {
                initialValue: basicInfo.itemCode,
              })(<span>{basicInfo.itemCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.item.name`).d('物料名称')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('itemName', {
                initialValue: basicInfo.itemName,
              })(<span>{basicInfo.itemName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${prefix}.dataSource`).d('创建方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceCode', {
                initialValue: basicInfo.sourceCode,
              })(<span>{basicInfo.sourceCodeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${prefix}.open.date`).d('开放天数')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('openDays', {
                initialValue: basicInfo.openDays,
              })(<span>{basicInfo.openDays}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${prefix}.icaDemandDate`).d('ICA要求时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('icaDemandDate', {
                initialValue: basicInfo.icaDemandDate,
              })(<span>{dateTimeRender(basicInfo.icaDemandDate)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={`${intl.get(`${prefix}.icaDelayDays`).d('ICA累计延期')}/${intl
                .get(`hzero.common.date.unit.day`)
                .d('天')}`}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('icaDelayDays', {
                initialValue: basicInfo.icaDelayDays,
              })(
                <span style={{ color: 'red' }}>
                  {thousandBitSeparator(Number(basicInfo.icaDelayDays))}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${prefix}.pcaDemandDate`).d('PCA要求日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pcaDemandDate', {
                initialValue: basicInfo.pcaDemandDate,
              })(<span>{dateRender(basicInfo.pcaDemandDate)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={`${intl.get(`${prefix}.pcaDelayDays`).d('PCA累计延期')}/${intl
                .get(`hzero.common.date.unit.day`)
                .d('天')}`}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pcaDelayDays', {
                initialValue: basicInfo.pcaDelayDays,
              })(
                <span style={{ color: 'red' }}>
                  {thousandBitSeparator(Number(basicInfo.pcaDelayDays))}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.publishedName`).d('发布人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('publishedBy', {
                initialValue: basicInfo.publishedBy,
              })(<span>{basicInfo.publishedName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.specifications`).d('规格')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('specifications', {
                initialValue: basicInfo.specifications,
              })(<span>{basicInfo.specifications}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.model`).d('型号')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('model', {
                initialValue: basicInfo.model,
              })(<span>{basicInfo.model}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.unitName`).d('所属部门')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('unitId', {
                initialValue: basicInfo.unitId,
              })(<span>{basicInfo.unitName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`entity.organization.class.purchase`).d('采购组织')}>
              {getFieldDecorator('purOrganizationName', {
                initialValue: basicInfo.purOrganizationName,
              })(<span>{basicInfo.purOrganizationName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.common.purchaseAgent`).d('采购员')}>
              {getFieldDecorator('purAgentName', {
                initialValue: basicInfo.purAgentName,
              })(<span>{basicInfo.purAgentName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row half-row last-form-item">
          <Col span={24}>
            <FormItem label={intl.get(`${prefix}.remark`).d('备注')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('remark', {
                initialValue: basicInfo.remark,
              })(
                editFlag ? (
                  <Input.TextArea rows={2} style={{ height: '56px' }} />
                ) : (
                  <span>{basicInfo.remark}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row half-row last-form-item">
          <Col span={24}>
            <FormItem
              label={intl.get(`sqam.common.incomingInspectionQuery.auditOpinion`).d('审核意见')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('approvedRemark', {
                initialValue: basicInfo.approvedRemark,
              })(<span>{basicInfo.approvedRemark}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {exposeCode &&
              remoteProps &&
              remoteProps.process(exposeCode, '', {
                basicInfo,
                form,
              })}
          </Col>
        </Row>
      </Form>
    );
  }
}
