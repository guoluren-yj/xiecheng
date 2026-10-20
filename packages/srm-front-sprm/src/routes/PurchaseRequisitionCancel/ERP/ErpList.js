/*
 * NonErpPurchaseRequisition - 非ERP采购申请
 * @date: 2019-07-16
 * @author: zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, Component } from 'react';
import { Form, Tooltip, Input, DatePicker, Tag } from 'hzero-ui';
import { isNumber, sum, round, isFunction, isEmpty } from 'lodash';
import { NumberField } from 'choerodon-ui/pro';
import moment from 'moment';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { dateTimeRender, dateRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import { numberPrecision } from '@/routes/utils.js';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { PRIVATE_BUCKET } from '_utils/config';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import { Button } from 'components/Permission';
import { fetchQuantity } from '@/services/purchaseRequisitionCreationService';

import abnormal from '@/assets/abnormal.svg';
import PromptModal from '../PromptModal';
import styles from './index.less';

// import styles from './index.less';
const FormItem = Form.Item;

const commonPrompt = 'sprm.common.model.common';
@Form.create({ fieldNameProp: null })
export default class NonErpList extends Component {
  state = {
    promptModalVisible: false,
    promptModalFlag: '',
    selectedRows: [],
    customVisable: false,
    customData: [],
    specsJsonType: 'custom',
  };

  @Bind()
  hideModal(record) {
    const { hideModal } = this.props;
    hideModal(record);
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 取消按钮
   * @memberof Cancel
   */
  @Bind()
  handleCancel() {
    const { selectedRows = [] } = this.state;
    const { dispatch, form, onFetchDetailHeader, onSearch } = this.props;
    const { cancelledRemark } = form.getFieldsValue();
    return dispatch({
      type: 'purchaseRequisitionCancel/cancelPurchase',
      payload: { selectedRows: selectedRows?.map((item) => ({ ...item, cancelledRemark })) },
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRows: [],
        });
        onFetchDetailHeader();
        onSearch();
      }
    });
  }

  /**
   * 气泡
   *
   */
  @Bind()
  popover(record) {
    const content = (
      <div>
        <p>{record.incorrectDate}</p>
        <p>{record.incorrectMsg}</p>
      </div>
    );
    if (record.incorrectFlag === 1) {
      return (
        <Fragment>
          <Tooltip title={content}>
            <span>{record.displayLineNum}</span>
            <img style={{ width: 13, height: 13 }} src={abnormal} alt="img" />
          </Tooltip>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <span>{record.displayLineNum}</span>
        </Fragment>
      );
    }
  }

  /**
   * 获取查询物料的参数
   * @param {物料限定规则} itemLimitRule
   * @param {行记录} record
   */
  @Bind()
  getQueryItemParams(record) {
    const { tenantId } = this.state;
    const { headerInfo, itemLimitRule = [] } = this.props;
    const params = {
      enabledFlag: 1,
      tenantId,
      companyId: headerInfo.companyId,
    };
    // 物料分类
    if (itemLimitRule.find((rule) => rule === 'categoryId')) {
      params.categoryId = record.$form.getFieldValue('categoryId');
    }
    // 库存组织
    if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
      params.invOrganizationId = record.$form.getFieldValue('invOrganizationId');
    }
    return params;
  }

  /**
   * 物料是否可选
   */
  @Bind()
  itemChangeDisabled(isEComAndReject, record) {
    const { itemLimitRule = [] } = this.props;
    if (record.occupyFlag === 1) {
      return true;
    }
    if (isEComAndReject) {
      return true;
    }
    // 物料分类
    if (itemLimitRule.find((rule) => rule === 'categoryId')) {
      const categoryId = record.$form.getFieldValue('categoryId') || record.categoryId;
      if (!categoryId) {
        return true;
      }
    }
    // 库存组织
    if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
      const invOrganizationId = record.$form.getFieldValue('invOrganizationId');
      if (!invOrganizationId) {
        return true;
      }
    }
    return false;
  }

  /*
   * 关闭按钮
   * @memberof Close
   */
  @Bind()
  handleClose() {
    const { selectedRows } = this.state;
    const { dispatch, form, onFetchDetailHeader, onSearch } = this.props;
    const ifCanClose = selectedRows.every((item) =>
      ['SUSPEND', 'ASSIGNED', 'APPROVED'].includes(item.prLineStatusCode)
    );
    if (ifCanClose) {
      const { closedRemark } = form.getFieldsValue();
      return dispatch({
        type: 'purchaseRequisitionCancel/fetchPurchaseLinesClose',
        payload: selectedRows?.map((item) => ({ ...item, closedRemark })),
      }).then((res) => {
        if (res) {
          const { successCounts, failedCounts } = res;
          this.setState({
            selectedRows: [],
          });
          onFetchDetailHeader();
          onSearch();
          notification.success({
            message: intl
              .get(`sprm.purchaseRequisitionCancel.view.message.successAndfailed`, {
                successCounts,
                failedCounts,
              })
              .d(`成功了${successCounts}条，失败了${failedCounts}条`),
          });
        }
      });
    } else {
      notification.warning({
        message: intl
          .get(`sprm.purchaseRequisitionCancel.view.message.confirmCloseWarning`)
          .d('只有已审批、已分配、暂挂状态的采购申请允许关闭'),
      });
    }
  }

  @Bind()
  promptModalHandleOk() {
    const { promptModalFlag } = this.state;
    if (promptModalFlag === 'cancelledRemark') {
      this.handleCancel();
      this.promptModalHandleCancel();
    } else if (promptModalFlag === 'closedRemark') {
      this.handleClose();
      this.promptModalHandleCancel();
    } else if (promptModalFlag === 'sendBackRemark') {
      this.handleSendBack();
      this.promptModalHandleCancel();
    }
  }

  uomNameShow = (code, name) => {
    const { uomCodeAndNameRule = 0 } = this.state;
    return uomCodeAndNameRule ? `${code}/${name}` : name;
  };

  /**
   * 物料改变回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  handleItemOnChange(value, lovRecord, record) {
    const { onChangeListData, dataSource, doubleUintFlag } = this.props;
    const {
      $form: { setFieldsValue, getFieldValue }, // registerField
    } = record;
    const { uomCodeAndNameRule } = this.state;
    const {
      itemName,
      primaryUomId,
      taxId,
      taxCode,
      taxRate,
      uomName,
      uomCode,
      partnerItemId,
      itemAbcClass,
      poLineId, // 订单行id
      lastPurchasePrice, // 上次价格
      specifications, // 规格
      model, // 型号
      chartCode, // 图号
      drawingVersion, // 图号版本
      customMadeFlag,
      orderUomId,
      orderUomName,
      orderUomCode,
      secondaryUomId,
      secondaryUomCode,
      secondaryUomName,
      unitControlEnable,
      uomPrecision,
      orderUomPrecision,
      secondaryUomPrecision,
    } = lovRecord;
    // 业务规则双单位配置》配置中心单位控制〉基本单位
    const secondaryUomIdProps = doubleUintFlag
      ? {
          secondaryUomId,
          secondaryUomCode,
          secondaryUomPrecision,
          secondaryUomCodeAndName: this.uomNameShow(secondaryUomCode, secondaryUomName),
        }
      : {
          secondaryUomId: unitControlEnable ? orderUomId || primaryUomId : primaryUomId,
          secondaryUomCode: unitControlEnable ? orderUomCode || uomCode : uomCode,
          secondaryUomIdMeaning: this.uomNameShow(uomCode, uomName),
          secondaryUomPrecision: unitControlEnable
            ? orderUomPrecision || uomPrecision
            : uomPrecision,
          secondaryUomCodeAndName: unitControlEnable
            ? this.uomNameShow(orderUomCode || uomCode, orderUomName || uomName)
            : this.uomNameShow(uomCode, uomName),
        };
    // registerField('itemId');
    if (value) {
      const listDataSource = dataSource?.map((item) => {
        if (item.prLineId === record.prLineId) {
          return {
            ...item,
            taxRate,
            taxCode,
            uomName: unitControlEnable ? orderUomName || orderUomName : uomName,
            uomCode: unitControlEnable ? orderUomCode || uomCode : uomCode,
            uomCodeAndName: uomCodeAndNameRule ? `${uomCode}/${uomName}` : uomName,
            uomId: unitControlEnable ? orderUomId || primaryUomId : primaryUomId,
            ...secondaryUomIdProps,
            customMadeFlag,
            customAttributeList: undefined,
            taxId,
            itemName, // 物料名称
            itemAbcClass,
            itemId: partnerItemId,
            poLineId,
            lastPurchasePrice,
            itemSpecs: specifications,
            itemModel: model,
            drawingNum: chartCode,
            drawingVersion,
          };
        } else {
          return item;
        }
      });
      const fields = {
        itemName,
        taxId,
        taxCode,
        uomName,
        ...secondaryUomIdProps,
        uomId: primaryUomId,
        itemId: partnerItemId,
        uomCodeAndName: uomCodeAndNameRule ? `${uomCode}/${uomName}` : uomName,
      };
      setFieldsValue(fields);
      if (
        doubleUintFlag &&
        partnerItemId &&
        secondaryUomIdProps.secondaryUomId &&
        primaryUomId &&
        getFieldValue('secondaryQuantity')
      ) {
        fetchQuantity([
          {
            businessKey: 1,
            secondaryUomId: secondaryUomIdProps.secondaryUomId,
            secondaryQuantity: getFieldValue('secondaryQuantity'),
            doublePrimaryUomId: primaryUomId,
            itemId: partnerItemId,
          },
        ]).then((res1) => {
          const itemChangeProps = {
            secondaryUomId: secondaryUomIdProps.secondaryUomId,
            secondaryQuantity: getFieldValue('secondaryQuantity'),
            quantity: res1 ? res1[0]?.primaryQuantity : getFieldValue('secondaryQuantity'),
          };
          setFieldsValue({
            quantity: res1 ? res1[0]?.primaryQuantity : getFieldValue('secondaryQuantity'),
          });
          const newListDataSource = listDataSource?.map((item) => {
            if (item.prLineId === record.prLineId) {
              return {
                ...item,
                ...itemChangeProps,
              };
            }
            return item;
          });
          onChangeListData(newListDataSource);
        });
      } else {
        onChangeListData(listDataSource);
      }
    } else {
      // 当单据来源为 SRM，删除物料编码删除本行所有，除了 库房和库存组织
      const resetIndex = [
        'itemId',
        'itemCode',
        'itemName',
        'categoryId',
        'categoryName',
        'itemAbcClass',
        'uomId',
        'secondaryUomId',
        'secondaryUomCode',
        'secondaryUomName',
        'customMadeFlag',
        'customAttributeList',
        'uomName',
        // 'quantity',
        'taxId',
        'taxCode',
        // 'currencyCode',
        // 'taxIncludedUnitPrice',
        'jdPrice',
        // 'neededDate',
        'supplierCompanyId',
        'displaySupplierName',
        'prRequestedName',
        'agentName',
        'expBearDep',
        // 'costId',
        // 'costName',
        // 'accountSubjectId',
        // 'accountSubjectName',
        // 'wbsCode',
        // 'wbs',
        // 'projectNum',
        // 'projectName',
        'craneNum',
        'innerPoNum',
        'itemModel',
        'itemSpecs',
        'drawingNum',
        'drawingVersion',
        // 'remark',
        'itemProperties',
        'keeperUserName',
        'accepterUserName',
        'address',
      ];
      const { itemLimitRule = [] } = this.props;
      if (itemLimitRule.find((rule) => rule !== 'categoryId')) {
        resetIndex.push('categoryId', 'categoryName');
      }
      const resetList = {
        itemId: undefined,
        itemName: undefined,
        itemCode: undefined,
        taxRate: undefined,
        // taxIncludedUnitPrice: undefined,
        // taxIncludedLineAmount: undefined,
        // lineFreight: undefined,
        customMadeFlag: undefined,
        customAttributeList: undefined,
        lastPurchasePrice: undefined,
        pcNum: undefined,
        // categoryId: undefined,
        // categoryName: undefined,
      };
      const resetFields = {};
      // eslint-disable-next-line no-unused-expressions
      resetIndex?.map((item) => {
        resetFields[item] = undefined;
        return item;
      });

      record.$form.setFieldsValue(resetFields); // 清空物料编码时清空id
      const listDataSource1 = dataSource?.map((item) => {
        if (item.prLineId === record.prLineId) {
          return {
            ...item,
            ...resetList,
          };
        }
        return item;
      });
      onChangeListData(listDataSource1);
    }
  }

  @Bind()
  getColumns() {
    const {
      // prChangeConfigs = [],
      headerInfo = {},
      urlflagIf,
      handleEditFlagTrue,
      isNewTeant,
      doubleUintFlag,
      basePriceFlag,
    } = this.props;

    const { companyId, ouId, changedFlag } = headerInfo;
    const tenantId = getCurrentOrganizationId();
    // const canModifyFlagArr = prChangeConfigs
    //   .filter((item) => item.canModifyFlag === 1)
    //   .map((item) => {
    //     const { fieldName = '' } = item;
    //     const nameArr = fieldName.split('_');
    //     for (let index = 0; index < nameArr.length; index++) {
    //       if (index > 0) {
    //         nameArr[index] =
    //           nameArr[index][0].toUpperCase() + nameArr[index].substring(1, nameArr[index].length);
    //       }
    //     }
    //     return nameArr.join('');
    //   });
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'prLineStatusCodeMeaning',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        fixed: 'left',
        width: 80,
        render: (_, record) => this.popover(record),
      },
      // {
      //   title: intl
      //     .get('sprm.purchaseReqCreation.model.common.accountAssignType')
      //     .d('账户分配类别'),
      //   dataIndex: 'accountAssignTypeCode',
      //   width: 120,
      // },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        render: (val, record) =>
          urlflagIf &&
          !this.itemChangeDisabled(false, record) &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemCode`, {
                initialValue: val,
              })(
                <Lov
                  code="SPRM.ITEM_RELATE_PUR_PRICE"
                  lovOptions={{ valueField: 'itemCode', displayField: 'itemCode' }}
                  textValue={val}
                  queryParams={() => this.getQueryItemParams(record)}
                  originTenantId={getCurrentOrganizationId()}
                  disabled
                  onChange={(value, lovRecord) => {
                    this.handleItemOnChange(value, lovRecord, record);
                    handleEditFlagTrue();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('entity.item.name').d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemName`, {
                rules: [
                  {
                    required: true,
                    message: intl
                      .get('hzero.common.validation.notNull', {
                        name: intl.get(`entity.item.name`).d('物料名称'),
                      })
                      .d(`${intl.get(`entity.item.name`).d('物料名称')}不能为空`),
                  },
                  {
                    max: 360,
                    message: intl.get('hzero.common.validation.max', {
                      max: 360,
                    }),
                  },
                ],
                initialValue: record.itemName,
              })(<Input disabled onChange={handleEditFlagTrue} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`categoryName`, {
                initialValue: val,
              })}
              {record.$form.getFieldDecorator(`categoryId`, {
                // rules: [   // 贵州烟草要求非必输
                //   {
                //     required: !isEComAndReject,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
                //     }),
                //   },
                // ],
                initialValue: record.categoryId,
              })(
                <Lov
                  // code="SMDM.TREE_ITEM_CATEGORY_TILED_NEW"
                  code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                  textField="categoryName"
                  textValue={record.categoryName}
                  disabled
                  queryParams={{
                    tenantId,
                    enabledFlag: 1,
                    module: 'PR',
                    purchaseOrgId: headerInfo.purchaseOrgId,
                    queryCategoryId: headerInfo.categoryId,
                    itemId: record.$form.getFieldValue('itemId'),
                    prTypeId: headerInfo.prTypeId,
                    hzeroUIFlag: 1,
                    businessObjectCode: 'SRM_C_SRM_SPRM_PR_HEADER',
                  }}
                  onChange={(value) => {
                    // eslint-disable-next-line no-param-reassign
                    record.categoryId = value;
                    handleEditFlagTrue();
                  }}
                  tableDsProps={{
                    record: {
                      dynamicProps: {
                        selectable: (_record) => _record.get('isCheck') !== false,
                      },
                    },
                  }}
                  tableProps={{
                    virtual: true,
                    style: { maxHeight: '500px' },
                  }}
                />
              )}
            </FormItem>
          ) : (
            record.categoryName
          ),
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.occupiedQuantity`).d('已执行数量'),
        dataIndex: 'occupiedQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 120,
      },
      // {
      //   title: intl.get(`${commonPrompt}.closeQuantity`).d('关闭数量'),
      //   dataIndex: 'closeQuantity',
      //   render: (val, record) => {
      //     return numberPrecision(val, record.uomPrecision);
      //   },
      //   width: 80,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.sourceCloseQuantity`).d('寻源关闭数量'),
      //   dataIndex: 'sourceCloseQuantity',
      //   render: (val, record) => {
      //     return numberPrecision(val, record.uomPrecision);
      //   },
      //   width: 80,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.currentCloseQuantity`).d('本次关闭数量'),
      //   dataIndex: 'currentCloseQuantity',
      //   render: (val, record) => {
      //     return numberPrecision(val, record.uomPrecision);
      //   },
      //   width: 80,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.currentSourceCloseQuantity`).d('本次寻源关闭数量'),
      //   dataIndex: 'currentSourceCloseQuantity',
      //   render: (val, record) => {
      //     return numberPrecision(val, record.uomPrecision);
      //   },
      //   width: 80,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.downsStreamQuantity`).d('已转下游数量'),
      //   dataIndex: 'downsStreamQuantity',
      //   render: (val, record) => {
      //     return numberPrecision(val, record.uomPrecision);
      //   },
      //   width: 80,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.sourceDownsStreamQuantity`).d('寻源链路已转下游数量'),
      //   dataIndex: 'sourceDownsStreamQuantity',
      //   render: (val, record) => {
      //     return numberPrecision(val, record.uomPrecision);
      //   },
      //   width: 80,
      // },
      {
        title: intl.get(`${commonPrompt}.changeQuantity`).d('变更数量'),
        dataIndex: 'changeQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 120,
      },
      {
        title: doubleUintFlag
          ? intl.get(`${commonPrompt}.baseQuantity`).d('基本数量')
          : intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'quantity',
        render: (val, record) =>
          urlflagIf &&
          record.occupiedQuantity < val &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`quantity`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.quantity`).d('数量'),
                    }),
                  },
                ],
                initialValue: record.quantity,
              })(
                <NumberField
                  {...(isNumber(record.$form.getFieldValue('uomPrecision') || record.uomPrecision)
                    ? {
                        precision:
                          record.$form.getFieldValue('uomPrecision') || record.uomPrecision,
                      }
                    : {})}
                  min={0}
                  numberGrouping
                  disabled
                  onChange={handleEditFlagTrue}
                />
              )}
            </FormItem>
          ) : (
            numberPrecision(val, record.uomPrecision)
          ),
        width: 120,
      },
      {
        title: doubleUintFlag
          ? intl.get(`${commonPrompt}.basic.uomName`).d('基本单位')
          : intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'uomName',
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator('uomPrecision', {
                initialValue: record.uomPrecision,
              })}
              {record.$form.getFieldDecorator(`uomId`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.uomName`).d('单位'),
                    }),
                  },
                ],
                initialValue: record.uomId,
              })(
                <Lov
                  code="SMDM.DUAL_UOM_ID"
                  lovOptions={{ valueField: 'uomId', displayField: 'uomCodeAndName' }}
                  textValue={record.uomCodeAndName}
                  textField="uomCodeAndName"
                  disabled
                  onChange={(_, lovRecord = {}) => {
                    handleEditFlagTrue();
                    // eslint-disable-next-line no-param-reassign
                    record.uomPrecision = lovRecord.uomPrecision;
                    record.$form.setFieldsValue({
                      uomPrecision: lovRecord.uomPrecision,
                    });
                    if (lovRecord.uomPrecision && record.$form.getFieldValue('quantity')) {
                      record.$form.setFieldsValue({
                        quantity: round(
                          +record.$form.getFieldValue('quantity'),
                          lovRecord.uomPrecision
                        ).toFixed(lovRecord.uomPrecision),
                      });
                    }
                  }}
                  queryParams={{
                    tenantId,
                    itemId: record.$form.getFieldValue('itemId') || record.itemId,
                    invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                  }}
                />
              )}
            </FormItem>
          ) : (
            `${record.uomCodeAndName}`
          ),
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'secondaryUomId',
        width: 180,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator('secondaryUomPrecision', {
                initialValue: record.secondaryUomPrecision,
              })}
              {record.$form.getFieldDecorator('secondaryUomCodeAndName', {
                initialValue: record.secondaryUomCodeAndName,
              })}
              {record.$form.getFieldDecorator(`secondaryUomId`, {
                rules: [
                  {
                    required: !true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.uomName`).d('单位'),
                    }),
                  },
                ],
                initialValue: record.uomId,
              })(
                <Lov
                  lovOptions={{ valueField: 'uomId', displayField: 'uomCodeAndName' }}
                  code="SMDM_ITEM_ORG_UOM"
                  textValue={record.secondaryUomCodeAndName || record.secondaryUomName}
                  disabled
                  onChange={(_, lovRecord = {}) => {
                    handleEditFlagTrue();
                    const { onChangeListData, dataSource } = this.props;
                    const { uomCode, uomCodeAndName, uomId, secondaryUomPrecision = 10 } =
                      lovRecord || {};
                    const {
                      secondaryQuantity,
                      uomId: doublePrimaryUomId,
                      itemId,
                    } = record.$form.getFieldsValue();
                    const baseUomProps = {
                      secondaryUomPrecision,
                      secondaryUomCode: uomCode,
                      secondaryUomCodeAndName: uomCodeAndName,
                      secondaryQuantity: secondaryQuantity
                        ? round(+secondaryQuantity, secondaryUomPrecision).toFixed(
                            secondaryUomPrecision
                          )
                        : undefined,
                    };
                    if (
                      doubleUintFlag &&
                      itemId &&
                      doublePrimaryUomId &&
                      uomId &&
                      secondaryQuantity
                    ) {
                      fetchQuantity([
                        {
                          businessKey: 1,
                          secondaryUomId: uomId,
                          secondaryQuantity,
                          doublePrimaryUomId,
                          itemId,
                        },
                      ]).then((res) => {
                        if (res && !res.failed) {
                          record.$form.setFieldsValue({
                            ...baseUomProps,
                            quantity: res[0]?.primaryQuantity,
                          });
                          const listDataSource = dataSource?.map((item) => {
                            if (item.prLineId === record.prLineId) {
                              return {
                                ...item,
                                ...baseUomProps,
                                quantity: res[0]?.primaryQuantity,
                              };
                            }
                            return item;
                          });
                          onChangeListData(listDataSource);
                        }
                      });
                    } else {
                      record.$form.setFieldsValue({
                        ...baseUomProps,
                        uomId,
                        uomPrecision: secondaryUomPrecision,
                        uomCode,
                        uomName: uomCodeAndName,
                        uomCodeAndName,
                        secondaryQuantity: round(
                          +record.$form.getFieldValue('secondaryQuantity'),
                          lovRecord.secondaryUomPrecision
                        ).toFixed(lovRecord.secondaryUomPrecision),
                        quantity: secondaryQuantity,
                      });
                      const listDataSource = dataSource?.map((item) => {
                        if (item.prLineId === record.prLineId) {
                          return {
                            ...item,
                            uomId,
                            uomPrecision: secondaryUomPrecision,
                            uomCode,
                            uomName: uomCodeAndName,
                            uomCodeAndName,
                            quantity: secondaryQuantity
                              ? round(+secondaryQuantity, secondaryUomPrecision).toFixed(
                                  secondaryUomPrecision
                                )
                              : undefined,
                          };
                        }
                        return item;
                      });
                      onChangeListData(listDataSource);
                    }
                  }}
                  queryParams={{
                    tenantId,
                    itemId: record.$form.getFieldValue('itemId') || record.itemId,
                    invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                  }}
                />
              )}
            </FormItem>
          ) : (
            `${record.secondaryUomCodeAndName || record.secondaryUomName}`
          ),
      },
      {
        title: intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        width: 120,
        render: (val, record) =>
          urlflagIf &&
          record.occupiedQuantity < val &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`secondaryQuantity`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.quantity`).d('数量'),
                    }),
                  },
                ],
                initialValue: record.secondaryQuantity,
              })(
                <NumberField
                  {...(isNumber(record.$form.getFieldValue('uomPrecision') || record.uomPrecision)
                    ? {
                        precision:
                          record.$form.getFieldValue('uomPrecision') || record.uomPrecision,
                      }
                    : {})}
                  min={0}
                  numberGrouping
                  disabled
                  onChange={(value) => {
                    handleEditFlagTrue();
                    if (doubleUintFlag) {
                      const { dataSource, onChangeListData } = this.props;
                      const { getFieldValue: getRecordFieldValue } = record ? record.$form : {};
                      if (
                        record.prLineId &&
                        getRecordFieldValue('secondaryUomId') &&
                        value &&
                        getRecordFieldValue('uomId') &&
                        getRecordFieldValue('itemId')
                      ) {
                        fetchQuantity([
                          {
                            businessKey: 1,
                            secondaryUomId: getRecordFieldValue('secondaryUomId'),
                            secondaryQuantity: value,
                            doublePrimaryUomId: getRecordFieldValue('uomId'),
                            itemId: getRecordFieldValue('itemId'),
                          },
                        ]).then((res) => {
                          if (res && !res.failed) {
                            onChangeListData(
                              dataSource?.map((item) => {
                                if (item.prLineId === record.prLineId) {
                                  return {
                                    ...item,
                                    quantity: res[0]?.primaryQuantity,
                                  };
                                }
                                return item;
                              })
                            );
                          }
                        });
                      } else {
                        onChangeListData(
                          dataSource?.map((item) => {
                            if (item.prLineId === record.prLineId) {
                              return {
                                ...item,
                                quantity: value,
                              };
                            }
                            return item;
                          })
                        );
                      }
                    }
                  }}
                />
              )}
            </FormItem>
          ) : (
            numberPrecision(val, record.uomPrecision)
          ),
      },
      {
        title: intl.get(`${commonPrompt}.closeQuantity`).d('关闭数量'),
        dataIndex: 'closeQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.sourceCloseQuantity`).d('寻源关闭数量'),
        dataIndex: 'sourceCloseQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.currentCloseQuantity`).d('本次关闭数量'),
        dataIndex: 'currentCloseQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.currentSourceCloseQuantity`).d('本次寻源关闭数量'),
        dataIndex: 'currentSourceCloseQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.downsStreamQuantity`).d('已转下游数量'),
        dataIndex: 'downsStreamQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.sourceDownsStreamQuantity`).d('寻源链路已转下游数量'),
        dataIndex: 'sourceDownsStreamQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'secondaryTaxInUnitPrice',
        width: 120,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? (
            record.taxIncludedUnitPriceMeaning
          ) : urlflagIf &&
            record.occupyFlag !== 1 &&
            record.occupiedQuantity === 0 &&
            record.cancelledFlag === 0 &&
            record.closedFlag === 0 ? (
              <FormItem>
                {record.$form.getFieldDecorator(`secondaryTaxInUnitPrice`, {
                initialValue: val,
              })(
                <NumberField
                  min={0}
                  disabled={!basePriceFlag}
                  onChange={handleEditFlagTrue}
                  numberGrouping
                />
              )}
              </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 120,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`currencyCode`, {
                initialValue: val,
              })(
                <Lov
                  code="SPRM.EXCHANGE_RATE.CURRENCY"
                  disabled
                  textValue={record.currencyCode}
                  queryParams={{ tenantId }}
                  onChange={handleEditFlagTrue}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: doubleUintFlag
          ? intl.get(`${commonPrompt}.baseTaxIncludedUnitPrice`).d('预估单价(含税)-基本单位')
          : intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'taxIncludedUnitPrice',
        width: 120,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? (
            record.taxIncludedUnitPriceMeaning
          ) : urlflagIf &&
            record.occupyFlag !== 1 &&
            record.occupiedQuantity === 0 &&
            record.cancelledFlag === 0 &&
            record.closedFlag === 0 ? (
              <FormItem>
                {record.$form.getFieldDecorator(`taxIncludedUnitPrice`, {
                initialValue: val,
              })(
                <NumberField
                  min={0}
                  disabled={!basePriceFlag}
                  onChange={handleEditFlagTrue}
                  numberGrouping
                />
              )}
              </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 120,
        align: 'right',
        // render: (val, record) => thousandBitSeparator(val, record.financialPrecision),
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? (
            record.taxIncludedUnitPriceMeaning
          ) : urlflagIf &&
            record.occupyFlag !== 1 &&
            record.occupiedQuantity === 0 &&
            record.cancelledFlag === 0 &&
            record.closedFlag === 0 ? (
              <FormItem>
                {record.$form.getFieldDecorator(`taxIncludedLineAmount`, {
                initialValue: val,
              })(<NumberField min={0} disabled onChange={handleEditFlagTrue} numberGrouping />)}
              </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 120,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`neededDate`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
                    }),
                  },
                ],
                initialValue: val ? moment(val) : undefined,
              })(
                <DatePicker
                  disabled
                  placeholder={null}
                  format={getDateFormat()}
                  onChange={handleEditFlagTrue}
                />
              )}
            </FormItem>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 180,
      },
      {
        title: intl.get('entity.business.tag').d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get('entity.organization.class.purchase').d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 120,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`purchaseAgentId`, {
                initialValue: record.purchaseAgentId,
              })(
                <Lov
                  code="SMDM.PURCHASE_AGENT"
                  textValue={val}
                  textField="agentName"
                  queryParams={{ tenantId }}
                  onChange={handleEditFlagTrue}
                  disabled
                  // onChange={(value, lovRecord) => this.agentNameCenter(value, lovRecord, record)}
                />
              )}
              {record.$form.getFieldDecorator('agentName', {
                initialValue: record.agentName,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        dataIndex: 'supplierName',
        width: 150,
        render: (_, record) => <span>{record.supplierName || record.supplierCompanyName}</span>,
      },
      {
        title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`invOrganizationName`, {
                initialValue: record.invOrganizationName,
              })}
              {record.$form.getFieldDecorator(`invOrganizationId`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.organization.class.inventory').d('库存组织'),
                    }),
                  },
                ],
                initialValue: record.invOrganizationId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.INVORG"
                  textValue={record.invOrganizationName}
                  queryParams={{ tenantId, enabledFlag: 1, ouId }}
                  lovOptions={{ displayField: 'organizationName' }}
                  disabled
                  // onChange={value => this.OrgOnChange(value, record)}
                  onChange={handleEditFlagTrue}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        dataIndex: 'wbs',
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`wbsCode`, {
                initialValue: record.wbsCode,
              })(
                <Lov
                  code="SMDM.WBS"
                  // onChange={(value, lovRecord) => this.handleWbs(value, lovRecord, record)}
                  onChange={(value, lovRecord = {}) => {
                    handleEditFlagTrue();
                    record.$form.setFieldsValue({ wbs: lovRecord.wbsName });
                  }}
                  lovOptions={{ valueField: 'wbsCode' }}
                  textValue={record.wbs}
                  queryParams={{
                    tenantId,
                    companyId,
                    ouId,
                  }}
                  disabled
                />
              )}
              {record.$form.getFieldDecorator('wbs', { initialValue: record.wbs })}
            </FormItem>
          ) : (
            val
          ),
        width: 180,
      },
      // {
      //   title: intl.get(`${commonPrompt}.inventoryName`).d('库房'),
      //   dataIndex: 'inventoryName',
      //   width: 120,
      // },
      {
        title: intl.get(`entity.roles.proposer`).d('申请人'),
        dataIndex: 'prRequestedName',
        width: 120,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`requestedBy`, {
                initialValue: record.requestedBy,
              })(
                <Lov
                  code="SPCM.ACCEPT_USER"
                  textValue={
                    record.prRequestedNum
                      ? `${record.prRequestedName}-${record.prRequestedNum}`
                      : record.prRequestedName
                  }
                  textField="prRequestedString"
                  queryParams={{ tenantId }}
                  onChange={(value, dataList) => {
                    handleEditFlagTrue();
                    record.$form.setFieldsValue({
                      requestedBy: dataList.userId,
                      prRequestedName: dataList.userName,
                      prRequestedString: dataList.loginName
                        ? `${dataList.userName}-${dataList.loginName}`
                        : dataList.userName,
                    });
                  }}
                  disabled
                  // onChange={(value, dataList) => this.changeRequestedBy(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('prRequestedName', {
                initialValue: record.prRequestedName,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.ERPstatus`).d('ERP状态'),
        dataIndex: 'erpEditStatus',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.handleStatus`).d('执行状态'),
        dataIndex: 'executionStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.handlePerson`).d('需求执行人'),
        dataIndex: 'executorName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.assignedDate`).d('分配日期'),
        dataIndex: 'assignedDate',
        width: 120,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 250,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`remark`, {
                initialValue: record.remark,
              })(<Input style={{ width: '100%' }} disabled onChange={handleEditFlagTrue} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`entity.attachment.tag`).d('附件'),
        dataIndex: 'attachmentUuid',
        width: 120,
        render: (_, { attachmentUuid }) => {
          const uploadProps = {
            bucketName: PRIVATE_BUCKET,
            bucketDirectory: 'sprm-pr',
            btnText: intl.get(`entity.attachment.view`).d('附件查看'),
            attachmentUUID: attachmentUuid,
            viewOnly: true,
            showFilesNumber: true,
            icon: false,
          };
          return <UploadModal {...uploadProps} />;
        },
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        dataIndex: 'operationRecord',
        width: 120,
        render: (val, record) => {
          return (
            <a onClick={() => this.hideModal(record)}>
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </a>
          );
        },
      },
    ];
    if (!urlflagIf) {
      /* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["ele"] }] */
      columns.forEach((ele) => {
        const renderFunc = ele.render;
        ele.render = (value, record, index) =>
          this.renderChangeField(value, record, index, ele.dataIndex, renderFunc);
      });
    }

    if (isNewTeant) {
      columns.splice(1, 0, {
        title: intl.get(`${commonPrompt}.operable`).d('可操作类型'),
        width: 120,
        dataIndex: 'operable',
        render: (_, record) => {
          if (changedFlag === 1) {
            return null;
          }
          const { prLineCancelledFlag, prLineClosedFlag, prLineStatusCode } = record;
          return (
            ['APPROVED', 'ASSIGNED', 'SUSPEND'].includes(prLineStatusCode) && (
              <span>
                {prLineCancelledFlag === 1 ? (
                  <Tag color="blue">{intl.get(`${commonPrompt}.cancellable`).d('可取消')}</Tag>
                ) : null}
                {prLineClosedFlag === 1 ? (
                  <Tag color="blue">{intl.get(`${commonPrompt}.closable`).d('可关闭')}</Tag>
                ) : null}
              </span>
            )
          );
        },
      });
    }

    return columns;
  }

  @Bind()
  renderChangeField(value, record, index, name, renderFun) {
    // console.log(isEmpty({}))
    const { changeFiledMap } = record;
    // 不会改变的字段
    const noChangefields = [
      'customAttributeList',
      'attachmentUuid',
      'customSpecsJson',
      'productSpecsJson',
      'executorName',
      'secondaryUomName',
      'secondaryUomId',
      'secondaryUomName',
      'orderExcessRuleCode',
      'sourceExcessRuleCode',
      'contractExcessRuleCode',
      'sourceDisposableExcessFlag',
      'secondaryQuantity',
      'secondaryTaxInUnitPrice',
      'prRequestedName',
      'occupiedQuantity',
      'changeQuantity',
    ];
    // 有tooltip 提示的字段
    const tipFileds = ['remark'];

    if (noChangefields.includes(name)) {
      if (isFunction(renderFun)) {
        return renderFun(value, record, index);
      } else {
        return value;
      }
    }

    if (!isEmpty(changeFiledMap)) {
      let text;
      let beforeText;
      let ischangeField = false;
      const beforeRecord = { ...record, ...changeFiledMap };

      if (
        Object.keys(changeFiledMap)
          .filter((e) => e !== 'uomName')
          .includes(name)
      ) {
        if (tipFileds.includes(name)) {
          text = value;
          beforeText = beforeRecord[name];
        } else {
          text = isFunction(renderFun) ? renderFun(value, record, index) : value;
          beforeText = isFunction(renderFun)
            ? renderFun(beforeRecord[name], beforeRecord, index)
            : beforeRecord[name];
        }
        ischangeField = true;
      }

      if (
        name === 'receiveTelNum' &&
        (Object.keys(changeFiledMap).includes(name) ||
          Object.keys(changeFiledMap).includes('internationalTelCode'))
      ) {
        text = value ? `${record.internationalTelCode || ''} ${value}` : '';
        beforeText = beforeRecord[name]
          ? `${beforeRecord.internationalTelCode || ''} ${beforeRecord[name]}`
          : '';
        ischangeField = true;
      }

      if (
        name === 'supplierName' &&
        (Object.keys(changeFiledMap).includes(name) ||
          Object.keys(changeFiledMap).includes('supplierCompanyName'))
      ) {
        text = record.supplierName || record.supplierCompanyName;
        beforeText = beforeRecord.supplierName || beforeRecord.supplierCompanyName;
        ischangeField = true;
      }

      if (name === 'uomName' && Object.keys(changeFiledMap).includes('uomCodeAndName')) {
        text = record.uomCodeAndName;
        beforeText = beforeRecord.uomCodeAndName;
        ischangeField = true;
      }

      if (ischangeField) {
        return (
          <Tooltip
            title={intl
              .get(`${commonPrompt}.beforeChanged`, {
                value: beforeText,
              })
              .d(`变更前：${beforeText}`)}
          >
            <span style={{ color: 'red' }}>{text || '-'}</span>
          </Tooltip>
        );
      }
    }

    if (isFunction(renderFun)) {
      return renderFun(value, record, index);
    } else {
      return value;
    }
  }

  @Bind()
  handleCancelClose(type) {
    const { promptModalVisible } = this.state;
    this.setState({ promptModalVisible: !promptModalVisible, promptModalFlag: type });
  }

  @Bind()
  promptModalHandleCancel() {
    this.setState({ promptModalFlag: '', promptModalVisible: false });
  }

  render() {
    const columns = this.getColumns();
    const {
      loading,
      onSearch,
      pagination = {},
      dataSource = [],
      customizeTable,
      form,
      urlflagIf,
      erpCancelFlag,
      isNewTeant,
      headerInfo,
      doubleUintFlag,
      prHeaderId,
    } = this.props;
    const { changedFlag } = headerInfo;
    const { selectedRows, promptModalVisible, promptModalFlag } = this.state;
    const scrollX = sum(columns?.map((n) => (isNumber(n.width) ? n.width : 0)));
    const promptModalProps = {
      visible: promptModalVisible,
      form,
      flag: promptModalFlag,
      params: { prHeaderId, prLineIds: selectedRows?.map((n) => n.prLineId) },
      promptTitle:
        promptModalFlag === 'cancelledRemark'
          ? intl.get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`).d('取消原因')
          : promptModalFlag === 'closedRemark'
          ? intl.get(`sprm.purchaseRequisitionCancel.view.message.closeReason`).d('关闭原因')
          : intl.get(`sprm.purchaseRequisitionCancel.view.message.sendBackReason`).d('退回原因'),
      handleOk: this.promptModalHandleOk,
      handleCancel: this.promptModalHandleCancel,
    };
    const tableProps = {
      loading,
      columns: !doubleUintFlag
        ? columns.filter(
            (ele) =>
              !['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'].includes(
                ele.dataIndex
              )
          )
        : columns,
      dataSource,
      pagination,
      rowSelection: {
        selectedRowKeys: selectedRows?.map((n) => n.prLineId),
        onChange: this.onSelectChange,
      },
      rowKey: 'prLineId',
      bordered: true,
      onChange: (page) => onSearch(page),
      scroll: { x: scrollX, y: 'calc(100vh - 320px)' },
    };
    const cancelFlag = !selectedRows?.every((ele) => ele.prLineCancelledFlag === 1);
    const closeFlag = !selectedRows?.every((ele) => ele.prLineClosedFlag === 1);
    return (
      <Fragment>
        {!urlflagIf && erpCancelFlag !== '0' && (
          <div className={styles['purchase-application']}>
            <Form layout="inline">
              {isNewTeant && changedFlag !== 1 && (
                <Button
                  onClick={() => this.handleCancelClose('closedRemark')}
                  disabled={
                    selectedRows.length === 0 ||
                    selectedRows.every(
                      (ele) => !['APPROVED', 'ASSIGNED', 'SUSPEND'].includes(ele.prLineStatusCode)
                    ) ||
                    closeFlag
                  }
                  permissionList={[
                    {
                      code: `hzero.srm.requirement.prm.pr-cancel.ps.line-close`,
                      type: 'button',
                      meaning: '关闭按钮权限',
                    },
                  ]}
                >
                  {intl.get(`hzero.common.button.close`).d('关闭')}
                </Button>
              )}
              {changedFlag !== 1 && (
                <Button
                  onClick={() => this.handleCancelClose('cancelledRemark')}
                  style={{ marginRight: '8px' }}
                  disabled={
                    selectedRows.length === 0 ||
                    !selectedRows.every((ele) =>
                      ['APPROVED', 'ASSIGNED', 'SUSPEND'].includes(ele.prLineStatusCode)
                    ) ||
                    (isNewTeant && cancelFlag)
                  }
                  permissionList={[
                    {
                      code: `hzero.srm.requirement.prm.pr-cancel.ps.line-cancel`,
                      type: 'button',
                      meaning: '取消按钮权限',
                    },
                  ]}
                >
                  {intl.get(`hzero.common.button.cancel`).d('取消')}
                </Button>
              )}
            </Form>
          </div>
        )}
        {urlflagIf
          ? // 可变更行，通过页面个性化配置字段 是否阔以变更
            customizeTable(
              { code: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.CHANGE_ERP_LINE' },
              <EditTable {...tableProps} />
            )
          : // 不可变更行
            customizeTable(
              { code: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.ERP_LINE' },
              <EditTable {...tableProps} />
            )}
        <PromptModal {...promptModalProps} />
      </Fragment>
    );
  }
}
