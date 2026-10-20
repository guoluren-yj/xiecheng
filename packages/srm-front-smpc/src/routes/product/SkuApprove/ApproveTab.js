import React, { Component } from 'react';
import { Tooltip } from 'choerodon-ui';
import { Table, Button, Icon, Spin } from 'choerodon-ui/pro';
import qs from 'querystring';
import { observer } from 'mobx-react-lite';
import { observer as dacObserver } from 'mobx-react';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { openTab } from 'utils/menuTab';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';

import { getSkuImagePath } from '@/utils/utils';
import Image from '@/components/Image';
import listCellRender from '@/routes/renderTools/listCellRender';

import { UnitLine, ObserverBtn, LabelContainer } from '../SkuWorkbench/components';
import {
  openEvaluate,
  openPriceInfo,
  openAuths,
  openRecords,
  openTextArea,
} from '../SkuWorkbench/drawers';
import { stockRender, priceRender, approveStatusColumn } from '../SkuWorkbench/tableColumns';

import { fetchLastProduct, approveOrReject } from './api';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const DynamicBtn = observer(({ dataSet, children, getDynamicProps = (e) => e, ...btnProps }) => {
  const { text, ...others } = getDynamicProps(dataSet) || {};
  return (
    <Button {...btnProps} {...others}>
      {text || children}
    </Button>
  );
});

@withRouter
@withCustomize({ unitCode: ['SMPC.PRODUCE_APPROVE.BTNS', 'SMPC.PRODUCE_APPROVE.TABLE'] })
@dacObserver
export default class ApproveTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: true,
      isExpanded: false,
      btnLoading: false,
    };
    this.tableRef = React.createRef();
  }

  componentDidMount() {
    this.props.tableDs.query();
  }

  renderOptions = (record, type) => {
    const actions = [
      {
        text: intl.get('hzero.common.button.look').d('查看'),
        event: () => this.handleViewDetail(record),
        show: !(record.get('__versionId') && !record.get('skuHistoryId')),
      },
      {
        text: intl.get('hzero.common.button.preview').d('预览'),
        event: () => this.handlePreview(record),
      },
      {
        text: intl.get('hzero.common.button.record').d('操作记录'),
        event: () => openRecords(record.get('skuId')),
      },
    ];
    const filterActions = actions.filter((f) => {
      const { show = true } = f;
      return show;
    });
    return (
      <span className={type === 'hor' ? 'action-link' : styles['action-link-ver']}>
        {filterActions.map((m) => {
          const { text, disabled, event = (e) => e } = m;
          return (
            <a disabled={disabled} onClick={event}>
              {text}
            </a>
          );
        })}
      </span>
    );
  };

  renderSkuInfo = ({ record }) => {
    const { spuCode, categoryNamePath, keyList } = record.toData();
    const imagePath = getSkuImagePath(record);

    const compareList = keyList || [];

    // 商品名称 分类
    return (
      <div className={styles['sku-container']}>
        <div className="sku-info">
          <Image className="sku-img" value={imagePath} width={60} height={60} />
          {listCellRender(
            [
              {
                name: 'skuCode',
                label: intl.get('smpc.product.view.skuCode').d('商品编码'),
              },
              {
                name: 'skuName',
                label: intl.get('smpc.product.view.skuName').d('商品名称'),
                color: compareList.includes('skuName') ? '#fca000' : undefined,
              },
              {
                name: 'thirdSkuCode',
                label: intl.get('smpc.product.view.thirdSkuCode').d('第三方商品编码'),
                labelMinWidth: 84,
              },
            ],
            record.toData()
          )}
        </div>
        <div className="spu-info">
          <span className="spu-code">
            <Tooltip title={intl.get('smpc.product.view.spuCode').d('商品组编码')} placement="top">
              {spuCode}
            </Tooltip>
          </span>
          <span className="spu-category">
            <Tooltip
              title={`${intl
                .get('smpc.product.view.platCategory')
                .d('平台分类')}：${categoryNamePath}`}
              placement="top"
            >
              {categoryNamePath}
            </Tooltip>
          </span>
        </div>
      </div>
    );
  };

  renderCusLabels = ({ record, value }) => {
    return <LabelContainer labels={value} record={record} />;
  };

  renderPriceInfo = (record, view) => {
    const prices = record.get('skuSalesInfos') || record.get('skuApproveSalesList') || [];
    if (prices.length > 1 || view === 'hor') {
      return (
        <UnitLine>
          <a onClick={() => openPriceInfo({ skuId: record.get('skuId'), data: prices }, false)}>
            {intl.get('smpc.product.view.lookPrice').d('查看价格')}
          </a>
        </UnitLine>
      );
    } else {
      return priceRender(record);
    }
  };

  renderMappingInfo = ({ record }) => {
    const compareList = record.get('keyList') || [];
    return listCellRender(
      [
        {
          name: 'catalogName',
          label: intl.get('smpc.product.model.catalog').d('目录'),
          labelMinWidth: 24,
          color: compareList.includes('catalogName') ? '#fca000' : undefined,
        },
        {
          name: 'itemCode',
          label: intl.get('smpc.product.model.itemCode').d('物料编码'),
          color: compareList.includes('itemCode') ? '#fca000' : undefined,
        },
        {
          name: 'itemName',
          label: intl.get('smpc.product.model.itemName').d('物料名称'),
          color: compareList.includes('itemName') ? '#fca000' : undefined,
        },
        {
          name: 'itemCategoryName',
          label: intl.get('smpc.product.view.itemCategory').d('物料品类'),
          color: compareList.includes('itemCategoryName') ? '#fca000' : undefined,
        },
      ],
      record.toData()
    );
  };

  @Bind
  getTogehterColumns() {
    const { waiting } = this.props;
    return [
      approveStatusColumn(waiting, true, 'table-cell-inner-display'),
      {
        name: 'options',
        width: 100,
        renderer: ({ record }) => this.renderOptions(record, 'ver'),
      },
      {
        name: 'skuInfo',
        width: 290,
        tooltip: 'none',
        renderer: this.renderSkuInfo,
      },
      {
        name: 'mappingInfo',
        width: 180,
        renderer: this.renderMappingInfo,
      },
      {
        name: 'priceInfo',
        width: 210,
        renderer: ({ record }) => this.renderPriceInfo(record, 'ver'),
      },
      {
        name: 'stockInfo',
        width: 160,
        renderer: stockRender,
      },
      {
        name: 'skuComment',
        width: 100,
        renderer: ({ record }) => (
          <UnitLine>
            <a onClick={() => openEvaluate(record.get('skuId'))}>
              {intl.get('smpc.product.view.lookComment').d('查看评价')}
            </a>
          </UnitLine>
        ),
      },
      {
        name: 'supplierCompanyName',
        width: 160,
      },
      {
        name: 'labels',
        width: 140,
        renderer: this.renderCusLabels,
      },
      {
        name: 'authority',
        width: 100,
        renderer: ({ record }) => (
          <UnitLine>
            <a onClick={() => openAuths(record, '/smpc/sku-approve-pur/list')}>
              {intl.get('smpc.product.view.lookAuth').d('查看权限')}
            </a>
          </UnitLine>
        ),
      },
      {
        name: 'publisher',
        width: 160,
      },
    ];
  }

  // 审批
  @Bind
  handleBatchApprove(type) {
    const { tableDs } = this.props;
    const data = tableDs.selected.map((m) => m.toData());

    const approveFn = async (params, suffix) => {
      this.setState({ btnLoading: true });
      const result = getResponse(
        await approveOrReject({ skuApproveDTOS: data, ...params }, suffix)
      );
      this.setState({ btnLoading: false });
      if (result) {
        notification.success();
        tableDs.unSelectAll();
        tableDs.clearCachedSelected();
        tableDs.query(tableDs.currentPage);
      }
    };

    if (type === 'pass') {
      approveFn(
        {
          approvalFlag: 2,
        },
        'approve'
      );
    } else if (type === 'reject') {
      openTextArea({
        title: intl.get('smpc.workbench.view.approveReject').d('审批拒绝'),
        name: 'remark',
        label: intl.get('smpc.product.view.rejectReason').d('拒绝原因'),
        maxLength: 100,
        onOk: (param) => approveFn({ approvalFlag: 0, ...param }, 'reject'),
      });
    } else {
      approveFn(
        {
          approvalFlag: 1,
        },
        'approve-and-shelf'
      );
    }
  }

  @Bind()
  handleViewDetail(record) {
    const { waiting, history } = this.props;
    const {
      spuId,
      skuId,
      approveType,
      approvalFrom,
      skuHistoryId,
      approveStatus,
      skuTemporaryId,
    } = record.toData();
    // 更新商品工作流审批
    const isWorkflowApprove = approveStatus === 'WORKFLOW_WAITING' && approveType === 'UPDATE';
    history.push({
      pathname: `/smpc/sku-approve-pur/detail`,
      search: qs.stringify({
        spuId,
        skuId,
        approveType,
        req: isWorkflowApprove ? 'workflowApprove' : 'new',
        skuTemporaryId,
        anchor: 'APPROVE',
        btnFlag: approveStatus === 'WAITING' ? 'y' : 'n',
        historyFlag: skuHistoryId ? 'y' : 'n',
        compareFlag: waiting && approvalFrom !== 'SAGM' ? 'y' : 'n',
      }),
    });
  }

  @Bind
  handlePreview(record) {
    const {
      skuId: productId,
      sourceFrom,
      skuTemporaryId,
      __versionId,
      approveType,
      approveStatus,
    } = record.toData();
    openTab({
      key: '/smpc/sku-preview',
      title: 'srm.common.view.skuPreview',
      search: qs.stringify(
        filterNullValueObject({
          productId,
          sourceFrom,
          approveType,
          skuTemporaryId: __versionId ? undefined : skuTemporaryId,
          req: __versionId ? '' : 'new',
          btnFlag: approveStatus === 'WAITING' && !__versionId ? 'y' : 'n',
          backPath: '/smpc/sku-approve-pur/list',
        })
      ),
    });
  }

  @Bind()
  expandIcon({ prefixCls, expanded, expandable, record, onExpand }) {
    const { waiting } = this.props;
    const approvalFrom = record.get('approvalFrom');
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    if (waiting && !record.get('__versionId') && approvalFrom !== 'SAGM') {
      if (record.getState('loading') === true) {
        // 自定义状态渲染
        return <Spin delay={200} size="small" />;
      }

      return (
        <Icon
          type="baseline-arrow_right"
          className={classString}
          onClick={onExpand}
          tabIndex={expandable ? 0 : -1}
        />
      );
    }
    if (record.get('__versionId')) {
      return <span className={classString} />;
    }
    return <span className={classString} style={{ display: 'inline-block', width: 20 }} />;
  }

  // 点击展开子节点
  @Bind()
  async handleExpand(expanded, record) {
    const params = record.toData();
    const { tableDs } = this.props;
    const approvalFrom = record.get('approvalFrom');
    if (expanded && !record.children && approvalFrom !== 'SAGM' && !record.get('__versionId')) {
      record.setState('loading', true);
      const result = getResponse(await fetchLastProduct(params));
      if (result) {
        const __versionId = record.get('skuTemporaryId');
        // 获取子结点数据，绑定父节点
        const recordsChildren = {
          ...result,
          __versionId,
          skuTemporaryId: `${record.get('skuTemporaryId')}-old`,
        };
        record.init('keyList', result.keyList);
        record.setState('loading', false);
        // 生成完成的dataSet数据注意会触发load event
        tableDs.appendData([recordsChildren]);
      }
    }
  }

  handleLoadData = ({ record }) => {
    this.handleExpand(true, record);
  };

  render() {
    const {
      waiting,
      tableDs,
      customizeTable,
      match: { path = '' },
    } = this.props;
    const { expand, btnLoading, isExpanded } = this.state;

    const _columns = this.getTogehterColumns();
    const columns = _columns.map((m) => ({
      ...m,
      renderer: m.renderer ? m.renderer : ({ value }) => <UnitLine title={value}>{value}</UnitLine>,
    }));
    const exportBtn = (
      <ExcelExport
        name="oldExport"
        exportAsync
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          color: 'primary',
          icon: 'unarchive',
        }}
        requestUrl={`/smpc/v1/${organizationId}/skus/query-sku-temporary/export`}
        queryParams={() => {
          const params =
            (tableDs.queryDataSet.current && tableDs.queryDataSet.current.toJSONData()) || {};
          delete params.__dirty;
          delete params.__id;
          delete params._status;
          return {
            tenantId: organizationId,
            ...filterNullValueObject(params),
            ...tableDs.queryParameter,
          };
        }}
      />
    );

    const exportBtnPro = (
      <ExcelExportPro
        name="newExport"
        templateCode="SMPC_SKU_EXPORT"
        buttonText={intl.get('smpc.product.button.exportNew').d('(新)导出')}
        exportAsync
        otherButtonProps={{
          funcType: 'flat',
          color: 'primary',
          icon: 'unarchive',
          permissionList: [
            { code: `${path}.button.export-new`, type: 'button', meaning: '商品审批-(新)导出' },
          ],
        }}
        requestUrl={`/smpc/v1/${organizationId}/skus/query-sku-temporary/export`}
        queryParams={() => {
          const params =
            (tableDs.queryDataSet.current && tableDs.queryDataSet.current.toJSONData()) || {};
          delete params.__dirty;
          delete params.__id;
          delete params._status;
          return {
            tenantId: organizationId,
            ...filterNullValueObject(params),
            ...tableDs.queryParameter,
          };
        }}
      />
    );

    const buttons = [
      <DynamicBtn
        name="fold"
        funcType="flat"
        color="primary"
        icon={isExpanded ? 'arrow_drop_up' : 'arrow_drop_down'}
        dataSet={tableDs}
        onClick={() => {
          tableDs.selected.forEach((f) => {
            if (!f.get('__versionId') && f.get('approvalFrom') !== 'SAGM') {
              Object.assign(f, { isExpanded: !isExpanded });
            }
          });
          this.setState({ isExpanded: !isExpanded });
        }}
        getDynamicProps={(ds) => {
          const canExpand = ds.selected.some(
            (s) => !s.get('__versionId') && s.get('approvalFrom') !== 'SAGM'
          );
          return {
            disabled: !canExpand,
          };
        }}
      >
        {isExpanded
          ? intl.get('smpc.product.model.collapseHistoryVersion').d('收起历史版本')
          : intl.get('smpc.product.model.expandHistoryVersion').d('展开历史版本')}
      </DynamicBtn>,
      <ObserverBtn
        funcType="flat"
        name="approveReject"
        color="primary"
        icon="cancel"
        loading={btnLoading}
        onClick={() => this.handleBatchApprove('reject')}
        dataSet={tableDs}
        getDisable={() => tableDs.selected.length === 0}
        permission
        permissionList={[
          {
            code: `${path}.button.approve`,
            type: 'button',
            meaning: '商品审批-审批',
          },
        ]}
        text={intl.get('smpc.productApprove.model.approveReject').d('审批拒绝')}
      />,
      <ObserverBtn
        funcType="flat"
        name="approveAndShelf"
        color="primary"
        icon="open_in_browser"
        dataSet={tableDs}
        loading={btnLoading}
        onClick={() => this.handleBatchApprove('passShelf')}
        getDisable={() => tableDs.selected.length === 0}
        permission
        permissionList={[
          {
            code: `${path}.button.approve`,
            type: 'button',
            meaning: '商品审批-审批',
          },
        ]}
        text={intl.get('smpc.productApprove.model.approveAndShelf').d('审批通过并上架')}
      />,
      <ObserverBtn
        name="approveSuccess"
        funcType="flat"
        color="primary"
        icon="check_circle"
        dataSet={tableDs}
        loading={btnLoading}
        onClick={() => this.handleBatchApprove('pass')}
        getDisable={() => tableDs.selected.length === 0}
        permission
        permissionList={[
          {
            code: `${path}.button.approve`,
            type: 'button',
            meaning: '商品审批-审批',
          },
        ]}
        text={intl.get('smpc.productApprove.model.approveSuccess').d('审批通过')}
      />,
    ];
    return (
      <React.Fragment>
        {waiting && expand && (
          <p className={styles['change-tips']}>
            <Icon type="info" />
            <span>
              {intl
                .get('smpc.product.view.getChangesFromHistoryVersion')
                .d('黄色高亮表示对比历史版本有更改的部分')}
            </span>
            <Icon type="cancel" onClick={() => this.setState({ expand: false })} />
          </p>
        )}
        {/* 表格头按钮组个性化必须得有表格个性化 */}
        {customizeTable(
          {
            code: 'SMPC.PRODUCE_APPROVE.TABLE',
            buttonCode: 'SMPC.PRODUCE_APPROVE.BTNS',
          },
          <Table
            dataSet={tableDs}
            ref={(ref) => {
              this.tableRef = ref;
            }}
            mode={this.props.mode || 'tree'}
            rowHeight="auto"
            columns={columns}
            treeLoadData={this.handleLoadData}
            expandIcon={this.expandIcon}
            className={styles['sku-approve-table']}
            onRow={({ record }) => ({
              className: record.get('__versionId') ? styles['approve-history'] : '',
            })}
            buttons={waiting ? [exportBtn, exportBtnPro, ...buttons] : [exportBtn, exportBtnPro]}
          />
        )}
      </React.Fragment>
    );
  }
}
