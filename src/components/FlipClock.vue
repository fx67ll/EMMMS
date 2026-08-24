<template>
	<div class="ez-flip-clock" :style="{ zoom: zoomSize }">
		<div ref="flipClock" class="ez-flip-clock-target"></div>
		<p v-if="mode === 'countdown' && !targetDate" class="ez-flip-clock-tip">请在设置中选择倒计时的目标时间</p>
	</div>
</template>

<script>
// 翻页时钟本地封装组件：基于 flipclock 原生库（npm 包 flipclock，参考 FODCF 项目用法）
// 支持时钟显示与倒计时两种模式，销毁时清理实例避免内存泄漏
import FlipClock from 'flipclock';
import 'flipclock/dist/flipclock.css';

export default {
	name: 'ezFlipClock',
	props: {
		// 显示模式：clock（翻页时钟）/ countdown（倒计时）
		mode: {
			type: String,
			required: false,
			default: 'clock',
			validator(val) {
				return val === 'clock' || val === 'countdown';
			}
		},
		// 倒计时目标时间，datetime-local 输入值格式，仅倒计时模式下生效
		targetDate: {
			type: String,
			required: false,
			default: ''
		},
		// 是否显示秒
		showSeconds: {
			type: Boolean,
			required: false,
			default: true
		},
		// 是否显示单位标签
		showLabels: {
			type: Boolean,
			required: false,
			default: true
		},
		// 网络校时偏差（毫秒）：时钟模式以「本机时间 + 偏差」为基准起跳，
		// flipclock 面板每秒按真实流逝时间推进，基准偏移会一直保持；倒计时按真实流逝时间倒数，偏差天然抵消，不参与
		offsetMs: {
			type: Number,
			required: false,
			default: 0
		},
		// 修改翻页时钟缩放尺寸，复杂修改请直接重写样式表
		zoomSize: {
			type: Number,
			required: false,
			default: 1
		}
	},
	data() {
		return {
			// flipclock 实例
			flipClockInstance: null
		};
	},
	watch: {
		// 配置变化时重建实例
		mode() {
			this.renderFlipClock();
		},
		targetDate() {
			this.renderFlipClock();
		},
		showSeconds() {
			this.renderFlipClock();
		},
		showLabels() {
			this.renderFlipClock();
		},
		// 校时偏差变化时以新基准重建，保证网络校正立即生效
		offsetMs() {
			this.renderFlipClock();
		}
	},
	mounted() {
		this.renderFlipClock();
	},
	beforeDestroy() {
		this.destroyFlipClock();
	},
	methods: {
		// 销毁 flipclock 实例
		destroyFlipClock() {
			if (this.flipClockInstance) {
				try {
					this.flipClockInstance.destroy();
				} catch (e) {
					// 实例异常时静默忽略，直接置空引用
				}
				this.flipClockInstance = null;
			}
		},
		// 渲染 flipclock 实例
		renderFlipClock() {
			this.destroyFlipClock();
			if (!this.$refs.flipClock) {
				return;
			}
			// 清空挂载点，避免 destroy 残留 DOM
			this.$refs.flipClock.innerHTML = '';

			var options = {
				showSeconds: this.showSeconds,
				showLabels: this.showLabels,
				language: {
					years: '年',
					months: '月',
					days: '日',
					hours: '時',
					minutes: '分',
					seconds: '秒'
				}
			};

			if (this.mode === 'countdown') {
				// 倒计时模式：未选择目标时间时不渲染实例
				if (!this.targetDate) {
					return;
				}
				options.face = 'DayCounter';
				options.countdown = true;
				this.flipClockInstance = new FlipClock(this.$refs.flipClock, new Date(this.targetDate), options);
				this.$emit('flip-countdown-start', this.targetDate);
			} else {
				// 时钟模式：以「当前时间 + 校时偏差」为基准翻页走时，之后按真实流逝时间推进
				options.face = 'TwentyFourHourClock';
				options.countdown = false;
				this.flipClockInstance = new FlipClock(this.$refs.flipClock, new Date(Date.now() + this.offsetMs), options);
			}
		}
	}
};
</script>

<style lang="less" scoped>
.ez-flip-clock {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	.ez-flip-clock-tip {
		margin: 12px 0 0;
		font-size: 14px;
		color: #9aa7b3;
		letter-spacing: 1px;
	}
}
</style>
