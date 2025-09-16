import { create_app_config } from '🍎/helpers/create-app-config.ts';

const wallpapers = create_app_config({
	title: 'Wallpapers',
	resizable: true,

	height: 600,
	width: 800,

	dock_breaks_before: true,
});

const calculator = create_app_config({
	title: 'Calculator',

	expandable: true,
	resizable: false,

	height: 250 * 1.414,
	width: 250,
});

const calendar = create_app_config({
	title: 'Calendar',
	resizable: true,
});

const vscode = create_app_config({
	title: 'VSCode',
	resizable: true,

	height: 600,
	width: 800,
});

const finder = create_app_config({
	title: 'Finder',
	resizable: true,

	// dockBreaksBefore: true,
	should_open_window: false,
});

const safari = create_app_config({
	title: 'Safari',
	resizable: true,
});

const systemPreferences = create_app_config({
	title: 'System Preferences',
	resizable: true,
});

const purusTwitter = create_app_config({
	title: `Made by Demian`,
	resizable: true,

	dock_breaks_before: true,

	height: 600,
	width: 800,
});

const viewSource = create_app_config({
	title: `View Source`,
	resizable: true,

	should_open_window: false,
	external_action: () => window.open('', '_blank'),
});

const vercel = create_app_config({
	title: `Powered by Vercel`,
	resizable: true,

	should_open_window: false,
	external_action: () =>
		window.open('oregonhub.netlify.app', '_blank'),

	dock_breaks_before: true,
});

const appstore = create_app_config({
	title: 'App Store',
	resizable: true,
});
const heypuri = create_app_config({
	title: 'HeyPuri',
	resizable: true,
});
const test = create_app_config({
	title: 'Test',
	resizable: true,
});

export const apps_config = {
	finder,
	wallpapers,
	calculator,
	calendar,
	vscode,
	appstore,
	safari,
	heypuri,

	// 'system-preferences': systemPreferences,

	

	vercel,
};
