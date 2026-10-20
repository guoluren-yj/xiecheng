import React from 'react';
import _ from 'lodash';
import { Button, Modal, Form, DataSet, Select, TextField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';
// import xmlFormat from 'xml-formatter';
import notification from 'hzero-front/lib/utils/notification';
import ReactFileReader from 'react-file-reader';
import { parseString, parseStringPromise } from 'xml2js';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import QuestionPopover from '@/components/QuestionPopover';
import getLang from '@/langs/commonLang';
import SourceData from './sourceData';
import TargetData from './targetData';
import DrawLines from './drawLines';
import {
  calCoord,
  getRelationScript,
  transformLine,
  insertScriptHeader,
  getSameLineRel,
  getSameNameRel,
  jsonParse,
  xmlParse,
  screenRelation,
  getOffset,
} from './util';
import AceEditor from './AceEditor';
import DataDrawer from './DataDrawer';
import './fieldMapping.less';
import MenuButton from './MenuButton';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
class FieldMapping extends React.Component {
  sourceCom;

  targetCom;

  static defaultProps = {
    relation: [],
    source: {
      data: [],
      columns: [],
      mutiple: false,
    },
    target: {
      data: [],
      columns: [],
      mutiple: false,
    },
    edit: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      relation: [],
      currentRelation: {},
      modalType: 'source',
      sourceInputData: '',
      targetInputData: '',
      aceEditorHeight: 500,
      aceEditorWidth: 500,
      relationScript: insertScriptHeader(''),
      source: {
        data: [],
        columns: [],
        mutiple: false,
      },
      target: {
        data: [],
        columns: [],
        mutiple: false,
      },
      findItem: [],
      findTargetItem: [],
      searchingSource: false,
      searchingTarget: false,
      currentId: uuid(),
      contentId: uuid(),
      contentTargetId: uuid(),
      searchSourceId: uuid(),
      searchTargetId: uuid(),
      sourceValue: '',
      targetValue: '',
      fullSrceen: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const {
      sourceInputData: nextSourceInputData,
      targetInputData: nextTargetInputData,
      edit: nextEdit,
      script: nextScript,
    } = nextProps;
    const {
      sourceInputData: prevSourceInputData,
      targetInputData: prevTargetInputData,
      edit: prevEdit,
      script: prevScript,
    } = this.props;

    if (
      !_.isEmpty(nextSourceInputData) ||
      !_.isEmpty(nextTargetInputData) ||
      nextSourceInputData !== prevSourceInputData ||
      nextTargetInputData !== prevTargetInputData ||
      nextEdit !== prevEdit ||
      nextScript !== prevScript
    ) {
      this.init(nextProps);
    }
  }

  componentDidMount() {
    this.init(this.props);
    this.refreshHeight = setInterval(() => {
      this.setAceEditorSize();
    }, 1500);
  }

  componentWillUnmount() {
    clearInterval(this.refreshHeight);
  }

  /**
   * 初始化
   */
  async init(props) {
    const { sourceInputData, targetInputData, script, edit = false } = props;
    const sourceData = await this.formatInputData(sourceInputData, 'payload');
    const targetData = await this.formatInputData(targetInputData, 'TARGET');
    const { source, target } = this.formatColumns({ edit, sourceData, targetData });
    let relation = transformLine(
      script,
      (sourceData[0] || {}).children,
      (targetData[0] || {}).children
    );
    this.setState(
      {
        source,
        target,
        sourceInputData,
        targetInputData,
        relationScript: script,
      },
      () => {
        relation = calCoord(_.assign([], relation), this);
        this.changeRelation(relation, false);
      }
    );
  }

  async formatInputData(data = '', type) {
    let temp = [];
    if (this.isJson(data)) {
      temp = jsonParse({ [type]: JSON.parse(data) });
    } else if (this.isXml(data)) {
      const xmlData = (await this.parseXmlData(data)) || {};
      temp = xmlParse({ [type]: xmlData });
    }
    return temp;
  }

  formatColumns(props) {
    const { edit, sourceData, targetData } = props;
    const sourceCols = [
      {
        title: !edit ? (
          <QuestionPopover text={getLang('SOURCE_TITLE')} message={getLang('SOURCE_TITLE_TIP')} />
        ) : (
          <a title={getLang('SOURCE_TITLE')} onClick={() => this.handleOpenDataDrawer('source')}>
            <Icon
              type="mode_edit"
              style={{ fontSize: '10px', marginRight: '5px', marginTop: '-2px' }}
            />
            <QuestionPopover text={getLang('SOURCE_TITLE')} message={getLang('SOURCE_TITLE_TIP')} />
          </a>
        ),
        key: 'name',
        width: '100%',
      },
    ];
    const targetCols = [
      {
        title: !edit ? (
          <QuestionPopover text={getLang('TARGET_TITLE')} message={getLang('TARGET_TITLE_TIP')} />
        ) : (
          <a title={getLang('TARGET_TITLE')} onClick={() => this.handleOpenDataDrawer('target')}>
            <Icon
              type="mode_edit"
              style={{ fontSize: '10px', marginRight: '5px', marginTop: '-2px' }}
            />
            <QuestionPopover text={getLang('TARGET_TITLE')} message={getLang('TARGET_TITLE_TIP')} />
          </a>
        ),
        key: 'name',
        width: '100%',
      },
    ];
    return {
      source: {
        data: sourceData,
        columns: sourceCols,
        mutiple: false,
      },
      target: {
        data: targetData,
        columns: targetCols,
        mutiple: false,
      },
    };
  }

  /**
   * 来源数据、目标数据弹窗
   */
  @Bind()
  handleOpenDataDrawer(modalType) {
    const { sourceType, targetType } = this.props;
    if (_.isEmpty(sourceType) || _.isEmpty(targetType)) {
      return notification.error({
        message: getLang('VALIDATE_DATA_TYPE'),
      });
    }
    const { sourceInputData = '', targetInputData = '' } = this.state;
    const data = modalType === 'source' ? sourceInputData : targetInputData;
    const dataType = modalType === 'source' ? sourceType : targetType;
    // data = dataType === 'SOAP' ? xmlFormat(data, { collapseContent: true }) : data;
    this.setState({ modalType });
    const dataDrawerProps = {
      data,
      dataType,
      onRef: (ref) => {
        this.dataForm = ref;
      },
    };
    this.dataDrawer = Modal.open({
      title: getLang('FIELD_DATA'),
      drawer: true,
      closable: true,
      destroyOnClose: true,
      style: { width: 800 },
      children: <DataDrawer {...dataDrawerProps} />,
      footer: (_okBtn, cancelBtn) => (
        <>
          {cancelBtn}
          <Button color="primary" onClick={() => this.handleDataDrawerOk(dataType)}>
            {getLang('VALIDATE_IMPORT')}
          </Button>
        </>
      ),
    });
  }

  /**
   * 确定操作
   */
  @Bind()
  async handleDataDrawerOk(type) {
    const { modalType } = this.state;
    const inputData = await this.dataForm.handleOk();
    if (!inputData) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    let structData = {};
    if (type === 'REST') {
      structData = this.parseJsonData(inputData);
    } else if (type === 'SOAP') {
      structData = await this.parseXmlData(inputData);
    }
    if (_.isUndefined(structData)) {
      return false;
    }
    if (modalType === 'source') {
      this.setInputData('payload', structData, type, inputData);
    } else {
      this.setInputData('TARGET', structData, type, inputData);
    }
    const inputDataFiled = modalType === 'source' ? 'sourceInputData' : 'targetInputData';
    this.setState({ [inputDataFiled]: inputData });
    this.dataDrawer.close();
  }

  /**
   * 转换为JOSN结构
   */
  parseJsonData(data) {
    let structData = {};
    try {
      structData = JSON.parse(data);
    } catch (error) {
      notification.error({
        message: getLang('JSON_VALIDATE'),
      });
      return undefined;
    }
    return structData;
  }

  /**
   * 转换为XML结构
   */
  async parseXmlData(data) {
    let structData = {};
    await parseStringPromise(data, {
      xmlns: true,
      explicitArray: false,
    })
      .then((result) => {
        structData = result;
      })
      .catch(() => {
        structData = undefined;
        notification.error({
          message: getLang('XML_VALIDATE'),
        });
      });
    return structData;
  }

  isXml(data) {
    if (_.isEmpty(data)) {
      return false;
    }
    let flag = true;
    parseString(data, (err) => {
      if (err) {
        flag = false;
      }
    });
    return flag;
  }

  isJson(data) {
    let flag = true;
    try {
      JSON.parse(data);
    } catch (error) {
      flag = false;
    }
    return flag;
  }

  /**
   * 设置sourceData/targetData
   */
  setInputData(prefix, structData, type = 'REST', inputData) {
    const { modalType, source, target } = this.state;
    let data = { [prefix]: structData };
    if (type === 'REST') {
      data = jsonParse(data);
    } else {
      data = xmlParse(data);
    }
    if (modalType === 'source') {
      this.props.onGetValue({ sourceInputData: inputData });
      this.setState({
        source: {
          ...source,
          data,
        },
        sourceInputData: inputData,
      });
    } else if (modalType === 'target') {
      this.props.onGetValue({ targetInputData: inputData });
      this.setState({
        target: {
          ...target,
          data,
        },
        targetInputData: inputData,
      });
    } else if (modalType === 'all') {
      this.props.onGetValue({ sourceInputData: inputData, targetInputData: inputData });
      this.setState({
        source:
          prefix === 'payload'
            ? {
                ...source,
                data,
              }
            : source,
        target:
          prefix === 'TARGET'
            ? {
                ...target,
                data,
              }
            : target,
        sourceInputData: inputData,
        targetInputData: inputData,
      });
    }
    this.refreshRelationAndScript();
  }

  /**
   * 更新连线和脚本
   */
  refreshRelationAndScript() {
    const {
      source: { data: sourceData },
      target: { data: targetData },
      relation,
    } = this.state;
    const relations = screenRelation(sourceData, targetData, relation);
    const script = getRelationScript(relations, sourceData, targetData);
    this.props.onGetValue({ script });
    this.setState({ relationScript: script });
    const temps = calCoord(_.assign([], relations), this);
    this.changeRelation(temps, false);
  }

  uniqWith(data) {
    return _.uniqWith(data, (n1, n2) => {
      return n1.key === n2.key;
    }).filter((item) => !!item.key);
  }

  changeRelation(relation, isUpdate = true) {
    this.setState(
      {
        relation,
      },
      () => {
        // eslint-disable-next-line no-unused-expressions
        isUpdate && this.props.onChange && this.props.onChange(relation);
      }
    );
  }

  changeIconStatus(iconStatus) {
    this.setState({
      iconStatus,
    });
  }

  overActive(item, type, active) {
    const relation = _.assign([], this.state.relation);
    let currentRelation = {};
    relation.forEach((n) => {
      if (n[type].key === item.key) {
        if (active === 'enter') {
          currentRelation = n;
        } else if (active === 'leave') {
          currentRelation = {};
        }
      }
    });
    this.setState({
      currentRelation,
    });
  }

  changeSource(oldIndex, newIndex) {
    const {
      source: { data: sourceData = [] },
    } = this.state;
    let data = _.assign([], sourceData);
    const item = data.slice(oldIndex, oldIndex + 1);
    data.splice(oldIndex, 1);
    const dataS = data.slice(0, newIndex);
    const dataE = data.slice(newIndex, data.length);
    data = dataS.concat(item).concat(dataE);
    const relation = calCoord(_.assign([], this.props.relation), this);
    this.changeRelation(relation, false);
  }

  changeTarget(oldIndex, newIndex) {
    const {
      target: { data: targetData = [] },
    } = this.state;
    let data = _.assign([], targetData);
    const item = data.slice(oldIndex, oldIndex + 1);
    data.splice(oldIndex, 1);
    const dataS = data.slice(0, newIndex);
    const dataE = data.slice(newIndex, data.length);
    data = dataS.concat(item).concat(dataE);
    const relation = calCoord(_.assign([], this.props.relation), this);
    this.changeRelation(relation, false);
  }

  /**
   * 输入的脚本保存
   */
  handleSetScript(value) {
    this.props.onGetValue({ script: value });
    this.setState({ relationScript: value }, () => {
      this.scriptToLine(value);
    });
  }

  /**
   * 由脚本实时更新连线
   */
  scriptToLine(script) {
    const {
      source: { data: sourceData = [] },
      target: { data: targetData = [] },
    } = this.state;
    const relation = transformLine(
      script,
      (sourceData[0] || {}).children,
      (targetData[0] || {}).children
    );
    const newRelation = calCoord(_.assign([], relation), this);
    this.changeRelation(newRelation);
  }

  /**
   * 设置右边代码框大小
   */
  setAceEditorSize() {
    const { aceEditorHeight } = this.state;
    const sourceEle = this.sourceCom.boxEle.querySelector('.column-content');
    const targetEle = this.targetCom.boxEle.querySelector('.column-content');
    const sourceNum = Array.from(sourceEle.getElementsByTagName('li')).filter(
      (element) => element.style.display !== 'none'
    ).length;
    const targetNum = Array.from(targetEle.getElementsByTagName('li')).filter(
      (element) => element.style.display !== 'none'
    ).length;
    const num = _.max([sourceNum, targetNum]);
    const newHeight = (num + 1) * 36;
    if (aceEditorHeight !== newHeight) {
      this.setState({
        aceEditorHeight: num === 0 ? aceEditorHeight : newHeight,
      });
    }
  }

  /**
   * 由关系数组推导出脚本
   */
  handleGetRelationScript(relation, sourceData, targetData) {
    const relationScript = getRelationScript(relation, sourceData, targetData);
    this.props.onGetValue({ script: relationScript });
    const temps = calCoord(_.assign([], relation), this);
    this.changeRelation(temps, false);
    this.setState({ relationScript });
  }

  /**
   * 获取同行关系
   */
  @Bind()
  handleSameLineRel() {
    const {
      source: { data: sourceData=[] },
      target: { data: targetData=[] },
      searchingSource,
      searchingTarget,
    } = this.state;
    if (!searchingTarget && !searchingSource) {
      sourceData[0].displayIcon = false;
      targetData[0].displayIcon = false;
      this.sourceCom.handleToggle(sourceData[0]);
      this.targetCom.handleToggle(targetData[0]);
    }
    let relation = getSameLineRel(sourceData, targetData);
    const script = getRelationScript(relation, sourceData, targetData);
    this.props.onGetValue({ script });
    relation = calCoord(_.assign([], relation), this);
    this.changeRelation(relation, false);
    this.setState({ relationScript: script });
  }

  /**
   * 获取同名关系
   */
  @Bind()
  handleSameNameRel() {
    const {
      source: { data: sourceData = [] },
      target: { data: targetData = [] },
      searchingSource,
      searchingTarget,
    } = this.state;
    if (!searchingTarget && !searchingSource) {
      sourceData[0].displayIcon = false;
      targetData[0].displayIcon = false;
      this.sourceCom.handleToggle(sourceData[0]);
      this.targetCom.handleToggle(targetData[0]);
    }
    let relation = getSameNameRel(sourceData, targetData);
    const script = getRelationScript(relation, sourceData, targetData);
    this.props.onGetValue({ script });
    relation = calCoord(_.assign([], relation), this);
    this.changeRelation(relation, false);
    this.setState({ relationScript: script });
  }

  /**
   * 取消关联
   */
  handleCancelRel() {
    const script = insertScriptHeader('');
    this.props.onGetValue({ script });
    this.setState({ relationScript: script, relation: [] });
  }

  @Bind()
  handleOpenFileModal(fileType) {
    const options = [
      {
        value: 'source',
        meaning: getLang('SOURCE_TITLE'),
      },
      {
        value: 'target',
        meaning: getLang('TARGET_TITLE'),
      },
      {
        value: 'all',
        meaning: getLang('ALL_TITLE'),
      },
    ];
    this.fileDataSet = new DataSet({
      autoQuery: false,
      autoCreate: true,
      selection: false,
      fields: [
        {
          name: 'fieldSource',
          label: getLang('FILE_SOURCE'),
          type: 'string',
          required: true,
        },
      ],
    });
    this.fileModal = Modal.open({
      title: getLang('IMPORT'),
      closable: true,
      destroyOnClose: true,
      style: { width: 450 },
      children: (
        <Form dataSet={this.fileDataSet}>
          <Select
            name="fieldSource"
            options={new DataSet({ data: options })}
            onChange={(val) => {
              this.setState({ modalType: val });
              this.fileModal.update({
                footer: this.renderFileModalFooter(_.isEmpty(val), fileType),
              });
            }}
          />
        </Form>
      ),
      afterClose: () => this.fileDataSet.reset(),
      footer: this.renderFileModalFooter(true, fileType),
    });
  }

  /**
   * 更新文件弹窗按钮
   */
  @Bind()
  renderFileModalFooter(disable = true, fileType) {
    return (
      <ReactFileReader
        disabled={disable}
        fileTypes={fileType}
        handleFiles={(files) => this.handleFiles(files, fileType)}
      >
        <Button color="primary">{getLang('IMPORT')}</Button>
      </ReactFileReader>
    );
  }

  /**
   * JSON文件上传处理
   * @param {ARRAY} files 文件
   */
  @Bind()
  handleFiles(files, fileType) {
    const { modalType } = this.state;
    Modal.confirm({
      title: getLang('CONFIRM'),
      children: (
        <div>
          <p>{getLang('IMPORT_CONFIRM_TIP')}</p>
        </div>
      ),
    }).then((button) => {
      if (button === 'ok') {
        if (window.FileReader) {
          const reader = new FileReader();
          reader.readAsText(files[0]);
          reader.onload = () => {
            if (reader.result) {
              const type = fileType.length === 1 && fileType[0] === '.json' ? 'REST' : 'SOAP';
              const structData =
                type === 'REST'
                  ? JSON.parse(reader.result)
                  : this.parseXmlData(reader.result) || {};
              if (modalType === 'source') {
                this.setInputData('payload', structData, type, reader.result);
              } else if (modalType === 'target') {
                this.setInputData('TARGET', structData, type, reader.result);
              } else {
                this.setInputData('payload', structData, type, reader.result);
                this.setInputData('TARGET', structData, type, reader.result);
              }
              this.fileModal.close();
            }
          };
        }
      }
    });
  }

  /**
   * 全屏展示
   */
  openFullSrceen(props) {
    const { fullSrceen } = this.state;
    const aceEditorProps = {
      ...props,
      width: document.querySelector('body').offsetWidth - 50,
      height: document.querySelector('body').offsetHeight - 278,
    };
    if (!fullSrceen) {
      Modal.open({
        mask: false,
        closable: true,
        title: getLang('DW_SCRIPT'),
        okText: getLang('CLOSE'),
        style: { width: '50%' },
        children: <AceEditor {...aceEditorProps} />,
        afterClose: () => this.setState({ fullSrceen: false }),
        footer: (okbtn) => okbtn,
      });
      this.setState({ fullSrceen: true });
    }
  }

  @Bind()
  handleNodeDoubleClick(item) {
    const {
      source: { data: sourceData },
      target: { data: targetData },
      relation,
    } = this.state;

    relation.push({
      source: {},
      target: item,
    });

    this.handleGetRelationScript(relation, sourceData, targetData);
  }

  @Bind()
  showPath(path, data) {
    data.map((item) => {
      if (
        path.includes(item.name) &&
        path.indexOf(item.name) === item.level - 1 &&
        (path.includes(item.parentName) || item.level === 1)
      ) {
        Object.defineProperty(item, 'displayIcon', { value: true, enumerable: true });
        Object.defineProperty(item, 'displayTree', { value: true, enumerable: true });
      }
      if (item.children) {
        this.showPath(path, item.children);
      }
      return null;
    });
  }

  @Bind()
  handleSearchSource(dataList) {
    const {
      source: { data: sourceData },
      relation,
      findItem,
      currentId,
      contentId,
      searchSourceId,
    } = this.state;
    if (sourceData.length !== 0) {
      const baseY = getOffset(document.getElementsByClassName('field-relation')[currentId]).top;
      const { value } = document.getElementById(searchSourceId);
      dataList.map((item) => {
        if (item.name.indexOf(value.trim()) >= 0) {
          this.setState({
            searchingSource: true,
          });
          sourceData[0].displayIcon = true;
          this.sourceCom.handleToggle(sourceData[0]);
          findItem.push(item);
          findItem.map((find) => {
            relation.map((relationItem) => {
              if (
                relationItem.source.name === find.name &&
                find.parentPath === relationItem.source.parentPath
              ) {
                new Promise((resolve) => {
                  resolve();
                }).then(() => {
                  Object.defineProperty(relationItem.source, 'y', {
                    value:
                      getOffset(
                        document.getElementsByClassName('column-content')[contentId].children[
                          find.index
                        ]
                      ).top -
                      baseY +
                      17,
                    enumerable: true,
                  });
                });
              }
              return null;
            });
            const path = find.parentPath.split('.');
            this.showPath(path, sourceData);
            Object.defineProperty(find, 'displayTree', { value: true, enumerable: true });
            this.forceUpdate();
            return null;
          });
        }
        if (item.children) {
          this.handleSearchSource(item.children);
        }
        return null;
      });
      if (findItem.length === 0) {
        sourceData[0].displayIcon = true;
        this.sourceCom.handleToggle(sourceData[0]);
      }
      this.setState({
        findItem: [],
      });
    }
  }

  @Bind()
  handleSearchTarget(dataList) {
    const {
      target: { data: targetData },
      relation,
      findTargetItem,
      currentId,
      contentTargetId,
      searchTargetId,
    } = this.state;
    if (targetData.length !== 0) {
      const baseY = getOffset(document.getElementsByClassName('field-relation')[currentId]).top;
      const { value } = document.getElementById(searchTargetId);
      dataList.map((item) => {
        if (item.name.indexOf(value.trim()) >= 0) {
          targetData[0].displayIcon = true;
          this.targetCom.handleToggle(targetData[0]);
          this.setState({
            searchingTarget: true,
          });
          const path = item.parentPath.split('.');
          findTargetItem.push(item);
          findTargetItem.map((find) => {
            relation.map((relationItem) => {
              if (
                relationItem.target.name === find.name &&
                find.parentPath === relationItem.target.parentPath
              ) {
                new Promise((resolve) => {
                  resolve();
                }).then(() => {
                  Object.defineProperty(relationItem.target, 'y', {
                    value:
                      getOffset(
                        document.getElementsByClassName('column-content')[contentTargetId].children[
                          find.index
                        ]
                      ).top -
                      baseY +
                      17,
                    enumerable: true,
                  });
                });
              }
              return null;
            });
            this.showPath(path, targetData);
            Object.defineProperty(find, 'displayTree', { value: true, enumerable: true });
            this.forceUpdate();
            return null;
          });
        }
        if (item.children) {
          this.handleSearchTarget(item.children);
        }
        return null;
      });
      if (findTargetItem.length === 0) {
        targetData[0].displayIcon = true;
        this.targetCom.handleToggle(targetData[0]);
      }
      this.setState({
        findTargetItem: [],
      });
    }
  }

  @Bind()
  cancelSearch() {
    const {
      source: { data: sourceData },
    } = this.state;
    this.setState({
      searchingSource: false,
    });
    if (sourceData.length !== 0) {
      sourceData[0].displayIcon = true;
      this.sourceCom.handleToggle(sourceData[0]);
    }
  }

  @Bind()
  cancelSearchTarget() {
    const {
      target: { data: targetData },
    } = this.state;
    this.setState({
      searchingTarget: false,
    });
    if (targetData.length !== 0) {
      targetData[0].displayIcon = true;
      this.targetCom.handleToggle(targetData[0]);
    }
  }

  @Bind()
  handleGetDrawing(value) {
    this.setState({ drawing: value });
  }

  render() {
    const {
      relation,
      iconStatus,
      currentRelation,
      relationScript,
      aceEditorHeight,
      aceEditorWidth,
      source: { data: sourceData = [], columns: sourceCols = [], mutiple: sourceMutiple = false },
      target: { data: targetData = [], columns: targetCols = [], mutiple: targetMutiple = false },
      searchingSource,
      searchingTarget,
      currentId,
      contentId,
      contentTargetId,
      searchSourceId,
      searchTargetId,
      sourceValue,
      targetValue,
      drawing,
    } = this.state;
    const {
      className = '',
      style = {},
      isSort = false,
      onDrawStart,
      onDrawing,
      onDrawEnd,
      edit,
      closeIcon,
      arrowId,
      otherButtons = [],
    } = this.props;
    const SearchSource = () => {
      return (
        <TextField
          clearButton
          id={searchSourceId}
          value={sourceValue}
          onChange={(val) => this.setState({ sourceValue: val })}
          placeholder="搜索字段"
          onClear={this.cancelSearch}
          style={{ width: '50%', right: 10, top: 4, position: 'absolute' }}
          suffix={<Icon type="search" onClick={() => this.sourceCom.toggleDisplay(false)} />}
          onEnterDown={() => this.handleSearchSource(sourceData)}
        />
      );
    };
    const SearchTarget = () => {
      return (
        <TextField
          clearButton
          id={searchTargetId}
          value={targetValue}
          onChange={(val) => this.setState({ targetValue: val })}
          placeholder="搜索字段"
          onClear={this.cancelSearchTarget}
          style={{ width: '50%', right: 10, top: 4, position: 'absolute' }}
          suffix={
            <Icon
              type="search"
              onClick={() => this.targetCom.toggleDisplay(false)}
              onEnterDown={() => this.handleSearchTarget(targetData)}
            />
          }
        />
      );
    };
    const sourceOpt = {
      ref: (me) => {
        this.sourceCom = me;
      },
      iconStatus,
      relation,
      columns: sourceCols,
      data: sourceData,
      currentRelation,
      isSort,
      edit,
      searchingSource,
      SearchSource,
      searchSourceId,
      sourceValue,
      currentId,
      onChange: this.changeRelation.bind(this),
      contentId,
      changeData: this.changeSource.bind(this),
      overActive: this.overActive.bind(this),
    };
    const targetOpt = {
      ref: (me) => {
        this.targetCom = me;
      },
      drawing,
      iconStatus,
      relation,
      columns: targetCols,
      data: targetData,
      currentRelation,
      isSort,
      edit,
      currentId,
      contentTargetId,
      searchTargetId,
      targetValue,
      SearchTarget,
      searchingTarget,
      changeData: this.changeTarget.bind(this),
      overActive: this.overActive.bind(this),
      onNodeDoubleClick: this.handleNodeDoubleClick,
    };
    const drawLinesOpt = {
      sourceData,
      targetData,
      sourceMutiple,
      targetMutiple,
      onDrawStart,
      onDrawing,
      onDrawEnd,
      relation,
      edit,
      closeIcon,
      currentRelation,
      arrowId,
      searchingSource,
      searchingTarget,
      getRelationScript: this.handleGetRelationScript.bind(this),
      onChange: this.changeRelation.bind(this),
      changeIconStatus: this.changeIconStatus.bind(this),
      onGetDrawing: this.handleGetDrawing,
    };
    const aceEditorProps = {
      disabled: !edit,
      value: relationScript,
      width: aceEditorWidth,
      height: aceEditorHeight,
      onChange: this.handleSetScript.bind(this),
    };

    let events = [
      {
        key: 'json',
        show: true,
        title: getLang('JSON_FILE'),
        action: () => this.handleOpenFileModal(['.json']),
      },
      {
        key: 'xml',
        show: true,
        title: getLang('XML_FILE'),
        action: () => this.handleOpenFileModal(['.xml', '.html']),
      },
    ];
    events = [...events, ...otherButtons];
    return (
      <>
        {edit && (
          <div style={{ textAlign: 'right', marginBottom: '5px' }}>
            <MenuButton events={events} />
            <Button onClick={() => this.handleCancelRel()}>{getLang('CANCEL_REL')}</Button>
            <Button color="primary" onClick={() => this.handleSameNameRel()}>
              {getLang('SAME_NAME_REL')}
            </Button>
            <Button color="primary" onClick={() => this.handleSameLineRel()}>
              {getLang('SAME_LINE_REL')}
            </Button>
          </div>
        )}
        <div className="field-relation" id={currentId}>
          <div style={style} className={`react-field-mapping-box ${className}`}>
            <SourceData {...sourceOpt} />
            <DrawLines {...drawLinesOpt} />
            <TargetData {...targetOpt} />
          </div>
          <div className="relation-script">
            <Icon
              type="fullscreen"
              className="script-icon"
              onClick={() => this.openFullSrceen(aceEditorProps)}
            />
            <AceEditor {...aceEditorProps} />
          </div>
          <h3>
            <QuestionPopover
              message={
                <>
                  {getLang('DW_SCRIPT_TIP')}(
                  <a
                    href="https://docs.mulesoft.com/mule-runtime/4.3/dataweave-language-guide"
                    // eslint-disable-next-line react/jsx-no-target-blank
                    target="_blank"
                  >
                    https://docs.mulesoft.com/mule-runtime/4.3/dataweave-language-guide
                  </a>
                  )
                </>
              }
            />
          </h3>
        </div>
      </>
    );
  }
}
export default FieldMapping;
