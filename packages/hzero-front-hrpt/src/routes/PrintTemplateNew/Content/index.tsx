import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Tabs } from 'choerodon-ui';
import { DataSet, Form, TextField, IntlField, Lov, Button, Select, CheckBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { RecordStatus, DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import { queryPrintTenantConfigs, queryPrintDocumentsTenant, updatePrintDocument, updatePrintDocumentTenant } from '../../../services/printTemplateService';
import styles from '../index.less';
import type { IStore} from '../store';
import Store, { getTemplateFormDsConfig } from '../store';
import ConditionConfig from './ConditionConfig';
import TemplateConfig from './TemplateConfig';
import ParamConfig from './ParamConfig';

const { TabPane } = Tabs;

const Content = ({ enablePrivew } : { enablePrivew?: boolean }) => {
  const {
    isTenant,
    currentDocument,
    currentDocument: { docId } = {},
    setCurrentDocument,
    canEdit,
  }: IStore = useContext<any>(Store).store;
  const [loading, setLoading] = useState(true);
  const [templateMultiple, setTemplateMultiple] = useState(false);
  const [printDocumentConfig, setPrintDocumentConfig] = useState({});
  const [enabledOutTypeFlag, setEnabledOutTypeFlag] = useState(false);
  const formDs = useMemo(() => {
    return new DataSet(getTemplateFormDsConfig(docId));
  }, [docId]);

  useEffect(() => {
    if (isTenant) {
      fetchConfig();
    }
    fetchForm();
  }, []);

  useEffect(() => {
    if (!loading && enablePrivew !== undefined) {
      setTemplateMultiple(enablePrivew);
    }
  }, [enablePrivew, loading]);

  const fetchForm = () => {
    if (!isTenant) {
      setEnabledOutTypeFlag(true);
    }
    formDs.query().then((resp) => {
      setCurrentDocument({ ...(currentDocument || {}), sceneCode: resp.sceneCode });
      if (isTenant) {
        queryPrintDocumentsTenant({ docId }).then((res) => {
          if (getResponse(res) && res && formDs.current) {
            setPrintDocumentConfig(res);
            formDs.current.init('enabledOutTypeFlag', res.enabledOutTypeFlag);
            setEnabledOutTypeFlag(!res.enabledOutTypeFlag);
          }
        });
      }
    });
  };

  const fetchConfig = async() => {
    setLoading(true);
    const res = await queryPrintTenantConfigs();
    setLoading(false);
    if (getResponse(res) && res) {
      setTemplateMultiple(res.selectTemplateFlag === 1);
    }
  };

  const handleSave = useCallback(async () => {
    if (!formDs.current) {
      return;
    }
    formDs.current.status = RecordStatus.update;
    const flag = await formDs.validate();
    if (!flag) {
      return;
    }
    const param = formDs.current.toJSONData();
    if (isTenant) {
      const resp = await updatePrintDocumentTenant({ ...printDocumentConfig, enabledOutTypeFlag: param.enabledOutTypeFlag }, { docId });
      if (getResponse(resp)) {
        notification.success({});
        fetchForm();
      }
    } else {
      const resp = await updatePrintDocument( param);
      if (getResponse(resp)) {
        notification.success({});
        fetchForm();
      }
    }
  }, [printDocumentConfig, isTenant, formDs]);
  return (
    <div className={styles['content']}>
      <Tabs tabPosition={TabsPosition.left} defaultActiveKey='template'>
        <TabPane tab={intl.get('hzero.common.view.title.baseInfo').d('基础信息')} key="basic">
          <div className={styles['card']}>
            <div className={styles['card-content']}>
              <Form dataSet={formDs} labelLayout={LabelLayout.float} columns={3}>
                <TextField name='docCode' />
                <IntlField name='docName' />
                <Lov name='combineLov' />
                <Select name='sceneCode' />
                {isTenant && (
                  <CheckBox
                    name='enabledOutTypeFlag'
                    help={intl.get('hrpt.printTemplate.view.message.enableFileTypeConfig.help').d('开启该配置后， “生效条件配置”时支持配置每个规则下模板实际打印的文件格式')}
                    showHelp={ShowHelp.tooltip}
                    disabled={!enabledOutTypeFlag}
                  />
                )}
                <IntlField name='remark' newLine colSpan={3} />
              </Form>
            </div>
            {canEdit && enabledOutTypeFlag && (
              <Button color={ButtonColor.primary} onClick={handleSave}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            )}
          </div>
        </TabPane>
        {isTenant && (
          <TabPane tab={intl.get('hrpt.printTemplate.view.title.conditionConfig').d('生效条件配置')} key="condition">
            <ConditionConfig
              loading={loading || formDs.status === DataSetStatus.loading}
              templateMultiple={templateMultiple}
              enableConfigFileType={formDs.current?.getPristineValue('enabledOutTypeFlag') as boolean}
            />
          </TabPane>
        )}
        <TabPane tab={intl.get('hrpt.printTemplate.view.title.templateConfig').d('模板配置')} key="template">
          <div className={styles['card']} style={{ height: "100%" }}>
            <TemplateConfig />
          </div>
        </TabPane>
        <TabPane tab={intl.get('hrpt.printTemplate.view.title.paramConfig').d('参数配置')} key="param">
          <div className={styles['card']}>
            <ParamConfig />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default observer(Content);