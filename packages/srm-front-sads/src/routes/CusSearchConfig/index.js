import React, { Component, Fragment } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  TextField,
  DataSet,
  Icon,
  TextArea,
  Lov,
  Select,
  Output,
  Spin,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { isFunction } from 'lodash';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import EnableTag from '@/components/EnableTag';

import { configDs, conditionDs, configFormDs } from './ds';
import { deleteCondition, saveSearchConfig } from './api';

import styles from './style.less';

const getFormLayout = (readOnly) => ({
  labelLayout: readOnly ? 'vertical' : 'float',
  className: readOnly ? 'c7n-pro-vertical-form-display' : '',
});

const getFormFields = ({ fields = [], readOnly = false }) => {
  return fields.map((field) => {
    const { FormField = TextField, render, ...fieldProps } = field;
    const Field = readOnly ? Output : FormField;
    return render && isFunction(render) ? render() : <Field {...fieldProps} />;
  });
};

const ConditionList = observer((props) => {
  const { dataSet, readOnly, afterDelete = (e) => e } = props;

  async function handleDelete(record) {
    if (record.get('conditionId')) {
      record.setState('deleteLoading', true);
      const res = getResponse(await deleteCondition(record.toData()));
      record.setState('deleteLoading', false);
      if (res) {
        notification.success();
        const r = record;
        r.status = 'add';
        dataSet.remove(record);
        afterDelete();
      }
    } else {
      dataSet.remove(record);
    }
  }

  return (
    <div className="condition-wrapper">
      {dataSet.records.map((record) => (
        <Spin spinning={!!record.getState('deleteLoading')}>
          <div className="condition-line">
            <Form
              record={record}
              columns={2}
              style={{ width: readOnly ? '100%' : '320px' }}
              {...getFormLayout(readOnly)}
            >
              {getFormFields({
                readOnly,
                fields: [
                  {
                    name: 'conditionCode',
                    colSpan: 2,
                  },
                  {
                    name: 'orderSeq',
                  },
                  {
                    name: 'conditionType',
                    clearButton: false,
                    FormField: Select,
                  },
                  {
                    name: 'conditionApiType',
                  },
                  {
                    name: 'conditionApiMeth',
                  },
                  {
                    name: record.get('conditionType') === 'SQL' ? 'conditionSql' : 'conditionUrl',
                    resize: 'both',
                    colSpan: 2,
                    FormField: TextArea,
                  },
                  {
                    name: 'conditionParams',
                    resize: 'both',
                    colSpan: 2,
                    FormField: TextArea,
                  },
                ],
              })}
            </Form>
            {!readOnly && <Icon type="delete" onClick={() => handleDelete(record)} />}
          </div>
        </Spin>
      ))}
      {!readOnly && (
        <Button
          icon="playlist_add"
          funcType="flat"
          color="primary"
          onClick={() => dataSet.create({})}
        >
          {intl.get('sads.searchConfig.button.createConditionPre').d('新增前置条件')}
        </Button>
      )}
    </div>
  );
});

const ConfigDetail = (props) => {
  const { readOnly, configHeadDs, conditionListDs, afterDelete = (e) => e } = props;
  return (
    <div className={styles['config-wrappper']}>
      <Form columns={1} dataSet={configHeadDs} {...getFormLayout(readOnly)}>
        {getFormFields({
          readOnly,
          fields: [
            {
              name: 'searchConfigCode',
            },
            {
              name: 'searchConfigName',
            },
            {
              name: 'tenantLov',
              FormField: Lov,
            },
            {
              name: 'indexLov',
              FormField: Lov,
            },
            {
              name: 'remark',
            },
            {
              name: 'searchTemplate',
              resize: 'both',
              FormField: TextArea,
            },
          ],
        })}
      </Form>
      <ConditionList dataSet={conditionListDs} readOnly={readOnly} afterDelete={afterDelete} />
    </div>
  );
};

@formatterCollections({ code: ['sads.searchConfig'] })
@withProps(() => ({ listDs: new DataSet(configDs()) }), {
  cacheState: true,
  keepOriginDataSet: true,
})
export default class CusSearchConfig extends Component {
  componentDidMount() {
    this.props.listDs.query();
  }

  getColumns = () => {
    return [
      { name: 'searchConfigCode', width: 180 },
      { name: 'searchConfigName', width: 240 },
      { name: 'tenantName', width: 240 },
      { name: 'indexName', width: 150 },
      { name: 'remark', minWidth: 200 },
      {
        name: 'enabledFlag',
        width: 100,
        align: 'center',
        renderer: ({ value }) => <EnableTag enabledFlag={value} />,
      },
      {
        name: 'action',
        width: 160,
        align: 'center',
        renderer: ({ record }) => {
          const searchConfig = record.toData();
          const { enabledFlag } = searchConfig;
          return (
            <span className="action-link">
              <a onClick={() => this.handleCreate(searchConfig, true)}>
                {intl.get('hzero.common.button.look').d('查看')}
              </a>
              <a onClick={() => this.handleCreate(searchConfig)} disabled={enabledFlag}>
                {intl.get('hzero.common.edit').d('编辑')}
              </a>
              <a
                onClick={() =>
                  this.handleUpdate({
                    ...searchConfig,
                    enabledFlag: enabledFlag ? 0 : 1,
                  })
                }
              >
                {enabledFlag
                  ? intl.get('hzero.common.button.disable').d('禁用')
                  : intl.get('hzero.common.button.enable').d('启用')}
              </a>
            </span>
          );
        },
      },
    ];
  };

  handleCreate = (configData = {}, readOnly = false) => {
    const { listDs } = this.props;
    const { searchConditionList = [], ...searchConfig } = configData;
    const configHeadDs = new DataSet(configFormDs());
    const conditionListDs = new DataSet(conditionDs());

    configHeadDs.create(searchConfig);
    conditionListDs.loadData(searchConditionList);

    const title = configData.searchConfigId
      ? readOnly
        ? intl.get('sads.searchConfig.view.lookConfig').d('查看配置')
        : intl.get('sads.searchConfig.view.updateConfig').d('编辑配置')
      : intl.get('sads.searchConfig.view.createConfig').d('新建配置');

    const footerProps = readOnly
      ? { okFirst: true, okText: intl.get('hzero.common.button.close').d('关闭') }
      : {};

    Modal.open({
      title,
      drawer: true,
      closable: true,
      ...footerProps,
      style: { width: 380 },
      onOk: async () => {
        if (readOnly) return true;
        const headFlag = await configHeadDs.validate();
        const conditionFlag = await conditionListDs.validate();
        if (headFlag && conditionFlag) {
          const searchConfigInfo = configHeadDs.current.toJSONData();
          const searchConditions = conditionListDs.toJSONData();
          return this.handleSave(
            { ...searchConfigInfo, searchConditionList: searchConditions },
            !configData.searchConfigId
          );
        } else {
          return false;
        }
      },
      children: (
        <ConfigDetail
          readOnly={readOnly}
          configHeadDs={configHeadDs}
          conditionListDs={conditionListDs}
          afterDelete={() => {
            listDs.query(listDs.currentPage);
          }}
        />
      ),
    });
  };

  handleSave = async (params, isCreate = true) => {
    const { listDs } = this.props;
    const res = getResponse(await saveSearchConfig(params));
    if (res) {
      notification.success();
      listDs.query(isCreate ? 1 : listDs.currentPage);
      return true;
    } else {
      return false;
    }
  };

  handleUpdate = async (params) => {
    const { listDs } = this.props;
    listDs.status = 'loading';
    const res = getResponse(await saveSearchConfig(params));
    listDs.status = 'ready';
    if (res) {
      notification.success();
      listDs.query(listDs.currentPage);
    }
  };

  render() {
    return (
      <Fragment>
        <Header title={intl.get('sads.searchConfig.view.title').d('个性化搜索配置')}>
          <Button icon="add" color="primary" onClick={() => this.handleCreate()}>
            {intl.get('sads.searchConfig.view.createConfig').d('新建配置')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={this.props.listDs} columns={this.getColumns()} />
        </Content>
      </Fragment>
    );
  }
}
