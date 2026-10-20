import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { Table, Form, Badge, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined } from 'lodash';
import notification from 'utils/notification';

import { filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import OperateRecord from './OperateRecord';
import FilterForm from './FilterForm';
import ShareModal from './ShareModal';
import InfoModal from './InfoModal';

@Form.create({ fieldNameProp: null })
@connect(({ goodsShare, loading, ecCategoryCompanyCatalog }) => ({
  goodsShare,
  ecCategoryCompanyCatalog,
  loading: loading.effects['goodsShare/fetchShareGoodsList'],
  modalLoading: loading.effects['goodsShare/handleGoodsShare'],
  infoLoading: loading.effects['goodsShare/handleModalOk'],
}))
@withRouter
export default class ShareGoods extends PureComponent {
  form;

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      handleVisible: false, // 操作记录框是否显示
      productId: '',
      records: {},
      infoVisible: false, // 分享提示
      // modalRows: [],
    };
  }

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.tableForm = (ref.props || {}).form;
  }

  // // 模态框ref
  // @Bind()
  // modalRef(ref = {}) {
  //   this.form = (ref.props || {}).form;
  // }

  /**
   * 分享商品数据
   * @param {*} page 分页
   */
  @Bind()
  shareGoodsList(params = {}, falg = false) {
    const {
      dispatch,
      companyId,
      goodsShare: { sharePagination = {} },
    } = this.props;
    if (companyId) {
      const fieldsValue = isUndefined(this.tableForm)
        ? {}
        : filterNullValueObject(this.tableForm.getFieldsValue());
      dispatch({
        type: 'goodsShare/fetchShareGoodsList',
        payload: {
          companyId: params.companyId ? params.companyId : companyId,
          page: params || sharePagination,
          ...fieldsValue,
        },
      });
      if (falg) {
        dispatch({
          type: 'goodsShare/updateState',
          payload: {
            selectedRows: [],
            selectedKeys: [],
            rows: [],
          },
        });
      }
    } else {
      notification.info({
        message: intl.get('scec.goodsShare.view.message.chooseCompany').d('请选择当前公司'),
      });
    }
  }

  /**
   * 分享查询
   */
  @Bind()
  handleGoodsShare(record = {}) {
    const { onbatchShare } = this.props;
    this.setState(
      {
        records: record,
      },
      () => {
        const { records } = this.state;
        onbatchShare('', '', records);
      }
    );
  }

  /**
   * 分享模态框确定
   */
  shareModalOk = (page = {}) => {
    const {
      dispatch,
      goodsShare: { productIds, defaultSelect, totalList },
    } = this.props;
    const companyDTOS = totalList.map(item => {
      if (defaultSelect.includes(item.companyId)) {
        return { ...item, productIds, enableFlag: 1 };
      }
      return { ...item, productIds, enableFlag: 0 };
    });
    if (companyDTOS.length > 0) {
      dispatch({
        type: 'goodsShare/handleModalOk',
        payload: {
          companyDTOS,
          page,
        },
      }).then(res => {
        if (res) {
          if (res.content && res.content.length > 0) {
            this.shareModalCancel();
            this.setState({
              infoVisible: true,
            });
          }
          notification.success({ message: '分享操作成功' });
          this.shareGoodsList();
        }
      });
    }
  };

  // 分享取消
  shareModalCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'goodsShare/updateState',
      payload: {
        visible: false,
        defaultSelect: [],
        modalRows: [],
        totalList: [],
      },
    });
  };

  @Bind()
  infoModalCancel() {
    this.setState({
      infoVisible: false,
    });
  }

  /**
   * 分享选择的列表
   */
  @Bind()
  handleRowSelectChange(selectedKeys, selectedRows = []) {
    const {
      dispatch,
      goodsShare: { rows = [] },
    } = this.props;
    const newRows = [...rows];
    selectedRows.forEach((item, index) => {
      if (!newRows.map(row => row.productId).includes(item.productId)) {
        newRows.push(selectedRows[index]);
      }
    });
    const saveNewRows = newRows.filter(item => selectedKeys.includes(item.productId));
    dispatch({
      type: 'goodsShare/updateState',
      payload: {
        rows: saveNewRows,
        selectedKeys: saveNewRows.map(row => row.productId),
        selectedRows,
      },
    });
  }

  /**
   * 启用/禁用
   */
  @Bind()
  handleDisable(record) {
    const { enableFlag, productId } = record;
    const {
      dispatch,
      goodsShare: { rows, sharePagination, shareStatus },
    } = this.props;
    if (shareStatus === 1) {
      Modal.warning({
        title: intl.get(`scec.goodsShare.view.share`).d('集团共享中，请稍后'),
        zIndex: 10000,
      });
    } else {
      dispatch({
        type: 'goodsShare/changeState',
        payload: {
          enableFlag: enableFlag === 0 ? 1 : 0,
          productId,
        },
      }).then(() => {
        const newSelectedRows = rows.filter(item => item.productId !== record.productId);
        dispatch({
          type: 'goodsShare/updateState',
          payload: {
            rows: newSelectedRows,
            selectedKeys: newSelectedRows.map(row => row.productId),
          },
        });
        this.shareGoodsList(sharePagination);
      });
    }
  }

  /**
   * 打开操作记录
   */
  @Bind()
  openRecord(record = {}) {
    const { handleVisible } = this.state;
    this.setState({
      handleVisible: !handleVisible,
      productId: record.productId,
    });
  }

  /**
   * 商品详情
   */
  @Bind()
  handleToDetail(record = {}) {
    const { activeKey } = this.props;
    const router =
      record.productNum &&
      `/scec/goods-share/detail?productId=${record.productId}&activeKey=${activeKey}`;
    this.props.history.push(router);
  }

  @Bind()
  handleSelect(selecteKeys = [], selectedRows = []) {
    const {
      dispatch,
      goodsShare: { modalRows = [] },
    } = this.props;
    const newRows = [...modalRows];
    selectedRows.forEach((item, index) => {
      if (!selecteKeys.includes(item.companyId)) {
        newRows.push(selectedRows[index]);
      }
    });
    dispatch({
      type: 'goodsShare/updateState',
      payload: {
        defaultSelect: selecteKeys,
        modalRows: newRows,
      },
    });
  }

  render() {
    const { handleVisible, productId, records, infoVisible } = this.state;
    const {
      goodsShare: {
        visible,
        dataList,
        infoList,
        shareList,
        defaultSelect,
        infoPagination,
        sharePagination,
        modalPagination,
        selectedRows = [],
        selectedKeys = [],
      },
      dispatch,
      loading,
      companyId,
      infoLoading,
      modalLoading,
      onbatchShare,
    } = this.props;

    const columns = [
      {
        title: intl.get('scec.common.model.common.productNum').d('商品编码'),
        width: 100,
        dataIndex: 'productNum',
        render: (val, record) => {
          return <a onClick={() => this.handleToDetail(record)}>{val}</a>;
        },
      },
      {
        title: intl.get('scec.common.model.common.productName').d('商品名称'),
        width: 150,
        dataIndex: 'productName',
      },
      {
        title: intl.get('scec.common.model.common.supplier').d('供应商'),
        width: 100,
        dataIndex: 'supplierName',
      },
      {
        title: intl.get('scec.common.model.effectiveDays').d('有效天数'),
        width: 100,
        dataIndex: 'effectiveDays',
      },
      {
        title: intl.get('scec.common.model.common.bannerStatus').d('状态'),
        width: 100,
        dataIndex: 'enableFlag',
        render: (_, record) => (
          <Badge
            status={record.enableFlag ? 'success' : 'error'}
            text={
              record.enableFlag
                ? intl.get('hzero.common.status.enable').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')
            }
          />
        ),
      },
      {
        title: intl.get('scec.common.model.common.contactMail').d('操作'),
        width: 120,
        render: record => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleDisable(record)}>
                {record.enableFlag
                  ? intl.get('hzero.common.status.disable').d('禁用')
                  : intl.get('hzero.common.status.enable').d('启用')}
              </a>
              <a onClick={() => this.handleGoodsShare(record)} disabled={record.enableFlag === 0}>
                分享
              </a>
              <a onClick={() => this.openRecord(record)}>
                {intl.get('scec.common.button.operating').d('操作记录')}
              </a>
            </span>
          );
        },
      },
    ];
    const modalList = {
      dispatch,
      dataList,
      visible,
      records,
      companyId,
      onbatchShare,
      selectedRows,
      selectedKeys,
      infoLoading,
      modalLoading,
      defaultSelect,
      modalPagination,
      onRef: this.modalRef,
      onSelect: this.handleSelect,
      shareModalOk: this.shareModalOk,
      handleGoodsShare: this.handleGoodsShare,
      shareModalCancel: this.shareModalCancel,
    };
    const infoModalList = {
      infoList,
      infoLoading,
      infoVisible,
      infoPagination,
      shareModalOk: this.shareModalOk,
      infoModalCancel: this.infoModalCancel,
    };
    const filterList = {
      companyId,
      onRef: this.handleRef,
      shareGoodsList: this.shareGoodsList,
    };
    const rowSelection = {
      selectedRowKeys: selectedKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record.enableFlag === 0,
      }),
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <FilterForm {...filterList} />
        </div>
        <Table
          bordered
          rowKey="productId"
          loading={loading}
          columns={columns}
          dataSource={shareList}
          pagination={sharePagination}
          rowSelection={rowSelection}
          onChange={page => this.shareGoodsList(page)}
        />
        <ShareModal {...modalList} />
        <InfoModal {...infoModalList} />
        {handleVisible && (
          <OperateRecord
            productId={productId}
            modalVisible={handleVisible}
            onHandleOk={this.openRecord}
          />
        )}
      </React.Fragment>
    );
  }
}
