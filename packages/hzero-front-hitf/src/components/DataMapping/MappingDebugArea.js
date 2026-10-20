/**
 * @author fengwanjun<wanjun.feng@hand-china.com>
 * @creationDate 2021/1/18
 * @copyright HAND ® 2021
 */
import React from 'react';
import { CodeArea, Spin, Button, Modal } from 'choerodon-ui/pro';
import notification from 'hzero-front/lib/utils/notification';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import { SERVICE_CONSTANT } from '@/constants/constants';
import getLang from '@/langs/mappingDebugLang';
import LogArea from '@/components/LogArea';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import YAMLFormatter from 'choerodon-ui/pro/lib/code-area/formatters/YAMLFormatter';
import XmlFormatter from '@/components/XmlFormatter';
import './styles.css';
import styles from './index.less';

@formatterCollections({ code: ['hzero.common', getLang('PERFIX')] })
export default class MappingDebugArea extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...props,
      mappingType: props.mappingType || SERVICE_CONSTANT.REST,
    };
  }

  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      ...nextProps,
      mappingType: nextProps.mappingType || SERVICE_CONSTANT.REST,
    });
  }

  /**
   * 数据格式化
   * @param {*} sourceContent
   */
  @Bind()
  transformData(sourceContent) {
    const { mappingType } = this.state;

    if (!sourceContent) {
      notification.error({
        message: getLang('SOURCE_DATA_REQUIRED'),
      });
      return false;
    }

    if (mappingType === SERVICE_CONSTANT.REST) {
      try {
        this.setState({
          sourceContent: JSON.stringify(JSON.parse(`${sourceContent} `), null, 4),
        });
      } catch (e) {
        notification.error({
          message: getLang('JSON_FORMATTER'),
        });
        return false;
      }
    } else {
      try {
        this.setState({
          sourceContent: XmlFormatter(sourceContent),
        });
      } catch (e) {
        notification.error({
          message: getLang('XML_FORMATTER'),
        });
        return false;
      }
    }
    return true;
  }

  /**
   * 调试
   */
  @Bind()
  handleDataDebugExecute() {
    const { sourceContent, onDebugExecute } = this.state;
    if (sourceContent) {
      const trans = this.transformData(sourceContent);
      if (!trans) {
        return false;
      }
    }
    onDebugExecute(sourceContent);
  }

  /**
   * 流程调试
   */
  @Bind()
  handleFlowDebugExecute() {
    const { sourceContent, onFlowDebugExecute } = this.state;
    if (sourceContent) {
      const trans = this.transformData(sourceContent);
      if (!trans) {
        return false;
      }
    }
    onFlowDebugExecute(sourceContent);
  }

  @Bind()
  openLogAreaDrawer() {
    const { mappingTraceContent } = this.props;
    const logAreaProps = {
      content: mappingTraceContent,
    };
    Modal.open({
      title: getLang('DEBUG_LOG'),
      drawer: true,
      style: { width: 1000 },
      children: <LogArea {...logAreaProps} />,
      okText: getLang('CLOSE'),
      footer: (okBtn) => okBtn,
    });
  }

  render() {
    const { mappingType, sourceContent, targetContent, debugLoading } = this.state;
    return (
      <Spin spinning={debugLoading}>
        <div style={{ float: 'right', marginBottom: '5px' }}>
          <Button onClick={() => this.openLogAreaDrawer()}>{getLang('DEBUG_LOG')}</Button>
          <Button onClick={() => this.transformData(sourceContent)}>{getLang('FORMATTER')}</Button>
          <Button color="primary" onClick={() => this.handleDataDebugExecute()}>
            {getLang('DEBUG')}
          </Button>
          <Button color="primary" onClick={() => this.handleFlowDebugExecute()}>
            {getLang('FLOW_DEBUG')}
          </Button>
        </div>
        <div style={{ clear: 'both' }} />
        <ReflexContainer windowResizeAware orientation="vertical" style={{ height: '600px' }}>
          <ReflexElement minSize={200} className="left-pane" style={{ overflow: 'hidden' }}>
            <div className="pane-content">
              <span style={{ lineHeight: '28px' }}>{getLang('SOURCE_DATA')}:</span>
              <CodeArea
                style={{ height: '580px' }}
                className={styles['left-code-area']}
                value={sourceContent}
                onChange={(value) => this.setState({ sourceContent: value })}
                formatter={mappingType === SERVICE_CONSTANT.REST ? JSONFormatter : YAMLFormatter}
                options={{
                  mode:
                    mappingType === SERVICE_CONSTANT.REST
                      ? { name: 'javascript', json: true }
                      : 'yaml',
                  lineWrapping: true,
                  styleActiveLine: true,
                }}
              />
            </div>
          </ReflexElement>

          <ReflexSplitter />

          <ReflexElement minSize={200} className="right-pane" style={{ overflow: 'hidden' }}>
            <div className="pane-content">
              <span style={{ lineHeight: '28px' }}>{getLang('RESULT_DATA')}:</span>
              <CodeArea
                readOnly
                style={{ height: '580px' }}
                className={styles['right-code-area']}
                value={
                  targetContent &&
                  (mappingType === SERVICE_CONSTANT.REST
                    ? JSON.stringify(JSON.parse(targetContent || ''), null, 4)
                    : XmlFormatter(targetContent))
                }
                formatter={mappingType === SERVICE_CONSTANT.REST ? JSONFormatter : YAMLFormatter}
                options={{
                  mode:
                    mappingType === SERVICE_CONSTANT.REST
                      ? { name: 'javascript', json: true }
                      : 'yaml',
                  lineWrapping: true,
                  styleActiveLine: true,
                }}
              />
            </div>
          </ReflexElement>
        </ReflexContainer>
      </Spin>
    );
  }
}
