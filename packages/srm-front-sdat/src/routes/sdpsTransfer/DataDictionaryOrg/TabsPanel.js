import React, { useState } from 'react';
import { Table, Modal, TextField, Icon, Button } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import intl from 'utils/intl';
import Lov from '@/components/Lov';
import { getCurrentTenant } from 'utils/utils';

import MappingRelations from './MappingRelations';
import SubscriptionHistory from './SubscriptionHistory';
import LovListTable from './LovListTable';
import ERFigure from './ERFigure';
import IdpLovListTable from './IdpLovListTable';
import './index.less';

import sourceStore from './ERFigure/store.tsx';

const { tenantId: currentTenantId = 0 } = getCurrentTenant();
const { TabPane } = Tabs;
let searchKeyWord = '';

const TabsPanel = (props) => {
  const { listDS, subHistoryDS, localRecord = null, lovListDS, idpLovTableDS } = props; // radioValue

  const [refreshKey, setKey] = useState(0);
  const [currentKey, setCurrentKey] = useState('0');

  const { erExport = () => {} } = React.useContext(sourceStore)?.store ?? {};

  const columns = () => {
    return [
      {
        name: 'name',
        width: 200,
        renderer: ({ text, record }) => {
          const primaryFlag = record.get('primaryFlag');
          return (
            <div>
              <span>{text ? text.toLowerCase() : ''}</span>
              {primaryFlag ? <span className="primary-tag">PK</span> : null}
            </div>
          );
        },
      },
      { name: 'type' },
      { name: 'dataSize', width: 150 },
      { name: 'decimalDigits', width: 100 },
      {
        name: 'requiredFlag',
        width: 80,
        renderer: ({ text }) => {
          return text > 0 ? 'YES' : 'NO';
        },
      },
      { name: 'defaultValue' },
      { name: 'description' },
      { name: 'businessObjectFieldName' },
      {
        name: 'fieldLov',
        width: 100,
        renderer: ({ record }) => {
          const fieldLovNum = record?.getState('fieldLovNum') ?? undefined;
          const lovType = record?.get('lovType') ?? undefined;
          if (!fieldLovNum) return <></>;

          if (fieldLovNum === 'multiple') {
            return (
              <a
                onClick={() => {
                  handleOpenLovListModal(record?.get('lovId'));
                }}
              >
                {intl.get(`sdps.dataSheet.button.lovList`).d('视图列表')}
              </a>
            );
          }
          if (fieldLovNum === 'single') {
            const { tenantId, viewCode } = record?.getState('lovMessage') ?? {};
            return (
              <Lov
                code={viewCode}
                isButton
                originTenantId={tenantId}
                queryParams={{ tenantId }}
                // TODO: 使用了没有暴露的属性 prefixCls
                href={undefined}
                prefixCls=""
                style={{ color: '#29BECE', fontWeight: 'inherit', padding: '0' }}
                okButtonProps={{ style: { display: 'none' } }}
                cancelButtonProps={{ type: 'primary' }}
                cancelText={intl.get('sdps.dataSheet.view.option.ok').d('确定')}
                rowSelection={false}
                btnText={`${intl.get('sdps.dataSheet.view.option.preview').d('预览')} `}
              />
            );
          }
          if (fieldLovNum === 'zero' && lovType === 'IDP') {
            const lovId = record?.get('lovId') ?? '';
            return (
              <a
                onClick={() => {
                  handleOpenIdplovModal(lovId);
                }}
              >
                {intl.get('sdps.dataSheet.view.option.preview').d('预览')}
              </a>
            );
          }
        },
      },
    ];
  };

  const handleChangeTab = (e) => {
    setCurrentKey(e);
    setKey(e);
    if (e === '1') {
      listDS.query();
    }

    if (e === '3') {
      subHistoryDS.query();
    }
  };

  /**
   * handleOpenLovListModal: 打开值集视图列表的modal
   */
  const handleOpenLovListModal = (lovId) => {
    lovListDS.setQueryParameter('lovId', lovId);
    lovListDS.query();
    Modal.open({
      title: intl.get(`sdps.dataSheet.button.lovList`).d('视图列表'),
      children: <LovListTable lovListDS={lovListDS} />,
      footer: (okBtn) => okBtn,
      style: { width: '65%' },
      drawer: true,
    });
  };

  /**
   * handleOpenIdplovModal: 打开独立值集
   * @param {*} lovId
   */
  const handleOpenIdplovModal = (lovId) => {
    idpLovTableDS.setQueryParameter('tenantId', currentTenantId);
    idpLovTableDS.setQueryParameter('lovId', lovId);
    idpLovTableDS.query();
    // idpLovTableDS
    Modal.open({
      children: <IdpLovListTable idpLovTableDS={idpLovTableDS} />,
      footer: (okBtn) => okBtn,
      style: { width: '700px' },
    });
  };

  /**
   * handleSearch: 列属性页面查询
   */
  const handleSearch = () => {
    listDS.setQueryParameter('name', searchKeyWord);
    listDS.query();
  };

  return (
    <div className="tab-bar-style-org">
      <Tabs
        defaultActiveKey="1"
        onChange={handleChangeTab}
        tabBarExtraContent={
          currentKey === '4' && (
            <Button icon="export" onClick={erExport} color="primary" funcType="flat">
              {intl.get('sdps.dataSheet.view.button.exportERFigure').d('导出ER图')}
            </Button>
          )
        }
      >
        <TabPane
          tab={intl.get('sdps.dataDictionary.view.title.columnAttrbute').d('列属性')}
          key="1"
        >
          <div style={{ marginTop: '16px' }}>
            <TextField
              style={{ marginBottom: '16px', width: '30%' }}
              suffix={<Icon type="search" />}
              placeholder={intl
                .get('sdps.dataDictionary.columnTable.tip')
                .d('请输入列名、字段注释、业务描述查询')}
              clearButton
              value={searchKeyWord}
              onInput={(e) => {
                searchKeyWord = e?.target?.value?.trim() ?? '';
              }}
              onClear={() => {
                searchKeyWord = '';
                handleSearch();
              }}
              onEnterDown={() => handleSearch()}
            />
            <Table
              dataSet={listDS}
              queryBar="none"
              columns={columns()}
              customizable
              customizedCode="SDAT.DATA_DICTIONARY_COLUMNTABLE"
            />
          </div>
        </TabPane>
        <TabPane tab={intl.get('sdps.dataSheet.view.title.mappingRelations').d('映射关系')} key="2">
          <MappingRelations localRecord={localRecord} refreshFlag={refreshKey} />
        </TabPane>
        <TabPane tab={intl.get('sdps.dataSheet.view.title.ERFigure').d('ER图')} key="4">
          <ERFigure localRecord={localRecord} refreshKey={refreshKey} />
        </TabPane>
        <TabPane
          tab={intl.get('sdps.dataSheet.view.title.subscriptionHistory').d('订阅历史')}
          key="3"
        >
          <SubscriptionHistory dataSet={subHistoryDS} localRecord={localRecord} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TabsPanel;
