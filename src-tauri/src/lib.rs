// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
async fn pick_file(app: tauri::AppHandle) -> Option<String> {
    let path = tauri::async_runtime::spawn_blocking(move || {
        app.dialog().file()
            .set_title("Open SQLite database")
            .add_filter("SQLite", &["db", "sqlite"])
            .blocking_pick_file()
    }).await.ok().flatten()?;
    let path = path.into_path().ok()?;
    Some(path.to_string_lossy().into_owned())
}

#[tauri::command]
async fn save_text(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, content).map_err(|e| e.to_string())
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
        .invoke_handler(tauri::generate_handler![greet, pick_file, save_text])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
