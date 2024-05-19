import Uploader from '@wiajs/ui/uploader';
import * as store from './store';

function uploader(opt, pg) {
  const def = {
    dir: 'nuoya/camp', // 存储路径
    url: $.app.api.img,
    // 用于自动添加input标签的容器
    el: pg?.class('uploader'), // 上传容器
    input: pg?.name('attach'), // 上传成功后的文件填入输入框
    multiple: true, // 单选或多选
    accept: 'image/jpg,image/jpeg,image/png,image/gif', // 文件类型
    upload: true,
    compress: true,
    quality: 0.5, // 压缩比

    // xhr配置
    headers: {'x-wia-token': store.get('token')}, // 添加额外参数
  };
  return new Uploader({...def, ...opt});
}

export {uploader};
