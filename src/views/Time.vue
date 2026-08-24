<template>
	<div class="ez-home" :class="{ 'ez-home--config': configOpen }">
		<!-- 沉浸式主舞台：全屏时钟 -->
		<main class="ez-home-stage">
			<div class="ez-home-clock-area">
				<transition name="ez-home-fade" mode="out-in">
					<div v-if="settings.clockType === 'digital'" key="digital" class="ez-home-clock-item">
						<!-- 网络校时说明：syncUrl 每次同步后更换随机参数，确保 HEAD 请求不被浏览器/CDN 缓存命中，
							避免拿到过期的 Date 响应头导致初始化时间跳变；timeSource 为 local 时完全使用本机时间 -->
						<fx67ll-digital-clock :key="digitalClockKey" :theme="settings.digital.theme"
							:timeZone="settings.digital.timeZone" :hour12="settings.digital.hour12"
							:showDigital="settings.digital.showDigital" :smoothSeconds="settings.digital.smoothSeconds"
							:showDate="settings.digital.showDate" :showAnalog="settings.digital.showAnalog"
							:zoomSize="settings.digital.zoom" :syncEnabled="isServerSyncEnabled"
							:syncUrl="digitalSyncUrl" @time-sync="handleTimeSync"></fx67ll-digital-clock>
					</div>
					<div v-else-if="settings.clockType === 'binary'" key="binary" class="ez-home-clock-item">
						<!-- ref 用于注入校时偏差：二进制时钟组件内部读取本机时间，此处覆写其取时方法以应用共享偏差 -->
						<fx67ll-binary-clock ref="binaryClock" :isShowTime="settings.binary.isShowTime"
							:showLabel="settings.binary.showLabel" :zoomSize="settings.binary.zoom"
							:dotSize="settings.binary.dotSize" :textSize="settings.binary.textSize"
							:textSpacing="settings.binary.textSpacing">
						</fx67ll-binary-clock>
					</div>
					<div v-else key="flip" class="ez-home-clock-item">
						<ez-flip-clock :mode="settings.flip.mode" :targetDate="settings.flip.targetDate"
							:showSeconds="settings.flip.showSeconds" :showLabels="settings.flip.showLabels"
							:offsetMs="sharedOffsetMs" :zoomSize="settings.flip.zoom"></ez-flip-clock>
					</div>
				</transition>
			</div>
		</main>

		<!-- 快捷键提示：左下角小字，仅沉浸模式下显示；同时是隐藏入口，悬浮点亮、点击直达设置面板 -->
		<button type="button" class="ez-home-hint" v-if="!configOpen" title="点击打开设置面板" aria-label="打开设置面板（快捷键 Ctrl+E+Z）"
			@click="openConfigPanel">Ctrl+E+Z 设置</button>

		<!-- 合规页脚 -->
		<fx67ll-footer fontColor="#9aa7b3"></fx67ll-footer>

		<!-- 悬浮设置面板：快捷键唤起，不挤占页面布局 -->
		<transition name="ez-home-pop">
			<section v-if="configOpen" class="ez-home-panel" aria-label="界面设置">
				<div class="ez-home-panel-head">
					<span class="ez-home-panel-title">界面设置</span>
					<button class="ez-home-panel-reset" type="button" @click="resetLocalSettings">恢复默认</button>
					<button class="ez-home-panel-close" type="button" aria-label="关闭设置"
						@click="configOpen = false">&times;</button>
				</div>

				<!-- 时钟类型 -->
				<div class="ez-home-settings-row">
					<span class="ez-home-settings-label">时钟类型</span>
					<div class="ez-home-segment">
						<button type="button" :class="{ active: settings.clockType === 'digital' }"
							@click="settings.clockType = 'digital'">数字</button>
						<button type="button" :class="{ active: settings.clockType === 'binary' }"
							@click="settings.clockType = 'binary'">二进制</button>
						<button type="button" :class="{ active: settings.clockType === 'flip' }"
							@click="settings.clockType = 'flip'">翻页</button>
					</div>
				</div>

				<!-- 数字时钟配置 -->
				<template v-if="settings.clockType === 'digital'">
					<div class="ez-home-settings-row ez-home-settings-row--stacked">
						<span class="ez-home-settings-label">时钟主题</span>
						<div class="ez-home-theme-list">
							<div v-for="(row, rowIndex) in digitalThemeRows" :key="rowIndex" class="ez-home-theme-row">
								<button v-for="item in row" :key="item.value" type="button" class="ez-home-theme-swatch"
									:class="{ active: settings.digital.theme === item.value }" :title="item.label"
									:aria-label="item.label" :aria-pressed="settings.digital.theme === item.value"
									@click="settings.digital.theme = item.value">
									<span class="ez-home-theme-dot" :style="{ background: item.color }"></span>
									<span class="ez-home-theme-name">{{ item.label }}</span>
								</button>
							</div>
						</div>
					</div>
					<div class="ez-home-settings-row">
						<label class="ez-home-settings-label" for="ez-digital-time-zone">显示时区</label>
						<select id="ez-digital-time-zone" class="ez-home-select" v-model="settings.digital.timeZone">
							<option v-for="item in timeZoneList" :key="item.value" :value="item.value">
								{{ item.label }}
							</option>
						</select>
					</div>
					<div class="ez-home-settings-row">
						<span class="ez-home-settings-label">12 小时制</span>
						<button class="ez-home-switch" type="button" role="switch"
							:aria-checked="settings.digital.hour12 ? 'true' : 'false'"
							@click="settings.digital.hour12 = !settings.digital.hour12">
							<span class="ez-home-switch-slider"></span>
						</button>
					</div>
					<div class="ez-home-settings-row">
						<span class="ez-home-settings-label">显示数字时间</span>
						<button class="ez-home-switch" type="button" role="switch"
							:aria-checked="settings.digital.showDigital ? 'true' : 'false'"
							@click="settings.digital.showDigital = !settings.digital.showDigital">
							<span class="ez-home-switch-slider"></span>
						</button>
					</div>
					<div class="ez-home-settings-row">
						<span class="ez-home-settings-label">秒针平滑扫动</span>
						<button class="ez-home-switch" type="button" role="switch"
							:aria-checked="settings.digital.smoothSeconds ? 'true' : 'false'"
							@click="settings.digital.smoothSeconds = !settings.digital.smoothSeconds">
							<span class="ez-home-switch-slider"></span>
						</button>
					</div>
					<div class="ez-home-settings-row">
						<span class="ez-home-settings-label">显示日期星期</span>
						<button class="ez-home-switch" type="button" role="switch"
							:aria-checked="settings.digital.showDate ? 'true' : 'false'"
							@click="settings.digital.showDate = !settings.digital.showDate">
							<span class="ez-home-switch-slider"></span>
						</button>
					</div>
					<div class="ez-home-settings-row">
						<span class="ez-home-settings-label">显示模拟钟盘</span>
						<button class="ez-home-switch" type="button" role="switch"
							:aria-checked="settings.digital.showAnalog ? 'true' : 'false'"
							@click="settings.digital.showAnalog = !settings.digital.showAnalog">
							<span class="ez-home-switch-slider"></span>
						</button>
					</div>
				</template>

				<!-- 二进制时钟配置 -->
				<template v-if="settings.clockType === 'binary'">
					<div class="ez-home-settings-row">
						<span class="ez-home-settings-label">显示十进制时间</span>
						<button class="ez-home-switch" type="button" role="switch"
							:aria-checked="settings.binary.isShowTime ? 'true' : 'false'"
							@click="settings.binary.isShowTime = !settings.binary.isShowTime">
							<span class="ez-home-switch-slider"></span>
						</button>
					</div>
					<div class="ez-home-settings-row">
						<span class="ez-home-settings-label">显示单位标签</span>
						<button class="ez-home-switch" type="button" role="switch"
							:aria-checked="settings.binary.showLabel ? 'true' : 'false'"
							@click="settings.binary.showLabel = !settings.binary.showLabel">
							<span class="ez-home-switch-slider"></span>
						</button>
					</div>
					<div class="ez-home-settings-row">
						<label class="ez-home-settings-label" for="ez-binary-dot-size">圆点尺寸</label>
						<div class="ez-home-range-control">
							<input id="ez-binary-dot-size" class="ez-home-range" type="range" min="14" max="36" step="1"
								v-model.number="settings.binary.dotSize" />
							<span class="ez-home-range-value">{{ settings.binary.dotSize }} px</span>
						</div>
					</div>
					<div class="ez-home-settings-row">
						<label class="ez-home-settings-label" for="ez-binary-text-size">标题字号</label>
						<div class="ez-home-range-control">
							<input id="ez-binary-text-size" class="ez-home-range" type="range" min="0" max="60" step="1"
								v-model.number="settings.binary.textSize" />
							<span class="ez-home-range-value">{{ settings.binary.textSize === 0 ? '自动' :
								settings.binary.textSize + ' px' }}</span>
						</div>
					</div>
					<div class="ez-home-settings-row">
						<label class="ez-home-settings-label" for="ez-binary-text-spacing">标题间距</label>
						<div class="ez-home-range-control">
							<input id="ez-binary-text-spacing" class="ez-home-range" type="range" min="0" max="100"
								step="1" v-model.number="settings.binary.textSpacing" />
							<span class="ez-home-range-value">{{ settings.binary.textSpacing }} px</span>
						</div>
					</div>
				</template>

				<!-- 翻页时钟配置 -->
				<template v-if="settings.clockType === 'flip'">
					<div class="ez-home-settings-row">
						<span class="ez-home-settings-label">显示模式</span>
						<div class="ez-home-segment">
							<button type="button" :class="{ active: settings.flip.mode === 'clock' }"
								@click="settings.flip.mode = 'clock'">时钟</button>
							<button type="button" :class="{ active: settings.flip.mode === 'countdown' }"
								@click="settings.flip.mode = 'countdown'">倒计时</button>
						</div>
					</div>
					<div v-if="settings.flip.mode === 'countdown'" class="ez-home-settings-row">
						<span class="ez-home-settings-label">目标时间</span>
						<input class="ez-home-datetime" type="datetime-local" v-model="settings.flip.targetDate" />
					</div>
					<div class="ez-home-settings-row">
						<span class="ez-home-settings-label">显示秒</span>
						<button class="ez-home-switch" type="button" role="switch"
							:aria-checked="settings.flip.showSeconds ? 'true' : 'false'"
							@click="settings.flip.showSeconds = !settings.flip.showSeconds">
							<span class="ez-home-switch-slider"></span>
						</button>
					</div>
					<div class="ez-home-settings-row">
						<span class="ez-home-settings-label">显示单位标签</span>
						<button class="ez-home-switch" type="button" role="switch"
							:aria-checked="settings.flip.showLabels ? 'true' : 'false'"
							@click="settings.flip.showLabels = !settings.flip.showLabels">
							<span class="ez-home-switch-slider"></span>
						</button>
					</div>
				</template>

				<!-- 时间同步（各时钟通用）：本机时间 / 网络时间 二选一，实时展示最近一次校时结果 -->
				<div class="ez-home-settings-row ez-home-settings-row--stacked">
					<span class="ez-home-settings-label">时间同步</span>
					<div class="ez-home-sync-group">
						<button type="button" class="ez-home-sync-btn"
							:class="{ active: settings.timeSource === 'local' }"
							:aria-pressed="settings.timeSource === 'local' ? 'true' : 'false'"
							@click="useLocalTime">同步本地时间</button>
						<button type="button" class="ez-home-sync-btn"
							:class="{ active: settings.timeSource === 'auto' }"
							:aria-pressed="settings.timeSource === 'auto' ? 'true' : 'false'"
							@click="syncServerTime">同步网络时间</button>
					</div>
					<p class="ez-home-sync-status" :class="{ 'ez-home-sync-status--pending': timeSyncPending }">
						{{ timeSyncStatus }}
					</p>
				</div>

				<!-- 缩放尺寸（各时钟通用） -->
				<div class="ez-home-settings-row">
					<label class="ez-home-settings-label" for="ez-clock-zoom">缩放尺寸</label>
					<div class="ez-home-range-control">
						<input id="ez-clock-zoom" class="ez-home-range" type="range" min="0.6" max="2.4" step="0.05"
							v-model.number="currentZoom" />
						<span class="ez-home-range-value">{{ currentZoom.toFixed(2) }}</span>
					</div>
				</div>

				<p class="ez-home-settings-tip">设置自动保存并永久生效 · Ctrl+E+Z 或 Esc 返回</p>
			</section>
		</transition>
	</div>
</template>

<script>
import ezFlipClock from '@/components/FlipClock.vue';
import { loadSettings, saveSettings, resetSettings } from '@/utils/localConfig.js';

export default {
	name: 'ezHome',
	components: {
		ezFlipClock
	},
	data() {
		return {
			// 配置模式开关：仅会话内状态，由 Ctrl+E+Z 唤起/关闭，页面始终以沉浸模式初始化
			configOpen: false,
			// 当前按住的按键集合，用于检测 Ctrl+E+Z 组合键
			heldKeys: [],
			// 网络校时地址随机参数：每次同步完成后更换，保证下一次请求绕开缓存拿到实时的 Date 响应头
			syncNonce: Date.now(),
			// 共享校时引擎的地址随机参数：与数字时钟组件内部同步互不干扰，每次发起前更换
			engineNonce: Date.now(),
			// 网络校时偏差（毫秒）：翻页 / 二进制时钟的显示基准，auto 模式下由校时引擎维护，local 模式恒为 0
			sharedOffsetMs: 0,
			// 校时引擎周期定时器与页面可见性监听（各时钟通用，不依赖数字时钟是否挂载）
			engineTimer: null,
			// 手动切换时间来源时递增，配合 key 强制数字时钟重建，使新的同步配置立即生效
			clockRemount: 0,
			// 时间同步状态文案与进行中标记，展示在设置面板「时间同步」一行
			timeSyncStatus: '网络时间自动校准中…',
			timeSyncPending: true,
			// 同步结果等待定时器：超时未收到 time-sync 事件则提示失败（组件库对失败静默处理，不抛出事件）
			timeSyncTimer: null,
			// 界面本地配置：默认配置 + localStorage 覆盖
			settings: loadSettings(),
			// 数字时钟主题选项
			digitalThemeList: [
				{ value: 'fx67ll', label: 'fx67ll', color: '#2ecc71' },
				{ value: 'aurora', label: '极光青', color: '#2dd4bf' },
				{ value: 'ocean', label: '深海蓝', color: '#22d3ee' },
				{ value: 'forest', label: '森林绿', color: '#4ade80' },
				{ value: 'sunset', label: '日落橙', color: '#fb923c' },
				{ value: 'violet', label: '星云紫', color: '#a78bfa' },
				{ value: 'graphite', label: '石墨灰', color: '#64748b' }
			],
			// 常用 IANA 时区；保持选项精简，避免设置面板变成地区目录
			timeZoneList: [
				{ value: 'Asia/Shanghai', label: '北京时间' },
				{ value: 'Asia/Tokyo', label: '东京时间' },
				{ value: 'Europe/London', label: '伦敦时间' },
				{ value: 'America/New_York', label: '纽约时间' },
				{ value: 'UTC', label: 'UTC' }
			]
		};
	},
	computed: {
		digitalThemeRows() {
			return [this.digitalThemeList.slice(0, 4), this.digitalThemeList.slice(4)];
		},
		// 是否启用数字时钟的网络时间同步：timeSource 为 local 时完全使用本机时间
		isServerSyncEnabled() {
			return this.settings.timeSource !== 'local';
		},
		// 网络校时请求地址：以当前站点为源，附加随机查询参数保证每次请求都是全新地址，
		// 避免生产环境（响应头无 Cache-Control，走启发式缓存）命中缓存后拿到过期的 Date 头
		digitalSyncUrl() {
			return window.location.origin + window.location.pathname + '?__clockSync=' + this.syncNonce;
		},
		// 数字时钟重建 key：仅在手动切换时间来源时变化，平时保持稳定避免周期性重挂载
		digitalClockKey() {
			return this.settings.timeSource + '-' + this.clockRemount;
		},
		// 当前时钟的缩放值：读写统一代理到对应时钟的 zoom 配置
		currentZoom: {
			get() {
				return this.settings[this.settings.clockType].zoom;
			},
			set(val) {
				this.settings[this.settings.clockType].zoom = val;
			}
		}
	},
	watch: {
		// 任意配置修改后立即持久化到本地
		settings: {
			handler(val) {
				saveSettings(val);
			},
			deep: true
		},
		// 切换到二进制时钟后重新注入校时偏差（新组件实例的方法是原始版本）
		'settings.clockType'() {
			var self = this;
			this.$nextTick(function () {
				self.applyBinaryClockTimeSource();
			});
		}
	},
	mounted() {
		window.addEventListener('keydown', this.handleKeydown);
		window.addEventListener('keyup', this.handleKeyup);
		window.addEventListener('blur', this.clearHeldKeys);
		// 按当前时间来源初始化：auto 启动共享校时引擎（前台同步一次 + 周期 + 可见性恢复），local 仅刷新文案
		if (this.isServerSyncEnabled) {
			this.startEngine(true);
		} else {
			this.timeSyncPending = false;
			this.timeSyncStatus = '已使用本机时间，时钟与本机电脑保持一致';
		}
		// 首屏即为二进制时钟时同样需要注入校时偏差
		var self = this;
		this.$nextTick(function () {
			self.applyBinaryClockTimeSource();
		});
	},
	beforeDestroy() {
		window.removeEventListener('keydown', this.handleKeydown);
		window.removeEventListener('keyup', this.handleKeyup);
		window.removeEventListener('blur', this.clearHeldKeys);
		this.clearTimeSyncTimer();
		this.stopEngine();
	},
	methods: {
		// 组合键检测：Ctrl（或 Mac 的 Cmd）+ E + Z 三键同时按住时切换配置模式
		handleKeydown(e) {
			var target = e.target;
			var tag = target && target.tagName ? target.tagName.toLowerCase() : '';
			// 输入控件内不响应快捷键
			if (tag === 'input' || tag === 'textarea' || (target && target.isContentEditable)) {
				return;
			}
			var key = e.key ? e.key.toLowerCase() : '';
			if (!key) {
				return;
			}
			if (this.heldKeys.indexOf(key) === -1) {
				this.heldKeys.push(key);
			}
			// 阻止浏览器默认行为（如 Ctrl+E 聚焦地址栏），保证组合键能被页面捕获
			if ((e.ctrlKey || e.metaKey) && (key === 'e' || key === 'z')) {
				e.preventDefault();
			}
			var held = this.heldKeys;
			var hasCtrl = held.indexOf('control') !== -1 || held.indexOf('meta') !== -1;
			if (hasCtrl && held.indexOf('e') !== -1 && held.indexOf('z') !== -1) {
				this.clearHeldKeys();
				this.configOpen = !this.configOpen;
				return;
			}
			if (e.key === 'Escape' && this.configOpen) {
				this.configOpen = false;
			}
		},
		handleKeyup(e) {
			var key = e.key ? e.key.toLowerCase() : '';
			var index = this.heldKeys.indexOf(key);
			if (index !== -1) {
				this.heldKeys.splice(index, 1);
			}
		},
		clearHeldKeys() {
			this.heldKeys = [];
		},
		// 左下角快捷键提示的隐藏入口：点击直达设置面板
		openConfigPanel() {
			this.configOpen = true;
		},
		// 切换为本机时间：停止校时引擎并重建数字时钟，三种时钟立即回到本机电脑时间
		useLocalTime() {
			if (this.settings.timeSource !== 'local') {
				this.settings.timeSource = 'local';
				this.clockRemount += 1;
			}
			this.stopEngine();
			this.clearTimeSyncTimer();
			this.timeSyncPending = false;
			this.timeSyncStatus = '已使用本机时间，时钟与本机电脑保持一致';
		},
		// 立即同步网络时间：共享引擎以前台方式发起一次全新校时，来源变化时同时重建数字时钟
		syncServerTime() {
			if (this.settings.timeSource !== 'auto') {
				this.settings.timeSource = 'auto';
				this.syncNonce = Date.now();
				this.clockRemount += 1;
			}
			this.startEngine(true);
		},
		// 数字时钟组件内部同步完成回调：仅更换其下次请求地址（状态展示以共享校时引擎为准）
		handleTimeSync() {
			this.syncNonce = Date.now();
		},
		// 启动共享校时引擎：周期同步 + 页面恢复可见时补一次；foreground 为 true 时立即以前台方式同步一次
		startEngine(foreground) {
			var self = this;
			if (!this.engineTimer) {
				this.engineTimer = setInterval(function () {
					self.runServerSync(false);
				}, 300000);
				document.addEventListener('visibilitychange', this.handleVisibilitySync);
			}
			if (foreground) {
				this.runServerSync(true);
			}
		},
		// 停止共享校时引擎：清理定时器与监听，偏差归零（翻页 / 二进制时钟随之回到本机时间）
		stopEngine() {
			if (this.engineTimer) {
				clearInterval(this.engineTimer);
				this.engineTimer = null;
			}
			document.removeEventListener('visibilitychange', this.handleVisibilitySync);
			this.sharedOffsetMs = 0;
		},
		// 页面重新可见时静默补一次校时，修复标签页休眠期间累积的偏差
		handleVisibilitySync() {
			if (document.visibilityState === 'visible' && this.settings.timeSource !== 'local') {
				this.runServerSync(false);
			}
		},
		// 共享校时引擎：通过 HTTP Date 响应头估算服务器时间（含半程往返耗时补偿），
		// 每次请求前更换随机查询参数保证全新地址不被缓存命中；偏差 1 秒以内视为噪音不校正；
		// 偏差写入 sharedOffsetMs 供翻页 / 二进制时钟作为显示基准，前台同步同时驱动状态文案
		runServerSync(foreground) {
			var self = this;
			if (this.settings.timeSource === 'local' || typeof window === 'undefined' || typeof XMLHttpRequest === 'undefined') {
				return;
			}
			this.engineNonce = Date.now();
			var url = window.location.origin + window.location.pathname + '?__clockEngine=' + this.engineNonce;
			if (foreground) {
				this.timeSyncPending = true;
				this.timeSyncStatus = '正在同步网络时间…';
				this.armTimeSyncTimer();
			}
			try {
				var xhr = new XMLHttpRequest();
				var start = Date.now();
				xhr.open('HEAD', url, true);
				xhr.timeout = 5000;
				xhr.onload = function () {
					var offset = null;
					try {
						var serverDate = xhr.getResponseHeader('Date');
						if (serverDate && !isNaN(Date.parse(serverDate))) {
							// 服务器时间 + 半程往返耗时 ≈ 当前服务器时间
							var measured = Date.parse(serverDate) + (Date.now() - start) / 2 - Date.now();
							// 本机时间优先：1 秒以内的偏差视为噪音，不校正
							offset = Math.abs(measured) >= 1000 ? measured : 0;
						}
					} catch (e) {
						// 解析失败按同步失败处理，保持当前时间
					}
					self.finishServerSync(foreground, offset);
				};
				xhr.onerror = function () {
					self.finishServerSync(foreground, null);
				};
				xhr.ontimeout = function () {
					self.finishServerSync(foreground, null);
				};
				xhr.send();
			} catch (e) {
				self.finishServerSync(foreground, null);
			}
		},
		// 校时结果落地：写入共享偏差并刷新状态文案；offset 为 null 表示失败，前台同步时提示失败
		finishServerSync(foreground, offset) {
			// 竞态保护：等待期间已切回本机时间时，迟到的同步结果直接丢弃
			if (this.settings.timeSource === 'local') {
				return;
			}
			if (offset === null || typeof offset !== 'number' || isNaN(offset)) {
				if (foreground) {
					this.clearTimeSyncTimer();
					this.timeSyncPending = false;
					this.timeSyncStatus = '网络时间同步失败，时钟保持当前时间，可稍后重试';
				}
				return;
			}
			this.sharedOffsetMs = offset;
			if (foreground) {
				this.clearTimeSyncTimer();
				this.timeSyncPending = false;
			}
			if (offset !== 0) {
				this.timeSyncStatus = '已按网络时间校正 ' + this.formatSyncOffset(offset);
			} else {
				this.timeSyncStatus = '网络时间与本地时间一致，无需校正';
			}
		},
		// 为二进制时钟注入校时偏差：组件内部固定读取本机时间且无时间入参，
		// 此处覆写实例取时方法改为「本机时间 + 共享偏差」，每秒读取实时偏差，无需重复注入
		applyBinaryClockTimeSource() {
			var child = this.$refs.binaryClock;
			if (!child || typeof child.getNowTime !== 'function') {
				return;
			}
			var self = this;
			child.getNowTime = function () {
				var d = new Date(Date.now() + self.sharedOffsetMs);
				var pad = function (num) {
					return num < 10 ? '0' + num : '' + num;
				};
				var toBinaryArray = function (num) {
					var bin = '';
					var arr = [];
					while (num > 0) {
						bin = (num % 2) + bin;
						num = Math.floor(num / 2);
					}
					arr = bin.split('');
					while (arr.length < 6) {
						arr.unshift('0');
					}
					return arr;
				};
				child.timeNow = pad(d.getHours()) + ' : ' + pad(d.getMinutes()) + ' : ' + pad(d.getSeconds());
				child.hoursTimeArr = toBinaryArray(d.getHours());
				child.minutesTimeArr = toBinaryArray(d.getMinutes());
				child.secondsTimeArr = toBinaryArray(d.getSeconds());
			};
		},
		// 布防同步超时提示：前台同步超时未收到结果时按失败提示（请求超时上限 5 秒）
		armTimeSyncTimer() {
			var self = this;
			this.clearTimeSyncTimer();
			this.timeSyncTimer = setTimeout(function () {
				if (self.timeSyncPending) {
					self.timeSyncPending = false;
					self.timeSyncStatus = '网络时间同步失败，时钟保持当前时间，可稍后重试';
				}
			}, 6000);
		},
		clearTimeSyncTimer() {
			if (this.timeSyncTimer) {
				clearTimeout(this.timeSyncTimer);
				this.timeSyncTimer = null;
			}
		},
		// 将同步偏差毫秒数格式化为易读的时长与方向文案
		formatSyncOffset(offsetMs) {
			var seconds = Math.max(1, Math.round(Math.abs(offsetMs) / 1000));
			var duration;
			if (seconds < 60) {
				duration = seconds + ' 秒';
			} else if (seconds < 3600) {
				duration = Math.floor(seconds / 60) + ' 分 ' + (seconds % 60) + ' 秒';
			} else {
				duration = Math.floor(seconds / 3600) + ' 小时 ' + (Math.floor(seconds / 60) % 60) + ' 分';
			}
			return duration + '（' + (offsetMs > 0 ? '本机时间较服务器偏慢' : '本机时间较服务器偏快') + '）';
		},
		// 恢复默认配置：清除 localStorage 后重置为内置默认值
		resetLocalSettings() {
			this.settings = resetSettings();
			// 默认时间来源为 auto：恢复默认后重新自动校时，同步状态文案同步复位
			if (this.isServerSyncEnabled) {
				this.startEngine(true);
			}
		}
	}
};
</script>

<style lang="less" scoped>
.ez-home {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	// 固定为视口高度：无论时钟缩放到多大都保持居中，超出部分两侧均匀裁剪
	height: 100vh;
	box-sizing: border-box;
	padding: 24px 20px 40px;
	overflow: hidden;
	// 极简清新浅色背景
	background: linear-gradient(160deg, #f7fafc 0%, #eef4f8 55%, #e8f1ee 100%);
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;

	// 配置模式下轻微软化背景，突出悬浮面板
	&.ez-home--config .ez-home-stage {
		filter: blur(2px);
		transition: filter 0.25s ease;
	}
}

.ez-home-stage {
	position: relative;
	z-index: 1;
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	min-height: 0;
	transition: filter 0.25s ease;
}

.ez-home-clock-area {
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	width: 100%;
	min-height: 0;
	overflow: hidden;

	.ez-home-clock-item {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}
}

// 快捷键提示：左下角广告式小字，低调不抢视线；同时是隐藏入口，悬浮时点亮提示可点击
.ez-home-hint {
	position: absolute;
	bottom: 10px;
	left: 12px;
	z-index: 100000;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	margin: 0;
	padding: 4px 6px;
	border: none;
	background: transparent;
	font-size: 10px;
	font-family: inherit;
	letter-spacing: 0.5px;
	color: #b8c4cf;
	user-select: none;
	cursor: pointer;
	border-radius: 999px;
	transition: color 0.25s ease, letter-spacing 0.25s ease, transform 0.25s ease,
		text-shadow 0.25s ease, background 0.25s ease;

	// 前置状态圆点：默认静态，悬浮时呼吸闪烁
	&::before {
		content: '';
		flex-shrink: 0;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: currentColor;
		opacity: 0.5;
		transition: background 0.25s ease;
	}

	// 底部渐变下划线：悬浮时从中间向两侧扫开
	&::after {
		content: '';
		position: absolute;
		right: 6px;
		bottom: 1px;
		left: 6px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #42b983, transparent);
		transform: scaleX(0);
		transition: transform 0.3s ease;
	}

	&:hover,
	&:focus-visible {
		color: #42b983;
		letter-spacing: 1.5px;
		transform: translateY(-1px);
		text-shadow: 0 0 8px rgba(66, 185, 131, 0.45);
		// 悬浮时浮出一层浅色胶囊底衬，明确可点击的隐藏入口
		background: rgba(66, 185, 131, 0.08);
		outline: none;

		&::before {
			background: #42b983;
			animation: ez-home-hint-pulse 1.2s ease-in-out infinite;
		}

		&::after {
			transform: scaleX(1);
		}
	}
}

// 提示圆点呼吸动画
@keyframes ez-home-hint-pulse {

	0%,
	100% {
		opacity: 0.35;
		transform: scale(0.8);
	}

	50% {
		opacity: 1;
		transform: scale(1.15);
	}
}

// 页脚组件在浅色首页中的定位与字号微调
/deep/ .fx67ll-footer {
	position: absolute;
	bottom: 0;
	font-size: 12px;
	padding: 8px 0;
}

// 悬浮设置面板
.ez-home-panel {
	position: fixed;
	top: 24px;
	right: 24px;
	z-index: 20;
	width: 300px;
	max-height: calc(100vh - 48px);
	box-sizing: border-box;
	padding: 18px 18px 14px;
	overflow-y: auto;
	border-radius: 16px;
	background: rgba(255, 255, 255, 0.92);
	backdrop-filter: blur(12px);
	box-shadow: 0 12px 40px rgba(44, 62, 80, 0.16);
}

.ez-home-panel-head {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 10px;

	.ez-home-panel-title {
		flex: 1;
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 1px;
		color: #3d4f5f;
	}

	.ez-home-panel-reset {
		padding: 4px 12px;
		border: 1px solid #e3eaf1;
		border-radius: 999px;
		background: transparent;
		font-size: 12px;
		color: #8494a4;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			border-color: #42b983;
			color: #42b983;
		}
	}

	.ez-home-panel-close {
		width: 24px;
		height: 24px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: transparent;
		font-size: 16px;
		line-height: 24px;
		color: #9aa7b3;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			background: #eef3f7;
			color: #3d4f5f;
		}
	}
}

.ez-home-settings-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 9px 0;

	.ez-home-settings-label {
		flex-shrink: 0;
		font-size: 13px;
		color: #5c6c7c;
	}

	&.ez-home-settings-row--stacked {
		align-items: flex-start;
		flex-direction: column;
		gap: 8px;
	}

	.ez-home-range-control {
		display: flex;
		align-items: center;
		gap: 10px;

		.ez-home-range {
			width: 120px;
			height: 4px;
			appearance: none;
			border-radius: 999px;
			background: #e3eaf1;
			outline: none;
			cursor: pointer;

			// 滑块样式（Chrome / Safari）
			&::-webkit-slider-thumb {
				appearance: none;
				width: 14px;
				height: 14px;
				border: 2px solid #ffffff;
				border-radius: 50%;
				background: #42b983;
				box-shadow: 0 1px 4px rgba(66, 185, 131, 0.4);
				cursor: pointer;
			}

			// 滑块样式（Firefox）
			&::-moz-range-thumb {
				width: 12px;
				height: 12px;
				border: 2px solid #ffffff;
				border-radius: 50%;
				background: #42b983;
				cursor: pointer;
			}
		}

		.ez-home-range-value {
			width: 46px;
			font-size: 12px;
			text-align: right;
			color: #8494a4;
			font-variant-numeric: tabular-nums;
		}
	}
}

.ez-home-segment {
	display: flex;
	padding: 3px;
	border-radius: 999px;
	background: #eef3f7;

	button {
		padding: 5px 14px;
		border: none;
		border-radius: 999px;
		background: transparent;
		font-size: 12px;
		color: #7b8b9a;
		cursor: pointer;
		transition: all 0.2s;

		&.active {
			background: #ffffff;
			color: #42b983;
			box-shadow: 0 1px 4px rgba(44, 62, 80, 0.12);
		}
	}
}

// 主题色点（紧凑风格，仅色点 + 悬停提示）
.ez-home-theme-list {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	width: 100%;

	.ez-home-theme-row {
		display: flex;
		justify-content: center;
		gap: 6px;
		width: 100%;
	}

	.ez-home-theme-swatch {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		width: 58px;
		height: 28px;
		padding: 0 5px;
		border: 1px solid transparent;
		border-radius: 999px;
		background: #f3f6f8;
		cursor: pointer;
		transition: all 0.2s;

		.ez-home-theme-dot {
			flex-shrink: 0;
			width: 10px;
			height: 10px;
			border-radius: 50%;
			box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
		}

		.ez-home-theme-name {
			overflow: hidden;
			font-size: 10px;
			line-height: 1;
			color: #687888;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		&.active {
			border-color: #42b983;
			background: #ffffff;
			box-shadow: 0 1px 4px rgba(44, 62, 80, 0.1);

			.ez-home-theme-name {
				color: #27875d;
			}
		}

		&:hover {
			transform: scale(1.1);
		}
	}
}

.ez-home-select {
	max-width: 150px;
	padding: 5px 28px 5px 10px;
	border: 1px solid #dce5ec;
	border-radius: 8px;
	background: #ffffff;
	font-size: 12px;
	color: #526373;
	outline: none;
	cursor: pointer;

	&:focus {
		border-color: #42b983;
		box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.12);
	}
}

// 时间同步按钮组：本机时间 / 网络时间 二选一，点击立即执行对应的同步动作
.ez-home-sync-group {
	display: flex;
	gap: 8px;
	width: 100%;

	.ez-home-sync-btn {
		flex: 1;
		padding: 6px 0;
		border: 1px solid #e3eaf1;
		border-radius: 8px;
		background: #ffffff;
		font-size: 12px;
		color: #5c6c7c;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			border-color: #42b983;
			color: #42b983;
		}

		&.active {
			border-color: #42b983;
			background: rgba(66, 185, 131, 0.08);
			color: #27875d;
		}
	}
}

// 时间同步状态文案：展示最近一次同步结果，进行中时轻微高亮
.ez-home-sync-status {
	margin: 2px 0 0;
	font-size: 11px;
	line-height: 1.5;
	color: #9aa7b3;
	transition: color 0.2s;

	&.ez-home-sync-status--pending {
		color: #42b983;
	}
}

.ez-home-switch {
	position: relative;
	width: 42px;
	height: 24px;
	padding: 0;
	border: none;
	border-radius: 999px;
	background: #dde6ee;
	cursor: pointer;
	transition: background 0.25s;

	.ez-home-switch-slider {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #ffffff;
		box-shadow: 0 1px 3px rgba(44, 62, 80, 0.25);
		transition: transform 0.25s;
	}

	&[aria-checked='true'] {
		background: #42b983;

		.ez-home-switch-slider {
			transform: translateX(18px);
		}
	}
}

.ez-home-datetime {
	padding: 5px 10px;
	border: 1px solid #e3eaf1;
	border-radius: 8px;
	background: #ffffff;
	font-size: 12px;
	color: #3d4f5f;
	outline: none;

	&:focus {
		border-color: #42b983;
	}
}

.ez-home-settings-tip {
	margin: 10px 0 0;
	font-size: 12px;
	color: #9aa7b3;
}

// 悬浮面板浮现动画
.ez-home-pop-enter-active,
.ez-home-pop-leave-active {
	transition: all 0.22s ease;
}

.ez-home-pop-enter,
.ez-home-pop-leave-to {
	opacity: 0;
	transform: translateY(-8px) scale(0.97);
}

// 时钟切换淡入淡出动画
.ez-home-fade-enter-active,
.ez-home-fade-leave-active {
	transition: opacity 0.2s ease;
}

.ez-home-fade-enter,
.ez-home-fade-leave-to {
	opacity: 0;
}

// 移动端适配
@media screen and (max-width: 768px) {
	.ez-home {
		padding: 16px 14px 88px;
	}

	.ez-home-panel {
		top: 12px;
		right: 12px;
		left: 12px;
		width: auto;
		max-height: calc(100vh - 24px);
	}

	.ez-home-settings-row {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}

	.ez-home-theme-list {
		align-items: flex-start;

		.ez-home-theme-row {
			justify-content: flex-start;
		}
	}

	.ez-home-range-control {
		width: 100%;

		.ez-home-range {
			flex: 1;
			width: auto;
		}
	}
}
</style>
