import React, { PureComponent, Fragment } from 'react';
import { DataSet, Button, Table, Lov, Icon, Spin } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import queryString from 'querystring';
import classNames from 'classnames';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import ImportButton from 'components/Import';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { openTab } from 'utils/menuTab';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import formatterCollections from 'utils/intl/formatterCollections';

import { DropdownBtn } from '@/components/CommonButtons';
import c7nModal from '@/utils/c7nModal';
import { tableDS } from './tableDS.js';
import BatchUpdate from './BatchUpdate';

const organizationId = getCurrentOrganizationId();
@formatterCollections({
  code: ['small.purchaseManage', 'sagm.common'],
}) // 租户ID
@withCustomize({ unitCode: ['SAGM.PURCHASE_MANAGE.BTNS'] })
@observer
export default class PurchaseManage extends PureComponent {
  tableDS = new DataSet(tableDS());

  @Bind()
  openBatchModal() {
    c7nModal({
      drawer: true,
      okText: intl.get('hzero.common.button.save').d('保存'),
      style: {
        width: 350,
      },
      title: intl.get('small.purchaseManage.view.batchUpdate').d('批量编辑'),
      children: <BatchUpdate tableDS={this.tableDS} />,
    });
  }

  // 点击展开
  @Bind()
  handleLoadData({ record, dataSet }) {
    const param = { parentUnitId: record.get('unitId'), queryHasChildren: true };
    const hasChild = record.get('children');
    const isAddChild = !record.children;
    if (isAddChild && hasChild && hasChild.length) {
      dataSet.appendData(hasChild);
      return;
    }
    if (isAddChild) {
      record.setState('loading', true);
      request(`/sagm/v1/${organizationId}/unit-refs`, {
        method: 'GET',
        query: param,
      })
        .then((res) => {
          if (res.length) {
            dataSet.appendData(res);
          }
        })
        .finally(() => {
          record.setState('loading', false);
        });
    }
  }

  /**
   * 通用导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/sagm/data-import/SMAL.UNIT_REF`,
      title: 'srm.common.view.purchaseManageImport',
      // title: intl.get('srm.common.view.purchaseManageImport').d('采买组织导入'),
      search: queryString.stringify({
        action: 'srm.common.view.purchaseManageImport',
        backPath: '/small/purchase-manage',
      }),
    });
  }

  @Bind()
  expandicon({ prefixCls, expanded, expandable, record, onExpand }) {
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    if (record.getState('loading') === true) {
      // 自定义状态渲染
      return <Spin tip="loading" delay={200} size="small" />;
    }

    return record.get('hasChildren') ? (
      <Icon
        type="baseline-arrow_right"
        className={classString}
        onClick={onExpand}
        tabIndex={expandable ? 0 : -1}
      />
    ) : (
      <span style={{ display: 'inline-block', width: 20 }} />
    );
  }

  @Bind()
  handleCollapse() {
    const canCollapses = this.tableDS.filter((r) => r.get('hasChildren'));
    const isExpanded = canCollapses.some((s) => s.isExpanded);
    if (this.tableRef && isExpanded) {
      this.tableRef.tableStore.collapseAll();
    }
  }

  handleCompanyChange = ({ value, oldValue, record }) => {
    if (value) {
      if (value.companyId !== (oldValue || {}).companyId) {
        record.set('invLov', null);
      }
      record.set('comLov', {
        companyId: value.companyId,
        companyName: value.companyName,
      });
    } else {
      record.set('invLov', null);
    }
  };

  handleInventoryChange = ({ value, record }) => {
    if (value) {
      record.set('invLov', {
        organizationId: value.organizationId,
        organizationName: value.organizationName,
      });
      record.set('comLov', {
        companyId: value.companyId,
        companyName: value.companyName,
      });
    }
  };

  @Bind()
  getColumns() {
    return [
      {
        name: 'unitCode',
        renderer: ({ record }) => <span>{`${record.data.unitCode}-${record.data.unitName}`}</span>,
      },
      {
        name: 'aliasName',
        editor: true,
      },
      {
        name: 'invLov',
        editor: (record) => (
          <Lov onChange={(value) => this.handleInventoryChange({ value, record })} />
        ),
      },
      {
        name: 'purLov',
        editor: (record, name) => (
          <Lov
            onChange={(item) => {
              if (item) {
                record.set(name, {
                  purchaseOrgId: item.purchaseOrgId,
                  organizationName: item.organizationName,
                });
              }
            }}
          />
        ),
      },
      {
        name: 'comLov',
        editor: (record) => (
          <Lov
            onChange={(value, oldValue) => this.handleCompanyChange({ value, oldValue, record })}
          />
        ),
      },
    ];
  }

  render() {
    const {
      match: { path },
      customizeBtnGroup,
    } = this.props;
    const BatButton = observer(({ dataSet }) => {
      return (
        <Button
          funcType="flat"
          icon="mode_edit"
          onClick={this.openBatchModal}
          disabled={dataSet.selected.length < 1}
        >
          {intl.get('small.purchaseManage.view.batchUpdate').d('批量编辑')}
        </Button>
      );
    });

    const customizeButtons = [
      {
        name: 'moreBtns',
        group: true,
        children: [
          {
            name: 'up',
            child: intl.get('hzero.common.button.up').d('收起'),
            btnProps: {
              onClick: this.handleCollapse,
              style: {
                paddingLeft: 15,
              },
            },
          },
          {
            name: 'oldExport',
            btnComp: ExcelExport,
            btnProps: {
              otherButtonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
                icon: '',
                style: {
                  textAlign: 'left',
                  marginLeft: 0,
                  fontWeight: 'normal',
                },
              },
              queryParams:
                this.tableDS.queryDataSet &&
                this.tableDS.queryDataSet.current &&
                this.tableDS.queryDataSet.current.data,
              requestUrl: `/sagm/v1/${organizationId}/unit-refs/export`,
            },
          },
          {
            name: 'oldImport',
            child: intl.get('small.purchaseManage.view.import').d('导入'),
            btnProps: {
              funcType: 'flat',
              onClick: this.handleImport,
              style: { textAlign: 'left', marginLeft: 0 },
            },
          },
        ],
        child: <DropdownBtn icon="more_horiz" hiddenIcon funcType="flat" />,
      },
    ];

    return (
      <Fragment>
        <Header title={intl.get('small.purchaseManage.view.title').d('采买组织管理')}>
          <Button
            icon="save"
            color="primary"
            onClick={async () => {
              await this.tableDS.submit();
              this.tableDS.query();
            }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <ImportButton
            businessObjectTemplateCode="SMAL.UNIT_REF"
            refreshButton
            buttonText={intl.get('sagm.common.button.importNew').d('(新)导入')}
            prefixPatch="/sagm"
            successCallBack={() => this.tableDS.query()}
            buttonProps={{
              icon: 'archive',
              funcType: 'flat',
              permissionList: [
                {
                  code: `${path}.button.import-new`,
                  type: 'button',
                  meaning: '采买组织管理-（新）导入',
                },
              ],
            }}
          />
          <ExcelExportPro
            templateCode="SMAL_UNIT_REF_EXPORT"
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
              permissionList: [
                {
                  code: `${path}.button.export-new`,
                  type: 'button',
                  meaning: '采买组织管理-（新）导出',
                },
              ],
            }}
            buttonText={intl.get('sagm.common.button.exportNew').d('(新)导出')}
            queryParams={
              this.tableDS.queryDataSet &&
              this.tableDS.queryDataSet.current &&
              this.tableDS.queryDataSet.current.data
            }
            requestUrl={`/sagm/v1/${organizationId}/unit-refs/export`}
          />
          <BatButton dataSet={this.tableDS} />
          {customizeBtnGroup(
            {
              code: 'SAGM.PURCHASE_MANAGE.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={customizeButtons} />
          )}
        </Header>
        <Content>
          <Table
            mode="tree"
            // eslint-disable-next-line no-return-assign
            ref={(ref) => (this.tableRef = ref)}
            dataSet={this.tableDS}
            columns={this.getColumns()}
            treeLoadData={this.handleLoadData}
            expandIcon={this.expandicon}
          />
        </Content>
      </Fragment>
    );
  }
}
