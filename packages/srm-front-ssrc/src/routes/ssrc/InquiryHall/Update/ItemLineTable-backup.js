/**
 * inquiryHall - 寻源服务/询价大厅-物料明细c7n改造
 * @date: 2020-9-19
 * @author: LZJ <zhijian.li@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent } from 'react';
import { Form, DatePicker, Row, Col } from 'hzero-ui';
import { observer } from 'mobx-react-lite';
import { Table, Button, Modal, ModalProvider } from 'choerodon-ui/pro';
import { isFunction, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import WithCustomize from 'srm-front-cuz/lib/components/c7n/withCustomize';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
// import notification from 'utils/notification';
import Upload from 'srm-front-boot/lib/components/Upload';
import CommonImport from '@/routes/himp/CommonImportNew';
import Lov from 'components/Lov';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import Iconfont from '../../components/Icons'; // 下载至本地的icon
import { FIlESIZE } from '@/utils/SsrcRegx';
import SupplierRecord from './SupplierRecord';
import LadderLevelModal from './LadderLevelModal';
import unExpand from '@/assets/un-expand.svg';

import styles from './index.less';
import common from '@/routes/ssrc/common.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@WithCustomize({
  unitCode: ['SSRC.INQUIRY_HALL.EDIT_LINE'],
})
export default class ItemLineTable extends PureComponent {
  constructor(props) {
    super(props);
    this.rowKey = 'rfxLineItemId';
    this.state = {
      itemViewModalVisible: false,
      itemIds: undefined,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  /**
   * updateState
   * 保存以改变的行
   */
  @Bind()
  changeDataSoruce(record, data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        itemLine: data,
      },
    });
  }

  /**
   * 点击筛选供应商打开筛选供应商模态框，查询供应商列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  onSelectSupplier() {
    const { searchSupplier } = this.props;
    this.setState({
      itemViewModalVisible: true,
    });
    searchSupplier();
  }

  /**
   * hideOperationRecord - 关闭筛选供应商弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState({ itemViewModalVisible: false, itemIds: undefined });
  }

  @Bind()
  onSaveSupplierRecordLine() {
    const { onSaveSupplierRecordLine: handleSave } = this.props;
    const { itemIds } = this.state;
    handleSave(itemIds);
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchExport() {
    const {
      match: {
        params: { rfxId },
      },
      organizationId,
      itemLineTableDS,
    } = this.props;
    if (!rfxId || rfxId === 'null') {
      return;
    }

    const props = {
      code: 'SSRC.RFX_QUOTATION.ITEM',
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        tenantId: organizationId,
        organizationId,
        rfxHeaderId: rfxId,
        templateCode: 'SSRC.RFX_QUOTATION.ITEM',
      }),
      backPath: undefined,
      action: 'hzero.common.title.batchImport',
    };

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: Modal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.tab.itemDetails`).d('物品明细'),
      children: <CommonImport {...props} />,
      style: { width: '80%' },
      onOk: () => itemLineTableDS.query(itemLineTableDS.currentPage),
    });
  }

  // 批量维护表单
  renderBatchMaintainFrom() {
    const {
      form,
      batchMaintainItemLineVisible,
      batchMaintainItemLineLoading,
      cancelBatchMaintainItemLine,
      saveBatchMaintainItemLine,
      resetBatchMaintainItemLine,
      customizeForm = () => {},
    } = this.props;

    if (!batchMaintainItemLineVisible) {
      return;
    }

    return (
      <React.Fragment>
        {customizeForm(
          { code: 'SSRC.INQUIRY_HALL_EDIT.LINE_BATCH_FORM', form },
          <Form className="writable-row-custom">
            <Row gutter={48} className="writable-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {form.getFieldDecorator('demandDate')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder=""
                      style={{ width: '160px' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）')}
                >
                  {form.getFieldDecorator('taxId')(<Lov code="SMDM.TAX" textField="taxRate" />)}
                  {form.getFieldDecorator('taxRate')(<div />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
        <div className={styles['item-list-search']}>
          <Button
            type="primary"
            onClick={saveBatchMaintainItemLine}
            loading={batchMaintainItemLineLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button onClick={resetBatchMaintainItemLine}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button onClick={cancelBatchMaintainItemLine}>
            {intl.get('hzero.common.view.button.cancel').d('取消')}
          </Button>
        </div>
      </React.Fragment>
    );
  }

  /**
   * 点击维护打开筛选供应商模态框，查询供应商列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  onMainten(record = {}) {
    const { searchSupplier } = this.props;
    const itemIds = record.get('rfxLineItemId');
    this.setState(
      {
        itemIds,
        itemViewModalVisible: true,
      },
      () => {
        searchSupplier(itemIds);
      }
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      header,
      saveLoading,
      dispatch,
      match,
      // dataSource = [],
      supplierDataSource = [],
      visible,
      hideModal,
      onCreateLine,
      onSaveLine,
      allowAddItems,
      onSaveLadderLine,
      onDeleteLines,
      organizationId,
      viewLadderLevel,
      ladderLevelData,
      onCreateLadderLine,
      onDeleteLadderLines,
      ladderLevelRowSelection,
      onChangeLadderTableData,
      ladderLevelSelectedRowKeys = [],
      itemLineSelectedRows = [],
      saveSupplierLoading,
      saveLadderLevelLoading,
      fetchLadderLevelLoading,
      LadderLevelHeaderData = {},
      copyItemLine = () => {},
      itemLineTableDS,
      linktoPrNumDetail,
      startBatchMaintainItemLine,
      customizeTable = () => {},
      custLoading,
    } = this.props;

    const allowChangeItemsFlag =
      header.allowChangeItemsFlag === 0 && header.sourceFrom === 'PROJECT';
    const { itemViewModalVisible, itemIds } = this.state;
    const isDisabledSupplier = itemLineSelectedRows.filter(
      (item) => item.rfxLineItemNum === undefined
    );
    const itemViewModalProps = {
      saveSupplierLoading,
      match,
      dispatch,
      organizationId,
      supplierDataSource,
      onSaveSupplierRecordLine: this.onSaveSupplierRecordLine,
      visible: itemViewModalVisible,
      hideModal: this.hideOperationRecord,
      itemIds,
    };
    const ladderLevelModalProps = {
      visible,
      hideModal,
      ladderLevelData,
      onSaveLadderLine,
      onCreateLadderLine,
      onDeleteLadderLines,
      LadderLevelHeaderData,
      saveLadderLevelLoading,
      onChangeLadderTableData,
      fetchLadderLevelLoading,
      ladderLevelRowSelection,
      ladderLevelSelectedRowKeys,
    };

    const columns = [
      {
        name: 'rfxLineItemNum',
        width: 100,
      },
      {
        name: 'ouIdLov',
        width: 140,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'invOrganizationIdLov',
        width: 150,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'itemIdLov',
        width: 150,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'itemName',
        width: 200,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'specs',
        width: 100,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'itemCategoryIdLov',
        width: 150,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'rfxQuantity',
        width: 100,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'uomIdLov',
        width: 150,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'batchPrice',
        align: 'right',
        width: 110,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'taxIncludedFlag',
        width: 100,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'taxIdLov',
        width: 150,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'demandDate',
        width: 150,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'ladderInquiryFlag',
        width: 120,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'ladderOffer',
        width: 100,
        renderer: ({ record }) =>
          record.get('ladderInquiryFlag') &&
          record.get('creationDate') &&
          record.get('rfxLineItemId') ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        name: 'quotationDetail',
        width: 100,
        renderer: ({ record }) =>
          record.get('itemCategoryId') || record.get('itemId') ? (
            <QuotationDetail rowData={record} uiType="c7n" sourceFrom="RFX" />
          ) : null,
      },
      {
        name: 'quotationRange',
        width: 140,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'controlProtocolFlag',
        width: 100,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'prNum',
        width: 150,
        renderer: ({ record, value }) => <a onClick={() => linktoPrNumDetail(record)}> {value}</a>,
      },
      {
        name: 'prLineNum',
        width: 120,
      },
      {
        name: 'attachmentUuid',
        width: 150,
        renderer: ({ record }) => (
          <Upload
            viewOnly={allowChangeItemsFlag}
            filePreview
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-rfxitem"
            attachmentUUID={record.get('attachmentUuid')}
            tenantId={organizationId}
            fileSize={FIlESIZE}
            afterOpenUploadModal={(uuid) => {
              record.set('attachmentUuid', uuid);
            }}
          />
        ),
      },
      {
        name: 'filterSupplier',
        width: 100,
        lock: 'right',
        renderer: ({ record }) =>
          record.get('rfxLineItemNum') && !allowChangeItemsFlag ? (
            <a onClick={() => this.onMainten(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.filterSupplier`).d('筛选')}
            </a>
          ) : null,
      },
    ];

    const DisAbleButton = observer((props) => {
      const isDisabled = props.dataSet && props.dataSet.selected.length === 0;
      return (
        <Button icon={props.icon} disabled={isDisabled || props.disabled} onClick={props.onClick}>
          {props.children}
        </Button>
      );
    });
    // 立项转寻源单子且在业务规则定义里配置不可修改  则不允许勾选
    // if (allowChangeItemsFlag) {
    //   itemLineTableDS.forEach((record) => {
    //     Object.assign(record, { selectable: false });
    //   });
    // }

    return (
      <React.Fragment>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            style={{ paddingTop: '4px', cursor: 'pointer' }}
            onClick={startBatchMaintainItemLine}
          >
            {intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护')}
            <img style={{ marginLeft: '4px' }} src={unExpand} alt="down" />
          </span>
          <div className={styles['item-list-search']}>
            {allowAddItems ? (
              <Button
                color="primary"
                onClick={onCreateLine}
                disabled={allowChangeItemsFlag}
                icon="add"
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
            ) : (
              ''
            )}
            <Button
              onClick={onSaveLine}
              loading={saveLoading}
              disabled={allowChangeItemsFlag}
              icon="save"
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <DisAbleButton
              onClick={onDeleteLines}
              dataSet={itemLineTableDS}
              disabled={allowChangeItemsFlag}
              icon="delete"
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </DisAbleButton>
            <DisAbleButton
              onClick={copyItemLine}
              dataSet={itemLineTableDS}
              loading={saveLoading}
              disabled={allowChangeItemsFlag}
              icon="content_copy"
            >
              {intl.get('hzero.common.button.copy').d('复制')}
            </DisAbleButton>
            <DisAbleButton
              onClick={this.onSelectSupplier}
              dataSet={itemLineTableDS}
              disabled={!isEmpty(isDisabledSupplier) || allowChangeItemsFlag}
            >
              {intl
                .get(`ssrc.inquiryHall.view.message.button.screeningSupplier`)
                .d('批量筛选供应商')}
            </DisAbleButton>
            <Button
              type="default"
              disabled={allowChangeItemsFlag}
              onClick={() => this.handleBatchExport()}
            >
              <Iconfont type="main-import" size={16} className={common['btn-icon']} />
              {intl.get(`ssrc.inquiryHall.view.message.button.itemImport`).d('物料导入')}
            </Button>
          </div>
        </div>
        {this.renderBatchMaintainFrom()}
        <ModalProvider>
          {customizeTable(
            { code: 'SSRC.INQUIRY_HALL.EDIT_LINE' },
            <Table columns={columns} dataSet={itemLineTableDS} custLoading={custLoading} />
          )}
        </ModalProvider>
        {visible && <LadderLevelModal {...ladderLevelModalProps} />}
        {itemViewModalVisible && <SupplierRecord {...itemViewModalProps} />}
      </React.Fragment>
    );
  }
}
