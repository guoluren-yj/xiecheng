import React, { useEffect, useImperativeHandle, useState } from 'react';
import Viewer from 'react-viewer';
import 'react-viewer/dist/index.css';

import FloatPicSvg from '@/assets/sheet/floatPic.svg';


export default function ImageViewer({
  imageViewerRef
}) {

  const [visible, setVisible] = useState(false);
  const [imgData, setImgData] = useState([]);

  useImperativeHandle(imageViewerRef, () => ({
    handleShow,
  }))

  const handleShow = (data) => {
    setImgData(data);
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  }

  return (
    <Viewer
      visible={visible}
      onClose={handleClose}
      drag={false}
      noImgDetails
      noNavbar
      scalable={false}
      changeable={false}
      images={imgData}
    />
  )
}