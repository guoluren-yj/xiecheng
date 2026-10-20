/**
 * index.js - 我发起的协议
 * @date: 2019-05-23
 * @author: zuoxiangyu<xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import querystring from 'querystring';
import { Button, Modal } from 'hzero-ui';
import { isUndefined, isEmpty, isFunction } from 'lodash';
import { connect } from 'dva';
import { DATETIME_MIN } from 'utils/constants';
import { downloadFile, queryMapIdpValue } from 'services/api';

import { HZERO_FILE } from 'utils/config';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import Search from './Search';
import List from './List';

const viewMessagePrompt = 'spcm.purchaseContractView.view.message';
@connect(({ loading = {}, contractMaintain = {} }) => ({
  queryCopyListLoading: loading.effects['contractMaintain/queryCopyList'],
  getBatchCodeLoading: loading.effects['contractMaintain/getCopyBatchCode'],
  copyContractLoading: loading.effects['contractMaintain/copyContract'],
  contractMaintain,
}))
@formatterCollections({
  code: [
    'spcm.common',
    'spcm.purchaseContractView',
    'entity.company',
    'entity.supplier',
    'entity.organization',
    'entity.roles',
  ],
})
export default class CopyContract extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      enumObj: {}, // 新的状态值集
    };
  }

  componentDidMount() {
    this.fetchEnum2(); // 查询状态值集
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo'];
    const takeArray = ['confirmedDateFrom', 'confirmedDateTo'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    takeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}) {
    const { onQueryCopyList } = this.props;
    const formValue = this.filterForm.getFieldsValue();
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject({
          ...formValue,
          supplierCompanyId: formValue.supplierCompanyDeputyId,
          supplierCompanyDeputyId: null,
        });
    const values = this.handleFormQuery(filterValues);
    onQueryCopyList(page, values);
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/purchase-contract-view/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : querystring.stringify({}),
      })
    );
  }

  /**
   * 跳转到固定地方
   * @param {String} pcHeaderId
   */
  @Bind()
  lookUp() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const pcHeaderId = selectedRows.map((item) => item.pcHeaderId);
    dispatch(
      routerRedux.push({
        pathname: `/spcm/purchase-contract-view/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : null,
        hash: `#spcm-contract-approval-detail-contract-online-edit`,
      })
    );
  }

  /**
   * 设置选中行
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * 下载
   * @param {object} record - 流程对象
   */
  @Bind()
  downloadLogFile() {
    const { selectedRows } = this.state;
    const organizationId = getCurrentOrganizationId();
    const contractFileUrl = selectedRows.map((item) => item.contractFileUrl);
    const api = `${HZERO_FILE}/v1/${organizationId}
    /files/download?bucketName=${PRIVATE_BUCKET}&url=${contractFileUrl}`;
    downloadFile({
      requestUrl: api,
      queryParams: [
        { name: 'bucketName', value: PRIVATE_BUCKET },
        { name: 'url', value: selectedRows[0].contractFileUrl },
      ],
    }).then((res) => {
      if (res) {
        this.fetchList();
      }
    });
  }

  /**
   * 批量归档
   * @param {String} pcHeaderId
   */
  @Bind()
  sureFileContract() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    dispatch({
      type: 'purchaseContractView/sureFileContract',
      payload: {
        selectedRows,
      },
    }).then(() => {
      this.setState({
        isSureFileContract: false,
        selectedRows: [],
      });
      notification.success();
      this.fetchList();
    });
  }

  // 复制单据
  @Bind()
  copyContract() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    // 单选框，每次勾选只能选择一个
    if (selectedRows.length === 1) {
      const { pcHeaderId } = selectedRows[0];
      dispatch({
        type: 'contractMaintain/copyContract',
        payload: {
          pcHeaderId,
          customizeUnitCode:
            'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
        },
      }).then((res) => {
        const hasFailed = res?.toString().indexOf('failed');
        if (hasFailed === -1) {
          // 返回的 res === pcHeaderId
          dispatch(
            routerRedux.push({
              pathname: '/spcm/contract-maintain/detail',
              search: `?pcHeaderId=${res}`,
              isCopy: 1,
            })
          );
        } else {
          const resObj = JSON.parse(res);
          notification.error({
            message: resObj.message,
          });
        }
      });
    }
  }

  /**
   * 查询值集
   */
  @Bind()
  async fetchEnum2() {
    const opts = await getResponse(
      queryMapIdpValue({
        statusEnum: 'SPCM.CONTRACT.STATUS.IS.SHOW',
      })
    );
    this.setState({ enumObj: { ...opts } });
  }

  @Bind()
  closeModal() {
    const { toggleModal } = this.props;
    this.setState({
      selectedRows: [],
    });
    this.filterForm.resetFields();
    if (isFunction(toggleModal)) toggleModal(false);
  }

  @Bind()
  getHeaderBtn() {
    const { selectedRows = [] } = this.state;
    const { copyContractLoading = false } = this.props;
    return (
      <Button
        type="primary"
        icon="check"
        style={{ marginRight: '46px' }}
        onClick={this.copyContract}
        disabled={isEmpty(selectedRows)}
        loading={copyContractLoading}
      >
        {intl.get(`${viewMessagePrompt}.createCopyContract`).d('创建')}
      </Button>
    );
  }

  render() {
    const { selectedRows = [], enumObj } = this.state;
    const {
      form,
      contractMaintain = {},
      copyModalVisible = false,
      queryCopyListLoading = false,
      getBatchCodeLoading = false,
      copyContractLoading = false,
      listPageRemote,
    } = this.props;
    const { copyModalPagination = {}, copyModalDataSource = [], enumMap = [] } = contractMaintain;
    const searchProps = {
      enumMap,
      enumObj,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      form,
      pagination: copyModalPagination,
      selectedRows,
      onSearch: this.fetchList,
      loading: queryCopyListLoading || getBatchCodeLoading || copyContractLoading,
      onRowSelectChange: this.onRowSelectChange,
      handleModalVisibleList: this.handleModalVisible,
      dataSource: copyModalDataSource,
    };

    selectedRows.forEach((v) => {
      if (
        (v.pcStatusCode === 'EFFECTED' && v.electricSignFlag === 1) ||
        (v.pcStatusCode === 'CONFIRMED' && v.electricSignFlag === 0)
      ) {
        this.state.isSureFileContract = true;
      } else {
        this.state.isSureFileContract = false;
      }
    });
    if (selectedRows.length === 0) {
      this.state.isSureFileContract = false;
    }
    const remoteBtnProps = {
      current: this,
    };

    return (
      <Modal width={1200} visible={copyModalVisible} footer={null} onCancel={this.closeModal}>
        <Header title={intl.get(`${viewMessagePrompt}.PurchaseContractView`).d('我发起的协议')}>
          {listPageRemote
            ? listPageRemote.render(
                'SPCM_CONTRACT_MAINTAIN_LIST_COPY_BTN',
                this.getHeaderBtn(),
                remoteBtnProps
              )
            : this.getHeaderBtn()}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
      </Modal>
    );
  }
}
