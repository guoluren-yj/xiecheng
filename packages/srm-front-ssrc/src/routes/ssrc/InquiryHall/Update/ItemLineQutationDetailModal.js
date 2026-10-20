/**
 * inquiryHall - 寻源维护/物品信息 - 物品报价明细明细
 * @date: 2019-07-03
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import Upload from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import { tableScrollWidth } from 'utils/utils';
import style from '@/routes/ssrc/common.less';
import { PRIVATE_BUCKET } from '_utils/config';

const FormItem = Form.Item;

export default class ItemLineQutationDetailModal extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      itemLineQuotationDetailModalVisible: false,
    };
  }

  componentDidMount() {
    this.handleBeforeRender();
  }

  /**
   * 获取model 显示状态
   *
   * @memberof ItemLineQutationDetailModal
   */
  handleBeforeRender() {
    const { itemLineQuotationDetailModalVisible = false } = this.props;

    this.setState({
      itemLineQuotationDetailModalVisible,
    });
  }

  /**
   * 渲染前筛选字段
   *
   * @param {*} [data=[]]
   * @returns
   * @memberof ItemLineQutationDetailModal
   */
  handleAttachmentField(data = []) {
    if (!data || !Array.isArray(data) || !data.length) {
      return {
        isEmpty: false,
        needFlag: 0,
        uuid: '',
        number: null,
        name: '',
        configCode: '',
      };
    }

    return {
      isEmpty: true,
      needFlag: data[0].attachmentNeedFlag,
      uuid: data[0].attachmentUuid,
      number: data[0].templateNum,
      name: data[0].templateName,
      allowCreateFlag: data[0].allowCreateFlag,
      configCode: data[0].configCode,
    };
  }

  render() {
    const {
      organizationId,
      fetchItemLineQuotationDetailLoading,
      itemLineQuotationDetail = [],
      cancelItemLineQutationDetail,
      sureItemLineQutationDetail,
      activeKey,
      record,
    } = this.props;

    const bidLineItemId = record && record.bidLineItemId;

    const {
      needFlag,
      uuid,
      isEmpty,
      number,
      name,
      allowCreateFlag,
      configCode,
    } = this.handleAttachmentField(itemLineQuotationDetail);

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.configItem`).d('配置项'),
        dataIndex: 'configName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.configRequire`).d('配置要求'),
        dataIndex: 'configDemand',
        render: (val, records) =>
          ['update', 'create'].includes(records._status) ? (
            <React.Fragment>
              <FormItem>
                {records.$form.getFieldDecorator('configDemand', {
                  initialValue: val,
                })(<Input />)}
              </FormItem>
              <FormItem style={{ display: 'none' }}>
                {records.$form.getFieldDecorator('templateDetailId', {
                  initialValue: records.templateDetailId,
                })(<div />)}
              </FormItem>
              <FormItem style={{ display: 'none' }}>
                {records.$form.getFieldDecorator('quotationDetailId', {
                  initialValue: records.quotationDetailId,
                })(<div />)}
              </FormItem>
              <FormItem style={{ display: 'none' }}>
                {records.$form.getFieldDecorator('quotationDimension', {
                  initialValue: records.quotationDimension,
                })(<div />)}
              </FormItem>
              <FormItem style={{ display: 'none' }}>
                {records.$form.getFieldDecorator('quotationDimensionValue', {
                  initialValue: records.quotationDimensionValue,
                })(<div />)}
              </FormItem>
              <FormItem style={{ display: 'none' }}>
                {records.$form.getFieldDecorator('rfxLineItemId', {
                  initialValue: records.rfxLineItemId,
                })(<div />)}
              </FormItem>
            </React.Fragment>
          ) : (
            val
          ),
      },
    ];

    const scrollX = tableScrollWidth(columns);

    return (
      <Modal
        visible={this.state.itemLineQuotationDetailModalVisible}
        title={intl.get(`ssrc.inquiryHall.view.message.title.quotationDetail`).d('报价明细')}
        onCancel={cancelItemLineQutationDetail}
        onOk={() => sureItemLineQutationDetail(activeKey, bidLineItemId)}
      >
        {isEmpty ? (
          <div>
            <Row className={style.headerInfo}>
              <Col span={12}>
                <FormItem>{number ? `${number} - ${name}` : null}</FormItem>
              </Col>
              <Col span={12}>
                <FormItem>
                  <span style={{ marginRight: '4px' }}>
                    {intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.attachmentRequired`)
                      .d('附件必传')}
                    :
                  </span>
                  <Checkbox checked={needFlag} disabled />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.template.allowCreateFlag`)
                    .d('允许供应商新建明细行')}
                  labelCol={{ span: 14 }}
                  wrapperCol={{ span: 10 }}
                >
                  <Checkbox checked={allowCreateFlag} disabled />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem>
                  <span style={{ marginRight: '4px' }}>
                    {intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.purchaseAttachmentUpload`)
                      .d('采购方附件上传')}
                    :
                  </span>
                  <Upload
                    filePreview
                    viewOnly
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="quotation-template"
                    attachmentUUID={uuid}
                    tenantId={organizationId}
                    icon="download"
                  />
                </FormItem>
              </Col>
            </Row>
          </div>
        ) : (
          ''
        )}

        <EditTable
          bordered
          rowKey="templateDetailId"
          scroll={{ x: scrollX }}
          style={configCode ? { display: 'block' } : { display: 'none' }}
          loading={fetchItemLineQuotationDetailLoading}
          dataSource={itemLineQuotationDetail}
          columns={columns}
          pagination={false}
        />
      </Modal>
    );
  }
}
