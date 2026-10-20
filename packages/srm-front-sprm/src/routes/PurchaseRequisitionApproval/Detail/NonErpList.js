/*
 * NonErpPurchaseRequisition - 非ERP采购申请
 * @date: 2019-01-24
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { isNumber, sum, isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import { dateRender, yesOrNoRender } from 'utils/renderer';
import { thousandBitSeparator, numberPrecision } from '@/routes/utils.js';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import CustomSpecModal from '../../components/CustomSpecModal';
import { ItemCustom } from '../../components/ItemCustom';
import PriceListModal from '../../components/PriceListModal';

const commonPrompt = 'sprm.common.model.common';

export default class NonErpList extends PureComponent {
  state = {
    customVisable: false,
    specsJsonType: 'custom',
    customData: [],
    priceListModalVisible: false,
    priceData: [],
  };

  @Bind()
  getColumns() {
    const { prSourcePlatform, doubleUintFlag } = this.props;
    const priceItem = [
      {
        title: doubleUintFlag
        ? intl.get(`${commonPrompt}.baseTaxIncludedUnitPrice`).d('预估单价(含税)-基本单位')
        : intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'taxIncludedUnitPrice',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedUnitPriceMeaning : val,
        align: 'right',
        width: 140,
      },
      {
        title: intl.get(`${commonPrompt}.taxExcludedFreightPrice`).d('预估单价（含税不含运费）'),
        dataIndex: 'taxWithoutFreightPrice',
        // render: (val, record) =>
        //   thousandBitSeparator(val, record.defaultPrecision, prSourcePlatform !== 'SRM'),
        width: 180,
        align: 'right',
      },
      // {
      //   title: intl.get(`${commonPrompt}.interRoom`).d('库房'),
      //   dataIndex: 'inventoryName',
      //   width: 150,
      // },
    ];
    // const quantityStandard = [
    //   {
    //     title: intl.get(`${commonPrompt}.quantityStandard`).d('质量标准'),
    //     width: 165,
    //     dataIndex: 'qualityStandard',
    //     align: 'left',
    //   },
    // ];
    const priceAndOthers = [
      {
        title: intl.get(`${commonPrompt}.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
        dataIndex: 'taxIncludedBudgetUnitPrice',
        width: 120,
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedBudgetUnitPriceMeaning : val,
        align: 'right',
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
    ];
    const columns = {
      base: [
        {
          title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
          dataIndex: 'displayLineNum',
          fixed: 'left',
          width: 80,
        },
        {
          title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
          dataIndex: 'invOrganizationName',
          fixed: 'left',
          width: 120,
        },
        // {
        //   title: intl
        //     .get('sprm.purchaseReqCreation.model.common.accountAssignType')
        //     .d('账户分配类别'),
        //   dataIndex: 'accountAssignTypeCode',
        //   fixed: 'left',
        //   width: 120,
        // },
      ],
      mall: [
        {
          title: intl.get(`${commonPrompt}.productNum`).d('商品编码'),
          dataIndex: 'productNum',
          fixed: 'left',
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
          width: 214,
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
        },
        {
          title: intl.get(`entity.item.name`).d('物料名称'),
          dataIndex: 'itemName',
          width: 214,
        },
        {
          title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
          dataIndex: 'categoryName',
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.customMadeFlag`).d('是否定制'),
          dataIndex: 'customMadeFlag',
          width: 180,
          render: yesOrNoRender,
        },
        {
          title: intl.get(`${commonPrompt}.customAttributeList`).d('物料定制属性'),
          dataIndex: 'customAttributeList',
          width: 180,
          render: (value, record) =>
            record.customMadeFlag === 1 && (
              <ItemCustom
                {...{
                  customAttributeList: value,
                  record,
                  disabled: true,
                  customMadeFlag: record.$form
                    ? record.$form.getFieldValue('customMadeFlag')
                    : record.customMadeFlag,
                }}
              />
            ),
        },
        {
          title: intl.get(`sprm.purchaseReqCreation.view.message.priceList`).d('比价单'),
          dataIndex: 'priceList',
          width: 130,
          render: (_, record) => {
            return (
              <a
                onClick={() => {
                  const priceData =
                    (record &&
                      record?.productCompareJson &&
                      JSON.parse(record.productCompareJson)) ??
                    [];
                  this.setState({ priceListModalVisible: true, priceData });
                }}
              >
                {intl.get(`sprm.purchaseReqCreation.view.message.priceList`).d('比价单')}
              </a>
            );
          },
        },
        // {
        //   title: intl.get(`${commonPrompt}.itemAbcClass`).d('物料ABC属性'),
        //   dataIndex: 'itemAbcClass',
        //   width: 180,
        // },
      ],
      // otherABC: [
      //   {
      //     title: intl.get(`${commonPrompt}.itemAbcClass`).d('物料ABC属性'),
      //     dataIndex: 'itemAbcClass',
      //     width: 180,
      //   },
      // ],
      // 电商商城的需要这两个字段位于单位前面
      otherModel: [
        {
          title: intl.get(`${commonPrompt}.itemModel`).d('型号'),
          width: 165,
          dataIndex: 'itemModel',
        },
        {
          title: intl.get(`${commonPrompt}.itemSpecs`).d('规格'),
          width: 165,
          dataIndex: 'itemSpecs',
        },
      ],
      otherThree: [
        {
          title: doubleUintFlag
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`${commonPrompt}.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          render: (val, record) => record.uomCodeAndName || val,
        },
        {
          title: intl.get(`sprm.common.model.common.uomName`).d('单位'),
          dataIndex: 'secondaryUomId',
          width: 120,
          // 当单位有值的时候取单位，没有值的时候取基础单位的值
          render: (_, record) =>
          record.secondaryUomCodeAndName ||
          record.secondaryUomName ||
          record.uomCodeAndName ||
          record.uomName,
        },
        {
          title: intl.get(`sprm.common.model.common.purchaseQuantity`).d('申请数量'),
          dataIndex: 'secondaryQuantity',
          width: 120,
          render: (val, record) => {
            return numberPrecision(val, record.secondaryUomPrecision);
          },
        },
        {
          title: intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价（含税）'),
          dataIndex: 'secondaryTaxInUnitPrice',
          width: 120,
          align: 'right',
          render: (val, record) =>
            record.linePriceHiddenFlag === 1
              ? record.taxIncludedUnitPriceMeaning
              : thousandBitSeparator(val, record.defaultPrecision, prSourcePlatform !== 'SRM'),
        },
        {
          title: doubleUintFlag
            ? intl.get(`${commonPrompt}.baseQuantity`).d('基本数量')
            : intl.get(`sprm.common.model.common.purchaseQuantity`).d('申请数量'),
          dataIndex: 'quantity',
          render: (val, record) => {
            return numberPrecision(val, record.uomPrecision);
          },
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
          dataIndex: 'neededDate',
          width: 150,
          render: dateRender,
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
            : intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
          dataIndex: 'taxIncludedUnitPrice',
          align: 'right',
          render: (val, record) =>
            record.linePriceHiddenFlag === 1 ? record.taxIncludedUnitPriceMeaning : val,
          width: 140,
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
      ],
      lineFreight: [
        {
          title: intl.get(`${commonPrompt}.lineFreight`).d('行运费'),
          dataIndex: 'lineFreight',
          align: 'right',
          render: (val, record) =>
            record.linePriceHiddenFlag === 1
              ? record.lineFreightMeaning
              : thousandBitSeparator(val, record.financialPrecision, prSourcePlatform !== 'SRM'),
          width: 120,
        },
      ],
      another: [
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
          width: 180,
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
          render: (val, record) => <span>{record.supplierName || record.supplierCompanyName}</span>,
        },
      ],
      lineFreightFour: [
        {
          title: intl.get(`${commonPrompt}.projectNum`).d('项目号'),
          width: 165,
          dataIndex: 'projectNum',
        },
        {
          title: intl.get(`${commonPrompt}.projectName`).d('项目名称'),
          width: 165,
          dataIndex: 'projectName',
        },
        {
          title: intl.get(`${commonPrompt}.itemModel`).d('型号'),
          width: 165,
          dataIndex: 'itemModel',
        },
        {
          title: intl.get(`${commonPrompt}.itemSpecs`).d('规格'),
          width: 165,
          dataIndex: 'itemSpecs',
        },
        // {
        //   title: intl.get(`${commonPrompt}.projectCarNum`).d('项目号车号'),
        //   width: 165,
        //   dataIndex: 'craneNum',
        // },
        // {
        //   title: intl.get(`${commonPrompt}.drawingNum`).d('图号'),
        //   width: 165,
        //   dataIndex: 'drawingNum',
        // },
      ],
      lineFreightFive: [
        {
          title: intl.get(`hzero.common.remark`).d('备注'),
          dataIndex: 'remark',
          width: 120,
          render: (text) => <Tooltip title={text}>{text}</Tooltip>,
        },
        {
          title: intl.get(`entity.attachment.tag`).d('附件'),
          dataIndex: 'attachmentUuid',
          width: 120,
          render: (_, { attachmentUuid }) => {
            const uploadProps = {
              icon: false,
              bucketName: PRIVATE_BUCKET,
              bucketDirectory: 'sprm-pr',
              btnText: intl.get(`entity.attachment.view`).d('附件查看'),
              attachmentUUID: attachmentUuid,
              viewOnly: true,
              showFilesNumber: true,
            };
            return <UploadModal {...uploadProps} />;
          },
        },
      ],
      receiveInfo: [
        {
          title: intl.get(`sprm.common.model.receiveAddress`).d('收货地址'),
          width: 150,
          dataIndex: 'receiveAddress',
        },
        {
          title: intl.get(`sprm.common.model.receiveContactName`).d('收货联系人'),
          width: 150,
          dataIndex: 'receiveContactName',
        },
        {
          title: intl.get(`sprm.common.model.receiveTelNum`).d('收货人联系方式'),
          width: 150,
          dataIndex: 'receiveTelNum',
          render: (val, record) => (val ? `${record.internationalTelCode || ''} ${val}` : ''),
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
        render: (val) => (
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
        render: (val) => (
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
    if (prSourcePlatform === 'CATALOGUE') {
      const columnCopy = columns.base.concat(
        columns.mall,
        columns.other,
        columns.otherThree,
        columns.another,
        columns.receiveInfo,
        specialReference,
        productSpec,
        [
          {
            title: intl.get(`sprm.common.model.common.mallLineNum`).d('商城行号'),
            width: 150,
            dataIndex: 'mallLineNum',
          },
        ]
      );
      // 在行运费后插入 预算单价，预算外标识
      const index = columnCopy.findIndex(({ dataIndex }) => dataIndex === 'lineFreight');
      if (index !== -1) {
        columnCopy.splice(index + 1, 0, ...priceAndOthers);
      }
      // 在项目号车号插入 质量标准
      // const index2 = columnCopy.findIndex(({ dataIndex }) => dataIndex === 'categoryName');
      // if (index2 !== -1) {
      //   columnCopy.splice(index2 + 1, 0, ...quantityStandard);
      // }
      return columnCopy;
    }

    if (prSourcePlatform === 'E-COMMERCE') {
      columns.otherThree.splice(
        columns.otherThree.findIndex(({ dataIndex }) => dataIndex === 'lineFreight'),
        0,
        ...priceItem
      );
      const columnCopy = columns.base.concat(
        columns.mall,
        columns.other,
        columns.otherModel,
        columns.otherThree,
        columns.lineFreight,
        columns.lineFreightFive,
        columns.another,
        productSpec,
        [
          {
            title: intl.get(`sprm.common.model.common.mallLineNum`).d('商城行号'),
            width: 150,
            dataIndex: 'mallLineNum',
          },
        ]
      );
      // 在行金额后插入 预算单价，预算外标识
      const index = columnCopy.findIndex(({ dataIndex }) => dataIndex === 'lineFreight');
      if (index !== -1) {
        columnCopy.splice(index + 1, 0, ...priceAndOthers);
      }
      // 在单位前插入 质量标准
      // const index2 = columnCopy.findIndex(({ dataIndex }) => dataIndex === 'uomName');
      // if (index2 !== -1) {
      //   columnCopy.splice(index2, 0, ...quantityStandard);
      // }
      console.log(columnCopy);
      return columnCopy;
    }
    if (prSourcePlatform === 'SRM') {
      const columnCopy = columns.base.concat(
        columns.other,
        // columns.otherABC,
        columns.otherThree,
        columns.lineFreight,
        columns.lineFreightFour,
        columns.lineFreightFive,
        columns.another,
        columns.receiveInfo
      );
      // 在行运费后插入 预算单价，预算外标识
      const index = columnCopy.findIndex(({ dataIndex }) => dataIndex === 'lineFreight');
      if (index !== -1) {
        columnCopy.splice(index + 1, 0, ...priceAndOthers);
      }
      // 在项目号车号插入 质量标准
      // const index2 = columnCopy.findIndex(({ dataIndex }) => dataIndex === 'craneNum');
      // if (index2 !== -1) {
      //   columnCopy.splice(index2 + 1, 0, ...quantityStandard);
      // }
      return columnCopy;
    }
    return columns.base.concat(
      columns.other,
      columns.otherThree,
      columns.lineFreight,
      columns.lineFreightFive,
      columns.another,
      columns.receiveInfo.slice(1),
      [
        {
          title: intl.get(`sprm.common.model.common.mallLineNum`).d('商城行号'),
          width: 150,
          dataIndex: 'mallLineNum',
        },
      ]
    );
  }

  @Bind()
  fetchColumns() {
    const { doubleUintFlag } = this.props;
    const columns = this.getColumns();
    /* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["ele"] }] */
    columns.forEach((ele) => {
      const renderFunc = ele.render;
      ele.render = (value, record, index) =>
        this.renderChangeField(value, record, index, ele.dataIndex, renderFunc);
    });
    const baseUomInfo =
      doubleUintFlag === 1
        ? []
        : ['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];

    return columns.filter((ele) => !baseUomInfo.includes(ele.dataIndex));
  }

  // 渲染改变后的字段
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
      'occupiedQuantity',
      'secondaryUomName',
      'secondaryUomId',
      'secondaryQuantity',
      'orderExcessRuleCode',
      'sourceExcessRuleCode',
      'contractExcessRuleCode',
      'sourceDisposableExcessFlag',
      'secondaryUomName',
      'secondaryTaxInUnitPrice',
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
      const beforeRecord = { ...record, ...changeFiledMap };

      if (Object.keys(changeFiledMap).includes(name)) {
        if (tipFileds.includes(name)) {
          text = value;
          beforeText = beforeRecord[name];
        } else {
          text = isFunction(renderFun) ? renderFun(value, record, index) : value;
          beforeText = isFunction(renderFun)
            ? renderFun(beforeRecord[name], beforeRecord, index)
            : beforeRecord[name];
        }

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

      if (
        name === 'receiveTelNum' &&
        (Object.keys(changeFiledMap).includes(name) ||
          Object.keys(changeFiledMap).includes('internationalTelCode'))
      ) {
        text = value ? `${record.internationalTelCode || ''} ${value}` : '';
        beforeText = beforeRecord[name]
          ? `${beforeRecord.internationalTelCode || ''} ${beforeRecord[name]}`
          : '';

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

      if (
        name === 'supplierName' &&
        (Object.keys(changeFiledMap).includes(name) ||
          Object.keys(changeFiledMap).includes('supplierCompanyName'))
      ) {
        text = record.supplierName || record.supplierCompanyName;
        beforeText = beforeRecord.supplierName || beforeRecord.supplierCompanyName;

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

  render() {
    const columns = this.fetchColumns();
    const {
      loading,
      onSearch,
      pagination = {},
      dataSource = [],
      customizeTable,
      prSourcePlatform,
    } = this.props;
    const { customVisable, customData, specsJsonType } = this.state;
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      bordered: true,
      rowKey: 'prHeaderId',
      onChange: (page) => onSearch(page),
      scroll: { x: scrollX }, // y: 'calc(100vh - 320px)' todo页面增加固定头
    };
    const CustomSpecProps = {
      specsJsonType,
      visible: customVisable,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisable: false });
      },
    };
    return (
      <>
        {prSourcePlatform === 'E-COMMERCE'
          ? customizeTable(
              { code: 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.LINE_ECOMMERCE' },
            <Table {...tableProps} />
            )
          : customizeTable(
              { code: 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.SRM_LINE' },
            <Table {...tableProps} />
            )}
        {customVisable && <CustomSpecModal {...CustomSpecProps} />}
        {this.state.priceListModalVisible && (
          <PriceListModal
            visible={this.state.priceListModalVisible}
            onClose={() => {
              this.setState({ priceListModalVisible: false });
            }}
            data={this.state.priceData}
          />
        )}
      </>
    );
  }
}
