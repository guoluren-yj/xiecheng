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
import { isEmpty, sum, isNumber, noop, compose } from 'lodash';
import { Bind } from 'lodash-decorators';

import { SRM_SSRC } from '_utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getActiveTabKey } from 'utils/menuTab';
import { getCurrentOrganizationId, getEditTableData, getDateTimeFormat } from 'utils/utils';
import EditTable from '_components/EditTable';
import Lov from 'components/Lov';
import { useModal } from 'components/Import';

import CombineComponent from '@/routes/components/CombineComponent';
import { INQUIRY, INQUIRY_HALL_LOWERCASE } from '@/utils/globalVariable';
import styles from './index.less';

const modelNameVar = INQUIRY_HALL_LOWERCASE;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
  style: { width: '100%' },
};
const FormItem = Form.Item;
const openModal = useModal()?.openModal;
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
   * 查询 - [立讯精密] 二开, 请谨慎修改!!!
   * @description:表单条件查询
   * @protected
   */
  @Bind()
  handleSearch(page) {
    const {
      form,
      dispatch,
      sourceKey = INQUIRY,
      organizationId,
      headerValue = {},
      modelName = 'inquiryHall',
      remote,
      bidFlag = false,
      cuxHiddenPriceModalSubmitBtnFlag = false,
    } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const cuxSearchParams = remote
          ? remote.process(
              'SSRC_CHECK_PRICE_PROCESS_CHECKED_SECTION_LIST_PRICE_MODAL_SEARCH_PARAMS',
              {},
              { bidFlag, cuxHiddenPriceModalSubmitBtnFlag }
            )
          : {};
        // 如果验证成功,则执行onSearch
        dispatch({
          type: `${modelName}/fetchCenterPopData`,
          payload: {
            organizationId,
            rfxHeaderId: headerValue.rfxHeaderId,
            page,
            ...values,
            customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD`,
            ...(cuxSearchParams || {}),
          },
        }).then((res = []) => {
          const selectedRowKeysArr = [];
          const selectedRowsArr = [];
          // eslint-disable-next-line no-unused-expressions
          (res || [])?.forEach((item) => {
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
   * 提交数据 - [九坤] 二开调用
   * @protected
   */
  @Bind()
  submitData() {
    const {
      form,
      dispatch,
      activeKey,
      organizationId,
      supplierLineListNode,
      checkAttachmentUuid,
      createItemFlag,
      modelName = 'inquiryHall',
      [modelName]: { itemLine = [], supplierLine = [], centerPopData = [] },
      sectionInfo,
      headerValue,
      costRemarkValue,
      supplierDynamicParams,
      resetPolicyDefault = () => {},
      quoteLineDs,
      generateNewPath = () => {},
      getCurrentEditTableData = noop,
      validateItemLinesDs = noop,
      validateSupplierLinesDs = noop,
      priceModalBatchSelectionStrategy = '',
      remote,
      sourceKey = INQUIRY,
      itemLineListNode,
    } = this.props;
    form.validateFields(async (err, values) => {
      const itemQuoteLineParams = getCurrentEditTableData('itemLine');
      const supplierQuoteLineParams = getCurrentEditTableData('supplierLine');

      // const centerPopData = centerPopData ;

      const newData = getEditTableData(centerPopData);
      const pathname = `${getActiveTabKey()}/list`;
      if (isEmpty(err) && (createItemFlag === 3 ? !isEmpty(newData) : 1)) {
        let sectionData = {};
        if (!isEmpty(sectionInfo)) {
          const sectionChecked = sectionInfo.getCheckedSectionList() || [];
          sectionData = {
            allProjectLineSectionList:
              sectionInfo.getAllSectionList && sectionInfo.getAllSectionList(),
            projectLineSectionList: remote
              ? remote.process(
                  'SSRC_CHECK_PRICE_PROCESS_CHECKED_SECTION_LIST_PRICE_MODAL_PARAMS',
                  sectionChecked,
                  { sectionInfo }
                )
              : sectionChecked,
          };
        }

        const directionPage = async () => {
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
        };

        if (activeKey === 'itemLine') {
          // 校验物品表格行
          const validateFlag = await validateItemLinesDs();
          if (!validateFlag) {
            notification.warning({
              message: intl.get(`ssrc.inquiryHall.model.inquiryHall.required`).d('请填写必填项！'),
            });
            return;
          }
          const checkPriceDTOLineList = itemLine.map((item) => {
            return {
              quotationLineList: itemQuoteLineParams
                // eslint-disable-next-line
                .filter((ele) => ele.rfxLineItemId == item.rfxLineItemId),
              rfxLineItemId: item.rfxLineItemId,
              rfxLineItemNum: item.rfxLineItemNum,
              selectionStrategy: item.selectionStrategy,
              objectVersionNumber: item.objectVersionNumber,
              type: 'ITEM',
            };
          });
          const ItemData = {
            ...headerValue,
            ...costRemarkValue,
            ...sectionData,
            organizationId,
            createItemFlag,
            rfxLineItemList: newData,
            checkAttachmentUuid,
            checkPriceDTOLineList: remote
              ? remote.process(
                  'SSRC_CHECK_PRICE_PROCESS_ITEM_LINE_LINE_LIST',
                  checkPriceDTOLineList,
                  {
                    itemLineListNode,
                    itemLine,
                    itemQuoteLineParams,
                  }
                )
              : checkPriceDTOLineList,
            rfxHeaderId: headerValue.rfxHeaderId,
            objectVersionNumber: headerValue.objectVersionNumber,
            rfxLineItemDTO: values,
            customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL,SSRC.${sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${sourceKey}_HALL_CHECK_PRICE.COST,SSRC.${sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD`,
            batchSelectionStrategy: priceModalBatchSelectionStrategy,
          };
          dispatch({
            type: `${modelName}/prcingSaveSheet`,
            payload: ItemData,
          }).then(async (res) => {
            if (res) {
              // cux event
              if (remote?.event) {
                const eventProps = {
                  res,
                  dispatch,
                  eventName: 'prcingSaveSheet',
                  modelName,
                  directionPage,
                  data: ItemData,
                  codeLessSubmit: () => {
                    notification.success();
                    directionPage();
                  },
                };

                remote.event.fireEvent('afterSubmitCheckPriceCodelessItem', eventProps);
                return;
              }

              notification.success();
              directionPage();
            }
          });
        } else if (activeKey === 'supplierLine') {
          const validateFlag = await validateSupplierLinesDs();
          if (!validateFlag) {
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
              rfxLineSupplierId: item.rfxLineSupplierId,
              supplierTenantId: item.supplierTenantId,
              wholeSuggestFlag:
                item.rfxLineSupplierId &&
                supplierLineListNode?.props?.form?.getFieldValue(`value#${item.rfxLineSupplierId}`)
                  ? 1
                  : 0,
              quotationHeaderId: item.quotationHeaderId,
            };
          });
          const SupplierData = {
            ...headerValue,
            ...costRemarkValue,
            ...sectionData,
            organizationId,
            rfxLineItemList: newData,
            checkAttachmentUuid,
            checkPriceDTOLineList,
            rfxHeaderId: headerValue.rfxHeaderId,
            rfxLineItemDTO: values,
            objectVersionNumber: headerValue.objectVersionNumber,
            customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER,SSRC.${sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${sourceKey}_HALL_CHECK_PRICE.COST,SSRC.${sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD`,
            batchSelectionStrategy: priceModalBatchSelectionStrategy,
            ...supplierDynamicParams,
          };
          dispatch({
            type: `${modelName}/prcingSaveSheet`,
            payload: SupplierData,
          }).then(async (res) => {
            if (res) {
              if (remote?.event) {
                const eventProps = {
                  res,
                  dispatch,
                  modelName,
                  eventName: 'prcingSaveSheet',
                  directionPage,
                  data: SupplierData,
                  resetPolicyDefault,
                  codeLessSubmit: () => {
                    notification.success();
                    resetPolicyDefault();
                    directionPage();
                  },
                };

                remote.event.fireEvent('afterSubmitCheckPriceCodelessSupplier', eventProps);
                return;
              }

              notification.success();
              resetPolicyDefault();
              directionPage();
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
            const QuotationData = {
              ...headerValue,
              ...costRemarkValue,
              ...sectionData,
              organizationId,
              rfxLineItemList: newData,
              checkAttachmentUuid,
              checkPriceDTOLineList,
              rfxLineItemDTO: values,
              rfxHeaderId: headerValue.rfxHeaderId,
              objectVersionNumber: headerValue.objectVersionNumber,
              customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL,SSRC.${sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${sourceKey}_HALL_CHECK_PRICE.COST,SSRC.${sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD`,
              batchSelectionStrategy: priceModalBatchSelectionStrategy,
            };
            dispatch({
              type: `${modelName}/prcingSaveSheet`,
              payload: QuotationData,
            }).then(async (res) => {
              if (res) {
                if (remote?.event) {
                  const eventProps = {
                    res,
                    dispatch,
                    modelName,
                    eventName: 'prcingSaveSheet',
                    directionPage,
                    data: QuotationData,
                    resetPolicyDefault,
                    codeLessSubmit: () => {
                      notification.success();
                      directionPage();
                    },
                  };

                  remote.event.fireEvent('afterSubmitCheckPriceCodelessSupplier', eventProps);
                  return;
                }
                notification.success();
                directionPage();
              }
            });
          }
        }
      }
    });
  }

  /**
   * 中心弹窗提交 - [九坤/立讯精密] 二开, 请谨慎修改!!! ps: 为了规避, Bind修改后, 二开无法在重写方法中, 直接通过super调用, 所以在外面包裹一层
   * @protected
   */
  @Bind()
  handlePricingSheet() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      remote,
      [modelName]: { centerPopData = [] },
    } = this.props;

    const data = getEditTableData(centerPopData);
    const eventProps = {
      data,
      submitData: this.submitData,
    };
    if (remote?.event) {
      remote.event.fireEvent('handlePricingSheet', eventProps);
    } else {
      return this.submitData();
    }
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
      supplierLineListNode,
      checkAttachmentUuid,
      createItemFlag,
      modelName = 'inquiryHall',
      [modelName]: { itemLine = [], supplierLine = [], centerPopData = [] },
      sectionInfo,
      headerValue,
      costRemarkValue,
      supplierDynamicParams,
      quoteLineDs,
      getCurrentEditTableData = noop,
      validateItemLinesDs = noop,
      validateSupplierLinesDs = noop,
    } = this.props;
    form.validateFields(async (err) => {
      const itemQuoteLineParams = getCurrentEditTableData('itemLine');
      const supplierQuoteLineParams = getCurrentEditTableData('supplierLine');

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
          rfxLineItemList: newData,
          checkAttachmentUuid,
          rfxHeaderId: headerValue.rfxHeaderId,
          objectVersionNumber: headerValue.objectVersionNumber,
        };

        if (activeKey === 'itemLine') {
          // 校验物品表格行
          const validateFlag = await validateItemLinesDs();
          if (!validateFlag) {
            notification.warning({
              message: intl.get(`ssrc.inquiryHall.model.inquiryHall.required`).d('请填写必填项！'),
            });
            return;
          }
          const checkPriceDTOLineList = itemLine.map((item) => {
            return {
              quotationLineList: itemQuoteLineParams
                // eslint-disable-next-line
                .filter((ele) => ele.rfxLineItemId == item.rfxLineItemId),
              rfxLineItemId: item.rfxLineItemId,
              rfxLineItemNum: item.rfxLineItemNum,
              selectionStrategy: item.selectionStrategy,
              objectVersionNumber: item.objectVersionNumber,
              type: 'ITEM',
            };
          });
          dispatch({
            type: `${modelName}/pricingChangePageSave`,
            payload: {
              ...commonParams,
              checkPriceDTOLineList,
              customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL,SSRC.${sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD`,
            },
          }).then(() => callBack());
        } else if (activeKey === 'supplierLine') {
          const validateFlag = await validateSupplierLinesDs();
          if (!validateFlag) {
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
              rfxLineSupplierId: item.rfxLineSupplierId,
              supplierTenantId: item.supplierTenantId,
              wholeSuggestFlag:
                item.rfxLineSupplierId &&
                supplierLineListNode?.props?.form?.getFieldValue(`value#${item.rfxLineSupplierId}`)
                  ? 1
                  : 0,
              quotationHeaderId: item.quotationHeaderId,
            };
          });
          return dispatch({
            type: `${modelName}/pricingChangePageSave`,
            payload: {
              ...commonParams,
              checkPriceDTOLineList,
              customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER,SSRC.${sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD`,
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
              type: `${modelName}/pricingChangePageSave`,
              payload: {
                ...commonParams,
                checkPriceDTOLineList,
                customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL,SSRC.${sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD`,
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

  /**
   * 获取表格列 - [屈臣氏] 二开, 请谨慎修改!!!
   * @protected
   */
  getColumns(createItemFlag, header) {
    return [
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
                        from: 'RFX_CHECK_APPEND_ITEM_CODE',
                        templateNum: header.templateNum,
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
                  initialValue: record.snapItemCategoryId || record.itemCategoryId,
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
  }

  /**
   * 渲染标题 - [屈臣氏] 二开, 请谨慎修改!!!
   * @protected
   */
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

  /**
   * 获取表格勾选框props - [屈臣氏] 二开, 请谨慎修改!!!
   * @protected
   */
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
  handleImport() {
    const {
      organizationId,
      headerValue: { rfxHeaderId },
      sourceKey = INQUIRY,
      title,
      modelName = 'inquiryHall',
      [modelName]: { centerPopData = [] },
    } = this.props;
    const importProps = {
      businessObjectTemplateCode: 'SSRC.RFX_CHECK_CREATE_ITEM.IMPORT',
      prefixPatch: SRM_SSRC,
      tenantId: organizationId,
      args: {
        tenantId: organizationId,
        organizationId,
        rfxHeaderId,
        templateCode: 'SSRC.RFX_CHECK_CREATE_ITEM.IMPORT',
        fromExport: true,
      },
      auto: true,
      refreshButton: true,
      action: title,
      customeImportTemplate: {
        templateCode: 'SRM_C_SRM_SSRC_RFX_CHECK_CREATE_ITEM_DOWNLOAD_EXPORT',
        requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/check/create-item/template/export`,
        queryParams: {
          tenantId: organizationId,
          organizationId,
          rfxHeaderId,
          customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD`,
        },
        queryArea: { fillerType: 'multi-sheet', async: false },
      },
      successCallBack: () => {
        if (!isEmpty(centerPopData)) {
          centerPopData.forEach((item) => {
            // eslint-disable-next-line no-unused-expressions
            item?.$form?.resetFields();
          });
        }
        this.handleSearch();
      },
    };
    openModal(importProps);
  }

  render() {
    const {
      createItemFlag,
      onCancel,
      visible,
      title,
      headerValue = {},
      sourceKey = INQUIRY,
      fetchPricingCenterModalLoading,
      SavePricingModalSheetLoading,
      modelName = 'inquiryHall',
      [modelName]: { centerPopData = [], centerPopDataPagination = {} },
      form: { getFieldDecorator },
      customizeTable = noop,
      remote,
      bidFlag = false,
      cuxHiddenPriceModalSubmitBtnFlag = false,
    } = this.props;
    const { selectedRowsArr } = this.state;
    const columns = this.getColumns(createItemFlag, headerValue);
    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0))) + 180;
    const tableProps = {
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

    const editTableProps = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_CHECKED_PRICE_MODAL_TABLE_PROPS', tableProps, {
          selectedRowsArr,
          onChangePagination: this.onChangePagination,
          bidFlag,
          customValidateTableData: this.customValidateTableData,
          compProps: this.props,
          handleSearch: this.handleSearch,
          formatDate: this.formatDate,
          centerPopDataPagination,
        })
      : tableProps;

    const cuxModalProps = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_PROCESS_PRICE_MODAL_PROPS',
          {},
          {
            cuxHiddenPriceModalSubmitBtnFlag,
            title,
          }
        )
      : {};

    return (
      <Modal
        destroyOnClose
        title={
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '110px' }}>{title}</span>
            {this.renderTooltip(createItemFlag)}
          </div>
        }
        zIndex={900}
        visible={visible}
        onCancel={onCancel}
        className={styles.footerline}
        width={1000}
        footer={
          <React.Fragment>
            {remote
              ? remote.render('SSRC_CHECK_PRICE_RENDER_PRICE_MODAL_FOOTER_BUTTON', null, {
                  selectedRowsArr,
                  onChangePagination: this.onChangePagination,
                  bidFlag,
                  customValidateTableData: this.customValidateTableData,
                  compProps: this.props,
                  handleSearch: this.handleSearch,
                  formatDate: this.formatDate,
                  centerPopDataPagination,
                })
              : null}
            <Button type="default" onClick={onCancel}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button onClick={this.handleImport}>
              {intl.get('ssrc.inquiryHall.view.excelImport').d('Excel导入')}
            </Button>
            {!cuxHiddenPriceModalSubmitBtnFlag ? (
              <Button
                type="primary"
                loading={SavePricingModalSheetLoading || fetchPricingCenterModalLoading}
                onClick={this.handlePricingSheet}
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>
            ) : (
              ''
            )}
          </React.Fragment>
        }
        {...(cuxModalProps || {})}
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
    CombineComponent({
      modelName: modelNameVar,
    }),
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      organizationId: getCurrentOrganizationId(),
      fetchPricingCenterModalLoading: loading.effects[`${modelNameVar}/fetchCenterPopData`], // 核价中心弹窗数据源
      SavePricingModalSheetLoading: loading.effects[`${modelNameVar}/prcingSaveSheet`], // 核价中心弹窗保存
    })),
    Form.create({ fieldNameProp: null })
  )(com);

export { HocFunc, PricingModal };
export default HocFunc(PricingModal);
