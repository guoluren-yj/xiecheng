import React, { Component } from 'react';
import {
  Row,
  Table,
  Modal,
  Lov,
  Form,
  DataSet,
  TextField,
  NumberField,
  Spin,
  Output,
  IntlField,
} from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import Upload from 'components/Upload/UploadButton';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import TextSearch from '@/components/TextSearch';
import {
  customFilterLineDS,
  filterObjectLineDS,
  ruleStatementDS,
  constantObjRuleStatementDS,
  filterObjectHeaderDS,
  taskRuleStatemetApiUrlPathDS,
  taskRuleStatemetApiUrlParamDS,
  taskRuleStatemetApiBodyParamDS,
  // ruleStatementCodeDS,
} from './indexDS';
import {
  onlineTask,
  offlineTask,
  getDataSourceRuleStatment,
  saveContantObjRuleStatment,
  // getSkillRuleStatement,
} from '@/services/SkillTreeService';
import './index.less';
import { bucketName, publicBucketName } from '@/utils/smblConstant.js';
import RuleApi from './RuleApi';
import ExecutableCodeAreaModal from '@/components/ExecutableCodeArea/ExecutableCodeAreaModal';

const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['smbl.purchaseRobotConfig', 'hzero.common', 'smbl.common'] })
export default class TaskLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  // 规则语句API正则
  ruleStatementApiReg = /\$\{(.*?)\}/g;

  // 任务列表-操作按钮
  taskListButtons = [
    [
      'add',
      {
        onClick: () => {
          const record = this.props.taskLineDataSet.create(
            {
              taskStatus: 'NEW',
              taskStatusMeaning: intl.get('smbl.purchaseRobotConfig.model.status.new').d('新建'),
              skillId: this.props.skillId,
            },
            0
          );
          this.handleSkillLineEdit({ record }, true);
        },
      },
    ],
    ['save', {}],
    ['delete', { color: 'red' }],
  ];

  // 任务列表columns，根据技能类型计算
  taskListColumns = (skillType, isSkillSelfDefine) => {
    return [
      { name: 'taskCode' },
      {
        name: 'taskStatusMeaning',
        renderer: ({ value, record }) => {
          // eslint-disable-next-line prefer-destructuring
          const taskStatus = record.data.taskStatus;
          let color = 'red';
          switch (taskStatus) {
            case 'ONLINE':
              color = 'green';
              break;
            case 'OFFLINE':
              color = 'red';
              break;
            case 'NEW':
              color = 'orange';
              break;
            default:
              color = 'red';
              break;
          }
          return (
            <Tag className="task-tag-frameless" color={color}>
              {value}
            </Tag>
          );
        },
      },
      { name: 'taskName' },
      {
        name: 'filterObject',
        renderer: ({ record }) => (
          <a key="filterObject" onClick={() => this.maintainFilterObject(record.data)}>
            {this.props.canEdit && record.get('taskStatus') !== 'ONLINE'
              ? intl.get('hzero.common.button.editor').d('编辑')
              : intl.get('smbl.purchaseRobotConfig.skillTree.view.button.view').d('查看')}
          </a>
        ),
      },
      skillType === 'IMPORT'
        ? {
            name: 'importTemplateLov',
          }
        : undefined,
      {
        name: 'firstUrl',
      },
      Number(organizationId) === 0
        ? {
            name: 'ruleJsUuid',
            renderer: ({ record }) => {
              return (
                <a
                  key="ruleJsUuid"
                  onClick={() => {
                    this.setupDataSourceRuleStatementCode(record);
                    // if (record.data.ruleType === 'CONSTANT_OBJECT') {
                    //   this.setupConstantRuleStatement(record.data);
                    // } else {
                    //   this.setupDataSourceRuleStatement(record.data);
                    // }
                  }}
                >
                  {this.props.canEdit && record.get('taskStatus') !== 'ONLINE'
                    ? intl
                        .get('smbl.purchaseRobotConfig.skillTree.view.button.editRuleStatement')
                        .d('设置')
                    : intl.get('smbl.purchaseRobotConfig.skillTree.view.button.view').d('查看')}
                </a>
              );
            },
          }
        : {
            name: 'taskMarmotCode',
          },
      { name: 'msgTemplate' },
      { name: 'remark' },
      { name: 'sort', align: 'left' },
      {
        name: 'taskLineAction',
        renderer: ({ record }) => {
          const commands = [];
          if (this.props.canEdit && record.data.taskStatus !== 'ONLINE') {
            commands.push(
              <a
                key="edit-value"
                funcType="flat"
                style={{ marginRight: '10px' }}
                onClick={() => this.handleSkillLineEdit({ record })}
              >
                {intl.get('hzero.common.button.editor').d('编辑')}
              </a>
            );
          }
          if (isSkillSelfDefine) {
            if (record.data.taskStatus === 'ONLINE') {
              commands.push(
                <a
                  key="on-line-value"
                  funcType="flat"
                  onClick={() => this.offlineTaskAction(record.data)}
                >
                  {intl.get('smbl.purchaseRobotConfig.skillTree.view.button.offline').d('下线')}
                </a>
              );
            } else {
              commands.push(
                <a
                  key="on-line-value"
                  funcType="flat"
                  onClick={() => this.onlineTaskAction(record.data)}
                >
                  {intl.get('smbl.purchaseRobotConfig.skillTree.view.button.online').d('上线')}
                </a>
              );
            }
          }
          return <>{commands}</>;
        },
        lock: 'right',
        align: 'left',
      },
    ];
  };

  /**
   * 任务行内操作按钮action，上线、下线、编辑功能
   * 1、上线、下线任务
   * 2、编辑打开任务编辑弹框
   */

  // 任务行操作-上线
  onlineTaskAction = (params) => {
    onlineTask(params)
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
        }
        this.props.taskLineDataSet.query();
      })
      .catch(() => {});
  };

  // 任务行操作-下线
  offlineTaskAction = (params) => {
    offlineTask(params)
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
        }
        this.props.taskLineDataSet.query();
      })
      .catch(() => {});
  };

  // 任务行操作-编辑
  handleSkillLineEdit = ({ record }, isNew) => {
    Modal.open({
      drawer: true,
      style: { width: 380 },
      title: isNew
        ? intl.get('smbl.purchaseRobotConfig.view.title.taskCreate').d('新建任务')
        : intl.get('smbl.purchaseRobotConfig.view.title.taskEdit').d('编辑'),
      onOk: () => this.handleSkillLineEditOk(record),
      onCancel: () => this.handleSkillLineEditCancel(record),
      children: (
        <Form record={record} columns={1} labelWidth={130} labelLayout="float">
          <TextField restrict="A-Za-z-_" name="taskCode" disabled={!isNew} />
          <IntlField name="taskName" />
          {this.props.skillType === 'IMPORT' ? <Lov name="importTemplateLov" /> : null}
          <TextField name="firstUrl" />
          <Lov name="msgTemplate" />
          <IntlField name="remark" type="multipleLine" rows={4} />
          <NumberField name="sort" step={1} min={0} />
        </Form>
      ),
    });
  };

  // 任务行操作-编辑-确认
  handleSkillLineEditOk = async (record) => {
    const flag = await record.validate();
    if (!flag) {
      return false;
    }
    this.props.taskLineDataSet.submit().catch(() => {
      // 保存失败，回滚
      this.props.taskLineDataSet.reset();
    });
  };

  // 任务行操作-编辑-取消
  handleSkillLineEditCancel = (record) => {
    if (record.status === 'add') {
      this.props.taskLineDataSet.remove(record);
    }
    this.props.taskLineDataSet.reset();
  };

  /**
   * 筛选对象维护功能--导出、查询类技能有筛选对象字段，点击维护可以设置该任务行的筛选对象字段
   * 1、来源筛选器说明：先选择LOV，得到selectedUnitId，再展示可选字段，
   *    选择的字段合并到下方自定义字段中；
   */

  // 筛选对象-自定义-dataSet
  customFilterLineDS = null;

  // 筛选对象-自定义-columns
  customFilterLineColumns = [];

  // 筛选对象-自定义-列表操作按钮
  customFilterLineButtons = [
    [
      'add',
      {
        onClick: () => {
          this.customFilterLineDS.create(
            {
              fieldSourceType: 'custom',
            },
            0
          );
        },
      },
    ],
    ['save', {}],
    ['delete', { color: 'red' }],
  ];

  // 筛选对象-来源筛选器-dataSet
  filterObjectHeaderDs = null;

  // 任务行-筛选对象-维护-来源筛选器-选择Lov-个性化编码
  selectedUnitId = null;

  // 筛选对象-维护-来源筛选器-选择字段-选择筛选器字段dataSet
  filterObjectFieldDS = null;

  // 任务行-筛选对象-维护按钮
  maintainFilterObject({ taskId, taskStatus }) {
    const editor = this.props.canEdit && taskStatus !== 'ONLINE';
    this.customFilterLineDS = new DataSet(
      customFilterLineDS(taskId, () => {
        // 保存筛选对象时必须触发任务行刷新，否则操作任务行数据版本对不上
        this.props.taskLineDataSet.query();
      })
    );
    this.customFilterLineDS.selection = editor ? 'multiple' : false;
    this.filterObjectHeaderDs = new DataSet(filterObjectHeaderDS(taskId, editor));
    this.showFilterObjectView(editor);
  }

  // 任务行-筛选对象-维护-显示弹框
  showFilterObjectView(editor) {
    this.selectedUnitId = null;
    this.customFilterLineColumns = [
      { name: 'fieldCode', editor },
      { name: 'fieldName', editor },
      {
        name: 'lovQueryParamObject',
        editor: (record) => {
          const widget = record.get('widget') || {};
          return Boolean(editor && record.get('lovCode') && widget.fieldWidget === 'LOV');
        },
      },
      {
        name: 'covertFilterParam',
        editor: (record) => {
          const widget = record.get('widget') || {};
          return Boolean(editor && widget.fieldWidget === 'SELECT');
        },
      },
      {
        name: 'needAgentCovert',
        editor,
      },
      {
        name: 'agentFieldName',
        editor,
      },
      {
        name: 'fieldSourceType',
        renderer: ({ value }) => {
          if (value === 'custom') {
            return intl.get('smbl.purchaseRobotConfig.model.fieldSource.custom').d('自定义');
          } else if (value === 'filter') {
            return intl.get('smbl.purchaseRobotConfig.model.fieldSource.filter').d('筛选器');
          }
          return '-';
        },
      },
      { name: 'remark', editor },
    ];
    Modal.open({
      drawer: true,
      title: intl.get('smbl.purchaseRobotConfig.model.filterObject').d('筛选对象'),
      okText: editor
        ? intl.get('hzero.common.button.ok').d('确定')
        : intl.get('hzero.common.model.button.close').d('关闭'),
      cancelButton: editor,
      children: (
        <div style={{ width: '100%', height: '100%' }}>
          <div className="task-filter-object-source">
            <div className="task-filter-object-source-icon" />
            <div className="task-filter-object-source-title">
              {intl.get('smbl.purchaseRobotConfig.view.title.fromFilters').d('来源筛选器')}
            </div>
          </div>
          {editor ? (
            <Form
              dataSet={this.filterObjectHeaderDs}
              showLines={6}
              columns={2}
              labelLayout="float"
              useColon={false}
            >
              <Lov
                name="filterNameLov"
                disabled={!editor}
                onChange={(param) => {
                  this.selectedUnitId = (param && param.id) || null;
                }}
                hidden={!editor}
              />
              <Output
                name="selectField"
                hidden={!editor}
                renderer={({ record }) => {
                  return (
                    <a
                      className="filter-select-field"
                      disabled={!editor || !record || !record.get('unitCode')}
                      onClick={() => {
                        this.showFieldsFromFilterObject();
                      }}
                    >
                      {intl.get('smbl.purchaseRobotConfig.view.button.selectField').d('选择字段')}
                    </a>
                  );
                }}
              />
            </Form>
          ) : (
            <span>{intl.get('smbl.purchaseRobotConfig.view.message.noData').d('暂无数据')}</span>
          )}
          <div className="task-filter-object-custom">
            <div className="task-filter-object-custom-icon" />
            <div className="task-filter-object-custom-title">
              {intl.get('smbl.purchaseRobotConfig.view.tab.selfDefine').d('自定义')}
            </div>
          </div>
          <Table
            dataSet={this.customFilterLineDS}
            columns={this.customFilterLineColumns}
            buttons={editor ? this.customFilterLineButtons : null}
          />
        </div>
      ),
      onOk: () => {
        if (editor) {
          this.customFilterLineDS.submit();
        }
      },
      style: { width: 700 },
    });
  }

  // 筛选对象-维护-来源筛选器-选择字段-选择筛选器字段弹框
  showFieldsFromFilterObject() {
    if (!this.selectedUnitId) {
      Modal.confirm({
        title: intl
          .get('smbl.purchaseRobotConfig.view.message.selectFilterAtFirst')
          .d('请先选择筛选器！'),
        okButton: false,
      });
      return false;
    }
    const filterObjectColumns = [{ name: 'fieldName' }, { name: 'fieldAlias' }, { name: 'remark' }];
    this.filterObjectFieldDS = new DataSet(filterObjectLineDS(this.selectedUnitId));
    Modal.open({
      drawer: true,
      title: intl.get('smbl.purchaseRobotConfig.view.button.selectField').d('选择字段'),
      children: <Table dataSet={this.filterObjectFieldDS} columns={filterObjectColumns} />,
      onOk: () => {
        // eslint-disable-next-line prefer-destructuring
        const selected = this.filterObjectFieldDS.selected;
        const currentData = this.customFilterLineDS.toData();
        selected.forEach(({ data }) => {
          const currentLength = currentData.filter((e) => {
            return data.fieldAlias === e.fieldCode;
          }).length;
          if (!currentLength) {
            let lovCode = null;
            if (data.widget && data.widget.fieldWidget === 'LOV') {
              lovCode = data.widget.sourceCode;
            } else if (data.widget && data.widget.fieldWidget === 'SELECT') {
              lovCode = data.widget.sourceCode;
            }
            this.customFilterLineDS.create(
              {
                ...data,
                lovCode,
                fieldCode: data.fieldAlias,
                fieldSourceType: 'filter',
              },
              0
            );
          }
        });
      },
      style: { width: 600 },
    });
    return true;
  }

  /**
   * 数据源规则模块-设置数据源规则语句，分为普通类、固定对象类两种处理方式
   * 1、普通类：接口、feign调用、调用链三种
   * 2、固定对象类：单独调用接口处理
   */

  // 数据源规则语句-代码-dataSet
  dataSourceRuleCodeDS = null;

  // 数据源规则语句-代码
  async setupDataSourceRuleStatementCode(record) {
    const isOnline = record.get('taskStatus') === 'ONLINE';
    const editor = this.props.canEdit && !isOnline;
    // this.dataSourceRuleCodeDS = new DataSet(ruleStatementCodeDS(record.get('taskId')));
    // this.setState({ loading: true });
    // let data = await getSkillRuleStatement(record.get('taskId'));
    // this.setState({ loading: false });
    // if (!getResponse(data)) {
    //   return;
    // }
    // if (!data.length) {
    //   data = [{}];
    // }
    // this.dataSourceRuleCodeDS.data = data;

    const autoSaveId = `task_rule_${record.get('taskId')}`;
    ExecutableCodeAreaModal.open(
      {
        title: intl.get('smbl.purchaseRobotConfig.view.title.setupRuleStatment').d('设置规则语句'),
        fullScreen: true,
        drawer: true,
        style: { width: '100%' },
        okText: editor
          ? intl.get('hzero.common.button.save').d('保存')
          : intl.get('hzero.common.model.button.close').d('关闭'),
        cancelText: intl.get('hzero.common.model.button.close').d('关闭'),
        cancelButton: editor,
        autoSaveId,
        onOk: () => this.handleRuleCodeOk(editor),
      },
      {
        record,
        name: 'ruleJsUuid',
        readOnly: !editor,
      }
    );
  }

  // 数据源规则编辑确认按钮
  handleRuleCodeOk = (editor) => {
    if (!editor) {
      return Promise.resolve(true);
    }
    if (!this.props.taskLineDataSet.dirty) {
      return Promise.resolve(true);
    }
    return this.props.taskLineDataSet.submit();
  };

  // 数据源规则-dataSet(两类均使用)
  dataSourceRuleDS = null;

  // 数据源规则-设置规则语句弹框(接口API类)
  async setupDataSourceRuleStatement(data) {
    const isOnline = data.taskStatus === 'ONLINE';
    const editor = this.props.canEdit && !isOnline;
    this.dataSourceRuleDS = new DataSet(
      ruleStatementDS(data.taskId, () => {
        // 保存规则语句必须触发任务行刷新，否则操作任务行数据版本对不上
        this.props.taskLineDataSet.query();
      })
    );
    this.dataSourceRuleDS.selection = editor ? 'multiple' : false;
    const dataSourceRuleColumns = [
      {
        name: 'sort',
        editor,
        align: 'left',
        width: 100,
      },
      {
        name: 'url',
        editor: false, // this.props.canEdit && !isOnline,
        align: 'left',
        renderer: ({ record, value }) => {
          return (
            <div className="task-rule-statement">
              <span className="task-rule-statement-content">{value}</span>
              <a
                className="task-rule-statement-edit-button"
                onClick={() => {
                  this.showSetupDataSourceRuleApiModal(record, editor);
                }}
              >
                {editor
                  ? intl.get('hzero.common.button.editor').d('编辑')
                  : intl.get('smbl.purchaseRobotConfig.skillTree.view.button.view').d('查看')}
              </a>
            </div>
          );
        },
      },
      {
        name: 'httpMethodLov',
        editor,
        align: 'left',
        width: 100,
      },
    ];

    const buttons = [
      [
        'add',
        {
          onClick: () => {
            if (this.dataSourceRuleDS.length >= 1) {
              if (data.ruleType === 'FEIGN' || data.ruleType === 'INTERFACE') {
                notification.error({
                  message: intl
                    .get('smbl.purchaseRobotConfig.view.message.ruleTypeOnlyOneRule')
                    .d('当前数据源规则只允许创建一条规则语句！'),
                });
                return;
              }
            }
            this.dataSourceRuleDS.create(
              {
                taskId: data.taskId,
              },
              this.dataSourceRuleDS.data.length
            );
          },
        },
      ],
      ['save'],
      ['delete', { color: 'red' }],
    ];
    Modal.open({
      title: intl.get('smbl.purchaseRobotConfig.view.title.setupRuleStatment').d('设置规则语句'),
      drawer: true,
      resizable: true,
      style: { width: 800 },
      okText: editor
        ? intl.get('hzero.common.button.ok').d('确定')
        : intl.get('hzero.common.model.button.close').d('关闭'),
      cancelButton: editor,
      children: (
        <Table
          dataSet={this.dataSourceRuleDS}
          columns={dataSourceRuleColumns}
          buttons={editor ? buttons : null}
        />
      ),
      onOk: () => this.handleDataSourceRuleOk(editor),
    });
  }

  // 数据源规则编辑确认按钮
  handleDataSourceRuleOk = async (editor) => {
    if (!editor) {
      return true;
    }
    const flag = await this.dataSourceRuleDS.validate();
    if (!flag) {
      return false;
    }
    this.dataSourceRuleDS.submit();
  };

  // 数据源规则，设置API url 路径
  ruleStatementApiUrlPathDataSet = null;

  // 数据源规则，设置API url 参数
  ruleStatementApiUrlParamDataSet = null;

  // 数据源规则，设置API body 参数
  ruleStatementApiBodyParamDataSet = null;

  // 数据源规则-设置规则语句API弹框
  showSetupDataSourceRuleApiModal(record, editor) {
    const url = record.get('url') || '';

    const encodeOrignMap = {};
    let newUrl;
    if (typeof url.replaceAll === 'function') {
      newUrl = url.replaceAll(this.ruleStatementApiReg, (val) => {
        const encodeUrl = encodeURIComponent(val);
        encodeOrignMap[encodeUrl] = val;
        return encodeUrl;
      });
    } else {
      newUrl = url.replace(this.ruleStatementApiReg, (val) => {
        const encodeUrl = encodeURIComponent(val);
        encodeOrignMap[encodeUrl] = val;
        return encodeUrl;
      });
    }

    const array = newUrl.split('?');
    let urlPath = array[0];
    const urlParamStr = array[1];
    let params = [];
    if (urlParamStr) {
      const paramStrs = urlParamStr.split('&');
      params = paramStrs.map((p) => {
        const kv = p.split('=');
        if (kv.length) {
          const k = kv[0];
          let v = kv[1] || '';
          // 每一段均遍历原值
          Object.keys(encodeOrignMap).forEach((key) => {
            v = v.replace(key, encodeOrignMap[key] || '');
          });
          return { key: k, value: v };
        }
        return undefined;
      });
    }

    Object.keys(encodeOrignMap).forEach((key) => {
      urlPath = urlPath.replace(new RegExp(key, 'g'), encodeOrignMap[key]);
    });

    this.ruleStatementApiUrlPathDataSet = new DataSet(taskRuleStatemetApiUrlPathDS());
    this.ruleStatementApiUrlPathDataSet.data = [{ urlPath }];

    this.ruleStatementApiUrlParamDataSet = new DataSet(taskRuleStatemetApiUrlParamDS());
    this.ruleStatementApiUrlParamDataSet.selection = editor ? 'multiple' : false;
    this.ruleStatementApiUrlParamDataSet.data = params;
    const jsonBody = record.get('jsonBody');
    this.ruleStatementApiBodyParamDataSet = new DataSet(taskRuleStatemetApiBodyParamDS());
    this.ruleStatementApiBodyParamDataSet.data = [
      {
        jsonBody,
      },
    ];

    Modal.open({
      title: intl.get('smbl.purchaseRobotConfig.view.title.setupTaskRuleApi').d('设置Api'),
      children: (
        <RuleApi
          ruleStatementApiUrlPathDataSet={this.ruleStatementApiUrlPathDataSet}
          ruleStatementApiUrlParamDataSet={this.ruleStatementApiUrlParamDataSet}
          ruleStatementApiBodyParamDataSet={this.ruleStatementApiBodyParamDataSet}
          editor={editor}
        />
      ),
      drawer: true,
      closable: true,
      okText: editor
        ? intl.get('hzero.common.button.ok').d('确定')
        : intl.get('hzero.common.model.button.close').d('关闭'),
      cancelButton: editor,
      onOk: () => this.handleRuleStatementApiOk(editor, record),
      style: { width: 700 },
    });
  }

  // 设置规则语句API，确定按钮事件
  handleRuleStatementApiOk = async (editor, record) => {
    if (!editor) {
      return true;
    }
    const flag =
      (await this.ruleStatementApiUrlPathDataSet.validate()) &&
      (await this.ruleStatementApiUrlParamDataSet.validate());
    if (!flag) {
      return false;
    }
    const encodeOrignMap = {};
    const newUrlPath = this.ruleStatementApiUrlPathDataSet.records[0].get('urlPath');
    const encodeUrlPath = newUrlPath.replace(this.ruleStatementApiReg, (val) => {
      const encodeUrl = encodeURIComponent(val);
      encodeOrignMap[encodeUrl] = val;
      return encodeUrl;
    });
    const paramList = (this.ruleStatementApiUrlParamDataSet.toData() || []).map(
      (e) => `${e.key}=${e.value}`
    );
    const newParamStr = paramList.join('&');

    let resultUrl = null;
    if (encodeUrlPath.indexOf('?') === -1) {
      // 不含？，纯路径，添加?后拼接一起
      resultUrl = `${encodeUrlPath}?${newParamStr}`;
    } else if (encodeUrlPath.endsWith('?')) {
      // 最后一位是?，直接拼接但不加？
      resultUrl = `${encodeUrlPath}${newParamStr}`;
    } else if (!encodeUrlPath.endsWith('&')) {
      // 含有?并且最后一位不是是&，添加&后连接一起
      resultUrl = `${encodeUrlPath}&${newParamStr}`;
    } else {
      // 含有?，最后一位是&，直接连接
      resultUrl = `${encodeUrlPath}${newParamStr}`;
    }

    Object.keys(encodeOrignMap).forEach((key) => {
      resultUrl = resultUrl.replace(new RegExp(key, 'g'), encodeOrignMap[key]);
    });
    record.set('url', resultUrl);
    const jsonBody = this.ruleStatementApiBodyParamDataSet.current.get('jsonBody');
    record.set('jsonBody', jsonBody);
  };

  // 数据源规则-设置规则语句弹框（固定值类）
  async setupConstantRuleStatement(task) {
    const isOnline = task.taskStatus === 'ONLINE';
    const editor = this.props.canEdit && !isOnline;
    this.setState({ loading: true });
    this.dataSourceRuleDS = new DataSet(constantObjRuleStatementDS(task.taskId, task.ruleType));
    this.dataSourceRuleDS.selection = editor ? 'multiple' : false;
    let datas = await getDataSourceRuleStatment(task.taskId);
    this.setState({ loading: false });
    if (getResponse(datas) && datas && datas instanceof Array && datas.length) {
      this.dataSourceRuleDS.data = datas[0].jsonObjectParse;
    } else {
      datas = [];
      datas.push({
        tenantId: organizationId,
        sort: 1,
      });
      this.dataSourceRuleDS.data = [];
    }
    const dataSourceRuleColumns = [
      {
        name: 'fieldCode',
        editor,
        align: 'left',
        width: 100,
      },
      {
        name: 'fieldName',
        editor,
        align: 'left',
        width: 100,
      },
      {
        name: 'fieldTypeLov',
        editor,
        align: 'left',
        width: 100,
      },
      {
        name: 'value',
        align: 'left',
        editor: (record) => {
          return record.get('fieldType') === 'TEXT' && editor;
        },
        renderer: ({ record, value }) => {
          const fieldType = record.get('fieldType');
          if (fieldType === 'TEXT') {
            return value;
          } else if (fieldType === 'PUBLIC_FILE' || fieldType === 'PRIVATE_FILE') {
            let fileName = null;
            if (value && typeof value === 'string' && value.length) {
              if (value.indexOf('@') !== -1) {
                const subUrls = value.split('@');
                fileName = subUrls[subUrls.length - 1];
              } else {
                fileName = value;
              }
            }
            if (!editor) {
              return fileName;
            }
            const fieldBucket = fieldType === 'PUBLIC_FILE' ? publicBucketName : bucketName;
            return (
              <Upload
                multiple={false}
                disabled={!editor}
                // accept="image/*" // 不限制文件类型
                onRemove={() => {
                  record.set('value', null);
                }}
                onSuccess={(url) => {
                  record.set('value', url);
                }}
                bucketName={fieldBucket}
                showUploadList={false}
              >
                <a disabled={!editor}>
                  {fileName || intl.get('smbl.purchaseRobotConfig.button.uploadFile').d('上传附件')}
                </a>
              </Upload>
            );
          } else {
            return value;
          }
        },
      },
    ];
    const saveAction = () => {
      const list = [];
      const dataList = this.dataSourceRuleDS.toData();
      dataList.forEach((e) => {
        list.push({
          ...e,
        });
      });
      datas[0].jsonObjectParse = list;
      datas[0].jsonObject = JSON.stringify(list);
      this.dataSourceRuleDS.status = 'loading';
      saveContantObjRuleStatment(task.taskId, datas)
        .then((res) => {
          if (getResponse(res) && res && res instanceof Array && datas.length) {
            notification.success();
            datas = res;
            this.dataSourceRuleDS.data = res[0].jsonObjectParse;
            // 保存固定对象类成功时，刷新任务行列表，否则操作任务数据时数据过期
            this.props.taskLineDataSet.query();
          }
          this.dataSourceRuleDS.status = 'ready';
        })
        .catch(() => {
          this.dataSourceRuleDS.status = 'ready';
        });
    };
    const buttons = [
      [
        'add',
        {
          onClick: () => {
            this.dataSourceRuleDS.create(
              {
                fieldType: 'TEXT',
                fieldTypeMeaning: intl
                  .get('smbl.purchaseRobotConfig.model.rule.textFeildType')
                  .d('文本'),
              },
              0
            );
          },
        },
      ],
      [
        'save',
        {
          onClick: () => {
            // 如果没有变更数据，不执行保存操作
            if (!this.dataSourceRuleDS.dirty) {
              return true;
            }
            this.dataSourceRuleDS.validate().then((flag) => {
              if (flag) {
                saveAction();
              }
            });
          },
        },
      ],
      [
        'delete',
        {
          color: 'red',
          onClick: () => {
            this.dataSourceRuleDS.remove(this.dataSourceRuleDS.selected, true);
            saveAction();
          },
        },
      ],
    ];
    Modal.open({
      title: intl.get('smbl.purchaseRobotConfig.view.title.setupRuleStatment').d('设置规则语句'),
      drawer: true,
      okText: editor
        ? intl.get('hzero.common.button.ok').d('确定')
        : intl.get('hzero.common.model.button.close').d('关闭'),
      style: { width: 800 },
      cancelButton: editor,
      children: (
        <Table
          dataSet={this.dataSourceRuleDS}
          columns={dataSourceRuleColumns}
          buttons={editor ? buttons : null}
        />
      ),
      onOk: () => this.handleConstantRuleStatementOk(editor, () => saveAction()),
    });
  }

  // 固定对象编辑框确定按钮事件
  handleConstantRuleStatementOk = async (editor, saveAction) => {
    if (!editor) {
      return true;
    }
    // 如果没有变更数据，不执行保存操作
    if (!this.dataSourceRuleDS.dirty) {
      return true;
    }
    const flag = await this.dataSourceRuleDS.validate();
    if (!flag) {
      return false;
    }
    saveAction();
  };

  handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const { state: { _back } = {} } = location;
    // eslint-disable-next-line no-unused-expressions
    const dataObj = this.props.taskLineDataSet.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['commonQuery'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    this.props.taskLineDataSet.queryDataSet?.current
      ? this.props.taskLineDataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : this.props.taskLineDataSet.queryDataSet?.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    if (_back === -1) {
      this.props.taskLineDataSet.query(this.props.taskLineDataSet.currentPage);
    } else {
      this.props.taskLineDataSet.query();
    }
  };

  render() {
    const { loading } = this.state;
    const { taskLineDataSet, skillType, canEdit, isSkillSelfDefine } = this.props;
    taskLineDataSet.selection = canEdit ? 'multiple' : false;
    return (
      <Spin spinning={loading}>
        <Row code="taskLine">
          <SearchBarTable
            dataSet={taskLineDataSet}
            columns={this.taskListColumns(skillType, isSkillSelfDefine)}
            buttons={canEdit ? this.taskListButtons : null}
            searchCode="SMBL.PURCHASE_ROBOT.SKILL_TREE.TASK_LIST.FILTER"
            aggregation
            cacheState
            searchBarConfig={{
              editorProps: {},
              fieldProps: {},
              closeFilterSelector: true,
              left: {
                render: () => (
                  <TextSearch
                    name="commonQuery"
                    handleQuery={() => {}}
                    dataSet={taskLineDataSet}
                    placeholder={intl
                      .get('smbl.purchaseRobotConfig.model.task.commonQuery')
                      .d('任务名称或任务编码')}
                  />
                ),
              },
              onClear: () => {},
              onReset: () => {},
              onQuery: this.handleQuery,
            }}
          />
          {/* <Table
            buttons={canEdit ? this.taskListButtons : null}
            dataSet={taskLineDataSet}
            columns={this.taskListColumns(skillType)}
          /> */}
        </Row>
      </Spin>
    );
  }
}
