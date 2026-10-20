/**
 * Deatil - 价格库变更审批申请单详情页面
 * @date: 2020-2-13
 * @author: zhijian.li@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Button, Modal, InputNumber, DatePicker, Popover, Input } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';

import notification from 'utils/notification';
import moment from 'moment';
import { isEmpty, isUndefined, filter } from 'lodash';
import EditTable from 'components/EditTable';
import { dateRender } from 'utils/renderer';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getEditTableData,
  getCurrentUserId,
  getDateFormat,
} from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  // DEFAULT_DATE_FORMAT,
  DATETIME_MIN,
} from 'utils/constants';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { PRIVATE_BUCKET, SRM_SPC } from '_utils/config';

import { dateFormate } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import styles from '../index.less';
import PublishModal from '../PublishModal';
import LadderLevelModal from '../LadderLevelModal';

const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

@connect(({ priceLibrary, loading }) => ({
  organizationId: getCurrentOrganizationId(),
  priceLibrary,
  userId: getCurrentUserId(),
  Loading: loading.effects['priceLibrary/fetchDetailList'],
  saveLoading: loading.effects['priceLibrary/savePriceLibDetail'],
  releaseLoading: loading.effects['priceLibrary/releaseDetailInfo'],
  deleteLoading: loading.effects['priceLibrary/deleteDetailInfo'],
  fetchLadderListLoading: loading.effects['priceLibrary/fetchDetailLadderList'],
  saveLadderListLoading: loading.effects['priceLibrary/saveLadderList'],
  deleteLadderQuotLoading: loading.effects['priceLibrary/deleteLadderQuot'],
}))
@formatterCollections({ code: ['ssrc.priceLibrary'] })
@Form.create({ fieldNameProp: null })
export default class ApplicationDetail extends Component {
  constructor(props) {
    super(props);
    const { priceLibraryDocId } = this.props.match.params;
    this.state = {
      priceLibraryDocId,
      selectedRowKeys: [],
      selectedRows: [],
      publishModalVisible: false,
      ladderVisible: false,
      ladderListHeaderInfo: {},
      ladderLevelSelectedRowKeys: [], // 阶梯价格选中id
      ladderLevelSelectedRows: [], // 阶梯价格选中行
    };
  }

  modalForm; // modal框里面的form

  componentDidMount() {
    const {
      priceLibrary: { applicationDetailPagination = {} },
      match,
    } = this.props;
    const pathFlag = match.path !== '/pub/ssrc/price-library/detail/:priceLibraryDocId';
    this.fetchPriceChangeOrderDetail();
    this.fetchDetailList(applicationDetailPagination);
    this.setState({
      pathFlag,
    });
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 获取头信息
   */
  @Bind()
  fetchPriceChangeOrderDetail() {
    const { priceLibraryDocId } = this.state;
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'priceLibrary/fetchPriceChangeOrderDetail',
      payload: {
        organizationId,
        priceLibraryDocId,
      },
    });
  }

  /**
   * 获取行信息
   * @param {Object} page 分页参数
   */
  @Bind()
  fetchDetailList(page = {}) {
    const { priceLibraryDocId } = this.state;
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'priceLibrary/fetchDetailList',
      payload: {
        page,
        organizationId,
        priceLibraryDocId,
      },
    });
  }

  /**
   * 隐藏发布弹框
   */
  @Bind()
  hidePublishModal() {
    this.setState({
      publishModalVisible: false,
    });
  }

  /**
   * 获取modal框里面的this
   * @param {Component} ref
   */
  @Bind
  handleModelForm(ref = {}) {
    this.modalForm = (ref.props || {}).form;
  }

  /**
   * 点击选择框触发的事件
   * @param {*} selectedRowKeys 选择行的key
   * @param {*} selectedRows 选择行
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 改变公司 - 设置公司名称-清空业务实体-库存组织-物品编码-物品描述-单位-供应商
   */
  @Bind()
  changeCompanyId(val, dataList, record) {
    record.$form.setFieldsValue({
      companyName: dataList.companyName,
      ouId: undefined,
      ouName: undefined,
      invOrganizationId: undefined,
      invOrganizationName: undefined,
      itemId: undefined,
      itemName: undefined,
      itemCode: undefined,
      uomId: undefined,
      uomName: undefined,
      supplierCompanyId: undefined,
      supplierCompanyNum: undefined,
      supplierCompanyName: undefined,
    });
  }

  /**
   * 删除行信息
   */
  @Bind()
  deletePriceLine() {
    const {
      dispatch,
      organizationId,
      priceLibrary: { applicationDeatil = [], applicationDetailPagination = {} },
    } = this.props;
    const { selectedRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(applicationDeatil, (item) => {
      return selectedRowKeys.indexOf(item.priceLibraryId) >= 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        dispatch({
          type: 'priceLibrary/deleteDetailInfo',
          payload: { newParameters, organizationId },
        }).then((res) => {
          if (res) {
            notification.success();
            this.setState({ selectedRowKeys: [], selectedRows: [] });
            this.fetchDetailList(applicationDetailPagination);
            this.fetchPriceChangeOrderDetail();
          }
        });
      },
    });
  }

  /**
   * 保存详情信息
   */
  @Bind()
  saveDeatilInfo() {
    const {
      dispatch,
      organizationId,
      priceLibrary: { applicationDeatil = [], applicationDetailPagination = {}, header = {} },
    } = this.props;
    const { selectedRowKeys = [] } = this.state;
    const newParams = getEditTableData(applicationDeatil, ['priceLibraryId', 'isNew']);

    if (!isEmpty(newParams)) {
      const newParameters = newParams.map((item) => {
        return {
          ...item,
          quotationExpiryDateFrom: dateFormate(item.quotationExpiryDateFrom, DATETIME_MIN),
          quotationExpiryDateTo: dateFormate(item.quotationExpiryDateTo, DATETIME_MIN),
        };
      });
      const saveInfo = {
        ...header,
        priceLibraryDocLineList: newParameters,
      };
      dispatch({
        type: 'priceLibrary/savePriceLibDetail',
        payload: { saveInfo, organizationId },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchDetailList(applicationDetailPagination);
          this.fetchPriceChangeOrderDetail();
          if (!isEmpty(selectedRowKeys)) {
            this.setState({
              selectedRows: [],
              selectedRowKeys: [],
            });
          }
        }
      });
    }
  }

  /**
   * 模态框的发布确认
   */
  @Bind()
  publishConfirm() {
    const {
      priceLibrary: { applicationDeatil = [] },
    } = this.props;
    const newParams = getEditTableData(applicationDeatil, ['priceLibraryId', 'isNew']);
    if (newParams && newParams.length > 0) {
      this.setState({
        publishModalVisible: true,
      });
    }
  }

  /**
   * 发布
   */
  @Bind()
  publish() {
    const {
      dispatch,
      organizationId,
      priceLibrary: { applicationDeatil = [], applicationDetailPagination = {}, header = {} },
    } = this.props;
    const newParams = getEditTableData(applicationDeatil, ['priceLibraryId', 'isNew']);
    const modalValues = isUndefined(this.modalForm)
      ? {}
      : filterNullValueObject(this.modalForm.getFieldsValue());
    // 传给后端的数据处理逻辑：获取Table的所有数据，勾选的多传一个isSelected=1字段，没勾选的不传直接保存，勾选的发布
    if (!isEmpty(newParams)) {
      const newParameters = newParams.map((item) => {
        return {
          ...item,
          quotationExpiryDateFrom: dateFormate(item.quotationExpiryDateFrom, DATETIME_MIN),
          quotationExpiryDateTo: dateFormate(item.quotationExpiryDateTo, DATETIME_MIN),
          // creationDate: item.creationDate ? item.creationDate.format(DATETIME_MIN) : undefined,
        };
      });
      dispatch({
        type: 'priceLibrary/releaseDetailInfo',
        payload: {
          ...header,
          organizationId,
          priceLibraryDocLineList: newParameters,
          ...modalValues,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ publishModalVisible: false });
          this.fetchPriceChangeOrderDetail();
          this.fetchDetailList(applicationDetailPagination);
        }
      });
    }
  }

  /**
   * 改变业务实体 - 清空库存组织-物品编码-物品描述-单位
   */
  @Bind()
  changeOuId(val, dataList, record) {
    record.$form.setFieldsValue({
      ouName: dataList.ouName,
      invOrganizationId: undefined,
      invOrganizationName: undefined,
      itemId: undefined,
      itemName: undefined,
      itemCode: undefined,
      uomId: undefined,
      uomName: undefined,
    });
  }

  /**
   * 改变库存组织 - 清空物品编码-物品描述-单位
   */
  @Bind()
  changePurOrganizationId(val, dataList, record) {
    record.$form.setFieldsValue({
      invOrganizationName: dataList.organizationName,
      itemId: undefined,
      itemName: undefined,
      itemCode: undefined,
      uomId: undefined,
      uomName: undefined,
    });
  }

  /**
   * 改变物品编码-获取物品描述、单位
   */
  @Bind()
  changeItemId(val, dataList, record) {
    record.$form.setFieldsValue({
      itemId: dataList.partnerItemId,
      itemName: dataList.itemName,
      itemCode: dataList.itemCode,
      uomId: dataList.primaryUomId,
      uomName: dataList.uomName,
    });
  }

  /**
   * 改变物品分类
   *
   * @param {*} val
   * @param {*} dataList
   * @param {*} record
   */
  @Bind()
  changeItemCategory(val, dataList, record) {
    record.$form.setFieldsValue({
      itemCategoryId: val,
    });
  }

  /**
   * 改变供应商编码-获取供应商名称
   */
  @Bind()
  changeSupplierCompanyNum(value, dataList, record) {
    record.$form.setFieldsValue({
      supplierCompanyName: dataList.supplierCompanyName,
      supplierCompanyNum: dataList.supplierCompanyNum,
      supplierTenantId: dataList.supplierTenantId,
    });
  }

  /**
   * 改变税率-获取税率显示值
   */
  @Bind()
  changeTaxId(val, dataList, record) {
    record.$form.setFieldsValue({
      taxRate: dataList.taxRate,
    });
  }

  /**
   * 改变币种-人民币时汇率为1.0000000
   */
  @Bind()
  changeCurrencyCode(value, dataList, record) {
    if (value === 'CNY') {
      record.$form.setFieldsValue({ exchangeRate: 1.0 });
    } else {
      record.$form.setFieldsValue({ exchangeRate: undefined });
    }
  }

  @Bind()
  statusIsApprovalgReject() {
    const {
      priceLibrary: { header = {} },
    } = this.props;
    return header.docStatus !== 'APPROVAL_REJECTED';
  }

  /**
   * 点击当前阶梯价格，触发查询, 打开阶梯价格模态框
   * @param {Object} record -openLadder
   */
  @Bind()
  openLadder(record) {
    this.setState({ ladderVisible: true });
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'priceLibrary/fetchDetailLadderList',
      payload: {
        newPriceLibraryId: record.newPriceLibraryId,
        priceLibraryId: record.priceLibraryId,
        organizationId,
      },
    });
    this.setState({
      ladderListHeaderInfo: record,
    });
  }

  /**
   *  关闭阶梯价格模态框
   * @param {Object} record -hideLadder
   */
  @Bind()
  hideLadderRecord() {
    this.props.dispatch({
      type: 'priceLibrary/updateState',
      payload: {
        ladderPriceList: [], // 阶梯价格列表数据
      },
    });
    this.setState({ ladderVisible: false });
  }

  /**
   * 阶梯价格-保存
   */
  @Bind()
  saveLadderPrice(priceLibraryId = undefined, newPriceLibraryId = undefined) {
    const {
      dispatch,
      organizationId,
      priceLibrary: { ladderPriceList = [] },
    } = this.props;
    const { ladderLevelSelectedRowKeys = [] } = this.state;
    const newParams = getEditTableData(ladderPriceList, ['ladderPriceLibId']);
    if (!isEmpty(newParams)) {
      const params = newParams.map((item, index) => {
        return {
          ...item,
          ladderLineNum: index + 1,
        };
      });
      dispatch({
        type: 'priceLibrary/saveLadderList',
        payload: { params, organizationId },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'priceLibrary/fetchDetailLadderList',
            payload: { newPriceLibraryId, priceLibraryId, organizationId },
          });
          notification.success();
          if (!isEmpty(ladderLevelSelectedRowKeys)) {
            this.setState({
              ladderLevelSelectedRows: [],
              ladderLevelSelectedRowKeys: [],
            });
          }
        }
      });
    }
  }

  /**
   * 新建阶梯价格
   */
  @Bind()
  createLadderPrice(priceLibraryId = undefined) {
    const {
      dispatch,
      organizationId,
      priceLibrary: { ladderPriceList = [] },
    } = this.props;
    dispatch({
      type: 'priceLibrary/updateState',
      payload: {
        ladderPriceList: [
          ...ladderPriceList,
          {
            priceLibraryId,
            ladderPriceLibId: uuidv4(),
            ladderLineNum: undefined,
            ladderFrom: undefined,
            ladderTo: undefined,
            tenantId: organizationId,
            ladderPrice: undefined,
            ladderPriceRemark: undefined,
            _status: 'create',
          },
        ],
      },
    });
  }

  /**
   * 阶梯价格 - 批量删除
   */
  @Bind()
  deleteLadderQuot(priceLibraryId = undefined) {
    const {
      dispatch,
      organizationId,
      priceLibrary: { ladderPriceList = [] },
    } = this.props;
    const { ladderLevelSelectedRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(ladderPriceList, (item) => {
      return ladderLevelSelectedRowKeys.indexOf(item.ladderPriceLibId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newLadderLevel = filter(ladderPriceList, (item) => {
      return ladderLevelSelectedRowKeys.indexOf(item.ladderPriceLibId) < 0;
    });
    // 过滤出新增未保存数据
    const oldLadderLevelData = filter(ladderPriceList, (item) => {
      return item._status === 'update';
    });
    if (newParameters.length > 0 && newParameters[0].ladderLineNum < oldLadderLevelData.length) {
      notification.warning({
        message: intl
          .get(`ssrc.priceLibrary.model.library.onlySelectedLast`)
          .d('只能从最后一行已保存行开始删除!'),
      });
    } else {
      Modal.confirm({
        title: intl
          .get('ssrc.priceLibrary.model.library.confirmDeleteThisData')
          .d('确定删除该条数据?'),
        onOk: () => {
          const remoteDelete = [];
          const localDelete = [];
          newParameters.forEach((item) => {
            if (item._status === 'create') {
              localDelete.push(item);
            }
            if (item._status === 'update') {
              remoteDelete.push(item);
            }
          });
          if (isEmpty(remoteDelete)) {
            dispatch({
              type: 'priceLibrary/updateState',
              payload: {
                ladderPriceList: newLadderLevel,
              },
            });
            this.setState({ ladderLevelSelectedRowKeys: [], ladderLevelSelectedRows: [] });
          } else {
            dispatch({
              type: 'priceLibrary/deleteLadderQuot',
              payload: { remoteDelete, priceLibraryId, organizationId },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch({
                  type: 'priceLibrary/updateState',
                  payload: {
                    ladderPriceList: newLadderLevel,
                  },
                });
                this.setState({ ladderLevelSelectedRowKeys: [], ladderLevelSelectedRows: [] });
              }
            });
          }
        },
      });
    }
  }

  /**
   * 判断是否发生过改变
   * @param {*} newValue 更新后的数据
   * @param {*} oldValue 更新前的数据
   */
  @Bind()
  isChanged(newValue, oldValue) {
    return newValue !== oldValue;
  }

  /**
   * 阶梯价格-获取选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleLadderLevelRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      ladderLevelSelectedRowKeys: selectedRowKeys,
      ladderLevelSelectedRows: selectedRows,
    });
  }

  /**
   * 是否需要标红显示
   * @param {*} record 行数据
   * @param {*} displayVlaue 需要展示的数据
   * @param {*} popoverFlag 是否可显示老数据气泡
   * @param {*} newValue 现在的数据
   * @param {*} oldValue 上一次的数据
   * @param {*} ladderFlag 是否是阶梯报价
   */
  @Bind()
  returnRedValue(
    record,
    displayVlaue,
    popoverFlag = false,
    newValue = '',
    oldValue = '',
    ladderFlag = false
  ) {
    let style;
    let outPutContent;
    const beforeChangeValue = oldValue || '';
    if (popoverFlag) {
      style =
        this.isChanged(newValue, oldValue) || record.newPriceLibraryId === record.priceLibraryId
          ? { color: 'red' }
          : {};
      outPutContent =
        this.isChanged(newValue, oldValue) && record.newPriceLibraryId !== record.priceLibraryId ? (
          <Popover
            content={
              <div style={{ maxWidth: '300px' }}>
                {intl.get('ssrc.priceLibrary.model.library.beforeChange').d('修改前：') +
                  beforeChangeValue}
              </div>
            }
          >
            <span style={style}>{displayVlaue}</span>
          </Popover>
        ) : (
          <span style={style}>{displayVlaue}</span>
        );
    } else if (ladderFlag) {
      style = this.isChanged(newValue, oldValue) ? { color: 'red' } : {};
      outPutContent = <span style={style}>{displayVlaue}</span>;
    } else {
      style = record.newPriceLibraryId === record.priceLibraryId ? { color: 'red' } : {};
      outPutContent = <span style={style}>{displayVlaue}</span>;
    }
    return outPutContent;
  }

  /**
   * 跳转到寻源明细页面
   */
  @Bind()
  inquiryDetail(record) {
    const { dispatch } = this.props;
    const search = querystring.stringify({
      libFlag: 'priceLib', // 页面跳转标识，backpath标识
    });
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/query-rfq/rfx-detail/${record.sourceHeaderId}`,
        search,
      })
    );
  }

  /**
   * 跳转到合同明细页面
   */
  @Bind()
  contractDetail(record) {
    const { dispatch } = this.props;
    const { contractId } = record;
    const pcHeaderId = contractId;
    const libFlag = 'priceLib';
    dispatch(
      routerRedux.push({
        pathname: `${SRM_SPC}m/purchase-contract-view/detail`,
        search: pcHeaderId
          ? querystring.stringify({ pcHeaderId, libFlag })
          : querystring.stringify({}),
      })
    );
  }

  /**
   * 跳转到订单明细页面
   */
  @Bind()
  orderDetail(record) {
    const { dispatch } = this.props;
    const search = querystring.stringify({
      libFlag: 'priceLib', // 页面跳转标识，backpath标识
    });
    dispatch(
      routerRedux.push({
        pathname: `/sodr/order-release/detail/${record.orderId}`,
        search,
      })
    );
  }

  /**
   * 选择采购组织的回调
   * @param {*} value 当前值
   * @param {*} dataList lov列的值
   * @param {*} record 当前列
   */
  @Bind()
  onChangeOrganization(value, dataList, record) {
    record.$form.setFieldsValue({
      purOrganizationCode: dataList.organizationCode,
      purOrganizationName: dataList.organizationName,
      purOrganizationId: dataList.purchaseOrgId,
    });
  }

  render() {
    const {
      priceLibrary: {
        applicationDetailPagination = {},
        applicationDeatil = [],
        header = {},
        ladderPriceList = [],
      },
      Loading,
      saveLoading,
      releaseLoading,
      deleteLoading,
      organizationId,
      fetchLadderListLoading,
      saveLadderListLoading,
      deleteLadderQuotLoading,
      match = {},
    } = this.props;
    const {
      pathFlag,
      selectedRowKeys,
      publishModalVisible,
      selectedRows,
      ladderVisible,
      ladderListHeaderInfo = {},
      ladderLevelSelectedRowKeys = [],
      ladderLevelSelectedRows = [],
    } = this.state;

    const publishModalProps = {
      visible: publishModalVisible,
      hideModal: this.hidePublishModal,
      releasePriceLib: this.publish,
      onRef: this.handleModelForm,
      confirmLoading: releaseLoading,
      header,
    };

    const ladderLevelRowSelection = {
      selectedRows: ladderLevelSelectedRows,
      selectedRowKeys: ladderLevelSelectedRowKeys,
      onChange: this.handleLadderLevelRowSelectChange,
    };

    // 阶梯报价
    const ladderRecordProps = {
      ladderListHeaderInfo,
      organizationId,
      ladderLevelSelectedRowKeys,
      ladderLevelRowSelection,
      fetchLadderListLoading,
      saveLadderListLoading,
      deleteLadderQuotLoading,
      visible: ladderVisible,
      hideModal: this.hideLadderRecord,
      ladderLevelData: ladderPriceList,
      onSaveLadder: this.saveLadderPrice,
      onCreateLadder: this.createLadderPrice,
      onDeleteLadder: this.deleteLadderQuot,
      onlyReadFlag: this.statusIsApprovalgReject(),
      returnRedValue: this.returnRedValue,
    };

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: intl.get('ssrc.priceLibrary.model.library.status').d('状态'),
        dataIndex: 'docStatusMeaning',
        width: 100,
        render: (val, record) =>
          this.returnRedValue(
            record,
            record.newPriceLibraryId === record.priceLibraryId
              ? intl.get('hzero.common.button.create').d('新建')
              : intl.get('ssrc.priceLibrary.model.library.update').d('更新')
          ),
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyId',
        width: 150,
        render: (val, record) => this.returnRedValue(record, record.companyName),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
        render: (val, record) => this.returnRedValue(record, record.ouName),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.invOrganizationName`).d('库存组织名称'),
        dataIndex: 'invOrganizationId',
        width: 150,
        render: (val, record) => this.returnRedValue(record, record.invOrganizationName),
      },
      {
        title: intl
          .get('ssrc.priceLibrary.model.library.purchasingOrganizationCode')
          .d('采购组织编码'),
        dataIndex: 'purOrganizationCode',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('purOrganizationId', {
                initialValue: record.purOrganizationId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PURORG"
                  textValue={val}
                  lovOptions={{
                    displayField: 'organizationCode',
                  }}
                  onChange={(value, dataList) => this.onChangeOrganization(value, dataList, record)}
                />
                // {record.$form.getFieldDecorator('purOrganizationCode', {
                //   initialValue: record.purOrganizationCode,
                // })}
              )}
            </Form.Item>
          ) : (
            this.returnRedValue(
              record,
              record.purOrganizationCode,
              true,
              val,
              record.oldPurOrganizationCode
            )
          ),
      },
      {
        title: intl.get('ssrc.priceLibrary.model.library.purOrganization').d('采购组织名称'),
        dataIndex: 'purOrganizationName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('purOrganizationName', {
                initialValue: record.purOrganizationName,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            this.returnRedValue(
              record,
              record.purOrganizationName,
              true,
              val,
              record.oldPurOrganizationName
            )
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.buyer`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('purchaseAgentId', {
                initialValue: record.purchaseAgentId,
              })(<Lov code="SPFM.USER_AUTH.PURCHASE_AGENT" textValue={record.purchaseAgentName} />)}
            </Form.Item>
          ) : (
            this.returnRedValue(
              record,
              record.purchaseAgentName,
              true,
              val,
              record.oldPurchaseAgentName
            )
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.itemCode`).d('物料编码'),
        dataIndex: 'itemId',
        width: 150,
        render: (val, record) => this.returnRedValue(record, record.itemCode),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (val, record) => this.returnRedValue(record, val),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.itemCategoryName`).d('物料类别'),
        dataIndex: 'itemCategoryId',
        width: 150,
        render: (val, record) => this.returnRedValue(record, record.itemCategoryName),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.supplierCompanyNum`).d('供应商编码'),
        dataIndex: 'supplierCompanyId',
        width: 150,
        render: (val, record) => this.returnRedValue(record, record.supplierCompanyNum),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.supplierCompanyName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (val, record) => this.returnRedValue(record, val),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.taxPrice`).d('单价(含税)'),
        dataIndex: 'taxPrice',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxPrice', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.priceLibrary.model.library.taxPrice`).d('单价(含税)'),
                    }),
                  },
                ],
                initialValue: val,
              })(<InputNumber min={0} max="99999999999999999999" style={{ width: '100%' }} />)}
            </Form.Item>
          ) : (
            this.returnRedValue(record, numberSeparatorRender(val), true, val, record.oldtaxPrice)
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        dataIndex: 'unitPrice',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('unitPrice', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.netPrice`)
                        .d('单价(不含税)'),
                    }),
                  },
                ],
                initialValue: val,
              })(<InputNumber min={0} max="99999999999999999999" style={{ width: '100%' }} />)}
            </Form.Item>
          ) : (
            this.returnRedValue(record, numberSeparatorRender(val), true, val, record.oldUnitPrice)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ladderPrice`).d('阶梯价格'),
        dataIndex: 'ladderPrice',
        width: 100,
        render: (val, record) =>
          record.$form ? (
            record.ladderInquiryFlag === 1 && !record.isNew ? (
              <a
                onClick={() => this.openLadder(record)}
                style={
                  record.redFlag || record.newPriceLibraryId === record.priceLibraryId
                    ? { color: 'red' }
                    : {}
                }
              >
                {intl.get(`ssrc.priceLibrary.view.message.button.ladderLevel`).d('阶梯价格')}
              </a>
            ) : null
          ) : null,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.uomName`).d('单位'),
        dataIndex: 'uomId',
        width: 120,
        render: (val, record) => this.returnRedValue(record, record.uomName),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.biUomId`).d('双单位'),
        dataIndex: 'biUomId',
        width: 120,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('biUomId', {
                initialValue: value,
              })(
                <Lov
                  code="SMDM.ITEM.UOM.ORG"
                  queryParams={{ enabledFlag: 1 }}
                  textValue={record.biUomName || record.$form.getFieldValue('biUomName')}
                />
              )}
              {record.$form.getFieldDecorator('biUomName', { initialValue: record.biUomName })}
            </Form.Item>
          ) : (
            this.returnRedValue(record, record.biUomName, true, value, record.oldBiUomName)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.conversionRatio`).d('转换比例'),
        dataIndex: 'uomConversionRate',
        width: 120,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('uomConversionRate', {
                initialValue: value,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(val) => `1:${val}`}
                  parser={(val) => val.replace('1:', '')}
                  min={0}
                  precision={2}
                />
              )}
            </Form.Item>
          ) : (
            this.returnRedValue(
              record,
              <div> 1: {value}</div>,
              true,
              `1: ${value || ''}`,
              `1: ${record.oldUomConversionRate || ''}`
            )
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.priceQuantity`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        align: 'right',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('priceBatchQuantity', {
                initialValue: val || val === 0 ? val : 1,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.priceLibrary.model.library.priceQuantity`).d('价格批量'),
                    }),
                  },
                ],
              })(<InputNumber min={0} max="99999999999999999999" style={{ width: '100%' }} />)}
            </Form.Item>
          ) : (
            this.returnRedValue(
              record,
              record.priceBatchQuantity,
              true,
              val,
              record.oldUomConversionRate
            )
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.taxRate`).d('税率'),
        dataIndex: 'taxId',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('taxId', {
                  initialValue: val,
                })(
                  <Lov
                    code="SMDM.TAX"
                    textValue={record.taxRate}
                    onChange={(value, dataList) => this.changeTaxId(value, dataList, record)}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('taxRate', { initialValue: record.taxRate })(
                  <div />
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            this.returnRedValue(record, record.taxRate, true, val, record.oldTaxId)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currencyCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.priceLibrary.model.library.currencyCode`).d('币种'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <Lov
                  code="SMDM.EXCHANGE_RATE.CURRENCY"
                  textValue={record.currencyCode}
                  onChange={(value, dataList) => this.changeCurrencyCode(value, dataList, record)}
                />
              )}
            </Form.Item>
          ) : (
            this.returnRedValue(record, record.currencyCode, true, val, record.oldCurrencyCode)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.exchangeRate`).d('汇率'),
        dataIndex: 'exchangeRate',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('exchangeRate', {
                rules: [
                  {
                    required: record.$form.getFieldValue('currencyCode') !== 'CNY',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.priceLibrary.model.library.exchangeRate`).d('汇率'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <InputNumber
                  disabled={
                    record.$form.getFieldValue('currencyCode') === 'CNY' ||
                    this.statusIsApprovalgReject()
                  }
                  style={{ width: '100%' }}
                  precision={8}
                  min={0}
                  max={999999999999999}
                />
              )}
            </Form.Item>
          ) : (
            this.returnRedValue(record, val)
          ),
      },
      {
        title: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        dataIndex: 'specs',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('specifications', {
                initialValue: record.specs,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            this.returnRedValue(record, record.specs)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.minPackageQuantity`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('minPackageQuantity', {
                initialValue: val,
              })(<InputNumber style={{ width: '100%' }} min={0} max="99999999999999999999" />)}
            </Form.Item>
          ) : (
            this.returnRedValue(record, val, true, val, record.oldMinPackageQuantity)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.minPurchaseQuantity`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('minPurchaseQuantity', {
                initialValue: val,
              })(<InputNumber style={{ width: '100%' }} min={0} max="99999999999999999999" />)}
            </Form.Item>
          ) : (
            this.returnRedValue(record, val, true, val, record.oldMinPurchaseQuantity)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.infoType`).d('信息类型'),
        dataIndex: 'infoTypeMeaning',
        width: 150,
        render: (val, record) => this.returnRedValue(record, val),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.quotationExpiryDateFrom`).d('有效期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('quotationExpiryDateFrom', {
                initialValue: val && moment(val),
              })(
                <DatePicker
                  format={getDateFormat()}
                  placeholder={null}
                  style={{ width: '100%' }}
                  disabledDate={(currentDate) =>
                    record.$form.getFieldValue('quotationExpiryDateTo') &&
                    moment(record.$form.getFieldValue('quotationExpiryDateTo')).isBefore(
                      currentDate,
                      'day'
                    )
                  }
                />
              )}
            </Form.Item>
          ) : (
            this.returnRedValue(
              record,
              dateRender(val),
              true,
              val,
              record.oldQuotationExpiryDateFrom
            )
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.quotationExpiryDateTo`).d('有效期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('quotationExpiryDateTo', {
                initialValue: val && moment(val),
              })(
                <DatePicker
                  format={getDateFormat()}
                  placeholder={null}
                  style={{ width: '100%' }}
                  disabledDate={(currentDate) =>
                    record.$form.getFieldValue('quotationExpiryDateFrom') &&
                    moment(record.$form.getFieldValue('quotationExpiryDateFrom')).isAfter(
                      currentDate,
                      'day'
                    )
                  }
                />
              )}
            </Form.Item>
          ) : (
            this.returnRedValue(record, dateRender(val), true, val, record.oldQuotationExpiryDateTo)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.remark`).d('备注'),
        dataIndex: 'remark',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !this.statusIsApprovalgReject() ? (
            <Form.Item>
              {record.$form.getFieldDecorator('remark', {
                initialValue: val,
              })(<Input.TextArea min={0} rows={1} maxLength={100} />)}
            </Form.Item>
          ) : (
            this.returnRedValue(record, val, true, val, record.oldRemark)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.orderNum`).d('订单编号'),
        dataIndex: 'orderNum',
        width: 150,
        render: (val, record) =>
          pathFlag ? (
            <a
              style={record.newPriceLibraryId === record.priceLibraryId ? { color: 'red' } : {}}
              onClick={() => this.orderDetail(record)}
            >
              {val}
            </a>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.contractNum`).d('合同编号'),
        dataIndex: 'contractNum',
        width: 150,
        render: (val, record) =>
          pathFlag ? (
            <a
              style={record.newPriceLibraryId === record.priceLibraryId ? { color: 'red' } : {}}
              onClick={() => this.contractDetail(record)}
            >
              {val}
            </a>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.sourceNum`).d('寻源单号'),
        dataIndex: 'sourceNum',
        width: 150,
        render: (val, record) =>
          pathFlag ? (
            <a
              style={record.newPriceLibraryId === record.priceLibraryId ? { color: 'red' } : {}}
              onClick={() => this.inquiryDetail(record)}
            >
              {val}
            </a>
          ) : (
            val
          ),
      },
    ];
    const scrollWidthX = this.scrollWidth(columns, 120);
    return (
      <React.Fragment>
        {match.path !== '/pub/ssrc/price-library/detail/:priceLibraryDocId' ? (
          <Header
            backPath="/ssrc/price-library/lib-update"
            title={intl
              .get(`ssrc.priceLibrary.ssrc.priceLibrary.SearchDetail`)
              .d('价格库审批结果查询(明细)')}
          >
            {header.docStatus === 'APPROVAL_REJECTED' ? (
              <React.Fragment>
                <Button
                  icon="rocket"
                  type="primary"
                  onClick={this.publishConfirm}
                  loading={saveLoading || releaseLoading}
                  disabled={applicationDeatil.length === 0}
                >
                  {intl.get('hzero.common.button.release').d('发布')}
                </Button>
                <Button
                  icon="save"
                  onClick={this.saveDeatilInfo}
                  loading={saveLoading || releaseLoading}
                  disabled={applicationDeatil.length === 0}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
              </React.Fragment>
            ) : (
              ''
            )}{' '}
          </Header>
        ) : (
          ''
        )}

        <Content>
          <Form className="writable-row-custom">
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get('ssrc.priceLibrary.model.library.applyOrderNum').d('申请单号')}
                  value={header.docNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get('ssrc.priceLibrary.model.library.applicate').d('申请人')}
                  value={header.realName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get('ssrc.priceLibrary.model.library.createTime').d('创建时间')}
                  value={header.creationDate}
                />
              </Col>
            </Row>
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get('ssrc.priceLibrary.model.library.status').d('状态')}
                  value={header.docStatusMeaning}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl
                    .get('ssrc.priceLibrary.model.library.updateInstructions')
                    .d('更新说明')}
                  value={header.publishReason}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get('ssrc.priceLibrary.model.library.attachementFile').d('附件')}
                  value={
                    <Upload
                      viewOnly
                      filePreview
                      icon="download"
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-priceLibrary"
                      attachmentUUID={header.attachmentUuid || null}
                    />
                  }
                />
              </Col>
            </Row>
          </Form>
          {header.docStatus === 'APPROVAL_REJECTED' &&
          match.path !== '/pub/ssrc/price-library/detail/:priceLibraryDocId' ? (
            <Row>
              <Col span={24} className={styles['opreation-btn']}>
                <Form.Item>
                  <Button
                    key="delete"
                    style={{ margin: '0px 8px 0px 8px' }}
                    onClick={() => this.deletePriceLine()}
                    disabled={
                      selectedRowKeys.length === 0 && header.docStatus !== 'APPROVAL_REJECTED'
                    }
                    loading={deleteLoading}
                  >
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          ) : (
            ''
          )}

          <EditTable
            scroll={{ x: scrollWidthX }}
            dataSource={applicationDeatil}
            pagination={applicationDetailPagination}
            rowKey="priceLibraryId"
            loading={Loading}
            columns={columns}
            bordered
            onChange={(page) => this.fetchDetailList(page)}
            rowSelection={header.docStatus === 'APPROVAL_REJECTED' ? rowSelection : null}
          />
        </Content>
        <PublishModal {...publishModalProps} />
        {ladderVisible && <LadderLevelModal {...ladderRecordProps} />}
      </React.Fragment>
    );
  }
}
