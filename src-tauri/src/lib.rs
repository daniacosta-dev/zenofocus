use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Listener, Manager,
};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn send_notification(title: String, body: String) {
    let dbus = std::env::var("DBUS_SESSION_BUS_ADDRESS").unwrap_or_default();
    let display = std::env::var("DISPLAY").unwrap_or_default();
    let xdg = std::env::var("XDG_RUNTIME_DIR").unwrap_or_default();

    std::process::Command::new("notify-send")
        .env("DBUS_SESSION_BUS_ADDRESS", dbus)
        .env("DISPLAY", display)
        .env("XDG_RUNTIME_DIR", xdg)
        .arg("--urgency=critical")
        .arg(&title)
        .arg(&body)
        .spawn()
        .ok();
}

#[tauri::command]
fn show_main_window(app: AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.unminimize();
        let _ = win.show();
        let _ = win.set_focus();

        std::process::Command::new("xdotool")
            .args(["search", "--name", "ZenoFocus", "windowactivate", "--sync"])
            .spawn()
            .ok();
    } else {
        let _ = tauri::WebviewWindowBuilder::new(
            &app,
            "main",
            tauri::WebviewUrl::App("index.html".into()),
        )
        .title("ZenoFocus")
        .inner_size(800.0, 600.0)
        .build();
    }
}

#[tauri::command]
fn toggle_widget(app: AppHandle) {
    if let Some(win) = app.get_webview_window("widget") {
        match win.is_visible() {
            Ok(true) => { let _ = win.hide(); }
            _ => {
                let _ = win.show();
                let _ = win.set_focus();
            }
        }
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "Abrir ZenoFocus", true, None::<&str>)?;
            let widget = MenuItem::with_id(app, "widget", "Widget flotante", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Cerrar ZenoFocus", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &widget, &quit])?;

            // Prevenir cierre real — solo ocultar
            let app_handle = app.handle().clone();
            if let Some(main_win) = app.get_webview_window("main") {
                main_win.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        if let Some(win) = app_handle.get_webview_window("main") {
                            let _ = win.hide();
                        }
                    }
                });
            }

            // Listener para reabrir ventana principal desde el widget
            let app_handle2 = app.handle().clone();
            app.listen("reopen-main", move |_| {
                if let Some(win) = app_handle2.get_webview_window("main") {
                    let _ = win.unminimize();
                    let _ = win.show();
                    let _ = win.set_focus();
                } else {
                    let _ = tauri::WebviewWindowBuilder::new(
                        &app_handle2,
                        "main",
                        tauri::WebviewUrl::App("index.html".into()),
                    )
                    .title("ZenoFocus")
                    .inner_size(800.0, 600.0)
                    .build();
                }
            });

            TrayIconBuilder::with_id("tray")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app: &AppHandle, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.unminimize();
                            let _ = win.show();
                            let _ = win.set_focus();
                        } else {
                            let _ = tauri::WebviewWindowBuilder::new(
                                app,
                                "main",
                                tauri::WebviewUrl::App("index.html".into()),
                            )
                            .title("ZenoFocus")
                            .inner_size(800.0, 600.0)
                            .build();
                        }
                    }
                    "widget" => {
                        if let Some(win) = app.get_webview_window("widget") {
                            match win.is_visible() {
                                Ok(true) => { let _ = win.hide(); }
                                _ => {
                                    let _ = win.show();
                                    let _ = win.set_focus();
                                }
                            }
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray: &tauri::tray::TrayIcon, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(win) = app.get_webview_window("main") {
                            match win.is_visible() {
                                Ok(true) => { let _ = win.hide(); }
                                _ => {
                                    let _ = win.show();
                                    let _ = win.set_focus();
                                }
                            }
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, send_notification, show_main_window, toggle_widget])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run()
}