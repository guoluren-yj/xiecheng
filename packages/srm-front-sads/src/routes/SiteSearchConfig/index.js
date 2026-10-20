import React, { Fragment, useMemo } from 'react';
import {
  Button,
  Table,
  DataSet,
  Modal,
  Form,
  Select,
  Lov,
  TextArea,
  Icon,
  Tooltip,
  Row,
  Col,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';

import { saveConfig } from './api';
import { tableDS, formDS } from './ds';

import styles from './style.less';

function SiteSearchConfig() {
  const tableDs = useMemo(() => new DataSet(tableDS()), []);
  const columns = useMemo(
    () => [
      { name: 'tenantName', width: 200 },
      {
        name: 'aggregateAttrFlag',
        width: 150,
      },
      // {
      //   name: 'searchRequiredFieldList',
      //   width: 180,
      // },
      {
        name: 'matchLogicMeaning',
        width: 120,
      },
      {
        name: 'aggregateUomFlagMeaning',
        width: 120,
      },
      {
        name: 'recordConditionFlagMeaning',
        width: 120,
      },
      {
        name: 'recordWordFlagMeaning',
        width: 120,
      },
      { name: 'namedRecognitionFlagMeaning', width: 100 },
      { name: 'characterSplittingFlagMeaning', width: 100 },
      { name: 'categoryPredictionFlagMeaning', width: 100 },
      {
        name: 'remark',
        // width: 120,
      },
      {
        name: 'enabledFlagMeaning',
        width: 120,
      },
      {
        title: intl.get('hzero.common.action').d('操作'),
        width: 120,
        renderer: ({ record }) => {
          return (
            <>
              <Button
                funcType="link"
                color="primary"
                onClick={() => handleCreate(record.get('configId'), record)}
              >
                {intl.get('hzero.common.edit').d('编辑')}
              </Button>
              <Button funcType="link" color="primary" onClick={() => enableStatus(record.toData())}>
                {record.get('enabledFlag')
                  ? intl.get('hzero.common.button.disable').d('禁用')
                  : intl.get('hzero.common.button.enable').d('启用')}
              </Button>
            </>
          );
        },
      },
    ],
    []
  );

  const handleCreate = (isEdit = false, record) => {
    const formDs = new DataSet(formDS());
    if (isEdit) {
      const initData = record.toData();
      formDs.create({
        ...initData,
        // searchRequiredFieldList: initData.searchRequiredFieldList.map((i) => i.value),
      });
    }

    const title = isEdit
      ? intl.get('sads.searchConfig.view.updateConfig').d('编辑配置')
      : intl.get('sads.searchConfig.view.createConfig').d('新建配置');

    Modal.open({
      title,
      drawer: true,
      closable: true,
      style: { width: 380 },
      onOk: async () => {
        const flag = await formDs.current.validate();
        if (flag) {
          const data = formDs.current.toJSONData();
          const _d = Object.assign({}, data);
          // const { searchRequiredFieldList = [] } = data;
          // delete _d.searchRequiredFieldList;
          const res = getResponse(
            await saveConfig({
              ..._d,
              // requiredField: searchRequiredFieldList.join(','),
            })
          );
          if (res) {
            notification.success();
            tableDs.query(tableDs.currentPage);
            return true;
          }
          return false;
        }
        return false;
      },
      children: (
        <Form labelLayout="float" columns={1} dataSet={formDs}>
          <Lov name="tenantLov" disabled={isEdit} />
          <Select name="aggregateAttrFlag" />
          {/* <Select name="searchRequiredFieldList" /> */}
          <Row className={styles['inline-group-fields']}>
            <Col span={20}>
              <Select name="matchLogic" />
            </Col>
            <Col span={4} className={styles['icon-help']}>
              <Tooltip
                placement="top"
                title={intl
                  .get('sads.searchConfig.view.matchTypeHelp')
                  .d('搜索词的分词结果与目标词匹配关系')}
              >
                <Icon type="help" />
              </Tooltip>
            </Col>
          </Row>
          <Select
            name="aggregateUomFlag"
            // 搜索字段有单位时，一定是聚合单位
            // onOption={({ record: r }) => {
            //   const _d = formDs.current.get('searchRequiredFieldList');
            //   return {
            //     disabled: _d.length > 0 && _d.some((s) => s === 'uom') && r.get('value') === '0',
            //   };
            // }}
          />
          <Select name="recordConditionFlag" />
          <Select name="recordWordFlag" />
          <Select name="namedRecognitionFlag" />
          <Select name="characterSplittingFlag" />
          <Select name="categoryPredictionFlag" />
          <TextArea name="remark" maxLength={500} />
        </Form>
      ),
    });
  };

  const enableStatus = async (record) => {
    const res = getResponse(
      await saveConfig({
        ...record,
        // requiredField: (record.searchRequiredFieldList || []).map((i) => i.value).join(','),
        enabledFlag: +!record.enabledFlag,
      })
    );
    if (res) {
      notification.success();
      tableDs.query(tableDs.currentPage);
    }
  };

  return (
    <Fragment>
      <Header title={intl.get('sads.siteSearchConfig.view.title').d('主站搜索配置')}>
        <Button icon="add" color="primary" onClick={() => handleCreate()}>
          {intl.get('sads.searchConfig.view.createConfig').d('新建配置')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={tableDs} columns={columns} style={{ maxHeight: 'calc(100vh - 120px)' }} />
      </Content>
    </Fragment>
  );
}

export default formatterCollections({
  code: ['sads.siteSearchConfig', 'hzero.common', 'sads.searchConfig'],
})(SiteSearchConfig);
