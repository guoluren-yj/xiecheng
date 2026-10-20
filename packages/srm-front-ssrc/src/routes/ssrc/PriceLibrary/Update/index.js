/**
 * Update - 价格库-手工创建&更新价格
 * @date: 2019-10-25
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Button, Modal, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined, filter, isNumber } from 'lodash';
import uuidv4 from 'uuid/v4';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';

import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getEditTableData,
  getCurrentUserId,
  addItemToPagination,
  delItemsToPagination,
} from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import notification from 'utils/notification';
import { SRM_SPC } from '_utils/config';
import { dateFormate } from '@/utils/utils';

import FilterForm from './FilterForm';
import LadderLevelModal from './LadderLevelModal';
import ItemInfoTable from './ItemInfoTable';
import ApprovalFilterForm from './ApprovalFilterForm';
import ApprovalInfoTable from './ApprovalInfoTable';
import PublishModal from './PublishModal';

@connect(({ priceLibrary, loading }) => ({
  priceLibrary,
  Loading: loading.effects['priceLibrary/fetchPriceLibDetail'],
  searchLoading: loading.effects['priceLibrary/fetchPriceChange'],
  saveLoading: loading.effects['priceLibrary/savePriceLib'],
  releaseLoading: loading.effects['priceLibrary/releasePriceLib'],
  deleteLoading: loading.effects['priceLibrary/deletePriceLine'],
  fetchLadderListLoading: loading.effects['priceLibrary/fetchLadderList'],
  saveLadderListLoading: loading.effects['priceLibrary/saveLadderList'],
  deleteLadderQuotLoading: loading.effects['priceLibrary/deleteLadderQuot'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
@formatterCollections({ code: ['ssrc.priceLibrary'] })
@withCustomize({
  unitCode: ['SSRC.PRICE_LIBRARY.EDIT'], // 保存接口未加个性化，神威接口二开
})
export default class Update extends Component {
  form;

  modalForm;

  approvalForm;

  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    this.state = {
      routerParams,
      pathFlag: true, // 判断是否是工作流路径
      selectedRows: [], // 物料价格信息维护选中行
      selectedRowKeys: [], // 物料价格信息维护选id
      ladderVisible: false, // 是否显示阶梯报价
      ladderListHeaderInfo: {}, // 物料价格头信息
      ladderLevelSelectedRowKeys: [], // 阶梯价格选中id
      ladderLevelSelectedRows: [], // 阶梯价格选中行
      publishModalVisible: false, // 发布弹窗是否可见
      onlyReadNotRedFlag: false, // 阶梯价格是否只读而且不标红
      setCurrentValueFlag: false, // 是否设置过单位
    };
  }

  componentDidMount() {
    const {
      priceLibrary: { itemPricePagination = {}, priceChangePagination = {} },
      dispatch,
      match = {},
    } = this.props;
    const pathFlag = match.path !== '/pub/ssrc/price-library/lib-update';
    this.setState({ pathFlag });
    this.handleSearch(itemPricePagination);
    this.handleSearchPriceChange(priceChangePagination);
    const lovCodes = {
      docStatusList: 'SSRC.PRICE_LIBRARY_DOC_STATUS',
      sourceTy: 'SSRC.INFO_TYPE', // 寻源类型
    };
    dispatch({
      type: 'priceLibrary/batchCode',
      payload: { lovCodes },
    });
    // 查询配置中心
    dispatch({
      type: 'priceLibrary/querySetting',
      payload: {
        '011113': '011113',
      },
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleApprovalFilterRef(ref = {}) {
    this.approvalForm = (ref.props || {}).form;
  }

  @Bind
  handleModelForm(ref = {}) {
    this.modalForm = (ref.props || {}).form;
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
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
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, organizationId } = this.props;
    const { routerParams = {} } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const values = {
      ...fieldValues,
      quotationExpiryDateFrom: dateFormate(fieldValues.quotationExpiryDateFrom, DATETIME_MIN),
      quotationExpiryDateTo: dateFormate(fieldValues.quotationExpiryDateTo, DATETIME_MAX),
    };
    dispatch({
      type: 'priceLibrary/fetchPriceLibDetail',
      payload: {
        page,
        ...values,
        organizationId,
        ids: routerParams.ids,
        wfpFlag: routerParams.wfpFlag, // 如果是工作流就传参
        customizeUnitCode: 'SSRC.PRICE_LIBRARY.EDIT',
      },
    });
  }

  /**
   * 换页，数据若发生变化执行保存
   * @param {*} page
   */
  @Bind
  handleTableChange(page = {}) {
    const { selectedRowKeys = [] } = this.state;
    const {
      dispatch,
      organizationId,
      priceLibrary: { itemPriceList = [] },
    } = this.props;
    const newParams = getEditTableData(itemPriceList, ['priceLibraryId', 'isNew']);
    if (!isEmpty(newParams)) {
      const newParameters = newParams.map((item) => {
        if (selectedRowKeys.includes(item.priceLibraryId)) {
          return {
            ...item,
            quotationExpiryDateFrom: dateFormate(item.quotationExpiryDateFrom, DATETIME_MIN),
            quotationExpiryDateTo: dateFormate(item.quotationExpiryDateTo, DATETIME_MIN),
            creationDate: dateFormate(item.creationDate, DATETIME_MIN),
            isSelected: 1,
          };
        } else {
          return {
            ...item,
            quotationExpiryDateFrom: dateFormate(item.quotationExpiryDateFrom, DATETIME_MIN),
            quotationExpiryDateTo: dateFormate(item.quotationExpiryDateTo, DATETIME_MIN),
            creationDate: dateFormate(item.creationDate, DATETIME_MIN),
          };
        }
      });
      dispatch({
        type: 'priceLibrary/savePriceLib',
        payload: { newParameters, organizationId },
      }).then((res) => {
        if (res) {
          const selectRows = [];
          res.forEach((item) => {
            if (item.isSelected && item.isSelected === 1) {
              selectRows.push(item.priceLibraryId);
            }
          });
          this.setState({
            selectedRowKeys: [...selectedRowKeys, ...selectRows],
          });
          this.handleSearch(page);
        }
      });
    } else {
      notification.warning({
        message: intl
          .get(`ssrc.priceLibrary.model.library.requiredMessage`)
          .d('数据填写不完整，请检查'),
      });
    }
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearchPriceChange(page = {}) {
    const { dispatch, organizationId } = this.props;
    const { routerParams = {} } = this.state;
    const fieldValues = isUndefined(this.approvalForm)
      ? {}
      : filterNullValueObject(this.approvalForm.getFieldsValue());
    let values = { ...fieldValues };
    values = {
      ...values,
      creationDateFrom: dateFormate(fieldValues.creationDateFrom, DATETIME_MIN),
      creationDateTo: dateFormate(fieldValues.creationDateTo, DATETIME_MAX),
    };

    dispatch({
      type: 'priceLibrary/fetchPriceChange',
      payload: {
        page,
        ...values,
        organizationId,
        ids: routerParams.ids,
        wfpFlag: routerParams.wfpFlag, // 如果是工作流就传参
      },
    });
  }

  /**
   * 物料价格信息-新增行
   */
  @Bind()
  createPriceLine() {
    const {
      dispatch,
      organizationId,
      priceLibrary: { itemPriceList = [], itemPricePagination = {} },
    } = this.props;
    dispatch({
      type: 'priceLibrary/updateState',
      payload: {
        itemPriceList: [
          {
            priceLibraryId: uuidv4(),
            adaptableFlag: 1,
            isNew: 1,
            companyId: undefined, // 公司
            tenantId: organizationId,
            ouId: undefined, // 业务实体
            invOrganizationId: undefined, // 库存组织
            itemId: undefined, // 物料编码
            itemCode: undefined, // 物料编码
            itemName: undefined, // 物品描述
            itemCategoryId: undefined, // 物品分类
            supplierCompanyId: undefined, // 供应商
            supplierCompanyNum: undefined, // 供应商编码
            supplierCompanyName: undefined, // 供应商名称
            unitPrice: undefined, // 单价
            ladderInquiryFlag: 0, // 启用阶梯价格
            uomId: undefined, // 单位
            uomName: undefined, // 单位
            taxId: undefined, // 税率
            taxRate: undefined, // 税率
            currencyCode: undefined, // 币种
            exchangeRate: undefined, // 汇率
            minPurchaseQuantity: undefined, // 最小采购量
            quotationExpiryDateFrom: undefined, // 有效期从
            quotationExpiryDateTo: undefined, // 有效期至
            creationDate: undefined, // 创建日期
            realName: undefined, // 创建人
            remark: undefined, // 备注
            purchaseAgentId: undefined, // 采购员
            _status: 'create',
          },
          ...itemPriceList,
        ],
        itemPricePagination: addItemToPagination(itemPriceList.length, itemPricePagination),
      },
    });
  }

  /**
   * 物料价格信息-保存
   */
  @Bind()
  savePriceLib() {
    const {
      dispatch,
      organizationId,
      priceLibrary: { itemPriceList = [], itemPricePagination = {} },
    } = this.props;
    const newParams = getEditTableData(itemPriceList, ['priceLibraryId', 'isNew']);

    if (!isEmpty(newParams)) {
      const newParameters = newParams.map((item) => {
        return {
          ...item,
          quotationExpiryDateFrom: dateFormate(item.quotationExpiryDateFrom, DATETIME_MIN),
          quotationExpiryDateTo: dateFormate(item.quotationExpiryDateTo, DATETIME_MIN),
          creationDate: dateFormate(item.creationDate, DATETIME_MIN),
        };
      });
      dispatch({
        type: 'priceLibrary/savePriceLib',
        payload: { newParameters, organizationId },
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({
            selectedRowKeys: [],
            selectedRows: [],
          });
          this.handleSearch(itemPricePagination);
        }
      });
    } else {
      notification.warning({
        message: intl
          .get(`ssrc.priceLibrary.model.library.requiredMessage`)
          .d('数据填写不完整，请检查'),
      });
    }
  }

  /**
   * 物料价格信息 - 批量删除
   */
  @Bind()
  deletePriceLine() {
    const {
      dispatch,
      organizationId,
      priceLibrary: { itemPriceList = [], itemPricePagination = {} },
    } = this.props;
    const { selectedRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(itemPriceList, (item) => {
      return selectedRowKeys.indexOf(item.priceLibraryId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newItemDetails = filter(itemPriceList, (item) => {
      return selectedRowKeys.indexOf(item.priceLibraryId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
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
              itemPriceList: newItemDetails,
              itemPricePagination: delItemsToPagination(
                newParameters.length,
                itemPriceList.length,
                itemPricePagination
              ),
            },
          });
          this.setState({ selectedRowKeys: [], selectedRows: [] });
        } else {
          dispatch({
            type: 'priceLibrary/deletePriceLine',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: 'priceLibrary/updateState',
                payload: {
                  itemPriceList: newItemDetails,
                  itemPricePagination: delItemsToPagination(
                    newParameters.length,
                    itemPriceList.length,
                    itemPricePagination
                  ),
                },
              });
              this.setState({ selectedRowKeys: [], selectedRows: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 发布前的判断逻辑
   */
  @Bind()
  publish(setting011113) {
    const { selectedRowKeys = [] } = this.state;
    const {
      priceLibrary: { itemPriceList = [] },
    } = this.props;
    if (selectedRowKeys.length === 0) {
      notification.warning({
        message: intl
          .get(`ssrc.priceLibrary.model.library.noSelectedRows`)
          .d('未选择发布行，无法发布!'),
      });
      return null;
    } else if (setting011113 === 'NONE') {
      this.releasePriceLib();
    } else {
      const newParams = getEditTableData(itemPriceList, ['priceLibraryId', 'isNew']);
      if (newParams && newParams.length > 0) {
        this.setState({
          publishModalVisible: true,
        });
      }
    }
  }

  /**
   * 物料价格信息-发布
   */
  @Bind()
  releasePriceLib() {
    const {
      dispatch,
      organizationId,
      priceLibrary: {
        itemPriceList = [],
        itemPricePagination = {},
        applicationDetailPagination = {},
      },
    } = this.props;
    const { selectedRowKeys = [] } = this.state;
    const newParams = getEditTableData(itemPriceList, ['priceLibraryId', 'isNew']);
    const selectRows = [];
    selectedRowKeys.forEach((item) => {
      if (isNumber(item) && item > 0) {
        selectRows.push(item);
      }
    });
    const modalValues = isUndefined(this.modalForm)
      ? {}
      : filterNullValueObject(this.modalForm.getFieldsValue());

    // 传给后端的数据处理逻辑：获取Table的所有数据，勾选的多传一个isSelected=1字段，没勾选的不传直接保存，勾选的发布
    if (!isEmpty(newParams)) {
      const newParameters = newParams.map((item) => {
        if (selectedRowKeys.includes(item.priceLibraryId) || item._status === 'create') {
          return {
            ...item,
            quotationExpiryDateFrom: dateFormate(item.quotationExpiryDateFrom, DATETIME_MIN),
            quotationExpiryDateTo: dateFormate(item.quotationExpiryDateTo, DATETIME_MIN),
            creationDate: dateFormate(item.creationDate, DATETIME_MIN),
            isSelected: 1,
          };
        } else {
          return {
            ...item,
            quotationExpiryDateFrom: dateFormate(item.quotationExpiryDateFrom, DATETIME_MIN),
            quotationExpiryDateTo: dateFormate(item.quotationExpiryDateTo, DATETIME_MIN),
            creationDate: dateFormate(item.creationDate, DATETIME_MIN),
          };
        }
      });
      dispatch({
        type: 'priceLibrary/releasePriceLib',
        payload: {
          organizationId,
          priceLibraries: newParameters,
          selectRows,
          ...modalValues,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ routerParams: {}, publishModalVisible: false });
          this.handleSearch(itemPricePagination);
          this.handleSearchPriceChange(applicationDetailPagination);
          if (!isEmpty(selectedRowKeys)) {
            this.setState({
              selectedRows: [],
              selectedRowKeys: [],
            });
          }
        }
      });
    } else {
      notification.warning({
        message: intl
          .get(`ssrc.priceLibrary.model.library.requiredMessage`)
          .d('数据填写不完整，请检查'),
      });
    }
  }

  /**
   * 点击当前阶梯价格，触发查询, 打开阶梯价格模态框
   * @param {Object} record -openLadder
   */
  @Bind()
  openLadder(record) {
    this.setState({ ladderVisible: true });
    if (record.priceLibraryStatus === 'APPROVALING') {
      this.setState({ onlyReadNotRedFlag: true });
    } else {
      this.setState({ onlyReadNotRedFlag: false });
    }
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'priceLibrary/fetchLadderList',
      payload: {
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
            cumulativeFlag: 0,
            _status: 'create',
          },
        ],
      },
    });
  }

  /**
   * 阶梯价格-保存
   */
  @Bind()
  saveLadderPrice(priceLibraryId = undefined) {
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
            type: 'priceLibrary/fetchLadderList',
            payload: { priceLibraryId, organizationId },
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
   * 改变公司 - 设置公司名称-清空业务实体-库存组织-物料编码-物品描述-单位-供应商
   */
  @Bind()
  changeCompanyId(val, dataList, record) {
    const { setCurrentValueFlag } = this.state;
    if (setCurrentValueFlag) {
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
    } else {
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
        currencyId: dataList.currencyId,
        currencyCode: dataList.currencyCode || 'CNY',
      });
    }
  }

  /**
   * 改变业务实体 - 清空库存组织-物料编码-物品描述-单位
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
   * 改变库存组织 - 清空物料编码-物品描述-单位
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
   * 改变物料编码-获取物品描述、单位
   */
  @Bind()
  changeItemId(val, dataList, record) {
    record.$form.setFieldsValue({
      itemId: dataList.partnerItemId,
      itemName: dataList.itemName,
      itemCode: dataList.itemCode,
      uomId: dataList.primaryUomId,
      uomName: dataList.uomName,
      specifications: dataList.specifications,
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
      taxId: dataList.taxId,
    });
  }

  /**
   * 改变币种-人民币时汇率为1.0000000
   */
  @Bind()
  changeCurrencyCode(value, dataList, record) {
    this.setState({
      setCurrentValueFlag: true,
    });
    if (value === 'CNY') {
      record.$form.setFieldsValue({ exchangeRate: 1.0 });
    } else {
      record.$form.setFieldsValue({ exchangeRate: undefined });
    }
  }

  @Bind()
  onChangeOrganization(value, dataList, record) {
    record.$form.setFieldsValue({
      purOrganizationCode: dataList.organizationCode,
      purOrganizationName: dataList.organizationName,
      purOrganizationId: dataList.purchaseOrgId,
    });
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 跳转到申请单详情
   * @param {*} record 行数据
   */
  @Bind()
  linkToDetail(record) {
    const { pathFlag } = this.state;
    if (!pathFlag) {
      this.props.history.push({
        pathname: `/pub/ssrc/price-library/detail/${record.priceLibraryDocId}`,
      });
    } else {
      this.props.history.push({
        pathname: `/ssrc/price-library/detail/${record.priceLibraryDocId}`,
      });
    }
  }

  @Bind()
  changeTab(activeKey) {
    const { dispatch } = this.props;
    dispatch({
      type: 'priceLibrary/updateState',
      payload: {
        activeKey,
      },
    });
  }

  @Bind()
  hidePublishModal() {
    this.setState({
      publishModalVisible: false,
    });
  }

  /**
   * 状态是否是审批中或者是审批中或者审批拒绝
   * @param {*} record
   * @param {*} isReject 是审批中或者审批拒绝的flag
   */
  @Bind()
  statusIsApprovaling(record, isReject) {
    if (isReject) {
      return (
        record.priceLibraryStatus === 'APPROVALING' ||
        record.priceLibraryStatus === 'APPROVAL_REJECTED'
      );
    } else {
      return record.priceLibraryStatus === 'APPROVALING';
    }
  }

  render() {
    const {
      Loading,
      saveLoading,
      deleteLoading,
      releaseLoading,
      fetchLadderListLoading,
      saveLadderListLoading,
      deleteLadderQuotLoading,
      searchLoading,
      userId,
      organizationId,
      customizeTable,
      priceLibrary: {
        itemPriceList = [],
        priceChangeList = [],
        priceChangePagination = {},
        itemPricePagination = {},
        ladderPriceList = [],
        code: { docStatusList = [], sourceTy = [] },
        settings = {},
        activeKey,
      },
    } = this.props;

    const setting011113 = settings['011113'] && settings['011113'].settingValue;
    const pubPriceList = itemPriceList.map((ele) => {
      return { ...ele, _status: '' };
    });
    const {
      pathFlag,
      selectedRows,
      selectedRowKeys,
      ladderVisible,
      onlyReadNotRedFlag,
      publishModalVisible,
      ladderListHeaderInfo = {},
      ladderLevelSelectedRowKeys = [],
      ladderLevelSelectedRows = [],
    } = this.state;
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({ disabled: record.priceLibraryStatus === 'APPROVALING' }),
    };
    const ladderLevelRowSelection = {
      selectedRows: ladderLevelSelectedRows,
      selectedRowKeys: ladderLevelSelectedRowKeys,
      onChange: this.handleLadderLevelRowSelectChange,
    };
    const filterProps = {
      // 物料价格信息维护form
      organizationId,
      selectedRowKeys,
      deleteLoading,
      onRef: this.handleRef,
      onCreatePriceLine: this.createPriceLine,
      onDeletePriceLine: this.deletePriceLine,
      onConditional: this.handleSearch,
    };
    // 阶梯报价
    const ladderRecordProps = {
      onlyReadNotRedFlag,
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
    };
    const publishModalProps = {
      visible: publishModalVisible,
      hideModal: this.hidePublishModal,
      releasePriceLib: this.releasePriceLib,
      onRef: this.handleModelForm,
      confirmLoading: releaseLoading,
    };

    const ItemInfoTableProps = {
      customizeTable,
      // 物料价格信息维护table
      organizationId,
      userId,
      pathFlag,
      scrollWidth: this.scrollWidth,
      pubPriceList,
      itemPriceList,
      itemPricePagination,
      Loading,
      rowSelection,
      statusIsApprovaling: this.statusIsApprovaling,
      handleSearch: this.handleTableChange,
      changeCompanyId: this.changeCompanyId,
      changeOuId: this.changeOuId,
      changePurOrganizationId: this.changePurOrganizationId,
      changeItemId: this.changeItemId,
      changeItemCategory: this.changeItemCategory,
      changeSupplierCompanyNum: this.changeSupplierCompanyNum,
      openLadder: this.openLadder,
      changeTaxId: this.changeTaxId,
      changeCurrencyCode: this.changeCurrencyCode,
      inquiryDetail: this.inquiryDetail,
      contractDetail: this.contractDetail,
      orderDetail: this.orderDetail,
      onChangeOrganization: this.onChangeOrganization,
      onDataChange: this.hasChangeData,
      sourceTy,
    };

    const approvalFilterProps = {
      // 价格库变更审批查询form
      organizationId,
      onRef: this.handleApprovalFilterRef,
      onConditional: this.handleSearchPriceChange,
      docStatusList,
    };
    const approvalInfoTableProps = {
      // 价格库变更审批查询table
      scrollWidth: this.scrollWidth,
      priceChangePagination,
      priceChangeList,
      Loading: searchLoading,
      handleSearch: this.handleSearchPriceChange,
      linkToDetail: this.linkToDetail,
    };

    return (
      <React.Fragment>
        {pathFlag ? (
          <Header
            backPath="/ssrc/price-library/list"
            title={intl
              .get(`ssrc.priceLibrary.view.message.title.itemPriceInfoMaint`)
              .d('物料价格信息维护')}
          >
            {activeKey === 'itemPriceInfoMaint' ? (
              <React.Fragment>
                <Button
                  icon="rocket"
                  type="primary"
                  onClick={() => this.publish(setting011113)}
                  loading={saveLoading || releaseLoading}
                  disabled={itemPriceList.length === 0 || selectedRows.length < 1}
                >
                  {intl.get('hzero.common.button.release').d('发布')}
                </Button>
                <Button
                  icon="save"
                  onClick={this.savePriceLib}
                  loading={saveLoading || releaseLoading}
                  disabled={itemPriceList.length === 0 || selectedRows.length < 1}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
              </React.Fragment>
            ) : (
              ''
            )}
          </Header>
        ) : (
          ''
        )}
        <Content>
          <Tabs activeKey={activeKey} onChange={this.changeTab} animated={false}>
            <Tabs.TabPane
              tab={intl
                .get(`ssrc.priceLibrary.view.message.title.itemPriceInfoMaint`)
                .d('物料价格信息维护')}
              key="itemPriceInfoMaint"
              forceRender
            >
              {pathFlag ? (
                <div style={{ marginBottom: '10px' }} className="table-list-search">
                  <FilterForm {...filterProps} />
                </div>
              ) : (
                ''
              )}
              <ItemInfoTable {...ItemInfoTableProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl
                .get(`ssrc.priceLibrary.view.message.tab.priceChangeApproval`)
                .d('价格库变更审批查询')}
              key="priceChangeApproval"
              forceRender
            >
              {pathFlag ? (
                <div style={{ marginBottom: '10px' }} className="table-list-search">
                  <ApprovalFilterForm {...approvalFilterProps} />
                </div>
              ) : (
                ''
              )}
              <ApprovalInfoTable {...approvalInfoTableProps} />
            </Tabs.TabPane>
          </Tabs>
        </Content>
        {ladderVisible && <LadderLevelModal {...ladderRecordProps} />}
        <PublishModal {...publishModalProps} />
      </React.Fragment>
    );
  }
}
