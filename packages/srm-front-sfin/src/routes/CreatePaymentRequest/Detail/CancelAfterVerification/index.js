/**
 * index -预付款核销明细
 * @date: 2020-03-13
 * @author JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import { Icon, Collapse, Spin, Form, Button, Modal } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { getEditTableData, delItemsToPagination, addItemsToPagination } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import styles from './index.less';
import HeaderInfo from './HeaderInfo';
import ListTable from './ListTable';
import LineSelectModal from './LineSelectModal';

const { Panel } = Collapse;
const { confirm } = Modal;
const promptCode = 'sfin.payment';
const titlePrompt = 'sfin.payment.view.message.title';

@formatterCollections({
  code: [
    'sfin.payment',
    'sfin.advancePaymentRecord',
    'entity.attachment',
    'entity.tenant',
    'entity.company',
    'entity.business',
    'entity.supplier',
    'entity.roles',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ createPaymentRequest, loading }) => ({
  createPaymentRequest,
  fetchLoading: loading.effects['createPaymentRequest/queryCancelDetail'],
  fetchModalLoading: loading.effects['createPaymentRequest/fetchCancelModalList'],
  deleteLoading: loading.effects['createPaymentRequest/deleteLines'],
  cancelLoading: loading.effects['createPaymentRequest/cancelVerification'],
}))
export default class PayDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['header', 'list'], // 打开的折叠面板key
      visible: false, // Modal 是否可见
      selectedRows: [], // 详情页选中数据
      selectedModalRows: [], // Modal 选中数据
    };
  }

  /**
   * 页面初始化渲染
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'createPaymentRequest/init',
    });
    this.handleFetch();
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {string} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 响应核销按钮
   */
  @Bind()
  @Throttle(1000)
  handleCancelVerification() {
    const {
      dispatch,
      match: {
        params: { id },
      },
      createPaymentRequest: { cancelData },
    } = this.props;
    const { notCancelVerificationAmount } = cancelData;
    const { selectedRows } = this.state;
    const lineData = getEditTableData(selectedRows);
    if (!isEmpty(lineData)) {
      const totalAmout = lineData.map((item) => item.amount).reduce((a, b) => a + b);
      if (totalAmout > notCancelVerificationAmount) {
        notification.warning({
          message: intl
            .get(`${promptCode}.view.message.notification.totalAmoutExceeding`)
            .d('本次核销金额超过发票未核销金额，请修改本次核销金额'),
        });
      } else if (lineData.some((item) => item.amount > item.notCancelVerificationAmount)) {
        notification.warning({
          message: intl
            .get(`${promptCode}.view.message.notification.thisTimeAmoutExceeding`)
            .d('本次核销金额超过预付款未核销金额，请修改本次核销金额'),
        });
      } else {
        confirm({
          title: intl.get('hzero.common.message.confirm.save').d('是否确认核销？'),
          onOk: () => {
            dispatch({
              type: 'createPaymentRequest/cancelVerification',
              payload: {
                paymentLineId: id,
                body: lineData,
              },
            }).then((res) => {
              if (res) {
                notification.success();
                this.handleFetch();
                this.setState({
                  selectedRows: [],
                });
              }
            });
          },
        });
      }
    } else if (selectedRows.some((item) => item._status === 'create')) {
      notification.warning({
        message: intl
          .get(`${promptCode}.view.message.notification.completeInput`)
          .d('保存失败，请填写未填写项'),
      });
    } else {
      notification.warning({
        message: intl
          .get(`${promptCode}.view.message.notification.selectedRowsCanceled`)
          .d('所选行已核销，如需撤销核销或修改核销金额，请勾选删除，重新新建选择核销！'),
      });
    }
  }

  /**
   * 查询详情数据
   * @param {Object} page - 分页
   */
  @Bind()
  handleFetch(page = {}) {
    const {
      match: {
        params: { id },
      },
      dispatch,
    } = this.props;
    const flag = this.checkHasSelected();
    if (flag && Object.keys(page).length > 0) {
      // 核销行如果存在新建的且点击分页时，不能查询，避免出现分页错误
      return;
    }
    dispatch({
      type: 'createPaymentRequest/queryCancelDetail',
      payload: { paymentLineId: id, page },
    });
  }

  /**
   * 是否打开弹窗
   * @param {boolean} flag - 弹窗是否可见
   */
  @Bind()
  handleOpenModal(flag) {
    this.setState({
      visible: flag,
    });
  }

  /**
   * 查询弹窗数据
   * @param {Object} page - 分页
   */
  @Bind()
  handleFetchModalList(page = {}) {
    const {
      dispatch,
      createPaymentRequest: { cancelData },
      match: {
        params: { headerId },
      },
    } = this.props;
    const {
      currencyCode,
      tenantId,
      supplierId,
      supplierCompanyId,
      companyId,
      ouId,
      cancelVerificationVOList = [],
    } = cancelData;
    const filterValues = this.ModalForm ? this.ModalForm.getFieldsValue() : {};
    const { creationDateStart, creationDateEnd } = filterValues;
    const advanceLineIds = cancelVerificationVOList
      .filter((v) => v._status === 'create')
      .map((item) => {
        return item.advanceLineId;
      });
    dispatch({
      type: 'createPaymentRequest/fetchCancelModalList',
      payload: {
        page,
        tenantId,
        companyId,
        supplierId,
        supplierCompanyId,
        currencyCode,
        ouId,
        ...filterValues,
        creationDateStart: creationDateStart ? creationDateStart.format(DATETIME_MIN) : null,
        creationDateEnd: creationDateEnd ? creationDateEnd.format(DATETIME_MAX) : null,
        paymentHeaderId: headerId,
        advanceLineIds,
      },
    });
  }

  /**
   * 详情页选中行改变回调
   * @param {Array} selectedListRows
   * @param {Array} selectedRows
   */
  @Bind()
  handleSelectedRowChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 弹窗选中行改变回调
   * @param {Array} selectedListRows
   * @param {Array} selectedRows
   */
  @Bind()
  handleModalSelected(selectedRowKeys, selectedRows) {
    this.setState({
      selectedModalRows: selectedRows,
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { selectedRows } = this.state;
    const {
      dispatch,
      createPaymentRequest: { cancelData, cancelLinePage },
    } = this.props;
    const { cancelVerificationVOList = [] } = cancelData;
    const sendRows = selectedRows.filter((item) => item._status !== 'create');
    confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除？'),
      onOk: () => {
        const list = cancelVerificationVOList.filter((item) => !selectedRows.includes(item));
        dispatch({
          type: 'createPaymentRequest/deleteLines',
          payload: sendRows,
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch({
              type: 'createPaymentRequest/updateState',
              payload: {
                cancelData: {
                  ...cancelData,
                  cancelVerificationVOList: list,
                },
                cancelLinePage: delItemsToPagination(
                  selectedRows.length,
                  list.length,
                  cancelLinePage
                ),
              },
            });
            if (!isEmpty(sendRows)) {
              this.handleFetch();
            }
            this.setState({
              selectedRows: [],
            });
          }
        });
      },
    });
  }

  /**
   * 响应弹窗确认按钮
   */
  @Bind()
  onModalOk() {
    const { selectedModalRows } = this.state;
    const {
      dispatch,
      match: {
        params: { id },
      },
      createPaymentRequest: { cancelData, cancelLinePage },
    } = this.props;
    const { cancelVerificationVOList } = cancelData;
    const newModalRows = selectedModalRows.map((item) => ({
      ...item,
      _status: 'create',
      paymentLineId: id,
      amount: item.notCancelVerificationAmount,
    }));
    dispatch({
      type: 'createPaymentRequest/updateState',
      payload: {
        cancelData: {
          ...cancelData,
          cancelVerificationVOList: [...newModalRows, ...cancelVerificationVOList],
        },
        cancelLinePage: addItemsToPagination(
          newModalRows.length,
          cancelVerificationVOList.length,
          cancelLinePage
        ),
      },
    });
    this.setState({
      visible: false,
      selectedModalRows: [],
    });
  }

  // 检查付款行是否有新增的数据
  @Bind()
  checkHasSelected() {
    const {
      createPaymentRequest: { cancelData },
    } = this.props;
    const { cancelVerificationVOList = [] } = cancelData;
    return cancelVerificationVOList.some((item) => item._status === 'create');
  }

  /**
   * 渲染函数
   */
  render() {
    const { collapseKeys, visible, selectedRows, selectedModalRows } = this.state;
    const {
      fetchLoading,
      fetchModalLoading,
      deleteLoading,
      cancelLoading,
      createPaymentRequest: {
        enumMap: { paymentSourceType },
        cancelData,
        cancelLinePage,
        cancelModalList,
        cancelModalPage,
      },
      match: {
        params: { headerId },
      },
    } = this.props;
    const loading = fetchLoading || deleteLoading || cancelLoading;
    const { cancelVerificationVOList = [] } = cancelData;
    const LineSelectModalProps = {
      onRef: (node) => {
        this.ModalForm = (node.props || {}).form;
      },
      loading: fetchModalLoading,
      paymentSourceType,
      dataSource: cancelModalList,
      pagination: cancelModalPage,
      selectedRows: selectedModalRows,
      onSelectedRowChange: this.handleModalSelected,
      onFetchModalList: this.handleFetchModalList,
    };
    const flag = this.checkHasSelected();
    return (
      <Fragment>
        <Header
          title={intl.get(`${titlePrompt}.cancelVerificationDetail`).d('预付款核销明细')}
          backPath={`/sfin/create-payment-request/detail/${headerId}`}
        >
          <Button
            type="primary"
            icon="save"
            loading={loading}
            disabled={isEmpty(selectedRows)}
            onClick={this.handleCancelVerification}
          >
            {intl.get(`${promptCode}.view.button.cancelVerification`).d('核销')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
            <Collapse
              className={styles['form-collapse']}
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                forceRender
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>{intl.get(`${titlePrompt}.cancelHeaderInfo`).d('核销头信息')}</h3>
                    <a>
                      {collapseKeys.includes('header')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('header') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="header"
              >
                <HeaderInfo headerInfo={cancelData} loading={fetchLoading} />
              </Panel>
              <Panel
                forceRender
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>{intl.get(`${titlePrompt}.cancelLineInfo`).d('核销行信息')}</h3>
                    <a>
                      {collapseKeys.includes('list')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('list') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="list"
              >
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                  <Button
                    style={{ marginRight: 8 }}
                    loading={loading}
                    icon="delete"
                    onClick={this.handleDelete}
                    disabled={isEmpty(selectedRows)}
                  >
                    {intl.get(`hzero.common.button.delete`).d('删除')}
                  </Button>
                  <Button icon="plus" type="primary" onClick={() => this.handleOpenModal(true)}>
                    {intl.get(`hzero.common.button.create`).d('新建')}
                  </Button>
                </div>
                <ListTable
                  dataSource={cancelVerificationVOList}
                  pagination={{ ...cancelLinePage, showSizeChanger: !flag }}
                  onSearch={this.handleFetch}
                  loading={fetchLoading}
                  selectedRows={selectedRows}
                  onSelectedRowChange={this.handleSelectedRowChange}
                  className={flag ? 'sfin-pagination' : ''}
                />
              </Panel>
            </Collapse>
          </Spin>
          <Modal
            title={intl.get(`${titlePrompt}.addCancelVerificationLine`).d('选择核销行')}
            destroyOnClose
            width={1000}
            visible={visible}
            onCancel={() => this.handleOpenModal(false)}
            footer={
              <Button type="primary" onClick={this.onModalOk} disabled={isEmpty(selectedModalRows)}>
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>
            }
          >
            {visible && <LineSelectModal {...LineSelectModalProps} />}
          </Modal>
        </Content>
      </Fragment>
    );
  }
}
