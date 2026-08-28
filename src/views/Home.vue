<template>
	<div class="emmms-home">
		<!-- 背景装饰光斑：清新绿色氛围 -->
		<span class="emmms-home-glow emmms-home-glow--one"></span>
		<span class="emmms-home-glow emmms-home-glow--two"></span>

		<main class="emmms-home-main">
			<header class="emmms-home-head">
				<span class="emmms-home-badge">在线工具</span>
				<h1 class="emmms-home-title">fx67ll's Tool</h1>
				<p class="emmms-home-subtitle">可扩展多功能模块管理系统</p>
			</header>

			<!-- 工具导航卡片 -->
			<div class="emmms-home-cards">
				<!-- 时钟页为新窗口打开：沉浸式工具独立成页，保留导航首页不跳走 -->
				<router-link class="emmms-card" to="/time" target="_blank" rel="noopener">
					<span class="emmms-card-icon">
						<!-- 时钟图标 -->
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
							stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="9"></circle>
							<polyline points="12 7 12 12 15.5 14"></polyline>
						</svg>
					</span>
					<span class="emmms-card-title">在线时钟</span>
					<span class="emmms-card-desc">数字 / 二进制 / 翻页三种时钟，支持主题切换与网络校时</span>
					<span class="emmms-card-arrow">进入工具
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<line x1="5" y1="12" x2="19" y2="12"></line>
							<polyline points="12 5 19 12 12 19"></polyline>
						</svg>
					</span>
				</router-link>

				<router-link class="emmms-card" to="/404">
					<span class="emmms-card-icon">
						<!-- 打开的书本图标，呼应404页面的书柜场景 -->
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
							stroke-linecap="round" stroke-linejoin="round">
							<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"></path>
							<path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"></path>
						</svg>
					</span>
					<span class="emmms-card-title">404 页面</span>
					<span class="emmms-card-desc">经典书柜动画通用 404 页面，支持自定义跳转链接</span>
					<span class="emmms-card-arrow">进入页面
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<line x1="5" y1="12" x2="19" y2="12"></line>
							<polyline points="12 5 19 12 12 19"></polyline>
						</svg>
					</span>
				</router-link>
			</div>
		</main>

		<!-- 合规页脚：复用 fx67ll-vue-ui 组件库页脚 -->
		<fx67ll-footer fontColor="#9aa7b3" hoverColor="#42b983"></fx67ll-footer>
	</div>
</template>

<script>
export default {
	name: 'emmmsHome'
};
</script>

<style lang="less" scoped>
@emmms-theme: #2ecc71;
@emmms-theme-deep: #27ae60;

.emmms-home {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100vh;
	box-sizing: border-box;
	padding: 24px 20px 64px;
	overflow: hidden;
	// 清新浅色渐变背景
	background: linear-gradient(160deg, #f7fcf9 0%, #eef6f1 55%, #e8f4f6 100%);
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

// 背景装饰光斑：两团柔和的绿色光晕，营造清新氛围
.emmms-home-glow {
	position: absolute;
	border-radius: 50%;
	filter: blur(70px);
	pointer-events: none;

	&.emmms-home-glow--one {
		top: -120px;
		right: -80px;
		width: 340px;
		height: 340px;
		background: rgba(46, 204, 113, 0.16);
	}

	&.emmms-home-glow--two {
		bottom: -140px;
		left: -100px;
		width: 380px;
		height: 380px;
		background: rgba(46, 204, 113, 0.1);
	}
}

.emmms-home-main {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	// 入场动画
	animation: emmms-rise 0.6s ease both;
}

.emmms-home-head {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 44px;
	text-align: center;
}

// 顶部品牌徽标
.emmms-home-badge {
	padding: 5px 14px;
	border: 1px solid rgba(46, 204, 113, 0.35);
	border-radius: 999px;
	background: rgba(46, 204, 113, 0.08);
	font-size: 12px;
	font-weight: 600;
	letter-spacing: 3px;
	color: @emmms-theme-deep;
}

// 主标题：绿色渐变文字
.emmms-home-title {
	margin: 18px 0 0;
	font-size: 42px;
	font-weight: 700;
	letter-spacing: 1px;
	background: linear-gradient(120deg, @emmms-theme-deep 0%, @emmms-theme 60%, #55e6a0 100%);
	-webkit-background-clip: text;
	background-clip: text;
	-webkit-text-fill-color: transparent;
	color: @emmms-theme-deep;
}

.emmms-home-subtitle {
	margin: 12px 0 0;
	font-size: 14px;
	letter-spacing: 1px;
	color: #8494a4;
}

// 工具导航卡片区域
.emmms-home-cards {
	display: flex;
	align-items: stretch;
	justify-content: center;
	gap: 24px;
	width: 100%;
	max-width: 760px;
}

.emmms-card {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	box-sizing: border-box;
	width: 300px;
	padding: 26px 24px 22px;
	border: 1px solid #e3ede7;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.9);
	box-shadow: 0 8px 28px rgba(44, 62, 80, 0.07);
	text-decoration: none;
	cursor: pointer;
	transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
	// 卡片错峰入场
	animation: emmms-rise 0.6s ease 0.12s both;

	&:hover,
	&:focus-visible {
		border-color: rgba(46, 204, 113, 0.55);
		box-shadow: 0 14px 36px rgba(46, 204, 113, 0.18);
		transform: translateY(-6px);
		outline: none;

		.emmms-card-icon {
			background: @emmms-theme;
			color: #ffffff;
			box-shadow: 0 6px 16px rgba(46, 204, 113, 0.4);
		}

		.emmms-card-arrow {
			color: @emmms-theme-deep;

			svg {
				transform: translateX(4px);
			}
		}
	}

	// 第二张卡片再延迟一点，形成波浪式入场
	&:nth-child(2) {
		animation-delay: 0.22s;
	}
}

// 卡片图标容器：悬浮时由浅绿底变为实心绿
.emmms-card-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 54px;
	height: 54px;
	margin-bottom: 18px;
	border-radius: 16px;
	background: rgba(46, 204, 113, 0.12);
	color: @emmms-theme;
	transition: all 0.25s ease;

	svg {
		width: 28px;
		height: 28px;
	}
}

.emmms-card-title {
	font-size: 19px;
	font-weight: 600;
	letter-spacing: 1px;
	color: #3d4f5f;
}

.emmms-card-desc {
	margin-top: 10px;
	min-height: 40px;
	font-size: 13px;
	line-height: 1.6;
	color: #8494a4;
}

// 卡片底部「进入」引导：箭头悬浮位移
.emmms-card-arrow {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	margin-top: 14px;
	font-size: 13px;
	font-weight: 600;
	letter-spacing: 1px;
	color: #9aa7b3;
	transition: color 0.25s ease;

	svg {
		width: 15px;
		height: 15px;
		transition: transform 0.25s ease;
	}
}

// 页脚组件在浅色首页中的定位与字号微调
/deep/ .fx67ll-footer {
	position: absolute;
	bottom: 0;
	font-size: 12px;
	padding: 8px 0;
}

// 入场动画：向上浮现
@keyframes emmms-rise {
	from {
		opacity: 0;
		transform: translateY(16px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

// 移动端适配
@media screen and (max-width: 768px) {
	.emmms-home {
		height: auto;
		min-height: 100vh;
		padding: 48px 18px 88px;
	}

	.emmms-home-head {
		margin-bottom: 32px;
	}

	.emmms-home-title {
		font-size: 32px;
	}

	.emmms-home-subtitle {
		font-size: 13px;
		padding: 0 12px;
	}

	.emmms-home-cards {
		flex-direction: column;
		align-items: center;
		gap: 18px;
	}

	.emmms-card {
		width: 100%;
		max-width: 360px;
	}

	.emmms-card-desc {
		min-height: 0;
	}
}
</style>
