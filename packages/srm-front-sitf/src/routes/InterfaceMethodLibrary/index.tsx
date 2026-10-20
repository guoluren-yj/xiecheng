/* eslint-disable react/jsx-filename-extension */
/**
 * @description 接口方法库
 * @export InterfaceMethodLibrary
 * @class InterfaceMethodLibrary
 * @extends {Component}
 */

import React, { Fragment, useMemo, useCallback, useEffect, useState, useRef } from 'react';
import {
  DataSet,
  Button,
  Modal,
  Table,
  TextArea,
  Form,
  TextField,
  Select,
  Lov,
  IntlField,
  Spin,
} from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { Card } from 'choerodon-ui';
import { isNil, isEmpty } from 'lodash';
import crypto from 'crypto-js';

import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import notification from 'hzero-front/lib/utils/notification';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import MarmotScriptButton from 'srm-front-boot/lib/components/MarmotScript/MarmotScriptButton';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';

import './index.less';
import {
  tableData,
  headerData,
  inputData,
  outputData,
  fetchCreate,
  fetchUpdate,
  fetchDisable,
  fetchEnable,
  fetchDelete,
  fetchSave,
  getComplementaryWordsService,
  fetchMarmotSave,
} from './inidialDataDs';

const inputColumns = [
  {
    name: 'columnCode',
    editor: true,
  },
  {
    name: 'columnName',
    editor: true,
  },
  {
    name: 'columnType',
    editor: true,
  },
  {
    name: 'nullable',
    editor: true,
  },
];

// 记录marmot编辑器每次保存后的版本
let newObjectVersionNumber = null;

const InterfaceMethodLibrary: React.FC<any> = props => {
  const [complementaryWords, setComplementaryWords] = useState([]);
  const tableDataDs = useMemo(() => new DataSet(tableData()), []);

  const inputDataDs = new DataSet(inputData());
  const outputDatadS = new DataSet(outputData());

  useEffect(() => {
    tableDataDs.setQueryParameter('tenantId', getCurrentOrganizationId());
    tableDataDs.query();
    getComplementaryWordsService().then(res => {
      if (getResponse(res)) {
        // 自定义的代码提示
        if (!isEmpty(res)) {
          setComplementaryWords(crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(res)));
        }
      }
    });
  }, []);

  const handleEnableOrDisable = useCallback(async record => {
    const enabledFlag = record.get('enabledFlag');
    const currentData = record.toData();
    if (enabledFlag === 1) {
      Modal.confirm({
        title: intl
          .get('scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary.disable')
          .d('禁用'),
        children: intl
          .get('scux.interfaceMethodLibrary.view..essage.interfaceMethodLibrary.disable')
          .d('是否确认要禁用当前数据!'),
        onOk: async () => {
          const res = await fetchDisable(currentData);
          const resp = getResponse(res);
          if (resp) {
            notification.success({});
            tableDataDs.query();
          }
        },
      });

      return;
    }
    const res = await fetchEnable(currentData);
    const resp = getResponse(res);
    if (resp) {
      notification.success({});
      tableDataDs.query();
    }
  }, []);

  const handleDelete = useCallback(
    async type => {
      const { selected } = type === 1 ? inputDataDs : outputDatadS;
      const seledtedData = selected.map(item => item.toData());
      const filterData = seledtedData.filter(item => !isNil(item.id));
      if (!isEmpty(seledtedData)) {
        if (isEmpty(filterData)) {
          if (type === 1) {
            inputDataDs.remove(selected);
          } else {
            outputDatadS.remove(selected);
          }
        } else {
          const res = await fetchDelete(filterData);
          const resp = getResponse(res);
          if (resp) {
            notification.success({});
            if (type === 1) {
              inputDataDs.query();
            } else {
              outputDatadS.query();
            }
          }
        }
      } else {
        notification.warning({
          message: intl.get('scux.interfaceMethodLibrary.view.message.notSeleted').d('请勾选数据'),
        });
      }
    },
    [inputDataDs, outputDatadS]
  );

  const buttonsInput = useMemo(
    () => [
      'add',
      <Button funcType={FuncType.flat} icon="delete" onClick={() => handleDelete(1)}>
        {intl.get('scux.interfaceMethodLibrary.view.button.delete').d('批量删除')}
      </Button>,
    ],
    []
  );

  const buttonsOuput = useMemo(
    () => [
      'add',
      <Button funcType={FuncType.flat} icon="delete" onClick={() => handleDelete(2)}>
        {intl.get('scux.interfaceMethodLibrary.view.button.delete').d('批量删除')}
      </Button>,
    ],
    []
  );

  const handleInputOrOutput = useCallback(
    record => {
      const { functionId, tenantId, functionType } = record.toData() || {};
      const headerDs = new DataSet(headerData());
      headerDs.loadData([record.toData()]);
      inputDataDs.setQueryParameter('functionId', functionId);
      outputDatadS.setQueryParameter('functionId', functionId);
      inputDataDs.query().then(res => {
        const { functionLibraryDetailList } = res || {};
        inputDataDs.loadData(functionLibraryDetailList);
      });
      outputDatadS.query().then(res => {
        const { functionLibraryDetailList } = res || {};
        outputDatadS.loadData(functionLibraryDetailList);
      });
      Modal.open({
        title: intl
          .get('scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary.inputOrOutput')
          .d('输入输出'),
        drawer: true,
        style: { width: 600 },
        children: (
          <div className="contentStyle">
            <Card>
              <div className="titleTag">
                {intl.get(`scux.interfaceMethodLibrary.view.title.baseInfo`).d('基础信息')}
              </div>
              <Form dataSet={headerDs} columns={2} labelLayout={LabelLayout.float}>
                <TextField name="functionCode" disabled />
                <TextField name="functionName" disabled />
                <Select name="functionType" disabled />
                <Select name="applyFieldTypes" disabled />
                <TextArea name="remark" disabled colSpan={2} />
              </Form>
            </Card>
            <Card>
              <div className="titleTag">
                {intl.get(`scux.interfaceMethodLibrary.view.title.inPut`).d('输入')}
              </div>
              <Table
                dataSet={inputDataDs}
                columns={inputColumns}
                buttons={buttonsInput as Buttons[]}
              />
            </Card>
            {functionType !== 'function' && (
              <Card>
              <div className="titleTag">
                {intl.get(`scux.interfaceMethodLibrary.view.title.outPut`).d('输出')}
              </div>
              <Table
                dataSet={outputDatadS}
                columns={inputColumns}
                buttons={buttonsOuput as Buttons[]}
              />
            </Card>
            )}
          </div>
        ),
        onOk: async () => {
          let flag = false;
          const validateFlag = await inputDataDs.validate();
          const validateFlag1 = await outputDatadS.validate();
          if (validateFlag && validateFlag1) {
            const dataOne = inputDataDs.toData().map(item => ({ ...item, functionId, tenantId }));
            const dataTwo = outputDatadS.toData().map(item => ({ ...item, functionId, tenantId }));
            const currentData = {
              ...headerDs.current?.toData(),
              functionLibraryDetailList: [...dataOne, ...dataTwo],
            };
            const res = await fetchSave(currentData);
            const resp = getResponse(res);
            if (resp) {
              notification.success({});
              flag = true;
              tableDataDs.query();
            }
          } else {
            notification.warning({
              message: intl
                .get('scux.interfaceMethodLibrary.view.message.notNull')
                .d('请填写必填项!'),
            });
          }

          return flag;
        },
      });
    },
    [inputDataDs, outputDatadS]
  );

  const handleMarmotSave = useCallback(async (resole, reject, marmotScriptContent, record) => {
    console.log(newObjectVersionNumber);
    
  const currentData = {
    contentInput: marmotScriptContent.inputContent,
    content: marmotScriptContent.scriptContent,
    functionId: record.get('functionId'),
    objectVersionNumber: newObjectVersionNumber,
  };
   const res = await fetchMarmotSave(currentData);
   const resp = getResponse(res);
   if(resp) {
    newObjectVersionNumber = resp.objectVersionNumber;
    notification.success({});
    tableDataDs.query();
   }
  }, [newObjectVersionNumber])

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'functionCode',
      },
      {
        name: 'functionName',
      },
      {
        name: 'functionTypeMeaning',
      },
      {
        name: 'applyFieldTypesMeaning',
      },
      {
        name: 'tenantName',
      },
      {
        name: 'belongsToMeaning',
      },
      {
        header: intl
          .get('scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary.details.content')
          .d('详细内容'),
        renderer: ({ record }) => (
          <MarmotScriptButton
            name="content"
            record={record}
            scriptCacheKey={record?.get('functionDetail')}
            complementaryWords={complementaryWords}
            scriptContent={record?.get('content')}
            marmotScriptInput={record?.get('contentInput')}
            beforeOpenModal={() => {
              newObjectVersionNumber = record?.get('objectVersionNumber');
            }}
            onClose={() => {
              newObjectVersionNumber = null;
            }}
            buttonName={intl
              .get('scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary.mamort')
              .d('marmot工作台')}
            onSave={(resole, reject, marmotScriptContent) => handleMarmotSave(resole, reject, marmotScriptContent, record)}
          />
        ),
      },
      {
        name: 'enabledFlagMeaning',
      },
      {
        header: intl
          .get('scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary.options')
          .d('操作'),
        align: ColumnAlign.center,
        lock: ColumnLock.right,
        width: 150,
        renderer: ({ record }) => (
          <>
            <a onClick={() => handleAddData(1, record)}>
              {intl
                .get('scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary.editor')
                .d('编辑')}
            </a>
            <a style={{ margin: '0px 8px' }} onClick={() => handleEnableOrDisable(record)}>
              {record?.get('enabledFlag') === 1
                ? intl
                    .get('scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary.disable')
                    .d('禁用')
                : intl
                    .get('scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary.enable')
                    .d('启用')}
            </a>
            <a onClick={() => handleInputOrOutput(record)}>
              {intl
                .get('scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary.inputOrOutput')
                .d('输入输出')}
            </a>
          </>
        ),
      },
    ],
    []
  );

  const handleAddData = useCallback((type, record) => {
    const headerDataDs = new DataSet(headerData());
    const editorFlag = type === 0;
    if (!editorFlag) {
      headerDataDs.loadData([record.toData()]);
    }
    Modal.open({
      title: editorFlag
        ? intl.get('scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary.add').d('新建')
        : intl
            .get('scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary.editor')
            .d('编辑'),
      drawer: true,
      children: (
        <Form dataSet={headerDataDs}>
          <TextField name="functionCode" disabled={!editorFlag} />
          <IntlField name="functionName" />
          <Lov name="tenantNameLov" disabled={!editorFlag} />
          <Select name="functionType" disabled={!editorFlag} />
          <Select name="applyFieldTypes" disabled={!editorFlag} />
          <TextArea name="remark" disabled={!editorFlag} />
          <Select name="enabledFlag" disabled={!editorFlag} />
        </Form>
      ),
      onOk: async () => {
        let flag = false;
        const validDateFlag = await headerDataDs.validate();
        if (validDateFlag) {
          const currentData = headerDataDs.current?.toJSONData();
          const res = editorFlag ? await fetchCreate(currentData) : await fetchUpdate(headerDataDs);
          const resp = getResponse(res);
          if (resp) {
            flag = true;
            notification.success({});
            tableDataDs.query();
          }
        } else {
          notification.warning({
            message: intl
              .get('scux.interfaceMethodLibrary.view.message.notNull')
              .d('请填写必填项!'),
          });
        }

        return flag;
      },
    });
  }, []);

  return (
    <Fragment>
      <Header
        title={intl
          .get(`scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary`)
          .d('接口方法库')}
      >
        <Button icon="add" color={ButtonColor.primary} onClick={() => handleAddData(0, {})}>
          {intl.get('scux.interfaceMethodLibrary.view.title.interfaceMethodLibrary.add').d('新建')}
        </Button>
      </Header>
      <Content>
        <FilterBarTable
          key="interfaceMethodLibrary"
          cacheState
          border={false}
          customizable
          customizedCode="SCUX.CUSTOMIZABLE.SANGFOR.INTERFACEMETHODLIBRARY"
          filterBarConfig={{
            cacheKey: 'interfaceMethodLibrary',
            autoQuery: false,
          }}
          dataSet={tableDataDs}
          columns={columns}
        />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['scux.interfaceMethodLibrary', 'hzero.common'],
})(InterfaceMethodLibrary);
