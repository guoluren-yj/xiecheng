/**
 * WriteOff SRM冲销 - 维护界面
 * @date: 2019-01-26
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Button, Spin } from 'hzero-ui';
import { isEmpty, isUndefined, isArray, cloneDeep, map } from 'lodash';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';

import notification from 'utils/notification';
import intl from 'utils/intl';
import Icons from 'components/Icons';
import { Header, Content } from 'components/Page';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getCurrentUser,
  getEditTableData,
  addItemsToPagination,
  delItemsToPagination,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import InfoPanel from './InfoPanel';
import ListTable from './ListTable';
import AddRecordModal from './AddRecordModal';
import styles from './InfoPanel.less';

const messagePrompt = 'sodr.writeOff.view.message';
const titlePrompt = 'sodr.writeOff.view.title';
const buttonPrompt = 'sodr.writeOff.view.button';

@withCustomize({
  unitCode: [
    'SODR.WRITE_OFF_DETAIL.GRID',
    'SODR.WRITE_OFF_DETAIL.GRID_BY_ORDER',
    'SODR.WRITE_OFF_DETAIL.HEADER',
  ],
})
@connect(({ writeOff, loading }) => ({
  writeOff,
  loading: {
    trxLine: loading.effects['writeOff/fetchTrxLineList'],
    modal: loading.effects['writeOff/fetchWriteOffListAdd'],
    writeOff: loading.effects['writeOff/addTrx'],
  },
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'sodr.writeOff',
    'sodr.common',
    'sinv.common',
    'entity.company',
    'entity.order',
    'entity.customer',
    'entity.business',
    'entity.roles',
    'entity.supplier',
    'entity.item',
    'entity.organization',
  ],
})
export default class Maintenance extends PureComponent {
  form;

  infoPanelForm;

  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { receiveOrderType } = querystring.parse(search.substr(1));
    this.state = {
      modalVisible: false,
      operator: '', // 操作人
      supplierName: '', // 供应商
      asnNum: '', // 送货单号
      displayPoNum: '', // 订单号
      selectedModalRows: [], // 新增时被选中的行
      selectedMaintenanceRows: [],
      selectedModalRowKeys: [],
      selectedMaintenanceRowKeys: [],
      lineIds: [], // 冲销的id
      receiveOrderType,
    };
  }

  componentDidMount() {
    this.parseInfoParse();
  }

  /**
   * 解析维护界面操作人、供应商、送货单号、送货单行ID信息
   * @param {boolean} needReParse -是否需要重新从url中解析信息
   */
  parseInfoParse(needReParse = true, lineIds = []) {
    if (!needReParse) {
      this.handleSearch();
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
        operator: getCurrentUser().realName,
        supplierName: paramsMap.get('supplierName'),
        asnNum: paramsMap.get('asnNum'),
        displayPoNum: paramsMap.get('displayPoNum'),
        receivedBy: paramsMap.get('receivedBy'),
        lineIds: lineIds.length > 0 ? lineIds : paramsMap.get('lineIds').split(','),
        // .map(item => Number(item)),
      },
      () => {
        this.handleSearch();
      }
    );
  }

  /**
   * 页面查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const { receiveOrderType } = this.state;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
      };
      filterValues = filterNullValueObject(values);
    }
    const { lineIds } = this.state;
    dispatch({
      type: 'writeOff/fetchTrxLineList',
      payload: {
        tenantId,
        lineIds,
        receiveOrderType,
        page: isEmpty(fields) ? -1 : fields,
        ...filterValues,
        customizeUnitCode: 'SODR.WRITE_OFF_DETAIL.GRID',
      },
    });
  }

  /**
   * 新增行窗口显示
   * @memberof Maintenance
   */
  @Bind()
  handleAddLinesShow(modalVisible = false) {
    if (modalVisible === true) {
      const {
        dispatch,
        tenantId,
        writeOff: { trxLineList },
      } = this.props;
      const { asnNum, lineIds, receiveOrderType, displayPoNum } = this.state;
      const type = 'writeOff/fetchWriteOffListAdd';
      dispatch({
        type,
        payload: {
          tenantId,
          asnNum,
          displayPoNum,
          lineIds,
          receiveOrderType,
          rcvTrxLineIds: trxLineList.map((item) => item.rcvTrxLineId),
        },
      });
    }
    this.setState({
      modalVisible,
      selectedModalRowKeys: [],
      selectedModalRows: [],
    });
  }

  /**
   * 新增行窗口查询
   * @memberof Maintenance
   */
  @Bind()
  handleModalSearch(filterData = {}) {
    const {
      dispatch,
      tenantId,
      writeOff: { trxLineList },
    } = this.props;
    const { asnNum, lineIds, displayPoNum, receiveOrderType } = this.state;
    const type = 'writeOff/fetchWriteOffListAdd';
    dispatch({
      type,
      payload: {
        ...filterData,
        tenantId,
        asnNum,
        displayPoNum,
        lineIds,
        receiveOrderType,
        rcvTrxLineIds: trxLineList.map((item) => item.rcvTrxLineId),
      },
    });
    this.setState({
      selectedModalRowKeys: [],
      selectedModalRows: [],
    });
  }

  /**
   * 更新url携带信息，刷新数据
   * @param {boolean} needReParse -是否需要重新从url中解析信息
   */
  updateUrlAndTableData() {
    const {
      dispatch,
      writeOff: { trxLineList, trxLineListPagination },
    } = this.props;

    const {
      supplierName,
      asnNum,
      displayPoNum,
      selectedModalRowKeys,
      selectedModalRows,
      receiveOrderType,
    } = this.state;
    // 预览界面已存在的rcvTrxLineId
    const maintenanceRcvTrxLineIds = trxLineList.map((item) => item.rcvTrxLineId);
    const maintenancePoLineLocationIds = trxLineList.map((item) => item.poLineLocationId);
    const Rcv = `?lineIds=${String([
      ...new Set([...trxLineList.map((i) => i.asnLineId), ...selectedModalRowKeys]),
    ])}&supplierName=${supplierName}&asnNum=${asnNum}&rcvTrxLineIds=${String(
      maintenanceRcvTrxLineIds
    )}`;
    const Pol = `?lineIds=${String([
      ...new Set([...trxLineList.map((i) => i.poLineLocationId), ...selectedModalRowKeys]),
    ])}&supplierName=${supplierName}&displayPoNum=${displayPoNum}&rcvTrxLineIds=${String(
      maintenancePoLineLocationIds
    )}`;
    dispatch(
      routerRedux.replace({
        pathname: `/sodr/write-off/detail`,
        search: receiveOrderType === 'ASN' ? Rcv : Pol,
      })
    );
    dispatch({
      type: 'writeOff/updateState',
      payload: {
        trxLineList: [...trxLineList, ...selectedModalRows],
        trxLineListPagination: addItemsToPagination(
          selectedModalRows.length,
          trxLineList.length,
          trxLineListPagination
        ),
      },
    });
    this.parseInfoParse(true, [
      ...new Set([
        ...trxLineList.map((i) => (receiveOrderType === 'ASN' ? i.asnLineId : i.poLineLocationId)),
        ...selectedModalRowKeys,
      ]),
    ]);
    // 重置弹出框选择列
    this.setState({
      selectedModalRowKeys: [],
      selectedModalRows: [],
    });
  }

  /**
   * 处理新增冲销行数据 - 该操作会可能会产生新的asnLineId
   */
  @Bind()
  handleModalOk() {
    this.updateUrlAndTableData();
    this.setState({ modalVisible: false });
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * Modal弹框数据行选择操作
   */
  @Bind()
  handleModalSelectRow(selectedModalRowKeys, selectedModalRows) {
    this.setState({ selectedModalRowKeys, selectedModalRows });
  }

  /**
   * 维护界面数据行选择操作
   */
  @Bind()
  handleMaintenanceSelectRow(selectedMaintenanceRowKeys, selectedMaintenanceRows) {
    this.setState({ selectedMaintenanceRowKeys, selectedMaintenanceRows });
  }

  /**
   * 冲销事务
   */
  @Bind()
  handleWriteOff() {
    const { selectedMaintenanceRows } = this.state;
    const { dispatch, tenantId } = this.props;
    const trxData = getEditTableData(selectedMaintenanceRows);
    if (isEmpty(trxData)) {
      return;
    }
    const type = 'writeOff/addTrx';
    this.infoPanelForm.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type,
          payload: {
            tenantId,
            params: {
              ...values,
              rcvTrxLines: trxData,
            },
            customizeUnitCode: 'SODR.WRITE_OFF_DETAIL.GRID',
          },
        }).then((res) => {
          if (res) {
            dispatch(
              routerRedux.push({
                pathname: `/sodr/write-off/list`,
                state: {
                  _back: -1,
                },
              })
            );
          }
        });
      }
    });
  }

  /**
   * 删除行
   */
  @Bind()
  handleRemoveTrxRows(val) {
    const {
      selectedMaintenanceRowKeys,
      receiveOrderType,
      selectedMaintenanceRows = [],
    } = this.state;
    const {
      dispatch,
      writeOff: { trxLineList, trxLineListPagination },
    } = this.props;
    const { total } = trxLineListPagination;
    if (selectedMaintenanceRowKeys.length === trxLineList.length || trxLineList.length <= 1) {
      notification.warning({
        message: intl.get(`${messagePrompt}.mustHaveOne`).d('禁止删除所有行，请至少保留一条数据'),
      });
    } else if (receiveOrderType === 'ASN') {
      const type = 'writeOff/updateState';
      this.setState({ selectedMaintenanceRows: [] });
      const filtered = trxLineList.filter(
        (item) => !selectedMaintenanceRowKeys.includes(item.rcvTrxLineId)
      );
      const testList = map(filtered, (item = {}, index) => {
        const value = cloneDeep(item);
        if ((value.lineNum = index + 1)) {
          return {
            ...value,
            lineNum: index + 1,
          };
        } else {
          return value;
        }
      });
      dispatch({
        type,
        payload: {
          trxLineList: testList,
          trxLineListPagination: delItemsToPagination(
            selectedMaintenanceRowKeys.length,
            trxLineList.length,
            trxLineListPagination
          ),
        },
      });
    } else if (receiveOrderType === 'ORDER') {
      const type = 'writeOff/updateState';
      const filtered = trxLineList.filter((item) => item.rcvTrxLineId !== val.rcvTrxLineId);
      const newSelectedMaintenanceRows = selectedMaintenanceRows.filter(
        (item) => item.rcvTrxLineId !== val.rcvTrxLineId
      );
      const testList = map(filtered, (item = {}, index) => {
        const value = cloneDeep(item);
        if ((value.lineNum = index + 1)) {
          return {
            ...value,
            lineNum: index + 1,
          };
        } else {
          return value;
        }
      });
      dispatch({
        type,
        payload: {
          trxLineList: testList,
          trxLineListPagination: {
            ...trxLineListPagination,
            total: total - 1,
          },
        },
      });
      this.setState({ selectedMaintenanceRows: newSelectedMaintenanceRows });
    }
  }

  render() {
    const {
      modalVisible,
      operator,
      supplierName,
      asnNum,
      receivedBy,
      selectedModalRowKeys,
      selectedModalRows,
      receiveOrderType,
      selectedMaintenanceRows,
      // selectedMaintenanceRowKeys,
    } = this.state;
    const {
      customizeForm,
      customizeTable,
      writeOff: {
        trxLineList = [],
        trxLineListPagination,
        writeOffListAdd,
        writeOffListAddPagination,
      },
      loading: { modal, trxLine, writeOff },
      tenantId,
      location: { search },
    } = this.props;
    const { displayPoNum } = querystring.parse(search.substr(1));
    const infoProps = {
      customizeForm,
      dataSource: {
        receiveOrderType,
        operator,
        supplierName,
        asnNum,
        displayPoNum,
        receivedBy,
      },
      onRef: (node) => {
        this.infoPanelForm = node;
      },
    };
    const listProps = {
      customizeTable,
      receiveOrderType,
      dataSource: trxLineList,
      pagination: trxLineListPagination,
      onRef: this.handleBindRef,
      onAdd: this.handleAddLinesShow,
      onRemove: this.handleRemoveTrxRows,
      // onChange: this.handleSearch,
      selectedRowKeys: selectedMaintenanceRows.map((n) => n.rcvTrxLineId),
      onSelectRow: this.handleMaintenanceSelectRow,
    };
    const asnLineId = trxLineList.map((n) => n.asnLineId);
    const modalProps = {
      tenantId,
      receiveOrderType,
      loading: { trxLine },
      spinning: modal,
      lineIds: asnLineId,
      onChange: this.handleSearch,
      selectedRowKeys: selectedModalRowKeys,
      selectedRows: selectedModalRows,
      dataSource: writeOffListAdd,
      pagination: writeOffListAddPagination,
      visible: modalVisible,
      onRef: this.handleBindRef,
      onCancel: this.handleAddLinesShow,
      onOk: this.handleModalOk,
      onSelectRow: this.handleModalSelectRow,
      handleSearch: this.handleModalSearch,
    };
    const selectedMaintenanceLength =
      selectedMaintenanceRows.length > 0 ? `（${selectedMaintenanceRows.length}）` : '';
    return (
      <Fragment>
        <Header
          title={intl.get(`${titlePrompt}.writeOffMaintenance`).d('冲销维护')}
          backPath="/sodr/write-off/list"
        >
          <Button
            type="primary"
            onClick={this.handleWriteOff}
            disabled={isArray(selectedMaintenanceRows) && isEmpty(selectedMaintenanceRows)}
            loading={writeOff}
          >
            <Icons type="main-write-off" style={{ marginRight: '8px' }} />
            {intl
              .get(`${buttonPrompt}.writeOffSelectedRows`)
              .d('冲销勾选行')
              .concat(selectedMaintenanceLength)}
          </Button>
        </Header>
        <Content>
          <Spin spinning={trxLine} wrapperClassName={styles['write-off-detail']}>
            <InfoPanel {...infoProps} />
            <ListTable {...listProps} />
          </Spin>
          <AddRecordModal {...modalProps} />
        </Content>
      </Fragment>
    );
  }
}
