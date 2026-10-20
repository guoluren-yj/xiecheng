/**
 * HisPriceAnalysisModal - 价格库/历史价格分析
 * @date: 2019-12-20
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Col, Row, Form, Table, Modal, Spin, Popover } from 'hzero-ui';
import { isFunction, isNumber, sum, minBy } from 'lodash';
import { Chart, Geom, Axis, Tooltip, Guide } from 'bizcharts';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import Lov from 'components/Lov';
import { numberSeparatorRender } from '@/utils/renderer';
import style from './HisPriceAnalysis.less';

const { Line, DataMarker } = Guide;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class HisPriceAnalysisModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      finallyPriceArry: [], // 历史报价对应物料折线图数据
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  renderHistoryAnalysisTooltip(
    creationDate,
    supplierCompanyName,
    unitPrice,
    itemName,
    ouName,
    uomName,
    companyName
  ) {
    return {
      name: `<div>${intl
        .get('ssrc.inquiryHall.model.inquiryHall.supplierCompany')
        .d('供应商')}：${supplierCompanyName}</div>
    <div>${intl.get('ssrc.inquiryHall.model.inquiryHall.item').d('物品')}：${itemName}</div>
    <div>${intl
      .get('ssrc.inquiryHall.model.inquiryHall.unitPrice')
      .d('单价')}：${unitPrice}${intl
        .get('ssrc.inquiryHall.model.inquiryHall.yuan')
        .d('元')}/${uomName}</div>
    <div>${intl.get('ssrc.inquiryHall.model.inquiryHall.company').d('公司')}：${companyName}</div>
    <div>${intl.get('ssrc.inquiryHall.model.inquiryHall.ouName').d('业务实体')}：${ouName}</div>
    <div>${intl
      .get('ssrc.inquiryHall.model.inquiryHall.quotationTime')
      .d('报价时间')}：${creationDate}</div>
    `,
    };
  }

  renderColumns() {
    const quotColumns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.num`).d('序号'),
        dataIndex: 'lineNum',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemMean`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierDesc`).d('供应商描述'),
        dataIndex: 'supplierCompanyName',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.hisMinPrice`).d('历史最低单价'),
        dataIndex: 'unitPrice',
        width: 120,
        render: (val) => numberSeparatorRender(val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 120,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 120,
      },
    ];
    return quotColumns;
  }

  render() {
    const {
      loading,
      fetchHisSimilarItemLoading,
      visible,
      hideModal,
      dateFlag,
      selectedRows = [],
      hisSimilarItemData,
      hisSimilarItemPagination,
      onChangeSimilarItem,
      onClickTimeBtn,
      onSelectItemOk,
      onSelectSupplierOk,
      form: { getFieldDecorator },
    } = this.props;
    const { finallyPriceArry } = this.state;
    // 历史报价分析折线图
    const hcols = {
      creationDate: {
        type: 'time',
        range: [0.1, 0.9],
        tickCount: 10,
        mask: 'YYYY-MM-DD HH:mm:ss',
      },
    };
    const modalProps = {
      visible,
      width: '68%',
      footer: null,
      placement: 'right',
      style: {
        height: 'calc(100%)',
        overflow: 'auto',
      },
      onCancel: hideModal,
      className: style['master-content'],
      bodyStyle: { height: 460, marginLeft: '12px', overflow: 'auto', paddingTop: '16px' },
      title: intl
        .get(`ssrc.inquiryHall.view.message.button.historyPriceAnalysis`)
        .d('历史价格分析'),
    };
    const anchor = 'right';
    const scrollX = sum(this.renderColumns().map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        <Modal
          {...modalProps}
          wrapClassName={`ant-modal-sidebar-${anchor}`}
          transitionName={`move-${anchor}`}
        >
          <div className={style['item-list-search']}>
            <Form className="writable-row-custom">
              <Row gutter={48} className="writable-row">
                <Col span={8}>
                  <FormItem
                    label={intl.get(`ssrc.inquiryHall.model.inquiryHall.item`).d('物品')}
                    {...formLayout}
                  >
                    {getFieldDecorator('itemId', {
                      initialValue: selectedRows[0] && selectedRows[0].itemId,
                    })(
                      <Lov
                        textValue={selectedRows[0] && selectedRows[0].itemName}
                        code="SSRC.PRICE_LIB_ITEMS"
                        onChange={(val, record) => onSelectItemOk(val, record)}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.supplierCompany`)
                      .d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierCompanyId', {
                      initialValue: selectedRows[0] && selectedRows[0].supplierCompanyId,
                    })(
                      <Lov
                        textValue={selectedRows[0] && selectedRows[0].supplierCompanyName}
                        code="SSRC.PRICE_LIB_SUPPLIERS"
                        // onOk={onSelectSupplierOk}
                        onChange={onSelectSupplierOk}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <div
                    style={{ width: '100%', display: 'block', borderBottom: '1px solid #e8e8e8' }}
                  >
                    <div
                      onClick={() => onClickTimeBtn('allTime')}
                      style={{
                        padding: '13px 16px',
                        borderBottom: dateFlag === 'allTime' && '1px solid #29BECE',
                        display: 'inline-block',
                        cursor: 'pointer',
                      }}
                    >
                      {intl.get(`ssrc.inquiryHall.view.message.button.allTime`).d('全部时间')}
                    </div>
                    <div
                      onClick={() => onClickTimeBtn('almostYear')}
                      style={{
                        padding: '13px 16px',
                        borderBottom: dateFlag === 'almostYear' && '1px solid #29BECE',
                        display: 'inline-block',
                        cursor: 'pointer',
                      }}
                    >
                      {intl.get(`ssrc.inquiryHall.view.message.button.almostYear`).d('近一年')}
                    </div>
                    <div
                      onClick={() => onClickTimeBtn('nearThMonth')}
                      style={{
                        padding: '13px 16px',
                        borderBottom: dateFlag === 'nearThMonth' && '1px solid #29BECE',
                        display: 'inline-block',
                        cursor: 'pointer',
                      }}
                    >
                      {intl.get(`ssrc.inquiryHall.view.message.button.nearThMonth`).d('近三个月')}
                    </div>
                  </div>
                </Col>
              </Row>
            </Form>
          </div>
          <Spin spinning={loading}>
            <Content>
              <Row gutter={24}>
                {finallyPriceArry.length > 0 ? (
                  <Col span={18}>
                    <Chart height={300} data={finallyPriceArry} scale={hcols} forceFit>
                      <Axis name="creationDate" />
                      <Axis name="unitPrice" />

                      <Tooltip showTitle={false} />
                      <Geom
                        type="line"
                        position="creationDate*unitPrice"
                        size={2}
                        tooltip={[
                          'creationDate*supplierCompanyName*unitPrice*itemName*ouName*uomName*companyName',
                          (
                            creationDate,
                            supplierCompanyName,
                            unitPrice,
                            itemName,
                            ouName,
                            uomName,
                            companyName
                          ) =>
                            this.renderHistoryAnalysisTooltip(
                              creationDate,
                              supplierCompanyName,
                              unitPrice,
                              itemName,
                              ouName,
                              uomName,
                              companyName
                            ),
                        ]}
                      />
                      <Geom
                        type="point"
                        position="creationDate*unitPrice"
                        tooltip={[
                          'creationDate*supplierCompanyName*unitPrice*itemName*ouName*uomName*companyName',
                          (
                            creationDate,
                            supplierCompanyName,
                            unitPrice,
                            itemName,
                            ouName,
                            uomName,
                            companyName
                          ) =>
                            this.renderHistoryAnalysisTooltip(
                              creationDate,
                              supplierCompanyName,
                              unitPrice,
                              itemName,
                              ouName,
                              uomName,
                              companyName
                            ),
                        ]}
                        size={3}
                        shape="circle"
                        style={{
                          stroke: '#fff',
                          lineWidth: 1,
                        }}
                      />
                      <Guide>
                        <Line
                          top
                          start={(xScale, yScale) => {
                            return ['start', Math.min(...yScale.unitPrice.values)];
                          }}
                          end={(xScale, yScale) => {
                            return ['end', Math.min(...yScale.unitPrice.values)];
                          }}
                          lineStyle={{
                            stroke: '#F3A1A0',
                          }}
                        />
                        <DataMarker
                          position={(xScale, yScale) => {
                            return [
                              minBy(finallyPriceArry, (item) => item.unitPrice).creationDate,
                              Math.min(...yScale.unitPrice.values),
                            ];
                          }}
                          content={`${intl
                            .get('ssrc.inquiryHall.model.inquiryHall.lowestPrice')
                            .d('最低价')}：${
                            minBy(finallyPriceArry, (item) => item.unitPrice).unitPrice
                          }${intl.get('ssrc.inquiryHall.model.inquiryHall.yuan').d('元')}`}
                          style={{
                            text: {
                              textAlign: 'right',
                            },
                          }}
                        />
                      </Guide>
                    </Chart>
                  </Col>
                ) : (
                  <Col span={18}>
                    <div style={{ padding: '120px 0 0 40%' }}>
                      {intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.temporarilyNoData`)
                        .d('暂无数据')}
                    </div>
                  </Col>
                )}
              </Row>
              <div style={{ marginTop: '32px' }}>
                <div style={{ fontSize: '14px', marginBottom: '16px' }}>
                  <span>
                    {intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.similarItemMinPrice`)
                      .d('相似物品最低价一览')}
                  </span>
                </div>
                <Table
                  bordered
                  rowKey="quotationLineId"
                  loading={fetchHisSimilarItemLoading}
                  columns={this.renderColumns()}
                  scroll={{ x: scrollX }}
                  dataSource={hisSimilarItemData}
                  pagination={hisSimilarItemPagination}
                  onChange={(page) => onChangeSimilarItem({}, page)}
                />
              </div>
            </Content>
          </Spin>
        </Modal>
      </React.Fragment>
    );
  }
}
