/*
 * @Descripttion: 业务对象详情
 * @Date: 2021-08-09 09:33:55
 * @Author: ZHIJIAN.XU@HAND-CHINA.COM
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Header } from 'hzero-front/lib/components/Page';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { isNull } from 'lodash';
import { Button, DataSet, Modal } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { getResponse, isTenantRoleLevel, getCurrentUser } from 'hzero-front/lib/utils/utils';
import withProps from 'hzero-front/lib/utils/withProps';
import notification from 'hzero-front/lib/utils/notification';
import { getOBTabFlag } from '@/services/businessObjectService';
import BusinessObjectDataSet from '@/stores/BusinessObject/BusinessObjectDS';

// import { pageDs } from '@/stores/BusinessObject/PageDS';
// import { buttonDs } from '@/stores/BusinessObject/ButtonDS';
import { ruleDs } from '@/stores/BusinessObject/RulesDS';
import { tableDs } from '@/stores/BusinessObject/OptionListDS';
import advancedListDS from '@/stores/BusinessObject/AdvancedDS';
import ImgIcon from '@/utils/ImgIcon';
import { SourceType, PublishStatus } from '@/businessGlobalData/common';
import { usePublicBusinessObjects } from '@/routes/Hooks';

import BaseInfo from '../../BusinessObject/Detail/BasicInfo';
import FieldList from '../../BusinessObject/Detail/FieldsList';
// import TriggerList from './TriggerList';
// import Pages from './Pages';
// import Buttons from './Buttons';
// import EventFlow from './EventFlow';
import ExportTemplate from '../../BusinessObject/Detail/ExportTemplate';
import ImportTemplate from '../../BusinessObject/Detail/ImportTemplate';
import { ExportTemplateDS } from '@/stores/BusinessObject/ExportTemplateDS';
import { ImportTemplateDS } from '@/stores/BusinessObject/ImportTemplateDS';
import { tableRefresh } from '@/services/modelBaseService';
import styles from './index.less';
import AdvancedRelationship from './AdvancedRelationship';
import sourceStore from '../store';

const { TabPane } = Tabs;

const store = {
  dataMap: new Map(),
  getItem: key => store.dataMap.get(key),
  setItem: (key, value) => {
    store.dataMap.set(key, value);
  },
  delete: key => {
    store.dataMap.delete(key);
  },
};

const isTenant = isTenantRoleLevel();
// 业务对象详情
const BODetail = props => {
  const { id: businessObjectId } = props.match.params;
  const {
    location: { state: { originKey = '' } = {} },
    tabKeyDs,
  } = props;
  const { loginName } = getCurrentUser() || {};
  const isAdmin = loginName === 'admin';
  const allowEdit = isAdmin || isTenant || (window.$$env || {}).HMDE_ADD_FIELD === "true";
  const advanceRelationRef: any = useRef();
  const [activeKey, setActiveKey] = useState<string>((tabKeyDs && tabKeyDs.getState('tabKey')) || 'fieldList');
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [hasHlodModuleFlag, setHasHlodModuleFlag] = useState(false); // 如果 hlod 模块没有安装，一些 Tab 页面的内容需要隐藏
  const [showImportTemplate, setShowImportTemplate] = useState(false);
  const [showExportTemplate, setShowExportTemplate] = useState(false);
  const baseInfoDS = useMemo(
    () => new DataSet(BusinessObjectDataSet({ boId: businessObjectId, isEdit: true })),
    [businessObjectId]
  );
  const exportDS: DataSet = useMemo(() => new DataSet(ExportTemplateDS(false) as DataSetProps), []);
  const importDS: DataSet = useMemo(
    () => new DataSet(ImportTemplateDS(businessObjectId, false) as DataSetProps),
    []
  );
  // const buttonDS: DataSet = useMemo(() => new DataSet(buttonDs() as DataSetProps), []);
  const rulesDS: DataSet = useMemo(() => new DataSet(ruleDs() as DataSetProps), []);

  const objectVersionNumber = baseInfoDS?.current?.get('objectVersionNumber');
  const token = baseInfoDS?.current?.get('_token');
  const domainId = baseInfoDS?.current?.get('domainId');
  const businessObjectCode = baseInfoDS?.current?.get('businessObjectCode');
  const domainCode = baseInfoDS?.current?.get('domainCode');
  const objectTenantId = baseInfoDS?.current?.get('tenantId');
  const publishStatus = baseInfoDS?.current?.get('publishStatus');
  const sourceType = baseInfoDS?.current?.get('sourceType');
  const { permissionFlag, queryPermission } = React.useContext<any>(sourceStore as any).store;

  // const pageDS: DataSet = useMemo(() => new DataSet(pageDs(businessObjectCode) as DataSetProps), [
  //   businessObjectCode,
  // ]);
  // 高级关系菜单列表ds
  const listDs = useMemo(() => new DataSet(advancedListDS(businessObjectCode)), [
    businessObjectCode,
  ]);
  // 值列表ds
  const optionsListDs = useMemo(
    () => new DataSet(businessObjectCode ? tableDs(businessObjectCode) : {}),
    [businessObjectCode]
  );

  // 在本地开发调试的时候可以使用，到了线上，会自己执行正确的逻辑
  useEffect(() => {
    // if (window.location.hostname === 'localhost') {
    //   setTimeout(() => {
    //     setHasHlodModuleFlag(true);
    //   });
    // }
    initImportTemplate();
    initExportTemplate();
    if (!isTenant) {
      if (isNull(permissionFlag)) {
        queryPermission();
      }
      getOBTabFlag().then(res => {
        if (res && !res.failed) {
          const isHzeroLowcode = res.content.find(item => item.serviceCode === 'hzero-lowcode');
          if (isHzeroLowcode) {
            setHasHlodModuleFlag(true);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    rulesDS.setState('businessObjectCode', businessObjectCode);
  }, [businessObjectCode]);
  const listRef = useRef();

  useEffect(() => {
    if (originKey) {
      setActiveKey(originKey);
    }
  }, [originKey]);

  const initImportTemplate = () => {
    importDS.query().then(res => {
      if (getResponse(res) && res && res.content && res.content.length) {
        setShowImportTemplate(true);
      }
    });
  };

  const initExportTemplate = () => {
    exportDS.setQueryParameter('businessObjectId', businessObjectId);
    exportDS.query().then(res => {
      if (getResponse(res) && res && res.content && res.content.length) {
        setShowExportTemplate(true);
      }
    });
  };

  const { handlePublicObject } = usePublicBusinessObjects({
    _businessObjectId: businessObjectId,
    token,
    _objectVersionNumber: objectVersionNumber,
    baseDS: baseInfoDS,
    listRef,
  });
  const publicObject = () => {
    setLoading(true);
    return handlePublicObject().then(r => {
      if (r) {
        optionsListDs.query(); // 发布完成后值列表需要查一下 查出发布后带出的默认值列表数据
        baseInfoDS.query().then(res => {
          if (hasHlodModuleFlag && canVisible && published && getResponse(res)) {
            // TODO: 这里不能从根本解决布局没有实时查询的问题，因为是异步的，后端也不知道什么时候才能查出来布局数据，这里给个三秒只是大概
            // setTimeout(() => {
            //   pageDS.query();
            //   buttonDS.query();
            // }, 3000);
          }
        });
      }
      setLoading(false);
    });
  };

  const updateObject = async () => {
    const physicalModelId = baseInfoDS.current?.get('physicalModelId');
    setSyncLoading(true);
    const res = await tableRefresh(physicalModelId);
    setSyncLoading(false);
    if (getResponse(res)) {
      notification.success({});
      optionsListDs.query(); // 发布完成后值列表需要查一下 查出发布后带出的默认值列表数据
      baseInfoDS.query();
    }
  };

  const canVisible = [SourceType.PLATFORM, SourceType.TENANT].includes(sourceType);
  const published = [PublishStatus.PUBLISHED, PublishStatus.MODIFIED].includes(publishStatus);
  const fieldListProps = {
    store,
    // published,
    // businessObjectCode,
    // boSourceType: sourceType,
    listRef,
    baseInfoDS,
    publishStatus,
    published,
    sourceType,
    businessObjectName: baseInfoDS.current?.get('businessObjectName'),
    allowEdit,
  };

  const advancedRelationshipProps = {
    businessObjectCode,
    advanceRelationRef,
    businessObjectName: baseInfoDS?.current?.get('businessObjectName'),
    businessObjectId,
    listDs,
    isTenant,
  };

  return (
    <>
      <Header
        backPath="/hmde/business-object/list"
        onBack={() => {
          if (baseInfoDS.current?.get('domainId')) {
            location.hash = baseInfoDS.current?.get('domainId');
          }
        }}
        title={baseInfoDS.current?.get('businessObjectName')}
      >
        {(isTenant || permissionFlag) && (
          <Button
            color={ButtonColor.primary}
            onClick={() => {
              Modal.confirm({
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: (
                  <span>
                    {intl.get('hzero.common.button.releaseConfirm').d('请确认是否发布该业务对象？')}
                  </span>
                ),
                okText: intl.get('hzero.common.button.sure').d('确定'),
                onOk: () => {
                  publicObject();
                },
              });
            }}
            loading={loading}
            hidden={
              sourceType === SourceType.PREDEFINE ||
              !['baseInfo', 'fieldList', 'rules', 'advancedRelationship'].includes(activeKey)
            }
          >
            <ImgIcon name="send_publish.svg" size={14} style={{ marginRight: 10 }} />
            {intl.get('hzero.common.button.release').d('发布')}
          </Button>
        )}
        {!isTenant && permissionFlag && ['baseInfo', 'fieldList'].includes(activeKey) && (
          <Button
            style={{ marginRight: '8px' }}
            disabled={syncLoading}
            loading={syncLoading}
            onClick={updateObject}
          >
            {intl.get('hmde.common.view.button.tableUpdate').d('表结构更新')}
          </Button>
        )}
      </Header>
      {businessObjectCode && (
        <div className={styles['business-object-container']}>
          <Tabs
            tabPosition={TabsPosition.left}
            activeKey={activeKey}
            tabBarGutter={0}
            className={styles['detail-tabs']}
            onChange={key => {
              setActiveKey(key);
              tabKeyDs.setState('tabKey', key);
            }}
          >
            <TabPane
              tab={intl.get('hmde.common.view.message.baseInfo').d('基础信息')}
              key="baseInfo"
              forceRender
            >
              <BaseInfo dataSet={baseInfoDS} allowEdit={allowEdit} />
            </TabPane>
            <TabPane
              tab={intl.get('hmde.bo.view.message.tab.fieldList').d('字段列表')}
              key="fieldList"
              forceRender
              className={styles['overflow-hidden-tabpane']}
            >
              <FieldList {...props} {...fieldListProps} />
            </TabPane>
            {canVisible && showExportTemplate && (
              <TabPane
                tab={intl.get('hmde.bo.view.message.tab.exportTemplate').d('导出模板')}
                key="exportTemplate"
              // forceRender
              >
                <ExportTemplate
                  domainCode={domainCode}
                  domainId={domainId}
                  exportDS={exportDS}
                  objectTenantId={objectTenantId}
                  businessObjectId={businessObjectId}
                  businessObjectName={baseInfoDS.current?.get('businessObjectName')}
                  businessObjectCode={businessObjectCode}
                  allowEdit={allowEdit}
                  {...props}
                />
              </TabPane>
            )}
            {canVisible && showImportTemplate && (
              <TabPane
                tab={intl.get('hmde.bo.view.message.tab.importTemplate').d('导入模板')}
                key="importTemplate"
              // forceRender
              >
                <ImportTemplate
                  importDS={importDS}
                  objectTenantId={objectTenantId}
                  businessObjectId={businessObjectId}
                  businessObjectCode={businessObjectCode}
                  businessObjectName={baseInfoDS.current?.get('businessObjectName')}
                  domainCode={domainCode}
                  domainId={domainId}
                  allowEdit={allowEdit}
                  {...props}
                />
              </TabPane>
            )}
            {(isTenant || permissionFlag) && (
              <TabPane
                tab={intl.get('hmde.bo.view.message.tab.advancedRelationship').d('高级关系')}
                key="advancedRelationship"
              >
                <AdvancedRelationship allowEdit={allowEdit} {...advancedRelationshipProps} />
              </TabPane>
            )}
          </Tabs>
        </div>
      )}
    </>
  );
};

export default formatterCollections({ code: ['hmde.common', 'hzero.common', 'hmde.bo', 'hmde.domainOwnBOList', "hmde.bo", "hmde.boComposition"] })(
  withProps(() => {
    const tabKeyDs = new DataSet();
    return {
      tabKeyDs,
    };
  }, { cacheState: true })(observer(BODetail))
);
