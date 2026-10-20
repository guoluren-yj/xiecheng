import React, { Fragment } from 'react';
import { Header, Content } from 'components/Page';
import {
  Table,
  DataSet,
  Form,
  Button,
  TextField,
  TextArea,
  useDataSet,
  Modal,
} from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
// import { observer } from 'mobx-react-lite';
// import { Button } from 'components/Permission';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import type Record from 'choerodon-ui/pro/lib/data-set/Record';
import type { Buttons } from 'choerodon-ui/pro/lib/table/interface';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { tableDS, relationListDS } from './stores';

import { delAutoConvert, delConvertRelation } from '@/services/RulesImportSettingService';

interface IndexProps {
  [propName: string]: any;
}

const Index: React.FC<IndexProps> = () => {
  const listDs = useDataSet(() => tableDS(), []);

  React.useEffect(() => {
    listDs.query();
  }, []);

  const openRelationModal = (record, relationType) => {
    const relationListDs = new DataSet(relationListDS(relationType));
    const cnfAutoConvertId = record.get('id');
    relationListDs.setQueryParameter('cnfAutoConvertId', cnfAutoConvertId);
    relationListDs.setQueryParameter('relationType', relationType);
    const title =
      relationType === '0'
        ? intl.get('spfm.ruleImportSetting.model.view.featureList').d('关联特性清单')
        : intl.get('spfm.ruleImportSetting.model.view.executionRuleList').d('关联执行规则清单');
    const relationColumns = [
      {
        name: 'serverCode',
        editor: true,
        // width: 200,
      },
      // {
      //   name: 'serveName',
      //   editor: true,
      // },
      {
        name: 'relationCode',
        // editor: true,
        // width: 200,
      },
      // {
      //   name: 'relationName',
      //   editor: true,
      // },
    ];

    relationListDs.query();

    Modal.open({
      key: Modal.key(),
      style: { width: '580px' },
      title,
      children: (
        <>
          <Table
            queryFieldsLimit={2}
            dataSet={relationListDs}
            columns={relationColumns}
            buttons={['add', 'delete'] as Buttons[]}
          />
        </>
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: async () => {
        return new Promise(async (resolve) => {
          const validFlag = await relationListDs.validate();
          if (validFlag) {
            delConvertRelation({
              body: relationListDs.toData().map((ele: IndexProps) => ({
                ...ele,
                cnfAutoConvertId,
                relationType,
                _status: ele?.id ? 'update' : 'create',
              })),
              cnfAutoConvertId,
            })
              .then((res) => {
                if (getResponse(res)) {
                  notification.success({});
                  listDs.query();
                } else {
                  resolve(false);
                }
              })
              .finally(() => {
                resolve(true);
              });
          } else {
            resolve(false);
          }
        });
      },
      onCancel: () => {},
    });
  };

  const columns: ColumnProps[] = React.useMemo(() => {
    return [
      {
        name: 'code',
      },
      {
        name: 'description',
      },
      {
        name: 'convertSql',
      },
      {
        name: 'valueField',
      },
      {
        name: 'uniqueValueField',
      },
      {
        name: 'condition',
        renderer: ({ record }) => (
          <>
            <a
              onClick={() => {
                openRelationModal(record, '0');
              }}
            >
              {intl.get('spfm.ruleImportSetting.model.view.featureList').d('关联特性清单')}
            </a>
          </>
        ),
      },
      {
        name: 'execution',
        renderer: ({ record }) => (
          <>
            <a
              onClick={() => {
                openRelationModal(record, '1');
              }}
            >
              {intl
                .get('spfm.ruleImportSetting.model.view.executionRuleList')
                .d('关联执行规则清单')}
            </a>
          </>
        ),
      },
      {
        name: 'option',
        renderer: ({ record }) => (
          <>
            <a
              onClick={() => {
                openEditModal(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <a
              onClick={() => {
                listDs.delete([record as Record]);
              }}
              style={{ marginLeft: '8px' }}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </a>
          </>
        ),
      },
    ];
  }, []);

  const openEditModal = (record) => {
    const title = record
      ? intl.get('spfm.ruleImportSetting.model.view.editTitle').d('编辑业务规则定义自动转换配置')
      : intl.get('spfm.ruleImportSetting.model.view.createTitle').d('新增业务规则定义自动转换配置');
    const formRecord = record || listDs.create({}, 0);

    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '580px' },
      title,
      children: (
        <>
          <Form record={formRecord}>
            <TextField name="code" disabled={record} />
            <TextField name="description" />
            <TextArea name="convertSql" />
            <TextField name="valueField" />
            <TextField name="uniqueValueField" />
          </Form>
        </>
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: async () => {
        return new Promise(async (resolve) => {
          const validFlag = await formRecord.validate();
          if (validFlag) {
            delAutoConvert({
              ...formRecord.toData(),
              _status: record ? 'update' : 'create',
            })
              .then((res) => {
                if (getResponse(res)) {
                  notification.success({});
                  listDs.query();
                } else {
                  resolve(false);
                }
              })
              .finally(() => {
                resolve(true);
              });
          } else {
            resolve(false);
          }
        });
      },
      onCancel: () => {
        if (record) {
          record.reset();
        } else {
          listDs.remove(formRecord);
        }
        Modal.destroyAll();
      },
    });
  };

  return (
    <Fragment>
      <Header
        title={intl.get('spfm.ruleImportSetting.model.view.title').d('业务规则定义自动转换配置')}
      >
        <Button
          icon="add"
          funcType={FuncType.raised}
          color={ButtonColor.primary}
          onClick={() => openEditModal(null)}
        >
          {intl.get('hzero.common.button.creat').d('新建')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={listDs} columns={columns} />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['hzero.common', 'spfm.ruleImportSetting', 'spfm.rulesDefinition'],
})(Index);
