import React, { useEffect, useRef, useCallback, useState } from 'react';
// import Swiper from 'swiper';
import intl from 'utils/intl';
import Image from '@/components/Image';
import ImageViewer from '@/components/ImageViewer';
// import Icons from '@/components/Icons';
import styles from './index.less';

function useSetState(initialState = {}) {
  const [state, set] = useState(initialState);
  const isUpdate = useRef();
  const setState = useCallback(
    (nextState, callback) => {
      if (typeof callback === 'function') {
        isUpdate.current = callback;
      }
      if (typeof nextState === 'function') {
        set((prevState) => ({ ...prevState, ...nextState(prevState) }));
      } else {
        set((prevState) => ({ ...prevState, ...nextState }));
      }
    },
    [set]
  );

  useEffect(() => {
    if (isUpdate.current) {
      isUpdate.current(state);
    }
  }, [state]);

  return [state, setState];
}

export default function ImageList(props) {
  const { imageDTO = [] } = props;
  // const needBtn = imageDTO?.length > 3;
  // const needBtn = false;
  const [preview, setPreview] = useSetState({ visible: false, index: 0, fileList: [] });

  // useEffect(() => {
  //   const s = new Swiper(`#comment-${productAssessmentId}`, {
  //     prevButton: `.image-prev-${productAssessmentId}`,
  //     nextButton: `.image-next-${productAssessmentId}`,
  //     slidesPerView: 3,
  //     slidesPerGroup: 3,
  //     width: 222,
  //     direction: 'horizontal',
  //     spaceBetween: 10,
  //   });
  //   return () => {
  //     s.destroy();
  //   };
  // }, [productAssessmentId]);

  return (
    <div className={styles['imgs-wrapper']}>
      {imageDTO?.map((i, index) => (
        <div className="img-content">
          <Image value={i.fileUrl} width={64} height={64} />
          <div className="cover">
            <p>
              {index + 1} {intl.get('smpc.product.view.picture').d('图')}
            </p>
            <p
              onClick={() => {
                setPreview({ visible: true, index, fileList: imageDTO });
              }}
            >
              {intl.get('smpc.product.view.look.all').d('查看全部')}
            </p>
          </div>
        </div>
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
    </div>
  );
}
