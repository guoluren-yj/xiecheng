import React, { Component, Fragment } from 'react';
import { Table, DataSet, Tooltip, DatePicker } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import { createPagination } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { fetchOperationRecordList } from '@/services/purchaseRequisitionPoolService.js';
import { tableDs } from './fieldsInitalValue';
import OperationRecord from '../../components/OperationRecord/OperationRecord';
import LadderPrice from './../../components/LadderPrice';
import ChangeOrderCodeRender from '@/routes/components/ChangeOrderCodeRender';

import { thousandBitSeparator } from '@/routes/utils.js';
import urgentImg from '@/assets/icon-expedited.svg';

const commonPrompt = 'sprm.common.model.common';

@formatterCollections({
  code: ['sprm.common', 'smdm.common'],
})
@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_POLL.ALL_LIST',
    'SPRM.PURCHASE_REQUISITION_POLL.ALL_FILTER',
  ],
})
export default class TransferAll extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    const { doubleUintFlag } = props;
    const { SPRM, SODR, RFX, SPCM } = doubleUintFlag || {};
    this.state = {
      operationRecordList: [],
      operationRecordModalVisible: false,
      referPriceVisible: false, // 参考价格
      operationRecordPagination: {},
      currentRecord: {},
    };
    this.tableDataDs = new DataSet({
      ...tableDs(),
      events: {
        load: ({ dataSet }) => {
          const { totalCount } = dataSet;
          const { updatePage } = this.props;
          updatePage(totalCount, 'allDate');
        },
      },
    });
    this.tableDataDs.setState('uomControl', SPRM || SODR || RFX || SPCM || 0);
  }

  // 渲染状态列
  @Bind()
  isEnabledRender({ value }) {
    const btns = [];
    btns.push(yesOrNoRender(Number(value)));
    return btns;
  }

  /**
   * 查询操作记录列表
   */
  @Bind()
  async handleOperationRecordSearch(page = {}) {
    const { prHeaderId } = this.state;
    const data = await fetchOperationRecordList({ prHeaderId, page });
    if (data) {
      this.setState({
        operationRecordList: data.content,
        operationRecordPagination: createPagination(data),
      });
    }
  }

  @Bind()
  openOperatorRecord({ record }) {
    const { data = {} } = record;
    this.setState({
      prHeaderId: data.prHeaderId,
      operationRecordModalVisible: true,
      currentRecord: data,
    });
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

  // 参考价格
  @Bind()
  handleLadderPrice(record) {
    const { data = {} } = record;
    this.setState({ priceRecordId: data.prLineId, referPriceVisible: true });
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.activeKey === 'all';
  }

  render() {
    const {
      operationRecordList = [],
      operationRecordModalVisible = false,
      operationRecordPagination = {},
      priceRecordId,
      referPriceVisible = false,
      currentRecord,
    } = this.state;
    const { customizeTable, doubleUintFlag } = this.props;
    const columns = [
      {
        name: 'prLineStatusCodeMeaning',
        width: 100,
      },
      {
        name: 'displayPrNum',
        width: 150,
        renderer: ({ text, record }) => (
          <div className="row-agent-column">
            {text}
            {record.get('urgentFlag') === 1 ? (
              <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        name: 'title',
        width: 150,
      },
      {
        width: 100,
        name: 'displayLineNum',
      },
      // {
      //   name: 'accountAssignTypeCode',
      //   width: 120,
      // },
      { width: 140, name: 'itemCode' },
      {
        name: 'prTypeName',
        width: 120,
      },
      { width: 120, name: 'itemName' },
      {
        name: 'categoryName',
        width: 120,
      },
      // {
      //   name: 'itemAbcClass',
      //   width: 180,
      // },
      {
        name: 'quantity',
        width: 120,
      },
      {
        name: 'uomCodeAndName',
        width: 120,
      },
      {
        name: 'secondaryTaxInUnitPrice',
        width: 100,
        renderer: ({ value, record }) =>
          record.get('linePriceHiddenFlag') === 1
            ? record.get('taxIncludedUnitPriceMeaning')
            : value,
      },
      {
        name: 'secondaryUomName',
        width: 100,
        renderer: ({ value, record }) => record.get('secondaryUomCodeAndName') || value,
      },
      {
        name: 'secondaryQuantity',
        width: 100,
      },
      {
        width: 120,
        name: 'currencyCode',
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 120,
        renderer: ({ value, record }) =>
          record.get('linePriceHiddenFlag') === 1
            ? record.get('taxIncludedUnitPriceMeaning')
            : value,
      },
      {
        width: 80,
        name: 'unitPriceBatch',
        renderer: ({ value }) => thousandBitSeparator(value),
      },
      {
        name: 'taxIncludedLineAmount',
        width: 120,
        renderer: ({ value, record }) =>
          record.get('linePriceHiddenFlag') === 1
            ? record.get('taxIncludedLineAmountMeaning')
            : thousandBitSeparator(
                value,
                record.get('financialPrecision'),
                record.get('prSourcePlatform') !== 'SRM'
              ),
      },
      {
        width: 120,
        name: 'executionStrategyMeaning',
      },
      {
        width: 120,
        name: 'changeOrderCode',
        renderer: ({ value, record }) => ChangeOrderCodeRender({ record, value }),
      },
      {
        width: 120,
        name: 'taxIncludedBudgetUnitPrice',
        renderer: ({ value, record }) =>
          record.get('linePriceHiddenFlag') === 1
            ? record.get('taxIncludedBudgetUnitPriceMeaning')
            : value,
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
        name: 'budgetIoFlag',
        width: 120,
        renderer: this.isEnabledRender,
      },
      {
        name: 'neededDate',
        width: 120,
      },
      {
        name: 'requestDate',
        width: 120,
      },
      {
        name: 'companyName',
        width: 150,
      },
      {
        width: 120,
        name: 'ouName',
      },
      {
        name: 'purchaseOrgName',
        width: 120,
      },
      {
        name: 'purchaseAgentName',
        width: 120,
      },
      {
        name: 'invOrganizationName',
        width: 120,
      },
      // {
      //   name: 'inventoryName',
      //   width: 120,
      // },
      {
        name: 'prRequestedName',
        width: 120,
      },
      {
        width: 120,
        name: 'remark',
      },
      {
        name: 'erpEditStatus',
        width: 120,
      },
      {
        name: 'executionStatusMeaning',
        width: 120,
      },
      {
        width: 120,
        name: 'executionHeaderBillNum',
      },
      {
        width: 120,
        name: 'executorName',
      },
      {
        width: 120,
        name: 'creationDate',
      },
      {
        width: 120,
        name: 'unitName',
      },
      {
        width: 120,
        name: 'creatorName',
      },
      {
        width: 120,
        name: 'assignedDate',
      },
      {
        width: 120,
        name: 'prSourcePlatformMeaning',
      },
      {
        width: 120,
        name: 'enclosure',
        renderer: ({ record }) => {
          const {
            data: { attachmentUuid = null },
          } = record;
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
      { width: 120, name: 'projectCategoryMeaning' },
      { width: 120, name: 'wbs', type: 'string' },
      { name: 'projectNum', width: 120 },
      { name: 'projectName', width: 120 },
      { name: 'supplierItemCode', width: 120 },
      { name: 'supplierItemName', width: 120 },
      { name: 'itemModel', width: 120 },
      { name: 'itemSpecs', width: 120 },
      { name: 'productBrand', width: 120 },
      { name: 'productModel', width: 120 },
      { name: 'packingList', width: 120 },
      {
        width: 100,
        name: 'operatorRecord',
        renderer: (record) => (
          <a onClick={() => this.openOperatorRecord(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
    ];

    const { SPRM, SODR, RFX, SPCM } = doubleUintFlag || {};
    const baseUomInfo =
      SPRM || SODR || SPCM || RFX
        ? []
        : ['secondaryUomName', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];

    const referPriceProps = {
      priceRecordId,
      visible: referPriceVisible,
      hideModal: () => this.handleModalVisible('referPriceVisible', false),
    };
    const operationRecordProps = {
      record: currentRecord,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      pagination: operationRecordPagination,
      loading: false,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    return (
      <Fragment>
        <div>
          {customizeTable(
            {
              filterCode: 'SPRM.PURCHASE_REQUISITION_POLL.ALL_FILTER',
              code: 'SPRM.PURCHASE_REQUISITION_POLL.ALL_LIST',
              lovIgnore: false,
              queryLovIgnore: false,
            },
            <Table
              dataSet={this.tableDataDs}
              columns={columns.filter((ele) => !baseUomInfo.includes(ele.name))}
              queryFieldsLimit={3}
              queryFields={{
                createdDateEnd: (
                  <DatePicker
                    mode="dateTime"
                    dataSet={this.tableDataDs.queryDataSet}
                    defaultTime={moment('23:59:59', 'HH:mm:ss')}
                  />
                ),
              }}
            />
          )}
        </div>
        <OperationRecord {...operationRecordProps} />
        {referPriceVisible && <LadderPrice {...referPriceProps} />}
      </Fragment>
    );
  }
}
