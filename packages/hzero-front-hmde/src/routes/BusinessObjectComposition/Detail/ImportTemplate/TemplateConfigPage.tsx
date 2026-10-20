import React, { useEffect, useMemo } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import { Tabs } from 'choerodon-ui';
import { Modal, DataSet, Button, Form, NumberField, Select, CheckBox } from 'choerodon-ui/pro';
import qs from 'querystring';
import notification from 'hzero-front/lib/utils/notification';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import {
  getResponse,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentUser,
} from 'hzero-front/lib/utils/utils';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Size } from 'choerodon-ui/lib/_util/enum.js';
import { saveImportTemplateSheet, saveSheetPage, deleteImportTemplateSheet } from '@/services/businessObjectService';
// import { usePublicBusinessObjects } from '@/routes/BusinessObjectComposition/Detail';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { TemplateConfigDS } from '@/stores/BusinessObject/TemplateConfigDS';
// import { queryImportCreatePermission } from '../../../../../services/hmde/businessObjectServices';
import SheetConfigModal from './SheetConfigModal';
import TemplateCol from './TemplateCol';
// import ImgIcon from '@/utils/ImgIcon';
import styles from './index.less';

const { TabPane } = Tabs;
// const isTenant = isTenantRoleLevel();
const TemplateConfigPage = props => {
  let _search = props.location.search.split('?')?.[1];
  _search = qs.parse(_search);
  const {
    currentImportId,
    businessObjectId,
    currentTenantId,
    masterBusinessObjectId,
    businessObjectName,
  } = _search || {};
  const { loginName } = getCurrentUser() || {};
  const isAdmin = loginName === 'admin';
  const allowEdit = isAdmin || isTenantRoleLevel() || (window.$$env || {}).HMDE_ADD_FIELD === "true";

  // const [createFlag, setCreateFlag] = useState(false);

  // const { handlePublicObject } = usePublicBusinessObjects({ queryParams: true });
  // const [loading, setLoading] = useState(false);
  const sheetDS: DataSet = useMemo(
    () => new DataSet(TemplateConfigDS(currentImportId) as DataSetProps),
    []
  );
  const refAll = {};

  useEffect(() => {
    // fetchImportCreatePermission();
    sheetDS.query().then(() => {
      if (sheetDS.records.length === 0 && Number(currentTenantId) === getCurrentOrganizationId()) {
        const body = [
          {
            businessObjectImportTemplateId: currentImportId,
            sheetIndex: 1,
            sheetName: 'Sheet1',
            tenantId: getCurrentOrganizationId(),
          },
        ];
        saveImportTemplateSheet({
          body,
        }).then(value => {
          if (getResponse(value)) {
            sheetDS.query();
          }
        });
      }
    });
  }, []);

  // const fetchImportCreatePermission = () => {
  //   queryImportCreatePermission().then((res) => {
  //     if (res === true) {
  //       setCreateFlag(true);
  //     }
  //   });
  // };

  const sheetConfig = () => {
    const configDs = new DataSet(TemplateConfigDS(currentImportId));
    if (sheetDS.records.length) {
      configDs.loadData(sheetDS.toData());
    }
    Modal.open({
      title: intl.get('hmde.boComposition.importTemplate.buttom.sheetConfig').d('配置页签'),
      drawer: true,
      closable: true,
      destroyOnClose: true,
      children: (
        <SheetConfigModal
          configDs={configDs}
          currentImportId={currentImportId}
          currentTenantId={Number(currentTenantId)}
        />
      ),
      okText: intl.get('hzero.common.button.save').d('保存'),
      onOk: async () => {
        if (!await sheetDS.validate()) return false;
        if (configDs.destroyed.length) {
          const deletePromises: any[] = [];
          configDs.destroyed.forEach(record => {
            const businessObjectImportTemplateSheetId = record.get('businessObjectImportTemplateSheetId');
            if (businessObjectImportTemplateSheetId) {
              deletePromises.push(deleteImportTemplateSheet(businessObjectImportTemplateSheetId));
            }
          });
          if (deletePromises.length) {
            await Promise.all(deletePromises);
          }
        }
        return saveImportTemplateSheet({
          body: configDs.toData(),
        }).then(value => {
          getResponse(value);
          sheetDS.query();
        });
      },
      onCancel: () => {
        sheetDS.query();
      },
    });
  };

  // const publicObject = () => {
  //   setLoading(true);
  //   handlePublicObject(businessObjectId).then(() => {
  //     setLoading(false);
  //   });
  // };

  return (
    <>
      <Header
        backPath={`/hmde/business-object-composition/detail/${businessObjectId}?businessObjectName=${businessObjectName}&businessObjectCombineId=${businessObjectId}&masterBusinessObjectId=${masterBusinessObjectId}&originKey=importTemplate`}
        title={intl.get('hmde.boComposition.importTemplate.config').d('模板配置')}
      >
        <Button
          icon="save"
          onClick={async () => {
            const body = sheetDS.map(sheet => {
              return {
                ...sheet?.toJSONData(),
                importTemplateColumns: refAll[
                  sheet?.get('businessObjectImportTemplateSheetId')
                ]?.current?.templateColListDS.toJSONData(),
              };
            });
            const validate = await sheetDS.validate();
            // eslint-disable-next-line no-unused-expressions
            sheetDS.records.length &&
              validate &&
              saveSheetPage({
                body,
              }).then(res => {
                if (getResponse(res)) {
                  notification.success({
                    message: intl.get('hmde.common.status.success').d('成功'),
                    description: intl.get('hzero.common.notification.success.save').d('保存成功'),
                    placement: 'bottomRight',
                  });
                  sheetDS.forEach(item => {
                    // eslint-disable-next-line no-unused-expressions
                    refAll[
                      item?.get('businessObjectImportTemplateSheetId')
                    ]?.current?.templateColListDS.query();
                  });
                  sheetDS.query();
                }
              });
          }}
          color={ButtonColor.primary}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        {/* <Button
          color={ButtonColor.primary}
          onClick={() => {
            Modal.confirm({
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
        >
          <ImgIcon name="send_publish.svg" size={14} style={{ marginRight: 10 }} />
          {intl.get('hzero.common.button.release').d('发布')}
        </Button> */}
      </Header>
      <div className={styles.content}>
        <Tabs
          flex
          size={Size.small}
          tabBarExtraContent={allowEdit ? (
            <Button
              onClick={() => {
                sheetConfig();
              }}
            >
              {intl.get('hmde.boComposition.importTemplate.buttom.sheetConfig').d('配置页签')}
            </Button>
          ) : undefined}
        >
          {sheetDS.map(record => {
            return (
              <TabPane
                tab={record.get('sheetName')}
                key={record.get('businessObjectImportTemplateSheetId')}
              >
                <div style={{ display: 'flex', height: '100%', flexDirection: 'column'}}>
                  <div style={{ marginBottom: '32px' }}>
                    <div className={styles.title}>
                      {intl.get('hmde.boComposition.importTemplate.title.baseConfig').d('基础配置')}
                    </div>
                    <Form record={record} style={{ width: '70%' }} columns={3} labelLayout={LabelLayout.float}>
                      <NumberField name="dataStartRow" step={1} />
                      <Select name="trimFlag" clearButton={false} />
                      <CheckBox name="enabledFlag" />
                    </Form>
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div className={styles.title}>
                      {intl.get('hmde.common.view.title.templateFields').d('模板字段')}
                    </div>
                    <TemplateCol
                      refAll={refAll}
                      sheetDS={sheetDS}
                      currentImportId={currentImportId}
                      tenantId={record?.get('tenantId')}
                      businessObjectId={businessObjectId}
                      businessObjectImportTemplateSheetId={record?.get(
                        'businessObjectImportTemplateSheetId'
                      )}
                      allowEdit={allowEdit}
                    />
                  </div>
                </div>
              </TabPane>
            );
          })}
        </Tabs>
      </div>
    </>
  );
};

export default formatterCollections({
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common', 'hmde.bo'],
})(observer(TemplateConfigPage));
