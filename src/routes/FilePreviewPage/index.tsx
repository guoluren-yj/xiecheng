/* eslint-disable react/jsx-filename-extension */
import React, { useMemo } from "react";
import Viewer from 'react-viewer';
import 'react-viewer/dist/index.css';

export default function FilePreview() {
  const url = useMemo(()=>{
    if(!window.location.search)return "";
    const matchUrl = window.location.search.match(/[?&]url=([^&]*)/);
    if(matchUrl)return matchUrl[1];
    return "";
  }, [window.location.search]);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Viewer
        noImgDetails
        noNavbar
        noClose
        scalable={false}
        changeable={false}
        visible
        images={[{src: decodeURIComponent(url), alt: ""}]}
      />
    </div>
  );
}