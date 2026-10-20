/**
 * index.js - 总账科目定义
 * @date: 2019-11-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { parse } from 'querystring';
import { isUndefined } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import notification from 'utils/notification';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getEditTableData, addItemToPagination } from 'utils/utils';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

import Search from './Search';
import List from './List';

@connect(({ loading = {}, generalLedgerAccount = {} }) => ({
  queryListLoading: loading.effects['purchaseContractType/queryList'],
  fetchEnumLoading: loading.effects['purchaseContractType/fetchEnum'],
  updateStateLoading: loading.effects['purchaseContractType/updateState'],
  submitting: loading.effects['purchaseContractType/update'],
  generalLedgerAccount,
}))
@formatterCollections({
  code: [
    'spcm.purchaseContactType',
    'spcm.common',
    'entity.company',
    'spcm.purchaseContractType',
    'entity.roles',
    'smdm.ledgerAccount',
    'smdm.common',
  ],
})
export default class PurchaseContactType extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcTypeId } = parse(search.substr(1));
    this.state = {
      pcTypeId,
      // selectedRows: [],
      // selectedRowKeys: [],
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      // purchaseContractType: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      // _back=-1 在详情页
      // this.fetchList(pagination);
    } else {
      // this.fetchList(); // 查询数据
    }
    // this.fetchEnum(); // 查询值集
  }

  componentDidUpdate(prevProps, prevState, pcTypeId) {
    if (pcTypeId) {
      this.fetchList();
    }
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */

  @Bind()
  fetchList(page = {}) {
    const { pcTypeId } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    // this.setState({ selectedRows: [] });
    dispatch({
      type: 'purchaseContractType/queryList',
      payload: {
        page,
        pcTypeId,
        ...filterValues,
      },
    }).then(() => {
      this.resetDataForm();
    });
  }

  /**
   * onReset - 重置列表事件
   */
  @Bind()
  resetDataForm() {
    const { purchaseContractType } = this.props;
    const { dataSource = [] } = purchaseContractType;
    dataSource.forEach((item) => {
      item.$form.resetFields();
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractType/init',
    });
  }

  /**
   * 新建列表
   */
  /**
   * 新建列表
   * @param {String} pcTemplateId
   */
  @Bind()
  project() {
    const {
      dispatch,
      generalLedgerAccount: { dataSource = [], pagination = {} },
    } = this.props;
    const newDataSource = {
      enabledFlag: 1,
      edited: true,
      pcTemplateId: uuid(),
      _status: 'create',
    };
    dispatch({
      type: 'generalLedgerAccount/updateState',
      payload: {
        dataSource: [newDataSource, ...dataSource],
        pagination: addItemToPagination(dataSource.length, pagination),
      },
    });
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  @Bind()
  save() {
    const { dispatch = (e) => e, purchaseContractType } = this.props;
    const { dataSource = [] } = purchaseContractType;
    const newDataSource = dataSource.filter((item) => item.edited);
    const lines = getEditTableData(newDataSource, ['pcTypeId', '_status']);
    if (newDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
      const list = {
        pcAttachmentTypeDtailDTOList: null,
        pcPartnerTypeDetailDTOList: null,
        pcTermTypeDetailDTOList: null,
      };
      const Lines = lines.map((item) => {
        return {
          ...item,
          ...list,
        };
      });
      dispatch({
        type: 'purchaseContractType/update',
        payload: Lines,
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchList();
        }
      });
    }
  }

  /**
   * handleRecordChange - 列表项启用禁用勾选
   */
  @Bind()
  handleRecordChange(record) {
    const { dispatch, generalLedgerAccount } = this.props;
    const { dataSource } = generalLedgerAccount;
    const newDataSource = dataSource.map((item) => {
      if (item.pcTypeId === record.pcTypeId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    dispatch({
      type: 'generalLedgerAccount/updateState',
      payload: {
        dataSource: newDataSource,
      },
    });
  }

  render() {
    const {
      generalLedgerAccount: { dataSource = [], pagination = {} },
    } = this.props;
    const listProps = {
      dataSource,
      pagination,
      onHandleRecord: this.handleRecordChange,
    };
    return (
      <Fragment>
        <Header title={intl.get(`smdm.ledgerAccount.view.message.title`).d('总账科目定义')}>
          <Button icon="plus" type="primary" onClick={this.project}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
          <Button
            icon="save"
            // loading={submitting}
            onClick={this.save}
            // disabled={queryListLoading || submitting}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        </Header>
        <Content>
          <Search />
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
