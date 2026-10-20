/* eslint-disable */
import React, { Fragment, useEffect, useState } from 'react';
import {
  DataSet,
  Table,
  Modal,
  Form,
  Lov,
  Button,
  Spin,
  IntlField,
  TextField,
  Pagination,
} from 'choerodon-ui/pro';
import { omit, isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import {
  saveTemplateHeaderAndLines,
  saveTemplateLines,
  checkTemplateLines,
  // getEntityField,
} from '@/services/fieldMappingDefinationService';

import { getFormDs, getFieldFormDs, getFieldTableDs } from '../stores';
import Drawer from './Drawer';
import styles from './index.less';

function FieldMappingDefinationDetail(props) {
  const [formDs] = useState(new DataSet(getFormDs()));
  const [fieldFormDs, setFieldFormDs] = useState();
  const [fieldTableDs] = useState(new DataSet(getFieldTableDs()));
  const [btnDisabledadFlag, setBtnDisabledadFlag] = useState(true); // 按钮禁用标识
  const [saveLoading, setSaveLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [triggerFieldHidden, setTriggerFieldHidden] = useState(null); // 隐藏触发字段标识
  const [lineList, setLineList] = useState([]);
  const isReadonly = formDs.current && formDs.current.get('isEnable') === 1;
  const [pagination, setPagination] = useState({
    total: 0,
    page: 0,
    pageSize: 0,
  });

  const {
    match: { params = {} },
  } = props;
  const { id } = params;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setFetchLoading(true);
    formDs.setQueryParameter('id', id);
    formDs.query().then((res) => {
      setFetchLoading(false);
      const result = getResponse(res);
      if (result) {
        setBtnDisabledadFlag(false);
        const {
          adaptorCnfTemplateLineList = [],
          id: templateId,
          sourceCode,
          sourcePriceDatabase,
          targetCode,
          transferPriceDatabase,
        } = result;
        setTriggerFieldHidden(sourceCode !== targetCode);
        const fieldFormDsConfig = getFieldFormDs({
          templateId,
          sourceCode,
          sourcePriceDatabase,
          targetCode,
          transferPriceDatabase,
        });
        setFieldFormDs(
          new DataSet({
            ...fieldFormDsConfig,
          })
        );
        // // 处理目标字段
        // getEntityField({
        //   templateId,
        //   entityCode: targetCode,
        //   target: false,
        //   // name: data.targetField,
        // }).then(fieldRes => {
        //   const map = {};
        //   fieldRes.content.forEach(item => {
        //     const key = item.name;
        //     map[key] = item.description;
        //   });
        //   adaptorCnfTemplateLineList.forEach(item => {
        //     // eslint-disable-next-line no-param-reassign
        //     item.targetField = `${map[item.targetField]}-${item.targetField}`;
        //   });
        if (adaptorCnfTemplateLineList && adaptorCnfTemplateLineList.length) {
          setPagination({
            total: adaptorCnfTemplateLineList.length,
            page: 1,
            pageSize: 10,
          });
          setLineList([...adaptorCnfTemplateLineList]);
          fieldTableDs.loadData(adaptorCnfTemplateLineList.slice(0, 10));
        } else {
          setPagination({
            total: 0,
            page: 1,
            pageSize: 10,
          });
          setLineList([]);
          fieldTableDs.loadData([]);
        }
        // });
      }
    });
  };

  const saveHeaderAndLines = async (lineData = []) => {
    if (formDs.current) {
      const result = await formDs.validate();
      if (result) {
        setSaveLoading(true);
        const data = formDs.current.toJSONData() || {};
        const headerData = omit(data, [
          'adaptorCnfTemplateLineList',
          'sceneLov',
          'sourceLov',
          'targetLov',
        ]);
        const saveData = headerData;
        if (!isEmpty(lineData)) {
          saveData.adaptorCnfTemplateLineList = lineData;
        }
        saveTemplateHeaderAndLines(saveData).then((res) => {
          setSaveLoading(false);
          if (getResponse(res)) {
            notification.success();
            fetchData();
            if (res?._tip) {
              Modal.info({
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: res?._tip ?? '',
              });
            }
          }
        });
      }
    }
  };

  const columns = [
    { name: 'lineNum', width: 80, lock: 'left' },
    {
      name: 'targetField',
      width: 150,
      lock: 'left',
      renderer: ({ record, text }) => {
        if (isReadonly) {
          return <a onClick={() => editField(record.toData())}>{text}</a>;
        }
        return text;
      },
    },
    { name: 'targetFieldName', width: 150, lock: 'left' },
    { name: 'valueType', width: 100, lock: 'left' },
    { name: 'sourceField', width: 150 },
    { name: 'sourceFieldName', width: 150 },
    { name: 'triggerField', width: 150, hidden: triggerFieldHidden },
    { name: 'finalValue', width: 150 },
    { name: 'remark', width: 150 },
    { name: 'configTableCode', width: 200 },
    { name: 'configFieldName', width: 150 },
    { name: 'executeExepression', width: 200 },
    {
      header: intl.get('hzero.common.button.action').d('操作'),
      width: 100,
      hidden: isReadonly,
      align: 'center',
      lock: 'right',
      renderer: ({ record }) => (
        <a onClick={() => editField(record.toData())}>
          {intl.get('hzero.common.button.edit').d('编辑')}
        </a>
      ),
    },
  ];

  /**
   *
   * @param {*} data 编辑数据
   * @param {*} isCreate true为新建,false为编辑
   */
  const editField = (data, isCreate = false) => {
    const templateId = data.headerId;
    if (!formDs.current) {
      return;
    }
    if (data && data.targetField && !formDs.current.get('transferPriceDatabase')) {
      const revertTargetField = data.targetField.split('-')[1];
      // eslint-disable-next-line no-param-reassign
      data.targetField = revertTargetField;
    }
    if (data && data.uploadFlag && !data.uploadTransformType) {
      // eslint-disable-next-line no-param-reassign
      data.uploadTransformType = 'COPY';
    }
    const { sourceCode, targetCode } = formDs.current.data;
    debugger;
    fieldFormDs.create(data);
    Modal.open({
      title: isCreate
        ? intl.get('spfm.fieldMapDefine.view.button.addField').d('新建字段')
        : isReadonly
        ? intl.get('spfm.fieldMapDefine.view.button.viewField').d('查看字段')
        : intl.get('spfm.fieldMapDefine.view.button.editField').d('编辑字段'),
      drawer: true,
      style: { width: 380 },
      children: (
        <Drawer
          isCreate={isCreate}
          templateId={templateId}
          sourceStructureCode={sourceCode}
          targetStructureCode={targetCode}
          fieldFormDs={fieldFormDs}
          isReadonly={isReadonly}
        />
      ),
      okText: intl.get(`hzero.common.button.save`).d('保存'),
      cancelText: isReadonly ? intl.get(`hzero.common.button.close`).d('关闭') : undefined,
      cancelProps: isReadonly ? { color: 'primary' } : undefined,
      footer: (okBtn, cancelBtn) =>
        isReadonly ? (
          cancelBtn
        ) : (
          <>
            {okBtn}
            {cancelBtn}
          </>
        ),
      onOk: () => saveField(isCreate),
      onClose: () => fieldFormDs.reset(),
      onCancle: () => fieldFormDs.reset(),
    });
  };

  /**
   *
   * @param {*} isCreate true为新建,false为编辑
   */
  const saveField = async (isCreate) => {
    const result = await fieldFormDs.validate();
    if (!result) {
      return false;
    } else {
      const lineData = fieldFormDs.current.toData();
      // 弹窗校验数据
      const { sourceField = '', targetField = '' } = lineData;
      const reg = /(.*)attribute([^\d]*)/; // 不含数字
      const sourceRegres = reg.exec(sourceField);
      const targetRegres = reg.exec(targetField);
      const sourceAffix = sourceRegres && sourceRegres[2];
      const targetAffix = targetRegres && targetRegres[2];
      const lowerSrcAff = sourceAffix?.toLowerCase() ?? '';
      const lowerTgtAff = targetAffix?.toLowerCase() ?? '';
      const condition = sourceRegres && targetRegres && lowerSrcAff !== lowerTgtAff;
      if (condition) {
        const compareRes = await new Promise((resolve) => {
          return Modal.open({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: intl.get('spfm.fieldMapDefine.view.tips.fieldDiff', {
              targetField,
              sourceField,
            }),
            onOk: () => {
              resolve(true);
            },
            onCancel: () => {
              resolve(false);
            },
          });
        });
        if (!compareRes) return false;
      }
      const allLinesData = fieldTableDs.toData() || [];
      const sameNumLine = allLinesData.find(
        (item) => item.id !== lineData.id && item.lineNum === lineData.lineNum
      );
      if (sameNumLine) {
        notification.warning({
          message: intl.get('spfm.fieldMapDefine.view.message.repeatData').d('优先级不能重复!'),
        });
        return false;
      }
      // 常数为值集存储时 取出valueField放置finalValue
      if (lineData.valueType === 'final_value') {
        if (lineData.finalValueLov && lineData.valueField) {
          const finalValueLov = Object.getOwnPropertyDescriptor(
            lineData.finalValueLov,
            lineData.valueField
          ).value;
          lineData.finalValue = finalValueLov;
        }
      }
      const {
        id: headerId,
        sourceCode,
        targetCode,
        sourcePriceDatabase,
        transferPriceDatabase,
      } = formDs.current.toData();
      const saveData = {
        ...omit(lineData, ['targetFieldLov', 'sourceFieldLov']),
        _status: isCreate ? 'create' : 'update',
        headerId,
      };
      // if (!saveData.uploadFlag) {
      //   saveData.uploadTransformType = null;
      //   saveData.useFirstLine = null;
      // }
      saveData.sourceStructureCode = sourcePriceDatabase ? null : sourceCode;
      saveData.targetStructureCode = transferPriceDatabase ? null : targetCode;
      const data = await checkTemplateLines(saveData);
      if (getResponse(data)) {
        saveTemplateLines(saveData).then((res) => {
          if (getResponse(res)) {
            notification.success();
            fetchData();
          }
        });
      } else {
        return false;
      }
    }
  };

  // 删除字段
  const removeField = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: async () => {
        // 行数据
        const selectedLines = fieldTableDs.selected || [];
        const deleteLines = selectedLines.map((item) => ({
          ...item.toData(),
          _status: 'delete',
        }));
        saveHeaderAndLines(deleteLines);
      },
    });
  };

  const handleChangePagination = (page, pageSize) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const allSize = lineList.length;
    setPagination({
      total: allSize,
      page,
      pageSize,
    });
    fieldTableDs.loadData(lineList.slice(startIndex, Math.min(endIndex, allSize)));
  };

  return (
    <Fragment>
      <Header
        title={intl.get('spfm.fieldMapDefine.view.title.detail').d('自动填单模板定义明细')}
        backPath="/spfm/field-mapping-defination/list"
      >
        {!isReadonly && (
          <Button
            color="primary"
            icon="save"
            onClick={() => saveHeaderAndLines()}
            wait={200}
            waitType="debounce"
            disabled={btnDisabledadFlag}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        )}
      </Header>
      <Content>
        <Spin spinning={fetchLoading || saveLoading}>
          <div style={{ marginBottom: '32px' }}>
            <div className={styles.title}>
              {intl.get('hzero.common.view.title.baseInfo').d('基础信息')}
            </div>
            <Form dataSet={formDs} columns={3} labelLayout="float">
              <TextField name="templateCode" disabled required={false} />
              <IntlField name="templateName" disabled={fetchLoading || isReadonly} />
              <Lov name="sceneLov" disabled />
              <Lov name="sourceLov" />
              {formDs.current && formDs.current.get('sourcePriceDatabase') && (
                <TextField name="sourcePriceDatabase" disabled />
              )}
              <Lov name="targetLov" />
              {formDs.current && formDs.current.get('transferPriceDatabase') && (
                <TextField name="transferPriceDatabase" disabled />
              )}
            </Form>
          </div>
          <div>
            <div className={styles.title}>
              {intl.get('spfm.fieldMapDefine.view.title.detailManagement').d('明细管理')}
            </div>
            {!fetchLoading && !isReadonly && (
              <div style={{ marginBottom: '10px' }}>
                <Button
                  icon="add"
                  funcType="flat"
                  onClick={() => editField({}, true)}
                  color="primary"
                  disabled={btnDisabledadFlag}
                >
                  {intl.get('spfm.fieldMapDefine.view.button.addField').d('新建字段')}
                </Button>
                <Button
                  icon="delete"
                  funcType="flat"
                  onClick={removeField}
                  disabled={
                    btnDisabledadFlag ||
                    !fieldTableDs.selected ||
                    fieldTableDs.selected.length === 0
                  }
                >
                  {intl.get('spfm.fieldMapDefine.view.button.removeField').d('删除字段')}
                </Button>
              </div>
            )}
            <Table
              dataSet={fieldTableDs}
              columns={columns}
              selectionMode={fetchLoading || isReadonly ? false : undefined}
            />
            <Pagination
              {...pagination}
              showQuickJumper
              style={{ textAlign: 'right' }}
              onChange={handleChangePagination}
            />
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.fieldMapDefine', 'hzero.common'],
})(observer(FieldMappingDefinationDetail));
