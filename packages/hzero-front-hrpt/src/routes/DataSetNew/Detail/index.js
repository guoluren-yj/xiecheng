/* eslint-disable react/jsx-key */
import React, { Fragment, useMemo, useCallback, useEffect, useState } from 'react';
import { Button, DataSet, Spin } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { isNil, omit } from 'lodash';
import { observable } from "mobx";
import { observer } from "mobx-react-lite";

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentUser, getCurrentLanguage } from 'utils/utils';
import notification from 'utils/notification';

import { createPrintDataSet, updatePrintDataSet } from '@/services/dataSetService';
import { getHeaderFormDs, getMetaDataTableDs, getParamsTableDs } from './store';
import DataSetHeader from './DataSetHeader';
import MetaData from './MetaData';
import Param from './Param';
import styles from './index.less';

const Detail = ({ match, history }) => {
  const [tabKey, setTabKey] = useState('header');
  const [approveNodeFlag, setApproveNodeFlag] = useState(false);
  const [isUrlDataSet, setIsUrlDataSet] = useState(false);
  const [isPlatform, setIsPlatform] = useState(true);
  const metaDataUpdate = useMemo(() => observable({ isInit: false }), []);
  const isCreate = useMemo(() => isNil(match.params.id), []);
  const formDs = useMemo(() => new DataSet(getHeaderFormDs(match.params.id)), []);
  const metaDataTableDs = useMemo(() => new DataSet(getMetaDataTableDs()), []);
  const paramsTableDs = useMemo(() => new DataSet(getParamsTableDs()), []);
  const isAdmin = useMemo(() => {
    const { loginName } = getCurrentUser() || {};
    return loginName === 'admin';
  }, []);
  const canEdit = useMemo(() => { 
    return isAdmin || !isPlatform || (window.$$env || {}).HRPT_ADD_FIELD === "true"
  }, [isAdmin, isPlatform]);
  useEffect(() => {
    if (!isCreate) {
      initData();
    }
  }, [isCreate, initData]);

  useEffect(() => {
    if (formDs) {
      formDs.addEventListener('update', handleFormDsUpdate);
    }
    return () => {
      if (formDs) {
        formDs.removeEventListener('update', handleFormDsUpdate);
      }
    }
  }, [formDs]);

  const handleFormDsUpdate = useCallback(({ name, value }) => {
    if (name === 'tenantId') {
      setIsPlatform(value && value.tenantId == 0);
    }
  }, []); 

  const initData = useCallback(() => {
    formDs.query().then((res) => {
      if (res) {
        const { datasetNodeList, datasetParamList, datasetType, tenantId } = res;
        const isUrl = datasetType === 'URL';
        setIsUrlDataSet(isUrl);
        setIsPlatform(tenantId === 0);
        if (datasetNodeList && datasetNodeList.length > 0) {
          setApproveNodeFlag(datasetNodeList.some(node => node.nodeCode === "XXXapprovalRecordRootXXX"));
          metaDataTableDs.loadData(transformNodeList(datasetNodeList, isUrl));
        }
        if (datasetParamList && datasetParamList.length > 0) {
          paramsTableDs.loadData(datasetParamList);
        }
      }
    });
  }, []);

  const handleSave = useCallback(async () => {
    const flag = await formDs.validate();
    if (!flag) {
      return;
    }
    const formData = omit(formDs.current.toData(), ['datasource']);
    if (formData && formData.datasetType === 'SCRIPT_SQL' && isNil(formData.limitCount)) {
      formData.limitCount = 10000;
    }
    if (isCreate) {
      const res = await createPrintDataSet(formData);
      if (getResponse(res)) {
        notification.success();
        history.replace({
          pathname: `/hrpt/print-dataset/detail/${res.datasetId}`,
        });
      }
    } else {
      const res = await updatePrintDataSet(formData);
      if (getResponse(res)) {
        notification.success();
        initData();
      }
    }
  }, [isCreate, initData]);

  const handleTabChange = useCallback((key) => {
    setTabKey(key);
  }, []);
  return (
    <Fragment>
      <Header
        backPath="/hrpt/print-dataset/list"
        title={
          isCreate
            ? intl.get('hrpt.reportDataSet.view.title.add').d('数据集 - 添加')
            : intl.get('hrpt.reportDataSet.view.title.edit').d('数据集 - 编辑')
        }
      >
        {canEdit && tabKey === 'header' && (
          <Button color="primary" icon="save" onClick={handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        )}
        {canEdit && tabKey === "metaData" && isUrlDataSet && metaDataUpdate.isInit && [
          <Button
            color="primary"
            icon="save"
            onClick={() => metaDataUpdate.handleBatchSave()}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>,
          metaDataUpdate.addFlag && (
            <Button
              color="default"
              icon="add"
              onClick={() => metaDataUpdate.handleAddNode()}
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
          )]
        }
      </Header>
      <Content wrapperClassName={styles['content-wrap']}>
        <Spin dataSet={formDs}>
          <Tabs onChange={handleTabChange} flex>
            <Tabs.TabPane
              key="header"
              tab={intl.get('hrpt.reportDataSet.view.title.dataSetHeader').d('数据集头')}
            >
              <DataSetHeader formDs={formDs} />
            </Tabs.TabPane>
            {!isCreate && (
              <>
                <Tabs.TabPane
                  key="metaData"
                  tab={intl.get('hrpt.reportDataSet.view.title.metaData').d('元数据')}
                >
                  <MetaData
                    formDs={formDs}
                    initData={initData}
                    isUrlDataSet={isUrlDataSet}
                    datasetId={match.params.id}
                    metaDataUpdate={metaDataUpdate}
                    metaDataTableDs={metaDataTableDs}
                    transformNodeList={transformNodeList}
                    approveNodeFlag={approveNodeFlag}
                    canEdit={canEdit}
                    isAdmin={isAdmin}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane
                  key="param"
                  tab={intl.get('hrpt.reportDataSet.view.title.param').d('参数')}
                >
                  <Param
                    formDs={formDs}
                    isUrlDataSet={isUrlDataSet}
                    datasetId={match.params.id}
                    paramsTableDs={paramsTableDs}
                  />
                </Tabs.TabPane>
              </>
            )}
          </Tabs>
        </Spin>
      </Content>
    </Fragment>
  );
};
const transformNodeList = (nodeList) => {
  const lang = getCurrentLanguage();
  if (!nodeList || !nodeList.length) {
    return [];
  }
  const data = [];
  nodeList.forEach((node) => {
    const { parentNodeUuid, nodeName, nodeUuid, nodeCode, datasetObjectList, parentNodeCode, config } = node;
    data.push({
      ...node,
      _id: nodeUuid,
      _type: nodeCode === "XXXapprovalRecordRootXXX" && 'approve' || parentNodeCode === "XXXapprovalRecordRootXXX" && "approveStage" || 'node',
      _name: nodeName,
      _code: nodeCode,
      _parentId: parentNodeUuid,
    });
    if (parentNodeCode === "XXXapprovalRecordRootXXX" && config) {
      const { stageExFields, detailExFields } = JSON.parse(config) || {};
      if (stageExFields && stageExFields.length) {
        stageExFields.forEach(field => {
          data.push({
            ...field,
            _id: `${nodeUuid}_${field.fieldCode}`,
            _type: 'approveStageExField',
            _name: (field._tls && field._tls.fieldName && field._tls.fieldName[lang]) || field.fieldName,
            _code: field.fieldCode,
            _parentId: nodeUuid,
          });
        });
      }
      if (detailExFields && detailExFields.length) {
        detailExFields.forEach(field => {
          data.push({
            ...field,
            _id: `${nodeUuid}_${field.fieldCode}`,
            _type: 'approveStageDetailExField',
            _name: (field._tls && field._tls.fieldName && field._tls.fieldName[lang]) || field.fieldName,
            _code: field.fieldCode,
            _parentId: nodeUuid,
          });
        });
      }
    }
    if (datasetObjectList && datasetObjectList.length > 0) {
      datasetObjectList.forEach((obj) => {
        const { nodeUuid: nUuid, objectUuid, objectCode, objectName, datasetFieldList } = obj;
        data.push({
          ...obj,
          _id: objectUuid,
          _parentId: nUuid,
          _type: 'obj',
          _code: objectCode,
          _name: objectName,
        });
        if (datasetFieldList && datasetFieldList.length > 0) {
          datasetFieldList.forEach((field) => {
            const { fieldUuid, fieldCode, fieldName } = field;
            data.push({
              ...field,
              _id: fieldUuid,
              _parentId: objectUuid,
              _type: 'field',
              _code: fieldCode,
              _name: fieldName,
            });
          });
        }
      });
    }
  });
  return data;
};
export default withRouter(
  formatterCollections({
    code: ['hrpt.reportDataSet', 'entity.tenant', 'hrpt.common', 'hrpt.reportDesign'],
  })(observer(Detail))
);
