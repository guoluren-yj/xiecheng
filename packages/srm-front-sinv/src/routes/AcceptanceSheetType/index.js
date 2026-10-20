/*
 * index - 送货协同-送货单审批
 * @date: 2018/11/13 16:27:53
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import { createPagination } from 'utils/utils';
// import { isEmpty, isArray } from 'lodash';

import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import { getCurrentOrganizationId, createPagination } from 'utils/utils';
// import { DATETIME_MIN, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import Search from './Search';
import List from './List';
import MaintainModel from './MaintainModel';

@formatterCollections({
  code: ['sinv.acceptanceSheetType', 'sinv.acceptanceSheetCreate'],
})
@connect(({ loading, acceptanceSheetType }) => ({
  fetchListLoading: loading.effects['acceptanceSheetType/queryList'],
  acceptanceSheetType,
}))
export default class deliveryApproved extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      dataSource: [],
      pagination: {},
      maintainObj: {},
      updateFlag: false,
      tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   *
   * @param {object} ref - Search子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = (this.form && this.form.getFieldsValue()) || {};
    dispatch({
      type: 'acceptanceSheetType/queryList',
      payload: { page, ...filterValues },
    }).then((res) => {
      if (res) {
        this.setState({ dataSource: res.content || [], pagination: createPagination(res) });
      }
    });
  }

  @Bind()
  hideModal() {
    const { visible } = this.state;
    this.setState({ visible: !visible, updateFlag: false, maintainObj: {} });
  }

  @Bind()
  addItem(value) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'acceptanceSheetType/updateType',
      payload: {
        ...value,
        tenantId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.hideModal();
        this.handleSearch();
      }
    });
  }

  @Bind()
  updateState(record) {
    this.setState({
      maintainObj: record,
      updateFlag: true,
    });
  }

  @Bind()
  uploadSuccessFile(record, templateAttachmentUuid) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'acceptanceSheetType/saveUuid',
      payload: {
        tenantId,
        acceptListTypeId: record.acceptListTypeId,
        templateAttachmentUuid,
      },
    });
  }

  @Bind()
  handleUpdateRecord(record, templateAttachmentUuid) {
    const { dataSource } = this.state;
    if (record.templateAttachmentUuid === null) {
      const newDataSource = dataSource.map((item) => {
        if (item.acceptListTypeId === record.acceptListTypeId) {
          return {
            ...item,
            templateAttachmentUuid,
          };
        }
        return item;
      });
      this.setState(
        {
          dataSource: newDataSource,
        },
        () => {
          this.uploadSuccessFile(record, templateAttachmentUuid);
        }
      );
    }
  }

  render() {
    const {
      visible = false,
      dataSource = [],
      pagination = {},
      maintainObj = {},
      updateFlag,
    } = this.state;
    const { fetchListLoading } = this.props;
    const SearchProps = { onSearch: this.handleSearch, onRef: this.handleBindRef };
    const listProps = {
      dataSource,
      pagination,
      onSearch: this.handleSearch,
      hideModal: this.hideModal,
      updateState: this.updateState,
      loading: fetchListLoading,
      uploadSuccessFile: this.uploadSuccessFile,
      handleUpdateRecord: this.handleUpdateRecord,
    };
    const maintainProps = {
      visible,
      hideModal: this.hideModal,
      addItem: this.addItem,
      updateFlag,
      maintainObj,
    };

    return (
      <React.Fragment>
        <Header
          title={intl.get(`sinv.acceptanceSheetType.view.title.maintain`).d('验收单类型维护')}
        >
          <Button onClick={this.hideModal} icon="plus" type="primary">
            {intl.get(`sinv.acceptanceSheetType.button.create`).d('新建')}
          </Button>
        </Header>
        <Content>
          <Search {...SearchProps} />
          <List {...listProps} />
          {visible && <MaintainModel {...maintainProps} />}
        </Content>
      </React.Fragment>
    );
  }
}
