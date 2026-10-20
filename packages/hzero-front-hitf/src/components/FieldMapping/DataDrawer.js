import React from 'react';
import { Form, DataSet, CodeArea } from 'choerodon-ui/pro';
// 引入格式化器
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
// 引入 json lint
import 'choerodon-ui/pro/lib/code-area/lint/json';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/addon/hint/xml-hint.js';
import 'codemirror/addon/hint/show-hint.js';
import CodeMirror from 'codemirror';
import { Bind } from 'lodash-decorators';
import getLang from '@/langs/commonLang';

class DataDrawer extends React.Component {
  constructor(props) {
    super(props);
    const fieldDataDrawerDS = () => {
      return {
        autoQuery: false,
        autoCreate: false,
        selection: false,
        paging: false,
        fields: [
          {
            name: 'inputData',
            type: 'string',
            required: true,
          },
        ],
      };
    };
    this.fieldDataDrawerDS = new DataSet(fieldDataDrawerDS());
    props.onRef(this);
  }

  componentDidMount() {
    const { data } = this.props;
    this.fieldDataDrawerDS.create({ inputData: data });
  }

  @Bind()
  async handleOk() {
    const validate = await this.fieldDataDrawerDS.validate();
    if (!validate) {
      return undefined;
    }
    const { inputData } = this.fieldDataDrawerDS.current.toData();
    return inputData;
  }

  @Bind()
  completeAfter(cm, pred) {
    // const cur = cm.getCursor();
    if (!pred || pred()) {
      setTimeout(() => {
        if (!cm.state.completionActive) {
          cm.showHint({ completeSingle: false });
        }
      }, 100);
    }
    return CodeMirror.Pass;
  }

  @Bind()
  completeIfAfterLt(cm) {
    return this.completeAfter(cm, () => {
      const cur = cm.getCursor();
      return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) === '<';
    });
  }

  @Bind()
  completeIfInTag(cm) {
    return this.completeAfter(cm, () => {
      const tok = cm.getTokenAt(cm.getCursor());
      if (
        tok.type === 'string' &&
        (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length === 1)
      )
        return false;
      const inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
      return inner.tagName;
    });
  }

  render() {
    const { dataType } = this.props;
    const dummy = {
      attrs: {
        color: ['red', 'green', 'blue', 'purple', 'white', 'black', 'yellow'],
        size: ['large', 'medium', 'small'],
        description: null,
      },
      children: [],
    };

    return (
      <Form
        dataSet={this.fieldDataDrawerDS}
        header={`${getLang('DATA_TYPE')}：${dataType === 'SOAP' ? 'xml' : 'json'}`}
      >
        <CodeArea
          name="inputData"
          style={{
            height: document.querySelector('body').offsetHeight - 240,
          }}
          formatter={dataType === 'REST' ? JSONFormatter : null}
          options={{
            mode: dataType === 'REST' ? { name: 'javascript', json: true } : 'xml',
            extraKeys: dataType === 'SOAP' && {
              "'<'": this.completeAfter,
              "'/'": this.completeIfAfterLt,
              "' '": this.completeIfInTag,
              "'='": this.completeIfInTag,
              'Ctrl-Space': 'autocomplete',
            },
            hintOptions: dataType === 'SOAP' && {
              schemaInfo: {
                '!top': ['top'],
                '!attrs': {
                  id: null,
                  class: ['A', 'B', 'C'],
                },
                top: {
                  attrs: {
                    lang: ['en', 'de', 'fr', 'nl'],
                    freeform: null,
                  },
                  children: ['animal', 'plant'],
                },
                animal: {
                  attrs: {
                    name: null,
                    isduck: ['yes', 'no'],
                  },
                  children: ['wings', 'feet', 'body', 'head', 'tail'],
                },
                plant: {
                  attrs: { name: null },
                  children: ['leaves', 'stem', 'flowers'],
                },
                wings: dummy,
                feet: dummy,
                body: dummy,
                head: dummy,
                tail: dummy,
                leaves: dummy,
                stem: dummy,
                flowers: dummy,
              },
            },
          }}
        />
      </Form>
    );
  }
}
export default DataDrawer;
