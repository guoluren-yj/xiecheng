/*
 * Approval - 调查表审批
 * @date: 2018/08/22 19:13:01
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { getCurrentOrganizationId } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Row, Col, Button, Form } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import styles from '../index.less';
import Investigation from '../../Investigation/Component/Investigation';
import OperatingRecord from './OperatingRecord';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 调查表审批
 * @extends {Component} - React.Component
 * @reactProps {String} companyName公司名
 * @reactProps {Boolean} isSupplier true-供应商 false-客户
 * @reactProps {Date} invitingTime邀请时间
 * @reactProps {String} inviteRemark邀请备注
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SSLM.INVESTIGATION_APPROVAL_DETAIL.HEADER'],
})
export default class Approval extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      operationRecordVisible: false,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  @Bind()
  showOperating() {
    this.setState({
      operationRecordVisible: true,
    });
  }

  @Bind()
  closeOperating() {
    this.setState({
      operationRecordVisible: false,
    });
  }

  render() {
    const {
      detail = {},
      investigateTemplateId,
      investgHeaderId,
      processStatus,
      customizeForm,
      custLoading,
      form,
      form: { getFieldDecorator },
    } = this.props;
    const { operationRecordVisible } = this.state;
    const organizationId = getCurrentOrganizationId();
    const historyParams = {
      investgHeaderId,
      organizationId,
      operationRecordVisible,
      key: investgHeaderId,
      businessKeyList: detail.businessKeyList,
      closeOperating: this.closeOperating,
    };

    return (
      <div className={styles['information-container']}>
        <div className={styles['information-title']}>
          <span className={styles['vertical-line']} />
          <span>{intl.get(`spfm.disposeInvite.view.message.investigateTemplate`).d('调查表')}</span>
        </div>
        <div className={styles['information-buttons']}>
          <Button icon="clock-circle-o" onClick={this.showOperating}>
            {intl.get(`spfm.disposeInvite.view.message.operationRecord`).d('操作记录')}
          </Button>
        </div>
        {customizeForm(
          {
            code: 'SSLM.INVESTIGATION_APPROVAL_DETAIL.HEADER',
            form,
            dataSource: detail,
          },
          <Form
            custLoading={custLoading}
            className="ued-edit-form form-wrap"
            style={{ padding: '0 16px' }}
          >
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spfm.disposeInvite.view.message.investgNumber`).d('调查表编号')}
                >
                  {getFieldDecorator('investgNumber', {
                    initialValue: detail.investgNumber || '',
                  })(<span>{detail.investgNumber || ''}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spfm.disposeInvite.view.message.processStatusMeaning`).d('状态')}
                >
                  {getFieldDecorator('processStatus', {
                    initialValue: detail.processStatus || '',
                  })(<span>{detail.processStatusMeaning || detail.processStatus || ''}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.release`).d('发布时间')}
                >
                  {getFieldDecorator('releaseDate', {
                    initialValue: detail.releaseDate || '',
                  })(<span>{detail.releaseDate || ''}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.entity.creator`).d('创建人')}
                >
                  {getFieldDecorator('createdBy', {
                    initialValue: detail.createdBy || '',
                  })(<span>{detail.createUserRealName || ''}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('entity.customer.code').d('客户编号')}
                >
                  {getFieldDecorator('companyNum', {
                    initialValue: detail.companyNum || '',
                  })(<span>{detail.companyNum || ''}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('entity.customer.name').d('客户名称')}
                >
                  {getFieldDecorator('companyName', {
                    initialValue: detail.companyName || '',
                  })(<span>{detail.companyName || ''}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('entity.supplier.code').d('供应商编码')}
                >
                  {getFieldDecorator('partnerCompanyNum', {
                    initialValue: detail.partnerCompanyNum || '',
                  })(<span>{detail.partnerCompanyNum || ''}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('entity.supplier.name').d('供应商名称')}
                >
                  {getFieldDecorator('supplierZhOrEnCompanyNum', {
                    initialValue: detail.partnerCompanyName || '',
                  })(<span>{detail.partnerCompanyName || ''}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spfm.disposeInvite.view.message.remark`).d('调查说明')}
                >
                  {getFieldDecorator('remark', {
                    initialValue: detail.remark || '',
                  })(<span>{detail.remark || ''}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spfm.disposeInvite.view.message.partnerRemark`).d('反馈备注')}
                >
                  {getFieldDecorator('partnerRemark', {
                    initialValue: detail.partnerRemark || '',
                  })(<span>{detail.partnerRemark || ''}</span>)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        <Investigation
          organizationId={organizationId}
          investigateTemplateId={investigateTemplateId}
          investgHeaderId={investgHeaderId}
          isShowRecord={false}
          processStatus={processStatus}
        />

        {operationRecordVisible && <OperatingRecord {...historyParams} />}
      </div>
    );
  }
}
