/* eslint-disable no-await-in-loop */
import React, { useEffect, useRef, CSSProperties, useState } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { config as WebOfficeConfig } from './web-office-sdk';

import { WPSReadOnlyConfig, WPSEditConfig } from './config';

type Permission = {
  download: boolean; // 下载权限
  print: boolean; // 打印权限
}

interface IProps {
  id?: string; // dom id
  className?: string; // dom class
  style?: CSSProperties; // dom style
  beforeLoad?: (jssdk: any) => void; // wps.ready之前回调
  afterLoad?: (jssdk: any) => void; // wps.ready之后回调
  config?: any; // wps初始化配置
  url: string; // wps地址
  onRef?: (jssdk: any) => void; // ref引用
  readOnly?: boolean; // 是否预览只读，true-是
  fileId?: string; // 下载文件id
  fileToken?: string; // 下载文件token
  showUpload?: boolean; // 是否显示下载按钮, true-是
  permission: Permission,
}

function OnlineWord(props: IProps) {
  const { id, className, style, beforeLoad, afterLoad, config, url, onRef, readOnly, fileId, fileToken, showUpload, permission } = props;
  const { download = false, print = false } = permission || {};
  const editorRef = useRef<any>(null);
  const jssdk = useRef<any>();
  const [fileType, setFileType] = useState();

  useEffect(() => {
    initWPSOffice();
    if (onRef) {
      onRef({
        jssdk: jssdk.current,
      });
    }
    return () => {
      jssdk.current!.ApiEvent.RemoveApiEventListener("fileOpen", handleFileOpen);
      // jssdk.current!.ApiEvent.RemoveApiEventListener("fileStatus", setContentControlStatus);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (jssdk.current!.Application && fileType) {
        initCommands(fileType, jssdk.current!.Application);
        clearInterval(timer);
      }
    }, 100);
  }, [fileType]);

  const initWPSOffice = async() => {
    const preConfig = readOnly ? WPSReadOnlyConfig : WPSEditConfig;
    preConfig.commandBars = [
      ...preConfig.commandBars,
      {
        cmbId: 'TabPrintPreview',
        attributes: {
          visible: print, // 隐藏打印
        },
      },
    ];
    let customConfig = config || {};
    if (customConfig.commandBars) {
      preConfig.commandBars = [
        ...preConfig.commandBars,
        ...customConfig.commandBars,
      ];
      delete customConfig.commandBars;
    }
    jssdk.current = WebOfficeConfig({
      url,
      mount: editorRef.current,
      ...preConfig,
      ...customConfig,
    });
    if (!jssdk.current) {
      return;
    }
    if (beforeLoad) {
      await beforeLoad(jssdk.current);
    }
    jssdk.current!.ApiEvent.AddApiEventListener("fileOpen", handleFileOpen);
    await jssdk.current.ready();
    if (afterLoad) {
      await afterLoad(jssdk.current);
    }
    // 预览模式下添加下载按钮 或 自行控制
    if (showUpload !== undefined ? showUpload : download) {
      await addDownloadControl();
    }
    // 监听选取变化事件
    const iframe = await jssdk.current.iframe;
    iframe.style.width = '100%';
  };

  const initCommands = async(type, app) => {
    const isPDF = type === 'f';
    if (isPDF) {
      if (readOnly) {
        const TabAnnoTab = await app.CommandBars('TabAnnoTab');
        TabAnnoTab.Visible = false;
      }
      return;
    }
    if (readOnly) {
      const TabToolsTab = await app.CommandBars('TabToolsTab');
      TabToolsTab.Visible = false;
      const TabInsertTab = await app.CommandBars('TabInsertTab');
      TabInsertTab.Visible = false;
      const TabReviewWord = await app.CommandBars('TabReviewWord');
      TabReviewWord.Visible = false;
      const TabPageTab = await app.CommandBars('TabPageTab');
      TabPageTab.Visible = false;
    }
    // 更新自定义控件的启用/禁用状态
    // jssdk.current!.ApiEvent.AddApiEventListener("fileStatus", setContentControlStatus);
    await addCustomControl();
    await lineControl();
  };

  const handleFileOpen = async(data) => {
    if (!data.success) {
      return; 
    }
    const fileType = data.fileInfo && data.fileInfo.officeType;
    setFileType(fileType);
  };

  const addDownloadControl = async() => {
    // 定制元素对象【开始 Tab】
    const controls = await jssdk.current.Application.CommandBars('StartTab').Controls;
    // 新增按钮型定制元素
    const controlButton = await controls.Add(1);
    controlButton.Picture = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiPjxwYXRoIGQ9Ik01MDUuNyA2NjFhOCA4IDAgMDAxMi42IDBsMTEyLTE0MS43YzQuMS01LjIuNC0xMi45LTYuMy0xMi45aC03NC4xVjE2OGMwLTQuNC0zLjYtOC04LThoLTYwYy00LjQgMC04IDMuNi04IDh2MzM4LjNINDAwYy02LjcgMC0xMC40IDcuNy02LjMgMTIuOWwxMTIgMTQxLjh6TTg3OCA2MjZoLTYwYy00LjQgMC04IDMuNi04IDh2MTU0SDIxNFY2MzRjMC00LjQtMy42LTgtOC04aC02MGMtNC40IDAtOCAzLjYtOCA4djE5OGMwIDE3LjcgMTQuMyAzMiAzMiAzMmg2ODRjMTcuNyAwIDMyLTE0LjMgMzItMzJWNzQyYzAtNC40LTMuNi04LTgtOHoiPjwvcGF0aD48L3N2Zz4=';
    controlButton.TooltipText = intl.get('hfle.component.button.download').d('下载');
    controlButton.OnAction = () => {
        // Construct the URL with the token as a query parameter
        const url = `/hfle/v1/3rd/file/download?_w_third_requestId=${fileId}&_w_third_online-editor-token=${fileToken}`;
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = url;
        // Append the link to the body (necessary for Firefox)
        document.body.appendChild(link);
        // Programmatically click the link to trigger the download
        link.click();
        // Remove the link from the document
        document.body.removeChild(link);
    };
  }

  const addCustomControl = async() => {
    // 定制元素对象：【插入 Tab】
    // const controls = await jssdk.current.Application.CommandBars("InsertTab").Controls;
    // 添加 1 个定制元素
    // const control = await controls.Add(1);
    // control.Caption = intl.get('hfle.component.button.controls').d('格式文本控件');
    // control.Picture = 'data:image/svg+xml;base64,PHN2ZyB0PSIxNzE3NTg5MDcwOTE0IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0OTMiIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZD0iTTMwNy4yIDQwOS42aDE1My42djMwNy4yaDEwMi40VjQwOS42aDE1My42di0xMDIuNEgzMDcuMnpNNzYuOCA0NjAuOGgxMDIuNHYxMDIuNEg3Ni44ek04NDQuOCA0NjAuOGgxMDIuNHYxMDIuNGgtMTAyLjR6IiBmaWxsPSIjMmMyYzJjIiBwLWlkPSIxNDk0Ij48L3BhdGg+PHBhdGggZD0iTTEwMi40IDEwMi40djMwNy4yaDUxLjJWMTUzLjZoNzE2Ljh2MjU2aDUxLjJWMTAyLjR6TTg3MC40IDg3MC40SDE1My42VjYxNC40SDEwMi40djMwNy4yaDgxOS4yVjYxNC40aC01MS4yeiIgZmlsbD0iIzJjMmMyYyIgcC1pZD0iMTQ5NSI+PC9wYXRoPjwvc3ZnPg==';
    // control.OnAction = () => addControl(1);
    // jssdk.current.wpsControle = control;
    // await setContentControlStatus();
    const startControls = await jssdk.current.Application.CommandBars("StartTab").Controls;
    const startControl = await startControls.Add(1);
    jssdk.current.wpsStartControl = startControl;
    startControl.TooltipText = intl.get('hfle.component.button.fullscreen').d('全屏');
    startControl.Picture = "data:image/svg+xml;base64,PHN2ZyB0PSIxNzE4MDc0MTY1ODUwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjQyNTYiIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZD0iTTE0OS4zMzMzMzMgMzk0LjY2NjY2N2MxNy4wNjY2NjcgMCAzMi0xNC45MzMzMzMgMzItMzJ2LTEzNi41MzMzMzRsMTg3LjczMzMzNCAxODcuNzMzMzM0YzYuNCA2LjQgMTQuOTMzMzMzIDguNTMzMzMzIDIzLjQ2NjY2NiA4LjUzMzMzM3MxNy4wNjY2NjctMi4xMzMzMzMgMjMuNDY2NjY3LTguNTMzMzMzYzEyLjgtMTIuOCAxMi44LTMyIDAtNDQuOGwtMTg3LjczMzMzMy0xODcuNzMzMzM0SDM2Mi42NjY2NjdjMTcuMDY2NjY3IDAgMzItMTQuOTMzMzMzIDMyLTMycy0xNC45MzMzMzMtMzItMzItMzJIMTQ5LjMzMzMzM2MtNC4yNjY2NjcgMC04LjUzMzMzMyAwLTEwLjY2NjY2NiAyLjEzMzMzNC04LjUzMzMzMyA0LjI2NjY2Ny0xNC45MzMzMzMgMTAuNjY2NjY3LTE5LjIgMTcuMDY2NjY2LTIuMTMzMzMzIDQuMjY2NjY3LTIuMTMzMzMzIDguNTMzMzMzLTIuMTMzMzM0IDEyLjh2MjEzLjMzMzMzNGMwIDE3LjA2NjY2NyAxNC45MzMzMzMgMzIgMzIgMzJ6TTg3NC42NjY2NjcgNjI5LjMzMzMzM2MtMTcuMDY2NjY3IDAtMzIgMTQuOTMzMzMzLTMyIDMydjEzNi41MzMzMzRMNjQyLjEzMzMzMyA1OTcuMzMzMzMzYy0xMi44LTEyLjgtMzItMTIuOC00NC44IDBzLTEyLjggMzIgMCA0NC44bDIwMC41MzMzMzQgMjAwLjUzMzMzNEg2NjEuMzMzMzMzYy0xNy4wNjY2NjcgMC0zMiAxNC45MzMzMzMtMzIgMzJzMTQuOTMzMzMzIDMyIDMyIDMyaDIxMy4zMzMzMzRjNC4yNjY2NjcgMCA4LjUzMzMzMyAwIDEwLjY2NjY2Ni0yLjEzMzMzNCA4LjUzMzMzMy00LjI2NjY2NyAxNC45MzMzMzMtOC41MzMzMzMgMTcuMDY2NjY3LTE3LjA2NjY2NiAyLjEzMzMzMy00LjI2NjY2NyAyLjEzMzMzMy04LjUzMzMzMyAyLjEzMzMzMy0xMC42NjY2NjdWNjYxLjMzMzMzM2MyLjEzMzMzMy0xNy4wNjY2NjctMTIuOC0zMi0yOS44NjY2NjYtMzJ6TTM4MS44NjY2NjcgNTk1LjJsLTIwMC41MzMzMzQgMjAwLjUzMzMzM1Y2NjEuMzMzMzMzYzAtMTcuMDY2NjY3LTE0LjkzMzMzMy0zMi0zMi0zMnMtMzIgMTQuOTMzMzMzLTMyIDMydjIxMy4zMzMzMzRjMCA0LjI2NjY2NyAwIDguNTMzMzMzIDIuMTMzMzM0IDEwLjY2NjY2NiA0LjI2NjY2NyA4LjUzMzMzMyA4LjUzMzMzMyAxNC45MzMzMzMgMTcuMDY2NjY2IDE3LjA2NjY2NyA0LjI2NjY2NyAyLjEzMzMzMyA4LjUzMzMzMyAyLjEzMzMzMyAxMC42NjY2NjcgMi4xMzMzMzNoMjEzLjMzMzMzM2MxNy4wNjY2NjcgMCAzMi0xNC45MzMzMzMgMzItMzJzLTE0LjkzMzMzMy0zMi0zMi0zMmgtMTM2LjUzMzMzM2wyMDAuNTMzMzMzLTIwMC41MzMzMzNjMTIuOC0xMi44IDEyLjgtMzIgMC00NC44cy0yOS44NjY2NjctMTAuNjY2NjY3LTQyLjY2NjY2NiAwek05MDQuNTMzMzMzIDEzOC42NjY2NjdjMC0yLjEzMzMzMyAwLTIuMTMzMzMzIDAgMC00LjI2NjY2Ny04LjUzMzMzMy0xMC42NjY2NjctMTQuOTMzMzMzLTE3LjA2NjY2Ni0xNy4wNjY2NjctNC4yNjY2NjctMi4xMzMzMzMtOC41MzMzMzMtMi4xMzMzMzMtMTAuNjY2NjY3LTIuMTMzMzMzSDY2MS4zMzMzMzNjLTE3LjA2NjY2NyAwLTMyIDE0LjkzMzMzMy0zMiAzMnMxNC45MzMzMzMgMzIgMzIgMzJoMTM2LjUzMzMzNGwtMTg3LjczMzMzNCAxODcuNzMzMzMzYy0xMi44IDEyLjgtMTIuOCAzMiAwIDQ0LjggNi40IDYuNCAxNC45MzMzMzMgOC41MzMzMzMgMjMuNDY2NjY3IDguNTMzMzMzczE3LjA2NjY2Ny0yLjEzMzMzMyAyMy40NjY2NjctOC41MzMzMzNsMTg3LjczMzMzMy0xODcuNzMzMzMzVjM2Mi42NjY2NjdjMCAxNy4wNjY2NjcgMTQuOTMzMzMzIDMyIDMyIDMyczMyLTE0LjkzMzMzMyAzMi0zMlYxNDkuMzMzMzMzYy0yLjEzMzMzMy00LjI2NjY2Ny0yLjEzMzMzMy04LjUzMzMzMy00LjI2NjY2Ny0xMC42NjY2NjZ6IiBmaWxsPSIjNjY2NjY2IiBwLWlkPSI0MjU3Ij48L3BhdGg+PC9zdmc+";
    startControl.OnAction = () => toggleFullscreen();
  };

  const lineControl = async() => {
    // const contentControls = await jssdk.current.Application.ActiveDocument.ContentControls;
    // const count = await contentControls.Count;
    // for (let i = 1; i <= count; i++) {
    //   const contentControl = await contentControls.Item(i);
    //   const type = await contentControl.Type;
    //   if (Number(type) === 1) {
    //     contentControl.MultiLine = true;
    //     await contentControl.SetPlaceholderText({Text:""});
    //   }
    // }
  };

  const addControl = async(type) => {
    // 内容控件对象
    const contentControls = await jssdk.current.Application.ActiveDocument.ContentControls;
    // 在光标处插入下拉内容控件
    const ct = await contentControls.Add({ Type: type});
    await ct.SetPlaceholderText({ Text: "" });
    ct.MultiLine = true;
    await lineControl();
  };

  // const setContentControlStatus = async() => {
    // const mode = await jssdk.current.Application.ActiveDocument.RestrictEditMode;
    // if (jssdk.current.wpsControle) {
    //   if ([0, 5, 2].includes(Number(mode))){
    //     jssdk.current.wpsControle.Enabled = true;
    //   } else {
    //     jssdk.current.wpsControle.Enabled = false;
    //   }
    // }
  // };

  // 切换全屏模式
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
          // 进入全屏模式
          if (editorRef.current?.requestFullscreen) {
            editorRef.current.requestFullscreen();
          } else if (editorRef.current.mozRequestFullScreen) { // Firefox
            editorRef.current.mozRequestFullScreen();
          } else if (editorRef.current.webkitRequestFullscreen) { // Chrome, Safari and Opera
            editorRef.current.webkitRequestFullscreen();
          } else if (editorRef.current.msRequestFullscreen) { // IE/Edge
            editorRef.current.msRequestFullscreen();
          }
          jssdk.current.wpsStartControl.TooltipText = intl.get('hfle.component.button.exit_fullscreen').d('退出全屏');
          jssdk.current.wpsStartControl.Picture = 'data:image/svg+xml;base64,PHN2ZyB0PSIxNzE4MDc0NDUyMzE4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjQ0MjAiIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZD0iTTMxMy42IDM1OC40SDE3Ny4wNjY2NjdjLTE3LjA2NjY2NyAwLTMyIDE0LjkzMzMzMy0zMiAzMnMxNC45MzMzMzMgMzIgMzIgMzJoMjEzLjMzMzMzM2M0LjI2NjY2NyAwIDguNTMzMzMzIDAgMTAuNjY2NjY3LTIuMTMzMzMzIDguNTMzMzMzLTQuMjY2NjY3IDE0LjkzMzMzMy04LjUzMzMzMyAxNy4wNjY2NjYtMTcuMDY2NjY3IDIuMTMzMzMzLTQuMjY2NjY3IDIuMTMzMzMzLTguNTMzMzMzIDIuMTMzMzM0LTEwLjY2NjY2N3YtMjEzLjMzMzMzM2MwLTE3LjA2NjY2Ny0xNC45MzMzMzMtMzItMzItMzJzLTMyIDE0LjkzMzMzMy0zMiAzMnYxMzYuNTMzMzMzTDE3Mi44IDEyNS44NjY2NjdjLTEyLjgtMTIuOC0zMi0xMi44LTQ0LjggMC0xMi44IDEyLjgtMTIuOCAzMiAwIDQ0LjhsMTg1LjYgMTg3LjczMzMzM3pNNjk1LjQ2NjY2NyA2NTAuNjY2NjY3SDgzMmMxNy4wNjY2NjcgMCAzMi0xNC45MzMzMzMgMzItMzJzLTE0LjkzMzMzMy0zMi0zMi0zMkg2MTguNjY2NjY3Yy00LjI2NjY2NyAwLTguNTMzMzMzIDAtMTAuNjY2NjY3IDIuMTMzMzMzLTguNTMzMzMzIDQuMjY2NjY3LTE0LjkzMzMzMyA4LjUzMzMzMy0xNy4wNjY2NjcgMTcuMDY2NjY3LTIuMTMzMzMzIDQuMjY2NjY3LTIuMTMzMzMzIDguNTMzMzMzLTIuMTMzMzMzIDEwLjY2NjY2NnYyMTMuMzMzMzM0YzAgMTcuMDY2NjY3IDE0LjkzMzMzMyAzMiAzMiAzMnMzMi0xNC45MzMzMzMgMzItMzJ2LTEzNi41MzMzMzRsMjAwLjUzMzMzMyAyMDAuNTMzMzM0YzYuNCA2LjQgMTQuOTMzMzMzIDguNTMzMzMzIDIzLjQ2NjY2NyA4LjUzMzMzM3MxNy4wNjY2NjctMi4xMzMzMzMgMjMuNDY2NjY3LTguNTMzMzMzYzEyLjgtMTIuOCAxMi44LTMyIDAtNDQuOGwtMjA0LjgtMTk4LjR6TTQzNS4yIDYwNS44NjY2NjdjLTQuMjY2NjY3LTguNTMzMzMzLTguNTMzMzMzLTE0LjkzMzMzMy0xNy4wNjY2NjctMTcuMDY2NjY3LTQuMjY2NjY3LTIuMTMzMzMzLTguNTMzMzMzLTIuMTMzMzMzLTEwLjY2NjY2Ni0yLjEzMzMzM0gxOTJjLTE3LjA2NjY2NyAwLTMyIDE0LjkzMzMzMy0zMiAzMnMxNC45MzMzMzMgMzIgMzIgMzJoMTM2LjUzMzMzM0wxMjggODUxLjJjLTEyLjggMTIuOC0xMi44IDMyIDAgNDQuOCA2LjQgNi40IDE0LjkzMzMzMyA4LjUzMzMzMyAyMy40NjY2NjcgOC41MzMzMzNzMTcuMDY2NjY3LTIuMTMzMzMzIDIzLjQ2NjY2Ni04LjUzMzMzM2wyMDAuNTMzMzM0LTIwMC41MzMzMzNWODMyYzAgMTcuMDY2NjY3IDE0LjkzMzMzMyAzMiAzMiAzMnMzMi0xNC45MzMzMzMgMzItMzJWNjE4LjY2NjY2N2MtMi4xMzMzMzMtNC4yNjY2NjctMi4xMzMzMzMtOC41MzMzMzMtNC4yNjY2NjctMTIuOHpNNjAzLjczMzMzMyA0MDMuMmM0LjI2NjY2NyA4LjUzMzMzMyA4LjUzMzMzMyAxNC45MzMzMzMgMTcuMDY2NjY3IDE3LjA2NjY2NyA0LjI2NjY2NyAyLjEzMzMzMyA4LjUzMzMzMyAyLjEzMzMzMyAxMC42NjY2NjcgMi4xMzMzMzNoMjEzLjMzMzMzM2MxNy4wNjY2NjcgMCAzMi0xNC45MzMzMzMgMzItMzJzLTE0LjkzMzMzMy0zMi0zMi0zMmgtMTM2LjUzMzMzM0w4OTYgMTcwLjY2NjY2N2MxMi44LTEyLjggMTIuOC0zMiAwLTQ0LjgtMTIuOC0xMi44LTMyLTEyLjgtNDQuOCAwbC0xODcuNzMzMzMzIDE4Ny43MzMzMzNWMTc3LjA2NjY2N2MwLTE3LjA2NjY2Ny0xNC45MzMzMzMtMzItMzItMzJzLTMyIDE0LjkzMzMzMy0zMiAzMnYyMTMuMzMzMzMzYzIuMTMzMzMzIDQuMjY2NjY3IDIuMTMzMzMzIDguNTMzMzMzIDQuMjY2NjY2IDEyLjh6IiBmaWxsPSIjNjY2NjY2IiBwLWlkPSI0NDIxIj48L3BhdGg+PC9zdmc+';
      } else {
          // 退出全屏模式
          if (document.exitFullscreen) {
              document.exitFullscreen();
          } else if ((document as any).mozCancelFullScreen) { // Firefox
            (document as any).mozCancelFullScreen();
          } else if ((document as any).webkitExitFullscreen) { // Chrome, Safari and Opera
            (document as any).webkitExitFullscreen();
          } else if ((document as any).msExitFullscreen) { // IE/Edge
            (document as any).msExitFullscreen();
          }
          jssdk.current.wpsStartControl.TooltipText = intl.get('hfle.component.button.fullscreen').d('全屏');
          jssdk.current.wpsStartControl.Picture = 'data:image/svg+xml;base64,PHN2ZyB0PSIxNzE4MDc0MTY1ODUwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjQyNTYiIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZD0iTTE0OS4zMzMzMzMgMzk0LjY2NjY2N2MxNy4wNjY2NjcgMCAzMi0xNC45MzMzMzMgMzItMzJ2LTEzNi41MzMzMzRsMTg3LjczMzMzNCAxODcuNzMzMzM0YzYuNCA2LjQgMTQuOTMzMzMzIDguNTMzMzMzIDIzLjQ2NjY2NiA4LjUzMzMzM3MxNy4wNjY2NjctMi4xMzMzMzMgMjMuNDY2NjY3LTguNTMzMzMzYzEyLjgtMTIuOCAxMi44LTMyIDAtNDQuOGwtMTg3LjczMzMzMy0xODcuNzMzMzM0SDM2Mi42NjY2NjdjMTcuMDY2NjY3IDAgMzItMTQuOTMzMzMzIDMyLTMycy0xNC45MzMzMzMtMzItMzItMzJIMTQ5LjMzMzMzM2MtNC4yNjY2NjcgMC04LjUzMzMzMyAwLTEwLjY2NjY2NiAyLjEzMzMzNC04LjUzMzMzMyA0LjI2NjY2Ny0xNC45MzMzMzMgMTAuNjY2NjY3LTE5LjIgMTcuMDY2NjY2LTIuMTMzMzMzIDQuMjY2NjY3LTIuMTMzMzMzIDguNTMzMzMzLTIuMTMzMzM0IDEyLjh2MjEzLjMzMzMzNGMwIDE3LjA2NjY2NyAxNC45MzMzMzMgMzIgMzIgMzJ6TTg3NC42NjY2NjcgNjI5LjMzMzMzM2MtMTcuMDY2NjY3IDAtMzIgMTQuOTMzMzMzLTMyIDMydjEzNi41MzMzMzRMNjQyLjEzMzMzMyA1OTcuMzMzMzMzYy0xMi44LTEyLjgtMzItMTIuOC00NC44IDBzLTEyLjggMzIgMCA0NC44bDIwMC41MzMzMzQgMjAwLjUzMzMzNEg2NjEuMzMzMzMzYy0xNy4wNjY2NjcgMC0zMiAxNC45MzMzMzMtMzIgMzJzMTQuOTMzMzMzIDMyIDMyIDMyaDIxMy4zMzMzMzRjNC4yNjY2NjcgMCA4LjUzMzMzMyAwIDEwLjY2NjY2Ni0yLjEzMzMzNCA4LjUzMzMzMy00LjI2NjY2NyAxNC45MzMzMzMtOC41MzMzMzMgMTcuMDY2NjY3LTE3LjA2NjY2NiAyLjEzMzMzMy00LjI2NjY2NyAyLjEzMzMzMy04LjUzMzMzMyAyLjEzMzMzMy0xMC42NjY2NjdWNjYxLjMzMzMzM2MyLjEzMzMzMy0xNy4wNjY2NjctMTIuOC0zMi0yOS44NjY2NjYtMzJ6TTM4MS44NjY2NjcgNTk1LjJsLTIwMC41MzMzMzQgMjAwLjUzMzMzM1Y2NjEuMzMzMzMzYzAtMTcuMDY2NjY3LTE0LjkzMzMzMy0zMi0zMi0zMnMtMzIgMTQuOTMzMzMzLTMyIDMydjIxMy4zMzMzMzRjMCA0LjI2NjY2NyAwIDguNTMzMzMzIDIuMTMzMzM0IDEwLjY2NjY2NiA0LjI2NjY2NyA4LjUzMzMzMyA4LjUzMzMzMyAxNC45MzMzMzMgMTcuMDY2NjY2IDE3LjA2NjY2NyA0LjI2NjY2NyAyLjEzMzMzMyA4LjUzMzMzMyAyLjEzMzMzMyAxMC42NjY2NjcgMi4xMzMzMzNoMjEzLjMzMzMzM2MxNy4wNjY2NjcgMCAzMi0xNC45MzMzMzMgMzItMzJzLTE0LjkzMzMzMy0zMi0zMi0zMmgtMTM2LjUzMzMzM2wyMDAuNTMzMzMzLTIwMC41MzMzMzNjMTIuOC0xMi44IDEyLjgtMzIgMC00NC44cy0yOS44NjY2NjctMTAuNjY2NjY3LTQyLjY2NjY2NiAwek05MDQuNTMzMzMzIDEzOC42NjY2NjdjMC0yLjEzMzMzMyAwLTIuMTMzMzMzIDAgMC00LjI2NjY2Ny04LjUzMzMzMy0xMC42NjY2NjctMTQuOTMzMzMzLTE3LjA2NjY2Ni0xNy4wNjY2NjctNC4yNjY2NjctMi4xMzMzMzMtOC41MzMzMzMtMi4xMzMzMzMtMTAuNjY2NjY3LTIuMTMzMzMzSDY2MS4zMzMzMzNjLTE3LjA2NjY2NyAwLTMyIDE0LjkzMzMzMy0zMiAzMnMxNC45MzMzMzMgMzIgMzIgMzJoMTM2LjUzMzMzNGwtMTg3LjczMzMzNCAxODcuNzMzMzMzYy0xMi44IDEyLjgtMTIuOCAzMiAwIDQ0LjggNi40IDYuNCAxNC45MzMzMzMgOC41MzMzMzMgMjMuNDY2NjY3IDguNTMzMzMzczE3LjA2NjY2Ny0yLjEzMzMzMyAyMy40NjY2NjctOC41MzMzMzNsMTg3LjczMzMzMy0xODcuNzMzMzMzVjM2Mi42NjY2NjdjMCAxNy4wNjY2NjcgMTQuOTMzMzMzIDMyIDMyIDMyczMyLTE0LjkzMzMzMyAzMi0zMlYxNDkuMzMzMzMzYy0yLjEzMzMzMy00LjI2NjY2Ny0yLjEzMzMzMy04LjUzMzMzMy00LjI2NjY2Ny0xMC42NjY2NjZ6IiBmaWxsPSIjNjY2NjY2IiBwLWlkPSI0MjU3Ij48L3BhdGg+PC9zdmc+';
      }
    } catch(e) {}
  };

  return (
    <div
      id={id}
      className={className}
      style={{ height: '100%', ...(style || {}) }}
      ref={editorRef}
    />
  );
}

export default formatterCollections({ code: ['hfle.component'] })(OnlineWord);
