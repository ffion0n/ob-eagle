const { Plugin, PluginSettingTab, Setting, Platform } = require('obsidian');

const DEFAULT_SETTINGS = {
  urlPrefix: 'http://localhost:6060/images/',
  targetPrefix: 'http://127.0.0.1:6060/images/',
  enableOnDesktop: false
};

function normalizePrefix(input) {
  if (!input) return '';
  let p = String(input).trim();
  if (!p) return '';
  if (!p.endsWith('/')) p += '/';
  return p;
}

module.exports = class EagleBridgeMobile extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new EagleBridgeMobileSettingTab(this.app, this));

    this.registerMarkdownPostProcessor((el) => {
      if (!Platform.isMobile && !this.settings.enableOnDesktop) return;

      const prefix = normalizePrefix(this.settings.urlPrefix);
      const targetPrefix = normalizePrefix(this.settings.targetPrefix);
      if (!prefix || !targetPrefix) return;

      const imgs = el.querySelectorAll('img');
      if (!imgs.length) return;

      imgs.forEach((img) => {
        const src = img.getAttribute('src');
        if (!src || !src.startsWith(prefix)) return;
        if (src.startsWith(targetPrefix)) return;
        const newSrc = targetPrefix + src.slice(prefix.length);
        img.setAttribute('src', newSrc);
      });
    });
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
};

class EagleBridgeMobileSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Eagle Bridge Mobile Mapper' });

    new Setting(containerEl)
      .setName('URL prefix')
      .setDesc('Match Eagle Bridge image URLs')
      .addText((text) =>
        text
          .setPlaceholder('http://localhost:6060/images/')
          .setValue(this.plugin.settings.urlPrefix)
          .onChange(async (value) => {
            this.plugin.settings.urlPrefix = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Target prefix')
      .setDesc('Rewrite to IPv4 localhost for mobile')
      .addText((text) =>
        text
          .setPlaceholder('http://127.0.0.1:6060/images/')
          .setValue(this.plugin.settings.targetPrefix)
          .onChange(async (value) => {
            this.plugin.settings.targetPrefix = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Enable on desktop')
      .setDesc('Allow rewrite in desktop app (for testing)')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableOnDesktop)
          .onChange(async (value) => {
            this.plugin.settings.enableOnDesktop = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
