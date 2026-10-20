/**
 * inquiryHall - 物品报价明细-纯展示页面
 * @date: 2021-03-29
 * @author: lzj <zhijian.li@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import { sum, isNumber, isEmpty, without } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

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

import { FIlESIZE } from '@/utils/SsrcRegx';

import style from '@/routes/ssrc/common.less';

const FormItem = Form.Item;

@connect(({ quotationDetail, loading }) => ({
  quotationDetail,
  fetchDataLoading: loading.effects['quotationDetail/fetchSodrQuotationDetail'],
}))
@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
export default class QuotationDetail extends PureComponent {
  constructor(props) {
    super(props);

    const { href = '' } = this.props;
    const search = querystring.parse(href.substr(href.indexOf('?') + 1, href.length));
    const { quotationLineId } = search || {};

    this.state = {
      currentHeader: {},
      organizationId: getCurrentOrganizationId(),
      record: search || {},
      expandedRowKeys: [], // 报价明细项展开行
      rowKeyId:
        quotationLineId || quotationLineId === 0 ? 'supQuotationDetailId' : 'templateDetailId',
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
      currentHeader: {},
    });
  }

  /**
   * 头-报价明细
   */
  @Bind()
  fetchQuotationDetailHeader(page = {}) {
    const {
      dispatch,
      // sourceFrom = 'RFX',
      // rfxStatus = null,
      // sourceHeaderId = undefined,
      tenantId = undefined,
    } = this.props;
    const { record = {}, rowKeyId, currentHeader, } = this.state;
    const { sourceResultId = null, } = record || {};

    dispatch({
      type: 'quotationDetail/fetchSodrQuotationDetail',
      payload: {
        page,
        sourceFrom: record.sourceFrom || 'RFX',
        // rfxLineItemId:
        //   record._status === 'create' ? null : record.rfxLineItemId || record.bidLineItemId,
        // itemId: (record.$form && record.$form.getFieldValue('itemId')) || record.itemId || null,
        // quotationTemplateId:
        //   (record.$form && record.$form.getFieldValue('quotationTemplateId')) ||
        //   record.quotationTemplateId ||
        //   null,
        // itemCategoryId:
        //   (record.$form && record.$form.getFieldValue('itemCategoryId')) ||
        //   record.itemCategoryId ||
        //   null,
        sourceResultId: sourceResultId === 'null' || sourceResultId === 'undefined' || !sourceResultId ? null : sourceResultId,
        quotationLineId: record.quotationLineId === 'null' ? null : record.quotationLineId,
        sourceHeaderNum: record.sourceHeaderNum,
        // quotationHeaderId: record.quotationHeaderId,
        tenantId,
      },
    }).then((res) => {
      // 每次查询都会导致头数据变更，且后端返回的不一致
      if (isEmpty(currentHeader)) {
        this.setState({
          currentHeader: res || {},
        });
      }

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

  renderComponentType(componentType, value) {
    const { organizationId } = this.state;
    let mean = value;
    switch (componentType) {
      case 'DatePicker':
        mean = dateRender(value);
        break;
      case 'Checkbox':
      case 'Switch':
        mean = yesOrNoRender(Number(value));
        break;
      case 'Upload':
        mean = (
          <Upload
            filePreview
            viewOnly
            tenantId={organizationId}
            attachmentUUID={value}
            bucketName={PRIVATE_BUCKET}
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
    const { quotationDetailType, supQuotationDetailId, } = item || {};
    const { supQuotationColumnValue, componentType, disabled, columnDefaultValue, supQuotationColumnValueMeaning, supColumnDefaultValueMeaning, supColumnDefaultValue, } = elementItem || {};

    let value = supQuotationColumnValue;
    const meaningFlag = componentType === 'Lov' || componentType === 'ValueList';
    if (quotationDetailType === 'NO') {
      value = disabled
        ? columnDefaultValue
        : supQuotationDetailId
        ? meaningFlag
          ? supQuotationColumnValueMeaning
          : supQuotationColumnValue
        : meaningFlag
        ? supColumnDefaultValueMeaning
        : supColumnDefaultValue;
      value = supQuotationDetailId
        ? meaningFlag
          ? supQuotationColumnValueMeaning
          : supQuotationColumnValue
        : meaningFlag
        ? supColumnDefaultValueMeaning
        : supColumnDefaultValue;
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
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.common.model.common.configName`).d('报价明细名称'),
        dataIndex: 'configName',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      ...rowColumns,
    ];
  }

  renderHeader() {
    const {
      quotationDetail: { header = {}, quotationDetail = [] },
      allowSupplierViewFlag = 0, // 供应商投标明细、招标事件查询明细、报价查询明细、供应商报价参与
      allowBuyerViewFlag = 1, // 核价、核价审批、明细核价、环比价、专家评分、招标事件查询、定标管理、寻源结果查询
    } = this.props;
    const { organizationId, currentHeader } = this.state;

    let { quoDetailAttachmentUuid = null } = currentHeader || {};
    if (!quoDetailAttachmentUuid) {
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
                fileSize={FIlESIZE}
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
              fileSize={FIlESIZE}
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
    const {
      fetchDataLoading,
      quotationDetail: { quotationDetail = [], quotationDetailPagination = {} },
    } = this.props;

    const { expandedRowKeys = [], rowKeyId } = this.state;

    const scrollX = sum(
      this.renderColumns(
        !isEmpty(quotationDetail) ? quotationDetail[0].quotationColumns : []
      ).map((n) => (isNumber(n.width) ? n.width : 0))
    );
    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}
