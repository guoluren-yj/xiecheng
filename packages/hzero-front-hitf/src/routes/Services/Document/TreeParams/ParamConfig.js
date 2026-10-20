/**
 * @author fengwanjun<wanjun.feng@hand-china.com>
 * @creationDate 2021/1/18
 * @copyright HAND ® 2021
 */
import React from 'react';
import { CodeArea } from 'choerodon-ui/pro';
import { Modal } from 'hzero-ui';
import notification from 'hzero-front/lib/utils/notification';
import { Bind } from 'lodash-decorators';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import HTMLFormatter from 'choerodon-ui/pro/lib/code-area/formatters/HTMLFormatter';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import getLang from '@/langs/serviceLang';
import X2JS from 'xml-json-parser';
import xmlFormat from 'xml-formatter';
import { parseString } from 'xml2js';

const X2js = new X2JS();

@formatterCollections({ code: ['hzero.common', getLang('PERFIX')] })
export default class ImportMappingConfig extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...props,
      paramConfig: '',
      formatter: JSONFormatter,
      mode: { name: 'javascript', json: true },
    };
  }

  componentDidMount() {
    this.init();
  }

  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      ...nextProps,
    });
    this.init();
  }

  /**
   * 获取文本域的对象数据
   * @param {*} dataSource
   */
  @Bind()
  getShowObjData(dataSource) {
    let config = null;
    if (dataSource) {
      dataSource.map((item) => {
        const { paramName, paramValueType, valueDemo, children } = item;
        switch (paramValueType) {
          case 'ARRAY':
            config = {
              ...config,
              [paramName]: this.getShowArrData(children),
            };
            break;
          case 'OBJECT':
            config = {
              ...config,
              [paramName]: this.getShowObjData(children),
            };
            break;
          default:
            config = {
              ...config,
              [paramName]: valueDemo,
            };
            break;
        }
        return config;
      });
    }
    return config;
  }

  /**
   * 获取文本域的数组数据
   * @param {*} dataSource
   */
  @Bind()
  getShowArrData(dataSource) {
    const config = [];
    if (dataSource) {
      dataSource.map((item) => {
        const { paramName, paramValueType, valueDemo, children } = item;
        switch (paramValueType) {
          case 'ARRAY':
            config.push({
              [paramName]: this.getShowArrData(children),
            });
            break;
          case 'OBJECT':
            config.push({
              [paramName]: this.getShowObjData(children),
            });
            break;
          default:
            config.push({
              [paramName]: valueDemo,
            });
            break;
        }
        return config;
      });
    }
    return config;
  }

  /**
   * 初始化数据
   */
  @Bind()
  init() {
    const { mimeType, rootType, dataSource } = this.state;
    let paramConfig;
    // 根据JSON根类型判断是对象还是数组对象
    switch (rootType) {
      case 'array':
        paramConfig = [this.getShowObjData(dataSource)];
        break;
      case 'object':
        paramConfig = this.getShowObjData(dataSource);
        break;
      default:
        paramConfig = this.getShowObjData(dataSource);
        break;
    }
    let formatter;
    let mode;
    if (paramConfig) {
      switch (mimeType) {
        case 'application/json':
          try {
            paramConfig = JSON.stringify(paramConfig, null, 4);
          } catch (e) {
            notification.error({
              message: getLang('JSON_FORMATTER'),
            });
            return;
          }
          formatter = JSONFormatter;
          mode = { name: 'javascript', json: true };
          break;
        case 'text/xml':
          try {
            paramConfig = xmlFormat(X2js.json2xml_str(paramConfig), { collapseContent: true });
          } catch (e) {
            notification.error({
              message: getLang('XML_FORMATTER'),
            });
            return;
          }
          formatter = HTMLFormatter;
          mode = 'xml';
          break;
        default:
          break;
      }
    }
    this.setState({
      paramConfig,
      formatter,
      mode,
    });
  }

  /**
   * 渲染标题
   */
  @Bind()
  renderTitle() {
    const { actionType } = this.state;
    let title;
    switch (actionType) {
      case 'REQ':
        title = getLang('REQ_CONFIG');
        break;
      case 'RESP':
        title = getLang('RES_CONFIG');
        break;
      default:
        break;
    }
    return title;
  }

  /**
   * 关闭侧滑
   */
  @Bind()
  handleClose() {
    const { onCancel } = this.props;
    onCancel();
  }

  /**
   * 保存参数配置
   */
  @Bind()
  handleOk() {
    const { paramConfig, actionType, mimeType, onSave, onCancel } = this.state;
    const saveData = paramConfig;
    if (!paramConfig) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    switch (mimeType) {
      case 'application/json':
        try {
          JSON.parse(saveData);
        } catch (e) {
          notification.error({
            message: getLang('JSON_FORMATTER'),
          });
          return;
        }
        onSave(saveData, actionType, onCancel);
        break;
      case 'text/xml':
        parseString(saveData, (err) => {
          if (err) {
            notification.error({
              message: getLang('XML_FORMATTER'),
            });
            return;
          }
          onSave(saveData, actionType, onCancel);
        });
        break;
      default:
        break;
    }
  }

  render() {
    const { visible, paramConfig, formatter, mode } = this.state;
    return (
      <Modal
        destroyOnClose
        title={this.renderTitle()}
        visible={visible}
        onCancel={this.handleClose}
        onOk={this.handleOk}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
      >
        <CodeArea
          style={{ height: 'calc(100vh - 150px)', marginTop: 10, width: '100%' }}
          value={paramConfig}
          formatter={formatter}
          options={{
            mode,
            lineWrapping: true,
            styleActiveLine: true,
          }}
          onChange={(value) => {
            this.setState({ paramConfig: value });
          }}
        />
      </Modal>
    );
  }
}
