import React, { useEffect, useMemo } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import { Tabs } from 'choerodon-ui';
import { DataSet, Form, NumberField, Select, CheckBox } from 'choerodon-ui/pro';
import qs from 'querystring';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Size } from 'choerodon-ui/lib/_util/enum.js';
import { saveImportTemplateSheet } from '@/services/businessObjectService';
// import { usePublicBusinessObjects } from '@/routes/BusinessObject/Detail';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { TemplateConfigDS } from '@/stores/BusinessObject/TemplateConfigDS';
import TemplateCol from './TemplateCol';
import styles from './index.less';
// import ImgIcon from '@/utils/ImgIcon';

const { TabPane } = Tabs;

const ExportTemplateConfigPage = props => {
  let _search = props.location.search.split('?')?.[1];
  _search = qs.parse(_search);
  const { currentImportId, businessObjectId, currentTenantId } = _search || {};
  // const { handlePublicObject } = usePublicBusinessObjects({ queryParams: true });
  // const [loading, setLoading] = useState(false);
  const sheetDS: DataSet = useMemo(
    () => new DataSet(TemplateConfigDS(currentImportId) as DataSetProps),
    []
  );
  const refAll = {};

  useEffect(() => {
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

  return (
    <>
      <Header
        backPath={`/hmde/business-object/detail/${businessObjectId}`}
        title={intl.get('hmde.bo.importTemplate.buttom.config').d('模板配置')}
      />
      <Content>
        <Tabs size={Size.small}>
          {sheetDS.map(record => {
            return (
              <TabPane
                tab={record.get('sheetName')}
                key={record.get('businessObjectImportTemplateSheetId')}
              >
                <div style={{ marginBottom: '32px' }}>
                  <div className={styles.title}>
                    {intl.get('hmde.boComposition.importTemplate.title.baseConfig').d('基础配置')}
                  </div>
                  <Form record={record} style={{ width: '70%' }} columns={3} labelLayout={LabelLayout.float}>
                    <NumberField name="dataStartRow" step={1} />
                    <Select name="trimFlag" clearButton={false} />
                    <CheckBox name="enabledFlag" disabled />
                  </Form>
                </div>
                <div>
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
                  />
                </div>
              </TabPane>
            );
          })}
        </Tabs>
      </Content>
    </>
  );
};

export default formatterCollections({ code: ['hmde.common', 'hmde.bo', 'hzero.common', 'hmde.boComposition'] })(
  observer(ExportTemplateConfigPage)
);
