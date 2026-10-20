/**
 * SectionDetailModal - 招标大厅-新增或修改标段明细页面
 * @date: 2019 9/12
 * @author: jing.chen05@hand-china.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Button, Row, Col, Input, Spin, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import moment from 'moment';
import Lov from 'components/Lov';
import { EDIT_FORM_ITEM_LAYOUT, DATETIME_MIN } from 'utils/constants';

import common from '@/routes/ssrc/common.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class SectionDetailModal extends PureComponent {
  state = {};

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, dataSource = {}, onSave } = this.props;
    // 判断业务实体，库存组织有没有改变
    let flag = false;
    if (onSave) {
      form.validateFields((err, values) => {
        if (
          dataSource.ouId !== values.ouId ||
          dataSource.invOrganizationId !== values.invOrganizationId
        ) {
          flag = true;
        }
        if (!err) {
          // 校验通过，进行保存操作
          onSave({
            ...dataSource,
            ...values,
            demandDate: values.demandDate ? values.demandDate.format(DATETIME_MIN) : undefined,
            flag,
          });
        }
      });
    }
  }

  /**
   * 改变业务实体 - 清空库存组织
   */
  @Bind()
  changeOuId(val, dataList) {
    const { form } = this.props;
    if (!val) {
      form.setFieldsValue({
        oumId: undefined,
        oumName: undefined,
        ouCode: undefined,
        invOrganizationName: undefined,
        invOrganizationId: undefined,
      });
      return;
    }
    form.setFieldsValue({
      oumId: dataList.ouId,
      oumName: dataList.ouName,
      ouCode: dataList.ouCode,
      invOrganizationName: dataList.organizationName,
      invOrganizationId: dataList.organizationId,
    });
  }

  /**
   * 改变库存组织 - 清空物料编码-物品描述
   */
  @Bind()
  changeInvOrganization(val, dataList) {
    const { form } = this.props;
    if (!val) {
      return;
    }
    form.setFieldsValue({
      invOrganizationName: dataList.organizationName,
      invOrganizationId: dataList.organizationId,
    });
  }

  /**
   * 标段信息表单渲染
   */
  renderSectionForm() {
    const { dataSource = {}, form, organizationId } = this.props;
    const { getFieldDecorator = (e) => e, getFieldValue } = form;
    return (
      <Form>
        <div>
          <Row gutter={64} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
            <Col span={12}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`ssrc.bidHall.model.bidHall.sectionNum`).d('标段编号')}
              >
                {getFieldDecorator('sectionNum', {
                  initialValue: dataSource.sectionNum,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.bidHall.model.bidHall.sectionNum`).d('标段编号'),
                      }),
                    },
                    {
                      pattern: /^[0-9]+$/,
                      message: intl.get('ssrc.common.pleaseEnterZeroNumber').d('请输入数值'),
                    },
                  ],
                })(<Input inputChinese={false} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`ssrc.bidHall.model.bidHall.sectionName`).d('标段名称')}
              >
                {getFieldDecorator('sectionName', {
                  initialValue: dataSource.sectionName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.bidHall.model.bidHall.sectionName`).d('标段名称'),
                      }),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={64} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
            <Col span={12}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`ssrc.bidHall.model.bidHall.demandDate`).d('需求日期')}
              >
                {getFieldDecorator('demandDate', {
                  initialValue: dataSource.demandDate && moment(dataSource.demandDate),
                })(
                  <DatePicker style={{ width: '100%' }} placeholder="" format={getDateFormat()} />
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`ssrc.bidHall.model.bidHall.businessUnit`).d('业务实体')}
              >
                {getFieldDecorator('ouId', {
                  initialValue: dataSource.ouId,
                })(
                  <Lov
                    code="SPFM.USER_AUTH.OU"
                    textValue={dataSource.ouName}
                    onChange={(value, dataList) => this.changeOuId(value, dataList)}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={64} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
            <Col span={12}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`ssrc.bidHall.model.bidHall.inventoryOrg`).d('库存组织')}
              >
                {getFieldDecorator('invOrganizationId', {
                  initialValue: dataSource.invOrganizationId,
                })(
                  <Lov
                    code="HPFM.INV_ORG"
                    textValue={dataSource.invOrganizationName}
                    disabled={!getFieldValue('ouId')}
                    onChange={(value, dataList) => this.changeInvOrganization(value, dataList)}
                    queryParams={{
                      ouId: getFieldValue('ouId'),
                      enabledFlag: 1,
                      organizationId,
                    }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        </div>
      </Form>
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { visible, onCancel, loading = false, saveLoading } = this.props;
    const modalProps = {
      visible,
      width: 680,
      onCancel,
      title: (
        <span>{intl.get(`ssrc.bidHall.view.message.title.sectionDetail`).d('标段信息维护')}</span>
      ),
    };
    return (
      <React.Fragment>
        <Modal
          {...modalProps}
          destroyOnClose
          footer={[
            <Button key="back" onClick={() => onCancel()}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading || saveLoading}
              onClick={this.saveBtn}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>,
          ]}
        >
          <Spin spinning={loading}>{this.renderSectionForm()}</Spin>
        </Modal>
      </React.Fragment>
    );
  }
}
