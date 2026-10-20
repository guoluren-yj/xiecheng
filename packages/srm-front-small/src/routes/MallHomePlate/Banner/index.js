/**
 * CompanyBanner - 公司Banner管理
 * @date: 2019-2-26
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal as HModal } from 'hzero-ui';
import { DataSet, Table, Button, Dropdown, Menu, Icon, Modal } from 'choerodon-ui/pro';

import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { comBannerDS, historyDs } from './bannerDS';
import {
  sortBanner,
  operatingBanner,
  enableBannerAction,
} from '@/services/mallHomePlateManageService';
import ImageViewer from '@/routes/Components/ImageViewer';

const proModalProps = {
  movable: false,
  closable: true,
  mask: true,
  destroyOnClose: true,
};

@withRouter
export default class CompanyBanner extends Component {
  state = {
    imgList: [],
    viewVisible: false,
  };

  comBannerDS = new DataSet(comBannerDS());

  historyDs = new DataSet(historyDs());

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
    this.comBannerDS.setQueryParameter('companyId', companyId);
    if (companyId) this.comBannerDS.query();
  }

  /**
   * 新建-公司Banner
   */
  @Bind()
  handleCreate() {
    const {
      companyId,
      history: { push },
    } = this.props;
    if (!companyId) {
      HModal.confirm({
        title: intl.get(`small.mallHomePlate.view.chooseCompany`).d('请选择公司！'),
        onOk: () => {},
      });
    } else {
      push(`/small/mall-home-plate/create-banner/${companyId}`);
    }
  }

  /**
   * 编辑-跳转明细
   */
  @Bind()
  handleEdit(record) {
    const { data } = record;
    const {
      companyId,
      history: { push },
    } = this.props;
    push(`/small/mall-home-plate/edit-banner/${companyId}/${data.bannerId}`);
  }

  /**
   * 上架/下架Banner
   */
  @Bind()
  async handleShelfAction(action, bannerId) {
    const params = {
      idForShelf: bannerId,
      action,
    };
    const res = await operatingBanner(params);
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.comBannerDS.query();
    }
  }

  /**
   * 启用/禁用操作
   * @param {行记录} record
   */
  @Bind()
  async handleEnableAction(record) {
    const params = [
      {
        ...record,
        enableFlag: record.enableFlag === '1' ? 0 : 1,
        objectVersionNumber: record.distributeObjVersionNum,
        companyId: record.distributeCompanyId,
      },
    ];
    const res = await enableBannerAction(params);
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.comBannerDS.query();
    }
  }

  /**
   * 历史纪录
   */
  @Bind()
  handleOpenHistory(bannerId) {
    const historyColumns = [
      { name: 'operatedByName' },
      { name: 'operatedDate' },
      { name: 'operationName' },
      { name: 'operatedRemark' },
    ];
    this.historyDs.setQueryParameter('bannerId', bannerId);
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
  handlePreview(record) {
    const {
      companyId,
      history: { push },
    } = this.props;
    push(`/small/mall-home-plate/read-banner/${companyId}/${record.data.bannerId}`);
  }

  @Bind()
  handleDel(record) {
    this.comBannerDS.delete([record]);
  }

  addButton = (
    <Button icon="add" key="add" onClick={this.handleCreate}>
      {intl.get('hzero.common.button.create').d('新增')}
    </Button>
  );

  @Bind()
  renderOptions({ record }) {
    let operate = '';
    const menu = (
      <Menu>
        {record.data.bannerStatus !== '1' && (
          <Menu.Item>
            <a onClick={() => this.handleEdit(record)}>
              {intl.get('hzero.common.model.edit').d('编辑')}
            </a>
          </Menu.Item>
        )}
        {record.data.bannerStatus !== '1' && (
          <Menu.Item>
            <a onClick={() => this.handleDel(record)}>
              {intl.get('hzero.common.btn.delete').d('删除')}
            </a>
          </Menu.Item>
        )}
        <Menu.Item>
          <a onClick={() => this.handleOpenHistory(record.data.bannerId)}>
            {intl.get('small.common.model.operateRecord').d('操作记录')}
          </a>
        </Menu.Item>
      </Menu>
    );

    operate = (
      <span className="action-link">
        {record.get('bannerSourceType') !== '0' && (
          <a
            onClick={() =>
              this.handleShelfAction(
                record.get('bannerStatus') === '1' ? 0 : 1,
                record.data.bannerId
              )
            }
          >
            {record.get('bannerStatus') === '1'
              ? intl.get('small.common.model.unShelves').d('下架')
              : intl.get('small.common.model.shelves').d('上架')}
          </a>
        )}
        {record.get('bannerSourceType') === '0' && (
          <a onClick={() => this.handleEnableAction(record.data)}>
            {record.get('enableFlag') === '1'
              ? intl.get('small.common.button.disable').d('停用')
              : intl.get(`small.common.button.enable`).d('启用')}
          </a>
        )}
        <a onClick={() => this.handleViewImg(record.get('imagePath'))}>
          {intl.get('small.common.model.preview').d('预览')}
        </a>
        <Dropdown overlay={menu}>
          <a>
            {intl.get('small.common.model.options.more').d('更多操作')}
            <Icon type="arrow_drop_down" />
          </a>
        </Dropdown>
      </span>
    );
    return operate;
  }

  @Bind()
  handleViewImg(imagePath) {
    this.setState({
      viewVisible: true,
      imgList: [{ fileUrl: imagePath }],
    });
  }

  @Bind()
  async handleDragEnd() {
    const data = this.comBannerDS.toData();
    const res = await sortBanner(data);
    getResponse(res);
    this.comBannerDS.query(this.comBannerDS.currentPage);
  }

  render() {
    const bannerColumns = [
      {
        name: 'bannerName',
        minWidth: 200,
        renderer: ({ text, record }) => <a onClick={() => this.handlePreview(record)}>{text}</a>,
      },
      {
        name: 'bannerTypeName',
        width: 110,
      },
      {
        name: 'bannerSourceTypeName',
        width: 110,
      },
      {
        name: 'startDate',
        width: 160,
      },
      {
        name: 'endDate',
        width: 160,
      },
      {
        name: 'bannerStatusName',
        width: 80,
      },
      {
        name: 'edit',
        width: 200,
        renderer: this.renderOptions,
      },
    ];
    const buttons = [this.addButton, 'delete'];
    const { viewVisible, imgList } = this.state;
    return (
      <React.Fragment>
        <Table
          key="bannerId"
          rowDraggable
          pristine
          queryFieldsLimit={3}
          dataSet={this.comBannerDS}
          buttons={buttons}
          columns={bannerColumns}
          onDragEnd={this.handleDragEnd}
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
