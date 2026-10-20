import React, { useContext, useEffect, useState, useMemo } from 'react';
import { compose } from 'lodash';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Tabs } from 'choerodon-ui';
// import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { DataSet, Table, Button, Icon, Form, Lov } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { observer } from 'mobx-react-lite';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import qs from 'querystring';
import { fieldMapSave, layoutDefinitionSave } from '@/services/roleCardFieldMapService';
import notification from 'utils/notification';
import { isTenantRoleLevel } from 'utils/utils';
import { fieldMapDs, layoutDefinitionDs, titleFromDs } from '../store';
import styles from './index.less';

const { TabPane } = Tabs;

const Index = ({ match: { params = {} }, history, dispatch }) => {
  const [currentTab, setCurrentTab] = useState('showFieldMap');
  const [layoutDefinitionTableLoading, setLayoutDefinitionTableLoading] = useState(true);
  const templateId = params.id;
  let _search = location.search.split('?')?.[1];
  _search = qs.parse(_search);
  const { combineCode } = _search || {};
  const fieldMapTableDs = useMemo(() => new DataSet(fieldMapDs(combineCode)), []);
  const layoutDefinitionTableDs = useMemo(() => new DataSet(layoutDefinitionDs(templateId)), []);
  const formDs = useMemo(() => new DataSet(titleFromDs(templateId, layoutDefinitionTableDs)), []);

  useEffect(() => {
    if (params.id) {
      // queryHeader();
      query();
    } else {
      // attachDs.create({}, 0);
      // setAttachmentCurrent(attachDs.current);
    }
    // fetchCurrentRulePermissions();
  }, [params.id]);

  const query = (tab = currentTab) => {
    if (!params.id) {
      return;
    }
    fieldMapTableDs.setQueryParameter('templateHeaderId', params.id);
    // layoutDefinitionTableDs.setQueryParameter('templateHeaderId', params.id);
    formDs.setQueryParameter('templateHeaderId', params.id);
    if (tab === 'showFieldMap') {
      fieldMapTableDs.query();
    } else if (tab === 'cardLayoutDefinition') {
      // layoutDefinitionTableDs.query();
      formDs.query().then(() => {
        setLayoutDefinitionTableLoading(false);
      });
    }
  };

  const fieldMapColumns = [
    {
      name: 'fieldNum',
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'fieldName',
      editor: true,
    },
    {
      name: 'valueTypeLov',
      editor: true,
    },
    {
      name: 'fixedValue',
      editor: true,
    },
    {
      name: 'valueField',
      editor: true,
    },
    {
      name: 'specialStyle',
      editor: true,
    },
    {
      name: 'prefix',
      editor: true,
    },
    {
      name: 'suffix',
      editor: true,
    },
  ];

  const layoutDefinitionColumns = [
    {
      name: 'lineNum',
    },
    {
      name: 'tradeBody1',
      editor: true,
    },
    {
      name: 'tradeBody2',
      editor: true,
    },
    {
      name: 'tradeBody3',
      editor: true,
    },
    {
      name: 'tradeBody4',
      editor: true,
    },
    {
      name: 'businessField1',
      editor: true,
    },
    {
      name: 'businessField2',
      editor: true,
    },
    {
      name: 'businessField3',
      editor: true,
    },
    {
      name: 'businessField4',
      editor: true,
    },
    {
      name: 'contentBody1',
      editor: true,
    },
    {
      name: 'contentBody2',
      editor: true,
    },
    {
      name: 'contentBody3',
      editor: true,
    },
    {
      name: 'contentBody4',
      editor: true,
    },
    {
      name: 'otherField1',
      editor: true,
    },
    {
      name: 'otherField2',
      editor: true,
    },
    {
      name: 'otherField3',
      editor: true,
    },
    {
      name: 'otherField4',
      editor: true,
    },
  ];

  const handleLayoutDefinitionTableSave = () => {
    setLayoutDefinitionTableLoading(true);
    const data = formDs?.toData()?.[0] ?? {};
    layoutDefinitionSave(data).then((res) => {
      if (res && !res?.failed) {
        formDs.query();
      } else {
        notification.error({
          message: (res && res?.message) ?? '',
        });
      }
      setLayoutDefinitionTableLoading(false);
    });
  };

  const handleAdd = () => {
    const record = fieldMapTableDs.create(
      {
        // valueType: 'FIELD',
        // valueTypeMeaning
        templateHeaderId: templateId,
      },
      0
    );
    record.setState('editing', true);
  };

  const handleSave = () => {
    const list = fieldMapTableDs?.toData() ?? [];
    fieldMapSave(list).then((res) => {
      if (res && !res?.failed) {
        fieldMapTableDs.query();
      } else {
        notification.error({
          message: (res && res?.message) ?? '',
        });
      }
    });
  };

  const buttons = [
    <Button icon="playlist_add" onClick={() => handleAdd()} key="add">
      {intl.get('hzero.common.button.create').d('新建')}
    </Button>,
    <Button icon="save" onClick={() => handleSave()} key="save">
      {intl.get('hzero.common.button.save').d('保存')}
    </Button>,
    'delete',
  ];

  return (
    <>
      <Header
        backPath={isTenantRoleLevel() ? '/swbh/role-card-field-map/list' : '/swbh/platform/role-card-field-map/list'}
        title={intl.get('swbh.common.view.message.title.docFieldMap').d('单据字段映射')}
      />
      <Content>
        <Tabs
          tabPosition="top"
          activeKey={currentTab}
          onChange={(value) => {
            setCurrentTab(value);
            query(value);
          }}
        >
          <TabPane tab={intl.get('swbh.common.view.message.tab.showFieldMap').d('展示字段映射')} key="showFieldMap">
            <Table dataSet={fieldMapTableDs} columns={fieldMapColumns} buttons={buttons} />
          </TabPane>
          <TabPane
            tab={intl.get('swbh.common.view.message.tab.cardLayoutDefinition').d('卡片布局定义')}
            key="cardLayoutDefinition"
          >
            <div className={styles.info}>
              <Icon type="error" />
              {intl
                .get('swbh.common.view.message.tab.cardLayoutDefinition.info.row1')
                .d('为保证规范性与一致性,各列信息摆放建议 ')}
              <br />
              {intl
                .get('swbh.common.view.message.tab.cardLayoutDefinition.info.title')
                .d('标题栏：1-单据类型；2-待办标题；3-单号（普通待办事件）或转单/按行处理场景描述；')}
              <br />
              {intl
                .get('swbh.common.view.message.tab.cardLayoutDefinition.info.columns1')
                .d('列1：交易主体,如采购方、供应商、需求方等 ')}
              <br />
              {intl
                .get('swbh.common.view.message.tab.cardLayoutDefinition.info.columns2')
                .d('列2：内容主体，如物料信息 ')}
              <br />
              {intl
                .get('swbh.common.view.message.tab.cardLayoutDefinition.info.columns3')
                .d('列3：标题、备注、业务类型等')}
            </div>
            <Button
              style={{ margin: '8px 8px 0 0' }}
              funcType="flat"
              color="primary"
              icon="save"
              onClick={() => handleLayoutDefinitionTableSave()}
              key="save"
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>

            <Form dataSet={formDs} columns={5} style={{ position: 'relative', left: '-27px' }}>
              {/* {!isTenant && <Lov name="tenantId" />} */}
              <Lov name="titleField1" />
              <Lov name="titleField2" />
              <Lov name="titleField3" />
              <Lov name="titleField4" />
            </Form>
            <Table
              spin={{ spinning: layoutDefinitionTableLoading }}
              dataSet={layoutDefinitionTableDs}
              columns={layoutDefinitionColumns}
              // buttons={[
              //   <Button icon="save" onClick={() => handleLayoutDefinitionTableSave()} key="save">
              //     {intl.get('hzero.common.button.save').d('保存')}
              //   </Button>,
              // ]}
            />
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
};

export default compose(
  // connect(),
  formatterCollections({
    code: ['swbh.common', 'hzero.common'],
  }),
  withCustomize({
    // unitCode: ['SRPM.RP_CONFIG_LIST.TABLE'],
  }),
  withProps(
    () => {
      // const fieldMapTableDs = new DataSet(fieldMapDs());
      // const layoutDefinitionTableDs = new DataSet(layoutDefinitionDs());
      // return {
      //   fieldMapTableDs,
      //   layoutDefinitionTableDs,
      // };
    },
    { cacheState: true }
  )
)(Index);
