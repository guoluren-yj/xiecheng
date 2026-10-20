import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import { Table, DataSet, useModal, CheckBox } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import FilterBarTable from '_components/FilterBarTable';

import { useModalOpen } from '@/hooks';
import { Store } from '../../StoreProvider';
import {
  amountHideInnerDS,
  amountHideOuterTableDS,
  amountHideOuterAllDS,
} from '@/stores/SettleStrategyDS';
import AllocateOrg from './AllocateOrg';
import { getSelectedNegActConfirmMsg } from '@/utils/utils';
import EditorForm from '@/routes/Components/EditorForm';

const commonPrompt = 'ssta.settleStrategy.model.settleStrategy';
const { TabPane } = Tabs;

export default observer(({ modal }) => {
  const { headerDs, editFlag, settleConfigId, platModalFlag, emitChangeModals } = useContext(Store);

  const [flag, setFlag] = useState(0);
  const [tabKey, setTabKey] = useState('inner');
  const selfModal = useModal();
  const modalOpen = useModalOpen(selfModal);

  const innerTableDS = useMemo(() => new DataSet(amountHideInnerDS(platModalFlag)), [
    platModalFlag,
  ]);

  const outerTableDS = useMemo(() => new DataSet(amountHideOuterTableDS(platModalFlag)), [
    platModalFlag,
  ]);
  const outerChangeDS = useMemo(() => new DataSet(amountHideOuterAllDS()), []);
  const outerTableEditFlag = editFlag && Number(flag) !== 1;

  useEffect(() => {
    innerTableDS.setQueryParameter('settleConfigId', settleConfigId);
    outerChangeDS.setQueryParameter('settleConfigId', settleConfigId);
    outerTableDS.setQueryParameter('settleConfigId', settleConfigId);
    innerTableDS.query();
    outerChangeDS.query().then((result) => {
      setFlag(result?.billPriceSupPriceShiledIncludeAll);
    });
    outerTableDS.query();
    modal.handleOk(handleSubmit);
    outerChangeDS.addEventListener('update', ({ name, value }) => {
      if (name === 'billPriceSupPriceShiledIncludeAll') {
        headerDs.current.set('billPriceSupPriceShiledIncludeAll', value);
        outerChangeDS.submit().then((res) => {
          if (res?.success) {
            headerDs.current.set('objectVersionNumber', res.content[0].objectVersionNumber);
            setFlag(value);
          }
        });
      }
    });
  }, [settleConfigId]);

  const onTabChange = (key) => {
    setTabKey(key);
  };

  const handleDeleteInner = useCallback(async () => {
    const res = await innerTableDS.delete(
      innerTableDS.selected,
      getSelectedNegActConfirmMsg('delete', innerTableDS)
    );
    if (!res) return;
    innerTableDS.query(undefined, undefined, true);
  }, [innerTableDS]);

  const handleDeleteOuter = useCallback(async () => {
    const res = await outerTableDS.delete(
      outerTableDS.selected,
      getSelectedNegActConfirmMsg('delete', outerTableDS)
    );
    if (!res) return;
    outerTableDS.query(undefined, undefined, true);
  }, [outerTableDS]);

  const handleEditInner = useCallback(
    (innerRecord) => {
      const shieldId = innerRecord.get('shieldId');
      if (shieldId) {
        innerRecord.set('selectRecords', []);
        modalOpen({
          editFlag,
          size: 'medium',
          title: intl.get(`${commonPrompt}.allocateOrg`).d('分配组织'),
          children: <AllocateOrg innerRecord={innerRecord} />,
        });
      } else {
        notification.warning({
          message: intl
            .get(`ssta.settleStrategy.view.settleStrategy.not.modifiable`)
            .d('未保存或发布的单据不可维护'),
        });
      }
    },
    [editFlag, modalOpen]
  );

  const handleSubmit = async () => {
    emitChangeModals('enableAmountHiddenFlag');
    for (const record of innerTableDS.records) {
      const initSelectRecords = record.get('initSelectRecords') || [];
      const selectRecords = record.get('selectRecords') || [];
      const choosedList = [];
      const cancelList = [];
      for (const item of initSelectRecords) {
        if (!selectRecords.find((_item) => _item.companyId === item.companyId)) {
          delete item.role;
          cancelList.push({ ...item, checkedFlag: 0 });
        }
      }
      for (const item of selectRecords) {
        if (!initSelectRecords.find((_item) => _item.companyId === item.companyId)) {
          delete item.role;
          choosedList.push({ ...item, checkedFlag: 1 });
        }
      }
      record.set('choosedList', choosedList);
      record.set('cancelList', cancelList);
      record.set('documentCategory', 'BILL');
    }
    const [innerVali, outerVali] = await Promise.all([
      innerTableDS.validate(),
      outerTableDS.validate(),
    ]);
    if (!innerVali || !outerVali) {
      setTabKey(innerVali ? 'outer' : 'inner');
      return false;
    }
    const [innerRes, outerRes] = await Promise.all([innerTableDS.submit(), outerTableDS.submit()]);
    if (innerRes?.success) {
      for (const record of innerTableDS.records) {
        if (innerRes.content.find((item) => item.shieldId === record.get('shieldId'))) {
          record.set('initSelectRecords', record.get('selectRecords'));
        }
      }
    }
    if (innerRes && outerRes) {
      innerTableDS.query();
      outerTableDS.query();
      notification.success();
      return true;
    } else if (innerRes) {
      innerTableDS.query();
      notification.success();
      return true;
    } else if (outerRes) {
      outerTableDS.query();
      notification.success();
      return true;
    }
    const { billPriceSupPriceShiledIncludeAll } = outerChangeDS.current?.toData();
    if (billPriceSupPriceShiledIncludeAll) {
      return true;
    }

    notification.error({
      message: intl
        .get(`${commonPrompt}.amount.hiding.error`)
        .d('结算策略保存失败，金额隐藏配置为是，请在定义详情中配置完整'),
    });
    return false;
  };

  const innerButtons = () => {
    if (editFlag) {
      return [
        'add',
        [
          'delete',
          {
            icon: 'delete_sweep',
            onClick: handleDeleteInner,
            children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
          },
        ],
      ];
    } else {
      return [];
    }
  };
  const innerColumns = useMemo(() => {
    return [
      { name: 'role', editor: editFlag },
      { name: 'roleCode', width: 120 },
      {
        name: 'detailedControlFlag',
        width: 80,
        editor: editFlag,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'allocateOrg',
        width: 100,
        renderer: ({ record }) =>
          record.get('detailedControlFlag') ? (
            <a onClick={() => handleEditInner(record)}>
              {editFlag
                ? intl.get(`${commonPrompt}.allocateOrg`).d('分配组织')
                : intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ) : null,
      },
    ];
  }, [editFlag, handleEditInner]);

  const outerColumns = useMemo(() => {
    return [
      {
        name: 'supplierCompany',
        editor: editFlag,
      },
      {
        name: 'supplierCompanyNumber',
        width: 350,
      },
    ];
  }, [editFlag]);

  const outerChangeEditorColumns = useMemo(() => {
    return [
      {
        name: 'billPriceSupPriceShiledIncludeAll',
        renderer: ({ value }) =>
          Number(value) === 1
            ? intl.get('hzero.common.button.yes').d('是')
            : intl.get('hzero.common.button.no').d('否'),
      },
    ];
  }, []);

  const outerButtons = () => {
    if (outerTableEditFlag) {
      return [
        'add',
        [
          'delete',
          {
            icon: 'delete_sweep',
            onClick: handleDeleteOuter,
            children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
          },
        ],
      ];
    } else {
      return [];
    }
  };

  return (
    <>
      <Tabs
        activeKey={tabKey}
        tabBarStyle={{ margin: '0 0 20px' }}
        onChange={onTabChange}
        animated={false}
      >
        <TabPane tab={intl.get(`${commonPrompt}.innerControl`).d('内部控制')} key="inner">
          <Table
            dataSet={innerTableDS}
            selectionMode={!editFlag ? 'none' : 'rowbox'}
            buttons={innerButtons()}
            columns={innerColumns}
            customizedCode="SSTA_STRATEGY_DETAIL.AMOUNT_HIDE_INNER"
            style={{ maxHeight: 'calc(100vh - 300px)' }}
          />
        </TabPane>
        <TabPane tab={intl.get(`${commonPrompt}.outerControl`).d('外部控制')} key="outer">
          <div style={{ marginBottom: 16 }}>
            {editFlag ? (
              <CheckBox name="billPriceSupPriceShiledIncludeAll" dataSet={outerChangeDS}>
                {outerChangeDS?.getField('billPriceSupPriceShiledIncludeAll')?.get('label')}
              </CheckBox>
            ) : (
              <EditorForm
                editorFlag={false}
                dataSet={outerChangeDS}
                editorColumns={outerChangeEditorColumns}
              />
            )}
          </div>
          <FilterBarTable
            dataSet={outerTableDS}
            selectionMode={!outerTableEditFlag ? 'none' : 'rowbox'}
            buttons={outerButtons()}
            columns={outerColumns}
            customizedCode="SSTA_STRATEGY_DETAIL.AMOUNT_HIDE_OUTER"
            style={{ maxHeight: 'calc(100vh - 250px)' }}
            filterBarConfig={
              editFlag
                ? { collpase: true, collpaseble: true, sortFieldName: 'orderField' }
                : { sortFieldName: 'orderField' }
            }
          />
        </TabPane>
      </Tabs>
    </>
  );
});
