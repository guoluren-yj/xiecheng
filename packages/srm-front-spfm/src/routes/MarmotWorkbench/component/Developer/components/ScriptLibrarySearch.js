/**
 * ScriptLibrarySearch.js
 * 脚本库搜索
 * @date: 2021-01-13
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import crypto from 'crypto-js';
import { isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import withProps from 'utils/withProps';
import { getComplementaryWordsService } from '@/services/adaptorTaskService';
import MarmotScriptButton from '@/components/MarmotScript/MarmotScriptButton';
import { getScriptLibrarySearchDs } from '../store/ScriptLibrarySearchDs';

@formatterCollections({
  code: ['spfm.scriptLibrarySearch'],
})
@withProps(
  () => {
    const scriptLibrarySearchDs = new DataSet(getScriptLibrarySearchDs());
    return {
      scriptLibrarySearchDs,
    };
  },
  { cacheState: true }
)
export default class ScriptLibrarySearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      complementaryWords: [],
    };
    this.scriptLibrarySearchDs = this.props.scriptLibrarySearchDs;
  }

  componentDidMount() {
    getComplementaryWordsService().then((res) => {
      if (getResponse(res)) {
        // 自定义的代码提示
        if (!isEmpty(res)) {
          this.setState({
            complementaryWords: crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(res)),
          });
        }
      }
    });
  }

  render() {
    const columns = [
      {
        name: 'tenantName',
        width: 260,
      },
      {
        name: 'code',
        width: 300,
      },
      {
        name: 'description',
        minWidth: 300,
      },
      {
        name: 'permission',
        width: 120,
      },
      {
        name: 'quickType',
        width: 120,
      },
      {
        name: 'creatorName',
        width: 80,
        lock: 'right',
      },
      {
        name: 'content',
        width: 120,
        lock: 'right',
        renderer: ({ record }) => {
          const { code, contentInput } = record.get(['code', 'contentInput']);
          const saveScriptValue = record.get('id') ? `${code}|${record.get('id')}` : undefined;
          const debugTenantNum = record.get('tenantNum');
          return (
            <>
              <MarmotScriptButton
                name="content"
                scriptCacheKey="adaptorMonitor|MarmotScript"
                complementaryWords={this.state.complementaryWords}
                marmotScriptInput={contentInput}
                record={record}
                testParam={{
                  saveScriptKey: saveScriptValue,
                  debugTenantNum,
                }}
                disabled
              />
            </>
          );
        },
      },
    ];
    return (
      <>
        <Header
          title={intl
            .get('spfm.scriptLibrarySearch.view.title.scriptLibrarySearch')
            .d('独立脚本全览')}
        />
        <Content>
          <Table
            dataSet={this.scriptLibrarySearchDs}
            columns={columns}
            queryBarProps={{ defaultShowMore: true }}
          />
        </Content>
      </>
    );
  }
}
