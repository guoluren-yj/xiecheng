/**
 * sourceTemplate - 寻源服务/寻源模板
 * @date: 2018-12-25
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button, Modal, Dropdown, Menu } from 'hzero-ui';
import { Dropdown as C7nDropdown, Menu as C7nMenu } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty, isArray } from 'lodash';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import querystring from 'querystring';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImportNew from 'hzero-front/lib/components/Import';
import remoteHoc from 'hzero-front/lib/utils/remote';
import { SRM_SSRC } from '_utils/config';

import { judgeExportIsDisable } from '@/services/sourceTemplateService';
import { fetchBidConfig, fetchRFContentConfig } from '@/services/inquiryHallService';
import { checkPermission, fetchConfigSheet } from '@/services/inquiryHallNewService';
import { isJSON, fetchSourceTemplateConfig } from '@/utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 寻源模板创建入口
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
const promptCode = 'ssrc.sourceTemplate';
@remoteHoc({
  code: 'SSRC_SOURCE_TEMPLATE_LIST',
  name: 'remote',
})
@connect(({ sourceTemplate, loading }) => ({
  sourceTemplate,
  loading: {
    fetchSourceTemp: loading.effects['sourceTemplate/fetchSourceTemp'],
  },
  saveCopySourceTempLoading:
    loading.effects['sourceTemplate/fetchSaveCopySourceTemp'] ||
    loading.effects['sourceTemplate/saveCopyRFTemp'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['ssrc.sourceTemplate', 'ssrc.inquiryHall'],
})
export default class Template extends Component {
  form;

  state = {
    useRF: false, // 是否展示RF
    isBid: false, // 新招标
    useRFContent: 'ALL', // 展示RFI/RFP
    sourceExportDisableFlag: true, // 寻源模板导出禁用flag
    rfExportDisableFlag: true, // RF导出禁用flag
    judgeExportIsDisableRes: {}, // 接口请求结果
    selectedRowKeys: [], // 列表选中行keys
    selectedRows: [], // 列表选中行
    CheckPermissionObject: {}, // 权限集对象
    isReadOnly: false, // 新老模板共存限制老模板只读
  };

  /**
   * 生命周期初始化查询数据
   */
  componentDidMount() {
    const {
      sourceTemplate: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    this.fetchSourceCategory();
    this.fetchShowRF();
    this.fetchBidConfig();
    this.fetchCheckPermission();
    this.fetchReadOnly();
  }

  // 查询配置表判断老模板是否只读
  @Bind()
  async fetchReadOnly() {
    const { organizationId } = this.props;

    const newTemplateConfig = await fetchSourceTemplateConfig({
      organizationId,
      groupCamp: 'PURCHASER', // 阵营。供应商方：SUPPLIER 采购方：PURCHASER
    });
    if (newTemplateConfig) {
      this.setState({
        isReadOnly: newTemplateConfig,
      });
    }
  }

  /**
   * 获取按钮权限
   */
  async fetchCheckPermission() {
    const permissionList = this.getPermissionCode([
      'rfxTemplateExportNew',
      'rfxTemplateImportNew',
      'rfTemplateExportNew',
      'rfTemplateImportNew',
    ]);
    const result = getResponse(await checkPermission(permissionList));
    if (result && !result.failed) {
      const checkPermissionObj = {};
      result.forEach((r = {}) => {
        const { code = null } = r;
        if (!code) {
          return;
        }

        if (r.controllerType === 'hidden' && !r.approve) {
          // 隐藏
          checkPermissionObj[code] = 'hidden';
        } else if (!r.approve) {
          // 禁用
          checkPermissionObj[code] = 'disabled';
        } else {
          checkPermissionObj[code] = 'default';
        }
      });
      this.setState({
        CheckPermissionObject: checkPermissionObj,
      });
    }
  }

  /**
   * 获取权限按钮
   * @param {*} permissionName - 权限code 对应的name
   */
  getPermissionCode(permissionName) {
    if (!permissionName || isEmpty(permissionName)) return null;
    const prefix = 'ssrc.source-template.list.button.';

    const permissionListMap = new Map([
      ['rfxTemplateExportNew', `${prefix}rfx-template-export-new`], // 寻源模板导出
      ['rfxTemplateImportNew', `${prefix}rfx-template-import-new`], // 寻源模板导出
      ['rfTemplateExportNew', `${prefix}rf-template-export-new`], // 征询模板导出
      ['rfTemplateImportNew', `${prefix}rf-template-import-new`], // 征询模板导入
    ]);

    let permissionCode = null;

    if (typeof permissionName === 'string') {
      permissionCode = permissionListMap.get(permissionName);
    }

    if (isArray(permissionName)) {
      const codeSet = new Set();
      permissionName.forEach((unitCode) => {
        codeSet.add(permissionListMap.get(unitCode));
      });

      permissionCode = codeSet.size ? [...codeSet] : null;
    }

    return permissionCode;
  }

  /**
   * 判断询价/RF导出模板是否禁用
   * @param {string} fromType - 查询来源：点击form查询(init)、初始化(init)、分页查询；若是点击分页查询则不执行此方法；
   * @returns
   */
  judgeExportIsDisable(fromType) {
    if (fromType !== 'init') return;
    const filterValues = this.getSearchParams();
    judgeExportIsDisable({
      ...(filterValues || {}),
    })
      .then((res) => {
        // SOURCE代表寻源模版按钮 RF代表征询按钮 false为禁用
        if (getResponse(res)) {
          this.setState({
            sourceExportDisableFlag: !res.SOURCE,
            rfExportDisableFlag: !res.RF,
            judgeExportIsDisableRes: res,
          });
        }
      })
      .catch((err) => {
        this.getTemplateMenuItemDisable([]);
        throw new Error(err);
      });
    this.setState({
      sourceExportDisableFlag: true,
      rfExportDisableFlag: true,
      judgeExportIsDisableRes: {},
    });
  }

  @Bind()
  getSearchParams() {
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      filterValues = filterNullValueObject(formValue);
    }
    return { ...filterValues, latestFlag: 'P' };
  }

  /**
   * 是否展示RF
   */
  async fetchShowRF() {
    const res = await fetchRFContentConfig();
    if (!isJSON(res)) {
      if (res) {
        this.setState({
          useRF: true,
        });
        if (res === 'RFI') {
          this.setState({
            useRFContent: 'RFI',
          });
        } else if (res === 'RFP') {
          this.setState({
            useRFContent: 'RFP',
          });
        } else {
          this.setState({
            useRFContent: 'ALL',
          });
        }
      } else {
        this.setState({
          useRF: false,
        });
      }
    } else {
      getResponse(JSON.parse(res));
    }
  }

  @Bind()
  async fetchBidConfig() {
    const res = getResponse(await fetchBidConfig({ tenant: getCurrentTenant().tenantNum }));
    if (res) {
      this.setState({
        isBid: Number(res[0]?.newBid || 1),
      });
      this.fetchSecondSourceCategory(Number(res[0]?.newBid || 1), Number(res[0]?.oldBid || 0));
    }
  }

  /**
   * 查询子集
   */
  @Bind()
  fetchSecondSourceCategory(newBid, oldBid) {
    const { dispatch } = this.props;
    dispatch({
      type: 'sourceTemplate/fetchSecondarySourceCategory',
      payload: {
        code:
          newBid && oldBid
            ? 'SSRC.SECONDARY_SOURCE_CATEGORY_WITH_RF_BID'
            : 'SSRC.SECONDARY_SOURCE_CATEGORY_SCORE',
      },
    });
  }

  /**
   * 查询子集
   */
  @Bind()
  fetchSourceCategory() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sourceTemplate/fetchSourceCategory',
    });
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
   * 页面查询
   * @param {object} page - 查询参数
   * @param {string} fromType - 查询来源：初始化(init)、或点击form查询(init)、或分页查询；
   */
  @Bind()
  handleSearch(page = {}, fromType = 'init') {
    const { dispatch, organizationId, remote } = this.props;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      filterValues = filterNullValueObject(formValue);
    }
    const _payload = {
      page: isEmpty(page) ? {} : page,
      ...filterValues,
      organizationId,
      latestFlag: 'P',
    };
    const payload = remote
      ? remote?.process('SSRC_SOURCE_TEMPLATE_LIST_PROCESS_QUERY_PARAMS', _payload, {})
      : _payload;
    dispatch({
      type: 'sourceTemplate/fetchSourceTemp',
      payload,
    }).then(() => {
      if (fromType === 'init') {
        // 初始化或者点击form查询是 init
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
      }
    });
    this.judgeExportIsDisable(fromType); // 若修改查询参数，看下这个方法里面获取参数是否需要加上！
  }

  /**
   * 创建寻源模板
   */
  @Bind()
  handleCreateTemplate() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/source-template/create`,
      })
    );
  }

  /**
   * 明细维护
   * @param {!object} record - 模板对象
   */
  @Bind()
  handleEditSourceTemp(record = {}) {
    const { dispatch } = this.props;
    const { sourceCategory, templateId } = record;
    if (sourceCategory === 'RFI' || sourceCategory === 'RFP') {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/source-template/rf-update/${templateId}`,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/source-template/update/${templateId}`,
        })
      );
    }
  }

  // 老模板只读限制单号链接进去查看
  @Bind()
  handleNumDetail(record) {
    const { dispatch } = this.props;
    const { templateId, templateNum, secondarySourceCategory } = record;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/source-template/${
          ['RFI', 'RFP'].includes(secondarySourceCategory) ? 'rf-update' : 'update'
        }/${templateId}`,
        search: querystring.stringify({
          isHistory: true,
          templateNum,
          type: 'view',
        }),
      })
    );
  }

  /**
   * 复制寻源模板
   * @param {!Object} record - 当前行记录
   */
  @Bind()
  handleSaveCopySourceTemp(record = {}) {
    const { dispatch, organizationId, saveCopySourceTempLoading } = this.props;
    const { templateId, sourceCategory } = record;
    Modal.confirm({
      title: `${intl
        .get(`${promptCode}.model.sourceTemplate.copySourceTemplateInfo`)
        .d('是否复制寻源模板')}-${record.templateName}?`,
      okText: intl.get('hzero.common.button.ok').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      confirmLoading: saveCopySourceTempLoading,
      onOk: () => {
        return dispatch({
          type:
            sourceCategory === 'RFI' || sourceCategory === 'RFP'
              ? 'sourceTemplate/saveCopyRFTemp'
              : 'sourceTemplate/fetchSaveCopySourceTemp',
          payload: {
            templateId,
            organizationId,
          },
        }).then((res) => {
          if (res) {
            dispatch(
              routerRedux.push({
                pathname:
                  sourceCategory === 'RFI' || sourceCategory === 'RFP'
                    ? `/ssrc/source-template/rf-update/${res.templateId}`
                    : `/ssrc/source-template/update/${res.templateId}`,
              })
            );
          }
        });
      },
    });
  }

  /**
   * 创建rf寻源模板
   */
  @Bind()
  createInquiryTemplate() {
    const { dispatch } = this.props;
    const { useRFContent } = this.state;
    const search = querystring.stringify({
      useRFContent,
    });
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/source-template/rf-create`,
        search,
      })
    );
  }

  /**
   * 勾选行切换
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 处理单个选择
   * @param {*} record 选中｜取消的数据
   * @param {*} selected 选中｜取消
   */
  @Bind()
  handleSelectChange(record, selected) {
    const { selectedRows = [] } = this.state;
    let newSelectRows = [];
    if (selected) {
      newSelectRows = [...selectedRows, record];
    } else {
      newSelectRows = selectedRows.filter((r) => r.templateId !== record.templateId);
    }
    this.getTemplateMenuItemDisable(newSelectRows);
  }

  /**
   * 处理全选
   * @param {*} selected 选中｜取消
   * @param {*} _ 选中｜取消的所有数据行
   * @param {*} changeRows 选中｜取消的所有数据行中改变的数据
   */
  @Bind()
  handleSelectAllChange(selected, _, changeRows) {
    const { selectedRows } = this.state;
    let newSelectRows = [];
    if (selected) {
      newSelectRows = [...selectedRows, ...changeRows];
    } else {
      const changeIds = changeRows.map((r) => r.templateId);
      selectedRows.forEach((r1) => {
        if (!changeIds.includes(r1.templateId)) {
          newSelectRows.push(r1);
        }
      });
    }
    this.getTemplateMenuItemDisable(newSelectRows);
  }

  /**
   * 处理模板导出是否禁用
   * @param {*} selectedRows 已选择的所有数据
   */
  getTemplateMenuItemDisable(selectedRows = []) {
    const { judgeExportIsDisableRes } = this.state;
    if (!isEmpty(selectedRows) && isArray(selectedRows)) {
      // 只要前端有勾选，导出是否禁用就根据勾选数据来
      let rfxFlag = false;
      let rfFlag = false;

      selectedRows.forEach((record) => {
        if (['RFI', 'RFP'].includes(record.secondarySourceCategory)) {
          rfxFlag = true; // 若选中数据有一条是征询，则寻源模板导出禁用
        }
        if (['RFQ', 'BID', 'NEW_BID', 'RFA'].includes(record.secondarySourceCategory)) {
          rfFlag = true; // 若选中数据有一条是询价｜竞价｜招投标｜招投标新，则征询模板导出禁用
        }
      });
      this.setState({
        sourceExportDisableFlag: rfxFlag,
        rfExportDisableFlag: rfFlag,
        selectedRows,
      });
    } else {
      // 如果勾选数据为空 模板导出是否禁用则取接口中请求的结果
      this.setState({
        sourceExportDisableFlag: !judgeExportIsDisableRes.SOURCE,
        rfExportDisableFlag: !judgeExportIsDisableRes.RF,
        selectedRows,
      });
    }
  }

  /**
   * 获取寻源模板｜征询模板导入props
   * @param {*} importType 导入类型 RFX-寻源；RF-征询
   */
  getTemplateExportProps = (importType) => {
    const { organizationId } = this.props;
    const {
      selectedRowKeys,
      sourceExportDisableFlag,
      rfExportDisableFlag,
      CheckPermissionObject = {},
    } = this.state;
    const sourceExportFlag = importType === 'RFX'; // RFX-寻源模板导入 RF-征询模板导入
    const text = sourceExportFlag
      ? intl.get('ssrc.sourceTemplate.view.button.sourceTemplateExport').d('寻源模板导出')
      : intl.get('ssrc.sourceTemplate.view.button.rfTemplateExport').d('征询模板导出');
    const exportTitle =
      importType === 'RFX'
        ? intl
            .get('ssrc.sourceTemplate.view.message.exportRfxTemplateTooltip')
            .d(
              '用于导出询价/竞价/招投标模板。如果你选择导出的模板包含信息征询/方案征询模板，【寻源模板导出】按钮将置灰，请重新选择导出的模板。'
            )
        : intl
            .get('ssrc.sourceTemplate.view.message.exportRfTemplateTooltip')
            .d(
              '用于导出信息征询/方案征询模板。如果你选择导出的模板包含询价/竞价/招投标模板，【征询模板导出】按钮将置灰，请重新选择导出的模板。'
            );
    // 拆分id 处理主键重复问题
    const templateIds = selectedRowKeys.map((item) => {
      const ids = item?.split?.('#') || [];
      return ids?.[0];
    });
    return {
      templateCode: sourceExportFlag
        ? 'SRM_C_SRM_SSRC_SOURCE_TEMPLATE_EXPORT'
        : 'SRM_C_SRM_SSRC_RF_TEMPLATE_EXP',
      requestUrl: `/ssrc/v1/${organizationId}/${
        sourceExportFlag ? 'source-template' : 'rf-templates'
      }/export`,
      buttonText: text,
      buttonTooltip: exportTitle,
      allBody: true,
      method: 'POST',
      queryParams: {
        templateIds,
        ...(this.getSearchParams() || {}),
      },
      otherButtonProps: {
        style: { border: 'none' },
        disabled: sourceExportFlag
          ? CheckPermissionObject[this.getPermissionCode('rfxTemplateExportNew')] === 'disabled' ||
            sourceExportDisableFlag
          : CheckPermissionObject[this.getPermissionCode('rfTemplateExportNew')] === 'disabled' ||
            rfExportDisableFlag,
      },
    };
  };

  /**
   * 获取寻源模板｜征询模板导出props
   * @param {*} importType 导入类型 RFX-寻源；RF-征询
   */
  getTemplateImportProps = (importType) => {
    const { organizationId } = this.props;
    const { CheckPermissionObject = {} } = this.state;
    const sourceImportFlag = importType === 'RFX'; // RFX-寻源模板导出 RF-征询模板导出
    const text = sourceImportFlag
      ? intl.get('ssrc.sourceTemplate.view.button.sourceTemplateImport').d('寻源模板导入')
      : intl.get('ssrc.sourceTemplate.view.button.rfTemplateImport').d('征询模板导入');
    const importTitle =
      importType === 'RFX'
        ? intl
            .get('ssrc.sourceTemplate.view.message.importRfxTemplateTooltip')
            .d('用于导入询价/竞价/招投标模板')
        : intl
            .get('ssrc.sourceTemplate.view.message.importRfTemplateTooltip')
            .d('用于导入信息征询/方案征询模板');
    return {
      businessObjectTemplateCode: sourceImportFlag
        ? 'SRM_C_SRM_SSRC_SOURCE_TEMPLATE_IMPORT'
        : 'SRM_C_SRM_SSRC_RF_TEMPLATE_IMPORT',
      prefixPatch: SRM_SSRC,
      args: {
        tenantId: organizationId,
      },
      refreshButton: true,
      buttonText: text,
      buttonTooltip: importTitle,
      buttonProps: {
        style: { border: 'none' },
        disabled: sourceImportFlag
          ? CheckPermissionObject[this.getPermissionCode('rfxTemplateImportNew')] === 'disabled'
          : CheckPermissionObject[this.getPermissionCode('rfTemplateImportNew')] === 'disabled',
      },
      auto: true,
      successCallBack: this.handleSearch, // 刷新列表
      modalProps: {
        title: text,
      },
    };
  };

  // 获取导入导出模板下拉框选项值
  getMenuItems = (type) => {
    const { CheckPermissionObject = {}, isReadOnly = false } = this.state;
    // 是否显示寻源模板导入导出 flag
    const showExportFlag =
      (type === 'RFX' &&
        CheckPermissionObject[this.getPermissionCode('rfxTemplateExportNew')] !== 'hidden') ||
      (type === 'RF' &&
        CheckPermissionObject[this.getPermissionCode('rfTemplateExportNew')] !== 'hidden');
    // 是否显示征询模板导入导出 flag
    const showImportFlag =
      (type === 'RFX' &&
        CheckPermissionObject[this.getPermissionCode('rfxTemplateImportNew')] !== 'hidden') ||
      (type === 'RF' &&
        CheckPermissionObject[this.getPermissionCode('rfTemplateImportNew')] !== 'hidden');
    return (
      <C7nMenu>
        {showExportFlag && (
          <C7nMenu.Item>
            <ExcelExportPro {...(this.getTemplateExportProps(type) || {})} />
          </C7nMenu.Item>
        )}
        {isReadOnly
          ? null
          : showImportFlag && (
          <C7nMenu.Item>
            <CommonImportNew {...(this.getTemplateImportProps(type) || {})} />
          </C7nMenu.Item>
            )}
      </C7nMenu>
    );
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      isBid,
      useRFContent,
      useRF,
      selectedRowKeys,
      selectedRows = [],
      CheckPermissionObject = {},
      isReadOnly = false,
    } = this.state;
    const {
      loading,
      sourceTemplate: {
        list = [],
        pagination = {},
        sourceCategory = [],
        secondarySourceCategory = [],
      },
      organizationId,
    } = this.props;

    const filterProps = {
      isBid,
      useRF,
      useRFContent,
      sourceCategory,
      secondarySourceCategory,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
    };
    const listProps = {
      isBid,
      pagination,
      loading: loading.fetchSourceTemp,
      dataSource: list,
      onChange: (page) => this.handleSearch(page, 'pageSearch'),
      onDetail: this.handleEditSourceTemp,
      onSelectRow: this.handleSelectRow,
      onSaveCopySourceTemp: this.handleSaveCopySourceTemp,
      organizationId,
      rowSelection: {
        selectedRowKeys,
        selectedRows,
        onChange: this.handleRowSelectChange,
        onSelect: this.handleSelectChange,
        onSelectAll: this.handleSelectAllChange,
      },
      isReadOnly,
      onDetailNum: this.handleNumDetail,
    };

    // 是否显示寻源模板导入导出 flag
    const showRfxTemplateFlag =
      CheckPermissionObject[this.getPermissionCode('rfxTemplateExportNew')] === 'default' ||
      CheckPermissionObject[this.getPermissionCode('rfxTemplateExportNew')] === 'disabled' ||
      CheckPermissionObject[this.getPermissionCode('rfxTemplateImportNew')] === 'default' ||
      CheckPermissionObject[this.getPermissionCode('rfxTemplateImportNew')] === 'disabled';
    // 是否显示征询模板导入导出 flag
    const showRfTemplateFlag =
      CheckPermissionObject[this.getPermissionCode('rfTemplateExportNew')] === 'default' ||
      CheckPermissionObject[this.getPermissionCode('rfTemplateExportNew')] === 'disabled' ||
      CheckPermissionObject[this.getPermissionCode('rfTemplateImportNew')] === 'default' ||
      CheckPermissionObject[this.getPermissionCode('rfTemplateImportNew')] === 'disabled';

    const menu = (
      <Menu>
        {
          <Menu.Item>
            <a onClick={this.handleCreateTemplate}>
              {intl
                .get('ssrc.sourceTemplate.view.button.createSourceTemplate')
                .d('新建询价/竞价/招投标模板')}
            </a>
          </Menu.Item>
        }
        {useRF && useRFContent === 'ALL' ? (
          <Menu.Item>
            <a onClick={this.createInquiryTemplate}>
              {intl
                .get('ssrc.sourceTemplate.view.button.createInquiryTemplate')
                .d('新建信息征询/方案征询模板')}
            </a>
          </Menu.Item>
        ) : useRFContent === 'RFI' ? (
          <Menu.Item>
            <a onClick={this.createInquiryTemplate}>
              {intl
                .get('ssrc.sourceTemplate.view.button.createInquiryRFITemplate')
                .d('新建信息征询模板')}
            </a>
          </Menu.Item>
        ) : useRFContent === 'RFP' ? (
          <Menu.Item>
            <a onClick={this.createInquiryTemplate}>
              {intl
                .get('ssrc.sourceTemplate.view.button.createInquiryRFPTemplate')
                .d('新建方案征询模板')}
            </a>
          </Menu.Item>
        ) : null}
      </Menu>
    );

    return (
      <React.Fragment>
        <Header
          title={intl.get('ssrc.sourceTemplate.view.message.title.sourcingTemplate').d('寻源模板')}
        >
          {isReadOnly ? null : (
            <Dropdown overlay={menu}>
              <Button icon="plus" type="primary">
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
            </Dropdown>
          )}
          {showRfxTemplateFlag && (
            <C7nDropdown overlay={this.getMenuItems('RFX')}>
              <Button icon="plus" type="primary">
                {intl
                  .get('ssrc.sourceTemplate.view.button.sourceTemplateImportExport')
                  .d('寻源模板导入导出')}
              </Button>
            </C7nDropdown>
          )}
          {useRF && showRfTemplateFlag && (
            <C7nDropdown overlay={this.getMenuItems('RF')}>
              <Button icon="plus" type="primary">
                {intl
                  .get('ssrc.sourceTemplate.view.button.rfTemplateImportExport')
                  .d('征询模板导入导出')}
              </Button>
            </C7nDropdown>
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
