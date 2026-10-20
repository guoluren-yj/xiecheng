import React, { Component, Fragment } from 'react';
import { Table, DataSet, Lov } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
// import { isEmpty } from 'lodash';
import { fetchSettings } from '@/services/purchaseRequisitionPoolService';
import { tableDs } from './fieldsInitalValue';
import LadderPrice from './../../components/LadderPrice';
import ChangeOrderCodeRender from '@/routes/components/ChangeOrderCodeRender';

import { thousandBitSeparator } from '@/routes/utils.js';

@formatterCollections({
  code: ['sprm.common', 'smdm.common'],
})
@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_POLL.ORDER_LIST',
    'SPRM.PURCHASE_REQUISITION_POLL.ORDER_FILTER',
  ],
})
export default class TransferOrder extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.state = {
      setting: '0',
      referPriceVisible: false, // 参考价格
      referPriceRecord: {},
    };
    this.tableDataDs = new DataSet({
      ...tableDs(),
      events: {
        load: ({ dataSet }) => {
          const { totalCount, records } = dataSet;
          records.forEach((ele) => {
            const {
              data: { supplierName, prSourcePlatform },
            } = ele;
            const renderFlag =
              prSourcePlatform === 'SRM' ||
              prSourcePlatform === 'ERP' ||
              prSourcePlatform === 'SHOP';
            if (!renderFlag) {
              ele.init('selectSupplierCompanyName', supplierName);
            }
          });
          const { updatePage } = this.props;
          updatePage(totalCount, 'orderDate');
        },
      },
    });
  }

  // 渲染状态列
  @Bind()
  isEnabledRender({ value }) {
    const btns = [];
    btns.push(yesOrNoRender(Number(value)));
    return btns;
  }

  componentDidMount() {
    this.fetchSettings();
  }

  /**
   * fetchDetailHeader - 查询配置中心
   */
  @Bind()
  fetchSettings() {
    fetchSettings().then((res) => {
      if (res) {
        this.setState({
          setting: res['000112'] || '0',
        });
      }
    });
  }

  // 参考价格
  @Bind()
  handleLadderPrice(record) {
    const { data = {} } = record;
    this.setState({
      priceRecordId: data.prLineId,
      referPriceVisible: true,
      referPriceRecord: data,
    });
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.activeKey === 'order';
  }

  /**
   * 控制弹窗的显示和隐藏
   * @param {String} modalVisible
   * @param {Boolean} flag
   * @memberof Detail
   */
  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  @Bind()
  changeSupplier(dataList) {
    // console.log(val, dataList);
    const currentDate = this.tableDataDs.current;
    const { setting } = this.state;
    if (dataList) {
      const {
        supplierCompanyId,
        supplierCompanyNum,
        supplierCompanyName,
        unitPrice,
        uomId,
        uomName,
        currencyCode,
        taxId,
        taxRate,
        netPrice,
        priceLibId,
        priceLibraryId,
        taxIncludedPrice,
        unitPriceBatch,
        holdPcHeaderId,
        holdPcLineId,
        contractNum,
        benchmarkPriceType,
        ladderPriceLibId,
        ladderQuotationFlag,
      } = dataList;
      // eslint-disable-next-line no-unused-expressions
      currentDate?.set({
        selectSupplierCompanyId: supplierCompanyId,
        selectSupplierCode: supplierCompanyNum,
        selectSupplierCompanyName: supplierCompanyName,
        noUnitPrice: unitPrice,
      });
      if (
        priceLibId &&
        ((setting === '1' && uomId === currentDate?.get('uomId')) || setting === '0')
      ) {
        // eslint-disable-next-line no-unused-expressions
        currentDate?.set({
          uomId,
          uomName,
          currencyCode,
          taxId,
          taxRate,
          noUnitPrice: netPrice,
          unitPrice: netPrice,
          priceLibraryId,
          priceLibId,
          taxIncludedPrice,
          unitPriceBatch,
          holdPcHeaderId,
          holdPcLineId,
          contractNum,
          benchmarkPriceType,
          ladderPriceLibId,
          ladderQuotationFlag,
          originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
          enteredTaxIncludedPrice: taxIncludedPrice,
        });
      }
    } else {
      // eslint-disable-next-line no-unused-expressions
      currentDate?.set({
        selectSupplierCompanyId: null,
        selectSupplierCode: null,
        selectSupplierCompanyName: null,
        noUnitPrice: null,
        priceLibraryId: null,
      });
    }
  }

  render() {
    const { priceRecordId = null, referPriceVisible = false, referPriceRecord = {} } = this.state;
    const { customizeTable } = this.props;
    const columns = [
      {
        name: 'prNum',
        width: 150,
      },
      {
        name: 'lineNum',
        width: 100,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'referencePriceDisplayFlag',
        width: 120,
        renderer: ({ record }) => {
          const {
            data: { itemCode, prSourcePlatform, referencePriceDisplayFlag },
          } = record;
          return itemCode && prSourcePlatform !== 'CATALOGUE' && referencePriceDisplayFlag ? (
            <a onClick={() => this.handleLadderPrice(record)}>
              {intl.get(`sprm.common.model.common.referPrice.referPrice`).d('参考价格')}
            </a>
          ) : null;
        },
      },
      {
        name: 'supplierLov',
        width: 120,
        editor: (record) => {
          const {
            data: { prSourcePlatform },
          } = record;
          const renderFlag =
            prSourcePlatform === 'SRM' || prSourcePlatform === 'ERP' || prSourcePlatform === 'SHOP';
          // return renderFlag;
          return renderFlag ? (
            <Lov name="supplierLov" onChange={this.changeSupplier} />
          ) : (
            renderFlag
          );
        },
      },
      {
        name: 'noUnitPrice',
        width: 120,
        renderer: ({ value, record }) =>
          thousandBitSeparator(value, record.get('defaultPrecision')),
      },
      {
        name: 'quantity',
        width: 120,
      },
      {
        name: 'thisOrderQuantity',
        width: 120,
        editor: (record) => this.tableDataDs.selected.includes(record),
      },
      {
        name: 'occupiedQuantity',
        width: 120,
      },
      {
        name: 'restPoQuantity',
        width: 120,
      },
      {
        name: 'neededDate',
        width: 120,
      },
      {
        name: 'uomName',
        width: 120,
      },
      {
        name: 'projectCategoryMeaning',
        width: 120,
      },
      { width: 120, name: 'prTypeName' },
      {
        name: 'commonName',
        width: 120,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        width: 120,
        name: 'taxIncludedUnitPrice',
        renderer: ({ value, record }) =>
          thousandBitSeparator(value, record.get('defaultPrecision')),
      },
      {
        width: 120,
        name: 'supplierCode',
      },
      {
        width: 120,
        name: 'supplierName',
      },

      {
        name: 'companyName',
        width: 120,
      },
      {
        name: 'ouName',
        width: 120,
      },
      {
        name: 'purchaseOrgName',
        width: 120,
      },
      {
        name: 'invOrganizationName',
        width: 120,
      },
      {
        name: 'productNum',
        width: 120,
      },
      {
        name: 'productName',
        width: 120,
      },
      {
        name: 'catalogName',
        width: 120,
      },
      {
        name: 'prRequestedName',
        width: 120,
      },
      {
        name: 'receiverAddress',
        width: 150,
      },
      {
        name: 'surfaceTreatFlag',
        width: 100,
        renderer: this.isEnabledRender,
      },
      {
        name: 'pcNum',
        width: 120,
      },
      {
        name: 'itemModel',
        width: 100,
      },
      {
        name: 'itemSpecs',
        width: 100,
      },
      {
        name: 'remark',
        width: 120,
      },
      {
        name: 'prSourcePlatformMeaning',
        width: 100,
      },
      {
        width: 120,
        name: 'changeOrderCode',
        renderer: ({ value, record }) => ChangeOrderCodeRender({ record, value }),
      },
      {
        name: 'urgentFlag',
        width: 100,
        renderer: this.isEnabledRender,
      },
      {
        name: 'urgentDate',
        width: 100,
      },
    ];
    const referPriceProps = {
      priceRecordId,
      referPriceRecord,
      visible: referPriceVisible,
      hideModal: () => this.handleModalVisible('referPriceVisible', false),
    };

    return (
      <Fragment>
        <div style={{ height: 500 }}>
          {customizeTable(
            {
              code: 'SPRM.PURCHASE_REQUISITION_POLL.ORDER_LIST',
              filterCode: 'SPRM.PURCHASE_REQUISITION_POLL.ORDER_FILTER',
            },
            <Table columns={columns} dataSet={this.tableDataDs} autoHeight />
          )}
        </div>
        {referPriceVisible && <LadderPrice {...referPriceProps} />}
      </Fragment>
    );
  }
}
