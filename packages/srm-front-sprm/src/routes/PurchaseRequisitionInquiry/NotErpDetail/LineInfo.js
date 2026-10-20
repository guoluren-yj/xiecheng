import React, { PureComponent } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isEmpty, isFunction } from 'lodash';

import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import { thousandBitSeparator, numberPrecision } from '@/routes/utils.js';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentTenant, getResponse } from 'utils/utils';

import UploadModal from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import {
  fetchExecutionLink,
  fetchUomControl,
} from '@/services/purchaseRequisitionAssignmentService';

import EditTable from 'components/EditTable';
import { PriceModal } from '../../components/priceModal';
import styles from '@/routes/PurchaseRequisitionInquiry/index.less';
import abnormal from '@/assets/abnormal.svg';
import { ItemCustom } from '../../components/ItemCustom';
import CustomSpecModal from '../../components/CustomSpecModal';
import PriceListModal from '../../components/PriceListModal';
// import urgentImg from '@/assets/icon-expedited.svg';
const commonPrompt = 'sprm.common.model.common';
const modelPrompt = 'sprm.purchaseReqInquiry.model.common';
const hcuzCode = 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.SRM_LINE';

export default class ListTable extends PureComponent {
  state = {
    customVisable: false,
    specsJsonType: 'custom',
    customData: [],
    priceListModalVisible: false,
    priceData: [],
    isOldUser: false,
    doubleUintFlag: 0,
  };

  componentDidMount() {
    this.getExecutionLink();
    this.getDoubleUnitSetting();
  }

  @Bind()
  getExecutionLink() {
    fetchExecutionLink({ tenantNum: getCurrentTenant().tenantNum }).then((res) => {
      const result = getResponse(res);
      if (result && !isEmpty(result.content)) {
        this.setState({
          isOldUser: true,
        });
      }
    });
  }

  @Bind()
  getDoubleUnitSetting() {
    fetchUomControl().then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({
          doubleUintFlag: result.SPRM,
        });
      }
    });
  }

  // 渲染改变后的字段
  renderChangeField(value, record, index, name, renderFun) {
    // console.log(isEmpty({}))
    const { changeFiledMap } = record;
    // 不会改变的字段
    const noChangefields = [
      'executorName',
      'prLineStatusCodeMeaning',
      'customAttributeList',
      'executionBillDetail',
      'enclosure',
      'customSpecsJson',
      'productSpecsJson',
      'secondaryUomName',
      'secondaryUomId',
      'secondaryUomName',
      'secondaryQuantity',
      'secondaryTaxInUnitPrice',
      'executionStatusMeaning',
      'displayExecutionBillNum',
      'occupiedQuantity',
      'changeQuantity',
      'orderExcessRuleCode',
      'sourceExcessRuleCode',
      'contractExcessRuleCode',
      'sourceDisposableExcessFlag',
      'sourceOccupiedQuantity',
      'restSourceQuantity',
      'orderOccupiedQuantity',
      'restPoQuantity',
    ];
    // 有tooltip 提示的字段
    const tipFileds = [
      'receiveAddress',
      'receiveContactName',
      'invOrganizationName',
      'itemCode',
      'itemName',
      'categoryName',
      'companyName',
      'executorName',
    ];
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
            title={
              <>
                <span>
                  {intl
                    .get(`${commonPrompt}.beforeChanged`, {
                      value: '',
                    })
                    .d('变更前：')}
                </span>
                {beforeText}
              </>
            }
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

  thousandBitSeparator(n) {
    const re = /\d{1,3}(?=(\d{3})+$)/g;
    if (!n) {
      return n;
    }
    // eslint-disable-next-line func-names
    const n1 = n.toString().replace(/^(\d+)((\.\d+)?)$/, function(_s, s1, s2) {
      return s1.replace(re, '$&,') + s2;
    });
    return n1;
  }

  getColumns = () => {
    const {
      dataSource,
      // pagination,
      prSourcePlatform,
      // onChange,
      dispatch,
      // customizeTable,
      onView,
    } = this.props;
    const { isOldUser, doubleUintFlag } = this.state;
    const colorStatus = (value) =>
      value === 'NOT_STARTED'
        ? 'rgba(0,0,0,0.25)'
        : value === 'FINISHED'
        ? '#47B881'
        : value === 'CLOSED'
        ? 'red'
        : '#FCA000';
    const priceItem = [
      {
        title: doubleUintFlag
          ? intl.get(`${commonPrompt}.baseTaxIncludedUnitPrice`).d('预估单价(含税)-基本单位')
          : intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'taxIncludedUnitPrice',
        width: 180,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedUnitPriceMeaning : val,
      },
      {
        title: intl.get(`${commonPrompt}.taxExcludedFreightPrice`).d('预估单价(含税不含运费)'),
        dataIndex: 'taxWithoutFreightPrice',
        width: 180,
        align: 'right',
        // render: (val, record) =>
        //   thousandBitSeparator(val, record.defaultPrecision, prSourcePlatform !== 'SRM'),
      },
    ];
    const receiveInfo = [
      {
        title: intl.get(`${modelPrompt}.receiveAddress`).d('收货地址'),
        width: 150,
        dataIndex: 'receiveAddress',
        render: (val) => (
          <Tooltip title={val}>
            <span>{val}</span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${modelPrompt}.receiveContactName`).d('收货联系人'),
        width: 150,
        dataIndex: 'receiveContactName',
        render: (val) => (
          <Tooltip title={val}>
            <span>{val}</span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${modelPrompt}.receiveTelNum`).d('收货人联系方式'),
        width: 150,
        dataIndex: 'receiveTelNum',
        render: (val, record) => (
          <Tooltip title={val}>
            <span>{val ? `${record.internationalTelCode || ''} ${val}` : ''}</span>
          </Tooltip>
        ),
      },
    ];
    let columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'prLineStatusCodeMeaning',
        width: 100,
        key: '21',
        // fixed: 'left',
        render: (val, { headerSyncStatus, headerSyncResponseMsg } = {}) => {
          return (
            <div className={styles['row-agent-column']}>
              {headerSyncStatus === 'SYNC_FAILURE' ? (
                <Tooltip title={headerSyncResponseMsg}>
                  <img src={abnormal} alt="img" />
                </Tooltip>
              ) : null}
              {val}
            </div>
          );
        },
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 80,
        // fixed: 'left',
      },
      // {
      //   title: intl.get(`${commonPrompt}.purchaseLineType`).d('采购行类型'),
      //   dataIndex: 'purchaseLineTypeCode',
      //   width: 150,
      // },
      // {
      //   title: intl
      //     .get('sprm.purchaseReqCreation.model.common.accountAssignType')
      //     .d('账户分配类别'),
      //   dataIndex: 'accountAssignTypeCode',
      //   width: 120,
      // },
      {
        title: intl.get('entity.organization.class.inventory').d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
        render: (val) => (
          <Tooltip title={val}>
            <span>{val}</span>
          </Tooltip>
        ),
      },
      // {
      //   title: intl.get('entity.organization.class.interRoom').d('库房'),
      //   dataIndex: 'invOrganizationName',
      //   width: 120,
      // },
      {
        title: intl.get(`${commonPrompt}.productNum`).d('商品编码'),
        dataIndex: 'productNum',
        width: 150,
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
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.catalogName`).d('商品目录'),
        dataIndex: 'catalogName',
        width: 150,
      },
      // {
      //   title: intl.get(`${commonPrompt}.interRoom`).d('库房'),
      //   dataIndex: 'inventoryName',
      //   width: 150,
      // },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        render: (val) => (
          <Tooltip title={val}>
            <span>{val}</span>
          </Tooltip>
        ),
      },
      {
        title: intl.get('entity.item.name').d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (val) => (
          <Tooltip title={val}>
            <span>{val}</span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 150,
        render: (val) => (
          <Tooltip title={val}>
            <span>{val}</span>
          </Tooltip>
        ),
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
                // this.openPriceListModal(record);
                const priceData =
                  (record && record?.productCompareJson && JSON.parse(record.productCompareJson)) ??
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
      {
        title:
          doubleUintFlag === 1
            ? intl.get(`${commonPrompt}.baseUom`).d('基本单位')
            : intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
        render: (val, record) => record.uomCodeAndName || val,
      },
      {
        title:
          doubleUintFlag === 1
            ? intl.get(`${commonPrompt}.baseQuantity`).d('基础数量')
            : intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'quantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.orderExcessRuleCode`).d('订单超量规则'),
        dataIndex: 'orderExcessRuleCode',
        render: (val, record) => record.orderExcessRuleCodeMeaning,
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.sourceExcessRuleCode`).d('寻源超量规则'),
        dataIndex: 'sourceExcessRuleCode',
        render: (val, record) => record.sourceExcessRuleCodeMeaning,
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.contractExcessRuleCode`).d('协议超量规则'),
        dataIndex: 'contractExcessRuleCode',
        render: (val, record) => record.contractExcessRuleCodeMeaning,
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.sourceDisposableExcessFlag`).d('寻源新链路一次性超量标识'),
        dataIndex: 'sourceDisposableExcessFlag',
        render: (val, record) => record.sourceDisposableExcessFlagMeaning,
        width: 180,
      },
      {
        title: intl.get(`${commonPrompt}.uomName`).d('单位'),
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
        title: intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        render: (val, record) => {
          return (
            numberPrecision(val, record.secondaryUomPrecision) ||
            numberPrecision(record.quantity, record.uomPrecision)
          );
        },
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.sourceOccupiedQuantity`).d('寻源占用数量'),
        dataIndex: 'sourceOccupiedQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.orderOccupiedQuantity`).d('订单占用数量'),
        dataIndex: 'orderOccupiedQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.restSourceQuantity`).d('寻源剩余可下单数量'),
        dataIndex: 'restSourceQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.orderRestPoQuantity`).d('订单剩余可下单数量'),
        dataIndex: 'restPoQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
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
        dataIndex: 'orderExecuteStatus',
        // lookupCode: 'SPRM.PR_ORDER_EXECUTE_STATUS',
        title: intl.get(`${commonPrompt}.orderExecuteStatus`).d('订单执行状态'),
        render: (val, record) => {
          return record && record?.orderExecuteStatusMeaning ? (
            <Tag color={colorStatus(val)} style={{ verticalAlign: 'text-top' }}>
              {record.orderExecuteStatusMeaning}
            </Tag>
          ) : null;
        },
      },
      {
        dataIndex: 'sourceExecuteStatus',
        // lookupCode: 'SPRM.PR_SOURCE_EXECUTE_STATUS',
        title: intl.get(`${commonPrompt}.sourceExecuteStatus`).d('寻源执行状态'),
        render: (val, record) => {
          return record && record.sourceExecuteStatusMeaning ? (
            <Tag color={colorStatus(val)} style={{ verticalAlign: 'text-top' }}>
              {record.sourceExecuteStatusMeaning}
            </Tag>
          ) : null;
        },
      },
      {
        title: intl.get(`${commonPrompt}.taxType`).d('税种'),
        dataIndex: 'taxCode',
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.localCurrencyTaxUnit`).d('本币单价(含税)'),
        width: 165,
        dataIndex: 'localCurrencyTaxUnit',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.localCurrencyTaxUnitMeaning : val,
      },
      {
        title: intl.get(`${commonPrompt}.localCurrencyTaxSum`).d('本币金额(含税)'),
        width: 165,
        dataIndex: 'localCurrencyTaxSum',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.localCurrencyTaxSumMeaning
            : thousandBitSeparator(val, record.localFinancialPrecision, prSourcePlatform !== 'SRM'),
      },
      {
        title: intl.get(`${commonPrompt}.localCurrencyNoTaxUnit`).d('本币单价(不含税)'),
        width: 165,
        dataIndex: 'localCurrencyNoTaxUnit',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.localCurrencyNoTaxUnitMeaning : val,
      },
      {
        title: intl.get(`${commonPrompt}.localCurrencyNoTaxSum`).d('本币金额(不含税)'),
        width: 165,
        dataIndex: 'localCurrencyNoTaxSum',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.localCurrencyNoTaxSumMeaning
            : thousandBitSeparator(val, record.localFinancialPrecision, prSourcePlatform !== 'SRM'),
      },
      {
        title:
          doubleUintFlag === 1
            ? intl
                .get(`sprm.common.model.common.baseTaxIncludedUnitPrice`)
                .d('预估单价(含税)-基本单位')
            : intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'taxIncludedUnitPrice',
        width: 180,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedUnitPriceMeaning : val,
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'secondaryTaxInUnitPrice',
        width: 180,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedUnitPriceMeaning : val,
      },
      // {
      //   title: intl.get(`${commonPrompt}.jdPrice`).d('划线价'),
      //   dataIndex: 'jdPrice',
      //   width: 130,
      //   align: 'right',
      //   render: (val) => numberRender(val, 2),
      // },
      {
        title: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 150,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.taxIncludedLineAmountMeaning
            : thousandBitSeparator(val, record.financialPrecision, prSourcePlatform !== 'SRM'),
      },
      {
        title: intl.get(`${commonPrompt}.lineFreight`).d('行运费'),
        dataIndex: 'lineFreight',
        width: 120,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.lineFreightMeaning
            : thousandBitSeparator(val, record.financialPrecision, prSourcePlatform !== 'SRM'),
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
        dataIndex: 'taxIncludedBudgetUnitPrice',
        width: 120,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedBudgetUnitPriceMeaning : val,
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
        width: 100,
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
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 150,
        align: 'center',
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get('entity.business.tag').d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
        align: 'center',
      },
      {
        title: intl.get('entity.organization.class.purchase').d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 150,
        align: 'center',
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
        dataIndex: 'agentName',
        width: 100,
        align: 'center',
      },
      {
        title: intl.get('entity.supplier.tag').d('供应商'),
        dataIndex: 'supplierName',
        width: 150,
        render: (_, record) => (
          <Tooltip title={record.supplierName || record.supplierCompanyName}>
            <span>{record.supplierName || record.supplierCompanyName}</span>
          </Tooltip>
        ),
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
        render: (value, record) => (
          <span>
            {record.prRequestedNum ? `${record.prRequestedNum}-${value}` : record.prRequestedName}
          </span>
        ),
      },
      {
        title: intl.get(`${modelPrompt}.moneyPayPart`).d('费用承担部门'),
        dataIndex: 'expBearDep',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.handleStatus`).d('执行状态'),
        dataIndex: 'executionStatusMeaning',
        width: 110,
        render: (_, { headerSyncStatus, headerSyncStatusMeaning, executionStatusMeaning } = {}) => {
          return headerSyncStatus === 'SYNC_FAILURE'
            ? headerSyncStatusMeaning
            : executionStatusMeaning;
        },
      },
      {
        title: intl.get(`${modelPrompt}.executionBillNum`).d('执行单据编号'),
        dataIndex: 'displayExecutionBillNum',
        width: 150,
        render: (
          _,
          {
            headerSyncResponseMsg,
            headerExecutionBillNum,
            executionBillNum,
            executionHeaderBillNum,
            headerSyncStatus,
          } = {}
        ) => {
          const headerBillNum = headerExecutionBillNum || executionHeaderBillNum;
          let otherStatus;
          if (headerBillNum && executionBillNum) {
            otherStatus = `${headerBillNum}-${executionBillNum}`;
          } else {
            otherStatus = headerBillNum || executionBillNum || '';
          }
          return headerSyncStatus === 'SYNC_FAILURE' ? headerSyncResponseMsg : otherStatus;
        },
      },
      {
        title: intl.get(`${commonPrompt}.handlePerson`).d('需求执行人'),
        dataIndex: 'executorName',
        width: 100,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get(`${commonPrompt}.executionBillDetail`).d('执行单据详情'),
        width: 120,
        align: 'center',
        dataIndex: 'executionBillDetail',
        render: (_, record) => (
          <a onClick={() => onView(record)}>{intl.get('hzero.common.button.view').d('查看')}</a>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.assignedDate`).d('分配日期'),
        dataIndex: 'assignedDate',
        width: 100,
        render: dateTimeRender,
      },

      // {
      //   title: intl.get(`${modelPrompt}.infoRecord`).d('信息记录'),
      //   dataIndex: 'infoRecord',
      //   width: 120,
      // },
      {
        title: intl.get(`${modelPrompt}.lastPurPrice`).d('上次采购单价'),
        width: 120,
        dataIndex: 'lastPurPrice',
        render: (_, record) => (
          <PriceModal
            {...{ dispatch, item: dataSource.find(({ prLineId }) => record.prLineId === prLineId) }}
          />
        ),
      },
      // {
      //   title: intl.get(`${modelPrompt}.historicalInquirySheet`).d('历史询价单'),
      //   dataIndex: 'historicalInquirySheet',
      //   width: 120,
      // },
      {
        title: intl.get(`${modelPrompt}.suspendReason`).d('暂挂原因'),
        dataIndex: 'suspendRemark',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.closedReason`).d('关闭原因'),
        dataIndex: 'closedRemark',
        width: 150,
      },
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
      // {
      //   title: intl.get(`${commonPrompt}.inpaperNum`).d('内部订单号'),
      //   width: 165,
      //   dataIndex: 'innerPoNum',
      //   align: 'left',
      // },
      {
        title: intl.get(`${commonPrompt}.itemModel`).d('型号'),
        width: 165,
        dataIndex: 'itemModel',
        align: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.itemSpecs`).d('规格'),
        width: 165,
        dataIndex: 'itemSpecs',
        align: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.projectCategory`).d('项目类别'),
        width: 165,
        dataIndex: 'projectCategoryMeaning',
      },
      {
        title: intl.get(`${commonPrompt}.unitPriceBatch`).d('每'),
        width: 80,
        dataIndex: 'unitPriceBatch',
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
      // },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 120,
      },
      // {
      //   title: intl.get(`${commonPrompt}.class`).d('属性'),
      //   dataIndex: 'itemPropertiesMeaning',
      //   width: 120,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.keepMan`).d('保管人'),
      //   dataIndex: 'keeperUserName',
      //   width: 120,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.takeman`).d('验收人'),
      //   dataIndex: 'accepterUserName',
      //   width: 120,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.adress`).d('地点'),
      //   dataIndex: 'addressMeaning',
      //   width: 120,
      // },
      {
        title: intl.get(`${commonPrompt}.occupiedQuantity`).d('已执行数量'),
        dataIndex: 'occupiedQuantity',
        width: 120,
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
      },
      {
        title: intl.get('entity.attachment.tag').d('附件'),
        dataIndex: 'enclosure',
        width: 100,
        render: (_, { attachmentUuid }) => {
          const uploadProps = {
            bucketName: PRIVATE_BUCKET,
            bucketDirectory: 'sprm-pr',
            btnText: intl.get('entity.attachment.view').d('附件查看'),
            attachmentUUID: attachmentUuid,
            viewOnly: true,
            showFilesNumber: true,
            icon: false,
          };
          return <UploadModal {...uploadProps} />;
        },
      },
    ];
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
      {
        title: intl.get(`sprm.common.model.common.mallLineNum`).d('商城行号'),
        width: 150,
        dataIndex: 'mallLineNum',
      },
    ];
    if (prSourcePlatform === 'E-COMMERCE') {
      columns.splice(
        columns.findIndex(({ dataIndex }) => dataIndex === 'taxIncludedUnitPrice'),
        0,
        ...priceItem,
        ...specialReference,
        ...productSpec
      );
      columns = columns.filter(
        (items) =>
          ![
            'lastPurPrice',
            'unitPriceBatch',
            'itemAbcClass',
            'projectNum',
            'projectName',
            'craneNum',
            'drawingNum',
            'sourceOccupiedQuantity',
            'restSourceQuantity',
            'customMadeFlag',
            'customAttributeList',
            'orderExcessRuleCode',
            'sourceExcessRuleCode',
            'contractExcessRuleCode',
            'sourceDisposableExcessFlag',
          ].includes(items.dataIndex)
      );
    } else if (prSourcePlatform === 'CATALOGUE') {
      columns = columns
        .concat(receiveInfo, specialReference, productSpec)
        .filter(
          (items) =>
            ![
              'lastPurPrice',
              'unitPriceBatch',
              'itemAbcClass',
              'projectNum',
              'projectName',
              'lineFreight',
              'craneNum',
              'drawingNum',
              'sourceOccupiedQuantity',
              'restSourceQuantity',
              'customMadeFlag',
              'customAttributeList',
              'orderExcessRuleCode',
              'sourceExcessRuleCode',
              'contractExcessRuleCode',
              'sourceDisposableExcessFlag',
            ].includes(items.dataIndex)
        );
    } else if (prSourcePlatform === 'SHOP') {
      columns = columns
        .concat([
          {
            title: intl.get(`sprm.common.model.common.mallLineNum`).d('商城行号'),
            width: 150,
            dataIndex: 'mallLineNum',
          },
        ])
        .filter(
          ({ dataIndex }) =>
            !['lineFreight', 'packingList', 'productModel', 'productBrand'].includes(dataIndex)
        );
    }

    if (prSourcePlatform === 'SRM') {
      columns.push({
        title: intl.get(`${commonPrompt}.changeQuantity`).d('变更数量'),
        width: 80,
        dataIndex: 'changeQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
      });
      columns = columns.filter(
        (ele) =>
          ![
            'catalogName',
            'productName',
            'productNum',
            'packingList',
            'productModel',
            'productBrand',
          ].includes(ele.dataIndex)
      );
    }

    if (isOldUser) {
      columns = columns.filter(
        (item) =>
          ![
            'sourceOccupiedQuantity',
            'restSourceQuantity',
            'orderOccupiedQuantity',
            'restPoQuantity',
          ].includes(item.dataIndex)
      );
    }

    if (!doubleUintFlag) {
      columns = columns.filter(
        (item) =>
          !['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'].includes(
            item.dataIndex
          )
      );
    }

    /* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["ele"] }] */
    columns.forEach((ele) => {
      const renderFunc = ele.render;
      ele.render = (value, record, index) =>
        this.renderChangeField(value, record, index, ele.dataIndex, renderFunc);
    });

    return columns;
  };

  // 渲染 SRM Table，这里做个性化
  renderSrmTable = (columns = []) => {
    const {
      dataSource,
      pagination,
      prSourcePlatform,
      onChange,
      customizeTable,
      remote,
    } = this.props;
    const { handleOnRow } = remote?.props?.process || {};
    const defaultOnRow = () => ({});
    const cuxDataSource = remote
      ? remote.process('SPRM_PURCHAE_REQUISITION_QUERY_DETAIL_SRM_LINE', dataSource, {
          dataSource,
        })
      : dataSource;
    return customizeTable(
      { code: hcuzCode },
      <EditTable
        bordered
        columns={
          prSourcePlatform !== 'E-COMMERCE'
            ? columns.filter(
                (item) =>
                  ![
                    'benchmarkPrice',
                    'changePercent',
                    'jdPrice',
                    'thirdSkuCode',
                    'thirdSkuName',
                  ].includes(item.dataIndex)
              )
            : columns
        }
        rowKey="prLineId"
        pagination={pagination}
        dataSource={cuxDataSource}
        onChange={(page) => onChange(page)}
        scroll={{
          x: sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))),
        }} //  y: 'calc(100vh - 320px)',todo页面增加固定头
        onRow={handleOnRow || defaultOnRow}
      />
    );
  };

  // 渲染来源为 电商的 Table
  renderEcommerceTable = (columns = []) => {
    const { dataSource, pagination, prSourcePlatform, onChange, customizeTable } = this.props;
    return customizeTable(
      { code: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.LINE_ECOMMERCE' },
      <Table
        bordered
        columns={
          prSourcePlatform !== 'E-COMMERCE'
            ? columns.filter(
                (item) => !['benchmarkPrice', 'changePercent', 'jdPrice'].includes(item.dataIndex)
              )
            : columns
        }
        rowKey="prLineId"
        pagination={pagination}
        dataSource={dataSource}
        onChange={(page) => onChange(page)}
        scroll={{
          x: sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))),
        }} // y: 'calc(100vh - 320px)',todo页面增加固定头
      />
    );
  };

  // 渲染除了 SRM，E-COMMERICE 以外来源的表格
  renderTable(columns = []) {
    const { dataSource, pagination, onChange, customizeTable } = this.props;
    return customizeTable(
      { code: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.LINE_CATALOGUE' },
      <Table
        bordered
        columns={columns.filter(
          (item) => !['benchmarkPrice', 'changePercent', 'jdPrice'].includes(item.dataIndex)
        )}
        rowKey="prLineId"
        pagination={pagination}
        dataSource={dataSource}
        onChange={(page) => onChange(page)}
        scroll={{
          x: sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))),
        }} //  y: 'calc(100vh - 320px)',todo页面增加固定头
      />
    );
  }

  render() {
    const { prSourcePlatform, remote, path, headerInfo } = this.props;
    const { cuxHandleColumns } = remote?.props?.process || {};
    const baseColumns = this.getColumns();
    const columns = isFunction(cuxHandleColumns)
      ? cuxHandleColumns(baseColumns, { headerInfo, path })
      : baseColumns;
    const { customVisable, customData, specsJsonType } = this.state;
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
          ? this.renderEcommerceTable(columns)
          : prSourcePlatform === 'SRM'
          ? this.renderSrmTable(columns)
          : this.renderTable(columns)}
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
