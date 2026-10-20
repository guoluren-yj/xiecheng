/* eslint-disable no-multi-assign */
/* eslint-disable no-continue */
import React from 'react';
import {
  DataSet,
  Button,
  TextField,
  Form,
  Output,
  Modal,
  notification,
  // Output,
} from 'choerodon-ui/pro';
import { LabelAlign, LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'hzero-front/lib/utils/intl';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { statementToJs, innerFunctionMap } from 'srm-front-cuz/lib/utils/index.js';
import Tree, { TreeNode } from 'choerodon-ui/lib/tree';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import { Record } from 'choerodon-ui/dataset';
import style from './index.less';
import ExpressionEditor from './ExpressionEditor';
import Editor from './TreeNodeEditor';
import { CtxParams } from '../../utils/interface';
import getInsData, { bigNumberList, InsData } from '../FunctionDoc';

type DefaultExpConfigProps = {
  modal?: Modal;
  record?: Record;
  form?: any;
  unitId: number | string;
  ctxParams: CtxParams;
  prefix?: string;
  propName?: string;
  readOnly?: boolean;
  mode: "c7n" | "h0";
  isTemplate?: boolean;
  templateParams?: any;
  fieldWidget?: string;
};
export default class DefaultExpConfig extends React.Component<DefaultExpConfigProps, any> {
  computeDs?: DataSet;

  static defaultProps = {
    prefix: 'default-exp-config',
    propName: 'defaultValue',
    readOnly: false,
    mode: "h0",
  };

  editorInstance = React.createRef<Editor>();

  expressionEditor = React.createRef<ExpressionEditor>();

  autoChar: number = 0;

  computeFields: FieldProps[] = [];

  computeDataCache: any = null;

  constructor(props) {
    super(props);
    let statement = this.getValueFromParent();
    let res: string = '';
    if (statement) {
      try {
        const match = statement.match(/RES\s*([^;]+);$/);
        // eslint-disable-next-line prefer-destructuring
        res = (match || [])[1];
        statement = statement.replace(/RES\s*[^;]+;$/, '');
      } catch (e) {
        res = '';
      }
    }
    this.state = {
      res,
      compute: false,
      stateStatement: statement || "",
      disabledCompute: true,
      insData: {},
      insActive: false,
    };
  }

  getValueFromParent(){
    const { form, propName, mode, record } = this.props;
    if(mode === "h0"){
      return form.getFieldValue(propName) || '';
    } else if(mode === "c7n") {
      return record!.get(propName);
    }
  }

  setValueToParent(value){
    const { form, propName = "", mode, record } = this.props;
    if(mode === "h0"){
      form.setFieldsValue({ [propName]: value });
    } else if(mode === "c7n") {
      return record!.set(propName, value);
    }
  }

  toggleCompute = async () => {
    const { compute } = this.state;
    if (compute) {
      this.computeDs = undefined;
      this.computeFields = [];
      this.computeDataCache = null;
      this.setState({
        compute: false,
      });
    } else if (this.editorInstance.current && (await this.editorInstance.current.validate())) {
      const computeDataCache = { data: {} };
      const varListData = await this.editorInstance.current.getData();
      const dsFields: FieldProps[] = [];
      const expression = (this.expressionEditor.current as ExpressionEditor).getValue();
      varListData.forEach(({ uniqueKey, varType, unit = '', unitField }) => {
        if (['UNIT'].includes(varType)) {
          dsFields.push({ name: unitField, label: uniqueKey });
          computeDataCache[unit] = { getValue: getValue.bind(computeDataCache) };
        }
      });
      this.computeDs = new DataSet({
        data: [{ expression }],
        fields: dsFields.concat([
          {
            name: 'expression',
            label: intl.get('hpfm.customize.common.defaultExpression').d('默认值表达式'),
          },
          { name: 'computeRes', label: intl.get('hpfm.customize.common.computeRes').d('计算结果') },
        ]),
      });
      this.computeFields = dsFields;
      this.computeDataCache = computeDataCache;
      this.setState({
        compute: true,
      });
    }
  };

  toggleMode = selectedKeys => {
    const current = selectedKeys[0];
    this.setState({
      compute: false,
      insData: getInsData(current, intl),
      insActive: current && !['DATEFUN', 'MATHFUN', 'BIGNUMBER'].includes(current),
    });
  };

  expressionUpdateHook = (value?: string) => {
    this.setState({
      disabledCompute: !value,
    });
  };

  getStatement = async () => {
    if (this.editorInstance.current && (await this.editorInstance.current.validate())) {
      const varListData = await this.editorInstance.current.getData();
      const expression = (this.expressionEditor.current as ExpressionEditor).getValue();
      const subStatementCollection = {};
      const parentStatementList: any[] = [];
      if (varListData.length === 0 && expression && expression.replace(/\s/, '')) {
        notification.error({
          message: intl.get('hpfm.customize.expConfig.err.tip1').d('公式配置错误'),
          description: '',
        });
        return { ok: false };
      }
      varListData.forEach((data: any) => {
        if ('parentId' in data) {
          if (!subStatementCollection[data.parentId]) {
            subStatementCollection[data.parentId] = [];
          }
          subStatementCollection[data.parentId].push(data);
        } else {
          parentStatementList.push(data);
        }
      });
      const finalData = parentStatementList.reduce((p, data: any) => {
        const { actionType, varType, __id__ } = data;
        if (actionType === 'DEF' && varType === 'FUN') {
          const subs = subStatementCollection[__id__] || [];
          let subBlock = '';
          subs.forEach(sub => {
            subBlock += dataToStatement(sub);
          });
          return `${p}${dataToStatement(data)(subBlock)}`;
        } else return `${p}${dataToStatement(data)}`;
      }, '');
      return {
        finalData:
          expression && expression.replace(/\s/, '') ? `${finalData}RES ${expression};` : finalData,
        ok: true,
      };
    }
    return { ok: false };
  };

  closeModal = () => {
    this.props.modal!.close();
  };

  compute = async () => {
    const { ctxParams } = this.props;
    const { finalData } = await this.getStatement();
    if (this.computeDs && this.computeDs.current) {
      this.computeDataCache.data = this.computeDs.current.toData();
      this.computeDataCache.data.expression = undefined;
      try {
        // eslint-disable-next-line no-new-func
        const fun = new Function(
          'ctx,innerFunctionMap,cache',
          statementToJs(finalData).join('\r\n')
        )(ctxParams, innerFunctionMap, this.computeDataCache);
        (this.computeDs.current as any).set('computeRes', fun());
      } catch (e) {
        (this.computeDs.current as any).set('computeRes', 'invalid express');
      }
    }
  };

  save = async () => {
    const { finalData, ok } = await this.getStatement();
    if (ok) {
      this.setValueToParent(finalData);
      this.props.modal!.close();
    }
  };

  render() {
    const {
      props: { prefix, unitId, readOnly, isTemplate, templateParams, fieldWidget },
      computeFields,
    } = this;
    const {
      res,
      compute,
      stateStatement,
      // eslint-disable-next-line no-unused-vars
      disabledCompute,
      insData,
      insActive,
    } = this.state;
    const isLov = fieldWidget === 'LOV';
    const hiddenLeftTree = isLov;
    return (
      <div className={style[`${prefix}-wrapper`]}>
        <div
          className={`${prefix}-tree-container${insActive ? ' active' : ''}`}
          style={{ display: hiddenLeftTree ? 'none' : 'block' }}
        >
          <div className={`${prefix}-tree`}>
            <Tree defaultExpandedKeys={['DATEFUN', 'BIGNUMBER']} onSelect={this.toggleMode} showIcon>
              <TreeNode
                title={intl.get('hpfm.customize.common.dateFunction').d('日期函数')}
                key="DATEFUN"
              >
                <TreeNode title="OFFSET_DATE" key="OFFSET_DATE" className="leaf" />
                <TreeNode title="TIME_DIFF" key="TIME_DIFF" className="leaf" />
              </TreeNode>
              <TreeNode
                title={intl.get('hpfm.customize.common.mathFunction').d('数值运算(16位以下数字)')}
                key="MATHFUN"
              >
                <TreeNode title="Math.abs" key="abs" className="leaf" />
                <TreeNode title="Math.ceil" key="ceil" className="leaf" />
                <TreeNode title="Math.floor" key="floor" className="leaf" />
                <TreeNode title="Math.max" key="max" className="leaf" />
                <TreeNode title="Math.min" key="min" className="leaf" />
                <TreeNode title="Math.pow" key="pow" className="leaf" />
                <TreeNode title="Math.random" key="random" className="leaf" />
                <TreeNode title="Math.round" key="round" className="leaf" />
                <TreeNode title="Math.sqrt" key="sqrt" className="leaf" />
              </TreeNode>
              <TreeNode
                title={intl.get('hpfm.customize.common.bigNumberFunction').d('大数字运算(16位以上数字)')}
                key="BIGNUMBER"
              >
                {bigNumberList.map(i=>(<TreeNode title={i.funName} key={i.key} className="leaf" />))}
              </TreeNode>
            </Tree>
          </div>
          <div className={`${prefix}-tree-node-ins`}>
            <InsCard insData={insData} />
          </div>
        </div>
        <div className={`${prefix}-container`}>
          <Editor
            readOnly={readOnly}
            unitId={unitId}
            isTemplate={isTemplate}
            templateParams={templateParams}
            statement={stateStatement}
            ref={this.editorInstance}
            fieldWidget={fieldWidget}
          />
          <ExpressionEditor
            res={res}
            readOnly={readOnly}
            ref={this.expressionEditor}
            updateHook={this.expressionUpdateHook}
          />
          <div className="footer">
            {readOnly ? (
              <Button color={ButtonColor.primary} onClick={this.closeModal}>
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>
            ) : (
              <>
                <Button onClick={this.closeModal}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </Button>
                <Button onClick={this.save} color={ButtonColor.primary}>
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

function dataToStatement(data: any = {}) {
  const {
    actionType = '',
    varType = '',
    uniqueKey = '',
    execStatement = '',
    source = '',
    sourceField = '',
    unit = '',
    unitField = '',
    argsList = '',
    result = '',
    valueType = '',
    specialType = '',
    specialValue = '',
  } = data;
  let statement: any = '';
  if (actionType === 'DEF') {
    switch (varType) {
      case 'UNIT':
        statement = `DEF ${uniqueKey} ${varType} ${unit} ${unitField};`;
        break;
      case 'CTX':
        statement = `DEF ${uniqueKey} ${varType} ${source} ${sourceField};`;
        break;
      case 'SPEC':
        statement = `DEF ${uniqueKey} SPEC ${specialType} ${specialValue};`;
        break;
      case 'VAR':
        statement = `DEF ${uniqueKey} VAR ${valueType};`;
        break;
      case 'FUN':
        statement = block => `DEF ${uniqueKey} FUN ${argsList};THEN;${block}RES ${result};DONE;`;
        break;
      default:
    }
  } else if (actionType === 'EXEC') {
    statement = `EXEC ${execStatement};`;
  }
  return statement;
}

function InsCard({ insData }: { insData: InsData }) {
  const { funName, funIns, argsList, example, exampleMeaning } = insData;
  return (
    <div className="ins-level-0">
      <p>
        <span>{intl.get('hpfm.customize.common.funName').d('函数名')}</span>
        {funName}
      </p>
      <p>
        <span>{intl.get('hpfm.customize.common.funIns').d('功能说明')}</span>
        {funIns}
      </p>
      {argsList && (
        <p>
          <span>{intl.get('hpfm.customize.common.argsList').d('参数列表')}</span>
          {argsList.map(arg => (
            <div className="ins-level-1">
              <p>
                <span>{arg.name}</span>
                {arg.ins}
              </p>
              {arg.extraData &&
                arg.extraData.map(data => (
                  <p className="ins-level-2">
                    <span>{data.name}</span>
                    {data.data}
                  </p>
                ))}
            </div>
          ))}
        </p>
      )}
      {example && (
        <>
          <p>
            <span>{intl.get('hpfm.customize.common.example').d('实例')}</span>
            {example}
          </p>
          <p>
            <span>{intl.get('hpfm.customize.common.exampleMeaning').d('实例说明')}</span>
            {exampleMeaning}
          </p>
        </>
      )}
    </div>
  );
}

function getValue(this: any, key) {
  return this.data[key];
}
