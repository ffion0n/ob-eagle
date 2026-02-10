# Eagle Obsidian Special Copy

一个给 Eagle 用的小插件：把当前选中的项目复制为 Obsidian 可直接粘贴的 Markdown 链接，避免二次上传导致重复文件。

## 功能
- 支持单选和多选。
- 图片复制为：`![name](http://localhost:6060/images/<ID>.info)`。
- 非图片复制为：`[name](http://localhost:6060/images/<ID>.info)`。
- 复制的是链接引用，不会在 Eagle 里新建文件。

## 使用
1. 把 `eagle-special-copy` 整个文件夹拖进 Eagle 安装插件。
2. 在 Eagle 里选中要复用的项目。
3. 运行插件后点击“复制选中项链接”。
4. 去 Obsidian 直接粘贴。

## 端口说明
- 默认端口是 `6060`。
- 如果你的 Ob 插件端口不是 `6060`，可在插件页面打开开发者工具执行：
  - `localStorage.setItem('eagleBridgePort', '你的端口')`

