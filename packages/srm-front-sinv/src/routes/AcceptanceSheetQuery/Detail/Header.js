/**
 * HeaderInfo - 验收单明细审批详情头信息
 * @date: 2019-11-20 11:20:12
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Row, Col, Collapse, Icon, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import { isArray } from 'lodash';

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

const { Panel } = Collapse;
const FormItem = Form.Item;
/**
 * HeaderInfo - 验收单明细详情头信息 - 明细信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class HeaderInfo extends Component {
  constructor(props) {
    super(props);
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
    const { header = {}, form, customizeForm } = this.props;
    const { collapseKeys = [] } = this.state;
    const { getFieldDecorator } = form;
    const {
      acceptListNum,
      acceptListTypeName,
      supplierCompanyName,
      companyName,
      sourceCodeMeaning,
      createByName,
      // acceptorName,
      acceptorNameList,
      acceptDate,
      acceptDetails,
      acceptBaseCoding,
      sourceCode,
      title,
    } = header;
    const personName = isArray(acceptorNameList) ? acceptorNameList.join() : acceptorNameList;
    return (
      <Form className={classnames(DETAIL_DEFAULT_CLASSNAME, styles['detail-form'])}>
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
                dataSource: header,
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
                        initialValue: header.companyId,
                      })(<span>{companyName}</span>)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`entity.supplier.tag`).d('供应商')}
                    >
                      {getFieldDecorator('supplierCompanyId', {
                        initialValue: header.supplierCompanyId,
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
                        initialValue: header.acceptListTypeId,
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
                        initialValue: header.sourceCode,
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
                            initialValue: header.acceptBaseCode,
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
                            initialValue: header.acceptBaseCode,
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
                      })(<span>{personName}</span>)}
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
