import React, { memo, useState, useMemo, useContext } from 'react';
import { omit } from "lodash";
import { observable, runInAction } from 'mobx';
import { Button, DataSet, Modal } from "choerodon-ui/pro";
import { Header } from 'hzero-front/lib/components/Page';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'hzero-front/lib/utils/intl';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from "hzero-front/lib/utils/notification";
import { getCurrentOrganizationId, getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { HZERO_RPT } from 'hzero-front/lib/utils/config';
import request from "hzero-front/lib/utils/request";
import { observer } from 'mobx-react-lite';

import type { IStore } from './store';
import Store, { StoreProvider, idField, rootDirCode } from './store';
import styles from './index.less';
import LeftTree from './LeftTree';
import Content from './Content';
import ImportButton from './ImportButton';
import ExportButton from './ExportButton';
import SearchPage from './SearchPage';
import Setting from './Setting';
import { checkIsImgType } from './Watermark/util';

const DATA_MIGRATE_ENABLE = (window as any).$$env.HRPT_DATA_MIGRATE_ENABLE; // 环境变量，用于控制导入导出按钮是否显示

const Main = observer(() => {
  const isTenant: boolean = useMemo(() => isTenantRoleLevel(), []);
  const [enablePrivew, changeEnablePrivew] = useState(undefined);
  const [collapse, setCollapse] = useState(false);
  const {
    editing, setEditing, setCurrentDocument, setSelectedKeys, currentDocument,
  }: IStore = useContext<any>(Store).store;

  return (
    <>
      <div style={{ width: "100%", height: "100%", display: editing ? "none" : "block" }}>
        <Header key="list" title={intl.get('hrpt.printTemplate.view.message.title').d('打印模板管理')}>
          {isTenant && DATA_MIGRATE_ENABLE === 'true' && (
            <>
              <ImportButton />
              <ExportButton />
            </>
          )}
          {
            isTenant && (
              <Button onClick={() => onClickSetting(changeEnablePrivew)} funcType={FuncType.flat} icon="settings">
                {intl.get("hzero.common.button.setting").d("设置")}
              </Button>
            )
          }
        </Header>
        <div className={[styles['content-container'], collapse && "collapse"].filter(Boolean).join(" ")}>
          <div className={styles['left-container']}>
            <LeftTree />
          </div>
          <div className={`tree-divide-op${collapse ? " collapse" : ""}`} onClick={() => setCollapse(!collapse)} />
          <div className={styles['right-container']}>
            <SearchPage />
          </div>
        </div>
      </div>
      {editing && (
        <div style={{ width: "100%", height: "100%" }}>
          <Header
            key="editing"
            title={`${intl.get('hzero.common.view.title.edit').d('编辑')}-${currentDocument && currentDocument.docName || ""}`}
            backPath="/parent"
            customBack={() => { setEditing(false); setSelectedKeys([rootDirCode]); setCurrentDocument({ [idField]: rootDirCode }); }}
          />
          <div className={styles['content-container']}>
            <Content enablePrivew={enablePrivew} />
          </div>
        </div>
      )}
    </>
  );
});
const onClickSetting = (callback) => {
  const refOnlineData = observable({ current: false });
  const ds = new DataSet({
    autoQuery: true,
    fields: [
      {
        name: "selectTemplateFlag",
        label: intl.get("hrpt.common.model.field.selectTemplateFlag").d("是否启用预览"),
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled({ record }) {
            if (!record) return false;
            return refOnlineData.current;
          },
        },
      },
      {
        name: 'watermarkConfig.enableFlag',
        type: FieldType.boolean,
        trueValue: true,
        falseValue: false,
      },
      {
        name: 'watermarkConfig.type',
        label: intl.get('hrpt.reportDesign.model.waterMask.type').d('水印类型'),
        lookupCode: 'HRPT.WATER_MASK_TYPE',
      },
      {
        name: 'watermarkConfig_.type',
        label: intl.get('hrpt.reportDesign.model.waterMask.type').d('水印类型'),
        lookupCode: 'HRPT.WATER_MASK_TYPE',
      },
      {
        name: 'watermarkConfig.expression',
        dynamicProps: {
          required: ({ record }) => {
            return record && record.get('watermarkConfig.enableFlag') && !checkIsImgType(record.get('watermarkConfig.type'))
          },
        },
      },
      {
        name: 'watermarkConfig_.expression',
        dynamicProps: {
          required: ({ record }) => {
            return record && record.get('watermarkConfig.enableFlag') && !checkIsImgType(record.get('watermarkConfig_.type'))
          },
        },
      },
       {
        name: 'watermarkConfig_.expression_format',
        dynamicProps: {
          required: ({ record }) => {
            return record && record.get('watermarkConfig.enableFlag') && !checkIsImgType(record.get('watermarkConfig_.type'))
          },
        },
      },
      {
        name: 'watermarkConfig.value',
      },
      {
        name: 'watermarkConfig.density',
        label: intl.get('hrpt.reportDesign.model.waterMask.density').d('水印密度'),
      },
      {
        name: 'watermarkConfig_.density',
        label: intl.get('hrpt.reportDesign.model.waterMask.density').d('水印密度'),
      },
      { name: 'watermarkConfig.size' },
      {
        name: 'watermarkConfig.alpha',
        label: intl.get('hrpt.reportDesign.model.waterMask.alpha').d('不透明度'),
      },
      {
        name: 'watermarkConfig_.alpha',
        label: intl.get('hrpt.reportDesign.model.waterMask.opacity').d('不透明度'),
      },
      {
        name: 'watermarkConfig.direction',
        label: intl.get('hrpt.reportDesign.model.waterMask.tiltDirection').d('倾斜方向'),
      },
      {
        name: 'watermarkConfig_.direction',
        label: intl.get('hrpt.reportDesign.model.waterMask.tiltDirection').d('倾斜方向'),
      },
      {
        name: 'watermarkConfig.position',
        label: intl.get('hrpt.reportDesign.model.waterMask.position').d('位置'),
      },
      {
        name: 'watermarkConfig_.position',
        label: intl.get('hrpt.reportDesign.model.waterMask.position').d('位置'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-tenant-configs`,
          method: 'GET',
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        if (dataSet && dataSet.current) {
          let watermarkConfig = dataSet.current.get('watermarkConfig');
          if (watermarkConfig) {
            dataSet.current.set('watermarkConfig', JSON.parse(watermarkConfig));
            dataSet.current.set('watermarkConfig_.type', dataSet.current.get('watermarkConfig.type'));
            dataSet.current.set('watermarkConfig_.expression', dataSet.current.get('watermarkConfig.expression'));
            dataSet.current.set('watermarkConfig_.expression_format', dataSet.current.get('watermarkConfig.expression'));
            dataSet.current.set('watermarkConfig_.value', dataSet.current.get('watermarkConfig.value'));
            dataSet.current.set('watermarkConfig_.density', dataSet.current.get('watermarkConfig.density'));
            dataSet.current.set('watermarkConfig_.size', dataSet.current.get('watermarkConfig.size'));
            dataSet.current.set('watermarkConfig_.alpha', dataSet.current.get('watermarkConfig.alpha'));
            dataSet.current.set('watermarkConfig_.position', dataSet.current.get('watermarkConfig.position'));
            dataSet.current.set('watermarkConfig_.direction', dataSet.current.get('watermarkConfig.direction'));
          }
          runInAction(() => {
            refOnlineData.current = !!dataSet.current.get("selectTemplateFlag");
          });
        }
      },
    },
  });
  Modal.open({
    title: intl.get("hrpt.common.title.globalSetting").d("打印全局设置"),
    drawer: true,
    style: { width: '300px' },
    children: <Setting dataSet={ds} />,
    onOk: async () => {
      const validate = await ds.validate();
      if (ds.current) {
        const {
          'watermarkConfig.enableFlag': enableFlag, 
          'watermarkConfig.expression': expression,
          'watermarkConfig.type': type,
          'watermarkConfig.value': value, 
        } = ds.current.get([
          'watermarkConfig.enableFlag', 'watermarkConfig.expression', 'watermarkConfig.type', 'watermarkConfig.value'
        ]);
        if (enableFlag && (checkIsImgType(type) ? !value : !expression)) {
          notification.warning({
            message: intl.get("hrpt.common.globalSetting.confirmConfigWatermark").d("请配置水印！"),
          });
          return false;
        }
      }
      if (validate) {
        const submitData = (omit(ds.current && ds.current.toData() || { selectTemplateFlag: 0, tenantId: getCurrentOrganizationId() }, ["__id", "watermarkConfig_", "_status", "__dirty"]));
        if (submitData.watermarkConfig) {
          let { expression } = submitData.watermarkConfig;
          if (expression) {
            if (!expression.startsWith('CONCAT(')) {
              if (expression.split(',').length < 2) {
                expression += ",''";
              }
              submitData.watermarkConfig.expression = `CONCAT(${expression})`;
            }
          }
          submitData.watermarkConfig = JSON.stringify(submitData.watermarkConfig);
        } 
        let confirm = "ok";
        // 租户首次保存配置，提醒
        if (!refOnlineData.current && submitData.selectTemplateFlag) {
          confirm = await Modal.confirm({
            title: intl.get("hzero.common.message.confirm.title").d("提示"),
            children: (
              intl.get("hrpt.common.globalSetting.confirmTips").d("开启预览后，不支持关闭预览，请谨慎操作")
            ),
          });
        }
        if (confirm !== 'ok') return false;        
        return request(`${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-tenant-configs`, {
          method: 'PUT',
          body: {
            tenantId: getCurrentOrganizationId(),
            ...submitData,
          },
        }).then(res => {
          if (res && getResponse(res)) {
            notification.success({});
            callback(res.selectTemplateFlag === 1);
            return true;
          }
          return false;
        });
      }
      return false;
    },
  });
};
const Root = (props) => {
  return (
    <StoreProvider>
      <Main {...props} />
    </StoreProvider>
  );
};
export default formatterCollections({
  code: ['hrpt.printTemplate', 'hrpt.common', 'hrpt.reportDesign', 'hrpt.reportDataSet'],
})(memo(Root));
