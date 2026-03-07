use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
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

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "Mostrar", true, None::<&str>)?;
            let widget = MenuItem::with_id(app, "widget", "Widget", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Salir", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &widget, &quit])?;

            // Cerrar widget cuando se cierra la ventana principal
            let app_handle = app.handle().clone();
            if let Some(main_win) = app.get_webview_window("main") {
                main_win.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close(); // ← evita que se cierre
                        if let Some(win) = app_handle.get_webview_window("main") {
                            let _ = win.hide();
                        }
                    }
                });
            }

            TrayIconBuilder::with_id("tray")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app: &AppHandle, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(win) = app.get_webview_window("main") {
                            // Ventana existe, solo mostrarla
                            let _ = win.unminimize();
                            let _ = win.show();
                            let _ = win.set_focus();
                        } else {
                            // Ventana fue cerrada, recrearla
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
                                Ok(true) => {
                                    let _ = win.hide();
                                }
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
                                Ok(true) => {
                                    let _ = win.hide();
                                    // Ocultar widget también
                                    if let Some(widget) = app.get_webview_window("widget") {
                                        let _ = widget.hide();
                                    }
                                }
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
        .invoke_handler(tauri::generate_handler![greet, send_notification])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run()
}
