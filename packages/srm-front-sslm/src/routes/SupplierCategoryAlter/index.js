/**
 * index.js - 供应商分类变更申请
 * @date: 2018-10-26
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Modal } from 'hzero-ui';
import { Table, DataSet, Select } from 'choerodon-ui/pro';

import querystring from 'querystring';
import { isNumber, sum, isEmpty } from 'lodash';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import { openTab } from 'utils/menuTab';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import CommonImport from 'components/Import';
import { Button as PerButton } from 'components/Permission';
import { SRM_SSLM } from '_utils/config';
import { batchCheckSupplierCtgAlter } from '@/services/supplierCategoryAlterService';
import { indexDS } from './stores/indexDS';

const Buttons = observer(
  ({
    dataSet,
    batchSubmitSupplierCategoryAlter,
    handleBatchExport,
    history,
    submitLoading,
    customizeBtnGroup,
  }) => {
    const isDisabled = isEmpty(dataSet.selected);
    return (
      <Fragment>
        {customizeBtnGroup(
          {
            // code: 'SSLM.SUPPLIER_CATEGORY_ALTER_LIST.BTN_GROUP',
            code: '',
          },
          [
            <Button
              icon="plus"
              type="primary"
              onClick={() => history.push(`/sslm/supplier-category-alter/create`)}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>,
            <Button
              icon="check"
              disabled={isDisabled}
              loading={submitLoading}
              onClick={() => {
                batchSubmitSupplierCategoryAlter();
              }}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>,
            <CommonImport
              data-name="commonImport"
              businessObjectTemplateCode="SSLM.SUPPLIER_CATEGORY_CREATE"
              prefixPatch={SRM_SSLM}
              refreshButton
              successCallBack={() => {
                dataSet.query();
              }}
              buttonText={intl.get('hzero.common.button.newImport').d('(新)导入')}
              buttonProps={{
                permissionList: [
                  {
                    code: 'srm.partner.suplier-classify.requisition.ps.doucment.import.model',
                    type: 'button',
                    meaning: '供应商分类变更申请-导入',
                  },
                ],
              }}
            />,
            <PerButton
              icon="archive"
              type="c7n-pro"
              onClick={handleBatchExport}
              permissionList={[
                {
                  code: 'srm.partner.suplier-classify.requisition.ps.doucment.import.old',
                  type: 'button',
                  meaning: '供应商分类变更申请-导入',
                },
              ]}
            >
              {intl.get('hzero.common.button.import').d('导入')}
            </PerButton>,
          ]
        )}
      </Fragment>
    );
  }
);

@connect(({ supplierCategoryAlter, user }) => ({
  supplierCategoryAlter,
  user,
  organizationId: getCurrentOrganizationId(),
  list: supplierCategoryAlter.supplierCategoryAlterList,
}))
@formatterCollections({
  code: ['sslm.supplierCategoryAlter', 'sslm.common'],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_CATEGORY_ALTER_LIST.LIST',
    'SSLM.SUPPLIER_CATEGORY_ALTER_LIST.SEARCH_FORM',
    'SSLM.SUPPLIER_CATEGORY_ALTER_LIST.BTN_GROUP',
  ],
})
@withProps(
  () => {
    const tableDs = new DataSet(indexDS());
    return { tableDs };
  },
  { cacheState: true }
)
export default class SupplierCategoryAlter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      submitLoading: false,
    };
  }

  componentDidMount() {
    const { tableDs } = this.props;
    tableDs.query(tableDs.currentPage);
  }

  // 批量提交供应商分类变更申请;
  @Bind()
  async batchSubmitSupplierCategoryAlter() {
    this.setState({ submitLoading: true });
    const { tableDs, dispatch } = this.props;

    const selectedRows = tableDs.toJSONData();

    const categoryAlterIds = selectedRows

      .filter(n => n.processStatus !== 'APPROVED')
      .map(n => n.categoryAlterId);
    if (!isEmpty(categoryAlterIds)) {
      const isChecked = getResponse(await batchCheckSupplierCtgAlter(categoryAlterIds));
      Modal.confirm({
        title: isEmpty(isChecked)
          ? intl.get('hzero.common.message.confirm.submit').d('是否确认提交?')
          : `${intl.get('sslm.supplierCategoryAlter.view.title.req').d('申请单')}：${isChecked
              .map(({ categoryAlterNumber }) => `【${categoryAlterNumber}】`)
              .join('、')}${intl
              .get('sslm.supplierCategoryAlter.view.title.batchCheckSupplierCtgAlterTip')
              .d('存在要启用的分类已在供应商分类定义被禁用，是否确认变更？')}`,
        onOk: () => {
          dispatch({
            type: 'supplierCategoryAlter/batchSubmitSupplierCategoryAlter',
            payload: categoryAlterIds,
          })
            .then(res => {
              if (res) {
                tableDs.query();
                notification.success();
              }
            })
            .finally(() => this.setState({ submitLoading: false }));
        },
        onCancel: () => {
          this.setState({ submitLoading: false });
        },
      });
    }
  }

  @Bind()
  handleBatchExport() {
    openTab({
      key: `/sslm/supplier-category-alter/comment-import/SSLM.SUPPLIER_CATEGORY_CREATE`,
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: querystring.stringify({
        action: intl
          .get('sslm.supplierCategoryAlter.action.import.title')
          .d('供应商分类变更申请导入'),
      }),
    });
  }

  render() {
    const { history, match, tableDs, customizeTable, custLoading, customizeBtnGroup } = this.props;

    const basePath = match.path.substring(0, match.path.indexOf('/list'));

    const columns = [
      {
        width: 160,
        name: 'categoryAlterNumber',
        renderer: ({ value, record }) => {
          return (
            <a
              onClick={() => {
                history.push(`${basePath}/detail/${record.data.categoryAlterId}`);
              }}
            >
              {value}
            </a>
          );
        },
      },
      {
        width: 140,
        name: 'supplierCompanyNum',
      },
      {
        name: 'supplierZhOrEnCompanyNum',
      },
      {
        width: 100,
        name: 'processStatusMeaning',
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.supply.applyReason').d('申请理由'),
        name: 'alterReason',
        width: 150,
      },
      {
        width: 150,
        name: 'realName',
        render: (_, record) => record.realName || record.loginName,
      },
      {
        width: 160,
        name: 'creationDate',
        render: dateRender,
      },
    ];

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));

    const { submitLoading } = this.state;

    const tableProps = {
      rowKey: 'categoryAlterId',
      columns,
      scroll: {
        x: scrollX,
      },
    };

    return (
      <Fragment>
        <Header
          title={intl
            .get('sslm.supplierCategoryAlter.view.title.supplierCategoryAlter')
            .d('供应商分类变更申请')}
        >
          <Buttons
            dataSet={tableDs}
            batchSubmitSupplierCategoryAlter={this.batchSubmitSupplierCategoryAlter}
            handleBatchExport={this.handleBatchExport}
            history={history}
            submitLoading={submitLoading}
            customizeBtnGroup={customizeBtnGroup}
          />
        </Header>
        <Content>
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_CATEGORY_ALTER_LIST.LIST',
              filterCode: 'SSLM.SUPPLIER_CATEGORY_ALTER_LIST.SEARCH_FORM',
            },
            <Table
              bordered
              {...tableProps}
              dataSet={tableDs}
              queryFieldsLimit={3}
              data={[]}
              custLoading={custLoading}
              queryFields={{
                processStatus: (
                  <Select
                    name="processStatus"
                    optionsFilter={record => record.get('value') !== 'CANCEL_SUBMIT'}
                  />
                ),
              }}
            />
          )}
        </Content>
      </Fragment>
    );
  }
}
