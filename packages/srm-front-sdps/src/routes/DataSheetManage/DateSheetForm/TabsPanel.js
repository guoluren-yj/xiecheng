import React, { useState } from 'react';
import { Table, Modal, TextField, Icon, Button } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse, getCurrentTenant } from 'utils/utils';
import Lov from '@/components/Lov';

import { fetchUnBind } from '@/services/dataSheetService';

import MappingRelations from '../MappingRelations';
import SubscriptionHistory from '../SubscriptionHistory';
import LovListTable from './LovListTable';
import IdpLovListTable from './IdpLovListTable';
import ERFigure from './ERFigure';

import sourceStore from './ERFigure/store.tsx';
import './index.less';

const { TabPane } = Tabs;
const { tenantId: currentTenantId = 0 } = getCurrentTenant();
let searchKeyWord = '';

const TabsPanel = props => {
  const {
    columnPropDS,
    tenantSubscriDS,
    subHistoryDS,
    lovListDS,
    idpLovTableDS,
    localRecord = null,
  } = props; // radioValue

  const [inputVal, setInput] = useState('');
  const [refreshKey, setKey] = useState(0);
  const [currentKey, setCurrentKey] = useState(0);

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
              <span>{text ? text.toLowerCase() : '-'}</span>
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
        width: 100,
        align: 'left',
        renderer: ({ text }) => {
          return text > 0 ? 'YES' : 'NO';
        },
      },
      { name: 'defaultValue' },
      {
        name: 'description',
        editor: record => record.getState('editing'),
      },
      {
        name: 'businessObjectFieldName',
      },
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

  const tentantColumns = () => {
    return [
      {
        name: 'tenantNum',
        header: intl.get(`sdps.dataSheet.model.tenantNum`).d('租户编码'),
      },
      {
        name: 'tenantName',
        header: intl.get(`sdps.dataSheet.model.tenantName`).d('租户名称'),
      },
      {
        name: 'type',
        header: intl.get(`sdps.dataSheet.model.distributeorOrSubscribe`).d('分发/订阅'),
        renderer: ({ text, record }) => {
          const classes = record.get('type') === 'ALLOCATE' ? 'tag-allocate' : 'tag-subscribe';
          return text ? <span className={classes}>{text}</span> : '-';
        },
      },
      {
        name: 'submitDate',
        header: intl.get(`sdps.dataSheet.model.lastUpdateDate`).d('最后更新时间'),
      },
      {
        name: 'submitterName',
        header: intl.get(`sdps.dataSheet.model.operator`).d('操作人'),
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        renderer: ({ record }) => {
          return (
            <span>
              <a onClick={() => handleUnbind(record)}>
                {intl.get('hzero.common.button.remove').d('移除')}
              </a>
            </span>
          );
        },
      },
    ];
  };

  /**
   *解绑操作
   * @param {*} record
   */
  const handleUnbind = record => {
    Modal.confirm({
      title: intl.get('sdps.dataSheet.view.message.confirmUnbind').d('是否确认解绑？'),
      children: <></>,
    }).then(button => {
      if (button === 'ok') {
        unBindContinue(record);
      }
    });
  };

  /**
   * 解绑
   * @param {*} record
   */
  const unBindContinue = record => {
    if (record.get('dataTableId')) {
      const params = record.toData();
      fetchUnBind({
        dataTableId: record.get('dataTableId'),
        ...params,
        submitterName: params.submitter,
        submitter: '',
      }).then(res => {
        if (getResponse(res)) {
          tenantSubscriDS.query();
        }
      });
    }
  };

  /**
   * 输入查询条件
   */
  const handleInput = e => {
    setInput(e?.target?.value?.trim() ?? '');
  };

  /**
   * 清空查询条件
   */
  const handleClear = () => {
    setInput('');
    handleQuery('clear');
  };

  const handleQuery = type => {
    tenantSubscriDS.setQueryParameter('searchTerm', type === 'clear' ? '' : inputVal);
    tenantSubscriDS.query();
  };

  /**
   * 切换tab页重新查数据
   */
  const handleChangeTab = e => {
    setCurrentKey(e);

    if (e === '1') {
      columnPropDS.query();
    }

    if (e === '2') {
      setKey(refreshKey + 1);
    }

    if (e === '3') {
      tenantSubscriDS.query();
    }

    if (e === '4') {
      subHistoryDS.query();
    }

    if (e === '5') {
      setKey(refreshKey + 1);
    }
  };

  /**
   * handleOpenLovListModal: 打开值集视图列表的modal
   */
  const handleOpenLovListModal = lovId => {
    lovListDS.setQueryParameter('lovId', lovId);
    lovListDS.query();
    Modal.open({
      title: intl.get(`sdps.dataSheet.button.lovList`).d('视图列表'),
      children: <LovListTable lovListDS={lovListDS} />,
      footer: okBtn => okBtn,
      style: { width: '65%' },
      drawer: true,
    });
  };

  /**
   * handleOpenIdplovModal: 打开独立值集
   * @param {*} lovId
   */
  const handleOpenIdplovModal = lovId => {
    idpLovTableDS.setQueryParameter('tenantId', currentTenantId);
    idpLovTableDS.setQueryParameter('lovId', lovId);
    idpLovTableDS.query();
    // idpLovTableDS
    Modal.open({
      children: <IdpLovListTable idpLovTableDS={idpLovTableDS} />,
      footer: (okBtn, cancelBtn) => (
        <>
          {okBtn} {cancelBtn}
        </>
      ),
      style: { width: '700px' },
    });
  };

  /**
   * handleSearch: 列属性页面查询
   */
  const handleSearch = () => {
    columnPropDS.setQueryParameter('name', searchKeyWord);
    columnPropDS.query();
  };

  return (
    <div className="tab-bar-style">
      <Tabs
        defaultActiveKey="1"
        onChange={handleChangeTab}
        tabBarExtraContent={
          currentKey === '5' && (
            <Button
              icon="export"
              onClick={erExport}
              style={{ marginRight: '8px' }}
              color="primary"
              funcType="flat"
            >
              {intl.get('sdps.dataSheet.view.button.exportERFigure').d('导出ER图')}
            </Button>
          )
        }
      >
        <TabPane tab={intl.get('sdps.dataSheet.view.title.columnProp').d('列属性')} key="1">
          <div style={{ marginTop: '16px' }}>
            <TextField
              style={{ marginBottom: '16px', width: '30%' }}
              suffix={<Icon type="search" />}
              placeholder={intl
                .get('sdps.dataDictionary.columnTable.tip')
                .d('请输入列名、字段注释、业务描述查询')}
              clearButton
              value={searchKeyWord}
              onInput={e => {
                searchKeyWord = e?.target?.value?.trim() ?? '';
              }}
              onClear={() => {
                searchKeyWord = '';
                handleSearch();
              }}
              onEnterDown={() => handleSearch()}
            />
            <Table
              queryBar="none"
              columns={columns()}
              dataSet={columnPropDS}
              customizable
              customizedCode="SDPS.DATASHEET_DATATABLE_COLUMNTABLE"
            />
          </div>
        </TabPane>
        <TabPane tab={intl.get('sdps.dataSheet.view.title.mappingRelations').d('映射关系')} key="2">
          <MappingRelations localRecord={localRecord} refreshFlag={refreshKey} />
        </TabPane>
        <TabPane tab={intl.get('sdps.dataSheet.view.title.ERFigure').d('ER图')} key="5">
          <ERFigure localRecord={localRecord} refreshKey={refreshKey} />
        </TabPane>
        <TabPane tab={intl.get('sdps.dataSheet.view.title.subscripTenant').d('订阅租户')} key="3">
          <TextField
            placeholder={intl
              .get('sdps.dataSheet.view.title.tenantSearchHolder')
              .d('请输入租户编码、租户名称查询')}
            prefix={<Icon type="search" />}
            style={{ width: '280px', marginTop: '16px' }}
            clearButton
            value={inputVal}
            onInput={handleInput}
            onClear={handleClear}
            onEnterDown={handleQuery}
          />
          <div
            style={{
              marginTop: '16px',
            }}
          >
            <Table
              queryBar="none"
              columns={tentantColumns()}
              dataSet={tenantSubscriDS}
              customizable
              customizedCode="SDPS.DATASHEET_DATATABLE_TENTANTSUBSCRIP"
            />
          </div>
        </TabPane>
        <TabPane
          tab={intl.get('sdps.dataSheet.view.title.subscriptionHistory').d('操作历史')}
          key="4"
        >
          <SubscriptionHistory dataSet={subHistoryDS} localRecord={localRecord} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TabsPanel;
