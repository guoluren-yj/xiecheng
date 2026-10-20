/**
 * PricingModal - 招投标服务/定标管理页面中心弹窗
 * @date: 2020-06-24
 * @author: Goku <xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Form, Button, Input, Row, Col, Tabs, Tooltip } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';

import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
  style: { width: '100%' },
};
const FormItem = Form.Item;
const { TabPane } = Tabs;
@connect(({ bidHall, loading }) => ({
  bidHall,
  organizationId: getCurrentOrganizationId(),
  fetchPricingCenterModalLoading: loading.effects['bidHall/fetchQueryCenterPopData'], // 核价中心弹窗数据源
  SavePricingModalSheetLoading: loading.effects['bidHall/fetchSaveCenterPopData'], // 核价中心弹窗保存
}))
@Form.create({ fieldNameProp: null })
export default class PricingModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      centerPriceSelectedRow: [], // 核价中心弹窗table选择行
      centerPriceSelectedRowKeys: [], // 核价中心弹窗table选择行keys
      activeKey: undefined, // 当前tab key
      selectMap: {}, // 分标段select map
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * @description:表单条件查询
   *
   */
  @Bind()
  handleSearch() {
    const {
      form,
      dispatch,
      organizationId,
      bidHall: { header = {} },
      newList = [],
      sectionFlag = 0,
    } = this.props;
    const { activeKey } = this.state;
    const bidLineItemIds = newList.map((o) => o.bidLineItemId);
    form.validateFields((err, values) => {
      if (!err) {
        // 如果验证成功,则执行onSearch
        dispatch({
          type: 'bidHall/fetchQueryCenterPopData',
          payload: {
            organizationId,
            sectionFlag,
            bidHeaderId: header.bidHeaderId,
            bidLineItemIds,
            ...values,
          },
        }).then((data) => {
          if (data && sectionFlag === 1) {
            const tempMap = {};
            data.forEach((item) => {
              tempMap[`${item.bidLineItemId}`] = {
                selectedRowKeys: [],
                selectedRows: [],
              };
            }); // 以标段id做为key
            this.setState({
              activeKey: activeKey || (data[0] && `${data[0].bidLineItemId}`),
              selectMap: { ...tempMap },
            });
          }
        });
      }
    });
  }

  /**
   * @description:表单重置
   *
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * @description:中心弹窗保存
   *
   */
  @Bind()
  handlePricingSheet() {
    const {
      form,
      dispatch,
      organizationId,
      createItemFlag,
      dicisionAttachmentUuid,
      lineSupplierSaveDTOS = [],
      bidQuotationHeaderDetailDTO = [],
      bidHall: { header = {}, centerPopData = [] },
      sectionFlag = 0,
    } = this.props;
    const { centerPriceSelectedRow = [], selectMap = {} } = this.state;
    form.validateFields((err) => {
      // 没看懂此刻校验form意义!!!
      let data = [];
      if (sectionFlag === 1) {
        // 分标段
        let tempArr = [];
        for (const key of Object.keys(selectMap)) {
          tempArr = [...tempArr, ...selectMap[key].selectedRows];
        }
        const newDataSectionFlag = [];
        for (let i = 0; i < centerPopData.length; i++) {
          if (centerPopData[i].children) {
            newDataSectionFlag.push(...centerPopData[i].children);
          }
          data = isEmpty(tempArr)
            ? getEditTableData(newDataSectionFlag)
            : getEditTableData(tempArr);
        }
      } else {
        data = isEmpty(centerPriceSelectedRow)
          ? getEditTableData(centerPopData)
          : getEditTableData(centerPriceSelectedRow);
      }
      const tempData = sectionFlag === 1 ? lineSupplierSaveDTOS : bidQuotationHeaderDetailDTO; //  获取外层数据源
      if (isEmpty(err) && (createItemFlag === 3 ? !isEmpty(data) : 1)) {
        dispatch({
          type: 'bidHall/fetchSaveCenterPopData',
          payload: {
            organizationId,
            bidHeaderId: header.bidHeaderId,
            paramData:
              sectionFlag === 1
                ? tempData.map((item) => ({
                    ...item,
                    createItemFlag,
                    dicisionAttachmentUuid,
                    bidLineItems: data,
                    bidHeaderId: header.bidHeaderId,
                  }))
                : [
                    {
                      createItemFlag,
                      dicisionAttachmentUuid,
                      bidLineItems: data,
                      bidHeaderId: header.bidHeaderId,
                      bidQuotationHeaderDetailDTO: tempData,
                    },
                  ],
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/ssrc/bid-hall/list`,
              })
            );
          }
        });
      }
    });
  }

  /**
   * 保存前预处理数据
   */
  @Bind()
  handleDealDataBeforeSave() {
    const {
      activeKey,
      bidHall: { aloneItemLine = {}, aloneSupplierItemLine = {} },
    } = this.props;
    // 保存时判断当前tabkey的位置
    let paramsData = [];
    if (activeKey === 'itemLine') {
      paramsData =
        aloneItemLine &&
        Object.values(aloneItemLine).reduce(
          (prev, current) => prev.concat(getEditTableData(current.list)),
          []
        );
    } else if (activeKey === 'supplierLine') {
      paramsData =
        aloneSupplierItemLine &&
        Object.values(aloneSupplierItemLine).reduce(
          (prev, current) => prev.concat(getEditTableData(current.list)),
          []
        );
    }
    return paramsData;
  }

  /**
   * @description: 中心弹窗表格选择行绑定
   *
   */
  @Bind()
  handleCenterPricRowSelectChange(selectedRowKeys, selectedRows) {
    const { sectionFlag = 0 } = this.props;
    const { activeKey, selectMap = {} } = this.state;
    if (sectionFlag === 1) {
      // 分标段
      this.setState({
        selectMap: {
          ...selectMap,
          [`${activeKey}`]: {
            selectedRowKeys,
            selectedRows,
          },
        },
      });
    } else {
      this.setState({
        centerPriceSelectedRow: selectedRows,
        centerPriceSelectedRowKeys: selectedRowKeys,
      });
    }
  }

  /**
   * 改变物料编码-获取物品描述、单位、双单位、单位转换率
   */
  @Bind()
  changeItemId(val, dataList, record) {
    const { itemCategoryId } = record;
    record.$form.setFieldsValue({
      itemId: dataList.partnerItemId,
      itemName: dataList.itemName,
      itemCode: dataList.itemCode,
    });
    if (!itemCategoryId) {
      record.$form.setFieldsValue({
        itemCategoryId: dataList.categoryId,
        itemCategoryName: dataList.categoryName,
      });
    }
    // TODO - 后续和产品确认
    // if (!ouId) {
    //   record.$form.setFieldsValue({
    //     ouId: dataList.ouId,
    //     ouName: dataList.ouName,
    //   });
    // }
    // if (!invOrganizationId) {
    //   record.$form.setFieldsValue({
    //     invOrganizationId: dataList.invOrganizationId,
    //     invOrganizationName: dataList.invOrganizationName,
    //   });
    // }
  }

  /**
   * 浮动文字tabs
   */
  @Bind()
  renderTooTipTabs = (item) => {
    return (
      <Tooltip title={`${item.sectionNum}--${item.sectionName}`} placement="topLeft">
        {item.sectionName}
      </Tooltip>
    );
  };

  /**
   * 切换标段tabs,
   * void
   * @memberof Update
   */
  @Bind()
  changeTab(key) {
    this.setState({
      activeKey: `${key}`,
    });
  }

  /**
   * 渲染分标段table数据
   * @param {!Object} tableProps - 表格props
   */
  @Bind()
  handleRenderSectionTable(tableProps = {}) {
    const {
      bidHall: { centerPopData = [] },
    } = this.props;
    const { activeKey, selectMap = {} } = this.state;
    return (
      <Tabs onChange={this.changeTab} animated={false} activeKey={activeKey}>
        {/* 循环标段数据,渲染tabs标段 */}
        {centerPopData &&
          centerPopData.map((item) => {
            return (
              <TabPane tab={this.renderTooTipTabs(item)} key={item.bidLineItemId}>
                <EditTable
                  {...tableProps}
                  dataSource={item.children}
                  rowSelection={{
                    selectedRows: selectMap[`${item.bidLineItemId}`]
                      ? selectMap[`${item.bidLineItemId}`].selectedRows
                      : [],
                    selectedRowKeys: selectMap[`${item.bidLineItemId}`]
                      ? selectMap[`${item.bidLineItemId}`].selectedRowKeys
                      : [],
                    onChange: this.handleCenterPricRowSelectChange,
                  }}
                />
              </TabPane>
            );
          })}
      </Tabs>
    );
  }

  render() {
    const {
      createItemFlag,
      onCancel,
      visible,
      title,
      fetchPricingCenterModalLoading,
      SavePricingModalSheetLoading,
      bidHall: { centerPopData = [] },
      form: { getFieldDecorator },
      header = {},
      sectionFlag = 0,
    } = this.props;
    const { centerPriceSelectedRow = [], centerPriceSelectedRowKeys = [] } = this.state;
    const centerPriceRowSelection = {
      selectedRows: centerPriceSelectedRow,
      selectedRowKeys: centerPriceSelectedRowKeys,
      onChange: this.handleCenterPricRowSelectChange,
    };
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidLineItemNum`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 50,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {createItemFlag === 1
                ? record.$form.getFieldDecorator('itemCode', {
                    initialValue: val,
                    rules: [
                      {
                        required: false,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
                        }),
                      },
                      {
                        max: 500,
                        message: intl.get('hzero.common.validation.max', {
                          max: 500,
                        }),
                      },
                    ],
                  })(<Input inputChinese={false} />)
                : record.$form.getFieldDecorator('itemId', {
                    initialValue: record.itemId,
                    rules: [
                      {
                        required: createItemFlag === 3, // 必须补充物料编码, 需要必输
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SSRC.NEW_CUSTOMER_ITEM"
                      textValue={record.itemCode}
                      onChange={(value, dataList) => this.changeItemId(value, dataList, record)}
                      queryParams={{
                        // invOrganizationId: record.invOrganizationId,
                        // ouId: record.ouId,
                        companyId: header.companyId,
                      }}
                    />
                  )}
              {(createItemFlag === 2 || createItemFlag === 3) &&
                record.$form.getFieldDecorator('itemCode', { initialValue: record.itemCode })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {createItemFlag === 1
                ? val
                : record.$form.getFieldDecorator('itemName', {
                    initialValue: val,
                  })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCategoryName`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {createItemFlag === 1
                ? val
                : val ||
                  record.$form.getFieldDecorator('itemCategoryName', {
                    initialValue: val,
                  })(<Input disabled />)}
              {(createItemFlag === 2 || createItemFlag === 3) &&
                !val &&
                record.$form.getFieldDecorator('itemCategoryId', {
                  initialValue: record.itemCategoryId,
                })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
    ];
    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0))) + 180;
    const editTableProps = {
      columns,
      bordered: true,
      pagination: false,
      scroll: { x: scrollX },
      rowKey: 'bidLineItemId',
      loading: fetchPricingCenterModalLoading,
    };

    return (
      <Form>
        <Modal
          destroyOnClose
          title={
            <div style={{ display: 'flex' }}>
              <span>{title}</span>
              <div style={{ marginLeft: '24px', color: '#ffbc00' }}>
                <span>
                  {createItemFlag === 1
                    ? intl
                        .get(`ssrc.bidHall.model.bidHall.choiceCreateItem`)
                        .d('选择要创建编码的物料，提交后不可更改!')
                    : intl
                        .get(`ssrc.bidHall.model.bidHall.choiceUpdateItem`)
                        .d('选择要补充编码的物料，提交后不可更改!')}
                </span>
              </div>
            </div>
          }
          visible={visible}
          onCancel={onCancel}
          width={1000}
          footer={
            <React.Fragment>
              <Button type="default" onClick={onCancel}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
              <Button
                type="primary"
                loading={SavePricingModalSheetLoading}
                onClick={this.handlePricingSheet}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </React.Fragment>
          }
        >
          <div className="table-list-search">
            <Form layout="inline" className="more-fields-form">
              <Row gutter={24}>
                <Col span={18}>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get(`ssrc.bidHall.model.bidHall.itemCategoryName`)
                          .d('物品分类')}
                      >
                        {getFieldDecorator('itemCategoryName')(<Input />)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl.get(`ssrc.bidHall.model.bidHall.ouName`).d('业务实体')}
                      >
                        {getFieldDecorator('ouName')(<Input />)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get(`ssrc.bidHall.model.bidHall.invOrganizationName`)
                          .d('库存组织')}
                      >
                        {getFieldDecorator('invOrganizationName')(<Input />)}
                      </FormItem>
                    </Col>
                  </Row>
                </Col>
                <Col span={6}>
                  <Row>
                    <Col span={24} className="search-btn-more">
                      <FormItem>
                        <Button onClick={this.handleFormReset}>
                          {intl.get('hzero.common.button.reset').d('重置')}
                        </Button>
                        <Button
                          style={{ marginLeft: 8 }}
                          type="primary"
                          htmlType="submit"
                          onClick={this.handleSearch}
                        >
                          {intl.get('hzero.common.button.search').d('查询')}
                        </Button>
                      </FormItem>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Form>
          </div>
          {sectionFlag === 1 && this.handleRenderSectionTable(editTableProps)}
          {sectionFlag === 0 && (
            <EditTable
              {...editTableProps}
              dataSource={centerPopData}
              rowSelection={centerPriceRowSelection}
            />
          )}
        </Modal>
      </Form>
    );
  }
}
