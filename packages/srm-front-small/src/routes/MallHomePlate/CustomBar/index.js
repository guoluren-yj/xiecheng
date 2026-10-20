import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';
import { Modal as HModal } from 'hzero-ui';
import { Popover } from 'choerodon-ui';
import { DataSet, Table, Button, Dropdown, Menu, Icon, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import ImageViewer from '@/routes/Components/ImageViewer';
import {
  operatingBar,
  enableBarAction,
  sortCustomBar,
} from '@/services/mallHomePlateManageService';

import { barTableDS, historyDs, productListDs } from './customBarDs';

const proModalProps = {
  movable: false,
  closable: true,
  mask: true,
  destroyOnClose: true,
};

@withRouter
export default class CustomBar extends Component {
  tableDs = new DataSet(barTableDS());

  historyDs = new DataSet(historyDs());

  productListDs = new DataSet(productListDs());

  constructor(props) {
    super(props);
    this.state = {
      imgList: [],
      viewVisible: false,
    };
  }

  componentDidMount() {
    const { companyId } = this.props;
    this.fetchList(companyId);
  }

  componentWillReceiveProps(nextProps) {
    const { companyId } = this.props;
    if (nextProps.companyId !== companyId) {
      this.fetchList(nextProps.companyId);
    }
  }

  @Bind()
  fetchList(companyId) {
    this.tableDs.setQueryParameter('companyId', companyId);
    if (companyId) this.tableDs.query();
  }

  /**
   * 查看数据
   */
  @Bind()
  handleCheckData(record) {
    const { companyId } = this.props;
    const productListColumns = [
      {
        name: 'orderSeq',
        width: 80,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'productNum',
        width: 100,
      },
      {
        name: 'productName',
      },
      {
        name: 'shelfFlag',
        width: 90,
        renderer: ({ record: line }) => {
          const { shelfFlag, shelfErrorMessage } = line.toData();
          return shelfFlag === 1 ? (
            intl.get('small.common.model.shelves').d('上架')
          ) : (
            <Popover
              content={
                shelfErrorMessage || intl.get('small.common.model.manualRemoval').d('手动下架')
              }
            >
              {intl.get('small.common.model.unShelves').d('下架')}
            </Popover>
          );
        },
      },
    ];
    this.productListDs.setQueryParameter('queryParams', {
      barId: record.data.barId,
      companyId,
    });
    this.productListDs.query();
    Modal.open({
      ...proModalProps,
      footer: null,
      style: { width: 800 },
      afterClose: () => {
        this.productListDs.reset();
      },
      title: intl.get('small.customBar.view.watchProduct').d('查看商品'),
      children: <Table dataSet={this.productListDs} columns={productListColumns} />,
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreateBar() {
    const { companyId, history } = this.props;
    if (!companyId) {
      HModal.confirm({
        title: intl.get(`small.mallHomePlate.view.chooseCompany`).d('请选择公司！'),
        onOk: () => {},
      });
    } else {
      history.push(`/small/mall-home-plate/create-bar/${companyId}`);
    }
  }

  /**
   * 编辑-跳转明细
   */
  @Bind()
  handleToEdit(record) {
    const {
      companyId,
      history: { push },
    } = this.props;
    push(`/small/mall-home-plate/edit-bar/${companyId}/${record.data.barId}`);
  }

  @Bind()
  handlePreview(record) {
    const {
      companyId,
      history: { push },
    } = this.props;
    push(`/small/mall-home-plate/read-bar/${companyId}/${record.data.barId}`);
  }

  @Bind()
  async handleShelfAction(record = {}, action) {
    const {
      data: { barId },
    } = record;
    const result = getResponse(
      await operatingBar({
        idForShelf: barId,
        action,
      })
    );
    if (result && !result.failed) {
      this.tableDs.query();
    }
  }

  @Bind()
  async handleEnableAction(record) {
    const params = [
      {
        ...record,
        distributeStatus: record.enableFlag === null ? 1 : null,
        enableFlag: ['1', null].includes(record.enableFlag) ? 0 : 1, // nul是集团未分配公司，但是状态属于启用
        objectVersionNumber: record.distributeObjVersionNum,
        companyId: this.props.companyId,
      },
    ];
    const res = await enableBarAction(params);
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.tableDs.query();
    }
  }

  @Bind()
  handleOpenHistory(barId) {
    const historyColumns = [
      { name: 'operatedByName' },
      { name: 'operatedDate' },
      { name: 'operationName' },
      { name: 'operatedRemark' },
    ];
    this.historyDs.setQueryParameter('barId', barId);
    this.historyDs.query();
    Modal.open({
      ...proModalProps,
      footer: null,
      style: { width: 800 },
      afterClose: () => {
        this.historyDs.reset();
      },
      title: intl.get('small.common.view.operateRecord').d('操作记录'),
      children: <Table dataSet={this.historyDs} columns={historyColumns} />,
    });
  }

  @Bind()
  handleDel(record) {
    this.tableDs.delete([record]);
  }

  @Bind()
  handleViewImg(imagePath) {
    this.setState({
      viewVisible: true,
      imgList: [{ fileUrl: imagePath }],
    });
  }

  /**
   * 渲染编辑列
   */
  @Bind()
  renderOptions({ record }) {
    let operate = '';
    const menu = (
      <Menu>
        <Menu.Item>
          <a
            disabled={record.data.barStatus === '1' || record.data.barSourceType === '0'}
            onClick={() => this.handleToEdit(record)}
          >
            {intl.get('hzero.common.model.edit').d('编辑')}
          </a>
        </Menu.Item>
        {record.data.barStatus !== '1' && record.data.barSourceType === '1' && (
          <Menu.Item>
            <a onClick={() => this.handleDel(record)}>
              {intl.get('hzero.common.btn.delete').d('删除')}
            </a>
          </Menu.Item>
        )}
        <Menu.Item>
          <a onClick={() => this.handleOpenHistory(record.data.barId)}>
            {intl.get('small.common.model.operateRecord').d('操作记录')}
          </a>
        </Menu.Item>
      </Menu>
    );

    operate = (
      <span className="action-link">
        {record.get('barSourceType') !== '0' && (
          <a
            onClick={() => this.handleShelfAction(record, record.get('barStatus') === '1' ? 0 : 1)}
          >
            {record.get('barStatus') === '1'
              ? intl.get('small.common.model.unShelves').d('下架')
              : intl.get('small.common.model.shelves').d('上架')}
          </a>
        )}
        {record.data.barSourceType === '0' && (
          <a onClick={() => this.handleEnableAction(record.data)}>
            {['1', null].includes(record.data.enableFlag)
              ? intl.get(`small.mallHomePlate.model.customBar.enable`).d('禁用')
              : intl.get(`small.mallHomePlate.model.customBar.disable`).d('启用')}
          </a>
        )}
        <a
          disabled={record.get('barType') !== 'IMAGE'}
          onClick={() => this.handleViewImg(record.get('imagePath'))}
        >
          {intl.get('small.common.model.preview').d('预览')}
        </a>
        <Dropdown overlay={menu}>
          <a>
            {intl.get('small.common.view.button.more').d('更多操作')}
            <Icon type="arrow_drop_down" />
          </a>
        </Dropdown>
      </span>
    );
    return operate;
  }

  addButton = (
    <Button icon="add" key="add" onClick={this.handleCreateBar}>
      {intl.get('hzero.common.button.create').d('新增')}
    </Button>
  );

  /**
   * 拖拽排序
   */
  @Bind()
  async handleDragEnd() {
    const data = this.tableDs.toData();
    const { currentPage, totalCount, pageSize } = this.tableDs;
    const params = {
      pageSize,
      customBarList: data,
      totalNum: totalCount,
      pageNum: currentPage,
    };
    const res = await sortCustomBar(params);
    getResponse(res);
    this.tableDs.query(this.tableDs.currentPage);
  }

  @Bind()
  onDragEndBefore(dataSet, columns, resultDrag) {
    const data = this.tableDs.toData();
    const {
      source: { index },
    } = resultDrag;
    if (data[index].barSourceType === '0') {
      return false;
    } else {
      return true;
    }
  }

  render() {
    const { viewVisible, imgList } = this.state;
    const barColumns = [
      {
        name: 'barName',
        minWidth: 250,
        lock: 'left',
        renderer: ({ text, record }) => <a onClick={() => this.handlePreview(record)}>{text}</a>,
      },
      {
        name: 'orderSeq',
        width: 80,
      },
      {
        name: 'mallBarName',
        width: 170,
      },
      {
        name: 'barTypeName',
        width: 120,
      },
      {
        name: 'barSourceTypeName',
        width: 120,
      },
      {
        name: 'startDate',
        width: 150,
      },
      {
        name: 'endDate',
        width: 150,
      },
      {
        name: 'barStatusName',
        width: 80,
      },
      {
        name: 'option',
        width: 200,
        lock: 'right',
        renderer: this.renderOptions,
      },
      {
        name: 'productList',
        width: 100,
        lock: 'right',
        renderer: ({ record }) => (
          <a
            disabled={record.data.barType === 'CHANNEL'}
            onClick={() => this.handleCheckData(record)}
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
    ];
    const buttons = [this.addButton, 'delete'];
    return (
      <React.Fragment>
        <Table
          key="barId"
          rowDraggable
          pristine
          border={null}
          buttons={buttons}
          queryFieldsLimit={3}
          columns={barColumns}
          dataSet={this.tableDs}
          onDragEnd={this.handleDragEnd}
          onDragEndBefore={this.onDragEndBefore}
        />
        {viewVisible && (
          <ImageViewer
            imgList={imgList}
            closeModal={() => this.setState({ viewVisible: false, imgList: [] })}
          />
        )}
      </React.Fragment>
    );
  }
}
