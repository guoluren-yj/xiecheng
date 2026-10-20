/**
 * inquiryHall - component - 报价明细纯展示modal
 * @date: 2019-09-04
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import { tableScrollWidth } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import style from '@/routes/ssrc/common.less';
import { PRIVATE_BUCKET } from '_utils/config';

const FormItem = Form.Item;
@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common', 'sscux.ssrc',] })
export default class ItemLineQutationDetailModal extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

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
        uuid: '',
        quotationUuid: '',
        number: null,
        name: '',
        needFlag: 0,
        allowCreateFlag: false,
        configName: '',
      };
    }
    const {
      attachmentUuid = null,
      quoDetailAttachmentUuid = null,
      templateNum = '',
      templateName = '',
      attachmentNeedFlag = 0,
      allowCreateFlag = 0,
      configName = '',
    } = data[0];

    return {
      isEmpty: true,
      uuid: attachmentUuid,
      quotationUuid: quoDetailAttachmentUuid,
      number: templateNum,
      name: templateName,
      needFlag: attachmentNeedFlag,
      allowCreateFlag,
      configName,
    };
  }

  render() {
    const {
      organizationId,
      fetchItemLineQuotationDetailLoading,
      itemLineQuotationDetail = [],
      cancelItemLineQutationDetail,
      sureItemLineQutationDetail,
      itemLineQuotationDetailModalVisible = false,
      isAllQuotation = 0,
      showQuotationAttachmentNeedFlag = false,
      showSupplierAttachment = true,
    } = this.props;

    const {
      uuid,
      needFlag,
      number,
      name,
      allowCreateFlag,
      quotationUuid,
      isEmpty,
      configName,
    } = this.handleAttachmentField(itemLineQuotationDetail);

    const filterDataSource = itemLineQuotationDetail.filter(
      (item) => item.quotationTemplateFlag !== 1
    );

    const itemLineQuotationColumn = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.configurationItem`).d('配置项'),
        dataIndex: 'configName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.configDemand`).d('配置要求'),
        dataIndex: 'configDemand',
      },
    ];

    const allQuotationColumn = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantityCount`).d('数量'),
        dataIndex: 'configQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitPrice`).d('单价'),
        dataIndex: 'configUnitPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 250,
      },
    ];

    let columns = [];

    if (isAllQuotation) {
      columns = [...itemLineQuotationColumn, ...allQuotationColumn];
    } else {
      columns = [...itemLineQuotationColumn];
    }

    const scrollX = tableScrollWidth(columns);

    return (
      <Modal
        visible={itemLineQuotationDetailModalVisible}
        title={intl.get(`ssrc.inquiryHall.view.message.modal.quotationDetail`).d('报价明细')}
        onCancel={cancelItemLineQutationDetail}
        onOk={sureItemLineQutationDetail}
        width={isAllQuotation ? 920 : 660}
      >
        {isEmpty ? (
          <div>
            <Row className={style.headerInfo}>
              <Col span={12}>
                <FormItem>{number ? `${number} - ${name}` : null}</FormItem>
              </Col>
              {showQuotationAttachmentNeedFlag ? (
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
              ) : null}
              <Col span={12}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.template.allowCreateFlag`)
                    .d('允许供应商新建明细行')}
                  style={{ display: 'flex' }}
                >
                  <Checkbox checked={allowCreateFlag} disabled />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem>
                  <span style={{ marginRight: '4px' }}>
                    {intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.purchaseAttachment`)
                      .d('采购方附件')}
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
              {showSupplierAttachment ? (
                <Col span={12}>
                  <FormItem>
                    <span style={{ marginRight: '4px' }}>
                      {intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.supplierAttachment`)
                        .d('供应商附件')}
                      :
                    </span>
                    <Upload
                      viewOnly
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-rfxheader"
                      attachmentUUID={quotationUuid}
                      tenantId={organizationId}
                      icon="download"
                    />
                  </FormItem>
                </Col>
              ) : null}
            </Row>
          </div>
        ) : (
          ''
        )}

        <EditTable
          bordered
          style={configName ? { display: 'block' } : { display: 'none' }}
          rowKey="supQuotationDetailId"
          scroll={{ x: scrollX }}
          loading={fetchItemLineQuotationDetailLoading}
          dataSource={filterDataSource || itemLineQuotationDetail}
          columns={columns}
          pagination={false}
        />
      </Modal>
    );
  }
}
