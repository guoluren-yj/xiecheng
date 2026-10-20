/**
 * inquiryHall - 寻源服务/寻源大厅-报价查看
 * @date: 2020-04-08
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Collapse, Icon, Table, Popover, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { isNil } from 'lodash';

import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { tableScrollWidth, getResponse, createPagination } from 'utils/utils';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

import {
  phoneRender,
  abandonRemarkRender,
  supplierQuotaitonAbandanRenderStatus,
} from '@/utils/renderer';

import CPopover from '@/routes/components/CPopover/';
import IPAddress from '@/routes/components/IPAddress';

import { fetchHeaderInfo, quotationDetailInInquiryDetail } from '@/services/inquiryHallService';
import styles from './index.less';
import OverlappingSupplier from './OverlappingSupplier';
import NoOverlappingSupplier from './NoOverlappingSupplier';

const { Panel } = Collapse;
const FormItem = Form.Item;

export default class InQuotation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      header: {},
      InQuotationCollapseKeys: ['quotationHeader', 'quotationDetail'], // 报价折叠面板
      rfxDetailQuotationList: [],
      rfxDetailQuotationPagination: {},
    };
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    if (!prevProps) {
      return;
    }

    const { rfxHeaderId: prevRfxHeaderId = null } = prevProps || {};
    const { rfxHeaderId = null } = this.props;
    const RefreshFlag = rfxHeaderId && prevRfxHeaderId && prevRfxHeaderId !== rfxHeaderId;

    return RefreshFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchPageMain();
    }
  }

  componentDidMount() {
    this.fetchPageMain();
  }

  fetchPageMain = () => {
    this.fetchHeaderInfo();
    this.quotationDetailInInquiryDetail();
  };

  async fetchHeaderInfo() {
    const {
      sourceHeaderId,
      organizationId,
      rfx = {},
      pubRouterAddParams = () => {},
      onFormLoaded,
    } = this.props;
    const { unitCodeSymbol } = rfx;

    try {
      let data = await fetchHeaderInfo({
        organizationId,
        rfxHeaderId: sourceHeaderId,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.QUOTATION_NODE_BASEINFO`,
        ...pubRouterAddParams(),
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        header: data,
      });
    } catch (e) {
      throw e;
    } finally {
      if (onFormLoaded) {
        onFormLoaded(true);
      }
    }
  }

  @Bind()
  async quotationDetailInInquiryDetail(page = {}) {
    const { sourceHeaderId, organizationId, rfx = {}, pubRouterAddParams = () => {} } = this.props;
    const { unitCodeSymbol } = rfx;

    try {
      let data = await quotationDetailInInquiryDetail({
        organizationId,
        sourceHeaderId,
        sourceFrom: 'RFX', // 来源是bid/rfx
        page,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.QUOTATION_DETAIL`,
        ...pubRouterAddParams(),
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      const { content = [] } = data || {};
      this.setState({
        rfxDetailQuotationList: content,
        rfxDetailQuotationPagination: createPagination(data),
      });
    } catch (e) {
      throw e;
    }
  }

  @Bind()
  setCollapseByKey(values = []) {
    this.setState({
      InQuotationCollapseKeys: values,
    });
  }

  renderFormContent(dataSource = {}) {
    const {
      form,
      form: { getFieldDecorator },
      customizeForm,
      rfx = {},
    } = this.props;
    const { unitCodeSymbol, quotationName } = rfx;

    return customizeForm(
      {
        code: `SSRC.${unitCodeSymbol}_DETAIL.QUOTATION_NODE_BASEINFO`,
        form,
        dataSource,
        readOnly: true,
      },
      <Form className="read-row-custom">
        <Row type="flex" justify="start" gutter={48} className="read-row-custom">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName', {
                initialValue: dataSource.companyName,
              })(<span>{dataSource.companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceCategoryMeaning', {
                initialValue: dataSource.sourceCategoryMeaning,
              })(
                <span>
                  {dataSource.secondarySourceCategoryMeaning || dataSource.sourceCategoryMeaning}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethodMeaning', {
                initialValue: dataSource.sourceMethodMeaning,
              })(<span>{dataSource.sourceMethodMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStartTime`, {
                  quotationName,
                })
                .d('{quotationName}开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate', {
                initialValue: dataSource.quotationStartDate,
              })(<span>{dateTimeRender(dataSource.quotationStartDate)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDeadline`, {
                  quotationName,
                })
                .d('{quotationName}截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: dataSource.quotationEndDate,
              })(<span>{dateTimeRender(dataSource.quotationEndDate)}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  renderQuotationHeader() {
    const { header = {}, InQuotationCollapseKeys = [] } = this.state;
    const titleNode = (
      <span>
        {header.rfxNum}
        {header.rfxTitle ? `-${header.rfxTitle}` : null}
      </span>
    );
    return (
      <Panel
        showArrow={false}
        header={
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <h3
              style={{
                maxWidth: '80%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'noWrap',
                marginRight: '12px',
                marginLeft: '16px',
              }}
            >
              <CPopover content={titleNode}>{titleNode}</CPopover>
            </h3>
            <a>
              {InQuotationCollapseKeys.includes('quotationHeader')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon
              className={styles.linkColor}
              type={InQuotationCollapseKeys.includes('quotationHeader') ? 'up' : 'down'}
            />
          </span>
        }
        key="quotationHeader"
      >
        {this.renderFormContent(header)}
      </Panel>
    );
  }

  // 查看IP是否重合
  handleOpenIPCoincide = (val, record) => {
    const { sourceHeaderId } = this.props;
    const Props = {
      sourceHeaderId,
      whetherIpCoincide: val,
      rfxLineSupplierId: record.rfxLineSupplierId,
      quotationHeaderId: record.quotationHeaderId,
    };
    C7nModal.open({
      key: 'ssrc-ip-coincide',
      title: intl.get('ssrc.common.model.common.IPDetail').d('IP详情'),
      children: val ? <OverlappingSupplier {...Props} /> : <NoOverlappingSupplier {...Props} />,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
    });
  };

  renderTableColumns = () => {
    const { rfx, remote, useNewRateFlag = 0 } = this.props;
    const { quotationName, bidFlag } = rfx || {};

    const preColumns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        dataIndex: 'contactName',
        width: 180,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        dataIndex: 'contactMobilephone',
        width: 200,
        render: (val, record) => phoneRender(record.internationalTelCodeMeaning, val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.participate`).d('是否参与'),
        dataIndex: 'feedbackStatusMeaning',
        width: 100,
        render: (val, record) =>
          abandonRemarkRender({ val, record, Icon: <Icon type="question-circle" /> }),
      },
      {
        title: intl
          .get('ssrc.inquiryHall.model.inquiryHall.whetherQuotationRFX', { quotationName })
          .d('是否{quotationName}'),
        dataIndex: 'quotationStatusMeaning',
        width: 100,
        render: (val, record) => supplierQuotaitonAbandanRenderStatus({ val, record }),
      },
      !useNewRateFlag
        ? {
            title: (
              <span>
                {intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.quotationIPRFX`, { quotationName })
                  .d('{quotationName}IP')}
                <Tooltip
                  title={intl
                    .get('ssrc.common.view.ipOnlyReferenceWarning')
                    .d('供应商报价/投标时，IP可通过使用代理服务等操作进行包装，此结果仅用于参考')}
                >
                  <Icon type="question-circle" style={{ marginLeft: '4px' }} />
                </Tooltip>
              </span>
            ),
            dataIndex: 'supplierCompanyIp',
            width: 150,
            render: (val, record) => {
              const { quotationStatus, repeatIpFlag } = record || {};
              let text = val || '';
              if (quotationStatus === 'QUOTED') {
                if (repeatIpFlag) {
                  text = <span style={{ color: 'red' }}> {val ?? ''} </span>;
                }
              } else {
                text = '';
              }

              const supplierCompanyIdProps = {
                value: val,
                record,
              };

              const currentText = remote
                ? remote.process(
                    'SSRC_INQUIRY_HALL_DETAIL_IN_QUOTATION_TABLE_COLUMNS_SUPPLIER_COMPANY_IP',
                    text,
                    supplierCompanyIdProps
                  )
                : text;

              return <IPAddress record={record} bidFlag={bidFlag} text={currentText} />;
            },
          }
        : null,
      useNewRateFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`).d('IP是否重合'),
            dataIndex: 'whetherIpCoincide',
            width: 150,
            render: (val, record) =>
              isNil(val) ? (
                val
              ) : (
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => this.handleOpenIPCoincide(val, record)}
                >
                  <Badge style={{ marginTop: '-2px' }} status={val ? 'error' : 'success'} />
                  <span>
                    {val
                      ? intl.get(`hzero.common.model.yes`).d('是')
                      : intl.get(`hzero.common.model.no`).d('否')}
                  </span>
                </span>
              ),
          }
        : null,
    ].filter(Boolean);

    const processProps = {};

    const columns = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_DETAIL_IN_QUOTATION_TABLE_COLUMNS',
          preColumns,
          processProps
        )
      : preColumns;

    return columns.filter(Boolean);
  };

  renderQuotationSupplier() {
    const {
      InQuotationCollapseKeys = [],
      rfxDetailQuotationList = [],
      rfxDetailQuotationPagination = {},
    } = this.state;
    const { rfx = {} } = this.props;
    const { quotationName, unitCodeSymbol } = rfx;

    const columns = this.renderTableColumns();
    const scrollX = tableScrollWidth(columns);
    const { customizeTable = () => {} } = this.props;
    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>
              {intl
                .get(`ssrc.bidHall.model.bidHall.quotationDetailRFX`, { quotationName })
                .d('{quotationName}详情')}
            </h3>
            <a>
              {InQuotationCollapseKeys.includes('quotationDetail')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon
              className={styles.linkColor}
              type={InQuotationCollapseKeys.includes('quotationDetail') ? 'up' : 'down'}
            />
          </React.Fragment>
        }
        key="quotationDetail"
      >
        {customizeTable(
          {
            code: `SSRC.${unitCodeSymbol}_DETAIL.QUOTATION_DETAIL`,
          },
          <Table
            bordered
            rowKey="rfxLineSupplierId"
            columns={columns}
            scroll={{ x: scrollX, y: 360 }}
            dataSource={rfxDetailQuotationList}
            pagination={rfxDetailQuotationPagination}
            onChange={(page) => this.quotationDetailInInquiryDetail(page)}
          />
        )}
      </Panel>
    );
  }

  render() {
    const { InQuotationCollapseKeys = [] } = this.state;

    return (
      <Collapse
        onChange={(keys) => this.setCollapseByKey(keys)}
        className="form-collapse"
        activeKey={InQuotationCollapseKeys}
      >
        {this.renderQuotationHeader()}
        {this.renderQuotationSupplier()}
      </Collapse>
    );
  }
}
