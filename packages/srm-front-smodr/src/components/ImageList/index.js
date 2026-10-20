import React from 'react';
import defaultImg from '@/assets/sku_default.svg';
import useSetState from '@/hooks/useState';

import ImageViewer from '../ImageViewer';

export default function ImageList(props) {
  const {
    style = {},
    className = '',
    width,
    height,
    value,
    // id = '',
    alt = '',
    // title = '',
    list = [],
    ...OtherProps
  } = props;
  style.width = width;
  style.height = height;

  const [preview, setPreview] = useSetState({
    fileList: props.list,
    index: 0,
    visible: false,
  });

  // useEffect(() => {
  //   setSrc(value || defaultImg);
  // }, [value]);

  // const [src, setSrc] = useState(value || defaultImg);

  return (
    <>
      {list.map((i, index) => (
        <img
          src={i.fileUrl || defaultImg}
          style={{ ...style, display: 'inline-block', cursor: 'pointer' }}
          alt={alt}
          title={i?.title}
          className={`imagePath ${className}`}
          onClick={() => setPreview({ visible: true, index })}
          // onError={() => setSrc(defaultImg)}
          {...OtherProps}
        />
      ))}
      {preview.visible && (
        <ImageViewer
          closeModal={() => {
            setPreview({ visible: false });
          }}
          imgList={preview.fileList}
          index={preview.index}
        />
      )}
    </>
  );
}
