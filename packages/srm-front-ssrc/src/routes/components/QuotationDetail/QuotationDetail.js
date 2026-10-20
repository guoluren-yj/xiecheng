/**
 * inquiryHall - 寻源维护/物品信息 - 物品报价明细明细
 * @date: 2020-05-18
 * @author: chenjuan <juan,chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent } from 'react';
import { Button, Form, Row, Col, Drawer } from 'hzero-ui';
import { sum, isNumber, isEmpty, without } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import Checkbox from 'components/Checkbox';
import Upload from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import CPopover from '@/routes/components/CPopover';
import { PRIVATE_BUCKET } from '_utils/config';

import style from '@/routes/ssrc/common.less';
import styles from './index.less';

const FormItem = Form.Item;

@connect(({ quotationDetail, loading }) => ({
  quotationDetail,
  fetchDataLoading: loading.effects['quotationDetail/fetchQuotationDetailHeader'],
}))
@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
export default class QuotationDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
      record: props.itemLineRecord || {}, // 物品明细行数据
      expandedRowKeys: [], // 报价明细项展开行
      rowKeyId:
        props.itemLineRecord.quotationLineId || props.quotationLineId === 0
          ? 'supQuotationDetailId'
          : 'templateDetailId',
    };
  }

  componentDidMount() {
    this.fetchQuotationDetailHeader();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'quotationDetail/updateState',
      payload: {
        header: {},
        quotationDetail: [],
        quotationDetailPagination: {},
      },
    });
    this.setState({
      expandedRowKeys: [],
      record: {},
    });
  }

  /**
   * 头-报价明细
   */
  @Bind()
  fetchQuotationDetailHeader(page = {}) {
    const {
      dispatch,
      sourceFrom = 'RFX',
      // rfxStatus = null,
      sourceHeaderId = undefined,
      tenantId = undefined,
    } = this.props;
    const { record = {}, rowKeyId } = this.state;
    dispatch({
      type: 'quotationDetail/fetchQuotationDetailHeader',
      payload: {
        page,
        sourceFrom,
        rfxLineItemId:
          record._status === 'create' ? null : record.rfxLineItemId || record.bidLineItemId,
        itemId: (record.$form && record.$form.getFieldValue('itemId')) || record.itemId || null,
        quotationTemplateId:
          (record.$form && record.$form.getFieldValue('quotationTemplateId')) ||
          record.quotationTemplateId ||
          null,
        itemCategoryId:
          (record.$form && record.$form.getFieldValue('itemCategoryId')) ||
          record.itemCategoryId ||
          null,
        rfxHeaderId: record.rfxHeaderId || record.bidHeaderId || sourceHeaderId,
        quotationLineId: record.quotationLineId,
        quotationHeaderId: record.quotationHeaderId,
        tenantId,
      },
    }).then((res) => {
      if (!isEmpty(res) && !isEmpty(res.supQuotationDetailPage.content)) {
        this.setState({
          expandedRowKeys: res.supQuotationDetailPage.content.map((item) => item[rowKeyId]),
        });
      }
    });
  }

  /**
   * 展开行控制
   * @ param { Boolean } true 展开 false 关闭
   * @ param { Object } 当前点击行对象
   */
  @Bind()
  handleExpandFunction(expanded, record) {
    const { expandedRowKeys = [], rowKeyId } = this.state;
    if (expanded && !expandedRowKeys.includes(record[rowKeyId])) {
      this.setState({
        expandedRowKeys: [...expandedRowKeys, record[rowKeyId]],
      });
    } else if (!expanded && expandedRowKeys.includes(record[rowKeyId])) {
      this.setState({
        expandedRowKeys: without(expandedRowKeys, record[rowKeyId]),
      });
    }
  }

  renderComponentType(componentType, value, item) {
    const { organizationId } = this.state;
    let mean = value;
    switch (componentType) {
      case 'DatePicker':
        mean = dateRender(value);
        break;
      case 'Checkbox':
      case 'Switch':
        mean = yesOrNoRender(value);
        break;
      case 'Upload':
        mean = (
          <Upload
            filePreview
            viewOnly
            tenantId={organizationId}
            attachmentUUID={value}
            bucketName={
              item.quotationColumnCmpts &&
              item.quotationColumnCmpts.find((e) => e.attributeName === 'bucketName') &&
              item.quotationColumnCmpts.find((e) => e.attributeName === 'bucketName').attributeValue
            }
          />
        );
        break;
      default:
        mean = value;
        break;
    }
    return mean;
  }

  /**
   * 渲染单元格值
   */
  @Bind()
  renderColumnValue(item = {}, elementItem = {}) {
    let value = elementItem.supQuotationColumnValue;
    if (item.quotationDetailType === 'NO') {
      value = elementItem.defaultFlag
        ? elementItem.columnDefaultValue
        : elementItem.componentType === 'ValueList'
        ? elementItem.supQuotationColumnValueMeaning
        : elementItem.supQuotationColumnValue;
    } else {
      value =
        elementItem.componentType === 'ValueList'
          ? elementItem.supQuotationColumnValueMeaning
          : elementItem.supQuotationColumnValue;
    }
    return value;
  }

  /**
   * 渲染表格数据源
   *
   * @param {*} [itemLineQuotationDetail=[]]
   * @returns
   * @memberof ScoreElementTable
   */
  renderDataSource(dataSource = []) {
    if (isEmpty(dataSource)) return [];

    const getData = (source) => {
      if (Array.isArray(source)) {
        const restructureSource = source.map((item) => {
          let elementValue = {};
          const { quotationColumns = [] } = item;
          if (!isEmpty(quotationColumns)) {
            quotationColumns.forEach((elementItem) => {
              elementValue = {
                ...elementValue,
                [elementItem.columnName]: this.renderColumnValue(item, elementItem),
              };
            });
          }
          if (!isEmpty(item.children) && Array.isArray(item.children)) {
            return {
              ...item,
              ...elementValue,
              children: getData(item.children),
            };
          } else {
            return {
              ...item,
              ...elementValue,
            };
          }
        });
        return restructureSource;
      }
    };
    return getData(dataSource);
  }

  renderColumns(dataSource = []) {
    let rowColumns = [];
    if (!isEmpty(dataSource)) {
      rowColumns = dataSource.map((item) => {
        const { columnName, componentType = null } = item || {};
        return {
          dataIndex: columnName,
          title: columnName,
          width: 150,
          render: (val) => this.renderComponentType(componentType, val, item),
        };
      });
    }
    return [
      {
        title: intl.get(`ssrc.common.model.common.configCode`).d('报价明细编码'),
        dataIndex: 'configCode',
        width: 150,
        fixed: 'left',
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.common.model.common.configName`).d('报价明细名称'),
        dataIndex: 'configName',
        width: 150,
        fixed: 'left',
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      ...rowColumns,
    ];
  }

  renderHeader() {
    const {
      quotationDetail: { header = {}, quotationDetail = [] },
      allowSupplierViewFlag = 0, // 供应商投标明细、招标事件查询明细、报价查询明细、供应商报价参与
      allowBuyerViewFlag = 0, // 核价、核价审批、明细核价、环比价、专家评分、招标事件查询、定标管理、寻源结果查询
    } = this.props;
    const { organizationId } = this.state;
    let { quoDetailAttachmentUuid = null } = header;
    if (!header.quoDetailAttachmentUuid) {
      quoDetailAttachmentUuid =
        (!isEmpty(quotationDetail) && quotationDetail[0].quoDetailAttachmentUuid) || null;
    }
    return (
      <Row className={style.headerInfo}>
        <Col span={8}>
          <FormItem>
            {header.templateNum ? `${header.templateNum} - ${header.templateName}` : null}
          </FormItem>
        </Col>
        {allowBuyerViewFlag || allowSupplierViewFlag ? (
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.common.model.common.viewAttachment`).d('查看附件')}
              required={header.attachmentNeedFlag}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              <Upload
                viewOnly
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfx-rfxheader"
                attachmentUUID={quoDetailAttachmentUuid}
                tenantId={organizationId}
                filePreview
              />
            </FormItem>
          </Col>
        ) : (
          <Col span={8}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.attachmentRequired`)
                .d('附件必传')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              <Checkbox
                checked={header.attachmentNeedFlag}
                style={{ marginRight: '16px' }}
                disabled
              />
            </FormItem>
          </Col>
        )}
        {!allowSupplierViewFlag && (
          <Col span={8}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.template.allowCreateFlag`)
                .d('允许供应商新建明细行')}
              labelCol={{ span: 14 }}
              wrapperCol={{ span: 10 }}
            >
              <Checkbox checked={header.allowCreateFlag} disabled />
            </FormItem>
          </Col>
        )}
        <Col span={8}>
          <FormItem
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.purchaseAttachmentUpload`)
              .d('采购方附件上传')}
            {...SEARCH_FORM_ITEM_LAYOUT}
          >
            <Upload
              filePreview
              viewOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="quotation-template"
              attachmentUUID={header.attachmentUuid}
              tenantId={organizationId}
              icon="download"
            />
          </FormItem>
        </Col>
      </Row>
    );
  }

  render() {
    const { fetchDataLoading, onCancel, visible } = this.props;

    const {
      quotationDetail: { quotationDetail = [], quotationDetailPagination = {} },
    } = this.props;

    const { expandedRowKeys = [], rowKeyId } = this.state;

    const scrollX = sum(
      this.renderColumns(
        !isEmpty(quotationDetail) ? quotationDetail[0].quotationColumns : []
      ).map((n) => (isNumber(n.width) ? n.width : 0))
    );
    return (
      <Drawer
        closable
        destroyOnClose
        visible={visible}
        title={intl.get(`ssrc.common.view.message.title.quotationDetail`).d('报价明细')}
        onClose={onCancel}
        onOk={onCancel}
        footer={null}
        width="70%"
      >
        {this.renderHeader()}
        <EditTable
          bordered
          rowKey={rowKeyId}
          columns={this.renderColumns(
            !isEmpty(quotationDetail) ? quotationDetail[0].quotationColumns : []
          )}
          dataSource={this.renderDataSource(quotationDetail) || []}
          scroll={{ x: scrollX }}
          loading={fetchDataLoading}
          onChange={(page) => this.fetchQuotationDetailHeader(page)}
          pagination={quotationDetailPagination}
          expandedRowKeys={expandedRowKeys}
          onExpand={this.handleExpandFunction}
        />

        <div className={styles['modal-footer-button-group']}>
          <Button onClick={onCancel}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
          <Button type="primary" onClick={onCancel} className={styles['button-m-l-sm']}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
