import * as React from 'react';
import { isArray } from 'lodash';
import { Steps, Divider, Tabs, Alert } from 'choerodon-ui';
import { Table, Button, Spin, useDataSet, Select, Icon } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
// import { Button } from 'components/Permission';

import intl from 'utils/intl';
import { TagRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import type { Buttons } from 'choerodon-ui/pro/lib/table/interface';
import { StepState, RuleType, DsStatus, conditionTableDS, getCondOperatorDs } from './stores';
import {
  importData,
  importMatch,
  importVaild,
  // importPreStep,
  fetchImportCount,
} from '@/services/rulesDefinitionService';

import styles from './editDrawer.less';

const { Step } = Steps;
const { Option } = Select;
const { TabPane } = Tabs;
interface ImportProps {
  [propName: string]: any;
}

interface CountProps {
  [propName: string]: any;
}

const stepMapping = {
  [StepState.null]: 0,
  [StepState.preview]: 0,
  [StepState.check]: 1,
  [StepState.match]: 2,
  [StepState.import]: 3,
};
const statusList = [
  { status: 'NEW', color: 'blue' /* , text: 'Excel导入' */ },
  { status: 'VALID_SUCCESS', color: 'green' /* , text: '验证成功' */ },
  { status: 'VALID_FAILED', color: 'red' /* , text: '验证失败' */ },
  { status: 'MATCH_SUCCESS', color: 'green' /* , text: '验证成功' */ },
  { status: 'MATCH_FAILED', color: 'red' /* , text: '验证失败' */ },
  { status: 'IMPORT_SUCCESS', color: 'green' /* , text: '导入成功' */ },
  { status: 'IMPORT_FAILED', color: 'red' /* , text: '导入失败' */ },
  { status: 'ERROR', color: 'red' /* , text: '数据异常' */ },
];

const tiemr: CountProps = {
  queryTimer: undefined,
  maxAutoRefreshInterval: 5000,
  autoRefreshInterval: 100,
};

const Drawer: React.FC<ImportProps> = ({ dataSource, modal, status, handleRefresh }) => {
  const { batch, tenantId } = dataSource;
  const [isAuto, setIsAuto] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [dataStatus, setDataStatus] = React.useState(status);
  const [tabActiveKey, setTabActiveKey] = React.useState(DsStatus.ALL);
  const [step, setStep] = React.useState(StepState.null);
  const [collapsed, setCollapsed] = React.useState(false);
  const [conditionTabs, setConditionTabs] = React.useState([] as CountProps[]);
  const [conditionServerCode, setConditionServerCode] = React.useState('');
  const [conditionTabCount, setConditionTabCount] = React.useState({} as CountProps);

  const mapping = React.useMemo(() => {
    return {
      IMPORTING: intl.get('spfm.rulesDefinition.components.import.importing').d('导入中'),
      MATCHING: intl.get('spfm.rulesDefinition.components.import.matching').d('匹配中'),
      CHECKING: intl.get('spfm.rulesDefinition.components.import.checking').d('校验中'),
    };
  }, []);

  const nodeList = React.useMemo(() => {
    return [
      {
        key: StepState.preview,
        meaning: intl.get('spfm.rulesDefinition.components.import.dataPreview').d('导入数据预览'),
      },
      {
        key: StepState.check,
        meaning: intl.get('spfm.rulesDefinition.components.import.dataCheck').d('数据校验'),
      },
      {
        key: StepState.match,
        meaning: intl.get('spfm.rulesDefinition.components.import.dataMatch').d('目标环境匹配'),
      },
      {
        key: StepState.import,
        meaning: intl.get('spfm.rulesDefinition.components.import.dataImport').d('数据导入'),
      },
    ];
  }, []);

  const TopTabs = React.useMemo(() => {
    return [
      {
        key: DsStatus.IMPORT_FAILED,
        meaning: intl.get('spfm.rulesDefinition.components.import.importFailed').d('导入失败'),
        step: StepState.import,
        count: 'FAILED',
      },
      {
        key: DsStatus.IMPORT_SUCCESS,
        meaning: intl.get('spfm.rulesDefinition.components.import.importSuccess').d('导入成功'),
        step: StepState.import,
        count: 'SUCCESS',
      },
      {
        key: DsStatus.MATCH_FAILED,
        meaning: intl.get('spfm.rulesDefinition.components.import.mactchFailed').d('匹配失败'),
        step: StepState.match,
        count: 'FAILED',
      },
      {
        key: DsStatus.MATCH_SUCCESS,
        meaning: intl.get('spfm.rulesDefinition.components.import.mactchSuccess').d('匹配成功'),
        step: StepState.match,
        count: 'SUCCESS',
      },
      {
        key: DsStatus.VALID_FAILED,
        meaning: intl.get('spfm.rulesDefinition.components.import.validFailed').d('校验失败'),
        step: StepState.check,
        count: 'FAILED',
      },
      {
        key: DsStatus.VALID_SUCCESS,
        meaning: intl.get('spfm.rulesDefinition.components.import.validSuccess').d('校验成功'),
        step: StepState.check,
        count: 'SUCCESS',
      },
      {
        key: DsStatus.ALL,
        meaning: intl.get('spfm.rulesDefinition.components.import.all').d('全部'),
        step: null,
        count: 'ALL',
      },
    ];
  }, []);

  const conditionListDs = useDataSet(() => conditionTableDS(RuleType.condition), []);

  React.useEffect(() => {
    let newStep;
    if (['UPLOADING', 'UPLOADED', 'UPLOAD_FAILED'].includes(dataStatus)) {
      newStep = StepState.preview;
    } else if (['CHECKING', 'CHECKED', 'CHECK_FAILED'].includes(dataStatus)) {
      newStep = StepState.check;
    } else if (['MATCHING', 'MATCHED', 'MATCH_FAILED'].includes(dataStatus)) {
      newStep = StepState.match;
    } else {
      newStep = StepState.import;
    }
    setStep(newStep);
    if (step !== newStep && !step) {
      setTabActiveKey(DsStatus.ALL);
    }
  }, [dataStatus, step]);

  React.useEffect(() => {
    if (!step) {
      queryAllCount();
      conditionListDs.setQueryParameter('batch', batch);
      conditionListDs.setQueryParameter('tenantId', tenantId);
    }
  }, [step]);

  React.useEffect(() => {
    const queryCount = ({ dataSet }) => {
      if (dataSet.getState('init')) {
        fetchImportCount({ batch }).then((res) => {
          if (getResponse(res) && res.length) {
            const newTabs =
              res.length > 1
                ? [
                    {
                      dataCount: res.reduce((a, b) => a + b.dataCount, 0),
                      failCount: res.reduce((a, b) => a + b.failCount, 0),
                      successCount: res.reduce((a, b) => a + b.successCount, 0),
                      serverCode: 'ALL',
                      serverName: intl.get('spfm.rulesDefinition.components.import.all').d('全部'),
                    },
                    ...res,
                  ]
                : res;
            setConditionTabs(newTabs);
            if (newTabs.length) {
              setConditionTabCount({
                ALL: newTabs[0]?.dataCount,
                FAILED: newTabs[0]?.failCount,
                SUCCESS: newTabs[0]?.successCount,
              });
            }
          }
        });
      }
    };
    conditionListDs.addEventListener('load', queryCount);
    return () => {
      conditionListDs.removeEventListener('load', queryCount);
    };
  }, [conditionServerCode, conditionListDs]);

  React.useEffect(() => {
    if (tabActiveKey) {
      if (conditionServerCode) {
        if (conditionServerCode === 'ALL') {
          conditionListDs.setQueryParameter('serverCode', undefined);
        } else {
          conditionListDs.setQueryParameter('serverCode', conditionServerCode);
        }

        if (tabActiveKey.includes('ALL')) {
          conditionListDs.setQueryParameter('status', undefined);
        } else {
          conditionListDs.setQueryParameter('status', tabActiveKey);
        }

        conditionListDs.query();
        conditionListDs.setState({ init: true });
      }
    }
  }, [step, conditionServerCode, tabActiveKey]);

  const handleSave = React.useCallback(() => {
    const dataSet = conditionListDs;
    return new Promise(async (resolve) => {
      const validFlag = await dataSet.validate();
      if (validFlag) {
        dataSet
          .submit()
          .then(async () => {
            setLoading(true);
            await dataSet.query();
            setLoading(false);
          })
          .catch((res) => {
            console.log(res);
            resolve(false);
            setLoading(false);
          });
      } else {
        resolve(false);
      }
    });
  }, [tabActiveKey, conditionListDs]);

  const queryAllCount = () => {
    fetchImportCount({ batch, sheetIndex: 0 }).then((res) => {
      if (getResponse(res) && res.length) {
        const newTabs =
          res.length > 1
            ? [
                {
                  dataCount: res.reduce((a, b) => a + b.dataCount, 0),
                  failCount: res.reduce((a, b) => a + b.failCount, 0),
                  successCount: res.reduce((a, b) => a + b.successCount, 0),
                  serverCode: 'ALL',
                  serverName: intl.get('spfm.rulesDefinition.components.import.all').d('全部'),
                },
                ...res,
              ]
            : res;
        setConditionTabs(newTabs);
        setConditionTabCount({
          ALL: newTabs[0]?.dataCount,
          FAILED: newTabs[0]?.failCount,
          SUCCESS: newTabs[0]?.successCount,
        });
        if (!conditionServerCode) {
          setConditionServerCode(newTabs[0]?.serverCode);
        }
      }
    });
  };

  // 下一步
  const handleNextStep = React.useCallback(() => {
    if (step === StepState.preview && dataStatus === 'UPLOADED') {
      return handleValid();
    } else if (step === StepState.check && dataStatus === 'CHECKED') {
      return handleMatch();
    } else if (step === StepState.match && dataStatus === 'MATCHED') {
      return handleImport();
    }
  }, [tabActiveKey, dataStatus, step, batch]);

  // 上一步
  // const handlePreStep = React.useCallback(() => {
  //   return new Promise((resolve) => {
  //     importPreStep({ batch }).then((res) => {
  //       if (getResponse(res)) {
  //         handleRefreshStatus().then(() => {
  //           resolve(true);
  //         });
  //       } else {
  //         resolve(false);
  //       }
  //     });
  //   });
  // }, [step, batch, tabActiveKey]);

  // 验证
  const handleValid = () => {
    return new Promise(async (resolve) => {
      const dataSet = conditionListDs;
      const validFlag = await dataSet.validate();
      if (validFlag) {
        dataSet
          .submit()
          .then(() => {
            importVaild({ batch }).then((res) => {
              if (getResponse(res)) {
                handleRefreshStatus().then(() => {
                  resolve(true);
                });
              } else {
                resolve(false);
              }
            });
          })
          .catch((res) => {
            console.log(res);
            resolve(false);
          });
      } else {
        resolve(false);
      }
    });
  };

  // 匹配
  const handleMatch = () => {
    return new Promise(async (resolve) => {
      const dataSet = conditionListDs;
      const validFlag = await dataSet.validate();
      if (validFlag) {
        dataSet
          .submit()
          .then(async () => {
            importMatch({ batch }).then((res) => {
              if (getResponse(res)) {
                handleRefreshStatus().then(() => {
                  resolve(true);
                });
              } else {
                resolve(false);
              }
            });
          })
          .catch((res) => {
            console.log(res);
            resolve(false);
          });
      } else {
        resolve(false);
      }
    });
  };

  // 导入
  const handleImport = () => {
    return new Promise((resolve) => {
      importData({ batch }).then((res) => {
        if (getResponse(res)) {
          handleRefreshStatus().then(() => {
            resolve(true);
          });
        } else {
          resolve(false);
        }
      });
    });
  };

  // 重新导入
  const handleReImport = () => {
    return new Promise((resolve) => {
      importVaild({ batch }).then((res) => {
        if (getResponse(res)) {
          handleRefreshStatus().then(() => {
            resolve(true);
          });
        } else {
          resolve(false);
        }
      });
    });
  };

  const handleRefreshStatus = () => {
    return new Promise((resolve) => {
      setLoading(true);
      handleRefresh({ batch }).then((data) => {
        if (data) {
          setDataStatus(data);
        }
        if (data && data.includes('ING')) {
          setIsAuto(true);
          if (tiemr.autoRefreshInterval < tiemr.maxAutoRefreshInterval) {
            tiemr.autoRefreshInterval *= 2;
          }
          clearTimeout(tiemr.queryTimer);
          tiemr.queryTimer = setTimeout(() => {
            handleRefreshStatus();
          }, Math.min(tiemr.autoRefreshInterval, tiemr.maxAutoRefreshInterval));
          return;
        } else {
          tiemr.autoRefreshInterval = 100;
          setIsAuto(false);
          setLoading(false);
          queryAllCount();
          conditionListDs.query();
        }
        resolve(false);
      });
    });
  };

  React.useEffect(() => {
    if (['UPLOADED', 'MATCHED', 'CHECKED'].includes(dataStatus) && step) {
      handleNextStep();
    }
  }, [dataStatus, step, handleNextStep]);

  React.useEffect(() => {
    if (isAuto && !tiemr.queryTimer) {
      tiemr.queryTimer = setTimeout(() => {
        handleRefreshStatus();
      }, tiemr.autoRefreshInterval);
    } else if (!isAuto) {
      clearTimeout(tiemr.queryTimer);
      tiemr.queryTimer = undefined;
    }
  }, [isAuto, batch]);

  React.useEffect(() => {
    return () => {
      if (tiemr.queryTimer) {
        clearTimeout(tiemr.queryTimer);
        tiemr.queryTimer = undefined;
      }
    };
  }, []);

  React.useEffect(() => {
    modal.update({
      footer: (
        <div style={{ textAlign: 'left' }}>
          {/* {['UPLOADED', 'CHECKED', 'MATCHED'].includes(dataStatus) && (
            <Button onClick={handleNextStep} color={ButtonColor.primary}>
              {'下一步'}
            </Button>
          )} */}
          {/* {[StepState.match, StepState.import].includes(step) && dataStatus !== 'IMPORTED' && (
            <Button onClick={handlePreStep}>上一步</Button>
          )} */}
          {[StepState.check, StepState.match].includes(step) && (
            <Button onClick={handleSave} loading={loading}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
          {[StepState.check].includes(step) &&
            ['CHECK_FAILED', 'CHECKING', 'CHECKED'].includes(dataStatus) && (
              <Button onClick={handleValid} loading={loading}>
                {intl.get('spfm.rulesDefinition.components.import.reCheck').d('重新检验')}
              </Button>
            )}
          {[StepState.match].includes(step) &&
            ['MATCH_FAILED', 'MATCHING', 'MATCHED'].includes(dataStatus) && (
              <Button onClick={handleMatch} loading={loading}>
                {intl.get('spfm.rulesDefinition.components.import.reMatch').d('重新匹配')}
              </Button>
            )}
          {[StepState.import].includes(step) && dataStatus === 'IMPORT_FAILED' && (
            <Button onClick={handleReImport} loading={loading}>
              {intl.get('spfm.rulesDefinition.components.import.reImport').d('重新导入')}
            </Button>
          )}
          {/* {['UPLOADING', 'CHECKING', 'MATCHING', 'IMPORTING'].includes(dataStatus) && (
            <Button onClick={handleRefreshStatus}>刷新状态</Button>
          )} */}
          <Button
            onClick={() => {
              modal.close();
            }}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </div>
      ),
    });
  }, [step, batch, loading, dataStatus, tabActiveKey]);

  // tab切换的回调;
  const handleTabChange = (key) => {
    setTabActiveKey(key);
  };

  const renderRuleTabs = () => {
    return (
      <Tabs activeKey={tabActiveKey} onChange={handleTabChange}>
        {TopTabs.map((data) => {
          if (data.key === DsStatus.ALL || data.step === step) {
            return (
              <TabPane
                key={data.key}
                tab={<span>{data.meaning}</span>}
                count={conditionTabCount[data.count]}
              />
            );
          } else {
            return null;
          }
        })}
      </Tabs>
    );
  };

  const DeleteBtn: React.FC<ImportProps> = observer(({ dataSet }) => {
    return (
      <Button
        key="delete"
        funcType={FuncType.flat}
        icon="delete"
        color={ButtonColor.primary}
        name="deleteItems"
        onClick={() =>
          dataSet.delete(dataSet.selected, {
            title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
            children: (
              <div>
                {intl
                  .get('spfm.rulesDefinition.components.import.deleteConfirm')
                  .d('确认剔除选中行？')}
              </div>
            ),
            afterClose: () => {
              dataSet.query();
            },
          })
        }
        disabled={dataSet.selected.length === 0}
      >
        {intl.get('spfm.rulesDefinition.components.import.dataDelete').d('剔除不导入')}
      </Button>
    );
  });

  const renderLeftConditionTabs = () => {
    const buttons = [StepState.check, StepState.match].includes(step)
      ? [<DeleteBtn dataSet={conditionListDs} />]
      : [];
    return (
      <div className={styles[collapsed ? 'show-left' : 'hidden-left']}>
        <Tabs
          style={{ height: '600px' }}
          activeKey={conditionServerCode}
          onChange={(key) => {
            setConditionServerCode(key);
          }}
          tabPosition={TabsPosition.left}
        >
          {conditionTabs.map((item) => (
            <TabPane
              key={item.serverCode}
              tab={<span>{item.serverName}</span>}
              count={ tabActiveKey === DsStatus.ALL ? item.dataCount : (tabActiveKey.includes('FAILED') ? item.failCount : item.successCount )}
            >
              <div className={styles[!collapsed ? 'page-open' : 'page-off']}>
                <a
                  onClick={() => setCollapsed(!collapsed)}
                  className={styles[collapsed ? 'menu-icon' : 'menu-icon-a']}
                >
                  <Icon className={styles['page-icon']} type="baseline-arrow_right" />
                </a>
                <Table
                  virtual
                  virtualCell
                  style={{ maxHeight: '450px' }}
                  dataSet={conditionListDs}
                  columns={conditionColumns}
                  buttons={buttons as Buttons[]}
                />
              </div>
            </TabPane>
          ))}
        </Tabs>
      </div>
    );
  };

  const renderOperator = (record) => {
    const leftValue = record.get('conditionLeftValue');
    const cnfJson = record.get('cnfJson');
    const config = isArray(JSON.parse(cnfJson))
      ? JSON.parse(cnfJson)
      : JSON.parse(cnfJson)
      ? [JSON.parse]
      : [];
    let operatorOptions = getCondOperatorDs().filter((item) => item.type !== 'number');
    const target = config.find((item) => item.name === leftValue);
    // number类型且没有值集编码的 可选择大小于条件
    if (target && target.type === 'number' && !target.lovCode && !target.lookupCode) {
      operatorOptions = getCondOperatorDs();
    }
    return operatorOptions.map((item) => <Option value={item.value}>{item.meaning}</Option>);
  };

  const allowEdit = (record, name) => {
    if (!['CHECK_FAILED', 'CHECKED', 'MATCHED', 'MATCH_FAILED'].includes(dataStatus)) {
      return false;
    }

    if (record.get('ruleType') === 'EXECUTION') {
      if (
        [
          'conditionType',
          'customizeConditionCombination',
          'conditionNumber',
          'conditionOperator',
        ].includes(name)
      ) {
        return false;
      }
    }

    if (record.get('conditionType') === 'TRUE') {
      if (
        [
          'customizeConditionCombination',
          'conditionNumber',
          'conditionLeftValue',
          'conditionOperator',
          'conditionRightValue',
        ].includes(name)
      ) {
        return false;
      }
    }

    if (step === StepState.check) {
      if (name === 'conditionParam') {
        const cnfJson = record.get('cnfJson');
        const config = isArray(JSON.parse(cnfJson))
          ? JSON.parse(cnfJson)
          : JSON.parse(cnfJson)
          ? [JSON.parse]
          : [];
        const data = config.map((ele) => ({ value: ele.name, meaning: ele.label }));
        return (
          <Select name={name} record={record} colSpan={6}>
            {data.map((ele) => (
              <Option value={ele.value}>{ele.meaning}</Option>
            ))}
          </Select>
        );
      }

      if (name === 'conditionOperator') {
        return (
          <Select name="operator" colSpan={6} disabled={!record.get('conditionParam')}>
            {renderOperator(record)}
          </Select>
        );
      }

      if (['conditionValue'].includes(name)) {
        return false;
      }

      return true;
    }

    if (step === StepState.match) {
      if (['conditionValue'].includes(name)) {
        return true;
      } else {
        return false;
      }
    }

    return false;
  };

  const conditionColumns: ColumnProps[] = React.useMemo(() => {
    return [
      {
        name: '_dataStatus',
        width: 150,
        align: ColumnAlign.left,
        renderer: ({ value, record }) => {
          const tagItem = statusList.find((t) => t.status === value) || ({} as any);
          return (
            <div className="common-import-status-tag">
              {TagRender(value, [
                {
                  status: value,
                  text: record?.get('_dataStatusMeaning'),
                  color: tagItem?.color,
                },
              ])}
            </div>
          );
        },
      },
      {
        name: '_info',
        width: 250,
        align: ColumnAlign.left,
      },
      {
        name: 'serverCode',
        align: ColumnAlign.left,
        width: 200,
      },
      {
        name: 'serverName',
        align: ColumnAlign.left,
        width: 200,
      },
      {
        name: 'actionName',
        width: 200,
        align: ColumnAlign.left,
        editor: allowEdit,
      },
      {
        name: 'actionDescription',
        width: 200,
        align: ColumnAlign.left,
        editor: allowEdit,
      },
      {
        name: 'priority',
        width: 150,
        align: ColumnAlign.left,
        editor: allowEdit,
      },
      {
        name: 'ruleTypeName',
        width: 150,
        align: ColumnAlign.left,
      },
      {
        name: 'conditionType',
        width: 200,
        align: ColumnAlign.left,
        editor: allowEdit,
      },
      {
        name: 'customizeConditionCombination',
        width: 200,
        align: ColumnAlign.left,
        editor: allowEdit,
      },
      {
        name: 'conditionNumber',
        width: 150,
        align: ColumnAlign.left,
        editor: allowEdit,
      },
      {
        name: 'conditionParam',
        width: 150,
        editor: allowEdit,
        align: ColumnAlign.left,
        renderer: ({ record }) => record?.get('conditionParamName'),
      },
      {
        name: 'conditionOperator',
        width: 150,
        editor: allowEdit,
        align: ColumnAlign.left,
        renderer: ({ record }) => record?.get('conditionOperatorName'),
      },
      {
        name: 'conditionValue',
        width: 200,
        align: ColumnAlign.left,
        editor: allowEdit,
      },
      {
        name: 'convertValue',
        align: ColumnAlign.left,
        width: 200,
      },
      {
        name: 'sourceValueName',
        align: ColumnAlign.left,
        width: 200,
      },
    ];
  }, [step, tabActiveKey, dataStatus]);

  return (
    <>
      {['CHECKING', 'MATCHING', 'IMPORTING'].includes(dataStatus) && (
        <div style={{ marginBottom: '10px' }}>
          <Alert
            closable
            message={intl
              .get('spfm.rulesDefinition.model.rulesDefinition.waiting', {
                value: mapping[dataStatus],
              })
              .d(`数据${mapping[dataStatus]}，请等待`)}
            type="info"
            className="srm-common-import-history-alert"
            showIcon
            style={{ marginBottom: '10px' }}
          />
        </div>
      )}
      <Spin spinning={loading}>
        <Steps current={stepMapping[step]} style={{ marginTop: '10px' }}>
          {nodeList.map((item) => (
            <Step key={item.key} title={item.meaning} />
          ))}
        </Steps>
        <Divider />
        {renderRuleTabs()}
        {renderLeftConditionTabs()}
      </Spin>
    </>
  );
};

export default observer(Drawer);
