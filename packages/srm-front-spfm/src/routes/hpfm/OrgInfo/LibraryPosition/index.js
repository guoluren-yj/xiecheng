/**
 * libraryPosition - 库位-组织信息
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { isEmpty, isUndefined } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { openTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import { Button as ButtonPermission } from 'components/Permission';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { DEBOUNCE_TIME } from 'utils/constants';
import intl from 'utils/intl';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
  filterNullValueObject,
} from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import ExcelExport from 'components/ExcelExport';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import FilterForm from './FilterForm';
import DataList from './DataList';

const viewPrompt = 'hpfm.libraryPosition.view.message';
/**
 * 库位--组织信息
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} libraryPosition - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {boolean} saving - 保存操作是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: ['SPFM_ORG-INFO_LIBRARY_POSITION.LIST', 'SPFM_ORG-INFO_LIBRARY_POSITION.SEARCH'],
})
@connect(({ libraryPosition, loading }) => ({
  libraryPosition,
  loading: loading.effects['libraryPosition/fetchLibraryPosition'],
  saving: loading.effects['libraryPosition/saveLibraryPosition'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: 'hpfm.libraryPosition' })
export default class LibraryPosition extends PureComponent {
  /**
   * state初始化
   * @param {object} props - 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 生命周期函数
   * 获取render渲染的数据
   */
  componentDidMount() {
    this.handleSearchLibrary();
  }

  /**
   *按条件查询数据
   * @prop {object} payload - 请求参数
   * @memberof LibraryPosition
   */
  @Bind()
  handleSearchLibrary(payload = {}) {
    const { dispatch } = this.props;
    const { form } = this.state;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'libraryPosition/fetchLibraryPosition',
      payload: {
        page: isEmpty(payload) ? {} : payload,
        ...filterValues,
        customizeUnitCode:
          'SPFM_ORG-INFO_LIBRARY_POSITION.LIST,SPFM_ORG-INFO_LIBRARY_POSITION.SEARCH',
      },
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.setState({ form: ref.props.form });
  }

  /**
   *保存编辑或者新建的数据
   *
   * @memberof LibraryPosition
   */
  @Bind()
  handleSaveOption() {
    const {
      dispatch,
      organizationId,
      libraryPosition: { libraryList = [], pagination = {} },
    } = this.props;
    const payloadData = getEditTableData(libraryList, ['locationId']);
    if (isEmpty(payloadData)) return;

    dispatch({
      type: 'libraryPosition/saveLibraryPosition',
      payload: {
        payloadData,
        organizationId,
        query: { customizeUnitCode: 'SPFM_ORG-INFO_LIBRARY_POSITION.LIST' },
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchLibrary(pagination);
      }
    });
  }

  /**
   *新建行
   * @memberof LibraryPosition
   */
  @Bind()
  @Debounce(DEBOUNCE_TIME)
  handleCreateOption() {
    const {
      dispatch,
      organizationId,
      commonSourceCode,
      commonExternalSystemCode,
      libraryPosition: { libraryList = [], pagination = {} },
    } = this.props;
    dispatch({
      type: 'libraryPosition/updateState',
      payload: {
        libraryList: [
          {
            locationId: uuidv4(),
            locationCode: '',
            locationName: '',
            invOrganizationName: '',
            ouName: '',
            sourceCode: commonSourceCode,
            externalSystemCode: commonExternalSystemCode,
            enabledFlag: 1,
            tenantId: organizationId,
            _status: 'create', // 新建标记位
          },
          ...libraryList,
        ],
        pagination: addItemToPagination(libraryList.length, pagination),
      },
    });
  }

  /**
   *批量编辑行
   * @param {object} record 每行数据
   * @memberof LibraryPosition
   */
  @Bind()
  handleEditRow(record) {
    const {
      libraryPosition: { libraryList },
      dispatch,
    } = this.props;
    const newLibraryList = libraryList.map((item) => {
      if (record.locationId === item.locationId) {
        if (item.sourceCode === 'ERP') {
          return { ...item, isErp: true, _status: 'update' };
        }
        return { ...item, _status: 'update' };
      }
      return item;
    });
    dispatch({
      type: 'libraryPosition/updateState',
      payload: { libraryList: newLibraryList },
    });
  }

  /**
   *取消编辑行
   * @param {object} record 行数据
   * @memberof LibraryPosition
   */
  @Bind()
  handleCancelRow(record) {
    const {
      dispatch,
      libraryPosition: { libraryList },
    } = this.props;
    const newLibraryList = libraryList.map((item) => {
      if (item.locationId === record.locationId) {
        const { _status, ...other } = item;
        return other;
      }
      return item;
    });
    dispatch({
      type: 'libraryPosition/updateState',
      payload: { libraryList: newLibraryList },
    });
  }

  /**
   *删除新建的行
   * @param {object} record
   * @memberof LibraryPosition
   */
  @Bind()
  handleDeleteRow(record) {
    const {
      dispatch,
      libraryPosition: { libraryList = [], pagination = {} },
    } = this.props;
    const newLibraryList = libraryList.filter((item) => item.locationId !== record.locationId);
    dispatch({
      type: 'libraryPosition/updateState',
      payload: {
        libraryList: newLibraryList,
        pagination: delItemToPagination(libraryList.length, pagination),
      },
    });
  }

  /**
   *导入
   */

  @Bind()
  handleImport() {
    openTab({
      key: `/spfm/org-info/library-position/comment-import/SPFM.LOCATION_IMPORT`,
      title: 'hzero.common.button.import',
      search: querystring.stringify({
        action: 'hzero.common.button.import',
      }),
    });
  }

  @Bind()
  onTableSelectedRowChange(selectedRowKeys, selectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'libraryPosition/updateState',
      payload: {
        selectedRows,
        selectedRowKeys,
      },
    });
  }

  render() {
    const {
      loading,
      saving,
      organizationId,
      commonSourceCode,
      match,
      libraryPosition: { libraryList = [], pagination = {}, selectedRowKeys },
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onTableSelectedRowChange,
    };
    const isSaveList = libraryList.filter(
      (item) => item._status === 'create' || item._status === 'update'
    );
    const filterProps = {
      organizationId,
      customizeFilterForm,
      onSearch: this.handleSearchLibrary,
      onRef: this.handleBindRef,
    };
    const listProps = {
      commonSourceCode,
      loading,
      pagination,
      organizationId,
      match,
      customizeTable,
      rowSelection,
      dataSource: libraryList,
      onSearch: this.handleSearchLibrary,
      onEditRow: this.handleEditRow,
      onDelete: this.handleDeleteRow,
      onCancel: this.handleCancelRow,
    };

    const { form } = this.state;
    const values = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    return (
      <React.Fragment>
        <Header title={intl.get(`${viewPrompt}.title`).d('库位')}>
          <ButtonPermission
            type="primary"
            icon="save"
            disabled={isEmpty(isSaveList)}
            loading={(saving || loading) && !isEmpty(isSaveList)}
            onClick={this.handleSaveOption}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </ButtonPermission>
          <ButtonPermission
            icon="plus"
            permissionList={[
              {
                code: `${match.path}.button.create`,
                type: 'button',
                meaning: '库位-新建',
              },
            ]}
            onClick={this.handleCreateOption}
          >
            {intl.get('hzero.common.create').d('新建')}
          </ButtonPermission>
          <ExcelExportPro
            templateCode="HPFM_LOCATION_EXPORT"
            buttonText={
              selectedRowKeys?.length
                ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
                : intl.get('hzero.common.export.new').d('导出-新')
            }
            requestUrl={`${HZERO_PLATFORM}/v1/${organizationId}/locations/export`}
            queryParams={{
              ...values,
              exportLocationIds: isEmpty(selectedRowKeys) ? undefined : selectedRowKeys.join(),
            }}
            otherButtonProps={{
              permissionList: [
                {
                  code: 'srm.mdm.enterprise.srm-org-info.ps.new.location.list',
                  type: 'button',
                },
              ],
            }}
          />
          <CommonImport
            prefixPatch="/hpfm"
            businessObjectTemplateCode="SPFM.LOCATION_IMPORT"
            buttonProps={{
              // icon: 'to-top',
              permissionList: [
                {
                  code: `srm.mdm.enterprise.srm-org-info.ps.new.location.import`,
                  type: 'button',
                  meaning: '导入-新',
                },
              ],
            }}
            buttonText={intl.get('hzero.common.button.import.new').d('导入-新')}
          />
          <ExcelExport
            buttonText={
              selectedRowKeys?.length
                ? intl.get('hzero.common.button.exports').d('勾选导出')
                : intl.get('hzero.common.export').d('导出')
            }
            requestUrl={`${HZERO_PLATFORM}/v1/${organizationId}/locations/export`}
            queryParams={{
              ...values,
              exportLocationIds: isEmpty(selectedRowKeys) ? undefined : selectedRowKeys.join(),
            }}
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: 'srm.mdm.enterprise.srm-org-info.ps.location.list',
                  type: 'button',
                },
              ],
            }}
          />
          <ButtonPermission
            icon="archive"
            type="c7n-pro"
            onClick={this.handleImport}
            permissionList={[
              {
                code: `srm.mdm.enterprise.srm-org-info.ps.location.import`,
                type: 'button',
                meaning: '导入',
              },
            ]}
          >
            {intl.get('hzero.common.button.import').d('导入')}
          </ButtonPermission>
        </Header>
        <Content noCard>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <DataList {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
