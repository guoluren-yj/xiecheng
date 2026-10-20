/*
 * NonErpPurchaseRequisition - 非ERP采购申请
 * @date: 2019-02-22
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Tooltip, Form, Input, DatePicker, Table, Button, Tag } from 'hzero-ui';
import { isNumber, sum, isArray, round, isFunction } from 'lodash';
import { NumberField, Currency } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId, getDateFormat, getResponse } from 'utils/utils';
import moment from 'moment';
import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';

import { thousandBitSeparator, precisionParams, numberPrecision } from '@/routes/utils.js';

import UploadModal from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';

import { fetchCategory, fetchQuantity } from '@/services/purchaseRequisitionCreationService';
import MultipleLov from './../../components/MultipleLov';
import styles from './index.less';
import { ItemCustom } from '../../components/ItemCustom';
import PromptModal from '../PromptModal';
import TooltipLov from './../../components/TooltipLov';
import TooltipInput from './../../components/TooltipInput';
import CustomSpecModal from '../../components/CustomSpecModal';

const FormItem = Form.Item;
// const { Option } = Select;
const commonPrompt = 'sprm.common.model.common';
const modelPrompt = 'sprm.purchaseReqCreation.model.common';

@Form.create({ fieldNameProp: null })
export default class NonErpList extends PureComponent {
  state = {
    promptModalVisible: false,
    promptModalFlag: '',
    selectedRows: [],
    customVisable: false,
    customData: [],
    specsJsonType: 'custom',
    firstRender: true,
  };

  // componentDidMount() {
  //   const { dispatch } = this.props;
  //   // 独立下拉值集
  //   const lovCodes = {
  //     address: 'SPRM.PR_LINE.ADDRESS', // 地点
  //     itemProperties: 'SPUC.PR_LINE_ITEM_PROPERTIE', // 属性
  //   };
  //   dispatch({
  //     type: 'purchaseRequisitionCancel/batchCode',
  //     payload: { lovCodes },
  //   });
  // .then(result => {
  //   if (result) {
  //     this.setState({
  //       code: result,
  //     });
  //   }
  // });
  // }

  @Bind()
  handleToolTipVisible(currentType = '', record = {}) {
    record.$form.registerField('currentType');
    record.$form.setFieldsValue({ currentType });
  }

  /**
   * 查询物料限定配置
   */
  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseRequisitionCancel/fetchDoExecute',
      payload: [{ fullPathCode: 'SITE.SMDM.UOM_DISPLAY_CONFIGURATION' }],
    }).then(res => {
      const result = getResponse(res);
      if (res && isArray(res)) {
        const uomCodeAndNameRule = result[0] ? JSON.parse(result[0]) : 0;
        this.setState({ uomCodeAndNameRule });
      }
    });
  }

  /**
   * 改变账户分配类别进行必输校验
   */
  @Bind()
  handleAssignTypeChange(val, dataList, record) {
    const {
      $form: { setFieldsValue },
    } = record;
    const { accountAssignTypeId, accountAssignTypeCode } = dataList;
    setFieldsValue({ accountAssignTypeId, accountAssignTypeCode });
  }

  /**
   * 建议供应商改变回调
   * @param {String} value
   * @param {Object} lovRecord
   */
  @Bind()
  handleChangeSupplier(value, lovRecord, record) {
    const {
      supplierCompanyId,
      supplierTenantId,
      supplierCompanyNum,
      supplierCompanyName,
      displaySupplierName,
    } = lovRecord;
    const { onChangeListData, dataSource } = this.props;
    const listDataSource = dataSource?.map(item => {
      if (item.prLineId === record.prLineId) {
        return {
          ...item,
          supplierCompanyId,
          supplierTenantId,
          supplierCompanyNum,
          supplierCompanyName,
          displaySupplierName,
        };
      }
      return item;
    });
    onChangeListData(listDataSource);
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
    if (itemLimitRule.find(rule => rule === 'categoryId')) {
      params.categoryId = record.$form.getFieldValue('categoryId');
    }
    // 库存组织
    if (itemLimitRule.find(rule => rule === 'invOrganizationId')) {
      params.invOrganizationId = record.$form.getFieldValue('invOrganizationId');
    }
    return params;
  }

  uomNameShow = (code, name) => {
    const { uomCodeAndNameRule = 0 } = this.state;
    return uomCodeAndNameRule ? `${code}/${name}` : name;
  };

  /**
   * 物料是否可选
   */
  @Bind()
  itemChangeDisabled(isEComAndReject, record) {
    const { itemLimitRule = [] } = this.props;
    const { firstRender } = this.state;
    if (record.occupyFlag === 1) {
      return true;
    }
    if (isEComAndReject) {
      return true;
    }
    // 物料分类
    if (itemLimitRule.find(rule => rule === 'categoryId')) {
      let categoryId;
      if (firstRender) {
        // eslint-disable-next-line prefer-destructuring
        categoryId = record.categoryId;
        this.setState({ firstRender: false });
      } else {
        categoryId = record.$form.getFieldValue('categoryId');
      }
      if (!categoryId) {
        return true;
      }
    }
    // 库存组织
    if (itemLimitRule.find(rule => rule === 'invOrganizationId')) {
      const invOrganizationId = record.$form.getFieldValue('invOrganizationId');
      // console.log(invOrganizationId);
      // console.log(record.invOrganizationId + 11);
      if (!invOrganizationId) {
        return true;
      }
    }
    return false;
  }

  /**
   * 物料改变回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  handleItemOnChange(value, lovRecord, record) {
    const { onChangeListData, dataSource, prSourcePlatform, doubleUintFlag } = this.props;
    const {
      $form: { setFieldsValue, getFieldValue },
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
    const { cuxItemCodeChange = undefined } = this.props?.remote?.props?.process || {};
    const cuxBringParams = isFunction(cuxItemCodeChange)
      ? cuxItemCodeChange({ ...lovRecord, getFieldValue })
      : {};
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
      const listDataSource = dataSource?.map(item => {
        if (item.prLineId === record.prLineId) {
          return {
            ...item,
            ...cuxBringParams,
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
        ...cuxBringParams,
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
        Promise.all([
          fetchCategory({
            itemId: partnerItemId,
            enabledFlag: 1,
            defaultFlag: 1,
            querySourceFrom: 'PR',
          }),
          fetchQuantity([
            {
              businessKey: 1,
              secondaryUomId: secondaryUomIdProps.secondaryUomId,
              secondaryQuantity: getFieldValue('secondaryQuantity'),
              doublePrimaryUomId: primaryUomId,
              itemId: partnerItemId,
            },
          ]),
        ]).then(result => {
          const [res, res1] = result;

          const itemChangeProps = {
            secondaryUomId: secondaryUomIdProps.secondaryUomId,
            secondaryQuantity: getFieldValue('secondaryQuantity'),
            quantity: res1 ? res1[0]?.primaryQuantity : getFieldValue('secondaryQuantity'),
          };
          setFieldsValue({
            quantity: res1 ? res1[0]?.primaryQuantity : getFieldValue('secondaryQuantity'),
          });
          if (res && isArray(res) && res.length === 1) {
            const { categoryName, categoryId, categoryCode } = res[0];
            itemChangeProps.categoryName = categoryName;
            itemChangeProps.categoryId = categoryId;
            itemChangeProps.categoryCode = categoryCode;
            setFieldsValue({ categoryId, categoryName });
          }
          const newListDataSource = listDataSource?.map(item => {
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
        fetchCategory({
          itemId: partnerItemId,
          enabledFlag: 1,
          defaultFlag: 1,
          querySourceFrom: 'PR',
        }).then(res => {
          if (res && isArray(res) && res.length === 1) {
            const { categoryName, categoryId, categoryCode } = res[0];
            const newListDataSource = listDataSource?.map(item => {
              if (item.prLineId === record.prLineId) {
                return {
                  ...item,
                  categoryId,
                  categoryCode,
                  categoryName,
                };
              }
              return item;
            });
            setFieldsValue({ categoryId, categoryName });
            onChangeListData(newListDataSource);
          } else {
            onChangeListData(listDataSource);
          }
        });
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
      if (itemLimitRule.find(rule => rule !== 'categoryId')) {
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
      resetIndex.map(item => {
        resetFields[item] = undefined;
        return item;
      });
      if (prSourcePlatform === 'SRM') {
        record.$form.setFieldsValue(resetFields); // 清空物料编码时清空id
        const listDataSource = dataSource?.map(item => {
          if (item.prLineId === record.prLineId) {
            return {
              ...item,
              ...resetList,
            };
          }
          return item;
        });
        onChangeListData(listDataSource);
      }
    }
  }

  @Bind()
  handleCategoryOnChange(value, lovRecord, record) {
    const { onChangeListData, dataSource } = this.props;
    let newListDataSource = [];
    if (value) {
      const { categoryName } = lovRecord;

      record.$form.setFieldsValue({
        categoryId: lovRecord.categoryId,
        categoryName,
      });
      newListDataSource = dataSource?.map(item => {
        if (item.prLineId === record.prLineId) {
          return {
            ...item,
            categoryId: lovRecord.categoryId,
            categoryName,
          };
        }
        return item;
      });
      onChangeListData(newListDataSource);
    } else {
      newListDataSource = dataSource?.map(item => {
        if (item.prLineId === record.prLineId) {
          return {
            ...item,
            categoryName: undefined,
          };
        }
        return item;
      });
      record.$form.setFieldsValue({
        categoryId: undefined,
        categoryName: undefined,
      });
      onChangeListData(newListDataSource);
    }

    const { itemLimitRule = [] } = this.props;

    if (itemLimitRule.find(rule => rule === 'categoryId')) {
      const resetFields = {
        itemId: undefined,
        itemName: undefined,
        itemCode: undefined,
        taxRate: undefined,
        taxIncludedUnitPrice: undefined,
        taxIncludedLineAmount: undefined,
        lineFreight: undefined,
        lastPurchasePrice: undefined,
        poLineId: undefined,
        uomId: undefined,
        uomCode: undefined,
        pcNum: undefined,
        itemCodeLov: null,
        itemModel: undefined,
        primaryUomId: undefined,
        itemSpecs: undefined,
      };
      record.$form.setFieldsValue(resetFields);
      // this.handleItemOnChange(null, {}, record);
    }
  }

  /**
   * 税种Lov修改回调
   * @param {String} value
   * @param {Object} record
   */
  @Bind()
  handleChangeTax(value, lovRecord, record) {
    const { onChangeListData, dataSource } = this.props;
    const { taxRate, includedTaxFlag } = lovRecord;
    record.$form.registerField('includedTaxFlag');
    record.$form.setFieldsValue({ includedTaxFlag });
    const listDataSource = dataSource?.map(item => {
      if (item.prLineId === record.prLineId) {
        return {
          ...item,
          taxRate,
        };
      }
      return item;
    });
    onChangeListData(listDataSource);
  }

  @Bind()
  getColumnSRM() {
    const {
      // prChangeConfigs = [],
      headerInfo = {},
      urlflagIf,
      handleEditFlagTrue,
      doubleUintFlag,
      basePriceFlag,
      remote,
    } = this.props;
    const { prSourcePlatform, prStatusCode, companyId, ouId, parentUnitId } = headerInfo;
    // const { code = {} } = this.state;
    // const { itemProperties = [], address = [] } = code;
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
    const { getCuxLineCols = undefined } = remote?.props?.process || {};
    const cuxCols = isFunction(getCuxLineCols) ? getCuxLineCols({ urlflagIf }) : [];
    const isEComAndReject = prSourcePlatform === 'E-COMMERCE' && prStatusCode === 'REJECTED';
    const isCatalogOrECom = ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform);
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'prLineStatusCodeMeaning',
        width: 120,
        // fixed: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        // fixed: 'left',
        width: 80,
        // render: (_, record) => this.popover(record),
      },
      {
        title: intl.get(`${commonPrompt}.occupiedQuantity`).d('已执行数量'),
        dataIndex: 'occupiedQuantity',
        width: 120,
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
      },
      {
        title: intl.get(`${commonPrompt}.changeQuantity`).d('变更数量'),
        dataIndex: 'changeQuantity',
        width: 120,
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
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
      // {
      //   title: intl.get(`${modelPrompt}.accountAssignType`).d('账户分配类别'),
      //   dataIndex: 'accountAssignTypeId',
      //   width: 150,
      //   render: (val, record) =>
      //     urlflagIf &&
      //     canModifyFlagArr.includes('accountAssignTypeId') &&
      //     record.cancelledFlag === 0 &&
      //     record.closedFlag === 0 ? (
      //       <FormItem>
      //         {record.$form.getFieldDecorator('accountAssignTypeId', {
      //           initialValue: val,
      //         })(
      //           <Lov
      //             code="SPRM.ACCOUNT_ASSIGN_TYPE"
      //             textValue={record.accountAssignTypeCode}
      //             queryParams={{
      //               lineType: 'PR_LINE',
      //               tenantId,
      //             }}
      //             disabled={record.occupyFlag === 1}
      //             lovOptions={{
      //               displayField: 'accountAssignTypeCode',
      //               valueField: 'accountAssignTypeId',
      //             }}
      //             onChange={(value, dataList) => {
      //               this.handleAssignTypeChange(value, dataList, record);
      //             }}
      //           />
      //         )}
      //         {record.$form.getFieldDecorator('accountAssignTypeCode', {
      //           initialValue: record.accountAssignTypeCode,
      //         })}
      //       </FormItem>
      //     ) : (
      //       record.accountAssignTypeCode
      //     ),
      // },
      {
        title: intl.get('entity.organization.class.inventory').d('库存组织'),
        dataIndex: 'invOrganizationId',
        width: 150,
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
                initialValue: val,
              })(
                <TooltipLov
                  tipValue={record.$form.getFieldValue('invOrganizationName')}
                  code="SPFM.USER_AUTH.INVORG"
                  textValue={record.invOrganizationName}
                  queryParams={{ tenantId, enabledFlag: 1, ouId }}
                  // lovOptions={{ displayField: 'organizationName' }}
                  disabled
                  // onChange={value => this.OrgOnChange(value, record)}
                  onChange={() => {
                    handleEditFlagTrue();
                    const { itemLimitRule = [] } = this.props;
                    if (itemLimitRule.find(rule => rule === 'invOrganizationId')) {
                      this.handleItemOnChange(null, {}, record);
                    }
                  }}
                />
              )}
            </FormItem>
          ) : (
            <Tooltip title={record.invOrganizationName}>{record.invOrganizationName}</Tooltip>
          ),
      },
      {
        title: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        width: 165,
        dataIndex: 'wbsCode',
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`wbsCode`, {
                initialValue: val,
              })(
                <Lov
                  code="SMDM.WBS"
                  // onChange={(value, lovRecord) => this.handleWbs(value, lovRecord, record)}
                  onChange={(value, lovRecord = {}) => {
                    handleEditFlagTrue();
                    record.$form.setFieldsValue({ wbs: lovRecord.wbsName });
                  }}
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
            record.wbs
          ),
      },
      // {
      //   title: intl.get(`${commonPrompt}.interRoom`).d('库房'),
      //   dataIndex: 'inventoryId',
      //   width: 150,
      //   render: (val, record) =>
      //     urlflagIf &&
      //     canModifyFlagArr.includes('inventoryId') &&
      //     record.cancelledFlag === 0 &&
      //     record.closedFlag === 0 ? (
      //       <React.Fragment>
      //         <FormItem>
      //           {record.$form.getFieldDecorator(`inventoryId`, {
      //             initialValue: val,
      //           })(
      //             <Lov
      //               code="SODR.INVENTORY"
      //               textField="inventoryName"
      //               textValue={record.inventoryName}
      //               queryParams={{
      //                 tenantId,
      //                 enabledFlag: 1,
      //                 organizationId: record.$form.getFieldValue('invOrganizationId'),
      //               }}
      //               disabled={
      //                 !record.$form.getFieldValue('invOrganizationId') || record.occupyFlag === 1
      //               }
      //               onChange={handleEditFlagTrue}
      //             />
      //           )}
      //           {record.$form.getFieldDecorator('inventoryName', {
      //             initialValue: record.inventoryName,
      //           })}
      //         </FormItem>
      //       </React.Fragment>
      //     ) : (
      //       record.inventoryName
      //     ),
      // },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
        render: (val, record) =>
          urlflagIf &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 &&
          !this.itemChangeDisabled(isEComAndReject, record) ? (
            <FormItem>
              {record.$form.getFieldDecorator('itemId', {
                initialValue: record?.itemId,
              })}
              {record.$form.getFieldDecorator(`itemCode`, {
                initialValue: val,
              })(
                <TooltipLov
                  tipValue={record.$form.getFieldValue('itemCode')}
                  code="SPRM.ITEM_RELATE_PUR_PRICE"
                  lovOptions={{ valueField: 'itemCode', displayField: 'itemCode' }}
                  textValue={val}
                  queryParams={this.getQueryItemParams(record)}
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
            <Tooltip title={val}> {val}</Tooltip>
          ),
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
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
                    required: !isCatalogOrECom,
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
              })(
                <TooltipInput
                  tipValue={record.$form.getFieldValue(`itemName`)}
                  disabled
                  onChange={handleEditFlagTrue}
                />
              )}
              <Tooltip
                title={record.$form.getFieldValue('itemName')}
                visible={
                  record.$form.getFieldValue('currentType') === 'itemName' &&
                  record.$form.getFieldValue('itemName')
                }
              />
            </FormItem>
          ) : (
            <Tooltip title={val}> {val}</Tooltip>
          ),
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        dataIndex: 'categoryId',
        width: 120,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`categoryName`, {
                initialValue: record.categoryName,
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
                initialValue: val,
              })(
                <TooltipLov
                  tipValue={record.$form.getFieldValue('categoryName')}
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
                  onChange={(value, lovRecord) => {
                    handleEditFlagTrue();
                    this.handleCategoryOnChange(value, lovRecord, record);
                  }}
                  tableDsProps={{
                    record: {
                      dynamicProps: {
                        selectable: _record => _record.get('isCheck') !== false,
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
            <Tooltip title={record.categoryName}>{record.categoryName}</Tooltip>
          ),
      },
      {
        title: intl.get(`${commonPrompt}.customMadeFlag`).d('是否定制'),
        dataIndex: 'customMadeFlag',
        width: 180,
        render: (value, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {
                (record.$form.getFieldDecorator(`customMadeFlag`, {
                  initialValue: record.customMadeFlag,
                }),
                <span>{yesOrNoRender(value)}</span>)
              }
            </FormItem>
          ) : (
            yesOrNoRender(value)
          ),
      },
      {
        title: intl.get(`${commonPrompt}.customAttributeList`).d('物料定制属性'),
        dataIndex: 'customAttributeList',
        width: 180,
        render: (value, record) => {
          const customMadeFlag = record.$form
            ? record.$form.getFieldValue('customMadeFlag')
            : record.customMadeFlag;
          return (
            customMadeFlag === 1 && (
              <ItemCustom
                {...{
                  customAttributeList: value,
                  record,
                  disabled: !(
                    urlflagIf &&
                    record.cancelledFlag === 0 &&
                    record.closedFlag === 0 &&
                    record.occupyFlag !== 1
                  ),
                  customMadeFlag,
                }}
              />
            )
          );
        },
      },
      // {
      //   title: intl.get(`${commonPrompt}.itemAbcClass`).d('物料ABC属性'),
      //   dataIndex: 'itemAbcClass',
      //   width: 180,
      //   // render: val => ({ val }),
      // },
      {
        title: doubleUintFlag
          ? intl.get(`${commonPrompt}.baseUom`).d('基本单位')
          : intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'uomId',
        width: 180,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 &&
          !doubleUintFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator('uomPrecision', {
                initialValue: record.uomPrecision,
              })}
              {record.$form.getFieldDecorator(`uomId`, {
                rules: [
                  {
                    required: !isEComAndReject,
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
                    itemId:
                      prSourcePlatform === 'SRM'
                        ? record.$form.getFieldValue('itemId') || record.itemId
                        : undefined,
                    invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                  }}
                />
              )}
            </FormItem>
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator('uomId', {
                initialValue: record.uomId,
              })}
              {record.uomCodeAndName}
            </FormItem>
          ),
      },
      {
        title: doubleUintFlag
          ? intl.get(`${commonPrompt}.baseQuantity`).d('基本数量')
          : intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 120,
        render: (val, record) =>
          urlflagIf &&
          record.occupiedQuantity < val &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 &&
          !doubleUintFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`quantity`, {
                rules: [
                  {
                    required: !(isEComAndReject || isCatalogOrECom),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.quantity`).d('数量'),
                    }),
                  },
                  {
                    validator: (_, value, callback) => {
                      if (record.occupiedQuantity && value < record.occupiedQuantity) {
                        callback(
                          intl
                            .get(`sprm.common.message.mustExceedOccupiedQuantity`)
                            .d('数量必须已占用数量')
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],

                // initialValue: record.quantity,
                initialValue:
                  (record?.quantity?.toString()?.split('.')?.[1]?.length ?? 0) >
                  (record.$form.getFieldValue('uomPrecision') ?? record.uomPrecision ?? 10)
                    ? record.quantity.toFixed(
                        record.$form.getFieldValue('uomPrecision') ?? record.uomPrecision ?? 10
                      )
                    : record.quantity,
              })(
                <NumberField
                  {...precisionParams(record.uomPrecision ?? 10, false)}
                  numberGrouping
                  min={0}
                  disabled
                  onChange={handleEditFlagTrue}
                />
              )}
            </FormItem>
          ) : (
            numberPrecision(val, record.uomPrecision)
          ),
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
                    required: !isEComAndReject,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.uomName`).d('单位'),
                    }),
                  },
                ],
                initialValue: record.secondaryUomId,
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
                      ]).then(res => {
                        const result = getResponse(res);
                        if (result && !res.failed) {
                          record.$form.setFieldsValue({
                            ...baseUomProps,
                            quantity: res[0]?.primaryQuantity,
                          });
                          const listDataSource = dataSource?.map(item => {
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
                    } else if (!itemId && doubleUintFlag) {
                      record.$form.setFieldsValue({
                        ...baseUomProps,
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
                      });
                      const listDataSource = dataSource?.map(item => {
                        if (item.prLineId === record.prLineId) {
                          return {
                            ...item,
                            ...baseUomProps,
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
                    } else {
                      record.$form.setFieldsValue({
                        ...baseUomProps,
                      });
                      const listDataSource = dataSource?.map(item => {
                        if (item.prLineId === record.prLineId) {
                          return {
                            ...item,
                            ...baseUomProps,
                          };
                        }
                        return item;
                      });
                      onChangeListData(listDataSource);
                    }
                  }}
                  queryParams={{
                    tenantId,
                    itemId:
                      prSourcePlatform === 'SRM'
                        ? record.$form.getFieldValue('itemId') || record.itemId
                        : undefined,
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
                    required: !(isEComAndReject || isCatalogOrECom),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.quantity`).d('数量'),
                    }),
                  },
                  {
                    validator: (_, value, callback) => {
                      if (record.occupiedQuantity && value < record.occupiedQuantity) {
                        callback(
                          intl
                            .get(`sprm.common.message.mustExceedOccupiedQuantity`)
                            .d('数量必须已占用数量')
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],

                // initialValue: record.quantity,
                initialValue:
                  (record?.secondaryQuantity?.toString()?.split('.')?.[1]?.length ?? 0) >
                  (record.$form.getFieldValue(' secondaryUomPrecision') ??
                    record.secondaryUomPrecision ??
                    10)
                    ? record.quantity.toFixed(
                        record.$form.getFieldValue('secondaryUomPrecision') ??
                          record.secondaryUomPrecision ??
                          10
                      )
                    : record.secondaryQuantity,
              })(
                <NumberField
                  // {...(isNumber(record.$form.getFieldValue('uomPrecision') || record.uomPrecision)
                  //   ? {
                  //       // precision:
                  //       //   record.$form.getFieldValue('uomPrecision') || record.uomPrecision ?? 6,
                  //     }
                  //   : {})}
                  // parser={(value) =>
                  //   parseAumont(
                  //     value,
                  //     record.$form.getFieldValue('uomPrecision') ?? record.uomPrecision ?? 10
                  //   )
                  // }
                  {...precisionParams(record.uomPrecision ?? 10, false)}
                  numberGrouping
                  min={0}
                  disabled
                  onChange={value => {
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
                        ]).then(res => {
                          if (res && !res.failed) {
                            onChangeListData(
                              dataSource?.map(item => {
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
                          dataSource?.map(item => {
                            if (item.prLineId === record.prLineId) {
                              return {
                                ...item,
                                quantity: value || item.quantity,
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
        title: intl.get(`${commonPrompt}.taxType`).d('税种'),
        dataIndex: 'taxId',
        width: 120,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`taxId`, {
                initialValue: record.taxId,
              })(
                <Lov
                  code="SPRM.TAX"
                  textField="taxCode"
                  textValue={record.taxCode}
                  disabled
                  queryParams={{ tenantId, taxFrom: 'RATIO' }}
                  onChange={(value, lovRecord) => {
                    this.handleChangeTax(value, lovRecord, record);
                    handleEditFlagTrue();
                  }}
                />
              )}
            </FormItem>
          ) : (
            record.taxCode
          ),
      },
      {
        title: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 120,
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
                initialValue: record.currencyCode,
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
        width: 165,
        dataIndex: 'taxIncludedUnitPrice',
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? (
            record.taxIncludedUnitPriceMeaning
          ) : urlflagIf &&
            record.occupyFlag !== 1 &&
            record.occupiedQuantity === 0 &&
            record.cancelledFlag === 0 &&
            record.closedFlag === 0 &&
            !doubleUintFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`taxIncludedUnitPrice`, {
                initialValue: val,
              })(
                <NumberField
                  min={0}
                  disabled={!basePriceFlag}
                  onChange={handleEditFlagTrue}
                  {...precisionParams(record.localDefaultPrecision, prSourcePlatform !== 'SRM')}
                  numberGrouping
                />
              )}
            </FormItem>
          ) : (
            thousandBitSeparator(val, record.localDefaultPrecision, true)
          ),
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        width: 165,
        dataIndex: 'secondaryTaxInUnitPrice',
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
                  {...precisionParams(record.localDefaultPrecision, prSourcePlatform !== 'SRM')}
                  numberGrouping
                />
              )}
            </FormItem>
          ) : (
            thousandBitSeparator(val, record.localDefaultPrecision, true)
          ),
      },
      {
        title: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
        dataIndex: 'taxIncludedLineAmount',
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
              {record.$form.getFieldDecorator(`taxIncludedLineAmount`, {
                initialValue: val,
              })(
                <Currency
                  min={0}
                  disabled
                  onChange={handleEditFlagTrue}
                  {...precisionParams(record.financialPrecision, prSourcePlatform !== 'SRM')}
                  numberGrouping
                />
              )}
            </FormItem>
          ) : record.linePriceHiddenFlag === 1 ? (
            record.taxIncludedLineAmountMeaning
          ) : (
            thousandBitSeparator(val, record.financialPrecision, prSourcePlatform !== 'SRM')
          ),
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
        dataIndex: 'taxIncludedBudgetUnitPrice',
        width: 120,
        align: 'right',
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`taxIncludedBudgetUnitPrice`, {
                initialValue: val,
              })(
                <NumberField
                  min={0}
                  disabled
                  onChange={handleEditFlagTrue}
                  {...precisionParams(record.financialPrecision, prSourcePlatform !== 'SRM')}
                  numberGrouping
                />
              )}
            </FormItem>
          ) : record.linePriceHiddenFlag === 1 ? (
            record.taxIncludedBudgetUnitPriceMeaning
          ) : (
            thousandBitSeparator(val, record.defaultPrecision, true)
          ),
      },
      {
        title: intl.get(`${commonPrompt}.budgetAccountName`).d('预算科目'),
        dataIndex: 'budgetAccountName',
        width: 120,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`budgetAccountId`, {
                initialValue: record.budgetAccountId,
              })(
                <Lov
                  code="SMDM.BUDGET_ACCOUNT"
                  textValue={record.budgetAccountName}
                  queryParams={{ tenantId, companyId }}
                  lovOptions={{ displayField: 'budgetAccountName', valueField: 'budgetAccountId' }}
                  onChange={(_, data) => {
                    handleEditFlagTrue();
                    record.$form.registerField('budgetAccountNum');
                    record.$form.setFieldsValue({
                      budgetAccountNum: data.budgetAccountNum,
                    });
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.budgetIoFlag`).d('预算外标识'),
        dataIndex: 'budgetIoFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        width: 150,
        dataIndex: 'neededDate',
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
                initialValue: record.neededDate ? moment(record.neededDate) : undefined,
              })(
                <DatePicker
                  disabled
                  placeholder={null}
                  format={getDateFormat()}
                  onChange={handleEditFlagTrue}
                  disabledDate={current => current && current < moment('1970-01-01').startOf('day')}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${modelPrompt}.supplierCompanyId`).d('建议供应商'),
        width: 120,
        dataIndex: 'supplierCompanyLists',
        render: (_, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`displaySupplierName`, {
                initialValue: record.supplierName || record.supplierCompanyName,
              })(
                <MultipleLov
                  code="SPRM.SUPPLIER"
                  textValue={record.supplierName || record.supplierCompanyName}
                  disabled
                  queryParams={{ tenantId, companyId }}
                  allowClear
                  lovOptions={{ displayField: 'displaySupplierName' }}
                  oldValueField="supplierList"
                  oldValue={record.supplierList || []}
                  onChange={handleEditFlagTrue}
                />
              )}
              {record.$form.getFieldDecorator('newSupplierList', {
                initialValue: record.supplierList,
              })}
            </FormItem>
          ) : (
            record.supplierName || record.supplierCompanyName
          ),
      },
      {
        title: intl.get(`${modelPrompt}.supplierCompanyId`).d('建议供应商'),
        width: 120,
        dataIndex: 'supplierCompanyId',
        render: (_, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`displaySupplierName`, {
                initialValue: record.supplierName || record.supplierCompanyName,
              })(
                <TooltipLov
                  tipValue={record.supplierName || record.supplierCompanyName}
                  code="SPRM.SUPPLIER"
                  textValue={record.supplierName || record.supplierCompanyName}
                  disabled
                  queryParams={{ tenantId, companyId }}
                  lovOptions={{ displayField: 'displaySupplierName' }}
                  // onChange={handleEditFlagTrue}
                  onChange={(value, lovRecord) => {
                    this.handleChangeSupplier(value, lovRecord, record);
                    handleEditFlagTrue();
                  }}
                />
              )}
            </FormItem>
          ) : (
            record.displaySupplierName
          ),
      },
      {
        title: intl.get(`${modelPrompt}.lastPurPrice`).d('上次采购单价'),
        width: 120,
        dataIndex: 'lastPurPrice',
      },
      {
        title: intl.get(`${modelPrompt}.xyNum`).d('协议编号'),
        dataIndex: 'pcNum',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.prMan`).d('申请人'),
        dataIndex: 'prRequestedName',
        width: 150,
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
                      ? `${record.prRequestedNum}-${record.prRequestedName}`
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
                        ? `${dataList.loginName}-${dataList.userName}`
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
            <span>{record.prRequestedNum ? `${record.prRequestedNum}-${val}` : val}</span>
          ),
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
        dataIndex: 'agentName',
        width: 150,
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
        title: intl.get(`${commonPrompt}.moneyPayPart`).d('费用承担部门'),
        dataIndex: 'expBearDep',
        width: 150,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`expBearDepId`, {
                initialValue: record.expBearDepId,
              })(
                <Lov
                  code="SPFM.UNIT_G_C"
                  textValue={val}
                  textField="expBearDep"
                  queryParams={{
                    organizationId: tenantId,
                    levelPathFrom: 0,
                    levelPathTo: 3,
                    unitTypeCode: 'D',
                    unitCompanyId: parentUnitId,
                  }}
                  disabled
                  onChange={handleEditFlagTrue}
                />
              )}
              {record.$form.getFieldDecorator('expBearDep', {
                initialValue: record.expBearDep,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        width: 120,
        dataIndex: 'costId',
        render: (val, record) =>
          urlflagIf &&
          companyId &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`costId`, {
                initialValue: record.costId,
              })(
                <Lov
                  disabled
                  code="SPRM.COST_CENTER"
                  textValue={record.costName}
                  textField="costName"
                  lovOptions={{ valueField: 'costId', displayField: 'costName' }}
                  queryParams={{ companyId, tenantId, ouId }}
                  // onChange={(value, lovRecord) => this.handleCostCenter(value, lovRecord, record)}
                  onChange={handleEditFlagTrue}
                />
              )}
              {record.$form.getFieldDecorator('costName', {})}
            </FormItem>
          ) : (
            record.costName
          ),
      },
      {
        title: intl.get(`sprm.common.model.sumProject`).d('总帐科目'),
        width: 120,
        dataIndex: 'accountSubjectId',
        render: (val, record) =>
          urlflagIf &&
          companyId &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`accountSubjectId`, {
                initialValue: val,
              })(
                <Lov
                  disabled
                  code="SPRM.ACCOUNT_SUBJECT"
                  textValue={record.accountSubjectName}
                  textField="accountSubjectName"
                  lovOptions={{
                    valueField: 'accountSubjectId',
                    displayField: 'accountSubjectName',
                  }}
                  queryParams={{ tenantId, companyId }}
                  onChange={handleEditFlagTrue}
                  // onChange={(value, lovRecord) =>
                  //   this.handleLedgerAccount(value, lovRecord, record)
                  // }
                />
              )}
              {record.$form.getFieldDecorator('accountSubjectName', {})}
            </FormItem>
          ) : (
            record.accountSubjectName
          ),
      },
      {
        title: intl.get(`${commonPrompt}.projectNum`).d('项目号'),
        width: 165,
        dataIndex: 'projectNum',
        align: 'left',
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`projectNum`, {
                rules: [
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', { max: 60 }),
                  },
                ],
                initialValue: val,
              })(<Input onChange={handleEditFlagTrue} disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.projectName`).d('项目名称'),
        width: 165,
        dataIndex: 'projectName',
        align: 'left',
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`projectName`, {
                rules: [
                  {
                    max: 240,
                    message: intl.get('hzero.common.validation.max', { max: 240 }),
                  },
                ],
                initialValue: val,
              })(<Input onChange={handleEditFlagTrue} disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      // {
      //   title: intl.get(`${commonPrompt}.projectCarNum`).d('项目号车号'),
      //   width: 165,
      //   dataIndex: 'craneNum',
      //   align: 'left',
      //   render: (val, record) =>
      //     urlflagIf &&
      //     canModifyFlagArr.includes('craneNum') &&
      //     record.cancelledFlag === 0 &&
      //     record.closedFlag === 0 ? (
      //       <FormItem>
      //         {record.$form.getFieldDecorator(`craneNum`, {
      //           rules: [
      //             {
      //               max: 60,
      //               message: intl.get('hzero.common.validation.max', { max: 60 }),
      //             },
      //           ],
      //           initialValue: val,
      //         })(<Input onChange={handleEditFlagTrue} disabled={record.occupyFlag === 1} />)}
      //       </FormItem>
      //     ) : (
      //       val
      //     ),
      // },
      // {
      //   title: intl.get(`${commonPrompt}.inpaperNum`).d('内部订单号'),
      //   width: 165,
      //   dataIndex: 'innerPoNum',
      //   align: 'left',
      //   render: (val, record) =>
      //     urlflagIf &&
      //     canModifyFlagArr.includes('innerPoNum') &&
      //     record.cancelledFlag === 0 &&
      //     record.closedFlag === 0 ? (
      //       <FormItem>
      //         {record.$form.getFieldDecorator(`innerPoNum`, {
      //           initialValue: val,
      //         })(<Input onChange={handleEditFlagTrue} disabled={record.occupyFlag === 1} />)}
      //       </FormItem>
      //     ) : (
      //       val
      //     ),
      // },
      {
        title: intl.get(`${commonPrompt}.itemModel`).d('型号'),
        width: 165,
        dataIndex: 'itemModel',
        align: 'left',
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemModel`, {
                initialValue: val,
              })(<Input disabled onChange={handleEditFlagTrue} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.itemSpecs`).d('规格'),
        width: 165,
        dataIndex: 'itemSpecs',
        align: 'left',
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemSpecs`, {
                initialValue: val,
              })(<Input disabled onChange={handleEditFlagTrue} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      // {
      //   title: intl.get(`${commonPrompt}.quantityStandard`).d('质量标准'),
      //   width: 165,
      //   dataIndex: 'qualityStandard',
      //   align: 'left',
      // },
      // {
      //   title: intl.get(`${commonPrompt}.drawingNum`).d('图号'),
      //   width: 165,
      //   dataIndex: 'drawingNum',
      //   align: 'left',
      //   render: (val, record) =>
      //     urlflagIf &&
      //     canModifyFlagArr.includes('drawingNum') &&
      //     record.cancelledFlag === 0 &&
      //     record.closedFlag === 0 ? (
      //       <FormItem>
      //         {record.$form.getFieldDecorator(`drawingNum`, {
      //           rules: [
      //             {
      //               max: 60,
      //               message: intl.get('hzero.common.validation.max', { max: 60 }),
      //             },
      //           ],
      //           initialValue: val,
      //         })(<Input onChange={handleEditFlagTrue} disabled={record.occupyFlag === 1} />)}
      //       </FormItem>
      //     ) : (
      //       val
      //     ),
      // },
      // {
      //   title: intl.get(`${commonPrompt}.drawingVersion`).d('图纸版本'),
      //   width: 165,
      //   dataIndex: 'drawingVersion',
      //   align: 'left',
      //   render: (val, record) =>
      //     urlflagIf &&
      //     canModifyFlagArr.includes('drawingVersion') &&
      //     record.cancelledFlag === 0 &&
      //     record.closedFlag === 0 ? (
      //       <FormItem>
      //         {record.$form.getFieldDecorator(`drawingVersion`, {
      //           rules: [
      //             {
      //               max: 60,
      //               message: intl.get('hzero.common.validation.max', { max: 60 }),
      //             },
      //           ],
      //           initialValue: val,
      //         })(<Input onChange={handleEditFlagTrue} disabled={record.occupyFlag === 1} />)}
      //       </FormItem>
      //     ) : (
      //       val
      //     ),
      // },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 300,
        render: (val, record) =>
          urlflagIf &&
          record.occupyFlag !== 1 &&
          record.occupiedQuantity === 0 &&
          record.cancelledFlag === 0 &&
          record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`remark`, {
                initialValue: record.remark,
              })(<Input style={{ minWidth: '250px' }} disabled onChange={handleEditFlagTrue} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      // {
      //   title: intl.get(`${commonPrompt}.class`).d('属性'),
      //   dataIndex: 'itemProperties',
      //   width: 150,
      //   render: (val, record) =>
      //     urlflagIf &&
      //     canModifyFlagArr.includes('itemProperties') &&
      //     record.cancelledFlag === 0 &&
      //     record.closedFlag === 0 ? (
      //       <FormItem>
      //         {record.$form.getFieldDecorator(`itemProperties`, {
      //           initialValue: record.itemProperties,
      //         })(
      //           <Select
      //             style={{ width: '100%' }}
      //             onChange={handleEditFlagTrue}
      //             disabled={record.occupyFlag === 1}
      //           >
      //             {itemProperties &&
      //               itemProperties.map((item) => (
      //                 <Option key={item.value} value={item.value}>
      //                   {item.meaning}
      //                 </Option>
      //               ))}
      //           </Select>
      //         )}
      //       </FormItem>
      //     ) : (
      //       val
      //     ),
      // },
      // {
      //   title: intl.get(`${commonPrompt}.keepMan`).d('保管人'),
      //   dataIndex: 'keeperUserName',
      //   width: 150,
      //   render: (val, record) =>
      //     urlflagIf &&
      //     canModifyFlagArr.includes('keeperUserId') &&
      //     record.cancelledFlag === 0 &&
      //     record.closedFlag === 0 ? (
      //       <FormItem>
      //         {record.$form.getFieldDecorator(`keeperUserId`, {
      //           initialValue: record.keeperUserId,
      //         })(
      //           <Lov
      //             code="SPCM.ACCEPT_USER"
      //             textValue={val}
      //             disabled={record.occupyFlag === 1}
      //             queryParams={{ tenantId }}
      //             onChange={handleEditFlagTrue}
      //           />
      //         )}
      //       </FormItem>
      //     ) : (
      //       val
      //     ),
      // },
      // {
      //   title: intl.get(`${commonPrompt}.takeman`).d('验收人'),
      //   dataIndex: 'accepterUserName',
      //   width: 150,
      //   render: (val, record) =>
      //     urlflagIf &&
      //     canModifyFlagArr.includes('accepterUserId') &&
      //     record.cancelledFlag === 0 &&
      //     record.closedFlag === 0 ? (
      //       <FormItem>
      //         {record.$form.getFieldDecorator(`accepterUserId`, {
      //           initialValue: record.accepterUserId,
      //         })(
      //           <Lov
      //             code="SPCM.ACCEPT_USER"
      //             textValue={val}
      //             disabled={record.occupyFlag === 1}
      //             queryParams={{ tenantId }}
      //             onChange={handleEditFlagTrue}
      //           />
      //         )}
      //       </FormItem>
      //     ) : (
      //       val
      //     ),
      // },
      // {
      //   title: intl.get(`${commonPrompt}.address`).d('地点'),
      //   dataIndex: 'address',
      //   width: 150,
      //   render: (val, record) =>
      //     urlflagIf &&
      //     canModifyFlagArr.includes('address') &&
      //     record.cancelledFlag === 0 &&
      //     record.closedFlag === 0 ? (
      //       <FormItem>
      //         {record.$form.getFieldDecorator(`address`, {
      //           initialValue: record.address,
      //         })(
      //           <Select
      //             style={{ width: '100%' }}
      //             onChange={handleEditFlagTrue}
      //             disabled={record.occupyFlag === 1}
      //           >
      //             {address &&
      //               address.map((item) => (
      //                 <Option key={item.value} value={item.value}>
      //                   {item.meaning}
      //                 </Option>
      //               ))}
      //           </Select>
      //         )}
      //       </FormItem>
      //     ) : (
      //       val
      //     ),
      // },
      {
        title: intl.get('entity.attachment.tag').d('附件'),
        dataIndex: 'attachmentUuid',
        width: 130,
        render: (val, record) => {
          const uploadProps = {
            bucketName: PRIVATE_BUCKET,
            bucketDirectory: 'sprm-pr',
            btnText: urlflagIf
              ? intl.get(`entity.attachment.upload`).d('附件上传')
              : intl.get(`entity.attachment.view`).d('附件查看'),
            attachmentUUID: record.attachmentUuid,
            viewOnly: !(urlflagIf && record.cancelledFlag === 0 && record.closedFlag === 0),
            showFilesNumber: true,
            icon: false,
          };
          return urlflagIf && record.cancelledFlag === 0 && record.closedFlag === 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`attachmentUuid`, {
                initialValue: record.attachmentUuid,
              })(<UploadModal {...uploadProps} />)}
            </FormItem>
          ) : (
            <UploadModal {...uploadProps} />
          );
        },
      },
    ];
    if (cuxCols && cuxCols?.length > 0) {
      columns.push(...cuxCols);
    }
    return columns;
  }

  /**
   * onCell - 设置表格单元格属性函数
   */
  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 300,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  @Bind()
  getColumns() {
    const { prSourcePlatform, doubleUintFlag } = this.props;
    const isDisabled = prSourcePlatform === 'CATALOGUE' || prSourcePlatform === 'E-COMMERCE';
    const columns = {
      base: [
        {
          title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
          dataIndex: 'displayLineNum',
          width: 80,
        },
        {
          title: intl.get(`${commonPrompt}.occupiedQuantity`).d('已执行数量'),
          dataIndex: 'occupiedQuantity',
          render: (val, record) => {
            return numberPrecision(val, record.uomPrecision);
          },
          width: 120,
        },
        {
          title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
          dataIndex: 'invOrganizationName',
          width: 120,
          render: val => <Tooltip title={val}>{val}</Tooltip>,
        },
      ],
      mall: [
        {
          title: intl.get(`${commonPrompt}.productNum`).d('商品编码'),
          dataIndex: 'productNum',
          width: 120,
        },
        {
          title: intl.get(`sprm.common.model.common.thirdSkuCode`).d('第三方商品编码'),
          width: 120,
          dataIndex: 'thirdSkuCode',
        },
        {
          title: intl.get(`sprm.common.model.common.thirdSkuName`).d('第三方商品名称'),
          width: 120,
          dataIndex: 'thirdSkuName',
        },
        {
          title: intl.get(`${commonPrompt}.productName`).d('商品名称'),
          dataIndex: 'productName',
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.catalogName`).d('商品目录'),
          dataIndex: 'catalogName',
          width: 120,
        },
        {
          title: intl.get(`sprm.common.shoppingMall.model.productBrand`).d('商品品牌'),
          dataIndex: 'productBrand',
          width: 120,
        },
        {
          title: intl.get(`sprm.common.shoppingMall.model.productModel`).d('商品型号'),
          dataIndex: 'productModel',
          width: 120,
        },
        {
          title: intl.get(`sprm.common.shoppingMall.model.packingList`).d('商品规格'),
          dataIndex: 'packingList',
          width: 120,
        },
      ],
      other: [
        {
          title: intl.get(`entity.item.code`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 120,
          render: val => <Tooltip title={val}>{val}</Tooltip>,
        },
        {
          title: intl.get(`entity.item.name`).d('物料名称'),
          dataIndex: 'itemName',
          width: 120,
          render: val => <Tooltip title={val}>{val}</Tooltip>,
        },
        {
          title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
          dataIndex: 'categoryName',
          width: 120,
          render: val => <Tooltip title={val}>{val}</Tooltip>,
        },
        {
          title: intl.get(`sprm.common.model.common.mallLineNum`).d('商城行号'),
          width: 150,
          dataIndex: 'mallLineNum',
        },
        // {
        //   title: intl.get(`${commonPrompt}.quantityStandard`).d('质量标准'),
        //   width: 165,
        //   dataIndex: 'qualityStandard',
        //   align: 'left',
        // },
      ],
      // otherABC: [
      //   {
      //     title: intl.get(`${commonPrompt}.itemAbcClass`).d('物料ABC属性'),
      //     dataIndex: 'itemAbcClass',
      //     width: 180,
      //   },
      // ],
      otherTwo: [
        {
          title: doubleUintFlag
            ? intl.get(`${commonPrompt}.baseUom`).d('基本单位')
            : intl.get(`${commonPrompt}.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          render: (val, record) => <span>{record.uomCodeAndName || record.uomName}</span>,
        },
        {
          title: doubleUintFlag
            ? intl.get(`${commonPrompt}.baseQuantity`).d('基本数量')
            : intl.get(`${commonPrompt}.quantity`).d('数量'),
          dataIndex: 'quantity',
          render: (val, record) => {
            return numberPrecision(val, record.uomPrecision);
          },
          width: 120,
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
          title: intl.get(`${commonPrompt}.taxType`).d('税种'),
          dataIndex: 'taxCode',
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.taxRate`).d('税率'),
          dataIndex: 'taxRate',
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
          dataIndex: 'currencyCode',
          width: 120,
        },
        {
          title: doubleUintFlag
            ? intl.get(`${commonPrompt}.baseTaxIncludedUnitPrice`).d('预估单价(含税)-基本单位')
            : intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
          dataIndex: 'taxIncludedUnitPrice',
          align: 'right',
          render: (val, record) =>
            record.linePriceHiddenFlag === 1
              ? record.taxIncludedUnitPriceMeaning
              : thousandBitSeparator(val, record.defaultPrecision, true),
          width: 130,
        },
        {
          title: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
          dataIndex: 'taxIncludedLineAmount',
          align: 'right',
          render: (val, record) =>
            record.linePriceHiddenFlag === 1
              ? record.taxIncludedLineAmountMeaning
              : thousandBitSeparator(val, record.financialPrecision, prSourcePlatform !== 'SRM'),
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
          dataIndex: 'taxIncludedBudgetUnitPrice',
          width: 120,
          align: 'right',
          render: (val, record) =>
            record.linePriceHiddenFlag === 1
              ? record.taxIncludedBudgetUnitPriceMeaning
              : thousandBitSeparator(val, record.defaultPrecision, true),
        },
        {
          title: intl.get(`${commonPrompt}.budgetAccountName`).d('预算科目'),
          dataIndex: 'budgetAccountName',
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.budgetIoFlag`).d('预算外标识'),
          dataIndex: 'budgetIoFlag',
          width: 120,
          render: yesOrNoRender,
        },
        {
          title: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
          dataIndex: 'neededDate',
          width: 150,
          render: dateRender,
        },
        {
          title: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
          dataIndex: 'costName',
          width: 180,
        },
        {
          title: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
          dataIndex: 'accountSubjectName',
          width: 180,
        },
        {
          title: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
          dataIndex: 'wbs',
          width: 180,
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          width: 150,
        },
        {
          title: intl.get(`entity.business.tag`).d('业务实体'),
          dataIndex: 'ouName',
          width: 150,
        },
        {
          title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
          dataIndex: 'purchaseOrgName',
          width: 150,
        },
        {
          title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
          dataIndex: 'purchaseAgentName',
          width: 100,
        },
        {
          title: intl.get(`entity.supplier.tag`).d('供应商'),
          dataIndex: 'supplierName',
          width: 150,
          render: (val, record) => (
            <Tooltip title={record.supplierName || record.supplierCompanyName}>
              {record.supplierName || record.supplierCompanyName}
            </Tooltip>
          ),
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
      ],
      otherProject: [
        {
          title: intl.get(`${commonPrompt}.projectNum`).d('项目号'),
          width: 165,
          dataIndex: 'projectNum',
          align: 'left',
        },
        {
          title: intl.get(`${commonPrompt}.projectName`).d('项目名称'),
          width: 165,
          dataIndex: 'projectName',
          align: 'left',
        },
        // {
        //   title: intl.get(`${commonPrompt}.projectCarNum`).d('项目号车号'),
        //   width: 165,
        //   dataIndex: 'craneNum',
        //   align: 'left',
        // },
        {
          title: intl.get(`${commonPrompt}.drawingNum`).d('图号'),
          width: 165,
          dataIndex: 'drawingNum',
          align: 'left',
        },
      ],
      otherRemark: [
        {
          title: intl.get(`hzero.common.remark`).d('备注'),
          dataIndex: 'remark',
          onCell: this.onCell,
          width: 200,
          render: text => <Tooltip title={text}>{text}</Tooltip>,
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
      ],
    };
    const specialReference = [
      {
        title: intl.get(`${commonPrompt}.skuTypeMark`).d('定制品标识'),
        width: 150,
        dataIndex: 'skuType',
      },
      {
        title: intl.get(`${commonPrompt}.customUomName`).d('定制单位'),
        width: 150,
        dataIndex: 'customUomName',
      },
      {
        title: intl.get(`${commonPrompt}.customQuantity`).d('定制数量'),
        width: 150,
        dataIndex: 'customQuantity',
      },
      {
        title: intl.get(`${commonPrompt}.packageQuantity`).d('份数'),
        width: 150,
        dataIndex: 'packageQuantity',
      },
      {
        title: intl.get(`${commonPrompt}.customSpecsJson`).d('定制品属性'),
        width: 150,
        dataIndex: 'customSpecsJson',
        render: val => (
          <a
            onClick={() => {
              this.setState({
                customData: val ? JSON.parse(val) : [],
                specsJsonType: 'custom',
                customVisable: true,
              });
            }}
          >
            {intl.get(`${commonPrompt}.customSpecsJson`).d('定制品属性')}
          </a>
        ),
      },
    ];
    const productSpec = [
      {
        title: intl.get(`${commonPrompt}.productSpecsJson`).d('商品属性'),
        width: 150,
        dataIndex: 'productSpecsJson',
        render: val => (
          <a
            onClick={() => {
              this.setState({
                customData: val ? JSON.parse(val) : [],
                specsJsonType: 'product',
                customVisable: true,
              });
            }}
          >
            {intl.get(`${commonPrompt}.productSpecsJson`).d('商品属性')}
          </a>
        ),
      },
    ];
    if (prSourcePlatform === 'E-COMMERCE') {
      columns.other.splice(
        10,
        0,
        {
          title: intl.get(`${commonPrompt}.lineFreight`).d('行运费'),
          dataIndex: 'lineFreight',
          align: 'right',
          render: (val, record) =>
            record.linePriceHiddenFlag === 1
              ? record.lineFreightMeaning
              : thousandBitSeparator(val),
          width: 120,
        },
        ...productSpec
      );
    }
    if (prSourcePlatform === 'CATALOGUE') {
      columns.base.push(...specialReference, ...productSpec);
    }

    return isDisabled
      ? columns.base.concat(columns.mall, columns.other, columns.otherTwo, columns.otherRemark)
      : columns.base.concat(
          columns.other,
          // columns.otherABC,
          columns.otherTwo,
          columns.otherProject,
          columns.otherRemark
        );
  }

  /**
   * 取消按钮
   * @memberof Cancel
   */
  @Bind()
  handleCancel() {
    const { selectedRows = [] } = this.state;
    const { dispatch, form, onFetchDetailHeader, onFetchDetailList } = this.props;
    const { cancelledRemark } = form.getFieldsValue();
    return dispatch({
      type: 'purchaseRequisitionCancel/cancelPurchase',
      payload: { selectedRows: selectedRows?.map(item => ({ ...item, cancelledRemark })) },
    }).then(res => {
      if (res) {
        this.setState({
          selectedRows: [],
        });
        onFetchDetailHeader();
        onFetchDetailList();
      }
    });
  }

  /**
   * 关闭按钮
   * @memberof Close
   */
  @Bind()
  handleClose() {
    const { selectedRows } = this.state;
    const { dispatch, form, onFetchDetailHeader, onFetchDetailList } = this.props;
    const ifCanClose = selectedRows.every(item =>
      ['SUSPEND', 'ASSIGNED', 'APPROVED'].includes(item.prLineStatusCode)
    );
    if (ifCanClose) {
      const { closedRemark } = form.getFieldsValue();
      return dispatch({
        type: 'purchaseRequisitionCancel/fetchPurchaseLinesClose',
        payload: selectedRows?.map(item => ({ ...item, closedRemark })),
      }).then(res => {
        if (res) {
          const { successCounts, failedCounts } = res;
          this.setState({
            selectedRows: [],
          });
          onFetchDetailHeader();
          onFetchDetailList();
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

  @Bind()
  handleCancelClose(type) {
    const { promptModalVisible } = this.state;
    this.setState({ promptModalVisible: !promptModalVisible, promptModalFlag: type });
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  @Bind()
  promptModalHandleCancel() {
    this.setState({ promptModalFlag: '', promptModalVisible: false });
  }

  render() {
    const {
      loading,
      onSearch,
      pagination = {},
      dataSource = [],
      prSourcePlatform,
      customizeTable,
      form,
      urlflagIf,
      isNew,
      // lineCancelPermisson,
      isNewTeant,
      doubleUintFlag,
      headerInfo,
    } = this.props;
    const {
      promptModalVisible,
      promptModalFlag,
      selectedRows = [],
      customVisable,
      customData,
      specsJsonType,
    } = this.state;
    const { changedFlag, cancelStatusCode } = headerInfo;
    const SRMIF = prSourcePlatform === 'SRM';
    const columns = SRMIF ? this.getColumnSRM() : this.getColumns();
    if (isNewTeant && (SRMIF || prSourcePlatform === 'SHOP')) {
      columns.splice(1, 0, {
        title: intl.get(`${commonPrompt}.operable`).d('可操作类型'),
        width: 120,
        dataIndex: 'operable',
        render: (_, record) => {
          if (changedFlag === 1) {
            return null;
          }
          return (
            (record.prLineCancelledFlag === 1 || record.prLineClosedFlag === 1) && (
              <span>
                {record.prLineCancelledFlag === 1 && (
                  <Tag color="blue">{intl.get(`${commonPrompt}.cancellable`).d('可取消')}</Tag>
                )}
                {record.prLineClosedFlag === 1 && (
                  <Tag color="blue">{intl.get(`${commonPrompt}.closable`).d('可关闭')}</Tag>
                )}
              </span>
            )
          );
        },
      });
    }
    // const rowSelection = SRMIF ? {rowSelection: {
    //   selectedRowKeys: selectedRows.map(item => item.prLineId),
    //   onChange: handleChangeSelectRowKeys,
    // }} : null;
    const rowSelection = {
      selectedRowKeys: selectedRows?.map(n => n.prLineId),
      onChange: this.onSelectChange,
    };
    const scrollX = sum(columns?.map(n => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      loading,
      columns: doubleUintFlag
        ? columns
        : columns.filter(
            ele =>
              ![
                'secondaryUomId',
                'secondaryUomCode',
                'secondaryUomName',
                'secondaryTaxInUnitPrice',
                'secondaryQuantity',
              ].includes(ele.dataIndex)
          ),
      dataSource,
      pagination,
      bordered: true,
      rowKey: 'prLineId',
      onChange: page => onSearch(page),
      scroll: { x: scrollX },
      // ...rowSelection,
      rowSelection,
    };
    const promptModalProps = {
      visible: promptModalVisible,
      form,
      flag: promptModalFlag,
      params: { prLineIds: selectedRows?.map(n => n.prLineId) },
      promptTitle:
        promptModalFlag === 'cancelledRemark'
          ? intl.get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`).d('取消原因')
          : promptModalFlag === 'closedRemark'
          ? intl.get(`sprm.purchaseRequisitionCancel.view.message.closeReason`).d('关闭原因')
          : intl.get(`sprm.purchaseRequisitionCancel.view.message.sendBackReason`).d('退回原因'),
      handleOk: this.promptModalHandleOk,
      handleCancel: this.promptModalHandleCancel,
    };
    const CustomSpecProps = {
      specsJsonType,
      visible: customVisable,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisable: false });
      },
    };

    const cancelFlag = selectedRows.some(ele => ele.prLineCancelledFlag !== 1);
    const closeFlag = selectedRows.some(ele => ele.prLineClosedFlag !== 1);
    return (
      <Fragment>
        {!urlflagIf && (
          <div className={styles['purchase-application']}>
            <Form layout="inline">
              {['SHOP', 'SRM'].includes(prSourcePlatform) && changedFlag !== 1 && (
                <>
                  {isNewTeant &&
                    (isNew ? (
                      <Button
                        onClick={() => this.handleCancelClose('closedRemark')}
                        disabled={
                          selectedRows.length === 0 ||
                          !selectedRows.every(ele =>
                            ['APPROVED', 'ASSIGNED', 'SUSPEND'].includes(ele.prLineStatusCode)
                          ) ||
                          (isNewTeant && closeFlag)
                        }
                      >
                        {intl.get(`hzero.common.button.close`).d('关闭')}
                      </Button>
                    ) : (
                      <PermissionButton
                        onClick={() => this.handleCancelClose('closedRemark')}
                        disabled={
                          selectedRows.length === 0 ||
                          !selectedRows.every(ele =>
                            ['APPROVED', 'ASSIGNED', 'SUSPEND'].includes(ele.prLineStatusCode)
                          ) ||
                          (isNewTeant && closeFlag)
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
                      </PermissionButton>
                    ))}
                  {isNew ? (
                    <Button
                      onClick={() => this.handleCancelClose('cancelledRemark')}
                      style={{ marginRight: '8px' }}
                      disabled={
                        cancelStatusCode === 'CANCELLEDING' ||
                        selectedRows.length === 0 ||
                        !selectedRows.every(ele =>
                          ['APPROVED', 'ASSIGNED', 'SUSPEND'].includes(ele.prLineStatusCode)
                        ) ||
                        (isNewTeant && cancelFlag)
                      }
                    >
                      {intl.get(`hzero.common.button.cancel`).d('取消')}
                    </Button>
                  ) : (
                    <PermissionButton
                      onClick={() => this.handleCancelClose('cancelledRemark')}
                      style={{ marginRight: '8px' }}
                      disabled={
                        cancelStatusCode === 'CANCELLEDING' ||
                        selectedRows.length === 0 ||
                        !selectedRows.every(ele =>
                          ['APPROVED', 'ASSIGNED', 'SUSPEND'].includes(ele.prLineStatusCode)
                        ) ||
                        (isNewTeant && cancelFlag)
                      }
                      permissionList={[
                        {
                          code: `hzero.srm.requirement.prm.pr-cancel.ps.line-cancel`,
                          type: 'button',
                          meaning: '关闭按钮权限',
                        },
                      ]}
                    >
                      {intl.get(`hzero.common.button.cancel`).d('取消')}
                    </PermissionButton>
                  )}
                </>
              )}
            </Form>
          </div>
        )}
        {SRMIF
          ? urlflagIf
            ? // 可变更行，通过页面个性化控制 字段 是否阔以变更
              customizeTable(
                { code: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.CHANGE_LINE' },
                <EditTable {...tableProps} />
              )
            : customizeTable(
                // 不可变更行
                { code: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.LINE' },
                <EditTable {...tableProps} />
              )
          : customizeTable(
              { code: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.LINE_OTHER' },
              <Table {...tableProps} />
            )}
        <PromptModal {...promptModalProps} />
        {customVisable && <CustomSpecModal {...CustomSpecProps} />}
      </Fragment>
    );
  }
}
