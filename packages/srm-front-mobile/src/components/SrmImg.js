import React, { PureComponent } from 'react';
import image from '../assets/img_error.png';
import { buildFileUrl } from '@/utils/utils';

export default class SrmImg extends PureComponent {
  render() {
    const { src } = this.props;
    const url = src ? buildFileUrl(src) : image;
    return (
      <>
        <img
          height={30}
          src={url}
          alt=""
          onError={() => {
            this.props.src = undefined;
            this.forceUpdate();
          }}
        />
      </>
    );
  }
}
