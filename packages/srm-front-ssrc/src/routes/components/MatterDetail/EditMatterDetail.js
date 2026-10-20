import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';

// import TinymceEditor from 'components/TinymceEditor';
import RichTextEditor from 'components/RichTextEditor';
import { PRIVATE_BUCKET } from '_utils/config';

import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

export default class EditMatterDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // eslint-disable-next-line react/no-unused-state
      matterDetail: '',
      // eslint-disable-next-line react/no-unused-state
      changeFlag: false,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
  }

  /**
   * 监听富文本编辑
   * @param {object} dataSource - 编辑的数据
   */
  @Bind()
  onRichTextEditorChange() {
    const { callback = () => {} } = this.props;
    const matterContent = this.richTextEditor?.getContent();
    this.setState({
      // eslint-disable-next-line react/no-unused-state
      matterDetail: matterContent,
      // eslint-disable-next-line react/no-unused-state
      changeFlag: true,
    });

    callback(matterContent);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { matterDetail } = this.props;
    const staticTextProps = {
      content: matterDetail,
      data: matterDetail,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-common',
      privateBucket: true,
      onEditorChange: this.onRichTextEditorChange,
      fileSize: FIlESIZE,
      ...ChunkUploadProps
    };
    return (
      <React.Fragment>
        <div>
          {matterDetail !== undefined && (
            <RichTextEditor
              {...staticTextProps}
              ref={(node) => {
                this.richTextEditor = node;
              }}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}
