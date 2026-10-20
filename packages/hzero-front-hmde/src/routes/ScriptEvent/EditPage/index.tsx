import React, { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import Context, { IStore } from '@/routes/ScriptEvent/store';
import {
  Button,
  CodeArea,
  Modal,
  notification,
  Table,
  Tooltip,
  message,
  // Spin,
  Select,
  // Form,
  DataSet,
} from 'choerodon-ui/pro/lib';
import { Content, Header } from 'components/Page';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import { Collapse } from 'choerodon-ui';
// import { Size } from 'choerodon-ui/lib/_util/enum';
import { getResponse, isTenantRoleLevel } from 'utils/utils';
import styles from './index.less';
import constructScriptCodeDataSet from '../datasets/constructScriptCodeDataSet';
import constructDebuggerInputDataSet from '../datasets/constructDebuggerInputDataSet';
import constructDebuggerOutputDataSet from '../datasets/constructDebuggerOutputDataSet';
import ImgIcon from '@/utils/ImgIcon';

// import PopoverInsertReferenceField from './PopoverInsertReferenceField';
import ModalImportParamsConfig from './ModalImportParams';
import { lowcodeRequest as request } from '@/utils/lowcodeRequest';
import resizable from '@/utils/resizable';
import {
  queryScriptDetailService,
  updateScriptDetailService,
  debugScriptService,
  getCurrentRole,
} from '@/services/scriptEventService';
import constructInputArgDataSet from '../datasets/constructInputArgDataSet';
import constructOutputArgDataSet from '../datasets/constructOutputArgDataSet';
import { rolesDS } from '../datasets/rolesDS';

const codeAreaOptions = {
  name: 'javascript',
  lineWrapping: true,
  autoRefresh: true,
  lint: { esversion: 10 },
};

const ScriptEditPage = (props) => {
  const {
    match: {
      params: { id: scriptId, type: viewType },
    },
    location: { state },
  } = props;
  const { store } = useContext<{ store: IStore }>(Context as any);

  // state //
  const [debugResultStatus, setDebugResultStatus] = useState<'' | 'success' | 'fail'>('');
  const [waitingDebugResult, setWaitingDebugResult] = useState(false);
  // const [editorFocused, setEditorFocused] = useState(false);

  // on: init //
  const scriptCodeDataSet = useMemo(() => {
    return constructScriptCodeDataSet();
  }, []);

  const debuggerInputDataSet = useMemo(() => {
    return constructDebuggerInputDataSet();
  }, []);

  const debuggerOutputDataSet = useMemo(() => {
    return constructDebuggerOutputDataSet();
  }, []);

  const inputArgDataSet = useMemo(() => {
    return constructInputArgDataSet();
  }, []);

  const outputArgDataSet = useMemo(() => {
    return constructOutputArgDataSet();
  }, []);

  const currentRoleDS = useMemo(() => new DataSet(rolesDS()), []);

  // const showInsertRefrenceFieldPopover = useMemo(() => {
  //   return store.state.showInsertRefrenceFieldPopover;
  // }, [store.state.showInsertRefrenceFieldPopover]);

  const refCodeArea = useRef<any>(null); // as { current: IInstance }

  const refDashboard = useRef<any>(null);
  const refDashboardResizer = useRef<any>(null);

  const onCancel = useCallback(() => {
    store.setState('importParamsProcessedData', []);
    // store.setState('currentPage', 'front');
  }, []);

  // const onInsertReferenceField = useCallback((fieldString: string) => {
  //   const editor = refCodeArea.current;
  //   editor.doc.replaceSelection(`\${${fieldString}}`);
  // }, []);

  const onSave = useCallback((resData?) => {
    const recordScriptCode = scriptCodeDataSet.toData()[0] as { scriptCode: string };

    const inputReferenceString = JSON.stringify({
      datasetData:
        resData && store.state.importParamsDirection === 'in' ? resData : inputArgDataSet.toData(),
      formattedObject: store.state.inputReferenceFormattedObject,
      testInputJSON: (debuggerInputDataSet.toData()[0] as { debuggerInput: string })?.debuggerInput,
    });

    const outputReferenceString = JSON.stringify({
      datasetData:
        resData && store.state.importParamsDirection !== 'in' ? resData : outputArgDataSet.toData(),
      formattedObject: store.state.outputReferenceFormattedObject,
    });

    request(updateScriptDetailService.url, {
      method: updateScriptDetailService.method,
      body: {
        ...store.state.currentSelectedScriptDetail,
        data: recordScriptCode.scriptCode,
        inputReference: inputReferenceString,
        outputReference: outputReferenceString,
      } as typeof updateScriptDetailService.payload,
    }).then(
      (res) => {
        if (res?.failed) {
          message.error(res.message, undefined, undefined, 'top');
        } else {
          initData();
          message.success('变更已保存', undefined, undefined, 'top');
        }
      },
      () => {
        message.error('保存失败', undefined, undefined, 'top');
      }
    );
  }, []);

  const onDebug = useCallback(() => {
    const scriptText = (scriptCodeDataSet.toData()[0] as { scriptCode: string }).scriptCode;
    const { roleId, tenantId } = currentRoleDS?.current?.toData() || {};
    let param = {};
    try {
      const parsed = JSON.parse(
        (debuggerInputDataSet.toData()[0] as { debuggerInput: string })?.debuggerInput ||
          (undefined as any)
      );
      param = parsed;
    } catch (error) {
      notification.open({
        message: '测试输入JSON解析失败',
        description: '',
      });
      return;
    }

    setWaitingDebugResult(true);

    request(debugScriptService.url, {
      method: debugScriptService.method,
      body: {
        scriptText,
        param,
        roleId,
        tenantId,
      } as typeof debugScriptService.payload,
    }).then((response: typeof debugScriptService.response) => {
      if (response) {
        if ('failed' in response) {
          setDebugResultStatus('fail');
          debuggerOutputDataSet.loadData([
            {
              debuggerOutput: response?.message,
            },
          ]);
        } else {
          setDebugResultStatus('success');
          onSave();
          debuggerOutputDataSet.loadData([
            {
              debuggerOutput: JSON.stringify(response?.result),
            },
          ]);
        }
      }
      setTimeout(() => {
        setWaitingDebugResult(false);
      }, 0);
    });
  }, []);

  useEffect(() => {
    initData();
    getCurrentRole().then((res) => {
      if (getResponse(res)) {
        const { tenantId, currentRoleId } = res || {};
        const data = {
          roleId: currentRoleId,
          tenantId,
        };
        currentRoleDS.loadData([data]);
      }
    });
  }, []);

  // init
  const initData = useCallback(() => {
    request(queryScriptDetailService.url(scriptId), {
      method: queryScriptDetailService.method,
    }).then((response: typeof queryScriptDetailService.response) => {
      if (getResponse(response)) {
        store.setState('currentSelectedScriptDetail', response);

        if (response?.data && response?.data !== '') {
          scriptCodeDataSet.loadData([
            {
              scriptCode: response?.data,
            },
          ]);
        } else {
          scriptCodeDataSet.loadData([
            {
              scriptCode:
                'function process(input){\n  // input 为传入的 json 数据\n  // 从这里开始编写代码，代码可使用 javascript 编写，支持 ES6 语法，可通过右侧面板快速插入通用方法及参考字段\n  // 可在外部定义其他方法，在该方法中进行调用，但主方法（process）只能有一个\n \n}',
            },
          ]);
        }

        inputArgDataSet.loadData([]);
        outputArgDataSet.loadData([]);

        const inputReference = JSON.parse(response.inputReference) as {
          datasetData: any[];
          formattedObject: any;
          testInputJSON: string;
        };
        const outputReference = JSON.parse(response.outputReference) as {
          datasetData: any[];
          formattedObject: any;
        };

        inputArgDataSet.loadData(inputReference.datasetData);
        store.setState('inputReferenceFormattedObject', inputReference.formattedObject);
        if (inputReference.testInputJSON) {
          debuggerInputDataSet.loadData([{ debuggerInput: inputReference.testInputJSON }]);
        }

        outputArgDataSet.loadData(outputReference.datasetData);
        store.setState('outputReferenceFormattedObject', outputReference.formattedObject);
      }
    });

    resizable(refDashboardResizer.current, refDashboard.current, { x: -1, y: 0 });
  }, []);

  // on: update //
  useEffect(() => {
    if (store.state.importParamsDirection === 'in') {
      inputArgDataSet.loadData(store.state.importParamsProcessedData);
      debuggerInputDataSet.loadData([
        {
          debuggerInput: store.state.importParamsCodeEdition,
        },
      ]);
    } else {
      outputArgDataSet.loadData(store.state.importParamsProcessedData);
    }
  }, [store.state.importParamsProcessedData]);

  useEffect(() => {
    debuggerInputDataSet.loadData([]);
    debuggerOutputDataSet.loadData([]);
  }, []);

  // helper comps //
  const collapsePanelHeader = (
    <div className="title">
      调试
      <div style={{ position: 'absolute', right: '100px' }}>
        <span>
          <span style={{ lineHeight: '28px', marginTop: '4px' }}>执行上下文</span>
          <Tooltip placement="top" title="调试时的上下文执行租户、角色">
            <ImgIcon
              name="help@v4.0.svg"
              size={14}
              style={{ marginBottom: '1px', marginLeft: '3px' }}
            />
          </Tooltip>
          ：
        </span>
        <Select
          name="tenantId"
          disabled={isTenantRoleLevel()}
          dataSet={currentRoleDS}
          border={false}
          style={{ marginLeft: '15px', backgroundColor: '#e8e8e8' }}
        />
        <Select
          name="roleId"
          dataSet={currentRoleDS}
          border={false}
          style={{ marginLeft: '15px', backgroundColor: '#e8e8e8' }}
        />
      </div>
      <div className="actions">
        <Tooltip title="调试">
          <Button
            loading={waitingDebugResult}
            style={{ border: 'none', backgroundColor: '#e8e8e8' }}
          >
            <ImgIcon
              name="debug.svg"
              size={14}
              onClick={(e) => {
                e.stopPropagation();
                onDebug();
              }}
            />
          </Button>
          {/* {waitingDebugResult ? (
            <Spin
              size={Size.small}
              style={{ cursor: 'not-allowed' }}
              onClick={(e) => {
                e.stopPropagation();
                onDebug();
              }}
            />
          ) : (
            <ImgIcon
              name="debug.svg"
              size={14}
              onClick={(e) => {
                e.stopPropagation();
                onDebug();
              }}
            />
          )} */}
        </Tooltip>
      </div>
    </div>
  );

  const collapsePanelHeaderParamsIn = (
    <div className="title params-panel-header in">
      入参
      {viewType === 'edit' && (
        <div style={{ cursor: 'pointer' }}>
          <Tooltip title="导入参数">
            <ImgIcon
              name="upload-bundle.svg"
              size={14}
              onClick={(e) => {
                e.stopPropagation();
                store.setState('importParamsDirection', 'in');
                Modal.open(ModalImportParamsConfig({ store, onSave }));
              }}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );

  const collapsePanelHeaderParamsOut = (
    <div className="title params-panel-header out">
      出参
      {viewType === 'edit' && (
        <div className="actions">
          <Tooltip title="导入参数">
            <ImgIcon
              name="upload-bundle.svg"
              size={14}
              onClick={(e) => {
                e.stopPropagation();
                store.setState('importParamsDirection', 'out');
                Modal.open(ModalImportParamsConfig({ store, onSave }));
              }}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );

  return (
    <div className={`script-event ${styles['edit-page']}`}>
      {viewType === 'edit' && (
        <Header
          title="编写脚本"
          backPath="/hmde/script-event/list"
          onBack={() => {
            onCancel();
            if (state?.keyword) {
              sessionStorage.setItem('scriptQueryState', state?.keyword);
            }
            if (state?.page) {
              sessionStorage.setItem('scriptPageState', state?.page);
            }
          }}
        >
          <Button color={ButtonColor.primary} onClick={() => onSave()}>
            <ImgIcon name="check-mark-round.svg" size={14} style={{ marginRight: '4px' }} />
            保存
          </Button>
        </Header>
      )}
      <Content>
        <div className="workbench">
          <div className="code-editor">
            <div className="title">
              <span>
                编辑器/
                <span className="target-script">
                  {store.state.currentSelectedScriptDetail?.scriptName}.js
                </span>
              </span>
              {/* <div className="actions">
                <Popover
                  content={
                    <PopoverInsertReferenceField onInsertReferenceField={onInsertReferenceField} />
                  }
                  trigger="click"
                  visible={showInsertRefrenceFieldPopover}
                  onVisibleChange={(toVisible: boolean) => {
                    store.setState('showInsertRefrenceFieldPopover', toVisible);
                  }}
                  placement="bottomRight"
                  overlayClassName="script-event-insert-reference-field-popover"
                >
                  {viewType === 'edit' && (
                    <Tooltip title="插入业务对象与字段">
                      <ImgIcon
                        name="coding.svg"
                        size={14}
                        onClick={() => {
                          store.setState(
                            'showInsertRefrenceFieldPopover',
                            !store.state.showInsertRefrenceFieldPopover
                          );
                        }}
                      />
                    </Tooltip>
                  )}
                </Popover>
              </div> */}
            </div>
            <CodeArea
              className="codearea"
              dataSet={scriptCodeDataSet}
              name="scriptCode"
              options={codeAreaOptions}
              style={{ height: '100%' }}
              disabled={viewType === 'detail'}
              editorDidMount={(editor: any) => {
                // editor.on('focus', () => {
                //   setEditorFocused(true);
                // });
                //
                // editor.on('blur', () => {
                //   setTimeout(() => {
                //     setEditorFocused(false);
                //   }, 500);
                // });
                refCodeArea.current = editor;
              }}
            />
          </div>
          {viewType === 'edit' && (
            <Collapse className="debugger" trigger="icon">
              <Collapse.Panel
                className="debugger-collapse-panel"
                header={collapsePanelHeader}
                key="1"
              >
                <div className="debugger-part input-json">
                  <div className="title">测试输入JSON</div>
                  <CodeArea
                    name="debuggerInput"
                    dataSet={debuggerInputDataSet}
                    options={codeAreaOptions}
                    style={{ height: '200px' }}
                  />
                </div>
                <div className="debugger-part output">
                  <div className="title">
                    输出结果
                    {debugResultStatus === '' || (
                      <span className={`status ${debugResultStatus}`}>
                        {debugResultStatus === 'fail' ? '(失败)' : '(成功)'}
                      </span>
                    )}
                  </div>
                  <CodeArea
                    name="debuggerOutput"
                    dataSet={debuggerOutputDataSet}
                    options={codeAreaOptions}
                    style={{ height: '200px' }}
                    readOnly
                  />
                </div>
              </Collapse.Panel>
            </Collapse>
          )}
        </div>
        <div className="dashboard" ref={refDashboard}>
          <Collapse className="params-collapse" defaultActiveKey={['in']}>
            <Collapse.Panel
              className="params-collapse-item in"
              header={collapsePanelHeaderParamsIn}
              key="in"
              disabled
            >
              <Table
                mode={'tree' as any}
                dataSet={inputArgDataSet}
                size={'small' as any}
                rowHeight={22}
              >
                <Table.Column name="code" />
                <Table.Column name="type" width={120} />
                <Table.Column name="remark" editor={viewType === 'edit'} />
              </Table>
            </Collapse.Panel>
            <Collapse.Panel
              className="params-collapse-item out"
              header={collapsePanelHeaderParamsOut}
              key="out"
            >
              <Table
                mode={'tree' as any}
                dataSet={outputArgDataSet}
                size={'small' as any}
                rowHeight={22}
              >
                <Table.Column name="code" />
                <Table.Column name="type" width={120} />
                <Table.Column name="remark" editor={viewType === 'edit'} />
              </Table>
            </Collapse.Panel>
          </Collapse>
          <div
            className="resizer"
            ref={refDashboardResizer}
            onDoubleClick={() => {
              refDashboard.current.style.width = '25%';
            }}
          />
        </div>
      </Content>
    </div>
  );
};

export default observer(ScriptEditPage);
