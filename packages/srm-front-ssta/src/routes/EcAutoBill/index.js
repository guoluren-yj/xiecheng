import React, { Fragment, useMemo, useRef } from 'react';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Link } from 'dva/router';
import { compose } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { queryIdpValue } from 'services/api';
import { statusTagRender } from '@/utils/renderer';
import DynamicButtons from '_components/DynamicButtons';
import { formatDynamicBtns, transformSupplierData } from '@/utils/utils'; // 添加了单词内换行的自定义 getResponse
import withProps from 'utils/withProps';

import { PermComponent, getPermissions } from '@/routes/Components/Permission';
import { Content, Header } from 'components/Page';
import { tableDS as tableDs, errorRecordDS as errorRecordDs } from '@/stores/EcAutoBillDS';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
// import MultiTextFilter from '@/routes/Components/MultiTextFilter';
import Styles from '@/routes/common.less';

const listUnitCodes = ['SSTA.ECAUTO_BILL_LIST.GRID', 'SSTA.ECAUTO_BILL_LIST.SEARCH_BAR'];
const customizeUnitCode = listUnitCodes.join();

const EcAutoBill = (props) => {
  const { tableDS } = props;
  const errorRecordDS = new DataSet(errorRecordDs());

  const tenantId = getCurrentOrganizationId();
  const { history, customizeTable } = props;
  // // 设置勾选ID
  // const [selectIds, setSelect] = React.useState([]);
  // 状态值集
  const [statusData, setStatusData] = React.useState({});
  // 权限集
  const [permsMap, setPermsMap] = React.useState(new Map());
  // 用来过滤页面渲染时筛选器初次查询
  const [initFlag, setInitFlag] = React.useState(true);
  const searchBarRef = useRef({});
  const loading = tableDS.status !== 'ready';

  React.useEffect(() => {
    fetchLov();
    getPermissionList();
  }, []);

  /**
   * 获取权限集数据
   */
  const getPermissionList = async () => {
    const data = await getPermissions([
      'srm.settle-account.reconciliation-workbench.bill-platform.ps.create',
      'srm.settle-account.reconciliation-workbench.bill-platform.ps.newimport',
      'srm.settle-account.reconciliation-workbench.bill-platform.ps.import',
      'srm.settle-account.reconciliation-workbench.bill-platform.ps.error',
    ]);
    if (data) {
      setPermsMap(data);
    }
  };
  /**
   * 查询费用单状态值集
   */
  const fetchLov = async () => {
    const data = await queryIdpValue('SSTA.AUTO_BILL_STATUS');
    if (data) {
      const newStatusData = {};
      data.forEach(({ value, tag }) => {
        newStatusData[value] = tag;
      });
      setStatusData(newStatusData);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: 'billStatusMeaning',
        width: 150,
        renderer: ({ value, record }) =>
          statusTagRender(value, statusData[record.get('billStatus')]),
      },
      {
        name: 'autoBillNum',
        width: 180,
        // renderer: ({ value, record }) => (
        //   <Link to={`/ssta/ec-auto-bill/detail/${record.get('autoBillId')}/readOnly`}>{value}</Link>
        // ),
      },
      {
        name: 'ecBillNum',
        width: 230,
        tooltip: 'overflow',
        renderer: ({ value, record }) => (
          <Link to={`/ssta/ec-auto-bill/detail/${record.get('autoBillId')}/readOnly`}>{value}</Link>
        ),
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'currencyCode',
        width: 150,
      },
      {
        name: 'ecBillDimension',
        width: 150,
      },

      {
        name: 'action',
        width: 150,
        renderer: ({ record }) => (
          <div>
            {[
              'NEW',
              'BILL_RETURN',
              'AUTO_BILL_FAIL',
              'RETURN_TO_EC_FAIl',
              'BILL_CONFIRM_FAIL',
              'AUTO_BILL_SUCCESS',
            ].includes(record.get('billStatus')) ? (
              <PermComponent
                permissionList={[
                  { code: 'srm.settle-account.reconciliation-workbench.bill-platform.ps.update' },
                ]}
              >
                <Link
                  style={{ marginRight: '8px' }}
                  to={`/ssta/ec-auto-bill/detail/${record.get('autoBillId')}/update`}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </Link>
              </PermComponent>
            ) : (
              '-'
            )}
          </div>
        ),
      },
    ],
    [statusData]
  );

  const errorColumns = useMemo(() => {
    return [
      {
        name: 'documentNum',
        width: 180,
      },
      {
        name: 'companyName',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 120,
      },
      {
        name: 'lastUpdateDate',
        width: 120,
      },
      {
        name: 'errorMsg',
        width: 180,
      },
    ];
  }, []);

  const handleCreate = () => {
    history.push({
      pathname: '/ssta/ec-auto-bill/detail/create',
    });
  };

  const handleErrorRecord = () => {
    errorRecordDS.setQueryParameter('documentType', 'EC_BILL');
    errorRecordDS.setQueryParameter('errorSourceType', 'EC_CREATE_BILL');
    errorRecordDS.query();
    Modal.open({
      drawer: true,
      key: Modal.key(),
      closable: true,
      title: intl.get('ssta.ecAutoBill.view.message.errors').d('错误记录'),
      className: Styles['ssta-large-modal'],
      children: (
        <div style={{ height: 'calc(100vh - 160px)' }}>
          <Table
            dataSet={errorRecordDS}
            columns={errorColumns}
            style={{ maxHeight: `calc(100% - 20px)` }}
          />
        </div>
      ),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  /**
   * 导出参数
   */
  const getQueryParams = () => {
    const queryData = tableDS.queryDataSet.current?.toData() || {};
    return filterNullValueObject({
      ...queryData,
      ...transformSupplierData(queryData.supplierCompanyId),
      customizeUnitCode,
    });
  };
  const getSelectedKeys = () => {
    const idsObj = {
      autoBillIdList: tableDS.selected.map((item) => item.toData().autoBillId).join(','),
    };

    return {
      ...idsObj,
      customizeUnitCode,
    };
  };

  /**
   * 筛选器查询回调
   */
  const handleQuery = ({ params }) => {
    tableDS.queryDataSet.loadData([params]);
    if (initFlag) {
      tableDS.query(tableDS.currentPage);
      setInitFlag(false);
    } else {
      tableDS.query();
    }
  };

  const headerBtns = () => {
    const allBtns = [
      permsMap.get(`srm.settle-account.reconciliation-workbench.bill-platform.ps.create`) && {
        name: 'create',
        child: intl.get('hzero.common.button.creation').d('创建'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'add',
          color: 'primary',
          onClick: () => handleCreate(),
          loading,
        },
      },
      permsMap.get(`srm.settle-account.reconciliation-workbench.bill-platform.ps.newimport`) && {
        name: 'newExport',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child:
          tableDS.selected.length === 0
            ? intl.get('ssta.common.button.newExport').d('新版导出')
            : intl.get('ssta.common.button.newSelectedExport').d('新版勾选导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          requestUrl: `/ssta/v1/${getCurrentOrganizationId()}/auto-bills/export`,
          queryParams: tableDS.selected.length === 0 ? getQueryParams : getSelectedKeys,
          templateCode: 'SSTA_AUTO_BILL_EXPORT',
        },
      },
      permsMap.get(`srm.settle-account.reconciliation-workbench.bill-platform.ps.import`) && {
        name: 'export',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        child:
          tableDS.selected.length === 0
            ? intl.get(`ssta.common.button.export`).d('导出')
            : intl.get(`ssta.common.button.selectedExport`).d('勾选导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          requestUrl: `/ssta/v1/${getCurrentOrganizationId()}/auto-bills/export`,
          queryParams: tableDS.selected.length === 0 ? getQueryParams : getSelectedKeys,
        },
      },
      permsMap.get(`srm.settle-account.reconciliation-workbench.bill-platform.ps.error`) && {
        name: 'error',
        child: intl.get('ssta.ecAutoBill.view.message.errors').d('错误记录'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'error_outline',
          funcType: 'flat',
          loading,
          onClick: () => handleErrorRecord(),
        },
      },
    ];
    return formatDynamicBtns(allBtns);
  };

  return (
    <Fragment>
      <Header title={intl.get(`ssta.ecAutoBill.view.title.billPlatform`).d('对账平台')}>
        <DynamicButtons maxNum={5} defaultBtnType="c7n-pro" buttons={headerBtns()} />
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 188px)' }}>
          {customizeTable(
            {
              code: 'SSTA.ECAUTO_BILL_LIST.GRID',
            },
            <SearchBarTable
              cacheState
              searchCode="SSTA.ECAUTO_BILL_LIST.SEARCH_BAR"
              columns={columns}
              dataSet={tableDS}
              // pagination={{ pageSizeOptions: ['20', '50', '100'] }}
              searchBarRef={(ref) => {
                searchBarRef.current = ref;
              }}
              searchBarConfig={{
                onQuery: handleQuery,
                // onFieldChange: handleFieldChange,
                fieldProps: {
                  supplierCompanyId: { lovPara: { tenantId } },
                  companyId: { lovPara: { tenantId } },
                  currencyCode: { lovPara: { organizationId: tenantId } },
                },
                // left: {
                //   render: (_, customizeDs) => (
                //     <MultiTextFilter
                //       name="autoBillNums"
                //       dataSet={customizeDs}
                //       placeholder={intl
                //         .get('ssta.ecAutoBill.modal.autoBillNum')
                //         .d('请输入对账记录编号查询')}
                //     />
                //   ),
                // },
              }}
              style={{ maxHeight: 'calc(100% - 22px)' }}
            />
          )}
        </div>
      </Content>
    </Fragment>
  );
};
export default compose(
  formatterCollections({
    code: ['ssta.ecAutoBill', 'hzero.c7nProU', 'hzero.c7nProUI', 'ssta.common'],
  }),
  withCustomize({
    unitCode: listUnitCodes,
  }),
  withProps(
    () => {
      const tableDS = new DataSet(tableDs());
      return { tableDS };
    },
    { cacheState: true }
  ),
  observer
)(EcAutoBill);
