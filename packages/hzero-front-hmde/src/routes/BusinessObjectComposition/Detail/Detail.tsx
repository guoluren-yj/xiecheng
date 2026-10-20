import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from 'hzero-front/lib/components/Page';
import classnames from 'classnames';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { isNull } from 'lodash';
import { Button, DataSet, Modal } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ObjectCompositionDS } from '@/stores/BusinessObjectComposition/ObjectCompositionDS';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import qs from 'querystring';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { getResponse, isTenantRoleLevel, getCurrentUser } from 'hzero-front/lib/utils/utils';
import { getCompositionDetail, getOBDetailService, publicBusinessObjects } from '@/services/businessObjectService';
import notification from 'hzero-front/lib/utils/notification';

import ImgIcon from '@/utils/ImgIcon';
import { ObjectMenuType } from '@/businessGlobalData/common';
import BaseInfo from './BaseInfo';
import ERDiagram from './ERDiagram';
import ImportTemplate from './ImportTemplate';
import ExportTemplate from './ExportTemplate';
import { ExportTemplateDSNew } from '@/stores/BusinessObject/ExportTemplateDS';
import { ImportTemplateDSNew } from '@/stores/BusinessObject/ImportTemplateDS';
import styles from './index.less';
import sourceStore from '../store';

import FieldInformation from '../../BusinessObjectComposition/Detail/FieldInformation';

// const FieldInformation = React.lazy(() =>
//   import('../../BusinessObjectComposition/Detail/FieldInformation')
// );
const isTenant = isTenantRoleLevel();
const { TabPane } = Tabs;

interface IProps {
  queryParams?: boolean; // 是否查询发布参数 默认false
  _businessObjectId?: string;
  token?: string;
  _objectVersionNumber?: string;
}

export const usePublicBusinessObjects = (props: IProps) => {
  const { queryParams = false, _businessObjectId, token, _objectVersionNumber } = props;
  const paramsRef: any = useRef({});
  paramsRef.current = {
    _token: token,
    businessObjectId: _businessObjectId,
    objectVersionNumber: _objectVersionNumber,
  };

  const init = boId => {
    // 获取发布要参数
    return getOBDetailService({ boId }).then(res => {
      if (getResponse(res)) {
        const { businessObjectId, _token, objectVersionNumber } = res;
        paramsRef.current = {
          _token,
          businessObjectId,
          objectVersionNumber,
        };
      }
    });
  };
  const handlePublicObject = async (boId?: string) => {
    if (queryParams) {
      await init(boId);
    }
    return publicBusinessObjects({ body: paramsRef.current }).then(r => {
      if (getResponse(r)) {
        // 业务对象查询
        notification.success({
          message: intl.get('hmde.boComposition.view.message.releaseConfirm.success').d('发布成功'),
        });
        return true;
      }
    });
  };
  return {
    handlePublicObject,
  };
};
const BoCompositionDetail = props => {
  let _search = props.location.search.split('?')?.[1];
  _search = qs.parse(_search);
  const {
    // businessObjectName,
    businessObjectCombineId, masterBusinessObjectId, originKey } =
    _search || {};
  const { history } = props;
  const { loginName } = getCurrentUser() || {};
  const isAdmin = loginName === 'admin';
  const allowEdit = isAdmin || isTenant || (window.$$env || {}).HMDE_ADD_FIELD === "true";
  const fieldInfoRef: any = useRef({});
  const exportDS: DataSet = useMemo(() => new DataSet(ExportTemplateDSNew(false) as DataSetProps), []);
  const importDS: DataSet = useMemo(
    () => new DataSet(ImportTemplateDSNew(businessObjectCombineId, false) as DataSetProps),
    [],
  );
  const boCompositionDS: DataSet = useMemo(
    () => new DataSet(ObjectCompositionDS(false) as DataSetProps),
    [],
  );
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState<ObjectMenuType>(ObjectMenuType.fieldList);
  const objectVersionNumber = boCompositionDS?.current?.get('objectVersionNumber');
  const businessObjectCode = boCompositionDS?.current?.get('businessObjectCode');
  const token = boCompositionDS?.current?.get('_token');
  const domainId = boCompositionDS?.current?.get('domainId');
  const domainCode = boCompositionDS?.current?.get('domainCode');
  const objectTenantId = boCompositionDS?.current?.get('tenantId');
  const { permissionFlag, queryPermission, erExport } = React.useContext<any>(sourceStore as any).store;
  const businessObjectName = boCompositionDS?.current?.get('businessObjectName');

  useEffect(() => {
    if (!isTenant && isNull(permissionFlag)) {
      queryPermission();
    }
  }, []);

  useEffect(() => {
    if (originKey) {
      setActiveKey(originKey);
    }
  }, [originKey]);
  const { handlePublicObject } = usePublicBusinessObjects({
    _businessObjectId: businessObjectCombineId,
    token,
    _objectVersionNumber: objectVersionNumber,
  });
  const publicObject = () => {
    setLoading(true);
    handlePublicObject().then(r => {
      if (r) {
        getCompositionDetail(businessObjectCombineId).then(res => {
          if (getResponse(res)) {
            boCompositionDS.loadData([res]);
          }
        });
        // 刷新一下字段列表 更新发布状态
        // eslint-disable-next-line no-unused-expressions
        fieldInfoRef.current?.rightFieldsRef.current?.init();
      }
      setLoading(false);
    });
  };
  const fieldInformationProps = {
    history,
    businessObjectName,
    // masterBusinessObjectId, // 组合业务对象主对象id
    businessObjectCombineId, // 组合业务对象id
    boCompositionDS,
    fieldInfoRef,
    allowEdit,
  };

  return (
    <>
      <Header backPath="/hmde/business-object-composition/list" title={businessObjectName}>
        <Button
          color={ButtonColor.primary}
          onClick={() => {
            Modal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: (
                <span>
                  {intl
                    .get('hmde.boComposition.view.message.releaseConfirm')
                    .d('请确认是否发布该组合业务对象？')}
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
            ![
              ObjectMenuType.baseInfo,
              ObjectMenuType.erDiagram,
              ObjectMenuType.fieldList,
              ObjectMenuType.rules,
            ].includes(
              activeKey,
            )
          }
        >
          <ImgIcon name="send_publish.svg" size={14} style={{ marginRight: 10 }} />
          {intl.get('hzero.common.button.release').d('发布')}
        </Button>
        <Button
          icon="export"
          onClick={erExport}
          funcType={FuncType.flat}
          hidden={activeKey !== ObjectMenuType.erDiagram}
        >
          {intl.get('hmde.boComposition.button.erExport').d('导出ER图')}
        </Button>
      </Header>
      <div className={styles['business-object-content']}>
        <div className={styles['business-object-container']}>
          <Tabs
            activeKey={activeKey}
            onChange={(key: any) => setActiveKey(key)}
            animated={false}
            tabPosition={TabsPosition.left}
            className={styles.tabs}
            flex
          >
            <TabPane
              tab={intl.get('hmde.common.view.message.baseInfo').d('基础信息')}
              key={ObjectMenuType.baseInfo}
              forceRender
            >
              <BaseInfo {...fieldInformationProps} />
            </TabPane>
            <TabPane
              tab={intl.get('hmde.boComposition.view.message.tab.fieldInfo').d('字段信息')}
              key={ObjectMenuType.fieldList}
              forceRender
              className={classnames(styles['overflow-hidden-tabpane'], 'no-padding-tabpane')}
            >
              <FieldInformation {...props} {...fieldInformationProps} />
            </TabPane>
            <TabPane
              tab={intl.get('hmde.boComposition.view.message.tab.erDiagram').d('ER图')}
              key={ObjectMenuType.erDiagram}
            >
              <ERDiagram {...props} {...fieldInformationProps} />
            </TabPane>
            <TabPane
              tab={intl.get('hmde.boComposition.view.message.tab.exportTemplate').d('导出模板')}
              key={ObjectMenuType.exportTemplate}
              forceRender
              className={styles['overflow-hidden-tabpane']}
            >
              <ExportTemplate
                exportDS={exportDS}
                businessObjectId={businessObjectCombineId}
                objectTenantId={objectTenantId}
                masterBusinessObjectId={masterBusinessObjectId}
                businessObjectName={businessObjectName}
                businessObjectCode={businessObjectCode}
                domainId={domainId}
                domainCode={domainCode}
                boCompositionDS={boCompositionDS}
                businessObjectCombineId={businessObjectCombineId}
                allowEdit={allowEdit}
                {...props}
              />
            </TabPane>
            <TabPane
              tab={intl.get('hmde.boComposition.view.message.tab.importTemplate').d('导入模板')}
              key={ObjectMenuType.importTemplate}
              forceRender
              className={styles['overflow-hidden-tabpane']}
            >
              <ImportTemplate
                importDS={importDS}
                objectTenantId={objectTenantId}
                businessObjectId={businessObjectCombineId}
                businessObjectCode={businessObjectCode}
                domainCode={domainCode}
                domainId={domainId}
                masterBusinessObjectId={masterBusinessObjectId}
                businessObjectName={businessObjectName}
                allowEdit={allowEdit}
                {...props}
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default formatterCollections({
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common', 'hmde.domainOwnBOList', 'hmde.bo'],
})(observer(BoCompositionDetail));
