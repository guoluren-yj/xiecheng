/**
 * 数据表 数据详情页面
 */
import React, { useEffect, useState } from 'react';
import {
  Form,
  DataSet,
  Output,
  Button,
  TextArea,
  Lov,
  Select,
  Modal,
  IntlField,
} from 'choerodon-ui/pro';
import { Radio } from 'choerodon-ui';
import intl from 'utils/intl';
// import _ from 'lodash';
import { getResponse } from 'utils/utils'; // filterNullValueObject
import notification from 'utils/notification';
import { SourceManagerProvider } from './ERFigure/store.tsx';

import {
  fatchSaveConfig,
  getMetaConfig,
  fetchAllocateTenants,
  fetchSaveTableDesc,
  getCollecStatus,
} from '@/services/dataSheetService';

import { TenantSubscripDS } from '../stores/commonDS';

import TabsPanel from './TabsPanel';
import TenantLovModal from './TenantLovModal';
import './index.less';

const RadioGroup = Radio.Group;

const tenantSubscriDS = new DataSet({ ...TenantSubscripDS() });

let lastFilterVal = null;
let continueKey = 1;

const DateSheetForm = (props) => {
  const {
    localRecord = null,
    lovDS,
    formDS,
    columnPropDS,
    standarDS,
    subHistoryDS,
    topicLovDS,
    lovListDS,
    idpLovTableDS,
    openPending = () => {},
    fetchSyncStatus = () => {},
  } = props;

  const [radioValue, setValue] = useState('');
  const [sqlValue, setSql] = useState('');
  const [saveLoading, setLoading] = useState(false);
  const [isCanEdit, setEditFlag] = useState(false);
  const [showLov, setShow] = useState(false);

  // const distribRef = useRef(null);

  useEffect(() => {
    setEditFlag(false);
    if (localRecord && localRecord.metaId) {
      formDS.queryParameter = { metaId: localRecord.metaId || '' };
      columnPropDS.queryParameter = {
        metaId: localRecord.metaId || '',
        tableName: localRecord.tableName || '',
        sort: 'lastUpdateDate,desc',
      };
      tenantSubscriDS.queryParameter = {
        sourceTableId: localRecord.metaId || '',
        sort: 'lastUpdateDate,desc',
      };
      subHistoryDS.queryParameter = {
        sourceTableId: localRecord.metaId || '',
        sort: 'lastUpdateDate,desc',
      };

      formDS.query().then(() => {
        if (formDS.current) {
          formDS.current.set('topicName', lastFilterVal?.topicName ?? '');
          formDS.current.set('dataSourceType', 'MySQL');
        }
      });
      columnPropDS.query();
      subHistoryDS.query();
      tenantSubscriDS.query();
      getFilterData();
    }

    return () => {
      formDS.data = [];
      standarDS.data = [];
      columnPropDS.data = [];
      subHistoryDS.data = [];
      tenantSubscriDS.data = [];
      lovDS.data = [];
      columnPropDS.reset();
      setSql('');
      setValue('');
      lastFilterVal = {};
      continueKey = 1;
    };
  }, [localRecord]);

  /**
   * 获取过滤数据信息
   * @param {*} sourceTableId
   */
  const getFilterData = () => {
    getMetaConfig({ metaId: localRecord.metaId || '' }).then((res) => {
      standarDS.data = [
        {
          sourceTableId: localRecord.metaId,
          isIncludeZero: '0',
          tableName: localRecord.tableName,
        },
      ];

      if (getResponse(res)) {
        // 保存上一次保存的筛选值
        lastFilterVal = { ...res };

        if (formDS.current) {
          formDS.current.set('topicName', res.topicName || '');
        }

        if (res.filterType === 1) {
          // 查询到过滤信息 进行回填
          setValue(2);
          setSql(res.filterCondition);
        }

        if (res.filterType === 0) {
          standarDS.data = [
            {
              sourceTableId: localRecord.metaId,
              isIncludeZero: res.filterValue || '0',
              mapFields: res.filterCondition,
            },
          ];
          setValue(1);
        }
      }
    });
  };

  /**
   * 批量分发数据
   */
  const handleDistrib = (params) => {
    if (params.length && continueKey) {
      continueKey = 0;
      const ids = params.map((item) => item.tenantId);
      const param = {
        allocateTenantList: ids,
        sourceTableId: localRecord.metaId,
      };

      fetchAllocateTenants(param).then((res) => {
        continueKey = 1;
        if (getResponse(res)) {
          notification.success();
          tenantSubscriDS.query();
          subHistoryDS.query();
          lovDS.data = [];
          lovDS.reset();
          setShow(false);
        } else {
          lovDS.queryParameter = {
            sourceTableId: localRecord.metaId,
            tableName: localRecord.tableName,
          };
          lovDS.query();
          return false;
        }
      });
    } else {
      return false;
    }
  };

  /**
   * 保存数据
   */
  const handleSave = async () => {
    setTimeout(() => {
      setLoading(true);
    }, 0);
    let standarObj = {};

    if (radioValue === 1) {
      standarObj = {
        ...lastFilterVal,
        filterCondition: standarDS.current.get('mapFields') || '',
        filterType: 0,
        filterValue: standarDS.current.get('isIncludeZero') || '0',
        sourceTableId: localRecord.metaId,
      };
    }

    if (radioValue === 2) {
      standarObj = {
        ...lastFilterVal,
        filterCondition: sqlValue || '',
        filterType: 1,
        filterValue: '',
        sourceTableId: localRecord.metaId,
      };
    }

    Modal.confirm({
      title: intl.get('sdps.dataSheet.view.message.confirmSave').d('是否确认保存？'),
      children: <></>,
    }).then((button) => {
      if (button === 'ok') {
        handleSaveContinue(standarObj);
      } else {
        setTimeout(() => {
          setLoading(false);
        }, 0);
      }
    });
  };

  const handleSaveContinue = (params) => {
    if (!radioValue) {
      handleSaveDesc();
    }

    if (radioValue === 1) {
      fatchSaveConfig({
        ...params,
        sourceTableId: localRecord.metaId,
      }).then((res) => {
        setTimeout(() => {
          setLoading(false);
        }, 0);
        if (
          res.failed &&
          res.code === 'sdps.data.collection.is.being.performed.in.the.background'
        ) {
          // 正在执行
          openPendingMotion();
          return;
        }
        if (getResponse(res)) {
          setSql('');
          getFilterData();
          handleSaveDesc();
        }
      });
    }

    if (radioValue === 2) {
      fatchSaveConfig({
        ...params,
        sourceTableId: localRecord.metaId,
      }).then((res) => {
        setTimeout(() => {
          setLoading(false);
        }, 0);
        if (
          res.failed &&
          res.code === 'sdps.data.collection.is.being.performed.in.the.background'
        ) {
          // 正在执行
          openPendingMotion();
          return;
        }
        if (getResponse(res)) {
          notification.success();
          standarDS.data = [];
          standarDS.reset();
          getFilterData();
          handleSaveDesc();
        }
      });
    }
  };

  const handleSaveDesc = () => {
    const formData = formDS?.current?.toData() ?? {};
    const editList = columnPropDS.filter(
      (record) => record.status === 'add' || record.status === 'update'
    );

    const list = editList.map((item) => item.toData());

    if (!formData.description) {
      formData._tls = {
        description: {
          en_US: '',
          ja_JP: '',
          vi_VN: '',
          th_TH: '',
          ru_RU: '',
        },
      };
    }

    // 保存表描述信息
    fetchSaveTableDesc({
      ...formData,
      metaColumns: list,
      description: formData?.description ?? '',
    }).then((result) => {
      setLoading(false);

      if (
        result.failed &&
        result.code === 'sdps.data.collection.is.being.performed.in.the.background'
      ) {
        // 正在执行
        openPendingMotion();
        return;
      }
      if (getResponse(result)) {
        setEditFlag(false);
        formDS.query().then(() => {
          if (formDS.current) {
            formDS.current.set('topicName', lastFilterVal?.topicName ?? '');
            formDS.current.set('dataSourceType', 'MySQL');
          }
        });
        columnPropDS.query();
      }
    });
  };

  const changeRadio = (e) => {
    const radioStr = e.target.value;
    setValue(radioStr);
  };

  /**
   * 输入sql语句
   * @param {*} e
   */
  const handleInputSql = (e) => {
    const sqlStr = e?.target?.value?.trim() ?? '';
    setSql(sqlStr);
  };

  /**
   * 编辑操作
   */
  const handleEdit = async () => {
    const result = await getCollecStatus();

    if (getResponse(result)) {
      const collectStatus = result?.status ?? 1;
      if (collectStatus === 0 || collectStatus === '0') {
        // 正在执行
        openPendingMotion();
        return;
      }
    }

    setEditFlag(true);
    columnPropDS.forEach((record) => {
      record.setState('editing', true);
    });
  };

  /**
   * 取消编辑操作
   */
  const handleCancel = () => {
    setEditFlag(false);
    columnPropDS.forEach((record) => {
      record.setState('editing', false);
    });
  };

  /**
   * 正在执行中弹窗
   */
  const openPendingMotion = () => {
    openPending();
    fetchSyncStatus();
  };

  const handleOpenDistribLov = async () => {
    const result = await getCollecStatus();

    if (getResponse(result)) {
      const collectStatus = result?.status ?? 1;
      if (collectStatus === 0 || collectStatus === '0') {
        // 正在执行
        openPendingMotion();
        return;
      }
    }

    setShow(true);
  };

  const FieldType = isCanEdit ? IntlField : Output;

  const tenantProps = {
    lovDS,
    visible: showLov,
    onSelect: handleDistrib,
    localRecord,
    onCancel: () => {
      setShow(false);
    },
  };

  return (
    <SourceManagerProvider>
      <div className="card-title-header">
        <div className="header-title">
          {intl.get('sdps.dataSheet.view.title.dataDetail').d('数据详情')}
        </div>
        {localRecord && localRecord.metaId && (
          <div className="header-btn-group">
            {!isCanEdit && (
              <Button onClick={handleEdit}>{intl.get('hzero.common.button.edit').d('编辑')}</Button>
            )}
            {isCanEdit && (
              <Button onClick={handleCancel}>
                {intl.get('hzero.common.btn.cancel').d('取消')}
              </Button>
            )}
            {isCanEdit && (
              <Button color="primary" onClick={handleSave} loading={saveLoading}>
                {intl.get('hzero.common.btn.save').d('保存')}
              </Button>
            )}
            {!isCanEdit ? (
              <Button color="primary" onClick={handleOpenDistribLov}>
                {intl.get('sdps.dataSheet.view.btn.distribution').d('分发')}
              </Button>
            ) : null}
          </div>
        )}
      </div>
      <div className="card-scroll-panel">
        <div className="card-title" style={{ marginTop: '16px' }}>
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
            <FieldType name="description" />
            <Output name="tableType" />
            <Output name="schemaName" />
            <Output name="dataSourceType" />
            <Output name="charset" />
            <Output name="collation" />
            <Output name="topicName" />
          </Form>
        </div>

        <div className="card-title" style={{ marginTop: '32px' }}>
          {intl.get('sdps.dataSheet.view.title.dataStandard').d('数据标准')}
        </div>
        <div style={{ marginTop: '16px' }}>
          {(radioValue || isCanEdit) && (
            <>
              <div style={{ color: 'rgba(0,0,0,0.45)' }}>
                {intl.get(`sdps.dataSheet.model.orgFilterTenant`).d('租户过滤tenant_id')}
              </div>
              <div style={{ margin: '4px 0 16px 0' }}>
                <RadioGroup
                  disabled={!isCanEdit}
                  label=""
                  onChange={changeRadio}
                  value={radioValue}
                >
                  <Radio value={1}>
                    {intl.get('sdps.dataSheet.view.title.selectMapFields').d('选择映射字段')}
                  </Radio>
                  <Radio value={2}>
                    {intl.get('sdps.dataSheet.view.title.inputSearchText').d('输入查询语句')}
                  </Radio>
                </RadioGroup>
              </div>
            </>
          )}
          <div>
            {!radioValue && !isCanEdit && (
              <div>{intl.get('hzero.common.currency.none').d('无')}</div>
            )}

            {radioValue === 1 && (
              <Form dataSet={standarDS} columns={3} labelLayout="float">
                <Lov
                  name="mapObj"
                  viewMode="drawer"
                  clearButton
                  searchable
                  placeholder={intl
                    .get('sdps.dataSheet.view.title.selectMapFields')
                    .d('选择映射字段')}
                  disabled={!isCanEdit}
                />
                <Select name="isIncludeZero" disabled={!isCanEdit} />
              </Form>
            )}
            {radioValue === 2 && (
              <TextArea
                style={{ width: '560px' }}
                value={sqlValue}
                maxLength={255}
                rows={3}
                resize="horizontal"
                onInput={handleInputSql}
                disabled={!isCanEdit}
              />
            )}
          </div>
        </div>

        <div style={{ marginTop: '32px' }}>
          <TabsPanel
            localRecord={localRecord}
            tenantSubscriDS={tenantSubscriDS}
            columnPropDS={columnPropDS}
            subHistoryDS={subHistoryDS}
            radioValue={radioValue}
            topicLovDS={topicLovDS}
            lovListDS={lovListDS}
            idpLovTableDS={idpLovTableDS}
          />
        </div>

        {showLov && <TenantLovModal {...tenantProps} />}
      </div>
    </SourceManagerProvider>
  );
};

export default DateSheetForm;
