import React, { useMemo, useEffect } from 'react';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { Table, DataSet, Button, Modal } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import { SRM_DATA_SDAT } from '@/utils/config';
import { getResponse } from '@/utils/utils';
import { fetchUpdateMap, fetchQuotaMsg } from '@/services/supplierBlacklistService';

import { MapListDS } from '../store/supplierBlackListDS';

import RiskMapModal from './RiskMapModal';
import styles from './index.less';

const Details = (props) => {
  const mapListDS = useMemo(() => new DataSet({ ...MapListDS() }), []);

  const { match } = props;

  const id = match?.params?.id;

  const [loading, setLoading] = React.useState(false);
  const [refresh, setRefresh] = React.useState(false);

  useEffect(() => {
    if (id) {
      mapListDS.setQueryParameter('dataId', id);
      mapListDS.query();
    }
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  /**
   * 查看详情
   */
  const handleView = (record) => {
    let modal;
    if (modal) {
      modal.close();
    }

    const handleCloseModal = () => {
      modal.close();
    };

    modal = Modal.open({
      title: intl.get('sdat.supplierBlacklistManage.view.title.mapDetails').d('图谱详情'),
      children: <RiskMapModal record={record} />,
      closable: true,
      drawer: true,
      style: { width: '1000px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
          <ExcelExportPro
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
            }}
            defaultSelectAll
            requestUrl={`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/supplier-blacklist/graph-export-data`}
            queryParams={{
              recordId: record?.get('recordId'),
              userId: getCurrentUser().id,
            }}
            buttonText={intl.get('hzero.common.button.confirm.export').d('导出')}
          />
        </div>
      ),
    });
  };

  const columns = () => {
    return [
      {
        name: 'content',
        renderer: ({ record }) => {
          const str = record?.get('content') ?? '';
          const list = str ? str.split(';') : [];
          return list && list.length ? (
            <>
              {list.map((item, index) => {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={index} style={{ lineHeight: '18px' }}>
                    {item}
                  </div>
                );
              })}
            </>
          ) : (
            '-'
          );
        },
      },
      { name: 'graphUpdateTime', width: 180 },
      { name: 'graphEndTime', width: 180 },
      { name: 'updateType', width: 120 },
      {
        name: 'operation',
        width: 100,
        header: intl.get('hzero.common.button.operator').d('操作'),
        renderer: ({ record }) => {
          return (
            <a onClick={() => handleView(record)}>
              {intl.get('sdat.monitorBusiness.view.button.viewDetail').d('查看详情')}
            </a>
          );
        },
      },
    ];
  };

  /**
   * 更新图谱
   */
  const handleUpdateMap = () => {
    setLoading(true);
    setRefresh(true);
    fetchQuotaMsg({ dataId: id, userId: getCurrentUser().id }).then((quotaMsg) => {
      if ([0, '0'].includes(quotaMsg)) {
        setLoading(false);
        setRefresh(true);
        Modal.info({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <>
              {intl
                .get('sdat.supplierBlacklistManage.view.message.noQuota')
                .d('尊敬的客户，您当前使用的服务未开通或余额不足，请联系客户经理进行处理')}
            </>
          ),
        });
      } else if (getResponse(quotaMsg) && Number(quotaMsg) > 0) {
        Modal.confirm({
          title: intl
            .get('sdat.supplierBlacklistManage.message.confirm.confirmQuota')
            .d('确认额度'),
          children: (
            <div>
              {intl.get('sdat.supplierBlacklistManage.message.confirm.thisCost').d('本次消费')}
              <span style={{ color: '#00B8CC' }}>1</span>
              {intl
                .get('sdat.supplierBlacklistManage.message.confirm.centerMsg')
                .d(' 额度，订单目前剩余额度 ')}
              <span style={{ color: '#00B8CC' }}>{quotaMsg || 0}</span>
              {intl
                .get('sdat.supplierBlacklistManage.message.confirm.confirmDeduct')
                .d('请确认是否扣除额度更新图谱？')}
            </div>
          ),
        }).then((e) => {
          if (e === 'ok') {
            fetchUpdateMap({
              dataId: id,
              userId: getCurrentUser().id,
              tenantId: getCurrentOrganizationId(),
            }).then((res) => {
              setLoading(false);
              setRefresh(true);
              if (getResponse(res)) {
                mapListDS.query();
              }
            });
          } else {
            setLoading(false);
            setRefresh(true);
          }
        });
      }
    });
  };

  return (
    <div className={styles['black-list-basic-panel']}>
      <Header
        title={intl
          .get('sdat.supplierBlacklistManage.view.title.viewBusinessMap')
          .d('查看企业图谱')}
        backPath="/sdat/supplier-blacklist-manage/list"
      >
        <Button color="primary" icon="sync" onClick={handleUpdateMap} loading={loading}>
          {intl.get('sdat.monitorBusiness.view.button.updateMap').d('更新图谱')}
        </Button>

        <ExcelExportPro
          otherButtonProps={{
            icon: 'unarchive',
            type: 'c7n-pro',
            style: { border: 'none' },
          }}
          defaultSelectAll
          requestUrl={`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/supplier-blacklist/graph-record-export`}
          queryParams={{
            dataId: id,
            userId: getCurrentUser().id,
          }}
          buttonText={intl.get('hzero.common.button.confirm.export').d('导出')}
        />
      </Header>
      <Content style={{ margin: '8px' }}>
        <div style={{ height: 'calc(100vh - 180px)' }}>
          <Table
            dataSet={mapListDS}
            columns={columns()}
            queryBar="none"
            autoHeight={{ type: 'maxHeight', diff: 40 }}
          />
        </div>
      </Content>
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.supplierBlacklistManage', 'sdat.monitorBusiness'],
})(Details);
