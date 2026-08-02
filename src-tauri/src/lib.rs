// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
async fn pick_file(app: tauri::AppHandle) -> Option<String> {
    let (tx, mut rx) = tauri::async_runtime::channel(1);
    app.dialog().file()
        .set_title("Open SQLite database")
        .add_filter("SQLite", &["db", "sqlite"])
        .pick_file(move |file_path| {
            let _ = tx.send(file_path);
        });
    let path = rx.recv().await.flatten()?;
    let path = path.into_path().ok()?;
    Some(path.to_string_lossy().into_owned())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, pick_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
