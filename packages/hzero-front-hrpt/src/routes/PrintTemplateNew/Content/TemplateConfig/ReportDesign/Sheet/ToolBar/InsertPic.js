import React, { useRef, useCallback } from 'react';
import classnames from 'classnames';
import notification from 'hzero-front/lib/utils/notification';
import FloatPicSvg from '@/assets/sheet/floatPic.svg';
import CellPicSvg from '@/assets/sheet/cellPic.svg';

import intl from 'utils/intl';

import styles from '../../index.less';
import { compressImage } from '../../utils/utils';

export default function InsertPic({ sheetRef, item, isCell, disabled }) {
  const { title } = item;
  const inputRef = useRef();

  const handleClick = useCallback(() => {
    inputRef.current.click();
  }, []);

  const handleChange = useCallback(
    (e) => {
      const files = e.currentTarget.files;
      if (!files || !files.length) {
        return;
      }
      if (files && files[0] && !/.jpg$/.test((files[0].name || "").toLowerCase()) && !/.png$/.test((files[0].name || "").toLowerCase())) {
        notification.error({ message: intl.get("hrpt.reportDesign.validate.picLimitJpgOrPng").d("仅支持上传jpg和png格式图片") });
        return;
      }
      compressImage(files[0]).then(({ file, width, height }) => {
        sheetRef.current.insertImage(file, { isCell, scale: width / height });
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      });
    },
    [calculateImageSize]
  );

  const calculateImageSize = useCallback((img) => {
    return new Promise((resolve, reject) => {
      img.onload = (e) => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.onError = () => {
        reject();
      };
    });
  }, []);

  return (
    <div
      className={classnames(styles['sheet-toolbar-insert-pic'], {
        [styles['sheet-toolbar-diabled']]: disabled,
      })}
      onClick={handleClick}
      disabled={disabled}
    >
      <img src={isCell ? CellPicSvg : FloatPicSvg} />
      <span>{title}</span>
      <input ref={inputRef} type="file" accept="image/jpeg, image/png" style={{ display: 'none' }} onChange={handleChange} />
    </div>
  );
}
