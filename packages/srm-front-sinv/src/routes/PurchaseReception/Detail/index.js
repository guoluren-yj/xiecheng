/**
 * index - 事务接收维护页面
 * @date: 2019-1-28
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Spin, Row, Col, Form, Input } from 'hzero-ui';
import { isArray, isEmpty, map, cloneDeep } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import Icons from 'components/Icons';
import { EDIT_FORM_ITEM_LAYOUT, DATETIME_MIN } from 'utils/constants';
import moment from 'moment';
import {
  getEditTableData,
  getCurrentUser,
  // getCurrentTenant,
  createPagination,
  getCurrentOrganizationId,
  // getDateFormat,
} from 'utils/utils';
// import { dateRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
// import Lov from 'components/Lov';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz';

import AddModal from './AddModal.js';
import styles from './index.less';
import List from './List';

/**
 * 采购订单接收维护界面
 * @export
 * @class Detail - 采购订单详情
 * @extends {Component} - React.Component
 * @reactProps {object} purchaseReception - 数据源
 * @reactProps {boolean} fetchDetailLoading - 加载页面数据
 * @reactProps {boolean} saveLoading - 接收过账
 * @reactProps {boolean} searchLoading - 查询请求
 * @reactProps {object} form - 表单对象
 * @reactProps {string[]} match.params.ids - 入口界面传来的数据行id
 * @returns React.element
 */
@withCustomize({
  unitCode: ['SINV.PURCHASE_RECEPTION_REVIEW.GRID', 'SINV.PURCHASE_RECEPTION_REVIEW.HEADER'],
})
@Form.create({
  fieldNameProp: null,
})
@connect(({ purchaseReception, loading }) => ({
  purchaseReception,
  fetchDetailLoading: loading.effects['purchaseReception/fetchDetailList'],
  deleteLoading: loading.effects['purchaseReception/deleteRecord'],
  saveLoading: loading.effects['purchaseReception/saveReception'],
  searchLoading: loading.effects['purchaseReception/fetchSearchList'],
}))
@formatterCollections({
  code: [
    'sinv.purchaseReception',
    'entity.roles',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'sinv.common',
    'sinv.purchaseReception',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventoryId: null,
      inventoryName: null,
      invOrganizationId: null,
      dataSource: [],
      pagination: {},
      selectedRows: [],
      selectedRecordURL: [],
      modalSelectedRows: [],
      modalRecordURL: [],
      initRecordURL: [],
      visible: false,
      operator: getCurrentUser().realName,
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.parseInfoParse();
    // this.handSearch();
  }

  /**
   * 解析送货单详情界面供应商信息
   * @param {boolean} needReParse -是否需要重新从url中解析信息
   */
  parseInfoParse(needReParse = true) {
    if (!needReParse) {
      this.handSearch();
      return;
    }
    const {
      location: { search },
    } = this.props;
    const paramsMap = new Map();
    decodeURIComponent(search)
      .slice(1)
      .split('&')
      .forEach((item) => {
        paramsMap.set(...item.split('='));
      });
    this.setState(
      {
        supplier: paramsMap.get('supplierName'),
      },
      () => {
        this.handSearch();
      }
    );
  }

  /**
   * 接收过账
   *
   * @memberof Detail
   */
  @Bind()
  handleReception() {
    const { dataSource } = this.state;
    const {
      dispatch,
      form: { validateFields },
      location: { search },
    } = this.props;
    const { receiveOrderType } = querystring.parse(search.substr(1));
    const params = getEditTableData(dataSource, ['edited']);
    const data = [];
    // let flag = true;
    this.forceUpdate();
    validateFields((err, values) => {
      if (!err && Array.isArray(params) && params.length > 0) {
        params.forEach((item) => {
          // if (item.thisTimeReceiveQuantity > item.canReceiveQuantity) {
          //   // flag = false;
          // } else
          if (receiveOrderType === 'ASN') {
            data.push({
              asnLineId: item.asnLineId,
              thisTimeReceiveQuantity: item.thisTimeReceiveQuantity,
              inventoryId: item.inventoryId,
              locationId: item.locationId,
              remark: item.remark,
              trxLineNum: item.trxLineNum,
              realityReceiveDate: item.realityReceiveDate
                ? moment(item.realityReceiveDate).format(DATETIME_MIN)
                : undefined,
            });
          } else {
            data.push({
              poLineLocationId: item.poLineLocationId,
              thisTimeReceiveQuantity: item.thisTimeReceiveQuantity,
              inventoryId: item.inventoryId,
              locationId: item.locationId,
              remark: item.remark,
              trxLineNum: item.trxLineNum,
              realityReceiveDate: item.realityReceiveDate
                ? moment(item.realityReceiveDate).format(DATETIME_MIN)
                : undefined,
            });
          }
        });
        // if (flag) {
        dispatch({
          type: 'purchaseReception/saveReception',
          payload: {
            data,
            receiveOrderType,
            receivedBy: values.receivedBy,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/sinv/purchase-reception/list`,
              })
            );
          }
        });
        // } else {
        //   notification.warning({
        //     message: intl
        //       .get(`sinv.purchaseReception.message.canNotReceiveMore`)
        //       .d('此次接受数量不能超出可接收数量'),
        //   });
        // }
      }
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    this.setState({
      visible: true,
    });
  }

  /**
   * 删除
   *
   * @memberof Detail
   */
  @Bind()
  handleDelete(record) {
    const {
      location: { search },
    } = this.props;
    const { receiveOrderType } = querystring.parse(search.substr(1));
    const { selectedRows, dataSource, pagination, initRecordURL, selectedRecordURL } = this.state; // initRecordURL原始数据的id selectedRecordURL新增数据的id
    let { total } = pagination;
    if (receiveOrderType === 'ASN') {
      if (selectedRows.length === dataSource.length) {
        notification.warning({
          message: intl
            .get(`sinv.common.view.message.write.off.line.mustHaveOne`)
            .d('禁止删除所有行，请至少保留一条数据'),
        });
      } else {
        const filtered = dataSource.reduce((prev, curr) => {
          if (!selectedRows.find((d) => d.asnLineId === curr.asnLineId)) {
            prev.push(curr);
          }
          return prev;
        }, []);
        const testList = map(filtered, (item = {}, index) => {
          const value = cloneDeep(item);
          if ((value.trxLineNum = index + 1)) {
            return {
              ...value,
              trxLineNum: index + 1,
            };
          } else {
            return value;
          }
        });
        total -= selectedRows.length;
        this.setState({
          dataSource: testList,
          pagination: {
            ...pagination,
            total,
          },
          selectedRows: [],
          initRecordURL: initRecordURL.filter((n) => !selectedRows.find((d) => d.asnLineId === n)),
          selectedRecordURL: selectedRecordURL.filter(
            (n) => !selectedRows.find((d) => d.asnLineId === n)
          ),
        });
      }
    } else if (isArray(dataSource) && dataSource.length <= 1) {
      notification.warning({
        message: intl
          .get(`sinv.common.view.message.write.off.line.mustHaveOne`)
          .d('禁止删除所有行，请至少保留一条数据'),
      });
    } else {
      const filtered = dataSource.filter(
        (item) => item.poLineLocationId !== record.poLineLocationId
      );
      // filtered.forEach((item, index) => {
      //   if ((item.trxLineNum = index + 1)) {
      //     return {
      //       ...item,
      //       trxLineNum: index + 1,
      //     };
      //   }
      // });
      const testList = map(filtered, (item = {}, index) => {
        const value = cloneDeep(item);
        if ((value.trxLineNum = index + 1)) {
          return {
            ...value,
            trxLineNum: index + 1,
          };
        } else {
          return value;
        }
      });
      const selectedRowKeys = dataSource.filter(
        (item) => item.poLineLocationId !== record.poLineLocationId
      );
      total -= 1;
      this.setState({
        dataSource: testList,
        pagination: {
          ...pagination,
          total,
        },
        selectedRows: [],
        initRecordURL: initRecordURL.filter((n) => !selectedRowKeys.includes(n.poLineLocationId)),
        // selectedRecordURL: selectedRecordURL.filter(
        //   n => !selectedRowKeys.includes(n.poLineLocationId)
        // ),
      });
    }
  }

  /**
   * 列表行选择变化
   *
   * @param {string[]} selectedRowKeys - 选择的列表行
   * @memberof Detail
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 新建弹窗确定
   *
   * @memberof Detail
   */
  @Bind()
  handleOkModal() {
    const {
      modalSelectedRows,
      selectedRecordURL: prevURL,
      modalRecordURL,
      dataSource,
    } = this.state;
    let newDataSource = [];
    if (modalSelectedRows.length === 0) {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    } else {
      if (modalSelectedRows.length === 1) {
        newDataSource = [
          ...dataSource,
          ...modalSelectedRows.map((i) => ({
            ...i,
            _status: 'create',
            trxLineNum: dataSource.length + 1,
          })),
        ];
      } else {
        const data = modalSelectedRows.map((n, index) => ({
          ...n,
          _status: 'create',
          trxLineNum: dataSource.length + index + 1,
        }));
        newDataSource = [...dataSource, ...data];
      }
      const { pagination } = this.state;

      const total = newDataSource.length;
      this.setState(
        () => ({
          selectedRecordURL: [...prevURL, ...modalRecordURL],
          dataSource: [...newDataSource],
          pagination: { ...pagination, total },
        }),
        () => {
          this.handleCancelModal();
        }
      );
    }
  }

  /**
   * 关闭新建弹窗
   *
   * @memberof Detail
   */
  @Bind()
  handleCancelModal() {
    this.setState({
      visible: false,
      modalSelectedRows: [],
      modalRecordURL: [],
    });
  }

  /**
   * 新建弹窗选择变化
   *
   * @param {string[]} selectedRowKeys - 选择的行的 key
   * @param {object[]} selectedRows - 选择的行数据
   * @memberof Detail
   */
  @Bind()
  onModalSelectChange(_, selectedRows) {
    const recordsURL = [];
    const deliveryTypeList = [];
    const vendorList = [];
    selectedRows.forEach((item) => {
      recordsURL.push(item.asnLineId);
      if (
        deliveryTypeList.length === 0 ||
        (deliveryTypeList.length > 0 && deliveryTypeList.includes(item.deliveryType))
      ) {
        deliveryTypeList.push(item.deliveryType);
      } else {
        notification.warning({
          message: intl
            .get(`sinv.purchaseReception.message.notSameType`)
            .d('请勾选同一类型送货单进行接收'),
        });
      }
      if (vendorList.length === 0 || (vendorList.length > 0 && vendorList.includes(item.vendor))) {
        vendorList.push(item.vendor);
      } else {
        notification.warning({
          message: intl
            .get(`sinv.purchaseReception.message.notSameSupplier`)
            .d('请勾选来自同一供应商的送货单进行接收'),
        });
      }
    });
    this.setState({
      modalSelectedRows: selectedRows,
      modalRecordURL: recordsURL,
    });
  }

  /**
   * 在弹窗中搜索
   *
   * @param {*} [fields={}]
   * @memberof Detail
   */
  @Bind()
  handleModalSearch(fields = {}) {
    const fieldsValue = JSON.parse(JSON.stringify(fields));
    // const { selectedRecordURL, initRecordURL, dataSource } = this.state;
    const { dataSource } = this.state;
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { receiveOrderType } = querystring.parse(search.substr(1));
    const listId =
      receiveOrderType === 'ASN'
        ? dataSource.map((item) => item.asnLineId)
        : dataSource.map((item) => item.poLineLocationId);
    const page = {
      size: fields.pageSize ? fields.pageSize : 10,
      page: fields.current ? fields.current - 1 : 0,
    };
    // const lineIds = [...initRecordURL, ...selectedRecordURL];
    dispatch({
      type: 'purchaseReception/fetchSearchList',
      payload: {
        ...fieldsValue,
        ...page,
        receiveOrderType,
        // asnLineIds: lineIds.length ? lineIds : 0,
        lineIds: listId.length ? listId : 0,
      },
    });
  }

  /**
   * 维护页面搜索
   * @param {object} page - 分页信息
   * @memberof Detail
   */
  @Bind()
  handSearch() {
    const { selectedRecordURL } = this.state;
    const {
      dispatch,
      match: {
        params: { ids },
      },
      location: { search },
    } = this.props;
    const { receiveOrderType } = querystring.parse(search.substr(1));
    const initURL = ids.split('&');
    dispatch({
      type: 'purchaseReception/fetchDetailList',
      payload: {
        lineIds: [...initURL, ...selectedRecordURL],
        page: -1,
        receiveOrderType,
        customizeUnitCode: 'SINV.PURCHASE_RECEPTION_REVIEW.GRID',
      },
    }).then((res) => {
      if (res) {
        const data = [];
        const pagination = createPagination(res);
        const { current = 0, pageSize = 10, showSizeChanger, showTotal, total } = pagination;
        res.content.forEach((n, i) => {
          data.push(
            Object.assign(n, {
              _status: 'update',
              trxLineNum: i + 1 + pageSize * (current - 1),
            })
          );
        });
        this.setState({
          dataSource: data,
          pagination: {
            current,
            pageSize,
            pageSizeOptions: ['10', '20', '50'],
            showSizeChanger,
            showTotal,
            total,
          },
          initRecordURL: initURL.map((n) => Number(n)),
        });
        this.handleCancelModal();
        if (data.length === 1) {
          this.handleInventoryName();
        }
      }
      // else {
      //   notification.error({  //TODO 产品测试要求删除此提示
      //     message: intl.get(`sinv.purchaseReception.message.addDataFailed`).d('新增数据失败'),
      //   });
      // }
    });
  }

  @Bind()
  handleInventoryName() {
    const { dispatch } = this.props;
    const { tenantId, dataSource = [] } = this.state;
    const organizationId = (dataSource.length && dataSource[0]?.invOrganizationId) || '';
    dispatch({
      type: 'purchaseReception/queryLov',
      payload: {
        lovCode: 'SODR.INVENTORY',
        tenantId,
        organizationId,
      },
    }).then((res) => {
      if (res && res?.content) {
        if (res.content.length === 1) {
          const newDate = dataSource.map((i) => {
            return {
              ...i,
              inventoryId: res.content[0].inventoryId || '',
              inventoryName: res.content[0].inventoryName || '',
            };
          });
          this.setState({ dataSource: newDate });
        }
      }
    });
  }

  /**
   * 批量维护
   */
  @Bind()
  handleMaintain() {
    const { dataSource = [], inventoryId, inventoryName, invOrganizationId } = this.state;
    const newDataSource = dataSource.map((item) => {
      if (invOrganizationId === item.invOrganizationId) {
        item.$form.setFieldsValue({ inventoryId, inventoryName });
        return {
          ...item,
          inventoryId,
          inventoryName,
          edited: true,
        };
      } else {
        return {
          ...item,
        };
      }
    });
    const edited = newDataSource.filter((n) => n.edited);
    if (edited.length === 0) {
      notification.warning({
        message: intl
          .get(`sinv.purchaseReception.message.resetInventoryName`)
          .d('库房对应收货组织不存在，请重新选择输入'),
      });
    }
    this.setState({ dataSource: newDataSource });
  }

  @Bind()
  inventChange(_val, record) {
    this.setState({
      inventoryId: record.inventoryId,
      inventoryName: record.inventoryName,
      invOrganizationId: record.invOrganizationId,
    });
  }

  render() {
    const {
      dataSource,
      // pagination,
      selectedRows,
      visible,
      modalSelectedRows,
      operator = '',
      supplier = '',
      tenantId,
    } = this.state;
    const {
      form,
      location: { search },
      customizeForm,
      customizeTable,
      fetchDetailLoading,
      deleteLoading,
      searchLoading,
      saveLoading,
      purchaseReception: { modalDataSource, modalPagination },
    } = this.props;
    const { receiveOrderType } = querystring.parse(search.substr(1));
    const { getFieldDecorator } = form;
    const rowSelection = {
      selectedRowKeys:
        receiveOrderType === 'ASN'
          ? selectedRows.map((n) => n.asnLineId)
          : selectedRows.map((n) => n.poLineLocationId),
      onChange: this.onSelectChange,
    };
    const tableProps = {
      tenantId,
      dataSource,
      // pagination,
      receiveOrderType,
      selectedRows,
      customizeTable,
      onRef: (node) => {
        this.list = node.props.form;
      },
      rowSelection: receiveOrderType === 'ASN' && rowSelection,
      handSearch: this.handSearch,
      handleDelete: this.handleDelete,
      handleCreate: this.handleCreate,
      handleMaintain: this.handleMaintain,
      inventChange: this.inventChange,
    };
    const modalProps = {
      form,
      visible,
      receiveOrderType,
      modalDataSource,
      modalPagination,
      loadModalData: this.handleLoadModalData,
      rowSelection: {
        selectedRowKeys:
          receiveOrderType === 'ASN'
            ? modalSelectedRows.map((n) => n.asnLineId)
            : modalSelectedRows.map((n) => n.poLineLocationId),
        onChange: this.onModalSelectChange,
      },
      onRef: (node) => {
        this.modalList = node;
      },
      loading: searchLoading,
      onCancel: this.handleCancelModal,
      onOk: this.handleOkModal,
      okLoading: fetchDetailLoading,
      onSearch: this.handleModalSearch,
    };
    return (
      <Fragment>
        <Header
          title={
            receiveOrderType === 'ASN'
              ? intl.get(`sinv.purchaseReception.message.detail.title`).d('接收送货单详情')
              : intl.get(`sinv.purchaseReception.message.detail.titleOrder`).d('接收订单详情')
          }
          backPath="/sinv/purchase-reception/list"
        >
          <Button
            loading={saveLoading}
            type="primary"
            onClick={this.handleReception}
            disabled={isArray(dataSource) && isEmpty(dataSource)}
          >
            <Icons
              type="main-receive"
              style={{
                marginRight: '8px',
              }}
            />
            {intl.get(`sinv.purchaseReception.message.reception`).d('接收过账')}
          </Button>
        </Header>
        <Content>
          <Spin
            wrapperClassName={styles['purchase-reception-detail']}
            spinning={fetchDetailLoading || saveLoading || deleteLoading || false}
          >
            {customizeForm(
              {
                form,
                // dataSource
                code: 'SINV.PURCHASE_RECEPTION_REVIEW.HEADER',
              },
              <Form>
                <Row gutter={48} className="inclusion-row">
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`entity.roles.operator`).d('操作人')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('operator')(<span>{operator}</span>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`sinv.common.model.common.actualOperator`).d('实际操作人')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('receivedBy', {
                        rules: [
                          {
                            max: 30,
                            message: intl.get('hzero.common.validation.max', { max: 30 }),
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`entity.supplier.tag`).d('供应商')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('supplier')(<span>{supplier}</span>)}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
            <List {...tableProps} />
          </Spin>
        </Content>
        <AddModal {...modalProps} />
      </Fragment>
    );
  }
}
