# Loaflings 模块化角色扩展方案

> 状态：根据第一轮评审修订
> 依据：`reference/`、`LOAFLING_CHARACTER_SPEC_UPDATED.md`、`svg/Pet_Base_Master.svg`
> 核心结论：**不要为每个组合生成一张完整角色图；只生产可复用部件，再由运行时合成。**
>
> Figma 文件结构、批量制作步骤、命名、导出和验收流程见
> `ASSET_PRODUCTION_GUIDE.md`。

## 1. 为什么必须模块化

假设未来有：

- 10 种身体
- 12 种表情
- 20 件帽子 / 配饰
- 8 种衣服

如果每个组合都生成完整图片，需要：

`10 × 12 × 20 × 8 = 19,200 张图`

这会带来三个问题：

1. 同一顶帽子要在每个身体、每种表情上重复生成。
2. AI 每次都会轻微改变身体、脸和云朵，角色身份无法稳定。
3. 用户无法自由换装，只能从预先烘焙好的整图中选择。

模块化后只需要生产：

`10 个身体 + 12 个表情 + 20 件配饰 + 8 件衣服 = 50 个部件`

角色本身保存的是一份“配方”，运行时根据配方组合图层。

## 2. 完整角色图与模块素材的角色

两者都可以存在，但用途不同。

### 完整角色图

用途：

- 视觉概念探索
- 美术评审
- 宣传图、卡片和商店预览
- 检查某件配饰穿在角色身上是否协调

限制：

- 不作为自由换装系统的最终素材。
- 不直接参与组合逻辑。
- 不因为新增一个身体就复制全部表情与配饰。

### 模块素材

用途：

- 桌面角色实时显示
- 收藏页换装
- 同一顶帽子给多个 Loafling 使用
- 同一套表情给不同身体使用
- 调整颜色、稀有度和季节样式

要求：

- 每张只包含自己的部件，其余区域完全透明。
- 所有部件使用同一画布、坐标、锚点和缩放规则。
- 运行时按固定层级叠加。

## 3. 推荐的角色数据结构

一个 Loafling 不保存“最终图片文件名”，而保存部件选择：

```json
{
  "body": "body_classic",
  "palette": "cream",
  "marking": "marking_none",
  "expression": "expr_happy",
  "cloudMood": "cloud_happy",
  "headwear": "hat_knit_blue",
  "facewear": null,
  "outfit": "outfit_vest_sage",
  "backItem": null,
  "heldItem": null
}
```

换表情时只改 `expression` 与必要的 `cloudMood`；换帽子时只改 `headwear`。

## 4. 模块分类

### 4.1 身体与前景遮罩

- `body`：基础身体，不包含表情、云朵和配饰。
- `pawsForeground`：两只前爪的前景层。
- `tail`：尾巴，可根据身体类型替换。
- `marking`：斑点、渐变、色块等身体花纹。

前爪需要从身体中拆出来。否则衣服只能压在爪子上面，无法自然地从爪子后方穿过。

### 4.2 表情

表情只包含：

- 左眼
- 右眼
- 嘴
- 可选腮红变化
- 可选极小眉眼符号

表情**不包含身体、前爪、尾巴或云朵**。

核心表情：

| ID | 表现 |
|---|---|
| `expr_normal` | 点眼、小平嘴 |
| `expr_happy` | 弯弯眼、小笑嘴 |
| `expr_sleepy` | 闭眼、松弛小嘴 |
| `expr_curious` | 轻微高低眼、小圆嘴 |
| `expr_surprised` | 小圆眼、极小 `o` 嘴 |
| `expr_focused` | 稍窄眼、短平嘴 |
| `expr_grumpy` | 低眉眼、短平嘴 |
| `expr_excited` | 亮眼或极小星点、小笑嘴 |

表情图形非常简单，正式资产优先使用 SVG，而不是为每个身体调用 AI 重新生成。

### 4.3 云朵情绪

云朵独立于表情：

- `cloud_normal`
- `cloud_happy`
- `cloud_focused`
- `cloud_sleepy`
- `cloud_curious`
- `cloud_rainy`
- `cloud_stormy`
- `cloud_dreamy`

同一个 `expr_sleepy` 可以搭配普通云、睡眠云或梦境云，不需要重新生成整只角色。

### 4.4 可自由更换的配饰槽

- `headwear`：针织帽、睡帽、雨帽、迷你巫师帽、蝴蝶结、叶子发夹。
- `facewear`：圆框眼镜、小护目镜。
- `earwear`：软垫耳机；位置依附身体左右侧锚点，不代表真实耳朵。
- `outfit`：低覆盖率背心、围裙、短雨衣、小披肩。
- `backItem`：小背包、卷轴、植物芽等侧后方物件。
- `heldItem`：杯子、书、叶子、星星玩具等短时互动道具。

第一轮的围巾方向已取消，不进入配饰库。

## 5. 图层顺序

推荐从后到前：

1. `shadow`
2. `backItem`
3. `tail`
4. `body`
5. `marking`
6. `outfitBack`
7. `outfitFront`
8. `expression`
9. `facewear`
10. `pawsForeground`
11. `headwear`
12. `cloudMood`
13. `heldItemForeground`

部分衣服可以拆成 `outfitBack` 和 `outfitFront` 两层，让身体和前爪之间产生自然遮挡。

## 6. 统一画布与锚点

### Authoring space

- 所有可组合矢量部件统一使用 `viewBox="0 0 1200 900"`。
- 这是当前 `Pet_Base_Master.svg` 的正式坐标系。
- 所有部件都保留完整画布，不能各自紧裁切后再猜位置。
- 需要 PNG 时，从同一 SVG 画布导出 `2400 × 1800` 的 2× 透明图。

### Base Loafling 锚点

首版锚点沿用现有几何母版：

| Anchor | 位置 | 用途 |
|---|---:|---|
| `bodyCenter` | `(600, 500)` | 身体整体变换中心 |
| `baseline` | `y = 675` | 地面和阴影对齐 |
| `faceCenter` | `(600, 530)` | 表情层中心 |
| `pawLeft` | `(421, 619)` | 左前爪与道具遮挡 |
| `pawRight` | `(779, 619)` | 右前爪与道具遮挡 |
| `tail` | `(885, 585)` | 尾巴与后置物件 |
| `headwear` | `(600, 315)` | 帽子基准点 |
| `cloudCenter` | `(600, 155)` | 云朵中心 |

锚点描述的是逻辑位置，不要求所有配饰都以锚点为图形中心。

### 不同身体如何共用同一套表情

每个身体只需提供一组局部变换：

```json
{
  "faceTransform": {
    "x": 600,
    "y": 530,
    "scaleX": 1,
    "scaleY": 1,
    "rotation": 0
  },
  "headwearTransform": {
    "x": 600,
    "y": 315,
    "scale": 1
  }
}
```

例如 Chubby 身体可以把表情整体下移 10px；Long 身体可以把两眼的水平间距放大 5%。表情本身不需要重画。

## 7. 最合适的美术生产方式

### 表情

1. 参考图中一次设计完整表情表。
2. 用 SVG 基础图形绘制眼睛、嘴和腮红。
3. 每个表情只保存脸部图层。
4. 在预览器中自动套到所有身体上做批量检查。

因此表情不需要逐只 AI 生成。AI 生成的完整表情图只作为情绪参考。

### 配饰

1. 先用概念板一次探索一组帽子或服装方向。
2. 选中少量设计后，制作“角色穿戴预览”确认比例。
3. 最终资产只保留帽子或衣服本体，放在统一透明画布和锚点上。
4. 使用运行时预览器批量套在 Classic、Chubby、Long 等身体上。
5. 如果某个身体确实不兼容，在清单中声明兼容性，而不是重做所有组合。

### 身体颜色

身体颜色尽量通过调色板和蒙版完成：

- `cream`
- `mocha`
- `matcha`
- `strawberry`
- `mint`
- `lavender`
- `sky`
- `sesame`

不要为“同一个身体 × 每一种颜色”生成新的完整图片。

## 8. 部件清单需要记录什么

每个部件应有 manifest 数据：

```json
{
  "id": "hat_knit_blue",
  "slot": "headwear",
  "src": "headwear/hat_knit_blue.svg",
  "anchor": "headwear",
  "zIndex": 110,
  "compatibleBodies": ["body_classic", "body_chubby", "body_long"],
  "conflicts": ["cloud_low"],
  "recolorable": true,
  "tags": ["cozy", "winter", "common"]
}
```

这样未来可以：

- 自由换装
- 随机生成搭配
- 按稀有度筛选
- 做季节主题
- 限制不兼容组合
- 在不复制图片的情况下换颜色

## 9. 当前第一批素材如何处理

已保留以下完整角色图作为概念母版：

- `png/expressions/expr_happy.png`
- `png/expressions/expr_sleepy.png`
- `png/expressions/expr_curious.png`
- `png/accessories/hat_knit_blue.png`
- `png/accessories/outfit_vest_sage.png`

它们只用于提取视觉方向和验证穿戴比例。正式模块资产应重新制作为：

```text
modular/
  body/
    body_classic.svg
    paws_classic.svg
  expressions/
    expr_normal.svg
    expr_happy.svg
    expr_sleepy.svg
    expr_curious.svg
  clouds/
    cloud_normal.svg
    cloud_happy.svg
    cloud_sleepy.svg
    cloud_curious.svg
  headwear/
    hat_knit_blue.svg
  outfits/
    outfit_vest_sage_back.svg
    outfit_vest_sage_front.svg
```

## 10. 验收标准

- [ ] 更换表情时身体像素和轮廓完全不变。
- [ ] 更换帽子时脸、身体和云朵样式不被重新生成。
- [ ] 同一顶帽子可以套到至少三个兼容身体上。
- [ ] 同一表情可以通过锚点变换套到所有基础身体上。
- [ ] 组合后云朵仍有清晰悬浮间隙。
- [ ] 服装与前爪遮挡关系正确。
- [ ] 每个角色只保存组合配方，不保存所有组合整图。
- [ ] 可在不新增图片的情况下替换调色板。
- [ ] 部件在桌面小尺寸下仍可辨认。

## 11. 推荐实施顺序

1. 从 `Pet_Base_Master.svg` 拆出 body、paws、tail、face、cloud。
2. 建立 `1200 × 900` 统一画布和 anchor manifest。
3. 将 normal / happy / sleepy / curious 做成真正的 face-only SVG。
4. 将 normal / happy / sleepy / curious 云朵做成独立 SVG。
5. 把已确认的蓝色针织帽重制成 headwear-only SVG。
6. 将鼠尾草背心拆成 front / back 两层。
7. 做一个本地组合预览器，一次展示多个身体 × 表情 × 配饰。
8. 视觉确认后再接入 DESK、收藏页和换装逻辑。

## 12. 当前实现状态

第三版模块化素材包已经落在 `character/modular/`：

- Classic / Chubby / Long 三种身体的 body、tail、paws、shadow 已拆层。
- 8 个核心表情已全部变成 face-only SVG：Normal / Happy / Sleepy /
  Curious / Surprised / Focused / Grumpy / Excited。
- 10 种云朵状态已独立：Normal / Happy / Sleepy / Curious / Focused /
  Excited / Rainy / Stormy / Dreamy / Twin Cloud。
- 4 顶帽子均为 headwear-only SVG：蓝色针织帽、薰衣草睡帽、桃色贝雷帽、黄色雨帽。
- 2 副眼镜为 facewear-only SVG：可可圆框眼镜、蓝色专注眼镜。
- 3 件衣服为 outfit-only SVG：鼠尾草背心、桃色围裙、天空蓝雨衣，并位于前爪下方。
- 每件穿戴都在 manifest 中声明兼容 Classic / Chubby / Long，证明同一素材可跨身体复用。
- 首批模板已收敛为 3 个基础配方（Classic / Chubby / Long）和 2 个 reference 变异配方（Patchy / Twin Cloud）。Patchy 只占用 marking 层，Twin Cloud 只替换 cloud 层。
- `manifest.json` 记录统一画布、锚点、层序、兼容身体、标签和组合选项。
- `preview.html` 可以独立切换身体、表情、云朵、帽子、眼镜和衣服，也提供三组情景预设。

这仍是视觉基础设施，不会在确认前替换当前 DESK 运行时角色。
