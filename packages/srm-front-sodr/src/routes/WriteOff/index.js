/**
 * WriteOff SRM冲销
 * @date: 2019-01-26
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Spin } from 'hzero-ui';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';

import Icons from 'components/Icons';
import intl from 'utils/intl';
// import notification from 'utils/notification';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

// const messagePrompt = 'sodr.writeOff.view.message';
const titlePrompt = 'sodr.writeOff.view.title';
const buttonPrompt = 'sodr.writeOff.view.button';

@withCustomize({
  unitCode: ['SODR.WRITE_OFF.FILTER', 'SODR.WRITE_OFF.LIST'],
})
@connect(({ writeOff, loading }) => ({
  writeOff,
  loading: loading.effects['writeOff/fetchWriteOffList'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'sodr.writeOff',
    'entity.company',
    'entity.order',
    'entity.customer',
    'entity.business',
    'entity.supplier',
    'entity.organization',
    'sodr.docMergeRulesModal',
    'sodr.sendOrder',
    'sodr.common',
    'sinv.purchaseReception',
  ],
})
export default class WriteOff extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      receiveOrderType: 'ASN',
    };
  }

  componentDidMount() {
    // const { dispatch } = this.props;
    // this.handleSearch();
    // dispatch({ type: 'writeOff/fetchLov' });
    this.settingPage();
  }

  @Bind()
  settingPage() {
    const { dispatch } = this.props;
    dispatch({
      type: 'writeOff/fetchLov',
    }).then(() => {
      this.handleSearch();
    });
  }

  /**
   * form元素绑定
   * @param {object} ref - FilterForm对象
   * @memberof PlatformManager
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 冲销预览跳转
   * @memberof WriteOff
   */
  @Bind()
  handleWriteOffPreView() {
    const { dispatch, tenantId } = this.props;
    const { selectedRows, receiveOrderType } = this.state;
    // 校验是否为同一送货单
    const asnNumList = selectedRows.map(({ asnNum }) => asnNum);
    const displayLineNumList = selectedRows.map(({ displayPoNum }) => displayPoNum);
    const asnNum = asnNumList[0];
    const displayPoNum = displayLineNumList[0];
    const receivedByList = selectedRows.map(({ receivedBy }) => receivedBy).filter((n) => n);
    const receivedBy = Array.from(new Set(receivedByList));
    // if (asnNumList.filter(item => item === asnNum).length !== asnNumList.length) {
    //   notification.warning({
    //     message: intl.get(`${messagePrompt}.chooseSameWarn`).d('请勾选同一送货单进行冲销'),
    //   });
    //   return;
    // }
    // 构造请求参数并跳转到维护界面
    const lineIds =
      receiveOrderType === 'ASN'
        ? selectedRows.map(({ asnLineId }) => asnLineId)
        : selectedRows.map(({ poLineLocationId }) => poLineLocationId);
    if (!selectedRows.length) return false;
    const { supplierName } = selectedRows[0];
    const asn = `?lineIds=${String(
      lineIds
    )}&supplierName=${supplierName}&asnNum=${asnNum}&receiveOrderType=${receiveOrderType}&receivedBy=${String(
      receivedBy.length === 1 ? receivedBy : ''
    )}`;
    const order = `?lineIds=${String(
      lineIds
    )}&supplierName=${supplierName}&displayPoNum=${displayPoNum}&receiveOrderType=${receiveOrderType}&receivedBy=${String(
      receivedBy.length === 1 ? receivedBy : ''
    )}`;
    dispatch({
      type: 'writeOff/validateWriteOff',
      payload: {
        tenantId,
        lineIds,
        receiveOrderType,
      },
    }).then((res) => {
      if (res) {
        dispatch(
          routerRedux.push({
            pathname: `/sodr/write-off/detail`,
            search: receiveOrderType === 'ASN' ? asn : order,
          })
        );
      }
    });
  }

  /**
   * 数据行选择操作
   */
  @Bind()
  handleSelectRow(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 页面查询
   * @param {object} page - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    let filterValues = {};
    const formValues = this.form.getFieldsValue();
    const { receiveOrderType } = formValues;
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
      };
      filterValues = filterNullValueObject(values);
    }
    this.setState({
      selectedRows: [],
    });
    dispatch({
      type: 'writeOff/updateState',
      payload: {
        writeOffList: [],
        writeOffListPagination: [],
      },
    });
    dispatch({
      type: 'writeOff/fetchWriteOffList',
      payload: {
        tenantId,
        page,
        ...filterValues,
        customizeUnitCode: 'SODR.WRITE_OFF.LIST,SODR.WRITE_OFF.FILTER',
      },
    }).then(() => {
      this.setState({ receiveOrderType });
    });
  }

  render() {
    const {
      loading,
      tenantId,
      customizeTable,
      customizeFilterForm,
      writeOff: { writeOffList, writeOffListPagination, asnTypeCode, flagCode },
    } = this.props;
    const { selectedRowKeys, selectedRows, receiveOrderType } = this.state;
    const filterProps = {
      customizeFilterForm,
      tenantId,
      asnTypeCode,
      flagCode,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      customizeTable,
      selectedRowKeys:
        receiveOrderType === 'ASN'
          ? selectedRows.map((n) => n.asnLineId)
          : selectedRows.map((n) => n.poLineLocationId),
      selectedRows,
      receiveOrderType,
      dataSource: writeOffList,
      pagination: writeOffListPagination,
      onChange: this.handleSearch,
      onDetail: this.handleEdit8D,
      onSelectRow: this.handleSelectRow,
    };
    return (
      <Fragment>
        <Header title={intl.get(`${titlePrompt}.writeOff`).d('冲销')}>
          <Button
            type="primary"
            disabled={selectedRowKeys.length === 0}
            onClick={this.handleWriteOffPreView}
          >
            <Icons type="main-write-off-preview" style={{ marginRight: '8px' }} />
            {intl.get(`${buttonPrompt}.writeOffPreview`).d('冲销预览')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <Spin spinning={loading}>
            <ListTable {...listProps} />
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
