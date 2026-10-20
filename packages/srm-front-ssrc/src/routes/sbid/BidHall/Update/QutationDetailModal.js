/**
 * inquiryHall - 寻源维护/物品信息 - 物品报价明细明细
 * @date: 2019-07-03
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Row, Col } from 'hzero-ui';

import { sum, isNumber, isEmpty } from 'lodash';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import Upload from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import style from '@/routes/ssrc/common.less';
import { PRIVATE_BUCKET } from '_utils/config';

const FormItem = Form.Item;

export default class ItemQutationDetailModal extends PureComponent {
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
   * 渲染表格数据源
   *
   * @param {*} [itemLineQuotationDetail=[]]
   * @returns
   * @memberof ScoreElementTable
   */
  renderDataSource(itemLineQuotationDetail = []) {
    const DetailList =
      itemLineQuotationDetail &&
      itemLineQuotationDetail.map((item) => {
        let elementValue = {};
        const { quotationColumns = [], ...otherItem } = item;
        quotationColumns.forEach((elementItem) => {
          elementValue = {
            ...elementValue,
            [elementItem.columnName]: elementItem.supQuotationColumnValue,
          };
        });
        return {
          ...otherItem,
          ...elementValue,
        };
      });
    return DetailList;
  }

  renderColumns(dataSource = []) {
    let rowColumns = [];
    if (isEmpty(dataSource)) {
      return [
        {
          title: intl.get(`ssrc.inquiryHall.model.template.quoConfigName`).d('报价明细项'),
          dataIndex: 'configName',
          width: 180,
        },
      ];
    } else {
      rowColumns = dataSource.map((item) => {
        return {
          dataIndex: `${item.columnName}`,
          title: `${item.columnName}`,
          width: 150,
        };
      });
      return [
        {
          title: intl.get(`ssrc.inquiryHall.model.template.quoConfigName`).d('报价明细项'),
          dataIndex: 'configName',
          width: 180,
        },
        ...rowColumns,
      ];
    }
  }

  render() {
    const {
      itemRecord = {},
      organizationId,
      fetchQuotationDetail,
      fetchQuotationDetailLoading,
      itemLineQuotationDetail = [],
      closeQuotationData,
      itemQuotationPagination = {},
      QuotationDetailDataSource = {},
    } = this.props;

    const {
      attachmentNeedFlag,
      attachmentUuid,
      templateNum,
      templateName,
      allowCreateFlag,
      // configCode,
    } = QuotationDetailDataSource;
    const scrollX = sum(
      this.renderColumns(
        !isEmpty(itemLineQuotationDetail) ? itemLineQuotationDetail[0].quotationColumns : []
      ).map((n) => (isNumber(n.width) ? n.width : 0))
    );
    return (
      <Modal
        visible={this.state.itemLineQuotationDetailModalVisible}
        title={intl.get(`ssrc.inquiryHall.view.message.title.quotationDetail`).d('报价明细')}
        onCancel={closeQuotationData}
        onOk={closeQuotationData}
      >
        <div>
          <Row className={style.headerInfo}>
            <Col span={12}>
              <FormItem>{templateNum ? `${templateNum} - ${templateName}` : null}</FormItem>
            </Col>
            <Col span={12}>
              <FormItem>
                <span style={{ marginRight: '4px' }}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentRequired`).d('附件必传')}:
                </span>
                <Checkbox checked={attachmentNeedFlag} disabled />
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
                  viewOnly
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="quotation-template"
                  attachmentUUID={attachmentUuid}
                  tenantId={organizationId}
                  icon="download"
                />
              </FormItem>
            </Col>
          </Row>
        </div>

        <EditTable
          bordered
          rowKey="templateDetailId"
          columns={this.renderColumns(
            !isEmpty(itemLineQuotationDetail) ? itemLineQuotationDetail[0].quotationColumns : []
          )}
          dataSource={this.renderDataSource(itemLineQuotationDetail) || []}
          scroll={{ x: scrollX }}
          // style={configCode ? { display: 'block' } : { display: 'none' }}
          loading={fetchQuotationDetailLoading}
          onChange={(page) => fetchQuotationDetail(page, itemRecord)}
          pagination={itemQuotationPagination}
        />
      </Modal>
    );
  }
}
