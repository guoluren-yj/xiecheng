import React, { useEffect, useState } from 'react';
import { Form, Output, Table } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { getMetaConfig } from '@/services/sdpsTransfer/dataSheetService';

import './index.less';

const { TabPane } = Tabs;
let lastFilterVal = null;

const DetailModal = (props) => {
  const { localRecord, formDS, columnPropDS, standarDS } = props;

  const [radioValue, setValue] = useState('');
  const [sqlValue, setSql] = useState('');
  const [showTenant, setShowTenant] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    formDS.addEventListener('load', loadEvent);

    return () => {
      formDS.removeEventListener('load', loadEvent);
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const loadEvent = ({ dataSet }) => {
    const bindTenantList = dataSet?.current?.get('bindTenantList') ?? [];
    const level = dataSet?.current?.get('level') ?? [];
    if (bindTenantList && bindTenantList.length) {
      const names = bindTenantList.map((item) => item.tenantName);
      const ids = bindTenantList.map((item) => item.tenantId);
      dataSet.current.set('tenantNames', names);
      dataSet.current.set('tenantIds', ids);
    }

    if (level === 'org') {
      setShowTenant(true);
      setRefresh(true);
    }
  };

  useEffect(() => {
    if (localRecord && localRecord.get('sourceTableId')) {
      formDS.queryParameter = { metaId: localRecord.get('sourceTableId') };
      columnPropDS.queryParameter = {
        metaId: localRecord.get('sourceTableId'),
        tableName: localRecord.get('sourceTableNum'),
      };

      getMetaConfig({
        metaId: localRecord.get('sourceTableId'),
      }).then((res) => {
        if (getResponse(res) && res) {
          // 保存上一次保存的筛选值
          lastFilterVal = { ...res };

          if (res.filterType === 1) {
            // 查询到过滤信息 进行回填
            setValue(2);
            setSql(res.filterCondition);
          }

          if (res.filterType === 0) {
            standarDS.create(
              {
                isIncludeZero: res.filterValue || '0',
                orgFilterTenant: res.filterCondition,
              },
              0
            );
            setSql(res.filterCondition);
            setValue(1);
          }
        }
      });
      formDS.query().then(() => {
        if (formDS.current) {
          formDS.current.set('topicName', lastFilterVal?.topicName ?? '');
          formDS.current.set('dataSourceType', 'MySQL');
        }
      });
      columnPropDS.query();
    }

    return () => {
      formDS.data = [];
      standarDS.data = [];
      columnPropDS.data = [];
    };
  }, [localRecord]);

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
        width: 80,
        align: 'left',
        renderer: ({ text }) => {
          return text > 0 ? 'YES' : 'NO';
        },
      },
      { name: 'defaultValue' },
      { name: 'description' },
      {
        name: 'businessObjectFieldName',
      },
    ];
  };

  return (
    <>
      <div className="card-title">
        {intl.get('sdps.dataSheet.view.title.technicalMetadata').d('技术元数据')}
      </div>
      <div style={{ marginTop: '16px' }}>
        <Form
          dataSet={formDS}
          columns={3}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          <Output name="name" />
          <Output name="description" />
          <Output name="tableType" />
          <Output name="schemaName" />
          <Output name="dataSourceType" />
          <Output name="charset" />
          <Output name="topicName" />
          <Output name="collation" />
          <Output
            name="level"
            // onChange={handleChangeLevel}
            renderer={({ text, value }) => {
              return (
                <span
                  style={{
                    color: value ? (value === 'org' ? '#F06200' : '#179454') : '',
                    background: value
                      ? value === 'org'
                        ? 'rgba(242,128,26,0.15)'
                        : 'rgba(71,184,131,0.15)'
                      : '',
                    borderRadius: '2px',
                    padding: '2px 5px',
                  }}
                >
                  {text}
                </span>
              );
            }}
          />
          {showTenant && (
            <>
              <Output name="tenantObj" />
            </>
          )}
          <Output
            name="defaultFlag"
            renderer={({ text, value }) => {
              return (
                <span
                  style={{
                    color: value ? ([0, '0'].includes(value) ? '#F06200' : '#179454') : '',
                    background: value
                      ? [0, '0'].includes(value)
                        ? 'rgba(242,128,26,0.15)'
                        : 'rgba(71,184,131,0.15)'
                      : '',
                    borderRadius: '2px',
                    padding: '2px 5px',
                  }}
                >
                  {text}
                </span>
              );
            }}
          />
        </Form>
      </div>
      <div className="card-title" style={{ marginTop: '32px' }}>
        {intl.get('sdps.dataSheet.view.title.dataStandard').d('数据标准')}
      </div>
      {radioValue === 2 && sqlValue && (
        <div style={{ margin: '16px 0 0 0' }}>
          {intl.get('sdps.dataSheet.view.title.searchSqlText').d('查询语句')}
        </div>
      )}
      <div style={{ marginTop: '8px' }}>
        {radioValue === 1 && sqlValue && (
          <Form
            dataSet={standarDS}
            columns={3}
            labelLayout="vertical"
            className="c7n-pro-vertical-form-display"
          >
            <Output name="orgFilterTenant" />
            <Output name="isIncludeZero" />
          </Form>
        )}
        {radioValue === 2 && sqlValue && <Output style={{ width: '560px' }} value={sqlValue} />}
        {((radioValue !== 2 && radioValue !== 1) || !sqlValue) && (
          <span>{intl.get('hzero.common.currency.none').d('无')}</span>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab={intl.get('sdps.dataSheet.view.title.columnProp').d('列属性')} key="1">
            <div>
              <Table
                queryBar="none"
                columns={columns()}
                dataSet={columnPropDS}
                customizable
                customizedCode="SDAT.DATASHEET_DATATABLE_ORG_COLUMNLIST"
              />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </>
  );
};

export default DetailModal;
