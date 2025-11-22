#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[cfg(any(
target_os = "linux",
target_os = "dragonfly",
target_os = "freebsd",
target_os = "netbsd",
target_os = "openbsd"
))]
use gtk::prelude::GtkWindowExt;

pub fn run() {
    tauri::Builder::default()
    .setup(|app| {
        #[cfg(any(
        target_os = "linux",
        target_os = "dragonfly",
        target_os = "freebsd",
        target_os = "netbsd",
        target_os = "openbsd"
        ))]
        {
            if let Some(window) = app.get_webview_window("main") {
                if let Ok(gtk_window) = window.gtk_window() {
                    gtk_window.set_titlebar(Option::<&gtk::Widget>::None);
                }
            }
        }

        Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running RepoHub");
}
