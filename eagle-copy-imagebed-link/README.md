# 复制ealge图床链接（Eagle 插件）

把当前在 Eagle 中选中的项目，复制成图床链接到剪贴板，例如：

`http://localhost:6060/images/MKGUV8SL1DDF6.info`

## 功能

- 支持单选和多选（多选用换行分隔）。
- 默认端口：`6060`（读取 `localStorage.eagleBridgePort`）。
- 默认主机：`localhost`（可选读取 `localStorage.eagleBridgeHost`）。

## 使用

1. 把 `eagle-copy-imagebed-link` 整个文件夹拖进 Eagle 安装插件。
2. 在 Eagle 里选中要复制的项目。
3. 运行插件，链接会自动复制到剪贴板。

## 自定义端口 / 主机

在插件页面打开开发者工具执行：

- `localStorage.setItem('eagleBridgePort', '6060')`
- `localStorage.setItem('eagleBridgeHost', 'localhost')`

