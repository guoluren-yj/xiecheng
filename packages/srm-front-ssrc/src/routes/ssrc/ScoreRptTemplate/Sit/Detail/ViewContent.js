import React from 'react';
import queryString from 'querystring';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import EditorOnline from '@/routes/components/EditorOnline';

@formatterCollections({
  code: ['ssrc.scoreRptTemplate'],
})
export default class ViewContent extends React.Component {
  render() {
    const {
      match: { params },
      location: { search },
    } = this.props;
    const { templateId } = params || {};
    const { lang, viewOnly } = queryString.parse(search.substr(1));
    return (
      <React.Fragment>
        <Header
          backPath={`/ssrc/scoreRptTemplate-site/detail?templateId=${templateId}&viewOnly=${viewOnly}`}
          title={intl
            .get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.viewContent`)
            .d('文档内容查看')}
        />
        <Content>
          <EditorOnline
            iframeStyle={{
              width: '100%',
              height: `${document.body.clientHeight}px`,
            }}
            lang={lang}
            templateId={templateId}
            // onRef={(node) => {
            //   this.editorOnlineRef = node;
            // }}
          />
        </Content>
      </React.Fragment>
    );
  }
}
