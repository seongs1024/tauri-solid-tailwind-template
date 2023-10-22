// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    api::http::{HttpRequestBuilder, ResponseType, ClientBuilder},
    Manager,
};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


#[tauri::command]
async fn get_by_cross_origin(url: &str) -> Result<Vec<u8>, String> {
    let client = ClientBuilder::new()
        .max_redirections(10)
        .build()
        .map_err(|e| format!("{} {}", e.to_string(), url))?;
    
    let request = HttpRequestBuilder::new("GET", url)
        .map_err(|e| format!("{} {}", e.to_string(), url))?
        .header("Cache-Control", "no-store")
        .map_err(|e| format!("{} {}", e.to_string(), url))?
        .response_type(ResponseType::Binary);

    Ok(client
        .send(request)
        .await
        .map_err(|e| format!("{} {}", e.to_string(), url))?
        .bytes()
        .await
        .map_err(|e| format!("{} {}", e.to_string(), url))?
        .data
    )
}

#[tauri::command]
async fn open_docs(handle: tauri::AppHandle, url: &str) -> Result<(), String> {
    let url = url
        .parse()
        .map_err(|_| format!("Url error {}", url))?;

    // if let Some(window) = handle.get_window("external") {
    //     let _ = window.set_focus();
    //     let _ = window.eval(&format!("window.location.replace('{}')", url));
    //     return Ok(())
    // }

    let main = handle
        .get_window("main")
        .ok_or("no main window")?;
    let scale_factor = main.scale_factor().unwrap();
    let main_phyiscal_pos = main.outer_position().unwrap();
    let main_pos = main_phyiscal_pos.to_logical::<i32>(scale_factor);
    let main_phyiscal_size = main.outer_size().unwrap();
    let main_size = main_phyiscal_size.to_logical::<i32>(scale_factor);

    let bar_width = 240.0;
    let margin_top = 70.0;
    let margin_bottom = 5.0;
    let margin_right = 5.0;
    let margin_left = 5.0;

    let string = format!("{url}");
    let len = string.len();
    let child = tauri::WindowBuilder::new(
            &handle,
            format!("external-{}", len), //"external",
            tauri::WindowUrl::External(url)
        )
        // .decorations(false)
        // .resizable(false)
        .position(
            main_pos.x as f64 + bar_width + margin_left,
            main_pos.y as f64 + margin_top,
        )
        .inner_size(
            main_size.width as f64 - bar_width - margin_left - margin_right,
            main_size.height as f64 - margin_top - margin_bottom,
        );

    #[cfg(target_os = "macos")]
    let child = {
        let parent = main
            .ns_window()
            .map_err(|e| format!("{}", e.to_string()))?;
        // let child = child.owner_window(parent);
        child.parent_window(parent)
    };
    #[cfg(windows)]
    let child = {
        let parent = main
            .hwnd()
            .map_err(|e| format!("{}", e.to_string()))?;
        // child.parent_window(parent)
        child.owner_window(parent)
    };

    child.build()
        .map_err(|e| format!("{}", e.to_string()))?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            get_by_cross_origin,
            open_docs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
