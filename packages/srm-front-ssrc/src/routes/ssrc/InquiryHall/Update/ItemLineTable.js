import React, { PureComponent } from 'react';
import { Form, Input, Button, DatePicker, Select, Tooltip, Row, Col } from 'hzero-ui';
import { Modal, ModalProvider } from 'choerodon-ui/pro';
import { sum, isNumber, isFunction, isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { enableRender, dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import CommonImport from '@/routes/himp/CommonImportNew';
import { getDateFormat } from 'utils/utils';
import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';
import EditTable from '_components/EditTable';
import SVGIcon from '@/routes/components/SvgIcon';
import Upload from 'srm-front-boot/lib/components/Upload';
import Lov from 'components/Lov';
import { DATETIME_MIN, FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { FIlESIZE } from '@/utils/SsrcRegx';
import unExpand from '@/assets/un-expand.svg';
import common from '@/routes/ssrc/common.less';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { calculateBasicQty, getQtyName, getUomName } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import Iconfont from '../../components/Icons'; // 下载至本地的icon
import ItemLineQutationDetailModal from './ItemLineQutationDetailModal';
import SupplierRecord from './SupplierRecord';
import LadderLevelModal from './LadderLevelModal';

import styles from './index.less';

const { Option } = Select;

@Form.create({ fieldNameProp: null })
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
   * 税率改变
   */
  @Bind()
  setValue(e, val, record) {
    if (e.target.checked === 0) {
      record.$form.setFieldsValue({ taxId: undefined, taxRate: undefined });
    }
  }

  @Bind()
  onRow(record) {
    this.setState({
      rfxLineItemId: record.rfxLineItemId,
    });
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
   * 点击维护打开筛选供应商模态框，查询供应商列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  onMainten(record = {}) {
    const { searchSupplier } = this.props;
    const { rfxLineItemId: itemIds } = record;
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
   * 点击筛选供应商打开筛选供应商模态框，查询供应商列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  onSelectSupplier() {
    const { searchSupplier, itemLineSelectedRowKeys = [] } = this.props;

    if (isEmpty(itemLineSelectedRowKeys)) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryhall.message.pleaseSelectAtleastOneUpdate')
          .d('请至少选择一条数据进行维护'),
      });
      return;
    }

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

  /**
   * 保存Uuid
   */
  @Bind()
  afterOpenUploadModal(attachmentUUID) {
    const { dataSource = [] } = this.props;
    const { rfxLineItemId } = this.state;

    const index = dataSource.findIndex((item) => item[this.rowKey] === rfxLineItemId);
    const newDataSourceList = [
      ...dataSource.slice(0, index),
      {
        ...dataSource[index],
        attachmentUuid: attachmentUUID,
      },
      ...dataSource.slice(index + 1),
    ];

    this.changeDataSoruce('dataSource', newDataSourceList);
  }

  @Bind()
  onSaveSupplierRecordLine() {
    const { onSaveSupplierRecordLine: handleSave } = this.props;
    const { itemIds } = this.state;
    handleSave(itemIds);
  }

  // 计算基本数量
  getCalculateQty = (record = {}, val = '') => {
    const {
      $form: { getFieldValue, setFieldsValue },
    } = record;
    if (getFieldValue('secondaryQuantity') && getFieldValue('secondaryUomId')) {
      calculateBasicQty({
        secondaryQuantity: getFieldValue('secondaryQuantity'),
        itemId: val || getFieldValue('itemId'),
        businessKey: -1,
        doublePrimaryUomId: getFieldValue('uomId'),
        secondaryUomId: getFieldValue('secondaryUomId'),
      }).then((res) => {
        setFieldsValue({
          rfxQuantity: res ?? undefined,
        });
      });
    } else if (getFieldValue('secondaryQuantity') === 0) {
      setFieldsValue({
        rfxQuantity: 0,
      });
    }
  };

  /**
   * 改变物料编码-获取物品描述、单位、双单位、单位转换率
   */
  @Bind()
  changeItemId(val, dataList, record) {
    const { doubleUnitFlag } = this.props;
    const {
      $form: { setFieldsValue, getFieldValue },
    } = record;
    if (doubleUnitFlag && val) {
      setFieldsValue({
        secondaryUomId: dataList.secondaryUomId || dataList.uomId,
        secondaryUomName: dataList.secondaryUomName || dataList.uomName,
        uomId: dataList.uomId,
        uomName: dataList.uomName,
      });
      if (dataList.secondaryUomId && dataList.secondaryUomId !== dataList.uomId) {
        setFieldsValue({
          priceBatch: 1,
        });
      }
      this.getCalculateQty(record, val);
    } else {
      setFieldsValue({
        rfxQuantity: getFieldValue('secondaryQuantity'),
        uomId: dataList.orderUomId || dataList.primaryUomId,
        uomName: dataList.orderUomName || dataList.uomName,
        secondaryUomId: dataList.orderUomId || dataList.primaryUomId,
        secondaryUomName: dataList.orderUomName || dataList.uomName,
      });
    }
    setFieldsValue({
      itemId: dataList.partnerItemId,
      itemName: dataList.itemName,
      itemCode: dataList.itemCode,
      biUomId: dataList.biUomId,
      biUomName: dataList.biUomName,
      uomConversionRate: dataList.uomConversionRate,
      drawingNum: dataList.chartCode,
      drawingVersionNumber: dataList.drawingVersion,
      commonName: dataList.commonName,
      referencePrice: dataList.plannedPrice,
      specs: dataList.specifications,
      supplierItemNumDesc: dataList.supplierItemNumDesc,
      itemCategoryId: dataList.categoryId,
      itemCategoryName: dataList.categoryName,
      model: dataList.model || null,
    });

    this.props.handleQuotationDetail(record, false);
  }

  // 改变基本数量
  @Bind()
  changeSecondaryQuantity(e, record = {}) {
    const { doubleUnitFlag } = this.props;
    const {
      $form: { setFieldsValue, getFieldValue },
    } = record;
    if (e.target.value) {
      if (doubleUnitFlag && getFieldValue('itemId')) {
        this.getCalculateQty(record);
      } else {
        setFieldsValue({
          rfxQuantity: getFieldValue('secondaryQuantity'),
        });
      }
    }
  }

  // 改变单位
  @Bind()
  // eslint-disable-next-line no-unused-vars
  changeUomId(val = null, dataList = {}, record = {}) {
    const { doubleUnitFlag } = this.props;
    const {
      $form: { setFieldsValue, getFieldValue },
    } = record;
    const { uomId = null, uomName = null, uomCodeAndName = null } = dataList || {};

    if (doubleUnitFlag && getFieldValue('itemId')) {
      setFieldsValue({
        secondaryUomId: uomId,
        secondaryUomName: uomName,
      });
      if (dataList.uomId && dataList.uomId !== getFieldValue('uomId')) {
        setFieldsValue({
          priceBatch: 1,
        });
      }
      this.getCalculateQty(record);
    } else {
      setFieldsValue({
        rfxQuantity: getFieldValue('secondaryQuantity'),
        uomId,
        uomName: uomCodeAndName,
        secondaryUomId: uomId,
        secondaryUomName: uomCodeAndName,
      });
    }
  }

  // 确保不开启双单位的情况下辅助单位与基本单位一致
  @Bind()
  // eslint-disable-next-line no-unused-vars
  onlyChangeUomId(val = null, dataList = {}, record = {}) {
    const {
      $form: { setFieldsValue },
    } = record;
    const { uomId = null, uomCodeAndName = null } = dataList || {};
    setFieldsValue({
      uomId,
      uomName: uomCodeAndName,
      secondaryUomId: uomId,
      secondaryUomName: uomCodeAndName,
    });
  }

  /**
   * 改变物品分类
   *
   * @param {*} val
   * @param {*} dataList
   * @param {*} record
   * @memberof ItemLineTable
   */
  @Bind()
  changeItemCategory(val, dataList, record) {
    record.$form.setFieldsValue({
      itemCategoryId: val,
      itemCategoryName: dataList.categoryName,
    });

    this.props.handleQuotationDetail(record, false);
  }

  /**
   * 改变税率-获取税率显示值
   */
  @Bind()
  changeTaxId(val, dataList, record) {
    record.$form.setFieldsValue({
      taxId: dataList.taxId,
      taxRate: dataList.taxRate,
    });
  }

  /**
   * 改变业务实体 - 清空库存组织-物料编码-物品描述
   */
  @Bind()
  changeOuId(val, dataList, record) {
    record.$form.setFieldsValue({
      ouName: dataList.ouName,
      invOrganizationId: undefined,
      itemId: undefined,
      itemName: undefined,
      itemCode: undefined,
      secondaryUomId: undefined,
      secondaryUomName: undefined,
      uomId: undefined,
      uomName: undefined,
      biUomId: undefined,
      biUomName: undefined,
      uomConversionRate: undefined,
    });
  }

  /**
   * 改变库存组织 - 清空物料编码-物品描述
   */
  @Bind()
  changeInvOrganizationId(val, dataList, record) {
    record.$form.setFieldsValue({
      invOrganizationName: dataList.organizationName,
      itemId: undefined,
      itemName: undefined,
      itemCode: undefined,
      uomId: undefined,
      uomName: undefined,
      secondaryUomId: undefined,
      secondaryUomName: undefined,
      biUomId: undefined,
      biUomName: undefined,
      uomConversionRate: undefined,
    });
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const { onChangeTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeTableData();
    }
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
      fetchItemLine,
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
      onOk: () => fetchItemLine(),
    });
  }

  /**
   * 根据浮动方式调整报价幅度单位
   */
  @Bind()
  handleQuotationRange(value, record) {
    let mean = '';
    if (record.$form.getFieldValue('floatType')) {
      if (record.$form.getFieldValue('floatType') === 'money') {
        mean = `${value}${intl.get('ssrc.inquiryHall.model.inquiryHall.yuan').d('元')}`;
      } else {
        mean = `${value}%`;
      }
    } else {
      mean = null;
    }
    return mean;
  }

  /**
   * 根据浮动方式调整报价幅度的值
   */
  @Bind()
  handleFloatingWay(val, record) {
    if (isUndefined(val)) {
      record.$form.setFieldsValue({ quotationRange: null });
    }
  }

  /**
   * 批量维护需求时间
   */
  @Bind()
  batchChangeDemandDate() {
    const { form, itemLineRowSelection, dispatch, dataSource, resetRowselection } = this.props;
    const { selectedRows } = itemLineRowSelection;
    if (form.getFieldValue('batchDemandDate')) {
      if (selectedRows && selectedRows.length > 0) {
        const batchDemandDate = form.getFieldValue('batchDemandDate').format(DATETIME_MIN);
        const newDataSoure = dataSource.map((item) =>
          selectedRows.map((selectedRow) => selectedRow.rfxLineItemId).includes(item.rfxLineItemId)
            ? { ...item, demandDate: batchDemandDate }
            : item
        );
        dispatch({
          type: 'inquiryHall/updateState',
          payload: {
            itemLine: newDataSoure,
          },
        });
        resetRowselection();
        notification.success();
      } else {
        notification.warning({
          message: intl
            .get('ssrc.inquiryhall.message.pleaseSelectAtleastOneUpdate')
            .d('请至少选择一条数据进行维护'),
        });
      }
    } else {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.model.inquiryHall.pleaseSelectDate')
          .d('请选择想要批量维护的日期'),
      });
    }
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
      dataSource = [],
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
                <Form.Item
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
                </Form.Item>
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
            disabled={isEmpty(dataSource)}
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
   * 校验需求数量>0
   * @param {*} rule
   * @param {*} value
   * @param {*} callback
   */
  @Bind()
  valiRfxQuantity(_, value, callback) {
    if (value === 0) {
      callback(
        intl
          .get('ssrc.inquiryHall.model.inquiryHall.rfxQuantityMorethanZero')
          .d('需求数量必须大于0')
      );
    } else {
      callback();
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      header,
      loading,
      saveLoading,
      dispatch,
      form,
      match,
      dataSource = [],
      supplierDataSource = [],
      pagination,
      onSearch,
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
      itemLineRowSelection,
      ladderLevelRowSelection,
      onChangeLadderTableData,
      matchRestrictFlag,
      // itemLineSelectedRowKeys = [],
      ladderLevelSelectedRowKeys = [],
      itemLineSelectedRows = [],
      saveSupplierLoading,
      saveLadderLevelLoading,
      fetchLadderLevelLoading,
      LadderLevelHeaderData = {},
      fetchItemLineQuotationDetailLoading,
      itemLineQuotationDetailModalVisible,
      cancelItemLineQutationDetail,
      sureItemLineQutationDetail,
      itemLineEditoringId = '',
      companyId = null,
      customizeTable,
      settings,
      copyItemLine = () => {},
      custLoading,
      startBatchMaintainItemLine,
      linktoPrNumDetail,
      doubleUnitFlag,
      itemLineSelectedRowKeys = [],
    } = this.props;

    // const { params } = match;
    const allowChangeItemsFlag =
      header.allowChangeItemsFlag === 0 && header.sourceFrom === 'PROJECT';
    const setting000112 = settings['000112'] && settings['000112'].settingValue;
    const itemLineQuotationDetails = dataSource.filter(
      (item) => item.rfxLineItemId === itemLineEditoringId
    );
    const { itemViewModalVisible, itemIds } = this.state;
    const isDisabledSupplier = itemLineSelectedRows.filter(
      (item) => item.rfxLineItemNum === undefined
    );
    const DisAbleButton = (props) => {
      const isDisabled = props.dataSet && props.dataSet.selected.length === 0;
      return (
        <Button icon={props.icon} disabled={isDisabled || props.disabled} onClick={props.onClick}>
          {props.children}
        </Button>
      );
    };
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
      header,
    };
    const ladderLevelModalProps = {
      visible,
      hideModal,
      doubleUnitFlag,
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

    // 物品行报价明细props
    const ItemLineQutationDetailProps = {
      form,
      organizationId,
      itemLineQuotationDetail: itemLineQuotationDetails.length
        ? itemLineQuotationDetails[0].quotationDetails
        : [],
      fetchItemLineQuotationDetailLoading,
      itemLineQuotationDetailModalVisible,
      cancelItemLineQutationDetail,
      sureItemLineQutationDetail,
    };
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ouId', {
                initialValue: record.ouId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.OU"
                  textValue={record.ouName}
                  onChange={(value, dataList) => this.changeOuId(value, dataList, record)}
                  disabled={record.prHeaderId || allowChangeItemsFlag}
                  queryParams={{
                    companyId,
                  }}
                />
              )}
              {record.$form.getFieldDecorator('ouName', { initialValue: record.ouName })}
            </Form.Item>
          ) : (
            record.ouName
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('invOrganizationId', {
                initialValue: val,
              })(
                <Lov
                  code="HPFM.INV_ORG"
                  textValue={record.invOrganizationName}
                  disabled={
                    !record.$form.getFieldValue('ouId') || record.prHeaderId || allowChangeItemsFlag
                  }
                  onChange={(value, dataList) =>
                    this.changeInvOrganizationId(value, dataList, record)
                  }
                  queryParams={{
                    ouId: record.$form.getFieldValue('ouId'),
                    enabledFlag: 1,
                    organizationId,
                  }}
                />
              )}
              {record.$form.getFieldDecorator('invOrganizationName', {
                initialValue: record.invOrganizationName,
              })}
            </Form.Item>
          ) : (
            record.invOrganizationName
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemId', {
                initialValue: val,
              })(
                <Lov
                  code="SSRC.NEW_CUSTOMER_ITEM"
                  textValue={record.itemCode}
                  disabled={record.prHeaderId || allowChangeItemsFlag}
                  onChange={(value, dataList) => this.changeItemId(value, dataList, record)}
                  queryParams={{
                    invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                    ouId: record.$form.getFieldValue('ouId') || null,
                    companyId,
                  }}
                  tableDsProps={{
                    autoCount: false,
                    asyncCountFlag: 'Y',
                  }}
                />
              )}
              {record.$form.getFieldDecorator('itemCode', { initialValue: record.itemCode })}
            </Form.Item>
          ) : (
            record.itemCode
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemName', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
                    }),
                  },
                  {
                    max: 300,
                    message: intl.get('hzero.common.validation.max', {
                      max: 300,
                    }),
                  },
                ],
              })(<Input disabled={record.prHeaderId || allowChangeItemsFlag} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        dataIndex: 'itemCategoryId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemCategoryId', {
                initialValue: val,
                rules: [
                  {
                    required: matchRestrictFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`)
                        .d('物料类别'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM.TREE_ITEM_CATEGORY"
                  textValue={record.itemCategoryName}
                  textField="itemCategoryName"
                  queryParams={{
                    tenantId: organizationId,
                    itemId: record.$form.getFieldValue('itemId'),
                  }}
                  disabled={allowChangeItemsFlag}
                  onChange={(value, dataList) => this.changeItemCategory(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('itemCategoryName', {
                initialValue: record.itemCategoryName,
              })}
            </Form.Item>
          ) : (
            record.itemCategoryName
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTemplate`).d('报价模板'),
        dataIndex: 'quotationTemplateId',
        width: 180,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('quotationTemplateId', {
                initialValue: val,
              })(
                <Lov
                  code="SSRC.QUOTATION_TEMPLATE"
                  textField="templateName"
                  lovOptions={{
                    displayField: 'templateName',
                    valueField: 'templateId',
                  }}
                  queryParams={{
                    tenantId: organizationId,
                  }}
                />
              )}
              {record.$form.getFieldDecorator('templateName', {
                initialValue: record.templateName,
              })}
            </Form.Item>
          ) : (
            record.templateName
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetail',
        width: 100,
        render: (val, record) =>
          ((['update', 'create'].includes(record._status) &&
            record.$form.getFieldValue('itemId')) ||
            record.$form.getFieldValue('itemCategoryId')) &&
          record.creationDate ? (
            <Form.Item>
              {record.$form.getFieldDecorator('quotationDetail', {
                initialValue: val,
              })(<QuotationDetail rowData={record} sourceFrom="RFX" />)}
            </Form.Item>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
        dataIndex: 'specs',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('specs', {
                initialValue: val,
              })(<Input disabled={allowChangeItemsFlag} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 120,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryQuantity', {
                    initialValue: val,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.quantity`)
                            .d('需求数量'),
                        }),
                      },
                      {
                        validator: this.valiRfxQuantity,
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      uom={record.secondaryUomId}
                      max="99999999999999999999"
                      min="0"
                      style={{ width: '100%' }}
                      disabled={allowChangeItemsFlag || !doubleUnitFlag}
                      onBlur={(e) => this.changeSecondaryQuantity(e, record)}
                    />
                  )}
                </Form.Item>
              ) : (
                numberSeparatorRender(val)
              ),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
            dataIndex: 'secondaryUomId',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryUomId', {
                    initialValue: val,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      disabled={
                        (setting000112 === '1' &&
                          (record.itemCode || record.$form.getFieldValue('itemCode'))) ||
                        allowChangeItemsFlag
                      }
                      code={
                        doubleUnitFlag && record.$form.getFieldValue('itemId')
                          ? 'SMDM_ITEM_ORG_UOM'
                          : 'SSRC.UOM'
                      }
                      textField="secondaryUomName"
                      queryParams={
                        doubleUnitFlag && record.$form.getFieldValue('itemId')
                          ? {
                              itemId: record.$form.getFieldValue('itemId'),
                              primaryUomId: record.$form.getFieldValue('uomId'),
                            }
                          : {}
                      }
                      onChange={(value, dataList) => this.changeUomId(value, dataList, record)}
                    />
                  )}
                  {record.$form.getFieldDecorator('secondaryUomName', {
                    initialValue: record.secondaryUomName,
                  })}
                </Form.Item>
              ) : (
                record.secondaryUomName
              ),
          }
        : null,
      {
        // title: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('rfxQuantity', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
                    }),
                  },
                  {
                    validator: this.valiRfxQuantity,
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  uom={record.uomId}
                  max="99999999999999999999"
                  min="0"
                  style={{ width: '100%' }}
                  disabled={doubleUnitFlag}
                />
              )}
              {!doubleUnitFlag
                ? record.$form.getFieldDecorator('secondaryQuantity', {
                    initialValue: record.secondaryQuantity,
                  })
                : null}
            </Form.Item>
          ) : (
            numberSeparatorRender(val)
          ),
      },
      {
        // title: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('uomId', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSRC.UOM"
                  textValue={record.$form.getFieldValue('uomName') || record.uomName}
                  disabled={doubleUnitFlag}
                  onChange={(value, dataList) => this.onlyChangeUomId(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('uomName', {
                initialValue: record.uomName,
              })}
              {!doubleUnitFlag
                ? record.$form.getFieldDecorator('secondaryUomId', {
                    initialValue: record.secondaryUomId,
                  })
                : null}
              {!doubleUnitFlag
                ? record.$form.getFieldDecorator('secondaryUomName', {
                    initialValue: record.secondaryUomName,
                  })
                : null}
            </Form.Item>
          ) : (
            record.uomName
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceQuantity`).d('价格批量'),
        dataIndex: 'batchPrice',
        align: 'right',
        width: 110,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('batchPrice', {
                initialValue: val || val === 0 ? val : 1,
                rules: [
                  {
                    required: !(
                      doubleUnitFlag &&
                      record.$form.getFieldValue('itemId') &&
                      record.$form.getFieldValue('secondaryUomId') &&
                      record.$form.getFieldValue('uomId') !==
                        record.$form.getFieldValue('secondaryUomId')
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.priceQuantity`)
                        .d('价格批量'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  uom={record.uomId}
                  min="0"
                  disabled={
                    doubleUnitFlag &&
                    record.$form.getFieldValue('itemId') &&
                    record.$form.getFieldValue('secondaryUomId') &&
                    record.$form.getFieldValue('uomId') !==
                      record.$form.getFieldValue('secondaryUomId')
                  }
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxIncludedFlag', {
                initialValue: val,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  onChange={(e) => this.setValue(e, val, record)}
                />
              )}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        dataIndex: 'taxId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxId', {
                initialValue: val,
                rules: [
                  {
                    required:
                      record.$form.getFieldValue('taxIncludedFlag') === 1 &&
                      header.taxChangeFlag === 0,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM.TAX"
                  textField="taxRate"
                  disabled={record.$form.getFieldValue('taxIncludedFlag') === 0}
                  onChange={(value, dataList) => this.changeTaxId(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('taxRate', { initialValue: record.taxRate })}
            </Form.Item>
          ) : (
            record.taxRate
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.controlProtocolFlag`).d('控制协议数量'),
        dataIndex: 'controlProtocolFlag',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('controlProtocolFlag', {
                initialValue: val,
              })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: (
          <Tooltip
            title={intl
              .get(`ssrc.inquiryHall.view.message.floatingMoneyDetail`)
              .d('浮动方式：最小价格幅度的计算按照金额或者比率！')}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式')}
          </Tooltip>
        ),
        dataIndex: 'floatType',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('floatType', {
                initialValue: val,
              })(
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  onChange={(value) => this.handleFloatingWay(value, record)}
                >
                  <Option value="money">
                    {intl.get(`ssrc.inquiryHall.view.message.floatingMoney`).d('金额（元）')}
                  </Option>
                  <Option value="ratio">
                    {intl.get(`ssrc.inquiryHall.view.message.floatingRatio`).d('比率（%）')}
                  </Option>
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: (
          <Tooltip
            title={intl
              .get(`ssrc.inquiryHall.view.message.floatingRatioDetail`)
              .d('报价幅度：最小价格幅度，下次报价至少符合此价格浮动范围！')}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}
          </Tooltip>
        ),
        dataIndex: 'quotationRange',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('quotationRange', {
                initialValue: val,
              })(
                <PrecisionInputNumber
                  min="0"
                  max="99999999999999999999"
                  currency={record.currencyCode}
                  style={{ width: '100%' }}
                  disabled={!record.$form.getFieldValue('floatType')}
                  formatter={(value) => this.handleQuotationRange(value, record)}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('demandDate', {
                initialValue: val && moment(val),
              })(<DatePicker format={getDateFormat()} placeholder="" style={{ width: '100%' }} />)}
            </Form.Item>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.startLadderLevel`).d('启用阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderInquiryFlag', {
                initialValue: val,
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        dataIndex: 'ladderOffer',
        width: 100,
        render: (val, record) =>
          record.$form.getFieldValue('ladderInquiryFlag') &&
          record.creationDate &&
          record.rfxLineItemId ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        dataIndex: 'prNum',
        width: 150,
        render: (val, record) => <a onClick={() => linktoPrNumDetail(record)}> {val}</a>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        dataIndex: 'prLineNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.RFxAttachment`).d('询价单附件'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('attachmentUuid', {
                initialValue: val,
              })(
                <Upload
                  filePreview
                  viewOnly={allowChangeItemsFlag}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-rfxitem"
                  attachmentUUID={val}
                  tenantId={organizationId}
                  fileSize={FIlESIZE}
                />
              )}
            </Form.Item>
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.filterSupplier`).d('筛选供应商'),
        dataIndex: 'action',
        width: 100,
        fixed: 'right',
        render: (_, record) =>
          record.rfxLineItemNum ? (
            <a onClick={() => this.onMainten(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.filterSupplier`).d('筛选')}
            </a>
          ) : (
            ''
          ),
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            style={{ paddingTop: '4px', cursor: 'pointer' }}
            onClick={startBatchMaintainItemLine}
          >
            {intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护')}
            <SVGIcon style={{ marginLeft: '4px' }} path={unExpand} />
          </span>
          <div className={styles['item-list-search']}>
            <Button
              color="primary"
              onClick={onCreateLine}
              disabled={allowChangeItemsFlag || !allowAddItems}
              icon="add"
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
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
              disabled={allowChangeItemsFlag || isEmpty(itemLineSelectedRowKeys)}
              icon="delete"
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </DisAbleButton>
            <DisAbleButton
              onClick={copyItemLine}
              loading={saveLoading}
              disabled={allowChangeItemsFlag || !allowAddItems || isEmpty(itemLineSelectedRowKeys)}
              icon="content_copy"
            >
              {intl.get('hzero.common.button.copy').d('复制')}
            </DisAbleButton>
            <DisAbleButton
              onClick={this.onSelectSupplier}
              disabled={
                !isEmpty(isDisabledSupplier) ||
                allowChangeItemsFlag ||
                isEmpty(itemLineSelectedRowKeys)
              }
            >
              {intl
                .get(`ssrc.inquiryHall.view.message.button.screeningSupplier`)
                .d('批量筛选供应商')}
            </DisAbleButton>
            <Button
              type="default"
              disabled={allowChangeItemsFlag || !allowAddItems}
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
            {
              code: 'SSRC.INQUIRY_HALL.EDIT_LINE',
            },
            <EditTable
              bordered
              rowKey="rfxLineItemId"
              custLoading={custLoading}
              loading={loading}
              columns={columns}
              rowSelection={itemLineRowSelection}
              scroll={{ x: scrollX }}
              dataSource={dataSource}
              pagination={pagination}
              onChange={(page) => onSearch(page)}
              onDataChange={this.hasChangeData}
              // onRow={(record) => {
              //   return {
              //     onClick: () => this.onRow(record),
              //   };
              // }}
            />
          )}
        </ModalProvider>
        {visible && <LadderLevelModal {...ladderLevelModalProps} />}
        {itemViewModalVisible && <SupplierRecord {...itemViewModalProps} />}
        {itemLineQuotationDetailModalVisible && (
          <ItemLineQutationDetailModal {...ItemLineQutationDetailProps} />
        )}
      </React.Fragment>
    );
  }
}
