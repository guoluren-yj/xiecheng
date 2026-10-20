import React, { PureComponent } from 'react';
import { DataSet, CodeArea, Button, Form, Spin } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import 'choerodon-ui/pro/lib/code-area/lint/json';
import 'codemirror/mode/javascript/javascript';
import { formDS } from '@/stores/TraceLogs/TraceLogDetailDS';
import { retryFormDS } from '@/stores/TraceLogs/TraceLogDS';
import getLang from '@/langs/traceLogsLang';

export default class RetryModal extends PureComponent {
  constructor(props) {
    super(props);
    this.formDS = new DataSet(formDS());
    this.retryFormDS = new DataSet(retryFormDS());
  }

  componentDidMount() {
    this.props.modal.update({
      onOk: this.handleRetry,
    });
    this.handleFetchDetail();
  }

  async handleFetchDetail() {
    const { traceLogId } = this.props;
    this.formDS.setQueryParameter('traceLogId', traceLogId);
    const res = await this.formDS.query();
    if (res) {
      const { traceLogDtl = {} } = res;
      const { reqBodyParam = '{}' } = traceLogDtl;
      this.retryFormDS.current.set('traceLogId', traceLogId);
      this.retryFormDS.current.set(
        'reqBodyParam',
        JSON.stringify(JSON.parse(reqBodyParam), null, 4)
      );
    }
  }

  @Bind
  handleRetry() {
    const { traceLogTreeDS, traceLogListDS, tabKey } = this.props;
    const validate = this.retryFormDS.validate();
    if (!validate) {
      return false;
    }
    return this.retryFormDS.submit().then((res) => {
      if (res) {
        if (tabKey === 'tree') {
          traceLogTreeDS.query();
        } else {
          traceLogListDS.query();
        }
      }
    });
  }

  @Bind()
  formatJson() {
    const reqBodyParam = this.retryFormDS.current.get('reqBodyParam');
    if (reqBodyParam) {
      const jsonObj = JSON.parse(reqBodyParam);
      this.retryFormDS.current.set('reqBodyParam', JSON.stringify(jsonObj, null, 4));
    }
  }

  render() {
    const options = {
      mode: { name: 'javascript', json: true },
      lineNumbers: false,
      lineWrapping: true,
    };
    return (
      <Spin dataSet={this.formDS}>
        <Button color="primary" onClick={this.formatJson}>
          {getLang('JSON_PARSE')}
        </Button>
        <Form dataSet={this.retryFormDS}>
          <CodeArea
            name="reqBodyParam"
            style={{ height: 300 }}
            formatter={JSONFormatter}
            options={options}
          />
        </Form>
      </Spin>
    );
  }
}
