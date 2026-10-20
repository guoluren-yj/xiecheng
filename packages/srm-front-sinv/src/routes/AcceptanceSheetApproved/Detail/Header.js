/**
 * HeaderInfo - 验收单明细审批详情头信息
 * @date: 2019-11-20 11:20:12
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Row, Col, Input, Collapse, Icon, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import {
  DETAIL_DEFAULT_CLASSNAME,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';

import styles from './index.less';

const { TextArea } = Input;
const FormItem = Form.Item;
const { Panel } = Collapse;
/**
 * HeaderInfo - 验收单明细审批详情头信息 - 明细信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class HeaderInfo extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      collapseKeys: ['headerInfo'],
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
    const { approveHeader = {}, form = {}, customizeForm } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const { collapseKeys = [] } = this.state;
    const {
      approvalOpinion,
      acceptListNum, // 验收单号
      companyName,
      supplierCompanyName,
      createByName,
      sourceCodeMeaning,
      acceptListTypeName, // 验收单类型
      title,
      // sourceCode,
      // statusCode,
      acceptDetails, // 验收明细情况
      // acceptorName, // 验收人
      acceptDate, // 验收日期
      acceptorNameList = [], // 验收人
      sourceCode,
      acceptBaseCoding,
    } = approveHeader;

    return (
      <Form className={classnames(DETAIL_DEFAULT_CLASSNAME, styles['detail-form'])}>
        <Row className="approve-header">
          <Col>
            {intl.get(`sinv.deliveryApproved.model.deliveryApproved.approvedRemark`).d('审批意见')}
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item', 'read-half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem>
              {getFieldDecorator('approvalOpinion', {
                initialValue: approvalOpinion,
                rules: [
                  {
                    max: 160,
                    message: intl
                      .get(`hzero.common.validation.max`, { max: 160 })
                      .d(`长度不能超过160个字符`),
                  },
                ],
              })(<TextArea rows={2} />)}
            </FormItem>
          </Col>
        </Row>
        <Collapse
          className="form-collapse"
          defaultActiveKey={['headerInfo']}
          onChange={this.onCollapseChange}
        >
          <Panel
            showArrow={false}
            header={
              <Fragment>
                <h3>{intl.get(`sinv.common.model.common.acceptanceHedaer`).d('验收单头信息')}</h3>
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
            {customizeForm(
              {
                form,
                dataSorce: approveHeader,
                code: 'SINV.ACCEPTANCE_APPROVED_DETAIL.HEADER',
              },
              <Form>
                <Row {...EDIT_FORM_ROW_LAYOUT} className="read-half-row">
                  <Col {...FORM_COL_2_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.acceptListTitle`).d('验收单标题')}
                    >
                      {getFieldDecorator('title', {
                        initialValue: title,
                      })(<span>{title}</span>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.acceptanceNum`).d('验收单号')}
                    >
                      {getFieldDecorator('acceptListNum', {
                        initialValue: acceptListNum,
                      })(<span>{acceptListNum}</span>)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.company`).d('公司')}
                    >
                      {getFieldDecorator('companyId', {
                        initialValue: approveHeader.companyId,
                      })(<span>{companyName}</span>)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`entity.supplier.tag`).d('供应商')}
                    >
                      {getFieldDecorator('supplierCompanyId', {
                        initialValue: approveHeader.supplierCompanyId,
                      })(<span>{supplierCompanyName}</span>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.acceptantType`).d('验收类型')}
                    >
                      {getFieldDecorator('acceptListTypeId', {
                        initialValue: approveHeader.acceptListTypeId,
                      })(<span>{acceptListTypeName}</span>)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl
                        .get(`sinv.common.model.common.acceptanceSourceNum`)
                        .d('验收单据来源')}
                    >
                      {getFieldDecorator('sourceCode', {
                        initialValue: approveHeader.sourceCode,
                      })(<span>{sourceCodeMeaning}</span>)}
                    </FormItem>
                  </Col>
                  {sourceCode !== 'NONE' && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      {sourceCode === 'CONTRACT' ? (
                        <FormItem
                          {...EDIT_FORM_ITEM_LAYOUT}
                          label={intl
                            .get(`sinv.acceptanceSheetCreate.model.criteria`)
                            .d('验收基准')}
                        >
                          {getFieldDecorator('acceptBaseCode', {
                            initialValue: approveHeader.acceptBaseCode,
                          })(<span>{acceptBaseCoding}</span>)}
                        </FormItem>
                      ) : (
                        <FormItem
                          label={intl
                            .get(`sinv.acceptanceSheetCreate.model.criteria`)
                            .d('验收基准')}
                          {...EDIT_FORM_ITEM_LAYOUT}
                        >
                          {getFieldDecorator('acceptBaseCode', {
                            initialValue: approveHeader.acceptBaseCode,
                          })(
                            <span>
                              {intl
                                .get(`sinv.acceptanceSheetCreate.model.orderMaterial`)
                                .d('订单物料行')}
                            </span>
                          )}
                        </FormItem>
                      )}
                    </Col>
                  )}
                </Row>
                <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.acceptanceCreator`).d('验收人')}
                    >
                      {getFieldDecorator('acceptorNameList', {
                        initialValue: acceptorNameList,
                      })(<span>{acceptorNameList.join()}</span>)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.acceptanceDate`).d('验收日期')}
                    >
                      {getFieldDecorator('acceptDate', {
                        initialValue: acceptDate,
                      })(<span>{dateRender(acceptDate)}</span>)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.creator`).d('创建人')}
                    >
                      {getFieldDecorator('createByName', {
                        initialValue: createByName,
                      })(<span>{createByName}</span>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row
                  {...EDIT_FORM_ROW_LAYOUT}
                  className={classnames('read-half-row', 'last-form-item')}
                >
                  <Col {...FORM_COL_2_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl
                        .get(`sinv.common.model.common.acceptanceDeatil`)
                        .d('验收详细情况')}
                    >
                      {getFieldDecorator('acceptDetails', {
                        initialValue: acceptDetails,
                      })(<span>{acceptDetails}</span>)}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            )}
          </Panel>
        </Collapse>
      </Form>
    );
  }
}
