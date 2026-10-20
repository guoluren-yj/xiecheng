/* eslint-disable no-param-reassign */
/**
 * 企业监控页面
 */
import React, { useEffect } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet, Table, Modal, Button } from 'choerodon-ui/pro';
import withProps from 'utils/withProps';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import notification from 'utils/notification';

import { getResponse } from '@/utils/utils';
import { fetchRemoveRecords, getRiskScanUrl } from '@/services/monitorOrgManagementService';

import {
  MonitorListDS,
  BusinessListDS,
  AddedBusinessListDS,
  getResultDetailDs,
} from './stores/monitorBusinessDS';
import BusinessAddModal from '../BusinessAddModal';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const param = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

const MonitorBusiness = props => {
  const { selectRecord = {}, setDs = () => {} } = props;
  const { listDS, businessListDS, addedListDS, resultDetailDs } = props.valueDs;

  const [refresh, setRefresh] = React.useState(false);

  // let allSearchBarRef = useRef(null);

  useEffect(() => {
    listDS.addEventListener('select', selectEvent);
    listDS.addEventListener('unSelect', selectEvent);
    listDS.addEventListener('selectAll', selectEvent);
    listDS.addEventListener('unSelectAll', selectEvent);
    return () => {
      listDS.removeEventListener('select', selectEvent);
      listDS.removeEventListener('unSelect', selectEvent);
      listDS.removeEventListener('selectAll', selectEvent);
      listDS.removeEventListener('unSelectAll', selectEvent);
    };
  }, []);

  useEffect(() => {
    if (selectRecord && selectRecord?.userId != null) {
      listDS.setQueryParameter('userId', selectRecord?.userId ?? '');
      listDS.query().then(() => {
        setDs(listDS?.queryDataSet?.toData()[0] ?? {});
      });
    }
  }, [selectRecord]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const selectEvent = () => {
    setRefresh(true);
  };

  /**
   * 风险扫描
   * @param {*} record
   */
  const handleScanRisk = record => {
    const keyWord = record?.get('enterpriseName') ?? '';
    getRiskScanUrl({
      keyWord,
      gatewayUrl: location?.origin ?? '',
      ...param,
    }).then(res => {
      if (res && res.success) {
        if (res && res.data) {
          window.open(res.data);
        }
      } else {
        notification.error({
          message: res?.msg ?? '',
        });
      }
    });
  };

  /**
   * 移除企业
   * @param {*} record
   */
  // const handleRemoveRisk = record => {
  //   const obj = { ...record.toData() };
  //   fetchRemoveItem({
  //     monitorList: [{ ...obj }],
  //     ...param,
  //   }).then(res => {
  //     if (getResponse(res)) {
  //       listDS.query().then(() => {
  //         setDs(listDS?.queryDataSet?.toData()[0] ?? {});
  //       });
  //     }
  //   });
  // };

  const columns = () => {
    return [
      {
        name: 'enterpriseName',
      },
      // {
      //   name: 'riskLevel',
      //   width: 120,
      //   renderer: ({ text, record }) => {
      //     const val = record.get('riskLevel');
      //     return val ? (
      //       <span className={`monitor-business-tag-basic ${switchMapClass[val]}`}>{text}</span>
      //     ) : null;
      //   },
      // },
      {
        name: 'socialCode',
      },
      {
        name: 'lastScanTime',
      },
      {
        name: 'expireDate',
      },
      {
        name: 'effectiveFlag',
        renderer: ({ value, record }) => {
          const classStr = value === 0 ? styles['tag-over-time'] : styles['tag-in-time'];
          return <span className={classStr}>{record?.get('effectiveFlagMeaning') ?? ''}</span>;
        },
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operation',
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <a onClick={() => handleScanRisk(record)}>
                {intl.get('sdat.monitorOrgManagement.view.button.riskScan').d('风险扫描')}
              </a>
              {/* <Popconfirm
                title={intl
                  .get('sdat.monitorOrgManagement.view.message.confirmRemoveBusiness')
                  .d('是否确认移除监控企业')}
                onConfirm={() => {
                  handleRemoveRisk(record);
                }}
                okText={intl.get('sdat.monitorOrgManagement.view.button.yes').d('是')}
                cancelText={intl.get('sdat.monitorOrgManagement.view.button.no').d('否')}
              >
                <a href="#">
                  {intl.get('sdat.monitorOrgManagement.view.button.removeBusiness').d('移除企业')}
                </a>
              </Popconfirm> */}
            </span>
          );
        },
      },
    ];
  };

  // const fieldProps = {};

  // const getFilters = () => {
  //   return { ...getQueryConfig() };
  // };

  const handleFilterQueryAll = ({ params }) => {
    listDS.queryDataSet.data = [
      {
        ...param,
        ...params,
      },
    ];
    if (selectRecord) {
      listDS.query().then(() => {
        setDs(listDS?.queryDataSet?.toData()[0] ?? {});
      });
    }
  };

  // const handleClear = () => {
  //   if (allSearchBarRef && allSearchBarRef.setField) {
  //     allSearchBarRef.setField('businessName', '');
  //     allSearchBarRef.setField('isErp', '');
  //     allSearchBarRef.setField('riskLevel', '');
  //     allSearchBarRef.setField('offerDate', '');
  //   }
  // };

  const handleBatchDelete = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <div>
          {intl
            .get('sdat.monitorBusiness.view.message.confirmRemoveBusiness')
            .d('是否确认移除监控企业')}
        </div>
      ),
    }).then(async button => {
      if (button === 'ok') {
        const list = listDS.selected.map(item => item.toData());
        fetchRemoveRecords({
          monitorList: list,
          userName: selectRecord?.userName,
        }).then(res => {
          if (getResponse(res)) {
            listDS.query();
          }
        });
      }
    });
  };

  /**
   * 打开添加企业弹窗
   */
  const openAddCompanyModal = () => {
    let modal = null;

    const handleCloseModal = () => {
      modal.close();
    };

    const addBusiness = () => {
      listDS.query();
    };

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.button.addMonitorBusiness').d('添加监控企业'),
      children: (
        <BusinessAddModal
          onAddBusiness={addBusiness}
          businessListDS={businessListDS}
          addedListDS={addedListDS}
          resultDetailDs={resultDetailDs}
          userRecord={selectRecord}
          onClose={handleCloseModal}
        />
      ),
      closable: true,
      drawer: true,
      mask: true,
      fullScreen: true,
      style: { width: '1000px' },
      footer: null,
    });
  };

  const buttons = () => {
    return [
      <Button
        icon="playlist_add"
        funcType="flat"
        disabled={!selectRecord}
        onClick={openAddCompanyModal}
      >
        {intl.get('sdat.monitorOrgManagement.view.button.addMonitorCompany').d('添加监控企业')}
      </Button>,
      <Button
        key="delete"
        funcType="flat"
        icon="delete_sweep"
        disabled={!listDS.selected.length}
        onClick={handleBatchDelete}
      >
        {intl.get('hzero.common.button.batchDelete').d('批量删除')}
      </Button>,
    ];
  };

  return (
    <div className={styles['monitor-business-basic']}>
      {/* <StaticSearchBar
        cacheState
        cacheKey="SDAT.CACHE.SUPPLIER_MONITOR_BUSINESS_STUFF_LIST"
        clearButton
        onRef={ref => {
          allSearchBarRef = ref;
        }}
        searchCode="SDAT.SUPPLIER_MONITOR_BUSINESS_LIST"
        filters={getFilters()}
        dataSet={[listDS]}
        onQuery={handleFilterQueryAll}
        onClear={handleClear}
        onReset={handleClear}
        showLoading={false}
        fieldProps={fieldProps}
        defaultExpand={false}
      /> */}
      <FilterBar
        dataSet={[listDS]}
        cacheState
        cacheKey="SDAT.CACHE.SUPPLIER_MONITOR_BUSINESS_STUFF_LIST"
        onQuery={handleFilterQueryAll}
        fields={[
          {
            name: 'enterpriseName',
            type: 'string',
            label: intl
              .get('sdat.monitorOrgManagement.model.businessName')
              .d('企业名称、统一社会信用代码'),
            display: false,
            merge: true,
          },
        ]}
      />
      <div className={styles['table-out-container-stuff']}>
        <Table
          dataSet={listDS}
          queryBar="none"
          columns={columns()}
          border={false}
          buttons={buttons()}
          autoHeight={{ type: 'maxHeight', diff: 40 }}
        />
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.monitorOrgManagement', 'sdat.common'],
})(
  withProps(
    () => {
      const listDS = new DataSet(MonitorListDS());
      const businessListDS = new DataSet(BusinessListDS());
      const addedListDS = new DataSet(AddedBusinessListDS()); // 已添加监控的企业
      const resultDetailDs = new DataSet(getResultDetailDs()); // 添加企业后的详情结果

      const valueDs = { listDS, businessListDS, addedListDS, resultDetailDs };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(MonitorBusiness)
);
