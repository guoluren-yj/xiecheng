import React, { PureComponent } from 'react';
import { DataSet, Select, Spin } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isString } from 'lodash';
import * as ClipBoard from 'clipboard-polyfill/text';
import notification from 'hzero-front/lib/utils/notification';
import intl from 'hzero-front/lib/utils/intl';
import ReactAceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/theme-tomorrow';
import { requestPayloadDS, readRequestPayloadDS } from '@/stores/Services/invokeAddrDS';

export default class MappingDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.requestPayloadDS = new DataSet({
      ...requestPayloadDS(),
    });
    this.readRequestPayloadDS = new DataSet({
      ...readRequestPayloadDS(),
    });
    this.state = {
      requestPayload: '',
      isXml: false,
    };
  }

  componentDidMount() {
    this.props.modal.update({
      footer: (okBtn) => okBtn,
      onOk: this.copyRequestPayload,
    });
    this.fetchRequestPayload();
  }

  async fetchRequestPayload() {
    const { record } = this.props;
    const { interfaceId } = record;
    const { invokeVersion = 'v1', requestMethod = 'GET' } = this.requestPayloadDS.current.toData();
    const requestParams = {
      interfaceId,
      invokeVersion,
      requestMethod,
    };
    this.readRequestPayloadDS.setQueryParameter('requestParams', requestParams);
    const result = await this.readRequestPayloadDS.query();
    const requestPayload = isString(result) ? result : JSON.stringify(result, null, 4);
    this.requestPayloadDS.current.set('requestPayload', requestPayload);
    // 简单判断string类型为XML结构
    this.setState({ requestPayload, isXml: isString(result) });
  }

  @Bind()
  copyRequestPayload() {
    const validate = this.requestPayloadDS.validate();
    if (validate) {
      ClipBoard.writeText(this.requestPayloadDS.current.get('requestPayload')).then(
        // eslint-disable-next-line func-names
        function () {
          notification.success({
            message: intl.get('hitf.services.model.services.copySuccess').d('复制成功'),
          });
        }
      );
    }
    return false;
  }

  render() {
    const { requestPayload, isXml } = this.state;
    return (
      <Spin dataSet={this.readRequestPayloadDS}>
        <Select
          dataSet={this.requestPayloadDS}
          name="invokeVersion"
          clearButton={false}
          style={{ position: 'absolute', top: '0px', right: '0px', zIndex: 100, width: '60px' }}
          onChange={(val) => this.fetchRequestPayload(val)}
        />
        <Select
          dataSet={this.requestPayloadDS}
          name="requestMethod"
          clearButton={false}
          style={{ position: 'absolute', top: '0px', right: '60px', zIndex: 100, width: '80px' }}
          onChange={(val) => this.fetchRequestPayload(val)}
        />
        <ReactAceEditor
          readOnly
          mode={isXml ? 'xml' : 'json'}
          theme="tomorrow"
          name="request_payload"
          fontSize={12}
          showPrintMargin={false}
          showGutter
          highlightActiveLine // 突出活动线
          enableSnippets // 启用代码段
          value={requestPayload}
          width="100%"
          style={{ border: '1px solid #e8e8e8' }}
          splits={1}
          orientation="below"
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </Spin>
    );
  }
}
