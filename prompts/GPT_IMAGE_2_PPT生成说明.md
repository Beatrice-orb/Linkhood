# GPT Image 2 路演视觉生成说明

## 已准备任务

`gpt-image-2-ppt-assets.jsonl` 包含 6 张 16:9 核心视觉：

1. 封面社区生活地图
2. 全年龄居民互助场景
3. 社区信息分散与核验工作
4. 社区生活地图底图
5. 可信低风险邻里互助
6. 结束页社区夜景

所有提示词都明确要求不生成文字、数字、Logo、UI 和水印。居民调查数据、政策、技术架构和产品截图继续使用 PowerPoint 原生文本与真实截图，以保持可编辑和可追溯。

## 生成命令

```bash
export IMAGE_GEN="${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/image_gen.py"

python "$IMAGE_GEN" generate-batch \
  --input prompts/gpt-image-2-ppt-assets.jsonl \
  --out-dir output/imagegen/dabashou-ppt \
  --concurrency 3
```

CLI 默认使用 `gpt-image-2`；JSONL 中也为每个任务显式指定了模型。

## 后续组装

图片生成后：

- 第 1 张用于封面右侧或全屏背景。
- 第 2 张用于全年龄需求页。
- 第 3 张用于社区需求页右侧。
- 第 4 张用于解决方案和社区生活地图页。
- 第 5 张用于三方价值或信任机制页。
- 第 6 张用于结束页。
- 居民端、社区端和社工端继续使用真实产品截图，不使用 AI 伪造界面。
