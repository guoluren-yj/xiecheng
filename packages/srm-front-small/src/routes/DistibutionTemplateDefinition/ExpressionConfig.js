import React, { useMemo, useEffect } from 'react';
import { Tree, DataSet, Output, Select, Form, Button, TextField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Observer } from 'mobx-react';

import intl from 'utils/intl';

import { funTreeDs, expreConfigDs, resultDs } from './tableDS';
import style from './index.less';

const ConfigHelp = observer(({dataSet, configHelpMap}) => {
  const currentFun = configHelpMap[dataSet.getState('fun')];
  return currentFun && (
    <>
      <p>
        <span>{intl.get('hpfm.customize.common.funName').d('函数名')}:</span>
        {currentFun.funName}
      </p>
      <p>
        <span>{intl.get('hpfm.customize.common.funIns').d('功能说明')}:</span>
        {currentFun.funDescription}
      </p>
      <p>
        <span>{intl.get('hpfm.customize.common.argsList').d('参数列表')}:</span>
        {currentFun.funArgs.map(arg => (
          <div className='ins-level-0'>
            <p>
              <span>{arg.label}:</span>
              {arg.description}
            </p>
            {arg.children && arg.children.map((n) => (
              <p className='ins-level-1'>
                <span>{n.label}:</span>
                {n.description}
              </p>
            ))}
          </div>
      ))}
      </p>
      <p>
        <span>{intl.get('hpfm.customize.common.example').d('功能说明')}:</span>
        {currentFun.liveExample}
      </p>
      <p>
        <span>{intl.get('hpfm.customize.common.exampleMeaning').d('功能说明')}:</span>
        {currentFun.liveExampleDes}
      </p>
    </>
  );
});

function ExpressionConfig({
  dataSet,
  fxRecord,
  modal,
  disabled,
  dimensionType,
  templateId,
}) {
  const treeDs = useMemo(() => {
    return new DataSet(funTreeDs());
  }, []);

  const resultDataSet = useMemo(() => {
    return new DataSet(resultDs());
  }, []);

  const expreConfigDataSet = useMemo(() => {
    return new DataSet(expreConfigDs({ dimensionType, templateId, fxRecord, outDs: dataSet.current, resultDataSet }));
  }, []);

  const CONFIG_HELP_MAP = useMemo(() => ({
    OFFSET_DATE: {
      funName: 'OFFSET_DATE(dateVar, offset1, offset2, ...)', // 函数名
      funDescription: intl.get('hpfm.customize.common.fun.offsetDate').d('计算偏移时间'), // 功能说明
      // 参数列表
      funArgs: [
        {
          label: 'dateVar',
          description: intl.get('hpfm.customize.common.fun.ins1').d('时间变量'),
        },
        {
          label: 'offset',
          description: intl.get('hpfm.customize.common.fun.ins2').d('偏移量'),
          children: [
            {
              label: intl.get('hpfm.customize.common.fun.ins3').d('可选单位'),
              description: intl.get('hpfm.customize.common.fun.ins4').d('s:秒、m:分、h:时、D:天、W:周、M:月、Y:年'),
            },
          ],
        },
      ],
      liveExample: 'OFFSET_DATE(a, "7D")',
      liveExampleDes: intl.get('small.cartTemplate.common.fun.ins5').d('当天的日期+7天'),
    },
  }), []);

  useEffect(() => {

    modal.update({
      onOk: handleOk,
      cancelButton: !disabled,
      okText: disabled ? intl.get('small.common.modal.button.close').d('关闭') : intl.get('hzero.common.button.sure').d('确定'),
    });
    const formulaCondition = ( fxRecord || dataSet.current)?.get('formulaCondition') || {};
    const { conditionHeader, conditionLineList } = formulaCondition || {};
    expreConfigDataSet.loadData(conditionLineList);
    resultDataSet.loadData([conditionHeader]);
  }, [dataSet, expreConfigDataSet, resultDataSet, disabled]);

  function nodeRenderer({ record }) {
    const { isLeaf, text } = record.get(['isLeaf', 'text']) || {};
    return <span className={isLeaf ? 'leaf' : ''}>{text}</span>;
  }

  async function handleOk() {
    const flag = await expreConfigDataSet.validate();
    const flag1 = await resultDataSet.validate();
    if (flag && flag1) {
      (fxRecord || dataSet.current).set('formulaCondition', {
        conditionHeader: resultDataSet.current.toData(),
        conditionLineList: expreConfigDataSet.toData(),
      });
    } else {
      return false;
    }
  }

  return (
    <div className={style['expresssion-config-wrapper']}>
      <div className="expression-config-tree-container">
        <div className="expression-config-tree">
          <Tree dataSet={treeDs} defaultSelectedKeys={['1-1']} renderer={nodeRenderer} />
        </div>
        <div className="expression-config-help">
          <ConfigHelp dataSet={treeDs} configHelpMap={CONFIG_HELP_MAP} />
        </div>
      </div>
      <div className="expression-config-form-container">
        <div className="show-header">
          <table>
            <thead>
              <tr>
                <td colSpan="2">
                  <div>{intl.get('hpfm.customize.common.paramKey').d('参数名')}</div>
                </td>
                <td colSpan="3">
                  <div>{intl.get('small.cartTemplate.common.paramFrom').d('参数来源')}</div>
                </td>
                <td colSpan="8">
                  <div>{intl.get('hpfm.customize.common.paramKey').d('参数值')}</div>
                </td>
                <td className="control" />
              </tr>
            </thead>
          </table>
        </div>
        <div className="expression-config-form">
          <Observer>
            {() =>
              expreConfigDataSet.map(r => (
                <Form record={r} columns={14} style={{ marginBottom: 8 }} disabled={disabled}>
                  <Output
                    name="paramCode"
                    colSpan={2}
                    renderer={({ record }) => String.fromCharCode(97 + record.index)}
                  />
                  <Select
                    name="targetType"
                    colSpan={3}
                  />
                  <Select name="targetValue" colSpan={8} />
                  <Button
                    className="delete-btn"
                    colSpan={1}
                    funcType="link"
                    icon="delete"
                    onClick={() => expreConfigDataSet[r.status === 'add' ? 'remove' : 'delete'](r, true)}
                  />
                </Form>
              ))
            }
          </Observer>
          {!disabled && (
            <div className="add-variable">
              <Button icon="add" onClick={() => expreConfigDataSet.create()}>
                {intl.get('hzero.common.button.addParam').d('添加参数')}
              </Button>
            </div>
          )}
        </div>
        <Form className="result-form" labelLayout="vertical" dataSet={resultDataSet} columns={1}>
          <TextField name="conditionExpression" disabled={disabled} />
        </Form>
      </div>
    </div>
  );
};

export default ExpressionConfig;
