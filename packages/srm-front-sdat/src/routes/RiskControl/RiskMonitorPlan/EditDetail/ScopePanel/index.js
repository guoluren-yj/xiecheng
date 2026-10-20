/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Form, Select, Table, Button, Modal } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';

import {
  // fetchDetailConfig,
  fetchRemoveScopeList,
} from '@/services/riskScanConfig/monitorConfigService';

import CompanyChooseModal from '../../CompanyChooseModal';

import styles from './index.less';

const companyChooseKey = Modal.key();

export default function ScopePanel({
  selectScopeListDS,
  companyLovDS,
  selectDS,
  monitorWorkbench,
  localId,
  dispatch,
  onFetch = () => {},
  // onCallBackToSave = () => {},
}) {
  const { monitorConfigDetail = {} } = monitorWorkbench || {};

  const [scope, setScope] = useState('');
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    return () => {
      selectScopeListDS.removeEventListener('select', selectEvent);
      selectScopeListDS.removeEventListener('unSelect', selectEvent);
      selectScopeListDS.removeEventListener('selectAll', selectEvent);
      selectScopeListDS.removeEventListener('unSelectAll', selectEvent);
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (selectScopeListDS) {
      selectScopeListDS.addEventListener('select', selectEvent);
      selectScopeListDS.addEventListener('unSelect', selectEvent);
      selectScopeListDS.addEventListener('selectAll', selectEvent);
      selectScopeListDS.addEventListener('unSelectAll', selectEvent);
    }
    if (localId && localId !== 'create') {
      getDetailData(localId);
    }
  }, [localId, selectScopeListDS]);

  const selectEvent = () => {
    setRefresh(true);
  };

  const getDetailData = async id => {
    const { scanScopeType: scopeType } = monitorConfigDetail;
    selectScopeListDS.setQueryParameter('riskPlanId', id);
    selectScopeListDS.setQueryParameter('scanScopeType', scopeType);
    selectScopeListDS.setQueryParameter('planContentType', 'basic');
    selectScopeListDS.setQueryParameter('planType', 'MONITOR');

    setLoading(true);
    onFetch(true);
    const res = await selectScopeListDS.query();
    onFetch(false);
    setLoading(false);

    if (getResponse(res)) {
      const { originData = {} } = res;
      const { scanScopeType = '' } = originData || {};

      selectDS.loadData([
        {
          scope: scanScopeType,
        },
      ]);

      setScope(scanScopeType);
      dispatch({
        type: 'monitorWorkbench/updateState',
        payload: {
          monitorConfigDetail: { ...monitorConfigDetail, ...originData },
        },
      });
    }
  };

  const handleChangeScope = value => {
    setScope(value);
  };

  const columns = () => {
    return [{ name: 'companyNum' }, { name: 'companyName' }, { name: 'socialCode' }];
  };

  /**
   * 打开选择公司的侧边弹窗
   */
  const openChooseModal = () => {
    let modal = null;
    const ids = selectScopeListDS.length
      ? selectScopeListDS.map(rcd => rcd.get('planScopeId') ?? rcd.get('companyId'))
      : [];

    const handleCloseModal = () => {
      if (modal) {
        companyLovDS.data = [];
        companyLovDS.reset();
        modal.close();
      }
    };

    const handleCreateItem = () => {
      if (companyLovDS.selected.length) {
        companyLovDS.selected.forEach(record => {
          const originData = selectScopeListDS.length
            ? selectScopeListDS.map(rcd => rcd.get('scopeObjectId'))
            : [];

          if (!originData.includes(record?.get('companyId'))) {
            selectScopeListDS.create(
              {
                companyName: record?.get('companyName') ?? '',
                companyNum: record?.get('companyNum') ?? '',
                scopeObjectId: record?.get('companyId') ?? '',
                socialCode: record?.get('socialCode') ?? '',
              },
              0
            );
          } else {
            const selectIds = companyLovDS.selected?.map(rcd => rcd.get('companyId')) ?? [];

            const removedList = selectScopeListDS.filter(
              rcd => !selectIds.includes(rcd.get('scopeObjectId'))
            );
            removedList.forEach(rcd => {
              selectScopeListDS.remove(rcd);
            });
          }
        });
        modal.close();
      } else {
        notification.warning({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl
            .get('sdat.riskScanConfig.view.message.mustSelectOneOrMore')
            .d('请至少选择一个公司'),
        });
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.riskScanConfig.view.title.chooseCompany').d('选择公司'),
      children: (
        <CompanyChooseModal companyLovDS={companyLovDS} selectedIds={ids} riskPlanId={localId} />
      ),
      key: companyChooseKey,
      closable: false,
      drawer: true,
      mask: true,
      resizable: true,
      style: { width: '860px' },
      header: null,
      footer: (
        <div>
          <Button color="primary" onClick={handleCreateItem}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const batchDeleteTypeList = () => {
    if (selectScopeListDS.selected.length) {
      const list = selectScopeListDS.selected
        ?.filter(rcd => rcd.get('planScopeId'))
        ?.map(rcd => rcd.toData());
      const localList = selectScopeListDS.selected?.filter(rcd => !rcd.get('planScopeId'));

      if (localList && localList.length) {
        selectScopeListDS.delete(localList, false);
      }

      if (list && list.length) {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm').d('提示'),
          children: (
            <div>
              {intl
                .get('sdat.riskScanConfig.view.message.deleteCompanyConfirm')
                .d('是否确认删除所选公司列表')}
            </div>
          ),
        }).then(button => {
          if (button === 'ok') {
            fetchRemoveScopeList({
              ...monitorConfigDetail,
              wb2RiskPlanScopeList: [...list],
            }).then(res => {
              if (getResponse(res)) {
                selectScopeListDS.loadData([]);
                notification.success();
                getDetailData(localId);
              }
            });
          }
        });
      }
    }
  };

  const buttons = () => {
    return [
      <Button icon="add" funcType="flat" onClick={openChooseModal}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button
        funcType="flat"
        disabled={!selectScopeListDS.selected.length}
        onClick={batchDeleteTypeList}
      >
        {intl.get('hzero.common.button.batchDelete').d('批量删除')}
      </Button>,
    ];
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['scan-config-scope-basic']}>
        <Form dataSet={selectDS} columns={3} labelLayout="float">
          <Select name="scope" onChange={handleChangeScope} />
        </Form>
        {scope === 'COMPANY' ? (
          <div style={{ height: 'calc(100vh - 510px)', marginTop: '16px' }}>
            <Table
              queryBar="none"
              dataSet={selectScopeListDS}
              columns={columns()}
              buttons={buttons()}
              autoHeight={{ type: 'maxHeight', diff: 40 }}
            />
          </div>
        ) : null}
      </div>
    </Spin>
  );
}
