/**
 * 调查表头部
 * @date: 2018-9-20
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Input, Form } from 'hzero-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isFunction } from 'lodash';
import styles from '../index.less';

const { TextArea } = Input;
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
/**
 * 调查表头部
 * @extends {Component} - PureComponent
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SSLM.INVESTIGATION_WRITE_DETAIL.BASICINFO'],
  manualQuery: true,
})
export default class CompanyInformation extends PureComponent {
  constructor(props) {
    super(props);
    const { headerInfo = {}, partnerTenantId } = props;
    this.state = {
      partnerRemark: headerInfo.partnerRemark,
    };

    const { queryUnitConfig } = props;
    if (queryUnitConfig) {
      queryUnitConfig({ customizeTenantId: partnerTenantId || headerInfo?.tenantId });
    }
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  /**
   * 邀请备注
   */
  changeTextArea = (e) => {
    this.setState(
      {
        partnerRemark: e.target.value,
      },
      () => {
        const { onGetHeaderInfo } = this.props;
        const { partnerRemark } = this.state;
        onGetHeaderInfo(partnerRemark);
      }
    );
  };

  render() {
    const {
      headerInfo,
      customizeForm,
      form,
      custLoading,
      remarkEdit,
      form: { getFieldDecorator },
      purchaserDisabled = false,
    } = this.props;
    const { partnerRemark } = this.state;
    return (
      <div style={{ width: '90%' }} className={styles['information-container']}>
        {customizeForm(
          {
            code: 'SSLM.INVESTIGATION_WRITE_DETAIL.BASICINFO',
            form,
            dataSource: headerInfo,
          },
          <Form custLoading={custLoading} className="ued-edit-form form-wrap">
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.code`).d('调查表编号')}
                >
                  {getFieldDecorator('investgNumber', {
                    initialValue: headerInfo.investgNumber,
                  })(<span>{headerInfo.investgNumber}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.level`).d('调查表管控维度')}
                >
                  {getFieldDecorator('investigateLevel', {
                    initialValue: headerInfo.investigateLevel,
                  })(<span>{headerInfo.investigateLevelMeaning}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.customer.code`).d('客户编码')}
                >
                  {getFieldDecorator('companyNum', {
                    initialValue: headerInfo.companyNum,
                  })(<span>{headerInfo.companyNum}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.customer.name`).d('客户名称')}
                >
                  {getFieldDecorator('companyName', {
                    initialValue: headerInfo.companyName,
                  })(<span>{headerInfo.companyName}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.status`).d('调查表状态')}
                >
                  {getFieldDecorator('processStatus', {
                    initialValue: headerInfo.processStatus,
                  })(<span>{headerInfo.processStatusMeaning}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.investCorrelat.view.message.releaseDate`).d('发布时间')}
                >
                  {getFieldDecorator('releaseDate', {
                    initialValue: headerInfo.releaseDate,
                  })(<span>{dateTimeRender(headerInfo.releaseDate)}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.creator.name`).d('创建人')}
                >
                  {getFieldDecorator('createUserName', {
                    initialValue: headerInfo.createUserRealName || headerInfo.createUserName,
                  })(<span>{headerInfo.createUserRealName || headerInfo.createUserName}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.supplier.code`).d('供应商编码')}
                >
                  {getFieldDecorator('partnerCompanyNum', {
                    initialValue: headerInfo.partnerCompanyNum,
                  })(<span>{headerInfo.partnerCompanyNum}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.supplier.name`).d('供应商名称')}
                >
                  {getFieldDecorator('partnerCompanyName', {
                    initialValue: headerInfo.partnerCompanyName,
                  })(<span>{headerInfo.partnerCompanyName}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.investCorrelat.view.message.remark`).d('调查说明')}
                >
                  {getFieldDecorator('remark', {
                    initialValue: headerInfo.remark,
                  })(<span>{headerInfo.remark}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.investCorrelat.view.message.partnerRemark`).d('反馈备注')}
                >
                  {getFieldDecorator('partnerRemark', {
                    initialValue: headerInfo.partnerRemark,
                  })(
                    !remarkEdit || purchaserDisabled ? (
                      <span>{headerInfo.partnerRemark}</span>
                    ) : (
                      <TextArea value={partnerRemark} rows={2} onChange={this.changeTextArea} />
                    )
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </div>
    );
  }
}
