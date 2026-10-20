// 将字符串中的a标签转换成不带链接或点击事件的空标签
export function transformContentLink(content) {
  let newContent = '';
  if (content.includes('<a ')) {
    // 检查是否有a标签
    content.split('<a ').forEach((item, index) => {
      let contentPart = item;
      if (item.includes('</a>')) {
        const linkContent = item.split('</a>')[0];
        if (linkContent.includes('href=') || linkContent.includes('onclick=') || linkContent.includes('onClick=')) {
          contentPart = `<a ${linkContent.substr(linkContent.lastIndexOf('>'))}</a>`.concat(
            item.split('</a>').slice(1).join(',')
          );
        }
      } else if (index > 0) {
        contentPart = `<a ${item}`;
      }
      newContent += contentPart;
    });
  } else {
    newContent = content;
  }
  return newContent;
}
