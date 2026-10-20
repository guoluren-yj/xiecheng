/**
 * Uom - 计量单位定义(租户级)
 * @date: 2018-7-9
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import queryString from 'querystring';
import { Bind, Debounce } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { DEBOUNCE_TIME } from 'utils/constants';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { openTab } from 'utils/menuTab';
import { SRM_MDM } from '_utils/config';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import { Button as PermissionButton } from 'components/Permission';

import {
  getCurrentOrganizationId,
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
  filterNullValueObject,
} from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 租户计量单位定义
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {!Object} uomOrg - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {!boolean} saveLoading - 保存操作是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e=> e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: ['SMDM_UOM-ORG.LIST', 'SMDM_UOM-ORG.SEARCH'],
})
@connect(({ uomOrg, loading }) => ({
  uomOrg,
  loading: loading.effects['uomOrg/fetchUomData'],
  saveLoading: loading.effects['uomOrg/addUomData'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['smdm.uom', 'hzero.common', 'smdm.common', 'smdm.currencyOrg'] })
export default class UomOrg extends Component {
  form;

  /**
   * state初始化
   * @param {object} props - 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {
      tipModalVisible: false,
    };
  }

  /**
   * 生命周期函数
   * render()调用后执行，调用计量单位查询接口
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 引用云级数据
   * 租户级计量单位引用云级计量单位
   */
  @Bind()
  handleRefUom() {
    const {
      dispatch,
      tenantId,
      uomOrg: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'uomOrg/fetchRefUom',
      payload: {
        tenantId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 新增
   * 计量单位数据列表新增行数据，调整list及pagination属性的值
   */
  @Bind()
  @Debounce(DEBOUNCE_TIME)
  handleAddUom() {
    const {
      dispatch,
      tenantId,
      uomOrg: { list = [], pagination = {} },
    } = this.props;
    dispatch({
      type: 'uomOrg/updateState',
      payload: {
        list: [
          {
            tenantId,
            uomId: uuidv4(),
            uomCode: '',
            uomName: '',
            uomTypeCode: '',
            uomTypeName: '',
            enabledFlag: 1,
            sourceCode: 'SRM',
            externalSystemCode: 'SRM', // 默认值
            _status: 'create', // 新建标记位
          },
          ...list,
        ],
        pagination: addItemToPagination(list.length, pagination),
      },
    });
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchImport(code) {
    const retitle = 'hzero.common.viewtitle.batchImport'; // 批量导入的多语言编码
    openTab({
      key: `/smdm/uom-org/import/${code}`,
      search: queryString.stringify({
        key: `/smdm/uom-org/import/${code}`,
        title: retitle,
        action: retitle,
      }),
    });
  }

  /**
   * 保存
   * 对新增数据或修改后的数据调用保存接口
   */
  @Bind()
  handleSaveUom() {
    const {
      uomOrg: { list = [] },
    } = this.props;
    const params = getEditTableData(list, ['uomId']);

    if (Array.isArray(params) && params.length !== 0) {
      // const changeList = [];
      let flag = false;
      params.forEach((record) => {
        const currentlist = list.filter(
          (item) => item.uomId === record.uomId && item.uomPrecision !== record.uomPrecision
        );
        if (currentlist.length !== 0) {
          // changeList.push(currentlist[0]);
          flag = true;
          return flag;
        }
      });
      if (flag) {
        this.setState({ tipModalVisible: true });
      } else {
        this.handleSave();
      }
    }
  }

  @Bind()
  handleSave() {
    const {
      dispatch,
      tenantId,
      uomOrg: { list = [], pagination = {} },
    } = this.props;
    const params = getEditTableData(list, ['uomId']);
    dispatch({
      type: 'uomOrg/addUomData',
      payload: {
        tenantId,
        saveData: params,
        customizeUnitCode: 'SMDM_UOM-ORG.LIST,SMDM_UOM-ORG.SEARCH',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 数据查询
   * @param {Object} fields 查询参数
   * @param {object} fields.page - 分页查询
   * @param {String} fields.uomCode - 计量单位编码
   * @param {String} fields.uomName - 计量单位名称
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'uomOrg/fetchUomData',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
        customizeUnitCode: 'SMDM_UOM-ORG.LIST,SMDM_UOM-ORG.SEARCH',
      },
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 编辑
   * 行数据切换编辑状态
   * @param {Object} record 操作对象
   * @param {Boolean} flag  编辑/取消标记
   */
  @Bind()
  handleEditLine(record = {}, flag) {
    const {
      dispatch,
      uomOrg: { list = [] },
    } = this.props;
    const newList = list.map((item) =>
      item.uomId === record.uomId ? { ...item, _status: flag ? 'update' : '' } : item
    );
    dispatch({
      type: 'uomOrg/updateState',
      payload: {
        list: [...newList],
      },
    });
  }

  /**
   * 清除新增行数据
   * @param {Objec} record 待清除的数据对象
   */
  @Bind()
  handleCleanLine(record = {}) {
    const {
      dispatch,
      uomOrg: { list = [], pagination = {} },
    } = this.props;
    const newList = list.filter((item) => item.uomId !== record.uomId);
    dispatch({
      type: 'uomOrg/updateState',
      payload: {
        list: [...newList],
        pagination: delItemToPagination(list.length, pagination),
      },
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    return filterValues;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      saveLoading,
      customizeTable,
      customizeFilterForm,
      uomOrg: { pagination = {}, list = [] },
    } = this.props;
    const { tipModalVisible } = this.state;
    const filterProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      customizeFilterForm,
    };
    const listProps = {
      pagination,
      loading,
      customizeTable,
      dataSource: list,
      onCleanLine: this.handleCleanLine,
      onEditLine: this.handleEditLine,
      onSearch: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('smdm.uom.view.message.title').d('计量单位定义')}>
          <Button
            icon="save"
            type="primary"
            onClick={this.handleSaveUom}
            loading={saveLoading || loading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="plus" onClick={this.handleAddUom}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="fork" onClick={this.handleRefUom}>
            {intl.get('smdm.uom.view.option.quote').d('引用云级数据')}
          </Button>
          <CommonImport
            prefixPatch="/smdm"
            businessObjectTemplateCode="SMDM.UOM_IMPORT"
            buttonProps={{
              permissionList: [
                {
                  code: `srm.mdm.uom.ps.new.uom.import`,
                  type: 'button',
                  meaning: '批量导入-新',
                },
              ],
            }}
            buttonText={intl.get('smdm.uom.view.option.uomImport.new').d('批量导入-新')}
            args={{
              customizeUnitCode: 'SMDM_UOM-ORG.LIST',
            }}
          />
          <PermissionButton
            type="c7n-pro"
            icon="archive"
            onClick={() => this.handleBatchImport('SMDM.UOM_IMPORT')}
            permissionList={[
              {
                code: `srm.mdm.uom.ps.uom.import`,
                type: 'button',
                meaning: '批量导入',
              },
            ]}
          >
            {intl.get('smdm.uom.view.option.uomImport').d('批量导入')}
          </PermissionButton>
          <ExcelExportPro
            templateCode="SRM_C_SRM_C_SRM_SMDM_UOM_EXPORT"
            requestUrl={`${SRM_MDM}/v1/${getCurrentOrganizationId()}/uom/export`}
            queryParams={() => this.handleGetFormValue()}
            otherButtonProps={{
              icon: 'unarchive',
              permissionList: [
                {
                  code: 'srm.mdm.uom.button.new.export',
                  type: 'button',
                },
              ],
            }}
            method="POST"
            allBody
            buttonText={intl.get('hzero.common.export.new').d('导出-新')}
          />
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
        </Content>
        {tipModalVisible && (
          <Modal
            title={intl.get(`smdm.currencyOrg.model.TipTitle`).d('温馨提示')}
            destroyOnClose
            visible={tipModalVisible}
            onOk={() => {
              this.setState({ tipModalVisible: false });
              this.handleSave();
            }}
            onCancel={() => {
              this.setState({ tipModalVisible: false });
            }}
          >
            <div>
              {intl
                .get(`smdm.currencyOrg.model.uom.tip`)
                .d('变更计量单位精度可能会导致单据前后单价金额不一致，请确认是否继续进行变更')}
            </div>
          </Modal>
        )}
      </React.Fragment>
    );
  }
}
