/*
 * PricingModal - 寻源服务/核价页面中心弹窗
 * @Date: 2019-10-24 09:25:22
 * @WJH <jianhua.wang01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Form, Button, Input, Row, Col, Checkbox } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty, sum, isNumber, compose } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getActiveTabKey } from 'utils/menuTab';
import { getCurrentOrganizationId, getEditTableData, getDateTimeFormat } from 'utils/utils';
import EditTable from '_components/EditTable';
import Lov from 'components/Lov';

import styles from './index.less';
import { INQUIRY } from '@/utils/globalVariable';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
  style: { width: '100%' },
};
const FormItem = Form.Item;
class PricingModal extends PureComponent {
  state = {
    selectedRowKeysArr: [],
    selectedRowsArr: [],
  };

  // 已使用纯组件, 尽管props没有扁平化处理, 也不会影响性能
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * @description:表单条件查询
   *
   */
  @Bind()
  handleSearch(page) {
    const {
      form,
      dispatch,
      sourceKey = INQUIRY,
      organizationId,
      inquiryHall: { header = {} },
    } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        // 如果验证成功,则执行onSearch
        dispatch({
          type: 'inquiryHall/fetchCenterPopData',
          payload: {
            organizationId,
            rfxHeaderId: header.rfxHeaderId,
            page,
            ...values,
            customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD`,
          },
        }).then((res) => {
          const selectedRowKeysArr = [];
          const selectedRowsArr = [];
          res.forEach((item) => {
            if (item.checkFlag) {
              selectedRowKeysArr.push(item.rfxLineItemId);
              selectedRowsArr.push(item);
            }
          });
          this.setState({ selectedRowKeysArr, selectedRowsArr });
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

  // 手动校验数据
  customValidateTableData(tableData = []) {
    let err = 0;
    if (isEmpty(tableData)) {
      return err;
    }

    tableData.forEach((data) => {
      if (!data.$form) {
        return;
      }
      data.$form.validateFields((error) => {
        if (!isEmpty(error)) {
          err = 1;
        }
      });
    });

    return err;
  }

  formatDate = (item = {}) => {
    if (!item || isEmpty(item)) {
      return {};
    }

    const { validExpiryDateFrom = null, validExpiryDateTo = null } = item;
    const DateTimeFormat = getDateTimeFormat();

    return {
      validExpiryDateFrom:
        validExpiryDateFrom && validExpiryDateFrom?.format
          ? validExpiryDateFrom.format(DateTimeFormat)
          : validExpiryDateFrom,
      validExpiryDateTo:
        validExpiryDateTo && validExpiryDateTo?.format
          ? validExpiryDateTo.format(DateTimeFormat)
          : validExpiryDateTo,
    };
  };

  /**
   * @description:中心弹窗提交
   * @overide 九坤
   */
  @Bind()
  handlePricingSheet() {
    const {
      form,
      dispatch,
      activeKey,
      organizationId,
      itemLineListNode,
      checkAttachmentUuid,
      createItemFlag,
      inquiryHall: {
        header = {},
        itemLine = [],
        supplierLine = [],
        itemQuoteLine = [],
        supplierQuoteLine = [],
        centerPopData = [],
      },
      sectionInfo,
      headerValue,
      costRemarkValue,
      supplierDynamicParams,
      resetPolicyDefault = () => {},
      quoteLineDs,
      generateNewPath = () => {},
      getCurrentCustomeCode = () => {},
    } = this.props;
    form.validateFields(async (err, values) => {
      let itemQuoteLineParams = [];
      itemQuoteLineParams =
        itemQuoteLine &&
        getEditTableData(itemQuoteLine, ['quotationLineId'], { force: true }).map((item) => {
          const itemDateTime = this.formatDate(item);
          return {
            ...item,
            ...itemDateTime,
          };
        });
      let supplierQuoteLineParams = [];
      supplierQuoteLineParams =
        supplierQuoteLine &&
        getEditTableData(supplierQuoteLine, ['quotationLineId'], { force: true }).map((item) => {
          const supplierDateTime = this.formatDate(item);
          return {
            ...item,
            ...supplierDateTime,
          };
        });
      const { costRemark = undefined, totalCost = undefined } = values;

      // const centerPopData = centerPopData ;

      const newData = getEditTableData(centerPopData);
      const pathname = `${getActiveTabKey()}/list`;
      if (isEmpty(err) && (createItemFlag === 3 ? !isEmpty(newData) : 1)) {
        let sectionData = {};
        if (!isEmpty(sectionInfo)) {
          sectionData = {
            allProjectLineSectionList:
              sectionInfo.getAllSectionList && sectionInfo.getAllSectionList(),
            projectLineSectionList: sectionInfo.getCheckedSectionList(),
          };
        }

        if (activeKey === 'itemLine') {
          // 校验物品表格行
          if (isEmpty(itemQuoteLine) || !isEmpty(itemQuoteLineParams)) {
            const checkPriceDTOLineList = itemLine.map((item) => {
              return {
                quotationLineList: itemQuoteLineParams
                  // eslint-disable-next-line
                  .filter((ele) => ele.rfxLineItemId == item.rfxLineItemId),
                rfxLineItemId: item.rfxLineItemId,
                selectionStrategy: itemLineListNode.props.form.getFieldValue(
                  `value#${item.rfxLineItemId}`
                ),
                objectVersionNumber: item.objectVersionNumber,
                type: 'ITEM',
              };
            });
            dispatch({
              type: 'inquiryHall/prcingSaveSheet',
              payload: {
                ...headerValue,
                ...costRemarkValue,
                ...sectionData,
                organizationId,
                createItemFlag,
                costRemark,
                totalCost,
                rfxLineItemList: newData,
                checkAttachmentUuid,
                checkPriceDTOLineList,
                rfxHeaderId: header.rfxHeaderId,
                objectVersionNumber: header.objectVersionNumber,
                rfxLineItemDTO: values,
                customizeUnitCode: getCurrentCustomeCode(true),
              },
            }).then(async (res) => {
              if (res) {
                notification.success();
                const newPath = await generateNewPath();
                if (newPath) {
                  dispatch(
                    routerRedux.replace({
                      pathname: newPath.pathname,
                      search: newPath.search,
                    })
                  );
                  return;
                }
                dispatch(
                  routerRedux.push({
                    pathname,
                  })
                );
              }
            });
          }
        } else if (activeKey === 'supplierLine') {
          const SupplierQuoteLineParamsFlag = this.customValidateTableData(supplierQuoteLine);
          if (
            !isEmpty(supplierQuoteLine) &&
            isEmpty(supplierQuoteLineParams) &&
            SupplierQuoteLineParamsFlag
          ) {
            notification.warning({
              message: intl.get(`ssrc.inquiryHall.model.inquiryHall.required`).d('请填写必填项！'),
            });
            return;
          }

          const checkPriceDTOLineList = supplierLine.map((item) => {
            return {
              quotationLineList: supplierQuoteLineParams
                // eslint-disable-next-line
                .filter((r) => r.rfxLineSupplierId == item.rfxLineSupplierId),
              supplierName: item.supplierCompanyName,
              type: 'SUPPLIER',
            };
          });
          dispatch({
            type: 'inquiryHall/prcingSaveSheet',
            payload: {
              ...headerValue,
              ...costRemarkValue,
              ...sectionData,
              organizationId,
              costRemark,
              totalCost,
              rfxLineItemList: newData,
              checkAttachmentUuid,
              checkPriceDTOLineList,
              rfxHeaderId: header.rfxHeaderId,
              rfxLineItemDTO: values,
              objectVersionNumber: header.objectVersionNumber,
              customizeUnitCode: getCurrentCustomeCode(true),
              ...supplierDynamicParams,
            },
          }).then(async (res) => {
            if (res) {
              notification.success();
              resetPolicyDefault();
              const newPath = await generateNewPath();
              if (newPath) {
                dispatch(
                  routerRedux.replace({
                    pathname: newPath.pathname,
                    search: newPath.search,
                  })
                );
                return;
              }
              dispatch(
                routerRedux.push({
                  pathname,
                })
              );
            }
          });
        } else {
          let quoteLineParams = [];
          let newQuoteLine = [];
          if (await quoteLineDs.validate()) {
            newQuoteLine = quoteLineDs.toData();
          }
          quoteLineParams = newQuoteLine.map((item) => {
            const dateTime = this.formatDate(item);
            if (item.suggestedFlag) {
              return { ...item, selectionStrategy: 'RECOMMENDATION', ...dateTime };
            } else {
              return { ...item, selectionStrategy: null, ...dateTime };
            }
          });
          if (quoteLineDs.length === 0 || !isEmpty(quoteLineParams)) {
            const checkPriceDTOLineList = [
              {
                quotationLineList: quoteLineParams,
                type: 'DETAIL',
              },
            ];
            dispatch({
              type: 'inquiryHall/prcingSaveSheet',
              payload: {
                ...headerValue,
                ...costRemarkValue,
                ...sectionData,
                organizationId,
                costRemark,
                totalCost,
                rfxLineItemList: newData,
                checkAttachmentUuid,
                checkPriceDTOLineList,
                rfxLineItemDTO: values,
                rfxHeaderId: header.rfxHeaderId,
                objectVersionNumber: header.objectVersionNumber,
                customizeUnitCode: getCurrentCustomeCode(true),
              },
            }).then(async (res) => {
              if (res) {
                notification.success();
                const newPath = await generateNewPath();
                if (newPath) {
                  dispatch(
                    routerRedux.replace({
                      pathname: newPath.pathname,
                      search: newPath.search,
                    })
                  );
                  return;
                }
                dispatch(
                  routerRedux.push({
                    pathname,
                  })
                );
              }
            });
          }
        }
      }
    });
  }

  /**
   * 没有做优化，需求时间太紧了，先这样，保存和这个保存可以合并并优化重复代码
   * 翻页保存
   */
  @Bind()
  handleChangePageSave(callBack = () => {}) {
    const {
      form,
      dispatch,
      activeKey,
      sourceKey = INQUIRY,
      organizationId,
      itemLineListNode,
      checkAttachmentUuid,
      createItemFlag,
      inquiryHall: {
        header = {},
        itemLine = [],
        supplierLine = [],
        itemQuoteLine = [],
        supplierQuoteLine = [],
        centerPopData = [],
      },
      sectionInfo,
      headerValue,
      costRemarkValue,
      supplierDynamicParams,
      quoteLineDs,
    } = this.props;
    form.validateFields(async (err, values) => {
      let itemQuoteLineParams = [];
      itemQuoteLineParams =
        itemQuoteLine &&
        getEditTableData(itemQuoteLine, ['quotationLineId'], { force: true }).map((item = {}) => {
          const itemDateTime = this.formatDate(item);
          return {
            ...item,
            ...itemDateTime,
          };
        });
      let supplierQuoteLineParams = [];
      supplierQuoteLineParams =
        supplierQuoteLine &&
        getEditTableData(supplierQuoteLine, ['quotationLineId'], { force: true }).map(
          (item = {}) => {
            const supplierDateTime = this.formatDate(item);
            return {
              ...item,
              ...supplierDateTime,
            };
          }
        );
      const { costRemark = undefined, totalCost = undefined } = values;

      const newData = getEditTableData(centerPopData);
      if (isEmpty(err) && (createItemFlag === 3 ? !isEmpty(newData) : 1)) {
        let sectionData = {};
        if (!isEmpty(sectionInfo)) {
          sectionData = {
            allProjectLineSectionList:
              sectionInfo.getAllSectionList && sectionInfo.getAllSectionList(),
            projectLineSectionList: sectionInfo.getCheckedSectionList(),
          };
        }

        const commonParams = {
          ...headerValue,
          ...costRemarkValue,
          ...sectionData,
          organizationId,
          createItemFlag,
          costRemark,
          totalCost,
          rfxLineItemList: newData,
          checkAttachmentUuid,
          rfxHeaderId: header.rfxHeaderId,
          objectVersionNumber: header.objectVersionNumber,
        };

        if (activeKey === 'itemLine') {
          // 校验物品表格行
          if (isEmpty(itemQuoteLine) || !isEmpty(itemQuoteLineParams)) {
            const checkPriceDTOLineList = itemLine.map((item) => {
              return {
                quotationLineList: itemQuoteLineParams
                  // eslint-disable-next-line
                  .filter((ele) => ele.rfxLineItemId == item.rfxLineItemId),
                rfxLineItemId: item.rfxLineItemId,
                selectionStrategy: itemLineListNode.props.form.getFieldValue(
                  `value#${item.rfxLineItemId}`
                ),
                objectVersionNumber: item.objectVersionNumber,
                type: 'ITEM',
              };
            });
            dispatch({
              type: 'inquiryHall/pricingChangePageSave',
              payload: {
                ...commonParams,
                checkPriceDTOLineList,
                customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL,SSRC.${sourceKey}_HALL_CHECK_PRICE.HEADER_INFO`,
              },
            }).then(() => callBack());
          }
        } else if (activeKey === 'supplierLine') {
          const SupplierQuoteLineParamsFlag = this.customValidateTableData(supplierQuoteLine);
          if (
            !isEmpty(supplierQuoteLine) &&
            isEmpty(supplierQuoteLineParams) &&
            SupplierQuoteLineParamsFlag
          ) {
            notification.warning({
              message: intl.get(`ssrc.inquiryHall.model.inquiryHall.required`).d('请填写必填项！'),
            });
            return;
          }

          const checkPriceDTOLineList = supplierLine.map((item) => {
            return {
              quotationLineList: supplierQuoteLineParams
                // eslint-disable-next-line
                .filter((r) => r.rfxLineSupplierId == item.rfxLineSupplierId),
              supplierName: item.supplierCompanyName,
              type: 'SUPPLIER',
            };
          });
          return dispatch({
            type: 'inquiryHall/pricingChangePageSave',
            payload: {
              ...commonParams,
              checkPriceDTOLineList,
              customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER,SSRC.${sourceKey}_HALL_CHECK_PRICE.HEADER_INFO`,
              ...supplierDynamicParams,
            },
          }).then(() => callBack());
        } else {
          let quoteLineParams = [];
          let newQuoteLine = [];
          if (await quoteLineDs.validate()) {
            newQuoteLine = quoteLineDs.toData();
          }
          quoteLineParams = newQuoteLine.map((item) => {
            const dateTime = this.formatDate(item);
            if (item.suggestedFlag) {
              return { ...item, selectionStrategy: 'RECOMMENDATION', ...dateTime };
            } else {
              return { ...item, selectionStrategy: null, ...dateTime };
            }
          });
          if (quoteLineDs.length === 0 || !isEmpty(quoteLineParams)) {
            const checkPriceDTOLineList = [
              {
                quotationLineList: quoteLineParams,
                type: 'DETAIL',
              },
            ];
            return dispatch({
              type: 'inquiryHall/pricingChangePageSave',
              payload: {
                ...commonParams,
                checkPriceDTOLineList,
                customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL,SSRC.${sourceKey}_HALL_CHECK_PRICE.HEADER_INFO`,
              },
            }).then(() => callBack());
          }
        }
      }
    });
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
  }

  @Bind()
  onChangePagination(page) {
    this.handleChangePageSave(() => this.handleSearch(page));
  }

  // 将选择框暴露出来给屈臣氏二开
  @Bind()
  getRowSelection(centerPopData) {
    const { selectedRowKeysArr, selectedRowsArr } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRowKeysArr,
      selectedRows: selectedRowsArr,
      onChange: (key, row) => {
        this.setState({ selectedRowKeysArr: key, selectedRowsArr: row });
      },
      onSelect: (record, value) => {
        if (value) {
          record.$form.setFieldsValue({ checkFlag: 1 });
        } else {
          record.$form.setFieldsValue({ checkFlag: 0 });
        }
      },
      onSelectAll: (selected) => {
        if (selected) {
          centerPopData.forEach((item) => {
            item.$form.setFieldsValue({ checkFlag: 1 });
          });
        } else {
          centerPopData.forEach((item) => {
            item.$form.setFieldsValue({ checkFlag: 0 });
          });
        }
      },
      getCheckboxProps: (record) => {
        return {
          disabled: !['update', 'create'].includes(record._status),
        };
      },
    };
    return rowSelection;
  }

  @Bind()
  getColumns(createItemFlag, header) {
    const columns = [
      // {
      //   // 用于表单注册
      //   width: 0,
      //   dataIndex: 'checkFlag',
      //   render: (val, record) => (
      //     <FormItem>
      //       {record.$form.getFieldDecorator('checkFlag', {
      //         initialValue: val,
      //       })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
      //     </FormItem>
      //   ),
      // },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxLineItemNum`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 70,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        minWidth: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {createItemFlag === 1
                ? record.$form.getFieldDecorator('itemCode', {
                    initialValue: record.snapItemCode || val,
                    rules: [
                      {
                        required: false,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.itemCode`)
                            .d('物料编码'),
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
                    initialValue:
                      record.itemId || record.itemId === 0 ? record.itemId : record.snapItemId,
                    rules: [
                      {
                        required: createItemFlag === 3, // 必须补充物料编码, 需要必输
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.itemCode`)
                            .d('物料编码'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SSRC.NEW_CUSTOMER_ITEM"
                      textValue={record.snapItemCode || record.itemCode}
                      onChange={(value, dataList) => this.changeItemId(value, dataList, record)}
                      queryParams={{
                        // invOrganizationId: record.invOrganizationId,
                        // ouId: record.ouId,
                        companyId: header.companyId,
                      }}
                    />
                  )}
              {(createItemFlag === 2 || createItemFlag === 3) &&
                record.$form.getFieldDecorator('itemCode', {
                  initialValue: record.snapItemCode || record.itemCode,
                })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {createItemFlag === 1
                ? val
                : record.$form.getFieldDecorator('itemName', {
                    initialValue: record.snapItemName || val,
                  })(<Input disabled />)}
              {record.$form.getFieldDecorator('checkFlag', {
                initialValue: record.checkFlag,
              })(<Checkbox checkedValue={1} unCheckedValue={0} style={{ display: 'none' }} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategoryName`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {createItemFlag === 1
                ? val
                : val ||
                  record.$form.getFieldDecorator('itemCategoryName', {
                    initialValue: record.snapItemCategoryName || val,
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
    ];
    return columns;
  }

  // 提示-屈臣氏二开
  renderTooltip(createItemFlag) {
    return (
      <div style={{ color: '#ffbc00' }}>
        <span>
          {createItemFlag === 1
            ? intl
                .get(`ssrc.inquiryHall.model.inquiryHall.choiceCreateItem`)
                .d('选择要创建编码的物料，提交后不可更改!')
            : intl
                .get(`ssrc.inquiryHall.model.inquiryHall.choiceUpdateItem`)
                .d('选择要补充编码的物料，提交后不可更改!')}
        </span>
      </div>
    );
  }

  render() {
    const {
      createItemFlag,
      onCancel,
      visible,
      title,
      sourceKey = INQUIRY,
      fetchPricingCenterModalLoading,
      SavePricingModalSheetLoading,
      inquiryHall: { centerPopData = [], centerPopDataPagination = {} },
      form: { getFieldDecorator },
      header = {},
      customizeTable = () => {},
    } = this.props;

    const columns = this.getColumns(createItemFlag, header);

    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0))) + 180;
    const editTableProps = {
      columns,
      dataSource: centerPopData,
      bordered: true,
      onChange: this.onChangePagination,
      pagination: centerPopDataPagination,
      scroll: { x: scrollX, y: 380 },
      rowKey: 'rfxLineItemId',
      loading: fetchPricingCenterModalLoading,
      rowSelection: this.getRowSelection(centerPopData),
    };

    return (
      <Modal
        destroyOnClose
        title={
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '110px' }}>{title}</span>
            {this.renderTooltip(createItemFlag)}
          </div>
        }
        visible={visible}
        onCancel={onCancel}
        className={styles.footerline}
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
              {intl.get('hzero.common.button.submit').d('提交')}
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
                        .get(`ssrc.inquiryHall.model.inquiryHall.itemCategoryName`)
                        .d('物品分类')}
                    >
                      {getFieldDecorator('itemCategoryName')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`ssrc.inquiryHall.model.inquiryHall.ouName`).d('业务实体')}
                    >
                      {getFieldDecorator('ouName')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`)
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
        {/*  */}
        {customizeTable(
          {
            code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD`,
          },
          <EditTable {...editTableProps} />
        )}
      </Modal>
    );
  }
}

const HocFunc = (com) =>
  compose(
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      organizationId: getCurrentOrganizationId(),
      fetchPricingCenterModalLoading: loading.effects['inquiryHall/fetchCenterPopData'], // 核价中心弹窗数据源
      SavePricingModalSheetLoading: loading.effects['inquiryHall/prcingSaveSheet'], // 核价中心弹窗保存
    })),
    Form.create({ fieldNameProp: null })
  )(com);

export { HocFunc, PricingModal };
export default HocFunc(PricingModal);
